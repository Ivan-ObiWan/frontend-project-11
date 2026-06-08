import { proxy } from 'valtio';

const state = proxy({
  feeds: [],      // Массив фидов: { id, title, description, url, lastUpdate }
  posts: [],      // Массив постов: { id, feedId, title, link, description, pubDate, read }
  postsByFeedId: {},  // { feedId: [postId1, postId2, ...] }

  form: {
    url: '',
    error: null,
    isValid: true
  },

  ui: {
    loading: false,
    error: null,
    modalPost: null,
    updateTimer: null
  }
});

export const getAllPostsSorted = () => {
  return [...state.posts].sort((a, b) => {
    return new Date(b.pubDate) - new Date(a.pubDate);
  });
};

export const markPostAsRead = (postId) => {
  const post = state.posts.find(p => p.id === postId);
  if (post && !post.read) {
    post.read = true;
  }
};

export default state;
