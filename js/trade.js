// ============================================================================
// МОДУЛЬ: trade.js (полностью переписанная версия)
// ============================================================================
// загружено на гитхаб 26.09.26
// Глобальный массив торговых соглашений
window.globalTradeAgreements = window.globalTradeAgreements || [];

let selectedTradeResource = null;
// === НАСТРОЙКИ ТОРГОВЛИ ===
function initTradeSettings() {
    if (typeof peopleState !== 'undefined') {
        if (!peopleState.tradeSettings) {
            peopleState.tradeSettings = {
                tariffPercent: 5    // ← пошлина по умолчанию 5%
            };
        }
    }
}
initTradeSettings();

// Экспорт, чтобы можно было менять из UI
window.initTradeSettings = initTradeSettings;
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
        const basePrice = RESOURCES_REGISTRY[resourceId]?.basePrice || '—';
        panel.innerHTML = `✅ Выбран для торговли: <strong>${RESOURCES_REGISTRY[resourceId]?.name || resourceId}</strong> <span style="color:#8a7a5a;">(базовая цена: ${basePrice} эрс)</span>`;
    }
    updatePriceFromResource(resourceId);   // ← ДОБАВЛЕНО
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
// Обновляем поле цены при выборе ресурса — базовой ценой
function updatePriceFromResource(resourceId) {
    const priceInput = document.getElementById('newAgreementPrice');
    if (!priceInput) return;
    const base = RESOURCES_REGISTRY[resourceId]?.basePrice;
    if (base) priceInput.value = base;
}
// ========== 3. ОТОБРАЖЕНИЕ АКТИВНЫХ ДОГОВОРОВ ==========
function renderAgreements() {
    const container = document.getElementById('agreementsList');
    if (!container) return;

    // ← ОЧИЩАЕМ КОНТЕЙНЕР ПЕРЕД ОТРИСОВКОЙ
    container.innerHTML = '';

    const relevant = window.globalTradeAgreements.filter(a => a.factionId === window.currentFaction);
    if (relevant.length === 0) {
        container.innerHTML = '<em>Нет активных договоров.</em>';
        return;
    }

    // Сортировка (по умолчанию — по прибыли, убыточные сверху не идут)
    const sortBy = localStorage.getItem('tradeSortBy') || 'profit';
    const sorted = [...relevant].sort((a, b) => {
        if (sortBy === 'partner') {
            const pa = FACTION_NAMES[a.partnerId] || a.partnerId;
            const pb = FACTION_NAMES[b.partnerId] || b.partnerId;
            return pa.localeCompare(pb);
        } else if (sortBy === 'resource') {
            const ra = RESOURCES_REGISTRY[a.resource]?.name || a.resource;
            const rb = RESOURCES_REGISTRY[b.resource]?.name || b.resource;
            return ra.localeCompare(rb);
        } else {
            // по прибыли (модуль суммы)
            const sa = a.amountPerTurn * a.price;
            const sb = b.amountPerTurn * b.price;
            return sb - sa;
        }
    });

    const tariff = (typeof peopleState !== 'undefined' && peopleState.tradeSettings)
        ? (peopleState.tradeSettings.tariffPercent || 0)
        : 5;

    // Заголовок с сортировкой
    let html = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
            <span style="font-size:0.85rem; color:#8a7a5a;">Сортировка:</span>
            <div style="display:flex; gap:6px;">
                <button class="trade-sort-btn" data-sort="profit" style="padding:3px 10px; font-size:0.7rem; ${sortBy === 'profit' ? 'background:#3a6b3a;' : ''}">💰 По прибыли</button>
                <button class="trade-sort-btn" data-sort="partner" style="padding:3px 10px; font-size:0.7rem; ${sortBy === 'partner' ? 'background:#3a6b3a;' : ''}">🤝 По партнёру</button>
                <button class="trade-sort-btn" data-sort="resource" style="padding:3px 10px; font-size:0.7rem; ${sortBy === 'resource' ? 'background:#3a6b3a;' : ''}">📦 По ресурсу</button>
            </div>
        </div>
    `;

    for (let a of sorted) {
        const partnerName = (typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[a.partnerId])
            ? FACTION_NAMES[a.partnerId] : a.partnerId;
        const direction = a.type === 'export' ? '📤 Экспорт' : '📥 Импорт';
        const res = RESOURCES_REGISTRY[a.resource] || { name: a.resource, icon: '' };
        const resIcon = res.icon ? `<img src="${res.icon}" style="width:20px;height:20px;vertical-align:middle;">` : '';
        const durationText = (a.duration && a.duration > 0)
            ? `⏳ Осталось: ${a.remainingTurns} ходов`
            : '♾️ Бессрочный';

        const sum = a.amountPerTurn * a.price;
        const tariffCut = Math.floor(sum * tariff / 100);
        let total, totalColor;
        if (a.type === 'export') {
            total = sum - tariffCut;
            totalColor = total >= 0 ? '#8bc34a' : '#ff6b6b';
        } else {
            total = -(sum + tariffCut);
            totalColor = '#ff6b6b';
        }

        const div = document.createElement('div');
        div.className = 'agreement-item';
        div.setAttribute('data-tip', `Договор: ${direction} ${res.name} с ${partnerName}. Сумма: ${sum} эрсов. Пошлина: ${tariff}%. Итого: ${total} эрсов/ход.`);
        div.style.cssText = 'display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #b87c4f; padding:10px 8px; border-left:3px solid ' + totalColor + '; background:rgba(0,0,0,0.15); margin-bottom:4px; border-radius:4px;';
        div.innerHTML = `
            <div style="flex:1;">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                    ${resIcon}
                    <strong style="color:#f0e3c8;">${direction} ${res.name}</strong>
                    <span style="color:#8a7a5a;">→</span>
                    <span style="color:#d4c9b8;">${partnerName}</span>
                </div>
                <div style="font-size:0.75rem; color:#8a7a5a;">
                    ${a.amountPerTurn} ед./ход × ${a.price} эрс/ед.
                    <span style="margin-left:8px;">|</span>
                    <span style="margin-left:8px;">💰 ${sum} эрс</span>
                    <span style="color:#ff6b6b; margin-left:8px;">−${tariff}% пошлина</span>
                    <span style="margin-left:8px;">|</span>
                    <span style="margin-left:8px;">${durationText}</span>
                </div>
            </div>
            <div style="text-align:right;">
                <div style="font-size:1.1rem; font-weight:bold; color:${totalColor};">${total >= 0 ? '+' : ''}${total}</div>
                <div style="font-size:0.7rem; color:#8a7a5a;">эрс/ход</div>
            </div>
            <button class="delete-agreement" data-id="${a.id}" style="background:#7a2a2a; padding:4px 10px; margin-left:10px;">🗑️</button>
        `;
        container.appendChild(div);
    }

    // Обработчики сортировки
    container.querySelectorAll('.trade-sort-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            localStorage.setItem('tradeSortBy', btn.dataset.sort);
            renderAgreements();
        });
    });

    // Обработчики удаления
    container.querySelectorAll('.delete-agreement').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            window.globalTradeAgreements = window.globalTradeAgreements.filter(a => a.id != id);
            if (typeof saveAllData === 'function') saveAllData();
            if (typeof refreshTradeUI === 'function') {
                refreshTradeUI();
            } else {
                renderAgreements();
                renderTradeSummary();
            }
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

    // Если цена не задана — берём базовую
    if (isNaN(price) || price <= 0) {
        price = (RESOURCES_REGISTRY[resource]?.basePrice) || 10;
    }
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
        remainingTurns: duration,
        basePrice: RESOURCES_REGISTRY[resource]?.basePrice || price
    };
    if (typeof globalTradeAgreements !== 'undefined') {
        globalTradeAgreements.push(newAgreement);
        if (typeof saveAllData === 'function') saveAllData();
        if (typeof refreshTradeUI === 'function') {
            refreshTradeUI();
        } else {
            renderAgreements();
            renderTradeSummary();
        }
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

    // Пошлина (5% по умолчанию)
    const tariff = (typeof peopleState !== 'undefined' && peopleState.tradeSettings)
        ? (peopleState.tradeSettings.tariffPercent || 0) / 100
        : 0.05;

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

        const provinces = (typeof getCurrentFactionProvinces === 'function')
            ? getCurrentFactionProvinces()
            : [];

        if (agreement.type === 'export') {
            let available = 0;
            for (let pid of provinces) {
                if (typeof provincesData !== 'undefined' && provincesData[pid]?.resources) {
                    available += provincesData[pid].resources[resource] || 0;
                }
            }
            if (available < amount) {
                if (typeof addBuildingsLog === 'function')
                    addBuildingsLog(`❌ Недостаточно ресурса для экспорта ${resource}`);
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

            // Бонус рынков и технологий
            const tradeBonusPercent = (typeof getTradeBonusPercent === 'function')
                ? getTradeBonusPercent()
                : 0;
            // Сначала применяем бонус, потом — пошлину
            const withBonus = Math.floor(totalCost * (1 + tradeBonusPercent / 100));
            const tariffCut = Math.floor(withBonus * tariff);
            const totalIncome = withBonus - tariffCut;

            // Добавляем эрсы в столицу
            const capitalPid = provinces[0] || Object.keys(provincesData)[0];
            if (capitalPid && provincesData[capitalPid]?.resources) {
                provincesData[capitalPid].resources.ers += totalIncome;
            }

            if (typeof addBuildingsLog === 'function') {
                let msg = `✅ Экспорт: продано ${amount} ед. ${resource} за ${totalIncome} эрсов`;
                if (tradeBonusPercent > 0) msg += ` (бонус ${tradeBonusPercent}%)`;
                if (tariffCut > 0) msg += ` (пошлина −${tariffCut})`;
                addBuildingsLog(msg);
            }
        } else if (agreement.type === 'import') {
            // Импорт: пошлина увеличивает цену
            const withTariff = Math.floor(totalCost * (1 + tariff));

            let totalErs = 0;
            for (let pid of provinces) {
                if (typeof provincesData !== 'undefined' && provincesData[pid]?.resources) {
                    totalErs += provincesData[pid].resources.ers || 0;
                }
            }
            if (totalErs < withTariff) {
                if (typeof addBuildingsLog === 'function')
                    addBuildingsLog(`❌ Недостаточно эрсов для импорта ${resource} (нужно ${withTariff}, есть ${totalErs})`);
                continue;
            }

            // Списываем эрсы
            let remainingErs = withTariff;
            for (let pid of provinces) {
                if (typeof provincesData === 'undefined' || !provincesData[pid]?.resources) continue;
                const res = provincesData[pid].resources;
                const deduct = Math.min(remainingErs, res.ers);
                res.ers -= deduct;
                remainingErs -= deduct;
                if (remainingErs <= 0) break;
            }

            // Добавляем ресурс
            const targetPid = provinces[0] || Object.keys(provincesData)[0];
            if (targetPid && provincesData[targetPid]?.resources) {
                provincesData[targetPid].resources[resource] =
                    (provincesData[targetPid].resources[resource] || 0) + amount;
            }

            if (typeof addBuildingsLog === 'function')
                addBuildingsLog(`✅ Импорт: куплено ${amount} ед. ${resource} за ${withTariff} эрсов (вкл. пошлину ${tariffCutLabel(withTariff - totalCost)})`);
        }
    }

    if (toRemove.length > 0) {
        window.globalTradeAgreements = window.globalTradeAgreements.filter(
            a => !toRemove.includes(a.id)
        );
        if (typeof addBuildingsLog === 'function')
            addBuildingsLog(`🕒 ${toRemove.length} договоров истекли и удалены.`);
    }
}

// Вспомогательная функция для красивого вывода пошлины
function tariffCutLabel(value) {
    return `+${value}`;
}

// ========== 6. ИНИЦИАЛИЗАЦИЯ ==========
function initTradeData() {
    if (!window.globalTradeAgreements) window.globalTradeAgreements = [];
    if (window.globalTradeAgreements.length && !window.globalTradeAgreements[0].hasOwnProperty('factionId')) {
        window.globalTradeAgreements = [];
        if (typeof saveAllData === 'function') saveAllData();
    }

    initTradeSettings();

    updatePartnerSelect();
    renderAgreements();
    renderTradeableResources();
    renderTradeSummary();

    // Настройка пошлины
    const tariffInput = document.getElementById('tariffPercentInput');
    if (tariffInput && !tariffInput._bound) {
        tariffInput._bound = true;
        tariffInput.value = peopleState.tradeSettings.tariffPercent || 5;
        tariffInput.addEventListener('change', function() {
            const val = Math.max(0, Math.min(50, parseFloat(this.value) || 0));
            peopleState.tradeSettings.tariffPercent = val;
            this.value = val;
            if (typeof saveAllData === 'function') saveAllData();
            if (typeof refreshTradeUI === 'function') {
                refreshTradeUI();
            } else {
                renderAgreements();
                renderTradeSummary();
            }
        });
    }
}

function renderTradeSummary() {
    const container = document.getElementById('tradeSummary');
    if (!container) return;

    const agreements = (typeof globalTradeAgreements !== 'undefined')
        ? globalTradeAgreements.filter(a => a.factionId === currentFaction)
        : [];

    if (agreements.length === 0) {
        container.innerHTML = '';
        return;
    }

    const bonusPercent = getTradeBonusPercent();
    const tariff = (typeof peopleState !== 'undefined' && peopleState.tradeSettings)
        ? (peopleState.tradeSettings.tariffPercent || 0)
        : 5;

    let totalExport = 0;
    let totalImport = 0;
    let totalTariffPaid = 0;
    let totalTariffReceived = 0;
    let rowsHtml = '';

    for (let a of agreements) {
        const res = RESOURCES_REGISTRY[a.resource] || { name: a.resource, icon: '' };
        const partnerName = (typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[a.partnerId]) ? FACTION_NAMES[a.partnerId] : a.partnerId;
        const sum = a.amountPerTurn * a.price;

        if (a.type === 'export') {
            const bonusAmount = Math.floor(sum * (bonusPercent / 100));
            const withBonus = sum + bonusAmount;
            const tariffCut = Math.floor(withBonus * tariff / 100);
            totalExport += withBonus;
            totalTariffPaid += tariffCut;
            rowsHtml += `
                <tr>
                    <td>📤 ${res.name} → ${partnerName}</td>
                    <td style="text-align:right;">+${sum.toLocaleString()}</td>
                    <td style="text-align:right;">+${bonusAmount.toLocaleString()}</td>
                    <td style="text-align:right; color:#ff6b6b;">−${tariffCut.toLocaleString()}</td>
                    <td style="text-align:right; color:#8bc34a;">+${(withBonus - tariffCut).toLocaleString()}</td>
                </tr>`;
        } else {
            const tariffCut = Math.floor(sum * tariff / 100);
            totalImport += sum;
            totalTariffReceived += tariffCut;
            rowsHtml += `
                <tr>
                    <td>📥 ${res.name} ← ${partnerName}</td>
                    <td style="text-align:right;">−${sum.toLocaleString()}</td>
                    <td style="text-align:right;">—</td>
                    <td style="text-align:right; color:#ff6b6b;">+${tariffCut.toLocaleString()} (к цене)</td>
                    <td style="text-align:right; color:#ff6b6b;">−${(sum + tariffCut).toLocaleString()}</td>
                </tr>`;
        }
    }

    const netIncome = totalExport - totalTariffPaid - totalImport - totalTariffReceived;

    const html = `
        <div class="stat-card" style="margin-top:15px;">
            <h3>📊 Сводка торговли</h3>
            <div style="font-size:0.85rem; color:#8a7a5a; margin-bottom:10px;">
                Пошлина: <strong style="color:#ffd966;">${tariff}%</strong> (настраивается в разделе «Настройки»)
            </div>
            <table style="width:100%; border-collapse:collapse; margin-top:10px; font-size:0.85rem;">
                <thead>
                    <tr style="border-bottom:1px solid #b87c4f; color:#ffd966;">
                        <th style="text-align:left; padding:6px;">Сделка</th>
                        <th style="text-align:right; padding:6px;">Сумма</th>
                        <th style="text-align:right; padding:6px;">Бонус</th>
                        <th style="text-align:right; padding:6px;">Пошлина</th>
                        <th style="text-align:right; padding:6px;">Итого</th>
                    </tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
                <tfoot>
                    <tr style="border-top:2px solid #ffd966; font-weight:bold;">
                        <td style="padding:8px 6px;">Общий итог</td>
                        <td style="text-align:right; padding:8px 6px;">+${totalExport.toLocaleString()} / −${totalImport.toLocaleString()}</td>
                        <td style="text-align:right; padding:8px 6px;">+${(totalExport - (totalExport - totalTariffPaid) + totalTariffPaid).toLocaleString()}</td>
                        <td style="text-align:right; padding:8px 6px; color:#ff6b6b;">−${(totalTariffPaid + totalTariffReceived).toLocaleString()}</td>
                        <td style="text-align:right; padding:8px 6px; color:${netIncome >= 0 ? '#8bc34a' : '#ff6b6b'};">${netIncome >= 0 ? '+' : ''}${netIncome.toLocaleString()} эрсов/ход</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
    container.innerHTML = html;
}
// ============================================================
// ЦЕНТРАЛИЗОВАННОЕ ОБНОВЛЕНИЕ UI ТОРГОВЛИ
// ============================================================
function refreshTradeUI() {
    if (typeof renderTradeableResources === 'function') renderTradeableResources();
    if (typeof renderAgreements === 'function')         renderAgreements();
    if (typeof renderTradeSummary === 'function')       renderTradeSummary();
    if (typeof updateTreasuryDisplay === 'function')    updateTreasuryDisplay();
    if (typeof renderProvinceDashboard === 'function')  renderProvinceDashboard();
    if (typeof renderProvinceCells === 'function')      renderProvinceCells();
}
window.refreshTradeUI = refreshTradeUI;
// ========== 7. ЭКСПОРТ ФУНКЦИЙ ==========
window.processTradeAgreements = processTradeAgreements;
window.initTradeData = initTradeData;
window.addTradeAgreement = addTradeAgreement;
window.renderAgreements = renderAgreements;
window.renderTradeableResources = renderTradeableResources;

console.log("✅ trade.js загружен (переписанная версия)");