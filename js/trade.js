// ============================================================================
// МОДУЛЬ: trade.js (полностью переписанная версия)
// ============================================================================

// Глобальный массив торговых соглашений
window.globalTradeAgreements = window.globalTradeAgreements || [];

let selectedTradeResource = null;

function getTradeBonusPercent() {
    let totalBonus = 0;
    const provinces = (typeof getCurrentFactionProvinces === 'function') ? getCurrentFactionProvinces() : [];
    
    for (let pid of provinces) {
        if (typeof provincesData === 'undefined' || !provincesData[pid]) continue;
        for (let settlement of provincesData[pid].settlements) {
            if (settlement.captured) continue;
            for (let building of settlement.buildings) {
                if (building.completed) {
                    if (building.special === "tradeBonus15") totalBonus += 15;
                    if (building.special === "tradeBonus30") totalBonus += 30;
                }
            }
        }
    }

    // Добавляем бонус от технологий
    const techBonuses = (typeof getTechBonuses === 'function') ? getTechBonuses() : {};
    if (techBonuses.tradeBonus) {
        totalBonus += techBonuses.tradeBonus;
    }

    return totalBonus;
}

// ========== 1. ОТРИСОВКА ДОСТУПНЫХ РЕСУРСОВ ==========
function renderTradeableResources() {
    const container = document.getElementById('tradeableResources');
    if (!container) return;

    // Получаем полные ресурсы через универсальную функцию
    let total = {};
    if (typeof getTotalResources === 'function') {
        total = getTotalResources();
    } else if (typeof provincesData !== 'undefined') {
        // Запасной вариант – собираем все ключи из RESOURCES_REGISTRY
        for (let key in RESOURCES_REGISTRY) {
            total[key] = 0;
        }
        for (let pid in provincesData) {
            const r = provincesData[pid]?.resources;
            if (r) {
                for (let key in total) {
                    total[key] += r[key] || 0;
                }
            }
        }
    }

    // Формируем HTML карточек для всех ресурсов, кроме эрсов
    let html = '';
    for (let [key, res] of Object.entries(RESOURCES_REGISTRY)) {
        if (key === 'ers') continue;
        const amount = total[key] || 0;
        html += `
            <div class="resource-card" data-resource="${key}" style="
                display:inline-block; text-align:center; margin:5px; padding:10px;
                border:1px solid #b87c4f; border-radius:12px; cursor:pointer; width:110px;
                background:#2a2418; transition:0.2s;
            ">
                <img src="${res.icon}" style="width:36px;height:36px;margin-bottom:4px;">
                <div style="font-size:0.8rem; font-weight:bold;">${res.name}</div>
                <div style="font-size:0.65rem; color:#cfc294;">В наличии:</div>
                <div style="font-size:0.75rem; color:#ffd966;">${amount.toLocaleString()}</div>
            </div>
        `;
    }

    container.innerHTML = html || '<div style="color:#8a7a5a; text-align:center;">Нет доступных ресурсов</div>';

    // Обработчики выбора
    container.querySelectorAll('.resource-card').forEach(card => {
        card.addEventListener('click', () => {
            const resourceId = card.getAttribute('data-resource');
            selectResourceForTrade(resourceId);
        });
    });

    // Обновляем панель выбранного ресурса
    const panel = document.getElementById('selectedResourceDisplay');
    if (panel) {
        panel.innerHTML = selectedTradeResource
            ? `✅ Выбран для торговли: <strong>${RESOURCES_REGISTRY[selectedTradeResource]?.name || selectedTradeResource}</strong>`
            : '⚠️ Выберите ресурс для торговли';
    }
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

// ========== 2. ОБНОВЛЕНИЕ СПИСКА ПАРТНЁРОВ ==========
function updatePartnerSelect() {
    const select = document.getElementById('newAgreementPartner');
    if (!select) return;
    select.innerHTML = '<option value="">-- выберите --</option>';
    if (typeof FACTION_NAMES === 'undefined') return;
    for (let factionId in FACTION_NAMES) {
        if (factionId === window.currentFaction) continue;
        const option = document.createElement('option');
        option.value = factionId;
        option.textContent = FACTION_NAMES[factionId];
        select.appendChild(option);
    }
}

// ========== 3. ОТОБРАЖЕНИЕ АКТИВНЫХ ДОГОВОРОВ ==========
function renderAgreements() {
    const container = document.getElementById('agreementsList');
    if (!container) return;

    const relevant = window.globalTradeAgreements.filter(a => a.factionId === window.currentFaction);
    if (relevant.length === 0) {
        container.innerHTML = '<em>Нет активных договоров.</em>';
        return;
    }

    container.innerHTML = '';
    for (let a of relevant) {
        const partnerName = (typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[a.partnerId])
            ? FACTION_NAMES[a.partnerId] : a.partnerId;
        const direction = a.type === 'export' ? '📤 Экспорт →' : '📥 Импорт ←';
        const res = RESOURCES_REGISTRY[a.resource] || { name: a.resource, icon: '' };
        const resIcon = res.icon ? `<img src="${res.icon}" style="width:16px;height:16px;vertical-align:middle;">` : '';
        const durationText = (a.duration && a.duration > 0)
            ? ` | ⏳ Осталось: ${a.remainingTurns} ходов`
            : ' | ♾️ Бессрочный';

        const div = document.createElement('div');
        div.className = 'agreement-item';
        div.style.cssText = 'display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #b87c4f; padding:8px 0;';
        div.innerHTML = `
            <div>
                <strong>${direction} ${partnerName}</strong><br>
                ${resIcon} ${res.name} | ${a.amountPerTurn} ед./ход | Цена: ${a.price} эрс/ед.${durationText}
            </div>
            <button class="delete-agreement" data-id="${a.id}" style="background:#7a2a2a; padding:4px 10px;">🗑️ Расторгнуть</button>
        `;
        container.appendChild(div);
    }

    // Обработчики удаления
    document.querySelectorAll('.delete-agreement').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            window.globalTradeAgreements = window.globalTradeAgreements.filter(a => a.id != id);
            if (typeof saveAllData === 'function') saveAllData();
            renderAgreements();
            if (typeof addBuildingsLog === 'function') addBuildingsLog('Торговый договор расторгнут.');
        });
    });
}

// ========== 4. ЗАКЛЮЧЕНИЕ НОВОГО ДОГОВОРА ==========
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
    
    // Проверяем наличие ресурса при экспорте
    if (direction === 'export') {
        let totalAvailable = 0;
        if (typeof getTotalResources === 'function') {
            totalAvailable = getTotalResources()[resource] || 0;
        } else {
            for (let pid in provincesData) {
                const r = provincesData[pid]?.resources;
                if (r) totalAvailable += r[resource] || 0;
            }
        }
        if (totalAvailable < amount) {
            alert(`Недостаточно ресурса "${RESOURCES_REGISTRY[resource]?.name || resource}"! Доступно: ${totalAvailable}, требуется: ${amount}.`);
            addBuildingsLog(`❌ Не удалось заключить договор экспорта: недостаточно ${resource}.`);
            return;
        }
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

// ========== 5. ОБРАБОТКА ТОРГОВЛИ В ХОДЕ ==========
function processTradeAgreements() {
    if (!window.globalTradeAgreements) return;
    const toRemove = [];

    for (let agreement of window.globalTradeAgreements) {
        if (agreement.factionId !== window.currentFaction) continue;

        // Срок действия
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

        const provinces = (typeof getCurrentFactionProvinces === 'function') ? getCurrentFactionProvinces() : [];

        if (agreement.type === 'export') {
            // Проверяем наличие ресурса
            let available = 0;
            for (let pid of provinces) {
                if (typeof provincesData !== 'undefined' && provincesData[pid]?.resources) {
                    available += provincesData[pid].resources[resource] || 0;
                }
            }
            if (available < amount) {
                if (typeof addBuildingsLog === 'function') addBuildingsLog(`❌ Недостаточно ресурса для экспорта ${resource}`);
                continue;
            }
            // Списываем ресурс
            let remaining = amount;
            for (let pid of provinces) {
                if (typeof provincesData === 'undefined' || !provincesData[pid]?.resources) continue;
                const res = provincesData[pid].resources;
                const deduct = Math.min(remaining, res[resource] || 0);
                res[resource] -= deduct;
                remaining -= deduct;
                if (remaining <= 0) break;
            }
            // Добавляем эрсы в столицу
            const capitalPid = provinces[0] || Object.keys(provincesData)[0];
            if (capitalPid && provincesData[capitalPid]?.resources) {
                provincesData[capitalPid].resources.ers += totalCost;
            }
            if (typeof addBuildingsLog === 'function') addBuildingsLog(`✅ Экспорт: продано ${amount} ед. ${resource} за ${totalCost} эрсов.`);
        } else if (agreement.type === 'import') {
            // Проверяем наличие эрсов
            let totalErs = 0;
            for (let pid of provinces) {
                if (typeof provincesData !== 'undefined' && provincesData[pid]?.resources) {
                    totalErs += provincesData[pid].resources.ers || 0;
                }
            }
            if (totalErs < totalCost) {
                if (typeof addBuildingsLog === 'function') addBuildingsLog(`❌ Недостаточно эрсов для импорта ${resource}`);
                continue;
            }
            // Списываем эрсы
            let remainingErs = totalCost;
            for (let pid of provinces) {
                if (typeof provincesData === 'undefined' || !provincesData[pid]?.resources) continue;
                const res = provincesData[pid].resources;
                const deduct = Math.min(remainingErs, res.ers);
                res.ers -= deduct;
                remainingErs -= deduct;
                if (remainingErs <= 0) break;
            }
            // Добавляем ресурс в первую провинцию
            const targetPid = provinces[0] || Object.keys(provincesData)[0];
            if (targetPid && provincesData[targetPid]?.resources) {
                provincesData[targetPid].resources[resource] = (provincesData[targetPid].resources[resource] || 0) + amount;
            }
            if (typeof addBuildingsLog === 'function') addBuildingsLog(`✅ Импорт: куплено ${amount} ед. ${resource} за ${totalCost} эрсов.`);
        }
    }

    // Удаляем истекшие
    if (toRemove.length > 0) {
        window.globalTradeAgreements = window.globalTradeAgreements.filter(a => !toRemove.includes(a.id));
        if (typeof addBuildingsLog === 'function') addBuildingsLog(`🕒 ${toRemove.length} договоров истекли и удалены.`);
    }
}

// ========== 6. ИНИЦИАЛИЗАЦИЯ ==========
function initTradeData() {
    // Убедимся, что есть массив
    if (!window.globalTradeAgreements) window.globalTradeAgreements = [];
    // Миграция старых договоров (если без factionId)
    if (window.globalTradeAgreements.length && !window.globalTradeAgreements[0].hasOwnProperty('factionId')) {
        window.globalTradeAgreements = [];
        if (typeof saveAllData === 'function') saveAllData();
    }

    updatePartnerSelect();
    renderAgreements();
    renderTradeableResources();
	renderTradeSummary();
}

function renderTradeSummary() {
    const container = document.getElementById('tradeSummary');
    if (!container) {
        console.warn('tradeSummary не найден');
        return;
    }

    const agreements = (typeof globalTradeAgreements !== 'undefined') 
        ? globalTradeAgreements.filter(a => a.factionId === currentFaction) 
        : [];
    
    if (agreements.length === 0) {
        container.innerHTML = '';
        return;
    }

    const bonusPercent = getTradeBonusPercent();
    let totalExport = 0;
    let totalImport = 0;
    let rowsHtml = '';

    for (let a of agreements) {
        const res = RESOURCES_REGISTRY[a.resource] || { name: a.resource };
        const partnerName = (typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[a.partnerId]) ? FACTION_NAMES[a.partnerId] : a.partnerId;
        const sum = a.amountPerTurn * a.price;

        if (a.type === 'export') {
            const bonusAmount = Math.floor(sum * (bonusPercent / 100));
            totalExport += sum;
            rowsHtml += `
                <tr>
                    <td>📤 ${res.name} → ${partnerName}</td>
                    <td style="text-align:right;">+${sum.toLocaleString()}</td>
                    <td style="text-align:right;">${bonusPercent > 0 ? `+${bonusAmount} (${bonusPercent}%)` : '—'}</td>
                    <td style="text-align:right;">+${(sum + bonusAmount).toLocaleString()}</td>
                </tr>`;
        } else {
            totalImport += sum;
            rowsHtml += `
                <tr>
                    <td>📥 ${res.name} ← ${partnerName}</td>
                    <td style="text-align:right;">−${sum.toLocaleString()}</td>
                    <td style="text-align:right;">—</td>
                    <td style="text-align:right;">−${sum.toLocaleString()}</td>
                </tr>`;
        }
    }

    const totalBonus = Math.floor(totalExport * (bonusPercent / 100));
    const netIncome = totalExport + totalBonus - totalImport;

    const html = `
        <div class="stat-card" style="margin-top:15px;">
            <h3>📊 Сводка торговли</h3>
            <table style="width:100%; border-collapse:collapse; margin-top:10px;">
                <thead>
                    <tr style="border-bottom:1px solid #b87c4f;">
                        <th>Сделка</th>
                        <th style="text-align:right;">Сумма</th>
                        <th style="text-align:right;">Бонус рынков</th>
                        <th style="text-align:right;">Итого</th>
                    </tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
                <tfoot>
                    <tr style="border-top:2px solid #ffd966; font-weight:bold;">
                        <td>Общий итог</td>
                        <td style="text-align:right;">${(totalExport > 0 ? '+' : '') + totalExport.toLocaleString()} / −${totalImport.toLocaleString()}</td>
                        <td style="text-align:right;">+${totalBonus.toLocaleString()} (${bonusPercent}%)</td>
                        <td style="text-align:right; color:${netIncome >= 0 ? '#8bc34a' : '#ff6b6b'};">${netIncome >= 0 ? '+' : ''}${netIncome.toLocaleString()} эрсов/ход</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
    container.innerHTML = html;
}

// ========== 7. ЭКСПОРТ ФУНКЦИЙ ==========
window.processTradeAgreements = processTradeAgreements;
window.initTradeData = initTradeData;
window.addTradeAgreement = addTradeAgreement;
window.renderAgreements = renderAgreements;
window.renderTradeableResources = renderTradeableResources;

console.log("✅ trade.js загружен (переписанная версия)");