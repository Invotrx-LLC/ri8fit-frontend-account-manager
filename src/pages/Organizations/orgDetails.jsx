// src/pages/Organizations/OrgDetail.jsx

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Button,
  Avatar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  InputAdornment,
  Switch,
} from "@mui/material";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import {
  AccessTimeOutlined,
  Business,
  LocationOnOutlined,
  PeopleOutlineOutlined,
  PersonOutlineOutlined,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { useDispatch } from "react-redux";
import {
  setDynamicLabels,
  clearDynamicLabels,
} from "../../redux/slices/breadcrumbSlice";
import {
  useGetMyOrganisationsQuery,
  useGetOrganisationJobsQuery,
  useGetOrganisationInterviewsQuery,
  useGetOrganisationJobAnalyticsQuery,
  useGetOrganisationCandidatesQuery,
  useLazyGetResumeViewQuery,
  useUpdateOrganisationUpdatedScoresMutation,
} from "../../redux/services/requisition/requisition";
import { useGetEmployeeDetailsQuery } from "../../redux/services/orgEmployees/orgEmployees";

import ReusableMRT from "../../components/table/index";
import ViewToggle from "../../components/table/ViewToggle";
import SearchIcon from "@mui/icons-material/Search";
import SearchFilter from "../../components/searchFilter";
import LayersIcon from "@mui/icons-material/Layers";

// ─── Add this import at the top of your file ───────────────────────────────
import { useGetInterviewDetailsQuery } from "../../redux/services/requisition/requisition";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
// import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
// import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import CustomSelect from "../../components/Select/index";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CandidatePipelineFunnel from "./CandidatePipeline";
import { toast } from "react-toastify";
import OrganizationOverview from "../1dashboard1";

const LABEL_SX = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#9696A6",
};
const CARD_SX = {
  backgroundColor: "#fff",
  borderRadius: "14px",
  border: "1px solid #E8E8EC",
  p: "14px 16px",
};

/* ── Helpers ── */
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    : "—";

const fmtTime = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
};

const slugToTitle = (s = "") =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const STATUS_MAP = {
  scheduled: { bg: "#EEF2FF", color: "#3C3489", border: "#AFA9EC" },
  completed: { bg: "#E1F5EE", color: "#085041", border: "#5DCAA5" },
  cancelled: { bg: "#F3F4F6", color: "#5F5E5A", border: "#D3D1C7" },
  rescheduled: { bg: "#FAEEDA", color: "#633806", border: "#EF9F27" },
  no_show: { bg: "#FCEBEB", color: "#791F1F", border: "#F09595" },
  not_conducted: { bg: "#F3F4F6", color: "#5F5E5A", border: "#D3D1C7" },
};

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

const AVATAR_COLORS = [
  { bg: "#FFF0E8", color: "#993C1D" },
  { bg: "#EEF2FF", color: "#3C3489" },
  { bg: "#E1F5EE", color: "#085041" },
  { bg: "#FAEEDA", color: "#633806" },
  { bg: "#F5F3FF", color: "#534AB7" },
];
function avatarColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

/* ── Section heading ── */
function SectionIcon({ icon: Icon, label }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mb: "12px" }}>
      <Icon sx={{ fontSize: 14, color: "#9696A6" }} />
      <Typography sx={LABEL_SX}>{label}</Typography>
    </Box>
  );
}

/* ── Person row ── */
function PersonRow({ name, subtitle, size = 36 }) {
  const ac = avatarColor(name);
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <Avatar
        sx={{
          width: size,
          height: size,
          fontSize: size * 0.35,
          fontWeight: 700,
          bgcolor: ac.bg,
          color: ac.color,
        }}
      >
        {initials(name)}
      </Avatar>
      <Box>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#111118" }}>
          {name}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontSize: 11, color: "#5C5C70", mt: "1px" }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

/* ── Meta key-value row ── */
function MetaRow({ label, value }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: "6px",
        borderBottom: "1px solid #F3F4F6",
        "&:last-child": { borderBottom: "none", pb: 0 },
        "&:first-of-type": { pt: 0 },
      }}
    >
      <Typography sx={{ fontSize: 12, color: "#9696A6" }}>{label}</Typography>
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 600,
          color: "#111118",
          textTransform: "capitalize",
        }}
      >
        {value ?? "—"}
      </Typography>
    </Box>
  );
}
function InterviewDetailDialog({ open, onClose, interviewId }) {
  const { data, isLoading, isError } = useGetInterviewDetailsQuery(
    interviewId,
    { skip: !interviewId },
  );
  const iv = data?.data ?? null;

  const statusKey = (iv?.status ?? "").toLowerCase();
  const statusCfg = STATUS_MAP[statusKey] ?? STATUS_MAP.scheduled;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.14)",
          maxHeight: "92vh",
        },
      }}
    >
      {/* ══ Header band ══ */}
      <Box
        sx={{ backgroundColor: "#FF5F1F", px: "24px", pt: "22px", pb: "52px" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
                mb: "5px",
              }}
            >
              Interview details
            </Typography>
            {isLoading ? (
              <Box
                sx={{
                  width: 240,
                  height: 26,
                  borderRadius: "6px",
                  backgroundColor: "rgba(255,255,255,0.2)",
                }}
              />
            ) : (
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#fff",
                  lineHeight: 1.25,
                }}
              >
                {iv?.interview_step_name ?? "—"}
              </Typography>
            )}
            {iv && (
              <Typography
                sx={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.65)",
                  mt: "4px",
                }}
              >
                Step {iv.interview_step_number} · {iv.interview_step_type}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              flexWrap: "wrap",
              justifyContent: "flex-end",
              pt: "2px",
            }}
          >
            {iv?.status && (
              <Box
                sx={{
                  px: "11px",
                  py: "4px",
                  borderRadius: "99px",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#fff",
                    textTransform: "capitalize",
                  }}
                >
                  {iv.status}
                </Typography>
              </Box>
            )}
            {iv?.is_final && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  px: "11px",
                  py: "4px",
                  borderRadius: "99px",
                  backgroundColor: "#FBBF24",
                }}
              >
                <EmojiEventsOutlinedIcon
                  sx={{ fontSize: 12, color: "#1F2937" }}
                />
                <Typography
                  sx={{ fontSize: 11, fontWeight: 700, color: "#1F2937" }}
                >
                  Final round
                </Typography>
              </Box>
            )}
            <IconButton
              size="small"
              onClick={onClose}
              sx={{
                color: "rgba(255,255,255,0.8)",
                backgroundColor: "rgba(255,255,255,0.12)",
                borderRadius: "8px",
                width: 28,
                height: 28,
                "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* ══ Scrollable body ══ */}
      <DialogContent
        sx={{
          backgroundColor: "#F7F7F9",
          p: "0 20px 20px",
          mt: "-30px",
          overflowY: "auto",
          maxHeight: "calc(92vh - 180px)",
        }}
      >
        {isLoading ? (
          <Box
            sx={{
              ...CARD_SX,
              mt: "30px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 10,
              gap: 2,
            }}
          >
            <CircularProgress sx={{ color: "#FF5F1F" }} size={28} />
            <Typography sx={{ fontSize: 13, color: "#5C5C70" }}>
              Loading interview details…
            </Typography>
          </Box>
        ) : isError || !iv ? (
          <Box sx={{ ...CARD_SX, mt: "30px", py: 8, textAlign: "center" }}>
            <Typography
              sx={{ fontSize: 14, fontWeight: 600, color: "#B91C1C" }}
            >
              Failed to load details
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              mt: "30px",
            }}
          >
            {/* ── Candidate strip ── */}
            <Box
              sx={{
                ...CARD_SX,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <PersonRow
                name={iv.candidate_name ?? ""}
                subtitle={`${iv.candidate_experience} experience`}
                size={42}
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    px: "11px",
                    py: "5px",
                    borderRadius: "10px",
                    backgroundColor: "#E1F5EE",
                    border: "1px solid #5DCAA5",
                  }}
                >
                  <Typography
                    sx={{ fontSize: 12, fontWeight: 700, color: "#085041" }}
                  >
                    {iv.skill_intel_score}% match
                  </Typography>
                </Box>
                <Box
                  sx={{
                    px: "11px",
                    py: "5px",
                    borderRadius: "10px",
                    backgroundColor: statusCfg.bg,
                    border: `1px solid ${statusCfg.border}`,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: statusCfg.color,
                      textTransform: "capitalize",
                    }}
                  >
                    {iv.status}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* ── Date / Time / Platform ── */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "10px",
              }}
            >
              {/* Date */}
              <Box sx={CARD_SX}>
                <SectionIcon icon={CalendarMonthOutlinedIcon} label="Date" />
                <Typography
                  sx={{ fontSize: 13, fontWeight: 600, color: "#111118" }}
                >
                  {fmtDate(iv.date)}
                </Typography>
                <Typography sx={{ fontSize: 11, color: "#9696A6", mt: "2px" }}>
                  {iv.date
                    ? new Date(iv.date).toLocaleDateString("en-GB", {
                      weekday: "long",
                    })
                    : ""}
                </Typography>
              </Box>

              {/* Time */}
              <Box sx={CARD_SX}>
                <SectionIcon icon={AccessTimeOutlinedIcon} label="Time" />
                <Typography
                  sx={{ fontSize: 13, fontWeight: 600, color: "#111118" }}
                >
                  {fmtTime(iv.start_time)} – {fmtTime(iv.end_time)}
                </Typography>
                <Typography sx={{ fontSize: 11, color: "#9696A6", mt: "2px" }}>
                  {iv.duration} minutes
                </Typography>
              </Box>

              {/* Platform */}
              <Box sx={CARD_SX}>
                <SectionIcon icon={VideocamOutlinedIcon} label="Platform" />
                <Typography
                  sx={{ fontSize: 13, fontWeight: 600, color: "#111118" }}
                >
                  {iv.platform ?? "—"}
                </Typography>
                {iv.meeting_url && (
                  <Box
                    component="a"
                    href={iv.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "3px",
                      fontSize: 11,
                      color: "#185FA5",
                      textDecoration: "none",
                      mt: "3px",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    Join meeting <OpenInNewIcon sx={{ fontSize: 11 }} />
                  </Box>
                )}
              </Box>
            </Box>

            {/* ── Interviewers ── */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              {/* Primary */}
              <Box sx={CARD_SX}>
                <SectionIcon
                  icon={PersonOutlineOutlined}
                  label="Primary interviewer"
                />
                {iv.primary_interviewer?.name ? (
                  <PersonRow
                    name={iv.primary_interviewer.name}
                    subtitle={iv.primary_interviewer.designation ?? ""}
                  />
                ) : (
                  <Typography sx={{ fontSize: 12, color: "#9696A6" }}>
                    Not assigned
                  </Typography>
                )}
              </Box>

              {/* Panel */}
              <Box sx={CARD_SX}>
                <SectionIcon icon={GroupOutlinedIcon} label="Panel members" />
                {iv.panel_members?.length > 0 ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {iv.panel_members.map((p) => (
                      <PersonRow key={p.id} name={p.name} size={28} />
                    ))}
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: 12, color: "#9696A6" }}>
                    No panel members
                  </Typography>
                )}
              </Box>
            </Box>

            {/* ── Skills + Job meta ── */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              {/* Skills */}
              <Box sx={CARD_SX}>
                <SectionIcon
                  icon={PsychologyOutlinedIcon}
                  label="Required skills"
                />
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  {(iv.skills ?? "")
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((skill) => (
                      <Box
                        key={skill}
                        sx={{
                          fontSize: 11,
                          fontWeight: 500,
                          px: "8px",
                          py: "3px",
                          borderRadius: "6px",
                          backgroundColor: "#F3F4F6",
                          border: "1px solid #E8E8EC",
                          color: "#5C5C70",
                          textTransform: "capitalize",
                        }}
                      >
                        {skill}
                      </Box>
                    ))}
                </Box>
              </Box>

              {/* Job meta */}
              <Box sx={CARD_SX}>
                <SectionIcon
                  icon={WorkOutlineRoundedIcon}
                  label="Job details"
                />
                <MetaRow
                  label="Function"
                  value={slugToTitle(iv.function ?? "")}
                />
                <MetaRow
                  label="Sub-function"
                  value={slugToTitle(iv.sub_function ?? "")}
                />
                <MetaRow
                  label="Experience"
                  value={`${iv.min_years}–${iv.max_years} years`}
                />
                <MetaRow label="Work mode" value={iv.mode_of_work} />
                <MetaRow label="Location" value={iv.country} />
              </Box>
            </Box>

            {/* ── Feedback banner (conditional) ── */}
            {!iv.feedback_submitted && statusKey === "completed" && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  px: "16px",
                  py: "13px",
                  borderRadius: "12px",
                  backgroundColor: "#FAEEDA",
                  border: "1px solid #EF9F27",
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <WarningAmberOutlinedIcon
                    sx={{ fontSize: 16, color: "#633806", flexShrink: 0 }}
                  />
                  <Box>
                    <Typography
                      sx={{ fontSize: 13, fontWeight: 600, color: "#633806" }}
                    >
                      Feedback not submitted
                    </Typography>
                    <Typography
                      sx={{ fontSize: 11, color: "#854F0B", mt: "1px" }}
                    >
                      Interview completed — awaiting interviewer feedback
                    </Typography>
                  </Box>
                </Box>
                <Button
                  size="small"
                  sx={{
                    textTransform: "none",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#633806",
                    borderColor: "#EF9F27",
                    border: "1px solid",
                    borderRadius: "8px",
                    px: "14px",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    "&:hover": { backgroundColor: "#FCD34D22" },
                  }}
                >
                  Submit feedback
                </Button>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      {/* ══ Footer ══ */}
      <Box
        sx={{
          px: "20px",
          py: "14px",
          borderTop: "1px solid #E8E8EC",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#fff",
        }}
      >
        <Typography sx={{ fontSize: 11, color: "#9696A6" }}>
          ID #{iv?.id?.slice(0, 8).toUpperCase() ?? "—"}
        </Typography>
        <Box sx={{ display: "flex", gap: "8px" }}>
          <Button
            onClick={onClose}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              fontSize: 13,
              color: "#5C5C70",
              border: "1px solid #E8E8EC",
              borderRadius: "10px",
              px: "18px",
            }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: 13,
              backgroundColor: "#111118",
              borderRadius: "10px",
              px: "18px",
              boxShadow: "none",
              "&:hover": { backgroundColor: "#222", boxShadow: "none" },
            }}
          >
            Reschedule
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  accent: "#FF5F1F",
  accentSoft: "#FFF0E8",
  green: "#0F6E56",
  greenSoft: "#E7F8EE",
  indigo: "#4338CA",
  indigoSoft: "#EEF2FF",
  amber: "#92400E",
  amberSoft: "#FEF3C7",
  red: "#B91C1C",
  redSoft: "#FEE2E2",
  border: "#E8E8EC",
  textPrimary: "#111118",
  textSecondary: "#5C5C70",
  textTertiary: "#9696A6",
};

const STATUS_CHIP = {
  open: { bg: C.greenSoft, color: C.green },
  active: { bg: C.greenSoft, color: C.green },
  closed: { bg: "#F3F4F6", color: "#6B7280" },
  filled: { bg: C.indigoSoft, color: C.indigo },
  on_hold: { bg: C.amberSoft, color: C.amber },
};
const statusChip = (s = "") =>
  STATUS_CHIP[s.toLowerCase().replace(/\s+/g, "_")] ?? {
    bg: "#F3F4F6",
    color: "#6B7280",
  };

const TAB_SX = {
  borderBottom: "1px solid #E5E7EB",
  mb: "5px",
  "& .MuiTab-root": {
    textTransform: "none",
    fontSize: 13,
    fontWeight: 500,
    color: "#6B7280",
    minWidth: "auto",
    px: "4px",
    mr: "24px",
  },
  "& .Mui-selected": { color: `${C.accent} !important`, fontWeight: 600 },
  "& .MuiTabs-indicator": { backgroundColor: C.accent },
};

function getAnalyticsCount(value) {
  if (value == null) return 0;
  if (typeof value === "number" || typeof value === "string") return value;

  if (typeof value === "object") {
    return (
      value.count ??
      value.value ??
      value.job_details_count ??
      value.unique_candidates_count ??
      value.matched_candidates_count ??
      0
    );
  }

  return 0;
}

// ─── Status badge (inline) ────────────────────────────────────────────────────
function StatusPill({ status }) {
  const chip = statusChip(status);
  return (
    <Box
      component="span"
      sx={{
        fontSize: 10,
        fontWeight: 700,
        px: "8px",
        py: "3px",
        borderRadius: "10px",
        backgroundColor: chip.bg,
        color: chip.color,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </Box>
  );
}
function OrgHeroHeader({ org, analytics, orgId }) {
  const initials = org.organisation_name
    ? org.organisation_name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
    : "?";
  const [updatedScores, setUpdatedScores] = useState(false);
  const [updateOrganisationUpdatedScores] =
    useUpdateOrganisationUpdatedScoresMutation();
  const handleToggle = async (event) => {
    const checked = event.target.checked;

    try {
      const response = await updateOrganisationUpdatedScores({
        organisationId: orgId,
        updated_scores: checked,
      }).unwrap();

      setUpdatedScores(checked);

      toast.success(response.updated_scores ? "Switched to updated scores." : "Switched to original scores.");
    } catch (err) {
      toast.error(
        err?.data?.message || "Failed to update organisation."
      );
      console.error(err);
    }
  };

  const statPills = [
    {
      label: "Total Jobs",
      value: getAnalyticsCount(
        analytics?.job_overview?.total_jobs ?? org.total_jobs,
      ),
      accent: C.accent,
      soft: C.accentSoft,
      border: C.accentBorder,
    },
    {
      label: "Candidates",
      value: getAnalyticsCount(analytics?.total_candidates),
      accent: C.indigo,
      soft: C.indigoSoft,
      border: C.indigoBorder,
    },
    {
      label: "Hires",
      value: getAnalyticsCount(
        analytics?.candidate_stage_breakdown?.onboarded ?? org.total_hires,
      ),
      accent: C.green,
      soft: C.greenSoft,
      border: C.greenBorder,
    },
  ];
  const metaItems = [
    org.industry && {
      label: org.industry,
      icon: <Business sx={{ fontSize: 16 }} />,
    },
    org.country && {
      label: org.country,
      icon: <LocationOnOutlined sx={{ fontSize: 16 }} />,
    },
    org.time_zone && {
      label: org.time_zone,
      icon: <AccessTimeOutlined sx={{ fontSize: 16 }} />,
    },
  ].filter(Boolean);
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "wrap",
        mb: "0px",
        pb: "20px",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      {/* ── Left: avatar + name + meta ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Avatar tile */}
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "14px",
            backgroundColor: C.accentSoft,
            border: `1.5px solid ${C.accentBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 800,
              color: C.accent,
              lineHeight: 1,
            }}
          >
            {initials}
          </Typography>
        </Box>

        <Box>
          {/* Name row + active badge */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
              mb: "6px",
            }}
          >
            <Typography
              sx={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, lineHeight: 1 }}
            >
              {org.organisation_name}
            </Typography>
            <Box
              component="span"
              sx={{
                fontSize: 10,
                fontWeight: 700,
                px: "10px",
                py: "3px",
                borderRadius: "20px",
                backgroundColor: C.greenSoft,
                color: C.green,
                border: `1px solid ${C.greenBorder}`,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Active
            </Box>
          </Box>

          {/* Meta row */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexWrap: "wrap",
            }}
          >
            {/* Org ID — monospace pill */}
            <Box
              sx={{
                fontSize: 11,
                fontFamily: "monospace",
                px: "8px",
                py: "3px",
                borderRadius: "6px",
                backgroundColor: "#F3F4F6",
                color: C.textSecondary,
                border: `1px solid ${C.border}`,
                letterSpacing: "0.03em",
              }}
            >
              {org.clin_org_id}
            </Box>

            {metaItems.map(({ label, icon }, index) => (
              <React.Fragment key={label}>
                {index > 0 && (
                  <Box
                    sx={{
                      width: 3,
                      height: 3,
                      borderRadius: "50%",
                      backgroundColor: "#D1D5DB",
                      flexShrink: 0,
                    }}
                  />
                )}
                <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  {icon}
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: C.textSecondary,
                      textTransform: "capitalize",
                    }}
                  >
                    {label}
                  </Typography>
                </Box>
              </React.Fragment>
            ))}
            {org.website_url && (
              <>
                <Box
                  sx={{
                    width: 3,
                    height: 3,
                    borderRadius: "50%",
                    backgroundColor: "#D1D5DB",
                    flexShrink: 0,
                  }}
                />
                <Box
                  component="a"
                  href={org.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    fontSize: 12,
                    color: C.accent,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  🌐 {org.website_url}
                  <OpenInNewIcon sx={{ fontSize: 11 }} />
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* ── Right: stat pills ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >{/* Updated Scores pill */}
        <Box
          onClick={() => handleToggle({ target: { checked: !updatedScores } })}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            px: "14px",
            py: "8px",
            borderRadius: "10px",
            backgroundColor: updatedScores ? C.greenSoft : "#F3F4F6",
            border: `1px solid ${updatedScores ? C.greenBorder : C.border}`,
            cursor: "pointer",
            transition: "background-color 0.15s, border-color 0.15s",
            userSelect: "none",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                color: updatedScores ? C.green : C.textSecondary,
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              Score Mode
            </Typography>
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 600,
                color: updatedScores ? C.green : C.textTertiary,
                opacity: 0.8,
                mt: "3px",
              }}
            >
              {updatedScores ? "Enabled" : "Disabled"}
            </Typography>
          </Box>

          {/* Custom switch */}
          <Box
            sx={{
              width: 36,
              height: 20,
              borderRadius: "999px",
              backgroundColor: updatedScores ? C.green : "#D1D5DB",
              position: "relative",
              transition: "background-color 0.2s ease",
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: "#fff",
                position: "absolute",
                top: 2,
                left: updatedScores ? 18 : 2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                transition: "left 0.2s ease",
              }}
            />
          </Box>
        </Box>
        {statPills.map(({ label, value, accent, soft, border }) => (
          <Box
            key={label}
            sx={{
              px: "16px",
              py: "8px",
              borderRadius: "10px",
              backgroundColor: soft,
              border: `1px solid ${border}`,
              textAlign: "center",
              minWidth: 76,
            }}
          >
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 800,
                color: accent,
                lineHeight: 1,
              }}
            >
              {value}
            </Typography>
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 600,
                color: accent,
                opacity: 0.8,
                mt: "3px",
                letterSpacing: "0.03em",
              }}
            >
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function OrgDetail() {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [tab, setTab] = useState(location.state?.activeTab ?? 0);

  const { data: orgsData, isLoading } = useGetMyOrganisationsQuery();
  console.log("orgsData", orgsData)
  const org =
    location.state?.org ??
    orgsData?.data?.find((o) => String(o.id) === String(orgId));
  const { data: analyticsData } = useGetOrganisationJobAnalyticsQuery(
    { organisationId: orgId, groupBy: "month", status: "all" },
    { skip: !orgId },
  );
  useEffect(() => {
    if (org?.organisation_name)
      dispatch(setDynamicLabels({ orgId: org.organisation_name }));
    return () => dispatch(clearDynamicLabels());
  }, [org?.organisation_name]);

  if (isLoading || !org)
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress sx={{ color: C.accent }} />
      </Box>
    );

  return (
    <Box sx={{ p: 0, height: "100%" }}>
      <OrgHeroHeader org={org} analytics={analyticsData?.data} orgId={orgId} />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={TAB_SX}>
        <Tab label="Overview" />
        <Tab label="Requisitions" />
        <Tab label="Candidates" />
        <Tab label="Interviews" />
        <Tab label="Org Employees" />
        <Tab label="Billing" />
      </Tabs>

      {/* {tab === 0 && <OrgOverviewTab org={org} orgId={orgId} />} */}
      {tab === 0 && <OrganizationOverview orgId={orgId}/>}
      {tab === 1 && (
        <OrgRequisitionsTab
          orgId={orgId}
          orgName={org.organisation_name}
          navigate={navigate}
        />
      )}
      {tab === 2 && (
        <OrgCandidatesTab
          orgId={orgId}
          navigate={navigate}
          orgName={org.organisation_name}
        />
      )}
      {tab === 3 && <OrgInterviewsTab orgId={orgId} />}
      {tab === 4 && <OrgEmployeesTab orgId={orgId} />}
      {tab === 5 && (
        <StaticPlaceholder
          label="Billing"
          description="Billing and invoices will appear here."
        />
      )}
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   TAB 0 — Overview
═══════════════════════════════════════════════ */
function OrgOverviewTab({ org, orgId }) {
  const [groupBy, setGroupBy] = useState("month");
  const [chartType, setChartType] = useState({
    funnel: "line",
    offer: "bar",
    job: "bar",
    stage: "pie",
  });

  const { data: analyticsData, isLoading: analyticsLoading } =
    useGetOrganisationJobAnalyticsQuery({
      organisationId: orgId,
      groupBy,
      status: "all",
    });

  const analytics = analyticsData?.data;

  const profileRows = [
    { label: "Company name", value: org.organisation_name },
    { label: "Location", value: org.country ?? "—" },
    { label: "Website", value: org.website_url ?? "—" },
    { label: "Industry", value: org.industry ?? "—" },
    { label: "Timezone", value: org.time_zone ?? "—" },
  ];
  const pipelineData = useMemo(() => {
    const stage = analytics?.candidate_stage_breakdown;

    if (!stage) return {};

    return {
      matched: stage.matched ?? 0,
      shortlisted: stage.shortlisted ?? 0,

      // Interview stage
      interviewing: stage.interviewing?.total ?? 0,

      selected: stage.selected ?? 0,

      // Offer stage
      offer_released: stage.offers?.offer_released?.total ?? 0,
      offer_accepted: stage.offers?.offer_released?.offer_accepted ?? 0,
      offer_rejected: stage.offers?.offer_released?.offer_rejected ?? 0,
      offer_revoked: stage.offers?.offer_released?.offer_revoked ?? 0,

      onboarded: stage.onboarded ?? 0,
      rejected: stage.rejected ?? 0,
    };
  }, [analytics]);

  /* ── Derived chart data ── */
  const jobTrendData =
    analytics?.job_status_trend?.labels?.map((label, i) => ({
      label,
      Open: analytics.job_status_trend.open[i] ?? 0,
      Closed: analytics.job_status_trend.closed[i] ?? 0,
    })) ?? [];

  const funnelData = analytics
    ? [
      { name: "Matched", value: analytics.candidate_stage_breakdown.matched },
      {
        name: "Shortlisted",
        value: analytics.candidate_stage_breakdown.shortlisted,
      },
      {
        name: "Interviewing",
        value:
          analytics.candidate_stage_breakdown.interview_scheduled +
          analytics.candidate_stage_breakdown.interview_rescheduled,
      },
      {
        name: "Selected",
        value: analytics.candidate_stage_breakdown.selected,
      },
      {
        name: "Rejected",
        value: analytics.candidate_stage_breakdown.rejected,
      },
      {
        name: "Onboarded",
        value: analytics.candidate_stage_breakdown.onboarded,
      },
    ].filter((d) => d.value > 0)
    : [];

  const candidateTrendData =
    analytics?.candidate_funnel_trend?.labels?.map((label, i) => ({
      label,
      Matched: analytics.candidate_funnel_trend.matched[i] ?? 0,
      Shortlisted: analytics.candidate_funnel_trend.shortlisted[i] ?? 0,
      Rejected: analytics.candidate_funnel_trend.rejected[i] ?? 0,
      Onboarded: analytics.candidate_funnel_trend.onboarded[i] ?? 0,
    })) ?? [];

  const offerTrendData =
    analytics?.offer_analysis_trend?.labels?.map((label, i) => ({
      label,
      Released: analytics.offer_analysis_trend.offer_released[i] ?? 0,
      Accepted: analytics.offer_analysis_trend.offer_accepted[i] ?? 0,
      Rejected: analytics.offer_analysis_trend.offer_rejected[i] ?? 0,
      Revoked: analytics.offer_analysis_trend.offer_revoked[i] ?? 0,
    })) ?? [];

  const PIE_COLORS = [C.accent, C.green, C.indigo, "#F59E0B", C.red, "#8B5CF6"];

  const overviewCards = [
    {
      label: "Total Jobs",
      value: analytics?.job_overview.total_jobs?.value ?? 0,
      color: C.accent,
      soft: C.accentSoft,
    },
    {
      label: "Open Jobs",
      value: analytics?.job_overview.open_jobs?.value ?? 0,
      color: C.green,
      soft: C.greenSoft,
    },
    {
      label: "Closed Jobs",
      value: analytics?.job_overview.closed_jobs?.value ?? 0,
      color: "#6B7280",
      soft: "#F3F4F6",
    },
    {
      label: "Total Candidates",
      value: analytics?.total_candidates ?? 0,
      color: C.indigo,
      soft: C.indigoSoft,
    },
  ];

  return (
    <Grid
      container
      spacing={3}
      sx={{ display: "flex", flexDirection: "column" }}
    >
      <Grid size={{ xs: 12, md: 12 }}>
        {/* Group-by toggle */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: "16px",
          }}
        >
          {/* <SectionLabel>Job Analytics</SectionLabel> */}
          <CustomSelect
            value={groupBy}
            onChange={setGroupBy}
            options={["month", "week", "day"]}
            placeholder="Group By"
            width={120}
            height={120}
          />
        </Box>

        {analyticsLoading ? (
          <Loader />
        ) : !analytics ? (
          <ErrAlert msg="Could not load analytics" />
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

            {/* ── KPI cards ── */}
            <Grid container spacing={1.5}>
              {overviewCards.map(({ label, value, color, soft }) => (
                <Grid size={{ xs: 6, sm: 3 }} key={label}>

                  <Box
                    sx={{
                      borderRadius: "10px",
                      border: `1px solid ${C.border}`,
                      p: "14px",
                      backgroundColor: soft,
                    }}
                  >
                    <Typography
                      sx={{ fontSize: 11, color, fontWeight: 600, mb: "4px" }}
                    >
                      {label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 26,
                        fontWeight: 800,
                        color,
                        lineHeight: 1,
                      }}
                    >
                      {value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            {/* <CandidatePipelineFunnel/> */}
            <CandidatePipelineFunnel
              data={pipelineData}
              totalCount={analytics?.total_candidates ?? 0}
            />
            {/* ── Candidate funnel trend ── */}
            <ChartCard
              title={
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: C.textSecondary,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                    }}
                  >
                    Candidate Funnel Trend
                  </Typography>
                  <Tabs
                    value={chartType.funnel}
                    onChange={(e, val) =>
                      setChartType({ ...chartType, funnel: val })
                    }
                    sx={{
                      minHeight: "32px",
                      "& .MuiTabs-indicator": {
                        backgroundColor: C.accent,
                        height: "3px",
                        borderRadius: "10px",
                      },
                      "& .MuiTab-root": {
                        minHeight: "32px",
                        minWidth: "70px",
                        fontSize: "11px",
                        textTransform: "none",
                        fontWeight: 600,
                        color: "#888",
                        padding: "6px 12px",
                      },
                      "& .Mui-selected": { color: `${C.accent} !important` },
                    }}
                  >
                    <Tab label="Bar" value="bar" />
                    <Tab label="Line" value="line" />
                  </Tabs>
                </Box>
              }
            >
              <ResponsiveContainer width="100%" height={220}>
                {chartType.funnel === "line" ? (
                  <LineChart data={candidateTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="label"
                      tick={{
                        fontSize: 14,
                      }}
                    />
                    <YAxis
                      tick={{
                        fontSize: 14,
                      }}
                    />
                    <Tooltip />
                    <Legend
                      iconSize={8}
                      wrapperStyle={{
                        fontSize: 14,
                      }}
                    />
                    <Line type="monotone" dataKey="Matched" stroke={C.accent} />
                    <Line
                      type="monotone"
                      dataKey="Shortlisted"
                      stroke={C.green}
                    />
                    <Line type="monotone" dataKey="Rejected" stroke={C.red} />
                    <Line
                      type="monotone"
                      dataKey="Onboarded"
                      stroke={C.indigo}
                    />
                  </LineChart>
                ) : (
                  <BarChart data={candidateTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="label"
                      tick={{
                        fontSize: 14,
                      }}
                    />
                    <YAxis
                      tick={{
                        fontSize: 14,
                      }}
                    />
                    <Tooltip />
                    <Legend
                      iconSize={8}
                      wrapperStyle={{
                        fontSize: 14,
                      }}
                    />
                    <Bar dataKey="Matched" fill={C.accent} />
                    <Bar dataKey="Shortlisted" fill={C.green} />
                    <Bar dataKey="Rejected" fill={C.red} />
                    <Bar dataKey="Onboarded" fill={C.indigo} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </ChartCard>

            {/* ── Stage breakdown (Pie) + Offer trend side by side ── */}
            <Grid container spacing={2}>
              {/* LEFT CHART */}
              <Grid
                size={{ xs: 12, sm: 6 }}
                sx={{
                  display: "flex",
                }}
              >
                <ChartCard
                  sx={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  title={
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: C.textSecondary,
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                        }}
                      >
                        Candidate Stage Breakdown
                      </Typography>

                      <Tabs
                        value={chartType.stage}
                        onChange={(e, val) =>
                          setChartType({
                            ...chartType,
                            stage: val,
                          })
                        }
                        sx={{
                          minHeight: "32px",

                          "& .MuiTabs-indicator": {
                            backgroundColor: C.accent,
                            height: "3px",
                            borderRadius: "10px",
                          },

                          "& .MuiTab-root": {
                            minHeight: "32px",
                            minWidth: "70px",
                            fontSize: "11px",
                            textTransform: "none",
                            fontWeight: 600,
                            color: "#888",
                            padding: "6px 12px",
                          },

                          "& .Mui-selected": {
                            color: `${C.accent} !important`,
                          },
                        }}
                      >
                        <Tab label="Pie" value="pie" />
                        <Tab label="Line" value="line" />
                      </Tabs>
                    </Box>
                  }
                >
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    {funnelData.length === 0 ? (
                      <NoData />
                    ) : chartType.stage === "pie" ? (
                      <Box>
                        <ResponsiveContainer width="100%" height={280}>
                          <PieChart
                            margin={{
                              top: 20,
                              right: 40,
                              bottom: 20,
                              left: 40,
                            }}
                          >
                            <Pie
                              data={funnelData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={3}
                              label={false}
                            >
                              {funnelData.map((_, i) => (
                                <Cell
                                  key={i}
                                  fill={PIE_COLORS[i % PIE_COLORS.length]}
                                />
                              ))}
                            </Pie>

                            <Tooltip
                              contentStyle={{
                                fontSize: 11,
                                borderRadius: 8,
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>

                        {/* Legend */}
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "center",
                            gap: 1.5,
                            mt: 1,
                            px: 1,
                          }}
                        >
                          {funnelData.map((item, index) => (
                            <Box
                              key={item.name}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                background: "#fff",
                                px: 1.2,
                                py: 0.6,
                                borderRadius: "999px",
                                border: "1px solid #F1F5F9",
                              }}
                            >
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: "50%",
                                  backgroundColor:
                                    PIE_COLORS[index % PIE_COLORS.length],
                                }}
                              />

                              <Typography
                                sx={{
                                  fontSize: 11,
                                  color: C.textSecondary,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {item.name}:{" "}
                                <Box
                                  component="span"
                                  sx={{
                                    fontWeight: 700,
                                    color: C.textPrimary,
                                  }}
                                >
                                  {item.value}
                                </Box>
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    ) : (
                      <ResponsiveContainer width="100%" height={360}>
                        <LineChart data={funnelData}>
                          <CartesianGrid strokeDasharray="3 3" />

                          <XAxis
                            dataKey="name"
                            tick={{
                              fontSize: 14,
                            }}
                          />

                          <YAxis
                            tick={{
                              fontSize: 14,
                            }}
                          />

                          <Tooltip />

                          <Legend />

                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke={C.accent}
                            strokeWidth={3}
                            dot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </Box>
                </ChartCard>
              </Grid>

              {/* RIGHT CHART */}
              <Grid
                size={{ xs: 12, sm: 6 }}
                sx={{
                  display: "flex",
                }}
              >
                <ChartCard
                  sx={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  title={
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: C.textSecondary,
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                        }}
                      >
                        Offer Analysis Trend
                      </Typography>

                      <Tabs
                        value={chartType.offer}
                        onChange={(e, val) =>
                          setChartType({
                            ...chartType,
                            offer: val,
                          })
                        }
                        sx={{
                          minHeight: "32px",

                          "& .MuiTabs-indicator": {
                            backgroundColor: C.accent,
                            height: "3px",
                            borderRadius: "10px",
                          },

                          "& .MuiTab-root": {
                            minHeight: "32px",
                            minWidth: "70px",
                            fontSize: "11px",
                            textTransform: "none",
                            fontWeight: 600,
                          },
                        }}
                      >
                        <Tab label="Bar" value="bar" />
                        <Tab label="Line" value="line" />
                      </Tabs>
                    </Box>
                  }
                >
                  <Box
                    sx={{
                      flex: 1,
                      width: "100%",
                      minHeight: 360,
                      display: "flex",
                      flexDirection: "column",
                      // overflow: "hidden",
                      minWidth: 0,
                    }}
                  >
                    {chartType.offer === "bar" ? (
                      <ResponsiveContainer width="100%" height={360}>
                        <BarChart
                          data={offerTrendData}
                          margin={{
                            top: 10,
                            right: 10,
                            left: 0,
                            bottom: 0,
                          }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#F3F4F6"
                          />

                          <XAxis
                            dataKey="label"
                            tick={{
                              fontSize: 14,
                            }}
                          />

                          <YAxis
                            tick={{
                              fontSize: 14,
                            }}
                            allowDecimals={false}
                          />

                          <Tooltip
                            contentStyle={{
                              fontSize: 11,
                              borderRadius: 8,
                            }}
                          />

                          <Legend
                            iconSize={8}
                            wrapperStyle={{
                              fontSize: 14,
                            }}
                          />

                          <Bar
                            dataKey="Released"
                            fill={C.green}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                          />

                          <Bar
                            dataKey="Accepted"
                            fill={C.indigo}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                          />

                          <Bar
                            dataKey="Rejected"
                            fill={C.red}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                          />

                          <Bar
                            dataKey="Revoked"
                            fill={C.amber}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <ResponsiveContainer width="100%" height={360}>
                        <LineChart
                          data={offerTrendData}
                          margin={{
                            top: 10,
                            right: 10,
                            left: 0,
                            bottom: 0,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />

                          <XAxis
                            dataKey="label"
                            tick={{
                              fontSize: 14,
                            }}
                          />

                          <YAxis
                            tick={{
                              fontSize: 14,
                            }}
                          />

                          <Tooltip />

                          <Legend
                            iconSize={8}
                            wrapperStyle={{
                              fontSize: 14,
                            }}
                          />

                          <Line
                            type="monotone"
                            dataKey="Released"
                            stroke={C.green}
                            strokeWidth={3}
                          />

                          <Line
                            type="monotone"
                            dataKey="Accepted"
                            stroke={C.indigo}
                            strokeWidth={3}
                          />

                          <Line
                            type="monotone"
                            dataKey="Rejected"
                            stroke={C.red}
                            strokeWidth={3}
                          />

                          <Line
                            type="monotone"
                            dataKey="Revoked"
                            stroke={C.amber}
                            strokeWidth={3}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </Box>
                </ChartCard>
              </Grid>
            </Grid>

            {/* ── Job status trend ── */}
            <ChartCard
              title={
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: C.textSecondary,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                    }}
                  >
                    Job Status Trend
                  </Typography>
                  <Tabs
                    value={chartType.job}
                    onChange={(e, val) =>
                      setChartType({ ...chartType, job: val })
                    }
                    sx={{
                      minHeight: "32px",
                      "& .MuiTabs-indicator": {
                        backgroundColor: C.accent,
                        height: "3px",
                        borderRadius: "10px",
                      },
                      "& .MuiTab-root": {
                        minHeight: "32px",
                        minWidth: "70px",
                        fontSize: "11px",
                        textTransform: "none",
                        fontWeight: 600,
                      },
                    }}
                  >
                    <Tab label="Bar" value="bar" />
                    <Tab label="Line" value="line" />
                  </Tabs>
                </Box>
              }
            >
              <ResponsiveContainer width="100%" height={180}>
                {chartType.job === "bar" ? (
                  <BarChart
                    data={jobTrendData}
                    margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="label" tick={{ fontSize: 14 }} />
                    <YAxis tick={{ fontSize: 14 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 14 }} />
                    <Bar dataKey="Open" fill={C.green} radius={[4, 4, 0, 0]} />
                    <Bar
                      dataKey="Closed"
                      fill="#9CA3AF"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                ) : (
                  <LineChart data={jobTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 14 }} />
                    <YAxis tick={{ fontSize: 14 }} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 14 }} />
                    <Line type="monotone" dataKey="Open" stroke={C.green} />
                    <Line type="monotone" dataKey="Closed" stroke="#9CA3AF" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </ChartCard>
          </Box>
        )}
      </Grid>
    </Grid>
  );
}

/* ═══════════════════════════════════════════════
   TAB 1 — Requisitions  (grid + list toggle)
═══════════════════════════════════════════════ */
function OrgRequisitionsTab({ orgId, orgName, navigate }) {
  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, error } = useGetOrganisationJobsQuery({
    orgId,
    status: "all",
  });

  console.log("orgId", orgId);
  const reqColumns = useMemo(
    () => [
      {
        accessorKey: "job_title",
        header: "Job Title",
        size: 250,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "8px",
                backgroundColor: C.accentSoft,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <WorkOutlineRoundedIcon sx={{ color: C.accent, fontSize: 18 }} />
            </Box>
            <Box>
              <Typography
                sx={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}
              >
                {row.original.job_title}
              </Typography>
              <Typography sx={{ fontSize: 11 }} color={C.textSecondary}>
                {row.original.job_position_id}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 100,
        Cell: ({ cell }) => <StatusPill status={cell.getValue()} />,
      },
      {
        accessorKey: "function",
        header: "Function",
        size: 200,
        Cell: ({ cell }) => (
          <Typography
            color={C.textSecondary}
            sx={{ textTransform: "capitalize", fontSize: 12 }}
          >
            {cell.getValue() ?? "—"}
          </Typography>
        ),
      },
      {
        accessorKey: "sub_function",
        header: "Sub-function",
        size: 200,
        Cell: ({ cell }) => (
          <Typography
            color={C.textSecondary}
            sx={{ textTransform: "capitalize", fontSize: 12 }}
          >
            {cell.getValue() ?? "—"}
          </Typography>
        ),
      },
      {
        id: "experience",
        header: "Experience",
        size: 110,
        Cell: ({ row }) => {
          const { min_years, max_years } = row.original;
          return (
            <Typography sx={{ fontSize: 12 }} color={C.textPrimary}>
              {min_years != null && max_years != null
                ? `${min_years}–${max_years} yrs`
                : "—"}
            </Typography>
          );
        },
      },
      {
        accessorKey: "no_of_positions",
        header: "Positions",
        size: 90,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: 12 }} color={C.textPrimary}>
            {cell.getValue() ?? "—"}
          </Typography>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Created",
        size: 120,
        Cell: ({ cell }) => {
          const v = cell.getValue();
          return (
            <Typography sx={{ fontSize: 12 }} color={C.textPrimary}>
              {v
                ? new Date(v).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                : "—"}
            </Typography>
          );
        },
      },
      {
        accessorKey: "closing_date",
        header: "Closing Date",
        size: 120,
        Cell: ({ cell }) => {
          const v = cell.getValue();
          return (
            <Typography sx={{ fontSize: 12 }} color={C.textPrimary}>
              {v
                ? new Date(v).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                : "—"}
            </Typography>
          );
        },
      },
      {
        accessorKey: "job_type",
        header: "Type",
        size: 100,
        Cell: ({ cell }) => (
          <Typography
            color={C.textSecondary}
            sx={{ textTransform: "capitalize", fontSize: 12 }}
          >
            {cell.getValue() ?? "—"}
          </Typography>
        ),
      },
    ],
    [],
  );
  const jobs = data?.data ?? [];

  // Global Search Filter
  const filteredJobs = jobs.filter((job) => {
    const searchValue = search.toLowerCase();

    return (
      job.job_title?.toLowerCase().includes(searchValue) ||
      job.job_position_id?.toLowerCase().includes(searchValue) ||
      job.function?.toLowerCase().includes(searchValue) ||
      job.sub_function?.toLowerCase().includes(searchValue) ||
      job.job_type?.toLowerCase().includes(searchValue) ||
      job.status?.toLowerCase().includes(searchValue)
    );
  });
  const goToReq = (job) =>
    navigate(
      `/account-manager/org/${orgId}/requisitions/${job.job_id ?? job.id}`,
      {
        state: {
          jobTitle: job.job_title,
          orgName,
          job,
          previousTab: 1, // Requisitions tab index
        },
      },
    );

  return (
    <Box>
      {/* Top Toolbar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          mb: "18px",
          gap: 2,
          // border:2
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            backgroundColor: C.accent,
            p: 1,
            borderRadius: "8px",
            cursor: "pointer",
          }}
          onClick={() =>
            navigate("/account-manager/create-requisition", {
              state: { orgId },
            })
          }
        >
          <ControlPointIcon sx={{ fontSize: 16, color: "#fff" }} />
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>
            Add Requisition
          </Typography>
        </Box>

        <SearchFilter
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search employees..."
        />

        <ViewToggle view={view} onChange={setView} />
      </Box>

      {view === "grid" ? (
        <Grid container spacing={2}>
          {filteredJobs.map((job) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, xl: 3 }} key={job.job_id}>
              <RequisitionCard job={job} onOpen={() => goToReq(job)} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ mt: -2 }}>
          <ReusableMRT
            data={filteredJobs}
            columnData={reqColumns}
            enableRowActions={false}
            enableRowSelection={false}
            enableGlobalFilter={false}
            height="calc(100vh - 240px)"
            onRowClick={goToReq}
          />
        </Box>
      )}
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   TAB 2 — Candidates  (grid + list toggle)
═══════════════════════════════════════════════ */
function OrgCandidatesTab({ orgId, navigate, orgName }) {
  const [view, setView] = useState("grid");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, isError } = useGetOrganisationCandidatesQuery(orgId);
  const candidates = data?.data ?? [];
  const [search, setSearch] = useState("");

  const statusOptions = useMemo(() => {
    const set = new Set();
    candidates.forEach((c) => c.jobs?.forEach((j) => set.add(j.current_stage)));
    return Array.from(set);
  }, [candidates]);

  const filtered =
    statusFilter === "all"
      ? candidates
      : candidates.filter((c) =>
        c.jobs?.some((j) => j.current_stage === statusFilter),
      );

  const goToCandidate = (candidate, matchedCandidateId, job) =>
    navigate(`/account-manager/candidate/${candidate.candidate_id}`, {
      state: {
        orgId,
        orgName,
        matched_candidate_id: matchedCandidateId,
        previousTab: 2,

        // important
        from: "org-candidates",
        previousPath: location.pathname,

        // modal/job context
        jobId: job?.job_id,
        jobTitle: job?.job_title,
      },
    });

  const candColumns = useMemo(
    () => [
      {
        accessorKey: "candidate_name",
        header: "Candidate",
        size: 200,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: C.accent,
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {row.original.candidate_name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}
              >
                {row.original.candidate_name}
              </Typography>
              <Typography sx={{ fontSize: 12 }} color={C.textSecondary} noWrap>
                {row.original.email}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        accessorKey: "phone_number",
        header: "Phone",
        size: 200,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: 12 }} color={C.textPrimary}>
            {cell.getValue() ?? "—"}
          </Typography>
        ),
      },
      {
        id: "current_stage",
        header: "Stage",
        size: 130,
        accessorFn: (row) => row.jobs?.[0]?.current_stage ?? "—",
        Cell: ({ cell }) => {
          const stage = cell.getValue();
          const s = stage.toLowerCase();
          const color = s.includes("reject")
            ? C.red
            : s.includes("shortlist")
              ? C.green
              : s.includes("interview")
                ? C.amber
                : s.includes("select") || s.includes("onboard")
                  ? C.indigo
                  : C.textSecondary;
          const bg = s.includes("reject")
            ? C.redSoft
            : s.includes("shortlist")
              ? C.greenSoft
              : s.includes("interview")
                ? C.amberSoft
                : s.includes("select") || s.includes("onboard")
                  ? C.indigoSoft
                  : "#F3F4F6";
          return (
            <Box
              component="span"
              sx={{
                fontSize: 11,
                fontWeight: 700,
                px: "8px",
                py: "3px",
                borderRadius: "8px",
                backgroundColor: bg,
                color,
                textTransform: "capitalize",
              }}
            >
              {stage}
            </Box>
          );
        },
      },
      {
        id: "jobs_count",
        header: "Jobs Here",
        size: 90,
        accessorFn: (row) => row.jobs?.length ?? 0,
        Cell: ({ cell }) => (
          <Typography
            sx={{ fontSize: 12, fontWeight: 600, color: C.textPrimary }}
          >
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: "matched_count",
        header: "Matched",
        size: 90,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: 12 }} color={C.textPrimary}>
            {cell.getValue() ?? 0}
          </Typography>
        ),
      },
      {
        accessorKey: "shortlisted_count",
        header: "Shortlisted",
        size: 100,
        Cell: ({ cell }) => (
          <Typography
            sx={{ fontSize: 12 }}
            color={cell.getValue() > 0 ? C.green : C.textSecondary}
            fontWeight={cell.getValue() > 0 ? 700 : 400}
          >
            {cell.getValue() ?? 0}
          </Typography>
        ),
      },
      {
        accessorKey: "interviewing_count",
        header: "Interviewing",
        size: 100,
        Cell: ({ cell }) => (
          <Typography
            sx={{ fontSize: 12 }}
            color={cell.getValue() > 0 ? C.amber : C.textSecondary}
            fontWeight={cell.getValue() > 0 ? 700 : 400}
          >
            {cell.getValue() ?? 0}
          </Typography>
        ),
      },
      {
        accessorKey: "selected_count",
        header: "Selected",
        size: 90,
        Cell: ({ cell }) => (
          <Typography
            sx={{ fontSize: 12 }}
            color={cell.getValue() > 0 ? C.indigo : C.textSecondary}
            fontWeight={cell.getValue() > 0 ? 700 : 400}
          >
            {cell.getValue() ?? 0}
          </Typography>
        ),
      },
    ],
    [],
  );
  const searchedCandidates = filtered.filter((candidate) => {
    const value = search.toLowerCase();

    return (
      candidate.candidate_name?.toLowerCase().includes(value) ||
      candidate.email?.toLowerCase().includes(value) ||
      candidate.phone_number?.toLowerCase().includes(value) ||
      candidate.jobs?.some((job) =>
        job.current_stage?.toLowerCase().includes(value),
      )
    );
  });
  if (isLoading) return <Loader />;
  if (isError || !candidates.length)
    return (
      <StaticPlaceholder
        label="No Candidates"
        description="No matched candidates found for this organization."
      />
    );

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: "16px",
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            px: 1.8,
            // py: 0.8,
            borderRadius: "8px",
            background: "rgba(255, 95, 31, 0.08)",
            border: "1px solid rgba(255, 95, 31, 0.2)",
            transition: "0.3s ease",
            "&:hover": {
              background: "rgba(255, 95, 31, 0.14)",
              transform: "translateY(-1px)",
            },
          }}
        >
          <Box
            sx={{
              minWidth: 28,
              height: 28,
              borderRadius: "8px",
              background: "#FF5F1F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              px: 1,
              boxShadow: "0 4px 12px rgba(255,95,31,0.35)",
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1,
              }}
            >
              {filtered.length}
            </Typography>
          </Box>

          <Box sx={{ padding: 1, borderRadius: 0 }}>
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 600,
                color: "#FF5F1F",
                textTransform: "uppercase",
                letterSpacing: 1,
                lineHeight: 1,
              }}
            >
              Total
            </Typography>

            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 600,
                color: C.textPrimary,
                lineHeight: 1,
              }}
            >
              Candidate{filtered.length !== 1 ? "s" : ""}
            </Typography>
          </Box>
        </Box>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          {/* <InputLabel sx={{ fontSize: 12 }}>Filter by stage</InputLabel> */}

          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            placeholder="All Stages"
            width={160}
            height={300}
          />
        </FormControl>
        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 2 }}>
          <SearchFilter
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees..."
          />
          <ViewToggle view={view} onChange={setView} />
        </Box>
      </Box>

      {view === "grid" && (
        <Grid container spacing={2}>
          {searchedCandidates.map((candidate) => {
            const orgJobs = candidate.jobs ?? [];
            const primaryJob = orgJobs[0];
            return (
              <Grid
                size={{ xs: 12, sm: 6, md: 4, xl: 3 }}
                key={candidate.candidate_id}
              >
                <AssignedCandidateCard
                  candidate={candidate}
                  primaryJob={primaryJob}
                  orgJobCount={orgJobs.length}
                  onView={(matchedId) => goToCandidate(candidate, matchedId)}
                />
              </Grid>
            );
          })}
        </Grid>
      )}

      {view === "list" && (
        <ReusableMRT
          data={searchedCandidates}
          columnData={candColumns}
          enableRowActions={false}
          enableRowSelection={false}
          enableGlobalFilter={true}
          height="calc(100vh - 260px)"
          onRowClick={(row) =>
            goToCandidate(row, row.jobs?.[0]?.matched_candidate_id)
          }
        />
      )}
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   TAB 3 — Interviews  (grid + list toggle)
═══════════════════════════════════════════════ */
function OrgInterviewsTab({ orgId }) {
  const [view, setView] = useState("list");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedInterviewId, setSelectedInterviewId] = useState(null); // ← NEW

  const { data, isLoading, isError } = useGetOrganisationInterviewsQuery(orgId);
  const interviews = data?.data ?? [];

  console.log("interviews", interviews);
  const interviewStatuses = [
    { key: "scheduled", value: "Scheduled" },
    { key: "completed", value: "Completed" },
    { key: "cancelled", value: "Cancelled" },
    { key: "rescheduled", value: "Rescheduled" },
    { key: "no_show", value: "No Show" },
    { key: "not_conducted", value: "Not Conducted" },
  ];

  const filtered =
    statusFilter === "all"
      ? interviews
      : interviews.filter(
        (iv) => (iv.interview_status ?? "scheduled") === statusFilter,
      );

  const searchedInterviews = filtered.filter((iv) => {
    const value = search.toLowerCase();
    return (
      iv.job_title?.toLowerCase().includes(value) ||
      iv.job_position_id?.toLowerCase().includes(value) ||
      iv.interview_step_name?.toLowerCase().includes(value) ||
      iv.interview_type?.toLowerCase().includes(value) ||
      iv.sub_function?.toLowerCase().includes(value) ||
      iv.created_by?.toLowerCase().includes(value) ||
      iv.interview_status?.toLowerCase().includes(value)
    );
  });

  // ivColumns stays exactly the same as your existing code — no changes needed
  const ivColumns = useMemo(
    () => [
      {
        accessorKey: "job_title",
        header: "Job",
        size: 240,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "8px",
                backgroundColor: C.accentSoft,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <WorkOutlineRoundedIcon sx={{ color: C.accent, fontSize: 18 }} />
            </Box>
            <Box>
              <Typography
                sx={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}
              >
                {row.original.job_title}
              </Typography>
              <Typography sx={{ fontSize: 12 }} color={C.textSecondary}>
                {row.original.job_position_id}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        accessorKey: "interview_step_name",
        header: "Round",
        size: 150,
        Cell: ({ row }) => (
          <Box>
            <Typography sx={{ fontSize: 14 }} color={C.textPrimary}>
              {row.original.interview_step_name}
            </Typography>
            {/* <Typography sx={{ fontSize: 14 }} color={C.textSecondary}>
              Step {row.original.interview_step_number}
            </Typography> */}
          </Box>
        ),
      },
      {
        accessorKey: "interview_type",
        header: "Type",
        size: 110,
        Cell: ({ cell }) => {
          const t = cell.getValue()?.toLowerCase();
          const isT = t === "technical";
          return (
            <Box
              component="span"
              sx={{
                fontSize: 11,
                fontWeight: 700,
                px: "8px",
                py: "3px",
                borderRadius: "8px",
                backgroundColor: isT ? C.indigoSoft : C.amberSoft,
                color: isT ? C.indigo : C.amber,
                textTransform: "capitalize",
              }}
            >
              {cell.getValue() ?? "—"}
            </Box>
          );
        },
      },
      {
        accessorKey: "interview_date",
        header: "Date",
        size: 150,
        Cell: ({ cell }) => {
          const v = cell.getValue();
          return (
            <Typography sx={{ fontSize: 12 }} color={C.textPrimary}>
              {v
                ? new Date(v).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                : "—"}
            </Typography>
          );
        },
      },
      {
        id: "time_slot",
        header: "Time",
        size: 200,
        Cell: ({ row }) => (
          <Typography sx={{ fontSize: 12 }} color={C.textPrimary}>
            {row.original.start_time} – {row.original.end_time} ·{" "}
            {row.original.duration} min
          </Typography>
        ),
      },
      {
        accessorKey: "sub_function",
        header: "Sub-function",
        size: 200,
        Cell: ({ cell }) => (
          <Typography
            color={C.textSecondary}
            sx={{ textTransform: "capitalize", fontSize: 12 }}
          >
            {cell.getValue() ?? "—"}
          </Typography>
        ),
      },
      {
        accessorKey: "created_by",
        header: "Created by",
        size: 130,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: 12 }} color={C.textPrimary}>
            {cell.getValue() ?? "—"}
          </Typography>
        ),
      },
      {
        accessorKey: "interview_status",
        header: "Status",
        size: 110,
        Cell: ({ cell }) => {
          const s = cell.getValue() ?? "scheduled";
          const colorMap = {
            scheduled: { bg: C.indigoSoft, color: C.indigo },
            completed: { bg: C.greenSoft, color: C.green },
            cancelled: { bg: "#F3F4F6", color: "#6B7280" },
            rescheduled: { bg: C.amberSoft, color: C.amber },
            no_show: { bg: C.redSoft, color: C.red },
            not_conducted: { bg: "#F3F4F6", color: "#6B7280" },
          };
          const cfg = colorMap[s] ?? colorMap.scheduled;
          return (
            <Box
              component="span"
              sx={{
                fontSize: 11,
                fontWeight: 700,
                px: "8px",
                py: "3px",
                borderRadius: "8px",
                backgroundColor: cfg.bg,
                color: cfg.color,
                textTransform: "capitalize",
              }}
            >
              {s.replace(/_/g, " ")}
            </Box>
          );
        },
      },
    ],
    [],
  );

  if (isLoading) return <Loader />;
  if (isError) return <ErrAlert msg="Failed to load interviews" />;

  return (
    <Box>
      {/* ...your existing toolbar JSX unchanged... */}

      {searchedInterviews.length === 0 ? (
        <StaticPlaceholder
          label="No Interviews"
          description="No interviews match the selected filter."
        />
      ) : view === "grid" ? (
        <Grid container spacing={2}>
          {searchedInterviews.map((iv) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, xl: 3 }} key={iv.interview_id}>
              <InterviewCard
                interview={iv}
                onClick={() => setSelectedInterviewId(iv.interview_id)} // ← NEW
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <ReusableMRT
          data={searchedInterviews}
          columnData={ivColumns}
          enableRowActions={false}
          enableRowSelection={false}
          enableGlobalFilter={true}
          height="calc(100vh - 200px)"
          onRowClick={(row) => setSelectedInterviewId(row.interview_id)} // ← NEW
        />
      )}

      {/* ── Detail Dialog ── */}
      <InterviewDetailDialog
        open={!!selectedInterviewId}
        onClose={() => setSelectedInterviewId(null)}
        interviewId={selectedInterviewId}
      />
    </Box>
  );
}
/* ═══════════════════════════════════════════════
   TAB 4 — Employees
═══════════════════════════════════════════════ */
function OrgEmployeesTab({ orgId }) {
  const { data, isLoading, isError } = useGetEmployeeDetailsQuery(orgId);

  const employees = data?.data ?? [];

  const [search, setSearch] = useState("");

  // ── Search Filter ─────────────────────────────────────
  const filteredEmployees = employees.filter((emp) => {
    const value = search.toLowerCase();

    return (
      emp.full_name?.toLowerCase().includes(value) ||
      emp.email_id?.toLowerCase().includes(value) ||
      emp.phone_number?.toLowerCase().includes(value) ||
      emp.designation?.toLowerCase().includes(value) ||
      emp.department?.toLowerCase().includes(value) ||
      emp.user_role?.toLowerCase().includes(value) ||
      emp.employee_type?.toLowerCase().includes(value) ||
      emp.employee_status?.toLowerCase().includes(value)
    );
  });

  // ── Employee status color helper ─────────────────────
  const empStatusColor = (status = "") => {
    const s = status.toLowerCase();

    if (s === "active")
      return {
        bg: C.greenSoft,
        color: C.green,
      };

    if (s === "inactive")
      return {
        bg: C.redSoft,
        color: C.red,
      };

    return {
      bg: "#F3F4F6",
      color: "#6B7280",
    };
  };

  // ── Role color helper ─────────────────────────────────
  const roleColor = (role = "") => {
    const r = role.toLowerCase();

    if (r.includes("super_admin") || r.includes("admin")) {
      return {
        bg: C.indigoSoft,
        color: C.indigo,
      };
    }

    if (r.includes("hm_user") || r.includes("user")) {
      return {
        bg: C.amberSoft,
        color: C.amber,
      };
    }

    return {
      bg: "#F3F4F6",
      color: "#6B7280",
    };
  };

  // ── MRT Columns ───────────────────────────────────────
  const empColumns = useMemo(
    () => [
      {
        accessorKey: "full_name",
        header: "Employee",
        size: 350,

        Cell: ({ row }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: C.accent,
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {row.original.full_name?.charAt(0).toUpperCase()}
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}
              >
                {row.original.full_name}
              </Typography>

              <Typography sx={{ fontSize: 12 }} color={C.textSecondary} noWrap>
                {row.original.email_id}
              </Typography>
            </Box>
          </Box>
        ),
      },

      {
        accessorKey: "phone_number",
        header: "Phone",
        size: 140,

        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: 12 }} color={C.textPrimary}>
            {cell.getValue() ?? "—"}
          </Typography>
        ),
      },

      {
        accessorKey: "designation",
        header: "Designation",
        size: 150,

        Cell: ({ cell }) => (
          <Typography
            color={C.textPrimary}
            sx={{
              textTransform: "capitalize",
              fontSize: 12,
            }}
          >
            {cell.getValue() ?? "—"}
          </Typography>
        ),
      },

      {
        accessorKey: "department",
        header: "Department",
        size: 140,

        Cell: ({ cell }) => (
          <Typography
            color={C.textSecondary}
            sx={{
              textTransform: "capitalize",
              fontSize: 12,
            }}
          >
            {cell.getValue() ?? "—"}
          </Typography>
        ),
      },

      {
        accessorKey: "user_role",
        header: "Role",
        size: 130,

        Cell: ({ cell }) => {
          const val = cell.getValue() ?? "—";

          const rc = roleColor(val);

          return (
            <Box
              component="span"
              sx={{
                fontSize: 11,
                fontWeight: 700,
                px: "8px",
                py: "3px",
                borderRadius: "8px",
                backgroundColor: rc.bg,
                color: rc.color,
                textTransform: "capitalize",
                whiteSpace: "nowrap",
              }}
            >
              {val.replace(/_/g, " ")}
            </Box>
          );
        },
      },

      {
        accessorKey: "employee_type",
        header: "Type",
        size: 110,

        Cell: ({ cell }) => (
          <Typography
            color={C.textSecondary}
            sx={{
              textTransform: "capitalize",
              fontSize: 12,
            }}
          >
            {cell.getValue() ?? "—"}
          </Typography>
        ),
      },

      {
        accessorKey: "employee_status",
        header: "Status",
        size: 100,

        Cell: ({ cell }) => {
          const val = cell.getValue() ?? "—";

          const sc = empStatusColor(val);

          return (
            <Box
              component="span"
              sx={{
                fontSize: 11,
                fontWeight: 700,
                px: "8px",
                py: "3px",
                borderRadius: "8px",
                backgroundColor: sc.bg,
                color: sc.color,
                textTransform: "capitalize",
              }}
            >
              {val}
            </Box>
          );
        },
      },

      {
        accessorKey: "gender",
        header: "Gender",
        size: 90,

        Cell: ({ cell }) => (
          <Typography
            color={C.textSecondary}
            sx={{
              textTransform: "capitalize",
              fontSize: 12,
            }}
          >
            {cell.getValue() ?? "—"}
          </Typography>
        ),
      },

      {
        accessorKey: "time_zone",
        header: "Timezone",
        size: 140,

        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: 12 }} color={C.textSecondary}>
            {cell.getValue() ?? "—"}
          </Typography>
        ),
      },

      {
        accessorKey: "active_from",
        header: "Active From",
        size: 120,

        Cell: ({ cell }) => {
          const v = cell.getValue();

          return (
            <Typography sx={{ fontSize: 12 }} color={C.textPrimary}>
              {v
                ? new Date(v).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                : "—"}
            </Typography>
          );
        },
      },

      {
        accessorKey: "active_to",
        header: "Active To",
        size: 120,

        Cell: ({ cell }) => {
          const v = cell.getValue();

          return (
            <Typography sx={{ fontSize: 12 }} color={C.textPrimary}>
              {v
                ? new Date(v).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                : "—"}
            </Typography>
          );
        },
      },

      {
        accessorKey: "created_at",
        header: "Created At",
        size: 130,

        Cell: ({ cell }) => {
          const v = cell.getValue();

          return (
            <Typography sx={{ fontSize: 12 }} color={C.textSecondary}>
              {v
                ? new Date(v).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                : "—"}
            </Typography>
          );
        },
      },
    ],
    [],
  );

  if (isLoading) return <Loader />;

  if (isError) return <ErrAlert msg="Failed to load employee details" />;

  if (!employees.length)
    return (
      <StaticPlaceholder
        label="No Employees"
        description="No employees found for this organization."
      />
    );

  return (
    <Box>
      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: "16px",
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            px: 1.8,
            // py: 0.8,
            borderRadius: "8px",
            background: "rgba(255, 95, 31, 0.08)",
            border: "1px solid rgba(255, 95, 31, 0.2)",
            transition: "0.3s ease",
            "&:hover": {
              background: "rgba(255, 95, 31, 0.14)",
              transform: "translateY(-1px)",
            },
          }}
        >
          <Box
            sx={{
              minWidth: 28,
              height: 28,
              borderRadius: "8px",
              background: "#FF5F1F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              px: 1,
              boxShadow: "0 4px 12px rgba(255,95,31,0.35)",
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1,
              }}
            >
              {filteredEmployees.length}
            </Typography>
          </Box>

          <Box sx={{ padding: 1, borderRadius: 0 }}>
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 600,
                color: "#FF5F1F",
                textTransform: "uppercase",
                letterSpacing: 1,
                lineHeight: 1,
              }}
            >
              Total
            </Typography>

            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 600,
                color: C.textPrimary,
                lineHeight: 1,
              }}
            >
              Candidate{filteredEmployees.length !== 1 ? "s" : ""}
            </Typography>
          </Box>
        </Box>

        <SearchFilter
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search employees..."
        />
      </Box>

      {/* MRT */}
      <ReusableMRT
        data={filteredEmployees}
        columnData={empColumns}
        enableRowActions={false}
        enableRowSelection={false}
        enableGlobalFilter={false}
        height="calc(100vh - 260px)"
      />
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   RequisitionCard
═══════════════════════════════════════════════ */
const CARD_THEMES = [
  {
    iconBg: "#EEF2FF",
    iconColor: "#4F46E5",
    chipBg: "#EEF2FF",
    chipColor: "#4338CA",
  },
  {
    iconBg: "#ECFDF5",
    iconColor: "#059669",
    chipBg: "#ECFDF5",
    chipColor: "#047857",
  },
  {
    iconBg: "#FFF7ED",
    iconColor: "#EA580C",
    chipBg: "#FFF7ED",
    chipColor: "#C2410C",
  },
  {
    iconBg: "#FDF2F8",
    iconColor: "#DB2777",
    chipBg: "#FDF2F8",
    chipColor: "#BE185D",
  },
  {
    iconBg: "#EFF6FF",
    iconColor: "#2563EB",
    chipBg: "#EFF6FF",
    chipColor: "#1D4ED8",
  },
];

const getCardTheme = (title = "") => {
  let hash = 0;

  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }

  return CARD_THEMES[Math.abs(hash) % CARD_THEMES.length];
};
function RequisitionCard({ job, onOpen }) {
  const [hovered, setHovered] = React.useState(false);
  const title = job.job_title ?? "Untitled";
  const jobId = job.job_position_id ?? job.job_id ?? "—";
  const empType = job.job_type ?? "Full Time";
  const func = job.function ?? null;
  const subFunc = job.sub_function ?? null;
  const minYrs = job.min_years ?? null;
  const maxYrs = job.max_years ?? null;
  const positions = job.no_of_positions ?? null;
  const skills = job.skills ? job.skills.split(",").map((s) => s.trim()) : [];
  const status = job.status ?? "open";
  const chip = statusChip(status);
  const Created = job.created_at
    ? new Date(job.created_at).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : null;
  const closingDate = job.closing_date
    ? new Date(job.closing_date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : null;
  const theme = getCardTheme(title);

  return (
    <Card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
      sx={{
        borderRadius: "12px",
        border: `1px solid ${hovered ? C.accent : C.border}`,
        boxShadow: hovered ? "0 0 0 3px rgba(255,95,31,0.07)" : "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
        cursor: "pointer",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        sx={{
          p: "16px",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: "12px",
          }}
        >
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: "50px",
              backgroundColor: "#FF5722",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WorkOutlineRoundedIcon
              sx={{
                color: "#fff",
                fontSize: 20,
              }}
            />
          </Box>
          <Box sx={{ flex: 1, px: "10px" }}>
            <Typography
              sx={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}
            >
              {title}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#000" }}>
              {jobId} · {empType}
            </Typography>
          </Box>
          <StatusPill status={status} />
        </Box>

        <Divider sx={{ mb: "10px" }} />

        {(func || subFunc) && (
          <Box sx={{ display: "flex", gap: 0.6, mb: "10px", flexWrap: "wrap" }}>
            {[func, subFunc].filter(Boolean).map((l) => (
              <Chip
                key={l}
                label={l}
                size="small"
                sx={{
                  fontSize: 11,
                  height: 22,
                  fontWeight: 500,
                  textTransform: "capitalize",
                  backgroundColor: theme.chipBg,
                  color: theme.chipColor,
                  border: "none",

                  "& .MuiChip-label": {
                    px: "8px",
                  },
                }}
              />
            ))}
          </Box>
        )}

        {minYrs !== null && maxYrs !== null && (
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: "6px" }}
          >
            <Typography sx={{ fontSize: 11, color: "#000" }}>
              Experience
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#000" }}>
              {minYrs}–{maxYrs} yrs
            </Typography>
          </Box>
        )}
        {positions && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: "6px",
            }}
          >
            <Typography sx={{ fontSize: 11, color: "#000" }}>
              Positions
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#000" }}>
              {positions}
            </Typography>
          </Box>
        )}

        {Created && (
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: "6px" }}
          >
            <Typography sx={{ fontSize: 11, color: "#000" }}>
              Created
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#000" }}>
              {Created}
            </Typography>
          </Box>
        )}
        {closingDate && (
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: "6px" }}
          >
            <Typography sx={{ fontSize: 11, color: "#000" }}>
              Closing date
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#000" }}>
              {closingDate}
            </Typography>
          </Box>
        )}

        {/* {skills.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: "0px" }}>
            {skills.slice(0, 3).map((s) => (
              <Chip
                key={s}
                label={s}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: 11,
                  height: 20,
                  textTransform: "capitalize",
                  borderColor: C.border,
                  color: C.textSecondary,
                  "& .MuiChip-label": { px: "7px" },
                }}
              />
            ))}
            {skills.length > 3 && (
              <Chip
                label={`+${skills.length - 3} more`}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: 10,
                  height: 20,
                  borderColor: C.border,
                  color: C.textSecondary,
                  "& .MuiChip-label": { px: "7px" },
                }}
              />
            )}
          </Box>
        )} */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.4,
            mt: 2,
            p: 0.9,
            borderRadius: "8px",
            border: "1px solid #FF5722",
          }}
        >
          <Typography
            sx={{
              fontSize: 10.5,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#FF5722",
              transition: "color 0.15s",
              textAlign: "center",
            }}
          >
            See full details
          </Typography>
          <ArrowForwardIcon
            sx={{
              fontSize: 11,
              color: "#FF5722",
              transition: "color 0.15s, transform 0.15s",
              transform: hovered ? "translateX(3px)" : "none",
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════
   AssignedCandidateCard
═══════════════════════════════════════════════ */
function AssignedCandidateCard({ candidate, primaryJob, orgJobCount, onView }) {
  const [hovered, setHovered] = React.useState(false);
  const [jobsDialogOpen, setJobsDialogOpen] = React.useState(false);

  const stageColor = (stage = "") => {
    const s = stage.toLowerCase();
    if (s.includes("reject")) return { bg: C.redSoft, color: C.red };
    if (s.includes("shortlist")) return { bg: C.greenSoft, color: C.green };
    if (s.includes("onboard")) return { bg: C.indigoSoft, color: C.indigo };
    if (s.includes("interview")) return { bg: C.amberSoft, color: C.amber };
    if (s.includes("select")) return { bg: C.indigoSoft, color: C.indigo };
    return { bg: "#F3F4F6", color: "#6B7280" };
  };

  const sc = stageColor(primaryJob?.current_stage);
  const orgJobs = candidate.jobs ?? [];
  const [getResumeView] = useLazyGetResumeViewQuery();
  const viewResume = async (candidateId) => {
    try {
      const res = await getResumeView(candidateId).unwrap();

      const url = res?.resume_url;

      if (url) {
        window.open(url, "_blank");
      }
    } catch (error) {
      console.error("Resume fetch failed:", error);
    }
  };

  return (
    <>
      <Card
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          borderRadius: "12px",
          border: `1px solid ${hovered ? C.accent : C.border}`,
          boxShadow: hovered ? "0 0 0 3px rgba(255,95,31,0.07)" : "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardContent
          sx={{
            p: "16px",
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: "12px" }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: C.accent,
                fontWeight: 700,
                fontSize: 15,
                flexShrink: 0,
              }}
            >
              {candidate.candidate_name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.textPrimary,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {candidate.candidate_name}
                </Typography>
                <DescriptionOutlinedIcon
                  onClick={() => {
                    viewResume(candidate?.candidate_id);
                  }}
                  sx={{
                    fontSize: 14,
                    color: "#FF5F1F",
                    ml: 0,
                    cursor: "pointer",
                  }}
                />
              </Box>
              <Typography
                sx={{
                  fontSize: 11,
                  color: C.textSecondary,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {candidate.email}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: "10px" }} />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: "6px",
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: 10, sm: 11 },
                color: "#000",
                mb: "2px",
              }}
            >
              Current Stage
            </Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: sc.color }}>
              {primaryJob?.current_stage ?? "—"}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: "6px",
            }}
          >
            <Typography sx={{ fontSize: 11, color: "#000", mb: "2px" }}>
              Jobs Here
            </Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#000" }}>
              {orgJobCount}
            </Typography>
          </Box>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: "6px" }}
          >
            <Typography sx={{ fontSize: 11, color: "#000" }}>Phone</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: "#000" }}>
              {candidate.phone_number}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              mt: "4px",
              mb: "12px",
            }}
          >
            {[
              {
                label: "Matched",
                value: candidate.matched_count,
                color: C.accent,
              },
              {
                label: "Shortlisted",
                value: candidate.shortlisted_count,
                color: C.green,
              },
              {
                label: "Interviewing",
                value: candidate.interviewing_count,
                color: C.amber,
              },
              {
                label: "Selected",
                value: candidate.selected_count,
                color: C.indigo,
              },
            ].map(
              ({ label, value, color }) =>
                value > 0 && (
                  <Box
                    key={label}
                    sx={{
                      fontSize: 11,
                      fontFamily: "Helvetica",
                      fontWeight: 600,
                      px: "6px",
                      py: "2px",
                      borderRadius: "6px",
                      backgroundColor: "#F3F4F6",
                      color,
                    }}
                  >
                    {label}: {value}
                  </Box>
                ),
            )}
          </Box>
          <Box sx={{ mt: "6px" }}>
            <Button
              variant="outlined"
              fullWidth
              size="small"
              onClick={() => setJobsDialogOpen(true)}
              sx={{
                borderColor: C.accent,
                color: C.accent,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                fontSize: 12,
                "&:hover": {
                  backgroundColor: C.accentSoft,
                  borderColor: C.accent,
                },
              }}
            >
              View Jobs ({orgJobCount})
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Jobs Dialog */}
      <Dialog
        open={jobsDialogOpen}
        onClose={() => setJobsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            overflow: "hidden",
            background: "#FFFFFF",
            boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
          },
        }}
      >
        {/* HEADER */}
        <DialogTitle
          sx={{
            px: 2.5,
            py: 2,
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background:
              "linear-gradient(180deg, rgba(255,95,31,0.04), rgba(255,95,31,0.01))",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                width: 44,
                height: 44,
                bgcolor: "#FF5F1F",
                fontWeight: 700,
                fontSize: 16,
                boxShadow: "0 4px 14px rgba(255,95,31,0.35)",
              }}
            >
              {candidate.candidate_name?.charAt(0).toUpperCase()}
            </Avatar>

            <Box>
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: C.textPrimary,
                  lineHeight: 1.2,
                }}
              >
                {candidate.candidate_name}
              </Typography>

              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#FF5F1F",
                  mt: 0.4,
                  textTransform: "uppercase",
                  letterSpacing: 0.7,
                }}
              >
                {orgJobCount} Job{orgJobCount !== 1 ? "s" : ""} Matched
              </Typography>
            </Box>
          </Box>

          <IconButton
            size="small"
            onClick={() => setJobsDialogOpen(false)}
            sx={{
              color: "#9CA3AF",
              background: "#F9FAFB",
              border: "1px solid #F3F4F6",
              "&:hover": {
                backgroundColor: "#F3F4F6",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        {/* BODY */}
        <DialogContent sx={{ p: 0 }}>
          {orgJobs.map((job, idx) => {
            const jsc = stageColor(job.current_stage);
            const isLast = idx === orgJobs.length - 1;

            return (
              <Box
                key={job.matched_candidate_id}
                sx={{
                  px: 2.5,
                  py: 2,
                  borderBottom: isLast ? "none" : `1px solid ${C.border}`,
                  backgroundColor: idx % 2 === 0 ? "#fff" : "#FCFCFC",
                  transition: "0.2s ease",
                  "&:hover": {
                    backgroundColor: "#FFF8F5",
                  },
                }}
              >
                {/* TOP */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 1.5,
                    mb: 1.5,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: C.textPrimary,
                        lineHeight: 1.4,
                        mb: 1,
                      }}
                    >
                      {job.job_title}
                    </Typography>

                    {/* FUNCTION */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.8,
                        mb: 0.7,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#FF5F1F",
                          textTransform: "uppercase",
                          letterSpacing: 0.8,
                          minWidth: 65,
                        }}
                      >
                        Function
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: C.textPrimary,
                        }}
                      >
                        {job.function} · {job.sub_function}
                      </Typography>
                    </Box>

                    {/* DATE */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.8,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#FF5F1F",
                          textTransform: "uppercase",
                          letterSpacing: 0.8,
                          minWidth: 65,
                        }}
                      >
                        Matched
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 11,
                          fontWeight: 500,
                          color: C.textSecondary,
                        }}
                      >
                        {new Date(job.matched_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </Typography>
                    </Box>
                  </Box>

                  {/* SCORE */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      px: 1.5,
                      py: 1,
                      minWidth: 70,
                      borderRadius: "14px",
                      background: "rgba(255,95,31,0.08)",
                      border: "1px solid rgba(255,95,31,0.15)",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: "#FF5F1F",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        mb: 0.2,
                      }}
                    >
                      Score
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: C.textPrimary,
                        lineHeight: 1,
                      }}
                    >
                      {job.match_score}
                    </Typography>
                  </Box>
                </Box>

                {/* BOTTOM */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  {/* STAGE */}
                  <Box
                    component="span"
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                      px: "10px",
                      py: "5px",
                      borderRadius: "999px",
                      backgroundColor: jsc.bg,
                      color: jsc.color,
                      textTransform: "capitalize",
                      letterSpacing: 0.3,
                    }}
                  >
                    {job.current_stage}
                  </Box>

                  {/* BUTTON */}
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      setJobsDialogOpen(false);
                      onView(job.matched_candidate_id);
                    }}
                    sx={{
                      background: "#FF5F1F",
                      color: "#fff",
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "10px",
                      px: 2,
                      py: 0.7,
                      fontSize: 11,
                      boxShadow: "0 4px 14px rgba(255,95,31,0.3)",
                      "&:hover": {
                        background: "#E65317",
                        boxShadow: "0 6px 18px rgba(255,95,31,0.4)",
                      },
                    }}
                  >
                    View Profile
                  </Button>
                </Box>
              </Box>
            );
          })}
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ═══════════════════════════════════════════════
   InterviewCard
═══════════════════════════════════════════════ */
function InterviewCard({ interview }) {
  const typeColor =
    interview.interview_type?.toLowerCase() === "technical"
      ? { bg: C.indigoSoft, color: C.indigo }
      : { bg: C.amberSoft, color: C.amber };

  const formattedDate = interview.interview_date
    ? new Date(interview.interview_date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "—";

  return (
    <Card
      sx={{
        borderRadius: "12px",
        border: `1px solid ${C.border}`,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        sx={{
          p: "16px",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: "10px",
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "8px",
              backgroundColor: C.accentSoft,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CalendarMonthOutlinedIcon sx={{ color: C.accent, fontSize: 18 }} />
          </Box>
          <Box
            component="span"
            sx={{
              fontSize: 10,
              fontWeight: 700,
              px: "8px",
              py: "3px",
              borderRadius: "10px",
              backgroundColor: typeColor.bg,
              color: typeColor.color,
              textTransform: "capitalize",
              letterSpacing: "0.05em",
            }}
          >
            {interview.interview_type ?? "Interview"}
          </Box>
        </Box>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: C.textPrimary,
            mb: "2px",
            lineHeight: 1.3,
          }}
        >
          {interview.job_title}
        </Typography>
        <Typography sx={{ fontSize: 11, color: C.textSecondary, mb: "10px" }}>
          {interview.job_position_id} · {interview.sub_function}
        </Typography>
        <Divider sx={{ mb: "10px" }} />
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: "6px" }}
        >
          <CalendarMonthOutlinedIcon
            sx={{ fontSize: 13, color: C.textSecondary }}
          />
          <Typography
            sx={{ fontSize: 11, color: C.textPrimary, fontWeight: 500 }}
          >
            {formattedDate}
          </Typography>
        </Box>
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: "6px" }}
        >
          <AccessTimeIcon sx={{ fontSize: 13, color: C.textSecondary }} />
          <Typography
            sx={{ fontSize: 11, color: C.textPrimary, fontWeight: 500 }}
          >
            {interview.start_time} – {interview.end_time} · {interview.duration}{" "}
            min
          </Typography>
        </Box>
        <Box
          sx={{ display: "flex", justifyContent: "space-between", mb: "6px" }}
        >
          <Typography sx={{ fontSize: 11, color: C.textSecondary }}>
            Round
          </Typography>
          <Typography
            sx={{ fontSize: 11, fontWeight: 500, color: C.textPrimary }}
          >
            {interview.interview_step_name} (Step{" "}
            {interview.interview_step_number})
          </Typography>
        </Box>
        {interview.created_by && (
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: "6px" }}
          >
            <Typography sx={{ fontSize: 11, color: C.textSecondary }}>
              Created by
            </Typography>
            <Typography
              sx={{ fontSize: 11, fontWeight: 500, color: C.textPrimary }}
            >
              {interview.created_by}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Shared helpers ──────────────────────────────────────────────────────────*/
function ChartCard({ title, children }) {
  return (
    <Box
      sx={{
        border: `1px solid ${C.border}`,
        borderRadius: "12px",
        p: "16px",
        backgroundColor: "#fff",
        width: "100%",
      }}
    >
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 700,
          color: C.textSecondary,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          mb: "12px",
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function NoData() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 200,
      }}
    >
      <Typography sx={{ fontSize: 12, color: C.textTertiary }}>
        No data available
      </Typography>
    </Box>
  );
}

function SectionLabel({ children }) {
  return (
    <Typography
      sx={{
        fontSize: 11,
        fontWeight: 700,
        color: C.textSecondary,
        letterSpacing: "0.08em",
        mb: "12px",
        textTransform: "uppercase",
      }}
    >
      {children}
    </Typography>
  );
}

function StaticPlaceholder({ label, description }) {
  return (
    <Box
      sx={{
        textAlign: "center",
        py: 10,
        border: `1px solid ${C.border}`,
        borderRadius: "12px",
        backgroundColor: "#fff",
      }}
    >
      <WorkOutlineRoundedIcon
        sx={{ fontSize: 42, color: C.textTertiary, mb: 1.5 }}
      />
      <Typography sx={{ fontSize: 15, fontWeight: 600, color: C.textPrimary }}>
        {label}
      </Typography>
      {description && (
        <Typography sx={{ fontSize: 13, color: C.textSecondary, mt: 0.5 }}>
          {description}
        </Typography>
      )}
    </Box>
  );
}

function Loader() {
  return (
    <Box display="flex" justifyContent="center" py={6}>
      <CircularProgress sx={{ color: C.accent }} />
    </Box>
  );
}

function ErrAlert({ msg }) {
  return (
    <Alert severity="error" sx={{ borderRadius: "10px" }}>
      Failed to load: {msg ?? "Unknown error"}
    </Alert>
  );
}
