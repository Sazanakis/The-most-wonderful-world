// ============================================================================
// МОДУЛЬ: factions_units.js
// База данных юнитов для всех фракций (отдельно от карты)
// Версия 1.0 – полностью копия старого unitDatabase из 04_databases.js
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
        upkeep: 1,
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

    // ========== НАЁМНИКИ (доступны всем) ==========
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
        hireTime: 1,
		isMercenary: true 
    },
	// ========== Графство Фогельмарк ==========
	"Боевые монахини Варситэи": {
		name: "Боевые монахини Варситэи",
		race: "Люди",
		gender: "female",
		troopType: "Лёгкая пехота",
		strengthMelee: 8,
		strengthRanged: 6,
		defense: 6,
		morale: 10,
		upkeep: 250,
		hireCost: 550,
		countPerUnit: 50,
		description: "С верой в сердце, с мечом в руке. Снижают потери отряда во время боя.",
		availableFactions: [],   // не используем старую систему
		faction: "county_vogelmark",  // <-- только для этой фракции
		special: "«Ты будешь спасён»",
		icon: "Martial_Nuns_Varsitei.png",
		maxCount: null,
		hireTime: 2
	}
};

// Нормализация юнитов
for (let key in unitDatabase) {
    let u = unitDatabase[key];
    if (u.strengthRanged === undefined) u.strengthRanged = u.strength;
    if (u.strengthMelee === undefined) u.strengthMelee = u.strength;
    if (u.hireTime === undefined) u.hireTime = 1;
    if (u.maxCount === undefined) u.maxCount = null;
}

// Экспорт в глобальную область
window.unitDatabase = unitDatabase;
window.MERCENARY_UNITS = { "Дварфийские легионеры": unitDatabase["Дварфийские легионеры"] };

// ========== RHETORIC_UNIT_POOLS (добавлено) ==========
window.RHETORIC_UNIT_POOLS = {
    dayo: {
        name: "Даё",
        units: [
            "Селяне-ополченцы оку", "Ополчение оку", "Гоблины асигару",
            "Гайдзины асигару пикинёры", "Гайдзины асигару лучники", "Мураи",
            "Онна-бугэйся", "Кишины", "Бизоньи всадники", "Налетчики на вивернах"
        ],
        icon: "icons/dayo_flag.png", color: "#ff6b6b"
    },
    loyal: {
        name: "Лоялисты",
        units: [
            "Селяне-ополченцы люди", "Ополчение люди", "Лучники", "Мечники",
            "Пикинёры", "Гоблинские арбалетчики", "Рейнджеры", "Валькирии",
            "Вольные рыцари", "Орлиные рыцари"
        ],
        icon: "icons/loyal_flag.png", color: "#4a90d9"
    },
    neutral: {
        name: "Нейтралы",
        units: [
            "Селяне-ополченцы люди", "Ополчение люди", "Лучники", "Мечники",
            "Пикинёры", "Рейнджеры", "Мясники Варсиса", "Гамураи",
            "Вольные рыцари", "Орлиные рыцари"
        ],
        icon: "icons/neutral_flag.png", color: "#cfc294"
    },
    proyurgan: {
        name: "Проюрганцы",
        units: [
            "Селяне-ополченцы люди", "Ополчение люди", "Лучники", "Добровольческий корпус",
            "Мечники", "Пикинёры", "Рейнджеры", "Дэфекторы", "Вольные рыцари", "Орлиные рыцари"
        ],
        icon: "icons/proyurgan_flag.png", color: "#8b4513"
    },
    lepus: {
        name: "Союз Лепус",
        units: [
            "Селяне-ополченцы люди", "Ополчение люди", "Лучники", "Мечники",
            "Пикинёры", "Рейнджеры", "Вольные рыцари", "Орлиные рыцари"
        ],
        icon: "icons/lepus_flag.png", color: "#6a9fb5"
    }
};

console.log("✅ factions_units.js загружен (unitDatabase + RHETORIC_UNIT_POOLS)");