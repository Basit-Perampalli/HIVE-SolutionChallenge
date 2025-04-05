import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';


const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    cpassword: ''

  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSignup = async(e) =>{
    e.preventDefault()
    if(formData.email==='' || formData.password==='' || formData.cpassword===''){
      toast.error('fields cannot be empty')
    }
    if(formData.password!==formData.cpassword){
      toast.error('Both password must be same')
    }
    const email = formData.email
    const password = formData.password
    try {
      const response = await fetch('http://localhost:8000/auth/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({email,password}),
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
      toast.error('Error during signup:', error);
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
        <h2 className="preview-title" style={{ textAlign: 'center' }}>
          Signup
        </h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem',flexDirection:"column" }}>
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
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="cpassword"
              value={formData.cpassword}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Re-enter Password"
            />
          </div>
          <button 
              className="button button-primary" 
              onClick={handleSignup} 
              style={{ margin: 'auto' }}
            >
              Signup
            </button>
            <label className="redirect">Already have an account? <Link to="/login">Login</Link>
          </label>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default SignupPage;