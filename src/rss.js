// Функция загрузки RSS
const fetchRss = (url) => {
  return new Promise((resolve, reject) => {
    // Имитация загрузки
    setTimeout(() => {
      if (url.includes('example-rss.test')) {
        resolve({
          id: Date.now(),
          title: 'Пример RSS потока',
          description: 'Описание RSS потока',
          url: url
        });
      } else {
        resolve({
          id: Date.now(),
          title: 'RSS поток',
          description: 'Описание RSS потока будет загружено',
          url: url
        });
      }
    }, 500);
  });
};

const parseRss = (data) => {
  return new Promise((resolve) => {
    resolve({
      title: data.title,
      description: data.description,
      items: []
    });
  });
};

export { fetchRss, parseRss };
