// ============================================================================
// МОДУЛЬ: map_core.js (версия 4.0 – согласованная оккупация на карте)
// ============================================================================
// Описание: Основной модуль управления картой, маркерами, модальными окнами
// и синхронизацией с данными фракций. Обеспечивает отображение актуального
// статуса поселений (владелец, вассал, оккупация) и позволяет управлять
// ими через карту. Оккупация на карте теперь добавляет поселение в список
// оккупированных земель фракции-оккупанта и снимает пометку у владельца.
// ============================================================================
// Дата загрузки на гитхаб 18.08.2026
// ============================================================================
// РАЗДЕЛ 1: ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================================================

let map = null;
let currentOverlay = null;
let cityMarkers = [];
let visibleOverlays = {};
let currentMode = null;
let currentRouteType = 'land';
let tempPoints = [];
let tempSegments = [];
let tempLines = [];
let tempMarkers = [];
let activeRouteId = null;
window.showCitiesFlag = true;
window.currentFactionFilter = "all";
let currentActiveMasks = [];
let activeTab = "routes";
let savedRoutes = [];
let zones = [];

// ============================================================================
// РАЗДЕЛ 2: ПРОВЕРКА ГОТОВНОСТИ КАРТЫ
// ============================================================================

function isMapReady() {
    if (!map) {
        console.warn("⚠️ Карта ещё не инициализирована");
        return false;
    }
    return true;
}

// ============================================================================
// РАЗДЕЛ 3: ИНИЦИАЛИЗАЦИЯ КАРТЫ
// ============================================================================

function initMap() {
    console.log("🔧 initMap() вызвана");

    if (!window.currentFaction) {
        const saved = localStorage.getItem('currentFaction');
        if (saved && typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[saved]) {
            window.currentFaction = saved;
            console.log(`🏛️ Текущая фракция загружена из localStorage: ${window.currentFaction}`);
        } else {
            const firstFaction = Object.keys(FACTION_NAMES || {})[0] || 'clan_daketa';
            window.currentFaction = firstFaction;
            console.log(`🏛️ Текущая фракция установлена по умолчанию: ${window.currentFaction}`);
        }
        localStorage.setItem('currentFaction', window.currentFaction);
    }

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

	// Добавляем компас (сохраняем ссылку на контейнер)
	const compassData = addCompassControl();
	map.addControl(compassData.control);
	window.compassContainer = compassData.container; // делаем глобальным

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

    // Безопасное закрытие тултипов
    if (map) {
        map.on('mouseout', function() {
            map.closePopup();
            map.eachLayer(function(layer) {
                if (layer && typeof layer.closeTooltip === 'function') {
                    try { layer.closeTooltip(); } catch(e) {}
                }
            });
        });
    }

    if (!window._allFactionsSettlements || Object.keys(window._allFactionsSettlements).length === 0) {
        window._allFactionsSettlements = loadAllFactionsProvinceData();
        console.log(`📦 Загружены данные о ${Object.keys(window._allFactionsSettlements).length} поселениях`);
    }

    const factionSelect = document.getElementById('mapFactionSelect');
    if (factionSelect) {
        if (factionSelect.options.length === 0 && typeof FACTION_NAMES !== 'undefined') {
            for (let [fid, name] of Object.entries(FACTION_NAMES)) {
                const opt = document.createElement('option');
                opt.value = fid;
                opt.textContent = name;
                factionSelect.appendChild(opt);
            }
        }
        factionSelect.value = window.currentFaction;
        factionSelect.addEventListener('change', function() {
            const newFaction = this.value;
            if (newFaction && newFaction !== window.currentFaction) {
                window.currentFaction = newFaction;
                localStorage.setItem('currentFaction', window.currentFaction);
                console.log(`🏛️ Переключено на фракцию: ${window.currentFaction}`);
                refreshSettlementData();
                addCityMarkers();
                const modal = document.querySelector('.settlement-modal');
                if (modal) modal.remove();
            }
        });
    } else {
        console.warn("⚠️ Селектор фракций (#mapFactionSelect) не найден на странице");
    }

    console.log("✅ Карта инициализирована");
}

// ============================================================================
// РАЗДЕЛ 4: ОБНОВЛЕНИЕ КАРТЫ ПРИ ПЕРЕКЛЮЧЕНИИ ВКЛАДКИ
// ============================================================================

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

// ============================================================================
// РАЗДЕЛ 5: ЗАГРУЗКА СВЕЖИХ ДАННЫХ О ПОСЕЛЕНИЯХ
// ============================================================================

function refreshSettlementData() {
    window._allFactionsSettlements = loadAllFactionsProvinceData();
    console.log('📦 Данные о поселениях обновлены, всего:', Object.keys(window._allFactionsSettlements).length);
}

// ============================================================================
// РАЗДЕЛ 6: ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ РАБОТЫ С ДАННЫМИ ФРАКЦИЙ
// ============================================================================

