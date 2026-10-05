// ============================================================================
// war_registry.js v2.0 — Статичный сайт: общий реестр на браузер
// ============================================================================
// Принцип: append-only журналы событий в localStorage, все привязано к ХОДУ.
// Страница фракции читает состояние на СВОЮ дату.
// Карта читает состояние на САМУЮ СВЕЖУЮ дату в журналах.
// ============================================================================
// ============================================================================
// war_registry.js v2.0 — мод выложен на гитхаб 05.10.26
// ============================================================================

// ---------- АВТО-МИГРАЦИЯ ----------
(function autoMigrateRegistry() {
    const CURRENT_SCHEMA = 2;
    const VERSION_KEY = 'world_registry_schema_version';
    try {
        const stored = parseInt(localStorage.getItem(VERSION_KEY) || '0', 10);
        if (stored !== CURRENT_SCHEMA) {
            console.log(`🔧 [registry] Миграция схемы: ${stored} → ${CURRENT_SCHEMA}`);
            localStorage.removeItem('world_ownership_log');
            localStorage.removeItem('world_wars_log');
            localStorage.removeItem('world_occupations');
            localStorage.setItem(VERSION_KEY, String(CURRENT_SCHEMA));
            console.log('✅ [registry] Ключи сброшены');
        }
    } catch(e) {
        console.warn('⚠️ [registry] Ошибка миграции:', e);
    }
})();

// ---------- 1. КАРТА ФРАКЦИЙ → КЛЮЧЕЙ ХРАНИЛИЩА ----------
const FACTION_STORAGE_SUFFIX = {
    'clan_daketa': '', 'clan_date': 'date', 'county_vogelmark': 'vogelmark',
    'county_markarn': 'markarn', 'principality_gorski': 'gorski',
    'county_ottergrund': 'ottergrund', 'elfheim': 'elfheim',
    'county_meyan': 'meyan', 'county_dionia': 'dionia',
    'county_takania': 'takania', 'county_skollfang': 'moonmane',
    'order_varsiltaers': 'varsiltaers', 'principality_lorein': 'lorein',
    'county_mensen': 'mensen', 'regency_council': 'regency',
    'lepus_union': 'lepus', 'county_luun': 'luun', 'county_corvail': 'corvail',
	'principality_batavia': 'batavia',
};

function factionHasStorage(fid) { return fid in FACTION_STORAGE_SUFFIX; }
function getFactionStorageKey(fid) {
    const s = FACTION_STORAGE_SUFFIX[fid];
    if (s === undefined) return null;
    return s ? 'unified_province_manager_' + s : 'unified_province_manager';
}

function loadFactionStorage(fid) {
    const k = getFactionStorageKey(fid); if (!k) return null;
    try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : null; } catch { return null; }
}
function saveFactionStorage(fid, data) {
    const k = getFactionStorageKey(fid); if (!k) return false;
    try {
        localStorage.setItem(k, JSON.stringify(data));
        localStorage.setItem('mapUpdateNeeded', Date.now().toString());
        return true;
    } catch { return false; }
}

// ---------- 2. ДАТЫ И ХОДЫ ----------
function dateToTurn(d) {
    if (!d) return 0;
    return (d.year - 1598)*48 + (d.month-1)*4 + (d.week-1);
}
function turnToDate(t) {
    const year = 1598 + Math.floor(t/48);
    const rem = t % 48;
    return { year, month: 1 + Math.floor(rem/4), week: 1 + (rem % 4) };
}
function formatDateStr(d) {
    if (!d) return '—';
    const mn = ["янв","фев","мар","апр","мая","июн","июл","авг","сен","окт","ноя","дек"];
    return `${d.week} нед. ${mn[d.month-1]||d.month}, ${d.year}`;
}
function getCurrentFactionDate() {
    if (typeof peopleState === 'undefined') return { week:1, month:5, year:1598 };
    return {
        week: peopleState.currentWeek||1,
        month: peopleState.currentMonth||5,
        year: peopleState.currentYear||1598
    };
}
function getFactionDate(fid) {
    const d = loadFactionStorage(fid);
    if (!d || !d.peopleState) return null;
    const ps = d.peopleState;
    return { week: ps.currentWeek||1, month: ps.currentMonth||5, year: ps.currentYear||1598 };
}

