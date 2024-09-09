import React, { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "../firebase";

const AddTask: React.FC = () => {
  const [text, setText] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(collection(db, "tasks"), {
        text,
        date: new Date(date),
        completed: false,
        userId: user.uid,
      });

      setText("");
      setDate("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-task p-4 mx-auto max-w-2xl bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-white">Add New Task</h2>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Task description"
        className="w-full p-2 mb-4 border rounded bg-gray-700 text-white"
        required
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full p-2 mb-4 border rounded bg-gray-700 text-white"
        required
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
      >
        Add Task
      </button>
    </form>
  );
};

export default AddTask;