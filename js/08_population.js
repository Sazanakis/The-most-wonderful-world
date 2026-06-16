// ============================================================================
// МОДУЛЬ 08: population.js
// Функции для работы с населением (расы, призыв, налоги, демография)
// ВЕРСИЯ 5.0 — ПОЛНАЯ РЕФАКТОРИНГ, ЭКСПОРТ ФУНКЦИЙ В window ДЛЯ ДОСТУПА ИЗ ДРУГИХ МОДУЛЕЙ
// ============================================================================

// ========== 1. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

/**
 * Возвращает суммарное население расы (все группы)
 */
function getRaceTotal(race) {
    return (race.adultMale || 0) + (race.adultFemale || 0) + (race.children || 0) + (race.elders || 0);
}

/**
 * Проверяет и преобразует старую структуру расы в новую
 */
function migrateRaceIfOld(race) {
    if (typeof race.population !== 'undefined') {
        const total = race.population;
        const adultMale = Math.floor(total * 0.4);
        const adultFemale = Math.floor(total * 0.4);
        const children = Math.floor(total * 0.15);
        const elders = total - adultMale - adultFemale - children;
        delete race.population;
        return {
            name: race.name,
            adultMale: adultMale,
            adultFemale: adultFemale,
            children: children,
            elders: elders,
            birthRate: 2.0,
            deathRate: 1.0
        };
    }
    return race;
}

/**
 * Миграция всех рас в данных провинций при загрузке
 */
function migrateAllRaces() {
    if (typeof provincesData === 'undefined') return;
    for (let provinceId in provincesData) {
        const data = provincesData[provinceId];
        if (data && data.races) {
            data.races = data.races.map(migrateRaceIfOld);
        }
    }
}

// ========== 2. ФУНКЦИИ ПОЛУЧЕНИЯ ДАННЫХ (СУММАРНО ПО ФРАКЦИИ) ==========

function getCurrentFactionProvinces() {
    switch(currentFaction) {
        case "clan_daketa": return ["orochima"];
        case "county_markarn": return ["kaya"];
        case "county_vogelmark": return ["vogel"];
        case "principality_gorski": return ["neolania"];
        case "regency_council": return ["metropolitan_area", "great_shaft"];
        case "lepus_union": return ["leporis"];
        default: return ["orochima"];
    }
}

function getTotalPopulationByRace() {
    const provinces = getCurrentFactionProvinces();
    const total = {};
    for (let provinceId of provinces) {
        const data = provincesData[provinceId];
        if (data && data.races) {
            for (let race of data.races) {
                if (!total[race.name]) total[race.name] = { adultMale: 0, adultFemale: 0, children: 0, elders: 0 };
                total[race.name].adultMale += race.adultMale || 0;
                total[race.name].adultFemale += race.adultFemale || 0;
                total[race.name].children += race.children || 0;
                total[race.name].elders += race.elders || 0;
            }
        }
    }
    return total;
}

function getTotalPopulation() {
    const byRace = getTotalPopulationByRace();
    let sum = 0;
    for (let raceName in byRace) {
        const r = byRace[raceName];
        sum += r.adultMale + r.adultFemale + r.children + r.elders;
    }
    return sum;
}

function getCurrentProvinceRaces() {
    if (currentProvince && provincesData[currentProvince]) {
        const races = provincesData[currentProvince].races;
        if (!races) return [];
        for (let i = 0; i < races.length; i++) {
            races[i] = migrateRaceIfOld(races[i]);
        }
        return races;
    }
    const aggregated = getTotalPopulationByRace();
    return Object.entries(aggregated).map(([name, groups]) => ({
        name,
        adultMale: groups.adultMale,
        adultFemale: groups.adultFemale,
        children: groups.children,
        elders: groups.elders
    }));
}

function getCurrentProvinceArmy() {
    if (!provincesData[currentProvince]) initProvinceData(currentProvince);
    return provincesData[currentProvince]?.army || [];
}

// ========== 3. ПРИЗЫВНОЙ РЕЗЕРВ (ТОЛЬКО ВЗРОСЛЫЕ МУЖЧИНЫ/ЖЕНЩИНЫ) ==========

function getBaseConscriptionLimit() {
    const byRace = getTotalPopulationByRace();
    let base = 0;
    for (let raceName in byRace) {
        base += byRace[raceName].adultMale;
        if (peopleState.settings.womenInArmy) {
            base += byRace[raceName].adultFemale;
        }
    }
    let limit = Math.floor(base * (peopleState.settings.conscriptPercent / 100));
    return limit;
}

function getTotalConscriptionLimit() {
    const base = getBaseConscriptionLimit();
    const bonus = Math.floor(base * (peopleState.mobilization.bonusPercent / 100));
    return base + bonus;
}

function getTaxpayers() {
    const totalPop = getTotalPopulation();
    const poor = Math.floor(totalPop * (peopleState.settings.poorPercent / 100));
    let armyTotal = 0;
    if (typeof armies !== 'undefined') {
        for (let army of armies) {
            if (army.factionId !== currentFaction) continue;
            for (let unit of army.units) armyTotal += unit.count;
        }
    }
    return Math.max(0, totalPop - poor - armyTotal);
}

function getWeeklyIncome() {
    return getTaxpayers() * peopleState.settings.taxRate;
}

function getCurrentTreasury() {
    if (typeof GameState !== 'undefined') return GameState.getTreasury();
    if (typeof armyTreasury !== 'undefined') return armyTreasury;
    if (provincesData[currentProvince]) return provincesData[currentProvince].resources.ers;
    return 0;
}

// ========== 4. ПРИЗЫВНОЙ РЕЗЕРВ ПО РАСАМ (ОБЩИЙ) ==========

function getConscriptionLimitByRace() {
    const byRace = getTotalPopulationByRace();
    const totalLimit = getTotalConscriptionLimit();
    const totalAdults = Object.values(byRace).reduce((sum, r) => sum + r.adultMale + (peopleState.settings.womenInArmy ? r.adultFemale : 0), 0);
    const result = {};
    if (totalAdults === 0) return result;
    for (let [raceName, groups] of Object.entries(byRace)) {
        const adultPool = groups.adultMale + (peopleState.settings.womenInArmy ? groups.adultFemale : 0);
        result[raceName] = Math.floor(totalLimit * (adultPool / totalAdults));
    }
    return result;
}

function getUsedConscriptionByRace() {
    const used = {};
    const races = getCurrentProvinceRaces();
    for (let race of races) used[race.name] = 0;
    if (typeof armies !== 'undefined') {
        for (let army of armies) {
            if (army.factionId !== currentFaction) continue;
            for (let unit of army.units) {
                const unitRace = unit.race;
                if (used[unitRace] !== undefined) used[unitRace] += unit.count;
                else {
                    if (!used['Прочие']) used['Прочие'] = 0;
                    used['Прочие'] += unit.count;
                }
            }
        }
    }
    return used;
}

function getAvailableRaceRecruits(race) {
    const limitByRace = getConscriptionLimitByRace();
    const usedByRace = getUsedConscriptionByRace();
    const mercenaryRaces = ['Дварфы', 'Гоблины'];
    if (mercenaryRaces.includes(race)) return 999999;
    return (limitByRace[race] || 0) - (usedByRace[race] || 0);
}

function getCurrentTotalArmySize() {
    let total = 0;
    for (let army of armies) {
        if (army.factionId !== currentFaction) continue;
        for (let unit of army.units) total += unit.count;
    }
    return total;
}

// ========== 5. ПОЛОВОЗРАСТНЫЕ ЛИМИТЫ ПРИЗЫВА (ПО РАСАМ И ПОЛАМ) ==========

function getCurrentFactionConscriptionLimitByRaceGender() {
    const races = getCurrentProvinceRaces();
    const result = {};
    const totalMaleLimit = Math.floor(getTotalConscriptionLimit() * 
        (races.reduce((s, r) => s + r.adultMale, 0) / 
         (races.reduce((s, r) => s + r.adultMale + (peopleState.settings.womenInArmy ? r.adultFemale : 0), 0) || 1)));
    const totalFemaleLimit = peopleState.settings.womenInArmy ? 
        Math.floor(getTotalConscriptionLimit() * 
            (races.reduce((s, r) => s + r.adultFemale, 0) / 
             (races.reduce((s, r) => s + r.adultMale + r.adultFemale, 0) || 1))) : 0;
    for (let race of races) {
        const maleRatio = race.adultMale / (races.reduce((s, r) => s + r.adultMale, 0) || 1);
        const femaleRatio = race.adultFemale / (races.reduce((s, r) => s + r.adultFemale, 0) || 1);
        result[race.name] = {
            male: Math.floor(totalMaleLimit * maleRatio),
            female: Math.floor(totalFemaleLimit * femaleRatio)
        };
    }
    return result;
}

function getUsedConscriptionByRaceGender() {
    const used = {};
    const races = getCurrentProvinceRaces();
    for (let race of races) {
        used[race.name] = { male: 0, female: 0 };
    }
    for (let army of armies) {
        if (army.factionId !== currentFaction) continue;
        for (let unit of army.units) {
            const race = unit.race;
            if (!used[race]) used[race] = { male: 0, female: 0 };
            used[race].male += (unit.maleCount || 0);
            used[race].female += (unit.femaleCount || 0);
        }
    }
    return used;
}

function getAvailableMaleRaceRecruits(race) {
    const limits = getCurrentFactionConscriptionLimitByRaceGender();
    const used = getUsedConscriptionByRaceGender();
    return (limits[race]?.male || 0) - (used[race]?.male || 0);
}

function getAvailableFemaleRaceRecruits(race) {
    if (!peopleState.settings.womenInArmy) return 0;
    const limits = getCurrentFactionConscriptionLimitByRaceGender();
    const used = getUsedConscriptionByRaceGender();
    return (limits[race]?.female || 0) - (used[race]?.female || 0);
}

// ========== 6. ОБНОВЛЕНИЕ ЛИМИТОВ В РЕАЛЬНОМ ВРЕМЕНИ ==========

