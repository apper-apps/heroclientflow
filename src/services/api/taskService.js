import { toast } from 'react-toastify';

export const getAllTasks = async () => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "Owner" } },
        { field: { Name: "title" } },
        { field: { Name: "assignedTo" } },
        { field: { Name: "priority" } },
        { field: { Name: "status" } },
        { field: { Name: "dueDate" } },
        { field: { Name: "totalTime" } },
        { field: { Name: "activeTimer" } },
        { field: { Name: "projectId" } }
      ],
      orderBy: [
        {
          fieldName: "dueDate",
          sorttype: "ASC"
        }
      ]
    };
    
    const response = await apperClient.fetchRecords('task', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }
    
    return response.data || [];
  } catch (error) {
    console.error("Error fetching tasks:", error);
    toast.error("Failed to fetch tasks");
    return [];
  }
};

export const getTaskById = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "Owner" } },
        { field: { Name: "title" } },
        { field: { Name: "assignedTo" } },
        { field: { Name: "priority" } },
        { field: { Name: "status" } },
        { field: { Name: "dueDate" } },
        { field: { Name: "totalTime" } },
        { field: { Name: "activeTimer" } },
        { field: { Name: "projectId" } }
      ]
    };
    
    const response = await apperClient.getRecordById('task', parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching task with ID ${id}:`, error);
    toast.error("Failed to fetch task");
    return null;
  }
};

export const createTask = async (taskData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Only include Updateable fields
    const params = {
      records: [{
        Name: taskData.Name || taskData.title || '',
        Tags: taskData.Tags || '',
        Owner: taskData.Owner || null,
        title: taskData.title || '',
        assignedTo: taskData.assignedTo || '',
        priority: taskData.priority || 'medium',
        status: taskData.status || 'todo',
        dueDate: taskData.dueDate || null,
        totalTime: parseInt(taskData.totalTime) || 0,
        activeTimer: taskData.activeTimer || '',
        projectId: parseInt(taskData.projectId) || null
      }]
    };
    
    const response = await apperClient.createRecord('task', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }
    
    if (response.results) {
      const successfulRecords = response.results.filter(result => result.success);
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulRecords.length > 0) {
        toast.success("Task created successfully");
        return successfulRecords[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error creating task:", error);
    toast.error("Failed to create task");
    return null;
  }
};

export const updateTask = async (id, taskData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Only include Updateable fields
    const params = {
      records: [{
        Id: parseInt(id),
        Name: taskData.Name || taskData.title,
        Tags: taskData.Tags,
        Owner: taskData.Owner,
        title: taskData.title,
        assignedTo: taskData.assignedTo,
        priority: taskData.priority,
        status: taskData.status,
        dueDate: taskData.dueDate,
        totalTime: taskData.totalTime ? parseInt(taskData.totalTime) : undefined,
        activeTimer: taskData.activeTimer,
        projectId: taskData.projectId ? parseInt(taskData.projectId) : undefined
      }]
    };
    
    const response = await apperClient.updateRecord('task', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }
    
    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulUpdates.length > 0) {
        toast.success("Task updated successfully");
        return successfulUpdates[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error updating task:", error);
    toast.error("Failed to update task");
    return null;
  }
};

export const updateTaskStatus = async (id, status) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      records: [{
        Id: parseInt(id),
        status: status
      }]
    };
    
    const response = await apperClient.updateRecord('task', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }
    
    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulUpdates.length > 0) {
        toast.success("Task status updated successfully");
        return successfulUpdates[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error updating task status:", error);
    toast.error("Failed to update task status");
    return null;
  }
};

export const deleteTask = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      RecordIds: [parseInt(id)]
    };
    
    const response = await apperClient.deleteRecord('task', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return false;
    }
    
    if (response.results) {
      const successfulDeletions = response.results.filter(result => result.success);
      const failedDeletions = response.results.filter(result => !result.success);
      
      if (failedDeletions.length > 0) {
        console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulDeletions.length > 0) {
        toast.success("Task deleted successfully");
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error deleting task:", error);
    toast.error("Failed to delete task");
    return false;
  }
};

// Timer functions - these will work with the activeTimer field in the database
export const startTaskTimer = async (id) => {
  try {
    const now = new Date().toISOString();
    const timerData = {
      Id: parseInt(id),
      startTime: now
    };
    
    const updateResult = await updateTask(id, {
      activeTimer: JSON.stringify(timerData)
    });
    
    if (updateResult) {
      toast.success("Timer started successfully");
      return timerData;
    }
    
    throw new Error("Failed to start timer");
  } catch (error) {
    console.error("Error starting timer:", error);
    toast.error("Failed to start timer");
    throw error;
  }
};

export const stopTaskTimer = async (id) => {
  try {
    const task = await getTaskById(id);
    if (!task || !task.activeTimer) {
      throw new Error("No active timer for this task");
    }
    
    const now = new Date().toISOString();
    let timerData;
    
    try {
      timerData = JSON.parse(task.activeTimer);
    } catch (e) {
      throw new Error("Invalid timer data");
    }
    
    const startTime = new Date(timerData.startTime);
    const endTime = new Date(now);
    const duration = endTime.getTime() - startTime.getTime();
    
    const timeLog = {
      Id: Date.now(),
      startTime: timerData.startTime,
      endTime: now,
      duration: duration,
      date: startTime.toISOString().split('T')[0]
    };
    
    // Update task to clear active timer and add to total time
    const currentTotalTime = parseInt(task.totalTime) || 0;
    const updateResult = await updateTask(id, {
      activeTimer: '',
      totalTime: currentTotalTime + duration
    });
    
    if (updateResult) {
      toast.success("Timer stopped successfully");
      return timeLog;
    }
    
    throw new Error("Failed to stop timer");
  } catch (error) {
    console.error("Error stopping timer:", error);
    toast.error("Failed to stop timer");
    throw error;
  }
};

export const getTaskTimeLogs = async (id) => {
  // Note: This is a simplified implementation since the database doesn't have a separate timeLogs table
  // In a real implementation, you would query a separate time logs table
  try {
    const task = await getTaskById(id);
    if (!task) {
      throw new Error("Task not found");
    }
    
    // Return empty array for now - in a real implementation, this would query a time logs table
    return [];
  } catch (error) {
    console.error("Error fetching time logs:", error);
    return [];
  }
};