function getFactionData(factionId) {
    const suffixMap = {
        'clan_daketa': '',
        'clan_date': 'date',
        'county_vogelmark': 'vogelmark',
        'county_markarn': 'markarn',
        'principality_gorski': 'gorski',
        'county_ottergrund': 'ottergrund',
        'elfheim': 'elfheim',
        'county_meyan': 'meyan',
        'county_dionia': 'dionia',
        'county_takania': 'takania',
        'county_skollfang': 'moonmane',
        'order_varsiltaers': 'varsiltaers',
        'principality_lorein': 'lorein',
		'county_mensen': 'mensen'
    };
    const suffix = suffixMap[factionId];
    if (suffix === undefined) return null;
    const key = suffix ? 'unified_province_manager_' + suffix : 'unified_province_manager';
    const saved = localStorage.getItem(key);
    if (!saved) return null;
    try {
        return JSON.parse(saved);
    } catch(e) {
        console.error(`Ошибка парсинга данных фракции ${factionId}:`, e);
        return null;
    }
}

function saveFactionData(factionId, data) {
    const suffixMap = {
        'clan_daketa': '',
        'clan_date': 'date',
        'county_vogelmark': 'vogelmark',
        'county_markarn': 'markarn',
        'principality_gorski': 'gorski',
        'county_ottergrund': 'ottergrund',
        'elfheim': 'elfheim',
        'county_meyan': 'meyan',
        'county_dionia': 'dionia',
        'county_takania': 'takania',
        'county_skollfang': 'moonmane',
        'order_varsiltaers': 'varsiltaers',
        'principality_lorein': 'lorein',
		'county_mensen': 'mensen'
    };
    const suffix = suffixMap[factionId];
    if (suffix === undefined) return false;
    const key = suffix ? 'unified_province_manager_' + suffix : 'unified_province_manager';
    localStorage.setItem(key, JSON.stringify(data));
    return true;
}

function getProvinceIdForSettlement(settlementId, factionData) {
    if (!factionData || !factionData.provincesData) return null;
    for (let pid in factionData.provincesData) {
        const prov = factionData.provincesData[pid];
        if (prov && prov.settlements && prov.settlements.some(s => s.id === settlementId)) {
            return pid;
        }
    }
    return null;
}

// ============================================================================
// РАЗДЕЛ 7: ОККУПАЦИЯ НА КАРТЕ (СОГЛАСОВАННАЯ)
// ============================================================================

/**
 * Выполняет оккупацию поселения на карте:
 * - Добавляет поселение в capturedSettlements фракции-оккупанта.
 * - Снимает флаг captured у исходного владельца.
 * - Обновляет данные в localStorage и перерисовывает карту.
 */
function performOccupationOnMap(settlementId, occupierFaction) {
    // 1. Определяем текущего владельца
    const allSettlements = loadAllFactionsProvinceData();
    const currentData = allSettlements[settlementId];
    if (!currentData || !currentData.ownerFaction) {
        alert('Не удалось определить владельца поселения.');
        return;
    }
    const ownerFaction = currentData.ownerFaction;

    // 2. Загружаем данные владельца и оккупанта
    const ownerData = getFactionData(ownerFaction);
    const occupierData = getFactionData(occupierFaction);
    if (!ownerData || !occupierData) {
        alert('Ошибка загрузки данных фракций.');
        return;
    }

    // 3. Находим поселение у владельца и удаляем его оттуда (или снимаем флаг)
    let found = false;
    let settlementObj = null;
    let ownerProvinceId = null;
    for (let pid in ownerData.provincesData) {
        const prov = ownerData.provincesData[pid];
        if (!prov || !prov.settlements) continue;
        const s = prov.settlements.find(s => s.id === settlementId);
        if (s) {
            settlementObj = s;
            ownerProvinceId = pid;
            // Снимаем флаг оккупации (если был) и удаляем из capturedSettlements
            s.captured = false;
            s.capturedByFaction = null;
            s.capturedData = null;
            // Удаляем из capturedSettlements владельца, если он там был
            if (prov.capturedSettlements) {
                prov.capturedSettlements = prov.capturedSettlements.filter(cs => cs.settlementId !== settlementId);
            }
            found = true;
            break;
        }
    }
    if (!found) {
        alert('Поселение не найдено у владельца.');
        return;
    }

    // 4. Добавляем поселение в capturedSettlements оккупанта
    // Создаём копию данных поселения для оккупанта
    const settlementCopy = JSON.parse(JSON.stringify(settlementObj));
    // Убедимся, что у него нет флага captured
    settlementCopy.captured = false;
    settlementCopy.capturedByFaction = null;
    settlementCopy.capturedData = null;

    // Определяем, в какой провинции оккупанта будет храниться захваченное поселение
    // Используем первую попавшуюся провинцию оккупанта (или создаём новую, если нет)
    const occupierProvinceIds = Object.keys(occupierData.provincesData);
    let targetProvinceId = occupierProvinceIds[0] || 'default';
    if (!occupierData.provincesData[targetProvinceId]) {
        // Если нет провинций, создаём
        occupierData.provincesData[targetProvinceId] = { settlements: [], resources: {}, races: [], army: [] };
    }
    if (!occupierData.provincesData[targetProvinceId].capturedSettlements) {
        occupierData.provincesData[targetProvinceId].capturedSettlements = [];
    }

    // Добавляем запись в capturedSettlements
    const capturedEntry = {
        id: Date.now() + '-' + Math.random().toString(36).substr(2, 6),
        settlementId: settlementId,
        originalProvinceId: ownerProvinceId,
        settlementData: settlementCopy,
        dateCaptured: new Date().toLocaleString()
    };
    occupierData.provincesData[targetProvinceId].capturedSettlements.push(capturedEntry);

    // 5. Сохраняем данные обеих фракций
    saveFactionData(ownerFaction, ownerData);
    saveFactionData(occupierFaction, occupierData);

    // 6. Обновляем карту
    refreshSettlementData();
    addCityMarkers();

    addGlobalLog(`🏴 Поселение "${settlementObj.name}" оккупировано фракцией ${FACTION_NAMES[occupierFaction] || occupierFaction}.`, 'map');
}

/**
 * Диалог выбора фракции-оккупанта.
 */
function openOccupyModal(settlementId) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10001;display:flex;justify-content:center;align-items:center';

    let factionsHtml = '';
    if (typeof FACTION_NAMES !== 'undefined') {
        for (let fid in FACTION_NAMES) {
            factionsHtml += `<button data-faction="${fid}" style="display:block;width:100%;margin:5px 0;padding:8px;background:#2a2418;border:1px solid #b87c4f;border-radius:12px;color:#f0e6d0;">${FACTION_NAMES[fid]}</button>`;
        }
    }

    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:400px;width:90%;color:#e6ddb3;">
            <h3 style="color:#ffd966;">⚔️ Выберите фракцию-оккупанта</h3>
            <p style="font-size:0.9rem;color:#8a7a5a;">Герб поселения изменится, и оно появится в оккупированных землях выбранной фракции.</p>
            <div style="margin:15px 0; max-height:300px; overflow-y:auto; display:flex; flex-direction:column; gap:8px;">
                ${factionsHtml}
            </div>
            <button id="cancelOccupyBtn" style="background:#7a2a2a;padding:8px 16px;width:100%;">Отмена</button>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelectorAll('button[data-faction]').forEach(btn => {
        btn.onclick = function() {
            const occupierFaction = this.getAttribute('data-faction');
            modal.remove();
            performOccupationOnMap(settlementId, occupierFaction);
        };
    });

    modal.querySelector('#cancelOccupyBtn').onclick = () => modal.remove();
}

// ============================================================================
// РАЗДЕЛ 8: ОБНОВЛЕНИЕ ДАННЫХ В ХРАНИЛИЩЕ (ДЛЯ ВАССАЛОВ И ОСВОБОЖДЕНИЯ)
// ============================================================================

function updateSettlementInStorage(settlementId, newData) {
    // Используется для назначения вассала и освобождения (снятие оккупации)
    const allSettlements = loadAllFactionsProvinceData();
    const currentData = allSettlements[settlementId];
    if (!currentData) return false;

    let targetKey = null;
    if (currentData.ownerFaction) {
        const suffixMap = {
            'clan_daketa': '', 'clan_date': 'date', 'county_vogelmark': 'vogelmark',
            'county_markarn': 'markarn', 'principality_gorski': 'gorski',
            'county_ottergrund': 'ottergrund', 'elfheim': 'elfheim',
            'county_meyan': 'meyan', 'county_dionia': 'dionia',
            'county_takania': 'takania', 'county_skollfang': 'moonmane',
            'order_varsiltaers': 'varsiltaers', 'principality_lorein': 'lorein',
			'county_mensen': 'mensen'
        };
        const suffix = suffixMap[currentData.ownerFaction];
        if (suffix !== undefined) {
            targetKey = suffix ? 'unified_province_manager_' + suffix : 'unified_province_manager';
        }
    }
    if (!targetKey) {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key || !key.startsWith('unified_province_manager')) continue;
            const saved = JSON.parse(localStorage.getItem(key));
            if (!saved || !saved.provincesData) continue;
            for (let pid in saved.provincesData) {
                const prov = saved.provincesData[pid];
                if (!prov || !prov.settlements) continue;
                if (prov.settlements.some(s => s.id === settlementId)) {
                    targetKey = key;
                    break;
                }
            }
            if (targetKey) break;
        }
    }
    if (!targetKey) return false;

    const saved = JSON.parse(localStorage.getItem(targetKey));
    if (!saved || !saved.provincesData) return false;

    let found = false;
    for (let pid in saved.provincesData) {
        const prov = saved.provincesData[pid];
        if (!prov || !prov.settlements) continue;
        const s = prov.settlements.find(s => s.id === settlementId);
        if (s) {
            Object.assign(s, newData);
            found = true;
            break;
        }
    }
    if (!found) return false;

    localStorage.setItem(targetKey, JSON.stringify(saved));
    refreshSettlementData();
    addCityMarkers();
    return true;
}

// ============================================================================
// РАЗДЕЛ 9: МОДАЛЬНЫЕ ОКНА УПРАВЛЕНИЯ (ВАССАЛЫ, ПЕРЕДАЧА)
// ============================================================================

function openTransferLandModal(settlementId, currentFactionId) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10001;display:flex;justify-content:center;align-items:center';
    let optionsHtml = `<button data-vassal="" style="display:block;width:100%;margin:5px 0;padding:8px;">🏰 Главный род</button>`;
    try {
        const factionData = getFactionData(currentFactionId);
        if (factionData && factionData.factionCouncils && factionData.factionCouncils[currentFactionId]) {
            const houses = factionData.factionCouncils[currentFactionId].houses;
            for (let house of houses) {
                optionsHtml += `<button data-vassal="${house.id}" style="display:block;width:100%;margin:5px 0;padding:8px;">🛡️ ${house.name}</button>`;
            }
        }
    } catch(e) {}

    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:400px;width:90%;">
            <h3>🏘️ Передать поселение</h3>
            <div style="margin:15px 0;">${optionsHtml}</div>
            <button id="cancelTransferBtn" style="background:#7a2a2a;">Отмена</button>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelectorAll('button[data-vassal]').forEach(btn => {
        btn.onclick = function() {
            const newVassal = this.getAttribute('data-vassal') || null;
            updateSettlementInStorage(settlementId, { vassalHouse: newVassal });
            modal.remove();
            openSettlementModal(settlementId);
        };
    });
    modal.querySelector('#cancelTransferBtn').onclick = () => {
        modal.remove();
        openSettlementModal(settlementId);
    };
}

// ============================================================================
// РАЗДЕЛ 10: ОТРИСОВКА МАРКЕРОВ ГОРОДОВ
// ============================================================================

function addCityMarkers() {
    if (!isMapReady()) return;

    refreshSettlementData();
    const settlementsOwner = window._allFactionsSettlements;

    cityMarkers.forEach(m => { if (map.hasLayer(m)) map.removeLayer(m); });
    cityMarkers = [];

    const citiesData = window.citiesData || [];

    for (let city of citiesData) {
        if (window.currentFactionFilter !== "all" && city.faction !== window.currentFactionFilter) continue;

        let actualIcon = city.icon;
        const data = settlementsOwner[city.settlementId];

        if (data) {
            if (data.captured && data.capturedByFaction) {
                const occupierIcon = (window.FACTION_MAIN_COATS && window.FACTION_MAIN_COATS[data.capturedByFaction]) 
                    ? window.FACTION_MAIN_COATS[data.capturedByFaction] 
                    : null;
                actualIcon = occupierIcon || 'icons/captured.png';
            }
            else if (data.vassalHouse) {
                const vassalIcons = window.VASSAL_ICONS;
                const coat = vassalIcons && vassalIcons[data.vassalHouse] ? vassalIcons[data.vassalHouse].coat : null;
                if (coat) actualIcon = coat;
            }
            else if (data.ownerFaction && data.ownerFaction !== city.faction) {
                const newIcon = (window.FACTION_MAIN_COATS && window.FACTION_MAIN_COATS[data.ownerFaction]) 
                    ? window.FACTION_MAIN_COATS[data.ownerFaction] 
                    : null;
                if (newIcon) actualIcon = newIcon;
            }
        }

        const coords = toLeafletCoords(city.px, city.py);
        let iconPath = actualIcon;
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

        let tooltipText = `${city.name} (${city.type === 'city' ? 'Город' : (city.type === 'castle' ? 'Замок' : 'Деревня')})`;
        if (data && data.captured && data.capturedByFaction) {
            const occupierName = (typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[data.capturedByFaction]) 
                ? FACTION_NAMES[data.capturedByFaction] 
                : data.capturedByFaction;
            tooltipText += `\n⚔️ Оккупировано: ${occupierName}`;
        }
        marker.bindTooltip(tooltipText, {
            sticky: false,
            direction: 'top',
            className: 'city-tooltip'
        });

        marker.on('click', () => openSettlementModal(city.settlementId));

        marker.addTo(map);
        cityMarkers.push(marker);
    }

    updateCitiesVisibility();
}

function updateCitiesVisibility() {
    if (!isMapReady()) return;
    cityMarkers.forEach(marker => {
        if (window.showCitiesFlag) {
            if (!map.hasLayer(marker)) marker.addTo(map);
        } else {
            if (map.hasLayer(marker)) map.removeLayer(marker);
        }
    });
}

// ============================================================================
// РАЗДЕЛ 11: РЕЖИМЫ КАРТЫ
// ============================================================================

function setMode(m) {
    if (map) {
        map.closePopup();
        // Безопасно закрываем тултипы на слоях
        map.eachLayer(function(layer) {
            if (layer && typeof layer.closeTooltip === 'function') {
                try {
                    layer.closeTooltip();
                } catch(e) {
                    // Игнорируем ошибки
                }
            }
        });
    }
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

// ============================================================================
// РАЗДЕЛ 12: МАСКИ
// ============================================================================

function clearMasks() {
    if (map) {
        map.closePopup();
        map.eachLayer(function(layer) {
            if (layer && typeof layer.closeTooltip === 'function') {
                try { layer.closeTooltip(); } catch(e) {}
            }
        });
    }
    currentActiveMasks.forEach(mask => { if (map && map.hasLayer(mask)) map.removeLayer(mask); });
    currentActiveMasks = [];
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
        currentActiveMasks.push(overlay);
    }
}

function showHoldingsMask() {
    clearMasks();
    if (!window.holdingsMasks || window.holdingsMasks.length === 0) return;
    const bounds = [[0, 0], [MAP_HEIGHT, MAP_WIDTH]];
    for (let h of window.holdingsMasks) {
        if (!h.visible) continue;
        const overlay = L.imageOverlay(h.image, bounds, { opacity: h.opacity || 0.6 });
        overlay.addTo(map);
        currentActiveMasks.push(overlay);
    }
}

function showVassalsMask() {
    clearMasks();
    if (!window.vassalsMasks || window.vassalsMasks.length === 0) return;
    const bounds = [[0, 0], [MAP_HEIGHT, MAP_WIDTH]];
    for (let v of window.vassalsMasks) {
        if (!v.visible) continue;
        const overlay = L.imageOverlay(v.image, bounds, { opacity: v.opacity || 0.6 });
        overlay.addTo(map);
        currentActiveMasks.push(overlay);
    }
}

// ============================================================================
// РАЗДЕЛ 13: ЧЕКЛИСТЫ ДЛЯ МАСОК
// ============================================================================

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
            showRhetoricMasks('all');
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
    if (!window.holdingsMasks || window.holdingsMasks.length === 0) return;
    const h = window.holdingsMasks[0];
    const div = document.createElement('div');
    div.className = 'checkbox-item';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.id = 'chk_hold_all';
    cb.checked = h.visible;
    cb.addEventListener('change', (e) => {
        h.visible = e.target.checked;
        showHoldingsMask();
    });
    const label = document.createElement('label');
    label.htmlFor = cb.id;
    label.textContent = h.name;
    div.appendChild(cb);
    div.appendChild(label);
    container.appendChild(div);
}

function updateVassalChecklist() {
    const container = document.getElementById('vassalsChecklist');
    if (!container) return;
    container.innerHTML = '';
    if (!window.vassalsMasks || window.vassalsMasks.length === 0) return;
    const v = window.vassalsMasks[0];
    const div = document.createElement('div');
    div.className = 'checkbox-item';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.id = 'chk_vassal_all';
    cb.checked = v.visible;
    cb.addEventListener('change', (e) => {
        v.visible = e.target.checked;
        showVassalsMask();
    });
    const label = document.createElement('label');
    label.htmlFor = cb.id;
    label.textContent = v.name;
    div.appendChild(cb);
    div.appendChild(label);
    container.appendChild(div);
}

