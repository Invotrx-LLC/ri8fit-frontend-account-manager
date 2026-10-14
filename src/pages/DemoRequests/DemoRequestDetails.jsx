import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  Button,
  Menu,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Breadcrumbs,
  Link,
} from "@mui/material";

import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";

import {
  useGetDemoRequestsQuery,
  useGetDemoRequestStatusesQuery,
  useGetDemoRequestOnboardingStatusQuery,
  useResendDemoRequestInviteMutation,
  useGetAllInternalUsersQuery,
  useUpdateDemoRequestStatusMutation,
  useAssignDemoRequestMutation,
  useSendCustomerInviteMutation,
  useProvisionSignupMutation,
  useSendProvisionCredentialsMutation,
} from "../../redux/services/demo/demo";

import { toast } from "react-toastify";

import { TOKENS, DEMO_REQUESTS_PATH } from "./demoRequestUi";


/* =========================================
   SELECT WITH INLINE LOADER
========================================= */

const SelectWithLoader = ({ loading, children }) => (
  <Box sx={{ position: "relative", display: "inline-flex" }}>
    {children}

    {loading && (
      <CircularProgress
        size={16}
        thickness={5}
        sx={{
          position: "absolute",
          right: 36,
          top: "50%",
          mt: "-8px",
          pointerEvents: "none",
          color: TOKENS.accent,
        }}
      />
    )}
  </Box>
);

const getErrorMessage = (error, fallback) =>
  typeof error?.data?.message === "string"
    ? error.data.message
    : typeof error?.data?.detail === "string"
      ? error.data.detail
      : typeof error?.message === "string"
        ? error.message
        : fallback;
/* =========================================
   SHARED STYLES
========================================= */

const labelSx = {
  fontSize: 12,
  fontWeight: 600,
  color: TOKENS.textSecondary,
  mb: 0.5,
};

const valueSx = {
  fontSize: 14,
  fontWeight: 600,
  color: TOKENS.textPrimary,
  overflowWrap: "anywhere",
};

const dashedDividerSx = {
  borderTop: "1px dashed #D9D9DF",
  my: { xs: 1.75, md: 2 },
};

const selectSx = {
  minWidth: 170,
  height: 38,
  fontSize: 13,
  color: TOKENS.textPrimary,
  borderRadius: "8px",
  backgroundColor: "#FFFFFF",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: TOKENS.border,
  },
};

const iconButtonSx = {
  width: 34,
  height: 34,
  border: `1px solid ${TOKENS.border}`,
  borderRadius: "8px",
  backgroundColor: "#FFFFFF",
  color: TOKENS.textSecondary,
};

