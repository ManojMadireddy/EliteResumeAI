import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar"; // 👈 EliteResumeAI title + quote
import "./Login.css"; // glass style

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:7000/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      setMsg("✅ Logged in");
      navigate("/upload");
    } catch (err) {
      setMsg("❌ " + (err.response?.data?.error || "Login failed"));
    }
  };

  return (
    <>
      <Navbar /> {/* Shows EliteResumeAI title and quote at top */}
      <div className="login-page">
        <div className="glass-card">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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