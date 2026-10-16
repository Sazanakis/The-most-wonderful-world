// ============================================================================
// map_trade_routes.js — торговые пути и анимированные караваны
// ============================================================================
// Хранилище: localStorage['world_trade_routes'] — общий ключ
// Автозагрузка: data/trade_routes.json (если файл есть в репозитории)
// Формат записи: { id, name, icon, points: [{lat,lng}], color, createdAt }
// ============================================================================

const TRADE_ROUTES_KEY = 'world_trade_routes';
const TRADE_ROUTES_REPO_URL = 'data/trade_routes.json';

// ---------- Глобальное состояние ----------
let tradeRoutes = [];              // все загруженные пути
let tradeTempPoints = [];          // точки в процессе рисования
let tradeTempLine = null;          // текущая линия в процессе рисования
let tradeTempMarkers = [];         // точки-маркеры в процессе рисования
let tradeDrawMode = false;
let tradeRenderLayer = null;       // слой со статичными линиями
let tradeCaravanLayer = null;      // слой с бегущими иконками
let tradeCaravans = [];            // активные караваны
let tradeRAF = null;
let tradeAnimationActive = false;

// ---------- Утилиты ----------
function _escapeHtml(s) {
    if (!s) return '';
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function _generateId() {
    return 'trade_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
}

// ============================================================================
// ХРАНИЛИЩЕ
// ============================================================================

function loadTradeRoutes() {
    try {
        const raw = localStorage.getItem(TRADE_ROUTES_KEY);
        tradeRoutes = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(tradeRoutes)) tradeRoutes = [];
    } catch (e) {
        console.error('Ошибка чтения торговых путей:', e);
        tradeRoutes = [];
    }
    return tradeRoutes;
}

function saveTradeRoutes() {
    try {
        localStorage.setItem(TRADE_ROUTES_KEY, JSON.stringify(tradeRoutes));
    } catch (e) {
        console.error('Ошибка сохранения торговых путей:', e);
    }
}

// ============================================================================
// ОТРИСОВКА ЛИНИЙ
// ============================================================================

function renderTradeRoutes() {
    if (!map) return;
    if (tradeRenderLayer) map.removeLayer(tradeRenderLayer);
    tradeRenderLayer = L.layerGroup().addTo(map);

    for (let route of tradeRoutes) {
        if (!route.points || route.points.length < 2) continue;
        const latlngs = route.points.map(p => [p.lat, p.lng]);

        // Тень (контур)
        L.polyline(latlngs, {
            color: '#1a1410',
            weight: 9,
            opacity: 0.55,
            lineCap: 'round'
        }).addTo(tradeRenderLayer);

        // Основная линия
        const line = L.polyline(latlngs, {
            color: route.color || '#d4af37',
            weight: 5,
            opacity: 0.9,
            dashArray: '12,8',
            lineCap: 'round'
        }).addTo(tradeRenderLayer);

        // Тултип с названием
        line.bindTooltip(
            `<b>${_escapeHtml(route.icon || '🚚')} ${_escapeHtml(route.name)}</b>`,
            { sticky: true, direction: 'top', className: 'city-tooltip' }
        );

        // Начало (зелёная точка)
        L.marker(latlngs[0], {
            icon: L.divIcon({
                html: '<div style="background:#2a6b3a;border:2px solid #d4af37;border-radius:50%;width:14px;height:14px;box-shadow:0 0 8px rgba(212,175,55,0.7);"></div>',
                className: '', iconSize: [14, 14], iconAnchor: [7, 7]
            }),
            interactive: false
        }).addTo(tradeRenderLayer);

        // Конец (красная точка)
        L.marker(latlngs[latlngs.length - 1], {
            icon: L.divIcon({
                html: '<div style="background:#7a2a2a;border:2px solid #d4af37;border-radius:50%;width:14px;height:14px;box-shadow:0 0 8px rgba(212,175,55,0.7);"></div>',
                className: '', iconSize: [14, 14], iconAnchor: [7, 7]
            }),
            interactive: false
        }).addTo(tradeRenderLayer);
    }
}

// ============================================================================
// РЕЖИМ РИСОВАНИЯ
// ============================================================================

