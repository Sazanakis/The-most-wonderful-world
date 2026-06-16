// ============================================================================
// МОДУЛЬ 11: map.js
// Функции для работы с глобальной картой (Leaflet, города, маски)
// ВЕРСИЯ 4.0 – ИСПРАВЛЕНА ИНИЦИАЛИЗАЦИЯ, ДОБАВЛЕНА ЗАЩИТА ОТ ОШИБОК
// ============================================================================

// ========== 1. ПРОВЕРКА КАРТЫ ПЕРЕД ИСПОЛЬЗОВАНИЕМ ==========
function isMapReady() {
    if (!map) {
        console.warn("⚠️ Карта ещё не инициализирована");
        return false;
    }
    return true;
}

// ========== 2. ИНИЦИАЛИЗАЦИЯ КАРТЫ ==========
function initMap() {
    console.log("🔧 initMap() вызвана");
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error("❌ Элемент #map не найден в DOM");
        return;
    }
    
    map = L.map('map', {
        crs: L.CRS.Simple,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true,
        doubleClickZoom: false,
        boxZoom: false,
        touchZoom: true,
        dragging: true
    });
    
    const bounds = [[0, 0], [MAP_HEIGHT, MAP_WIDTH]];
    const bgLayer = (typeof BG_LAYER !== 'undefined') ? BG_LAYER : 'images/Karta_countries.png';
    currentOverlay = L.imageOverlay(bgLayer, bounds, { opacity: 1 }).addTo(map);
    map.fitBounds(bounds);
    
    const zoom = map.getZoom();
    map.setMinZoom(zoom);
    map.setMaxZoom(zoom + 2);
    
    map.on('click', (e) => {
        if (currentMode === 'route') {
            if (typeof addTempRoutePoint === 'function') addTempRoutePoint(e.latlng, e.originalEvent);
        } else if (currentMode === 'ruler') {
            if (typeof addTempRulerPoint === 'function') addTempRulerPoint(e.latlng);
        }
    });
    
    map.on('dblclick', () => {
        if (typeof clearTemp === 'function') clearTemp();
    });
    
    window.addEventListener('resize', () => {
        if (map && typeof map.invalidateSize === 'function') {
            setTimeout(() => map.invalidateSize(), 100);
        }
    });
    
    console.log("✅ Карта инициализирована");
}

// ========== 3. ОБНОВЛЕНИЕ КАРТЫ ПРИ ПЕРЕКЛЮЧЕНИИ ВКЛАДКИ ==========
function refreshMap() {
    if (!map) {
        console.warn("refreshMap: карта не инициализирована");
        return;
    }
    setTimeout(() => {
        if (map && typeof map.invalidateSize === 'function') {
            map.invalidateSize();
            console.log("🗺️ Карта обновлена (invalidateSize)");
        }
    }, 100);
}

// ========== 4. ГОРОДА (МАРКЕРЫ) ==========
function addCityMarkers() {
    if (!isMapReady()) return;
    
    cityMarkers.forEach(m => {
        if (map.hasLayer(m)) map.removeLayer(m);
    });
    cityMarkers = [];
    
    const citiesData = window.citiesData || [];
    
    for (let city of citiesData) {
        if (currentFactionFilter !== "all" && city.faction !== currentFactionFilter) continue;
        
        const coords = toLeafletCoords(city.px, city.py);
        
        let iconPath = city.icon;
        if (iconPath && typeof getUnitIconPath === 'function') {
            iconPath = getUnitIconPath(iconPath);
        } else if (iconPath && !iconPath.startsWith('icons/') && !iconPath.startsWith('http')) {
            iconPath = 'icons/' + iconPath;
        }
        
        const customIcon = L.divIcon({
            html: `<img src="${iconPath}" style="width: 32px; height: auto;" onerror="this.style.display='none'">`,
            className: 'city-marker',
            iconSize: [32, 32],
            popupAnchor: [0, -16]
        });
        
        const marker = L.marker(coords, { icon: customIcon });
        
        marker.bindTooltip(`${city.name} (${city.type === 'city' ? 'Город' : (city.type === 'castle' ? 'Замок' : 'Деревня')})`, {
            sticky: true,
            direction: 'top',
            className: 'city-tooltip'
        });
        
        marker.on('click', () => {
            openSettlementModal(city.settlementId);
        });
        
        marker.addTo(map);
        cityMarkers.push(marker);
    }
    
    updateCitiesVisibility();
}

