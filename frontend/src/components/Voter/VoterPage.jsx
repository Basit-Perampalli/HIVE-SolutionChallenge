import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Button,
  Container,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  IconButton,
  useMediaQuery,
  useTheme,
  styled,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import { toast } from "react-toastify";

const base_url = "https://zx16l13m-8000.inc1.devtunnels.ms";

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

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

const StatusChip = styled(Chip)(({ status, theme }) => ({
  backgroundColor:
    status === "voted"
      ? theme.palette.success.main
      : theme.palette.warning.main,
  color: "#fff",
  fontWeight: "bold",
}));

const VoterPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCameraReady, setCameraReady] = useState(false);
  const [voterImage, setVoterImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Redirect non-mobile users
  useEffect(() => {
    if (!isMobile) {
      navigate("/");
    }
  }, [isMobile, navigate]);

  // Fetch voters list
  const fetchVoters = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/voter/all/`);
      setVoters(response.data);
    } catch (error) {
      console.error("Error fetching voters:", error);
      toast.error("Failed to load voters list");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 1) {
      fetchVoters();
    }
  }, [activeTab, fetchVoters]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    resetVerification();
  };

  // Camera capture functions
  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      // Convert base64 to blob
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "voter-id-capture.jpg", {
            type: "image/jpeg",
          });
          setVoterImage(file);
          setImagePreview(imageSrc);
        });
    }
  }, [webcamRef]);

  const resetVerification = () => {
    setVoterImage(null);
    setImagePreview(null);
    setVerificationResult(null);
    setShowVerificationDialog(false);
  };

  // Verify voter ID
  const verifyVoterId = async () => {
    if (!voterImage) {
      toast.error("Please capture an image first");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", voterImage);

      const response = await axios.post(`${base_url}/voter/verify/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setVerificationResult(response.data);
      setShowVerificationDialog(true);
    } catch (error) {
      console.error("Error verifying voter ID:", error);
      toast.error("Failed to verify voter ID. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Mark voter as voted
  const markAsVoted = async (voterId) => {
    try {
      setLoading(true);
      await axios.patch(`${base_url}/voter/${voterId}/update-status/`);
      toast.success("Voter marked as voted successfully");
      fetchVoters(); // Refresh voter list
      setShowVerificationDialog(false);
    } catch (error) {
      console.error("Error updating voter status:", error);
      toast.error("Failed to update voter status");
    } finally {
      setLoading(false);
    }
  };

  // Handle Excel file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      await axios.post(`${base_url}/voter/create/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Voters uploaded successfully");
      fetchVoters();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading voters:", error);
      toast.error("Failed to upload voters");
    } finally {
      setLoading(false);
    }
  };

  // Render verification dialog
  const renderVerificationDialog = () => {
    if (!verificationResult) return null;

    const { verified, voter, extracted_data, match_type } = verificationResult;

    return (
      <Dialog
        open={showVerificationDialog}
        onClose={() => setShowVerificationDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Verification Result
          {verified && (
            <Chip
              icon={<CheckCircleIcon />}
              label="Verified"
              color="success"
              sx={{ ml: 2 }}
            />
          )}
          {!verified && (
            <Chip
              icon={<PendingIcon />}
              label="Not Verified"
              color="error"
              sx={{ ml: 2 }}
            />
          )}
        </DialogTitle>
        <DialogContent>
          {verified ? (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Match found by: <strong>{match_type.toUpperCase()}</strong>
              </Typography>

              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Voter Details
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography>
                  <strong>Name:</strong> {voter.name}
                </Typography>
                <Typography>
                  <strong>Father's Name:</strong> {voter.father_name}
                </Typography>
                <Typography>
                  <strong>Voter ID:</strong> {voter.voter_id}
                </Typography>
                <Typography>
                  <strong>Gender:</strong> {voter.gender}
                </Typography>
                <Typography>
                  <strong>Date of Birth:</strong> {voter.dob}
                </Typography>
                <Typography>
                  <strong>Voting Status:</strong>
                  <StatusChip
                    label={voter.voting_status}
                    status={voter.voting_status}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Box>

              {voter.voting_status === "pending" && (
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  startIcon={<HowToVoteIcon />}
                  onClick={() => markAsVoted(voter.id)}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Mark as Voted"}
                </Button>
              )}
            </>
          ) : (
            <Typography color="error">
              No matching voter found. Please try again or check with an
              administrator.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVerificationDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Render camera view
  const renderCameraView = () => (
    <Box sx={{ mt: 2 }}>
      <StyledPaper elevation={3}>
        <Typography variant="h6" gutterBottom>
          Capture Voter ID
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Position the voter ID card in front of the camera and take a clear
          photo
        </Typography>

        {!imagePreview ? (
          <WebcamContainer>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode: "environment", // Use back camera on mobile
              }}
              onUserMedia={() => setCameraReady(true)}
              mirrored={false}
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
        ) : (
          <Box sx={{ textAlign: "center" }}>
            <img
              src={imagePreview}
              alt="Captured"
              style={{
                maxWidth: "100%",
                maxHeight: "300px",
                borderRadius: "8px",
              }}
            />
            <Box
              sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 2 }}
            >
              <Button variant="outlined" onClick={resetVerification}>
                Retake
              </Button>
              <Button
                variant="contained"
                onClick={verifyVoterId}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Verify"}
              </Button>
            </Box>
          </Box>
        )}
      </StyledPaper>
    </Box>
  );

  // Render voter list
  const renderVoterList = () => (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Voters List</Typography>
        <Button
          component="label"
          variant="contained"
          startIcon={<CloudUploadIcon />}
          size="small"
          disabled={loading}
        >
          Upload Excel
          <VisuallyHiddenInput
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            ref={fileInputRef}
          />
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : voters.length === 0 ? (
        <Typography align="center" color="text.secondary" sx={{ my: 4 }}>
          No voters found. Upload an Excel file to add voters.
        </Typography>
      ) : (
        <List>
          {voters.map((voter) => (
            <React.Fragment key={voter.id}>
              <StyledPaper>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="subtitle1">
                          {voter.name}
                        </Typography>
                        <StatusChip
                          label={voter.voting_status}
                          status={voter.voting_status}
                          size="small"
                          icon={
                            voter.voting_status === "voted" ? (
                              <CheckCircleIcon />
                            ) : (
                              <PendingIcon />
                            )
                          }
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="body2"
                          component="span"
                          display="block"
                        >
                          ID: {voter.voter_id}
                        </Typography>
                        <Typography
                          variant="body2"
                          component="span"
                          display="block"
                        >
                          Father: {voter.father_name}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              </StyledPaper>
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton edge="start" color="inherit" onClick={() => navigate("/")}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1" sx={{ ml: 1 }}>
          Voter Verification
        </Typography>
      </Box>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 2, bgcolor: "background.paper", borderRadius: 1 }}
      >
        <Tab icon={<CameraAltIcon />} label="Verify" />
        <Tab icon={<PersonIcon />} label="Voters" />
      </Tabs>

      {activeTab === 0 && renderCameraView()}
      {activeTab === 1 && renderVoterList()}

      {renderVerificationDialog()}
    </Container>
  );
};

export default VoterPage;
