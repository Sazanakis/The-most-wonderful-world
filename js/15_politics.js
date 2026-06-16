// ============================================================================
// МОДУЛЬ 15: politics.js
// Политические механики: отношения фракций, дипломатия, секретные цели
// ВЕРСИЯ 2.0 – ДОБАВЛЕНЫ ПРОВЕРКИ НА СУЩЕСТВОВАНИЕ ГЛОБАЛЬНЫХ ОБЪЕКТОВ
// ============================================================================

// ========== 1. ОТНОШЕНИЯ МЕЖДУ ФРАКЦИЯМИ ==========
let politicalRelations = {
    dayo: { loyal: -50, neutral: 0, proyurgan: -30, lepus: 20 },
    loyal: { dayo: -50, neutral: 30, proyurgan: -80, lepus: 60 },
    neutral: { dayo: 0, loyal: 30, proyurgan: -20, lepus: 10 },
    proyurgan: { dayo: -30, loyal: -80, neutral: -20, lepus: -60 },
    lepus: { dayo: 20, loyal: 60, neutral: 10, proyurgan: -60 }
};

// ========== 2. СЕКРЕТНЫЕ ЦЕЛИ ПРОВИНЦИЙ ==========
const SECRET_GOALS = {
    orochima: {
        id: "orochima",
        name: "Независимость или трон",
        description: "Клан Дакэта стремится к независимости от Хелона или к захвату трона.",
        type: "conquest",
        progress: 0,
        target: 100,
        rewards: { prestige: 50, treasury: 5000, units: ["Мураи", "Мураи"] }
    },
    kaya: {
        id: "kaya",
        name: "Возвести Эльзу на трон",
        description: "Графиня Эльза Маркарн должна стать правительницей Хелона.",
        type: "diplomacy",
        progress: 0,
        target: 100,
        rewards: { prestige: 60, treasury: 4000, alliances: ["loyal"] }
    },
    gorskin: {
        id: "gorskin",
        name: "Помочь вторжению Юргана",
        description: "Княгиня Лисанна Горски тайно помогает Империи Юрган.",
        type: "secret",
        progress: 0,
        target: 100,
        isSecret: true,
        rewards: { prestige: 40, treasury: 8000, units: ["Дэфекторы", "Дэфекторы"] }
    },
    regent_city: {
        id: "regent_city",
        name: "Выжить и наблюдать",
        description: "Совет регентов ждёт подходящего момента, чтобы примкнуть к победителю.",
        type: "survival",
        progress: 0,
        target: 100,
        rewards: { prestige: 30, treasury: 3000 }
    },
    leporis: {
        id: "leporis",
        name: "Предотвратить вторжение",
        description: "Союз Лепус должен не допустить вторжения Юргана в Хелон.",
        type: "defense",
        progress: 0,
        target: 100,
        rewards: { prestige: 70, treasury: 6000, units: ["Орлиные рыцари"] }
    }
};

let secretGoalsProgress = {};

// ========== 3. ДИПЛОМАТИЧЕСКИЕ ДЕЙСТВИЯ ==========
const DIPLOMATIC_ACTIONS = {
    DECLARE_WAR: "declare_war",
    MAKE_PEACE: "make_peace",
    FORM_ALLIANCE: "form_alliance",
    BREAK_ALLIANCE: "break_alliance",
    TRADE_AGREEMENT: "trade_agreement",
    SEND_GIFT: "send_gift",
    DEMAND_TERRITORY: "demand_territory"
};

let activeDiplomacy = {
    wars: [],
    alliances: [],
    peace: []
};
window.activeDiplomacy = activeDiplomacy;

// ========== 4. ОСНОВНЫЕ ФУНКЦИИ ==========
function getProvinceRhetoric(provinceId) {
    const faction = (typeof PROVINCE_TO_FACTION !== 'undefined') ? PROVINCE_TO_FACTION[provinceId] : null;
    return (typeof FACTION_TO_RHETORIC !== 'undefined' && faction) ? FACTION_TO_RHETORIC[faction] : "neutral";
}

