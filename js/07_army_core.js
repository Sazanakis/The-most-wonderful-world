// ============================================================================
// МОДУЛЬ 07: army_core.js
// ВЕРСИЯ 9.0 — ПОЛНАЯ ПЕРЕЗАПИСЬ С ФИКСАМИ
// ============================================================================

// ========== 1. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function getRaceTotal(race) {
    if (typeof window.getRaceTotal === 'function') return window.getRaceTotal(race);
    return (race.adultMale || 0) + (race.adultFemale || 0) + (race.children || 0) + (race.elders || 0);
}

// ========== 2. ПУЛЫ ЮНИТОВ ПО РИТОРИКЕ ==========
const RHETORIC_UNIT_POOLS = {
    dayo: {
        name: "Даё",
        units: [
            "Селяне-ополченцы оку", "Ополчение оку", "Гоблины асигару",
            "Гайдзины асигару пикинёры", "Гайдзины асигару лучники", "Мураи",
            "Онна-бугэйся", "Кишины", "Бизоньи всадники", "Налетчики на вивернах"
        ],
        icon: "icons/dayo_flag.png", color: "#ff6b6b"
    },
    loyal: {
        name: "Лоялисты",
        units: [
            "Селяне-ополченцы люди", "Ополчение люди", "Лучники", "Мечники",
            "Пикинёры", "Гоблинские арбалетчики", "Рейнджеры", "Валькирии",
            "Вольные рыцари", "Орлиные рыцари"
        ],
        icon: "icons/loyal_flag.png", color: "#4a90d9"
    },
    neutral: {
        name: "Нейтралы",
        units: [
            "Селяне-ополченцы люди", "Ополчение люди", "Лучники", "Мечники",
            "Пикинёры", "Рейнджеры", "Мясники Варсиса", "Гамураи",
            "Вольные рыцари", "Орлиные рыцари"
        ],
        icon: "icons/neutral_flag.png", color: "#cfc294"
    },
    proyurgan: {
        name: "Проюрганцы",
        units: [
            "Селяне-ополченцы люди", "Ополчение люди", "Лучники", "Добровольческий корпус",
            "Мечники", "Пикинёры", "Рейнджеры", "Дэфекторы", "Вольные рыцари", "Орлиные рыцари"
        ],
        icon: "icons/proyurgan_flag.png", color: "#8b4513"
    },
    lepus: {
        name: "Союз Лепус",
        units: [
            "Селяне-ополченцы люди", "Ополчение люди", "Лучники", "Мечники",
            "Пикинёры", "Рейнджеры", "Вольные рыцари", "Орлиные рыцари"
        ],
        icon: "icons/lepus_flag.png", color: "#6a9fb5"
    }
};

const MERCENARY_UNITS = {
    "Дварфийские легионеры": {
        name: "Дварфийские легионеры", race: "Дварфы", troopType: "Тяжёлая пехота",
        strength: 8, defense: 15, morale: 6, upkeep: 2.5, hireCost: 800, countPerUnit: 200,
        description: "Элитная наёмная пехота. Живая крепость на поле боя.",
        special: "«Живая крепость»", icon: "dwarven_legionnaires.png", maxCount: 1, hireTime: 1
    }
};

// ========== 3. РАСЧЁТ СТАТИСТИК АРМИИ ==========
function calcArmyStats(units) {
    let totalStrength = 0, totalDefense = 0, totalMorale = 0, totalUpkeep = 0, totalCount = 0;
    for (let u of units) {
        const strength = u.strengthRanged || u.strength;
        totalStrength += strength * u.count;
        totalDefense += u.defense * u.count;
        totalMorale += u.morale * u.count;
        totalUpkeep += u.upkeep * u.count;
        totalCount += u.count;
    }
    return {
        totalStrength: Math.floor(totalStrength),
        totalDefense: Math.floor(totalDefense),
        totalMorale: Math.floor(totalMorale),
        totalUpkeep: Math.floor(totalUpkeep),
        totalCount: totalCount
    };
}

function calculateTotalUpkeep() {
    let total = 0;
    for (let army of armies) {
        if (army.factionId !== currentFaction) continue;
        for (let unit of army.units) total += unit.upkeep * unit.count;
    }
    return Math.floor(total);
}

// ========== 4. БОНУСЫ ОТ ПОСТРОЕК ==========
function getTrainingBonus() {
    let bonus = 0;
    const factionProvince = (typeof FACTION_TO_PROVINCE !== 'undefined') ? FACTION_TO_PROVINCE[currentFaction] : null;
    const data = (factionProvince && typeof provincesData !== 'undefined') ? provincesData[factionProvince] : null;
    if (!data) return bonus;
    for (let settlement of data.settlements || []) {
        for (let building of settlement.buildings || []) {
            if (building.completed && building.name === "Казармы") bonus = Math.max(bonus, 1);
            if (building.completed && building.name === "Казармы (улучшенные)") bonus = Math.max(bonus, 2);
        }
    }
    return bonus;
}

