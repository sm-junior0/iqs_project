"use client";

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardNavbar from "../../components/DashboardNavbar";
import { io } from "socket.io-client";
import {
  LayoutDashboard,
  SchoolIcon,
  Users,
  FileText,
  MessageSquare,
  Settings,
  Search,
  TrendingUp,
  MoreHorizontal,
  Send,
  Smile,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Bell,
} from "lucide-react";
// Add a comment to remind user to install socket.io-client if not already installed
// npm install socket.io-client
import toast from "react-hot-toast";

interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: string;
}

interface School {
  id: string;
  name: string;
  country: string;
  joiningDate: string;
  accreditationPeriod: string;
  status?: "pending" | "approved" | "denied" | "rejected";
  evaluator_id: string;
  created_at: string;
}

interface Evaluator {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface Report {
  id: string;
  name: string;
  schoolLocation: string;
  evaluatorName: string;
  uploadDate: string;
  schoolName: string;
  documents: string[];
}

interface Message {
  id: string;
  sender: string;
  role: string;
  message: string;
  timestamp: string;
  avatar: string;
  type: "headmaster" | "evaluator" | "trainer";
}

interface MessageTab {
  id: string;
  label: string;
  count: number;
  type: "all" | "headmaster" | "evaluator" | "trainer";
}

// --- Conversation-based Messaging State ---
// Conversation and message types
interface Conversation {
  id: string;
  participants: any[]; // user objects or group info
  last_message: string;
  updated_at: string;
  type: string; // 'user' | 'group'
  group?: string; // group name if group
  name?: string; // display name
  group_name?: string; // <-- add this
  other_user_name?: string; // <-- add this
  other_user_id?: string;
  user_ids?: string[];
}
interface ConversationMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  message: string;
  timestamp: string;
  avatar?: string;
}

