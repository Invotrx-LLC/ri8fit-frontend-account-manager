// src/layout/DrawerLayout.jsx
import React, { useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
  CircularProgress,
  Tooltip,
  Button,
} from "@mui/material";
import {
  Dashboard,
  Business,
  People,
  Work,
  NotificationsNone,
  Menu as MenuIcon,
  Logout,
  ManageAccountsOutlined,
  PersonOutlineOutlined,
  WorkOutlineOutlined,
  CalendarTodayOutlined,
  PeopleOutlineOutlined,
  EmailOutlined,
  PhoneOutlined,
  AccessTimeOutlined,
  CheckCircle,
  TaskAlt,
  MoveToInboxOutlined,
} from "@mui/icons-material";
import NavigateNextIcon from "@mui/icons-material/NavigateNextRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import CloseIcon from "@mui/icons-material/Close";
import { getTrailForPath, resolveTrail } from "../components/Breadcrumbconf";
import { selectDynamicLabels } from "../redux/slices/breadcrumbSlice";
import { useLazyLogoutQuery } from "../redux/services/auth/auth";
import { candidateClearLocalStorage, getItem } from "../utils/constants";
import { toast } from "react-toastify";
import {
  useGetMyAssignedRequestsQuery,
  useGetRequestCandidateScoresQuery,
  useCloseRequestAndAddCandidatesMutation,
} from "../redux/services/drawerService/drawerService";

const drawerWidth = 220;
const collapsedWidth = 72;

const sidebarSections = [
  {
    title: "Main",
    items: [
      {
        label: "Dashboard",
        icon: <Dashboard />,
        path: "/account-manager/dashboard",
      },
    ],
  },
  {
    title: "Workspace",
    items: [
      {
        label: "Organization",
        icon: <Business />,
        path: "/account-manager/organization",
      },
      {
        label: "User Management",
        icon: <ManageAccountsOutlined />,
        path: "/account-manager/user-management",
      },
      {
        label: "Demo Requests",
        icon: <MoveToInboxOutlined />,
        path: "/account-manager/demo-requests",
      },
      {
        label: "Candidates",
        icon: <People />,
        path: "/account-manager/candidates",
      },
      {
        label: "Subscriptions",
        icon: <Work />,
        path: "/account-manager/subscriptions",
        disabled: false,
      },
    ],
  },
  {
    title: "Help",
    items: [
      {
        label: "Settings",
        icon: <Work />,
        path: "/account-manager/settings",
        disabled: false,
      },
    ],
  },

];

/* ─────────────────────────────────────────────
   Score Ring
───────────────────────────────────────────── */
function ScoreRing({ score }) {
  const color = score >= 90 ? "#15803D" : score >= 75 ? "#A16207" : "#B91C1C";
  const bg = score >= 90 ? "#DCFCE7" : score >= 75 ? "#FEF9C3" : "#FEE2E2";
  return (
    <Box
      sx={{
        width: 46,
        height: 46,
        borderRadius: "50%",
        backgroundColor: bg,
        border: `2.5px solid ${color}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Typography
        sx={{ fontSize: "0.68rem", fontWeight: 700, color, lineHeight: 1 }}
      >
        {score?.toFixed(0)}
      </Typography>
      <Typography
        sx={{ fontSize: "0.5rem", color, lineHeight: 1.2, opacity: 0.75 }}
      >
        score
      </Typography>
    </Box>
  );
}

/* ─────────────────────────────────────────────
   Candidate status badge  (shown after confirm)
───────────────────────────────────────────── */
const candidateStatusConfig = {
  matched: {
    label: "Matched",
    bg: "#DCFCE7",
    color: "#15803D",
    icon: <TaskAlt sx={{ fontSize: 12 }} />,
  },
  pending: { label: "Pending", bg: "#FEF9C3", color: "#A16207", icon: null },
  rejected: { label: "Rejected", bg: "#FEE2E2", color: "#B91C1C", icon: null },
};

function CandidateStatusBadge({ status = "" }) {
  const cfg = candidateStatusConfig[status.toLowerCase()] ?? {
    label: status,
    bg: "#F3F4F6",
    color: "#374151",
    icon: null,
  };
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.4,
        backgroundColor: cfg.bg,
        color: cfg.color,
        fontSize: "0.68rem",
        fontWeight: 600,
        px: 1,
        py: "3px",
        borderRadius: "20px",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {cfg.icon}
      {cfg.label}
    </Box>
  );
}

/* ─────────────────────────────────────────────
   Candidate Modal  (RTK Query powered)
───────────────────────────────────────────── */
function CandidateModal({ open, onClose, requestUuid, jobTitle }) {
  // Map of candidateId → { score, status } populated after POST response
  const [confirmedMap, setConfirmedMap] = useState({});

  // ── GET: fetch matched candidates ──
  const {
    data: candidateData,
    isLoading,
    isFetching,
    isError,
  } = useGetRequestCandidateScoresQuery(requestUuid, {
    skip: !open || !requestUuid,
    refetchOnMountOrArgChange: true,
  });

  // ── POST: close request + assign candidates ──
  const [closeRequest, { isLoading: isConfirming }] =
    useCloseRequestAndAddCandidatesMutation();

  // Reset confirmed map each time a fresh request is opened
  React.useEffect(() => {
    if (open) setConfirmedMap({});
  }, [open, requestUuid]);

  const candidates = candidateData?.candidates || [];
  const loading = isLoading || isFetching;
  const isFullyConfirmed =
    candidates.length > 0 &&
    candidates.every((c) => confirmedMap[c.candidate_id]);

  const handleConfirm = async () => {
    if (candidates.length === 0 || isConfirming) return;
    const allIds = candidates.map((c) => c.candidate_id);
    try {
      const result = await closeRequest({
        requestUuid,
        candidateIds: allIds,
      }).unwrap();
      // Build lookup from POST response  { candidateId: { score, status } }
      const newMap = {};
      (result.candidates || []).forEach((rc) => {
        newMap[rc.candidate_id] = { score: rc.score, status: rc.status };
      });
      setConfirmedMap(newMap);
      toast.success("Request closed and candidates assigned ✅");
    } catch {
      toast.error("Failed to confirm assignment. Please try again.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          border: "0.5px solid",
          borderColor: "divider",
        },
      }}
    >
      {/* ── Header ── */}
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2.5,
            py: 1.75,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                backgroundColor: isFullyConfirmed ? "#DCFCE7" : "#EAF3DE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background-color 0.3s",
              }}
            >
              {isFullyConfirmed ? (
                <CheckCircle sx={{ fontSize: 20, color: "#15803D" }} />
              ) : (
                <PeopleOutlineOutlined
                  sx={{ fontSize: 20, color: "#3B6D11" }}
                />
              )}
            </Box>
            <Box>
              <Typography
                fontWeight={600}
                fontSize="0.95rem"
                color="text.primary"
                lineHeight={1.3}
              >
                {isFullyConfirmed
                  ? "Assignment Confirmed"
                  : "Matched Candidates"}
              </Typography>
              <Typography
                fontSize="0.72rem"
                color="text.secondary"
                lineHeight={1.4}
              >
                {jobTitle}
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: "text.secondary" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* ── Body ── */}
      <DialogContent
        sx={{
          p: 1.5,
          maxHeight: "60vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          "&.MuiDialogContent-root": { pt: 1.5 },
        }}
      >
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={28} sx={{ color: "#D85A30" }} />
          </Box>
        )}

        {!loading && isError && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 6,
              gap: 1,
            }}
          >
            <PeopleOutlineOutlined
              sx={{ fontSize: 44, color: "text.disabled" }}
            />
            <Typography fontSize="0.85rem" color="error.main">
              Failed to load candidates. Please try again.
            </Typography>
          </Box>
        )}

        {!loading && !isError && candidates.length === 0 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 6,
              gap: 1.5,
            }}
          >
            <PeopleOutlineOutlined
              sx={{ fontSize: 44, color: "text.disabled" }}
            />
            <Typography fontSize="0.85rem" color="text.secondary">
              No matched candidates found
            </Typography>
          </Box>
        )}

        {/* ── Candidate cards ── */}
        {!loading && !isError && candidates.length > 0 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.25,
              pt: 0.25,
            }}
          >
            {candidates.map((c, idx) => {
              const confirmed = confirmedMap[c.candidate_id]; // { score, status } | undefined
              return (
                <Box
                  key={c.candidate_id}
                  sx={{
                    border: "1.5px solid",
                    borderColor: confirmed ? "#86EFAC" : "divider",
                    borderRadius: 2.5,
                    p: 1.75,
                    backgroundColor: confirmed ? "#F0FDF4" : "background.paper",
                    transition: "all 0.25s ease",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Green accent bar on left when confirmed */}
                  {confirmed && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: 3,
                        height: "100%",
                        backgroundColor: "#22C55E",
                        borderRadius: "3px 0 0 3px",
                      }}
                    />
                  )}

                  {/* Row 1: rank/check + name + status badge + score ring */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                      mb: 1.25,
                    }}
                  >
                    {/* Left: rank bubble + name/exp */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.25,
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          backgroundColor: confirmed
                            ? "#DCFCE7"
                            : idx === 0
                              ? "#FEF9C3"
                              : "#F3F4F6",
                          border: `1.5px solid ${confirmed ? "#22C55E" : idx === 0 ? "#A16207" : "#D1D5DB"}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all 0.25s",
                        }}
                      >
                        {confirmed ? (
                          <CheckCircle
                            sx={{ fontSize: 16, color: "#15803D" }}
                          />
                        ) : (
                          <Typography
                            sx={{
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              color: idx === 0 ? "#A16207" : "#6B7280",
                            }}
                          >
                            #{idx + 1}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          fontWeight={600}
                          fontSize="0.875rem"
                          color="text.primary"
                          lineHeight={1.35}
                          noWrap
                        >
                          {c.candidate_name}
                        </Typography>
                        <Typography
                          fontSize="0.7rem"
                          color="text.disabled"
                          lineHeight={1.4}
                          noWrap
                        >
                          {c.experience}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Right: matched status badge + score ring */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexShrink: 0,
                      }}
                    >
                      {confirmed && (
                        <CandidateStatusBadge status={confirmed.status} />
                      )}
                      <ScoreRing score={c.skillintel_score} />
                    </Box>
                  </Box>

                  {/* Row 2: contact pills */}
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    {[
                      {
                        icon: <EmailOutlined sx={{ fontSize: 13 }} />,
                        text: c.email,
                      },
                      {
                        icon: <PhoneOutlined sx={{ fontSize: 13 }} />,
                        text: c.phone,
                      },
                      ...(c.availability
                        ? [
                          {
                            icon: (
                              <AccessTimeOutlined sx={{ fontSize: 13 }} />
                            ),
                            text: c.availability,
                          },
                        ]
                        : []),
                    ].map(({ icon, text }, i) => (
                      <Box
                        key={i}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          backgroundColor: confirmed
                            ? "#DCFCE7"
                            : "action.hover",
                          color: confirmed ? "#15803D" : "text.secondary",
                          fontSize: "0.72rem",
                          px: 1.1,
                          py: "4px",
                          borderRadius: "20px",
                          whiteSpace: "nowrap",
                          lineHeight: 1,
                          transition: "all 0.25s",
                        }}
                      >
                        {icon}
                        <span style={{ lineHeight: 1 }}>{text}</span>
                      </Box>
                    ))}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </DialogContent>

      {/* ── Footer ── */}
      {!loading && !isError && candidates.length > 0 && (
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          {/* Left: success summary */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {isFullyConfirmed && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <CheckCircle sx={{ fontSize: 15, color: "#15803D" }} />
                <Typography fontSize="0.78rem" fontWeight={600} color="#15803D">
                  {candidates.length} candidate
                  {candidates.length !== 1 ? "s" : ""} assigned · Request closed
                </Typography>
              </Box>
            )}
          </Box>

          {/* Right: action buttons */}
          <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={onClose}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontSize: "0.8rem",
                color: "text.secondary",
                borderColor: "divider",
                "&:hover": { borderColor: "#ccc", backgroundColor: "#fafafa" },
              }}
            >
              {isFullyConfirmed ? "Close" : "Cancel"}
            </Button>

            {!isFullyConfirmed && (
              <Button
                variant="contained"
                size="small"
                onClick={handleConfirm}
                disabled={isConfirming}
                startIcon={
                  isConfirming ? (
                    <CircularProgress size={13} sx={{ color: "#fff" }} />
                  ) : (
                    <TaskAlt sx={{ fontSize: 16 }} />
                  )
                }
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  backgroundColor: "#ff5722",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "#e64a19",
                    boxShadow: "0 2px 8px rgba(255,87,34,0.3)",
                  },
                  "&:disabled": { backgroundColor: "#ffccbc", color: "#fff" },
                }}
              >
                {isConfirming ? "Confirming…" : "Confirm Assignment"}
              </Button>
            )}
          </Box>
        </Box>
      )}
    </Dialog>
  );
}

