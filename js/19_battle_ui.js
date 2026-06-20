// ============================================================================
// МОДУЛЬ 19: battle_ui.js
// Интерфейс для проведения битв (ролевой режим)
// ВЕРСИЯ 1.0 – ЗАГРУЗКА АРМИЙ, РЕДАКТИРОВАНИЕ ПОТЕРЬ, ЭКСПОРТ
// ============================================================================

// Храним загруженные армии для левой и правой панели
let battleArmies = {
    left: null,   // { army: {...}, fileName: "..." }
    right: null
};

// ========== 1. ЗАГРУЗКА АРМИИ ИЗ JSON ==========
function loadArmyForBattle(side, file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            // Проверяем, что это данные армии
            if (!data.army || !data.army.units) {
                alert("Неверный формат файла. Это не экспорт армии.");
                return;
            }
            // Сохраняем
            battleArmies[side] = {
                army: data.army,
                fileName: file.name
            };
            // Отрисовываем панель
            renderBattleUnits(side);
        } catch(err) {
            alert("Ошибка чтения файла: " + err.message);
        }
    };
    reader.readAsText(file);
}

// ========== 2. ОТРИСОВКА ПАНЕЛИ АРМИИ ==========
function renderBattleUnits(side) {
    const container = document.getElementById(side === 'left' ? 'leftArmyUnits' : 'rightArmyUnits');
    const data = battleArmies[side];
    if (!data || !data.army) {
        container.innerHTML = '<div style="color:#8a7a5a; padding:20px;">Армия не загружена</div>';
        return;
    }
    const army = data.army;
    const factionName = (typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[army.factionId]) 
        ? FACTION_NAMES[army.factionId] 
        : army.factionId || 'Неизвестная фракция';

    let html = `<div style="background:#2a2418; padding:10px; border-radius:12px; margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <div><strong>${escapeHtml(army.name)}</strong></div>
            <div style="font-size:0.8rem; color:#cfc294;">${factionName}</div>
        </div>
        <div style="font-size:0.7rem; color:#8a7a5a;">Командир: ${escapeHtml(army.commander || 'Не назначен')}</div>
        <div style="font-size:0.7rem; color:#8a7a5a;">Основана: ${army.foundationDate || 'неизвестно'}</div>
        ${army.motto ? `<div style="font-style:italic; color:#ffd966;">«${escapeHtml(army.motto)}»</div>` : ''}
    </div>`;

    // Таблица отрядов
    html += `<table style="width:100%; border-collapse: collapse; font-size:0.8rem;">
        <thead>
            <tr style="background:#1f1c14;">
                <th style="padding:4px;">Отряд</th>
                <th style="padding:4px;">Тип</th>
                <th style="padding:4px;">База</th>
                <th style="padding:4px;">Текущая</th>
                <th style="padding:4px;">Убито</th>
                <th style="padding:4px;">Ранено</th>
            </tr>
        </thead>
        <tbody>`;

    for (let unit of army.units) {
        // Вычисляем текущую численность: baseCount - killed - wounded
        const baseCount = unit.baseCount || unit.count; // fallback для старых сохранений
        const killed = unit.killed || 0;
        const wounded = unit.wounded || 0;
        const current = Math.max(0, baseCount - killed - wounded);
        // Обновляем unit.count для согласованности
        unit.count = current;
        unit.baseCount = baseCount;
        unit.killed = killed;
        unit.wounded = wounded;

        // Генерируем уникальный ID для полей ввода (используем side + unit.id)
        const unitId = unit.id || 'unit_' + Math.random().toString(36).substr(2, 9);
        unit._tempId = unitId;

        html += `<tr style="border-bottom:1px solid #b87c4f;">
            <td style="padding:4px;">${escapeHtml(unit.name)}</td>
            <td style="padding:4px;">${escapeHtml(unit.troopType || '')}</td>
            <td style="padding:4px; text-align:center;">${baseCount}</td>
            <td style="padding:4px; text-align:center; font-weight:bold;">${current}</td>
            <td style="padding:4px; text-align:center;">
                <input type="number" min="0" max="${baseCount}" value="${killed}" 
                    style="width:60px; background:#2a241c; border:1px solid #b87c4f; color:#f0e6d0; padding:2px; border-radius:12px;"
                    onchange="updateBattleLoss('${side}', '${unitId}', 'killed', this.value)">
            </td>
            <td style="padding:4px; text-align:center;">
                <input type="number" min="0" max="${baseCount - killed}" value="${wounded}" 
                    style="width:60px; background:#2a241c; border:1px solid #b87c4f; color:#f0e6d0; padding:2px; border-radius:12px;"
                    onchange="updateBattleLoss('${side}', '${unitId}', 'wounded', this.value)">
            </td>
        </tr>`;
    }

    html += `</tbody></table>`;
    html += `<div style="margin-top:10px; font-size:0.7rem; color:#8a7a5a;">📁 Файл: ${escapeHtml(data.fileName)}</div>`;

    container.innerHTML = html;
}

// ========== 3. ОБНОВЛЕНИЕ ПОТЕРЬ ==========
function updateBattleLoss(side, unitId, field, value) {
    const data = battleArmies[side];
    if (!data || !data.army) return;
    const army = data.army;
    const unit = army.units.find(u => (u._tempId === unitId) || (u.id === unitId));
    if (!unit) return;

    // Проверяем, что значение число и не отрицательное
    let num = parseInt(value) || 0;
    if (num < 0) num = 0;
    // Для раненых – не больше, чем baseCount - killed
    if (field === 'wounded') {
        const killed = unit.killed || 0;
        const base = unit.baseCount || unit.count;
        if (num > base - killed) num = base - killed;
    }
    // Для убитых – не больше baseCount - wounded
    if (field === 'killed') {
        const wounded = unit.wounded || 0;
        const base = unit.baseCount || unit.count;
        if (num > base - wounded) num = base - wounded;
    }

    unit[field] = num;
    // Пересчитываем текущую численность
    const baseCount = unit.baseCount || unit.count;
    unit.count = Math.max(0, baseCount - (unit.killed || 0) - (unit.wounded || 0));
    // Перерисовываем панель
    renderBattleUnits(side);
}

// ========== 4. ЭКСПОРТ РЕЗУЛЬТАТОВ БИТВЫ ==========
function exportBattleResult() {
    const leftData = battleArmies.left;
    const rightData = battleArmies.right;
    if (!leftData || !rightData) {
        alert("Загрузите обе армии!");
        return;
    }

    // Получаем результат и победителя
    const resultSelect = document.getElementById('battleResultSelect');
    const winnerSelect = document.getElementById('winnerArmySelect');
    const enemyKilled = parseInt(document.getElementById('enemyKilledInput')?.value) || 0;
    const result = resultSelect ? resultSelect.value : 'victory';
    const winnerSide = winnerSelect ? winnerSelect.value : 'left';

    // Определяем, какая армия победила
    let winnerArmy = null;
    let loserArmy = null;
    if (result === 'victory') {
        winnerArmy = winnerSide === 'left' ? leftData.army : rightData.army;
        loserArmy = winnerSide === 'left' ? rightData.army : leftData.army;
    } else if (result === 'defeat') {
        // Если проиграли, то победитель – противоположная сторона
        // Но мы даём выбор, поэтому используем winnerSide как победителя
        winnerArmy = winnerSide === 'left' ? leftData.army : rightData.army;
        loserArmy = winnerSide === 'left' ? rightData.army : leftData.army;
    } else {
        // Ничья
        winnerArmy = null;
        loserArmy = null;
    }

    // Формируем данные для экспорта (две армии)
    const exportData = {
        battleDate: getCurrentDateString(),
        result: result,
        winner: winnerArmy ? { name: winnerArmy.name, faction: winnerArmy.factionId } : null,
        armies: {
            left: leftData.army,
            right: rightData.army
        }
    };

    // Создаём два JSON-файла для скачивания
    const leftArmyData = JSON.stringify({ 
        army: leftData.army, 
        battleResult: result === 'victory' && winnerSide === 'left' ? 'Победа' : (result === 'defeat' && winnerSide === 'right' ? 'Победа' : (result === 'draw' ? 'Ничья' : 'Поражение')),
        opponent: rightData.army.name,
        battleDate: exportData.battleDate,
        enemyKilled: enemyKilled
    }, null, 2);
    const rightArmyData = JSON.stringify({
        army: rightData.army,
        battleResult: result === 'victory' && winnerSide === 'right' ? 'Победа' : (result === 'defeat' && winnerSide === 'left' ? 'Победа' : (result === 'draw' ? 'Ничья' : 'Поражение')),
        opponent: leftData.army.name,
        battleDate: exportData.battleDate,
        enemyKilled: enemyKilled
    }, null, 2);

    // Скачиваем оба файла
    downloadJSON(leftArmyData, `army_${leftData.army.name}_${new Date().toISOString().slice(0,19)}.json`);
    downloadJSON(rightArmyData, `army_${rightData.army.name}_${new Date().toISOString().slice(0,19)}.json`);

    addGlobalLog(`⚔️ Битва между ${leftData.army.name} и ${rightData.army.name} завершена. Результат: ${result}.`, 'general');
    alert("Экспорт выполнен! Скачаны два файла с обновлёнными данными армий.");
}

// Вспомогательная функция для скачивания JSON
function downloadJSON(content, filename) {
    const blob = new Blob([content], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
}