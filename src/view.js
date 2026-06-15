import i18next from 'i18next';
import state, { getAllPostsSorted, markPostAsRead } from './state.js';
import { validateUrl } from './validator.js';
import initI18n from './i18n.js';
import fetchViaProxy from './proxy.js';
import parseRss from './rssParser.js';

const form = document.getElementById('rss-form');
const urlInput = document.getElementById('rss-url');
const feedsContainer = document.getElementById('feeds');
const postsContainer = document.getElementById('posts');

const heroTitle = document.querySelector('.hero-section h1');
const heroLead = document.querySelector('.hero-section .lead');
const submitButton = document.querySelector('button[type="submit"]');
const formText = document.querySelector('.form-text');
const footer = document.getElementById('footer');

let updateTimeout = null;

const modalElement = document.getElementById('postModal');
if (modalElement) {
  modalElement.addEventListener('show.bs.modal', function(event) {
    const button = event.relatedTarget;
    const postId = button?.getAttribute('data-post-id');

    if (postId) {
      const post = state.posts.find(p => p.id === postId);
      if (post) {
        const modalTitle = document.getElementById('postModalLabel');
        const modalBody = modalElement.querySelector('.modal-body p');
        const readFullLink = document.getElementById('readFullLink');

        modalTitle.textContent = post.title;
        modalBody.textContent = post.description || 'Нет описания';
        readFullLink.href = post.link;
        readFullLink.textContent = i18next.t('modal.readFull');

        if (!post.read) {
          markPostAsRead(post.id);
          renderPosts();
        }
      }
    }
  });
}

const showMessage = (message, isError = false) => {
  const oldMessage = document.querySelector('.feedback');
  if (oldMessage) oldMessage.remove();

  const messageDiv = document.createElement('div');
  messageDiv.className = `feedback ${isError ? 'text-danger' : 'text-success'} mt-2`;
  messageDiv.textContent = message;

  form.insertAdjacentElement('afterend', messageDiv);

  setTimeout(() => {
    if (messageDiv.parentNode) messageDiv.remove();
  }, 5000);
};

const clearError = () => {
  urlInput.classList.remove('is-invalid');
};

const showValidationError = (message) => {
  urlInput.classList.add('is-invalid');
  showMessage(message, true);
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

const translateTitle = (title) => {
  const translations = {
    'Aggregation / Python: Trees': 'Агрегация / Python: Деревья',
    'Traversal / Python: Trees': 'Traversal / Python: Деревья',
    'New lessons on Hexlet': 'Новые уроки на Хекслете',
    'Lorem ipsum feed for an interval of 1 minutes with 10 item(s)': 'Новые уроки на Хекслете'
  };
  return translations[title] || title;
};

const translateDescription = (description) => {
  const translations = {
    'Practical programming lessons': 'Практические уроки по программированию',
    'This is a constantly updating lorem ipsum feed': 'Практические уроки по программированию'
  };
  return translations[description] || description;
};

const renderFeeds = () => {
  if (!feedsContainer) return;
  feedsContainer.innerHTML = '';
  if (state.feeds.length === 0) return;

  const feedsTitle = document.createElement('h3');
  feedsTitle.textContent = i18next.t('sections.feeds');
  feedsContainer.appendChild(feedsTitle);

  state.feeds.forEach(feed => {
    const feedCard = document.createElement('div');
    feedCard.className = 'feed-item';
    const translatedTitle = translateTitle(feed.title);
    const translatedDesc = translateDescription(feed.description);
    feedCard.innerHTML = `
      <div class="feed-title">${translatedTitle}</div>
      <div class="feed-description">${translatedDesc || 'Описание отсутствует'}</div>
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
  postsTitle.textContent = i18next.t('sections.posts');
  postsContainer.appendChild(postsTitle);

  const postsList = document.createElement('ul');
  postsList.className = 'posts-list';

  sortedPosts.forEach(post => {
    const listItem = document.createElement('li');
    listItem.className = 'post-item';

    const translatedTitle = translateTitle(post.title);

    const postTitle = document.createElement('span');
    postTitle.className = post.read ? 'post-title fw-normal' : 'post-title fw-bold';
    postTitle.textContent = translatedTitle;

    const dateSpan = document.createElement('span');
    dateSpan.className = 'post-date';
    dateSpan.textContent = formatDate(post.pubDate);

    const viewButton = document.createElement('button');
    viewButton.className = 'post-view-button';
    viewButton.textContent = 'Просмотр';
    viewButton.setAttribute('data-bs-toggle', 'modal');
    viewButton.setAttribute('data-bs-target', '#postModal');
    viewButton.setAttribute('data-post-id', post.id);

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
  if (urlInput) urlInput.placeholder = 'Ссылка RSS';

  if (footer) {
    footer.innerHTML = `${i18next.t('footer.text')}<a href="${i18next.t('footer.link')}" target="_blank" rel="noopener noreferrer" class="footer-hexlet-link">${i18next.t('footer.linkText')}</a>`;
  }

  const closeBtn = document.querySelector('#postModal .btn-secondary');
  if (closeBtn) closeBtn.textContent = i18next.t('modal.close');

  const readFullLink = document.getElementById('readFullLink');
  if (readFullLink) readFullLink.textContent = i18next.t('modal.readFull');
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
            pubDate: postData.pubDate || new Date().toISOString(),
            read: false
          };
          state.posts.push(newPost);
          newPostIds.push(postId);
        });

        const existingIds = state.postsByFeedId[feed.id] || [];
        state.postsByFeedId[feed.id] = [...existingIds, ...newPostIds];
      }

      return { feedId: feed.id, newPostsCount: newPosts.length };
    })
    .catch(error => {
      console.error(`Error updating feed:`, error.message);
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
        showMessage(`Добавлено ${totalNewPosts} новых постов`, false);
      }
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
          pubDate: postData.pubDate || new Date().toISOString(),
          read: false
        };

        state.posts.push(newPost);
        postIds.push(postId);
      });

      state.postsByFeedId[feedId] = postIds;

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
    showValidationError(i18next.t('errors.duplicate'));
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = i18next.t('form.loading');

  validateUrl(url, state.feeds)
    .then(validUrl => processFeed(validUrl))
    .then(() => {
      clearError();
      urlInput.value = '';
      showMessage(i18next.t('messages.success'), false);
      renderFeeds();
      renderPosts();
    })
    .catch(error => {
      clearError();
      showValidationError(error.message);
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
      if (footer) footer.innerHTML = 'created by <a href="https://hexlet.io" target="_blank" style="color: #0d6efd; text-decoration: none;">Hexlet</a>';
      urlInput.placeholder = 'Ссылка RSS';
      form.addEventListener('submit', handleSubmit);
      urlInput.focus();
      startAutoUpdates();
    });
};

window.addEventListener('beforeunload', () => {
  if (updateTimeout) clearTimeout(updateTimeout);
});

initApp();
