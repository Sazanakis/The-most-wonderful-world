// ============================================================================
// МОДУЛЬ 06: council.js
// Функции для работы с Советом влиятельных домов (вассалов)
// ЧЕРТЫ ХАРАКТЕРА ВАССАЛОВ УДАЛЕНЫ (оставлены только механики)
// ВЕРСИЯ 3.0 – РЕФАКТОРИНГ, ЗАЩИТА ОТ ОТСУТСТВИЯ ГЛОБАЛЬНЫХ ДАННЫХ
// ============================================================================

// ========== 1. КОНСТАНТЫ ДЛЯ ПОВЫШЕНИЯ РАНГА ==========
const VASSAL_UPGRADE_MAP = {
    "MINOR_CLAN": "MEDIUM_CLAN",
    "MEDIUM_CLAN": "MAJOR_CLAN"
};

const VASSAL_ICONS = {
    // Клан Дакэта (Оку)
    "house_seiryu": { coat: "icons/house_seiryu.png", portrait: "icons/portrait_seiryu.png" },
    "house_nodaketa": { coat: "icons/house_nodaketa.png", portrait: "icons/portrait_nodaketa.png" },
    "house_yurai": { coat: "icons/house_yurai.png", portrait: "icons/portrait_yurai.png" },
    "house_yume": { coat: "icons/house_yume.png", portrait: "icons/portrait_yume.png" },
    "house_senpu": { coat: "icons/house_senpu.png", portrait: "icons/portrait_senpu.png" },
    "house_umi": { coat: "icons/house_umi.png", portrait: "icons/portrait_umi.png" },
    "house_gekken": { coat: "icons/house_gekken.png", portrait: "icons/portrait_gekken.png" },
    // Графство Маркарн
    "viscountcy_runheim": { coat: "icons/viscountcy_runheim.png", portrait: "icons/portrait_runheim.png" },
    // Горское княжество
    "viscountcy_voronetsky": { coat: "icons/viscountcy_voronetsky.png", portrait: "icons/portrait_voronetsky.png" }
};

// ========== 2. ИНИЦИАЛИЗАЦИЯ СОВЕТОВ ==========

/**
 * Создаёт совет для указанной фракции с начальными вассалами
 * @param {string} factionId - ID фракции
 * @param {string} rulerName - имя правителя
 * @returns {FactionCouncil|null}
 */
function initFactionCouncil(factionId, rulerName) {
    if (typeof factionCouncils === 'undefined') {
        console.error("factionCouncils не определён");
        return null;
    }
    
    if (!factionCouncils[factionId]) {
        factionCouncils[factionId] = new FactionCouncil(factionId, rulerName);
        
        let startHouses = [];
        
        switch(factionId) {
            case "clan_daketa":
                startHouses = [
                    { name: "Род Сейрю", vassalType: "MINOR_CLAN", politicalFaction: "MILITARY", leaderName: "Глава рода Сейрю", baseLoyalty: 70, id: "house_seiryu" },
                    { name: "Род Нодакэта", vassalType: "MINOR_CLAN", politicalFaction: "MILITARY", leaderName: "Глава рода Нодакэта", baseLoyalty: 65, id: "house_nodaketa" },
                    { name: "Род Юрей", vassalType: "MINOR_CLAN", politicalFaction: "TRADITIONAL", leaderName: "Глава рода Юрей", baseLoyalty: 60, id: "house_yurai" },
                    { name: "Род Юмэ", vassalType: "MINOR_CLAN", politicalFaction: "REFORMISTS", leaderName: "Глава рода Юмэ", baseLoyalty: 55, id: "house_yume" },
                    { name: "Род Сэнпу", vassalType: "MINOR_CLAN", politicalFaction: "MILITARY", leaderName: "Глава рода Сэнпу", baseLoyalty: 65, id: "house_senpu" },
                    { name: "Род Уми", vassalType: "MINOR_CLAN", politicalFaction: "MERCHANTS", leaderName: "Глава рода Уми", baseLoyalty: 50, id: "house_umi" },
                    { name: "Род Гэккэн", vassalType: "MINOR_CLAN", politicalFaction: "TRADITIONAL", leaderName: "Глава рода Гэккэн", baseLoyalty: 60, id: "house_gekken" }
                ];
                break;
            case "county_markarn":
                startHouses = [
                    { name: "Виконтство Рунхеймов", vassalType: "NOBLE_HOUSE", politicalFaction: "TRADITIONAL", leaderName: "Виконт Рунхейм", baseLoyalty: 55, id: "viscountcy_runheim" }
                ];
                break;
            case "principality_gorski":
                startHouses = [
                    { name: "Виконтство Воронецких", vassalType: "NOBLE_HOUSE", politicalFaction: "TRADITIONAL", leaderName: "Виконт Воронецкий", baseLoyalty: 60, id: "viscountcy_voronetsky" }
                ];
                break;
            case "regency_council":
            case "lepus_union":
                startHouses = [];
                break;
            default:
                startHouses = [];
        }
        
        for (let h of startHouses) {
            const house = new InfluentialHouse(
                h.id || (typeof generateId === 'function' ? generateId() : Date.now() + '-' + Math.random()),
                h.name,
                h.vassalType,
                h.politicalFaction,
                h.leaderName,
                h.baseLoyalty
            );
            if (h.id && VASSAL_ICONS[h.id]) {
                house.coatOfArms = VASSAL_ICONS[h.id].coat;
                house.leaderPortrait = VASSAL_ICONS[h.id].portrait;
            }
            // ЧЕРТЫ ХАРАКТЕРА УДАЛЕНЫ
            factionCouncils[factionId].houses.push(house);
        }
        
        // Обновляем личные армии созданных вассалов
        for (let house of factionCouncils[factionId].houses) {
            updateVassalPersonalArmy(house);
        }
        
        const factionName = (typeof COUNCIL_FACTIONS !== 'undefined' && COUNCIL_FACTIONS[factionId]) 
            ? COUNCIL_FACTIONS[factionId] 
            : factionId;
        addGlobalLog(`🏛️ Создан совет для фракции "${factionName}" с ${startHouses.length} вассалами.`, 'council');
    }
    return factionCouncils[factionId];
}

/**
 * Возвращает совет фракции, инициализируя его при необходимости
 * @param {string} factionId
 * @returns {FactionCouncil}
 */
function getFactionCouncil(factionId) {
    if (typeof factionCouncils === 'undefined') return null;
    if (!factionCouncils[factionId]) {
        const rulerName = (typeof FACTION_RULERS !== 'undefined' && FACTION_RULERS[factionId]) 
            ? FACTION_RULERS[factionId] 
            : "Правитель";
        initFactionCouncil(factionId, rulerName);
    }
    return factionCouncils[factionId];
}

// ========== 3. УПРАВЛЕНИЕ ВАССАЛАМИ ==========

/**
 * Добавляет нового вассала в совет
 * @param {string} factionId
 * @param {string} name
 * @param {string} vassalType
 * @param {string} politicalFaction
 * @param {string} leaderName
 * @param {number} baseLoyalty
 * @returns {boolean}
 */
function addNewVassal(factionId, name, vassalType, politicalFaction, leaderName, baseLoyalty = 50) {
    const council = getFactionCouncil(factionId);
    if (!council) return false;
    
    const newId = (typeof generateId === 'function') ? generateId() : Date.now() + '-' + Math.random();
    const house = new InfluentialHouse(newId, name, vassalType, politicalFaction, leaderName, baseLoyalty);
    house.coatOfArms = (typeof getIconPath === 'function') ? getIconPath('default_coat', '🛡️') : '🛡️';
    house.leaderPortrait = (typeof getIconPath === 'function') ? getIconPath('default_portrait', '👤') : '👤';
    
    council.houses.push(house);
    
    if (typeof renderCouncil === 'function') renderCouncil();
    addGlobalLog(`➕ Добавлен вассал: "${name}" в совет ${(typeof COUNCIL_FACTIONS !== 'undefined' && COUNCIL_FACTIONS[factionId]) ? COUNCIL_FACTIONS[factionId] : factionId}`, 'council');
    return true;
}

/**
 * Удаляет вассала по ID
 * @param {string} houseId
 * @returns {boolean}
 */
function removeVassal(houseId) {
    if (confirm("Удалить этого вассала? Это действие необратимо.")) {
        if (typeof factionCouncils === 'undefined') return false;
        for (let council of Object.values(factionCouncils)) {
            if (council.removeHouse(houseId)) {
                if (typeof renderCouncil === 'function') renderCouncil();
                const factionName = (typeof COUNCIL_FACTIONS !== 'undefined' && COUNCIL_FACTIONS[council.factionId]) 
                    ? COUNCIL_FACTIONS[council.factionId] 
                    : council.factionId;
                addGlobalLog(`🗑️ Удалён вассал из совета ${factionName}`, 'council');
                return true;
            }
        }
    }
    return false;
}

// ========== 4. МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ ВАССАЛА ==========

function openAddVassalModal() {
    const council = getFactionCouncil(currentCouncilFaction);
    if (!council) return;
    
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:2000;display:flex;justify-content:center;align-items:center';
    
    const vassalTypesOptions = Object.entries(VASSAL_TYPES).map(([k,v]) => `<option value="${k}">${v.name}</option>`).join('');
    const politicalFactionsOptions = Object.entries(POLITICAL_FACTIONS).map(([k,v]) => `<option value="${k}">${v.name}</option>`).join('');
    
    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:500px;width:90%;">
            <h3>➕ ДОБАВЛЕНИЕ ВАССАЛА</h3>
            <div style="margin:15px 0;"><label>🏯 Название дома:</label><input type="text" id="newVassalName" style="width:100%;margin-top:5px;"></div>
            <div style="margin:15px 0;"><label>👑 Имя главы:</label><input type="text" id="newLeaderName" style="width:100%;margin-top:5px;"></div>
            <div style="margin:15px 0;"><label>📊 Тип вассала:</label><select id="newVassalType" style="width:100%;margin-top:5px;">${vassalTypesOptions}</select></div>
            <div style="margin:15px 0;"><label>🏛️ Политическая фракция:</label><select id="newPoliticalFaction" style="width:100%;margin-top:5px;">${politicalFactionsOptions}</select></div>
            <div style="margin:15px 0;"><label>❤️ Базовая лояльность:</label><input type="number" id="newBaseLoyalty" value="50" min="0" max="100" style="width:100%;margin-top:5px;"></div>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px;">
                <button id="confirmAddVassalBtn">✅ Добавить</button>
                <button id="cancelAddVassalBtn" style="background:#7a2a2a;">❌ Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    document.getElementById('confirmAddVassalBtn').onclick = () => {
        const name = document.getElementById('newVassalName').value.trim();
        const leaderName = document.getElementById('newLeaderName').value.trim();
        if (!name || !leaderName) { alert("Заполните все поля!"); return; }
        addNewVassal(
            currentCouncilFaction, 
            name, 
            document.getElementById('newVassalType').value, 
            document.getElementById('newPoliticalFaction').value, 
            leaderName, 
            parseInt(document.getElementById('newBaseLoyalty').value)
        );
        modal.remove();
    };
    document.getElementById('cancelAddVassalBtn').onclick = () => modal.remove();
}

// ========== 5. РУЧНОЕ ИЗМЕНЕНИЕ ВЛИЯНИЯ И ЛОЯЛЬНОСТИ ==========

function manualModifyInfluence(houseId, delta, reason) {
    const house = findHouseById(houseId);
    if (house) {
        house.modifyInfluence(delta, `Ручное изменение: ${reason}`);
        addGlobalLog(`📊 Дому "${house.name}" изменено влияние на ${delta} (${reason})`, 'council');
        if (typeof renderCouncil === 'function') renderCouncil();
        return true;
    }
    return false;
}

function manualModifyLoyalty(houseId, delta, reason) {
    const house = findHouseById(houseId);
    if (house) {
        house.modifyLoyalty(delta, `Ручное изменение: ${reason}`);
        addGlobalLog(`❤️ Дому "${house.name}" изменена лояльность на ${delta} (${reason})`, 'council');
        if (typeof renderCouncil === 'function') renderCouncil();
        return true;
    }
    return false;
}

function openManualModal() {
    const council = getFactionCouncil(currentCouncilFaction);
    if (!council) return;
    const houses = council.houses;
    const houseList = houses.map(h => `<option value="${h.id}">${h.name}</option>`).join('');
    
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:2000;display:flex;justify-content:center;align-items:center';
    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:20px;padding:20px;max-width:400px;width:90%;">
            <h3>⚡ Ручное изменение</h3>
            <label>Выберите дом:</label>
            <select id="manualHouseSelect" style="width:100%;margin:10px 0;padding:8px;">${houseList}</select>
            <label>Изменение:</label>
            <div class="flex-row" style="margin:10px 0;gap:8px;flex-wrap:wrap;">
                <button id="manualLoyaltyPlus" style="background:#3a6b3a;">+5 лояльности</button>
                <button id="manualLoyaltyMinus" style="background:#6b3a3a;">-5 лояльности</button>
                <button id="manualInfluencePlus" style="background:#b8860b;">+5 влияния</button>
                <button id="manualInfluenceMinus" style="background:#7a2a2a;">-5 влияния</button>
            </div>
            <label>Причина:</label>
            <input type="text" id="manualReason" placeholder="Причина изменения" style="width:100%;margin:10px 0;padding:8px;">
            <div class="flex-row" style="justify-content:flex-end;gap:10px;margin-top:15px;">
                <button id="manualApplyBtn">Применить</button>
                <button id="manualCloseBtn" style="background:#7a2a2a;">Закрыть</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    const applyChange = (type, delta) => {
        const houseId = document.getElementById('manualHouseSelect').value;
        const reason = document.getElementById('manualReason').value.trim() || "Ручное изменение";
        if (type === 'loyalty') manualModifyLoyalty(houseId, delta, reason);
        else manualModifyInfluence(houseId, delta, reason);
        modal.remove();
    };
    
    document.getElementById('manualLoyaltyPlus').onclick = () => applyChange('loyalty', 5);
    document.getElementById('manualLoyaltyMinus').onclick = () => applyChange('loyalty', -5);
    document.getElementById('manualInfluencePlus').onclick = () => applyChange('influence', 5);
    document.getElementById('manualInfluenceMinus').onclick = () => applyChange('influence', -5);
    document.getElementById('manualApplyBtn').onclick = () => modal.remove();
    document.getElementById('manualCloseBtn').onclick = () => modal.remove();
}

// ========== 6. ГЕРБЫ И ПОРТРЕТЫ ==========

function openCoatOfArmsModal(houseId) {
    const house = findHouseById(houseId);
    if (!house) return;
    
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:2000;display:flex;justify-content:center;align-items:center';
    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:500px;width:90%;">
            <h3>🛡️ ГЕРБ И ПОРТРЕТ</h3>
            <div style="text-align:center;margin:20px 0;">
                <div>Текущий герб:</div>
                <img src="${house.coatOfArms || (typeof getIconPath === 'function' ? getIconPath('default_coat', '🛡️') : '🛡️')}" class="house-coat" style="width:32px;height:32px;cursor:pointer;">
                <button id="changeCoatBtn" style="display:block;margin:5px auto;">📁 Выбрать герб (PNG)</button>
                <input type="file" id="coatFileInput" accept="image/png" style="display:none;">
                <hr>
                <div>Портрет лидера:</div>
                <img src="${house.leaderPortrait || (typeof getIconPath === 'function' ? getIconPath('default_portrait', '👤') : '👤')}" class="leader-portrait" style="width:48px;height:48px;border-radius:50%;cursor:pointer;">
                <button id="changePortraitBtn" style="display:block;margin:5px auto;">📁 Выбрать портрет (PNG)</button>
                <input type="file" id="portraitFileInput" accept="image/png" style="display:none;">
            </div>
            <button id="closeCoatModalBtn" style="width:100%;background:#7a2a2a;">Закрыть</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    document.getElementById('changeCoatBtn').onclick = () => document.getElementById('coatFileInput').click();
    document.getElementById('coatFileInput').onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => { house.coatOfArms = ev.target.result; if (typeof renderCouncil === 'function') renderCouncil(); addGlobalLog(`🛡️ Герб "${house.name}" обновлён`, 'council'); modal.remove(); };
            reader.readAsDataURL(file);
        }
    };
    document.getElementById('changePortraitBtn').onclick = () => document.getElementById('portraitFileInput').click();
    document.getElementById('portraitFileInput').onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => { house.leaderPortrait = ev.target.result; if (typeof renderCouncil === 'function') renderCouncil(); addGlobalLog(`📸 Портрет "${house.leaderName}" обновлён`, 'council'); modal.remove(); };
            reader.readAsDataURL(file);
        }
    };
    document.getElementById('closeCoatModalBtn').onclick = () => modal.remove();
}

console.log("✅ 06_council.js — часть 1 загружена");

// ============================================================================
// ЧАСТЬ 2: ЛИЧНЫЕ ОТРЯДЫ ВАССАЛОВ
// ============================================================================

function addPersonalUnit(houseId, unitKey, count = 1) {
    const house = findHouseById(houseId);
    if (house) {
        house.addPersonalUnit(unitKey, count);
        if (typeof renderCouncil === 'function') renderCouncil();
        const unitName = (typeof unitDatabase !== 'undefined' && unitDatabase[unitKey]) ? unitDatabase[unitKey].name : unitKey;
        addGlobalLog(`⚔️ Дому "${house.name}" добавлен отряд ${count} x ${unitName}`, 'council');
        return true;
    }
    return false;
}

function removePersonalUnit(houseId, unitId) {
    const house = findHouseById(houseId);
    if (house && house.removePersonalUnit(unitId)) {
        if (typeof renderCouncil === 'function') renderCouncil();
        addGlobalLog(`⚔️ У дома "${house.name}" удалён отряд`, 'council');
        return true;
    }
    return false;
}

function openAddUnitModal(houseId) {
    const house = findHouseById(houseId);
    if (!house) return;
    
    const unitTypesList = Object.entries(unitDatabase || {}).map(([key, val]) => 
        `<option value="${key}">${val.name} (${val.troopType}) - содержание: ${val.upkeep}💰/ход</option>`
    ).join('');
    
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:2000;display:flex;justify-content:center;align-items:center';
    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:500px;width:90%;">
            <h3>⚔️ ДОБАВЛЕНИЕ ОТРЯДА</h3>
            <div><label>Тип отряда:</label><select id="unitTypeSelect" style="width:100%;">${unitTypesList}</select></div>
            <div><label>Количество:</label><input type="number" id="unitCount" value="1" min="1" step="1" style="width:100%;"></div>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px;">
                <button id="confirmAddUnitBtn">✅ Добавить</button>
                <button id="cancelAddUnitBtn" style="background:#7a2a2a;">❌ Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    document.getElementById('confirmAddUnitBtn').onclick = () => {
        const unitType = document.getElementById('unitTypeSelect').value;
        const count = parseInt(document.getElementById('unitCount').value) || 1;
        addPersonalUnit(houseId, unitType, count);
        modal.remove();
    };
    document.getElementById('cancelAddUnitBtn').onclick = () => modal.remove();
}

