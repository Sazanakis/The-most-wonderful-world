// ============================================================================
// МОДУЛЬ: corruption.js – система коррупции (версия 2.1)
// ============================================================================
// загружено на гитхаб 26.09.26
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
// ============================================================
// ВЛИЯНИЕ ВАССАЛОВ НА КОРРУПЦИЮ
// ============================================================

/**
 * Считает эффект одного вассала на коррупцию.
 * @param {Object} house - объект вассала (InfluentialHouse)
 * @returns {Object} { effect, base, modifier, loyalty, influence, party }
 */
function getVassalCorruptionImpact(house) {
    if (!house) return { effect: 0, base: 0, modifier: 0, loyalty: 0, influence: 0, party: '' };

    const loyalty = house.loyaltyToRuler || 50;
    let base = 0;
    if (loyalty < 30) base = 1.5;
    else if (loyalty < 50) base = 0.5;
    else if (loyalty < 70) base = 0;
    else if (loyalty < 85) base = -0.5;
    else base = -1.0;

    const influence = (typeof house.getEffectiveInfluence === 'function')
        ? house.getEffectiveInfluence()
        : (house.currentInfluence || 0);
    const party = house.politicalFaction || 'NOBILITY';

    // Модификатор партии (усиление эффекта по модулю):
    // - LOYALISTS усиливают снижение коррупции (base < 0): base - influence×0.01
    // - NOBILITY усиливают рост коррупции (base > 0): base + influence×0.01
    let modifier = 0;
    if (base < 0 && party === 'LOYALISTS') {
        modifier = -(influence * 0.01);
    } else if (base > 0 && party === 'NOBILITY') {
        modifier = influence * 0.01;
    }

    const effect = base + modifier;
    return {
        effect: Math.round(effect * 100) / 100,
        base: base,
        modifier: Math.round(modifier * 100) / 100,
        loyalty: loyalty,
        influence: influence,
        party: party,
        name: house.name || 'Неизвестный дом'
    };
}

/**
 * Суммирует эффект всех вассалов фракции.
 * @returns {Object} { total, details }
 */
function getTotalVassalsCorruptionImpact() {
    const result = { total: 0, details: [] };
    if (typeof factionCouncils === 'undefined') return result;
    const council = factionCouncils[window.currentFaction];
    if (!council || !council.houses) return result;

    for (let house of council.houses) {
        const impact = getVassalCorruptionImpact(house);
        result.details.push(impact);
        result.total += impact.effect;
    }
    result.total = Math.round(result.total * 100) / 100;
    return result;
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
	// === ВЛИЯНИЕ ВАССАЛОВ ===
	const vassalImpact = (typeof getTotalVassalsCorruptionImpact === 'function')
		? getTotalVassalsCorruptionImpact().total
		: 0;
	corr.currentPercent += vassalImpact;
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
	// ⚠️ DEPRECATED: убрано из processCorruptionTurn.
    // Лояльность теперь не падает от коррупции автоматически.
    // Оставлено для возможного ручного использования.
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
    if (typeof saveAgentProgress === 'function') saveAgentProgress();
    else if (typeof saveAllData === 'function') saveAllData();
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
    const current = corr.currentPercent;

    // === РАСЧЁТ ИСТОЧНИКОВ РОСТА ===
    const weeklyIncome = (typeof getWeeklyIncome === 'function') ? getWeeklyIncome() : 0;
    const incomeBonus = Math.floor(weeklyIncome / 20000) * 1.5;
    
    let totalUnits = 0;
    if (typeof armies !== 'undefined') {
        for (let a of armies) {
            if (a.factionId === window.currentFaction) totalUnits += a.units.length;
        }
    }
    const armyPenalty = Math.floor(totalUnits / 10);
    
    let totalBuildings = 0;
    const provinces = (typeof getCurrentFactionProvinces === 'function') ? getCurrentFactionProvinces() : [];
    for (let pid of provinces) {
        const prov = provincesData[pid];
        if (prov && prov.settlements) {
            for (let s of prov.settlements) {
                if (!s.captured) totalBuildings += s.buildings.length;
            }
        }
    }
    const buildingPenalty = Math.floor(totalBuildings / 3) * 0.5;

    // === ИСТОЧНИКИ СНИЖЕНИЯ ===
    let courtCount = 0, hasTemple = false;
    for (let pid of provinces) {
        const prov = provincesData[pid];
        if (prov && prov.settlements) {
            for (let s of prov.settlements) {
                if (!s.captured) {
                    for (let b of s.buildings) {
                        if (b.completed) {
                            if (b.special === "court") courtCount++;
                            if (b.special === "templeVarsiteya") hasTemple = true;
                        }
                    }
                }
            }
        }
    }
    
    const courtReduction = courtCount * 2;
    const templeReduction = hasTemple ? 5 : 0;
    const agentReduction = agent ? agent.skill : 0;
    const totalReduction = courtReduction + templeReduction + agentReduction;

    // === ПРОГНОЗ ===
    const turnsLeft = 4 - (corr.turnsSinceLastGrowth || 0);
    const willBaseGrowth = (turnsLeft === 1) ? 2 : 0;
    const expectedGrowth = willBaseGrowth + incomeBonus + armyPenalty + buildingPenalty;
    const expectedNet = expectedGrowth - totalReduction;
    const nextValue = Math.max(1, Math.min(50, current + expectedNet));

    const avgGrowthPerTurn = 0.5 + incomeBonus + armyPenalty + buildingPenalty - totalReduction;
    const forecast4 = Math.max(1, Math.min(50, current + avgGrowthPerTurn * 4));

    // === УРОВЕНЬ ===
    let levelName, levelColor, levelIcon;
    if (current < 10)      { levelName = 'Низкая';      levelColor = '#8bc34a'; levelIcon = '🌿'; }
    else if (current < 20) { levelName = 'Умеренная';   levelColor = '#ffd966'; levelIcon = '⚠️'; }
    else if (current < 35) { levelName = 'Высокая';     levelColor = '#ff9800'; levelIcon = '🔥'; }
    else                   { levelName = 'Критическая'; levelColor = '#ff4444'; levelIcon = '💀'; }

    // === ГАЛОЧКИ ===
    const showGrowth    = localStorage.getItem('corruptionShowGrowth')    !== 'false';
    const showReduction = localStorage.getItem('corruptionShowReduction') !== 'false';
    const showForecast  = localStorage.getItem('corruptionShowForecast')  !== 'false';

    // ============================================================
    // ЛЕВАЯ КОЛОНКА: АГЕНТ
    // ============================================================
    let agentColumn = '';
    if (agent) {
        const skillPercent = Math.min(100, (agent.skill / 30) * 100);
        agentColumn = `
            <div style="text-align:center;">
                <div style="font-size:0.75rem; color:#8a7a5a; letter-spacing:0.15em; text-transform:uppercase; margin-bottom:10px;">
                    🕵️ Агент-контролёр
                </div>
                
                <div style="position:relative; display:inline-block; margin-bottom:15px;" 
                     data-tip="Портрет вашего агента-контролёра. Навык агента напрямую снижает уровень коррупции каждый ход.">
                    <img src="${agent.portrait || 'icons/default_portrait.png'}" 
                         style="width:200px;height:200px;object-fit:cover;border-radius:12px;border:3px solid #b87c4f;box-shadow:0 8px 24px rgba(0,0,0,0.6), 0 0 30px ${levelColor}30;" 
                         onerror="this.style.display='none'">
                    <div style="position:absolute; bottom:-8px; left:50%; transform:translateX(-50%); background:rgba(18,14,12,0.95); border:2px solid #b87c4f; border-radius:12px; padding:2px 12px; font-size:0.75rem; color:#8bc34a; font-weight:bold; white-space:nowrap;">
                        🎯 ${agent.skill.toFixed(1)} / 30
                    </div>
                </div>
                
                <div style="margin-bottom:15px;">
                    <div style="font-weight:bold; color:#f0e3c8; font-size:1.2rem;" data-tip="Имя агента.">${escapeHtml(agent.name)}</div>
                    <div style="font-size:0.85rem; color:#cfc294; margin-top:3px;" data-tip="Раса и пол агента.">
                        🧬 ${escapeHtml(agent.race)} • ${agent.gender === 'female' ? '♀' : '♂'}
                    </div>
                </div>
                
                <div style="background:rgba(0,0,0,0.35); border-radius:10px; padding:12px; margin-bottom:15px; text-align:left;"
                     data-tip="Чем выше навык агента, тем сильнее он снижает коррупцию. Финансирование повышает навык.">
                    <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:6px;">
                        <span style="color:#cfc294;">Прогресс навыка</span>
                        <span style="color:#8bc34a; font-weight:bold;">${skillPercent.toFixed(0)}%</span>
                    </div>
                    <div style="background:#4a3a2a; border-radius:6px; height:10px; overflow:hidden;">
                        <div style="width:${skillPercent}%; height:100%; background:linear-gradient(to right, #8bc34a, #b8943a); border-radius:6px; transition:width 0.4s ease;"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#8a7a5a; margin-top:8px;">
                        <span>💰 Финансирование: ${agent.fundedTimes}/5</span>
                        <span style="color:#8bc34a;">−${agent.skill.toFixed(1)}% коррупции</span>
                    </div>
                </div>
                
                <div style="display:flex; flex-direction:column; gap:6px;">
                    <button id="fundAgentBtn" ${agent.fundedTimes >= 5 ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''} 
                            data-tip="Профинансировать агента за 5000 эрсов. Снижает коррупцию на 1% и повышает навык. Доступно 5 раз за ход."
                            style="background:#3a6b3a; padding:9px; font-size:0.8rem; width:100%;">
                        💰 Финансировать
                    </button>
                    <div style="display:flex; gap:6px;">
                        <button id="exportAgentBtn" data-tip="Экспортировать данные агента в JSON-файл." style="flex:1; padding:7px; font-size:0.7rem;">📤 Экспорт</button>
                        <button id="importAgentBtn" data-tip="Импортировать агента из JSON-файла." style="flex:1; padding:7px; font-size:0.7rem;">📥 Импорт</button>
                    </div>
                    <div style="display:flex; gap:6px;">
                        <button id="fireAgentBtn" data-tip="Уволить агента. Навык снижения коррупции исчезнет." style="flex:1; background:#5e3a22; padding:7px; font-size:0.7rem;">❌ Уволить</button>
                        <button id="killAgentBtn" class="danger-btn" data-tip="Убить агента. Безвозвратно." style="flex:1; padding:7px; font-size:0.7rem;">🗡️ Убить</button>
                    </div>
                    <input type="file" id="importAgentFile" accept=".json" style="display:none;">
                </div>
            </div>
        `;
    } else {
        agentColumn = `
            <div style="text-align:center;">
                <div style="font-size:0.75rem; color:#8a7a5a; letter-spacing:0.15em; text-transform:uppercase; margin-bottom:15px;">
                    🕵️ Агент-контролёр
                </div>
                <div style="width:200px; height:200px; margin:0 auto 15px; border-radius:12px; border:2px dashed rgba(160,120,80,0.3); display:flex; align-items:center; justify-content:center; font-size:4rem; color:#4a3a2a; background:rgba(0,0,0,0.2);">
                    🕳️
                </div>
                <div style="color:#8a7a5a; font-size:0.85rem; margin-bottom:20px; line-height:1.6;">
                    Агент не нанят.<br>Коррупция растёт без контроля.
                </div>
                <button id="hireAgentBtn" 
                        data-tip="Нанять агента-контролёра за 3000 эрсов. Агент будет снижать коррупцию каждый ход."
                        style="background:#3a6b3a; padding:12px 20px; width:100%; font-size:0.9rem;">
                    ➕ Нанять агента
                </button>
                <div style="font-size:0.75rem; color:#8a7a5a; margin-top:8px;">Стоимость: 3000 эрсов</div>
            </div>
        `;
    }

    // ============================================================
    // ПРАВАЯ КОЛОНКА: ДАННЫЕ
    // ============================================================
    let dataColumn = `
        <div style="margin-bottom:18px;">
            <div style="font-size:0.75rem; color:#8a7a5a; letter-spacing:0.15em; text-transform:uppercase; margin-bottom:12px;">
                📊 Уровень коррупции
            </div>
            
            <!-- ЦВЕТНАЯ ШКАЛА -->
            <div style="margin-bottom:18px;" data-tip="Шкала от 1% до 50%. Чем выше — тем хуже: потери налогов, штраф к лояльности вассалов, удорожание строительства.">
                <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px;">
                    <span style="font-size:2.2rem; font-weight:bold; color:${levelColor}; text-shadow:0 0 15px ${levelColor}40; line-height:1;">
                        ${current.toFixed(1)}%
                    </span>
                    <span style="font-size:1rem; color:${levelColor}; font-weight:bold;">
                        ${levelIcon} ${levelName}
                    </span>
                </div>
                <div style="position:relative; height:18px; background:linear-gradient(to right, #8bc34a 0%, #8bc34a 18%, #ffd966 18%, #ffd966 38%, #ff9800 38%, #ff9800 68%, #ff4444 68%, #ff4444 100%); border-radius:9px; overflow:hidden; border:1px solid #b87c4f; box-shadow:inset 0 0 10px rgba(0,0,0,0.5);">
                    <div style="position:absolute; top:0; bottom:0; left:0; width:${(current/50)*100}%; background:rgba(0,0,0,0.78); transition:width 0.5s ease;"></div>
                    <div style="position:absolute; top:-2px; bottom:-2px; left:${(current/50)*100}%; width:3px; background:#fff; box-shadow:0 0 10px #fff, 0 0 20px ${levelColor}; transition:left 0.5s ease;"></div>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.65rem; color:#8a7a5a; margin-top:5px;">
                    <span style="color:#8bc34a;">1%</span>
                    <span style="color:#8bc34a;">10%</span>
                    <span style="color:#ffd966;">20%</span>
                    <span style="color:#ff9800;">35%</span>
                    <span style="color:#ff4444;">50%</span>
                </div>
            </div>

            <!-- ГАЛОЧКИ УПРАВЛЕНИЯ -->
            <div style="display:flex; flex-wrap:wrap; gap:10px; padding:10px; background:rgba(0,0,0,0.3); border-radius:8px; border:1px solid rgba(160,120,80,0.25);"
                 data-tip="Включайте/выключайте блоки, чтобы видеть только нужную информацию.">
                <label style="display:flex; align-items:center; gap:5px; cursor:pointer; color:#d4c9b8; font-size:0.8rem; user-select:none;" data-tip="Показать/скрыть блок с факторами, повышающими коррупцию.">
                    <input type="checkbox" id="corrShowGrowth" ${showGrowth ? 'checked' : ''} style="width:14px; height:14px; cursor:pointer; accent-color:#b8943a;">
                    📈 Рост
                </label>
                <label style="display:flex; align-items:center; gap:5px; cursor:pointer; color:#d4c9b8; font-size:0.8rem; user-select:none;" data-tip="Показать/скрыть блок с факторами, снижающими коррупцию.">
                    <input type="checkbox" id="corrShowReduction" ${showReduction ? 'checked' : ''} style="width:14px; height:14px; cursor:pointer; accent-color:#b8943a;">
                    📉 Снижение
                </label>
                <label style="display:flex; align-items:center; gap:5px; cursor:pointer; color:#d4c9b8; font-size:0.8rem; user-select:none;" data-tip="Показать/скрыть прогноз коррупции на следующий ход и через 4 хода.">
                    <input type="checkbox" id="corrShowForecast" ${showForecast ? 'checked' : ''} style="width:14px; height:14px; cursor:pointer; accent-color:#b8943a;">
                    🔮 Прогноз
                </label>
            </div>
        </div>
    `;

    // === БЛОК РОСТА ===
    // === БЛОК РОСТА ===
    if (showGrowth) {
        const vassalsImpact = (typeof getTotalVassalsCorruptionImpact === 'function')
            ? getTotalVassalsCorruptionImpact()
            : { total: 0, details: [] };
        const vassalPositive = vassalsImpact.total > 0;
        const vassalRow = (vassalPositive && vassalsImpact.details.length > 0) ? `
            <div style="grid-column:1 / -1; margin-top:8px; padding-top:8px; border-top:1px dashed rgba(160,120,80,0.2);">
                <div style="display:grid; grid-template-columns:1fr auto; gap:4px 12px; font-size:0.82rem;"
                     data-tip="Влияние вассалов: чем ниже лояльность и выше влияние — тем больше они способствуют коррупции.">
                    <span style="color:#d4c9b8;">🏛️ Вассалы (${vassalsImpact.details.length} домов)</span>
                    <span style="color:#ff6b6b; text-align:right; font-weight:bold;">+${vassalsImpact.total.toFixed(2)}%</span>
                </div>
                <details style="margin-top:6px; font-size:0.75rem; color:#8a7a5a;">
                    <summary style="cursor:pointer; padding:3px 0;">▸ Показать детали</summary>
                    <div style="display:grid; grid-template-columns:1fr auto; gap:3px 12px; margin-top:6px; padding-left:10px;">
                        ${vassalsImpact.details.map(d => `
                            <span style="color:#d4c9b8;">
                                ▸ ${escapeHtml(d.name)} 
                                <span style="color:#8a7a5a; font-size:0.7rem;">(лояль. ${d.loyalty}%, ${d.party === 'LOYALISTS' ? 'лоялисты' : d.party === 'NOBILITY' ? 'дворяне' : 'нейтр.'}, вл. ${d.influence})</span>
                            </span>
                            <span style="color:${d.effect > 0 ? '#ff6b6b' : (d.effect < 0 ? '#8bc34a' : '#8a7a5a')}; text-align:right; font-weight:bold;">
                                ${d.effect > 0 ? '+' : ''}${d.effect.toFixed(2)}%
                            </span>
                        `).join('')}
                    </div>
                </details>
            </div>
        ` : '';
        
        dataColumn += `
            <div style="background:rgba(60,30,20,0.35); border-left:3px solid #ff6b6b; padding:12px 16px; border-radius:8px; margin-bottom:12px;"
                 data-tip="Эти факторы увеличивают коррупцию каждый ход. Источники роста видны детально.">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <h4 style="color:#ff6b6b; margin:0; font-size:0.95rem;">📈 Рост коррупции</h4>
                    <span style="color:#ff6b6b; font-weight:bold; font-size:0.95rem;">+${(expectedGrowth + Math.max(0, vassalsImpact.total)).toFixed(1)}%</span>
                </div>
                <div style="display:grid; grid-template-columns:1fr auto; gap:6px 12px; font-size:0.82rem;">
                    <span style="color:#d4c9b8;">⏳ Базовый (раз в 4 хода)</span>
                    <span style="color:#ff6b6b; text-align:right;">+2% <span style="color:#8a7a5a; font-size:0.7rem;">(через ${turnsLeft} х.)</span></span>
                    
                    <span style="color:#d4c9b8;">💰 Доход (${weeklyIncome.toLocaleString()} эрс)</span>
                    <span style="color:#ff6b6b; text-align:right;">+${incomeBonus.toFixed(1)}%</span>
                    
                    <span style="color:#d4c9b8;">⚔️ Отрядов (${totalUnits})</span>
                    <span style="color:#ff6b6b; text-align:right;">+${armyPenalty}%</span>
                    
                    <span style="color:#d4c9b8;">🏛️ Построек (${totalBuildings})</span>
                    <span style="color:#ff6b6b; text-align:right;">+${buildingPenalty}%</span>
                </div>
                ${vassalRow}
            </div>
        `;
    }

    // === БЛОК СНИЖЕНИЯ ===
    if (showReduction) {
        const vassalsImpact = (typeof getTotalVassalsCorruptionImpact === 'function')
            ? getTotalVassalsCorruptionImpact()
            : { total: 0, details: [] };
        const vassalNegative = vassalsImpact.total < 0;
        const vassalRow = (vassalNegative && vassalsImpact.details.length > 0) ? `
            <div style="grid-column:1 / -1; margin-top:8px; padding-top:8px; border-top:1px dashed rgba(160,120,80,0.2);">
                <div style="display:grid; grid-template-columns:1fr auto; gap:4px 12px; font-size:0.82rem;"
                     data-tip="Влияние вассалов: лояльные и влиятельные дома помогают бороться с коррупцией.">
                    <span style="color:#d4c9b8;">🏛️ Вассалы (${vassalsImpact.details.length} домов)</span>
                    <span style="color:#8bc34a; text-align:right; font-weight:bold;">${vassalsImpact.total.toFixed(2)}%</span>
                </div>
                <details style="margin-top:6px; font-size:0.75rem; color:#8a7a5a;">
                    <summary style="cursor:pointer; padding:3px 0;">▸ Показать детали</summary>
                    <div style="display:grid; grid-template-columns:1fr auto; gap:3px 12px; margin-top:6px; padding-left:10px;">
                        ${vassalsImpact.details.map(d => `
                            <span style="color:#d4c9b8;">
                                ▸ ${escapeHtml(d.name)} 
                                <span style="color:#8a7a5a; font-size:0.7rem;">(лояль. ${d.loyalty}%, ${d.party === 'LOYALISTS' ? 'лоялисты' : d.party === 'NOBILITY' ? 'дворяне' : 'нейтр.'}, вл. ${d.influence})</span>
                            </span>
                            <span style="color:${d.effect > 0 ? '#ff6b6b' : (d.effect < 0 ? '#8bc34a' : '#8a7a5a')}; text-align:right; font-weight:bold;">
                                ${d.effect > 0 ? '+' : ''}${d.effect.toFixed(2)}%
                            </span>
                        `).join('')}
                    </div>
                </details>
            </div>
        ` : '';
        
        dataColumn += `
            <div style="background:rgba(20,40,20,0.35); border-left:3px solid #8bc34a; padding:12px 16px; border-radius:8px; margin-bottom:12px;"
                 data-tip="Эти факторы снижают коррупцию каждый ход. Стройте суды, храмы, нанимайте агента и поддерживайте лояльность вассалов.">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <h4 style="color:#8bc34a; margin:0; font-size:0.95rem;">📉 Снижение коррупции</h4>
                    <span style="color:#8bc34a; font-weight:bold; font-size:0.95rem;">−${(totalReduction + Math.abs(Math.min(0, vassalsImpact.total))).toFixed(1)}%</span>
                </div>
                <div style="display:grid; grid-template-columns:1fr auto; gap:6px 12px; font-size:0.82rem;">
                    <span style="color:#d4c9b8;">⚖️ Суды (${courtCount} шт.)</span>
                    <span style="color:#8bc34a; text-align:right;">−${courtReduction}%</span>
                    
                    <span style="color:#d4c9b8;">⛪ Храм Варситэи</span>
                    <span style="color:#8bc34a; text-align:right;">−${templeReduction}% ${hasTemple ? '✅' : '<span style="color:#ff6b6b;">❌</span>'}</span>
                    
                    <span style="color:#d4c9b8;">🕵️ Агент</span>
                    <span style="color:#8bc34a; text-align:right;">−${agentReduction.toFixed(1)}% ${agent ? '✅' : '<span style="color:#ff6b6b;">❌</span>'}</span>
                </div>
                ${vassalRow}
            </div>
        `;
    }

    // === БЛОК ПРОГНОЗА ===
    if (showForecast) {
        const arrow = expectedNet > 0 ? '↑' : (expectedNet < 0 ? '↓' : '→');
        const arrowColor = expectedNet > 0 ? '#ff6b6b' : (expectedNet < 0 ? '#8bc34a' : '#8a7a5a');
        const forecastColor = forecast4 > current ? '#ff6b6b' : '#8bc34a';
        dataColumn += `
            <div style="background:rgba(30,30,60,0.35); border-left:3px solid #88aaff; padding:12px 16px; border-radius:8px; margin-bottom:12px;"
                 data-tip="Прогноз изменения коррупции на основе текущих факторов. Позволяет планировать на несколько ходов вперёд.">
                <h4 style="color:#88aaff; margin:0 0 10px 0; font-size:0.95rem;">🔮 Прогноз</h4>
                <div style="display:grid; grid-template-columns:1fr auto; gap:8px 12px; font-size:0.85rem;">
                    <span style="color:#d4c9b8;">Следующий ход</span>
                    <span style="text-align:right; font-weight:bold; color:${arrowColor};">${current.toFixed(1)}% → ${nextValue.toFixed(1)}% ${arrow}</span>
                    
                    <span style="color:#d4c9b8;">Через 4 хода</span>
                    <span style="text-align:right; font-weight:bold; color:${forecastColor};">~${forecast4.toFixed(1)}%</span>
                    
                    <span style="color:#d4c9b8; font-size:0.78rem; grid-column:1 / -1; text-align:center; margin-top:6px; padding-top:8px; border-top:1px solid rgba(160,120,80,0.2);">
                        Средний рост: <span style="color:${avgGrowthPerTurn >= 0 ? '#ff6b6b' : '#8bc34a'}; font-weight:bold;">${avgGrowthPerTurn >= 0 ? '+' : ''}${avgGrowthPerTurn.toFixed(2)}%</span> за ход
                    </span>
                </div>
            </div>
        `;
    }

    // === ОТЛАДКА ===
    dataColumn += `
        <div style="margin-top:15px; padding-top:10px; border-top:1px solid rgba(160,120,80,0.2); display:flex; align-items:center; gap:8px; flex-wrap:wrap; justify-content:flex-end;">
            <span style="color:#8a7a5a; font-size:0.75rem;" data-tip="Ручное управление для отладки — устанавливает уровень коррупции принудительно.">⚙️ Отладка:</span>
            <input type="number" id="manualCorruptionInput" value="${current.toFixed(1)}" step="0.1" min="1" max="50" style="width:60px; padding:3px 6px; font-size:0.75rem;">
            <span style="color:#8a7a5a; font-size:0.75rem;">%</span>
            <button id="setCorruptionBtn" style="padding:3px 10px; font-size:0.7rem;">✔</button>
        </div>
    `;

    // === ФИНАЛЬНАЯ СБОРКА — ОДНА КАРТОЧКА ===
    container.innerHTML = `
        <div class="stat-card" style="background: rgba(18,14,12,0.9); padding:20px;" data-tip="Здесь вы управляете коррупцией: слева — агент, справа — аналитика. Коррупция растёт от налогов, армии и построек. Снижается судами, храмом и агентом.">
            <h3 style="color:#ffd966; margin:0 0 18px 0; font-size:1.15rem; text-align:center; border-bottom:1px solid rgba(160,120,80,0.3); padding-bottom:12px;">
                🕸️ Управление коррупцией
            </h3>
            <div class="corruption-layout">
                <div class="corruption-left">${agentColumn}</div>
                <div class="corruption-right">${dataColumn}</div>
            </div>
        </div>
    `;

    // === ОБРАБОТЧИКИ ГАЛОЧЕК ===
    const growthChk = document.getElementById('corrShowGrowth');
    const reductionChk = document.getElementById('corrShowReduction');
    const forecastChk = document.getElementById('corrShowForecast');
    if (growthChk) growthChk.addEventListener('change', (e) => {
        localStorage.setItem('corruptionShowGrowth', e.target.checked ? 'true' : 'false');
        renderCorruptionUI();
    });
    if (reductionChk) reductionChk.addEventListener('change', (e) => {
        localStorage.setItem('corruptionShowReduction', e.target.checked ? 'true' : 'false');
        renderCorruptionUI();
    });
    if (forecastChk) forecastChk.addEventListener('change', (e) => {
        localStorage.setItem('corruptionShowForecast', e.target.checked ? 'true' : 'false');
        renderCorruptionUI();
    });

    // === ОБРАБОТЧИКИ КНОПОК ===
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
/**
 * Явная фиксация прогресса агента — сохраняет состояние в localStorage.
 * Возвращает true, если сохранение прошло успешно.
 */
function saveAgentProgress() {
    if (typeof saveAllData === 'function') {
        saveAllData();
        console.log('💾 Прогресс агента зафиксирован');
        return true;
    }
    console.warn('⚠️ saveAllData не найдена — прогресс агента не сохранён');
    return false;
}
window.saveAgentProgress = saveAgentProgress;

function processCorruptionTurn() {
    calculateCorruption();

    if (peopleState.corruption && peopleState.corruption.agent) {
        // Повышение навыка агента за ход
        const oldSkill = peopleState.corruption.agent.skill || 1;
        peopleState.corruption.agent.skill = Math.min(30, oldSkill + 5);
        // Сброс счётчика финансирования — новый ход, можно снова финансировать
        peopleState.corruption.agent.fundedTimes = 0;

        console.log(`🕵️ Агент: навык ${oldSkill} → ${peopleState.corruption.agent.skill}, финансирование сброшено`);
    }

    // ФИКСАЦИЯ: сохраняем все изменения коррупции и агента немедленно
    saveAgentProgress();

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
// === СТИЛИ ДЛЯ LAYOUT КОРРУПЦИИ ===
(function() {
    const style = document.createElement('style');
    style.textContent = `
        .corruption-layout {
            display: grid;
            grid-template-columns: 260px 1fr;
            gap: 25px;
            align-items: start;
        }
        .corruption-left {
            border-right: 1px solid rgba(160, 120, 80, 0.25);
            padding-right: 25px;
        }
        .corruption-right {
            min-width: 0;
        }
        
        /* Мобильные — одна колонка, агент сверху */
        @media (max-width: 900px) {
            .corruption-layout {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            .corruption-left {
                border-right: none;
                border-bottom: 1px solid rgba(160, 120, 80, 0.25);
                padding-right: 0;
                padding-bottom: 20px;
                text-align: center;
            }
        }
    `;
    document.head.appendChild(style);
})();
// Экспортируем, чтобы можно было использовать из других модулей
window.getVassalCorruptionImpact = getVassalCorruptionImpact;
window.getTotalVassalsCorruptionImpact = getTotalVassalsCorruptionImpact;
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