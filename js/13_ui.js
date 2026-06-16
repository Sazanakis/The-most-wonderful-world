// ============================================================================
// МОДУЛЬ 13: ui.js
// Функции интерфейса (вкладки, обработчики событий, модальные окна)
// ВЕРСИЯ 3.0 – ПРОВЕРКИ СУЩЕСТВОВАНИЯ ЭЛЕМЕНТОВ, ОБНОВЛЕНИЕ КАРТЫ ПРИ ПЕРЕКЛЮЧЕНИИ
// ============================================================================

// ========== 1. НАСТРОЙКА ВКЛАДОК ==========
function setupTabs() {
    const tabs = document.querySelectorAll('.tab-button');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            const target = document.getElementById(`tab-${tabId}`);
            if (target) target.classList.add('active');
            
            // Обновляем содержимое при переключении
            if (tabId === 'council' && typeof renderCouncil === 'function') {
                renderCouncil();
            } else if (tabId === 'army' && typeof renderArmy === 'function') {
                renderArmy();
                if (typeof renderAvailableUnits === 'function') renderAvailableUnits();
            } else if (tabId === 'province') {
                if (typeof refreshPeopleUI === 'function') refreshPeopleUI();
                if (typeof refreshBuildingsUI === 'function') refreshBuildingsUI();
                if (typeof renderProvinceDashboard === 'function') renderProvinceDashboard();
            } else if (tabId === 'map') {
                // Принудительно обновляем карту
                if (typeof refreshMap === 'function') {
                    refreshMap();
                } else if (map && typeof map.invalidateSize === 'function') {
                    setTimeout(() => map.invalidateSize(), 100);
                }
                if (typeof redrawRoutes === 'function') redrawRoutes();
            }
        });
    });
}

// ========== 2. НАСТРОЙКА СВОРАЧИВАЕМЫХ ПАНЕЛЕЙ ==========
function setupCollapsibles() {
    // Левая панель
    const leftHeader = document.getElementById('leftHeader');
    const leftContent = document.getElementById('leftContent');
    if (leftHeader && leftContent) {
        let collapsed = false;
        leftHeader.addEventListener('click', () => {
            collapsed = !collapsed;
            leftContent.style.display = collapsed ? 'none' : 'flex';
            const arrow = leftHeader.querySelector('span:last-child');
            if (arrow) arrow.innerHTML = collapsed ? '▶' : '▼';
        });
    }
    
    // Панель городов
    const citiesHeader = document.getElementById('citiesHeader');
    const citiesContent = document.getElementById('citiesContent');
    if (citiesHeader && citiesContent) {
        let collapsed = false;
        citiesHeader.addEventListener('click', () => {
            collapsed = !collapsed;
            citiesContent.style.display = collapsed ? 'none' : 'flex';
            const arrow = citiesHeader.querySelector('span:last-child');
            if (arrow) arrow.innerHTML = collapsed ? '▶' : '▼';
        });
    }
    
    // Панель маршрутов
    const routesHeader = document.getElementById('routesHeader');
    const routesContent = document.getElementById('routesContent');
    if (routesHeader && routesContent) {
        let collapsed = false;
        routesHeader.addEventListener('click', () => {
            collapsed = !collapsed;
            routesContent.style.display = collapsed ? 'none' : 'flex';
            const arrow = routesHeader.querySelector('span:last-child');
            if (arrow) arrow.innerHTML = collapsed ? '▶' : '▼';
        });
    }
}

