// ============================================================================
// МОДУЛЬ: war.js v2.0 — синхронная система войн, оккупаций и аннексий
// ============================================================================
// Архитектура v2.0:Мод выложен на гитхаб 05.10.26
//   • Все события владения пишутся в ЖУРНАЛ (world_ownership_log)
//   • Каждая фракция читает журнал на СВОЮ дату
//   • Карта всегда читает САМОЕ СВЕЖЕЕ состояние
//   • При ходе фракции: syncFactionOwnership() подтягивает изменения мира
//   • Блок войны группирует поселения по провинциям
//   • Войны с A и B не путаются: у каждого поселения проверяется история
// ============================================================================

window.wars = window.wars || [];
window.warsAgainst = window.warsAgainst || [];
window.occupations = window.occupations || [];

// ---------- Ссылки на функции реестра (с защитой) ----------
const _hasRegistry = () => typeof window.transferOwnership === 'function';

function _myDate() {
    if (typeof getCurrentFactionDate === 'function') return getCurrentFactionDate();
    return { week: 1, month: 5, year: 1598 };
}
function _myFid() { return window.currentFaction; }
function _dateStr(d) {
    if (typeof formatDateStr === 'function') return formatDateStr(d);
    return '—';
}
function _turnOf(d) {
    if (typeof dateToTurn === 'function') return dateToTurn(d);
    if (!d) return 0;
    return (d.year - 1598) * 48 + (d.month - 1) * 4 + (d.week - 1);
}

// ============================================================================
// РАЗДЕЛ 1: ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (без изменений)
// ============================================================================

function getProvinceName(pid) {
    if (!pid) return '—';
    if (typeof PROVINCE_NAMES !== 'undefined' && PROVINCE_NAMES[pid]) {
        return PROVINCE_NAMES[pid];
    }
    if (typeof provincesData !== 'undefined' && provincesData[pid]) {
        const prov = provincesData[pid];
        if (prov.customName) return prov.customName;
        if (prov.originalProvinceId && typeof PROVINCE_NAMES !== 'undefined' && PROVINCE_NAMES[prov.originalProvinceId]) {
            return PROVINCE_NAMES[prov.originalProvinceId];
        }
    }
    return pid;
}
window.getProvinceName = getProvinceName;

function getAnnexationTurns(type) {
    if (type === 'village') return 1;
    if (type === 'castle') return 2;
    if (type === 'city') return 3;
    return 2;
}

function findProvinceOfSettlement(settlementId) {
    if (typeof SETTLEMENTS_DB !== 'undefined' && SETTLEMENTS_DB[settlementId]?.province) {
        return SETTLEMENTS_DB[settlementId].province;
    }
    if (typeof provincesData !== 'undefined') {
        for (let pid in provincesData) {
            if (provincesData[pid].settlements?.some(s => s.id === settlementId)) return pid;
        }
        for (let pid in provincesData) {
            const lost = provincesData[pid].lostSettlements || [];
            if (lost.some(l => l.settlementId === settlementId)) return pid;
        }
    }
    return 'unknown';
}
window.findProvinceOfSettlement = findProvinceOfSettlement;

function getFactionSettlementsFromStatic(factionId) {
    if (typeof SETTLEMENTS_DB === 'undefined') return [];
    const result = [];
    for (let id in SETTLEMENTS_DB) {
        if (SETTLEMENTS_DB[id].faction === factionId) result.push(SETTLEMENTS_DB[id]);
    }
    return result;
}
window.getFactionSettlementsFromStatic = getFactionSettlementsFromStatic;

function getWarWith(factionId) {
    return window.wars.find(w => w.defender === factionId);
}

function getOccupation(settlementId) {
    return window.occupations.find(o => o.settlementId === settlementId);
}

function getSettlementPopulationEstimate(settlement) {
    if (settlement.type === 'city') return 8000;
    if (settlement.type === 'castle') return 2500;
    if (settlement.type === 'village') return 800;
    return 500;
}

// ============================================================================
// РАЗДЕЛ 2: СИНХРОНИЗАЦИЯ ЛОКАЛЬНЫХ МАССИВОВ С МИРОВЫМ РЕЕСТРОМ
// ============================================================================

/**
 * Подтягивает список войн из world_wars_log в window.wars/warsAgainst.
 * Используется на старте и при смене фракции.
 */
function syncWarsFromWorld() {
    if (typeof getActiveWarsAt !== 'function') return;
    const d = _myDate();
    const myFid = _myFid();
    const active = getActiveWarsAt(d);

    window.wars = [];
    window.warsAgainst = [];
    for (let w of active) {
        if (w.aggressor === myFid) {
            window.wars.push({
                id: w.id,
                aggressor: w.aggressor,
                defender: w.defender,
                startTurn: w.turn,
                startDate: _dateStr(w.startDate)
            });
        } else if (w.defender === myFid) {
            window.warsAgainst.push({
                id: w.id,
                aggressor: w.aggressor,
                defender: w.defender,
                startTurn: w.turn,
                startDate: _dateStr(w.startDate)
            });
        }
    }
}
window.syncWarsFromWorld = syncWarsFromWorld;

/**
 * Синхронизирует window.occupations — оставляет только наши активные.
 */
function syncOccupationsFromWorld() {
    if (typeof loadWorldOccupations !== 'function') return;
    const myFid = _myFid();
    const world = loadWorldOccupations();
    const mine = world.filter(o =>
        o.occupierFactionId === myFid && o.status !== 'annexed'
    );
    // Сохраняем локальные «self-occupation» — они не пишутся в мир
    const selfOcc = (window.occupations || []).filter(o => o.isSelfOccupation);
    window.occupations = [
        ...mine.map(w => ({
            settlementId: w.settlementId,
            targetFactionId: w.defenderFactionId,
            sourceProvinceId: w.sourceProvinceId,
            type: w.type,
            turnsRemaining: w.turnsRemaining,
            totalTurns: w.totalTurns,
            status: w.status,
            startedAt: w.startedAt
        })),
        ...selfOcc
    ];
}
window.syncOccupationsFromWorld = syncOccupationsFromWorld;

// ============================================================================
// РАЗДЕЛ 3: ВОЙНА — ОБЪЯВЛЕНИЕ / МИР
// ============================================================================

function declareWar(factionId) {
    const myFid = _myFid();
    const d = _myDate();

    if (typeof areFactionsAtWarAt === 'function' && areFactionsAtWarAt(myFid, factionId, d)) {
        alert('Вы уже воюете с этой фракцией.');
        return;
    }

    const war = {
        id: 'war_' + Date.now(),
        aggressor: myFid,
        defender: factionId,
        startTurn: _turnOf(d),
        startDate: _dateStr(d)
    };
    window.wars.push(war);

    if (typeof recordWarStart === 'function') {
        recordWarStart(myFid, factionId, d);
    }

    if (typeof saveAllData === 'function') saveAllData();
    renderWarPanel();

    const name = (typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[factionId]) || factionId;
    if (typeof addGlobalLog === 'function') {
        addGlobalLog(`⚔️ Объявлена война фракции «${name}».`, 'general');
    }
}
window.declareWar = declareWar;

function closeWar(factionId) {
    const myFid = _myFid();
    const name = (typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[factionId]) || factionId;
    if (!confirm(`Заключить мир с «${name}»? Все активные оккупации отменятся.`)) return;

    const d = _myDate();

    // Убираем из локального списка
    window.wars = window.wars.filter(w => w.defender !== factionId);
    window.warsAgainst = window.warsAgainst.filter(w => w.aggressor !== factionId);

    // Снимаем наши активные оккупации на них
    const toRemove = window.occupations
        .filter(o => o.targetFactionId === factionId)
        .map(o => o.settlementId);
    for (let sid of toRemove) {
        if (typeof removeWorldOccupation === 'function') removeWorldOccupation(sid);
    }
    window.occupations = window.occupations.filter(o => o.targetFactionId !== factionId);

    if (typeof recordWarEnd === 'function') recordWarEnd(myFid, factionId, d);

    if (typeof saveAllData === 'function') saveAllData();
    renderWarPanel();

    if (typeof addGlobalLog === 'function') {
        addGlobalLog(`🕊️ Мир с «${name}».`, 'general');
    }
}
window.closeWar = closeWar;

