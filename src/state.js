import { proxy } from 'valtio';

const state = proxy({
  feeds: [],
  form: {
    url: '',
    error: null
  }
});

export default state;
