// client/src/components/Login.js
import React, { useState, useEffect } from "react"; // Add useEffect
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient"; // Import your Supabase client
import Navbar from "./Navbar";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  // Listen for auth state changes (e.g., after successful login)
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          localStorage.setItem("token", session.access_token); // Save Supabase token
          setMsg("✅ Logged in");
          navigate("/upload");
        }
      }
    );

    // Cleanup listener on component unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setMsg("Logging in...");
      // Use Supabase for login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Auth state change listener above will handle navigation on success
    } catch (err) {
      setMsg("❌ " + (err.message || "Login failed"));
    }
  };

  return (
    // ... (rest of your Login component JSX remains largely the same)
    <>
      <Navbar />
      <div className="login-page">
        <div className="glass-card">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <div className="login-options">
              <label><input type="checkbox" /> Remember me</label>
              <a href="#">Forgot password?</a>
            </div>
            <button type="submit">Log In</button>
            <p className="msg">{msg}</p>
            <p>Don't have an account? <Link to="/register">Register</Link></p>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;