import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Dialog,
  DialogActions, DialogContent, DialogTitle, Divider, IconButton, Menu,
  MenuItem, Stack, Tab, Tabs, TextField, Typography,
} from "@mui/material";
import {
  CalendarMonth, Cancel, CheckCircle, GridView, Groups, MoreVert, Replay,
  ViewList,
} from "@mui/icons-material";
import ReusableMRT from "../../components/table";
import {
  useCancelOrganisationSubscriptionMutation,
  useGetOrganisationSubscriptionsQuery,
  useReinitiateOrganisationTrialMutation,
  useResumeOrganisationSubscriptionMutation,
  useUpgradeOrganisationToPaygMutation,
} from "../../redux/services/subscriptions/subscriptions";

const PRIMARY_COLOR = "#FF5722";
const TRIAL_COLOR = "#6D4AFF";
const PAYG_COLOR = "#087E8B";
const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(date);
};
const formatLabel = (value) => value
  ? value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
  : "—";
const formatSubscriptionStatus = (value) => formatLabel(value).replace(/\bPayg\b/gi, "Premium");
const formatPlanName = (value) => String(value || "").toLowerCase() === "payg"
  ? "Premium"
  : formatLabel(value);
const isCancelledSubscription = (subscription) =>
  [subscription.subscription_status, subscription.status]
    .some((status) => String(status || "").toLowerCase() === "cancelled");
const isTrialSubscription = (subscription) =>
  subscription.is_trial === true || String(subscription.subscription_type || "").toLowerCase() === "trial";
const isPaygSubscription = (subscription) =>
  subscription.is_payg === true || String(subscription.subscription_type || "").toLowerCase() === "payg";
const displayLimit = (value) => value === null || value === undefined ? "Unlimited" : value;
const displayPrice = (value) => value === null || value === undefined
  ? "—"
  : new Intl.NumberFormat("en-IN").format(value);

const activationPayload = (subscription) => ({
  organisation_id: subscription.organisation_id,
  max_users: subscription.limits?.max_users ?? 1,
  max_jobs: subscription.limits?.max_jobs ?? 1,
  max_candidate_uploads: subscription.limits?.max_candidate_uploads ?? 1,
  max_matches: subscription.limits?.max_matches ?? 0,
  max_candidates_per_job: subscription.limits?.max_candidates_per_job ?? 1,
  price_per_user: subscription.pricing?.price_per_user ?? 0,
  price_per_job: subscription.pricing?.price_per_job ?? 0,
  price_per_interview: subscription.pricing?.price_per_interview ?? 0,
  price_per_upload: subscription.pricing?.price_per_upload ?? 0,
  price_per_skill_intel_profile: subscription.pricing?.price_per_skill_intel_profile ?? 0,
  price_per_background_verification: subscription.pricing?.price_per_background_verification ?? 0,
  success_fee_percent: subscription.pricing?.success_fee_percent ?? 100,
  // billing_day: subscription.billing_day ?? 1,
});

const StatusChip = ({ subscription }) => {
  const status = subscription.subscription_status || subscription.status;
  const active = subscription.is_active ?? String(status || "").toLowerCase() === "active";
  return (
    <Chip
      size="small"
      label={formatSubscriptionStatus(status)}
      icon={active ? <CheckCircle sx={{ fontSize: 15 }} /> : <Cancel sx={{ fontSize: 15 }} />}
      sx={{
        fontWeight: 600, fontSize: "12px",
        backgroundColor: active ? "#E9F8EF" : "#F3F4F6",
        color: active ? "#15803D" : "#6B7280",
        "& .MuiChip-icon": { color: "inherit" },
      }}
    />
  );
};

const PlanChip = ({ subscription }) => {
  const trial = isTrialSubscription(subscription);
  const color = trial ? TRIAL_COLOR : PAYG_COLOR;
  return (
    <Chip
      size="small"
      label={formatPlanName(subscription.subscription_type || (trial ? "trial" : "payg"))}
      sx={{
        fontWeight: 700,
        color,
        backgroundColor: trial ? "#F1EDFF" : "#E7F6F7",
        borderRadius: "7px",
      }}
    />
  );
};

