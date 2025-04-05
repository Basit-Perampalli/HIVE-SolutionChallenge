from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import os
import json
from together import Together
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import FileSystemStorage
from verification.extraction import process_document
from pdf2image import convert_from_path
from datetime import datetime


client = Together(api_key="tgp_v1_WL9h_QM1RnDkIxAEfjdyILH4DGZ0fyMhMHs9qTIfTxc")


@csrf_exempt
def upload_image(request):
    if request.method == "POST" and request.FILES.get("image"):
        # Access the uploaded file
        uploaded_file = request.FILES["image"]

        # Save the file temporarily
        fs = FileSystemStorage(location="media/uploaded_files/")
        filename = fs.save(uploaded_file.name, uploaded_file)
        file_path = fs.path(filename)
        with open("env.json", "r") as f:
            env = json.loads(f.read())
            poppler_path = env["poppler_path"]
        if file_path.lower().endswith(".pdf"):
            images = convert_from_path(file_path, poppler_path=poppler_path)
            image_path = file_path.replace(".pdf", ".jpeg")
            images[0].save(image_path, "JPEG")
            pass
        else:
            image_path = file_path
        print(uploaded_file.name,'*****',image_path)
        return JsonResponse({"file_path": image_path}, status=200)

    return JsonResponse({"error": "Invalid request"}, status=400)


@api_view(["POST"])
def verify_aadhar(request):
    data = request.data
    name = data.get("name")
    adhaar_number = data.get("adhaar_number")
    dob = data.get("dob")
    housenumber = data.get("housenumber")
    city = data.get("city")
    state = data.get("state")
    pincode = data.get("pincode")
    link = data.get("link")
    print(link, dob)
    result = process_document(link, "aadhaar", client)
    if isinstance(result, dict):
        data = result
    elif isinstance(result, str):
        data = json.loads(result)
    else:
        data = json.loads(result)
    print("Done", str(result), data["name"])
    # result_str = result
    res = {}
    name_ext = data["name"]
    if name.lower() in name_ext.lower():
        res["name"] = True
    else:
        res["name"] = False
    if housenumber.lower() in data["address"].lower() and city.lower() in data["address"].lower() and state.lower() in data["address"].lower() and pincode.lower() in data["address"].lower():
        res["address"] = True
    else:
        res["address"] = False
    # if name == result[""]:
    #     res["name"] = "verified"
    # else:
    #     res["name"] = "not verified"
    # aadhar_number = str(aadhar_number)
    print(data)
    aadhaar_number_ext = data["aadhaar_number"]
    aadhaar_number_ext = str(aadhaar_number_ext).replace(" ", "")
    print(aadhaar_number_ext)
    if aadhaar_number_ext == adhaar_number.replace(" ", ""):
        print(aadhaar_number_ext,adhaar_number.replace(" ",""))
        res["adhaar_number"] = True
    else:
        res["adhaar_number"] = False

    # for i in range(3):
    #     aadhar_num += data['aadhar_number'][i * 4 : i * 4 + 4] + " "

    # if aadhar_num[0:14] in result_str or aadhar_number in result_str:
    #     res["aadhar_number"] = "verified"
    # else:
    #     res["aadhar_number"] = "not verified"
    # print(res)
    # verified = True if res["name"] == res["aadhar_number"] == "verified" else False
    return Response(
        {
            "result": res,
            "verified": res["adhaar_number"] and res["name"] and res["address"],
            
            "size": os.path.getsize(link),
        },
        status=status.HTTP_200_OK,
    )



    



@api_view(["POST"])
def verify_marksheet(request):
    data = request.data
    name = data.get("name")
    percentage = data.get("percentage")
    link = data.get("link")
    result = process_document(link, "marksheet", client)
    print(result)
    print(type(result))
    if isinstance(result, dict):
        data = result
    elif isinstance(result, str):
        data = json.loads(result)
    else:
        data = json.loads(result)
    # print("Done", str(result), data["name"])
    res = {}
    name_ext = data["name"]
    new_name = name_ext.split(" ")
    final_name = []
    for i in new_name:
        i1 = i.lower()
        final_name.append(i1)

    name2 = name.split(" ")
    final_input_name = []
    for i in name2:
        i1 = i.lower()
        final_input_name.append(i1)

    print(f"final input name is {final_input_name}")
    print(f"data name  is {final_name}")
    if final_input_name[0] in final_name:
        res["name"] = True
    else:
        res["name"] = False
    percentage_ext = str(data["percentage"])
    if percentage_ext in str(percentage):
        res["percentage"] = True
    else:
        res["percentage"] = False

    print(str(res))
    return Response(
        {
            "result": res,
            "verified": res["percentage"] and res["name"],
            "size": os.path.getsize(link),
        },
        status=status.HTTP_200_OK,
    )

@api_view(["POST"])
def verify_pan(request):
    data = request.data
    pannumber = data.get("pannumber")
    dob = data.get("dob")
    link = data.get("link")
    result = process_document(link, "pan", client)
    print(result)
    print(type(result))
    if isinstance(result, dict):
        data = result
    elif isinstance(result, str):
        data = json.loads(result)
    else:
        data = json.loads(result)
    # print("Done", str(result), data["name"])
    res = {}
    pannumber_ext = data["pannumber"]
    dob_ext = data["dob"]
    print("PAN EXTRACTED", pannumber_ext, pannumber)
    print("DOB EXTRACTED", dob_ext, dob)
    if pannumber_ext in str(pannumber):
        res["pannumber"] = True
    else:
        res["pannumber"] = False

    # Convert dob and dob_ext to a specific format before comparing
    try:
        # Parse the incoming dob from React (in YYYY-MM-DD format)
        dob_obj = datetime.strptime(dob, "%Y-%m-%d")
        # Convert it to dd/mm/yyyy format to match the extracted dob format
        formatted_dob = dob_obj.strftime("%d/%m/%Y")
        print("DOB from React (formatted):", formatted_dob)
        print("DOB from extraction:", dob_ext)

        # Now compare the formatted dob with extracted dob
        if formatted_dob == dob_ext:
            res["dob"] = True
        else:
            res["dob"] = False
    except ValueError as e:
        print("Error formatting date:", str(e))
        res["dob"] = False

    print(str(res))
    return Response(
        {
            "result": res,
            "verified": res["pannumber"] and res["dob"],
            "size": os.path.getsize(link),
        },
        status=status.HTTP_200_OK,
    )

@api_view(["POST"])
def extract_data(request):
    data = request.data
    link = data.get("link")
    doctype = data.get("type")
    print('/'.join(link.split("\\")[-3:]))
    result = process_document(link, doctype, client)
    try:
        result = json.loads(result)
    except(Exception):
        print('error loading result in json')
        return Response({
            "data":"Encountred network error while extracting data from model ⚠️",
        }
        ,    status = status.HTTP_403_FORBIDDEN
        
        )
    return Response(
        {"data": result, "link": "/".join(link.split("\\")[-3:])},
        status=status.HTTP_200_OK,
    )