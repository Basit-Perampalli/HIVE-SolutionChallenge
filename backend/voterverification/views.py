from django.shortcuts import render, get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
import pandas as pd
import json
from .models import VoterDetail
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import FileSystemStorage
import os
import sys
import base64
from datetime import datetime

# Import the process_document function from verification app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from verification.extraction import process_document
import google.generativeai as genai


api_key = env.get("google_api_key", "AIzaSyC6JZFbF8lGvLBsIwhvCkqguer9fXSal9k")

os.environ["GOOGLE_API_KEY"] = api_key
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

# Create your views here.

@api_view(['POST'])
def create_voter_details(request):
    if request.data.get('file'):
        try:
            # Handle Excel file upload
            uploaded_file = request.FILES['file']
            fs = FileSystemStorage(location="media/uploaded_files/")
            filename = fs.save(uploaded_file.name, uploaded_file)
            file_path = fs.path(filename)
            
            # Read Excel file
            if file_path.endswith('.xlsx') or file_path.endswith('.xls'):
                df = pd.read_excel(file_path)
                voter_count = 0
                errors = []
                print(df)
                for _, row in df.iterrows():
                    print(row)
                    try:
                        # Parse date using datetime
                        dob_str = str(row['Date of Birth'])
                        try:
                            # Assuming dd-mm-yyyy format
                            dob_date = datetime.strptime(dob_str, "%d-%m-%Y")
                            formatted_dob = dob_date.strftime("%Y-%m-%d")
                            # Remove any time component if present
                            if " " in formatted_dob:
                                formatted_dob = formatted_dob.split(" ")[0]
                        except ValueError:
                            # Try other common formats if dd-mm-yyyy fails
                            try:
                                # Try dd/mm/yyyy
                                dob_date = datetime.strptime(dob_str, "%d/%m/%Y")
                                formatted_dob = dob_date.strftime("%Y-%m-%d")
                                # Remove any time component if present
                                if " " in formatted_dob:
                                    formatted_dob = formatted_dob.split(" ")[0]
                            except ValueError:
                                # If all parsing fails, use as is (might cause validation error)
                                formatted_dob = dob_str
                                # If it contains time component, remove it
                                if " " in formatted_dob:
                                    formatted_dob = formatted_dob.split(" ")[0]
                                
                        voter_data = {
                            'name': row['Name'],
                            'father_name': row["Father's Name"],
                            'voter_id': row['Voter Id'],
                            'gender': row['Gender'],
                            'dob': formatted_dob
                        }
                        
                        # Check if voter already exists
                        if not VoterDetail.objects.filter(voter_id=voter_data['voter_id']).exists():
                            VoterDetail.objects.create(**voter_data)
                            voter_count += 1
                        else:
                            errors.append(f"Voter with ID {voter_data['voter_id']} already exists")
                    except Exception as e:
                        errors.append(f"Error in row {_+2}: {str(e)}")
                
                # Clean up the file
                os.remove(file_path)
                
                return Response({
                    'message': f'Successfully created {voter_count} voter records',
                    'errors': errors
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'error': 'File format not supported. Please upload an Excel file (.xlsx or .xls)'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    else:
        # Handle JSON body
        try:
            # Check if voter already exists
            if VoterDetail.objects.filter(voter_id=request.data.get('voter_id')).exists():
                return Response({
                    'error': f"Voter with ID {request.data.get('voter_id')} already exists"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Parse date using datetime
            dob_str = str(request.data.get('dob'))
            try:
                # Assuming dd-mm-yyyy format
                dob_date = datetime.strptime(dob_str, "%d-%m-%Y")
                formatted_dob = dob_date.strftime("%Y-%m-%d")
                # Remove any time component if present
                if " " in formatted_dob:
                    formatted_dob = formatted_dob.split(" ")[0]
            except ValueError:
                # Try other common formats if dd-mm-yyyy fails
                try:
                    # Try dd/mm/yyyy
                    dob_date = datetime.strptime(dob_str, "%d/%m/%Y")
                    formatted_dob = dob_date.strftime("%Y-%m-%d")
                    # Remove any time component if present
                    if " " in formatted_dob:
                        formatted_dob = formatted_dob.split(" ")[0]
                except ValueError:
                    # If all parsing fails, use as is (might cause validation error)
                    formatted_dob = dob_str
                    # If it contains time component, remove it
                    if " " in formatted_dob:
                        formatted_dob = formatted_dob.split(" ")[0]
                
            voter = VoterDetail.objects.create(
                name=request.data.get('name'),
                father_name=request.data.get('father_name'),
                voter_id=request.data.get('voter_id'),
                gender=request.data.get('gender'),
                dob=formatted_dob
            )
            
            return Response({
                'id': voter.id,
                'name': voter.name,
                'father_name': voter.father_name,
                'voter_id': voter.voter_id,
                'gender': voter.gender,
                'dob': voter.dob,
                'voting_status': voter.voting_status
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
def update_voting_status(request, pk):
    try:
        voter = get_object_or_404(VoterDetail, pk=pk)
        
        # Toggle the voting status
        if voter.voting_status == 'pending':
            voter.voting_status = 'voted'
        else:
            voter.voting_status = 'pending'
            
        voter.save()
        
        return Response({
            'id': voter.id,
            'name': voter.name,
            'voter_id': voter.voter_id,
            'voting_status': voter.voting_status
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_voter(request, pk):
    try:
        voter = get_object_or_404(VoterDetail, pk=pk)
        voter_id = voter.voter_id
        voter.delete()
        
        return Response({
            'message': f'Voter with ID {voter_id} has been deleted'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_all_voters(request):
    voters = VoterDetail.objects.all()
    voter_list = []
    
    for voter in voters:
        print(voter)
        voter_list.append({
            'id': voter.id,
            'name': voter.name,
            'father_name': voter.father_name,
            'voter_id': voter.voter_id,
            'gender': voter.gender,
            'dob': str(voter.dob),
            'voting_status': voter.voting_status
        })
    
    return Response(voter_list, status=status.HTTP_200_OK)

@csrf_exempt
@api_view(['POST'])
def upload_verify_voter_id(request):
    if request.method == "POST" and request.FILES.get("image"):
        # Access the uploaded file
        uploaded_file = request.FILES["image"]

        # Save the file temporarily
        fs = FileSystemStorage(location="media/uploaded_files/")
        filename = fs.save(uploaded_file.name, uploaded_file)
        file_path = fs.path(filename)
        
        try:
            # Process the voter ID card to extract information
            result = process_document(file_path, "voterid")
            
            # Convert result to dict if it's a string
            if isinstance(result, str):
                extracted_data = json.loads(result)
            else:
                extracted_data = result
            
            # Try to find matching voter by voter ID
            voter = None
            match_type = None
            
            if 'voter_id' in extracted_data and extracted_data['voter_id']:
                try:
                    voter = VoterDetail.objects.get(voter_id=extracted_data['voter_id'])
                    match_type = "voter_id"
                except VoterDetail.DoesNotExist:
                    pass
            
            # If no match by voter ID, try to match by name
            if not voter and 'name' in extracted_data and extracted_data['name']:
                name_to_match = extracted_data['name'].lower()
                voter_matches = VoterDetail.objects.filter(name__icontains=name_to_match)
                
                if voter_matches.exists():
                    voter = voter_matches.first()
                    match_type = "name"
            
            # Clean up the uploaded file
            os.remove(file_path)
            
            if voter:
                # Return the matched voter details
                response_data = {
                    'verified': True,
                    'match_type': match_type,
                    'voter': {
                        'id': voter.id,
                        'name': voter.name,
                        'father_name': voter.father_name,
                        'voter_id': voter.voter_id,
                        'gender': voter.gender,
                        'dob': str(voter.dob),
                        'voting_status': voter.voting_status
                    },
                    'extracted_data': extracted_data
                }
            else:
                # No match found
                response_data = {
                    'verified': False,
                    'message': 'No matching voter found in the database',
                    'extracted_data': extracted_data
                }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Clean up in case of error
            if os.path.exists(file_path):
                os.remove(file_path)
                
            return Response({
                'error': f"Error processing voter ID card: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'error': "Invalid request. Please upload a voter ID card image."
    }, status=status.HTTP_400_BAD_REQUEST)
