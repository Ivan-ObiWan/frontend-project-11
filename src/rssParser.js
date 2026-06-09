import i18next from 'i18next';

const parseRss = (xmlString, feedUrl) => {
  return new Promise((resolve, reject) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      
      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        reject(new Error(i18next.t('errors.invalidRss')));
        return;
      }
      
      const channel = xmlDoc.querySelector('channel');
      if (!channel) {
        reject(new Error(i18next.t('errors.invalidRss')));
        return;
      }
      
      const feedTitle = channel.querySelector('title')?.textContent || 'Без названия';
      const feedDescription = channel.querySelector('description')?.textContent || '';
      
      const items = xmlDoc.querySelectorAll('item');
      const posts = Array.from(items).map((item) => {
        const title = item.querySelector('title')?.textContent || 'Без заголовка';
        const link = item.querySelector('link')?.textContent || '';
        const description = item.querySelector('description')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
        
        return {
          title,
          link,
          description,
          pubDate
        };
      });
      
      resolve({
        feed: {
          title: feedTitle,
          description: feedDescription,
          url: feedUrl
        },
        posts: posts
      });
    } catch {
      reject(new Error(i18next.t('errors.invalidRss')));
    }
  });
};

export default parseRss;
