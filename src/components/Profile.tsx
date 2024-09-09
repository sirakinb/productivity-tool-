import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { User } from "firebase/auth";

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribeAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!user) {
    return <div className="text-white">Please sign in to view your profile.</div>;
  }

  return (
    <div className="profile p-4 bg-gray-900 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-center text-white">Pentridge Productivity</h2>
      <div className="mx-auto max-w-2xl">
        <button
          onClick={handleSignOut}
          className="bg-red-500 text-white px-4 py-2 rounded mb-4 w-full"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Profile;
