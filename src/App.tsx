import { useEffect, useState } from 'react';
import { ListTodo, LogOut } from 'lucide-react';
import { TaskInput } from './components/TaskInput';
import { TaskItem } from './components/TaskItem';
import { AuthForm } from './components/AuthForm';
import { supabase } from './lib/supabase';
import type { Task, NewTask } from './types';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchTasks();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchTasks();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchTasks() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }

  async function addTask(title: string) {
    try {
      const newTask: NewTask = {
        title,
        completed: false,
        user_id: session?.user?.id,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setTasks([data, ...tasks]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add task');
    }
  }

  async function toggleTask(task: Task) {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', task.id);

      if (error) throw error;
      setTasks(tasks.map(t => 
        t.id === task.id ? { ...t, completed: !t.completed } : t
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  }

  async function deleteTask(task: Task) {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);

      if (error) throw error;
      setTasks(tasks.filter(t => t.id !== task.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  }

  async function handleSignIn(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    }
  }

  async function handleSignUp(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError(error.message);
    } else {
      setSession(null);
      setTasks([]);
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-3 mb-8">
          <ListTodo size={32} className="text-blue-500" />
          <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
        </div>
        <AuthForm
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          error={error}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ListTodo size={32} className="text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>

        <div className="space-y-6">
          <TaskInput onAdd={addTask} />

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No tasks yet. Add one above!</div>
          ) : (
            <div className="space-y-3">
              {tasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;