function startTradeDraw() {
    if (!map) {
        alert('Карта ещё не загружена.');
        return;
    }
    if (tradeDrawMode) return;

    tradeDrawMode = true;
    tradeTempPoints = [];

    if (tradeTempLine) { map.removeLayer(tradeTempLine); tradeTempLine = null; }
    tradeTempMarkers.forEach(m => map.removeLayer(m));
    tradeTempMarkers = [];

    map.getContainer().style.cursor = 'crosshair';
    map.on('click', onTradeMapClick);
    map.on('dblclick', onTradeMapDblClick);

    const hint = document.getElementById('tradeHint');
    if (hint) hint.style.display = 'block';

    updateTradeButtons();
}

function cancelTradeDraw() {
    if (!tradeDrawMode) return;
    tradeDrawMode = false;

    if (map) {
        map.getContainer().style.cursor = '';
        map.off('click', onTradeMapClick);
        map.off('dblclick', onTradeMapDblClick);
    }
    if (tradeTempLine && map) { map.removeLayer(tradeTempLine); tradeTempLine = null; }
    tradeTempMarkers.forEach(m => { if (map) map.removeLayer(m); });
    tradeTempMarkers = [];
    tradeTempPoints = [];

    const hint = document.getElementById('tradeHint');
    if (hint) hint.style.display = 'none';

    updateTradeButtons();
}

function onTradeMapClick(e) {
    if (!tradeDrawMode) return;
    const latlng = e.latlng;
    tradeTempPoints.push({ lat: latlng.lat, lng: latlng.lng });

    const dot = L.circleMarker(latlng, {
        radius: 6,
        color: '#d4af37',
        weight: 2,
        fillColor: '#ffd966',
        fillOpacity: 1
    }).addTo(map);
    tradeTempMarkers.push(dot);

    if (tradeTempPoints.length >= 2) {
        if (tradeTempLine) map.removeLayer(tradeTempLine);
        const latlngs = tradeTempPoints.map(p => [p.lat, p.lng]);
        tradeTempLine = L.polyline(latlngs, {
            color: '#d4af37',
            weight: 5,
            opacity: 0.9,
            dashArray: '10,6'
        }).addTo(map);
    }

    updateTradeButtons();
}

function onTradeMapDblClick(e) {
    if (!tradeDrawMode) return;
    L.DomEvent.stopPropagation(e);
    if (tradeTempPoints.length >= 2) {
        finishTradeDraw();
    } else {
        alert('Нужно минимум 2 точки для торгового пути.');
    }
}

function finishTradeDraw() {
    if (tradeTempPoints.length < 2) {
        alert('Нужно минимум 2 точки.');
        return;
    }

    const name = prompt('Название торгового пути:', `Торговый путь ${tradeRoutes.length + 1}`);
    if (!name || !name.trim()) return;

    const icon = prompt('Иконка каравана (эмодзи):', '🚚') || '🚚';

    const newRoute = {
        id: _generateId(),
        name: name.trim(),
        icon: icon.trim() || '🚚',
        points: tradeTempPoints.slice(),
        color: '#d4af37',
        createdAt: new Date().toISOString()
    };

    tradeRoutes.push(newRoute);
    saveTradeRoutes();

    cancelTradeDraw();
    renderTradeRoutes();
    renderTradeRoutesList();

    console.log(`✅ Торговый путь «${newRoute.name}» сохранён (${newRoute.points.length} точек)`);
}

// ============================================================================
// АНИМАЦИЯ КАРАВАНОВ
// ============================================================================

function startTradeAnimation() {
    if (tradeAnimationActive) return;
    if (!tradeRoutes.length) {
        alert('Нет торговых путей. Сначала создайте хотя бы один.');
        return;
    }
    if (!map) return;

    tradeCaravanLayer = L.layerGroup().addTo(map);
    tradeCaravans = [];

    for (let route of tradeRoutes) {
        if (!route.points || route.points.length < 2) continue;

        const icon = L.divIcon({
            html: `<div style="
                width:34px;height:34px;
                background:rgba(20,14,10,0.9);
                border:2px solid #d4af37;
                border-radius:50%;
                display:flex;align-items:center;justify-content:center;
                font-size:20px;
                box-shadow: 0 0 14px rgba(212,175,55,0.7), 0 2px 8px rgba(0,0,0,0.7);
            ">${_escapeHtml(route.icon || '🚚')}</div>`,
            className: '',
            iconSize: [34, 34],
            iconAnchor: [17, 17]
        });

        const marker = L.marker(
            [route.points[0].lat, route.points[0].lng],
            { icon, interactive: false, zIndexOffset: 2000 }
        ).addTo(tradeCaravanLayer);

        // Каждая точка начинает со случайного сдвига, чтобы караваны не совпадали
        tradeCaravans.push({
            route,
            marker,
            t: Math.random(),
            speed: 0.00015 + Math.random() * 0.00012
        });
    }

    tradeAnimationActive = true;
    tradeRAF = requestAnimationFrame(animateTrade);
    updateTradeButtons();
    console.log(`🚚 Запущено ${tradeCaravans.length} караванов`);
}