/* ─────────────────────────────────────────────
   Notification Modal
───────────────────────────────────────────── */
function NotificationModal({ open, onClose }) {
  const { data, isLoading, isFetching, isError } =
    useGetMyAssignedRequestsQuery();

  const [assignModal, setAssignModal] = useState({
    open: false,
    requestUuid: null,
    jobTitle: "",
  });

  const requests = data?.requests || [];
  console.log("getMyAssignedRequests data:", requests);
  const total = data?.total_requests || 0;
  const loading = isLoading || isFetching;

  const formatDate = (str) => {
    if (!str) return "—";
    return new Date(str.replace(" ", "T")).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const statusMap = {
    open: {
      iconBg: "#EAF3DE",
      iconColor: "#3B6D11",
      badgeBg: "#EAF3DE",
      badgeColor: "#3B6D11",
      label: "Open",
    },
    closed: {
      iconBg: "#FCEBEB",
      iconColor: "#A32D2D",
      badgeBg: "#FCEBEB",
      badgeColor: "#A32D2D",
      label: "Closed",
    },
    pending: {
      iconBg: "#FAEEDA",
      iconColor: "#854F0B",
      badgeBg: "#FAEEDA",
      badgeColor: "#854F0B",
      label: "Pending",
    },
  };

  const getStatus = (s = "") =>
    statusMap[s.toLowerCase()] ?? {
      iconBg: "#F1EFE8",
      iconColor: "#5F5E5A",
      badgeBg: "#F1EFE8",
      badgeColor: "#5F5E5A",
      label: s,
    };

  const metaItems = (req) => [
    {
      icon: <PersonOutlineOutlined sx={{ fontSize: 14 }} />,
      text: req.requested_by,
    },
    {
      icon: <PeopleOutlineOutlined sx={{ fontSize: 14 }} />,
      text: `${req.exact_no_of_positions} position${req.exact_no_of_positions !== 1 ? "s" : ""}`,
    },
    {
      icon: <CalendarTodayOutlined sx={{ fontSize: 13 }} />,
      text: formatDate(req.created_at),
    },
  ];

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.10)",
            border: "0.5px solid",
            borderColor: "divider",
          },
        }}
      >
        {/* Header */}
        <DialogTitle sx={{ p: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2.5,
              py: 1.75,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  backgroundColor: "#FAECE7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <NotificationsNone sx={{ fontSize: 20, color: "#993C1D" }} />
              </Box>
              <Box>
                <Typography
                  fontWeight={600}
                  fontSize="0.95rem"
                  color="text.primary"
                  lineHeight={1.3}
                >
                  Requests
                </Typography>
                <Typography
                  fontSize="0.72rem"
                  color="text.secondary"
                  lineHeight={1.4}
                >
                  {loading
                    ? "Loading…"
                    : `${total} assigned request${total !== 1 ? "s" : ""}`}
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={onClose}
              sx={{ color: "text.secondary" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>

        {/* Body */}
        <DialogContent
          sx={{
            p: 1.5,
            maxHeight: "68vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            "&.MuiDialogContent-root": { pt: 1.5 },
          }}
        >
          {loading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 6,
              }}
            >
              <CircularProgress size={28} sx={{ color: "#D85A30" }} />
            </Box>
          )}

          {!loading && isError && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 6,
                gap: 1,
              }}
            >
              <NotificationsNone
                sx={{ fontSize: 44, color: "text.disabled" }}
              />
              <Typography fontSize="0.85rem" color="error.main">
                Failed to load notifications
              </Typography>
            </Box>
          )}

          {!loading && !isError && requests.length === 0 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 6,
                gap: 1.5,
              }}
            >
              <NotificationsNone
                sx={{ fontSize: 44, color: "text.disabled" }}
              />
              <Typography fontSize="0.85rem" color="text.secondary">
                No assigned requests
              </Typography>
            </Box>
          )}

          {!loading && !isError && requests.length > 0 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.25,
                pt: 0.25,
              }}
            >
              {requests.map((req) => {
                const s = getStatus(req.status);
                const isClosed = req.status?.toLowerCase() === "closed";

                return (
                  <Box
                    key={req.request_id}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.25,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2.5,
                      p: 1.75,
                      backgroundColor: "background.paper",
                      transition: "box-shadow 0.15s",
                      "&:hover": { boxShadow: "0 2px 10px rgba(0,0,0,0.07)" },
                    }}
                  >
                    {/* Row 1: icon + title + status badge */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.25,
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            backgroundColor: s.iconBg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <WorkOutlineOutlined
                            sx={{ fontSize: 17, color: s.iconColor }}
                          />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            fontWeight={600}
                            fontSize="0.875rem"
                            color="text.primary"
                            lineHeight={1.35}
                            noWrap
                          >
                            {req.job_title}
                          </Typography>
                          <Typography
                            fontSize="0.7rem"
                            color="text.disabled"
                            lineHeight={1.4}
                            noWrap
                          >
                            {req.request_number}
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          flexShrink: 0,
                          alignSelf: "center",
                          backgroundColor: s.badgeBg,
                          color: s.badgeColor,
                          fontSize: "0.68rem",
                          fontWeight: 600,
                          px: 1.25,
                          py: "3px",
                          borderRadius: "20px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.label}
                      </Box>
                    </Box>

                    {/* Row 2: meta pills */}
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 0.75,
                      }}
                    >
                      {metaItems(req).map(({ icon, text }, i) => (
                        <Box
                          key={i}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            backgroundColor: "action.hover",
                            color: "text.secondary",
                            fontSize: "0.72rem",
                            px: 1.1,
                            py: "4px",
                            borderRadius: "20px",
                            whiteSpace: "nowrap",
                            lineHeight: 1,
                          }}
                        >
                          {icon}
                          <span style={{ lineHeight: 1 }}>{text}</span>
                        </Box>
                      ))}
                    </Box>

                    {/* Row 3: Assign button — always visible, disabled when closed */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        pt: 0.5,
                        borderTop: "1px dashed",
                        borderColor: "divider",
                      }}
                    >
                      {/* Debug: show raw status so you can verify the value */}
                      <Typography
                        sx={{ fontSize: "0.65rem", color: "text.disabled" }}
                      >
                        status: {req.status ?? "—"}
                      </Typography>

                      <Button
                        variant="contained"
                        size="small"
                        disabled={isClosed}
                        onClick={() =>
                          setAssignModal({
                            open: true,
                            // ⚠️ Log req to console to find the correct UUID field name
                            requestUuid: req.request_id,
                            jobTitle: req.job_title,
                          })
                        }
                        sx={{
                          borderRadius: "8px",
                          textTransform: "none",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          px: 1.75,
                          py: 0.6,
                          backgroundColor: isClosed ? undefined : "#ff5722",
                          boxShadow: "none",
                          "&:hover": isClosed
                            ? {}
                            : {
                              backgroundColor: "#e64a19",
                              boxShadow: "0 2px 8px rgba(255,87,34,0.3)",
                            },
                        }}
                      >
                        {isClosed ? "Closed" : "Assign"}
                      </Button>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Candidate Assignment Modal */}
      <CandidateModal
        open={assignModal.open}
        onClose={() =>
          setAssignModal({ open: false, requestUuid: null, jobTitle: "" })
        }
        requestUuid={assignModal.requestUuid}
        jobTitle={assignModal.jobTitle}
      />
    </>
  );
}

