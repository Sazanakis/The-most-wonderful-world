// ============================================================================
// МОДУЛЬ 20: markers.js (версия 2.0 — каплевидные маркеры, загрузка PNG, правая панель)
// ============================================================================
// Загружено на гитхаб 18.07.2026
let markers = [];
let markerLayers = [];
let markerMode = false;
let editingMarkerId = null;

// ========== ЗАГРУЗКА / СОХРАНЕНИЕ ==========
function loadMarkers() {
    const saved = localStorage.getItem('customMarkers');
    if (saved) {
        try {
            markers = JSON.parse(saved);
            markers = markers.map(m => ({
                ...m,
                visible: m.visible !== undefined ? m.visible : true,
                category: m.category || 'Общие',
                icon: m.icon || '📍',
                color: m.color || '#ff6b6b',
                description: m.description || ''
            }));
        } catch(e) {
            console.error('Ошибка загрузки маркеров:', e);
            markers = [];
        }
    }
    renderMarkersList();
    redrawMarkers();
}

function saveMarkers() {
    localStorage.setItem('customMarkers', JSON.stringify(markers));
    if (typeof GameState !== 'undefined') {
        GameState.markers = markers;
        GameState.save();
    }
}

// ========== ОТРИСОВКА МАРКЕРОВ НА КАРТЕ (каплевидные) ==========
function redrawMarkers() {
    if (!map) return;
    markerLayers.forEach(layer => map.removeLayer(layer));
    markerLayers = [];

    for (let m of markers) {
        if (!m.visible) continue;
        const latLng = L.latLng(m.lat, m.lng);
        // Формируем HTML для капли
        let innerHtml;
        if (m.icon && m.icon.startsWith('data:image/')) {
            innerHtml = `<img src="${m.icon}" alt="">`;
        } else {
            innerHtml = `<span>${m.icon || '📍'}</span>`;
        }
        const iconHtml = `
            <div class="marker-drop" style="background: ${m.color};">
                ${innerHtml}
            </div>
        `;
        const icon = L.divIcon({
            html: iconHtml,
            className: 'custom-marker',
            iconSize: [32, 32],
            popupAnchor: [0, -16]
        });
        const marker = L.marker(latLng, { icon });
        let popupContent = `<strong>${m.name}</strong>`;
        if (m.description) popupContent += `<br>${m.description}`;
        if (m.category) popupContent += `<br><span style="font-size:0.7rem;color:#8a7a5a;">${m.category}</span>`;
        marker.bindPopup(popupContent);
        marker.addTo(map);
        markerLayers.push(marker);
    }
}

// ========== ПОИСК / ЦЕНТРИРОВАНИЕ ==========
function zoomToMarker(id) {
    const marker = markers.find(m => m.id === id);
    if (!marker || !map) return;
    const latLng = L.latLng(marker.lat, marker.lng);
    map.setView(latLng, 8, { animate: true });
    if (typeof addGlobalLog === 'function') {
        addGlobalLog(`🔍 Центрирование на маркере "${marker.name}"`, 'map');
    }
}

