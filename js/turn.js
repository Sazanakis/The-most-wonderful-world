// ============================================================================
// МОДУЛЬ 12: turn.js (версия 4.1 – исправлен учёт торговли в казне)
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

// ========== 3. РАСЧЁТ СОДЕРЖАНИЯ АРМИЙ (используется только для отчёта, списание идёт вручную) ==========
function payArmyUpkeep() {
    // Больше не используется для списания, оставлена для совместимости
    return true;
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

    // Пересчитываем общую казну после налогов
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

    // 3. Обработка торговых договоров + ОБЯЗАТЕЛЬНЫЙ ПЕРЕСЧЁТ КАЗНЫ
    if (typeof processTradeAgreements === 'function') {
        processTradeAgreements();
        // *** ВОТ ЭТА СТРОКА РЕШАЕТ ПРОБЛЕМУ ***
        recalcTotalTreasury();

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

    // 5. Содержание армий (реальное списание)
    const armyUpkeep = (typeof calculateTotalUpkeep === 'function') ? calculateTotalUpkeep() : 0;
    if (armyUpkeep > 0) {
        window.factionTreasury -= armyUpkeep;
        addGlobalLog(`⚔️ Содержание армии: -${armyUpkeep.toLocaleString()} эрсов.`, 'general');
    }

    // 6. Зарплаты исследователей
    let researcherSalaries = 0;
    if (typeof researchData !== 'undefined' && researchData.researchers) {
        for (let slot in researchData.researchers) {
            const r = researchData.researchers[slot];
            if (r) researcherSalaries += r.salary || 0;
        }
    }
    if (researcherSalaries > 0) {
        window.factionTreasury -= researcherSalaries;
        addGlobalLog(`👨‍🔬 Зарплаты исследователей: -${researcherSalaries.toLocaleString()} эрсов.`, 'general');
    }

    // 7. Синхронизация провинций с актуальной (возможно отрицательной) казной
    const capitalId = Object.keys(provincesData).find(pid => provincesData[pid].isCapital) || Object.keys(provincesData)[0];
    // Обнуляем эрсы во всех провинциях
    for (let pid in provincesData) {
        provincesData[pid].resources.ers = 0;
    }
    // Записываем итоговый остаток (может быть отрицательным) в столицу
    if (capitalId && provincesData[capitalId]) {
        provincesData[capitalId].resources.ers = window.factionTreasury || 0;
    }

    // 8. Строительство (уменьшение таймеров)
    if (typeof processConstruction === 'function') {
        processConstruction();
    }

    // 9. Исследования (обработка очков)
    if (typeof processResearch === 'function') {
        processResearch();
    }

    // 10. Сбор ресурсов с построек
    if (typeof collectResources === 'function') {
        collectResources();
    }

    // 11. Лояльность вассалов (раз в месяц)
    if (typeof peopleState !== 'undefined' && (peopleState.turnsSinceDemography === 0 || peopleState.turnsSinceDemography % 4 === 0)) {
        if (typeof updateVassalsLoyalty === 'function') {
            updateVassalsLoyalty();
        }
    }

    // 12. Продвижение времени
    if (typeof advanceWeek === 'function') {
        advanceWeek();
    } else if (typeof GameState !== 'undefined' && GameState.advanceTime) {
        GameState.advanceTime();
    }

    // 13. Обновление интерфейса
    if (typeof updateTreasuryDisplay === 'function') updateTreasuryDisplay();
    if (typeof refreshPeopleUI === 'function') refreshPeopleUI();
    if (typeof refreshBuildingsUI === 'function') refreshBuildingsUI();
    if (typeof renderProvinceDashboard === 'function') renderProvinceDashboard();
    if (typeof renderProvinceCells === 'function') renderProvinceCells();
    if (typeof updateGlobalDateDisplay === 'function') updateGlobalDateDisplay();
    if (typeof refreshRecruitmentLimits === 'function') refreshRecruitmentLimits();

    // 14. Сохранение всех данных
    saveAllData();

    // 15. Банкротство → дезертирство
    if (window.factionTreasury < 0) {
        if (typeof applyBankruptcyDesertion === 'function') {
            applyBankruptcyDesertion();   // сначала теряем 10% отрядов
        }
        if (typeof showBankruptcyModal === 'function') showBankruptcyModal();
        addGlobalLog(`⚠️ Казна ушла в минус! Вы – банкрот!`, 'general');
    }

    // 16. Разблокируем кнопку хода
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
        for (let unit of army.units) {
            if (unit.wounded && unit.wounded > 0) {
                const recovered = unit.wounded;
                unit.count += recovered;
                unit.wounded = 0;
                addGlobalLog(`❤️ Отряд "${unit.name}" восстановил ${recovered} раненых.`, 'army');
            }
        }
    }
}

function canProceedTurn() {
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

console.log("✅ turn.js загружен — версия 4.1 (исправлен учёт торговли в казне)");