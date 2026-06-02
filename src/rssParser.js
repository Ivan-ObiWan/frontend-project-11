const parseRss = (xmlString, feedUrl) => {
  return new Promise((resolve, reject) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        reject(new Error('Invalid RSS format'));
        return;
      }

      const channel = xmlDoc.querySelector('channel');
      if (!channel) {
        reject(new Error('No channel found in RSS'));
        return;
      }
      
      const feedTitle = channel.querySelector('title')?.textContent || 'Без названия';
      const feedDescription = channel.querySelector('description')?.textContent || '';

      const items = xmlDoc.querySelectorAll('item');
      const posts = Array.from(items).map((item, index) => {
        const title = item.querySelector('title')?.textContent || 'Без заголовка';
        const link = item.querySelector('link')?.textContent || '';
        const description = item.querySelector('description')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        
        return {
          id: `${feedUrl}-${index}-${Date.now()}`,
          title,
          link,
          description,
          pubDate,
          feedUrl
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
    } catch (error) {
      reject(new Error(`Parse error: ${error.message}`));
    }
  });
};

export default parseRss;
