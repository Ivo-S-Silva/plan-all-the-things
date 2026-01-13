export type TaskState = 
  | 'backlog' 
  | 'in-progress' 
  | 'waiting' 
  | 'qa' 
  | 'developed' 
  | 'ready' 
  | 'done' 
  | 'archived';

export interface Area {
  id: string;
  name: string;
  color: 'work' | 'personal' | 'health' | 'learning' | 'finance';
  icon?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  state: TaskState;
  areaId?: string;
  dueDate?: Date;
  scheduledDate?: Date;
  subtasks: Subtask[];
  noteIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  areaId?: string;
  taskId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  isAllDay?: boolean;
  isGoogleEvent?: boolean;
  color?: string;
}

export const TASK_STATE_CONFIG: Record<TaskState, { label: string; color: string }> = {
  'backlog': { label: 'Backlog', color: 'bg-state-backlog/15 text-state-backlog' },
  'in-progress': { label: 'Em Progresso', color: 'bg-state-progress/15 text-state-progress' },
  'waiting': { label: 'Em Espera', color: 'bg-state-waiting/15 text-state-waiting' },
  'qa': { label: 'Em QA', color: 'bg-state-qa/15 text-state-qa' },
  'developed': { label: 'Desenvolvido', color: 'bg-state-developed/15 text-state-developed' },
  'ready': { label: 'Ready', color: 'bg-state-ready/15 text-state-ready' },
  'done': { label: 'Done', color: 'bg-state-done/15 text-state-done' },
  'archived': { label: 'Arquivado', color: 'bg-state-archived/15 text-state-archived' },
};

export const AREA_COLORS = {
  work: 'bg-area-work/15 text-area-work border-area-work/30',
  personal: 'bg-area-personal/15 text-area-personal border-area-personal/30',
  health: 'bg-area-health/15 text-area-health border-area-health/30',
  learning: 'bg-area-learning/15 text-area-learning border-area-learning/30',
  finance: 'bg-area-finance/15 text-area-finance border-area-finance/30',
};
