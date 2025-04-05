import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router";
import {  toast } from "react-toastify";


const LoginPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleLogin = async(e) =>{
      e.preventDefault()
      if(formData.email==='' || formData.password===''){
        toast.error('fields cannot be empty')
        return
      }
      try {
        const response = await fetch('http://localhost:8000/auth/login/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if(response.ok){
          localStorage.setItem('authToken',data.access)
          localStorage.setItem('refreshToken',data.refresh)
          localStorage.setItem('role',data.role)
          navigate('/')
        }
        else{
          toast.error(data.error)
        }
      } catch (error) {
        toast.error('Error during login:', error);
      }
    }

  useEffect(() => {
        const token = localStorage.getItem("authToken");
    
        if (token) {
          navigate("/");
        }
      }, []);

  return (
    <div className="container">
      <div className="card animate-fade-in">
        <h2 className="preview-title" style={{ textAlign: "center" }}>
          Login
        </h2>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "2rem",
            flexDirection: "column",
          }}
        >
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your email id"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your Password"
            />
          </div>
          <button
            className="button button-primary"
            onClick={handleLogin}
            style={{ margin: "auto" }}
          >
            Login
          </button>
          <label className="redirect">New Here? <Link to="/signup">Signup</Link>
          </label>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;