// ========== 3. НАСТРОЙКА РЕЖИМОВ КАРТЫ ==========
function setupMapModes() {
    const rhetoricBtn = document.getElementById('modeRhetoricBtn');
    const holdingsBtn = document.getElementById('modeHoldingsBtn');
    const vassalsBtn = document.getElementById('modeVassalsBtn');
    const routesBtn = document.getElementById('modeRoutesBtn');
    
    const rhetoricPanel = document.getElementById('rhetoricPanel');
    const holdingsPanel = document.getElementById('holdingsPanel');
    const vassalsPanel = document.getElementById('vassalsPanel');
    const routesPanel = document.getElementById('routesPanel');
    
    function setActive(activeBtn) {
        [rhetoricBtn, holdingsBtn, vassalsBtn, routesBtn].forEach(btn => {
            if (btn) btn.classList.remove('active');
        });
        if (activeBtn) activeBtn.classList.add('active');
    }
    
    if (holdingsBtn) {
        holdingsBtn.addEventListener('click', () => {
            setActive(holdingsBtn);
            activeTab = 'holdings';
            if (routesPanel) routesPanel.style.display = 'none';
            if (rhetoricPanel) rhetoricPanel.style.display = 'none';
            if (vassalsPanel) vassalsPanel.style.display = 'none';
            if (holdingsPanel) holdingsPanel.style.display = 'flex';
            if (typeof buildHoldingsChecklist === 'function') buildHoldingsChecklist();
            if (typeof showHoldingsMask === 'function') showHoldingsMask('all');
            if (typeof clearTemp === 'function') clearTemp();
        });
    }
    
    if (vassalsBtn) {
        vassalsBtn.addEventListener('click', () => {
            setActive(vassalsBtn);
            activeTab = 'vassals';
            if (routesPanel) routesPanel.style.display = 'none';
            if (rhetoricPanel) rhetoricPanel.style.display = 'none';
            if (holdingsPanel) holdingsPanel.style.display = 'none';
            if (vassalsPanel) vassalsPanel.style.display = 'flex';
            if (typeof updateVassalChecklist === 'function') updateVassalChecklist();
            const selectedFaction = document.getElementById('vassalFactionSelect')?.value || 'clan_daketa';
            if (typeof showVassalsMask === 'function') showVassalsMask(selectedFaction, true, true);
            if (typeof clearTemp === 'function') clearTemp();
        });
    }
    
    if (rhetoricBtn) {
        rhetoricBtn.addEventListener('click', () => {
            setActive(rhetoricBtn);
            activeTab = 'rhetoric';
            if (routesPanel) routesPanel.style.display = 'none';
            if (holdingsPanel) holdingsPanel.style.display = 'none';
            if (vassalsPanel) vassalsPanel.style.display = 'none';
            if (rhetoricPanel) rhetoricPanel.style.display = 'flex';
            if (typeof buildRhetoricChecklist === 'function') buildRhetoricChecklist();
            if (typeof showRhetoricMasks === 'function') showRhetoricMasks('all');
            if (typeof clearTemp === 'function') clearTemp();
        });
    }
    
    if (routesBtn) {
        routesBtn.addEventListener('click', () => {
            setActive(routesBtn);
            activeTab = 'routes';
            if (rhetoricPanel) rhetoricPanel.style.display = 'none';
            if (holdingsPanel) holdingsPanel.style.display = 'none';
            if (vassalsPanel) vassalsPanel.style.display = 'none';
            if (routesPanel) routesPanel.style.display = 'flex';
            if (typeof clearMasks === 'function') clearMasks();
            if (typeof redrawRoutes === 'function') redrawRoutes();
            if (typeof clearTemp === 'function') clearTemp();
        });
    }
}

