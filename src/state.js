import { proxy } from 'valtio';

const state = proxy({
  form: {
    url: '',
    isValid: true,
    error: null,
    isSubmitting: false
  },

  feeds: [],

  ui: {
    focused: true
  }
});

export default state;
