// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layouts
import AmLayout from "./layout";
import DrawerLayout from "./layout/Drawer";

// Auth Pages
import AmLogin from "./pages/Login";
import AmSignup from "./pages/SignUp";
import AmForgotPassword from "./pages/ForgotPassword";

// App Pages
// import AmDashboard       from "./pages/Dashboard";
// import AmOrganizations   from "./pages/Organizations";
// import OrgDetail         from "./pages/Organizations/OrgDetail";
import RequisitionDetail from "./pages/OrgRequisitions/RequisitionDetail";
import CandidateDetail from "./pages/OrgCandidates/CandidateDetail";
import AmOrganizations from "./pages/Organizations";
import OrgDetail from "./pages/Organizations/orgDetails";
import AmDashboard from "./pages/Dashboard";
// import AmDashboard from "./pages/1dashboard1/index";
import AccountManagement from "./pages/AccountManagement/AccountManagement";
import VerifySignupOTP from "./pages/SignUp/verifySignup";
import CandidatesPage from "./pages/Candidates/Candidate";
import CandidateDetailPage from "./pages/Candidates/CandidateDetailsPage";
import Settings from "./pages/Settings";
import ChangePasswordPage from "./pages/Settings/ChangePasswordPage";
import CreateRequisition from "./pages/OrgRequisitions/createJob";
import MatchedCandidates from "./pages/OrgRequisitions/createJob/matchedCandidates";
import ViewProfileDetails from "./pages/OrgRequisitions/createJob/ViewProfileDetails";
import DemoRequests from "./pages/DemoRequests";
import ProvisionSignup from "./pages/ProvisionSignup";
import Subscriptions from "./pages/subscriptions";
const App = () => {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <BrowserRouter>
        <Routes>
          {/* ── Default ── */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ── Public Routes ── */}
          <Route element={<AmLayout />}>
            <Route path="/login" element={<AmLogin />} />
            <Route path="/signup" element={<AmSignup />} />
            <Route path="/signup/verify-otp" element={<VerifySignupOTP />} />
            <Route path="/forgot-password" element={<AmForgotPassword />} />
          </Route>

          {/* ── Protected Routes ── */}
          <Route path="/account-manager" element={<DrawerLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route index path="demo-requests" element={<DemoRequests />} />
            

            {/* Dashboard */}
            <Route path="dashboard" element={<AmDashboard />} />

            {/* Organizations */}
            <Route path="organization" element={<AmOrganizations />} />
            <Route path="create-requisition" element={<CreateRequisition/>}/>
            <Route path="matched-candidates" element={<MatchedCandidates/>}/>
            <Route path="view-profile" element={<ViewProfileDetails/>}/>
            {/*
            {/* User Management */}
            <Route path="user-management" element={<AccountManagement />} />

            {/* Candidates list */}
            <Route path="candidates" element={<CandidatesPage />} />

            {/* ✅ Candidate detail — relative path, resolves to:
                /account-manager/candidates/:candidateId             */}
            <Route
              path="candidates/:candidateId"
              element={<CandidateDetailPage />}
            />

            {/* Org Detail */}
            <Route path="org/:orgId" element={<OrgDetail />} />

            {/* Requisition Detail */}
            <Route
              path="org/:orgId/requisitions/:jobId"
              element={<RequisitionDetail />}
            />

            {/* Org Candidate Detail */}
            <Route
              path="candidate/:candidateId"
              element={<CandidateDetail />}
            />

            {/* Catch-all inside account-manager */}
            <Route path="*" element={<Navigate to="dashboard" replace />} />
            <Route path="settings" element={<Settings />} />
            <Route
              path="settings/change-password"
              element={<ChangePasswordPage />}
            />
            <Route
              path="subscriptions"
              element={<Subscriptions />}
            />
          </Route>

          {/* ── Global Catch-all ── */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
