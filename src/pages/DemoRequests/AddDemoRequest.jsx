import React, { useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";

import { useCreateDemoRequestOnBehalfMutation } from "../../redux/services/demo/demo";

import { TOKENS } from "./demoRequestUi";

/* =========================================
   DESIGN
========================================= */

/* Orange sampled from the design (#FE9F43) */
const ACCENT = "#FE9F43";
const ACCENT_HOVER = "#EA923E";

const buttonBaseSx = {
  height: 34,
  px: 2,
  fontSize: 12.5,
  fontWeight: 500,
  textTransform: "none",
  borderRadius: "8px",
  boxShadow: "none",
};

const primaryButtonSx = {
  ...buttonBaseSx,
  color: "#FFFFFF",
  backgroundColor: ACCENT,
  "&:hover": {
    backgroundColor: ACCENT_HOVER,
    boxShadow: "none",
  },
  "&.Mui-disabled": {
    color: "#FFFFFF",
    backgroundColor: ACCENT,
    opacity: 0.6,
  },
};

const secondaryButtonSx = {
  ...buttonBaseSx,
  color: TOKENS.textPrimary,
  borderColor: TOKENS.border,
  backgroundColor: "#FFFFFF",
  "&:hover": {
    borderColor: TOKENS.border,
    backgroundColor: TOKENS.headerBg,
  },
};

const labelSx = {
  display: "block",
  mb: 0.75,
  fontSize: 12.5,
  fontWeight: 500,
  color: TOKENS.textSecondary,
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    fontSize: 13,
    color: TOKENS.textPrimary,
    borderRadius: "8px",
    backgroundColor: "#FFFFFF",
    "& fieldset": { borderColor: TOKENS.border },
    "&:hover fieldset": { borderColor: TOKENS.textMuted },
    "&.Mui-focused fieldset": {
      borderColor: ACCENT,
      borderWidth: "1px",
    },
    "&.Mui-error fieldset": { borderColor: "error.main" },
  },
  "& .MuiFormHelperText-root": {
    mx: 0,
    mt: 0.5,
    fontSize: 11.5,
  },
};

/* The portal renders outside the page, so set the font explicitly */
const formFontSx = {
  "& .MuiTypography-root, & .MuiInputBase-root, & .MuiButton-root, & .MuiAlert-root, & .MuiFormHelperText-root":
    {
      fontFamily: TOKENS.fontFamily,
    },
};

/* =========================================
   FORM CONFIG

   `name` matches the API payload keys, so the
   values can be sent as they are (after trim).
   Set `required: true/false` to change what
   the form enforces.
========================================= */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidPhone = (value) => {
  const digits = value.replace(/\D/g, "");

  return (
    /^\+?[\d\s\-()]+$/.test(value) &&
    digits.length >= 7 &&
    digits.length <= 15
  );
};

const FIELDS = [
  {
    name: "name",
    label: "Full name",
    placeholder: "Full name",
    required: true,
    requiredMessage: "Enter the customer's name",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "name@company.com",
    type: "email",
    required: true,
    requiredMessage: "Enter an email address",
    check: (value) =>
      EMAIL_PATTERN.test(value)
        ? ""
        : "Enter a valid email address",
  },
  {
    name: "phone_number",
    label: "Phone",
    placeholder: "+91 98765 43210",
    type: "tel",
    required: true,
    requiredMessage: "Enter a phone number",
    check: (value) =>
      isValidPhone(value)
        ? ""
        : "Enter a valid phone number (7–15 digits)",
  },
  {
    name: "company_name",
    label: "Company",
    placeholder: "Company name",
    required: true,
    requiredMessage: "Enter the company name",
  },
  {
    name: "message",
    label: "Message",
    placeholder: "Context for the team, e.g. how the customer reached out",
    multiline: true,
    required: false,
  },
];

const INITIAL_VALUES = Object.fromEntries(
  FIELDS.map(({ name }) => [name, ""])
);

/* =========================================
   HELPERS
========================================= */

const validate = (values) => {
  const errors = {};

  FIELDS.forEach(
    ({ name, required, requiredMessage, check }) => {
      const value = values[name].trim();

      if (!value) {
        if (required) {
          errors[name] = requiredMessage;
        }
        return;
      }

      const message = check?.(value);

      if (message) {
        errors[name] = message;
      }
    }
  );

  return errors;
};

const toPayload = (values) =>
  Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      value.trim(),
    ])
  );

/*
 * RTK Query's unwrap() rejects with
 * { status, data } – read the API message
 * first, then fall back to a generic one.
 */

const getErrorMessage = (error) => {
  const data = error?.data;

  if (typeof data?.message === "string" && data.message) {
    return data.message;
  }

  if (typeof data?.detail === "string" && data.detail) {
    return data.detail;
  }

  if (typeof data?.detail?.[0]?.msg === "string") {
    return data.detail[0].msg;
  }

  if (error?.status === "FETCH_ERROR") {
    return "Couldn't reach the server. Check your connection and try again.";
  }

  return "Couldn't add the request. Check the details and try again.";
};

