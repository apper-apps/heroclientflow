import { toast } from 'react-toastify';

export const getDashboardData = async () => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Fetch dashboard statistics using aggregators
    const dashboardParams = {
      aggregators: [
        // Total Clients Count
        {
          id: "totalClients",
          fields: [
            { field: { Name: "Id" }, Function: "Count" }
          ],
          where: [
            {
              FieldName: "status",
              Operator: "EqualTo",
              Values: ["active"]
            }
          ]
        },
        // Active Projects Count
        {
          id: "activeProjects", 
          fields: [
            { field: { Name: "Id" }, Function: "Count" }
          ],
          where: [
            {
              FieldName: "status",
              Operator: "NotEqualTo",
              Values: ["completed", "cancelled"]
            }
          ]
        },
        // Pending Tasks Count
        {
          id: "pendingTasks",
          fields: [
            { field: { Name: "Id" }, Function: "Count" }
          ],
          where: [
            {
              FieldName: "status",
              Operator: "ExactMatch",
              Values: ["todo", "in-progress"]
            }
          ]
        },
        // Completed Tasks Count
        {
          id: "completedTasks",
          fields: [
            { field: { Name: "Id" }, Function: "Count" }
          ],
          where: [
            {
              FieldName: "status",
              Operator: "EqualTo",
              Values: ["done"]
            }
          ]
        },
        // Overdue Tasks Count
        {
          id: "overdueTasks",
          fields: [
            { field: { Name: "Id" }, Function: "Count" }
          ],
          where: [
            {
              FieldName: "dueDate",
              Operator: "LessThan",
              Values: [new Date().toISOString().split('T')[0]]
            },
            {
              FieldName: "status",
              Operator: "NotEqualTo",
              Values: ["done"]
            }
          ]
        }
      ]
    };

    // Fetch clients data for statistics
    const clientsResponse = await apperClient.fetchRecords('client', dashboardParams);
    
    // Fetch projects data for statistics  
    const projectsResponse = await apperClient.fetchRecords('project', dashboardParams);
    
    // Fetch tasks data for statistics
    const tasksResponse = await apperClient.fetchRecords('task', dashboardParams);

    // Fetch monthly revenue from invoices
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const invoiceRevenueParams = {
      fields: [
        { field: { Name: "amount" } },
        { field: { Name: "status" } },
        { field: { Name: "paymentDate" } }
      ],
      where: [
        {
          FieldName: "status",
          Operator: "EqualTo",
          Values: ["paid"]
        },
        {
          FieldName: "paymentDate",
          Operator: "GreaterThanOrEqualTo",
          Values: [firstDayOfMonth.toISOString()]
        }
      ]
    };

    const invoicesResponse = await apperClient.fetchRecords('invoice', invoiceRevenueParams);

    // Calculate monthly revenue
    let monthlyRevenue = 0;
    if (invoicesResponse.success && invoicesResponse.data) {
      monthlyRevenue = invoicesResponse.data.reduce((sum, invoice) => {
        return sum + (parseFloat(invoice.amount) || 0);
      }, 0);
    }

    // Extract aggregator results
    const getAggregatorValue = (response, id) => {
      if (!response.success || !response.aggregators) return 0;
      const aggregator = response.aggregators.find(agg => agg.id === id);
      return aggregator ? (aggregator.value || 0) : 0;
    };

    const summary = {
      totalClients: getAggregatorValue(clientsResponse, "totalClients"),
      activeProjects: getAggregatorValue(projectsResponse, "activeProjects"),
      pendingTasks: getAggregatorValue(tasksResponse, "pendingTasks"),
      monthlyRevenue: monthlyRevenue,
      completedTasks: getAggregatorValue(tasksResponse, "completedTasks"),
      overdueItems: getAggregatorValue(tasksResponse, "overdueTasks")
    };

    // Fetch recent activity data
    const recentActivity = await getRecentActivity(apperClient);

    return {
      summary,
      recentActivity,
      quickStats: {
        projectsThisWeek: summary.activeProjects,
        tasksCompleted: summary.completedTasks,
        hoursTracked: 0, // Would need separate time tracking table
        invoicesSent: 0 // Would need to query sent invoices
      }
    };

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    toast.error("Failed to fetch dashboard data");
    
    // Return default values on error
    return {
      summary: {
        totalClients: 0,
        activeProjects: 0,
        pendingTasks: 0,
        monthlyRevenue: 0,
        completedTasks: 0,
        overdueItems: 0
      },
      recentActivity: [],
      quickStats: {
        projectsThisWeek: 0,
        tasksCompleted: 0,
        hoursTracked: 0,
        invoicesSent: 0
      }
    };
  }
};