// ========== 7. ЭКСПОРТ/ИМПОРТ/СБРОС ==========

function exportCouncilData() {
    const exportData = {
        factionCouncils: factionCouncils,
        currentCouncilFaction: currentCouncilFaction,
        version: "1.0"
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `council_${currentCouncilFaction}_${new Date().toISOString().slice(0, 19)}.json`;
    a.click();
    addGlobalLog("💾 Экспорт данных Совета выполнен.", 'council');
}

function importCouncilData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.factionCouncils) {
                for (let key in data.factionCouncils) {
                    const councilData = data.factionCouncils[key];
                    const council = new FactionCouncil(councilData.factionId, councilData.rulerName);
                    Object.assign(council, councilData);
                    council.houses = councilData.houses.map(hData => {
                        const house = new InfluentialHouse(hData.id, hData.name, hData.vassalType, hData.politicalFaction, hData.leaderName, hData.loyaltyToRuler);
                        Object.assign(house, hData);
                        return house;
                    });
                    factionCouncils[key] = council;
                }
            }
            if (data.currentCouncilFaction) currentCouncilFaction = data.currentCouncilFaction;
            if (typeof renderCouncil === 'function') renderCouncil();
            addGlobalLog("📂 Импорт данных Совета выполнен.", 'council');
        } catch(err) {
            alert("Ошибка импорта: " + err.message);
        }
    };
    reader.readAsText(file);
}

function resetCouncil() {
    if (confirm("Сбросить ВСЕ данные Совета? Все прогресс будет потерян.")) {
        if (typeof factionCouncils !== 'undefined') {
            for (let key in factionCouncils) delete factionCouncils[key];
        }
        initFactionCouncil(currentCouncilFaction, "Правитель");
        if (typeof renderCouncil === 'function') renderCouncil();
        addGlobalLog("🔄 Выполнен сброс всех данных Совета.", 'council');
    }
}

// ========== 8. ПЕРЕКЛЮЧЕНИЕ ФРАКЦИИ В СОВЕТЕ ==========