function updateCitiesVisibility() {
    if (!isMapReady()) return;
    cityMarkers.forEach(marker => {
        if (showCitiesFlag) {
            if (!map.hasLayer(marker)) marker.addTo(map);
        } else {
            if (map.hasLayer(marker)) map.removeLayer(marker);
        }
    });
}

// ========== 5. РЕЖИМЫ ==========
function setMode(m) {
    if (currentMode === m) {
        currentMode = null;
        const routeBtn = document.getElementById('routeModeBtn');
        const rulerBtn = document.getElementById('rulerModeBtn');
        if (routeBtn) routeBtn.classList.remove('active');
        if (rulerBtn) rulerBtn.classList.remove('active');
        if (typeof clearTemp === 'function') clearTemp();
    } else {
        currentMode = m;
        const routeBtn = document.getElementById('routeModeBtn');
        const rulerBtn = document.getElementById('rulerModeBtn');
        if (routeBtn) routeBtn.classList.toggle('active', m === 'route');
        if (rulerBtn) rulerBtn.classList.toggle('active', m === 'ruler');
        if (typeof clearTemp === 'function') clearTemp();
    }
    if (typeof updateRouteInfo === 'function') updateRouteInfo();
}

// ========== 6. МАСКИ ==========
function clearMasks() {
    if (typeof currentActiveMasks !== 'undefined') {
        currentActiveMasks.forEach(mask => { if (map && map.hasLayer(mask)) map.removeLayer(mask); });
        currentActiveMasks = [];
    }
}

function showRhetoricMasks(rhetoricId = "all") {
    clearMasks();
    if (typeof window.rhetoricMasks === 'undefined') return;
    const bounds = [[0, 0], [MAP_HEIGHT, MAP_WIDTH]];
    
    for (let mask of window.rhetoricMasks) {
        if (rhetoricId !== "all" && mask.rhetoricId !== rhetoricId) continue;
        if (!mask.visible) continue;
        
        const overlay = L.imageOverlay(mask.image, bounds, { opacity: mask.opacity || 0.6 });
        overlay.addTo(map);
        if (typeof currentActiveMasks !== 'undefined') currentActiveMasks.push(overlay);
    }
}

function showHoldingsMask(factionId = "all") {
    clearMasks();
    if (typeof window.holdingsMasks === 'undefined') return;
    const bounds = [[0, 0], [MAP_HEIGHT, MAP_WIDTH]];
    for (let holding of window.holdingsMasks) {
        if (factionId !== "all" && holding.factionId !== factionId) continue;
        if (!holding.visible) continue;
        const overlay = L.imageOverlay(holding.image, bounds, { opacity: holding.opacity || 0.6 });
        overlay.addTo(map);
        if (typeof currentActiveMasks !== 'undefined') currentActiveMasks.push(overlay);
    }
}

