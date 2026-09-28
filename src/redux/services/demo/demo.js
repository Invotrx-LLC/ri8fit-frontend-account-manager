import { api } from "../api/api";

export const demoApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // =========================================
    // DEMO REQUESTS
    // =========================================

    getDemoRequests: builder.query({
      query: ({ status } = {}) => ({
        url: "/acc/demo-requests",
        method: "GET",
        params: status ? { status } : undefined,
      }),
      providesTags: ["DemoRequests"],
    }),

    // =========================================
    // DEMO REQUEST STATUSES
    // =========================================

    getDemoRequestStatuses: builder.query({
      query: () => ({
        url: "/acc/demo-request-statuses",
        method: "GET",
      }),
    }),

    // =========================================
    // INTERNAL USERS
    // =========================================

    getAllInternalUsers: builder.query({
      query: () => ({
        url: "/acc/get_all_internal_users",
        method: "GET",
      }),
    }),

    // =========================================
    // UPDATE DEMO REQUEST STATUS
    // =========================================

    updateDemoRequestStatus: builder.mutation({
      query: ({ demo_request_id, status }) => ({
        url: `/acc/demo-requests/${demo_request_id}/status`,
        method: "PATCH",
        body: {
          status,
        },
      }),
      invalidatesTags: ["DemoRequests"],
    }),

    // =========================================
    // ASSIGN DEMO REQUEST
    // =========================================

    assignDemoRequest: builder.mutation({
      query: ({ demo_request_id, assigned_to }) => ({
        url: `/acc/demo-requests/${demo_request_id}/assign`,
        method: "POST",
        body: {
          assigned_to,
        },
      }),
      invalidatesTags: ["DemoRequests"],
    }),

    // =========================================
    // SEND CUSTOMER INVITATION
    // =========================================

    sendCustomerInvite: builder.mutation({
      query: ({
        invite_type,
        demo_request_id,
        organisation_name,
        email,
        first_name,
        last_name,
        phone_number,
        time_zone,
        country,
        Industry,
      }) => ({
        url: "/acc/send-invitation",
        method: "POST",
        body: {
          invite_type,
          demo_request_id,
          organisation_name,
          email,
          first_name,
          last_name,
          phone_number,
          time_zone,
          country,
          Industry,
        },
      }),
      invalidatesTags: ["DemoRequests"],
    }),

    // =========================================
    // GET PROVISION SIGNUP DETAILS
    // =========================================

    getProvisionSignup: builder.query({
      query: (onboarding_id) => ({
        url: `/acc/account-manager/provision-signup/${onboarding_id}`,
        method: "GET",
      }),
    }),

    // =========================================
    // SUBMIT PROVISION SIGNUP DETAILS
    // =========================================

    submitProvisionSignupDetails: builder.mutation({
      query: ({
        onboarding_id,
        first_name,
        last_name,
        phone_number,
        organisation_name,
        country,
        industry,
        website_url,
        time_zone,
      }) => ({
        url: "/acc/provision-signup/submit-details",
        method: "POST",
        body: {
          onboarding_id,
          first_name,
          last_name,
          phone_number,
          organisation_name,
          country,
          industry,
          website_url,
          time_zone,
        },
      }),
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetDemoRequestsQuery,
  useGetDemoRequestStatusesQuery,
  useGetAllInternalUsersQuery,
  useUpdateDemoRequestStatusMutation,
  useAssignDemoRequestMutation,
  useSendCustomerInviteMutation,
  useGetProvisionSignupQuery,
  useSubmitProvisionSignupDetailsMutation,
} = demoApi;