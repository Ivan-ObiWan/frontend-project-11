import { proxy } from 'valtio';

const state = proxy({
  feeds: [],      // Массив фидов: { id, title, description, url, lastUpdate }
  posts: [],      // Массив постов: { id, feedId, title, link, description, pubDate }
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

export const getFeedsList = () => state.feeds;

export const getPostsList = () => state.posts;

export const getPostsByFeedId = (feedId) => {
  const postIds = state.postsByFeedId[feedId] || [];
  return postIds.map(id => state.posts.find(post => post.id === id));
};

export const getAllPostsSorted = () => {
  return [...state.posts].sort((a, b) => {
    return new Date(b.pubDate) - new Date(a.pubDate);
  });
};

export default state;
