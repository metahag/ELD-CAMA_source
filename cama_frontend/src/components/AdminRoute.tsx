import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/authContext';

const AdminRoute = () => {
  const { session, isAdmin } = useContext(AuthContext);

  if (!session) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    return <Navigate to="/not-authorized" />;
  }

  return <Outlet />;
};

export default AdminRoute;