// ============================================================================
// МОДУЛЬ 07: army_ui.js
// ВЕРСИЯ 8.0 — ИНТЕРФЕЙС АРМИЙ (РЕНДЕР, ОБРАБОТЧИКИ)
// Вызывает функции из 07_army_core.js и 08_population.js, обновляет DOM.
// ============================================================================

let vassalArmiesCollapsed = true;

function toggleVassalArmiesSection() {
    vassalArmiesCollapsed = !vassalArmiesCollapsed;
    const section = document.getElementById('vassalArmiesSection');
    const toggleBtn = document.getElementById('toggleVassalArmiesBtn');
    if (section) section.style.display = vassalArmiesCollapsed ? 'none' : 'block';
    if (toggleBtn) toggleBtn.innerHTML = vassalArmiesCollapsed ? '▶ ПОКАЗАТЬ ЛИЧНЫЕ АРМИИ ВАССАЛОВ' : '▼ СКРЫТЬ ЛИЧНЫЕ АРМИИ ВАССАЛОВ';
}

function updateTreasuryDisplay() {
    let currentTreasury = 0;
    if (typeof GameState !== 'undefined') currentTreasury = GameState.getTreasury();
    else if (typeof armyTreasury !== 'undefined') currentTreasury = armyTreasury;
    const totalUpkeep = (typeof calculateTotalUpkeep === 'function') ? calculateTotalUpkeep() : 0;
    const treasuryElements = ['armyTreasury', 'globalTreasury', 'councilTreasury'];
    for (let id of treasuryElements) {
        const el = document.getElementById(id);
        if (el) el.innerText = Math.floor(currentTreasury);
    }
    const upkeepElement = document.getElementById('globalUpkeep');
    if (upkeepElement) upkeepElement.innerText = totalUpkeep.toLocaleString();
}

function updateUnitRecruitAvailability() {
    const unitCards = document.querySelectorAll('.unit-card');
    unitCards.forEach(card => {
        const unitKey = card.getAttribute('data-unit-key');
        if (!unitKey) return;
        const unit = (typeof unitDatabase !== 'undefined' && unitDatabase[unitKey]) 
            ? unitDatabase[unitKey] 
            : (typeof MERCENARY_UNITS !== 'undefined' && MERCENARY_UNITS[unitKey] ? MERCENARY_UNITS[unitKey] : null);
        if (!unit) return;
        const countSelect = card.querySelector('.unit-count-select');
        const count = countSelect ? parseInt(countSelect.value) || 1 : 1;
        const check = (typeof canRecruitUnit === 'function') ? canRecruitUnit(unit, count) : { canRecruit: true, reason: null };
        const hireBtn = card.querySelector('.hire-unit-btn');
        if (hireBtn) {
            if (check.canRecruit) {
                hireBtn.disabled = false;
                hireBtn.style.opacity = '1';
                card.style.borderColor = '#b87c4f';
                hireBtn.title = '';
            } else {
                hireBtn.disabled = true;
                hireBtn.style.opacity = '0.5';
                card.style.borderColor = '#ff6b6b';
                hireBtn.title = check.reason || 'Недостаточно ресурсов';
            }
        }
    });
}

function renderArmy() {
    const container = document.getElementById('armiesContainer');
    if (!container) return;
    
    const rhetoricInfo = document.getElementById('currentRhetoricInfo');
    if (rhetoricInfo) {
        const factionName = (typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[currentFaction]) ? FACTION_NAMES[currentFaction] : currentFaction;
        const rhetoric = (typeof getCurrentRhetoricByFaction === 'function') ? getCurrentRhetoricByFaction() : 'neutral';
        const rhetoricName = (typeof RHETORIC_NAMES !== 'undefined' && RHETORIC_NAMES[rhetoric]) ? RHETORIC_NAMES[rhetoric] : rhetoric;
        const pool = (typeof RHETORIC_UNIT_POOLS !== 'undefined') ? RHETORIC_UNIT_POOLS[rhetoric] : null;
        rhetoricInfo.innerHTML = `<span style="color:${pool?.color || '#cfc294'}">🎌 Фракция: ${factionName} (${rhetoricName})</span>`;
    }
    
    if (typeof refreshRecruitmentLimits === 'function') refreshRecruitmentLimits();
    updateTreasuryDisplay();
    
    const filteredArmies = armies.filter(a => a.factionId === currentFaction);
    if (filteredArmies.length === 0) {
        container.innerHTML = '<div class="empty-message">Нет армий. Создайте новую.</div>';
    } else {
        container.innerHTML = '';
        for (let army of filteredArmies) {
            const stats = (typeof calcArmyStats === 'function') ? calcArmyStats(army.units) : { totalStrength:0, totalDefense:0, totalMorale:0, totalUpkeep:0, totalCount:0 };
            const armyDiv = document.createElement('div');
            armyDiv.className = 'army-container';
            armyDiv.dataset.armyId = army.id;
            armyDiv.innerHTML = `
                <div class="army-header">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <div class="general-icon">🎖️</div>
                        <div>
                            <input type="text" class="army-name-input" value="${escapeHtml(army.name)}" data-id="${army.id}" style="font-size:1rem; width:180px; background:#2c281c; border:1px solid #b87c4f; border-radius:20px; padding:4px 12px; color:#f0e6d0;">
                            <div style="font-size:0.7rem; color:#cfc294;">${(typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[army.factionId]) ? FACTION_NAMES[army.factionId] : army.factionId || 'Без фракции'}</div>
                            <div style="font-size:0.7rem; color:#cfc294; margin-top:2px;">
                                📍 Стоит гарнизоном в: ${(typeof getGarrisonName === 'function') ? getGarrisonName(army.garrison) : (army.garrison || 'не назначен')}
                                <button class="release-garrison-btn" data-army-id="${army.id}" style="background:#7a2a2a; padding:0px 6px; margin-left:8px; font-size:0.6rem;" title="Освободить гарнизон">✖️</button>
                            </div>
                        </div>
                    </div>
                    <div class="army-stats" style="display:flex; gap:15px; flex-wrap:wrap;">
                        <span>⚔️ ${stats.totalStrength.toLocaleString()}</span>
                        <span>🛡️ ${stats.totalDefense.toLocaleString()}</span>
                        <span>❤️ ${stats.totalMorale.toLocaleString()}</span>
                        <span>💰 ${stats.totalUpkeep.toLocaleString()}</span>
                        <span>👥 ${stats.totalCount.toLocaleString()}</span>
                    </div>
                    <button class="delete-army-btn" data-id="${army.id}" style="background:#7a2a2a;">🗑️</button>
                </div>
                <div class="units-strip" id="units-strip-${army.id}" style="display:flex; flex-wrap:wrap; gap:10px; padding:12px; border-top:1px dashed #b87c4f;"></div>
                <div class="queue-strip" id="queue-strip-${army.id}" style="display:flex; flex-wrap:wrap; gap:10px; padding:12px; border-top:1px dashed #b87c4f; background:rgba(0,0,0,0.2);">
                    <strong style="width:100%;">⏳ В очереди:</strong>
                </div>
                <div style="padding: 8px; text-align: center;">
                    <button class="select-army-btn" data-id="${army.id}" style="background:#3a5a2a;">🎯 Выбрать для найма</button>
                </div>
            `;
            
            const unitsStrip = armyDiv.querySelector(`#units-strip-${army.id}`);
            for (let unit of army.units) {
                const unitDiv = document.createElement('div');
                unitDiv.className = 'unit-icon';
                unitDiv.style.cssText = 'background:#2c281c; border:1px solid #b87c4f; border-radius:12px; width:100px; text-align:center; padding:8px; position:relative;';
                let iconPath = (typeof unitDatabase !== 'undefined' && unitDatabase[unit.unitKey]) ? unitDatabase[unit.unitKey].icon : unit.icon;
                if (iconPath && typeof getUnitIconPath === 'function') iconPath = getUnitIconPath(iconPath);
                const iconHtml = iconPath ? `<img src="${iconPath}" style="width:64px; height:auto; border-radius:6px;" onerror="this.style.display='none'">` : '<div style="font-size:40px;">⚔️</div>';
                unitDiv.innerHTML = `
                    ${iconHtml}
                    <div class="unit-count" style="font-weight:bold;">${unit.count.toLocaleString()}</div>
                    <div class="unit-name-short" style="font-size:0.7rem;">${escapeHtml(unit.name.length > 12 ? unit.name.slice(0,10)+'…' : unit.name)}</div>
                    <div style="font-size:0.6rem; color:#8a7a5a;">${escapeHtml(unit.race)}</div>
                    <button class="remove-unit-btn" data-army="${army.id}" data-unit="${unit.id}" style="position:absolute; top:4px; right:4px; background:#7a2a2a; border:none; border-radius:50%; width:18px; height:18px; font-size:12px; cursor:pointer;">✖</button>
                `;
                unitDiv.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    if (typeof showEncyclopedia === 'function') showEncyclopedia(unit.name);
                });
                unitsStrip.appendChild(unitDiv);
            }
            if (army.units.length === 0) unitsStrip.innerHTML = '<div style="color:#8a7a5a; padding:10px; text-align:center; width:100%;">Нет отрядов</div>';
            
            const queueStrip = armyDiv.querySelector(`#queue-strip-${army.id}`);
            let hasQueue = false;
            if (army.recruitmentQueue && army.recruitmentQueue.length > 0) {
                for (let q of army.recruitmentQueue) {
                    const base = (typeof unitDatabase !== 'undefined' && unitDatabase[q.unitKey]) ? unitDatabase[q.unitKey] : (typeof MERCENARY_UNITS !== 'undefined' && MERCENARY_UNITS[q.unitKey] ? MERCENARY_UNITS[q.unitKey] : null);
                    const qDiv = document.createElement('div');
                    qDiv.className = 'queue-icon';
                    qDiv.style.cssText = 'background:#2c281c; border:1px solid #b87c4f; border-radius:12px; width:100px; text-align:center; padding:8px; position:relative;';
                    const iconPath = base?.icon;
                    const iconHtml = iconPath ? `<img src="${iconPath}" style="width:64px; height:auto; border-radius:6px;" onerror="this.style.display='none'">` : '<div style="font-size:40px;">⏳</div>';
                    qDiv.innerHTML = `
                        ${iconHtml}
                        <div class="queue-timer" style="font-weight:bold; color:#ffd966;">⏱️ ${q.remainingTurns} ход(ов)</div>
                        <div class="unit-name-short" style="font-size:0.7rem;">${escapeHtml(q.unitTemplate.name.length > 12 ? q.unitTemplate.name.slice(0,10)+'…' : q.unitTemplate.name)}</div>
                        <button class="cancel-queue-btn" data-army="${army.id}" data-queue="${q.id}" style="position:absolute; top:4px; right:4px; background:#7a2a2a; border:none; border-radius:50%; width:18px; height:18px; font-size:12px; cursor:pointer;">✖</button>
                    `;
                    queueStrip.appendChild(qDiv);
                    hasQueue = true;
                }
            }
            if (!hasQueue) queueStrip.innerHTML = '<strong style="width:100%;">⏳ В очереди:</strong><div style="color:#8a7a5a; padding:5px;">нет</div>';
            container.appendChild(armyDiv);
        }
    }
    
    // Личные армии вассалов
    let toggleBtn = document.getElementById('toggleVassalArmiesBtn');
    if (!toggleBtn) {
        toggleBtn = document.createElement('button');
        toggleBtn.id = 'toggleVassalArmiesBtn';
        toggleBtn.style.cssText = 'margin: 20px auto 10px; display: block; width: 300px; background: #5e3a22; padding: 10px; font-size: 0.9rem;';
        toggleBtn.innerHTML = vassalArmiesCollapsed ? '▶ ПОКАЗАТЬ ЛИЧНЫЕ АРМИИ ВАССАЛОВ' : '▼ СКРЫТЬ ЛИЧНЫЕ АРМИИ ВАССАЛОВ';
        toggleBtn.onclick = toggleVassalArmiesSection;
        container.parentNode.insertBefore(toggleBtn, container.nextSibling);
    }
    let vassalSection = document.getElementById('vassalArmiesSection');
    if (!vassalSection) {
        vassalSection = document.createElement('div');
        vassalSection.id = 'vassalArmiesSection';
        vassalSection.style.cssText = 'margin-top: 10px;';
        toggleBtn.parentNode.insertBefore(vassalSection, toggleBtn.nextSibling);
    }
    vassalSection.innerHTML = '';
    vassalSection.style.display = vassalArmiesCollapsed ? 'none' : 'block';
    
    if (typeof factionCouncils !== 'undefined' && factionCouncils[currentFaction] && factionCouncils[currentFaction].houses) {
        const council = factionCouncils[currentFaction];
        let hasVassalArmies = false;
        for (let house of council.houses) {
            if (!house.personalArmy || house.personalArmy.length === 0) continue;
            hasVassalArmies = true;
            const armyUnits = house.personalArmy.map(unit => {
                const unitDef = (typeof unitDatabase !== 'undefined') ? unitDatabase[unit.unitKey] : null;
                if (!unitDef) return null;
                return {
                    count: unit.count * (unitDef.countPerUnit || 100),
                    strength: unitDef.strength || 0,
                    defense: unitDef.defense || 0,
                    morale: unitDef.morale || 0,
                    upkeep: unitDef.upkeep || 0
                };
            }).filter(u => u !== null);
            const stats = (typeof calcArmyStats === 'function') ? calcArmyStats(armyUnits) : { totalStrength:0, totalDefense:0, totalMorale:0, totalUpkeep:0, totalCount:0 };
            const loyaltyColor = house.loyaltyToRuler > 70 ? '#8bc34a' : (house.loyaltyToRuler > 40 ? '#ffd966' : '#ff6b6b');
            const armyDiv = document.createElement('div');
            armyDiv.className = 'army-container vassal-army';
            armyDiv.style.cssText = 'opacity: 0.85; border-left: 4px solid #b87c4f; margin-bottom: 15px;';
            armyDiv.innerHTML = `
                <div class="army-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div class="general-icon">🏯</div>
                        <div>
                            <div style="font-size:1.1rem; font-weight:bold;">${escapeHtml(house.name)} <span style="font-size:0.7rem; color:#cfc294;">(вассал)</span></div>
                            <div style="font-size:0.7rem; color:#cfc294;">${(typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[currentFaction]) ? FACTION_NAMES[currentFaction] : currentFaction}</div>
                        </div>
                    </div>
                    <div class="army-stats" style="display:flex; gap:15px; flex-wrap:wrap;">
                        <span>⚔️ ${stats.totalStrength.toLocaleString()}</span>
                        <span>🛡️ ${stats.totalDefense.toLocaleString()}</span>
                        <span>❤️ ${stats.totalMorale.toLocaleString()}</span>
                        <span>💰 ${stats.totalUpkeep.toLocaleString()}</span>
                        <span>👥 ${stats.totalCount.toLocaleString()}</span>
                    </div>
                    <div style="font-size:0.8rem;">
                        <span style="color:${loyaltyColor};">❤️ Лояльность: ${house.loyaltyToRuler}%</span>
                    </div>
                </div>
                <div class="units-strip" style="display:flex; flex-wrap:wrap; gap:10px; padding:12px; border-top:1px dashed #b87c4f;"></div>
            `;
            const unitsStrip = armyDiv.querySelector('.units-strip');
            const unitMap = new Map();
            for (let unit of house.personalArmy) {
                const unitDef = (typeof unitDatabase !== 'undefined') ? unitDatabase[unit.unitKey] : null;
                if (!unitDef) continue;
                const key = unit.unitKey;
                if (unitMap.has(key)) unitMap.get(key).count += unit.count;
                else unitMap.set(key, { unitKey: unit.unitKey, name: unitDef.name, icon: unitDef.icon, race: unitDef.race, count: unit.count, countPerUnit: unitDef.countPerUnit || 100 });
            }
            for (let unit of unitMap.values()) {
                const iconPath = (typeof getUnitIconPath === 'function') ? getUnitIconPath(unit.icon) : unit.icon;
                const totalPeople = unit.count * unit.countPerUnit;
                const unitDiv = document.createElement('div');
                unitDiv.className = 'unit-icon';
                unitDiv.style.cssText = 'background:#2c281c; border:1px solid #b87c4f; border-radius:12px; width:100px; text-align:center; padding:8px; position:relative;';
                unitDiv.innerHTML = `
                    <img src="${iconPath}" style="width:64px; height:auto; border-radius:6px;" onerror="this.style.display='none'">
                    <div class="unit-count" style="font-weight:bold;">${totalPeople.toLocaleString()}</div>
                    <div class="unit-name-short" style="font-size:0.7rem;">${escapeHtml(unit.name.length > 12 ? unit.name.slice(0,10)+'…' : unit.name)}</div>
                    <div style="font-size:0.6rem; color:#8a7a5a;">${escapeHtml(unit.race)}</div>
                `;
                unitsStrip.appendChild(unitDiv);
            }
            vassalSection.appendChild(armyDiv);
        }
        if (!hasVassalArmies) vassalSection.innerHTML = '<div style="text-align:center; color:#8a7a5a; padding:20px;">Нет личных армий у вассалов</div>';
    } else {
        vassalSection.innerHTML = '<div style="text-align:center; color:#8a7a5a; padding:20px;">Нет вассалов в текущей фракции</div>';
    }
    
    // Обработчики событий
    document.querySelectorAll('.army-name-input').forEach(inp => {
        inp.removeEventListener('change', window._renameHandler);
        window._renameHandler = (e) => {
            if (typeof renameArmy === 'function') renameArmy(inp.dataset.id, inp.value);
            if (typeof renderArmy === 'function') renderArmy();
        };
        inp.addEventListener('change', window._renameHandler);
    });
    document.querySelectorAll('.delete-army-btn').forEach(btn => {
        btn.removeEventListener('click', window._deleteArmyHandler);
        window._deleteArmyHandler = () => {
            if (typeof deleteArmy === 'function') deleteArmy(btn.dataset.id);
            if (typeof renderArmy === 'function') renderArmy();
        };
        btn.addEventListener('click', window._deleteArmyHandler);
    });
    document.querySelectorAll('.select-army-btn').forEach(btn => {
        btn.removeEventListener('click', window._selectArmyHandler);
        window._selectArmyHandler = () => {
            lastSelectedArmyId = btn.dataset.id;
            const armyName = filteredArmies.find(a => a.id === lastSelectedArmyId)?.name;
            addGlobalLog(`🎯 Теперь новые отряды будут добавляться в армию "${armyName}"`, 'army');
        };
        btn.addEventListener('click', window._selectArmyHandler);
    });
    document.querySelectorAll('.remove-unit-btn').forEach(btn => {
        btn.removeEventListener('click', window._removeUnitHandler);
        window._removeUnitHandler = (e) => {
            e.stopPropagation();
            if (typeof removeUnitFromArmy === 'function') removeUnitFromArmy(btn.dataset.army, btn.dataset.unit);
            if (typeof renderArmy === 'function') renderArmy();
        };
        btn.addEventListener('click', window._removeUnitHandler);
    });
    document.querySelectorAll('.cancel-queue-btn').forEach(btn => {
        btn.removeEventListener('click', window._cancelQueueHandler);
        window._cancelQueueHandler = (e) => {
            e.stopPropagation();
            if (typeof cancelRecruitment === 'function') cancelRecruitment(btn.dataset.army, btn.dataset.queue);
            if (typeof renderArmy === 'function') renderArmy();
        };
        btn.addEventListener('click', window._cancelQueueHandler);
    });
    document.querySelectorAll('.release-garrison-btn').forEach(btn => {
        btn.removeEventListener('click', window._releaseGarrisonHandler);
        window._releaseGarrisonHandler = (e) => {
            e.stopPropagation();
            const armyId = btn.dataset.armyId;
            const army = armies.find(a => a.id === armyId);
            if (army && army.factionId === currentFaction) {
                if (confirm(`Освободить гарнизон армии "${army.name}"?`)) {
                    army.garrison = null;
                    if (typeof saveArmyData === 'function') saveArmyData();
                    addGlobalLog(`⚠️ Гарнизон армии "${army.name}" освобождён.`, 'army');
                    if (typeof renderArmy === 'function') renderArmy();
                }
            }
        };
        btn.addEventListener('click', window._releaseGarrisonHandler);
    });
    
    if (!lastSelectedArmyId && filteredArmies.length) lastSelectedArmyId = filteredArmies[0].id;
}

function renderAvailableUnits() {
    const container = document.getElementById('unitsGrid');
    if (!container) return;
    container.innerHTML = '';
    const availableUnits = (typeof getUnitsForCurrentFaction === 'function') ? getUnitsForCurrentFaction() : [];
    let filtered = (typeof filterUnits === 'function') ? filterUnits(availableUnits) : availableUnits;
    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-message">Нет юнитов, соответствующих фильтрам</div>';
        return;
    }
    for (let unit of filtered) {
        const defaultCount = 1;
        const availabilityCheck = (typeof canRecruitUnit === 'function') ? canRecruitUnit(unit, defaultCount) : { canRecruit: true, reason: null };
        const card = document.createElement('div');
        card.className = 'unit-card';
        card.setAttribute('data-unit-key', unit.key);
        card.style.cssText = `background:#2c281c; border:2px solid ${availabilityCheck.canRecruit ? '#b87c4f' : '#ff6b6b'}; border-radius:24px; padding:12px; display:flex; gap:12px; align-items:center; transition:0.1s;`;
        let iconPath = unit.icon;
        if (iconPath && typeof getUnitIconPath === 'function') iconPath = getUnitIconPath(iconPath);
        const iconHtml = iconPath ? `<img src="${iconPath}" style="width:70px; height:auto; border-radius:8px; border:1px solid #b87c4f;" onerror="this.style.display='none'">` : '<div style="font-size:50px;">⚔️</div>';
        const costStr = unit.hireCost === 0 ? 'бесплатно' : `${unit.hireCost} монет`;
        const rangedStr = (unit.strengthRanged && unit.strengthRanged !== unit.strength) ? ` / 🏹${unit.strengthRanged}` : '';
        let availabilityHtml = '';
        if (!availabilityCheck.canRecruit && availabilityCheck.reason) availabilityHtml = `<div style="color:#ff6b6b; font-size:0.7rem; margin-top:5px;">⚠️ ${escapeHtml(availabilityCheck.reason)}</div>`;
        let maxCount = unit.maxCount || 10;
        maxCount = Math.min(maxCount, 5);
        card.innerHTML = `
            ${iconHtml}
            <div class="unit-card-content" style="flex:1;">
                <h3 style="margin:0 0 6px 0;">${escapeHtml(unit.name)}</h3>
                <div class="unit-stats" style="display:flex; gap:12px; font-size:0.8rem; margin:8px 0;">
                    <span>⚔️ ${unit.strength}${rangedStr}</span>
                    <span>🛡️ ${unit.defense}</span>
                    <span>❤️ ${unit.morale}</span>
                </div>
                <div>💰 Содержание: ${unit.upkeep}/чел</div>
                <div class="unit-cost">💰 Найм: ${costStr} за отряд (${unit.countPerUnit} чел)</div>
                <div>🔰 ${unit.troopType} | ⏱️ ${unit.hireTime} ход(ов) | 🧬 ${unit.race}</div>
                ${unit.maxCount ? `<div>📦 Макс. отрядов: ${unit.maxCount}</div>` : ''}
                ${unit.special ? `<div style="color:#ffd966; font-size:0.7rem;">✨ ${escapeHtml(unit.special)}</div>` : ''}
                ${availabilityHtml}
                <div style="display:flex; gap:10px; align-items:center; margin-top:8px;">
                    <select class="unit-count-select" style="width:80px; padding:4px;">
                        ${Array.from({length: Math.max(1, maxCount)}, (_, i) => `<option value="${i+1}">${i+1} отр.</option>`).join('')}
                    </select>
                    <button class="hire-unit-btn" data-unit-key="${unit.key}" ${!availabilityCheck.canRecruit ? 'disabled' : ''} style="background:#3a6b3a; ${!availabilityCheck.canRecruit ? 'opacity:0.5; cursor:not-allowed;' : ''}">➕ Нанять</button>
                </div>
            </div>
        `;
        const countSelect = card.querySelector('.unit-count-select');
        const hireBtn = card.querySelector('.hire-unit-btn');
        if (countSelect) {
            countSelect.addEventListener('change', () => {
                const newCount = parseInt(countSelect.value);
                const newCheck = (typeof canRecruitUnit === 'function') ? canRecruitUnit(unit, newCount) : { canRecruit: true, reason: null };
                if (newCheck.canRecruit) {
                    hireBtn.disabled = false;
                    hireBtn.style.opacity = '1';
                    card.style.borderColor = '#b87c4f';
                    hireBtn.title = '';
                } else {
                    hireBtn.disabled = true;
                    hireBtn.style.opacity = '0.5';
                    card.style.borderColor = '#ff6b6b';
                    hireBtn.title = newCheck.reason || 'Недостаточно ресурсов';
                }
            });
        }
        hireBtn.addEventListener('click', () => {
            const count = countSelect ? parseInt(countSelect.value) : 1;
            const finalCheck = (typeof canRecruitUnit === 'function') ? canRecruitUnit(unit, count) : { canRecruit: true, reason: null };
            if (!finalCheck.canRecruit) {
                addGlobalLog(`❌ ${finalCheck.reason}`, 'army');
                alert(finalCheck.reason);
                return;
            }
            let targetArmy = lastSelectedArmyId ? armies.find(a => a.id === lastSelectedArmyId && a.factionId === currentFaction) : armies.find(a => a.factionId === currentFaction);
            if (!targetArmy) {
                alert("Сначала создайте армию!");
                return;
            }
            if (typeof addUnitToArmy === 'function') addUnitToArmy(targetArmy.id, unit.key, count);
            if (typeof renderArmy === 'function') renderArmy();
            if (typeof renderAvailableUnits === 'function') renderAvailableUnits();
        });
        card.addEventListener('dblclick', () => {
            if (typeof showEncyclopedia === 'function') showEncyclopedia(unit.name);
        });
        container.appendChild(card);
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ UI ==========
function initArmyUI() {
    const newArmyBtn = document.getElementById('newArmyBtn');
    if (newArmyBtn) newArmyBtn.onclick = () => {
        const provinces = (typeof getCurrentFactionProvinces === 'function') ? getCurrentFactionProvinces() : [];
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
                <div><button id="confirmCreateArmyBtn">✅ Создать</button><button id="cancelCreateArmyBtn">❌ Отмена</button></div>
            </div>
        `;
        document.body.appendChild(modal);
        const provinceSelect = modal.querySelector('#newArmyProvinceSelect');
        const settlementSelect = modal.querySelector('#newArmySettlementSelect');
        const nameInput = modal.querySelector('#newArmyNameInput');
        function updateSettlements(provinceId) {
            settlementSelect.innerHTML = '';
            const settlements = (typeof SETTLEMENTS_DB !== 'undefined') 
                ? Object.values(SETTLEMENTS_DB).filter(s => s.province === provinceId && (s.type === 'city' || s.type === 'castle')).sort((a,b)=>a.name.localeCompare(b.name))
                : [];
            if (!settlements.length) { settlementSelect.innerHTML = '<option value="">-- нет доступных --</option>'; return; }
            for (let s of settlements) settlementSelect.innerHTML += `<option value="${s.id}">${s.name} (${s.type === 'city' ? 'Город' : 'Замок'})</option>`;
        }
        updateSettlements(provinceSelect.value);
        provinceSelect.addEventListener('change', () => updateSettlements(provinceSelect.value));
        modal.querySelector('#confirmCreateArmyBtn').onclick = () => {
            const selectedSettlement = settlementSelect.value;
            if (!selectedSettlement) { alert('Выберите поселение'); modal.remove(); return; }
            const armyName = nameInput.value.trim() || `Армия ${armies.filter(a => a.factionId === currentFaction).length + 1}`;
            const newArmy = {
                id: (typeof generateId === 'function') ? generateId() : Date.now() + '-' + Math.random(),
                name: armyName,
                units: [],
                recruitmentQueue: [],
                factionId: currentFaction,
                garrison: selectedSettlement,
                location: { type: "settlement", id: selectedSettlement, progress: 0, targetSettlementId: null }
            };
            armies.push(newArmy);
            if (typeof saveArmyData === 'function') saveArmyData();
            if (typeof renderArmy === 'function') renderArmy();
            if (typeof refreshRecruitmentLimits === 'function') refreshRecruitmentLimits();
            const settlementName = (typeof SETTLEMENTS_DB !== 'undefined' && SETTLEMENTS_DB[selectedSettlement]) ? SETTLEMENTS_DB[selectedSettlement].name : selectedSettlement;
            addGlobalLog(`➕ Создана новая армия "${armyName}" в поселении ${settlementName}.`, 'army');
            modal.remove();
        };
        modal.querySelector('#cancelCreateArmyBtn').onclick = () => modal.remove();
    };
    
    const clearAllArmiesBtn = document.getElementById('clearAllArmiesBtn');
    if (clearAllArmiesBtn) clearAllArmiesBtn.onclick = () => {
        if (typeof clearAllArmies === 'function') clearAllArmies();
        if (typeof renderArmy === 'function') renderArmy();
    };
    
    const resetArmyBtn = document.getElementById('resetArmyBtn');
    if (resetArmyBtn) resetArmyBtn.onclick = () => {
        if (typeof resetArmy === 'function') resetArmy();
        if (typeof renderArmy === 'function') renderArmy();
        if (typeof renderAvailableUnits === 'function') renderAvailableUnits();
    };
    
    const loadExampleBtn = document.getElementById('loadExampleBtn');
    if (loadExampleBtn) loadExampleBtn.onclick = () => {
        if (typeof loadExampleArmy === 'function') loadExampleArmy();
        if (typeof renderArmy === 'function') renderArmy();
        if (typeof renderAvailableUnits === 'function') renderAvailableUnits();
    };
    
    const exportArmiesBtn = document.getElementById('exportArmiesBtn');
    if (exportArmiesBtn) exportArmiesBtn.onclick = () => {
        if (typeof exportArmyData === 'function') exportArmyData();
    };
    
    const importArmiesBtn = document.getElementById('importArmiesBtn');
    const armyImportFile = document.getElementById('armyImportFile');
    if (importArmiesBtn) importArmiesBtn.onclick = () => armyImportFile?.click();
    if (armyImportFile) armyImportFile.onchange = (e) => {
        if (e.target.files.length && typeof importArmyData === 'function') {
            importArmyData(e.target.files[0]);
            setTimeout(() => {
                if (typeof renderArmy === 'function') renderArmy();
                if (typeof renderAvailableUnits === 'function') renderAvailableUnits();
            }, 100);
        }
        e.target.value = '';
    };
    
    // Фильтры
    const filterType = document.getElementById('filterType');
    const filterTime = document.getElementById('filterTime');
    const filterRace = document.getElementById('filterRace');
    const filterSpecial = document.getElementById('filterSpecial');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    if (filterType) filterType.addEventListener('change', () => {
        if (typeof updateFilters === 'function') updateFilters();
        if (typeof renderAvailableUnits === 'function') renderAvailableUnits();
    });
    if (filterTime) filterTime.addEventListener('change', () => {
        if (typeof updateFilters === 'function') updateFilters();
        if (typeof renderAvailableUnits === 'function') renderAvailableUnits();
    });
    if (filterRace) filterRace.addEventListener('change', () => {
        if (typeof updateFilters === 'function') updateFilters();
        if (typeof renderAvailableUnits === 'function') renderAvailableUnits();
    });
    if (filterSpecial) filterSpecial.addEventListener('change', () => {
        if (typeof updateFilters === 'function') updateFilters();
        if (typeof renderAvailableUnits === 'function') renderAvailableUnits();
    });
    if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', () => {
        if (typeof resetFilters === 'function') resetFilters();
        if (typeof renderAvailableUnits === 'function') renderAvailableUnits();
    });
    
    // Первоначальный рендер
    if (typeof renderArmy === 'function') renderArmy();
    if (typeof renderAvailableUnits === 'function') renderAvailableUnits();
}

// Запуск после загрузки DOM
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initArmyUI);
else initArmyUI();

console.log("✅ 07_army_ui.js загружен — интерфейс армий");