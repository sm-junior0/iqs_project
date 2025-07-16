import React, { useState } from 'react';
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
} from 'lucide-react';
// import { useAuth } from '../../context/AuthContext';

interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: string;
}

interface TrainingSession {
  id: string;
  sessionName: string;
  location: string;
  joiningDate: string;
  duration: string;
}

interface Report {
  id: string;
  reportName: string;
  schoolLocation: string;
  uploadDate: string;
}

interface AttendanceRecord {
  id: string;
  sessionName: string;
  location: string;
  joiningDate: string;
  attendanceDate: string;
  duration: string;
}

interface Notification {
  id: string;
  message: string;
  timestamp: string;
}

const TrainerDashboard: React.FC = () => {
  // const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showCreateSessionModal, setShowCreateSessionModal] = useState<boolean>(false);
  const [editSession, setEditSession] = useState<TrainingSession | null>(null);
  const [sessionForm, setSessionForm] = useState<Partial<TrainingSession>>({});
  const [sessionFormLoading, setSessionFormLoading] = useState<boolean>(false);
  const [sessionFormError, setSessionFormError] = useState<string | null>(null);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);

  const [showAddAttendanceModal, setShowAddAttendanceModal] = useState<boolean>(false);
  const [editAttendance, setEditAttendance] = useState<AttendanceRecord | null>(null);
  const [attendanceForm, setAttendanceForm] = useState<Partial<AttendanceRecord>>({});
  const [attendanceFormLoading, setAttendanceFormLoading] = useState<boolean>(false);
  const [attendanceFormError, setAttendanceFormError] = useState<string | null>(null);
  const [deleteAttendanceId, setDeleteAttendanceId] = useState<string | null>(null);

  const [showUploadReportModal, setShowUploadReportModal] = useState<boolean>(false);
  const [editReport, setEditReport] = useState<Report | null>(null);
  const [reportForm, setReportForm] = useState<{ reportName?: string; schoolLocation?: string; file?: File | null }>({ file: null });
  const [reportFormLoading, setReportFormLoading] = useState<boolean>(false);
  const [reportFormError, setReportFormError] = useState<string | null>(null);
  const [deleteReportId, setDeleteReportId] = useState<string | null>(null);

  // CRUD handlers for Training Sessions
  const handleOpenCreateSession = () => {
    setEditSession(null);
    setSessionForm({});
    setShowCreateSessionModal(true);
  };

  const handleEditSession = (session: TrainingSession) => {
    setEditSession(session);
    setSessionForm(session);
    setShowCreateSessionModal(true);
  };

  const handleSessionFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSessionForm({ ...sessionForm, [e.target.name]: e.target.value });
  };

  const handleSubmitSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setSessionFormLoading(true);
    setSessionFormError(null);
    try {
      const token = localStorage.getItem('token');
      const method = editSession ? 'PUT' : 'POST';
      const url = `${import.meta.env.VITE_API_URL}/api/trainer/manage-session`;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sessionForm),
      });
      if (!res.ok) throw new Error('Failed to save session');
      setShowCreateSessionModal(false);
      setEditSession(null);
      setSessionForm({});
      // Refetch sessions
      const sessionsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/trainer/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await sessionsRes.json();
      setTrainingSessions(data.sessions || []);
    } catch (err: any) {
      setSessionFormError(err.message || 'Error saving session');
    } finally {
      setSessionFormLoading(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!deleteSessionId) return;
    setSessionFormLoading(true);
    setSessionFormError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/trainer/sessions/${deleteSessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete session');
      setDeleteSessionId(null);
      // Refetch sessions
      const sessionsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/trainer/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await sessionsRes.json();
      setTrainingSessions(data.sessions || []);
    } catch (err: any) {
      setSessionFormError(err.message || 'Error deleting session');
    } finally {
      setSessionFormLoading(false);
    }
  };

  // CRUD handlers for Attendance
  const handleOpenAddAttendance = () => {
    setEditAttendance(null);
    setAttendanceForm({});
    setShowAddAttendanceModal(true);
  };

  const handleEditAttendance = (record: AttendanceRecord) => {
    setEditAttendance(record);
    setAttendanceForm(record);
    setShowAddAttendanceModal(true);
  };

  const handleAttendanceFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAttendanceForm({ ...attendanceForm, [e.target.name]: e.target.value });
  };

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttendanceFormLoading(true);
    setAttendanceFormError(null);
    try {
      const token = localStorage.getItem('token');
      const method = editAttendance ? 'PUT' : 'POST';
      const url = editAttendance
        ? `${import.meta.env.VITE_API_URL}/api/trainer/track-attendance/${editAttendance.id}`
        : `${import.meta.env.VITE_API_URL}/api/trainer/track-attendance`;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(attendanceForm),
      });
      if (!res.ok) throw new Error('Failed to save attendance');
      setShowAddAttendanceModal(false);
      setEditAttendance(null);
      setAttendanceForm({});
      // Refetch attendance
      const attRes = await fetch(`${import.meta.env.VITE_API_URL}/api/trainer/track-attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await attRes.json();
      setAttendanceRecords(data.attendance || []);
    } catch (err: any) {
      setAttendanceFormError(err.message || 'Error saving attendance');
    } finally {
      setAttendanceFormLoading(false);
    }
  };

  const handleDeleteAttendance = async () => {
    if (!deleteAttendanceId) return;
    setAttendanceFormLoading(true);
    setAttendanceFormError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/trainer/track-attendance/${deleteAttendanceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete attendance');
      setDeleteAttendanceId(null);
      // Refetch attendance
      const attRes = await fetch(`${import.meta.env.VITE_API_URL}/api/trainer/track-attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await attRes.json();
      setAttendanceRecords(data.attendance || []);
    } catch (err: any) {
      setAttendanceFormError(err.message || 'Error deleting attendance');
    } finally {
      setAttendanceFormLoading(false);
    }
  };

  // CRUD handlers for Reports
  const handleOpenUploadReport = () => {
    setEditReport(null);
    setReportForm({ file: null });
    setShowUploadReportModal(true);
  };

  const handleReportFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target.type === 'file') {
      setReportForm({ ...reportForm, file: (e.target as HTMLInputElement).files?.[0] || null });
    } else {
      setReportForm({ ...reportForm, [e.target.name]: e.target.value });
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportFormLoading(true);
    setReportFormError(null);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      if (reportForm.reportName) formData.append('reportName', reportForm.reportName);
      if (reportForm.schoolLocation) formData.append('schoolLocation', reportForm.schoolLocation);
      if (reportForm.file) formData.append('file', reportForm.file);
      const method = editReport ? 'PUT' : 'POST';
      const url = editReport
        ? `${import.meta.env.VITE_API_URL}/api/trainer/upload-report/${editReport.id}`
        : `${import.meta.env.VITE_API_URL}/api/trainer/upload-report`;
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to upload report');
      setShowUploadReportModal(false);
      setEditReport(null);
      setReportForm({ file: null });
      // Refetch reports
      const repRes = await fetch(`${import.meta.env.VITE_API_URL}/api/trainer/upload-report`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await repRes.json();
      setReports(data.reports || []);
    } catch (err: any) {
      setReportFormError(err.message || 'Error uploading report');
    } finally {
      setReportFormLoading(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!deleteReportId) return;
    setReportFormLoading(true);
    setReportFormError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/trainer/upload-report/${deleteReportId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete report');
      setDeleteReportId(null);
      // Refetch reports
      const repRes = await fetch(`${import.meta.env.VITE_API_URL}/api/trainer/upload-report`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await repRes.json();
      setReports(data.reports || []);
    } catch (err: any) {
      setReportFormError(err.message || 'Error deleting report');
    } finally {
      setReportFormLoading(false);
    }
  };

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // State for dashboard data
  const [stats, setStats] = useState<StatCard[] | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState<boolean>(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState<boolean>(true);
  const [reportsError, setReportsError] = useState<string | null>(null);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState<boolean>(true);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState<boolean>(true);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);

  // Fetch dashboard stats
  React.useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/trainer/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch dashboard stats');
        const data = await res.json();
        setStats([
          { title: 'Total Trainings', value: data.totalTrainings?.toString() || '0', change: '15%', icon: '$' },
          { title: 'Total Reports', value: data.totalReports?.toString() || '0', change: '15%', icon: '$' },
          { title: 'Total Participants', value: data.totalParticipants?.toString() || '0', change: '15%', icon: '$' },
        ]);
      } catch (err: any) {
        setStatsError(err.message || 'Error loading stats');
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch training sessions
  React.useEffect(() => {
    const fetchSessions = async () => {
      setSessionsLoading(true);
      setSessionsError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/trainer/sessions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch sessions');
        const data = await res.json();
        setTrainingSessions(data.sessions || []);
      } catch (err: any) {
        setSessionsError(err.message || 'Error loading sessions');
      } finally {
        setSessionsLoading(false);
      }
    };
    fetchSessions();
  }, []);

  // Fetch reports
  React.useEffect(() => {
    const fetchReports = async () => {
      setReportsLoading(true);
      setReportsError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/trainer/upload-report`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch reports');
        const data = await res.json();
        setReports(data.reports || []);
      } catch (err: any) {
        setReportsError(err.message || 'Error loading reports');
      } finally {
        setReportsLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Fetch attendance records
  React.useEffect(() => {
    const fetchAttendance = async () => {
      setAttendanceLoading(true);
      setAttendanceError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/trainer/track-attendance`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch attendance');
        const data = await res.json();
        setAttendanceRecords(data.attendance || []);
      } catch (err: any) {
        setAttendanceError(err.message || 'Error loading attendance');
      } finally {
        setAttendanceLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  // Fetch notifications
  React.useEffect(() => {
    const fetchNotifications = async () => {
      setNotifications([]);
      setNotificationsLoading(false);
    };
    fetchNotifications();
  }, []);

  const handleUpdate = (id: string): void => {
    console.log('Updating:', id);
  };

  const handleView = (id: string): void => {
    console.log('Viewing:', id);
  };

  const handleDelete = (id: string): void => {
    console.log('Deleting:', id);
  };

  const handleDownload = (id: string): void => {
    console.log('Downloading:', id);
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'training', label: 'Training', icon: GraduationCap },
    { id: 'attendance', label: 'Attendance', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Mobile Card Component
  const MobileCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white p-4 rounded-lg shadow-sm border space-y-3 ${className}`}>{children}</div>
  );

  const renderDashboard = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
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
        {(stats || []).map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp size={14} className="text-green-500 mr-1" />
                  <span className="text-xs sm:text-sm text-green-500">{stat.change}</span>
                </div>
              </div>
              <div className="bg-[#1B365D] text-white p-2 sm:p-3 rounded-lg">
                <span className="text-sm sm:text-lg font-bold">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Training Sessions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Training Sessions</h2>
            <button className="bg-[#1B365D] text-white px-4 py-2 rounded-lg text-sm font-medium w-full sm:w-auto">See All</button>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search session"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
              />
            </div>
            <select title="recent" className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent">
              <option>Latest</option>
            </select>
          </div>
        </div>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joining Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(trainingSessions || []).slice(0, 3).map((session) => (
                <tr key={session.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.sessionName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.joiningDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile Cards */}
        <div className="md:hidden p-4 space-y-4">
          {(trainingSessions || []).slice(0, 3).map((session) => (
            <MobileCard key={session.id}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{session.sessionName}</h3>
                  <p className="text-sm text-gray-500">{session.location}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Joining Date:</span>
                  <p className="font-medium">{session.joiningDate}</p>
                </div>
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <p className="font-medium">{session.duration}</p>
                </div>
              </div>
            </MobileCard>
          ))}
        </div>
      </div>
      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
            <button className="bg-[#1B365D] text-white px-4 py-2 rounded-lg text-sm font-medium w-full sm:w-auto">See All</button>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Report"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
              />
            </div>
            <select title="recent" className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent">
              <option>Latest</option>
            </select>
          </div>
        </div>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(reports || []).slice(0, 4).map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.reportName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.schoolLocation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.uploadDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleDownload(report.id)}
                      className="bg-[#1B365D] text-white px-3 py-1 rounded text-sm hover:bg-[#2563EB] transition-colors"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleView(report.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(report.id)}
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
        {/* Mobile Cards */}
        <div className="md:hidden p-4 space-y-4">
          {(reports || []).slice(0, 4).map((report) => (
            <MobileCard key={report.id}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{report.reportName}</h3>
                  <p className="text-sm text-gray-500">{report.schoolLocation}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Upload Date:</span>
                  <p className="font-medium">{report.uploadDate}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleDownload(report.id)}
                  className="bg-[#1B365D] text-white px-3 py-2 rounded text-sm hover:bg-[#2563EB] transition-colors"
                >
                  Download
                </button>
                <button
                  onClick={() => handleView(report.id)}
                  className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  View
                </button>
                <button
                  onClick={() => handleDelete(report.id)}
                  className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </MobileCard>
          ))}
        </div>
      </div>
      {/* Attendance Report Summary Chart */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Attendance Report Summary</h2>
        <div className="relative h-48 sm:h-64">
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-md border">
            <div className="text-lg sm:text-2xl font-bold text-gray-900">220,342,123</div>
            <div className="text-xs sm:text-sm text-gray-500">May</div>
          </div>
          <svg className="w-full h-full" viewBox="0 0 800 200">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1B365D" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#1B365D" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path
              d="M 50 150 Q 150 120 200 130 T 350 100 T 500 80 T 650 90 T 750 120"
              stroke="#1B365D"
              strokeWidth="3"
              fill="none"
            />
            <path
              d="M 50 150 Q 150 120 200 130 T 350 100 T 500 80 T 650 90 T 750 120 L 750 200 L 50 200 Z"
              fill="url(#gradient)"
            />
            <circle cx="500" cy="80" r="6" fill="#1B365D" stroke="white" strokeWidth="2" />
            <line x1="500" y1="80" x2="500" y2="40" stroke="#1B365D" strokeWidth="2" strokeDasharray="5,5" />
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
            <span>260</span>
            <span>220</span>
            <span>180</span>
            <span>140</span>
          </div>
        </div>
      </div>
      {/* Recent Notifications */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Notification</h2>
            <select title="recent" className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent w-full sm:w-auto">
              <option>Today</option>
            </select>
          </div>
          <div className="mt-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Recent Notification"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
              />
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          {(notifications || []).length === 0 ? (
            <div className="text-gray-500 text-sm">No notifications available.</div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <p className="text-sm text-gray-900">{notification.message}</p>
                <span className="text-sm text-gray-500">{notification.timestamp}</span>
              </div>
            ))
          )}
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
            <p className="text-2xl font-bold text-gray-900">5</p>
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
            <h2 className="text-lg font-semibold text-gray-900">Training Sessions</h2>
            <div className="flex space-x-2">
              <button 
                onClick={() => setShowCreateSessionModal(true)}
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
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search session"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
              />
            </div>
            <select title='recent' className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent">
              <option>Latest</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joining Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(trainingSessions || []).map((session) => (
                <tr key={session.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.sessionName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.joiningDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.duration}</td>
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
    </div>
  );

  const renderAttendance = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
      
      {/* Total Participants Stat */}
      <div className="bg-white rounded-lg p-6 shadow-sm border max-w-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Participants</p>
            <p className="text-2xl font-bold text-gray-900">5</p>
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
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Attendance Report Summary</h2>
        <div className="relative h-64">
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-md border">
            <div className="text-2xl font-bold text-gray-900">220,342,123</div>
            <div className="text-sm text-gray-500">May</div>
          </div>
          <svg className="w-full h-full" viewBox="0 0 800 200">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1B365D" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#1B365D" stopOpacity="0.1"/>
              </linearGradient>
            </defs>
            <path
              d="M 50 150 Q 150 120 200 130 T 350 100 T 500 80 T 650 90 T 750 120"
              stroke="#1B365D"
              strokeWidth="3"
              fill="none"
            />
            <path
              d="M 50 150 Q 150 120 200 130 T 350 100 T 500 80 T 650 90 T 750 120 L 750 200 L 50 200 Z"
              fill="url(#gradient)"
            />
            <circle cx="500" cy="80" r="6" fill="#1B365D" stroke="white" strokeWidth="2"/>
            <line x1="500" y1="80" x2="500" y2="40" stroke="#1B365D" strokeWidth="2" strokeDasharray="5,5"/>
          </svg>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-12">
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
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 py-4">
            <span>260</span>
            <span>220</span>
            <span>180</span>
            <span>140</span>
          </div>
        </div>
      </div>

      {/* Attendance Reports */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Attendance Reports</h2>
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
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Report"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
              />
            </div>
            <select title='recent' className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent">
              <option>Latest</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joining Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(attendanceRecords || []).map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.sessionName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.joiningDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.attendanceDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleUpdate(record.id)}
                      className="bg-[#1B365D] text-white px-3 py-1 rounded text-sm hover:bg-[#2563EB] transition-colors"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleView(record.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
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
              ))}
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
            <p className="text-2xl font-bold text-gray-900">5</p>
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
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Attendance Report Summary</h2>
        <div className="relative h-64">
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-md border">
            <div className="text-2xl font-bold text-gray-900">220,342,123</div>
            <div className="text-sm text-gray-500">May</div>
          </div>
          <svg className="w-full h-full" viewBox="0 0 800 200">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1B365D" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#1B365D" stopOpacity="0.1"/>
              </linearGradient>
            </defs>
            <path
              d="M 50 150 Q 150 120 200 130 T 350 100 T 500 80 T 650 90 T 750 120"
              stroke="#1B365D"
              strokeWidth="3"
              fill="none"
            />
            <path
              d="M 50 150 Q 150 120 200 130 T 350 100 T 500 80 T 650 90 T 750 120 L 750 200 L 50 200 Z"
              fill="url(#gradient)"
            />
            <circle cx="500" cy="80" r="6" fill="#1B365D" stroke="white" strokeWidth="2"/>
            <line x1="500" y1="80" x2="500" y2="40" stroke="#1B365D" strokeWidth="2" strokeDasharray="5,5"/>
          </svg>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-12">
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
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 py-4">
            <span>260</span>
            <span>220</span>
            <span>180</span>
            <span>140</span>
          </div>
        </div>
      </div>

      {/* Training Sessions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Training Sessions</h2>
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
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search session"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
              />
            </div>
            <select title='recent' className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent">
              <option>Latest</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joining Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(trainingSessions || []).slice(0, 7).map((session) => (
                <tr key={session.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.sessionName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.joiningDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.duration}</td>
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
            <h2 className="text-lg font-semibold text-gray-900">Attendance Reports</h2>
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
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Report"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
              />
            </div>
            <select title='recent' className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent">
              <option>Latest</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joining Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(attendanceRecords || []).slice(0, 7).map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.sessionName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.joiningDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.attendanceDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleUpdate(record.id)}
                      className="bg-[#1B365D] text-white px-3 py-1 rounded text-sm hover:bg-[#2563EB] transition-colors"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleView(record.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
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
              ))}
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
            <h2 className="text-lg font-semibold text-gray-900">Recent Notification</h2>
            <select title='recent' className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent">
              <option>Today</option>
            </select>
          </div>
          <div className="mt-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Recent Notification"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
              />
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {(notifications || []).length === 0 ? (
            <div className="text-gray-500 text-sm">No notifications available.</div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <p className="text-sm text-gray-900">{notification.message}</p>
                <span className="text-sm text-gray-500">{notification.timestamp}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      
      {/* Personal Settings */}
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-8">Personal Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Names</label>
            <input
              type="text"
              defaultValue="Mike David"
              className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:ring-0 focus:border-[#1B365D] bg-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <input
              type="text"
              defaultValue="Trainer"
              className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:ring-0 focus:border-[#1B365D] bg-transparent"
              readOnly
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              defaultValue="david@gmail.com"
              className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:ring-0 focus:border-[#1B365D] bg-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              defaultValue="0788888888"
              className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:ring-0 focus:border-[#1B365D] bg-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              defaultValue="Nairobi Kenya"
              className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:ring-0 focus:border-[#1B365D] bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-8">Notifications</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notification email</label>
            <input
              type="email"
              defaultValue="david@gmail.com"
              className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:ring-0 focus:border-[#1B365D] bg-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sms Notification Number</label>
            <input
              type="tel"
              defaultValue="0788888888"
              className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:ring-0 focus:border-[#1B365D] bg-transparent"
            />
          </div>
        </div>

        <div className="mt-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Notifications</label>
          <div className="relative">
            <select title='Allowed Notifications' className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:ring-0 focus:border-[#1B365D] bg-transparent appearance-none">
              <option>All</option>
              <option>Email Only</option>
              <option>SMS Only</option>
              <option>None</option>
            </select>
            <ChevronDown size={20} className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Data Backup */}
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-8">Data Backup</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
          <div className="relative">
            <select title='Backup Frequency' className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:ring-0 focus:border-[#1B365D] bg-transparent appearance-none">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
            <ChevronDown size={20} className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );

  // Responsive sidebar and main layout
  return (
    <div>
      {/* --- MODALS & CONFIRMATION DIALOGS --- */}
      {/* Training Session Create/Update Modal */}
      {showCreateSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <form onSubmit={handleSubmitSession} className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg space-y-4">
            <h2 className="text-xl font-semibold mb-2">{editSession ? 'Edit' : 'Create'} Training Session</h2>
            {sessionFormError && <div className="text-red-600 text-sm">{sessionFormError}</div>}
            {/* ... (rest of the code remains the same) */}
          </form>
        </div>
      )}


    </div>
  );
};

export default TrainerDashboard;