function stopTradeAnimation() {
    tradeAnimationActive = false;
    if (tradeRAF) { cancelAnimationFrame(tradeRAF); tradeRAF = null; }
    if (tradeCaravanLayer && map) map.removeLayer(tradeCaravanLayer);
    tradeCaravanLayer = null;
    tradeCaravans = [];
    updateTradeButtons();
}

function animateTrade() {
    if (!tradeAnimationActive) return;

    for (let c of tradeCaravans) {
        c.t += c.speed;
        if (c.t > 1) c.t -= 1;

        const pos = interpolateTradePosition(c.route.points, c.t);
        if (pos) c.marker.setLatLng([pos.lat, pos.lng]);
    }

    tradeRAF = requestAnimationFrame(animateTrade);
}

function interpolateTradePosition(points, t) {
    if (!points || points.length < 2) return null;
    const segments = points.length - 1;
    const target = t * segments;
    const idx = Math.floor(target);
    const frac = target - idx;

    if (idx >= segments) return points[points.length - 1];
    const p1 = points[idx];
    const p2 = points[idx + 1];
    return {
        lat: p1.lat + (p2.lat - p1.lat) * frac,
        lng: p1.lng + (p2.lng - p1.lng) * frac
    };
}

// ============================================================================
// ЭКСПОРТ / ИМПОРТ
// ============================================================================

