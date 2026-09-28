import React, { useMemo, useState } from "react";

import {
  Box,
  Typography,
  IconButton,
  Select,
  MenuItem,
} from "@mui/material";

import {
  useGetJobOverviewQuery,
  useGetTotalPositionsQuery,
  useGetCandidateFunnelTrendQuery,
  useGetInterviewTrendQuery,
  useGetOfferTrendQuery,
} from "../../redux/services/organizationOverview/organizationOverview.js";

// ============================================================
// COLORS
// ============================================================

const COLORS = {
  blue: "#2563EB",
  blueDark: "#174FDF",

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
    {
      label: "Clinical Data Manager",
      value: 541,
      color: "#E91E8C",
    },
    {
      label: "Statistical Programmer",
      value: 92,
      color: "#7B61FF",
    },
    {
      label: "Biostatistician",
      value: 47,
      color: "#00BFA5",
    },
    {
      label: "Clinical Programmer/CRF Dev",
      value: 14,
      color: "#D32F2F",
    },
    {
      label: "Medical Coder",
      value: 5,
      color: "#FFA000",
    },
    {
      label: "Generic",
      value: 0,
      color: "#9E9E9E",
    },
  ],

  experience: [
    {
      label: "0–2 yrs",
      value: 4,
      pct: 3,
      color: "#174FDF",
    },
    {
      label: "3–5 yrs",
      value: 69,
      pct: 52,
      color: "#0571ED",
    },
    {
      label: "6–10 yrs",
      value: 54,
      pct: 41,
      color: "#0097A7",
    },
    {
      label: "10+ yrs",
      value: 6,
      pct: 5,
      color: "#00BBD4",
    },
  ],

  offers: [
    {
      label: "Released",
      value: 10,
      color: "#E88A00",
    },
    {
      label: "Accepted",
      value: 4,
      color: "#26A69A",
    },
    {
      label: "Rejected",
      value: 0,
      color: "#E53935",
    },
    {
      label: "Revoked",
      value: 3,
      color: "#C54B0A",
    },
  ],
};

// ============================================================
// SUB FUNCTION OPTIONS
// ============================================================

const SUB_FUNCTION_OPTIONS = [
  {
    label: "All Sub-functions",
    value: "all",
  },
  {
    label: "Biostatistician",
    value: "biostatistician",
  },
  {
    label: "Clinical Data Manager",
    value: "clinical_data_manager",
  },
  {
    label: "Clinical Programmer / CRF Developer",
    value: "clinical_programmer_crf_developer",
  },
  {
    label: "General",
    value: "general",
  },
  {
    label: "medical coder",
    value: "medical_coder",
  },
  {
    label: "Statistical Programmer",
    value: "statistical_programmer",
  },
];

// ============================================================
// TOGGLE
// ============================================================

const Toggle = ({
  value,
  onChange,
  options,
  small = false,
}) => {
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
              color: active
                ? "#fff"
                : COLORS.textSecondary,
              background: active
                ? COLORS.blue
                : "transparent",
              whiteSpace: "nowrap",
              transition: "all .15s ease",

              "&:hover": {
                background: active
                  ? COLORS.blue
                  : "#E8EEF8",
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

      <span
        style={{
          fontSize: 10,
          color: COLORS.textSecondary,
        }}
      >
        ▼
      </span>
    </Box>
  );
};

// ============================================================
// SUB FUNCTION DROPDOWN
// ============================================================

const SubFunctionDropdown = ({
  value,
  onChange,
}) => {
  return (
    <Select
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
      }}
      displayEmpty
      size="small"
      sx={{
        minWidth: {
          xs: 220,
          sm: 250,
          md: 285,
        },

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
            boxShadow:
              "0 4px 12px rgba(0,0,0,0.18)",
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
        <MenuItem
          key={option.value}
          value={option.value}
        >
          {option.label}
        </MenuItem>
      ))}
    </Select>
  );
};

// ============================================================
// SPARKLINE
// ============================================================

const Sparkline = ({
  values = [],
  color = COLORS.blue,
}) => {
  const width = 120;
  const height = 46;

  const safeValues =
    Array.isArray(values) &&
    values.length > 0
      ? values
      : [0];

  const max = Math.max(
    ...safeValues,
    1
  );

  const min = Math.min(
    ...safeValues,
    0
  );

  const range =
    max - min || 1;

  const points = safeValues.map(
    (value, index) => {
      const x =
        safeValues.length === 1
          ? width / 2
          : index *
            (width /
              (safeValues.length - 1));

      const y =
        height -
        ((value - min) /
          range) *
          (height - 10) -
        5;

      return [x, y];
    }
  );

  const path = points.reduce(
    (acc, point, index, arr) => {
      if (index === 0) {
        return `M ${point[0]} ${point[1]}`;
      }

      const previous =
        arr[index - 1];

      const middleX =
        (previous[0] + point[0]) / 2;

      return `${acc} C ${middleX} ${previous[1]}, ${middleX} ${point[1]}, ${point[0]} ${point[1]}`;
    },
    ""
  );

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        display: "block",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points.map(
        ([x, y], index) => (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="3.5"
            fill={color}
          />
        )
      )}
    </svg>
  );
};

