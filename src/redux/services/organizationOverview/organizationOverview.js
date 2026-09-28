import { api } from "../api/api.js";

export const OrganizationOverviewService = api.injectEndpoints({
  endpoints: (builder) => ({
    // ==========================================================
    // TOTAL JOBS / JOB OVERVIEW
    // ==========================================================
    getJobOverview: builder.query({
      query: ({
        organisationId,
        groupBy = "month",
        periodCount = 6,
        status = "all",
        filterBySubfunction,
        country = "all",
        allTime = false,
      }) => {
        const params = new URLSearchParams({
          organisation_id: organisationId,
          group_by: groupBy,
          period_count: String(periodCount),
          status,
          country:
            !country || country === "all"
              ? "all_locations"
              : country,
          all_time: String(allTime),
        });

        if (filterBySubfunction) {
          params.append(
            "filter_by_subfunction",
            filterBySubfunction
          );
        }

        return `/acc/analytics/jobs/overview?${params.toString()}`;
      },

      providesTags: ["JobAnalytics"],
    }),

    // ==========================================================
    // TOTAL POSITIONS
    // ==========================================================
    getTotalPositions: builder.query({
      query: ({
        organisationId,
        groupBy = "month",
        periodCount = 6,
        status = "all",
        countsType = "cumulative",
        filterBySubfunction,
        country = "all",
        allTime = false,
      }) => {
        const params = new URLSearchParams({
          organisation_id: organisationId,
          group_by: groupBy,
          period_count: String(periodCount),
          status,
          counts_type: countsType,
          country:
            !country || country === "all"
              ? "all_locations"
              : country,
          all_time: String(allTime),
        });

        if (filterBySubfunction) {
          params.append(
            "filter_by_subfunction",
            filterBySubfunction
          );
        }

        return `/acc/analytics/jobs/total-positions?${params.toString()}`;
      },

      providesTags: ["TotalPositions"],
    }),

    // ==========================================================
    // CANDIDATE FUNNEL TREND
    // ==========================================================
    getCandidateFunnelTrend: builder.query({
      query: ({
        organisationId,
        groupBy = "month",
        periodCount = 6,
        status = "all",
        countsType = "cumulative",
        filterBySubfunction,
        country = "all",
        allTime = false,
      }) => {
        const params = new URLSearchParams({
          organisation_id: organisationId,
          group_by: groupBy,
          period_count: String(periodCount),
          status,
          counts_type: countsType,
          country:
            !country || country === "all"
              ? "all_locations"
              : country,
          all_time: String(allTime),
        });

        if (filterBySubfunction) {
          params.append(
            "filter_by_subfunction",
            filterBySubfunction
          );
        }

        return `/acc/analytics/jobs/funnel-trend?${params.toString()}`;
      },

      providesTags: ["CandidateFunnelTrend"],
    }),

    // ==========================================================
    // INTERVIEW TREND
    // ==========================================================
    getInterviewTrend: builder.query({
      query: ({
        organisationId,
        groupBy = "month",
        periodCount = 6,
        status = "all",
        countsType = "current",
        filterBySubfunction,
        country = "all",
        allTime = true,
      }) => {
        const params = new URLSearchParams({
          organisation_id: organisationId,
          group_by: groupBy,
          period_count: String(periodCount),
          status,
          counts_type: countsType,
          country:
            !country || country === "all"
              ? "all_locations"
              : country,
          all_time: String(allTime),
        });

        if (filterBySubfunction) {
          params.append(
            "filter_by_subfunction",
            filterBySubfunction
          );
        }

        return `/acc/analytics/jobs/interview-trend?${params.toString()}`;
      },

      providesTags: ["InterviewTrend"],
    }),

    // ==========================================================
    // CANDIDATES EXPERIENCE
    // ==========================================================
    getCandidatesExperience: builder.query({
      query: ({
        organisationId,
        groupBy = "month",
        periodCount = 6,
        status = "all",
        filterBySubfunction,
        country = "all",
        allTime = true,
      }) => {
        const params = new URLSearchParams({
          organisation_id: organisationId,
          group_by: groupBy,
          period_count: String(periodCount),
          status,
          country:
            !country || country === "all"
              ? "all_locations"
              : country,
          all_time: String(allTime),
        });

        if (filterBySubfunction) {
          params.append(
            "filter_by_subfunction",
            filterBySubfunction
          );
        }

        return `/acc/analytics/jobs/candidates-experience?${params.toString()}`;
      },

      providesTags: ["CandidatesExperience"],
    }),

    // ==========================================================
    // OFFER TREND
    // ==========================================================
    getOfferTrend: builder.query({
      query: ({
        organisationId,
        groupBy = "month",
        periodCount = 6,
        status = "all",
        countsType = "cumulative",
        filterBySubfunction,
        country = "all",
        allTime = true,
      }) => {
        const params = new URLSearchParams({
          organisation_id: organisationId,
          group_by: groupBy,
          period_count: String(periodCount),
          status,
          counts_type: countsType,
          country:
            !country || country === "all"
              ? "all_locations"
              : country,
          all_time: String(allTime),
        });

        if (filterBySubfunction) {
          params.append(
            "filter_by_subfunction",
            filterBySubfunction
          );
        }

        return `/acc/analytics/jobs/offer-trend?${params.toString()}`;
      },

      providesTags: ["OfferTrend"],
    }),

    // ==========================================================
    // STAGE DETAILS
    // ==========================================================
    getStageDetails: builder.query({
      query: ({
        organisationId,
        stage,
        status = "all",
        countsType = "current",
        country = "all_locations",
        filterBySubfunction,
        page = 1,
        pageSize = 10,
      }) => ({
        url: "/acc/analytics/jobs/stage-details",
        method: "GET",
        params: {
          organisation_id: organisationId,
          stage,
          status,
          counts_type: countsType,
          country:
            country === "all"
              ? "all_locations"
              : country,
          page,
          page_size: pageSize,

          ...(filterBySubfunction
            ? {
                sub_function: filterBySubfunction,
              }
            : {}),
        },
      }),

      providesTags: ["StageDetails"],
    }),
  }),

  overrideExisting: false,
});

// ============================================================
// EXPORT ALL HOOKS
// ============================================================

export const {
  useGetJobOverviewQuery,
  useGetTotalPositionsQuery,
  useGetCandidateFunnelTrendQuery,
  useGetInterviewTrendQuery,
  useGetCandidatesExperienceQuery,
  useGetOfferTrendQuery,
  useGetStageDetailsQuery,
} = OrganizationOverviewService;