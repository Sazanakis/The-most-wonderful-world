// ============================================================================
// МОДУЛЬ: technologies.js (версия 8.0 – абсолютная совместимость)
// ============================================================================
// загружено на гитхаб 26.09.26
// ============================================================
// РАЗДЕЛ 1: ИНИЦИАЛИЗАЦИЯ ГЛОБАЛЬНЫХ ОБЪЕКТОВ
// ============================================================

// Гарантируем существование researchData
if (typeof window.researchData === 'undefined') {
    window.researchData = {
        researchers: { military: null, civil: null, unique: null },
        techQueue: [],
        completedTechs: [],
        pausedTechs: {}
    };
}

// Гарантируем существование TECH_DB (базовый набор технологий)
if (typeof window.TECH_DB === 'undefined' || Object.keys(window.TECH_DB).length === 0) {
    window.TECH_DB = {
        "military_drills": {
            id: "military_drills", name: "Военные учения", category: "military",
            description: "Регулярные тренировки гарнизонов улучшают боеспособность ополчения.",
            points: 80, effects: { conscriptionBonus: 5 }
        },
        "improved_armor": {
            id: "improved_armor", name: "Улучшенные доспехи", category: "military",
            description: "Новая техника ковки позволяет создавать более прочные доспехи для пехоты.",
            points: 120, effects: { infantryDefenseBonus: 1 }
        },
        "fortifications": {
            id: "fortifications", name: "Фортификации", category: "military",
            description: "Передовые методы строительства укреплений снижают расход камня.",
            points: 100, effects: { buildingStoneDiscount: 0.2 }
        },
        "crop_rotation": {
            id: "crop_rotation", name: "Севооборот", category: "civil",
            description: "Чередование культур повышает плодородие почв и увеличивает сбор налогов.",
            points: 70, effects: { taxBonus: 5 }
        },
        "trade_guilds": {
            id: "trade_guilds", name: "Купеческие гильдии", category: "civil",
            description: "Объединение торговцев в гильдии приносит дополнительный доход в казну.",
            points: 90, effects: { tradeBonus: 10 }
        },
        "advanced_metallurgy": {
            id: "advanced_metallurgy", name: "Передовая металлургия", category: "civil",
            description: "Новые сплавы увеличивают добычу железа на всех шахтах.",
            points: 110, effects: { ironProductionBonus: 0.2 }
        },
        "path_of_warrior": {
            id: "path_of_warrior", name: "Путь воина", category: "unique",
            description: "Духовные практики воспитывают непоколебимую волю к победе.",
            points: 150, effects: { globalMoraleBonus: 2 }
        },
        "vogel_statue": {
            id: "vogel_statue", name: "Реставрация Статуи Варситэи", category: "unique",
            faction: "county_vogelmark",
            description: "Восстановление древней святыни привлекает паломников и воодушевляет защитниц веры.",
            points: 200,
            effects: { taxBonus: 5, hireDiscountByUnit: { "Боевые монахини Варситэи": 10 } }
        },
        "vogel_siege_cell": {
            id: "vogel_siege_cell", name: "Фогельмаркская десантная клеть", category: "military",
            description: "Позволяет перебрасывать небольшие отряды пехоты через стены и линии обороны.",
            points: 60,
            effects: {}
        },
        "dionia_cavalry_school": {
            id: "dionia_cavalry_school", name: "Кавалерийский отбор", category: "unique",
            faction: "county_dionia",
            description: "Специальный отбор среди талантливых всадников для увеличения Чёрной гвардии.",
            points: 90,
            effects: { blackGuardLimitIncrease: 1 }
        },
        "meyan_fortification": {
            id: "meyan_fortification", name: "Укрепление города Мейана", category: "military",
            faction: "county_meyan",
            description: "Мощные фортификационные укрепления столицы. Требует 100 камня, 20 железа и 25000 эрсов для открытия.",
            points: 90,
            effects: { garrisonDefenseBonus: 2 },
            exportable: false,
            _startCost: { stone: 100, iron: 20, ers: 25000 }
        }
    };
    console.log('🛠️ TECH_DB инициализирован');
}

// ============================================================
// РАЗДЕЛ 2: КОНСТАНТЫ (имена, портреты, бонусы)
// ============================================================

const SLOT_NAMES = {
    military: '⚔️ Военный',
    civil: '🏘️ Гражданский',
    unique: '✨ Уникальный'
};

const BONUS_NAMES = {
    conscriptionBonus: { name: 'Призывной резерв', isPercent: true },
    taxBonus: { name: 'Налоги', isPercent: true },
    tradeBonus: { name: 'Торговая прибыль', isPercent: true },
    ironProductionBonus: { name: 'Добыча железа', isPercent: true },
    buildingStoneDiscount: { name: 'Скидка на камень', isPercent: true },
    infantryDefenseBonus: { name: 'Защита пехоты', isPercent: false },
    globalMoraleBonus: { name: 'Мораль', isPercent: false },
    garrisonDefenseBonus: { name: 'Оборона гарнизона', isPercent: false },
    hireDiscountByUnit: { name: 'Скидка на найм', isPercent: false },
    upkeepDiscountByUnit: { name: 'Скидка на содержание', isPercent: false },
    civilTechCostReduction: { name: 'Скидка на гражданские технологии', isPercent: true }
};

// (RACE_NAMES и RESEARCHER_PORTRAITS – оставляем как у вас, они полные)
const RACE_NAMES = {
    "Люди": {
        male: ["Альберик","Берин","Вильгельм","Дитрих","Зигфрид","Конрад","Вольфганг","Дитмар","Иоганн","Отто"],
        female: ["Гизела","Эльза","Хельга","Ирма","Адальберта","Брунгильда","Грета","Эдель","Зельда","Хильда"]
    },
    "Оку": {
        male: ["Рэн","Хирото","Кента","Цубаса","Юкимура","Юма","Рю","Акира","Хикару","Наруто"],
        female: ["Сакура","Мисаки","Аи","Аяко","Хина","Саюри","Харука","Наоми","Кэйко","Аяка"]
    },
    "Дварфы": {
        male: ["Торин","Гимли","Двалин","Балин","Фили","Кили","Бофур","Бомбур","Дори","Нори"],
        female: ["Дис","Грор","Гроин","Оин","Глоин","Фрар","Лони","Нали","Трорин","Фрея"]
    },
    "Высшие эльфы": {
        male: ["Элендиль","Кирдан","Элронд","Леголас","Трандуил","Келеборн","Гилдор","Финрод","Эарендиль","Маэглин"],
        female: ["Галадриэль","Арвен","Идриль","Лютиэн","Ниэнор","Мелиан","Эарвен","Финдилас","Мириэль","Нимродэль"]
    },
    "Гоблины": {
        male: ["Гирудзаку","Гунаси","Хагото","Сунику","Рото","Дзику","Гурику","Мадзу","Фудзугу","Сядо"],
        female: ["Мидзурэ","Саюри","Хикари","Рэйна","Фумико","Ханаэ","Айко","Югаса","Тика","Юкико"]
    },
    "Вульфины": {
        male: ["Ромул","Ву́льфрик","Фенрис","Гарм","Локвуд","Скелл","Альдрик","Беовульф","Тёмный Клык","Редмун"],
        female: ["Люппа","Фрейя","Варг","Скади","Хельга","Руна","Астрид","Вальда","Ингрид","Сольвейг"]
    },
    "Лепусиды": {
        male: ["Лелух","Горр","Пуш","Брамбл","Кловер","Тистл","Хоп","Барроу","Флёр","Люпин"],
        female: ["Лола","Хизер","Петаль","Блоссом","Виллоу","Сильва","Флора","Мирта","Роуз","Дейзи"]
    },
    "Тайро": {
        male: ["Архон","Зен","Кайрос","Орион","Никс","Талос","Ликус","Дарий","Север","Ксандр"],
        female: ["Фаэна","Селена","Эос","Ирис","Каллисто","Никта","Талия","Эвридика","Астра","Мира"]
    }
};