// ============================================================
// GRAPH LEGEND
// ============================================================

const GraphLegend = () => {
  const items = [
    {
      label: "Open",
      color: COLORS.open,
    },
    {
      label: "Closed",
      color: COLORS.closed,
    },
    {
      label: "Hold",
      color: COLORS.hold,
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: {
          xs: 0.35,
          sm: 0.65,
        },
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
}) => {
  const safeMax = max || 1;

  const barHeight =
    value === 0
      ? 4
      : Math.max(
          5,
          Math.min(
            38,
            (value / safeMax) * 38
          )
        );

  return (
    <Box
      sx={{
        minWidth: 0,
        width: "100%",
        height: 66,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        overflow: "hidden",
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
          height: loading
            ? 4
            : barHeight,
          background: color,
          borderRadius:
            "2px 2px 0 0",
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

const KpiCard = ({
  title,
  data,
}) => {
  return (
    <Box
      sx={{
        height: 108,
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        background: "#fff",
        border:
          `1px solid ${COLORS.border}`,
        borderLeft:
          `5px solid ${COLORS.blue}`,
        borderRadius: "10px",
        boxSizing: "border-box",
        boxShadow:
          "0 1px 3px rgba(15,23,42,0.04)",

        display: "grid",

        gridTemplateColumns:
          "minmax(0, 1.05fr) minmax(0, 1fr) minmax(0, .95fr)",

        columnGap: {
          xs: 1,
          sm: 1.5,
          md: 2,
        },

        alignItems: "center",

        px: {
          xs: 1,
          sm: 1.5,
        },

        overflow: "hidden",

        "& > *": {
          minWidth: 0,
          maxWidth: "100%",
        },
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
          {data.loading
            ? "..."
            : data.total}
        </Typography>
      </Box>

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
              overflow: "hidden",
            }}
          >
            <Sparkline
              values={data.graph}
              color={COLORS.blue}
            />
          </Box>
        </Box>

        <GraphLegend />
      </Box>

      <Box
        sx={{
          minWidth: 0,
          width: "100%",
          display: "grid",
          gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
          columnGap: {
            xs: 0.15,
            sm: 0.4,
          },
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <StatusItem
          label="Open"
          value={data.open}
          color={COLORS.open}
          max={data.closed}
          loading={data.loading}
        />

        <StatusItem
          label="Closed"
          value={data.closed}
          color={COLORS.closed}
          max={data.closed}
          loading={data.loading}
        />

        <StatusItem
          label="Hold"
          value={data.hold}
          color={COLORS.hold}
          max={data.closed}
          loading={data.loading}
        />
      </Box>
    </Box>
  );
};

// ============================================================
// MINI STAT
// ============================================================

const MiniStat = ({
  label,
  value,
}) => {
  return (
    <Box
      sx={{
        minWidth: 0,
        width: "100%",
        overflow: "hidden",
      }}
    >
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
  return (
    <Box
      sx={{
        height: 108,
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        background: "#fff",
        border:
          `1px solid ${COLORS.border}`,
        borderLeft:
          `5px solid ${COLORS.blue}`,
        borderRadius: "10px",
        boxSizing: "border-box",
        boxShadow:
          "0 1px 3px rgba(15,23,42,0.04)",

        display: "grid",

        gridTemplateColumns:
          "minmax(0, .9fr) minmax(0, 1.1fr)",

        columnGap: 2,

        alignItems: "center",

        px: {
          xs: 1,
          sm: 1.5,
        },

        overflow: "hidden",

        "& > *": {
          minWidth: 0,
          maxWidth: "100%",
        },
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
          gridTemplateColumns:
            "minmax(0, 1fr) minmax(0, 1fr)",
          gridTemplateRows:
            "1fr 1fr",
          rowGap: 1,
          columnGap: 1.2,
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <MiniStat
          label="Applications"
          value={
            DATA.candidates
              .applications
          }
        />

        <MiniStat
          label="Shortlisted"
          value={
            DATA.candidates
              .shortlisted
          }
        />

        <MiniStat
          label="Interview"
          value={
            DATA.candidates.interview
          }
        />

        <MiniStat
          label="Onboarded"
          value={
            DATA.candidates
              .onboarded
          }
        />
      </Box>
    </Box>
  );
};

// ============================================================
// CARD HEADER
// ============================================================

const CardHeader = ({
  title,
  toggle,
  onToggle,
}) => {
  return (
    <Box
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
          sx={{
            width: 26,
            height: 26,
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: 15,
              color: COLORS.textMuted,
            }}
          >
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

const ChartCard = ({
  children,
  sx = {},
}) => {
  return (
    <Box
      sx={{
        background: "#fff",
        border:
          `1px solid ${COLORS.border}`,
        borderRadius: "14px",
        boxShadow:
          "0 1px 3px rgba(15,23,42,0.04)",
        padding: 2.4,
        minWidth: 0,
        overflow: "hidden",
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

  return [
    0,
    step,
    step * 2,
    step * 3,
    max,
  ].map((value) =>
    Math.round(value)
  );
};

// ============================================================
// AXIS
// ============================================================

const AxisRow = ({
  max,
  labelWidth = 110,
  valueWidth = 30,
}) => {
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
      {ticks.map(
        (tick, index) => (
          <Typography
            key={index}
            sx={{
              fontSize: 10,
              color: COLORS.textMuted,
            }}
          >
            {tick}
          </Typography>
        )
      )}
    </Box>
  );
};

// ============================================================
// SUB FUNCTION BARS
// Dedicated to the "Candidates by Sub-function" card: no track
// background, the value sits right after the bar's own end
// (not in a fixed far-right column), faint vertical gridlines
// run the full chart height, and zero-value entries (e.g.
// "Generic") are hidden.
// ============================================================

const SubFunctionBars = ({
  data,
}) => {
  const filtered = data.filter(
    (item) => item.value > 0
  );

  const maxValue = Math.max(
    ...filtered.map(
      (item) => item.value
    ),
    1
  );

  const ticks = niceTicks(
    maxValue
  );

  const labelWidth = 92;

  return (
    <Box>
      <Box
        sx={{
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            left: `${
              labelWidth + 12
            }px`,
            right: 0,
            top: 0,
            bottom: 0,
            pointerEvents: "none",
          }}
        >
          {ticks.map(
            (tick, index) => (
              <Box
                key={index}
                sx={{
                  position:
                    "absolute",
                  left: `${
                    (tick /
                      maxValue) *
                    100
                  }%`,
                  top: 0,
                  bottom: 0,
                  width: "1px",
                  background:
                    COLORS.border,
                }}
              />
            )
          )}
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
            const pct =
              (item.value /
                maxValue) *
              100;

            return (
              <Box
                key={item.label}
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
                    color:
                      COLORS.textSecondary,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow:
                      "ellipsis",
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
                      background:
                        item.color,
                    }}
                  />

                  <Typography
                    sx={{
                      position: "absolute",
                      left: `calc(${pct}% + 10px)`,
                      top: "50%",
                      transform:
                        "translateY(-50%)",
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

      <AxisRow
        max={maxValue}
        labelWidth={labelWidth}
        valueWidth={0}
      />
    </Box>
  );
};

// ============================================================
// HORIZONTAL BARS
// ============================================================

const HorizontalBars = ({
  data,
  maxValue,
}) => {
  const max =
    maxValue ||
    Math.max(
      ...data.map(
        (item) => item.value
      ),
      1
    );

  const labelWidth = 110;
  const valueWidth = 30;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2.2,
        }}
      >
        {data.map((item) => (
          <Box
            key={item.label}
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
                  width: `${
                    (item.value / max) *
                    100
                  }%`,
                  height: "100%",
                  background: item.color,
                  borderRadius: "5px",
                  minWidth:
                    item.value > 0
                      ? 4
                      : 0,
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

      <AxisRow
        max={max}
        labelWidth={labelWidth}
        valueWidth={valueWidth}
      />
    </Box>
  );
};

// ============================================================
// INTERVIEW LINE CHART
// IMPORTANT:
// `item.line` now comes directly from the API.
//
// Row style matches the target UI: a pill-shaped label on the
// left, the latest value centered, and a sparkline on the
// right with a soft color-filled area under the trend line.
// Rows are separated by a thin divider instead of a full box
// border. Only 5 statuses are shown here (no "Not Conducted"),
// matching the reference screenshots.
// ============================================================

const InterviewLineChart = ({
  data,
  loading = false,
}) => {
  const width = 120;
  const height = 34;

  // Normalize against a shared max across every status so
  // row heights/lengths are comparable to one another (rather
  // than each row always maxing out against itself).
  const allValues = data.flatMap((item) =>
    Array.isArray(item.line) && item.line.length > 0
      ? item.line
      : [0]
  );

  const maxValue = Math.max(...allValues, 1);

  const createPoints = (
    values
  ) => {
    const safeValues =
      Array.isArray(values) &&
      values.length >= 2
        ? values
        : [0, 0];

    return safeValues.map(
      (value, index) => {
        const x =
          (index /
            (safeValues.length - 1)) *
          width;

        const y =
          height -
          (Number(value) /
            maxValue) *
            (height - 6) -
          3;

        return {
          x,
          y,
        };
      }
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {data.map((item, rowIndex) => {
        // Only draw an actual trend line/area when the API has
        // given us 2+ periods to plot. With a single aggregate
        // value (the current API shape), a "line" has nothing
        // real to show — every row would render identically
        // regardless of value. A proportional bar communicates
        // relative magnitude instead, until real period-level
        // data is available.
        const hasTrend =
          Array.isArray(item.line) &&
          item.line.length > 1;

        const points = hasTrend
          ? createPoints(item.line)
          : [];

        const linePath = hasTrend
          ? points.reduce(
              (
                result,
                point,
                index
              ) => {
                if (index === 0) {
                  return `M ${point.x} ${point.y}`;
                }

                const previous =
                  points[index - 1];

                const middleX =
                  (previous.x +
                    point.x) /
                  2;

                return `${result} C ${middleX} ${previous.y}, ${middleX} ${point.y}, ${point.x} ${point.y}`;
              },
              ""
            )
          : "";

        const areaPath =
          hasTrend && points.length > 0
            ? `${linePath} L ${
                points[points.length - 1].x
              } ${height} L ${points[0].x} ${height} Z`
            : "";

        const barPct =
          maxValue > 0
            ? Math.max(
                0,
                Math.min(
                  100,
                  (Number(item.value) /
                    maxValue) *
                    100
                )
              )
            : 0;

        return (
          <Box
            key={item.label}
            sx={{
              display: "grid",
              gridTemplateColumns:
                "108px 28px minmax(80px, 1fr)",
              alignItems: "center",
              gap: 0.9,
              py: 0.7,
              borderBottom:
                rowIndex <
                data.length - 1
                  ? `1px solid ${COLORS.border}`
                  : "none",
            }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent:
                  "center",
                border:
                  `1px solid ${COLORS.border}`,
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
                  color:
                    COLORS.textSecondary,
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
              {loading
                ? "..."
                : item.value}
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
                  style={{
                    display: "block",
                    overflow: "visible",
                  }}
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

                  {points.map(
                    (point, index) => (
                      <circle
                        key={index}
                        cx={point.x}
                        cy={point.y}
                        r="3.5"
                        fill={item.color}
                      />
                    )
                  )}
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
                      minWidth:
                        item.value > 0
                          ? 4
                          : 0,
                      transition:
                        "width .25s ease",
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

// ============================================================
// INTERVIEW BAR CHART
// IMPORTANT:
// This is a per-period (month) chart, not a per-status chart.
// For each period, the dominant status (highest value that
// period) sets the bar's height and color. A colored-text
// legend for all statuses is rendered below, matching the
// reference screenshot.
// ============================================================

const InterviewBarChart = ({
  data,
  labels = [],
  loading = false,
}) => {
  const periodCount = Math.max(
    ...data.map((item) =>
      Array.isArray(item.line)
        ? item.line.length
        : 0
    ),
    1
  );

  const periods = Array.from(
    { length: periodCount },
    (_, index) => {
      let bestItem = data[0];
      let bestValue = -Infinity;

      data.forEach((item) => {
        const value =
          Array.isArray(item.line) &&
          item.line[index] !==
            undefined
            ? Number(
                item.line[index]
              ) || 0
            : 0;

        if (value > bestValue) {
          bestValue = value;
          bestItem = item;
        }
      });

      return {
        label:
          labels[index] ||
          `P${index + 1}`,
        value: Math.max(
          bestValue,
          0
        ),
        color:
          bestItem?.color ||
          COLORS.blue,
      };
    }
  );

  const maxValue = Math.max(
    ...periods.map(
      (period) => period.value
    ),
    1
  );

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
          borderBottom:
            `1px solid ${COLORS.border}`,
          pb: 0.5,
        }}
      >
        {periods.map(
          (period, index) => (
            <Box
              key={index}
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
                    : Math.max(
                        4,
                        (period.value /
                          maxValue) *
                          (chartHeight -
                            10)
                      ),
                  background:
                    period.color,
                  borderRadius:
                    "6px 6px 0 0",
                  transition:
                    "height .25s ease",
                }}
              />
            </Box>
          )
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 3,
          mt: 0.8,
        }}
      >
        {periods.map(
          (period, index) => (
            <Typography
              key={index}
              sx={{
                width: 40,
                textAlign: "center",
                fontSize: 11.5,
                color:
                  COLORS.textSecondary,
              }}
            >
              {period.label}
            </Typography>
          )
        )}
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
    return (
      <InterviewBarChart
        data={data}
        labels={labels}
        loading={loading}
      />
    );
  }

  return (
    <InterviewLineChart
      data={data}
      loading={loading}
    />
  );
};

// ============================================================
// DONUT
// ============================================================

const Donut = ({
  data,
  total,
}) => {
  let current = 0;

  const segments =
    data.map((item) => {
      const start = current;

      current += item.pct;

      return `${item.color} ${
        start * 3.6
      }deg ${
        current * 3.6
      }deg`;
    });

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
        sx={{
          width: 105,
          height: 105,
          borderRadius: "50%",
          flexShrink: 0,
          background:
            `conic-gradient(${segments.join(
              ","
            )})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
          <Typography
            sx={{
              fontSize: 19,
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            {total}
          </Typography>

          <Typography
            sx={{
              fontSize: 9,
              color: COLORS.textMuted,
              mt: 0.3,
            }}
          >
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
                background:
                  item.color,
              }}
            />

            <Typography
              sx={{
                fontSize: 11,
                color:
                  COLORS.textSecondary,
                width: 70,
                flexShrink: 0,
              }}
            >
              {item.label}
            </Typography>

            <Typography
              sx={{
                fontSize: 11.5,
                fontWeight: 700,
              }}
            >
              {item.value}
            </Typography>

            <Typography
              sx={{
                fontSize: 10,
                color:
                  COLORS.textMuted,
              }}
            >
              ({item.pct}%)
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// ============================================================
// CURRENT PIPELINE
// ============================================================

const CurrentPipelineChart = ({
  data,
  loading = false,
}) => {
  const max = Math.max(
    ...data.map(
      (item) =>
        Number(item.value) || 0
    ),
    1
  );

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

      <Box
        sx={{
          display: "flex",
          height: chartHeight,
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            width: 34,
            flexShrink: 0,
            height: chartHeight,
            display: "flex",
            flexDirection:
              "column-reverse",
            justifyContent:
              "space-between",
            pr: 1,
          }}
        >
          {ticks.map(
            (tick, index) => (
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
            )
          )}
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
              flexDirection:
                "column-reverse",
              justifyContent:
                "space-between",
            }}
          >
            {ticks.map(
              (tick, index) => (
                <Box
                  key={index}
                  sx={{
                    borderTop:
                      `1px solid ${COLORS.border}`,
                    width: "100%",
                    height: 0,
                  }}
                />
              )
            )}
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
                      position:
                        "relative",
                      width: "100%",
                      height: `${
                        ((Number(
                          item.value
                        ) || 0) /
                          max) *
                        100
                      }%`,
                      minHeight:
                        item.value > 0
                          ? 4
                          : 0,
                      background:
                        item.color,
                      borderRadius:
                        "4px 4px 0 0",
                    }}
                  >
                    <Typography
                      sx={{
                        position:
                          "absolute",
                        top: -19,
                        left: "50%",
                        transform:
                          "translateX(-50%)",
                        fontSize: 11,
                        fontWeight: 700,
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {loading
                        ? "..."
                        : item.value}
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  sx={{
                    fontSize: 9,
                    color:
                      COLORS.textMuted,
                    mt: 1,
                    textAlign: "center",
                    lineHeight: 1.2,
                    whiteSpace:
                      "nowrap",
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// ============================================================
// CUMULATIVE PIPELINE
// ============================================================

const CumulativePipelineChart = ({
  data,
  loading = false,
}) => {
  const safeData = data.filter(
    (item) =>
      Number(item.value) >= 0
  );

  const maxValue = Math.max(
    ...safeData.map(
      (item) =>
        Number(item.value) || 0
    ),
    1
  );

  const chartHeight = 320;
  const chartWidth = 430;
  const centerX = 155;
  const topY = 18;
  const stageHeight = 39;
  const stageGap = 2;

  const getWidth = (value) => {
    const ratio = Math.max(
      0.16,
      Math.min(
        1,
        (Number(value) || 0) /
          maxValue
      )
    );

    return 285 * ratio;
  };

  const pointsForStage = (
    topWidth,
    bottomWidth,
    y
  ) => {
    const topLeft =
      centerX - topWidth / 2;

    const topRight =
      centerX + topWidth / 2;

    const bottomLeft =
      centerX - bottomWidth / 2;

    const bottomRight =
      centerX + bottomWidth / 2;

    return [
      `${topLeft},${y}`,
      `${topRight},${y}`,
      `${bottomRight},${
        y + stageHeight
      }`,
      `${bottomLeft},${
        y + stageHeight
      }`,
    ].join(" ");
  };

  return (
    <Box
      sx={{
        minWidth: 0,
        width: "100%",
        overflow: "hidden",
      }}
    >
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
              color:
                COLORS.textMuted,
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
            style={{
              display: "block",
              overflow: "visible",
            }}
          >
            {safeData.map(
              (item, index) => {
                const value =
                  Number(
                    item.value
                  ) || 0;

                const nextValue =
                  index <
                  safeData.length - 1
                    ? Number(
                        safeData[
                          index + 1
                        ].value
                      ) || 0
                    : Math.max(
                        value * 0.72,
                        1
                      );

                const topWidth =
                  getWidth(value);

                const bottomWidth =
                  getWidth(nextValue);

                const y =
                  topY +
                  index *
                    (stageHeight +
                      stageGap);

                const maxStageWidth =
                  Math.max(
                    topWidth,
                    bottomWidth
                  );

                const labelX =
                  centerX +
                  maxStageWidth / 2 +
                  16;

                const valueX =
                  centerX -
                  maxStageWidth / 2 -
                  14;

                return (
                  <g
                    key={item.label}
                  >
                    <polygon
                      points={pointsForStage(
                        topWidth,
                        bottomWidth,
                        y
                      )}
                      fill={item.color}
                    />

                    <text
                      x={valueX}
                      y={
                        y +
                        stageHeight / 2 +
                        4
                      }
                      textAnchor="end"
                      fill="#64748B"
                      fontSize="12"
                      fontWeight="500"
                    >
                      {value}
                    </text>

                    <text
                      x={labelX}
                      y={
                        y +
                        stageHeight / 2 +
                        4
                      }
                      textAnchor="start"
                      fill="#111827"
                      fontSize="12"
                      fontWeight="700"
                    >
                      {item.label ===
                      "New Applications"
                        ? "Applications"
                        : item.label}
                    </text>
                  </g>
                );
              }
            )}
          </svg>
        )}
      </Box>

      <Box
        sx={{
          mt: 1.5,
          px: 1.5,
          py: 1,
          border:
            "1px solid #FECACA",
          background: "#FFF5F5",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
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
              border:
                "1px solid #FECACA",
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
          sx={{
            fontSize: 18,
            fontWeight: 800,
            color: COLORS.closed,
          }}
        >
          {loading
            ? "..."
            : safeData.find(
                (item) =>
                  item.label ===
                  "Rejected"
              )?.value ?? 0}
        </Typography>
      </Box>
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
}) => {
  if (type === "cumulative") {
    return (
      <CumulativePipelineChart
        data={data}
        loading={loading}
      />
    );
  }

  return (
    <CurrentPipelineChart
      data={data}
      loading={loading}
    />
  );
};

// ============================================================
// HELPER
// ============================================================

const latestValue = (values) => {
  if (
    !Array.isArray(values) ||
    values.length === 0
  ) {
    return 0;
  }

  return (
    Number(
      values[
        values.length - 1
      ]
    ) || 0
  );
};

// ============================================================
// MAIN PAGE
// ============================================================

const OrganizationOverview = ({
  orgId,
}) => {
  // ==========================================================
  // STATES
  // ==========================================================

  const [
    userType,
    setUserType,
  ] = useState("current");

  const [
    selectedSubFunction,
    setSelectedSubFunction,
  ] = useState("all");

  // Interview chart:
  // line / bar
  const [
    interviewChartType,
    setInterviewChartType,
  ] = useState("line");

  // Interview API:
  // current / cumulative
  const [
    interviewType,
    setInterviewType,
  ] = useState("current");

  const [
    pipelineType,
    setPipelineType,
  ] = useState("current");

  const [
    experienceType,
    setExperienceType,
  ] = useState("donut");

  const [
    offerType,
    setOfferType,
  ] = useState("current");

  // ==========================================================
  // TOTAL JOBS API
  // ==========================================================

  const {
    data:
      jobOverviewResponse,
    isLoading:
      isJobOverviewLoading,
  } =
    useGetJobOverviewQuery(
      {
        organisationId: orgId,
        groupBy: "month",
        periodCount: 6,
        status: "all",

        filterBySubfunction:
          selectedSubFunction ===
          "all"
            ? undefined
            : selectedSubFunction,

        country: "all",
        allTime: true,
      },
      {
        skip: !orgId,
      }
    );

  // ==========================================================
  // TOTAL POSITIONS API
  // ==========================================================

  const {
    data:
      totalPositionsResponse,
    isLoading:
      isTotalPositionsLoading,
  } =
    useGetTotalPositionsQuery(
      {
        organisationId: orgId,
        groupBy: "month",
        periodCount: 6,
        status: "all",
        countsType: "cumulative",

        filterBySubfunction:
          selectedSubFunction ===
          "all"
            ? undefined
            : selectedSubFunction,

        country: "all",
        allTime: true,
      },
      {
        skip: !orgId,
      }
    );

  // ==========================================================
  // CANDIDATE PIPELINE API
  // ==========================================================

  const {
    data:
      candidateFunnelResponse,
    isLoading:
      isCandidateFunnelLoading,
  } =
    useGetCandidateFunnelTrendQuery(
      {
        organisationId: orgId,
        groupBy: "month",
        periodCount: 6,
        status: "all",

        countsType:
          pipelineType,

        filterBySubfunction:
          selectedSubFunction ===
          "all"
            ? undefined
            : selectedSubFunction,

        country: "all",
        allTime: true,
      },
      {
        skip: !orgId,
      }
    );

  // ==========================================================
  // NEW: INTERVIEW TREND API
  // ==========================================================
  //
  // This is the important integration.
  //
  // current:
  // counts_type=current
  //
  // cumulative:
  // counts_type=cumulative
  //
  // selected sub-function is automatically sent.
  // ==========================================================

  const {
    data:
      interviewTrendResponse,

    isLoading:
      isInterviewTrendLoading,

    isFetching:
      isInterviewTrendFetching,
  } =
    useGetInterviewTrendQuery(
      {
        organisationId: orgId,

        groupBy: "month",

        periodCount: 6,

        status: "all",

        countsType:
          interviewType,

        filterBySubfunction:
          selectedSubFunction ===
          "all"
            ? undefined
            : selectedSubFunction,

        country: "all",

        allTime: true,
      },
      {
        skip: !orgId,
      }
    );

  // ==========================================================
  // OFFER TREND API
  // ==========================================================
  //
  // Current / cumulative is controlled by offerType.
  // The selected sub-function is also passed to the API.
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
      filterBySubfunction:
        selectedSubFunction === "all"
          ? undefined
          : selectedSubFunction,
      country: "all",
      allTime: true,
    },
    {
      skip: !orgId,
    }
  );

  // ==========================================================
  // JOB RESPONSE
  // ==========================================================

  const jobOverview =
    jobOverviewResponse?.data;

  const totalJobs =
    jobOverview
      ?.total_jobs
      ?.value ?? 0;

  const openJobs =
    jobOverview
      ?.total_jobs
      ?.open_jobs
      ?.value ?? 0;

  const closedJobs =
    jobOverview
      ?.total_jobs
      ?.closed_jobs
      ?.value ?? 0;

  const holdJobs =
    jobOverview
      ?.total_jobs
      ?.on_hold_jobs
      ?.value ?? 0;

  const jobBreakdown =
    jobOverview
      ?.total_jobs
      ?.breakdown ?? {};

  const jobGraph =
    Object.values(
      jobBreakdown
    ).map(
      (value) =>
        Number(value) || 0
    );

  const jobsData = {
    total: totalJobs,
    open: openJobs,
    closed: closedJobs,
    hold: holdJobs,

    graph:
      jobGraph.length > 0
        ? jobGraph
        : [0],

    loading:
      isJobOverviewLoading,
  };

  // ==========================================================
  // TOTAL POSITIONS RESPONSE
  // ==========================================================

  const totalPositionsData =
    totalPositionsResponse?.data;

  const totalPositions =
    totalPositionsData?.value ?? 0;

  const openPositions =
    totalPositionsData
      ?.open_positions
      ?.value ?? 0;

  const closedPositions =
    totalPositionsData
      ?.closed_positions
      ?.value ?? 0;

  const holdPositions =
    totalPositionsData
      ?.on_hold_positions
      ?.value ?? 0;

  const positionBreakdown =
    totalPositionsData
      ?.breakdown ?? {};

  const positionGraph =
    Object.values(
      positionBreakdown
    ).map(
      (value) =>
        Number(value) || 0
    );

  const positionsData = {
    total: totalPositions,
    open: openPositions,
    closed: closedPositions,
    hold: holdPositions,

    graph:
      positionGraph.length > 0
        ? positionGraph
        : [0],

    loading:
      isTotalPositionsLoading,
  };

  // ==========================================================
  // CANDIDATE PIPELINE
  // ==========================================================

  const candidateFunnel =
    candidateFunnelResponse?.data;

  const pipelineData = [
    {
      label: "New Applications",
      value: latestValue(
        candidateFunnel?.matched
      ),
      color: "#7890B5",
    },

    {
      label: "Shortlisted",
      value: latestValue(
        candidateFunnel?.shortlisted
      ),
      color: "#2962E8",
    },

    {
      label: "Interview",
      value: latestValue(
        candidateFunnel?.interviewing
      ),
      color: "#7B3FE4",
    },

    {
      label: "Selected",
      value: latestValue(
        candidateFunnel?.selected
      ),
      color: "#22A55A",
    },

    {
      label: "Offers",
      value: latestValue(
        candidateFunnel?.offers
      ),
      color: "#E88A00",
    },

    {
      label: "Onboarded",
      value: latestValue(
        candidateFunnel?.onboarded
      ),
      color: "#218B52",
    },

    {
      label: "Rejected",
      value: latestValue(
        candidateFunnel?.rejected
      ),
      color: "#E53935",
    },
  ];

  // ==========================================================
  // INTERVIEW API RESPONSE
  // ==========================================================

  const interviewApiData =
    interviewTrendResponse?.data || {};

  // ==========================================================
  // INTERVIEW LABELS
  // ==========================================================

  const interviewLabels =
    Array.isArray(
      interviewApiData.labels
    ) &&
    interviewApiData.labels.length > 0
      ? interviewApiData.labels
      : ["all"];

  // ==========================================================
  // INTERVIEW DATA
  //
  // IMPORTANT:
  //
  // We no longer use DATA.interviews here.
  //
  // The values now come directly from:
  //
  // interview_scheduled
  // interview_rescheduled
  // interview_completed
  // interview_cancelled
  // interview_no_show
  //
  // "Not Conducted" is intentionally excluded — the target UI
  // only shows these 5 statuses.
  //
  // `interviewType` is sent to the API, therefore the
  // returned arrays already represent current/cumulative.
  // ==========================================================

  const interviewData =
    useMemo(() => {
      const createInterviewItem = ({
        label,
        apiValues,
        color,
      }) => {
        const values =
          Array.isArray(apiValues)
            ? apiValues.map(
                (value) =>
                  Number(value) || 0
              )
            : [];

        return {
          label,

          value: latestValue(
            values
          ),

          color,

          line:
            values.length > 0
              ? values
              : [0],
        };
      };

      return [
        createInterviewItem({
          label: "Scheduled",
          apiValues:
            interviewApiData.interview_scheduled,
          color:
            COLORS.scheduled,
        }),

        createInterviewItem({
          label: "Rescheduled",
          apiValues:
            interviewApiData.interview_rescheduled,
          color:
            COLORS.rescheduled,
        }),

        createInterviewItem({
          label: "Completed",
          apiValues:
            interviewApiData.interview_completed,
          color:
            COLORS.completed,
        }),

        createInterviewItem({
          label: "Cancelled",
          apiValues:
            interviewApiData.interview_cancelled,
          color:
            COLORS.cancelled,
        }),

        createInterviewItem({
          label: "No Show",
          apiValues:
            interviewApiData.interview_no_show,
          color:
            COLORS.noShow,
        }),
      ];
    }, [
      interviewApiData.interview_scheduled,
      interviewApiData.interview_rescheduled,
      interviewApiData.interview_completed,
      interviewApiData.interview_cancelled,
      interviewApiData.interview_no_show,
    ]);

  // ==========================================================
  // INTERVIEW LOADING
  // ==========================================================

  const interviewLoading =
    isInterviewTrendLoading ||
    isInterviewTrendFetching;

  // ==========================================================
  // OFFER API RESPONSE
  // ==========================================================

  const offerApiData =
    offerTrendResponse?.data || {};

  const offerData = useMemo(() => {
    const getValues = (values) =>
      Array.isArray(values)
        ? values.map((value) => Number(value) || 0)
        : [];

    const latest = (values) =>
      values.length > 0
        ? values[values.length - 1]
        : 0;

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

  const offerLoading =
    isOfferTrendLoading ||
    isOfferTrendFetching;

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        background:
          COLORS.background,
        boxSizing: "border-box",

        p: {
          xs: 1,
          sm: 1.5,
          md: 2,
        },

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
          border:
            `1px solid ${COLORS.border}`,
          borderRadius: "10px",
          px: 1.5,
          py: 1,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          gap: 2,
          flexWrap: "wrap",
          overflow: "visible",
          mb: 1.5,
          position: "relative",
          zIndex: 20,
        }}
      >
        <Box
          sx={{
            minWidth: 0,
            flexShrink: 0,
          }}
        >
          <Toggle
            value={userType}
            onChange={setUserType}
            options={[
              {
                value: "all",
                label: "All Users",
              },
              {
                value: "current",
                label: "Current User",
              },
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
          <Filter>
            All Jobs
          </Filter>

          <Filter>
            All Countries
          </Filter>

          <SubFunctionDropdown
            value={
              selectedSubFunction
            }
            onChange={
              setSelectedSubFunction
            }
          />

          <Filter>
            All Time
          </Filter>

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
              sx={{
                fontSize: 22,
                lineHeight: 1,
                fontWeight: 700,
              }}
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
            xs:
              "minmax(0, 1fr)",

            sm:
              "minmax(0, 1fr)",

            md:
              "repeat(2, minmax(0, 1fr))",

            lg:
              "repeat(3, minmax(0, 1fr))",
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
        />

        <KpiCard
          title="Total Positions"
          data={positionsData}
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
            xs:
              "minmax(0, 1fr)",

            md:
              "repeat(2, minmax(0, 1fr))",

            lg:
              "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.1fr)",
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

        <ChartCard>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent:
                "space-between",
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
                value={
                  interviewChartType
                }
                options={[
                  {
                    value: "line",
                    label: "Line",
                  },
                  {
                    value: "bar",
                    label: "Bar",
                  },
                ]}
                onChange={
                  setInterviewChartType
                }
              />

              {/* CURRENT / CUMULATIVE */}

              <Toggle
                small
                value={
                  interviewType
                }
                options={[
                  {
                    value: "current",
                    label: "Current",
                  },
                  {
                    value:
                      "cumulative",
                    label:
                      "Cumulative",
                  },
                ]}
                onChange={
                  setInterviewType
                }
              />

              <IconButton
                size="small"
                sx={{
                  width: 22,
                  height: 22,
                  color:
                    COLORS.textMuted,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 14,
                  }}
                >
                  ⤢
                </Typography>
              </IconButton>
            </Box>
          </Box>

          {/* API-DRIVEN INTERVIEW CHART */}

          <InterviewStatusChart
            data={interviewData}
            chartType={
              interviewChartType
            }
            labels={
              interviewLabels
            }
            loading={
              interviewLoading
            }
          />
        </ChartCard>

        {/* ==================================================
            SUB FUNCTIONS
        ================================================== */}

        <ChartCard>
          <CardHeader
            title="Candidates by Sub-function"
          />

          <SubFunctionBars
            data={
              DATA.subFunctions
            }
          />
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
                    color:
                      COLORS.textSecondary,
                    fontWeight: 500,
                    ml: 0.5,
                  }}
                >
                  :{" "}
                  {pipelineType ===
                  "current"
                    ? "Current"
                    : "Cumulative"}{" "}
                  Pipeline
                </Box>
              </>
            }
            toggle={{
              value:
                pipelineType,

              options: [
                {
                  value: "current",
                  label: "Current",
                },
                {
                  value:
                    "cumulative",
                  label:
                    "Cumulative",
                },
              ],
            }}
            onToggle={
              setPipelineType
            }
          />

          <PipelineChart
            data={pipelineData}
            loading={
              isCandidateFunnelLoading
            }
            type={
              pipelineType
            }
          />
        </ChartCard>

        {/* ==================================================
            EXPERIENCE
        ================================================== */}

        <ChartCard>
          <CardHeader
            title="Candidate by Experience"
            toggle={{
              value:
                experienceType,

              options: [
                {
                  value: "donut",
                  label: "Donut",
                },
                {
                  value: "bar",
                  label: "Bar",
                },
              ],
            }}
            onToggle={
              setExperienceType
            }
          />

          {experienceType ===
          "donut" ? (
            <Donut
              data={
                DATA.experience
              }
              total={
                DATA.candidates
                  .total
              }
            />
          ) : (
            <HorizontalBars
              data={
                DATA.experience
              }
              maxValue={70}
            />
          )}
        </ChartCard>

        {/* ==================================================
            OFFER STATUS
        ================================================== */}

        <ChartCard>
          <CardHeader
            title="Offer Status"
            toggle={{
              value:
                offerType,

              options: [
                {
                  value: "current",
                  label: "Current",
                },
                {
                  value:
                    "cumulative",
                  label:
                    "Cumulative",
                },
              ],
            }}
            onToggle={
              setOfferType
            }
          />

          <HorizontalBars
            data={offerData}
            maxValue={
              Math.max(
                ...offerData.map(
                  (item) =>
                    Number(item.value) || 0
                ),
                1
              )
            }
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
    </Box>
  );
};

export default OrganizationOverview;