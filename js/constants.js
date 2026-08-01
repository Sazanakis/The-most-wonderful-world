// ============================================================================
// МОДУЛЬ 01: constants.js
// Все константы игры (названия, типы, настройки) – КРОМЕ ДАННЫХ О ФРАКЦИЯХ
// Данные о фракциях вынесены в 17_constants_factions.js
// ВЕРСИЯ 2.0 – ПОЛНЫЙ SETTLEMENTS_DB
// ============================================================================
// Загружено на гитхаб 01.08.2026
// ========== 1. ВРЕМЯ И ДАТЫ ==========
const MONTH_NAMES = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

// ========== 2. ПРОВИНЦИИ (устаревший список) ==========
const PROVINCE_IDS = ["clan_daketa", "county_markarn", "principality_gorski", "regency_council", "county_ottergrund", "elfheim", "county_meyan", "county_dionia", "county_skollfang", "county_takania", "order_varsiltaers", "principality_lorein", "county_mensen"];

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
    castle: { name: "Замок", slots: 3 },
    wooden_fort: { name: "Деревянный форт", slots: 3 },
    stone_fort: { name: "Каменный форт", slots: 3 }
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
    orlan: 800,
    offroad: 105,
    forest: 70,
    mountain: 42,
    swamp: 35,
    horse: 315,
    bison: 245
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
    orlan: '#ff4444',
    offroad: '#8b7355',
    forest: '#228b22',
    mountain: '#708090',
    swamp: '#556b2f',
    horse: '#cd853f',
    bison: '#8b4513'
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
	sword_iron: 'icons/sword_iron.png',
	bison: 'icons/bison.png',
	elven_tobacco: 'icons/elven_tobacco.png',
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

const RHETORIC_NAMES_RU = {
    dayo: "Даё",
    loyal: "Лоялисты",
    neutral: "Нейтралы",
    proyurgan: "Проюрганцы",
    regency: "Регенты",
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
    // уже были:
    orochima: "Орочима",
    kaya: "Кайя",
    vogel: "Фогель",
    neolania: "Неолания",
    metropolitan_area: "Столичная область",
    great_shaft: "Великий Вал",
    leporis: "Лепорис",
    regent_city: "Области регентства",
    gorskin: "Горския",
	mutsura: "Муцура",
	ottergrund: "Оттергрунд",
	thronax: "Тронакс",
	meyan: "Мейан",
	dionia: "Диония",
	moonmane: "Луногривье",
	takania: "Такания",
	nightsten: "Найтстен",
	lorein: "Лорейн",
    // добавляем недостающие:
    oku_province_1: "Оку (провинция 1)",
    oku_province_2: "Оку (провинция 2)",
    mensen: "Менсен",
    neutral_province_1: "Нейтральная провинция 1",
    neutral_province_2: "Нейтральная провинция 2",
    neutral_province_5: "Нейтральная провинция 5",
    neutral_province_6: "Нейтральная провинция 6",
    proyurgan_province_1: "Проюрганская провинция 1",
};
const FACTION_NAMES = {
    clan_daketa: "Клан Дакэта",
    county_markarn: "Графство Маркарн",
    county_vogelmark: "Графство Фогельмарк",
    principality_gorski: "Горское княжество",
    regency_council: "Совет регентов",
    lepus_union: "Союз Лепус",
	clan_date: "Клан Датэ",
	county_ottergrund: "Графство Оттергрунд",
	elfheim: "Княжество Эльфхейм",
	county_meyan: "Графство Мейан",
	county_dionia: "Графство Диония",
	county_takania: "Графство Такания",
	county_skollfang: "Графство Сколльфанг",
	order_varsiltaers: "Орден Варсильтаеров",
	principality_lorein: "Княжество Лорейн",
	county_mensen: "Временная Республика Менсена",
    unknown_clan_1: "Неизвестный клан (1)",
    unknown_clan_2: "Неизвестный клан (2)",
    unknown_feudal_6: "Неизвестный феодал (6)",
    unknown_feudal_7: "Неизвестный феодал (7)",
    unknown_feudal_10: "Неизвестный феодал (10)",
    unknown_feudal_11: "Неизвестный феодал (11)",
    unknown_feudal_12: "Неизвестный феодал (12)",
	yurgan_empire: "Империя Юрган",
	elven_kingdoms: "Эльфийские Царства",
};

const VASSAL_HOUSE_NAMES = {
    "house_seiryu": "Род Сейрю",
    "house_nodaketa": "Род Нодакэта",
    "house_yurai": "Род Юрей",
    "house_yume": "Род Юмэ",
    "house_senpu": "Род Сэнпу",
    "house_umi": "Род Уми",
    "house_gekken": "Род Гэккэн",
    "viscountcy_runheim": "Виконтство Рунхеймов",
    "viscountcy_voronetsky": "Виконтство Воронецких",
    "great_wall": "Великий Вал",
	"house_tokosi": "Род Токоси",
	"house_segawa": "Род Сэгава",
	"house_yamano": "Род Ямано",
	"house_fujii": "Род Фудзии",
	"house_hatamoto_a": "Род Кейкай",
	"house_hatamoto_b": "Род Сакуга",
	"house_hatamoto_c": "Род Икко",
	"house_hatamoto_d": "Род Крейгов",
	"house_narnwyn": "Род Нарнуин",
	"house_gerondo": "Род Герондо",
	"house_stettov": "Род Штеттов",
	"house_krieger": "Род Кригер",
	"house_waldhof": "Род Вальдхоф",
	"house_montbrun": "Род Монбрун",
	"house_kilogan": "Род Килоган",
	"house_castelmor": "Род Кастельмор",
	"house_heim": "Род Хейм",
	"house_drakwald": "Род Дрейквальд",
	"house_boncraig": "Род Бонкрейг",
	"house_wolfhart": "Род Вульфхарт",
	"house_ippon": "Род Иппон",
	"house_cald": "Род Кальдов",
	"house_valdgreiv": "Род Вальдгрейв",
	"house_morven": "Род Морвен",
	"house_sternberg": "Род Линденфельд",
	"house_eisenhart": "Род Блюменау",
	"house_waldstein": "Род Айхендорф",
	"house_levenwolf": "Род Вайсенбах",
	"house_drachenfels": "Род Розенхайм",
	"house_storm": "Род Мюленгрунд",
	"house_bah": "Род Бах",
	"house_drahenfels": "Род Драхенфельс",
	"house_vind": "Род Винд",
	"house_mastereno": "Род Мастерэно",
	"house_vervut": "Род Вервут",
	"house_violette": "Род Виолетт",
	"house_iriswain": "Род Ирисвейн",
	"house_De_Rosa": "Род Де Розе",
	"house_sakada": "Род Сакада",
	"house_gimadzu": "Род Гимадзу",
	"house_fraum": "Род Фраум",
	"house_ion": "Род Йон",
	"house_mensen_merchant_guild": "Купеческая гильдия Менсена"
};

// Гербы главных родов фракций (для карты)