function getProvinceFaction(provinceId) {
    return (typeof PROVINCE_TO_FACTION !== 'undefined') ? PROVINCE_TO_FACTION[provinceId] : provinceId;
}

function getRelationBetweenProvinces(province1, province2) {
    const rhetoric1 = getProvinceRhetoric(province1);
    const rhetoric2 = getProvinceRhetoric(province2);
    if (rhetoric1 === rhetoric2) return 50;
    return politicalRelations[rhetoric1]?.[rhetoric2] || 0;
}

function canDeclareWar(attackerProvince, defenderProvince) {
    if (attackerProvince === defenderProvince) return { allowed: false, reason: "Нельзя объявить войну самому себе" };
    const attackerRhetoric = getProvinceRhetoric(attackerProvince);
    const defenderRhetoric = getProvinceRhetoric(defenderProvince);
    if (attackerRhetoric === "loyal" && defenderRhetoric === "loyal") return { allowed: false, reason: "Лоялисты не воюют друг с другом" };
    const areAllied = checkAlliance(attackerProvince, defenderProvince);
    if (areAllied) return { allowed: false, reason: "Нельзя объявить войну союзнику" };
    const alreadyAtWar = checkWar(attackerProvince, defenderProvince);
    if (alreadyAtWar) return { allowed: false, reason: "Уже в состоянии войны" };
    const relation = getRelationBetweenProvinces(attackerProvince, defenderProvince);
    if (relation > 50) return { allowed: false, reason: `Отношения слишком хорошие (${relation}) для войны` };
    return { allowed: true, reason: null };
}

function declareWar(attackerProvince, defenderProvince) {
    const check = canDeclareWar(attackerProvince, defenderProvince);
    if (!check.allowed) {
        addGlobalLog(`❌ Нельзя объявить войну: ${check.reason}`, 'general');
        return false;
    }
    const alreadyExists = activeDiplomacy.wars.some(
        w => (w.attacker === attackerProvince && w.defender === defenderProvince) ||
             (w.attacker === defenderProvince && w.defender === attackerProvince)
    );
    if (alreadyExists) {
        addGlobalLog(`⚠️ Война между ${attackerProvince} и ${defenderProvince} уже идёт`, 'general');
        return false;
    }
    activeDiplomacy.wars.push({ attacker: attackerProvince, defender: defenderProvince, startedAt: Date.now() });
    const attackerRhetoric = getProvinceRhetoric(attackerProvince);
    const defenderRhetoric = getProvinceRhetoric(defenderProvince);
    if (politicalRelations[attackerRhetoric]?.[defenderRhetoric] !== undefined) {
        politicalRelations[attackerRhetoric][defenderRhetoric] = Math.max(-100, politicalRelations[attackerRhetoric][defenderRhetoric] - 20);
        politicalRelations[defenderRhetoric][attackerRhetoric] = Math.max(-100, politicalRelations[defenderRhetoric][attackerRhetoric] - 20);
    }
    const attackerName = (typeof PROVINCE_NAMES !== 'undefined' && PROVINCE_NAMES[attackerProvince]) ? PROVINCE_NAMES[attackerProvince] : attackerProvince;
    const defenderName = (typeof PROVINCE_NAMES !== 'undefined' && PROVINCE_NAMES[defenderProvince]) ? PROVINCE_NAMES[defenderProvince] : defenderProvince;
    addGlobalLog(`⚔️ ${attackerName} объявил(а) войну ${defenderName}!`, 'general');
    saveDiplomacyData();
    if (typeof renderDiplomacyTable === 'function') renderDiplomacyTable();
    return true;
}

