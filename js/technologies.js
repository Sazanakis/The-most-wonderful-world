// ============================================================================
// МОДУЛЬ: technologies.js (версия 5.0 – корректные подписи бонусов)
// ============================================================================
// Загружено на гитхаб 18.07.2026
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

const TECH_DB = {
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
	//!Технологии для Графства Фогельмарк
	"vogel_statue": {
		id: "vogel_statue",
		name: "Реставрация Статуи Варситэи",
		category: "unique",
		faction: "county_vogelmark",
		description: "Восстановление древней святыни привлекает паломников и воодушевляет защитниц веры.",
		points: 200,
		effects: { 
			taxBonus: 5,
			hireDiscountByUnit: { "Боевые монахини Варситэи": 10 }
		}
	},
	"vogel_siege_cell": {
		id: "vogel_siege_cell",
		name: "Фогельмаркская десантная клеть",
		category: "military",
		description: "Позволяет перебрасывать небольшие отряды пехоты через стены и линии обороны с помощью плетёных клетей, транспортируемых орланами или вивернами.",
		points: 60,
		effects: {}   // ← обязательно добавьте
	},
	"dionia_cavalry_school": {
		id: "dionia_cavalry_school",
		name: "Кавалерийский отбор",
		category: "unique",
		faction: "county_dionia",
		description: "Специальный отбор среди талантливых всадников и вольных рыцарей, позволяющий увеличить численность Чёрной гвардии.",
		points: 90,
		effects: { 
			blackGuardLimitIncrease: 1 
		}
	}
};

const BONUS_NAMES = {
    conscriptionBonus: { name: "Призывной резерв", isPercent: true },
    infantryDefenseBonus: { name: "Защита пехоты", isPercent: false },
    buildingStoneDiscount: { name: "Скидка на камень", isPercent: false },
    taxBonus: { name: "Доход от налогов", isPercent: true },
    tradeBonus: { name: "Торговая прибыль", isPercent: true },
    ironProductionBonus: { name: "Добыча железа", isPercent: true },
    globalMoraleBonus: { name: "Мораль всех войск", isPercent: false },
	nunHireDiscount: { name: "Скидка на найм монахинь", isPercent: true },
	hireDiscountByUnit: { name: "Скидка на найм", isPercent: true },
	upkeepDiscountByUnit: { name: "Скидка на содержание", isPercent: true },
	blackGuardLimitIncrease: { name: "Лимит Чёрной гвардии", isPercent: false }
};

const SLOT_NAMES = {
    military: "Военный",
    civil: "Гражданский",
    unique: "Уникальный"
};

window.researchData = window.researchData || {
    researchers: { military: null, civil: null, unique: null },
    completedTechs: [],
    techQueue: []
};

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
    const bonuses = {};
    const discountMaps = {
        hireDiscountByUnit: {},
        upkeepDiscountByUnit: {}   // на будущее
    };

    for (let techId of researchData.completedTechs) {
        const tech = TECH_DB[techId];
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

    // Переносим собранные скидки в общий результат
    for (let mapKey in discountMaps) {
        if (Object.keys(discountMaps[mapKey]).length > 0) {
            bonuses[mapKey] = discountMaps[mapKey];
        }
    }

    return bonuses;
}

// ========== ОТРИСОВКА ==========
function renderAllTechSlots() {
    for (let slot of ['military','civil','unique']) renderTechSlot(slot);
}

function renderTechSlot(slot) {
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
        const tech = TECH_DB[activeQueue.techId];
        const percent = Math.min(100, Math.floor((activeQueue.pointsInvested / activeQueue.totalPoints) * 100));
        progressHtml = `
            <div style="margin-top:8px;">
                <strong>${tech.name}</strong><br>
                <div style="background:#4a3a2a; border-radius:10px; height:6px; margin:4px 0;">
                    <div style="width:${percent}%; height:100%; background:#ffd966; border-radius:10px;"></div>
                </div>
                <span style="font-size:0.7rem;">${activeQueue.pointsInvested}/${activeQueue.totalPoints} (${percent}%)</span>
            </div>`;
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
    const containers = {
        military: document.getElementById('militaryTechs'),
        civil: document.getElementById('civilTechs'),
        unique: document.getElementById('uniqueTechs')
    };

    // Очищаем все три колонки
    for (let key in containers) {
        if (containers[key]) containers[key].innerHTML = '';
    }

    let totalCount = 0;

    for (let techId in TECH_DB) {
        const tech = TECH_DB[techId];
        // Пропускаем уже изученные или исследуемые
        if (researchData.completedTechs.includes(techId)) continue;
        if (researchData.techQueue.some(q => q.techId === techId)) continue;
        // Проверка фракции (если поле faction указано)
        if (tech.faction && tech.faction !== 'all' && tech.faction !== window.currentFaction) continue;

        const container = containers[tech.category];
        if (!container) continue; // если категория не military/civil/unique

        const card = document.createElement('div');
        card.style.cssText = 'margin:8px 0; padding:8px; background:#2a2418; border-radius:12px;';
        card.innerHTML = `
            <strong>${tech.name}</strong><br>
            <span style="font-size:0.8rem;">${tech.description}</span><br>
            <span style="font-size:0.8rem;">Требуется очков: ${tech.points}</span>
            <button onclick="showTechDetail('${techId}')" style="background:#3a5a2a; padding:2px 8px; font-size:0.6rem; margin-left:8px;">📋 Подробнее</button>
        `;
        container.appendChild(card);
        totalCount++;
    }

    // Если ни одной технологии нет во всех колонках, показываем сообщение в первой колонке
    if (totalCount === 0) {
        const firstContainer = containers.military || containers.civil || containers.unique;
        if (firstContainer) {
            firstContainer.innerHTML = '<div style="color:#8a7a5a;">Все доступные технологии уже изучены или исследуются.</div>';
        }
    }
}

