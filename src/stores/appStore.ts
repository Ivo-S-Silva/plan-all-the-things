import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Note, Area, TaskState, CalendarEvent } from '@/types';

const DEFAULT_STATE_ORDER: TaskState[] = ['in-progress', 'ready', 'waiting', 'qa', 'developed', 'backlog', 'done', 'archived'];

interface AppState {
  tasks: Task[];
  notes: Note[];
  areas: Area[];
  events: CalendarEvent[];
  selectedDate: Date;
  activeView: 'calendar' | 'tasks' | 'notes' | 'areas';
  stateOrder: TaskState[];
  taskOrder: Record<TaskState, string[]>; // task IDs per state
  
  // Actions
  setSelectedDate: (date: Date) => void;
  setActiveView: (view: 'calendar' | 'tasks' | 'notes' | 'areas') => void;
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  updateTaskState: (id: string, state: TaskState) => void;
  
  // Note actions
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  toggleNotePin: (id: string) => void;
  
  // Subtask actions
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  
  // Area actions
  addArea: (area: Omit<Area, 'id'>) => void;
  updateArea: (id: string, updates: Partial<Area>) => void;
  deleteArea: (id: string) => void;
  
  // Order actions
  setStateOrder: (order: TaskState[]) => void;
  reorderTasksInState: (state: TaskState, taskIds: string[]) => void;
  moveTaskToState: (taskId: string, fromState: TaskState, toState: TaskState, newIndex?: number) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

// Sample data
const sampleAreas: Area[] = [
  { id: '1', name: 'Trabalho', color: 'work' },
  { id: '2', name: 'Pessoal', color: 'personal' },
  { id: '3', name: 'Saúde', color: 'health' },
  { id: '4', name: 'Aprendizagem', color: 'learning' },
];

const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Preparar apresentação Q1',
    description: 'Slides para reunião de equipa',
    state: 'in-progress',
    areaId: '1',
    dueDate: new Date(2026, 0, 15),
    scheduledDate: new Date(2026, 0, 13),
    subtasks: [
      { id: 's1', title: 'Recolher dados', completed: true },
      { id: 's2', title: 'Criar slides', completed: false },
      { id: 's3', title: 'Rever com equipa', completed: false },
    ],
    noteIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Correr 5km',
    state: 'ready',
    areaId: '3',
    scheduledDate: new Date(2026, 0, 13),
    subtasks: [],
    noteIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Ler capítulo do livro',
    state: 'backlog',
    areaId: '4',
    subtasks: [],
    noteIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    title: 'Rever código do projeto',
    description: 'Pull request pendente',
    state: 'qa',
    areaId: '1',
    dueDate: new Date(2026, 0, 14),
    subtasks: [],
    noteIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const sampleNotes: Note[] = [
  {
    id: '1',
    title: 'Ideias para projeto',
    content: 'Explorar novas tecnologias para o próximo sprint...',
    areaId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Receita saudável',
    content: 'Ingredientes: quinoa, legumes frescos, azeite...',
    areaId: '3',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Helper to build initial task order from sample tasks
const buildInitialTaskOrder = (): Record<TaskState, string[]> => {
  const order: Record<TaskState, string[]> = {
    'backlog': [],
    'in-progress': [],
    'waiting': [],
    'qa': [],
    'developed': [],
    'ready': [],
    'done': [],
    'archived': [],
  };
  sampleTasks.forEach(task => {
    order[task.state].push(task.id);
  });
  return order;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: sampleTasks,
      notes: sampleNotes,
      areas: sampleAreas,
      events: [],
      selectedDate: new Date(),
      activeView: 'calendar',
      stateOrder: DEFAULT_STATE_ORDER,
      taskOrder: buildInitialTaskOrder(),

      setSelectedDate: (date) => set({ selectedDate: date }),
      setActiveView: (view) => set({ activeView: view }),

      addTask: (task) =>
        set((state) => {
          const newId = generateId();
          const newTask = {
            ...task,
            id: newId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          return {
            tasks: [...state.tasks, newTask],
            taskOrder: {
              ...state.taskOrder,
              [task.state]: [...(state.taskOrder[task.state] || []), newId],
            },
          };
        }),

      updateTask: (id, updates) =>
        set((state) => {
          const oldTask = state.tasks.find(t => t.id === id);
          const newTasks = state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
          );
          
          // Handle state change in taskOrder
          if (updates.state && oldTask && oldTask.state !== updates.state) {
            const oldState = oldTask.state;
            const newState = updates.state;
            return {
              tasks: newTasks,
              taskOrder: {
                ...state.taskOrder,
                [oldState]: (state.taskOrder[oldState] || []).filter(tid => tid !== id),
                [newState]: [...(state.taskOrder[newState] || []), id],
              },
            };
          }
          return { tasks: newTasks };
        }),

      deleteTask: (id) =>
        set((state) => {
          const task = state.tasks.find(t => t.id === id);
          const newTaskOrder = { ...state.taskOrder };
          if (task) {
            newTaskOrder[task.state] = (newTaskOrder[task.state] || []).filter(tid => tid !== id);
          }
          return {
            tasks: state.tasks.filter((t) => t.id !== id),
            taskOrder: newTaskOrder,
          };
        }),

      updateTaskState: (id, taskState) =>
        set((state) => {
          const task = state.tasks.find(t => t.id === id);
          if (!task || task.state === taskState) return {};
          
          const oldState = task.state;
          return {
            tasks: state.tasks.map((t) =>
              t.id === id ? { ...t, state: taskState, updatedAt: new Date() } : t
            ),
            taskOrder: {
              ...state.taskOrder,
              [oldState]: (state.taskOrder[oldState] || []).filter(tid => tid !== id),
              [taskState]: [...(state.taskOrder[taskState] || []), id],
            },
          };
        }),

      addNote: (note) =>
        set((state) => ({
          notes: [
            ...state.notes,
            {
              ...note,
              id: generateId(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        })),

      updateNote: (id, updates) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note
          ),
        })),

      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        })),

      toggleNotePin: (id) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, isPinned: !note.isPinned, updatedAt: new Date() } : note
          ),
        })),

      toggleSubtask: (taskId, subtaskId) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: task.subtasks.map((s) =>
                    s.id === subtaskId ? { ...s, completed: !s.completed } : s
                  ),
                  updatedAt: new Date(),
                }
              : task
          ),
        })),

      addSubtask: (taskId, title) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: [...task.subtasks, { id: generateId(), title, completed: false }],
                  updatedAt: new Date(),
                }
              : task
          ),
        })),

      deleteSubtask: (taskId, subtaskId) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: task.subtasks.filter((s) => s.id !== subtaskId),
                  updatedAt: new Date(),
                }
              : task
          ),
        })),

      addArea: (area) =>
        set((state) => ({
          areas: [...state.areas, { ...area, id: generateId() }],
        })),

      updateArea: (id, updates) =>
        set((state) => ({
          areas: state.areas.map((area) =>
            area.id === id ? { ...area, ...updates } : area
          ),
        })),

      deleteArea: (id) =>
        set((state) => ({
          areas: state.areas.filter((area) => area.id !== id),
        })),

      setStateOrder: (order) => set({ stateOrder: order }),

      reorderTasksInState: (state, taskIds) =>
        set((s) => ({
          taskOrder: {
            ...s.taskOrder,
            [state]: taskIds,
          },
        })),

      moveTaskToState: (taskId, fromState, toState, newIndex) =>
        set((s) => {
          const fromList = (s.taskOrder[fromState] || []).filter(id => id !== taskId);
          const toList = [...(s.taskOrder[toState] || [])];
          
          if (newIndex !== undefined) {
            toList.splice(newIndex, 0, taskId);
          } else {
            toList.push(taskId);
          }
          
          return {
            tasks: s.tasks.map((t) =>
              t.id === taskId ? { ...t, state: toState, updatedAt: new Date() } : t
            ),
            taskOrder: {
              ...s.taskOrder,
              [fromState]: fromList,
              [toState]: toList,
            },
          };
        }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        tasks: state.tasks,
        notes: state.notes,
        areas: state.areas,
        stateOrder: state.stateOrder,
        taskOrder: state.taskOrder,
      }),
    }
  )
);
