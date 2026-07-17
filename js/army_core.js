// ============================================================================
// МОДУЛЬ: army_core.js (версия 16.0 – полный цикл битвы и найма)
// ============================================================================
// Загружено на гитхаб 18.07.2026
// Глобальный массив армий
window.armies = window.armies || [];
let lastSelectedArmyId = null;

// ========== ФИНАНСЫ ==========
function getCurrentTreasury() {
    return window.factionTreasury || 0;
}
function deductTreasury(amount) {
    window.factionTreasury = Math.max(0, (window.factionTreasury || 0) - amount);
}
window.deductTreasury = deductTreasury;
// ========== ЗАГЛУШКИ ДЛЯ СОВМЕСТИМОСТИ ==========
function calculateTotalUpkeep() {
    let total = 0;
    for (let army of window.armies) {
        if (army.factionId !== window.currentFaction) continue;
        for (let unit of army.units) {
            total += (unit.upkeep || 0) * (unit.count || 0);
        }
    }
    return Math.floor(total);
}

function saveArmyData() {
    // Сохраняем через общую функцию saveAllData (если доступна)
    if (typeof saveAllData === 'function') {
        saveAllData();
    } else {
        // fallback: сохраняем в основной ключ вручную
        const key = window.storageKey || 'unified_province_manager';
        const existingData = JSON.parse(localStorage.getItem(key) || '{}');
        existingData.armies = window.armies;
        existingData.lastSelectedArmyId = lastSelectedArmyId;
        localStorage.setItem(key, JSON.stringify(existingData));
    }
}

function loadArmyData() {
    const key = window.storageKey || 'unified_province_manager';
    const saved = localStorage.getItem(key);
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.armies && Array.isArray(data.armies)) {
                window.armies = data.armies;
            }
            if (data.lastSelectedArmyId) {
                lastSelectedArmyId = data.lastSelectedArmyId;
            }
        } catch (e) {
            console.error("Ошибка загрузки армий:", e);
            window.armies = [];
        }
    } else {
        window.armies = [];
    }
    // Инициализация полей для старых сохранений
    for (let a of window.armies) {
        if (!a.recruitmentQueue) a.recruitmentQueue = [];
        if (!a.units) a.units = [];
        if (!a.garrison) a.garrison = null;
    }
}

// Вызовите загрузку сразу при старте модуля (если ещё не сделано)
if (!window.armies || window.armies.length === 0) {
    loadArmyData();
}

// ========== ПУЛЫ ЮНИТОВ ПО РИТОРИКЕ ==========
const RHETORIC_UNIT_POOLS = {
    dayo: { name: "Даё", units: [ "Селяне-ополченцы оку", "Ополчение оку", "Гоблины асигару", "Гайдзины асигару пикинёры", "Гайдзины асигару лучники", "Мураи", "Онна-бугэйся", "Кишины", "Бизоньи всадники", "Налетчики на вивернах" ], icon: "icons/dayo_flag.png", color: "#ff6b6b" },
    loyal: { name: "Лоялисты", units: [ "Селяне-ополченцы люди", "Ополчение люди", "Лучники", "Мечники", "Пикинёры", "Гоблинские арбалетчики", "Рейнджеры", "Валькирии", "Вольные рыцари", "Орлиные рыцари", "Боевые монахини Варситэи" ], icon: "icons/loyal_flag.png", color: "#4a90d9" },
    neutral: { name: "Нейтралы", units: [ "Селяне-ополченцы люди", "Ополчение люди", "Лучники", "Мечники", "Пикинёры", "Рейнджеры", "Мясники Варсиса", "Гамураи", "Вольные рыцари", "Орлиные рыцари" ], icon: "icons/neutral_flag.png", color: "#cfc294" },
    proyurgan: { name: "Проюрганцы", units: [ "Селяне-ополченцы люди", "Ополчение люди", "Лучники", "Добровольческий корпус", "Мечники", "Пикинёры", "Рейнджеры", "Дэфекторы", "Вольные рыцари", "Орлиные рыцари" ], icon: "icons/proyurgan_flag.png", color: "#8b4513" },
    lepus: { name: "Союз Лепус", units: [ "Селяне-ополченцы люди", "Ополчение люди", "Лучники", "Мечники", "Пикинёры", "Рейнджеры", "Вольные рыцари", "Орлиные рыцари" ], icon: "icons/lepus_flag.png", color: "#6a9fb5" }
};

