// ============================================================================
// МОДУЛЬ: markers.js (v3.0 — полный редизайн, Asgaar-style)
// ============================================================================
// Маркеры на карте: добавление, редактирование, формы, цвета, rich-text
// ============================================================================
// загружено на гитхаб 26.09.26

let markers = [];
let markerLayers = [];           // Leaflet-маркеры на карте
let markerMode = false;
let hoverTipEl = null;
let hoverTipTimeout = null;
let currentMarkerId = null;      // открытый в панели настроек

// ========== КОНСТАНТЫ ==========

const MARKER_SHAPES = ['drop', 'square', 'diamond', 'triangle', 'circle'];

const SHAPE_SVGS = {
    drop:     '<path d="M20 2 C 11.7 2 5 8.7 5 17 C 5 25 14 32 20 38 C 26 32 35 25 35 17 C 35 8.7 28.3 2 20 2 Z" />',
    square:   '<rect x="3" y="3" width="34" height="34" rx="4" />',
    diamond:  '<polygon points="20,2 38,20 20,38 2,20" />',
    triangle: '<polygon points="20,4 38,36 2,36" />',
    circle:   '<circle cx="20" cy="20" r="18" />'
};

const EMOJI_LIST = {
    'Метки': ['📍','📌','🎯','⭐','✨','❓','❗','⚠️','✅','❌','🔴','🟡','🟢','🔵'],
    'Здания': ['🏰','🏯','🏛️','⛩️','⛪','🕌','🏟️','🏭','🏢','🏘️','🏚️','🏗️','⛲','🗼'],
    'Военное': ['⚔️','🗡️','🛡️','🏹','🪓','🔨','⚒️','💣','🧨','🏴','🏳️','🚩','🎌','⛺'],
    'Персонажи': ['👑','🤴','👸','🧙','🧝','🧛','🧟','👻','💀','☠️','👤','👥','🕵️','🤝'],
    'Природа': ['🔥','💧','🌊','⭐','✨','❄️','🌪️','🌋','⛰️','🏔️','🌲','🌳','🌴','🍀'],
    'Животные': ['🐉','🦅','🐺','🦁','🐻','🐗','🦌','🐎','🐂','🦬','🐍','🦂','🐢','🐙'],
    'Товары': ['💎','💰','👑','📦','🍞','🍺','🍷','🍖','🪙','⚜️','🎁','🏺','🧪','🔮'],
    'Свитки': ['📜','📖','📕','📗','📘','📙','📃','📄','🗒️','📋','🎵','🎶','🎨','🎭'],
    'Транспорт': ['⛵','🚢','⚓','🛶','🚚','🐴','🦅','🐉','🛞','🛠️','⚙️','🔧','🧭','🗺️']
};

// ========== ДАННЫЕ ==========

function getDefaultMarker(lat = 0, lng = 0) {
    return {
        id: 'mk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        name: 'Новый маркер',
        lat: lat,
        lng: lng,
        icon: '📍',
        iconSize: 18,
        markerSize: 40,
        shape: 'drop',
        borderColor: '#3a2818',
        fillColor: '#8b1a1a',
        content: '',
        type: 'Общие',
        turn: null,
        visible: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
}

function migrateMarker(m) {
    return {
        id: m.id || ('mk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)),
        name: m.name || 'Без названия',
        lat: (m.lat !== undefined && m.lat !== null) ? m.lat : 0,
        lng: (m.lng !== undefined && m.lng !== null) ? m.lng : 0,
        icon: m.icon || '📍',
        iconSize: m.iconSize || 18,
        markerSize: m.markerSize || 40,
        shape: MARKER_SHAPES.includes(m.shape) ? m.shape : 'drop',
        borderColor: m.borderColor || '#3a2818',
        fillColor: m.fillColor || m.color || '#8b1a1a',
        content: m.content || (m.description ? String(m.description) : ''),
        type: m.type || m.category || 'Общие',
        turn: (m.turn !== undefined && m.turn !== null && m.turn !== '') ? Number(m.turn) : null,
        visible: m.visible !== false,
        createdAt: m.createdAt || Date.now(),
        updatedAt: m.updatedAt || Date.now()
    };
}

function loadMarkers() {
    const saved = localStorage.getItem('customMarkers');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            markers = (Array.isArray(parsed) ? parsed : (parsed.markers || [])).map(migrateMarker);
        } catch(e) {
            console.error('Ошибка загрузки маркеров:', e);
            markers = [];
        }
    }
    renderMarkersList();
    redrawMarkers();
}

function saveMarkers() {
    try {
        localStorage.setItem('customMarkers', JSON.stringify(markers));
    } catch(e) {
        console.error('Ошибка сохранения маркеров:', e);
        alert('Не удалось сохранить маркеры. Возможно, превышен лимит хранилища.');
    }
}

// ========== ОТРИСОВКА НА КАРТЕ ==========

function buildMarkerHtml(m) {
    const shape = MARKER_SHAPES.includes(m.shape) ? m.shape : 'drop';
    const svgContent = SHAPE_SVGS[shape] || SHAPE_SVGS.drop;
    const isPulse = m.turn !== null && m.turn !== undefined;

    let iconHtml;
    if (m.icon && (m.icon.startsWith('data:image/') || m.icon.startsWith('http') || m.icon.startsWith('icons/'))) {
        iconHtml = `<img src="${m.icon}" alt="" style="position:relative; z-index:3;">`;
    } else {
        iconHtml = `<span style="position:relative; z-index:3; display:inline-block;">${m.icon || '📍'}</span>`;
    }

    return `
        <div class="marker-icon-wrap shape-${shape} ${isPulse ? 'marker-pulse' : ''}"
             style="--fill-color: ${m.fillColor}; --border-color: ${m.borderColor};">
            <svg class="marker-shape-svg" viewBox="0 0 40 40" preserveAspectRatio="xMidYMid meet"
                 style="position:absolute; inset:0; z-index:1; pointer-events:none;">
                <g fill="${m.fillColor}" stroke="${m.borderColor}" stroke-width="2" stroke-linejoin="round">
                    ${svgContent}
                </g>
            </svg>
            <div class="marker-icon-layer" style="font-size: ${m.iconSize}px; z-index:2;">${iconHtml}</div>
        </div>
    `;
}

