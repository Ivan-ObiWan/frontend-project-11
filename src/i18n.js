import i18next from 'i18next';
import ru from './locales/ru.js';

const initI18n = () => {
  return new Promise((resolve, reject) => {
    i18next.init({
      lng: 'ru',
      debug: false,
      resources: {
        ru: ru
      },
      interpolation: {
        escapeValue: false
      }
    }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(i18next);
      }
    });
  });
};

export default initI18n;
