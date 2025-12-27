import { useContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { fetchVessels, updateVessel } from "../store/slices/vesselSlice";
import { fetchCaptains } from "../store/slices/userSlice";
import {
  Ship,
  Anchor,
  AlertCircle,
  Loader2,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";

const ManagerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { vessels, loading: vesselsLoading } = useSelector(
    (state) => state.vessels
  );
  const { captains, loading: captainsLoading } = useSelector(
    (state) => state.users
  );

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignData, setAssignData] = useState({ vesselId: "", captainId: "" });
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchVessels());
    dispatch(fetchCaptains());
  }, [dispatch]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const stats = [
    {
      label: "Total Vessels",
      value: vessels.length.toString(),
      icon: <Ship className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Total Captains",
      value: captains.length.toString(),
      icon: <Anchor className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Unassigned Vessels",
      value: vessels.filter((v) => !v.captainId || v.captainId === null).length.toString(),
      icon: <AlertCircle className="w-6 h-6" />,
      color: "from-orange-500 to-orange-600",
    },
  ];

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignData.vesselId || !assignData.captainId) {
      setAssignError("Please select both vessel and captain");
      return;
    }

    try {
      setAssigning(true);
      setAssignError("");
      await dispatch(
        updateVessel({
          id: assignData.vesselId,
          updates: { captainId: assignData.captainId },
        })
      ).unwrap();

      setAssignData({ vesselId: "", captainId: "" });
      setShowAssignModal(false);
    } catch (error) {
      setAssignError(error || "Failed to assign captain");
    } finally {
      setAssigning(false);
    }
  };

  const getCaptainName = (captainId) => {
    if (!captainId) return "Unassigned";

    // Handle if captainId is populated object or just ID string
    const captainIdStr =
      typeof captainId === "object" ? captainId._id : captainId;

    const captain = captains.find((c) => c._id === captainIdStr);
    return captain ? captain.name : "Unassigned";
  };

  if (vesselsLoading || captainsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 📖 NAVBAR */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                <Ship className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  SmartShip Hub
                </h1>
                <p className="text-xs text-gray-500">Manager Portal</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
                <User className="w-5 h-5 text-gray-600" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  Manager
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <User className="w-5 h-5 text-gray-600" />
                <div className="text-sm flex-1">
                  <p className="font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  Manager
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* 📖 MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}! 👋
          </h2>
          <p className="text-gray-600 mt-2">
            Manage your fleet and assign captains to vessels.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg`}
                >
                  {stat.icon}
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <button
            onClick={() => setShowAssignModal(true)}
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
          >
            <div className="text-3xl mb-3">👨‍✈️</div>
            <h4 className="text-lg font-bold mb-2">Assign Captain</h4>
            <p className="text-emerald-100 text-sm">
              Assign vessels to captains
            </p>
          </button>
        </div>

        {/* Vessels & Captains Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Unassigned Vessels */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-yellow-50">
              <h3 className="text-lg font-bold text-gray-900">
                🛳️ Unassigned Vessels ({vessels.filter((v) => !v.captainId || v.captainId === null).length})
              </h3>
            </div>
            <div className="p-6">
              {vessels.filter((v) => !v.captainId || v.captainId === null).length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  All vessels assigned! 🎉
                </p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {vessels
                    .filter((v) => !v.captainId || v.captainId === null)
                    .map((vessel) => (
                      <div
                        key={vessel._id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">
                            {vessel.name}
                          </p>
                          <p className="text-sm text-gray-500">{vessel.mmsi}</p>
                        </div>
                        <button
                          onClick={() => {
                            setAssignData((prev) => ({
                              ...prev,
                              vesselId: vessel._id,
                            }));
                            setShowAssignModal(true);
                          }}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Assign
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Captains List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <h3 className="text-lg font-bold text-gray-900">
                ⚓ Captains ({captains.length})
              </h3>
            </div>
            <div className="p-6 max-h-64 overflow-y-auto">
              {captains.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No captains registered yet
                </p>
              ) : (
                captains.map((captain) => {
                  const assignedVessel = vessels.find((v) => {
                    const captainIdStr = typeof v.captainId === "object" ? v.captainId._id : v.captainId;
                    return captainIdStr === captain._id;
                  });
                  return (
                    <div
                      key={captain._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-3 last:mb-0"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {captain.name}
                        </p>
                        <p className="text-xs text-gray-500">{captain.email}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          assignedVessel
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {assignedVessel ? assignedVessel.name : "No Vessel"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Vessels Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">
              All Vessels ({vessels.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Vessel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    MMSI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Captain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vessels.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No vessels found. Create vessels using Postman.
                    </td>
                  </tr>
                ) : (
                  vessels.map((vessel) => (
                    <tr
                      key={vessel._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">
                          {vessel.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {vessel.mmsi}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {getCaptainName(vessel.captainId)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                            vessel.status === "active"
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : "bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              vessel.status === "active"
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`}
                          ></span>
                          {vessel.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setAssignData((prev) => ({
                              ...prev,
                              vesselId: vessel._id,
                            }));
                            setShowAssignModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
                        >
                          {vessel.captainId ? "Reassign" : "Assign"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Assign Captain
                </h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4">
              {assignError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-red-700">{assignError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Vessel
                </label>
                <select
                  name="vesselId"
                  value={assignData.vesselId}
                  onChange={(e) =>
                    setAssignData((prev) => ({
                      ...prev,
                      vesselId: e.target.value,
                    }))
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                >
                  <option value="">Choose vessel...</option>
                  {vessels.map((vessel) => (
                    <option key={vessel._id} value={vessel._id}>
                      {vessel.name} ({vessel.mmsi})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Captain
                </label>
                <select
                  name="captainId"
                  value={assignData.captainId}
                  onChange={(e) =>
                    setAssignData((prev) => ({
                      ...prev,
                      captainId: e.target.value,
                    }))
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                >
                  <option value="">Choose captain...</option>
                  {captains.map((captain) => (
                    <option key={captain._id} value={captain._id}>
                      {captain.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {assigning ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Assigning...
                    </span>
                  ) : (
                    "Assign Captain"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
