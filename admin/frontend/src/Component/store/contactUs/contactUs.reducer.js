import * as ActionType from "./contactUs.type";

const initialState = {
    contactUsData:[]
  };

  export const contactUsPlanReducer = (state = initialState, action) => {
    switch (action.type) {
      case ActionType.GET_CONTACT_DATA:
        return {
          ...state,
          contactUsData: action.payload,
        };
        case ActionType.ADD_CONTACT:
          let data = [...state.contactUsData];
          data.unshift(action.payload);
          return {
            ...state,
            contactUsData: data,
          };
          case ActionType.UPDATE_CONTACT:
            return {
              ...state,
              contactUsData: state.contactUsData.map((item) =>
              item._id === action.payload.id
                  ? action.payload.editContact
                  : item
              ),
            };
            case ActionType.DELETE_CONTACT:
              return {
                ...state,
                contactUsData: state.contactUsData.filter(
                  (data) => !action.payload.includes(data._id)
                ),
              };
      default:
        return state;
    }
  };

 