function exportTradeRoutes() {
    if (!tradeRoutes.length) {
        alert('Нет торговых путей для экспорта.');
        return;
    }
    const blob = new Blob([JSON.stringify(tradeRoutes, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `trade_routes_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
}

function importTradeRoutes(file, replace = false) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (!Array.isArray(imported)) {
                alert('Неверный формат файла: ожидался массив.');
                return;
            }
            const valid = imported.filter(r =>
                r && r.points && Array.isArray(r.points) && r.points.length >= 2
            );

            if (replace) {
                tradeRoutes = valid;
            } else {
                const existingIds = new Set(tradeRoutes.map(r => r.id));
                for (let r of valid) {
                    if (!existingIds.has(r.id)) tradeRoutes.push(r);
                }
            }
            saveTradeRoutes();
            renderTradeRoutes();
            renderTradeRoutesList();
            alert(`Импортировано ${valid.length} торговых путей.`);
        } catch (err) {
            alert('Ошибка импорта: ' + err.message);
        }
    };
    reader.readAsText(file);
}

function deleteTradeRoute(id) {
    if (!confirm('Удалить этот торговый путь?')) return;
    tradeRoutes = tradeRoutes.filter(r => r.id !== id);
    saveTradeRoutes();
    renderTradeRoutes();
    renderTradeRoutesList();
}

function clearAllTradeRoutes() {
    if (!confirm('Удалить ВСЕ торговые пути?')) return;
    tradeRoutes = [];
    saveTradeRoutes();
    renderTradeRoutes();
    renderTradeRoutesList();
}

// ============================================================================
// UI
// ============================================================================

function updateTradeButtons() {
    const drawBtn = document.getElementById('tradeDrawBtn');
    const saveBtn = document.getElementById('tradeSaveBtn');
    const cancelBtn = document.getElementById('tradeCancelBtn');
    const animBtn = document.getElementById('tradeAnimBtn');

    if (drawBtn) {
        drawBtn.textContent = tradeDrawMode ? '✏️ Рисуем...' : '✏️ Рисовать путь';
        drawBtn.style.background = tradeDrawMode ? '#3a6b3a' : '';
    }
    if (saveBtn) {
        saveBtn.disabled = !tradeDrawMode || tradeTempPoints.length < 2;
        saveBtn.style.opacity = saveBtn.disabled ? '0.4' : '1';
    }
    if (cancelBtn) {
        cancelBtn.style.display = tradeDrawMode ? 'inline-block' : 'none';
    }
    if (animBtn) {
        animBtn.textContent = tradeAnimationActive ? '⏹️ Стоп караваны' : '🚚 Запустить караваны';
        animBtn.style.background = tradeAnimationActive ? '#3a6b3a' : '';
    }
}

function renderTradeRoutesList() {
    const list = document.getElementById('tradeRoutesList');
    if (!list) return;

    if (!tradeRoutes.length) {
        list.innerHTML = '<div style="color:#8a7a5a;font-size:0.75rem;text-align:center;padding:8px;">Нет торговых путей</div>';
        return;
    }

    list.innerHTML = tradeRoutes.map(r => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px;background:rgba(0,0,0,0.3);border-radius:6px;margin-bottom:4px;font-size:0.75rem;">
            <span>${_escapeHtml(r.icon || '🚚')} ${_escapeHtml(r.name)}</span>
            <button data-trade-id="${r.id}" style="background:#7a2a2a;border:none;color:#fff;border-radius:4px;padding:2px 6px;cursor:pointer;font-size:0.7rem;">✖</button>
        </div>
    `).join('');

    list.querySelectorAll('button[data-trade-id]').forEach(btn => {
        btn.onclick = () => deleteTradeRoute(btn.dataset.tradeId);
    });
}

// ============================================================================
// АВТОЗАГРУЗКА ИЗ РЕПОЗИТОРИЯ
// ============================================================================

async function autoLoadTradeRoutesFromFile() {
    try {
        const response = await fetch(TRADE_ROUTES_REPO_URL);
        if (!response.ok) return;
        const imported = await response.json();
        if (!Array.isArray(imported) || imported.length === 0) return;

        const existingIds = new Set(tradeRoutes.map(r => r.id));
        let added = 0;
        for (let r of imported) {
            if (!r || !r.points || !Array.isArray(r.points) || r.points.length < 2) continue;
            if (!existingIds.has(r.id)) {
                tradeRoutes.push(r);
                added++;
            }
        }
        if (added > 0) {
            saveTradeRoutes();
            renderTradeRoutes();
            renderTradeRoutesList();
            console.log(`🌐 Загружено ${added} общих торговых путей из файла репозитория`);
        }
    } catch (e) {
        // Файла нет — это нормально, ничего не делаем
    }
}

// ============================================================================
// ЭКСПОРТ В ГЛОБАЛЬНУЮ ОБЛАСТЬ
// ============================================================================

window.startTradeDraw = startTradeDraw;
window.cancelTradeDraw = cancelTradeDraw;
window.finishTradeDraw = finishTradeDraw;
window.startTradeAnimation = startTradeAnimation;
window.stopTradeAnimation = stopTradeAnimation;
window.exportTradeRoutes = exportTradeRoutes;
window.importTradeRoutes = importTradeRoutes;
window.deleteTradeRoute = deleteTradeRoute;
window.clearAllTradeRoutes = clearAllTradeRoutes;
window.renderTradeRoutesList = renderTradeRoutesList;
window.loadTradeRoutes = loadTradeRoutes;
window.renderTradeRoutes = renderTradeRoutes;
window.autoLoadTradeRoutesFromFile = autoLoadTradeRoutesFromFile;
window.updateTradeButtons = updateTradeButtons;

// Геттер для состояния (используется в ui_map.js)
Object.defineProperty(window, 'tradeAnimationActive', {
    get: function () { return tradeAnimationActive; }
});

// ---------- Автостарт ----------
window.addEventListener('load', () => {
    setTimeout(() => {
        if (typeof map !== 'undefined' && map) {
            loadTradeRoutes();
            renderTradeRoutes();
            renderTradeRoutesList();
            updateTradeButtons();
            console.log(`🗺️ Торговых путей загружено: ${tradeRoutes.length}`);

            // Пытаемся подтянуть общие из репозитория
            setTimeout(autoLoadTradeRoutesFromFile, 500);
        }
    }, 700);
});

console.log('✅ map_trade_routes.js загружен');