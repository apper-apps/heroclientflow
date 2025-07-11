import React from "react";
import StatCard from "@/components/molecules/StatCard";

const DashboardStats = ({ dashboardData }) => {
  // Use real data from the dashboard service
  const summary = dashboardData?.summary || {
    totalClients: 0,
    activeProjects: 0,
    pendingTasks: 0,
    monthlyRevenue: 0,
    completedTasks: 0,
    overdueItems: 0
  };

  const stats = [
    {
      title: "Total Clients",
      value: summary.totalClients.toString(),
      change: summary.totalClients > 0 ? "Active clients" : "No clients yet",
      changeType: summary.totalClients > 0 ? "positive" : "neutral",
      icon: "Users",
      delay: 0
    },
    {
      title: "Active Projects",
      value: summary.activeProjects.toString(),
      change: summary.activeProjects > 0 ? "In progress" : "No active projects",
      changeType: summary.activeProjects > 0 ? "positive" : "neutral",
      icon: "FolderOpen",
      delay: 0.1
    },
    {
      title: "Pending Tasks",
      value: summary.pendingTasks.toString(),
      change: summary.pendingTasks > 0 ? "Needs attention" : "All caught up",
      changeType: summary.pendingTasks > 10 ? "negative" : summary.pendingTasks > 0 ? "neutral" : "positive",
      icon: "CheckSquare",
      delay: 0.2
    },
    {
      title: "Monthly Revenue",
      value: `$${summary.monthlyRevenue.toLocaleString()}`,
      change: summary.monthlyRevenue > 0 ? "This month" : "No revenue yet",
      changeType: summary.monthlyRevenue > 0 ? "positive" : "neutral",
      icon: "DollarSign",
      delay: 0.3
    },
    {
      title: "Completed Tasks",
      value: summary.completedTasks.toString(),
      change: summary.completedTasks > 0 ? "Total completed" : "No completed tasks",
      changeType: summary.completedTasks > 0 ? "positive" : "neutral",
      icon: "CheckCircle2",
      delay: 0.4
    },
    {
      title: "Overdue Items",
      value: summary.overdueItems.toString(),
      change: summary.overdueItems > 0 ? "Needs immediate attention" : "All on track",
      changeType: summary.overdueItems > 0 ? "negative" : "positive",
      icon: "AlertTriangle",
      delay: 0.5
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          changeType={stat.changeType}
          icon={stat.icon}
          gradient={index % 2 === 0}
          delay={stat.delay}
        />
      ))}
    </div>
  );
};

export default DashboardStats;