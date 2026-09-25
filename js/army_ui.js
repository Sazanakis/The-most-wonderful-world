// ============================================================================
// МОДУЛЬ: army_ui.js (версия 20.0 – диалог импорта битвы, метки раненых)
// ============================================================================
// ===== загружено на гитхаб 26.09.26
// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ВИЗУАЛА ==========

/**
 * Возвращает HTML мини-бара характеристики
 */
function _renderStatBar(icon, value, maxValue, color) {
    const pct = Math.max(0, Math.min(100, (value / maxValue) * 100));
    return `
        <div class="unit-stat-row" title="${icon} ${value} / ${maxValue}">
            <span class="stat-icon">${icon}</span>
            <div class="stat-track"><div class="stat-fill" style="width:${pct}%;background:${color};"></div></div>
            <span class="stat-num">${value}</span>
        </div>`;
}

/**
 * Возвращает цвета полосок в зависимости от значения
 */
function _statColor(value, max) {
    const pct = value / max;
    if (pct >= 0.7) return '#8bc34a';
    if (pct >= 0.4) return '#ffd966';
    return '#ff6b6b';
}

/**
 * Безопасное получение иконки юнита
 */
function _getUnitIcon(iconPath) {
    if (!iconPath) return null;
    if (typeof getUnitIconPath === 'function') return getUnitIconPath(iconPath);
    if (iconPath.startsWith('icons/') || iconPath.startsWith('http') || iconPath.startsWith('data:')) return iconPath;
    return 'icons/' + iconPath;
}

/**
 * Рендер панели сводки по всем армиям
 */
function renderArmySummary() {
    const container = document.getElementById('armySummaryPanel');
    if (!container) return;
    const factionArmies = (window.armies || []).filter(a => a.factionId === window.currentFaction);
    if (factionArmies.length === 0) {
        container.innerHTML = '';
        return;
    }
    let totalSoldiers = 0;
    let totalWounded = 0;
    let totalUpkeep = 0;
    let totalUnitsCount = 0;
    let queueCount = 0;
    for (let army of factionArmies) {
        for (let u of army.units) {
            totalSoldiers += u.count || 0;
            totalWounded += u.wounded || 0;
            totalUpkeep += (u.upkeep || 0) * (u.count || 0);
            totalUnitsCount += 1;
        }
        queueCount += (army.recruitmentQueue || []).length;
    }
    const healthy = totalSoldiers;
    const all = totalSoldiers + totalWounded;
    const readiness = all > 0 ? Math.round((healthy / all) * 100) : 0;
    const treasury = (typeof getCurrentTreasury === 'function') ? getCurrentTreasury() : 0;
    const netAfterUpkeep = treasury - totalUpkeep;
    const readinessClass = readiness >= 90 ? 'good' : (readiness >= 70 ? 'warn' : 'bad');
    const upkeepClass = netAfterUpkeep >= 0 ? 'good' : 'bad';

    container.innerHTML = `
        <div class="army-summary-panel">
            <div class="army-summary-row">
                <div class="army-summary-item">
                    <span class="army-summary-label">⚔️ Армий</span>
                    <span class="army-summary-value">${factionArmies.length}</span>
                </div>
                <div class="army-summary-item">
                    <span class="army-summary-label">👥 Войск</span>
                    <span class="army-summary-value">${totalSoldiers.toLocaleString()}</span>
                </div>
                <div class="army-summary-item">
                    <span class="army-summary-label">❤️‍🩹 Ранено</span>
                    <span class="army-summary-value ${totalWounded > 0 ? 'bad' : ''}">${totalWounded.toLocaleString()}</span>
                </div>
                <div class="army-summary-item">
                    <span class="army-summary-label">📊 Готовность</span>
                    <span class="army-summary-value ${readinessClass}">${readiness}%</span>
                </div>
                <div class="army-summary-item">
                    <span class="army-summary-label">⏳ В найме</span>
                    <span class="army-summary-value ${queueCount > 0 ? 'warn' : ''}">${queueCount}</span>
                </div>
                <div class="army-summary-item">
                    <span class="army-summary-label">💰 Содержание</span>
                    <span class="army-summary-value ${upkeepClass}">${Math.round(totalUpkeep).toLocaleString()}</span>
                </div>
            </div>
        </div>`;
}
window.renderArmySummary = renderArmySummary;
function renderArmy() {
    const container = document.getElementById('armiesContainer');
    if (!container) return;

    const filteredArmies = (window.armies || []).filter(a => a.factionId === window.currentFaction);

    // Рисуем сводку
    if (typeof renderArmySummary === 'function') renderArmySummary();

    if (filteredArmies.length === 0) {
        container.innerHTML = `
            <div class="army-empty">
                ⚔️ Нет армий.<br>
                <span style="font-size:0.85rem;">Создайте первую армию, нажав «➕ Новая армия».</span>
            </div>`;
        return;
    }

    container.innerHTML = '';
    for (let army of filteredArmies) {
        // --- Вычисления ---
        let garrisonBonus = 0;
        if (army.garrison && typeof getGarrisonDefenseBonus === 'function') {
            garrisonBonus = getGarrisonDefenseBonus(army.garrison);
        }

        let totalUnits = 0;
        let totalWounded = 0;
        let totalFullSize = 0;
        let totalUpkeep = 0;
        let totalQueued = army.recruitmentQueue ? army.recruitmentQueue.length : 0;

        for (let unit of army.units) {
            totalUnits += 1;
            const wounded = unit.wounded || 0;
            const count = unit.count || 0;
            totalWounded += wounded;
            totalFullSize += count + wounded;
            totalUpkeep += (unit.upkeep || 0) * count;
        }

        const healthy = totalFullSize - totalWounded;
        const readiness = totalFullSize > 0 ? Math.round((healthy / totalFullSize) * 100) : 0;
        const readinessColor = readiness >= 90 ? '#8bc34a' : (readiness >= 70 ? '#ffd966' : '#ff6b6b');

        let garrisonName = 'Вне гарнизона';
        if (army.garrison && typeof SETTLEMENTS_DB !== 'undefined' && SETTLEMENTS_DB[army.garrison]) {
            garrisonName = SETTLEMENTS_DB[army.garrison].name;
        }

        const storageKey = `armyCollapsed_${army.id}`;
        let collapsed = localStorage.getItem(storageKey) === 'true';
        const isSelected = (window.lastSelectedArmyId === army.id);

        // --- Карточка ---
        const card = document.createElement('div');
        card.className = 'army-card' + (isSelected ? ' is-selected' : '');
        card.setAttribute('data-army-id', army.id);

        // --- Шапка ---
        const header = document.createElement('div');
        header.className = 'army-card-header';

        const titleBlock = document.createElement('div');
        titleBlock.className = 'army-title-block';
        titleBlock.innerHTML = `
            <div class="army-banner">🛡️</div>
            <div class="army-title-info">
                <div class="army-title-name" title="${escapeHtml(army.name)}">${escapeHtml(army.name)}</div>
                <div class="army-title-meta">
                    <span class="meta-item">👑 ${escapeHtml(army.commander || 'Не назначен')}</span>
                    <span class="meta-item">📍 ${escapeHtml(garrisonName)}</span>
                </div>
            </div>
        `;

        // Пилюли статов
        const pills = document.createElement('div');
        pills.className = 'army-stats-pills';
        pills.innerHTML = `
            <span class="stat-pill" title="Всего солдат (здоровые + раненые)">👥 <strong>${totalFullSize}</strong></span>
            <span class="stat-pill ${totalWounded > 0 ? 'pill-bad' : ''}" title="Раненые">❤️‍🩹 <strong>${totalWounded}</strong></span>
            <span class="stat-pill" title="Количество отрядов">⚔️ <strong>${totalUnits}</strong></span>
            <span class="stat-pill" title="Содержание за ход">💰 <strong>${Math.round(totalUpkeep)}</strong></span>
            <span class="stat-pill ${readiness >= 90 ? 'pill-good' : (readiness >= 70 ? 'pill-warn' : 'pill-bad')}" title="Укомплектованность">📊 <strong>${readiness}%</strong></span>
            ${garrisonBonus > 0 ? `<span class="stat-pill pill-good" title="Бонус защиты от гарнизона">🛡️ <strong>+${garrisonBonus}</strong></span>` : ''}
            ${totalQueued > 0 ? `<span class="stat-pill pill-warn" title="Отрядов в очереди найма">⏳ <strong>${totalQueued}</strong></span>` : ''}
        `;

        // Прогресс-бар готовности
        const readinessBar = document.createElement('div');
        readinessBar.className = 'readiness-bar';
        readinessBar.innerHTML = `<div class="readiness-fill" style="width:${readiness}%;background:${readinessColor};"></div>`;

        // Кнопки действий
        const actions = document.createElement('div');
        actions.className = 'army-actions';

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'icon-btn toggle-btn';
        toggleBtn.textContent = collapsed ? '▶' : '▼';
        toggleBtn.title = collapsed ? 'Развернуть' : 'Свернуть';

        // Кнопки в одном месте
        const btnEdit = _makeIconButton('✏️', 'Редактировать', () => openEditArmyModal(army.id));
        const btnSplit = _makeIconButton('✂️', 'Разделить армию', () => openSplitArmyModal(army.id));
        const btnMerge = _makeIconButton('🔗', 'Объединить', () => openMergeArmyModal(army.id));
        const btnSelect = _makeIconButton('🛒', 'Найм войск', () => {
			if (typeof openRecruitPanel === 'function') openRecruitPanel(army.id);
		});
        const btnBattle = _makeIconButton('⚔️', 'Битва', () => openBattleModal(army.id));
        const btnReinforce = _makeIconButton('🚹', 'Пополнить', () => reinforceArmy(army.id));
        const btnRemoveGarrison = _makeIconButton('🏕️', 'Снять с гарнизона', () => {
            if (confirm('Снять армию с гарнизона?')) window.updateArmyInfo(army.id, { garrison: null });
        });
        const btnDelete = _makeIconButton('🗑️', 'Удалить армию', () => window.deleteArmy(army.id), true);

        actions.append(toggleBtn, btnSelect, btnEdit, btnSplit, btnMerge, btnBattle, btnReinforce, btnRemoveGarrison, btnDelete);

        header.append(titleBlock, pills, readinessBar, actions);

        // --- Тело ---
        const body = document.createElement('div');
        body.className = 'army-card-body';
        if (collapsed) body.style.display = 'none';

        // Отряды
        if (army.units.length > 0) {
            const grid = document.createElement('div');
            grid.className = 'units-grid';
            for (let unit of army.units) {
                grid.appendChild(_buildUnitTile(unit, army));
            }
            body.appendChild(grid);
        } else {
            const empty = document.createElement('div');
            empty.style.cssText = 'color:#8a7a5a;font-size:0.85rem;text-align:center;padding:12px;';
            empty.textContent = 'Нет отрядов в этой армии';
            body.appendChild(empty);
        }

        // Очередь найма
        if (army.recruitmentQueue && army.recruitmentQueue.length > 0) {
            const queueWrap = document.createElement('div');
            queueWrap.style.cssText = 'margin-top:14px;padding-top:12px;border-top:1px dashed rgba(184,124,79,0.4);';
            queueWrap.innerHTML = `<div style="font-size:0.8rem;color:#ffd966;margin-bottom:8px;">⏳ Очередь найма (${army.recruitmentQueue.length})</div>`;
            const qGrid = document.createElement('div');
            qGrid.className = 'units-grid';
            for (let q of army.recruitmentQueue) {
                qGrid.appendChild(_buildQueueTile(q, army));
            }
            queueWrap.appendChild(qGrid);
            body.appendChild(queueWrap);
        }

        card.appendChild(header);
        card.appendChild(body);
        container.appendChild(card);

        // Сворачивание
        header.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            _toggleArmyCard(army.id, body, toggleBtn);
        });
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            _toggleArmyCard(army.id, body, toggleBtn);
        });
    }

    // Обновляем казну/содержание
    const treasuryEl = document.getElementById('armyTreasury');
    if (treasuryEl) {
        treasuryEl.textContent = (typeof getCurrentTreasury === 'function' ? getCurrentTreasury() : 0).toLocaleString();
    }
    const upkeepEl = document.getElementById('globalUpkeep');
    if (upkeepEl) {
        upkeepEl.textContent = (typeof calculateTotalUpkeep === 'function' ? calculateTotalUpkeep() : 0).toLocaleString();
    }
}

// === Служебные помощники ===

function _makeIconButton(label, title, onClick, isDanger = false) {
    const b = document.createElement('button');
    b.className = 'icon-btn' + (isDanger ? ' danger' : '');
    b.textContent = label;
    b.title = title;
    b.addEventListener('click', (e) => {
        e.stopPropagation();
        onClick();
    });
    return b;
}

function _toggleArmyCard(armyId, body, toggleBtn) {
    const isCollapsed = body.style.display === 'none';
    body.style.display = isCollapsed ? '' : 'none';
    toggleBtn.textContent = isCollapsed ? '▼' : '▶';
    toggleBtn.title = isCollapsed ? 'Свернуть' : 'Развернуть';
    localStorage.setItem(`armyCollapsed_${armyId}`, String(!isCollapsed));
}

/**
 * Строит плитку отряда внутри армии
 */
function _buildUnitTile(unit, army) {
    const tile = document.createElement('div');
    tile.className = 'unit-tile';

    // Итоговые характеристики
    const stats = (typeof getUnitEffectiveStats === 'function') ? getUnitEffectiveStats(unit, army) : null;
    const atk = stats ? stats.strengthMelee : (unit.strengthMelee || unit.strength || 0);
    const def = stats ? stats.defense : (unit.defense || 0);
    const mor = stats ? stats.morale : (unit.morale || 0);

    const iconPath = _getUnitIcon(unit.icon);
    const iconHtml = iconPath
        ? `<img src="${iconPath}" alt="">`
        : '<span style="font-size:2rem;">⚔️</span>';

    const woundedBadge = (unit.wounded && unit.wounded > 0)
        ? `<div class="unit-tile-wounded" title="Раненые: ${unit.wounded}">❤️‍🩹 ${unit.wounded}</div>`
        : '';

    tile.innerHTML = `
        <div class="unit-tile-icon-wrap">
            ${iconHtml}
            ${woundedBadge}
        </div>
        <div class="unit-tile-name" title="${escapeHtml(unit.name)}">${escapeHtml(unit.name)}</div>
        <div class="unit-tile-count">👥 <strong>${unit.count}</strong></div>
        <div class="unit-stat-bars">
            ${_renderStatBar('⚔️', atk, 20, _statColor(atk, 20))}
            ${_renderStatBar('🛡️', def, 20, _statColor(def, 20))}
            ${_renderStatBar('❤️', mor, 20, _statColor(mor, 20))}
        </div>
        <div class="unit-tile-actions">
            <button title="Подробнее" data-action="detail">🔍</button>
            <button title="Редактировать" data-action="edit">🗡️</button>
            <button title="Переместить в другую армию" data-action="move">🔄</button>
            <button title="Удалить отряд" data-action="remove" style="background:rgba(122,42,42,0.5);">✖</button>
        </div>
    `;

    tile.querySelector('[data-action="detail"]').onclick = (e) => {
        e.stopPropagation();
        if (typeof openUnitDetailModalWithArmy === 'function') {
            openUnitDetailModalWithArmy(unit.unitKey, army.id);
        } else if (typeof openUnitDetailModal === 'function') {
            const db = window.unitDatabase || {};
            const mercs = window.MERCENARY_UNITS || {};
            const base = db[unit.unitKey] || mercs[unit.unitKey];
            if (base) openUnitDetailModal(base, army);
        }
    };
    tile.querySelector('[data-action="edit"]').onclick = (e) => {
        e.stopPropagation();
        if (typeof openUnitManualEdit === 'function') openUnitManualEdit(army.id, unit.id);
    };
    tile.querySelector('[data-action="move"]').onclick = (e) => {
        e.stopPropagation();
        if (typeof openMoveUnitModal === 'function') openMoveUnitModal(unit.id, army.id);
    };
    tile.querySelector('[data-action="remove"]').onclick = (e) => {
        e.stopPropagation();
        if (confirm(`Удалить отряд "${unit.name}"?`)) {
            if (typeof window.removeUnitFromArmy === 'function') {
                window.removeUnitFromArmy(army.id, unit.id);
            }
        }
    };
    return tile;
}

/**
 * Строит плитку отряда из очереди найма
 */
function _buildQueueTile(q, army) {
    const tile = document.createElement('div');
    tile.className = 'unit-tile queue-tile';

    const db = window.unitDatabase || {};
    const mercs = window.MERCENARY_UNITS || {};
    const base = db[q.unitKey] || mercs[q.unitKey];
    const unitName = base ? base.name : q.unitKey;
    const iconPath = base ? _getUnitIcon(base.icon) : null;
    const iconHtml = iconPath
        ? `<img src="${iconPath}" alt="">`
        : '<span style="font-size:2rem;">⏳</span>';

    const totalTime = (base && base.hireTime) ? base.hireTime : 1;
    const progress = totalTime > 0 ? Math.max(0, Math.min(100, ((totalTime - q.remainingTurns) / totalTime) * 100)) : 0;

    tile.innerHTML = `
        <div class="unit-tile-icon-wrap">${iconHtml}</div>
        <div class="unit-tile-name">${escapeHtml(unitName)}</div>
        <div class="unit-tile-count">⏱️ Осталось: <strong>${q.remainingTurns}</strong></div>
        <div class="queue-progress"><div class="queue-progress-fill" style="width:${progress}%;"></div></div>
        <div class="unit-tile-actions">
            <button title="Отменить найм" data-action="cancel" style="background:rgba(122,42,42,0.6);">✖</button>
        </div>
    `;
    tile.querySelector('[data-action="cancel"]').onclick = (e) => {
        e.stopPropagation();
        if (typeof window.cancelRecruitment === 'function') {
            window.cancelRecruitment(army.id, q.id);
        }
    };
    return tile;
}

// Вспомогательная функция для создания кнопок
function createButton(label, title, onClick, danger = false) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.style.cssText = `padding:4px 10px; font-size:0.7rem; background:${danger ? '#7a2a2a' : '#3a5a2a'}; border:1px solid #b87c4f; border-radius:4px; color:#d4c9b8; cursor:pointer;`;
    btn.title = title;
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        onClick();
    });
    return btn;
}

// Функция сворачивания/разворачивания
function toggleArmy(armyId, card, toggleBtn) {
    const body = card.querySelector('.army-body');
    if (!body) return;
    const isCollapsed = body.style.display === 'none';
    body.style.display = isCollapsed ? '' : 'none';
    toggleBtn.textContent = isCollapsed ? '▼' : '▶';
    toggleBtn.title = isCollapsed ? 'Свернуть армию' : 'Развернуть армию';
    localStorage.setItem(`armyCollapsed_${armyId}`, String(!isCollapsed));
}

function openSplitArmyModal(armyId) {
    const army = window.armies.find(a => a.id === armyId);
    if (!army || army.units.length === 0) {
        alert('Нет отрядов для разделения.');
        return;
    }

    let sourceUnits = army.units.map(u => ({ ...u }));
    let targetUnits = [];

    function calcUpkeep(units) {
        let total = 0;
        for (let u of units) {
            total += (u.upkeep || 0) * (u.count || 0);
        }
        return Math.round(total);
    }

    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:20000;display:flex;justify-content:center;align-items:center;';
    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:20px;max-width:900px;width:95%;color:#e6ddb3;max-height:90vh;display:flex;flex-direction:column;">
            <h3 style="color:#ffd966;margin-top:0;">✂️ Разделение армии: ${escapeHtml(army.name)}</h3>
            <div style="display:flex;gap:20px;flex:1;overflow:hidden;min-height:300px;">
                <div style="flex:1;border:1px solid #b87c4f;border-radius:12px;padding:10px;overflow-y:auto;background:rgba(0,0,0,0.3);">
                    <h4 style="color:#ffd966;margin-top:0;">📦 Исходная армия (${sourceUnits.length})</h4>
                    <div id="splitSourceList"></div>
                    <div style="margin-top:10px;font-size:0.9rem;color:#cfc294;">💰 Содержание: <span id="splitSourceUpkeep">${calcUpkeep(sourceUnits)}</span> эрсов/ход</div>
                </div>
                <div style="flex:1;border:1px solid #b87c4f;border-radius:12px;padding:10px;overflow-y:auto;background:rgba(0,0,0,0.3);">
                    <h4 style="color:#ffd966;margin-top:0;">📦 Новая армия (${targetUnits.length})</h4>
                    <div id="splitTargetList"></div>
                    <div style="margin-top:10px;font-size:0.9rem;color:#cfc294;">💰 Содержание: <span id="splitTargetUpkeep">${calcUpkeep(targetUnits)}</span> эрсов/ход</div>
                </div>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:15px;margin-top:15px;border-top:1px solid #b87c4f;padding-top:15px;">
                <div style="width:100%;">
                    <p style="font-size:0.9rem; color:#cfc294; margin-bottom:8px;">⬇️ Введите данные для новой армии</p>
                </div>
                <div style="flex:1;min-width:150px;">
                    <label>📝 Название: <input type="text" id="splitArmyName" value="${escapeHtml(army.name)} (копия)" style="width:100%;background:#2a2418;border:1px solid #b87c4f;color:#f0e6d0;border-radius:4px;padding:4px;"></label>
                </div>
                <div style="flex:1;min-width:150px;">
                    <label>👑 Командир: <input type="text" id="splitArmyCommander" value="Не назначен" style="width:100%;background:#2a2418;border:1px solid #b87c4f;color:#f0e6d0;border-radius:4px;padding:4px;"></label>
                </div>
                <div style="flex:1;min-width:150px;">
                    <label>📍 Гарнизон: <select id="splitArmyGarrison" style="width:100%;background:#2a2418;border:1px solid #b87c4f;color:#f0e6d0;border-radius:4px;padding:4px;"></select></label>
                </div>
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:15px;border-top:1px solid #b87c4f;padding-top:15px;">
                <button id="splitConfirmBtn" style="background:#3a6b3a;padding:8px 20px;">✅ Сформировать</button>
                <button id="splitCancelBtn" style="background:#7a2a2a;padding:8px 20px;">❌ Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const garrisonSelect = document.getElementById('splitArmyGarrison');
    const factionProvinces = (typeof getCurrentFactionProvinces === 'function') ? getCurrentFactionProvinces() : [];
    const settlements = Object.values(SETTLEMENTS_DB)
        .filter(s => factionProvinces.includes(s.province) && (s.type === 'city' || s.type === 'castle' || s.type === 'village'))
        .sort((a,b) => a.name.localeCompare(b.name));
    let options = '<option value="">🏕️ Без гарнизона</option>';
    for (let s of settlements) {
        options += `<option value="${s.id}">${s.name} (${getSettlementTypeLabel(s.type)})</option>`;
    }
    garrisonSelect.innerHTML = options;

    function renderSplitLists() {
        const sourceContainer = document.getElementById('splitSourceList');
        const targetContainer = document.getElementById('splitTargetList');
        sourceContainer.innerHTML = sourceUnits.map((u, i) => `
            <div style="display:flex;justify-content:space-between;align-items:center;background:#2a2418;padding:4px 8px;border-radius:8px;margin-bottom:4px;">
                <span>${escapeHtml(u.name)} (${u.count})</span>
                <button class="move-to-target-btn" data-index="${i}" style="background:#3a5a2a;padding:2px 8px;">➡️</button>
            </div>
        `).join('');
        targetContainer.innerHTML = targetUnits.map((u, i) => `
            <div style="display:flex;justify-content:space-between;align-items:center;background:#2a2418;padding:4px 8px;border-radius:8px;margin-bottom:4px;">
                <span>${escapeHtml(u.name)} (${u.count})</span>
                <button class="move-to-source-btn" data-index="${i}" style="background:#7a2a2a;padding:2px 8px;">⬅️</button>
            </div>
        `).join('');

        document.getElementById('splitSourceUpkeep').textContent = calcUpkeep(sourceUnits);
        document.getElementById('splitTargetUpkeep').textContent = calcUpkeep(targetUnits);
    }

    function attachMoveHandlers() {
        document.querySelectorAll('.move-to-target-btn').forEach(btn => {
            btn.onclick = function() {
                const idx = parseInt(this.dataset.index);
                const unit = sourceUnits.splice(idx, 1)[0];
                if (unit) targetUnits.push(unit);
                renderSplitLists();
                attachMoveHandlers();
            };
        });
        document.querySelectorAll('.move-to-source-btn').forEach(btn => {
            btn.onclick = function() {
                const idx = parseInt(this.dataset.index);
                const unit = targetUnits.splice(idx, 1)[0];
                if (unit) sourceUnits.push(unit);
                renderSplitLists();
                attachMoveHandlers();
            };
        });
    }

    renderSplitLists();
    attachMoveHandlers();

    document.getElementById('splitConfirmBtn').onclick = function() {
        if (targetUnits.length === 0) {
            alert('Переместите хотя бы один отряд в новую армию.');
            return;
        }
        const newName = document.getElementById('splitArmyName').value.trim() || 'Разделённая армия';
        const newCommander = document.getElementById('splitArmyCommander').value.trim() || 'Не назначен';
        const newGarrison = document.getElementById('splitArmyGarrison').value || null;

        army.units = sourceUnits;
        const newArmy = {
            id: generateId(),
            name: newName,
            commander: newCommander,
            garrison: newGarrison,
            units: targetUnits,
            recruitmentQueue: [],
            factionId: window.currentFaction,
            motto: '',
            foundationDate: getCurrentDateString(),
            battleHistory: [],
            reserveRear: []
        };
        window.armies.push(newArmy);
        saveArmyData();
        if (typeof renderArmy === 'function') renderArmy();
        modal.remove();
        addGlobalLog(`✂️ Армия "${army.name}" разделена. Создана "${newArmy.name}" с ${targetUnits.length} отрядами. Содержание новой: ${calcUpkeep(targetUnits)} эрсов/ход.`, 'army');
    };

    document.getElementById('splitCancelBtn').onclick = function() {
        modal.remove();
    };
}

function openMergeArmyModal(armyId) {
    const army = window.armies.find(a => a.id === armyId);
    if (!army) return;

    const otherArmies = window.armies.filter(a => a.id !== armyId && a.factionId === window.currentFaction);
    if (otherArmies.length === 0) {
        alert('Нет других армий для объединения.');
        return;
    }

    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:20000;display:flex;justify-content:center;align-items:center;';
    let optionsHtml = otherArmies.map(a => `<option value="${a.id}">${escapeHtml(a.name)} (👥 ${a.units.reduce((s,u) => s + u.count, 0)})</option>`).join('');
    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:400px;width:90%;color:#e6ddb3;">
            <h3 style="color:#ffd966;">🔗 Объединение армий</h3>
            <p>Выберите армию, с которой объединить <strong>${escapeHtml(army.name)}</strong>:</p>
            <select id="mergeArmySelect" style="width:100%;padding:6px;background:#2a2418;border:1px solid #b87c4f;color:#f0e6d0;border-radius:4px;">${optionsHtml}</select>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px;">
                <button id="mergeConfirmBtn" style="background:#3a6b3a;">✅ Далее</button>
                <button id="mergeCancelBtn" style="background:#7a2a2a;">❌ Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('mergeCancelBtn').onclick = () => modal.remove();
    document.getElementById('mergeConfirmBtn').onclick = function() {
        const secondArmyId = document.getElementById('mergeArmySelect').value;
        const secondArmy = window.armies.find(a => a.id === secondArmyId);
        if (!secondArmy) return;
        modal.remove();
        openMergeSettingsModal(army, secondArmy);
    };
}

function openMergeSettingsModal(army1, army2) {
    function calcUpkeep(units) {
        let total = 0;
        for (let u of units) {
            total += (u.upkeep || 0) * (u.count || 0);
        }
        return Math.round(total);
    }

    const currentUpkeep = calcUpkeep(army1.units);
    const secondUpkeep = calcUpkeep(army2.units);
    const mergedUpkeep = calcUpkeep([...army1.units, ...army2.units]);

    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:20000;display:flex;justify-content:center;align-items:center;';
    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:500px;width:90%;color:#e6ddb3;">
            <h3 style="color:#ffd966;">🔗 Объединение армий</h3>
            <p><strong>${escapeHtml(army1.name)}</strong> (${army1.units.length} отрядов) + <strong>${escapeHtml(army2.name)}</strong> (${army2.units.length} отрядов)</p>
            <p style="font-size:0.9rem; color:#cfc294;">💰 Содержание <strong>${escapeHtml(army1.name)}</strong>: ${currentUpkeep} эрсов/ход</p>
            <p style="font-size:0.9rem; color:#cfc294;">💰 Содержание <strong>${escapeHtml(army2.name)}</strong>: ${secondUpkeep} эрсов/ход</p>
            <p style="font-size:0.9rem; color:#ffd966;">💰 Содержание после объединения: <strong>${mergedUpkeep}</strong> эрсов/ход</p>
            <p style="font-size:0.9rem; color:#cfc294; margin-top:10px;">⬇️ Введите данные для новой объединённой армии</p>
            <div style="margin-top:15px;">
                <label>📝 Название: <input type="text" id="mergeName" value="${escapeHtml(army1.name)}" style="width:100%;background:#2a2418;border:1px solid #b87c4f;color:#f0e6d0;border-radius:4px;padding:4px;"></label>
            </div>
            <div style="margin-top:10px;">
                <label>👑 Командир: <input type="text" id="mergeCommander" value="${escapeHtml(army1.commander || 'Не назначен')}" style="width:100%;background:#2a2418;border:1px solid #b87c4f;color:#f0e6d0;border-radius:4px;padding:4px;"></label>
            </div>
            <div style="margin-top:10px;">
                <label>📍 Гарнизон: <select id="mergeGarrison" style="width:100%;background:#2a2418;border:1px solid #b87c4f;color:#f0e6d0;border-radius:4px;padding:4px;"></select></label>
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px;">
                <button id="mergeFinalBtn" style="background:#3a6b3a;">✅ Объединить</button>
                <button id="mergeFinalCancelBtn" style="background:#7a2a2a;">❌ Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const garrisonSelect = document.getElementById('mergeGarrison');
    const factionProvinces = (typeof getCurrentFactionProvinces === 'function') ? getCurrentFactionProvinces() : [];
    const settlements = Object.values(SETTLEMENTS_DB)
        .filter(s => factionProvinces.includes(s.province) && (s.type === 'city' || s.type === 'castle' || s.type === 'village'))
        .sort((a,b) => a.name.localeCompare(b.name));
    let options = '<option value="">🏕️ Без гарнизона</option>';
    for (let s of settlements) {
        options += `<option value="${s.id}">${s.name} (${getSettlementTypeLabel(s.type)})</option>`;
    }
    garrisonSelect.innerHTML = options;

    document.getElementById('mergeFinalCancelBtn').onclick = () => modal.remove();
    document.getElementById('mergeFinalBtn').onclick = function() {
        const newName = document.getElementById('mergeName').value.trim() || 'Объединённая армия';
        const newCommander = document.getElementById('mergeCommander').value.trim() || 'Не назначен';
        const newGarrison = document.getElementById('mergeGarrison').value || null;

        const mergedUnits = [...army1.units, ...army2.units];

        army1.name = newName;
        army1.commander = newCommander;
        army1.garrison = newGarrison;
        army1.units = mergedUnits;
        army1.recruitmentQueue = [...army1.recruitmentQueue, ...army2.recruitmentQueue];

        window.armies = window.armies.filter(a => a.id !== army2.id);

        saveArmyData();
        if (typeof renderArmy === 'function') renderArmy();
        modal.remove();
        addGlobalLog(`🔗 Армии "${army2.name}" и "${army1.name}" объединены в "${army1.name}". Новое содержание: ${mergedUpkeep} эрсов/ход.`, 'army');
    };
}

function renderAvailableUnits() {
    const container = document.getElementById('recruitUnitsGrid');
    if (!container) {
        console.warn('⚠️ renderAvailableUnits: не найден #recruitUnitsGrid');
        return;
    }

    let units = (typeof getUnitsForCurrentFaction === 'function') ? getUnitsForCurrentFaction() : [];
    if (units.length === 0) {
        container.innerHTML = '<div class="army-empty">Нет доступных юнитов.</div>';
        return;
    }

    // Фильтры
    const filterTypeEl = document.getElementById('filterType');
    const filterRaceEl = document.getElementById('filterRace');
    const filterSpecialEl = document.getElementById('filterSpecial');
    const selectedType = filterTypeEl ? filterTypeEl.value : 'all';
    const selectedRace = filterRaceEl ? filterRaceEl.value : 'all';
    const onlySpecial = filterSpecialEl ? filterSpecialEl.checked : false;

    units = units.filter(unit => {
        if (selectedType !== 'all') {
            const typeLower = selectedType.toLowerCase();
            const unitTypeLower = (unit.troopType || '').toLowerCase();
            if (typeLower === 'кавалерия') { if (!unitTypeLower.includes('кавалерия')) return false; }
            else if (typeLower === 'пехота') { if (!unitTypeLower.includes('пехота')) return false; }
            else { if (unitTypeLower !== typeLower) return false; }
        }
        if (selectedRace !== 'all' && unit.race !== selectedRace) return false;
        if (onlySpecial && (unit.maxCount === null || unit.maxCount === undefined)) return false;
        return true;
    });

    container.className = 'units-shop-grid';
    container.innerHTML = '';
    if (units.length === 0) {
        container.innerHTML = '<div class="army-empty">Нет юнитов, соответствующих фильтрам.</div>';
        return;
    }

    const techBonuses = (typeof getTechBonuses === 'function') ? getTechBonuses() : {};
    const hireCount = parseInt(document.getElementById('hireCountSelect')?.value) || 1;

    for (let unit of units) {
        const card = document.createElement('div');
        card.className = 'unit-shop-card';

        const iconPath = _getUnitIcon(unit.icon);
        const iconHtml = iconPath
            ? `<img src="${iconPath}" alt="">`
            : '<div class="placeholder">⚔️</div>';

        const atk = unit.strengthMelee || unit.strength || 0;
        const rng = unit.strengthRanged || 0;
        const def = unit.defense || 0;
        const mor = unit.morale || 0;

        let hireCost = unit.hireCost || 0;
        let upkeep = unit.upkeep || 0;
        if (unit.key && techBonuses.hireDiscountByUnit && techBonuses.hireDiscountByUnit[unit.key]) {
            const d = techBonuses.hireDiscountByUnit[unit.key];
            hireCost = Math.floor(hireCost * (1 - d / 100));
        }
        if (unit.key && techBonuses.upkeepDiscountByUnit && techBonuses.upkeepDiscountByUnit[unit.key]) {
            const d = techBonuses.upkeepDiscountByUnit[unit.key];
            upkeep = Math.floor(upkeep * (1 - d / 100));
        }

        const totalCost = hireCost * hireCount;

        let badge = '';
        if (unit.maxCount) {
            badge = `<div class="unit-shop-badge">ЛИМИТ: ${unit.maxCount}</div>`;
        } else if (unit.faction && unit.faction === window.currentFaction) {
            badge = `<div class="unit-shop-badge badge-faction">${(typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[unit.faction]) ? FACTION_NAMES[unit.faction].split(' ').pop() : 'ФРАКЦИЯ'}</div>`;
        }

        card.innerHTML = `
            ${badge}
            <div class="unit-shop-icon">${iconHtml}</div>
            <div class="unit-shop-name" title="${escapeHtml(unit.name)}">${escapeHtml(unit.name)}</div>
            <div class="unit-shop-stats">
                ${atk > 0 ? `<span class="unit-shop-stat" title="Атака">⚔️ <strong>${atk}</strong></span>` : ''}
                ${rng > 0 ? `<span class="unit-shop-stat" title="Дальний бой">🏹 <strong>${rng}</strong></span>` : ''}
                ${def > 0 ? `<span class="unit-shop-stat" title="Защита">🛡️ <strong>${def}</strong></span>` : ''}
                ${mor > 0 ? `<span class="unit-shop-stat" title="Мораль">❤️ <strong>${mor}</strong></span>` : ''}
            </div>
            <div class="unit-shop-info">
                <div class="info-row"><span>💰 Найм:</span><strong>${hireCost === 0 ? 'бесплатно' : hireCost + ' эрс'}</strong></div>
                <div class="info-row"><span>⚖️ Содерж.:</span><strong>${upkeep} эрс/ход</strong></div>
                <div class="info-row"><span>👥 Отряд:</span><strong>${unit.countPerUnit || 100} чел.</strong></div>
                <div class="info-row"><span>⏱️ Найм:</span><strong>${unit.hireTime || 1} ход(ов)</strong></div>
            </div>
            <div class="unit-shop-actions">
                <button class="detail-btn" title="Подробнее">🔍</button>
                <button class="hire-btn" title="Нанять ×${hireCount} за ${totalCost} эрс">➕ Нанять${hireCount > 1 ? ` ×${hireCount}` : ''}</button>
            </div>
        `;

        card.querySelector('.detail-btn').onclick = (e) => {
            e.stopPropagation();
            if (typeof openUnitDetailModal === 'function') openUnitDetailModal(unit);
        };
        card.querySelector('.hire-btn').onclick = (e) => {
            e.stopPropagation();
            const armyId = window._recruitPanelArmyId;
            if (!armyId) { alert('Не выбрана армия для найма.'); return; }
            if (typeof addUnitToArmy !== 'function') return;

            // Нанимаем hireCount ОТДЕЛЬНЫХ отрядов по 1 единице
            // Первый вызов — с алертами, последующие — молча (silent=true)
            let hired = 0;
            for (let i = 0; i < hireCount; i++) {
                const ok = addUnitToArmy(armyId, unit.key, 1, i > 0);
                if (!ok) break;
                hired++;
            }

            // Лог о результате
            if (typeof addGlobalLog === 'function') {
                if (hired === 0) {
                    // Ничего не нанято — alert уже показан первым вызовом
                } else if (hired < hireCount) {
                    addGlobalLog(`⚔️ Нанято ${hired} из ${hireCount} отрядов "${unit.name}" (прервано на лимите/казне/резерве).`, 'army');
                } else if (hireCount > 1) {
                    addGlobalLog(`⚔️ Нанято ${hired} отрядов "${unit.name}".`, 'army');
                }
            }

            if (hired > 0) {
                if (typeof renderRecruitPanel === 'function') renderRecruitPanel();
                if (typeof renderArmy === 'function') renderArmy();
                if (typeof renderAvailableUnits === 'function') renderAvailableUnits();
            }
        };

        container.appendChild(card);
    }
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
function openUnitDetailModal(unit, army = null) {
    const oldModal = document.getElementById('unitDetailModal');
    if (oldModal) oldModal.remove();

    // Получаем итоговые характеристики (если передана армия)
    let stats = null;
    if (army && typeof getUnitEffectiveStats === 'function') {
        stats = getUnitEffectiveStats(unit, army);
    }

    // Если stats нет, используем базовые значения из юнита или базы
    const db = window.unitDatabase || {};
    const mercs = window.MERCENARY_UNITS || {};
    const base = db[unit.unitKey] || mercs[unit.unitKey] || unit;

    const defense = stats ? stats.defense : (base.defense || 0);
    const melee = stats ? stats.strengthMelee : (base.strengthMelee || base.strength || 0);
    const ranged = stats ? stats.strengthRanged : (base.strengthRanged || 0);
    const morale = stats ? stats.morale : (base.morale || 0);

    // Другие параметры, которые не зависят от бонусов
    const hireCost = base.hireCost || 0;
    const upkeep = base.upkeep || 0;
    const countPerUnit = base.countPerUnit || 100;
    const hireTime = base.hireTime || 1;
    const troopType = base.troopType || 'Неизвестно';
    const race = base.race || 'Неизвестно';
    const special = base.special || '';
    const maxCount = base.maxCount || null;
    const gender = base.gender || 'male';
    const faction = base.faction || null;

    // Если есть скидки от технологий, применяем их к стоимости найма и содержания
    let effectiveHireCost = hireCost;
    let effectiveUpkeep = upkeep;
    let effectiveHireTime = hireTime;
    const techBonuses = (typeof getTechBonuses === 'function') ? getTechBonuses() : {};

    if (unit.unitKey && techBonuses.hireDiscountByUnit && techBonuses.hireDiscountByUnit[unit.unitKey]) {
        const discount = techBonuses.hireDiscountByUnit[unit.unitKey];
        effectiveHireCost = Math.floor(effectiveHireCost * (1 - discount / 100));
    }
    if (unit.unitKey && techBonuses.upkeepDiscountByUnit && techBonuses.upkeepDiscountByUnit[unit.unitKey]) {
        const discount = techBonuses.upkeepDiscountByUnit[unit.unitKey];
        effectiveUpkeep = Math.floor(effectiveUpkeep * (1 - discount / 100));
    }
    if (techBonuses.hireTimeReduction) {
        effectiveHireTime = Math.max(1, effectiveHireTime - techBonuses.hireTimeReduction);
    }

    // Иконка
    let iconPath = base.icon || unit.icon;
    if (iconPath && typeof getUnitIconPath === 'function') {
        iconPath = getUnitIconPath(iconPath);
    } else if (iconPath && !iconPath.startsWith('icons/') && !iconPath.startsWith('http')) {
        iconPath = 'icons/' + iconPath;
    }
    const iconHtml = iconPath
        ? `<img src="${iconPath}" style="width: 150px; height: 400px; object-fit: contain; border-radius: 12px;">`
        : '<div style="font-size: 80px;">⚔️</div>';

    // ---- ФОРМИРУЕМ HTML ----
    const modal = document.createElement('div');
    modal.id = 'unitDetailModal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); z-index: 10000;
        display: flex; justify-content: center; align-items: center;
    `;

    // Строка с характеристиками (итоговые)
    let statsLine = '';
    if (melee > 0) statsLine += `⚔️ Атака ближняя: ${melee}<br>`;
    if (ranged > 0) statsLine += `🏹 Атака дальняя: ${ranged}<br>`;
    if (defense > 0) statsLine += `🛡️ Защита: ${defense}<br>`;
    if (morale > 0) statsLine += `❤️ Мораль: ${morale}<br>`;

    // Если stats рассчитаны, добавим пометку
    let bonusNote = '';
    if (stats) {
        const baseDefense = base.defense || 0;
        const baseMelee = base.strengthMelee || base.strength || 0;
        const baseRanged = base.strengthRanged || 0;
        const baseMorale = base.morale || 0;
        let changes = [];
        if (defense !== baseDefense) changes.push(`защита ${defense > baseDefense ? '+' : ''}${(defense - baseDefense).toFixed(1)}`);
        if (melee !== baseMelee) changes.push(`атака ближняя ${melee > baseMelee ? '+' : ''}${(melee - baseMelee).toFixed(1)}`);
        if (ranged !== baseRanged) changes.push(`атака дальняя ${ranged > baseRanged ? '+' : ''}${(ranged - baseRanged).toFixed(1)}`);
        if (morale !== baseMorale) changes.push(`мораль ${morale > baseMorale ? '+' : ''}${(morale - baseMorale).toFixed(1)}`);
        if (changes.length > 0) {
            bonusNote = `<div style="margin-top:8px; color:#8bc34a; font-size:0.85rem;">✨ Активные бонусы: ${changes.join(', ')}</div>`;
        }
    }

    // Требования
    const requirements = [];
    if (special) requirements.push(`✨ Особенность: ${escapeHtml(special)}`);
    if (gender === 'female') requirements.push('🚺 Требуется реформа «Женщины в армии»');
    if (maxCount) requirements.push(`📦 Максимум отрядов: ${maxCount}`);
    if (faction) {
        const factionName = (typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[faction]) ? FACTION_NAMES[faction] : faction;
        requirements.push(`🏛️ Только для: ${factionName}`);
    }
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
                <h2 style="color: #ffd966; margin: 0 0 10px 0;">${escapeHtml(base.name || unit.name)}</h2>
                <div><strong>🧬 Раса:</strong> ${escapeHtml(race)}</div>
                <div><strong>⚔️ Тип:</strong> ${escapeHtml(troopType)}</div>
                <div><strong>👥 Численность отряда:</strong> ${countPerUnit} чел.</div>
                <div><strong>💰 Стоимость найма:</strong> ${effectiveHireCost === 0 ? 'бесплатно' : effectiveHireCost + ' эрсов'}</div>
                <div><strong>⚖️ Содержание:</strong> ${effectiveUpkeep} эрсов/ход</div>
                ${statsLine ? `<div><strong>📊 Характеристики:</strong><br>${statsLine}</div>` : ''}
                ${bonusNote}
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
    if (!army) {
        alert('Армия не найдена');
        return;
    }

    // Получаем все поселения (города, замки, деревни)
    const allSettlements = Object.values(SETTLEMENTS_DB)
        .filter(s => s.type === 'city' || s.type === 'castle' || s.type === 'village')
        .sort((a, b) => a.name.localeCompare(b.name));

    // Группируем по провинциям для удобства
    const grouped = {};
    for (let s of allSettlements) {
        const p = s.province;
        if (!grouped[p]) grouped[p] = [];
        grouped[p].push(s);
    }

    let optionsHtml = '<option value="">🏕️ Снять с гарнизона</option>';
    for (let [provinceId, settlements] of Object.entries(grouped)) {
        const provinceName = PROVINCE_NAMES[provinceId] || provinceId;
        optionsHtml += `<optgroup label="🏛️ ${provinceName}">`;
        for (let s of settlements) {
            const selected = (army.garrison === s.id) ? 'selected' : '';
            const typeLabel = getSettlementTypeLabel(s.type);
            optionsHtml += `<option value="${s.id}" ${selected}>${s.name} (${typeLabel})</option>`;
        }
        optionsHtml += `</optgroup>`;
    }

    // Модальное окно
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
            
            <label style="display:block; margin:15px 0;">📍 Гарнизон (поселение):
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
		const wounded = unit.wounded || 0;
		const currentCount = unit.count || 0;
		const deficit = Math.max(0, fullSize - currentCount - wounded);
		if (deficit <= 0) {
			alert('Отряд полностью укомплектован.');
			return;
		}

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

		showCustomConfirm(
			`Пополнить отряд на <strong>${deficit}</strong> чел.<br>Стоимость: <strong style="color:#ffd966;">${totalCost}</strong> эрсов (по ${costPerSoldier} эрса за бойца).`,
			() => {
				const treasury = (typeof getCurrentTreasury === 'function') ? getCurrentTreasury() : window.factionTreasury || 0;
				if (treasury < totalCost) {
					alert(`Недостаточно средств! Нужно ${totalCost} эрсов, в казне ${treasury}.`);
					return;
				}
				if (typeof deductTreasury === 'function') {
					deductTreasury(totalCost);
				} else {
					window.factionTreasury -= totalCost;
				}
				unit.count += deficit;
				// wounded не меняется
				addGlobalLog(`📥 Отряд "${unit.name}" пополнен на ${deficit} чел. (стоимость: ${totalCost} эрсов).`, 'army');
				finishAndClose();
			},
			null
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
    const details = [];

    for (let unit of army.units) {
        const base = db[unit.unitKey] || mercs[unit.unitKey];
        const fullSize = base ? (base.countPerUnit || 100) : 100;
        const wounded = unit.wounded || 0;
        const currentCount = unit.count || 0;
        // Правильный дефицит: сколько нужно добавить, чтобы после лечения стало полный штат
        const deficit = Math.max(0, fullSize - currentCount - wounded);
        if (deficit > 0) {
            const race = unit.race;
            const gender = unit.gender || 'male';
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

            if (typeof deductTreasury === 'function') {
                deductTreasury(totalCost);
            } else {
                window.factionTreasury -= totalCost;
            }

            for (let unit of army.units) {
                const base = db[unit.unitKey] || mercs[unit.unitKey];
                const fullSize = base ? (base.countPerUnit || 100) : 100;
                const wounded = unit.wounded || 0;
                const currentCount = unit.count || 0;
                const deficit = Math.max(0, fullSize - currentCount - wounded);
                if (deficit > 0) {
                    const race = unit.race;
                    const gender = unit.gender || 'male';
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
                        // wounded не меняется
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

// ========== ПЕРЕМЕЩЕНИЕ ОТРЯДА В ДРУГУЮ АРМИЮ ==========

/**
 * Открывает модальное окно со списком армий для перемещения отряда.
 * @param {string} unitId - ID отряда
 * @param {string} fromArmyId - ID текущей армии
 */
function openMoveUnitModal(unitId, fromArmyId) {
    const fromArmy = window.armies.find(a => a.id === fromArmyId);
    if (!fromArmy) return;
    const unit = fromArmy.units.find(u => u.id === unitId);
    if (!unit) return;

    // Список армий той же фракции, исключая текущую
    const targetArmies = window.armies.filter(a => 
        a.factionId === window.currentFaction && a.id !== fromArmyId
    );

    if (targetArmies.length === 0) {
        alert('Нет других армий для перемещения.');
        return;
    }

    // Создаём модальное окно
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10000;display:flex;justify-content:center;align-items:center';

    let listHtml = targetArmies.map(a => 
        `<button data-army-id="${a.id}" style="display:block;width:100%;margin:5px 0;padding:10px;background:#2a2418;border:1px solid #b87c4f;border-radius:12px;color:#f0e6d0;">${escapeHtml(a.name)}${a.garrison ? ` (${SETTLEMENTS_DB[a.garrison]?.name || 'вне гарнизона'})` : ' (вне гарнизона)'}</button>`
    ).join('');

    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:450px;width:90%;color:#e6ddb3;">
            <h3 style="color:#ffd966;">🔄 Переместить отряд</h3>
            <p><strong>${escapeHtml(unit.name)}</strong> (${unit.count} чел.) из <strong>${escapeHtml(fromArmy.name)}</strong></p>
            <p style="font-size:0.9rem;color:#8a7a5a;">Выберите целевую армию:</p>
            <div style="margin:15px 0; max-height:300px; overflow-y:auto; display:flex; flex-direction:column; gap:8px;">
                ${listHtml}
            </div>
            <button id="cancelMoveUnitBtn" style="background:#7a2a2a;padding:8px 16px;width:100%;">Отмена</button>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelectorAll('button[data-army-id]').forEach(btn => {
        btn.onclick = function() {
            const toArmyId = this.getAttribute('data-army-id');
            modal.remove();
            moveUnitToArmy(unitId, fromArmyId, toArmyId);
        };
    });

    modal.querySelector('#cancelMoveUnitBtn').onclick = () => modal.remove();
}

/**
 * Перемещает отряд из одной армии в другую.
 * @param {string} unitId - ID отряда
 * @param {string} fromArmyId - ID исходной армии
 * @param {string} toArmyId - ID целевой армии
 */
function moveUnitToArmy(unitId, fromArmyId, toArmyId) {
    const fromArmy = window.armies.find(a => a.id === fromArmyId);
    const toArmy = window.armies.find(a => a.id === toArmyId);
    if (!fromArmy || !toArmy) {
        alert('Ошибка: армия не найдена.');
        return;
    }

    const unitIndex = fromArmy.units.findIndex(u => u.id === unitId);
    if (unitIndex === -1) {
        alert('Отряд не найден.');
        return;
    }

    // Извлекаем отряд из исходной армии
    const [unit] = fromArmy.units.splice(unitIndex, 1);

    // Добавляем в целевую армию
    toArmy.units.push(unit);

    // Сохраняем данные
    if (typeof saveArmyData === 'function') saveArmyData();
    if (typeof renderArmy === 'function') renderArmy();
    if (typeof renderAvailableUnits === 'function') renderAvailableUnits();

    addGlobalLog(`🔄 Отряд "${unit.name}" перемещён из "${fromArmy.name}" в "${toArmy.name}".`, 'army');
}

/**
 * Обёртка для открытия модального окна с деталями юнита с учётом армии
 * @param {string} unitKey - ключ юнита из базы
 * @param {string} armyId - ID армии, в которой находится юнит
 */
window.openUnitDetailModalWithArmy = function(unitKey, armyId) {
    const db = window.unitDatabase || {};
    const mercs = window.MERCENARY_UNITS || {};
    const unit = db[unitKey] || mercs[unitKey];
    if (!unit) {
        alert('Юнит не найден в базе данных');
        return;
    }
    const army = (window.armies || []).find(a => a.id === armyId);
    if (!army) {
        // Если армия не найдена, всё равно показываем модалку, но без бонусов
        if (typeof openUnitDetailModal === 'function') {
            openUnitDetailModal(unit, null);
        }
        return;
    }
    if (typeof openUnitDetailModal === 'function') {
        openUnitDetailModal(unit, army);
    } else {
        alert('Функция openUnitDetailModal не определена');
    }
};
// ==================== ПАНЕЛЬ НАЙМА ВОЙСК ====================

/**
 * Открывает панель найма для указанной армии.
 */
function openRecruitPanel(armyId) {
    const army = (window.armies || []).find(a => a.id === armyId);
    if (!army) { alert('Армия не найдена.'); return; }

    window._recruitPanelArmyId = armyId;
    window.lastSelectedArmyId = armyId; // для совместимости

    const modal = document.getElementById('recruitPanelModal');
    if (!modal) return;
    modal.style.display = 'flex';

    renderRecruitPanel();

    // Фокус и блокировка скролла страницы
    document.body.style.overflow = 'hidden';
    addGlobalLog(`🛒 Открыта панель найма для армии «${army.name}».`, 'army');
}
window.openRecruitPanel = openRecruitPanel;

/**
 * Закрывает панель найма.
 */
function closeRecruitPanel() {
    const modal = document.getElementById('recruitPanelModal');
    if (!modal) return;
    modal.style.display = 'none';
    window._recruitPanelArmyId = null;
    document.body.style.overflow = '';
}
window.closeRecruitPanel = closeRecruitPanel;

/**
 * Полный ре-рендер панели найма: шапка + юниты + колонка армии.
 */
function renderRecruitPanel() {
    const armyId = window._recruitPanelArmyId;
    const army = (window.armies || []).find(a => a.id === armyId);
    if (!army) {
        closeRecruitPanel();
        return;
    }

    // --- Шапка с информацией об армии ---
    const infoEl = document.getElementById('recruitPanelArmyInfo');
    if (infoEl) {
        let totalSoldiers = 0;
        let totalWounded = 0;
        let totalUpkeep = 0;
        let totalUnits = 0;
        for (let u of army.units) {
            totalSoldiers += u.count || 0;
            totalWounded += u.wounded || 0;
            totalUpkeep += (u.upkeep || 0) * (u.count || 0);
            totalUnits++;
        }
        const queueCount = (army.recruitmentQueue || []).length;
        const treasury = (typeof getCurrentTreasury === 'function') ? getCurrentTreasury() : 0;
        const net = treasury - totalUpkeep;
        const netClass = net >= 0 ? 'good' : 'bad';
        let garrisonName = 'вне гарнизона';
        if (army.garrison && typeof SETTLEMENTS_DB !== 'undefined' && SETTLEMENTS_DB[army.garrison]) {
            garrisonName = SETTLEMENTS_DB[army.garrison].name;
        }

        infoEl.innerHTML = `
            <span class="info-chip">🛡️ <strong>${escapeHtml(army.name)}</strong></span>
            <span class="info-chip">📍 ${escapeHtml(garrisonName)}</span>
            <span class="info-chip">👑 ${escapeHtml(army.commander || '—')}</span>
            <span class="info-chip">👥 <strong>${totalSoldiers.toLocaleString()}</strong></span>
            ${totalWounded > 0 ? `<span class="info-chip bad">❤️‍🩹 <strong>${totalWounded}</strong></span>` : ''}
            <span class="info-chip">⚔️ <strong>${totalUnits}</strong></span>
            <span class="info-chip ${queueCount > 0 ? 'warn' : ''}">⏳ <strong>${queueCount}</strong></span>
            <span class="info-chip ${netClass}">💰 казна: <strong>${treasury.toLocaleString()}</strong></span>
        `;
    }

    // --- Сетка юнитов ---
    renderAvailableUnits();

    // --- Правая колонка: состав армии + очередь ---
    renderRecruitPanelArmy(army);
}
window.renderRecruitPanel = renderRecruitPanel;

/**
 * Рендерит правую колонку: состав армии, очередь найма, сводку.
 */
function renderRecruitPanelArmy(army) {
    const container = document.getElementById('recruitPanelArmyContent');
    if (!container) return;

    let html = '';

    // === СОСТАВ АРМИИ ===
    html += `<div class="recruit-army-section-title">
        <span>⚔️ Состав армии</span>
        <span style="color:#8a7a5a;font-size:0.7rem;">${army.units.length} отр.</span>
    </div>`;

    if (army.units.length === 0) {
        html += '<div class="recruit-army-empty">Армия пуста. Нанимайте войска слева.</div>';
    } else {
        for (let u of army.units) {
            const iconPath = _getUnitIcon(u.icon);
            const iconHtml = iconPath
                ? `<img src="${iconPath}" alt="">`
                : '<span style="font-size:1rem;">⚔️</span>';
            html += `
                <div class="recruit-army-unit">
                    <div class="recruit-army-unit-icon">${iconHtml}</div>
                    <div class="recruit-army-unit-info">
                        <div class="recruit-army-unit-name" title="${escapeHtml(u.name)}">${escapeHtml(u.name)}</div>
                        <div class="recruit-army-unit-meta">
                            👥 <strong>${u.count}</strong>
                            ${u.wounded > 0 ? ` · ❤️‍🩹 <strong style="color:#ff6b6b;">${u.wounded}</strong>` : ''}
                            · 💰 ${Math.round((u.upkeep || 0) * u.count)}
                        </div>
                    </div>
                </div>`;
        }
    }

    // === ОЧЕРЕДЬ НАЙМА ===
    if (army.recruitmentQueue && army.recruitmentQueue.length > 0) {
        html += `<div class="recruit-army-section-title" style="margin-top:14px;">
            <span>⏳ В очереди найма</span>
            <span style="color:#ffd966;font-size:0.7rem;">${army.recruitmentQueue.length}</span>
        </div>`;
        for (let q of army.recruitmentQueue) {
            const db = window.unitDatabase || {};
            const mercs = window.MERCENARY_UNITS || {};
            const base = db[q.unitKey] || mercs[q.unitKey];
            const unitName = base ? base.name : q.unitKey;
            const iconPath = base ? _getUnitIcon(base.icon) : null;
            const iconHtml = iconPath
                ? `<img src="${iconPath}" alt="">`
                : '<span style="font-size:1rem;">⏳</span>';
            html += `
                <div class="recruit-queue-item" data-queue-id="${q.id}">
                    <div class="queue-icon">${iconHtml}</div>
                    <div class="queue-info">
                        <div class="queue-name" title="${escapeHtml(unitName)}">${escapeHtml(unitName)}</div>
                        <div class="queue-time">⏱️ Осталось: <strong>${q.remainingTurns}</strong> ход.</div>
                    </div>
                    <button data-queue-id="${q.id}" title="Отменить найм">✖</button>
                </div>`;
        }
    }

    // === ФУТЕР ===
    let totalUpkeep = 0;
    for (let u of army.units) totalUpkeep += (u.upkeep || 0) * (u.count || 0);
    const treasury = (typeof getCurrentTreasury === 'function') ? getCurrentTreasury() : 0;
    const net = treasury - totalUpkeep;
    const netClass = net >= 0 ? 'good' : 'bad';

    html += `
        <div class="recruit-army-footer">
            <div class="footer-row">
                <span>💰 Казна:</span>
                <strong>${treasury.toLocaleString()} эрс</strong>
            </div>
            <div class="footer-row">
                <span>⚖️ Содержание:</span>
                <strong>${Math.round(totalUpkeep).toLocaleString()} эрс/ход</strong>
            </div>
            <div class="footer-row">
                <span>📊 Остаток:</span>
                <strong class="${netClass}">${net.toLocaleString()} эрс/ход</strong>
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Обработчики отмены найма
    container.querySelectorAll('button[data-queue-id]').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const qid = btn.dataset.queueId;
            if (typeof window.cancelRecruitment === 'function') {
                window.cancelRecruitment(army.id, qid);
                renderRecruitPanel();
                if (typeof renderArmy === 'function') renderArmy();
            }
        };
    });
}
window.renderRecruitPanelArmy = renderRecruitPanelArmy;

// ==================== ИНИЦИАЛИЗАЦИЯ ОБРАБОТЧИКОВ ПАНЕЛИ ====================

function initRecruitPanelEvents() {
    const modal = document.getElementById('recruitPanelModal');
    if (!modal) return;

    // Закрытие по кнопке
    const closeBtn = document.getElementById('recruitPanelCloseBtn');
    if (closeBtn) closeBtn.onclick = closeRecruitPanel;

    // Закрытие по клику на фон
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeRecruitPanel();
    });

    // Закрытие по Esc
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeRecruitPanel();
        }
    });

    // Фильтры и селект количества
    const filterType = document.getElementById('filterType');
    const filterRace = document.getElementById('filterRace');
    const filterSpecial = document.getElementById('filterSpecial');
    const hireCountSelect = document.getElementById('hireCountSelect');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');

    if (filterType) filterType.addEventListener('change', renderAvailableUnits);
    if (filterRace) filterRace.addEventListener('change', renderAvailableUnits);
    if (filterSpecial) filterSpecial.addEventListener('change', renderAvailableUnits);
    if (hireCountSelect) hireCountSelect.addEventListener('change', renderAvailableUnits);
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            if (filterType) filterType.value = 'all';
            if (filterRace) filterRace.value = 'all';
            if (filterSpecial) filterSpecial.checked = false;
            if (hireCountSelect) hireCountSelect.value = '1';
            renderAvailableUnits();
        });
    }
}

// Запуск при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRecruitPanelEvents);
} else {
    initRecruitPanelEvents();
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