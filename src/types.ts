export interface Task {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
  user_id: string;
}

export interface NewTask {
  title: string;
  completed?: boolean;
  user_id?: string;
}