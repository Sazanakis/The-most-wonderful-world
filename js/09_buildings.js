// ============================================================================
// МОДУЛЬ 09: buildings.js
// Функции для работы с постройками, ресурсами и поселениями (без торговли)
// ВЕРСИЯ 5.0 — ДОБАВЛЕНЫ ОГРАНИЧЕНИЯ, ФИЛЬТРЫ, НОВЫЕ ЭФФЕКТЫ
// ============================================================================

// ========== 1. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ВАССАЛОВ ==========

const VASSAL_NAMES = {
    "house_seiryu": "Род Сейрю",
    "house_nodaketa": "Род Нодакэта",
    "house_yurai": "Род Юрей",
    "house_yume": "Род Юмэ",
    "house_senpu": "Род Сэнпу",
    "house_umi": "Род Уми",
    "house_gekken": "Род Гэккэн",
    "viscountcy_runheim": "Виконтство Рунхеймов",
    "viscountcy_voronetsky": "Виконтство Воронецких",
    "great_wall": "Великий Вал"
};

function getVassalForSettlement(settlementId) {
    if (typeof SETTLEMENTS_DB === 'undefined') return null;
    const settlement = SETTLEMENTS_DB[settlementId];
    if (settlement && settlement.isVassal && settlement.vassalHouse) {
        return settlement.vassalHouse;
    }
    return null;
}

function getVassalNameById(vassalId) {
    return VASSAL_NAMES[vassalId] || vassalId;
}

function getMaxSlotsForSettlement(settlement, settlementId) {
    const typeInfo = (typeof SETTLEMENT_TYPES !== 'undefined') ? SETTLEMENT_TYPES[settlement.type] : null;
    let maxSlots = typeInfo ? typeInfo.slots : 3;
    const vassalId = getVassalForSettlement(settlementId);
    if (vassalId) {
        maxSlots = Math.floor(maxSlots * 0.5); // 50% для вассалов
    }
    return maxSlots;
}

// ========== 2. ИНИЦИАЛИЗАЦИЯ ==========

function createSettlement(name, type) {
    return {
        id: (typeof generateId === 'function') ? generateId() : Date.now() + '-' + Math.random(),
        name: name,
        type: type,
        buildings: []
    };
}

// ========== 3. РАБОТА С РЕСУРСАМИ ФРАКЦИИ ==========

function getTotalResources() {
    const provinces = (typeof getCurrentFactionProvinces === 'function') 
        ? getCurrentFactionProvinces() 
        : (typeof FACTION_TO_PROVINCE !== 'undefined' ? [FACTION_TO_PROVINCE[currentFaction]] : []);
    const total = { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 };
    for (let provinceId of provinces) {
        if (typeof provincesData !== 'undefined' && provincesData[provinceId] && provincesData[provinceId].resources) {
            total.wood += provincesData[provinceId].resources.wood || 0;
            total.stone += provincesData[provinceId].resources.stone || 0;
            total.iron += provincesData[provinceId].resources.iron || 0;
            total.gold += provincesData[provinceId].resources.gold || 0;
            total.ers += provincesData[provinceId].resources.ers || 0;
        }
    }
    return total;
}

function updateGlobalResourcesDisplay() {
    const container = document.querySelector('.global-resources');
    if (!container) return;
    const total = getTotalResources();

    const existing = container.querySelectorAll('.global-resource:not(#globalUpkeepBlock)');
    existing.forEach(el => el.remove());

    for (let [key, res] of Object.entries(RESOURCES_REGISTRY)) {
        const div = document.createElement('div');
        div.className = 'global-resource';
        div.title = res.name;
        div.innerHTML = `<img src="${res.icon}" style="width:20px; height:20px; vertical-align: middle;"> <span>${Math.floor(total[key] || 0)}</span>`;
        container.insertBefore(div, container.firstChild);
    }
}

function renderResources() {
    const total = getTotalResources();
    setElementText('wood', Math.floor(total.wood));
    setElementText('stone', Math.floor(total.stone));
    setElementText('iron', Math.floor(total.iron));
    setElementText('gold', Math.floor(total.gold));
    setElementText('ers', Math.floor(total.ers));
}

// ========== 4. ПОСЕЛЕНИЯ И ПОСТРОЙКИ ==========

function updateProvinceSelect() {
    const select = document.getElementById('currentProvinceSelect');
    if (!select) return;
    const provinces = (typeof getCurrentFactionProvinces === 'function') ? getCurrentFactionProvinces() : [];
    select.innerHTML = '';
    for (let i = 0; i < provinces.length; i++) {
        const provinceId = provinces[i];
        const provinceName = (typeof PROVINCE_NAMES !== 'undefined' && PROVINCE_NAMES[provinceId]) ? PROVINCE_NAMES[provinceId] : provinceId;
        const isCapital = (i === 0) ? " (столица)" : "";
        const option = document.createElement('option');
        option.value = provinceId;
        option.textContent = `${provinceName}${isCapital}`;
        if (provinceId === currentProvince) option.selected = true;
        select.appendChild(option);
    }
    select.onchange = () => {
        currentProvince = select.value;
        refreshBuildingsUI();
        if (typeof refreshPeopleUI === 'function') refreshPeopleUI();
        addGlobalLog(`📍 Переключено на провинцию: ${(typeof PROVINCE_NAMES !== 'undefined' && PROVINCE_NAMES[currentProvince]) ? PROVINCE_NAMES[currentProvince] : currentProvince}`, 'general');
    };
}

function renderSettlements() {
    const data = (typeof provincesData !== 'undefined') ? provincesData[currentProvince] : null;
    const container = document.getElementById('settlementsList');
    if (!container) return;
    container.innerHTML = '';
    if (!data || !data.settlements) return;

    const settlementsWithVassal = data.settlements.map(s => {
        const vassalId = getVassalForSettlement(s.id);
        const vassalName = vassalId ? getVassalNameById(vassalId) : null;
        return { ...s, vassalId, vassalName };
    });

    const nonVassal = settlementsWithVassal.filter(s => !s.vassalId);
    const vassalGroups = new Map();
    settlementsWithVassal.filter(s => s.vassalId).forEach(s => {
        if (!vassalGroups.has(s.vassalId)) vassalGroups.set(s.vassalId, []);
        vassalGroups.get(s.vassalId).push(s);
    });

    if (nonVassal.length > 0) {
        const group = createCollapsibleGroup('🏰 Прямые владения (главный род)', nonVassal);
        container.appendChild(group);
    }

    for (let [vassalId, settlements] of vassalGroups) {
        const vassalName = settlements[0].vassalName || vassalId;
        const group = createCollapsibleGroup(`🛡️ Вассал: ${escapeHtml(vassalName)}`, settlements);
        container.appendChild(group);
    }

    document.querySelectorAll('.build-btn').forEach(btn => {
        btn.removeEventListener('click', window._buildHandler);
        window._buildHandler = () => showBuildingSelector(btn.getAttribute('data-id'));
        btn.addEventListener('click', window._buildHandler);
    });

    document.querySelectorAll('.upgrade-btn').forEach(btn => {
        btn.removeEventListener('click', window._upgradeBuildingHandler);
        window._upgradeBuildingHandler = () => {
            const settlementId = btn.getAttribute('data-settlement');
            const buildingId = btn.getAttribute('data-building-id');
            const settlement = provincesData[currentProvince]?.settlements.find(s => s.id === settlementId);
            const building = settlement?.buildings.find(b => b.id === buildingId);
            if (building) {
                startBuilding(settlementId, building.baseName, true, building);
            }
        };
        btn.addEventListener('click', window._upgradeBuildingHandler);
    });
}

function createCollapsibleGroup(title, settlements) {
    const wrapper = document.createElement('div');
    wrapper.className = 'settlements-group';
    wrapper.style.cssText = 'margin-bottom: 15px; border: 1px solid #b87c4f; border-radius: 16px; overflow: hidden;';
    
    const header = document.createElement('div');
    header.className = 'group-header';
    header.style.cssText = 'background: #2a2418; padding: 10px 15px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-weight: bold;';
    header.innerHTML = `<span>${title}</span><span class="group-toggle" style="font-size: 1.2rem;">▼</span>`;
    
    const content = document.createElement('div');
    content.className = 'group-content';
    content.style.cssText = 'padding: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: #1f1c14;';
    
    for (let s of settlements) {
        renderSettlementCard(s, content);
    }
    
    if (settlements.length % 2 === 1) {
        const spacer = document.createElement('div');
        spacer.style.cssText = 'grid-column: span 1; visibility: hidden;';
        content.appendChild(spacer);
    }
    
    wrapper.appendChild(header);
    wrapper.appendChild(content);
    
    let collapsed = false;
    header.addEventListener('click', () => {
        collapsed = !collapsed;
        content.style.display = collapsed ? 'none' : 'grid';
        const toggle = header.querySelector('.group-toggle');
        if (toggle) toggle.innerHTML = collapsed ? '▶' : '▼';
    });
    
    return wrapper;
}

function renderSettlementCard(settlement, container) {
    const typeInfo = (typeof SETTLEMENT_TYPES !== 'undefined') ? SETTLEMENT_TYPES[settlement.type] : { name: 'Поселение', slots: 3 };
    const maxSlots = getMaxSlotsForSettlement(settlement, settlement.id);
    const usedSlots = settlement.buildings.length;
    const freeSlots = maxSlots - usedSlots;
    const vassalId = getVassalForSettlement(settlement.id);
    const isVassal = !!vassalId;
    
    let vassalBadge = '';
    let cardStyle = '';
    if (isVassal) {
        const vassalName = getVassalNameById(vassalId);
        vassalBadge = `<div class="vassal-badge" style="background:#3a2a1c; border-radius:12px; padding:2px 8px; font-size:0.7rem; display:inline-block; margin-left:8px;">🛡️ Вассал: ${escapeHtml(vassalName)}</div>`;
        cardStyle = 'border-left: 4px solid #b8860b;';
    }
    
    const slotInfo = isVassal ? `(вассал, 50% слотов: ${usedSlots}/${maxSlots})` : `${usedSlots}/${maxSlots}`;
    
    // связанные маршруты
    let relatedRoutes = [];
    if (typeof savedRoutes !== 'undefined') {
        for (let route of savedRoutes) {
            let typeLabel = '';
            let isRelated = false;
            if (route.fromSettlementId === settlement.id) {
                typeLabel = '📤 Отсюда';
                isRelated = true;
            } else if (route.toSettlementId === settlement.id) {
                typeLabel = '📥 Сюда';
                isRelated = true;
            } else if (route.waypointIds && route.waypointIds.includes(settlement.id)) {
                typeLabel = '🔄 Через';
                isRelated = true;
            } else if (!route.fromSettlementId && !route.toSettlementId && route.points) {
                const settlementCoords = toLeafletCoords(settlement.px, settlement.py);
                for (let point of route.points) {
                    const distance = Math.hypot(point.lat - settlementCoords[0], point.lng - settlementCoords[1]);
                    if (distance < 30) {
                        typeLabel = '🗺️';
                        isRelated = true;
                        break;
                    }
                }
            }
            if (isRelated) {
                relatedRoutes.push({ ...route, typeLabel });
            }
        }
    }
    relatedRoutes.sort((a, b) => {
        const order = { '📤 Отсюда': 1, '📥 Сюда': 2, '🔄 Через': 3, '🗺️': 4 };
        return (order[a.typeLabel] || 5) - (order[b.typeLabel] || 5);
    });
    let routesHtml = '';
    if (relatedRoutes.length > 0) {
        routesHtml = `<div class="settlement-routes" style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #b87c4f; font-size: 0.7rem;"><span>🗺️ Связанные маршруты (${relatedRoutes.length}):</span><ul style="margin: 5px 0 0 20px; padding: 0;">${relatedRoutes.map(r => `<li><strong>${escapeHtml(r.name)}</strong> ${r.typeLabel} (${(typeof fmtDistance === 'function') ? fmtDistance(r.totalDistance) : r.totalDistance + ' км'}, ${(typeof fmtTurns === 'function') ? fmtTurns(r.totalTurns) : r.totalTurns + ' ходов'})</li>`).join('')}</ul></div>`;
    }

    const garrisonArmies = (typeof armies !== 'undefined') ? armies.filter(a => a.garrison === settlement.id && a.factionId === currentFaction) : [];
    let garrisonHtml = '';
    if (garrisonArmies.length > 0) {
        garrisonHtml = `<div class="settlement-garrison" style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #b87c4f; font-size: 0.7rem;"><span>🏰 Гарнизон (${garrisonArmies.length}):</span><ul style="margin: 5px 0 0 20px; padding: 0;">${garrisonArmies.map(army => `<li>${escapeHtml(army.name)} (👥 ${army.units.reduce((s, u) => s + u.count, 0)} чел.)</li>`).join('')}</ul></div>`;
    }

    const card = document.createElement('div');
    card.className = 'settlement-card';
    card.style.cssText = cardStyle;
    card.setAttribute('data-settlement-id', settlement.id);
    card.innerHTML = `
        <div class="settlement-header">
            <div>
                <span class="settlement-name">🏘️ ${escapeHtml(settlement.name)}</span>
                <span class="settlement-type">${typeInfo.name}</span>
                ${vassalBadge}
            </div>
            <div class="slots-info">
                📦 Слоты: ${slotInfo}
                ${freeSlots > 0 ? `<button class="build-btn" data-id="${settlement.id}" style="font-size:0.7rem; padding:2px 8px;">🏗️ Строить</button>` : '🔒 Слоты заполнены'}
            </div>
        </div>
        <div class="buildings-list" id="buildings-${settlement.id}"></div>
        ${routesHtml}
        ${garrisonHtml}
    `;
    
    const buildingsDiv = card.querySelector(`#buildings-${settlement.id}`);
    for (let building of settlement.buildings) {
        const buildingDiv = document.createElement('div');
        buildingDiv.className = 'building-item';
        if (building.completed) {
            const upgradeAvailable = (building.level === 1 && (typeof buildingsCatalog !== 'undefined') && buildingsCatalog[building.baseName] && buildingsCatalog[building.baseName].upgrade);
            const upgradeBtn = upgradeAvailable ? `<button class="upgrade-btn" data-settlement="${settlement.id}" data-building-id="${building.id}" style="font-size:0.7rem; padding:2px 6px;">🔧 Улучшить</button>` : '';
            buildingDiv.innerHTML = `<span class="building-name">✅ ${escapeHtml(building.name)} (ур.${building.level})</span>${upgradeBtn}`;
        } else {
            const totalTime = (typeof buildingsCatalog !== 'undefined' && buildingsCatalog[building.baseName]) ? buildingsCatalog[building.baseName].buildTime : 3;
            const remaining = building.remainingTurns;
            const percent = ((totalTime - remaining) / totalTime) * 100;
            buildingDiv.innerHTML = `<span class="building-name">🔨 ${escapeHtml(building.name)}</span><div style="display:flex; align-items:center; gap:8px;"><div class="building-progress"><div class="building-progress-fill" style="width: ${percent}%;"></div></div><span>${remaining} ход(ов)</span></div>`;
        }
        buildingsDiv.appendChild(buildingDiv);
    }
    if (freeSlots > 0) {
        const freeSlotDiv = document.createElement('div');
        freeSlotDiv.className = 'free-slot';
        freeSlotDiv.innerText = `Свободно слотов: ${freeSlots}`;
        buildingsDiv.appendChild(freeSlotDiv);
    } else if (usedSlots === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'free-slot';
        emptyDiv.innerText = 'Нет построек. Нажмите "Строить".';
        buildingsDiv.appendChild(emptyDiv);
    }
    container.appendChild(card);
}

// ========================================================================
// ОБНОВЛЁННАЯ ФУНКЦИЯ showBuildingSelector с фильтрацией и категориями
// ========================================================================
function showBuildingSelector(settlementId) {
    const data = (typeof provincesData !== 'undefined') ? provincesData[currentProvince] : null;
    if (!data) return;
    const settlement = data.settlements.find(s => s.id === settlementId);
    if (!settlement) return;
    
    const maxSlots = getMaxSlotsForSettlement(settlement, settlementId);
    const usedSlots = settlement.buildings.length;
    if (usedSlots >= maxSlots) {
        addBuildingsLog(`В поселении "${settlement.name}" нет свободных слотов${getVassalForSettlement(settlementId) ? ' (вассал, максимум 50%)' : ''}.`);
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'building-modal';
    modal.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:#1f1c14; border:2px solid #b87c4f; border-radius:24px; padding:20px; z-index:2000; display:flex; flex-direction:column; gap:8px; max-width:600px; width:90%; max-height:80vh; overflow-y:auto;';
    
    let html = `<h3>Выберите постройку для ${escapeHtml(settlement.name)}</h3>`;
    html += `<div><label>Категория: <select id="buildCategoryFilter">
        <option value="all">Все</option>
        <option value="resource">🌳 Ресурсные</option>
        <option value="military">⚔️ Военные</option>
        <option value="economic">💰 Экономические</option>
        <option value="religious">⛪ Религиозные</option>
    </select></label></div><div id="buildingList" style="display:flex; flex-direction:column; gap:5px; margin-top:10px;"></div>`;
    modal.innerHTML = html;
    document.body.appendChild(modal);

    function renderBuildings(filterCategory) {
        const list = document.getElementById('buildingList');
        list.innerHTML = '';
        // Проверка лимита строек
        const constructionCount = peopleState.activeConstructionCount || 0;
        const maxSlots = peopleState.maxConstructionSlots || 2;
        const atLimit = constructionCount >= maxSlots;

        for (let [key, b] of Object.entries(buildingsCatalog)) {
            if (filterCategory !== 'all' && b.category !== filterCategory) continue;
            // Проверка типа поселения
            if (b.allowedSettlementTypes && !b.allowedSettlementTypes.includes(settlement.type)) continue;
            // Проверка лимита строек – если лимит достигнут, кнопка недоступна
            const disabled = atLimit ? 'disabled' : '';
            const btn = document.createElement('button');
            btn.textContent = `${b.name} (${b.buildTime} хода) – стоимость: 🪵${b.cost.wood} 🪨${b.cost.stone} ⚙️${b.cost.iron} 👑${b.cost.gold} 💰${b.cost.ers}`;
            btn.style.margin = '4px 0';
            btn.disabled = atLimit;
            if (atLimit) {
                btn.style.opacity = '0.5';
                btn.title = 'Достигнут лимит одновременных строек (2)';
            }
            btn.addEventListener('click', () => {
                if (atLimit) {
                    addBuildingsLog('❌ Достигнут лимит одновременных строек (2). Дождитесь завершения текущих.');
                    return;
                }
                startBuilding(settlementId, key, false, null);
                document.body.removeChild(modal);
            });
            list.appendChild(btn);
        }
        if (atLimit) {
            const info = document.createElement('div');
            info.style.cssText = 'color:#ffd966; text-align:center; margin:8px 0;';
            info.textContent = `⚠️ Лимит строек: ${constructionCount}/${maxSlots}. Дождитесь завершения.`;
            list.appendChild(info);
        }
    }

    renderBuildings('all');
    document.getElementById('buildCategoryFilter').addEventListener('change', function() {
        renderBuildings(this.value);
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Отмена';
    cancelBtn.style.background = '#7a2a2a';
    cancelBtn.addEventListener('click', () => document.body.removeChild(modal));
    modal.appendChild(cancelBtn);
}

// ========================================================================
// ОБНОВЛЁННАЯ ФУНКЦИЯ startBuilding с проверками
// ========================================================================
function startBuilding(settlementId, buildingName, isUpgrade = false, baseBuilding = null) {
    const data = (typeof provincesData !== 'undefined') ? provincesData[currentProvince] : null;
    if (!data) return;
    const settlement = data.settlements.find(s => s.id === settlementId);
    if (!settlement) return;
    
    const maxSlots = getMaxSlotsForSettlement(settlement, settlementId);
    const usedSlots = settlement.buildings.length;
    if (!isUpgrade && usedSlots >= maxSlots) {
        addBuildingsLog(`В поселении "${settlement.name}" нет свободных слотов${getVassalForSettlement(settlementId) ? ' (вассал, максимум 50%)' : ''}.`);
        return;
    }
    
    const buildingDef = (typeof buildingsCatalog !== 'undefined') ? buildingsCatalog[buildingName] : null;
    if (!buildingDef) {
        addBuildingsLog(`❌ Постройка "${buildingName}" не найдена в каталоге.`);
        return;
    }

    // ----- ПРОВЕРКА ЛИМИТА ОДНОВРЕМЕННЫХ СТРОЕК -----
    const constructionCount = peopleState.activeConstructionCount || 0;
    const maxConstr = peopleState.maxConstructionSlots || 2;
    if (constructionCount >= maxConstr) {
        addBuildingsLog(`❌ Достигнут лимит одновременных строек (${maxConstr}). Дождитесь завершения текущих.`);
        return;
    }

    // ----- ПРОВЕРКА ТИПА ПОСЕЛЕНИЯ -----
    if (buildingDef.allowedSettlementTypes && !buildingDef.allowedSettlementTypes.includes(settlement.type)) {
        const typeMap = { city: 'городе', castle: 'замке', village: 'деревне' };
        addBuildingsLog(`❌ Постройка "${buildingDef.name}" не может быть построена в ${typeMap[settlement.type] || settlement.type}.`);
        return;
    }

    // ----- РЕЛИГИОЗНЫЕ ОГРАНИЧЕНИЯ -----
    // Собираем все завершённые постройки в провинции
    const allBuildings = data.settlements.flatMap(s => s.buildings.map(b => b.baseName || b.name));
    const allCompletedBuildings = data.settlements.flatMap(s => s.buildings.filter(b => b.completed).map(b => b.baseName || b.name));
    const allCompletedSpecial = data.settlements.flatMap(s => s.buildings.filter(b => b.completed).map(b => b.special));

    // 1. Алтарь и Святилище не могут быть в одной провинции, если нет Храма Варситэи или Пантеона
    if (buildingName === "Алтарь Варсиса") {
        const hasSanctuary = allCompletedBuildings.includes("Святилище Тэямы");
        const hasTempleVarsiteya = allCompletedBuildings.includes("Храм Варситэи");
        const hasPantheon = allCompletedBuildings.includes("Пантеон");
        if (hasSanctuary && !hasTempleVarsiteya && !hasPantheon) {
            addBuildingsLog("❌ Нельзя построить Алтарь Варсиса в провинции, где уже есть Святилище Тэямы (без Храма Варситэи или Пантеона).");
            return;
        }
    }
    if (buildingName === "Святилище Тэямы") {
        const hasAltar = allCompletedBuildings.includes("Алтарь Варсиса");
        const hasTempleVarsiteya = allCompletedBuildings.includes("Храм Варситэи");
        const hasPantheon = allCompletedBuildings.includes("Пантеон");
        if (hasAltar && !hasTempleVarsiteya && !hasPantheon) {
            addBuildingsLog("❌ Нельзя построить Святилище Тэямы в провинции, где уже есть Алтарь Варсиса (без Храма Варситэи или Пантеона).");
            return;
        }
    }

    // 2. Храм Варситэи – только один на фракцию, требует Алтаря или Святилища
    if (buildingName === "Храм Варситэи") {
        // Проверяем, есть ли уже такой храм у фракции
        const provinces = getCurrentFactionProvinces();
        for (let pid of provinces) {
            const provData = provincesData[pid];
            if (!provData) continue;
            for (let s of provData.settlements) {
                if (s.buildings.some(b => b.name === "Храм Варситэи" && b.completed)) {
                    addBuildingsLog("❌ Храм Варситэи уже построен в другой провинции (только один на фракцию).");
                    return;
                }
            }
        }
        // Проверяем наличие Алтаря или Святилища (в любой провинции фракции)
        let hasParent = false;
        for (let pid of provinces) {
            const provData = provincesData[pid];
            if (!provData) continue;
            for (let s of provData.settlements) {
                if (s.buildings.some(b => (b.special === "altarVarsis" || b.special === "sanctuaryTeama") && b.completed)) {
                    hasParent = true;
                    break;
                }
            }
            if (hasParent) break;
        }
        if (!hasParent) {
            addBuildingsLog("❌ Для строительства Храма Варситэи требуется наличие Алтаря Варсиса или Святилища Тэямы.");
            return;
        }
    }

    // 3. Пантеон – только один на фракцию, требует наличия хотя бы одной религиозной постройки
    if (buildingName === "Пантеон") {
        const provinces = getCurrentFactionProvinces();
        for (let pid of provinces) {
            const provData = provincesData[pid];
            if (!provData) continue;
            for (let s of provData.settlements) {
                if (s.buildings.some(b => b.name === "Пантеон" && b.completed)) {
                    addBuildingsLog("❌ Пантеон уже построен в другой провинции (только один на фракцию).");
                    return;
                }
            }
        }
        let hasReligious = false;
        for (let pid of provinces) {
            const provData = provincesData[pid];
            if (!provData) continue;
            for (let s of provData.settlements) {
                if (s.buildings.some(b => b.completed && (b.category === "religious" || b.special === "altarVarsis" || b.special === "sanctuaryTeama" || b.special === "templeVarsiteya"))) {
                    hasReligious = true;
                    break;
                }
            }
            if (hasReligious) break;
        }
        if (!hasReligious) {
            addBuildingsLog("❌ Для строительства Пантеона требуется хотя бы одна религиозная постройка (Алтарь, Святилище или Храм).");
            return;
        }
    }
    // ----- КОНЕЦ РЕЛИГИОЗНЫХ ОГРАНИЧЕНИЙ -----

    // ----- ОПРЕДЕЛЯЕМ СТОИМОСТЬ И ВРЕМЯ -----
    let cost, buildTime, level = 1, name = buildingName;
    if (isUpgrade && baseBuilding) {
        const upgradeDef = buildingsCatalog[baseBuilding.baseName]?.upgrade;
        if (!upgradeDef) { addBuildingsLog(`❌ Улучшение для ${baseBuilding.name} не определено.`); return; }
        cost = upgradeDef.cost;
        buildTime = upgradeDef.buildTime;
        level = 2;
        name = upgradeDef.name || `${baseBuilding.name} (улучшенная)`;
    } else {
        cost = buildingDef.cost;
        buildTime = buildingDef.buildTime;
        name = buildingDef.name;
    }

    // ----- ПРОВЕРКА НАЛИЧИЯ РЕСУРСОВ -----
    const res = data.resources;
    if (res.wood < cost.wood || res.stone < cost.stone || res.iron < cost.iron || res.gold < cost.gold || res.ers < cost.ers) {
        addBuildingsLog(`❌ Недостаточно ресурсов для ${isUpgrade ? 'улучшения' : 'строительства'} "${name}".`);
        return;
    }

    // ----- СПИСЫВАЕМ РЕСУРСЫ -----
    res.wood -= cost.wood;
    res.stone -= cost.stone;
    res.iron -= cost.iron;
    res.gold -= cost.gold;
    res.ers -= cost.ers;

    // ----- ДОБАВЛЯЕМ В ОЧЕРЕДЬ СТРОИТЕЛЬСТВА -----
    if (isUpgrade && baseBuilding) {
        const idx = settlement.buildings.findIndex(b => b.id === baseBuilding.id);
        if (idx !== -1) {
            settlement.buildings[idx] = {
                id: baseBuilding.id,
                name: name,
                completed: false,
                remainingTurns: buildTime,
                level: level,
                baseName: baseBuilding.baseName || buildingName,
                isUpgrade: true,
                income: buildingDef.income || {},
                special: buildingDef.special || null,
                category: buildingDef.category || null
            };
        }
    } else {
        settlement.buildings.push({
            id: (typeof generateId === 'function') ? generateId() : Date.now() + '-' + Math.random(),
            name: name,
            completed: false,
            remainingTurns: buildTime,
            level: level,
            baseName: buildingName,
            income: buildingDef.income || {},
            special: buildingDef.special || null,
            category: buildingDef.category || null,
            isUpgrade: false
        });
    }

    // ----- УВЕЛИЧИВАЕМ СЧЁТЧИК СТРОЕК -----
    peopleState.activeConstructionCount = (peopleState.activeConstructionCount || 0) + 1;
    if (typeof refreshPeopleUI === 'function') refreshPeopleUI();

    addBuildingsLog(`${isUpgrade ? 'Улучшение' : 'Строительство'} "${name}" начато в "${settlement.name}". Затрачено ресурсов. (Активных строек: ${peopleState.activeConstructionCount})`);
    saveAllData();
    refreshBuildingsUI();
    updateGlobalResourcesDisplay();
}

// ========================================================================
// ОБНОВЛЁННАЯ ФУНКЦИЯ processConstruction – завершение строек
// ========================================================================
function processConstruction() {
    let completedCount = 0;
    for (let pid in provincesData) {
        const prov = provincesData[pid];
        if (!prov) continue;
        for (let settlement of prov.settlements) {
            for (let building of settlement.buildings) {
                if (!building.completed && building.remainingTurns > 0) {
                    building.remainingTurns--;
                    if (building.remainingTurns === 0) {
                        building.completed = true;
                        delete building.remainingTurns;
                        if (building.isUpgrade) delete building.isUpgrade;
                        completedCount++;
                        // Уменьшаем счётчик активных строек
                        peopleState.activeConstructionCount = Math.max(0, (peopleState.activeConstructionCount || 0) - 1);
                        addBuildingsLog(`🏗️ В провинции "${(typeof PROVINCE_NAMES !== 'undefined' && PROVINCE_NAMES[pid]) ? PROVINCE_NAMES[pid] : pid}" завершено строительство "${building.name}" в "${settlement.name}". (Активных строек: ${peopleState.activeConstructionCount})`);
                    }
                }
            }
        }
    }
    if (completedCount > 0 && typeof refreshPeopleUI === 'function') refreshPeopleUI();
}

// ========================================================================
// ОБНОВЛЁННАЯ ФУНКЦИЯ collectResources с бонусами от Кузницы
// ========================================================================
function collectResources() {
    for (let pid in provincesData) {
        const prov = provincesData[pid];
        if (!prov) continue;

        // Бонус дварфов (оставляем как есть)
        let dwarfBonus = 1.0;
        if (prov.races) {
            const dwarves = prov.races.find(r => r.name === "Дварфы");
            if (dwarves) {
                const totalDwarves = (typeof getRaceTotal === 'function') ? getRaceTotal(dwarves) : (dwarves.adultMale + dwarves.adultFemale + dwarves.children + dwarves.elders);
                const bonusPer1000 = dwarves.economyBonus?.stone || 0.1;
                dwarfBonus = 1 + Math.floor(totalDwarves / 1000) * bonusPer1000;
            }
        }

        // Модификаторы от Кузницы (для всей провинции)
        let ironModifier = 1.0;
        let goldModifier = 1.0;
        for (let settlement of prov.settlements) {
            for (let building of settlement.buildings) {
                if (building.completed) {
                    if (building.special === "ironBonus20") ironModifier = 1.2;
                    if (building.special === "goldBonus20") goldModifier = 1.2; // улучшенная кузница даёт бонус к золоту
                }
            }
        }

        let stoneIncome = 0;
        let ironIncome = 0;

        for (let settlement of prov.settlements) {
            for (let building of settlement.buildings) {
                if (building.completed && building.income) {
                    let woodInc = building.income.wood || 0;
                    let stoneInc = building.income.stone || 0;
                    let ironInc = building.income.iron || 0;
                    let goldInc = building.income.gold || 0;

                    // Применяем бонус дварфов к камню и железу
                    if (stoneInc > 0) stoneInc = Math.floor(stoneInc * dwarfBonus);
                    if (ironInc > 0) ironInc = Math.floor(ironInc * dwarfBonus);

                    // Применяем бонусы Кузницы
                    if (ironInc > 0) ironInc = Math.floor(ironInc * ironModifier);
                    if (goldInc > 0) goldInc = Math.floor(goldInc * goldModifier);

                    prov.resources.wood += woodInc;
                    prov.resources.stone += stoneInc;
                    prov.resources.iron += ironInc;
                    prov.resources.gold += goldInc;

                    stoneIncome += stoneInc;
                    ironIncome += ironInc;
                }
            }
        }

        if (ironModifier > 1.0 && ironIncome > 0) {
            addGlobalLog(`🔧 Кузница увеличила добычу железа на ${Math.round((ironModifier-1)*100)}% в ${(typeof PROVINCE_NAMES !== 'undefined' && PROVINCE_NAMES[pid]) ? PROVINCE_NAMES[pid] : pid}.`, 'general');
        }
        if (goldModifier > 1.0 && goldModifier !== ironModifier) {
            // логируем только если бонус от улучшенной кузницы
        }
    }
}

function renderCatalog() {
    const container = document.getElementById('buildingsCatalog');
    if (!container) return;
    container.innerHTML = '';
    for (let [key, building] of Object.entries(buildingsCatalog)) {
        const card = document.createElement('div');
        card.className = 'building-card';
        card.innerHTML = `<h3>${escapeHtml(building.name)}</h3><div>${escapeHtml(building.description)}</div><div class="building-cost">💰 Стоимость: 🪵${building.cost.wood} 🪨${building.cost.stone} ⚙️${building.cost.iron} 👑${building.cost.gold} 💰${building.cost.ers}</div><div>⏱️ Время: ${building.buildTime} хода(ов)</div>`;
        container.appendChild(card);
    }
}

function addSettlement() {
    const data = (typeof provincesData !== 'undefined') ? provincesData[currentProvince] : null;
    if (!data) return;
    const newName = `Поселение ${data.settlements.length + 1}`;
    const newSettlement = createSettlement(newName, "village");
    data.settlements.push(newSettlement);
    addBuildingsLog(`Добавлено новое поселение "${newName}" (деревня).`);
    saveAllData();
    refreshBuildingsUI();
}

function removeLastSettlement() {
    const data = (typeof provincesData !== 'undefined') ? provincesData[currentProvince] : null;
    if (!data) return;
    if (data.settlements.length <= 1) { addBuildingsLog(`Нельзя удалить последнее поселение.`); return; }
    const removed = data.settlements.pop();
    addBuildingsLog(`Удалено поселение "${removed.name}".`);
    saveAllData();
    refreshBuildingsUI();
}

function resetProvinceResources() {
    const data = (typeof provincesData !== 'undefined') ? provincesData[currentProvince] : null;
    if (!data) return;
    data.resources = { wood: 500, stone: 300, iron: 200, gold: 10, ers: 5000 };
    addBuildingsLog(`Ресурсы провинции сброшены до начальных.`);
    saveAllData();
    refreshBuildingsUI();
    updateGlobalResourcesDisplay();
}

function addBuildingsLog(msg) {
    const dateStr = (typeof getCurrentDateString === 'function') ? getCurrentDateString() : "дата";
    const logDiv = document.getElementById('buildingsLogPanel');
    if (logDiv) {
        logDiv.innerHTML = `<div class="log-entry">[${dateStr}] 🏗️ ${escapeHtml(msg)}</div>` + logDiv.innerHTML;
        while (logDiv.children.length > 30) logDiv.removeChild(logDiv.lastChild);
    }
    saveAllData();
}

// ========================================================================
// ОБНОВЛЁННАЯ ФУНКЦИЯ exchangeGold с курсами 1200 и 1700
// ========================================================================
function exchangeGold() {
    const data = (typeof provincesData !== 'undefined') ? provincesData[currentProvince] : null;
    if (!data) {
        addBuildingsLog(`❌ Нет данных о текущей провинции.`);
        return;
    }
    let mintRate = 100; // базовый курс
    for (let settlement of data.settlements) {
        for (let b of settlement.buildings) {
            if (b.completed && b.special === "coinExchange1200") mintRate = 1200;
            if (b.completed && b.special === "coinExchange1700") mintRate = 1700;
        }
    }
    if (data.resources.gold <= 0) {
        addBuildingsLog(`❌ Нет золота для обмена.`);
        return;
    }
    const maxGold = data.resources.gold;
    const input = prompt(`Введите количество золота для обмена (доступно: ${maxGold}, курс ${mintRate} эрсов за 1 золото):`, "1");
    if (input === null) return; // отмена
    const amount = parseInt(input);
    if (isNaN(amount) || amount <= 0) {
        addBuildingsLog(`❌ Некорректное количество.`);
        return;
    }
    const actualAmount = Math.min(amount, maxGold);
    const gained = actualAmount * mintRate;
    data.resources.gold -= actualAmount;
    data.resources.ers += gained;
    addBuildingsLog(`💰 Обменяно ${actualAmount} золота на ${gained} эрсов (курс ${mintRate}).`);
    saveAllData();
    refreshBuildingsUI();
    updateGlobalResourcesDisplay();
}

// ========== 5. ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ==========

function refreshBuildingsUI() {
    if (typeof updateProvinceSelect === 'function') updateProvinceSelect();
    if (typeof renderResources === 'function') renderResources();
    if (typeof renderSettlements === 'function') renderSettlements();
    if (typeof renderCatalog === 'function') renderCatalog();
    // Обновляем информацию о количестве строек в UI
    if (typeof refreshPeopleUI === 'function') refreshPeopleUI();
    console.log("🔄 Интерфейс построек обновлён");
}

// ===== Ручная установка ресурсов =====
function setManualResources() {
    const data = provincesData[currentProvince];
    if (!data) {
        addBuildingsLog('❌ Нет данных о текущей провинции.');
        return;
    }
    const wood = parseInt(document.getElementById('manualWood').value);
    const stone = parseInt(document.getElementById('manualStone').value);
    const iron = parseInt(document.getElementById('manualIron').value);
    const gold = parseInt(document.getElementById('manualGold').value);
    const ers = parseInt(document.getElementById('manualErs').value);
    if (!isNaN(wood)) data.resources.wood = wood;
    if (!isNaN(stone)) data.resources.stone = stone;
    if (!isNaN(iron)) data.resources.iron = iron;
    if (!isNaN(gold)) data.resources.gold = gold;
    if (!isNaN(ers)) data.resources.ers = ers;
    updateGlobalResourcesDisplay();
    addBuildingsLog(`📦 Ресурсы провинции "${PROVINCE_NAMES[currentProvince] || currentProvince}" изменены вручную.`);
    if (typeof renderProvinceDashboard === 'function') renderProvinceDashboard();
    saveAllData();
}
window.setManualResources = setManualResources;

console.log("✅ 09_buildings.js загружен — версия 5.0 (все новые механики интегрированы)");