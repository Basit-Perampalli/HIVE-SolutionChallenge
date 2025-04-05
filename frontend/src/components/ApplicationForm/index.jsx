import React, { useEffect, useState } from "react";
import PersonalDetails from "./PersonalDetails";
import EducationalDetails from "./EducationalDetails";
import PreviewReport from "./PreviewReport";
import NavBar from "../NavBar/NavBar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ThankyouPage from "./ThankyouPage";
import AgeProof from "./AgeProof";

const ApplicationForm = () => {
  const [step, setStep] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Function to handle fetch requests with automatic retry on 403
  const fetchWithRetry = async (url, options, retryCount = 5) => {
    try {
      const response = await fetch(url, options);

      // If response is 403, retry the request once
      if (response.status === 403 && retryCount > 0) {
        console.log(`Received 403, retrying request to ${url}...`);
        return fetchWithRetry(url, options, retryCount - 1);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  };

  const [formData, setFormData] = useState({
    // Personal Details
    name: "",
    email: "",
    phone: "",
    address: "",
    dob: "",
    adhaar: "",
    housenumber: "",
    city: "",
    state: "",
    pincode: "",
    adhaarFile: null,
    adhaarLink: null,
    adhaarVerified: false,

    // Educational Details
    class10School: "",
    class10Percentage: "",
    class10Marksheet: null,
    class10Link: false,
    class10Verified: false,

    class12College: "",
    class12Percentage: "",
    class12Marksheet: null,
    class12Link: null,
    class12Verified: false,

    bachelorsUniversity: "",
    bachelorsPercentage: "",
    bachelorsMarksheet: null,
    bachelorsLink: null,
    bachelorsVerified: false,

    pannumber: "",
    panFile: null,
    panLink: null,
    panVerified: false,
  });

  // const handleInputChange = (e) => {
  //   const { name, value, files } = e.target;
  //   setFormData(prev => ({
  //     ...prev,
  //     [name]: files ? files[0] : value
  //   }));
  // };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    // if (files) {
    //   console.log(`Uploading document type: ${documentType}`);
    //   // You can perform document-specific validation here
    // }

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleVerify = async (documentType) => {
    // console.log(`Verifying document type: ${documentType}`);

    // // Map document types to their corresponding verification fields
    // const verificationFields = {
    //   'adhaar': 'adhaarVerified',
    //   'class10': 'class10Verified',
    //   'class12': 'class12Verified',
    //   'bachelors': 'bachelorsVerified'
    // };

    // // Map document types to their corresponding file fields
    // const fileFields = {
    //   'adhaar': 'adhaarFile',
    //   'class10': 'class10Marksheet',
    //   'class12': 'class12Marksheet',
    //   'bachelors': 'bachelorsMarksheet'
    // };

    // const verificationField = verificationFields[documentType];
    // const fileField = fileFields[documentType];
    const file = new FormData();

    switch (documentType) {
      case "adhaar":
        // Verify Adhaar specific format/details
        file.append("image", formData.adhaarFile); // Append the file with the key 'image'
        try {
          const response = await fetch(
            "http://127.0.0.1:8000/verification/upload-image/",
            {
              method: "POST",
              body: file,
            }
          );
          const data = await response.json()
          console.log("Verifying Adhaar document...", data.file_path);

          const d = await fetchWithRetry(
            "http://localhost:8000/verification/aadhaar/",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: formData.name,
                adhaar_number: formData.adhaar,
                dob: formData.dob,
                housenumber: formData.housenumber,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                link: data.file_path,
              }),
            }
          );

          console.log(d.result["name"]);
          console.log(d.result["adhaar_number"]);
          console.log(d.result["housenumber"]);
          console.log(d.result["city"]);
          console.log(d.result["state"]);
          console.log(d.result["pincode"]);

          if (d.result["name"] == false && d.result["adhaar_number"] == false) {
            toast.error("Name and adhaar number verification failed");
          } else if (d.result["name"] == false) {
            toast.error("Name verification failed");
          } else if (d.result["adhaar_number"] == false) {
            toast.error("Adhaar Number verification failed");
          } else if (
            d.result["housenumber"] == false ||
            d.result["city"] == false ||
            d.result["state"] == false ||
            d.result["pincode"] == false
          ) {
            toast.error("Address verification failed");
          } else {
            toast.success("Adhaar verification successful");
          }
          setFormData((prev) => ({
            ...prev,
            adhaarVerified: d.verified,
            adhaarLink: data.file_path,
          }));
        } catch (error) {
          console.log(error);
          toast.error("Adhaar verification failed. Please try again.");
        }
        break;

      case "x":
        // Verify Class X marksheet format/details
        file.append("image", formData.class10Marksheet); // Append the file with the key 'image'
        try {
          const response = await fetch(
            "http://127.0.0.1:8000/verification/upload-image/",
            {
              method: "POST",
              body: file,
            }
          );
          const data = await response.json();
          console.log("Verifying 10th document...", data.file_path);

          const d = await fetchWithRetry(
            "http://localhost:8000/verification/marksheet/",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: formData.name,
                percentage: formData.class10Percentage,
                link: data.file_path,
                dob: formData.dob,
              }),
            }
          );

          console.log(d.result["name"]);
          console.log(d.result["percentage"]);
          if (d.result["name"] == false && d.result["percentage"] == false) {
            toast.error("Name and percentage verification failed");
          } else if (d.result["name"] == false) {
            toast.error("Name verification failed");
          } else if (d.result["percentage"] == false) {
            toast.error("Percentage verification failed");
          } else {
            toast.success("Class 10 marksheet verification successful");
          }
          setFormData((prev) => ({
            ...prev,
            class10Verified: d.verified,
            class10Link: data.file_path,
          }));
        } catch (error) {
          console.log(error);
          toast.error(
            "Class 10 marksheet verification failed. Please try again."
          );
        }
        break;
      case "xii":
        // Verify Class XII marksheet format/details
        file.append("image", formData.class12Marksheet); // Append the file with the key 'image'
        try {
          const response = await fetch(
            "http://127.0.0.1:8000/verification/upload-image/",
            {
              method: "POST",
              body: file,
            }
          );
          const data = await response.json();
          console.log("Verifying 12th document...", data.file_path);

          const d = await fetchWithRetry(
            "http://localhost:8000/verification/marksheet/",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: formData.name,
                percentage: formData.class12Percentage,
                link: data.file_path,
              }),
            }
          );

          console.log(d.result["name"]);
          console.log(d.result["percentage"]);
          if (d.result["name"] == false && d.result["percentage"] == false) {
            toast.error("Name and percentage verification failed");
          } else if (d.result["name"] == false) {
            toast.error("Name verification failed");
          } else if (d.result["percentage"] == false) {
            toast.error("Percentage verification failed");
          } else {
            toast.success("Class 12 marksheet verification successful");
          }
          setFormData((prev) => ({
            ...prev,
            class12Verified: d.verified,
            class12Link: data.file_path,
          }));
        } catch (error) {
          console.log(error);
          toast.error(
            "Class 12 marksheet verification failed. Please try again."
          );
        }
        break;
      case "b":
        // Verify Bachelors marksheet format/details
        file.append("image", formData.bachelorsMarksheet); // Append the file with the key 'image'
        try {
          const response = await fetch(
            "http://127.0.0.1:8000/verification/upload-image/",
            {
              method: "POST",
              body: file,
            }
          );
          const data = await response.json();


          const d = await fetchWithRetry(
            "http://localhost:8000/verification/marksheet/",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: formData.name,
                percentage: formData.bachelorsPercentage,
                link: data.file_path,
              }),
            }
          );

          console.log(d.result["name"]);
          console.log(d.result["percentage"]);
          if (d.result["name"] == false && d.result["percentage"] == false) {
            toast.error("Name and percentage verification failed");
          } else if (d.result["name"] == false) {
            toast.error("Name verification failed");
          } else if (d.result["percentage"] == false) {
            toast.error("Percentage verification failed");
          } else {
            toast.success("Bachelor's marksheet verification successful");
          }
          setFormData((prev) => ({
            ...prev,
            bachelorsVerified: d.verified,
            bachelorsLink: data.file_path,
          }));
        } catch (error) {
          console.log(error);
          toast.error(
            "Bachelor's marksheet verification failed. Please try again."
          );
        }
        break;
        case "pan":
          // Verify PAN specific format/details
          file.append("image", formData.panFile); // Append the file with the key 'image'
          try {
            const response = await fetch(
          "http://localhost:8000/verification/upload-image/",
          {
            method: "POST",
            body: file,
          }
            );
            const data = await response.json();
            console.log("Verifying PAN document...", data.file_path);
            const res = await fetch("http://localhost:8000/verification/pan/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pannumber: formData.pannumber,
            dob: formData.dob,
            link: data.file_path,
          }),
            });
            const d = await res.json();
            console.log(d.result['pannumber']);
            
            if (d.result['pannumber'] == false && d.result['dob'] == false) {
              toast.error("PAN number and DOB verification failed");
            } else if (d.result['pannumber'] == false) {
              toast.error("PAN Number verification failed");
            } else if (d.result['dob'] == false) {
              toast.error("DOB verification failed");
            } else {
              toast.success("PAN verification successful");
              const dob = new Date(formData.dob);
              const ageDifMs = Date.now() - dob.getTime();
              const ageDate = new Date(ageDifMs); // milliseconds from epoch
              const age = Math.abs(ageDate.getUTCFullYear() - 1970);
              console.log(`Age: ${age}`);
              toast.success(`Your age is ${age}`);
            }
            setFormData((prev) => ({
          ...prev,
          panVerified: d.verified,
          panLink: data.file_path,
            }));
          } catch (error) {
            console.log(error);
          }
          break;

        default:
        console.log("Unknown document type", documentType);
    }

    // setFormData(prev => ({
    //   ...prev,
    //   [verificationField]: true
    // }));
  };

  const isFormVerified = 
      formData.adhaarVerified &&
      formData.class10Verified &&
      formData.class12Verified &&
      formData.bachelorsVerified && 
      formData.pannumberVerified
   

  return (
    <div className="container">
      <NavBar />
      <div className="card animate-fade-in">
        <div className="steps">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`step-indicator ${step >= s ? "active" : ""}`}
            />
          ))}
        </div>

        <h2 className="preview-title">
          {step === 1
            ? "Personal Details"
            : step === 2
            ? "Educational Details"
            : step === 3
            ? "Age Proof"
            : step === 4
            ? "Application Preview"
            : "Application Submitted"}
        </h2>

        {step === 1 && (
          <PersonalDetails
            formData={formData}
            handleInputChange={handleInputChange}
            handleVerify={handleVerify}
          />
        )}
        {step === 2 && (
          <EducationalDetails
            formData={formData}
            handleInputChange={handleInputChange}
            handleVerify={handleVerify}
          />
        )}
        {step === 3 && (
          <AgeProof
            formData={formData}
            handleInputChange={handleInputChange}
            handleVerify={handleVerify}
          />
        )}
        {step === 4 && <PreviewReport formData={formData} />}
        {step === 5 && <ThankyouPage />}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "2rem",
          }}
        >
          {step > 1 && step < 5 && (
            <button
              className="button button-outline"
              onClick={() => setStep(step - 1)}
            >
              Previous
            </button>
          )}
          {step < 4 && (
            <button
              className="button button-primary"
              onClick={() => setStep(step + 1)}
              style={{ marginLeft: "auto" }}
            >
              Next
            </button>
          )}
          {step === 4 && (
            <button
              className="button button-primary"
              onClick={() => {
                if (isFormVerified) {
                  setStep(step + 1); // Submit or proceed if everything is verified
                } else {
                  toast.error("All details must be verified before submitting");
                }
              }}
              style={{ marginLeft: "auto" }}
            >
              Submit Application
            </button>
          )}
          {step < 5 ? (
            <div>
              <button
                className="button button-outline"
                onClick={() => setStep(step + 1)}
                style={{ marginLeft: "1rem" }}
              >
                Request Manual Verification
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
