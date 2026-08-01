// ============================================================================
// МОДУЛЬ 03: helpers.js
// Вспомогательные функции (форматирование, логи, геометрия, DOM)
// ============================================================================
// Загружено на гитхаб 01.08.2026
// ========== 1. ГЕНЕРАЦИЯ УНИКАЛЬНЫХ ID ==========

/**
 * Генерирует уникальный идентификатор
 * @returns {string} UUID или временная метка + случайное число
 */
function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // ИСПРАВЛЕНО: было Date.now() '-' ... (без плюса)
    return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// ========== 2. РАБОТА С ДАТОЙ ==========

/**
 * Форматирует дату в читаемый вид
 * @param {number} week - неделя (1-4)
 * @param {number} month - месяц (1-12)
 * @param {number} year - год
 * @returns {string} "X неделя месяца, YYYY год"
 */
function getDateString(week, month, year) {
    const monthNames = MONTH_NAMES || ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
    return `${week} неделя ${monthNames[month-1]}, ${year} год`;
}

/**
 * Форматирует дату из объекта GameState
 * @returns {string}
 */
function getCurrentDateString() {
    const week = (typeof peopleState !== 'undefined') ? peopleState.currentWeek : 1;
    const month = (typeof peopleState !== 'undefined') ? peopleState.currentMonth : 5;
    const year = (typeof peopleState !== 'undefined') ? peopleState.currentYear : 1598;
    const monthNames = (typeof MONTH_NAMES !== 'undefined') ? MONTH_NAMES : [
        "января", "февраля", "марта", "апреля", "мая", "июня",
        "июля", "августа", "сентября", "октября", "ноября", "декабря"
    ];
    return `${week} неделя ${monthNames[month - 1]}, ${year} год`;
}

// ========== 3. ЛОГИРОВАНИЕ ==========

/**
 * Добавляет сообщение в глобальный лог
 * @param {string} message - сообщение для лога
 * @param {string} category - категория ('council', 'army', 'buildings', 'general')
 */
function addGlobalLog(message, category = 'general') {
    const dateStr = getCurrentDateString();
    const logEntry = `[${dateStr}] ${message}`;
    
    // Добавляем в глобальный массив
    if (typeof globalEventLog !== 'undefined') {
        globalEventLog.unshift(logEntry);
        if (globalEventLog.length > 100) globalEventLog.pop();
    }
    
    // Обновляем UI
    const logDiv = document.getElementById('globalLogPanel');
    if (logDiv) {
        logDiv.innerHTML = `<div class="log-entry">${escapeHtml(logEntry)}</div>` + logDiv.innerHTML;
        while (logDiv.children.length > 50) logDiv.removeChild(logDiv.lastChild);
    }
    
    // Дублируем в категорийные логи
    if (category === 'council') {
        const councilLog = document.getElementById('councilLogPanel');
        if (councilLog) {
            councilLog.innerHTML = `<div class="log-entry">${escapeHtml(logEntry)}</div>` + councilLog.innerHTML;
            while (councilLog.children.length > 30) councilLog.removeChild(councilLog.lastChild);
        }
    }
    
    if (category === 'army') {
        const armyLog = document.getElementById('armyLogPanel');
        if (armyLog) {
            armyLog.innerHTML = `<div class="log-entry">${escapeHtml(logEntry)}</div>` + armyLog.innerHTML;
            while (armyLog.children.length > 30) armyLog.removeChild(armyLog.lastChild);
        }
    }
    
    if (category === 'buildings') {
        const buildingsLog = document.getElementById('buildingsLogPanel');
        if (buildingsLog) {
            buildingsLog.innerHTML = `<div class="log-entry">${escapeHtml(logEntry)}</div>` + buildingsLog.innerHTML;
            while (buildingsLog.children.length > 30) buildingsLog.removeChild(buildingsLog.lastChild);
        }
    }
    
    console.log(logEntry);
}

// ========== 4. HTML ЭКРАНИРОВАНИЕ ==========

/**
 * Экранирует HTML-символы для защиты от XSS
 * @param {string} str - строка для экранирования
 * @returns {string}
 */
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ========== 5. ФОРМАТИРОВАНИЕ ЧИСЕЛ ==========

