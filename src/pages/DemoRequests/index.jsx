import React, { useState } from "react";

import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  Button,
  Menu,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import TableRowsOutlinedIcon from "@mui/icons-material/TableRowsOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";

import {
  useGetDemoRequestsQuery,
  useGetDemoRequestStatusesQuery,
  useGetAllInternalUsersQuery,
  useUpdateDemoRequestStatusMutation,
  useAssignDemoRequestMutation,
  useSendCustomerInviteMutation,
  useSubmitProvisionSignupDetailsMutation,
} from "../../redux/services/demo/demo";

const DemoRequests = () => {
  /* =========================================
     VIEW
  ========================================= */

  const [viewMode, setViewMode] = useState("grid");

  /* =========================================
     FILTER / SEARCH
  ========================================= */

  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  /* =========================================
     EDIT STATUS
  ========================================= */

  const [editingRequestId, setEditingRequestId] =
    useState(null);

  /* =========================================
     INVITE MENU
  ========================================= */

  const [inviteMenuAnchor, setInviteMenuAnchor] =
    useState(null);

  const [selectedInviteRequestId, setSelectedInviteRequestId] =
    useState(null);

  /* =========================================
     INVITE SENT TRACKING
  ========================================= */

  const [sentInviteIds, setSentInviteIds] =
    useState([]);

  const [sendingInviteId, setSendingInviteId] =
    useState(null);

  /* =========================================
     AM PROVISIONED FORM
  ========================================= */

  const [amProvisionedOpen, setAmProvisionedOpen] =
    useState(false);

  const [selectedDemoRequest, setSelectedDemoRequest] =
    useState(null);

  const [amProvisionedForm, setAmProvisionedForm] =
    useState({
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

  /* =========================================
     API
  ========================================= */

  const {
    data,
    isLoading,
    isError,
  } = useGetDemoRequestsQuery(
    status ? { status } : {}
  );

  const {
    data: statusData,
    isLoading: isStatusLoading,
    isError: isStatusError,
  } = useGetDemoRequestStatusesQuery();

  const {
    data: usersData,
    isLoading: isUsersLoading,
    isError: isUsersError,
  } = useGetAllInternalUsersQuery();

  const [
    updateDemoRequestStatus,
    { isLoading: isUpdatingStatus },
  ] = useUpdateDemoRequestStatusMutation();

  const [
    assignDemoRequest,
    { isLoading: isAssigning },
  ] = useAssignDemoRequestMutation();

  const [sendCustomerInvite] =
    useSendCustomerInviteMutation();

  const [
    submitProvisionSignupDetails,
    { isLoading: isSubmittingProvision },
  ] = useSubmitProvisionSignupDetailsMutation();

  /* =========================================
     DATA
  ========================================= */

  const companies = data?.data ?? [];
  const statuses = statusData?.data ?? [];
  const users = usersData?.data ?? [];

  /*
   * Convert grouped company response
   * into flat request list.
   */

  const requests = companies.flatMap((company) =>
    (company.requests || []).map((request) => ({
      ...request,
      company_name: company.company_name,
    }))
  );

  /* =========================================
     SEARCH
  ========================================= */

  const filteredRequests = requests.filter(
    (request) => {
      const searchValue = search
        .trim()
        .toLowerCase();

      if (!searchValue) {
        return true;
      }

      return (
        request.name
          ?.toLowerCase()
          .includes(searchValue) ||
        request.email
          ?.toLowerCase()
          .includes(searchValue) ||
        request.phone_number
          ?.toLowerCase()
          .includes(searchValue) ||
        request.company_name
          ?.toLowerCase()
          .includes(searchValue)
      );
    }
  );

  /* =========================================
     STATUS UPDATE
  ========================================= */

  const handleStatusChange = async (
    requestId,
    newStatus
  ) => {
    try {
      await updateDemoRequestStatus({
        demo_request_id: requestId,
        status: newStatus,
      }).unwrap();

      setEditingRequestId(null);
    } catch (error) {
      console.error(
        "Failed to update demo request status:",
        error
      );
    }
  };

  /* =========================================
     ASSIGN USER
  ========================================= */

  const handleAssign = async (
    requestId,
    userId
  ) => {
    if (!userId) return;

    try {
      await assignDemoRequest({
        demo_request_id: requestId,
        assigned_to: userId,
      }).unwrap();
    } catch (error) {
      console.error(
        "Failed to assign demo request:",
        error
      );
    }
  };

  /* =========================================
     OPEN INVITE MENU
  ========================================= */

  const handleOpenInviteMenu = (
    event,
    requestId
  ) => {
    if (sentInviteIds.includes(requestId)) {
      return;
    }

    setInviteMenuAnchor(
      event.currentTarget
    );

    setSelectedInviteRequestId(requestId);
  };

  /* =========================================
     CLOSE INVITE MENU
  ========================================= */

  const handleCloseInviteMenu = () => {
    setInviteMenuAnchor(null);
    setSelectedInviteRequestId(null);
  };

  /* =========================================
     OPEN AM PROVISIONED FORM
  ========================================= */

  const handleOpenAmProvisioned = () => {
    const request = requests.find(
      (item) =>
        item.demo_request_id ===
        selectedInviteRequestId
    );

    if (!request) {
      return;
    }

    const nameParts = (request.name || "")
      .trim()
      .split(/\s+/);

    setSelectedDemoRequest(request);

    setAmProvisionedForm({
      organisation_name:
        request.company_name || "",
      email: request.email || "",
      first_name: nameParts[0] || "",
      last_name:
        nameParts.slice(1).join(" ") || "",
      phone_number:
        request.phone_number || "",
      time_zone: "Asia/Kolkata",
      country: "",
      industry: "",
      website_url: "",
    });

    handleCloseInviteMenu();

    setAmProvisionedOpen(true);
  };

  /* =========================================
     AM PROVISIONED FORM CHANGE
  ========================================= */

  const handleAmProvisionedChange = (
    event
  ) => {
    const { name, value } = event.target;

    setAmProvisionedForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================
     SUBMIT AM PROVISIONED
  ========================================= */

  const handleSubmitAmProvisioned = async () => {
    if (!selectedDemoRequest) {
      return;
    }

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
      (field) =>
        !String(
          amProvisionedForm[field] || ""
        ).trim()
    );

    if (hasMissingFields) {
      console.error(
        "Please fill all required AM provisioned fields."
      );
      return;
    }

    try {
      setSendingInviteId(
        selectedDemoRequest.demo_request_id
      );

      /*
       * STEP 1
       * Create AM provisioned onboarding
       *
       * POST /acc/send-invitation
       *
       * Note:
       * This API uses "Industry" with a capital I.
       */

      const invitationResponse =
        await sendCustomerInvite({
          invite_type: "provision_signup",

          demo_request_id:
            selectedDemoRequest.demo_request_id,

          organisation_name:
            amProvisionedForm.organisation_name,

          email:
            amProvisionedForm.email,

          first_name:
            amProvisionedForm.first_name,

          last_name:
            amProvisionedForm.last_name,

          phone_number:
            amProvisionedForm.phone_number,

          time_zone:
            amProvisionedForm.time_zone,

          country:
            amProvisionedForm.country,

          Industry:
            amProvisionedForm.industry,
        }).unwrap();

      /*
       * STEP 2
       * Get onboarding ID from response
       */

      const onboardingId =
        invitationResponse?.onboarding_id;

      if (!onboardingId) {
        throw new Error(
          "onboarding_id was not returned by send invitation API."
        );
      }

      /*
       * STEP 3
       * Submit provision signup details
       *
       * POST /acc/provision-signup/submit-details
       *
       * Note:
       * This API uses lowercase "industry".
       */

      await submitProvisionSignupDetails({
        onboarding_id: onboardingId,

        first_name:
          amProvisionedForm.first_name,

        last_name:
          amProvisionedForm.last_name,

        phone_number:
          amProvisionedForm.phone_number,

        organisation_name:
          amProvisionedForm.organisation_name,

        country:
          amProvisionedForm.country,

        industry:
          amProvisionedForm.industry,

        website_url:
          amProvisionedForm.website_url,

        time_zone:
          amProvisionedForm.time_zone,
      }).unwrap();

      /*
       * STEP 4
       * Mark invite as sent
       */

      setSentInviteIds((previous) => [
        ...previous,
        selectedDemoRequest.demo_request_id,
      ]);

      /*
       * STEP 5
       * Close dialog
       */

      setAmProvisionedOpen(false);
      setSelectedDemoRequest(null);
    } catch (error) {
      console.error(
        "Failed to complete AM provisioned signup:",
        error
      );
    } finally {
      setSendingInviteId(null);
    }
  };

  /* =========================================
     SEND SELF SIGNUP INVITE
  ========================================= */

  const handleSendInvite = async () => {
    if (!selectedInviteRequestId) {
      return;
    }

    const request = requests.find(
      (item) =>
        item.demo_request_id ===
        selectedInviteRequestId
    );

    if (!request) {
      return;
    }

    const nameParts = (request.name || "")
      .trim()
      .split(/\s+/);

    try {
      setSendingInviteId(
        selectedInviteRequestId
      );

      await sendCustomerInvite({
        invite_type: "self_signup",

        demo_request_id:
          request.demo_request_id,

        organisation_name:
          request.company_name || "",

        email:
          request.email || "",

        first_name:
          nameParts[0] || "",

        last_name:
          nameParts.slice(1).join(" ") || "",

        phone_number:
          request.phone_number || "",

        time_zone: "",

        country: "",

        Industry: "",
      }).unwrap();

      setSentInviteIds((previous) => [
        ...previous,
        selectedInviteRequestId,
      ]);
    } catch (error) {
      console.error(
        "Failed to send customer invite:",
        error
      );
    } finally {
      setSendingInviteId(null);
      handleCloseInviteMenu();
    }
  };

  /* =========================================
     STATUS LABEL
  ========================================= */

  const getStatusLabel = (value) => {
    const item = statuses.find(
      (statusItem) =>
        statusItem.value === value
    );

    return (
      item?.label ||
      value ||
      "-"
    );
  };

  /* =========================================
     STATUS DROPDOWN
  ========================================= */

  const StatusControl = ({ request }) => {
    const isEditing =
      editingRequestId ===
      request.demo_request_id;

    /*
     * Normal state:
     * Show status as Chip.
     *
     * Edit state:
     * Show dropdown.
     */

    if (!isEditing) {
      return (
        <Chip
          label={getStatusLabel(
            request.status
          )}
          size="small"
          sx={{
            minWidth: 90,
            fontSize: 11,
            borderRadius: "7px",
          }}
        />
      );
    }

    return (
      <Select
        autoFocus
        size="small"
        value={request.status || ""}
        disabled={isUpdatingStatus}
        onChange={(event) =>
          handleStatusChange(
            request.demo_request_id,
            event.target.value
          )
        }
        sx={{
          minWidth: 130,
          height: 34,
          fontSize: 12,
          borderRadius: "8px",
          backgroundColor: "#FFFFFF",
        }}
      >
        {statuses.map((item) => (
          <MenuItem
            key={item.value}
            value={item.value}
          >
            {item.label}
          </MenuItem>
        ))}
      </Select>
    );
  };

  /* =========================================
     ASSIGN DROPDOWN
  ========================================= */

  const AssignSelect = ({ request }) => {
    return (
      <Select
        size="small"
        value={request.assigned_to || ""}
        displayEmpty
        disabled={
          isUsersLoading ||
          isUsersError ||
          isAssigning
        }
        onChange={(event) =>
          handleAssign(
            request.demo_request_id,
            event.target.value
          )
        }
        sx={{
          minWidth: 145,
          height: 34,
          fontSize: 12,
          borderRadius: "8px",
          backgroundColor: "#FFFFFF",
        }}
      >
        <MenuItem value="">
          Select User
        </MenuItem>

        {users.map((user) => (
          <MenuItem
            key={user.id}
            value={user.id}
          >
            {user.full_name}
          </MenuItem>
        ))}
      </Select>
    );
  };

  /* =========================================
     INVITE BUTTON
  ========================================= */

  const InviteButton = ({ request }) => {
    const inviteSent =
      sentInviteIds.includes(
        request.demo_request_id
      );

    const isSending =
      sendingInviteId ===
      request.demo_request_id;

    if (inviteSent) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 0.3,
          }}
        >
          <Button
            variant="outlined"
            size="small"
            disabled
            startIcon={
              <CheckOutlinedIcon
                sx={{ fontSize: 16 }}
              />
            }
            sx={{
              height: 34,
              minWidth: 110,
              fontSize: 12,
              textTransform: "none",
              borderRadius: "8px",
            }}
          >
            Invite Sent
          </Button>

          <Typography
            sx={{
              fontSize: 10,
              color: "#8A8A96",
              lineHeight: 1.2,
            }}
          >
            Customer invitation has
            already been sent.
          </Typography>
        </Box>
      );
    }

    return (
      <Button
        variant="contained"
        size="small"
        onClick={(event) =>
          handleOpenInviteMenu(
            event,
            request.demo_request_id
          )
        }
        disabled={isSending}
        sx={{
          height: 34,
          minWidth: 110,
          fontSize: 12,
          textTransform: "none",
          borderRadius: "8px",
          boxShadow: "none",
        }}
      >
        {isSending
          ? "Sending..."
          : "Send Invite"}
      </Button>
    );
  };

  /* =========================================
     EDIT BUTTON
  ========================================= */

  const EditButton = ({ request }) => {
    const isEditing =
      editingRequestId ===
      request.demo_request_id;

    return (
      <Tooltip
        title={
          isEditing
            ? "Close"
            : "Edit Status"
        }
      >
        <IconButton
          size="small"
          onClick={() =>
            setEditingRequestId(
              isEditing
                ? null
                : request.demo_request_id
            )
          }
          sx={{
            width: 34,
            height: 34,
            border:
              "1px solid #E2E2E6",
            borderRadius: "7px",
          }}
        >
          {isEditing ? (
            <CheckOutlinedIcon
              sx={{ fontSize: 16 }}
            />
          ) : (
            <EditOutlinedIcon
              sx={{ fontSize: 16 }}
            />
          )}
        </IconButton>
      </Tooltip>
    );
  };

  /* =========================================
     LOADING
  ========================================= */

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        py={8}
      >
        <CircularProgress />
      </Box>
    );
  }

  /* =========================================
     ERROR
  ========================================= */

  if (isError) {
    return (
      <Alert severity="error">
        Failed to load demo requests.
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        width: "100%",
      }}
    >
      {/* =====================================
          TOP BAR
      ===================================== */}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 2,
          p: 1.5,
          border:
            "1px solid #E8E8EC",
          borderRadius: "10px",
          backgroundColor: "#FFFFFF",
        }}
      >
        {/* Search */}

        <TextField
          size="small"
          placeholder="Search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          sx={{
            width: 240,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              fontSize: 13,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  sx={{
                    fontSize: 18,
                    color: "#9A9AA5",
                  }}
                />
              </InputAdornment>
            ),
          }}
        />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {/* Status Filter */}

          <Select
            size="small"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            displayEmpty
            disabled={
              isStatusLoading ||
              isStatusError
            }
            sx={{
              minWidth: 130,
              fontSize: 13,
              borderRadius: "8px",
            }}
          >
            <MenuItem value="">
              All Requests
            </MenuItem>

            {statuses.map((item) => (
              <MenuItem
                key={item.value}
                value={item.value}
              >
                {item.label}
              </MenuItem>
            ))}
          </Select>

          {/* View Switch */}

          <Box
            sx={{
              display: "flex",
              border:
                "1px solid #E0E0E5",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {/* Grid */}

            <Tooltip title="Grid View">
              <IconButton
                size="small"
                onClick={() =>
                  setViewMode("grid")
                }
                sx={{
                  borderRadius: 0,
                  backgroundColor:
                    viewMode === "grid"
                      ? "#F0F0FF"
                      : "#FFFFFF",
                  color:
                    viewMode === "grid"
                      ? "#3F3BE8"
                      : "#777",
                }}
              >
                <GridViewOutlinedIcon
                  sx={{ fontSize: 19 }}
                />
              </IconButton>
            </Tooltip>

            {/* Table */}

            <Tooltip title="Table View">
              <IconButton
                size="small"
                onClick={() =>
                  setViewMode("table")
                }
                sx={{
                  borderRadius: 0,
                  backgroundColor:
                    viewMode === "table"
                      ? "#F0F0FF"
                      : "#FFFFFF",
                  color:
                    viewMode === "table"
                      ? "#3F3BE8"
                      : "#777",
                }}
              >
                <TableRowsOutlinedIcon
                  sx={{ fontSize: 19 }}
                />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* =====================================
          GRID VIEW
      ===================================== */}

      {viewMode === "grid" && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
            gap: 2,
          }}
        >
          {filteredRequests.map(
            (request) => (
              <Box
                key={
                  request.demo_request_id
                }
                sx={{
                  border:
                    "1px solid #E4E4EA",
                  borderRadius: "12px",
                  backgroundColor:
                    "#FFFFFF",
                  overflow: "hidden",
                }}
              >
                {/* Company */}

                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom:
                      "1px solid #EEEEF2",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 15,
                      fontWeight: 600,
                    }}
                  >
                    {request.company_name}
                  </Typography>
                </Box>

                {/* Request */}

                <Box
                  sx={{
                    p: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 15,
                      fontWeight: 600,
                    }}
                  >
                    {request.name}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "#777",
                      mt: 0.4,
                    }}
                  >
                    {request.email}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "#777",
                    }}
                  >
                    {request.phone_number}
                  </Typography>

                  {/* Controls */}

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    <StatusControl
                      request={request}
                    />

                    <AssignSelect
                      request={request}
                    />

                    <EditButton
                      request={request}
                    />
                  </Box>

                  {/* Invite */}

                  <Box sx={{ mt: 1.5 }}>
                    <InviteButton
                      request={request}
                    />
                  </Box>
                </Box>
              </Box>
            )
          )}
        </Box>
      )}

      {/* =====================================
          TABLE VIEW
      ===================================== */}

      {viewMode === "table" && (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border:
              "1px solid #E4E4EA",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor:
                    "#F7F7F8",
                }}
              >
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  Name
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  Email
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  Phone
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  Status
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredRequests.map(
                (request) => (
                  <TableRow
                    key={
                      request.demo_request_id
                    }
                    hover
                  >
                    {/* Name */}

                    <TableCell
                      sx={{
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      {request.name || "-"}
                    </TableCell>

                    {/* Email */}

                    <TableCell
                      sx={{
                        fontSize: 13,
                        color: "#666",
                      }}
                    >
                      {request.email || "-"}
                    </TableCell>

                    {/* Phone */}

                    <TableCell
                      sx={{
                        fontSize: 13,
                        color: "#666",
                      }}
                    >
                      {request.phone_number ||
                        "-"}
                    </TableCell>

                    {/* Status */}

                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: 1,
                        }}
                      >
                        <StatusControl
                          request={request}
                        />

                        <EditButton
                          request={request}
                        />
                      </Box>
                    </TableCell>

                    {/* Actions */}

                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent:
                            "center",
                          alignItems:
                            "center",
                          gap: 1,
                        }}
                      >
                        <AssignSelect
                          request={request}
                        />

                        <InviteButton
                          request={request}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              )}

              {!filteredRequests.length && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                    sx={{
                      py: 6,
                      color: "#9696A6",
                    }}
                  >
                    No demo requests
                    found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* =====================================
          EMPTY GRID
      ===================================== */}

      {!filteredRequests.length &&
        viewMode === "grid" && (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              color: "#9696A6",
            }}
          >
            No demo requests found.
          </Box>
        )}

      {/* =====================================
          INVITE MENU
      ===================================== */}

      <Menu
        anchorEl={inviteMenuAnchor}
        open={Boolean(
          inviteMenuAnchor
        )}
        onClose={
          handleCloseInviteMenu
        }
      >
        <MenuItem
          onClick={handleSendInvite}
        >
          Self Signup
        </MenuItem>

        <MenuItem
          onClick={handleOpenAmProvisioned}
        >
          AM Provisioned
        </MenuItem>
      </Menu>

      {/* =====================================
          AM PROVISIONED DIALOG
      ===================================== */}

      <Dialog
        open={amProvisionedOpen}
        onClose={() => {
          if (
            !sendingInviteId &&
            !isSubmittingProvision
          ) {
            setAmProvisionedOpen(false);
            setSelectedDemoRequest(null);
          }
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          AM Provisioned
        </DialogTitle>

        <DialogContent dividers>
          <Grid
            container
            spacing={2}
            sx={{ mt: 0.5 }}
          >
            {/* Organisation Name */}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Organisation Name"
                name="organisation_name"
                value={
                  amProvisionedForm.organisation_name
                }
                onChange={
                  handleAmProvisionedChange
                }
              />
            </Grid>

            {/* Email */}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Email"
                name="email"
                type="email"
                value={
                  amProvisionedForm.email
                }
                onChange={
                  handleAmProvisionedChange
                }
              />
            </Grid>

            {/* First Name */}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="First Name"
                name="first_name"
                value={
                  amProvisionedForm.first_name
                }
                onChange={
                  handleAmProvisionedChange
                }
              />
            </Grid>

            {/* Last Name */}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Last Name"
                name="last_name"
                value={
                  amProvisionedForm.last_name
                }
                onChange={
                  handleAmProvisionedChange
                }
              />
            </Grid>

            {/* Phone Number */}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Phone Number"
                name="phone_number"
                value={
                  amProvisionedForm.phone_number
                }
                onChange={
                  handleAmProvisionedChange
                }
              />
            </Grid>

            {/* Time Zone */}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Time Zone"
                name="time_zone"
                value={
                  amProvisionedForm.time_zone
                }
                onChange={
                  handleAmProvisionedChange
                }
              />
            </Grid>

            {/* Country */}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Country"
                name="country"
                value={
                  amProvisionedForm.country
                }
                onChange={
                  handleAmProvisionedChange
                }
              />
            </Grid>

            {/* Industry */}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Industry"
                name="industry"
                value={
                  amProvisionedForm.industry
                }
                onChange={
                  handleAmProvisionedChange
                }
              />
            </Grid>

            {/* Website URL */}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Website URL"
                name="website_url"
                value={
                  amProvisionedForm.website_url
                }
                onChange={
                  handleAmProvisionedChange
                }
                placeholder="https://example.com"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
          }}
        >
          <Button
            onClick={() => {
              setAmProvisionedOpen(false);
              setSelectedDemoRequest(null);
            }}
            disabled={
              Boolean(sendingInviteId) ||
              isSubmittingProvision
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              handleSubmitAmProvisioned
            }
            disabled={
              Boolean(sendingInviteId) ||
              isSubmittingProvision
            }
          >
            {sendingInviteId ||
            isSubmittingProvision
              ? "Submitting..."
              : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DemoRequests;