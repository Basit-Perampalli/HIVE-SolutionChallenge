import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import profilepic from "../../assets/Logo/drdo_round_logo.jpg";
import "./NavBar.css";
import { useMediaQuery, useTheme } from "@mui/material";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import HelpIcon from "@mui/icons-material/Help";

const NavBar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login", { replace: true });
  };

  const navigateToVoterVerification = () => {
    navigate("/voter");
  };

  const navigateToHelp = () => {
    navigate("/help");
  };

  const isVoterVerificationActive = location.pathname === "/voter";
  const isHelpActive = location.pathname === "/help";

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <span className="navbar-title">DocLens</span>
      </div>
      <div className="navbar-nav-center">
        {isMobile && (
          <button
            className={`nav-button ${
              isVoterVerificationActive ? "nav-button-active" : ""
            }`}
            onClick={navigateToVoterVerification}
          >
            <HowToVoteIcon sx={{ mr: 0.5 }} />
            Voter Verification
          </button>
        )}
        <button
          className={`nav-button ${isHelpActive ? "nav-button-active" : ""}`}
          onClick={navigateToHelp}
        >
          <HelpIcon sx={{ mr: 0.5 }} />
          Help
        </button>
      </div>
      <div className="navbar-links">
        <div className="profile-container" ref={dropdownRef}>
          <img
            src={profilepic}
            alt="Profile"
            className="profile-img"
            onClick={toggleDropdown}
            style={{ cursor: "pointer" }}
          />
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <button className="dropdown-item">Profile</button>
              <button className="dropdown-item">Settings</button>
              <button
                className="dropdown-item logout-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
