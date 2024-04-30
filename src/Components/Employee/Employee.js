import React from 'react';
import { Link } from 'react-router-dom';

function Employee({ employee }) {
  return (
    <div>
      <h2>{employee.name}</h2>
      <Link to={`/profile/${employee.id}`}>View Profile</Link>
    </div>
  );
}

export default Employee;
