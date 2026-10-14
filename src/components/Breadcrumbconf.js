// src/config/breadcrumbConfig.js

import DashboardIcon from "@mui/icons-material/GridViewRounded";
import BusinessIcon  from "@mui/icons-material/CorporateFareRounded";
import WorkIcon      from "@mui/icons-material/WorkOutlineRounded";
import PeopleIcon    from "@mui/icons-material/PersonOutlineRounded";
import CalendarIcon  from "@mui/icons-material/CalendarMonthOutlined";
import SettingsIcon  from "@mui/icons-material/SettingsOutlined";
import { ManageAccountsOutlined } from "@mui/icons-material";
import MoveToInboxOutlinedIcon from "@mui/icons-material/MoveToInboxOutlined";

export const BREADCRUMB_MAP = {
  dashboard:       { label: "Dashboard",     icon: DashboardIcon, path: "/account-manager/dashboard"    },
  organization:    { label: "Organizations", icon: BusinessIcon,  path: "/account-manager/organization" },
  orgrequisitions: { label: "Requisitions",  icon: WorkIcon,      path: null },
  orgcandidates:   { label: "Candidates",    icon: PeopleIcon,    path: null },
  requisitions:    { label: "Requisitions",  icon: WorkIcon,      path: "/account-manager/requisitions" },
  interviews:      { label: "Interviews",    icon: CalendarIcon,  path: "/account-manager/interviews"   },
  candidates:      { label: "Candidates",    icon: PeopleIcon,    path: "/account-manager/candidates"   }, // ← fixed path
  requests:        { label: "Requests",      icon: MoveToInboxOutlinedIcon, path: "/account-manager/requests" },
  candidate:       { label: "Candidate",     icon: PeopleIcon,    path: null },
  settings:        { label: "Settings",      icon: SettingsIcon,  path: "/account-manager/settings"     },
  _dynamic:        { icon: WorkIcon },
};

