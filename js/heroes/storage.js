// ============================================================================
// ХРАНИЛИЩЕ ДАННЫХ ПЕРСОНАЖА
// Каждый герой хранится под своим ключом в localStorage.
// Формат: character_card_{heroId}_data_v1
// ============================================================================

window.HeroStorage = {
  KEY_PREFIX: 'character_card_',
  KEY_SUFFIX: '_data_v1',

  // Формирует полный ключ
  key(heroId) {
    return this.KEY_PREFIX + heroId + this.KEY_SUFFIX;
  },

  // Рекурсивное слияние объектов (сохранение + дефолты)
  deepMerge(base, override) {
    if (Array.isArray(base) && Array.isArray(override)) return override;
    if (typeof base !== 'object' || base === null) return override !== undefined ? override : base;
    if (typeof override !== 'object' || override === null) return base;
    const result = { ...base };
    for (let k in override) result[k] = this.deepMerge(base[k], override[k]);
    return result;
  },

  // Загрузка: возвращает объект, слитый с дефолтами
  load(heroId, defaults) {
    try {
      const raw = localStorage.getItem(this.key(heroId));
      if (!raw) return JSON.parse(JSON.stringify(defaults)); // deep clone
      const parsed = JSON.parse(raw);
      return this.deepMerge(defaults, parsed);
    } catch (e) {
      console.error('❌ Ошибка загрузки карточки:', e);
      return JSON.parse(JSON.stringify(defaults));
    }
  },

  // Сохранение
  save(heroId, data) {
    try {
      localStorage.setItem(this.key(heroId), JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('❌ Ошибка сохранения карточки:', e);
      return false;
    }
  },

  // Очистка (полный сброс)
  clear(heroId) {
    try {
      localStorage.removeItem(this.key(heroId));
      return true;
    } catch (e) {
      console.error('❌ Ошибка очистки карточки:', e);
      return false;
    }
  },

  // Экспорт в файл
  exportToFile(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Импорт из файла (возвращает промис с данными)
  importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try { resolve(JSON.parse(e.target.result)); }
        catch (err) { reject(err); }
      };
      reader.onerror = () => reject(new Error('Ошибка чтения файла'));
      reader.readAsText(file);
    });
  }
};

console.log('✅ storage.js загружен');