function showVassalsMask(factionId, showMain = true, showVassals = true) {
    clearMasks();
    if (typeof window.vassalsMasks === 'undefined') return;
    const bounds = [[0, 0], [MAP_HEIGHT, MAP_WIDTH]];
    
    if (factionId === "all") {
        for (let fid in window.vassalsMasks) {
            const factionVassals = window.vassalsMasks[fid];
            if (!factionVassals) continue;
            if (showMain && factionVassals.main) {
                const overlay = L.imageOverlay(factionVassals.main.image, bounds, { opacity: 0.6 });
                overlay.addTo(map);
                if (typeof currentActiveMasks !== 'undefined') currentActiveMasks.push(overlay);
            }
            if (showVassals && factionVassals.vassals) {
                for (let vassal of factionVassals.vassals) {
                    const overlay = L.imageOverlay(vassal.image, bounds, { opacity: 0.6 });
                    overlay.addTo(map);
                    if (typeof currentActiveMasks !== 'undefined') currentActiveMasks.push(overlay);
                }
            }
        }
        return;
    }
    
    const factionVassals = window.vassalsMasks[factionId];
    if (!factionVassals) return;
    if (showMain && factionVassals.main) {
        const overlay = L.imageOverlay(factionVassals.main.image, bounds, { opacity: 0.6 });
        overlay.addTo(map);
        if (typeof currentActiveMasks !== 'undefined') currentActiveMasks.push(overlay);
    }
    if (showVassals && factionVassals.vassals) {
        for (let vassal of factionVassals.vassals) {
            const overlay = L.imageOverlay(vassal.image, bounds, { opacity: 0.6 });
            overlay.addTo(map);
            if (typeof currentActiveMasks !== 'undefined') currentActiveMasks.push(overlay);
        }
    }
}

function buildRhetoricChecklist() {
    const container = document.getElementById('rhetoricChecklist');
    if (!container) return;
    container.innerHTML = '';
    if (typeof window.rhetoricMasks === 'undefined') return;
    
    for (let m of window.rhetoricMasks) {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        div.style.cssText = 'display: flex; align-items: center; gap: 8px; margin: 6px 0;';
        
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.id = `chk_rh_${m.name.replace(/\s/g, '_')}`;
        cb.checked = m.visible;
        cb.addEventListener('change', (e) => {
            m.visible = e.target.checked;
            if (activeTab === 'rhetoric') {
                showRhetoricMasks('all');
            }
        });
        
        const label = document.createElement('label');
        label.htmlFor = cb.id;
        label.textContent = m.name;
        label.style.cssText = 'cursor: pointer;';
        
        div.appendChild(cb);
        div.appendChild(label);
        container.appendChild(div);
    }
    
    let infoDiv = document.getElementById('rhetoricInfo');
    if (!infoDiv) {
        infoDiv = document.createElement('div');
        infoDiv.id = 'rhetoricInfo';
        infoDiv.style.cssText = 'font-size: 0.7rem; color: #8a7a5a; margin-top: 10px; text-align: center; border-top: 1px solid #b87c4f; padding-top: 8px;';
        container.appendChild(infoDiv);
    }
    
    function updateRhetoricInfo() {
        const visibleMasks = window.rhetoricMasks.filter(m => m.visible);
        if (visibleMasks.length === 0) {
            infoDiv.innerHTML = '⚠️ Нет активных масок';
        } else if (visibleMasks.length === 1) {
            infoDiv.innerHTML = `🖼️ Активна: ${visibleMasks[0].name}`;
        } else {
            infoDiv.innerHTML = `🖼️ Активны ${visibleMasks.length} масок`;
        }
    }
    updateRhetoricInfo();
    window.updateRhetoricInfo = updateRhetoricInfo;
}

function buildHoldingsChecklist() {
    const container = document.getElementById('holdingsChecklist');
    if (!container) return;
    container.innerHTML = '';
    if (typeof window.holdingsMasks === 'undefined') return;
    
    for (let m of window.holdingsMasks) {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.id = `chk_hold_${m.name.replace(/\s/g, '_')}`;
        cb.checked = m.visible;
        cb.addEventListener('change', (e) => {
            m.visible = e.target.checked;
            if (activeTab === 'holdings') {
                showHoldingsMask('all');
            }
        });
        const label = document.createElement('label');
        label.htmlFor = cb.id;
        label.textContent = m.name;
        div.appendChild(cb);
        div.appendChild(label);
        container.appendChild(div);
    }
}