// ========== 5. ПОЛУЧЕНИЕ ДАННЫХ О ФРАКЦИИ ==========
function getCurrentRhetoricByFaction() {
    return (typeof FACTION_TO_RHETORIC !== 'undefined' && FACTION_TO_RHETORIC[currentFaction]) 
        ? FACTION_TO_RHETORIC[currentFaction] 
        : "neutral";
}

function getUnitsForCurrentFaction() {
    const rhetoric = getCurrentRhetoricByFaction();
    const pool = RHETORIC_UNIT_POOLS[rhetoric];
    if (!pool) return [];
    const units = [];
    for (let unitKey of pool.units) {
        if (typeof unitDatabase !== 'undefined' && unitDatabase[unitKey]) {
            units.push({ key: unitKey, ...unitDatabase[unitKey] });
        } else {
            console.warn(`Юнит "${unitKey}" не найден`);
        }
    }
    for (let [key, unit] of Object.entries(MERCENARY_UNITS)) {
        units.push({ key, ...unit });
    }
    return units;
}

function getCurrentFactionProvince() {
    return (typeof FACTION_TO_PROVINCE !== 'undefined' && FACTION_TO_PROVINCE[currentFaction]) 
        ? FACTION_TO_PROVINCE[currentFaction] 
        : "orochima";
}

function getCurrentFactionRaces() {
    const provinceId = getCurrentFactionProvince();
    if (typeof provincesData !== 'undefined' && provincesData[provinceId] && provincesData[provinceId].races) {
        return provincesData[provinceId].races;
    }
    return [];
}

function getCurrentFactionTotalConscriptionLimit() {
    if (typeof window.getTotalConscriptionLimit === 'function') return window.getTotalConscriptionLimit();
    console.warn("getTotalConscriptionLimit не определена, используется fallback");
    return 10000;
}

function getCurrentFactionTotalPopulation() {
    if (typeof window.getTotalPopulation === 'function') return window.getTotalPopulation();
    console.warn("getTotalPopulation не определена, используется fallback");
    return 0;
}

function getCurrentFactionBaseConscriptionLimit() {
    if (typeof window.getBaseConscriptionLimit === 'function') return window.getBaseConscriptionLimit();
    console.warn("getBaseConscriptionLimit не определена, используется fallback");
    return 0;
}

function getAvailableRaceRecruits(race) {
    if (typeof window.getAvailableRaceRecruits === 'function') return window.getAvailableRaceRecruits(race);
    console.warn("getAvailableRaceRecruits не определена, используется fallback");
    return 999999;
}

function getUsedConscriptionByRaceGender() {
    if (typeof window.getUsedConscriptionByRaceGender === 'function') return window.getUsedConscriptionByRaceGender();
    console.warn("getUsedConscriptionByRaceGender не определена, используется fallback");
    return {};
}

function getCurrentFactionConscriptionLimitByRaceGender() {
    if (typeof window.getCurrentFactionConscriptionLimitByRaceGender === 'function') return window.getCurrentFactionConscriptionLimitByRaceGender();
    console.warn("getCurrentFactionConscriptionLimitByRaceGender не определена, используется fallback");
    return {};
}

function getAvailableMaleRaceRecruits(race) {
    if (typeof window.getAvailableMaleRaceRecruits === 'function') return window.getAvailableMaleRaceRecruits(race);
    console.warn("getAvailableMaleRaceRecruits не определена, используется fallback");
    return 999999;
}

function getAvailableFemaleRaceRecruits(race) {
    if (typeof window.getAvailableFemaleRaceRecruits === 'function') return window.getAvailableFemaleRaceRecruits(race);
    console.warn("getAvailableFemaleRaceRecruits не определена, используется fallback");
    return 0;
}

function getCurrentTotalArmySize() {
    let total = 0;
    for (let army of armies) {
        if (army.factionId !== currentFaction) continue;
        for (let unit of army.units) total += unit.count;
    }
    return total;
}

