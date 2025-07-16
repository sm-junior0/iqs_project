import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import TrainerDashboard from './TrainerDashboard';
import EvaluatorDashboard from './EvaluatorDashboard';
import SchoolDashboard from './SchoolDashboard';
import { useLocation } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Support /dashboard/trainer and /dashboard/admin subroutes
  if (location.pathname === '/dashboard/trainer') {
    return <TrainerDashboard />;
  }
  if (location.pathname === '/dashboard/admin') {
    return <AdminDashboard />;
  }
  if (location.pathname === '/dashboard/evaluator') {
    return <EvaluatorDashboard />;
  }
  if (location.pathname === '/dashboard/school') {
    return <SchoolDashboard />;
  }

  // Default: role-based dashboard
  if (user?.accountType === 'trainer') {
    return <TrainerDashboard />;
  }
  if (
    user?.accountType === 'admin' ||
    user?.accountType === 'institution' ||
    user?.accountType === 'evaluator'
  ) {
    return <AdminDashboard />;
  }

  return <div className="p-8 text-center text-gray-600">No dashboard available for your account type.</div>;
};

export default Dashboard;