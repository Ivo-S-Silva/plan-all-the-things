import { create } from 'zustand';
import { Task, Note, Area, TaskState, CalendarEvent } from '@/types';

interface AppState {
  tasks: Task[];
  notes: Note[];
  areas: Area[];
  events: CalendarEvent[];
  selectedDate: Date;
  activeView: 'calendar' | 'tasks' | 'notes' | 'areas';
  
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

export const useAppStore = create<AppState>((set) => ({
  tasks: sampleTasks,
  notes: sampleNotes,
  areas: sampleAreas,
  events: [],
  selectedDate: new Date(),
  activeView: 'calendar',

  setSelectedDate: (date) => set({ selectedDate: date }),
  setActiveView: (view) => set({ activeView: view }),

  addTask: (task) =>
    set((state) => ({
      tasks: [
        ...state.tasks,
        {
          ...task,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
      ),
    })),

  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),

  updateTaskState: (id, taskState) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, state: taskState, updatedAt: new Date() } : task
      ),
    })),

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
}));
