import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TechnicianPage from '../pages/Technician';

const TechnicianRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<TechnicianPage />} />
      {/* Add more technician routes as needed */}
    </Routes>
  );
};

export default TechnicianRoutes;
