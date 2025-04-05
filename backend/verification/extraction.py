import os
import base64
import json
import time
from pydantic import BaseModel, Field
from together import Together

from pdf2image import convert_from_path
from PIL import Image


# Function to encode image as base64
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")


# Function to validate JSON string
def validate_json(client, json_string):
    try:
        return json.loads(json_string)
    except json.JSONDecodeError as e:
        print("Calling llama turbo instruct")
        return main(client, json_string)


def correctvisionoutput(client, transcript):
    class JSONOUTPUT(BaseModel):
        name: str = Field(description="The name of the person")
        dob: str = Field(description="date of birth in format dd/mm/yyyy")
        aadhar: str = Field(description="It is a 12 digit number")

    extract = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "The following is a ocr output message transcript. Only answer in JSON.",
            },
            {
                "role": "user",
                "content": transcript,
            },
        ],
        model="meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
        response_format={
            "type": "json_object",
            "schema": JSONOUTPUT.model_json_schema(),
        },
    )

    output = json.loads(extract.choices[0].message.content)
    print(json.dumps(output, indent=2))
    return output


def extract_clean_data(client, response, prompt):
    try:
        # Directly access the content attribute of the message object
        print(response.choices[0].message.content)
        response_content = response.choices[0].message.content

        # Extract only the JSON part
        first_brace = response_content.find("{")
        last_brace = response_content.rfind("}")
        if first_brace == -1 or last_brace == -1:
            print(
                "Calling llama turbo instruct",
                "not able to find braces",
                response_content,
            )
            return main(client, response_content, prompt["backup_query"])

        json_string = response_content[first_brace : last_brace + 1]
        json_string = json_string.lower()

        # json_string = validate_json(client, json_string)

        return json_string
    except (AttributeError, KeyError, IndexError) as e:
        return {"error": f"Failed to parse response: {str(e)}"}


def process_image(client, prompt, image_path):
    if prompt["query"] is None:
        raise Exception("Query not provided")
    try:
        base64_image = encode_image(image_path)

        # Send request to the model with the query and image
        response = client.chat.completions.create(
            model="meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt["query"]},  # User query input
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                            },
                        },
                    ],
                }
            ],
            stream=False,
        )

        # Extract and clean the data from the response
        return extract_clean_data(client, response, prompt)

    except Exception as e:
        return {"error": str(e)}


def main(client, transcript, JSONOUTPUT):
    extract = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "The following is a ocr output message transcript. Only answer in JSON.",
            },
            {
                "role": "user",
                "content": transcript,
            },
        ],
        model="meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
        response_format={
            "type": "json_object",
            "schema": JSONOUTPUT.model_json_schema(),
        },
    )

    output = json.loads(extract.choices[0].message.content)
    print(json.dumps(output, indent=2))
    return output


class AadhaarOutput(BaseModel):
    name: str = Field(description="The name of the Aadhaar card holder")
    dob: str = Field(description="Date of birth in format dd/mm/yyyy")
    aadhar_number: str = Field(description="The 12-digit Aadhaar number")
    address: str = Field(description="The address of the Aadhaar card holder")


class GateOutput(BaseModel):
    name: str = Field(description="The name of the person")
    gate_score: str = Field(
        description="This is a 3 digit number seprated after every 4 digits"
    )
    out_of_100_marks: str = Field(description="mostly decimal number, out of 100")
    registration_number: str = Field(description="This is alphnumeric sequence")
    air: str = Field(description="")


class Marksheet(BaseModel):
    name: str = Field(description="The name of the person")
    parent: str = Field(description="Gardian name")
    dob: str = Field(description="Date of birth in format dd/mm/yyyy")
    school: str = Field(description="name of the school")
    result: str = Field(description="cant be pass or fail")


class CasteOutput(BaseModel):
    name: str = Field(description="The name of the person")
    caste: str = Field(description="Caste name")
    category: str = Field(description="sub caste category")
    result: str = Field(description="cant be pass or fail")


class DegreeOutput(BaseModel):
    name: str = Field(description="The name of the person")
    mother_name: str = Field(description="person mothers name")
    degree: str = Field(description="field of stude")
    university: str = Field(description="affilication university")
    year: str = Field(description="This is year(yyyy) of passing")


class VoterIDOutput(BaseModel):
    name: str = Field(description="The name of the voter")
    voter_id: str = Field(description="The voter ID number")
    father_name: str = Field(description="Father's name")
    dob: str = Field(description="Date of birth in format dd/mm/yyyy")
    gender: str = Field(description="Gender of the voter")
    address: str = Field(description="Address of the voter")

class pan(BaseModel):
    pannumber: str = Field(description="10 character alphanumeric pan card number")
    dob: str = Field(description="date of birth in format dd/mm/yyyy")

def process_document(document_path, document_type, client):
    # Ensure the document type is valid
    valid_types = ["gate", "marksheet", "caste", "degree", "aadhaar", "pan", "voterid"]
    if document_type not in valid_types:
        raise ValueError(f"Invalid document type. Expected one of: {valid_types}")

    with open("env.json", "r") as f:
        env = json.loads(f.read())
        poppler_path = env["poppler_path"]
    # Define prompts for different document types
    prompts = {
        "gate": {
            "query": "Extract candidate name, Registration Number as RegNo, Gate score, Marks out of 100, and all India ranking in JSON format",
            "backup_query": GateOutput,
        },
        "marksheet": {
            "query": "Extract card holder name as name,percentage, Date of Birth(yyyy-mm-dd) as dob in JSON",
            "backup_query": Marksheet,
        },
        "pan": {
            "query": "extract date of birth as dob and pan card number as pannumber from the image JSON.",
            "backup_query": pan,
        },
        # "caste": {
        #     "query": 'Extract in following format. {"Name":<name>,"Caste":<Caste name>,"Category":<cast category>}',
        #     "backup_query": CasteOutput,
        # },
        # "degree": {
        #     "query": 'Extract in following format. {"Name":<Full name of degree holder>,"Mother":<Mother name>,"Degree":<Degree name>,"university":<name of university>,"Year":<year>} in JSON',
        #     "backup_query": DegreeOutput,
        # },
        "aadhaar": {
            "query": "Extract the 12 digit aadhaar number as aadhaar_number, holder's name as name, date of birth as dob(yyyy-mm-dd)  and address as address from the image in JSON format",
            "backup_query": AadhaarOutput,
        },
        "voterid": {
            "query": "Extract the voter ID number as voter_id, voter's name as name, father's name as father_name, date of birth as dob(yyyy-mm-dd), gender, and address from the voter ID card in JSON format",
            "backup_query": VoterIDOutput,
        },
    }

    # Check if the document is a PDF and convert it to an image
    if document_path.lower().endswith(".pdf"):
        images = convert_from_path(document_path, poppler_path=poppler_path)
        image_path = document_path.replace(".pdf", ".jpeg")
        images[0].save(image_path, "JPEG")
        pass
    else:
        image_path = document_path

    # Process the image and extract data
    result = process_image(client, prompts[document_type], image_path)
    return result


# Example usage
if __name__ == "__main__":
    client = Together(api_key="tgp_v1_43XYhlKfGiTC-cRZeDmrv_UAWmDGLEBqy5YUgDWk5dI")
    document_path = (
        r"C:\Users\Admin\Downloads\Kaustubh Adhaar.pdf"  # or .png, .jpg, .jpeg
    )
    document_type = "aadhaar"  # or "marksheet", "caste", "degree"
    result = process_document(document_path, document_type, client)
    print(result)