const getRecentActivity = async (apperClient) => {
  try {
    const recentActivity = [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get recent projects
    const recentProjectsParams = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "status" } },
        { field: { Name: "ModifiedOn" } },
        { field: { Name: "clientId" } }
      ],
      where: [
        {
          FieldName: "ModifiedOn",
          Operator: "GreaterThanOrEqualTo",
          Values: [sevenDaysAgo.toISOString()]
        }
      ],
      orderBy: [
        {
          fieldName: "ModifiedOn",
          sorttype: "DESC"
        }
      ],
      pagingInfo: {
        limit: 5,
        offset: 0
      }
    };

    const projectsResponse = await apperClient.fetchRecords('project', recentProjectsParams);
    if (projectsResponse.success && projectsResponse.data) {
      projectsResponse.data.forEach(project => {
        const timeDiff = Date.now() - new Date(project.ModifiedOn).getTime();
        const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
        
        recentActivity.push({
          id: `project-${project.Id}`,
          type: "project",
          title: `Project '${project.Name}' updated`,
          client: project.clientId || "Unknown Client",
          time: hoursAgo < 24 ? `${hoursAgo} hours ago` : `${Math.floor(hoursAgo / 24)} days ago`,
          icon: project.status === "completed" ? "CheckCircle2" : "FolderOpen",
          iconColor: project.status === "completed" ? "text-green-500" : "text-blue-500"
        });
      });
    }

    // Get recent tasks
    const recentTasksParams = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "title" } },
        { field: { Name: "status" } },
        { field: { Name: "ModifiedOn" } },
        { field: { Name: "assignedTo" } }
      ],
      where: [
        {
          FieldName: "ModifiedOn",
          Operator: "GreaterThanOrEqualTo",
          Values: [sevenDaysAgo.toISOString()]
        }
      ],
      orderBy: [
        {
          fieldName: "ModifiedOn",
          sorttype: "DESC"
        }
      ],
      pagingInfo: {
        limit: 5,
        offset: 0
      }
    };

    const tasksResponse = await apperClient.fetchRecords('task', recentTasksParams);
    if (tasksResponse.success && tasksResponse.data) {
      tasksResponse.data.forEach(task => {
        const timeDiff = Date.now() - new Date(task.ModifiedOn).getTime();
        const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
        
        recentActivity.push({
          id: `task-${task.Id}`,
          type: "task",
          title: `Task '${task.title || task.Name}' ${task.status === 'done' ? 'completed' : 'updated'}`,
          client: task.assignedTo || "Unassigned",
          time: hoursAgo < 24 ? `${hoursAgo} hours ago` : `${Math.floor(hoursAgo / 24)} days ago`,
          icon: task.status === "done" ? "CheckCircle2" : "Plus",
          iconColor: task.status === "done" ? "text-green-500" : "text-blue-500"
        });
      });
    }

    // Get recent invoices
    const recentInvoicesParams = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "status" } },
        { field: { Name: "amount" } },
        { field: { Name: "ModifiedOn" } },
        { field: { Name: "clientId" } }
      ],
      where: [
        {
          FieldName: "ModifiedOn",
          Operator: "GreaterThanOrEqualTo",
          Values: [sevenDaysAgo.toISOString()]
        }
      ],
      orderBy: [
        {
          fieldName: "ModifiedOn",
          sorttype: "DESC"
        }
      ],
      pagingInfo: {
        limit: 5,
        offset: 0
      }
    };

    const invoicesResponse = await apperClient.fetchRecords('invoice', recentInvoicesParams);
    if (invoicesResponse.success && invoicesResponse.data) {
      invoicesResponse.data.forEach(invoice => {
        const timeDiff = Date.now() - new Date(invoice.ModifiedOn).getTime();
        const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
        
        recentActivity.push({
          id: `invoice-${invoice.Id}`,
          type: "invoice",
          title: `Invoice '${invoice.Name}' ${invoice.status}`,
          client: invoice.clientId || "Unknown Client",
          time: hoursAgo < 24 ? `${hoursAgo} hours ago` : `${Math.floor(hoursAgo / 24)} days ago`,
          icon: invoice.status === "paid" ? "DollarSign" : "FileText",
          iconColor: invoice.status === "paid" ? "text-green-600" : "text-purple-500"
        });
      });
    }

    // Get recent clients
    const recentClientsParams = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "company" } },
        { field: { Name: "CreatedOn" } }
      ],
      where: [
        {
          FieldName: "CreatedOn",
          Operator: "GreaterThanOrEqualTo",
          Values: [sevenDaysAgo.toISOString()]
        }
      ],
      orderBy: [
        {
          fieldName: "CreatedOn",
          sorttype: "DESC"
        }
      ],
      pagingInfo: {
        limit: 5,
        offset: 0
      }
    };

    const clientsResponse = await apperClient.fetchRecords('client', recentClientsParams);
    if (clientsResponse.success && clientsResponse.data) {
      clientsResponse.data.forEach(client => {
        const timeDiff = Date.now() - new Date(client.CreatedOn).getTime();
        const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
        
        recentActivity.push({
          id: `client-${client.Id}`,
          type: "client",
          title: `New client '${client.company || client.Name}' added`,
          client: client.company || client.Name,
          time: hoursAgo < 24 ? `${hoursAgo} hours ago` : `${Math.floor(hoursAgo / 24)} days ago`,
          icon: "UserPlus",
          iconColor: "text-emerald-500"
        });
      });
    }

    // Sort all activities by time and return top 10
    recentActivity.sort((a, b) => {
      const getTimeValue = (timeStr) => {
        const match = timeStr.match(/(\d+) (hours?|days?) ago/);
        if (!match) return 0;
        const value = parseInt(match[1]);
        const unit = match[2];
        return unit.includes('day') ? value * 24 : value;
      };
      
      return getTimeValue(a.time) - getTimeValue(b.time);
    });

    return recentActivity.slice(0, 10);

  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return [];
  }
};