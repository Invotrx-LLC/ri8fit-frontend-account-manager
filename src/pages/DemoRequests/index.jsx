import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  Paper,
  TextField,
  InputAdornment,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";



import {
  useGetDemoRequestsQuery,
  useGetDemoRequestStatusesQuery,
  useGetAllInternalUsersQuery,
} from "../../redux/services/demo/demo";

import {
  TOKENS,
  StatusPill,
  formatDate,
  DEMO_REQUESTS_PATH,
} from "./demoRequestUi";
import ReusableMRT from "../../components/table";
import AddDemoRequest from "./AddDemoRequest";

/* =========================================
   SHARED STYLES
========================================= */

const filterSelectSx = {
  minWidth: 150,
  height: 34,
  fontSize: 12.5,
  color: TOKENS.textPrimary,
  borderRadius: "8px",
  backgroundColor: "#FFFFFF",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: TOKENS.border,
  },
};

/* Column header look (grey bar like the design) */
const headCellProps = {
  sx: {
    backgroundColor: `${TOKENS.headerBg} !important`,
    color: TOKENS.textSecondary,
    fontSize: 12.5,
    fontWeight: 500,
    fontFamily: TOKENS.fontFamily,
  },
};

const DemoRequests = () => {
  const navigate = useNavigate();

  /* =========================================
     FILTER / SEARCH
  ========================================= */

  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  /* =========================================
     API
  ========================================= */

  const { data, isLoading, isError } =
    useGetDemoRequestsQuery(
      status ? { status } : {},
      {
        pollingInterval: 30_000,
        refetchOnFocus: true,
        refetchOnReconnect: true,
      }
    );

  const {
    data: statusData,
    isLoading: isStatusLoading,
    isError: isStatusError,
  } = useGetDemoRequestStatusesQuery();

  const { data: usersData } =
    useGetAllInternalUsersQuery();

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
     COLUMNS  (must stay above early returns)
  ========================================= */

  const columnData = useMemo(() => {
    const getStatusLabel = (value) =>
      statuses.find((item) => item.value === value)
        ?.label ||
      value ||
      "-";

    const getUserName = (userId) =>
      users.find((item) => item.id === userId)
        ?.full_name || "";

    return [
      {
        accessorKey: "name",
        header: "Name",
        muiTableHeadCellProps: headCellProps,
        cellSx: {
          color: TOKENS.textPrimary,
          fontWeight: 500,
        },
        Cell: ({ row }) => row.original.name || "-",
      },
      {
        accessorKey: "company_name",
        header: "Company",
        muiTableHeadCellProps: headCellProps,
        Cell: ({ row }) =>
          row.original.company_name || "-",
      },
      {
        accessorKey: "email",
        header: "Email",
        muiTableHeadCellProps: headCellProps,
        Cell: ({ row }) => row.original.email || "-",
      },
      {
        accessorKey: "phone_number",
        header: "Phone",
        muiTableHeadCellProps: headCellProps,
        Cell: ({ row }) =>
          row.original.phone_number || "-",
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (row) => getStatusLabel(row.status),
        muiTableHeadCellProps: headCellProps,
        Cell: ({ row }) => (
          <StatusPill
            value={row.original.status}
            label={getStatusLabel(row.original.status)}
          />
        ),
      },
      {
        id: "assigned_to",
        header: "Assigned To",
        accessorFn: (row) =>
          getUserName(row.assigned_to) || "Unassigned",
        muiTableHeadCellProps: headCellProps,
        Cell: ({ row }) => {
          const name = getUserName(
            row.original.assigned_to
          );

          return (
            <Box
              component="span"
              sx={{
                color: name
                  ? TOKENS.textSecondary
                  : TOKENS.textMuted,
              }}
            >
              {name || "Unassigned"}
            </Box>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "Created",
        muiTableHeadCellProps: headCellProps,
        Cell: ({ row }) =>
          formatDate(row.original.created_at),
      },
    ];
  }, [statuses, users]);

  /* =========================================
     LOADING / ERROR
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
        p: 1,
        width: "100%",
        minHeight: "100%",
        backgroundColor: TOKENS.pageBg,
        fontFamily: TOKENS.fontFamily,
      }}
    >
      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <Box sx={{ mb: 1 }}>
        <Typography
          sx={{
            fontSize: 24,
            fontWeight: 700,
            color: TOKENS.textPrimary,
            lineHeight: 1.2,
          }}
        >
          Demo Requests
        </Typography>

        <Typography
          sx={{
            fontSize: 13,
            color: TOKENS.textSecondary,
            mt: 0.5,
          }}
        >
          Track incoming demo requests, assign owners
          and send customer invitations.
        </Typography>
      </Box>

      {/* =====================================
          CARD
      ===================================== */}

      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${TOKENS.border}`,
          borderRadius: "12px",
          backgroundColor: TOKENS.cardBg,
          overflow: "hidden",
        }}
      >
        {/* Toolbar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            p: 2,
          }}
        >
          <TextField
            size="small"
            placeholder="Search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            sx={{
              width: 260,
              "& .MuiOutlinedInput-root": {
                height: 34,
                borderRadius: "8px",
                fontSize: 12.5,
                backgroundColor: "#FFFFFF",
                "& fieldset": {
                  borderColor: TOKENS.border,
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    sx={{
                      fontSize: 17,
                      color: TOKENS.textMuted,
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
              gap: 1.5,
            }}
          >
            <Select
              size="small"
              value={status}
              displayEmpty
              onChange={(event) =>
                setStatus(event.target.value)
              }
              disabled={
                isStatusLoading || isStatusError
              }
              sx={filterSelectSx}
            >
              <MenuItem value="">
                Filter by status
              </MenuItem>

              {statuses.map((item) => (
                <MenuItem
                  key={item.value}
                  value={item.value}
                  sx={{ fontSize: 13 }}
                >
                  {item.label}
                </MenuItem>
              ))}
            </Select>

            {/* POST /acc/demo-requests/create-on-behalf */}
            <AddDemoRequest />
          </Box>
        </Box>
        {/* Reusable table */}

        <ReusableMRT
          data={filteredRequests}
          columnData={columnData}
          height="calc(100vh - 215px)"
          enableRowActions={false}
          enableRowSelection={false}
          enableRowClickModal={false}
          enableGlobalFilter={false}
          onRowClick={(request) =>
            navigate(
              `${DEMO_REQUESTS_PATH}/${request.demo_request_id}`
            )
          }
        />
      </Paper>
    </Box>
  );
};

export default DemoRequests;