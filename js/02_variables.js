// ============================================================================
// МОДУЛЬ 02: variables.js
// Глобальные переменные игры (данные, которые меняются в процессе)
// ВЕРСИЯ 2.0 – УЛУЧШЕНА ИНИЦИАЛИЗАЦИЯ, ДОБАВЛЕНЫ ПРОВЕРКИ
// ============================================================================

// ========== 1. ПЕРЕМЕННЫЕ ДЛЯ КАРТЫ ==========
let map = null;                    // объект карты Leaflet
let currentOverlay = null;         // текущий фоновый слой
let cityMarkers = [];              // маркеры городов на карте
let visibleOverlays = {};          // видимые слои (маршруты, зоны)

// Режимы рисования на карте
let currentMode = null;            // 'route', 'ruler', null
let currentRouteType = 'land';     // текущий тип маршрута (land, dirt, naval, wyvern, orlan)

// Временные данные для рисования маршрута
let tempPoints = [];               // временные точки маршрута
let tempSegments = [];             // типы сегментов
let tempLines = [];                // линии на карте
let tempMarkers = [];              // маркеры точек

// Зоны замедления (не используются активно, но переменные нужны)
let drawingZoneMode = false;       // режим рисования зоны
let drawingPoints = [];            // точки для рисования зоны
let drawingPolygon = null;         // временный полигон

// Активный маршрут (подсвеченный)
let activeRouteId = null;

// Маски для отображения на карте (риторика, владения, вассалы)
let rhetoricMasks = [];            // будет заполнено из констант или при инициализации
let holdingsMasks = [];
let vassalsMasks = [];
let currentActiveMasks = [];       // текущие активные маски на карте

// Текущая активная вкладка (rhetoric, holdings, vassals, diplomacy, routes)
let activeTab = "routes";

// Флаги отображения
let showCitiesFlag = true;          // показывать города
let currentFactionFilter = "all";   // фильтр городов по фракции

// ========== 2. ПЕРЕМЕННЫЕ ДЛЯ МАРШРУТОВ ==========
let savedRoutes = [];               // сохранённые маршруты (будет синхронизировано с GameState)

// ========== 3. ПЕРЕМЕННЫЕ ДЛЯ ЗОН ==========
let zones = [];                     // зоны замедления (будет синхронизировано с GameState)

// ========== 4. ПЕРЕМЕННЫЕ ДЛЯ СОВЕТА ==========
let factionCouncils = {};           // объект со всеми советами фракций
let currentCouncilFaction = "clan_daketa";   // текущая выбранная фракция в Совете

// ========== 5. ПЕРЕМЕННЫЕ ДЛЯ АРМИИ ==========
let armies = [];                   // список армий
let armyTreasury = 10000;          // казна для армии (будет синхронизировано с GameState)
let currentFaction = "clan_daketa";   // текущая выбранная фракция
let currentArmySubfactionId = "clan_daketa";  // текущая подфракция (провинция)
let lastSelectedArmyId = null;     // последняя выбранная армия для найма

// Фильтры для каталога юнитов
let currentTypeFilter = "all";
let currentTimeFilter = "all";
let currentRaceFilter = "all";
let currentSpecialFilter = false;

// ========== 6. ПЕРЕМЕННЫЕ ДЛЯ ПРОВИНЦИИ (НАСЕЛЕНИЕ + ПОСТРОЙКИ) ==========
let provincesData = {};            // данные по всем провинциям
let currentProvince = "clan_daketa";   // текущая выбранная провинция
let globalTradeAgreements = [];    // торговые договоры

// Состояние населения (будет синхронизировано с GameState)
let peopleState = {
    settings: { taxRate: 1, conscriptPercent: 25, womenInArmy: false, poorPercent: 10 },
    demography: { birthRate: 2, deathRate: 1 },
    mobilization: { bonusPercent: 0, used10: 0, used25: 0, used40: 0 },
    turnsSinceDemography: 0,
    eventLog: []
};

