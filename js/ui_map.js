// ============================================================================
// МОДУЛЬ: ui_map.js – настройка UI карты (только обработчики)
// Версия с едиными масками владений и вассалов (без аргументов)
// ============================================================================
// Загружено на гитхаб 18.08.2026
function setupMapUI() {
    console.log("🔧 Настройка UI карты");

    // ---------- СВОРАЧИВАНИЕ ПАНЕЛЕЙ ----------
	function setupCollapsible(headerId, contentId, startCollapsed = false) {
		const header = document.getElementById(headerId);
		const content = document.getElementById(contentId);
		if (!header || !content) return;

		let collapsed = startCollapsed;
		// Применяем начальное состояние
		content.style.display = collapsed ? 'none' : 'flex';
		const arrow = header.querySelector('span:last-child');
		if (arrow) arrow.innerHTML = collapsed ? '▶' : '▼';

		header.addEventListener('click', function() {
			collapsed = !collapsed;
			content.style.display = collapsed ? 'none' : 'flex';
			if (arrow) arrow.innerHTML = collapsed ? '▶' : '▼';
		});
	}

    setupCollapsible('leftHeader', 'leftContent', true);
	setupCollapsible('citiesHeader', 'citiesContent', true);
	setupCollapsible('routesHeader', 'routesContent', true);
	setupCollapsible('mapLayersHeader', 'mapLayersContent', true);

    // ---------- РЕЖИМЫ КАРТЫ ----------
    const routeModeBtn = document.getElementById('routeModeBtn');
    const rulerModeBtn = document.getElementById('rulerModeBtn');
    const undoPointBtn = document.getElementById('undoPointBtn');
    const clearRouteBtn = document.getElementById('clearRouteBtn');
    const saveRouteBtn = document.getElementById('saveRouteBtn');
    const routeTypeSelect = document.getElementById('routeTypeSelect');

    if (routeModeBtn) {
        routeModeBtn.addEventListener('click', function() {
            if (typeof setMode === 'function') setMode('route');
        });
    }
    if (rulerModeBtn) {
        rulerModeBtn.addEventListener('click', function() {
            if (typeof setMode === 'function') setMode('ruler');
        });
    }
    if (undoPointBtn) {
        undoPointBtn.addEventListener('click', function() {
            if (typeof undoLastPoint === 'function') undoLastPoint();
        });
    }
    if (clearRouteBtn) {
        clearRouteBtn.addEventListener('click', function() {
            if (typeof clearTemp === 'function') clearTemp();
        });
    }
    if (saveRouteBtn) {
        saveRouteBtn.addEventListener('click', function() {
            if (typeof saveCurrentRoute === 'function') saveCurrentRoute();
        });
    }
    if (routeTypeSelect) {
        routeTypeSelect.addEventListener('change', function(e) {
            window.currentRouteType = e.target.value;
            if (window.currentMode === 'ruler' && typeof updateRouteInfo === 'function') updateRouteInfo();
        });
    }

    // ---------- ПАНЕЛЬ МАРКЕРОВ ----------
	setupCollapsible('mapLayersHeader', 'mapLayersContent');
	if (typeof buildMapLayersChecklist === 'function') buildMapLayersChecklist();
	if (typeof showMapLayers === 'function') showMapLayers(); // отрисовка по умолчанию
    // ---------- ПАНЕЛЬ МАСОК ----------
    const rhetoricBtn = document.getElementById('modeRhetoricBtn');
    const holdingsBtn = document.getElementById('modeHoldingsBtn');
    const vassalsBtn = document.getElementById('modeVassalsBtn');
    const routesBtn = document.getElementById('modeRoutesBtn');
    const rhetoricPanel = document.getElementById('rhetoricPanel');
    const holdingsPanel = document.getElementById('holdingsPanel');
    const vassalsPanel = document.getElementById('vassalsPanel');

	function setActiveTab(activeBtn) {
		// Если нажата кнопка "Маршруты" и она уже активна — ничего не делаем
		if (activeBtn === routesBtn && activeBtn && activeBtn.classList.contains('active')) {
			return;
		}

		// Если нажата уже активная кнопка (кроме "Маршруты") — деактивируем её
		if (activeBtn && activeBtn !== routesBtn && activeBtn.classList.contains('active')) {
			// Снимаем активность со всех кнопок
			[rhetoricBtn, holdingsBtn, vassalsBtn, routesBtn].forEach(btn => {
				if (btn) btn.classList.remove('active');
			});
			// Скрываем все панели
			if (rhetoricPanel) rhetoricPanel.style.display = 'none';
			if (holdingsPanel) holdingsPanel.style.display = 'none';
			if (vassalsPanel) vassalsPanel.style.display = 'none';
			// Очищаем маски
			if (typeof clearMasks === 'function') clearMasks();
			// Маршруты остаются, перерисовываем (на случай, если маски перекрывали)
			if (typeof redrawRoutes === 'function') redrawRoutes();
			return;
		}

		// Сброс активных кнопок
		[rhetoricBtn, holdingsBtn, vassalsBtn, routesBtn].forEach(btn => {
			if (btn) btn.classList.remove('active');
		});
		if (activeBtn) activeBtn.classList.add('active');

		// Скрываем все панели
		if (rhetoricPanel) rhetoricPanel.style.display = 'none';
		if (holdingsPanel) holdingsPanel.style.display = 'none';
		if (vassalsPanel) vassalsPanel.style.display = 'none';

		// Показываем нужную панель и включаем соответствующую маску
		if (activeBtn === rhetoricBtn && rhetoricPanel) {
			rhetoricPanel.style.display = 'flex';
			if (typeof showRhetoricMasks === 'function') showRhetoricMasks('all');
			if (typeof buildRhetoricChecklist === 'function') buildRhetoricChecklist();
		} else if (activeBtn === holdingsBtn && holdingsPanel) {
			holdingsPanel.style.display = 'flex';
			if (typeof showHoldingsMask === 'function') showHoldingsMask();
			if (typeof buildHoldingsChecklist === 'function') buildHoldingsChecklist();
		} else if (activeBtn === vassalsBtn && vassalsPanel) {
			vassalsPanel.style.display = 'flex';
			if (typeof showVassalsMask === 'function') showVassalsMask();
			if (typeof updateVassalChecklist === 'function') updateVassalChecklist();
		} else if (activeBtn === routesBtn) {
			// Для кнопки "Маршруты" очищаем маски и показываем только маршруты
			if (typeof clearMasks === 'function') clearMasks();
			if (typeof redrawRoutes === 'function') redrawRoutes();
		}

		// Очищаем временные точки маршрута
		if (typeof clearTemp === 'function') clearTemp();
	}

    if (rhetoricBtn) {
        rhetoricBtn.addEventListener('click', function() { setActiveTab(rhetoricBtn); });
    }
    if (holdingsBtn) {
        holdingsBtn.addEventListener('click', function() { setActiveTab(holdingsBtn); });
    }
    if (vassalsBtn) {
        vassalsBtn.addEventListener('click', function() { setActiveTab(vassalsBtn); });
    }
    if (routesBtn) {
        routesBtn.addEventListener('click', function() { setActiveTab(routesBtn); });
    }

    // ---------- ПРЕДУСТАНОВКИ ТИПОВ ДОРОГ ----------
    const routePresets = document.querySelectorAll('.route-preset');
    if (routePresets.length) {
        routePresets.forEach(btn => {
            btn.addEventListener('click', function() {
                const newType = this.getAttribute('data-type');
                window.currentRouteType = newType;
                routePresets.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                if (routeTypeSelect) routeTypeSelect.value = newType;
                if (typeof addGlobalLog === 'function') {
                    addGlobalLog(`🎯 Тип дороги по умолчанию: ${newType}`, 'map');
                }
            });
        });
        const defaultBtn = document.querySelector('.route-preset[data-type="land"]');
        if (defaultBtn) defaultBtn.classList.add('active');
    }

    // ---------- ФИЛЬТРЫ ГОРОДОВ ----------
    const showCitiesCheckbox = document.getElementById('showCities');
    const factionFilter = document.getElementById('factionFilter');
    if (showCitiesCheckbox) {
        showCitiesCheckbox.addEventListener('change', function(e) {
            window.showCitiesFlag = e.target.checked;
            if (typeof updateCitiesVisibility === 'function') updateCitiesVisibility();
        });
    }
	if (factionFilter) {
		factionFilter.addEventListener('change', function(e) {
			window.currentFactionFilter = e.target.value;
			if (typeof addCityMarkers === 'function') addCityMarkers();
			// НОВАЯ СТРОКА – обновляем список поселений под фильтром
			if (typeof updateSettlementList === 'function') updateSettlementList();
		});
	}

    // ---------- ПОЛНОЭКРАННЫЙ РЕЖИМ ----------
    const fullscreenBtn = document.getElementById('fullscreenMapBtn');
    const mapContainer = document.getElementById('mapContainer');
    if (fullscreenBtn && mapContainer) {
        fullscreenBtn.addEventListener('click', function() {
            if (!document.fullscreenElement) {
                mapContainer.requestFullscreen().catch(err => console.error(err));
                this.textContent = '🗗 Восстановить';
                this.style.background = '#b8860b';
            } else {
                document.exitFullscreen();
                this.textContent = '⛶ Во весь экран';
                this.style.background = '#3a5a2a';
            }
        });
        document.addEventListener('fullscreenchange', function() {
            if (!document.fullscreenElement) {
                fullscreenBtn.textContent = '⛶ Во весь экран';
                fullscreenBtn.style.background = '#3a5a2a';
                if (map) setTimeout(function() { map.invalidateSize(); }, 100);
            } else {
                fullscreenBtn.textContent = '🗗 Восстановить';
                fullscreenBtn.style.background = '#b8860b';
                if (map) setTimeout(function() { map.invalidateSize(); }, 100);
            }
        });
    }

    // ---------- МАССОВЫЕ ОПЕРАЦИИ С МАРШРУТАМИ ----------
    const selectAllBtn = document.getElementById('selectAllBtn');
    const deselectAllBtn = document.getElementById('deselectAllBtn');
    const exportAllBtn = document.getElementById('exportAllBtn');
    const exportSelectedBtn = document.getElementById('exportSelectedBtn');
    const importFile = document.getElementById('importFile');

    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', function() {
            if (typeof selectAllVisible === 'function') selectAllVisible();
        });
    }
    if (deselectAllBtn) {
        deselectAllBtn.addEventListener('click', function() {
            if (typeof deselectAllVisible === 'function') deselectAllVisible();
        });
    }
    if (exportAllBtn) {
        exportAllBtn.addEventListener('click', function() {
            if (typeof exportAllRoutes === 'function') exportAllRoutes();
        });
    }
    if (exportSelectedBtn) {
        exportSelectedBtn.addEventListener('click', function() {
            if (typeof exportSelectedRoutes === 'function') exportSelectedRoutes();
        });
    }
    if (importFile) {
        importFile.addEventListener('change', function(e) {
            if (e.target.files.length && typeof importRoutes === 'function') {
                importRoutes(e.target.files[0]);
            }
            e.target.value = '';
        });
    }

    // ---------- ВАССАЛЫ: ПЕРЕКЛЮЧЕНИЕ ФРАКЦИИ (селект больше не нужен, но оставим без действий) ----------
    const vassalSelect = document.getElementById('vassalFactionSelect');
    if (vassalSelect) {
        // Можно просто скрыть селект, но для обратной совместимости оставим
        // При изменении ничего не делаем, так как маска теперь одна.
        vassalSelect.style.display = 'none';   // или удалить элемент из HTML
    }

    // ---------- ЧЕКБОКС "Показать все маски" ----------
    const rhetoricShowAll = document.getElementById('rhetoricShowAll');
    if (rhetoricShowAll) {
        rhetoricShowAll.addEventListener('change', function(e) {
            const checkboxes = document.querySelectorAll('#rhetoricChecklist input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.checked = e.target.checked;
                cb.dispatchEvent(new Event('change'));
            });
        });
    }
    // ===== НОВЫЙ БЛОК: ПЕРЕКЛЮЧЕНИЕ КОМПАСА =====
    const toggleCompassBtn = document.getElementById('toggleCompassBtn');
    if (toggleCompassBtn) {
        toggleCompassBtn.textContent = '🧭 Скрыть';
        toggleCompassBtn.addEventListener('click', function() {
            if (window.compassContainer) {
                const isVisible = window.compassContainer.style.display !== 'none';
                window.compassContainer.style.display = isVisible ? 'none' : 'flex';
                this.textContent = isVisible ? '🧭 Показать' : '🧭 Скрыть';
            }
        });
    }
	
	    // ---------- ПЕРЕКЛЮЧЕНИЕ ПАНЕЛИ ГОРОДОВ ----------
    const toggleCitiesBtn = document.getElementById('toggleCitiesBtn');
    if (toggleCitiesBtn) {
        const citiesPanel = document.getElementById('citiesPanel');
        if (citiesPanel) {
            toggleCitiesBtn.textContent = '🏙️ Скрыть';
            toggleCitiesBtn.addEventListener('click', function() {
                const isVisible = citiesPanel.style.display !== 'none';
                citiesPanel.style.display = isVisible ? 'none' : 'block';
                this.textContent = isVisible ? '🏙️ Показать' : '🏙️ Скрыть';
            });
        }
    }
	
    console.log("✅ UI карты настроен");
}
function buildMapLayersChecklist() {
  const container = document.getElementById('mapLayersChecklist');
  if (!container || !window.mapLayers) return;
  container.innerHTML = '';
  for (let layer of window.mapLayers) {
    const div = document.createElement('div');
    div.className = 'checkbox-item';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = layer.visible;
    cb.addEventListener('change', e => {
      layer.visible = e.target.checked;
      showMapLayers();
    });
    const label = document.createElement('label');
    label.textContent = layer.name;
    div.appendChild(cb); div.appendChild(label);
    container.appendChild(div);
  }
}
// Экспорт
window.setupMapUI = setupMapUI;
console.log("✅ ui_map.js загружен");