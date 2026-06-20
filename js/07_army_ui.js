// ============================================================================
// МОДУЛЬ 07: army_ui.js
// ВЕРСИЯ 12.0 — ПОЛНАЯ ПЕРЕЗАПИСЬ С МОДАЛЬНЫМ ОКНОМ ИМПОРТА
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

// ========== ОСНОВНАЯ ФУНКЦИЯ РЕНДЕРА АРМИЙ ==========
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
                            <div style="font-size:0.7rem; color:#cfc294;">👑 Командир: ${escapeHtml(army.commander || 'Не назначен')}</div>
                            ${army.motto ? `<div style="font-size:0.7rem; color:#ffd966; font-style:italic;">«${escapeHtml(army.motto)}»</div>` : ''}
                        </div>
                    </div>
                    <div class="army-stats" style="display:flex; gap:15px; flex-wrap:wrap;">
                        <span>⚔️ ${stats.totalStrength.toLocaleString()}</span>
                        <span>🛡️ ${stats.totalDefense.toLocaleString()}</span>
                        <span>❤️ ${stats.totalMorale.toLocaleString()}</span>
                        <span>💰 ${stats.totalUpkeep.toLocaleString()}</span>
                        <span>👥 ${stats.totalCount.toLocaleString()}</span>
                    </div>
					<button class="history-army-btn" data-id="${army.id}" style="background:#3a5a2a; margin-right:8px;">📜 История</button>
                    <button class="export-army-btn" data-id="${army.id}" style="background:#3a5a2a; margin-right:8px;">💾 Экспорт</button>
                    <button class="import-army-btn" data-id="${army.id}" style="background:#3a5a2a; margin-right:8px;">📂 Импорт</button>
                    <button class="delete-army-btn" data-id="${army.id}" style="background:#7a2a2a;">🗑️</button>
                </div>
                <div class="units-strip" id="units-strip-${army.id}" style="display:flex; flex-wrap:wrap; gap:10px; padding:12px; border-top:1px dashed #b87c4f;"></div>
                <div class="reserve-rear-strip" id="reserve-rear-${army.id}" style="display:flex; flex-wrap:wrap; gap:10px; padding:12px; border-top:1px dashed #b87c4f; background:rgba(0,0,0,0.2);">
                    <strong style="width:100%;">📦 Резерв тыла:</strong>
                </div>
                <div class="queue-strip" id="queue-strip-${army.id}" style="display:flex; flex-wrap:wrap; gap:10px; padding:12px; border-top:1px dashed #b87c4f; background:rgba(0,0,0,0.2);">
                    <strong style="width:100%;">⏳ В очереди:</strong>
                </div>
                <div style="padding: 8px; text-align: center;">
                    <button class="select-army-btn" data-id="${army.id}" style="background:#3a5a2a;">🎯 Выбрать для найма</button>
                </div>
            `;
            
            // ---- ОТРИСОВКА ОСНОВНЫХ ОТРЯДОВ ----
			const unitsStrip = armyDiv.querySelector(`#units-strip-${army.id}`);
			for (let unit of army.units) {
				const unitDiv = document.createElement('div');
				unitDiv.className = 'unit-icon';
				let bgColor = '#2c281c';
				let borderColor = '#b87c4f';
				let statusText = '';
				let isDestroyed = (unit.count === 0);
				if (isDestroyed) {
					bgColor = '#1a0a0a';
					borderColor = '#ff0000';
					statusText = `<div style="color:#ff0000; font-weight:bold; font-size:0.7rem;">⚰️ УНИЧТОЖЕН</div>`;
				} else if (unit.needsReserve && unit.wounded > 0) {
					bgColor = '#4a2a2a';
					borderColor = '#ff6b6b';
					statusText = `<div style="color:#ff6b6b; font-weight:bold; font-size:0.6rem;">⚠️ ТРЕБУЕТ ПОПОЛНЕНИЯ</div>`;
				}
				unitDiv.style.cssText = `background:${bgColor}; border:1px solid ${borderColor}; border-radius:12px; width:100px; text-align:center; padding:8px; position:relative;`;
				let iconPath = (typeof unitDatabase !== 'undefined' && unitDatabase[unit.unitKey]) ? unitDatabase[unit.unitKey].icon : unit.icon;
				if (iconPath && typeof getUnitIconPath === 'function') iconPath = getUnitIconPath(iconPath);
				const iconHtml = iconPath ? `<img src="${iconPath}" style="width:64px; height:auto; border-radius:6px;" onerror="this.style.display='none'">` : '<div style="font-size:40px;">⚔️</div>';
				
				let lossHtml = '';
				if (unit.killed > 0) lossHtml += `<span style="color:#ff6b6b;">💀${unit.killed}</span> `;
				if (unit.wounded > 0) lossHtml += `<span style="color:#ffaa33;">🩸${unit.wounded}</span> `;
				
				let reserveBtn = '';
				if (unit.wounded > 0) {
					reserveBtn = `<button onclick="moveUnitToReserve('${army.id}', '${unit.id}')" style="position:absolute; top:4px; right:4px; background:#7a2a2a; border:none; border-radius:50%; width:20px; height:20px; font-size:14px; cursor:pointer; color:white;" title="Переместить в резерв тыла">📦</button>`;
				}
				
				// Кнопка пополнения (если есть убитые, нет раненых, и не полная численность)
				let replenishBtn = '';
				if (unit.killed > 0 && unit.wounded === 0 && unit.count < unit.baseCount && unit.count > 0) {
					const needed = unit.baseCount - unit.count;
					replenishBtn = `<button onclick="replenishUnit('${army.id}', '${unit.id}')" style="position:absolute; bottom:4px; left:4px; background:#b8860b; border:none; border-radius:50%; width:20px; height:20px; font-size:14px; cursor:pointer; color:white;" title="Пополнить отряд из резерва (${needed} чел.)">💰</button>`;
				}
				
				unitDiv.innerHTML = `
					${iconHtml}
					<div class="unit-count" style="font-weight:bold;">${unit.count.toLocaleString()}</div>
					<div style="font-size:0.6rem; color:#8a7a5a;">(база: ${unit.baseCount})</div>
					<div class="unit-name-short" style="font-size:0.7rem;">${escapeHtml(unit.name.length > 12 ? unit.name.slice(0,10)+'…' : unit.name)}</div>
					<div style="font-size:0.6rem; color:#8a7a5a;">${escapeHtml(unit.race)}</div>
					${lossHtml ? `<div style="font-size:0.6rem; margin-top:2px;">${lossHtml}</div>` : ''}
					${statusText}
					${reserveBtn}
					${replenishBtn}
					<button class="remove-unit-btn" data-army="${army.id}" data-unit="${unit.id}" style="position:absolute; bottom:4px; right:4px; background:#7a2a2a; border:none; border-radius:50%; width:18px; height:18px; font-size:12px; cursor:pointer;">✖</button>
				`;
				unitDiv.addEventListener('contextmenu', (e) => {
					e.preventDefault();
					if (typeof showEncyclopedia === 'function') showEncyclopedia(unit.name);
				});
				unitsStrip.appendChild(unitDiv);
			}
            
            // ---- ОТРИСОВКА РЕЗЕРВА ТЫЛА ----
			const reserveStrip = armyDiv.querySelector(`#reserve-rear-${army.id}`);
			const rearUnits = army.reserveRear || [];
			if (rearUnits.length > 0) {
				for (let unit of rearUnits) {
					const unitDiv = document.createElement('div');
					unitDiv.className = 'unit-icon reserve-unit';
					let bgColor = '#1f2a1f';
					let borderColor = '#b87c4f';
					let statusText = '';
					let isDestroyed = (unit.count === 0);
					if (isDestroyed) {
						bgColor = '#1a0a0a';
						borderColor = '#ff0000';
						statusText = `<div style="color:#ff0000; font-weight:bold; font-size:0.7rem;">⚰️ УНИЧТОЖЕН</div>`;
					} else if (unit.needsReserve && unit.wounded > 0) {
						bgColor = '#3a2a2a';
						borderColor = '#ff6b6b';
						statusText = `<div style="color:#ff6b6b; font-weight:bold; font-size:0.6rem;">⚠️ ТРЕБУЕТ ПОПОЛНЕНИЯ</div>`;
					}
					unitDiv.style.cssText = `background:${bgColor}; border:1px solid ${borderColor}; border-radius:12px; width:100px; text-align:center; padding:8px; position:relative; opacity:0.8;`;
					let iconPath = (typeof unitDatabase !== 'undefined' && unitDatabase[unit.unitKey]) ? unitDatabase[unit.unitKey].icon : unit.icon;
					if (iconPath && typeof getUnitIconPath === 'function') iconPath = getUnitIconPath(iconPath);
					const iconHtml = iconPath ? `<img src="${iconPath}" style="width:64px; height:auto; border-radius:6px;" onerror="this.style.display='none'">` : '<div style="font-size:40px;">📦</div>';
					
					let lossHtml = '';
					if (unit.killed > 0) lossHtml += `<span style="color:#ff6b6b;">💀${unit.killed}</span> `;
					if (unit.wounded > 0) lossHtml += `<span style="color:#ffaa33;">🩸${unit.wounded}</span> `;
					
					// Кнопка пополнения для резерва
					let replenishBtn = '';
					if (unit.killed > 0 && unit.wounded === 0 && unit.count < unit.baseCount && unit.count > 0) {
						const needed = unit.baseCount - unit.count;
						replenishBtn = `<button onclick="replenishUnit('${army.id}', '${unit.id}')" style="position:absolute; bottom:4px; left:4px; background:#b8860b; border:none; border-radius:50%; width:20px; height:20px; font-size:14px; cursor:pointer; color:white;" title="Пополнить отряд из резерва (${needed} чел.)">💰</button>`;
					}
					
					unitDiv.innerHTML = `
						${iconHtml}
						<div class="unit-count" style="font-weight:bold;">${unit.count.toLocaleString()}</div>
						<div style="font-size:0.6rem; color:#8a7a5a;">(база: ${unit.baseCount})</div>
						<div class="unit-name-short" style="font-size:0.7rem;">${escapeHtml(unit.name.length > 12 ? unit.name.slice(0,10)+'…' : unit.name)}</div>
						<div style="font-size:0.6rem; color:#8a7a5a;">${escapeHtml(unit.race)}</div>
						${lossHtml ? `<div style="font-size:0.6rem; margin-top:2px;">${lossHtml}</div>` : ''}
						${statusText}
						${replenishBtn}
						<button onclick="returnUnitFromReserve('${army.id}', '${unit.id}')" style="position:absolute; top:4px; right:4px; background:#3a6b3a; border:none; border-radius:50%; width:20px; height:20px; font-size:14px; cursor:pointer; color:white;" title="Вернуть в армию">↩️</button>
					`;
					reserveStrip.appendChild(unitDiv);
				}
			} else {
				reserveStrip.innerHTML = '<strong style="width:100%;">📦 Резерв тыла:</strong><div style="color:#8a7a5a; padding:5px;">нет</div>';
			}
            
            // ---- ОТРИСОВКА ОЧЕРЕДИ НАЙМА ----
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
            
            // ---- КНОПКА ОБЪЕДИНЕНИЯ (если есть дубликаты) ----
            const unitKeys = army.units.map(u => u.unitKey);
            const duplicates = unitKeys.filter((key, index) => unitKeys.indexOf(key) !== index);
            if (duplicates.length > 0) {
                const uniqueDuplicates = [...new Set(duplicates)];
                const mergeContainer = document.createElement('div');
                mergeContainer.style.cssText = 'padding: 8px; text-align: center; border-top: 1px solid #b87c4f;';
                for (let key of uniqueDuplicates) {
                    const count = army.units.filter(u => u.unitKey === key).length;
                    if (count >= 2) {
                        const btn = document.createElement('button');
                        btn.textContent = `🔀 Объединить ${key} (${count} отрядов)`;
                        btn.style.cssText = 'background:#b8860b; margin: 2px 4px; padding: 4px 10px; font-size:0.7rem;';
                        btn.onclick = () => {
                            if (typeof mergeUnits === 'function') {
                                mergeUnits(army.id, key);
                                renderArmy();
                            }
                        };
                        mergeContainer.appendChild(btn);
                    }
                }
                armyDiv.appendChild(mergeContainer);
            }
            
            container.appendChild(armyDiv);
        }
    }
    
    // ---- ЛИЧНЫЕ АРМИИ ВАССАЛОВ ----
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
    
    // ---- ОБРАБОТЧИКИ СОБЫТИЙ ----
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
    
    // ---- КНОПКИ ЭКСПОРТА И ИМПОРТА ----
    document.querySelectorAll('.export-army-btn').forEach(btn => {
        btn.removeEventListener('click', window._exportArmyHandler);
        window._exportArmyHandler = () => {
            if (typeof exportSingleArmy === 'function') {
                exportSingleArmy(btn.dataset.id);
            } else {
                console.warn("exportSingleArmy не определена");
            }
        };
        btn.addEventListener('click', window._exportArmyHandler);
    });
    
    // ---- НОВЫЙ ИМПОРТ ЧЕРЕЗ МОДАЛЬНОЕ ОКНО ----
    document.querySelectorAll('.import-army-btn').forEach(btn => {
        btn.removeEventListener('click', window._importArmyHandler);
        window._importArmyHandler = function() {
            const armyId = this.dataset.id;
            openImportModal(armyId);
        };
        btn.addEventListener('click', window._importArmyHandler);
    });
    
    if (!lastSelectedArmyId && filteredArmies.length) lastSelectedArmyId = filteredArmies[0].id;
	
	document.querySelectorAll('.history-army-btn').forEach(btn => {
		btn.removeEventListener('click', window._historyArmyHandler);
		window._historyArmyHandler = function() {
			const armyId = this.dataset.id;
			openArmyHistoryModal(armyId);
		};
		btn.addEventListener('click', window._historyArmyHandler);
	});
}

// ========== ФУНКЦИИ ДЛЯ РАБОТЫ С РЕЗЕРВОМ ==========
function returnUnitFromReserve(armyId, unitId) {
    const army = armies.find(a => a.id === armyId);
    if (!army) return;
    const unitIndex = (army.reserveRear || []).findIndex(u => u.id === unitId);
    if (unitIndex === -1) return;
    const unit = army.reserveRear.splice(unitIndex, 1)[0];
    army.units.push(unit);
    addGlobalLog(`↩️ Отряд "${unit.name}" возвращён из резерва тыла в армию "${army.name}".`, 'army');
    saveArmyData();
    if (typeof renderArmy === 'function') renderArmy();
}

// ========== МОДАЛЬНОЕ ОКНО ИМПОРТА ==========
function openImportModal(armyId) {
    const army = armies.find(a => a.id === armyId);
    if (!army) {
        alert('Армия не найдена');
        return;
    }

    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); z-index: 20000;
        display: flex; justify-content: center; align-items: center;
    `;
    modal.innerHTML = `
        <div style="background: #1f1c14; border: 2px solid #b87c4f; border-radius: 24px; padding: 25px; max-width: 800px; width: 90%; max-height: 85vh; overflow-y: auto;">
            <h3 style="color: #ffd966; margin-top: 0;">📂 Импорт армии: ${escapeHtml(army.name)}</h3>
            <div style="margin: 15px 0;">
                <button id="importFileBtn" style="background: #3a5a2a;">📁 Выбрать файл</button>
                <input type="file" id="importFileInput" accept=".json" style="display: none;">
                <span id="importFileName" style="margin-left: 10px; color: #cfc294;">Файл не выбран</span>
            </div>
            <div id="importPreview" style="margin-top: 15px; border-top: 1px solid #b87c4f; padding-top: 15px;">
                <p style="color: #8a7a5a;">Загрузите файл для предпросмотра</p>
            </div>
            <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
                <button id="applyImportBtn" style="background: #3a6b3a;" disabled>✅ Применить импорт</button>
                <button id="cancelImportBtn" style="background: #7a2a2a;">❌ Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const fileInput = modal.querySelector('#importFileInput');
    const fileNameSpan = modal.querySelector('#importFileName');
    const previewDiv = modal.querySelector('#importPreview');
    const applyBtn = modal.querySelector('#applyImportBtn');

    let importedData = null;
    let battleResult = null;
    let opponent = null;
    let battleDate = null;
	let enemyKilled = 0;
	
    modal.querySelector('#importFileBtn').addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', function(e) {
        const file = this.files[0];
        if (!file) return;
        fileNameSpan.textContent = file.name;
        const reader = new FileReader();
        reader.onload = function(ev) {
            try {
                const data = JSON.parse(ev.target.result);
                if (!data.army) {
                    alert('❌ Неверный формат файла: отсутствует поле army');
                    return;
                }
                importedData = data.army;
                // Извлекаем данные о битве, если они есть
                battleResult = data.battleResult || null;
                opponent = data.opponent || null;
                battleDate = data.battleDate || null;
				enemyKilled = data.enemyKilled || 0;
                // Предпросмотр
                let html = `<h4 style="color: #ffd966;">${escapeHtml(importedData.name)} (ID: ${importedData.id})</h4>`;
                if (battleResult) {
                    html += `<div style="margin-bottom: 10px; color: #cfc294;">⚔️ Результат битвы: ${battleResult === 'victory' ? 'Победа' : battleResult === 'draw' ? 'Ничья' : 'Поражение'}${opponent ? ` против ${escapeHtml(opponent)}` : ''}${battleDate ? `, ${battleDate}` : ''}</div>`;
                }
                html += `<table style="width:100%; border-collapse: collapse; font-size:0.8rem;">
                    <thead><tr style="background: #2a2418;">
                        <th style="padding:4px;">Отряд</th>
                        <th style="padding:4px;">Тип</th>
                        <th style="padding:4px;">Численность</th>
                        <th style="padding:4px;">База</th>
                        <th style="padding:4px;">Убито</th>
                        <th style="padding:4px;">Ранено</th>
                    </tr></thead><tbody>`;
                for (let unit of importedData.units || []) {
                    html += `<tr>
                        <td style="padding:4px;">${escapeHtml(unit.name)}</td>
                        <td style="padding:4px;">${escapeHtml(unit.troopType || '')}</td>
                        <td style="padding:4px;">${unit.count}</td>
                        <td style="padding:4px;">${unit.baseCount || unit.count}</td>
                        <td style="padding:4px;">${unit.killed || 0}</td>
                        <td style="padding:4px;">${unit.wounded || 0}</td>
                    </tr>`;
                }
                html += `</tbody></table>`;
                previewDiv.innerHTML = html;
                applyBtn.disabled = false;
            } catch(err) {
                alert('❌ Ошибка чтения файла: ' + err.message);
            }
        };
        reader.readAsText(file);
    });

    applyBtn.addEventListener('click', function() {
        if (!importedData) return;
        const index = armies.findIndex(a => a.id === armyId);
        if (index !== -1) {
            const factionId = armies[index].factionId;
            // --- ЗАПИСЬ В ИСТОРИЮ ---
            if (battleResult && opponent) {
                // Суммируем потери
                let killed = 0, wounded = 0;
                for (let unit of importedData.units || []) {
                    killed += unit.killed || 0;
                    wounded += unit.wounded || 0;
                }
                const historyEntry = {
                    date: battleDate || getCurrentDateString(),
                    battleName: `Битва против ${opponent}`,
                    opponent: opponent,
                    result: battleResult === 'victory' ? 'Победа' : (battleResult === 'draw' ? 'Ничья' : 'Поражение'),
                    losses: { killed, wounded },
					enemyKilled: enemyKilled
                };
                // Сохраняем историю в старой армии до замены
                const oldHistory = armies[index].battleHistory || [];
                armies[index] = importedData;
                armies[index].id = armyId;
                armies[index].factionId = factionId;
                armies[index].battleHistory = oldHistory;
                armies[index].battleHistory.unshift(historyEntry);
            } else {
                // Обычная замена без истории
                armies[index] = importedData;
                armies[index].id = armyId;
                armies[index].factionId = factionId;
            }
            // Гарантируем наличие полей
            if (!armies[index].reserveRear) armies[index].reserveRear = [];
            if (!armies[index].recruitmentQueue) armies[index].recruitmentQueue = [];
            if (!armies[index].units) armies[index].units = [];
            if (!armies[index].battleHistory) armies[index].battleHistory = [];
            // Списываем убитых
            if (typeof applyBattleCasualties === 'function') {
                applyBattleCasualties();
            }
            saveArmyData();
            renderArmy();
            alert('✅ Импорт выполнен успешно!');
        } else {
            alert('❌ Армия не найдена');
        }
        document.body.removeChild(modal);
    });

    modal.querySelector('#cancelImportBtn').addEventListener('click', function() {
        document.body.removeChild(modal);
    });

    modal.addEventListener('click', function(e) {
        if (e.target === modal) document.body.removeChild(modal);
    });
}

function openArmyHistoryModal(armyId) {
    const army = armies.find(a => a.id === armyId);
    if (!army) {
        alert('Армия не найдена');
        return;
    }

    // Подсчёт общих потерь (только из истории, без учёта раненых)
    let totalKilled = 0;
    let totalEnemyKilled = 0;
    if (army.battleHistory) {
        for (let entry of army.battleHistory) {
            if (entry.losses) {
                totalKilled += entry.losses.killed || 0;
            }
            totalEnemyKilled += entry.enemyKilled || 0;
        }
    }

    // Текущая численность (для отображения)
    let totalCurrent = 0;
    let totalBase = 0;
    for (let unit of army.units) {
        totalCurrent += unit.count || 0;
        totalBase += unit.baseCount || 0;
    }

    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); z-index: 20000;
        display: flex; justify-content: center; align-items: center;
    `;
    modal.innerHTML = `
        <div style="background: #1f1c14; border: 2px solid #b87c4f; border-radius: 24px; padding: 25px; max-width: 1100px; width: 95%; max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h2 style="color: #ffd966; margin: 0;">📜 История армии: ${escapeHtml(army.name)}</h2>
                <button id="closeHistoryModalBtn" style="background: #7a2a2a; padding: 6px 16px;">❌ Закрыть</button>
            </div>
            <div style="display: flex; gap: 25px; flex: 1; flex-wrap: wrap;">
                <!-- Левая панель: Хроника -->
                <div style="flex: 1; min-width: 300px; background: #2a2418; border-radius: 16px; padding: 15px; border: 1px solid #b87c4f;">
                    <h3 style="color: #ffd966; margin-top: 0;">📖 Хроника</h3>
                    <div style="font-size: 0.9rem; margin-bottom: 10px;">
                        <div><strong>👑 Командир:</strong> ${escapeHtml(army.commander || 'Не назначен')}</div>
                        <div><strong>📅 Основана:</strong> ${army.foundationDate || 'неизвестно'}</div>
                        ${army.motto ? `<div><strong>📜 Девиз:</strong> «${escapeHtml(army.motto)}»</div>` : ''}
                        <div><strong>⚔️ Всего отрядов:</strong> ${army.units.length}</div>
                        <div><strong>💀 Общие потери:</strong> убито ${totalKilled}</div>
                        <div><strong>💀 Убито врагов:</strong> ${totalEnemyKilled}</div>
                        <div><strong>👥 Текущая численность:</strong> ${totalCurrent}/${totalBase}</div>
                    </div>
                    <hr style="border-color: #b87c4f; margin: 10px 0;">
                    <h4 style="color: #cfc294;">🏆 Участие в битвах</h4>
                    ${army.battleHistory && army.battleHistory.length > 0 ? 
                        army.battleHistory.map(b => `
                            <div style="background: #1f1c14; border-radius: 12px; padding: 8px 12px; margin-bottom: 8px; border-left: 4px solid ${b.result === 'Победа' ? '#8bc34a' : b.result === 'Ничья' ? '#ffd966' : '#ff6b6b'};">
                                <div><strong>${b.date || 'дата неизвестна'}</strong> — ${b.battleName || 'Битва'}</div>
                                <div style="font-size: 0.85rem; color: #cfc294;">Против: ${b.opponent || 'неизвестен'}</div>
                                <div style="font-size: 0.85rem; color: ${b.result === 'Победа' ? '#8bc34a' : b.result === 'Ничья' ? '#ffd966' : '#ff6b6b'};">${b.result || '?'}</div>
                                ${b.losses ? `<div style="font-size: 0.8rem; color: #8a7a5a;">Потери: убито ${b.losses.killed || 0}</div>` : ''}
                            </div>
                        `).join('') 
                        : '<div style="color: #8a7a5a;">Армия ещё не участвовала в битвах.</div>'
                    }
                </div>
                <!-- Правая панель: Отряды (без изменений) -->
                <div style="flex: 1; min-width: 300px; background: #2a2418; border-radius: 16px; padding: 15px; border: 1px solid #b87c4f;">
                    <h3 style="color: #ffd966; margin-top: 0;">⚔️ Отряды</h3>
                    <div style="max-height: 400px; overflow-y: auto; margin-top: 10px;">
                        ${army.units.map(unit => {
                            const canReplenish = unit.killed > 0 && unit.wounded === 0 && unit.count < unit.baseCount && unit.count > 0;
                            const needed = unit.baseCount - unit.count;
                            return `
                                <div style="display: flex; justify-content: space-between; align-items: center; background: #1f1c14; border-radius: 12px; padding: 8px 12px; margin-bottom: 8px; border-left: 4px solid ${canReplenish ? '#b8860b' : '#b87c4f'};">
                                    <div style="flex: 1;">
                                        <div><strong>${escapeHtml(unit.name)}</strong> (${escapeHtml(unit.race)})</div>
                                        <div style="font-size: 0.8rem; color: #cfc294;">
                                            ${unit.count}/${unit.baseCount} 
                                            ${unit.killed > 0 ? `💀${unit.killed}` : ''} 
                                            ${unit.wounded > 0 ? `🩸${unit.wounded}` : ''}
                                        </div>
                                    </div>
                                    ${canReplenish ? 
                                        `<button onclick="replenishUnit('${army.id}', '${unit.id}'); setTimeout(() => openArmyHistoryModal('${army.id}'), 100);" style="background: #b8860b; padding: 4px 12px; font-size: 0.8rem;">💰 Пополнить (${needed} чел.)</button>` 
                                        : `<span style="color: #8a7a5a; font-size: 0.8rem;">${unit.killed > 0 && unit.wounded > 0 ? '⚠️ есть раненые' : unit.count >= unit.baseCount ? '✅ полный' : '—'}</span>`
                                    }
                                </div>
                            `;
                        }).join('')}
                    </div>
                    ${army.reserveRear && army.reserveRear.length > 0 ? `
                        <hr style="border-color: #b87c4f; margin: 15px 0;">
                        <h4 style="color: #cfc294;">📦 Резерв тыла</h4>
                        <div style="max-height: 200px; overflow-y: auto;">
                            ${army.reserveRear.map(unit => {
                                const canReplenish = unit.killed > 0 && unit.wounded === 0 && unit.count < unit.baseCount;
                                const needed = unit.baseCount - unit.count;
                                return `
                                    <div style="display: flex; justify-content: space-between; align-items: center; background: #1f1c14; border-radius: 12px; padding: 8px 12px; margin-bottom: 8px; border-left: 4px solid ${canReplenish ? '#b8860b' : '#b87c4f'}; opacity: 0.8;">
                                        <div style="flex: 1;">
                                            <div><strong>${escapeHtml(unit.name)}</strong> (${escapeHtml(unit.race)})</div>
                                            <div style="font-size: 0.8rem; color: #cfc294;">
                                                ${unit.count}/${unit.baseCount} 
                                                ${unit.killed > 0 ? `💀${unit.killed}` : ''} 
                                                ${unit.wounded > 0 ? `🩸${unit.wounded}` : ''}
                                            </div>
                                        </div>
                                        ${canReplenish ? 
                                            `<button onclick="replenishUnit('${army.id}', '${unit.id}'); setTimeout(() => openArmyHistoryModal('${army.id}'), 100);" style="background: #b8860b; padding: 4px 12px; font-size: 0.8rem;">💰 Пополнить (${needed} чел.)</button>` 
                                            : `<span style="color: #8a7a5a; font-size: 0.8rem;">${unit.killed > 0 && unit.wounded > 0 ? '⚠️ есть раненые' : unit.count >= unit.baseCount ? '✅ полный' : '—'}</span>`
                                        }
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#closeHistoryModalBtn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

// ========== ОТРИСОВКА ДОСТУПНЫХ ЮНИТОВ ==========
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
                <div><label>👑 Командир:</label><input type="text" id="newArmyCommanderInput" value="Не назначен"></div>
                <div><label>📜 Девиз:</label><input type="text" id="newArmyMottoInput" value=""></div>
                <div><button id="confirmCreateArmyBtn">✅ Создать</button><button id="cancelCreateArmyBtn">❌ Отмена</button></div>
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
            if (typeof saveArmyData === 'function') saveArmyData();
            if (typeof renderArmy === 'function') renderArmy();
            if (typeof refreshRecruitmentLimits === 'function') refreshRecruitmentLimits();
            const settlementName = (typeof SETTLEMENTS_DB !== 'undefined' && SETTLEMENTS_DB[selectedSettlement]) ? SETTLEMENTS_DB[selectedSettlement].name : selectedSettlement;
            addGlobalLog(`➕ Создана новая армия "${armyName}" в поселении ${settlementName}. Командир: ${commander}`, 'army');
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
    
    if (typeof renderArmy === 'function') renderArmy();
    if (typeof renderAvailableUnits === 'function') renderAvailableUnits();
}

// ========== ЭКСПОРТ ФУНКЦИЙ ==========
window.moveUnitToReserve = moveUnitToReserve;
window.returnUnitFromReserve = returnUnitFromReserve;
window.renderArmy = renderArmy;
window.renderAvailableUnits = renderAvailableUnits;
window.initArmyUI = initArmyUI;
window.updateTreasuryDisplay = updateTreasuryDisplay;
window.openImportModal = openImportModal;

// Запуск после загрузки DOM
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initArmyUI);
else initArmyUI();

console.log("✅ 07_army_ui.js загружен — финальная версия с модальным импортом");