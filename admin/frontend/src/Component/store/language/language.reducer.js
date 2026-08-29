import {
  GET_LANGUAGES,
  ADD_LANGUAGE,
  UPDATE_LANGUAGE,
  TOGGLE_LANGUAGE_STATE,
  DELETE_LANGUAGE,
} from "./language.type";

const initialState = {
  languages: [],
  totalLanguages: 0,
};

export const languageReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_LANGUAGES:
      return {
        ...state,
        languages: action.payload.languages,
        totalLanguages: action.payload.totalLanguages,
      };
    case ADD_LANGUAGE:
      return {
        ...state,
        languages: [action.payload, ...state.languages],
        totalLanguages: state.totalLanguages + 1,
      };
    case UPDATE_LANGUAGE:
      return {
        ...state,
        languages: state.languages.map((lang) =>
          lang.languageCode === action.payload.languageCode ? { ...lang, ...action.payload } : lang
        ),
      };
    case TOGGLE_LANGUAGE_STATE: {
      const { languageCode, toggleType } = action.payload;
      return {
        ...state,
        languages: state.languages.map((lang) => {
          if (lang.languageCode === languageCode) {
            return {
              ...lang,
              isActive: toggleType === 1 ? !lang.isActive : lang.isActive,
              isDefault: toggleType === 2 ? true : lang.isDefault,
            };
          } else {
            return toggleType === 2 ? { ...lang, isDefault: false } : lang;
          }
        }),
      };
    }
    case DELETE_LANGUAGE:
      return {
        ...state,
        languages: state.languages.filter(
          (lang) => lang.languageCode !== action.payload
        ),
        totalLanguages: state.totalLanguages - 1,
      };
    default:
      return state;
  }
};