function renderActiveResearch() {
    const container = document.getElementById('activeResearch');
    if (!container) return;
    if (!researchData.techQueue.length) {
        container.innerHTML = '<div style="color:#8a7a5a;">Нет активных исследований.</div>';
        return;
    }
    let html = '';
    for (let item of researchData.techQueue) {
        const tech = TECH_DB[item.techId];
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
    const container = document.getElementById('completedTechs');
    if (!container) return;
    if (!researchData.completedTechs.length) {
        container.innerHTML = '<div style="color:#8a7a5a;">Пока ничего не изучено.</div>';
        return;
    }
    let html = '<ul>';
    for (let techId of researchData.completedTechs) {
        const tech = TECH_DB[techId];
        html += `<li>✅ ${escapeHtml(tech.name)} 
            <button onclick="removeCompletedTech('${techId}')" style="background:#7a2a2a; padding:2px 8px; font-size:0.6rem; margin-left:8px;">🗑️</button>
            ${TECH_DB[techId]?.exportable ? `<button onclick="exportTech('${techId}')" style="background:#b8860b; padding:2px 8px; font-size:0.6rem; margin-left:4px;">📤</button>` : ''}
        </li>`;
    }
    html += '</ul>';
    container.innerHTML = html;

    const bonuses = getTechBonuses();
    const bonusContainer = document.getElementById('techBonuses');   // ← обязательно добавить
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
        bonusContainer.innerHTML = '';   // очищаем, если бонусов нет
    }
    renderTechEffectsWork();
}

