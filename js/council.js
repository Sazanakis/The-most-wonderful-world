// ============================================================================
// МОДУЛЬ 06: council.js (версия 4.2 – удаление вассалов, партии, отнятие любых поселений)
// ============================================================================
// Загружено на гитхаб 18.07.2026
// ========== 1. ИНИЦИАЛИЗАЦИЯ СОВЕТОВ ==========

function initFactionCouncil(factionId, rulerName) {
    if (typeof factionCouncils === 'undefined') {
        console.error("factionCouncils не определён");
        return null;
    }

    if (!factionCouncils[factionId]) {
        factionCouncils[factionId] = new FactionCouncil(factionId, rulerName);

        const startHouses = (typeof INITIAL_VASSALS !== 'undefined' && INITIAL_VASSALS[factionId]) 
            ? INITIAL_VASSALS[factionId] 
            : [];

        for (let h of startHouses) {
            const house = new InfluentialHouse(
                h.id || (typeof generateId === 'function' ? generateId() : Date.now() + '-' + Math.random()),
                h.name,
                h.vassalType,
                h.politicalFaction,   // теперь это ключ партии
                h.leader,
                h.baseLoyalty
            );

            if (typeof VASSAL_ICONS !== 'undefined' && VASSAL_ICONS[h.id]) {
                house.coatOfArms = VASSAL_ICONS[h.id].coat;
                house.leaderPortrait = VASSAL_ICONS[h.id].portrait;
            }

            if (h.externalLink) {
                house.externalLink = h.externalLink;
            }

            factionCouncils[factionId].houses.push(house);
        }

        const factionName = (typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[factionId]) 
            ? FACTION_NAMES[factionId] 
            : factionId;

        if (typeof addGlobalLog === 'function') {
            addGlobalLog(`🏛️ Создан совет для фракции "${factionName}" с ${startHouses.length} вассалами.`, 'council');
        }
    }

    return factionCouncils[factionId];
}

function getFactionCouncil(factionId) {
    if (typeof factionCouncils === 'undefined') return null;
    if (!factionCouncils[factionId]) {
        const rulerName = (typeof FACTION_RULERS !== 'undefined' && FACTION_RULERS[factionId]) 
            ? FACTION_RULERS[factionId] 
            : "Правитель";
        initFactionCouncil(factionId, rulerName);
    }
    return factionCouncils[factionId];
}

// ========== 2. УПРАВЛЕНИЕ ВАССАЛАМИ ==========

function addNewVassal(factionId, name, vassalType, politicalFaction, leaderName, baseLoyalty = 50) {
    const council = getFactionCouncil(factionId);
    if (!council) return false;

    const newId = (typeof generateId === 'function') ? generateId() : Date.now() + '-' + Math.random();
    const house = new InfluentialHouse(newId, name, vassalType, politicalFaction, leaderName, baseLoyalty);

    council.houses.push(house);

    if (typeof renderCouncil === 'function') renderCouncil();
    if (typeof addGlobalLog === 'function') {
        addGlobalLog(`➕ Добавлен вассал: "${name}" в совет ${(typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[factionId]) ? FACTION_NAMES[factionId] : factionId}`, 'council');
    }
    saveAllData();
    return true;
}

function removeVassal(houseId) {
    if (confirm("Удалить этого вассала? Это действие необратимо.")) {
        if (typeof factionCouncils === 'undefined') return false;
        for (let council of Object.values(factionCouncils)) {
            if (council.removeHouse(houseId)) {
                if (typeof renderCouncil === 'function') renderCouncil();
                if (typeof addGlobalLog === 'function') {
                    addGlobalLog(`🗑️ Удалён вассал из совета`, 'council');
                }
                saveAllData();
                return true;
            }
        }
    }
    return false;
}

// ========== 3. МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ ВАССАЛА ==========

