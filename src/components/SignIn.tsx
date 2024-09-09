import React from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const SignIn: React.FC = () => {
  const navigate = useNavigate();

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      <img 
        src="/Untitled design (95).png" 
        alt="Pentridge Logo" 
        className="w-32 h-32 mb-4 object-contain rounded-full bg-gray-800"
      />
      <h1 className="text-3xl font-bold mb-8 text-white">Pentridge Productivity</h1>
      <button
        onClick={signInWithGoogle}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors duration-300 shadow-lg"
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default SignIn;
