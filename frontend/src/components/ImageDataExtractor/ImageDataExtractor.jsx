import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
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
  max-height: 300px;
  object-fit: contain;
  margin-top: 16px;
  border-radius: 8px;
`;

const ImageDataExtractor = () => {
  const [query, setQuery] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [extractedData, setExtractedData] = useState("");
  const [loading, setLoading] = useState(false);

  const API_KEY =
    "f5768fe361d19904facb1ecc05f9bf26e847d4fa2556f703ec6fab79537edc09";

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

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

  const handleSubmit = async () => {
    if (!image || !query) {
      toast.error("Please provide both an image and a query");
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
          model: "meta-llama/Llama-Vision-Free",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: query },
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
        setExtractedData(data.choices[0].message.content);
        toast.success("Data extracted successfully!");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to extract data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQuery("");
    setImage(null);
    setImagePreview(null);
    setExtractedData("");
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom align="center" color="primary">
          Image Data Extractor
        </Typography>

        <Typography variant="body1" gutterBottom align="center" sx={{ mb: 2 }}>
          Upload an image and specify the fields you want to extract (e.g.,
          'name, dob, address')
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <TextField
            fullWidth
            label="Query"
            placeholder="Enter the fields you want to extract (e.g., 'name, dob, address')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            multiline
            rows={2}
          />

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

          {extractedData && (
            <Card variant="outlined" sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Extracted Data:
                </Typography>
                <Typography
                  variant="body1"
                  component="pre"
                  sx={{ whiteSpace: "pre-wrap" }}
                >
                  {extractedData}
                </Typography>
              </CardContent>
            </Card>
          )}

          {imagePreview && (
            <Box sx={{ textAlign: "center" }}>
              <ImagePreview src={imagePreview} alt="Preview" />
            </Box>
          )}

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || !image || !query}
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
      </Paper>
    </Container>
  );
};

export default ImageDataExtractor;
