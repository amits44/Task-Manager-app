import { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const [tasks,   setTasks]   = useState({ todo: [], in_progress: [], done: [] });
  const [stats,   setStats]   = useState({ todo: 0, in_progress: 0, done: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const fetchTasks = useCallback(async (query = {}) => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.get('/tasks', { params: query });
      setTasks(data.grouped);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/tasks/stats');
      setStats(data.stats);
    } catch (_) {}
  }, []);

  const createTask = useCallback(async (payload) => {
    const { data } = await api.post('/tasks', payload);
    setTasks((prev) => ({
      ...prev,
      [data.task.stage]: [data.task, ...prev[data.task.stage]],
    }));
    setStats((s) => ({ ...s, [data.task.stage]: s[data.task.stage] + 1, total: s.total + 1 }));
    return data.task;
  }, []);

  const updateTask = useCallback(async (id, payload) => {
    const { data } = await api.patch(`/tasks/${id}`, payload);
    const updated = data.task;

    setTasks((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((stage) => {
        next[stage] = next[stage].filter((t) => t._id !== id);
      });
      next[updated.stage] = [updated, ...next[updated.stage]];
      return next;
    });

    setStats((s) => {
      const oldTask = Object.values(prev ?? {})
        .flat()
        .find((t) => t._id === id);
      if (oldTask && oldTask.stage !== updated.stage) {
        return {
          ...s,
          [oldTask.stage]: Math.max(0, s[oldTask.stage] - 1),
          [updated.stage]: s[updated.stage] + 1,
        };
      }
      return s;
    });

    return updated;
  }, []);

  const deleteTask = useCallback(async (id, stage) => {
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => ({
      ...prev,
      [stage]: prev[stage].filter((t) => t._id !== id),
    }));
    setStats((s) => ({ ...s, [stage]: Math.max(0, s[stage] - 1), total: Math.max(0, s.total - 1) }));
  }, []);

  return (
    <TaskContext.Provider value={{
      tasks, stats, loading, error,
      fetchTasks, fetchStats, createTask, updateTask, deleteTask,
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
};