/* ─────────────────────────────────────────────
   TopBarBreadcrumb
───────────────────────────────────────────── */
function TopBarBreadcrumb() {
  const location = useLocation();
  const navigate = useNavigate();
  const dynamicLabels = useSelector(selectDynamicLabels);

  const rawTrail = getTrailForPath(location.pathname);
  if (!rawTrail) return null;
  const crumbs = resolveTrail(rawTrail, dynamicLabels);
  if (crumbs.length === 0) return null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        overflow: "hidden",
        flexShrink: 1,
      }}
    >
      <Box
        onClick={() => navigate("/account-manager/dashboard")}
        sx={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          px: 0.8,
          py: 0.4,
          borderRadius: "6px",
          "&:hover": { backgroundColor: "#f5f5f0" },
        }}
      >
        <HomeRoundedIcon sx={{ fontSize: 15, color: "#bbb" }} />
      </Box>
      {crumbs.map((c, idx) => {
        const IconComp = c.icon;
        return (
          <React.Fragment key={idx}>
            <NavigateNextIcon
              sx={{ fontSize: 15, color: "#ddd", flexShrink: 0 }}
            />
            <Box
              onClick={!c.isLast && c.path ? () => navigate(c.path) : undefined}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                px: 0.8,
                py: 0.4,
                borderRadius: "6px",
                cursor: c.isLast || !c.path ? "default" : "pointer",
                backgroundColor: c.isLast ? "#fff5f0" : "transparent",
                "&:hover":
                  !c.isLast && c.path ? { backgroundColor: "#f5f5f0" } : {},
              }}
            >
              {IconComp && (
                <IconComp
                  sx={{ fontSize: 13, color: c.isLast ? "#FF5F1F" : "#aaa" }}
                />
              )}
              <Typography
                sx={{
                  fontSize: "12.5px",
                  fontWeight: c.isLast ? 600 : 500,
                  color: c.isLast ? "#FF5F1F" : "#888",
                  whiteSpace: "nowrap",
                }}
              >
                {c.label}
              </Typography>
            </Box>
          </React.Fragment>
        );
      })}
    </Box>
  );
}

