 const fetchRss = (url) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now(),
        title: `RSS поток`,
        description: 'Описание RSS потока будет загружено',
        url: url,
        addedAt: new Date()
      });
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