function makePeace(province1, province2) {
    const warIndex = activeDiplomacy.wars.findIndex(
        w => (w.attacker === province1 && w.defender === province2) ||
             (w.attacker === province2 && w.defender === province1)
    );
    if (warIndex === -1) {
        addGlobalLog(`⚠️ Нет активной войны между ${province1} и ${province2}`, 'general');
        return false;
    }
    activeDiplomacy.wars.splice(warIndex, 1);
    activeDiplomacy.peace.push({ party1: province1, party2: province2, expiresAt: Date.now() + (10 * 7 * 24 * 60 * 60 * 1000) });
    const name1 = (typeof PROVINCE_NAMES !== 'undefined' && PROVINCE_NAMES[province1]) ? PROVINCE_NAMES[province1] : province1;
    const name2 = (typeof PROVINCE_NAMES !== 'undefined' && PROVINCE_NAMES[province2]) ? PROVINCE_NAMES[province2] : province2;
    addGlobalLog(`🕊️ Мир заключён между ${name1} и ${name2}`, 'general');
    saveDiplomacyData();
    if (typeof renderDiplomacyTable === 'function') renderDiplomacyTable();
    return true;
}

function checkWar(province1, province2) {
    return activeDiplomacy.wars.some(
        w => (w.attacker === province1 && w.defender === province2) ||
             (w.attacker === province2 && w.defender === province1)
    );
}

function checkAlliance(province1, province2) {
    return activeDiplomacy.alliances.some(
        a => (a.party1 === province1 && a.party2 === province2) ||
             (a.party1 === province2 && a.party2 === province1)
    );
}

// ========== 5. СЕКРЕТНЫЕ ЦЕЛИ ==========
function getSecretGoal(provinceId) {
    return SECRET_GOALS[provinceId] || null;
}

function getSecretGoalProgress(provinceId) {
    return secretGoalsProgress[provinceId] || 0;
}

function advanceSecretGoal(provinceId, amount) {
    const goal = SECRET_GOALS[provinceId];
    if (!goal) return false;
    const current = getSecretGoalProgress(provinceId);
    const newProgress = Math.min(goal.target, current + amount);
    secretGoalsProgress[provinceId] = newProgress;
    addGlobalLog(`🎯 Секретная цель "${goal.name}" прогресс: ${newProgress}/${goal.target}`, 'general');
    if (newProgress >= goal.target) {
        completeSecretGoal(provinceId);
        return true;
    }
    saveSecretGoalsData();
    return false;
}

function completeSecretGoal(provinceId) {
    const goal = SECRET_GOALS[provinceId];
    if (!goal) return;
    addGlobalLog(`🏆 СЕКРЕТНАЯ ЦЕЛЬ ВЫПОЛНЕНА: ${goal.name}!`, 'general');
    if (goal.rewards.treasury) {
        if (typeof GameState !== 'undefined') GameState.addToTreasury(goal.rewards.treasury);
        else if (typeof armyTreasury !== 'undefined') armyTreasury += goal.rewards.treasury;
        addGlobalLog(`💰 Получено ${goal.rewards.treasury} эрсов!`, 'general');
    }
    if (goal.rewards.units && typeof addUnitToArmy === 'function' && typeof armies !== 'undefined') {
        const targetArmy = armies[0];
        if (targetArmy) {
            for (let unitKey of goal.rewards.units) {
                addUnitToArmy(targetArmy.id, unitKey, 1);
                addGlobalLog(`⚔️ Получен отряд "${unitKey}"!`, 'general');
            }
        }
    }
    secretGoalsProgress[provinceId] = -1;
    saveSecretGoalsData();
}

