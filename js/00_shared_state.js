// ============================================================================
// МОДУЛЬ 00: shared_state.js
// Единое хранилище данных для всей игры
// ВЕРСИЯ 2.0 — ДОБАВЛЕНЫ ПРОВЕРКИ И УЛУЧШЕНА СИНХРОНИЗАЦИЯ
// ============================================================================

const GameState = (function() {
    
    // ========== ПРИВАТНЫЕ ДАННЫЕ ==========
    let _data = {
        // Время
        time: {
            week: 1,
            month: 5,
            year: 1598
        },
        
        // Экономика
        treasury: 10000,
        
        // Ресурсы
        resources: {
            wood: 500,
            stone: 300,
            iron: 200,
            gold: 10,
            ers: 10000
        },
        
        // Армии (позиции на карте)
        armies: [],
        
        // Города (с карты)
        cities: [],
        
        // Маршруты
        routes: [],
        
        // Зоны замедления
        zones: [],
        
        // Данные Совета (из loyalty)
        factionCouncils: {},
        currentCouncilFaction: "clan_daketa",
        
        // Данные провинции (из governor)
        provincesData: {},
        currentProvince: "clan_daketa",
        
        // Настройки населения
        peopleState: {
            settings: { taxRate: 1, conscriptPercent: 25, womenInArmy: false, poorPercent: 10 },
            demography: { birthRate: 2, deathRate: 1 },
            mobilization: { bonusPercent: 0, used10: 0, used25: 0, used40: 0 },
            turnsSinceDemography: 0,
            eventLog: []
        },
        
        // Торговля
        tradeAgreements: []
    };
    
    // ========== СИСТЕМА ПОДПИСОК (ОПОВЕЩЕНИЯ) ==========
    let _subscribers = {};
    
    function subscribe(event, callback) {
        if (!_subscribers[event]) {
            _subscribers[event] = [];
        }
        _subscribers[event].push(callback);
    }
    
    function notify(event, data) {
        if (_subscribers[event]) {
            _subscribers[event].forEach(callback => {
                try {
                    callback(data);
                } catch(e) {
                    console.error(`Ошибка в подписке на ${event}:`, e);
                }
            });
        }
    }
    
    // ========== ПУБЛИЧНЫЕ МЕТОДЫ ==========
    return {
        
        // ----- Подписки -----
        subscribe: subscribe,
        
        // ----- Время -----
        getTime() {
            return { ..._data.time };
        },
        
        advanceTime() {
            _data.time.week++;
            if (_data.time.week > 4) {
                _data.time.week = 1;
                _data.time.month++;
                if (_data.time.month > 12) {
                    _data.time.month = 1;
                    _data.time.year++;
                }
            }
            notify('time', _data.time);
            return _data.time;
        },
        
        // ----- Казна -----
        getTreasury() {
            return _data.treasury;
        },
        
        setTreasury(amount) {
            _data.treasury = Math.max(0, amount);
            notify('treasury', _data.treasury);
            return _data.treasury;
        },
        
        addToTreasury(amount) {
            return this.setTreasury(_data.treasury + amount);
        },
        
        // ----- Ресурсы -----
        getResources() {
            return { ..._data.resources };
        },
        
        setResources(resources) {
            _data.resources = { ..._data.resources, ...resources };
            notify('resources', _data.resources);
            return _data.resources;
        },
        
        modifyResource(resource, delta) {
            if (_data.resources[resource] !== undefined) {
                _data.resources[resource] = Math.max(0, _data.resources[resource] + delta);
                notify('resources', _data.resources);
                return _data.resources[resource];
            }
            return null;
        },
        
        // ----- Армии -----
        getArmies() {
            return [..._data.armies];
        },
        
        addArmy(army) {
            army.id = army.id || this.generateId();
            _data.armies.push(army);
            notify('armies', _data.armies);
            return army.id;
        },
        
        updateArmy(armyId, updates) {
            const index = _data.armies.findIndex(a => a.id === armyId);
            if (index !== -1) {
                _data.armies[index] = { ..._data.armies[index], ...updates };
                notify('armies', _data.armies);
                return true;
            }
            return false;
        },
        
        removeArmy(armyId) {
            _data.armies = _data.armies.filter(a => a.id !== armyId);
            notify('armies', _data.armies);
        },
        
        // ----- Города -----
        getCities() {
            return [..._data.cities];
        },
        
        setCities(cities) {
            _data.cities = cities;
            notify('cities', _data.cities);
        },
        
        // ----- Маршруты -----
        getRoutes() {
            return [..._data.routes];
        },
        
        setRoutes(routes) {
            _data.routes = routes;
            notify('routes', _data.routes);
        },
        
        addRoute(route) {
            route.id = route.id || this.generateId();
            _data.routes.push(route);
            notify('routes', _data.routes);
            return route.id;
        },
        
        // ----- Зоны -----
        getZones() {
            return [..._data.zones];
        },
        
        setZones(zones) {
            _data.zones = zones;
            notify('zones', _data.zones);
        },
        
        // ----- Данные Совета -----
        getFactionCouncils() {
            return _data.factionCouncils;
        },
        
        setFactionCouncil(factionId, council) {
            _data.factionCouncils[factionId] = council;
            notify('council', { factionId, council });
        },
        
        getCurrentCouncilFaction() {
            return _data.currentCouncilFaction;
        },
        
        setCurrentCouncilFaction(factionId) {
            _data.currentCouncilFaction = factionId;
            notify('councilFaction', factionId);
        },
        
        // ----- Данные провинции -----
        getProvincesData() {
            return _data.provincesData;
        },
        
        setProvinceData(provinceId, data) {
            _data.provincesData[provinceId] = data;
            notify('province', { provinceId, data });
        },
        
        getCurrentProvince() {
            return _data.currentProvince;
        },
        
        setCurrentProvince(provinceId) {
            _data.currentProvince = provinceId;
            notify('currentProvince', provinceId);
        },
        
        // ----- Население -----
        getPeopleState() {
            return _data.peopleState;
        },
        
        updatePeopleState(updates) {
            _data.peopleState = { ..._data.peopleState, ...updates };
            notify('peopleState', _data.peopleState);
        },
        
        // ----- Торговля -----
        getTradeAgreements() {
            return [..._data.tradeAgreements];
        },
        
        addTradeAgreement(agreement) {
            agreement.id = agreement.id || this.generateId();
            _data.tradeAgreements.push(agreement);
            notify('tradeAgreements', _data.tradeAgreements);
            return agreement.id;
        },
        
        removeTradeAgreement(agreementId) {
            _data.tradeAgreements = _data.tradeAgreements.filter(a => a.id !== agreementId);
            notify('tradeAgreements', _data.tradeAgreements);
        },
        
        // ----- Сохранение / Загрузка -----
        save() {
            const saveData = {
                time: _data.time,
                treasury: _data.treasury,
                resources: _data.resources,
                armies: _data.armies,
                cities: _data.cities,
                routes: _data.routes,
                zones: _data.zones,
                factionCouncils: _data.factionCouncils,
                currentCouncilFaction: _data.currentCouncilFaction,
                provincesData: _data.provincesData,
                currentProvince: _data.currentProvince,
                peopleState: _data.peopleState,
                tradeAgreements: _data.tradeAgreements
            };
            localStorage.setItem('game_state', JSON.stringify(saveData));
            notify('saved', saveData);
        },
        
        load() {
            const saved = localStorage.getItem('game_state');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    // Глубокое слияние для избежания потери полей
                    _data = { ..._data, ...data };
                    notify('loaded', _data);
                    return true;
                } catch(e) {
                    console.error('Ошибка загрузки:', e);
                }
            }
            return false;
        },
        
        // ----- Вспомогательные -----
        generateId() {
            if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                return crypto.randomUUID();
            }
            return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        },
        
        // Получить копию всех данных (для отладки)
        getSnapshot() {
            return JSON.parse(JSON.stringify(_data));
        },
        
        // Ручная синхронизация (вызывается после импорта)
        sync() {
            notify('synced', _data);
        }
    };
})();

// Делаем доступным глобально
window.GameState = GameState;

console.log("✅ 00_shared_state.js загружен — единое хранилище данных (v2.0)");