function refreshRecruitmentLimits() {
    if (typeof refreshPeopleUI === 'function') refreshPeopleUI();
    else if (typeof renderRaceTable === 'function') renderRaceTable();

    const raceLimitsDisplay = document.getElementById('raceLimitsDisplay');
    if (raceLimitsDisplay) {
        const limits = getCurrentFactionConscriptionLimitByRaceGender();
        const used = getUsedConscriptionByRaceGender();
        let html = '<div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center;">';
        if (Object.keys(limits).length === 0) {
            html = '<div style="text-align: center; color: #8a7a5a;">Нет данных о расах. Добавьте расы на вкладке "Провинция".</div>';
        } else {
            for (let [race, lims] of Object.entries(limits)) {
                const usedMale = used[race]?.male || 0;
                const usedFemale = used[race]?.female || 0;
                const availMale = lims.male - usedMale;
                const availFemale = lims.female - usedFemale;
                const malePercent = lims.male > 0 ? Math.min(100, (usedMale / lims.male) * 100).toFixed(1) : 0;
                const femalePercent = lims.female > 0 ? Math.min(100, (usedFemale / lims.female) * 100).toFixed(1) : 0;

                html += `<div style="background: #2a2418; border-radius: 16px; padding: 8px 15px; min-width: 160px; text-align: center;">
                    <strong>${escapeHtml(race)}</strong><br>
                    👨 ${usedMale}/${lims.male} (${malePercent}%)
                    <div style="width:100px;height:4px;background:#4a3a2a;margin:2px auto;">
                        <div style="width:${malePercent}%;height:100%;background:#ffd966;"></div>
                    </div>
                    👩 ${usedFemale}/${lims.female} (${femalePercent}%)
                    <div style="width:100px;height:4px;background:#4a3a2a;margin:2px auto;">
                        <div style="width:${femalePercent}%;height:100%;background:#ffd966;"></div>
                    </div>
                    ${availMale > 0 ? `✅ Мужчины: ${availMale}` : '❌ Мужчины исчерпаны'}
                    ${peopleState.settings.womenInArmy ? 
                        (availFemale > 0 ? `✅ Женщины: ${availFemale}` : '❌ Женщины исчерпаны') : 
                        '🔒 Реформа не введена'}
                </div>`;
            }
        }
        html += '</div>';
        raceLimitsDisplay.innerHTML = html;
    }

    const raceLimitsDetails = document.getElementById('raceLimitsDetails');
    if (raceLimitsDetails) {
        const limits = getCurrentFactionConscriptionLimitByRaceGender();
        const used = getUsedConscriptionByRaceGender();
        let html = '<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;">';
        for (let [race, lims] of Object.entries(limits)) {
            const usedMale = used[race]?.male || 0;
            const usedFemale = used[race]?.female || 0;
            const availMale = lims.male - usedMale;
            const availFemale = lims.female - usedFemale;
            html += `<div style="background: #2a2418; padding: 8px 12px; border-radius: 12px; min-width: 150px;">
                <strong>${escapeHtml(race)}</strong><br>
                👨 ${usedMale}/${lims.male} (${lims.male > 0 ? Math.round(usedMale/lims.male*100) : 0}%)
                <div style="width:100%;height:3px;background:#4a3a2a;margin:2px 0;">
                    <div style="width:${Math.min(100, (usedMale/lims.male*100)||0)}%;height:100%;background:#ffd966;"></div>
                </div>
                👩 ${usedFemale}/${lims.female} (${lims.female > 0 ? Math.round(usedFemale/lims.female*100) : 0}%)
                <div style="width:100%;height:3px;background:#4a3a2a;margin:2px 0;">
                    <div style="width:${Math.min(100, (usedFemale/lims.female*100)||0)}%;height:100%;background:#ffd966;"></div>
                </div>
                <span style="font-size:0.75rem;">
                    ${availMale > 0 ? `✅ Мужчины: ${availMale}` : '❌ Мужчины исчерпаны'}
                    ${peopleState.settings.womenInArmy ?
                        (availFemale > 0 ? `✅ Женщины: ${availFemale}` : '❌ Женщины исчерпаны') :
                        '🔒 Реформа не введена'}
                </span>
            </div>`;
        }
        html += '</div>';
        raceLimitsDetails.innerHTML = html;
    }

    if (typeof updateUnitRecruitAvailability === 'function') updateUnitRecruitAvailability();
}

// ========== 7. УПРАВЛЕНИЕ РАСАМИ ==========

function addRace() {
    openAddRaceModal();
}