function setCouncilFaction(factionId) {
    currentCouncilFaction = factionId;
    document.querySelectorAll('.council-faction-btn').forEach(btn => {
        if (btn.getAttribute('data-council-faction') === factionId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    if (typeof renderCouncil === 'function') renderCouncil();
    const factionName = (typeof COUNCIL_FACTIONS !== 'undefined' && COUNCIL_FACTIONS[factionId]) ? COUNCIL_FACTIONS[factionId] : factionId;
    addGlobalLog(`🏛️ Переключено на совет фракции "${factionName}".`, 'council');
}

// ========== 9. АВТОМАТИЧЕСКИЕ ЛИЧНЫЕ АРМИИ ВАССАЛОВ ==========

function getHouseFaction(house) {
    if (house.id && house.id.startsWith('house_')) {
        return 'dayo';
    }
    if (house.id && (house.id.includes('runheim') || house.id.includes('voronetsky'))) {
        return 'loyal';
    }
    if (house.name && (house.name.includes("Купцовая") || house.name.includes("Религиозный"))) {
        return 'neutral';
    }
    return 'neutral';
}

function getDayoArmyByInfluence(influence, vassalType) {
    const units = [];
    if (influence >= 10) units.push({ unitKey: "Ополчение оку", count: 1 });
    if (influence >= 20) units.push({ unitKey: "Ополчение оку", count: 1 });
    if (influence >= 15) units.push({ unitKey: "Гоблины асигару", count: 1 });
    if (vassalType === "MEDIUM_CLAN" || vassalType === "MAJOR_CLAN") {
        if (influence >= 25) units.push({ unitKey: "Гайдзины асигару лучники", count: 1 });
        if (influence >= 30) units.push({ unitKey: "Гоблины асигару", count: 1 });
        if (influence >= 40) units.push({ unitKey: "Гайдзины асигару лучники", count: 1 });
    }
    if (vassalType === "MAJOR_CLAN") {
        if (influence >= 50) units.push({ unitKey: "Мураи", count: 1 });
        if (influence >= 60) units.push({ unitKey: "Бизоньи всадники", count: 1 });
        if (influence >= 70) units.push({ unitKey: "Мураи", count: 1 });
        if (influence >= 80) units.push({ unitKey: "Налетчики на вивернах", count: 1 });
    }
    return units;
}

function getHumanArmyByInfluence(influence, vassalType) {
    const units = [];
    if (influence >= 10) units.push({ unitKey: "Ополчение люди", count: 1 });
    if (influence >= 20) units.push({ unitKey: "Ополчение люди", count: 1 });
    if (influence >= 15) units.push({ unitKey: "Пикинёры", count: 1 });
    if (vassalType === "MEDIUM_CLAN" || vassalType === "MAJOR_CLAN") {
        if (influence >= 25) units.push({ unitKey: "Лучники", count: 1 });
        if (influence >= 30) units.push({ unitKey: "Пикинёры", count: 1 });
        if (influence >= 40) units.push({ unitKey: "Лучники", count: 1 });
    }
    if (vassalType === "MAJOR_CLAN") {
        if (influence >= 50) units.push({ unitKey: "Мечники", count: 1 });
        if (influence >= 60) units.push({ unitKey: "Вольные рыцари", count: 1 });
        if (influence >= 70) units.push({ unitKey: "Мечники", count: 1 });
        if (influence >= 80) units.push({ unitKey: "Орлиные рыцари", count: 1 });
    }
    return units;
}

function updateVassalPersonalArmy(house) {
    if (!house) return;
    
    // Находим все поселения, принадлежащие этому вассалу
    const vassalSettlements = [];
    if (typeof SETTLEMENTS_DB !== 'undefined') {
        for (let id in SETTLEMENTS_DB) {
            const s = SETTLEMENTS_DB[id];
            if (s.vassalHouse === house.id) {
                vassalSettlements.push({
                    id: s.id,
                    name: s.name,
                    type: s.type,
                    priority: s.type === 'castle' ? 1 : (s.type === 'city' ? 2 : 3)
                });
            }
        }
    }
    
    if (vassalSettlements.length === 0) return;
    
    // Сортируем по приоритету (замки > города > деревни)
    vassalSettlements.sort((a, b) => a.priority - b.priority);
    
    // Определяем состав желаемой армии
    const influence = house.getEffectiveInfluence();
    const faction = getHouseFaction(house);
    const vassalType = house.vassalType;
    
    let desiredUnits = [];
    if (faction === 'dayo') {
        desiredUnits = getDayoArmyByInfluence(influence, vassalType);
    } else {
        desiredUnits = getHumanArmyByInfluence(influence, vassalType);
    }
    
    // Суммируем одинаковые отряды
    const unitsMap = new Map();
    for (let unit of desiredUnits) {
        if (unitsMap.has(unit.unitKey)) {
            unitsMap.get(unit.unitKey).count += unit.count;
        } else {
            unitsMap.set(unit.unitKey, { unitKey: unit.unitKey, count: unit.count });
        }
    }
    
    // Превращаем в массив отрядов (каждый элемент = 1 отряд)
    const totalUnits = [];
    for (let [unitKey, data] of unitsMap) {
        for (let i = 0; i < data.count; i++) {
            totalUnits.push(unitKey);
        }
    }
    
    if (totalUnits.length === 0) {
        house.personalArmy = [];
        house.personalArmyPower = 0;
        return;
    }
    
    // Определяем, какие поселения получат отряды
    let targetSettlements = [];
    const castles = vassalSettlements.filter(s => s.type === 'castle');
    if (castles.length > 0) {
        targetSettlements = castles;
    } else {
        const cities = vassalSettlements.filter(s => s.type === 'city');
        if (cities.length > 0) {
            targetSettlements = cities;
        } else {
            targetSettlements = vassalSettlements;
        }
    }
    
    // Распределяем отряды по поселениям поровну
    const distribution = new Map();
    for (let settlement of targetSettlements) {
        distribution.set(settlement.id, []);
    }
    
    let idx = 0;
    for (let unitKey of totalUnits) {
        const settlement = targetSettlements[idx % targetSettlements.length];
        distribution.get(settlement.id).push(unitKey);
        idx++;
    }
    
    // Очищаем текущую армию
    house.personalArmy = [];
    house.personalArmyPower = 0;
    
    // Собираем личную армию с привязкой к поселениям
    for (let [settlementId, units] of distribution) {
        const settlementUnitMap = new Map();
        for (let unitKey of units) {
            if (settlementUnitMap.has(unitKey)) {
                settlementUnitMap.get(unitKey).count++;
            } else {
                settlementUnitMap.set(unitKey, { unitKey: unitKey, count: 1 });
            }
        }
        for (let [unitKey, data] of settlementUnitMap) {
            house.addPersonalUnit(unitKey, data.count);
            const lastUnit = house.personalArmy[house.personalArmy.length - 1];
            lastUnit.garrisonSettlementId = settlementId;
        }
    }
    
    addGlobalLog(`⚔️ Личная армия "${house.name}" обновлена (${totalUnits.length} отрядов, ${targetSettlements.length} поселений)`, 'council');
    
    if (typeof refreshRecruitmentLimits === 'function') {
        refreshRecruitmentLimits();
    }
}

function updateAllVassalsArmies() {
    if (typeof factionCouncils === 'undefined') return;
    for (let factionId in factionCouncils) {
        const council = factionCouncils[factionId];
        for (let house of council.houses) {
            updateVassalPersonalArmy(house);
        }
    }
    if (typeof renderCouncil === 'function') renderCouncil();
    addGlobalLog("🏛️ Личные армии всех вассалов обновлены", 'council');
}

function upgradeVassalRank(houseId) {
    const house = findHouseById(houseId);
    if (!house) return false;
    const nextType = VASSAL_UPGRADE_MAP[house.vassalType];
    if (!nextType) {
        addGlobalLog(`❌ ${house.name} нельзя повысить (тип ${house.vassalType})`, 'council');
        return false;
    }
    if (house.loyaltyToRuler < 70) {
        addGlobalLog(`❌ Для повышения ${house.name} нужно 70% лояльности (сейчас ${house.loyaltyToRuler}%)`, 'council');
        return false;
    }
    const COST = 2000;
    let treasury = (typeof GameState !== 'undefined') ? GameState.getTreasury() : (typeof armyTreasury !== 'undefined' ? armyTreasury : 0);
    if (treasury < COST) {
        addGlobalLog(`❌ Не хватает ${COST} эрсов для повышения ${house.name}`, 'council');
        return false;
    }
    if (typeof GameState !== 'undefined') GameState.addToTreasury(-COST);
    else if (typeof armyTreasury !== 'undefined') armyTreasury -= COST;
    if (typeof updateTreasuryDisplay === 'function') updateTreasuryDisplay();
    
    const oldType = house.vassalType;
    house.vassalType = nextType;
    house.updateTitle();
    const newLimits = (typeof VASSAL_TYPES !== 'undefined') ? VASSAL_TYPES[nextType] : null;
    if (newLimits) {
        house.currentInfluence = Math.max(newLimits.minInfluence, Math.min(newLimits.maxInfluence, house.currentInfluence));
    }
    updateVassalPersonalArmy(house);
    house.modifyLoyalty(0, `Повышение ранга с ${oldType} до ${nextType} за ${COST} эрсов`);
    addGlobalLog(`🏅 ${house.name} повышен с ${oldType} до ${nextType}!`, 'council');
    if (typeof renderCouncil === 'function') renderCouncil();
    return true;
}

// ========== 10. РЕНДЕР СОВЕТА (БЕЗ ЧЕРТ) ==========

function renderCouncil() {
    const council = getFactionCouncil(currentCouncilFaction);
    if (!council) return;
    
    const treasurySpan = document.getElementById('councilTreasury');
    if (treasurySpan) {
        const currentTreasury = (typeof GameState !== 'undefined') ? GameState.getTreasury() : (typeof armyTreasury !== 'undefined' ? armyTreasury : 0);
        treasurySpan.innerText = Math.floor(currentTreasury);
    }
    
    const totalSeatsSpan = document.getElementById('totalSeats');
    if (totalSeatsSpan) totalSeatsSpan.innerText = (typeof TOTAL_COUNCIL_SEATS !== 'undefined') ? TOTAL_COUNCIL_SEATS : 300;
    
    const rulerVotes = council.getRulerVotes();
    const totalSeats = (typeof TOTAL_COUNCIL_SEATS !== 'undefined') ? TOTAL_COUNCIL_SEATS : 300;
    const controlPercent = (rulerVotes / totalSeats * 100).toFixed(1);
    
    const rulerVotesSpan = document.getElementById('rulerVotes');
    if (rulerVotesSpan) rulerVotesSpan.innerText = rulerVotes;
    const controlPercentSpan = document.getElementById('controlPercent');
    if (controlPercentSpan) controlPercentSpan.innerText = controlPercent;
    const controlPercentLargeSpan = document.getElementById('controlPercentLarge');
    if (controlPercentLargeSpan) controlPercentLargeSpan.innerText = controlPercent + '%';
    const controlBar = document.getElementById('controlBar');
    if (controlBar) controlBar.style.width = controlPercent + '%';
    
    const factionsDiv = document.getElementById('politicalFactions');
    if (factionsDiv && typeof POLITICAL_FACTIONS !== 'undefined') {
        factionsDiv.innerHTML = '';
        for (let [key, faction] of Object.entries(POLITICAL_FACTIONS)) {
            const influence = council.getFactionInfluence(key);
            const percent = (influence / totalSeats * 100).toFixed(1);
            factionsDiv.innerHTML += `<div style="background:#2a2418;padding:8px 15px;border-radius:20px;border-left:3px solid ${faction.color};"><strong>${faction.name}</strong><br>🎫 ${influence} (${percent}%)</div>`;
        }
    }
    
    const container = document.getElementById('housesContainer');
    if (!container) return;
    container.innerHTML = '';
    
    for (let house of council.houses) {
        const influence = house.getEffectiveInfluence();
        const influencePercent = (influence / totalSeats * 100).toFixed(1);
        const loyaltyColor = house.loyaltyToRuler > 70 ? '#8bc34a' : (house.loyaltyToRuler > 40 ? '#ffd966' : '#ff6b6b');
        const politicalFaction = (typeof POLITICAL_FACTIONS !== 'undefined' && POLITICAL_FACTIONS[house.politicalFaction]) 
            ? POLITICAL_FACTIONS[house.politicalFaction] 
            : { name: 'Независимые', color: '#cfc294' };
        
        let armyHtml = '';
        if (house.personalArmy && house.personalArmy.length > 0) {
            armyHtml = `<div style="margin-top:8px;"><div style="font-size:0.7rem;color:#ffd966;">⚔️ ЛИЧНАЯ АРМИЯ:</div><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;">`;
            for (let unit of house.personalArmy) {
                const iconPath = (typeof unitDatabase !== 'undefined' && unitDatabase[unit.unitKey]) 
                    ? (unitDatabase[unit.unitKey].icon || unit.icon) 
                    : unit.icon;
                const unitName = (typeof unitDatabase !== 'undefined' && unitDatabase[unit.unitKey]) 
                    ? unitDatabase[unit.unitKey].name 
                    : unit.name;
                armyHtml += `<div class="army-unit-card"><img src="${iconPath || ''}" onerror="this.style.display='none'" style="width:32px;height:32px;"><div><div style="font-size:0.7rem;">${escapeHtml(unitName)}</div><div style="font-size:0.6rem;">👥 ${unit.count} отр.</div></div><button class="remove-unit-btn" data-house="${house.id}" data-unit="${unit.id}" style="background:#7a2a2a;padding:2px 6px;font-size:0.6rem;">✖</button></div>`;
            }
            armyHtml += `</div><button class="add-unit-btn" data-house="${house.id}" style="margin-top:4px;padding:2px 8px;font-size:0.6rem;">➕ Добавить отряд</button></div>`;
        } else {
            armyHtml = `<div style="margin-top:8px;"><button class="add-unit-btn" data-house="${house.id}" style="padding:2px 8px;font-size:0.6rem;">➕ Добавить личный отряд</button></div>`;
        }
        
        const lastEvent = house.history[0];
        const lastEventText = lastEvent ? (lastEvent.reason || 'нет событий') : 'нет событий';
        
        container.innerHTML += `
            <div class="house-card">
                <div class="house-header">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <img src="${house.coatOfArms || (typeof getIconPath === 'function' ? getIconPath('default_coat', '🛡️') : '🛡️')}" class="house-coat" onclick="openCoatOfArmsModal('${house.id}')" style="width:32px;height:32px;cursor:pointer;">
                        <span class="house-name">🏯 ${escapeHtml(house.name)}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span class="house-loyalty" style="background:${loyaltyColor}20;color:${loyaltyColor};">❤️ ${house.loyaltyToRuler}%</span>
                        <button class="delete-vassal-btn" data-id="${house.id}" style="background:#7a2a2a;padding:4px 8px;">🗑️</button>
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:10px;margin-top:5px;">
                    <img src="${house.leaderPortrait || (typeof getIconPath === 'function' ? getIconPath('default_portrait', '👤') : '👤')}" class="leader-portrait" onclick="openCoatOfArmsModal('${house.id}')" style="width:48px;height:48px;border-radius:50%;cursor:pointer;">
                    <div>
                        <div>👑 Глава: ${escapeHtml(house.leaderName)}</div>
                        <div>👑 Титул: ${house.title || 'Без титула'}</div>
                        <div>🏛️ Фракция: <span style="color:${politicalFaction.color}">${politicalFaction.name}</span></div>
                        <div>📊 Тип: ${(typeof VASSAL_TYPES !== 'undefined' && VASSAL_TYPES[house.vassalType]) ? VASSAL_TYPES[house.vassalType].name : 'Неизвестно'}</div>
                    </div>
                </div>
                <div>🎫 Влияние: ${influence} (${influencePercent}%)</div>
                <div class="influence-bar"><div class="influence-fill" style="width:${influencePercent}%;"></div></div>
                ${armyHtml}
                <div class="flex-row" style="margin-top:10px;gap:8px;">
                    <button class="modify-loyalty" data-id="${house.id}" data-delta="5" style="background:#3a6b3a;padding:4px 12px;">👍 +5 лояльности</button>
                    <button class="modify-loyalty" data-id="${house.id}" data-delta="-5" style="background:#6b3a3a;padding:4px 12px;">👎 -5 лояльности</button>
                    <button class="modify-influence" data-id="${house.id}" data-delta="5" style="background:#b8860b;padding:4px 12px;">📊 +5 влияния</button>
                    <button class="modify-influence" data-id="${house.id}" data-delta="-5" style="background:#7a2a2a;padding:4px 12px;">📊 -5 влияния</button>
                    ${VASSAL_UPGRADE_MAP[house.vassalType] ? `<button class="upgrade-rank-btn" data-id="${house.id}" style="background:#b8860b; padding:4px 12px;">⭐ Повысить ранг</button>` : ''}
                    <button class="vassal-detail-btn" data-id="${house.id}" style="background:#3a5a2a; padding:4px 12px;">📖 Подробнее</button>
                </div>
                <div style="font-size:0.6rem;color:#8a7a5a;margin-top:8px;">📜 Последнее: ${escapeHtml(lastEventText)}</div>
            </div>
        `;
    }
    
    // Кнопка добавления вассала, если её нет
    const addBtn = document.getElementById('addVassalBtn');
    if (!addBtn) {
        const newAddBtn = document.createElement('button');
        newAddBtn.id = 'addVassalBtn';
        newAddBtn.textContent = '➕ Добавить вассала';
        newAddBtn.style.margin = '10px auto';
        newAddBtn.style.display = 'block';
        newAddBtn.style.width = '200px';
        container.parentNode.insertBefore(newAddBtn, container.nextSibling);
        newAddBtn.onclick = openAddVassalModal;
    } else {
        addBtn.onclick = openAddVassalModal;
    }
    
    // Обработчики событий
    document.querySelectorAll('.modify-loyalty').forEach(btn => {
        btn.removeEventListener('click', window._loyaltyHandler);
        window._loyaltyHandler = () => manualModifyLoyalty(btn.dataset.id, parseInt(btn.dataset.delta), "Кнопка интерфейса");
        btn.addEventListener('click', window._loyaltyHandler);
    });
    
    document.querySelectorAll('.modify-influence').forEach(btn => {
        btn.removeEventListener('click', window._influenceHandler);
        window._influenceHandler = () => manualModifyInfluence(btn.dataset.id, parseInt(btn.dataset.delta), "Кнопка интерфейса");
        btn.addEventListener('click', window._influenceHandler);
    });
    
    document.querySelectorAll('.vassal-detail-btn').forEach(btn => {
        btn.removeEventListener('click', window._detailHandler);
        window._detailHandler = () => {
            if (typeof openVassalModal === 'function') {
                openVassalModal(btn.dataset.id);
            } else {
                console.warn("openVassalModal не определена");
                alert("Функция открытия энциклопедии ещё не добавлена");
            }
        };
        btn.addEventListener('click', window._detailHandler);
    });
    
    document.querySelectorAll('.upgrade-rank-btn').forEach(btn => {
        btn.removeEventListener('click', window._upgradeRankHandler);
        window._upgradeRankHandler = () => upgradeVassalRank(btn.dataset.id);
        btn.addEventListener('click', window._upgradeRankHandler);
    });
    
    document.querySelectorAll('.delete-vassal-btn').forEach(btn => {
        btn.removeEventListener('click', window._deleteHandler);
        window._deleteHandler = () => removeVassal(btn.dataset.id);
        btn.addEventListener('click', window._deleteHandler);
    });
    
    document.querySelectorAll('.add-unit-btn').forEach(btn => {
        btn.removeEventListener('click', window._addUnitHandler);
        window._addUnitHandler = () => openAddUnitModal(btn.dataset.house);
        btn.addEventListener('click', window._addUnitHandler);
    });
    
    document.querySelectorAll('.remove-unit-btn').forEach(btn => {
        btn.removeEventListener('click', window._removeUnitHandler);
        window._removeUnitHandler = () => removePersonalUnit(btn.dataset.house, btn.dataset.unit);
        btn.addEventListener('click', window._removeUnitHandler);
    });
}

// ========== 11. МОДАЛЬНОЕ ОКНО ВАССАЛА (ЭНЦИКЛОПЕДИЯ) ==========

function openVassalModal(houseId) {
    const house = findHouseById(houseId);
    if (!house) return;
    
    const council = getFactionCouncil(currentCouncilFaction);
    const politicalFaction = (typeof POLITICAL_FACTIONS !== 'undefined' && POLITICAL_FACTIONS[house.politicalFaction]) 
        ? POLITICAL_FACTIONS[house.politicalFaction] 
        : { name: 'Независимые', color: '#cfc294' };
    
    const modalContent = document.getElementById('vassalModalContent');
    if (!modalContent) return;
    
    let armyHtml = '';
    if (house.personalArmy && house.personalArmy.length > 0) {
        for (let unit of house.personalArmy) {
            const unitDef = (typeof unitDatabase !== 'undefined') ? unitDatabase[unit.unitKey] : null;
            const iconPath = (unitDef?.icon) ? (typeof getUnitIconPath === 'function' ? getUnitIconPath(unitDef.icon) : unitDef.icon) : unit.icon;
            const peopleCount = unit.count * (unitDef?.countPerUnit || 100);
            armyHtml += `
                <div class="vassal-unit-card">
                    <img src="${iconPath || ''}" onerror="this.style.display='none'">
                    <div class="unit-name">${escapeHtml(unit.name)}</div>
                    <div class="unit-count">${unit.count} отр. (${peopleCount.toLocaleString()} чел.)</div>
                </div>
            `;
        }
    } else {
        armyHtml = '<div style="text-align:center; color:#8a7a5a;">Нет личной армии</div>';
    }
    
    const garrisonMap = new Map();
    for (let unit of house.personalArmy) {
        const settlementId = unit.garrisonSettlementId;
        if (!settlementId) continue;
        if (!garrisonMap.has(settlementId)) {
            const settlement = (typeof SETTLEMENTS_DB !== 'undefined') ? SETTLEMENTS_DB[settlementId] : null;
            garrisonMap.set(settlementId, {
                name: settlement ? settlement.name : settlementId,
                units: []
            });
        }
        garrisonMap.get(settlementId).units.push(unit);
    }
    
    let garrisonHtml = '';
    if (garrisonMap.size > 0) {
        garrisonHtml = '<div style="margin-top: 15px;"><strong>🏰 Распределение гарнизона:</strong><div style="margin-left: 15px;">';
        for (let [settlementId, data] of garrisonMap) {
            const totalPeople = data.units.reduce((sum, u) => {
                const unitDef = (typeof unitDatabase !== 'undefined') ? unitDatabase[u.unitKey] : null;
                return sum + (unitDef?.countPerUnit || 100) * u.count;
            }, 0);
            garrisonHtml += `<div>📍 ${data.name}: ${data.units.length} отрядов (${totalPeople.toLocaleString()} чел.)</div>`;
        }
        garrisonHtml += '</div></div>';
    }
    
    modalContent.innerHTML = `
        <div style="display: flex; gap: 25px; flex-wrap: wrap;">
            <div style="flex: 0 0 200px; text-align: center;">
                <div style="margin-bottom: 20px;">
                    <div style="font-size: 0.8rem; color:#ffd966;">ГЕРБ</div>
                    <img src="${house.coatOfArms || (typeof getIconPath === 'function' ? getIconPath('default_coat', '🛡️') : '🛡️')}" style="width: 100px; height: 100px; object-fit: contain; margin-top: 5px; cursor: pointer;" onclick="openCoatOfArmsModal('${house.id}')" title="Нажмите, чтобы изменить">
                </div>
                <div>
                    <div style="font-size: 0.8rem; color:#ffd966;">ПОРТРЕТ ЛИДЕРА</div>
                    <img src="${house.leaderPortrait || (typeof getIconPath === 'function' ? getIconPath('default_portrait', '👤') : '👤')}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-top: 5px; cursor: pointer;" onclick="openCoatOfArmsModal('${house.id}')" title="Нажмите, чтобы изменить">
                </div>
            </div>
            
            <div style="flex: 1;">
                <h2 style="color:#ffd966; margin-top:0;">
                    🏯 <span class="editable-field" data-field="name" data-value="${escapeHtml(house.name)}">${escapeHtml(house.name)}</span>
                </h2>
                
                <div style="margin: 15px 0;">
                    <div><strong>👑 Глава:</strong> <span class="editable-field" data-field="leaderName" data-value="${escapeHtml(house.leaderName)}">${escapeHtml(house.leaderName)}</span></div>
                    <div><strong>👑 Титул:</strong> ${house.title || 'Без титула'}</div>
                    <div><strong>🏛️ Фракция:</strong> <span style="color:${politicalFaction.color}">${politicalFaction.name}</span></div>
                    <div><strong>📊 Тип вассала:</strong> ${(typeof VASSAL_TYPES !== 'undefined' && VASSAL_TYPES[house.vassalType]) ? VASSAL_TYPES[house.vassalType].name : 'Неизвестно'}
                    ${VASSAL_UPGRADE_MAP[house.vassalType] ? `<button id="upgradeRankModalBtn" style="background:#b8860b; margin-left: 10px; padding: 2px 10px;">⭐ Повысить ранг</button>` : ''}</div>
                </div>
                
                <div style="display: flex; gap: 20px; flex-wrap: wrap; margin: 15px 0;">
                    <div><strong>❤️ Лояльность:</strong> ${house.loyaltyToRuler}%</div>
                    <div><strong>🎫 Влияние:</strong> ${house.getEffectiveInfluence()}</div>
                    <div><strong>⚔️ Сила армии:</strong> ${house.personalArmyPower}</div>
                </div>
                
                <hr style="border-color: #b87c4f;">
                
                <div>
                    <strong>⚔️ ЛИЧНАЯ АРМИЯ</strong>
                    <div class="vassal-army-grid">
                        ${armyHtml}
                    </div>
                </div>
                
                ${garrisonHtml}
                
                <div style="margin-top: 15px; text-align: center; font-size: 0.7rem; color: #8a7a5a;">
                    📜 Последнее: ${house.history[0]?.reason || 'нет событий'}
                </div>
            </div>
        </div>
    `;
    
    // Редактируемые поля
    document.querySelectorAll('.editable-field').forEach(field => {
        field.addEventListener('click', (e) => {
            e.stopPropagation();
            const fieldName = field.dataset.field;
            const currentValue = field.dataset.value;
            
            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentValue;
            input.className = 'edit-input';
            input.style.width = 'auto';
            
            field.innerHTML = '';
            field.appendChild(input);
            input.focus();
            
            input.addEventListener('blur', () => {
                const newValue = input.value.trim();
                if (newValue && newValue !== currentValue) {
                    if (fieldName === 'name') {
                        house.name = newValue;
                        addGlobalLog(`🏯 Дом "${currentValue}" переименован в "${newValue}"`, 'council');
                    } else if (fieldName === 'leaderName') {
                        house.leaderName = newValue;
                        addGlobalLog(`👑 Глава дома "${house.name}" теперь ${newValue}`, 'council');
                    }
                    field.dataset.value = newValue;
                    field.innerHTML = escapeHtml(newValue);
                    if (typeof renderCouncil === 'function') renderCouncil();
                    openVassalModal(house.id);
                } else {
                    field.innerHTML = escapeHtml(currentValue);
                }
            });
            
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') input.blur();
            });
        });
    });
    
    const upgradeBtn = document.getElementById('upgradeRankModalBtn');
    if (upgradeBtn) {
        upgradeBtn.onclick = () => {
            upgradeVassalRank(house.id);
            closeVassalModal();
        };
    }
    
    const modal = document.getElementById('vassalModal');
    if (modal) modal.style.display = 'flex';
}

function closeVassalModal() {
    const modal = document.getElementById('vassalModal');
    if (modal) modal.style.display = 'none';
}

function openVassalModalByHouseId(houseId) {
    let targetHouse = null;
    if (typeof factionCouncils !== 'undefined') {
        for (let council of Object.values(factionCouncils)) {
            const house = council.findHouse(houseId);
            if (house) {
                targetHouse = house;
                break;
            }
        }
    }
    if (targetHouse) {
        openVassalModal(targetHouse.id);
    } else {
        addGlobalLog(`⚠️ Вассал с ID "${houseId}" не найден в совете`, 'council');
        alert(`Дом "${houseId}" ещё не создан в системе. Он появится после инициализации совета.`);
    }
}

console.log("✅ 06_council.js — часть 2 загружена");
console.log("✅ МОДУЛЬ 06 ПОЛНОСТЬЮ ЗАГРУЖЕН");