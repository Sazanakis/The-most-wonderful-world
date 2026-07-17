// ============================================================================
// МОДУЛЬ: corruption.js – система коррупции (версия 2.1)
// ============================================================================
// Загружено на гитхаб 18.07.2026
// ---------- ИНИЦИАЛИЗАЦИЯ ДАННЫХ ----------
function initCorruption() {
    if (typeof peopleState === 'undefined') return;
    if (!peopleState.corruption) {
        peopleState.corruption = {
            currentPercent: 1,
            turnsSinceLastGrowth: 0,
            agent: null
        };
    }
}

// ---------- РАСЧЁТ ТЕКУЩЕГО УРОВНЯ КОРРУПЦИИ ----------
function calculateCorruption() {
    if (!peopleState.corruption) initCorruption();
    const corr = peopleState.corruption;

    // Базовый рост раз в 4 хода
    corr.turnsSinceLastGrowth = (corr.turnsSinceLastGrowth || 0) + 1;
    if (corr.turnsSinceLastGrowth >= 4) {
        corr.currentPercent += 2;
        corr.turnsSinceLastGrowth = 0;
    }

    // Рост от дохода: +1.5% за каждые 20 000 дохода
    const weeklyIncome = (typeof getWeeklyIncome === 'function') ? getWeeklyIncome() : 0;
    const incomeBonus = Math.floor(weeklyIncome / 20000) * 1.5;
    corr.currentPercent += incomeBonus;

    // Продажные офицеры: +1% за каждые 10 отрядов в армии
    let totalUnits = 0;
    if (typeof armies !== 'undefined') {
        for (let army of armies) {
            if (army.factionId !== window.currentFaction) continue;
            totalUnits += army.units.length;
        }
    }
    const armyPenalty = Math.floor(totalUnits / 10);
    corr.currentPercent += armyPenalty;

    // Влияние построек: +0.5% за каждые 3 постройки в поселении
    let totalBuildings = 0;
    const provinces = (typeof getCurrentFactionProvinces === 'function') ? getCurrentFactionProvinces() : [];
    for (let pid of provinces) {
        const prov = provincesData[pid];
        if (!prov || !prov.settlements) continue;
        for (let s of prov.settlements) {
            if (s.captured) continue;
            totalBuildings += s.buildings.length;
        }
    }
    const buildingPenalty = Math.floor(totalBuildings / 3) * 0.5;
    corr.currentPercent += buildingPenalty;

    // Снижение от агента
    if (corr.agent) {
        corr.currentPercent -= corr.agent.skill;
    }

    // Снижение от построек: Суд (-2% за каждую) и Храм Варситэи (-5% если есть активный)
    let courtCount = 0;
    let hasTemple = false;
    for (let pid of provinces) {
        const prov = provincesData[pid];
        if (!prov || !prov.settlements) continue;
        for (let s of prov.settlements) {
            if (s.captured) continue;
            for (let b of s.buildings) {
                if (!b.completed) continue;
                if (b.special === "court") courtCount++;
                if (b.special === "templeVarsiteya") hasTemple = true;
            }
        }
    }
    corr.currentPercent -= courtCount * 2;
    if (hasTemple) corr.currentPercent -= 5;

    // Ограничение от 1% до 50%
    corr.currentPercent = Math.min(50, Math.max(1, corr.currentPercent));
    corr.currentPercent = Math.round(corr.currentPercent * 10) / 10; // 1 знак после запятой

    // Обновляем штрафы в реальном времени
    applyCorruptionEffects();
}

// ---------- ПРИМЕНЕНИЕ ЭФФЕКТОВ КОРРУПЦИИ ----------
function applyCorruptionEffects() {
    const corr = peopleState.corruption;
    if (!corr) return;
    window._corruptionPercent = corr.currentPercent;
}

// ---------- ШТРАФ К ЛОЯЛЬНОСТИ ВАССАЛОВ ----------
function applyLoyaltyPenalty() {
    const corr = peopleState.corruption;
    if (!corr || corr.currentPercent < 15) return;

    const penalty = Math.floor(corr.currentPercent - 15);
    if (penalty <= 0) return;

    const council = (typeof factionCouncils !== 'undefined' && factionCouncils[window.currentFaction]) 
        ? factionCouncils[window.currentFaction] 
        : null;
    if (!council) return;

    for (let house of council.houses) {
        house.loyaltyToRuler = Math.min(
            Math.max(0, house.loyaltyToRuler - penalty),
            100 - penalty
        );
        if (typeof addGlobalLog === 'function') {
            addGlobalLog(`⚠️ Коррупция (${corr.currentPercent}%) снижает лояльность дома "${house.name}" на ${penalty}%.`, 'council');
        }
    }
}

// ---------- УДОРОЖАНИЕ СТРОИТЕЛЬСТВА ----------
function getBuildingCostMultiplier() {
    const corr = peopleState.corruption;
    if (!corr || corr.currentPercent < 5) return 1.0;
    return 1 + (corr.currentPercent / 100);
}

// ========== АГЕНТ-КОНТРОЛЁР ==========

// Модальное окно найма агента (как у исследователей)
function openHireAgentModal() {
    const oldModal = document.getElementById('agentHireModal');
    if (oldModal) oldModal.remove();

    const modal = document.createElement('div');
    modal.id = 'agentHireModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:10000;display:flex;justify-content:center;align-items:center;';

    let raceOptions = '';
    const races = (typeof RACE_NAMES !== 'undefined') ? RACE_NAMES : { "Люди": { male: ["Агент"], female: ["Агент"] } };
    for (let race in races) {
        raceOptions += `<option value="${race}">${race}</option>`;
    }

    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:400px;width:90%;color:#e6ddb3;">
            <h3>🕵️ Нанять агента-контролёра</h3>
            <label>Раса: <select id="agentRace">${raceOptions}</select></label>
            <label style="margin-left:10px;">Пол: <select id="agentGender"><option value="male">Мужской</option><option value="female">Женский</option></select></label>
            <p style="margin-top:15px;">Стоимость найма: <strong>3000 эрсов</strong></p>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px;">
                <button id="confirmAgentHireBtn">✅ Нанять</button>
                <button id="cancelAgentHireBtn" style="background:#7a2a2a;">Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('cancelAgentHireBtn').onclick = () => modal.remove();
    document.getElementById('confirmAgentHireBtn').onclick = () => {
        const race = document.getElementById('agentRace').value;
        const gender = document.getElementById('agentGender').value;
        const name = (typeof getRandomName === 'function') ? getRandomName(race, gender) : 'Агент';
        const portrait = (typeof getRandomPortrait === 'function') ? getRandomPortrait(race, gender) : 'icons/default_portrait.png';
        const treasury = (typeof getCurrentTreasury === 'function') ? getCurrentTreasury() : window.factionTreasury || 0;
        if (treasury < 3000) {
            alert('Недостаточно эрсов.');
            return;
        }
        if (typeof setFactionTreasury === 'function') setFactionTreasury(treasury - 3000);
        else window.factionTreasury -= 3000;

        peopleState.corruption.agent = {
            id: Date.now(),
            name, race, gender,
            skill: 1,
            salary: 0,
            portrait,
            fundedTimes: 0
        };
        if (typeof addGlobalLog === 'function') addGlobalLog(`🕵️ Нанят агент-контролёр "${name}" (${race}).`, 'general');
        if (typeof saveAllData === 'function') saveAllData();
        renderCorruptionUI();
        modal.remove();
    };
}

function fireAgent() {
    if (!peopleState.corruption.agent) return;
    const name = peopleState.corruption.agent.name;
    peopleState.corruption.agent = null;
    if (typeof addGlobalLog === 'function') addGlobalLog(`Агент "${name}" уволен.`, 'general');
    if (typeof saveAllData === 'function') saveAllData();
    renderCorruptionUI();
}

function fundAgent() {
    const agent = peopleState.corruption.agent;
    if (!agent) return alert('Нет агента.');
    if (agent.fundedTimes >= 5) return alert('Лимит финансирования в этом ходу исчерпан.');
    const treasury = (typeof getCurrentTreasury === 'function') ? getCurrentTreasury() : window.factionTreasury || 0;
    if (treasury < 5000) return alert('Недостаточно эрсов.');
    if (typeof setFactionTreasury === 'function') setFactionTreasury(treasury - 5000);
    else window.factionTreasury -= 5000;
    agent.fundedTimes++;
    peopleState.corruption.currentPercent = Math.max(1, peopleState.corruption.currentPercent - 1);
    agent.skill = Math.min(30, agent.skill + 0.1);
    if (typeof addGlobalLog === 'function') addGlobalLog(`💰 Агент профинансирован. Коррупция: ${peopleState.corruption.currentPercent}%.`, 'general');
    if (typeof saveAllData === 'function') saveAllData();
    renderCorruptionUI();
}

function killAgent() {
    if (!peopleState.corruption.agent) return;
    if (confirm('Убить агента?')) {
        peopleState.corruption.agent = null;
        if (typeof addGlobalLog === 'function') addGlobalLog('💀 Агент убит.', 'general');
        if (typeof saveAllData === 'function') saveAllData();
        renderCorruptionUI();
    }
}

function exportAgent() {
    const agent = peopleState.corruption.agent;
    if (!agent) return alert('Нет агента.');
    const data = JSON.stringify(agent, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `agent_${agent.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    a.click();
}

function importAgent(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const agent = JSON.parse(e.target.result);
            if (!agent.name || !agent.skill) return alert('Неверный формат.');
            if (peopleState.corruption.agent && !confirm('Заменить текущего агента?')) return;
            peopleState.corruption.agent = agent;
            if (typeof saveAllData === 'function') saveAllData();
            renderCorruptionUI();
        } catch(err) { alert('Ошибка импорта.'); }
    };
    reader.readAsText(file);
}

// ---------- РУЧНОЕ ИЗМЕНЕНИЕ ----------
function setCorruptionManually(newValue) {
    const val = parseFloat(newValue);
    if (isNaN(val) || val < 1 || val > 50) return alert('Значение от 1 до 50.');
    peopleState.corruption.currentPercent = val;
    if (typeof saveAllData === 'function') saveAllData();   // ← обязательно
    renderCorruptionUI();
}

// ---------- ОТРИСОВКА ----------
function renderCorruptionUI() {
    const container = document.getElementById('corruptionContainer');
    if (!container) return;
    if (!peopleState || !peopleState.corruption) return;
    const corr = peopleState.corruption;
    const agent = corr.agent;

    const weeklyIncome = (typeof getWeeklyIncome === 'function') ? getWeeklyIncome() : 0;
    const incomeBonus = Math.floor(weeklyIncome / 20000) * 1.5;
    let totalUnits = 0;
    if (typeof armies !== 'undefined') for (let a of armies) if (a.factionId === window.currentFaction) totalUnits += a.units.length;
    const armyPenalty = Math.floor(totalUnits / 10);
    let totalBuildings = 0;
    const provinces = (typeof getCurrentFactionProvinces === 'function') ? getCurrentFactionProvinces() : [];
    for (let pid of provinces) {
        const prov = provincesData[pid];
        if (prov && prov.settlements) for (let s of prov.settlements) if (!s.captured) totalBuildings += s.buildings.length;
    }
    const buildingPenalty = Math.floor(totalBuildings / 3) * 0.5;

    let courtCount = 0, hasTemple = false;
    for (let pid of provinces) {
        const prov = provincesData[pid];
        if (prov && prov.settlements) for (let s of prov.settlements) if (!s.captured) for (let b of s.buildings) if (b.completed) {
            if (b.special === "court") courtCount++;
            if (b.special === "templeVarsiteya") hasTemple = true;
        }
    }

    let html = '<div class="stat-card"><h3>🕸️ Коррупция</h3>';
    html += `<p><strong>Текущий уровень: <span style="color:${corr.currentPercent > 20 ? '#ff6b6b' : '#ffd966'};">${corr.currentPercent}%</span></strong></p>`;

    html += '<p><em>Факторы роста (статичные):</em><br>';
    html += `• Базовый рост: +2% (каждые 4 хода, сейчас ход ${corr.turnsSinceLastGrowth}/4)<br>`;
    html += `• Доход от налогов (${weeklyIncome} эрсов): +${incomeBonus}%<br>`;
    html += `• Отрядов в армии (${totalUnits}): +${armyPenalty}%<br>`;
    html += `• Построек (${totalBuildings}): +${buildingPenalty}%<br>`;
    html += '</p>';

    html += '<p><em>Факторы снижения:</em><br>';
    html += `• Суды (${courtCount} шт.): -${courtCount * 2}%<br>`;
    html += `• Храм Варситэи: ${hasTemple ? '-5%' : 'нет'}<br>`;
    if (agent) html += `• Агент "${agent.name}": -${agent.skill.toFixed(1)}%<br>`;
    html += '</p>';

    html += '<div style="margin-top:15px; border-top:1px solid #b8943a; padding-top:10px;">';
    html += '<h4>🕵️ Агент-контролёр</h4>';
    if (agent) {
        html += `<div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">`;
        html += `<img src="${agent.portrait}" style="width:200px;height:200px;object-fit:cover;border-radius:4px;">`;
        html += `<div><strong>${agent.name}</strong> (${agent.race}, навык: ${agent.skill.toFixed(1)})</div>`;
        html += `</div>`;
        html += `<button id="fundAgentBtn" ${agent.fundedTimes >= 5 ? 'disabled' : ''}>💰 Финансировать (5000 эрсов, ${agent.fundedTimes}/5)</button> `;
        html += `<button id="fireAgentBtn">❌ Уволить</button> <button id="killAgentBtn" class="danger-btn">🗡️ Убить</button> `;
        html += `<button id="exportAgentBtn">📤 Экспорт</button> <button id="importAgentBtn">📥 Импорт</button>`;
        html += `<input type="file" id="importAgentFile" accept=".json" style="display:none;">`;
    } else {
        html += `<p>Агент не нанят.</p>`;
        html += `<button id="hireAgentBtn">➕ Нанять агента</button>`;
    }
    html += '</div>';

    html += '<div style="margin-top:15px; border-top:1px solid #b8943a; padding-top:10px;">';
    html += `<label>Ручная установка: <input type="number" id="manualCorruptionInput" value="${corr.currentPercent}" step="0.1" min="1" max="50" style="width:80px;">% `;
    html += '<button id="setCorruptionBtn">✔ Применить</button></label>';
    html += '</div></div>';

    container.innerHTML = html;

    // Привязка кнопок
    const hireBtn = document.getElementById('hireAgentBtn');
    if (hireBtn) hireBtn.onclick = openHireAgentModal;
    const fundBtn = document.getElementById('fundAgentBtn');
    if (fundBtn) fundBtn.onclick = fundAgent;
    const fireBtn = document.getElementById('fireAgentBtn');
    if (fireBtn) fireBtn.onclick = fireAgent;
    const killBtn = document.getElementById('killAgentBtn');
    if (killBtn) killBtn.onclick = killAgent;
    const exportBtn = document.getElementById('exportAgentBtn');
    if (exportBtn) exportBtn.onclick = exportAgent;
    const importBtn = document.getElementById('importAgentBtn');
    const importFile = document.getElementById('importAgentFile');
    if (importBtn && importFile) {
        importBtn.onclick = () => importFile.click();
        importFile.onchange = (e) => { if (e.target.files[0]) importAgent(e.target.files[0]); };
    }
    const setBtn = document.getElementById('setCorruptionBtn');
    if (setBtn) setBtn.onclick = () => {
        const inp = document.getElementById('manualCorruptionInput');
        if (inp) setCorruptionManually(inp.value);
    };
}

// ---------- ОБНОВЛЕНИЕ КАЖДЫЙ ХОД ----------
function processCorruptionTurn() {
    calculateCorruption();
    applyLoyaltyPenalty();
    // Рост навыка агента на 5 за ход (максимум 30)
    if (peopleState.corruption && peopleState.corruption.agent) {
        peopleState.corruption.agent.skill = Math.min(30, (peopleState.corruption.agent.skill || 1) + 5);
        peopleState.corruption.agent.fundedTimes = 0; // сброс финансирования на новый ход
    }
    renderCorruptionUI();
}

// ---------- ИНТЕГРАЦИЯ В СТОИМОСТЬ СТРОИТЕЛЬСТВА ----------
(function() {
    const originalStartBuilding = window.startBuilding;
    if (typeof originalStartBuilding === 'function') {
        window.startBuilding = function(settlementId, buildingName, isUpgrade, baseBuilding) {
            const multiplier = getBuildingCostMultiplier();
            if (multiplier > 1) {
                const catalog = buildingsCatalog;
                const origCost = catalog[buildingName]?.cost;
                if (origCost) {
                    const modCost = { ...origCost };
                    for (let key in modCost) modCost[key] = Math.floor(modCost[key] * multiplier);
                    catalog[buildingName].cost = modCost;
                    const result = originalStartBuilding(settlementId, buildingName, isUpgrade, baseBuilding);
                    catalog[buildingName].cost = origCost;
                    return result;
                }
            }
            return originalStartBuilding(settlementId, buildingName, isUpgrade, baseBuilding);
        };
    }
})();

// Экспорт
window.initCorruption = initCorruption;
window.calculateCorruption = calculateCorruption;
window.processCorruptionTurn = processCorruptionTurn;
window.getBuildingCostMultiplier = getBuildingCostMultiplier;
window.renderCorruptionUI = renderCorruptionUI;
window.openHireAgentModal = openHireAgentModal;
window.fundAgent = fundAgent;
window.fireAgent = fireAgent;
window.killAgent = killAgent;
window.exportAgent = exportAgent;
window.importAgent = importAgent;

console.log("✅ corruption.js загружен (версия 2.1)");