import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Ship, User as UserIcon } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Ship className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">SmartShip Hub</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-gray-600" />
              <span className="text-gray-600 font-medium">{user?.name}</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                {user?.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">✅ Authentication Working!</h2>
          <div className="space-y-2 text-gray-700">
            <p><strong>User:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role}</p>
            <p><strong>ID:</strong> {user?.id}</p>
          </div>
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-medium">
              🎉 Phase 1 & 2 Complete: Login/Register/Logout working with cookie auth!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
