import { Card, Box, Typography, Chip } from "@mui/material";
import { Doughnut } from "react-chartjs-2";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import PersonOffOutlined from "@mui/icons-material/PersonOffOutlined";
import ShoppingCartOutlined from "@mui/icons-material/ShoppingCartOutlined";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";

const donutData = {
  labels: ["Male", "Female"],
  datasets: [
    {
      data: [5.5, 3.5],
      backgroundColor: ["#E8590C", "#0F9D8A"],
      borderWidth: 0,
    },
  ],
};

const donutOptions = {
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
};

export default function HiringRisk() {
  return (
    <Card
      sx={{
        borderRadius: 2,
        border: "1px solid #E5E7EB",
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, flexShrink: 0 }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1,
            bgcolor: "#EEF2FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <InfoOutlined fontSize="small" />
        </Box>
        <Typography fontWeight={600}>Hiring risk alerts</Typography>
      </Box>

      {/* Risk Stats */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <RiskTile
          icon={<GroupsOutlined />}
          label="Notice-servers"
          value="6987"
          bg="#E0ECFF"
          color="#2563EB"
        />
        <RiskTile
          icon={<PersonOffOutlined />}
          label="Drop-offs"
          value="4896"
          bg="#FFF1E6"
          color="#F97316"
        />
        <RiskTile
          icon={<ShoppingCartOutlined />}
          label="Delays"
          value="487"
          bg="#ECFDF5"
          color="#059669"
        />
      </Box>

      {/* Gender Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexShrink={0}>
        <Typography fontWeight={600} fontSize={14}>
          Male female ratio
        </Typography>
        <Chip
          size="small"
          icon={<CalendarMonthOutlined />}
          label="Jan"
          variant="outlined"
        />
      </Box>

      {/* Gender Content — donut + stats sit together, not stretched across the card */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
        <Box sx={{ width: 130, height: 130, flexShrink: 0 }}>
          <Doughnut data={donutData} options={donutOptions} />
        </Box>

        <Box sx={{ display: "flex", gap: 4 }}>
          <GenderStat value="5.5K" label="Male" color="#E8590C" />
          <GenderStat value="3.5K" label="Female" color="#0F9D8A" />
        </Box>
      </Box>
    </Card>
  );
}

function RiskTile({ icon, label, value, bg, color }) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        border: "1px solid #E5E7EB",
        borderRadius: 2,
        p: 1.5,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 1,
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          mx: "auto",
          bgcolor: bg,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography fontSize={13} color="text.secondary" noWrap>
          {label}
        </Typography>
        <Typography fontWeight={700}>{value}</Typography>
      </Box>
    </Box>
  );
}

function GenderStat({ value, label, color }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0.5 }}>
      <Typography fontWeight={700} fontSize={18}>
        {value}
      </Typography>
      <Typography fontSize={12} sx={{ color }}>
        {label}
      </Typography>
      <Chip
        size="small"
        label="↑ 25%"
        sx={{
          bgcolor: `${color}22`,
          color,
          fontWeight: 600,
        }}
      />
    </Box>
  );
}