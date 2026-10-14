import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { CheckCircle, GroupsOutlined } from "@mui/icons-material";
import { toast } from "react-toastify";
import {
  useCloseRequestAndAddCandidatesMutation,
  useGetRequestCandidateScoresQuery,
} from "../../redux/services/drawerService/drawerService";

const CandidateAssignmentDialog = ({ open, onClose, requestId, jobTitle }) => {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetRequestCandidateScoresQuery(requestId, {
    skip: !open || !requestId,
    refetchOnMountOrArgChange: true,
  });
  const [assignCandidates, { isLoading: isAssigning, error: assignError }] =
    useCloseRequestAndAddCandidatesMutation();
  const candidates = Array.isArray(data?.candidates) ? data.candidates : [];
  const loading = isLoading || isFetching;

  const handleAssign = async () => {
    if (!requestId || candidates.length === 0 || isAssigning) return;
    try {
      await assignCandidates({
        requestUuid: requestId,
        candidateIds: candidates.map((candidate) => candidate.candidate_id),
      }).unwrap();
      toast.success("Candidates assigned successfully.");
      onClose();
    } catch {
      // Keep the dialog open so the user can retry.
    }
  };

  return (
    <Dialog open={open} onClose={isAssigning ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: "#FFF1EB", color: "#FF5722", display: "grid", placeItems: "center" }}>
            <GroupsOutlined fontSize="small" />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography fontSize={17} fontWeight={700} color="#172033">Assign candidates</Typography>
            <Typography fontSize={12} color="#667085" noWrap>{jobTitle || "Hiring request"}</Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{ bgcolor: "#FCFCFD", minHeight: 170 }}>
        {loading && <Box sx={{ minHeight: 150, display: "grid", placeItems: "center" }}><CircularProgress sx={{ color: "#FF5722" }} /></Box>}
        {!loading && isError && (
          <Alert severity="error" action={<Button color="inherit" size="small" onClick={refetch}>Retry</Button>}>
            Unable to load matched candidates.
          </Alert>
        )}
        {!loading && !isError && candidates.length === 0 && (
          <Box sx={{ minHeight: 150, display: "grid", placeItems: "center", textAlign: "center" }}>
            <Box>
              <GroupsOutlined sx={{ color: "#98A2B3", fontSize: 34, mb: 1 }} />
              <Typography fontWeight={650} color="#344054">No matched candidates</Typography>
              <Typography fontSize={13} color="#667085" sx={{ mt: 0.4 }}>There are no candidates available to assign to this request.</Typography>
            </Box>
          </Box>
        )}
        {!loading && candidates.length > 0 && (
          <Stack spacing={1}>
            <Typography fontSize={13} color="#667085" sx={{ mb: 0.25 }}>
              Review the matched candidates before assigning them. This action also closes the request.
            </Typography>
            {candidates.map((candidate, index) => (
              <Box key={candidate.candidate_id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, p: 1.5, borderRadius: 2, border: "1px solid #EAECF0", bgcolor: "#fff" }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontSize={14} fontWeight={650} color="#344054" noWrap>{candidate.candidate_name || `Candidate ${index + 1}`}</Typography>
                  <Typography fontSize={12} color="#667085" noWrap>{candidate.experience || candidate.email || "Matched candidate"}</Typography>
                </Box>
                <Chip size="small" icon={<CheckCircle sx={{ fontSize: "15px !important" }} />} label={`${Math.round(Number(candidate.skillintel_score) || 0)}% match`} sx={{ color: "#087E8B", bgcolor: "#E7F6F7", fontWeight: 700, flexShrink: 0 }} />
              </Box>
            ))}
          </Stack>
        )}
        {assignError && <Alert severity="error" sx={{ mt: 1.5 }}>{assignError?.data?.message || assignError?.data?.detail || "Unable to assign candidates. Please try again."}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 2.5, py: 1.75 }}>
        <Button onClick={onClose} disabled={isAssigning} sx={{ textTransform: "none", color: "#667085" }}>Cancel</Button>
        <Button variant="contained" onClick={handleAssign} disabled={loading || isError || candidates.length === 0 || isAssigning} startIcon={isAssigning ? <CircularProgress size={15} color="inherit" /> : <CheckCircle />} sx={{ textTransform: "none", bgcolor: "#FF5722", fontWeight: 700, boxShadow: "none", "&:hover": { bgcolor: "#E64A19", boxShadow: "none" } }}>
          {isAssigning ? "Assigning..." : `Assign ${candidates.length} candidate${candidates.length === 1 ? "" : "s"}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CandidateAssignmentDialog;