function redrawMarkers() {
    if (typeof map === 'undefined' || !map) return;
    markerLayers.forEach(layer => { try { map.removeLayer(layer); } catch(e){} });
    markerLayers = [];

    for (const m of markers) {
        if (!m.visible) continue;
        const latlng = L.latLng(m.lat, m.lng);
        const size = m.markerSize || 40;

        // Точка привязки: для "капли" — нижний центр, для остальных — центр
        let anchorX = size / 2;
        let anchorY = m.shape === 'drop' ? size : size / 2;

        const icon = L.divIcon({
            html: buildMarkerHtml(m),
            className: 'custom-marker',
            iconSize: [size, size],
            iconAnchor: [anchorX, anchorY]
        });

        const mk = L.marker(latlng, {
            icon,
            zIndexOffset: m.shape === 'drop' ? 500 : 0
        });

        // Наведение → кастомный тултип с rich content
        mk.on('mouseover', () => showMarkerHover(mk, m));
        mk.on('mouseout', () => scheduleHideMarkerHover());

        // Клик → панель настроек
        mk.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            openMarkerSettings(m.id);
        });

        mk.addTo(map);
        markerLayers.push(mk);
    }
}
window.redrawMarkers = redrawMarkers;

// ========== HOVER-ТУЛТИП ==========

function ensureHoverTip() {
    if (!hoverTipEl) {
        hoverTipEl = document.createElement('div');
        hoverTipEl.className = 'marker-hover-tip';
        hoverTipEl.style.display = 'none';
        hoverTipEl.addEventListener('mouseenter', () => clearTimeout(hoverTipTimeout));
        hoverTipEl.addEventListener('mouseleave', () => hideMarkerHover());
        document.body.appendChild(hoverTipEl);
    }
    return hoverTipEl;
}

function showMarkerHover(marker, m) {
    clearTimeout(hoverTipTimeout);
    const tip = ensureHoverTip();

    const content = (m.content || '').trim();
    const hasContent = content.length > 0;
    const contentHtml = hasContent
        ? `<div class="mht-content">${content}</div>`
        : `<div class="mht-content" style="color:#6a5f4a; font-style:italic;">(нет описания)</div>`;

    const turnBadge = (m.turn !== null && m.turn !== undefined)
        ? `<div class="mht-badge">📅 Ход ${m.turn}</div>` : '';

    tip.classList.remove('has-overflow');
    tip.innerHTML = `
        <div class="mht-title">${escapeHtml(m.name)}</div>
        ${contentHtml}
        ${turnBadge}
    `;

    tip.style.display = 'block';
    tip.style.visibility = 'hidden';
    tip.style.cursor = 'pointer';

    // Клик по тултипу → открыть полный просмотр (кроме ссылок и кнопок)
    tip.onclick = (e) => {
        if (e.target.closest('a, button, iframe, input')) return;
        if (typeof openMarkerDetail === 'function') {
            openMarkerDetail(m.id);
            hideMarkerHover();
        }
    };

    requestAnimationFrame(() => {
        const latlng = marker.getLatLng();
        const pt = map.latLngToContainerPoint(latlng);
        const mapRect = map.getContainer().getBoundingClientRect();

        // Определяем переполнение
        const contentEl = tip.querySelector('.mht-content');
        let needsExpand = false;
        if (contentEl && hasContent) {
            const hasIframe = !!contentEl.querySelector('iframe');
            const hasImg = !!contentEl.querySelector('img');
            const textOnly = content.replace(/<[^>]*>/g, '').trim();
            const isLongText = textOnly.length > 200;

            const prevMaxH = contentEl.style.maxHeight;
            contentEl.style.maxHeight = 'none';
            const fullH = contentEl.scrollHeight;
            contentEl.style.maxHeight = prevMaxH;

            needsExpand = hasIframe || isLongText || (hasImg && fullH > 260) || fullH > 260;
        }

        if (needsExpand) {
            tip.classList.add('has-overflow');
            const btn = document.createElement('button');
            btn.className = 'mht-expand-btn';
            btn.innerHTML = '🔍 Открыть полностью';
            btn.onclick = (e) => {
                e.stopPropagation();
                if (typeof openMarkerDetail === 'function') openMarkerDetail(m.id);
                hideMarkerHover();
            };
            tip.appendChild(btn);
        }

        // Позиционирование
        const tipRect = tip.getBoundingClientRect();
        let left = mapRect.left + pt.x - tipRect.width / 2;
        let top = mapRect.top + pt.y - tipRect.height - 24;

        if (left < 10) left = 10;
        if (left + tipRect.width > window.innerWidth - 10) left = window.innerWidth - tipRect.width - 10;
        if (top < 10) top = mapRect.top + pt.y + 30;

        tip.style.left = left + 'px';
        tip.style.top = top + 'px';
        tip.style.visibility = 'visible';
    });
}

function scheduleHideMarkerHover() {
    clearTimeout(hoverTipTimeout);
    hoverTipTimeout = setTimeout(() => {
        if (!hoverTipEl) return;
        // Проверяем: не наведён ли курсор на сам тултип
        const hovered = hoverTipEl.matches(':hover');
        if (!hovered) hideMarkerHover();
    }, 180);
}

function hideMarkerHover() {
    clearTimeout(hoverTipTimeout);
    if (hoverTipEl) {
        hoverTipEl.style.display = 'none';
        // Останавливаем видео: убираем iframe'ы
        const iframes = hoverTipEl.querySelectorAll('iframe');
        iframes.forEach(f => f.remove());
    }
}

// ========== РЕЖИМ ДОБАВЛЕНИЯ ==========

function toggleMarkerMode() {
    markerMode = !markerMode;
    const btn = document.getElementById('markerModeBtn');
    const panel = document.getElementById('markersPanel');

    if (btn) {
        btn.classList.toggle('active', markerMode);
        btn.title = markerMode ? 'Отключить добавление маркеров (Esc)' : 'Добавить маркер';
    }
    if (panel) panel.style.display = markerMode ? 'block' : 'none';

    if (markerMode) {
        map.getContainer().style.cursor = 'crosshair';
        map.on('click', _markerClickHandler);
    } else {
        map.getContainer().style.cursor = '';
        map.off('click', _markerClickHandler);
    }
}
window.toggleMarkerMode = toggleMarkerMode;

function _markerClickHandler(e) {
    if (!markerMode) return;
    const newMarker = getDefaultMarker(e.latlng.lat, e.latlng.lng);
    markers.push(newMarker);
    saveMarkers();
    redrawMarkers();

    // Автовыход из режима
    toggleMarkerMode();

    // Открываем панель настроек
    openMarkerSettings(newMarker.id);
}

// ========== ПАНЕЛЬ НАСТРОЕК ==========

function openMarkerSettings(id) {
    const m = markers.find(x => x.id === id);
    if (!m) return;
    currentMarkerId = id;
    renderMarkerSettingsPanel(m);

    const panel = document.getElementById('markerSettingsPanel');
    if (panel) panel.classList.add('open');
}
window.openMarkerSettings = openMarkerSettings;

function closeMarkerSettings() {
    const panel = document.getElementById('markerSettingsPanel');
    if (panel) panel.classList.remove('open');
    currentMarkerId = null;
}
window.closeMarkerSettings = closeMarkerSettings;

