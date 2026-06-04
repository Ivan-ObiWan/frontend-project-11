import i18next from 'i18next';
import state, { getAllPostsSorted } from './state.js';
import { validateUrl } from './validator.js';
import initI18n from './i18n.js';
import fetchViaProxy from './proxy.js';
import parseRss from './rssParser.js';

const form = document.getElementById('rss-form');
const urlInput = document.getElementById('rss-url');
const feedsContainer = document.getElementById('feeds');
const postsContainer = document.getElementById('posts');

const modal = document.createElement('div');
modal.className = 'modal';
modal.innerHTML = `
  <div class="modal-content">
    <div class="modal-header">
      <h5 class="modal-title"></h5>
      <button class="modal-close">&times;</button>
    </div>
    <div class="modal-body"></div>
    <div class="modal-footer">
      <button class="btn-read-more">Читать полностью</button>
      <button class="btn-close-modal">Закрыть</button>
    </div>
  </div>
`;
document.body.appendChild(modal);

const heroTitle = document.querySelector('.hero-section h1');
const heroLead = document.querySelector('.hero-section .lead');
const submitButton = document.querySelector('button[type="submit"]');
const formText = document.querySelector('.form-text');
const footer = document.querySelector('footer');

if (urlInput) urlInput.placeholder = 'Ссылка RSS';

let updateTimeout = null;

const showError = (message) => {
  const oldError = document.querySelector('.invalid-feedback');
  if (oldError) oldError.remove();
  
  urlInput.classList.add('is-invalid');
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'invalid-feedback';
  errorDiv.textContent = message;
  urlInput.parentNode.appendChild(errorDiv);
};

const clearError = () => {
  urlInput.classList.remove('is-invalid');
  const oldError = document.querySelector('.invalid-feedback');
  if (oldError) oldError.remove();
};

const showSuccessMessage = (message) => {
  const oldMessage = document.querySelector('.success-message');
  if (oldMessage) oldMessage.remove();
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'success-message text-success mt-2';
  messageDiv.textContent = message;
  form.insertAdjacentElement('afterend', messageDiv);
  
  setTimeout(() => {
    if (messageDiv.parentNode) messageDiv.remove();
  }, 5000);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  } catch {
    return '';
  }
};

const openModal = (post) => {
  const modalTitle = modal.querySelector('.modal-title');
  const modalBody = modal.querySelector('.modal-body');
  const readMoreBtn = modal.querySelector('.btn-read-more');
  
  modalTitle.textContent = post.title;
  modalBody.textContent = post.description || 'Нет описания';
  readMoreBtn.onclick = () => {
    window.open(post.link, '_blank');
  };
  
  modal.classList.add('active');
};

const closeModal = () => {
  modal.classList.remove('active');
};

modal.querySelector('.modal-close').onclick = closeModal;
modal.querySelector('.btn-close-modal').onclick = closeModal;
modal.onclick = (e) => {
  if (e.target === modal) closeModal();
};

const renderFeeds = () => {
  if (!feedsContainer) return;
  
  feedsContainer.innerHTML = '';
  
  if (state.feeds.length === 0) return;
  
  const feedsTitle = document.createElement('h3');
  feedsTitle.textContent = 'Фиды';
  feedsContainer.appendChild(feedsTitle);
  
  state.feeds.forEach(feed => {
    const feedCard = document.createElement('div');
    feedCard.className = 'feed-item';
    feedCard.innerHTML = `
      <div class="feed-title">${feed.title}</div>
      <div class="feed-description">${feed.description || 'Описание отсутствует'}</div>
    `;
    feedsContainer.appendChild(feedCard);
  });
};

const renderPosts = () => {
  if (!postsContainer) return;
  
  postsContainer.innerHTML = '';
  
  const sortedPosts = getAllPostsSorted();
  
  if (sortedPosts.length === 0) return;
  
  const postsTitle = document.createElement('h3');
  postsTitle.textContent = 'Посты';
  postsContainer.appendChild(postsTitle);
  
  const postsList = document.createElement('ul');
  postsList.className = 'posts-list';
  
  sortedPosts.forEach(post => {
    const listItem = document.createElement('li');
    listItem.className = 'post-item';
    
    const postTitle = document.createElement('span');
    postTitle.className = 'post-title';
    postTitle.textContent = post.title;
    postTitle.onclick = () => openModal(post);
    
    const dateSpan = document.createElement('span');
    dateSpan.className = 'post-date';
    dateSpan.textContent = formatDate(post.pubDate);
    
    const viewButton = document.createElement('button');
    viewButton.className = 'post-view-button';
    viewButton.textContent = 'Просмотр';
    viewButton.onclick = () => openModal(post);
    
    listItem.appendChild(postTitle);
    listItem.appendChild(dateSpan);
    listItem.appendChild(viewButton);
    postsList.appendChild(listItem);
  });
  
  postsContainer.appendChild(postsList);
};

const updateUILocales = () => {
  if (heroTitle) heroTitle.textContent = i18next.t('app.title');
  if (heroLead) heroLead.textContent = i18next.t('app.lead');
  if (submitButton) submitButton.textContent = i18next.t('form.button');
  if (formText) formText.textContent = i18next.t('form.example');
  if (footer) footer.textContent = i18next.t('footer.created');
  if (urlInput) urlInput.placeholder = 'Ссылка RSS';
};