const Detail = ({ label, value, icon }) => (
  <Box>
    <Typography fontSize="11px" color="#9CA3AF" sx={{ mb: 0.4 }}>{label}</Typography>
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      {icon && <Box sx={{ color: PRIMARY_COLOR, display: "flex", "& svg": { fontSize: 15 } }}>{icon}</Box>}
      <Typography fontSize="13px" fontWeight={600} color="#374151">{value}</Typography>
    </Box>
  </Box>
);

const EmptyState = () => (
  <Box sx={{ height: "70%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "#9CA3AF" }}>
    <Cancel sx={{ fontSize: 42, mb: 1, color: "#D1D5DB" }} />
    <Typography fontSize="14px">No subscriptions found</Typography>
  </Box>
);

const SubscriptionActions = ({ subscription, onUpgrade, onCancel, onReinitiate, onResume, onViewUsage }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const closeMenu = () => setAnchorEl(null);
  const runAction = (action) => {
    closeMenu();
    action();
  };

  return (
    <>
      <IconButton
        size="small"
        aria-label={`Actions for ${subscription.organisation_name || "organisation"}`}
        aria-haspopup="menu"
        onClick={(event) => {
          event.stopPropagation();
          setAnchorEl(event.currentTarget);
        }}
        sx={{ border: "1px solid #E5E7EB", borderRadius: 1.5, color: "#4B5563" }}
      >
        <MoreVert fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        onClick={(event) => event.stopPropagation()}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {subscription.is_active && (
          <MenuItem onClick={() => runAction(onViewUsage)}>View usage</MenuItem>
        )}
        <MenuItem onClick={() => runAction(onUpgrade)}>Upgrade plan</MenuItem>
        {isTrialSubscription(subscription) && !subscription.is_active && !isCancelledSubscription(subscription) && (
          <MenuItem onClick={() => runAction(onReinitiate)}>Reinitiate trial</MenuItem>
        )}
        {isCancelledSubscription(subscription) && (
          <MenuItem onClick={() => runAction(onResume)} sx={{ color: "#15803D" }}>
            Resume subscription
          </MenuItem>
        )}
        {subscription.is_active && (
          <MenuItem onClick={() => runAction(onCancel)} sx={{ color: "#DC2626" }}>
            Cancel subscription
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

const SubscriptionCard = ({ subscription, onActivate, onCancel, onReinitiate, onResume }) => {
  const isTrial = isTrialSubscription(subscription);
  const dateLabel = isTrial ? "Trial ends" : "Premium started";
  const dateValue = isTrial ? subscription.trial_ends_at : subscription.payg_started_at;
  return (
    <Card sx={{ borderRadius: "14px", border: "1px solid #E5E7EB", borderTop: `3px solid ${isTrial ? TRIAL_COLOR : PAYG_COLOR}`, boxShadow: "none", backgroundColor: "#fff" }}>
      <CardContent sx={{ p: 2.2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2, gap: 1 }}>
          <Box>
            <Typography fontSize="15px" fontWeight={700} color="#1F2937">{subscription.organisation_name || "Organisation"}</Typography>
            <Box sx={{ mt: 0.6 }}><PlanChip subscription={subscription} /></Box>
          </Box>
          <StatusChip subscription={subscription} />
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.8 }}>
          <Detail label="Started" value={formatDate(subscription.started_at)} icon={<CalendarMonth />} />
          <Detail label={dateLabel} value={formatDate(dateValue)} icon={<CalendarMonth />} />
          <Detail label="User limit" value={displayLimit(subscription.limits?.max_users)} icon={<Groups />} />
          <Detail label="Job limit" value={displayLimit(subscription.limits?.max_jobs)} />
          <Detail label="Candidate uploads" value={displayLimit(subscription.limits?.max_candidate_uploads)} />
          {/* <Detail label="Billing day" value={subscription.billing_day ? "Day " + subscription.billing_day : "—"} /> */}
          {isPaygSubscription(subscription) && <Detail label="Price per user" value={displayPrice(subscription.pricing?.price_per_user)} />}
        </Box>
        {isTrial && subscription.trial_days_remaining !== null && (
          <Typography fontSize="12px" color={TRIAL_COLOR} fontWeight={600} sx={{ mt: 2 }}>
            {subscription.trial_days_remaining} day{subscription.trial_days_remaining === 1 ? "" : "s"} remaining
          </Typography>
        )}
        {subscription.is_active ? (
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap", rowGap: 1 }}>
            <Button size="small" variant="contained" onClick={() => onActivate(subscription)} sx={{ backgroundColor: PRIMARY_COLOR }}>
              Upgrade Plan
            </Button>
            <Button size="small" variant="outlined" color="error" onClick={() => onCancel(subscription)}>
              Cancel Subscription
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap", rowGap: 1 }}>
            <Button size="small" variant="contained" onClick={() => onActivate(subscription)} sx={{ backgroundColor: PRIMARY_COLOR }}>
              Upgrade Plan
            </Button>
            {isCancelledSubscription(subscription) && (
              <Button size="small" variant="outlined" onClick={() => onResume(subscription)} sx={{ color: "#15803D", borderColor: "#15803D" }}>
                Resume Subscription
              </Button>
            )}
            {isTrialSubscription(subscription) && !isCancelledSubscription(subscription) && (
              <Button size="small" variant="outlined" onClick={() => onReinitiate(subscription)} sx={{ color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}>
                Reinitiate Trial
              </Button>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

const toggleSx = (selected) => ({
  width: 38, height: 34, borderRadius: "7px",
  backgroundColor: selected ? PRIMARY_COLOR : "transparent",
  color: selected ? "#fff" : "#6B7280",
  "&:hover": { backgroundColor: selected ? PRIMARY_COLOR : "#E5E7EB" },
});
const PlanTabLabel = ({ title, description, count }) => (
  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.2 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      <Typography component="span" fontSize="13px" fontWeight={700}>{title}</Typography>
      <Typography component="span" fontSize="11px" fontWeight={700} sx={{ opacity: 0.8 }}>{count}</Typography>
    </Box>
    <Typography component="span" fontSize="10px" sx={{ mt: 0.35, opacity: 0.78 }}>{description}</Typography>
  </Box>
);

const PAYG_FIELDS = [
  ["max_users", "Maximum users"],
  ["max_jobs", "Maximum jobs"],
  ["max_candidate_uploads", "Maximum candidate uploads"],
  ["max_matches", "Maximum matches"],
  ["max_candidates_per_job", "Maximum candidates per job"],
  ["price_per_user", "Price per user"],
  ["price_per_job", "Price per job"],
  ["price_per_interview", "Price per interview"],
  ["price_per_upload", "Price per upload"],
  ["price_per_skill_intel_profile", "Price per skill intel profile"],
  ["price_per_background_verification", "Price per background verification"],
  ["success_fee_percent", "Success fee percent"],
  // ["billing_day", "Billing day"],
];

const UpgradePaygDialog = ({ subscription, onClose }) => {
  const [form, setForm] = useState(() => activationPayload(subscription));
  const [upgradeOrganisationToPayg, { isLoading, error }] = useUpgradeOrganisationToPaygMutation();
  const updateField = (field, value) => setForm((current) => ({
    ...current,
    [field]: Number(value),
  }));
  const activate = async () => {
    try {
      await upgradeOrganisationToPayg(form).unwrap();
      onClose();
    } catch {
      // The API error is rendered below the form.
    }
  };

  return (
    <Dialog open onClose={isLoading ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle>Upgrade Plan</DialogTitle>
      <DialogContent dividers>
        <Typography fontSize="14px" color="#6B7280" sx={{ mb: 2 }}>
          This will upgrade {subscription.organisation_name || "organisation"} to the selected plan with the limits and prices below.
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2 }}>
          {PAYG_FIELDS.map(([field, label]) => (
            <TextField
              key={field}
              label={label}
              type="number"
              value={form[field]}
              onChange={(event) => updateField(field, event.target.value)}
              fullWidth
              size="small"
              slotProps={{ htmlInput: { min: 0 } }}
            />
          ))}
        </Box>
        {error && <Typography color="error" fontSize="13px" sx={{ mt: 2 }}>
          {error?.data?.message || "Unable to upgrade this organisation. Please try again."}
        </Typography>}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button variant="contained" onClick={activate} disabled={isLoading} sx={{ backgroundColor: PRIMARY_COLOR }}>
          {isLoading ? "Upgrading..." : "Upgrade Plan"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Subscriptions = () => {
  const [viewMode, setViewMode] = useState("list");
  const [planTab, setPlanTab] = useState("trial");
  const [subscriptionToActivate, setSubscriptionToActivate] = useState(null);
  const [subscriptionToCancel, setSubscriptionToCancel] = useState(null);
  const [subscriptionToReinitiate, setSubscriptionToReinitiate] = useState(null);
  const [subscriptionToResume, setSubscriptionToResume] = useState(null);
  const [cancelError, setCancelError] = useState("");
  const [reinitiateError, setReinitiateError] = useState("");
  const [resumeError, setResumeError] = useState("");
  const [cancelOrganisationSubscription, { isLoading: isCancelling }] = useCancelOrganisationSubscriptionMutation();
  const [reinitiateOrganisationTrial, { isLoading: isReinitiating }] = useReinitiateOrganisationTrialMutation();
  const [resumeOrganisationSubscription, { isLoading: isResuming }] = useResumeOrganisationSubscriptionMutation();
  const navigate = useNavigate();
  const { data: response, isLoading, isFetching, isError, error, refetch } =
    useGetOrganisationSubscriptionsQuery();
  const subscriptions = useMemo(
    () => Array.isArray(response?.data) ? response.data : [],
    [response],
  );
  const planSubscriptions = useMemo(
    () => subscriptions.filter((item) => planTab === "trial" ? isTrialSubscription(item) : isPaygSubscription(item)),
    [subscriptions, planTab],
  );
  const filteredSubscriptions = planSubscriptions;
  const trialCount = subscriptions.filter(isTrialSubscription).length;
  const paygCount = subscriptions.filter(isPaygSubscription).length;
  const confirmCancellation = async () => {
    if (!subscriptionToCancel?.organisation_id) return;
    setCancelError("");
    try {
      await cancelOrganisationSubscription(subscriptionToCancel.organisation_id).unwrap();
      setSubscriptionToCancel(null);
      refetch();
    } catch (requestError) {
      setCancelError(requestError?.data?.message || requestError?.data?.detail || "Unable to cancel this subscription. Please try again.");
    }
  };
  const confirmTrialReinitiation = async () => {
    if (!subscriptionToReinitiate?.organisation_id) return;
    setReinitiateError("");
    try {
      await reinitiateOrganisationTrial(subscriptionToReinitiate.organisation_id).unwrap();
      setSubscriptionToReinitiate(null);
      refetch();
    } catch (requestError) {
      setReinitiateError(requestError?.data?.message || requestError?.data?.detail || "Unable to reinitiate this trial. Please try again.");
    }
  };
  const confirmResume = async () => {
    if (!subscriptionToResume?.organisation_id) return;
    setResumeError("");
    try {
      await resumeOrganisationSubscription(subscriptionToResume.organisation_id).unwrap();
      setSubscriptionToResume(null);
      refetch();
    } catch (requestError) {
      setResumeError(requestError?.data?.message || requestError?.data?.detail || "Unable to resume this subscription. Please try again.");
    }
  };
  const columns = useMemo(() => [
    { accessorKey: "organisation_name", header: "Organisation", size: 175, cellSx: { minWidth: 130 } },
    { accessorKey: "subscription_type", header: "Plan", size: 110, Cell: ({ row }) => <PlanChip subscription={row.original} /> },
    { accessorKey: "subscription_status", header: "Status", size: 145, Cell: ({ row }) => <StatusChip subscription={row.original} /> },
    { accessorKey: "started_at", header: "Started", size: 125, Cell: ({ cell }) => formatDate(cell.getValue()) },
    { id: "trial_ends_at", header: "Trial ends", size: 125, accessorFn: (row) => row.trial_ends_at, Cell: ({ cell }) => formatDate(cell.getValue()) },
    // { accessorKey: "billing_day", header: "Billing Day", Cell: ({ cell }) => cell.getValue() ? "Day " + cell.getValue() : "—" },
    // { id: "max_users", header: "User Limit", accessorFn: (row) => row.limits?.max_users, Cell: ({ cell }) => displayLimit(cell.getValue()) },
    // { id: "price_per_user", header: "Price per User", accessorFn: (row) => row.pricing?.price_per_user, Cell: ({ cell }) => displayPrice(cell.getValue()) },
    { id: "activate", header: "Actions", size: 84, minSize: 72, maxSize: 92, enableSorting: false, enableColumnFilter: false, Cell: ({ row }) => <SubscriptionActions
      subscription={row.original}
      onViewUsage={() => navigate("/account-manager/org/" + row.original.organisation_id, { state: { activeTab: 5 } })}
      onUpgrade={() => setSubscriptionToActivate(row.original)}
      onCancel={() => { setCancelError(""); setSubscriptionToCancel(row.original); }}
      onReinitiate={() => { setReinitiateError(""); setSubscriptionToReinitiate(row.original); }}
      onResume={() => { setResumeError(""); setSubscriptionToResume(row.original); }}
    /> },
  ], [navigate]);

  if (isLoading) {
    return <Box sx={{ height: "calc(100vh - 68px)", display: "grid", placeItems: "center" }}><CircularProgress sx={{ color: PRIMARY_COLOR }} /></Box>;
  }
  if (isError) {
    return (
      <Box sx={{ height: "calc(100vh - 68px)", display: "grid", placeItems: "center", textAlign: "center" }}>
        <Box>
          <Typography color="#374151" fontWeight={600}>{error?.data?.message || "Unable to load subscriptions."}</Typography>
          <Button onClick={refetch} startIcon={<Replay />} sx={{ mt: 1, color: PRIMARY_COLOR }}>Try again</Button>
        </Box>
      </Box>
    );
  }
  return (
    <Box sx={{ width: "100%", height: "calc(100vh - 70px)", display: "flex", flexDirection: "column", backgroundColor: "#fff", overflow: "hidden" }}>
      <Box sx={{ minHeight: { xs: 86, md: 82 }, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap", flexShrink: 0, px: { xs: 1.5, md: 2.5 }, py: 1.25, borderBottom: "1px solid #E5E7EB", backgroundColor: "#FCFCFD" }}>
        <Box>
          <Box>
            <Typography variant="overline" sx={{ display: "block", lineHeight: 1.2, color: "#64748B", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", mb: 0.65 }}>
              PLAN TYPE
            </Typography>
            <Tabs
              aria-label="Filter by plan type"
              value={planTab}
              onChange={(_, value) => setPlanTab(value)}
              sx={{ minHeight: 48, "& .MuiTabs-indicator": { display: "none" }, "& .MuiTab-root": { minHeight: 46, minWidth: { xs: 142, sm: 158 }, px: 1.4, py: 0.6, alignItems: "flex-start", textTransform: "none", color: "#64748B", border: "1px solid #E2E8F0", borderRadius: "10px", mr: 0.75, backgroundColor: "#fff" }, "& .Mui-selected": { borderColor: (planTab === "trial" ? TRIAL_COLOR : PAYG_COLOR) + " !important", color: (planTab === "trial" ? TRIAL_COLOR : PAYG_COLOR) + " !important", backgroundColor: (planTab === "trial" ? "#F1EDFF" : "#E7F6F7") + " !important" } }}
            >
              <Tab value="trial" label={<PlanTabLabel title="Trial" description="Time-limited access" count={trialCount} />} />
              <Tab value="payg" label={<PlanTabLabel title="Premium" description="Usage-based plan" count={paygCount} />} />
            </Tabs>
          </Box>
        </Box>
        <Stack direction="row" spacing={0.5} sx={{ backgroundColor: "#F3F4F6", borderRadius: "9px", p: 0.4, ml: "auto" }}>
          <IconButton size="small" onClick={() => setViewMode("list")} sx={toggleSx(viewMode === "list")}><ViewList fontSize="small" /></IconButton>
          <IconButton size="small" onClick={() => setViewMode("grid")} sx={toggleSx(viewMode === "grid")}><GridView fontSize="small" /></IconButton>
        </Stack>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden", p: { xs: 1, md: 2 } }}>
        {viewMode === "list" ? (
          <ReusableMRT data={filteredSubscriptions} columnData={columns} enableRowActions={false} enableRowClickModal={false} compactMode disableDefaultColumnPinning height="100%" />
        ) : (
          <Box sx={{ height: "100%", overflowY: "auto", pr: 0.5 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "repeat(4, 1fr)" }, gap: 2 }}>
              {filteredSubscriptions.map((subscription) => <SubscriptionCard key={subscription.organisation_id} subscription={subscription} onActivate={setSubscriptionToActivate} onCancel={(item) => { setCancelError(""); setSubscriptionToCancel(item); }} onReinitiate={(item) => { setReinitiateError(""); setSubscriptionToReinitiate(item); }} onResume={(item) => { setResumeError(""); setSubscriptionToResume(item); }} />)}
            </Box>
            {filteredSubscriptions.length === 0 && <EmptyState />}
          </Box>
        )}
        {isFetching && <CircularProgress size={18} sx={{ color: PRIMARY_COLOR, position: "fixed", right: 28, bottom: 28 }} />}
      </Box>
      {subscriptionToActivate && <UpgradePaygDialog key={subscriptionToActivate.organisation_id} subscription={subscriptionToActivate} onClose={() => setSubscriptionToActivate(null)} />}
      <Dialog open={Boolean(subscriptionToCancel)} onClose={isCancelling ? undefined : () => setSubscriptionToCancel(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Cancel subscription?</DialogTitle>
        <DialogContent dividers>
          <Typography fontSize="14px" color="#4B5563">
            Cancel the subscription for <strong>{subscriptionToCancel?.organisation_name || "this organisation"}</strong>? This will mark the subscription as cancelled.
          </Typography>
          {cancelError && <Alert severity="error" sx={{ mt: 2 }}>{cancelError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setSubscriptionToCancel(null)} disabled={isCancelling}>Keep subscription</Button>
          <Button color="error" variant="contained" onClick={confirmCancellation} disabled={isCancelling}>
            {isCancelling ? "Cancelling..." : "Confirm cancellation"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={Boolean(subscriptionToReinitiate)} onClose={isReinitiating ? undefined : () => setSubscriptionToReinitiate(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Reinitiate trial?</DialogTitle>
        <DialogContent dividers>
          <Typography fontSize="14px" color="#4B5563">
            Reinitiate the trial for <strong>{subscriptionToReinitiate?.organisation_name || "this organisation"}</strong>? The subscription will be set back to active with a new trial period.
          </Typography>
          {reinitiateError && <Alert severity="error" sx={{ mt: 2 }}>{reinitiateError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setSubscriptionToReinitiate(null)} disabled={isReinitiating}>Keep current status</Button>
          <Button variant="contained" onClick={confirmTrialReinitiation} disabled={isReinitiating} sx={{ backgroundColor: PRIMARY_COLOR }}>
            {isReinitiating ? "Reinitiating..." : "Confirm reinitiation"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={Boolean(subscriptionToResume)} onClose={isResuming ? undefined : () => setSubscriptionToResume(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Resume subscription?</DialogTitle>
        <DialogContent dividers>
          <Typography fontSize="14px" color="#4B5563">
            Resume the cancelled subscription for <strong>{subscriptionToResume?.organisation_name || "this organisation"}</strong>?
          </Typography>
          {resumeError && <Alert severity="error" sx={{ mt: 2 }}>{resumeError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setSubscriptionToResume(null)} disabled={isResuming}>Keep cancelled</Button>
          <Button variant="contained" onClick={confirmResume} disabled={isResuming} sx={{ backgroundColor: "#15803D", "&:hover": { backgroundColor: "#166534" } }}>
            {isResuming ? "Resuming..." : "Resume subscription"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Subscriptions;