function renderMarkerSettingsPanel(m) {
    let panel = document.getElementById('markerSettingsPanel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'markerSettingsPanel';
        panel.className = 'marker-settings-panel';
        document.body.appendChild(panel);
    }

    // Группировка emoji по категориям для селекта типа
    const typeOptions = ['Общие', 'Событие', 'Битва', 'Город', 'Персонаж', 'Квест', 'Ресурс', 'Метка'];
    const typeOptionsHtml = typeOptions.map(t =>
        `<option value="${t}" ${m.type === t ? 'selected' : ''}>${t}</option>`
    ).join('');

    // Текущий ход из игры
    const currentTurn = (typeof peopleState !== 'undefined' && peopleState.currentMonth)
        ? ((peopleState.currentYear - 1598) * 12 + peopleState.currentMonth)
        : null;

    panel.innerHTML = `
        <div class="msp-header">
            <div class="msp-title">📍 Маркер</div>
            <button class="msp-close" id="mspCloseBtn" title="Закрыть">✖</button>
        </div>

        <div class="msp-body">

            <div class="msp-preview" id="mspPreview"></div>

            <div class="msp-group">
                <label class="msp-label">Имя</label>
                <input type="text" class="msp-input" id="mspName" value="${escapeHtml(m.name)}" maxlength="80" placeholder="Название маркера">
            </div>

            <div class="msp-row">
                <div class="msp-group">
                    <label class="msp-label">Тип</label>
                    <select class="msp-input" id="mspType">${typeOptionsHtml}</select>
                </div>
                <div class="msp-group">
                    <label class="msp-label">Ход</label>
                    <input type="number" class="msp-input" id="mspTurn" value="${m.turn !== null ? m.turn : ''}" placeholder="Постоянный" min="0" step="1">
                </div>
            </div>

            <div class="msp-group">
                <label class="msp-label">Иконка</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <button class="msp-btn" id="mspIconBtn" style="flex: 0 0 auto; width: 60px; height: 50px; font-size: 1.6rem; padding: 0;">
                        ${(m.icon && (m.icon.startsWith('data:') || m.icon.startsWith('http') || m.icon.startsWith('icons/')))
                            ? `<img src="${m.icon}" style="max-width: 100%; max-height: 100%;">`
                            : (m.icon || '📍')}
                    </button>
                    <span style="flex: 1; font-size: 0.75rem; color: #8a7a5a;">Нажмите, чтобы сменить</span>
                </div>
            </div>

            <div class="msp-row">
                <div class="msp-group">
                    <label class="msp-label">Размер маркера</label>
                    <div class="msp-number">
                        <button data-step="-4" data-target="mspMarkerSize">−</button>
                        <input type="number" id="mspMarkerSize" value="${m.markerSize}" min="20" max="80" step="2">
                        <button data-step="4" data-target="mspMarkerSize">+</button>
                    </div>
                </div>
                <div class="msp-group">
                    <label class="msp-label">Размер иконки</label>
                    <div class="msp-number">
                        <button data-step="-2" data-target="mspIconSize">−</button>
                        <input type="number" id="mspIconSize" value="${m.iconSize}" min="8" max="60" step="1">
                        <button data-step="2" data-target="mspIconSize">+</button>
                    </div>
                </div>
            </div>

            <div class="msp-group">
                <label class="msp-label">Форма маркера</label>
                <div class="msp-shapes" id="mspShapes">
                    ${MARKER_SHAPES.map(shape => `
                        <button class="msp-shape-btn ${m.shape === shape ? 'active' : ''}" data-shape="${shape}" title="${shape}">
                            <svg viewBox="0 0 40 40"><g>${SHAPE_SVGS[shape]}</g></svg>
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="msp-colors">
                <div class="msp-color-field">
                    <label class="msp-label">Цвет заливки</label>
                    <div class="msp-color-wrap">
                        <input type="color" id="mspFillColor" value="${m.fillColor}">
                        <span class="hex" id="mspFillHex">${m.fillColor}</span>
                    </div>
                </div>
                <div class="msp-color-field">
                    <label class="msp-label">Цвет контура</label>
                    <div class="msp-color-wrap">
                        <input type="color" id="mspBorderColor" value="${m.borderColor}">
                        <span class="hex" id="mspBorderHex">${m.borderColor}</span>
                    </div>
                </div>
            </div>

            <div class="msp-group">
                <label class="msp-label">Содержимое</label>
                <button class="msp-btn" id="mspEditContentBtn">
                    ✏️ Редактировать текст и вложения
                </button>
            </div>

            <div class="msp-actions">
                <button class="msp-btn primary" id="mspSaveBtn">💾 Готово</button>
                <button class="msp-btn" id="mspDuplicateBtn">📋 Копировать маркер</button>
                <button class="msp-btn danger" id="mspDeleteBtn">🗑️ Удалить маркер</button>
            </div>
        </div>
    `;

    // ===== ОБРАБОТЧИКИ =====

    panel.querySelector('#mspCloseBtn').onclick = closeMarkerSettings;

    const updatePreview = () => {
        const prev = panel.querySelector('#mspPreview');
        if (prev) {
            prev.innerHTML = `<div style="width: ${m.markerSize}px; height: ${m.markerSize}px; position: relative;">${buildMarkerHtml(m)}</div>`;
        }
    };
    updatePreview();

    panel.querySelector('#mspName').oninput = (e) => {
        m.name = e.target.value.trim() || 'Без названия';
        m.updatedAt = Date.now();
        saveMarkers();
        redrawMarkers();
        renderMarkersList();
    };

    panel.querySelector('#mspType').onchange = (e) => {
        m.type = e.target.value;
        saveMarkers();
        renderMarkersList();
    };

    panel.querySelector('#mspTurn').oninput = (e) => {
        const v = e.target.value.trim();
        m.turn = v === '' ? null : Math.max(0, parseInt(v) || 0);
        saveMarkers();
        redrawMarkers();
        renderMarkersList();
    };

    panel.querySelector('#mspIconBtn').onclick = () => {
        openIconPicker((icon) => {
            m.icon = icon;
            saveMarkers();
            redrawMarkers();
            renderMarkerSettingsPanel(m);
        });
    };

    // Кнопки +/− для чисел
    panel.querySelectorAll('.msp-number button').forEach(btn => {
        btn.onclick = () => {
            const targetId = btn.dataset.target;
            const step = parseInt(btn.dataset.step);
            const input = panel.querySelector('#' + targetId);
            if (!input) return;
            const min = parseInt(input.min) || 0;
            const max = parseInt(input.max) || 9999;
            let v = (parseInt(input.value) || 0) + step;
            v = Math.max(min, Math.min(max, v));
            input.value = v;

            if (targetId === 'mspMarkerSize') m.markerSize = v;
            else if (targetId === 'mspIconSize') m.iconSize = v;
            saveMarkers();
            redrawMarkers();
            updatePreview();
        };
    });

    panel.querySelector('#mspMarkerSize').oninput = (e) => {
        m.markerSize = Math.max(20, Math.min(80, parseInt(e.target.value) || 40));
        saveMarkers();
        redrawMarkers();
        updatePreview();
    };
    panel.querySelector('#mspIconSize').oninput = (e) => {
        m.iconSize = Math.max(8, Math.min(60, parseInt(e.target.value) || 18));
        saveMarkers();
        redrawMarkers();
        updatePreview();
    };

    // Формы
    panel.querySelectorAll('.msp-shape-btn').forEach(btn => {
        btn.onclick = () => {
            m.shape = btn.dataset.shape;
            panel.querySelectorAll('.msp-shape-btn').forEach(b => b.classList.toggle('active', b.dataset.shape === m.shape));
            saveMarkers();
            redrawMarkers();
            updatePreview();
        };
    });

    // Цвета
    panel.querySelector('#mspFillColor').oninput = (e) => {
        m.fillColor = e.target.value;
        panel.querySelector('#mspFillHex').textContent = e.target.value;
        saveMarkers();
        redrawMarkers();
        updatePreview();
    };
    panel.querySelector('#mspBorderColor').oninput = (e) => {
        m.borderColor = e.target.value;
        panel.querySelector('#mspBorderHex').textContent = e.target.value;
        saveMarkers();
        redrawMarkers();
        updatePreview();
    };

    // Содержимое
    panel.querySelector('#mspEditContentBtn').onclick = () => {
        openContentEditor(m.id);
    };

    // Действия
    panel.querySelector('#mspSaveBtn').onclick = () => {
        closeMarkerSettings();
    };
    panel.querySelector('#mspDuplicateBtn').onclick = () => {
        const copy = { ...m, id: getDefaultMarker().id, lat: m.lat + 0.005, lng: m.lng + 0.005, name: m.name + ' (копия)', createdAt: Date.now(), updatedAt: Date.now() };
        markers.push(copy);
        saveMarkers();
        redrawMarkers();
        renderMarkersList();
        openMarkerSettings(copy.id);
    };
    panel.querySelector('#mspDeleteBtn').onclick = () => {
        if (!confirm(`Удалить маркер "${m.name}"?`)) return;
        markers = markers.filter(x => x.id !== m.id);
        saveMarkers();
        redrawMarkers();
        renderMarkersList();
        closeMarkerSettings();
    };
}

// ========== ПИКЕР ИКОНОК ==========

function openIconPicker(onSelect) {
    const modal = document.createElement('div');
    modal.className = 'marker-icon-picker';

    const categories = Object.keys(EMOJI_LIST);
    let activeCat = categories[0];

    function renderGrid(cat) {
        return EMOJI_LIST[cat].map(e =>
            `<button class="mip-emoji" data-emoji="${e}">${e}</button>`
        ).join('');
    }

    modal.innerHTML = `
        <div class="marker-icon-picker-box">
            <div class="mip-header">
                <h3>🎨 Выбор иконки</h3>
                <button class="msp-close" id="mipCloseBtn">✖</button>
            </div>
            <div class="mip-body">
                <div class="mip-categories" id="mipCategories">
                    ${categories.map((c, i) =>
                        `<button class="mip-cat ${i === 0 ? 'active' : ''}" data-cat="${c}">${c}</button>`
                    ).join('')}
                </div>
                <div class="mip-grid" id="mipGrid">${renderGrid(activeCat)}</div>
                <div class="mip-custom">
                    <input type="text" id="mipCustomInput" placeholder="Своё эмодзи или URL картинки…" maxlength="500">
                    <button class="msp-btn primary" id="mipCustomBtn" style="flex: 0 0 auto;">OK</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#mipCloseBtn').onclick = () => modal.remove();

    modal.querySelector('#mipCategories').addEventListener('click', (e) => {
        const btn = e.target.closest('.mip-cat');
        if (!btn) return;
        activeCat = btn.dataset.cat;
        modal.querySelectorAll('.mip-cat').forEach(b => b.classList.toggle('active', b.dataset.cat === activeCat));
        modal.querySelector('#mipGrid').innerHTML = renderGrid(activeCat);
    });

    modal.querySelector('#mipGrid').addEventListener('click', (e) => {
        const btn = e.target.closest('.mip-emoji');
        if (!btn) return;
        const emoji = btn.dataset.emoji;
        modal.remove();
        onSelect(emoji);
    });

    modal.querySelector('#mipCustomBtn').onclick = () => {
        const val = modal.querySelector('#mipCustomInput').value.trim();
        if (!val) return;
        modal.remove();
        onSelect(val);
    };

    modal.querySelector('#mipCustomInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') modal.querySelector('#mipCustomBtn').click();
    });

    setTimeout(() => modal.querySelector('#mipCustomInput')?.focus(), 100);
}