function showTechDetail(techId) {
    const tech = TECH_DB[techId];
    if (!tech) return;

    const oldModal = document.getElementById('techDetailModal');
    if (oldModal) oldModal.remove();

    let bonusesHtml = '';
    if (tech.effects) {
        for (let [key, val] of Object.entries(tech.effects)) {
            if (key === 'hireDiscountByUnit' || key === 'upkeepDiscountByUnit') {
                // val — объект { "юнит": скидка }
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

// ========== УПРАВЛЕНИЕ ИССЛЕДОВАТЕЛЯМИ ==========
function openHireResearcherModal(slot) {
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
        const skill = 30; // фиксированный навык
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

function stopResearch(slot) {
    if (confirm('Остановить текущее исследование? Прогресс будет потерян.')) {
        const idx = researchData.techQueue.findIndex(q => q.slot === slot);
        if (idx !== -1) researchData.techQueue.splice(idx, 1);
        renderAllTechSlots();
        renderAvailableTechs();
        renderActiveResearch();
        addGlobalLog(`Исследование остановлено.`, 'tech');
        saveAllData();
    }
}

function openAssignTechModal(slot) {
    const researcher = researchData.researchers[slot];
    if (!researcher) return;
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:10000;display:flex;justify-content:center;align-items:center;';
    let optionsHtml = '';
    for (let techId in TECH_DB) {
        const tech = TECH_DB[techId];
        if (tech.category !== slot && slot !== 'unique') continue;
        if (researchData.completedTechs.includes(techId)) continue;
        if (researchData.techQueue.some(q => q.techId === techId)) continue;
        optionsHtml += `<option value="${techId}">${tech.name} (${tech.points} очков)</option>`;
    }
    if (!optionsHtml) {
        alert('Нет доступных технологий для этого слота.');
        return;
    }
    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:400px;width:90%;color:#e6ddb3;">
            <h3>Назначить технологию</h3>
            <select id="techSelect">${optionsHtml}</select>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:15px;">
                <button id="confirmTechBtn">✅ Начать</button>
                <button id="cancelTechBtn">Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('confirmTechBtn').onclick = () => {
        const techId = document.getElementById('techSelect').value;
        const tech = TECH_DB[techId];
        researchData.techQueue.push({ slot, techId, pointsInvested: 0, totalPoints: tech.points });
        renderAllTechSlots();
        renderAvailableTechs();
        renderActiveResearch();
        addGlobalLog(`🔬 "${tech.name}" назначена исследователю "${researcher.name}".`, 'tech');
        saveAllData();
        modal.remove();
    };
    document.getElementById('cancelTechBtn').onclick = () => modal.remove();
}

// ========== ОБРАБОТКА ХОДА ==========
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
            const tech = TECH_DB[item.techId];
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
		renderCompletedTechs();   // ← добавить эту строку
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

function initTechData() {
    renderAllTechSlots();
    renderAvailableTechs();
    renderActiveResearch();
    renderCompletedTechs();

    // Привязка кнопок импорта для каждого слота (они создаются динамически в renderTechSlot)
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
	// Привязка кнопки импорта технологии
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

function exportSingleResearcher(slot) {
    const researcher = researchData.researchers[slot];
    if (!researcher) {
        alert('Исследователь отсутствует.');
        return;
    }
    // Убираем текущий проект (он привязан к фракции)
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
    // Проверяем, что слот свободен
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
            // Присваиваем новый id и добавляем в слот
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
    // Очищаем input
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

function renderTechEffectsWork() {
    const container = document.getElementById('techEffectsWork');
    if (!container) return;

    const bonuses = getTechBonuses();
    if (Object.keys(bonuses).length === 0) {
        container.innerHTML = '';
        return;
    }

    // Вспомогательная функция для получения бонуса построек (религия + казармы)
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

    // Призывной резерв
    if (bonuses.conscriptionBonus) {
        const totalLimit = (typeof getTotalConscriptionLimit === 'function') ? getTotalConscriptionLimit() : 0;
        const baseLimit = (typeof getBaseConscriptionLimit === 'function') ? getBaseConscriptionLimit() : 0; // уже включает постройки и технологии
        const techPercent = bonuses.conscriptionBonus || 0;
        const buildingsPercent = getBuildingsConscriptionBonusPercent();

        // Вычисляем чистую базу (взрослое население * процент призыва)
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

    // Доход от налогов (здесь нет построек, только технологический бонус)
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

    // Торговая прибыль (бонус от рынков и технологий)
    if (bonuses.tradeBonus) {
        const totalTradePercent = (typeof getTradeBonusPercent === 'function') ? getTradeBonusPercent() : 0;
        const techPercent = bonuses.tradeBonus || 0;
        const buildingsPercent = totalTradePercent - techPercent; // остальное от рынков

        html += '<tr>';
        html += `<td style="padding:8px; border:1px solid #b87c4f;">Торговая прибыль</td>`;
        html += td('0%');
        html += td(buildingsPercent > 0 ? `+${buildingsPercent}%` : '—');
        html += td(`+${techPercent}%`);
        html += td(`<strong>+${totalTradePercent}%</strong>`);
        html += '</tr>';
    }

    // Добыча железа (бонус только от технологий, постройки дают фиксированный доход, но для простоты показываем как %)
    if (bonuses.ironProductionBonus) {
        // Условная база добычи без бонусов – можно взять 20 (как в шахте)
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

    // Скидка на камень (от фортификаций)
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
function removeCompletedTech(techId) {
    const index = researchData.completedTechs.indexOf(techId);
    if (index === -1) return;
    if (!confirm(`Удалить технологию "${TECH_DB[techId]?.name || techId}"? Все её эффекты перестанут действовать.`)) return;

    researchData.completedTechs.splice(index, 1);
    addGlobalLog(`🗑️ Технология "${TECH_DB[techId]?.name || techId}" удалена. Эффекты отменены.`, 'tech');
    saveAllData();
    // Обновляем все интерфейсы, где могли применяться бонусы
    if (typeof refreshPeopleUI === 'function') refreshPeopleUI();
    if (typeof refreshBuildingsUI === 'function') refreshBuildingsUI();
    if (typeof renderTradeableResources === 'function') renderTradeableResources();
    if (typeof renderTradeSummary === 'function') renderTradeSummary();
    if (typeof renderArmy === 'function') renderArmy();
    if (typeof renderAvailableUnits === 'function') renderAvailableUnits();
    initTechData(); // перерисовываем вкладку технологий
}
function exportTech(techId) {
    const tech = TECH_DB[techId];
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
            // Если технология уже изучена, ничего не делаем
            if (researchData.completedTechs.includes(techData.id)) {
                alert('Эта технология уже изучена.');
                return;
            }
            // Если технологии нет в TECH_DB, добавляем её (для совместимости)
            if (!TECH_DB[techData.id]) {
                TECH_DB[techData.id] = {
                    id: techData.id,
                    name: techData.name,
                    category: techData.category || 'unique',
                    description: techData.description || '',
                    points: techData.points || 100,
                    effects: techData.effects || {},
                    faction: null,  // после импорта доступна всем
                    exportable: false
                };
            }
            // Добавляем в изученные
            researchData.completedTechs.push(techData.id);
            addGlobalLog(`📥 Технология "${techData.name}" успешно импортирована и изучена!`, 'tech');
            saveAllData();
            initTechData();  // обновляем вкладку
        } catch(err) {
            alert('Ошибка чтения файла: ' + err.message);
        }
    };
    reader.readAsText(file);
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

// Экспорт
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