function canRecruitUnit(unit, count) {
    if (!unit) return { canRecruit: false, reason: "Юнит не найден", available: 0 };
    const neededPeople = count * (unit.countPerUnit || 100);
    const unitRace = unit.race;
    const gender = unit.gender || "male";
    const mercenaryRaces = ['Дварфы', 'Гоблины'];
    if (mercenaryRaces.includes(unitRace)) {
        return { canRecruit: true, reason: null, available: Infinity };
    }
    const races = getCurrentFactionRaces();
    const raceData = races.find(r => r.name === unitRace);
    if (!raceData || getRaceTotal(raceData) < 100) {
        return { canRecruit: false, reason: `Раса "${unitRace}" слишком малочисленна или отсутствует`, available: 0 };
    }
    let maleNeeded = 0, femaleNeeded = 0;
    if (gender === "male") maleNeeded = neededPeople;
    else if (gender === "female") {
        const womenInArmy = (typeof peopleState !== 'undefined') ? peopleState.settings.womenInArmy : false;
        if (!womenInArmy) return { canRecruit: false, reason: "Женские отряды требуют реформы «Женщины в армии»", available: 0 };
        femaleNeeded = neededPeople;
    } else if (gender === "any") {
        maleNeeded = neededPeople;
        const womenInArmy = (typeof peopleState !== 'undefined') ? peopleState.settings.womenInArmy : false;
        if (womenInArmy) {
            const availMale = getAvailableMaleRaceRecruits(unitRace);
            if (availMale < neededPeople) {
                maleNeeded = availMale;
                femaleNeeded = neededPeople - availMale;
            }
        }
    }
    const availMale = getAvailableMaleRaceRecruits(unitRace);
    const availFemale = getAvailableFemaleRaceRecruits(unitRace);
    if (maleNeeded > availMale || femaleNeeded > availFemale) {
        return { canRecruit: false, reason: `Недостаточно резерва (👨${availMale}, 👩${availFemale})`, available: Math.min(availMale, availFemale) };
    }
    const totalLimit = getCurrentFactionTotalConscriptionLimit();
    const currentTotal = getCurrentTotalArmySize();
    if (currentTotal + neededPeople > totalLimit) {
        return { canRecruit: false, reason: "Превышен общий призывной лимит", available: totalLimit - currentTotal };
    }
    return { canRecruit: true, reason: null, available: neededPeople };
}

function getGarrisonName(settlementId) {
    if (!settlementId) return "не назначен";
    if (typeof SETTLEMENTS_DB !== 'undefined' && SETTLEMENTS_DB[settlementId]) {
        return SETTLEMENTS_DB[settlementId].name;
    }
    return "неизвестно";
}

// ========== 6. ФУНКЦИИ СОХРАНЕНИЯ / ЗАГРУЗКИ ==========
function saveArmyData() {
    const saveData = {
        armies: armies,
        treasury: typeof GameState !== 'undefined' ? GameState.getTreasury() : (typeof armyTreasury !== 'undefined' ? armyTreasury : 0),
        lastSelectedArmyId: lastSelectedArmyId,
        currentFaction: currentFaction
    };
    if (typeof GameState !== 'undefined') {
        GameState.armies = armies;
        GameState.save();
    }
    localStorage.setItem('armyData', JSON.stringify(saveData));
}

function loadArmyData() {
    const saved = localStorage.getItem('armyData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (Array.isArray(data.armies)) armies = data.armies;
            else armies = [];
            if (typeof armyTreasury !== 'undefined') armyTreasury = data.treasury || 10000;
            if (data.lastSelectedArmyId) lastSelectedArmyId = data.lastSelectedArmyId;
            if (data.currentFaction && typeof currentFaction !== 'undefined') {
                currentFaction = data.currentFaction;
            }
        } catch (e) {
            console.error("Ошибка загрузки армий:", e);
            armies = [];
        }
    } else {
        armies = [];
    }
    for (let a of armies) {
        if (!a.recruitmentQueue) a.recruitmentQueue = [];
        if (!a.units) a.units = [];
        if (!a.location) {
            a.location = { type: "settlement", id: null, progress: 0, targetSettlementId: null };
        }
        if (!a.garrison) a.garrison = a.location?.id || null;
    }
}

function resetArmy() {
    if (confirm("Сбросить ВСЕ данные армий и казну?")) {
        armies = armies.filter(a => a.factionId !== currentFaction);
        if (typeof GameState !== 'undefined') GameState.setTreasury(10000);
        else if (typeof armyTreasury !== 'undefined') armyTreasury = 10000;
        saveArmyData();
        addGlobalLog("🔄 Выполнен сброс всех данных армий и казны для текущей фракции.", 'army');
    }
}

