import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  //  Still checking auth? Show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  //  Not logged in? Redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  //  Check if user's role is allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Wrong role? Redirect to their correct dashboard
    return <Navigate to={user.role === 'manager' ? '/manager' : '/captain'} replace />;
  }

  // All checks passed! Show the protected component
  return children;
};

export default ProtectedRoute;