// ========== 7. ПЕРЕМЕННЫЕ ДЛЯ ГЛОБАЛЬНОГО ЛОГА ==========
let globalEventLog = [];           // глобальный лог событий

// ========== 8. ПЕРЕМЕННЫЕ ДЛЯ АВТОСОХРАНЕНИЯ ==========
let autoSaveInterval = null;       // интервал автосохранения

// ========== 9. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ РАБОТЫ С ПЕРЕМЕННЫМИ ==========

// Функция для сброса всех переменных в начальное состояние
function resetAllVariables() {
    // Сброс карты
    if (map) {
        map.remove();
        map = null;
    }
    currentOverlay = null;
    cityMarkers = [];
    visibleOverlays = {};
    
    // Сброс режимов рисования
    currentMode = null;
    currentRouteType = 'land';
    tempPoints = [];
    tempSegments = [];
    tempLines = [];
    tempMarkers = [];
    
    // Сброс зон
    drawingZoneMode = false;
    drawingPoints = [];
    drawingPolygon = null;
    activeRouteId = null;
    
    // Сброс флагов
    activeTab = "routes";
    showCitiesFlag = true;
    currentFactionFilter = "all";
    
    // Сброс маршрутов и зон
    savedRoutes = [];
    zones = [];
    
    // Сброс Совета
    factionCouncils = {};
    currentCouncilFaction = "clan_daketa";
    
    // Сброс Армии
    armies = [];
    armyTreasury = 10000;
    currentFaction = "clan_daketa";
    currentArmySubfactionId = "clan_daketa";
    lastSelectedArmyId = null;
    currentTypeFilter = "all";
    currentTimeFilter = "all";
    currentRaceFilter = "all";
    currentSpecialFilter = false;
    
    // Сброс Провинции
    provincesData = {};
    currentProvince = "clan_daketa";
    globalTradeAgreements = [];
    peopleState = {
        settings: { taxRate: 1, conscriptPercent: 25, womenInArmy: false, poorPercent: 10 },
        demography: { birthRate: 2, deathRate: 1 },
        mobilization: { bonusPercent: 0, used10: 0, used25: 0, used40: 0 },
        turnsSinceDemography: 0,
        eventLog: []
    };
    
    // Сброс лога
    globalEventLog = [];
    
    // Сброс автосохранения
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }
    
    console.log("🔄 Все переменные сброшены в начальное состояние");
}

// Функция для синхронизации локальных переменных с GameState
function syncVariablesWithGameState() {
    if (typeof GameState !== 'undefined') {
        // Синхронизация времени
        const gameTime = GameState.getTime();
        if (gameTime && typeof peopleState !== 'undefined') {
            peopleState.currentWeek = gameTime.week;
            peopleState.currentMonth = gameTime.month;
            peopleState.currentYear = gameTime.year;
        }
        
        // Синхронизация казны
        armyTreasury = GameState.getTreasury();
        
        // Синхронизация маршрутов
        savedRoutes = GameState.getRoutes();
        
        // Синхронизация зон
        zones = GameState.getZones();
        
        // Синхронизация данных Совета
        factionCouncils = GameState.getFactionCouncils();
        currentCouncilFaction = GameState.getCurrentCouncilFaction();
        
        // Синхронизация данных провинции
        provincesData = GameState.getProvincesData();
        currentProvince = GameState.getCurrentProvince();
        
        // Синхронизация состояния населения
        const savedPeopleState = GameState.getPeopleState();
        if (savedPeopleState) {
            peopleState = savedPeopleState;
        }
        
        // Синхронизация торговых договоров
        globalTradeAgreements = GameState.getTradeAgreements();
        
        console.log("🔄 Переменные синхронизированы с GameState");
    }
}

console.log("✅ 02_variables.js загружен — глобальные переменные объявлены");