function updateVassalChecklist() {
    const container = document.getElementById('vassalsChecklist');
    if (!container) return;
    const selectedFaction = document.getElementById('vassalFactionSelect')?.value || "clan_daketa";
    if (typeof window.vassalsMasks === 'undefined' || !window.vassalsMasks[selectedFaction]) {
        container.innerHTML = '<div>Нет данных о вассалах</div>';
        return;
    }
    const factionVassals = window.vassalsMasks[selectedFaction];
    let html = `<div class="checkbox-item"><input type="checkbox" id="vassal_show_main" checked><label for="vassal_show_main">🏯 ${factionVassals.main.name} (главный род)</label></div>`;
    for (let vassal of factionVassals.vassals) {
        const safeId = vassal.name.replace(/\s/g, '_').replace(/[()]/g, '');
        html += `<div class="checkbox-item"><input type="checkbox" id="vassal_${safeId}" class="vassal-checkbox" checked><label for="vassal_${safeId}">🛡️ ${vassal.name}</label></div>`;
    }
    container.innerHTML = html;
    const showMainCheckbox = document.getElementById('vassal_show_main');
    if (showMainCheckbox) showMainCheckbox.addEventListener('change', (e) => showVassalsMask(selectedFaction, e.target.checked, true));
    document.querySelectorAll('.vassal-checkbox').forEach(cb => cb.addEventListener('change', () => showVassalsMask(selectedFaction, true, true)));
}

