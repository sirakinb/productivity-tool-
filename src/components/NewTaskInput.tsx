import React, { useState } from 'react';

interface NewTaskInputProps {
  onSubmit: (text: string, day: Date) => void;
  day: Date;
}

const NewTaskInput: React.FC<NewTaskInputProps> = ({ onSubmit, day }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text.trim(), day);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex w-full">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="New task..."
        className="flex-grow p-1 sm:p-2 text-sm sm:text-base rounded-l bg-gray-700 text-white min-w-0"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-2 py-1 sm:px-3 sm:py-2 text-sm sm:text-base rounded-r whitespace-nowrap"
      >
        Add
      </button>
    </form>
  );
};

export default NewTaskInput;