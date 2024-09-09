import React, { useState } from "react";
import { Task } from "../firebase";

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onSave }) => {
  const [editedTask, setEditedTask] = useState(task);

  const handleSave = () => {
    console.log("Saving task:", editedTask);
    onSave(editedTask);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Edit Task</h2>
        <input
          type="text"
          value={editedTask.text}
          onChange={(e) => setEditedTask({ ...editedTask, text: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
        />
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

export default TaskModal;