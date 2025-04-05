import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Step,
  StepLabel,
  Stepper,
  Card,
  CardContent,
  useTheme,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const HelpPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Sample data for Excel format
  const excelSampleData = [
    {
      name: "Neha Gupta",
      fatherName: "Manoj Gupta",
      voterId: "PQR8523691",
      gender: "Female",
      dob: "30-11-2003",
    },
    {
      name: "Sandeep Yadav",
      fatherName: "Anil Yadav",
      voterId: "STU7418529",
      gender: "Male",
      dob: "01-12-2003",
    },
    {
      name: "Priya Saxena",
      fatherName: "Ashok Saxena",
      voterId: "VWX3697412",
      gender: "Female",
      dob: "02-12-2003",
    },
    {
      name: "Rohan Malhotra",
      fatherName: "Deepak Malhotra",
      voterId: "YZA9873214",
      gender: "Male",
      dob: "03-12-2003",
    },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <ArrowBackIcon
          sx={{ mr: 2, cursor: "pointer" }}
          onClick={() => navigate(-1)}
        />
        <Typography variant="h4" component="h1">
          How to Use the Application
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Overview
        </Typography>
        <Typography paragraph>
          This application helps officials manage and verify voters during an
          election. You can:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <CloudUploadIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Upload voter data using Excel" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <PersonIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Add individual voters manually" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CameraAltIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Verify voters by scanning their ID cards" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <HowToVoteIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Mark voters as 'voted' to prevent duplicate voting" />
          </ListItem>
        </List>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom color="primary">
          <CloudUploadIcon sx={{ verticalAlign: "middle", mr: 1 }} />
          Uploading Voter Data via Excel
        </Typography>

        <Typography paragraph>
          To upload multiple voters at once, prepare an Excel file (.xlsx or
          .xls) with the following columns:
        </Typography>

        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Name
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Father's Name
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Voter Id
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Gender
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Date of Birth
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {excelSampleData.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{
                    "&:nth-of-type(odd)": {
                      bgcolor: theme.palette.action.hover,
                    },
                  }}
                >
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.fatherName}</TableCell>
                  <TableCell>{row.voterId}</TableCell>
                  <TableCell>{row.gender}</TableCell>
                  <TableCell>{row.dob}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Steps to upload:
        </Typography>
        <Stepper activeStep={-1} orientation="vertical" sx={{ mb: 2 }}>
          <Step>
            <StepLabel>Go to the "Voters" tab</StepLabel>
          </Step>
          <Step>
            <StepLabel>Click on "Upload Excel" button</StepLabel>
          </Step>
          <Step>
            <StepLabel>Select your prepared Excel file</StepLabel>
          </Step>
          <Step>
            <StepLabel>Wait for the upload to complete</StepLabel>
          </Step>
        </Stepper>

        <Typography paragraph>
          <b>Note:</b> Make sure the column names match exactly as shown above.
          The Date of Birth should be in DD-MM-YYYY format.
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom color="primary">
          <CameraAltIcon sx={{ verticalAlign: "middle", mr: 1 }} />
          Verifying Voters
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            mb: 3,
          }}
        >
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Step 1: Capture ID
              </Typography>
              <Typography paragraph>
                On the "Verify" tab, position the voter's ID card in front of
                the camera and tap the "Capture" button.
              </Typography>
              <Typography paragraph color="text.secondary">
                Ensure the ID card is clearly visible and all text is readable.
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Step 2: Verify
              </Typography>
              <Typography paragraph>
                After capturing, tap the "Verify" button to search for the voter
                in the database.
              </Typography>
              <Typography paragraph color="text.secondary">
                The system will extract information from the ID and match it
                with existing records.
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Step 3: Review Results
              </Typography>
              <Typography paragraph>
                If found, the voter details will be displayed. If not, you'll
                see a "Not Verified" message.
              </Typography>
              <Typography paragraph color="text.secondary">
                For unverified voters, check with an administrator or try adding
                them manually.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom color="primary">
          <HowToVoteIcon sx={{ verticalAlign: "middle", mr: 1 }} />
          Marking Voters as Voted
        </Typography>

        <Typography paragraph>
          After verifying a voter, you can mark them as "voted" to prevent
          duplicate voting:
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
          }}
        >
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                For Verified Voters
              </Typography>
              <Typography paragraph>
                When a voter is verified through ID scanning, you'll see a "Mark
                as Voted" button if they haven't voted yet.
              </Typography>
              <Typography paragraph>
                Click this button to update their status.
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                From Voters List
              </Typography>
              <Typography paragraph>
                You can also view all voters from the "Voters" tab.
              </Typography>
              <Typography paragraph>
                Each voter entry shows their current voting status. Pending
                voters can be marked as voted after verification.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Paper>
    </Container>
  );
};

export default HelpPage;
