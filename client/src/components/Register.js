// client/src/components/Register.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  // Define your API base URL dynamically
  // For Create React App:
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
  // If you're using Vite, it would be:
  // const API_BASE_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";


  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Use the dynamic API_BASE_URL
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      setMsg("✅ Registered");
      navigate("/upload");
    } catch (err) {
      setMsg("❌ " + (err.response?.data?.error || "Register failed"));
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