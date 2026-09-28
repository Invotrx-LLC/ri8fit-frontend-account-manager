// api.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQuery/baseQuery";

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
  "Auth",
  "Organisations",
  "Dashboard",
  "InternalUsers",
  "OrganisationJobs",
  "JobMatchedCandidates",
  "CandidateSkillInfo",
  "ImportedCandidates",
  "JobDetails",
  "DemoRequests",
  "CustomerOnboarding",
  "Subscriptions",
  "Candidates",
  "Invoices",
],
  endpoints: () => ({}),
});