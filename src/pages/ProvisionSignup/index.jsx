import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";

import {
  useGetProvisionSignupQuery,
  useSubmitProvisionSignupDetailsMutation,
} from "../../redux/services/demo/demo";

const ProvisionSignup = () => {
  /* =========================================
     URL
  ========================================= */

  const [searchParams] = useSearchParams();

  const onboardingId =
    searchParams.get("onboarding_id");

  /* =========================================
     FORM
  ========================================= */

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    organisation_name: "",
    country: "",
    industry: "",
    website_url: "",
    time_zone: "Asia/Kolkata",
  });

  /* =========================================
     GET PROVISION SIGNUP
  ========================================= */

  const {
    data,
    isLoading,
    isError,
  } = useGetProvisionSignupQuery(
    onboardingId,
    {
      skip: !onboardingId,
    }
  );

  /* =========================================
     POST DETAILS
  ========================================= */

  const [
    submitProvisionSignupDetails,
    {
      isLoading: isSubmitting,
      isSuccess,
      isError: isSubmitError,
    },
  ] =
    useSubmitProvisionSignupDetailsMutation();

  /* =========================================
     PREFILL FORM
  ========================================= */

  useEffect(() => {
    if (!data) {
      return;
    }

    console.log(
      "Provision signup GET response:",
      data
    );

    const details =
      data?.data || data;

    setForm({
      first_name:
        details?.first_name || "",

      last_name:
        details?.last_name || "",

      phone_number:
        details?.phone_number || "",

      organisation_name:
        details?.organisation_name || "",

      country:
        details?.country || "",

      industry:
        details?.industry || "",

      website_url:
        details?.website_url || "",

      time_zone:
        details?.time_zone ||
        "Asia/Kolkata",
    });
  }, [data]);

  /* =========================================
     CHANGE
  ========================================= */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================
     SUBMIT
  ========================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!onboardingId) {
      return;
    }

    try {
      const response =
        await submitProvisionSignupDetails({
          onboarding_id:
            onboardingId,

          first_name:
            form.first_name,

          last_name:
            form.last_name,

          phone_number:
            form.phone_number,

          organisation_name:
            form.organisation_name,

          country:
            form.country,

          industry:
            form.industry,

          website_url:
            form.website_url,

          time_zone:
            form.time_zone,
        }).unwrap();

      console.log(
        "Provision signup submitted:",
        response
      );

    } catch (error) {
      console.error(
        "Failed to submit provision signup:",
        error
      );
    }
  };

  /* =========================================
     NO ONBOARDING ID
  ========================================= */

  if (!onboardingId) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Alert severity="error">
          Invalid provision signup link.
        </Alert>
      </Box>
    );
  }

  /* =========================================
     LOADING
  ========================================= */

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  /* =========================================
     GET ERROR
  ========================================= */

  if (isError) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Alert severity="error">
          Unable to load your signup details.
        </Alert>
      </Box>
    );
  }

  /* =========================================
     FORM
  ========================================= */

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F7F7F8",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 850,
          borderRadius: 3,
          border: "1px solid #E5E5E8",
          p: 4,
        }}
      >
        <Typography
          variant="h5"
          fontWeight={600}
          mb={1}
        >
          Complete Your Account
        </Typography>

        <Typography
          sx={{
            color: "#777",
            fontSize: 14,
            mb: 3,
          }}
        >
          Please review and complete your
          organisation details.
        </Typography>

        {isSuccess && (
          <Alert
            severity="success"
            sx={{ mb: 3 }}
          >
            Your details have been submitted
            successfully.
          </Alert>
        )}

        {isSubmitError && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
          >
            Failed to submit your details.
            Please try again.
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
        >
          <Grid
            container
            spacing={2}
          >
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="First Name"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Last Name"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Phone Number"
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Organisation Name"
                name="organisation_name"
                value={
                  form.organisation_name
                }
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Country"
                name="country"
                value={form.country}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Industry"
                name="industry"
                value={form.industry}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Website URL"
                name="website_url"
                value={form.website_url}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Time Zone"
                name="time_zone"
                value={form.time_zone}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 3,
            }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                minWidth: 150,
                textTransform: "none",
                borderRadius: 2,
              }}
            >
              {isSubmitting
                ? "Submitting..."
                : "Submit Details"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProvisionSignup;