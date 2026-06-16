// ============================================================================
// МОДУЛЬ 16: masks_config.js
// Конфигурация и управление слоями-масками на карте (риторика, владения, вассалы)
// ВЕРСИЯ 2.0 – ДОБАВЛЕНЫ ПРОВЕРКИ НА СУЩЕСТВОВАНИЕ MAP И ГЛОБАЛЬНЫХ ОБЪЕКТОВ
// ============================================================================

// ========== 1. МАСКИ РИТОРИКИ ==========
window.rhetoricMasks = [
    { name: "Даё", image: "images/lands_Dae.png", visible: true, opacity: 0.6, rhetoricId: "dayo" },
    { name: "Лоялисты", image: "images/lands_loyalist.png", visible: true, opacity: 0.6, rhetoricId: "loyal" },
    { name: "Нейтралы", image: "images/Neutrals.png", visible: true, opacity: 0.6, rhetoricId: "neutral" },
    { name: "Проюрганцы", image: "images/Proyurgans.png", visible: true, opacity: 0.6, rhetoricId: "proyurgan" },
    { name: "Союз Лепус", image: "images/lands_lepus.png", visible: true, opacity: 0.6, rhetoricId: "lepus" },
    { name: "Совет регентов", image: "images/Board_Regents.png", visible: true, opacity: 0.6, rhetoricId: "neutral" }
];

// ========== 2. МАСКИ ВЛАДЕНИЙ ==========
window.holdingsMasks = [
    { name: "Орочима (Клан Дакэта)", color: "#ff6b6b", provinces: ["orochima"], image: "images/holdings_orochima.png", visible: true, opacity: 0.6, factionId: "clan_daketa" },
    { name: "Кайя (Графство Маркарн)", color: "#4a90d9", provinces: ["kaya"], image: "images/holdings_markarn.png", visible: true, opacity: 0.6, factionId: "county_markarn" },
    { name: "Фогель (Графство Фогельмарк)", color: "#4a90d9", provinces: ["vogel"], image: "images/holdings_vogelmark.png", visible: true, opacity: 0.6, factionId: "county_vogelmark" },
    { name: "Неолания (Горское княжество)", color: "#8b4513", provinces: ["neolania"], image: "images/holdings_gorski.png", visible: true, opacity: 0.6, factionId: "principality_gorski" },
    { name: "Столичная область (Совет регентов)", color: "#cfc294", provinces: ["metropolitan_area"], image: "images/holdings_regents.png", visible: true, opacity: 0.6, factionId: "regency_council" },
    { name: "Великий Вал (Совет регентов)", color: "#cfc294", provinces: ["great_shaft"], image: "images/holdings_regents.png", visible: true, opacity: 0.6, factionId: "regency_council" },
    { name: "Лепорис (Союз Лепус)", color: "#6a9fb5", provinces: ["leporis"], image: "images/holdings_lepus.png", visible: true, opacity: 0.6, factionId: "lepus_union" }
];

