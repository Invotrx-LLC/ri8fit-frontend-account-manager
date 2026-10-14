import { api } from "../api/api";

export const subscriptionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOrganisationSubscriptions: builder.query({
      query: () => ({
        url: "/acc/organisations/subscriptions",
        method: "GET",
      }),
      providesTags: ["Subscriptions"],
    }),
    getOrganisationUsage: builder.query({
      query: (organisationId) => ({
        url: "/subscriptions/account-manager/organisations/" + organisationId + "/usage",
        method: "GET",
      }),
      providesTags: (result, error, organisationId) => [
        { type: "Subscriptions", id: organisationId },
      ],
    }),
    getOrganisationCurrentBilling: builder.query({
      query: (organisationId) => ({
        url: "/subscriptions/account-manager/organisations/" + organisationId + "/billing/current",
        method: "GET",
      }),
      providesTags: (result, error, organisationId) => [
        { type: "Subscriptions", id: organisationId },
      ],
    }),
    getOrganisationBillingEstimate: builder.query({
      query: (organisationId) => ({
        url: "/subscriptions/account-manager/organisations/" + organisationId + "/billing/estimate",
        method: "GET",
      }),
      providesTags: (result, error, organisationId) => [
        { type: "Subscriptions", id: organisationId },
      ],
    }),
    getOrganisationInvoices: builder.query({
      query: ({ organisationId, page = 1, pageSize = 12 }) => ({
        url: "/subscriptions/account-manager/organisations/" + organisationId + "/invoices",
        method: "GET",
        params: { page, page_size: pageSize },
      }),
      providesTags: (result, error, { organisationId }) => [
        { type: "Subscriptions", id: organisationId },
        { type: "Invoices", id: organisationId },
      ],
    }),
    cancelOrganisationSubscription: builder.mutation({
      query: (organisationId) => ({
        url: `/subscriptions/account-manager/organisations/${organisationId}/cancel`,
        method: "POST",
      }),
      invalidatesTags: ["Subscriptions"],
    }),
    resumeOrganisationSubscription: builder.mutation({
      query: (organisationId) => ({
        url: `/subscriptions/account-manager/organisations/${organisationId}/resume-payg`,
        method: "POST",
      }),
      invalidatesTags: ["Subscriptions"],
    }),
    reinitiateOrganisationTrial: builder.mutation({
      query: (organisationId) => ({
        url: `/subscriptions/account-manager/organisations/${organisationId}/reinitiate-trial`,
        method: "POST",
      }),
      invalidatesTags: ["Subscriptions"],
    }),
    getUpgradeRequests: builder.query({
      query: (status = "pending") => ({
        url: "/subscriptions/account-manager/upgrade-requests",
        method: "GET",
        params: status ? { status } : undefined,
      }),
      providesTags: ["Subscriptions"],
    }),
    reviewUpgradeRequest: builder.mutation({
      query: ({ requestId, decision, rejectionReason }) => ({
        url: "/subscriptions/account-manager/upgrade-requests/" + requestId + "/" + decision,
        method: "POST",
        ...(decision === "reject" ? { body: { rejection_reason: rejectionReason } } : {}),
      }),
      invalidatesTags: ["Subscriptions"],
    }),
    upgradeOrganisationToPayg: builder.mutation({
      query: (body) => ({
        url: "/acc/superadmin_upgrade_payg",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Subscriptions"],
    }),
  }),
});

export const {
  useGetOrganisationSubscriptionsQuery,
  useGetOrganisationUsageQuery,
  useGetOrganisationCurrentBillingQuery,
  useGetOrganisationBillingEstimateQuery,
  useGetOrganisationInvoicesQuery,
  useCancelOrganisationSubscriptionMutation,
  useResumeOrganisationSubscriptionMutation,
  useReinitiateOrganisationTrialMutation,
  useGetUpgradeRequestsQuery,
  useReviewUpgradeRequestMutation,
  useUpgradeOrganisationToPaygMutation,
} = subscriptionsApi;
