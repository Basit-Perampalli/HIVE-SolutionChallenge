import os
import base64
import json
import time
from pydantic import BaseModel, Field
import google.generativeai as genai
from pdf2image import convert_from_path
from PIL import Image

# Configure Google Gemini API
os.environ["GOOGLE_API_KEY"] = "AIzaSyC6JZFbF8lGvLBsIwhvCkqguer9fXSal9k"
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

# Function to parse JSON from Gemini response
def extract_clean_data(response, prompt):
    try:
        response_content = response.text
        
        # Extract only the JSON part
        first_brace = response_content.find("{")
        last_brace = response_content.rfind("}")
        if first_brace == -1 or last_brace == -1:
            print("Not able to find braces in response", response_content)
            return {"error": "Failed to parse JSON from response"}

        json_string = response_content[first_brace : last_brace + 1]
        json_string = json_string.lower()

        try:
            return json.loads(json_string)
        except json.JSONDecodeError as e:
            print("JSON decode error:", e)
            return {"error": f"Failed to parse JSON: {str(e)}"}

    except Exception as e:
        return {"error": f"Failed to parse response: {str(e)}"}

def process_image(prompt, image_path):
    if prompt["query"] is None:
        raise Exception("Query not provided")
    try:
        # Initialize Gemini model
        model = genai.GenerativeModel("gemini-2.5-pro-preview-03-25")
        
        # Read image bytes
        with open(image_path, "rb") as image_file:
            image_bytes = image_file.read()
        
        # Generate content with image and prompt
        response = model.generate_content(
            [
                {"mime_type": "image/jpeg", "data": image_bytes},
                prompt["query"]
            ],
            generation_config={
                "response_mime_type": "application/json"
            }
        )
        
        # Extract and clean the data from the response
        return extract_clean_data(response, prompt)

    except Exception as e:
        return {"error": str(e)}

def main(transcript, schema):
    try:
        # Initialize Gemini model
        model = genai.GenerativeModel("gemini-2.5-pro-preview-03-25")
        
        # Generate content with text-only prompt
        response = model.generate_content(
            f"The following is an OCR output message transcript. Only answer in JSON format according to the given schema: {json.dumps(schema.model_json_schema())}. Transcript: {transcript}",
            generation_config={
                "response_mime_type": "application/json"
            }
        )
        
        response_content = response.text
        
        # Extract only the JSON part
        first_brace = response_content.find("{")
        last_brace = response_content.rfind("}")
        if first_brace == -1 or last_brace == -1:
            return {"error": "Failed to parse JSON from response"}
            
        json_string = response_content[first_brace : last_brace + 1]
        
        output = json.loads(json_string)
        print(json.dumps(output, indent=2))
        return output
        
    except Exception as e:
        return {"error": f"Failed to process transcript: {str(e)}"}

# Function to validate JSON string - kept for compatibility
def validate_json(json_string):
    try:
        return json.loads(json_string)
    except json.JSONDecodeError as e:
        print("JSON validation error")
        return {"error": f"JSON validation error: {str(e)}"}

def correctvisionoutput(transcript):
    class JSONOUTPUT(BaseModel):
        name: str = Field(description="The name of the person")
        dob: str = Field(description="date of birth in format dd/mm/yyyy")
        aadhar: str = Field(description="It is a 12 digit number")
        
    return main(transcript, JSONOUTPUT)

# The model classes remain unchanged
class AadhaarOutput(BaseModel):
    name: str = Field(description="The name of the Aadhaar card holder")
    dob: str = Field(description="Date of birth in format dd/mm/yyyy")
    aadhar_number: str = Field(description="The 12-digit Aadhaar number")
    address: str = Field(description="The address of the Aadhaar card holder")
    gender: str = Field(description="Gender of the Aadhaar card holder")

class VoterIDOutput(BaseModel):
    name: str = Field(description="The name of the voter")
    voter_id: str = Field(description="The voter ID number")
    father_name: str = Field(description="Father's name")
    dob: str = Field(description="Date of birth in format dd/mm/yyyy")
    gender: str = Field(description="Gender of the voter")


def process_document(document_path, document_type):
    # Ensure the document type is valid
    valid_types = ["aadhaar","voterid"]
    if document_type not in valid_types:
        raise ValueError(f"Invalid document type. Expected one of: {valid_types}")

 
    # Define prompts for different document types
    prompts = {
        "aadhaar": {
            "query": "Extract the 12 digit aadhaar number as aadhaar_number, holder's name as name, date of birth as dob(yyyy-mm-dd)  and address as address from the image in JSON format",
            "backup_query": AadhaarOutput,
        },
        "voterid": {
            "query": "Extract the voter ID number as voter_id, voter's name as name, father's name as father_name, date of birth as dob(yyyy-mm-dd) and gender as gender from the voter ID card in JSON format",
            "backup_query": VoterIDOutput,
        },
    }

    image_path = document_path

    # Process the image and extract data
    result = process_image(prompts[document_type], image_path)
    return result


# Example usage
if __name__ == "__main__":
    document_path = (
        r"C:\Users\NikhilJain\Downloads\WhatsApp Image 2025-03-22 at 2.21.09 AM.jpeg"  # or .png, .jpg, .jpeg
    )
    document_type = "voterid"  #  "aadhaar", "voterid"
    result = process_document(document_path, document_type)
    print(result)