const updateSingleFeed = (feed) => {
  return fetchViaProxy(feed.url)
    .then(rssData => parseRss(rssData, feed.url))
    .then(parsed => {
      const existingPostLinks = new Set(
        state.posts.filter(p => p.feedId === feed.id).map(p => p.link)
      );
      
      const newPosts = parsed.posts.filter(post => !existingPostLinks.has(post.link));
      
      if (newPosts.length > 0) {
        const newPostIds = [];
        newPosts.forEach(postData => {
          const postId = `${feed.id}-${Date.now()}-${Math.random()}`;
          const newPost = {
            id: postId,
            feedId: feed.id,
            title: postData.title,
            link: postData.link,
            description: postData.description,
            pubDate: postData.pubDate || new Date().toISOString()
          };
          state.posts.push(newPost);
          newPostIds.push(postId);
        });
   
        const existingIds = state.postsByFeedId[feed.id] || [];
        state.postsByFeedId[feed.id] = [...existingIds, ...newPostIds];
        
        console.log(`Feed "${feed.title}" updated: +${newPosts.length} new posts`);
      }
      
      return { feedId: feed.id, newPostsCount: newPosts.length };
    })
    .catch(error => {
      console.error(`Error updating feed "${feed.title}":`, error.message);
      return { feedId: feed.id, error: error.message };
    });
};

const updateAllFeeds = () => {
  if (state.feeds.length === 0) {
    if (updateTimeout) clearTimeout(updateTimeout);
    updateTimeout = setTimeout(updateAllFeeds, 5000);
    return;
  }

  const updatePromises = state.feeds.map(feed => updateSingleFeed(feed));
  
  Promise.all(updatePromises)
    .then(results => {
      const totalNewPosts = results.reduce((sum, r) => sum + (r.newPostsCount || 0), 0);
      if (totalNewPosts > 0) {
        renderPosts();
        showSuccessMessage(`Добавлено ${totalNewPosts} новых постов`);
      }
    })
    .catch(error => {
      console.error('Error updating feeds:', error);
    })
    .finally(() => {
      if (updateTimeout) clearTimeout(updateTimeout);
      updateTimeout = setTimeout(updateAllFeeds, 5000);
    });
};

const startAutoUpdates = () => {
  if (updateTimeout) clearTimeout(updateTimeout);
  updateTimeout = setTimeout(updateAllFeeds, 5000);
};

const stopAutoUpdates = () => {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
    updateTimeout = null;
  }
};

const processFeed = (url) => {
  return fetchViaProxy(url)
    .then(rssData => parseRss(rssData, url))
    .then(parsed => {
      const feedId = Date.now();
      const newFeed = {
        id: feedId,
        title: parsed.feed.title,
        description: parsed.feed.description,
        url: url,
        lastUpdate: new Date().toISOString()
      };
      
      state.feeds.push(newFeed);
      
      const postIds = [];
      
      parsed.posts.forEach(postData => {
        const postId = `${feedId}-${Date.now()}-${Math.random()}`;
        const newPost = {
          id: postId,
          feedId: feedId,
          title: postData.title,
          link: postData.link,
          description: postData.description,
          pubDate: postData.pubDate || new Date().toISOString()
        };
        
        state.posts.push(newPost);
        postIds.push(postId);
      });
      
      state.postsByFeedId[feedId] = postIds;

      stopAutoUpdates();
      startAutoUpdates();
      
      return { feed: newFeed, postsCount: postIds.length };
    });
};

const handleSubmit = (event) => {
  event.preventDefault();
  
  const url = urlInput.value.trim();
  const originalButtonText = submitButton.textContent;
  
  const isDuplicate = state.feeds.some(feed => feed.url === url);
  if (isDuplicate) {
    showError(i18next.t('errors.duplicate'));
    return;
  }
  
  submitButton.disabled = true;
  submitButton.textContent = i18next.t('form.loading');
  
  validateUrl(url, state.feeds)
    .then(validUrl => processFeed(validUrl))
    .then(() => {
      clearError();
      urlInput.value = '';
      showSuccessMessage(i18next.t('messages.success'));
      renderFeeds();
      renderPosts();
    })
    .catch(error => {
      clearError();
      showError(error.message);
    })
    .finally(() => {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
      urlInput.focus();
    });
};

import { subscribe } from 'valtio';
subscribe(state, () => {
  renderFeeds();
  renderPosts();
});

const initApp = () => {
  initI18n()
    .then(() => {
      console.log('i18next initialized');
      updateUILocales();
      form.addEventListener('submit', handleSubmit);
      urlInput.focus();
      renderFeeds();
      renderPosts();
      startAutoUpdates();
    })
    .catch(error => {
      console.error('Failed to initialize i18next:', error);
      heroTitle.textContent = 'RSS агрегатор';
      heroLead.textContent = 'Начните читать RSS сегодня! Это легко, это красиво.';
      submitButton.textContent = 'Добавить';
      formText.textContent = 'Пример: https://lorem-rss.hexlet.app/feed';
      footer.textContent = 'created by Hexlet';
      urlInput.placeholder = 'Ссылка RSS';
      form.addEventListener('submit', handleSubmit);
      urlInput.focus();
      startAutoUpdates();
    });
};

window.addEventListener('beforeunload', () => {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }
});

initApp();