// ========== РЕДАКТОР СОДЕРЖИМОГО (RICH TEXT) ==========

function openContentEditor(id) {
    const m = markers.find(x => x.id === id);
    if (!m) return;

    const modal = document.createElement('div');
    modal.className = 'marker-editor-modal';
    modal.innerHTML = `
        <div class="marker-editor-box">
            <div class="marker-editor-header">
                <h3>✏️ Содержимое — ${escapeHtml(m.name)}</h3>
                <button class="msp-close" id="mceCloseBtn">✖</button>
            </div>
            <div class="marker-editor-toolbar">
                <button class="mrte-btn" data-cmd="bold" title="Жирный (Ctrl+B)"><b>B</b></button>
                <button class="mrte-btn" data-cmd="italic" title="Курсив (Ctrl+I)"><i>I</i></button>
                <button class="mrte-btn" data-cmd="underline" title="Подчёркнутый (Ctrl+U)"><u>U</u></button>
                <button class="mrte-btn" data-cmd="strikeThrough" title="Зачёркнутый"><s>S</s></button>
                <div class="mrte-sep"></div>
                <div class="mrte-color-wrap" title="Цвет текста">
                    <input type="color" id="mceForeColor" value="#e6ddb3">
                </div>
                <div class="mrte-color-wrap" title="Цвет фона">
                    <input type="color" id="mceHiliteColor" value="#3a2818">
                </div>
                <div class="mrte-sep"></div>
                <button class="mrte-btn" data-cmd="insertUnorderedList" title="Список">•</button>
                <button class="mrte-btn" data-cmd="insertOrderedList" title="Нумерованный список">1.</button>
                <div class="mrte-sep"></div>
                <button class="mrte-btn wide" data-insert="image" title="Вставить картинку по URL">🖼️ Картинка</button>
                <button class="mrte-btn wide" data-insert="video" title="Вставить видео (YouTube)">🎬 Видео</button>
                <button class="mrte-btn wide" data-insert="link" title="Вставить ссылку">🔗 Ссылка</button>
                <div class="mrte-sep"></div>
                <button class="mrte-btn" data-cmd="removeFormat" title="Убрать форматирование">⊘</button>
            </div>
            <div class="marker-editor-content" id="mceContent" contenteditable="true"></div>
            <div class="marker-editor-footer">
                <button class="msp-btn primary" id="mceSaveBtn">✅ Сохранить</button>
                <button class="msp-btn" id="mceCancelBtn">Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const contentEl = modal.querySelector('#mceContent');
    contentEl.innerHTML = m.content || '';

    // Кнопки форматирования
    modal.querySelectorAll('.mrte-btn[data-cmd]').forEach(btn => {
        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            document.execCommand(btn.dataset.cmd, false, null);
            contentEl.focus();
        });
    });

    // Цвета
    modal.querySelector('#mceForeColor').addEventListener('input', (e) => {
        contentEl.focus();
        document.execCommand('foreColor', false, e.target.value);
    });
    modal.querySelector('#mceHiliteColor').addEventListener('input', (e) => {
        contentEl.focus();
        document.execCommand('hiliteColor', false, e.target.value);
    });

    // Вставка картинок/видео/ссылок
    modal.querySelectorAll('.mrte-btn[data-insert]').forEach(btn => {
        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const type = btn.dataset.insert;
            if (type === 'image') {
                const url = prompt('URL картинки:', 'https://');
                if (url && url.trim() !== 'https://') {
                    document.execCommand('insertHTML', false, `<img src="${url.trim()}" alt="">`);
                }
            } else if (type === 'video') {
                const url = prompt('Ссылка на видео (YouTube):', 'https://www.youtube.com/watch?v=');
                if (url) {
                    const embed = toEmbedUrl(url);
                    if (embed) {
                        document.execCommand('insertHTML', false, `<iframe src="${embed}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`);
                    } else {
                        alert('Не удалось распознать ссылку. Поддерживаются: YouTube, VK Video, RuTube.');
                    }
                }
            } else if (type === 'link') {
                const url = prompt('URL ссылки:', 'https://');
                if (url) {
                    const text = prompt('Текст ссылки:', url);
                    if (text) {
                        document.execCommand('insertHTML', false, `<a href="${url}" target="_blank" rel="noopener">${escapeHtml(text)}</a>`);
                    }
                }
            }
            contentEl.focus();
        });
    });

    modal.querySelector('#mceCancelBtn').onclick = () => modal.remove();
    modal.querySelector('#mceCloseBtn').onclick = () => modal.remove();
    modal.querySelector('#mceSaveBtn').onclick = () => {
        m.content = contentEl.innerHTML;
        m.updatedAt = Date.now();
        saveMarkers();
        modal.remove();
        // Обновляем превью в панели настроек если открыто
        if (currentMarkerId === m.id) renderMarkerSettingsPanel(m);
        if (typeof addGlobalLog === 'function') addGlobalLog(`📝 Содержимое маркера "${m.name}" обновлено.`, 'map');
    };

    // Обновляем цвет при выделении текста
    document.addEventListener('selectionchange', _updateRteColors);
    function _updateRteColors() {
        if (!modal.isConnected) {
            document.removeEventListener('selectionchange', _updateRteColors);
            return;
        }
        // Опционально: можно подсвечивать текущий цвет
    }

    setTimeout(() => contentEl.focus(), 100);
}
window.openContentEditor = openContentEditor;

