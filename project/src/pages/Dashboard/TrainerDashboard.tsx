import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  FileText,
  Bell,
  Settings,
  Search,
  TrendingUp,
  X,
  ChevronDown,
  Menu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
// import { useAuth } from '../../context/AuthContext';

interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: string;
}

// Update TrainingSession interface
interface TrainingSession {
  id: string;
  title: string;
  location: string;
  joining_date: string;
  duration: string;
}

interface Report {
  id: string;
  reportName: string;
  schoolLocation: string;
  uploadDate: string;
}

// Update AttendanceRecord interface to match backend
interface AttendanceRecord {
  id: string;
  session_id: string;
  report_path: string;
}

interface Notification {
  id: string;
  message: string;
  timestamp: string;
}

const TrainerDashboard: React.FC = () => {
  // const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [showCreateSessionModal, setShowCreateSessionModal] =
    useState<boolean>(false);
  const [showAddAttendanceModal, setShowAddAttendanceModal] =
    useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Remove mock data for stats and trainingSessions
  const [stats, setStats] = useState<StatCard[] | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>(
    []
  );
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  // Remove mock attendanceRecords, add state for attendance
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  // Add state for attendance statistics
  const [attendanceStats, setAttendanceStats] = useState<any>(null);
  const [attendanceStatsLoading, setAttendanceStatsLoading] = useState(false);
  const [attendanceStatsError, setAttendanceStatsError] = useState<
    string | null
  >(null);

  // Add state for modals and session form
  const [editSession, setEditSession] = useState<TrainingSession | null>(null);
  // Update sessionForm and modal to use only these fields
  const [sessionForm, setSessionForm] = useState({
    title: "",
    location: "",
    joining_date: "",
    duration: "",
  });
  const [sessionFormError, setSessionFormError] = useState<string | null>(null);
  const [sessionFormLoading, setSessionFormLoading] = useState(false);

  const [viewSession, setViewSession] = useState<TrainingSession | null>(null);
  const [viewSessionModalOpen, setViewSessionModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  // Filtered sessions for search
  const filteredSessions = trainingSessions.filter((session) => {
    const term = searchTerm.toLowerCase();
    return (
      session.title.toLowerCase().includes(term) ||
      session.location.toLowerCase().includes(term) ||
      session.joining_date.toLowerCase().includes(term) ||
      session.duration.toLowerCase().includes(term)
    );
  });

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/trainer/dashboard`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch dashboard stats");
        const data = await res.json();
        setStats([
          {
            title: "Total Trainings",
            value: (data.sessions?.length ?? 0).toString(),
            change: "15%",
            icon: "$",
          },
          {
            title: "Total Reports",
            value: (data.reports?.length ?? 0).toString(),
            change: "15%",
            icon: "$",
          },
          {
            title: "Total Participants",
            value: (data.attendance?.length ?? 0).toString(),
            change: "15%",
            icon: "$",
          },
        ]);
      } catch (err: any) {
        setStatsError(err.message || "Error loading stats");
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch training sessions
  useEffect(() => {
    const fetchSessions = async () => {
      setSessionsLoading(true);
      setSessionsError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/trainer/sessions`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch sessions");
        const data = await res.json();
        setTrainingSessions(data.sessions || []);
      } catch (err: any) {
        setSessionsError(err.message || "Error loading sessions");
      } finally {
        setSessionsLoading(false);
      }
    };
    fetchSessions();
  }, []);

  // Fetch attendance records from backend (use /api/trainer/attendance)
  useEffect(() => {
    const fetchAttendance = async () => {
      setAttendanceLoading(true);
      setAttendanceError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/trainer/attendance`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch attendance records");
        const data = await res.json();
        setAttendanceRecords(data.attendance || []);
      } catch (err: any) {
        setAttendanceError(err.message || "Error loading attendance records");
      } finally {
        setAttendanceLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  // Fetch attendance statistics for charts
  useEffect(() => {
    const fetchAttendanceStats = async () => {
      setAttendanceStatsLoading(true);
      setAttendanceStatsError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/trainer/attendance-stats`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch attendance statistics");
        const data = await res.json();
        setAttendanceStats(data);
      } catch (err: any) {
        setAttendanceStatsError(
          err.message || "Error loading attendance statistics"
        );
      } finally {
        setAttendanceStatsLoading(false);
      }
    };
    fetchAttendanceStats();
  }, []);

  const reports: Report[] = Array(5)
    .fill(null)
    .map((_, i) => ({
      id: `report-${i}`,
      reportName: "Kingston School Report",
      schoolLocation: "Nairobi Kenya",
      uploadDate: "10/5/2025",
    }));

  const notifications: Notification[] = Array(9)
    .fill(null)
    .map((_, i) => ({
      id: `notification-${i}`,
      message: "You have updated the kingston highschool report",
      timestamp: "30 min ago",
    }));

  // Handle view session
  const handleView = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trainer/sessions/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch session");
      const data = await res.json();
      setViewSession(data.session || data);
      setViewSessionModalOpen(true);
    } catch (err: any) {
      alert(err.message || "Error viewing session");
    }
  };

  // Handle delete session
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this session?"))
      return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trainer/sessions/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to delete session");
      // Refresh sessions
      setTrainingSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.message || "Error deleting session");
    }
  };

  // Handle open update modal
  const handleUpdate = (id: string) => {
    const session = trainingSessions.find((s) => s.id === id);
    if (session) {
      setEditSession(session);
      setSessionForm({
        title: session.title,
        location: session.location,
        joining_date: session.joining_date,
        duration: session.duration,
      });
      setShowCreateSessionModal(true);
    }
  };

  // Handle open create modal
  const handleCreate = () => {
    setEditSession(null);
    setSessionForm({ title: "", location: "", joining_date: "", duration: "" });
    setShowCreateSessionModal(true);
  };

  // Handle submit create/update session
  const handleSubmitSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setSessionFormLoading(true);
    setSessionFormError(null);
    try {
      const token = localStorage.getItem("token");
      const body = JSON.stringify({
        title: sessionForm.title,
        location: sessionForm.location,
        joining_date: sessionForm.joining_date,
        duration: sessionForm.duration,
      });
      let url = `${import.meta.env.VITE_API_URL}/api/trainer/manage-session`;
      let method: "POST" | "PUT" = "POST";
      if (editSession) {
        url = `${import.meta.env.VITE_API_URL}/api/trainer/sessions/${
          editSession.id
        }`;
        method = "PUT";
      }
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body,
      });
      if (!res.ok) throw new Error("Failed to save session");
      setShowCreateSessionModal(false);
      // Refresh sessions
      const sessionsRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trainer/sessions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const sessionsData = await sessionsRes.json();
      setTrainingSessions(sessionsData.sessions || []);
    } catch (err: any) {
      setSessionFormError(err.message || "Error saving session");
    } finally {
      setSessionFormLoading(false);
    }
  };

  // Implement handleDownload for sessions and reports
  const handleDownload = async (id: string, reportPath?: string) => {
    try {
      const token = localStorage.getItem("token");
      let url = reportPath
        ? `${import.meta.env.VITE_API_URL}/api/files/download/${id}`
        : `${import.meta.env.VITE_API_URL}/api/trainer/reports/${id}/download`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to download report");
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = reportPath
        ? reportPath.split("/").pop() || "report.pdf"
        : "report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      alert(err.message || "Error downloading report");
    }
  };

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "training", label: "Training", icon: GraduationCap },
    { id: "attendance", label: "Attendance", icon: Users },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // Mobile Card Component
  const MobileCard = ({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      className={`bg-white p-4 rounded-lg shadow-sm border space-y-3 ${className}`}
    >
      {children}
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Dashboard
        </h1>
        <button
          className="lg:hidden p-2 rounded-lg bg-[#1B365D] text-white"
          onClick={() => setSidebarOpen(true)}
          title="Open sidebar"
        >
          <Menu size={20} />
        </button>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {statsLoading ? (
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
            <p className="text-center text-gray-500">Loading stats...</p>
          </div>
        ) : statsError ? (
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
            <p className="text-center text-red-500">{statsError}</p>
          </div>
        ) : stats ? (
          stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp size={14} className="text-green-500 mr-1" />
                    <span className="text-xs sm:text-sm text-green-500">
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="bg-[#1B365D] text-white p-2 sm:p-3 rounded-lg">
                  <span className="text-sm sm:text-lg font-bold">
                    {stat.icon}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
            <p className="text-center text-gray-500">No stats available.</p>
          </div>
        )}
      </div>
      {/* Training Sessions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Training Sessions
            </h2>
            <button className="bg-[#1B365D] text-white px-4 py-2 rounded-lg text-sm font-medium w-full sm:w-auto">
              See All
            </button>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search session"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
              />
            </div>
            <select
              title="recent"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
            >
              <option>Latest</option>
            </select>
          </div>
        </div>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joining Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessionsLoading ? (
                <tr>
                  <td colSpan={4}>Loading...</td>
                </tr>
              ) : sessionsError ? (
                <tr>
                  <td colSpan={4} className="text-red-500">
                    {sessionsError}
                  </td>
                </tr>
              ) : (
                trainingSessions.slice(0, 3).map((session) => (
                  <tr key={session.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.joining_date}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      -
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Mobile Cards */}
        <div className="md:hidden p-4 space-y-4">
          {sessionsLoading ? (
            <MobileCard>
              <p className="text-center text-gray-500">Loading sessions...</p>
            </MobileCard>
          ) : sessionsError ? (
            <MobileCard>
              <p className="text-center text-red-500">{sessionsError}</p>
            </MobileCard>
          ) : (
            trainingSessions.slice(0, 3).map((session) => (
              <MobileCard key={session.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {session.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {session.joining_date}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Joining Date:</span>
                    <p className="font-medium">{session.joining_date}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <p className="font-medium">-</p>
                  </div>
                </div>
              </MobileCard>
            ))
          )}
        </div>
      </div>
      {/* Attendance Report Summary Chart */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Attendance Report Summary
        </h2>
        <div className="relative h-64">
          {attendanceStatsLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B365D]"></div>
              <span className="ml-2 text-gray-600">Loading chart...</span>
            </div>
          ) : attendanceStatsError ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-red-500">{attendanceStatsError}</span>
            </div>
          ) : attendanceStats ? (
            <>
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-md border">
                <div className="text-2xl font-bold text-gray-900">
                  {attendanceStats.totalAttendance || 0}
                </div>
                <div className="text-sm text-gray-500">Total Attendance</div>
              </div>
              <svg className="w-full h-full" viewBox="0 0 800 200">
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#1B365D" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#1B365D" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                {(() => {
                  const monthlyData = attendanceStats.monthlyStats || [];
                  const maxValue = Math.max(
                    ...monthlyData.map((d: any) => d.count),
                    1
                  );
                  const points = monthlyData
                    .map((data: any, index: number) => {
                      const x = 50 + (index * 700) / 11;
                      const y = 180 - (data.count / maxValue) * 120;
                      return `${x},${y}`;
                    })
                    .join(" ");

                  const areaPoints =
                    monthlyData
                      .map((data: any, index: number) => {
                        const x = 50 + (index * 700) / 11;
                        const y = 180 - (data.count / maxValue) * 120;
                        return `${x},${y}`;
                      })
                      .join(" ") +
                    ` ${50 + ((monthlyData.length - 1) * 700) / 11},200 50,200`;

                  return (
                    <>
                      <path
                        d={`M ${points}`}
                        stroke="#1B365D"
                        strokeWidth="3"
                        fill="none"
                      />
                      <path d={`M ${areaPoints}`} fill="url(#gradient)" />
                      {monthlyData.map((data: any, index: number) => {
                        const x = 50 + (index * 700) / 11;
                        const y = 180 - (data.count / maxValue) * 120;
                        return (
                          <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#1B365D"
                            stroke="white"
                            strokeWidth="2"
                          />
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-4 sm:px-12">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>July</span>
                <span>Aug</span>
                <span>Sept</span>
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
              </div>
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 py-2 sm:py-4">
                <span>
                  {Math.max(
                    ...(attendanceStats.monthlyStats || []).map(
                      (d: any) => d.count
                    ),
                    1
                  )}
                </span>
                <span>
                  {Math.round(
                    Math.max(
                      ...(attendanceStats.monthlyStats || []).map(
                        (d: any) => d.count
                      ),
                      1
                    ) * 0.75
                  )}
                </span>
                <span>
                  {Math.round(
                    Math.max(
                      ...(attendanceStats.monthlyStats || []).map(
                        (d: any) => d.count
                      ),
                      1
                    ) * 0.5
                  )}
                </span>
                <span>0</span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-500">
                No attendance data available
              </span>
            </div>
          )}
        </div>
      </div>
      {/* Recent Notifications */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Notification
            </h2>
            <select
              title="recent"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent w-full sm:w-auto"
            >
              <option>Today</option>
            </select>
          </div>
          <div className="mt-4">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search Recent Notification"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
              />
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          {notifications.slice(0, 2).map((notification) => (
            <div
              key={notification.id}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
            >
              <p className="text-sm text-gray-900">{notification.message}</p>
              <span className="text-sm text-gray-500">
                {notification.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTraining = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Training</h1>

      {/* Total Trainings Stat */}
      <div className="bg-white rounded-lg p-6 shadow-sm border max-w-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Trainings</p>
            <p className="text-2xl font-bold text-gray-900">
              {trainingSessions.length}
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-sm text-green-500">15%</span>
            </div>
          </div>
          <div className="bg-[#1B365D] text-white p-3 rounded-lg">
            <span className="text-lg font-bold">$</span>
          </div>
        </div>
      </div>

      {/* Training Sessions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Training Sessions
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={handleCreate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Create Session
              </button>
              <button className="bg-[#1B365D] text-white px-4 py-2 rounded-lg text-sm font-medium">
                See All
              </button>
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search session"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              title="recent"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
            >
              <option>Latest</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joining Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessionsLoading ? (
                <tr>
                  <td colSpan={5}>Loading...</td>
                </tr>
              ) : sessionsError ? (
                <tr>
                  <td colSpan={5} className="text-red-500">
                    {sessionsError}
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr key={session.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.joining_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleUpdate(session.id)}
                        className="bg-[#1B365D] text-white px-3 py-1 rounded text-sm hover:bg-[#2563EB] transition-colors"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleView(session.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(session.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        Delete
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
  );

  const renderAttendance = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>

      {/* Total Participants Stat */}
      <div className="bg-white rounded-lg p-6 shadow-sm border max-w-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Total Report Attendance
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {attendanceStats
                ? attendanceStats.totalAttendance
                : attendanceLoading
                ? "..."
                : 0}
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-sm text-green-500">15%</span>
            </div>
          </div>
          <div className="bg-[#1B365D] text-white p-3 rounded-lg">
            <span className="text-lg font-bold">$</span>
          </div>
        </div>
      </div>

      {/* Attendance Report Summary Chart */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Attendance Report Summary
        </h2>
        <div className="relative h-64">
          {attendanceStatsLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B365D]"></div>
              <span className="ml-2 text-gray-600">Loading chart...</span>
            </div>
          ) : attendanceStatsError ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-red-500">{attendanceStatsError}</span>
            </div>
          ) : attendanceStats ? (
            <>
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-md border">
                <div className="text-2xl font-bold text-gray-900">
                  {attendanceStats.totalAttendance || 0}
                </div>
                <div className="text-sm text-gray-500">Total Attendance</div>
              </div>
              <svg className="w-full h-full" viewBox="0 0 800 200">
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#1B365D" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#1B365D" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                {(() => {
                  const monthlyData = attendanceStats.monthlyStats || [];
                  const maxValue = Math.max(
                    ...monthlyData.map((d: any) => d.count),
                    1
                  );
                  const points = monthlyData
                    .map((data: any, index: number) => {
                      const x = 50 + (index * 700) / 11;
                      const y = 180 - (data.count / maxValue) * 120;
                      return `${x},${y}`;
                    })
                    .join(" ");

                  const areaPoints =
                    monthlyData
                      .map((data: any, index: number) => {
                        const x = 50 + (index * 700) / 11;
                        const y = 180 - (data.count / maxValue) * 120;
                        return `${x},${y}`;
                      })
                      .join(" ") +
                    ` ${50 + ((monthlyData.length - 1) * 700) / 11},200 50,200`;

                  return (
                    <>
                      <path
                        d={`M ${points}`}
                        stroke="#1B365D"
                        strokeWidth="3"
                        fill="none"
                      />
                      <path d={`M ${areaPoints}`} fill="url(#gradient)" />
                      {monthlyData.map((data: any, index: number) => {
                        const x = 50 + (index * 700) / 11;
                        const y = 180 - (data.count / maxValue) * 120;
                        return (
                          <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#1B365D"
                            stroke="white"
                            strokeWidth="2"
                          />
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-4 sm:px-12">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>July</span>
                <span>Aug</span>
                <span>Sept</span>
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
              </div>
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 py-2 sm:py-4">
                <span>
                  {Math.max(
                    ...(attendanceStats.monthlyStats || []).map(
                      (d: any) => d.count
                    ),
                    1
                  )}
                </span>
                <span>
                  {Math.round(
                    Math.max(
                      ...(attendanceStats.monthlyStats || []).map(
                        (d: any) => d.count
                      ),
                      1
                    ) * 0.75
                  )}
                </span>
                <span>
                  {Math.round(
                    Math.max(
                      ...(attendanceStats.monthlyStats || []).map(
                        (d: any) => d.count
                      ),
                      1
                    ) * 0.5
                  )}
                </span>
                <span>0</span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-500">
                No attendance data available
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Reports */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Attendance Reports
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAddAttendanceModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Add new Attendance
              </button>
              <button className="bg-[#1B365D] text-white px-4 py-2 rounded-lg text-sm font-medium">
                See All
              </button>
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search Report"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
              />
            </div>
            <select
              title="recent"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
            >
              <option>Latest</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Path
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceLoading ? (
                <tr>
                  <td colSpan={4}>Loading attendance records...</td>
                </tr>
              ) : attendanceError ? (
                <tr>
                  <td colSpan={4} className="text-red-500">
                    {attendanceError}
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.session_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.report_path}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleUpdate(record.id)}
                        className="bg-[#1B365D] text-white px-3 py-1 rounded text-sm hover:bg-[#2563EB] transition-colors"
                      >
                        Update
                      </button>
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs"
                        onClick={() => {
                          setViewAttendance(record);
                          setViewAttendanceModalOpen(true);
                        }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        Delete
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
  );

  const renderReports = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

      {/* Total Reports Stat */}
      <div className="bg-white rounded-lg p-6 shadow-sm border max-w-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Reports</p>
            <p className="text-2xl font-bold text-gray-900">{attendanceLoading ? '...' : attendanceRecords.length}</p>
            <div className="flex items-center mt-2">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-sm text-green-500">15%</span>
            </div>
          </div>
          <div className="bg-[#1B365D] text-white p-3 rounded-lg">
            <span className="text-lg font-bold">$</span>
          </div>
        </div>
      </div>

      {/* Attendance Report Summary Chart */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Attendance Report Summary
        </h2>
        <div className="relative h-64">
          {attendanceStatsLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B365D]"></div>
              <span className="ml-2 text-gray-600">Loading chart...</span>
            </div>
          ) : attendanceStatsError ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-red-500">{attendanceStatsError}</span>
            </div>
          ) : attendanceStats ? (
            <>
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-md border">
                <div className="text-2xl font-bold text-gray-900">
                  {attendanceStats.totalAttendance || 0}
                </div>
                <div className="text-sm text-gray-500">Total Attendance</div>
              </div>
              <svg className="w-full h-full" viewBox="0 0 800 200">
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#1B365D" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#1B365D" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                {(() => {
                  const monthlyData = attendanceStats.monthlyStats || [];
                  const maxValue = Math.max(
                    ...monthlyData.map((d: any) => d.count),
                    1
                  );
                  const points = monthlyData
                    .map((data: any, index: number) => {
                      const x = 50 + (index * 700) / 11;
                      const y = 180 - (data.count / maxValue) * 120;
                      return `${x},${y}`;
                    })
                    .join(" ");

                  const areaPoints =
                    monthlyData
                      .map((data: any, index: number) => {
                        const x = 50 + (index * 700) / 11;
                        const y = 180 - (data.count / maxValue) * 120;
                        return `${x},${y}`;
                      })
                      .join(" ") +
                    ` ${50 + ((monthlyData.length - 1) * 700) / 11},200 50,200`;

                  return (
                    <>
                      <path
                        d={`M ${points}`}
                        stroke="#1B365D"
                        strokeWidth="3"
                        fill="none"
                      />
                      <path d={`M ${areaPoints}`} fill="url(#gradient)" />
                      {monthlyData.map((data: any, index: number) => {
                        const x = 50 + (index * 700) / 11;
                        const y = 180 - (data.count / maxValue) * 120;
                        return (
                          <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#1B365D"
                            stroke="white"
                            strokeWidth="2"
                          />
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-4 sm:px-12">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>July</span>
                <span>Aug</span>
                <span>Sept</span>
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
              </div>
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 py-2 sm:py-4">
                <span>
                  {Math.max(
                    ...(attendanceStats.monthlyStats || []).map(
                      (d: any) => d.count
                    ),
                    1
                  )}
                </span>
                <span>
                  {Math.round(
                    Math.max(
                      ...(attendanceStats.monthlyStats || []).map(
                        (d: any) => d.count
                      ),
                      1
                    ) * 0.75
                  )}
                </span>
                <span>
                  {Math.round(
                    Math.max(
                      ...(attendanceStats.monthlyStats || []).map(
                        (d: any) => d.count
                      ),
                      1
                    ) * 0.5
                  )}
                </span>
                <span>0</span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-500">
                No attendance data available
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Training Sessions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Training Sessions
            </h2>
            <div className="flex space-x-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Create Session
              </button>
              <button className="bg-[#1B365D] text-white px-4 py-2 rounded-lg text-sm font-medium">
                See All
              </button>
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search session"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
              />
            </div>
            <select
              title="recent"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
            >
              <option>Latest</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joining Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trainingSessions.slice(0, 7).map((session) => (
                <tr key={session.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.joining_date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleUpdate(session.id)}
                      className="bg-[#1B365D] text-white px-3 py-1 rounded text-sm hover:bg-[#2563EB] transition-colors"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleView(session.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(session.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Reports */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Attendance Reports
            </h2>
            <div className="flex space-x-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Add new Attendance
              </button>
              <button className="bg-[#1B365D] text-white px-4 py-2 rounded-lg text-sm font-medium">
                See All
              </button>
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search Report"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
              />
            </div>
            <select
              title="recent"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
            >
              <option>Latest</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceLoading ? (
                <tr>
                  <td colSpan={2}>Loading attendance records...</td>
                </tr>
              ) : attendanceError ? (
                <tr>
                  <td colSpan={2} className="text-red-500">
                    {attendanceError}
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((record) => {
                  const session = trainingSessions.find(
                    (s) => s.id === record.session_id
                  );
                  return (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {session ? session.title : record.session_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 space-x-2">
                        <button
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs"
                          onClick={() => {
                            setViewAttendance(record);
                            setViewAttendanceModalOpen(true);
                          }}
                        >
                          View
                        </button>
                        <button
                          className="bg-[#1B365D] text-white px-3 py-1 rounded text-sm hover:bg-[#2563EB] transition-colors"
                          onClick={() => handleUpdate(record.id)}
                        >
                          Update
                        </button>
                        <button
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs"
                          onClick={() => handleDelete(record.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Notification
            </h2>
            <select
              title="recent"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
            >
              <option>Today</option>
            </select>
          </div>
          <div className="mt-4">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search Recent Notification"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
              />
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
            >
              <p className="text-sm text-gray-900">{notification.message}</p>
              <span className="text-sm text-gray-500">
                {notification.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Add at the top of the component:
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileFormData, setProfileFormData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/trainer/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data.profile);
        setProfileFormData({
          name: data.profile.name || "",
          email: data.profile.email || "",
        });
      } catch (err: any) {
        setProfileError(err.message || "Error loading profile");
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trainer/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profileFormData),
        }
      );
      if (!res.ok) throw new Error("Failed to update profile");
      setProfileSuccess("Profile updated successfully");
      // Optionally refetch profile
      const data = await res.json();
      setProfile((prev: any) => ({ ...prev, ...profileFormData }));
    } catch (err: any) {
      setProfileError(err.message || "Error updating profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const renderSettings = () => (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-8">
          Personal Settings
        </h2>
        {profileLoading ? (
          <div className="text-center text-gray-500">Loading profile...</div>
        ) : profileError ? (
          <div className="text-center text-red-500">{profileError}</div>
        ) : (
          <form onSubmit={handleProfileUpdate} className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Names
              </label>
              <input
                type="text"
                value={profileFormData.name}
                onChange={(e) =>
                  setProfileFormData((f) => ({ ...f, name: e.target.value }))
                }
                className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:ring-0 focus:border-[#1B365D] bg-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profileFormData.email}
                onChange={(e) =>
                  setProfileFormData((f) => ({ ...f, email: e.target.value }))
                }
                className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:ring-0 focus:border-[#1B365D] bg-transparent"
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={profileLoading}
                className="flex-1 bg-[#1B365D] text-white px-4 py-2 rounded-lg hover:bg-[#2563EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {profileLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
            {profileSuccess && (
              <div className="text-green-600 text-center">{profileSuccess}</div>
            )}
            {profileError && (
              <div className="text-red-500 text-center">{profileError}</div>
            )}
          </form>
        )}
      </div>
    </div>
  );

  // Add state for attendance form
  const [attendanceForm, setAttendanceForm] = useState({
    session_id: "",
    file: null as File | null,
  });
  const [attendanceFormError, setAttendanceFormError] = useState<string | null>(
    null
  );
  const [attendanceFormLoading, setAttendanceFormLoading] = useState(false);

  // Add at the top of the component:
  const [viewAttendance, setViewAttendance] = useState<AttendanceRecord | null>(
    null
  );
  const [viewAttendanceModalOpen, setViewAttendanceModalOpen] = useState(false);

  // Responsive sidebar and main layout
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1B365D] text-white flex flex-col transform transition-transform duration-300 ease-in-out lg:transform-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold">Iqs Authority</h1>
          <button
            className="lg:hidden p-1 rounded text-white hover:bg-blue-700"
            onClick={() => setSidebarOpen(false)}
            title="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? "bg-white text-[#1B365D]"
                    : "text-white hover:bg-blue-700"
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar with Sign Out */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Trainer Dashboard
          </h1>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600 transition"
          >
            Sign Out
          </button>
        </div>
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900"
            title="Open sidebar"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Iqs Authority</h1>
          <div className="w-6" />
        </div>
        <div className="p-4 sm:p-6">
          {(() => {
            switch (activeTab) {
              case "dashboard":
                return renderDashboard();
              case "training":
                return renderTraining();
              case "attendance":
                return renderAttendance();
              case "reports":
                return renderReports();
              case "notifications":
                return renderNotifications();
              case "settings":
                return renderSettings();
              default:
                return renderDashboard();
            }
          })()}
        </div>
      </div>
      {/* Modals (unchanged, but add responsive classes if needed) */}
      {showCreateSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editSession ? "Edit Session" : "Create New Session"}
              </h3>
              <button
                onClick={() => setShowCreateSessionModal(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Name
                </label>
                <input
                  type="text"
                  value={sessionForm.title}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
                  placeholder="Enter session name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={sessionForm.location}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, location: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
                  placeholder="Enter location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Joining Date
                </label>
                <input
                  type="date"
                  value={sessionForm.joining_date}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      joining_date: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={sessionForm.duration}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, duration: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
                  placeholder="Enter duration"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateSessionModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sessionFormLoading}
                  className="flex-1 bg-[#1B365D] text-white px-4 py-2 rounded-lg hover:bg-[#2563EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sessionFormLoading ? "Saving..." : "Save Session"}
                </button>
              </div>
              {sessionFormError && (
                <p className="text-sm text-red-500 text-center">
                  {sessionFormError}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
      {showAddAttendanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Add New Attendance
              </h3>
              <button
                onClick={() => setShowAddAttendanceModal(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setAttendanceFormError(null);
                if (!attendanceForm.session_id) {
                  setAttendanceFormError("Session is required");
                  return;
                }
                if (!attendanceForm.file) {
                  setAttendanceFormError("Report file is required");
                  return;
                }
                setAttendanceFormLoading(true);
                try {
                  const token = localStorage.getItem("token");
                  const formData = new FormData();
                  formData.append("session_id", attendanceForm.session_id);
                  formData.append("file", attendanceForm.file);
                  const res = await fetch(
                    `${
                      import.meta.env.VITE_API_URL
                    }/api/trainer/track-attendance`,
                    {
                      method: "POST",
                      headers: { Authorization: `Bearer ${token}` },
                      body: formData,
                    }
                  );
                  if (!res.ok) throw new Error("Failed to add attendance");
                  setShowAddAttendanceModal(false);
                  setAttendanceForm({ session_id: "", file: null });
                  // Refresh attendance records
                  const attendanceRes = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/trainer/attendance`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  const attendanceData = await attendanceRes.json();
                  setAttendanceRecords(attendanceData.attendance || []);
                } catch (err: any) {
                  setAttendanceFormError(
                    err.message || "Error adding attendance"
                  );
                } finally {
                  setAttendanceFormLoading(false);
                }
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session
                </label>
                <select
                  required
                  value={attendanceForm.session_id}
                  onChange={(e) =>
                    setAttendanceForm((f) => ({
                      ...f,
                      session_id: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
                >
                  <option value="">Select session</option>
                  {trainingSessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.title} ({session.location})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  required
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    setAttendanceForm((f) => ({ ...f, file: file || null }));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddAttendanceModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  disabled={attendanceFormLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#1B365D] text-white px-4 py-2 rounded-lg hover:bg-[#2563EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={attendanceFormLoading}
                >
                  {attendanceFormLoading ? "Adding..." : "Add"}
                </button>
              </div>
              {attendanceFormError && (
                <p className="text-sm text-red-500 text-center">
                  {attendanceFormError}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
      {/* View Session Modal */}
      {viewSessionModalOpen && viewSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Session Details
              </h3>
              <button
                onClick={() => setViewSessionModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">
                  Session Name
                </span>
                <div className="text-gray-900 font-semibold">
                  {viewSession.title}
                </div>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </span>
                <div className="text-gray-900">{viewSession.location}</div>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">
                  Joining Date
                </span>
                <div className="text-gray-900">{viewSession.joining_date}</div>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </span>
                <div className="text-gray-900">{viewSession.duration}</div>
              </div>
            </div>
          </div>
        </div>
      )}
      {viewAttendanceModalOpen && viewAttendance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Attendance Report
              </h3>
              <button
                onClick={() => setViewAttendanceModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                {/* File icon (simple SVG) */}
                <svg
                  width="48"
                  height="48"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="text-gray-700 mb-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 3a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V7.828a2 2 0 00-.586-1.414l-3.828-3.828A2 2 0 0014.172 2H7zm5 1.5V8a1 1 0 001 1h4.5"
                  />
                </svg>
                <div className="text-gray-900 text-center">
                  {viewAttendance.report_path
                    ? viewAttendance.report_path.split("/").pop()
                    : "No file"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerDashboard;