// ========== 4. НАСТРОЙКА ОБРАБОТЧИКОВ ==========
function bindGlobalEvents() {
    // Глобальная кнопка хода
    const globalTurnBtn = document.getElementById('globalTurnBtn');
    if (globalTurnBtn) {
        globalTurnBtn.addEventListener('click', () => {
            if (typeof applyGlobalTurn === 'function') applyGlobalTurn();
        });
    }
    
    // Обновление армий вассалов
    const updateVassalsArmiesBtn = document.getElementById('updateVassalsArmiesBtn');
    if (updateVassalsArmiesBtn) {
        updateVassalsArmiesBtn.addEventListener('click', () => {
            if (typeof updateAllVassalsArmies === 'function') {
                updateAllVassalsArmies();
                addGlobalLog("⚔️ Личные армии вассалов обновлены вручную", 'council');
                alert("✅ Личные армии вассалов обновлены!");
            } else {
                console.warn("updateAllVassalsArmies не определена");
                alert("❌ Функция обновления не найдена. Проверьте модуль 06_council.js");
            }
        });
    }
    
    // Экспорт/импорт всех данных
    const exportBtn = document.getElementById('globalExportBtn');
    const importBtn = document.getElementById('globalImportBtn');
    const importFile = document.getElementById('globalImportFile');
    const resetAllBtn = document.getElementById('globalResetBtn');
    if (exportBtn) exportBtn.addEventListener('click', () => { if (typeof exportAllData === 'function') exportAllData(); });
    if (importBtn) importBtn.addEventListener('click', () => importFile?.click());
    if (importFile) importFile.addEventListener('change', (e) => {
        if (e.target.files.length && typeof importAllData === 'function') {
            importAllData(e.target.files[0]);
        }
        e.target.value = '';
    });
    if (resetAllBtn) resetAllBtn.addEventListener('click', () => { if (typeof globalResetAll === 'function') globalResetAll(); });
    
    // Кнопки Совета
    const refreshCouncilBtn = document.getElementById('refreshCouncilBtn');
    if (refreshCouncilBtn) refreshCouncilBtn.addEventListener('click', () => { if (typeof renderCouncil === 'function') renderCouncil(); });
    const exportCouncilBtn = document.getElementById('exportCouncilBtn');
    const importCouncilBtn = document.getElementById('importCouncilBtn');
    const councilImportFile = document.getElementById('councilImportFile');
    if (exportCouncilBtn) exportCouncilBtn.addEventListener('click', () => { if (typeof exportCouncilData === 'function') exportCouncilData(); });
    if (importCouncilBtn) importCouncilBtn.addEventListener('click', () => councilImportFile?.click());
    if (councilImportFile) councilImportFile.addEventListener('change', (e) => {
        if (e.target.files.length && typeof importCouncilData === 'function') importCouncilData(e.target.files[0]);
        e.target.value = '';
    });
    const resetCouncilBtn = document.getElementById('resetCouncilBtn');
    if (resetCouncilBtn) resetCouncilBtn.addEventListener('click', () => { if (typeof resetCouncil === 'function') resetCouncil(); });
    
    // Переключение фракции
    const factionSelect = document.getElementById('globalFactionSelect');
    if (factionSelect) {
        factionSelect.addEventListener('change', (e) => {
            if (typeof switchFaction === 'function') switchFaction(e.target.value);
        });
    }
    
    // Кнопки Армии
    const newArmyBtn = document.getElementById('newArmyBtn');
    if (newArmyBtn) newArmyBtn.onclick = () => {
        if (typeof createNewArmy === 'function') createNewArmy();
        else alert("Функция createNewArmy не определена");
    };
    const clearAllArmiesBtn = document.getElementById('clearAllArmiesBtn');
    if (clearAllArmiesBtn) clearAllArmiesBtn.onclick = () => { if (typeof clearAllArmies === 'function') clearAllArmies(); };
    const resetArmyBtn = document.getElementById('resetArmyBtn');
    if (resetArmyBtn) resetArmyBtn.onclick = () => { if (typeof resetArmy === 'function') resetArmy(); };
    const loadExampleBtn = document.getElementById('loadExampleBtn');
    if (loadExampleBtn) loadExampleBtn.onclick = () => { if (typeof loadExampleArmy === 'function') loadExampleArmy(); };
    const exportArmiesBtn = document.getElementById('exportArmiesBtn');
    if (exportArmiesBtn) exportArmiesBtn.onclick = () => { if (typeof exportArmyData === 'function') exportArmyData(); };
    const importArmiesBtn = document.getElementById('importArmiesBtn');
    const armyImportFile = document.getElementById('armyImportFile');
    if (importArmiesBtn) importArmiesBtn.onclick = () => armyImportFile?.click();
    if (armyImportFile) armyImportFile.onchange = (e) => {
        if (e.target.files.length && typeof importArmyData === 'function') {
            importArmyData(e.target.files[0]);
            setTimeout(() => {
                if (typeof renderArmy === 'function') renderArmy();
                if (typeof renderAvailableUnits === 'function') renderAvailableUnits();
            }, 100);
        }
        e.target.value = '';
    };
    
    // Фильтры юнитов
    const filterType = document.getElementById('filterType');
    const filterTime = document.getElementById('filterTime');
    const filterRace = document.getElementById('filterRace');
    const filterSpecial = document.getElementById('filterSpecial');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    if (filterType) filterType.addEventListener('change', () => { if (typeof updateFilters === 'function') updateFilters(); if (typeof renderAvailableUnits === 'function') renderAvailableUnits(); });
    if (filterTime) filterTime.addEventListener('change', () => { if (typeof updateFilters === 'function') updateFilters(); if (typeof renderAvailableUnits === 'function') renderAvailableUnits(); });
    if (filterRace) filterRace.addEventListener('change', () => { if (typeof updateFilters === 'function') updateFilters(); if (typeof renderAvailableUnits === 'function') renderAvailableUnits(); });
    if (filterSpecial) filterSpecial.addEventListener('change', () => { if (typeof updateFilters === 'function') updateFilters(); if (typeof renderAvailableUnits === 'function') renderAvailableUnits(); });
    if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', () => { if (typeof resetFilters === 'function') resetFilters(); if (typeof renderAvailableUnits === 'function') renderAvailableUnits(); });
    
    // Население и налоги
    const taxRate = document.getElementById('taxRate');
    const conscriptPercent = document.getElementById('conscriptPercent');
    const womenInArmyCheckbox = document.getElementById('womenInArmyCheckbox');
    const birthRate = document.getElementById('birthRate');
    const deathRate = document.getElementById('deathRate');
    const addRaceBtn = document.getElementById('addRaceBtn');
    const applyTurnBtn = document.getElementById('applyTurnBtn');
    const applyDemographyBtn = document.getElementById('applyDemographyBtn');
    const exchangeGoldBtn = document.getElementById('exchangeGoldBtn');
    const resetProvinceBtn = document.getElementById('resetProvinceBtn');
    const addSettlementBtn = document.getElementById('addSettlementBtn');
    const removeSettlementBtn = document.getElementById('removeSettlementBtn');
    const addAgreementBtn = document.getElementById('addAgreementBtn');
    
    if (taxRate) taxRate.addEventListener('input', (e) => { if (typeof peopleState !== 'undefined') peopleState.settings.taxRate = parseFloat(e.target.value) || 0; if (typeof refreshPeopleUI === 'function') refreshPeopleUI(); });
    if (conscriptPercent) conscriptPercent.addEventListener('input', (e) => { if (typeof peopleState !== 'undefined') peopleState.settings.conscriptPercent = parseFloat(e.target.value) || 0; if (typeof refreshPeopleUI === 'function') refreshPeopleUI(); });
    if (womenInArmyCheckbox) womenInArmyCheckbox.addEventListener('change', (e) => { if (typeof peopleState !== 'undefined') peopleState.settings.womenInArmy = e.target.checked; if (typeof refreshPeopleUI === 'function') refreshPeopleUI(); });
    if (birthRate) birthRate.addEventListener('input', (e) => { if (typeof peopleState !== 'undefined') peopleState.demography.birthRate = parseFloat(e.target.value) || 0; });
    if (deathRate) deathRate.addEventListener('input', (e) => { if (typeof peopleState !== 'undefined') peopleState.demography.deathRate = parseFloat(e.target.value) || 0; });
    if (addRaceBtn) addRaceBtn.addEventListener('click', () => { if (typeof addRace === 'function') addRace(); });
    if (applyTurnBtn) applyTurnBtn.addEventListener('click', () => { if (typeof applyPeopleTurn === 'function') applyPeopleTurn(); });
    if (applyDemographyBtn) applyDemographyBtn.addEventListener('click', () => { if (typeof applyDemography === 'function') applyDemography(); });
    if (exchangeGoldBtn) exchangeGoldBtn.addEventListener('click', () => { if (typeof exchangeGold === 'function') exchangeGold(); });
    if (resetProvinceBtn) resetProvinceBtn.addEventListener('click', () => { if (typeof resetProvinceResources === 'function') resetProvinceResources(); });
    if (addSettlementBtn) addSettlementBtn.addEventListener('click', () => { if (typeof addSettlement === 'function') addSettlement(); });
    if (removeSettlementBtn) removeSettlementBtn.addEventListener('click', () => { if (typeof removeLastSettlement === 'function') removeLastSettlement(); });
    if (addAgreementBtn) addAgreementBtn.addEventListener('click', () => { if (typeof addTradeAgreement === 'function') addTradeAgreement(); });
    
    // Карта: маршруты и зоны
    const routeModeBtn = document.getElementById('routeModeBtn');
    const rulerModeBtn = document.getElementById('rulerModeBtn');
    const undoPointBtn = document.getElementById('undoPointBtn');
    const clearRouteBtn = document.getElementById('clearRouteBtn');
    const saveRouteBtn = document.getElementById('saveRouteBtn');
    const routeTypeSelect = document.getElementById('routeTypeSelect');
    const exportAllBtn = document.getElementById('exportAllBtn');
    const exportSelectedBtn = document.getElementById('exportSelectedBtn');
    const selectAllBtn = document.getElementById('selectAllBtn');
    const deselectAllBtn = document.getElementById('deselectAllBtn');
    const importFileRoutes = document.getElementById('importFile');
    const showCities = document.getElementById('showCities');
    const factionFilter = document.getElementById('factionFilter');
    
    if (routeModeBtn) routeModeBtn.addEventListener('click', () => { if (typeof setMode === 'function') setMode('route'); });
    if (rulerModeBtn) rulerModeBtn.addEventListener('click', () => { if (typeof setMode === 'function') setMode('ruler'); });
    if (undoPointBtn) undoPointBtn.addEventListener('click', () => { if (typeof undoLastPoint === 'function') undoLastPoint(); });
    if (clearRouteBtn) clearRouteBtn.addEventListener('click', () => { if (typeof clearTemp === 'function') clearTemp(); });
    if (saveRouteBtn) saveRouteBtn.addEventListener('click', () => { if (typeof saveCurrentRoute === 'function') saveCurrentRoute(); });
    if (routeTypeSelect) routeTypeSelect.addEventListener('change', (e) => { currentRouteType = e.target.value; if (activeTab === 'ruler' && typeof updateRouteInfo === 'function') updateRouteInfo(); });
    if (exportAllBtn) exportAllBtn.addEventListener('click', () => { if (typeof exportAllRoutes === 'function') exportAllRoutes(); });
    if (exportSelectedBtn) exportSelectedBtn.addEventListener('click', () => { if (typeof exportSelectedRoutes === 'function') exportSelectedRoutes(); });
    if (selectAllBtn) selectAllBtn.addEventListener('click', () => { if (typeof selectAllVisible === 'function') selectAllVisible(); });
    if (deselectAllBtn) deselectAllBtn.addEventListener('click', () => { if (typeof deselectAllVisible === 'function') deselectAllVisible(); });
    if (importFileRoutes) importFileRoutes.addEventListener('change', (e) => {
        if (e.target.files.length && typeof importRoutes === 'function') importRoutes(e.target.files[0]);
        e.target.value = '';
    });
    if (showCities) showCities.addEventListener('change', (e) => { showCitiesFlag = e.target.checked; if (typeof updateCitiesVisibility === 'function') updateCitiesVisibility(); });
    if (factionFilter) factionFilter.addEventListener('change', (e) => { currentFactionFilter = e.target.value; if (typeof addCityMarkers === 'function') addCityMarkers(); });
    
    // Полноэкранный режим карты
    const fullscreenBtn = document.getElementById('fullscreenMapBtn');
    const mapContainer = document.querySelector('.map-container');
    if (fullscreenBtn && mapContainer) {
        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                mapContainer.requestFullscreen().catch(err => console.error(err));
                fullscreenBtn.textContent = '🗗 Восстановить';
                fullscreenBtn.style.background = '#b8860b';
            } else {
                document.exitFullscreen();
                fullscreenBtn.textContent = '⛶ Во весь экран';
                fullscreenBtn.style.background = '#3a5a2a';
            }
        });
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                fullscreenBtn.textContent = '⛶ Во весь экран';
                fullscreenBtn.style.background = '#3a5a2a';
            } else {
                fullscreenBtn.textContent = '🗗 Восстановить';
                fullscreenBtn.style.background = '#b8860b';
                setTimeout(() => { if (map && typeof map.invalidateSize === 'function') map.invalidateSize(); }, 100);
            }
        });
    }
    
    // Предустановки типов дорог
    const routePresets = document.querySelectorAll('.route-preset');
    if (routePresets.length) {
        routePresets.forEach(btn => {
            btn.addEventListener('click', () => {
                const newType = btn.getAttribute('data-type');
                currentRouteType = newType;
                routePresets.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const routeTypeSelect = document.getElementById('routeTypeSelect');
                if (routeTypeSelect) routeTypeSelect.value = newType;
                addGlobalLog(`🎯 Тип дороги по умолчанию: ${newType}`, 'map');
            });
        });
        const defaultBtn = document.querySelector('.route-preset[data-type="land"]');
        if (defaultBtn) defaultBtn.classList.add('active');
    }
    
    // Модальное окно вассала
    const closeVassalModalBtn = document.getElementById('closeVassalModalBtn');
    if (closeVassalModalBtn) closeVassalModalBtn.addEventListener('click', () => { const modal = document.getElementById('vassalModal'); if (modal) modal.style.display = 'none'; });
    window.addEventListener('click', (e) => { const modal = document.getElementById('vassalModal'); if (e.target === modal && modal) modal.style.display = 'none'; });
	// ===== Ручное управление казной =====
	const applyTreasuryChangeBtn = document.getElementById('applyTreasuryChangeBtn');
	if (applyTreasuryChangeBtn) {
		applyTreasuryChangeBtn.addEventListener('click', () => {
			if (typeof applyTreasuryChange === 'function') applyTreasuryChange();
		});
	}
	const resetTreasuryBtn = document.getElementById('resetTreasuryBtn');
	if (resetTreasuryBtn) {
		resetTreasuryBtn.addEventListener('click', () => {
			if (typeof resetTreasury === 'function') resetTreasury();
		});
	}

	// ===== Ручная установка даты =====
	const setDateBtn = document.getElementById('setDateBtn');
	if (setDateBtn) {
		setDateBtn.addEventListener('click', () => {
			const week = parseInt(document.getElementById('manualWeek').value);
			const month = parseInt(document.getElementById('manualMonth').value);
			const year = parseInt(document.getElementById('manualYear').value);
			if (isNaN(week) || isNaN(month) || isNaN(year)) {
				addGlobalLog('❌ Некорректная дата.', 'general');
				return;
			}
			if (typeof GameState !== 'undefined') {
				GameState.time = { week, month, year };
				GameState.save();
			}
			if (typeof peopleState !== 'undefined') {
				peopleState.currentWeek = week;
				peopleState.currentMonth = month;
				peopleState.currentYear = year;
			}
			updateGlobalDateDisplay();
			addGlobalLog(`📅 Дата вручную установлена: ${week} неделя ${MONTH_NAMES[month-1]}, ${year}`, 'general');
			saveAllData();
		});
	}

	// ===== Ручное управление ресурсами =====
	const setResourcesBtn = document.getElementById('setResourcesBtn');
	if (setResourcesBtn) {
		setResourcesBtn.addEventListener('click', () => {
			if (typeof setManualResources === 'function') setManualResources();
		});
	}
}

