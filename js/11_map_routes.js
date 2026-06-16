// ============================================================================
// МОДУЛЬ 11: map_routes.js
// Функции для работы с маршрутами (рисование, сохранение, загрузка, редактирование)
// ВЕРСИЯ 4.0 – ПОЛНОСТЬЮ ОЧИЩЕНА ОТ ЗОН ЗАМЕДЛЕНИЯ, ДОБАВЛЕНЫ ПРОВЕРКИ
// ============================================================================

// Геометрические функции берём из 03_helpers.js (distanceBetween, totalDistance, totalTurnsBasic)
// Если они не определены – объявляем локально
if (typeof distanceBetween === 'undefined') {
    function distanceBetween(p1, p2) {
        const kmPerPixel = (typeof KM_PER_PIXEL !== 'undefined') ? KM_PER_PIXEL : 1;
        const dx = (p1.lng - p2.lng) * kmPerPixel;
        const dy = (p1.lat - p2.lat) * kmPerPixel;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
if (typeof totalTurnsBasic === 'undefined') {
    function totalTurnsBasic(points, segments) {
        let total = 0;
        const speeds = (typeof SPEEDS !== 'undefined') ? SPEEDS : { land: 210, dirt: 140, naval: 400, wyvern: 700, orlan: 800 };
        for (let i = 0; i < points.length - 1; i++) {
            const dist = distanceBetween(points[i], points[i+1]);
            const speed = speeds[segments[i]] || speeds.land;
            total += dist / speed;
        }
        return total;
    }
}

// ========== 1. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

function createSegmentLine(p1, p2, type, isDashed = false) {
    const pts = [p1, p2];
    const outline = L.polyline(pts, { color: '#333333', weight: 6, opacity: 0.9 });
    const routeColors = (typeof ROUTE_COLORS !== 'undefined') ? ROUTE_COLORS : { land: '#ffcc44', dirt: '#cc6633', naval: '#44aaff', wyvern: '#dd88ff', orlan: '#ff4444' };
    const main = L.polyline(pts, {
        color: routeColors[type] || '#ffcc44',
        weight: 4,
        opacity: 0.9,
        dashArray: isDashed ? '8,8' : null
    });
    return L.layerGroup([outline, main]);
}

function addSegment(type) {
    if (typeof map === 'undefined' || !map) return;
    if (tempPoints.length < 2) return;
    const i = tempPoints.length - 1;
    const line = createSegmentLine(tempPoints[i - 1], tempPoints[i], type, true);
    line.addTo(map);
    tempLines.push(line);
    tempSegments.push(type);
    updateRouteInfo();
}

function showTypeSelector(latLng, event) {
    const modal = document.createElement('div');
    let x = event ? event.clientX : window.innerWidth / 2;
    let y = event ? event.clientY : window.innerHeight / 2;
    const modalWidth = 200, modalHeight = 250;
    if (x + modalWidth > window.innerWidth) x = window.innerWidth - modalWidth - 10;
    if (y + modalHeight > window.innerHeight) y = window.innerHeight - modalHeight - 10;
    if (x < 10) x = 10;
    if (y < 10) y = 10;
    modal.style.cssText = `position:fixed; left:${x}px; top:${y}px; display:flex; flex-direction:column; gap:5px; background:#1f1c14; border:2px solid #b87c4f; border-radius:20px; padding:10px; z-index:2000; min-width:180px;`;
    const types = [
        { value: 'land', label: '🚶 Сухопутный (210 км/ход)' },
        { value: 'dirt', label: '🟫 Грунтовая (140 км/ход)' },
        { value: 'naval', label: '⛵ Морской (400 км/ход)' },
        { value: 'wyvern', label: '🐉 Виверны (700 км/ход)' },
        { value: 'orlan', label: '🦅 Орланы (800 км/ход)' }
    ];
    types.forEach(t => {
        const btn = document.createElement('button');
        btn.textContent = t.label;
        btn.style.margin = '2px 0';
        btn.onclick = () => { addSegment(t.value); modal.remove(); updateRouteInfo(); };
        modal.appendChild(btn);
    });
    const cancel = document.createElement('button');
    cancel.textContent = '❌ Отменить точку';
    cancel.style.background = '#7a2a2a';
    cancel.onclick = () => {
        const last = tempMarkers.pop();
        if (last && map) map.removeLayer(last);
        tempPoints.pop();
        modal.remove();
        updateRouteInfo();
    };
    modal.appendChild(cancel);
    document.body.appendChild(modal);
    window.typeModal = modal;
}

function addTempRoutePoint(latLng, ev) {
    if (typeof map === 'undefined' || !map) return;
    const marker = L.circleMarker(latLng, { radius: 6, color: '#ff3333', weight: 2, fillColor: '#ffaa33', fillOpacity: 1 }).addTo(map);
    tempMarkers.push(marker);
    if (tempPoints.length === 0) {
        tempPoints.push(latLng);
        updateRouteInfo();
        return;
    }
    tempPoints.push(latLng);
    addSegment(currentRouteType);
}

function addTempRulerPoint(latLng) {
    if (typeof map === 'undefined' || !map) return;
    const marker = L.circleMarker(latLng, { radius: 6, color: '#333333', weight: 2, fillColor: (typeof ROUTE_COLORS !== 'undefined' && ROUTE_COLORS[currentRouteType]) ? ROUTE_COLORS[currentRouteType] : '#ffcc44', fillOpacity: 1 }).addTo(map);
    tempMarkers.push(marker);
    if (tempPoints.length === 0) {
        tempPoints.push(latLng);
        updateRouteInfo();
        return;
    }
    tempPoints.push(latLng);
    const p1 = tempPoints[tempPoints.length - 2];
    const line = createSegmentLine(p1, latLng, currentRouteType, true);
    line.addTo(map);
    tempLines.push(line);
    updateRouteInfo();
}

function clearTemp() {
    if (typeof map === 'undefined' || !map) return;
    tempLines.forEach(line => map.removeLayer(line));
    tempMarkers.forEach(marker => map.removeLayer(marker));
    tempPoints = [];
    tempSegments = [];
    tempLines = [];
    tempMarkers = [];
    if (window.typeModal) window.typeModal.remove();
    updateRouteInfo();
}

function undoLastPoint() {
    if (typeof map === 'undefined' || !map) return;
    if (tempPoints.length === 0) return;
    const lastMarker = tempMarkers.pop();
    if (lastMarker) map.removeLayer(lastMarker);
    tempPoints.pop();
    const lastLine = tempLines.pop();
    if (lastLine) map.removeLayer(lastLine);
    tempSegments.pop();
    updateRouteInfo();
}

function updateRouteInfo() {
    const info = document.getElementById('routeInfo');
    if (!info) return;
    if (tempPoints.length < 2) {
        info.style.display = 'none';
        return;
    }
    const dist = totalDistance(tempPoints);
    let turns;
    if (currentMode === 'ruler') {
        const segs = new Array(tempPoints.length - 1).fill(currentRouteType);
        turns = totalTurnsBasic(tempPoints, segs);
    } else {
        if (tempSegments.length !== tempPoints.length - 1) {
            info.style.display = 'none';
            return;
        }
        turns = totalTurnsBasic(tempPoints, tempSegments);
    }
    const fmtDist = (typeof fmtDistance === 'function') ? fmtDistance(dist) : dist.toFixed(0) + ' км';
    const fmtTrn = (typeof fmtTurns === 'function') ? fmtTurns(turns) : turns.toFixed(1) + ' ходов';
    info.innerHTML = `📏 ${currentMode === 'ruler' ? 'Линейка' : 'Маршрут'}: ${fmtDist} (≈ ${fmtTrn})`;
    info.style.display = 'inline-flex';
}

// ========== 2. СОХРАНЕНИЕ МАРШРУТОВ ==========

function saveCurrentRoute() {
    if (currentMode !== 'route') { alert("Только в режиме Маршрут"); return; }
    if (tempPoints.length < 2) { alert("Постройте маршрут."); return; }
    if (tempSegments.length !== tempPoints.length - 1) { alert("Не все отрезки имеют тип."); return; }
    const name = prompt("Название маршрута:", `Маршрут ${savedRoutes.length + 1}`);
    if (!name) return;
    const turns = totalTurnsBasic(tempPoints, tempSegments);
    let fromSettlementId = null, toSettlementId = null, fromSettlementName = null, toSettlementName = null;
    const firstPoint = tempPoints[0], lastPoint = tempPoints[tempPoints.length - 1];
    if (typeof SETTLEMENTS_DB !== 'undefined') {
        for (let id in SETTLEMENTS_DB) {
            const s = SETTLEMENTS_DB[id];
            const coords = toLeafletCoords(s.px, s.py);
            const distFirst = Math.hypot(firstPoint.lat - coords[0], firstPoint.lng - coords[1]);
            const distLast = Math.hypot(lastPoint.lat - coords[0], lastPoint.lng - coords[1]);
            if (distFirst < 20) { fromSettlementId = id; fromSettlementName = s.name; }
            if (distLast < 20) { toSettlementId = id; toSettlementName = s.name; }
        }
    }
    const waypointIds = [];
    for (let i = 1; i < tempPoints.length - 1; i++) {
        const point = tempPoints[i];
        if (typeof SETTLEMENTS_DB !== 'undefined') {
            for (let id in SETTLEMENTS_DB) {
                const s = SETTLEMENTS_DB[id];
                const coords = toLeafletCoords(s.px, s.py);
                const dist = Math.hypot(point.lat - coords[0], point.lng - coords[1]);
                if (dist < 20 && !waypointIds.includes(id)) waypointIds.push(id);
            }
        }
    }
    const newRoute = {
        id: Date.now(),
        name: name,
        points: tempPoints.map(p => ({ lat: p.lat, lng: p.lng })),
        segments: [...tempSegments],
        totalDistance: totalDistance(tempPoints),
        totalTurns: turns,
        visible: true,
        fromSettlementId,
        toSettlementId,
        waypointIds
    };
    savedRoutes.push(newRoute);
    saveRoutes();
    renderRoutes();
    redrawRoutes();
    clearTemp();
    if (fromSettlementId && toSettlementId) alert(`✅ Маршрут "${name}" сохранён!\n${fromSettlementName} → ${toSettlementName}\nВремя в пути: ${turns.toFixed(1)} ходов`);
    else alert(`✅ Маршрут "${name}" сохранён (без привязки к городам)`);
}

function saveRoutes() {
    localStorage.setItem('diplomacyRoutes', JSON.stringify(savedRoutes));
    if (typeof GameState !== 'undefined') GameState.setRoutes(savedRoutes);
}

function loadRoutes() {
    const stored = localStorage.getItem('diplomacyRoutes');
    savedRoutes = stored ? JSON.parse(stored) : [];
    for (let r of savedRoutes) {
        if (!r.points) continue;
        if (!r.segments || r.segments.length !== r.points.length - 1) {
            r.segments = new Array(r.points.length - 1).fill('land');
        }
        r.totalDistance = totalDistance(r.points);
        r.totalTurns = totalTurnsBasic(r.points, r.segments);
        if (r.visible === undefined) r.visible = true;
    }
    renderRoutes();
    if (map && map._container) redrawRoutes();
    else console.log("loadRoutes: карта не готова");
}

// ========== 3. ОТОБРАЖЕНИЕ СПИСКА МАРШРУТОВ ==========

function renderRoutes() {
    const container = document.getElementById('routesList');
    if (!container) return;
    if (savedRoutes.length === 0) { container.innerHTML = '<em>Нет маршрутов</em>'; return; }
    container.innerHTML = '';
    for (let r of savedRoutes) {
        const uniq = new Set(r.segments);
        let typeLabel = 'Комбинированный';
        if (uniq.size === 1) {
            if (r.segments[0] === 'dirt') typeLabel = 'Грунтовая';
            else if (r.segments[0] === 'naval') typeLabel = 'Морской';
            else if (r.segments[0] === 'wyvern') typeLabel = 'Виверны';
            else if (r.segments[0] === 'orlan') typeLabel = 'Орланы';
            else typeLabel = 'Сухопутный';
        }
        const arrivalWeeks = Math.ceil(r.totalTurns);
        let arrivalText = `+${arrivalWeeks} ходов`;
        const div = document.createElement('div');
        div.className = 'route-item' + (activeRouteId === String(r.id) ? ' active-route' : '');
        div.style.borderLeftColor = (typeof ROUTE_COLORS !== 'undefined' && ROUTE_COLORS[r.segments[0]]) ? ROUTE_COLORS[r.segments[0]] : '#ffcc44';
        div.innerHTML = `
            <div class="route-header" style="display: flex; justify-content: space-between; align-items: center;">
                <input type="checkbox" class="route-check" data-id="${r.id}" ${r.visible ? 'checked' : ''} title="Показать на карте">
                <span class="route-name">${escapeHtml(r.name)}</span>
                <div class="route-actions">
                    <button class="edit-route" data-id="${r.id}" title="Редактировать">✏️</button>
                    <button class="del-route" data-id="${r.id}" style="background:#7a2a2a;">🗑️</button>
                </div>
            </div>
            <div style="font-size:10px;">${typeLabel} | ${(typeof fmtDistance === 'function') ? fmtDistance(r.totalDistance) : r.totalDistance.toFixed(0) + ' км'} / ${(typeof fmtTurns === 'function') ? fmtTurns(r.totalTurns) : r.totalTurns.toFixed(1) + ' ходов'}<br>📅 Прибытие: ${arrivalText}</div>
        `;
        container.appendChild(div);
    }
    
    document.querySelectorAll('.route-check').forEach(cb => {
        cb.removeEventListener('change', window._routeCheckHandler);
        window._routeCheckHandler = (e) => {
            const id = cb.getAttribute('data-id');
            const route = savedRoutes.find(r => String(r.id) === String(id));
            if (route) { route.visible = cb.checked; saveRoutes(); redrawRoutes(); }
        };
        cb.addEventListener('change', window._routeCheckHandler);
    });
    document.querySelectorAll('.del-route').forEach(btn => {
        btn.removeEventListener('click', window._delRouteHandler);
        window._delRouteHandler = (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            savedRoutes = savedRoutes.filter(r => String(r.id) !== String(id));
            if (activeRouteId && String(activeRouteId) === String(id)) activeRouteId = null;
            saveRoutes(); renderRoutes(); redrawRoutes();
        };
        btn.addEventListener('click', window._delRouteHandler);
    });
    document.querySelectorAll('.edit-route').forEach(btn => {
        btn.removeEventListener('click', window._editRouteHandler);
        window._editRouteHandler = (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            editRoute(id);
        };
        btn.addEventListener('click', window._editRouteHandler);
    });
    document.querySelectorAll('.route-item').forEach(item => {
        item.removeEventListener('click', window._selectRouteHandler);
        window._selectRouteHandler = (e) => {
            if (e.target.classList.contains('route-check') || e.target.classList.contains('del-route') || e.target.classList.contains('edit-route')) return;
            const cb = item.querySelector('.route-check');
            if (cb) {
                const id = cb.getAttribute('data-id');
                activeRouteId = (activeRouteId === id) ? null : id;
                renderRoutes(); redrawRoutes();
            }
        };
        item.addEventListener('click', window._selectRouteHandler);
    });
}

function editRoute(routeId) {
    const route = savedRoutes.find(r => String(r.id) === String(routeId));
    if (!route) return;
    savedRoutes = savedRoutes.filter(r => String(r.id) !== String(routeId));
    saveRoutes();
    redrawRoutes();
    clearTemp();
    for (let i = 0; i < route.points.length; i++) {
        const latLng = L.latLng(route.points[i].lat, route.points[i].lng);
        tempPoints.push(latLng);
        const marker = L.circleMarker(latLng, { radius: 6, color: '#ff3333', weight: 2, fillColor: '#ffaa33', fillOpacity: 1 }).addTo(map);
        tempMarkers.push(marker);
        if (i > 0) {
            const segType = route.segments[i - 1];
            tempSegments.push(segType);
            const line = createSegmentLine(tempPoints[i - 1], latLng, segType, true);
            line.addTo(map);
            tempLines.push(line);
        }
    }
    if (currentMode !== 'route') setMode('route');
    alert(`Редактирование маршрута "${route.name}". Добавляйте/удаляйте точки. После завершения нажмите «Сохранить».`);
}

// ========== 4. ОТРИСОВКА МАРШРУТОВ НА КАРТЕ ==========

function redrawRoutes() {
    if (!map || !map._container) { console.warn("redrawRoutes: карта не готова"); return; }
    for (let id in visibleOverlays) if (map.hasLayer(visibleOverlays[id])) map.removeLayer(visibleOverlays[id]);
    visibleOverlays = {};
    for (let r of savedRoutes) {
        if (r.visible && r.points && r.points.length >= 2) {
            const group = drawRoute(r, activeRouteId === String(r.id));
            visibleOverlays[r.id] = group;
            group.addTo(map);
        }
    }
}

function drawRoute(route, isActive = false) {
    const group = L.layerGroup();
    const outlineColor = isActive ? '#ffcc00' : '#333333';
    let cumulativeDist = [0], cumulativeTurns = [0];
    const speeds = (typeof SPEEDS !== 'undefined') ? SPEEDS : { land: 210, dirt: 140, naval: 400, wyvern: 700, orlan: 800 };
    const routeColors = (typeof ROUTE_COLORS !== 'undefined') ? ROUTE_COLORS : { land: '#ffcc44', dirt: '#cc6633', naval: '#44aaff', wyvern: '#dd88ff', orlan: '#ff4444' };
    for (let i = 0; i < route.points.length - 1; i++) {
        const segDist = distanceBetween(route.points[i], route.points[i + 1]);
        cumulativeDist.push(cumulativeDist[cumulativeDist.length - 1] + segDist);
        const segSpeed = speeds[route.segments[i]] || speeds.land;
        cumulativeTurns.push(cumulativeTurns[cumulativeTurns.length - 1] + segDist / segSpeed);
    }
    for (let i = 0; i < route.points.length - 1; i++) {
        const p1 = L.latLng(route.points[i].lat, route.points[i].lng);
        const p2 = L.latLng(route.points[i + 1].lat, route.points[i + 1].lng);
        const segType = route.segments[i];
        const outline = L.polyline([p1, p2], { color: outlineColor, weight: isActive ? 8 : 6, opacity: 0.9 });
        const main = L.polyline([p1, p2], {
            color: isActive ? '#ffffff' : (routeColors[segType] || '#ffcc44'),
            weight: isActive ? 5 : 4,
            opacity: 0.9,
            dashArray: isActive ? null : '8,8'
        });
        const startDist = cumulativeDist[i];
        const startTurns = cumulativeTurns[i];
        main.on('mouseover', function(e) {
            const mouse = e.latlng;
            const abx = p2.lng - p1.lng, aby = p2.lat - p1.lat;
            let t = ((mouse.lng - p1.lng) * abx + (mouse.lat - p1.lat) * aby) / (abx * abx + aby * aby);
            t = Math.max(0, Math.min(1, t));
            const distOnSeg = Math.hypot((p1.lng + abx * t) - p1.lng, (p1.lat + aby * t) - p1.lat);
            const distFromStart = startDist + distOnSeg;
            const turnsFromStart = startTurns + (distOnSeg / (speeds[segType] || speeds.land));
            const fmtDist = (typeof fmtDistance === 'function') ? fmtDistance(distFromStart) : distFromStart.toFixed(0) + ' км';
            const fmtTurns = (typeof fmtTurns === 'function') ? fmtTurns(turnsFromStart) : turnsFromStart.toFixed(1) + ' ходов';
            main.bindTooltip(`<b>${escapeHtml(route.name)}</b><br>📏 Всего: ${(typeof fmtDistance === 'function') ? fmtDistance(route.totalDistance) : route.totalDistance.toFixed(0) + ' км'} (${(typeof fmtTurns === 'function') ? fmtTurns(route.totalTurns) : route.totalTurns.toFixed(1) + ' ходов'})<br>📍 От старта: ${fmtDist} (${fmtTurns})`, { sticky: true, direction: 'top' }).openTooltip();
        });
        main.on('mouseout', function() { main.closeTooltip(); });
        group.addLayer(outline);
        group.addLayer(main);
    }
    return group;
}

// ========== 5. ЭКСПОРТ/ИМПОРТ МАРШРУТОВ ==========

function exportAllRoutes() {
    downloadJSON(JSON.stringify({ exportDate: new Date().toISOString(), routes: savedRoutes }, null, 2), `routes_${new Date().toISOString().slice(0, 19)}.json`);
}
function exportSelectedRoutes() {
    const selected = savedRoutes.filter(r => r.visible === true);
    if (selected.length === 0) { alert("Нет видимых маршрутов"); return; }
    downloadJSON(JSON.stringify({ exportDate: new Date().toISOString(), routes: selected }, null, 2), `selected_routes_${new Date().toISOString().slice(0, 19)}.json`);
}
function downloadJSON(content, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
}
function importRoutes(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            let routesToAdd = imported.routes || imported;
            if (Array.isArray(routesToAdd)) {
                for (let r of routesToAdd) {
                    if (r.visible === undefined) r.visible = true;
                    if (!r.segments || !r.points) continue;
                    if (r.segments.length !== r.points.length - 1) r.segments = new Array(r.points.length - 1).fill('land');
                    r.totalDistance = totalDistance(r.points);
                    r.totalTurns = totalTurnsBasic(r.points, r.segments);
                    r.id = Date.now() + '-' + Math.random();
                    savedRoutes.push(r);
                }
                saveRoutes(); renderRoutes(); redrawRoutes();
                alert(`Импортировано ${routesToAdd.length} маршрутов.`);
            } else alert("Неверный формат.");
        } catch (err) { alert("Ошибка импорта: " + err.message); }
    };
    reader.readAsText(file);
}
function updateAllRoutes() {
    for (let r of savedRoutes) r.totalTurns = totalTurnsBasic(r.points, r.segments);
    saveRoutes(); renderRoutes(); redrawRoutes();
}

