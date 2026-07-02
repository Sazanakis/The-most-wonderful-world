// ============================================================================
// МОДУЛЬ: factions_constants.js
// Константы для фракций, отсутствующие в карточном constants.js
// ============================================================================

// ---------- ПРАВИТЕЛИ ФРАКЦИЙ ----------
const FACTION_RULERS = {
    clan_daketa: "Кай Дакэта",
    county_markarn: "Эльза Маркарн",
    county_vogelmark: "Мари Фогельмарк",
    principality_gorski: "Лисанна Горски",
    regency_council: "Совет регентов",
    lepus_union: "Совет старейшин"
};

// ---------- НАЗВАНИЯ РИТОРИК (ИДЕОЛОГИЙ) ----------
const RHETORIC_NAMES = {
    dayo: "Даё",
    loyal: "Лоялисты",
    neutral: "Нейтралы",
    proyurgan: "Проюрганцы",
    lepus: "Союз Лепус",
    regency: "Регенты"
};

// ---------- ССЫЛКИ НА ВНЕШНИЕ ИСТОЧНИКИ ДЛЯ ПРАВИТЕЛЕЙ ФРАКЦИЙ ----------
const FACTION_LEADER_LINKS = {
    clan_daketa: "https://vk.com/kai_daketa",
    county_markarn: "https://vk.com/elsa_markarn",
    county_vogelmark: "https://vk.com/page-228463474_55105284",
    principality_gorski: "https://vk.com/lisanna_gorski",
    regency_council: "https://vk.com/regency_council",
    lepus_union: "https://vk.com/lepus_union"
};

// ---------- РЕСУРСЫ (для торговли и построек) ----------
const RESOURCES_REGISTRY = {
    wood:   { id: "wood",   name: "Древесина", icon: "icons/wood.png",  category: "basic",    tradeable: true,  defaultValue: 500 },
    stone:  { id: "stone",  name: "Камень",    icon: "icons/stone.png", category: "basic",    tradeable: true,  defaultValue: 300 },
    iron:   { id: "iron",   name: "Железо",    icon: "icons/iron.png",  category: "strategic",tradeable: true,  defaultValue: 200 },
    gold:   { id: "gold",   name: "Золото",    icon: "icons/gold.png",  category: "luxury",   tradeable: true,  defaultValue: 10 },
	sword_iron: { id: "sword_iron", name: "Железо меча", icon: "icons/sword_iron.png", category: "strategic", tradeable: true, defaultValue: 0 },
	bison: { id: "bison", name: "Бизоны", icon: "icons/bison.png", category: "basic", tradeable: true, defaultValue: 0 },
	elven_tobacco: { id: "elven_tobacco", name: "Эльфийский табак", icon: "icons/elven_tobacco.png", category: "luxury", tradeable: true, defaultValue: 0 },
    ers:    { id: "ers",    name: "Эрсы",      icon: "icons/ers.png",   category: "currency", tradeable: true,  defaultValue: 10000 }
};

// ---------- ГЕРБЫ И ПОРТРЕТЫ ВАССАЛОВ ----------
const VASSAL_ICONS = {
    "house_seiryu": { coat: "icons/house_seiryu.png", portrait: "icons/portrait_seiryu.png" },
    "house_nodaketa": { coat: "icons/house_nodaketa.png", portrait: "icons/portrait_nodaketa.png" },
    "house_yurai": { coat: "icons/house_yurai.png", portrait: "icons/portrait_yurai.png" },
    "house_yume": { coat: "icons/house_yume.png", portrait: "icons/portrait_yume.png" },
    "house_senpu": { coat: "icons/house_senpu.png", portrait: "icons/portrait_senpu.png" },
    "house_umi": { coat: "icons/house_umi.png", portrait: "icons/portrait_umi.png" },
    "house_gekken": { coat: "icons/house_gekken.png", portrait: "icons/portrait_gekken.png" },
    "viscountcy_runheim": { coat: "icons/viscountcy_runheim.png", portrait: "icons/portrait_runheim.png" },
    "viscountcy_voronetsky": { coat: "icons/viscountcy_voronetsky.png", portrait: "icons/portrait_voronetsky.png" },
    "great_wall": { coat: "icons/holdings_great_shaft.png", portrait: "icons/default_portrait.png" }
};