export const ROUTE_TRAILS = [

  // ── Requests ──────────────────────────────────────────────────
  {
    match: "/account-manager/requests",
    exact: true,
    trail: [
      { label: "Requests", icon: MoveToInboxOutlinedIcon, path: "/account-manager/requests", isLast: true },
    ],
  },
  ...[
    ["demo", "Demo Request"],
    ["subscription", "Subscription Request"],
    ["hiring", "Hiring Requests"],
  ].map(([path, label]) => ({
    match: `/account-manager/requests/${path}`,
    exact: true,
    trail: [
      { label: "Requests", icon: MoveToInboxOutlinedIcon, path: "/account-manager/requests" },
      { label, icon: MoveToInboxOutlinedIcon, path: null, isLast: true },
    ],
  })),
  {
    match: "/account-manager/requests/",
    segmentCount: 4,
    trail: [
      { label: "Requests", icon: MoveToInboxOutlinedIcon, path: "/account-manager/requests" },
      { label: "Demo Request", icon: MoveToInboxOutlinedIcon, path: "/account-manager/requests/demo" },
      { label: "Details", icon: MoveToInboxOutlinedIcon, path: null, isLast: true },
    ],
  },

  // ── Dashboard ────────────────────────────────────────────────
  {
    match: "/account-manager/dashboard",
    exact: true,
    trail: [
      { label: "Dashboard", icon: DashboardIcon, path: "/account-manager/dashboard", isLast: true },
    ],
  },

  // ── User Management ──────────────────────────────────────────
  {
    match: "/account-manager/user-management",
    exact: true,
    trail: [
      { label: "User Management", icon: ManageAccountsOutlined, path: "/account-manager/user-management", isLast: true },
    ],
  },

  // ── Organizations list ───────────────────────────────────────
  {
    match: "/account-manager/organization",
    exact: true,
    trail: [
      { label: "Organizations", icon: BusinessIcon, path: "/account-manager/organization", isLast: true },
    ],
  },

  // ── Candidates list ──────────────────────────────────────────
  // MUST come before the detail route so exact match wins
  {
    match: "/account-manager/candidates",
    exact: true,
    trail: [
      { label: "Candidates", icon: PeopleIcon, path: "/account-manager/candidates", isLast: true },
    ],
  },

  // ── Candidate detail ─────────────────────────────────────────
  // URL: /account-manager/candidates/:candidateId
  {
    match: "/account-manager/candidates/",
    segmentCount: 3,
    trail: [
      { label: "Candidates",      icon: PeopleIcon, path: "/account-manager/candidates" },
      { label: "__candidateId__", icon: PeopleIcon, path: null, dynamic: "candidateId", isLast: true },
    ],
  },

  // ── Org Overview ─────────────────────────────────────────────
  {
    match: "/account-manager/org/",
    segmentCount: 3,
    trail: [
      { label: "Organizations", icon: BusinessIcon, path: "/account-manager/organization" },
      { label: "__orgId__",     icon: BusinessIcon, path: null, dynamic: "orgId", isLast: true },
    ],
  },

  // ── Org → Requisitions list ──────────────────────────────────
  {
    match: "/account-manager/org/",
    segmentCount: 4,
    trail: [
      { label: "Organizations", icon: BusinessIcon, path: "/account-manager/organization" },
      { label: "__orgId__",     icon: BusinessIcon, path: null, dynamic: "orgId" },
      { label: "Requisitions",  icon: WorkIcon,     path: null, isLast: true },
    ],
  },

  // ── Requisition detail ───────────────────────────────────────
  {
    match: "/account-manager/org/",
    segmentCount: 5,
    trail: [
      { label: "Organizations", icon: BusinessIcon, path: "/account-manager/organization" },
      { label: "__orgId__",     icon: BusinessIcon, path: null, dynamic: "orgId" },
      { label: "Requisitions",  icon: WorkIcon,     path: null },
      { label: "__jobId__",     icon: WorkIcon,     path: null, dynamic: "jobId", isLast: true },
    ],
  },

  // ── Org → Candidates ─────────────────────────────────────────
  {
    match: "/account-manager/org/",
    segmentCount: 4,
    trail: [
      { label: "Organizations", icon: BusinessIcon, path: "/account-manager/organization" },
      { label: "__orgId__",     icon: BusinessIcon, path: null, dynamic: "orgId" },
      { label: "Candidates",    icon: PeopleIcon,   path: null, isLast: true },
    ],
  },

  // ── Old org-scoped candidate detail ──────────────────────────
  // URL: /account-manager/candidate/:candidateId
  {
    match: "/account-manager/candidate/",
    segmentCount: 3,
    trail: [
      { label: "Organizations",   icon: BusinessIcon, path: "/account-manager/organization" },
      { label: "__orgId__",       icon: BusinessIcon, path: null, dynamic: "orgId" },
      { label: "__jobId__",       icon: WorkIcon,     path: null, dynamic: "jobId" },
      { label: "__candidateId__", icon: PeopleIcon,   path: null, dynamic: "candidateId", isLast: true },
    ],
  },

  // ── Org → Interviews ─────────────────────────────────────────
  {
    match: "/account-manager/org/",
    segmentCount: 4,
    trail: [
      { label: "Organizations", icon: BusinessIcon, path: "/account-manager/organization" },
      { label: "__orgId__",     icon: BusinessIcon, path: null, dynamic: "orgId" },
      { label: "Interviews",    icon: CalendarIcon, path: null, isLast: true },
    ],
  },

  // ── Org → Billing ────────────────────────────────────────────
  {
    match: "/account-manager/org/",
    segmentCount: 4,
    trail: [
      { label: "Organizations", icon: BusinessIcon, path: "/account-manager/organization" },
      { label: "__orgId__",     icon: BusinessIcon, path: null, dynamic: "orgId" },
      { label: "Billing",       icon: SettingsIcon, path: null, isLast: true },
    ],
  },
  // ── Settings ─────────────────────────────────────────
{
  match: "/account-manager/settings",
  exact: true,
  trail: [
    {
      label: "Settings",
      icon: SettingsIcon,
      path: "/account-manager/settings",
      isLast: true,
    },
  ],
},

// ── Change Password ─────────────────────────────────
{
  match: "/account-manager/settings/change-password",
  exact: true,
  trail: [
    {
      label: "Settings",
      icon: SettingsIcon,
      path: "/account-manager/settings",
    },
    {
      label: "Change Password",
      icon: SettingsIcon,
      path: null,
      isLast: true,
    },
  ],
},
];

/**
 * Find the matching trail for the current pathname.
 * Exact entries are checked first, then segmentCount-based entries.
 */
export function getTrailForPath(pathname) {
  const segments = pathname.split("/").filter(Boolean);

  // 1️⃣ Try exact matches first
  const exactMatch = ROUTE_TRAILS.find(
    (r) => r.exact && r.match === pathname
  );
  if (exactMatch) return exactMatch.trail;

  // 2️⃣ Then try prefix + segmentCount matches
  const prefixMatch = ROUTE_TRAILS.find((r) => {
    if (r.exact) return false;                                    // already checked
    if (!pathname.startsWith(r.match)) return false;
    if (r.segmentCount && r.segmentCount !== segments.length) return false;
    return true;
  });

  return prefixMatch?.trail ?? null;
}

export function resolveTrail(trail, dynamicLabels = {}) {
  const resolved = [];

  for (const crumb of trail) {
    if (crumb.dynamic) {
      const label = dynamicLabels[crumb.dynamic];
      if (!label) continue;
      resolved.push({ ...crumb, label });
    } else {
      resolved.push({ ...crumb });
    }
  }

  if (resolved.length > 0) {
    resolved.forEach((c) => delete c.isLast);
    resolved[resolved.length - 1].isLast = true;
  }

  return resolved;
}