function openWarDeclarationModal() {
    const old = document.getElementById('warDeclarationModal');
    if (old) old.remove();

    const myFid = _myFid();
    const d = _myDate();

    const modal = document.createElement('div');
    modal.id = 'warDeclarationModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(10,8,14,0.92);z-index:10000;display:flex;justify-content:center;align-items:center;padding:20px;';

    let factionsHtml = '';
    if (typeof FACTION_NAMES !== 'undefined') {
        for (let fid in FACTION_NAMES) {
            if (fid === myFid) continue;

            // Определяем роль в войне (если есть)
            let warRole = null;
            if (typeof getActiveWarsAt === 'function') {
                const found = getActiveWarsAt(d).find(w =>
                    (w.aggressor === myFid && w.defender === fid) ||
                    (w.defender === myFid && w.aggressor === fid)
                );
                if (found) {
                    warRole = found.aggressor === myFid ? 'aggressor' : 'defender';
                }
            }

            const coat = (typeof FACTION_MAIN_COATS !== 'undefined' && FACTION_MAIN_COATS[fid])
                ? FACTION_MAIN_COATS[fid] : 'icons/emblem/default_coat.png';
            const name = FACTION_NAMES[fid];
            const settlements = getFactionSettlementsFromStatic(fid).length;

            let actionHtml;
            let rowStyle = '';

            if (!warRole) {
                // Мирное состояние — можно объявить войну
                actionHtml = `<button class="war-declare-btn" data-faction-id="${fid}">⚔️ Объявить войну</button>`;
            } else {
                // Уже в войне — можно заключить мир
                rowStyle = 'opacity:0.78;border-color:rgba(184,134,11,0.45);';
                const roleLabel = warRole === 'aggressor' ? 'Вы агрессор' : 'Вы защитник';
                const roleColor = warRole === 'aggressor' ? '#ff6b6b' : '#ffaa55';
                actionHtml = `
                    <div style="display:flex;flex-direction:column;gap:5px;align-items:flex-end;">
                        <span style="font-size:0.7rem;color:${roleColor};font-weight:700;letter-spacing:0.04em;">⚔️ В войне · ${roleLabel}</span>
                        <button class="war-peace-btn" data-faction-id="${fid}">🕊️ Заключить мир</button>
                    </div>`;
            }

            factionsHtml += `
                <div class="war-faction-row" data-faction-id="${fid}" style="${rowStyle}">
                    <img src="${coat}" alt="" class="war-faction-row-coat" onerror="this.style.display='none'">
                    <div class="war-faction-row-info">
                        <div class="war-faction-row-name">${escapeHtml(name)}</div>
                        <div class="war-faction-row-settlements">🏘️ ${settlements} поселений</div>
                    </div>
                    ${actionHtml}
                </div>`;
        }
    }
    if (!factionsHtml) {
        factionsHtml = '<div class="war-empty">Нет доступных фракций.</div>';
    }

    modal.innerHTML = `
        <div class="war-declaration-container">
            <div class="war-declaration-header">
                <h3>⚔️ Дипломатия</h3>
                <button class="war-modal-close" id="warDeclCloseBtn">✖</button>
            </div>
            <div class="war-declaration-body">${factionsHtml}</div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#warDeclCloseBtn').onclick = () => modal.remove();
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    // Объявление войны
    modal.querySelectorAll('.war-declare-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            declareWar(btn.dataset.factionId);
            modal.remove();
        };
    });

    // Заключение мира
    modal.querySelectorAll('.war-peace-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            closeWar(btn.dataset.factionId);
            modal.remove();
            // Переоткрыть модалку с обновлённым состоянием (если пользователь хочет ещё что-то сделать)
            setTimeout(() => openWarDeclarationModal(), 250);
        };
    });
}
window.openWarDeclarationModal = openWarDeclarationModal;

// ============================================================================
// РАЗДЕЛ 4: ОККУПАЦИЯ И АННЕКСИЯ
// ============================================================================

function startOccupation(settlementId, factionId) {
    const settlement = SETTLEMENTS_DB[settlementId];
    if (!settlement) return;

    const myFid = _myFid();
    const d = _myDate();
    const turns = getAnnexationTurns(settlement.type);
    const sourceProvinceId = findProvinceOfSettlement(settlementId);
    const defenderFid = (typeof getSettlementOwnerLatest === 'function')
        ? getSettlementOwnerLatest(settlementId)
        : null;

    window.occupations.push({
        settlementId,
        targetFactionId: factionId,
        sourceProvinceId,
        type: settlement.type,
        turnsRemaining: turns,
        totalTurns: turns,
        status: 'occupying',
        startedAt: _dateStr(d)
    });

    if (typeof upsertWorldOccupation === 'function') {
        upsertWorldOccupation({
            settlementId,
            occupierFactionId: myFid,
            defenderFactionId: defenderFid,
            sourceProvinceId,
            type: settlement.type,
            turnsRemaining: turns,
            totalTurns: turns,
            status: 'occupying',
            startedAt: _dateStr(d),
            startedTurn: _turnOf(d)
        });
    }

    if (typeof saveAllData === 'function') saveAllData();
    renderWarPanel();

    if (typeof addGlobalLog === 'function') {
        addGlobalLog(`⚔️ Оккупация «${settlement.name}» начата (${turns} ход.).`, 'general');
    }
    alert(`⚔️ Оккупация начата.\nАннексия возможна через ${turns} ход(ов).`);
}
window.startOccupation = startOccupation;

function startAnnexation(settlementId, factionId) {
    const settlement = SETTLEMENTS_DB[settlementId];
    if (!settlement) return;
    if (!confirm(`🏛️ Мгновенная аннексия «${settlement.name}»?`)) return;

    const d = _myDate();
    const myFid = _myFid();

    const occ = {
        settlementId,
        targetFactionId: factionId,
        sourceProvinceId: findProvinceOfSettlement(settlementId),
        type: settlement.type,
        turnsRemaining: 0,
        totalTurns: 0,
        status: 'annexing',
        startedAt: _dateStr(d)
    };

    const idx = window.occupations.findIndex(o => o.settlementId === settlementId);
    if (idx !== -1) window.occupations[idx] = occ;
    else window.occupations.push(occ);

    if (typeof upsertWorldOccupation === 'function') {
        upsertWorldOccupation({
            settlementId,
            occupierFactionId: myFid,
            defenderFactionId: (typeof getSettlementOwnerLatest === 'function')
                ? getSettlementOwnerLatest(settlementId) : null,
            sourceProvinceId: occ.sourceProvinceId,
            type: settlement.type,
            turnsRemaining: 0,
            totalTurns: 0,
            status: 'annexing',
            startedAt: occ.startedAt
        });
    }

    if (typeof saveAllData === 'function') saveAllData();
    showAnnexationCompleteModal(occ);
}
window.startAnnexation = startAnnexation;

// ---------- Добровольная передача (мы отдаём своё врагу) ----------

function startSelfOccupation(settlementId, enemyFactionId) {
    const settlement = SETTLEMENTS_DB[settlementId];
    if (!settlement) return;

    const d = _myDate();
    const turns = getAnnexationTurns(settlement.type);

    window.occupations.push({
        settlementId,
        targetFactionId: enemyFactionId,
        sourceProvinceId: findProvinceOfSettlement(settlementId),
        type: settlement.type,
        turnsRemaining: turns,
        totalTurns: turns,
        status: 'self_occupying',
        isSelfOccupation: true,
        startedAt: _dateStr(d)
    });

    if (typeof saveAllData === 'function') saveAllData();
    if (typeof renderWarPanel === 'function') renderWarPanel();

    if (typeof addGlobalLog === 'function') {
        addGlobalLog(`🏴 Поселение «${settlement.name}» передаётся врагу (${turns} ход.).`, 'general');
    }
    alert(`🏴 Передача начата.\nЧерез ${turns} ход(ов) поселение перейдёт врагу.`);
}
window.startSelfOccupation = startSelfOccupation;

function startSelfAnnexation(settlementId, enemyFactionId) {
    const settlement = SETTLEMENTS_DB[settlementId];
    if (!settlement) return;
    if (!confirm(`🏴 Передать «${settlement.name}» врагу немедленно?`)) return;

    const myFid = _myFid();
    const d = _myDate();

    if (_hasRegistry()) {
        window.transferOwnership(settlementId, myFid, enemyFactionId, d, 'self_annexation', {});
    }
    if (typeof upsertWorldOccupation === 'function') {
        upsertWorldOccupation({
            settlementId,
            occupierFactionId: enemyFactionId,
            defenderFactionId: myFid,
            status: 'annexed',
            turnsRemaining: 0
        });
    }

    if (typeof updateSharedMapData === 'function') {
        updateSharedMapData(settlementId, enemyFactionId);
    }
    if (typeof addCityMarkers === 'function') setTimeout(addCityMarkers, 100);
    if (typeof saveAllData === 'function') saveAllData();
    if (typeof refreshBuildingsUI === 'function') refreshBuildingsUI();
    if (typeof renderWarPanel === 'function') renderWarPanel();

    if (typeof addGlobalLog === 'function') {
        addGlobalLog(`🏴 Поселение «${settlement.name}» передано врагу.`, 'general');
    }
    showSettlementLostModal(settlement.name, 'поселение');
}
window.startSelfAnnexation = startSelfAnnexation;

// ---------- Снятие оккупации ----------

function removeOccupation(settlementId, asLost = false) {
    const idx = window.occupations.findIndex(o => o.settlementId === settlementId);
    if (idx === -1) {
        alert('Оккупация не найдена.');
        return;
    }
    const occ = window.occupations[idx];
    const settlement = SETTLEMENTS_DB[settlementId];
    if (!settlement) return;

    const message = asLost
        ? `📉 Отметить «${settlement.name}» как потерянное?\nПоселение вернётся врагу.`
        : `🕊️ Снять оккупацию с «${settlement.name}»?`;
    if (!confirm(message)) return;

    window.occupations.splice(idx, 1);
    if (typeof removeWorldOccupation === 'function') removeWorldOccupation(settlementId);

    if (typeof saveAllData === 'function') saveAllData();
    if (typeof renderWarPanel === 'function') renderWarPanel();

    if (typeof addGlobalLog === 'function') {
        addGlobalLog(asLost
            ? `📉 Оккупация «${settlement.name}» снята (потеряно).`
            : `🕊️ Оккупация «${settlement.name}» снята.`, 'general');
    }
}
window.removeOccupation = removeOccupation;

// ---------- Потеря поселения (мы теряем, враг аннексирует) ----------

function markSettlementLost(settlementId, aggressorFactionId) {
    if (typeof provincesData === 'undefined') return;

    const myFid = _myFid();
    const d = _myDate();
    const currentOwner = (typeof getSettlementOwnerLatest === 'function')
        ? getSettlementOwnerLatest(settlementId) : null;

    if (currentOwner !== myFid) {
        alert('Это поселение вам не принадлежит.');
        return;
    }

    const settlement = SETTLEMENTS_DB[settlementId];
    const settlementName = settlement?.name || settlementId;
    if (!confirm(`📉 Отметить «${settlementName}» как потерянное?`)) return;

    // Списываем жертвы среди населения
    const lossPercent = 0.15 + Math.random() * 0.20;
    let totalLost = 0;
    for (let pid in provincesData) {
        const prov = provincesData[pid];
        if (!prov?.races) continue;
        for (let race of prov.races) {
            const raceTotal = (race.adultMale || 0) + (race.adultFemale || 0);
            const loss = Math.floor(raceTotal * lossPercent);
            if (loss <= 0) continue;
            race.adultMale = Math.max(0, race.adultMale - Math.floor(loss / 2));
            race.adultFemale = Math.max(0, race.adultFemale - Math.ceil(loss / 2));
            totalLost += loss;
        }
    }

    // Передача владения (с обновлением журнала)
    if (_hasRegistry()) {
        window.transferOwnership(settlementId, myFid, aggressorFactionId, d, 'annexation', {});
    }

    if (typeof upsertWorldOccupation === 'function') {
        upsertWorldOccupation({
            settlementId,
            occupierFactionId: aggressorFactionId,
            defenderFactionId: myFid,
            status: 'annexed',
            turnsRemaining: 0
        });
    }

    if (typeof updateSharedMapData === 'function') {
        updateSharedMapData(settlementId, aggressorFactionId);
    }
    if (typeof addCityMarkers === 'function') setTimeout(addCityMarkers, 100);
    if (typeof saveAllData === 'function') saveAllData();
    if (typeof refreshBuildingsUI === 'function') refreshBuildingsUI();
    if (typeof renderProvinceDashboard === 'function') renderProvinceDashboard();
    if (typeof renderLostSettlements === 'function') renderLostSettlements();
    if (typeof renderWarPanel === 'function') renderWarPanel();

    if (typeof addGlobalLog === 'function') {
        addGlobalLog(`📉 Потеряно «${settlementName}». Погибло ${totalLost}.`, 'general');
    }
    showSettlementLostModal(settlementName, 'поселение');
}
window.markSettlementLost = markSettlementLost;

// ---------- Возврат потерянного поселения ----------

function reclaimLostSettlement(settlementId, enemyFactionId) {
    const myFid = _myFid();
    const d = _myDate();
    const settlement = SETTLEMENTS_DB[settlementId];
    if (!settlement) return;
    if (!confirm(`⚔️ Отвоевать «${settlement.name}» обратно?`)) return;

    if (_hasRegistry()) {
        window.transferOwnership(settlementId, enemyFactionId, myFid, d, 'reclaim', {});
    }
    if (typeof removeWorldOccupation === 'function') removeWorldOccupation(settlementId);

    if (typeof updateSharedMapData === 'function') updateSharedMapData(settlementId, myFid);
    if (typeof addCityMarkers === 'function') setTimeout(addCityMarkers, 100);
    if (typeof deduplicateAndRefreshUI === 'function') deduplicateAndRefreshUI();
    if (typeof saveAllData === 'function') saveAllData();
    if (typeof renderWarPanel === 'function') renderWarPanel();
    if (typeof renderLostSettlements === 'function') renderLostSettlements();
    if (typeof refreshBuildingsUI === 'function') refreshBuildingsUI();

    if (typeof addGlobalLog === 'function') {
        addGlobalLog(`⚔️ Поселение «${settlement.name}» отвоёвано!`, 'general');
    }
}
window.reclaimLostSettlement = reclaimLostSettlement;

// ---------- Возврат потерянного поселения владельцу (без боя) ----------

function returnLostSettlement(settlementId, provinceId) {
    const myFid = _myFid();
    const d = _myDate();
    const currentOwner = (typeof getSettlementOwnerLatest === 'function')
        ? getSettlementOwnerLatest(settlementId) : null;
    const settlement = SETTLEMENTS_DB[settlementId];
    if (!settlement) return;

    if (!confirm(`🕊️ Вернуть поселение «${settlement.name}»?`)) return;

    // Кто-то (мы или другое) держит — передаём нам
    if (currentOwner && currentOwner !== myFid) {
        if (_hasRegistry()) {
            window.transferOwnership(settlementId, currentOwner, myFid, d, 'return', {});
        }
    } else if (_hasRegistry()) {
        // Ни у кого — просто фиксируем в журнале переход к нам
        window.transferOwnership(settlementId, null, myFid, d, 'return', {});
    }
    if (typeof removeWorldOccupation === 'function') removeWorldOccupation(settlementId);

    if (typeof updateSharedMapData === 'function') updateSharedMapData(settlementId, myFid);
    if (typeof addCityMarkers === 'function') setTimeout(addCityMarkers, 100);
    if (typeof saveAllData === 'function') saveAllData();
    if (typeof deduplicateAndRefreshUI === 'function') deduplicateAndRefreshUI();
    if (typeof refreshBuildingsUI === 'function') refreshBuildingsUI();
    if (typeof renderLostSettlements === 'function') renderLostSettlements();
    if (typeof renderProvinceDashboard === 'function') renderProvinceDashboard();

    if (typeof addGlobalLog === 'function') {
        addGlobalLog(`🕊️ Поселение «${settlement.name}» возвращено.`, 'general');
    }
}
window.returnLostSettlement = returnLostSettlement;

// ---------- Вернуть аннексированное врагу ----------

function returnAnnexedToEnemy(settlementId, enemyFactionId) {
    const myFid = _myFid();
    const d = _myDate();
    const settlement = SETTLEMENTS_DB[settlementId];
    if (!settlement) return;
    if (!confirm(`🏴 Вернуть «${settlement.name}» врагу?`)) return;

    if (_hasRegistry()) {
        window.transferOwnership(settlementId, myFid, enemyFactionId, d, 'peace_return', {});
    }
    if (typeof updateSharedMapData === 'function') updateSharedMapData(settlementId, enemyFactionId);
    if (typeof addCityMarkers === 'function') setTimeout(addCityMarkers, 100);
    if (typeof deduplicateAndRefreshUI === 'function') deduplicateAndRefreshUI();
    if (typeof saveAllData === 'function') saveAllData();
    if (typeof renderWarPanel === 'function') renderWarPanel();
    if (typeof refreshBuildingsUI === 'function') refreshBuildingsUI();
    if (typeof updateProvinceSelect === 'function') updateProvinceSelect();

    if (typeof addGlobalLog === 'function') {
        addGlobalLog(`🏴 «${settlement.name}» возвращено врагу.`, 'general');
    }
}
window.returnAnnexedToEnemy = returnAnnexedToEnemy;

// ---------- Завершение добровольной передачи (таймер истёк) ----------

function completeSelfOccupation(occ) {
    const myFid = _myFid();
    const d = _myDate();
    const settlement = SETTLEMENTS_DB[occ.settlementId];
    if (!settlement) return;

    if (_hasRegistry()) {
        window.transferOwnership(occ.settlementId, myFid, occ.targetFactionId, d, 'self_annexation', {});
    }
    if (typeof upsertWorldOccupation === 'function') {
        upsertWorldOccupation({
            settlementId: occ.settlementId,
            occupierFactionId: occ.targetFactionId,
            defenderFactionId: myFid,
            status: 'annexed',
            turnsRemaining: 0
        });
    }
    if (typeof updateSharedMapData === 'function') {
        updateSharedMapData(occ.settlementId, occ.targetFactionId);
    }
    if (typeof addCityMarkers === 'function') setTimeout(addCityMarkers, 100);

    if (typeof addGlobalLog === 'function') {
        addGlobalLog(`🏴 «${settlement.name}» окончательно перешло врагу.`, 'general');
    }
}

// ============================================================================
// РАЗДЕЛ 5: ОБРАБОТКА ХОДА
// ============================================================================

function processOccupations() {
    // Синхронизируем локальный список с мировым (кто-то мог что-то сделать)
    if (typeof syncOccupationsFromWorld === 'function') syncOccupationsFromWorld();

    if (!window.occupations || window.occupations.length === 0) return;

    let changed = false;
    const toComplete = [];
    const selfToComplete = [];

    for (let occ of window.occupations) {
        if (occ.status === 'annexed') continue;
        if (occ.turnsRemaining > 0) {
            occ.turnsRemaining--;
            changed = true;
            // Обновляем мировой реестр
            if (typeof upsertWorldOccupation === 'function' && !occ.isSelfOccupation) {
                upsertWorldOccupation({
                    settlementId: occ.settlementId,
                    turnsRemaining: occ.turnsRemaining,
                    status: occ.status
                });
            }
        }
        if (occ.turnsRemaining === 0) {
            if (occ.isSelfOccupation) selfToComplete.push(occ);
            else toComplete.push(occ);
        }
    }

    for (let occ of selfToComplete) {
        completeSelfOccupation(occ);
        window.occupations = window.occupations.filter(o => o !== occ);
        if (typeof removeWorldOccupation === 'function') removeWorldOccupation(occ.settlementId);
    }
    if (selfToComplete.length > 0) changed = true;

    if (changed && typeof saveAllData === 'function') saveAllData();

    // Доход от наших оккупаций
    if (window.occupations.some(o => !o.isSelfOccupation)) {
        collectOccupationIncome();
    }

    if (toComplete.length > 0) {
        showAnnexationCompleteModal(toComplete[0]);
    }

    if (typeof deduplicateProvinces === 'function') {
        const removed = deduplicateProvinces();
        if (removed > 0 && typeof addGlobalLog === 'function') {
            addGlobalLog(`🔧 Объединено дубликатов провинций: ${removed}`, 'general');
        }
    }
}
window.processOccupations = processOccupations;

// ---------- Экономика оккупаций ----------

function getOccupationIncome(occ) {
    const settlement = SETTLEMENTS_DB[occ.settlementId];
    if (!settlement) return 0;
    const totalPop = getSettlementPopulationEstimate(settlement);
    const taxRate = (typeof peopleState !== 'undefined' && peopleState.settings)
        ? (peopleState.settings.taxRate || 1) : 1;
    return Math.floor(totalPop * taxRate * 0.25);
}

function getOccupationResources(occ) {
    const settlement = SETTLEMENTS_DB[occ.settlementId];
    if (!settlement) return {};
    const income = {};
    const buildings = settlement.buildings || [];
    if (buildings.length > 0) {
        for (let b of buildings) {
            if (!b.completed || !b.income) continue;
            for (let key in b.income) {
                const amount = b.income[key] || 0;
                if (amount <= 0) continue;
                income[key] = (income[key] || 0) + Math.floor(amount * 0.25);
            }
        }
    }
    return income;
}

function getOccupationTargetProvince(occ) {
    if (typeof provincesData === 'undefined') return null;
    const capitalId = Object.keys(provincesData).find(pid => provincesData[pid].isCapital);
    return capitalId || Object.keys(provincesData)[0] || null;
}

function collectOccupationIncome() {
    if (!window.occupations || window.occupations.length === 0) return;

    let totalErs = 0;
    const resourcesByProvince = {};

    for (let occ of window.occupations) {
        if (occ.status === 'annexed') continue;
        if (!occ.sourceProvinceId) continue;

        const targetProvinceId = getOccupationTargetProvince(occ);
        if (!targetProvinceId || !provincesData[targetProvinceId]) continue;

        const ers = getOccupationIncome(occ);
        if (ers > 0) {
            provincesData[targetProvinceId].resources.ers =
                (provincesData[targetProvinceId].resources.ers || 0) + ers;
            totalErs += ers;
        }

        const res = getOccupationResources(occ);
        for (let key in res) {
            if (key === 'ers') continue;
            if (!resourcesByProvince[targetProvinceId]) resourcesByProvince[targetProvinceId] = {};
            resourcesByProvince[targetProvinceId][key] =
                (resourcesByProvince[targetProvinceId][key] || 0) + res[key];
        }
    }

    for (let pid in resourcesByProvince) {
        if (!provincesData[pid]) continue;
        for (let key in resourcesByProvince[pid]) {
            provincesData[pid].resources[key] =
                (provincesData[pid].resources[key] || 0) + resourcesByProvince[pid][key];
        }
    }

    if (totalErs > 0 && typeof addGlobalLog === 'function') {
        addGlobalLog(`💰 Доход от оккупаций: +${totalErs.toLocaleString()} эрс.`, 'general');
    }
}

// ============================================================================
// РАЗДЕЛ 6: ФИНАЛИЗАЦИЯ АННЕКСИИ
// ============================================================================

function findOrCreateAnnexedProvince(sourceProvinceId) {
    if (typeof provincesData === 'undefined') return null;
    if (!sourceProvinceId || sourceProvinceId === 'unknown') return null;

    const sourceName = getProvinceName(sourceProvinceId);

    // Ищем провинцию с таким же именем
    for (let pid in provincesData) {
        if (pid === sourceProvinceId) continue;
        const prov = provincesData[pid];
        if (!prov) continue;
        const name = getProvinceName(pid);
        const cleanName = name.replace(/\s*\(аннексировано\)$/, '');
        if (cleanName === sourceName) return pid;
    }

    // Не нашли — создаём
    const newId = 'annexed_' + sourceProvinceId + '_' + Date.now();
    if (typeof PROVINCE_NAMES !== 'undefined') {
        PROVINCE_NAMES[newId] = sourceName;
    }
    provincesData[newId] = {
        settlements: [],
        resources: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0,
                     sword_iron: 0, bison: 0, elven_tobacco: 0, elixir: 0 },
        races: [],
        army: [],
        capturedSettlements: [],
        lostSettlements: [],
        isCapital: false,
        isAnnexed: true,
        originalProvinceId: sourceProvinceId,
        customName: sourceName
    };

    if (typeof addGlobalLog === 'function') {
        addGlobalLog(`🏛️ Создана новая провинция «${sourceName}».`, 'general');
    }
    return newId;
}
window.findOrCreateAnnexedProvince = findOrCreateAnnexedProvince;

function finalizeAnnexation(occ, settlementData) {
    const myFid = _myFid();
    const d = _myDate();
    const sid = settlementData.id;
    const sourceProvinceId = occ.sourceProvinceId;

    const fromFid = (typeof getSettlementOwnerLatest === 'function')
        ? getSettlementOwnerLatest(sid) : null;

    // Целевая провинция у нас
    const targetProvinceId = findOrCreateAnnexedProvince(sourceProvinceId)
        || window.currentProvince;

    // ЕДИНАЯ ТОЧКА: журнал + мгновенное применение к нашей фракции
    if (_hasRegistry()) {
        window.transferOwnership(sid, fromFid, myFid, d, 'annexation', {
            targetProvinceId,
            buildings: settlementData.buildings || []
        });
    } else {
        console.warn('⚠️ transferOwnership не найден, используется fallback');
        if (!isSettlementAlreadyExists(sid)) {
            if (!provincesData[targetProvinceId]) {
                provincesData[targetProvinceId] = {
                    settlements: [], resources: {}, races: [], army: [],
                    capturedSettlements: [], lostSettlements: []
                };
            }
            provincesData[targetProvinceId].settlements.push({
                id: sid,
                name: settlementData.name,
                type: settlementData.type,
                buildings: settlementData.buildings || [],
                captured: false, capturedByFaction: null, capturedData: null,
                vassalHouse: null
            });
        }
    }

    // Добавляем население
    if (occ.populationToAdd && occ.populationToAdd.length > 0) {
        if (provincesData[targetProvinceId]) {
            for (let pop of occ.populationToAdd) {
                const ex = provincesData[targetProvinceId].races.find(r => r.name === pop.name);
                if (ex) {
                    ex.adultMale += pop.adultMale || 0;
                    ex.adultFemale += pop.adultFemale || 0;
                } else {
                    provincesData[targetProvinceId].races.push(pop);
                }
            }
        }
    }

    // Убираем активную оккупацию
    window.occupations = window.occupations.filter(o => o.settlementId !== sid);
    if (typeof removeWorldOccupation === 'function') removeWorldOccupation(sid);

    window.currentProvince = targetProvinceId;

    if (typeof deduplicateProvinces === 'function') deduplicateProvinces();
    if (typeof recalcTotalTreasury === 'function') recalcTotalTreasury();
    if (typeof saveAllData === 'function') saveAllData();
    if (typeof renderWarPanel === 'function') renderWarPanel();
    if (typeof updateProvinceSelect === 'function') updateProvinceSelect();
    if (typeof refreshBuildingsUI === 'function') refreshBuildingsUI();
    if (typeof renderSettlements === 'function') renderSettlements();
    if (typeof renderProvinceDashboard === 'function') renderProvinceDashboard();
    if (typeof renderProvinceCells === 'function') renderProvinceCells();
    if (typeof updateTreasuryDisplay === 'function') updateTreasuryDisplay();

    if (typeof updateSharedMapData === 'function') updateSharedMapData(sid, myFid);
    if (typeof addCityMarkers === 'function') setTimeout(addCityMarkers, 100);

    if (typeof addGlobalLog === 'function') {
        addGlobalLog(`🏛️ «${settlementData.name}» аннексировано! Провинция «${getProvinceName(targetProvinceId)}».`, 'general');
    }
}
window.finalizeAnnexation = finalizeAnnexation;

// ============================================================================
// РАЗДЕЛ 7: НАСЕЛЕНИЕ ПРИ АННЕКСИИ
// ============================================================================

const STARTING_RACES_BY_PROVINCE = {
    orochima: [
        { name: "Оку", weight: 60 }, { name: "Люди", weight: 13 },
        { name: "Гоблины", weight: 20 }, { name: "Вульфины", weight: 4 },
        { name: "Тайро", weight: 2 }, { name: "Дварфы", weight: 1 }
    ],
    kaya: [
        { name: "Люди", weight: 55 }, { name: "Дварфы", weight: 20 },
        { name: "Гоблины", weight: 8 }, { name: "Оку", weight: 3 },
        { name: "Высшие эльфы", weight: 3 }, { name: "Вульфины", weight: 3 },
        { name: "Лепусиды (высшие)", weight: 3 }
    ],
    vogel: [
        { name: "Люди", weight: 60 }, { name: "Дварфы", weight: 22 },
        { name: "Гоблины", weight: 5 }, { name: "Высшие эльфы", weight: 5 },
        { name: "Вульфины", weight: 4 }, { name: "Лепусиды (высшие)", weight: 4 }
    ],
    neolania: [
        { name: "Люди", weight: 65 }, { name: "Дварфы", weight: 25 },
        { name: "Высшие эльфы", weight: 10 }
    ],
    metropolitan_area: [
        { name: "Люди", weight: 55 }, { name: "Оку", weight: 12 },
        { name: "Гоблины", weight: 10 }, { name: "Дварфы", weight: 8 },
        { name: "Высшие эльфы", weight: 5 }, { name: "Вульфины", weight: 3 },
        { name: "Лепусиды (высшие)", weight: 3 }, { name: "Лепусиды (карликовые)", weight: 2 },
        { name: "Тайро", weight: 2 }
    ],
    great_shaft: [
        { name: "Люди", weight: 50 }, { name: "Оку", weight: 20 },
        { name: "Гоблины", weight: 12 }, { name: "Дварфы", weight: 10 },
        { name: "Вульфины", weight: 5 }, { name: "Тайро", weight: 3 }
    ],
    thronax: [
        { name: "Люди", weight: 45 }, { name: "Вульфины", weight: 15 },
        { name: "Тайро", weight: 10 }, { name: "Высшие эльфы", weight: 8 },
        { name: "Полукровка (Люди+Высшие эльфы)", weight: 12 },
        { name: "Гоблины", weight: 5 }, { name: "Оку", weight: 3 },
        { name: "Дварфы", weight: 2 }
    ],
    mutsura: [
        { name: "Оку", weight: 65 }, { name: "Гоблины", weight: 20 },
        { name: "Люди", weight: 10 }, { name: "Вульфины", weight: 3 },
        { name: "Дварфы", weight: 2 }
    ],
    ottergrund: [{ name: "Люди", weight: 80 }, { name: "Дварфы", weight: 15 }, { name: "Высшие эльфы", weight: 5 }],
    meyan: [{ name: "Люди", weight: 75 }, { name: "Дварфы", weight: 15 }, { name: "Оку", weight: 5 }, { name: "Вульфины", weight: 5 }],
    dionia: [{ name: "Люди", weight: 80 }, { name: "Дварфы", weight: 12 }, { name: "Высшие эльфы", weight: 8 }],
    takania: [{ name: "Люди", weight: 75 }, { name: "Дварфы", weight: 15 }, { name: "Оку", weight: 10 }],
    nightsten: [{ name: "Люди", weight: 85 }, { name: "Дварфы", weight: 8 }, { name: "Высшие эльфы", weight: 7 }],
    moonmane: [{ name: "Вульфины", weight: 65 }, { name: "Люди", weight: 25 }, { name: "Лепусиды (карликовые)", weight: 10 }],
    lorein: [{ name: "Люди", weight: 60 }, { name: "Дварфы", weight: 20 }, { name: "Высшие эльфы", weight: 15 }, { name: "Оку", weight: 5 }],
    luun: [{ name: "Вульфины", weight: 45 }, { name: "Люди", weight: 30 }, { name: "Лепусиды (высшие)", weight: 15 }, { name: "Дварфы", weight: 10 }],
    corvail: [{ name: "Люди", weight: 65 }, { name: "Дварфы", weight: 15 }, { name: "Оку", weight: 12 }, { name: "Вульфины", weight: 8 }],
    mensen: [{ name: "Люди", weight: 70 }, { name: "Дварфы", weight: 20 }, { name: "Высшие эльфы", weight: 10 }]
};
const DEFAULT_RACES = [{ name: "Люди", weight: 100 }];

function getPopulationRangeForType(type) {
    if (type === 'city') return { min: 5000, max: 10000 };
    if (type === 'castle') return { min: 1500, max: 3000 };
    if (type === 'village') return { min: 500, max: 1000 };
    return { min: 500, max: 1000 };
}

function generatePopulationForSettlement(settlement, provinceId) {
    const range = getPopulationRangeForType(settlement.type);
    const total = Math.floor(range.min + Math.random() * (range.max - range.min));
    const weights = STARTING_RACES_BY_PROVINCE[provinceId] || DEFAULT_RACES;
    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    const result = [];
    for (let w of weights) {
        const share = Math.round(total * (w.weight / totalWeight));
        if (share <= 0) continue;
        const male = Math.floor(share / 2);
        const female = share - male;
        result.push({
            name: w.name, adultMale: male, adultFemale: female,
            children: 0, elders: 0, birthRate: 2.0, deathRate: 1.0
        });
    }
    return result;
}

function buildPopulationRowsHtml(occ) {
    const weights = STARTING_RACES_BY_PROVINCE[occ.sourceProvinceId] || DEFAULT_RACES;
    const settlement = SETTLEMENTS_DB[occ.settlementId];
    const type = settlement?.type || 'village';
    let basePop = 800;
    if (type === 'castle') basePop = 2500;
    if (type === 'city') basePop = 8000;

    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    let html = '';
    for (let w of weights) {
        const share = Math.round(basePop * (w.weight / totalWeight));
        html += `
            <div class="annex-pop-row" data-race="${escapeHtml(w.name)}">
                <span class="annex-pop-name">${escapeHtml(w.name)}</span>
                <input type="number" class="annex-pop-input" data-race="${escapeHtml(w.name)}"
                       value="${share}" min="0" max="100000" step="10" style="width:100px;">
                <span class="annex-pop-unit">чел.</span>
            </div>`;
    }
    html += `<div class="annex-pop-total"><strong>Всего:</strong> <span id="annexPopTotal">${basePop.toLocaleString()}</span> чел.</div>`;
    return html;
}

// ============================================================================
// РАЗДЕЛ 8: МОДАЛКА АННЕКСИИ
// ============================================================================

function showAnnexationCompleteModal(occ) {
    const settlement = SETTLEMENTS_DB[occ.settlementId];
    if (!settlement) return;

    const myFid = _myFid();
    const myDate = _myDate();
    const leaderGender = (typeof factionCouncils !== 'undefined' && factionCouncils[myFid])
        ? factionCouncils[myFid].rulerGender : 'male';
    const appeal = leaderGender === 'female' ? 'Госпожа' : 'Господин';

    let buildingRowsHtml = '';
    if (typeof buildingsCatalog !== 'undefined') {
        for (let key in buildingsCatalog) {
            const b = buildingsCatalog[key];
            if (b.isDummy) continue;
            if (b.faction && b.faction !== occ.targetFactionId) continue;
            buildingRowsHtml += `
                <div class="annex-building-row" data-key="${key}">
                    <label class="annex-check">
                        <input type="checkbox" class="annex-building-chk" data-key="${key}">
                        <span>${escapeHtml(b.name)}</span>
                    </label>
                    <div class="annex-status" style="display:none;">
                        <label><input type="radio" name="status_${key}" value="done" checked> Завершена</label>
                        <label><input type="radio" name="status_${key}" value="progress"> Строится:
                            <input type="number" class="annex-turns-input" data-key="${key}" value="1" min="1" max="10" style="width:50px;">
                            ход(ов)
                        </label>
                    </div>
                </div>`;
        }
    }

    const modal = document.createElement('div');
    modal.id = 'annexBuildingModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(10,8,14,0.94);z-index:10010;display:flex;justify-content:center;align-items:center;padding:20px;';
    modal.innerHTML = `
        <div class="annex-modal-container">
            <div class="war-declaration-header">
                <h3>🏛️ Аннексия завершена</h3>
            </div>
            <div class="annex-modal-body">
                <div class="annex-appeal">
                    <strong>${appeal},</strong> поселение <strong>${escapeHtml(settlement.name)}</strong>
                    (${settlement.type === 'city' ? 'город' : (settlement.type === 'castle' ? 'замок' : 'деревня')})
                    теперь под нашим контролем!
                </div>
                <div class="annex-hint">Укажите, какие постройки были обнаружены:</div>
                <div class="annex-buildings-list">${buildingRowsHtml || '<div class="war-empty">Нет доступных построек.</div>'}</div>
                <div class="annex-hint" style="margin-top:16px;">Укажите население, присоединяющееся к вашей фракции:</div>
                <div class="annex-population-list">${buildPopulationRowsHtml(occ)}</div>
            </div>
            <div class="annex-modal-footer">
                <button id="annexConfirmBtn" class="occ-btn occ-btn-annex">✅ Принять</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelectorAll('.annex-building-chk').forEach(chk => {
        chk.addEventListener('change', () => {
            const row = chk.closest('.annex-building-row');
            const statusDiv = row.querySelector('.annex-status');
            statusDiv.style.display = chk.checked ? 'flex' : 'none';
        });
    });

    const popInputs = modal.querySelectorAll('.annex-pop-input');
    function updatePopTotal() {
        let total = 0;
        popInputs.forEach(inp => total += parseInt(inp.value) || 0);
        const el = modal.querySelector('#annexPopTotal');
        if (el) el.textContent = total.toLocaleString();
    }
    popInputs.forEach(inp => inp.addEventListener('input', updatePopTotal));
    updatePopTotal();

    modal.querySelector('#annexConfirmBtn').addEventListener('click', () => {
        const selectedBuildings = [];
        modal.querySelectorAll('.annex-building-chk:checked').forEach(chk => {
            const key = chk.dataset.key;
            const row = chk.closest('.annex-building-row');
            const status = row.querySelector(`input[name="status_${key}"]:checked`)?.value || 'done';
            const turns = parseInt(row.querySelector('.annex-turns-input')?.value) || 0;
            selectedBuildings.push({
                key,
                completed: status === 'done',
                remainingTurns: status === 'progress' ? turns : 0
            });
        });

        const buildings = selectedBuildings.map(sb => {
            const b = buildingsCatalog[sb.key];
            return {
                id: 'annex_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                name: b.name,
                completed: sb.completed,
                remainingTurns: sb.remainingTurns || undefined,
                level: 1,
                baseName: sb.key,
                income: b.income || {},
                special: b.special || null,
                category: b.category || null,
                isUpgrade: false
            };
        });

        const settlementData = {
            id: settlement.id,
            name: settlement.name,
            type: settlement.type,
            buildings
        };

        const populationToAdd = [];
        modal.querySelectorAll('.annex-pop-input').forEach(inp => {
            const count = parseInt(inp.value) || 0;
            if (count <= 0) return;
            const raceName = inp.dataset.race;
            const male = Math.floor(count / 2);
            populationToAdd.push({
                name: raceName,
                adultMale: male,
                adultFemale: count - male,
                children: 0, elders: 0,
                birthRate: 2.0, deathRate: 1.0
            });
        });
        occ.populationToAdd = populationToAdd;

        finalizeAnnexation(occ, settlementData);
        modal.remove();

        const next = window.occupations.find(o =>
            o.status === 'annexing' || (o.status === 'occupying' && o.turnsRemaining === 0));
        if (next && next !== occ) {
            setTimeout(() => showAnnexationCompleteModal(next), 300);
        }
    });
}
window.showAnnexationCompleteModal = showAnnexationCompleteModal;