/**
 * Форматирует число с разделителями тысяч
 * @param {number} num - число
 * @returns {string}
 */
function formatNumber(num) {
    if (num === undefined || num === null) return '0';
    return Math.floor(num).toLocaleString('ru-RU');
}

/**
 * Форматирует расстояние в километрах
 * @param {number} km - километры
 * @returns {string}
 */
function formatDistance(km) {
    return Math.floor(km).toLocaleString('ru-RU') + ' км';
}

/**
 * Форматирует время в пути в ходах
 * @param {number} turns - ходы
 * @returns {string}
 */
function formatTurns(turns) {
    return turns.toFixed(1) + ' ходов';
}

// ========== 6. ГЕОМЕТРИЧЕСКИЕ ФУНКЦИИ (ДЛЯ КАРТЫ) ==========

/**
 * Преобразует пиксельные координаты в координаты Leaflet
 * @param {number} px - X координата в пикселях
 * @param {number} py - Y координата в пикселях
 * @returns {Array} [lat, lng]
 */
function toLeafletCoords(px, py) {
    const MAP_H = MAP_HEIGHT || 2588;
    return [MAP_H - py, px];
}

/**
 * Вычисляет расстояние между двумя точками в километрах
 * @param {Object} p1 - точка с lat/lng
 * @param {Object} p2 - точка с lat/lng
 * @returns {number}
 */
function distanceBetween(p1, p2) {
    const KM_PER_PIXEL_KM = KM_PER_PIXEL || 1;
    const dx = (p1.lng - p2.lng) * KM_PER_PIXEL_KM;
    const dy = (p1.lat - p2.lat) * KM_PER_PIXEL_KM;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Вычисляет общее расстояние по массиву точек
 * @param {Array} points - массив точек с lat/lng
 * @returns {number}
 */
function totalDistance(points) {
    let total = 0;
    for (let i = 0; i < points.length - 1; i++) {
        total += distanceBetween(points[i], points[i+1]);
    }
    return total;
}

/**
 * Вычисляет общее время в пути (ходы) без учёта зон
 * @param {Array} points - массив точек
 * @param {Array} segments - массив типов сегментов
 * @returns {number}
 */
function totalTurnsBasic(points, segments) {
    let total = 0;
    // Полный список скоростей, синхронизированный с constants.js
    const speeds = SPEEDS || {
        land: 210, dirt: 140, offroad: 105, forest: 70, mountain: 42,
        swamp: 35, horse: 315, bison: 245, naval: 400, wyvern: 700, orlan: 800
    };
    for (let i = 0; i < points.length - 1; i++) {
        const dist = distanceBetween(points[i], points[i+1]);
        const speed = speeds[segments[i]] || speeds.land;
        total += dist / speed;
    }
    return total;
}

// ========== 7. БЕЗОПАСНОЕ ОБНОВЛЕНИЕ DOM ==========

/**
 * Безопасно обновляет текст элемента
 * @param {string} id - ID элемента
 * @param {string|number} value - новое значение
 */
function setElementText(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.innerText = value !== undefined && value !== null ? value : '0';
    }
}

/**
 * Безопасно обновляет HTML элемента
 * @param {string} id - ID элемента
 * @param {string} html - новый HTML
 */
function setElementHTML(id, html) {
    const el = document.getElementById(id);
    if (el) {
        el.innerHTML = html;
    }
}

/**
 * Показывает/скрывает элемент
 * @param {string} id - ID элемента
 * @param {boolean} show - показывать или скрывать
 */
function setElementVisible(id, show) {
    const el = document.getElementById(id);
    if (el) {
        el.style.display = show ? 'block' : 'none';
    }
}

// ========== 8. РАБОТА С LOCALSTORAGE ==========

/**
 * Сохраняет данные в localStorage с проверкой
 * @param {string} key - ключ
 * @param {any} data - данные
 * @returns {boolean}
 */
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error(`Ошибка сохранения ${key}:`, e);
        return false;
    }
}

/**
 * Загружает данные из localStorage
 * @param {string} key - ключ
 * @param {any} defaultValue - значение по умолчанию
 * @returns {any}
 */
