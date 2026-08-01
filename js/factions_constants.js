// ============================================================================
// МОДУЛЬ: factions_constants.js
// Константы для фракций, отсутствующие в карточном constants.js
// ============================================================================
// Загружено на гитхаб 01.08.2026
// ---------- ПРАВИТЕЛИ ФРАКЦИЙ ----------
const FACTION_RULERS = {
    clan_daketa: "Кай Дакэта",
    county_markarn: "Эльза Маркарн",
    county_vogelmark: "Мари Фогельмарк",
    principality_gorski: "Лисанна Горски",
    regency_council: "Совет регентов",
    lepus_union: "Совет старейшин",
	clan_date: "Макишиму Датэ",
	county_ottergrund: "Элельйхада Кох",
	elfheim: "Катерина Фейм",
	county_meyan: "Флавий Мейан",
	county_dionia: "Маккавей Дионисийский",
	county_skollfang: "Вальфрея Сколльфанг",
	order_varsiltaers: "Антегро Илиинг",
	county_takania: "Морглен Альфьеро Ла Валлет",
	principality_lorein: "Ноэми Ванденхейде",
	county_mensen: "Вальдэ Мар'Фалкин"
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
    lepus_union: "https://vk.com/lepus_union",
	county_ottergrund: "https://vk.com/page-228463474_55105405",
	clan_date: "https://vk.com/page-228463474_55105345",
	elfheim: "https://vk.com/page-228463474_55105429",
	county_meyan: "https://vk.com/page-228463474_55105439",
	county_dionia: "https://vk.com/page-228463474_55105449",
	county_skollfang: "https://vk.com/page-228463474_55105456",
	county_takania: "https://vk.com/page-228463474_55105475",
	order_varsiltaers: "https://vk.com/page-228463474_55105506",
	principality_lorein: "https://vk.com/page-228463474_55105567",
	county_mensen: "https://vk.ru/page-228463474_55105853"
};
const FACTION_MAIN_COATS = {
    clan_daketa: "emblem/armoria.png",
    clan_date: "emblem/date.png",
    county_markarn: "emblem/Markarn.png",
    county_vogelmark: "emblem/Vogelmark.png",
    principality_gorski: "emblem/Gorski.png",
    regency_council: "emblem/Regents.png",
    lepus_union: "emblem/lepus.png",
    county_ottergrund: "emblem/ottergrund.png",
    elfheim: "emblem/elfheim.png",
    county_meyan: "emblem/meyan.png",
    county_dionia: "emblem/dionia.png",
    county_takania: "emblem/takania.png",
    county_skollfang: "emblem/skollfang.png",
    order_varsiltaers: "emblem/varsiltaer.png",
    principality_lorein: "emblem/lorein.png",
	county_mensen: "emblem/mensen.png"
};
window.FACTION_MAIN_COATS = FACTION_MAIN_COATS;
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
    "house_seiryu": { coat: "icons/emblem/house_seiryu.png", portrait: "icons/portrait_seiryu.png" },
    "house_nodaketa": { coat: "icons/emblem/house_nodaketa.png", portrait: "icons/portrait_nodaketa.png" },
    "house_yurai": { coat: "icons/emblem/house_yurai.png", portrait: "icons/portrait_yurai.png" },
    "house_yume": { coat: "icons/emblem/house_yume.png", portrait: "icons/portrait_yume.png" },
    "house_senpu": { coat: "icons/emblem/house_senpu.png", portrait: "icons/portrait_senpu.png" },
    "house_umi": { coat: "icons/emblem/house_umi.png", portrait: "icons/portrait_umi.png" },
    "house_gekken": { coat: "icons/emblem/house_gekken.png", portrait: "icons/portrait_gekken.png" },
    "viscountcy_runheim": { coat: "icons/emblem/viscountcy_runheim.png", portrait: "icons/portrait_runheim.png" },
    "viscountcy_voronetsky": { coat: "icons/emblem/viscountcy_voronetsky.png", portrait: "icons/portrait_voronetsky.png" },
    "great_wall": { coat: "icons/emblem/holdings_great_shaft.png", portrait: "icons/default_portrait.png" },
	"house_tokosi": { coat: "icons/emblem/house_tokosi.png", portrait: "icons/default_portrait.png" },
	"house_segawa": { coat: "icons/emblem/house_segawa.png", portrait: "icons/default_portrait.png" },
	"house_yamano": { coat: "icons/emblem/house_yamano.png", portrait: "icons/default_portrait.png" },
	"house_fujii": { coat: "icons/emblem/house_fujii.png", portrait: "icons/default_portrait.png" },
	"house_hatamoto_a": { coat: "icons/emblem/house_hatamoto_a.png", portrait: "icons/default_portrait.png" },
	"house_hatamoto_b": { coat: "icons/emblem/house_hatamoto_b.png", portrait: "icons/default_portrait.png" },
	"house_hatamoto_c": { coat: "icons/emblem/house_hatamoto_c.png", portrait: "icons/default_portrait.png" },
	"house_hatamoto_d": { coat: "icons/emblem/house_hatamoto_d.png", portrait: "icons/default_portrait.png" },
	"house_narnwyn": { coat: "icons/emblem/house_narnwyn.png", portrait: "icons/default_portrait.png" },
	"house_gerondo": { coat: "icons/emblem/house_gerondo.png", portrait: "icons/default_portrait.png" },
	"house_stettov": { coat: "icons/emblem/house_stettov.png", portrait: "icons/default_portrait.png" },
	"house_krieger": { coat: "icons/emblem/house_krieger.png", portrait: "icons/default_portrait.png" },
	"house_waldhof": { coat: "icons/emblem/waldhof.png", portrait: "icons/default_portrait.png" },
	"house_montbrun": { coat: "icons/emblem/montbrun.png", portrait: "icons/default_portrait.png" },
	"house_kilogan": { coat: "icons/emblem/kilogan.png", portrait: "icons/kilogann.png" },
	"house_castelmor": { coat: "icons/emblem/castelmor.png", portrait: "icons/default_portrait.png" },
	"house_heim": { coat: "icons/emblem/heim.png", portrait: "icons/default_portrait.png" },
	"house_drakwald": { coat: "icons/emblem/drakwald.png", portrait: "icons/default_portrait.png" },
	"house_boncraig": { coat: "icons/emblem/boncraig.png", portrait: "icons/default_portrait.png" },
	"house_wolfhart": { coat: "icons/emblem/wolfhart.png", portrait: "icons/default_portrait.png" },
	"house_ippon": { coat: "icons/emblem/house_ippon.png", portrait: "icons/default_portrait.png" },
	"house_cald": { coat: "icons/emblem/house_cald.png", portrait: "icons/default_portrait.png" },
	"house_valdgreiv": { coat: "icons/emblem/house_valdgreiv.png", portrait: "icons/default_portrait.png" },
	"house_morven": { coat: "icons/emblem/house_morven.png", portrait: "icons/default_portrait.png" },
	"house_sternberg": { coat: "icons/emblem/house_sternberg.png", portrait: "icons/default_portrait.png" },
	"house_eisenhart": { coat: "icons/emblem/house_eisenhart.png", portrait: "icons/default_portrait.png" },
	"house_waldstein": { coat: "icons/emblem/house_waldstein.png", portrait: "icons/default_portrait.png" },
	"house_levenwolf": { coat: "icons/emblem/house_levenwolf.png", portrait: "icons/default_portrait.png" },
	"house_drachenfels": { coat: "icons/emblem/house_drachenfels.png", portrait: "icons/default_portrait.png" },
	"house_storm": { coat: "icons/emblem/house_storm.png", portrait: "icons/default_portrait.png" },
	"house_bah": { coat: "icons/emblem/house_bah.png", portrait: "icons/default_portrait.png" },
	"house_drahenfels": { coat: "icons/emblem/house_drahenfels.png", portrait: "icons/default_portrait.png" },
	"house_vind": { coat: "icons/emblem/house_vind.png", portrait: "icons/default_portrait.png" },
	"house_mastereno": { coat: "icons/emblem/rino.png", portrait: "icons/default_portrait.png" },
	"house_vervut": { coat: "icons/emblem/house_vervut.png", portrait: "icons/default_portrait.png" },
	"house_violette": { coat: "icons/emblem/house_violette.png", portrait: "icons/default_portrait.png" },
	"house_iriswain": { coat: "icons/emblem/house_iriswain.png", portrait: "icons/default_portrait.png" },
	"house_De_Rosa": { coat: "icons/emblem/house_De_Rosa.png", portrait: "icons/default_portrait.png" },
	"house_sakada": { coat: "icons/emblem/sakada.png", portrait: "icons/default_portrait.png" },
	"house_gimadzu": { coat: "icons/emblem/gimadzu.png", portrait: "icons/default_portrait.png" },
	"house_fraum": { coat: "icons/emblem/fraum.png", portrait: "icons/default_portrait.png" },
	"house_ion": { coat: "icons/emblem/ion.png", portrait: "icons/default_portrait.png" },
	"house_mensen_merchant_guild": { coat: "icons/emblem/mensen_merchant_guild.png", portrait: "icons/default_portrait.png" }
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
    county_vogelmark: [
		{ id: "house_krieger", name: "Род Кригер", type: "NOBLE_HOUSE", politicalFaction: "LOYALISTS", leader: "Глава Кригер", baseLoyalty: 80 }
	],
    principality_gorski: [
        { id: "viscountcy_voronetsky", name: "Виконтство Воронецких", type: "NOBLE_HOUSE", politicalFaction: "NOBILITY", leader: "Виконт Воронецкий", baseLoyalty: 50 }
    ],
    regency_council: [],
    lepus_union: [],
	clan_date: [
		// Крупные вассалы (4 дома)
		{ id: "house_tokosi", name: "Род Токоси", type: "MINOR_CLAN", politicalFaction: "LOYALISTS", leader: "Глава Токоси", baseLoyalty: 60 },
		{ id: "house_segawa", name: "Род Сэгава", type: "MEDIUM_CLAN", politicalFaction: "LOYALISTS", leader: "Глава Сэгава", baseLoyalty: 70 },
		{ id: "house_yamano", name: "Род Ямано", type: "MINOR_CLAN", politicalFaction: "NOBILITY", leader: "Глава Ямано", baseLoyalty: 50 },
		{ id: "house_fujii", name: "Род Фудзии", type: "RELIGIOUS_ORDER", politicalFaction: "NOBILITY", leader: "Настоятель Фудзии", baseLoyalty: 50 },
		// Мелкие вассалы (хатамото)
		{ id: "house_hatamoto_a", name: "Род Кейкай", type: "MINOR_CLAN", politicalFaction: "NOBILITY", leader: "Глава Кейкай", baseLoyalty: 50 },
		{ id: "house_hatamoto_b", name: "Род Сакуга", type: "MINOR_CLAN", politicalFaction: "NOBILITY", leader: "Глава Сакуга", baseLoyalty: 50 },
		{ id: "house_hatamoto_c", name: "Род Икко", type: "MINOR_CLAN", politicalFaction: "LOYALISTS", leader: "Настоятель Икко", baseLoyalty: 80 },
		{ id: "house_hatamoto_d", name: "Род Крейгов", type: "MINOR_CLAN", politicalFaction: "LOYALISTS", leader: "Глава Крейгов", baseLoyalty: 70 }
	],
	county_ottergrund: [
	{ id: "house_sternberg", name: "Род Линденфельд", type: "MINOR_CLAN", politicalFaction: "LOYALISTS", leader: "Изольда фон Линденфельд", baseLoyalty: 80 },
	{ id: "house_eisenhart", name: "Род Блюменау", type: "MINOR_CLAN", politicalFaction: "LOYALISTS", leader: "Брунгильда Блюменау ", baseLoyalty: 50 },
	{ id: "house_waldstein", name: "Род Айхендорф", type: "MINOR_CLAN", politicalFaction: "LOYALISTS", leader: "Виктория фон Айхендорф", baseLoyalty: 50 },
	{ id: "house_levenwolf", name: "Род Вайсенбах", type: "MINOR_CLAN", politicalFaction: "LOYALISTS", leader: "Глава Вайсенбах", baseLoyalty: 50 },
	{ id: "house_drachenfels", name: "Род Розенхайм", type: "MINOR_CLAN", politicalFaction: "LOYALISTS", leader: "Глава Розенхайм", baseLoyalty: 50 },
	{ id: "house_storm", name: "Род Мюленгрунд", type: "MINOR_CLAN", politicalFaction: "LOYALISTS", leader: " Грета цу Мюленгрунд", baseLoyalty: 50 },
	{ id: "house_bah", name: "Род Бах", type: "MINOR_CLAN", politicalFaction: "LOYALISTS", leader: "Глава Бах", baseLoyalty: 50 },
	{ id: "house_drahenfels", name: "Род Драхенфельс", type: "MINOR_CLAN", politicalFaction: "LOYALISTS", leader: "Адельхайда фон Драхенфельс", baseLoyalty: 50 },
	{ id: "house_vind", name: "Род Винд", type: "MINOR_CLAN", politicalFaction: "LOYALISTS", leader: "Ульрика Шторм", baseLoyalty: 50 },
	],
	elfheim: [
		{ id: "house_narnwyn", name: "Род Нарнуин", type: "MINOR_CLAN", politicalFaction: "LOYALISTS", leader: "Глава Нарнуин", baseLoyalty: 80 },
		{ id: "house_gerondo", name: "Род Герондо", type: "MINOR_CLAN", politicalFaction: "NOBILITY", leader: "Глава Герондо", baseLoyalty: 50 },
		{ id: "house_stettov", name: "Род Штеттов", type: "MINOR_CLAN", politicalFaction: "NOBILITY", leader: "Глава Штетт", baseLoyalty: 50 },
	],
	county_dionia: [
		{ id: "house_kilogan", name: "Род Килоган", type: "MINOR_CLAN", politicalFaction: "LOYALISTS", leader: "Икарон Килоган", baseLoyalty: 90 },
		{ id: "house_castelmor", name: "Род Кастельмор", type: "MINOR_CLAN", politicalFaction: "NOBILITY", leader: "Глава Кастельмор", baseLoyalty: 50 },
		{ id: "house_heim", name: "Род Хейм", type: "MINOR_CLAN", politicalFaction: "NOBILITY", leader: "Глава Хейм", baseLoyalty: 50 },
	],
	county_meyan: [
		{ id: "house_waldhof", name: "Род Вальдхоф", type: "MINOR_CLAN", politicalFaction: "LOYALISTS", leader: "Глава Вальдхоф", baseLoyalty: 60 },
		{ id: "house_montbrun", name: "Род Монбрун", type: "MINOR_CLAN", politicalFaction: "NOBILITY", leader: "Глава Монбрун", baseLoyalty: 50 },
	],
	county_skollfang: [
		{ id: "house_drakwald", name: "Род Дрейквальд", type: "MINOR_CLAN", politicalFaction: "NOBILITY", leader: "Икарон Дрейквальд", baseLoyalty: 50 },
		{ id: "house_boncraig", name: "Род Бонкрейг", type: "MINOR_CLAN", politicalFaction: "NOBILITY", leader: "Глава Бонкрейг", baseLoyalty: 50 },
		{ id: "house_wolfhart", name: "Род Вульфхарт", type: "MINOR_CLAN", politicalFaction: "LOYALISTS", leader: "Глава Вульфхарт", baseLoyalty: 80 },
	],
	county_takania: [
		{ id: "house_ippon", name: "Род Иппон", type: "MINOR_CLAN", politicalFaction: "NOBILITY", leader: "Глава Иппон", baseLoyalty: 50 },
		{ id: "house_cald", name: "Род Кальдов", type: "MINOR_CLAN", politicalFaction: "LOYALISTS", leader: "Глава Кальд", baseLoyalty: 80 },
	],
	order_varsiltaers: [
		{ id: "house_valdgreiv", name: "Род Вальдгрейв", type: "MINOR_CLAN", politicalFaction: "NOBILITY", leader: "Глава Вальдгрейв", baseLoyalty: 50 },
		{ id: "house_morven", name: "Род Морвен", type: "MINOR_CLAN", politicalFaction: "LOYALISTS", leader: "Глава Морвен", baseLoyalty: 80 },
	],
	principality_lorein: [
	{ id: "house_mastereno", name: "Род Мастерэно", type: "MINOR_CLAN", politicalFaction: "LOYALISTS", leader: "Арчибальд Мастерэно", baseLoyalty: 80 },
	{ id: "house_De_Rosa", name: "Род Де Розе", type: "MINOR_CLAN", politicalFaction: "LOYALISTS", leader: "Фалион де Розе", baseLoyalty: 80 },
	{ id: "house_vervut", name: "Род Вервут", type: "MINOR_CLAN", politicalFaction: "NOBILITY", leader: "Глава Вервут", baseLoyalty: 50 },
	{ id: "house_violette", name: "Род Виолетт", type: "MINOR_CLAN", politicalFaction: "NOBILITY", leader: "Глава Виолетт", baseLoyalty: 50 },
	{ id: "house_iriswain", name: "Род Ирисвейн", type: "MINOR_CLAN", politicalFaction: "NOBILITY", leader: "Глава Ирисвейн", baseLoyalty: 50 },
	],
	county_mensen: [
	{ id: "house_sakada", name: "Род Сакада", type: "MINOR_CLAN", politicalFaction: "NOBILITY", leader: "Глава Сакада", baseLoyalty: 50 },
	{ id: "house_gimadzu", name: "Род Гимадзу", type: "MINOR_CLAN", politicalFaction: "NOBILITY", leader: "Глава Гимадзу", baseLoyalty: 50 },
	{ id: "house_fraum", name: "Род Фраум", type: "MINOR_CLAN", politicalFaction: "NOBILITY", leader: "Глава Фраум", baseLoyalty: 60 },
	{ id: "house_ion", name: "Род Йон", type: "MINOR_CLAN", politicalFaction: "NOBILITY", leader: "Глава Йон", baseLoyalty: 60 },
	{ id: "house_mensen_merchant_guild", name: "Купеческая гильдия Менсена", type: "MERCHANT_GUILD", politicalFaction: "MERCHANTS", leader: "Глава Гильдии", baseLoyalty: 45, isMerchantGuild: true },
	],
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