const DemoRequestDetails = () => {
  const navigate = useNavigate();
  const { demoRequestId } = useParams();

  const [inviteMenuAnchor, setInviteMenuAnchor] = useState(null);
  const [inviteSent, setInviteSent] = useState(false);
  const [latestInviteResponse, setLatestInviteResponse] = useState(null);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [amProvisionedOpen, setAmProvisionedOpen] = useState(false);
  const [requestOverride, setRequestOverride] = useState(null);
  const [amProvisionedForm, setAmProvisionedForm] = useState({
    organisation_name: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    time_zone: "Asia/Kolkata",
    country: "",
    industry: "",
    website_url: "",
  });

  const { data, isLoading, isError, refetch, isFetching } =
    useGetDemoRequestsQuery({});

  const {
    data: statusData,
    isLoading: isStatusLoading,
    isError: isStatusError,
  } = useGetDemoRequestStatusesQuery();

  const {
    data: onboardingData,
    isLoading: isOnboardingLoading,
    isError: isOnboardingError,
    refetch: refetchOnboarding,
  } = useGetDemoRequestOnboardingStatusQuery(demoRequestId, {
    skip: !demoRequestId,
  });

  const {
    data: usersData,
    isLoading: isUsersLoading,
    isError: isUsersError,
  } = useGetAllInternalUsersQuery();

  const [updateDemoRequestStatus, { isLoading: isUpdatingStatus }] =
    useUpdateDemoRequestStatusMutation();

  const [assignDemoRequest, { isLoading: isAssigning }] =
    useAssignDemoRequestMutation();

  const [sendCustomerInvite] = useSendCustomerInviteMutation();
  const [resendDemoRequestInvite, { isLoading: isResendingInvite }] =
    useResendDemoRequestInviteMutation();

  const [provisionSignup] = useProvisionSignupMutation();
  const [sendProvisionCredentials, { isLoading: isSendingProvisionCredentials }] =
    useSendProvisionCredentialsMutation();
  const [pendingCredentialsOnboardingId, setPendingCredentialsOnboardingId] = useState(null);

  const companies = data?.data ?? [];
  const statuses = statusData?.data ?? [];
  const users = usersData?.data ?? [];
  const onboarding = onboardingData?.data ?? null;
  const onboardingInfo = onboarding?.onboarding ?? null;
  const onboardingTracking = onboarding?.tracking ?? null;

  const requests = companies.flatMap((company) =>
    (company.requests || []).map((item) => ({
      ...item,
      company_name: company.company_name,
    }))
  );

  const requestFromApi = requests.find(
    (item) => String(item.demo_request_id) === String(demoRequestId)
  );
  const request = requestOverride || requestFromApi;

  useEffect(() => {
    const hasExistingInvite = Boolean(
      onboardingInfo?.invite_token_sent ||
        onboardingInfo?.registration_email_sent_at ||
        onboardingTracking?.is_invitation_sent ||
        onboardingTracking?.is_registration_completed ||
        onboardingTracking?.is_onboarding_completed
    );

    if (hasExistingInvite) setInviteSent(true);
  }, [onboardingInfo, onboardingTracking]);

  const handleStatusChange = async (newStatus) => {
    try {
      await updateDemoRequestStatus({
        demo_request_id: request.demo_request_id,
        status: newStatus,
      }).unwrap();

      toast.success("Status updated successfully");
    } catch (error) {
      console.error("Failed to update demo request status:", error);
      toast.error(getErrorMessage(error, "Failed to update status"));
    }
  };

  const handleAssign = async (userId) => {
    if (!userId) return;

    try {
      const response = await assignDemoRequest({
        demo_request_id: request.demo_request_id,
        assigned_to: userId,
      }).unwrap();

      const assignment = response?.data ?? response;
      setRequestOverride({
        ...request,
        assigned_to: assignment?.assigned_to ?? userId,
        assigned_user_name: assignment?.assigned_user_name,
        status: assignment?.status ?? request.status,
        assigned_at: assignment?.assigned_at,
      });
      refetch();
      toast.success(response?.message || "Lead assigned successfully");
    } catch (error) {
      console.error("Failed to assign demo request:", error);
      toast.error(getErrorMessage(error, "Failed to assign lead"));
    }
  };

  const handleOpenInviteMenu = (event) => {
    if (inviteSent) return;
    setInviteMenuAnchor(event.currentTarget);
  };

  const handleCloseInviteMenu = () => {
    setInviteMenuAnchor(null);
  };

  const handleResendInvite = async () => {
    if (!demoRequestId) return;

    try {
      setIsSendingInvite(true);

      const response = await resendDemoRequestInvite(demoRequestId).unwrap();
      setLatestInviteResponse(response?.data ?? null);
      toast.success(response?.message || "Invitation resent successfully");

      setInviteSent(true);
      await refetchOnboarding();
    } catch (error) {
      console.error("Failed to resend customer invite:", error);
      toast.error(getErrorMessage(error, "Failed to resend invite"));
    } finally {
      setIsSendingInvite(false);
      handleCloseInviteMenu();
    }
  };

  const handleOpenAmProvisioned = () => {
    if (!request) return;

    const nameParts = (request.name || "").trim().split(/\s+/);

    setAmProvisionedForm({
      organisation_name: request.company_name || "",
      email: request.email || "",
      first_name: nameParts[0] || "",
      last_name: nameParts.slice(1).join(" ") || "",
      phone_number: request.phone_number || "",
      time_zone: "Asia/Kolkata",
      country: "",
      industry: "",
      website_url: "",
    });

    handleCloseInviteMenu();
    setAmProvisionedOpen(true);
  };

  const handleSendProvisionCredentials = async (onboardingId) => {
    try {
      const response = await sendProvisionCredentials(onboardingId).unwrap();
      setPendingCredentialsOnboardingId(null);
      toast.success(response?.message || "Customer login credentials sent successfully");
      await refetchOnboarding();
    } catch (error) {
      setPendingCredentialsOnboardingId(onboardingId);
      toast.error(getErrorMessage(error, "Account provisioned, but credentials could not be sent. Please retry."));
    }
  };

  const handleAmProvisionedChange = (event) => {
    const { name, value } = event.target;
    setAmProvisionedForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmitAmProvisioned = async () => {
    if (!request) return;

    const requiredFields = [
      "organisation_name",
      "email",
      "first_name",
      "last_name",
      "phone_number",
      "time_zone",
      "country",
      "industry",
    ];

    const hasMissingFields = requiredFields.some(
      (field) => !String(amProvisionedForm[field] || "").trim()
    );

    if (hasMissingFields) {
      console.error("Please fill all required AM provisioned fields.");
      return;
    }

    try {
      setIsSendingInvite(true);

      const invitationResponse = await provisionSignup({
        invite_type: "provision_signup",
        demo_request_id: request.demo_request_id,
        organisation_name: amProvisionedForm.organisation_name,
        email: amProvisionedForm.email,
        first_name: amProvisionedForm.first_name,
        last_name: amProvisionedForm.last_name,
        phone_number: amProvisionedForm.phone_number,
        time_zone: amProvisionedForm.time_zone,
        country: amProvisionedForm.country,
        industry: amProvisionedForm.industry,
        website_url: amProvisionedForm.website_url,
      }).unwrap();

      setInviteSent(true);
      setLatestInviteResponse(invitationResponse?.data ?? null);
      const onboardingId = invitationResponse?.data?.onboarding_id;
      setAmProvisionedOpen(false);
      await refetchOnboarding();

      if (onboardingId) {
        await handleSendProvisionCredentials(onboardingId);
      } else {
        toast.warning("Account provisioned, but credentials could not be sent because the onboarding ID was missing.");
      }
    } catch (error) {
      console.error("Failed to complete AM provisioned signup:", error);
      toast.error(getErrorMessage(error, "Failed to complete AM provisioned signup"));
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleSendInvite = async () => {
    if (!request) return;

    const nameParts = (request.name || "").trim().split(/\s+/);

    try {
      setIsSendingInvite(true);

      const response = await sendCustomerInvite({
        invite_type: "self_signup",
        demo_request_id: request.demo_request_id,
        organisation_name: request.company_name || "",
        email: request.email || "",
        first_name: nameParts[0] || "",
        last_name: nameParts.slice(1).join(" ") || "",
        phone_number: request.phone_number || "",
        time_zone: "",
        country: "",
        Industry: "",
      }).unwrap();

      setInviteSent(true);
      setLatestInviteResponse(response?.data ?? null);
      toast.success(response?.message || "Invitation sent successfully");
      await refetchOnboarding();
    } catch (error) {
      console.error("Failed to send customer invite:", error);
      toast.error(getErrorMessage(error, "Failed to send invite"));
    } finally {
      setIsSendingInvite(false);
      handleCloseInviteMenu();
    }
  };

  const closeAmDialog = () => {
    if (!isSendingInvite) {
      setAmProvisionedOpen(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        Failed to load demo request.
      </Alert>
    );
  }

  if (!request) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="warning"
          action={
            <Button size="small" onClick={() => navigate(DEMO_REQUESTS_PATH)}>
              Back
            </Button>
          }
        >
          Demo request not found.
        </Alert>
      </Box>
    );
  }

  const isSubmitting = isSendingInvite || isResendingInvite || isSendingProvisionCredentials;
  const inviteButtonLabel = isSendingInvite
    ? "Sending..."
    : inviteSent
      ? "Resend Invite"
      : "Send Invite";

  const onboardingStatusLabel =
    onboardingInfo?.status ||
    onboardingTracking?.current_stage ||
    (onboardingData ? "Onboarding available" : "No invite sent");

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2, lg: 2.5 },
        width: "100%",
        minHeight: "100%",
        background: "linear-gradient(180deg, #f5f7fb 0%, #eef3f9 100%)",
        fontFamily: TOKENS.fontFamily,
      }}
    >
      <Box sx={{ maxWidth: 1600, mx: "auto", width: "100%" }}>
        <Paper
          elevation={0}
          sx={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(247,250,255,0.98) 100%)",
            border: `1px solid ${TOKENS.border}`,
            borderRadius: { xs: "14px", md: "16px" },
            boxShadow: "0 6px 20px rgba(15, 23, 42, 0.045)",
            mb: 2,
            px: { xs: 1.5, sm: 2, md: 2.5 },
            py: { xs: 1.5, md: 1.75 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Tooltip title="Back to list">
                <IconButton
                  onClick={() => navigate(DEMO_REQUESTS_PATH)}
                  sx={{
                    ...iconButtonSx,
                    background: "#fff",
                    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
                  }}
                >
                  <ArrowBackRoundedIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>

              <Box>
                <Typography
                  sx={{
                    fontSize: { xs: 18, md: 20 },
                    fontWeight: 700,
                    color: TOKENS.textPrimary,
                    lineHeight: 1.2,
                    // letterSpacing: "-0.03em",
                  }}
                >
                  Lead Details
                </Typography>

                <Breadcrumbs separator="›" sx={{ mt: 0.5, fontSize: 13 }}>
                  <Link
                    component="button"
                    underline="hover"
                    onClick={() => navigate(DEMO_REQUESTS_PATH)}
                    sx={{
                      fontSize: 13,
                      color: TOKENS.textPrimary,
                      fontWeight: 600,
                    }}
                  >
                    Lead
                  </Link>

                  <Typography
                    sx={{
                      fontSize: 13,
                      color: TOKENS.textSecondary,
                      fontWeight: 600,
                    }}
                  >
                    {request.name}
                  </Typography>
                </Breadcrumbs>
              </Box>
            </Box>

            <Tooltip title="Refresh">
              <span>
                <IconButton
                  onClick={() => refetch()}
                  disabled={isFetching}
                  sx={{
                    ...iconButtonSx,
                    background: "#fff",
                    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
                  }}
                >
                  <RefreshRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            border: `1px solid rgba(15, 23, 42, 0.08)`,
            borderRadius: { xs: "16px", md: "18px" },
            background: "rgba(255,255,255,0.96)",
            boxShadow: "0 10px 28px rgba(15, 23, 42, 0.055)",
            px: { xs: 1.5, sm: 2, md: 2.75 },
            py: { xs: 1.75, sm: 2, md: 2.5 },
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
              gap: { xs: 1.25, md: 1.5 },
            }}
          >
            {[
              { label: "Name", value: request.name },
              { label: "Email", value: request.email },
              { label: "Phone", value: request.phone_number },
              { label: "Company", value: request.company_name },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{
                  p: { xs: 1.25, md: 1.5 },
                  minWidth: 0,
                  minHeight: 78,
                  borderRadius: "10px",
                  background: "#F9FAFB",
                  border: "1px solid #EEF0F3",
                }}
              >
                <Typography sx={labelSx}>{item.label}</Typography>
                <Typography sx={valueSx}>{item.value || "-"}</Typography>
              </Box>
            ))}
          </Box>

          <Box sx={dashedDividerSx} />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "110px minmax(0, 1fr)",
              },
              gap: { xs: 0.5, md: 1.5 },
              alignItems: "start",
              p: { xs: 1.25, md: 1.5 },
              minHeight: 68,
              borderRadius: "10px",
              background: "#F9FAFB",
            }}
          >
            <Typography sx={{ ...labelSx, mb: 0, fontSize: 14 }}>
              Message
            </Typography>

            <Typography
              sx={{
                fontSize: 14,
                lineHeight: 1.55,
                color: TOKENS.textPrimary,
                whiteSpace: "pre-wrap",
                fontWeight: 500,
              }}
            >
              {request.message || "-"}
            </Typography>
          </Box>

          <Box sx={dashedDividerSx} />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
              gap: { xs: 1.25, md: 1.5 },
              mb: 1.5,
            }}
          >
            {[
              {
                label: "Onboarding status",
                value: isOnboardingLoading
                  ? "Checking..."
                  : isOnboardingError
                    ? "Status unavailable"
                    : onboardingStatusLabel,
              },
              {
                label: "Invite expiry",
                value: (onboardingInfo?.invite_token_expires_at || latestInviteResponse?.token_expires_at)
                  ? new Date(
                      onboardingInfo?.invite_token_expires_at ||
                        latestInviteResponse.token_expires_at
                    ).toLocaleString()
                  : "-",
              },
              {
                label: "Registration URL",
                value: latestInviteResponse?.registration_url
                  ? latestInviteResponse.registration_url
                  : onboardingInfo?.invite_token_sent
                    ? "Ready to send again"
                    : "-",
              },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{
                  p: { xs: 1.25, md: 1.5 },
                  minWidth: 0,
                  minHeight: 78,
                  borderRadius: "10px",
                  background: "#F7FAFF",
                  border: "1px solid #E7EEF9",
                }}
              >
                <Typography sx={labelSx}>{item.label}</Typography>
                <Typography sx={{ ...valueSx, fontSize: 14 }}>{item.value}</Typography>
              </Box>
            ))}
          </Box>

          <Box sx={dashedDividerSx} />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
              pt: 0,
              p: { xs: 1.25, md: 1.5 },
              borderRadius: "12px",
              backgroundColor: "#F8FAFC",
              border: "1px solid #EEF0F3",
            }}
          >
            <SelectWithLoader loading={isUpdatingStatus}>
              <Select
                size="small"
                displayEmpty
                value={request.status || ""}
                onChange={(event) => handleStatusChange(event.target.value)}
                disabled={isStatusLoading || isStatusError || isUpdatingStatus}
                sx={{
                  ...selectSx,
                  minWidth: { xs: "100%", sm: 170 },
                  height: 40,
                  borderRadius: "9px",
                  background: "#f8fafc",
                  boxShadow: "inset 0 0 0 1px rgba(148,163,184,0.12)",
                }}
              >
                <MenuItem value="" disabled>
                  Select Status
                </MenuItem>

                {statuses.map((item) => (
                  <MenuItem key={item.value} value={item.value} sx={{ fontSize: 13 }}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </SelectWithLoader>

            <SelectWithLoader loading={isAssigning}>
              <Select
                size="small"
                displayEmpty
                value={request.assigned_to || ""}
                onChange={(event) => handleAssign(event.target.value)}
                disabled={isUsersLoading || isUsersError || isAssigning}
                sx={{
                  ...selectSx,
                  minWidth: { xs: "100%", sm: 170 },
                  height: 40,
                  borderRadius: "9px",
                  background: "#f8fafc",
                  boxShadow: "inset 0 0 0 1px rgba(148,163,184,0.12)",
                }}
              >
                <MenuItem value="" disabled>
                  Assign to user
                </MenuItem>

                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id} sx={{ fontSize: 13 }}>
                    {user.full_name}
                  </MenuItem>
                ))}
              </Select>
            </SelectWithLoader>

            <Button
              variant="contained"
              disableElevation
              onClick={inviteSent ? handleResendInvite : handleOpenInviteMenu}
              disabled={isSubmitting}
              startIcon={
                inviteSent ? (
                  <CheckOutlinedIcon sx={{ fontSize: 16 }} />
                ) : (
                  <SendOutlinedIcon sx={{ fontSize: 16 }} />
                )
              }
              sx={{
                height: 40,
                px: 2,
                fontSize: 13,
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "9px",
                background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
                boxShadow: "0 10px 20px rgba(249, 115, 22, 0.22)",
                "&:hover": {
                  background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
                },
              }}
            >
              {inviteButtonLabel}
            </Button>
            {pendingCredentialsOnboardingId && (
              <Button
                variant="outlined"
                onClick={() => handleSendProvisionCredentials(pendingCredentialsOnboardingId)}
                disabled={isSubmitting}
                sx={{ height: 42, textTransform: "none", borderRadius: "12px" }}
              >
                Retry credential email
              </Button>
            )}
          </Box>
        </Paper>

        <Menu
          anchorEl={inviteMenuAnchor}
          open={Boolean(inviteMenuAnchor)}
          onClose={handleCloseInviteMenu}
        >
          <MenuItem onClick={handleSendInvite}>Self Signup</MenuItem>
          <MenuItem onClick={handleOpenAmProvisioned}>AM Provisioned</MenuItem>
        </Menu>

        <Dialog open={amProvisionedOpen} onClose={closeAmDialog} fullWidth maxWidth="md">
          <DialogTitle>AM Provisioned</DialogTitle>

          <DialogContent dividers>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Organisation Name"
                  name="organisation_name"
                  value={amProvisionedForm.organisation_name}
                  onChange={handleAmProvisionedChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Email"
                  name="email"
                  type="email"
                  value={amProvisionedForm.email}
                  onChange={handleAmProvisionedChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="First Name"
                  name="first_name"
                  value={amProvisionedForm.first_name}
                  onChange={handleAmProvisionedChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Last Name"
                  name="last_name"
                  value={amProvisionedForm.last_name}
                  onChange={handleAmProvisionedChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Phone Number"
                  name="phone_number"
                  value={amProvisionedForm.phone_number}
                  onChange={handleAmProvisionedChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Time Zone"
                  name="time_zone"
                  value={amProvisionedForm.time_zone}
                  onChange={handleAmProvisionedChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Country"
                  name="country"
                  value={amProvisionedForm.country}
                  onChange={handleAmProvisionedChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Industry"
                  name="industry"
                  value={amProvisionedForm.industry}
                  onChange={handleAmProvisionedChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Website URL"
                  name="website_url"
                  value={amProvisionedForm.website_url}
                  onChange={handleAmProvisionedChange}
                  placeholder="https://example.com"
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={closeAmDialog} disabled={isSubmitting}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmitAmProvisioned} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default DemoRequestDetails;