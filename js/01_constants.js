// ============================================================================
// МОДУЛЬ 01: constants.js
// Все константы игры (названия, типы, настройки) – КРОМЕ ДАННЫХ О ФРАКЦИЯХ
// Данные о фракциях вынесены в 17_constants_factions.js
// ВЕРСИЯ 2.0 – ПОЛНЫЙ SETTLEMENTS_DB
// ============================================================================

// ========== 1. ВРЕМЯ И ДАТЫ ==========
const MONTH_NAMES = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

// ========== 2. ПРОВИНЦИИ (устаревший список) ==========
const PROVINCE_IDS = ["clan_daketa", "county_markarn", "principality_gorski", "regency_council"];

// ========== 3. СОВЕТ: ТИПЫ ВАССАЛОВ ==========
const VASSAL_TYPES = {
    MAJOR_CLAN: { name: "Крупный клан", baseInfluence: 40, minInfluence: 10, maxInfluence: 80 },
    MEDIUM_CLAN: { name: "Средний клан", baseInfluence: 20, minInfluence: 5, maxInfluence: 50 },
    MINOR_CLAN: { name: "Малый клан", baseInfluence: 10, minInfluence: 2, maxInfluence: 30 },
    NOBLE_HOUSE: { name: "Дворянский дом", baseInfluence: 15, minInfluence: 3, maxInfluence: 40 },
    RELIGIOUS_ORDER: { name: "Религиозный орден", baseInfluence: 25, minInfluence: 5, maxInfluence: 60 },
    MERCHANT_GUILD: { name: "Купцовая гильдия", baseInfluence: 20, minInfluence: 5, maxInfluence: 50 }
};

// ========== 4. СОВЕТ: ПОЛИТИЧЕСКИЕ ФРАКЦИИ ==========
const POLITICAL_FACTIONS = {
    MILITARY: { name: "Военная партия", color: "#ff6b6b" },
    TRADITIONAL: { name: "Традиционалисты", color: "#b87c4f" },
    REFORMISTS: { name: "Реформаторы", color: "#8bc34a" },
    MERCHANTS: { name: "Торговая гильдия", color: "#ffd966" },
    RELIGIOUS: { name: "Церковная партия", color: "#c9a87b" },
    NEUTRAL: { name: "Независимые", color: "#cfc294" }
};

// ========== 5. СОВЕТ: ТИПЫ ДЕЙСТВИЙ ==========
const ACTION_TYPES = {
    WAR_DECLARATION: "war_declaration",
    PEACE_TREATY: "peace_treaty",
    BUILDING_CONSTRUCTED: "building_constructed",
    BUILDING_DESTROYED: "building_destroyed",
    REFORM_PASSED: "reform_passed",
    TERRITORY_GAINED: "territory_gained",
    TERRITORY_LOST: "territory_lost",
    TRADE_AGREEMENT: "trade_agreement",
    DIPLOMATIC_INSULT: "diplomatic_insult",
    BATTLE_WON: "battle_won",
    BATTLE_LOST: "battle_lost",
    CHARACTER_LEVEL_UP: "character_level_up",
    RELIGIOUS_CONVERSION: "religious_conversion",
    FACTION_LEADER_ACTION: "faction_leader_action"
};

// ========== 6. СОВЕТ: КОЛИЧЕСТВО МЕСТ ==========
const TOTAL_COUNCIL_SEATS = 300;

// ========== 7. ПОСТРОЙКИ: ТИПЫ ПОСЕЛЕНИЙ ==========
const SETTLEMENT_TYPES = {
    city: { name: "Город", slots: 6 },
    village: { name: "Деревня", slots: 2 },
    castle: { name: "Замок", slots: 3 }
};

// ========== 8. КАРТА: ПАРАМЕТРЫ ==========
const MAP_WIDTH = 3999;
const MAP_HEIGHT = 2588;
const KM_PER_PIXEL = 1;

// ========== 9. КАРТА: СКОРОСТИ ПЕРЕДВИЖЕНИЯ ==========
const SPEEDS = {
    land: 210,
    dirt: 140,
    naval: 400,
    wyvern: 700,
    orlan: 800
};

// ========== 10. КАРТА: ЗОНЫ ЗАМЕДЛЕНИЯ ==========
const ZONE_SLOWDOWN = { red: 0.5, blue: 0.7, yellow: 0.8 };
const ZONE_COLORS = {
    red: 'rgba(255, 0, 0, 0.3)',
    blue: 'rgba(0, 100, 255, 0.3)',
    yellow: 'rgba(255, 255, 0, 0.3)'
};

// ========== 11. КАРТА: ЦВЕТА МАРШРУТОВ ==========
const ROUTE_COLORS = {
    land: '#ffcc44',
    dirt: '#cc6633',
    naval: '#44aaff',
    wyvern: '#dd88ff',
    orlan: '#ff4444'
};

// ========== 12. ПУТИ К ИКОНКАМ ==========
const ICON_PATHS = {
    wood: 'icons/wood.png',
    stone: 'icons/stone.png',
    iron: 'icons/iron.png',
    gold: 'icons/gold.png',
    ers: 'icons/ers.png',
    default_city: 'icons/default_city.png',
    armoria: 'icons/armoria.png',
    kiso: 'icons/Kiso.png',
    kikio: 'icons/kikio.png',
    saito: 'icons/Saito.png',
    viva: 'icons/Viva.png',
    armorian: 'icons/armorian.png',
    zaza: 'icons/Zaza.png',
    ouichi: 'icons/ouichi.png',
    markarn: 'icons/Markarn.png',
    leono: 'icons/Leono.png',
    takeda_coat: 'icons/takeda_coat.png',
    uesugi_coat: 'icons/uesugi_coat.png',
    hojo_coat: 'icons/hojo_coat.png',
    imagawa_coat: 'icons/imagawa_coat.png',
    sanada_coat: 'icons/sanada_coat.png',
    merchant_coat: 'icons/merchant_coat.png',
    religious_coat: 'icons/religious_coat.png',
    takeda_portrait: 'icons/takeda_portrait.png',
    uesugi_portrait: 'icons/uesugi_portrait.png',
    hojo_portrait: 'icons/hojo_portrait.png',
    imagawa_portrait: 'icons/imagawa_portrait.png',
    sanada_portrait: 'icons/sanada_portrait.png',
    merchant_portrait: 'icons/merchant_portrait.png',
    religious_portrait: 'icons/religious_portrait.png',
    default_portrait: 'icons/default_portrait.png',
    default_coat: 'icons/default_coat.png'
};

