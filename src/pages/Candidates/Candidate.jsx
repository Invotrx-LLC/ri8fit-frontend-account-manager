import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  TextField,
  MenuItem,
  Select,
  FormControl,
  CircularProgress,
  Alert,
  Switch,
  Tooltip,
  InputAdornment,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { PersonOutlineOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useLazyGetImportedCandidatesQuery,
  useLazySearchCandidatesQuery,
  useLazyGetResumeViewQuery, // ← NEW  (see api slice patch below)
  useUpdateCandidateActiveStatusMutation,
  useUploadCandidateResumeMutation,
} from "../../redux/services/requisition/requisition";
import ReusableMRT from "../../components/table/index";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import { useDeleteCandidateMutation } from "../../redux/services/candidates/candidate";
import CustomSelect from "../../components/Select";

/* ─── Design tokens ─────────────────────────────────────────────────────────── */
const C = {
  accent: "#FF5F1F",
  accentSoft: "#FFF0E8",
  accentBorder: "#FFCFB3",
  green: "#0F6E56",
  greenSoft: "#E7F8EE",
  border: "#E8E8EC",
  textPrimary: "#111118",
  textSecondary: "#5C5C70",
  textTertiary: "#9696A6",
};

const PAGE_SIZE = 100;
const SEARCH_DEBOUNCE_MS = 350;

const DOMAIN_OPTIONS = ["clinical"];
const FUNCTION_OPTIONS = ["biostatistics", "clinical_data_management"];
const SUB_FUNCTION_MAP = {
  biostatistics: ["statistical_programmer"],
  clinical_data_management: [
    "clinical_programmer",
    "crf_developer",
    "clinical_data_manager",
  ],
  clinical_operations: [
    "clinical_research_associate",
    "clinical_trial_manager",
    "site_coordinator",
  ],
  medical_writing: ["medical_writer", "regulatory_writer"],
  pharmacovigilance: ["safety_associate", "pv_specialist"],
  regulatory_affairs: ["regulatory_specialist", "submissions_manager"],
};

/* ════════════════════════════════════════════════════════════════════════════════
   RESUME VIEWER MODAL
   • Calls GET /acc/resume_view_by_input/?candidate_id=X
   • Response: { presigned_url: "https://s3..." } or { data: { presigned_url } }
   • Renders the PDF inside an <iframe>; also offers an "Open in new tab" link
════════════════════════════════════════════════════════════════════════════════ */
function ResumeViewerModal({ open, onClose, candidateId, candidateName }) {
  const [fetchResume, { isFetching }] = useLazyGetResumeViewQuery();
  const [presignedUrl, setPresignedUrl] = useState(null);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!open || !candidateId) return;
    setPresignedUrl(null);
    setFetchError(false);

    fetchResume(candidateId, false)
      .unwrap()
      .then((result) => {
        const url =
          result?.resume_url ?? // ← your actual backend key
          result?.presigned_url ??
          result?.data?.resume_url ??
          result?.data?.presigned_url ??
          result?.url ??
          null;

        if (url) {
          window.open(url, "_blank", "noopener,noreferrer");
          onClose(); // close the modal immediately — no iframe needed
        } else {
          setFetchError(true);
        }
      })
      .catch(() => setFetchError(true));
  }, [open, candidateId]); // eslint-disable-line

  const handleClose = () => {
    setPresignedUrl(null);
    setFetchError(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          height: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      {/* ── Header ── */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: "20px",
          py: "14px",
          borderBottom: `1px solid ${C.border}`,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "8px",
              backgroundColor: C.accentSoft,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DescriptionOutlinedIcon sx={{ fontSize: 18, color: C.accent }} />
          </Box>
          <Box>
            <Typography fontSize={14} fontWeight={700} color={C.textPrimary}>
              Resume
            </Typography>
            {candidateName && (
              <Typography fontSize={11} color={C.textSecondary}>
                {candidateName}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {presignedUrl && (
            <Button
              size="small"
              variant="outlined"
              href={presignedUrl}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: 12,
                borderColor: C.accent,
                color: C.accent,
                borderRadius: "8px",
                "&:hover": {
                  backgroundColor: C.accentSoft,
                  borderColor: C.accent,
                },
              }}
            >
              Open in new tab
            </Button>
          )}
          <IconButton
            size="small"
            onClick={handleClose}
            sx={{ color: "#9CA3AF", "&:hover": { backgroundColor: "#F3F4F6" } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* ── Body ── */}
      <DialogContent
        sx={{
          p: 0,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {isFetching ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <CircularProgress sx={{ color: C.accent }} />
            <Typography fontSize={13} color={C.textSecondary}>
              Opening resume…
            </Typography>
          </Box>
        ) : fetchError ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
            }}
          >
            <DescriptionOutlinedIcon sx={{ fontSize: 48, color: "#D1D5DB" }} />
            <Typography fontSize={14} fontWeight={600} color={C.textPrimary}>
              Could not load resume
            </Typography>
            <Typography fontSize={12} color={C.textSecondary}>
              The file may have expired or is unavailable.
            </Typography>
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

/* ════════════════════════════════════════════════════════════════════════════════
   VIEW TOGGLE
════════════════════════════════════════════════════════════════════════════════ */
function ViewToggle({ view, onChange }) {
  const btn = (val, Icon, tip) => (
    <Tooltip title={tip} arrow>
      <IconButton
        size="small"
        onClick={() => onChange(val)}
        sx={{
          borderRadius: "7px",
          width: 30,
          height: 30,
          backgroundColor: view === val ? C.accent : "transparent",
          color: view === val ? "#fff" : "#9CA3AF",
          "&:hover": { backgroundColor: view === val ? C.accent : "#F3F4F6" },
          transition: "all 0.15s",
        }}
      >
        <Icon sx={{ fontSize: 16 }} />
      </IconButton>
    </Tooltip>
  );
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
        border: `1px solid ${C.border}`,
        borderRadius: "9px",
        p: "3px",
        backgroundColor: "#F9FAFB",
      }}
    >
      {btn("grid", GridViewIcon, "Grid view")}
      {btn("list", ViewListIcon, "List view")}
    </Box>
  );
}

/* ════════════════════════════════════════════════════════════════════════════════
   MRT COLUMNS (list view)
   Resume cell calls the presigned URL API via the passed openResume callback.
════════════════════════════════════════════════════════════════════════════════ */
function buildColumns(handleToggleActive, navigate, openResume, onDelete) {
  return [
    {
      accessorKey: "full_name",
      header: "Name",
      size: 220,
      Cell: ({ row }) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              fontSize: 12,
              fontWeight: 700,
              bgcolor: row.original.is_active ? C.accent : "#9CA3AF",
              flexShrink: 0,
            }}
          >
            {row.original.full_name
              ?.split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")
              .toUpperCase() ?? "?"}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 600,
                color: C.textPrimary,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {row.original.full_name}
              
            </Typography>
            <Typography
              sx={{
                fontSize: 11,
                color: C.textSecondary,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {row.original.email}
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
        <Typography sx={{ fontSize: 12, color: C.textSecondary }}>
          {cell.getValue() ?? "—"}
        </Typography>
      ),
    },
    {
      accessorKey:"clin_id",
      header:"Clin ID",
      size: 120,
      Cell: ({ cell }) => (
        <Typography sx={{ fontSize: 12, color: C.textSecondary }}>
          {cell.getValue() ?? "—"}
        </Typography>
      ),
    },
    {
      accessorKey: "domain",
      header: "Domain",
      size: 120,
      Cell: ({ cell }) => (
        <Typography
          sx={{
            fontSize: 12,
            color: C.textSecondary,
            textTransform: "capitalize",
          }}
        >
          {cell.getValue() ?? "—"}
        </Typography>
      ),
    },
    {
      accessorKey: "function",
      header: "Function",
      size: 190,
      Cell: ({ cell }) =>
        cell.getValue() ? (
          <Chip
            label={cell.getValue().replace(/_/g, " ")}
            size="small"
            sx={{
              fontSize: 11,
              fontFamily: "Helvetica",
              height: 20,
              textTransform: "capitalize",
              backgroundColor: "#EEF2FF",
              color: "#4338CA",
              "& .MuiChip-label": { px: "8px" },
            }}
          />
        ) : (
          <Typography sx={{ fontSize: 12, color: C.textTertiary }}>
            —
          </Typography>
        ),
    },
    {
      accessorKey: "sub_function",
      header: "Sub-function",
      size: 180,
      Cell: ({ cell }) =>
        cell.getValue() ? (
          <Chip
            label={cell.getValue().replace(/_/g, " ")}
            size="small"
            sx={{
              fontSize: 11,
              fontFamily: "Helvetica",
              height: 20,
              textTransform: "capitalize",
              backgroundColor: "#F3F4F6",
              color: C.textSecondary,
              "& .MuiChip-label": { px: "8px" },
            }}
          />
        ) : (
          <Typography sx={{ fontSize: 12, color: C.textTertiary }}>
            —
          </Typography>
        ),
    },
    {
      accessorKey: "resume_url",
      header: "Resume",
      size: 100,
      enableColumnFilter: false,
      Cell: ({ row }) =>
        row.original.resume_url ? (
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              openResume(row.original.candidate_id, row.original.full_name);
            }}
            startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 13 }} />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: 11,
              borderColor: C.accent,
              color: C.accent,
              borderRadius: "7px",
              px: "10px",
              py: "3px",
              minWidth: "auto",
              "&:hover": {
                backgroundColor: C.accentSoft,
                borderColor: C.accent,
              },
            }}
          >
            View
          </Button>
        ) : (
          <Typography sx={{ fontSize: 11, color: C.textTertiary }}>
            —
          </Typography>
        ),
    },
    {
      id: "status",
      header: "Status",
      size: 160,
      enableColumnFilter: false,

      Cell: ({ row }) => {
        const candidate = row.original;
        const active = candidate.is_active;

        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {/* Status Badge */}
            <Box
              component="span"
              sx={{
                fontSize: 10,
                fontWeight: 700,
                px: "8px",
                py: "3px",
                borderRadius: "10px",
                backgroundColor: active ? C.greenSoft : "#F3F4F6",
                color: active ? C.green : "#6B7280",
                minWidth: "64px",
                textAlign: "center",
              }}
            >
              {active ? "Active" : "Inactive"}
            </Box>

            {/* Toggle */}
            <ActiveToggleCell
              candidate={candidate}
              onStatusChange={handleToggleActive}
            />
          </Box>
        );
      },
    },
    {
      id: "delete",
      header: "Delete",
      size: 90,
      enableColumnFilter: false,

      Cell: ({ row }) => (
        <Tooltip title="Delete Candidate">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onDelete(row.original);
            }}
            sx={{
              width: 34,
              height: 34,
              borderRadius: "10px",
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#E5541B",

              "&:hover": {
                backgroundColor: "#FEE2E2",
              },
            }}
          >
            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      ),
    },
  ];
}

/* ── Inline active toggle (own optimistic state) ── */
function ActiveToggleCell({ candidate, onStatusChange }) {
  const [localActive, setLocalActive] = useState(candidate.is_active);
  const [updateStatus, { isLoading }] =
    useUpdateCandidateActiveStatusMutation();

  const handleToggle = async (e) => {
    e.stopPropagation();
    const next = !localActive;
    setLocalActive(next);
    onStatusChange(candidate.candidate_id, next);
    try {
      await updateStatus({
        candidate_id: candidate.candidate_id,
        is_active: next,
      }).unwrap();
    } catch {
      setLocalActive(!next);
      onStatusChange(candidate.candidate_id, !next);
    }
  };

  return isLoading ? (
    <CircularProgress size={16} sx={{ color: C.accent }} />
  ) : (
    <Switch
      checked={localActive}
      onChange={handleToggle}
      size="small"
      onClick={(e) => e.stopPropagation()}
      sx={{
        "& .MuiSwitch-switchBase.Mui-checked": { color: C.accent },
        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
          backgroundColor: C.accent,
        },
      }}
    />
  );
}

