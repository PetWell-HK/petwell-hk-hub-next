"use client";

import { useEffect } from "react";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { useAuthPanel } from "@/contexts/AuthPanelContext";

// Redirect to panel instead of showing page
const ForgotPassword = () => {
  const navigate = useAppNavigate();
  const { openPanel } = useAuthPanel();

  useEffect(() => {
    openPanel("LANDING");
    navigate("/", { replace: true });
  }, [openPanel, navigate]);

  return null;
};

export default ForgotPassword;
