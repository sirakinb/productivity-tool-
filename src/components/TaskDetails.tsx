import React, { useState } from 'react';
import { Task } from '../firebase';

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
  onUpdate: (task: Task) => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ task, onClose, onUpdate }) => {
  const [editedTask, setEditedTask] = useState(task);
  const [newSubtask, setNewSubtask] = useState('');

  const handleSubtaskAdd = () => {
    if (newSubtask.trim()) {
      setEditedTask(prev => ({
        ...prev,
        subtasks: [...(prev.subtasks || []), { id: Date.now().toString(), text: newSubtask.trim(), completed: false }]
      }));
      setNewSubtask('');
    }
  };

  const handleSubtaskToggle = (subtaskId: string) => {
    setEditedTask(prev => ({
      ...prev,
      subtasks: prev.subtasks?.map(st =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      )
    }));
  };

  const handleSubtaskDelete = (subtaskId: string) => {
    setEditedTask(prev => ({
      ...prev,
      subtasks: prev.subtasks?.filter(st => st.id !== subtaskId)
    }));
  };

  const handleClearNotes = () => {
    setEditedTask(prev => ({ ...prev, notes: '' }));
  };

  const handleSave = () => {
    onUpdate(editedTask);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Task Details</h2>
        <input
          type="text"
          value={editedTask.text}
          onChange={(e) => setEditedTask({ ...editedTask, text: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
        />
        <h3 className="text-xl font-semibold mb-2">Subtasks</h3>
        <ul className="mb-4">
          {editedTask.subtasks?.map(subtask => (
            <li key={subtask.id} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={subtask.completed}
                onChange={() => handleSubtaskToggle(subtask.id)}
                className="mr-2"
              />
              <span className={subtask.completed ? 'line-through' : ''}>{subtask.text}</span>
              <button
                onClick={() => handleSubtaskDelete(subtask.id)}
                className="ml-2 text-red-500"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        <div className="flex mb-4">
          <input
            type="text"
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            placeholder="New subtask"
            className="flex-grow p-2 border rounded-l"
          />
          <button
            onClick={handleSubtaskAdd}
            className="bg-blue-500 text-white px-4 py-2 rounded-r"
          >
            Add
          </button>
        </div>
        <h3 className="text-xl font-semibold mb-2">Notes</h3>
        <textarea
          value={editedTask.notes || ''}
          onChange={(e) => setEditedTask({ ...editedTask, notes: e.target.value })}
          placeholder="Add your notes here..."
          className="w-full p-2 mb-4 border rounded h-32 resize-y"
        />
        <button
          onClick={handleClearNotes}
          className="bg-yellow-500 text-white px-4 py-2 rounded mb-4"
        >
          Clear Notes
        </button>
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-green-500 text-white px-4 py-2 rounded mr-2"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;