// Преобразование обычной ссылки в embed-версию
function toEmbedUrl(url) {
    url = url.trim();
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1`;
    // Уже embed
    if (url.includes('youtube.com/embed/')) return url;
    // RuTube
    const rtMatch = url.match(/rutube\.ru\/video\/([\w]+)/);
    if (rtMatch) return `https://rutube.ru/play/embed/${rtMatch[1]}`;
    // VK Video (сложнее, оставим как есть)
    const vkMatch = url.match(/vk\.com\/video(-?\d+)_(\d+)/);
    if (vkMatch) return `https://vk.com/video_ext.php?oid=${vkMatch[1]}&id=${vkMatch[2]}&autoplay=1`;
    return null;
}

// ========== СПИСОК МАРКЕРОВ (РЕДИЗАЙН) ==========

let markerFilters = {
    search: '',
    turn: 'all',   // 'all' | 'permanent' | number
    type: 'all'
};

function renderMarkersList() {
    const container = document.getElementById('markersList');
    if (!container) return;

    // Все доступные ходы для фильтра
    const turns = [...new Set(markers.map(m => m.turn).filter(t => t !== null && t !== undefined))].sort((a, b) => a - b);
    const types = [...new Set(markers.map(m => m.type).filter(Boolean))];

    container.innerHTML = `
        <div class="markers-filter-bar">
            <input type="text" id="mkFilterSearch" placeholder="🔍 Поиск..." value="${escapeHtml(markerFilters.search)}">
            <select id="mkFilterTurn">
                <option value="all" ${markerFilters.turn === 'all' ? 'selected' : ''}>Все ходы</option>
                <option value="permanent" ${markerFilters.turn === 'permanent' ? 'selected' : ''}>Постоянные</option>
                ${turns.map(t => `<option value="${t}" ${markerFilters.turn === t ? 'selected' : ''}>Ход ${t}</option>`).join('')}
            </select>
            <select id="mkFilterType">
                <option value="all">Все типы</option>
                ${types.map(t => `<option value="${t}" ${markerFilters.type === t ? 'selected' : ''}>${escapeHtml(t)}</option>`).join('')}
            </select>
        </div>
        <div class="markers-cards" id="markerCardsContainer"></div>
    `;

    // Обработчики фильтров
    container.querySelector('#mkFilterSearch').oninput = (e) => {
        markerFilters.search = e.target.value.toLowerCase();
        renderMarkerCards();
    };
    container.querySelector('#mkFilterTurn').onchange = (e) => {
        markerFilters.turn = e.target.value === 'all' || e.target.value === 'permanent'
            ? e.target.value
            : parseInt(e.target.value);
        renderMarkerCards();
    };
    container.querySelector('#mkFilterType').onchange = (e) => {
        markerFilters.type = e.target.value;
        renderMarkerCards();
    };

    renderMarkerCards();
}

function renderMarkerCards() {
    const cont = document.getElementById('markerCardsContainer');
    if (!cont) return;

    const filtered = markers.filter(m => {
        // Поиск
        if (markerFilters.search) {
            const s = markerFilters.search;
            const hay = (m.name + ' ' + (m.content || '') + ' ' + (m.type || '')).toLowerCase();
            if (!hay.includes(s)) return false;
        }
        // Ход
        if (markerFilters.turn === 'permanent') {
            if (m.turn !== null && m.turn !== undefined) return false;
        } else if (markerFilters.turn !== 'all') {
            if (m.turn !== markerFilters.turn) return false;
        }
        // Тип
        if (markerFilters.type !== 'all' && m.type !== markerFilters.type) return false;
        return true;
    });

    if (filtered.length === 0) {
        cont.innerHTML = '<div class="markers-empty">Нет маркеров по фильтрам</div>';
        return;
    }

    cont.innerHTML = filtered.map(m => {
        const shape = MARKER_SHAPES.includes(m.shape) ? m.shape : 'drop';
        const svgContent = SHAPE_SVGS[shape];
        const iconContent = (m.icon && (m.icon.startsWith('data:') || m.icon.startsWith('http') || m.icon.startsWith('icons/')))
            ? `<img src="${m.icon}" style="width:16px; height:16px; object-fit:contain;">`
            : (m.icon || '📍');

        const turnBadge = (m.turn !== null && m.turn !== undefined)
            ? `<span class="marker-card-badge turn">📅 Ход ${m.turn}</span>`
            : `<span class="marker-card-badge permanent">♾️ Постоянный</span>`;

        return `
            <div class="marker-card ${m.visible ? '' : 'hidden'}" data-mid="${m.id}">
                <div class="marker-card-preview shape-${shape}">
                    <svg viewBox="0 0 40 40" preserveAspectRatio="xMidYMid meet">
                        <g fill="${m.fillColor}" stroke="${m.borderColor}" stroke-width="2.5">
                            ${svgContent}
                        </g>
                    </svg>
                    <div class="mcp-icon">${iconContent}</div>
                </div>
                <div class="marker-card-body">
                    <div class="marker-card-name" title="${escapeHtml(m.name)}">${escapeHtml(m.name)}</div>
                    <div class="marker-card-meta">
                        <span class="marker-card-badge type">${escapeHtml(m.type || 'Общие')}</span>
                        ${turnBadge}
                    </div>
                </div>
                <div class="marker-card-actions">
                    <button class="zoom-marker-btn" data-mid="${m.id}" title="Найти на карте">🔍</button>
                    <button class="edit-marker-btn" data-mid="${m.id}" title="Настройки">✏️</button>
                    <button class="toggle-marker-btn" data-mid="${m.id}" title="${m.visible ? 'Скрыть' : 'Показать'}">${m.visible ? '👁️' : '🚫'}</button>
                    <button class="duplicate-marker-btn" data-mid="${m.id}" title="Копировать">📋</button>
                    <button class="delete-marker-btn danger" data-mid="${m.id}" title="Удалить">🗑️</button>
                </div>
            </div>
        `;
    }).join('');

    // Обработчики
    cont.querySelectorAll('.zoom-marker-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            zoomToMarker(btn.dataset.mid);
        };
    });
    cont.querySelectorAll('.edit-marker-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            openMarkerSettings(btn.dataset.mid);
        };
    });
    cont.querySelectorAll('.toggle-marker-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const m = markers.find(x => x.id === btn.dataset.mid);
            if (!m) return;
            m.visible = !m.visible;
            saveMarkers();
            redrawMarkers();
            renderMarkerCards();
        };
    });
    cont.querySelectorAll('.duplicate-marker-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const m = markers.find(x => x.id === btn.dataset.mid);
            if (!m) return;
            const copy = { ...m, id: getDefaultMarker().id, lat: m.lat + 0.005, lng: m.lng + 0.005, name: m.name + ' (копия)', createdAt: Date.now(), updatedAt: Date.now() };
            markers.push(copy);
            saveMarkers();
            redrawMarkers();
            renderMarkerCards();
        };
    });
    cont.querySelectorAll('.delete-marker-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const m = markers.find(x => x.id === btn.dataset.mid);
            if (!m) return;
            if (!confirm(`Удалить "${m.name}"?`)) return;
            markers = markers.filter(x => x.id !== m.id);
            saveMarkers();
            redrawMarkers();
            renderMarkerCards();
            if (currentMarkerId === m.id) closeMarkerSettings();
        };
    });
    // Клик по карточке (не на кнопку) — открыть настройки
    cont.querySelectorAll('.marker-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            openMarkerSettings(card.dataset.mid);
        });
    });
}

