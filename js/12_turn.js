// ============================================================================
// МОДУЛЬ 12: turn.js
// Глобальный ход — объединяет все системы (БЕЗ ДВИЖЕНИЯ АРМИЙ)
// ВЕРСИЯ 2.0 – ДОБАВЛЕНЫ ПРОВЕРКИ НА СУЩЕСТВОВАНИЕ ФУНКЦИЙ
// ============================================================================

// ========== 1. ОБНОВЛЕНИЕ ОТОБРАЖЕНИЯ ВРЕМЕНИ ==========
function updateGlobalDateDisplay() {
    const dateStr = (typeof getCurrentDateString === 'function') ? getCurrentDateString() : "1 неделя мая, 1598 год";
    const elements = ['globalDateDisplay', 'dateDisplay', 'globalDate'];
    for (let id of elements) {
        const el = document.getElementById(id);
        if (el) el.innerText = dateStr;
    }
}

// ========== 2. РАСЧЁТ СОДЕРЖАНИЯ АРМИЙ ==========
function payArmyUpkeep() {
    let upkeep = 0;
    if (typeof calculateTotalUpkeep === 'function') {
        upkeep = calculateTotalUpkeep();
    } else if (typeof armies !== 'undefined') {
        for (let army of armies) {
            if (army.factionId === currentFaction) {
                for (let unit of army.units) upkeep += unit.upkeep * unit.count;
            }
        }
        upkeep = Math.floor(upkeep);
    }
    
    let currentTreasury = 0;
    if (typeof GameState !== 'undefined') {
        currentTreasury = GameState.getTreasury();
        if (currentTreasury >= upkeep) {
            GameState.addToTreasury(-upkeep);
            addGlobalLog(`💰 Содержание армий: -${upkeep.toLocaleString()} эрсов.`, 'army');
            return true;
        } else {
            addGlobalLog(`⚠️ НЕ ХВАТАЕТ ДЕНЕГ НА СОДЕРЖАНИЕ АРМИЙ! Нужно: ${upkeep.toLocaleString()}, есть: ${currentTreasury.toLocaleString()}. Войска теряют боевой дух.`, 'army');
            return false;
        }
    } else if (typeof armyTreasury !== 'undefined') {
        currentTreasury = armyTreasury;
        if (currentTreasury >= upkeep) {
            armyTreasury -= upkeep;
            addGlobalLog(`💰 Содержание армий: -${upkeep.toLocaleString()} эрсов.`, 'army');
            return true;
        } else {
            addGlobalLog(`⚠️ НЕ ХВАТАЕТ ДЕНЕГ НА СОДЕРЖАНИЕ АРМИЙ! Нужно: ${upkeep.toLocaleString()}, есть: ${currentTreasury.toLocaleString()}.`, 'army');
            return false;
        }
    }
    return false;
}

// ========== 3. ОБНОВЛЕНИЕ ЛОЯЛЬНОСТИ ВАССАЛОВ (РАЗ В МЕСЯЦ) ==========
function updateVassalsLoyalty() {
    if (typeof factionCouncils === 'undefined') return;
    for (let factionId in factionCouncils) {
        const council = factionCouncils[factionId];
        for (let house of council.houses) {
            let delta = 0;
            if (house.loyaltyToRuler < 30) {
                delta -= Math.floor(Math.random() * 5);
            } else if (house.loyaltyToRuler > 80) {
                delta += Math.floor(Math.random() * 3);
            }
            if (house.satisfaction < 30) {
                delta -= 2;
            } else if (house.satisfaction > 70) {
                delta += 1;
            }
            if (delta !== 0) {
                house.modifyLoyalty(delta, "Ежемесячное изменение");
            }
        }
    }
    addGlobalLog("🏛️ Лояльность вассалов обновлена.", 'council');
}

