import React, { useState, useCallback, useRef } from "react";
import Webcam from "react-webcam";
import {
  Box,
  Button,
  Typography,
  Paper,
  Container,
  CircularProgress,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import FlipCameraIosIcon from "@mui/icons-material/FlipCameraIos";
import { toast } from "react-toastify";

const VisuallyHiddenInput = styled("input")`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

const ImagePreview = styled("img")`
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  margin-top: 16px;
  border-radius: 8px;
`;

const StyledPaper = styled(Paper)(({ theme }) => ({
  height: "calc(100vh - 120px)",
  overflow: "auto",
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
}));

const WebcamContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  maxWidth: "600px",
  margin: "0 auto",
  "& video": {
    width: "100%",
    height: "auto",
    transform: "scaleX(-1)", // Mirror the video feed
  },
}));

const CaptureButton = styled(Button)(({ theme }) => ({
  position: "absolute",
  bottom: theme.spacing(2),
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 1,
}));

const VoterIDExtractor = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputMethod, setInputMethod] = useState("upload"); // 'upload' or 'camera'
  const [isCameraReady, setCameraReady] = useState(false);
  const webcamRef = useRef(null);

  const API_KEY =
    "f5768fe361d19904facb1ecc05f9bf26e847d4fa2556f703ec6fab79537edc09";

  const handleInputMethodChange = (event, newMethod) => {
    if (newMethod !== null) {
      setInputMethod(newMethod);
      handleReset();
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === "application/pdf") {
        toast.error(
          "PDF files are not supported in the web version. Please upload an image."
        );
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      // Convert base64 to blob
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "camera-capture.jpg", {
            type: "image/jpeg",
          });
          setImage(file);
          setImagePreview(imageSrc);
        });
    }
  }, [webcamRef]);

  const encodeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const extractJsonFromResponse = (response) => {
    try {
      const firstBrace = response.indexOf("{");
      const lastBrace = response.lastIndexOf("}");
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("No valid JSON found in the response");
      }
      const jsonString = response
        .slice(firstBrace, lastBrace + 1)
        .toLowerCase();
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error(`Failed to parse response: ${error.message}`);
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      toast.error("Please upload or capture an image");
      return;
    }

    setLoading(true);
    try {
      const base64Image = await encodeImage(image);

      const response = await fetch("https://api.together.xyz/inference", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Extract the voting ID number as voting_id_number, holder's name as name, father's name as father_name, gender as gender and date of birth as dob from the image in JSON format",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
          stream: false,
        }),
      });

      const data = await response.json();

      if (data.choices && data.choices[0] && data.choices[0].message) {
        const parsedData = extractJsonFromResponse(
          data.choices[0].message.content
        );
        setExtractedData(parsedData);
        toast.success("Data extracted successfully!");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to extract data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setImagePreview(null);
    setExtractedData(null);
  };

  const renderExtractedData = () => {
    if (!extractedData) return null;

    const fields = [
      { label: "Name", key: "name" },
      { label: "Father's Name", key: "father_name" },
      { label: "Gender", key: "gender" },
      { label: "Voter ID Number", key: "voting_id_number" },
      { label: "Date of Birth", key: "dob" },
    ];

    return (
      <Box sx={{ mt: 2 }}>
        {fields.map((field) => (
          <Box key={field.key} sx={{ mb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {field.label}
            </Typography>
            <Typography variant="body1">
              {extractedData[field.key] || "Not found"}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  const renderInputSection = () => {
    if (inputMethod === "camera") {
      return (
        <WebcamContainer>
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            onUserMedia={() => setCameraReady(true)}
            mirrored={true} // This will show mirrored preview but capture correct orientation
          />
          <CaptureButton
            variant="contained"
            color="primary"
            onClick={capture}
            disabled={!isCameraReady}
            startIcon={<CameraAltIcon />}
          >
            Capture
          </CaptureButton>
        </WebcamContainer>
      );
    }

    return (
      <Button
        component="label"
        variant="contained"
        startIcon={<CloudUploadIcon />}
        sx={{ width: "fit-content" }}
      >
        Upload Image
        <VisuallyHiddenInput
          type="file"
          onChange={handleImageChange}
          accept="image/*"
        />
      </Button>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        color="primary"
        sx={{ mb: 4 }}
      >
        Voter ID Information Extractor
      </Typography>

      <Grid container spacing={3}>
        {/* Left Column - Input */}
        <Grid item xs={12} md={6}>
          <StyledPaper elevation={3}>
            <Typography variant="h6" gutterBottom>
              Upload or Capture Voter ID
            </Typography>

            <ToggleButtonGroup
              value={inputMethod}
              exclusive
              onChange={handleInputMethodChange}
              sx={{ mb: 3 }}
            >
              <ToggleButton value="upload">
                <CloudUploadIcon sx={{ mr: 1 }} /> Upload
              </ToggleButton>
              <ToggleButton value="camera">
                <CameraAltIcon sx={{ mr: 1 }} /> Camera
              </ToggleButton>
            </ToggleButtonGroup>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {renderInputSection()}

              {imagePreview && (
                <Box sx={{ textAlign: "center" }}>
                  <ImagePreview
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      transform:
                        inputMethod === "camera" ? "scaleX(1)" : "none",
                    }}
                  />
                </Box>
              )}

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "center",
                  mt: "auto",
                }}
              >
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading || !image}
                  sx={{ minWidth: 120 }}
                >
                  {loading ? <CircularProgress size={24} /> : "Extract Data"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  disabled={loading}
                  sx={{ minWidth: 120 }}
                >
                  Reset
                </Button>
              </Box>
            </Box>
          </StyledPaper>
        </Grid>

        {/* Right Column - Output */}
        <Grid item xs={12} md={6}>
          <StyledPaper elevation={3}>
            <Typography variant="h6" gutterBottom>
              Extracted Information
            </Typography>
            {extractedData ? (
              renderExtractedData()
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "text.secondary",
                }}
              >
                <Typography variant="body1">
                  Extracted voter ID information will appear here
                </Typography>
              </Box>
            )}
          </StyledPaper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default VoterIDExtractor;