function openAddRaceModal() {
    const oldModal = document.getElementById('addRaceModal');
    if (oldModal) oldModal.remove();

    const predefinedRaces = [
        { name: "Оку", adultMale: 800, adultFemale: 800, children: 300, elders: 100, birthRate: 3.0, deathRate: 1.2, goblinChance: 0.05 },
        { name: "Люди", adultMale: 800, adultFemale: 800, children: 300, elders: 100, birthRate: 2.0, deathRate: 1.0 },
        { name: "Гоблины", adultMale: 600, adultFemale: 600, children: 400, elders: 50, birthRate: 4.0, deathRate: 2.5 },
        { name: "Дварфы", adultMale: 700, adultFemale: 700, children: 250, elders: 100, birthRate: 1.8, deathRate: 0.8, economyBonus: { stone: 0.1, iron: 0.1, buildSpeed: 0.05 } },
        { name: "Высшие эльфы", adultMale: 500, adultFemale: 500, children: 100, elders: 200, birthRate: 0.5, deathRate: 0.3, despair: 0 },
        { name: "Ледяные эльфы", adultMale: 500, adultFemale: 500, children: 150, elders: 100, birthRate: 2.0, deathRate: 1.0 },
        { name: "Вульфины", adultMale: 600, adultFemale: 500, children: 200, elders: 80, birthRate: 1.5, deathRate: 1.5 },
        { name: "Лепусиды (высшие)", adultMale: 700, adultFemale: 800, children: 300, elders: 100, birthRate: 3.5, deathRate: 1.5 },
        { name: "Лепусиды (карликовые)", adultMale: 800, adultFemale: 900, children: 400, elders: 100, birthRate: 3.5, deathRate: 1.8 },
        { name: "Тайро", adultMale: 400, adultFemale: 400, children: 150, elders: 50, birthRate: 2.0, deathRate: 1.0 }
    ];

    const optionsHtml = predefinedRaces.map(r => `<option value="${r.name}">${r.name}</option>`).join('');

    const modal = document.createElement('div');
    modal.id = 'addRaceModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:2000;display:flex;justify-content:center;align-items:center';
    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:450px;width:90%;">
            <h3>➕ ДОБАВЛЕНИЕ РАСЫ</h3>
            <div style="margin:15px 0;">
                <label>📋 Выбрать из известных рас:</label>
                <select id="predefinedRaceSelect" style="width:100%;margin-top:5px;padding:6px;background:#2a241c;border:1px solid #b87c4f;border-radius:20px;color:#f0e6d0;">
                    <option value="">-- Своя раса --</option>
                    ${optionsHtml}
                </select>
            </div>
            <div style="margin:15px 0;">
                <label>🧬 Название расы:</label>
                <input type="text" id="newRaceName" value="Новая раса" style="width:100%;margin-top:5px;padding:6px;background:#2a241c;border:1px solid #b87c4f;border-radius:20px;color:#f0e6d0;">
            </div>
            <div style="margin:15px 0;">
                <label>👥 Общая численность:</label>
                <input type="number" id="newRaceTotal" value="100" min="1" step="1" style="width:100%;margin-top:5px;padding:6px;background:#2a241c;border:1px solid #b87c4f;border-radius:20px;color:#f0e6d0;">
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px;">
                <button id="confirmAddRaceBtn">✅ Добавить</button>
                <button id="cancelAddRaceBtn" style="background:#7a2a2a;">❌ Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const selectEl = document.getElementById('predefinedRaceSelect');
    const nameInput = document.getElementById('newRaceName');
    const totalInput = document.getElementById('newRaceTotal');

    selectEl.addEventListener('change', () => {
        const selectedName = selectEl.value;
        if (selectedName) {
            nameInput.value = selectedName;
            nameInput.readOnly = true;
            const raceDef = predefinedRaces.find(r => r.name === selectedName);
            if (raceDef) {
                const total = (raceDef.adultMale || 0) + (raceDef.adultFemale || 0) + (raceDef.children || 0) + (raceDef.elders || 0);
                totalInput.value = total || 100;
            }
        } else {
            nameInput.readOnly = false;
            nameInput.value = 'Новая раса';
        }
    });

    document.getElementById('confirmAddRaceBtn').onclick = () => {
        let name = nameInput.value.trim();
        const total = parseInt(totalInput.value) || 100;

        if (!name) {
            alert('Введите название расы');
            return;
        }

        const selectedName = selectEl.value;
        let raceTemplate = null;
        if (selectedName && selectedName === name) {
            raceTemplate = predefinedRaces.find(r => r.name === selectedName);
        }

        let adultMale, adultFemale, children, elders;
        if (raceTemplate) {
            const templateTotal = (raceTemplate.adultMale || 0) + (raceTemplate.adultFemale || 0) + (raceTemplate.children || 0) + (raceTemplate.elders || 0) || 1;
            const scale = total / templateTotal;
            adultMale = Math.floor((raceTemplate.adultMale || 0) * scale);
            adultFemale = Math.floor((raceTemplate.adultFemale || 0) * scale);
            children = Math.floor((raceTemplate.children || 0) * scale);
            elders = total - adultMale - adultFemale - children;
        } else {
            adultMale = Math.floor(total * 0.4);
            adultFemale = Math.floor(total * 0.4);
            children = Math.floor(total * 0.15);
            elders = total - adultMale - adultFemale - children;
        }

        const newRace = {
            name: name,
            adultMale: adultMale,
            adultFemale: adultFemale,
            children: children,
            elders: elders,
            birthRate: raceTemplate?.birthRate || 2.0,
            deathRate: raceTemplate?.deathRate || 1.0
        };

        if (raceTemplate?.goblinChance !== undefined) newRace.goblinChance = raceTemplate.goblinChance;
        if (raceTemplate?.despair !== undefined) newRace.despair = raceTemplate.despair;
        if (raceTemplate?.economyBonus) newRace.economyBonus = { ...raceTemplate.economyBonus };

        const races = getCurrentProvinceRaces();
        races.push(newRace);

        refreshPeopleUI();
        if (typeof refreshRecruitmentLimits === 'function') refreshRecruitmentLimits();
        addGlobalLog(`➕ Добавлена раса "${name}" (${total} чел).`, 'general');

        modal.remove();
    };

    document.getElementById('cancelAddRaceBtn').onclick = () => modal.remove();
}

