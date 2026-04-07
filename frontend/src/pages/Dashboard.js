import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin/analytics');
    } else {
      navigate('/user-dashboard');
    }
  }, [user, navigate]);

  return null;
};

export default Dashboard;
