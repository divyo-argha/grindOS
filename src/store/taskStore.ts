import { create } from "zustand";
import * as db from "../lib/db";

interface Task {
    id: number;
    title: string;
    description: string;
    priority: "low" | "medium" | "high" | "critical";
    status: "todo" | "in_progress" | "completed" | "failed" | "deferred";
    xp_value: number;
    estimated_minutes: number;
    actual_minutes: number;
    deadline: string | null;
    sprint_id: number | null;
    category: string;
    is_backlog: boolean;
    created_at: string;
    completed_at: string | null;
}

interface Subtask {
    id: number;
    task_id: number;
    title: string;
    status: "todo" | "completed";
    xp_value: number;
}

interface TaskStore {
    tasks: Task[];
    subtasks: Record<number, Subtask[]>;
    loading: boolean;
    fetchTasks: (filters?: any) => Promise<void>;
    addTask: (task: Partial<Task>) => Promise<number>;
    updateTask: (id: number, data: Partial<Task>) => Promise<void>;
    deleteTask: (id: number) => Promise<void>;
    completeTask: (id: number) => Promise<void>;
    fetchSubtasks: (taskId: number) => Promise<void>;
    addSubtask: (taskId: number, title: string) => Promise<void>;
    completeSubtask: (id: number, taskId: number) => Promise<void>;
    deleteSubtask: (id: number, taskId: number) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
    tasks: [],
    subtasks: {},
    loading: false,

    fetchTasks: async (filters) => {
        set({ loading: true });
        const tasks = await db.getTasks(filters);
        set({ tasks, loading: false });
    },

    addTask: async (task) => {
        const id = await db.createTask(task as any);
        await get().fetchTasks();
        return id as number;
    },

    updateTask: async (id, data) => {
        await db.updateTask(id, data);
        await get().fetchTasks();
    },

    deleteTask: async (id) => {
        await db.deleteTask(id);
        set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }));
    },

    completeTask: async (id) => {
        await db.completeTask(id);
        await get().fetchTasks();
    },

    fetchSubtasks: async (taskId) => {
        const subs = await db.getSubtasks(taskId);
        set(s => ({ subtasks: { ...s.subtasks, [taskId]: subs } }));
    },

    addSubtask: async (taskId, title) => {
        await db.createSubtask(taskId, title);
        await get().fetchSubtasks(taskId);
    },

    completeSubtask: async (id, taskId) => {
        await db.completeSubtask(id);
        await get().fetchSubtasks(taskId);
    },

    deleteSubtask: async (id, taskId) => {
        await db.deleteSubtask(id);
        await get().fetchSubtasks(taskId);
    },
}));