/* ════════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════════════════════ */
export default function CandidatesPage() {
  const navigate = useNavigate();

  /* ── View ── */
  const [view, setView] = useState("list");

  /* ── Search ── */
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchMode = debouncedSearch.trim().length > 0;

  /* ── Browse filters ── */
  const [domain, setDomain] = useState("");
  const [func, setFunc] = useState("");
  const [subFunc, setSubFunc] = useState("");

  /* ── Active filter (client-side) ── */
  const [activeOnly, setActiveOnly] = useState(null);

  /* ── Browse pagination ── */
  const [nextCursor, setNextCursor] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [browseError, setBrowseError] = useState(false);

  /* ── Search state ── */
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);

  /* ── Resume modal ── */
  const [resumeModal, setResumeModal] = useState({
    open: false,
    candidateId: null,
    candidateName: null,
  });

  /* ── Upload dialog ── */
  const [openAddCandidate, setOpenAddCandidate] = useState(false);
  const [candidateForm, setCandidateForm] = useState({
    domain: "",
    function: "",
    sub_function: "",
    availability: "",
    resume: null,
  });

  /* ── RTK hooks ── */
  const [triggerBrowse, { isFetching: isBrowsing }] =
    useLazyGetImportedCandidatesQuery();
  const [triggerSearch] = useLazySearchCandidatesQuery();
  const [uploadCandidateResume, { isLoading: uploading }] =
    useUploadCandidateResumeMutation();
  const searchTimer = useRef(null);

  /* ── Open resume modal ── */
  const openResume = useCallback((candidateId, candidateName) => {
    setResumeModal({ open: true, candidateId, candidateName });
  }, []);

  /* ── Browse: core fetch ── */
  const loadPage = useCallback(
    async ({ domain: d, func: f, subFunc: sf, cursor }) => {
      setBrowseError(false);
      try {
        const params = {
          limit: PAGE_SIZE,
          ...(d && { domain: d }),
          ...(f && { function: f }),
          ...(sf && { sub_function: sf }),
          ...(cursor && {
            cursor_created_at: cursor.cursor_created_at,
            cursor_id: cursor.cursor_id,
          }),
        };
        const result = await triggerBrowse(params, false).unwrap();
        const newRows = result?.data ?? [];
        const newCursor = result?.next_cursor ?? false;

        if (!cursor) {
          setCandidates(newRows);
          setIsFirstLoad(false);
        } else {
          setCandidates((prev) => {
            const seen = new Set(prev.map((c) => c.candidate_id));
            return [
              ...prev,
              ...newRows.filter((c) => !seen.has(c.candidate_id)),
            ];
          });
        }
        setNextCursor(newCursor);
      } catch {
        setBrowseError(true);
        setIsFirstLoad(false);
      }
    },
    [triggerBrowse],
  );
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    candidateId: null,
    candidateName: "",
  });

  const [deleteCandidate, { isLoading: deletingCandidate }] =
    useDeleteCandidateMutation();
  /* ─────────────────────────────────────────────
   DELETE CANDIDATE
───────────────────────────────────────────── */

  const handleOpenDelete = (candidate) => {
    setDeleteModal({
      open: true,
      candidateId: candidate.candidate_id,
      candidateName: candidate.full_name,
    });
  };

  const handleCloseDelete = () => {
    setDeleteModal({
      open: false,
      candidateId: null,
      candidateName: "",
    });
  };

  const handleDeleteCandidate = async () => {
    try {
      await deleteCandidate({
        candidate_id: deleteModal.candidateId,
        confirmation_text: "DELETE",
      }).unwrap();

      toast.success("Candidate deleted successfully");

      // remove from browse data
      setCandidates((prev) =>
        prev.filter((item) => item.candidate_id !== deleteModal.candidateId),
      );

      // remove from search data
      setSearchResults((prev) =>
        prev.filter((item) => item.candidate_id !== deleteModal.candidateId),
      );

      handleCloseDelete();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete candidate");
    }
  };

  /* ── Mount ── */
  useEffect(() => {
    loadPage({ domain: "", func: "", subFunc: "", cursor: null });
  }, []); // eslint-disable-line

  /* ── Filter changes ── */
  const prevFilters = useRef({ domain, func, subFunc });
  useEffect(() => {
    if (searchMode) return;
    const p = prevFilters.current;
    if (p.domain === domain && p.func === func && p.subFunc === subFunc) return;
    prevFilters.current = { domain, func, subFunc };
    setCandidates([]);
    setNextCursor(null);
    setIsFirstLoad(true);
    loadPage({ domain, func, subFunc, cursor: null });
  }, [domain, func, subFunc, searchMode, loadPage]);

  const handleShowMore = () => {
    if (!nextCursor || nextCursor === false || isBrowsing) return;
    loadPage({ domain, func, subFunc, cursor: nextCursor });
  };

  /* ── Search ── */
  const runSearch = useCallback(
    async (query) => {
      if (!query.trim()) return;
      setIsSearching(true);
      setSearchError(false);
      try {
        const result = await triggerSearch(query, false).unwrap();
        setSearchResults(Array.isArray(result) ? result : (result?.data ?? []));
      } catch {
        setSearchError(true);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [triggerSearch],
  );

  const handleSearchChange = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    if (!val.trim()) {
      setDebouncedSearch("");
      setSearchResults([]);
      return;
    }
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(val);
      runSearch(val);
    }, SEARCH_DEBOUNCE_MS);
  };

  const clearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
    setSearchResults([]);
    clearTimeout(searchTimer.current);
  };

  /* ── Filter handlers ── */
  const handleDomainChange = (v) => {
    setDomain(v);
    setFunc("");
    setSubFunc("");
  };
  const handleFuncChange = (v) => {
    setFunc(v);
    setSubFunc("");
  };
  const handleSubFuncChange = (v) => setSubFunc(v);
  const clearFilters = () => {
    setDomain("");
    setFunc("");
    setSubFunc("");
  };

  /* ── Optimistic status toggle ── */
  const handleStatusChange = useCallback((candidateId, newStatus) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.candidate_id === candidateId ? { ...c, is_active: newStatus } : c,
      ),
    );
    setSearchResults((prev) =>
      prev.map((c) =>
        c.candidate_id === candidateId ? { ...c, is_active: newStatus } : c,
      ),
    );
  }, []);

  /* ── Derived ── */
  const sourceList = searchMode ? searchResults : candidates;
  const displayed = useMemo(
    () =>
      activeOnly === null
        ? sourceList
        : sourceList.filter((c) => c.is_active === activeOnly),
    [sourceList, activeOnly],
  );
  const activeCount = useMemo(
    () => sourceList.filter((c) => c.is_active).length,
    [sourceList],
  );
  const inactiveCount = useMemo(
    () => sourceList.filter((c) => !c.is_active).length,
    [sourceList],
  );
  const hasFilters = domain || func || subFunc;
  const showMoreAvailable = !searchMode && nextCursor && nextCursor !== false;
  const isBusy = searchMode ? isSearching : isFirstLoad && isBrowsing;

  const columns = useMemo(
    () =>
      buildColumns(handleStatusChange, navigate, openResume, handleOpenDelete),
    [handleStatusChange, navigate, openResume],
  );

  /* ── Upload ── */
  const handleUploadSubmit = async () => {
    try {
      if (!candidateForm.availability?.trim()) {
        toast.error("Availability is required");
        return;
      }
      if (!candidateForm.resume) {
        toast.error("Resume is required");
        return;
      }
      const fd = new FormData();
      fd.append("availability", candidateForm.availability);
      fd.append("domain", candidateForm.domain);
      fd.append("function", candidateForm.function);
      fd.append("sub_function", candidateForm.sub_function);
      fd.append("resume", candidateForm.resume);
      await uploadCandidateResume(fd).unwrap();
      toast.success("Candidate uploaded successfully");
      setOpenAddCandidate(false);
      setCandidateForm({
        domain: "",
        function: "",
        sub_function: "",
        availability: "",
        resume: null,
      });
      setCandidates([]);
      setNextCursor(null);
      setIsFirstLoad(true);
      loadPage({ domain, func, subFunc, cursor: null });
    } catch (err) {
      toast.error(
        err?.data?.detail?.[0]?.msg || err?.data?.message || "Failed to upload",
      );
    }
  };

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <Box sx={{ p: 1, height: "100%" }}>
      {/* ══════════════════════════════════════════════════════
          TOOLBAR  — single row, all items baseline-aligned
      ══════════════════════════════════════════════════════ */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          mb: "14px",
          flexWrap: "nowrap",
          minHeight: 40,
          // border:1
        }}
      >
        {/* ── Search ── */}
        <TextField
          size="small"
          placeholder="Search.."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          sx={{
            width: 100,
            flexShrink: 0,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              fontSize: 12,
              height: 36,
            },
          }}
          slotProps={{ input: {
            startAdornment: (
              <InputAdornment position="start">
                {isSearching ? (
                  <CircularProgress size={13} sx={{ color: C.accent }} />
                ) : (
                  <SearchIcon
                    sx={{
                      fontSize: 15,
                      color: searchMode ? "#6366F1" : C.textTertiary,
                    }}
                  />
                )}
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={clearSearch}
                  sx={{ p: "1px" }}
                >
                  <CloseIcon sx={{ fontSize: 13, color: C.textTertiary }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          } }}
        />

        {/* Search mode pill */}
        {searchMode && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              px: "8px",
              py: "4px",
              borderRadius: "6px",
              backgroundColor: "#EEF2FF",
              border: "1px solid #C7D2FE",
              flexShrink: 0,
              height: 28,
            }}
          >
            <Box
              sx={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                backgroundColor: "#6366F1",
              }}
            />
            <Typography
              fontSize={10}
              fontWeight={700}
              color="#4338CA"
              sx={{ whiteSpace: "nowrap" }}
            >
              Search
            </Typography>
            <CloseIcon
              onClick={clearSearch}
              sx={{
                fontSize: 11,
                color: "#6366F1",
                cursor: "pointer",
                ml: "1px",
              }}
            />
          </Box>
        )}

        <Divider orientation="vertical" flexItem sx={{ mx: "2px" }} />

        {/* ── Browse filters — dimmed in search mode ── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            opacity: searchMode ? 0.4 : 1,
            pointerEvents: searchMode ? "none" : "auto",
            transition: "opacity 0.2s",
            flexShrink: 0,
          }}
        >
          {/* <FilterListIcon sx={{ fontSize: 14, color: C.textTertiary }} /> */}

          {/* Domain */}
          <CustomSelect
            value={domain}
            onChange={handleDomainChange}
            options={DOMAIN_OPTIONS}
            placeholder="Domain"
            width={120}
            height={180}
          />

          {/* Function */}
          <CustomSelect
            value={func}
            onChange={handleFuncChange}
            options={FUNCTION_OPTIONS}
            placeholder="Function"
            width={140}
            height={180}
          />

          {/* Sub-function */}
          <CustomSelect
            value={subFunc}
            onChange={handleSubFuncChange}
            options={SUB_FUNCTION_MAP[func] ?? []}
            placeholder="Sub Function"
            width={160}
            height={180}
            disabled={!func}
          />

          {/* Applied chips */}
          {domain && (
            <Chip
              label={domain.replace(/_/g, " ")}
              size="small"
              onDelete={() => handleDomainChange("")}
              sx={{
                fontSize: 11,
                height: 22,
                textTransform: "capitalize",
                backgroundColor: C.accentSoft,
                color: C.accent,
                "& .MuiChip-deleteIcon": { fontSize: 13, color: C.accent },
              }}
            />
          )}
          {func && (
            <Chip
              label={func.replace(/_/g, " ")}
              size="small"
              onDelete={() => handleFuncChange("")}
              sx={{
                fontSize: 10,
                height: 22,
                textTransform: "capitalize",
                backgroundColor: C.accentSoft,
                color: C.accent,
                "& .MuiChip-deleteIcon": { fontSize: 13, color: C.accent },
              }}
            />
          )}
          {subFunc && (
            <Chip
              label={subFunc.replace(/_/g, " ")}
              size="small"
              onDelete={() => handleSubFuncChange("")}
              sx={{
                fontSize: 10,
                height: 22,
                textTransform: "capitalize",
                backgroundColor: C.accentSoft,
                color: C.accent,
                "& .MuiChip-deleteIcon": { fontSize: 13, color: C.accent },
              }}
            />
          )}

          {hasFilters && (
            <Box
              onClick={clearFilters}
              sx={{
                fontSize: 11,
                color: C.accent,
                cursor: "pointer",
                fontWeight: 600,
                whiteSpace: "nowrap",
                "&:hover": { textDecoration: "underline" },
                flexShrink: 0,
              }}
            >
              Clear
            </Box>
          )}
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mx: "2px" }} />

        {/* ── Active / Inactive pills ── */}
        <Box sx={{ display: "flex", gap: "4px", flexShrink: 0 }}>
          {[
            { label: "All", value: null },
            { label: "Active", value: true },
            { label: "Inactive", value: false },
          ].map(({ label, value }) => (
            <Box
              key={String(value)}
              onClick={() => setActiveOnly(value)}
              sx={{
                px: "9px",
                py: "0px",
                height: 28,
                borderRadius: "7px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                fontSize: 11,
                fontFamily: "Helvetica",
                fontWeight: 600,
                border: "1px solid",
                whiteSpace: "nowrap",
                borderColor: activeOnly === value ? C.accent : C.border,
                backgroundColor:
                  activeOnly === value ? C.accentSoft : "#F9FAFB",
                color: activeOnly === value ? C.accent : C.textSecondary,
                transition: "all 0.15s",
                "&:hover": {
                  borderColor: C.accent,
                  color: C.accent,
                  backgroundColor: C.accentSoft,
                },
              }}
            >
              {label}
              {value === true && activeCount > 0 && (
                <Box
                  component="span"
                  sx={{ ml: "3px", fontSize: 10, opacity: 0.8 }}
                >
                  ({activeCount})
                </Box>
              )}
              {value === false && inactiveCount > 0 && (
                <Box
                  component="span"
                  sx={{ ml: "3px", fontSize: 10, opacity: 0.8 }}
                >
                  ({inactiveCount})
                </Box>
              )}
            </Box>
          ))}
        </Box>

        {/* ── Spacer ── */}
        <Box sx={{ flex: 1 }} />

        {/* ── Right actions ── */}
        <ViewToggle view={view} onChange={setView} />

        <Button
          variant="contained"
          onClick={() => setOpenAddCandidate(true)}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            px: "14px",
            height: 36,
            fontSize: 12,
            fontWeight: 600,
            backgroundColor: C.accent,
            boxShadow: "none",
            whiteSpace: "nowrap",
            flexShrink: 0,
            "&:hover": { backgroundColor: "#E5541B", boxShadow: "none" },
          }}
        >
          + Add Candidate
        </Button>
      </Box>

      {/* ════════════════════════════════════════
          CONTENT
      ════════════════════════════════════════ */}
      {isBusy ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 10,
            gap: 2,
          }}
        >
          <CircularProgress sx={{ color: C.accent }} />
          <Typography fontSize={13} color={C.textSecondary}>
            {searchMode
              ? `Searching for "${debouncedSearch}"…`
              : "Loading candidates…"}
          </Typography>
        </Box>
      ) : (searchMode ? searchError : browseError) && displayed.length === 0 ? (
        <Alert severity="error" sx={{ borderRadius: "10px" }}>
          {searchMode
            ? "Search failed. Please try again."
            : "Failed to load candidates. Please try again."}
        </Alert>
      ) : displayed.length === 0 && !isBusy ? (
        <Box
          sx={{
            textAlign: "center",
            py: 10,
            border: `1px solid ${C.border}`,
            borderRadius: "12px",
            backgroundColor: "#fff",
          }}
        >
          <PersonOutlineOutlined
            sx={{ fontSize: 42, color: C.textTertiary, mb: 1.5 }}
          />
          <Typography fontSize={15} fontWeight={600} color={C.textPrimary}>
            {searchMode
              ? `No results for "${debouncedSearch}"`
              : "No candidates found"}
          </Typography>
          <Typography fontSize={13} color={C.textSecondary} mt={0.5}>
            {searchMode
              ? "Try a different name or email."
              : "Try adjusting your filters."}
          </Typography>
          {searchMode && (
            <Button
              onClick={clearSearch}
              size="small"
              sx={{
                mt: 1.5,
                textTransform: "none",
                color: C.accent,
                fontWeight: 600,
              }}
            >
              Back to browse
            </Button>
          )}
        </Box>
      ) : view === "list" ? (
        /* ─── LIST VIEW ─── */
        <Box
          sx={{
            border: `1px solid ${C.border}`,
            borderRadius: "12px",
            overflow: "hidden",
            backgroundColor: "#fff",
          }}
        >
          <ReusableMRT
            data={displayed}
            columnData={columns}
            enableRowActions={false}
            enableRowSelection={false}
            enableGlobalFilter={false}
            enableColumnFilters
            height="calc(100vh - 190px)"
            onRowClick={(row) =>
              navigate(`/account-manager/candidates/${row.candidate_id}`)
            }
          />

          {/* ── Unified smart footer ── */}
          <Box
            sx={{
              borderTop: `1px solid ${C.border}`,
              px: "20px",
              py: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#FAFAFA",
            }}
          >
            {/* Left: count info */}
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  backgroundColor:
                    !searchMode && nextCursor === false ? C.green : C.accent,
                  boxShadow:
                    !searchMode && nextCursor === false
                      ? `0 0 0 3px rgba(15,110,86,0.15)`
                      : `0 0 0 3px rgba(255,95,31,0.15)`,
                }}
              />
              <Typography fontSize={12} color={C.textSecondary}>
                {searchMode ? (
                  <>
                    <Box
                      component="span"
                      sx={{ fontWeight: 700, color: C.textPrimary }}
                    >
                      {displayed.length}
                    </Box>{" "}
                    result{displayed.length !== 1 ? "s" : ""} for &ldquo;
                    {debouncedSearch}&rdquo;
                  </>
                ) : (
                  <>
                    <Box
                      component="span"
                      sx={{ fontWeight: 700, color: C.textPrimary }}
                    >
                      {candidates.length}
                    </Box>{" "}
                    candidates loaded
                    {activeOnly !== null &&
                      displayed.length !== candidates.length && (
                        <>
                          {" · "}
                          <Box
                            component="span"
                            sx={{ fontWeight: 700, color: C.textPrimary }}
                          >
                            {displayed.length}
                          </Box>
                          {" shown"}
                        </>
                      )}
                  </>
                )}
              </Typography>

              {/* All loaded pill */}
              {!searchMode && nextCursor === false && candidates.length > 0 && (
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    px: "8px",
                    py: "2px",
                    borderRadius: "20px",
                    backgroundColor: "#F0FDF4",
                    border: "1px solid #BBF7D0",
                  }}
                >
                  <Box
                    sx={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      backgroundColor: C.green,
                    }}
                  />
                  <Typography
                    fontSize={10}
                    fontWeight={700}
                    color={C.green}
                    sx={{ letterSpacing: "0.02em" }}
                  >
                    All loaded
                  </Typography>
                </Box>
              )}

              {/* Back to browse in search mode */}
              {searchMode && (
                <Box
                  onClick={clearSearch}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    px: "8px",
                    py: "2px",
                    borderRadius: "20px",
                    backgroundColor: "#EEF2FF",
                    border: "1px solid #C7D2FE",
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#E0E7FF" },
                  }}
                >
                  <Typography fontSize={10} fontWeight={700} color="#4338CA">
                    ← Browse all
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Right: load more */}
            {showMoreAvailable && (
              <Button
                size="small"
                onClick={handleShowMore}
                disabled={isBrowsing}
                startIcon={
                  isBrowsing ? (
                    <CircularProgress size={11} sx={{ color: "#fff" }} />
                  ) : (
                    <ExpandMoreIcon sx={{ fontSize: 15 }} />
                  )
                }
                sx={{
                  textTransform: "none",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#fff",
                  backgroundColor: C.accent,
                  borderRadius: "8px",
                  px: "16px",
                  height: 32,
                  boxShadow: "0 2px 8px rgba(255,95,31,0.25)",
                  "&:hover": {
                    backgroundColor: "#E5541B",
                    boxShadow: "0 4px 12px rgba(255,95,31,0.35)",
                  },
                  "&:disabled": {
                    backgroundColor: "#FFCFB3",
                    color: "#fff",
                    boxShadow: "none",
                  },
                }}
              >
                {isBrowsing ? "Loading…" : `Load next ${PAGE_SIZE}`}
              </Button>
            )}
          </Box>
        </Box>
      ) : (
        /* ─── GRID VIEW ─── */
        <>
          <Grid container spacing={2}>
            {displayed.map((candidate) => (
              <Grid
                size={{ xs: 12, sm: 6, md: 4, xl: 3 }}
                key={candidate.candidate_id}
              >
                <CandidateCard
                  candidate={candidate}
                  onStatusChange={handleStatusChange}
                  onViewResume={openResume}
                  onDelete={handleOpenDelete}
                />
              </Grid>
            ))}

            {/* Skeleton cards while loading */}
            {isBrowsing &&
              !searchMode &&
              candidates.length > 0 &&
              Array.from({ length: 4 }).map((_, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, xl: 3 }} key={`sk-${i}`}>
                  <Box
                    sx={{
                      borderRadius: "12px",
                      border: `1px solid ${C.border}`,
                      height: 178,
                      backgroundColor: "#F9FAFB",
                      animation: "pulse 1.4s ease-in-out infinite",
                      "@keyframes pulse": {
                        "0%,100%": { opacity: 1 },
                        "50%": { opacity: 0.4 },
                      },
                    }}
                  />
                </Grid>
              ))}
          </Grid>

          {/* Grid footer */}
          <Box
            sx={{
              mt: "28px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Typography fontSize={12} color={C.textSecondary}>
              {searchMode ? (
                <>
                  {displayed.length} result{displayed.length !== 1 ? "s" : ""}{" "}
                  for <strong>"{debouncedSearch}"</strong>
                </>
              ) : (
                <>
                  Showing <strong>{displayed.length}</strong> candidates
                  {activeOnly !== null &&
                    candidates.length !== displayed.length && (
                      <Box component="span" sx={{ color: C.textTertiary }}>
                        {" "}
                        · {candidates.length} total loaded
                      </Box>
                    )}
                </>
              )}
            </Typography>

            {showMoreAvailable && (
              <Button
                variant="outlined"
                onClick={handleShowMore}
                disabled={isBrowsing}
                startIcon={
                  isBrowsing ? (
                    <CircularProgress size={14} sx={{ color: C.accent }} />
                  ) : (
                    <ExpandMoreIcon sx={{ fontSize: 18 }} />
                  )
                }
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 13,
                  borderColor: C.accent,
                  color: C.accent,
                  borderRadius: "10px",
                  px: "28px",
                  py: "9px",
                  "&:hover": {
                    backgroundColor: C.accentSoft,
                    borderColor: C.accent,
                  },
                  "&:disabled": {
                    borderColor: C.border,
                    color: C.textTertiary,
                  },
                }}
              >
                {isBrowsing
                  ? "Loading…"
                  : `Show more · next ${PAGE_SIZE} candidates`}
              </Button>
            )}

            {!searchMode && nextCursor === false && candidates.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: "20px",
                  py: "8px",
                  borderRadius: "20px",
                  backgroundColor: "#F9FAFB",
                  border: `1px solid ${C.border}`,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: C.green,
                  }}
                />
                <Typography fontSize={12} color={C.textSecondary}>
                  All candidates loaded · {candidates.length} total
                </Typography>
              </Box>
            )}

            {searchMode && (
              <Button
                onClick={clearSearch}
                size="small"
                sx={{
                  textTransform: "none",
                  color: C.accent,
                  fontWeight: 600,
                  fontSize: 12,
                }}
              >
                ← Back to browse
              </Button>
            )}
          </Box>
        </>
      )}

      {/* ── Resume Viewer Modal ── */}
      <ResumeViewerModal
        open={resumeModal.open}
        onClose={() =>
          setResumeModal({
            open: false,
            candidateId: null,
            candidateName: null,
          })
        }
        candidateId={resumeModal.candidateId}
        candidateName={resumeModal.candidateName}
      />

      {/* ── Add Candidate Dialog ── */}
      <Dialog
        open={openAddCandidate}
        onClose={() => setOpenAddCandidate(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "24px", p: 1 } }}
      >
        <DialogTitle
          sx={{ fontWeight: 700, fontSize: 20, color: C.textPrimary, pb: 1 }}
        >
          Add Candidate
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <FormControl fullWidth size="small">
              <Select
                value={candidateForm.domain}
                displayEmpty
                renderValue={(v) =>
                  v ? v.replace(/_/g, " ") : "Select Domain"
                }
                onChange={(e) =>
                  setCandidateForm({ ...candidateForm, domain: e.target.value })
                }
              >
                {DOMAIN_OPTIONS.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d.replace(/_/g, " ")}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <Select
                value={candidateForm.function}
                displayEmpty
                renderValue={(v) =>
                  v ? v.replace(/_/g, " ") : "Select Function"
                }
                onChange={(e) =>
                  setCandidateForm({
                    ...candidateForm,
                    function: e.target.value,
                    sub_function: "",
                  })
                }
              >
                {FUNCTION_OPTIONS.map((f) => (
                  <MenuItem key={f} value={f}>
                    {f.replace(/_/g, " ")}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl
              fullWidth
              size="small"
              disabled={!candidateForm.function}
            >
              <Select
                value={candidateForm.sub_function}
                displayEmpty
                renderValue={(v) =>
                  v ? v.replace(/_/g, " ") : "Select Sub-function"
                }
                onChange={(e) =>
                  setCandidateForm({
                    ...candidateForm,
                    sub_function: e.target.value,
                  })
                }
              >
                {(SUB_FUNCTION_MAP[candidateForm.function] ?? []).map((s) => (
                  <MenuItem key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Availability (days)"
              required
              fullWidth
              size="small"
              value={candidateForm.availability}
              onChange={(e) =>
                setCandidateForm({
                  ...candidateForm,
                  availability: e.target.value,
                })
              }
            />
            <Box
              sx={{
                border: `2px dashed ${C.border}`,
                borderRadius: "16px",
                py: 4,
                px: 2,
                textAlign: "center",
                backgroundColor: "#FAFAFA",
              }}
            >
              <Button
                component="label"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  width: "100%",
                  textTransform: "none",
                  color: C.textPrimary,
                }}
              >
                <CloudUploadOutlinedIcon
                  sx={{ fontSize: 40, color: C.accent }}
                />
                <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                  Browse Resume Here
                </Typography>
                <Typography sx={{ fontSize: 12, color: C.textSecondary }}>
                  PDF, DOC, DOCX supported
                </Typography>
                <input
                  hidden
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) =>
                    setCandidateForm({
                      ...candidateForm,
                      resume: e.target.files[0],
                    })
                  }
                />
              </Button>
              {candidateForm.resume && (
                <Typography
                  sx={{ mt: 2, fontSize: 13, fontWeight: 600, color: C.accent }}
                >
                  {candidateForm.resume.name}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setOpenAddCandidate(false)}
            sx={{ textTransform: "none", color: "#666" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={uploading}
            onClick={handleUploadSubmit}
            sx={{
              textTransform: "none",
              borderRadius: "12px",
              backgroundColor: C.accent,
              px: 3,
              "&:hover": { backgroundColor: "#E5541B" },
            }}
          >
            {uploading ? "Uploading..." : "Add Candidate"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* ─────────────────────────────────────────────
   DELETE MODAL
───────────────────────────────────────────── */}

      <Dialog
        open={deleteModal.open}
        onClose={handleCloseDelete}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "24px",
            p: 1,
          },
        }}
      >
        <DialogContent
          sx={{
            pt: 4,
            pb: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              backgroundColor: "#FEF2F2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <WarningAmberRoundedIcon
              sx={{
                fontSize: 22,
                color: "#DC2626",
              }}
            />
          </Box>

          <Typography
            sx={{
              fontSize: 14,
              color: C.textSecondary,
              lineHeight: 1.7,
            }}
          >
            Are you sure you want to delete
            <Box
              component="span"
              sx={{
                fontWeight: 700,
                color: C.textPrimary,
              }}
            >
              {" "}
              {deleteModal.candidateName}
            </Box>
            ?
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            gap: 1,
          }}
        >
          <Button
            fullWidth
            onClick={handleCloseDelete}
            disabled={deletingCandidate}
            sx={{
              height: 44,
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
              color: C.textSecondary,
              border: `1px solid ${C.border}`,
            }}
          >
            No
          </Button>

          <Button
            fullWidth
            variant="contained"
            disabled={deletingCandidate}
            onClick={handleDeleteCandidate}
            sx={{
              height: 44,
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 700,
              backgroundColor: "#E5541B",
              boxShadow: "none",

              "&:hover": {
                backgroundColor: "#E5541B",
                boxShadow: "none",
              },
            }}
          >
            {deletingCandidate ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              "Yes, Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/* ════════════════════════════════════════════════════════════════════════════════
   CANDIDATE CARD (grid view) — resume button calls openResume
════════════════════════════════════════════════════════════════════════════════ */
function CandidateCard({ candidate, onStatusChange, onViewResume, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const [localActive, setLocalActive] = useState(candidate.is_active);
  const [updateStatus, { isLoading: updating }] =
    useUpdateCandidateActiveStatusMutation();
  const navigate = useNavigate();
  console.log("From Candidate",candidate.clin_id)
  const handleToggle = async (e) => {
    e.stopPropagation();
    const next = !localActive;
    setLocalActive(next);
    onStatusChange(candidate.candidate_id, next);
    try {
      await updateStatus({
        candidate_id: candidate.candidate_id,
        is_active: next,
      }).unwrap();
    } catch {
      setLocalActive(!next);
      onStatusChange(candidate.candidate_id, !next);
    }
  };

  const initials = candidate.full_name
    ? candidate.full_name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <Card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() =>
        navigate(`/account-manager/candidates/${candidate.candidate_id}`)
      }
      sx={{
        borderRadius: "12px",
        border: `1px solid ${hovered ? C.accent : C.border}`,
        boxShadow: hovered ? "0 0 0 3px rgba(255,95,31,0.07)" : "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        opacity: localActive ? 1 : 0.72,
        cursor: "pointer",
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
        {/* Header row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
            mb: "12px",
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              bgcolor: localActive ? C.accent : "#9CA3AF",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
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
              {candidate.full_name}
            </Typography>
              <Typography
              sx={{
                fontSize: 11}}>
                  {candidate.clin_id}
                </Typography>
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
          <Tooltip
            title={localActive ? "Mark inactive" : "Mark active"}
            placement="top"
          >
            <Box
              onClick={(e) => e.stopPropagation()}
              sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}
            >
              {updating ? (
                <CircularProgress size={16} sx={{ color: C.accent }} />
              ) : (
                <Switch
                  checked={localActive}
                  onChange={handleToggle}
                  size="small"
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: C.accent },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: C.accent,
                    },
                  }}
                />
              )}
            </Box>
          </Tooltip>
        </Box>

        <Divider sx={{ mb: "10px" }} />

        {/* Function chips */}
        <Box sx={{ display: "flex", gap: 0.6, mb: "10px", flexWrap: "wrap" }}>
          {candidate.function && (
            <Chip
              label={candidate.function.replace(/_/g, " ")}
              size="small"
              sx={{
                fontSize: 11,
                fontFamily: "Helvetica",
                height: 20,
                textTransform: "capitalize",
                backgroundColor: "#EEF2FF",
                color: "#4338CA",
                "& .MuiChip-label": { px: "8px" },
              }}
            />
          )}
          {candidate.sub_function && (
            <Chip
              label={candidate.sub_function.replace(/_/g, " ")}
              size="small"
              sx={{
                fontSize: 11,
                fontFamily: "Helvetica",
                height: 20,
                textTransform: "capitalize",
                backgroundColor: "#F3F4F6",
                color: C.textSecondary,
                "& .MuiChip-label": { px: "8px" },
              }}
            />
          )}
        </Box>

        {/* Info rows */}
        {[
          { label: "Phone", value: candidate.phone_number ?? "—" },
          { label: "Domain", value: candidate.domain ?? "—" },
        ].map(({ label, value }) => (
          <Box
            key={label}
            sx={{ display: "flex", justifyContent: "space-between", mb: "5px" }}
          >
            <Typography sx={{ fontSize: 11, color: C.textSecondary }}>
              {label}
            </Typography>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 500,
                color: C.textPrimary,
                textTransform: "capitalize",
              }}
            >
              {value}
            </Typography>
          </Box>
        ))}

        {/* Footer */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
            mt:"6px"
          }}
        >
          {/* RESUME */}
          {candidate.resume_url && (
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation();

                onViewResume(candidate.candidate_id, candidate.full_name);
              }}
              startIcon={<InsertDriveFileOutlinedIcon sx={{ fontSize: 13 }} />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: 11,
                borderColor: C.accent,
                color: C.accent,
                borderRadius: "7px",
                px: "10px",
                py: "3px",
                minWidth: "auto",

                "&:hover": {
                  backgroundColor: C.accentSoft,
                  borderColor: C.accent,
                },
              }}
            >
              Resume
            </Button>
          )}
          {/* DELETE */}
          <Tooltip title="Delete Candidate">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onDelete(candidate);
              }}
              sx={{
                width: 26,
                height: 26,
                borderRadius: "5px",
                backgroundColor: "#FEF2F2",
                border: "1px solid #FECACA",
                color: "#E5541B",

                "&:hover": {
                  backgroundColor: "#FEE2E2",
                },
              }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
}
/* ══════════════════════════════════════════════════════════
   ADD CANDIDATE DIALOG
══════════════════════════════════════════════════════════ */
function AddCandidateDialog({
  open,
  onClose,
  uploadMode,
  setUploadMode,
  candidateForm,
  setCandidateForm,
  uploading,
  onSubmit,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "24px", p: 1 } }}
    >
      <DialogTitle
        sx={{ fontWeight: 700, fontSize: 22, color: C.textPrimary, pb: 1 }}
      >
        Add Candidate
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3, mt: 1 }}>
          <Button
            variant="contained"
            sx={{
              textTransform: "none",
              borderRadius: "12px",
              px: 2.5,
              backgroundColor: C.accent,
              color: "#fff",
            }}
          >
            Add by Function
          </Button>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Domain</InputLabel>
            <Select
              value={candidateForm.domain}
              label="Domain"
              onChange={(e) =>
                setCandidateForm({ ...candidateForm, domain: e.target.value })
              }
            >
              {DOMAIN_OPTIONS.map((d) => (
                <MenuItem key={d} value={d}>
                  {d.replace(/_/g, " ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Function</InputLabel>
            <Select
              value={candidateForm.function}
              label="Function"
              onChange={(e) =>
                setCandidateForm({
                  ...candidateForm,
                  function: e.target.value,
                  sub_function: "",
                })
              }
            >
              {FUNCTION_OPTIONS.map((f) => (
                <MenuItem key={f} value={f}>
                  {f.replace(/_/g, " ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl
            fullWidth
            size="small"
            disabled={!candidateForm.function}
          >
            <InputLabel>Sub Function</InputLabel>
            <Select
              value={candidateForm.sub_function}
              label="Sub Function"
              onChange={(e) =>
                setCandidateForm({
                  ...candidateForm,
                  sub_function: e.target.value,
                })
              }
            >
              {(SUB_FUNCTION_MAP[candidateForm.function] ?? []).map((s) => (
                <MenuItem key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Availability"
            required
            fullWidth
            size="small"
            value={candidateForm.availability}
            onChange={(e) =>
              setCandidateForm({
                ...candidateForm,
                availability: e.target.value,
              })
            }
          />
          <Box
            sx={{
              border: `2px dashed ${C.border}`,
              borderRadius: "16px",
              py: 4,
              px: 2,
              textAlign: "center",
              backgroundColor: "#FAFAFA",
            }}
          >
            <Button
              component="label"
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                width: "100%",
                textTransform: "none",
                color: C.textPrimary,
              }}
            >
              <CloudUploadOutlinedIcon sx={{ fontSize: 42, color: C.accent }} />
              <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                Browse Resume Here
              </Typography>
              <Typography sx={{ fontSize: 12, color: C.textSecondary }}>
                PDF, DOC, DOCX supported
              </Typography>
              <input
                hidden
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) =>
                  setCandidateForm({
                    ...candidateForm,
                    resume: e.target.files[0],
                  })
                }
              />
            </Button>
            {candidateForm.resume && (
              <Typography
                sx={{ mt: 2, fontSize: 13, fontWeight: 600, color: C.accent }}
              >
                {candidateForm.resume.name}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} sx={{ textTransform: "none", color: "#666" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={uploading}
          onClick={onSubmit}
          sx={{
            textTransform: "none",
            borderRadius: "12px",
            backgroundColor: C.accent,
            px: 3,
            "&:hover": { backgroundColor: "#E5541B" },
          }}
        >
          {uploading ? "Uploading..." : "Add Candidate"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