function getIconPath(iconName, fallbackEmoji = '🖼️') {
    const path = ICON_PATHS[iconName];
    if (!path) {
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='24'%3E${fallbackEmoji}%3C/text%3E%3C/svg%3E`;
    }
    return path;
}

// ========== 13. ФРАКЦИИ ДЛЯ АРМИИ (устаревшее) ==========
const ARMY_FACTIONS = {
    dayo: "Кланы Даё",
    loyal: "Лоялисты",
    neutral: "Нейтралы",
    proyurgan: "Проюрганцы",
    regency: "Совет регентов",
    lepus: "Союз Лепус"
};

// ========== 14. ФОНОВОЕ ИЗОБРАЖЕНИЕ КАРТЫ ==========
const BG_LAYER = 'images/Karta_countries.png';

// ========== 15. ФУНКЦИИ ФОРМАТИРОВАНИЯ ==========
function fmtDistance(km) {
    if (km === undefined || km === null) return '0 км';
    return Math.floor(km).toLocaleString('ru-RU') + ' км';
}
function fmtTurns(turns) {
    if (turns === undefined || turns === null) return '0 ходов';
    return turns.toFixed(1) + ' ходов';
}
function totalTurnsBasic(points, segments) {
    let total = 0;
    for (let i = 0; i < points.length - 1; i++) {
        const dx = (points[i].lng - points[i+1].lng) * (KM_PER_PIXEL || 1);
        const dy = (points[i].lat - points[i+1].lat) * (KM_PER_PIXEL || 1);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = SPEEDS[segments[i]] || SPEEDS.land;
        total += dist / speed;
    }
    return total;
}
function getUnitIconPath(iconName) {
    if (!iconName) return null;
    if (iconName.startsWith('icons/') || iconName.startsWith('http') || iconName.startsWith('data:')) return iconName;
    return 'icons/' + iconName;
}

// ========== 16. НАЗВАНИЯ ПРОВИНЦИЙ (РУССКИЕ) ==========
const PROVINCE_NAMES = {
    orochima: "Орочима",
    kaya: "Кайя",
    vogel: "Фогель",
    neolania: "Неолания",
    metropolitan_area: "Столичная область",
    great_shaft: "Великий Вал",
    leporis: "Лепорис",
    regent_city: "Области регентства",
    gorskin: "Горския"
};

// ========== 17. БАЗА ВСЕХ ПОСЕЛЕНИЙ (ПОЛНАЯ) ==========
const SETTLEMENTS_DB = {
    // ========== ОРОЧИМА (Клан Дакэта, Даё) ==========
    "nobuno": { id: "nobuno", name: "Нобуно", type: "city", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1030, py: 725, icon: "armoria.png", isVassal: false, vassalHouse: null },
    "hida": { id: "hida", name: "Хида", type: "city", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1170, py: 720, icon: "Viva.png", isVassal: true, vassalHouse: "house_seiryu" },
    "akatsuki_castle": { id: "akatsuki_castle", name: "Замок Акацуки", type: "castle", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 960, py: 820, icon: "armoria.png", isVassal: false, vassalHouse: null },
    "saika_castle": { id: "saika_castle", name: "Замок Сайка", type: "castle", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1190, py: 900, icon: "armoria.png", isVassal: false, vassalHouse: null },
    "akai_castle": { id: "akai_castle", name: "Замок Акай", type: "castle", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1110, py: 870, icon: "armorian.png", isVassal: true, vassalHouse: "house_nodaketa" },
    "kumo_castle": { id: "kumo_castle", name: "Замок Кумо", type: "castle", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 940, py: 645, icon: "Kiso.png", isVassal: true, vassalHouse: "house_yurai" },
    "yukisaki": { id: "yukisaki", name: "Деревня Юкисаки", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 995, py: 730, icon: "armoria.png", isVassal: false, vassalHouse: null },
    "shiratori": { id: "shiratori", name: "Деревня Сиратори", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 960, py: 790, icon: "armoria.png", isVassal: false, vassalHouse: null },
    "kuramura": { id: "kuramura", name: "Деревня Курамура", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1000, py: 837, icon: "armoria.png", isVassal: false, vassalHouse: null },
    "chiga": { id: "chiga", name: "Деревня Чига", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1160, py: 870, icon: "armoria.png", isVassal: false, vassalHouse: null },
    "eri": { id: "eri", name: "Деревня Ёри", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1124, py: 716, icon: "armoria.png", isVassal: false, vassalHouse: null },
    "yomizu": { id: "yomizu", name: "Деревня Ёмидзу", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1140, py: 660, icon: "armoria.png", isVassal: false, vassalHouse: null },
    "kiyomizu": { id: "kiyomizu", name: "Деревня Киёмидзу", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1155, py: 565, icon: "armoria.png", isVassal: false, vassalHouse: null },
    "tsukimi": { id: "tsukimi", name: "Деревня Цукими", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1065, py: 560, icon: "armoria.png", isVassal: false, vassalHouse: null },
    "zagami": { id: "zagami", name: "Деревня Зэгами", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1155, py: 760, icon: "Viva.png", isVassal: true, vassalHouse: "house_seiryu" },
    "mabuki": { id: "mabuki", name: "Деревня Мабуки", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1187, py: 655, icon: "Viva.png", isVassal: true, vassalHouse: "house_seiryu" },
    "ouichi": { id: "ouichi", name: "Деревня Оичи", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1210, py: 815, icon: "ouichi.png", isVassal: true, vassalHouse: "house_yume" },
    "zaza": { id: "zaza", name: "Деревня Зухама", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1080, py: 790, icon: "Zaza.png", isVassal: true, vassalHouse: "house_senpu" },
    "ujo": { id: "ujo", name: "Деревня Удзё", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1100, py: 840, icon: "armorian.png", isVassal: true, vassalHouse: "house_nodaketa" },
    "momo": { id: "momo", name: "Деревня Момо", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1060, py: 875, icon: "armorian.png", isVassal: true, vassalHouse: "house_nodaketa" },
    "taka": { id: "taka", name: "Деревня Така", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 906, py: 730, icon: "Saito.png", isVassal: true, vassalHouse: "house_umi" },
    "miki": { id: "miki", name: "Деревня Мики", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 880, py: 740, icon: "Saito.png", isVassal: true, vassalHouse: "house_umi" },
    "hanaeri": { id: "hanaeri", name: "Деревня Ханаёри", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 910, py: 640, icon: "Kiso.png", isVassal: true, vassalHouse: "house_yurai" },
    "hara": { id: "hara", name: "Деревня Хара", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1000, py: 677, icon: "Kiso.png", isVassal: true, vassalHouse: "house_yurai" },
    "mizu": { id: "mizu", name: "Деревня Мидзу", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 975, py: 580, icon: "kikio.png", isVassal: true, vassalHouse: "house_gekken" },

    // ========== КАЙЯ ==========
    "klenogard": { id: "klenogard", name: "Кленогард", type: "city", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1680, py: 1370, icon: "Markarn.png", isVassal: false, vassalHouse: null },
    "tumoros_castle": { id: "tumoros_castle", name: "Замок Туморос", type: "castle", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1815, py: 1045, icon: "Markarn.png", isVassal: false, vassalHouse: null },
    "vetrol_castle": { id: "vetrol_castle", name: "Замок Ветрол", type: "castle", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1880, py: 1120, icon: "Markarn.png", isVassal: false, vassalHouse: null },
    "sweep_castle": { id: "sweep_castle", name: "Замок Журавель", type: "castle", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1636, py: 987, icon: "Leono.png", isVassal: true, vassalHouse: "viscountcy_runheim" },
    "lotosway": { id: "lotosway", name: "Деревня Лотосвей", type: "village", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1725, py: 1365, icon: "Markarn.png", isVassal: false, vassalHouse: null },
    "krustar": { id: "krustar", name: "Деревня Хрустар", type: "village", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1700, py: 1310, icon: "Markarn.png", isVassal: false, vassalHouse: null },
    "torono": { id: "torono", name: "Деревня Тороно", type: "village", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1745, py: 1235, icon: "Markarn.png", isVassal: false, vassalHouse: null },
    "furinko": { id: "furinko", name: "Деревня Фуринко", type: "village", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1800, py: 1293, icon: "Markarn.png", isVassal: false, vassalHouse: null },
    "gornosa": { id: "gornosa", name: "Деревня Горноса", type: "village", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1710, py: 1170, icon: "Markarn.png", isVassal: false, vassalHouse: null },
    "hogava": { id: "hogava", name: "Деревня Хогава", type: "village", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1660, py: 1170, icon: "Markarn.png", isVassal: false, vassalHouse: null },
    "mitt": { id: "mitt", name: "Деревня Митт", type: "village", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1745, py: 1135, icon: "Markarn.png", isVassal: false, vassalHouse: null },
    "zhuravno": { id: "zhuravno", name: "Деревня Журавлино", type: "village", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1710, py: 1053, icon: "Leono.png", isVassal: true, vassalHouse: "viscountcy_runheim" },
    "nadzu": { id: "nadzu", name: "Деревня Надзу", type: "village", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1620, py: 1070, icon: "Leono.png", isVassal: true, vassalHouse: "viscountcy_runheim" },
    "eno": { id: "eno", name: "Деревня Эно", type: "village", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1585, py: 1053, icon: "Leono.png", isVassal: true, vassalHouse: "viscountcy_runheim" },
    "dzu": { id: "dzu", name: "Деревня Дзу", type: "village", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1615, py: 1110, icon: "Leono.png", isVassal: true, vassalHouse: "viscountcy_runheim" },
    "dza": { id: "dza", name: "Деревня Дза", type: "village", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1620, py: 1150, icon: "Leono.png", isVassal: true, vassalHouse: "viscountcy_runheim" },
    "lino": { id: "lino", name: "Деревня Лино", type: "village", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1650, py: 1110, icon: "Leono.png", isVassal: true, vassalHouse: "viscountcy_runheim" },

    // ========== ФОГЕЛЬ ==========
    "vogelsburg": { id: "vogelsburg", name: "Фогельсбург", type: "city", province: "vogel", faction: "county_vogelmark", rhetoric: "loyal", px: 1785, py: 220, icon: "Vogelmark.png", isVassal: false, vassalHouse: null },
    "vill_castle": { id: "vill_castle", name: "Замок Вилл", type: "castle", province: "vogel", faction: "county_vogelmark", rhetoric: "loyal", px: 1760, py: 262, icon: "Vogelmark.png", isVassal: false, vassalHouse: null },
    "rosenthal_castle": { id: "rosenthal_castle", name: "Замок Розенталь", type: "castle", province: "vogel", faction: "county_vogelmark", rhetoric: "loyal", px: 1900, py: 227, icon: "Vogelmark.png", isVassal: false, vassalHouse: null },
    "birchbark": { id: "birchbark", name: "Деревня Берестень", type: "village", province: "vogel", faction: "county_vogelmark", rhetoric: "loyal", px: 1783, py: 315, icon: "Vogelmark.png", isVassal: false, vassalHouse: null },
    "nakhidko": { id: "nakhidko", name: "Деревня Нахидко", type: "village", province: "vogel", faction: "county_vogelmark", rhetoric: "loyal", px: 1820, py: 306, icon: "Vogelmark.png", isVassal: false, vassalHouse: null },
    "elfenwald": { id: "elfenwald", name: "Деревня Эльфенвальд", type: "village", province: "vogel", faction: "county_vogelmark", rhetoric: "loyal", px: 1843, py: 273, icon: "Vogelmark.png", isVassal: false, vassalHouse: null },
    "vogelsang": { id: "vogelsang", name: "Деревня Фогельзанг", type: "village", province: "vogel", faction: "county_vogelmark", rhetoric: "loyal", px: 1840, py: 190, icon: "Vogelmark.png", isVassal: false, vassalHouse: null },
    "rosen": { id: "rosen", name: "Деревня Розен", type: "village", province: "vogel", faction: "county_vogelmark", rhetoric: "loyal", px: 1935, py: 217, icon: "Vogelmark.png", isVassal: false, vassalHouse: null },
    "lindenfurt": { id: "lindenfurt", name: "Деревня Линденфурт", type: "village", province: "vogel", faction: "county_vogelmark", rhetoric: "loyal", px: 1932, py: 255, icon: "Vogelmark.png", isVassal: false, vassalHouse: null },
    "blackforest": { id: "blackforest", name: "Деревня Шварцвей", type: "village", province: "vogel", faction: "county_vogelmark", rhetoric: "loyal", px: 1985, py: 286, icon: "Vogelmark.png", isVassal: false, vassalHouse: null },

    // ========== НЕОЛАНИЯ ==========
    "gorsk": { id: "gorsk", name: "Горск", type: "city", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3203, py: 945, icon: "Gorski.png", isVassal: false, vassalHouse: null },
    "chatte_castle": { id: "chatte_castle", name: "Замок Шатте", type: "castle", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3265, py: 1158, icon: "Gorski.png", isVassal: false, vassalHouse: null },
    "stein": { id: "stein", name: "Штайн", type: "city", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3022, py: 1060, icon: "Voronetsky.png", isVassal: true, vassalHouse: "viscountcy_voronetsky" },
    "rosen_castle": { id: "rosen_castle", name: "Замок Розен", type: "castle", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3033, py: 1100, icon: "Voronetsky.png", isVassal: true, vassalHouse: "viscountcy_voronetsky" },
    "hawksley": { id: "hawksley", name: "Деревня Хоксли", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3224, py: 983, icon: "Gorski.png", isVassal: false, vassalHouse: null },
    "redbrook": { id: "redbrook", name: "Деревня Редбрук", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3272, py: 986, icon: "Gorski.png", isVassal: false, vassalHouse: null },
    "winter": { id: "winter", name: "Деревня Уинтер", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3325, py: 1007, icon: "Gorski.png", isVassal: false, vassalHouse: null },
    "meadow": { id: "meadow", name: "Деревня Мейдоу", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3258, py: 1055, icon: "Gorski.png", isVassal: false, vassalHouse: null },
    "glen": { id: "glen", name: "Деревня Глен", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3328, py: 1082, icon: "Gorski.png", isVassal: false, vassalHouse: null },
    "verbruk": { id: "verbruk", name: "Деревня Вербрук", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3371, py: 1122, icon: "Gorski.png", isVassal: false, vassalHouse: null },
    "kenfor": { id: "kenfor", name: "Деревня Кенфор", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3316, py: 1184, icon: "Gorski.png", isVassal: false, vassalHouse: null },
    "holm": { id: "holm", name: "Деревня Хольм", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3181, py: 1163, icon: "Gorski.png", isVassal: false, vassalHouse: null },
    "oak": { id: "oak", name: "Деревня Оук", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3384, py: 1179, icon: "Gorski.png", isVassal: false, vassalHouse: null },
    "dale": { id: "dale", name: "Деревня Дейл", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3079, py: 1018, icon: "Voronetsky.png", isVassal: true, vassalHouse: "viscountcy_voronetsky" },
    "rest": { id: "rest", name: "Деревня Рест", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3115, py: 1120, icon: "Voronetsky.png", isVassal: true, vassalHouse: "viscountcy_voronetsky" },
    "aifil": { id: "aifil", name: "Деревня Айфил", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3000, py: 992, icon: "Voronetsky.png", isVassal: true, vassalHouse: "viscountcy_voronetsky" },
    "lugvin": { id: "lugvin", name: "Деревня Лугвин", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 2955, py: 1082, icon: "Voronetsky.png", isVassal: true, vassalHouse: "viscountcy_voronetsky" },
    "branibor": { id: "branibor", name: "Деревня Бранибор", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 2938, py: 1135, icon: "Voronetsky.png", isVassal: true, vassalHouse: "viscountcy_voronetsky" },
    "rozdyan": { id: "rozdyan", name: "Деревня Роздян", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 2990, py: 1114, icon: "Voronetsky.png", isVassal: true, vassalHouse: "viscountcy_voronetsky" },
    "division": { id: "division", name: "Деревня Дивид", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 2985, py: 1165, icon: "Voronetsky.png", isVassal: true, vassalHouse: "viscountcy_voronetsky" },

    // ========== СТОЛИЧНАЯ ОБЛАСТЬ ==========
    "yaramo": { id: "yaramo", name: "Ярамо", type: "city", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2030, py: 900, icon: "Regents.png", isVassal: false, vassalHouse: null },
    "hinode": { id: "hinode", name: "Хинодэ", type: "city", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2000, py: 1055, icon: "Regents.png", isVassal: false, vassalHouse: null },
    "mizugaki": { id: "mizugaki", name: "Мидзугаки", type: "city", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2062, py: 1315, icon: "Regents.png", isVassal: false, vassalHouse: null },
    "westmar_castle": { id: "westmar_castle", name: "Замок Вестмар", type: "castle", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 1988, py: 977, icon: "Regents.png", isVassal: false, vassalHouse: null },
    "walden_castle": { id: "walden_castle", name: "Замок Вальден", type: "castle", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 1932, py: 1131, icon: "Regents.png", isVassal: false, vassalHouse: null },
    "nijo_castle": { id: "nijo_castle", name: "Замок Нидзё", type: "castle", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2180, py: 943, icon: "Regents.png", isVassal: false, vassalHouse: null },
    "ruga_castle": { id: "ruga_castle", name: "Замок Руга", type: "castle", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2284, py: 1190, icon: "Regents.png", isVassal: false, vassalHouse: null },
    "truck_truck": { id: "truck_truck", name: "Деревня Фуру-фуру", type: "village", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 1980, py: 940, icon: "Regents.png", isVassal: false, vassalHouse: null },
    "hawksley_metro": { id: "hawksley_metro", name: "Деревня Хоксли", type: "village", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 1978, py: 1173, icon: "Regents.png", isVassal: false, vassalHouse: null },
    "namina": { id: "namina", name: "Деревня Намина", type: "village", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2112, py: 930, icon: "Regents.png", isVassal: false, vassalHouse: null },
    "milton": { id: "milton", name: "Деревня Милтон", type: "village", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2090, py: 943, icon: "Regents.png", isVassal: false, vassalHouse: null },
    "minari": { id: "minari", name: "Деревня Минари", type: "village", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2098, py: 970, icon: "Regents.png", isVassal: false, vassalHouse: null },
    "unmarch": { id: "unmarch", name: "Деревня Унмарш", type: "village", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2122, py: 1030, icon: "Regents.png", isVassal: false, vassalHouse: null },
    "verbruk_metro": { id: "verbruk_metro", name: "Деревня Вербрук", type: "village", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2184, py: 1120, icon: "Regents.png", isVassal: false, vassalHouse: null },
    "track_track": { id: "track_track", name: "Деревня Фару-фару", type: "village", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2218, py: 1233, icon: "Regents.png", isVassal: false, vassalHouse: null },
    "takao": { id: "takao", name: "Деревня Такао", type: "village", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2068, py: 867, icon: "Regents.png", isVassal: false, vassalHouse: null },
    "nasaki": { id: "nasaki", name: "Деревня Насаки", type: "village", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2126, py: 841, icon: "Regents.png", isVassal: false, vassalHouse: null },
    "mill": { id: "mill", name: "Деревня Милл", type: "village", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2050, py: 962, icon: "Regents.png", isVassal: false, vassalHouse: null },
    "fuka": { id: "fuka", name: "Деревня Фука", type: "village", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2011, py: 989, icon: "Regents.png", isVassal: false, vassalHouse: null },
    "ilver": { id: "ilver", name: "Деревня Илвер", type: "village", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2035, py: 1033, icon: "Regents.png", isVassal: false, vassalHouse: null },
    "greenh": { id: "greenh", name: "Деревня Гринх", type: "village", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2011, py: 1215, icon: "Regents.png", isVassal: false, vassalHouse: null },

    // ========== ВЕЛИКИЙ ВАЛ ==========
    "main_gate": { id: "main_gate", name: "Главные ворота", type: "castle", province: "great_shaft", faction: "regency_council", rhetoric: "neutral", px: 3100, py: 1942, icon: "wall.png", isVassal: true, vassalHouse: "great_wall" },
    "southern_citadel": { id: "southern_citadel", name: "Южная Цитадель", type: "castle", province: "great_shaft", faction: "regency_council", rhetoric: "neutral", px: 3036, py: 1914, icon: "wall.png", isVassal: true, vassalHouse: "great_wall" },
    "red_citadel": { id: "red_citadel", name: "Красная Цитадель", type: "castle", province: "great_shaft", faction: "regency_council", rhetoric: "neutral", px: 3090, py: 1915, icon: "wall.png", isVassal: true, vassalHouse: "great_wall" },
    "small_gate": { id: "small_gate", name: "Малые ворота", type: "castle", province: "great_shaft", faction: "regency_council", rhetoric: "neutral", px: 3118, py: 1970, icon: "wall.png", isVassal: true, vassalHouse: "great_wall" },
    "signal_tower": { id: "signal_tower", name: "Сигнальная башня", type: "castle", province: "great_shaft", faction: "regency_council", rhetoric: "neutral", px: 3158, py: 1968, icon: "wall.png", isVassal: true, vassalHouse: "great_wall" },
    "main_citadel": { id: "main_citadel", name: "Главная цитадель", type: "castle", province: "great_shaft", faction: "regency_council", rhetoric: "neutral", px: 3192, py: 1956, icon: "wall.png", isVassal: true, vassalHouse: "great_wall" },
    "northern_signal_tower": { id: "northern_signal_tower", name: "Северная сигнальная башня", type: "castle", province: "great_shaft", faction: "regency_council", rhetoric: "neutral", px: 3216, py: 1974, icon: "wall.png", isVassal: true, vassalHouse: "great_wall" },
    "north_gate": { id: "north_gate", name: "Северные ворота", type: "castle", province: "great_shaft", faction: "regency_council", rhetoric: "neutral", px: 3245, py: 2000, icon: "wall.png", isVassal: true, vassalHouse: "great_wall" },
    "south_gate": { id: "south_gate", name: "Южные ворота", type: "castle", province: "great_shaft", faction: "regency_council", rhetoric: "neutral", px: 3060, py: 1918, icon: "wall.png", isVassal: true, vassalHouse: "great_wall" },
    "ruins": { id: "ruins", name: "Руины", type: "village", province: "great_shaft", faction: "regency_council", rhetoric: "neutral", px: 3056, py: 1947, icon: "wall.png", isVassal: true, vassalHouse: "great_wall" },
    "northern_outpost": { id: "northern_outpost", name: "Северный аванпост", type: "village", province: "great_shaft", faction: "regency_council", rhetoric: "neutral", px: 3202, py: 2026, icon: "wall.png", isVassal: true, vassalHouse: "great_wall" },
    "village_edge": { id: "village_edge", name: "Деревня Край", type: "village", province: "great_shaft", faction: "regency_council", rhetoric: "neutral", px: 3051, py: 1881, icon: "wall.png", isVassal: true, vassalHouse: "great_wall" },
    "femal_village": { id: "femal_village", name: "Деревня Фемал", type: "village", province: "great_shaft", faction: "regency_council", rhetoric: "neutral", px: 3136, py: 1921, icon: "wall.png", isVassal: true, vassalHouse: "great_wall" },
    "armas_village": { id: "armas_village", name: "Деревня Армас", type: "village", province: "great_shaft", faction: "regency_council", rhetoric: "neutral", px: 3194, py: 1913, icon: "wall.png", isVassal: true, vassalHouse: "great_wall" },
    // ========== НЕЙТРАЛЬНЫЕ ПРОВИНЦИИ (временные заглушки) ==========
    // Провинция №1 (Oku Province No. 1) - Neutral
    "neutral_city1": { id: "neutral_city1", name: "Город1", type: "city", province: "oku_province_1", faction: "unknown_clan_1", rhetoric: "neutral", px: 353, py: 680, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_city2": { id: "neutral_city2", name: "Город2", type: "city", province: "oku_province_1", faction: "unknown_clan_1", rhetoric: "neutral", px: 378, py: 885, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village1": { id: "neutral_village1", name: "Деревня1", type: "village", province: "oku_province_1", faction: "unknown_clan_1", rhetoric: "neutral", px: 332, py: 715, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village2": { id: "neutral_village2", name: "Деревня2", type: "village", province: "oku_province_1", faction: "unknown_clan_1", rhetoric: "neutral", px: 364, py: 748, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village3": { id: "neutral_village3", name: "Деревня3", type: "village", province: "oku_province_1", faction: "unknown_clan_1", rhetoric: "neutral", px: 395, py: 706, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village4": { id: "neutral_village4", name: "Деревня4", type: "village", province: "oku_province_1", faction: "unknown_clan_1", rhetoric: "neutral", px: 275, py: 766, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village5": { id: "neutral_village5", name: "Деревня5", type: "village", province: "oku_province_1", faction: "unknown_clan_1", rhetoric: "neutral", px: 397, py: 920, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village6": { id: "neutral_village6", name: "Деревня6", type: "village", province: "oku_province_1", faction: "unknown_clan_1", rhetoric: "neutral", px: 441, py: 1091, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village7": { id: "neutral_village7", name: "Деревня7", type: "village", province: "oku_province_1", faction: "unknown_clan_1", rhetoric: "neutral", px: 578, py: 1091, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village8": { id: "neutral_village8", name: "Деревня8", type: "village", province: "oku_province_1", faction: "unknown_clan_1", rhetoric: "neutral", px: 294, py: 838, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village9": { id: "neutral_village9", name: "Деревня9", type: "village", province: "oku_province_1", faction: "unknown_clan_1", rhetoric: "neutral", px: 465, py: 805, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village10": { id: "neutral_village10", name: "Деревня10", type: "village", province: "oku_province_1", faction: "unknown_clan_1", rhetoric: "neutral", px: 367, py: 1088, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village11": { id: "neutral_village11", name: "Деревня11", type: "village", province: "oku_province_1", faction: "unknown_clan_1", rhetoric: "neutral", px: 531, py: 1088, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle1": { id: "neutral_castle1", name: "Замок1", type: "castle", province: "oku_province_1", faction: "unknown_clan_1", rhetoric: "neutral", px: 523, py: 765, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle2": { id: "neutral_castle2", name: "Замок2", type: "castle", province: "oku_province_1", faction: "unknown_clan_1", rhetoric: "neutral", px: 422, py: 702, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle3": { id: "neutral_castle3", name: "Замок3", type: "castle", province: "oku_province_1", faction: "unknown_clan_1", rhetoric: "neutral", px: 402, py: 947, icon: "draw.png", isVassal: false, vassalHouse: null },

    // Провинция №2 (Oku Province No. 2) - Neutral
    "neutral_city3": { id: "neutral_city3", name: "Город3", type: "city", province: "oku_province_2", faction: "unknown_clan_2", rhetoric: "neutral", px: 599, py: 556, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle4": { id: "neutral_castle4", name: "Замок4", type: "castle", province: "oku_province_2", faction: "unknown_clan_2", rhetoric: "neutral", px: 442, py: 587, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle5": { id: "neutral_castle5", name: "Замок5", type: "castle", province: "oku_province_2", faction: "unknown_clan_2", rhetoric: "neutral", px: 596, py: 757, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle6": { id: "neutral_castle6", name: "Замок6", type: "castle", province: "oku_province_2", faction: "unknown_clan_2", rhetoric: "neutral", px: 834, py: 583, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village12": { id: "neutral_village12", name: "Деревня12", type: "village", province: "oku_province_2", faction: "unknown_clan_2", rhetoric: "neutral", px: 393, py: 621, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village13": { id: "neutral_village13", name: "Деревня13", type: "village", province: "oku_province_2", faction: "unknown_clan_2", rhetoric: "neutral", px: 477, py: 566, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village14": { id: "neutral_village14", name: "Деревня14", type: "village", province: "oku_province_2", faction: "unknown_clan_2", rhetoric: "neutral", px: 492, py: 649, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village15": { id: "neutral_village15", name: "Деревня15", type: "village", province: "oku_province_2", faction: "unknown_clan_2", rhetoric: "neutral", px: 556, py: 636, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village16": { id: "neutral_village16", name: "Деревня16", type: "village", province: "oku_province_2", faction: "unknown_clan_2", rhetoric: "neutral", px: 614, py: 630, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village17": { id: "neutral_village17", name: "Деревня17", type: "village", province: "oku_province_2", faction: "unknown_clan_2", rhetoric: "neutral", px: 640, py: 573, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village18": { id: "neutral_village18", name: "Деревня18", type: "village", province: "oku_province_2", faction: "unknown_clan_2", rhetoric: "neutral", px: 713, py: 552, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village19": { id: "neutral_village19", name: "Деревня19", type: "village", province: "oku_province_2", faction: "unknown_clan_2", rhetoric: "neutral", px: 738, py: 604, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village20": { id: "neutral_village20", name: "Деревня20", type: "village", province: "oku_province_2", faction: "unknown_clan_2", rhetoric: "neutral", px: 564, py: 727, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village21": { id: "neutral_village21", name: "Деревня21", type: "village", province: "oku_province_2", faction: "unknown_clan_2", rhetoric: "neutral", px: 658, py: 651, icon: "draw.png", isVassal: false, vassalHouse: null },

    // Провинция №3 (Oku Province No. 3) - Neutral
    "neutral_city4": { id: "neutral_city4", name: "Город4", type: "city", province: "oku_province_3", faction: "unknown_clan_3", rhetoric: "neutral", px: 856, py: 996, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_city5": { id: "neutral_city5", name: "Город5", type: "city", province: "oku_province_3", faction: "unknown_clan_3", rhetoric: "neutral", px: 1016, py: 973, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle7": { id: "neutral_castle7", name: "Замок7", type: "castle", province: "oku_province_3", faction: "unknown_clan_3", rhetoric: "neutral", px: 631, py: 1018, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle8": { id: "neutral_castle8", name: "Замок8", type: "castle", province: "oku_province_3", faction: "unknown_clan_3", rhetoric: "neutral", px: 856, py: 811, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle9": { id: "neutral_castle9", name: "Замок9", type: "castle", province: "oku_province_3", faction: "unknown_clan_3", rhetoric: "neutral", px: 959, py: 918, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle10": { id: "neutral_castle10", name: "Замок10", type: "castle", province: "oku_province_3", faction: "unknown_clan_3", rhetoric: "neutral", px: 1115, py: 922, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village22": { id: "neutral_village22", name: "Деревня22", type: "village", province: "oku_province_3", faction: "unknown_clan_3", rhetoric: "neutral", px: 646, py: 822, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village23": { id: "neutral_village23", name: "Деревня23", type: "village", province: "oku_province_3", faction: "unknown_clan_3", rhetoric: "neutral", px: 626, py: 870, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village24": { id: "neutral_village24", name: "Деревня24", type: "village", province: "oku_province_3", faction: "unknown_clan_3", rhetoric: "neutral", px: 712, py: 1032, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village25": { id: "neutral_village25", name: "Деревня25", type: "village", province: "oku_province_3", faction: "unknown_clan_3", rhetoric: "neutral", px: 800, py: 1008, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village26": { id: "neutral_village26", name: "Деревня26", type: "village", province: "oku_province_3", faction: "unknown_clan_3", rhetoric: "neutral", px: 860, py: 922, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village27": { id: "neutral_village27", name: "Деревня27", type: "village", province: "oku_province_3", faction: "unknown_clan_3", rhetoric: "neutral", px: 998, py: 903, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village28": { id: "neutral_village28", name: "Деревня28", type: "village", province: "oku_province_3", faction: "unknown_clan_3", rhetoric: "neutral", px: 995, py: 991, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village29": { id: "neutral_village29", name: "Деревня29", type: "village", province: "oku_province_3", faction: "unknown_clan_3", rhetoric: "neutral", px: 988, py: 1069, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village30": { id: "neutral_village30", name: "Деревня30", type: "village", province: "oku_province_3", faction: "unknown_clan_3", rhetoric: "neutral", px: 1064, py: 975, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village31": { id: "neutral_village31", name: "Деревня31", type: "village", province: "oku_province_3", faction: "unknown_clan_3", rhetoric: "neutral", px: 1120, py: 993, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village32": { id: "neutral_village32", name: "Деревня32", type: "village", province: "oku_province_3", faction: "unknown_clan_3", rhetoric: "neutral", px: 1097, py: 1021, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village33": { id: "neutral_village33", name: "Деревня33", type: "village", province: "oku_province_3", faction: "unknown_clan_3", rhetoric: "neutral", px: 1075, py: 1059, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village34": { id: "neutral_village34", name: "Деревня34", type: "village", province: "oku_province_3", faction: "unknown_clan_3", rhetoric: "neutral", px: 1112, py: 1068, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village35": { id: "neutral_village35", name: "Деревня35", type: "village", province: "oku_province_3", faction: "unknown_clan_3", rhetoric: "neutral", px: 1172, py: 1072, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village36": { id: "neutral_village36", name: "Деревня36", type: "village", province: "oku_province_3", faction: "unknown_clan_3", rhetoric: "neutral", px: 1099, py: 1153, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village37": { id: "neutral_village37", name: "Деревня37", type: "village", province: "oku_province_3", faction: "unknown_clan_3", rhetoric: "neutral", px: 1133, py: 1085, icon: "draw.png", isVassal: false, vassalHouse: null },

    // ========== ЛОЯЛИСТСКИЕ ПРОВИНЦИИ (незанятые, временные заглушки) ==========
    
    // Провинция №4 (Loyalist Province No. 1) - Neutral
    "neutral_city6": { id: "neutral_city6", name: "Город6", type: "city", province: "loyalist_province_1", faction: "unknown_feudal_1", rhetoric: "neutral", px: 1390, py: 1033, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_city7": { id: "neutral_city7", name: "Город7", type: "city", province: "loyalist_province_1", faction: "unknown_feudal_1", rhetoric: "neutral", px: 1500, py: 1000, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle11": { id: "neutral_castle11", name: "Замок11", type: "castle", province: "loyalist_province_1", faction: "unknown_feudal_1", rhetoric: "neutral", px: 1200, py: 1015, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle12": { id: "neutral_castle12", name: "Замок12", type: "castle", province: "loyalist_province_1", faction: "unknown_feudal_1", rhetoric: "neutral", px: 1417, py: 763, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle13": { id: "neutral_castle13", name: "Замок13", type: "castle", province: "loyalist_province_1", faction: "unknown_feudal_1", rhetoric: "neutral", px: 1583, py: 1000, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village38": { id: "neutral_village38", name: "Деревня38", type: "village", province: "loyalist_province_1", faction: "unknown_feudal_1", rhetoric: "neutral", px: 1228, py: 1047, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village39": { id: "neutral_village39", name: "Деревня39", type: "village", province: "loyalist_province_1", faction: "unknown_feudal_1", rhetoric: "neutral", px: 1260, py: 1066, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village40": { id: "neutral_village40", name: "Деревня40", type: "village", province: "loyalist_province_1", faction: "unknown_feudal_1", rhetoric: "neutral", px: 1230, py: 1105, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village41": { id: "neutral_village41", name: "Деревня41", type: "village", province: "loyalist_province_1", faction: "unknown_feudal_1", rhetoric: "neutral", px: 1290, py: 1023, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village42": { id: "neutral_village42", name: "Деревня42", type: "village", province: "loyalist_province_1", faction: "unknown_feudal_1", rhetoric: "neutral", px: 1335, py: 1018, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village43": { id: "neutral_village43", name: "Деревня43", type: "village", province: "loyalist_province_1", faction: "unknown_feudal_1", rhetoric: "neutral", px: 1365, py: 1056, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village44": { id: "neutral_village44", name: "Деревня44", type: "village", province: "loyalist_province_1", faction: "unknown_feudal_1", rhetoric: "neutral", px: 1355, py: 960, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village45": { id: "neutral_village45", name: "Деревня45", type: "village", province: "loyalist_province_1", faction: "unknown_feudal_1", rhetoric: "neutral", px: 1393, py: 955, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village46": { id: "neutral_village46", name: "Деревня46", type: "village", province: "loyalist_province_1", faction: "unknown_feudal_1", rhetoric: "neutral", px: 1426, py: 1015, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village47": { id: "neutral_village47", name: "Деревня47", type: "village", province: "loyalist_province_1", faction: "unknown_feudal_1", rhetoric: "neutral", px: 1370, py: 840, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village48": { id: "neutral_village48", name: "Деревня48", type: "village", province: "loyalist_province_1", faction: "unknown_feudal_1", rhetoric: "neutral", px: 1453, py: 772, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village49": { id: "neutral_village49", name: "Деревня49", type: "village", province: "loyalist_province_1", faction: "unknown_feudal_1", rhetoric: "neutral", px: 1447, py: 813, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village50": { id: "neutral_village50", name: "Деревня50", type: "village", province: "loyalist_province_1", faction: "unknown_feudal_1", rhetoric: "neutral", px: 1500, py: 823, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village51": { id: "neutral_village51", name: "Деревня51", type: "village", province: "loyalist_province_1", faction: "unknown_feudal_1", rhetoric: "neutral", px: 1537, py: 771, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village52": { id: "neutral_village52", name: "Деревня52", type: "village", province: "loyalist_province_1", faction: "unknown_feudal_1", rhetoric: "neutral", px: 1573, py: 834, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village53": { id: "neutral_village53", name: "Деревня53", type: "village", province: "loyalist_province_1", faction: "unknown_feudal_1", rhetoric: "neutral", px: 1526, py: 942, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village54": { id: "neutral_village54", name: "Деревня54", type: "village", province: "loyalist_province_1", faction: "unknown_feudal_1", rhetoric: "neutral", px: 1537, py: 1021, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village55": { id: "neutral_village55", name: "Деревня55", type: "village", province: "loyalist_province_1", faction: "unknown_feudal_1", rhetoric: "neutral", px: 1565, py: 965, icon: "draw.png", isVassal: false, vassalHouse: null },

    // Провинция №5 (Loyalist Province No. 2) - Neutral
    "neutral_city8": { id: "neutral_city8", name: "Город8", type: "city", province: "loyalist_province_2", faction: "unknown_feudal_2", rhetoric: "neutral", px: 1520, py: 565, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle14": { id: "neutral_castle14", name: "Замок14", type: "castle", province: "loyalist_province_2", faction: "unknown_feudal_2", rhetoric: "neutral", px: 1525, py: 510, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle15": { id: "neutral_castle15", name: "Замок15", type: "castle", province: "loyalist_province_2", faction: "unknown_feudal_2", rhetoric: "neutral", px: 1565, py: 562, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village56": { id: "neutral_village56", name: "Деревня56", type: "village", province: "loyalist_province_2", faction: "unknown_feudal_2", rhetoric: "neutral", px: 1230, py: 570, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village57": { id: "neutral_village57", name: "Деревня57", type: "village", province: "loyalist_province_2", faction: "unknown_feudal_2", rhetoric: "neutral", px: 1270, py: 540, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village58": { id: "neutral_village58", name: "Деревня58", type: "village", province: "loyalist_province_2", faction: "unknown_feudal_2", rhetoric: "neutral", px: 1300, py: 533, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village59": { id: "neutral_village59", name: "Деревня59", type: "village", province: "loyalist_province_2", faction: "unknown_feudal_2", rhetoric: "neutral", px: 1345, py: 545, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village60": { id: "neutral_village60", name: "Деревня60", type: "village", province: "loyalist_province_2", faction: "unknown_feudal_2", rhetoric: "neutral", px: 1387, py: 505, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village61": { id: "neutral_village61", name: "Деревня61", type: "village", province: "loyalist_province_2", faction: "unknown_feudal_2", rhetoric: "neutral", px: 1393, py: 575, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village62": { id: "neutral_village62", name: "Деревня62", type: "village", province: "loyalist_province_2", faction: "unknown_feudal_2", rhetoric: "neutral", px: 1375, py: 715, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village63": { id: "neutral_village63", name: "Деревня63", type: "village", province: "loyalist_province_2", faction: "unknown_feudal_2", rhetoric: "neutral", px: 1351, py: 735, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village64": { id: "neutral_village64", name: "Деревня64", type: "village", province: "loyalist_province_2", faction: "unknown_feudal_2", rhetoric: "neutral", px: 1475, py: 446, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village65": { id: "neutral_village65", name: "Деревня65", type: "village", province: "loyalist_province_2", faction: "unknown_feudal_2", rhetoric: "neutral", px: 1570, py: 605, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village66": { id: "neutral_village66", name: "Деревня66", type: "village", province: "loyalist_province_2", faction: "unknown_feudal_2", rhetoric: "neutral", px: 1602, py: 620, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village67": { id: "neutral_village67", name: "Деревня67", type: "village", province: "loyalist_province_2", faction: "unknown_feudal_2", rhetoric: "neutral", px: 1630, py: 575, icon: "draw.png", isVassal: false, vassalHouse: null },

    // Провинция №6 (Loyalist Province No. 3) - Neutral
    "neutral_city9": { id: "neutral_city9", name: "Город9", type: "city", province: "loyalist_province_3", faction: "unknown_feudal_3", rhetoric: "neutral", px: 1785, py: 965, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle16": { id: "neutral_castle16", name: "Замок16", type: "castle", province: "loyalist_province_3", faction: "unknown_feudal_3", rhetoric: "neutral", px: 1930, py: 974, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle17": { id: "neutral_castle17", name: "Замок17", type: "castle", province: "loyalist_province_3", faction: "unknown_feudal_3", rhetoric: "neutral", px: 1637, py: 862, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle18": { id: "neutral_castle18", name: "Замок18", type: "castle", province: "loyalist_province_3", faction: "unknown_feudal_3", rhetoric: "neutral", px: 1657, py: 688, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village68": { id: "neutral_village68", name: "Деревня68", type: "village", province: "loyalist_province_3", faction: "unknown_feudal_3", rhetoric: "neutral", px: 1612, py: 800, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village69": { id: "neutral_village69", name: "Деревня69", type: "village", province: "loyalist_province_3", faction: "unknown_feudal_3", rhetoric: "neutral", px: 1660, py: 777, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village70": { id: "neutral_village70", name: "Деревня70", type: "village", province: "loyalist_province_3", faction: "unknown_feudal_3", rhetoric: "neutral", px: 1743, py: 683, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village71": { id: "neutral_village71", name: "Деревня71", type: "village", province: "loyalist_province_3", faction: "unknown_feudal_3", rhetoric: "neutral", px: 1698, py: 738, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village72": { id: "neutral_village72", name: "Деревня72", type: "village", province: "loyalist_province_3", faction: "unknown_feudal_3", rhetoric: "neutral", px: 1741, py: 747, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village73": { id: "neutral_village73", name: "Деревня73", type: "village", province: "loyalist_province_3", faction: "unknown_feudal_3", rhetoric: "neutral", px: 1811, py: 738, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village74": { id: "neutral_village74", name: "Деревня74", type: "village", province: "loyalist_province_3", faction: "unknown_feudal_3", rhetoric: "neutral", px: 1707, py: 806, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village75": { id: "neutral_village75", name: "Деревня75", type: "village", province: "loyalist_province_3", faction: "unknown_feudal_3", rhetoric: "neutral", px: 1755, py: 810, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village76": { id: "neutral_village76", name: "Деревня76", type: "village", province: "loyalist_province_3", faction: "unknown_feudal_3", rhetoric: "neutral", px: 1757, py: 862, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village77": { id: "neutral_village77", name: "Деревня77", type: "village", province: "loyalist_province_3", faction: "unknown_feudal_3", rhetoric: "neutral", px: 1796, py: 847, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village78": { id: "neutral_village78", name: "Деревня78", type: "village", province: "loyalist_province_3", faction: "unknown_feudal_3", rhetoric: "neutral", px: 1840, py: 838, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village79": { id: "neutral_village79", name: "Деревня79", type: "village", province: "loyalist_province_3", faction: "unknown_feudal_3", rhetoric: "neutral", px: 1882, py: 853, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village80": { id: "neutral_village80", name: "Деревня80", type: "village", province: "loyalist_province_3", faction: "unknown_feudal_3", rhetoric: "neutral", px: 1693, py: 920, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village81": { id: "neutral_village81", name: "Деревня81", type: "village", province: "loyalist_province_3", faction: "unknown_feudal_3", rhetoric: "neutral", px: 1740, py: 955, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village82": { id: "neutral_village82", name: "Деревня82", type: "village", province: "loyalist_province_3", faction: "unknown_feudal_3", rhetoric: "neutral", px: 1802, py: 920, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village83": { id: "neutral_village83", name: "Деревня83", type: "village", province: "loyalist_province_3", faction: "unknown_feudal_3", rhetoric: "neutral", px: 1840, py: 937, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village84": { id: "neutral_village84", name: "Деревня84", type: "village", province: "loyalist_province_3", faction: "unknown_feudal_3", rhetoric: "neutral", px: 1818, py: 983, icon: "draw.png", isVassal: false, vassalHouse: null },

    // Провинция №7 (Loyalist Province No. 4) - Neutral
    "neutral_city10": { id: "neutral_city10", name: "Город10", type: "city", province: "loyalist_province_4", faction: "unknown_feudal_4", rhetoric: "neutral", px: 1706, py: 360, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle19": { id: "neutral_castle19", name: "Замок19", type: "castle", province: "loyalist_province_4", faction: "unknown_feudal_4", rhetoric: "neutral", px: 1735, py: 330, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle20": { id: "neutral_castle20", name: "Замок20", type: "castle", province: "loyalist_province_4", faction: "unknown_feudal_4", rhetoric: "neutral", px: 1681, py: 528, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village85": { id: "neutral_village85", name: "Деревня85", type: "village", province: "loyalist_province_4", faction: "unknown_feudal_4", rhetoric: "neutral", px: 1540, py: 360, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village86": { id: "neutral_village86", name: "Деревня86", type: "village", province: "loyalist_province_4", faction: "unknown_feudal_4", rhetoric: "neutral", px: 1612, py: 375, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village87": { id: "neutral_village87", name: "Деревня87", type: "village", province: "loyalist_province_4", faction: "unknown_feudal_4", rhetoric: "neutral", px: 1600, py: 463, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village88": { id: "neutral_village88", name: "Деревня88", type: "village", province: "loyalist_province_4", faction: "unknown_feudal_4", rhetoric: "neutral", px: 1670, py: 300, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village89": { id: "neutral_village89", name: "Деревня89", type: "village", province: "loyalist_province_4", faction: "unknown_feudal_4", rhetoric: "neutral", px: 1738, py: 407, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village90": { id: "neutral_village90", name: "Деревня90", type: "village", province: "loyalist_province_4", faction: "unknown_feudal_4", rhetoric: "neutral", px: 1710, py: 425, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village91": { id: "neutral_village91", name: "Деревня91", type: "village", province: "loyalist_province_4", faction: "unknown_feudal_4", rhetoric: "neutral", px: 1738, py: 496, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village92": { id: "neutral_village92", name: "Деревня92", type: "village", province: "loyalist_province_4", faction: "unknown_feudal_4", rhetoric: "neutral", px: 1767, py: 472, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village93": { id: "neutral_village93", name: "Деревня93", type: "village", province: "loyalist_province_4", faction: "unknown_feudal_4", rhetoric: "neutral", px: 1780, py: 555, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village94": { id: "neutral_village94", name: "Деревня94", type: "village", province: "loyalist_province_4", faction: "unknown_feudal_4", rhetoric: "neutral", px: 1836, py: 426, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village95": { id: "neutral_village95", name: "Деревня95", type: "village", province: "loyalist_province_4", faction: "unknown_feudal_4", rhetoric: "neutral", px: 1860, py: 623, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village96": { id: "neutral_village96", name: "Деревня96", type: "village", province: "loyalist_province_4", faction: "unknown_feudal_4", rhetoric: "neutral", px: 1917, py: 600, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village97": { id: "neutral_village97", name: "Деревня97", type: "village", province: "loyalist_province_4", faction: "unknown_feudal_4", rhetoric: "neutral", px: 1815, py: 615, icon: "draw.png", isVassal: false, vassalHouse: null },

    // Провинция №8 (Loyalist Province No. 5) - Neutral
    "neutral_city11": { id: "neutral_city11", name: "Город11", type: "city", province: "loyalist_province_5", faction: "unknown_feudal_5", rhetoric: "neutral", px: 2060, py: 440, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle21": { id: "neutral_castle21", name: "Замок21", type: "castle", province: "loyalist_province_5", faction: "unknown_feudal_5", rhetoric: "neutral", px: 1985, py: 520, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle22": { id: "neutral_castle22", name: "Замок22", type: "castle", province: "loyalist_province_5", faction: "unknown_feudal_5", rhetoric: "neutral", px: 2027, py: 317, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle23": { id: "neutral_castle23", name: "Замок23", type: "castle", province: "loyalist_province_5", faction: "unknown_feudal_5", rhetoric: "neutral", px: 2215, py: 512, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village98": { id: "neutral_village98", name: "Деревня98", type: "village", province: "loyalist_province_5", faction: "unknown_feudal_5", rhetoric: "neutral", px: 1968, py: 580, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village99": { id: "neutral_village99", name: "Деревня99", type: "village", province: "loyalist_province_5", faction: "unknown_feudal_5", rhetoric: "neutral", px: 2037, py: 532, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village100": { id: "neutral_village100", name: "Деревня100", type: "village", province: "loyalist_province_5", faction: "unknown_feudal_5", rhetoric: "neutral", px: 2062, py: 490, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village101": { id: "neutral_village101", name: "Деревня101", type: "village", province: "loyalist_province_5", faction: "unknown_feudal_5", rhetoric: "neutral", px: 2058, py: 385, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village102": { id: "neutral_village102", name: "Деревня102", type: "village", province: "loyalist_province_5", faction: "unknown_feudal_5", rhetoric: "neutral", px: 2166, py: 377, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village103": { id: "neutral_village103", name: "Деревня103", type: "village", province: "loyalist_province_5", faction: "unknown_feudal_5", rhetoric: "neutral", px: 2150, py: 450, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village104": { id: "neutral_village104", name: "Деревня104", type: "village", province: "loyalist_province_5", faction: "unknown_feudal_5", rhetoric: "neutral", px: 2210, py: 420, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village105": { id: "neutral_village105", name: "Деревня105", type: "village", province: "loyalist_province_5", faction: "unknown_feudal_5", rhetoric: "neutral", px: 2242, py: 355, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village106": { id: "neutral_village106", name: "Деревня106", type: "village", province: "loyalist_province_5", faction: "unknown_feudal_5", rhetoric: "neutral", px: 2112, py: 605, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village107": { id: "neutral_village107", name: "Деревня107", type: "village", province: "loyalist_province_5", faction: "unknown_feudal_5", rhetoric: "neutral", px: 2106, py: 656, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village108": { id: "neutral_village108", name: "Деревня108", type: "village", province: "loyalist_province_5", faction: "unknown_feudal_5", rhetoric: "neutral", px: 2185, py: 655, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village109": { id: "neutral_village109", name: "Деревня109", type: "village", province: "loyalist_province_5", faction: "unknown_feudal_5", rhetoric: "neutral", px: 2205, py: 720, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village110": { id: "neutral_village110", name: "Деревня110", type: "village", province: "loyalist_province_5", faction: "unknown_feudal_5", rhetoric: "neutral", px: 2193, py: 566, icon: "draw.png", isVassal: false, vassalHouse: null },

    // ========== НЕЙТРАЛЬНЫЕ ПРОВИНЦИИ (незанятые, временные заглушки) ==========
    
    // Провинция №9 (Neutral Province No. 1) - Neutral
    "neutral_city12": { id: "neutral_city12", name: "Город12", type: "city", province: "neutral_province_1", faction: "unknown_feudal_6", rhetoric: "neutral", px: 2422, py: 342, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle24": { id: "neutral_castle24", name: "Замок24", type: "castle", province: "neutral_province_1", faction: "unknown_feudal_6", rhetoric: "neutral", px: 2387, py: 475, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle25": { id: "neutral_castle25", name: "Замок25", type: "castle", province: "neutral_province_1", faction: "unknown_feudal_6", rhetoric: "neutral", px: 2495, py: 500, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle26": { id: "neutral_castle26", name: "Замок26", type: "castle", province: "neutral_province_1", faction: "unknown_feudal_6", rhetoric: "neutral", px: 2573, py: 520, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village111": { id: "neutral_village111", name: "Деревня111", type: "village", province: "neutral_province_1", faction: "unknown_feudal_6", rhetoric: "neutral", px: 2300, py: 357, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village112": { id: "neutral_village112", name: "Деревня112", type: "village", province: "neutral_province_1", faction: "unknown_feudal_6", rhetoric: "neutral", px: 2321, py: 405, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village113": { id: "neutral_village113", name: "Деревня113", type: "village", province: "neutral_province_1", faction: "unknown_feudal_6", rhetoric: "neutral", px: 2438, py: 405, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village114": { id: "neutral_village114", name: "Деревня114", type: "village", province: "neutral_province_1", faction: "unknown_feudal_6", rhetoric: "neutral", px: 2490, py: 328, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village115": { id: "neutral_village115", name: "Деревня115", type: "village", province: "neutral_province_1", faction: "unknown_feudal_6", rhetoric: "neutral", px: 2563, py: 323, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village116": { id: "neutral_village116", name: "Деревня116", type: "village", province: "neutral_province_1", faction: "unknown_feudal_6", rhetoric: "neutral", px: 2595, py: 381, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village117": { id: "neutral_village117", name: "Деревня117", type: "village", province: "neutral_province_1", faction: "unknown_feudal_6", rhetoric: "neutral", px: 2592, py: 422, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village118": { id: "neutral_village118", name: "Деревня118", type: "village", province: "neutral_province_1", faction: "unknown_feudal_6", rhetoric: "neutral", px: 2557, py: 454, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village119": { id: "neutral_village119", name: "Деревня119", type: "village", province: "neutral_province_1", faction: "unknown_feudal_6", rhetoric: "neutral", px: 2582, py: 482, icon: "draw.png", isVassal: false, vassalHouse: null },

    // Провинция №10 (Neutral Province No. 2) - Neutral
    "neutral_city13": { id: "neutral_city13", name: "Город13", type: "city", province: "neutral_province_2", faction: "unknown_feudal_7", rhetoric: "neutral", px: 2417, py: 624, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle27": { id: "neutral_castle27", name: "Замок27", type: "castle", province: "neutral_province_2", faction: "unknown_feudal_7", rhetoric: "neutral", px: 2368, py: 623, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle28": { id: "neutral_castle28", name: "Замок28", type: "castle", province: "neutral_province_2", faction: "unknown_feudal_7", rhetoric: "neutral", px: 2568, py: 691, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle29": { id: "neutral_castle29", name: "Замок29", type: "castle", province: "neutral_province_2", faction: "unknown_feudal_7", rhetoric: "neutral", px: 2244, py: 801, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village120": { id: "neutral_village120", name: "Деревня120", type: "village", province: "neutral_province_2", faction: "unknown_feudal_7", rhetoric: "neutral", px: 2292, py: 580, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village121": { id: "neutral_village121", name: "Деревня121", type: "village", province: "neutral_province_2", faction: "unknown_feudal_7", rhetoric: "neutral", px: 2371, py: 505, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village122": { id: "neutral_village122", name: "Деревня122", type: "village", province: "neutral_province_2", faction: "unknown_feudal_7", rhetoric: "neutral", px: 2348, py: 659, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village123": { id: "neutral_village123", name: "Деревня123", type: "village", province: "neutral_province_2", faction: "unknown_feudal_7", rhetoric: "neutral", px: 2431, py: 685, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village124": { id: "neutral_village124", name: "Деревня124", type: "village", province: "neutral_province_2", faction: "unknown_feudal_7", rhetoric: "neutral", px: 2469, py: 570, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village125": { id: "neutral_village125", name: "Деревня125", type: "village", province: "neutral_province_2", faction: "unknown_feudal_7", rhetoric: "neutral", px: 2541, py: 648, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village126": { id: "neutral_village126", name: "Деревня126", type: "village", province: "neutral_province_2", faction: "unknown_feudal_7", rhetoric: "neutral", px: 2566, py: 604, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village127": { id: "neutral_village127", name: "Деревня127", type: "village", province: "neutral_province_2", faction: "unknown_feudal_7", rhetoric: "neutral", px: 2570, py: 750, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village128": { id: "neutral_village128", name: "Деревня128", type: "village", province: "neutral_province_2", faction: "unknown_feudal_7", rhetoric: "neutral", px: 2387, py: 735, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village129": { id: "neutral_village129", name: "Деревня129", type: "village", province: "neutral_province_2", faction: "unknown_feudal_7", rhetoric: "neutral", px: 2312, py: 784, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village130": { id: "neutral_village130", name: "Деревня130", type: "village", province: "neutral_province_2", faction: "unknown_feudal_7", rhetoric: "neutral", px: 2508, py: 725, icon: "draw.png", isVassal: false, vassalHouse: null },

    // Провинция №11 (Neutral Province No. 3) - Neutral
    "neutral_city14": { id: "neutral_city14", name: "Город14", type: "city", province: "neutral_province_3", faction: "unknown_feudal_8", rhetoric: "neutral", px: 2579, py: 924, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle30": { id: "neutral_castle30", name: "Замок30", type: "castle", province: "neutral_province_3", faction: "unknown_feudal_8", rhetoric: "neutral", px: 2204, py: 901, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle31": { id: "neutral_castle31", name: "Замок31", type: "castle", province: "neutral_province_3", faction: "unknown_feudal_8", rhetoric: "neutral", px: 2544, py: 1036, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle32": { id: "neutral_castle32", name: "Замок32", type: "castle", province: "neutral_province_3", faction: "unknown_feudal_8", rhetoric: "neutral", px: 2723, py: 961, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village131": { id: "neutral_village131", name: "Деревня131", type: "village", province: "neutral_province_3", faction: "unknown_feudal_8", rhetoric: "neutral", px: 2230, py: 833, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village132": { id: "neutral_village132", name: "Деревня132", type: "village", province: "neutral_province_3", faction: "unknown_feudal_8", rhetoric: "neutral", px: 2220, py: 877, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village133": { id: "neutral_village133", name: "Деревня133", type: "village", province: "neutral_province_3", faction: "unknown_feudal_8", rhetoric: "neutral", px: 2275, py: 900, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village134": { id: "neutral_village134", name: "Деревня134", type: "village", province: "neutral_province_3", faction: "unknown_feudal_8", rhetoric: "neutral", px: 2370, py: 953, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village135": { id: "neutral_village135", name: "Деревня135", type: "village", province: "neutral_province_3", faction: "unknown_feudal_8", rhetoric: "neutral", px: 2435, py: 1030, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village136": { id: "neutral_village136", name: "Деревня136", type: "village", province: "neutral_province_3", faction: "unknown_feudal_8", rhetoric: "neutral", px: 2517, py: 920, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village137": { id: "neutral_village137", name: "Деревня137", type: "village", province: "neutral_province_3", faction: "unknown_feudal_8", rhetoric: "neutral", px: 2538, py: 808, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village138": { id: "neutral_village138", name: "Деревня138", type: "village", province: "neutral_province_3", faction: "unknown_feudal_8", rhetoric: "neutral", px: 2564, py: 862, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village139": { id: "neutral_village139", name: "Деревня139", type: "village", province: "neutral_province_3", faction: "unknown_feudal_8", rhetoric: "neutral", px: 2675, py: 765, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village140": { id: "neutral_village140", name: "Деревня140", type: "village", province: "neutral_province_3", faction: "unknown_feudal_8", rhetoric: "neutral", px: 2814, py: 867, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village141": { id: "neutral_village141", name: "Деревня141", type: "village", province: "neutral_province_3", faction: "unknown_feudal_8", rhetoric: "neutral", px: 2816, py: 944, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village142": { id: "neutral_village142", name: "Деревня142", type: "village", province: "neutral_province_3", faction: "unknown_feudal_8", rhetoric: "neutral", px: 2672, py: 1050, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village143": { id: "neutral_village143", name: "Деревня143", type: "village", province: "neutral_province_3", faction: "unknown_feudal_8", rhetoric: "neutral", px: 2636, py: 935, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village144": { id: "neutral_village144", name: "Деревня144", type: "village", province: "neutral_province_3", faction: "unknown_feudal_8", rhetoric: "neutral", px: 2581, py: 975, icon: "draw.png", isVassal: false, vassalHouse: null },

    // Провинция №12 (Neutral Province No. 4) - Neutral
    "neutral_city15": { id: "neutral_city15", name: "Город15", type: "city", province: "neutral_province_4", faction: "unknown_feudal_9", rhetoric: "neutral", px: 2410, py: 1325, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_city16": { id: "neutral_city16", name: "Город16", type: "city", province: "neutral_province_4", faction: "unknown_feudal_9", rhetoric: "neutral", px: 2597, py: 1292, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle33": { id: "neutral_castle33", name: "Замок33", type: "castle", province: "neutral_province_4", faction: "unknown_feudal_9", rhetoric: "neutral", px: 2348, py: 1182, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle34": { id: "neutral_castle34", name: "Замок34", type: "castle", province: "neutral_province_4", faction: "unknown_feudal_9", rhetoric: "neutral", px: 2692, py: 1292, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village145": { id: "neutral_village145", name: "Деревня145", type: "village", province: "neutral_province_4", faction: "unknown_feudal_9", rhetoric: "neutral", px: 2450, py: 1120, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village146": { id: "neutral_village146", name: "Деревня146", type: "village", province: "neutral_province_4", faction: "unknown_feudal_9", rhetoric: "neutral", px: 2411, py: 1118, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village147": { id: "neutral_village147", name: "Деревня147", type: "village", province: "neutral_province_4", faction: "unknown_feudal_9", rhetoric: "neutral", px: 2420, py: 1196, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village148": { id: "neutral_village148", name: "Деревня148", type: "village", province: "neutral_province_4", faction: "unknown_feudal_9", rhetoric: "neutral", px: 2460, py: 1180, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village149": { id: "neutral_village149", name: "Деревня149", type: "village", province: "neutral_province_4", faction: "unknown_feudal_9", rhetoric: "neutral", px: 2456, py: 1246, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village150": { id: "neutral_village150", name: "Деревня150", type: "village", province: "neutral_province_4", faction: "unknown_feudal_9", rhetoric: "neutral", px: 2500, py: 1100, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village151": { id: "neutral_village151", name: "Деревня151", type: "village", province: "neutral_province_4", faction: "unknown_feudal_9", rhetoric: "neutral", px: 2550, py: 1107, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village152": { id: "neutral_village152", name: "Деревня152", type: "village", province: "neutral_province_4", faction: "unknown_feudal_9", rhetoric: "neutral", px: 2591, py: 1095, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village153": { id: "neutral_village153", name: "Деревня153", type: "village", province: "neutral_province_4", faction: "unknown_feudal_9", rhetoric: "neutral", px: 2667, py: 1158, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village154": { id: "neutral_village154", name: "Деревня154", type: "village", province: "neutral_province_4", faction: "unknown_feudal_9", rhetoric: "neutral", px: 2673, py: 1222, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village155": { id: "neutral_village155", name: "Деревня155", type: "village", province: "neutral_province_4", faction: "unknown_feudal_9", rhetoric: "neutral", px: 2641, py: 1286, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village156": { id: "neutral_village156", name: "Деревня156", type: "village", province: "neutral_province_4", faction: "unknown_feudal_9", rhetoric: "neutral", px: 2555, py: 1312, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village157": { id: "neutral_village157", name: "Деревня157", type: "village", province: "neutral_province_4", faction: "unknown_feudal_9", rhetoric: "neutral", px: 2495, py: 1380, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village158": { id: "neutral_village158", name: "Деревня158", type: "village", province: "neutral_province_4", faction: "unknown_feudal_9", rhetoric: "neutral", px: 2535, py: 1405, icon: "draw.png", isVassal: false, vassalHouse: null },

    // Провинция №13 (Neutral Province No. 5) - Neutral
    "neutral_city18": { id: "neutral_city18", name: "Город18", type: "city", province: "neutral_province_5", faction: "unknown_feudal_11", rhetoric: "neutral", px: 2795, py: 1461, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle36": { id: "neutral_castle36", name: "Замок36", type: "castle", province: "neutral_province_5", faction: "unknown_feudal_11", rhetoric: "neutral", px: 2931, py: 1517, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle37": { id: "neutral_castle37", name: "Замок37", type: "castle", province: "neutral_province_5", faction: "unknown_feudal_11", rhetoric: "neutral", px: 2835, py: 1606, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village166": { id: "neutral_village166", name: "Деревня166", type: "village", province: "neutral_province_5", faction: "unknown_feudal_11", rhetoric: "neutral", px: 2665, py: 1575, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village167": { id: "neutral_village167", name: "Деревня167", type: "village", province: "neutral_province_5", faction: "unknown_feudal_11", rhetoric: "neutral", px: 2685, py: 1470, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village168": { id: "neutral_village168", name: "Деревня168", type: "village", province: "neutral_province_5", faction: "unknown_feudal_11", rhetoric: "neutral", px: 2700, py: 1400, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village169": { id: "neutral_village169", name: "Деревня169", type: "village", province: "neutral_province_5", faction: "unknown_feudal_11", rhetoric: "neutral", px: 2735, py: 1365, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village170": { id: "neutral_village170", name: "Деревня170", type: "village", province: "neutral_province_5", faction: "unknown_feudal_11", rhetoric: "neutral", px: 2750, py: 1400, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village171": { id: "neutral_village171", name: "Деревня171", type: "village", province: "neutral_province_5", faction: "unknown_feudal_11", rhetoric: "neutral", px: 2816, py: 1381, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village172": { id: "neutral_village172", name: "Деревня172", type: "village", province: "neutral_province_5", faction: "unknown_feudal_11", rhetoric: "neutral", px: 2834, py: 1425, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village173": { id: "neutral_village173", name: "Деревня173", type: "village", province: "neutral_province_5", faction: "unknown_feudal_11", rhetoric: "neutral", px: 2897, py: 1497, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village174": { id: "neutral_village174", name: "Деревня174", type: "village", province: "neutral_province_5", faction: "unknown_feudal_11", rhetoric: "neutral", px: 2839, py: 1497, icon: "draw.png", isVassal: false, vassalHouse: null },

    // Провинция №14 (Neutral Province No. 6) - Neutral
    "neutral_city19": { id: "neutral_city19", name: "Город19", type: "city", province: "neutral_province_6", faction: "unknown_feudal_12", rhetoric: "neutral", px: 3157, py: 1221, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle38": { id: "neutral_castle38", name: "Замок38", type: "castle", province: "neutral_province_6", faction: "unknown_feudal_12", rhetoric: "neutral", px: 3058, py: 1510, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle39": { id: "neutral_castle39", name: "Замок39", type: "castle", province: "neutral_province_6", faction: "unknown_feudal_12", rhetoric: "neutral", px: 3248, py: 1513, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle40": { id: "neutral_castle40", name: "Замок40", type: "castle", province: "neutral_province_6", faction: "unknown_feudal_12", rhetoric: "neutral", px: 3418, py: 1550, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village175": { id: "neutral_village175", name: "Деревня175", type: "village", province: "neutral_province_6", faction: "unknown_feudal_12", rhetoric: "neutral", px: 2958, py: 1430, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village176": { id: "neutral_village176", name: "Деревня176", type: "village", province: "neutral_province_6", faction: "unknown_feudal_12", rhetoric: "neutral", px: 2922, py: 1362, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village177": { id: "neutral_village177", name: "Деревня177", type: "village", province: "neutral_province_6", faction: "unknown_feudal_12", rhetoric: "neutral", px: 2957, py: 1327, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village178": { id: "neutral_village178", name: "Деревня178", type: "village", province: "neutral_province_6", faction: "unknown_feudal_12", rhetoric: "neutral", px: 3027, py: 1251, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village179": { id: "neutral_village179", name: "Деревня179", type: "village", province: "neutral_province_6", faction: "unknown_feudal_12", rhetoric: "neutral", px: 3106, py: 1250, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village180": { id: "neutral_village180", name: "Деревня180", type: "village", province: "neutral_province_6", faction: "unknown_feudal_12", rhetoric: "neutral", px: 3147, py: 1283, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village181": { id: "neutral_village181", name: "Деревня181", type: "village", province: "neutral_province_6", faction: "unknown_feudal_12", rhetoric: "neutral", px: 3234, py: 1290, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village182": { id: "neutral_village182", name: "Деревня182", type: "village", province: "neutral_province_6", faction: "unknown_feudal_12", rhetoric: "neutral", px: 3366, py: 1232, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village183": { id: "neutral_village183", name: "Деревня183", type: "village", province: "neutral_province_6", faction: "unknown_feudal_12", rhetoric: "neutral", px: 3416, py: 1392, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village184": { id: "neutral_village184", name: "Деревня184", type: "village", province: "neutral_province_6", faction: "unknown_feudal_12", rhetoric: "neutral", px: 3231, py: 1358, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village185": { id: "neutral_village185", name: "Деревня185", type: "village", province: "neutral_province_6", faction: "unknown_feudal_12", rhetoric: "neutral", px: 3184, py: 1405, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village186": { id: "neutral_village186", name: "Деревня186", type: "village", province: "neutral_province_6", faction: "unknown_feudal_12", rhetoric: "neutral", px: 3043, py: 1458, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village187": { id: "neutral_village187", name: "Деревня187", type: "village", province: "neutral_province_6", faction: "unknown_feudal_12", rhetoric: "neutral", px: 3307, py: 1480, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village188": { id: "neutral_village188", name: "Деревня188", type: "village", province: "neutral_province_6", faction: "unknown_feudal_12", rhetoric: "neutral", px: 3391, py: 1476, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village189": { id: "neutral_village189", name: "Деревня189", type: "village", province: "neutral_province_6", faction: "unknown_feudal_12", rhetoric: "neutral", px: 3185, py: 1272, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village190": { id: "neutral_village190", name: "Деревня190", type: "village", province: "neutral_province_6", faction: "unknown_feudal_12", rhetoric: "neutral", px: 3305, py: 1249, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village191": { id: "neutral_village191", name: "Деревня191", type: "village", province: "neutral_province_6", faction: "unknown_feudal_12", rhetoric: "neutral", px: 3120, py: 1362, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village192": { id: "neutral_village192", name: "Деревня192", type: "village", province: "neutral_province_6", faction: "unknown_feudal_12", rhetoric: "neutral", px: 3174, py: 1457, icon: "draw.png", isVassal: false, vassalHouse: null },

    // Провинция №15 (Neutral Province No. 7) - Neutral
    "neutral_city20": { id: "neutral_city20", name: "Город20", type: "city", province: "neutral_province_7", faction: "unknown_feudal_13", rhetoric: "neutral", px: 3205, py: 1858, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_city21": { id: "neutral_city21", name: "Город21", type: "city", province: "neutral_province_7", faction: "unknown_feudal_13", rhetoric: "neutral", px: 3311, py: 1650, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_city22": { id: "neutral_city22", name: "Город22", type: "city", province: "neutral_province_7", faction: "unknown_feudal_13", rhetoric: "neutral", px: 3374, py: 1830, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle41": { id: "neutral_castle41", name: "Замок41", type: "castle", province: "neutral_province_7", faction: "unknown_feudal_13", rhetoric: "neutral", px: 3072, py: 1802, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle42": { id: "neutral_castle42", name: "Замок42", type: "castle", province: "neutral_province_7", faction: "unknown_feudal_13", rhetoric: "neutral", px: 3211, py: 1805, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle43": { id: "neutral_castle43", name: "Замок43", type: "castle", province: "neutral_province_7", faction: "unknown_feudal_13", rhetoric: "neutral", px: 3055, py: 1650, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village193": { id: "neutral_village193", name: "Деревня193", type: "village", province: "neutral_province_7", faction: "unknown_feudal_13", rhetoric: "neutral", px: 2960, py: 1556, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village194": { id: "neutral_village194", name: "Деревня194", type: "village", province: "neutral_province_7", faction: "unknown_feudal_13", rhetoric: "neutral", px: 3008, py: 1587, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village195": { id: "neutral_village195", name: "Деревня195", type: "village", province: "neutral_province_7", faction: "unknown_feudal_13", rhetoric: "neutral", px: 3108, py: 1568, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village196": { id: "neutral_village196", name: "Деревня196", type: "village", province: "neutral_province_7", faction: "unknown_feudal_13", rhetoric: "neutral", px: 3009, py: 1686, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village197": { id: "neutral_village197", name: "Деревня197", type: "village", province: "neutral_province_7", faction: "unknown_feudal_13", rhetoric: "neutral", px: 3118, py: 1740, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village198": { id: "neutral_village198", name: "Деревня198", type: "village", province: "neutral_province_7", faction: "unknown_feudal_13", rhetoric: "neutral", px: 3152, py: 1631, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village199": { id: "neutral_village199", name: "Деревня199", type: "village", province: "neutral_province_7", faction: "unknown_feudal_13", rhetoric: "neutral", px: 3211, py: 1620, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village200": { id: "neutral_village200", name: "Деревня200", type: "village", province: "neutral_province_7", faction: "unknown_feudal_13", rhetoric: "neutral", px: 3255, py: 1693, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village201": { id: "neutral_village201", name: "Деревня201", type: "village", province: "neutral_province_7", faction: "unknown_feudal_13", rhetoric: "neutral", px: 3413, py: 1630, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village202": { id: "neutral_village202", name: "Деревня202", type: "village", province: "neutral_province_7", faction: "unknown_feudal_13", rhetoric: "neutral", px: 3399, py: 1783, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village203": { id: "neutral_village203", name: "Деревня203", type: "village", province: "neutral_province_7", faction: "unknown_feudal_13", rhetoric: "neutral", px: 3317, py: 1728, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village204": { id: "neutral_village204", name: "Деревня204", type: "village", province: "neutral_province_7", faction: "unknown_feudal_13", rhetoric: "neutral", px: 3207, py: 1701, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village205": { id: "neutral_village205", name: "Деревня205", type: "village", province: "neutral_province_7", faction: "unknown_feudal_13", rhetoric: "neutral", px: 3276, py: 1616, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village206": { id: "neutral_village206", name: "Деревня206", type: "village", province: "neutral_province_7", faction: "unknown_feudal_13", rhetoric: "neutral", px: 3243, py: 1566, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village207": { id: "neutral_village207", name: "Деревня207", type: "village", province: "neutral_province_7", faction: "unknown_feudal_13", rhetoric: "neutral", px: 3346, py: 1678, icon: "draw.png", isVassal: false, vassalHouse: null },

    // Провинция №16 (Proyurgan Province No. 2) - Neutral (незанятая проюрганская)
    "neutral_city23": { id: "neutral_city23", name: "Город23", type: "city", province: "proyurgan_province_2", faction: "unknown_feudal_14", rhetoric: "neutral", px: 3472, py: 1400, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village208": { id: "neutral_village208", name: "Деревня208", type: "village", province: "proyurgan_province_2", faction: "unknown_feudal_14", rhetoric: "neutral", px: 3488, py: 1355, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village209": { id: "neutral_village209", name: "Деревня209", type: "village", province: "proyurgan_province_2", faction: "unknown_feudal_14", rhetoric: "neutral", px: 3476, py: 1285, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village210": { id: "neutral_village210", name: "Деревня210", type: "village", province: "proyurgan_province_2", faction: "unknown_feudal_14", rhetoric: "neutral", px: 3482, py: 1220, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village211": { id: "neutral_village211", name: "Деревня211", type: "village", province: "proyurgan_province_2", faction: "unknown_feudal_14", rhetoric: "neutral", px: 3463, py: 1170, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village212": { id: "neutral_village212", name: "Деревня212", type: "village", province: "proyurgan_province_2", faction: "unknown_feudal_14", rhetoric: "neutral", px: 3525, py: 1180, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village213": { id: "neutral_village213", name: "Деревня213", type: "village", province: "proyurgan_province_2", faction: "unknown_feudal_14", rhetoric: "neutral", px: 3530, py: 1380, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village214": { id: "neutral_village214", name: "Деревня214", type: "village", province: "proyurgan_province_2", faction: "unknown_feudal_14", rhetoric: "neutral", px: 3560, py: 1390, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village215": { id: "neutral_village215", name: "Деревня215", type: "village", province: "proyurgan_province_2", faction: "unknown_feudal_14", rhetoric: "neutral", px: 3565, py: 1270, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village216": { id: "neutral_village216", name: "Деревня216", type: "village", province: "proyurgan_province_2", faction: "unknown_feudal_14", rhetoric: "neutral", px: 3636, py: 1245, icon: "draw.png", isVassal: false, vassalHouse: null },

    // ========== ПРОВИНЦИЯ №13 (Proyurgan Province No. 1) - незанятая проюрганская ==========
    "neutral_city17": { id: "neutral_city17", name: "Город17", type: "city", province: "proyurgan_province_1", faction: "unknown_feudal_10", rhetoric: "neutral", px: 2871, py: 1055, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_castle35": { id: "neutral_castle35", name: "Замок35", type: "castle", province: "proyurgan_province_1", faction: "unknown_feudal_10", rhetoric: "neutral", px: 2880, py: 1174, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village159": { id: "neutral_village159", name: "Деревня159", type: "village", province: "proyurgan_province_1", faction: "unknown_feudal_10", rhetoric: "neutral", px: 2831, py: 1005, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village160": { id: "neutral_village160", name: "Деревня160", type: "village", province: "proyurgan_province_1", faction: "unknown_feudal_10", rhetoric: "neutral", px: 2756, py: 1062, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village161": { id: "neutral_village161", name: "Деревня161", type: "village", province: "proyurgan_province_1", faction: "unknown_feudal_10", rhetoric: "neutral", px: 2783, py: 1100, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village162": { id: "neutral_village162", name: "Деревня162", type: "village", province: "proyurgan_province_1", faction: "unknown_feudal_10", rhetoric: "neutral", px: 2830, py: 1107, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village163": { id: "neutral_village163", name: "Деревня163", type: "village", province: "proyurgan_province_1", faction: "unknown_feudal_10", rhetoric: "neutral", px: 2805, py: 1210, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village164": { id: "neutral_village164", name: "Деревня164", type: "village", province: "proyurgan_province_1", faction: "unknown_feudal_10", rhetoric: "neutral", px: 2767, py: 1292, icon: "draw.png", isVassal: false, vassalHouse: null },
    "neutral_village165": { id: "neutral_village165", name: "Деревня165", type: "village", province: "proyurgan_province_1", faction: "unknown_feudal_10", rhetoric: "neutral", px: 2854, py: 1354, icon: "draw.png", isVassal: false, vassalHouse: null },

};

function getSettlementById(id) {
    return SETTLEMENTS_DB[id] || null;
}

function getSettlementsByProvince(provinceId) {
    return Object.values(SETTLEMENTS_DB).filter(s => s.province === provinceId);
}

console.log("✅ 01_constants.js загружен — полная версия");