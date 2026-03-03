import Database from "@tauri-apps/plugin-sql";
import { DB_PATH } from "./constants";

let db: Database | null = null;

export async function getDb(): Promise<Database> {
    if (!db) {
        db = await Database.load(`sqlite:${DB_PATH}`);
        await initSchema(db);
    }
    return db;
}

async function initSchema(db: Database) {
    await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL DEFAULT 'User',
      rating INTEGER NOT NULL DEFAULT 1000,
      best_rating INTEGER NOT NULL DEFAULT 1000,
      current_streak INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0,
      total_xp INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'todo',
      xp_value INTEGER NOT NULL DEFAULT 10,
      estimated_minutes INTEGER DEFAULT 0,
      actual_minutes INTEGER DEFAULT 0,
      deadline TEXT DEFAULT NULL,
      sprint_id INTEGER DEFAULT NULL,
      category TEXT DEFAULT 'general',
      is_backlog INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT DEFAULT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS subtasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      status TEXT DEFAULT 'todo',
      xp_value INTEGER DEFAULT 5,
      created_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT DEFAULT NULL,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sprints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT DEFAULT 'planned',
      difficulty_rating INTEGER DEFAULT 1000,
      minimum_target_xp INTEGER NOT NULL,
      maximum_possible_xp INTEGER NOT NULL,
      earned_xp INTEGER DEFAULT 0,
      rating_before INTEGER DEFAULT NULL,
      rating_after INTEGER DEFAULT NULL,
      rating_change INTEGER DEFAULT 0,
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rating_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sprint_id INTEGER,
      rating_before INTEGER NOT NULL,
      rating_after INTEGER NOT NULL,
      change INTEGER NOT NULL,
      reason TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS daily_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE NOT NULL,
      tasks_completed INTEGER DEFAULT 0,
      xp_earned INTEGER DEFAULT 0,
      focus_minutes INTEGER DEFAULT 0,
      mood TEXT DEFAULT NULL,
      notes TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      icon TEXT DEFAULT '🏆',
      is_unlocked INTEGER DEFAULT 0,
      unlocked_at TEXT DEFAULT NULL
    );
  `);

    // Insert default user if not exists
    const users = await db.select<any[]>("SELECT * FROM users WHERE id = 1");
    if (users.length === 0) {
        await db.execute("INSERT INTO users (id, name) VALUES (1, 'User')");
    }

    // Insert default achievements
    const achievements = [
        { key: "first_task", name: "First Blood", description: "Complete your first task", icon: "⚔️" },
        { key: "first_sprint", name: "Sprint Starter", description: "Complete your first sprint", icon: "🏃" },
        { key: "streak_7", name: "Week Warrior", description: "7-day streak", icon: "🔥" },
        { key: "streak_30", name: "Month Master", description: "30-day streak", icon: "💎" },
        { key: "rating_1600", name: "Specialist", description: "Reach 1600 rating", icon: "⭐" },
        { key: "rating_2000", name: "Candidate Master", description: "Reach 2000 rating", icon: "👑" },
        { key: "rating_2600", name: "GOD Mode", description: "Reach 2600 rating", icon: "🌟" },
        { key: "tasks_100", name: "Century", description: "Complete 100 tasks", icon: "💯" },
        { key: "deep_work", name: "Deep Work", description: "Complete a critical task", icon: "🎯" },
    ];
    for (const a of achievements) {
        await db.execute(
            `INSERT OR IGNORE INTO achievements (key, name, description, icon) VALUES (?, ?, ?, ?)`,
            [a.key, a.name, a.description, a.icon]
        );
    }
}

// ── User ──────────────────────────────────────────
export async function getUser() {
    const db = await getDb();
    const rows = await db.select<any[]>("SELECT * FROM users WHERE id = 1");
    return rows[0];
}

export async function updateUser(data: Partial<{ name: string; rating: number; best_rating: number; current_streak: number; longest_streak: number; total_xp: number }>) {
    const db = await getDb();
    const entries = Object.entries(data);
    if (entries.length === 0) return;
    const sets = entries.map(([k]) => `${k} = ?`).join(", ");
    const vals = entries.map(([, v]) => v);
    await db.execute(`UPDATE users SET ${sets} WHERE id = 1`, vals);
}

// ── Tasks ─────────────────────────────────────────
export async function getTasks(filters?: { sprintId?: number | null; isBacklog?: boolean; status?: string }) {
    const db = await getDb();
    let query = "SELECT * FROM tasks WHERE 1=1";
    const params: any[] = [];
    if (filters?.sprintId !== undefined) { query += " AND sprint_id = ?"; params.push(filters.sprintId); }
    if (filters?.isBacklog !== undefined) { query += " AND is_backlog = ?"; params.push(filters.isBacklog ? 1 : 0); }
    if (filters?.status) { query += " AND status = ?"; params.push(filters.status); }
    query += " ORDER BY created_at DESC";
    return db.select<any[]>(query, params);
}

export async function createTask(task: {
    title: string; description?: string; priority?: string;
    xp_value?: number; estimated_minutes?: number; deadline?: string;
    category?: string; is_backlog?: boolean; sprint_id?: number | null;
}) {
    const db = await getDb();
    const result = await db.execute(
        `INSERT INTO tasks (title, description, priority, xp_value, estimated_minutes, deadline, category, is_backlog, sprint_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            task.title, task.description || "", task.priority || "medium",
            task.xp_value || 10, task.estimated_minutes || 0,
            task.deadline || null, task.category || "general",
            task.is_backlog ? 1 : 0, task.sprint_id || null,
        ]
    );
    return result.lastInsertId;
}

