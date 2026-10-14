import { Grid, Card, Box, Typography } from "@mui/material";
import LayersOutlined from "@mui/icons-material/LayersOutlined";
// import PieChartOutline from "@mui/icons-material/PieChartOutline";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TagOutlined from "@mui/icons-material/TagOutlined";

const cards = [
  {
    title: "Total Jobs",
    value: "$8,458,798",
    change: "+35%",
    positive: true,
    icon: <LayersOutlined />,
    iconBg: "#E0F2FE",
    iconColor: "#0284C7",
  },
  {
    title: "Open Jobs",
    value: "$48,988,78",
    change: "-19%",
    positive: false,
    icon: <DonutLargeIcon/>,
    iconBg: "#ECFEF3",
    iconColor: "#059669",
  },
  {
    title: "Closed Jobs",
    value: "$8,980,097",
    change: "+41%",
    positive: true,
    icon: <CheckCircleIcon/>,
    iconBg: "#FFF1E6",
    iconColor: "#F97316",
  },
  {
    title: "Shortlisted",
    value: "$78,458,798",
    change: "-20%",
    positive: false,
    icon: <TagOutlined />,
    iconBg: "#EEF2FF",
    iconColor: "#6366F1",
  },
];

export default function KpiCards() {
  return (
    <Grid container spacing={2} sx={{ width: "100%" }}>
      {cards.map((card, index) => (
        <Grid
          key={index}
          item
          size={{ xs: 12, sm: 6, md: 3 }}
          sx={{
            display: "flex",   // 🔑 required
            minWidth: 0,       // 🔑 required
          }}
        >
          <Card
            sx={{
              width: "100%",   // 🔑 required
              flexGrow: 1,     // 🔑 required
              p: 2,
              borderRadius: 2,
              border: "1px solid #E5E7EB",
              boxShadow: "0px 2px 6px rgba(0,0,0,0.04)",
            }}
          >
            {/* Top */}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={700} fontSize={18} noWrap>
                  {card.value}
                </Typography>
                <Typography fontSize={13} color="text.secondary" noWrap>
                  {card.title}
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  backgroundColor: card.iconBg,
                  color: card.iconColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {card.icon}
              </Box>
            </Box>

            {/* Bottom */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={2}
            >
              <Typography
                fontSize={12}
                color={card.positive ? "#16A34A" : "#DC2626"}
                fontWeight={500}
                noWrap
              >
                {card.change}{" "}
                <Typography
                  component="span"
                  fontSize={12}
                  color="text.secondary"
                >
                  vs Last Month
                </Typography>
              </Typography>

              <Typography
                fontSize={12}
                sx={{
                  cursor: "pointer",
                  color: "#2563EB",
                  fontWeight: 500,
                }}
                noWrap
              >
                View All
              </Typography>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}