// ========== 4. ГЛОБАЛЬНЫЙ ХОД ==========
function applyGlobalTurn() {
    // ----- НОВАЯ ПРОВЕРКА -----
    if (typeof peopleState !== 'undefined' && peopleState.turnsSinceDemography >= 4) {
        addGlobalLog(`⚠️ Демография требует применения! Ход заблокирован. Примените демографию на вкладке "Провинция".`, 'general');
        if (typeof showDemographyRequiredModal === 'function') {
            showDemographyRequiredModal();
        }
        // Блокируем глобальную кнопку хода, если она ещё не заблокирована
        const globalTurnBtn = document.getElementById('globalTurnBtn');
        if (globalTurnBtn) globalTurnBtn.disabled = true;
        return; // Прерываем выполнение хода
    }
    // ----- КОНЕЦ ПРОВЕРКИ -----
    addGlobalLog(`⏩ НАЧАЛО ХОДА: ${(typeof getCurrentDateString === 'function') ? getCurrentDateString() : ''}`, 'general');
    
    // 1. Сбор налогов (из населения)
    if (typeof peopleState !== 'undefined' && peopleState.turnsSinceDemography < 4 && typeof getWeeklyIncome === 'function') {
        const taxIncome = getWeeklyIncome();
        let currentTreasury = 0;
        if (typeof GameState !== 'undefined') {
            currentTreasury = GameState.getTreasury();
            GameState.setTreasury(currentTreasury + taxIncome);
        } else if (typeof armyTreasury !== 'undefined') {
            currentTreasury = armyTreasury;
            armyTreasury += taxIncome;
        } else if (typeof provincesData !== 'undefined' && provincesData[currentProvince]) {
            provincesData[currentProvince].resources.ers += taxIncome;
        }
        peopleState.turnsSinceDemography++;
        addGlobalLog(`💰 Собрано налогов: ${taxIncome.toLocaleString()} эрсов.`, 'general');
    } else if (typeof peopleState !== 'undefined' && peopleState.turnsSinceDemography >= 4) {
        addGlobalLog(`⚠️ Требуется применить демографию (на вкладке "Провинция") перед следующим ходом.`, 'general');
    }
    
    // 2. Обработка торговых договоров
    if (typeof processTradeAgreements === 'function') {
        processTradeAgreements();
    }
    
    // 3. Процессинг найма армии (завершение найма)
    if (typeof processRecruitment === 'function') {
        processRecruitment();
    }
    
    // 4. Содержание армий
    payArmyUpkeep();
    
    // 5. Строительство (уменьшение таймеров)
    if (typeof processConstruction === 'function') {
        processConstruction();
    }
    
    // 6. Сбор ресурсов с построек
    if (typeof collectResources === 'function') {
        collectResources();
    }
    
    // 7. Обновление лояльности вассалов (раз в 4 хода = месяц)
    if (typeof peopleState !== 'undefined' && (peopleState.turnsSinceDemography === 0 || peopleState.turnsSinceDemography % 4 === 0)) {
        if (typeof updateVassalsLoyalty === 'function') {
            updateVassalsLoyalty();
        }
    }
    
    // 8. Продвижение времени
    if (typeof GameState !== 'undefined') {
        GameState.advanceTime();
        const gameTime = GameState.getTime();
        if (typeof peopleState !== 'undefined') {
            peopleState.currentWeek = gameTime.week;
            peopleState.currentMonth = gameTime.month;
            peopleState.currentYear = gameTime.year;
        }
    } else if (typeof advanceWeek === 'function') {
        advanceWeek();
    }
    
    // 9. Сохранение всех данных
    if (typeof saveAllData === 'function') {
        saveAllData();
    } else if (typeof GameState !== 'undefined') {
        GameState.save();
    }
    
    // 10. Обновление всех интерфейсов
    if (typeof updateAllUI === 'function') {
        updateAllUI();
    } else {
        // fallback: обновляем основные компоненты
        if (typeof updateTreasuryDisplay === 'function') updateTreasuryDisplay();
        if (typeof renderCouncil === 'function') renderCouncil();
        if (typeof renderArmy === 'function') renderArmy();
        if (typeof refreshPeopleUI === 'function') refreshPeopleUI();
        if (typeof refreshBuildingsUI === 'function') refreshBuildingsUI();
        updateGlobalDateDisplay();
    }
    
    // 11. Обновление лимитов призыва и дашборда
    if (typeof refreshRecruitmentLimits === 'function') {
        refreshRecruitmentLimits();
    }
    if (typeof renderProvinceDashboard === 'function') renderProvinceDashboard();
    
    addGlobalLog(`✅ ХОД ЗАВЕРШЁН: ${(typeof getCurrentDateString === 'function') ? getCurrentDateString() : ''}`, 'general');
}

// ========== 5. АВТОСОХРАНЕНИЕ ==========
function startAutoSave() {
    if (typeof autoSaveInterval !== 'undefined' && autoSaveInterval) clearInterval(autoSaveInterval);
    window.autoSaveInterval = setInterval(() => {
        if (typeof saveAllData === 'function') {
            saveAllData();
        } else if (typeof GameState !== 'undefined') {
            GameState.save();
        }
        console.log("💾 Автосохранение выполнено");
    }, 60000);
}

function stopAutoSave() {
    if (typeof autoSaveInterval !== 'undefined' && autoSaveInterval) {
        clearInterval(autoSaveInterval);
        window.autoSaveInterval = null;
    }
}

// ========== 6. ИНИЦИАЛИЗАЦИЯ ВРЕМЕНИ ==========
function syncTimeWithGameState() {
    if (typeof GameState !== 'undefined') {
        const gameTime = GameState.getTime();
        if (typeof peopleState !== 'undefined') {
            peopleState.currentWeek = gameTime.week;
            peopleState.currentMonth = gameTime.month;
            peopleState.currentYear = gameTime.year;
        }
        updateGlobalDateDisplay();
    }
}

// ========== 7. СОХРАНЕНИЕ ВСЕХ ДАННЫХ ==========
function saveAllData() {
    // 1. Сохраняем данные провинций
    if (typeof provincesData !== 'undefined') {
        const provinceData = {
            provincesData: provincesData,
            currentProvince: currentProvince,
            globalTradeAgreements: (typeof globalTradeAgreements !== 'undefined') ? globalTradeAgreements : [],
            peopleState: (typeof peopleState !== 'undefined') ? peopleState : {}
        };
        localStorage.setItem('unified_province_manager', JSON.stringify(provinceData));
    }
    
    // 2. Сохраняем данные Совета
    if (typeof factionCouncils !== 'undefined') {
        const councilData = {
            factionCouncils: factionCouncils,
            currentCouncilFaction: currentCouncilFaction
        };
        localStorage.setItem('councilData', JSON.stringify(councilData));
    }
    
    // 3. Сохраняем данные армий
    if (typeof saveArmyData === 'function') {
        saveArmyData();
    }
    
    // 4. Сохраняем маршруты
    if (typeof saveRoutes === 'function') {
        saveRoutes();
    }
    
    // 5. Сохраняем дипломатию
    if (typeof saveDiplomacyData === 'function') {
        saveDiplomacyData();
    }
    
    // 6. Сохраняем время
    if (typeof saveGameDate === 'function') {
        saveGameDate();
    }
    
    console.log("💾 Все данные сохранены");
}

// ========== 8. ОБНОВЛЕНИЕ ВСЕГО ИНТЕРФЕЙСА ==========
function updateAllUI() {
    if (typeof updateTreasuryDisplay === 'function') updateTreasuryDisplay();
    if (typeof renderCouncil === 'function') renderCouncil();
    if (typeof renderArmy === 'function') renderArmy();
    if (typeof refreshPeopleUI === 'function') refreshPeopleUI();
    if (typeof refreshBuildingsUI === 'function') refreshBuildingsUI();
    if (typeof updateGlobalDateDisplay === 'function') updateGlobalDateDisplay();
}

// Экспорт функций для доступа из других модулей
window.applyGlobalTurn = applyGlobalTurn;
window.saveAllData = saveAllData;
window.updateAllUI = updateAllUI;
window.startAutoSave = startAutoSave;
window.stopAutoSave = stopAutoSave;
window.syncTimeWithGameState = syncTimeWithGameState;
window.payArmyUpkeep = payArmyUpkeep;
window.updateVassalsLoyalty = updateVassalsLoyalty;

console.log("✅ 12_turn.js загружен — функции глобального хода");