// ============================================================================
// РАЗДЕЛ 9: UI — ПАНЕЛЬ ВОЙНЫ
// ============================================================================

function renderWarPanel() {
    const container = document.getElementById('warFactionsList');
    if (!container) return;

    // Синхронизируем локальные данные с мировым реестром
    if (typeof syncWarsFromWorld === 'function') syncWarsFromWorld();

    container.innerHTML = '';
    if (typeof renderWarSummary === 'function') renderWarSummary();

    // Активные войны, где МЫ агрессор
    const myFid = _myFid();
    const activeWars = window.wars.filter(w => w.aggressor === myFid);

    for (let war of activeWars) {
        const block = document.createElement('div');
        block.className = 'war-faction-block';
        block.id = 'war-block-' + war.defender;
        renderWarFactionBlock(war.defender, block);
        container.appendChild(block);
    }

    if (activeWars.length === 0) {
        container.innerHTML = `
            <div class="war-empty">
                ⚔️ Вы не воюете ни с кем.<br>
                <span style="font-size:0.85rem;">Нажмите «Объявить войну», чтобы начать.</span>
            </div>`;
    }

    if (typeof renderLostSettlements === 'function') renderLostSettlements();
}
window.renderWarPanel = renderWarPanel;

/**
 * Категоризация поселений для блока войны с конкретным врагом.
 * Возвращает объект с массивами ID.
 */
function buildWarCategories(enemyFid, myFid, myDate) {
    const cats = {
        freeEnemy: [],       // Свободные поселения врага (мы можем атаковать)
        ourOccupation: [],   // Мы активно оккупируем
        ourAnnexed: [],      // Мы отвоевали у врага (или держим то, что враг когда-то держал)
        ourFree: [],         // Наши земли, враг к ним не прикасался
        lostToEnemy: [],     // Враг отобрал у нас
        enemyOccupiedUs: []  // Враг активно оккупирует наше
    };

    const owners = (typeof getAllOwnersAt === 'function')
        ? getAllOwnersAt(myDate) : {};
    const worldOccs = (typeof loadWorldOccupations === 'function')
        ? loadWorldOccupations() : [];
    const occMap = {};
    for (let o of worldOccs) {
        if (o.status !== 'occupying' && o.status !== 'self_occupying') continue;
        occMap[o.settlementId] = o;
    }

    // История ДО текущей даты
    const allLog = (typeof loadOwnershipLog === 'function') ? loadOwnershipLog() : [];
    const myTurn = _turnOf(myDate);
    const histMap = {};
    for (let e of allLog) {
        if (e.turn > myTurn) continue;
        if (!histMap[e.sid]) histMap[e.sid] = [];
        histMap[e.sid].push(e);
    }

    for (let sid in SETTLEMENTS_DB) {
        const s = SETTLEMENTS_DB[sid];
        const initial = s.faction;
        const hist = histMap[sid] || [];
        const owner = owners[sid] ?? null;
        const occ = occMap[sid];

        // Кто владеет СЕЙЧАС
        const ownedByMe = (owner === myFid);
        const ownedByEnemy = (owner === enemyFid);

        // Кто-нибудь когда-нибудь держал (initial + история)
        let everHeldByMe = (initial === myFid);
        let everHeldByEnemy = (initial === enemyFid);
        for (let e of hist) {
            if (e.to === myFid) everHeldByMe = true;
            if (e.to === enemyFid) everHeldByEnemy = true;
        }

        // ===== 1. АКТИВНАЯ ОККУПАЦИЯ (перебивает всё) =====
        if (occ) {
            if (occ.occupierFactionId === myFid && occ.defenderFactionId === enemyFid) {
                cats.ourOccupation.push(sid);
                continue;
            }
            if (occ.occupierFactionId === enemyFid && occ.defenderFactionId === myFid) {
                cats.enemyOccupiedUs.push(sid);
                continue;
            }
            // Оккупация третьей стороной — не наше дело в этой войне
            continue;
        }

        // ===== 2. ПО ТЕКУЩЕМУ ВЛАДЕНИЮ =====
        if (ownedByMe) {
            if (everHeldByEnemy) {
                // Мы когда-то отобрали у врага → наша добыча
                cats.ourAnnexed.push(sid);
            } else {
                // Исконно наше, или мы взяли у третьей стороны
                cats.ourFree.push(sid);
            }
        } else if (ownedByEnemy) {
            if (everHeldByMe) {
                // Враг отобрал у нас → потеряно
                cats.lostToEnemy.push(sid);
            } else {
                // Исконно врага ИЛИ он отобрал у третьей стороны
                // (важно: даже если third party, показываем — это цель для атаки!)
                cats.freeEnemy.push(sid);
            }
        }
        // owner = null или третья сторона → не в этой войне, пропускаем
    }

    return cats;
}

/**
 * Группирует ID поселений по их ИСХОДНОЙ провинции (из SETTLEMENTS_DB).
 */
function groupSettlementsByProvince(sidList) {
    const groups = new Map();
    for (let sid of sidList) {
        const provId = SETTLEMENTS_DB[sid]?.province || 'unknown';
        if (!groups.has(provId)) groups.set(provId, []);
        groups.get(provId).push(sid);
    }
    return groups;
}

function renderWarFactionBlock(factionId, blockEl) {
    if (!blockEl) blockEl = document.getElementById('war-block-' + factionId);
    if (!blockEl) return;

    const myFid = _myFid();
    const myDate = _myDate();
    const factionName = (typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[factionId])
        ? FACTION_NAMES[factionId] : factionId;
    const coat = (typeof FACTION_MAIN_COATS !== 'undefined' && FACTION_MAIN_COATS[factionId])
        ? FACTION_MAIN_COATS[factionId] : 'icons/emblem/default_coat.png';
    const ruler = (typeof FACTION_RULERS !== 'undefined' && FACTION_RULERS[factionId])
        ? FACTION_RULERS[factionId] : 'Неизвестный';

    // Категории
    const cats = buildWarCategories(factionId, myFid, myDate);
    const worldOccs = (typeof loadWorldOccupations === 'function')
        ? loadWorldOccupations() : [];

    // ---------- Рендер плитки ----------
    const renderTile = (sid, cls, icon, extraHtml, source) => {
        const s = SETTLEMENTS_DB[sid];
        if (!s) return '';
        const provinceName = getProvinceName(s.province);
        return `
            <div class="${cls}" data-settlement-id="${sid}" data-faction-id="${factionId}" data-source="${source}">
                <div class="tile-label">${escapeHtml(s.name)}</div>
                <div class="tile-province">${escapeHtml(provinceName)}</div>
                <div class="tile-icon">${icon}</div>
                ${extraHtml || ''}
            </div>`;
    };

    // ---------- Рендер группы по провинциям ----------
    const renderProvinceSection = (sidList, sectionTitle, renderer) => {
        if (!sidList.length) return '';
        const groups = groupSettlementsByProvince(sidList);
        let html = `<div class="war-section-title">${sectionTitle} (${sidList.length})</div>`;
        for (let [provId, list] of groups) {
            const pname = getProvinceName(provId);
            html += `<div class="war-province-block">
                <div class="war-province-header">🏛️ ${escapeHtml(pname)} (${list.length})</div>
                <div class="war-settlements-grid">${list.map(renderer).join('')}</div>
            </div>`;
        }
        return html;
    };

    let html = `
        <div class="war-header">
            <img src="${coat}" alt="" class="war-coat" onerror="this.style.display='none'">
            <div class="war-title-block">
                <div class="war-faction-name">${escapeHtml(factionName)}</div>
                <div class="war-ruler">👑 ${escapeHtml(ruler)}</div>
            </div>
            <button class="war-close-btn" data-faction-id="${factionId}">🕊️ Мир</button>
        </div>`;

    // 1. Свободные врага
    html += renderProvinceSection(cats.freeEnemy,
        '🏘️ Свободные поселения врага',
        (sid) => renderTile(sid, 'settlement-tile', '🏠', '', 'enemy-free'));

    // 2. Оккупировано нами
    html += renderProvinceSection(cats.ourOccupation,
        '⚔️ Оккупировано нами',
        (sid) => {
            const occ = worldOccs.find(o => o.settlementId === sid);
            const timerHtml = occ && occ.turnsRemaining > 0
                ? `<div class="tile-timer">⏳ ${occ.turnsRemaining}</div>` : '';
            const ers = getOccupationIncome({ settlementId: sid });
            const incomeHtml = ers > 0 ? `<div class="tile-income">💰 +${ers}</div>` : '';
            return renderTile(sid, 'settlement-tile occupying', '⚔️', timerHtml + incomeHtml, 'enemy-occupied');
        });

    // 3. Наша добыча
    html += renderProvinceSection(cats.ourAnnexed,
        '🏠 Аннексировано нами',
        (sid) => {
            const s = SETTLEMENTS_DB[sid];
            const typeIcon = s.type === 'city' ? '🏛️' : (s.type === 'castle' ? '🏰' : '🏘️');
            return renderTile(sid, 'my-settlement-tile', typeIcon, '', 'enemy-annexed');
        });

    // 4. Потеряно нами (враг аннексировал)
    html += renderProvinceSection(cats.lostToEnemy,
        '🏴 Потеряно нами (аннексия врагом)',
        (sid) => renderTile(sid, 'my-settlement-tile lost-tile', '🏴', '', 'our-lost'));

    // 5. Оккупировано врагом
    html += renderProvinceSection(cats.enemyOccupiedUs,
        '🏴 Оккупировано врагом',
        (sid) => {
            const occ = worldOccs.find(o => o.settlementId === sid);
            const timerHtml = occ && occ.turnsRemaining > 0
                ? `<div class="tile-timer">⏳ ${occ.turnsRemaining}</div>` : '';
            return renderTile(sid, 'settlement-tile self-occupying', '🏴', timerHtml, 'our-occupied');
        });

    // 6. Наши земли
    html += renderProvinceSection(cats.ourFree,
        '🏘️ Наши поселения',
        (sid) => renderTile(sid, 'settlement-tile our-free', '🏠', '', 'our-free'));

    blockEl.innerHTML = html;

    // Обработчики
    blockEl.querySelectorAll('[data-settlement-id]').forEach(el => {
        el.addEventListener('click', () => {
            openSettlementActionModal(el.dataset.settlementId, el.dataset.factionId, el.dataset.source);
        });
    });

    const closeBtn = blockEl.querySelector('.war-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => closeWar(factionId));
}

// ============================================================================
// РАЗДЕЛ 10: СВОДКА
// ============================================================================

function renderWarSummary() {
    const container = document.getElementById('warSummary');
    if (!container) return;

    const myFid = _myFid();
    const myDate = _myDate();
    const owners = (typeof getAllOwnersAt === 'function') ? getAllOwnersAt(myDate) : {};
    const worldOccs = (typeof loadWorldOccupations === 'function')
        ? loadWorldOccupations() : [];

    let myOcc = 0, mySelfOcc = 0, myAnnexed = 0, myLost = 0;

    for (let o of worldOccs) {
        if (o.occupierFactionId === myFid && o.status === 'occupying') myOcc++;
        if (o.defenderFactionId === myFid && o.status === 'occupying') mySelfOcc++;
    }

    for (let sid in owners) {
        const owner = owners[sid];
        const s = SETTLEMENTS_DB[sid];
        if (!s) continue;

        if (owner === myFid && s.faction !== myFid) myAnnexed++;
        if (owner !== myFid && owner !== null && s.faction === myFid) {
            // Проверяем, что это не третья сторона
            if (typeof areFactionsAtWarAt === 'function' && areFactionsAtWarAt(myFid, owner, myDate)) {
                myLost++;
            }
        }
    }

    if (myOcc + mySelfOcc + myAnnexed + myLost === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <div class="war-summary-panel">
            <div class="war-summary-title">📊 Общая картина</div>
            <div class="war-summary-grid">
                <div class="war-summary-item">
                    <div class="war-summary-icon">⚔️</div>
                    <div class="war-summary-num">${myOcc}</div>
                    <div class="war-summary-label">оккупировано нами</div>
                </div>
                <div class="war-summary-item">
                    <div class="war-summary-icon">🏠</div>
                    <div class="war-summary-num">${myAnnexed}</div>
                    <div class="war-summary-label">аннексировано нами</div>
                </div>
                <div class="war-summary-item">
                    <div class="war-summary-icon">🏴</div>
                    <div class="war-summary-num">${mySelfOcc}</div>
                    <div class="war-summary-label">оккупировано врагом</div>
                </div>
                <div class="war-summary-item">
                    <div class="war-summary-icon">💀</div>
                    <div class="war-summary-num">${myLost}</div>
                    <div class="war-summary-label">потеряно нами</div>
                </div>
            </div>
        </div>
    `;
}
window.renderWarSummary = renderWarSummary;

// ============================================================================
// РАЗДЕЛ 11: СПИСОК ПОТЕРЯННЫХ ЗЕМЕЛЬ
// ============================================================================

function getLostSettlements() {
    const myFid = _myFid();
    const myDate = _myDate();
    const owners = (typeof getAllOwnersAt === 'function') ? getAllOwnersAt(myDate) : {};
    const lost = [];

    for (let sid in SETTLEMENTS_DB) {
        const s = SETTLEMENTS_DB[sid];
        const owner = owners[sid];
        if (!owner || owner === myFid || owner === null) continue;

        // Было нашим когда-то?
        const hist = (typeof getSettlementHistory === 'function') ? getSettlementHistory(sid) : [];
        const myTurn = _turnOf(myDate);
        const everOurs = s.faction === myFid ||
            hist.some(e => e.turn <= myTurn && e.to === myFid);

        if (everOurs) {
            lost.push({
                settlementId: sid,
                settlementData: s,
                lostTo: owner,
                lostAt: '—',
                provinceId: s.province
            });
        }
    }
    return lost;
}

function renderLostSettlements() {
    const container = document.getElementById('lostSettlementsList');
    if (!container) return;

    const lost = getLostSettlements();
    if (lost.length === 0) {
        container.innerHTML = '';
        return;
    }

    // Группируем по провинциям
    const groups = new Map();
    for (let l of lost) {
        const provId = l.provinceId || 'unknown';
        if (!groups.has(provId)) groups.set(provId, []);
        groups.get(provId).push(l);
    }

    let html = `<div class="war-section-title" style="margin-top:20px;">💀 Потерянные земли (${lost.length})</div>`;
    for (let [provId, list] of groups) {
        const pname = getProvinceName(provId);
        html += `<div class="war-province-block">
            <div class="war-province-header">🏛️ ${escapeHtml(pname)} (${list.length})</div>
            <div class="lost-settlements-grid">`;

        for (let l of list) {
            const settlement = l.settlementData;
            const aggressorName = (typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[l.lostTo])
                ? FACTION_NAMES[l.lostTo] : l.lostTo;
            const typeName = settlement.type === 'city' ? 'Город'
                : settlement.type === 'castle' ? 'Замок' : 'Деревня';

            html += `
                <div class="lost-settlement-tile" data-settlement-id="${l.settlementId}" data-faction-id="${l.lostTo}">
                    <div class="tile-label">${escapeHtml(settlement.name)}</div>
                    <div class="tile-icon">💀</div>
                    <div class="lost-tooltip">
                        ${typeName}<br>
                        Захвачено: ${escapeHtml(aggressorName)}
                    </div>
                </div>`;
        }
        html += `</div></div>`;
    }

    container.innerHTML = html;

    container.querySelectorAll('.lost-settlement-tile').forEach(tile => {
        tile.addEventListener('click', () => {
            openLostSettlementModal(tile.dataset.settlementId, tile.dataset.factionId);
        });
    });
}
window.renderLostSettlements = renderLostSettlements;

function openLostSettlementModal(settlementId, enemyFid) {
    const settlement = SETTLEMENTS_DB[settlementId];
    if (!settlement) return;
    const aggressorName = (typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[enemyFid])
        ? FACTION_NAMES[enemyFid] : enemyFid;
    const typeName = settlement.type === 'city' ? 'Город'
        : settlement.type === 'castle' ? 'Замок' : 'Деревня';

    const modal = document.createElement('div');
    modal.className = 'war-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(10,8,14,0.92);z-index:10001;display:flex;justify-content:center;align-items:center;padding:20px;';
    modal.innerHTML = `
        <div class="settlement-action-container">
            <div class="war-declaration-header" style="border-bottom-color: #7a2a2a;">
                <h3 style="color:#ff8888;">💀 ${escapeHtml(settlement.name)}</h3>
                <button class="war-modal-close" id="lostModalClose">✖</button>
            </div>
            <div class="settlement-action-body">
                <div class="sett-action-row"><strong>Тип:</strong> ${typeName}</div>
                <div class="sett-action-row"><strong>Провинция:</strong> ${escapeHtml(getProvinceName(settlement.province))}</div>
                <div class="sett-action-row"><strong>Захвачено:</strong> ${escapeHtml(aggressorName)}</div>
            </div>
            <div class="settlement-action-footer">
                <button class="occ-btn occ-btn-annex" id="reclaimBtn">⚔️ Отвоевать</button>
                <button class="occ-btn occ-btn-cancel" id="lostCancelBtn">Закрыть</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#lostModalClose').onclick = () => modal.remove();
    modal.querySelector('#lostCancelBtn').onclick = () => modal.remove();
    modal.querySelector('#reclaimBtn').onclick = () => {
        modal.remove();
        reclaimLostSettlement(settlementId, enemyFid);
    };
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}
window.openLostSettlementModal = openLostSettlementModal;

// ============================================================================
// РАЗДЕЛ 12: МОДАЛКА ДЕЙСТВИЙ С ПОСЕЛЕНИЕМ
// ============================================================================

function openSettlementActionModal(settlementId, factionId, source) {
    const settlement = SETTLEMENTS_DB[settlementId];
    if (!settlement) return;

    const myFid = _myFid();
    const myDate = _myDate();

    // Актуальный владелец (может отличаться от source)
    const actualOwner = (typeof getSettlementOwnerAt === 'function')
        ? getSettlementOwnerAt(settlementId, myDate) : null;
    const activeOcc = window.occupations.find(o => o.settlementId === settlementId);
    const worldOcc = (typeof getWorldOccupation === 'function')
        ? getWorldOccupation(settlementId) : null;

    const factionName = (typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[factionId])
        ? FACTION_NAMES[factionId] : factionId;
    const provinceName = getProvinceName(settlement.province);
    const typeName = settlement.type === 'city' ? 'Город'
        : settlement.type === 'castle' ? 'Замок' : 'Деревня';

    let statusHtml = '';
    let buttonsHtml = '';

    if (source === 'enemy-free') {
        buttonsHtml = `
            <button class="occ-btn occ-btn-occupy" data-action="occupy">⚔️ Оккупировать</button>
            <button class="occ-btn occ-btn-annex" data-action="annex">🏛️ Присоединить</button>
            <button class="occ-btn occ-btn-cancel" data-action="cancel">Отмена</button>`;
    } else if (source === 'enemy-occupied') {
        const occ = activeOcc || worldOcc;
        if (occ) {
            statusHtml = occ.turnsRemaining > 0
                ? `<div class="occ-status occupying">⏳ ${occ.turnsRemaining} ход(ов) до аннексии</div>`
                : '<div class="occ-status occupying">🏛️ Готово к аннексии</div>';
        }
        buttonsHtml = `
            <button class="occ-btn occ-btn-annex" data-action="annex">🏛️ Присоединить</button>
            <button class="occ-btn occ-btn-occupy" data-action="remove-occupation">🕊️ Снять оккупацию</button>
            <button class="occ-btn occ-btn-lost" data-action="lost">📉 Потеряно</button>
            <button class="occ-btn occ-btn-cancel" data-action="cancel">Отмена</button>`;
    } else if (source === 'enemy-annexed') {
        statusHtml = `<div class="occ-status annexed">✅ Поселение аннексировано</div>`;
        buttonsHtml = `
            <button class="occ-btn occ-btn-lost" data-action="return-to-enemy">🏴 Вернуть врагу</button>
            <button class="occ-btn occ-btn-cancel" data-action="cancel">Закрыть</button>`;
    } else if (source === 'our-lost') {
        statusHtml = `<div class="occ-status" style="background:rgba(122,42,42,0.4);border:1px solid #ff4444;color:#ff6b6b;">
            🏴 Поселение потеряно — аннексировано врагом</div>`;
        buttonsHtml = `
            <button class="occ-btn occ-btn-annex" data-action="reclaim">⚔️ Отвоевать обратно</button>
            <button class="occ-btn occ-btn-cancel" data-action="cancel">Закрыть</button>`;
    } else if (source === 'our-occupied') {
        if (activeOcc) {
            statusHtml = `<div class="occ-status occupying">⏳ ${activeOcc.turnsRemaining} ход(ов) до передачи врагу</div>`;
        }
        buttonsHtml = `
            <button class="occ-btn occ-btn-cancel" data-action="cancel-own-occupation">🕊️ Отменить передачу</button>
            <button class="occ-btn occ-btn-cancel" data-action="cancel">Закрыть</button>`;
    } else if (source === 'our-free') {
        buttonsHtml = `
            <button class="occ-btn occ-btn-occupy" data-action="self-occupy">🏴 Отдать через оккупацию</button>
            <button class="occ-btn occ-btn-lost" data-action="self-annex">🏴 Отдать немедленно</button>
            <button class="occ-btn occ-btn-cancel" data-action="cancel">Отмена</button>`;
    } else {
        buttonsHtml = `<button class="occ-btn occ-btn-cancel" data-action="cancel">Закрыть</button>`;
    }

    const modal = document.createElement('div');
    modal.className = 'war-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(10,8,14,0.92);z-index:10001;display:flex;justify-content:center;align-items:center;padding:20px;';
    modal.innerHTML = `
        <div class="settlement-action-container">
            <div class="war-declaration-header">
                <h3>🏘️ ${escapeHtml(settlement.name)}</h3>
                <button class="war-modal-close" data-action="cancel">✖</button>
            </div>
            <div class="settlement-action-body">
                <div class="sett-action-row"><strong>Тип:</strong> ${typeName}</div>
                <div class="sett-action-row"><strong>Провинция:</strong> ${escapeHtml(provinceName)}</div>
                <div class="sett-action-row"><strong>Фракция:</strong> ${escapeHtml(factionName)}</div>
                ${statusHtml}
            </div>
            <div class="settlement-action-footer">${buttonsHtml}</div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (action === 'cancel') { modal.remove(); return; }
            modal.remove();

            if (action === 'occupy') startOccupation(settlementId, factionId);
            else if (action === 'annex') startAnnexation(settlementId, factionId);
            else if (action === 'remove-occupation') removeOccupation(settlementId, false);
            else if (action === 'lost') removeOccupation(settlementId, true);
            else if (action === 'self-occupy') startSelfOccupation(settlementId, factionId);
            else if (action === 'self-annex') startSelfAnnexation(settlementId, factionId);
            else if (action === 'cancel-own-occupation') removeOccupation(settlementId, false);
            else if (action === 'reclaim') reclaimLostSettlement(settlementId, factionId);
            else if (action === 'return-to-enemy') returnAnnexedToEnemy(settlementId, factionId);
        });
    });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}
window.openSettlementActionModal = openSettlementActionModal;

// ============================================================================
// РАЗДЕЛ 13: МОДАЛКА ПОТЕРИ
// ============================================================================

function showSettlementLostModal(name, typeName) {
    const myFid = _myFid();
    const leaderGender = (typeof factionCouncils !== 'undefined' && factionCouncils[myFid])
        ? factionCouncils[myFid].rulerGender : 'male';
    const appeal = leaderGender === 'female' ? 'Госпожа' : 'Господин';

    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(10,8,14,0.94);z-index:10011;display:flex;justify-content:center;align-items:center;padding:20px;';
    modal.innerHTML = `
        <div class="war-declaration-container" style="max-width:520px;">
            <div class="war-declaration-header" style="border-bottom-color: #7a2a2a;">
                <h3 style="color: #ff6b6b;">📉 Потеря поселения</h3>
            </div>
            <div style="padding:24px 20px; text-align:center;">
                <div style="font-size:3rem; margin-bottom:16px;">💀</div>
                <div style="font-size:1.05rem; line-height:1.6; color:#d4c9b8;">
                    <strong style="color:#ff6b6b;">${appeal},</strong> мы потеряли ${escapeHtml(typeName)}
                    <strong style="color:#ffd966;">${escapeHtml(name)}</strong>.
                </div>
                <div style="margin-top:16px; font-size:0.9rem; color:#8a7a5a;">
                    Враг захватил наши земли. Мы должны собраться с силами и вернуть их!
                </div>
            </div>
            <div class="settlement-action-footer" style="justify-content:center;">
                <button id="lostAckBtn" class="occ-btn occ-btn-cancel" style="padding:12px 40px;">Понятно</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#lostAckBtn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}
window.showSettlementLostModal = showSettlementLostModal;

// ============================================================================
// РАЗДЕЛ 14: ДЕДУПЛИКАЦИЯ ПРОВИНЦИЙ
// ============================================================================

function isSettlementAlreadyExists(settlementId) {
    if (typeof provincesData === 'undefined') return false;
    for (let pid in provincesData) {
        const prov = provincesData[pid];
        if (!prov) continue;
        if (prov.settlements?.some(s => s.id === settlementId)) return true;
        if (prov.lostSettlements?.some(l => l.settlementId === settlementId)) return true;
    }
    return false;
}
window.isSettlementAlreadyExists = isSettlementAlreadyExists;

function deduplicateProvinces() {
    if (typeof provincesData === 'undefined') return 0;

    const byName = new Map();
    for (let pid in provincesData) {
        const name = getProvinceName(pid);
        if (!name || name === '—') continue;
        const cleanName = name.replace(/\s*\(аннексировано\)$/, '').trim();
        if (!byName.has(cleanName)) byName.set(cleanName, []);
        byName.get(cleanName).push(pid);
    }

    let removedCount = 0;

    for (let [name, pids] of byName.entries()) {
        if (pids.length <= 1) continue;
        let mainPid = pids.find(pid => !pid.startsWith('annexed_'));
        if (!mainPid) {
            mainPid = pids.reduce((oldest, pid) => {
                const ts = parseInt(pid.split('_').pop()) || Infinity;
                const oldestTs = parseInt(oldest.split('_').pop()) || Infinity;
                return ts < oldestTs ? pid : oldest;
            }, pids[0]);
        }
        const mainProv = provincesData[mainPid];
        if (!mainProv) continue;

        const existingSettlementIds = new Set((mainProv.settlements || []).map(s => s.id));
        const existingLostIds = new Set((mainProv.lostSettlements || []).map(l => l.settlementId));

        const duplicates = pids.filter(pid => pid !== mainPid);
        for (let pid of duplicates) {
            const prov = provincesData[pid];
            if (!prov) continue;

            for (let s of (prov.settlements || [])) {
                if (existingSettlementIds.has(s.id)) continue;
                if (!mainProv.settlements) mainProv.settlements = [];
                mainProv.settlements.push(s);
                existingSettlementIds.add(s.id);
            }
            for (let l of (prov.lostSettlements || [])) {
                if (existingLostIds.has(l.settlementId)) continue;
                if (!mainProv.lostSettlements) mainProv.lostSettlements = [];
                mainProv.lostSettlements.push(l);
                existingLostIds.add(l.settlementId);
            }
            if (prov.resources && mainProv.resources) {
                for (let key in prov.resources) {
                    mainProv.resources[key] = (mainProv.resources[key] || 0) + (prov.resources[key] || 0);
                }
            }
            if (prov.races) {
                if (!mainProv.races) mainProv.races = [];
                for (let race of prov.races) {
                    const existing = mainProv.races.find(r => r.name === race.name);
                    if (existing) {
                        existing.adultMale = (existing.adultMale || 0) + (race.adultMale || 0);
                        existing.adultFemale = (existing.adultFemale || 0) + (race.adultFemale || 0);
                        existing.children = (existing.children || 0) + (race.children || 0);
                        existing.elders = (existing.elders || 0) + (race.elders || 0);
                    } else {
                        mainProv.races.push({ ...race });
                    }
                }
            }
            delete provincesData[pid];
            if (typeof PROVINCE_NAMES !== 'undefined') delete PROVINCE_NAMES[pid];
            removedCount++;
        }

        if (mainPid.startsWith('annexed_')) {
            if (!mainProv.customName) mainProv.customName = name;
        }
        if (typeof PROVINCE_NAMES !== 'undefined') {
            PROVINCE_NAMES[mainPid] = name;
        }
    }

    if (typeof currentProvince !== 'undefined' && !provincesData[currentProvince]) {
        const firstPid = Object.keys(provincesData)[0];
        if (firstPid) window.currentProvince = firstPid;
    }
    return removedCount;
}
window.deduplicateProvinces = deduplicateProvinces;

function deduplicateAndRefreshUI() {
    const removed = deduplicateProvinces();
    if (removed > 0 && typeof addGlobalLog === 'function') {
        addGlobalLog(`🔧 Объединено дубликатов провинций: ${removed}`, 'general');
    }
    if (typeof updateProvinceSelect === 'function') updateProvinceSelect();
    if (typeof refreshBuildingsUI === 'function') refreshBuildingsUI();
    if (typeof renderProvinceDashboard === 'function') renderProvinceDashboard();
    if (typeof renderProvinceCells === 'function') renderProvinceCells();
    if (typeof renderWarPanel === 'function') renderWarPanel();
    if (typeof updateGlobalResourcesDisplay === 'function') updateGlobalResourcesDisplay();
    if (typeof recalcTotalTreasury === 'function') recalcTotalTreasury();
    if (typeof updateTreasuryDisplay === 'function') updateTreasuryDisplay();
    if (typeof refreshPeopleUI === 'function') refreshPeopleUI();
    return removed;
}
window.deduplicateAndRefreshUI = deduplicateAndRefreshUI;

// ============================================================================
// РАЗДЕЛ 15: СНОС ПОСТРОЕК В ОККУПАЦИИ
// ============================================================================

function demolishOccupiedBuilding(settlementId, buildingId) {
    const settlement = SETTLEMENTS_DB[settlementId];
    if (!settlement) return;
    const occ = window.occupations.find(o => o.settlementId === settlementId);
    if (!occ || occ.status === 'annexed') {
        alert('Сносить постройки можно только во время оккупации.');
        return;
    }
    const targetBuilding = (occ.buildings || []).find(b => b.id === buildingId);
    if (!targetBuilding) {
        alert('Постройка не найдена.');
        return;
    }
    const catalogEntry = buildingsCatalog[targetBuilding.baseName];
    if (!catalogEntry) return;
    if (!confirm(`🏚️ Снести «${targetBuilding.name}»? Возврат: 20% ресурсов.`)) return;

    const refund = {
        wood: Math.floor((catalogEntry.cost.wood || 0) * 0.2),
        stone: Math.floor((catalogEntry.cost.stone || 0) * 0.2),
        iron: Math.floor((catalogEntry.cost.iron || 0) * 0.2),
        gold: Math.floor((catalogEntry.cost.gold || 0) * 0.2),
        ers: Math.floor((catalogEntry.cost.ers || 0) * 0.2)
    };
    occ.buildings = occ.buildings.filter(b => b.id !== buildingId);

    const refundProvinceId = getOccupationTargetProvince(occ);
    if (refundProvinceId && provincesData[refundProvinceId]) {
        const res = provincesData[refundProvinceId].resources;
        for (let k in refund) res[k] = (res[k] || 0) + refund[k];
    }
    if (typeof saveAllData === 'function') saveAllData();
    if (typeof refreshBuildingsUI === 'function') refreshBuildingsUI();
    if (typeof recalcTotalTreasury === 'function') recalcTotalTreasury();
}
window.demolishOccupiedBuilding = demolishOccupiedBuilding;

// ============================================================================
// РАЗДЕЛ 16: МИГРАЦИЯ (сохраняем для совместимости)
// ============================================================================

function migrateAnnexedProvinces() {
    if (typeof provincesData === 'undefined') return;
    for (let pid in provincesData) {
        const prov = provincesData[pid];
        if (!prov) continue;
        if (!prov.settlements) prov.settlements = [];
        if (!prov.lostSettlements) prov.lostSettlements = [];
        if (!prov.capturedSettlements) prov.capturedSettlements = [];
        if (!prov.races) prov.races = [];
        if (!prov.resources) prov.resources = { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 };

        if (pid.startsWith('annexed_')) {
            let restoredName = prov.customName;
            if (!restoredName && prov.originalProvinceId && typeof PROVINCE_NAMES !== 'undefined') {
                restoredName = PROVINCE_NAMES[prov.originalProvinceId];
            }
            if (!restoredName) {
                const parts = pid.split('_');
                if (parts.length >= 2) {
                    const sourceId = parts.slice(1, -1).join('_');
                    if (typeof PROVINCE_NAMES !== 'undefined' && PROVINCE_NAMES[sourceId]) {
                        restoredName = PROVINCE_NAMES[sourceId];
                    }
                }
            }
            if (restoredName) {
                prov.customName = restoredName;
                if (typeof PROVINCE_NAMES !== 'undefined') PROVINCE_NAMES[pid] = restoredName;
            }
        }

        if (typeof PROVINCE_NAMES !== 'undefined' && PROVINCE_NAMES[pid]) {
            PROVINCE_NAMES[pid] = PROVINCE_NAMES[pid].replace(/\s*\(аннексировано\)$/, '');
        }

        const seen = new Set();
        prov.settlements = prov.settlements.filter(s => {
            if (seen.has(s.id)) return false;
            seen.add(s.id);
            return true;
        });
    }

    const globalSeen = new Set();
    for (let pid in provincesData) {
        const prov = provincesData[pid];
        if (!prov || !prov.settlements) continue;
        prov.settlements = prov.settlements.filter(s => {
            if (globalSeen.has(s.id)) return false;
            globalSeen.add(s.id);
            return true;
        });
    }
}
window.migrateAnnexedProvinces = migrateAnnexedProvinces;

function tryMigrate(attempt) {
    if (typeof provincesData !== 'undefined' && Object.keys(provincesData).length > 0) {
        migrateAnnexedProvinces();
        if (typeof deduplicateAndRefreshUI === 'function') deduplicateAndRefreshUI();
        else if (typeof renderWarPanel === 'function') renderWarPanel();
        return;
    }
    if (attempt < 10) setTimeout(() => tryMigrate(attempt + 1), 200);
}

// ============================================================================
// РАЗДЕЛ 17: ИНИЦИАЛИЗАЦИЯ
// ============================================================================

function initWarUI() {
    const declBtn = document.getElementById('declareWarBtn');
    if (declBtn) declBtn.addEventListener('click', openWarDeclarationModal);

    const closeAllBtn = document.getElementById('closeAllWarsBtn');
    if (closeAllBtn) {
        closeAllBtn.addEventListener('click', () => {
            if (!confirm('Заключить мир со всеми фракциями?')) return;
            const myFid = _myFid();
            const d = _myDate();
            const active = (typeof getActiveWarsAt === 'function') ? getActiveWarsAt(d) : [];
            for (let w of active) {
                if (w.aggressor === myFid) {
                    if (typeof recordWarEnd === 'function') recordWarEnd(myFid, w.defender, d);
                } else if (w.defender === myFid) {
                    if (typeof recordWarEnd === 'function') recordWarEnd(w.aggressor, myFid, d);
                }
            }
            window.wars = [];
            window.warsAgainst = [];
            window.occupations = [];
            if (typeof saveWorldOccupations === 'function') saveWorldOccupations([]);
            if (typeof saveAllData === 'function') saveAllData();
            renderWarPanel();
        });
    }

    // === НОВОЕ: аварийный сброс журнала войн ===
    // Создаём кнопку динамически и добавляем в .war-controls, если её там ещё нет
    const warControls = document.querySelector('.war-controls');
    if (warControls && !document.getElementById('resetWarsLogBtn')) {
        const resetBtn = document.createElement('button');
        resetBtn.id = 'resetWarsLogBtn';
        resetBtn.className = 'danger-btn';
        resetBtn.textContent = '🛠️ Сбросить журнал войн';
        resetBtn.title = 'Полностью очистить историю всех войн. Используйте только если что-то зависло.';
        resetBtn.addEventListener('click', () => {
            if (!confirm('⚠️ Полностью очистить журнал войн?\n\nЭто действие:\n• Снимает ВСЕ активные войны\n• Удаляет всю историю войн\n• НЕ трогает поселения и оккупации\n\nПродолжить?')) return;
            if (typeof saveWarsLog === 'function') saveWarsLog([]);
            window.wars = [];
            window.warsAgainst = [];
            if (typeof saveAllData === 'function') saveAllData();
            if (typeof renderWarPanel === 'function') renderWarPanel();
            alert('✅ Журнал войн очищен. Обновите страницу (F5) для применения изменений.');
        });
        warControls.appendChild(resetBtn);
    }

    renderWarPanel();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWarUI);
} else {
    initWarUI();
}

// ⚠️ КРИТИЧНО: восстановление названий провинций после загрузки из localStorage
// Без этого аннексированные провинции после F5 показываются как "annexed_kaya_..."
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        tryMigrate(0);
        patchProvinceNames();
    });
} else {
    tryMigrate(0);
    patchProvinceNames();
}

window.addEventListener('load', () => {
    setTimeout(() => {
        if (typeof syncWarsFromWorld === 'function') syncWarsFromWorld();
        if (typeof syncOccupationsFromWorld === 'function') syncOccupationsFromWorld();
        if (typeof renderWarPanel === 'function') renderWarPanel();
        // Ещё раз подстрахуемся — на случай, если provincesData загрузился позже
        if (typeof patchProvinceNames === 'function') patchProvinceNames();
    }, 600);
});

// Автосинхронизация при изменениях из других вкладок
window.addEventListener('storage', (e) => {
    if (e.key === 'mapUpdateNeeded' ||
        e.key === 'world_ownership_log' ||
        e.key === 'world_wars_log' ||
        e.key === 'world_occupations') {
        setTimeout(() => {
            if (typeof syncWarsFromWorld === 'function') syncWarsFromWorld();
            if (typeof syncOccupationsFromWorld === 'function') syncOccupationsFromWorld();
            if (typeof renderWarPanel === 'function') renderWarPanel();
        }, 100);
    }
});
/**
 * Синхронизирует PROVINCE_NAMES с customName из provincesData.
 * Нужно вызывать после загрузки сохранения, чтобы названия аннексированных
 * провинций отображались как "Кайя", а не как "annexed_kaya_...".
 */
function patchProvinceNames() {
    if (typeof PROVINCE_NAMES === 'undefined') return;
    if (typeof provincesData === 'undefined') return;

    let added = 0;
    for (let pid in provincesData) {
        const prov = provincesData[pid];
        if (!prov) continue;

        // Уже есть в PROVINCE_NAMES — пропускаем
        if (PROVINCE_NAMES[pid]) continue;

        let restoredName = null;

        // 1. Прямое указание в customName
        if (prov.customName) {
            restoredName = prov.customName;
        }
        // 2. Через originalProvinceId
        else if (prov.originalProvinceId && PROVINCE_NAMES[prov.originalProvinceId]) {
            restoredName = PROVINCE_NAMES[prov.originalProvinceId];
        }
        // 3. Разбор ID вида annexed_kaya_TIMESTAMP
        else if (pid.startsWith('annexed_')) {
            const parts = pid.split('_');
            if (parts.length >= 2) {
                const sourceId = parts.slice(1, -1).join('_');
                if (PROVINCE_NAMES[sourceId]) {
                    restoredName = PROVINCE_NAMES[sourceId];
                }
            }
        }

        if (restoredName) {
            PROVINCE_NAMES[pid] = restoredName;
            if (!prov.customName) prov.customName = restoredName;
            added++;
        }
    }

    if (added > 0) {
        console.log(`🏷️ [war.js] Восстановлено названий провинций: ${added}`);
    }
}
window.patchProvinceNames = patchProvinceNames;
// ============================================================================
// РАЗДЕЛ 18: ЭКСПОРТ
// ============================================================================

window.processOccupations = processOccupations;
window.showAnnexationCompleteModal = showAnnexationCompleteModal;
window.finalizeAnnexation = finalizeAnnexation;
window.markSettlementLost = markSettlementLost;
window.showSettlementLostModal = showSettlementLostModal;
window.renderWarPanel = renderWarPanel;
window.renderWarSummary = renderWarSummary;
window.renderLostSettlements = renderLostSettlements;
window.openWarDeclarationModal = openWarDeclarationModal;
window.declareWar = declareWar;
window.closeWar = closeWar;
window.openSettlementActionModal = openSettlementActionModal;
window.openLostSettlementModal = openLostSettlementModal;
window.startOccupation = startOccupation;
window.startAnnexation = startAnnexation;
window.startSelfOccupation = startSelfOccupation;
window.startSelfAnnexation = startSelfAnnexation;
window.removeOccupation = removeOccupation;
window.reclaimLostSettlement = reclaimLostSettlement;
window.returnLostSettlement = returnLostSettlement;
window.returnAnnexedToEnemy = returnAnnexedToEnemy;
window.getFactionSettlementsFromStatic = getFactionSettlementsFromStatic;
window.findProvinceOfSettlement = findProvinceOfSettlement;
window.demolishOccupiedBuilding = demolishOccupiedBuilding;
window.isSettlementAlreadyExists = isSettlementAlreadyExists;
window.deduplicateProvinces = deduplicateProvinces;
window.deduplicateAndRefreshUI = deduplicateAndRefreshUI;
window.findOrCreateAnnexedProvince = findOrCreateAnnexedProvince;
window.syncWarsFromWorld = syncWarsFromWorld;
window.syncOccupationsFromWorld = syncOccupationsFromWorld;

console.log('✅ war.js v2.0 загружен — синхронная система войн');