function getCurrentRhetoricByFaction() {
    if (typeof FACTION_TO_RHETORIC !== 'undefined' && FACTION_TO_RHETORIC[currentFaction]) {
        return FACTION_TO_RHETORIC[currentFaction];
    }
    return "neutral";
}

function getUnitsForCurrentFaction() {
    const rhetoric = getCurrentRhetoricByFaction();
    const pool = RHETORIC_UNIT_POOLS[rhetoric];
    if (!pool) return [];
    const units = [];
    const db = window.unitDatabase || {};

    // 1. Юниты из риторического пула
    for (let unitKey of pool.units) {
        if (db[unitKey]) {
            const unit = db[unitKey];
            if (unit.faction && unit.faction !== window.currentFaction) continue;
            units.push({ key: unitKey, ...unit });
        }
    }

    // 2. Наёмники (доступны всем, если нет привязки к фракции)
    const mercs = window.MERCENARY_UNITS || {};
    for (let [key, unit] of Object.entries(mercs)) {
        if (unit.faction && unit.faction !== window.currentFaction) continue;
        units.push({ key, ...unit });
    }

    // 3. Фракционные юниты, не входящие в пулы (игнорируем уникальных стражей)
    for (let unitKey in db) {
        const unit = db[unitKey];
        if (unit.faction && unit.faction === window.currentFaction) {
            if (unit.isUniqueGuardian) continue;   // ← големов не показываем
            if (!units.some(u => u.key === unitKey)) {
                units.push({ key: unitKey, ...unit });
            }
        }
    }
	// Применяем эффекты построек к характеристикам
	for (let unit of units) {
		if (unit.key === 'Железный ордонанс' && typeof hasActiveBuilding === 'function' && hasActiveBuilding('meyan_tournament')) {
			unit.upkeep = 5;
			unit.morale = 14;
		}
		if (unit.key === 'Вольные рыцари' && typeof hasActiveBuilding === 'function' && hasActiveBuilding('tournament')) {
			unit.strengthMelee = (unit.strengthMelee || unit.strength || 0) + 1;
		}
	}
	if (typeof hasActiveBuilding === 'function' && hasActiveBuilding('fenrir_altar')) {
		for (let unit of units) {
			unit.morale = (unit.morale || 0) + 1;
		}
	}
    return units;
}

