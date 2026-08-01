// ============================================================================
// МОДУЛЬ 09: buildings.js (версия 6.0 – финальная)
// Полный перезаписанный файл с учётом всех правок.
// ============================================================================
// Загружено на гитхаб 01.08.2026
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
    "great_wall": "Великий Вал",
	"house_tokosi": "Род Токоси",
	"house_segawa": "Род Сэгава",
	"house_yamano": "Род Ямано",
	"house_fujii": "Род Фудзии",
	"house_hatamoto_a": "Род Кейкай",
	"house_hatamoto_b": "Род Сакуга",
	"house_hatamoto_c": "Род Икко",
	"house_hatamoto_d": "Род Крейгов",
	"house_narnwyn": "Род Нарнуин",
	"house_gerondo": "Род Герондо",
	"house_stettov": "Род Штеттов",
	"house_krieger": "Род Кригер",
	"house_waldhof": "Род Вальдхоф",
	"house_montbrun": "Род Монбрун",
	"house_kilogan": "Род Килоган",
	"house_castelmor": "Род Кастельмор",
	"house_heim": "Род Хейм",
	"house_drakwald": "Род Дрейквальд",
	"house_boncraig": "Род Бонкрейг",
	"house_wolfhart": "Род Вульфхарт",
	"house_ippon": "Род Иппон",
	"house_cald": "Род Кальдов",
	"house_valdgreiv": "Род Вальдгрейв",
	"house_morven": "Род Морвен",
	"house_sternberg": "Род Линденфельд",
	"house_eisenhart": "Род Блюменау",
	"house_waldstein": "Род Айхендорф",
	"house_levenwolf": "Род Вайсенбах",
	"house_drachenfels": "Род Розенхайм",
	"house_storm": "Род Мюленгрунд",
	"house_bah": "Род Бах",
	"house_drahenfels": "Род Драхенфельс",
	"house_vind": "Род Винд",
	"house_mastereno": "Род Мастерэно",
	"house_vervut": "Род Вервут",
	"house_violette": "Род Виолетт",
	"house_iriswain": "Род Ирисвейн",
	"house_De_Rosa": "Род Де Розе",
	"house_sakada": "Род Сакада",
	"house_gimadzu": "Род Гимадзу",
	"house_fraum": "Род Фраум",
	"house_ion": "Род Йон",
	"house_mensen_merchant_guild": "Купеческая гильдия Менсена"
};

function getVassalForSettlement(settlementId) {
    // Сначала ищем в данных провинций (учитывает ручные передачи)
    for (let pid in provincesData) {
        const prov = provincesData[pid];
        if (prov && prov.settlements) {
            const settlement = prov.settlements.find(s => s.id === settlementId);
            if (settlement) {
                // Если vassalHouse определён (даже null), возвращаем его
                if (settlement.vassalHouse !== undefined) {
                    return settlement.vassalHouse || null;
                }
            }
        }
    }
    // Если не нашли в provincesData, смотрим в SETTLEMENTS_DB (исходное состояние)
    if (typeof SETTLEMENTS_DB !== 'undefined') {
        const dbSettlement = SETTLEMENTS_DB[settlementId];
        if (dbSettlement && dbSettlement.isVassal && dbSettlement.vassalHouse) {
            return dbSettlement.vassalHouse;
        }
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
        maxSlots = Math.floor(maxSlots * 0.5);
    }
    return maxSlots;
}

// ========== 2. ИНИЦИАЛИЗАЦИЯ ==========

function createSettlement(name, type) {
    return {
        id: (typeof generateId === 'function') ? generateId() : Date.now() + '-' + Math.random(),
        name: name,
        type: type,
        buildings: [],
        captured: false,
        capturedByFaction: null,
        capturedData: null
    };
}

// ========== 3. ФУНКЦИИ ОБЩЕЙ КАЗНЫ ==========

function getFactionTreasury() {
    return window.factionTreasury || 0;
}

function setFactionTreasury(amount) {
    window.factionTreasury = amount;
}

function recalcTotalTreasury() {
    let total = 0;
    for (let pid in provincesData) {
        total += provincesData[pid].resources?.ers || 0;
    }
    window.factionTreasury = total;
}

// ========== 4. РЕСУРСЫ ФРАКЦИИ ==========

function getTotalResources() {
    const total = {};
    // Инициализируем все известные ресурсы нулями
    if (typeof RESOURCES_REGISTRY !== 'undefined') {
        for (let key in RESOURCES_REGISTRY) {
            total[key] = 0;
        }
    }
    // Суммируем ресурсы всех провинций
    for (let pid in provincesData) {
        const res = provincesData[pid].resources;
        if (res) {
            for (let key in total) {
                total[key] += res[key] || 0;
            }
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

// ========== 5. ПОСЕЛЕНИЯ И ПОСТРОЙКИ ==========

function updateProvinceSelect() {
    const select = document.getElementById('currentProvinceSelect');
    if (!select) return;
    const allIds = Object.keys(provincesData).sort((a, b) => {
        if (provincesData[a].isCapital) return -1;
        if (provincesData[b].isCapital) return 1;
        return a.localeCompare(b);
    });
    select.innerHTML = '';
    for (let pid of allIds) {
        const name = (PROVINCE_NAMES[pid] || pid);
        const isCapital = provincesData[pid].isCapital;
        const option = document.createElement('option');
        option.value = pid;
        option.textContent = `${name}${isCapital ? ' ⭐' : ''}`;
        if (pid === currentProvince) option.selected = true;
        select.appendChild(option);
    }
    select.onchange = () => {
        currentProvince = select.value;
        refreshBuildingsUI();
        if (typeof refreshPeopleUI === 'function') refreshPeopleUI();
        addGlobalLog(`📍 Переключено на провинцию: ${PROVINCE_NAMES[currentProvince] || currentProvince}`, 'general');
    };
}

// ========== 6. ОТРИСОВКА ПОСЕЛЕНИЙ ==========

function renderSettlements() {
    const data = provincesData[currentProvince];
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
    document.querySelectorAll('.capture-settlement-btn').forEach(btn => {
        btn.addEventListener('click', () => captureSettlement(btn.getAttribute('data-id')));
    });
    document.querySelectorAll('.liberate-settlement-btn').forEach(btn => {
        btn.addEventListener('click', () => liberateSettlement(btn.getAttribute('data-id')));
    });
}

function createCollapsibleGroup(title, settlements) {
    const wrapper = document.createElement('div');
    wrapper.className = 'settlements-group';
    wrapper.style.cssText = 'margin-bottom: 15px; border: 1px solid #b87c4f; border-radius: 16px; overflow: hidden;';
    const header = document.createElement('div');
    header.className = 'group-header';
    header.style.cssText = 'background: #2a2418; padding: 10px 15px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-weight: bold;';
    header.innerHTML = `<span>${title}</span><span class="group-toggle" style="font-size: 1.2rem;">▶</span>`;
    const content = document.createElement('div');
    content.className = 'group-content';
    // Временно ставим grid, но сразу после – скроем
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

    let collapsed = true;
    // Начальное состояние – свёрнуто
    content.style.display = 'none';

    header.addEventListener('click', () => {
        collapsed = !collapsed;
        content.style.display = collapsed ? 'none' : 'grid';
        const toggle = header.querySelector('.group-toggle');
        if (toggle) toggle.innerHTML = collapsed ? '▶' : '▼';
    });
    return wrapper;
}

function renderSettlementCard(settlement, container) {
    // Проверяем, что settlement и container существуют
    if (!settlement || !container) return;

    // Безопасно получаем тип поселения
    const typeInfo = (typeof SETTLEMENT_TYPES !== 'undefined' && SETTLEMENT_TYPES[settlement.type]) 
        ? SETTLEMENT_TYPES[settlement.type] 
        : { name: settlement.type || 'Поселение', slots: 3 };
    const maxSlots = getMaxSlotsForSettlement(settlement, settlement.id);
    const usedSlots = settlement.buildings.length;
    const freeSlots = maxSlots - usedSlots;
    const vassalId = getVassalForSettlement(settlement.id);
    const isVassal = !!vassalId;
    const isCaptured = settlement.captured === true;

    let vassalBadge = '';
    let cardStyle = '';
    if (isVassal) {
        const vassalName = getVassalNameById(vassalId);
        vassalBadge = `<div class="vassal-badge" style="background:#3a2a1c; border-radius:12px; padding:2px 8px; font-size:0.7rem; display:inline-block; margin-left:8px;">🛡️ Вассал: ${escapeHtml(vassalName)}</div>`;
        cardStyle = 'border-left: 4px solid #b8860b;';
    }
    if (isCaptured) {
        cardStyle += ' border: 2px solid #ff4444; opacity: 0.8;';
    }

    const slotInfo = isVassal ? `(вассал, 50% слотов: ${usedSlots}/${maxSlots})` : `${usedSlots}/${maxSlots}`;
    let captureBtn = '';
    if (!isCaptured) {
        captureBtn = `<button class="capture-settlement-btn" data-id="${settlement.id}" style="background:#7a2a2a; padding:2px 8px; font-size:0.7rem;">🏴 Захвачено</button>`;
    } else {
        captureBtn = `<button class="liberate-settlement-btn" data-id="${settlement.id}" style="background:#3a6b3a; padding:2px 8px; font-size:0.7rem;">🕊️ Освободить</button>`;
    }
    let capturedPlack = '';
    if (isCaptured) {
        capturedPlack = `<div style="background:#ff4444; color:white; padding:2px 8px; border-radius:8px; font-size:0.8rem; margin-top:5px;">⚔️ Захвачено врагом</div>`;
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
                ${capturedPlack}
            </div>
            <div class="slots-info">
                📦 Слоты: ${slotInfo}
                ${!isCaptured && freeSlots > 0 ? `<button class="build-btn" data-id="${settlement.id}" style="font-size:0.7rem; padding:2px 8px;">🏗️ Строить</button>` : ''}
                <button onclick="openSettlementEditModal('${settlement.id}')" style="font-size:0.7rem; padding:2px 8px;">✏️</button>
                ${captureBtn}
            </div>
        </div>
        <div class="buildings-list" id="buildings-${settlement.id}"></div>
    `;
    const buildingsDiv = card.querySelector(`#buildings-${settlement.id}`);

    // --- Строящееся поселение (completed === false) ---
    if (settlement.completed === false) {
        const totalTime = settlement.remainingTurns || 0;
        const current = (settlement.totalBuildTime || totalTime) - totalTime;
        const percent = totalTime > 0 ? Math.floor((current / (settlement.totalBuildTime || totalTime)) * 100) : 0;
        const buildingDiv = document.createElement('div');
        buildingDiv.className = 'building-item';
        buildingDiv.innerHTML = `
            <span class="building-name">🏗️ Строится поселение (${escapeHtml(settlement.name)})</span>
            <div style="display:flex; align-items:center; gap:8px;">
                <div class="building-progress"><div class="building-progress-fill" style="width: ${percent}%;"></div></div>
                <span>${totalTime} ход(ов)</span>
            </div>
        `;
        buildingsDiv.appendChild(buildingDiv);
        container.appendChild(card);
        return;   // ← РАННИЙ ВЫХОД: не обрабатываем здания, пока поселение не готово
    }

    // --- Обычные здания (поселение уже построено) ---
    for (let building of settlement.buildings) {
        const buildingDiv = document.createElement('div');
        buildingDiv.className = 'building-item';
        const isActive = !isCaptured && building.completed;

        if (isActive) {
			const upgradeAvailable = (building.level === 1 && (typeof buildingsCatalog !== 'undefined') && buildingsCatalog[building.baseName] && buildingsCatalog[building.baseName].upgrade);
			const upgradeBtn = upgradeAvailable && !isCaptured ? `<button class="upgrade-btn" data-settlement="${settlement.id}" data-building-id="${building.id}" style="font-size:0.7rem; padding:2px 6px;">🔧 Улучшить</button>` : '';
			const demolishBtn = `<button class="demolish-btn" data-settlement-id="${settlement.id}" data-building-id="${building.id}" style="background:#7a2a2a; padding:2px 6px; font-size:0.6rem; margin-left:4px;" title="Снести (1 ход)">🏚️ Снести</button>`;
			
			if (building.isDummy) {
				buildingDiv.innerHTML = `<span class="building-name" style="opacity:0.5; text-decoration: line-through;">🚫 ${escapeHtml(building.name)} (неактивна)</span>
					<button class="detail-building-btn" data-building-id="${building.id}" data-settlement-id="${settlement.id}" style="font-size:0.7rem; padding:2px 6px;">🔍 Подробнее</button>`;
			} else {
				buildingDiv.innerHTML = `<span class="building-name">✅ ${escapeHtml(building.name)} (ур.${building.level})</span>
					<button class="detail-building-btn" data-building-id="${building.id}" data-settlement-id="${settlement.id}" style="font-size:0.7rem; padding:2px 6px;">🔍 Подробнее</button>
					${upgradeBtn}
					${demolishBtn}`;
			}
		} else if (!building.completed) {
			const totalTime = (typeof buildingsCatalog !== 'undefined' && buildingsCatalog[building.baseName]) ? buildingsCatalog[building.baseName].buildTime : 3;
			const remaining = building.remainingTurns;
			const percent = ((totalTime - remaining) / totalTime) * 100;
			const isFrozen = building.frozen === true;
			const statusText = isFrozen ? '❄️ Заморожено' : `🔨 ${remaining} ход(ов)`;
			const progressColor = isFrozen ? '#88aaff' : '#ffd966';
			
			buildingDiv.innerHTML = `<span class="building-name">🔨 ${escapeHtml(building.name)}</span>
				<button class="detail-building-btn" data-building-id="${building.id}" data-settlement-id="${settlement.id}" style="font-size:0.7rem; padding:2px 6px;">🔍 Подробнее</button>
				<div style="display:flex; align-items:center; gap:8px;">
					<div class="building-progress"><div class="building-progress-fill" style="width: ${percent}%; background: ${progressColor};"></div></div>
					<span>${statusText}</span>
				</div>
				<div style="display:flex; gap:4px; margin-top:4px;">
					<button class="cancel-build-btn" data-settlement-id="${settlement.id}" data-building-id="${building.id}" style="background:#7a2a2a; padding:2px 6px; font-size:0.6rem;" title="Отменить (возврат 50%)">✖ Отменить</button>
					${isFrozen 
						? `<button class="unfreeze-build-btn" data-settlement-id="${settlement.id}" data-building-id="${building.id}" style="background:#3a6b3a; padding:2px 6px; font-size:0.6rem;" title="Разморозить">▶ Разморозить</button>`
						: `<button class="freeze-build-btn" data-settlement-id="${settlement.id}" data-building-id="${building.id}" style="background:#b8860b; padding:2px 6px; font-size:0.6rem;" title="Заморозить">⏸ Заморозить</button>`
					}
				</div>`;
		} else {
            buildingDiv.innerHTML = `<span class="building-name" style="opacity:0.5;">🚫 ${escapeHtml(building.name)} (захвачено)</span>
                <button class="detail-building-btn" data-building-id="${building.id}" data-settlement-id="${settlement.id}" style="font-size:0.7rem; padding:2px 6px;">🔍 Подробнее</button>`;
        }
        buildingsDiv.appendChild(buildingDiv);
    }

    if (!isCaptured && freeSlots > 0) {
        const freeSlotDiv = document.createElement('div');
        freeSlotDiv.className = 'free-slot';
        freeSlotDiv.innerText = `Свободно слотов: ${freeSlots}`;
        buildingsDiv.appendChild(freeSlotDiv);
    } else if (!isCaptured && usedSlots === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'free-slot';
        emptyDiv.innerText = 'Нет построек. Нажмите "Строить".';
        buildingsDiv.appendChild(emptyDiv);
    }

    container.appendChild(card);

    // Навешиваем обработчики для кнопок "Подробнее" внутри этой карточки
    card.querySelectorAll('.detail-building-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const buildingId = btn.dataset.buildingId;
            const settlementId = btn.dataset.settlementId;
            const settlement = provincesData[currentProvince]?.settlements.find(s => s.id === settlementId);
            const building = settlement?.buildings.find(b => b.id === buildingId);
            if (building && settlement) {
                showBuildingDetailForSettlement(building, settlement.name);
            }
        });
    });
}

// ========== 7. РАСПРЕДЕЛЕНИЕ НАСЕЛЕНИЯ ==========

function distributePopulation(race, amount) {
    const total = (race.adultMale || 0) + (race.adultFemale || 0) + (race.children || 0) + (race.elders || 0);
    if (total === 0) {
        const abs = Math.abs(amount);
        const adultMale = Math.floor(abs * 0.4);
        const adultFemale = Math.floor(abs * 0.4);
        const children = Math.floor(abs * 0.15);
        const elders = abs - adultMale - adultFemale - children;
        if (amount > 0) {
            race.adultMale = (race.adultMale || 0) + adultMale;
            race.adultFemale = (race.adultFemale || 0) + adultFemale;
            race.children = (race.children || 0) + children;
            race.elders = (race.elders || 0) + elders;
        } else {
            race.adultMale = Math.max(0, (race.adultMale || 0) - adultMale);
            race.adultFemale = Math.max(0, (race.adultFemale || 0) - adultFemale);
            race.children = Math.max(0, (race.children || 0) - children);
            race.elders = Math.max(0, (race.elders || 0) - elders);
        }
        return;
    }
    const factor = amount / total;
    race.adultMale = Math.max(0, Math.round((race.adultMale || 0) + (race.adultMale || 0) * factor));
    race.adultFemale = Math.max(0, Math.round((race.adultFemale || 0) + (race.adultFemale || 0) * factor));
    race.children = Math.max(0, Math.round((race.children || 0) + (race.children || 0) * factor));
    race.elders = Math.max(0, Math.round((race.elders || 0) + (race.elders || 0) * factor));
    const newTotal = race.adultMale + race.adultFemale + race.children + race.elders;
    const diff = Math.round(amount - (newTotal - total));
    if (diff !== 0 && race.adultMale + diff >= 0) {
        race.adultMale += diff;
    }
}

// ========== 8. ЗАХВАТ И ОСВОБОЖДЕНИЕ ==========

function captureSettlement(settlementId) {
    const data = provincesData[currentProvince];
    if (!data) return;
    const settlement = data.settlements.find(s => s.id === settlementId);
    if (!settlement || settlement.captured) return;

    const modal = document.createElement('div');
    modal.className = 'capture-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:2000;display:flex;justify-content:center;align-items:center';
    let buildingsHtml = '';
    for (let b of settlement.buildings) {
        buildingsHtml += `<div style="margin:5px 0;"><label><input type="checkbox" class="demolish-check" data-building-id="${b.id}"> ${b.completed ? '✅' : '🔨'} ${escapeHtml(b.name)}</label></div>`;
    }
    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:500px;width:90%;">
            <h3>🏴 Захват поселения: ${escapeHtml(settlement.name)}</h3>
            <p>Отметьте постройки, которые будут снесены:</p>
            <div style="max-height:300px; overflow-y:auto;">${buildingsHtml}</div>
            <div style="margin-top:15px; display:flex; gap:10px; justify-content:flex-end;">
                <button id="confirmDemolishBtn">Далее (блокировка населения)</button>
                <button id="cancelCaptureBtn" style="background:#7a2a2a;">Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('cancelCaptureBtn').addEventListener('click', () => modal.remove());
    document.getElementById('confirmDemolishBtn').addEventListener('click', () => {
        const checks = modal.querySelectorAll('.demolish-check:checked');
        const demolishIds = Array.from(checks).map(cb => cb.getAttribute('data-building-id'));
        settlement.buildings = settlement.buildings.filter(b => !demolishIds.includes(b.id));
        modal.remove();
        openPopulationBlockModal(settlement);
    });
}

function openPopulationBlockModal(settlement) {
    const races = getCurrentProvinceRaces();
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:2000;display:flex;justify-content:center;align-items:center';
    let racesHtml = '';
    for (let race of races) {
        const total = getRaceTotal(race);
        racesHtml += `<div style="margin:10px 0;"><span>${race.name} (всего: ${total.toLocaleString()})</span><input type="number" class="block-pop-input" data-race="${race.name}" value="0" min="0" max="${race.adultMale + race.adultFemale}" style="width:100px; margin-left:10px;"></div>`;
    }
    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:500px;width:90%;">
            <h3>🔒 Блокировка населения</h3>
            <p>Укажите, сколько людей каждой расы будет заблокировано:</p>
            <div style="max-height:300px; overflow-y:auto;">${racesHtml}</div>
            <div style="margin-top:15px; display:flex; gap:10px; justify-content:flex-end;">
                <button id="confirmBlockBtn">🏴 Захватить</button>
                <button id="cancelBlockBtn" style="background:#7a2a2a;">Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('cancelBlockBtn').addEventListener('click', () => modal.remove());
    document.getElementById('confirmBlockBtn').addEventListener('click', () => {
        const inputs = modal.querySelectorAll('.block-pop-input');
        const blockedPopulation = {};
        inputs.forEach(inp => {
            const race = inp.getAttribute('data-race');
            const amount = parseInt(inp.value) || 0;
            if (amount > 0) blockedPopulation[race] = amount;
        });
        for (let [raceName, count] of Object.entries(blockedPopulation)) {
            const race = races.find(r => r.name === raceName);
            if (race && count > 0) {
                distributePopulation(race, -count);
            }
        }
        settlement.captured = true;
        settlement.capturedByFaction = window.currentFaction;
		saveAllData();
        settlement.capturedData = {
            blockedPopulation: { ...blockedPopulation },
            originalBlockedPopulation: { ...blockedPopulation },
            destroyedBuildings: [],
            remainingBuildings: settlement.buildings.map(b => ({ id: b.id, name: b.name, completed: b.completed }))
        };
        modal.remove();
        addBuildingsLog(`🏴 Поселение "${settlement.name}" захвачено.`);
        saveAllData();
        refreshBuildingsUI();
        if (typeof refreshPeopleUI === 'function') refreshPeopleUI();
        showExportWindow(settlement);
    });
}

function showExportWindow(settlement) {
    const exportData = {
        settlementId: settlement.id,
        originalProvinceId: currentProvince,
        settlementData: settlement
    };
    const jsonStr = JSON.stringify(exportData, null, 2);
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:2000;display:flex;justify-content:center;align-items:center';
    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:700px;width:90%;">
            <h3>📤 Экспорт захваченного поселения</h3>
            <p>Данные поселения "${escapeHtml(settlement.name)}" готовы к передаче захватчику.</p>
            <textarea readonly style="width:100%; height:300px; background:#2a241c; color:#f0e6d0; border:1px solid #b87c4f; border-radius:12px; padding:10px;" id="exportJsonText">${escapeHtml(jsonStr)}</textarea>
            <div style="margin-top:10px; display:flex; gap:10px;">
                <button id="copyExportBtn">📋 Копировать</button>
                <button id="saveExportBtn">💾 Сохранить файл</button>
                <button id="closeExportBtn" style="background:#7a2a2a;">Закрыть</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('copyExportBtn').addEventListener('click', () => {
        navigator.clipboard.writeText(jsonStr).then(() => alert('Скопировано!'));
    });
    document.getElementById('saveExportBtn').addEventListener('click', () => {
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `captured_${settlement.id}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
    });
    document.getElementById('closeExportBtn').addEventListener('click', () => modal.remove());
}

/**
 * Импортирует оккупированное поселение из файла (экспортированного после захвата).
 * Добавляет поселение в список оккупированных земель текущей фракции (capturedSettlements)
 * и снимает флаг оккупации с исходного поселения у его первоначального владельца.
 * После успешного импорта принудительно обновляет карту.
 * @param {File} file - JSON-файл с данными захваченного поселения
 */
function importCapturedSettlementFromFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (!data.settlementId || !data.settlementData || !data.originalProvinceId) {
                alert('Неверный формат файла');
                return;
            }

            const settlementId = data.settlementId;

            // 1. Добавляем поселение в оккупированные земли текущей фракции
            if (typeof addCapturedSettlement === 'function') {
                addCapturedSettlement(data.settlementData, data.originalProvinceId, settlementId);
            }

            // 2. Снимаем флаг захвата с исходного поселения у его владельца
            let found = false;
            for (let pid in provincesData) {
                const prov = provincesData[pid];
                if (!prov || !prov.settlements) continue;
                const s = prov.settlements.find(s => s.id === settlementId);
                if (s && s.captured) {
                    s.captured = false;
                    s.capturedByFaction = null;
                    s.capturedData = null;
                    // Удаляем из capturedSettlements у владельца, если есть
                    if (prov.capturedSettlements) {
                        prov.capturedSettlements = prov.capturedSettlements.filter(cs => cs.settlementId !== settlementId);
                    }
                    found = true;
                    break;
                }
            }

            // 3. Сохраняем все данные (синхронно, чтобы гарантировать запись)
            if (typeof saveAllData === 'function') {
                saveAllData();
            }

            // 4. Принудительно обновляем карту, если она открыта
            if (typeof refreshSettlementData === 'function') {
                refreshSettlementData();
            }
            if (typeof addCityMarkers === 'function') {
                addCityMarkers();
            }

            // 5. Логируем результат
            addBuildingsLog(`📥 Поселение "${data.settlementData.name}" добавлено в оккупированные земли, флаг захвата снят с исходного владельца.`);

            // 6. Уведомляем пользователя
            alert(`✅ Поселение "${data.settlementData.name}" успешно импортировано! Карта обновлена.`);

        } catch(err) {
            alert('❌ Ошибка чтения файла: ' + err.message);
            console.error('Ошибка импорта:', err);
        }
    };
    reader.readAsText(file);
}

function loseCapturedSettlement(capturedId) {
    const data = provincesData[currentProvince];
    if (!data) return;
    const cs = data.capturedSettlements.find(c => c.id === capturedId);
    if (!cs) return;

    const original = cs.settlementData.capturedData?.originalBlockedPopulation || {};
    const remaining = cs.settlementData.capturedData?.blockedPopulation || {};
    const races = getCurrentProvinceRaces();

    for (let raceName in original) {
        const originalCount = original[raceName] || 0;
        const remainingCount = remaining[raceName] || 0;
        const transferred = originalCount - remainingCount;
        if (transferred > 0) {
            const race = races.find(r => r.name === raceName);
            if (race) {
                distributePopulation(race, -transferred);
            }
        }
    }

    const exportSettlementData = JSON.parse(JSON.stringify(cs.settlementData));
    if (exportSettlementData.capturedData) {
        exportSettlementData.capturedData.blockedPopulation = JSON.parse(JSON.stringify(original));
    }

    const exportData = {
        settlementId: cs.settlementId,
        originalProvinceId: cs.originalProvinceId,
        settlementData: exportSettlementData
    };
    const jsonStr = JSON.stringify(exportData, null, 2);

    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:2000;display:flex;justify-content:center;align-items:center';
    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:700px;width:90%;">
            <h3>📤 Потеря оккупированного поселения</h3>
            <p>Данные поселения "${escapeHtml(cs.settlementData.name)}" подготовлены для возврата владельцу.</p>
            <textarea readonly style="width:100%; height:300px; background:#2a241c; color:#f0e6d0; border:1px solid #b87c4f; border-radius:12px; padding:10px;">${escapeHtml(jsonStr)}</textarea>
            <div style="margin-top:10px; display:flex; gap:10px;">
                <button id="copyLoseBtn">📋 Копировать</button>
                <button id="saveLoseBtn">💾 Сохранить файл</button>
                <button id="confirmLoseBtn" style="background:#7a2a2a;">✅ Подтвердить потерю</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('copyLoseBtn').addEventListener('click', () => {
        navigator.clipboard.writeText(jsonStr).then(() => alert('Скопировано!'));
    });
    document.getElementById('saveLoseBtn').addEventListener('click', () => {
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `lost_${cs.settlementId}.json`;
        a.click();
    });
    document.getElementById('confirmLoseBtn').addEventListener('click', () => {
        removeCapturedSettlement(capturedId);
        modal.remove();
    });
}

function liberateSettlement(settlementId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(ev) {
            try {
                const data = JSON.parse(ev.target.result);
                const settlement = provincesData[currentProvince]?.settlements.find(s => s.id === settlementId);
                if (!settlement) return;

                const races = getCurrentProvinceRaces();

                // === ДОБАВЛЕНИЕ НЕДОСТАЮЩИХ РАС (НОВЫЙ БЛОК) ===
                if (data.settlementData.capturedData && data.settlementData.capturedData.blockedPopulation) {
                    const blocked = data.settlementData.capturedData.blockedPopulation;
                    for (let raceName in blocked) {
                        if (!races.some(r => r.name === raceName)) {
                            races.push({
                                name: raceName,
                                adultMale: 0,
                                adultFemale: 0,
                                children: 0,
                                elders: 0,
                                birthRate: 2.0,
                                deathRate: 1.0
                            });
                            addBuildingsLog(`🧬 В провинцию добавлена новая раса "${raceName}" (из разблокированного населения).`);
                        }
                    }
                }

                // Разблокировка населения
                if (data.settlementData.capturedData && data.settlementData.capturedData.blockedPopulation) {
                    for (let [raceName, count] of Object.entries(data.settlementData.capturedData.blockedPopulation)) {
                        const race = races.find(r => r.name === raceName);
                        if (race && count > 0) {
                            distributePopulation(race, count);
                        }
                    }
                    addBuildingsLog(`👥 Заблокированное население из "${settlement.name}" возвращено в провинцию.`);
                }

                // Восстановление построек и снятие захвата
                settlement.buildings = data.settlementData.buildings || [];
                settlement.captured = false;
                settlement.capturedByFaction = null;
                settlement.capturedData = null;

                addBuildingsLog(`🕊️ Поселение "${settlement.name}" освобождено и обновлено из файла.`);
                saveAllData();
                refreshBuildingsUI();
                if (typeof refreshPeopleUI === 'function') refreshPeopleUI();
            } catch(err) {
                alert('Ошибка чтения файла: ' + err.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// ========== 9. СБОР РЕСУРСОВ И СТРОИТЕЛЬСТВО ==========

function collectResources() {
    const techBonuses = (typeof getTechBonuses === 'function') ? getTechBonuses() : {};

    for (let pid in provincesData) {
        const prov = provincesData[pid];
        if (!prov) continue;

        let dwarfBonus = 1.0;
        if (prov.races) {
            const dwarves = prov.races.find(r => r.name === "Дварфы");
            if (dwarves) {
                const totalDwarves = getRaceTotal(dwarves);
                const bonusPer1000 = dwarves.economyBonus?.stone || 0.1;
                dwarfBonus = 1 + Math.floor(totalDwarves / 1000) * bonusPer1000;
            }
        }

        let ironModifier = 1.0;
        let goldModifier = 1.0;
        for (let settlement of prov.settlements) {
            if (settlement.captured) continue;
            for (let building of settlement.buildings) {
                if (building.completed) {
                    if (building.special === "ironBonus20") ironModifier = 1.2;
                    if (building.special === "goldBonus20") goldModifier = 1.2;
                }
            }
        }

        for (let settlement of prov.settlements) {
            if (settlement.captured) continue;
            for (let building of settlement.buildings) {
                // Кузница Титанов – потребляет дерево, даёт Железо меча
                if (building.completed && building.special === "titanForge") {
                    if (prov.resources.wood >= 5) {
                        prov.resources.wood -= 5;
                        prov.resources.sword_iron = (prov.resources.sword_iron || 0) + 10;
                    } else {
                        // Используем console.warn вместо addBuildingsLog, чтобы не зависеть от области видимости
                        console.warn(`❌ Кузница Титанов в "${settlement.name}" не работает: недостаточно древесины (нужно 5).`);
                    }
                    continue;
                }
                if (building.completed && building.income) {
                    let woodInc = building.income.wood || 0;
                    let stoneInc = building.income.stone || 0;
                    let ironInc = building.income.iron || 0;
                    let goldInc = building.income.gold || 0;

                    if (stoneInc > 0) stoneInc = Math.floor(stoneInc * dwarfBonus);
                    if (ironInc > 0) ironInc = Math.floor(ironInc * dwarfBonus);
                    if (ironInc > 0) ironInc = Math.floor(ironInc * ironModifier);
                    if (goldInc > 0) goldInc = Math.floor(goldInc * goldModifier);

                    if (techBonuses.ironProductionBonus) {
                        ironInc = Math.floor(ironInc * (1 + techBonuses.ironProductionBonus));
                    }

                    prov.resources.wood += woodInc;
                    prov.resources.stone += stoneInc;
                    prov.resources.iron += ironInc;
                    prov.resources.gold += goldInc;
                }
            }
        }
    }
}

function processConstruction() {
    let completedCount = 0;
    const completedList = [];

    for (let pid in provincesData) {
        const prov = provincesData[pid];
        if (!prov) continue;
        const provinceName = PROVINCE_NAMES[pid] || pid;

        // --- 1. Строящиеся поселения (деревни, форты) ---
        for (let settlement of prov.settlements) {
            if (settlement.captured) continue;
            if (settlement.completed === false && settlement.remainingTurns > 0) {
                settlement.remainingTurns--;
                if (settlement.remainingTurns === 0) {
                    settlement.completed = true;
                    delete settlement.remainingTurns;
                    completedList.push({
                        buildingName: `Поселение «${settlement.name}» (${SETTLEMENT_TYPES[settlement.type]?.name || settlement.type})`,
                        settlementName: settlement.name,
                        provinceName: provinceName
                    });
                }
            }
        }

        // --- 2. Строящиеся здания внутри полностью готовых поселений ---
        for (let settlement of prov.settlements) {
            if (settlement.captured) continue;
            if (settlement.completed === false) continue;   // само поселение ещё строится

            for (let building of settlement.buildings) {
                if (!building.completed && building.remainingTurns > 0) {
                    // Пропускаем замороженные постройки
                    if (building.frozen) continue;
                    
                    building.remainingTurns--;
                    if (building.remainingTurns === 0) {
                        building.completed = true;
                        delete building.remainingTurns;
                        if (building.isUpgrade) delete building.isUpgrade;
                        completedCount++;
                        peopleState.activeConstructionCount = Math.max(0, (peopleState.activeConstructionCount || 0) - 1);
                        completedList.push({
                            buildingName: building.name,
                            settlementName: settlement.name,
                            provinceName: provinceName
                        });
                    }
                }
            }
        }

        // --- 3. Обработка сносимых зданий (внутри цикла по провинциям) ---
        for (let settlement of prov.settlements) {
            if (settlement.captured) continue;
            for (let i = settlement.buildings.length - 1; i >= 0; i--) {
                const building = settlement.buildings[i];
                if (building.demolishing && building.demolishTurns > 0) {
                    building.demolishTurns--;
                    if (building.demolishTurns === 0) {
                        // Удаляем здание
                        settlement.buildings.splice(i, 1);
                        completedCount++;
                        completedList.push({
                            buildingName: building.name + ' (снесено)',
                            settlementName: settlement.name,
                            provinceName: provinceName
                        });
                    }
                }
            }
        }
    }

    if (completedList.length > 0) {
        showCompletedBuildingsModal(completedList);
        if (typeof refreshPeopleUI === 'function') refreshPeopleUI();
    }
    // возвращаем количество завершённых построек (для внешнего использования)
    return completedCount;
}

function showCompletedBuildingsModal(completedList) {
    if (!completedList || completedList.length === 0) return;

    // Формируем текст со списком
    let itemsHtml = '';
    for (let item of completedList) {
        itemsHtml += `<div style="margin: 8px 0; padding: 8px; background: #2a2418; border-radius: 10px;">
            🏗️ <strong>${escapeHtml(item.buildingName)}</strong><br>
            <span style="font-size: 0.85rem; color: #cfc294;">📍 ${escapeHtml(item.settlementName)} (${escapeHtml(item.provinceName)})</span>
        </div>`;
    }

    const modal = document.createElement('div');
    modal.className = 'build-complete-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 9999; display: flex; justify-content: center; align-items: center;';
    modal.innerHTML = `
        <div style="background: #1f1c14; border: 2px solid #ffd966; border-radius: 24px; padding: 25px; max-width: 500px; width: 90%; color: #e6ddb3; text-align: center;">
            <h3 style="color: #ffd966; margin-top: 0;">✅ Строительство завершено!</h3>
            <div style="max-height: 300px; overflow-y: auto; margin: 15px 0; text-align: left;">
                ${itemsHtml}
            </div>
            <button id="closeBuildCompleteBtn" style="background: #3a6b3a; padding: 10px 30px; font-size: 1rem; border-radius: 40px; border: none; color: white; cursor: pointer;">👍 Отлично</button>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('closeBuildCompleteBtn').addEventListener('click', () => {
        modal.remove();
    });
    // Закрытие по клику на фон
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function showBuildingDetailModal(buildingKey, settlementId) {
    const buildingDef = buildingsCatalog[buildingKey];
    if (!buildingDef) return;

    const data = provincesData[currentProvince];
    const settlement = data?.settlements.find(s => s.id === settlementId);
    if (!settlement) return;

    // Формируем читаемое описание эффектов
    let effectsHtml = '';
    if (buildingDef.income) {
        const inc = buildingDef.income;
        const parts = [];
        if (inc.wood) parts.push(`🪵 Древесина: +${inc.wood}/ход`);
        if (inc.stone) parts.push(`🪨 Камень: +${inc.stone}/ход`);
        if (inc.iron) parts.push(`⚙️ Железо: +${inc.iron}/ход`);
        if (inc.gold) parts.push(`👑 Золото: +${inc.gold}/ход`);
        if (inc.ers) parts.push(`💰 Эрсы: +${inc.ers}/ход`);
        if (parts.length) effectsHtml += `<div><strong>📦 Доход:</strong> ${parts.join(', ')}</div>`;
    }
    if (buildingDef.special) {
        const specialMap = {
            "conscriptionBonus5": "⚔️ +5% к призывному резерву",
            "conscriptionBonus10": "⚔️ +10% к призывному резерву",
            "siegeWorkshop": "🏗️ Позволяет строить осадные орудия",
            "siegeWorkshopPlus": "🏗️ Улучшенные осадные орудия",
            "coinExchange1200": "🪙 Обмен золота по курсу 1→1200 эрсов",
            "coinExchange1700": "🪙 Обмен золота по курсу 1→1700 эрсов",
            "ironBonus20": "⚙️ +20% к добыче железа",
            "goldBonus20": "👑 +20% к добыче золота",
            "tradeBonus15": "📈 +15% к доходу от торговли",
            "tradeBonus30": "📈 +30% к доходу от торговли",
            "tavern": "🍺 Открывает наёмников (дварфы и др.)",
            "tavernPlus": "🍺 Улучшенная таверна, +5 к доходу от торговли",
            "altarVarsis": "⛪ +7% призывного резерва людей/дварфов, доступ к «Мясникам Варсиса»",
            "sanctuaryTeama": "⛩️ +7% призывного резерва оку/гоблинов, +5% к рождаемости",
            "templeVarsiteya": "🛕 +10% призывного резерва (заменяет Алтарь и Святилище)",
            "pantheon": "🏛️ +15% призывного резерва, +15% рождаемости (заменяет все религ. бонусы)"
        };
        const effectText = specialMap[buildingDef.special] || `✨ Особая механика: ${buildingDef.special}`;
        effectsHtml += `<div><strong>🔮 Эффект:</strong> ${effectText}</div>`;
    }
    if (!effectsHtml) effectsHtml = '<div>Нет специальных эффектов.</div>';

    // Информация о лимите
    let limitHtml = '';
    const limit = buildingDef.limit || (buildingDef.upgrade && buildingDef.upgrade.limit);
    if (limit) {
        const scopeText = limit.scope === 'faction' ? 'фракции' : 'провинции';
        limitHtml = `<div style="margin-top:10px; color: #ffd966;"><strong>⚠️ Лимит:</strong> не более ${limit.max} для ${scopeText}</div>`;
    }

    // Проверка типа поселения
    const typeAllowed = !buildingDef.allowedSettlementTypes || buildingDef.allowedSettlementTypes.includes(settlement.type);
    const typeWarning = typeAllowed ? '' : '<div style="color:#ff6b6b;">⚠️ Нельзя построить в данном типе поселения</div>';

    // Модальное окно
    const modal = document.createElement('div');
    modal.className = 'building-detail-modal';
    modal.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:#1f1c14; border:2px solid #b87c4f; border-radius:24px; padding:25px; z-index:2001; max-width:500px; width:90%; color:#e6ddb3;';
    modal.innerHTML = `
        <h3 style="color:#ffd966; margin-top:0;">🏗️ ${buildingDef.name}</h3>
        <div style="margin:15px 0;">${buildingDef.description || 'Без описания'}</div>
        <div style="margin-bottom:15px;">⏱️ Время строительства: <strong>${buildingDef.buildTime} хода(ов)</strong></div>
        <div style="margin-bottom:15px;">
            <strong>💰 Стоимость:</strong><br>
            🪵 Древесина: ${buildingDef.cost.wood}<br>
            🪨 Камень: ${buildingDef.cost.stone}<br>
            ⚙️ Железо: ${buildingDef.cost.iron}<br>
            👑 Золото: ${buildingDef.cost.gold}<br>
            💰 Эрсы: ${buildingDef.cost.ers}
        </div>
        ${effectsHtml}
        ${limitHtml}
        ${typeWarning}
        <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:20px;">
            <button id="confirmBuildBtn" style="background:#3a6b3a; padding:8px 20px;">✅ Построить</button>
            <button id="cancelBuildBtn" style="background:#7a2a2a; padding:8px 20px;">Отмена</button>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('cancelBuildBtn').addEventListener('click', () => modal.remove());
    document.getElementById('confirmBuildBtn').addEventListener('click', () => {
        if (!typeAllowed) {
            alert('Эту постройку нельзя возвести в данном типе поселения.');
            return;
        }
        // Проверка лимита перед строительством
        if (typeof checkBuildingLimit === 'function' && !checkBuildingLimit(buildingKey, settlementId, false, null)) {
            return; // лимит исчерпан, сообщение уже показано
        }
        startBuilding(settlementId, buildingKey, false, null);
        modal.remove();
    });
}

function showBuildingDetailForSettlement(building, settlementName) {
    // Ищем описание из каталога по baseName
    let catalogEntry = null;
    if (building.baseName && buildingsCatalog[building.baseName]) {
        catalogEntry = buildingsCatalog[building.baseName];
    }

    const isDummy = building.isDummy === true;
    const statusText = isDummy ? '🚫 Неактивна (пустышка)' : (building.completed ? '✅ Активна' : '🔨 Строится');
    
    let effectText = 'Нет';
    if (!isDummy) {
        if (catalogEntry && catalogEntry.special) {
            const specialMap = {
                "conscriptionBonus5": "⚔️ +5% к призывному резерву",
                "conscriptionBonus10": "⚔️ +10% к призывному резерву",
                "siegeWorkshop": "🏗️ Позволяет строить осадные орудия",
                "siegeWorkshopPlus": "🏗️ Улучшенные осадные орудия",
                "coinExchange1200": "🪙 Обмен золота по курсу 1→1200 эрсов",
                "coinExchange1700": "🪙 Обмен золота по курсу 1→1700 эрсов",
                "ironBonus20": "⚙️ +20% к добыче железа",
                "goldBonus20": "👑 +20% к добыче золота",
                "tradeBonus15": "📈 +15% к доходу от торговли",
                "tradeBonus30": "📈 +30% к доходу от торговли",
                "tavern": "🍺 Открывает наёмников (дварфы и др.)",
                "tavernPlus": "🍺 Улучшенная таверна, +5 к доходу от торговли",
                "altarVarsis": "⛪ +7% призывного резерва людей/дварфов, доступ к «Мясникам Варсиса»",
                "sanctuaryTeama": "⛩️ +7% призывного резерва оку/гоблинов, +5% к рождаемости",
                "templeVarsiteya": "🛕 +10% призывного резерва (заменяет Алтарь и Святилище)",
                "pantheon": "🏛️ +15% призывного резерва, +15% рождаемости (заменяет все религ. бонусы)"
            };
            effectText = specialMap[catalogEntry.special] || `✨ ${catalogEntry.special}`;
        } else if (building.special) {
            effectText = `✨ ${building.special}`;
        }
    }
    
    const incomeText = (building.income && !isDummy) 
        ? Object.entries(building.income).filter(([_,v]) => v > 0).map(([k,v]) => `${RESOURCES_REGISTRY[k]?.name || k}: +${v}`).join(', ') || 'Нет дохода'
        : 'Нет дохода (неактивна)';

    const modal = document.createElement('div');
    modal.className = 'building-detail-modal';
    modal.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:#1f1c14; border:2px solid #b87c4f; border-radius:24px; padding:25px; z-index:2001; max-width:450px; width:90%; color:#e6ddb3;';
    modal.innerHTML = `
        <h3 style="color:#ffd966; margin-top:0;">🏗️ ${escapeHtml(building.name)}</h3>
        <div style="margin:10px 0;"><strong>Статус:</strong> ${statusText}</div>
        <div style="margin:10px 0;"><strong>📍 Поселение:</strong> ${escapeHtml(settlementName)}</div>
        <div style="margin:10px 0;"><strong>🔮 Эффект:</strong> ${effectText}</div>
        <div style="margin:10px 0;"><strong>📦 Доход:</strong> ${incomeText}</div>
        ${isDummy ? '<div style="margin-top:15px; color: #ff6b6b;">⚠️ Постройка была отключена из-за превышения лимита</div>' : ''}
        <div style="display:flex; justify-content:flex-end; margin-top:20px;">
            <button id="closeBuildingDetailBtn" style="background:#7a2a2a; padding:8px 20px;">Закрыть</button>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('closeBuildingDetailBtn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

// ========== 10. СТРОИТЕЛЬСТВО: ВЫБОР И ЗАПУСК ==========

function showBuildingSelector(settlementId) {
    const data = provincesData[currentProvince];
    if (!data) return;
    const settlement = data.settlements.find(s => s.id === settlementId);
    if (!settlement) return;

    const maxSlots = getMaxSlotsForSettlement(settlement, settlementId);
    const usedSlots = settlement.buildings.length;
    if (usedSlots >= maxSlots) {
        addBuildingsLog(`В поселении "${settlement.name}" нет свободных слотов.`);
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
        const constructionCount = peopleState.activeConstructionCount || 0;
        const maxSlotsConstr = peopleState.maxConstructionSlots || 2;
        const atLimit = constructionCount >= maxSlotsConstr;

        for (let [key, b] of Object.entries(buildingsCatalog)) {
			if (b.isDummy) continue;   // ← вот эту строку добавить
			if (b.faction && b.faction !== window.currentFaction) continue;
			if (filterCategory !== 'all' && b.category !== filterCategory) continue;
            if (b.allowedSettlementTypes && !b.allowedSettlementTypes.includes(settlement.type)) continue;

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
                document.body.removeChild(modal);
                showBuildingDetailModal(key, settlementId);
            });
            list.appendChild(btn);
        }

        if (atLimit) {
            const info = document.createElement('div');
            info.style.cssText = 'color:#ffd966; text-align:center; margin:8px 0;';
            info.textContent = `⚠️ Лимит строек: ${constructionCount}/${maxSlotsConstr}. Дождитесь завершения.`;
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

function checkBuildingLimit(buildingKey, settlementId, isUpgrade = false, baseBuilding = null) {
    const buildingDef = buildingsCatalog[buildingKey];
    if (!buildingDef) return true;

    // Если улучшаем существующее здание — лимит не проверяем (оно заменится)
    if (isUpgrade && baseBuilding) return true;

    // Определяем, какой лимит использовать
    let limit = buildingDef.limit;
    if (!limit && buildingDef.upgrade && buildingDef.upgrade.limit) {
        // Для улучшенных версий лимит может быть только в описании улучшения
        limit = buildingDef.upgrade.limit;
    }
    if (!limit) return true; // нет ограничений

    const scope = limit.scope; // 'faction' или 'province'
    const max = limit.max;

    // Ключ для группировки (базовое имя постройки)
    const baseName = buildingDef.baseName || buildingKey;

    // Собираем все провинции текущей фракции
    const factionProvinces = (typeof getCurrentFactionProvinces === 'function') 
        ? getCurrentFactionProvinces() 
        : [currentProvince];

    let count = 0;

    for (let pid of factionProvinces) {
        if (scope === 'province' && pid !== currentProvince) continue; // только текущая провинция

        const prov = provincesData[pid];
        if (!prov || !prov.settlements) continue;

        for (let settlement of prov.settlements) {
            if (settlement.captured) continue; // захваченные не учитываем

            for (let building of settlement.buildings) {
                // Считаем здания с тем же baseName, кроме того, которое будет заменено при улучшении
                const bName = building.baseName || building.name;
                if (bName === baseName) {
                    // Если это то самое здание, которое мы улучшаем – не считаем
                    if (isUpgrade && baseBuilding && building.id === baseBuilding.id) continue;
                    count++;
                }
            }
        }
    }

    if (count >= max) {
        const scopeText = scope === 'faction' ? 'фракции' : 'провинции';
        addBuildingsLog(`❌ Достигнут лимит: ${buildingDef.name}. Нельзя построить больше ${max} для ${scopeText}.`);
        alert(`Невозможно построить "${buildingDef.name}". Достигнут лимит: не более ${max} для ${scopeText}.`);
        return false;
    }

    return true;
}

function startBuilding(settlementId, buildingName, isUpgrade = false, baseBuilding = null) {
    const data = provincesData[currentProvince];
    if (!data) return;
    const settlement = data.settlements.find(s => s.id === settlementId);
    if (!settlement) return;
    const maxSlots = getMaxSlotsForSettlement(settlement, settlementId);
    const usedSlots = settlement.buildings.length;
    if (!isUpgrade && usedSlots >= maxSlots) {
        addBuildingsLog(`В поселении "${settlement.name}" нет свободных слотов.`);
        return;
    }
    const buildingDef = buildingsCatalog[buildingName];
    if (!buildingDef) return;

    const constructionCount = peopleState.activeConstructionCount || 0;
    const maxConstr = peopleState.maxConstructionSlots || 2;
    if (constructionCount >= maxConstr) {
        addBuildingsLog(`❌ Достигнут лимит одновременных строек (${maxConstr}).`);
        return;
    }
    if (buildingDef.allowedSettlementTypes && !buildingDef.allowedSettlementTypes.includes(settlement.type)) {
        const typeMap = { city: 'городе', castle: 'замке', village: 'деревне' };
        addBuildingsLog(`❌ Постройка "${buildingDef.name}" не может быть построена в ${typeMap[settlement.type] || settlement.type}.`);
        return;
    }
	// Религиозные ограничения: Алтарь Варсиса и Святилище Тэямы не могут быть в одной провинции
	if ((buildingName === 'Алтарь Варсиса' || buildingName === 'Святилище Тэямы') && !isUpgrade) {
		const oppositeSpecial = (buildingName === 'Алтарь Варсиса') ? 'sanctuaryTeama' : 'altarVarsis';
		let hasOpposite = false;
		let hasTempleOrPantheon = false;

		for (let s of data.settlements) {
			for (let b of s.buildings) {
				// Противоположную постройку ищем даже если она ещё строится
				if (b.special === oppositeSpecial) {
					hasOpposite = true;
				}
				// Храм/Пантеон должны быть завершены, чтобы снять ограничение
				if (b.completed && (b.special === 'templeVarsiteya' || b.special === 'pantheon')) {
					hasTempleOrPantheon = true;
				}
			}
		}

		if (hasOpposite && !hasTempleOrPantheon) {
			const oppositeName = (buildingName === 'Алтарь Варсиса') ? 'Святилище Тэямы' : 'Алтарь Варсиса';
			addBuildingsLog(`❌ Нельзя построить "${buildingDef.name}" – в провинции уже есть "${oppositeName}". Постройте Храм Варситэи или Пантеон.`);
			return;
		}
	}
    if (!checkBuildingLimit(buildingName, settlementId, isUpgrade, baseBuilding)) {
        return;
    }

    // Религиозные ограничения оставлены без изменений (при необходимости вставьте их сюда)

    let cost, buildTime, level = 1, name = buildingName;
    if (isUpgrade && baseBuilding) {
        const upgradeDef = buildingsCatalog[baseBuilding.baseName]?.upgrade;
        if (!upgradeDef) return;
        cost = upgradeDef.cost;
        buildTime = upgradeDef.buildTime;
        level = 2;
        name = upgradeDef.name || `${baseBuilding.name} (улучшенная)`;
    } else {
        cost = buildingDef.cost;
        buildTime = buildingDef.buildTime;
        name = buildingDef.name;
    }

    // Применяем скидку на камень от технологий ДО проверки ресурсов
    const techBonuses = (typeof getTechBonuses === 'function') ? getTechBonuses() : {};
    if (techBonuses.buildingStoneDiscount) {
        cost.stone = Math.floor(cost.stone * (1 - techBonuses.buildingStoneDiscount));
    }

    // Бонус от инженеров в гарнизоне (Княжество Лорейн)
    if (typeof getEngineerBuildBonus === 'function') {
        const bonus = getEngineerBuildBonus(settlementId);
        if (bonus > 0) {
            buildTime = Math.max(1, buildTime - bonus);
            if (typeof addBuildingsLog === 'function') {
                addBuildingsLog(`⚙️ Корпус инженеров ускоряет строительство на ${bonus} ход(а).`);
            }
        }
    }

    if (baseBuilding && baseBuilding.isDummy) {
        addBuildingsLog("❌ Нельзя улучшить неактивную постройку.");
        return;
    }
    const res = data.resources;
    if (res.wood < cost.wood || res.stone < cost.stone || res.iron < cost.iron || res.gold < cost.gold || res.ers < cost.ers) {
        addBuildingsLog(`❌ Недостаточно ресурсов для ${isUpgrade ? 'улучшения' : 'строительства'} "${name}".`);
        return;
    }

    res.wood -= cost.wood;
    res.stone -= cost.stone;
    res.iron -= cost.iron;
    res.gold -= cost.gold;
    res.ers -= cost.ers;
    recalcTotalTreasury();

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
            id: generateId(),
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

    peopleState.activeConstructionCount = (peopleState.activeConstructionCount || 0) + 1;
    if (typeof refreshPeopleUI === 'function') refreshPeopleUI();

    addBuildingsLog(`${isUpgrade ? 'Улучшение' : 'Строительство'} "${name}" начато в "${settlement.name}". (Активных строек: ${peopleState.activeConstructionCount})`);
    saveAllData();
    refreshBuildingsUI();
    updateGlobalResourcesDisplay();
}

// ========== 11. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

function renderCatalog() {
    const container = document.getElementById('buildingsCatalog');
    if (!container) return;
    container.innerHTML = '';
    for (let [key, building] of Object.entries(buildingsCatalog)) {
		if (building.isDummy) continue;
        const card = document.createElement('div');
        card.className = 'building-card';
        card.innerHTML = `<h3>${escapeHtml(building.name)}</h3><div>${escapeHtml(building.description)}</div><div class="building-cost">💰 Стоимость: 🪵${building.cost.wood} 🪨${building.cost.stone} ⚙️${building.cost.iron} 👑${building.cost.gold} 💰${building.cost.ers}</div><div>⏱️ Время: ${building.buildTime} хода(ов)</div>`;
        container.appendChild(card);
    }
}

function addSettlement() {
    const data = provincesData[currentProvince];
    if (!data) return;

    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:2000;display:flex;justify-content:center;align-items:center;';

    // Список вассалов для выбора владельца
    let vassalOptions = '<option value="">🏰 Главный род</option>';
    if (typeof factionCouncils !== 'undefined' && factionCouncils[window.currentFaction]) {
        const council = factionCouncils[window.currentFaction];
        for (let house of council.houses) {
            vassalOptions += `<option value="${house.id}">🛡️ ${escapeHtml(house.name)}</option>`;
        }
    }

    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:450px;width:90%;color:#e6ddb3;">
            <h3>🏘️ Создание нового поселения</h3>
            <label>Название: <input type="text" id="newSettlementName" value="Новое поселение" style="width:100%;margin-top:5px;"></label>
            <label style="margin-top:10px;">Тип:
                <select id="newSettlementType" style="width:100%;margin-top:5px;">
                    <option value="village">🌾 Деревня (300 дер, 2 хода)</option>
                    <option value="wooden_fort">🏕️ Деревянный форт (150 дер, 4 хода)</option>
                    <option value="stone_fort">🏰 Каменный форт (150 кам, 6 ходов)</option>
                </select>
            </label>
            <label style="margin-top:10px;">Принадлежит:
                <select id="newSettlementOwner" style="width:100%;margin-top:5px;">
                    ${vassalOptions}
                </select>
            </label>
            <div style="margin-top:15px; display:flex; gap:10px; justify-content:flex-end;">
                <button id="confirmSettlementBtn">✅ Создать</button>
                <button id="cancelSettlementBtn" style="background:#7a2a2a;">Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('cancelSettlementBtn').onclick = () => modal.remove();

    document.getElementById('confirmSettlementBtn').onclick = () => {
        const name = document.getElementById('newSettlementName').value.trim();
        if (!name) { alert('Введите название'); return; }

        const type = document.getElementById('newSettlementType').value;
        const ownerId = document.getElementById('newSettlementOwner').value;

        const res = data.resources;
        let costWood = 0, costStone = 0, buildTime = 2;

        if (type === 'village') {
            costWood = 300;
            buildTime = 2;
        } else if (type === 'wooden_fort') {
            costWood = 150;
            buildTime = 4;
        } else if (type === 'stone_fort') {
            costStone = 150;
            buildTime = 6;
        }

        if (res.wood < costWood || res.stone < costStone) {
            alert(`Недостаточно ресурсов! Требуется: ${costWood} дерева, ${costStone} камня.`);
            return;
        }

        res.wood -= costWood;
        res.stone -= costStone;

        // Создаём строящееся поселение (completed = false)
        const newSettlement = {
            id: (typeof generateId === 'function') ? generateId() : Date.now() + '-' + Math.random(),
            name: name,
            type: type,
            buildings: [],
            captured: false,
            capturedByFaction: null,
            capturedData: null,
            completed: false,
            remainingTurns: buildTime,
            vassalHouse: ownerId || null
        };

        data.settlements.push(newSettlement);
        addBuildingsLog(`🏗️ Строительство поселения "${name}" начато (${buildTime} ходов).`);
        saveAllData();
        refreshBuildingsUI();
        modal.remove();
    };
}

function removeLastSettlement() {
    const data = provincesData[currentProvince];
    if (!data) return;
    if (data.settlements.length <= 1) { addBuildingsLog(`Нельзя удалить последнее поселение.`); return; }
    const removed = data.settlements.pop();
    addBuildingsLog(`Удалено поселение "${removed.name}".`);
    saveAllData();
    refreshBuildingsUI();
}

function resetProvinceResources() {
    const data = provincesData[currentProvince];
    if (!data) return;
    data.resources = { wood: 500, stone: 300, iron: 200, gold: 10, ers: 20000 };
    recalcTotalTreasury();
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
}

function exchangeGold() {
    let mintRate = 100;
    for (let pid in provincesData) {
        for (let s of provincesData[pid].settlements) {
            for (let b of s.buildings) {
                if (b.completed && b.special === "coinExchange1200") mintRate = 1200;
                if (b.completed && b.special === "coinExchange1700") mintRate = 1700;
            }
        }
    }
    const totalGold = getTotalResources().gold;
    if (totalGold <= 0) { addBuildingsLog(`❌ Нет золота для обмена.`); return; }
    const maxGold = totalGold;
    const input = prompt(`Введите количество золота для обмена (доступно: ${maxGold}, курс ${mintRate} эрсов):`, "1");
    if (input === null) return;
    const amount = parseInt(input);
    if (isNaN(amount) || amount <= 0) return;
    const actualAmount = Math.min(amount, maxGold);
    const gained = actualAmount * mintRate;

    for (let pid in provincesData) {
        if (provincesData[pid].resources.gold >= actualAmount) {
            provincesData[pid].resources.gold -= actualAmount;
            break;
        }
    }
    // Добавляем эрсы в столичную провинцию
    const capitalId = Object.keys(provincesData).find(pid => provincesData[pid].isCapital) || Object.keys(provincesData)[0];
    if (capitalId && provincesData[capitalId]) {
        provincesData[capitalId].resources.ers += gained;
    }
    recalcTotalTreasury();
    addBuildingsLog(`💰 Обменяно ${actualAmount} золота на ${gained} эрсов.`);
    saveAllData();
    refreshBuildingsUI();
    updateGlobalResourcesDisplay();
}

function smeltSwordIron() {
    const totalSwordIron = (typeof getTotalResources === 'function' ? getTotalResources().sword_iron : 0) || 0;
    if (totalSwordIron <= 0) {
        addBuildingsLog('❌ Нет Железа меча для переплавки.');
        return;
    }
    const amount = prompt(`Введите количество Железа меча для переплавки (доступно: ${totalSwordIron}). 1 ед. = 10 железа.`, "1");
    if (amount === null) return;
    const amt = parseInt(amount);
    if (isNaN(amt) || amt <= 0) return;
    const actual = Math.min(amt, totalSwordIron);
    const gained = actual * 10;

    // Списываем sword_iron из первой подходящей провинции
    for (let pid in provincesData) {
        const prov = provincesData[pid];
        if (prov.resources && prov.resources.sword_iron >= actual) {
            prov.resources.sword_iron -= actual;
            break;
        }
    }
    // Добавляем железо в столицу (или первую провинцию)
    const capitalId = Object.keys(provincesData).find(pid => provincesData[pid].isCapital) || Object.keys(provincesData)[0];
    if (capitalId && provincesData[capitalId]) {
        provincesData[capitalId].resources.iron = (provincesData[capitalId].resources.iron || 0) + gained;
    }
    recalcTotalTreasury();
    addBuildingsLog(`🔥 Переплавлено ${actual} ед. Железа меча в ${gained} железа.`);
    saveAllData();
    refreshBuildingsUI();
    updateGlobalResourcesDisplay();
}


function refreshBuildingsUI() {
    if (typeof updateProvinceSelect === 'function') updateProvinceSelect();
    if (typeof renderResources === 'function') renderResources();
    if (typeof renderSettlements === 'function') renderSettlements();
    if (typeof renderCatalog === 'function') renderCatalog();
    if (typeof renderProvinceCells === 'function') renderProvinceCells();
    if (typeof refreshPeopleUI === 'function') refreshPeopleUI();
}

function openProvinceResourceEditor(provinceId) {
    const prov = provincesData[provinceId];
    if (!prov || !prov.resources) return;

    const currentRes = prov.resources;
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:2000;display:flex;justify-content:center;align-items:center;';
    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:500px;width:90%;color:#e6ddb3;">
            <h3>⚒️ Редактор ресурсов — ${escapeHtml(PROVINCE_NAMES[provinceId] || provinceId)}</h3>
            <div style="margin:15px 0;">
                <label>🪵 Древесина: <input type="number" id="editWood" value="${currentRes.wood || 0}" style="width:100px;"></label><br>
                <label>🪨 Камень: <input type="number" id="editStone" value="${currentRes.stone || 0}" style="width:100px;"></label><br>
                <label>⚙️ Железо: <input type="number" id="editIron" value="${currentRes.iron || 0}" style="width:100px;"></label><br>
                <label>👑 Золото: <input type="number" id="editGold" value="${currentRes.gold || 0}" style="width:100px;"></label><br>
                <label>💰 Эрсы: <input type="number" id="editErs" value="${currentRes.ers || 0}" style="width:100px;"></label><br>
                <label>⚔️ Железо меча: <input type="number" id="editSwordIron" value="${currentRes.sword_iron || 0}" style="width:100px;"></label><br>
                <label>🦬 Бизоны: <input type="number" id="editBison" value="${currentRes.bison || 0}" style="width:100px;"></label><br>
                <label>🍃 Эльфийский табак: <input type="number" id="editElvenTobacco" value="${currentRes.elven_tobacco || 0}" style="width:100px;"></label>
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px;">
                <button id="saveResourceEditBtn">Сохранить</button>
                <button id="cancelResourceEditBtn" style="background:#7a2a2a;">Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('cancelResourceEditBtn').addEventListener('click', () => modal.remove());

    document.getElementById('saveResourceEditBtn').addEventListener('click', () => {
        prov.resources.wood = parseInt(document.getElementById('editWood').value) || 0;
        prov.resources.stone = parseInt(document.getElementById('editStone').value) || 0;
        prov.resources.iron = parseInt(document.getElementById('editIron').value) || 0;
        prov.resources.gold = parseInt(document.getElementById('editGold').value) || 0;
        prov.resources.ers = parseInt(document.getElementById('editErs').value) || 0;
        prov.resources.sword_iron = parseInt(document.getElementById('editSwordIron').value) || 0;
        prov.resources.bison = parseInt(document.getElementById('editBison').value) || 0;
        prov.resources.elven_tobacco = parseInt(document.getElementById('editElvenTobacco').value) || 0;

        recalcTotalTreasury();
        addBuildingsLog(`📦 Ресурсы провинции "${PROVINCE_NAMES[provinceId] || provinceId}" изменены вручную.`);
        saveAllData();

        refreshBuildingsUI();
        if (typeof renderProvinceDashboard === 'function') renderProvinceDashboard();
        if (typeof updateGlobalResourcesDisplay === 'function') updateGlobalResourcesDisplay();
        if (typeof refreshPeopleUI === 'function') refreshPeopleUI();

        modal.remove();
    });
}

function setManualResources() {
    const data = provincesData[currentProvince];
    if (!data) return;
    const wood = parseInt(document.getElementById('manualWood')?.value);
    const stone = parseInt(document.getElementById('manualStone')?.value);
    const iron = parseInt(document.getElementById('manualIron')?.value);
    const gold = parseInt(document.getElementById('manualGold')?.value);
    const ers = parseInt(document.getElementById('manualErs')?.value);
    if (!isNaN(wood)) data.resources.wood = wood;
    if (!isNaN(stone)) data.resources.stone = stone;
    if (!isNaN(iron)) data.resources.iron = iron;
    if (!isNaN(gold)) data.resources.gold = gold;
    if (!isNaN(ers)) { data.resources.ers = ers; recalcTotalTreasury(); }
    updateGlobalResourcesDisplay();
    addBuildingsLog(`📦 Ресурсы провинции изменены вручную.`);
    if (typeof renderProvinceDashboard === 'function') renderProvinceDashboard();
    saveAllData();
}
window.setManualResources = setManualResources;

function hasTavern() {
    for (let pid in provincesData) {
        for (let s of provincesData[pid].settlements) {
            for (let b of s.buildings) {
                if (b.completed && (b.special === "tavern" || b.special === "tavernPlus")) return true;
            }
        }
    }
    return false;
}
window.hasTavern = hasTavern;

// ========== 12. ОККУПИРОВАННЫЕ ЗЕМЛИ ==========

function getCapturedSettlements() {
    const result = [];
    for (let pid in provincesData) {
        const prov = provincesData[pid];
        if (prov && prov.capturedSettlements) {
            for (let cs of prov.capturedSettlements) {
                result.push({ ...cs, _currentProvince: pid });
            }
        }
    }
    return result;
}

function addCapturedSettlement(settlementData, originalProvinceId, settlementId) {
    const data = provincesData[currentProvince];
    if (!data) return false;
    if (!data.capturedSettlements) data.capturedSettlements = [];
    if (data.capturedSettlements.some(cs => cs.settlementId === settlementId)) {
        addBuildingsLog(`❌ Поселение "${settlementData.name}" уже находится в оккупированных землях.`);
        return false;
    }
    const newCaptured = {
        id: generateId(),
        settlementId: settlementId,
        originalProvinceId: originalProvinceId,
        settlementData: JSON.parse(JSON.stringify(settlementData)),
        dateCaptured: (typeof getCurrentDateString === 'function') ? getCurrentDateString() : new Date().toLocaleString()
    };
    data.capturedSettlements.push(newCaptured);
    addBuildingsLog(`🏴 Добавлено захваченное поселение "${settlementData.name}" из провинции ${originalProvinceId}.`);
    saveAllData();
    renderCapturedSettlements();
    return true;
}

function removeCapturedSettlement(capturedId) {
    const data = provincesData[currentProvince];
    if (!data || !data.capturedSettlements) return;
    const removed = data.capturedSettlements.find(cs => cs.id === capturedId);
    data.capturedSettlements = data.capturedSettlements.filter(cs => cs.id !== capturedId);
    if (removed) {
        addBuildingsLog(`🗑️ Захваченное поселение "${removed.settlementData.name}" удалено из оккупированных земель.`);
    }
    saveAllData();
    renderCapturedSettlements();
}

function renderCapturedSettlements() {
    const container = document.getElementById('capturedSettlementsList');
    if (!container) return;
    const captured = getCapturedSettlements();
    if (captured.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:#8a7a5a; padding:20px;">Нет оккупированных земель.</div>';
        return;
    }
    const grouped = new Map();
    for (let cs of captured) {
        const key = cs.originalProvinceId;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key).push(cs);
    }
    let html = '';
    for (let [provinceId, settlements] of grouped) {
        const provinceName = (PROVINCE_NAMES[provinceId] || provinceId);
        html += `<h3 style="color:#ffd966; margin-top:15px;">🏴 Провинция: ${escapeHtml(provinceName)}</h3>`;
        for (let cs of settlements) {
            const s = cs.settlementData;
            const typeName = s.type === 'city' ? 'Город' : (s.type === 'castle' ? 'Замок' : 'Деревня');
            let buildingsHtml = '';
            if (s.buildings && s.buildings.length) {
                buildingsHtml = '<ul>';
                for (let b of s.buildings) {
                    const active = b.completed && !s.captured;
                    buildingsHtml += `<li style="color:${active ? '#cfc294' : '#8a7a5a'}">${active ? '✅' : '🚫'} ${escapeHtml(b.name)}</li>`;
                }
                buildingsHtml += '</ul>';
            } else {
                buildingsHtml = '<div>Нет построек</div>';
            }
            let blockedPopHtml = '';
            if (s.capturedData && s.capturedData.blockedPopulation) {
                blockedPopHtml = '<div><strong>Заблокировано населения:</strong><ul>';
                for (let [race, count] of Object.entries(s.capturedData.blockedPopulation)) {
                    blockedPopHtml += `<li>${race}: ${count}</li>`;
                }
                blockedPopHtml += '</ul></div>';
            }
            html += `
                <div class="stat-card" style="border:1px solid #b87c4f; margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between;">
                        <div>
                            <strong>🏘️ ${escapeHtml(s.name)}</strong> (${typeName})
                            <span style="font-size:0.7rem; color:#8a7a5a;"> — захвачено ${cs.dateCaptured}</span>
                        </div>
                        <div>
                            <button class="build-in-captured-btn" data-captured-id="${cs.id}">🏗️ Строить</button>
                            <button class="unblock-pop-btn" data-captured-id="${cs.id}">👥 Разблокировать население</button>
                            <button class="lose-captured-btn" data-captured-id="${cs.id}" style="background:#b8860b;">🏳️ Потеряно</button>
                            <button class="remove-captured-btn" data-captured-id="${cs.id}" style="background:#7a2a2a;">🗑️ Удалить</button>
                        </div>
                    </div>
                    <div style="margin-top:10px;">
                        <strong>Постройки:</strong>
                        ${buildingsHtml}
                    </div>
                    ${blockedPopHtml}
                </div>
            `;
        }
    }
    container.innerHTML = html;

    document.querySelectorAll('.build-in-captured-btn').forEach(btn => {
        btn.addEventListener('click', () => showBuildingSelectorForCaptured(btn.getAttribute('data-captured-id')));
    });
    document.querySelectorAll('.unblock-pop-btn').forEach(btn => {
        btn.addEventListener('click', () => unblockPopulationFromCaptured(btn.getAttribute('data-captured-id')));
    });
    document.querySelectorAll('.lose-captured-btn').forEach(btn => {
        btn.addEventListener('click', () => loseCapturedSettlement(btn.getAttribute('data-captured-id')));
    });
    document.querySelectorAll('.remove-captured-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Удалить это захваченное поселение из списка?')) {
                removeCapturedSettlement(btn.getAttribute('data-captured-id'));
            }
        });
    });
}

function showBuildingSelectorForCaptured(capturedId) {
    const data = provincesData[currentProvince];
    if (!data) return;
    const cs = data.capturedSettlements.find(c => c.id === capturedId);
    if (!cs) return;
    const settlement = cs.settlementData;
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:2000;display:flex;justify-content:center;align-items:center';
    let html = `<div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:20px;max-width:600px;width:90%;">`;
    html += `<h3>Строительство в "${escapeHtml(settlement.name)}" (оккупировано)</h3>`;
    html += `<div id="capturedBuildList" style="max-height:400px; overflow-y:auto;"></div>`;
    html += `<button id="closeCapturedBuildModal" style="background:#7a2a2a; margin-top:10px;">Закрыть</button></div>`;
    modal.innerHTML = html;
    document.body.appendChild(modal);
    document.getElementById('closeCapturedBuildModal').addEventListener('click', () => modal.remove());

    const list = document.getElementById('capturedBuildList');
    for (let [key, b] of Object.entries(buildingsCatalog)) {
        const btn = document.createElement('button');
        btn.textContent = `${b.name} (${b.buildTime} хода) – стоимость: 🪵${b.cost.wood} 🪨${b.cost.stone} ⚙️${b.cost.iron} 👑${b.cost.gold} 💰${b.cost.ers}`;
        btn.style.display = 'block'; btn.style.width = '100%'; btn.style.margin = '4px 0';
        btn.addEventListener('click', () => {
            const res = data.resources;
            if (res.wood < b.cost.wood || res.stone < b.cost.stone || res.iron < b.cost.iron || res.gold < b.cost.gold || res.ers < b.cost.ers) {
                alert('Недостаточно ресурсов'); return;
            }
            res.wood -= b.cost.wood; res.stone -= b.cost.stone; res.iron -= b.cost.iron; res.gold -= b.cost.gold; res.ers -= b.cost.ers;
            recalcTotalTreasury();
            if (!settlement.buildings) settlement.buildings = [];
            settlement.buildings.push({
                id: generateId(), name: b.name, completed: true, level: 1, baseName: key,
                income: b.income || {}, special: b.special || null, category: b.category || null
            });
            addBuildingsLog(`🏗️ Построено "${b.name}" в оккупированном "${settlement.name}".`);
            saveAllData();
            renderCapturedSettlements();
            modal.remove();
        });
        list.appendChild(btn);
    }
}

function unblockPopulationFromCaptured(capturedId) {
    const data = provincesData[currentProvince];
    if (!data) return;
    const cs = data.capturedSettlements.find(c => c.id === capturedId);
    if (!cs || !cs.settlementData.capturedData?.blockedPopulation) { alert('Нет заблокированного населения'); return; }
    const blocked = cs.settlementData.capturedData.blockedPopulation;
    const races = getCurrentProvinceRaces();
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:2000;display:flex;justify-content:center;align-items:center';
    let html = `<div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:20px;max-width:500px;width:90%;">`;
    html += `<h3>Разблокировка населения "${escapeHtml(cs.settlementData.name)}"</h3>`;
    for (let [raceName, count] of Object.entries(blocked)) {
        html += `<div style="margin:5px 0;">${raceName}: ${count} чел. <button class="unblock-race-btn" data-race="${raceName}" data-count="${count}" data-captured-id="${capturedId}" style="background:#3a6b3a;">Перевести в провинцию</button></div>`;
    }
    html += `<button id="closeUnblockModal" style="background:#7a2a2a; margin-top:10px;">Закрыть</button></div>`;
    modal.innerHTML = html;
    document.body.appendChild(modal);
    document.getElementById('closeUnblockModal').addEventListener('click', () => modal.remove());
    document.querySelectorAll('.unblock-race-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const raceName = btn.getAttribute('data-race');
            const count = parseInt(btn.getAttribute('data-count'));
            const race = races.find(r => r.name === raceName);
            if (race) distributePopulation(race, count);
            delete blocked[raceName];
            if (Object.keys(blocked).length === 0) delete cs.settlementData.capturedData.blockedPopulation;
            addBuildingsLog(`👥 Разблокировано ${count} чел. расы "${raceName}" из "${cs.settlementData.name}".`);
            saveAllData();
            renderCapturedSettlements();
            if (typeof refreshPeopleUI === 'function') refreshPeopleUI();
            modal.remove();
        });
    });
}

// ========== 13. ЯЧЕЙКИ ПРОВИНЦИЙ ==========

function renderProvinceCells() {
    const container = document.getElementById('provinceCellsContainer');
    if (!container) return;
    const allIds = Object.keys(provincesData).sort((a, b) => {
        if (provincesData[a].isCapital) return -1;
        if (provincesData[b].isCapital) return 1;
        return a.localeCompare(b);
    });
    let html = '';
    for (let pid of allIds) {
        const prov = provincesData[pid];
        if (!prov) continue;
        const name = (PROVINCE_NAMES[pid] || pid);
        const isCapital = prov.isCapital === true;
        const isCurrent = (pid === currentProvince);
        let provPop = 0;
        if (prov.races) for (let race of prov.races) provPop += getRaceTotal(race);
        const taxpayers = Math.floor(provPop * 0.9);
        const income = Math.floor(taxpayers * (peopleState.settings.taxRate || 1));
        const provTreasury = prov.resources?.ers || 0;
        let resHtml = '';
        if (prov.resources) {
            for (let key in prov.resources) {
                const r = RESOURCES_REGISTRY[key];
                if (r) resHtml += `<span title="${r.name}"><img src="${r.icon}" style="width:18px;height:18px;vertical-align:middle;"> ${Math.floor(prov.resources[key])}</span> `;
            }
        }
        let racesHtml = '';
        if (prov.races && prov.races.length) {
            racesHtml = '<div style="font-size:0.85rem; margin-top:5px;">';
            for (let race of prov.races) {
                racesHtml += `<span style="margin-right:12px;">${race.name}: ${getRaceTotal(race).toLocaleString()}</span>`;
            }
            racesHtml += '</div>';
        }
        const selectBtn = `<button class="select-province-btn" data-province="${pid}" style="background:#3a5a2a; margin:2px;">🔍 Выбрать</button>`;
        const capitalBtn = !isCapital ? `<button class="capital-province-btn" data-province="${pid}" style="background:#b8860b; margin:2px;">⭐ Столица</button>` : '';
		const resourceEditBtn = `<button class="resource-editor-btn" data-province="${pid}" style="background:#b8860b; margin:2px;">⚒️ Редактор ресурсов</button>`;
        const exportBtn = `<button class="export-province-btn" data-province="${pid}" style="background:#b8860b; margin:2px;">📤 Экспорт</button>`;
        const deleteBtn = `<button class="delete-province-btn" data-province="${pid}" style="background:#7a2a2a; margin:2px;">🗑️ Удалить</button>`;
        html += `
            <div class="stat-card" style="border-left: 4px solid ${isCapital ? '#ffd966' : (isCurrent ? '#b87c4f' : '#555')};">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0;">${name}${isCapital ? ' ⭐' : ''}</h3>
                    <div>
                        ${selectBtn}
                        ${capitalBtn}
						${resourceEditBtn}
                        ${exportBtn}
                        ${deleteBtn}
                    </div>
                </div>
                <div style="margin-top:10px;">
                    <div>👥 ${provPop.toLocaleString()} чел. | 💰 Доход: ${income.toLocaleString()} эрсов/ход</div>
                    <div>🏦 Казна: ${provTreasury.toLocaleString()} эрсов</div>
                    <div style="margin-top:5px;">📦 Ресурсы: ${resHtml || 'нет данных'}</div>
                    ${racesHtml}
                </div>
            </div>
        `;
    }
    container.innerHTML = html;
    document.querySelectorAll('.select-province-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const select = document.getElementById('currentProvinceSelect');
            if (select) {
                select.value = this.dataset.province;
                select.dispatchEvent(new Event('change'));
            }
        });
    });
    document.querySelectorAll('.capital-province-btn').forEach(btn => {
        btn.addEventListener('click', () => setCapital(btn.dataset.province));
    });
    document.querySelectorAll('.export-province-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const old = currentProvince;
            currentProvince = this.dataset.province;
            exportProvince();
            currentProvince = old;
        });
    });
    document.querySelectorAll('.delete-province-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (deleteProvince(this.dataset.province)) {
                renderProvinceCells();
                refreshBuildingsUI();
            }
        });
    });
	document.querySelectorAll('.resource-editor-btn').forEach(btn => {
		btn.addEventListener('click', function() {
			openProvinceResourceEditor(this.dataset.province);
		});
	});
}

function setCapital(provinceId) {
    for (let pid in provincesData) {
        if (provincesData[pid].isCapital) {
            provincesData[pid].isCapital = false;
            break;
        }
    }
    if (provincesData[provinceId]) {
        provincesData[provinceId].isCapital = true;
        addBuildingsLog(`⭐ Провинция "${PROVINCE_NAMES[provinceId] || provinceId}" назначена столицей.`);
        saveAllData();
        refreshBuildingsUI();
    }
}

function deleteProvince(provinceId) {
    const allIds = Object.keys(provincesData);
    const isLastProvince = (allIds.length <= 1);
    const name = (PROVINCE_NAMES[provinceId] || provinceId);
    const factionName = (typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[window.currentFaction]) 
        ? FACTION_NAMES[window.currentFaction] 
        : 'Ваша фракция';

    // Если это не последняя провинция – удаляем без вопросов
    if (!isLastProvince) {
        if (!confirm(`Удалить провинцию "${name}" безвозвратно?`)) return false;
        const wasCapital = provincesData[provinceId].isCapital;
        delete provincesData[provinceId];
        if (currentProvince === provinceId) {
            currentProvince = Object.keys(provincesData)[0];
        }
        if (wasCapital) {
            const firstId = Object.keys(provincesData)[0];
            if (firstId) {
                provincesData[firstId].isCapital = true;
                addBuildingsLog(`⭐ Новая столица: "${PROVINCE_NAMES[firstId] || firstId}".`);
            }
        }
        recalcTotalTreasury();
        addBuildingsLog(`🗑️ Провинция "${name}" удалена.`);
        saveAllData();
        if (typeof recalcMaxConstructionSlots === 'function') {
            recalcMaxConstructionSlots();
        }
        refreshBuildingsUI();
        return true;
    }

    // Это последняя провинция – показываем окно поражения
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(10,8,14,0.9);backdrop-filter:blur(6px);z-index:2000;display:flex;justify-content:center;align-items:center';
    modal.innerHTML = `
        <div style="background:rgba(18,14,12,0.95);border:2px solid #b8943a;border-radius:4px;padding:30px;max-width:500px;width:90%;color:#d4c9b8;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.9);">
            <h2 style="color:#ff4444;margin-top:0;">⚔️ Поражение фракции</h2>
            <p style="font-size:1.2rem;margin:20px 0;">Фракция <strong style="color:#ffd966;">${escapeHtml(factionName)}</strong> потерпела поражение.</p>
            <p>Она потеряла все свои провинции, армии и влияние.</p>
            <p style="margin-top:20px;font-size:0.9rem;color:#8a7a5a;">Нажмите «Сбросить данные», чтобы начать заново.</p>
            <div style="display:flex;gap:10px;justify-content:center;margin-top:25px;">
                <button id="confirmDefeatBtn" style="background:#7a2a2a;padding:10px 30px;font-size:1rem;">Подтвердить поражение</button>
                <button id="cancelDefeatBtn" style="background:#5e3a22;padding:10px 30px;font-size:1rem;">Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('cancelDefeatBtn').onclick = () => modal.remove();

    document.getElementById('confirmDefeatBtn').onclick = () => {
        modal.remove();

        // ---------- НОВОЕ: помечаем все поселения как нейтральные в общей карте ----------
        for (let pid in provincesData) {
            const prov = provincesData[pid];
            if (prov && prov.settlements) {
                for (let s of prov.settlements) {
                    if (typeof updateSharedMapData === 'function') {
                        updateSharedMapData(s.id, null);  // null = поселение больше никому не принадлежит
                    }
                }
            }
        }
        // --------------------------------------------------------------------------------

        // Сохраняем флаг поражения в отдельный ключ, чтобы показать сообщение при следующем входе
        const defeatKey = 'defeated_' + (window.storageKey || 'unified_province_manager');
        localStorage.setItem(defeatKey, 'true');
        // Удаляем основные данные фракции
        localStorage.removeItem(window.storageKey || 'unified_province_manager');
        // Перезагружаем страницу
        location.reload();
    };

    return false;
}

// ========== 14. ЭКСПОРТ/ИМПОРТ ПРОВИНЦИЙ ==========

function exportProvince() {
    const provinceId = currentProvince;
    const province = provincesData[provinceId];
    if (!province) { alert('Нет данных о текущей провинции'); return; }
    const originalIsCapital = province.isCapital;
    province.isCapital = false;
    const exportData = {
        provinceId: provinceId,
        provinceName: (PROVINCE_NAMES[provinceId] || provinceId),
        originalFaction: currentFaction,
        data: province
    };
    const jsonStr = JSON.stringify(exportData, null, 2);
    province.isCapital = originalIsCapital;
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:2000;display:flex;justify-content:center;align-items:center';
    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:700px;width:90%;">
            <h3>📤 Экспорт провинции: ${escapeHtml(PROVINCE_NAMES[provinceId] || provinceId)}</h3>
            <p>Данные провинции готовы к передаче. Столичный статус не экспортируется.</p>
            <textarea readonly style="width:100%; height:300px; background:#2a241c; color:#f0e6d0; border:1px solid #b87c4f; border-radius:12px; padding:10px;">${escapeHtml(jsonStr)}</textarea>
            <div style="margin-top:10px; display:flex; gap:10px;">
                <button id="copyProvinceBtn">📋 Копировать</button>
                <button id="saveProvinceBtn">💾 Сохранить файл</button>
                <button id="closeExportProvinceBtn" style="background:#7a2a2a;">Закрыть</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('copyProvinceBtn').addEventListener('click', () => {
        navigator.clipboard.writeText(jsonStr).then(() => alert('Скопировано!'));
    });
    document.getElementById('saveProvinceBtn').addEventListener('click', () => {
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `province_${provinceId}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
    });
    document.getElementById('closeExportProvinceBtn').addEventListener('click', () => modal.remove());
}

function importProvinceFromFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (!data.provinceId || !data.data) { alert('Неверный формат файла провинции'); return; }
            const targetProvinceId = data.provinceId;
            const importedProvince = data.data;
            const originalFaction = data.originalFaction || 'unknown';
            
            // Очищаем всех вассалов у импортируемой провинции – теперь всё под прямым управлением
            if (importedProvince.settlements) {
                for (let settlement of importedProvince.settlements) {
                    settlement.vassalHouse = null;
                    settlement.captured = false;
                    settlement.capturedByFaction = null;
                    settlement.capturedData = null;
                }
            }
            importedProvince.isCapital = false;

            if (window.provincesData[targetProvinceId]) {
                const existingName = PROVINCE_NAMES[targetProvinceId] || targetProvinceId;
                const modal = document.createElement('div');
                modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:2000;display:flex;justify-content:center;align-items:center';
                modal.innerHTML = `
                    <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:500px;width:90%;">
                        <h3>⚠️ Провинция "${escapeHtml(existingName)}" уже существует</h3>
                        <p>Импортируемая провинция из фракции "${escapeHtml(originalFaction)}".</p>
                        <p>Как вы хотите поступить?</p>
                        <div style="display:flex; gap:10px; margin-top:15px;">
                            <button id="replaceProvinceBtn" style="background:#7a2a2a;">🔄 Заменить полностью</button>
                            <button id="mergeProvinceBtn" style="background:#b8860b;">🔀 Объединить</button>
                            <button id="cancelImportBtn" style="background:#5e3a22;">Отмена</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
                document.getElementById('cancelImportBtn').addEventListener('click', () => modal.remove());
                document.getElementById('replaceProvinceBtn').addEventListener('click', () => {
                    window.provincesData[targetProvinceId] = importedProvince;
                    finishProvinceImport(targetProvinceId, originalFaction);
                    modal.remove();
                });
                document.getElementById('mergeProvinceBtn').addEventListener('click', () => {
                    mergeProvince(targetProvinceId, importedProvince);
                    finishProvinceImport(targetProvinceId, originalFaction);
                    modal.remove();
                });
            } else {
                window.provincesData[targetProvinceId] = importedProvince;
                finishProvinceImport(targetProvinceId, originalFaction);
            }
        } catch(err) {
            alert('Ошибка чтения файла: ' + err.message);
        }
    };
    reader.readAsText(file);
}

function mergeProvince(targetProvinceId, importedProvince) {
    const existing = window.provincesData[targetProvinceId];

    // Объединяем ресурсы
    for (let res in importedProvince.resources) {
        if (existing.resources[res] !== undefined) {
            existing.resources[res] += importedProvince.resources[res];
        } else {
            existing.resources[res] = importedProvince.resources[res];
        }
    }

    // Объединяем расы
    if (importedProvince.races) {
        for (let impRace of importedProvince.races) {
            const existRace = existing.races.find(r => r.name === impRace.name);
            if (existRace) {
                existRace.adultMale += impRace.adultMale || 0;
                existRace.adultFemale += impRace.adultFemale || 0;
                existRace.children += impRace.children || 0;
                existRace.elders += impRace.elders || 0;
            } else {
                existing.races.push({ ...impRace });
            }
        }
    }

    // Объединяем поселения (без дубликатов)
    if (importedProvince.settlements) {
        const existingIds = new Set(existing.settlements.map(s => s.id));
        for (let impSet of importedProvince.settlements) {
            if (!existingIds.has(impSet.id)) {
                existing.settlements.push(impSet);
            }
        }
    }

    // Объединяем оккупированные земли
    if (importedProvince.capturedSettlements) {
        if (!existing.capturedSettlements) existing.capturedSettlements = [];
        const existingCaptIds = new Set(existing.capturedSettlements.map(cs => cs.settlementId));
        for (let impCapt of importedProvince.capturedSettlements) {
            if (!existingCaptIds.has(impCapt.settlementId)) {
                existing.capturedSettlements.push(impCapt);
            }
        }
    }

    // Пересчитываем лимит строек
    if (typeof recalcMaxConstructionSlots === 'function') {
        recalcMaxConstructionSlots();
    }

    addBuildingsLog(`🔀 Провинция "${PROVINCE_NAMES[targetProvinceId] || targetProvinceId}" объединена с импортированной.`);
}

function finishProvinceImport(targetProvinceId, originalFaction) {
    addBuildingsLog(`📥 Провинция "${PROVINCE_NAMES[targetProvinceId] || targetProvinceId}" импортирована из фракции "${originalFaction}".`);

    // ---------- НОВОЕ: обновляем общую карту – все поселения теперь принадлежат текущей фракции ----------
    if (window.provincesData[targetProvinceId] && window.provincesData[targetProvinceId].settlements) {
        for (let s of window.provincesData[targetProvinceId].settlements) {
            if (typeof updateSharedMapData === 'function') {
                updateSharedMapData(s.id, window.currentFaction);
            }
        }
    }
    // --------------------------------------------------------------------------------------------------------

    if (provincesData[targetProvinceId] && provincesData[targetProvinceId].capturedSettlements) {
        provincesData[targetProvinceId].capturedSettlements = [];
    }
    if (!currentProvince || !provincesData[currentProvince]) {
        currentProvince = targetProvinceId;
    }
    if (typeof recalcMaxConstructionSlots === 'function') {
        recalcMaxConstructionSlots();
    }
    recalcTotalTreasury();
    enforceBuildingLimits();
    saveAllData();
    refreshBuildingsUI();
    if (typeof refreshPeopleUI === 'function') refreshPeopleUI();
    if (typeof renderProvinceDashboard === 'function') renderProvinceDashboard();
    if (typeof renderCapturedSettlements === 'function') renderCapturedSettlements();
}

// ========== 15. ДАШБОРД ПРОВИНЦИЙ ==========

function renderProvinceDashboard() {
    const container = document.getElementById('provinceDashboard');
    if (!container) return;
    const allIds = Object.keys(provincesData);
    let totalPop = 0, totalIncome = 0;
    const totalRes = { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 };
    for (let pid of allIds) {
        const prov = provincesData[pid];
        if (!prov) continue;
        let provPop = 0;
        if (prov.races) for (let race of prov.races) provPop += getRaceTotal(race);
        totalPop += provPop;
        const taxpayers = Math.floor(provPop * 0.9);
        totalIncome += Math.floor(taxpayers * (peopleState.settings.taxRate || 1));
        if (prov.resources) {
            for (let key in totalRes) totalRes[key] += prov.resources[key] || 0;
        }
    }
    let resHtml = '';
    for (let key in totalRes) {
        const r = RESOURCES_REGISTRY[key];
        if (r && key !== 'ers') resHtml += `<div><img src="${r.icon}" style="width:20px;height:20px;vertical-align:middle;"> ${Math.floor(totalRes[key])}</div>`;
    }
	const totalUpkeep = (typeof calculateTotalUpkeep === 'function') ? calculateTotalUpkeep() : 0;
    container.innerHTML = `
        <div class="stat-card" style="background: #1f1c14; border-color: #ffd966;">
            <div class="flex-row" style="justify-content: space-around; flex-wrap: wrap; gap: 15px;">
				<div><strong>👥 Население:</strong> ${totalPop.toLocaleString()}</div>
				<div><strong>💰 Доход/ход:</strong> ${totalIncome.toLocaleString()} эрсов</div>
				<div><strong>⚔️ Содержание:</strong> ${totalUpkeep.toLocaleString()} эрсов/ход</div>
				<div><strong>🏦 Казна:</strong> ${Math.floor(window.factionTreasury || 0).toLocaleString()} эрсов</div>
			</div>
            <div class="flex-row" style="justify-content: space-around; flex-wrap: wrap; gap: 15px; margin-top: 10px; border-top: 1px solid #b87c4f; padding-top: 10px;">
                <div><strong>📦 Ресурсы:</strong></div>
                ${resHtml}
            </div>
        </div>
    `;
}

function enforceBuildingLimits() {
    const factionProvinces = (typeof getCurrentFactionProvinces === 'function') 
        ? getCurrentFactionProvinces() 
        : [currentProvince];
    const limitsChecked = new Set();

    for (let pid of factionProvinces) {
        const prov = provincesData[pid];
        if (!prov || !prov.settlements) continue;

        for (let settlement of prov.settlements) {
            if (settlement.captured) continue;

            for (let building of settlement.buildings) {
                if (!building.completed) continue;

                const baseName = building.baseName || building.name;
                const def = buildingsCatalog[baseName];
                if (!def || !def.limit) continue;

                const limitKey = def.limit.scope + '|' + baseName;
                if (limitsChecked.has(limitKey)) continue;

                // Собираем все активные постройки этого типа (не пустышки)
                const allActive = [];
                for (let pid2 of factionProvinces) {
                    const prov2 = provincesData[pid2];
                    if (!prov2 || !prov2.settlements) continue;
                    for (let s2 of prov2.settlements) {
                        if (s2.captured) continue;
                        for (let b2 of s2.buildings) {
                            if (!b2.completed) continue;
                            if (b2.isDummy) continue;
                            if ((b2.baseName || b2.name) === baseName) {
                                allActive.push({ building: b2, settlement: s2, province: pid2 });
                            }
                        }
                    }
                }

                const max = def.limit.max;
                if (allActive.length > max) {
                    // Оставляем первые max активными, остальные превращаем в пустышки
                    const toDeactivate = allActive.slice(max);
                    const dummyKey = baseName + "_dummy";

                    for (let item of toDeactivate) {
                        const b = item.building;
                        // Используем пустышку из каталога, если есть
                        const dummyDef = buildingsCatalog[dummyKey] || {};
                        b.name = dummyDef.name || (b.name + " (неактивна)");
                        b.baseName = dummyKey;
                        b.special = null;
                        b.income = {};
                        b.isDummy = true;
                        b.level = 1;
                        if (b.isUpgrade) delete b.isUpgrade;
                        addBuildingsLog(`🏚️ Постройка "${item.building.name}" в "${item.settlement.name}" стала неактивной (лимит ${max} для ${def.limit.scope})`);
                    }
                }

                limitsChecked.add(limitKey);
            }
        }
    }

    if (limitsChecked.size > 0) {
        saveAllData();
        refreshBuildingsUI();
    }
}
function openSettlementEditModal(settlementId) {
    const data = provincesData[currentProvince];
    if (!data) return;
    const settlement = data.settlements.find(s => s.id === settlementId);
    if (!settlement) return;

    let vassalOptions = '<option value="">🏰 Главный род</option>';
    if (typeof factionCouncils !== 'undefined' && factionCouncils[window.currentFaction]) {
        const council = factionCouncils[window.currentFaction];
        for (let house of council.houses) {
            const sel = (settlement.vassalHouse === house.id) ? 'selected' : '';
            vassalOptions += `<option value="${house.id}" ${sel}>🛡️ ${escapeHtml(house.name)}</option>`;
        }
    }

    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:2000;display:flex;justify-content:center;align-items:center;';

    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:450px;width:90%;color:#e6ddb3;">
            <h3>✏️ Редактировать поселение</h3>
            <label>Название: <input type="text" id="editSettlementName" value="${escapeHtml(settlement.name)}" style="width:100%;margin-top:5px;"></label>
            <label style="margin-top:10px;">Принадлежит:
                <select id="editSettlementOwner" style="width:100%;margin-top:5px;">
                    ${vassalOptions}
                </select>
            </label>
            <div style="margin-top:15px; display:flex; gap:10px; justify-content:flex-end;">
                <button id="saveSettlementEditBtn">✅ Сохранить</button>
                <button id="cancelSettlementEditBtn" style="background:#7a2a2a;">Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('cancelSettlementEditBtn').onclick = () => modal.remove();

    document.getElementById('saveSettlementEditBtn').onclick = () => {
        const newName = document.getElementById('editSettlementName').value.trim();
        if (!newName) { alert('Название не может быть пустым'); return; }
        settlement.name = newName;
        settlement.vassalHouse = document.getElementById('editSettlementOwner').value || null;
        addBuildingsLog(`✏️ Поселение "${settlement.name}" обновлено.`);
        saveAllData();
        refreshBuildingsUI();
        modal.remove();
    };
}
function hasActiveBuilding(special) {
	if (typeof provincesData === 'undefined') return false;
    const provinces = (typeof getCurrentFactionProvinces === 'function') 
        ? getCurrentFactionProvinces() 
        : Object.keys(provincesData);
    for (let pid of provinces) {
        const prov = provincesData[pid];
        if (!prov || !prov.settlements) continue;
        for (let s of prov.settlements) {
            if (s.captured) continue;
            for (let b of s.buildings) {
                if (b.completed && b.special === special) return true;
            }
        }
    }
    return false;
}
function getEngineerBuildBonus(settlementId) {
    if (typeof armies === 'undefined') return 0;
    for (let army of armies) {
        if (army.factionId !== window.currentFaction) continue;
        if (army.garrison === settlementId) {
            // Ищем отряд по unitKey или по названию
            const hasEngineers = army.units.some(u => 
                u.unitKey === 'Корпус инженеров Лорейна' || 
                u.name === 'Корпус инженеров Лорейна'
            );
            if (hasEngineers) return 1; // -1 ход к строительству
        }
    }
    return 0;
}
// ========== УПРАВЛЕНИЕ СТРОЙКОЙ ==========

function cancelBuilding(settlementId, buildingId) {
    const data = provincesData[currentProvince];
    if (!data) return;
    const settlement = data.settlements.find(s => s.id === settlementId);
    if (!settlement) return;
    const buildingIndex = settlement.buildings.findIndex(b => b.id === buildingId);
    if (buildingIndex === -1) return;
    
    const building = settlement.buildings[buildingIndex];
    if (building.completed) {
        addBuildingsLog('❌ Нельзя отменить завершённое строительство.');
        return;
    }
    
    if (!confirm(`Отменить строительство "${building.name}"? Вернётся 50% ресурсов.`)) return;
    
    // Определяем стоимость из каталога
    const catalogDef = buildingsCatalog[building.baseName];
    if (catalogDef && catalogDef.cost) {
        const cost = catalogDef.cost;
        // Возвращаем 50% ресурсов в провинцию
        data.resources.wood += Math.floor(cost.wood * 0.5);
        data.resources.stone += Math.floor(cost.stone * 0.5);
        data.resources.iron += Math.floor(cost.iron * 0.5);
        data.resources.gold += Math.floor(cost.gold * 0.5);
        data.resources.ers += Math.floor(cost.ers * 0.5);
        recalcTotalTreasury();
    }
    
    // Удаляем постройку
    settlement.buildings.splice(buildingIndex, 1);
    peopleState.activeConstructionCount = Math.max(0, (peopleState.activeConstructionCount || 0) - 1);
    // Обновление интерфейса в реальном времени
	if (typeof updateGlobalResourcesDisplay === 'function') updateGlobalResourcesDisplay();
	if (typeof updateTreasuryDisplay === 'function') updateTreasuryDisplay();
    addBuildingsLog(`🏚️ Строительство "${building.name}" отменено. Возвращено 50% ресурсов.`);
    saveAllData();
    refreshBuildingsUI();
    if (typeof refreshPeopleUI === 'function') refreshPeopleUI();
}

function freezeBuilding(settlementId, buildingId) {
    const data = provincesData[currentProvince];
    if (!data) return;
    const settlement = data.settlements.find(s => s.id === settlementId);
    if (!settlement) return;
    const building = settlement.buildings.find(b => b.id === buildingId);
    if (!building) return;
    if (building.completed) {
        addBuildingsLog('❌ Нельзя заморозить завершённую постройку.');
        return;
    }
    if (building.frozen) {
        addBuildingsLog('❌ Постройка уже заморожена.');
        return;
    }
    
    building.frozen = true;
    addBuildingsLog(`❄️ Строительство "${building.name}" заморожено.`);
    saveAllData();
    refreshBuildingsUI();
}

function unfreezeBuilding(settlementId, buildingId) {
    const data = provincesData[currentProvince];
    if (!data) return;
    const settlement = data.settlements.find(s => s.id === settlementId);
    if (!settlement) return;
    const building = settlement.buildings.find(b => b.id === buildingId);
    if (!building) return;
    if (!building.frozen) {
        addBuildingsLog('❌ Постройка не заморожена.');
        return;
    }
    
    building.frozen = false;
    addBuildingsLog(`▶️ Строительство "${building.name}" разморожено.`);
    saveAllData();
    refreshBuildingsUI();
}

// Привязка обработчиков (добавить в конец refreshBuildingsUI или в отдельную функцию)
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('cancel-build-btn')) {
        const settlementId = e.target.dataset.settlementId;
        const buildingId = e.target.dataset.buildingId;
        cancelBuilding(settlementId, buildingId);
    }
    if (e.target.classList.contains('freeze-build-btn')) {
        const settlementId = e.target.dataset.settlementId;
        const buildingId = e.target.dataset.buildingId;
        freezeBuilding(settlementId, buildingId);
    }
    if (e.target.classList.contains('unfreeze-build-btn')) {
        const settlementId = e.target.dataset.settlementId;
        const buildingId = e.target.dataset.buildingId;
        unfreezeBuilding(settlementId, buildingId);
    }
});
function demolishBuilding(settlementId, buildingId) {
    const data = provincesData[currentProvince];
    if (!data) return;
    const settlement = data.settlements.find(s => s.id === settlementId);
    if (!settlement) return;
    const buildingIndex = settlement.buildings.findIndex(b => b.id === buildingId);
    if (buildingIndex === -1) return;
    
    const building = settlement.buildings[buildingIndex];
    if (!building.completed) {
        addBuildingsLog('❌ Нельзя снести строящееся здание. Используйте "Отменить".');
        return;
    }
    
    if (!confirm(`Снести "${building.name}"? Процесс займёт 1 ход. Золото вернётся на 30%.`)) return;
    
    // Возвращаем 30% золота, если оно было в стоимости
    const catalogDef = buildingsCatalog[building.baseName];
    if (catalogDef && catalogDef.cost && catalogDef.cost.gold > 0) {
        const goldRefund = Math.floor(catalogDef.cost.gold * 0.3);
        data.resources.gold += goldRefund;
        addBuildingsLog(`💰 Возвращено ${goldRefund} золота (30% от стоимости).`);
    }
    
    // Помечаем здание как сносимое (займёт 1 ход)
    building.demolishing = true;
    building.demolishTurns = 1;
    building.completed = false; // чтобы не давало эффект во время сноса
    
    addBuildingsLog(`🏚️ Начат снос "${building.name}". Здание будет удалено через 1 ход.`);
    saveAllData();
    refreshBuildingsUI();
}
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('demolish-btn')) {
        const settlementId = e.target.dataset.settlementId;
        const buildingId = e.target.dataset.buildingId;
        demolishBuilding(settlementId, buildingId);
    }
});
// Экспорт
window.demolishBuilding = demolishBuilding;
window.cancelBuilding = cancelBuilding;
window.freezeBuilding = freezeBuilding;
window.unfreezeBuilding = unfreezeBuilding;
window.getEngineerBuildBonus = getEngineerBuildBonus;
window.getEngineerBuildBonus = getEngineerBuildBonus;
window.hasActiveBuilding = hasActiveBuilding;
window.openProvinceResourceEditor = openProvinceResourceEditor;
window.enforceBuildingLimits = enforceBuildingLimits;
window.smeltSwordIron = smeltSwordIron;
console.log("✅ buildings.js загружен — версия 6.0 (единая казна, ячейки провинций, импорт без сброса)");