/* =========================================
   FORM

   Rendered inside the Dialog, so its state is
   thrown away when the dialog closes and the
   next open always starts with an empty form.
========================================= */

const RequestForm = ({
  isSubmitting,
  onSubmit,
  onCancel,
}) => {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");

  const errors = validate(values);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((previous) => ({
      ...previous,
      [name]: value,
    }));

    setServerError("");
  };

  const handleBlur = (event) => {
    const { name } = event.target;

    setTouched((previous) => ({
      ...previous,
      [name]: true,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    /* Reveal every error on the first submit attempt */
    setTouched(
      Object.fromEntries(
        FIELDS.map(({ name }) => [name, true])
      )
    );

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await onSubmit(toPayload(values));
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: "1 1 auto",
        minHeight: 0,
        ...formFontSx,
      }}
    >
      {/* Header */}

      <Box
        sx={{
          px: 3,
          pt: 2.5,
          pb: 2,
          borderBottom: `1px solid ${TOKENS.border}`,
        }}
      >
        <Typography
          id="add-demo-request-title"
          sx={{
            fontSize: 17,
            fontWeight: 700,
            lineHeight: 1.3,
            color: TOKENS.textPrimary,
          }}
        >
          Add request manually
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            fontSize: 12.5,
            color: TOKENS.textSecondary,
          }}
        >
          Create a request on behalf of a customer. It is
          added to the list with the status New.
        </Typography>
      </Box>

      {/* Fields */}

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        {serverError && (
          <Alert
            severity="error"
            sx={{ mb: 2, fontSize: 12.5, borderRadius: "8px" }}
          >
            {serverError}
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
            },
            gap: 2,
          }}
        >
          {FIELDS.map((field, index) => {
            const inputId = `add-demo-request-${field.name}`;
            const error =
              touched[field.name] && errors[field.name];

            return (
              <Box
                key={field.name}
                sx={{
                  gridColumn: field.multiline
                    ? "1 / -1"
                    : "auto",
                }}
              >
                <Typography
                  component="label"
                  htmlFor={inputId}
                  sx={labelSx}
                >
                  {field.label}

                  {field.required && (
                    <Box
                      component="span"
                      sx={{ ml: 0.4, color: "error.main" }}
                    >
                      *
                    </Box>
                  )}
                </Typography>

                <TextField
                  id={inputId}
                  name={field.name}
                  type={field.type}
                  value={values[field.name]}
                  placeholder={field.placeholder}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(error)}
                  helperText={error}
                  required={field.required}
                  multiline={field.multiline}
                  minRows={field.multiline ? 3 : undefined}
                  disabled={isSubmitting}
                  autoFocus={index === 0}
                  /* This is somebody else's data, so don't
                     let the browser autofill the admin's own */
                  autoComplete="off"
                  size="small"
                  fullWidth
                  sx={inputSx}
                />
              </Box>
            );
          })}
        </Box>
      </DialogContent>

      {/* Actions */}

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${TOKENS.border}`,
        }}
      >
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={isSubmitting}
          sx={secondaryButtonSx}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? (
              <CircularProgress size={14} color="inherit" />
            ) : null
          }
          sx={primaryButtonSx}
        >
          {isSubmitting ? "Adding..." : "Add request"}
        </Button>
      </DialogActions>
    </Box>
  );
};

/* =========================================
   TRIGGER BUTTON + DIALOG + TOAST

   POST /acc/demo-requests/create-on-behalf
========================================= */

const AddDemoRequest = () => {
  const [open, setOpen] = useState(false);

  const [toastOpen, setToastOpen] = useState(false);

  const [createDemoRequest, { isLoading }] =
    useCreateDemoRequestOnBehalfMutation();

  const handleClose = () => {
    /* Don't dismiss while the request is in flight */
    if (!isLoading) {
      setOpen(false);
    }
  };

  /*
   * Throws on failure (unwrap) so the form can show
   * the API error and keep what the user typed.
   *
   * The demo requests list refreshes through the
   * tag invalidated by the mutation.
   */

  const handleCreate = async (payload) => {
    await createDemoRequest(payload).unwrap();

    setOpen(false);
    setToastOpen(true);
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={() => setOpen(true)}
        sx={primaryButtonSx}
      >
        Add request manually
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        aria-labelledby="add-demo-request-title"
        sx={{
          "& .MuiDialog-paper": { borderRadius: "12px" },
        }}
      >
        <RequestForm
          isSubmitting={isLoading}
          onSubmit={handleCreate}
          onCancel={handleClose}
        />
      </Dialog>

      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={(_, reason) => {
          if (reason !== "clickaway") {
            setToastOpen(false);
          }
        }}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setToastOpen(false)}
          sx={{
            fontSize: 13,
            fontFamily: TOKENS.fontFamily,
          }}
        >
          Request added
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddDemoRequest;