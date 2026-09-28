import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";

import {
  Box,
  Typography,
  IconButton,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { useNavigate } from "react-router-dom";

import {
  useGetJobOverviewQuery,
  useGetTotalPositionsQuery,
  useGetCandidateFunnelTrendQuery,
  useGetInterviewTrendQuery,
  useGetOfferTrendQuery,
  useGetStageDetailsQuery,
} from "../../redux/services/organizationOverview/organizationOverview.js";
import { useGetOrganisationJobsQuery } from "../../redux/services/requisition/requisition.js";

// ============================================================
// COLORS
// ============================================================

const COLORS = {
  blue: "#2563EB",
  blueDark: "#174FDF",
  accent: "#FF5F1F",

  border: "#E2E8F0",
  background: "#F8FAFC",

  text: "#111827",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",

  open: "#0FA3B1",
  closed: "#E53935",
  hold: "#F59E0B",

  scheduled: "#FFB300",
  rescheduled: "#5C6BC0",
  completed: "#4CAF50",
  notConducted: "#8B5CF6",
  cancelled: "#E53935",
  noShow: "#9E9E9E",

  selected: "#22A55A",
  shortlisted: "#2962E8",
  interview: "#7B3FE4",
  offers: "#E88A00",
  onboarded: "#218B52",
};

// ============================================================
// FLOATING TOOLTIP (portal, follows cursor)
// ============================================================

const FloatingTooltip = ({ tip }) => {
  if (!tip || typeof document === "undefined") return null;

  const flipX = tip.x > window.innerWidth - 250;
  const flipY = tip.y > window.innerHeight - 280;

  return createPortal(
    <Box
      sx={{
        position: "fixed",
        left: tip.x,
        top: tip.y,
        transform: `translate(${
          flipX ? "calc(-100% - 14px)" : "14px"
        }, ${flipY ? "calc(-100% - 14px)" : "14px"})`,
        zIndex: 2000,
        minWidth: 150,
        maxWidth: 240,
        pointerEvents: "none",
        borderRadius: "12px",
        background: "rgba(15, 23, 42, 0.96)",
        color: "#fff",
        boxShadow: "0 18px 40px rgba(15,23,42,0.28)",
        px: 1.4,
        py: 1.1,
      }}
    >
      <Typography sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>
        {tip.title}
      </Typography>

      {tip.total !== undefined && (
        <Typography sx={{ fontSize: 11, color: "#93C5FD", mt: 0.3 }}>
          Total: {tip.total}
        </Typography>
      )}

      <Box sx={{ display: "grid", gap: 0.6, mt: 0.9 }}>
        {tip.rows.map((row, index) => (
          <Box
            key={`${row.label}-${index}`}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
              {row.color && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: row.color,
                    flexShrink: 0,
                  }}
                />
              )}
              <Typography sx={{ fontSize: 12, color: "#E5E7EB" }}>
                {row.label}
              </Typography>
            </Box>

            <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
              {row.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>,
    document.body
  );
};

const useChartTooltip = () => {
  const [tip, setTip] = useState(null);

  const show = (event, title, rows = [], total) =>
    setTip({ x: event.clientX, y: event.clientY, title, rows, total });

  const hide = () => setTip(null);

  // spread onto any element: {...tooltip.bind("Title", rows, total)}
  const bind = (title, rows = [], total) => ({
    onMouseEnter: (event) => show(event, title, rows, total),
    onMouseMove: (event) => {
      // keep a parent's tooltip (e.g. the card summary) from overriding this one
      event.stopPropagation();
      show(event, title, rows, total);
    },
    onMouseLeave: hide,
  });

  return { bind, show, hide, node: <FloatingTooltip tip={tip} /> };
};

// ============================================================
// STATIC DATA
// Only sections that do not have an API in the current page
// remain static.
// ============================================================

const DATA = {
  candidates: {
    total: 133,
    applications: 478,
    shortlisted: 102,
    interview: 39,
    onboarded: 17,
  },

  subFunctions: [
    { label: "Clinical Data Manager", value: 541, color: "#E91E8C" },
    { label: "Statistical Programmer", value: 92, color: "#7B61FF" },
    { label: "Biostatistician", value: 47, color: "#00BFA5" },
    { label: "Clinical Programmer/CRF Dev", value: 14, color: "#D32F2F" },
    { label: "Medical Coder", value: 5, color: "#FFA000" },
    { label: "Generic", value: 0, color: "#9E9E9E" },
  ],

  experience: [
    { label: "0–2 yrs", value: 4, pct: 3, color: "#174FDF" },
    { label: "3–5 yrs", value: 69, pct: 52, color: "#0571ED" },
    { label: "6–10 yrs", value: 54, pct: 41, color: "#0097A7" },
    { label: "10+ yrs", value: 6, pct: 5, color: "#00BBD4" },
  ],

  offers: [
    { label: "Released", value: 10, color: "#E88A00" },
    { label: "Accepted", value: 4, color: "#26A69A" },
    { label: "Rejected", value: 0, color: "#E53935" },
    { label: "Revoked", value: 3, color: "#C54B0A" },
  ],
};

// ============================================================
// SUB FUNCTION OPTIONS
// ============================================================

const SUB_FUNCTION_OPTIONS = [
  { label: "All Sub-functions", value: "all" },
  { label: "Biostatistician", value: "biostatistician" },
  { label: "Clinical Data Manager", value: "clinical_data_manager" },
  {
    label: "Clinical Programmer / CRF Developer",
    value: "clinical_programmer_crf_developer",
  },
  { label: "General", value: "general" },
  { label: "medical coder", value: "medical_coder" },
  { label: "Statistical Programmer", value: "statistical_programmer" },
];

// ============================================================
// TOGGLE
// ============================================================

const Toggle = ({ value, onChange, options, small = false }) => {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        background: "#F1F5F9",
        borderRadius: "9px",
        padding: "2px",
        flexShrink: 0,
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      {options.map((item) => {
        const active = value === item.value;

        return (
          <Box
            key={item.value}
            component="button"
            type="button"
            onClick={() => onChange(item.value)}
            sx={{
              border: 0,
              outline: 0,
              appearance: "none",
              px: small ? 1.5 : 2.6,
              py: small ? 0.55 : 0.75,
              borderRadius: "7px",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: small ? 11.5 : 13,
              fontWeight: 600,
              color: active ? "#fff" : COLORS.textSecondary,
              background: active ? COLORS.blue : "transparent",
              whiteSpace: "nowrap",
              transition: "all .15s ease",

              "&:hover": {
                background: active ? COLORS.blue : "#E8EEF8",
              },
            }}
          >
            {item.label}
          </Box>
        );
      })}
    </Box>
  );
};

// ============================================================
// FILTER
// ============================================================

const Filter = ({ children }) => {
  return (
    <Box
      sx={{
        height: 38,
        px: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        border: `1px solid ${COLORS.border}`,
        borderRadius: "10px",
        background: "#fff",
        color: COLORS.textSecondary,
        fontSize: 13,
        whiteSpace: "nowrap",
        flexShrink: 0,
        cursor: "pointer",
      }}
    >
      <span>{children}</span>

      <span style={{ fontSize: 10, color: COLORS.textSecondary }}>▼</span>
    </Box>
  );
};

// ============================================================
// SUB FUNCTION DROPDOWN
// ============================================================

const SubFunctionDropdown = ({ value, onChange }) => {
  return (
    <Select
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
      }}
      displayEmpty
      size="small"
      sx={{
        minWidth: { xs: 220, sm: 250, md: 285 },

        height: 42,
        background: "#fff",
        borderRadius: "10px",
        fontSize: 16,
        color: "#29313D",
        flexShrink: 0,

        "& .MuiSelect-select": {
          display: "flex",
          alignItems: "center",
          py: 1,
          px: 1.7,
          pr: 5,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        },

        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: COLORS.border,
          borderWidth: 1,
        },

        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: COLORS.blue,
        },

        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: COLORS.blue,
          borderWidth: 2,
        },

        "& .MuiSelect-icon": {
          color: "#777",
        },
      }}
      MenuProps={{
        PaperProps: {
          sx: {
            mt: 0.5,
            borderRadius: "0 0 8px 8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
            maxHeight: 360,

            "& .MuiMenuItem-root": {
              minHeight: 58,
              fontSize: 16,
              color: "#29313D",
              px: 3,

              "&.Mui-selected": {
                backgroundColor: "#EEF2FA",
              },

              "&.Mui-selected:hover": {
                backgroundColor: "#E8EDF7",
              },

              "&:hover": {
                backgroundColor: "#F5F7FA",
              },
            },
          },
        },
      }}
    >
      {SUB_FUNCTION_OPTIONS.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  );
};

// ============================================================
// SPARKLINE
// Multi-line (Open / Closed / Hold) with per-month hover.
// ============================================================

