import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ReplayIcon from "@mui/icons-material/Replay";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import { useGetOrganisationBillingEstimateQuery, useGetOrganisationCurrentBillingQuery, useGetOrganisationInvoicesQuery } from "../../redux/services/subscriptions/subscriptions";
import { CheckCircleOutlineOutlined } from "@mui/icons-material";

const ACCENT = "#FF5722";
const BILLING_PALETTE = [
  { main: "#E85D2A", soft: "#FFF1EB", border: "#FFD5C5" },
  { main: "#2563EB", soft: "#EFF6FF", border: "#BFDBFE" },
  { main: "#7C3AED", soft: "#F5F3FF", border: "#DDD6FE" },
  { main: "#0F8B8D", soft: "#ECFEFF", border: "#A5F3FC" },
];
const USAGE_METRICS = [
  ["users_count", "max_users", "Users"],
  ["jobs_count", "max_jobs", "Jobs"],
  ["candidate_uploads_count", "max_candidate_uploads", "Candidate uploads"],
  ["matches_count", "max_matches", "Matches"],
  ["interviews_count", "max_interviews", "Interviews"],
  ["skill_intel_profiles_count", "max_skill_intel_profiles", "Skill intel profiles"],
  ["background_verifications_count", "max_background_verifications", "Background verifications"],
];

const formatDate = (value) => value ? new Intl.DateTimeFormat("en-GB", {
  day: "2-digit", month: "short", year: "numeric",
}).format(new Date(value)) : "—";
const formatCurrency = (value) => value === null || value === undefined
  ? "—"
  : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value));
const titleCase = (value) => value
  ? value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase())
  : "—";
const formatPlanName = (value) => String(value || "").toLowerCase() === "payg"
  ? "Premium"
  : titleCase(value);
const formatSubscriptionStatus = (value) => titleCase(value).replace(/\bPayg\b/gi, "Premium");

const SectionHeading = ({ eyebrow, title, description, accent = ACCENT }) => (
  <Stack direction="row" spacing={1.5} alignItems="flex-start">
    <Box sx={{ width: 4, alignSelf: "stretch", minHeight: 42, borderRadius: 4, bgcolor: accent }} />
    <Box>
      <Typography component="div" sx={{ color: accent, fontSize: 10, fontWeight: 800, letterSpacing: ".1em", lineHeight: 1.3, textTransform: "uppercase", mb: 0.5 }}>
        {eyebrow}
      </Typography>
      <Typography component="h2" sx={{ color: "#101828", fontSize: { xs: 19, sm: 21 }, fontWeight: 800, letterSpacing: "-.35px", lineHeight: 1.25 }}>
        {title}
      </Typography>
      {description && (
        <Typography sx={{ color: "#667085", fontSize: 13, lineHeight: 1.5, mt: 0.55 }}>
          {description}
        </Typography>
      )}
    </Box>
  </Stack>
);

