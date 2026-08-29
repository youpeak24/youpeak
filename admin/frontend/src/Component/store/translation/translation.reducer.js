import { GET_TRANSLATIONS, UPDATE_TRANSLATIONS } from "./translation.type";

const initialState = {
  translations: {},
};

export const translationReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_TRANSLATIONS:
      return {
        ...state,
        translations: action.payload,
      };
    case UPDATE_TRANSLATIONS:
      return {
        ...state,
        translations: {
          ...state.translations,
          ...action.payload,
        },
      };
    default:
      return state;
  }
};
