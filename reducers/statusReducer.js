export const INIT_STATUS_STATE = {
  error: '',
  loading: false,
};

export const loaderReducer = (state, action) => {
  switch (action.type) {
    case 'ERROR':
      return { error: action.payload, loading: false };
    case 'LOADING':
      return { error: '', loading: true };
    case 'FINISH':
      return { error: '', loading: false };
    default:
      return state;
  }
};
