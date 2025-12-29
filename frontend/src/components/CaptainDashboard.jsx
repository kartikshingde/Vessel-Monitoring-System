import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { LogOut, User, Menu, X } from "lucide-react";
import api from "../utils/api";

const CaptainDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [vessel, setVessel] = useState(null);
  const [loadingVessel, setLoadingVessel] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [recentReports, setRecentReports] = useState([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    averageSpeed: "",
    distanceSinceLastNoon: "",
    fuelConsumedSinceLastNoon: "",
    fuelRob: "",
    weatherSummary: "",
    remarks: "",
  });

  // 1) Load captain's vessel (backend filters by role)
  useEffect(() => {
    const fetchVessel = async () => {
      try {
        setLoadingVessel(true);
        const { data } = await api.get("/vessels");
        const vessels = data.data || [];
        setVessel(vessels[0] || null);
        setLoadingVessel(false);
      } catch (err) {
        console.error("Error fetching captain vessel:", err);
        setLoadingVessel(false);
      }
    };
    fetchVessel();
  }, []);

  // 2) Load recent noon reports when vessel is known
  useEffect(() => {
    const fetchReports = async () => {
      if (!vessel?._id) return;
      try {
        setLoadingReports(true);
        const { data } = await api.get(`/vessels/${vessel._id}/noon-reports`);
        setRecentReports(data.data || []);
        setLoadingReports(false);
      } catch (err) {
        console.error("Error fetching noon reports:", err);
        setLoadingReports(false);
      }
    };
    fetchReports();
  }, [vessel]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormError("");
    setFormSuccess("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vessel?._id) {
      setFormError("No vessel found for this captain.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");
      setFormSuccess("");

      const payload = {
        position: {
          latitude: vessel.currentPosition?.latitude || vessel.position?.lat || 0,
          longitude: vessel.currentPosition?.longitude || vessel.position?.lng || 0,
        },
        averageSpeed: formData.averageSpeed ? Number(formData.averageSpeed) : undefined,
        distanceSinceLastNoon: formData.distanceSinceLastNoon ? Number(formData.distanceSinceLastNoon) : undefined,
        fuelConsumedSinceLastNoon: formData.fuelConsumedSinceLastNoon ? Number(formData.fuelConsumedSinceLastNoon) : undefined,
        fuelRob: formData.fuelRob ? Number(formData.fuelRob) : undefined,
        weather: {
          remarks: formData.weatherSummary || "",
        },
        remarks: formData.remarks || "",
      };

      const { data } = await api.post(`/vessels/${vessel._id}/noon-report`, payload);

      setFormSuccess("Noon report submitted successfully!");
      setFormData({
        averageSpeed: "",
        distanceSinceLastNoon: "",
        fuelConsumedSinceLastNoon: "",
        fuelRob: "",
        weatherSummary: "",
        remarks: "",
      });

      // Add to recent reports
      setRecentReports((prev) => [data.data, ...prev]);

      setSubmitting(false);
      setTimeout(() => {
        setShowReportForm(false);
        setFormSuccess("");
      }, 2000);
    } catch (err) {
      console.error("Submit noon report error:", err);
      setFormError(err.response?.data?.message || "Failed to submit noon report.");
      setSubmitting(false);
    }
  };

  const formatCoords = () => {
    if (vessel?.currentPosition) {
      return `${vessel.currentPosition.latitude.toFixed(4)}°, ${vessel.currentPosition.longitude.toFixed(4)}°`;
    }
    if (vessel?.position) {
      return `${vessel.position.lat.toFixed(4)}°, ${vessel.position.lng.toFixed(4)}°`;
    }
    return "N/A";
  };

  const formatDateTime = (d) =>
    d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "-";

  if (loadingVessel) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your vessel...</p>
        </div>
      </div>
    );
  }

  if (!vessel) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-2xl">
                  🚢
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">SmartShip Hub</h1>
                  <p className="text-xs text-gray-500">Captain Portal</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* No Vessel State */}
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <div className="bg-white rounded-2xl shadow-lg p-12 max-w-lg text-center">
            <div className="w-20 h-20 bg-linear-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              🚢
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              No Vessel Assigned
            </h2>
            <p className="text-gray-600 mb-6">
              Contact your fleet manager to assign a vessel to your account.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Waiting for assignment
            </div>
          </div>
        </div>
      </div>
    );
  }

  const vesselInfo = {
    name: vessel.name,
    status: vessel.status || "active",
    currentSpeed: `${vessel.speed ?? 0} knots`,
    location: vessel.destination || "Underway",
    coordinates: formatCoords(),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-2xl">
                🚢
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SmartShip Hub</h1>
                <p className="text-xs text-gray-500">Captain Portal</p>
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
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                  Captain
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
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome, Captain {user?.name}! ⚓
          </h2>
          <p className="text-gray-600 mt-2">
            Vessel: <span className="font-mono font-semibold">{vessel.name}</span>
          </p>
          <p className="text-gray-600">
            MMSI: <span className="font-mono font-semibold">{vessel.mmsi}</span>
          </p>
        </div>

        {/* Vessel Info Card */}
        <div className="bg-linear-to-br from-blue-600 to-cyan-500 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">{vesselInfo.name}</h3>
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full animate-pulse ${
                    vesselInfo.status === "active" ? "bg-green-400" : "bg-gray-300"
                  }`}
                ></span>
                <span className="text-blue-100 font-medium">{vesselInfo.status}</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center text-4xl">
              🚢
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-blue-100 text-sm mb-1">Current Speed</p>
              <p className="text-2xl font-bold">{vesselInfo.currentSpeed}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">Destination</p>
              <p className="text-2xl font-bold">{vesselInfo.location || "—"}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">Coordinates</p>
              <p className="text-xl font-mono font-semibold">{vesselInfo.coordinates}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => setShowReportForm((prev) => !prev)}
            className="bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl mb-3">📝</div>
                <h4 className="text-xl font-bold mb-2">Submit Noon Report</h4>
                <p className="text-blue-100 text-sm">
                  Report daily vessel status and operations
                </p>
              </div>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          <button
            className="bg-white border-2 border-gray-200 hover:border-blue-500 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all text-left group"
            onClick={() => navigate("/map")}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl mb-3">🗺️</div>
                <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  View Position
                </h4>
                <p className="text-gray-600 text-sm">Check vessel location on map</p>
              </div>
              <svg
                className="w-8 h-8 text-gray-400 group-hover:text-blue-600 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        {/* Noon Report Form */}
        {showReportForm && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Noon Report Form</h3>
              <button
                onClick={() => setShowReportForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {formError && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="mb-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                {formSuccess}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Average Speed (knots)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="averageSpeed"
                    value={formData.averageSpeed}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder={vessel.speed?.toString() || "18"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Distance Since Last Noon (nm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="distanceSinceLastNoon"
                    value={formData.distanceSinceLastNoon}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="245"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fuel Consumed Since Last Noon
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="fuelConsumedSinceLastNoon"
                    value={formData.fuelConsumedSinceLastNoon}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="156"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fuel Remaining (ROB)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="fuelRob"
                    value={formData.fuelRob}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="72"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Weather Summary
                </label>
                <textarea
                  rows="3"
                  name="weatherSummary"
                  value={formData.weatherSummary}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder="Clear skies, light winds from NE, sea state calm..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Remarks (Optional)
                </label>
                <textarea
                  rows="2"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder="Any additional notes..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Noon Report"}
              </button>
            </form>
          </div>
        )}

        {/* Recent Reports */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-linear-to-r from-blue-50 to-cyan-50">
            <h3 className="text-lg font-bold text-gray-900">Recent Noon Reports</h3>
            <p className="text-sm text-gray-600 mt-1">Your submission history</p>
          </div>

          {loadingReports ? (
            <div className="p-6 text-center text-gray-500">Loading reports...</div>
          ) : recentReports.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No reports yet. Submit your first noon report.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Distance (nm)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Fuel Used
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      ROB
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentReports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDateTime(report.reportedAt)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {report.distanceSinceLastNoon ?? "-"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {report.fuelConsumedSinceLastNoon ?? "-"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {report.fuelRob ?? "-"}
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaptainDashboard;
