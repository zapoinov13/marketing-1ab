import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  homeworkTasks as seedTasks,
  type HomeworkStatus,
  type HomeworkTask,
} from "@/data/platform";

const STORAGE_KEY = "aml-homework-tasks-v2";

export type NewHomeworkInput = {
  title: string;
  description: string;
  stage: string;
  deadline: string;
  videoTitle?: string;
};

type HomeworkContextValue = {
  tasks: HomeworkTask[];
  counts: Record<HomeworkStatus | "all", number>;
  getTask: (id: string) => HomeworkTask | null;
  setStatus: (id: string, status: HomeworkStatus) => void;
  addTask: (input: NewHomeworkInput) => HomeworkTask;
  updateTask: (id: string, patch: Partial<HomeworkTask>) => void;
};

const HomeworkContext = createContext<HomeworkContextValue | null>(null);

function loadTasks(): HomeworkTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedTasks.map((t) => ({ ...t }));
    const parsed = JSON.parse(raw) as HomeworkTask[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return seedTasks.map((t) => ({ ...t }));
    }
    return parsed;
  } catch {
    return seedTasks.map((t) => ({ ...t }));
  }
}

export function HomeworkProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<HomeworkTask[]>(() =>
    typeof window === "undefined" ? seedTasks.map((t) => ({ ...t })) : loadTasks(),
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const counts = useMemo(
    () => ({
      active: tasks.filter((t) => t.status === "active").length,
      done: tasks.filter((t) => t.status === "done").length,
      overdue: tasks.filter((t) => t.status === "overdue").length,
      all: tasks.length,
    }),
    [tasks],
  );

  const getTask = useCallback(
    (id: string) => tasks.find((t) => t.id === id) ?? null,
    [tasks],
  );

  const setStatus = useCallback((id: string, status: HomeworkStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }, []);

  const addTask = useCallback((input: NewHomeworkInput) => {
    const task: HomeworkTask = {
      id: `hw-${Date.now()}`,
      title: input.title.trim(),
      description: input.description.trim(),
      stage: input.stage.trim() || "Своё задание",
      deadline: input.deadline.trim() || "Без срока",
      status: "active",
      videoTitle: input.videoTitle?.trim() || "Материалы к заданию",
    };
    setTasks((prev) => [task, ...prev]);
    return task;
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<HomeworkTask>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const value = useMemo(
    () => ({ tasks, counts, getTask, setStatus, addTask, updateTask }),
    [tasks, counts, getTask, setStatus, addTask, updateTask],
  );

  return <HomeworkContext.Provider value={value}>{children}</HomeworkContext.Provider>;
}

export function useHomework() {
  const ctx = useContext(HomeworkContext);
  if (!ctx) throw new Error("useHomework must be used within HomeworkProvider");
  return ctx;
}