// ---------- 3. ЖУРНАЛ ВЛАДЕНИЯ ----------
const OWNERSHIP_LOG_KEY = 'world_ownership_log';

function getInitialOwners() {
    const init = {};
    if (typeof SETTLEMENTS_DB !== 'undefined') {
        for (let id in SETTLEMENTS_DB) {
            const f = SETTLEMENTS_DB[id].faction;
            init[id] = factionHasStorage(f) ? f : null;
        }
    }
    return init;
}

function loadOwnershipLog() {
    const raw = localStorage.getItem(OWNERSHIP_LOG_KEY);
    if (raw) { try { return JSON.parse(raw); } catch {} }
    // Первая инициализация
    const init = getInitialOwners();
    const log = [];
    for (let sid in init) {
        if (init[sid]) {
            log.push({ sid, from: null, to: init[sid], turn: 0,
                       date: {week:1,month:5,year:1598}, reason: 'initial' });
        }
    }
    localStorage.setItem(OWNERSHIP_LOG_KEY, JSON.stringify(log));
    console.log('🌍 [registry] Журнал владения инициализирован:', log.length, 'записей');
    return log;
}

function saveOwnershipLog(log) {
    localStorage.setItem(OWNERSHIP_LOG_KEY, JSON.stringify(log));
    localStorage.setItem('mapUpdateNeeded', Date.now().toString());
}

function recordOwnershipChange(sid, from, to, date, reason, meta = {}) {
    const log = loadOwnershipLog();
    log.push({
        sid, from, to,
        turn: dateToTurn(date),
        date,
        reason: reason || 'unknown',
        timestamp: Date.now(),
        warId: meta.warId || null,
        sourceFaction: meta.sourceFaction || null
    });
    saveOwnershipLog(log);
    console.log(`📜 [ownership] ${sid}: ${from||'—'} → ${to||'—'} (${formatDateStr(date)})`);
}

function getSettlementOwnerAt(sid, date) {
    const log = loadOwnershipLog();
    const target = date ? dateToTurn(date) : Infinity;
    let owner = getInitialOwners()[sid] ?? null;
    const events = log.filter(e => e.sid === sid).sort((a,b) => a.turn - b.turn);
    for (let e of events) {
        if (e.turn > target) break;
        owner = e.to;
    }
    return owner;
}

function getSettlementOwnerLatest(sid) {
    return getSettlementOwnerAt(sid, null);
}

function getAllOwnersAt(date) {
    const result = getInitialOwners();
    const target = date ? dateToTurn(date) : Infinity;
    const log = loadOwnershipLog().sort((a,b) => a.turn - b.turn);
    for (let e of log) {
        if (e.turn > target) break;
        result[e.sid] = e.to;
    }
    return result;
}

function getAllOwnersLatest() { return getAllOwnersAt(null); }

function getSettlementHistory(sid) {
    return loadOwnershipLog().filter(e => e.sid === sid).sort((a,b) => a.turn - b.turn);
}

window.loadOwnershipLog = loadOwnershipLog;
window.recordOwnershipChange = recordOwnershipChange;
window.getSettlementOwnerAt = getSettlementOwnerAt;
window.getSettlementOwnerLatest = getSettlementOwnerLatest;
window.getAllOwnersAt = getAllOwnersAt;
window.getAllOwnersLatest = getAllOwnersLatest;
window.getSettlementHistory = getSettlementHistory;

// ---------- 4. ЖУРНАЛ ВОЙН ----------
const WARS_LOG_KEY = 'world_wars_log';
function loadWarsLog() {
    const r = localStorage.getItem(WARS_LOG_KEY);
    if (!r) return [];
    try { return JSON.parse(r); } catch { return []; }
}
function saveWarsLog(list) {
    localStorage.setItem(WARS_LOG_KEY, JSON.stringify(list));
    localStorage.setItem('mapUpdateNeeded', Date.now().toString());
}
function recordWarStart(a, d, date) {
    const log = loadWarsLog();
    if (log.some(w => w.status === 'active' &&
        ((w.aggressor===a && w.defender===d) || (w.aggressor===d && w.defender===a)))) return null;
    const entry = {
        id: 'war_' + Date.now() + '_' + Math.random().toString(36).substr(2,4),
        aggressor: a, defender: d,
        turn: dateToTurn(date),
        date,
        status: 'active',
        startDate: date, endDate: null
    };
    log.push(entry);
    saveWarsLog(log);
    return entry;
}
function recordWarEnd(a, d, date) {
    const log = loadWarsLog();
    let changed = false;
    for (let w of log) {
        if (w.status === 'active' &&
            ((w.aggressor===a && w.defender===d) || (w.aggressor===d && w.defender===a))) {
            w.status = 'peace';
            w.endDate = date;
            w.endTurn = dateToTurn(date);
            changed = true;
        }
    }
    if (changed) saveWarsLog(log);
    return changed;
}
function getActiveWarsAt(date) {
    const log = loadWarsLog();
    const t = dateToTurn(date);
    return log.filter(w => w.turn <= t && (!w.endTurn || w.endTurn > t));
}
function areFactionsAtWarAt(a, b, date) {
    if (!a || !b || a===b) return false;
    return getActiveWarsAt(date).some(w =>
        (w.aggressor===a && w.defender===b) || (w.aggressor===b && w.defender===a));
}
window.loadWarsLog = loadWarsLog;
window.recordWarStart = recordWarStart;
window.recordWarEnd = recordWarEnd;
window.getActiveWarsAt = getActiveWarsAt;
window.areFactionsAtWarAt = areFactionsAtWarAt;

// ---------- 5. АКТИВНЫЕ ОККУПАЦИИ ----------
const OCC_KEY = 'world_occupations';
function loadWorldOccupations() {
    const r = localStorage.getItem(OCC_KEY); if (!r) return [];
    try { return JSON.parse(r); } catch { return []; }
}
function saveWorldOccupations(list) {
    localStorage.setItem(OCC_KEY, JSON.stringify(list));
    localStorage.setItem('mapUpdateNeeded', Date.now().toString());
}
function getWorldOccupation(sid) {
    return loadWorldOccupations().find(o => o.settlementId === sid) || null;
}
function upsertWorldOccupation(occ) {
    const list = loadWorldOccupations();
    const i = list.findIndex(o => o.settlementId === occ.settlementId);
    if (i !== -1) list[i] = { ...list[i], ...occ };
    else list.push(occ);
    saveWorldOccupations(list);
}
function removeWorldOccupation(sid) {
    saveWorldOccupations(loadWorldOccupations().filter(o => o.settlementId !== sid));
}
window.loadWorldOccupations = loadWorldOccupations;
window.saveWorldOccupations = saveWorldOccupations;
window.getWorldOccupation = getWorldOccupation;
window.upsertWorldOccupation = upsertWorldOccupation;
window.removeWorldOccupation = removeWorldOccupation;

// ---------- 6. ГЛАВНАЯ ФУНКЦИЯ ПЕРЕДАЧИ ВЛАДЕНИЯ ----------
function transferOwnership(sid, fromFid, toFid, date, reason = 'manual', opts = {}) {
    console.log(`🔄 [registry] "${sid}": ${fromFid||'—'} → ${toFid||'—'} (${formatDateStr(date)}) — причина: ${reason}`);
    
    // 1. Пишем в журнал
    recordOwnershipChange(sid, fromFid, toFid, date, reason, {
        warId: opts.warId || null,
        sourceFaction: opts.sourceFaction || window.currentFaction
    });
    
    // 2. Обновляем данные фракции-ОТПРАВИТЕЛЯ (в её localStorage)
    if (fromFid && factionHasStorage(fromFid)) {
        removeSettlementFromFaction(fromFid, sid, toFid, date);
    }
    
    // 3. Обновляем данные фракции-ПОЛУЧАТЕЛЯ (в её localStorage)
    if (toFid && factionHasStorage(toFid)) {
        addSettlementToFaction(toFid, sid, fromFid, date, opts);
    }
    
    // 4. Чистим оккупацию при завершении
    if (reason === 'annexation' || reason === 'occupation_complete' ||
        reason === 'manual' || reason === 'peace_return' || reason === 'self_annexation') {
        removeWorldOccupation(sid);
    }
    
    localStorage.setItem('mapUpdateNeeded', Date.now().toString());
    return true;
}

/**
 * Удаляет поселение у фракции fid и помещает его в её lostSettlements.
 * Работает через localStorage — применимо к ЛЮБОЙ фракции, не только текущей.
 */
function removeSettlementFromFaction(fid, sid, newOwner, date) {
    const data = loadFactionStorage(fid);
    if (!data || !data.provincesData) return;

    let found = false;
    for (let pid in data.provincesData) {
        const prov = data.provincesData[pid];
        if (!prov.settlements) continue;
        const idx = prov.settlements.findIndex(s => s.id === sid);
        if (idx === -1) continue;

        const s = prov.settlements[idx];

        // === НОВОЕ: если у поселения есть annexedPopulation — вычитаем его из рас ===
        if (s.annexedPopulation && Array.isArray(s.annexedPopulation) && s.annexedPopulation.length > 0) {
            subtractPopulationFromProvince(prov, s.annexedPopulation);
        }

        prov.settlements.splice(idx, 1);

        if (!prov.lostSettlements) prov.lostSettlements = [];
        prov.lostSettlements.push({
            settlementId: sid,
            settlementData: JSON.parse(JSON.stringify(s)),
            lostAt: formatDateStr(date),
            lostTo: newOwner,
            provinceId: pid
        });
        found = true;
        break;
    }

    if (!found) return;
    saveFactionStorage(fid, data);

    // Если это ТЕКУЩАЯ фракция — обновляем глобал и UI
    if (fid === window.currentFaction) {
        if (typeof provincesData !== 'undefined') {
            window.provincesData = data.provincesData;
        }
        setTimeout(() => {
            if (typeof renderWarPanel === 'function') renderWarPanel();
            if (typeof refreshBuildingsUI === 'function') refreshBuildingsUI();
            if (typeof renderProvinceDashboard === 'function') renderProvinceDashboard();
            if (typeof refreshPeopleUI === 'function') refreshPeopleUI();
        }, 30);
        if (typeof addGlobalLog === 'function') {
            addGlobalLog(`💀 Потеряно поселение «${s.name}» → ${newOwner || 'нейтрал'}.`, 'general');
        }
    }
}

/**
 * Вычитает население из провинции по списку рас.
 * Защита от отрицательных значений.
 */
function subtractPopulationFromProvince(prov, populationList) {
    if (!prov || !prov.races) return;
    for (let pop of populationList) {
        const race = prov.races.find(r => r.name === pop.name);
        if (!race) continue;
        race.adultMale = Math.max(0, (race.adultMale || 0) - (pop.adultMale || 0));
        race.adultFemale = Math.max(0, (race.adultFemale || 0) - (pop.adultFemale || 0));
        race.children = Math.max(0, (race.children || 0) - (pop.children || 0));
        race.elders = Math.max(0, (race.elders || 0) - (pop.elders || 0));
    }
}

/**
 * Добавляет поселение фракции fid в её провинцию.
 * Работает через localStorage — применимо к ЛЮБОЙ фракции.
 */
function addSettlementToFaction(fid, sid, fromFid, date, opts = {}) {
    let data = loadFactionStorage(fid);
    if (!data) data = createEmptyFactionStorage(fid);
    if (!data.provincesData) data.provincesData = {};

    // Уже есть?
    for (let pid in data.provincesData) {
        if (data.provincesData[pid].settlements?.some(s => s.id === sid)) return;
    }

    // Достаём объект поселения
    let settlementObj = null, srcProvId = null;
    if (typeof SETTLEMENTS_DB !== 'undefined' && SETTLEMENTS_DB[sid]) {
        const db = SETTLEMENTS_DB[sid];
        settlementObj = { id: db.id, name: db.name, type: db.type, buildings: opts.buildings || [] };
        srcProvId = db.province;
    }
    if (!settlementObj) return;

    // Целевая провинция
    const requestedPid = opts.targetProvinceId || srcProvId || 'annexed_territory';
    const targetName = (typeof PROVINCE_NAMES !== 'undefined' && PROVINCE_NAMES[requestedPid]) || requestedPid;

    // Ищем провинцию с таким же ИМЕНЕМ (дедупликация)
    let finalPid = requestedPid;
    for (let pid in data.provincesData) {
        const pn = (typeof PROVINCE_NAMES !== 'undefined' && PROVINCE_NAMES[pid]) || pid;
        if (pn === targetName) { finalPid = pid; break; }
    }

    // Создаём провинцию, если нет
    if (!data.provincesData[finalPid]) {
        data.provincesData[finalPid] = {
            settlements: [],
            resources: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0,
                         sword_iron: 0, bison: 0, elven_tobacco: 0, elixir: 0 },
            races: [],
            army: [],
            capturedSettlements: [],
            lostSettlements: [],
            isCapital: Object.keys(data.provincesData).length === 0,
            isAnnexed: finalPid !== srcProvId,
            originalProvinceId: srcProvId,
            customName: targetName
        };
        if (typeof PROVINCE_NAMES !== 'undefined') {
            PROVINCE_NAMES[finalPid] = targetName;
        }
    }

    const prov = data.provincesData[finalPid];
    if (!prov.settlements) prov.settlements = [];
    if (!prov.races) prov.races = [];

    // Защита от дубликата в этой же провинции
    if (!prov.settlements.some(s => s.id === sid)) {
        // === НОВОЕ: добавляем население в провинцию и запоминаем его на поселении ===
        const populationToAdd = (opts.populationToAdd && Array.isArray(opts.populationToAdd))
            ? opts.populationToAdd : [];

        for (let pop of populationToAdd) {
            const ex = prov.races.find(r => r.name === pop.name);
            if (ex) {
                ex.adultMale = (ex.adultMale || 0) + (pop.adultMale || 0);
                ex.adultFemale = (ex.adultFemale || 0) + (pop.adultFemale || 0);
                ex.children = (ex.children || 0) + (pop.children || 0);
                ex.elders = (ex.elders || 0) + (pop.elders || 0);
            } else {
                prov.races.push({
                    name: pop.name,
                    adultMale: pop.adultMale || 0,
                    adultFemale: pop.adultFemale || 0,
                    children: pop.children || 0,
                    elders: pop.elders || 0,
                    birthRate: pop.birthRate || 2.0,
                    deathRate: pop.deathRate || 1.0
                });
            }
        }

        prov.settlements.push({
            ...settlementObj,
            captured: false,
            capturedByFaction: null,
            capturedData: null,
            vassalHouse: opts.vassalHouse !== undefined ? opts.vassalHouse : null,
            annexedAt: formatDateStr(date),
            // ← ГЛАВНОЕ: привязываем население к поселению,
            // чтобы при потере можно было вычесть его обратно.
            annexedPopulation: populationToAdd.length > 0 ? JSON.parse(JSON.stringify(populationToAdd)) : null
        });
    }

    // Если поселение было в lostSettlements — убираем оттуда
    for (let pid in data.provincesData) {
        const p = data.provincesData[pid];
        if (p.lostSettlements) {
            p.lostSettlements = p.lostSettlements.filter(l => l.settlementId !== sid);
        }
    }

    saveFactionStorage(fid, data);

    // Если это ТЕКУЩАЯ фракция — подтягиваем глобал и обновляем UI
    if (fid === window.currentFaction) {
        if (typeof provincesData !== 'undefined') {
            window.provincesData = data.provincesData;
        }
        setTimeout(() => {
            if (typeof renderWarPanel === 'function') renderWarPanel();
            if (typeof refreshBuildingsUI === 'function') refreshBuildingsUI();
            if (typeof renderProvinceDashboard === 'function') renderProvinceDashboard();
            if (typeof refreshPeopleUI === 'function') refreshPeopleUI();
        }, 30);
        if (typeof addGlobalLog === 'function') {
            addGlobalLog(`🏛️ Получено поселение «${settlementObj.name}» (провинция «${targetName}»).`, 'general');
        }
    }
}

// ---------- 7. СИНХРОНИЗАЦИЯ ПРИ ХОДЕ ----------
/**
 * Вызывается после продвижения даты фракции.
 * Пересобирает локальные settlements по её новой дате.
 */
function syncFactionOwnership() {
    const myFid = window.currentFaction;
    const myDate = getCurrentFactionDate();
    const owners = getAllOwnersAt(myDate);
    
    if (typeof provincesData === 'undefined') return { lost: [], gained: [] };
    
    const lost = [], gained = [];
    
    // 1. Убираем то, что уже не наше
    for (let pid in provincesData) {
        const prov = provincesData[pid];
        if (!prov.settlements || !prov.settlements.length) continue;
        const keep = [];
        for (let s of prov.settlements) {
            const owner = owners[s.id];
            if (owner === myFid) { keep.push(s); continue; }
            if (!prov.lostSettlements) prov.lostSettlements = [];
            prov.lostSettlements.push({
                settlementId: s.id,
                settlementData: JSON.parse(JSON.stringify(s)),
                lostAt: formatDateStr(myDate),
                lostTo: owner,
                provinceId: pid
            });
            lost.push({ settlement: s, newOwner: owner });
        }
        prov.settlements = keep;
    }
    
    // 2. Возвращаем то, что опять стало нашим
    for (let pid in provincesData) {
        const prov = provincesData[pid];
        if (!prov.lostSettlements) continue;
        const stillLost = [];
        for (let l of prov.lostSettlements) {
            const owner = owners[l.settlementId];
            if (owner === myFid) {
                if (!prov.settlements.some(s => s.id === l.settlementId)) {
                    prov.settlements.push(l.settlementData);
                }
                gained.push({ settlement: l.settlementData, fromOwner: l.lostTo });
            } else {
                stillLost.push(l);
            }
        }
        prov.lostSettlements = stillLost;
    }
    
    // 3. Синхронизируем оккупации для моей фракции
    if (typeof window.occupations !== 'undefined') {
        const worldOccs = loadWorldOccupations().filter(o =>
            o.occupierFactionId === myFid && o.status === 'occupying');
        const worldIds = new Set(worldOccs.map(o => o.settlementId));
        const localIds = new Set(window.occupations.map(o => o.settlementId));
        for (let wo of worldOccs) {
            if (!localIds.has(wo.settlementId)) {
                window.occupations.push({
                    settlementId: wo.settlementId,
                    targetFactionId: wo.defenderFactionId,
                    sourceProvinceId: wo.sourceProvinceId,
                    type: wo.type,
                    turnsRemaining: wo.turnsRemaining,
                    totalTurns: wo.totalTurns,
                    status: wo.status
                });
            }
        }
        window.occupations = window.occupations.filter(o =>
            o.isSelfOccupation || worldIds.has(o.settlementId));
    }
    
    if (typeof saveAllData === 'function') saveAllData();
    if (lost.length || gained.length) showOwnershipChanges(lost, gained, myDate);
    return { lost, gained };
}

function showOwnershipChanges(lost, gained, date) {
    let html = '';
    if (lost.length) {
        html += `<h3 style="color:#ff6b6b;margin-top:0;">💀 Потеряно (${lost.length})</h3><ul style="padding-left:20px;line-height:1.7;">`;
        for (let l of lost) {
            const nn = (typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[l.newOwner]) || l.newOwner || 'нейтралитет';
            html += `<li>«${l.settlement.name}» → <strong style="color:#ff8888;">${nn}</strong></li>`;
        }
        html += '</ul>';
    }
    if (gained.length) {
        html += `<h3 style="color:#8bc34a;margin-top:15px;">🏛️ Возвращено (${gained.length})</h3><ul style="padding-left:20px;line-height:1.7;">`;
        for (let g of gained) {
            const fn = (typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[g.fromOwner]) || g.fromOwner || 'нейтралитет';
            html += `<li>«${g.settlement.name}» ← <strong style="color:#a8e06a;">${fn}</strong></li>`;
        }
        html += '</ul>';
    }
    
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);z-index:20000;display:flex;justify-content:center;align-items:center;padding:20px;';
    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:20px;padding:25px;max-width:520px;width:100%;color:#e6ddb3;max-height:80vh;overflow-y:auto;">
            <h2 style="color:#ffd966;margin-top:0;text-align:center;font-size:1.2rem;">📜 Изменения владений</h2>
            <div style="font-size:0.82rem;color:#8a7a5a;text-align:center;margin-bottom:16px;">${formatDateStr(date)}</div>
            ${html}
            <div style="text-align:center;margin-top:20px;">
                <button id="closeOwnershipModalBtn" style="background:#3a6b3a;padding:10px 30px;">Понятно</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#closeOwnershipModalBtn').onclick = () => modal.remove();
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

// ---------- ЭКСПОРТ ----------
window.transferOwnership = transferOwnership;
window.syncFactionOwnership = syncFactionOwnership;
window.getFactionStorageKey = getFactionStorageKey;
window.loadFactionStorage = loadFactionStorage;
window.saveFactionStorage = saveFactionStorage;
window.getFactionDate = getFactionDate;
window.getCurrentFactionDate = getCurrentFactionDate;
window.dateToTurn = dateToTurn;
window.turnToDate = turnToDate;
window.formatDateStr = formatDateStr;

console.log('✅ war_registry.js v2.0 загружен');