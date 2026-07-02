// ============================================================================
// МОДУЛЬ 12: turn.js (версия 4.0 – единая казна, поддержка нескольких провинций)
// ============================================================================

// ========== 1. ОПРЕДЕЛЕНИЕ КЛЮЧА ХРАНИЛИЩА ==========
if (!window.storageKey) {
    window.storageKey = 'unified_province_manager'; // fallback
}

// ========== 2. ОБНОВЛЕНИЕ ОТОБРАЖЕНИЯ ВРЕМЕНИ ==========
function updateGlobalDateDisplay() {
    const dateStr = (typeof getCurrentDateString === 'function') ? getCurrentDateString() : "1 неделя мая, 1598 год";
    const elements = ['globalDateDisplay', 'dateDisplay', 'globalDate'];
    for (let id of elements) {
        const el = document.getElementById(id);
        if (el) el.innerText = dateStr;
    }
}

// ========== 3. РАСЧЁТ СОДЕРЖАНИЯ АРМИЙ (заглушка) ==========
function payArmyUpkeep() {
    const upkeep = (typeof calculateTotalUpkeep === 'function') ? calculateTotalUpkeep() : 0;
    if (upkeep <= 0) return true;

    const treasury = window.factionTreasury || 0;
    if (treasury >= upkeep) {
        window.factionTreasury = treasury - upkeep;
        addGlobalLog(`💰 Содержание армии: -${upkeep.toLocaleString()} эрсов.`, 'general');
        return true;
    } else {
        addGlobalLog(`⚠️ Не хватает денег на содержание армии! Требуется ${upkeep.toLocaleString()} эрсов, в казне ${treasury.toLocaleString()}.`, 'general');
        // Всё равно списываем остаток, чтобы казна не ушла в минус? Или не списываем? Пока оставим так: списываем сколько есть.
        window.factionTreasury = 0;
        return false;
    }
}

// ========== 4. ОБНОВЛЕНИЕ ЛОЯЛЬНОСТИ ВАССАЛОВ (заглушка) ==========
function updateVassalsLoyalty() {
    // Будет реализовано, когда появится Совет
}

// ========== 5. ГЛОБАЛЬНЫЙ ХОД ==========
function applyGlobalTurn() {
    // ----- ПРОВЕРКА: можно ли выполнять ход -----
    if (!canProceedTurn()) {
        addGlobalLog("❌ Ход заблокирован! Есть отряды, требующие пополнения.", 'general');
        const globalTurnBtn = document.getElementById('globalTurnBtn');
        if (globalTurnBtn) globalTurnBtn.disabled = true;
        return;
    }

    // ----- ПРОВЕРКА ДЕМОГРАФИИ -----
    if (typeof peopleState !== 'undefined' && peopleState.turnsSinceDemography >= 4) {
        addGlobalLog(`⚠️ Демография требует применения! Ход заблокирован. Примените демографию на вкладке "Провинция".`, 'general');
        if (typeof showDemographyRequiredModal === 'function') {
            showDemographyRequiredModal();
        }
        const globalTurnBtn = document.getElementById('globalTurnBtn');
        if (globalTurnBtn) globalTurnBtn.disabled = true;
        return;
    }

    addGlobalLog(`⏩ НАЧАЛО ХОДА: ${(typeof getCurrentDateString === 'function') ? getCurrentDateString() : ''}`, 'general');

    // 1. Сбор налогов со ВСЕХ провинций
    let totalTax = 0;
    const allProvinceIds = Object.keys(provincesData);
    for (let pid of allProvinceIds) {
        const prov = provincesData[pid];
        if (!prov || !prov.races) continue;

        let provPop = 0;
        for (let race of prov.races) {
            provPop += (typeof getRaceTotal === 'function') ? getRaceTotal(race) : (race.adultMale + race.adultFemale + race.children + race.elders);
        }

        const poor = Math.floor(provPop * ((peopleState.settings.poorPercent || 10) / 100));
        const taxpayers = Math.max(0, provPop - poor);
        const provTax = Math.floor(taxpayers * (peopleState.settings.taxRate || 1));

        prov.resources.ers = (prov.resources.ers || 0) + provTax;
        totalTax += provTax;
    }

    // Пересчитываем общую казну
    if (typeof recalcTotalTreasury === 'function') {
        recalcTotalTreasury();
    } else {
        let totalErs = 0;
        for (let pid in provincesData) {
            totalErs += provincesData[pid].resources?.ers || 0;
        }
        window.factionTreasury = totalErs;
    }

    if (typeof peopleState !== 'undefined') {
        peopleState.turnsSinceDemography = (peopleState.turnsSinceDemography || 0) + 1;
    }
    addGlobalLog(`💰 Собрано налогов: ${totalTax.toLocaleString()} эрсов.`, 'general');

    // 2. Восстановление раненых
    if (typeof recoverWoundedUnits === 'function') {
        recoverWoundedUnits();
        // Обновляем вкладку армии, если она сейчас открыта
        const armyTab = document.getElementById('tab-army');
        if (armyTab && armyTab.classList.contains('active')) {
            if (typeof renderArmy === 'function') renderArmy();
            if (typeof refreshRecruitmentLimits === 'function') refreshRecruitmentLimits();
        }
    }

    // 3. Обработка торговых договоров
    if (typeof processTradeAgreements === 'function') {
        processTradeAgreements();

        // Обновляем интерфейс торговли, если вкладка активна
        const tradeTab = document.getElementById('tab-trade');
        if (tradeTab && tradeTab.classList.contains('active')) {
            if (typeof renderAgreements === 'function') renderAgreements();
            if (typeof renderTradeableResources === 'function') renderTradeableResources();
            if (typeof renderTradeSummary === 'function') renderTradeSummary();
        }
    }

    // 4. Завершение найма армии
    if (typeof processRecruitment === 'function') {
        processRecruitment();
    }

    if (typeof saveArmyData === 'function') {
        saveArmyData();
    }

    // 5. Содержание армий
    if (typeof payArmyUpkeep === 'function') {
        payArmyUpkeep();
    }

    // 6. Строительство (уменьшение таймеров)
    if (typeof processConstruction === 'function') {
        processConstruction();
    }

    // 7. Исследования (обработка очков) – НОВАЯ СТРОКА
    if (typeof processResearch === 'function') {
        processResearch();
    }

    // 8. Сбор ресурсов с построек
    if (typeof collectResources === 'function') {
        collectResources();
    }

    // 9. Лояльность вассалов (раз в месяц)
    if (typeof peopleState !== 'undefined' && (peopleState.turnsSinceDemography === 0 || peopleState.turnsSinceDemography % 4 === 0)) {
        if (typeof updateVassalsLoyalty === 'function') {
            updateVassalsLoyalty();
        }
    }

    // 10. Продвижение времени
    if (typeof advanceWeek === 'function') {
        advanceWeek();
    } else if (typeof GameState !== 'undefined' && GameState.advanceTime) {
        GameState.advanceTime();
    }

    // 11. Обновление интерфейса
    if (typeof updateTreasuryDisplay === 'function') updateTreasuryDisplay();
    if (typeof refreshPeopleUI === 'function') refreshPeopleUI();
    if (typeof refreshBuildingsUI === 'function') refreshBuildingsUI();
    if (typeof renderProvinceDashboard === 'function') renderProvinceDashboard();
    if (typeof renderProvinceCells === 'function') renderProvinceCells();
    if (typeof updateGlobalDateDisplay === 'function') updateGlobalDateDisplay();
    if (typeof refreshRecruitmentLimits === 'function') refreshRecruitmentLimits();

    // 12. Сохранение всех данных
    saveAllData();

    // 13. Разблокируем кнопку хода
    const globalTurnBtn = document.getElementById('globalTurnBtn');
    if (globalTurnBtn) globalTurnBtn.disabled = false;

    addGlobalLog(`✅ ХОД ЗАВЕРШЁН: ${(typeof getCurrentDateString === 'function') ? getCurrentDateString() : ''}`, 'general');
}
function advanceWeek() {
    if (typeof peopleState !== 'undefined') {
        peopleState.currentWeek = (peopleState.currentWeek || 1) + 1;
        if (peopleState.currentWeek > 4) {
            peopleState.currentWeek = 1;
            peopleState.currentMonth = (peopleState.currentMonth || 5) + 1;
            if (peopleState.currentMonth > 12) {
                peopleState.currentMonth = 1;
                peopleState.currentYear = (peopleState.currentYear || 1598) + 1;
            }
        }
    } else {
        console.warn('peopleState не определён');
    }
}
// ========== 6. АВТОСОХРАНЕНИЕ ==========
function startAutoSave() {
    if (typeof autoSaveInterval !== 'undefined' && autoSaveInterval) clearInterval(autoSaveInterval);
    window.autoSaveInterval = setInterval(() => {
        saveAllData();
        console.log("💾 Автосохранение выполнено");
    }, 60000);
}

function stopAutoSave() {
    if (typeof autoSaveInterval !== 'undefined' && autoSaveInterval) {
        clearInterval(autoSaveInterval);
        window.autoSaveInterval = null;
    }
}

// ========== 7. ИНИЦИАЛИЗАЦИЯ ВРЕМЕНИ ==========
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

// ========== 8. СОХРАНЕНИЕ ВСЕХ ДАННЫХ ==========
function saveAllData() {
    const data = {
        provincesData: (typeof provincesData !== 'undefined') ? provincesData : {},
        currentProvince: (typeof currentProvince !== 'undefined') ? currentProvince : null,
        peopleState: {
            settings: (typeof peopleState !== 'undefined' && peopleState.settings) ? peopleState.settings : { taxRate: 1, conscriptPercent: 25, womenInArmy: false, poorPercent: 10 },
            demography: (typeof peopleState !== 'undefined' && peopleState.demography) ? peopleState.demography : { birthRate: 2, deathRate: 1 },
            mobilization: (typeof peopleState !== 'undefined' && peopleState.mobilization) ? peopleState.mobilization : { bonusPercent: 0, used10: 0, used25: 0, used40: 0 },
            turnsSinceDemography: (typeof peopleState !== 'undefined') ? peopleState.turnsSinceDemography : 0,
            eventLog: (typeof peopleState !== 'undefined' && peopleState.eventLog) ? peopleState.eventLog : [],
            activeConstructionCount: (typeof peopleState !== 'undefined') ? peopleState.activeConstructionCount : 0,
            maxConstructionSlots: (typeof peopleState !== 'undefined') ? peopleState.maxConstructionSlots : 2,
            // ↓ ДАТА ↓
            currentWeek: (typeof peopleState !== 'undefined') ? peopleState.currentWeek : 1,
            currentMonth: (typeof peopleState !== 'undefined') ? peopleState.currentMonth : 5,
            currentYear: (typeof peopleState !== 'undefined') ? peopleState.currentYear : 1598
        },
        globalTradeAgreements: (typeof globalTradeAgreements !== 'undefined') ? globalTradeAgreements : [],
        armies: (typeof window.armies !== 'undefined') ? window.armies : [],
        factionCouncils: (typeof factionCouncils !== 'undefined') ? factionCouncils : {},
        savedRoutes: (typeof savedRoutes !== 'undefined') ? savedRoutes : [],
        currentFaction: (typeof currentFaction !== 'undefined') ? currentFaction : null,
        currentCouncilFaction: (typeof currentCouncilFaction !== 'undefined') ? currentCouncilFaction : null,
        factionTreasury: (typeof window.factionTreasury !== 'undefined') ? window.factionTreasury : 0,
        // ↓ НОВОЕ ПОЛЕ ДЛЯ ИССЛЕДОВАНИЙ ↓
        researchData: (typeof researchData !== 'undefined') ? researchData : { researchers: { military: null, civil: null, unique: null }, techQueue: [], completedTechs: [] }
    };
    const key = window.storageKey || 'unified_province_manager';
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`💾 Данные сохранены в ${key} (дата: ${data.peopleState.currentWeek} нед. ${data.peopleState.currentMonth} мес. ${data.peopleState.currentYear})`);
}

// ========== 9. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function recoverWoundedUnits() {
    for (let army of window.armies) {
        if (army.factionId !== currentFaction) continue;
        let anyRecovered = false;
        for (let unit of army.units) {
            // Восстановление раненых
            if (unit.wounded && unit.wounded > 0) {
                const recovered = unit.wounded;
                unit.count += recovered;
                unit.wounded = 0;
                anyRecovered = true;
                addGlobalLog(`❤️ Отряд "${unit.name}" восстановил ${recovered} раненых.`, 'army');
            }
        }
        if (anyRecovered) saveArmyData();
    }
}

function canProceedTurn() {
    // Заглушка, всегда разрешаем ход
    return true;
}

// ========== 10. ЭКСПОРТ В ГЛОБАЛЬНУЮ ОБЛАСТЬ ==========
window.applyGlobalTurn = applyGlobalTurn;
window.saveAllData = saveAllData;
window.startAutoSave = startAutoSave;
window.stopAutoSave = stopAutoSave;
window.syncTimeWithGameState = syncTimeWithGameState;
window.payArmyUpkeep = payArmyUpkeep;
window.updateVassalsLoyalty = updateVassalsLoyalty;
window.updateGlobalDateDisplay = updateGlobalDateDisplay;

console.log("✅ turn.js загружен — версия 4.0 (сбор налогов по всем провинциям, единая казна)");