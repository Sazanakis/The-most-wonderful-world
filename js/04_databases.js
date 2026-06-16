// ============================================================================
// МОДУЛЬ 04: databases.js
// Базы данных: черты характера, юниты, постройки
// ВЕРСИЯ 2.0 – СТРУКТУРИРОВАНА, НО СОДЕРЖИМОЕ НЕ ИЗМЕНЕНО
// ============================================================================

// ========== 1. БАЗА ДАННЫХ ЧЕРТ ХАРАКТЕРА (TRAITS_DB) ==========

const TRAITS_DB = {
    // Агроном
    AGRONOMIST: {
        id: "agronomist",
        name: "Агроном",
        description: "+5 лояльности за развитие сельского хозяйства",
        effectOnAction: (house, actionType, data) => {
            if (actionType === ACTION_TYPES.BUILDING_CONSTRUCTED && data.buildingType === "farm") {
                if (house.modifyLoyalty) house.modifyLoyalty(5, "Развитие сельского хозяйства (Агроном)");
                return true;
            }
            return false;
        }
    },
    
    // Жаждет знаний
    KNOWLEDGE_SEEKER: {
        id: "knowledge_seeker",
        name: "Жаждет знаний",
        description: "-10 лояльности, если влияние вассала выше чем у правителя",
        effectOnAction: (house, actionType, data, council) => {
            if (house.getEffectiveInfluence && council && house.getEffectiveInfluence() > council.getRulerVotes()) {
                if (house.modifyLoyalty) house.modifyLoyalty(-10, "Влияние превышает власть правителя (Жаждет знаний)");
                return true;
            }
            return false;
        }
    },
    
    // Ксенофоб
    XENOPHOBE: {
        id: "xenophobe",
        name: "Ксенофоб",
        description: "-5 лояльности за сделки с чужеземцами",
        effectOnAction: (house, actionType, data) => {
            if (actionType === ACTION_TYPES.TRADE_AGREEMENT && data.withOtherRace === true) {
                if (house.modifyLoyalty) house.modifyLoyalty(-5, "Сделка с чужеземцами (Ксенофоб)");
                return true;
            }
            return false;
        }
    },
    
    // Лицемер
    HYPOCRITE: {
        id: "hypocrite",
        name: "Лицемер",
        description: "-1 лояльности за каждую переданную землю другому",
        effectOnAction: (house, actionType, data) => {
            if (actionType === ACTION_TYPES.TERRITORY_GAINED && data.recipient !== house.name) {
                if (house.modifyLoyalty) house.modifyLoyalty(-1, `Земля передана ${data.recipient} (Лицемер)`);
                return true;
            }
            return false;
        }
    },
    
    // Провокатор
    PROVOCATEUR: {
        id: "provocateur",
        name: "Идёт на провокации",
        description: "+1 лояльности за публичную похвалу правителя",
        effectOnAction: (house, actionType, data) => {
            if (actionType === ACTION_TYPES.FACTION_LEADER_ACTION && data.type === "public_praise" && data.target === house.name) {
                if (house.modifyLoyalty) house.modifyLoyalty(1, "Публичная похвала правителя (Провокатор)");
                return true;
            }
            return false;
        }
    },
    
    // Пацифист
    PACIFIST: {
        id: "pacifist",
        name: "Ратует за мир",
        description: "-5 лояльности за каждые 5 ходов войны (до -15)",
        effectOnAction: (house, actionType, data, council) => {
            if (actionType === ACTION_TYPES.WAR_DECLARATION) {
                if (!house.counters) house.counters = {};
                house.counters.warsParticipated = (house.counters.warsParticipated || 0) + 1;
                let penalty = Math.min(15, Math.floor(house.counters.warsParticipated / 5) * 5);
                if (penalty > 0 && house.modifyLoyalty) {
                    house.modifyLoyalty(-penalty, `${penalty} за ${house.counters.warsParticipated} ходов войны (Пацифист)`);
                }
                return true;
            }
            return false;
        }
    },
    
    // Традиционалист
    TRADITIONALIST: {
        id: "traditionalist",
        name: "Традиционалист",
        description: "+1 лояльности за развитие культуры",
        effectOnAction: (house, actionType, data) => {
            if ((actionType === ACTION_TYPES.REFORM_PASSED || actionType === ACTION_TYPES.BUILDING_CONSTRUCTED) && 
                (data.type === "culture" || data.buildingType === "culture")) {
                if (house.modifyLoyalty) house.modifyLoyalty(1, "Развитие культуры (Традиционалист)");
                return true;
            }
            return false;
        }
    },
    
    // Популист
    POPULIST: {
        id: "populist",
        name: "Популист",
        description: "-10 лояльности за реформы, увеличивающие расходы",
        effectOnAction: (house, actionType, data) => {
            if (actionType === ACTION_TYPES.REFORM_PASSED && (data.type === "centralization" || data.type === "tax_increase")) {
                if (house.modifyLoyalty) house.modifyLoyalty(-10, "Реформа увеличивающая расходы (Популист)");
                return true;
            }
            return false;
        }
    },
    
    // Завоеватель
    CONQUEROR: {
        id: "conqueror",
        name: "Завоеватель",
        description: "+5 за войну, +1 за победу, -1 за поражение",
        effectOnAction: (house, actionType, data) => {
            if (actionType === ACTION_TYPES.WAR_DECLARATION) {
                if (house.modifyLoyalty) house.modifyLoyalty(5, "Начало новой войны (Завоеватель)");
                return true;
            }
            if (actionType === ACTION_TYPES.BATTLE_WON) {
                if (house.modifyLoyalty) house.modifyLoyalty(1, "Победа в сражении (Завоеватель)");
                if (!house.counters) house.counters = {};
                house.counters.battlesWon = (house.counters.battlesWon || 0) + 1;
                return true;
            }
            if (actionType === ACTION_TYPES.BATTLE_LOST) {
                if (house.modifyLoyalty) house.modifyLoyalty(-1, "Поражение в сражении (Завоеватель)");
                if (!house.counters) house.counters = {};
                house.counters.battlesLost = (house.counters.battlesLost || 0) + 1;
                return true;
            }
            return false;
        }
    },
    
    // Милитарист
    MILITARIST: {
        id: "militarist",
        name: "Милитарист",
        description: "+2 лояльности за военные постройки и реформы",
        effectOnAction: (house, actionType, data) => {
            if (actionType === ACTION_TYPES.BUILDING_CONSTRUCTED && (data.buildingType === "military" || data.buildingType === "defense")) {
                if (house.modifyLoyalty) house.modifyLoyalty(2, "Военная постройка (Милитарист)");
                return true;
            }
            if (actionType === ACTION_TYPES.REFORM_PASSED && data.type === "military") {
                if (house.modifyLoyalty) house.modifyLoyalty(2, "Военная реформа (Милитарист)");
                return true;
            }
            return false;
        }
    },
    
    // Дипломат
    DIPLOMAT: {
        id: "diplomat",
        name: "Дипломат",
        description: "+1 за удачные соглашения, -1 за испорченные отношения",
        effectOnAction: (house, actionType, data) => {
            if (actionType === ACTION_TYPES.TRADE_AGREEMENT && data.success === true) {
                if (house.modifyLoyalty) house.modifyLoyalty(1, "Удачное торговое соглашение (Дипломат)");
                if (!house.counters) house.counters = {};
                house.counters.tradeAgreements = (house.counters.tradeAgreements || 0) + 1;
                return true;
            }
            if (actionType === ACTION_TYPES.DIPLOMATIC_INSULT) {
                if (house.modifyLoyalty) house.modifyLoyalty(-1, "Испорченные дипломатические отношения (Дипломат)");
                if (!house.counters) house.counters = {};
                house.counters.diplomaticInsults = (house.counters.diplomaticInsults || 0) + 1;
                return true;
            }
            return false;
        }
    },
    
    // Меркантильный торгаш
    MERCANTILE: {
        id: "mercantile",
        name: "Меркантильный торгаш",
        description: "+1 лояльности за каждое торговое соглашение (до 10)",
        effectOnAction: (house, actionType, data) => {
            if (actionType === ACTION_TYPES.TRADE_AGREEMENT) {
                if (!house.counters) house.counters = {};
                if ((house.counters.tradeAgreements || 0) < 10) {
                    house.counters.tradeAgreements = (house.counters.tradeAgreements || 0) + 1;
                    if (house.modifyLoyalty) house.modifyLoyalty(1, `Торговое соглашение (${house.counters.tradeAgreements}/10) (Меркантильный торгаш)`);
                }
                return true;
            }
            return false;
        }
    },
    
    // Честь
    HONORABLE: {
        id: "honorable",
        name: "Честь",
        description: "+10 за подвиги, -10 за поражения, +5 за добрые дела",
        effectOnAction: (house, actionType, data) => {
            if (actionType === ACTION_TYPES.BATTLE_WON && data.isRulerLed === true) {
                if (house.modifyLoyalty) house.modifyLoyalty(10, "Личная победа правителя (Честь)");
                return true;
            }
            if (actionType === ACTION_TYPES.BATTLE_LOST && data.isRulerLed === true) {
                if (house.modifyLoyalty) house.modifyLoyalty(-10, "Личное поражение правителя (Честь)");
                return true;
            }
            if (actionType === ACTION_TYPES.FACTION_LEADER_ACTION && data.type === "good_deed") {
                if (house.modifyLoyalty) house.modifyLoyalty(5, "Доброе деяние правителя (Честь)");
                return true;
            }
            return false;
        }
    },
    
    // Патриот
    PATRIOT: {
        id: "patriot",
        name: "Патриот",
        description: "-5 лояльности за врага на родных землях",
        effectOnAction: (house, actionType, data) => {
            if (actionType === ACTION_TYPES.TERRITORY_LOST && data.enemyArmyOnLand === true) {
                if (house.modifyLoyalty) house.modifyLoyalty(-5, "Вражеская армия на родных землях (Патриот)");
                return true;
            }
            return false;
        }
    },
    
    // Религиозный
    RELIGIOUS: {
        id: "religious",
        name: "Религиозный",
        description: "+5 за религ. постройки, -15 за атеизм, +20 за религ. войну",
        effectOnAction: (house, actionType, data, council) => {
            if (actionType === ACTION_TYPES.BUILDING_CONSTRUCTED && data.buildingType === "religious") {
                if (house.modifyLoyalty) house.modifyLoyalty(5, "Религиозная постройка (Религиозный)");
                return true;
            }
            if (council && council.stats && council.stats.isAtheist === true) {
                if (house.modifyLoyalty) house.modifyLoyalty(-15, "Правитель-атеист (Религиозный)");
                return true;
            }
            if (actionType === ACTION_TYPES.WAR_DECLARATION && data.religiousMotivation === true) {
                if (house.modifyLoyalty) house.modifyLoyalty(20, "Религиозная война (Религиозный)");
                return true;
            }
            return false;
        }
    }
};

console.log("✅ 04_databases.js — часть 1 (TRAITS_DB) загружена");

// ============================================================================
// ЧАСТЬ 2: БАЗА ДАННЫХ ЮНИТОВ (unitDatabase)
// ============================================================================

const unitDatabase = {
    // ========== ФРАКЦИЯ ДАЁ (ОКУ) ==========
    "Селяне-ополченцы оку": {
        name: "Селяне-ополченцы оку",
        race: "Оку",
        gender: "any",
        troopType: "Ополчение",
        strength: 3,
        defense: 2,
        morale: 2,
        upkeep: 1,
        hireCost: 0,
        countPerUnit: 100,
        description: "Оку-крестьяне, вооружённые косами и вилами. Необучены, но многочисленны.",
        availableFactions: ["dayo"],
        special: "«Укусить перед смертью»",
        icon: "villager_oku.png",
        maxCount: null,
        hireTime: 1
    },
    
    "Ополчение оку": {
        name: "Ополчение оку",
        race: "Оку",
        gender: "male",
        troopType: "Ополчение",
        strength: 7,
        defense: 7,
        morale: 6,
        upkeep: 1,
        hireCost: 250,
        countPerUnit: 150,
        description: "Городское ополчение оку. Обучены базовым приёмам боя.",
        availableFactions: ["dayo"],
        special: "«Выжить»",
        icon: "militia_oku.png",
        maxCount: null,
        hireTime: 1
    },
    
    "Мураи": {
        name: "Мураи",
        race: "Оку",
        gender: "male",
        troopType: "Элитная пехота",
        strength: 14,
        defense: 7,
        morale: 10,
        upkeep: 6,
        hireCost: 600,
        countPerUnit: 100,
        description: "Воины оку сёгуната. Профессиональные солдаты с катанами.",
        availableFactions: ["dayo"],
        special: "«Насмерть!»",
        icon: "Murai.png",
        maxCount: null,
        hireTime: 3
    },
    
    "Кишины": {
        name: "Кишины",
        race: "Оку",
        gender: "male",
        troopType: "Берсерки",
        strength: 10,
        defense: 6,
        morale: 15,
        upkeep: 15,
        hireCost: 700,
        countPerUnit: 30,
        description: "Воины, зависимые от зелья ярости. В бою не знают страха.",
        availableFactions: ["dayo"],
        special: "«Безумие»",
        icon: "Kishins.png",
        maxCount: 2,
        hireTime: 4
    },
    
    "Гоблины асигару": {
        name: "Гоблины асигару",
        race: "Гоблины",
        gender: "male",
        troopType: "Лёгкая пехота",
        strength: 4,
        defense: 7,
        morale: 6,
        upkeep: 1.5,
        hireCost: 250,
        countPerUnit: 100,
        description: "Гоблины-асигару, легковооружённые копейщики.",
        availableFactions: ["dayo"],
        special: "«Тактика трёх»",
        icon: "Goblins_ashigaru.png",
        maxCount: null,
        hireTime: 2
    },
    
    "Гайдзины асигару пикинёры": {
        name: "Гайдзины асигару пикинёры",
        race: "Люди",
        gender: "male",
        troopType: "Пикинёры",
        strength: 6,
        defense: 7,
        morale: 6,
        upkeep: 1.7,
        hireCost: 300,
        countPerUnit: 100,
        description: "Люди-пикинёры на службе даё.",
        availableFactions: ["dayo"],
        special: "«Строй пик»",
        icon: "Gajins_Ashigaru_pic.png",
        maxCount: null,
        hireTime: 2
    },
    
    "Гайдзины асигару лучники": {
        name: "Гайдзины асигару лучники",
        race: "Люди",
        gender: "male",
        troopType: "Лучники",
        strengthMelee: 5,
        strengthRanged: 6,
        defense: 7,
        morale: 5,
        upkeep: 2.57,
        hireCost: 320,
        countPerUnit: 70,
        description: "Люди-лучники на службе даё.",
        availableFactions: ["dayo"],
        special: "«Участники засад»",
        icon: "gajin_archers.png",
        maxCount: null,
        hireTime: 2
    },
    
    "Бизоньи всадники": {
        name: "Бизоньи всадники",
        race: "Оку",
        gender: "male",
        troopType: "Тяжёлая кавалерия",
        strength: 12,
        defense: 10,
        morale: 10,
        upkeep: 7,
        hireCost: 650,
        countPerUnit: 50,
        description: "Всадники на бизонах. Мощный таранный удар.",
        availableFactions: ["dayo"],
        special: "«Сокрушительный натиск»",
        icon: "bison_riders.png",
        maxCount: 3,
        hireTime: 4
    },
    
    "Налетчики на вивернах": {
        name: "Налетчики на вивернах",
        race: "Оку",
        gender: "any",
        troopType: "Воздушная кавалерия",
        strength: 15,
        strengthRanged: 4,
        defense: 5,
        morale: 10,
        upkeep: 100,
        hireCost: 900,
        countPerUnit: 5,
        description: "Лучшие из мураев, сражающиеся с небес.",
        availableFactions: ["dayo"],
        special: "«Ужас с небес»",
        icon: "wyvern_raiders.png",
        maxCount: 2,
        hireTime: 4
    },
    
    "Онна-бугэйся": {
        name: "Онна-бугэйся",
        race: "Оку",
        gender: "female",
        troopType: "Лучники / Нагината",
        strength: 10,
        strengthRanged: 8,
        defense: 8,
        morale: 10,
        upkeep: 6,
        hireCost: 500,
        countPerUnit: 50,
        description: "Женщины-мураи, владеющие луком и нагинатой.",
        availableFactions: ["dayo"],
        special: "«Универсальность»",
        icon: "onna_bugeisha.png",
        maxCount: null,
        hireTime: 3
    },

    // ========== ЛОЯЛИСТЫ (ЛЮДИ) ==========
    "Селяне-ополченцы люди": {
        name: "Селяне-ополченцы люди",
        race: "Люди",
        gender: "any",
        troopType: "Ополчение",
        strength: 2,
        defense: 2,
        morale: 2,
        upkeep: 100,
        hireCost: 0,
        countPerUnit: 100,
        description: "Многочисленный и жизнестойкий слой населения, крепко связанный с землёй. Вооружены косами, вилами и топорами.",
        availableFactions: ["loyal", "neutral", "proyurgan", "regency", "lepus"],
        special: "«Укусить перед смертью»: в критический момент боевой дух взлетает на +5.",
        icon: "peasant_militia.png",
        maxCount: null,
        hireTime: 1
    },
    
    "Ополчение люди": {
        name: "Ополчение люди",
        race: "Люди",
        gender: "male",
        troopType: "Ополчение",
        strength: 7,
        defense: 7,
        morale: 6,
        upkeep: 1,
        hireCost: 250,
        countPerUnit: 150,
        description: "Городское ополчение людей. Обучены базовым приёмам боя.",
        availableFactions: ["loyal", "neutral", "proyurgan", "regency", "lepus"],
        special: "«Выжить»",
        icon: "militia.png",
        maxCount: null,
        hireTime: 1
    },
    
    "Лучники": {
        name: "Лучники",
        race: "Люди",
        gender: "male",
        troopType: "Лучники",
        strengthMelee: 4,
        strengthRanged: 5,
        defense: 6,
        morale: 4,
        upkeep: 3,
        hireCost: 200,
        countPerUnit: 50,
        description: "Стрелки дальнего боя. Эффективны против пехоты.",
        availableFactions: ["loyal", "neutral", "proyurgan"],
        special: "«Против воздушных целей»",
        icon: "archers.png",
        maxCount: null,
        hireTime: 1
    },
    
    "Валькирии": {
        name: "Валькирии",
        race: "Люди",
        gender: "female",
        troopType: "Поддержка / Тяжёлая пехота",
        strength: 14,
        defense: 8,
        morale: 10,
        upkeep: 3.4,
        hireCost: 888,
        countPerUnit: 88,
        description: "Женщины-воительницы, вдохновляющие союзников.",
        availableFactions: ["loyal"],
        special: "«Песнь войны»",
        icon: "valkyries.png",
        maxCount: 2,
        hireTime: 3
    },
    
    "Мечники": {
        name: "Мечники",
        race: "Люди",
        gender: "male",
        troopType: "Пехота",
        strength: 12,
        defense: 9,
        morale: 7,
        upkeep: 2,
        hireCost: 400,
        countPerUnit: 100,
        description: "Хорошо защищённые воины с мечами.",
        availableFactions: ["loyal", "neutral", "proyurgan"],
        special: "«Поднять знамёна!»",
        icon: "swordsmen.png",
        maxCount: null,
        hireTime: 2
    },
    
    "Рейнджеры": {
        name: "Рейнджеры",
        race: "Люди",
        gender: "male",
        troopType: "Лёгкая пехота / разведка",
        strength: 5,
        strengthRanged: 8,
        defense: 9,
        morale: 10,
        upkeep: 3.33,
        hireCost: 400,
        countPerUnit: 90,
        description: "Мастера лесных засад и разведки.",
        availableFactions: ["loyal", "neutral", "proyurgan"],
        special: "«Камуфляж и внезапность»",
        icon: "rangers.png",
        maxCount: null,
        hireTime: 2
    },
    
    "Орлиные рыцари": {
        name: "Орлиные рыцари",
        race: "Люди",
        gender: "any",
        troopType: "Воздушная кавалерия",
        strength: 15,
        strengthRanged: 4,
        defense: 8,
        morale: 10,
        upkeep: 100,
        hireCost: 950,
        countPerUnit: 5,
        description: "Наездники на орланах, элита лоялистов.",
        availableFactions: ["loyal", "neutral", "proyurgan"],
        special: "«Король всех птиц»",
        icon: "eagle_knights.png",
        maxCount: 2,
        hireTime: 4
    },
    
    "Вольные рыцари": {
        name: "Вольные рыцари",
        race: "Люди",
        gender: "male",
        troopType: "Средняя кавалерия",
        strength: 10,
        defense: 9,
        morale: 13,
        upkeep: 3.75,
        hireCost: 600,
        countPerUnit: 80,
        description: "Младшие сыновья знати, ищущие славы.",
        availableFactions: ["loyal", "neutral"],
        special: "«Импульсивная молодёжь»",
        icon: "free_knights.png",
        maxCount: 5,
        hireTime: 3
    },
    
    "Пикинёры": {
        name: "Пикинёры",
        race: "Люди",
        gender: "male",
        troopType: "Пикинёры",
        strength: 8,
        defense: 7,
        morale: 9,
        upkeep: 1.9,
        hireCost: 300,
        countPerUnit: 100,
        description: "Пикинёры лоялистов, эффективны против кавалерии.",
        availableFactions: ["loyal", "neutral", "proyurgan"],
        special: "«Стена смертников»",
        icon: "pikemen.png",
        maxCount: null,
        hireTime: 2
    },
    
    "Гоблинские арбалетчики": {
        name: "Гоблинские арбалетчики",
        race: "Гоблины",
        gender: "male",
        troopType: "Арбалетчики",
        strengthMelee: 2,
        strengthRanged: 8,
        defense: 5,
        morale: 5,
        upkeep: 2,
        hireCost: 300,
        countPerUnit: 60,
        description: "Гоблины с арбалетами, наёмники.",
        availableFactions: ["loyal"],
        special: "«Есть пробитие»",
        icon: "goblin_crossbowmen.png",
        maxCount: null,
        hireTime: 2
    },
    
    // ========== НЕЙТРАЛЫ ==========
    "Мясники Варсиса": {
        name: "Мясники Варсиса",
        race: "Люди",
        gender: "male",
        troopType: "Ударная пехота",
        strength: 10,
        strengthRanged: 2,
        defense: 6,
        morale: 15,
        upkeep: 15,
        hireCost: 700,
        countPerUnit: 30,
        description: "Последователи бога войны, жаждущие крови.",
        availableFactions: ["neutral"],
        special: "«Да прольются реки крови!»",
        icon: "butchers_of_varsis.png",
        maxCount: 2,
        hireTime: 3
    },
    
    "Гамураи": {
        name: "Гамураи",
        race: "Вульфины",
        gender: "male",
        troopType: "Элитная пехота",
        strength: 14,
        defense: 9,
        morale: 10,
        upkeep: 3.89,
        hireCost: 650,
        countPerUnit: 90,
        description: "Вульфины-мураи, сильные и выносливые.",
        availableFactions: ["neutral"],
        special: "«Сила зверя»",
        icon: "gamurai.png",
        maxCount: null,
        hireTime: 3
    },
    
    // ========== ПРОЮРГАНЦЫ ==========
    "Дэфекторы": {
        name: "Дэфекторы",
        race: "Люди",
        gender: "male",
        troopType: "Алебардисты",
        strength: 10,
        defense: 7,
        morale: 10,
        upkeep: 3.5,
        hireCost: 100,
        countPerUnit: 100,
        description: "Ветераны империи, перешедшие на сторону Юргана.",
        availableFactions: ["proyurgan"],
        special: "«Во славу»",
        icon: "defectors.png",
        maxCount: 4,
        hireTime: 3
    },
    
    "Добровольческий корпус": {
        name: "Добровольческий корпус",
        race: "Люди",
        gender: "male",
        troopType: "Ополчение",
        strength: 7,
        defense: 7,
        morale: 6,
        upkeep: 2,
        hireCost: 0,
        countPerUnit: 200,
        description: "Юрганские ополченцы, идейные сторонники.",
        availableFactions: ["proyurgan"],
        special: "«Во власти желаний»",
        icon: "volunteer_corps.png",
        maxCount: 4,
        hireTime: 1
    },
    
    // ========== ДВАРФЫ (НАЁМНИКИ ДЛЯ ВСЕХ) ==========
    "Дварфийские легионеры": {
        name: "Дварфийские легионеры",
        race: "Дварфы",
        gender: "male",
        troopType: "Тяжёлая пехота",
        strength: 8,
        defense: 15,
        morale: 6,
        upkeep: 2.5,
        hireCost: 800,
        countPerUnit: 200,
        description: "Элитная наёмная пехота. Живая крепость на поле боя.",
        availableFactions: ["dayo", "loyal", "neutral", "proyurgan", "regency", "lepus"],
        special: "«Живая крепость»",
        icon: "dwarven_legionnaires.png",
        maxCount: 1,
        hireTime: 1
    }
};

// Нормализация юнитов (добавляем отсутствующие поля)
for (let key in unitDatabase) {
    let u = unitDatabase[key];
    if (u.strengthRanged === undefined) u.strengthRanged = u.strength;
    if (u.strengthMelee === undefined) u.strengthMelee = u.strength;
    if (u.hireTime === undefined) u.hireTime = 1;
    if (u.maxCount === undefined) u.maxCount = null;
}

console.log("✅ 04_databases.js — часть 2 (unitDatabase) загружена");

// ============================================================================
// ЧАСТЬ 3: БАЗА ДАННЫХ ПОСТРОЕК (buildingsCatalog)
// ============================================================================

const buildingsCatalog = {
    // ========== СТАРЫЕ ПОСТРОЙКИ (цены повышены) ==========
    "Лесопилка": {
        name: "Лесопилка",
        description: "+50 древесины в ход",
        cost: { wood: 200, stone: 100, iron: 0, gold: 0, ers: 2500 },
        buildTime: 3,
        income: { wood: 50, stone: 0, iron: 0, gold: 0, ers: 0 },
        upgrade: {
            cost: { wood: 300, stone: 160, iron: 40, gold: 0, ers: 4000 },
            buildTime: 4,
            income: { wood: 100, stone: 0, iron: 0, gold: 0, ers: 0 },
            nameLevel2: "Лесопилка (улучшенная)"
        }
    },
    
    "Каменоломня": {
        name: "Каменоломня",
        description: "+30 камня в ход",
        cost: { wood: 160, stone: 0, iron: 40, gold: 0, ers: 3000 },
        buildTime: 3,
        income: { wood: 0, stone: 30, iron: 0, gold: 0, ers: 0 },
        upgrade: {
            cost: { wood: 240, stone: 120, iron: 60, gold: 0, ers: 5000 },
            buildTime: 4,
            income: { wood: 0, stone: 60, iron: 0, gold: 0, ers: 0 },
            nameLevel2: "Каменоломня (улучшенная)"
        }
    },
    
    "Железная шахта": {
        name: "Железная шахта",
        description: "+20 железа в ход",
        cost: { wood: 240, stone: 160, iron: 0, gold: 0, ers: 4000 },
        buildTime: 4,
        income: { wood: 0, stone: 0, iron: 20, gold: 0, ers: 0 },
        upgrade: {
            cost: { wood: 360, stone: 240, iron: 60, gold: 0, ers: 6000 },
            buildTime: 5,
            income: { wood: 0, stone: 0, iron: 40, gold: 0, ers: 0 },
            nameLevel2: "Железная шахта (улучшенная)"
        }
    },
    
    "Золотая шахта": {
        name: "Золотая шахта",
        description: "+10 золота в ход",
        cost: { wood: 300, stone: 200, iron: 60, gold: 0, ers: 7500 },
        buildTime: 5,
        income: { wood: 0, stone: 0, iron: 0, gold: 10, ers: 0 },
        upgrade: {
            cost: { wood: 500, stone: 360, iron: 100, gold: 20, ers: 10000 },
            buildTime: 6,
            income: { wood: 0, stone: 0, iron: 0, gold: 20, ers: 0 },
            nameLevel2: "Золотая шахта (улучшенная)"
        }
    },
    
    "Монетный двор": {
        name: "Монетный двор",
        description: "Увеличивает обмен золота: 1 золото → 120 эрсов",
        cost: { wood: 400, stone: 300, iron: 100, gold: 0, ers: 10000 },
        buildTime: 4,
        income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
        special: "coinBonus",
        upgrade: {
            cost: { wood: 600, stone: 400, iron: 160, gold: 40, ers: 15000 },
            buildTime: 5,
            income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
            nameLevel2: "Монетный двор (улучшенный)",
            special2: "coinBonusPlus"
        }
    },
    
    "Кузница": {
        name: "Кузница",
        description: "Увеличивает добычу железа на 50%",
        cost: { wood: 160, stone: 120, iron: 40, gold: 0, ers: 4000 },
        buildTime: 3,
        income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
        special: "ironBonus",
        upgrade: {
            cost: { wood: 240, stone: 200, iron: 60, gold: 0, ers: 6000 },
            buildTime: 4,
            income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
            nameLevel2: "Кузница (улучшенная)",
            special2: "ironBonusPlus"
        }
    },
    
    "Казармы": {
        name: "Казармы",
        description: "Сокращает время тренировки войск на 1 ход",
        cost: { wood: 200, stone: 160, iron: 80, gold: 0, ers: 5000 },
        buildTime: 3,
        income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
        special: "trainingBonus",
        upgrade: {
            cost: { wood: 300, stone: 240, iron: 120, gold: 0, ers: 7500 },
            buildTime: 4,
            income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
            nameLevel2: "Казармы (улучшенные)",
            special2: "trainingBonusPlus"
        }
    },

    // ========== НОВЫЕ ПОСТРОЙКИ (цены повышены) ==========
    "Рынок": {
        name: "Рынок",
        description: "Увеличивает налоговые поступления провинции на 15%.",
        cost: { wood: 400, stone: 200, iron: 40, gold: 10, ers: 5000 },
        buildTime: 3,
        income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
        special: "taxBonus",
        upgrade: {
            cost: { wood: 600, stone: 300, iron: 80, gold: 20, ers: 7500 },
            buildTime: 4,
            income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
            nameLevel2: "Большой рынок",
            special2: "taxBonusPlus"
        }
    },

    "Таверна": {
        name: "Таверна",
        description: "Позволяет нанимать наёмные отряды (дварфийских легионеров и др.). Без неё найм наёмников невозможен.",
        cost: { wood: 300, stone: 100, iron: 20, gold: 0, ers: 3000 },
        buildTime: 3,
        income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
        special: "tavern",
        upgrade: {
            cost: { wood: 500, stone: 200, iron: 60, gold: 20, ers: 6000 },
            buildTime: 4,
            income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
            nameLevel2: "Большая таверна",
            special2: "tavernPlus"
        }
    },

    "Храм": {
        name: "Храм",
        description: "Снижает отчаяние высших эльфов, повышает лояльность религиозных домов, приносит небольшой доход.",
        cost: { wood: 600, stone: 400, iron: 60, gold: 20, ers: 7500 },
        buildTime: 4,
        income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 20 },
        special: "temple",
        upgrade: {
            cost: { wood: 800, stone: 600, iron: 100, gold: 40, ers: 10000 },
            buildTime: 5,
            income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 40 },
            nameLevel2: "Святилище",
            special2: "templePlus"
        }
    },

    "Осадная мастерская": {
        name: "Осадная мастерская",
        description: "Позволяет строить осадные орудия (функционал появится позже).",
        cost: { wood: 500, stone: 400, iron: 160, gold: 10, ers: 7500 },
        buildTime: 4,
        income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
        special: "siegeWorkshop",
        upgrade: {
            cost: { wood: 700, stone: 600, iron: 240, gold: 20, ers: 10000 },
            buildTime: 5,
            income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
            nameLevel2: "Инженерный цех",
            special2: "siegeWorkshopPlus"
        }
    }
};

const RESOURCES_REGISTRY = {
    wood:   { id: "wood",   name: "Древесина", icon: "icons/wood.png",  category: "basic",    tradeable: true,  defaultValue: 500 },
    stone:  { id: "stone",  name: "Камень",    icon: "icons/stone.png", category: "basic",    tradeable: true,  defaultValue: 300 },
    iron:   { id: "iron",   name: "Железо",    icon: "icons/iron.png",  category: "strategic",tradeable: true,  defaultValue: 200 },
    gold:   { id: "gold",   name: "Золото",    icon: "icons/gold.png",  category: "luxury",   tradeable: true,  defaultValue: 10 },
    ers:    { id: "ers",    name: "Эрсы",      icon: "icons/ers.png",   category: "currency", tradeable: true,  defaultValue: 10000 }
};

console.log("✅ 04_databases.js — часть 3 (buildingsCatalog) загружена");
console.log("✅ МОДУЛЬ 04 ПОЛНОСТЬЮ ЗАГРУЖЕН (черты + юниты + постройки)");