// ========== 6. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ВНЕШНИХ ВЫЗОВОВ ==========
function selectAllVisible() {
    savedRoutes.forEach(r => r.visible = true);
    saveRoutes(); renderRoutes(); redrawRoutes();
}
function deselectAllVisible() {
    savedRoutes.forEach(r => r.visible = false);
    saveRoutes(); renderRoutes(); redrawRoutes();
}

// Экспортируем важные функции в глобальную область
window.saveRoutes = saveRoutes;
window.loadRoutes = loadRoutes;
window.renderRoutes = renderRoutes;
window.redrawRoutes = redrawRoutes;
window.exportAllRoutes = exportAllRoutes;
window.exportSelectedRoutes = exportSelectedRoutes;
window.importRoutes = importRoutes;
window.selectAllVisible = selectAllVisible;
window.deselectAllVisible = deselectAllVisible;
window.editRoute = editRoute;
window.addTempRoutePoint = addTempRoutePoint;
window.addTempRulerPoint = addTempRulerPoint;
window.clearTemp = clearTemp;
window.undoLastPoint = undoLastPoint;
window.updateRouteInfo = updateRouteInfo;
window.saveCurrentRoute = saveCurrentRoute;

console.log("✅ 11_map_routes.js загружен — версия 4.0 (без зон замедления)");