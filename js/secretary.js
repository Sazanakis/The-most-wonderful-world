// ================================================================
// Секретарь Леонора – информативный режим для страниц фракций
// Версия 2.2 – адаптация для мобильных устройств
// загружено на гитхаб 26.09.26
// ================================================================
(function() {
    'use strict';

    let isEnabled = false;
    const STORAGE_KEY = 'secretaryEnabled';
    let tooltip = null;
    let hideTimeout = null;
    let currentElement = null;
    let isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // ---- БАЗА ПОДСКАЗОК ----
    const tips = {
        // ================================================================
        // === ГЛАВНОЕ МЕНЮ / index.html ===
        // ================================================================
        '#startBtn': 'Начать приключение — перейти к экрану приветствия.',
        '#beginBtn': 'Вступить в игру и открыть меню выбора фракций.',
        '#secretaryToggleCheckbox': 'Включить или выключить подсказки секретаря Леоноры.',
        '#musicToggleCheckbox': 'Включить или выключить фоновую музыку.',
        '.faction-card': 'Карточка фракции — нажмите, чтобы начать играть за неё.',
        '#factionFilterToggle': 'Открыть фильтр фракций по риторике (Даё, Лоялисты, Нейтралы и т.д.).',
        '.filter-option': 'Выбрать эту риторику для фильтрации списка фракций.',
        '.map-button': 'Открыть карту мира, чтобы посмотреть все поселения и маршруты.',
        '.book-button': 'Открыть читалку книги — там вы можете читать главы и заметки.',
        '.vk-link-btn': 'Открыть нашу группу ВКонтакте — там новости и обновления.',

        // ================================================================
        // === ГЛАВНЫЙ ЗАГОЛОВОК (все страницы фракций) ===
        // ================================================================
        '.global-header a[href="index.html"]': 'Вернуться в главное меню выбора фракций.',
        '.global-header a[href="map.html"]': 'Открыть карту мира, чтобы видеть все поселения и маршруты.',
        '#treasuryDetailsBtn': 'Показать детальный отчёт о доходах и расходах казны.',
        '#globalTurnBtn': 'Применить ход — продвинуть время и выполнить все еженедельные действия.',
        '#globalSaveBtn': 'Сохранить текущее состояние игры в файл (JSON).',
        '#globalLoadBtn': 'Загрузить сохранённую игру из файла.',
        '#globalLoadFile': 'Выбрать файл сохранения для загрузки.',
        '#resetFactionDataBtn': 'Сбросить все данные этой фракции (необратимо).',
        '#leaderLinkBtn': 'Открыть страницу лидера фракции (ВКонтакте или другая ссылка).',
        '#globalDateDisplay': 'Текущая игровая дата.',
        '#leaderName': 'Имя текущего правителя фракции.',

        // ================================================================
        // === ВКЛАДКИ ===
        // ================================================================
        '.tab-button[data-tab="council"]': 'Совет — управление вассалами, их лояльностью и влиянием.',
        '.tab-button[data-tab="army"]': 'Армия — создание армий, найм юнитов, управление отрядами.',
        '.tab-button[data-tab="province"]': 'Провинция — управление поселениями, постройками, населением и ресурсами.',
        '.tab-button[data-tab="corruption"]': 'Коррупция — отслеживание уровня коррупции и управление агентом.',
        '.tab-button[data-tab="trade"]': 'Торговля — заключение торговых договоров, экспорт и импорт ресурсов.',
        '.tab-button[data-tab="captured"]': 'Оккупированные земли — управление захваченными территориями.',
        '.tab-button[data-tab="tech"]': 'Технологии — исследование новых технологий и управление исследователями.',

        // ================================================================
        // === СОВЕТ ===
        // ================================================================
        '#addVassalBtn': 'Добавить нового вассала (влиятельный дом) в совет.',
        '#resetCouncilBtn': 'Полностью сбросить все данные совета — все вассалы удалятся.',
        '.council-faction-btn': 'Переключиться на совет другой фракции.',
        '.house-card': 'Карточка вассала — нажмите «Подробнее», чтобы открыть полную информацию.',
        '.remove-settlement-btn': 'Отнять поселение у вассала и вернуть его под прямое управление.',
        '#transferSettlementBtn': 'Передать поселение другому вассалу.',
        '#changeCoatBtn': 'Загрузить новый герб для рода (PNG).',
        '#changePortraitBtn': 'Загрузить новый портрет лидера рода (PNG).',
        '#loyaltyPlusBtn': 'Повысить лояльность вассала на 5 (ручное изменение).',
        '#loyaltyMinusBtn': 'Понизить лояльность вассала на 5 (ручное изменение).',
        '#influencePlusBtn': 'Повысить влияние вассала на 5 (ручное изменение).',
        '#influenceMinusBtn': 'Понизить влияние вассала на 5 (ручное изменение).',
        '#upgradeRankBtn': 'Повысить ранг вассала за 2000 эрсов (требуется 70% лояльности).',
        '#externalLinkBtn': 'Открыть внешнюю ссылку на страницу этого дома.',
        '#externalLinkInput': 'Введите ссылку на страницу дома во внешнем источнике (например, ВКонтакте).',
        '#closeVassalModalBtn': 'Закрыть окно с информацией о вассале.',

        // ================================================================
        // === АРМИЯ ===
        // ================================================================
        '#newArmyBtn': 'Создать новую армию с выбором названия, командира и гарнизона.',
        '#clearAllArmiesBtn': 'Расформировать все армии фракции (удалить все отряды).',
        '#exportArmiesBtn': 'Экспортировать данные всех армий в JSON-файл.',
        '#importArmiesBtn': 'Импортировать армии из JSON-файла.',
        '#armyImportFile': 'Выбрать файл с армиями для импорта.',
        '#resetArmyBtn': 'Сбросить все армии фракции (удалить безвозвратно).',
        '#loadExampleBtn': 'Загрузить пример армии для демонстрации возможностей.',
        '#importBattleResultBtn': 'Импортировать результаты битвы из файла (потери).',
        '#battleResultFileInput': 'Выбрать файл с результатами битвы.',
        '#filterType': 'Фильтр доступных юнитов по типу войск (пехота, кавалерия и т.д.).',
        '#filterRace': 'Фильтр доступных юнитов по расе.',
        '#filterSpecial': 'Показать только юниты с лимитом (особые).',
        '#resetFiltersBtn': 'Сбросить все фильтры юнитов.',
        '#armyTreasury': 'Текущее количество эрсов в казне фракции.',
        '#globalUpkeep': 'Общее содержание всех армий за ход.',
        '.unit-card': 'Карточка юнита — нажмите «Нанять», чтобы добавить отряд в выбранную армию.',
        '.hire-unit-btn': 'Нанять один отряд этого типа в выбранную армию.',
        '.detail-unit-btn': 'Посмотреть подробные характеристики юнита.',
        '.army-toggle-btn': 'Свернуть или развернуть карточку армии.',
        '.army-header': 'Шапка армии — кликните, чтобы свернуть или развернуть.',
        '.army-container button': 'Кнопки управления армией: выбрать, разделить, объединить, битва и т.д.',

        // ================================================================
        // === ПРОВИНЦИИ ===
        // ================================================================
        '#addRaceBtn': 'Добавить новую расу в провинцию (например, Оку, Люди, Дварфы).',
        '#addSettlementBtn': 'Добавить новое поселение (деревню, деревянный или каменный форт).',
        '#removeSettlementBtn': 'Удалить последнее поселение в списке (необратимо).',
        '#resetProvinceBtn': 'Сбросить ресурсы провинции до начальных значений.',
        '#exportProvinceBtn': 'Экспортировать данные текущей провинции в файл.',
        '#importProvinceBtn': 'Импортировать провинцию из файла.',
        '#importProvinceFile': 'Выбрать файл провинции для импорта.',
        '#currentProvinceSelect': 'Выбрать провинцию для управления.',
        '#taxRate': 'Ставка налога с каждого человека (эрс/чел). Влияет на доход.',
        '#conscriptPercent': 'Процент населения, доступный для призыва в армию.',
        '#womenInArmyCheckbox': 'Разрешить призыв женщин в армию (требует осторожности).',
        '#totalPopulation': 'Общее население фракции.',
        '#totalConscript': 'Общее количество доступных рекрутов.',
        '#weeklyIncome': 'Еженедельный доход от налогов.',
        '#totalTreasury': 'Текущая казна фракции.',
        '.settlements-group': 'Группа поселений (прямые владения или вассал).',
        '.group-header': 'Заголовок группы — кликните, чтобы свернуть или развернуть.',
        '.settlement-card': 'Карточка поселения — здесь отображаются постройки и слоты.',
        '.build-btn': 'Начать строительство нового здания в этом поселении.',
        '.upgrade-btn': 'Улучшить существующее здание.',
        '.demolish-btn': 'Снести здание (займёт 1 ход, вернётся 30% золота).',
        '.cancel-build-btn': 'Отменить строительство (вернётся 50% ресурсов).',
        '.freeze-build-btn': 'Заморозить строительство (таймер остановится).',
        '.unfreeze-build-btn': 'Разморозить строительство (таймер снова идёт).',
        '.detail-building-btn': 'Посмотреть подробную информацию о здании.',
        '.capture-settlement-btn': 'Захватить это поселение (станет оккупированным).',
        '.liberate-settlement-btn': 'Освободить поселение от оккупации.',
        '#buildingsCatalogSection': 'Каталог всех доступных построек — кликните, чтобы раскрыть.',

        // ================================================================
        // === ТОРГОВЛЯ ===
        // ================================================================
        '#addAgreementBtn': 'Заключить новый торговый договор с выбранной фракцией.',
        '#exchangeGoldBtn': 'Обменять золото на эрсы по текущему курсу.',
        '#smeltSwordIronBtn': 'Переплавить Железо меча в обычное железо (1 ед. → 10 железа).',
        '#newAgreementPartner': 'Выбрать фракцию-партнёра для торгового договора.',
        '#newAgreementPrice': 'Цена за одну единицу ресурса в эрсах.',
        '#newAgreementAmount': 'Количество ресурса, передаваемое за один ход.',
        '#newAgreementDuration': 'Срок действия договора в ходах (0 — бессрочно).',
        '.resource-card': 'Карточка ресурса — кликните, чтобы выбрать для торговли.',
        '.delete-agreement': 'Расторгнуть торговый договор.',

        // ================================================================
        // === ТЕХНОЛОГИИ ===
        // ================================================================
        '#importTechBtn': 'Импортировать технологию из JSON-файла.',
        '#importTechFile': 'Выбрать файл с технологией для импорта.',
        '#availableTechsToggleIcon': 'Развернуть или свернуть список доступных технологий.',
        '.tech-slot': 'Слот исследователя — здесь можно нанять учёного или назначить технологию.',
        '.detail-unit-btn': 'Посмотреть подробности технологии.',

        // ================================================================
        // === КОРРУПЦИЯ ===
        // ================================================================
        '#hireAgentBtn': 'Нанять агента-контролёра для борьбы с коррупцией.',
        '#fundAgentBtn': 'Профинансировать агента (уменьшает коррупцию, повышает навык).',
        '#fireAgentBtn': 'Уволить текущего агента.',
        '#killAgentBtn': 'Убить агента (безвозвратно).',
        '#exportAgentBtn': 'Экспортировать данные агента в JSON.',
        '#importAgentBtn': 'Импортировать агента из JSON.',
        '#importAgentFile': 'Выбрать файл агента для импорта.',
        '#setCorruptionBtn': 'Установить уровень коррупции вручную (от 1 до 50%).',
        '#manualCorruptionInput': 'Ручной ввод уровня коррупции в процентах.',

        // ================================================================
        // === ОККУПИРОВАННЫЕ ЗЕМЛИ ===
        // ================================================================
        '#importCapturedFileBtn': 'Импортировать оккупированное поселение из файла.',
        '#capturedFileInput': 'Выбрать файл оккупированного поселения.',
        '.build-in-captured-btn': 'Построить здание в оккупированном поселении.',
        '.unblock-pop-btn': 'Разблокировать население оккупированного поселения.',
        '.lose-captured-btn': 'Потерять оккупированное поселение (вернуть владельцу).',
        '.remove-captured-btn': 'Удалить запись об оккупированном поселении.',

        // ================================================================
        // === КАРТА ===
        // ================================================================
        '#routeModeBtn': 'Режим прокладки маршрута — кликайте по карте, чтобы добавить точки.',
        '#rulerModeBtn': 'Режим линейки — измеряйте расстояние между точками.',
        '#undoPointBtn': 'Отменить последнюю точку маршрута.',
        '#clearRouteBtn': 'Очистить текущий маршрут или измерение.',
        '#saveRouteBtn': 'Сохранить текущий маршрут в список.',
        '#fullscreenMapBtn': 'Развернуть карту на весь экран.',
        '#markerModeBtn': 'Режим маркеров — кликните на карте, чтобы поставить метку.',
        '#toggleCompassBtn': 'Показать или скрыть компас на карте.',
        '#toggleCitiesBtn': 'Показать или скрыть панель городов.',
        '#modeRhetoricBtn': 'Показать маски риторик (Даё, Лоялисты, Нейтралы и т.д.).',
        '#modeHoldingsBtn': 'Показать маску владений фракций.',
        '#modeVassalsBtn': 'Показать маску вассалов.',
        '#modeRoutesBtn': 'Показать только маршруты (скрыть маски).',
        '#routeTypeSelect': 'Выбрать тип дороги для маршрута (по умолчанию).',
        '#showCities': 'Показать или скрыть города на карте.',
        '#factionFilter': 'Фильтр поселений по фракции.',
        '#mapFactionSelect': 'Выбрать фракцию, за которую вы играете.',
        '#selectAllBtn': 'Отметить все маршруты как видимые.',
        '#deselectAllBtn': 'Снять выделение со всех маршрутов.',
        '#exportAllBtn': 'Экспортировать все маршруты в файл.',
        '#exportSelectedBtn': 'Экспортировать только выбранные маршруты.',
        '#importFile': 'Импортировать маршруты из файла.',
        '#addMarkerBtn': 'Добавить новый маркер на карту.',
        '#exportMarkersBtn': 'Экспортировать все маркеры в файл.',
        '#importMarkersBtn': 'Импортировать маркеры из файла.',
        '#clearMarkersBtn': 'Удалить все маркеры с карты.',
        '.menu-btn': 'Вернуться в главное меню.',
        '.mode-btn': 'Переключить режим карты (маршрут, линейка, маска и т.д.).',
        '.route-preset': 'Быстро выбрать тип дороги для маршрута.',

        // ================================================================
        // === ОБЩИЕ ЭЛЕМЕНТЫ ===
        // ================================================================
        '.btn-main': 'Главная кнопка для подтверждения действий.',
        '.nav-button': 'Кнопка навигации (например, «Карта», «Меню»).',
        '.header-btn': 'Кнопка в глобальном заголовке для быстрых действий.',
        '.map-link-btn': 'Ссылка на карту мира.',
        '.turn-btn': 'Применить ход — продвинуть время.',
        '.reset-btn': 'Сбросить данные.',
        '.danger-btn': 'Опасное действие — часто необратимое.',
        '.log-panel': 'Панель логов — здесь отображаются последние события.',
        '.log-entry': 'Запись в логе событий.',
        '.modal-content': 'Модальное окно с подробной информацией.',

        // === Заглушка ===
        '*': 'Простите, мне ничего не сообщали об этом элементе.'
    };

    // ---- ПОЛУЧЕНИЕ ПОДСКАЗКИ ----
    function getTip(element) {
        if (!element) return tips['*'];
        // Приоритет 1: явный data-tip
        if (element.dataset && element.dataset.tip) return element.dataset.tip;
        // Приоритет 2: id
        if (element.id && tips['#' + element.id]) return tips['#' + element.id];
        // Приоритет 3: data-tab
        const dataTab = element.getAttribute('data-tab');
        if (dataTab && tips['.tab-button[data-tab="' + dataTab + '"]']) {
            return tips['.tab-button[data-tab="' + dataTab + '"]'];
        }
        // Приоритет 4: классы
        for (let className of element.classList) {
            const selector = '.' + className;
            if (tips[selector]) return tips[selector];
        }
        // Приоритет 5: селекторы
        for (let selector in tips) {
            if (selector === '*') continue;
            try {
                if (element.matches(selector)) return tips[selector];
            } catch(e) { /* ignore */ }
        }
        return tips['*'];
    }

    // ---- ТУЛТИП ----
    function ensureTooltip() {
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'secretary-tooltip';
            tooltip.style.cssText = `
                position: fixed;
                pointer-events: none;
                background: rgba(18, 14, 12, 0.95);
                border: 2px solid #b8943a;
                border-radius: 12px;
                padding: 10px 16px;
                color: #f0e3c8;
                font-family: 'Cinzel', 'Georgia', serif;
                font-size: 0.9rem;
                max-width: 380px;
                z-index: 9999999;
                box-shadow: 0 4px 20px rgba(0,0,0,0.9);
                backdrop-filter: blur(4px);
                display: flex;
                align-items: center;
                gap: 12px;
                opacity: 0;
                transition: opacity 0.15s ease;
            `;
            const portrait = document.createElement('img');
            portrait.src = 'images/character_idle.png';
            portrait.style.width = '50px';
            portrait.style.height = 'auto';
            portrait.style.borderRadius = '8px';
            portrait.style.flexShrink = '0';
            tooltip.appendChild(portrait);
            const textSpan = document.createElement('span');
            textSpan.id = 'secretary-text';
            tooltip.appendChild(textSpan);
            document.body.appendChild(tooltip);
        }
        return tooltip;
    }

    function showTooltip(text, x, y) {
        if (!isEnabled) return;
        const tip = ensureTooltip();
        const textSpan = document.getElementById('secretary-text');
        if (textSpan) textSpan.textContent = text;
        requestAnimationFrame(() => {
            const rect = tip.getBoundingClientRect();
            const w = rect.width;
            const h = rect.height;
            let left, top;
            if (isMobile) {
                left = (window.innerWidth - w) / 2;
                top = window.innerHeight - h - 20;
            } else {
                left = x + 15;
                top = y + 15;
                if (left + w > window.innerWidth) left = x - w - 15;
                if (top + h > window.innerHeight) top = y - h - 15;
            }
            tip.style.left = Math.max(10, left) + 'px';
            tip.style.top = Math.max(10, top) + 'px';
            tip.style.opacity = '1';
            tip.style.display = 'flex';
        });
        clearTimeout(hideTimeout);
        if (isMobile) {
            hideTimeout = setTimeout(() => {
                hideTooltip(0);
            }, 3000);
        }
    }

    function hideTooltip(delay = 0) {
        if (!tooltip) return;
        clearTimeout(hideTimeout);
        if (delay > 0) {
            hideTimeout = setTimeout(() => {
                if (tooltip) {
                    tooltip.style.opacity = '0';
                    setTimeout(() => { if (tooltip) tooltip.style.display = 'none'; }, 200);
                }
            }, delay);
        } else {
            tooltip.style.opacity = '0';
            setTimeout(() => { if (tooltip) tooltip.style.display = 'none'; }, 200);
        }
    }

    // ---- ОБРАБОТЧИКИ ДЛЯ ДЕСКТОПА ----
    function onMouseEnter(e) {
        if (!isEnabled || isMobile) return;
        const target = e.target.closest('button, a, .tab-button, .faction-card, .nav-button, .map-link-btn, .turn-btn, .reset-btn, .header-btn, .mode-btn, .route-preset, #secretaryToggleBtn');
        if (!target) return;
        if (currentElement === target) return;
        currentElement = target;
        const tipText = getTip(target);
        showTooltip(tipText, e.clientX, e.clientY);
    }

    function onMouseLeave(e) {
        if (!isEnabled || isMobile) return;
        const target = e.target.closest('button, a, .tab-button, .faction-card, .nav-button, .map-link-btn, .turn-btn, .reset-btn, .header-btn, .mode-btn, .route-preset, #secretaryToggleBtn');
        if (!target) return;
        if (currentElement === target) {
            currentElement = null;
            hideTooltip(100);
        }
    }

    // ---- ОБРАБОТЧИК ДЛЯ МОБИЛЬНЫХ ----
    function onMobileClick(e) {
        if (!isEnabled || !isMobile) return;
        const target = e.target.closest('button, a, .tab-button, .faction-card, .nav-button, .map-link-btn, .turn-btn, .reset-btn, .header-btn, .mode-btn, .route-preset, #secretaryToggleBtn');
        if (!target) return;
        const tipText = getTip(target);
        showTooltip(tipText, 0, 0);
        // Не блокируем событие
    }

    // ---- ВКЛЮЧЕНИЕ/ВЫКЛЮЧЕНИЕ ----
    function toggleSecretary(enabled) {
        isEnabled = enabled;
        localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
        updateToggleButton();
        if (!enabled) {
            hideTooltip(0);
            currentElement = null;
        } else {
            const msg = isMobile ? 'Привет! Я Леонора. Тапни по элементу, и я расскажу о нём.' : 'Привет! Я Леонора. Наведи на любой элемент, и я расскажу о нём.';
            showTooltip(msg, 100, 100);
            setTimeout(() => hideTooltip(2500), 3500);
        }
    }

    function updateToggleButton() {
        const btn = document.getElementById('secretaryToggleBtn');
        if (btn) {
            btn.textContent = isEnabled ? '🧑‍💼 Секретарь: Вкл' : '🧑‍💼 Секретарь: Выкл';
            btn.style.borderColor = isEnabled ? '#8bc34a' : '#b87c4f';
            btn.style.background = isEnabled ? '#3a6b3a' : '#5e3a22';
        }
    }

    // ---- ИНИЦИАЛИЗАЦИЯ ----
    function initSecretary() {
        const saved = localStorage.getItem(STORAGE_KEY);
        isEnabled = (saved === 'true');

        // Добавляем кнопку
        const header = document.querySelector('.global-header');
        if (header) {
            let btn = document.getElementById('secretaryToggleBtn');
            if (!btn) {
                btn = document.createElement('button');
                btn.id = 'secretaryToggleBtn';
                btn.className = 'header-btn';
                btn.style.background = '#5e3a22';
                const insertAfter = document.querySelector('#treasuryDetailsBtn') || document.querySelector('.turn-btn');
                if (insertAfter) {
                    insertAfter.parentNode.insertBefore(btn, insertAfter.nextSibling);
                } else {
                    header.appendChild(btn);
                }
            }
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleSecretary(!isEnabled);
            });
            updateToggleButton();
        }

        // Удаляем старые обработчики, чтобы не было дублей
        document.removeEventListener('mouseenter', onMouseEnter, true);
        document.removeEventListener('mouseleave', onMouseLeave, true);
        document.removeEventListener('click', onMobileClick, true);

        if (isMobile) {
            document.addEventListener('click', onMobileClick, true);
        } else {
            document.addEventListener('mouseenter', onMouseEnter, true);
            document.addEventListener('mouseleave', onMouseLeave, true);
        }

        if (isEnabled) {
            setTimeout(() => {
                const msg = isMobile ? 'Привет! Я Леонора. Тапни по элементу, и я расскажу о нём.' : 'Привет! Я Леонора. Наведи на любой элемент, и я расскажу о нём.';
                showTooltip(msg, 100, 100);
                setTimeout(() => hideTooltip(2500), 3500);
            }, 800);
        }
    }

    // Запуск
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSecretary);
    } else {
        initSecretary();
    }

})();