function zoomToMarker(id) {
    const m = markers.find(x => x.id === id);
    if (!m || !map) return;
    const latlng = L.latLng(m.lat, m.lng);
    map.setView(latlng, Math.max(map.getZoom(), 4), { animate: true });
    if (typeof addGlobalLog === 'function') addGlobalLog(`🔍 Центрирование на маркере "${m.name}"`, 'map');
}
window.zoomToMarker = zoomToMarker;

// ========== ЭКСПОРТ / ИМПОРТ ==========

function exportMarkers() {
    const data = {
        version: '3.0',
        exportDate: new Date().toISOString(),
        count: markers.length,
        markers: markers
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `markers_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    if (typeof addGlobalLog === 'function') addGlobalLog(`💾 Экспортировано ${markers.length} маркеров`, 'map');
}
window.exportMarkers = exportMarkers;

function importMarkers(file, replace = false) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            let newMarkers = Array.isArray(imported) ? imported : (imported.markers || []);
            if (!Array.isArray(newMarkers)) {
                alert('Неверный формат файла');
                return;
            }
            const normalized = newMarkers.map(migrateMarker);

            if (replace) {
                markers = normalized;
            } else {
                const existingIds = new Set(markers.map(m => m.id));
                const toAdd = normalized.filter(m => !existingIds.has(m.id));
                markers = markers.concat(toAdd);
                alert(`✅ Добавлено ${toAdd.length} маркеров. Всего: ${markers.length}`);
            }
            saveMarkers();
            redrawMarkers();
            renderMarkersList();
        } catch(err) {
            alert('Ошибка импорта: ' + err.message);
        }
    };
    reader.readAsText(file);
}
window.importMarkers = importMarkers;

function clearAllMarkers() {
    if (!confirm(`Удалить ВСЕ ${markers.length} маркеров? Это необратимо.`)) return;
    markers = [];
    saveMarkers();
    redrawMarkers();
    renderMarkersList();
    if (typeof addGlobalLog === 'function') addGlobalLog('🗑️ Все маркеры удалены', 'map');
}
window.clearAllMarkers = clearAllMarkers;

// ========== ИНИЦИАЛИЗАЦИЯ UI ==========

function initMarkersUI() {
    // Создаём панель настроек, если её нет
    if (!document.getElementById('markerSettingsPanel')) {
        const p = document.createElement('div');
        p.id = 'markerSettingsPanel';
        p.className = 'marker-settings-panel';
        document.body.appendChild(p);
    }

    const modeBtn = document.getElementById('markerModeBtn');
    if (modeBtn) {
        modeBtn.addEventListener('click', () => toggleMarkerMode());
    }

    const addBtn = document.getElementById('addMarkerBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            if (!markerMode) {
                toggleMarkerMode();
                if (typeof addGlobalLog === 'function') addGlobalLog('📍 Кликните по карте, чтобы поставить маркер', 'map');
            }
        });
    }

    const exportBtn = document.getElementById('exportMarkersBtn');
    if (exportBtn) exportBtn.addEventListener('click', exportMarkers);

    const importBtn = document.getElementById('importMarkersBtn');
    const importFile = document.getElementById('markersImportFile');
    if (importBtn) importBtn.addEventListener('click', () => importFile?.click());
    if (importFile) {
        importFile.addEventListener('change', (e) => {
            if (e.target.files.length) {
                const action = confirm('OK — добавить к существующим, Отмена — заменить полностью');
                importMarkers(e.target.files[0], !action);
            }
            e.target.value = '';
        });
    }

    const clearBtn = document.getElementById('clearMarkersBtn');
    if (clearBtn) clearBtn.addEventListener('click', clearAllMarkers);

    // Esc — закрывает всё
	document.addEventListener('keydown', (e) => {
		if (e.key !== 'Escape') return;
		// 1. Лайтбокс
		const lb = document.querySelector('.marker-lightbox');
		if (lb) { lb.remove(); return; }
		// 2. Расширенный просмотр
		const detail = document.getElementById('markerDetailModal');
		if (detail) { closeMarkerDetail(); return; }
		// 3. Панель настроек
		const settingsPanel = document.getElementById('markerSettingsPanel');
		if (settingsPanel?.classList.contains('open')) {
			closeMarkerSettings();
			return;
		}
		// 4. Режим добавления
		if (markerMode) toggleMarkerMode();
	});

    // Сворачивание панели маркеров
    const header = document.getElementById('markersPanelHeader');
    const panel = document.getElementById('markersPanel');
    if (header && panel) {
        let collapsed = false;
        header.addEventListener('click', () => {
            collapsed = !collapsed;
            const content = panel.querySelector('.map-panel-content');
            if (content) {
                content.style.display = collapsed ? 'none' : 'flex';
                const arrow = header.querySelector('span:last-child');
                if (arrow) arrow.innerHTML = collapsed ? '▶' : '▼';
            }
        });
    }

    // Загружаем маркеры
    loadMarkers();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMarkersUI);
} else {
    initMarkersUI();
}
// ==================== РАСШИРЕННЫЙ ПРОСМОТР МАРКЕРА ====================

function openMarkerDetail(id) {
    const m = markers.find(x => x.id === id);
    if (!m) return;

    const existing = document.getElementById('markerDetailModal');
    if (existing) existing.remove();

    const turnBadge = (m.turn !== null && m.turn !== undefined)
        ? `<span class="marker-detail-badge turn">📅 Ход ${m.turn}</span>`
        : `<span class="marker-detail-badge permanent">♾️ Постоянный</span>`;

    const content = (m.content || '').trim();
    const contentHtml = content
        ? content
        : `<div class="marker-detail-empty">У этого маркера пока нет описания.<br>Нажмите «✏️ Редактировать», чтобы добавить текст, картинки или видео.</div>`;

    const modal = document.createElement('div');
    modal.id = 'markerDetailModal';
    modal.className = 'marker-detail-modal';
    modal.innerHTML = `
        <div class="marker-detail-box">
            <div class="marker-detail-header">
                <div class="marker-detail-preview">
                    <div style="width: 100%; height: 100%; position: relative;">
                        ${buildMarkerHtml(m)}
                    </div>
                </div>
                <div class="marker-detail-title-block">
                    <div class="marker-detail-title">${escapeHtml(m.name)}</div>
                    <div class="marker-detail-meta">
                        <span class="marker-detail-badge type">${escapeHtml(m.type || 'Общие')}</span>
                        ${turnBadge}
                    </div>
                </div>
                <button class="marker-detail-close" id="mddCloseBtn" title="Закрыть (Esc)">✖</button>
            </div>
            <div class="marker-detail-body" id="mddBody">${contentHtml}</div>
            <div class="marker-detail-footer">
                <button id="mddZoomBtn">🔍 Найти на карте</button>
                <button id="mddDuplicateBtn">📋 Копировать</button>
                <button class="primary" id="mddEditBtn">✏️ Редактировать</button>
                <button class="danger" id="mddDeleteBtn">🗑️ Удалить</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Клик по фону — закрыть
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeMarkerDetail();
    });

    // Кнопки действий
    modal.querySelector('#mddCloseBtn').onclick = closeMarkerDetail;

    modal.querySelector('#mddZoomBtn').onclick = () => {
        closeMarkerDetail();
        zoomToMarker(m.id);
    };
    modal.querySelector('#mddDuplicateBtn').onclick = () => {
        const copy = {
            ...m,
            id: getDefaultMarker().id,
            lat: m.lat + 0.005,
            lng: m.lng + 0.005,
            name: m.name + ' (копия)',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        markers.push(copy);
        saveMarkers();
        redrawMarkers();
        renderMarkersList();
        closeMarkerDetail();
        setTimeout(() => openMarkerDetail(copy.id), 150);
    };
    modal.querySelector('#mddEditBtn').onclick = () => {
        closeMarkerDetail();
        if (typeof openContentEditor === 'function') openContentEditor(m.id);
    };
    modal.querySelector('#mddDeleteBtn').onclick = () => {
        if (!confirm(`Удалить маркер "${m.name}"?`)) return;
        markers = markers.filter(x => x.id !== m.id);
        saveMarkers();
        redrawMarkers();
        renderMarkersList();
        closeMarkerDetail();
        if (currentMarkerId === m.id) closeMarkerSettings();
    };

    // Esc — закрыть
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeMarkerDetail();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);

    // Лайтбокс для картинок
    modal.querySelectorAll('.marker-detail-body img').forEach(img => {
        img.onclick = () => openLightbox(img.src);
    });

    // Кнопка "на весь экран" для iframe
    modal.querySelectorAll('.marker-detail-body iframe').forEach(iframe => {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'position: relative;';
        iframe.parentNode.insertBefore(wrap, iframe);
        wrap.appendChild(iframe);

        const fsBtn = document.createElement('button');
        fsBtn.className = 'marker-media-fs-btn';
        fsBtn.innerHTML = '⛶';
        fsBtn.title = 'На весь экран';
        fsBtn.onclick = () => {
            if (iframe.requestFullscreen) iframe.requestFullscreen();
            else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
            else if (iframe.webkitEnterFullscreen) iframe.webkitEnterFullscreen();
        };
        wrap.appendChild(fsBtn);
    });
}
window.openMarkerDetail = openMarkerDetail;

function closeMarkerDetail() {
    const m = document.getElementById('markerDetailModal');
    if (!m) return;
    m.style.opacity = '0';
    setTimeout(() => m.remove(), 150);
}
window.closeMarkerDetail = closeMarkerDetail;

function openLightbox(src) {
    const lb = document.createElement('div');
    lb.className = 'marker-lightbox';
    lb.innerHTML = `<img src="${src}" alt="">`;
    lb.onclick = () => lb.remove();

    const escHandler = (e) => {
        if (e.key === 'Escape') {
            lb.remove();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);

    document.body.appendChild(lb);
}
window.openLightbox = openLightbox;
// Экспорт
window.loadMarkers = loadMarkers;
window.saveMarkers = saveMarkers;
window.redrawMarkers = redrawMarkers;
window.renderMarkersList = renderMarkersList;

console.log('✅ markers.js загружен — v3.0 (полный редизайн с панелью настроек)');