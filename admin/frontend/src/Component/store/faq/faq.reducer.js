import * as ActionType from "./faq.type";

const initialState = {
    faqData:[],
  };

  export const faqReducer = (state = initialState, action) => {
    switch (action.type) {
      case ActionType.GET_FAQ:
        return {
          ...state,
          faqData: action.payload
        };
        case ActionType.ADD_FAQ:
          let faqDataAdd = [...state.faqData];
          faqDataAdd.unshift(action.payload);
          return {
            ...state,
            faqData: faqDataAdd,
          };
          case ActionType.EDIT_FAQ:
            const { editId, editData } = action.payload;
            const updatedFaq = state.faqData?.map((item) => {
              if (item?._id === editId) {
                return {
                  ...item,
                  ...editData
                };
              }
              return item;
            });
            return {
              ...state,
              faqData: updatedFaq,
            };
            case ActionType.DELETE_FAQ:
                return {
                  ...state,
                  faqData: state.faqData.filter((data) =>  !action.payload.id.includes(data._id)),
                };
      default:
        return state;
    }
  };
  