// ========== 3. МАСКИ ВАССАЛОВ ==========
window.vassalsMasks = {
    clan_daketa: {
        main: { name: "Род Дакэта", image: "images/holdings_orochima.png", color: "#ff6b6b", settlements: ["nobuno", "yukisaki", "shiratori", "kuramura", "chiga", "eri", "yomizu", "kiyomizu", "tsukimi", "akatsuki_castle", "saika_castle"] },
        vassals: [
            { name: "Род Сейрю", image: "images/vassal_seiryu.png", color: "#ffaa66", settlements: ["hida", "zagami", "mabuki"] },
            { name: "Род Нодакэта", image: "images/vassal_nodaketa.png", color: "#ff8866", settlements: ["akai_castle", "ujo", "momo"] },
            { name: "Род Юрей", image: "images/vassal_yurai.png", color: "#ffaa88", settlements: ["kumo_castle", "hanaeri", "hara"] },
            { name: "Род Юмэ", image: "images/vassal_yume.png", color: "#ffccaa", settlements: ["ouichi"] },
            { name: "Род Сэнпу", image: "images/vassal_senpu.png", color: "#ffaa66", settlements: ["zaza"] },
            { name: "Род Уми", image: "images/vassal_umi.png", color: "#ffcc66", settlements: ["taka", "miki"] },
            { name: "Род Гэккэн", image: "images/vassal_gekken.png", color: "#ffaa99", settlements: ["mizu"] }
        ]
    },
    county_markarn: {
        main: { name: "Род Маркарн", image: "images/holdings_markarn.png", color: "#4a90d9", settlements: ["klenogard", "tumoros_castle", "vetrol_castle", "lotosway", "krustar", "torono", "furinko", "gornosa", "hogava", "mitt"] },
        vassals: [ { name: "Виконтство Рунхеймов", image: "images/vassal_runheim.png", color: "#66aaff", settlements: ["sweep_castle", "zhuravno", "nadzu", "eno", "dzu", "dza", "lino"] } ]
    },
    county_vogelmark: {
        main: { name: "Род Фогельмарк", image: "images/holdings_vogelmark.png", color: "#4a90d9", settlements: ["vogelsburg", "vill_castle", "rosenthal_castle", "birchbark", "nakhidko", "elfenwald", "vogelsang", "rosen", "lindenfurt", "blackforest"] },
        vassals: []
    },
    principality_gorski: {
        main: { name: "Род Горски", image: "images/holdings_gorski.png", color: "#8b4513", settlements: ["gorsk", "chatte_castle", "hawksley", "redbrook", "winter", "meadow", "glen", "verbruk", "kenfor", "holm", "oak"] },
        vassals: [ { name: "Виконтство Воронецких", image: "images/vassal_voronetsky.png", color: "#aa6633", settlements: ["stein", "rosen_castle", "dale", "rest", "aifil", "lugvin", "branibor", "rozdyan", "division"] } ]
    },
    regency_council: {
        main: { name: "Совет регентов", image: "images/holdings_regents.png", color: "#cfc294", settlements: ["yaramo", "hinode", "mizugaki", "westmar_castle", "walden_castle", "nijo_castle", "ruga_castle", "truck_truck", "hawksley_metro", "namina", "milton", "minari", "unmarch", "verbruk_metro", "track_track", "takao", "nasaki", "mill", "fuka", "ilver", "greenh"] },
        vassals: [ { name: "Великий Вал", image: "images/holdings_great_shaft.png", color: "#aa9988", settlements: ["main_gate", "southern_citadel", "red_citadel", "small_gate", "signal_tower", "main_citadel", "northern_signal_tower", "north_gate", "south_gate", "ruins", "northern_outpost", "village_edge", "femal_village", "armas_village"] } ]
    },
    lepus_union: {
        main: { name: "Союз Лепус", image: "images/holdings_lepus.png", color: "#6a9fb5", settlements: ["leporis_city", "leporis_north", "leporis_lake", "leporis_fort"] },
        vassals: []
    }
};

// ========== 4. ФУНКЦИИ УПРАВЛЕНИЯ МАСКАМИ ==========
function clearMasks() {
    if (!map) return;
    if (typeof currentActiveMasks === 'undefined') return;
    if (typeof map !== 'undefined' && map) {
        currentActiveMasks.forEach(mask => { if (map.hasLayer(mask)) map.removeLayer(mask); });
    }
    currentActiveMasks = [];
}

