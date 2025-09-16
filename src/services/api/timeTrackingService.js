import { getAllTasks, getTaskTimeLogs, startTaskTimer, stopTaskTimer } from "@/services/api/taskService";

export const startTimer = async (taskId) => {
  try {
    const timerData = await startTaskTimer(taskId);
    return timerData;
  } catch (error) {
    throw new Error(`Failed to start timer: ${error.message}`);
  }
};

export const stopTimer = async (taskId) => {
  try {
    const timeLog = await stopTaskTimer(taskId);
    return timeLog;
  } catch (error) {
    throw new Error(`Failed to stop timer: ${error.message}`);
  }
};

export const getActiveTimer = async (taskId) => {
  try {
    const tasks = await getAllTasks();
    const task = tasks.find(t => t.Id === parseInt(taskId));
    
    if (!task) {
      throw new Error("Task not found");
    }

    // Parse activeTimer from database field
    if (task.activeTimer) {
      try {
        return JSON.parse(task.activeTimer);
      } catch (e) {
        return null;
      }
    }
    
    return null;
  } catch (error) {
    throw new Error(`Failed to get active timer: ${error.message}`);
  }
};

export const getTimeLogs = async (taskId) => {
  try {
    const timeLogs = await getTaskTimeLogs(taskId);
    return timeLogs;
  } catch (error) {
    throw new Error(`Failed to get time logs: ${error.message}`);
  }
};

export const getProjectTimeTracking = async (projectId) => {
  try {
    const tasks = await getAllTasks();
    const projectTasks = tasks.filter(t => t.projectId === String(projectId));
    
    let totalTime = 0;
    let activeTimers = 0;
    let totalEntries = 0;
    const timeLogs = [];

    projectTasks.forEach(task => {
      // Use totalTime from database field
      totalTime += parseInt(task.totalTime) || 0;
      
      // Check if activeTimer field has content
      if (task.activeTimer) {
        activeTimers++;
      }
      
      // Note: timeLogs would come from a separate time logs table in a real implementation
      // For now, we'll use empty array since we don't have a dedicated time logs table
    });

    return {
      totalTime,
      activeTimers,
      totalEntries,
      timeLogs: [] // Empty for now - would be populated from time logs table
    };
  } catch (error) {
    throw new Error(`Failed to get project time tracking: ${error.message}`);
  }
};

export const getAllTimeTracking = async () => {
  try {
    const tasks = await getAllTasks();
    
    const summary = {
      totalTime: 0,
      activeTimers: 0,
      totalEntries: 0,
      taskBreakdown: []
    };

    tasks.forEach(task => {
      // Use totalTime from database field
      const taskTotalTime = parseInt(task.totalTime) || 0;
      summary.totalTime += taskTotalTime;
      
      // Check if activeTimer field has content
      if (task.activeTimer) {
        summary.activeTimers++;
      }
      
      // Note: totalEntries would come from a separate time logs table
      // For now, we'll use 0 since we don't have a dedicated time logs table

      if (taskTotalTime > 0 || task.activeTimer) {
        summary.taskBreakdown.push({
          taskId: task.Id,
          taskTitle: task.title,
          projectId: task.projectId,
          totalTime: taskTotalTime,
          hasActiveTimer: !!task.activeTimer,
          entryCount: 0 // Would be populated from time logs table
        });
      }
    });

    // Sort by total time descending
    summary.taskBreakdown.sort((a, b) => b.totalTime - a.totalTime);

    return summary;
  } catch (error) {
    throw new Error(`Failed to get all time tracking data: ${error.message}`);
  }
};