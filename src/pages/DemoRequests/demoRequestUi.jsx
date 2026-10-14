import React from "react";
import { Box } from "@mui/material";

/* =========================================
   ROUTES
========================================= */

export const DEMO_REQUESTS_PATH = "/account-manager/requests/demo";
export const TOKENS = {
  pageBg: "#FAFAFA",
  cardBg: "#FFFFFF",
  border: "#E8E8EC",
  headerBg: "#F3F3F4",
  textPrimary: "#1F2937",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  accent: "#FF9F43",
  accentHover: "#F28C28",
  fontFamily:
    '"Plus Jakarta Sans", "Inter", "Segoe UI", system-ui, sans-serif',
};

/* =========================================
   STATUS COLORS
   Keys = status "value" returned by API
========================================= */

const STATUS_STYLES = {
  new: { bg: "#FF9F43", color: "#FFFFFF" },
  contacted: { bg: "#2FB67C", color: "#FFFFFF" },
  meeting_scheduled: { bg: "#7C5CFC", color: "#FFFFFF" },
  onboarding: { bg: "#0B3FD9", color: "#FFFFFF" },
  mailed: { bg: "#0B3FD9", color: "#FFFFFF" },
  converted: { bg: "#16A34A", color: "#FFFFFF" },
  lost: { bg: "#EF4444", color: "#FFFFFF" },
};

const FALLBACK_STATUS = { bg: "#6B7280", color: "#FFFFFF" };

/* =========================================
   STATUS PILL
========================================= */

export const StatusPill = ({ value, label }) => {
  const style = STATUS_STYLES[value] || FALLBACK_STATUS;

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.6,
        height: 20,
        px: 1,
        borderRadius: "5px",
        fontSize: 10.5,
        fontWeight: 500,
        lineHeight: 1,
        whiteSpace: "nowrap",
        backgroundColor: style.bg,
        color: style.color,
      }}
    >
      <Box
        component="span"
        sx={{
          width: 4,
          height: 4,
          borderRadius: "50%",
          backgroundColor: "currentColor",
        }}
      />
      {label || value || "-"}
    </Box>
  );
};

/* =========================================
   DATE FORMAT  ->  29 Sep 2026
========================================= */

export const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};