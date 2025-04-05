import React, { useState, useEffect } from 'react';
import './admin-dashboard.css';

// Custom Table Component
const Table = ({ children }) => (
  <table className="admin-table">
    {children}
  </table>
);

// Custom Card Components
const Card = ({ children }) => (
  <div className="admin-card">
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div className="card-header">
    {children}
  </div>
);

const CardTitle = ({ children }) => (
  <h2 className="card-title">
    {children}
  </h2>
);

const CardContent = ({ children }) => (
  <div className="card-content">
    {children}
  </div>
);

// Custom Badge Component
const Badge = ({ children, variant }) => {
  const badgeClass = variant === 'success' ? 'badge-success' : 'badge-error';
  return (
    <span className={`badge ${badgeClass}`}>
      {children}
    </span>
  );
};

const AdminDashboard = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    // Simulated API response
    const mockData = [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        personalVerification: true,
        educationalVerification: {
          class10: true,
          class12: true,
          bachelors: false
        }
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        personalVerification: false,
        educationalVerification: {
          class10: true,
          class12: true,
          bachelors: true
        }
      }
    ];
    
    setApplications(mockData);
  }, []);

  const getEducationalScore = (verifications) => {
    const verified = Object.values(verifications).filter(v => v).length;
    return `${verified}/3`;
  };

  return (
    <div className="admin-dashboard">
      <Card>
        <CardHeader>
          <CardTitle>Form Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="table-container">
            <Table>
              <thead>
                <tr>
                  <th>Sr. No</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Personal Details</th>
                  <th>Educational Details</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app, index) => (
                  <tr key={app.id}>
                    <td>{index + 1}</td>
                    <td>{app.name}</td>
                    <td>{app.email}</td>
                    <td>
                      <Badge variant={app.personalVerification ? "success" : "error"}>
                        {app.personalVerification ? "1/1" : "0/1"}
                      </Badge>
                    </td>
                    <td>
                      <Badge 
                        variant={getEducationalScore(app.educationalVerification) === "3/3" 
                          ? "success" 
                          : "error"
                        }
                      >
                        {getEducationalScore(app.educationalVerification)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;