function exportArmyData() {
    const exportObj = {
        armies: armies,
        treasury: typeof GameState !== 'undefined' ? GameState.getTreasury() : (typeof armyTreasury !== 'undefined' ? armyTreasury : 0),
        currentFaction: currentFaction,
        exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `army_export_${new Date().toISOString().slice(0,19)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    addGlobalLog("💾 Экспорт данных армий выполнен.", 'army');
}

function importArmyData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.armies && Array.isArray(data.armies)) {
                for (let a of data.armies) {
                    if (!a.recruitmentQueue) a.recruitmentQueue = [];
                    if (!a.units) a.units = [];
                    armies.push(a);
                }
            }
            if (data.treasury !== undefined) {
                if (typeof GameState !== 'undefined') GameState.setTreasury(data.treasury);
                else if (typeof armyTreasury !== 'undefined') armyTreasury = data.treasury;
            }
            saveArmyData();
            addGlobalLog("📂 Импорт данных армий выполнен.", 'army');
            alert("Импорт армий завершён!");
        } catch(err) {
            alert("Ошибка импорта: " + err.message);
        }
    };
    reader.readAsText(file);
}

// ========== 7. УПРАВЛЕНИЕ АРМИЯМИ ==========
function getCurrentFactionProvinces() {
    switch(currentFaction) {
        case "clan_daketa": return ["orochima"];
        case "county_markarn": return ["kaya"];
        case "county_vogelmark": return ["vogel"];
        case "principality_gorski": return ["neolania"];
        case "regency_council": return ["metropolitan_area", "great_shaft"];
        case "lepus_union": return ["leporis"];
        default: return ["orochima"];
    }
}

function createNewArmy(name = null) {
    const provinces = getCurrentFactionProvinces();
    const capitalProvince = (typeof FACTION_TO_PROVINCE !== 'undefined' && FACTION_TO_PROVINCE[currentFaction]) 
        ? FACTION_TO_PROVINCE[currentFaction] 
        : provinces[0];
    
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
            <div><label>📜 Девиз:</label><input type="text" id="newArmyMottoInput" value=""></div>
            <div style="display:flex;gap:10px;margin-top:15px;"><button id="confirmCreateArmyBtn">✅ Создать</button><button id="cancelCreateArmyBtn">❌ Отмена</button></div>
        </div>
    `;
    document.body.appendChild(modal);
    
    const provinceSelect = modal.querySelector('#newArmyProvinceSelect');
    const settlementSelect = modal.querySelector('#newArmySettlementSelect');
    const nameInput = modal.querySelector('#newArmyNameInput');
    const commanderInput = modal.querySelector('#newArmyCommanderInput');
    const mottoInput = modal.querySelector('#newArmyMottoInput');
    
    function updateSettlements(provinceId) {
        settlementSelect.innerHTML = '';
        const settlements = Object.values(SETTLEMENTS_DB).filter(s => s.province === provinceId && (s.type === 'city' || s.type === 'castle')).sort((a,b)=>a.name.localeCompare(b.name));
        if (!settlements.length) { settlementSelect.innerHTML = '<option value="">-- нет доступных --</option>'; return; }
        for (let s of settlements) settlementSelect.innerHTML += `<option value="${s.id}">${s.name} (${s.type === 'city' ? 'Город' : 'Замок'})</option>`;
    }
    updateSettlements(provinceSelect.value);
    provinceSelect.addEventListener('change', () => updateSettlements(provinceSelect.value));
    
    modal.querySelector('#confirmCreateArmyBtn').onclick = () => {
        const selectedSettlement = settlementSelect.value;
        if (!selectedSettlement) { alert('Выберите поселение'); return; }
        const armyName = nameInput.value.trim() || `Армия ${armies.filter(a => a.factionId === currentFaction).length + 1}`;
        const commander = commanderInput.value.trim() || "Не назначен";
        const motto = mottoInput.value.trim() || "";
        
        const newArmy = {
            id: (typeof generateId === 'function') ? generateId() : Date.now() + '-' + Math.random(),
            name: armyName,
            units: [],
            recruitmentQueue: [],
            factionId: currentFaction,
            garrison: selectedSettlement,
            location: { type: "settlement", id: selectedSettlement, progress: 0, targetSettlementId: null },
            commander: commander,
            coatOfArms: null,
            motto: motto,
            foundationDate: (typeof getCurrentDateString === 'function') ? getCurrentDateString() : new Date().toLocaleString(),
            battleHistory: [],
            reserveRear: [],
            needsBattleResolution: false
        };
        armies.push(newArmy);
        saveArmyData();
        if (typeof renderArmy === 'function') renderArmy();
        if (typeof refreshRecruitmentLimits === 'function') refreshRecruitmentLimits();
        const settlementName = SETTLEMENTS_DB[selectedSettlement]?.name || selectedSettlement;
        addGlobalLog(`➕ Создана новая армия "${armyName}" в поселении ${settlementName}. Командир: ${commander}`, 'army');
        modal.remove();
    };
    modal.querySelector('#cancelCreateArmyBtn').onclick = () => modal.remove();
}

function deleteArmy(armyId) {
    const army = armies.find(a => a.id === armyId);
    if (army && confirm(`Удалить армию "${army.name}"?`)) {
        armies = armies.filter(a => a.id !== armyId);
        saveArmyData();
        addGlobalLog(`🗑️ Армия "${army.name}" расформирована.`, 'army');
        return true;
    }
    return false;
}

function renameArmy(armyId, newName) {
    const army = armies.find(a => a.id === armyId);
    if (army && newName.trim()) {
        army.name = newName.trim();
        saveArmyData();
        addGlobalLog(`📝 Армия переименована в "${army.name}".`, 'army');
        return true;
    }
    return false;
}

function clearAllArmies() {
    if (confirm("Расформировать ВСЕ армии текущей фракции?")) {
        armies = armies.filter(a => a.factionId !== currentFaction);
        if (typeof GameState !== 'undefined') {
            GameState.armies = armies;
            GameState.save();
        }
        saveArmyData();
        addGlobalLog(`🔥 Все армии фракции ${(typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[currentFaction]) ? FACTION_NAMES[currentFaction] : currentFaction} расформированы.`, 'army');
        return true;
    }
    return false;
}

function loadExampleArmy() {
    const provinces = getCurrentFactionProvinces();
    const capitalProvince = (typeof FACTION_TO_PROVINCE !== 'undefined' && FACTION_TO_PROVINCE[currentFaction]) 
        ? FACTION_TO_PROVINCE[currentFaction] 
        : provinces[0];
    const capitalSettlement = (typeof SETTLEMENTS_DB !== 'undefined') 
        ? Object.values(SETTLEMENTS_DB).find(s => s.province === capitalProvince && s.type === "city")
        : null;
    armies = armies.filter(a => a.factionId !== currentFaction);
    armies.push({
        id: (typeof generateId === 'function') ? generateId() : Date.now() + '-' + Math.random(),
        name: "Примерная армия",
        units: [],
        recruitmentQueue: [],
        factionId: currentFaction,
        garrison: capitalSettlement ? capitalSettlement.id : null,
        location: {
            type: "settlement",
            id: capitalSettlement ? capitalSettlement.id : null,
            progress: 0,
            targetSettlementId: null
        }
    });
    if (typeof GameState !== 'undefined') {
        GameState.armies = armies;
        GameState.save();
    }
    saveArmyData();
    addGlobalLog("📖 Создана примерная пустая армия для текущей фракции.", 'army');
}

// ========== 8. НАЙМ ЮНИТОВ И ОЧЕРЕДИ ==========
function addUnitToArmy(armyId, unitKey, count = 1) {
    const base = (typeof unitDatabase !== 'undefined' && unitDatabase[unitKey]) 
        ? unitDatabase[unitKey] 
        : (MERCENARY_UNITS[unitKey] || null);
    if (!base) {
        addGlobalLog(`❌ Юнит "${unitKey}" не найден в базе.`, 'army');
        return false;
    }
    
    const check = canRecruitUnit(base, count);
    if (!check.canRecruit) {
        addGlobalLog(`❌ ${check.reason}`, 'army');
        return false;
    }
    
    const army = armies.find(a => a.id === armyId);
    if (!army) {
        addGlobalLog(`❌ Армия не найдена.`, 'army');
        return false;
    }
    
    if (army.factionId !== currentFaction) {
        addGlobalLog(`❌ Нельзя нанимать отряды в армию другой фракции.`, 'army');
        return false;
    }
    
    const femaleUnits = ["Валькирии", "Онна-бугэйся"];
    const womenInArmy = (typeof peopleState !== 'undefined') ? peopleState.settings.womenInArmy : false;
    if (!womenInArmy && femaleUnits.includes(base.name)) {
        addGlobalLog(`❌ Нельзя нанять "${base.name}" — требуется опция «Женщины в армии».`, 'army');
        return false;
    }
    
    const existingCount = army.units.filter(u => u.unitKey === unitKey).length;
    const maxCount = base.maxCount || 999;
    if (existingCount + count > maxCount) {
        addGlobalLog(`❌ Нельзя нанять более ${maxCount} отрядов "${base.name}".`, 'army');
        return false;
    }
    
    const totalCost = base.hireCost * count;
    let currentTreasury = 0;
    if (typeof GameState !== 'undefined') {
        currentTreasury = GameState.getTreasury();
        if (currentTreasury < totalCost) {
            addGlobalLog(`❌ Недостаточно денег: нужно ${totalCost} эрсов, у вас ${currentTreasury}.`, 'army');
            return false;
        }
        GameState.addToTreasury(-totalCost);
    } else if (typeof armyTreasury !== 'undefined') {
        currentTreasury = armyTreasury;
        if (currentTreasury < totalCost) {
            addGlobalLog(`❌ Недостаточно денег: нужно ${totalCost} эрсов, у вас ${currentTreasury}.`, 'army');
            return false;
        }
        armyTreasury -= totalCost;
    }
    
    let hireTime = Math.max(1, base.hireTime - getTrainingBonus());
    
    const neededPeople = count * (base.countPerUnit || 100);
    const gender = base.gender || "male";
    const unitRace = base.race;
    
    let maleNeeded = 0;
    let femaleNeeded = 0;
    if (gender === "male") {
        maleNeeded = neededPeople;
    } else if (gender === "female") {
        femaleNeeded = neededPeople;
    } else if (gender === "any") {
        const availableMaleNow = getAvailableMaleRaceRecruits(unitRace);
        maleNeeded = Math.min(neededPeople, availableMaleNow);
        const remaining = neededPeople - maleNeeded;
        if (remaining > 0 && womenInArmy) {
            const availableFemaleNow = getAvailableFemaleRaceRecruits(unitRace);
            femaleNeeded = Math.min(remaining, availableFemaleNow);
        }
        if (maleNeeded + femaleNeeded < neededPeople) {
            addGlobalLog(`❌ Недостаточно резерва для найма "${base.name}"`, 'army');
            return false;
        }
    }
    
    if (!army.recruitmentQueue) army.recruitmentQueue = [];
    const queueItem = {
        id: (typeof generateId === 'function') ? generateId() : Date.now() + '-' + Math.random(),
        unitKey: unitKey,
        remainingTurns: hireTime,
        count: count,
        maleCount: maleNeeded,
        femaleCount: femaleNeeded,
        unitTemplate: {
            name: base.name,
            race: base.race,
            troopType: base.troopType,
            strength: base.strength,
            defense: base.defense,
            morale: base.morale,
            upkeep: base.upkeep,
            strengthRanged: base.strengthRanged,
            strengthMelee: base.strengthMelee,
            countPerUnit: base.countPerUnit,
            icon: base.icon,
            gender: gender,
            baseCount: base.countPerUnit,
            wounded: 0,
            killed: 0,
            needsReserve: false
        }
    };
    army.recruitmentQueue.push(queueItem);
    
    addGlobalLog(`⚔️ Наём ${count} отряда(ов) "${base.name}" в армию "${army.name}" (${hireTime} ходов, 👨${maleNeeded} 👩${femaleNeeded}). Затрачено ${totalCost} эрсов.`, 'army');
    
    saveArmyData();
    return true;
}

function cancelRecruitment(armyId, queueId) {
    const army = armies.find(a => a.id === armyId);
    if (!army) return;
    const index = army.recruitmentQueue.findIndex(q => q.id == queueId);
    if (index === -1) return;
    const item = army.recruitmentQueue[index];
    army.recruitmentQueue.splice(index, 1);
    addGlobalLog(`❌ Найм отряда "${item.unitTemplate.name}" отменён в армии "${army.name}". Деньги не возвращены.`, 'army');
    saveArmyData();
}

function processRecruitment() {
    let anyCompleted = false;
    for (let army of armies) {
        if (army.factionId !== currentFaction) continue;
        if (!army.recruitmentQueue || army.recruitmentQueue.length === 0) continue;
        const newQueue = [];
        for (let item of army.recruitmentQueue) {
            item.remainingTurns--;
            if (item.remainingTurns <= 0) {
                const template = item.unitTemplate;
                const baseCount = item.count * (template.countPerUnit || 100);

                const newUnit = {
                    id: (typeof generateId === 'function') ? generateId() : Date.now() + '-' + Math.random(),
                    name: template.name,
                    race: template.race,
                    troopType: template.troopType,
                    count: baseCount,
                    strength: template.strength,
                    defense: template.defense,
                    morale: template.morale,
                    upkeep: template.upkeep,
                    strengthRanged: template.strengthRanged,
                    strengthMelee: template.strengthMelee,
                    unitKey: item.unitKey,
                    icon: template.icon,
                    gender: template.gender,
                    maleCount: item.maleCount || 0,
                    femaleCount: item.femaleCount || 0,
                    baseCount: baseCount,
                    wounded: 0,
                    killed: 0,
                    needsReserve: false
                };
                army.units.push(newUnit);
                addGlobalLog(`✅ Завершён найм ${item.count} отряда(ов) "${template.name}" в армию "${army.name}".`, 'army');
                anyCompleted = true;
            } else {
                newQueue.push(item);
            }
        }
        army.recruitmentQueue = newQueue;
    }
    if (anyCompleted) {
        saveArmyData();
    }
}

function removeUnitFromArmy(armyId, unitId) {
    const army = armies.find(a => a.id === armyId);
    if (army && army.factionId === currentFaction) {
        const unit = army.units.find(u => u.id === unitId);
        army.units = army.units.filter(u => u.id !== unitId);
        saveArmyData();
        if (unit) {
            addGlobalLog(`🗑️ Из армии "${army.name}" удалён отряд "${unit.name}".`, 'army');
        }
        return true;
    }
    return false;
}

// ========== 9. ФИЛЬТРАЦИЯ ЮНИТОВ ==========
function filterUnits(units) {
    return units.filter(unit => {
        if (currentTypeFilter !== "all" && unit.troopType !== currentTypeFilter) return false;
        if (currentRaceFilter !== "all" && unit.race !== currentRaceFilter) return false;
        if (currentSpecialFilter && (!unit.special || unit.special === "Нет")) return false;
        if (currentTimeFilter !== "all") {
            const ht = unit.hireTime;
            if (currentTimeFilter === "1" && ht !== 1) return false;
            if (currentTimeFilter === "2-3" && (ht < 2 || ht > 3)) return false;
            if (currentTimeFilter === "4+" && ht < 4) return false;
        }
        return true;
    });
}

function updateFilters() {
    const typeFilter = document.getElementById('filterType');
    const timeFilter = document.getElementById('filterTime');
    const raceFilter = document.getElementById('filterRace');
    const specialFilter = document.getElementById('filterSpecial');
    if (typeFilter) currentTypeFilter = typeFilter.value;
    if (timeFilter) currentTimeFilter = timeFilter.value;
    if (raceFilter) currentRaceFilter = raceFilter.value;
    if (specialFilter) currentSpecialFilter = specialFilter.checked;
}

function resetFilters() {
    const typeFilter = document.getElementById('filterType');
    const timeFilter = document.getElementById('filterTime');
    const raceFilter = document.getElementById('filterRace');
    const specialFilter = document.getElementById('filterSpecial');
    if (typeFilter) typeFilter.value = 'all';
    if (timeFilter) timeFilter.value = 'all';
    if (raceFilter) raceFilter.value = 'all';
    if (specialFilter) specialFilter.checked = false;
    currentTypeFilter = "all";
    currentTimeFilter = "all";
    currentRaceFilter = "all";
    currentSpecialFilter = false;
}

// ========== 10. РАБОТА С РЕЗЕРВОМ, ОБЪЕДИНЕНИЕМ, ЭКСПОРТОМ/ИМПОРТОМ ==========
function moveUnitToReserve(armyId, unitId) {
    const army = armies.find(a => a.id === armyId);
    if (!army) return;
    const unitIndex = army.units.findIndex(u => u.id === unitId);
    if (unitIndex === -1) return;
    const unit = army.units.splice(unitIndex, 1)[0];
    army.reserveRear.push(unit);
    addGlobalLog(`📦 Отряд "${unit.name}" перемещён в резерв тыла армии "${army.name}".`, 'army');
    saveArmyData();
    if (typeof renderArmy === 'function') renderArmy();
}

function mergeUnits(armyId, unitKey) {
    const army = armies.find(a => a.id === armyId);
    if (!army) return;
    const units = army.units.filter(u => u.unitKey === unitKey);
    if (units.length < 2) return;
    units.sort((a, b) => a.count - b.count);
    const small = units[0];
    const big = units[1];
    big.count += small.count;
    big.wounded += small.wounded;
    big.killed += small.killed;
    big.baseCount += small.baseCount;
    const index = army.units.indexOf(small);
    if (index !== -1) army.units.splice(index, 1);
    addGlobalLog(`🔀 Отряды "${unitKey}" в армии "${army.name}" объединены.`, 'army');
    saveArmyData();
    if (typeof renderArmy === 'function') renderArmy();
}

function exportSingleArmy(armyId) {
    const army = armies.find(a => a.id === armyId);
    if (!army) {
        addGlobalLog(`❌ Армия с ID ${armyId} не найдена.`, 'army');
        return;
    }
    const armyCopy = JSON.parse(JSON.stringify(army));
    const exportObj = {
        army: armyCopy,
        exportDate: new Date().toISOString(),
        version: "1.0"
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `army_${army.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,19)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    addGlobalLog(`💾 Экспорт армии "${army.name}" выполнен.`, 'army');
}

function importSingleArmy(file, armyId) {
    alert("1. Начинаем импорт для " + armyId);
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            alert("2. Файл прочитан");
            const data = JSON.parse(e.target.result);
            alert("3. JSON разобран");
            if (!data.army) {
                alert("4. Ошибка: нет поля army");
                return;
            }
            const importedArmy = data.army;
            alert("5. Импортируемая армия: " + importedArmy.name + " (ID: " + importedArmy.id + ")");
            
            const index = armies.findIndex(a => a.id === armyId);
            alert("6. Индекс в массиве: " + index);
            
            if (index !== -1) {
                const oldName = armies[index].name;
                armies[index] = importedArmy;
                armies[index].id = armyId;
                armies[index].factionId = currentFaction;
                if (!armies[index].reserveRear) armies[index].reserveRear = [];
                if (!armies[index].recruitmentQueue) armies[index].recruitmentQueue = [];
                alert("7. Армия заменена: " + oldName + " → " + armies[index].name);
            } else {
                armies.push(importedArmy);
                alert("7. Добавлена новая армия: " + importedArmy.name);
            }
            
            saveArmyData();
            alert("8. Данные сохранены");
            renderArmy();
            alert("9. Интерфейс обновлён");
            alert("✅ Импорт завершён!");
        } catch(err) {
            alert("❌ Ошибка: " + err.message);
        }
    };
    reader.readAsText(file);
}

function applyBattleCasualties() {
    let totalKilled = {};
    // Собираем убитых по расам (основные отряды + резерв)
    for (let army of armies) {
        if (army.factionId !== currentFaction) continue;
        // Основные отряды
        for (let unit of army.units) {
            if (unit.killed > 0) {
                const race = unit.race;
                if (!totalKilled[race]) totalKilled[race] = 0;
                totalKilled[race] += unit.killed;
            }
        }
        // Резерв тыла
        for (let unit of army.reserveRear || []) {
            if (unit.killed > 0) {
                const race = unit.race;
                if (!totalKilled[race]) totalKilled[race] = 0;
                totalKilled[race] += unit.killed;
            }
        }
    }

    if (Object.keys(totalKilled).length === 0) return;

    const provinces = getCurrentFactionProvinces();
    let remainingKilled = { ...totalKilled };
    for (let pid of provinces) {
        const data = provincesData[pid];
        if (!data || !data.races) continue;
        for (let race of data.races) {
            const raceName = race.name;
            if (remainingKilled[raceName] && remainingKilled[raceName] > 0) {
                const toRemove = Math.min(remainingKilled[raceName], race.adultMale);
                race.adultMale -= toRemove;
                remainingKilled[raceName] -= toRemove;
                if (remainingKilled[raceName] > 0 && peopleState.settings.womenInArmy) {
                    const femaleRemove = Math.min(remainingKilled[raceName], race.adultFemale);
                    race.adultFemale -= femaleRemove;
                    remainingKilled[raceName] -= femaleRemove;
                }
                if (remainingKilled[raceName] > 0) {
                    race.children = Math.max(0, race.children - remainingKilled[raceName]);
                    remainingKilled[raceName] = 0;
                }
            }
        }
    }

    let logged = false;
    for (let race in totalKilled) {
        const removed = totalKilled[race] - (remainingKilled[race] || 0);
        if (removed > 0) {
            addGlobalLog(`💀 Потери в бою: ${removed} ${race} убитых списаны из населения.`, 'general');
            logged = true;
        }
        if (remainingKilled[race] > 0) {
            addGlobalLog(`⚠️ Не удалось списать ${remainingKilled[race]} ${race} – недостаточно населения.`, 'general');
        }
    }
    if (logged) {
        saveAllData();
        if (typeof refreshRecruitmentLimits === 'function') refreshRecruitmentLimits();
    }
}
function replenishUnit(armyId, unitId) {
    const army = armies.find(a => a.id === armyId);
    if (!army) {
        addGlobalLog(`❌ Армия не найдена`, 'army');
        return false;
    }
    let unit = army.units.find(u => u.id === unitId);
    if (!unit) {
        unit = (army.reserveRear || []).find(u => u.id === unitId);
        if (!unit) {
            addGlobalLog(`❌ Отряд не найден`, 'army');
            return false;
        }
    }
    // ⚠️ НОВАЯ ПРОВЕРКА: если отряд полностью уничтожен – запрещаем пополнение
    if (unit.count === 0) {
        addGlobalLog(`❌ Отряд "${unit.name}" полностью уничтожен. Пополнение невозможно.`, 'army');
        alert(`Отряд "${unit.name}" полностью уничтожен. Его нельзя пополнить, удалите его.`);
        return false;
    }
    // Остальные проверки (killed, wounded, count < baseCount)
    if (unit.killed <= 0 || unit.wounded > 0 || unit.count >= unit.baseCount) {
        addGlobalLog(`❌ Отряд не требует пополнения`, 'army');
        return false;
    }
    const needed = unit.baseCount - unit.count;
    // Проверяем доступный резерв для этой расы
    const available = getAvailableRaceRecruits(unit.race);
    if (available < needed) {
        alert(`Недостаточно резерва! Нужно ${needed} чел., доступно ${available}.`);
        return false;
    }
    if (!confirm(`Пополнить отряд "${unit.name}" из резерва (${needed} чел.)?`)) return false;

    // Списываем из резерва (уменьшаем население)
    if (typeof consumeReserve === 'function') {
        if (!consumeReserve(unit.race, needed)) {
            alert('Не удалось списать резерв');
            return false;
        }
    } else {
        alert('Функция consumeReserve не определена');
        return false;
    }

    // Восстанавливаем отряд
    unit.count = unit.baseCount;
    unit.killed = 0;
    unit.needsReserve = false;

    addGlobalLog(`💰 Отряд "${unit.name}" пополнен из резерва (${needed} чел.).`, 'army');
    saveArmyData();
    if (typeof renderArmy === 'function') renderArmy();
    return true;
}

// ========== 11. ИНИЦИАЛИЗАЦИЯ ==========
loadArmyData();

// Экспорт функций для внешних модулей
window.exportSingleArmy = exportSingleArmy;
window.importSingleArmy = importSingleArmy;
window.applyBattleCasualties = applyBattleCasualties;
window.moveUnitToReserve = moveUnitToReserve;
window.mergeUnits = mergeUnits;
window.createNewArmy = createNewArmy;
window.deleteArmy = deleteArmy;
window.renameArmy = renameArmy;
window.clearAllArmies = clearAllArmies;
window.loadExampleArmy = loadExampleArmy;
window.addUnitToArmy = addUnitToArmy;
window.cancelRecruitment = cancelRecruitment;
window.removeUnitFromArmy = removeUnitFromArmy;
window.filterUnits = filterUnits;
window.updateFilters = updateFilters;
window.resetFilters = resetFilters;
window.exportArmyData = exportArmyData;
window.importArmyData = importArmyData;
window.calcArmyStats = calcArmyStats;
window.calculateTotalUpkeep = calculateTotalUpkeep;
window.getGarrisonName = getGarrisonName;
window.getCurrentFactionProvinces = getCurrentFactionProvinces;
window.getUnitsForCurrentFaction = getUnitsForCurrentFaction;
// Экспорт функции
window.replenishUnit = replenishUnit;

console.log("✅ 07_army_core.js загружен — финальная версия");