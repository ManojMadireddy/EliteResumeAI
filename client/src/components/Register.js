// client/src/components/Register.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient"; // Import your Supabase client

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setMsg("Registering...");
      // Use Supabase for registration
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Supabase sends a confirmation email by default.
      // You might want to show a message about checking email.
      if (data.user) {
          setMsg("✅ Registration successful! Please check your email for a verification link.");
          // You might redirect after email confirmation, or if email confirmation is off
          // localStorage.setItem("token", data.session.access_token); // If auto-login
          // navigate("/upload");
      } else {
         setMsg("✅ Registration email sent! Please check your inbox to verify your account.");
      }
    } catch (err) {
      setMsg("❌ " + (err.message || "Registration failed"));
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br /><br />
        <button type="submit">Register</button>
      </form>
      <p>{msg}</p>
      <p>Already have an account? <Link to="/">Login</Link></p>
    </div>
  );
}

export default Register;