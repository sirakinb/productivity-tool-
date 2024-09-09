import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { auth } from "./firebase";
import Profile from "./components/Profile";
import Home from "./components/Home";
import SignIn from "./components/SignIn";
import { User as FirebaseUser } from "firebase/auth";
import WelcomeScreen from "./components/WelcomeScreen";
import BottomTabBar from "./components/BottomTabBar";

const App: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("Auth state changed:", user ? "User logged in" : "No user");
      setUser(user);
      setLoading(false);
    }, (error) => {
      console.error("Auth state change error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  console.log("Rendering App component, user:", user ? "Logged in" : "Not logged in");

  return (
    <Router>
      <div className="app flex flex-col min-h-screen pb-16 md:pb-0">
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={user ? <Home /> : <Navigate to="/signin" />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/signin" />} />
          </Routes>
        </main>
        {user && <BottomTabBar />}
      </div>
    </Router>
  );
};

export default App;
