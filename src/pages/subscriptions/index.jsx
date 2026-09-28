import React, { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import {
  ViewList,
  GridView,
  CheckCircle,
  Cancel,
  CalendarMonth,
  People,
  AttachMoney,
} from "@mui/icons-material";

import ReusableMRT from "../../components/table";

const PRIMARY_COLOR = "#FF5722";

const Subscriptions = () => {
  const [viewMode, setViewMode] = useState("list");
  const [tab, setTab] = useState("active");
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  const subscriptions = [
    {
      id: "SUB-001",
      customerName: "John Smith",
      email: "john.smith@example.com",
      plan: "Premium",
      billingCycle: "Monthly",
      amount: "$29.99",
      startDate: "2026-09-01",
      nextBillingDate: "2026-10-01",
      status: "Active",
      users: 5,
    },
    {
      id: "SUB-002",
      customerName: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      plan: "Basic",
      billingCycle: "Monthly",
      amount: "$9.99",
      startDate: "2026-08-15",
      nextBillingDate: "2026-10-15",
      status: "Active",
      users: 2,
    },
    {
      id: "SUB-003",
      customerName: "Michael Brown",
      email: "michael.brown@example.com",
      plan: "Enterprise",
      billingCycle: "Yearly",
      amount: "$499.99",
      startDate: "2026-01-10",
      nextBillingDate: "2027-01-10",
      status: "Active",
      users: 25,
    },
    {
      id: "SUB-004",
      customerName: "Emily Davis",
      email: "emily.davis@example.com",
      plan: "Premium",
      billingCycle: "Monthly",
      amount: "$29.99",
      startDate: "2026-07-20",
      nextBillingDate: "-",
      status: "Inactive",
      users: 4,
    },
    {
      id: "SUB-005",
      customerName: "David Wilson",
      email: "david.wilson@example.com",
      plan: "Basic",
      billingCycle: "Monthly",
      amount: "$9.99",
      startDate: "2026-06-18",
      nextBillingDate: "-",
      status: "Inactive",
      users: 1,
    },
    {
      id: "SUB-006",
      customerName: "Jessica Taylor",
      email: "jessica.taylor@example.com",
      plan: "Premium",
      billingCycle: "Yearly",
      amount: "$299.99",
      startDate: "2026-03-12",
      nextBillingDate: "-",
      status: "Inactive",
      users: 8,
    },
  ];

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((item) =>
      tab === "active"
        ? item.status === "Active"
        : item.status === "Inactive"
    );
  }, [tab]);

  const activeCount = subscriptions.filter(
    (item) => item.status === "Active"
  ).length;

  const inactiveCount = subscriptions.filter(
    (item) => item.status === "Inactive"
  ).length;

  const columnData = [
    {
      accessorKey: "id",
      header: "Subscription ID",
    },
    {
      accessorKey: "customerName",
      header: "Customer Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "plan",
      header: "Plan",
    },
    {
      accessorKey: "billingCycle",
      header: "Billing Cycle",
    },
    {
      accessorKey: "amount",
      header: "Amount",
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
    },
    {
      accessorKey: "nextBillingDate",
      header: "Next Billing Date",
    },
    {
      accessorKey: "status",
      header: "Status",
      Cell: ({ cell }) => {
        const status = cell.getValue();
        const isActive = status === "Active";

        return (
          <Chip
            size="small"
            label={status}
            icon={
              isActive ? (
                <CheckCircle sx={{ fontSize: 15 }} />
              ) : (
                <Cancel sx={{ fontSize: 15 }} />
              )
            }
            sx={{
              fontWeight: 600,
              fontSize: "12px",
              backgroundColor: isActive ? "#FFF0EB" : "#FDECEC",
              color: isActive ? PRIMARY_COLOR : "#DC2626",
              "& .MuiChip-icon": {
                color: "inherit",
              },
            }}
          />
        );
      },
    },
  ];

  const SubscriptionCard = ({ subscription }) => {
    const isActive = subscription.status === "Active";

    return (
      <Card
        onClick={() => setSelectedSubscription(subscription)}
        sx={{
          borderRadius: "14px",
          border: "1px solid #E5E7EB",
          boxShadow: "none",
          cursor: "pointer",
          transition: "all 0.2s ease",
          backgroundColor: "#fff",

          "&:hover": {
            borderColor: PRIMARY_COLOR,
            boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
            transform: "translateY(-2px)",
          },
        }}
      >
        <CardContent sx={{ p: 2.2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.3,
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "10px",
                  backgroundColor: "#FFF0EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: PRIMARY_COLOR,
                }}
              >
                <AttachMoney fontSize="small" />
              </Box>

              <Box>
                <Typography
                  fontSize="15px"
                  fontWeight={700}
                  color="#1F2937"
                >
                  {subscription.plan}
                </Typography>

                <Typography
                  fontSize="12px"
                  color="#9CA3AF"
                  sx={{ mt: 0.2 }}
                >
                  {subscription.id}
                </Typography>
              </Box>
            </Box>

            <Chip
              size="small"
              label={subscription.status}
              icon={
                isActive ? (
                  <CheckCircle sx={{ fontSize: 14 }} />
                ) : (
                  <Cancel sx={{ fontSize: 14 }} />
                )
              }
              sx={{
                height: 25,
                fontSize: "11px",
                fontWeight: 600,
                backgroundColor: isActive ? "#FFF0EB" : "#FDECEC",
                color: isActive ? PRIMARY_COLOR : "#DC2626",
                "& .MuiChip-icon": {
                  color: "inherit",
                },
              }}
            />
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ mb: 2 }}>
            <Typography
              fontSize="12px"
              color="#9CA3AF"
              sx={{ mb: 0.3 }}
            >
              Customer
            </Typography>

            <Typography
              fontSize="14px"
              fontWeight={600}
              color="#374151"
            >
              {subscription.customerName}
            </Typography>

            <Typography fontSize="12px" color="#6B7280">
              {subscription.email}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1.8,
            }}
          >
            <Box>
              <Typography
                fontSize="11px"
                color="#9CA3AF"
                sx={{ mb: 0.4 }}
              >
                Billing
              </Typography>

              <Typography
                fontSize="13px"
                fontWeight={600}
                color="#374151"
              >
                {subscription.billingCycle}
              </Typography>
            </Box>

            <Box>
              <Typography
                fontSize="11px"
                color="#9CA3AF"
                sx={{ mb: 0.4 }}
              >
                Amount
              </Typography>

              <Typography
                fontSize="13px"
                fontWeight={600}
                color="#374151"
              >
                {subscription.amount}
              </Typography>
            </Box>

            <Box>
              <Typography
                fontSize="11px"
                color="#9CA3AF"
                sx={{ mb: 0.4 }}
              >
                Users
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <People
                  sx={{
                    fontSize: 15,
                    color: PRIMARY_COLOR,
                  }}
                />

                <Typography
                  fontSize="13px"
                  fontWeight={600}
                  color="#374151"
                >
                  {subscription.users}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography
                fontSize="11px"
                color="#9CA3AF"
                sx={{ mb: 0.4 }}
              >
                Next Billing
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <CalendarMonth
                  sx={{
                    fontSize: 15,
                    color: PRIMARY_COLOR,
                  }}
                />

                <Typography
                  fontSize="13px"
                  fontWeight={600}
                  color="#374151"
                >
                  {subscription.nextBillingDate}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "calc(100vh - 135px)",
        backgroundColor: "#fff",
        overflow: "hidden",
      }}
    >
      {/* Top Controls */}
      <Box
        sx={{
          height: "70px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.5,
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        {/* Active / InActive Tabs */}
        <Tabs
          value={tab}
          onChange={(event, value) => setTab(value)}
          sx={{
            minHeight: 42,

            "& .MuiTabs-indicator": {
              display: "none",
            },

            "& .MuiTab-root": {
              minHeight: 40,
              minWidth: 110,
              textTransform: "none",
              fontSize: "14px",
              fontWeight: 500,
              color: "#6B7280",
              borderRadius: "8px",
              mr: 0.5,
            },

            "& .Mui-selected": {
              color: `${PRIMARY_COLOR} !important`,
              backgroundColor: "#FFF0EB",
              fontWeight: 600,
            },
          }}
        >
          <Tab
            value="active"
            label={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                }}
              >
                <CheckCircle sx={{ fontSize: 17 }} />
                Active
                <Typography
                  component="span"
                  fontSize="11px"
                  fontWeight={600}
                >
                  ({activeCount})
                </Typography>
              </Box>
            }
          />

          <Tab
            value="inactive"
            label={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                }}
              >
                <Cancel sx={{ fontSize: 17 }} />
                InActive
                <Typography
                  component="span"
                  fontSize="11px"
                  fontWeight={600}
                >
                  ({inactiveCount})
                </Typography>
              </Box>
            }
          />
        </Tabs>

        {/* List / Grid Toggle */}
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            backgroundColor: "#F3F4F6",
            borderRadius: "9px",
            p: 0.4,
          }}
        >
          <IconButton
            size="small"
            onClick={() => setViewMode("list")}
            sx={{
              width: 38,
              height: 34,
              borderRadius: "7px",
              backgroundColor:
                viewMode === "list"
                  ? PRIMARY_COLOR
                  : "transparent",
              color:
                viewMode === "list" ? "#fff" : "#6B7280",

              "&:hover": {
                backgroundColor:
                  viewMode === "list"
                    ? PRIMARY_COLOR
                    : "#E5E7EB",
              },
            }}
          >
            <ViewList fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => setViewMode("grid")}
            sx={{
              width: 38,
              height: 34,
              borderRadius: "7px",
              backgroundColor:
                viewMode === "grid"
                  ? PRIMARY_COLOR
                  : "transparent",
              color:
                viewMode === "grid" ? "#fff" : "#6B7280",

              "&:hover": {
                backgroundColor:
                  viewMode === "grid"
                    ? PRIMARY_COLOR
                    : "#E5E7EB",
              },
            }}
          >
            <GridView fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* Content */}
      <Box
        sx={{
          height: "calc(100% - 70px)",
          overflow: "hidden",
          p: 2,
        }}
      >
        {viewMode === "list" ? (
          <ReusableMRT
            data={filteredSubscriptions}
            columnData={columnData}
            enableRowActions={false}
            enableRowClickModal={false}
            onRowClick={(row) =>
              setSelectedSubscription(row)
            }
            height="calc(100vh - 215px)"
          />
        ) : (
          <Box
            sx={{
              height: "100%",
              overflowY: "auto",
              pr: 0.5,

              "&::-webkit-scrollbar": {
                width: "6px",
              },

              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#D1D5DB",
                borderRadius: "6px",
              },
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                  xl: "repeat(4, 1fr)",
                },
                gap: 2,
              }}
            >
              {filteredSubscriptions.map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                />
              ))}
            </Box>

            {filteredSubscriptions.length === 0 && (
              <Box
                sx={{
                  height: "70%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  color: "#9CA3AF",
                }}
              >
                <Cancel
                  sx={{
                    fontSize: 42,
                    mb: 1,
                    color: "#D1D5DB",
                  }}
                />

                <Typography fontSize="14px">
                  No subscriptions found
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Subscriptions;