function loadFromLocalStorage(key, defaultValue = null) {
    try {
        const saved = localStorage.getItem(key);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error(`Ошибка загрузки ${key}:`, e);
    }
    return defaultValue;
}

// ========== 9. ЗАГРУЗКА ИЗОБРАЖЕНИЙ С ЗАГЛУШКОЙ ==========

/**
 * Создаёт img элемент с fallback на эмодзи
 * @param {string} src - путь к изображению
 * @param {string} alt - альтернативный текст
 * @param {string} fallbackEmoji - эмодзи-заглушка
 * @returns {HTMLImageElement}
 */
function createImageWithFallback(src, alt = '', fallbackEmoji = '🖼️') {
    const img = document.createElement('img');
    img.alt = alt;
    img.onerror = function() {
        this.style.display = 'none';
        const parent = this.parentNode;
        if (parent) {
            const fallbackSpan = document.createElement('span');
            fallbackSpan.textContent = fallbackEmoji;
            fallbackSpan.style.fontSize = '24px';
            parent.insertBefore(fallbackSpan, this);
        }
    };
    img.src = src;
    return img;
}

// ========== 10. ЗАДЕРЖКА (ДЛЯ АНИМАЦИЙ) ==========

/**
 * Возвращает Promise с задержкой
 * @param {number} ms - миллисекунды
 * @returns {Promise}
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ========== 11. РАБОТА С ИГРОВОЙ ДАТОЙ ==========

/**
 * Загружает игровую дату из localStorage
 */
function loadGameDate() {
    const saved = localStorage.getItem('game_date');
    if (saved) {
        try {
            const date = JSON.parse(saved);
            if (typeof GameState !== 'undefined') {
                GameState.time = date;
            }
            if (typeof peopleState !== 'undefined') {
                peopleState.currentWeek = date.week;
                peopleState.currentMonth = date.month;
                peopleState.currentYear = date.year;
            }
            updateGlobalDateDisplay();
        } catch(e) { console.error("Ошибка загрузки даты:", e); }
    }
}

/**
 * Сохраняет игровую дату в localStorage
 */
function saveGameDate() {
    let date = null;
    if (typeof GameState !== 'undefined') {
        date = GameState.getTime();
    } else if (typeof peopleState !== 'undefined') {
        date = {
            week: peopleState.currentWeek,
            month: peopleState.currentMonth,
            year: peopleState.currentYear
        };
    }
    if (date) {
        localStorage.setItem('game_date', JSON.stringify(date));
    }
}

/**
 * Продвигает время на 1 ход
 */
function advanceWeek() {
    if (typeof GameState !== 'undefined') {
        GameState.advanceTime();
    } else if (typeof peopleState !== 'undefined') {
        peopleState.currentWeek++;
        if (peopleState.currentWeek > 4) {
            peopleState.currentWeek = 1;
            peopleState.currentMonth++;
            if (peopleState.currentMonth > 12) {
                peopleState.currentMonth = 1;
                peopleState.currentYear++;
            }
        }
    }
    updateGlobalDateDisplay();
    saveGameDate();
}

/**
 * Возвращает текущую дату в виде строки
 * @returns {string}
 */
function getCurrentDateString() {
    if (typeof GameState !== 'undefined') {
        const time = GameState.getTime();
        return getDateString(time.week, time.month, time.year);
    } else if (typeof peopleState !== 'undefined') {
        return getDateString(peopleState.currentWeek, peopleState.currentMonth, peopleState.currentYear);
    }
    return getDateString(1, 5, 1598);
}

/**
 * Обновляет отображение даты во всех элементах
 */
function updateGlobalDateDisplay() {
    const dateStr = getCurrentDateString();
    const elements = ['globalDateDisplay', 'dateDisplay', 'globalDate'];
    for (let id of elements) {
        const el = document.getElementById(id);
        if (el) el.innerText = dateStr;
    }
}

// ========== 12. ЗАГЛУШКА ДЛЯ ГЛОБАЛЬНОЙ ШАПКИ ==========
function renderGlobalHeader() {
    // заглушка
}
// Глобальные синонимы для карты
window.fmtDistance = formatDistance;
window.fmtTurns = formatTurns;

console.log("✅ helpers.js загружен — вспомогательные функции готовы");