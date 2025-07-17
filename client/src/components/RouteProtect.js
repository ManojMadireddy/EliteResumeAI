// src/components/RouteProtect.js
import React from "react";
import { Navigate } from "react-router-dom";

export const RouteProtect = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};