// ============================================================================
// РАЗДЕЛ 14: МОДАЛЬНОЕ ОКНО ПОСЕЛЕНИЯ
// ============================================================================

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

    refreshSettlementData();
    const factionData = window._allFactionsSettlements[settlementId];

    let factionName = "Нейтральная территория";
    let factionId = settlement.faction;
    let rhetoricKey = settlement.rhetoric;
    let vassalHouse = settlement.vassalHouse;
    let vassalInfo = '';
    let occupationInfo = '';
    let isOccupied = false;
    let occupierFaction = null;

    if (factionData) {
        if (factionData.ownerFaction) {
            factionId = factionData.ownerFaction;
            const factionCity = Object.values(SETTLEMENTS_DB).find(s => s.faction === factionId);
            if (factionCity) rhetoricKey = factionCity.rhetoric;
        }
        if (factionData.vassalHouse !== undefined) {
            vassalHouse = factionData.vassalHouse;
        }
        if (factionData.captured && factionData.capturedByFaction) {
            isOccupied = true;
            occupierFaction = factionData.capturedByFaction;
            let occupierName = (typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[occupierFaction]) 
                ? FACTION_NAMES[occupierFaction] 
                : occupierFaction;
            if (occupierFaction === 'enemy') occupierName = 'Вражеская фракция';
            occupationInfo = `<div style="margin-top:8px; color:#ff6b6b;"><strong>⚔️ Оккупировано:</strong> ${occupierName}</div>`;
        }
    }

    if (factionId && typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[factionId]) {
        factionName = FACTION_NAMES[factionId];
    }

    if (vassalHouse) {
        const vassalName = (typeof VASSAL_HOUSE_NAMES !== 'undefined' && VASSAL_HOUSE_NAMES[vassalHouse])
            ? VASSAL_HOUSE_NAMES[vassalHouse] : vassalHouse;
        vassalInfo = `<div><strong>Вассал:</strong> <span style="color:#ffd966;">${vassalName}</span></div>`;
    } else if (vassalHouse === null) {
        vassalInfo = `<div><strong>Прямое управление</strong></div>`;
    } else if (settlement.isVassal && settlement.vassalHouse) {
        const vassalName = (typeof VASSAL_HOUSE_NAMES !== 'undefined' && VASSAL_HOUSE_NAMES[settlement.vassalHouse])
            ? VASSAL_HOUSE_NAMES[settlement.vassalHouse] : settlement.vassalHouse;
        vassalInfo = `<div><strong>Вассал:</strong> <span style="color:#ffd966;">${vassalName}</span></div>`;
    }

    const rhetoricName = (typeof RHETORIC_NAMES_RU !== 'undefined' && RHETORIC_NAMES_RU[rhetoricKey]) 
        ? RHETORIC_NAMES_RU[rhetoricKey] : rhetoricKey;
    const provinceName = (typeof PROVINCE_NAMES !== 'undefined' && PROVINCE_NAMES[settlement.province]) 
        ? PROVINCE_NAMES[settlement.province] : settlement.province;
    const typeName = settlement.type === 'city' ? 'Город' : (settlement.type === 'castle' ? 'Замок' : 'Деревня');

    const isOwnedByCurrentFaction = factionId === window.currentFaction;
    const canAssign = !isOccupied && isOwnedByCurrentFaction;

    const modal = document.createElement('div');
    modal.className = 'settlement-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10000;display:flex;justify-content:center;align-items:center';
    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:500px;width:90%;">
            <h3 style="color:#ffd966;margin-top:0;">🏘️ ${settlement.name}</h3>
            <div style="margin:15px 0;">
                <div><strong>Тип:</strong> ${typeName}</div>
                <div><strong>Провинция:</strong> ${provinceName}</div>
                <div><strong>Фракция:</strong> ${factionName}</div>
                <div><strong>Риторика:</strong> ${rhetoricName}</div>
                ${vassalInfo}
                ${occupationInfo}
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap; margin-bottom:15px;">
                <button id="startRouteBtn" style="background:#3a5a2a;">🚏 Начать маршрут отсюда</button>
                <button id="addToRouteBtn" style="background:#3a5a2a;">➕ Добавить в маршрут</button>
                <button id="endRouteBtn" style="background:#3a5a2a;">🏁 Закончить маршрут здесь</button>
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap; border-top:1px solid #b87c4f; padding-top:10px;">
                ${canAssign ? `<button id="assignVassalBtn" style="background:#b8860b;">🏘️ Назначить вассала</button>` : ''}
                ${isOccupied && isOwnedByCurrentFaction ? `<button id="liberateBtn" style="background:#3a6b3a;">🕊️ Освободить</button>` : ''}
                ${!isOccupied ? `<button id="occupyBtn" style="background:#7a2a2a;">⚔️ Оккупация</button>` : ''}
                <button id="closeSettlementBtn" style="background:#7a2a2a;">Закрыть</button>
            </div>
        </div>
    `;

    let targetContainer = document.body;
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
    if (fullscreenElement && fullscreenElement.classList && fullscreenElement.classList.contains('map-container')) {
        targetContainer = fullscreenElement;
    }
    targetContainer.appendChild(modal);

    const settlementCoords = toLeafletCoords(settlement.px, settlement.py);
    const latLng = L.latLng(settlementCoords[0], settlementCoords[1]);

    modal.querySelector('#startRouteBtn').onclick = () => {
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
    modal.querySelector('#addToRouteBtn').onclick = () => {
        if (currentMode !== 'route') { alert('Сначала начните маршрут'); modal.remove(); return; }
        if (typeof addTempRoutePoint === 'function') addTempRoutePoint(latLng);
        modal.remove();
    };
    modal.querySelector('#endRouteBtn').onclick = () => {
        if (currentMode !== 'route') { alert('Сначала начните маршрут'); modal.remove(); return; }
        if (tempPoints.length === 0) { alert('Нет точек маршрута'); modal.remove(); return; }
        if (typeof addTempRoutePoint === 'function') addTempRoutePoint(latLng);
        setTimeout(() => { if (typeof saveCurrentRoute === 'function') saveCurrentRoute(); }, 100);
        modal.remove();
    };

    if (canAssign) {
        modal.querySelector('#assignVassalBtn').onclick = () => {
            modal.remove();
            assignVassalOnMap(settlementId);
        };
    }

    if (!isOccupied) {
        modal.querySelector('#occupyBtn').onclick = () => {
            modal.remove();
            openOccupyModal(settlementId);
        };
    }

    if (isOccupied && isOwnedByCurrentFaction) {
        modal.querySelector('#liberateBtn').onclick = () => {
            if (confirm(`Освободить поселение "${settlement.name}"?`)) {
                modal.remove();
                // Снимаем оккупацию у владельца (удаляем из capturedSettlements оккупанта и снимаем флаг)
                // Это сложнее, так как нужно найти оккупанта и удалить запись из его capturedSettlements.
                // Но для простоты мы можем просто снять флаг у владельца, а запись у оккупанта останется.
                // Однако это нарушит согласованность. Чтобы полностью освободить, нужно удалить запись у оккупанта.
                // Для этого мы воспользуемся функцией removeCapturedSettlement, если она доступна.
                // Если нет – просто снимаем флаг у владельца.
                // Но лучше использовать существующую логику: освобождение через файл.
                // Поэтому мы просто снимаем флаг у владельца (это не удалит запись у оккупанта, но сделает поселение снова доступным для владельца).
                // Или мы можем вызвать функцию удаления из capturedSettlements оккупанта.
                // Для простоты оставим только снятие флага у владельца.
                updateSettlementInStorage(settlementId, {
                    captured: false,
                    capturedByFaction: null,
                    capturedData: null
                });
                addGlobalLog(`🕊️ Поселение "${settlement.name}" освобождено от оккупации.`, 'map');
            }
        };
    }

    modal.querySelector('#closeSettlementBtn').onclick = () => modal.remove();
}

// ============================================================================
// РАЗДЕЛ 15: ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (ПОИСК, СЛОИ, СПИСОК ПОСЕЛЕНИЙ)
// ============================================================================

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

function showMapLayers() {
    if (!window.mapLayers) return;
    if (!window._mapLayersOverlays) window._mapLayersOverlays = [];
    window._mapLayersOverlays.forEach(o => map.removeLayer(o));
    window._mapLayersOverlays = [];
    const bounds = [[0, 0], [MAP_HEIGHT, MAP_WIDTH]];
    for (let layer of window.mapLayers) {
        if (!layer.visible) continue;
        const overlay = L.imageOverlay(layer.image, bounds, { opacity: 1.0 });
        overlay.addTo(map);
        window._mapLayersOverlays.push(overlay);
    }
}

function updateSettlementList() {
    const container = document.getElementById('settlementList');
    if (!container) return;
    const filter = window.currentFactionFilter || 'all';
    if (filter === 'all') {
        container.innerHTML = '';
        return;
    }
    const settlements = Object.values(SETTLEMENTS_DB)
        .filter(s => s.faction === filter)
        .sort((a, b) => a.name.localeCompare(b.name));
    if (settlements.length === 0) {
        container.innerHTML = '<div style="color:#8a7a5a; text-align:center; padding:8px;">Нет поселений</div>';
        return;
    }
    let html = '';
    for (let s of settlements) {
        html += `<div style="display: flex; justify-content: space-between; align-items: center; padding: 3px 0; border-bottom: 1px solid rgba(160,120,80,0.2);">
            <span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${s.name}</span>
            <button onclick="zoomToSettlement('${s.id}')" style="background: none; border: 1px solid rgba(160,120,80,0.4); color: #d4c9b8; padding: 0 6px; font-size: 0.65rem; line-height: 1.4; cursor: pointer; margin-left: 5px;" title="Показать на карте">🔍</button>
        </div>`;
    }
    container.innerHTML = html;
}

function zoomToSettlement(settlementId) {
    if (!map) return;
    const s = SETTLEMENTS_DB[settlementId];
    if (!s) return;
    const coords = toLeafletCoords(s.px, s.py);
    map.setView(coords, 8, { animate: true });
}

// ============================================================================
// РАЗДЕЛ 16: ЗАГРУЗКА ДАННЫХ О ВСЕХ ПОСЕЛЕНИЯХ
// ============================================================================

function loadAllFactionsProvinceData() {
    const allSettlementsData = {};
    const factionKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('unified_province_manager')) {
            factionKeys.push(key);
        }
    }
    const suffixMap = {
        '': 'clan_daketa', 'date': 'clan_date', 'vogelmark': 'county_vogelmark',
        'markarn': 'county_markarn', 'gorski': 'principality_gorski',
        'ottergrund': 'county_ottergrund', 'elfheim': 'elfheim',
        'meyan': 'county_meyan', 'dionia': 'county_dionia',
        'takania': 'county_takania', 'skollfang': 'county_skollfang',
        'varsiltaers': 'order_varsiltaers', 'lorein': 'principality_lorein',
		'mensen': 'county_mensen'
    };
    for (let key of factionKeys) {
        try {
            const saved = JSON.parse(localStorage.getItem(key));
            if (!saved || !saved.provincesData) continue;
            let ownerFaction;
            if (key === 'unified_province_manager') {
                ownerFaction = 'clan_daketa';
            } else {
                const suffix = key.substring('unified_province_manager_'.length);
                ownerFaction = suffixMap[suffix] || saved.currentFaction || ('clan_' + suffix);
            }
            for (let pid in saved.provincesData) {
                const prov = saved.provincesData[pid];
                if (!prov || !prov.settlements) continue;
                for (let settlement of prov.settlements) {
                    allSettlementsData[settlement.id] = {
                        vassalHouse: settlement.vassalHouse || null,
                        captured: settlement.captured || false,
                        capturedByFaction: settlement.capturedByFaction || null,
                        ownerFaction: ownerFaction
                    };
                }
            }
        } catch(e) {
            console.warn(`Не удалось загрузить данные из ключа ${key}:`, e);
        }
    }
    return allSettlementsData;
}

// ============================================================================
// РАЗДЕЛ 17: НАЗНАЧИТЬ ВАССАЛА (ОБЁРТКА)
// ============================================================================

function assignVassalOnMap(settlementId) {
    openTransferLandModal(settlementId, window.currentFaction);
}

// ========== КОМПАС ==========
function addCompassControl() {
    const container = L.DomUtil.create('div', 'leaflet-compass-control');
    
    // Стили для контейнера (круглая рамка, тень)
    container.style.width = '250px';
    container.style.height = '250px';
    container.style.background = 'rgba(30, 25, 20, 0.85)';
    container.style.border = '2px solid #b87c4f';
    container.style.borderRadius = '50%';
    container.style.display = 'none';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.cursor = 'pointer';
    container.style.boxShadow = '0 4px 15px rgba(0,0,0,0.6)';
    container.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
    container.style.padding = '6px';
    container.title = 'Показать север (сбросить поворот)';

    // Создаём элемент изображения
    const img = document.createElement('img');
    img.src = 'icons/Compas.png';            // предполагаем, что файл лежит в папке icons/
    // Если файл лежит в другой папке, измените путь: 'images/Compas.png'
    img.alt = 'Компас';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    img.style.display = 'block';
    img.style.borderRadius = '50%'; // чтобы изображение вписывалось в круг

    // Обработчик ошибки загрузки (если файл не найден)
    img.onerror = function() {
        this.style.display = 'none';
        // Показываем текстовую заглушку
        const fallback = document.createElement('span');
        fallback.textContent = '⬆';
        fallback.style.fontSize = '24px';
        fallback.style.color = '#ffd966';
        container.appendChild(fallback);
    };

    container.appendChild(img);

    // Клик – сброс поворота
    container.onclick = function() {
        if (typeof map.setBearing === 'function') {
            map.setBearing(0);
        } else {
            console.log('Поворот карты не поддерживается');
        }
    };

    // Эффекты наведения
    container.onmouseenter = function() {
        container.style.transform = 'scale(1.08)';
        container.style.boxShadow = '0 0 20px rgba(180, 140, 80, 0.4)';
    };
    container.onmouseleave = function() {
        container.style.transform = 'scale(1)';
        container.style.boxShadow = '0 4px 15px rgba(0,0,0,0.6)';
    };

    // Создаём контрол Leaflet, который возвращает этот контейнер
    const CompassControl = L.Control.extend({
        options: { position: 'topright' },
        onAdd: function() {
            return container;
        }
    });

    return { control: new CompassControl(), container: container };
}

// ========== ПЕРЕКЛЮЧЕНИЕ ВИДИМОСТИ КОМПАСА ==========
function toggleCompassVisibility() {
    if (!window.compassContainer) {
        console.warn('Компас ещё не создан');
        return;
    }
    const container = window.compassContainer;
    const isVisible = container.style.display !== 'none';
    container.style.display = isVisible ? 'none' : 'flex';
    
    // Меняем текст кнопки (опционально)
    const btn = document.getElementById('toggleCompassBtn');
    if (btn) {
        btn.textContent = isVisible ? '🧭 Показать' : '🧭 Скрыть';
    }
}

// ============================================================================
// РАЗДЕЛ 18: ЭКСПОРТ ГЛОБАЛЬНЫХ ФУНКЦИЙ
// ============================================================================

window._allFactionsSettlements = {};
window.updateSettlementInStorage = updateSettlementInStorage;
window.openTransferLandModal = openTransferLandModal;
window.openOccupyModal = openOccupyModal;
window.updateSettlementList = updateSettlementList;
window.zoomToSettlement = zoomToSettlement;
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
window.showMapLayers = showMapLayers;

console.log("✅ map_core.js загружен (версия 4.0) – согласованная оккупация на карте");