const RESEARCHER_PORTRAITS = {
    "Люди": {
        male: [
            "icons/portraits/human_male_1.png",
            "icons/portraits/human_male_2.png",
            "icons/portraits/human_male_3.png",
            "icons/portraits/human_male_4.png",
            "icons/portraits/human_male_5.png"
        ],
        female: [
            "icons/portraits/human_female_1.png",
            "icons/portraits/human_female_2.png",
            "icons/portraits/human_female_3.png",
            "icons/portraits/human_female_4.png",
            "icons/portraits/human_female_5.png"
        ]
    },
    "Оку": {
        male: [
            "icons/portraits/oku_male_1.png",
            "icons/portraits/oku_male_2.png",
            "icons/portraits/oku_male_3.png",
            "icons/portraits/oku_male_4.png",
            "icons/portraits/oku_male_5.png"
        ],
        female: [
            "icons/portraits/oku_female_1.png",
            "icons/portraits/oku_female_2.png",
            "icons/portraits/oku_female_3.png",
            "icons/portraits/oku_female_4.png",
            "icons/portraits/oku_female_5.png"
        ]
    },
    "Дварфы": {
        male: [
            "icons/portraits/dwarf_male_1.png",
            "icons/portraits/dwarf_male_2.png",
            "icons/portraits/dwarf_male_3.png",
            "icons/portraits/dwarf_male_4.png",
            "icons/portraits/dwarf_male_5.png"
        ],
        female: [
            "icons/portraits/dwarf_female_1.png",
            "icons/portraits/dwarf_female_2.png",
            "icons/portraits/dwarf_female_3.png",
            "icons/portraits/dwarf_female_4.png",
            "icons/portraits/dwarf_female_5.png"
        ]
    },
    "Высшие эльфы": {
        male: [
            "icons/portraits/elf_male_1.png",
            "icons/portraits/elf_male_2.png",
            "icons/portraits/elf_male_3.png",
            "icons/portraits/elf_male_4.png",
            "icons/portraits/elf_male_5.png"
        ],
        female: [
            "icons/portraits/elf_female_1.png",
            "icons/portraits/elf_female_2.png",
            "icons/portraits/elf_female_3.png",
            "icons/portraits/elf_female_4.png",
            "icons/portraits/elf_female_5.png"
        ]
    },
    "Гоблины": {
        male: [
            "icons/portraits/goblin_male_1.png",
            "icons/portraits/goblin_male_2.png",
            "icons/portraits/goblin_male_3.png",
            "icons/portraits/goblin_male_4.png",
            "icons/portraits/goblin_male_5.png"
        ],
        female: [
            "icons/portraits/goblin_female_1.png",
            "icons/portraits/goblin_female_2.png",
            "icons/portraits/goblin_female_3.png",
            "icons/portraits/goblin_female_4.png",
            "icons/portraits/goblin_female_5.png"
        ]
    },
    "Вульфины": {
        male: [
            "icons/portraits/wulfin_male_1.png",
            "icons/portraits/wulfin_male_2.png",
            "icons/portraits/wulfin_male_3.png",
            "icons/portraits/wulfin_male_4.png",
            "icons/portraits/wulfin_male_5.png"
        ],
        female: [
            "icons/portraits/wulfin_female_1.png",
            "icons/portraits/wulfin_female_2.png",
            "icons/portraits/wulfin_female_3.png",
            "icons/portraits/wulfin_female_4.png",
            "icons/portraits/wulfin_female_5.png"
        ]
    },
    "Лепусиды": {
        male: [
            "icons/portraits/lepus_male_1.png",
            "icons/portraits/lepus_male_2.png",
            "icons/portraits/lepus_male_3.png",
            "icons/portraits/lepus_male_4.png",
            "icons/portraits/lepus_male_5.png"
        ],
        female: [
            "icons/portraits/lepus_female_1.png",
            "icons/portraits/lepus_female_2.png",
            "icons/portraits/lepus_female_3.png",
            "icons/portraits/lepus_female_4.png",
            "icons/portraits/lepus_female_5.png"
        ]
    },
    "Тайро": {
        male: [
            "icons/portraits/tairo_male_1.png",
            "icons/portraits/tairo_male_2.png",
            "icons/portraits/tairo_male_3.png",
            "icons/portraits/tairo_male_4.png",
            "icons/portraits/tairo_male_5.png"
        ],
        female: [
            "icons/portraits/tairo_female_1.png",
            "icons/portraits/tairo_female_2.png",
            "icons/portraits/tairo_female_3.png",
            "icons/portraits/tairo_female_4.png",
            "icons/portraits/tairo_female_5.png"
        ]
    }
};

// ============================================================
// РАЗДЕЛ 3: ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================

function getRandomName(race, gender) {
    const raceData = RACE_NAMES[race] || RACE_NAMES["Люди"];
    const list = (gender === 'female') ? raceData.female : raceData.male;
    return list[Math.floor(Math.random() * list.length)];
}

function getRandomPortrait(race, gender) {
    const raceData = RESEARCHER_PORTRAITS[race] || RESEARCHER_PORTRAITS["Люди"];
    const list = (gender === 'female') ? raceData.female : raceData.male;
    return list[Math.floor(Math.random() * list.length)];
}

function getTechBonuses() {
    if (typeof window.TECH_DB === 'undefined' || typeof window.researchData === 'undefined') {
        return {};
    }
    const bonuses = {};
    const discountMaps = {
        hireDiscountByUnit: {},
        upkeepDiscountByUnit: {}
    };

    for (let techId of researchData.completedTechs) {
        const tech = window.TECH_DB[techId];
        if (!tech || !tech.effects) continue;
        for (let [key, value] of Object.entries(tech.effects)) {
            if (key === 'hireDiscountByUnit' || key === 'upkeepDiscountByUnit') {
                for (let unitKey in value) {
                    if (!discountMaps[key][unitKey]) discountMaps[key][unitKey] = 0;
                    discountMaps[key][unitKey] += value[unitKey];
                }
            } else {
                bonuses[key] = (bonuses[key] || 0) + value;
            }
        }
    }

    if (typeof window.isAlchemyDistrictActive === 'function' && window.isAlchemyDistrictActive()) {
        bonuses.civilTechCostReduction = (bonuses.civilTechCostReduction || 0) + 10;
    }

    for (let mapKey in discountMaps) {
        if (Object.keys(discountMaps[mapKey]).length > 0) {
            bonuses[mapKey] = discountMaps[mapKey];
        }
    }

    return bonuses;
}