// ========== ОТРИСОВКА СПИСКА ==========
function renderMarkersList() {
    const container = document.getElementById('markersList');
    if (!container) return;

    if (markers.length === 0) {
        container.innerHTML = `<div style="color:#8a7a5a; padding:10px; text-align:center;">Нет маркеров. Нажмите «Добавить».</div>`;
        return;
    }

    let html = `
        <div style="display:table; width:100%; border-collapse:collapse; font-size:0.65rem;">
            <!-- Заголовок -->
            <div style="display:table-row; font-weight:bold; color:#ffd966; border-bottom:1px solid #b87c4f;">
                <div style="display:table-cell; padding:2px 2px; width:18px; text-align:center;">#</div>
                <div style="display:table-cell; padding:2px 2px; width:22px; text-align:center;">🖼️</div>
                <div style="display:table-cell; padding:2px 4px; text-align:left;">Название</div>
                <div style="display:table-cell; padding:2px 4px; width:55px; text-align:left;">Категория</div>
                <div style="display:table-cell; padding:2px 2px; width:65px; text-align:center;">Действия</div>
            </div>
    `;

    for (let i = 0; i < markers.length; i++) {
        const m = markers[i];
        const color = m.color || '#ff6b6b';

        let previewIcon;
        if (m.icon && m.icon.startsWith('data:image/')) {
            previewIcon = `<img src="${m.icon}" style="width:16px; height:16px; object-fit:contain; border-radius:2px;">`;
        } else {
            previewIcon = `<span style="font-size:16px;">${m.icon || '📍'}</span>`;
        }

        const safeName = escapeHtml(m.name);
        const safeCategory = escapeHtml(m.category || 'Общие');

        html += `
            <div style="display:table-row; border-bottom:1px solid #2a2418;">
                <div style="display:table-cell; padding:2px 2px; width:18px; text-align:center; vertical-align:middle;">
                    <input type="checkbox" class="marker-visibility" data-id="${m.id}" ${m.visible ? 'checked' : ''} style="margin:0; width:14px; height:14px;">
                </div>
                <div style="display:table-cell; padding:2px 2px; width:22px; text-align:center; vertical-align:middle; color:#8a7a5a; font-size:0.6rem;">
                    ${i+1}
                </div>
                <div style="display:table-cell; padding:2px 2px; width:24px; text-align:center; vertical-align:middle;">
                    ${previewIcon}
                </div>
                <div style="display:table-cell; padding:2px 4px; text-align:left; vertical-align:middle; max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${safeName}">
                    ${safeName}
                </div>
                <div style="display:table-cell; padding:2px 4px; width:55px; text-align:left; vertical-align:middle; max-width:55px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#8a7a5a;" title="${safeCategory}">
                    ${safeCategory}
                </div>
                <div style="display:table-cell; padding:2px 2px; width:65px; text-align:center; vertical-align:middle; white-space:nowrap;">
                    <button class="zoom-marker-btn" data-id="${m.id}" style="background:#3a5a2a; padding:1px 4px; font-size:0.6rem; border-radius:10px; margin:0 1px;" title="Найти">🔍</button>
                    <button class="edit-marker-btn" data-id="${m.id}" style="background:#b8860b; padding:1px 4px; font-size:0.6rem; border-radius:10px; margin:0 1px;" title="Редактировать">✏️</button>
                    <button class="delete-marker-btn" data-id="${m.id}" style="background:#7a2a2a; padding:1px 4px; font-size:0.6rem; border-radius:10px; margin:0 1px;" title="Удалить">🗑️</button>
                </div>
            </div>
        `;
    }

    html += `</div>`;
    container.innerHTML = html;

    // Обработчики (без изменений)
    container.querySelectorAll('.marker-visibility').forEach(cb => {
        cb.addEventListener('change', function() {
            const id = this.dataset.id;
            const marker = markers.find(m => m.id === id);
            if (marker) {
                marker.visible = this.checked;
                saveMarkers();
                redrawMarkers();
            }
        });
    });
    container.querySelectorAll('.zoom-marker-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            zoomToMarker(this.dataset.id);
        });
    });
    container.querySelectorAll('.edit-marker-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            openMarkerEditor(this.dataset.id);
        });
    });
    container.querySelectorAll('.delete-marker-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            if (confirm('Удалить маркер?')) {
                markers = markers.filter(m => m.id !== id);
                saveMarkers();
                renderMarkersList();
                redrawMarkers();
            }
        });
    });
}

// ========== РЕДАКТОР (с загрузкой PNG) ==========
function openMarkerEditor(markerId) {
    const marker = markerId ? markers.find(m => m.id === markerId) : null;
    const isNew = !marker;
    const data = marker ? { ...marker } : {
        id: Date.now() + '-' + Math.random().toString(36).substr(2, 6),
        name: '',
        lat: 0,
        lng: 0,
        icon: '📍',
        color: '#ff6b6b',
        description: '',
        category: 'Общие',
        visible: true
    };

    if (isNew && window._pendingMarkerCoords) {
        data.lat = window._pendingMarkerCoords.lat;
        data.lng = window._pendingMarkerCoords.lng;
        window._pendingMarkerCoords = null;
    }

    // Определяем контейнер для модального окна (для полноэкранного режима)
    let targetContainer = document.body;
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
    if (fullscreenElement && fullscreenElement.classList && fullscreenElement.classList.contains('map-container')) {
        targetContainer = fullscreenElement;
    } else {
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) targetContainer = mapContainer;
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; width: 90%;">
            <span class="close-modal" onclick="this.closest('.modal').remove()">&times;</span>
            <h3>${isNew ? '➕ Новый маркер' : '✏️ Редактировать маркер'}</h3>
            <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 15px;">
                <label>Название: <input type="text" id="markerName" value="${data.name}" style="width:100%;"></label>
                <label>Иконка (эмодзи или URL):
                    <input type="text" id="markerIcon" value="${data.icon}" style="width:100%;">
                </label>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <button id="uploadPngBtn" style="background:#3a5a2a;">📁 Загрузить PNG</button>
                    <input type="file" id="pngFileInput" accept="image/png" style="display:none;">
                    <span style="font-size:0.7rem; color:#8a7a5a;">(заменит иконку на картинку)</span>
                </div>
                <label>Цвет: <input type="color" id="markerColor" value="${data.color}" style="width:60px;"></label>
                <label>Категория: <input type="text" id="markerCategory" value="${data.category}" style="width:100%;"></label>
                <label>Описание: <textarea id="markerDescription" rows="3" style="width:100%;">${data.description}</textarea></label>
                <div style="display: flex; gap: 10px; font-size:0.8rem; color:#8a7a5a;">
                    <span>📌 Координаты: ${data.lat.toFixed(1)}, ${data.lng.toFixed(1)}</span>
                    ${isNew ? `<span style="color:#ffd966;">(установлены кликом по карте)</span>` : ''}
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 10px;">
                    <button id="saveMarkerBtn" style="background:#3a6b3a;">✅ Сохранить</button>
                    <button onclick="this.closest('.modal').remove()" style="background:#7a2a2a;">❌ Отмена</button>
                </div>
            </div>
        </div>
    `;
    targetContainer.appendChild(modal);

    // Обработчик загрузки PNG
    document.getElementById('uploadPngBtn').addEventListener('click', () => {
        document.getElementById('pngFileInput').click();
    });
    document.getElementById('pngFileInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target.result;
            document.getElementById('markerIcon').value = dataUrl;
            alert('PNG загружен! Сохраните маркер, чтобы применить.');
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    });

    document.getElementById('saveMarkerBtn').addEventListener('click', () => {
        const name = document.getElementById('markerName').value.trim();
        if (!name) { alert('Введите название'); return; }
        data.name = name;
        data.icon = document.getElementById('markerIcon').value.trim() || '📍';
        data.color = document.getElementById('markerColor').value;
        data.category = document.getElementById('markerCategory').value.trim() || 'Общие';
        data.description = document.getElementById('markerDescription').value.trim();

        if (isNew) {
            markers.push(data);
        } else {
            const index = markers.findIndex(m => m.id === data.id);
            if (index !== -1) markers[index] = data;
        }
        saveMarkers();
        renderMarkersList();
        redrawMarkers();
        modal.remove();
    });
}

// ========== РЕЖИМ ДОБАВЛЕНИЯ КЛИКОМ ==========
function toggleMarkerMode() {
    markerMode = !markerMode;
    const btn = document.getElementById('markerModeBtn');
    const panel = document.getElementById('markersPanel');
    
    if (btn) {
        btn.classList.toggle('active', markerMode);
        // Меняем подсказку в зависимости от состояния
        btn.title = markerMode ? 'Отключить добавление маркеров' : 'Добавить маркер';
        // Не трогаем textContent, оставляем иконку 📍
    }
    
    if (panel) {
        panel.style.display = markerMode ? 'block' : 'none';
    }
    
    if (markerMode) {
        map.on('click', _markerClickHandler);
    } else {
        map.off('click', _markerClickHandler);
    }
}

function _markerClickHandler(e) {
    if (!markerMode) return;
    window._pendingMarkerCoords = e.latlng;
    openMarkerEditor(null);
    // После добавления выходим из режима
    toggleMarkerMode();
}

// ========== ЭКСПОРТ ==========
function exportMarkers() {
    const data = {
        exportDate: new Date().toISOString(),
        count: markers.length,
        markers: markers
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `markers_${new Date().toISOString().slice(0,19)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    if (typeof addGlobalLog === 'function') {
        addGlobalLog(`💾 Экспортировано ${markers.length} маркеров`, 'map');
    }
}

// ========== ИМПОРТ (С ОБЪЕДИНЕНИЕМ) ==========
function importMarkers(file, replace = false) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            let newMarkers = [];
            if (Array.isArray(imported)) {
                newMarkers = imported;
            } else if (imported.markers && Array.isArray(imported.markers)) {
                newMarkers = imported.markers;
            } else {
                alert('Неверный формат файла');
                return;
            }

            const normalized = newMarkers.map(m => ({
                ...m,
                id: m.id || Date.now() + '-' + Math.random().toString(36).substr(2, 6),
                visible: m.visible !== undefined ? m.visible : true,
                category: m.category || 'Общие',
                icon: m.icon || '📍',
                color: m.color || '#ff6b6b',
                description: m.description || ''
            }));

            if (replace) {
                markers = normalized;
            } else {
                const existingIds = new Set(markers.map(m => m.id));
                const toAdd = normalized.filter(m => !existingIds.has(m.id));
                markers = markers.concat(toAdd);
                const addedCount = toAdd.length;
                if (typeof addGlobalLog === 'function') {
                    addGlobalLog(`📂 Импортировано ${addedCount} новых маркеров (всего: ${markers.length})`, 'map');
                }
                alert(`✅ Добавлено ${addedCount} маркеров. Всего: ${markers.length}`);
            }
            saveMarkers();
            renderMarkersList();
            redrawMarkers();
        } catch(err) {
            alert('Ошибка импорта: ' + err.message);
        }
    };
    reader.readAsText(file);
}