// ========== 7. МОДАЛЬНОЕ ОКНО ПОСЕЛЕНИЯ ==========
function openSettlementModal(settlementId) {
    if (typeof SETTLEMENTS_DB === 'undefined') {
        addGlobalLog(`❌ База поселений не загружена`, 'map');
        return;
    }
    const settlement = SETTLEMENTS_DB[settlementId];
    if (!settlement) {
        addGlobalLog(`❌ Поселение с ID "${settlementId}" не найдено`, 'map');
        return;
    }
    
    let factionName = "Нейтральная территория";
    let factionId = settlement.faction;
    if (factionId && typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[factionId]) {
        factionName = FACTION_NAMES[factionId];
    } else {
        const provinceFaction = (typeof PROVINCE_TO_FACTION !== 'undefined') ? PROVINCE_TO_FACTION[settlement.province] : null;
        if (provinceFaction && typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[provinceFaction]) {
            factionName = FACTION_NAMES[provinceFaction];
            factionId = provinceFaction;
        }
    }
    
    const rhetoricName = (typeof RHETORIC_NAMES !== 'undefined' && RHETORIC_NAMES[settlement.rhetoric]) ? RHETORIC_NAMES[settlement.rhetoric] : settlement.rhetoric;
    const provinceName = (typeof PROVINCE_NAMES !== 'undefined' && PROVINCE_NAMES[settlement.province]) ? PROVINCE_NAMES[settlement.province] : settlement.province;
    const typeName = settlement.type === 'city' ? 'Город' : (settlement.type === 'castle' ? 'Замок' : 'Деревня');
    
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10000;display:flex;justify-content:center;align-items:center';
    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:500px;width:90%;">
            <h3 style="color:#ffd966;margin-top:0;">🏘️ ${settlement.name}</h3>
            <div style="margin:15px 0;">
                <div><strong>Тип:</strong> ${typeName}</div>
                <div><strong>Провинция:</strong> ${provinceName}</div>
                <div><strong>Фракция:</strong> ${factionName}</div>
                <div><strong>Риторика:</strong> ${rhetoricName}</div>
                ${settlement.isVassal ? `<div><strong>Вассал:</strong> <span style="color:#ffd966;cursor:pointer;" onclick="openVassalModalByHouseId('${settlement.vassalHouse}')">${settlement.vassalHouse}</span></div>` : ''}
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;">
                <button id="startRouteBtn" style="background:#3a5a2a;">🚏 Начать маршрут отсюда</button>
                <button id="addToRouteBtn" style="background:#3a5a2a;">➕ Добавить в маршрут</button>
                <button id="endRouteBtn" style="background:#3a5a2a;">🏁 Закончить маршрут здесь</button>
                <button id="closeSettlementBtn" style="background:#7a2a2a;">Закрыть</button>
            </div>
        </div>
    `;
    
    // ==== Исправление для полноэкранного режима ====
    let targetContainer = document.body;
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
    if (fullscreenElement && fullscreenElement.classList && fullscreenElement.classList.contains('map-container')) {
        targetContainer = fullscreenElement;
    }
    targetContainer.appendChild(modal);
    // ==== Конец исправления ====
    
    const settlementCoords = toLeafletCoords(settlement.px, settlement.py);
    const latLng = L.latLng(settlementCoords[0], settlementCoords[1]);
    
    const startRouteBtn = document.getElementById('startRouteBtn');
    if (startRouteBtn) {
        startRouteBtn.onclick = () => {
            if (currentMode !== 'route') setMode('route');
            if (typeof clearTemp === 'function') clearTemp();
            if (typeof addTempRoutePoint === 'function') {
                tempPoints.push(latLng);
                const marker = L.circleMarker(latLng, { radius: 6, color: '#ff3333', weight: 2, fillColor: '#ffaa33', fillOpacity: 1 }).addTo(map);
                tempMarkers.push(marker);
                if (typeof updateRouteInfo === 'function') updateRouteInfo();
                addGlobalLog(`🚏 Начат маршрут из ${settlement.name}`, 'map');
            }
            modal.remove();
        };
    }
    
    const addToRouteBtn = document.getElementById('addToRouteBtn');
    if (addToRouteBtn) {
        addToRouteBtn.onclick = () => {
            if (currentMode !== 'route') {
                addGlobalLog(`❌ Сначала начните маршрут (кнопка "Начать маршрут отсюда")`, 'map');
                modal.remove();
                return;
            }
            if (typeof addTempRoutePoint === 'function') {
                addTempRoutePoint(latLng);
                addGlobalLog(`➕ Город ${settlement.name} добавлен в маршрут`, 'map');
            }
            modal.remove();
        };
    }
    
    const endRouteBtn = document.getElementById('endRouteBtn');
    if (endRouteBtn) {
        endRouteBtn.onclick = () => {
            if (currentMode !== 'route') {
                addGlobalLog(`❌ Сначала начните маршрут (кнопка "Начать маршрут отсюда")`, 'map');
                modal.remove();
                return;
            }
            if (tempPoints.length === 0) {
                addGlobalLog(`❌ Нет точек маршрута`, 'map');
                modal.remove();
                return;
            }
            if (typeof addTempRoutePoint === 'function') {
                addTempRoutePoint(latLng);
                addGlobalLog(`🏁 Маршрут завершён в ${settlement.name}`, 'map');
                setTimeout(() => {
                    if (typeof saveCurrentRoute === 'function') saveCurrentRoute();
                }, 100);
            }
            modal.remove();
        };
    }
    
    const closeBtn = document.getElementById('closeSettlementBtn');
    if (closeBtn) {
        closeBtn.onclick = () => modal.remove();
    }
}

function findSettlementNearPoint(lat, lng) {
    if (typeof SETTLEMENTS_DB === 'undefined') return null;
    for (let id in SETTLEMENTS_DB) {
        const s = SETTLEMENTS_DB[id];
        const coords = toLeafletCoords(s.px, s.py);
        const distance = Math.hypot(lat - coords[0], lng - coords[1]);
        if (distance < 20) {
            return { id: s.id, name: s.name };
        }
    }
    return null;
}

// Экспортируем функции для внешних вызовов
window.initMap = initMap;
window.refreshMap = refreshMap;
window.addCityMarkers = addCityMarkers;
window.updateCitiesVisibility = updateCitiesVisibility;
window.setMode = setMode;
window.showRhetoricMasks = showRhetoricMasks;
window.showHoldingsMask = showHoldingsMask;
window.showVassalsMask = showVassalsMask;
window.buildRhetoricChecklist = buildRhetoricChecklist;
window.buildHoldingsChecklist = buildHoldingsChecklist;
window.updateVassalChecklist = updateVassalChecklist;
window.openSettlementModal = openSettlementModal;
window.clearMasks = clearMasks;

console.log("✅ 11_map.js загружен — карта, города, модальные окна");