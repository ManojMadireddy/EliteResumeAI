import React from "react";
import "./BottomNav.css";

function BottomNav() {
  return (
    <ul className="navigation">
      <li className="list active"><a href="#"><i className="ri-home-line"></i><span>Home</span></a></li>
      <li className="list"><a href="#"><i className="ri-user-line"></i><span>About</span></a></li>
      <li className="list"><a href="#"><i className="ri-file-list-line"></i><span>Resume</span></a></li>
      <li className="list"><a href="#"><i className="ri-question-answer-line"></i><span>Contact</span></a></li>
    </ul>
  );
}

export default BottomNav;