// ========== 17. БАЗА ВСЕХ ПОСЕЛЕНИЙ (ПОЛНАЯ) ==========
const SETTLEMENTS_DB = {
    // ========== ОРОЧИМА (Клан Дакэта, Даё) ==========
    "nobuno": { id: "nobuno", name: "Нобуно", type: "city", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1030, py: 725, icon: "emblem/armoria.png", isVassal: false, vassalHouse: null },
    "hida": { id: "hida", name: "Хида", type: "city", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1170, py: 720, icon: "emblem/Viva.png", isVassal: true, vassalHouse: "house_seiryu" },
    "akatsuki_castle": { id: "akatsuki_castle", name: "Акацуки", type: "castle", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 960, py: 820, icon: "emblem/armoria.png", isVassal: false, vassalHouse: null },
    "saika_castle": { id: "saika_castle", name: "Сайка", type: "castle", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1190, py: 900, icon: "emblem/armoria.png", isVassal: false, vassalHouse: null },
    "akai_castle": { id: "akai_castle", name: "Акай", type: "castle", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1110, py: 870, icon: "emblem/armorian.png", isVassal: true, vassalHouse: "house_nodaketa" },
    "kumo_castle": { id: "kumo_castle", name: "Кумо", type: "castle", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 940, py: 645, icon: "emblem/Kiso.png", isVassal: true, vassalHouse: "house_yurai" },
    "yukisaki": { id: "yukisaki", name: "Юкисаки", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 995, py: 730, icon: "emblem/armoria.png", isVassal: false, vassalHouse: null },
    "shiratori": { id: "shiratori", name: "Сиратори", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 960, py: 790, icon: "emblem/armoria.png", isVassal: false, vassalHouse: null },
    "kuramura": { id: "kuramura", name: "Курамура", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1000, py: 837, icon: "emblem/armoria.png", isVassal: false, vassalHouse: null },
    "chiga": { id: "chiga", name: "Чига", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1160, py: 870, icon: "emblem/armoria.png", isVassal: false, vassalHouse: null },
    "eri": { id: "eri", name: "Ёри", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1124, py: 716, icon: "emblem/armoria.png", isVassal: false, vassalHouse: null },
    "yomizu": { id: "yomizu", name: "Ёмидзу", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1140, py: 660, icon: "emblem/armoria.png", isVassal: false, vassalHouse: null },
    "kiyomizu": { id: "kiyomizu", name: "Киёмидзу", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1155, py: 565, icon: "emblem/armoria.png", isVassal: false, vassalHouse: null },
    "tsukimi": { id: "tsukimi", name: "Цукими", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1065, py: 560, icon: "emblem/armoria.png", isVassal: false, vassalHouse: null },
    "zagami": { id: "zagami", name: "Зэгами", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1155, py: 760, icon: "emblem/Viva.png", isVassal: true, vassalHouse: "house_seiryu" },
    "mabuki": { id: "mabuki", name: "Мабуки", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1187, py: 655, icon: "emblem/Viva.png", isVassal: true, vassalHouse: "house_seiryu" },
    "ouichi": { id: "ouichi", name: "Оичи", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1210, py: 815, icon: "emblem/ouichi.png", isVassal: true, vassalHouse: "house_yume" },
    "zaza": { id: "zaza", name: "Зухама", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1080, py: 790, icon: "emblem/Zaza.png", isVassal: true, vassalHouse: "house_senpu" },
    "ujo": { id: "ujo", name: "Удзё", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1100, py: 840, icon: "emblem/armorian.png", isVassal: true, vassalHouse: "house_nodaketa" },
    "momo": { id: "momo", name: "Момо", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1060, py: 875, icon: "emblem/armorian.png", isVassal: true, vassalHouse: "house_nodaketa" },
    "taka": { id: "taka", name: "Така", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 906, py: 730, icon: "emblem/Saito.png", isVassal: true, vassalHouse: "house_umi" },
    "miki": { id: "miki", name: "Мики", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 880, py: 740, icon: "emblem/Saito.png", isVassal: true, vassalHouse: "house_umi" },
    "hanaeri": { id: "hanaeri", name: "Ханаёри", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 910, py: 640, icon: "emblem/Kiso.png", isVassal: true, vassalHouse: "house_yurai" },
    "hara": { id: "hara", name: "Хара", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 1000, py: 677, icon: "emblem/Kiso.png", isVassal: true, vassalHouse: "house_yurai" },
    "mizu": { id: "mizu", name: "Мидзу", type: "village", province: "orochima", faction: "clan_daketa", rhetoric: "dayo", px: 975, py: 580, icon: "emblem/kikio.png", isVassal: true, vassalHouse: "house_gekken" },

    // ========== КАЙЯ ==========
    "klenogard": { id: "klenogard", name: "Кленогард", type: "city", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1680, py: 1370, icon: "emblem/Markarn.png", isVassal: false, vassalHouse: null },
    "tumoros_castle": { id: "tumoros_castle", name: "Туморос", type: "castle", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1815, py: 1045, icon: "emblem/Markarn.png", isVassal: false, vassalHouse: null },
    "vetrol_castle": { id: "vetrol_castle", name: "Ветрол", type: "castle", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1880, py: 1120, icon: "emblem/Markarn.png", isVassal: false, vassalHouse: null },
    "sweep_castle": { id: "sweep_castle", name: "Журавель", type: "castle", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1636, py: 987, icon: "emblem/Leono.png", isVassal: true, vassalHouse: "viscountcy_runheim" },
    "lotosway": { id: "lotosway", name: "Лотосвей", type: "village", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1725, py: 1365, icon: "emblem/Markarn.png", isVassal: false, vassalHouse: null },
    "krustar": { id: "krustar", name: "Хрустар", type: "village", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1700, py: 1310, icon: "emblem/Markarn.png", isVassal: false, vassalHouse: null },
    "torono": { id: "torono", name: "Тороно", type: "village", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1745, py: 1235, icon: "emblem/Markarn.png", isVassal: false, vassalHouse: null },
    "furinko": { id: "furinko", name: "Фуринко", type: "village", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1800, py: 1293, icon: "emblem/Markarn.png", isVassal: false, vassalHouse: null },
    "gornosa": { id: "gornosa", name: "Горноса", type: "village", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1710, py: 1170, icon: "emblem/Markarn.png", isVassal: false, vassalHouse: null },
    "hogava": { id: "hogava", name: "Хогава", type: "village", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1660, py: 1170, icon: "emblem/Markarn.png", isVassal: false, vassalHouse: null },
    "mitt": { id: "mitt", name: "Митт", type: "village", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1745, py: 1135, icon: "emblem/Markarn.png", isVassal: false, vassalHouse: null },
    "zhuravno": { id: "zhuravno", name: "Журавлино", type: "village", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1710, py: 1053, icon: "emblem/Leono.png", isVassal: true, vassalHouse: "viscountcy_runheim" },
    "nadzu": { id: "nadzu", name: "Надзу", type: "village", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1620, py: 1070, icon: "emblem/Leono.png", isVassal: true, vassalHouse: "viscountcy_runheim" },
    "eno": { id: "eno", name: "Эно", type: "village", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1585, py: 1053, icon: "emblem/Leono.png", isVassal: true, vassalHouse: "viscountcy_runheim" },
    "dzu": { id: "dzu", name: "Дзу", type: "village", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1615, py: 1110, icon: "emblem/Leono.png", isVassal: true, vassalHouse: "viscountcy_runheim" },
    "dza": { id: "dza", name: "Дза", type: "village", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1620, py: 1150, icon: "emblem/Leono.png", isVassal: true, vassalHouse: "viscountcy_runheim" },
    "lino": { id: "lino", name: "Лино", type: "village", province: "kaya", faction: "county_markarn", rhetoric: "loyal", px: 1650, py: 1110, icon: "emblem/Leono.png", isVassal: true, vassalHouse: "viscountcy_runheim" },

    // ========== ФОГЕЛЬ ==========
    "vogelsburg": { id: "vogelsburg", name: "Фогельсбург", type: "city", province: "vogel", faction: "county_vogelmark", rhetoric: "loyal", px: 1785, py: 220, icon: "emblem/Vogelmark.png", isVassal: false, vassalHouse: null },
    "vill_castle": { id: "vill_castle", name: "Вилл", type: "castle", province: "vogel", faction: "county_vogelmark", rhetoric: "loyal", px: 1760, py: 262, icon: "emblem/Vogelmark.png", isVassal: false, vassalHouse: null },
    "rosenthal_castle": { id: "rosenthal_castle", name: "Розенталь", type: "castle", province: "vogel", faction: "county_vogelmark", rhetoric: "loyal", px: 1900, py: 227, icon: "emblem/Vogelmark.png", isVassal: false, vassalHouse: null },
    "birchbark": { id: "birchbark", name: "Берестень", type: "village", province: "vogel", faction: "county_vogelmark", rhetoric: "loyal", px: 1783, py: 315, icon: "emblem/Vogelmark.png", isVassal: false, vassalHouse: null },
    "nakhidko": { id: "nakhidko", name: "Нахидко", type: "village", province: "vogel", faction: "county_vogelmark", rhetoric: "loyal", px: 1820, py: 306, icon: "emblem/Vogelmark.png", isVassal: false, vassalHouse: null },
    "elfenwald": { id: "elfenwald", name: "Эльфенвальд", type: "village", province: "vogel", faction: "county_vogelmark", rhetoric: "loyal", px: 1843, py: 273, icon: "emblem/Vogelmark.png", isVassal: false, vassalHouse: null },
    "vogelsang": { id: "vogelsang", name: "Фогельзанг", type: "village", province: "vogel", faction: "county_vogelmark", rhetoric: "loyal", px: 1840, py: 190, icon: "emblem/Vogelmark.png", isVassal: false, vassalHouse: null },
    "rosen": { id: "rosen", name: "Розен", type: "village", province: "vogel", faction: "county_vogelmark", rhetoric: "loyal", px: 1935, py: 217, icon: "emblem/Vogelmark.png", isVassal: false, vassalHouse: null },
    "lindenfurt": { id: "lindenfurt", name: "Линденфурт", type: "village", province: "vogel", faction: "county_vogelmark", rhetoric: "loyal", px: 1932, py: 255, icon: "emblem/Vogelmark.png", isVassal: false, vassalHouse: null },
    "blackforest": { id: "blackforest", name: "Шварцвей", type: "village", province: "vogel", faction: "county_vogelmark", rhetoric: "loyal", px: 1985, py: 286, icon: "emblem/Vogelmark.png", isVassal: false, vassalHouse: null },

    // ========== НЕОЛАНИЯ ==========
    "gorsk": { id: "gorsk", name: "Горск", type: "city", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3203, py: 945, icon: "emblem/Gorski.png", isVassal: false, vassalHouse: null },
    "chatte_castle": { id: "chatte_castle", name: "Шатте", type: "castle", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3265, py: 1158, icon: "emblem/Gorski.png", isVassal: false, vassalHouse: null },
    "stein": { id: "stein", name: "Штайн", type: "city", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3022, py: 1060, icon: "emblem/Voronetsky.png", isVassal: true, vassalHouse: "viscountcy_voronetsky" },
    "rosen_castle": { id: "rosen_castle", name: "Розен", type: "castle", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3033, py: 1100, icon: "emblem/Voronetsky.png", isVassal: true, vassalHouse: "viscountcy_voronetsky" },
    "hawksley": { id: "hawksley", name: "Хоксли", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3224, py: 983, icon: "emblem/Gorski.png", isVassal: false, vassalHouse: null },
    "redbrook": { id: "redbrook", name: "Редбрук", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3272, py: 986, icon: "emblem/Gorski.png", isVassal: false, vassalHouse: null },
    "winter": { id: "winter", name: "Уинтер", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3325, py: 1007, icon: "emblem/Gorski.png", isVassal: false, vassalHouse: null },
    "meadow": { id: "meadow", name: "Мейдоу", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3258, py: 1055, icon: "emblem/Gorski.png", isVassal: false, vassalHouse: null },
    "glen": { id: "glen", name: "Глен", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3328, py: 1082, icon: "emblem/Gorski.png", isVassal: false, vassalHouse: null },
    "verbruk": { id: "verbruk", name: "Вербрук", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3371, py: 1122, icon: "emblem/Gorski.png", isVassal: false, vassalHouse: null },
    "kenfor": { id: "kenfor", name: "Кенфор", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3316, py: 1184, icon: "emblem/Gorski.png", isVassal: false, vassalHouse: null },
    "holm": { id: "holm", name: "Хольм", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3181, py: 1163, icon: "emblem/Gorski.png", isVassal: false, vassalHouse: null },
    "oak": { id: "oak", name: "Оук", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3384, py: 1179, icon: "emblem/Gorski.png", isVassal: false, vassalHouse: null },
    "dale": { id: "dale", name: "Дейл", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3079, py: 1018, icon: "emblem/Voronetsky.png", isVassal: true, vassalHouse: "viscountcy_voronetsky" },
    "rest": { id: "rest", name: "Рест", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3115, py: 1120, icon: "emblem/Voronetsky.png", isVassal: true, vassalHouse: "viscountcy_voronetsky" },
    "aifil": { id: "aifil", name: "Айфил", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 3000, py: 992, icon: "emblem/Voronetsky.png", isVassal: true, vassalHouse: "viscountcy_voronetsky" },
    "lugvin": { id: "lugvin", name: "Лугвин", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 2955, py: 1082, icon: "emblem/Voronetsky.png", isVassal: true, vassalHouse: "viscountcy_voronetsky" },
    "branibor": { id: "branibor", name: "Бранибор", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 2938, py: 1135, icon: "emblem/Voronetsky.png", isVassal: true, vassalHouse: "viscountcy_voronetsky" },
    "rozdyan": { id: "rozdyan", name: "Роздян", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 2990, py: 1114, icon: "emblem/Voronetsky.png", isVassal: true, vassalHouse: "viscountcy_voronetsky" },
    "division": { id: "division", name: "Дивид", type: "village", province: "neolania", faction: "principality_gorski", rhetoric: "proyurgan", px: 2985, py: 1165, icon: "emblem/Voronetsky.png", isVassal: true, vassalHouse: "viscountcy_voronetsky" },

    // ========== СТОЛИЧНАЯ ОБЛАСТЬ ==========
    "yaramo": { id: "yaramo", name: "Ярамо", type: "city", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2030, py: 900, icon: "emblem/Regents.png", isVassal: false, vassalHouse: null },
    "hinode": { id: "hinode", name: "Хинодэ", type: "city", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2000, py: 1055, icon: "emblem/Regents.png", isVassal: false, vassalHouse: null },
    "mizugaki": { id: "mizugaki", name: "Мидзугаки", type: "city", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2062, py: 1315, icon: "emblem/Regents.png", isVassal: false, vassalHouse: null },
    "westmar_castle": { id: "westmar_castle", name: "Вестмар", type: "castle", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 1988, py: 977, icon: "emblem/Regents.png", isVassal: false, vassalHouse: null },
    "walden_castle": { id: "walden_castle", name: "Вальден", type: "castle", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 1932, py: 1131, icon: "emblem/Regents.png", isVassal: false, vassalHouse: null },
    "nijo_castle": { id: "nijo_castle", name: "Нидзё", type: "castle", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2180, py: 943, icon: "emblem/Regents.png", isVassal: false, vassalHouse: null },
    "ruga_castle": { id: "ruga_castle", name: "Руга", type: "castle", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2284, py: 1190, icon: "emblem/Regents.png", isVassal: false, vassalHouse: null },
    "truck_truck": { id: "truck_truck", name: "Фуру-фуру", type: "village", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 1980, py: 940, icon: "emblem/Regents.png", isVassal: false, vassalHouse: null },
    "hawksley_metro": { id: "hawksley_metro", name: "Хоксли", type: "village", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 1978, py: 1173, icon: "emblem/Regents.png", isVassal: false, vassalHouse: null },
    "namina": { id: "namina", name: "Намина", type: "village", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2112, py: 930, icon: "emblem/Regents.png", isVassal: false, vassalHouse: null },
    "milton": { id: "milton", name: "Милтон", type: "village", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2090, py: 943, icon: "emblem/Regents.png", isVassal: false, vassalHouse: null },
    "minari": { id: "minari", name: "Минари", type: "village", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2098, py: 970, icon: "emblem/Regents.png", isVassal: false, vassalHouse: null },
    "unmarch": { id: "unmarch", name: "Унмарш", type: "village", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2122, py: 1030, icon: "emblem/Regents.png", isVassal: false, vassalHouse: null },
    "verbruk_metro": { id: "verbruk_metro", name: "Вербрук", type: "village", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2184, py: 1120, icon: "emblem/Regents.png", isVassal: false, vassalHouse: null },
    "track_track": { id: "track_track", name: "Фару-фару", type: "village", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2218, py: 1233, icon: "emblem/Regents.png", isVassal: false, vassalHouse: null },
    "takao": { id: "takao", name: "Такао", type: "village", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2068, py: 867, icon: "emblem/Regents.png", isVassal: false, vassalHouse: null },
    "nasaki": { id: "nasaki", name: "Насаки", type: "village", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2126, py: 841, icon: "emblem/Regents.png", isVassal: false, vassalHouse: null },
    "mill": { id: "mill", name: "Милл", type: "village", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2050, py: 962, icon: "emblem/Regents.png", isVassal: false, vassalHouse: null },
    "fuka": { id: "fuka", name: "Фука", type: "village", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2011, py: 989, icon: "emblem/Regents.png", isVassal: false, vassalHouse: null },
    "ilver": { id: "ilver", name: "Илвер", type: "village", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2035, py: 1033, icon: "emblem/Regents.png", isVassal: false, vassalHouse: null },
    "greenh": { id: "greenh", name: "Гринх", type: "village", province: "metropolitan_area", faction: "regency_council", rhetoric: "neutral", px: 2011, py: 1215, icon: "emblem/Regents.png", isVassal: false, vassalHouse: null },

    // ========== ВЕЛИКИЙ ВАЛ ==========
    "main_gate": { id: "main_gate", name: "Главные ворота", type: "castle", province: "great_shaft", faction: "regency_council", rhetoric: "neutral", px: 3100, py: 1942, icon: "emblem/wall.png", isVassal: true, vassalHouse: "great_wall" },
    "southern_citadel": { id: "southern_citadel", name: "Южная Цитадель", type: "castle", province: "great_shaft", faction: "regency_council", rhetoric: "neutral", px: 3036, py: 1914, icon: "emblem/wall.png", isVassal: true, vassalHouse: "great_wall" },
    "red_citadel": { id: "red_citadel", name: "Красная Цитадель", type: "castle", province: "great_shaft", faction: "regency_council", rhetoric: "neutral", px: 3090, py: 1915, icon: "emblem/wall.png", isVassal: true, vassalHouse: "great_wall" },
    "small_gate": { id: "small_gate", name: "Малые ворота", type: "castle", province: "great_shaft", faction: "regency_council", rhetoric: "neutral", px: 3118, py: 1970, icon: "emblem/wall.png", isVassal: true, vassalHouse: "great_wall" },
    "signal_tower": { id: "signal_tower", name: "Сигнальная башня", type: "castle", province: "great_shaft", faction: "regency_council", rhetoric: "neutral", px: 3158, py: 1968, icon: "emblem/wall.png", isVassal: true, vassalHouse: "great_wall" },
    "main_citadel": { id: "main_citadel", name: "Главная цитадель", type: "castle", province: "great_shaft", faction: "regency_council", rhetoric: "neutral", px: 3192, py: 1956, icon: "emblem/wall.png", isVassal: true, vassalHouse: "great_wall" },
    "northern_signal_tower": { id: "northern_signal_tower", name: "Северная сигнальная башня", type: "castle", province: "great_shaft", faction: "regency_council", rhetoric: "neutral", px: 3216, py: 1974, icon: "emblem/wall.png", isVassal: true, vassalHouse: "great_wall" },
    "north_gate": { id: "north_gate", name: "Северные ворота", type: "castle", province: "great_shaft", faction: "regency_council", rhetoric: "neutral", px: 3245, py: 2000, icon: "emblem/wall.png", isVassal: true, vassalHouse: "great_wall" },
    "south_gate": { id: "south_gate", name: "Южные ворота", type: "castle", province: "great_shaft", faction: "regency_council", rhetoric: "neutral", px: 3060, py: 1918, icon: "emblem/wall.png", isVassal: true, vassalHouse: "great_wall" },
    "ruins": { id: "ruins", name: "Руины", type: "village", province: "great_shaft", faction: "regency_council", rhetoric: "neutral", px: 3056, py: 1947, icon: "emblem/wall.png", isVassal: true, vassalHouse: "great_wall" },
    "northern_outpost": { id: "northern_outpost", name: "Северный аванпост", type: "village", province: "great_shaft", faction: "regency_council", rhetoric: "neutral", px: 3202, py: 2026, icon: "emblem/wall.png", isVassal: true, vassalHouse: "great_wall" },
    "village_edge": { id: "village_edge", name: "Край", type: "village", province: "great_shaft", faction: "regency_council", rhetoric: "neutral", px: 3051, py: 1881, icon: "emblem/wall.png", isVassal: true, vassalHouse: "great_wall" },
    "femal_village": { id: "femal_village", name: "Фемал", type: "village", province: "great_shaft", faction: "regency_council", rhetoric: "neutral", px: 3136, py: 1921, icon: "emblem/wall.png", isVassal: true, vassalHouse: "great_wall" },
    "armas_village": { id: "armas_village", name: "Армас", type: "village", province: "great_shaft", faction: "regency_council", rhetoric: "neutral", px: 3194, py: 1913, icon: "emblem/wall.png", isVassal: true, vassalHouse: "great_wall" },
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

    // ========== Муцура ==========
    "Yugureno": { id: "Yugureno", name: "Югурэно", type: "city", province: "mutsura", faction: "clan_date", rhetoric: "dayo", px: 856, py: 996, icon: "emblem/house_yamano.png", isVassal: true, vassalHouse: "house_yamano" },
    "Sendai": { id: "Sendai", name: "Сендай", type: "city", province: "mutsura", faction: "clan_date", rhetoric: "dayo", px: 1016, py: 973, icon: "emblem/date.png", isVassal: false, vassalHouse: null },
    "Kagezato": { id: "Kagezato", name: "Кагэдзато", type: "castle", province: "mutsura", faction: "clan_date", rhetoric: "dayo", px: 631, py: 1018, icon: "emblem/house_hatamoto_b.png", isVassal: true, vassalHouse: "house_hatamoto_b" },
    "Hikarimura": { id: "Hikarimura", name: "Хикаримура", type: "castle", province: "mutsura", faction: "clan_date", rhetoric: "dayo", px: 856, py: 811, icon: "emblem/house_hatamoto_a.png", isVassal: true, vassalHouse: "house_hatamoto_a" },
    "Kazeoka": { id: "Kazeoka", name: "Кадзэока", type: "castle", province: "mutsura", faction: "clan_date", rhetoric: "dayo", px: 959, py: 918, icon: "emblem/house_tokosi.png", isVassal: true, vassalHouse: "house_tokosi" },
    "Zugahara": { id: "Zugahara", name: "Зугахара", type: "castle", province: "mutsura", faction: "clan_date", rhetoric: "dayo", px: 1115, py: 922, icon: "emblem/date.png", isVassal: false, vassalHouse: null },
    "Tsunagiko": { id: "Tsunagiko", name: "Цунагико", type: "village", province: "mutsura", faction: "clan_date", rhetoric: "dayo", px: 646, py: 822, icon: "emblem/house_hatamoto_c.png", isVassal: true, vassalHouse: "house_hatamoto_c" },
    "Sakuramori": { id: "Sakuramori", name: "Сакурамори", type: "village", province: "mutsura", faction: "clan_date", rhetoric: "dayo", px: 626, py: 870, icon: "emblem/house_hatamoto_c.png", isVassal: true, vassalHouse: "house_hatamoto_c" },
    "Umihiro": { id: "Umihiro", name: "Умихиро", type: "village", province: "mutsura", faction: "clan_date", rhetoric: "dayo", px: 712, py: 1032, icon: "emblem/house_hatamoto_b.png", isVassal: true, vassalHouse: "house_hatamoto_b" },
    "Yamakage": { id: "Yamakage", name: "Ямакагэ", type: "village", province: "mutsura", faction: "clan_date", rhetoric: "dayo", px: 800, py: 1008, icon: "emblem/house_yamano.png", isVassal: true, vassalHouse: "house_yamano" },
    "Shinry": { id: "Shinry", name: "Синрю", type: "village", province: "mutsura", faction: "clan_date", rhetoric: "dayo", px: 860, py: 922, icon: "emblem/house_yamano.png", isVassal: true, vassalHouse: "house_yamano" },
    "Kokoroishi": { id: "Kokoroishi", name: "Кокороиси", type: "village", province: "mutsura", faction: "clan_date", rhetoric: "dayo", px: 998, py: 903, icon: "emblem/house_tokosi.png", isVassal: true, vassalHouse: "house_tokosi" },
    "Tsukiyama": { id: "Tsukiyama", name: "Цукияма", type: "village", province: "mutsura", faction: "clan_date", rhetoric: "dayo", px: 995, py: 991, icon: "emblem/date.png", isVassal: false, vassalHouse: null },
    "Murakumo": { id: "Murakumo", name: "Муракумо", type: "village", province: "mutsura", faction: "clan_date", rhetoric: "dayo", px: 988, py: 1069, icon: "emblem/date.png", isVassal: false, vassalHouse: null },
    "Kazan": { id: "Kazan", name: "Казан", type: "village", province: "mutsura", faction: "clan_date", rhetoric: "dayo", px: 1064, py: 975, icon: "emblem/date.png", isVassal: false, vassalHouse: null },
    "Asagao": { id: "Asagao", name: "Асагао", type: "village", province: "mutsura", faction: "clan_date", rhetoric: "dayo", px: 1120, py: 993, icon: "emblem/date.png", isVassal: false, vassalHouse: null },
    "Shirogahara": { id: "Shirogahara", name: "Сирогахара", type: "village", province: "mutsura", faction: "clan_date", rhetoric: "dayo", px: 1097, py: 1021, icon: "emblem/date.png", isVassal: false, vassalHouse: null },
    "Takiguchi": { id: "Takiguchi", name: "Такигути", type: "village", province: "mutsura", faction: "clan_date", rhetoric: "dayo", px: 1075, py: 1059, icon: "emblem/house_segawa.png", isVassal: true, vassalHouse: "house_segawa" },
    "Mura": { id: "Mura", name: "Мура", type: "village", province: "mutsura", faction: "clan_date", rhetoric: "dayo", px: 1112, py: 1068, icon: "emblem/house_fujii.png", isVassal: true, vassalHouse: "house_fujii" },
    "Onizakura": { id: "Onizakura", name: "Онидзакура", type: "village", province: "mutsura", faction: "clan_date", rhetoric: "dayo", px: 1172, py: 1072, icon: "emblem/house_fujii.png", isVassal: true, vassalHouse: "house_fujii" },
    "Doroki": { id: "Doroki", name: "Дороки", type: "village", province: "mutsura", faction: "clan_date", rhetoric: "dayo", px: 1099, py: 1153, icon: "emblem/house_hatamoto_d.png", isVassal: true, vassalHouse: "house_hatamoto_d" },
    "Hika": { id: "Hika", name: "Хика", type: "village", province: "mutsura", faction: "clan_date", rhetoric: "dayo", px: 1133, py: 1085, icon: "emblem/house_fujii.png", isVassal: true, vassalHouse: "house_fujii" },

    // ========== ЛОЯЛИСТСКИЕ ПРОВИНЦИИ (незанятые, временные заглушки) ==========
    
    // Провинция ТАКАНИЯ
    "berona": { id: "berona", name: "Берона", type: "city", province: "takania", faction: "county_takania", rhetoric: "loyal", px: 1390, py: 1033, icon: "emblem/takania.png", isVassal: false, vassalHouse: null },
    "Brockston": { id: "Brockston", name: "Брекстон", type: "city", province: "takania", faction: "county_takania", rhetoric: "loyal", px: 1500, py: 1000, icon: "emblem/house_cald.png", isVassal: true, vassalHouse: "house_cald" },
    "Kinugawa": { id: "Kinugawa", name: "Кинугава", type: "castle", province: "takania", faction: "county_takania", rhetoric: "loyal", px: 1200, py: 1015, icon: "emblem/takania.png", isVassal: false, vassalHouse: null },
    "Hananoe": { id: "Hananoe", name: "Хананоэ", type: "castle", province: "takania", faction: "county_takania", rhetoric: "loyal", px: 1417, py: 763, icon: "emblem/house_ippon.png", isVassal: true, vassalHouse: "house_ippon" },
    "Grimsvik": { id: "Grimsvik", name: "Гримсвик", type: "castle", province: "takania", faction: "county_takania", rhetoric: "loyal", px: 1583, py: 1000, icon: "emblem/house_cald.png", isVassal: false, vassalHouse: "house_cald" },
    "Otori": { id: "Otori", name: "Отори", type: "village", province: "takania", faction: "county_takania", rhetoric: "loyal", px: 1228, py: 1047, icon: "emblem/takania.png", isVassal: false, vassalHouse: null },
    "Akagasa": { id: "Akagasa", name: "Акагаса", type: "village", province: "takania", faction: "county_takania", rhetoric: "loyal", px: 1260, py: 1066, icon: "emblem/takania.png", isVassal: false, vassalHouse: null },
    "Haruno": { id: "Haruno", name: "Харуно", type: "village", province: "takania", faction: "county_takania", rhetoric: "loyal", px: 1230, py: 1105, icon: "emblem/takania.png", isVassal: false, vassalHouse: null },
    "Fels": { id: "Fels", name: "Фельс", type: "village", province: "takania", faction: "county_takania", rhetoric: "loyal", px: 1290, py: 1023, icon: "emblem/takania.png", isVassal: false, vassalHouse: null },
    "Judenburg": { id: "Judenburg", name: "Юденбург", type: "village", province: "takania", faction: "county_takania", rhetoric: "loyal", px: 1335, py: 1018, icon: "emblem/takania.png", isVassal: false, vassalHouse: null },
    "Tenvik": { id: "Tenvik", name: "Тенвик", type: "village", province: "takania", faction: "county_takania", rhetoric: "loyal", px: 1365, py: 1056, icon: "emblem/takania.png", isVassal: false, vassalHouse: null },
    "Denburg": { id: "Denburg", name: "Денбург", type: "village", province: "takania", faction: "county_takania", rhetoric: "loyal", px: 1355, py: 960, icon: "emblem/takania.png", isVassal: false, vassalHouse: null },
    "Kolom": { id: "Kolom", name: "Колом", type: "village", province: "takania", faction: "county_takania", rhetoric: "loyal", px: 1393, py: 955, icon: "emblem/takania.png", isVassal: false, vassalHouse: null },
    "Landsgrove": { id: "Landsgrove", name: "Ландсгрув", type: "village", province: "takania", faction: "county_takania", rhetoric: "loyal", px: 1426, py: 1015, icon: "emblem/house_cald.png", isVassal: true, vassalHouse: "house_cald" },
    "Nagisa": { id: "Nagisa", name: "Нагиса", type: "village", province: "takania", faction: "county_takania", rhetoric: "loyal", px: 1370, py: 840, icon: "emblem/house_ippon.png", isVassal: true, vassalHouse: "house_ippon" },
    "Usui": { id: "Usui", name: "Усуи", type: "village", province: "takania", faction: "county_takania", rhetoric: "loyal", px: 1453, py: 772, icon: "emblem/house_ippon.png", isVassal: true, vassalHouse: "house_ippon" },
    "Tatsukura": { id: "Tatsukura", name: "Тацукура", type: "village", province: "takania", faction: "county_takania", rhetoric: "loyal", px: 1447, py: 813, icon: "emblem/house_ippon.png", isVassal: true, vassalHouse: "house_ippon" },
    "Murston": { id: "Murston", name: "Мюрстон", type: "village", province: "takania", faction: "county_takania", rhetoric: "loyal", px: 1500, py: 823, icon: "emblem/house_ippon.png", isVassal: true, vassalHouse: "house_ippon" },
    "Dornheim": { id: "Dornheim", name: "Дорнхейм", type: "village", province: "takania", faction: "county_takania", rhetoric: "loyal", px: 1537, py: 771, icon: "emblem/house_ippon.png", isVassal: true, vassalHouse: "house_ippon" },
    "Westborne": { id: "Westborne", name: "Вестборн", type: "village", province: "takania", faction: "county_takania", rhetoric: "loyal", px: 1573, py: 834, icon: "emblem/house_ippon.png", isVassal: true, vassalHouse: "house_ippon" },
    "Nordheim": { id: "Nordheim", name: "Нордхейм", type: "village", province: "takania", faction: "county_takania", rhetoric: "loyal", px: 1526, py: 942, icon: "emblem/house_cald.png", isVassal: true, vassalHouse: "house_cald" },
    "Ostenmark": { id: "Ostenmark", name: "Остенмарк", type: "village", province: "takania", faction: "county_takania", rhetoric: "loyal", px: 1537, py: 1021, icon: "emblem/house_cald.png", isVassal: true, vassalHouse: "house_cald" },
    "Rennford": { id: "Rennford", name: "Реннфорд", type: "village", province: "takania", faction: "county_takania", rhetoric: "loyal", px: 1565, py: 965, icon: "emblem/house_cald.png", isVassal: true, vassalHouse: "house_cald" },

    // Провинция Менсен
    "grotdtadt": { id: "grotdtadt", name: "Гротстадт", type: "city", province: "mensen", faction: "county_mensen", rhetoric: "loyal", px: 1520, py: 565, icon: "emblem/mensen.png", isVassal: false, vassalHouse: null },
    "falkenstein": { id: "falkenstein", name: "Фалькенштайн", type: "castle", province: "mensen", faction: "county_mensen", rhetoric: "loyal", px: 1525, py: 510, icon: "emblem/ion.png", isVassal: true, vassalHouse: "house_ion" },
    "eisenfels": { id: "eisenfels", name: "Айзенфельс", type: "castle", province: "mensen", faction: "county_mensen", rhetoric: "loyal", px: 1565, py: 562, icon: "emblem/mensen.png", isVassal: false, vassalHouse: null },
    "Ayatan": { id: "Ayatan", name: "Аятан", type: "village", province: "mensen", faction: "county_mensen", rhetoric: "loyal", px: 1230, py: 570, icon: "emblem/gimadzu.png", isVassal: true, vassalHouse: "house_gimadzu" },
    "Bergayan": { id: "Bergayan", name: "Бергаян", type: "village", province: "mensen", faction: "county_mensen", rhetoric: "loyal", px: 1270, py: 540, icon: "emblem/gimadzu.png", isVassal: true, vassalHouse: "house_gimadzu" },
    "Dorono": { id: "Dorono", name: "Дороно", type: "village", province: "mensen", faction: "county_mensen", rhetoric: "loyal", px: 1300, py: 533, icon: "emblem/gimadzu.png", isVassal: true, vassalHouse: "house_gimadzu" },
    "Ayayka": { id: "Ayayka", name: "Айяйка", type: "village", province: "mensen", faction: "county_mensen", rhetoric: "loyal", px: 1345, py: 545, icon: "emblem/sakada.png", isVassal: true, vassalHouse: "house_sakada" },
    "Fellah": { id: "Fellah", name: "Фелла", type: "village", province: "mensen", faction: "county_mensen", rhetoric: "loyal", px: 1387, py: 505, icon: "emblem/mensen.png", isVassal: false, vassalHouse: null },
    "Kirah": { id: "Kirah", name: "Кираха", type: "village", province: "mensen", faction: "county_mensen", rhetoric: "loyal", px: 1393, py: 575, icon: "emblem/sakada.png", isVassal: true, vassalHouse: "house_sakada" },
    "Altendorf": { id: "Altendorf", name: "Альтендорф", type: "village", province: "mensen", faction: "county_mensen", rhetoric: "loyal", px: 1375, py: 715, icon: "emblem/fraum.png", isVassal: true, vassalHouse: "house_fraum" },
    "Bergheim": { id: "Bergheim", name: "Бергхайм", type: "village", province: "mensen", faction: "county_mensen", rhetoric: "loyal", px: 1351, py: 735, icon: "emblem/fraum.png", isVassal: true, vassalHouse: "house_fraum" },
    "Dornfeld": { id: "Dornfeld", name: "Дорнфельд", type: "village", province: "mensen", faction: "county_mensen", rhetoric: "loyal", px: 1475, py: 446, icon: "emblem/ion.png", isVassal: true, vassalHouse: "house_ion" },
    "Eichenwald": { id: "Eichenwald", name: "Айхенвальд", type: "village", province: "mensen", faction: "county_mensen", rhetoric: "loyal", px: 1570, py: 605, icon: "emblem/mensen.png", isVassal: false, vassalHouse: null },
    "Feldkirch": { id: "Feldkirch", name: "Фельдкирх", type: "village", province: "mensen", faction: "county_mensen", rhetoric: "loyal", px: 1602, py: 620, icon: "emblem/mensen.png", isVassal: false, vassalHouse: null },
    "Kirchberg": { id: "Kirchberg", name: "Кирхберг", type: "village", province: "mensen", faction: "county_mensen", rhetoric: "loyal", px: 1630, py: 575, icon: "emblem/mensen.png", isVassal: false, vassalHouse: null },

    // Провинция Мейан
    "Meyan": { id: "Meyan", name: "Мейан", type: "city", province: "meyan", faction: "county_meyan", rhetoric: "loyal", px: 1785, py: 965, icon: "emblem/meyan.png", isVassal: false, vassalHouse: null },
    "Buregot": { id: "Buregot", name: "Бурегот", type: "castle", province: "meyan", faction: "county_meyan", rhetoric: "loyal", px: 1930, py: 974, icon: "emblem/meyan.png", isVassal: false, vassalHouse: null },
    "Kravets": { id: "Kravets", name: "Кравец", type: "castle", province: "meyan", faction: "county_meyan", rhetoric: "loyal", px: 1637, py: 862, icon: "emblem/waldhof.png", isVassal: true, vassalHouse: "house_waldhof" },
    "Belaya_Pushcha": { id: "Belaya_Pushcha", name: "Белая Пуща", type: "castle", province: "meyan", faction: "county_meyan", rhetoric: "loyal", px: 1657, py: 688, icon: "emblem/montbrun.png", isVassal: true, vassalHouse: "house_montbrun" },
    "Lonely_Hill": { id: "Lonely_Hill", name: "Одинокий холм", type: "village", province: "meyan", faction: "county_meyan", rhetoric: "loyal", px: 1612, py: 800, icon: "emblem/waldhof.png", isVassal: true, vassalHouse: "house_waldhof" },
    "Helimdrim": { id: "Helimdrim", name: "Хелимдрим", type: "village", province: "meyan", faction: "county_meyan", rhetoric: "loyal", px: 1660, py: 777, icon: "emblem/waldhof.png", isVassal: true, vassalHouse: "house_waldhof" },
    "Crossroads": { id: "Crossroads", name: "Перекрёсток", type: "village", province: "meyan", faction: "county_meyan", rhetoric: "loyal", px: 1743, py: 683, icon: "emblem/montbrun.png", isVassal: true, vassalHouse: "house_montbrun" },
    "Bertha": { id: "Bertha", name: "Бертова", type: "village", province: "meyan", faction: "county_meyan", rhetoric: "loyal", px: 1698, py: 738, icon: "emblem/montbrun.png", isVassal: true, vassalHouse: "house_montbrun" },
    "Slingshot": { id: "Slingshot", name: "Рогатка", type: "village", province: "meyan", faction: "county_meyan", rhetoric: "loyal", px: 1741, py: 747, icon: "emblem/montbrun.png", isVassal: true, vassalHouse: "house_montbrun" },
    "Darkwood": { id: "Darkwood", name: "Темнолесье", type: "village", province: "meyan", faction: "county_meyan", rhetoric: "loyal", px: 1811, py: 738, icon: "emblem/montbrun.png", isVassal: true, vassalHouse: "house_montbrun" },
    "Wasteland": { id: "Wasteland", name: "Пустырь", type: "village", province: "meyan", faction: "county_meyan", rhetoric: "loyal", px: 1707, py: 806, icon: "emblem/waldhof.png", isVassal: true, vassalHouse: "house_waldhof" },
    "Roderome": { id: "Roderome", name: "Родэром", type: "village", province: "meyan", faction: "county_meyan", rhetoric: "loyal", px: 1755, py: 810, icon: "emblem/waldhof.png", isVassal: true, vassalHouse: "house_waldhof" },
    "Forest_Cannon": { id: "Forest_Cannon", name: "Лесопушка", type: "village", province: "meyan", faction: "county_meyan", rhetoric: "loyal", px: 1757, py: 862, icon: "emblem/meyan.png", isVassal: false, vassalHouse: null },
    "Lonely_Sword": { id: "Lonely_Sword", name: "Одинокий меч", type: "village", province: "meyan", faction: "county_meyan", rhetoric: "loyal", px: 1796, py: 847, icon: "emblem/meyan.png", isVassal: false, vassalHouse: null },
    "Iron_Hill": { id: "Iron_Hill", name: "Железный холм", type: "village", province: "meyan", faction: "county_meyan", rhetoric: "loyal", px: 1840, py: 838, icon: "emblem/meyan.png", isVassal: false, vassalHouse: null },
    "Prigorye": { id: "Prigorye", name: "Пригорье", type: "village", province: "meyan", faction: "county_meyan", rhetoric: "loyal", px: 1882, py: 853, icon: "emblem/meyan.png", isVassal: false, vassalHouse: null },
    "Woodcutter": { id: "Woodcutter", name: "Лесодрев", type: "village", province: "meyan", faction: "county_meyan", rhetoric: "loyal", px: 1693, py: 920, icon: "emblem/meyan.png", isVassal: false, vassalHouse: null },
    "Yariskovaya": { id: "Yariskovaya", name: "Ярисковая", type: "village", province: "meyan", faction: "county_meyan", rhetoric: "loyal", px: 1740, py: 955, icon: "emblem/meyan.png", isVassal: false, vassalHouse: null },
    "Burezek": { id: "Burezek", name: "Буресек", type: "village", province: "meyan", faction: "county_meyan", rhetoric: "loyal", px: 1802, py: 920, icon: "emblem/meyan.png", isVassal: false, vassalHouse: null },
    "Kropiv": { id: "Kropiv", name: "Кропив", type: "village", province: "meyan", faction: "county_meyan", rhetoric: "loyal", px: 1840, py: 937, icon: "emblem/meyan.png", isVassal: false, vassalHouse: null },
    "Rabulev": { id: "Rabulev", name: "Рабулев", type: "village", province: "meyan", faction: "county_meyan", rhetoric: "loyal", px: 1818, py: 983, icon: "emblem/meyan.png", isVassal: false, vassalHouse: null },

    // Провинция Найтстен
    "auguros": { id: "auguros", name: "Авгурос", type: "city", province: "nightsten", faction: "order_varsiltaers", rhetoric: "loyal", px: 1706, py: 360, icon: "emblem/varsiltaer.png", isVassal: false, vassalHouse: null },
    "Varsil": { id: "Varsil", name: "Варсил", type: "castle", province: "nightsten", faction: "order_varsiltaers", rhetoric: "loyal", px: 1735, py: 330, icon: "emblem/varsiltaer.png", isVassal: false, vassalHouse: null },
    "Taer": { id: "Taer", name: "Таер", type: "castle", province: "nightsten", faction: "order_varsiltaers", rhetoric: "loyal", px: 1681, py: 528, icon: "emblem/varsiltaer.png", isVassal: false, vassalHouse: null },
	"montclair": { id: "montclair", name: "Монклер", type: "village", province: "nightsten", faction: "order_varsiltaers", rhetoric: "loyal", px: 1540, py: 360, icon: "emblem/house_valdgreiv.png", isVassal: true, vassalHouse: "house_valdgreiv" },
	"beaumont": { id: "beaumont", name: "Бомон", type: "village", province: "nightsten", faction: "order_varsiltaers", rhetoric: "loyal", px: 1612, py: 375, icon: "emblem/house_valdgreiv.png", isVassal: true, vassalHouse: "house_valdgreiv" },
	"fontenay": { id: "fontenay", name: "Фонтене", type: "village", province: "nightsten", faction: "order_varsiltaers", rhetoric: "loyal", px: 1600, py: 463, icon: "emblem/house_valdgreiv.png", isVassal: true, vassalHouse: "house_valdgreiv" },
	"verneuil": { id: "verneuil", name: "Вернёй", type: "village", province: "nightsten", faction: "order_varsiltaers", rhetoric: "loyal", px: 1670, py: 300, icon: "emblem/house_valdgreiv.png", isVassal: true, vassalHouse: "house_valdgreiv" },
	"bellevue": { id: "bellevue", name: "Бельвю", type: "village", province: "nightsten", faction: "order_varsiltaers", rhetoric: "loyal", px: 1738, py: 407, icon: "emblem/varsiltaer.png", isVassal: false, vassalHouse: null },
	"chambord": { id: "chambord", name: "Шамбор", type: "village", province: "nightsten", faction: "order_varsiltaers", rhetoric: "loyal", px: 1710, py: 425, icon: "emblem/varsiltaer.png", isVassal: false, vassalHouse: null },
	"illon": { id: "illon", name: "Ильон", type: "village", province: "nightsten", faction: "order_varsiltaers", rhetoric: "loyal", px: 1738, py: 496, icon: "emblem/varsiltaer.png", isVassal: false, vassalHouse: null },
	"clairvaux": { id: "clairvaux", name: "Клерво", type: "village", province: "nightsten", faction: "order_varsiltaers", rhetoric: "loyal", px: 1767, py: 472, icon: "emblem/varsiltaer.png", isVassal: false, vassalHouse: null },
	"montfort": { id: "montfort", name: "Монфор", type: "village", province: "nightsten", faction: "order_varsiltaers", rhetoric: "loyal", px: 1780, py: 555, icon: "emblem/house_morven.png", isVassal: true, vassalHouse: "house_morven" },
	"beauvais": { id: "beauvais", name: "Бове", type: "village", province: "nightsten", faction: "order_varsiltaers", rhetoric: "loyal", px: 1836, py: 426, icon: "emblem/varsiltaer.png", isVassal: false, vassalHouse: null },
	"chateauneuf": { id: "chateauneuf", name: "Шатонёф", type: "village", province: "nightsten", faction: "order_varsiltaers", rhetoric: "loyal", px: 1860, py: 623, icon: "emblem/house_morven.png", isVassal: true, vassalHouse: "house_morven" },
	"valmont": { id: "valmont", name: "Вальмон", type: "village", province: "nightsten", faction: "order_varsiltaers", rhetoric: "loyal", px: 1917, py: 600, icon: "emblem/house_morven.png", isVassal: true, vassalHouse: "house_morven" },
	"fontevraud": { id: "fontevraud", name: "Фонтевро", type: "village", province: "nightsten", faction: "order_varsiltaers", rhetoric: "loyal", px: 1815, py: 615, icon: "emblem/house_morven.png", isVassal: true, vassalHouse: "house_morven" },

    // Провинция Диония
    "Agafis": { id: "Agafis", name: "Агафис", type: "city", province: "dionia", faction: "county_dionia", rhetoric: "neutral", px: 2060, py: 440, icon: "emblem/dionia.png", isVassal: false, vassalHouse: null },
    "Canterlot": { id: "Canterlot", name: "Кантерлот", type: "castle", province: "dionia", faction: "county_dionia", rhetoric: "neutral", px: 1985, py: 520, icon: "emblem/castelmor.png", isVassal: true, vassalHouse: "house_castelmor" },
    "Black_Stone": { id: "Black_Stone", name: "Черный Камень", type: "castle", province: "dionia", faction: "county_dionia", rhetoric: "neutral", px: 2027, py: 317, icon: "emblem/heim.png", isVassal: true, vassalHouse: "house_heim" },
    "Dion": { id: "Dion", name: "Дион", type: "castle", province: "dionia", faction: "county_dionia", rhetoric: "neutral", px: 2215, py: 512, icon: "emblem/dionia.png", isVassal: false, vassalHouse: null },
    "Big_Milll": { id: "Big_Milll", name: "Большая мельница", type: "village", province: "dionia", faction: "county_dionia", rhetoric: "neutral", px: 1968, py: 580, icon: "emblem/castelmor.png", isVassal: true, vassalHouse: "house_castelmor" },
    "Buvran": { id: "Buvran", name: "Бурван", type: "village", province: "dionia", faction: "county_dionia", rhetoric: "neutral", px: 2037, py: 532, icon: "emblem/castelmor.png", isVassal: true, vassalHouse: "house_castelmor" },
    "Chaeza": { id: "Chaeza", name: "Чаез", type: "village", province: "dionia", faction: "county_dionia", rhetoric: "neutral", px: 2062, py: 490, icon: "emblem/dionia.png", isVassal: false, vassalHouse: null },
    "Dirigsene": { id: "Dirigsene", name: "Диризен", type: "village", province: "dionia", faction: "county_dionia", rhetoric: "neutral", px: 2058, py: 385, icon: "emblem/heim.png", isVassal: true, vassalHouse: "house_heim" },
    "Dumar": { id: "Dumar", name: "Думар", type: "village", province: "dionia", faction: "county_dionia", rhetoric: "neutral", px: 2166, py: 377, icon: "emblem/heim.png", isVassal: true, vassalHouse: "house_heim" },
    "Emer": { id: "Emer", name: "Эмер", type: "village", province: "dionia", faction: "county_dionia", rhetoric: "neutral", px: 2150, py: 450, icon: "emblem/dionia.png", isVassal: false, vassalHouse: null },
    "Fedner": { id: "Fedner", name: "Феднер", type: "village", province: "dionia", faction: "county_dionia", rhetoric: "neutral", px: 2210, py: 420, icon: "emblem/dionia.png", isVassal: false, vassalHouse: null },
    "Big_Mill": { id: "Big_Mill", name: "Большая мельница", type: "village", province: "dionia", faction: "county_dionia", rhetoric: "neutral", px: 2242, py: 355, icon: "emblem/kilogan.png", isVassal: true, vassalHouse: "house_kilogan" },
    "Glunmar": { id: "Glunmar", name: "Глунмар", type: "village", province: "dionia", faction: "county_dionia", rhetoric: "neutral", px: 2112, py: 605, icon: "emblem/castelmor.png", isVassal: true, vassalHouse: "house_castelmor" },
    "Ilvia": { id: "Ilvia", name: "Илвия", type: "village", province: "dionia", faction: "county_dionia", rhetoric: "neutral", px: 2106, py: 656, icon: "emblem/castelmor.png", isVassal: true, vassalHouse: "house_castelmor" },
    "Istiniar": { id: "Istiniar", name: "Истиньяр", type: "village", province: "dionia", faction: "county_dionia", rhetoric: "neutral", px: 2185, py: 655, icon: "emblem/dionia.png", isVassal: false, vassalHouse: null },
    "Pagundur": { id: "Pagundur", name: "Пагундур", type: "village", province: "dionia", faction: "county_dionia", rhetoric: "neutral", px: 2205, py: 720, icon: "emblem/dionia.png", isVassal: false, vassalHouse: null },
    "Reveran": { id: "Reveran", name: "Реверан", type: "village", province: "dionia", faction: "county_dionia", rhetoric: "neutral", px: 2193, py: 566, icon: "emblem/dionia.png", isVassal: false, vassalHouse: null },

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

    // Провинция Тронакс
    "Elheim": { id: "Elheim", name: "Эльхейм", type: "city", province: "thronax", faction: "elfheim", rhetoric: "neutral", px: 2517, py: 920, icon: "emblem/elfheim.png", isVassal: false, vassalHouse: null },
    "Ariendor": { id: "Ariendor", name: "Ариендор", type: "castle", province: "thronax", faction: "elfheim", rhetoric: "neutral", px: 2204, py: 901, icon: "emblem/house_stettov.png", isVassal: true, vassalHouse: "house_stettov" },
    "Mistralin": { id: "Mistralin", name: "Мистралин", type: "castle", province: "thronax", faction: "elfheim", rhetoric: "neutral", px: 2544, py: 1036, icon: "emblem/elfheim.png", isVassal: false, vassalHouse: null },
    "Lumendor": { id: "Lumendor", name: "Лумендор", type: "castle", province: "thronax", faction: "elfheim", rhetoric: "neutral", px: 2723, py: 961, icon: "emblem/house_narnwyn.png", isVassal: true, vassalHouse: "house_narnwyn" },
    "Silvaris": { id: "Silvaris", name: "Сильварис", type: "village", province: "thronax", faction: "elfheim", rhetoric: "neutral", px: 2230, py: 833, icon: "emblem/house_stettov.png", isVassal: true, vassalHouse: "house_stettov" },
    "Trier": { id: "Trier", name: "Трир", type: "village", province: "thronax", faction: "elfheim", rhetoric: "neutral", px: 2220, py: 877, icon: "emblem/house_stettov.png", isVassal: true, vassalHouse: "house_stettov" },
    "Fran": { id: "Fran", name: "Фран", type: "village", province: "thronax", faction: "elfheim", rhetoric: "neutral", px: 2275, py: 900, icon: "emblem/house_stettov.png", isVassal: true, vassalHouse: "house_stettov" },
    "Takarai": { id: "Takarai", name: "Такараи", type: "village", province: "thronax", faction: "elfheim", rhetoric: "neutral", px: 2370, py: 953, icon: "emblem/house_stettov.png", isVassal: true, vassalHouse: "house_stettov" },
    "Mizuno": { id: "Mizuno", name: "Мидзуно", type: "village", province: "thronax", faction: "elfheim", rhetoric: "neutral", px: 2435, py: 1030, icon: "emblem/house_gerondo.png", isVassal: true, vassalHouse: "house_gerondo" },
    "Moegi": { id: "Moegi", name: "Моэги", type: "village", province: "thronax", faction: "elfheim", rhetoric: "neutral", px: 2579, py: 924, icon: "emblem/elfheim.png", isVassal: false, vassalHouse: null },
    "Hikarima": { id: "Hikarima", name: "Хикарима", type: "village", province: "thronax", faction: "elfheim", rhetoric: "neutral", px: 2538, py: 808, icon: "emblem/elfheim.png", isVassal: false, vassalHouse: null },
    "Nuren": { id: "Nuren", name: "Нюрн", type: "village", province: "thronax", faction: "elfheim", rhetoric: "neutral", px: 2564, py: 862, icon: "emblem/elfheim.png", isVassal: false, vassalHouse: null },
    "Elmaril": { id: "Elmaril", name: "Эльмарил", type: "village", province: "thronax", faction: "elfheim", rhetoric: "neutral", px: 2675, py: 765, icon: "emblem/house_narnwyn.png", isVassal: true, vassalHouse: "house_narnwyn" },
    "Lirendor": { id: "Lirendor", name: "Лирендор", type: "village", province: "thronax", faction: "elfheim", rhetoric: "neutral", px: 2814, py: 867, icon: "emblem/house_narnwyn.png", isVassal: true, vassalHouse: "house_narnwyn" },
    "Quendoris": { id: "Quendoris", name: "Квендорис", type: "village", province: "thronax", faction: "elfheim", rhetoric: "neutral", px: 2816, py: 944, icon: "emblem/house_narnwyn.png", isVassal: true, vassalHouse: "house_narnwyn" },
    "Nimferion": { id: "Nimferion", name: "Нимферион", type: "village", province: "thronax", faction: "elfheim", rhetoric: "neutral", px: 2672, py: 1050, icon: "emblem/house_narnwyn.png", isVassal: true, vassalHouse: "house_narnwyn" },
    "Kaeltiris": { id: "Kaeltiris", name: "Каэльтирис", type: "village", province: "thronax", faction: "elfheim", rhetoric: "neutral", px: 2636, py: 935, icon: "emblem/elfheim.png", isVassal: false, vassalHouse: null },
    "Asahiga": { id: "Asahiga", name: "Асахига", type: "village", province: "thronax", faction: "elfheim", rhetoric: "neutral", px: 2581, py: 975, icon: "emblem/elfheim.png", isVassal: false, vassalHouse: null },

    // Провинция Луногривье
    "Wargwick": { id: "Wargwick", name: "Варгвик", type: "city", province: "moonmane", faction: "county_skollfang", rhetoric: "neutral", px: 2410, py: 1325, icon: "emblem/skollfang.png", isVassal: false, vassalHouse: null },
    "Draumport": { id: "Draumport", name: "Драумборт", type: "city", province: "moonmane", faction: "county_skollfang", rhetoric: "neutral", px: 2597, py: 1292, icon: "emblem/wolfhart.png", isVassal: true, vassalHouse: "house_wolfhart" },
    "Riverguard": { id: "Riverguard", name: "Ривергард", type: "castle", province: "moonmane", faction: "county_skollfang", rhetoric: "neutral", px: 2348, py: 1182, icon: "emblem/skollfang.png", isVassal: false, vassalHouse: null },
    "Mountain_Fang": { id: "Mountain_Fang", name: "Горный клык", type: "castle", province: "moonmane", faction: "county_skollfang", rhetoric: "neutral", px: 2692, py: 1292, icon: "emblem/wolfhart.png", isVassal: true, vassalHouse: "house_wolfhart" },
    "Intersections": { id: "Intersections", name: "Перекрёстков", type: "village", province: "moonmane", faction: "county_skollfang", rhetoric: "neutral", px: 2450, py: 1120, icon: "emblem/drakwald.png", isVassal: true, vassalHouse: "house_drakwald" },
    "Manfo": { id: "Manfo", name: "Манфьо", type: "village", province: "moonmane", faction: "county_skollfang", rhetoric: "neutral", px: 2411, py: 1118, icon: "emblem/drakwald.png", isVassal: true, vassalHouse: "house_drakwald" },
    "Ovchinovo": { id: "Ovchinovo", name: "Овчиново", type: "village", province: "moonmane", faction: "county_skollfang", rhetoric: "neutral", px: 2420, py: 1196, icon: "emblem/skollfang.png", isVassal: false, vassalHouse: null },
    "Volkovo": { id: "Volkovo", name: "Волково", type: "village", province: "moonmane", faction: "county_skollfang", rhetoric: "neutral", px: 2460, py: 1180, icon: "emblem/skollfang.png", isVassal: false, vassalHouse: null },
    "Tumanovo": { id: "Tumanovo", name: "Туманово", type: "village", province: "moonmane", faction: "county_skollfang", rhetoric: "neutral", px: 2456, py: 1246, icon: "emblem/skollfang.png", isVassal: false, vassalHouse: null },
    "Vanfolk": { id: "Vanfolk", name: "Ванфолк", type: "village", province: "moonmane", faction: "county_skollfang", rhetoric: "neutral", px: 2500, py: 1100, icon: "emblem/boncraig.png", isVassal: true, vassalHouse: "house_boncraig" },
    "Bear_House": { id: "Bear_House", name: "Медвежий дом", type: "village", province: "moonmane", faction: "county_skollfang", rhetoric: "neutral", px: 2550, py: 1107, icon: "emblem/boncraig.png", isVassal: true, vassalHouse: "house_boncraig" },
    "Asmud": { id: "Asmud", name: "Асмуд", type: "village", province: "moonmane", faction: "county_skollfang", rhetoric: "neutral", px: 2591, py: 1095, icon: "emblem/boncraig.png", isVassal: true, vassalHouse: "house_boncraig" },
    "Isafol": { id: "Isafol", name: "Исафол", type: "village", province: "moonmane", faction: "county_skollfang", rhetoric: "neutral", px: 2667, py: 1158, icon: "emblem/wolfhart.png", isVassal: true, vassalHouse: "house_wolfhart" },
    "Mountain_Chance": { id: "Mountain_Chance", name: "Горный шанс", type: "village", province: "moonmane", faction: "county_skollfang", rhetoric: "neutral", px: 2673, py: 1222, icon: "emblem/wolfhart.png", isVassal: true, vassalHouse: "house_wolfhart" },
    "Eldheim": { id: "Eldheim", name: "Эльдхейм", type: "village", province: "moonmane", faction: "county_skollfang", rhetoric: "neutral", px: 2641, py: 1286, icon: "emblem/wolfhart.png", isVassal: true, vassalHouse: "house_wolfhart" },
    "Khreshchatovo": { id: "Khreshchatovo", name: "Крещатово", type: "village", province: "moonmane", faction: "county_skollfang", rhetoric: "neutral", px: 2555, py: 1312, icon: "emblem/skollfang.png", isVassal: false, vassalHouse: null },
    "Mjolbi": { id: "Mjolbi", name: "Мьолби", type: "village", province: "moonmane", faction: "county_skollfang", rhetoric: "neutral", px: 2495, py: 1380, icon: "emblem/skollfang.png", isVassal: false, vassalHouse: null },
    "Fjorbi": { id: "Fjorbi", name: "Фьорби", type: "village", province: "moonmane", faction: "county_skollfang", rhetoric: "neutral", px: 2535, py: 1405, icon: "emblem/skollfang.png", isVassal: false, vassalHouse: null },

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

    // Провинция Лорейн
    "Lormarkt": { id: "Lormarkt", name: "Лормаркт", type: "city", province: "lorein", faction: "principality_lorein", rhetoric: "neutral", px: 3205, py: 1858, icon: "emblem/house_De_Rosa.png", isVassal: true, vassalHouse: "house_De_Rosa" },
    "Kalderok": { id: "Kalderok", name: "Калдерок", type: "city", province: "lorein", faction: "principality_lorein", rhetoric: "neutral", px: 3311, py: 1650, icon: "emblem/lorein.png", isVassal: false, vassalHouse: null },
    "Shivaleh": { id: "Shivaleh", name: "Шивалэ", type: "city", province: "lorein", faction: "principality_lorein", rhetoric: "neutral", px: 3374, py: 1830, icon: "emblem/rino.png", isVassal: true, vassalHouse: "house_mastereno" },
    "Rose": { id: "Rose", name: "Роза", type: "castle", province: "lorein", faction: "principality_lorein", rhetoric: "neutral", px: 3072, py: 1802, icon: "emblem/house_De_Rosa.png", isVassal: true, vassalHouse: "house_De_Rosa" },
    "Northern_Key": { id: "Northern_Key", name: "“Северный Ключ”", type: "castle", province: "lorein", faction: "principality_lorein", rhetoric: "neutral", px: 3211, py: 1805, icon: "emblem/house_De_Rosa.png", isVassal: true, vassalHouse: "house_De_Rosa" },
    "Snake_Fang_Castle": { id: "Snake_Fang_Castle", name: "“Змеиный Клык”", type: "castle", province: "lorein", faction: "principality_lorein", rhetoric: "neutral", px: 3055, py: 1650, icon: "emblem/house_vervut.png", isVassal: true, vassalHouse: "house_vervut" },
    "Nimwest": { id: "Nimwest", name: "Нимвест", type: "village", province: "lorein", faction: "principality_lorein", rhetoric: "neutral", px: 2960, py: 1556, icon: "emblem/house_violette.png", isVassal: true, vassalHouse: "house_violette" },
    "Meerward": { id: "Meerward", name: "Меервард", type: "village", province: "lorein", faction: "principality_lorein", rhetoric: "neutral", px: 3008, py: 1587, icon: "emblem/house_violette.png", isVassal: true, vassalHouse: "house_violette" },
    "Ravendam": { id: "Ravendam", name: "Равендам", type: "village", province: "lorein", faction: "principality_lorein", rhetoric: "neutral", px: 3108, py: 1568, icon: "emblem/house_iriswain.png", isVassal: true, vassalHouse: "house_iriswain" },
    "Linnheid": { id: "Linnheid", name: "Линнхейд", type: "village", province: "lorein", faction: "principality_lorein", rhetoric: "neutral", px: 3009, py: 1686, icon: "emblem/house_vervut.png", isVassal: true, vassalHouse: "house_vervut" },
    "Starwake": { id: "Starwake", name: "Старвейк", type: "village", province: "lorein", faction: "principality_lorein", rhetoric: "neutral", px: 3118, py: 1740, icon: "emblem/house_vervut.png", isVassal: true, vassalHouse: "house_vervut" },
    "Heidenau": { id: "Heidenau", name: "Хейденау", type: "village", province: "lorein", faction: "principality_lorein", rhetoric: "neutral", px: 3152, py: 1631, icon: "emblem/lorein.png", isVassal: false, vassalHouse: null },
    "Ranvik": { id: "Ranvik", name: "Ранвик", type: "village", province: "lorein", faction: "principality_lorein", rhetoric: "neutral", px: 3211, py: 1620, icon: "emblem/lorein.png", isVassal: false, vassalHouse: null },
    "Rosenheid": { id: "Rosenheid", name: "Розенхейд", type: "village", province: "lorein", faction: "principality_lorein", rhetoric: "neutral", px: 3255, py: 1693, icon: "emblem/lorein.png", isVassal: false, vassalHouse: null },
    "Reindorp": { id: "Reindorp", name: "Рейндорп", type: "village", province: "lorein", faction: "principality_lorein", rhetoric: "neutral", px: 3413, py: 1630, icon: "emblem/lorein.png", isVassal: false, vassalHouse: null },
    "Crooked": { id: "Crooked", name: "Кривен", type: "village", province: "lorein", faction: "principality_lorein", rhetoric: "neutral", px: 3399, py: 1783, icon: "emblem/rino.png", isVassal: true, vassalHouse: "house_mastereno" },
    "Lorvik": { id: "Lorvik", name: "Лорвик", type: "village", province: "lorein", faction: "principality_lorein", rhetoric: "neutral", px: 3317, py: 1728, icon: "emblem/lorein.png", isVassal: false, vassalHouse: null },
    "Osterwald": { id: "Osterwald", name: "Остервальд", type: "village", province: "lorein", faction: "principality_lorein", rhetoric: "neutral", px: 3207, py: 1701, icon: "emblem/lorein.png", isVassal: false, vassalHouse: null },
    "Lorrock": { id: "Lorrock", name: "Лоррок", type: "village", province: "lorein", faction: "principality_lorein", rhetoric: "neutral", px: 3276, py: 1616, icon: "emblem/lorein.png", isVassal: false, vassalHouse: null },
    "Varden": { id: "Varden", name: "Варден", type: "village", province: "lorein", faction: "principality_lorein", rhetoric: "neutral", px: 3243, py: 1566, icon: "emblem/lorein.png", isVassal: false, vassalHouse: null },
    "Elden": { id: "Elden", name: "Эльден", type: "village", province: "lorein", faction: "principality_lorein", rhetoric: "neutral", px: 3346, py: 1678, icon: "emblem/lorein.png", isVassal: false, vassalHouse: null },

    // Провинция Оттергрунд
    "ottergrund": { id: "ottergrund", name: "Оттергрунд", type: "city", province: "ottergrund", faction: "county_ottergrund", rhetoric: "proyurgan", px: 3472, py: 1400, icon: "emblem/ottergrund.png", isVassal: false, vassalHouse: null },
    "Sonnetal": { id: "Sonnetal", name: "Зонненталь", type: "village", province: "ottergrund", faction: "county_ottergrund", rhetoric: "proyurgan", px: 3488, py: 1355, icon: "emblem/house_sternberg.png", isVassal: true, vassalHouse: "house_sternberg" },
    "Lindenfeld": { id: "Lindenfeld", name: "Кирхбах", type: "village", province: "ottergrund", faction: "county_ottergrund", rhetoric: "proyurgan", px: 3476, py: 1285, icon: "emblem/house_eisenhart.png", isVassal: true, vassalHouse: "house_eisenhart" },
    "Blumenau": { id: "Blumenau", name: "Блюменау", type: "village", province: "ottergrund", faction: "county_ottergrund", rhetoric: "proyurgan", px: 3482, py: 1220, icon: "emblem/house_eisenhart.png", isVassal: true, vassalHouse: "house_eisenhart" },
    "Eichendorf": { id: "Eichendorf", name: "Айхендорф", type: "village", province: "ottergrund", faction: "county_ottergrund", rhetoric: "proyurgan", px: 3463, py: 1170, icon: "emblem/house_waldstein.png", isVassal: true, vassalHouse: "house_waldstein" },
    "Weissenbach": { id: "Weissenbach", name: "Хинтербах", type: "village", province: "ottergrund", faction: "county_ottergrund", rhetoric: "proyurgan", px: 3525, py: 1180, icon: "emblem/house_waldstein.png", isVassal: true, vassalHouse: "house_waldstein" },
    "Kirchbach": { id: "Kirchbach", name: "Линденфельд", type: "village", province: "ottergrund", faction: "county_ottergrund", rhetoric: "proyurgan", px: 3530, py: 1380, icon: "emblem/house_sternberg.png", isVassal: true, vassalHouse: "house_sternberg" },
    "Rosenheim": { id: "Rosenheim", name: "Мюленгрунд", type: "village", province: "ottergrund", faction: "county_ottergrund", rhetoric: "proyurgan", px: 3560, py: 1390, icon: "emblem/house_storm.png", isVassal: true, vassalHouse: "house_storm" },
    "Mulengrund": { id: "Mulengrund", name: "Розенхайм", type: "village", province: "ottergrund", faction: "county_ottergrund", rhetoric: "proyurgan", px: 3565, py: 1270, icon: "emblem/house_drachenfels.png", isVassal: true, vassalHouse: "house_drachenfels" },
    "Hinterbach": { id: "Hinterbach", name: "Вайсенбах", type: "village", province: "ottergrund", faction: "county_ottergrund", rhetoric: "proyurgan", px: 3636, py: 1245, icon: "emblem/house_levenwolf.png", isVassal: true, vassalHouse: "house_levenwolf" },

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

// ========== 18. ГЕНЕРАЦИЯ СПИСКА ГОРОДОВ ДЛЯ КАРТЫ ==========
window.citiesData = Object.entries(SETTLEMENTS_DB).map(([id, s]) => ({
    ...s,
    settlementId: id,
    icon: s.icon || 'default_city.png'
}));
console.log("✅ citiesData сгенерирован, элементов:", window.citiesData.length);

console.log("✅ constants.js загружен — полная версия");