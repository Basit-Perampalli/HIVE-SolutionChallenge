import React from 'react';
import FileUploadField from './FileUploadField';

const PersonalDetails = ({ formData, handleInputChange, handleVerify }) => {
  return (
    <div className="animate-fade-in">
      <div className="grid grid-2">
        <div className="form-group">
          <label className="form-label">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter your full name"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter your phone number"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Adhaar Number</label>
          <input
            type="text"
            name="adhaar"
            value={formData.adhaar}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter your Adhaar number"
          />
        </div>

        <div className="form-group">
          <label className="form-label">House Name/Number</label>
          <input
            type="text"
            name="housenumber"
            value={formData.housenumber}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter your House Name/Number"
          />
        </div>

        <div className="form-group">
          <label className="form-label">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter your City Name"
          />
        </div>

        <div className="form-group">
          <label className="form-label">State</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter your State"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Pincode</label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter your Pincode"
          />
        </div>
        

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <FileUploadField
            label="Upload Adhaar Card"
            name="adhaarFile"
            file={formData.adhaarFile}
            verified={formData.adhaarVerified}
            handleInputChange={handleInputChange}
            handleVerify={() => handleVerify('adhaar')}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalDetails;