// ============================================================================
// МОДУЛЬ 10: trade.js
// ВЕРСИЯ 7.0 – поддержка направления торговли (экспорт/импорт),
// исключены эрсы из ресурсов, добавлены проверки на глобальные объекты
// ============================================================================

let selectedTradeResource = null;

// ========== 1. ОТРИСОВКА ДОСТУПНЫХ РЕСУРСОВ (БЕЗ ЭРСОВ) ==========
function renderTradeableResources() {
    const container = document.getElementById('tradeableResources');
    if (!container) return;
    container.innerHTML = '';
    
    // Получаем суммарные ресурсы через getTotalResources (из 09_buildings.js)
    let total = {};
    if (typeof getTotalResources === 'function') {
        total = getTotalResources();
    } else if (typeof provincesData !== 'undefined') {
        // fallback, если getTotalResources недоступна
        for (let pid in provincesData) {
            const r = provincesData[pid]?.resources;
            if (r) {
                total.wood = (total.wood || 0) + (r.wood || 0);
                total.stone = (total.stone || 0) + (r.stone || 0);
                total.iron = (total.iron || 0) + (r.iron || 0);
                total.gold = (total.gold || 0) + (r.gold || 0);
                total.ers = (total.ers || 0) + (r.ers || 0);
            }
        }
    }

    for (let [key, res] of Object.entries(RESOURCES_REGISTRY)) {
        if (!res.tradeable) continue;
        if (key === 'ers') continue; // исключаем эрсы из торговли
        const card = document.createElement('div');
        card.className = 'resource-card';
        card.setAttribute('data-resource', key);
        card.style.cssText = 'display:inline-block; text-align:center; margin:5px; padding:10px; border:1px solid #b87c4f; border-radius:12px; cursor:pointer; width:110px; background:#2a2418; transition:0.2s;';
        card.innerHTML = `
            <img src="${res.icon}" style="width:36px;height:36px;margin-bottom:4px;">
            <div style="font-size:0.8rem; font-weight:bold;">${res.name}</div>
            <div style="font-size:0.65rem; color:#cfc294;">В наличии:</div>
            <div style="font-size:0.75rem; color:#ffd966;">${(total[key]||0).toLocaleString()}</div>
        `;
        card.addEventListener('click', () => selectResourceForTrade(key));
        container.appendChild(card);
    }
    
    let selectionPanel = document.getElementById('selectedResourceDisplay');
    if (!selectionPanel) {
        selectionPanel = document.createElement('div');
        selectionPanel.id = 'selectedResourceDisplay';
        selectionPanel.style.cssText = 'margin: 8px 0; font-size:0.85rem; color:#ffd966;';
        container.after(selectionPanel);
    }
    selectionPanel.innerHTML = selectedTradeResource
        ? `✅ Выбран для торговли: <strong>${RESOURCES_REGISTRY[selectedTradeResource]?.name || selectedTradeResource}</strong>`
        : '⚠️ Выберите ресурс для торговли';
}

function selectResourceForTrade(resourceId) {
    selectedTradeResource = resourceId;
    document.querySelectorAll('.resource-card').forEach(c => {
        c.style.borderColor = '#b87c4f';
        c.style.background = '#2a2418';
    });
    const selectedCard = document.querySelector(`.resource-card[data-resource="${resourceId}"]`);
    if (selectedCard) {
        selectedCard.style.borderColor = '#ffd966';
        selectedCard.style.background = '#3e2a18';
    }
    const hiddenInput = document.getElementById('newAgreementResource');
    if (hiddenInput) hiddenInput.value = resourceId;
    const panel = document.getElementById('selectedResourceDisplay');
    if (panel) {
        panel.innerHTML = `✅ Выбран для торговли: <strong>${RESOURCES_REGISTRY[resourceId]?.name || resourceId}</strong>`;
    }
}

// ========== 2. ОБНОВЛЕНИЕ СЕЛЕКТА ПАРТНЁРОВ ==========
function updatePartnerSelect() {
    const select = document.getElementById('newAgreementPartner');
    if (!select) return;
    select.innerHTML = '<option value="">-- выберите --</option>';
    if (typeof FACTION_NAMES === 'undefined') return;
    for (let factionId in FACTION_NAMES) {
        if (factionId === currentFaction) continue;
        const option = document.createElement('option');
        option.value = factionId;
        option.textContent = FACTION_NAMES[factionId];
        select.appendChild(option);
    }
}

// ========== 3. ОТОБРАЖЕНИЕ ДОГОВОРОВ ==========
function renderAgreements() {
    const container = document.getElementById('agreementsList');
    if (!container) return;
    const relevant = (typeof globalTradeAgreements !== 'undefined') 
        ? globalTradeAgreements.filter(a => a.factionId === currentFaction)
        : [];
    if (relevant.length === 0) {
        container.innerHTML = '<em>Нет активных договоров.</em>';
        return;
    }
    container.innerHTML = '';
    for (let a of relevant) {
        const partnerId = a.partnerId;
        const partnerName = (typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[partnerId]) ? FACTION_NAMES[partnerId] : partnerId;
        const direction = a.type === 'export' ? '📤 Экспорт →' : '📥 Импорт ←';
        const res = RESOURCES_REGISTRY[a.resource] || { name: a.resource, icon: '' };
        const resIcon = res.icon ? `<img src="${res.icon}" style="width:16px;height:16px;vertical-align:middle;">` : '';
        let durationText = '';
        if (a.duration && a.duration > 0) {
            durationText = ` | ⏳ Осталось: ${a.remainingTurns} ходов`;
        } else {
            durationText = ` | ♾️ Бессрочный`;
        }
        const div = document.createElement('div');
        div.className = 'agreement-item';
        div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #b87c4f; padding: 8px 0;';
        div.innerHTML = `<div><strong>${direction} ${partnerName}</strong><br>${resIcon} ${res.name} | ${a.amountPerTurn} ед./ход | Цена: ${a.price} эрс/ед.${durationText}</div><button class="delete-agreement" data-id="${a.id}" style="background:#7a2a2a; padding: 4px 10px;">🗑️ Расторгнуть</button>`;
        container.appendChild(div);
    }
    document.querySelectorAll('.delete-agreement').forEach(btn => {
        btn.removeEventListener('click', window._deleteAgreementHandler);
        window._deleteAgreementHandler = (e) => {
            const id = btn.getAttribute('data-id');
            if (typeof globalTradeAgreements !== 'undefined') {
                globalTradeAgreements = globalTradeAgreements.filter(a => a.id != id);
                if (typeof saveAllData === 'function') saveAllData();
                renderAgreements();
                addBuildingsLog(`Торговый договор расторгнут.`);
            }
        };
        btn.addEventListener('click', window._deleteAgreementHandler);
    });
}

// ========== 4. ДОБАВЛЕНИЕ ДОГОВОРА С ВЫБОРОМ НАПРАВЛЕНИЯ ==========
function addTradeAgreement() {
    const partnerFaction = document.getElementById('newAgreementPartner')?.value;
    const resource = document.getElementById('newAgreementResource')?.value || selectedTradeResource;
    let price = parseInt(document.getElementById('newAgreementPrice')?.value);
    let amount = parseInt(document.getElementById('newAgreementAmount')?.value);
    let durationInput = parseInt(document.getElementById('newAgreementDuration')?.value);
    const direction = document.querySelector('input[name="tradeDirection"]:checked')?.value;
    
    if (isNaN(price) || price <= 0) price = 10;
    if (isNaN(amount) || amount <= 0) amount = 10;
    const duration = (isNaN(durationInput) || durationInput <= 0) ? 0 : durationInput;
    
    if (!partnerFaction || currentFaction === partnerFaction) {
        addBuildingsLog("Нельзя заключить договор с самим собой.");
        return;
    }
    if (!resource) {
        addBuildingsLog("Сначала выберите ресурс для торговли.");
        return;
    }
    if (!direction) {
        addBuildingsLog("Выберите направление торговли (экспорт/импорт).");
        return;
    }
    
    // Проверяем, нет ли уже договора с этим партнёром по этому ресурсу
    const existing = (typeof globalTradeAgreements !== 'undefined')
        ? globalTradeAgreements.find(a => a.factionId === currentFaction && a.partnerId === partnerFaction && a.resource === resource)
        : null;
    if (existing) {
        addBuildingsLog("Договор по этому ресурсу с данной фракцией уже существует.");
        return;
    }
    
    const newAgreement = {
        id: (typeof generateId === 'function') ? generateId() : Date.now() + '-' + Math.random(),
        factionId: currentFaction,
        partnerId: partnerFaction,
        resource: resource,
        type: direction,
        price: price,
        amountPerTurn: amount,
        duration: duration,
        remainingTurns: duration
    };
    if (typeof globalTradeAgreements !== 'undefined') {
        globalTradeAgreements.push(newAgreement);
        if (typeof saveAllData === 'function') saveAllData();
        renderAgreements();
    }
    const partnerName = (typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[partnerFaction]) ? FACTION_NAMES[partnerFaction] : partnerFaction;
    const resName = RESOURCES_REGISTRY[resource]?.name || resource;
    const directionText = direction === 'export' ? 'экспорт' : 'импорт';
    const durationMsg = duration > 0 ? ` (на ${duration} ходов)` : ' (бессрочный)';
    addBuildingsLog(`Заключён договор: ${directionText} ${resName} с ${partnerName}, ${amount} ед./ход по ${price} эрс/ед.${durationMsg}`);
}

// ========== 5. ОБРАБОТКА ТОРГОВЫХ СОГЛАШЕНИЙ ==========
function processTradeAgreements() {
    if (typeof globalTradeAgreements === 'undefined') return;
    const toRemove = [];
    for (let agreement of globalTradeAgreements) {
        if (agreement.factionId !== currentFaction) continue;
        
        if (agreement.duration > 0) {
            if (agreement.remainingTurns <= 0) {
                toRemove.push(agreement.id);
                continue;
            }
            agreement.remainingTurns--;
        }
        
        const resource = agreement.resource;
        const amount = agreement.amountPerTurn;
        const price = agreement.price;
        const totalCost = amount * price;
        
        if (agreement.type === 'export') {
            // Экспорт: продаём ресурс, получаем эрсы
            let totalAvailable = 0;
            const provinces = (typeof getCurrentFactionProvinces === 'function') ? getCurrentFactionProvinces() : [];
            for (let pid of provinces) {
                if (typeof provincesData !== 'undefined' && provincesData[pid] && provincesData[pid].resources) {
                    totalAvailable += provincesData[pid].resources[resource] || 0;
                }
            }
            if (totalAvailable < amount) {
                addBuildingsLog(`❌ Договор экспорта ${resource} с ${(typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[agreement.partnerId]) ? FACTION_NAMES[agreement.partnerId] : agreement.partnerId}: недостаточно ресурса.`);
                continue;
            }
            // Списываем ресурс
            let remaining = amount;
            for (let pid of provinces) {
                if (typeof provincesData === 'undefined' || !provincesData[pid] || !provincesData[pid].resources) continue;
                const res = provincesData[pid].resources;
                const deduct = Math.min(remaining, res[resource] || 0);
                res[resource] -= deduct;
                remaining -= deduct;
                if (remaining <= 0) break;
            }
            // Добавляем эрсы (в первую провинцию)
            for (let pid of provinces) {
                if (typeof provincesData !== 'undefined' && provincesData[pid] && provincesData[pid].resources) {
                    provincesData[pid].resources.ers += totalCost;
                    break;
                }
            }
            addBuildingsLog(`✅ Экспорт: продано ${amount} ед. ${resource} за ${totalCost} эрсов.`);
        } 
        else if (agreement.type === 'import') {
            // Импорт: покупаем ресурс, тратим эрсы
            let totalErs = 0;
            const provinces = (typeof getCurrentFactionProvinces === 'function') ? getCurrentFactionProvinces() : [];
            for (let pid of provinces) {
                if (typeof provincesData !== 'undefined' && provincesData[pid] && provincesData[pid].resources) {
                    totalErs += provincesData[pid].resources.ers || 0;
                }
            }
            if (totalErs < totalCost) {
                addBuildingsLog(`❌ Договор импорта ${resource} от ${(typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[agreement.partnerId]) ? FACTION_NAMES[agreement.partnerId] : agreement.partnerId}: недостаточно эрсов.`);
                continue;
            }
            // Списываем эрсы
            let remainingErs = totalCost;
            for (let pid of provinces) {
                if (typeof provincesData === 'undefined' || !provincesData[pid] || !provincesData[pid].resources) continue;
                const res = provincesData[pid].resources;
                const deduct = Math.min(remainingErs, res.ers);
                res.ers -= deduct;
                remainingErs -= deduct;
                if (remainingErs <= 0) break;
            }
            // Добавляем ресурс (в первую провинцию)
            let remainingRes = amount;
            for (let pid of provinces) {
                if (typeof provincesData !== 'undefined' && provincesData[pid] && provincesData[pid].resources) {
                    provincesData[pid].resources[resource] = (provincesData[pid].resources[resource] || 0) + remainingRes;
                    break;
                }
            }
            addBuildingsLog(`✅ Импорт: куплено ${amount} ед. ${resource} за ${totalCost} эрсов.`);
        }
    }
    
    if (toRemove.length > 0) {
        globalTradeAgreements = globalTradeAgreements.filter(a => !toRemove.includes(a.id));
        addBuildingsLog(`🕒 ${toRemove.length} торговых договоров истекли и были удалены.`);
    }
}

// ========== 6. ИНИЦИАЛИЗАЦИЯ ==========
function initTradeData() {
    // Миграция старых договоров (если есть)
    if (typeof globalTradeAgreements !== 'undefined' && globalTradeAgreements.length && !globalTradeAgreements[0].hasOwnProperty('factionId')) {
        console.warn("Обнаружены старые договоры (без factionId/type). Очищаем.");
        globalTradeAgreements = [];
        if (typeof saveAllData === 'function') saveAllData();
    }
    
    updatePartnerSelect();
    renderAgreements();
    renderTradeableResources();
}

// ========== 7. ЭКСПОРТ ФУНКЦИЙ (ДЛЯ ВЫЗОВА ИЗ ДРУГИХ МОДУЛЕЙ) ==========
window.processTradeAgreements = processTradeAgreements;
window.initTradeData = initTradeData;
window.addTradeAgreement = addTradeAgreement;
window.renderAgreements = renderAgreements;
window.renderTradeableResources = renderTradeableResources;

console.log("✅ 10_trade.js загружен — версия 7.0 (направление торговли, эрсы исключены)");