// ========== 6. ДИПЛОМАТИЧЕСКИЙ ИНТЕРФЕЙС ==========
function renderDiplomacyTable() {
    const container = document.getElementById('diplomacyTableContainer');
    if (!container) return;
    const provinces = ["orochima", "kaya", "gorskin", "regent_city", "leporis"];
    const provinceNames = {
        orochima: "Орочима",
        kaya: "Кайя",
        gorskin: "Горския",
        regent_city: "Регент-Сити",
        leporis: "Лепорис"
    };
    let html = '<table class="diplomacy-table" style="width:100%; border-collapse: collapse;">';
    html += '<thead><tr><th>Провинция</th>';
    for (let p of provinces) html += `<th>${provinceNames[p]}</th>`;
    html += '</tr></thead><tbody>';
    for (let i = 0; i < provinces.length; i++) {
        const rowProvince = provinces[i];
        html += `<tr><th style="background:#2a2418;">${provinceNames[rowProvince]}</th>`;
        for (let j = 0; j < provinces.length; j++) {
            const colProvince = provinces[j];
            if (rowProvince === colProvince) {
                html += `<td style="text-align:center; background:#1f1c14;">—</td>`;
                continue;
            }
            const relation = getRelationBetweenProvinces(rowProvince, colProvince);
            const atWar = checkWar(rowProvince, colProvince);
            const allied = checkAlliance(rowProvince, colProvince);
            let status = "", color = "#cfc294";
            if (atWar) { status = "⚔️ ВОЙНА"; color = "#ff6b6b"; }
            else if (allied) { status = "🤝 СОЮЗ"; color = "#8bc34a"; }
            else if (relation > 30) { status = "🤝 Дружественные"; color = "#8bc34a"; }
            else if (relation < -30) { status = "😠 Враждебные"; color = "#ff6b6b"; }
            else { status = "⚖️ Нейтральные"; color = "#cfc294"; }
            html += `<td style="text-align:center; color:${color};">${status}<br><span style="font-size:0.7rem;">отношения: ${relation}</span></td>`;
        }
        html += '</tr>';
    }
    html += '</tbody></table>';
    container.innerHTML = html;
}

function openDiplomacyModal(targetProvince) {
    const currentProvinceId = (typeof currentProvince !== 'undefined') ? currentProvince : "orochima";
    const targetName = (typeof PROVINCE_NAMES !== 'undefined' && PROVINCE_NAMES[targetProvince]) ? PROVINCE_NAMES[targetProvince] : targetProvince;
    const relation = getRelationBetweenProvinces(currentProvinceId, targetProvince);
    const atWar = checkWar(currentProvinceId, targetProvince);
    const allied = checkAlliance(currentProvinceId, targetProvince);
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:2000;display:flex;justify-content:center;align-items:center';
    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:400px;width:90%;">
            <h3>📜 Дипломатия: ${targetName}</h3>
            <div style="margin:15px 0;">
                <div>📊 Отношения: ${relation}</div>
                <div>⚔️ Война: ${atWar ? 'Да' : 'Нет'}</div>
                <div>🤝 Союз: ${allied ? 'Да' : 'Нет'}</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;">
                ${!atWar ? `<button id="diploDeclareWarBtn" style="background:#7a2a2a;">⚔️ Объявить войну</button>` : `<button id="diploMakePeaceBtn" style="background:#3a6b3a;">🕊️ Заключить мир</button>`}
                ${!allied && !atWar ? `<button id="diploAllianceBtn" style="background:#3a5a2a;">🤝 Предложить союз</button>` : ''}
                <button id="diploSendGiftBtn">🎁 Отправить подарок (500 эрсов)</button>
                <button id="diploCloseBtn" style="background:#7a2a2a;">❌ Закрыть</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    const declareBtn = document.getElementById('diploDeclareWarBtn');
    const peaceBtn = document.getElementById('diploMakePeaceBtn');
    const giftBtn = document.getElementById('diploSendGiftBtn');
    const allianceBtn = document.getElementById('diploAllianceBtn');
    const closeBtn = document.getElementById('diploCloseBtn');
    if (declareBtn) declareBtn.addEventListener('click', () => { declareWar(currentProvinceId, targetProvince); modal.remove(); if (typeof renderDiplomacyTable === 'function') renderDiplomacyTable(); });
    if (peaceBtn) peaceBtn.addEventListener('click', () => { makePeace(currentProvinceId, targetProvince); modal.remove(); if (typeof renderDiplomacyTable === 'function') renderDiplomacyTable(); });
    if (allianceBtn) allianceBtn.addEventListener('click', () => { addGlobalLog(`🤝 Предложение союза отправлено в ${targetName}`, 'general'); modal.remove(); });
    if (giftBtn) giftBtn.addEventListener('click', () => {
        let treasury = 0;
        if (typeof GameState !== 'undefined') treasury = GameState.getTreasury();
        else if (typeof armyTreasury !== 'undefined') treasury = armyTreasury;
        if (treasury >= 500) {
            if (typeof GameState !== 'undefined') GameState.addToTreasury(-500);
            else if (typeof armyTreasury !== 'undefined') armyTreasury -= 500;
            addGlobalLog(`🎁 Отправлен подарок (500 эрсов) в ${targetName}. Отношения улучшены.`, 'general');
            const rhetoric1 = getProvinceRhetoric(currentProvinceId);
            const rhetoric2 = getProvinceRhetoric(targetProvince);
            if (politicalRelations[rhetoric1]?.[rhetoric2] !== undefined) {
                politicalRelations[rhetoric1][rhetoric2] = Math.min(100, politicalRelations[rhetoric1][rhetoric2] + 10);
                politicalRelations[rhetoric2][rhetoric1] = Math.min(100, politicalRelations[rhetoric2][rhetoric1] + 10);
            }
            if (typeof renderDiplomacyTable === 'function') renderDiplomacyTable();
            modal.remove();
        } else {
            addGlobalLog(`❌ Недостаточно средств для подарка! Нужно 500 эрсов.`, 'general');
        }
    });
    if (closeBtn) closeBtn.addEventListener('click', () => modal.remove());
}

// ========== 7. СОХРАНЕНИЕ И ЗАГРУЗКА ==========
function saveDiplomacyData() {
    const data = { politicalRelations, activeDiplomacy, secretGoalsProgress };
    localStorage.setItem('diplomacy_data', JSON.stringify(data));
}

function loadDiplomacyData() {
    const saved = localStorage.getItem('diplomacy_data');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.politicalRelations) politicalRelations = data.politicalRelations;
            if (data.activeDiplomacy) activeDiplomacy = data.activeDiplomacy;
            if (data.secretGoalsProgress) secretGoalsProgress = data.secretGoalsProgress;
        } catch(e) { console.error("Ошибка загрузки дипломатии:", e); }
    }
}

function saveSecretGoalsData() {
    localStorage.setItem('secret_goals', JSON.stringify(secretGoalsProgress));
}

function loadSecretGoalsData() {
    const saved = localStorage.getItem('secret_goals');
    if (saved) {
        try {
            secretGoalsProgress = JSON.parse(saved);
        } catch(e) { console.error("Ошибка загрузки секретных целей:", e); }
    }
}

// ========== 8. ИНИЦИАЛИЗАЦИЯ ПОЛИТИКИ ==========
function initPolitics() {
    loadDiplomacyData();
    loadSecretGoalsData();
    if (typeof renderDiplomacyTable === 'function') renderDiplomacyTable();
    addGlobalLog("🏛️ Политическая система инициализирована", 'general');
}

// Экспорт функций
window.politicalRelations = politicalRelations;
window.activeDiplomacy = activeDiplomacy;
window.declareWar = declareWar;
window.makePeace = makePeace;
window.checkWar = checkWar;
window.checkAlliance = checkAlliance;
window.getRelationBetweenProvinces = getRelationBetweenProvinces;
window.getProvinceRhetoric = getProvinceRhetoric;
window.getProvinceFaction = getProvinceFaction;
window.openDiplomacyModal = openDiplomacyModal;
window.renderDiplomacyTable = renderDiplomacyTable;
window.saveDiplomacyData = saveDiplomacyData;
window.loadDiplomacyData = loadDiplomacyData;
window.initPolitics = initPolitics;

console.log("✅ 15_politics.js загружен — политические механики (версия 2.0)");