function getGarrisonDefenseBonus(settlementId) {
    if (!researchData.completedTechs.includes('meyan_fortification')) return 0;
    if (settlementId !== 'Meyan') return 0;
    const bonuses = getTechBonuses();
    return bonuses.garrisonDefenseBonus || 0;
}

function applyGarrisonDefenseBonus(army) {
    if (!army || !army.garrison) return 0;
    return getGarrisonDefenseBonus(army.garrison);
}

// ============================================================
// РАЗДЕЛ 4: ОТРИСОВКА ИНТЕРФЕЙСА
// ============================================================

function renderAllTechSlots() {
    if (!window.TECH_DB) return;
    for (let slot of ['military','civil','unique']) renderTechSlot(slot);
}

function renderTechSlot(slot) {
    if (!window.TECH_DB) {
        const container = document.getElementById(slot + 'Researcher');
        if (container) container.innerHTML = '<div style="color:#ff6b6b;">❌ Технологии не загружены</div>';
        return;
    }
    const container = document.getElementById(slot + 'Researcher');
    if (!container) return;
    const researcher = researchData.researchers[slot];
    if (!researcher) {
        container.innerHTML = `
            <div style="text-align:center; padding:20px 0; color:#8a7a5a;">
                Нет исследователя<br>
                <button onclick="openHireResearcherModal('${slot}')" style="background:#3a6b3a; padding:4px 12px; margin-top:8px;">➕ Нанять</button>
                <button onclick="document.getElementById('importSingleFile_${slot}').click()" style="background:#b8860b; padding:4px 12px; margin-top:8px;">📥 Импорт</button>
                <input type="file" id="importSingleFile_${slot}" accept=".json" style="display:none" onchange="importSingleResearcher('${slot}', this.files[0])">
            </div>`;
        return;
    }

    const activeQueue = researchData.techQueue.find(q => q.slot === slot);
    let progressHtml = '';
    if (activeQueue) {
        const tech = window.TECH_DB[activeQueue.techId];
        if (!tech) {
            progressHtml = `<div style="margin-top:8px; color:#ff6b6b;">❌ Технология не найдена (${activeQueue.techId})</div>`;
        } else {
            const percent = Math.min(100, Math.floor((activeQueue.pointsInvested / activeQueue.totalPoints) * 100));
            progressHtml = `
                <div style="margin-top:8px;">
                    <strong>${tech.name}</strong><br>
                    <div style="background:#4a3a2a; border-radius:10px; height:6px; margin:4px 0;">
                        <div style="width:${percent}%; height:100%; background:#ffd966; border-radius:10px;"></div>
                    </div>
                    <span style="font-size:0.7rem;">${activeQueue.pointsInvested}/${activeQueue.totalPoints} (${percent}%)</span>
                </div>`;
        }
    } else {
        progressHtml = '<div style="margin-top:8px; color:#8a7a5a;">Нет задания</div>';
    }

    container.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; margin-bottom:8px;">
            <div style="width:250px; height:250px; border-radius:12px; overflow:hidden; margin:0 auto 8px; background:#2a2418;">
                <img src="${researcher.portrait || 'icons/default_portrait.png'}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'">
            </div>
            <div style="font-weight:bold;">${escapeHtml(researcher.name)}</div>
            <div style="font-size:0.7rem;">${escapeHtml(researcher.race)} | Навык: ${researcher.skill}</div>
        </div>
        ${progressHtml}
        <div style="display:flex; gap:6px; margin-top:8px; justify-content:center;">
            ${activeQueue ? `<button onclick="stopResearch('${slot}')" style="background:#7a2a2a; padding:2px 8px; font-size:0.6rem;">⏹️ Остановить</button>` : ''}
            ${!activeQueue ? `<button onclick="openAssignTechModal('${slot}')" style="background:#3a5a2a; padding:2px 8px; font-size:0.6rem;">📚 Назначить</button>` : ''}
            <button onclick="exportSingleResearcher('${slot}')" style="background:#b8860b; padding:2px 8px; font-size:0.6rem;">📤 Экспорт</button>
            <button onclick="dismissResearcher('${slot}')" style="background:#7a2a2a; padding:2px 8px; font-size:0.6rem;">🗑️ Уволить</button>
            <button onclick="killResearcher('${slot}')" style="background:#7a2a2a; padding:2px 8px; font-size:0.6rem;">🗡️ Убить</button>
        </div>`;
}

function renderAvailableTechs() {
    // === АДАПТАЦИЯ ДЛЯ СТАРЫХ СОХРАНЕНИЙ ===
    if (!researchData.pausedTechs) {
        researchData.pausedTechs = {};
        console.log('🔄 Создан pausedTechs в renderAvailableTechs');
    }
    // ГАРАНТИРУЕМ НАЛИЧИЕ improved_armor
    if (typeof window.TECH_DB === 'undefined') {
        window.TECH_DB = {};
    }
    if (!window.TECH_DB['improved_armor']) {
        window.TECH_DB['improved_armor'] = {
            id: 'improved_armor',
            name: 'Улучшенные доспехи',
            category: 'military',
            points: 120,
            effects: { infantryDefenseBonus: 1 }
        };
    }
    const containers = {
        military: document.getElementById('militaryTechs'),
        civil: document.getElementById('civilTechs'),
        unique: document.getElementById('uniqueTechs')
    };

    for (let key in containers) {
        if (containers[key]) containers[key].innerHTML = '';
    }

    let totalCount = 0;

    const bonuses = getTechBonuses();
    const reduction = bonuses.civilTechCostReduction || 0;
    let originalDB = null;
    if (reduction > 0) {
        originalDB = window.TECH_DB;
        const modifiedDB = {};
        for (let key in originalDB) {
            const tech = originalDB[key];
            modifiedDB[key] = { ...tech };
            if (tech.category === 'civil') {
                modifiedDB[key].points = Math.max(10, tech.points - reduction);
            }
        }
        window.TECH_DB = modifiedDB;
    }

    for (let techId in window.TECH_DB) {
        const tech = window.TECH_DB[techId];
        if (!tech) continue; // защита от undefined
        if (researchData.completedTechs.includes(techId)) continue;
        if (researchData.techQueue.some(q => q.techId === techId)) continue;
        if (tech.faction && tech.faction !== 'all' && tech.faction !== window.currentFaction) continue;

        if (techId === 'meyan_fortification' && window.currentFaction === 'county_meyan') {
            continue;
        }

        const container = containers[tech.category];
        if (!container) continue;

        const card = document.createElement('div');
        card.style.cssText = 'margin:8px 0; padding:8px; background:#2a2418; border-radius:12px;';

        let progressHtml = '';
        if (researchData.pausedTechs[techId]) {
            const saved = researchData.pausedTechs[techId];
            const percent = Math.min(100, Math.floor((saved.pointsInvested / saved.totalPoints) * 100));
            progressHtml = `
                <div style="margin-top:4px; background:#4a3a2a; border-radius:10px; height:6px;">
                    <div style="width:${percent}%; height:100%; background:#ffd966; border-radius:10px;"></div>
                </div>
                <span style="font-size:0.7rem; color:#ffd966;">⏳ Прогресс: ${saved.pointsInvested}/${saved.totalPoints} (${percent}%)</span>
                <span style="font-size:0.7rem; color:#8a7a5a;"> (приостановлено)</span>
            `;
        }

        card.innerHTML = `
            <strong>${tech.name}</strong><br>
            <span style="font-size:0.8rem;">${tech.description}</span><br>
            <span style="font-size:0.8rem;">Требуется очков: ${tech.points}</span>
            ${progressHtml}
            <button onclick="showTechDetail('${techId}')" style="background:#3a5a2a; padding:2px 8px; font-size:0.6rem; margin-left:8px;">📋 Подробнее</button>
        `;
        container.appendChild(card);
        totalCount++;
    }

    if (originalDB) {
        window.TECH_DB = originalDB;
    }

    if (totalCount === 0) {
        const firstContainer = containers.military || containers.civil || containers.unique;
        if (firstContainer) {
            firstContainer.innerHTML = '<div style="color:#8a7a5a;">Все доступные технологии уже изучены или исследуются.</div>';
        }
    }

    if (window.currentFaction === 'county_meyan' && !researchData.completedTechs.includes('meyan_fortification')) {
        const container = containers.military;
        if (container) {
            const tech = window.TECH_DB['meyan_fortification'];
            if (tech) {
                const card = document.createElement('div');
                card.style.cssText = 'margin:8px 0; padding:8px; background:#2a2418; border-radius:12px; border:2px solid #ffd966;';
                card.innerHTML = `
                    <strong style="color:#ffd966;">🔒 ${tech.name}</strong><br>
                    <span style="font-size:0.8rem;">${tech.description}</span><br>
                    <span style="font-size:0.8rem;">Требуется очков: ${tech.points}</span><br>
                    <button onclick="openMeyanTechModal()" style="background:#b8860b; padding:4px 12px; margin-top:8px; border-radius:8px; color:#fff; border:none; cursor:pointer; font-weight:bold;">🔓 Открыть технологию</button>
                `;
                container.insertBefore(card, container.firstChild);
            }
        }
    }
}

function renderActiveResearch() {
    if (!window.TECH_DB) {
        console.warn('TECH_DB не загружен');
        return;
    }
    const container = document.getElementById('activeResearch');
    if (!container) return;
    if (!researchData.techQueue.length) {
        container.innerHTML = '<div style="color:#8a7a5a;">Нет активных исследований.</div>';
        return;
    }
    let html = '';
    for (let item of researchData.techQueue) {
        const tech = window.TECH_DB[item.techId];
        if (!tech) continue;
        const researcher = researchData.researchers[item.slot];
        const percent = Math.min(100, Math.floor((item.pointsInvested / item.totalPoints) * 100));
        html += `<div style="margin:8px 0; padding:8px; background:#2a2418; border-radius:12px;">
            <strong>${tech.name}</strong> – исследователь: ${researcher ? researcher.name : '??'}<br>
            <div style="background:#4a3a2a; border-radius:10px; height:8px; margin:4px 0;">
                <div style="width:${percent}%; height:100%; background:#ffd966; border-radius:10px;"></div>
            </div>
            <span style="font-size:0.8rem;">${item.pointsInvested} / ${item.totalPoints} (${percent}%)</span>
        </div>`;
    }
    container.innerHTML = html;
}

function renderCompletedTechs() {
    if (!window.TECH_DB) {
        console.warn('TECH_DB не загружен');
        return;
    }
    const container = document.getElementById('completedTechs');
    if (!container) return;
    if (!researchData.completedTechs.length) {
        container.innerHTML = '<div style="color:#8a7a5a;">Пока ничего не изучено.</div>';
        return;
    }
    let html = '<ul>';
    for (let techId of researchData.completedTechs) {
        const tech = window.TECH_DB[techId];
        if (!tech) continue;
        html += `<li>✅ ${escapeHtml(tech.name)} 
            <button onclick="removeCompletedTech('${techId}')" style="background:#7a2a2a; padding:2px 8px; font-size:0.6rem; margin-left:8px;">🗑️</button>
            ${tech.exportable ? `<button onclick="exportTech('${techId}')" style="background:#b8860b; padding:2px 8px; font-size:0.6rem; margin-left:4px;">📤</button>` : ''}
        </li>`;
    }
    html += '</ul>';
    container.innerHTML = html;

    const bonuses = getTechBonuses();
    const bonusContainer = document.getElementById('techBonuses');
    if (bonusContainer && Object.keys(bonuses).length) {
        let bonusText = '<strong>Активные бонусы:</strong> ';
        for (let [key, val] of Object.entries(bonuses)) {
            if (key === 'hireDiscountByUnit' || key === 'upkeepDiscountByUnit') {
                const label = (BONUS_NAMES[key] && BONUS_NAMES[key].name) || key;
                for (let unitKey in val) {
                    const unitName = (window.unitDatabase && window.unitDatabase[unitKey]) ? window.unitDatabase[unitKey].name : unitKey;
                    bonusText += `${label} (${unitName}): −${val[unitKey]}% `;
                }
            } else {
                const name = (BONUS_NAMES[key] && BONUS_NAMES[key].name) || key;
                const isPercent = BONUS_NAMES[key] ? BONUS_NAMES[key].isPercent : false;
                bonusText += `${name}: +${val}${isPercent ? '%' : ''} `;
            }
        }
        bonusContainer.innerHTML = bonusText;
    } else if (bonusContainer) {
        bonusContainer.innerHTML = '';
    }
    renderTechEffectsWork();
}

function renderTechEffectsWork() {
    const container = document.getElementById('techEffectsWork');
    if (!container) return;

    const bonuses = getTechBonuses();
    if (Object.keys(bonuses).length === 0) {
        container.innerHTML = '';
        return;
    }

    function getBuildingsConscriptionBonusPercent() {
        let totalPercent = 0;
        const provinces = (typeof getCurrentFactionProvinces === 'function') ? getCurrentFactionProvinces() : [];
        for (let pid of provinces) {
            const prov = provincesData[pid];
            if (!prov) continue;
            for (let s of prov.settlements) {
                for (let b of s.buildings) {
                    if (!b.completed) continue;
                    if (b.special === "conscriptionBonus5") totalPercent += 5;
                    if (b.special === "conscriptionBonus10") totalPercent += 10;
                    if (b.special === "altarVarsis") totalPercent += 7;
                    if (b.special === "sanctuaryTeama") totalPercent += 7;
                    if (b.special === "templeVarsiteya") totalPercent += 10;
                    if (b.special === "pantheon") totalPercent += 15;
                }
            }
        }
        return totalPercent;
    }

    let html = '<table style="width:100%; border-collapse:collapse; border:1px solid #b87c4f;">';
    html += '<tr style="background:#4a3a2a; color:#ffd966;">';
    html += '<th style="padding:8px; border:1px solid #b87c4f;">Эффект</th>';
    html += '<th style="padding:8px; border:1px solid #b87c4f;">База</th>';
    html += '<th style="padding:8px; border:1px solid #b87c4f;">Постройки</th>';
    html += '<th style="padding:8px; border:1px solid #b87c4f;">Технологии</th>';
    html += '<th style="padding:8px; border:1px solid #b87c4f;">Итог</th>';
    html += '</tr>';

    function td(content) {
        return `<td style="padding:8px; border:1px solid #b87c4f; text-align:center;">${content}</td>`;
    }

    if (bonuses.conscriptionBonus) {
        const totalLimit = (typeof getTotalConscriptionLimit === 'function') ? getTotalConscriptionLimit() : 0;
        const baseLimit = (typeof getBaseConscriptionLimit === 'function') ? getBaseConscriptionLimit() : 0;
        const techPercent = bonuses.conscriptionBonus || 0;
        const buildingsPercent = getBuildingsConscriptionBonusPercent();
        const rawBase = Math.floor(baseLimit / (1 + buildingsPercent / 100 + techPercent / 100));
        const fromBuildings = Math.floor(rawBase * buildingsPercent / 100);
        const fromTech = Math.floor(rawBase * techPercent / 100);
        html += '<tr>';
        html += `<td style="padding:8px; border:1px solid #b87c4f;">Призывной резерв</td>`;
        html += td(rawBase);
        html += td(buildingsPercent > 0 ? `+${fromBuildings} (${buildingsPercent}%)` : '—');
        html += td(`+${fromTech} (${techPercent}%)`);
        html += td(`<strong>${totalLimit}</strong>`);
        html += '</tr>';
    }

    if (bonuses.taxBonus) {
        const weeklyIncome = (typeof getWeeklyIncome === 'function') ? getWeeklyIncome() : 0;
        const techPercent = bonuses.taxBonus || 0;
        const rawBase = Math.floor(weeklyIncome / (1 + techPercent / 100));
        const fromTech = weeklyIncome - rawBase;
        html += '<tr>';
        html += `<td style="padding:8px; border:1px solid #b87c4f;">Налоги</td>`;
        html += td(rawBase);
        html += td('—');
        html += td(`+${fromTech} (${techPercent}%)`);
        html += td(`<strong>${weeklyIncome}</strong>`);
        html += '</tr>';
    }

    if (bonuses.tradeBonus) {
        const totalTradePercent = (typeof getTradeBonusPercent === 'function') ? getTradeBonusPercent() : 0;
        const techPercent = bonuses.tradeBonus || 0;
        const buildingsPercent = totalTradePercent - techPercent;
        html += '<tr>';
        html += `<td style="padding:8px; border:1px solid #b87c4f;">Торговая прибыль</td>`;
        html += td('0%');
        html += td(buildingsPercent > 0 ? `+${buildingsPercent}%` : '—');
        html += td(`+${techPercent}%`);
        html += td(`<strong>+${totalTradePercent}%</strong>`);
        html += '</tr>';
    }

    if (bonuses.ironProductionBonus) {
        const baseIron = 20;
        const totalIron = Math.floor(baseIron * (1 + bonuses.ironProductionBonus));
        html += '<tr>';
        html += `<td style="padding:8px; border:1px solid #b87c4f;">Добыча железа</td>`;
        html += td(baseIron);
        html += td('—');
        html += td(`+${totalIron - baseIron} (${Math.round(bonuses.ironProductionBonus * 100)}%)`);
        html += td(`<strong>${totalIron}</strong>`);
        html += '</tr>';
    }

    if (bonuses.buildingStoneDiscount) {
        html += '<tr>';
        html += `<td style="padding:8px; border:1px solid #b87c4f;">Скидка на камень</td>`;
        html += td('0%');
        html += td('—');
        html += td(`${Math.round(bonuses.buildingStoneDiscount * 100)}%`);
        html += td(`<strong>−${Math.round(bonuses.buildingStoneDiscount * 100)}%</strong>`);
        html += '</tr>';
    }

    html += '</table>';
    container.innerHTML = html;
}

// ============================================================
// РАЗДЕЛ 5: УПРАВЛЕНИЕ ИССЛЕДОВАТЕЛЯМИ
// ============================================================

function openHireResearcherModal(slot) {
    if (typeof generateId !== 'function') {
        alert('Ошибка: функция generateId не определена. Проверьте подключение helpers.js.');
        return;
    }
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:10000;display:flex;justify-content:center;align-items:center;';
    let raceOptions = '';
    for (let race in RACE_NAMES) raceOptions += `<option value="${race}">${race}</option>`;
    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:400px;width:90%;color:#e6ddb3;">
            <h3>➕ Нанять исследователя (${SLOT_NAMES[slot] || slot})</h3>
            <label>Раса: <select id="hireRace">${raceOptions}</select></label>
            <label style="margin-left:10px;">Пол: <select id="hireGender"><option value="male">Мужской</option><option value="female">Женский</option></select></label>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:15px;">
                <button id="confirmHireBtn">✅ Нанять</button>
                <button id="cancelHireBtn">Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('cancelHireBtn').onclick = () => modal.remove();
    document.getElementById('confirmHireBtn').onclick = () => {
        const race = document.getElementById('hireRace').value;
        const gender = document.getElementById('hireGender').value;
        const name = getRandomName(race, gender);
        const portrait = getRandomPortrait(race, gender);
        const skill = 30;
        const salary = skill * 15;
        const cost = skill * 50;
        const treasury = typeof getCurrentTreasury === 'function' ? getCurrentTreasury() : window.factionTreasury || 0;
        if (treasury < cost) {
            alert(`Недостаточно средств. Требуется ${cost} эрсов.`);
            return;
        }
        if (typeof setFactionTreasury === 'function') setFactionTreasury(treasury - cost);
        else window.factionTreasury -= cost;
        researchData.researchers[slot] = { id: generateId(), name, race, gender, skill, salary, portrait };
        renderAllTechSlots();
        addGlobalLog(`👨‍🔬 Нанят исследователь "${name}" (${race}) в слот ${slot}.`, 'tech');
        saveAllData();
        modal.remove();
    };
}

function dismissResearcher(slot) {
    if (!researchData.researchers[slot]) return;
    const researcher = researchData.researchers[slot];
    if (confirm(`Уволить исследователя "${researcher.name}"?`)) {
        const qIdx = researchData.techQueue.findIndex(q => q.slot === slot);
        if (qIdx !== -1) researchData.techQueue.splice(qIdx, 1);
        researchData.researchers[slot] = null;
        renderAllTechSlots();
        addGlobalLog(`Исследователь "${researcher.name}" уволен.`, 'tech');
        saveAllData();
    }
}

function killResearcher(slot) {
    if (!researchData.researchers[slot]) return;
    const researcher = researchData.researchers[slot];
    if (confirm(`Убить исследователя "${researcher.name}"?`)) {
        const qIdx = researchData.techQueue.findIndex(q => q.slot === slot);
        if (qIdx !== -1) researchData.techQueue.splice(qIdx, 1);
        researchData.researchers[slot] = null;
        renderAllTechSlots();
        addGlobalLog(`💀 Исследователь "${researcher.name}" убит.`, 'tech');
        saveAllData();
    }
}

function showTechDetail(techId) {
    const tech = window.TECH_DB[techId];
    if (!tech) return;

    const oldModal = document.getElementById('techDetailModal');
    if (oldModal) oldModal.remove();

    let bonusesHtml = '';
    if (tech.effects) {
        for (let [key, val] of Object.entries(tech.effects)) {
            if (key === 'hireDiscountByUnit' || key === 'upkeepDiscountByUnit') {
                const label = (BONUS_NAMES[key] && BONUS_NAMES[key].name) || key;
                for (let unitKey in val) {
                    const unitName = (window.unitDatabase && window.unitDatabase[unitKey]) ? window.unitDatabase[unitKey].name : unitKey;
                    bonusesHtml += `<div style="margin:4px 0;">• <strong>${label} (${unitName}):</strong> −${val[unitKey]}%</div>`;
                }
            } else {
                const name = (BONUS_NAMES[key] && BONUS_NAMES[key].name) || key;
                const isPercent = BONUS_NAMES[key] ? BONUS_NAMES[key].isPercent : false;
                bonusesHtml += `<div style="margin:4px 0;">• <strong>${name}:</strong> +${val}${isPercent ? '%' : ''}</div>`;
            }
        }
    } else {
        bonusesHtml = '<div>Нет бонусов</div>';
    }

    const modal = document.createElement('div');
    modal.id = 'techDetailModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10000;display:flex;justify-content:center;align-items:center;';

    modal.innerHTML = `
        <div style="background:#1f1c14; border:2px solid #ffd966; border-radius:24px; padding:25px; max-width:500px; width:90%; color:#e6ddb3; text-align:center;">
            <h3 style="color:#ffd966; margin-top:0;">${escapeHtml(tech.name)}</h3>
            <p style="margin:15px 0;">${escapeHtml(tech.description)}</p>
            <div style="text-align:left; margin:15px 0;">
                <strong>Бонусы:</strong>
                ${bonusesHtml}
            </div>
            <div style="font-size:0.9rem; color:#8a7a5a;">Требуется очков: ${tech.points}</div>
            <button id="closeTechDetailBtn" style="background:#7a2a2a; padding:8px 20px; margin-top:15px;">Закрыть</button>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('closeTechDetailBtn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

// ============================================================
// РАЗДЕЛ 6: ОСНОВНЫЕ ФУНКЦИИ ИССЛЕДОВАНИЙ
// ============================================================

function openAssignTechModal(slot) {
    const researcher = researchData.researchers[slot];
    if (!researcher) {
        alert('Нет исследователя в этом слоте.');
        return;
    }

    const bonuses = getTechBonuses();
    const reduction = bonuses.civilTechCostReduction || 0;

    const techList = [];
    for (let techId in window.TECH_DB) {
        const tech = window.TECH_DB[techId];
        if (!tech) continue;
        if (tech.category !== slot && slot !== 'unique') continue;
        if (researchData.completedTechs.includes(techId)) continue;
        if (researchData.techQueue.some(q => q.techId === techId)) continue;
        if (tech.faction && tech.faction !== window.currentFaction) continue;
        if (techId === 'meyan_fortification' && !researchData.completedTechs.includes('meyan_fortification')) continue;

        let points = tech.points;
        if (tech.category === 'civil' && reduction > 0) {
            points = Math.max(10, points - reduction);
        }
        techList.push({ id: techId, name: tech.name, points: points });
    }

    if (techList.length === 0) {
        alert('Нет доступных технологий для этого слота.');
        return;
    }

    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:10000;display:flex;justify-content:center;align-items:center;';
    let optionsHtml = techList.map(t => `<option value="${t.id}">${t.name} (${t.points} очков)</option>`).join('');
    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:400px;width:90%;color:#e6ddb3;">
            <h3>Назначить технологию</h3>
            <select id="techSelect" style="width:100%;padding:6px;background:#2a2418;border:1px solid #b87c4f;color:#f0e6d0;border-radius:4px;">${optionsHtml}</select>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:15px;">
                <button id="confirmTechBtn" style="background:#3a6b3a;">✅ Начать</button>
                <button id="cancelTechBtn" style="background:#7a2a2a;">Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('cancelTechBtn').onclick = () => modal.remove();
    document.getElementById('confirmTechBtn').onclick = function() {
        const techId = document.getElementById('techSelect').value;
        const tech = window.TECH_DB[techId];
        if (!tech) return;
        startResearch(techId, slot);
        modal.remove();
    };
}

function startResearch(techId, slot) {
    const tech = window.TECH_DB[techId];
    if (!tech) {
        alert(`Технология "${techId}" не найдена в базе.`);
        return;
    }
    let pointsInvested = 0;
    let totalPoints = tech.points;

    if (researchData.pausedTechs[techId]) {
        const saved = researchData.pausedTechs[techId];
        pointsInvested = saved.pointsInvested;
        totalPoints = saved.totalPoints;
        delete researchData.pausedTechs[techId];
        addGlobalLog(`🔄 Восстановлен прогресс исследования "${tech.name}" (${pointsInvested}/${totalPoints}).`, 'tech');
    }

    researchData.techQueue.push({
        slot: slot,
        techId: techId,
        pointsInvested: pointsInvested,
        totalPoints: totalPoints
    });
    renderAllTechSlots();
    renderAvailableTechs();
    renderActiveResearch();
    addGlobalLog(`🔬 "${tech.name}" назначена исследователю.`, 'tech');
    saveAllData();
}

function stopResearch(slot) {
    const idx = researchData.techQueue.findIndex(q => q.slot === slot);
    if (idx === -1) {
        alert('Нет активного исследования в этом слоте.');
        return;
    }
    const item = researchData.techQueue[idx];
    const tech = window.TECH_DB[item.techId];
    const techName = tech ? tech.name : item.techId;
    if (!confirm(`Остановить исследование "${techName}"? Прогресс будет сохранён.`)) return;

    researchData.pausedTechs[item.techId] = {
        pointsInvested: item.pointsInvested,
        totalPoints: item.totalPoints,
        slot: slot
    };

    researchData.techQueue.splice(idx, 1);
    renderAllTechSlots();
    renderAvailableTechs();
    renderActiveResearch();
    addGlobalLog(`⏸️ Исследование "${techName}" приостановлено. Прогресс сохранён (${item.pointsInvested}/${item.totalPoints}).`, 'tech');
    saveAllData();
}

// ============================================================
// РАЗДЕЛ 7: СПЕЦИАЛЬНАЯ МЕХАНИКА ДЛЯ МЕЙАНА
// ============================================================

function openMeyanTechModal() {
    if (!window.TECH_DB) {
        alert('Технологии ещё не загружены');
        return;
    }
    const tech = window.TECH_DB['meyan_fortification'];
    if (!tech) {
        alert('Технология не найдена');
        return;
    }
    const cost = tech._startCost || { stone: 100, iron: 20, ers: 25000 };

    let totalStone = 0, totalIron = 0, totalErs = 0;
    if (typeof window.getTotalResources === 'function') {
        const res = window.getTotalResources();
        totalStone = res.stone || 0;
        totalIron = res.iron || 0;
        totalErs = res.ers || 0;
    } else if (typeof window.provincesData !== 'undefined') {
        for (let pid in window.provincesData) {
            const r = window.provincesData[pid].resources;
            if (r) {
                totalStone += r.stone || 0;
                totalIron += r.iron || 0;
                totalErs += r.ers || 0;
            }
        }
    }

    const hasResources = (totalStone >= cost.stone && totalIron >= cost.iron && totalErs >= cost.ers);

    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:10001;display:flex;justify-content:center;align-items:center;';
    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:450px;width:90%;color:#e6ddb3;">
            <h3 style="color:#ffd966;">🏗️ ${tech.name}</h3>
            <p style="margin:10px 0;">${tech.description}</p>
            <p style="margin:10px 0; color:#cfc294;">Для открытия технологии требуется:</p>
            <ul style="margin:10px 0; padding-left:20px;">
                <li>🪨 Камень: <strong style="color:${totalStone >= cost.stone ? '#8bc34a' : '#ff6b6b'};">${totalStone} / ${cost.stone}</strong></li>
                <li>⚙️ Железо: <strong style="color:${totalIron >= cost.iron ? '#8bc34a' : '#ff6b6b'};">${totalIron} / ${cost.iron}</strong></li>
                <li>💰 Эрсы: <strong style="color:${totalErs >= cost.ers ? '#8bc34a' : '#ff6b6b'};">${totalErs} / ${cost.ers}</strong></li>
            </ul>
            <p style="font-size:0.8rem; color:#8a7a5a;">Ресурсы будут списаны при открытии технологии.</p>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:15px;">
                ${hasResources ? `<button id="confirmMeyanBtn" style="background:#3a6b3a;">✅ Вложить ресурсы</button>` : `<button disabled style="background:#5e3a22;opacity:0.5;">❌ Недостаточно ресурсов</button>`}
                <button id="cancelMeyanBtn" style="background:#7a2a2a;">Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('cancelMeyanBtn').onclick = () => modal.remove();

    const confirmBtn = document.getElementById('confirmMeyanBtn');
    if (confirmBtn) {
        confirmBtn.onclick = function() {
            let stoneRemaining = cost.stone;
            let ironRemaining = cost.iron;
            let ersRemaining = cost.ers;

            if (typeof window.provincesData !== 'undefined') {
                for (let pid in window.provincesData) {
                    const r = window.provincesData[pid].resources;
                    if (r) {
                        if (stoneRemaining > 0 && r.stone) {
                            const deduct = Math.min(stoneRemaining, r.stone);
                            r.stone -= deduct;
                            stoneRemaining -= deduct;
                        }
                        if (ironRemaining > 0 && r.iron) {
                            const deduct = Math.min(ironRemaining, r.iron);
                            r.iron -= deduct;
                            ironRemaining -= deduct;
                        }
                        if (ersRemaining > 0 && r.ers) {
                            const deduct = Math.min(ersRemaining, r.ers);
                            r.ers -= deduct;
                            ersRemaining -= deduct;
                        }
                        if (stoneRemaining === 0 && ironRemaining === 0 && ersRemaining === 0) break;
                    }
                }
            }

            if (stoneRemaining > 0 || ironRemaining > 0 || ersRemaining > 0) {
                alert('Не удалось списать все ресурсы. Попробуйте ещё раз.');
                modal.remove();
                return;
            }

            if (!researchData.completedTechs.includes('meyan_fortification')) {
                researchData.completedTechs.push('meyan_fortification');
            }

            if (typeof addGlobalLog === 'function') {
                addGlobalLog(`🔓 Технология "${tech.name}" открыта! Списано ${cost.stone} камня, ${cost.iron} железа и ${cost.ers} эрсов.`, 'tech');
            }
            if (typeof saveAllData === 'function') saveAllData();

            if (typeof renderAvailableTechs === 'function') renderAvailableTechs();
            if (typeof renderCompletedTechs === 'function') renderCompletedTechs();
            if (typeof renderTradeableResources === 'function') renderTradeableResources();
            if (typeof refreshPeopleUI === 'function') refreshPeopleUI();
            if (typeof renderProvinceDashboard === 'function') renderProvinceDashboard();

            modal.remove();
        };
    }
}

// ============================================================
// РАЗДЕЛ 8: ОСТАЛЬНЫЕ ФУНКЦИИ (экспорт, импорт, удаление)
// ============================================================

function removeCompletedTech(techId) {
    const index = researchData.completedTechs.indexOf(techId);
    if (index === -1) return;
    const tech = window.TECH_DB[techId];
    const techName = tech ? tech.name : techId;
    if (!confirm(`Удалить технологию "${techName}"? Все её эффекты перестанут действовать.`)) return;

    researchData.completedTechs.splice(index, 1);
    addGlobalLog(`🗑️ Технология "${techName}" удалена. Эффекты отменены.`, 'tech');
    saveAllData();
    if (typeof refreshPeopleUI === 'function') refreshPeopleUI();
    if (typeof refreshBuildingsUI === 'function') refreshBuildingsUI();
    if (typeof renderTradeableResources === 'function') renderTradeableResources();
    if (typeof renderTradeSummary === 'function') renderTradeSummary();
    if (typeof renderArmy === 'function') renderArmy();
    if (typeof renderAvailableUnits === 'function') renderAvailableUnits();
    initTechData();
}

function exportTech(techId) {
    const tech = window.TECH_DB[techId];
    if (!tech) return;
    if (!tech.exportable) {
        alert('Эта технология не может быть экспортирована.');
        return;
    }
    const exportData = {
        id: tech.id,
        name: tech.name,
        category: tech.category,
        description: tech.description,
        points: tech.points,
        effects: tech.effects,
        faction: tech.faction || null,
        exportDate: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `tech_${tech.id}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    addGlobalLog(`📤 Технология "${tech.name}" экспортирована.`, 'tech');
}

function importTech(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const techData = JSON.parse(e.target.result);
            if (!techData.id || !techData.name) {
                alert('Неверный формат файла технологии.');
                return;
            }
            if (researchData.completedTechs.includes(techData.id)) {
                alert('Эта технология уже изучена.');
                return;
            }
            if (!window.TECH_DB[techData.id]) {
                window.TECH_DB[techData.id] = {
                    id: techData.id,
                    name: techData.name,
                    category: techData.category || 'unique',
                    description: techData.description || '',
                    points: techData.points || 100,
                    effects: techData.effects || {},
                    faction: null,
                    exportable: false
                };
            }
            researchData.completedTechs.push(techData.id);
            addGlobalLog(`📥 Технология "${techData.name}" успешно импортирована и изучена!`, 'tech');
            saveAllData();
            initTechData();
        } catch(err) {
            alert('Ошибка чтения файла: ' + err.message);
        }
    };
    reader.readAsText(file);
}

function exportSingleResearcher(slot) {
    const researcher = researchData.researchers[slot];
    if (!researcher) {
        alert('Исследователь отсутствует.');
        return;
    }
    const exportData = {
        id: researcher.id,
        name: researcher.name,
        race: researcher.race,
        gender: researcher.gender,
        skill: researcher.skill,
        salary: researcher.salary,
        portrait: researcher.portrait
    };
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `researcher_${researcher.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    addGlobalLog(`📤 Исследователь "${researcher.name}" экспортирован.`, 'tech');
}

function importSingleResearcher(slot, file) {
    if (!file) return;
    if (researchData.researchers[slot]) {
        alert('Слот занят. Удалите текущего исследователя перед импортом.');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const researcher = JSON.parse(e.target.result);
            if (!researcher.name || !researcher.race) {
                alert('Неверный формат файла исследователя.');
                return;
            }
            researcher.id = generateId();
            researchData.researchers[slot] = researcher;
            renderAllTechSlots();
            addGlobalLog(`📥 Исследователь "${researcher.name}" импортирован в слот ${slot}.`, 'tech');
            saveAllData();
        } catch(err) {
            alert('Ошибка чтения файла: ' + err.message);
        }
    };
    reader.readAsText(file);
    const input = document.getElementById('importSingleFile_' + slot);
    if (input) input.value = '';
}

function toggleAvailableTechs() {
    const content = document.getElementById('availableTechsContent');
    const icon = document.getElementById('availableTechsToggleIcon');
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.textContent = '▼';
    } else {
        content.style.display = 'none';
        icon.textContent = '▶';
    }
}

function applyDefaultFactionTechs() {
    if (typeof researchData === 'undefined') return;
    if (typeof currentFaction === 'undefined') return;

    if (currentFaction === 'county_vogelmark') {
        if (!researchData.completedTechs.includes('vogel_siege_cell')) {
            researchData.completedTechs.push('vogel_siege_cell');
            if (typeof addGlobalLog === 'function') {
                addGlobalLog('🔬 Стартовая технология «Фогельмаркская десантная клеть» изучена автоматически.', 'tech');
            }
        }
    }
}

// ============================================================
// РАЗДЕЛ 9: ИНИЦИАЛИЗАЦИЯ И ОБРАБОТКА ХОДА
// ============================================================

function initTechData() {
    if (typeof window.TECH_DB === 'undefined') window.TECH_DB = {};
    if (!window.TECH_DB['improved_armor']) {
        window.TECH_DB['improved_armor'] = {
            id: 'improved_armor',
            name: 'Улучшенные доспехи',
            category: 'military',
            points: 120,
            effects: { infantryDefenseBonus: 1 }
        };
    }
    // Гарантируем существование researchData
    if (typeof researchData === 'undefined' || !researchData) {
        researchData = { completedTechs: [], techQueue: [], pausedTechs: {}, researchers: { military: null, civil: null, unique: null } };
    }

    // 1. Создаём заглушки для всех технологий, которые есть в сохранении, но отсутствуют в базе
    const allTechIds = new Set();
    // Добавляем все ID из очереди и завершённых
    for (let item of researchData.techQueue) {
        allTechIds.add(item.techId);
    }
    for (let id of researchData.completedTechs) {
        allTechIds.add(id);
    }
    // Для каждого такого ID создаём заглушку, если её нет в TECH_DB
    for (let techId of allTechIds) {
        if (!window.TECH_DB[techId]) {
            window.TECH_DB[techId] = {
                id: techId,
                name: techId.replace(/_/g, ' '),
                category: 'unique',
                description: 'Автоматически созданная заглушка',
                points: 100,
                effects: {}
            };
            console.warn(`⚠️ Добавлена заглушка для технологии ${techId}`);
        }
    }

    // 2. Очищаем очереди от невалидных (на случай, если заглушка не помогла)
    if (researchData.techQueue) {
        researchData.techQueue = researchData.techQueue.filter(q => window.TECH_DB && window.TECH_DB[q.techId]);
    }
    if (researchData.completedTechs) {
        researchData.completedTechs = researchData.completedTechs.filter(id => window.TECH_DB && window.TECH_DB[id]);
    }

    // 3. Рендерим UI
    renderAllTechSlots();
    renderAvailableTechs();
    renderActiveResearch();
    renderCompletedTechs();

    // 4. Привязываем обработчики для импорта исследователей
    const slots = ['military', 'civil', 'unique'];
    for (let slot of slots) {
        const importInput = document.getElementById('importSingleFile_' + slot);
        if (importInput && !importInput._bound) {
            importInput._bound = true;
            importInput.addEventListener('change', function(e) {
                if (e.target.files.length) {
                    importSingleResearcher(slot, e.target.files[0]);
                    e.target.value = '';
                }
            });
        }
    }
    const importTechBtn = document.getElementById('importTechBtn');
    const importTechFile = document.getElementById('importTechFile');
    if (importTechBtn && !importTechBtn._bound) {
        importTechBtn._bound = true;
        importTechBtn.addEventListener('click', () => importTechFile?.click());
    }
    if (importTechFile && !importTechFile._bound) {
        importTechFile._bound = true;
        importTechFile.addEventListener('change', function(e) {
            if (e.target.files.length && typeof importTech === 'function') {
                importTech(e.target.files[0]);
            }
            e.target.value = '';
        });
    }
}

function processResearch() {
    if (!researchData.techQueue.length) return;
    let anyCompleted = false;
    const toRemove = [];
    for (let item of researchData.techQueue) {
        const researcher = researchData.researchers[item.slot];
        if (!researcher) {
            toRemove.push(item);
            continue;
        }
        item.pointsInvested += researcher.skill;
        if (item.pointsInvested >= item.totalPoints) {
            researchData.completedTechs.push(item.techId);
            toRemove.push(item);
            const tech = window.TECH_DB[item.techId];
            addGlobalLog(`✅ Завершено исследование "${tech.name}"!`, 'tech');
            researcher.skill += 5;
            researcher.salary = researcher.skill * 15;
            addGlobalLog(`🔬 Навык исследователя "${researcher.name}" повышен до ${researcher.skill}.`, 'tech');
            anyCompleted = true;
        }
    }
    researchData.techQueue = researchData.techQueue.filter(q => !toRemove.includes(q));

    const techTab = document.getElementById('tab-tech');
    if (techTab && techTab.classList.contains('active')) {
        renderAllTechSlots();
        renderActiveResearch();
        renderCompletedTechs();
    }

    if (anyCompleted) {
        saveAllData();
        if (typeof refreshPeopleUI === 'function') refreshPeopleUI();
        if (typeof refreshBuildingsUI === 'function') refreshBuildingsUI();
        const tradeTab = document.getElementById('tab-trade');
        if (tradeTab && tradeTab.classList.contains('active')) {
            if (typeof renderTradeableResources === 'function') renderTradeableResources();
            if (typeof renderTradeSummary === 'function') renderTradeSummary();
        }
        const armyTab = document.getElementById('tab-army');
        if (armyTab && armyTab.classList.contains('active') && typeof renderArmy === 'function') renderArmy();
    }
}

// ============================================================
// РАЗДЕЛ 10: ЭКСПОРТ В ГЛОБАЛЬНУЮ ОБЛАСТЬ
// ============================================================

window.applyDefaultFactionTechs = applyDefaultFactionTechs;
window.exportTech = exportTech;
window.importTech = importTech;
window.removeCompletedTech = removeCompletedTech;
window.toggleAvailableTechs = toggleAvailableTechs;
window.initTechData = initTechData;
window.processResearch = processResearch;
window.openHireResearcherModal = openHireResearcherModal;
window.openAssignTechModal = openAssignTechModal;
window.stopResearch = stopResearch;
window.showTechDetail = showTechDetail;
window.dismissResearcher = dismissResearcher;
window.killResearcher = killResearcher;
window.getTechBonuses = getTechBonuses;
window.exportSingleResearcher = exportSingleResearcher;
window.importSingleResearcher = importSingleResearcher;
window.openMeyanTechModal = openMeyanTechModal;
window.getGarrisonDefenseBonus = getGarrisonDefenseBonus;
window.applyGarrisonDefenseBonus = applyGarrisonDefenseBonus;

console.log("✅ technologies.js загружен (версия 8.0 – абсолютная совместимость)");