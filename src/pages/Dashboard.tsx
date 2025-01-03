import React from 'react';
import { useAuthStore } from '../stores/authStore';

const Dashboard: React.FC = () => {
  const { userProfile } = useAuthStore();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome, {userProfile?.email}</p>
    </div>
  );
};

export default Dashboard;
