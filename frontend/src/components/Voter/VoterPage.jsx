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
  DialogContentText,
  Card,
  CardContent,
  IconButton,
  useMediaQuery,
  useTheme,
  styled,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import { toast } from "react-toastify";

const base_url = "http://54.91.54.250";

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
  position: "relative",
}));

const StatusChip = styled(Chip)(({ status, theme }) => ({
  backgroundColor:
    status === "voted"
      ? theme.palette.success.main
      : theme.palette.warning.main,
  color: "#fff",
  fontWeight: "bold",
  "& .MuiChip-icon": {
    color: "#fff",
  },
}));

const DeleteButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  right: theme.spacing(2),
  transform: "translateY(-50%)",
  color: theme.palette.error.main,
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
  const [showAddVoterDialog, setShowAddVoterDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [voterToDelete, setVoterToDelete] = useState(null);
  const [cameraError, setCameraError] = useState(false);
  const [newVoter, setNewVoter] = useState({
    name: "",
    father_name: "",
    voter_id: "",
    gender: "",
    dob: "",
  });
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageUploadRef = useRef(null);
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

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVoter((prev) => ({ ...prev, [name]: value }));
  };

  // Submit new voter
  const handleAddVoter = async () => {
    // Validate form
    if (
      !newVoter.name ||
      !newVoter.voter_id ||
      !newVoter.father_name ||
      !newVoter.gender ||
      !newVoter.dob
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${base_url}/voter/create/`, newVoter);

      toast.success("Voter added successfully");
      setShowAddVoterDialog(false);
      // Reset form
      setNewVoter({
        name: "",
        father_name: "",
        voter_id: "",
        gender: "",
        dob: "",
      });
      // Refresh voter list
      fetchVoters();
    } catch (error) {
      console.error("Error adding voter:", error);
      toast.error(error.response?.data?.error || "Failed to add voter");
    } finally {
      setLoading(false);
    }
  };

  // Delete voter
  const handleDeleteVoter = (voter) => {
    setVoterToDelete(voter);
    setShowDeleteConfirmDialog(true);
  };

  // Confirm deletion
  const confirmDeleteVoter = async () => {
    if (!voterToDelete) return;

    try {
      setLoading(true);
      await axios.delete(`${base_url}/voter/${voterToDelete.id}/delete/`);

      toast.success(`Voter ${voterToDelete.name} deleted successfully`);
      setShowDeleteConfirmDialog(false);
      setVoterToDelete(null);

      // Refresh voter list
      fetchVoters();
    } catch (error) {
      console.error("Error deleting voter:", error);
      toast.error(error.response?.data?.error || "Failed to delete voter");
    } finally {
      setLoading(false);
    }
  };

  // Handle direct image file upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.match("image.*")) {
      toast.error("Please select an image file");
      return;
    }

    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Save the file for verification
    setVoterImage(file);
  };

  // Camera error handler
  const handleCameraError = (error) => {
    console.error("Camera error:", error);
    setCameraError(true);
    setCameraReady(false);
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
          Voter ID Verification
        </Typography>

        {/* Upload button above camera */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Button
            variant="contained"
            color="secondary"
            component="label"
            startIcon={<PhotoLibraryIcon />}
            size="small"
          >
            Upload Image
            <input
              ref={imageUploadRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageUpload}
            />
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {cameraError
            ? "Camera access denied. Please use the upload button above to select an image."
            : "Position the voter ID card in front of the camera or upload an image"}
        </Typography>

        {!imagePreview ? (
          // Camera view - always show unless there's an error
          <WebcamContainer>
            {!cameraError ? (
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: "environment", // Use back camera on mobile
                }}
                onUserMedia={() => setCameraReady(true)}
                onUserMediaError={handleCameraError}
                mirrored={false}
              />
            ) : (
              <Box
                sx={{
                  height: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px dashed grey",
                  borderRadius: 1,
                  flexDirection: "column",
                  p: 2,
                }}
              >
                <CameraAltIcon
                  sx={{ fontSize: 50, color: "text.disabled", mb: 2 }}
                />
                <Typography color="text.secondary" align="center">
                  Camera access is not available on this device or permission
                  was denied. Please use the upload button to select a voter ID
                  image.
                </Typography>
              </Box>
            )}

            {!cameraError && (
              <CaptureButton
                variant="contained"
                color="primary"
                onClick={capture}
                disabled={!isCameraReady}
                startIcon={<CameraAltIcon />}
              >
                Capture
              </CaptureButton>
            )}
          </WebcamContainer>
        ) : (
          // Preview of captured or uploaded image
          <Box sx={{ textAlign: "center" }}>
            <img
              src={imagePreview}
              alt="Voter ID"
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
                Reset
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

  // Render add voter dialog
  const renderAddVoterDialog = () => {
    return (
      <Dialog
        open={showAddVoterDialog}
        onClose={() => setShowAddVoterDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add New Voter</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={newVoter.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Father's Name"
                name="father_name"
                value={newVoter.father_name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Voter ID"
                name="voter_id"
                value={newVoter.voter_id}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={newVoter.gender}
                  onChange={handleInputChange}
                  label="Gender"
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dob"
                type="date"
                value={newVoter.dob}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                placeholder="DD-MM-YYYY"
                helperText="Format: DD-MM-YYYY"
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddVoterDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddVoter}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Add Voter"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Render delete confirmation dialog
  const renderDeleteConfirmDialog = () => {
    return (
      <Dialog
        open={showDeleteConfirmDialog}
        onClose={() => setShowDeleteConfirmDialog(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete voter "{voterToDelete?.name}" with
            ID {voterToDelete?.voter_id}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirmDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteVoter}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

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
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            size="small"
            onClick={() => setShowAddVoterDialog(true)}
          >
            Add Voter
          </Button>
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
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : voters.length === 0 ? (
        <Typography align="center" color="text.secondary" sx={{ my: 4 }}>
          No voters found. Upload an Excel file or add voters manually.
        </Typography>
      ) : (
        <List>
          {voters.map((voter) => (
            <StyledPaper key={voter.id}>
              <Box sx={{ pr: 5 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                    {voter.name}
                  </Typography>
                  <StatusChip
                    icon={
                      voter.voting_status === "voted" ? (
                        <CheckCircleIcon />
                      ) : (
                        <PendingIcon />
                      )
                    }
                    label={voter.voting_status}
                    status={voter.voting_status}
                    size="medium"
                  />
                </Box>
                <Typography variant="body1" color="text.secondary">
                  ID: {voter.voter_id}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Father: {voter.father_name}
                </Typography>
              </Box>
              <DeleteButton
                aria-label="delete"
                onClick={() => handleDeleteVoter(voter)}
              >
                <DeleteIcon />
              </DeleteButton>
            </StyledPaper>
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
      {renderAddVoterDialog()}
      {renderDeleteConfirmDialog()}
    </Container>
  );
};

export default VoterPage;