function openAddVassalModal() {
    const council = getFactionCouncil(currentCouncilFaction);
    if (!council) return;

    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:2000;display:flex;justify-content:center;align-items:center';

    const vassalTypesOptions = Object.entries(VASSAL_TYPES).map(([k,v]) => `<option value="${k}">${v.name}</option>`).join('');
    const politicalPartiesOptions = Object.entries(POLITICAL_PARTIES).map(([k,v]) => `<option value="${k}">${v.name}</option>`).join('');

    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:500px;width:90%;">
            <h3>➕ ДОБАВЛЕНИЕ ВАССАЛА</h3>
            <div style="margin:15px 0;"><label>🏯 Название дома:</label><input type="text" id="newVassalName" style="width:100%;margin-top:5px;"></div>
            <div style="margin:15px 0;"><label>👑 Имя главы:</label><input type="text" id="newLeaderName" style="width:100%;margin-top:5px;"></div>
            <div style="margin:15px 0;"><label>📊 Тип вассала:</label><select id="newVassalType" style="width:100%;margin-top:5px;">${vassalTypesOptions}</select></div>
            <div style="margin:15px 0;"><label>🏛️ Партия:</label><select id="newPoliticalParty" style="width:100%;margin-top:5px;">${politicalPartiesOptions}</select></div>
            <div style="margin:15px 0;"><label>❤️ Базовая лояльность:</label><input type="number" id="newBaseLoyalty" value="50" min="0" max="100" style="width:100%;margin-top:5px;"></div>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px;">
                <button id="confirmAddVassalBtn">✅ Добавить</button>
                <button id="cancelAddVassalBtn" style="background:#7a2a2a;">❌ Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('confirmAddVassalBtn').onclick = () => {
        const name = document.getElementById('newVassalName').value.trim();
        const leaderName = document.getElementById('newLeaderName').value.trim();
        if (!name || !leaderName) { alert("Заполните все поля!"); return; }
        addNewVassal(
            currentCouncilFaction,
            name,
            document.getElementById('newVassalType').value,
            document.getElementById('newPoliticalParty').value,
            leaderName,
            parseInt(document.getElementById('newBaseLoyalty').value)
        );
        modal.remove();
    };
    document.getElementById('cancelAddVassalBtn').onclick = () => modal.remove();
}

// ========== 4. РУЧНОЕ ИЗМЕНЕНИЕ ВЛИЯНИЯ И ЛОЯЛЬНОСТИ ==========

function manualModifyLoyalty(houseId, delta, reason) {
    const house = findHouseById(houseId);
    if (house) {
        house.modifyLoyalty(delta, `Ручное изменение: ${reason}`);
        if (typeof addGlobalLog === 'function') {
            addGlobalLog(`❤️ Дому "${house.name}" изменена лояльность на ${delta} (${reason})`, 'council');
        }
        saveAllData();
        if (typeof renderCouncil === 'function') renderCouncil();
        return true;
    }
    return false;
}

function manualModifyInfluence(houseId, delta, reason) {
    const house = findHouseById(houseId);
    if (house) {
        house.modifyInfluence(delta, `Ручное изменение: ${reason}`);
        if (typeof addGlobalLog === 'function') {
            addGlobalLog(`📊 Дому "${house.name}" изменено влияние на ${delta} (${reason})`, 'council');
        }
        saveAllData();
        if (typeof renderCouncil === 'function') renderCouncil();
        return true;
    }
    return false;
}

// ========== 5. ГЕРБЫ И ПОРТРЕТЫ ==========

function loadCoatOfArms(houseId, file) {
    const house = findHouseById(houseId);
    if (!house) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        house.coatOfArms = ev.target.result;
        saveAllData();
        if (typeof renderCouncil === 'function') renderCouncil();
        if (typeof addGlobalLog === 'function') addGlobalLog(`🛡️ Герб "${house.name}" обновлён`, 'council');
        if (typeof openVassalModal === 'function') openVassalModal(houseId);
    };
    reader.readAsDataURL(file);
}

function loadLeaderPortrait(houseId, file) {
    const house = findHouseById(houseId);
    if (!house) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        house.leaderPortrait = ev.target.result;
        saveAllData();
        if (typeof renderCouncil === 'function') renderCouncil();
        if (typeof addGlobalLog === 'function') addGlobalLog(`📸 Портрет "${house.leaderName}" обновлён`, 'council');
        if (typeof openVassalModal === 'function') openVassalModal(houseId);
    };
    reader.readAsDataURL(file);
}

// ========== 6. РАБОТА С ПОСЕЛЕНИЯМИ ==========

function getVassalSettlements(houseId) {
    const result = [];
    if (typeof provincesData === 'undefined') return result;
    for (let pid in provincesData) {
        const prov = provincesData[pid];
        if (!prov || !prov.settlements) continue;
        for (let s of prov.settlements) {
            // Учитываем как явно переданные, так и исходные из SETTLEMENTS_DB
            if (getVassalForSettlement(s.id) === houseId) {
                result.push({ ...s, _provinceId: pid });
            }
        }
    }
    return result;
}

function transferSettlementToVassal(settlementId, houseId) {
    for (let pid in provincesData) {
        const prov = provincesData[pid];
        if (!prov || !prov.settlements) continue;
        const settlement = prov.settlements.find(s => s.id === settlementId);
        if (settlement) {
            settlement.vassalHouse = houseId;
            saveAllData();
            if (typeof refreshBuildingsUI === 'function') refreshBuildingsUI();
            if (typeof addGlobalLog === 'function') {
                addGlobalLog(`🏘️ Поселение "${settlement.name}" передано вассалу.`, 'council');
            }
            if (typeof openVassalModal === 'function') {
                openVassalModal(houseId);
            }
            return true;
        }
    }
    return false;
}

function removeSettlementFromVassal(settlementId) {
    // Удаляем привязку из данных провинций, если она есть
    for (let pid in provincesData) {
        const prov = provincesData[pid];
        if (!prov || !prov.settlements) continue;
        const settlement = prov.settlements.find(s => s.id === settlementId);
        if (settlement && settlement.vassalHouse) {
            settlement.vassalHouse = null;
            saveAllData();
            if (typeof refreshBuildingsUI === 'function') refreshBuildingsUI();
            if (typeof addGlobalLog === 'function') {
                addGlobalLog(`🏘️ Поселение "${settlement.name}" возвращено под прямое управление.`, 'council');
            }
            if (typeof openVassalModal === 'function') {
                const currentModalHouseId = document.getElementById('vassalModal')?.getAttribute('data-house-id');
                if (currentModalHouseId) openVassalModal(currentModalHouseId);
            }
            return true;
        }
    }
    // Если не нашли в данных провинций, сбрасываем в SETTLEMENTS_DB
    if (typeof SETTLEMENTS_DB !== 'undefined') {
        const s = SETTLEMENTS_DB[settlementId];
        if (s && s.vassalHouse) {
            s.vassalHouse = null;  // очищаем исходную привязку
            saveAllData();
            if (typeof refreshBuildingsUI === 'function') refreshBuildingsUI();
            if (typeof addGlobalLog === 'function') {
                addGlobalLog(`🏘️ Исходное владение "${s.name}" отнято у вассала.`, 'council');
            }
            return true;
        }
    }
    return false;
}

// ========== 7. ЭКСПОРТ/ИМПОРТ/СБРОС ==========

function exportCouncilData() {
    const exportData = {
        factionCouncils: factionCouncils,
        currentCouncilFaction: currentCouncilFaction,
        version: "1.0"
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `council_${currentCouncilFaction}_${new Date().toISOString().slice(0, 19)}.json`;
    a.click();
    if (typeof addGlobalLog === 'function') addGlobalLog("💾 Экспорт данных Совета выполнен.", 'council');
}

function importCouncilData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.factionCouncils) {
                for (let key in data.factionCouncils) {
                    const councilData = data.factionCouncils[key];
                    const council = new FactionCouncil(councilData.factionId, councilData.rulerName);
                    Object.assign(council, councilData);
                    council.houses = councilData.houses.map(hData => {
                        const house = new InfluentialHouse(hData.id, hData.name, hData.vassalType, hData.politicalFaction, hData.leaderName, hData.loyaltyToRuler);
                        Object.assign(house, hData);
                        return house;
                    });
                    factionCouncils[key] = council;
                }
            }
            if (data.currentCouncilFaction) currentCouncilFaction = data.currentCouncilFaction;
            if (typeof renderCouncil === 'function') renderCouncil();
            if (typeof addGlobalLog === 'function') addGlobalLog("📂 Импорт данных Совета выполнен.", 'council');
        } catch(err) {
            alert("Ошибка импорта: " + err.message);
        }
    };
    reader.readAsText(file);
}

function resetCouncil() {
    if (confirm("Сбросить ВСЕ данные Совета? Все прогресс будет потерян.")) {
        if (typeof factionCouncils !== 'undefined') {
            for (let key in factionCouncils) delete factionCouncils[key];
        }
        initFactionCouncil(currentCouncilFaction, "Правитель");
        saveAllData();
        if (typeof renderCouncil === 'function') renderCouncil();
        if (typeof addGlobalLog === 'function') addGlobalLog("🔄 Выполнен сброс всех данных Совета.", 'council');
    }
}

// ========== 8. ПЕРЕКЛЮЧЕНИЕ ФРАКЦИИ В СОВЕТЕ ==========

function setCouncilFaction(factionId) {
    currentCouncilFaction = factionId;
    document.querySelectorAll('.council-faction-btn').forEach(btn => {
        if (btn.getAttribute('data-council-faction') === factionId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    if (typeof renderCouncil === 'function') renderCouncil();
    if (typeof addGlobalLog === 'function') {
        const factionName = (typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[factionId]) ? FACTION_NAMES[factionId] : factionId;
        addGlobalLog(`🏛️ Переключено на совет фракции "${factionName}".`, 'council');
    }
}

// ========== 9. ПОВЫШЕНИЕ РАНГА ==========

function upgradeVassalRank(houseId) {
    const house = findHouseById(houseId);
    if (!house) return false;
    const nextType = (typeof VASSAL_UPGRADE_MAP !== 'undefined') ? VASSAL_UPGRADE_MAP[house.vassalType] : null;
    if (!nextType) {
        if (typeof addGlobalLog === 'function') addGlobalLog(`❌ ${house.name} нельзя повысить (тип ${house.vassalType})`, 'council');
        return false;
    }
    if (house.loyaltyToRuler < 70) {
        if (typeof addGlobalLog === 'function') addGlobalLog(`❌ Для повышения ${house.name} нужно 70% лояльности (сейчас ${house.loyaltyToRuler}%)`, 'council');
        return false;
    }
    const COST = 2000;
    let treasury = (typeof getCurrentTreasury === 'function') ? getCurrentTreasury() : 0;
    if (treasury < COST) {
        if (typeof addGlobalLog === 'function') addGlobalLog(`❌ Не хватает ${COST} эрсов для повышения ${house.name}`, 'council');
        return false;
    }
    if (typeof setFactionTreasury === 'function') {
        setFactionTreasury(treasury - COST);
    }
    if (typeof updateTreasuryDisplay === 'function') updateTreasuryDisplay();

    const oldType = house.vassalType;
    house.vassalType = nextType;
    house.updateTitle();
    const newLimits = (typeof VASSAL_TYPES !== 'undefined') ? VASSAL_TYPES[nextType] : null;
    if (newLimits) {
        house.currentInfluence = Math.max(newLimits.minInfluence, Math.min(newLimits.maxInfluence, house.currentInfluence));
    }
    house.modifyLoyalty(0, `Повышение ранга с ${oldType} до ${nextType} за ${COST} эрсов`);
    saveAllData();
    if (typeof addGlobalLog === 'function') addGlobalLog(`🏅 ${house.name} повышен с ${oldType} до ${nextType}!`, 'council');
    if (typeof renderCouncil === 'function') renderCouncil();
    if (typeof openVassalModal === 'function') openVassalModal(houseId);
    return true;
}

// ========== 10. РЕНДЕР СОВЕТА (ПЛАШКИ + ШКАЛА) ==========

function renderCouncil() {
    const council = getFactionCouncil(currentCouncilFaction);
    if (!council) return;

    const container = document.getElementById('housesContainer');
    if (!container) return;

    const currentTreasury = (typeof getCurrentTreasury === 'function') ? getCurrentTreasury() : 0;
    const treasurySpan = document.getElementById('councilTreasury');
    if (treasurySpan) treasurySpan.innerText = Math.floor(currentTreasury);

    // Шкала влияния
    const rulerVotes = council.getRulerVotes();
    const totalSeats = (typeof TOTAL_COUNCIL_SEATS !== 'undefined') ? TOTAL_COUNCIL_SEATS : 300;
    const controlPercent = (rulerVotes / totalSeats * 100).toFixed(1);

    let html = '';
	html += `<div class="stat-card" style="margin-bottom: 15px;">
		<div style="display: flex; justify-content: space-between; align-items: center;">
			<span>👑 Контроль правителя:</span>
			<span><strong>${rulerVotes}</strong> / ${totalSeats} (${controlPercent}%)</span>
		</div>
		<div style="background: #4a3a2a; border-radius: 20px; height: 10px; margin-top: 8px;">
			<div style="width: ${Math.min(controlPercent, 100)}%; height: 100%; background: #ffd966; border-radius: 20px;"></div>
		</div>
	</div>`;

    // Кнопка добавления
    html += `<button id="addVassalBtn" style="margin-bottom: 15px;">➕ Добавить вассала</button>`;

    if (council.houses.length === 0) {
        html += '<div style="text-align:center; color:#8a7a5a; padding:20px;">Нет вассалов. Добавьте нового.</div>';
    } else {
        for (let house of council.houses) {
            const loyaltyColor = house.loyaltyToRuler > 70 ? '#8bc34a' : (house.loyaltyToRuler > 40 ? '#ffd966' : '#ff6b6b');
            html += `
                <div class="house-card" style="display: flex; align-items: center; gap: 15px; background: #2c281c; border: 1px solid #b87c4f; border-radius: 16px; padding: 12px; margin-bottom: 8px;">
                    <img src="${house.coatOfArms || (typeof getIconPath === 'function' ? getIconPath('default_coat', '🛡️') : '🛡️')}" style="width: 48px; height: 48px; object-fit: contain; border-radius: 8px;">
                    <div style="flex: 1;">
                        <div style="font-weight: bold; font-size: 1.1rem;">${escapeHtml(house.name)}</div>
                        <div style="font-size: 0.8rem; color: ${loyaltyColor};">❤️ Лояльность: ${house.loyaltyToRuler}%</div>
                    </div>
                    <button style="background: #3a5a2a; padding: 6px 16px;" onclick="openVassalModal('${house.id}')">Подробнее</button>
                    <button style="background: #7a2a2a; padding: 6px 12px;" onclick="removeVassal('${house.id}')">🗑️</button>
                </div>
            `;
        }
    }

    container.innerHTML = html;
    document.getElementById('addVassalBtn').onclick = openAddVassalModal;
}

// ========== 11. МОДАЛЬНОЕ ОКНО ВАССАЛА (ПОДРОБНАЯ ИНФОРМАЦИЯ) ==========

function openVassalModal(houseId) {
    const house = findHouseById(houseId);
    if (!house) return;

    const oldModal = document.getElementById('vassalModal');
    if (oldModal) oldModal.remove();

    const politicalParty = (typeof POLITICAL_PARTIES !== 'undefined' && POLITICAL_PARTIES[house.politicalFaction]) 
        ? POLITICAL_PARTIES[house.politicalFaction] 
        : { name: 'Независимые', color: '#cfc294' };

    const settlements = getVassalSettlements(houseId);

    const modal = document.createElement('div');
    modal.id = 'vassalModal';
    modal.setAttribute('data-house-id', houseId);
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 10000; display: flex; justify-content: center; align-items: center;';

    modal.innerHTML = `
        <div style="background: #1f1c14; border: 2px solid #b87c4f; border-radius: 24px; padding: 25px; max-width: 800px; width: 95%; max-height: 85vh; overflow-y: auto; display: flex; gap: 25px; flex-wrap: wrap;">
            <!-- Левая колонка: герб, портрет -->
            <div style="flex: 0 0 200px; text-align: center;">
                <div style="margin-bottom: 20px;">
                    <div style="font-size: 0.8rem; color:#ffd966;">ГЕРБ</div>
                    <img src="${house.coatOfArms || (typeof getIconPath === 'function' ? getIconPath('default_coat', '🛡️') : '🛡️')}" style="width: 100px; height: 100px; object-fit: contain; margin-top: 5px; cursor: pointer;" title="Нажмите, чтобы изменить">
                    <button id="changeCoatBtn" style="display: block; margin: 5px auto; padding: 2px 10px; font-size: 0.7rem;">📁 Выбрать герб</button>
                </div>
                <div>
                    <div style="font-size: 0.8rem; color:#ffd966;">ПОРТРЕТ ЛИДЕРА</div>
                    <img src="${house.leaderPortrait || (typeof getIconPath === 'function' ? getIconPath('default_portrait', '👤') : '👤')}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 10px; margin-top: 5px; cursor: pointer;" title="Нажмите, чтобы изменить">
                    <button id="changePortraitBtn" style="display: block; margin: 5px auto; padding: 2px 10px; font-size: 0.7rem;">📁 Выбрать портрет</button>
                </div>
            </div>

            <!-- Правая колонка: информация и управление -->
            <div style="flex: 1; min-width: 300px;">
                <h2 style="color:#ffd966; margin-top:0;">
                    🏯 <span class="editable-field" data-field="name" data-value="${escapeHtml(house.name)}">${escapeHtml(house.name)}</span>
                </h2>
                
                <div style="margin: 15px 0;">
                    <div><strong>👑 Глава:</strong> <span class="editable-field" data-field="leaderName" data-value="${escapeHtml(house.leaderName)}">${escapeHtml(house.leaderName)}</span></div>
                    <div><strong>👑 Титул:</strong> ${house.title || 'Без титула'}</div>
					<div><strong>❤️ Лояльность:</strong> ${house.loyaltyToRuler}%</div>
                    <div><strong>🏛️ Партия:</strong> <span style="color:${politicalParty.color}">${politicalParty.name}</span></div>
                    <div><strong>📊 Тип:</strong> ${(typeof VASSAL_TYPES !== 'undefined' && VASSAL_TYPES[house.vassalType]) ? VASSAL_TYPES[house.vassalType].name : 'Неизвестно'}</div>
                    <div><strong>🎫 Влияние:</strong> ${house.getEffectiveInfluence()}</div>
                    <div><strong>🔗 Внешний источник:</strong>
                        <input type="text" id="externalLinkInput" value="${house.externalLink || ''}" 
                               style="width: 70%; margin-top: 4px; background: #2a2418; border: 1px solid #b87c4f; color: #f0e6d0; padding: 4px 8px; border-radius: 12px;"
                               placeholder="https://vk.com/...">
                        <button id="externalLinkBtn" style="background:#3a5a2a; padding: 2px 10px; margin-left: 10px;">🌐 Открыть</button>
                    </div>
                </div>

                <hr style="border-color: #b87c4f; margin: 15px 0;">

                <!-- Управление лояльностью и влиянием -->
                <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 15px;">
                    <button id="loyaltyPlusBtn" style="background:#3a6b3a;">👍 +5 лояльности</button>
                    <button id="loyaltyMinusBtn" style="background:#6b3a3a;">👎 -5 лояльности</button>
                    <button id="influencePlusBtn" style="background:#b8860b;">📊 +5 влияния</button>
                    <button id="influenceMinusBtn" style="background:#7a2a2a;">📊 -5 влияния</button>
                    ${(typeof VASSAL_UPGRADE_MAP !== 'undefined' && VASSAL_UPGRADE_MAP[house.vassalType]) ? `<button id="upgradeRankBtn" style="background:#b8860b;">⭐ Повысить ранг</button>` : ''}
                </div>

                <hr style="border-color: #b87c4f; margin: 15px 0;">

                <!-- Подконтрольные поселения -->
                <h3 style="color:#ffd966;">🏘️ Подконтрольные поселения (${settlements.length})</h3>
                <div style="max-height: 200px; overflow-y: auto; margin-bottom: 15px;">
                    ${settlements.length > 0 ? settlements.map(s => `
                        <div style="display: flex; justify-content: space-between; align-items: center; background: #2a2418; padding: 6px 12px; border-radius: 12px; margin-bottom: 5px;">
                            <span>${escapeHtml(s.name)} (${s.type === 'city' ? 'Город' : (s.type === 'castle' ? 'Замок' : 'Деревня')})</span>
                            <button class="remove-settlement-btn" data-settlement-id="${s.id}" style="background:#7a2a2a; padding: 2px 8px; font-size: 0.7rem;">Отнять</button>
                        </div>
                    `).join('') : '<div style="color:#8a7a5a;">Нет подконтрольных поселений</div>'}
                </div>

                <!-- Кнопка передачи поселения -->
                <button id="transferSettlementBtn" style="background:#3a5a2a;">🏘️ Передать поселение</button>

                <div style="margin-top: 20px; text-align: center;">
                    <button id="closeVassalModalBtn" style="background:#7a2a2a; padding: 8px 24px;">Закрыть</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Редактируемые поля (название дома, имя лидера)
    modal.querySelectorAll('.editable-field').forEach(field => {
        field.addEventListener('click', (e) => {
            e.stopPropagation();
            const fieldName = field.dataset.field;
            const currentValue = field.dataset.value;

            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentValue;
            input.className = 'edit-input';
            input.style.width = 'auto';

            field.innerHTML = '';
            field.appendChild(input);
            input.focus();

            input.addEventListener('blur', () => {
                const newValue = input.value.trim();
                if (newValue && newValue !== currentValue) {
                    if (fieldName === 'name') {
                        house.name = newValue;
                        if (typeof addGlobalLog === 'function') addGlobalLog(`🏯 Дом "${currentValue}" переименован в "${newValue}"`, 'council');
                    } else if (fieldName === 'leaderName') {
                        house.leaderName = newValue;
                        if (typeof addGlobalLog === 'function') addGlobalLog(`👑 Глава дома "${house.name}" теперь ${newValue}`, 'council');
                    }
                    saveAllData();
                    field.dataset.value = newValue;
                    field.innerHTML = escapeHtml(newValue);
                    if (typeof renderCouncil === 'function') renderCouncil();
                    openVassalModal(house.id);
                } else {
                    field.innerHTML = escapeHtml(currentValue);
                }
            });

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') input.blur();
            });
        });
    });

    // Обработчики кнопок
    document.getElementById('changeCoatBtn').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/png';
        input.onchange = (e) => {
            if (e.target.files[0]) loadCoatOfArms(houseId, e.target.files[0]);
        };
        input.click();
    });

    document.getElementById('changePortraitBtn').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/png';
        input.onchange = (e) => {
            if (e.target.files[0]) loadLeaderPortrait(houseId, e.target.files[0]);
        };
        input.click();
    });

    document.getElementById('loyaltyPlusBtn').addEventListener('click', () => {
        manualModifyLoyalty(houseId, 5, "Кнопка интерфейса");
        openVassalModal(houseId);
    });
    document.getElementById('loyaltyMinusBtn').addEventListener('click', () => {
        manualModifyLoyalty(houseId, -5, "Кнопка интерфейса");
        openVassalModal(houseId);
    });
    document.getElementById('influencePlusBtn').addEventListener('click', () => {
        manualModifyInfluence(houseId, 5, "Кнопка интерфейса");
        openVassalModal(houseId);
    });
    document.getElementById('influenceMinusBtn').addEventListener('click', () => {
        manualModifyInfluence(houseId, -5, "Кнопка интерфейса");
        openVassalModal(houseId);
    });

    const upgradeBtn = document.getElementById('upgradeRankBtn');
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', () => {
            upgradeVassalRank(houseId);
        });
    }

    // Кнопка внешнего источника
    document.getElementById('externalLinkBtn').addEventListener('click', () => {
        const url = document.getElementById('externalLinkInput').value.trim();
        if (url) window.open(url, '_blank');
        else alert('Ссылка не указана');
    });

    // Сохранение внешней ссылки при изменении
    document.getElementById('externalLinkInput').addEventListener('change', (e) => {
        house.externalLink = e.target.value.trim();
        saveAllData();
    });

    document.getElementById('closeVassalModalBtn').addEventListener('click', () => {
        modal.remove();
        if (typeof renderCouncil === 'function') renderCouncil();  // обновляем плашки
    });

    // Обработчики для кнопок "Отнять" у поселений
    modal.querySelectorAll('.remove-settlement-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Отнять это поселение у вассала?')) {
                removeSettlementFromVassal(btn.dataset.settlementId);
                openVassalModal(houseId);
            }
        });
    });

    // Кнопка "Передать поселение"
    document.getElementById('transferSettlementBtn').addEventListener('click', () => {
        openTransferSettlementModal(houseId);
    });
}

// ========== 12. МОДАЛЬНОЕ ОКНО ПЕРЕДАЧИ ПОСЕЛЕНИЯ ==========

function openTransferSettlementModal(houseId) {
    const availableSettlements = [];
    for (let pid in provincesData) {
        const prov = provincesData[pid];
        if (!prov || !prov.settlements) continue;
        for (let s of prov.settlements) {
            if (!getVassalForSettlement(s.id)) {
                availableSettlements.push({ ...s, _provinceId: pid });
            }
        }
    }

    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 10001; display: flex; justify-content: center; align-items: center;';

    let settlementsHtml = '';
    if (availableSettlements.length === 0) {
        settlementsHtml = '<div style="color:#8a7a5a; text-align:center;">Нет доступных поселений для передачи.</div>';
    } else {
        settlementsHtml = availableSettlements.map(s => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: #2a2418; padding: 6px 12px; border-radius: 12px; margin-bottom: 5px;">
                <span>${escapeHtml(s.name)} (${s.type === 'city' ? 'Город' : (s.type === 'castle' ? 'Замок' : 'Деревня')})</span>
                <button class="transfer-btn" data-settlement-id="${s.id}" style="background:#3a6b3a; padding: 2px 8px; font-size: 0.7rem;">Передать</button>
            </div>
        `).join('');
    }

    modal.innerHTML = `
        <div style="background: #1f1c14; border: 2px solid #b87c4f; border-radius: 24px; padding: 25px; max-width: 600px; width: 90%;">
            <h3>🏘️ Передать поселение вассалу</h3>
            <div style="max-height: 300px; overflow-y: auto; margin: 15px 0;">
                ${settlementsHtml}
            </div>
            <div style="text-align: center;">
                <button id="closeTransferModalBtn" style="background:#7a2a2a;">Закрыть</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelectorAll('.transfer-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Передать это поселение вассалу?')) {
                transferSettlementToVassal(btn.dataset.settlementId, houseId);
                modal.remove();
            }
        });
    });

    document.getElementById('closeTransferModalBtn').addEventListener('click', () => modal.remove());
}

console.log("✅ council.js загружен — версия 4.2 (удаление, партии, отнятие любых поселений)");