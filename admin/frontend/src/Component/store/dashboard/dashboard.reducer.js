import * as ActionType from "./dashboard.type";

const initialState = {
  dashboard: {},
  dashBoardHost: {},
  dashBoardHostFetch:{},
  revenueChart:[],
  userChart:[],
  dashboardCount:{},
  chartAnalyticOfUsers:[],
  chartAnalyticOfShorts:[],
  chartAnalyticOfVideos:[],
  chartAnalyticOfActiveUser:[]
};

export const dashboardReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionType.GET_DASHBOARD_USER:
      
      return {
        ...state,
        chartAnalyticOfUsers: action.payload || state.chartAnalyticOfUsers,
        chartAnalyticOfShorts: action.payload || state.chartAnalyticOfShorts,
        chartAnalyticOfVideos: action.payload || state.chartAnalyticOfVideos,
      };
      case ActionType.GET_DASHBOARD_ACTIVE_CHART:
      return {
        ...state,
        chartAnalyticOfActiveUser: action.payload
      };
      case ActionType.GET_DASHBOARD_COUNT:
        return {
          ...state,
          dashboardCount: action.payload,
        };
      case ActionType.GET_DASHBOARD_HOST: 
        return {
          ...state,
          dashBoardHost: action.payload,
        };
        case ActionType.GET_DASHBOARD_HOST_FETCH: 
        return {
          ...state,
          dashBoardHostFetch: action.payload,
        };
      case ActionType.GET__USER_CHART: 
      return {
        ...state,
        userChart: action.payload,
      };
      case ActionType.GET_REVENUE_CHART: 
      return {
        ...state,
        revenueChart: action.payload,
      };
    default:
      return state;
  }
};
