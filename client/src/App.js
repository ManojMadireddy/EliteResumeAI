// src/App.js
import React from "react";
import {
BrowserRouter as Router,
Routes,
Route,
Link,
useLocation,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import ResumeScore from "./components/ResumeScore";
import QuestionGenerator from "./components/QuestionGenerator";
import OneClickPortfolio from "./components/OneClickPortfolio";
import MockInterviewAnalyzer from "./components/MockInterviewAnalyzer";
import { RouteProtect } from "./components/RouteProtect";
import "./App.css"; // Import global styles

function App() {
const token = localStorage.getItem("token");

return (
<Router>
<MainApp token={token} />
</Router>
);
}

// Separated component to access useLocation
const MainApp = ({ token }) => {
const location = useLocation();

// Only show nav if user is logged in and not on login/register pages
const showNavbar =
token && !["/", "/register"].includes(location.pathname);

return (
<>
{showNavbar && <CustomNavbar />}
<Routes>
{/* Public Routes */}
<Route path="/" element={<Login />} />
<Route path="/register" element={<Register />} />

{/* Protected Routes */}  
    <Route  
      path="/upload"  
      element={  
        <RouteProtect>  
          <ResumeScore />  
        </RouteProtect>  
      }  
    />  
    <Route  
      path="/questions"  
      element={  
        <RouteProtect>  
          <QuestionGenerator />  
        </RouteProtect>  
      }  
    />  
    <Route  
      path="/portfolio"  
      element={  
        <RouteProtect>  
          <OneClickPortfolio />  
        </RouteProtect>  
      }  
    />  
    <Route  
      path="/mock-interview"  
      element={  
        <RouteProtect>  
          <MockInterviewAnalyzer />  
        </RouteProtect>  
      }  
    />  
  </Routes>  
</>

);
};

// 💎 Custom Glass Navbar
const CustomNavbar = () => {
return (
<nav className="glass-navbar">
<Link to="/upload" className="nav-link">
Resume Score
</Link>
<Link to="/questions" className="nav-link">
Generate Questions
</Link>
<Link to="/portfolio" className="nav-link">
One-Click Portfolio
</Link>
<Link to="/mock-interview" className="nav-link">
Mock Interview
</Link>
<button
className="logout-btn"
onClick={() => {
localStorage.removeItem("token");
window.location.href = "/";
}}
> 
Logout
</button>
</nav>
);
};

export default App;