const AdminDashboard: React.FC = () => {
  // ...existing state and logic

  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeMessageTab, setActiveMessageTab] = useState<string>("all");
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [showMobileMessageList, setShowMobileMessageList] =
    useState<boolean>(true);

  // --- Integration: Fetch data from backend ---
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentSchools, setRecentSchools] = useState<School[]>([]);
  const [requestedSchools, setRequestedSchools] = useState<School[]>([]);
  const [accreditedSchools, setAccreditedSchools] = useState<School[]>([]);
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Add at the top of the component:
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(
    null
  );

  const [showCompose, setShowCompose] = useState(false);
  const [composeRecipient, setComposeRecipient] = useState("");
  const [composeMessage, setComposeMessage] = useState("");
  const [composeRecipientType, setComposeRecipientType] = useState("group"); // 'group' or 'user'
  const [composeGroup, setComposeGroup] = useState("");
  const [composeUserId, setComposeUserId] = useState("");
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState<string>("");

  // Conversation state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<
    ConversationMessage[]
  >([]);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [conversationError, setConversationError] = useState<string | null>(
    null
  );
  const [realTimeMessages, setRealTimeMessages] = useState<any[]>([]);
  const [unreadConversations, setUnreadConversations] = useState<Set<string>>(
    new Set()
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  // Auto-scroll when messages are first loaded or when new messages arrive
  useEffect(() => {
    if (conversationMessages.length > 0 || realTimeMessages.length > 0) {
      scrollToBottom();
    }
  }, [conversationMessages, realTimeMessages]);

  // Assignment modal state
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedSchoolForAssignment, setSelectedSchoolForAssignment] =
    useState<any>(null);
  const [selectedEvaluatorForAssignment, setSelectedEvaluatorForAssignment] =
    useState("");
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [assignmentSuccess, setAssignmentSuccess] = useState<string | null>(
    null
  );

  // Profile state
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileFormData, setProfileFormData] = useState({
    name: "",
    email: "",
  });

  // 1. Add applications state and fetch applications in useEffect
  const [applications, setApplications] = useState<any[]>([]);

  // Fetch notifications function
  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      setNotificationsError(error.message);
      // Create fallback notifications if API fails
      createFallbackNotifications();
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Create fallback notifications when API is not available
  const createFallbackNotifications = () => {
    const fallbackNotifications = [
      {
        id: "welcome",
        message: "👋 Welcome to IQS Authority! Your admin dashboard is ready.",
        timestamp: new Date().toISOString(),
        type: "info",
        category: "general",
        read: false,
        data: {},
      },
      {
        id: "pending-applications",
        message: "📝 You have pending school applications to review",
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        type: "warning",
        category: "application",
        read: false,
        data: {},
      },
      {
        id: "recent-reports",
        message: "📊 New evaluation reports have been submitted",
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        type: "success",
        category: "report",
        read: false,
        data: {},
      },
    ];
    setNotifications(fallbackNotifications);
  };

  // Mark notification as read
  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/applications`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch applications");
        const data = await res.json();
        setApplications(data.applications || []);
      } catch (err) {
        setApplications([]);
      }
    };
    fetchApplications();
  }, []);

  // 2. Helper to check if a school has a pending application
  const hasPendingApplication = (schoolId: string) =>
    applications.some(
      (app) => app.school_id === schoolId && app.status === "pending"
    );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = token
          ? { Authorization: `Bearer ${token}` }
          : {};
        // Fetch stats (custom endpoint or aggregate manually)
        const [schoolsRes, evaluatorsRes, reportsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/admin/schools`, {
            headers,
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/admin/evaluators`, {
            headers,
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/admin/reports`, {
            headers,
          }),
        ]);
        if (!schoolsRes.ok || !evaluatorsRes.ok || !reportsRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const schoolsData = await schoolsRes.json();
        const evaluatorsData = await evaluatorsRes.json();
        const reportsData = await reportsRes.json();

        setStats([
          {
            title: "Total Schools",
            value: schoolsData.schools.length.toString(),
            change: "",
            icon: "$",
          },
          {
            title: "Total Evaluators",
            value: evaluatorsData.evaluators.length.toString(),
            change: "",
            icon: "$",
          },
          {
            title: "Total Reports",
            value: reportsData.reports.length.toString(),
            change: "",
            icon: "$",
          },
          {
            title: "Total Evaluations",
            value: reportsData.reports.length.toString(),
            change: "",
            icon: "$",
          },
        ]);
        setRecentSchools(schoolsData.schools.slice(0, 3));
        setRequestedSchools(
          schoolsData.schools.filter((s: School) => s.status === "pending")
        );
        setAccreditedSchools(
          schoolsData.schools.filter((s: School) => s.status === "approved")
        );
        setEvaluators(evaluatorsData.evaluators);
        // Map reports to include schoolName, schoolLocation, evaluatorName, and uploadDate
        const reportsWithDetails = reportsData.reports.map((report: any) => {
          const school = schoolsData.schools.find(
            (s: any) => String(s.id) === String(report.school_id)
          );
          const evaluator = evaluatorsData.evaluators.find(
            (e: any) => String(e.id) === String(report.evaluator_id)
          );
          return {
            ...report,
            schoolName: school ? school.name : "",
            schoolLocation: school ? school.country : "",
            evaluatorName: evaluator ? evaluator.name : "",
            uploadDate: report.submitted_at
              ? new Date(report.submitted_at).toLocaleString()
              : "",
            documents: report.report_path ? [report.report_path] : [],
          };
        });
        setReports(reportsWithDetails);
      } catch (err: any) {
        setError(err.message || "Error loading dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hasPendingApplication]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL);
    // Socket.IO client initialized

    const userId = localStorage.getItem("userId");
    if (userId) {
      socket.emit("register", userId);
      // Register event emitted for userId
    } else {
      console.warn(
        "No userId found in localStorage during socket registration"
      );
    }

    socket.on("receive-message", (data: any) => {
      // Received message via socket
      setNotifications((prev) => [
        {
          id: Date.now().toString(),
          message: data.message,
          timestamp: new Date().toLocaleString(),
        },
        ...prev,
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Fetch all users for the custom user dropdown
    const fetchAllUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/users`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setAllUsers(data.users || []);
      } catch (err) {
        setAllUsers([]);
      }
    };
    fetchAllUsers();
    fetchNotifications();
  }, []);

  // Fetch profile when settings tab is active
  useEffect(() => {
    if (activeTab === "settings") {
      fetchProfile();
    }
  }, [activeTab]);

  // Fetch profile when messaging tab is active (needed for sending messages)
  useEffect(() => {
    if (activeTab === "messaging" && !profile) {
      fetchProfile();
    }
  }, [activeTab, profile]);

  const fetchProfile = async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/profile`,
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

  const updateProfile = async () => {
    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profileFormData),
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update profile");
      }
      const data = await res.json();
      setProfile(data.profile);
      setProfileSuccess("Profile updated successfully!");
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      setProfileError(err.message || "Error updating profile");
      toast.error("Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const messageTabs: MessageTab[] = [
    { id: "all", label: "All messages", count: 8, type: "all" },
    { id: "headmaster", label: "Headmaster", count: 3, type: "headmaster" },
    { id: "evaluator", label: "Evaluator", count: 2, type: "evaluator" },
    { id: "trainer", label: "Trainer", count: 3, type: "trainer" },
  ];

  // Socket connection for real-time messages
  useEffect(() => {
    if (activeTab === "messaging" && profile?.id) {
      const socket = io(
        import.meta.env.VITE_API_URL 
      );

      socket.on("connect", () => {
        // AdminDashboard: Socket connected
        socket.emit("register", profile.id);
      });

      socket.on("receive-message", (data: any) => {
        // AdminDashboard: Received real-time message

        // Move conversation to top and mark as unread
        setConversations((prevConversations) => {
          const updatedConversations = [...prevConversations];
          const conversationIndex = updatedConversations.findIndex(
            (conv) => conv.id.toString() === data.conversationId?.toString()
          );

          if (conversationIndex !== -1) {
            // Remove conversation from current position
            const [conversation] = updatedConversations.splice(
              conversationIndex,
              1
            );

            // Update conversation with new message and timestamp
            const updatedConversation = {
              ...conversation,
              updated_at: new Date().toISOString(),
              last_message: data.message,
            };

            // Add to top of list
            updatedConversations.unshift(updatedConversation);
          }

          return updatedConversations;
        });

        // Mark conversation as unread if not currently selected
        if (
          !selectedConversation ||
          selectedConversation.id.toString() !== data.conversationId?.toString()
        ) {
          setUnreadConversations((prev) =>
            new Set(prev).add(data.conversationId?.toString())
          );
        }

        // Only add to real-time messages if it belongs to the current conversation
        if (
          selectedConversation &&
          data.conversationId &&
          data.conversationId.toString() === selectedConversation.id.toString()
        ) {
          setRealTimeMessages((prev) => [...prev, data]);
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [activeTab, profile?.id, selectedConversation?.id]);

  // Fetch conversations when messaging tab is active
  useEffect(() => {
    if (activeTab === "messaging") {
      fetchConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchConversations = async () => {
    setConversationLoading(true);
    setConversationError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/messages/conversations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch conversations");
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (err: any) {
      setConversationError(err.message || "Error loading conversations");
    } finally {
      setConversationLoading(false);
    }
  };

  const fetchConversationMessages = async (conversationId: string) => {
    setConversationLoading(true);
    setConversationError(null);
    // Clear real-time messages when switching conversations
    setRealTimeMessages([]);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/messages/conversation/${conversationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      // Fetched messages
      setConversationMessages(data.messages || []);
    } catch (err: any) {
      setConversationError(err.message || "Error loading messages");
    } finally {
      setConversationLoading(false);
    }
  };

  const sendConversationMessage = async (
    conversationId: string,
    message: string
  ) => {
    // sendConversationMessage called
    setConversationLoading(true);
    setConversationError(null);
    try {
      const token = localStorage.getItem("token");

      // Check if profile is loaded
      if (!profile) {
        throw new Error("Profile not loaded. Please wait and try again.");
      }

      // Find the selected conversation to get recipient info
      const selectedConv = conversations.find(
        (conv) => conv.id === conversationId
      );
      if (!selectedConv) {
        throw new Error("Conversation not found");
      }

      // Determine recipient and type
      let recipientId, type;
      if (selectedConv.group_name) {
        // Group message
        recipientId = selectedConv.group_name;
        type = "group";
      } else {
        // Direct message - find the other user
        recipientId =
          selectedConv.other_user_id ||
          selectedConv.user_ids?.find((id) => id !== profile.id);
        type = "user";
      }

      // Sending message

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/messages/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            recipientId,
            message,
            type,
          }),
        }
      );
      // Fetch response
      if (!res.ok) throw new Error("Failed to send message");
      await fetchConversationMessages(conversationId); // Refresh messages
      setMessageInput(""); // Clear input
    } catch (err: any) {
      setConversationError(err.message || "Error sending message");
      console.error("Error in sendConversationMessage:", err);
    } finally {
      setConversationLoading(false);
    }
  };

  const startNewConversation = async (
    recipientType: string,
    recipient: string,
    message: string
  ) => {
    setConversationLoading(true);
    setConversationError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/messages/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            recipientId: recipient,
            message,
            type: recipientType,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to send message");
      await fetchConversations();
      setShowCompose(false);
      setComposeGroup("");
      setComposeUserId("");
      setComposeMessage("");
    } catch (err: any) {
      setConversationError(err.message || "Error starting conversation");
    } finally {
      setConversationLoading(false);
    }
  };

  // --- Backend integration handlers ---
  const handleApprove = async (schoolId: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/change-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ schoolId, status: "approved" }),
        }
      );
      if (!res.ok) throw new Error("Failed to approve school");
      // Refresh schools
      await refreshSchools();
    } catch (err: any) {
      setError(err.message || "Error approving school");
    } finally {
      setLoading(false);
    }
  };

  const handleDeny = async (schoolId: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/change-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ schoolId, status: "denied" }),
        }
      );
      if (!res.ok) throw new Error("Failed to deny school");
      await refreshSchools();
    } catch (err: any) {
      setError(err.message || "Error denying school");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reportId: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/reports/${reportId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to delete report");
      await refreshReports();
    } catch (err: any) {
      setError(err.message || "Error deleting report");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (reportId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/admin/reports/${reportId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to download report");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `report_${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || "Error downloading report");
    }
  };

  const handleDownloadFromModal = async () => {
    if (selectedReport) {
      await handleDownload(selectedReport.id);
    }
  };

  // --- Refresh helpers ---
  const refreshSchools = async () => {
    try {
      const token = localStorage.getItem("token");
      const schoolsRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/schools`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!schoolsRes.ok) throw new Error("Failed to refresh schools");
      const schoolsData = await schoolsRes.json();
      // RefreshSchools data received
      setRecentSchools(schoolsData.slice(0, 3));
      setRequestedSchools(
        schoolsData.filter((s: School) => s.status === "pending")
      );
      setAccreditedSchools(
        schoolsData.filter((s: School) => s.status === "approved")
      );
    } catch (err: any) {
      console.error("[RefreshSchools] Error:", err);
      setError(err.message || "Error refreshing schools");
    }
  };

  const refreshReports = async () => {
    try {
      const token = localStorage.getItem("token");
      // Fetch all needed data
      const [schoolsRes, evaluatorsRes, reportsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/admin/schools`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/admin/evaluators`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/admin/reports`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (!schoolsRes.ok || !evaluatorsRes.ok || !reportsRes.ok) {
        throw new Error("Failed to refresh reports");
      }
      const schoolsData = await schoolsRes.json();
      const evaluatorsData = await evaluatorsRes.json();
      const reportsData = await reportsRes.json();

      // Map reports as before
      const reportsWithDetails = reportsData.reports.map((report: any) => {
        const school = schoolsData.schools.find(
          (s: any) => String(s.id) === String(report.school_id)
        );
        const evaluator = evaluatorsData.evaluators.find(
          (e: any) => String(e.id) === String(report.evaluator_id)
        );
        return {
          ...report,
          schoolName: school ? school.name : "",
          schoolLocation: school ? school.country : "",
          evaluatorName: evaluator ? evaluator.name : "",
          uploadDate: report.submitted_at
            ? new Date(report.submitted_at).toLocaleString()
            : "",
          documents: report.report_path ? [report.report_path] : [],
        };
      });
      setReports(reportsWithDetails);
    } catch (err: any) {
      setError(err.message || "Error refreshing reports");
    }
  };
  // --- End Backend integration handlers ---

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "schools", label: "Schools", icon: SchoolIcon },
    { id: "evaluators", label: "Evaluators", icon: Users },
    {
      id: "evaluation-reports",
      label: "Evaluation and Reports",
      icon: FileText,
    },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "messaging", label: "Messaging", icon: MessageSquare },
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
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
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
        ))}
      </div>

      {/* Recent Schools */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Schools
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
                placeholder="Search School"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
              />
            </div>
            <select className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent">
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
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evaluator Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentSchools.map((school) => {
                const evaluator = evaluators.find(
                  (e) => String(e.id) === String(school.evaluator_id)
                );
                return (
                  <tr key={school.name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {school.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {school.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {school.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {evaluator ? evaluator.name : ""}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {school.created_at
                        ? new Date(school.created_at).toLocaleString()
                        : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden p-4 space-y-4">
          {recentSchools.map((school) => (
            <MobileCard key={school.name}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{school.name}</h3>
                  <p className="text-sm text-gray-500">
                    Country: {school.country}
                  </p>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  Pending
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Joining Date:</span>
                  <p className="font-medium">{school.joiningDate}</p>
                </div>
                <div>
                  <span className="text-gray-500">Period:</span>
                  <p className="font-medium">{school.accreditationPeriod}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleApprove(school.id)}
                  className="bg-[#1B365D] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2563EB] transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleDeny(school.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Deny
                </button>
              </div>
            </MobileCard>
          ))}
        </div>
      </div>

      {/* Requested Schools */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Requested Schools
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
                placeholder="Search School"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
              />
            </div>
            <select className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent">
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
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evaluator Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requestedSchools
                .filter((school) => school.status === "pending")
                .map((school) => {
                  const evaluator = evaluators.find(
                    (e) => String(e.id) === String(school.evaluator_id)
                  );
                  return (
                    <tr key={school.name}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {school.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {school.country}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {school.status}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {evaluator ? evaluator.name : ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {school.created_at
                          ? new Date(school.created_at).toLocaleString()
                          : ""}
                      </td>
                      {!school.evaluator_id && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 space-x-2">
                          <button
                            onClick={() => handleApproveSchool(school.id)}
                            className="bg-[#1B365D] text-white px-3 py-2 rounded text-sm hover:bg-[#2563EB] transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleDenySchool(school.id)}
                            className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                          >
                            Deny
                          </button>
                          <button
                            onClick={() => openAssignmentModal(school)}
                            className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            Assign Evaluator
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden p-4 space-y-4">
          {requestedSchools
            .filter((school) => school.status === "pending")
            .map((school) => (
              <MobileCard key={school.name}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{school.name}</h3>
                    <p className="text-sm text-gray-500">
                      Country: {school.country}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Pending
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Joining Date:</span>
                    <p className="font-medium">{school.joiningDate}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Period:</span>
                    <p className="font-medium">{school.accreditationPeriod}</p>
                  </div>
                </div>
                {!school.evaluator_id && (
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <button
                      onClick={() => handleApproveSchool(school.id)}
                      className="bg-[#1B365D] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2563EB] transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDenySchool(school.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      Deny
                    </button>
                    <button
                      onClick={() => openAssignmentModal(school)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Assign Evaluator
                    </button>
                  </div>
                )}
              </MobileCard>
            ))}
        </div>
      </div>

      {/* Recent Evaluators */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Evaluators
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
                placeholder="Search Evaluator"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
              />
            </div>
            <select className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent">
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
                  Evaluator Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joining Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {evaluators.slice(0, 3).map((evaluator) => (
                <tr key={evaluator.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {evaluator.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {evaluator.created_at
                      ? new Date(evaluator.created_at).toLocaleString()
                      : ""}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {evaluator.email}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden p-4 space-y-4">
          {evaluators.slice(0, 3).map((evaluator) => (
            <MobileCard key={evaluator.id}>
              <div className="font-medium text-gray-900">{evaluator.name}</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Joining Date:</span>
                  <p className="font-medium">
                    {evaluator.created_at
                      ? new Date(evaluator.created_at).toLocaleString()
                      : ""}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <p className="font-medium">{evaluator.email}</p>
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
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Reports
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
                placeholder="Search Report"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
              />
            </div>
            <select className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent">
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
                  School Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evaluator Name
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
              {reports.slice(0, 7).map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.schoolLocation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.evaluatorName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.uploadDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleDownload(report.id)}
                      className="bg-[#1B365D] text-white px-3 py-1 rounded text-sm hover:bg-[#2563EB] transition-colors"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleView(report)}
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
        <div className="lg:hidden p-4 space-y-4">
          {reports.slice(0, 7).map((report) => (
            <MobileCard key={report.id}>
              <div>
                <h3 className="font-medium text-gray-900">{report.name}</h3>
                <p className="text-sm text-gray-500">{report.schoolLocation}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Evaluator:</span>
                  <p className="font-medium">{report.evaluatorName}</p>
                </div>
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
                  onClick={() => handleView(report)}
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
    </div>
  );

  const renderSchools = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Schools</h1>
        <button
          className="lg:hidden p-2 rounded-lg bg-[#1B365D] text-white"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Requested Schools */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Requested Schools
            </h2>
            <button className="bg-[#1B365D] text-white px-4 py-2 rounded-lg text-sm font-medium w-full sm:w-auto">
              Load More
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
                placeholder="Search School"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
              />
            </div>
            <select className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent">
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
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requestedSchools
                .filter((school) => school.status === "pending")
                .map((school) => {
                  const evaluator = evaluators.find(
                    (e) => String(e.id) === String(school.evaluator_id)
                  );
                  return (
                    <tr key={school.name}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {school.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {school.country}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {school.status}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {school.created_at
                          ? new Date(school.created_at).toLocaleString()
                          : ""}
                      </td>
                      {!school.evaluator_id && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 space-x-2">
                          <button
                            onClick={() => handleApproveSchool(school.id)}
                            className="bg-[#1B365D] text-white px-3 py-2 rounded text-sm hover:bg-[#2563EB] transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleDenySchool(school.id)}
                            className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                          >
                            Deny
                          </button>
                          <button
                            onClick={() => openAssignmentModal(school)}
                            className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            Assign Evaluator
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden p-4 space-y-4">
          {requestedSchools
            .filter((school) => school.status === "pending")
            .map((school) => (
              <MobileCard key={school.name}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{school.name}</h3>
                    <p className="text-sm text-gray-500">
                      Country: {school.country}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Pending
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Joining Date:</span>
                    <p className="font-medium">{school.joiningDate}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Period:</span>
                    <p className="font-medium">{school.accreditationPeriod}</p>
                  </div>
                </div>
                {!school.evaluator_id && (
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <button
                      onClick={() => handleApproveSchool(school.id)}
                      className="bg-[#1B365D] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2563EB] transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDenySchool(school.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      Deny
                    </button>
                    <button
                      onClick={() => openAssignmentModal(school)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Assign Evaluator
                    </button>
                  </div>
                )}
              </MobileCard>
            ))}
        </div>
      </div>

      {/* Accredited Schools */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Accredited Schools (30)
            </h2>
            <button className="bg-[#1B365D] text-white px-4 py-2 rounded-lg text-sm font-medium w-full sm:w-auto">
              Load More
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
                placeholder="Search School"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
              />
            </div>
            <select className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent">
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
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evaluator Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accreditedSchools.map((school) => {
                const evaluator = evaluators.find(
                  (e) => String(e.id) === String(school.evaluator_id)
                );
                return (
                  <tr key={school.name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {school.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {school.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {school.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {evaluator ? evaluator.name : ""}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {school.created_at
                        ? new Date(school.created_at).toLocaleString()
                        : ""}
                    </td>
                    {!school.evaluator_id && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 space-x-2">
                        <button
                          onClick={() => openAssignmentModal(school)}
                          className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Assign Evaluator
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden p-4 space-y-4">
          {accreditedSchools.map((school) => (
            <MobileCard key={school.name}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{school.name}</h3>
                  <p className="text-sm text-gray-500">
                    Country: {school.country}
                  </p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Accredited
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Joining Date:</span>
                  <p className="font-medium">{school.joiningDate}</p>
                </div>
                <div>
                  <span className="text-gray-500">Period:</span>
                  <p className="font-medium">{school.accreditationPeriod}</p>
                </div>
              </div>
              {!school.evaluator_id && (
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <button
                    onClick={() => openAssignmentModal(school)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Assign Evaluator
                  </button>
                </div>
              )}
            </MobileCard>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEvaluators = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Evaluators
        </h1>
        <button
          className="lg:hidden p-2 rounded-lg bg-[#1B365D] text-white"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Evaluators (80)
            </h2>
            <button className="bg-[#1B365D] text-white px-4 py-2 rounded-lg text-sm font-medium w-full sm:w-auto">
              Load More
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
                placeholder="Search Evaluator"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
              />
            </div>
            <select className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent">
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
                  Evaluator Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joining Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {evaluators.map((evaluator) => (
                <tr key={evaluator.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {evaluator.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {evaluator.created_at
                      ? new Date(evaluator.created_at).toLocaleString()
                      : ""}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {evaluator.email}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden p-4 space-y-4">
          {evaluators.map((evaluator) => (
            <MobileCard key={evaluator.id}>
              <div className="font-medium text-gray-900">{evaluator.name}</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Joining Date:</span>
                  <p className="font-medium">
                    {evaluator.created_at
                      ? new Date(evaluator.created_at).toLocaleString()
                      : ""}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <p className="font-medium">{evaluator.email}</p>
                </div>
              </div>
            </MobileCard>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEvaluationReports = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Evaluation and Reports
        </h1>
        <button
          className="lg:hidden p-2 rounded-lg bg-[#1B365D] text-white"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
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
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Schools Accreditation Summary
          </h3>
          <div className="h-48 sm:h-64">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              {/* Calculate data for the chart */}
              {(() => {
                const totalSchools =
                  requestedSchools.length + accreditedSchools.length;
                const pendingCount = requestedSchools.filter(
                  (s) => s.status === "pending"
                ).length;
                const approvedCount = accreditedSchools.filter(
                  (s) => s.status === "approved"
                ).length;
                const deniedCount = requestedSchools.filter(
                  (s) => s.status === "denied" || s.status === "rejected"
                ).length;

                const maxValue = Math.max(
                  pendingCount,
                  approvedCount,
                  deniedCount,
                  1
                );
                const barWidth = 60;
                const barSpacing = 40;
                const startX = 50;
                const chartHeight = 120;
                const startY = 160;

                return (
                  <>
                    {/* Bars */}
                    <rect
                      x={startX}
                      y={startY - (pendingCount / maxValue) * chartHeight}
                      width={barWidth}
                      height={(pendingCount / maxValue) * chartHeight}
                      fill="#F59E0B"
                      className="hover:fill-yellow-600 transition-colors"
                    />
                    <rect
                      x={startX + barWidth + barSpacing}
                      y={startY - (approvedCount / maxValue) * chartHeight}
                      width={barWidth}
                      height={(approvedCount / maxValue) * chartHeight}
                      fill="#10B981"
                      className="hover:fill-green-600 transition-colors"
                    />
                    <rect
                      x={startX + (barWidth + barSpacing) * 2}
                      y={startY - (deniedCount / maxValue) * chartHeight}
                      width={barWidth}
                      height={(deniedCount / maxValue) * chartHeight}
                      fill="#EF4444"
                      className="hover:fill-red-600 transition-colors"
                    />

                    {/* X-axis labels */}
                    <text
                      x={startX + barWidth / 2}
                      y="185"
                      textAnchor="middle"
                      className="text-xs fill-gray-600"
                    >
                      Pending ({pendingCount})
                    </text>
                    <text
                      x={startX + barWidth + barSpacing + barWidth / 2}
                      y="185"
                      textAnchor="middle"
                      className="text-xs fill-gray-600"
                    >
                      Approved ({approvedCount})
                    </text>
                    <text
                      x={startX + (barWidth + barSpacing) * 2 + barWidth / 2}
                      y="185"
                      textAnchor="middle"
                      className="text-xs fill-gray-600"
                    >
                      Denied ({deniedCount})
                    </text>

                    {/* Y-axis labels */}
                    <text x="20" y="45" className="text-xs fill-gray-500">
                      {maxValue}
                    </text>
                    <text x="20" y="85" className="text-xs fill-gray-500">
                      {Math.round(maxValue * 0.75)}
                    </text>
                    <text x="20" y="125" className="text-xs fill-gray-500">
                      {Math.round(maxValue * 0.5)}
                    </text>
                    <text x="20" y="165" className="text-xs fill-gray-500">
                      0
                    </text>

                    {/* Data labels on bars */}
                    <text
                      x={startX + barWidth / 2}
                      y={startY - (pendingCount / maxValue) * chartHeight - 5}
                      textAnchor="middle"
                      className="text-xs fill-gray-700 font-medium"
                    >
                      {pendingCount}
                    </text>
                    <text
                      x={startX + barWidth + barSpacing + barWidth / 2}
                      y={startY - (approvedCount / maxValue) * chartHeight - 5}
                      textAnchor="middle"
                      className="text-xs fill-gray-700 font-medium"
                    >
                      {approvedCount}
                    </text>
                    <text
                      x={startX + (barWidth + barSpacing) * 2 + barWidth / 2}
                      y={startY - (deniedCount / maxValue) * chartHeight - 5}
                      textAnchor="middle"
                      className="text-xs fill-gray-700 font-medium"
                    >
                      {deniedCount}
                    </text>
                  </>
                );
              })()}
            </svg>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Evaluators Trend Summary
          </h3>
          <div className="h-48 sm:h-64">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              {/* Calculate evaluator data by month */}
              {(() => {
                const monthlyData = Array.from({ length: 12 }, (_, i) => {
                  const month = i + 1;
                  const year = new Date().getFullYear();
                  const count = evaluators.filter((evaluator) => {
                    const evaluatorDate = new Date(evaluator.created_at);
                    return (
                      evaluatorDate.getMonth() === i &&
                      evaluatorDate.getFullYear() === year
                    );
                  }).length;
                  return { month, count };
                });

                const maxCount = Math.max(
                  ...monthlyData.map((d) => d.count),
                  1
                );
                const monthNames = [
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ];
                const barWidth = 20;
                const barSpacing = 10;
                const startX = 50;
                const chartHeight = 120;
                const startY = 160;

                return (
                  <>
                    {/* Chart bars */}
                    {monthlyData.map((data, i) => {
                      const barHeight = (data.count / maxCount) * chartHeight;
                      const x = startX + i * (barWidth + barSpacing);
                      const y = startY - barHeight;

                      return (
                        <rect
                          key={i}
                          x={x}
                          y={y}
                          width={barWidth}
                          height={barHeight}
                          fill="#1B365D"
                          className="hover:fill-blue-700 transition-colors"
                        />
                      );
                    })}

                    {/* X-axis labels */}
                    {monthNames.map((month, i) => (
                      <text
                        key={month}
                        x={startX + i * (barWidth + barSpacing) + barWidth / 2}
                        y="185"
                        textAnchor="middle"
                        className="text-xs fill-gray-600"
                      >
                        {month}
                      </text>
                    ))}

                    {/* Y-axis labels */}
                    <text x="20" y="45" className="text-xs fill-gray-500">
                      {maxCount}
                    </text>
                    <text x="20" y="85" className="text-xs fill-gray-500">
                      {Math.round(maxCount * 0.75)}
                    </text>
                    <text x="20" y="125" className="text-xs fill-gray-500">
                      {Math.round(maxCount * 0.5)}
                    </text>
                    <text x="20" y="165" className="text-xs fill-gray-500">
                      0
                    </text>

                    {/* Data labels on bars */}
                    {monthlyData.map((data, i) => {
                      const barHeight = (data.count / maxCount) * chartHeight;
                      const x =
                        startX + i * (barWidth + barSpacing) + barWidth / 2;
                      const y = startY - barHeight - 5;

                      return (
                        <text
                          key={`label-${i}`}
                          x={x}
                          y={y}
                          textAnchor="middle"
                          className="text-xs fill-gray-700 font-medium"
                        >
                          {data.count}
                        </text>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>
      </div>

      {/* Uploaded Reports */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Uploaded Reports (10)
            </h2>
            <button className="bg-[#1B365D] text-white px-4 py-2 rounded-lg text-sm font-medium w-full sm:w-auto">
              Load More
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
                placeholder="Search Report"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
              />
            </div>
            <select className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent">
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
                  Report Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evaluator Name
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.schoolLocation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.evaluatorName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.uploadDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleDownload(report.id)}
                      className="bg-[#1B365D] text-white px-3 py-1 rounded text-sm hover:bg-[#2563EB] transition-colors"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleView(report)}
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
        <div className="lg:hidden p-4 space-y-4">
          {reports.map((report) => (
            <MobileCard key={report.id}>
              <div>
                <h3 className="font-medium text-gray-900">{report.name}</h3>
                <p className="text-sm text-gray-500">{report.schoolLocation}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Evaluator:</span>
                  <p className="font-medium">{report.evaluatorName}</p>
                </div>
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
                  onClick={() => handleView(report)}
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
    </div>
  );

  const renderMessaging = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Messaging
        </h1>
        <button
          className="lg:hidden p-2 rounded-lg bg-[#1B365D] text-white"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={20} />
        </button>
      </div>
      <button
        className="mb-4 px-4 py-2 rounded bg-[#1B365D] text-white"
        onClick={() => setShowCompose(true)}
      >
        + New Message
      </button>
      {showCompose && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">New Message</h2>
            <label className="block mb-2">Send to:</label>
            <select
              className="border rounded px-2 py-1 w-full mb-4"
              value={composeRecipientType === "user" ? "user" : composeGroup}
              onChange={(e) => {
                if (e.target.value === "user") {
                  setComposeRecipientType("user");
                  setComposeGroup("");
                } else {
                  setComposeRecipientType("group");
                  setComposeGroup(e.target.value);
                }
              }}
            >
              <option value="all">All</option>
              <option value="evaluators">Evaluators</option>
              <option value="trainers">Trainers</option>
              <option value="schools">Schools</option>
              <option value="user">Custom User</option>
            </select>
            {composeRecipientType === "user" && (
              <select
                className="border rounded px-2 py-1 w-full mb-4"
                value={composeUserId}
                onChange={(e) => setComposeUserId(e.target.value)}
              >
                <option value="">Select a user</option>
                {allUsers.map((user: any) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            )}
            <label className="block mb-2">Message:</label>
            <textarea
              className="border rounded px-2 py-1 w-full mb-4"
              rows={3}
              value={composeMessage}
              onChange={(e) => setComposeMessage(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 rounded bg-gray-200"
                onClick={() => setShowCompose(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-[#1B365D] text-white"
                onClick={async () => {
                  const recipient =
                    composeRecipientType === "user"
                      ? composeUserId
                      : composeGroup;
                  await startNewConversation(
                    composeRecipientType,
                    recipient,
                    composeMessage
                  );
                }}
                disabled={
                  (composeRecipientType === "user" && !composeUserId) ||
                  (composeRecipientType === "group" && !composeGroup) ||
                  !composeMessage
                }
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 h-[500px] sm:h-[600px]">
        {/* Conversations List */}
        <div
          className={`bg-white rounded-lg shadow-sm border ${
            !showMobileMessageList && selectedConversation
              ? "hidden lg:block"
              : ""
          }`}
        >
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  Conversations
                </h2>
                <span className="bg-[#1B365D] text-white text-xs px-2 py-1 rounded-full">
                  {conversations.length}
                </span>
              </div>
              {selectedConversation && (
                <button
                  className="lg:hidden p-1 rounded text-gray-500"
                  onClick={() => setShowMobileMessageList(false)}
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>
          <div
            className="p-4 space-y-4 overflow-y-auto"
            style={{ maxHeight: "300px" }}
          >
            {conversationLoading && <div>Loading...</div>}
            {conversationError && (
              <div className="text-red-600">{conversationError}</div>
            )}
            {conversations.map((conv) => {
              // Helper function to get user name
              const getUserName = (userId: string) => {
                if (conv.other_user_name) return conv.other_user_name;
                const user = allUsers.find((u: any) => u.id === userId);
                return user ? user.name : `User ${userId}`;
              };

              // Determine display name
              let displayName;
              if (conv.type === "group") {
                displayName = conv.group_name || conv.group || "Group";
              } else {
                // For individual conversations
                const otherUserId =
                  conv.other_user_id ||
                  conv.user_ids?.find((id: string) => id !== profile?.id);
                displayName = otherUserId
                  ? getUserName(otherUserId)
                  : `User ${conv.id}`;
              }

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv);
                    setShowMobileMessageList(false);
                    fetchConversationMessages(conv.id);
                    // Clear unread status when conversation is selected
                    setUnreadConversations((prev) => {
                      const newSet = new Set(prev);
                      newSet.delete(conv.id.toString());
                      return newSet;
                    });
                  }}
                  className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation?.id === conv.id
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1B365D] text-white flex items-center justify-center text-sm font-semibold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {displayName}
                        </p>
                        {unreadConversations.has(conv.id.toString()) && (
                          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {conv.updated_at
                          ? new Date(conv.updated_at).toLocaleString()
                          : ""}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      {conv.type === "group" ? "Group" : "Individual"}
                    </p>
                    <p
                      className={`text-sm truncate ${
                        unreadConversations.has(conv.id.toString())
                          ? "text-gray-900 font-medium"
                          : "text-gray-600"
                      }`}
                    >
                      {conv.last_message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Chat Area */}
        <div
          className={`lg:col-span-2 bg-white rounded-lg shadow-sm border flex flex-col h-[60vh] max-h-[60vh] ${
            showMobileMessageList && selectedConversation
              ? "hidden lg:flex"
              : ""
          }`}
        >
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      className="lg:hidden p-1 rounded text-gray-500"
                      onClick={() => setShowMobileMessageList(true)}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1B365D] text-white flex items-center justify-center text-sm font-semibold">
                      {(() => {
                        // Helper function to get user name
                        const getUserName = (userId: string) => {
                          if (selectedConversation.other_user_name)
                            return selectedConversation.other_user_name;
                          const user = allUsers.find(
                            (u: any) => u.id === userId
                          );
                          return user ? user.name : `User ${userId}`;
                        };

                        // Determine display name
                        if (selectedConversation.type === "group") {
                          return (
                            selectedConversation.group_name ||
                            selectedConversation.group ||
                            "Group"
                          )
                            .charAt(0)
                            .toUpperCase();
                        } else {
                          // For individual conversations
                          const otherUserId =
                            selectedConversation.other_user_id ||
                            selectedConversation.user_ids?.find(
                              (id: string) => id !== profile?.id
                            );
                          const displayName = otherUserId
                            ? getUserName(otherUserId)
                            : `User ${selectedConversation.id}`;
                          return displayName.charAt(0).toUpperCase();
                        }
                      })()}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        {(() => {
                          // Helper function to get user name
                          const getUserName = (userId: string) => {
                            if (selectedConversation.other_user_name)
                              return selectedConversation.other_user_name;
                            const user = allUsers.find(
                              (u: any) => u.id === userId
                            );
                            return user ? user.name : `User ${userId}`;
                          };

                          // Determine display name
                          if (selectedConversation.type === "group") {
                            return (
                              selectedConversation.group_name ||
                              selectedConversation.group ||
                              "Group"
                            );
                          } else {
                            // For individual conversations
                            const otherUserId =
                              selectedConversation.other_user_id ||
                              selectedConversation.user_ids?.find(
                                (id: string) => id !== profile?.id
                              );
                            return otherUserId
                              ? getUserName(otherUserId)
                              : `User ${selectedConversation.id}`;
                          }
                        })()}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {selectedConversation.type === "group"
                          ? "Group"
                          : "Individual"}
                      </p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </div>
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {conversationMessages.map((msg) => {
                  const isSelf =
                    String(msg.sender_id) ===
                    String(localStorage.getItem("userId"));
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${
                        isSelf ? "justify-end" : "justify-start"
                      } mb-2`}
                    >
                      <div className="flex items-end">
                        <div className="w-8 h-8 rounded-full bg-[#1B365D] flex items-center justify-center text-white mr-2 text-sm font-semibold">
                          {msg.sender_name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div
                          className={`rounded-lg p-3 max-w-xs sm:max-w-md ${
                            isSelf
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p
                            className={`text-xs mt-2 ${
                              isSelf ? "text-gray-200" : "text-gray-500"
                            }`}
                          >
                            {msg.sender_name} • {msg.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* Real-time messages */}
                {realTimeMessages.map((msg, idx) => {
                  const isSelf = String(msg.sender_id) === String(profile?.id);
                  return (
                    <div
                      key={`realtime-${idx}`}
                      className={`flex ${
                        isSelf ? "justify-end" : "justify-start"
                      } mb-2`}
                    >
                      <div className="flex items-end">
                        <div className="w-8 h-8 rounded-full bg-[#1B365D] flex items-center justify-center text-white mr-2 text-sm font-semibold">
                          {msg.sender_name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div
                          className={`rounded-lg p-3 max-w-xs sm:max-w-md ${
                            isSelf
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p
                            className={`text-xs mt-2 ${
                              isSelf ? "text-gray-200" : "text-gray-500"
                            }`}
                          >
                            {msg.sender_name} • Now
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* Debug info - shows when real-time messages are received */}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t border-gray-200 flex-shrink-0">
                {conversationError && (
                  <div className="mb-2 text-sm text-red-600">
                    {conversationError}
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    disabled={conversationLoading}
                  >
                    <Smile size={20} />
                  </button>
                  <input
                    type="text"
                    placeholder="What would you like to say?"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent text-sm"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        messageInput.trim() &&
                        !conversationLoading &&
                        selectedConversation
                      ) {
                        console.log(
                          "Sending message via Enter:",
                          messageInput,
                          "to",
                          selectedConversation.id
                        );
                        sendConversationMessage(
                          selectedConversation.id,
                          messageInput
                        );
                        setMessageInput("");
                      }
                    }}
                    disabled={conversationLoading}
                  />
                  <button
                    className="bg-[#1B365D] text-white p-2 rounded-lg hover:bg-[#2563EB] transition-colors flex items-center justify-center"
                    onClick={() => {
                      if (selectedConversation && messageInput.trim()) {
                        console.log(
                          "Button send:",
                          messageInput,
                          "to",
                          selectedConversation.id
                        );
                        sendConversationMessage(
                          selectedConversation.id,
                          messageInput
                        );
                        setMessageInput("");
                      }
                    }}
                    disabled={conversationLoading || !messageInput.trim()}
                  >
                    {conversationLoading ? (
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        ></path>
                      </svg>
                    ) : (
                      <Send size={20} />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare
                  size={48}
                  className="text-gray-400 mx-auto mb-4"
                />
                <p className="text-gray-500">
                  Select a conversation to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Settings
        </h1>
        <button
          className="lg:hidden p-2 rounded-lg bg-[#1B365D] text-white"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Personal Settings */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6 sm:mb-8">
          Personal Settings
        </h2>

        {profileLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B365D] mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading profile...</p>
          </div>
        )}

        {profileError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{profileError}</p>
          </div>
        )}

        {profileSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600">{profileSuccess}</p>
          </div>
        )}

        {!profileLoading && profile && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Names
                </label>
                <input
                  type="text"
                  value={profileFormData.name}
                  onChange={(e) =>
                    setProfileFormData({
                      ...profileFormData,
                      name: e.target.value,
                    })
                  }
                  className="w-full border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#1B365D] bg-transparent"
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
                    setProfileFormData({
                      ...profileFormData,
                      email: e.target.value,
                    })
                  }
                  className="w-full border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#1B365D] bg-transparent"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={updateProfile}
                disabled={profileLoading}
                className="bg-[#1B365D] text-white px-6 py-2 rounded-lg hover:bg-[#2563EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {profileLoading ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6 sm:mb-8">
          Notifications
        </h2>

        <div className="text-center py-8">
          <p className="text-gray-500">
            Notification settings will be available in a future update.
          </p>
        </div>
      </div>

      {/* Data Backup */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6 sm:mb-8">
          Data Backup
        </h2>

        <div className="text-center py-8">
          <p className="text-gray-500">
            Data backup settings will be available in a future update.
          </p>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => {
    // Calculate notification stats
    const totalNotifications = notifications.length;
    const unreadNotifications = notifications.filter((n) => !n.read).length;
    const applicationNotifications = notifications.filter(
      (n) => n.category === "application"
    ).length;
    const reportNotifications = notifications.filter(
      (n) => n.category === "report"
    ).length;
    const assignmentNotifications = notifications.filter(
      (n) => n.category === "assignment"
    ).length;
    const userNotifications = notifications.filter(
      (n) => n.category === "user"
    ).length;

    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Notifications
          </h1>
          <button
            className="lg:hidden p-2 rounded-lg bg-[#1B365D] text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Notification Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalNotifications}
                </p>
              </div>
              <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                <Bell size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-orange-600">
                  {unreadNotifications}
                </p>
              </div>
              <div className="bg-orange-100 text-orange-600 p-2 rounded-lg">
                <Bell size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Applications
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {applicationNotifications}
                </p>
              </div>
              <div className="bg-yellow-100 text-yellow-600 p-2 rounded-lg">
                <FileText size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reports</p>
                <p className="text-2xl font-bold text-green-600">
                  {reportNotifications}
                </p>
              </div>
              <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                <FileText size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assignments</p>
                <p className="text-2xl font-bold text-purple-600">
                  {assignmentNotifications}
                </p>
              </div>
              <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                <Users size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Notifications
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={markAllNotificationsAsRead}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Mark All Read
                </button>
                <button
                  onClick={fetchNotifications}
                  className="bg-[#1B365D] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2563EB] transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 h-96 overflow-y-auto">
            {notificationsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B365D] mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading notifications...</p>
              </div>
            ) : notificationsError ? (
              <div className="text-center py-8">
                <p className="text-red-500">{notificationsError}</p>
                <button
                  onClick={fetchNotifications}
                  className="mt-2 bg-[#1B365D] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2563EB] transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                      notification.read
                        ? "bg-gray-50 border-gray-200"
                        : "bg-blue-50 border-blue-200"
                    }`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">
                            {notification.message.split(" ")[0]}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              notification.category === "application"
                                ? "bg-yellow-100 text-yellow-800"
                                : notification.category === "report"
                                ? "bg-green-100 text-green-800"
                                : notification.category === "assignment"
                                ? "bg-purple-100 text-purple-800"
                                : notification.category === "user"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {notification.category}
                          </span>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p
                          className={`text-sm ${
                            notification.read
                              ? "text-gray-600"
                              : "text-gray-900 font-medium"
                          }`}
                        >
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div
                        className={`ml-4 p-2 rounded-lg ${
                          notification.type === "success"
                            ? "bg-green-100 text-green-600"
                            : notification.type === "warning"
                            ? "bg-yellow-100 text-yellow-600"
                            : notification.type === "error"
                            ? "bg-red-100 text-red-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {notification.type === "success"
                          ? "✓"
                          : notification.type === "warning"
                          ? "⚠"
                          : notification.type === "error"
                          ? "✗"
                          : "ℹ"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "schools":
        return renderSchools();
      case "evaluators":
        return renderEvaluators();
      case "evaluation-reports":
        return renderEvaluationReports();
      case "notifications":
        return renderNotifications();
      case "messaging":
        return renderMessaging();
      case "settings":
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  // Add this handler near the other handlers in the component:
  const handleView = (report: Report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  // Add these handlers near the other handlers in the component:
  const handleApproveSchool = async (schoolId: string) => {
    // Approve called for schoolId
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/change-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: "school",
            id: schoolId,
            status: "approved",
          }),
        }
      );
      // API response status
      if (!res.ok) {
        const errorText = await res.text();
        console.error("[Approve] API error:", errorText);
        throw new Error("Failed to approve school");
      }
      setToastMessage("Application approved!");
      setTimeout(() => setToastMessage(null), 3000);
      await refreshSchools();
    } catch (err: any) {
      console.error("[Approve] Error:", err);
      setError(err.message || "Error approving school");
    } finally {
      setLoading(false);
    }
  };

  const handleDenySchool = async (schoolId: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/change-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: "school",
            id: schoolId,
            status: "denied",
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to deny school");
      await refreshSchools();
    } catch (err: any) {
      setError(err.message || "Error denying school");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignEvaluator = async () => {
    if (!selectedSchoolForAssignment || !selectedEvaluatorForAssignment) {
      setAssignmentError("Please select both a school and an evaluator");
      return;
    }

    setAssignmentLoading(true);
    setAssignmentError(null);
    setAssignmentSuccess(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/assign-evaluator`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            school_id: selectedSchoolForAssignment.id,
            evaluator_id: selectedEvaluatorForAssignment,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to assign evaluator");
      }

      setAssignmentSuccess("Evaluator assigned successfully!");
      setShowAssignmentModal(false);
      setSelectedSchoolForAssignment(null);
      setSelectedEvaluatorForAssignment("");

      // Refresh schools and evaluators data to show updated assignments
      await refreshSchools();
      await refreshEvaluators();
      toast.success("Evaluator assigned successfully!");
    } catch (err: any) {
      setAssignmentError(err.message || "Error assigning evaluator");
      toast.error("Failed to assign evaluator");
    } finally {
      setAssignmentLoading(false);
    }
  };

  const refreshEvaluators = async () => {
    try {
      const token = localStorage.getItem("token");
      const evaluatorsRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/evaluators`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!evaluatorsRes.ok) throw new Error("Failed to refresh evaluators");
      const evaluatorsData = await evaluatorsRes.json();
      setEvaluators(evaluatorsData.evaluators);
    } catch (err: any) {
      setEvaluators([]);
    }
  };

  const openAssignmentModal = (school: any) => {
    setSelectedSchoolForAssignment(school);
    setSelectedEvaluatorForAssignment("");
    setAssignmentError(null);
    setAssignmentSuccess(null);
    setShowAssignmentModal(true);
  };
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate("/auth/login");
  };

  return (
    <>
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
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600 transition"
            >
              Sign Out
            </button>
          </div>
          <div className="p-4 sm:p-6">{renderContent()}</div>
        </div>

        {/* Report View Modal */}
        {showReportModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    View Report
                  </h2>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      School Name
                    </label>
                    <p className="text-gray-900">{selectedReport.schoolName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      School Location
                    </label>
                    <p className="text-gray-900">
                      {selectedReport.schoolLocation}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Evaluator Name
                    </label>
                    <p className="text-gray-900">Mike Kingstone</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Uploaded Date
                    </label>
                    <p className="text-gray-900">10 January 2025</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Document
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedReport.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center p-4 border border-gray-200 rounded-lg"
                      >
                        <FileText size={48} className="text-gray-400 mb-2" />
                        <p className="text-sm text-gray-700 text-center">
                          {doc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-start">
                  <button
                    onClick={handleDownloadFromModal}
                    className="bg-[#1B365D] text-white px-6 py-2 rounded-lg hover:bg-[#2563EB] transition-colors w-full sm:w-auto"
                  >
                    Download Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded shadow-lg z-50 text-lg font-semibold animate-fade-in">
          {toastMessage}
        </div>
      )}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Assign Evaluator
                </h2>
                <button
                  onClick={() => setShowAssignmentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {assignmentError && (
                <div className="text-red-600 mb-4">{assignmentError}</div>
              )}
              {assignmentSuccess && (
                <div className="text-green-600 mb-4">{assignmentSuccess}</div>
              )}

              {/* Display selected school as read-only */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School
                </label>
                <p className="text-gray-900 font-medium">
                  {selectedSchoolForAssignment?.name || "No school selected"}
                </p>
                {selectedSchoolForAssignment?.country && (
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedSchoolForAssignment.country}
                  </p>
                )}
              </div>

              {/* Evaluator selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Evaluator
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
                  value={selectedEvaluatorForAssignment}
                  onChange={(e) =>
                    setSelectedEvaluatorForAssignment(e.target.value)
                  }
                >
                  <option value="">Select an evaluator</option>
                  {evaluators.map((evaluator) => (
                    <option key={evaluator.id} value={evaluator.id}>
                      {evaluator.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 rounded bg-gray-200"
                  onClick={() => setShowAssignmentModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-[#1B365D] text-white"
                  onClick={handleAssignEvaluator}
                  disabled={
                    !selectedSchoolForAssignment ||
                    !selectedEvaluatorForAssignment ||
                    assignmentLoading
                  }
                >
                  {assignmentLoading ? "Assigning..." : "Assign"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