export default function Billing({ orgId }) {
  const [invoicePage, setInvoicePage] = useState(1);
  const {
    data: currentResponse,
    isLoading: isCurrentLoading,
    isError: isCurrentError,
    error: currentError,
    refetch: refetchCurrent,
    isFetching: isCurrentFetching,
  } = useGetOrganisationCurrentBillingQuery(orgId, { skip: !orgId });
  const {
    data: estimateResponse,
    isLoading: isEstimateLoading,
    isError: isEstimateError,
    error: estimateError,
    refetch: refetchEstimate,
    isFetching: isEstimateFetching,
  } = useGetOrganisationBillingEstimateQuery(orgId, { skip: !orgId });
  const {
    data: invoicesResponse,
    isLoading: areInvoicesLoading,
    isError: areInvoicesError,
    error: invoicesError,
    refetch: refetchInvoices,
    isFetching: areInvoicesFetching,
  } = useGetOrganisationInvoicesQuery(
    { organisationId: orgId, page: invoicePage, pageSize: 12 },
    { skip: !orgId },
  );
  const current = currentResponse?.data ?? currentResponse;
  const estimate = estimateResponse?.data ?? estimateResponse;
  const invoicesData = invoicesResponse?.data ?? invoicesResponse;
  const invoices = invoicesData?.invoices ?? [];
  const invoiceTotal = invoicesData?.total_invoices ?? 0;
  const invoicePageSize = invoicesData?.page_size ?? 12;
  const invoicePages = Math.max(1, Math.ceil(invoiceTotal / invoicePageSize));
  const usage = current?.current_usage ?? estimate?.usage ?? {};
  const limits = estimate?.limits ?? {};
  const lineItems = estimate?.line_items ?? [];
  const isLoading = isCurrentLoading || isEstimateLoading;
  const isFetching = isCurrentFetching || isEstimateFetching || areInvoicesFetching;
  const refreshBilling = () => {
    refetchCurrent();
    refetchEstimate();
    refetchInvoices();
  };

  if (isLoading) {
    return <Box sx={{ display: "grid", placeItems: "center", minHeight: 320 }}><CircularProgress sx={{ color: ACCENT }} /></Box>;
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 1500, mx: "auto", p: { xs: 1.25, sm: 2, lg: 2.5 }, display: "grid", gap: { xs: 2, lg: 2.5 }, bgcolor: "#F6F8FC" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" }, flexDirection: { xs: "column", sm: "row" }, gap: 1.5, p: { xs: 1.75, sm: 2.25 }, border: "1px solid #E8EDF3", borderRadius: 3, bgcolor: "#fff", boxShadow: "0 2px 8px rgba(16,24,40,.03)" }}>
        <Box>
          <Typography fontSize={{ xs: 22, sm: 26 }} fontWeight={800} color="#101828" letterSpacing="-0.55px" lineHeight={1.2}>Billing & usage</Typography>
          <Stack direction="row" alignItems="center" gap={0.75} sx={{ mt: 0.65, color: "#667085" }}>
            <CalendarMonthOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography fontSize={13} color="inherit">
              Billing period: {formatDate(current?.period_start ?? estimate?.period_start)} – {formatDate(current?.period_end ?? estimate?.period_end)}
            </Typography>
          </Stack>
        </Box>
        <Button size="small" variant="outlined" onClick={refreshBilling} disabled={isFetching} startIcon={isFetching ? <CircularProgress size={15} /> : <ReplayIcon />} sx={{ alignSelf: { xs: "flex-start", sm: "center" }, borderColor: "#D0D5DD", color: "#344054", borderRadius: 2, textTransform: "none", px: 1.75, height: 38 }}>
          Refresh
        </Button>
      </Box>

      {(isCurrentError || isEstimateError || areInvoicesError) && (
        <Alert severity="warning" action={<Button color="inherit" size="small" onClick={refreshBilling}>Retry</Button>} sx={{ borderRadius: 2 }}>
          {isCurrentError && isEstimateError && areInvoicesError
            ? "Billing details, estimate, and invoice history could not be loaded."
            : isCurrentError && isEstimateError
            ? "Billing details and estimate could not be loaded."
            : `${isCurrentError ? "Current billing" : isEstimateError ? "Billing estimate" : "Invoice history"} could not be loaded; the available details are shown.`}
          {` ${currentError?.data?.message ?? estimateError?.data?.message ?? invoicesError?.data?.message ?? ""}`}
        </Alert>
      )}

      <Card sx={{ position: "relative", overflow: "hidden", border: "1px solid #DCE6F2", borderRadius: 3, background: "linear-gradient(115deg, #FFFFFF 0%, #FFF9F6 58%, #F5FAFF 100%)", boxShadow: "0 8px 24px rgba(31,53,82,.07)", "&:before": { content: '""', position: "absolute", left: 0, top: 0, bottom: 0, width: 4, bgcolor: ACCENT } }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" gap={2}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ minWidth: 0 }}>
              <Box sx={{ width: 52, height: 52, flexShrink: 0, borderRadius: 2.5, display: "grid", placeItems: "center", bgcolor: "#FFF1EB", border: "1px solid #FFD5C5", color: ACCENT }}>
                <ReceiptLongOutlinedIcon fontSize="medium" />
              </Box>
              <Box sx={{ minWidth: 0, pl: 0.5 }}>
                <Typography component="div" fontSize={10} fontWeight={800} color="#667085" sx={{ letterSpacing: ".12em", textTransform: "uppercase", lineHeight: 1.3, mb: 0.8 }}>
                  Current subscription
                </Typography>
                <Typography component="div" fontSize={{ xs: 20, sm: 22 }} fontWeight={800} color="#172033" letterSpacing="-.35px" lineHeight={1.2}>
                  {formatPlanName(current?.subscription_type ?? estimate?.subscription_type)} plan
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" useFlexGap gap={1} flexWrap="wrap" alignItems="center">
              <Chip size="small" label={formatSubscriptionStatus(current?.subscription_status ?? estimate?.subscription_status)} sx={{ height: 28, fontWeight: 700, bgcolor: "#E9F8EF", color: "#15803D", border: "1px solid #ABEFC6" }} />
              <Chip size="small" icon={<CheckCircleOutlineOutlined sx={{ fontSize: "16px !important" }} />} label={current?.invoice_generated ? "Invoice generated" : "Invoice pending"} sx={{ height: 28, fontWeight: 600, bgcolor: current?.invoice_generated ? "#ECFDF3" : "#FFFAEB", color: current?.invoice_generated ? "#027A48" : "#B54708", border: `1px solid ${current?.invoice_generated ? "#ABEFC6" : "#FEDF89"}`, "& .MuiChip-icon": { color: "inherit" } }} />
              {current?.invoice_status && <Chip size="small" label={`Invoice ${titleCase(current.invoice_status)}`} variant="outlined" sx={{ height: 28, borderColor: "#C7D7FE", bgcolor: "#EFF4FF", color: "#3538CD", fontWeight: 600 }} />}
            </Stack>
          </Stack>
          {(current?.message || estimate?.message) && (
            <Alert severity="info" icon={false} sx={{ mt: 2, py: 0.25, borderRadius: 2, bgcolor: "#F1F7FF", border: "1px solid #DBEAFE", color: "#344054", "& .MuiAlert-message": { fontSize: 13, lineHeight: 1.6 } }}>
              {current?.message ?? estimate?.message}
            </Alert>
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }, gap: 1.5 }}>
        {[
          ["Estimated total", estimate?.estimated_total ?? current?.estimated_total, "Approximate amount for this period"],
          ["Usage charges", estimate?.usage_charges ?? current?.estimated_usage_charges, "Based on recorded usage"],
          ["Onboarding fee", estimate?.onboarding_fee_estimate ?? current?.estimated_onboarding_fee, "Estimated one-time fee"],
          ["Current amount", current?.current_amount, current?.is_final ? "Finalised bill amount" : "Current billing amount"],
        ].map(([label, value, hint], index) => {
          const tone = BILLING_PALETTE[index];
          return (
          <Card key={label} sx={{ position: "relative", overflow: "hidden", border: `1px solid ${tone.border}`, borderRadius: 2.5, boxShadow: "0 2px 8px rgba(16,24,40,.035)", background: `linear-gradient(145deg, #FFFFFF 35%, ${tone.soft} 100%)`, transition: "transform .18s ease, box-shadow .18s ease", "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 20px rgba(16,24,40,.07)" }, "&:before": { content: '""', position: "absolute", top: 0, left: 0, right: 0, height: 3, bgcolor: tone.main } }}>
            <CardContent sx={{ p: { xs: 1.75, sm: 2 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                <Typography fontSize={12} fontWeight={700} color="#475467" letterSpacing=".01em">{label}</Typography>
                <Box sx={{ width: 32, height: 32, display: "grid", placeItems: "center", borderRadius: 1.75, color: tone.main, bgcolor: tone.soft, border: `1px solid ${tone.border}` }}>
                  <PaymentsOutlinedIcon sx={{ fontSize: 17 }} />
                </Box>
              </Stack>
              <Typography fontSize={{ xs: 24, sm: 27 }} fontWeight={800} color={tone.main} letterSpacing="-.4px" sx={{ mt: 1.35, lineHeight: 1.15 }}>{formatCurrency(value)}</Typography>
              <Typography fontSize={12} color="#667085" sx={{ mt: 0.85, lineHeight: 1.45 }}>{hint}</Typography>
            </CardContent>
          </Card>
          );
        })}
      </Box>

      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 2, gap: 1 }}>
          <SectionHeading eyebrow="Subscription overview" title="Usage this period" description="Track consumption against your subscription limits." accent="#2563EB" />
          <Typography fontSize={12} color="#667085" sx={{ display: { xs: "none", sm: "block" } }}>Usage / plan limit</Typography>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }, gap: 2 }}>
          {USAGE_METRICS.map(([countKey, limitKey, label], index) => {
            const tone = BILLING_PALETTE[index % BILLING_PALETTE.length];
            const count = usage?.[countKey] ?? 0;
            const limit = limits[limitKey];
            const hasLimit = typeof limit === "number" && limit > 0;
            const progress = hasLimit ? Math.min((count / limit) * 100, 100) : 0;
            return (
              <Card key={countKey} sx={{ border: `1px solid ${tone.border}`, borderRadius: 2.5, background: `linear-gradient(145deg, #FFFFFF 55%, ${tone.soft} 100%)`, boxShadow: "0 2px 8px rgba(16,24,40,.025)", transition: "border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease", "&:hover": { borderColor: tone.main, boxShadow: "0 6px 16px rgba(16, 24, 40, 0.07)", transform: "translateY(-1px)" } }}>
                <CardContent sx={{ p: { xs: 2, sm: 2.25 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                    <Typography fontSize={14} fontWeight={650} color="#344054">{label}</Typography>
                    {hasLimit && <Chip size="small" label={`${Math.round(progress)}% used`} sx={{ height: 23, fontSize: 11, fontWeight: 700, bgcolor: progress >= 90 ? "#FFF4E5" : tone.soft, color: progress >= 90 ? "#B54708" : tone.main, border: `1px solid ${progress >= 90 ? "#FEDF89" : tone.border}` }} />}
                  </Stack>
                  <Stack direction="row" alignItems="baseline" gap={0.75} sx={{ mt: 1.5 }}>
                    <Typography fontSize={28} fontWeight={750} lineHeight={1.1} color={tone.main}>{count}</Typography>
                    <Typography fontSize={13} color="#667085">{hasLimit ? `of ${limit} included` : "used"}</Typography>
                  </Stack>
                  {hasLimit
                    ? <LinearProgress variant="determinate" value={progress} sx={{ mt: 1.75, height: 7, borderRadius: 5, bgcolor: tone.soft, "& .MuiLinearProgress-bar": { borderRadius: 5, bgcolor: progress >= 90 ? "#F79009" : tone.main } }} />
                    : <Typography fontSize={12} color="#98A2B3" sx={{ mt: 1.5 }}>No plan limit</Typography>}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>

      <Card sx={{ border: "1px solid #DCE6F2", borderRadius: 2.5, boxShadow: "0 3px 12px rgba(31,53,82,.035)" }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 2.5 }}>
            <SectionHeading eyebrow="Cost breakdown" title="Estimated line items" description="A breakdown of charges for this billing period." accent="#7C3AED" />
            <Chip size="small" label={`${lineItems.length} ${lineItems.length === 1 ? "item" : "items"}`} sx={{ bgcolor: "#F2F4F7", color: "#475467", fontWeight: 600 }} />
          </Box>
          {lineItems.length ? (
            <Box sx={{ border: "1px solid #EAECF0", borderRadius: 2, overflow: "hidden" }}>
              <Box sx={{ display: { xs: "none", sm: "grid" }, gridTemplateColumns: "minmax(0, 2fr) repeat(3, minmax(100px, 1fr))", gap: 2, px: 2, py: 1.25, bgcolor: "#EFF6FF", borderBottom: "1px solid #DBEAFE" }}>
                {["Description", "Quantity", "Unit price", "Amount"].map((heading) => (
                  <Typography key={heading} fontSize={11} fontWeight={700} color="#667085" textAlign={heading === "Description" ? "left" : "right"}>{heading}</Typography>
                ))}
              </Box>
              {lineItems.map((item, index) => (
                <Box key={`${item.metric ?? item.description}-${index}`} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr auto", sm: "minmax(0, 2fr) repeat(3, minmax(100px, 1fr))" }, alignItems: "center", gap: { xs: 1, sm: 2 }, px: 2, py: 1.75, borderTop: "1px solid #EAECF0", transition: "background-color 150ms ease", "&:hover": { bgcolor: "#F8FAFF" } }}>
                  <Box>
                    <Typography fontSize={14} fontWeight={600} color="#344054">{item.description ?? titleCase(item.metric)}</Typography>
                    <Typography fontSize={12} color="#667085" sx={{ display: { xs: "block", sm: "none" }, mt: 0.4 }}>Qty {item.quantity ?? 0} × {formatCurrency(item.unit_price)}</Typography>
                  </Box>
                  <Typography fontSize={13} color="#475467" textAlign="right" sx={{ display: { xs: "none", sm: "block" } }}>{item.quantity ?? 0}</Typography>
                  <Typography fontSize={13} color="#475467" textAlign="right" sx={{ display: { xs: "none", sm: "block" } }}>{formatCurrency(item.unit_price)}</Typography>
                  <Typography fontSize={14} fontWeight={700} color="#172033" textAlign="right">{formatCurrency(item.amount)}</Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography fontSize={13} color="#667085" sx={{ py: 1 }}>No billable line items have been recorded for this period.</Typography>
          )}
          <Divider sx={{ my: 1.5 }} />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography fontSize={14} fontWeight={700} color="#344054">Estimated total</Typography>
            <Typography fontSize={20} fontWeight={750} color={BILLING_PALETTE[0].main}>{formatCurrency(estimate?.estimated_total ?? current?.estimated_total ?? current?.current_amount)}</Typography>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ border: "1px solid #DCE6F2", borderRadius: 2.5, boxShadow: "0 3px 12px rgba(31,53,82,.035)" }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2} sx={{ mb: 2.5 }}>
            <SectionHeading eyebrow="Payment records" title="Invoice history" description={`${invoiceTotal} ${invoiceTotal === 1 ? "invoice" : "invoices"} issued`} accent="#0F8B8D" />
            {areInvoicesFetching && <CircularProgress size={18} sx={{ color: ACCENT }} />}
          </Stack>

          {areInvoicesLoading ? (
            <Box sx={{ display: "grid", placeItems: "center", py: 5 }}><CircularProgress size={24} sx={{ color: ACCENT }} /></Box>
          ) : areInvoicesError ? (
            <Alert severity="error" action={<Button color="inherit" size="small" onClick={refetchInvoices}>Retry</Button>} sx={{ borderRadius: 2 }}>
              {invoicesError?.data?.message ?? "Unable to load invoice history."}
            </Alert>
          ) : invoices.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center", border: "1px dashed #D0D5DD", borderRadius: 2, bgcolor: "#FCFCFD" }}>
              <ReceiptOutlinedIcon sx={{ color: "#98A2B3", fontSize: 34, mb: 1 }} />
              <Typography fontSize={14} fontWeight={600} color="#344054">No invoices yet</Typography>
              <Typography fontSize={13} color="#667085" sx={{ mt: 0.5 }}>Invoices will appear here once they are generated.</Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ display: { xs: "none", md: "grid" }, gridTemplateColumns: "minmax(200px, 1.7fr) minmax(160px, 1.3fr) minmax(180px, 1.5fr) minmax(100px, 0.7fr)", gap: 2, px: 2, py: 1.25, bgcolor: "#F5F3FF", border: "1px solid #E9DFFF", borderRadius: "8px 8px 0 0" }}>
                {["Invoice", "Billing period", "Status", "Amount"].map((heading) => (
                  <Typography key={heading} fontSize={11} fontWeight={700} color="#667085" textAlign={heading === "Amount" ? "right" : "left"}>{heading}</Typography>
                ))}
              </Box>
              <Stack divider={<Divider flexItem />} sx={{ border: "1px solid #EAECF0", borderTop: { xs: "1px solid #EAECF0", md: 0 }, borderRadius: { xs: 2, md: "0 0 8px 8px" }, px: { xs: 1.5, sm: 2 } }}>
                {invoices.map((invoice) => (
                  <Stack
                    key={invoice.id}
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", sm: "center" }}
                    gap={{ xs: 1.25, md: 2 }}
                    sx={{ py: 2, display: { xs: "flex", md: "grid" }, gridTemplateColumns: { md: "minmax(200px, 1.7fr) minmax(160px, 1.3fr) minmax(180px, 1.5fr) minmax(100px, 0.7fr)" }, transition: "background-color 150ms ease", "&:hover": { bgcolor: "#FBFAFF" } }}
                  >
                    <Stack direction="row" alignItems="center" gap={1.5}>
                      <Box sx={{ width: 40, height: 40, flexShrink: 0, display: { xs: "none", sm: "grid" }, placeItems: "center", borderRadius: 2, bgcolor: "#F5F3FF", border: "1px solid #E9DFFF", color: "#6941C6" }}>
                        <ReceiptOutlinedIcon fontSize="small" />
                      </Box>
                      <Box>
                        <Typography fontSize={13} fontWeight={700} color="#344054">{invoice.invoice_number ?? "Invoice"}</Typography>
                        <Typography fontSize={12} color="#98A2B3" sx={{ mt: 0.25 }}>Issued {formatDate(invoice.issued_at)}</Typography>
                      </Box>
                    </Stack>
                    <Box>
                      <Typography fontSize={13} color="#475467">{formatDate(invoice.period_start)} – {formatDate(invoice.period_end)}</Typography>
                      {invoice.due_at && <Typography fontSize={11} color="#98A2B3" sx={{ mt: 0.25 }}>Due {formatDate(invoice.due_at)}</Typography>}
                    </Box>
                    <Stack direction="row" alignItems="center" gap={0.75} flexWrap="wrap">
                      <Chip size="small" label={titleCase(invoice.status)} color={invoice.status === "paid" ? "success" : invoice.status === "overdue" ? "error" : "default"} sx={{ fontWeight: 700, ...(invoice.status === "paid" ? { bgcolor: "#ECFDF3", color: "#027A48", border: "1px solid #ABEFC6" } : invoice.status === "overdue" ? { bgcolor: "#FEF3F2", color: "#B42318", border: "1px solid #FECDCA" } : { bgcolor: "#EFF6FF", color: "#175CD3", border: "1px solid #B2DDFF" }) }} />
                      {invoice.delivery_status && <Typography fontSize={11} color="#667085">{titleCase(invoice.delivery_status)}</Typography>}
                      {invoice.pdf_available && <Chip size="small" label="PDF" color="info" variant="outlined" />}
                    </Stack>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1.5}>
                      <Typography fontSize={11} color="#98A2B3" sx={{ display: { xs: "block", md: "none" } }}>Invoice amount</Typography>
                      <Typography fontSize={15} fontWeight={750} color="#172033" textAlign="right" sx={{ whiteSpace: "nowrap", width: { md: "100%" } }}>
                        {formatCurrency(invoice.total_amount)}
                      </Typography>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
              {invoicePages > 1 && (
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" gap={1.5} sx={{ mt: 2, pt: 2, borderTop: "1px solid #EAECF0" }}>
                  <Typography fontSize={12} color="#667085">
                    Showing {(invoicePage - 1) * invoicePageSize + 1}–{Math.min(invoicePage * invoicePageSize, invoiceTotal)} of {invoiceTotal}
                  </Typography>
                  <Pagination count={invoicePages} page={invoicePage} onChange={(_, page) => setInvoicePage(page)} size="small" color="primary" sx={{ "& .MuiPaginationItem-root.Mui-selected": { bgcolor: "#FFF1EB", color: ACCENT } }} />
                </Stack>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
