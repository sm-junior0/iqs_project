"use client"

import type React from "react"
import { useState, useEffect } from "react"
import DashboardNavbar from '../../components/DashboardNavbar';
import {
  LayoutDashboard,
  School,
  FileText,
  History,
  Settings,
  Search,
  ChevronDown,
  TrendingUp,
  X,
  FileIcon,
  Upload,
  Menu,
} from "lucide-react"

interface StatCard {
  title: string
  value: string
  change: string
  icon: React.ReactNode
}

interface AssignedSchool {
  id: string
  schoolName: string
  studentNumber: number
  joiningDate: string
  assignitationPeriod: string
}

interface Report {
  id: string
  reportName: string
  schoolLocation: string
  uploadDate: string
}

interface HistoryItem {
  id: string
  action: string
  timestamp: string
}

const EvaluatorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard")
  const [showReportModal, setShowReportModal] = useState<boolean>(false)
  const [showAddReportModal, setShowAddReportModal] = useState<boolean>(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Feedback modal state
  const [feedbackRating, setFeedbackRating] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [feedbackDescription, setFeedbackDescription] = useState('');
  const [feedbackFile, setFeedbackFile] = useState<File | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Report upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Report delete state
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null); // report id
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  const [stats, setStats] = useState<StatCard[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [assignedSchools, setAssignedSchools] = useState<AssignedSchool[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [schoolsError, setSchoolsError] = useState<string | null>(null);

  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);

  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);

  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/evaluator/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        setStats([
          {
            title: 'Assigned Schools',
            value: data.assignedSchools?.toString() ?? '0',
            change: data.assignedSchoolsChange ?? '',
      icon: <span className="text-lg font-bold">$</span>,
    },
    {
            title: 'Total Reports',
            value: data.totalReports?.toString() ?? '0',
            change: data.totalReportsChange ?? '',
      icon: <span className="text-lg font-bold">$</span>,
    },
        ]);
      } catch (err: any) {
        setStatsError(err.message);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch assigned schools
  useEffect(() => {
    const fetchSchools = async () => {
      setSchoolsLoading(true);
      setSchoolsError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/evaluator/my-schools`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch assigned schools');
        const data = await res.json();
        setAssignedSchools(data);
        if (data.length > 0 && !selectedSchoolId) {
          setSelectedSchoolId(data[0].id);
        }
      } catch (err: any) {
        setSchoolsError(err.message);
      } finally {
        setSchoolsLoading(false);
      }
    };
    fetchSchools();
    // Only run on mount
    // eslint-disable-next-line
  }, []);

  // Fetch reports for selected school
  useEffect(() => {
    if (!selectedSchoolId) return;
    const fetchReports = async () => {
      setReportsLoading(true);
      setReportsError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/evaluator/reports/${selectedSchoolId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch reports');
        const data = await res.json();
        setReports(data);
      } catch (err: any) {
        setReportsError(err.message);
      } finally {
        setReportsLoading(false);
      }
    };
    fetchReports();
  }, [selectedSchoolId]);

  // Fetch evaluator history
  useEffect(() => {
    const fetchHistory = async () => {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/evaluator/visit-history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch history');
        const data = await res.json();
        setHistoryItems(Array.isArray(data.visits) ? data.visits : []);
      } catch (err: any) {
        setHistoryError(err.message);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "schools", label: "Schools", icon: School },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "history", label: "History", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // --- Backend-integrated actions ---
  // Feedback submit
  const handleFeedbackSubmit = async () => {
    if (!selectedSchoolId) return;
    setFeedbackLoading(true);
    setFeedbackError(null);
    setFeedbackSuccess(null);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('rating', feedbackRating);
      formData.append('type', feedbackType);
      formData.append('description', feedbackDescription);
      if (feedbackFile) formData.append('supportingDocument', feedbackFile);
      const res = await fetch(`${API_URL}/api/evaluator/schools/${selectedSchoolId}/feedback`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to submit feedback');
      setFeedbackSuccess('Feedback submitted successfully!');
      setShowFeedbackModal(false);
      setFeedbackRating(''); setFeedbackType(''); setFeedbackDescription(''); setFeedbackFile(null);
    } catch (err: any) {
      setFeedbackError(err.message);
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Report upload
  const handleReportUpload = async () => {
    if (!uploadFile || !selectedSchoolId) return;
    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccess(null);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('schoolId', selectedSchoolId);
      const res = await fetch(`${API_URL}/api/evaluator/upload-report`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to upload report');
      setUploadSuccess('Report uploaded successfully!');
      setUploadFile(null);
      // Refresh reports
      const reportsRes = await fetch(`${API_URL}/api/evaluator/reports/${selectedSchoolId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (reportsRes.ok) setReports(await reportsRes.json());
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  // Report download
  const handleReportDownload = async (reportId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/evaluator/report/download/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to download report');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Download failed.');
    }
  };

  // Report delete
  const handleReportDelete = async (reportId: string) => {
    setDeleteLoading(reportId);
    setDeleteError(null);
    setDeleteSuccess(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/evaluator/report/${reportId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete report');
      setDeleteSuccess('Report deleted successfully!');
      // Refresh reports
      if (selectedSchoolId) {
        const reportsRes = await fetch(`${API_URL}/api/evaluator/reports/${selectedSchoolId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (reportsRes.ok) setReports(await reportsRes.json());
      }
    } catch (err: any) {
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleGiveFeedback = () => {
    setShowFeedbackModal(true)
  }

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const renderDashboard = () => (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp size={16} className="text-green-500 mr-1" />
                  <span className="text-xs md:text-sm text-green-500">{stat.change}</span>
                </div>
              </div>
              <div className="bg-[#1B365D] text-white p-2 md:p-3 rounded-lg">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Assigned Schools */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Assigned Schools</h2>
            <button className="bg-[#1B365D] text-white px-4 py-2 rounded-lg text-xs md:text-sm font-medium w-full sm:w-auto">
              See All
            </button>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search School"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm"
              />
            </div>
            <select
              title="period"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm w-full sm:w-auto"
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
                  School Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joining Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignitation Period
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignedSchools.map((school) => (
                <tr key={school.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{school.schoolName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {school.studentNumber.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{school.joiningDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{school.assignitationPeriod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-200">
          {assignedSchools.map((school) => (
            <div key={school.id} className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900 text-sm">{school.schoolName}</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Students:</span> {school.studentNumber.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Joined:</span> {school.joiningDate}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Period:</span> {school.assignitationPeriod}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Recent Reports</h2>
            <button className="bg-[#1B365D] text-white px-4 py-2 rounded-lg text-xs md:text-sm font-medium w-full sm:w-auto">
              See All
            </button>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Report"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm"
              />
            </div>
            <select
              title="period"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm w-full sm:w-auto"
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
                  Report Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Upload Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.slice(0, 8).map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.reportName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.schoolLocation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.uploadDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      className="bg-[#1B365D] text-white px-3 py-1 rounded text-sm hover:bg-[#2563EB] transition-colors"
                      onClick={() => handleReportDownload(report.id)}
                      disabled={deleteLoading === report.id || reportsLoading}
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleViewReport(report)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      View
                    </button>
                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                      onClick={() => handleReportDelete(report.id)}
                      disabled={deleteLoading === report.id}
                    >
                      {deleteLoading === report.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-200">
          {reports.slice(0, 8).map((report) => (
            <div key={report.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900 text-sm">{report.reportName}</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Location:</span> {report.schoolLocation}
                </div>
                <div>
                  <span className="font-medium">Uploaded:</span> {report.uploadDate}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="bg-[#1B365D] text-white px-3 py-1 rounded text-xs hover:bg-[#2563EB] transition-colors">
                  Download
                </button>
                <button
                  onClick={() => handleViewReport(report)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                >
                  View
                </button>
                <button className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSchools = () => (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900">Schools</h1>

      {/* Assigned Schools Stats */}
      <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border max-w-full sm:max-w-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-600">Assigned Schools</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900">5</p>
            <div className="flex items-center mt-2">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-xs md:text-sm text-green-500">15%</span>
            </div>
          </div>
          <div className="bg-[#1B365D] text-white p-2 md:p-3 rounded-lg">
            <span className="text-lg font-bold">$</span>
          </div>
        </div>
      </div>

      {/* Assigned Schools Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Assigned Schools (3)</h2>
            <button className="bg-[#1B365D] text-white px-4 py-2 rounded-lg text-xs md:text-sm font-medium w-full sm:w-auto">
              Load More
            </button>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search School"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm"
              />
            </div>
            <select
              title="period"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm w-full sm:w-auto"
            >
              <option>Latest</option>
            </select>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joining Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignitation Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignedSchools.map((school) => (
                <tr key={school.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{school.schoolName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {school.studentNumber.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{school.joiningDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{school.assignitationPeriod}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={handleGiveFeedback}
                      className="bg-[#1B365D] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2563EB] transition-colors"
                    >
                      Give School Feedback
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-gray-200">
          {assignedSchools.map((school) => (
            <div key={school.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900 text-sm">{school.schoolName}</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Students:</span> {school.studentNumber.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Joined:</span> {school.joiningDate}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Period:</span> {school.assignitationPeriod}
                </div>
              </div>
              <button
                onClick={handleGiveFeedback}
                className="bg-[#1B365D] text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-[#2563EB] transition-colors w-full"
              >
                Give School Feedback
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderReports = () => (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900">Reports</h1>

      {/* Stats Card */}
      <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border max-w-full sm:max-w-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-600">Total Reports</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900">1000000</p>
            <div className="flex items-center mt-2">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-xs md:text-sm text-green-500">15%</span>
            </div>
          </div>
          <div className="bg-[#1B365D] text-white p-2 md:p-3 rounded-lg">
            <span className="text-lg font-bold">$</span>
          </div>
        </div>
      </div>

      {/* Reports Trend Chart */}
      {/* ReportsTrendChart placeholder: implement or import if available */}
<div className="bg-gray-200 rounded-lg p-8 text-center text-gray-500">Reports trend chart coming soon</div>

      {/* Uploaded Reports */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Uploaded Reports</h2>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={() => setShowAddReportModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs md:text-sm font-medium w-full sm:w-auto"
              >
                Add new Report
              </button>
              <button className="bg-[#1B365D] text-white px-4 py-2 rounded-lg text-xs md:text-sm font-medium w-full sm:w-auto">
                See All
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Report"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm"
              />
            </div>
            <select
              title="period"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm w-full sm:w-auto"
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
                  Report Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Upload Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.reportName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.schoolLocation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.uploadDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button className="bg-[#1B365D] text-white px-3 py-1 rounded text-sm hover:bg-[#2563EB] transition-colors">
                      Download
                    </button>
                    <button
                      onClick={() => handleViewReport(report)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      View
                    </button>
                    <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-200">
          {reports.map((report) => (
            <div key={report.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900 text-sm">{report.reportName}</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Location:</span> {report.schoolLocation}
                </div>
                <div>
                  <span className="font-medium">Uploaded:</span> {report.uploadDate}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="bg-[#1B365D] text-white px-3 py-1 rounded text-xs hover:bg-[#2563EB] transition-colors">
                  Download
                </button>
                <button
                  onClick={() => handleViewReport(report)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                >
                  View
                </button>
                <button className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderHistory = () => (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900">History</h1>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Recent action"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm"
              />
            </div>
            <select
              title="period"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm w-full sm:w-auto"
            >
              <option>Today</option>
            </select>
          </div>
        </div>
        <div className="p-4 md:p-6 space-y-4">
          {historyItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 last:border-b-0 gap-2"
            >
              <p className="text-xs md:text-sm text-gray-900">{item.action}</p>
              <span className="text-xs md:text-sm text-gray-500 self-start sm:self-center">{item.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6 md:space-y-8">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900">Setting</h1>

      {/* Personal Settings */}
      <div className="bg-white rounded-lg shadow-sm border p-4 md:p-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-6 md:mb-8">Personal Settings</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Full Names</label>
            <input
              type="text"
              defaultValue="Mike David"
              className="w-full border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#1B365D] bg-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Role</label>
            <input
              type="text"
              defaultValue="Evaluator"
              className="w-full border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#1B365D] bg-transparent text-sm"
              readOnly
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mt-6 md:mt-8">
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              defaultValue="david@gmail.com"
              className="w-full border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#1B365D] bg-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              defaultValue="0788888888"
              className="w-full border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#1B365D] bg-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              defaultValue="Nairobi Kenya"
              className="w-full border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#1B365D] bg-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg shadow-sm border p-4 md:p-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-6 md:mb-8">Notifications</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Notification email</label>
            <input
              type="email"
              defaultValue="david@gmail.com"
              className="w-full border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#1B365D] bg-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Sms Notification Number</label>
            <input
              type="tel"
              defaultValue="0788888888"
              className="w-full border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#1B365D] bg-transparent text-sm"
            />
          </div>
        </div>

        <div className="mt-6 md:mt-8">
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Allowed Notifications</label>
          <div className="relative">
            <select
              title="send"
              className="w-full lg:w-1/2 border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#1B365D] bg-transparent appearance-none text-sm"
            >
              <option>All</option>
              <option>Email Only</option>
              <option>SMS Only</option>
              <option>None</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none lg:right-1/2 lg:mr-2"
            />
          </div>
        </div>
      </div>

      {/* Data Backup */}
      <div className="bg-white rounded-lg shadow-sm border p-4 md:p-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-6 md:mb-8">Data Backup</h2>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
          <div className="relative">
            <select
              title="period"
              className="w-full lg:w-1/2 border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#1B365D] bg-transparent appearance-none text-sm"
            >
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none lg:right-1/2 lg:mr-2"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard()
      case "schools":
        return renderSchools()
      case "reports":
        return renderReports()
      case "history":
        return renderHistory()
      case "settings":
        return renderSettings()
      default:
        return renderDashboard()
    }
  }

  return (
    <>
      <DashboardNavbar />
      <div className="flex min-h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`$
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#1B365D] text-white flex flex-col transition-transform duration-300 ease-in-out`}
      >
        <div className="p-4 md:p-6 flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-bold">Iqs Authority</h1>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === item.id ? "bg-white text-[#1B365D]" : "text-white hover:bg-blue-700"
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600 hover:text-gray-900">
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Iqs Authority</h1>
          <div className="w-6" /> {/* Spacer for centering */}
        </div>

        <div className="p-4 md:p-6">{renderContent()}</div>
      </div>

      {/* View Report Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">View Report</h2>
                <button
                  title="Close"
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">School Name</label>
                  <p className="text-sm md:text-base text-gray-900">Kingston High School</p>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">School Location</label>
                  <p className="text-sm md:text-base text-gray-900">Nairobi Kenya</p>
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-3">Document</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col items-center p-4 border border-gray-200 rounded-lg">
                    <FileIcon size={48} className="text-gray-400 mb-2" />
                    <p className="text-xs md:text-sm text-gray-700 text-center">Kingston High School report.pdf</p>
                  </div>
                  <div className="flex flex-col items-center p-4 border border-gray-200 rounded-lg">
                    <FileIcon size={48} className="text-gray-400 mb-2" />
                    <p className="text-xs md:text-sm text-gray-700 text-center">Kingston High School report 2.pdf</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-start">
                <button className="bg-[#1B365D] text-white px-4 md:px-6 py-2 rounded-lg hover:bg-[#2563EB] transition-colors text-sm md:text-base w-full md:w-auto">
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Report Modal */}
      {showAddReportModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-4 md:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">Add New Report</h2>
          <button
            title="Close"
            onClick={() => setShowAddReportModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
                  <X size={24} />
                </button>
              </div>
            </div>

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* School name/location selectors could be enhanced later for real data */}
                </div>
                <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Document</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 md:p-8 text-center">
                  <Upload size={48} className="text-gray-400 mx-auto mb-4" />
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={e => setUploadFile(e.target.files?.[0] || null)}
              className="mt-2"
            />
            <p className="text-sm text-gray-500">Upload Report Document</p>
                </div>
              </div>
              <div className="flex justify-start">
          <button
            className="bg-[#1B365D] text-white px-4 md:px-6 py-2 rounded-lg hover:bg-[#2563EB] transition-colors text-sm md:text-base w-full md:w-auto"
            onClick={handleReportUpload}
            disabled={uploadLoading}
          >
            {uploadLoading ? 'Uploading...' : 'Upload Report'}
                </button>
              </div>
        {uploadError && <div className="text-red-500 text-sm mt-2">{uploadError}</div>}
        {uploadSuccess && <div className="text-green-600 text-sm mt-2">{uploadSuccess}</div>}
            </div>
          </div>
        </div>
      )}

      {/* Add School Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Add School FeedBack</h2>
                <button
                  title="Close"
                  onClick={() => setShowFeedbackModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Feedback Rating</label>
                  <select
                    title="select rating"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm"
                    value={feedbackRating}
                    onChange={(e) => setFeedbackRating(e.target.value)}
                  >
                    <option value="">Choose rating</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Feedback Type</label>
                  <select
                    title="select type"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm"
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value)}
                  >
                    <option value="">Choose Feedback Type</option>
                    <option value="Academic Performance">Academic Performance</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Staff Quality">Staff Quality</option>
                    <option value="Student Behavior">Student Behavior</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={4}
                  placeholder="Feedback Description"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm"
                  value={feedbackDescription}
                  onChange={(e) => setFeedbackDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Document</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 md:p-8 text-center">
                  <Upload size={48} className="text-gray-400 mx-auto mb-4" />
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setFeedbackFile(e.target.files?.[0] || null)}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500">Upload Supporting Document</p>
                </div>
              </div>

              <div className="flex justify-start">
                <button
                  className="bg-[#1B365D] text-white px-4 md:px-6 py-2 rounded-lg hover:bg-[#2563EB] transition-colors text-sm md:text-base w-full md:w-auto"
                  onClick={handleFeedbackSubmit}
                  disabled={feedbackLoading}
                >
                  {feedbackLoading ? 'Sending...' : 'Send Feedback'}
                </button>
                {feedbackError && <div className="text-red-500 text-sm mt-2">{feedbackError}</div>}
                {feedbackSuccess && <div className="text-green-600 text-sm mt-2">{feedbackSuccess}</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}


export default EvaluatorDashboard
