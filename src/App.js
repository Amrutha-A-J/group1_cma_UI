import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginComponent from './Components/Login/LoginComponent';
import SignUpComponent from './Components/Signup/SignupComponent';
import NavbarComponent from './Components/Navbar/NavbarComponent';
import HomeComponent from './Components/Home/HomeComponent';
import NewStaffComponent from './Components/NewStaff/NewStaffComponent';
import EmployeeProfile from './Components/EmployeeProfile/EmployeeProfile';
import PayrollComponent from './Components/PayrollComponent/PayrollComponent';

function App() {

  return (
    <Router>
      <NavbarComponent />
      <Routes>
        <Route path="/" element={<LoginComponent />} />
        <Route path="/signup" element={<SignUpComponent />} />
        <Route path="/home" element={<HomeComponent />} />
        <Route path="/approve-new-staff" element={<NewStaffComponent />} />

        {/* Use PrivateRoute for restricted pages */}
        <Route
          path="/profile/:id"
          element={<EmployeeProfile />}
        />
        <Route
          path="/profile/:id/payroll"
          element={<PayrollComponent />}
        />
      </Routes>
    </Router>
  );
}

export default App;