// ========== 5. ФУНКЦИЯ ПОКАЗА МАСОК РИТОРИКИ ==========
function showRhetoricMasks(rhetoricId = "all") {
    if (typeof map === 'undefined' || !map) {
        console.warn("showRhetoricMasks: карта не инициализирована");
        return;
    }
    clearMasks();
    const bounds = [[0, 0], [MAP_HEIGHT, MAP_WIDTH]];
    for (let mask of window.rhetoricMasks) {
        if (rhetoricId !== "all" && mask.rhetoricId !== rhetoricId) continue;
        if (!mask.visible) continue;
        const overlay = L.imageOverlay(mask.image, bounds, { opacity: mask.opacity || 0.6 });
        overlay.addTo(map);
        currentActiveMasks.push(overlay);
    }
}

// ========== 6. ФУНКЦИЯ ПОКАЗА МАСОК ВЛАДЕНИЙ ==========
function showHoldingsMask(factionId = "all") {
    if (typeof map === 'undefined' || !map) {
        console.warn("showHoldingsMask: карта не инициализирована");
        return;
    }
    clearMasks();
    const bounds = [[0, 0], [MAP_HEIGHT, MAP_WIDTH]];
    for (let holding of window.holdingsMasks) {
        if (factionId !== "all" && holding.factionId !== factionId) continue;
        if (!holding.visible) continue;
        const overlay = L.imageOverlay(holding.image, bounds, { opacity: holding.opacity || 0.6 });
        overlay.addTo(map);
        currentActiveMasks.push(overlay);
    }
}

// ========== 7. ФУНКЦИЯ ПОКАЗА МАСОК ВАССАЛОВ ==========
function showVassalsMask(factionId, showMain = true, showVassals = true) {
    if (!map) {
        console.warn("showVassalsMask: карта не инициализирована");
        return;
    }
    
    // 1. Принудительно удаляем все старые маски из карты и очищаем массив
    if (currentActiveMasks && currentActiveMasks.length) {
        currentActiveMasks.forEach(mask => {
            if (map.hasLayer(mask)) map.removeLayer(mask);
        });
        currentActiveMasks = [];
    }
    
    const bounds = [[0, 0], [MAP_HEIGHT, MAP_WIDTH]];
    
    // Функция для добавления одного оверлея
    const addOverlay = (imageUrl) => {
        if (!imageUrl) return;
        const overlay = L.imageOverlay(imageUrl, bounds, { opacity: 0.6 });
        overlay.addTo(map);
        currentActiveMasks.push(overlay);
    };
    
    if (factionId === "all") {
        // Показать всех вассалов всех фракций
        for (let fid in window.vassalsMasks) {
            const factionVassals = window.vassalsMasks[fid];
            if (!factionVassals) continue;
            if (showMain && factionVassals.main) {
                addOverlay(factionVassals.main.image);
            }
            if (showVassals && factionVassals.vassals) {
                for (let vassal of factionVassals.vassals) {
                    addOverlay(vassal.image);
                }
            }
        }
        return;
    }
    
    // Одна фракция
    const factionVassals = window.vassalsMasks[factionId];
    if (!factionVassals) return;
    if (showMain && factionVassals.main) {
        addOverlay(factionVassals.main.image);
    }
    if (showVassals && factionVassals.vassals) {
        for (let vassal of factionVassals.vassals) {
            addOverlay(vassal.image);
        }
    }
}

