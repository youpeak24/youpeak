import * as ActionType from "./withdraw.type";

const initialState = {
  withdraw: [],
  total: 0,
  withdrawType: null,
};

export const withdrawReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionType.GET_WITHDRAW_REQUEST:
      return {
        ...state,
        withdraw: action.payload.request,
        total: action.payload.total,
        withdrawType: action.payload.type,
      };
    case ActionType.ACCEPT_WITHDRAW_REQUEST:
      return {
        ...state,
        withdraw: state.withdraw.filter(
          (data) => !action.payload.requestId.includes(data?._id)
        ),
      };
    case ActionType.DECLINE_WITHDRAW_REQUEST:
      return {
        ...state,
        withdraw: state.withdraw.filter(
          (data) => !action.payload.requestId.includes(data?._id)
        ),
      };
    default:
      return state;
  }
};
