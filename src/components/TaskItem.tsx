import React from 'react';
import { Check, Trash2, Square } from 'lucide-react';
import { Task } from '../types';
import clsx from 'clsx';

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
      <button
        onClick={() => onToggle(task)}
        className={clsx(
          'p-1 rounded transition-colors',
          task.completed ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-500'
        )}
      >
        {task.completed ? <Check size={20} /> : <Square size={20} />}
      </button>
      
      <span className={clsx(
        'flex-1',
        task.completed && 'line-through text-gray-500'
      )}>
        {task.title}
      </span>
      
      <button
        onClick={() => onDelete(task)}
        className="p-1 text-red-500 hover:text-red-600 transition-colors rounded"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
}