// ========== СОЗДАНИЕ АРМИИ ==========
function createNewArmy(name = null) {
    const provinces = Object.keys(provincesData);
    const capitalProvince = provinces.length > 0 ? provinces[0] : null;

    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:2000;display:flex;justify-content:center;align-items:center';

    let provinceOptions = '';
    for (let pid of provinces) {
        const pname = (typeof PROVINCE_NAMES !== 'undefined' && PROVINCE_NAMES[pid]) ? PROVINCE_NAMES[pid] : pid;
        provinceOptions += `<option value="${pid}">${pname}</option>`;
    }

    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:450px;width:90%;">
            <h3>🛡️ СОЗДАНИЕ НОВОЙ АРМИИ</h3>
            <div><label>🏘️ Провинция размещения:</label><select id="newArmyProvinceSelect">${provinceOptions}</select></div>
            <div><label>🏰 Поселение (гарнизон):</label><select id="newArmySettlementSelect"></select></div>
            <div><label>📝 Название армии:</label><input type="text" id="newArmyNameInput" value=""></div>
            <div><label>👑 Командир:</label><input type="text" id="newArmyCommanderInput" value="Не назначен"></div>
            <div style="display:flex;gap:10px;margin-top:15px;"><button id="confirmCreateArmyBtn">✅ Создать</button><button id="cancelCreateArmyBtn">❌ Отмена</button></div>
        </div>
    `;
    document.body.appendChild(modal);

    const provinceSelect = modal.querySelector('#newArmyProvinceSelect');
    const settlementSelect = modal.querySelector('#newArmySettlementSelect');
    const nameInput = modal.querySelector('#newArmyNameInput');
    const commanderInput = modal.querySelector('#newArmyCommanderInput');

    function updateSettlements(provinceId) {
        settlementSelect.innerHTML = '';
        // Собираем все провинции фракции
        const factionProvinces = (typeof getCurrentFactionProvinces === 'function') ? getCurrentFactionProvinces() : [provinceId];
        // Фильтруем: поселения из этих провинций, тип city или castle
        const settlements = Object.values(SETTLEMENTS_DB)
            .filter(s => factionProvinces.includes(s.province) && (s.type === 'city' || s.type === 'castle'))
            .sort((a,b) => a.name.localeCompare(b.name));
        if (!settlements.length) {
            settlementSelect.innerHTML = '<option value="">-- нет доступных --</option>';
            return;
        }
        for (let s of settlements) {
            settlementSelect.innerHTML += `<option value="${s.id}">${s.name} (${s.type === 'city' ? 'Город' : 'Замок'})</option>`;
        }
    }
    updateSettlements(provinceSelect.value);
    provinceSelect.addEventListener('change', () => updateSettlements(provinceSelect.value));

    modal.querySelector('#confirmCreateArmyBtn').onclick = () => {
        const selectedSettlement = settlementSelect.value;
        if (!selectedSettlement) { alert('Выберите поселение'); return; }
        const armyName = nameInput.value.trim() || `Армия ${window.armies.filter(a => a.factionId === currentFaction).length + 1}`;
        const commander = commanderInput.value.trim() || "Не назначен";

        const newArmy = {
            id: (typeof generateId === 'function') ? generateId() : Date.now() + '-' + Math.random(),
            name: armyName,
            units: [],
            recruitmentQueue: [],
            factionId: currentFaction,
            garrison: selectedSettlement,
            commander: commander,
            motto: "",
            foundationDate: (typeof getCurrentDateString === 'function') ? getCurrentDateString() : new Date().toLocaleString(),
            battleHistory: [],
            reserveRear: []
        };
        window.armies.push(newArmy);
        saveArmyData();
        if (typeof window.renderArmy === 'function') {
            window.renderArmy();
        }
        if (typeof refreshRecruitmentLimits === 'function') refreshRecruitmentLimits();
        const settlementName = SETTLEMENTS_DB[selectedSettlement]?.name || selectedSettlement;
        addGlobalLog(`➕ Создана новая армия "${armyName}" в поселении ${settlementName}. Командир: ${commander}`, 'army');
        modal.remove();
    };
    modal.querySelector('#cancelCreateArmyBtn').onclick = () => modal.remove();
}

function deleteArmy(armyId) {
    const army = window.armies.find(a => a.id === armyId);
    if (army && confirm(`Удалить армию "${army.name}"?`)) {
        window.armies = window.armies.filter(a => a.id !== armyId);
        saveArmyData();
        if (typeof renderArmy === 'function') renderArmy();
        return true;
    }
    return false;
}

function checkUnitLimit(unitKey) {
    const db = window.unitDatabase || {};
    const mercs = window.MERCENARY_UNITS || {};
    const unitDef = db[unitKey] || mercs[unitKey];
    if (!unitDef || unitDef.maxCount === null || unitDef.maxCount === undefined) return true; // нет лимита

    let maxAllowed = unitDef.maxCount;   // <-- было const, стало let

    // Бонус от построек (должен быть до проверки)
    if (unitKey === 'Железный ордонанс' && typeof hasActiveBuilding === 'function' && hasActiveBuilding('meyan_tournament')) {
        maxAllowed += 1;
    }
    if (unitKey === 'Вольные рыцари' && typeof hasActiveBuilding === 'function' && hasActiveBuilding('tournament')) {
        maxAllowed = 7; // фиксированный лимит 7
    }
	// Бонус от технологий
	if (unitKey === 'Чёрная гвардия' && typeof researchData !== 'undefined' && researchData.completedTechs && researchData.completedTechs.includes('dionia_cavalry_school')) {
		maxAllowed += 1;
	}

    const factionArmies = (window.armies || []).filter(a => a.factionId === currentFaction);
    let currentCount = 0;

    for (let army of factionArmies) {
        // Уже готовые отряды
        for (let unit of army.units) {
            if (unit.unitKey === unitKey) currentCount++;
        }
        // Отряды в очереди найма
        if (army.recruitmentQueue) {
            for (let q of army.recruitmentQueue) {
                if (q.unitKey === unitKey) currentCount++;
            }
        }
    }

    if (currentCount >= maxAllowed) {
        alert(`Достигнут лимит отрядов "${unitDef.name}"! Максимум: ${maxAllowed} отряда/ов.`);
        addGlobalLog(`❌ Найм "${unitDef.name}" невозможен: лимит ${maxAllowed} отрядов (уже есть ${currentCount}).`, 'army');
        return false;
    }
    return true;
}

// ========== НАЙМ (ЧЕРЕЗ ОЧЕРЕДЬ) ==========
function addUnitToArmy(armyId, unitKey, count = 1) {
    const db = window.unitDatabase || {};
    const mercs = window.MERCENARY_UNITS || {};
    const base = db[unitKey] || mercs[unitKey];
    if (!base) {
        alert(`Юнит "${unitKey}" не найден в базе.`);
        return false;
    }

    const army = window.armies.find(a => a.id === armyId);
    if (!army) {
        alert('Армия не найдена. Сначала создайте армию.');
        return false;
    }

    // ----- ПРОВЕРКА КАЗНЫ (с учётом скидок) -----
    let totalCost = (base.hireCost || 0) * count;

    // Универсальная скидка на найм конкретного юнита
    if (typeof getTechBonuses === 'function') {
        const bonuses = getTechBonuses();
        if (bonuses.hireDiscountByUnit && bonuses.hireDiscountByUnit[unitKey]) {
            const discountPercent = bonuses.hireDiscountByUnit[unitKey];
            totalCost = Math.floor(totalCost * (1 - discountPercent / 100));
        }
    }

    const currentTreasury = getCurrentTreasury();
    if (totalCost > 0 && currentTreasury < totalCost) {
        alert(`Недостаточно средств! Нужно ${totalCost} эрсов, а в казне только ${currentTreasury}.`);
        return false;
    }

    // Проверка лимита на количество отрядов этого типа
    if (!checkUnitLimit(unitKey)) {
        return false;
    }

    // Проверка таверны для наёмников
    if (base.isMercenary && typeof window.hasTavern === 'function' && !window.hasTavern()) {
        alert(`Для найма наёмников требуется постройка «Таверна».`);
        addGlobalLog(`❌ Для найма наёмников (${base.name}) требуется постройка "Таверна".`, 'army');
        return false;
    }

    // ----- ПРОВЕРКА ПРИЗЫВНОГО ЛИМИТА (с учётом полукровок) -----
    const neededPeople = count * (base.countPerUnit || 100);

    const raceLimits = (typeof window.getCurrentFactionConscriptionLimitByRaceGender === 'function')
        ? window.getCurrentFactionConscriptionLimitByRaceGender()
        : {};

    const used = (typeof window.getUsedConscriptionByRaceGender === 'function')
        ? window.getUsedConscriptionByRaceGender()
        : {};

    // 1. Доступный остаток чистой расы
    const pureLimit = raceLimits[base.race] || { male: 0, female: 0 };
    const pureUsed = used[base.race] || { male: 0, female: 0 };

    // Определяем, какой пол нужен
    let neededMale = 0, neededFemale = 0;
    if (base.gender === 'female') {
        neededFemale = neededPeople;
        if (!peopleState.settings.womenInArmy) {
            alert('Требуется реформа «Женщины в армии».');
            return false;
        }
    } else if (base.gender === 'male') {
        neededMale = neededPeople;
    } else { // "any" – по умолчанию мужчины
        neededMale = neededPeople;
    }

    // Функция для подсчёта доступного остатка (лимит – использовано) для конкретной расы и пола
    function availableForRace(raceName, gender) {
        const lim = raceLimits[raceName] || { male: 0, female: 0 };
        const us = used[raceName] || { male: 0, female: 0 };
        if (gender === 'male') return lim.male - us.male;
        if (gender === 'female') return lim.female - us.female;
        return (lim.male - us.male) + (lim.female - us.female);
    }

    let availablePure = availableForRace(base.race, base.gender);
    let remaining = neededPeople;

    // Сначала берём из чистой расы
    let takePure = Math.min(remaining, availablePure);
    remaining -= takePure;

    // Если не хватило – ищем полукровок (по фактическому населению)
    if (remaining > 0) {
        const allRaces = (typeof window.getCurrentFactionRaces === 'function')
            ? window.getCurrentFactionRaces()
            : [];
        const lowerRace = base.race.toLowerCase();

        for (let race of allRaces) {
            if (!race.name.startsWith("Полукровка")) continue;
            const lowerName = race.name.toLowerCase();
            if (!lowerName.includes(`(${lowerRace}+`) && !lowerName.includes(`+${lowerRace})`)) continue;

            // Смотрим фактическое население (взрослые)
            let avail = 0;
            if (base.gender === 'male') {
                avail = race.adultMale || 0;
            } else if (base.gender === 'female') {
                avail = race.adultFemale || 0;
            } else {
                avail = (race.adultMale || 0) + (race.adultFemale || 0);
            }
            if (avail <= 0) continue;

            const take = Math.min(remaining, avail);
            remaining -= take;
            if (remaining <= 0) break;
        }
    }

    if (remaining > 0) {
        alert(`Невозможно нанять! Недостаточно резерва расы "${base.race}" даже с учётом полукровок.`);
        return false;
    }

    // Списываем деньги (если стоимость > 0)
    if (totalCost > 0) {
        deductTreasury(totalCost);
    }

    // Добавляем в очередь найма
    let hireTime = base.hireTime || 1;
	if (unitKey === 'Гамураи' && typeof hasActiveBuilding === 'function' && hasActiveBuilding('fenrir_altar')) {
		hireTime = 2;
	}
    if (!army.recruitmentQueue) army.recruitmentQueue = [];
    army.recruitmentQueue.push({
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        unitKey: unitKey,
        remainingTurns: hireTime,
        count: count,
        unitTemplate: {
            name: base.name,
            race: base.race,
            troopType: base.troopType,
            countPerUnit: base.countPerUnit || 100,
            icon: base.icon,
            gender: base.gender || "male",
            upkeep: base.upkeep || 0  
        }
    });

    addGlobalLog(`⚔️ Начат найм ${count}×"${base.name}" в "${army.name}" (${hireTime} ходов).`, 'army');
    saveArmyData();
    if (typeof renderArmy === 'function') renderArmy();
    if (typeof renderAvailableUnits === 'function') renderAvailableUnits();
    if (typeof refreshRecruitmentLimits === 'function') refreshRecruitmentLimits();
    return true;
}

function cancelRecruitment(armyId, queueId) {
    const army = window.armies.find(a => a.id === armyId);
    if (!army) return;
    const index = army.recruitmentQueue.findIndex(q => q.id == queueId);
    if (index === -1) return;
    army.recruitmentQueue.splice(index, 1);
    addGlobalLog(`❌ Найм отряда отменён в армии "${army.name}".`, 'army');
    saveArmyData();
    if (typeof renderArmy === 'function') renderArmy();
    if (typeof refreshRecruitmentLimits === 'function') refreshRecruitmentLimits();
}

function processRecruitment() {
    let anyCompleted = false;
    for (let army of window.armies) {
        if (army.factionId !== currentFaction) continue;
        if (!army.recruitmentQueue || army.recruitmentQueue.length === 0) continue;
        const newQueue = [];
        for (let item of army.recruitmentQueue) {
            item.remainingTurns--;
            if (item.remainingTurns <= 0) {
                const template = item.unitTemplate;
                const newUnit = {
                    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
                    name: template.name,
                    race: template.race,
                    troopType: template.troopType,
                    count: item.count * (template.countPerUnit || 100),
                    unitKey: item.unitKey,
                    icon: template.icon,
                    gender: template.gender || "male",
                    upkeep: template.upkeep || 0 
                };
                army.units.push(newUnit);
                addGlobalLog(`✅ Завершён найм ${item.count}×"${template.name}" в "${army.name}".`, 'army');
                anyCompleted = true;
            } else {
                newQueue.push(item);
            }
        }
        army.recruitmentQueue = newQueue;
    }
    if (anyCompleted) {
        saveArmyData();
        if (typeof renderArmy === 'function') renderArmy();
    }
    if (typeof refreshRecruitmentLimits === 'function') refreshRecruitmentLimits();
}

function removeUnitFromArmy(armyId, unitId) {
    const army = window.armies.find(a => a.id === armyId);
    if (army) {
        army.units = army.units.filter(u => u.id !== unitId);
        saveArmyData();
        if (typeof renderArmy === 'function') renderArmy();
        return true;
    }
    return false;
}

// ========== РЕДАКТИРОВАНИЕ АРМИИ ==========
function updateArmyInfo(armyId, newData) {
    const army = window.armies.find(a => a.id === armyId);
    if (!army) {
        alert('Армия не найдена');
        return false;
    }

    if (newData.name !== undefined && newData.name !== null) {
        army.name = newData.name.trim();
    }
    if (newData.commander !== undefined && newData.commander !== null) {
        army.commander = newData.commander.trim();
    }
    // Гарнизон: если передан (даже пустая строка) – применяем, иначе не трогаем
    if (newData.garrison !== undefined) {
        army.garrison = newData.garrison || null;   // пустая строка → null
    }

    saveArmyData();
    if (typeof renderArmy === 'function') renderArmy();
    addGlobalLog(`✏️ Армия "${army.name}" обновлена.`, 'army');
    return true;
}

// ========== ИМПОРТ РЕЗУЛЬТАТА БИТВЫ ==========
function importBattleResult(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            const reports = Array.isArray(data) ? data : [data];
            if (typeof openBattleImportDialog === 'function') {
                openBattleImportDialog(reports);
            } else {
                alert('Функция диалога импорта не найдена.');
            }
        } catch(err) {
            alert('Ошибка чтения файла: ' + err.message);
        }
    };
    reader.readAsText(file);
}

/**
 * Применяет потери из отчёта к конкретной армии
 * @param {Object} army - объект армии
 * @param {Array} unitsReport - массив отчётов по отрядам { unitKey, killed, wounded, remaining }
 */
function applyBattleCasualties(army, unitsReport) {
    console.log(`Применяю потери к армии "${army.name}", отрядов в отчёте: ${unitsReport.length}`);
    for (let reportUnit of unitsReport) {
        const targetUnit = army.units.find(u => u.unitKey === reportUnit.unitKey);
        if (!targetUnit) {
            console.warn(`Отряд с unitKey "${reportUnit.unitKey}" не найден в армии "${army.name}", пропускаю`);
            continue;
        }

        const killed = reportUnit.killed || 0;
        const wounded = reportUnit.wounded || 0;
        const remaining = reportUnit.remaining || 0;

        console.log(`Отряд "${targetUnit.name}": было ${targetUnit.count}, убито=${killed}, ранено=${wounded}, осталось=${remaining}`);

        // Если нет потерь – не трогаем отряд, даже если remaining отличается
        if (killed === 0 && wounded === 0) {
            console.log(`  Нет потерь, пропускаю`);
            continue;
        }

        // Защита от некорректных данных: если remaining <= 0, а убитых 0 – пропускаем
        if (remaining <= 0 && killed === 0) {
            console.warn(`  Некорректный remaining (${remaining}) при killed=0, отряд не изменён`);
            continue;
        }

        // Вычитаем убитых из населения
        if (killed > 0 && targetUnit.race && targetUnit.gender && typeof deductPopulation === 'function') {
            deductPopulation(targetUnit.race, targetUnit.gender, killed);
        }

        // Обновляем численность
        targetUnit.count = remaining;
        if (wounded > 0) {
            targetUnit.wounded = (targetUnit.wounded || 0) + wounded;
        }

        // Удаляем отряд только если совсем не осталось бойцов
        if (remaining <= 0 && (targetUnit.wounded || 0) === 0) {
            army.units = army.units.filter(u => u.id !== targetUnit.id);
            console.log(`  Отряд полностью уничтожен и удалён`);
        }
    }
    saveArmyData();
}

// ========== ИМПОРТ ОДНОЙ АРМИИ (старый формат) ==========
function importArmyData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const army = JSON.parse(e.target.result);
            if (!army.units || !Array.isArray(army.units)) {
                alert('Неверный формат армии.');
                return;
            }
            // Присваиваем уникальный id, если его нет
            if (!army.id) army.id = generateId();
            army.factionId = currentFaction;  // привязываем к текущей фракции
            window.armies.push(army);
            saveArmyData();
            addGlobalLog(`📂 Импортирована армия "${army.name}".`, 'army');
            if (typeof renderArmy === 'function') renderArmy();
        } catch(err) {
            alert('Ошибка чтения файла: ' + err.message);
        }
    };
    reader.readAsText(file);
}

// ========== ЗАГРУЗКА ПРИМЕРА АРМИИ ==========
function loadExampleArmy() {
    if (!window.unitDatabase) {
        alert('База юнитов не загружена.');
        return;
    }
    // Создаём простую армию из первых попавшихся юнитов
    const pool = getUnitsForCurrentFaction();
    if (pool.length === 0) return;
    const exampleUnits = [
        { key: pool[0].key, count: 1 },
        { key: pool[1]?.key || pool[0].key, count: 1 }
    ];
    const newArmy = {
        id: generateId(),
        name: 'Примерная армия',
        units: [],
        recruitmentQueue: [],
        factionId: currentFaction,
        garrison: null,
        commander: 'Капитан Пример',
        motto: '',
        foundationDate: getCurrentDateString()
    };
    for (let eu of exampleUnits) {
        const base = unitDatabase[eu.key] || (MERCENARY_UNITS || {})[eu.key];
        if (!base) continue;
        newArmy.units.push({
            id: generateId(),
            unitKey: eu.key,
            name: base.name,
            race: base.race,
            troopType: base.troopType,
            count: eu.count * (base.countPerUnit || 100),
            icon: base.icon,
            gender: base.gender || 'male',
            upkeep: base.upkeep || 0
        });
    }
    window.armies.push(newArmy);
    saveArmyData();
    if (typeof renderArmy === 'function') renderArmy();
    addGlobalLog('📖 Пример армии загружен.', 'army');
}

/**
 * Применяет потери к конкретному отряду
 * @param {Object} army - армия, которой принадлежит отряд
 * @param {Object} unit - объект отряда
 * @param {number} killed - количество убитых
 * @param {number} wounded - количество раненых
 */
function applyUnitCasualties(army, unit, killed, wounded) {
    if (killed > 0) {
        unit.count -= killed;
        // Вычитаем убитых из населения
        if (typeof deductPopulation === 'function' && unit.race && unit.gender) {
            deductPopulation(unit.race, unit.gender, killed);
        }
    }
    if (wounded > 0) {
        unit.count -= wounded;
        unit.wounded = (unit.wounded || 0) + wounded;
    }
    // Удаляем отряд, если он полностью уничтожен
    if (unit.count <= 0 && (unit.wounded || 0) <= 0) {
        army.units = army.units.filter(u => u.id !== unit.id);
        addGlobalLog(`💀 Отряд "${unit.name}" полностью уничтожен и расформирован.`, 'army');
    } else if (killed > 0 || wounded > 0) {
        addGlobalLog(`⚔️ Отряд "${unit.name}": убито ${killed}, ранено ${wounded}.`, 'army');
    }
    // Сохраняем изменения в данных
    if (typeof saveArmyData === 'function') saveArmyData();
}
// ========== ДЕЗЕРТИРСТВО ПРИ БАНКРОТСТВЕ ==========
function applyBankruptcyDesertion() {
    const factionArmies = (window.armies || []).filter(a => a.factionId === currentFaction);
    let totalDeserted = 0;
    for (let army of factionArmies) {
        const toRemove = [];
        for (let unit of army.units) {
            const deserted = Math.floor(unit.count * 0.1);
            if (deserted <= 0) continue;
            unit.count -= deserted;
            totalDeserted += deserted;
            addGlobalLog(`🏳️ Дезертирство: ${deserted} из "${unit.name}" (армия "${army.name}").`, 'army');
            if (unit.count <= 0) toRemove.push(unit);
        }
        army.units = army.units.filter(u => !toRemove.includes(u));
    }
    if (totalDeserted > 0) {
        saveArmyData();
        if (typeof renderArmy === 'function') renderArmy();
        addGlobalLog(`⚠️ Из-за банкротства дезертировало ${totalDeserted} солдат.`, 'general');
    }
    return totalDeserted;
}
// ========== ЭКСПОРТ ==========
window.applyBankruptcyDesertion = applyBankruptcyDesertion;
window.applyUnitCasualties = applyUnitCasualties;
window.importArmyData = importArmyData;
window.loadExampleArmy = loadExampleArmy;
window.createNewArmy = createNewArmy;
window.deleteArmy = deleteArmy;
window.addUnitToArmy = addUnitToArmy;
window.removeUnitFromArmy = removeUnitFromArmy;
window.cancelRecruitment = cancelRecruitment;
window.processRecruitment = processRecruitment;
window.getUnitsForCurrentFaction = getUnitsForCurrentFaction;
window.calculateTotalUpkeep = calculateTotalUpkeep;
window.saveArmyData = saveArmyData;
window.loadArmyData = loadArmyData;
window.updateArmyInfo = updateArmyInfo;
window.importBattleResult = importBattleResult;
window.applyBattleCasualties = applyBattleCasualties;

console.log("✅ army_core.js загружен — версия 16.0 (полный цикл битвы)");