// ========== ОЧИСТКА ==========
function clearAllMarkers() {
    if (confirm('Удалить все маркеры?')) {
        markers = [];
        saveMarkers();
        renderMarkersList();
        redrawMarkers();
        if (typeof addGlobalLog === 'function') {
            addGlobalLog('🗑️ Все маркеры удалены', 'map');
        }
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ UI ==========
function initMarkersUI() {
    const modeBtn = document.getElementById('markerModeBtn');
    const panel = document.querySelector('.map-panel-markers');
    if (modeBtn) {
        modeBtn.addEventListener('click', () => {
            // Если панель скрыта или режим выключен – включаем
            if (!markerMode) {
                toggleMarkerMode();
            } else {
                // Если уже включен – выключаем
                toggleMarkerMode();
            }
        });
    }

    // Кнопка "Добавить" внутри панели
    const addBtn = document.getElementById('addMarkerBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            if (!markerMode) toggleMarkerMode();
            alert('Кликните на карте, чтобы установить маркер');
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
                const action = confirm('Нажмите OK для добавления маркеров (объединение), Отмена — для полной замены');
                importMarkers(e.target.files[0], !action);
            }
            e.target.value = '';
        });
    }

    const clearBtn = document.getElementById('clearMarkersBtn');
    if (clearBtn) clearBtn.addEventListener('click', clearAllMarkers);

    // Загружаем маркеры
    loadMarkers();

    // Добавляем сворачивание панели (по клику на заголовок)
    const header = document.getElementById('markersPanelHeader');
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
}

// Запуск
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMarkersUI);
} else {
    initMarkersUI();
}

// Экспорт
window.toggleMarkerMode = toggleMarkerMode;
window.openMarkerEditor = openMarkerEditor;
window.redrawMarkers = redrawMarkers;
window.loadMarkers = loadMarkers;
window.exportMarkers = exportMarkers;
window.importMarkers = importMarkers;
window.clearAllMarkers = clearAllMarkers;
window.zoomToMarker = zoomToMarker;

console.log("✅ markers.js обновлён — каплевидные маркеры, загрузка PNG, правая панель");