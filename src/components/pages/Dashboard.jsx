import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import DashboardStats from "@/components/organisms/DashboardStats";
import RecentActivity from "@/components/organisms/RecentActivity";
import QuickActions from "@/components/organisms/QuickActions";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { getDashboardData } from "@/services/api/dashboardService";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useSelector((state) => state.user);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const dashboardData = await getDashboardData();
      setData(dashboardData);
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setError("Failed to load dashboard data. Please try again.");
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    
    // Set up automatic refresh every 30 seconds for real-time updates
    const intervalId = setInterval(() => {
      loadDashboardData();
    }, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadDashboardData} />;
  }

  if (!data) {
    return (
      <Empty
        title="Dashboard Not Available"
        description="Unable to load dashboard data at this time"
        icon="BarChart3"
        actionLabel="Reload Dashboard"
        onAction={loadDashboardData}
      />
    );
  }

  // Get user's first name for personalized greeting
  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'there';
  const currentHour = new Date().getHours();
  let greeting = 'Good morning';
  if (currentHour >= 12 && currentHour < 17) {
    greeting = 'Good afternoon';
  } else if (currentHour >= 17) {
    greeting = 'Good evening';
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center shadow-lg">
            <ApperIcon name="BarChart3" size={18} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Dashboard
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here's an overview of your freelance business.
        </p>
      </motion.div>

      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 rounded-2xl p-6 text-white shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{greeting}, {firstName}! 👋</h2>
            <p className="text-primary-100">
              You have {data.summary.activeProjects} active projects and {data.summary.pendingTasks} pending tasks to review.
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <ApperIcon name="TrendingUp" size={28} className="text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <DashboardStats dashboardData={data} />
      </motion.div>

      {/* Content Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <RecentActivity dashboardData={data} />
        <QuickActions />
      </motion.div>
    </div>
  );
};

export default Dashboard;