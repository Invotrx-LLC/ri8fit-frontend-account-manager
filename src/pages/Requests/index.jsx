import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { BusinessOutlined, Check, Close, EventOutlined, GroupsOutlined } from "@mui/icons-material";
import DemoRequests from "../DemoRequests";
import CandidateAssignmentDialog from "./CandidateAssignmentDialog";
import { useGetUpgradeRequestsQuery, useReviewUpgradeRequestMutation } from "../../redux/services/subscriptions/subscriptions";
import { useGetMyAssignedRequestsQuery } from "../../redux/services/drawerService/drawerService";

const ACCENT = "#FF5722";
const STATUS_OPTIONS = ["pending", "approved", "rejected"];
const REQUEST_TABS = [
  { value: "demo", label: "Demo Request", icon: <BusinessOutlined fontSize="small" /> },
  { value: "subscription", label: "Subscription Request", icon: <GroupsOutlined fontSize="small" /> },
  { value: "hiring", label: "Hiring Requests", icon: <GroupsOutlined fontSize="small" /> },
];

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(date);
};

const formatStatus = (status = "pending") => status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

function SubscriptionRequests() {
  const [status, setStatus] = useState("pending");
  const [requestToReject, setRequestToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const { data, isLoading, isFetching, isError, error, refetch } = useGetUpgradeRequestsQuery(status);
  const [reviewRequest, { isLoading: isReviewing, error: reviewError }] = useReviewUpgradeRequestMutation();
  const requests = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  const statusColors = {
    pending: { color: "#B54708", background: "#FFF4E5", border: "#FEDF89" },
    approved: { color: "#027A48", background: "#ECFDF3", border: "#ABEFC6" },
    rejected: { color: "#B42318", background: "#FEF3F2", border: "#FECDCA" },
  };

  const handleReview = async (requestId, decision, reason) => {
    try {
      await reviewRequest({ requestId, decision, rejectionReason: reason }).unwrap();
      setRequestToReject(null);
      setRejectionReason("");
    } catch {
      // Keep the request visible so the user can retry.
    }
  };

  return (
    <Box sx={{ maxWidth: 1120, mx: "auto" }}>
      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" gap={2} sx={{ mb: 2.5 }}>
        {/* <Box>
          <Typography fontSize={{ xs: 19, sm: 21 }} fontWeight={750} color="#101828" letterSpacing="-0.35px">
            Subscription requests
          </Typography>
          <Typography fontSize={13} color="#667085" sx={{ mt: 0.45 }}>
            Review incoming plan changes by organisation and request date.
          </Typography>
        </Box> */}
        <Tabs
          value={status}
          onChange={(_, value) => setStatus(value)}
          variant="scrollable"
          allowScrollButtonsMobile
          aria-label="Filter subscription requests by status"
          sx={{ alignSelf: { xs: "flex-start", sm: "center" }, minHeight: 42, bgcolor: "#F2F4F7", borderRadius: 2, p: 0.4, "& .MuiTabs-indicator": { display: "none" }, "& .MuiTab-root": { minHeight: 34, minWidth: 88, textTransform: "capitalize", fontSize: 12, fontWeight: 600, px: 1.5, borderRadius: 1.5, color: "#667085" }, "& .Mui-selected": { bgcolor: "#fff", color: `${ACCENT} !important`, boxShadow: "0 1px 3px rgba(16,24,40,.12)" } }}
        >
          {STATUS_OPTIONS.map((option) => <Tab key={option} value={option} label={formatStatus(option)} />)}
        </Tabs>
      </Stack>

      {isError && <Alert severity="error" action={<Button color="inherit" size="small" onClick={refetch}>Retry</Button>} sx={{ mb: 2 }}>{error?.data?.message ?? "Unable to load subscription requests."}</Alert>}
      {reviewError && <Alert severity="error" sx={{ mb: 2 }}>{reviewError?.data?.message ?? "Unable to update this request. Please try again."}</Alert>}
      {isLoading || isFetching ? (
        <Box sx={{ display: "grid", placeItems: "center", minHeight: 220 }}><CircularProgress sx={{ color: ACCENT }} /></Box>
      ) : !isError && requests.length === 0 ? (
        <Card variant="outlined" sx={{ borderColor: "#EAECF0", borderRadius: 3, bgcolor: "#FCFCFD" }}>
          <CardContent sx={{ py: { xs: 5, sm: 7 }, textAlign: "center" }}>
            <Box sx={{ width: 52, height: 52, display: "grid", placeItems: "center", mx: "auto", mb: 1.5, borderRadius: 2.5, bgcolor: "#FFF1EB", color: ACCENT }}>
              <GroupsOutlined />
            </Box>
            <Typography fontWeight={700} color="#344054">No {status} requests</Typography>
            <Typography fontSize={13} color="#667085" sx={{ mt: 0.5 }}>Subscription requests with this status will appear here.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={1.5}>
          {requests.map((request) => (
            <Card
              key={request.request_id ?? request.id}
              variant="outlined"
              sx={{ borderColor: "#EAECF0", borderRadius: 2.5, boxShadow: "0 1px 3px rgba(16,24,40,.035)", transition: "box-shadow .18s ease, border-color .18s ease, transform .18s ease", "&:hover": { borderColor: "#F5B49E", boxShadow: "0 8px 20px rgba(16,24,40,.07)", transform: "translateY(-1px)" } }}
            >
              <CardContent sx={{ p: { xs: 1.75, sm: 2.25 }, "&:last-child": { pb: { xs: 1.75, sm: 2.25 } } }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "minmax(0, 1fr) auto auto" }, alignItems: "center", gap: { xs: 1.75, sm: 2.5 } }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
                    <Box sx={{ width: 44, height: 44, display: "grid", placeItems: "center", flexShrink: 0, borderRadius: 2.25, bgcolor: "#FFF1EB", color: ACCENT }}>
                      <BusinessOutlined fontSize="small" />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontSize={15} fontWeight={700} color="#172033" sx={{ overflowWrap: "anywhere" }}>
                        {request.organisation_name || `Organisation ${request.organisation_id || ""}`}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.55 }}>
                        <EventOutlined sx={{ fontSize: 15, color: "#98A2B3" }} />
                        <Typography fontSize={12} color="#667085" fontWeight={500}>
                          {formatDate(request.requested_at)}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>

                  <Chip
                    size="small"
                    label={formatStatus(request.status)}
                    sx={{ justifySelf: { xs: "start", sm: "center" }, minWidth: 88, height: 28, fontWeight: 700, border: `1px solid ${statusColors[request.status]?.border || "#EAECF0"}`, color: statusColors[request.status]?.color || "#475467", bgcolor: statusColors[request.status]?.background || "#F2F4F7", borderRadius: 2 }}
                  />

                  <Stack direction="row" spacing={1} justifyContent={{ xs: "flex-start", sm: "flex-end" }}>
                    {request.status === "pending" && (
                      <>
                        <Button size="small" variant="outlined" color="error" startIcon={<Close />} disabled={isReviewing} onClick={() => { setRequestToReject(request); setRejectionReason(""); }} sx={{ minHeight: 38, borderRadius: 2, px: 1.5, fontWeight: 650, textTransform: "none" }}>
                          Reject
                        </Button>
                        <Button size="small" variant="contained" startIcon={isReviewing ? <CircularProgress size={15} color="inherit" /> : <Check />} disabled={isReviewing} onClick={() => handleReview(request.request_id ?? request.id, "approve")} sx={{ minHeight: 38, bgcolor: ACCENT, borderRadius: 2, px: 1.75, fontWeight: 700, textTransform: "none", boxShadow: "none", "&:hover": { bgcolor: "#E64A19", boxShadow: "none" } }}>
                          {isReviewing ? "Approving..." : "Approve"}
                        </Button>
                      </>
                    )}
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog open={Boolean(requestToReject)} onClose={isReviewing ? undefined : () => setRequestToReject(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject subscription request</DialogTitle>
        <DialogContent>
          <Typography fontSize={13} color="#667085" sx={{ mb: 2 }}>
            Add a reason for rejecting this request. The reason will be visible in the rejected requests list.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            label="Rejection reason"
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRequestToReject(null)} disabled={isReviewing}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            disabled={isReviewing || !rejectionReason.trim()}
            onClick={() => handleReview(requestToReject?.request_id ?? requestToReject?.id, "reject", rejectionReason.trim())}
          >
            {isReviewing ? "Rejecting..." : "Confirm rejection"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function HiringRequests() {
  const { data, isLoading, isError, error, refetch } = useGetMyAssignedRequestsQuery();
  const [requestToAssign, setRequestToAssign] = useState(null);
  const requests = Array.isArray(data?.requests) ? data.requests : [];

  if (isLoading) return <Box sx={{ display: "grid", placeItems: "center", minHeight: 180 }}><CircularProgress sx={{ color: ACCENT }} /></Box>;
  if (isError) return <Alert severity="error" action={<Button color="inherit" size="small" onClick={refetch}>Retry</Button>}>{error?.data?.message ?? "Unable to load hiring requests."}</Alert>;

  return (
    <Box sx={{ maxWidth: 1180, mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", gap: 2, mb: 2.5 }}>
        <Box>
          <Typography fontSize={{ xs: 19, sm: 21 }} fontWeight={750} color="#101828" letterSpacing="-0.35px">Hiring requests</Typography>
          <Typography fontSize={13} color="#667085" sx={{ mt: 0.45 }}>Review assigned roles and find matched candidates to share with each hiring team.</Typography>
        </Box>
        <Chip
          label={`${requests.length} assigned`}
          size="small"
          sx={{ bgcolor: "#FFF1EB", color: ACCENT, fontWeight: 700, borderRadius: 2, flexShrink: 0 }}
        />
      </Box>
      {requests.length === 0 ? (
        <Card variant="outlined" sx={{ borderColor: "#EAECF0", borderRadius: 3, bgcolor: "#FCFCFD" }}>
          <CardContent sx={{ py: { xs: 5, sm: 7 }, px: 2, textAlign: "center" }}>
            <Box sx={{ width: 52, height: 52, display: "grid", placeItems: "center", mx: "auto", mb: 1.5, borderRadius: 2.5, bgcolor: "#FFF1EB", color: ACCENT }}>
              <GroupsOutlined />
            </Box>
            <Typography fontWeight={700} color="#344054">You’re all caught up</Typography>
            <Typography fontSize={13} color="#667085" sx={{ mt: 0.5 }}>Hiring requests assigned to you will appear here.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={1.5}>
          {requests.map((request) => (
            <Card
              key={request.request_id ?? request.id}
              variant="outlined"
              sx={{
                borderColor: "#EAECF0",
                borderLeft: `3px solid ${ACCENT}`,
                borderRadius: 2.5,
                boxShadow: "0 1px 3px rgba(16,24,40,.035)",
                transition: "border-color .18s ease, box-shadow .18s ease, transform .18s ease",
                "&:hover": { borderColor: "#F5B49E", boxShadow: "0 8px 20px rgba(16,24,40,.07)", transform: "translateY(-1px)" },
              }}
            >
              <CardContent sx={{ p: { xs: 1.75, sm: 2.25 }, "&:last-child": { pb: { xs: 1.75, sm: 2.25 } } }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) auto" }, alignItems: "center", gap: { xs: 1.75, md: 3 } }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
                      <Box sx={{ width: 42, height: 42, display: "grid", placeItems: "center", flexShrink: 0, borderRadius: 2, color: ACCENT, bgcolor: "#FFF1EB" }}>
                        <BusinessOutlined fontSize="small" />
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                          <Typography fontSize={15} fontWeight={700} color="#172033" sx={{ overflowWrap: "anywhere" }}>
                            {request.job_title ?? request.title ?? "Hiring request"}
                          </Typography>
                          <Chip
                            size="small"
                            label={formatStatus(request.status ?? "open")}
                            sx={{ height: 23, fontSize: 11, fontWeight: 700, bgcolor: String(request.status || "open").toLowerCase() === "closed" ? "#F2F4F7" : "#FFF4E5", color: String(request.status || "open").toLowerCase() === "closed" ? "#667085" : "#B54708" }}
                          />
                        </Stack>
                        {request.request_number && (
                          <Typography fontSize={12} color="#667085" sx={{ mt: 0.35, overflowWrap: "anywhere" }}>
                            {request.request_number}
                          </Typography>
                        )}
                      </Box>
                    </Stack>

                    <Stack direction="row" useFlexGap flexWrap="wrap" gap={1} sx={{ mt: 2, pl: { xs: 0, sm: 0.25 } }}>
                      <Chip
                        size="small"
                        icon={<GroupsOutlined sx={{ fontSize: "15px !important" }} />}
                        label={`${request.exact_no_of_positions ?? 0} position${request.exact_no_of_positions === 1 ? "" : "s"}`}
                        sx={{ bgcolor: "#F8FAFC", color: "#475467", fontSize: 11, fontWeight: 600, "& .MuiChip-icon": { color: "#667085" } }}
                      />
                      <Chip
                        size="small"
                        icon={<EventOutlined sx={{ fontSize: "15px !important" }} />}
                        label={formatDate(request.created_at)}
                        sx={{ bgcolor: "#F8FAFC", color: "#475467", fontSize: 11, fontWeight: 600, "& .MuiChip-icon": { color: "#667085" } }}
                      />
                      {request.requested_by && (
                        <Chip
                          size="small"
                          label={`Requested by ${request.requested_by}`}
                          sx={{ maxWidth: "100%", bgcolor: "#F8FAFC", color: "#475467", fontSize: 11, fontWeight: 600, "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" } }}
                        />
                      )}
                    </Stack>
                  </Box>

                  {String(request.status || "open").toLowerCase() !== "closed" && (
                    <Button
                      fullWidth
                      size="medium"
                      variant="contained"
                      startIcon={<GroupsOutlined />}
                      onClick={() => setRequestToAssign(request)}
                      sx={{ width: { xs: "100%", md: "auto" }, minWidth: { md: 190 }, height: 42, bgcolor: ACCENT, borderRadius: 2, px: 2, fontWeight: 700, textTransform: "none", boxShadow: "none", whiteSpace: "nowrap", "&:hover": { bgcolor: "#E64A19", boxShadow: "0 4px 10px rgba(255,87,34,.2)" } }}
                    >
                      Assign candidates
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
      <CandidateAssignmentDialog
        open={Boolean(requestToAssign)}
        onClose={() => setRequestToAssign(null)}
        requestId={requestToAssign?.request_id ?? requestToAssign?.id}
        jobTitle={requestToAssign?.job_title ?? requestToAssign?.title ?? "Hiring request"}
      />
    </Box>
  );
}

export default function RequestsPage() {
  const navigate = useNavigate();
  const { requestType = "demo" } = useParams();
  const selectedTab = REQUEST_TABS.some((tab) => tab.value === requestType) ? requestType : "demo";

  useEffect(() => {
    if (requestType !== selectedTab) navigate("/account-manager/requests/demo", { replace: true });
  }, [navigate, requestType, selectedTab]);

  const handleTabChange = (_, value) => {
    navigate(`/account-manager/requests/${value}`);
  };

  return (
    <Box sx={{ minHeight: "100%", bgcolor: "#FCFCFD", p: { xs: 1.25, sm:1.5 } }}>
      {/* <Box sx={{ mb: 2.25 }}>
        <Typography fontSize={24} fontWeight={750} color="#101828" letterSpacing="-0.4px">Requests</Typography>
        <Typography fontSize={13} color="#667085" sx={{ mt: 0.4 }}>Manage incoming demo, subscription, and hiring requests.</Typography>
      </Box> */}
      <Card variant="outlined" sx={{ borderColor: "#EAECF0", borderRadius: 2.5, bgcolor: "#fff", overflow: "hidden" }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          allowScrollButtonsMobile
          sx={{ px: { xs: 1, sm: 2 }, borderBottom: "1px solid #EAECF0", "& .MuiTabs-indicator": { height: 2.5, bgcolor: ACCENT }, "& .MuiTab-root": { minHeight: 54, textTransform: "none", fontWeight: 600, color: "#667085", fontSize: 13 }, "& .Mui-selected": { color: `${ACCENT} !important` } }}
        >
          {REQUEST_TABS.map((tab) => <Tab key={tab.value} value={tab.value} icon={tab.icon} iconPosition="start" label={tab.label} />)}
        </Tabs>
        <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          {selectedTab === "demo" && <DemoRequests />}
          {selectedTab === "subscription" && <SubscriptionRequests />}
          {selectedTab === "hiring" && <HiringRequests />}
        </Box>
      </Card>
    </Box>
  );
}
