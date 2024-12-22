import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Admin from '../pages/Admin';

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<Admin />} />
      {/* Add more admin routes as needed */}
    </Routes>
  );
};

export default AdminRoutes;