const Sparkline = ({ series = [], labels = [], tooltip: sharedTooltip }) => {
  const width = 120;
  const height = 46;

  const ownTooltip = useChartTooltip();
  const tooltip = sharedTooltip ?? ownTooltip;
  const [active, setActive] = useState(null);

  const lines = series.filter(
    (s) => Array.isArray(s.values) && s.values.length > 0
  );

  const count = Math.max(...lines.map((s) => s.values.length), 1);
  const max = Math.max(...lines.flatMap((s) => s.values), 1);
  const slot = width / count;

  const xAt = (i) => (count === 1 ? width / 2 : (i * width) / (count - 1));
  const yAt = (v) => height - (v / max) * (height - 10) - 5;

  const buildPath = (values) =>
    values
      .map((v, i) => [xAt(i), yAt(v)])
      .reduce((acc, point, index, arr) => {
        if (index === 0) return `M ${point[0]} ${point[1]}`;
        const prev = arr[index - 1];
        const midX = (prev[0] + point[0]) / 2;
        return `${acc} C ${midX} ${prev[1]}, ${midX} ${point[1]}, ${point[0]} ${point[1]}`;
      }, "");

  return (
    <>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: "block", maxWidth: "100%", overflow: "visible" }}
        onMouseLeave={() => setActive(null)}
      >
        {active !== null && (
          <line
            x1={xAt(active)}
            x2={xAt(active)}
            y1={0}
            y2={height}
            stroke={COLORS.border}
            strokeWidth="1"
          />
        )}

        {lines.map((s) => (
          <path
            key={s.name}
            d={buildPath(s.values)}
            fill="none"
            stroke={s.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {active !== null &&
          lines.map((s) => (
            <circle
              key={s.name}
              cx={xAt(active)}
              cy={yAt(s.values[active] ?? 0)}
              r="3.5"
              fill={s.color}
              stroke="#fff"
              strokeWidth="1.5"
            />
          ))}

        {/* invisible hover columns, one per period */}
        {Array.from({ length: count }, (_, i) => {
          const b = tooltip.bind(
            labels[i] ?? `P${i + 1}`,
            lines.map((s) => ({
              label: s.name,
              value: s.values[i] ?? 0,
              color: s.color,
            }))
          );

          return (
            <rect
              key={i}
              x={xAt(i) - slot / 2}
              y={0}
              width={slot}
              height={height}
              fill="transparent"
              style={{ cursor: "pointer" }}
              onMouseEnter={(e) => {
                setActive(i);
                b.onMouseEnter(e);
              }}
              onMouseMove={b.onMouseMove}
              onMouseLeave={() => {
                setActive(null);
                b.onMouseLeave();
              }}
            />
          );
        })}
      </svg>

      {!sharedTooltip && tooltip.node}
    </>
  );
};

// ============================================================
// GRAPH LEGEND
// ============================================================

const GraphLegend = () => {
  const items = [
    { label: "Open", color: COLORS.open },
    { label: "Closed", color: COLORS.closed },
    { label: "Hold", color: COLORS.hold },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: { xs: 0.35, sm: 0.65 },
        overflow: "hidden",
      }}
    >
      {items.map((item) => (
        <Box
          key={item.label}
          sx={{
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: 0.35,
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              minWidth: 8,
              borderRadius: "50%",
              background: item.color,
            }}
          />

          <Typography
            sx={{
              fontSize: 9.5,
              color: COLORS.textSecondary,
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// ============================================================
// STATUS ITEM
// ============================================================

const StatusItem = ({
  label,
  value,
  color,
  max,
  loading = false,
  onClick,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
}) => {
  const safeMax = max || 1;

  const barHeight =
    value === 0 ? 4 : Math.max(5, Math.min(38, (value / safeMax) * 38));

  return (
    <Box
      component={onClick ? "button" : "div"}
      type={onClick ? "button" : undefined}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      sx={{
        minWidth: 0,
        width: "100%",
        height: 66,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        overflow: "hidden",
        border: 0,
        background: "transparent",
        padding: 0,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <Typography
        sx={{
          width: "100%",
          fontSize: 10.5,
          fontWeight: 700,
          color: COLORS.text,
          lineHeight: 1,
          height: 13,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          whiteSpace: "nowrap",
        }}
      >
        {loading ? "..." : value}
      </Typography>

      <Box
        sx={{
          width: 16,
          minWidth: 16,
          height: loading ? 4 : barHeight,
          background: color,
          borderRadius: "2px 2px 0 0",
          mt: 0.4,
          flexShrink: 0,
        }}
      />

      <Typography
        sx={{
          width: "100%",
          fontSize: 9,
          color: COLORS.textSecondary,
          lineHeight: 1,
          mt: 0.6,
          textAlign: "center",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "clip",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

// ============================================================
// KPI CARD
// ============================================================

const KpiCard = ({ title, data, hoverModel, onOpenAll, onOpenStatus }) => {
  const tooltip = useChartTooltip();

  const seriesDefs = [
    { key: "open", name: "Open", color: COLORS.open, status: "open" },
    { key: "closed", name: "Closed", color: COLORS.closed, status: "closed" },
    { key: "hold", name: "Hold", color: COLORS.hold, status: "on_hold" },
  ];

  const seriesPanels = hoverModel?.seriesPanels ?? {};

  const sparkSeries = seriesDefs.map((d) => ({
    name: d.name,
    color: d.color,
    values: (seriesPanels[d.key]?.rows ?? []).map((r) => r.value),
  }));

  const hasSeries = sparkSeries.some((s) => s.values.length > 0);

  const sparkLabels = seriesPanels.open?.rows?.map((r) => r.label) ?? [];

  const statusTip = (def) => {
    const rows = (seriesPanels[def.key]?.rows ?? []).map((r) => ({
      ...r,
      color: def.color,
    }));

    return tooltip.bind(
      `${title} · ${def.name}`,
      rows.length > 0
        ? rows
        : [{ label: "Total", value: data[def.key], color: def.color }],
      data[def.key]
    );
  };

  // card-level summary (shown when hovering the card outside the graph / bars)
  const summaryTip = tooltip.bind(
    title,
    seriesDefs.map((d) => ({
      label: d.name,
      value: data[d.key],
      color: d.color,
    })),
    data.total
  );

  return (
    <Box
      onClick={onOpenAll}
      {...summaryTip}
      sx={{
        height: 108,
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        background: "#fff",
        border: `1px solid ${COLORS.border}`,
        borderLeft: `5px solid ${COLORS.blue}`,
        borderRadius: "10px",
        boxSizing: "border-box",
        boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
        cursor: onOpenAll ? "pointer" : "default",
        position: "relative",
        transition: "border-color 0.15s, box-shadow 0.15s, transform 0.15s",

        "&:hover": {
          borderColor: COLORS.blue,
          boxShadow: "0 10px 25px rgba(37,99,235,0.08)",
          transform: onOpenAll ? "translateY(-1px)" : "none",
        },

        display: "grid",
        gridTemplateColumns:
          "minmax(0, 1.05fr) minmax(0, 1fr) minmax(0, .95fr)",
        columnGap: { xs: 1, sm: 1.5, md: 2 },
        alignItems: "center",
        px: { xs: 1, sm: 1.5 },
        overflow: "hidden",

        "& > *": { minWidth: 0, maxWidth: "100%" },
      }}
    >
      {/* TITLE + TOTAL */}
      <Box
        sx={{
          minWidth: 0,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 600,
            color: COLORS.textSecondary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: 1.1,
            width: "100%",
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            fontSize: 40,
            fontWeight: 800,
            color: COLORS.text,
            lineHeight: 0.95,
            mt: 0.8,
            whiteSpace: "nowrap",
          }}
        >
          {data.loading ? "..." : data.total}
        </Typography>
      </Box>

      {/* GRAPH */}
      <Box
        sx={{
          minWidth: 0,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: 47,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 120,
              minWidth: 0,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Sparkline
              series={
                hasSeries
                  ? sparkSeries
                  : [
                      {
                        name: "Total",
                        color: COLORS.blue,
                        values: data.graph,
                      },
                    ]
              }
              labels={sparkLabels}
              tooltip={tooltip}
            />
          </Box>
        </Box>

        <GraphLegend />
      </Box>

      {/* STATUS BARS */}
      <Box
        sx={{
          minWidth: 0,
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          columnGap: { xs: 0.15, sm: 0.4 },
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {seriesDefs.map((def) => (
          <StatusItem
            key={def.key}
            label={def.name}
            value={data[def.key]}
            color={def.color}
            max={data.closed}
            loading={data.loading}
            {...statusTip(def)}
            onClick={(event) => {
              event.stopPropagation();
              onOpenStatus?.(def.status);
            }}
          />
        ))}
      </Box>

      {tooltip.node}
    </Box>
  );
};

// ============================================================
// MINI STAT
// ============================================================

const MiniStat = ({ label, value }) => {
  return (
    <Box sx={{ minWidth: 0, width: "100%", overflow: "hidden" }}>
      <Typography
        sx={{
          width: "100%",
          fontSize: 10.5,
          color: COLORS.textMuted,
          lineHeight: 1.15,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: 18,
          fontWeight: 700,
          color: COLORS.blue,
          lineHeight: 1.1,
          mt: 0.45,
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};

// ============================================================
// CANDIDATE CARD
// ============================================================

const CandidateCard = () => {
  const tooltip = useChartTooltip();

  const candidateRows = [
    {
      label: "Applications",
      value: DATA.candidates.applications,
      color: COLORS.blue,
    },
    {
      label: "Shortlisted",
      value: DATA.candidates.shortlisted,
      color: COLORS.shortlisted,
    },
    {
      label: "Interview",
      value: DATA.candidates.interview,
      color: COLORS.interview,
    },
    {
      label: "Onboarded",
      value: DATA.candidates.onboarded,
      color: COLORS.onboarded,
    },
  ];

  return (
    <Box
      {...tooltip.bind("Candidates", candidateRows, DATA.candidates.total)}
      sx={{
        height: 108,
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        background: "#fff",
        border: `1px solid ${COLORS.border}`,
        borderLeft: `5px solid ${COLORS.blue}`,
        borderRadius: "10px",
        boxSizing: "border-box",
        boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
        position: "relative",

        display: "grid",
        gridTemplateColumns: "minmax(0, .9fr) minmax(0, 1.1fr)",
        columnGap: 2,
        alignItems: "center",
        px: { xs: 1, sm: 1.5 },
        overflow: "hidden",

        "& > *": { minWidth: 0, maxWidth: "100%" },
      }}
    >
      <Box
        sx={{
          minWidth: 0,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 600,
            color: COLORS.textSecondary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: 1.1,
          }}
        >
          Candidates Counts
        </Typography>

        <Typography
          sx={{
            fontSize: 40,
            fontWeight: 800,
            color: COLORS.text,
            lineHeight: 0.95,
            mt: 0.8,
            whiteSpace: "nowrap",
          }}
        >
          {DATA.candidates.total}
        </Typography>
      </Box>

      <Box
        sx={{
          minWidth: 0,
          width: "100%",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gridTemplateRows: "1fr 1fr",
          rowGap: 1,
          columnGap: 1.2,
          alignItems: "center",
          overflow: "hidden",
          cursor: "default",
        }}
      >
        <MiniStat label="Applications" value={DATA.candidates.applications} />
        <MiniStat label="Shortlisted" value={DATA.candidates.shortlisted} />
        <MiniStat label="Interview" value={DATA.candidates.interview} />
        <MiniStat label="Onboarded" value={DATA.candidates.onboarded} />
      </Box>

      {tooltip.node}
    </Box>
  );
};

// ============================================================
// CARD HEADER
// ============================================================

const CardHeader = ({ title, toggle, onToggle }) => {
  return (
    <Box
      onClick={(event) => event.stopPropagation()}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        mb: 2,
        minWidth: 0,
      }}
    >
      <Typography
        sx={{
          fontSize: 15.5,
          fontWeight: 700,
          color: COLORS.text,
          minWidth: 0,
        }}
      >
        {title}
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.7,
          flexShrink: 0,
        }}
      >
        {toggle && (
          <Toggle
            small
            value={toggle.value}
            options={toggle.options}
            onChange={onToggle}
          />
        )}

        <IconButton
          size="small"
          sx={{ width: 26, height: 26, flexShrink: 0 }}
        >
          <Typography sx={{ fontSize: 15, color: COLORS.textMuted }}>
            ⤢
          </Typography>
        </IconButton>
      </Box>
    </Box>
  );
};

// ============================================================
// CHART CARD
// ============================================================

const ChartCard = ({ children, onClick, sx = {} }) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        background: "#fff",
        border: `1px solid ${COLORS.border}`,
        borderRadius: "14px",
        boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
        padding: 2.4,
        minWidth: 0,
        overflow: "hidden",
        position: "relative",
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.15s, box-shadow 0.15s, transform 0.15s",

        "&:hover": {
          borderColor: onClick ? COLORS.blue : COLORS.border,
          boxShadow: onClick
            ? "0 10px 25px rgba(37,99,235,0.08)"
            : "0 1px 3px rgba(15,23,42,0.04)",
          transform: onClick ? "translateY(-1px)" : "none",
        },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

// ============================================================
// NICE TICKS
// ============================================================

const niceTicks = (max) => {
  const step = max / 4;

  return [0, step, step * 2, step * 3, max].map((value) => Math.round(value));
};

// ============================================================
// AXIS
// ============================================================

const AxisRow = ({ max, labelWidth = 110, valueWidth = 30 }) => {
  const ticks = niceTicks(max);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        ml: `${labelWidth + 12}px`,
        mr: `${valueWidth + 12}px`,
        mt: 1.2,
      }}
    >
      {ticks.map((tick, index) => (
        <Typography
          key={index}
          sx={{ fontSize: 10, color: COLORS.textMuted }}
        >
          {tick}
        </Typography>
      ))}
    </Box>
  );
};

// ============================================================
// SUB FUNCTION BARS
// ============================================================

const SubFunctionBars = ({ data }) => {
  const tooltip = useChartTooltip();

  const filtered = data.filter((item) => item.value > 0);

  const maxValue = Math.max(...filtered.map((item) => item.value), 1);

  const totalValue = filtered.reduce((t, i) => t + i.value, 0);

  const ticks = niceTicks(maxValue);

  const labelWidth = 92;

  return (
    <Box>
      <Box sx={{ position: "relative" }}>
        <Box
          sx={{
            position: "absolute",
            left: `${labelWidth + 12}px`,
            right: 0,
            top: 0,
            bottom: 0,
            pointerEvents: "none",
          }}
        >
          {ticks.map((tick, index) => (
            <Box
              key={index}
              sx={{
                position: "absolute",
                left: `${(tick / maxValue) * 100}%`,
                top: 0,
                bottom: 0,
                width: "1px",
                background: COLORS.border,
              }}
            />
          ))}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.4,
            position: "relative",
          }}
        >
          {filtered.map((item) => {
            const pct = (item.value / maxValue) * 100;

            return (
              <Box
                key={item.label}
                {...tooltip.bind(
                  item.label,
                  [
                    {
                      label: "Candidates",
                      value: item.value,
                      color: item.color,
                    },
                    {
                      label: "Share",
                      value: `${Math.round((item.value / totalValue) * 100)}%`,
                    },
                  ],
                  totalValue
                )}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                  minWidth: 0,
                }}
              >
                <Typography
                  sx={{
                    width: labelWidth,
                    flexShrink: 0,
                    textAlign: "right",
                    fontSize: 12,
                    color: COLORS.textSecondary,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.label}
                </Typography>

                <Box
                  sx={{
                    position: "relative",
                    flex: 1,
                    minWidth: 0,
                    height: 10,
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      height: "100%",
                      width: `${pct}%`,
                      minWidth: 6,
                      borderRadius: "5px",
                      background: item.color,
                    }}
                  />

                  <Typography
                    sx={{
                      position: "absolute",
                      left: `calc(${pct}% + 10px)`,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 13,
                      fontWeight: 800,
                      color: COLORS.text,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      <AxisRow max={maxValue} labelWidth={labelWidth} valueWidth={0} />

      {tooltip.node}
    </Box>
  );
};

// ============================================================
// HORIZONTAL BARS (Experience + Offer cards)
// ============================================================

const HorizontalBars = ({ data, maxValue }) => {
  const tooltip = useChartTooltip();

  const max =
    maxValue || Math.max(...data.map((item) => item.value), 1);

  const totalValue = data.reduce((t, i) => t + (Number(i.value) || 0), 0);

  const labelWidth = 110;
  const valueWidth = 30;

  return (
    <Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.2 }}>
        {data.map((item) => (
          <Box
            key={item.label}
            {...tooltip.bind(
              item.label,
              [
                { label: "Count", value: item.value, color: item.color },
                {
                  label: "Share",
                  value: totalValue
                    ? `${Math.round((item.value / totalValue) * 100)}%`
                    : "0%",
                },
              ],
              totalValue
            )}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                width: labelWidth,
                flexShrink: 0,
                textAlign: "right",
                fontSize: 12,
                color: COLORS.textSecondary,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </Typography>

            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                height: 18,
                background: "#F1F5F9",
                borderRadius: "5px",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: `${(item.value / max) * 100}%`,
                  height: "100%",
                  background: item.color,
                  borderRadius: "5px",
                  minWidth: item.value > 0 ? 4 : 0,
                }}
              />
            </Box>

            <Typography
              sx={{
                width: valueWidth,
                flexShrink: 0,
                fontSize: 12.5,
                fontWeight: 700,
                color: COLORS.text,
              }}
            >
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>

      <AxisRow max={max} labelWidth={labelWidth} valueWidth={valueWidth} />

      {tooltip.node}
    </Box>
  );
};

// ============================================================
// INTERVIEW LINE CHART
// ============================================================

const InterviewLineChart = ({ data, labels = [], loading = false }) => {
  const tooltip = useChartTooltip();

  const width = 120;
  const height = 34;

  const allValues = data.flatMap((item) =>
    Array.isArray(item.line) && item.line.length > 0 ? item.line : [0]
  );

  const maxValue = Math.max(...allValues, 1);

  const createPoints = (values) => {
    const safeValues =
      Array.isArray(values) && values.length >= 2 ? values : [0, 0];

    return safeValues.map((value, index) => {
      const x = (index / (safeValues.length - 1)) * width;

      const y = height - (Number(value) / maxValue) * (height - 6) - 3;

      return { x, y };
    });
  };

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
      {data.map((item, rowIndex) => {
        const hasTrend = Array.isArray(item.line) && item.line.length > 1;

        const points = hasTrend ? createPoints(item.line) : [];

        const linePath = hasTrend
          ? points.reduce((result, point, index) => {
              if (index === 0) {
                return `M ${point.x} ${point.y}`;
              }

              const previous = points[index - 1];

              const middleX = (previous.x + point.x) / 2;

              return `${result} C ${middleX} ${previous.y}, ${middleX} ${point.y}, ${point.x} ${point.y}`;
            }, "")
          : "";

        const areaPath =
          hasTrend && points.length > 0
            ? `${linePath} L ${points[points.length - 1].x} ${height} L ${
                points[0].x
              } ${height} Z`
            : "";

        const barPct =
          maxValue > 0
            ? Math.max(0, Math.min(100, (Number(item.value) / maxValue) * 100))
            : 0;

        return (
          <Box
            key={item.label}
            {...tooltip.bind(
              item.label,
              hasTrend
                ? item.line.map((v, i) => ({
                    label: labels[i] ?? `P${i + 1}`,
                    value: v,
                    color: item.color,
                  }))
                : [{ label: "Count", value: item.value, color: item.color }],
              item.value
            )}
            sx={{
              display: "grid",
              gridTemplateColumns: "108px 28px minmax(80px, 1fr)",
              alignItems: "center",
              gap: 0.9,
              py: 0.7,
              borderBottom:
                rowIndex < data.length - 1
                  ? `1px solid ${COLORS.border}`
                  : "none",
            }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${COLORS.border}`,
                borderRadius: "999px",
                px: 1.4,
                py: 0.4,
                width: "fit-content",
                background: "#fff",
              }}
            >
              <Typography
                sx={{
                  fontSize: 12,
                  color: COLORS.textSecondary,
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </Typography>
            </Box>

            <Typography
              sx={{
                fontSize: 14.5,
                fontWeight: 800,
                color: COLORS.text,
                textAlign: "center",
              }}
            >
              {loading ? "..." : item.value}
            </Typography>

            <Box
              sx={{
                height,
                minWidth: 0,
                display: "flex",
                alignItems: "center",
              }}
            >
              {hasTrend ? (
                <svg
                  viewBox={`0 0 ${width} ${height}`}
                  width="100%"
                  height={height}
                  preserveAspectRatio="none"
                  style={{ display: "block", overflow: "visible" }}
                >
                  {areaPath && (
                    <path
                      d={areaPath}
                      fill={item.color}
                      opacity={0.14}
                      stroke="none"
                    />
                  )}

                  <path
                    d={linePath}
                    fill="none"
                    stroke={item.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {points.map((point, index) => (
                    <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="3.5"
                      fill={item.color}
                    />
                  ))}
                </svg>
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: 8,
                    borderRadius: "5px",
                    background: "#F1F5F9",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: `${barPct}%`,
                      height: "100%",
                      background: item.color,
                      borderRadius: "5px",
                      minWidth: item.value > 0 ? 4 : 0,
                      transition: "width .25s ease",
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        );
      })}

      {tooltip.node}
    </Box>
  );
};

// ============================================================
// INTERVIEW BAR CHART
// ============================================================

const InterviewBarChart = ({ data, labels = [], loading = false }) => {
  const tooltip = useChartTooltip();

  const periodCount = Math.max(
    ...data.map((item) => (Array.isArray(item.line) ? item.line.length : 0)),
    1
  );

  const periods = Array.from({ length: periodCount }, (_, index) => {
    let bestItem = data[0];
    let bestValue = -Infinity;

    data.forEach((item) => {
      const value =
        Array.isArray(item.line) && item.line[index] !== undefined
          ? Number(item.line[index]) || 0
          : 0;

      if (value > bestValue) {
        bestValue = value;
        bestItem = item;
      }
    });

    return {
      label: labels[index] || `P${index + 1}`,
      value: Math.max(bestValue, 0),
      color: bestItem?.color || COLORS.blue,
    };
  });

  const maxValue = Math.max(...periods.map((period) => period.value), 1);

  const chartHeight = 130;

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          height: chartHeight,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 3,
          borderBottom: `1px solid ${COLORS.border}`,
          pb: 0.5,
        }}
      >
        {periods.map((period, index) => (
          <Box
            key={index}
            {...tooltip.bind(
              period.label,
              data.map((item) => ({
                label: item.label,
                value: Array.isArray(item.line) ? item.line[index] ?? 0 : 0,
                color: item.color,
              }))
            )}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: 40,
            }}
          >
            <Box
              sx={{
                width: 26,
                height: loading
                  ? 4
                  : Math.max(4, (period.value / maxValue) * (chartHeight - 10)),
                background: period.color,
                borderRadius: "6px 6px 0 0",
                transition: "height .25s ease",
              }}
            />
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 3,
          mt: 0.8,
        }}
      >
        {periods.map((period, index) => (
          <Typography
            key={index}
            sx={{
              width: 40,
              textAlign: "center",
              fontSize: 11.5,
              color: COLORS.textSecondary,
            }}
          >
            {period.label}
          </Typography>
        ))}
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: 2,
          rowGap: 0.6,
          mt: 1.6,
        }}
      >
        {data.map((item) => (
          <Typography
            key={item.label}
            sx={{
              fontSize: 11.5,
              fontWeight: 600,
              color: item.color,
              whiteSpace: "nowrap",
            }}
          >
            {item.label}
          </Typography>
        ))}
      </Box>

      {tooltip.node}
    </Box>
  );
};

// ============================================================
// INTERVIEW STATUS CHART
// ============================================================

const InterviewStatusChart = ({
  data,
  chartType,
  labels = [],
  loading = false,
}) => {
  if (chartType === "bar") {
    return <InterviewBarChart data={data} labels={labels} loading={loading} />;
  }

  return <InterviewLineChart data={data} labels={labels} loading={loading} />;
};

// ============================================================
// DONUT
// ============================================================

const Donut = ({ data, total }) => {
  const tooltip = useChartTooltip();

  let current = 0;

  const segments = data.map((item) => {
    const start = current;

    current += item.pct;

    return `${item.color} ${start * 3.6}deg ${current * 3.6}deg`;
  });

  const handleRing = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);

    // inside the hole -> no tooltip
    if (Math.hypot(dx, dy) < 35) {
      tooltip.hide();
      return;
    }

    let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (deg < 0) deg += 360;

    let acc = 0;
    const hit =
      data.find((item) => {
        acc += item.pct * 3.6;
        return deg <= acc;
      }) ?? data[data.length - 1];

    tooltip.show(
      event,
      hit.label,
      [
        { label: "Candidates", value: hit.value, color: hit.color },
        { label: "Share", value: `${hit.pct}%` },
      ],
      total
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        minWidth: 0,
      }}
    >
      <Box
        onMouseMove={handleRing}
        onMouseLeave={tooltip.hide}
        sx={{
          width: 105,
          height: 105,
          borderRadius: "50%",
          flexShrink: 0,
          background: `conic-gradient(${segments.join(",")})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <Box
          sx={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            background: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography sx={{ fontSize: 19, fontWeight: 800, lineHeight: 1 }}>
            {total}
          </Typography>

          <Typography sx={{ fontSize: 9, color: COLORS.textMuted, mt: 0.3 }}>
            total
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.9,
          minWidth: 0,
        }}
      >
        {data.map((item) => (
          <Box
            key={item.label}
            {...tooltip.bind(
              item.label,
              [
                { label: "Candidates", value: item.value, color: item.color },
                { label: "Share", value: `${item.pct}%` },
              ],
              total
            )}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                minWidth: 8,
                borderRadius: "50%",
                background: item.color,
              }}
            />

            <Typography
              sx={{
                fontSize: 11,
                color: COLORS.textSecondary,
                width: 70,
                flexShrink: 0,
              }}
            >
              {item.label}
            </Typography>

            <Typography sx={{ fontSize: 11.5, fontWeight: 700 }}>
              {item.value}
            </Typography>

            <Typography sx={{ fontSize: 10, color: COLORS.textMuted }}>
              ({item.pct}%)
            </Typography>
          </Box>
        ))}
      </Box>

      {tooltip.node}
    </Box>
  );
};

// ============================================================
// CURRENT PIPELINE
// ============================================================

const CurrentPipelineChart = ({ data, loading = false, onStageClick }) => {
  const tooltip = useChartTooltip();

  const max = Math.max(...data.map((item) => Number(item.value) || 0), 1);

  const first = Number(data[0]?.value) || 0;

  const ticks = niceTicks(max);
  const chartHeight = 300;

  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: 10.5,
          fontWeight: 700,
          color: COLORS.textMuted,
          letterSpacing: 0.5,
          mb: 2,
        }}
      >
        MAIN FLOW
      </Typography>

      <Box sx={{ display: "flex", height: chartHeight, minWidth: 0 }}>
        <Box
          sx={{
            width: 34,
            flexShrink: 0,
            height: chartHeight,
            display: "flex",
            flexDirection: "column-reverse",
            justifyContent: "space-between",
            pr: 1,
          }}
        >
          {ticks.map((tick, index) => (
            <Typography
              key={index}
              sx={{
                fontSize: 9,
                color: COLORS.textMuted,
                textAlign: "right",
                lineHeight: 1,
              }}
            >
              {tick}
            </Typography>
          ))}
        </Box>

        <Box
          sx={{
            position: "relative",
            flex: 1,
            minWidth: 0,
            height: chartHeight,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column-reverse",
              justifyContent: "space-between",
            }}
          >
            {ticks.map((tick, index) => (
              <Box
                key={index}
                sx={{
                  borderTop: `1px solid ${COLORS.border}`,
                  width: "100%",
                  height: 0,
                }}
              />
            ))}
          </Box>

          <Box
            sx={{
              position: "relative",
              height: "100%",
              display: "flex",
              alignItems: "flex-end",
              gap: 1.2,
              px: 0.5,
              minWidth: 0,
            }}
          >
            {data.map((item) => (
              <Box
                key={item.label}
                onClick={(event) => {
                  event.stopPropagation();
                  onStageClick?.(item);
                }}
                style={{ cursor: "pointer" }}
                {...tooltip.bind(item.label, [
                  { label: "Candidates", value: item.value, color: item.color },
                  {
                    label: "Of applications",
                    value:
                      first > 0
                        ? `${Math.round(
                            ((Number(item.value) || 0) / first) * 100
                          )}%`
                        : "—",
                  },
                ])}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    width: "100%",
                    minWidth: 0,
                    display: "flex",
                    alignItems: "flex-end",
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: `${((Number(item.value) || 0) / max) * 100}%`,
                      minHeight: item.value > 0 ? 4 : 0,
                      background: item.color,
                      borderRadius: "4px 4px 0 0",
                    }}
                  >
                    <Typography
                      sx={{
                        position: "absolute",
                        top: -19,
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: 11,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {loading ? "..." : item.value}
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  sx={{
                    fontSize: 9,
                    color: COLORS.textMuted,
                    mt: 1,
                    textAlign: "center",
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {tooltip.node}
    </Box>
  );
};

// ============================================================
// CUMULATIVE PIPELINE
// ============================================================

const CumulativePipelineChart = ({ data, loading = false, onStageClick }) => {
  const tooltip = useChartTooltip();

  const safeData = data.filter((item) => Number(item.value) >= 0);

  const maxValue = Math.max(
    ...safeData.map((item) => Number(item.value) || 0),
    1
  );

  const first = Number(safeData[0]?.value) || 0;

  const chartHeight = 320;
  const chartWidth = 430;
  const centerX = 155;
  const topY = 18;
  const stageHeight = 39;
  const stageGap = 2;

  const getWidth = (value) => {
    const ratio = Math.max(
      0.16,
      Math.min(1, (Number(value) || 0) / maxValue)
    );

    return 285 * ratio;
  };

  const pointsForStage = (topWidth, bottomWidth, y) => {
    const topLeft = centerX - topWidth / 2;
    const topRight = centerX + topWidth / 2;
    const bottomLeft = centerX - bottomWidth / 2;
    const bottomRight = centerX + bottomWidth / 2;

    return [
      `${topLeft},${y}`,
      `${topRight},${y}`,
      `${bottomRight},${y + stageHeight}`,
      `${bottomLeft},${y + stageHeight}`,
    ].join(" ");
  };

  return (
    <Box sx={{ minWidth: 0, width: "100%", overflow: "hidden" }}>
      <Typography
        sx={{
          fontSize: 10.5,
          fontWeight: 700,
          color: COLORS.textMuted,
          letterSpacing: 0.5,
          mb: 1.5,
        }}
      >
        MAIN FLOW
      </Typography>

      <Box
        sx={{
          width: "100%",
          height: chartHeight,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.textMuted,
              fontSize: 13,
            }}
          >
            Loading pipeline...
          </Box>
        ) : (
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
            style={{ display: "block", overflow: "visible" }}
          >
            {safeData.map((item, index) => {
              const value = Number(item.value) || 0;

              const nextValue =
                index < safeData.length - 1
                  ? Number(safeData[index + 1].value) || 0
                  : Math.max(value * 0.72, 1);

              const topWidth = getWidth(value);

              const bottomWidth = getWidth(nextValue);

              const y = topY + index * (stageHeight + stageGap);

              const maxStageWidth = Math.max(topWidth, bottomWidth);

              const labelX = centerX + maxStageWidth / 2 + 16;

              const valueX = centerX - maxStageWidth / 2 - 14;

              return (
                <g
                  key={item.label}
                  style={{ cursor: "pointer" }}
                  onClick={(event) => {
                    event.stopPropagation();
                    onStageClick?.(item);
                  }}
                  {...tooltip.bind(item.label, [
                    { label: "Candidates", value, color: item.color },
                    {
                      label: "Of applications",
                      value:
                        first > 0
                          ? `${Math.round((value / first) * 100)}%`
                          : "—",
                    },
                  ])}
                >
                  <polygon
                    points={pointsForStage(topWidth, bottomWidth, y)}
                    fill={item.color}
                  />

                  <text
                    x={valueX}
                    y={y + stageHeight / 2 + 4}
                    textAnchor="end"
                    fill="#64748B"
                    fontSize="12"
                    fontWeight="500"
                  >
                    {value}
                  </text>

                  <text
                    x={labelX}
                    y={y + stageHeight / 2 + 4}
                    textAnchor="start"
                    fill="#111827"
                    fontSize="12"
                    fontWeight="700"
                  >
                    {item.label === "New Applications"
                      ? "Applications"
                      : item.label}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </Box>

      <Box
        sx={{
          mt: 1.5,
          px: 1.5,
          py: 1,
          border: "1px solid #FECACA",
          background: "#FFF5F5",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "#fff",
              border: "1px solid #FECACA",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.closed,
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            ↪
          </Box>

          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 700,
              color: COLORS.closed,
              whiteSpace: "nowrap",
            }}
          >
            Rejected Stage
          </Typography>
        </Box>

        <Typography
          sx={{ fontSize: 18, fontWeight: 800, color: COLORS.closed }}
        >
          {loading
            ? "..."
            : safeData.find((item) => item.label === "Rejected")?.value ?? 0}
        </Typography>
      </Box>

      {tooltip.node}
    </Box>
  );
};

// ============================================================
// PIPELINE CHART
// ============================================================

const PipelineChart = ({
  data,
  loading = false,
  type = "current",
  onStageClick,
}) => {
  if (type === "cumulative") {
    return (
      <CumulativePipelineChart
        data={data}
        loading={loading}
        onStageClick={onStageClick}
      />
    );
  }

  return (
    <CurrentPipelineChart
      data={data}
      loading={loading}
      onStageClick={onStageClick}
    />
  );
};

// ============================================================
// HELPERS
// ============================================================

const latestValue = (values) => {
  if (!Array.isArray(values) || values.length === 0) {
    return 0;
  }

  return Number(values[values.length - 1]) || 0;
};

const toNumber = (value) => Number(value) || 0;

const normalizeSeriesRows = (source, labels = []) => {
  if (!source) {
    return [];
  }

  if (Array.isArray(source)) {
    return source.map((item, index) => {
      if (item && typeof item === "object") {
        return {
          label:
            item.label ?? item.name ?? labels[index] ?? `P${index + 1}`,
          value: toNumber(item.value ?? item.count),
        };
      }

      return {
        label: labels[index] ?? `P${index + 1}`,
        value: toNumber(item),
      };
    });
  }

  if (typeof source === "object") {
    return Object.entries(source).map(([label, value]) => ({
      label,
      value: toNumber(value),
    }));
  }

  return [];
};

const getSeriesValueAtLabel = (rows, label) =>
  rows.find((row) => row.label === label)?.value ?? 0;

const getSeriesLabels = (seriesRows = []) => {
  const firstWithRows = seriesRows.find((item) => item.rows.length > 0);

  return firstWithRows?.rows.map((row) => row.label) ?? [];
};

const buildOverviewHoverModel = ({
  totalLabel,
  totalValue,
  seriesMap,
  labels = [],
}) => {
  const seriesRows = Object.entries(seriesMap).map(([label, config]) => ({
    label,
    color: config.color,
    rows: normalizeSeriesRows(config.source, labels),
    value: config.value,
  }));

  const normalizedLabels =
    labels.length > 0 ? labels : getSeriesLabels(seriesRows);
  const latestLabel =
    normalizedLabels[normalizedLabels.length - 1] ?? totalLabel;

  return {
    defaultPanel: {
      title: latestLabel,
      totalLabel: "Total",
      totalValue,
      rows: seriesRows.map((item) => ({
        label: item.label,
        value:
          getSeriesValueAtLabel(item.rows, latestLabel) || item.value || 0,
        color: item.color,
      })),
    },
    seriesPanels: Object.fromEntries(
      seriesRows.map((item) => [
        item.label.toLowerCase(),
        {
          title: item.label,
          totalLabel: "Total",
          totalValue: item.value || 0,
          rows: item.rows,
        },
      ])
    ),
  };
};

const normalizeJobStatus = (status = "") =>
  String(status).trim().toLowerCase().replace(/\s+/g, "_");

const matchesJobStatus = (jobStatus = "", selectedStatus = "all") => {
  if (selectedStatus === "all") {
    return true;
  }

  const normalized = normalizeJobStatus(jobStatus);

  if (selectedStatus === "open") {
    return normalized.includes("open") || normalized.includes("active");
  }

  if (selectedStatus === "closed") {
    return (
      normalized.includes("closed") ||
      normalized.includes("filled") ||
      normalized.includes("inactive")
    );
  }

  if (selectedStatus === "on_hold") {
    return normalized.includes("hold");
  }

  return normalized === selectedStatus;
};

const formatJobStatusLabel = (status = "all") => {
  if (status === "all") {
    return "All Jobs";
  }

  return `${status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")} Jobs`;
};

// ============================================================
// STAGE DETAILS DIALOG
// Opens when a stage is clicked on the Candidate Pipeline.
// Calls GET /acc/analytics/jobs/stage-details
// ============================================================

const PIPELINE_STAGE_MAP = {
  "New Applications": "matched",
  Shortlisted: "shortlisted",
  Interview: "interviewing",
  Selected: "selected",
  Offers: "offers",
  Onboarded: "onboarded",
  Rejected: "rejected",
};

const STAGE_TITLES = {
  matched: "Matched",
  shortlisted: "Shortlisted",
  interviewing: "Interviewing",
  selected: "Selected",
  offers: "Offers",
  onboarded: "Onboarded",
  rejected: "Rejected",
};

const JOB_STEPS = [
  { key: "matched", label: "Application" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "interviewing", label: "Interview" },
  { key: "selected", label: "Selected" },
  { key: "offers", label: "Offers" },
  { key: "onboarded", label: "Onboarded" },
];

const AVATAR_COLORS = [
  "#174FDF",
  "#0FA3B1",
  "#6D3FC4",
  "#E88A00",
  "#218B52",
  "#C54B0A",
];

const STEP_DONE = "#6B84B0";

const titleCase = (text = "") =>
  String(text)
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const stageTime = (candidate, stageKey) =>
  Math.max(
    0,
    ...(candidate.jobs ?? []).map((job) => {
      const time = new Date(job?.[stageKey]?.staged_at ?? 0).getTime();

      return Number.isNaN(time) ? 0 : time;
    })
  );

const JobStepper = ({ job }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", mt: 2 }}>
      {JOB_STEPS.map((step, index) => {
        const done = Boolean(job?.[step.key]);
        const nextDone = Boolean(job?.[JOB_STEPS[index + 1]?.key]);

        return (
          <React.Fragment key={step.key}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: 64,
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: done ? STEP_DONE : "#fff",
                  border: done ? "none" : "2px solid #DCE3EF",
                }}
              >
                {done && (
                  <CheckRoundedIcon sx={{ fontSize: 16, color: "#fff" }} />
                )}
              </Box>

              <Typography
                sx={{
                  mt: 0.7,
                  fontSize: 12,
                  fontWeight: done ? 700 : 500,
                  color: done ? STEP_DONE : COLORS.textMuted,
                  whiteSpace: "nowrap",
                }}
              >
                {step.label}
              </Typography>
            </Box>

            {index < JOB_STEPS.length - 1 && (
              <Box
                sx={{
                  flex: 1,
                  height: 3,
                  mt: "13px",
                  borderRadius: "2px",
                  background: done && nextDone ? STEP_DONE : "#E7ECF4",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
};

const StageJobCard = ({ job, onView }) => {
  const stageLabel =
    JOB_STEPS.find((step) => step.key === job.current_stage)?.label ??
    titleCase(job.current_stage);

  return (
    <Box
      sx={{
        px: 2,
        py: 1.75,
        borderRadius: "12px",
        background: "#F8FAFF",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              background: "#FCE4EC",
              color: "#D81B60",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <WorkOutlineRoundedIcon sx={{ fontSize: 20 }} />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 800,
                color: COLORS.text,
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {job.job_title}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 0.8,
                mt: 0.4,
                fontSize: 13,
                color: COLORS.textMuted,
              }}
            >
              <span>{String(job.job_position_id ?? "").toUpperCase()}</span>

              {job.job_country && (
                <>
                  <span>·</span>
                  <Box
                    component="span"
                    sx={{ display: "inline-flex", alignItems: "center", gap: 0.4 }}
                  >
                    <PublicRoundedIcon sx={{ fontSize: 14 }} />
                    {job.job_country}
                  </Box>
                </>
              )}

              {job.sub_function && (
                <>
                  <span>·</span>
                  <span>{titleCase(job.sub_function)}</span>
                </>
              )}
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexShrink: 0,
          }}
        >
          <Box
            component="span"
            sx={{
              px: 1.6,
              py: 0.6,
              borderRadius: "999px",
              background: "#E3EAF5",
              color: "#5B7299",
              fontSize: 13,
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {stageLabel}
          </Box>

          <Button
            variant="outlined"
            onClick={() => onView(job)}
            sx={{
              borderColor: COLORS.border,
              color: COLORS.blue,
              textTransform: "none",
              fontWeight: 800,
              borderRadius: "999px",
              px: 3,
              background: "#fff",
              "&:hover": {
                borderColor: COLORS.blue,
                background: "#EFF6FF",
              },
            }}
          >
            View
          </Button>
        </Box>
      </Box>

      <JobStepper job={job} />
    </Box>
  );
};

const StageCandidateRow = ({ candidate, expanded, onToggle, onView }) => {
  const name = candidate.candidate_name ?? "";
  const initial = (name.charAt(0) || "?").toUpperCase();
  const avatarColor =
    AVATAR_COLORS[initial.charCodeAt(0) % AVATAR_COLORS.length];

  const jobCount = candidate.job_count ?? candidate.jobs?.length ?? 0;

  return (
    <Box
      sx={{
        border: `1px solid ${COLORS.border}`,
        borderRadius: "14px",
        background: expanded ? "#F8FAFF" : "#fff",
        mb: 1.5,
        overflow: "hidden",
      }}
    >
      <Box
        onClick={onToggle}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          px: 2.25,
          py: 1.75,
          cursor: "pointer",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: "50%",
              background: avatarColor,
              color: "#fff",
              fontSize: 18,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {initial}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                flexWrap: "wrap",
                gap: 1.2,
              }}
            >
              <Typography
                sx={{ fontSize: 18, fontWeight: 800, color: COLORS.text }}
              >
                {candidate.clin_id}
              </Typography>

              <Typography
                sx={{ fontSize: 15, fontWeight: 800, color: COLORS.blue }}
              >
                {name}
              </Typography>
            </Box>

            <Typography
              sx={{
                fontSize: 14,
                color: COLORS.textSecondary,
                mt: 0.3,
              }}
            >
              {[candidate.designation, candidate.total_experience]
                .filter(Boolean)
                .join(" · ")}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexShrink: 0,
          }}
        >
          <Box
            component="span"
            sx={{
              px: 1.6,
              py: 0.6,
              borderRadius: "999px",
              background: "#E8EEFC",
              color: COLORS.blue,
              fontSize: 13,
              fontWeight: 800,
              whiteSpace: "nowrap",
            }}
          >
            {jobCount} job{jobCount === 1 ? "" : "s"}
          </Box>

          {expanded ? (
            <KeyboardArrowUpRoundedIcon sx={{ color: COLORS.textSecondary }} />
          ) : (
            <KeyboardArrowDownRoundedIcon
              sx={{ color: COLORS.textSecondary }}
            />
          )}
        </Box>
      </Box>

      {expanded && (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2.5,
              px: 2.25,
              py: 1.1,
              borderTop: `1px solid ${COLORS.border}`,
              borderBottom: `1px solid ${COLORS.border}`,
              fontSize: 13.5,
            }}
          >
            {candidate.email && (
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.7,
                  color: COLORS.blue,
                }}
              >
                <MailOutlineRoundedIcon sx={{ fontSize: 16 }} />
                {candidate.email}
              </Box>
            )}

            {candidate.phone_number && (
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.7,
                  color: "#0E9F6E",
                }}
              >
                <PhoneRoundedIcon sx={{ fontSize: 16 }} />
                {candidate.phone_number}
              </Box>
            )}

            {candidate.pii_masked && (
              <VisibilityOffOutlinedIcon
                sx={{ fontSize: 16, color: COLORS.textMuted }}
              />
            )}
          </Box>

          <Box sx={{ px: 1.5, py: 1.5, display: "grid", gap: 1 }}>
            {(candidate.jobs ?? []).map((job) => (
              <StageJobCard
                key={job.matched_candidate_id ?? job.job_details_id}
                job={job}
                onView={onView}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

const StageDetailsDialog = ({
  stage,
  orgId,
  countsType,
  subFunctionValue,
  onClose,
  navigate,
}) => {
  const pageSize = 10;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [expanded, setExpanded] = useState({});

  const { data: response, isFetching, isError } = useGetStageDetailsQuery(
    {
      organisationId: orgId,
      stage: stage.key,
      status: "all",
      countsType,
      country: "all_locations",
      filterBySubfunction:
        subFunctionValue === "all" ? undefined : subFunctionValue,
      page,
      pageSize,
    },
    { skip: !orgId }
  );

  const details = response?.data;

  const totalPages = Math.max(
    1,
    Math.ceil((details?.total_count ?? 0) / (details?.page_size ?? pageSize))
  );

  // Search + sort run on the current page only.
  const candidates = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    const list = (details?.candidates ?? []).filter((candidate) => {
      if (!searchValue) {
        return true;
      }

      return (
        candidate.clin_id?.toLowerCase().includes(searchValue) ||
        candidate.candidate_name?.toLowerCase().includes(searchValue) ||
        candidate.designation?.toLowerCase().includes(searchValue)
      );
    });

    return [...list].sort((a, b) =>
      sort === "latest"
        ? stageTime(b, stage.key) - stageTime(a, stage.key)
        : stageTime(a, stage.key) - stageTime(b, stage.key)
    );
  }, [details, search, sort, stage.key]);

  const subFunctionLabel =
    SUB_FUNCTION_OPTIONS.find((option) => option.value === subFunctionValue)
      ?.label ?? "All Sub-functions";

  const headline =
    details?.matched_candidates_count ?? details?.total_count ?? stage.value;

  const handleView = (job) => {
    navigate(
      `/account-manager/org/${orgId}/requisitions/${job.job_details_id}`,
      { state: { previousTab: 1 } }
    );
  };

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          borderRadius: "20px",
          height: "min(92vh, 860px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(15,23,42,0.24)",
        },
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
          flexShrink: 0,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, color: COLORS.textSecondary }}>
            Jobs: All Jobs | Country: All Countries | Sub-function:{" "}
            {subFunctionLabel} | Period: All Time
          </Typography>

          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 800,
              color: COLORS.blue,
              mt: 0.4,
            }}
          >
            {STAGE_TITLES[stage.key] ?? titleCase(stage.key)} : {headline}
          </Typography>

          <Typography
            sx={{ fontSize: 14, color: COLORS.textSecondary, mt: 0.4 }}
          >
            Candidates {details?.unique_candidates_count ?? 0} | Jobs{" "}
            {details?.job_details_count ?? 0}
          </Typography>
        </Box>

        <IconButton
          onClick={onClose}
          sx={{
            width: 44,
            height: 44,
            border: `1px solid ${COLORS.border}`,
            background: "#fff",
            flexShrink: 0,
          }}
        >
          <CloseIcon sx={{ fontSize: 22, color: COLORS.textSecondary }} />
        </IconButton>
      </Box>

      {/* SEARCH + SORT */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: `1px solid ${COLORS.border}`,
          flexShrink: 0,
        }}
      >
        <TextField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by CLIN ID or name..."
          fullWidth
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              height: 52,
              borderRadius: "12px",
              background: "#F5F7FB",
              fontSize: 16,
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchRoundedIcon sx={{ color: COLORS.textMuted }} />
              </InputAdornment>
            ),
          }}
        />

        <Select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          size="small"
          sx={{
            minWidth: 195,
            height: 52,
            borderRadius: "12px",
            background: "#F5F7FB",
            fontSize: 16,
          }}
        >
          <MenuItem value="latest">Latest first</MenuItem>
          <MenuItem value="oldest">Oldest first</MenuItem>
        </Select>
      </Box>

      {/* LIST */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          px: 3,
          py: 2,
          opacity: isFetching && details ? 0.55 : 1,
          transition: "opacity .15s ease",
        }}
      >
        {isFetching && !details ? (
          <Box sx={{ py: 10, textAlign: "center", color: COLORS.textSecondary }}>
            Loading candidates...
          </Box>
        ) : isError ? (
          <Box sx={{ py: 10, textAlign: "center", color: COLORS.closed }}>
            Could not load candidates. Please try again.
          </Box>
        ) : candidates.length === 0 ? (
          <Box sx={{ py: 10, textAlign: "center" }}>
            <Typography
              sx={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}
            >
              No candidates found
            </Typography>
            <Typography
              sx={{ fontSize: 13, color: COLORS.textSecondary, mt: 0.5 }}
            >
              Try a different search term.
            </Typography>
          </Box>
        ) : (
          candidates.map((candidate, index) => (
            <StageCandidateRow
              key={candidate.candidate_id}
              candidate={candidate}
              expanded={expanded[candidate.candidate_id] ?? index === 0}
              onToggle={() =>
                setExpanded((prev) => ({
                  ...prev,
                  [candidate.candidate_id]:
                    !(prev[candidate.candidate_id] ?? index === 0),
                }))
              }
              onView={handleView}
            />
          ))
        )}
      </Box>

      {/* FOOTER */}
      <Box
        sx={{
          px: 3,
          py: 1.75,
          borderTop: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <ChevronLeftRoundedIcon />
          </IconButton>

          <Typography sx={{ fontSize: 15, color: COLORS.textSecondary }}>
            Page {page} of {totalPages}
          </Typography>

          <IconButton
            disabled={page >= totalPages || isFetching}
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <ChevronRightRoundedIcon />
          </IconButton>
        </Box>

        <Button
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 24,
            textTransform: "none",
            fontWeight: 800,
            fontSize: 16,
            color: COLORS.blue,
          }}
        >
          Close
        </Button>
      </Box>
    </Dialog>
  );
};

// ============================================================
// MAIN PAGE
// ============================================================

const OrganizationOverview = ({ orgId }) => {
  // ==========================================================
  // STATES
  // ==========================================================

  const navigate = useNavigate();

  const [userType, setUserType] = useState("current");

  const [selectedSubFunction, setSelectedSubFunction] = useState("all");

  // Interview chart: line / bar
  const [interviewChartType, setInterviewChartType] = useState("line");

  // Interview API: current / cumulative
  const [interviewType, setInterviewType] = useState("current");

  const [pipelineType, setPipelineType] = useState("current");

  const [experienceType, setExperienceType] = useState("donut");

  const [offerType, setOfferType] = useState("current");

  const [jobsDialogOpen, setJobsDialogOpen] = useState(false);

  const [jobsDialogStatus, setJobsDialogStatus] = useState("all");

  const [jobsSearch, setJobsSearch] = useState("");

  // Candidate pipeline stage dialog: { key, label, value } | null
  const [stageDialog, setStageDialog] = useState(null);

  const openStageDialog = (item) => {
    const key = PIPELINE_STAGE_MAP[item.label];

    if (!key) {
      return;
    }

    setStageDialog({ key, label: item.label, value: item.value });
  };

  const subFunctionParam =
    selectedSubFunction === "all" ? undefined : selectedSubFunction;

  const { data: organisationJobsResponse, isLoading: isOrganisationJobsLoading } =
    useGetOrganisationJobsQuery(
      {
        orgId,
        status: "all",
      },
      {
        skip: !orgId,
      }
    );

  const organisationJobs = organisationJobsResponse?.data ?? [];

  const openJobsDialog = (status = "all") => {
    setJobsDialogStatus(status);
    setJobsSearch("");
    setJobsDialogOpen(true);
  };

  const filteredJobs = useMemo(() => {
    const searchValue = jobsSearch.trim().toLowerCase();

    return organisationJobs.filter((job) => {
      const matchesStatus = matchesJobStatus(job.status, jobsDialogStatus);

      if (!matchesStatus) {
        return false;
      }

      if (!searchValue) {
        return true;
      }

      return (
        job.job_title?.toLowerCase().includes(searchValue) ||
        job.job_position_id?.toLowerCase().includes(searchValue) ||
        job.function?.toLowerCase().includes(searchValue) ||
        job.sub_function?.toLowerCase().includes(searchValue) ||
        job.job_type?.toLowerCase().includes(searchValue) ||
        job.status?.toLowerCase().includes(searchValue)
      );
    });
  }, [organisationJobs, jobsDialogStatus, jobsSearch]);

  const selectedJobsCount = filteredJobs.length;

  // ==========================================================
  // TOTAL JOBS API
  // ==========================================================

  const { data: jobOverviewResponse, isLoading: isJobOverviewLoading } =
    useGetJobOverviewQuery(
      {
        organisationId: orgId,
        groupBy: "month",
        periodCount: 6,
        status: "all",
        filterBySubfunction: subFunctionParam,
        country: "all",
        allTime: true,
      },
      { skip: !orgId }
    );

  // ==========================================================
  // TOTAL POSITIONS API
  // ==========================================================

  const { data: totalPositionsResponse, isLoading: isTotalPositionsLoading } =
    useGetTotalPositionsQuery(
      {
        organisationId: orgId,
        groupBy: "month",
        periodCount: 6,
        status: "all",
        countsType: "cumulative",
        filterBySubfunction: subFunctionParam,
        country: "all",
        allTime: true,
      },
      { skip: !orgId }
    );

  // ==========================================================
  // CANDIDATE PIPELINE API
  // ==========================================================

  const { data: candidateFunnelResponse, isLoading: isCandidateFunnelLoading } =
    useGetCandidateFunnelTrendQuery(
      {
        organisationId: orgId,
        groupBy: "month",
        periodCount: 6,
        status: "all",
        countsType: pipelineType,
        filterBySubfunction: subFunctionParam,
        country: "all",
        allTime: true,
      },
      { skip: !orgId }
    );

  // ==========================================================
  // INTERVIEW TREND API
  // ==========================================================

  const {
    data: interviewTrendResponse,
    isLoading: isInterviewTrendLoading,
    isFetching: isInterviewTrendFetching,
  } = useGetInterviewTrendQuery(
    {
      organisationId: orgId,
      groupBy: "month",
      periodCount: 6,
      status: "all",
      countsType: interviewType,
      filterBySubfunction: subFunctionParam,
      country: "all",
      allTime: true,
    },
    { skip: !orgId }
  );

  // ==========================================================
  // OFFER TREND API
  // ==========================================================

  const {
    data: offerTrendResponse,
    isLoading: isOfferTrendLoading,
    isFetching: isOfferTrendFetching,
  } = useGetOfferTrendQuery(
    {
      organisationId: orgId,
      groupBy: "month",
      periodCount: 6,
      status: "all",
      countsType: offerType,
      filterBySubfunction: subFunctionParam,
      country: "all",
      allTime: true,
    },
    { skip: !orgId }
  );

  // ==========================================================
  // JOB RESPONSE
  // ==========================================================

  const jobOverview = jobOverviewResponse?.data;

  const totalJobs = jobOverview?.total_jobs?.value ?? 0;

  const openJobs = jobOverview?.total_jobs?.open_jobs?.value ?? 0;

  const closedJobs = jobOverview?.total_jobs?.closed_jobs?.value ?? 0;

  const holdJobs = jobOverview?.total_jobs?.on_hold_jobs?.value ?? 0;

  const jobBreakdown = jobOverview?.total_jobs?.breakdown ?? {};

  const jobGraph = Object.values(jobBreakdown).map(
    (value) => Number(value) || 0
  );

  const jobsData = {
    total: totalJobs,
    open: openJobs,
    closed: closedJobs,
    hold: holdJobs,
    graph: jobGraph.length > 0 ? jobGraph : [0],
    loading: isJobOverviewLoading,
  };

  const jobOverviewLabels =
    jobOverview?.labels ??
    jobOverview?.total_jobs?.labels ??
    Object.keys(
      jobOverview?.total_jobs?.open_jobs?.breakdown ??
        jobOverview?.total_jobs?.breakdown ??
        {}
    );

  const jobHoverModel = buildOverviewHoverModel({
    totalLabel: "Jobs",
    totalValue: totalJobs,
    labels: jobOverviewLabels,
    seriesMap: {
      Open: {
        value: openJobs,
        source:
          jobOverview?.total_jobs?.open_jobs?.breakdown ??
          jobOverview?.total_jobs?.open_jobs?.series ??
          jobOverview?.total_jobs?.open_jobs?.values ??
          jobBreakdown,
        color: COLORS.open,
      },
      Closed: {
        value: closedJobs,
        source:
          jobOverview?.total_jobs?.closed_jobs?.breakdown ??
          jobOverview?.total_jobs?.closed_jobs?.series ??
          jobOverview?.total_jobs?.closed_jobs?.values ??
          jobBreakdown,
        color: COLORS.closed,
      },
      Hold: {
        value: holdJobs,
        source:
          jobOverview?.total_jobs?.on_hold_jobs?.breakdown ??
          jobOverview?.total_jobs?.on_hold_jobs?.series ??
          jobOverview?.total_jobs?.on_hold_jobs?.values ??
          jobBreakdown,
        color: COLORS.hold,
      },
    },
  });

  // ==========================================================
  // TOTAL POSITIONS RESPONSE
  // ==========================================================

  const totalPositionsData = totalPositionsResponse?.data;

  const totalPositions = totalPositionsData?.value ?? 0;

  const openPositions = totalPositionsData?.open_positions?.value ?? 0;

  const closedPositions = totalPositionsData?.closed_positions?.value ?? 0;

  const holdPositions = totalPositionsData?.on_hold_positions?.value ?? 0;

  const positionBreakdown = totalPositionsData?.breakdown ?? {};

  const positionGraph = Object.values(positionBreakdown).map(
    (value) => Number(value) || 0
  );

  const positionsData = {
    total: totalPositions,
    open: openPositions,
    closed: closedPositions,
    hold: holdPositions,
    graph: positionGraph.length > 0 ? positionGraph : [0],
    loading: isTotalPositionsLoading,
  };

  const positionsOverviewLabels =
    totalPositionsData?.labels ??
    totalPositionsData?.open_positions?.labels ??
    Object.keys(
      totalPositionsData?.open_positions?.breakdown ??
        totalPositionsData?.breakdown ??
        {}
    );

  const positionsHoverModel = buildOverviewHoverModel({
    totalLabel: "Positions",
    totalValue: totalPositions,
    labels: positionsOverviewLabels,
    seriesMap: {
      Open: {
        value: openPositions,
        source:
          totalPositionsData?.open_positions?.breakdown ??
          totalPositionsData?.open_positions?.series ??
          totalPositionsData?.open_positions?.values ??
          positionBreakdown,
        color: COLORS.open,
      },
      Closed: {
        value: closedPositions,
        source:
          totalPositionsData?.closed_positions?.breakdown ??
          totalPositionsData?.closed_positions?.series ??
          totalPositionsData?.closed_positions?.values ??
          positionBreakdown,
        color: COLORS.closed,
      },
      Hold: {
        value: holdPositions,
        source:
          totalPositionsData?.on_hold_positions?.breakdown ??
          totalPositionsData?.on_hold_positions?.series ??
          totalPositionsData?.on_hold_positions?.values ??
          positionBreakdown,
        color: COLORS.hold,
      },
    },
  });

  // ==========================================================
  // CANDIDATE PIPELINE
  // ==========================================================

  const candidateFunnel = candidateFunnelResponse?.data;

  const pipelineData = [
    {
      label: "New Applications",
      value: latestValue(candidateFunnel?.matched),
      color: "#7890B5",
    },
    {
      label: "Shortlisted",
      value: latestValue(candidateFunnel?.shortlisted),
      color: "#2962E8",
    },
    {
      label: "Interview",
      value: latestValue(candidateFunnel?.interviewing),
      color: "#7B3FE4",
    },
    {
      label: "Selected",
      value: latestValue(candidateFunnel?.selected),
      color: "#22A55A",
    },
    {
      label: "Offers",
      value: latestValue(candidateFunnel?.offers),
      color: "#E88A00",
    },
    {
      label: "Onboarded",
      value: latestValue(candidateFunnel?.onboarded),
      color: "#218B52",
    },
    {
      label: "Rejected",
      value: latestValue(candidateFunnel?.rejected),
      color: "#E53935",
    },
  ];

  // ==========================================================
  // INTERVIEW API RESPONSE
  // ==========================================================

  const interviewApiData = interviewTrendResponse?.data || {};

  const interviewLabels =
    Array.isArray(interviewApiData.labels) &&
    interviewApiData.labels.length > 0
      ? interviewApiData.labels
      : ["all"];

  // "Not Conducted" is intentionally excluded — the target UI
  // only shows these 5 statuses. `interviewType` is sent to the
  // API, so the returned arrays already represent current /
  // cumulative.
  const interviewData = useMemo(() => {
    const createInterviewItem = ({ label, apiValues, color }) => {
      const values = Array.isArray(apiValues)
        ? apiValues.map((value) => Number(value) || 0)
        : [];

      return {
        label,
        value: latestValue(values),
        color,
        line: values.length > 0 ? values : [0],
      };
    };

    return [
      createInterviewItem({
        label: "Scheduled",
        apiValues: interviewApiData.interview_scheduled,
        color: COLORS.scheduled,
      }),
      createInterviewItem({
        label: "Rescheduled",
        apiValues: interviewApiData.interview_rescheduled,
        color: COLORS.rescheduled,
      }),
      createInterviewItem({
        label: "Completed",
        apiValues: interviewApiData.interview_completed,
        color: COLORS.completed,
      }),
      createInterviewItem({
        label: "Cancelled",
        apiValues: interviewApiData.interview_cancelled,
        color: COLORS.cancelled,
      }),
      createInterviewItem({
        label: "No Show",
        apiValues: interviewApiData.interview_no_show,
        color: COLORS.noShow,
      }),
    ];
  }, [
    interviewApiData.interview_scheduled,
    interviewApiData.interview_rescheduled,
    interviewApiData.interview_completed,
    interviewApiData.interview_cancelled,
    interviewApiData.interview_no_show,
  ]);

  const interviewLoading =
    isInterviewTrendLoading || isInterviewTrendFetching;

  // ==========================================================
  // OFFER API RESPONSE
  // ==========================================================

  const offerApiData = offerTrendResponse?.data || {};

  const offerData = useMemo(() => {
    const getValues = (values) =>
      Array.isArray(values)
        ? values.map((value) => Number(value) || 0)
        : [];

    const latest = (values) =>
      values.length > 0 ? values[values.length - 1] : 0;

    return [
      {
        label: "Released",
        value: latest(getValues(offerApiData.offer_released)),
        color: "#E88A00",
      },
      {
        label: "Accepted",
        value: latest(getValues(offerApiData.offer_accepted)),
        color: "#26A69A",
      },
      {
        label: "Rejected",
        value: latest(getValues(offerApiData.offer_rejected)),
        color: "#E53935",
      },
      {
        label: "Revoked",
        value: latest(getValues(offerApiData.offer_revoked)),
        color: "#C54B0A",
      },
    ];
  }, [
    offerApiData.offer_released,
    offerApiData.offer_accepted,
    offerApiData.offer_rejected,
    offerApiData.offer_revoked,
  ]);

  const offerLoading = isOfferTrendLoading || isOfferTrendFetching;

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          background: COLORS.background,
          boxSizing: "border-box",
          p: { xs: 1, sm: 1.5, md: 2 },
          overflowX: "hidden",
        }}
      >
        {/* ====================================================
            FILTER ROW
        ==================================================== */}

        <Box
          sx={{
            minHeight: 68,
            width: "100%",
            background: "#fff",
            border: `1px solid ${COLORS.border}`,
            borderRadius: "10px",
            px: 1.5,
            py: 1,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
            overflow: "visible",
            mb: 1.5,
            position: "relative",
            zIndex: 20,
          }}
        >
          <Box sx={{ minWidth: 0, flexShrink: 0 }}>
            <Toggle
              value={userType}
              onChange={setUserType}
              options={[
                { value: "all", label: "All Users" },
                { value: "current", label: "Current User" },
              ]}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
              minWidth: 0,
              marginLeft: "auto",
              justifyContent: "flex-end",
            }}
          >
            <Filter>All Jobs</Filter>

            <Filter>All Countries</Filter>

            <SubFunctionDropdown
              value={selectedSubFunction}
              onChange={setSelectedSubFunction}
            />

            <Filter>All Time</Filter>

            <IconButton
              sx={{
                width: 44,
                height: 44,
                flexShrink: 0,
                background: "#EFF4FF",
                color: COLORS.blue,

                "&:hover": {
                  background: "#E4ECFF",
                },
              }}
            >
              <Typography
                sx={{ fontSize: 22, lineHeight: 1, fontWeight: 700 }}
              >
                ↓
              </Typography>
            </IconButton>
          </Box>
        </Box>

        {/* ====================================================
            KPI ROW
        ==================================================== */}

        <Box
          sx={{
            display: "grid",

            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              sm: "minmax(0, 1fr)",
              md: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },

            gap: 1.5,
            width: "100%",
            minWidth: 0,
            maxWidth: "100%",
            alignItems: "stretch",

            "& > *": {
              minWidth: 0,
              width: "100%",
              maxWidth: "100%",
            },
          }}
        >
          <KpiCard
            title="Total Jobs"
            data={jobsData}
            hoverModel={jobHoverModel}
            onOpenAll={() => openJobsDialog("all")}
            onOpenStatus={openJobsDialog}
          />

          <KpiCard
            title="Total Positions"
            data={positionsData}
            hoverModel={positionsHoverModel}
            onOpenAll={() => openJobsDialog("all")}
            onOpenStatus={openJobsDialog}
          />

          <CandidateCard />
        </Box>

        {/* ====================================================
            LOWER CHARTS
        ==================================================== */}

        <Box
          sx={{
            display: "grid",

            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              md: "repeat(2, minmax(0, 1fr))",
              lg: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.1fr)",
            },

            gap: 1.5,
            mt: 1.5,
            width: "100%",
            minWidth: 0,
            maxWidth: "100%",

            "& > *": {
              minWidth: 0,
              maxWidth: "100%",
            },
          }}
        >
          {/* ==================================================
              INTERVIEWS
          ================================================== */}

          <ChartCard onClick={() => openJobsDialog("all")}>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 1,
                mb: 1.8,
                minWidth: 0,
              }}
            >
              <Typography
                sx={{
                  fontSize: 15.5,
                  fontWeight: 700,
                  color: COLORS.text,
                  lineHeight: 1.15,
                  maxWidth: 105,
                }}
              >
                Interviews
                <br />
                Count by Status
              </Typography>

              <Box
                onClick={(event) => event.stopPropagation()}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                  flexShrink: 0,
                  flexWrap: "nowrap",
                }}
              >
                {/* LINE / BAR */}
                <Toggle
                  small
                  value={interviewChartType}
                  options={[
                    { value: "line", label: "Line" },
                    { value: "bar", label: "Bar" },
                  ]}
                  onChange={setInterviewChartType}
                />

                {/* CURRENT / CUMULATIVE */}
                <Toggle
                  small
                  value={interviewType}
                  options={[
                    { value: "current", label: "Current" },
                    { value: "cumulative", label: "Cumulative" },
                  ]}
                  onChange={setInterviewType}
                />

                <IconButton
                  size="small"
                  sx={{
                    width: 22,
                    height: 22,
                    color: COLORS.textMuted,
                  }}
                >
                  <Typography sx={{ fontSize: 14 }}>⤢</Typography>
                </IconButton>
              </Box>
            </Box>

            {/* API-DRIVEN INTERVIEW CHART */}
            <InterviewStatusChart
              data={interviewData}
              chartType={interviewChartType}
              labels={interviewLabels}
              loading={interviewLoading}
            />
          </ChartCard>

          {/* ==================================================
              SUB FUNCTIONS
          ================================================== */}

          <ChartCard onClick={() => openJobsDialog("all")}>
            <CardHeader title="Candidates by Sub-function" />

            <SubFunctionBars data={DATA.subFunctions} />
          </ChartCard>

          {/* ==================================================
              PIPELINE
          ================================================== */}

          <ChartCard
            sx={{
              gridColumn: {
                xs: "auto",
                md: "auto",
                lg: "3",
              },

              gridRow: {
                xs: "auto",
                md: "auto",
                lg: "span 2",
              },
            }}
          >
            <CardHeader
              title={
                <>
                  Candidate Pipeline
                  <Box
                    component="span"
                    sx={{
                      color: COLORS.textSecondary,
                      fontWeight: 500,
                      ml: 0.5,
                    }}
                  >
                    : {pipelineType === "current" ? "Current" : "Cumulative"}{" "}
                    Pipeline
                  </Box>
                </>
              }
              toggle={{
                value: pipelineType,
                options: [
                  { value: "current", label: "Current" },
                  { value: "cumulative", label: "Cumulative" },
                ],
              }}
              onToggle={setPipelineType}
            />

            <PipelineChart
              data={pipelineData}
              loading={isCandidateFunnelLoading}
              type={pipelineType}
              onStageClick={openStageDialog}
            />
          </ChartCard>

          {/* ==================================================
              EXPERIENCE
          ================================================== */}

          <ChartCard onClick={() => openJobsDialog("all")}>
            <CardHeader
              title="Candidate by Experience"
              toggle={{
                value: experienceType,
                options: [
                  { value: "donut", label: "Donut" },
                  { value: "bar", label: "Bar" },
                ],
              }}
              onToggle={setExperienceType}
            />

            {experienceType === "donut" ? (
              <Donut data={DATA.experience} total={DATA.candidates.total} />
            ) : (
              <HorizontalBars data={DATA.experience} maxValue={70} />
            )}
          </ChartCard>

          {/* ==================================================
              OFFER STATUS
          ================================================== */}

          <ChartCard onClick={() => openJobsDialog("all")}>
            <CardHeader
              title="Offer Status"
              toggle={{
                value: offerType,
                options: [
                  { value: "current", label: "Current" },
                  { value: "cumulative", label: "Cumulative" },
                ],
              }}
              onToggle={setOfferType}
            />

            <HorizontalBars
              data={offerData}
              maxValue={Math.max(
                ...offerData.map((item) => Number(item.value) || 0),
                1
              )}
            />

            {offerLoading && (
              <Typography
                sx={{
                  fontSize: 10,
                  color: COLORS.textMuted,
                  mt: 0.5,
                  textAlign: "right",
                }}
              >
                Updating...
              </Typography>
            )}
          </ChartCard>
        </Box>

        {/* ====================================================
            JOBS DIALOG
        ==================================================== */}

        <Dialog
          open={jobsDialogOpen}
          onClose={() => setJobsDialogOpen(false)}
          fullWidth
          maxWidth="lg"
          PaperProps={{
            sx: {
              borderRadius: "22px",
              overflow: "hidden",
              boxShadow: "0 24px 60px rgba(15,23,42,0.24)",
            },
          }}
        >
          <DialogTitle
            sx={{
              px: 2.5,
              py: 2,
              borderBottom: `1px solid ${COLORS.border}`,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: COLORS.blue,
                  lineHeight: 1.1,
                }}
              >
                {formatJobStatusLabel(jobsDialogStatus)}
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  color: COLORS.textSecondary,
                  mt: 0.5,
                }}
              >
                {selectedJobsCount} total
              </Typography>
            </Box>

            <IconButton
              onClick={() => setJobsDialogOpen(false)}
              sx={{
                width: 36,
                height: 36,
                border: `1px solid ${COLORS.border}`,
                background: "#fff",
              }}
            >
              <CloseIcon sx={{ fontSize: 20, color: COLORS.textSecondary }} />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ px: 2.5, py: 2.25 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                flexWrap: "wrap",
                mb: 2,
              }}
            >
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.6,
                  px: 0.65,
                  py: 0.55,
                  borderRadius: "999px",
                  background: "#F1F5F9",
                }}
              >
                {[
                  { label: "All", value: "all" },
                  { label: "Open", value: "open" },
                  { label: "Closed", value: "closed" },
                  { label: "On Hold", value: "on_hold" },
                ].map((item) => {
                  const active = jobsDialogStatus === item.value;

                  return (
                    <Box
                      key={item.value}
                      component="button"
                      type="button"
                      onClick={() => setJobsDialogStatus(item.value)}
                      sx={{
                        border: 0,
                        outline: 0,
                        minHeight: 32,
                        px: 1.8,
                        borderRadius: "999px",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 700,
                        color: active ? "#fff" : COLORS.textSecondary,
                        background: active ? COLORS.blue : "transparent",
                        transition: "all 0.15s ease",
                        whiteSpace: "nowrap",
                        "&:hover": {
                          background: active ? COLORS.blue : "#E8EEF8",
                        },
                      }}
                    >
                      {item.label}
                    </Box>
                  );
                })}
              </Box>

              <TextField
                value={jobsSearch}
                onChange={(event) => setJobsSearch(event.target.value)}
                placeholder="Search by job title or ID..."
                size="small"
                fullWidth
                sx={{
                  minWidth: { xs: "100%", md: 320 },
                  flex: 1,
                  background: "#fff",
                  borderRadius: "12px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    height: 46,
                    background: "#F8FAFC",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon
                        sx={{ fontSize: 18, color: COLORS.textMuted }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ maxHeight: "58vh", overflowY: "auto", pr: 0.5 }}>
              {isOrganisationJobsLoading ? (
                <Box
                  sx={{
                    py: 8,
                    textAlign: "center",
                    color: COLORS.textSecondary,
                  }}
                >
                  Loading jobs...
                </Box>
              ) : filteredJobs.length === 0 ? (
                <Box sx={{ py: 8, textAlign: "center" }}>
                  <WorkOutlineRoundedIcon
                    sx={{ fontSize: 42, color: COLORS.textMuted, mb: 1.5 }}
                  />
                  <Typography
                    sx={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}
                  >
                    No jobs found
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: COLORS.textSecondary,
                      mt: 0.5,
                    }}
                  >
                    Try a different status or search term.
                  </Typography>
                </Box>
              ) : (
                filteredJobs.map((job, index) => {
                  const jobId = job.job_id ?? job.id ?? `${index}`;
                  const normalizedStatus = normalizeJobStatus(job.status);
                  const statusColor =
                    normalizedStatus.includes("closed") ||
                    normalizedStatus.includes("filled")
                      ? COLORS.closed
                      : normalizedStatus.includes("hold")
                        ? COLORS.hold
                        : COLORS.open;

                  return (
                    <Box
                      key={jobId}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          md: "auto minmax(0, 1.2fr) auto auto auto",
                        },
                        alignItems: "center",
                        gap: 1.5,
                        px: 1.5,
                        py: 1.25,
                        borderRadius: "14px",
                        border: `1px solid ${COLORS.border}`,
                        background: index % 2 === 0 ? "#fff" : "#FBFDFF",
                        mb: 1,
                        transition: "0.15s ease",
                        "&:hover": {
                          borderColor: COLORS.blue,
                          boxShadow: "0 10px 24px rgba(37,99,235,0.08)",
                        },
                      }}
                    >
                      <Checkbox size="small" />

                      <Box
                        sx={{
                          minWidth: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: 1.25,
                        }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "10px",
                            background: "#FFF4EE",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <WorkOutlineRoundedIcon
                            sx={{ fontSize: 20, color: COLORS.accent }}
                          />
                        </Box>

                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontSize: 14,
                              fontWeight: 800,
                              color: COLORS.text,
                              lineHeight: 1.2,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {job.job_title ?? "Untitled Job"}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: COLORS.textSecondary,
                              mt: 0.4,
                            }}
                          >
                            {job.job_position_id ?? jobId}
                            {job.function || job.sub_function
                              ? ` · ${job.function ?? ""}${
                                  job.function && job.sub_function ? " · " : ""
                                }${job.sub_function ?? ""}`
                              : ""}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: COLORS.textSecondary,
                        }}
                      >
                        {job.no_of_positions ?? 1} position
                        {Number(job.no_of_positions) === 1 ? "" : "s"}
                      </Typography>

                      <Box
                        component="span"
                        sx={{
                          fontSize: 11.5,
                          fontWeight: 800,
                          px: "10px",
                          py: "5px",
                          borderRadius: "999px",
                          background: `${statusColor}14`,
                          color: statusColor,
                          textTransform: "capitalize",
                          justifySelf: { xs: "start", md: "center" },
                        }}
                      >
                        {job.status ?? "open"}
                      </Box>

                      <Button
                        variant="outlined"
                        onClick={() =>
                          navigate(
                            `/account-manager/org/${orgId}/requisitions/${jobId}`,
                            {
                              state: { job, previousTab: 1 },
                            }
                          )
                        }
                        sx={{
                          justifySelf: { xs: "start", md: "end" },
                          borderColor: COLORS.border,
                          color: COLORS.blue,
                          textTransform: "none",
                          fontWeight: 700,
                          borderRadius: "999px",
                          px: 2,
                          whiteSpace: "nowrap",
                          background: "#fff",
                          "&:hover": {
                            borderColor: COLORS.blue,
                            background: "#EFF6FF",
                          },
                        }}
                      >
                        View Details
                      </Button>
                    </Box>
                  );
                })
              )}
            </Box>
          </DialogContent>

          <DialogActions
            sx={{ px: 2.5, py: 2, borderTop: `1px solid ${COLORS.border}` }}
          >
            <Button
              onClick={() => setJobsDialogOpen(false)}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                color: COLORS.blue,
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {stageDialog && (
          <StageDetailsDialog
            key={`${stageDialog.key}-${pipelineType}`}
            stage={stageDialog}
            orgId={orgId}
            countsType={pipelineType}
            subFunctionValue={selectedSubFunction}
            onClose={() => setStageDialog(null)}
            navigate={navigate}
          />
        )}
      </Box>
    </>
  );
};

export default OrganizationOverview;