function renderRaceTable() {
    const tbody = document.getElementById('raceTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    const races = getCurrentProvinceRaces();
    for (let i = 0; i < races.length; i++) {
        const race = races[i];
        const total = getRaceTotal(race);
        const row = tbody.insertRow();

        const cellName = row.insertCell(0);
        const nameInput = document.createElement('input');
        nameInput.value = race.name;
        nameInput.style.width = '120px';
        nameInput.addEventListener('change', (e) => {
            race.name = e.target.value.trim();
            refreshPeopleUI();
            if (typeof refreshRecruitmentLimits === 'function') refreshRecruitmentLimits();
        });
        cellName.appendChild(nameInput);

        const cellPop = row.insertCell(1);
        const popSpan = document.createElement('span');
        popSpan.textContent = total.toLocaleString();
        popSpan.style.cursor = 'pointer';
        popSpan.title = 'Нажмите, чтобы редактировать группы';
        popSpan.addEventListener('click', () => {
            const detailDiv = document.createElement('div');
            detailDiv.innerHTML = `
                <label>Мужчины: <input type="number" value="${race.adultMale}" class="edit-adult-male" style="width:70px"></label>
                <label>Женщины: <input type="number" value="${race.adultFemale}" class="edit-adult-female" style="width:70px"></label>
                <label>Дети: <input type="number" value="${race.children}" class="edit-children" style="width:70px"></label>
                <label>Старики: <input type="number" value="${race.elders}" class="edit-elders" style="width:70px"></label>
                <button class="save-groups-btn">Сохранить</button>
            `;
            const existingDetail = row.querySelector('.detail-panel');
            if (existingDetail) existingDetail.remove();
            const detailCell = row.insertCell(3);
            detailCell.className = 'detail-panel';
            detailCell.appendChild(detailDiv);
            detailDiv.querySelector('.save-groups-btn').addEventListener('click', () => {
                race.adultMale = parseInt(detailDiv.querySelector('.edit-adult-male').value) || 0;
                race.adultFemale = parseInt(detailDiv.querySelector('.edit-adult-female').value) || 0;
                race.children = parseInt(detailDiv.querySelector('.edit-children').value) || 0;
                race.elders = parseInt(detailDiv.querySelector('.edit-elders').value) || 0;
                detailCell.remove();
                refreshPeopleUI();
                if (typeof refreshRecruitmentLimits === 'function') refreshRecruitmentLimits();
                addGlobalLog(`Группы расы "${race.name}" обновлены.`, 'general');
            });
        });
        cellPop.appendChild(popSpan);

        const cellRecruit = row.insertCell(2);
        cellRecruit.innerText = (race.adultMale > 100) ? "✅ Да" : "❌ Нет";

        const cellAction = row.insertCell(3);
        const delBtn = document.createElement('button');
        delBtn.innerText = '🗑️';
        delBtn.style.background = '#7a3a2a';
        delBtn.addEventListener('click', () => {
            if (races.length === 1) { addGlobalLog("❌ Нельзя удалить последнюю расу.", 'general'); return; }
            const name = race.name;
            races.splice(i, 1);
            refreshPeopleUI();
            if (typeof refreshRecruitmentLimits === 'function') refreshRecruitmentLimits();
            addGlobalLog(`Раса "${name}" удалена.`, 'general');
        });
        cellAction.appendChild(delBtn);
    }
    const warningDiv = document.getElementById('raceWarning');
    if (warningDiv) {
        const smallRaces = races.filter(r => r.adultMale <= 100 && r.adultMale > 0);
        warningDiv.innerText = smallRaces.length ? `⚠️ Расы со взрослыми мужчинами ≤100 нельзя призывать: ${smallRaces.map(r => r.name).join(', ')}.` : '';
    }
}

// ========== 8. ДЕМОГРАФИЯ (ПРИРОСТ ПО РАСАМ) ==========

function applyDemography() {
    if (peopleState.turnsSinceDemography !== 4) {
        addGlobalLog(`⚠️ Демографию можно применить только после 4 ходов (сделано ${peopleState.turnsSinceDemography}).`, 'general');
        return;
    }

    const before = getTotalPopulation();
    const races = getCurrentProvinceRaces();

    for (let race of races) {
        const births = Math.floor(race.adultFemale * (race.birthRate / 100));
        const deaths = Math.floor((race.adultMale + race.adultFemale + race.elders) * (race.deathRate / 100));
        const newAdultsFromChildren = Math.floor(race.children * 0.05);
        const newEldersFromAdults = Math.floor((race.adultMale + race.adultFemale) * 0.03);

        race.children = Math.max(0, race.children - newAdultsFromChildren + births);
        const half = Math.floor(newAdultsFromChildren / 2);
        race.adultMale = Math.max(0, race.adultMale + half - Math.floor(newEldersFromAdults / 2));
        race.adultFemale = Math.max(0, race.adultFemale + (newAdultsFromChildren - half) - Math.ceil(newEldersFromAdults / 2));
        race.elders = Math.max(0, race.elders + newEldersFromAdults - Math.floor(deaths / 2));

        const remainingDeaths = deaths - Math.floor(deaths / 2);
        if (remainingDeaths > 0) {
            const totalAdults = race.adultMale + race.adultFemale;
            if (totalAdults > 0) {
                const maleDeath = Math.floor(remainingDeaths * (race.adultMale / totalAdults));
                const femaleDeath = remainingDeaths - maleDeath;
                race.adultMale = Math.max(0, race.adultMale - maleDeath);
                race.adultFemale = Math.max(0, race.adultFemale - femaleDeath);
            }
        }

        if (race.name === "Оку" && race.goblinChance && race.goblinChance > 0) {
            const goblinBirths = Math.floor(births * race.goblinChance);
            if (goblinBirths > 0) {
                let goblinRace = races.find(r => r.name === "Гоблины");
                if (!goblinRace) {
                    goblinRace = {
                        name: "Гоблины",
                        adultMale: 0,
                        adultFemale: 0,
                        children: 0,
                        elders: 0,
                        birthRate: 4.0,
                        deathRate: 2.5
                    };
                    races.push(goblinRace);
                }
                goblinRace.children = (goblinRace.children || 0) + goblinBirths;
                addGlobalLog(`👹 Оку-женщины родили ${goblinBirths} гоблинов из-за кровосмешения.`, 'general');
            }
        }

        if (race.name === "Высшие эльфы") {
            if (!race.despair) race.despair = 0;
            const factionId = (typeof PROVINCE_TO_FACTION !== 'undefined') ? PROVINCE_TO_FACTION[currentProvince] : currentFaction;
            let atWar = false;
            if (window.activeDiplomacy && window.activeDiplomacy.wars) {
                atWar = window.activeDiplomacy.wars.some(w => w.attacker === factionId || w.defender === factionId);
            }
            if (atWar) {
                race.despair = Math.min(100, race.despair + 5);
                addGlobalLog(`😔 Высшие эльфы страдают от войны. Отчаяние: ${race.despair}.`, 'general');
            } else {
                race.despair = Math.max(0, race.despair - 2);
            }
            if (race.despair >= 30) {
                const malus = (race.despair - 30) * 0.02;
                race.adultFemale = Math.max(0, race.adultFemale - Math.floor(race.adultFemale * malus * 0.1));
                addGlobalLog(`⚠️ Из-за отчаяния Высшие эльфы теряют желание жить.`, 'general');
            }
            if (race.despair >= 60) {
                const prematureElders = Math.floor((race.adultMale + race.adultFemale) * 0.05);
                race.adultMale = Math.max(0, race.adultMale - Math.floor(prematureElders / 2));
                race.adultFemale = Math.max(0, race.adultFemale - Math.ceil(prematureElders / 2));
                race.elders += prematureElders;
            }
            if (race.despair >= 100) {
                const massElders = Math.floor((race.adultMale + race.adultFemale) * 0.2);
                race.adultMale = Math.max(0, race.adultMale - Math.floor(massElders / 2));
                race.adultFemale = Math.max(0, race.adultFemale - Math.ceil(massElders / 2));
                race.elders += massElders;
                addGlobalLog(`💀 Высшие эльфы в глубоком отчаянии! Многие угасли.`, 'general');
                race.despair = 80;
            }
        }

        if (race.name.startsWith("Лепусиды")) {
            const totalLepus = getRaceTotal(race);
            const overpopulationThreshold = 10000;
            if (totalLepus > overpopulationThreshold) {
                const extraDeaths = Math.floor((totalLepus - overpopulationThreshold) * 0.01);
                race.adultMale = Math.max(0, race.adultMale - Math.floor(extraDeaths * 0.5));
                race.adultFemale = Math.max(0, race.adultFemale - Math.ceil(extraDeaths * 0.5));
                race.children = Math.max(0, race.children - Math.floor(extraDeaths * 0.2));
                addGlobalLog(`🐇 Перенаселение среди лепусидов привело к голоду и болезням. Потери: ${extraDeaths}.`, 'general');
            }
        }
    }

    const after = getTotalPopulation();
    const change = after - before;
    addGlobalLog(`📊 Демография: ${before.toLocaleString()} → ${after.toLocaleString()} (изм. ${change >= 0 ? '+' : ''}${change}).`, 'general');

    peopleState.turnsSinceDemography = 0;
    refreshPeopleUI();
    if (typeof refreshRecruitmentLimits === 'function') refreshRecruitmentLimits();
    saveAllData();
    // === РАЗБЛОКИРОВКА ГЛОБАЛЬНОЙ КНОПКИ ХОДА ===
    const globalTurnBtn = document.getElementById('globalTurnBtn');
    if (globalTurnBtn) {
        globalTurnBtn.disabled = false;
        addGlobalLog(`🔓 Ход снова доступен.`, 'general');
    }	
}

// ========== 9. МОБИЛИЗАЦИЯ ==========

function applyMobilization(percent, maxUses, type) {
    let used = 0;
    if (type === '10') used = peopleState.mobilization.used10;
    else if (type === '25') used = peopleState.mobilization.used25;
    else used = peopleState.mobilization.used40;
    if (used >= maxUses) {
        addGlobalLog(`⚠️ Нельзя использовать +${percent}% более ${maxUses} раз.`, 'general');
        return false;
    }
    peopleState.mobilization.bonusPercent += percent;
    if (type === '10') peopleState.mobilization.used10++;
    else if (type === '25') peopleState.mobilization.used25++;
    else peopleState.mobilization.used40++;
    addGlobalLog(`📢 Мобилизация +${percent}% к резерву. Итоговый бонус: +${peopleState.mobilization.bonusPercent}%.`, 'general');
    refreshPeopleUI();
    if (typeof refreshRecruitmentLimits === 'function') refreshRecruitmentLimits();
    saveAllData();
    return true;
}

function resetMobilization() {
    peopleState.mobilization = { bonusPercent: 0, used10: 0, used25: 0, used40: 0 };
    addGlobalLog("🔄 Бонусы мобилизации сброшены.", 'general');
    refreshPeopleUI();
    if (typeof refreshRecruitmentLimits === 'function') refreshRecruitmentLimits();
    saveAllData();
}

// ========== 10. УПРАВЛЕНИЕ КАЗНОЙ ==========

function applyTreasuryChange() {
    const amount = parseFloat(document.getElementById('treasuryChange')?.value) || 0;
    const note = document.getElementById('treasuryNote')?.value.trim() || "без причины";
    let newTreasury = getCurrentTreasury() + amount;
    if (typeof GameState !== 'undefined') GameState.setTreasury(newTreasury);
    else if (typeof armyTreasury !== 'undefined') armyTreasury = newTreasury;
    else if (provincesData[currentProvince]) provincesData[currentProvince].resources.ers = newTreasury;
    addGlobalLog(`💰 Казна изменена на ${amount} (${note}). Теперь: ${newTreasury.toLocaleString()}.`, 'general');
    if (document.getElementById('treasuryNote')) document.getElementById('treasuryNote').value = '';
    if (document.getElementById('treasuryChange')) document.getElementById('treasuryChange').value = 0;
    refreshPeopleUI();
    updateTreasuryDisplay();
	if (typeof renderProvinceDashboard === 'function') renderProvinceDashboard();
    saveAllData();
}

function resetTreasury() {
    if (confirm("Обнулить казну?")) {
        addGlobalLog(`💰 Казна обнулена. Было: ${getCurrentTreasury().toLocaleString()}.`, 'general');
        if (typeof GameState !== 'undefined') GameState.setTreasury(0);
        else if (typeof armyTreasury !== 'undefined') armyTreasury = 0;
        else if (provincesData[currentProvince]) provincesData[currentProvince].resources.ers = 0;
        refreshPeopleUI();
        updateTreasuryDisplay();
		if (typeof renderProvinceDashboard === 'function') renderProvinceDashboard();
        if (typeof refreshRecruitmentLimits === 'function') refreshRecruitmentLimits();
        saveAllData();
    }
}

function updateTreasuryDisplay() {
    let currentTreasury = getCurrentTreasury();
    const treasuryElements = ['armyTreasury', 'globalTreasury', 'councilTreasury', 'totalTreasury'];
    for (let id of treasuryElements) {
        const el = document.getElementById(id);
        if (el) el.innerText = Math.floor(currentTreasury);
    }
}

// ========== 11. НАЛОГИ И ХОД ==========

function applyPeopleTurn() {
    if (peopleState.turnsSinceDemography >= 4) {
        addGlobalLog("⚠️ Сначала примените демографию.", 'general');
        return;
    }
    const income = getWeeklyIncome();
    let currentTreasury = getCurrentTreasury();
    if (typeof GameState !== 'undefined') GameState.addToTreasury(income);
    else if (typeof armyTreasury !== 'undefined') armyTreasury += income;
    else if (provincesData[currentProvince]) provincesData[currentProvince].resources.ers += income;
    addGlobalLog(`💰 Собрано налогов: ${income.toLocaleString()}. Казна: ${(currentTreasury + income).toLocaleString()}.`, 'general');
    peopleState.turnsSinceDemography++;
    if (typeof advanceWeek === 'function') advanceWeek();
    else if (typeof GameState !== 'undefined') GameState.advanceTime();
    refreshPeopleUI();
    updateTreasuryDisplay();
    saveAllData();
}

// ========== 12. ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ==========

function refreshPeopleUI() {
    const totalPop = getTotalPopulation();
    const baseLimit = getBaseConscriptionLimit();
    const totalLimit = getTotalConscriptionLimit();
    const taxpayers = getTaxpayers();
    const weeklyIncome = getWeeklyIncome();
    let totalArmy = getCurrentTotalArmySize();
    const currentTreasury = getCurrentTreasury();
    setElementText('totalPopulation', totalPop.toLocaleString());
    setElementText('baseConscript', baseLimit.toLocaleString());
    setElementText('totalConscript', totalLimit.toLocaleString());
    setElementText('taxpayers', taxpayers.toLocaleString());
    setElementText('weeklyIncome', weeklyIncome.toLocaleString());
    setElementText('totalArmy', totalArmy.toLocaleString());
    setElementText('conscriptLimitDisplay', totalLimit.toLocaleString());
    setElementText('totalTreasury', currentTreasury.toLocaleString());

    const turnCounter = document.getElementById('turnCounter');
    const applyTurnBtn = document.getElementById('applyTurnBtn');
    const applyDemographyBtn = document.getElementById('applyDemographyBtn');
    if (turnCounter) turnCounter.innerText = `Ходов до демографии: ${peopleState.turnsSinceDemography} / 4`;
    if (applyTurnBtn && applyDemographyBtn) {
        if (peopleState.turnsSinceDemography >= 4) {
            applyTurnBtn.disabled = true;
            applyDemographyBtn.disabled = false;
            if (turnCounter) turnCounter.innerText = `Ходов до демографии: 4 / 4 (примените демографию)`;
        } else {
            applyTurnBtn.disabled = false;
            applyDemographyBtn.disabled = true;
        }
    }

    const mob10 = document.getElementById('mob10Btn');
    const mob25 = document.getElementById('mob25Btn');
    const mob40 = document.getElementById('mob40Btn');
    if (mob10) { mob10.innerText = `+10% (${4 - peopleState.mobilization.used10}/4)`; mob10.disabled = peopleState.mobilization.used10 >= 4; }
    if (mob25) { mob25.innerText = `+25% (${2 - peopleState.mobilization.used25}/2)`; mob25.disabled = peopleState.mobilization.used25 >= 2; }
    if (mob40) { mob40.innerText = `+40% (${1 - peopleState.mobilization.used40}/1)`; mob40.disabled = peopleState.mobilization.used40 >= 1; }

    renderRaceTable();
}

function validateArmy() { return; }

function demobilizeAll() {
    if (confirm("Демобилизовать ВСЕ войска? Они будут удалены из армий.")) {
        if (typeof armies !== 'undefined') {
            for (let army of armies) army.units = [];
            if (typeof saveArmyData === 'function') saveArmyData();
            if (typeof renderArmy === 'function') renderArmy();
        }
        refreshPeopleUI();
        if (typeof refreshRecruitmentLimits === 'function') refreshRecruitmentLimits();
        addGlobalLog("🔱 Проведена полная демобилизация всех войск.", 'general');
    }
}

// Миграция при загрузке скрипта
migrateAllRaces();

function migrateProvinceResources(provinceId) {
    const prov = provincesData[provinceId];
    if (!prov || !prov.resources) return;
    for (let [key, def] of Object.entries(RESOURCES_REGISTRY)) {
        if (!(key in prov.resources)) {
            prov.resources[key] = def.defaultValue;
        }
    }
}

// ========== 13. ЭКСПОРТ ФУНКЦИЙ В ГЛОБАЛЬНУЮ ОБЛАСТЬ (ДЛЯ ДРУГИХ МОДУЛЕЙ) ==========
// Эти функции используются в army_core и других модулях
window.getRaceTotal = getRaceTotal;
window.getTotalPopulation = getTotalPopulation;
window.getBaseConscriptionLimit = getBaseConscriptionLimit;
window.getTotalConscriptionLimit = getTotalConscriptionLimit;
window.getAvailableRaceRecruits = getAvailableRaceRecruits;
window.getUsedConscriptionByRaceGender = getUsedConscriptionByRaceGender;
window.getCurrentFactionConscriptionLimitByRaceGender = getCurrentFactionConscriptionLimitByRaceGender;
window.getAvailableMaleRaceRecruits = getAvailableMaleRaceRecruits;
window.getAvailableFemaleRaceRecruits = getAvailableFemaleRaceRecruits;
window.getCurrentTotalArmySize = getCurrentTotalArmySize;
window.refreshRecruitmentLimits = refreshRecruitmentLimits;
window.applyDemography = applyDemography;
window.applyPeopleTurn = applyPeopleTurn;
window.refreshPeopleUI = refreshPeopleUI;
window.demobilizeAll = demobilizeAll;
window.applyMobilization = applyMobilization;
window.resetMobilization = resetMobilization;
window.applyTreasuryChange = applyTreasuryChange;
window.resetTreasury = resetTreasury;
window.updateTreasuryDisplay = updateTreasuryDisplay;
window.getCurrentTreasury = getCurrentTreasury;
window.getWeeklyIncome = getWeeklyIncome;
window.getTaxpayers = getTaxpayers;
window.addRace = addRace;
window.renderRaceTable = renderRaceTable;

// ========== 14. МОДАЛЬНОЕ ОКНО ДЛЯ ДЕМОГРАФИИ ==========
function showDemographyRequiredModal() {
    // Удаляем старое окно, если есть
    const oldModal = document.getElementById('demographyModal');
    if (oldModal) oldModal.remove();

    const modal = document.createElement('div');
    modal.id = 'demographyModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:20000;display:flex;justify-content:center;align-items:center';
    modal.innerHTML = `
        <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:30px;max-width:450px;width:90%;text-align:center;">
            <h2 style="color:#ffd966;margin-top:0;">⚠️ ДЕМОГРАФИЯ ТРЕБУЕТ ВНИМАНИЯ</h2>
            <p style="margin:20px 0;">Прошло 4 хода. Необходимо применить демографические изменения, прежде чем продолжать.</p>
            <p style="margin-bottom:20px;"><strong>Кнопка «ПРИМЕНИТЬ ХОД» будет заблокирована до применения демографии.</strong></p>
            <button id="applyDemographyFromModalBtn" style="background:#3a6b3a;padding:10px 20px;font-size:1.1rem;">📅 ПРИМЕНИТЬ ДЕМОГРАФИЮ</button>
            <button id="closeDemographyModalBtn" style="background:#7a2a2a;margin-top:15px;padding:8px 16px;">❌ Закрыть</button>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('applyDemographyFromModalBtn').onclick = () => {
        if (typeof applyDemography === 'function') {
            applyDemography();
            modal.remove();
            // После применения демографии разблокируем глобальную кнопку хода (если она была заблокирована)
            const globalTurnBtn = document.getElementById('globalTurnBtn');
            if (globalTurnBtn) globalTurnBtn.disabled = false;
            addGlobalLog("✅ Демография применена через модальное окно. Ход снова доступен.", 'general');
        } else {
            console.error("applyDemography не определена");
        }
    };
    document.getElementById('closeDemographyModalBtn').onclick = () => modal.remove();
}

// Добавляем экспорт функции для использования в других модулях
window.showDemographyRequiredModal = showDemographyRequiredModal;

console.log("✅ 08_population.js полностью загружен — версия 5.0 (экспорт функций в window)");