import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import DeveloperModeIcon from "@mui/icons-material/DeveloperMode";
import "./MobileNotification.css";

const MobileNotification = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleContinue = () => {
    navigate("/voter");
  };

  return (
    <div className="mobile-notification-container">
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            textAlign: "center",
            backgroundColor: "#f9f9f9",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 3,
              color: theme.palette.primary.main,
            }}
            className={!isMobile ? "pulse-animation" : ""}
          >
            {isMobile ? (
              <PhoneAndroidIcon sx={{ fontSize: 60 }} />
            ) : (
              <DesktopWindowsIcon sx={{ fontSize: 60 }} />
            )}
          </Box>

          <Typography variant="h4" component="h1" gutterBottom>
            {isMobile ? "Perfect!" : "Mobile Optimized App"}
          </Typography>

          {isMobile ? (
            <Typography variant="body1" paragraph>
              You're accessing DocLens from a mobile device. All features will
              work optimally on your device.
            </Typography>
          ) : (
            <>
              <Typography variant="body1" paragraph>
                This application is designed for mobile devices and provides the
                best experience on smartphones.
              </Typography>
              <Typography variant="body1" paragraph>
                For the best experience, please:
              </Typography>
              <Box sx={{ mb: 3, textAlign: "left", pl: 4 }}>
                <Typography
                  variant="body1"
                  sx={{ display: "flex", alignItems: "center", mb: 1 }}
                >
                  <PhoneAndroidIcon sx={{ mr: 1 }} />
                  Open this website on your mobile device
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <DeveloperModeIcon sx={{ mr: 1 }} />
                  Or use browser inspect mode with mobile device emulation
                </Typography>
              </Box>
              <Typography
                variant="body1"
                paragraph
                sx={{ fontStyle: "italic", mt: 2 }}
              >
                Some features may be limited or not optimized for desktop
                viewing.
              </Typography>
            </>
          )}

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleContinue}
            sx={{ mt: 2 }}
          >
            Continue to Application
          </Button>
        </Paper>
      </Container>
    </div>
  );
};

export default MobileNotification;