/* ─────────────────────────────────────────────
   DrawerLayout
───────────────────────────────────────────── */
const DrawerLayout = () => {
  const [open, setOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [triggerLogout] = useLazyLogoutQuery();
  const navigate = useNavigate();
  const userData = getItem("am_user");
  const userInfo = userData ? JSON.parse(userData) : null;
  const { data: notifData } = useGetMyAssignedRequestsQuery(undefined, {
    pollingInterval: 60_000,
  });
  const badgeCount =
    notifData?.requests?.filter(
      (req) => req.status?.toLowerCase() === "pending",
    ).length || 0;

  const handleLogout = async () => {
    try {
      await triggerLogout().unwrap();
      candidateClearLocalStorage();
      toast.success("Logged out successfully ✅");
      navigate("/login");
    } catch (err) {
      console.log("Logout error:", err);
      candidateClearLocalStorage();
      navigate("/login");
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* SIDEBAR */}
      <Drawer
        variant="permanent"
        sx={{
          width: open ? drawerWidth : collapsedWidth,
          flexShrink: 0,
          transition: "width 0.3s",
          "& .MuiDrawer-paper": {
            width: open ? drawerWidth : collapsedWidth,
            transition: "width 0.3s",
            overflowX: "hidden",
            borderRight: "1px solid #e8e8e0",
            backgroundColor: "#fff",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            padding: "5px 1px 5px 20px",
            borderBottom: "1px solid #f0f0e8",
            minHeight: 52,
          }}
        >
          <IconButton onClick={() => setOpen(!open)} sx={{ mr: open ? 1 : 0 }}>
            <MenuIcon />
          </IconButton>
          {open && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                letterSpacing: "-0.5px",
                color: "#1a1a1a",
              }}
            >
              RI<span style={{ color: "#ff5722" }}>8</span>FIT
            </Typography>
          )}
        </Box>

        <Box sx={{ flexGrow: 1, overflowY: "auto", py: 1 }}>
          {sidebarSections.map((section, si) => (
            <Box key={si} sx={{ mb: 1.5 }}>
              {open && (
                <Typography
                  sx={{
                    px: 3,
                    py: 1,
                    fontSize: "10.5px",
                    fontWeight: 600,
                    color: "#bbb",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                  }}
                >
                  {section.title}
                </Typography>
              )}
              <List disablePadding>
                {section.items.map((item, idx) => (
                  <ListItemButton
                    key={idx}
                    component={NavLink}
                    to={item.path}
                    disabled={item.disabled}
                    className={
                      item.label === "Organization"
                        ? location.pathname.startsWith(
                          "/account-manager/organization",
                        ) ||
                          location.pathname.startsWith(
                            "/account-manager/org/",
                          ) ||
                          location.pathname.startsWith(
                            "/account-manager/candidate/",
                          )
                          ? "active"
                          : ""
                        : location.pathname.startsWith(item.path)
                          ? "active"
                          : ""
                    }
                    sx={{
                      mx: 1.5,
                      my: 0.3,
                      borderRadius: "8px",
                      color: "#555",
                      "&.active": {
                        backgroundColor: "#fff0eb",
                        color: "#ff5722",
                        fontWeight: 500,
                      },
                      "&:hover": {
                        backgroundColor: "#fff5f0",
                        color: "#ff5722",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 2 : "auto",
                        color: "inherit",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {open && (
                      <ListItemText
                        primary={item.label}
                        sx={{ "& .MuiTypography-root": { fontSize: "13.5px" } }}
                      />
                    )}
                  </ListItemButton>
                ))}
              </List>
            </Box>
          ))}
        </Box>

        <Box sx={{ p: 2, borderTop: "1px solid #f0f0e8" }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: "8px",
              color: "#e03",
              "&:hover": { backgroundColor: "#fef0f0" },
            }}
          >
            <ListItemIcon
              sx={{ minWidth: 0, mr: open ? 2 : "auto", color: "inherit" }}
            >
              <Logout />
            </ListItemIcon>
            {open && (
              <ListItemText
                primary="Logout"
                sx={{
                  "& .MuiTypography-root": {
                    fontSize: "14px",
                    fontWeight: 500,
                  },
                }}
              />
            )}
          </ListItemButton>
        </Box>
      </Drawer>

      {/* MAIN COLUMN */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backgroundColor: "#fff",
            color: "#000",
            borderBottom: "1px solid #e8e8e0",
            height: "52px",
          }}
        >
          <Toolbar
            disableGutters
            sx={{ px: 2, height: "52px", minHeight: "52px", gap: 2, pb: 1 }}
          >
            <TopBarBreadcrumb />
            <Box sx={{ flexGrow: 1 }} />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexShrink: 0,
              }}
            >
              <Tooltip title="Hiring Requests" arrow>
                <IconButton size="small" onClick={() => setNotifOpen(true)}>
                  <Badge badgeContent={badgeCount} color="error">
                    <MoveToInboxOutlined sx={{ fontSize: 20 }} />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Typography
                sx={{ fontSize: "0.875rem", color: "#333", fontWeight: 500 }}
              >
                {userInfo?.name || "User"}
              </Typography>
              <Avatar
                sx={{
                  bgcolor: "#ff5722",
                  width: 32,
                  height: 32,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : "U"}
              </Avatar>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, p: 1, backgroundColor: "#fff", overflow: "auto" }}>
          <Outlet />
        </Box>
      </Box>

      <NotificationModal open={notifOpen} onClose={() => setNotifOpen(false)} />
    </Box>
  );
};

export default DrawerLayout;