export async function updateTask(id: number, data: Partial<any>) {
    const db = await getDb();
    const entries = Object.entries(data);
    if (entries.length === 0) return;
    const sets = entries.map(([k]) => `${k} = ?`).join(", ");
    const vals = [...entries.map(([, v]) => v), id];
    await db.execute(`UPDATE tasks SET ${sets}, updated_at = datetime('now') WHERE id = ?`, vals);
}

export async function deleteTask(id: number) {
    const db = await getDb();
    await db.execute("DELETE FROM tasks WHERE id = ?", [id]);
}

export async function completeTask(id: number) {
    const db = await getDb();
    await db.execute(
        `UPDATE tasks SET status = 'completed', completed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`,
        [id]
    );
}

// ── Subtasks ──────────────────────────────────────
export async function getSubtasks(taskId: number) {
    const db = await getDb();
    return db.select<any[]>("SELECT * FROM subtasks WHERE task_id = ?", [taskId]);
}

export async function createSubtask(taskId: number, title: string, xpValue = 5) {
    const db = await getDb();
    const result = await db.execute(
        "INSERT INTO subtasks (task_id, title, xp_value) VALUES (?, ?, ?)",
        [taskId, title, xpValue]
    );
    return result.lastInsertId;
}

export async function completeSubtask(id: number) {
    const db = await getDb();
    await db.execute(
        "UPDATE subtasks SET status = 'completed', completed_at = datetime('now') WHERE id = ?",
        [id]
    );
}

export async function deleteSubtask(id: number) {
    const db = await getDb();
    await db.execute("DELETE FROM subtasks WHERE id = ?", [id]);
}

// ── Sprints ───────────────────────────────────────
export async function getSprints() {
    const db = await getDb();
    return db.select<any[]>("SELECT * FROM sprints ORDER BY created_at DESC");
}

export async function getActiveSprint() {
    const db = await getDb();
    const rows = await db.select<any[]>("SELECT * FROM sprints WHERE status = 'active' LIMIT 1");
    return rows[0] || null;
}

export async function createSprint(sprint: {
    name: string; start_date: string; end_date: string;
    difficulty_rating: number; minimum_target_xp: number; maximum_possible_xp: number;
}) {
    const db = await getDb();
    const result = await db.execute(
        `INSERT INTO sprints (name, start_date, end_date, difficulty_rating, minimum_target_xp, maximum_possible_xp, status)
     VALUES (?, ?, ?, ?, ?, ?, 'active')`,
        [sprint.name, sprint.start_date, sprint.end_date, sprint.difficulty_rating, sprint.minimum_target_xp, sprint.maximum_possible_xp]
    );
    return result.lastInsertId;
}

export async function updateSprint(id: number, data: Partial<any>) {
    const db = await getDb();
    const entries = Object.entries(data);
    if (entries.length === 0) return;
    const sets = entries.map(([k]) => `${k} = ?`).join(", ");
    const vals = [...entries.map(([, v]) => v), id];
    await db.execute(`UPDATE sprints SET ${sets} WHERE id = ?`, vals);
}

// ── Rating History ────────────────────────────────
export async function getRatingHistory() {
    const db = await getDb();
    return db.select<any[]>("SELECT * FROM rating_history ORDER BY created_at ASC");
}

export async function insertRatingHistory(sprintId: number | null, before: number, after: number, change: number, reason = "") {
    const db = await getDb();
    await db.execute(
        "INSERT INTO rating_history (sprint_id, rating_before, rating_after, change, reason) VALUES (?, ?, ?, ?, ?)",
        [sprintId, before, after, change, reason]
    );
}

// ── Daily Logs ────────────────────────────────────
export async function getTodayLog() {
    const db = await getDb();
    const today = new Date().toISOString().split("T")[0];
    const rows = await db.select<any[]>("SELECT * FROM daily_logs WHERE date = ?", [today]);
    return rows[0] || null;
}

export async function upsertDailyLog(data: Partial<{ tasks_completed: number; xp_earned: number; focus_minutes: number; mood: string; notes: string }>) {
    const db = await getDb();
    const today = new Date().toISOString().split("T")[0];
    await db.execute(
        `INSERT INTO daily_logs (date, tasks_completed, xp_earned, focus_minutes, mood, notes)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET
       tasks_completed = tasks_completed + excluded.tasks_completed,
       xp_earned = xp_earned + excluded.xp_earned,
       mood = COALESCE(excluded.mood, mood),
       notes = COALESCE(excluded.notes, notes)`,
        [today, data.tasks_completed || 0, data.xp_earned || 0, data.focus_minutes || 0, data.mood || null, data.notes || ""]
    );
}

export async function getDailyLogs(days = 90) {
    const db = await getDb();
    return db.select<any[]>(
        `SELECT * FROM daily_logs ORDER BY date DESC LIMIT ?`, [days]
    );
}

// ── Achievements ──────────────────────────────────
export async function getAchievements() {
    const db = await getDb();
    return db.select<any[]>("SELECT * FROM achievements");
}

export async function unlockAchievement(key: string) {
    const db = await getDb();
    await db.execute(
        "UPDATE achievements SET is_unlocked = 1, unlocked_at = datetime('now') WHERE key = ? AND is_unlocked = 0",
        [key]
    );
}