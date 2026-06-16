// ============================================================================
// МОДУЛЬ 17: constants_factions.js
// Все данные о фракциях: названия, связи с риторикой, провинциями, субфракции и т.д.
// ВЕРСИЯ 1.1 – ДОБАВЛЕНЫ НЕДОСТАЮЩИЕ МАППИНГИ (COUNCIL_FACTIONS для всех фракций)
// ============================================================================

// ========== 1. НАЗВАНИЯ ФРАКЦИЙ ==========
const FACTION_NAMES = {
    clan_daketa: "Клан Дакэта",
    county_markarn: "Графство Маркарн",
    county_vogelmark: "Графство Фогельмарк",
    principality_gorski: "Горское княжество",
    regency_council: "Совет регентов",
    lepus_union: "Союз Лепус"
};

// ========== 2. ПРАВИТЕЛИ ФРАКЦИЙ ==========
const FACTION_RULERS = {
    clan_daketa: "Кай Дакэта",
    county_markarn: "Эльза Маркарн",
    county_vogelmark: "Граф Фогельмарк",
    principality_gorski: "Лисанна Горски",
    regency_council: "Совет регентов",
    lepus_union: "Совет старейшин"
};

// ========== 3. СВЯЗЬ ФРАКЦИЯ → РИТОРИКА ==========
const FACTION_TO_RHETORIC = {
    clan_daketa: "dayo",
    county_markarn: "loyal",
    county_vogelmark: "loyal",
    principality_gorski: "proyurgan",
    regency_council: "neutral",
    lepus_union: "lepus"
};

// ========== 4. СВЯЗЬ ФРАКЦИЯ → ПРОВИНЦИЯ (ГЛАВНАЯ ПРОВИНЦИЯ) ==========
const FACTION_TO_PROVINCE = {
    clan_daketa: "orochima",
    county_markarn: "kaya",
    county_vogelmark: "vogel",
    principality_gorski: "neolania",
    regency_council: "metropolitan_area",
    lepus_union: "leporis"
};

// ========== 5. СВЯЗЬ ПРОВИНЦИЯ → ФРАКЦИЯ ==========
const PROVINCE_TO_FACTION = {
    orochima: "clan_daketa",
    kaya: "county_markarn",
    vogel: "county_vogelmark",
    neolania: "principality_gorski",
    metropolitan_area: "regency_council",
    great_shaft: "regency_council",
    leporis: "lepus_union",
    regent_city: "regency_council",
    gorskin: "principality_gorski"
};

// ========== 6. СПИСОК ФРАКЦИЙ ДЛЯ СОВЕТА (отображение) ==========
// Добавлена фракция lepus_union
const COUNCIL_FACTIONS = {
    clan_daketa: "Клан Дакэта",
    county_markarn: "Графство Маркарн",
    county_vogelmark: "Графство Фогельмарк",
    principality_gorski: "Горское княжество",
    regency_council: "Совет регентов",
    lepus_union: "Союз Лепус"
};

// ========== 7. ПОДФРАКЦИИ ДЛЯ АРМИИ (СВЯЗКА РИТОРИКА → СПИСОК ФРАКЦИЙ) ==========
const ARMY_SUBFACTIONS = {
    dayo: [{ id: "clan_daketa", name: "Клан Дакэта" }],
    loyal: [
        { id: "county_markarn", name: "Графство Маркарн" },
        { id: "county_vogelmark", name: "Графство Фогельмарк" }
    ],
    proyurgan: [{ id: "principality_gorski", name: "Горское княжество" }],
    neutral: [{ id: "neutral_default", name: "Нейтральная провинция" }],
    regency: [{ id: "regency_council", name: "Совет регентов" }],
    lepus: [{ id: "lepus_union", name: "Союз Лепус" }]
};

// ========== 8. НАЗВАНИЯ РИТОРИКИ ==========
const RHETORIC_NAMES = {
    dayo: "Даё",
    loyal: "Лоялисты",
    neutral: "Нейтралы",
    proyurgan: "Проюрганцы",
    lepus: "Союз Лепус"
};

// ========== 9. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function getFactionName(factionId) {
    return FACTION_NAMES[factionId] || factionId;
}

function getRhetoricName(rhetoricId) {
    return RHETORIC_NAMES[rhetoricId] || rhetoricId;
}

function getFactionByProvince(provinceId) {
    return PROVINCE_TO_FACTION[provinceId] || provinceId;
}

function getCurrentRhetoric() {
    const faction = PROVINCE_TO_FACTION[currentProvince];
    return FACTION_TO_RHETORIC[faction] || "neutral";
}

console.log("✅ 17_constants_factions.js загружен — все данные о фракциях");