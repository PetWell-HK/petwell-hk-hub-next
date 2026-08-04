"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthPanel } from "@/contexts/AuthPanelContext";

// Redirect to panel instead of showing page
const Register = () => {
  const navigate = useNavigate();
  const { openPanel } = useAuthPanel();

  useEffect(() => {
    openPanel("LANDING");
    navigate("/", { replace: true });
  }, [openPanel, navigate]);

  return null;
};

export default Register;
