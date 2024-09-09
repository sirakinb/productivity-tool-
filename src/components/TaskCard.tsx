import React from "react";
import { Task } from "../firebase";

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: () => void;
  onToggle: () => void;
  onClick: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index, onEdit, onDelete, onToggle, onClick }) => {
  return (
    <div 
      className="bg-gray-700 p-2 mb-2 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors duration-200"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <span className={`text-white text-sm ${task.completed ? 'line-through' : ''}`}>
          {task.text}
        </span>
        <div className="flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="text-lg hover:bg-gray-500 rounded p-1"
            title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {task.completed ? '↩️' : '✅'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-lg hover:bg-gray-500 rounded p-1"
            title="Delete task"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;