// ========== 8. ФУНКЦИИ ПОСТРОЕНИЯ ЧЕКЛИСТОВ ==========
function buildRhetoricChecklist() {
    const container = document.getElementById('rhetoricChecklist');
    if (!container) return;
    container.innerHTML = '';
    for (let m of window.rhetoricMasks) {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        div.style.cssText = 'display: flex; align-items: center; gap: 8px; margin: 6px 0;';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.id = `chk_rh_${m.name.replace(/\s/g, '_')}`;
        cb.checked = m.visible;
        cb.addEventListener('change', (e) => {
            m.visible = e.target.checked;
            if (typeof activeTab !== 'undefined' && activeTab === 'rhetoric') {
                showRhetoricMasks('all');
            }
        });
        const label = document.createElement('label');
        label.htmlFor = cb.id;
        label.textContent = m.name;
        label.style.cssText = 'cursor: pointer;';
        div.appendChild(cb);
        div.appendChild(label);
        container.appendChild(div);
    }
    let infoDiv = document.getElementById('rhetoricInfo');
    if (!infoDiv) {
        infoDiv = document.createElement('div');
        infoDiv.id = 'rhetoricInfo';
        infoDiv.style.cssText = 'font-size: 0.7rem; color: #8a7a5a; margin-top: 10px; text-align: center; border-top: 1px solid #b87c4f; padding-top: 8px;';
        container.appendChild(infoDiv);
    }
    function updateRhetoricInfo() {
        const visibleMasks = window.rhetoricMasks.filter(m => m.visible);
        if (visibleMasks.length === 0) infoDiv.innerHTML = '⚠️ Нет активных масок';
        else if (visibleMasks.length === 1) infoDiv.innerHTML = `🖼️ Активна: ${visibleMasks[0].name}`;
        else infoDiv.innerHTML = `🖼️ Активны ${visibleMasks.length} масок`;
    }
    updateRhetoricInfo();
    window.updateRhetoricInfo = updateRhetoricInfo;
}

function buildHoldingsChecklist() {
    const container = document.getElementById('holdingsChecklist');
    if (!container) return;
    container.innerHTML = '';
    for (let m of window.holdingsMasks) {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.id = `chk_hold_${m.name.replace(/\s/g, '_')}`;
        cb.checked = m.visible;
        cb.addEventListener('change', (e) => {
            m.visible = e.target.checked;
            if (typeof activeTab !== 'undefined' && activeTab === 'holdings') {
                showHoldingsMask('all');
            }
        });
        const label = document.createElement('label');
        label.htmlFor = cb.id;
        label.textContent = m.name;
        div.appendChild(cb);
        div.appendChild(label);
        container.appendChild(div);
    }
}

function updateVassalChecklist() {
    const container = document.getElementById('vassalsChecklist');
    if (!container) return;
    const selectedFaction = document.getElementById('vassalFactionSelect')?.value || "clan_daketa";
    
    if (selectedFaction === "all") {
        container.innerHTML = '<div style="color:#ffd966;">🌍 Показаны все вассалы всех фракций</div>';
        return;
    }
    
    const factionVassals = window.vassalsMasks[selectedFaction];
    if (!factionVassals) { container.innerHTML = '<div>Нет данных о вассалах</div>'; return; }
    
    let html = `<div class="checkbox-item"><input type="checkbox" id="vassal_show_main" checked><label for="vassal_show_main">🏯 ${factionVassals.main.name} (главный род)</label></div>`;
    for (let vassal of factionVassals.vassals) {
        const safeId = vassal.name.replace(/\s/g, '_').replace(/[()]/g, '');
        html += `<div class="checkbox-item"><input type="checkbox" id="vassal_${safeId}" class="vassal-checkbox" checked><label for="vassal_${safeId}">🛡️ ${vassal.name}</label></div>`;
    }
    container.innerHTML = html;
    
    const showMainCheckbox = document.getElementById('vassal_show_main');
    if (showMainCheckbox) showMainCheckbox.addEventListener('change', (e) => showVassalsMask(selectedFaction, e.target.checked, true));
    document.querySelectorAll('.vassal-checkbox').forEach(cb => cb.addEventListener('change', () => showVassalsMask(selectedFaction, true, true)));
}

// Экспорт функций для внешних вызовов
window.clearMasks = clearMasks;
window.showRhetoricMasks = showRhetoricMasks;
window.showHoldingsMask = showHoldingsMask;
window.showVassalsMask = showVassalsMask;
window.buildRhetoricChecklist = buildRhetoricChecklist;
window.buildHoldingsChecklist = buildHoldingsChecklist;
window.updateVassalChecklist = updateVassalChecklist;

console.log("✅ 16_masks_config.js загружен — маски и функции управления слоями");