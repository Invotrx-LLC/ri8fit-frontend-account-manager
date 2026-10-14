import { Box, Typography, Button } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

export default function Header() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
      }}
    >
      <Box>
        <Typography variant="h5">Welcome, Shashikumar</Typography>
        <Typography color="text.secondary">
          Here's the latest on your team's hires, shifts, and top performers
        </Typography>
      </Box>

      <Button
        startIcon={<CalendarMonthIcon />}
        variant="outlined"
        sx={{ borderRadius: 2 }}
      >
        01 Jan 2026 - 07 Jan 2026
      </Button>
    </Box>
  );
}