// ---------- МАППИНГ ПОВЫШЕНИЯ РАНГА ----------
const VASSAL_UPGRADE_MAP = {
    "MINOR_CLAN": "MEDIUM_CLAN",
    "MEDIUM_CLAN": "MAJOR_CLAN"
};

// ---------- ДАННЫЕ НАЧАЛЬНЫХ ВАССАЛОВ ДЛЯ КАЖДОЙ ФРАКЦИИ ----------
const INITIAL_VASSALS = {
    clan_daketa: [
        { id: "house_seiryu", name: "Род Сейрю", type: "MINOR_CLAN", politicalFaction: "LOYALISTS", leader: "Глава рода Сейрю", baseLoyalty: 70, externalLink: "https://vk.com/page-228463474_55105200" },
        { id: "house_nodaketa", name: "Род Нодакэта", type: "MINOR_CLAN", politicalFaction: "LOYALISTS", leader: "Глава рода Нодакэта", baseLoyalty: 65, externalLink: "https://vk.com/pages?hash=1a8b03d67be08ca58a&oid=-228463474&p=Род_Нодакэта" },
        { id: "house_yurai", name: "Род Юрей", type: "MINOR_CLAN", politicalFaction: "NOBILITY", leader: "Глава рода Юрей", baseLoyalty: 40, externalLink: "https://vk.com/pages?hash=1a8b03d67be08ca58a&oid=-228463474&p=Род_Юрей" },
        { id: "house_yume", name: "Род Юмэ", type: "MINOR_CLAN", politicalFaction: "NOBILITY", leader: "Глава рода Юмэ", baseLoyalty: 40, externalLink: "https://vk.com/pages?hash=1a8b03d67be08ca58a&oid=-228463474&p=Род_Юмэ" },
        { id: "house_senpu", name: "Род Сэнпу", type: "MINOR_CLAN", politicalFaction: "NOBILITY", leader: "Глава рода Сэнпу", baseLoyalty: 35, externalLink: "https://vk.com/pages?hash=1a8b03d67be08ca58a&oid=-228463474&p=Род_Сэнпу" },
        { id: "house_umi", name: "Род Уми", type: "MINOR_CLAN", politicalFaction: "NOBILITY", leader: "Глава рода Уми", baseLoyalty: 35, externalLink: "https://vk.com/pages?hash=1a8b03d67be08ca58a&oid=-228463474&p=Род_Уми" },
        { id: "house_gekken", name: "Род Гэккэн", type: "MINOR_CLAN", politicalFaction: "NOBILITY", leader: "Глава рода Гэккэн", baseLoyalty: 20, externalLink: "https://vk.com/pages?hash=1a8b03d67be08ca58a&oid=-228463474&p=Род_Гэккэн" }
    ],
    county_markarn: [
        { id: "viscountcy_runheim", name: "Виконтство Рунхеймов", type: "NOBLE_HOUSE", politicalFaction: "NOBILITY", leader: "Виконт Рунхейм", baseLoyalty: 50 }
    ],
    county_vogelmark: [],
    principality_gorski: [
        { id: "viscountcy_voronetsky", name: "Виконтство Воронецких", type: "NOBLE_HOUSE", politicalFaction: "NOBILITY", leader: "Виконт Воронецкий", baseLoyalty: 50 }
    ],
    regency_council: [],
    lepus_union: []
};

const POLITICAL_PARTIES = {
    NOBILITY: { name: "Дворянская фракция", color: "#8b4513" },
    LOYALISTS: { name: "Сторонники сюзерена", color: "#4a90d9" }
};

// ---------- ЭКСПОРТ (глобальные переменные) ----------
window.FACTION_RULERS = FACTION_RULERS;
window.RESOURCES_REGISTRY = RESOURCES_REGISTRY;
window.VASSAL_ICONS = VASSAL_ICONS;
window.VASSAL_UPGRADE_MAP = VASSAL_UPGRADE_MAP;
window.INITIAL_VASSALS = INITIAL_VASSALS;
window.POLITICAL_PARTIES = POLITICAL_PARTIES;
window.FACTION_LEADER_LINKS = FACTION_LEADER_LINKS;
window.RHETORIC_NAMES = RHETORIC_NAMES;

console.log("✅ factions_constants.js загружен");