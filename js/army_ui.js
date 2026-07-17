// ============================================================================
// МОДУЛЬ: army_ui.js (версия 20.0 – диалог импорта битвы, метки раненых)
// ============================================================================
// Загружено на гитхаб 18.07.2026
function renderArmy() {
    const container = document.getElementById('armiesContainer');
    if (!container) return;

    const filteredArmies = (window.armies || []).filter(a => a.factionId === window.currentFaction);

    if (filteredArmies.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:#8a7a5a; padding:20px;">Нет армий. Создайте новую.</div>';
        return;
    }

    container.innerHTML = '';
    for (let army of filteredArmies) {
        const card = document.createElement('div');
        card.className = 'army-container';
        card.style.cssText = 'background:#2c281c; border:1px solid #b87c4f; border-radius:16px; padding:12px; margin-bottom:12px;';

        // Гарнизон
        let garrisonName = '🏕️ Армия вне гарнизона';
        if (army.garrison && typeof SETTLEMENTS_DB !== 'undefined' && SETTLEMENTS_DB[army.garrison]) {
            garrisonName = SETTLEMENTS_DB[army.garrison].name;
        } else if (army.garrison) {
            garrisonName = 'неизвестно';
        }

        // ---- Отряды (горизонтальный ряд) ----
        let unitsHtml = '';
        if (army.units.length > 0) {
            unitsHtml = '<div style="display:flex; flex-wrap:wrap; gap:0px; margin-top:0px;">';
            for (let unit of army.units) {
                let iconPath = unit.icon;
                if (iconPath && typeof getUnitIconPath === 'function') {
                    iconPath = getUnitIconPath(iconPath);
                } else if (iconPath && !iconPath.startsWith('icons/') && !iconPath.startsWith('http')) {
                    iconPath = 'icons/' + iconPath;
                }
                const iconHtml = iconPath 
                    ? `<img src="${iconPath}" style="width:100px; height:190px; object-fit:contain; border-radius:6px;">` 
                    : '⚔️';
                
                // Метка раненых
                let woundedBadge = '';
                if (unit.wounded && unit.wounded > 0) {
                    woundedBadge = `<span style="position:absolute; top:2px; right:2px; font-size:1.5rem; color:#ff4444;" title="Ранено: ${unit.wounded}">❤️‍🩹</span>`;
                }

                unitsHtml += `
					<div style="display:flex; flex-direction:column; align-items:center; background:#1f1c14; padding:6px; border-radius:10px; width:110px; text-align:center; position:relative;">
						${iconHtml}
						${woundedBadge}
						<span style="font-size:1rem; margin-top:4px;">${escapeHtml(unit.name)}</span>
						<span style="font-size:1rem; color:#cfc294;">👥 ${unit.count}</span>
						<div style="display:flex; gap:4px; justify-content:center; margin-top:4px;">
							<button onclick="window.removeUnitFromArmy('${army.id}', '${unit.id}')" style="background:#7a2a2a; padding:2px 6px; font-size:0.6rem;" title="Удалить отряд">✖</button>
							<button onclick="openUnitManualEdit('${army.id}', '${unit.id}')" style="background:#b8860b; padding:2px 6px; font-size:0.6rem;" title="Редактировать отряд">🗡️</button>
							<button onclick="(function(){ const db = window.unitDatabase || {}; const mercs = window.MERCENARY_UNITS || {}; const unit = db['${unit.unitKey}'] || mercs['${unit.unitKey}']; if(unit && typeof openUnitDetailModal === 'function') openUnitDetailModal(unit); })()" style="background:#3a5a2a; padding:2px 6px; font-size:0.6rem;" title="Подробнее">🔍</button>
						</div>
					</div>`;
            }
            unitsHtml += '</div>';
        } else {
            unitsHtml = '<div style="color:#8a7a5a; font-size:0.8rem; margin-top:8px;">Нет отрядов</div>';
        }

        // ---- Очередь найма (горизонтальный ряд) ----
        let queueHtml = '';
        if (army.recruitmentQueue && army.recruitmentQueue.length > 0) {
            queueHtml = '<div style="margin-top:10px; border-top:1px dashed #b87c4f; padding-top:8px;"><strong style="font-size:0.8rem;">⏳ В очереди:</strong><div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:6px;">';
            for (let q of army.recruitmentQueue) {
                const db = window.unitDatabase || {};
                const base = db[q.unitKey] || (window.MERCENARY_UNITS || {})[q.unitKey];
                const unitName = base ? base.name : q.unitKey;
                let iconPath = base ? base.icon : null;
                if (iconPath && typeof getUnitIconPath === 'function') {
                    iconPath = getUnitIconPath(iconPath);
                } else if (iconPath && !iconPath.startsWith('icons/') && !iconPath.startsWith('http')) {
                    iconPath = 'icons/' + iconPath;
                }
                const iconHtml = iconPath 
                    ? `<img src="${iconPath}" style="width:100px; height:150px; object-fit:contain; border-radius:4px;">` 
                    : '⏳';
                
                queueHtml += `
                    <div style="display:flex; flex-direction:column; align-items:center; background:#1f1c14; padding:6px; border-radius:10px; width:110px; text-align:center; position:relative;">
                        ${iconHtml}
                        <span style="font-size:1rem; margin-top:4px;">${escapeHtml(unitName)}</span>
                        <span style="font-size:1rem; color:#ffd966;">⏱️ ${q.remainingTurns} ход(ов)</span>
                        <button onclick="window.cancelRecruitment('${army.id}', '${q.id}')" style="background:#7a2a2a; padding:2px 6px; font-size:0.6rem; margin-top:4px;">✖</button>
                    </div>`;
            }
            queueHtml += '</div></div>';
        }

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong>${escapeHtml(army.name)}</strong>
                    <div style="font-size:0.7rem; color:#cfc294;">📍 Гарнизон: ${escapeHtml(garrisonName)}</div>
                    <div style="font-size:0.7rem; color:#cfc294;">👑 Командир: ${escapeHtml(army.commander || 'Не назначен')}</div>
                </div>
				<div>
					<button onclick="openEditArmyModal('${army.id}'); event.stopPropagation();" style="padding:4px 10px; font-size:0.7rem;" title="Редактировать">✏️</button>
					<button onclick="window.lastSelectedArmyId='${army.id}'; alert('Армия выбрана для найма'); event.stopPropagation();" style="padding:4px 10px; font-size:0.7rem;" title="Выбрать для найма">🎯</button>
					<button onclick="openBattleModal('${army.id}'); event.stopPropagation();" style="padding:4px 10px; font-size:0.7rem;" title="Битва">⚔️</button>
					<button onclick="reinforceArmy('${army.id}'); event.stopPropagation();" style="padding:4px 10px; font-size:0.7rem;" title="Пополнить">🚹</button>
					<button onclick="if(confirm('Снять армию с гарнизона?')) { window.updateArmyInfo('${army.id}', {garrison: null}); }; event.stopPropagation();" style="padding:4px 10px; font-size:0.7rem;" title="Снять с гарнизона">🏕️</button>
					<button onclick="window.deleteArmy('${army.id}'); event.stopPropagation();" style="padding:4px 10px; font-size:0.7rem; background:#7a2a2a;" title="Удалить">🗑️</button>
				</div>
            </div>
            ${unitsHtml}
            ${queueHtml}
        `;
        container.appendChild(card);
    }

    // Обновление казны и содержания на вкладке АРМИЯ
    const treasuryEl = document.getElementById('armyTreasury');
    if (treasuryEl) {
        treasuryEl.textContent = (typeof getCurrentTreasury === 'function' ? getCurrentTreasury() : 0).toLocaleString();
    }
    const upkeepEl = document.getElementById('globalUpkeep');
    if (upkeepEl) {
        upkeepEl.textContent = (typeof calculateTotalUpkeep === 'function' ? calculateTotalUpkeep() : 0).toLocaleString();
    }
}

function renderAvailableUnits() {
    const container = document.getElementById('unitsGrid');
    if (!container) return;

    let units = (typeof getUnitsForCurrentFaction === 'function') ? getUnitsForCurrentFaction() : [];
    if (units.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:#8a7a5a;">Нет доступных юнитов.</div>';
        return;
    }

    // Чтение фильтров
    const filterTypeEl = document.getElementById('filterType');
    const filterRaceEl = document.getElementById('filterRace');
    const filterSpecialEl = document.getElementById('filterSpecial');

    const selectedType = filterTypeEl ? filterTypeEl.value : 'all';
    const selectedRace = filterRaceEl ? filterRaceEl.value : 'all';
    const onlySpecial = filterSpecialEl ? filterSpecialEl.checked : false;

    // Фильтрация
    units = units.filter(unit => {
        if (selectedType !== 'all') {
            const typeLower = selectedType.toLowerCase();
            const unitTypeLower = (unit.troopType || '').toLowerCase();
            if (typeLower === 'кавалерия') {
                if (!unitTypeLower.includes('кавалерия')) return false;
            } else if (typeLower === 'пехота') {
                if (!unitTypeLower.includes('пехота')) return false;
            } else {
                if (unitTypeLower !== typeLower) return false;
            }
        }
        if (selectedRace !== 'all') {
            if (unit.race !== selectedRace) return false;
        }
        if (onlySpecial) {
            if (unit.maxCount === null || unit.maxCount === undefined) return false;
        }
        return true;
    });

    container.innerHTML = '';
    if (units.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:#8a7a5a;">Нет юнитов, соответствующих фильтрам.</div>';
        return;
    }

    for (let unit of units) {
        const card = document.createElement('div');
        card.className = 'unit-card';
        card.style.cssText = `
            background: #2c281c;
            border: 2px solid #b87c4f;
            border-radius: 5px;
            padding: 5px;
            width: 150px;
            text-align: center;
            display: inline-block;
            margin: 2px;
            vertical-align: top;
            transition: 0.2s;
        `;

        let iconPath = unit.icon;
        if (iconPath && typeof getUnitIconPath === 'function') {
            iconPath = getUnitIconPath(iconPath);
        } else if (iconPath && !iconPath.startsWith('icons/') && !iconPath.startsWith('http')) {
            iconPath = 'icons/' + iconPath;
        }
        const iconHtml = iconPath
            ? `<img src="${iconPath}" style="width: 150px; height: 200px; object-fit: contain; margin: 0 auto 10px; display: block; border-radius: 6px;">`
            : '<div style="font-size: 60px; margin: 0 auto 16px;">⚔️</div>';

        card.innerHTML = `
            ${iconHtml}
            <button class="detail-unit-btn" data-unit-key="${unit.key}" style="
                background:#3a5a2a; padding:3px 0; width:70%; margin-bottom:5px;
                font-size:0.9rem; border-radius:5px;
            ">📋 Подробнее</button>
            <button class="hire-unit-btn" data-unit-key="${unit.key}" style="
                background:#3a6b3a; padding:3px 0; width:70%;
                font-size:0.9rem; border-radius:5px;
            ">➕ Нанять</button>
        `;
        container.appendChild(card);
    }

    // Обработчики кнопок
    document.querySelectorAll('.detail-unit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const unitKey = this.dataset.unitKey;
            const db = window.unitDatabase || {};
            const mercs = window.MERCENARY_UNITS || {};
            const unit = db[unitKey] || mercs[unitKey];
            if (unit) openUnitDetailModal(unit);
        });
    });

    document.querySelectorAll('.hire-unit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const unitKey = this.dataset.unitKey;
            if (!window.lastSelectedArmyId) {
                alert('Сначала выберите армию (кнопка «🎯 Выбрать»).');
                return;
            }
            if (typeof addUnitToArmy === 'function') {
                addUnitToArmy(window.lastSelectedArmyId, unitKey, 1);
                renderArmy();
            }
        });
    });
}

function resetFilters() {
    const filterTypeEl = document.getElementById('filterType');
    const filterRaceEl = document.getElementById('filterRace');
    const filterSpecialEl = document.getElementById('filterSpecial');
    if (filterTypeEl) filterTypeEl.value = 'all';
    if (filterRaceEl) filterRaceEl.value = 'all';
    if (filterSpecialEl) filterSpecialEl.checked = false;
}


// ---------- МОДАЛЬНОЕ ОКНО С ДЕТАЛЯМИ ----------
function openUnitDetailModal(unit) {
    const oldModal = document.getElementById('unitDetailModal');
    if (oldModal) oldModal.remove();

    const modal = document.createElement('div');
    modal.id = 'unitDetailModal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); z-index: 10000;
        display: flex; justify-content: center; align-items: center;
    `;

    let iconPath = unit.icon;
    if (iconPath && typeof getUnitIconPath === 'function') iconPath = getUnitIconPath(iconPath);
    else if (iconPath && !iconPath.startsWith('icons/') && !iconPath.startsWith('http')) iconPath = 'icons/' + iconPath;

    const iconHtml = iconPath
        ? `<img src="${iconPath}" style="width: 150px; height: 400px; object-fit: contain; border-radius: 12px;">`
        : '<div style="font-size: 80px;">⚔️</div>';

    const techBonuses = (typeof getTechBonuses === 'function') ? getTechBonuses() : {};

    // Универсальный ключ юнита (в разных местах приходит unit.unitKey или unit.key)
    const unitKey = unit.unitKey || unit.key;

    // Сбор всех эффектов, влияющих на этого юнита
    const activeEffects = [];

    // Скидка на найм
    let hireCost = unit.hireCost || 0;
    let hireCostNote = '';
    if (unitKey && techBonuses.hireDiscountByUnit && techBonuses.hireDiscountByUnit[unitKey]) {
        const discountPercent = techBonuses.hireDiscountByUnit[unitKey];
        hireCost = Math.floor(hireCost * (1 - discountPercent / 100));
        hireCostNote = ` (скидка ${discountPercent}%, итого ${hireCost} эрсов)`;
        activeEffects.push(`💰 Скидка на найм: −${discountPercent}%`);
    }
    const costStr = unit.hireCost === 0 ? 'бесплатно' : `${unit.hireCost} эрсов${hireCostNote}`;

    // Скидка на содержание
    let upkeep = unit.upkeep || 0;
    let upkeepNote = '';
    if (unitKey && techBonuses.upkeepDiscountByUnit && techBonuses.upkeepDiscountByUnit[unitKey]) {
        const discountPercent = techBonuses.upkeepDiscountByUnit[unitKey];
        upkeep = Math.floor(upkeep * (1 - discountPercent / 100));
        upkeepNote = ` (скидка ${discountPercent}%, итого ${upkeep} эрсов/ход)`;
        activeEffects.push(`⚖️ Скидка на содержание: −${discountPercent}%`);
    }

    // Защита
    let defense = unit.defense || 0;
    if (techBonuses.infantryDefenseBonus) {
        defense += techBonuses.infantryDefenseBonus;
        activeEffects.push(`🛡️ Защита: +${techBonuses.infantryDefenseBonus}`);
    }

    // Мораль
    let morale = unit.morale || 0;
    if (techBonuses.globalMoraleBonus) {
        morale += techBonuses.globalMoraleBonus;
        activeEffects.push(`❤️ Мораль: +${techBonuses.globalMoraleBonus}`);
    }

    // Атака (заготовка на будущее)
    let melee = unit.strengthMelee || unit.strength || 0;
    if (techBonuses.meleeAttackBonus) {
        melee += techBonuses.meleeAttackBonus;
        activeEffects.push(`⚔️ Атака ближняя: +${techBonuses.meleeAttackBonus}`);
    }
    let ranged = unit.strengthRanged || 0;
    if (techBonuses.rangedAttackBonus) {
        ranged += techBonuses.rangedAttackBonus;
        activeEffects.push(`🏹 Атака дальняя: +${techBonuses.rangedAttackBonus}`);
    }

    // Время найма
    let hireTime = unit.hireTime || 1;
    if (techBonuses.hireTimeReduction) {
        hireTime = Math.max(1, hireTime - techBonuses.hireTimeReduction);
        activeEffects.push(`⏱️ Время найма: −${techBonuses.hireTimeReduction} ход(ов)`);
    }

    // Формируем строку с эффектами
    let effectsHtml = '';
    if (activeEffects.length > 0) {
        effectsHtml = '<div style="margin-top: 10px; border-top: 1px solid #b87c4f; padding-top: 8px;">';
        effectsHtml += '<strong>🌟 Влияние эффектов:</strong><br>';
        effectsHtml += activeEffects.map(e => `<span style="font-size: 0.9rem; color: #cfc294;">• ${e}</span>`).join('<br>');
        effectsHtml += '</div>';
    }

    // Фракции
    let factionsStr = '';
    if (unit.availableFactions) {
        const names = unit.availableFactions.map(f => {
            return (window.RHETORIC_NAMES && window.RHETORIC_NAMES[f]) ? window.RHETORIC_NAMES[f] : f;
        });
        factionsStr = names.join(', ');
    }

    const requirements = [];
    if (unit.special) requirements.push(`✨ Особенность: ${escapeHtml(unit.special)}`);
    if (unit.gender === 'female') requirements.push('🚺 Требуется реформа «Женщины в армии»');
    if (unit.maxCount) requirements.push(`📦 Максимум отрядов: ${unit.maxCount}`);
    if (unit.availableFactions) requirements.push(`🏛️ Доступна фракциям: ${factionsStr}`);
    const requirementsHtml = requirements.length > 0 ? requirements.join('<br>') : 'Нет особых условий';

    modal.innerHTML = `
        <div style="
            background: #1f1c14; border: 2px solid #b87c4f; border-radius: 24px;
            padding: 25px; max-width: 650px; width: 90%; color: #e6ddb3;
            display: flex; gap: 25px; align-items: flex-start;
        ">
            <div style="flex: 0 0 auto; text-align: center;">
                ${iconHtml}
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                <h2 style="color: #ffd966; margin: 0 0 10px 0;">${escapeHtml(unit.name)}</h2>
                <div><strong>🧬 Раса:</strong> ${escapeHtml(unit.race)}</div>
                <div><strong>⚔️ Тип:</strong> ${escapeHtml(unit.troopType)}</div>
                <div><strong>👥 Численность отряда:</strong> ${unit.countPerUnit || 100} чел.</div>
                <div><strong>💰 Стоимость найма:</strong> ${costStr}</div>
                <div><strong>⚖️ Содержание:</strong> ${upkeep} ${upkeepNote} эрсов/ход</div>
                <div><strong>⚔️ Атака ближняя:</strong> ${melee}</div>
                <div><strong>🏹 Атака дальняя:</strong> ${ranged}</div>
                <div><strong>🛡️ Защита:</strong> ${defense}</div>
                <div><strong>❤️ Мораль:</strong> ${morale}</div>
                <div><strong>⏱️ Время найма:</strong> ${hireTime} ход(ов)</div>
                ${effectsHtml}
                <div style="margin-top: 10px; border-top: 1px solid #b87c4f; padding-top: 8px;">
                    <strong>📋 Условия найма:</strong><br>
                    <span style="font-size: 0.9rem; color: #cfc294;">${requirementsHtml}</span>
                </div>
            </div>
        </div>
        <button id="closeUnitDetailBtn" style="
            position: absolute; top: 15px; right: 15px;
            background: #7a2a2a; border: none; color: white;
            font-size: 1.2rem; width: 32px; height: 32px; border-radius: 50%;
            cursor: pointer;
        ">✕</button>
    `;

    document.body.appendChild(modal);
    document.getElementById('closeUnitDetailBtn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

function openEditArmyModal(armyId) {
    const army = (window.armies || []).find(a => a.id === armyId);
    if (!army) return;

    const factionProvinces = (typeof getCurrentFactionProvinces === 'function') 
        ? getCurrentFactionProvinces() 
        : [];
    const settlements = Object.values(SETTLEMENTS_DB)
        .filter(s => factionProvinces.includes(s.province) && (s.type === 'city' || s.type === 'castle'))
        .sort((a, b) => a.name.localeCompare(b.name));

    let optionsHtml = '<option value="">🏕️ Снять с гарнизона (армия вне гарнизона)</option>';
    for (let s of settlements) {
        const selected = (army.garrison === s.id) ? 'selected' : '';
        optionsHtml += `<option value="${s.id}" ${selected}>${s.name} (${s.type === 'city' ? 'Город' : 'Замок'})</option>`;
    }

    const modal = document.createElement('div');
    modal.id = 'editArmyModal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 10000; display: flex; justify-content: center; align-items: center;';
    modal.innerHTML = `
        <div style="background: #1f1c14; border: 2px solid #b87c4f; border-radius: 24px; padding: 25px; max-width: 500px; width: 90%; color: #e6ddb3;">
            <h3 style="color:#ffd966; margin-top:0;">✏️ Редактирование армии</h3>
            <label style="display:block; margin:10px 0;">Название:
                <input type="text" id="editArmyName" value="${escapeHtml(army.name)}" style="width:100%; padding:6px; background:#2a241c; border:1px solid #b87c4f; border-radius:12px; color:#f0e6d0;">
            </label>
            <label style="display:block; margin:10px 0;">Командир:
                <input type="text" id="editArmyCommander" value="${escapeHtml(army.commander || '')}" style="width:100%; padding:6px; background:#2a241c; border:1px solid #b87c4f; border-radius:12px; color:#f0e6d0;">
            </label>
            <label style="display:block; margin:10px 0;">Гарнизон (поселение):
                <select id="editArmyGarrison" style="width:100%; padding:6px; background:#2a241c; border:1px solid #b87c4f; border-radius:12px; color:#f0e6d0;">
                    ${optionsHtml}
                </select>
            </label>
            <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:20px;">
                <button id="saveArmyEditBtn" style="background:#3a6b3a; padding:8px 20px;">✅ Сохранить</button>
                <button id="cancelArmyEditBtn" style="background:#7a2a2a; padding:8px 20px;">Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('cancelArmyEditBtn').onclick = () => modal.remove();

    document.getElementById('saveArmyEditBtn').onclick = () => {
        const newName = document.getElementById('editArmyName').value.trim();
        const newCommander = document.getElementById('editArmyCommander').value.trim();
        const newGarrison = document.getElementById('editArmyGarrison').value || null;

        if (!newName) {
            alert('Название не может быть пустым');
            return;
        }

        if (typeof window.updateArmyInfo === 'function') {
            window.updateArmyInfo(armyId, {
                name: newName,
                commander: newCommander || 'Не назначен',
                garrison: newGarrison
            });
        } else {
            army.name = newName;
            army.commander = newCommander || 'Не назначен';
            army.garrison = newGarrison;
            if (typeof saveArmyData === 'function') saveArmyData();
            if (typeof renderArmy === 'function') renderArmy();
        }
        modal.remove();
    };
}

// ========== ЭКСПОРТ ВСЕХ АРМИЙ ==========
function exportAllArmies() {
    const factionArmies = (window.armies || []).filter(a => a.factionId === window.currentFaction);
    if (factionArmies.length === 0) {
        alert('Нет армий для экспорта.');
        return;
    }

    const exportData = factionArmies.map(army => ({
        id: army.id,
        name: army.name,
        factionId: army.factionId,
        garrison: army.garrison || null,
        commander: army.commander || 'Не назначен',
        units: army.units.map(u => ({
            unitKey: u.unitKey,
            name: u.name,
            race: u.race,
            gender: u.gender,
            troopType: u.troopType,
            count: u.count,
            icon: u.icon,
            upkeep: u.upkeep,
            wounded: u.wounded || 0
        })),
        recruitmentQueue: army.recruitmentQueue || [],
        foundationDate: army.foundationDate,
        motto: army.motto
    }));

    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `armies_${window.currentFaction}_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    addGlobalLog(`💾 Экспортированы все армии фракции.`, 'army');
}

// ========== ДИАЛОГ ИМПОРТА РЕЗУЛЬТАТОВ БИТВЫ ==========
function openBattleImportDialog(reports) {
    const oldModal = document.getElementById('battleImportModal');
    if (oldModal) oldModal.remove();

    const modal = document.createElement('div');
    modal.id = 'battleImportModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:10000;display:flex;justify-content:center;align-items:center;';

    const factionArmies = (window.armies || []).filter(a => a.factionId === window.currentFaction);

    // Безопасное преобразование в id (убираем пробелы, дефисы и т.д.)
    function safeId(str) {
        return str.replace(/[^a-zA-Z0-9]/g, '_');
    }

    // --- ЛЕВАЯ ПАНЕЛЬ: все отряды фракции с полями для потерь ---
    let leftHtml = '<div style="max-height:400px;overflow-y:auto;">';
    leftHtml += '<table style="width:100%; border-collapse:collapse;">';
    leftHtml += '<thead><tr><th>Отряд (армия)</th><th>👥 Сейчас</th><th>💀 Убито</th><th>❤️ Ранено</th><th>👥 Осталось</th></tr></thead><tbody>';

    for (let army of factionArmies) {
        for (let unit of army.units) {
            const fieldId = safeId(army.id + '_' + unit.unitKey);
            leftHtml += `
                <tr>
                    <td>${escapeHtml(unit.name)} <span style="font-size:0.7rem;color:#8a7a5a;">(${escapeHtml(army.name)})</span></td>
                    <td>${unit.count}</td>
                    <td><input type="number" id="left_killed_${fieldId}" value="0" min="0" max="${unit.count}" style="width:60px" onchange="updateLeftRemaining('${fieldId}')"></td>
                    <td><input type="number" id="left_wounded_${fieldId}" value="0" min="0" max="${unit.count}" style="width:60px" onchange="updateLeftRemaining('${fieldId}')"></td>
                    <td><span id="left_remaining_${fieldId}">${unit.count}</span></td>
                </tr>`;
        }
    }
    leftHtml += '</tbody></table></div>';

    // --- ПРАВАЯ ПАНЕЛЬ: импортированные потери (для информации) ---
    let rightHtml = '<div style="max-height:400px;overflow-y:auto;">';
    if (reports && reports.length > 0) {
        rightHtml += '<table style="width:100%; border-collapse:collapse;">';
        rightHtml += '<thead><tr><th>Армия (ID)</th><th>Отряд</th><th>💀 Убито</th><th>❤️ Ранено</th><th>👥 Осталось</th></tr></thead><tbody>';
        for (let report of reports) {
            const armyName = report.armyName || '—';
            const armyIdShort = (report.armyId || '?').substring(0,8);
            if (!report.units) continue;
            for (let ru of report.units) {
                rightHtml += `
                    <tr>
                        <td>${escapeHtml(armyName)} (${armyIdShort}…)</td>
                        <td>${escapeHtml(ru.name || ru.unitKey)}</td>
                        <td>${ru.killed || 0}</td>
                        <td>${ru.wounded || 0}</td>
                        <td>${ru.remaining || 0}</td>
                    </tr>`;
            }
        }
        rightHtml += '</tbody></table>';
    } else {
        rightHtml += '<div style="color:#8a7a5a;">Нет данных</div>';
    }
    rightHtml += '</div>';

    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:1100px;width:95%;color:#e6ddb3;display:flex;gap:20px;">
            <div style="flex:1; border-right:1px solid #b87c4f; padding-right:15px; overflow-x:auto;">
                <h3 style="color:#ffd966;">🛡️ Ваши отряды (редактируемые потери)</h3>
                ${leftHtml}
            </div>
            <div style="flex:1; padding-left:15px; overflow-x:auto;">
                <h3 style="color:#ffd966;">⚔️ Импортированный отчёт</h3>
                ${rightHtml}
            </div>
        </div>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:20px;">
            <button id="applyBattleBtn" style="background:#3a6b3a; padding:8px 20px;">✅ Применить потери</button>
            <button id="cancelBattleImportBtn" style="background:#7a2a2a; padding:8px 20px;">Отмена</button>
        </div>
    `;
    document.body.appendChild(modal);

    // --- ФУНКЦИЯ ПЕРЕСЧЁТА ОСТАТКА (остаётся) ---
    window.updateLeftRemaining = function(fieldId) {
        for (let army of factionArmies) {
            for (let unit of army.units) {
                const currentFieldId = safeId(army.id + '_' + unit.unitKey);
                if (currentFieldId === fieldId) {
                    const killed = parseInt(document.getElementById(`left_killed_${fieldId}`)?.value) || 0;
                    const wounded = parseInt(document.getElementById(`left_wounded_${fieldId}`)?.value) || 0;
                    const remaining = Math.max(0, unit.count - killed - wounded);
                    const remainingSpan = document.getElementById(`left_remaining_${fieldId}`);
                    if (remainingSpan) remainingSpan.textContent = remaining;
                    return;
                }
            }
        }
    };

    // --- АВТОМАТИЧЕСКОЕ ЗАПОЛНЕНИЕ ПОТЕРЬ ИЗ ОТЧЁТА ---
    if (reports) {
        for (let report of reports) {
            const army = factionArmies.find(a => a.id === report.armyId);
            if (!army) continue;
            if (!report.units) continue;
            for (let ru of report.units) {
                const unit = army.units.find(u => u.unitKey === ru.unitKey);
                if (!unit) continue;
                const fieldId = safeId(army.id + '_' + unit.unitKey);
                const killedInput = document.getElementById(`left_killed_${fieldId}`);
                const woundedInput = document.getElementById(`left_wounded_${fieldId}`);
                if (killedInput) killedInput.value = ru.killed || 0;
                if (woundedInput) woundedInput.value = ru.wounded || 0;
                updateLeftRemaining(fieldId);
            }
        }
    }

    // --- КНОПКА «ПРИМЕНИТЬ ПОТЕРИ» ---
    document.getElementById('applyBattleBtn').addEventListener('click', () => {
        let anyApplied = false;
        for (let army of factionArmies) {
            for (let unit of army.units) {
                const fieldId = safeId(army.id + '_' + unit.unitKey);
                const killed = parseInt(document.getElementById(`left_killed_${fieldId}`)?.value) || 0;
                const wounded = parseInt(document.getElementById(`left_wounded_${fieldId}`)?.value) || 0;
                if (killed > 0 || wounded > 0) {
                    if (typeof applyUnitCasualties === 'function') {
                        applyUnitCasualties(army, unit, killed, wounded);
                        anyApplied = true;
                    } else {
                        // fallback
                        unit.count -= killed;
                        if (typeof deductPopulation === 'function' && unit.race && unit.gender) {
                            deductPopulation(unit.race, unit.gender, killed);
                        }
                        if (wounded > 0) {
                            unit.count -= wounded;
                            unit.wounded = (unit.wounded || 0) + wounded;
                        }
                    }
                }
            }
        }
        if (anyApplied) {
            if (typeof renderArmy === 'function') renderArmy();
            if (typeof refreshPeopleUI === 'function') refreshPeopleUI();
            if (typeof refreshRecruitmentLimits === 'function') refreshRecruitmentLimits();
            if (typeof saveArmyData === 'function') saveArmyData();
            alert('Потери применены.');
        } else {
            alert('Нет потерь для применения.');
        }
        modal.remove();
    });

    document.getElementById('cancelBattleImportBtn').addEventListener('click', () => modal.remove());
}

function openUnitManualEdit(armyId, unitId) {
    const army = (window.armies || []).find(a => a.id === armyId);
    if (!army) return;
    const unit = army.units.find(u => u.id === unitId);
    if (!unit) return;

    const oldModal = document.getElementById('unitManualEditModal');
    if (oldModal) oldModal.remove();

    const modal = document.createElement('div');
    modal.id = 'unitManualEditModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10000;display:flex;justify-content:center;align-items:center;';

    const currentCount = unit.count;
    const wounded = unit.wounded || 0;
    const race = unit.race;
    const gender = unit.gender || 'male';

    // Определяем полный штатный размер отряда (из базы юнитов)
    const db = window.unitDatabase || {};
    const mercs = window.MERCENARY_UNITS || {};
    const base = db[unit.unitKey] || mercs[unit.unitKey];
    const fullSize = base ? (base.countPerUnit || 100) : 100;

    // Доступный резерв для этой расы и пола
    let availableRecruits = 0;
    if (gender === 'male' && typeof getAvailableMaleRaceRecruits === 'function') {
        availableRecruits = getAvailableMaleRaceRecruits(race);
    } else if (gender === 'female' && typeof getAvailableFemaleRaceRecruits === 'function') {
        availableRecruits = getAvailableFemaleRaceRecruits(race);
    } else if (typeof getAvailableRaceRecruits === 'function') {
        availableRecruits = getAvailableRaceRecruits(race);
    }

    modal.innerHTML = `
        <div style="background:#1f1c14; border:2px solid #b87c4f; border-radius:24px; padding:25px; max-width:500px; width:90%; color:#e6ddb3;">
            <h3 style="color:#ffd966; margin-top:0;">🗡️ Управление отрядом</h3>
            <div style="margin:10px 0;">
                <strong>${escapeHtml(unit.name)}</strong><br>
                <span>👥 Численность: <span id="currentCountDisplay">${currentCount}</span> / ${fullSize}</span><br>
                <span>❤️ Ранено: <span id="woundedDisplay">${wounded}</span></span><br>
                <span>🧬 Раса: ${escapeHtml(race)} | Пол: ${gender}</span><br>
                <span>📊 Свободный резерв: ${availableRecruits}</span>
            </div>
            <hr style="border-color:#b87c4f;">
            <div style="display:flex; justify-content:space-between; gap:10px; margin-top:15px;">
                <div style="flex:1; text-align:center;">
                    <strong>💀 Убить</strong><br>
                    <input type="number" id="killCount" value="0" min="0" max="${currentCount}" style="width:80px;"><br>
                    <button id="killBtn" style="background:#7a2a2a; margin-top:5px;">Применить</button>
                </div>
                <div style="flex:1; text-align:center;">
                    <strong>❤️ Ранить</strong><br>
                    <input type="number" id="woundCount" value="0" min="0" max="${currentCount}" style="width:80px;"><br>
                    <button id="woundBtn" style="background:#b8860b; margin-top:5px;">Применить</button>
                </div>
            </div>
            <div style="text-align:center; margin-top:20px;">
                <button id="reinforceBtn" style="background:#3a6b3a; padding:8px 20px;">📥 Пополнить отряд</button>
            </div>
            <div style="text-align:right; margin-top:20px;">
                <button id="closeManualEditBtn" style="background:#5e3a22;">Закрыть</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // ----- УБИТЬ -----
    document.getElementById('killBtn').addEventListener('click', () => {
        const killAmount = parseInt(document.getElementById('killCount').value) || 0;
        if (killAmount <= 0) return;
        if (killAmount > unit.count) {
            alert('Нельзя убить больше, чем есть в отряде.');
            return;
        }
        unit.count -= killAmount;
        // Вычитаем убитых из населения
        if (typeof deductPopulation === 'function' && unit.race && unit.gender) {
            deductPopulation(unit.race, unit.gender, killAmount);
        }
        if (unit.count <= 0 && (unit.wounded || 0) <= 0) {
            army.units = army.units.filter(u => u.id !== unit.id);
            addGlobalLog(`💀 Отряд "${unit.name}" полностью уничтожен.`, 'army');
        } else {
            addGlobalLog(`💀 Убито ${killAmount} в отряде "${unit.name}".`, 'army');
        }
        finishAndClose();
    });

    // ----- РАНИТЬ -----
    document.getElementById('woundBtn').addEventListener('click', () => {
        const woundAmount = parseInt(document.getElementById('woundCount').value) || 0;
        if (woundAmount <= 0) return;
        if (woundAmount > unit.count) {
            alert('Нельзя ранить больше, чем есть в отряде.');
            return;
        }
        unit.count -= woundAmount;
        unit.wounded = (unit.wounded || 0) + woundAmount;
        addGlobalLog(`❤️ Ранено ${woundAmount} в отряде "${unit.name}".`, 'army');
        finishAndClose();
    });

    // ----- ПОПОЛНИТЬ -----
	document.getElementById('reinforceBtn').addEventListener('click', () => {
		const deficit = fullSize - unit.count;
		if (deficit <= 0) {
			alert('Отряд полностью укомплектован.');
			return;
		}

		// Пересчитываем доступный резерв
		let reserveAvailable = 0;
		if (gender === 'male' && typeof getAvailableMaleRaceRecruits === 'function') {
			reserveAvailable = getAvailableMaleRaceRecruits(race);
		} else if (gender === 'female' && typeof getAvailableFemaleRaceRecruits === 'function') {
			reserveAvailable = getAvailableFemaleRaceRecruits(race);
		} else if (typeof getAvailableRaceRecruits === 'function') {
			reserveAvailable = getAvailableRaceRecruits(race);
		}

		if (deficit > reserveAvailable) {
			alert(`Недостаточно резерва. Требуется ${deficit}, доступно ${reserveAvailable}.`);
			return;
		}

		const costPerSoldier = 2;
		const totalCost = deficit * costPerSoldier;

		// Показываем красивое окно подтверждения
		showCustomConfirm(
			`Пополнить отряд на <strong>${deficit}</strong> чел.<br>Стоимость: <strong style="color:#ffd966;">${totalCost}</strong> эрсов (по ${costPerSoldier} эрса за бойца).`,
			() => {
				// Проверяем, хватает ли денег
				const treasury = (typeof getCurrentTreasury === 'function') ? getCurrentTreasury() : window.factionTreasury || 0;
				if (treasury < totalCost) {
					alert(`Недостаточно средств! Нужно ${totalCost} эрсов, в казне ${treasury}.`);
					return;
				}

				// Списываем деньги
				if (typeof deductTreasury === 'function') {
					deductTreasury(totalCost);
				} else {
					window.factionTreasury -= totalCost;
				}

				// Пополняем отряд
				unit.count += deficit;
				addGlobalLog(`📥 Отряд "${unit.name}" пополнен на ${deficit} чел. (стоимость: ${totalCost} эрсов).`, 'army');
				finishAndClose();
			},
			null  // отмена – просто закрываем окно
		);
	});

    document.getElementById('closeManualEditBtn').addEventListener('click', () => {
        modal.remove();
    });

    function finishAndClose() {
        saveArmyData();
        if (typeof renderArmy === 'function') renderArmy();
        if (typeof refreshPeopleUI === 'function') refreshPeopleUI();
        if (typeof refreshRecruitmentLimits === 'function') refreshRecruitmentLimits();
        modal.remove();
    }
}
function openBattleModal(armyId) {
    const army = (window.armies || []).find(a => a.id === armyId);
    if (!army) return;
    if (!army.units || army.units.length === 0) {
        alert('В армии нет отрядов.');
        return;
    }

    const oldModal = document.getElementById('battleModal');
    if (oldModal) oldModal.remove();

    const modal = document.createElement('div');
    modal.id = 'battleModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10000;display:flex;justify-content:center;align-items:center;';

    // Строим таблицу отрядов
    let unitsHtml = '<table style="width:100%; border-collapse:collapse;">';
    unitsHtml += '<thead><tr><th>Отряд</th><th>👥 Сейчас</th><th>💀 Убито</th><th>❤️ Ранено</th><th>👥 Останется</th></tr></thead><tbody>';

    for (let unit of army.units) {
        // Уникальный ID на основе id отряда (всегда уникален)
        const fieldId = `battle_${army.id}_${unit.id}`;
        unitsHtml += `
            <tr>
                <td>${escapeHtml(unit.name)}</td>
                <td>${unit.count}</td>
                <td><input type="number" id="${fieldId}_killed" value="0" min="0" max="${unit.count}" style="width:70px" onchange="updateBattleRemaining('${fieldId}')"></td>
                <td><input type="number" id="${fieldId}_wounded" value="0" min="0" max="${unit.count}" style="width:70px" onchange="updateBattleRemaining('${fieldId}')"></td>
                <td><span id="${fieldId}_remaining">${unit.count}</span></td>
            </tr>`;
    }
    unitsHtml += '</tbody></table>';

    modal.innerHTML = `
        <div style="background:#1f1c14; border:2px solid #b87c4f; border-radius:24px; padding:25px; max-width:800px; width:95%; color:#e6ddb3;">
            <h3 style="color:#ffd966; margin-top:0;">⚔️ Битва — ${escapeHtml(army.name)}</h3>
            <div style="max-height:400px; overflow-y:auto; margin-bottom:15px;">
                ${unitsHtml}
            </div>
            <div style="display:flex; gap:10px; justify-content:center;">
                <button id="applyBattleCasualtiesBtn" style="background:#3a6b3a; padding:8px 20px;">✅ Применить потери</button>
                <button id="closeBattleModalBtn" style="background:#7a2a2a; padding:8px 20px;">Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Функция пересчёта остатка
    window.updateBattleRemaining = function(fieldId) {
        // Ищем отряд по fieldId, который содержит unit.id
        for (let unit of army.units) {
            const currentFieldId = `battle_${army.id}_${unit.id}`;
            if (currentFieldId === fieldId) {
                const killed = parseInt(document.getElementById(`${fieldId}_killed`)?.value) || 0;
                const wounded = parseInt(document.getElementById(`${fieldId}_wounded`)?.value) || 0;
                const remaining = Math.max(0, unit.count - killed - wounded);
                const remainingSpan = document.getElementById(`${fieldId}_remaining`);
                if (remainingSpan) remainingSpan.textContent = remaining;
                return;
            }
        }
    };

    // Применить потери
    document.getElementById('applyBattleCasualtiesBtn').addEventListener('click', () => {
        let anyApplied = false;
        for (let unit of army.units) {
            const fieldId = `battle_${army.id}_${unit.id}`;
            const killed = parseInt(document.getElementById(`${fieldId}_killed`)?.value) || 0;
            const wounded = parseInt(document.getElementById(`${fieldId}_wounded`)?.value) || 0;
            if (killed > 0 || wounded > 0) {
                if (typeof applyUnitCasualties === 'function') {
                    applyUnitCasualties(army, unit, killed, wounded);
                    anyApplied = true;
                } else {
                    // fallback
                    unit.count -= killed;
                    if (typeof deductPopulation === 'function' && unit.race && unit.gender) {
                        deductPopulation(unit.race, unit.gender, killed);
                    }
                    if (wounded > 0) {
                        unit.count -= wounded;
                        unit.wounded = (unit.wounded || 0) + wounded;
                    }
                }
            }
        }
        if (anyApplied) {
            if (typeof renderArmy === 'function') renderArmy();
            if (typeof refreshPeopleUI === 'function') refreshPeopleUI();
            if (typeof refreshRecruitmentLimits === 'function') refreshRecruitmentLimits();
            if (typeof saveArmyData === 'function') saveArmyData();
            alert('Потери применены.');
        } else {
            alert('Нет потерь для применения.');
        }
        modal.remove();
    });

    document.getElementById('closeBattleModalBtn').addEventListener('click', () => modal.remove());
}

function reinforceArmy(armyId) {
    const army = (window.armies || []).find(a => a.id === armyId);
    if (!army) return;
    if (!army.units || army.units.length === 0) {
        alert('В армии нет отрядов.');
        return;
    }

    const db = window.unitDatabase || {};
    const mercs = window.MERCENARY_UNITS || {};
    let totalDeficit = 0;
    const details = []; // массив строк для отображения в окне

    for (let unit of army.units) {
        const base = db[unit.unitKey] || mercs[unit.unitKey];
        const fullSize = base ? (base.countPerUnit || 100) : 100;
        const deficit = Math.max(0, fullSize - unit.count);
        if (deficit > 0) {
            // Проверяем резерв
            const gender = unit.gender || 'male';
            const race = unit.race;
            let reserveAvailable = 0;
            if (gender === 'male' && typeof getAvailableMaleRaceRecruits === 'function') {
                reserveAvailable = getAvailableMaleRaceRecruits(race);
            } else if (gender === 'female' && typeof getAvailableFemaleRaceRecruits === 'function') {
                reserveAvailable = getAvailableFemaleRaceRecruits(race);
            } else if (typeof getAvailableRaceRecruits === 'function') {
                reserveAvailable = getAvailableRaceRecruits(race);
            }
            const actualDeficit = Math.min(deficit, reserveAvailable);
            if (actualDeficit > 0) {
                totalDeficit += actualDeficit;
                details.push(`${unit.name}: +${actualDeficit} чел. (доступно: ${reserveAvailable})`);
            }
        }
    }

    if (totalDeficit === 0) {
        alert('Все отряды полностью укомплектованы.');
        return;
    }

    const costPerSoldier = 2;
    const totalCost = totalDeficit * costPerSoldier;

    showCustomConfirm(
        `Пополнить армию <strong>${escapeHtml(army.name)}</strong> на <strong>${totalDeficit}</strong> чел.<br>Стоимость: <strong style="color:#ffd966;">${totalCost}</strong> эрсов (по ${costPerSoldier} эрса за бойца).<br><br>Детали:<br>${details.join('<br>')}`,
        () => {
            const treasury = (typeof getCurrentTreasury === 'function') ? getCurrentTreasury() : window.factionTreasury || 0;
            if (treasury < totalCost) {
                alert(`Недостаточно средств! Нужно ${totalCost} эрсов, в казне ${treasury}.`);
                return;
            }

            // Списываем деньги
            if (typeof deductTreasury === 'function') {
                deductTreasury(totalCost);
            } else {
                window.factionTreasury -= totalCost;
            }

            // Пополняем отряды
            for (let unit of army.units) {
                const base = db[unit.unitKey] || mercs[unit.unitKey];
                const fullSize = base ? (base.countPerUnit || 100) : 100;
                const deficit = Math.max(0, fullSize - unit.count);
                if (deficit > 0) {
                    const gender = unit.gender || 'male';
                    const race = unit.race;
                    let reserveAvailable = 0;
                    if (gender === 'male' && typeof getAvailableMaleRaceRecruits === 'function') {
                        reserveAvailable = getAvailableMaleRaceRecruits(race);
                    } else if (gender === 'female' && typeof getAvailableFemaleRaceRecruits === 'function') {
                        reserveAvailable = getAvailableFemaleRaceRecruits(race);
                    } else if (typeof getAvailableRaceRecruits === 'function') {
                        reserveAvailable = getAvailableRaceRecruits(race);
                    }
                    const actualDeficit = Math.min(deficit, reserveAvailable);
                    if (actualDeficit > 0) {
                        unit.count += actualDeficit;
                        addGlobalLog(`📥 Отряд "${unit.name}" пополнен на ${actualDeficit} чел.`, 'army');
                    }
                }
            }
            saveArmyData();
            if (typeof renderArmy === 'function') renderArmy();
            if (typeof refreshPeopleUI === 'function') refreshPeopleUI();
            if (typeof refreshRecruitmentLimits === 'function') refreshRecruitmentLimits();
        },
        null
    );
}


// ---------- ИНИЦИАЛИЗАЦИЯ ----------
function initArmyUI() {
    document.getElementById('newArmyBtn')?.addEventListener('click', () => {
        const name = prompt('Введите название армии:', `Армия ${(window.armies || []).length + 1}`);
        if (name && typeof createNewArmy === 'function') {
            createNewArmy(name);
            if (typeof renderArmy === 'function') renderArmy();
        }
    });

    document.getElementById('clearAllArmiesBtn')?.addEventListener('click', () => {
        if (confirm('Расформировать все армии?')) {
            window.armies = (window.armies || []).filter(a => a.factionId !== window.currentFaction);
            if (typeof renderArmy === 'function') renderArmy();
        }
    });

    // Привязка фильтров юнитов к перерисовке
    const filterType = document.getElementById('filterType');
    const filterRace = document.getElementById('filterRace');
    const filterSpecial = document.getElementById('filterSpecial');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');

    if (filterType) filterType.addEventListener('change', () => { if (typeof renderAvailableUnits === 'function') renderAvailableUnits(); });
    if (filterRace) filterRace.addEventListener('change', () => { if (typeof renderAvailableUnits === 'function') renderAvailableUnits(); });
    if (filterSpecial) filterSpecial.addEventListener('change', () => { if (typeof renderAvailableUnits === 'function') renderAvailableUnits(); });
    if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', () => {
        if (typeof resetFilters === 'function') resetFilters();
        if (typeof renderAvailableUnits === 'function') renderAvailableUnits();
    });

    if (typeof renderArmy === 'function') renderArmy();
    if (typeof renderAvailableUnits === 'function') renderAvailableUnits();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initArmyUI);
} else {
    initArmyUI();
}
function showCustomConfirm(message, onConfirm, onCancel) {
    const oldModal = document.getElementById('customConfirmModal');
    if (oldModal) oldModal.remove();

    const modal = document.createElement('div');
    modal.id = 'customConfirmModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10001;display:flex;justify-content:center;align-items:center;';

    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:450px;width:90%;color:#e6ddb3;text-align:center;">
            <h3 style="color:#ffd966;margin-top:0;">💰 Пополнение отряда</h3>
            <p style="margin:15px 0;">${message}</p>
            <div style="display:flex;gap:10px;justify-content:center;margin-top:20px;">
                <button id="customConfirmYes" style="background:#3a6b3a;padding:8px 20px;">✅ Пополнить</button>
                <button id="customConfirmNo" style="background:#7a2a2a;padding:8px 20px;">❌ Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('customConfirmYes').addEventListener('click', () => {
        modal.remove();
        if (onConfirm) onConfirm();
    });
    document.getElementById('customConfirmNo').addEventListener('click', () => {
        modal.remove();
        if (onCancel) onCancel();
    });
}
// Экспорт
window.reinforceArmy = reinforceArmy;
window.renderArmy = renderArmy;
window.renderAvailableUnits = renderAvailableUnits;
window.initArmyUI = initArmyUI;
window.openUnitDetailModal = openUnitDetailModal;
window.openEditArmyModal = openEditArmyModal;
window.resetFilters = resetFilters;
window.exportAllArmies = exportAllArmies;
window.openBattleImportDialog = openBattleImportDialog;
window.openUnitManualEdit = openUnitManualEdit;
window.openBattleModal = openBattleModal;
console.log("✅ army_ui.js загружен — версия 20.0 (диалог импорта битвы, метки раненых)");