// ========== 5. ЭКСПОРТ/ИМПОРТ ВСЕХ ДАННЫХ ==========
function exportAllData() {
    const allData = {
        version: "2.0",
        exportDate: new Date().toISOString(),
        gameTime: (typeof GameState !== 'undefined') ? GameState.getTime() : { week: 1, month: 5, year: 1598 },
        treasury: (typeof GameState !== 'undefined') ? GameState.getTreasury() : 10000,
        resources: (typeof GameState !== 'undefined') ? GameState.getResources() : { wood: 500, stone: 300, iron: 200, gold: 10, ers: 10000 },
        factionCouncils: (typeof factionCouncils !== 'undefined') ? factionCouncils : {},
        currentCouncilFaction: (typeof currentCouncilFaction !== 'undefined') ? currentCouncilFaction : "clan_daketa",
        armies: (typeof armies !== 'undefined') ? armies : [],
        provincesData: (typeof provincesData !== 'undefined') ? provincesData : {},
        currentProvince: (typeof currentProvince !== 'undefined') ? currentProvince : "clan_daketa",
        peopleState: (typeof peopleState !== 'undefined') ? peopleState : {},
        globalTradeAgreements: (typeof globalTradeAgreements !== 'undefined') ? globalTradeAgreements : [],
        savedRoutes: (typeof savedRoutes !== 'undefined') ? savedRoutes : [],
        zones: (typeof zones !== 'undefined') ? zones.map(z => ({ id: z.id, type: z.type, name: z.name, latlngs: z.latlngs.map(p => ({ lat: p.lat, lng: p.lng })) })) : []
    };
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `full_game_save_${new Date().toISOString().slice(0, 19)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
}

function importAllData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            // Время, казна, ресурсы – перезаписываем
            if (data.gameTime && typeof GameState !== 'undefined') GameState.time = data.gameTime;
            if (data.treasury !== undefined && typeof GameState !== 'undefined') GameState.setTreasury(data.treasury);
            if (data.resources && typeof GameState !== 'undefined') GameState.setResources(data.resources);

            // Слияние советов: добавляем недостающие фракции, но не удаляем существующие
            if (data.factionCouncils && typeof factionCouncils !== 'undefined') {
                for (let fid in data.factionCouncils) {
                    if (!factionCouncils[fid]) {
                        const councilData = data.factionCouncils[fid];
                        const council = new FactionCouncil(councilData.factionId, councilData.rulerName);
                        Object.assign(council, councilData);
                        council.houses = councilData.houses.map(hData => {
                            const house = new InfluentialHouse(hData.id, hData.name, hData.vassalType, hData.politicalFaction, hData.leaderName, hData.loyaltyToRuler);
                            Object.assign(house, hData);
                            return house;
                        });
                        factionCouncils[fid] = council;
                    } else {
                        const existingCouncil = factionCouncils[fid];
                        const importedCouncil = data.factionCouncils[fid];
                        for (let h of importedCouncil.houses) {
                            if (!existingCouncil.findHouse(h.id)) {
                                const house = new InfluentialHouse(h.id, h.name, h.vassalType, h.politicalFaction, h.leaderName, h.loyaltyToRuler);
                                Object.assign(house, h);
                                existingCouncil.houses.push(house);
                            }
                        }
                        existingCouncil.rulerName = importedCouncil.rulerName;
                    }
                }
            }
            if (data.currentCouncilFaction) currentCouncilFaction = data.currentCouncilFaction;

            // Слияние армий – добавляем новые, не удаляя существующие
            if (data.armies) {
                for (let a of data.armies) {
                    if (!armies.some(existing => existing.id === a.id)) {
                        armies.push(a);
                    }
                }
            }

            // Слияние данных провинций – добавляем недостающие провинции, существующие не трогаем
            if (data.provincesData) {
                for (let pid in data.provincesData) {
                    if (!provincesData[pid]) {
                        provincesData[pid] = data.provincesData[pid];
                    }
                }
            }
            if (data.currentProvince) currentProvince = data.currentProvince;
            if (data.peopleState) peopleState = data.peopleState;

            // Торговые договоры – добавляем новые, избегая дубликатов
            if (data.globalTradeAgreements) {
                for (let a of data.globalTradeAgreements) {
                    if (!globalTradeAgreements.some(ex => ex.id === a.id)) {
                        globalTradeAgreements.push(a);
                    }
                }
            }

            // Маршруты – добавляем новые
            if (data.savedRoutes) {
                for (let r of data.savedRoutes) {
                    if (!savedRoutes.some(ex => ex.id === r.id)) {
                        savedRoutes.push(r);
                    }
                }
                if (typeof saveRoutes === 'function') saveRoutes();
                if (typeof renderRoutes === 'function') renderRoutes();
                if (typeof redrawRoutes === 'function') redrawRoutes();
            }

            // Сохраняем и обновляем UI
            if (typeof GameState !== 'undefined') GameState.save();
            if (typeof saveAllData === 'function') saveAllData();
            updateAllUI();
            if (typeof renderProvinceDashboard === 'function') renderProvinceDashboard();
            if (typeof refreshRecruitmentLimits === 'function') refreshRecruitmentLimits();
            addGlobalLog("📂 Импорт данных выполнен (слияние с существующими).", 'general');
            alert("Импорт завершён! Страница будет перезагружена.");
            location.reload();
        } catch (err) {
            console.error("Ошибка импорта:", err);
            alert("Ошибка импорта: " + err.message);
        }
    };
    reader.readAsText(file);
}

function globalResetAll() {
    if (confirm("ПОЛНЫЙ СБРОС ВСЕХ ДАННЫХ? Это действие необратимо.")) {
        localStorage.clear();
        location.reload();
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => { if (loadingScreen.parentNode) loadingScreen.remove(); }, 500);
    }
}

function renderProvinceDashboard() {
    const container = document.getElementById('provinceDashboard');
    if (!container) return;
    const totalPop = (typeof getTotalPopulation === 'function') ? getTotalPopulation() : 0;
    const weeklyIncome = (typeof getWeeklyIncome === 'function') ? getWeeklyIncome() : 0;
    const upkeep = (typeof calculateTotalUpkeep === 'function') ? calculateTotalUpkeep() : 0;
    const treasury = (typeof getCurrentTreasury === 'function') ? getCurrentTreasury() : 0;
    const provinces = (typeof getCurrentFactionProvinces === 'function') ? getCurrentFactionProvinces() : [];
    const provinceCount = provinces.length;
    const totalRes = (typeof getTotalResources === 'function') ? getTotalResources() : { wood:0, stone:0, iron:0, gold:0, ers:0 };
    let resourcesHtml = '';
    for (let [key, res] of Object.entries(RESOURCES_REGISTRY)) {
        if (key === 'ers') continue;
        resourcesHtml += `<div><img src="${res.icon}" style="width:20px; height:20px; vertical-align:middle;"> ${Math.floor(totalRes[key] || 0)}</div>`;
    }
    let summaryHtml = `<div class="stat-card" style="background: #1f1c14; border-color: #ffd966;">
        <div class="flex-row" style="justify-content: space-around; flex-wrap: wrap; gap: 15px;">
            <div><strong>👥 Население:</strong> ${totalPop.toLocaleString()}</div>
            <div><strong>💰 Доход/ход:</strong> ${weeklyIncome.toLocaleString()} эрсов</div>
            <div><strong>⚔️ Содержание:</strong> ${upkeep.toLocaleString()} эрсов/ход</div>
            <div><strong>🏦 Казна:</strong> ${Math.floor(treasury).toLocaleString()} эрсов</div>
            <div><strong>📍 Провинций:</strong> ${provinceCount}</div>
        </div>
        <div class="flex-row" style="justify-content: space-around; flex-wrap: wrap; gap: 15px; margin-top: 10px; border-top: 1px solid #b87c4f; padding-top: 10px;">
            <div><strong>📦 Ресурсы:</strong></div>
            ${resourcesHtml}
        </div>
    </div>`;
    let cardsHtml = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 15px; margin-top: 15px;">';
    for (let i = 0; i < provinces.length; i++) {
        const pid = provinces[i];
        const data = (typeof provincesData !== 'undefined') ? provincesData[pid] : null;
        if (!data) continue;
        const provinceName = (typeof PROVINCE_NAMES !== 'undefined' && PROVINCE_NAMES[pid]) ? PROVINCE_NAMES[pid] : pid;
        const isCapital = (i === 0) ? ' ⭐' : '';
        let provincePop = 0;
        if (data.races) {
            for (let race of data.races) provincePop += (typeof getRaceTotal === 'function') ? getRaceTotal(race) : (race.adultMale+race.adultFemale+race.children+race.elders);
        }
        const taxpayers = provincePop - Math.floor(provincePop * (peopleState?.settings?.poorPercent || 10) / 100);
        const provinceIncome = Math.floor(taxpayers * (peopleState?.settings?.taxRate || 1));
        const totalBuildings = data.settlements.reduce((sum, s) => sum + s.buildings.length, 0);
        const totalSlots = data.settlements.reduce((sum, s) => sum + (typeof getMaxSlotsForSettlement === 'function' ? getMaxSlotsForSettlement(s, s.id) : (SETTLEMENT_TYPES?.[s.type]?.slots || 3)), 0);
        const freeSlots = totalSlots - totalBuildings;
        let resHtml = '';
        if (data.resources) {
            for (let [key, res] of Object.entries(RESOURCES_REGISTRY)) {
                const amount = Math.floor(data.resources[key] || 0);
                resHtml += `<span title="${res.name}"><img src="${res.icon}" style="width:16px; height:16px; vertical-align:middle;"> ${amount}</span> `;
            }
        }
        const garrisonArmies = (typeof armies !== 'undefined') ? armies.filter(a => a.factionId === currentFaction && a.garrison && provinces.some(pid => { const s = SETTLEMENTS_DB?.[a.garrison]; return s && s.province === pid; })) : [];
        let garrisonHtml = '';
        if (garrisonArmies.length > 0) {
            const totalSoldiers = garrisonArmies.reduce((sum, army) => sum + army.units.reduce((s, u) => s + u.count, 0), 0);
            garrisonHtml = `<div>🛡️ Гарнизон: ${garrisonArmies.length} армии (👥 ${totalSoldiers.toLocaleString()})</div>`;
        } else {
            garrisonHtml = `<div>🛡️ Гарнизон: нет</div>`;
        }
        cardsHtml += `
            <div class="stat-card" style="background: #1f1c14; border-left: 4px solid ${i === 0 ? '#ffd966' : '#b87c4f'};">
                <h3 style="margin-top: 0;">🏘️ ${escapeHtml(provinceName)}${isCapital}</h3>
                <div>👥 Население: ${provincePop.toLocaleString()}</div>
                <div>💰 Доход: ${provinceIncome.toLocaleString()} эрсов/ход</div>
                <div>🏗️ Постройки: ${totalBuildings}/${totalSlots} слотов (свободно: ${freeSlots})</div>
                <div>${resHtml.trim()}</div>
                ${garrisonHtml}
            </div>
        `;
    }
    cardsHtml += '</div>';
    container.innerHTML = summaryHtml + cardsHtml;
}

// Экспорт функций
window.setupTabs = setupTabs;
window.setupCollapsibles = setupCollapsibles;
window.setupMapModes = setupMapModes;
window.bindGlobalEvents = bindGlobalEvents;
window.exportAllData = exportAllData;
window.importAllData = importAllData;
window.globalResetAll = globalResetAll;
window.hideLoadingScreen = hideLoadingScreen;
window.renderProvinceDashboard = renderProvinceDashboard;

console.log("✅ 13_ui.js загружен — функции интерфейса");