// ============================================================================
// РЕНДЕР КАРТОЧКИ ПЕРСОНАЖА
// RPG + заклинания + инвентарь (сетка, сворачивание, drag&drop)
// ============================================================================

window.HeroState = {
  heroId: null,
  charData: null,
  _indicatorTimeout: null,

  save(silent = false) {
    if (!this.heroId || !this.charData) return;
    HeroStorage.save(this.heroId, this.charData);
    if (!silent) this.flashIndicator();
  },

  flashIndicator() {
    const el = document.getElementById('saveIndicator');
    if (!el) return;
    el.classList.add('show');
    clearTimeout(this._indicatorTimeout);
    this._indicatorTimeout = setTimeout(() => el.classList.remove('show'), 1500);
  }
};

window.SOCIAL_ORIGIN_OPTIONS = [
  { value:'noble',    label:'👑 Дворянин' },
  { value:'common',   label:'🛖 Простолюдин' },
  { value:'clergy',   label:'✨ Духовенство' },
  { value:'merchant', label:'💰 Купец' },
  { value:'exile',    label:'⚔ Изгнанник' }
];
window.SOCIAL_CURRENT_OPTIONS = [
  { value:'full',     label:'✅ Полноправный' },
  { value:'exiled',   label:'⚔ Лишён титула' },
  { value:'restored', label:'⭐ Восстановлен' },
  { value:'limited',  label:'⚠ Ограничен в правах' }
];
window.SOCIAL_INHERIT_OPTIONS = [
  { value:'full',     label:'✅ Полное' },
  { value:'revoked',  label:'❌ Отозвано' },
  { value:'limited',  label:'⚠ Ограничено' },
  { value:'restored', label:'⭐ Восстановлено' }
];

window.GUILD_RANKS = {
  none:   { name:'— Не состоит —',   privileges:['Не является членом гильдии авантюристов','Нет доступа к доске заданий','Все заказы берутся в обход гильдии'] },
  copper: { name:'Медный ранг',     privileges:['Доступ к доске заданий Медного ранга','Скидка 5% на проживание в тавернах','Один бесплатный запрос информации за 1 ход'] },
  iron:   { name:'Железный ранг',   privileges:['Доступ к заданиям Железного ранга','Скидка 10% на проживание','Право создавать отряд (2 авантюриста)','Доступ к заданиям Медного и Железного ранга'] },
  steel:  { name:'Стальной ранг',   privileges:['Доступ к заданиям Стального ранга и ниже','Скидка 30% на проживание','Голос на общем собрании гильдии','Гражданство и право на дом'] },
  silver: { name:'Серебряный ранг', privileges:['Доступ к заданиям Серебряного ранга','Скидка 40% на проживание','Право на встречу с Гильдмастером','Иммунитет к мелким штрафам'] },
  gold:   { name:'Золотой ранг',    privileges:['Доступ ко всем заданиям','Полное содержание за счёт гильдии','Право вето на решения Совета','Абсолютная гарантия дворянского титула'] }
};

window.STAT_GRADIENTS = {
  level:     'linear-gradient(90deg,#5a2a10,#ffd966)',
  attack:    'linear-gradient(90deg,#7a3018,#ff8a5c)',
  armor:     'linear-gradient(90deg,#3a4855,#b8c8d8)',
  strength:  'linear-gradient(90deg,#6a3a1a,#e8a578)',
  agility:   'linear-gradient(90deg,#2a5a2a,#a8e06a)',
  luck:      'linear-gradient(90deg,#5a4515,#ffd966)',
  precision: 'linear-gradient(90deg,#1f4560,#6ab0ff)',
  mana:      'linear-gradient(90deg,#3a2555,#a87bff)'
};

window.HeroRender = {

  // текущий контекст перетаскивания
  _dragCtx: null,

  /* ---------- toast ---------- */
  showToast(message, type = 'ok') {
    let toast = document.getElementById('heroToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'heroToast';
      document.body.appendChild(toast);
    }
    toast.className = 'hero-toast ' + type;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 2200);
  },

  /* ---------- поля contenteditable ---------- */
  editableFields() {
    document.querySelectorAll('[data-field]').forEach(el => {
      const key = el.dataset.field;
      if (HeroState.charData[key] !== undefined) el.innerHTML = HeroState.charData[key];
      el.setAttribute('contenteditable', 'true');
      el.addEventListener('blur', () => {
        HeroState.charData[key] = el.innerHTML;
        HeroState.save();
      });
    });
  },

  /* ---------- СТАТЫ С ОЧКАМИ ---------- */
  stats() {
    const grid = document.getElementById('statsGrid');
    if (!grid) return;

    // Бонусы от надетых предметов
    let itemBonuses = { attack: 0, armor: 0, strength: 0, agility: 0, luck: 0, precision: 0, mana: 0 };
    if (HeroState.charData.inventory && HeroState.charData.inventory.equipped) {
      HeroState.charData.inventory.equipped.forEach(item => {
        if (!item) return;
        const base = (window.ITEM_LIBRARY && window.ITEM_LIBRARY[item.id]) ? window.ITEM_LIBRARY[item.id] : null;
        if (base) {
          if (base.attack) itemBonuses.attack += base.attack;
          if (base.armor) itemBonuses.armor += base.armor;
          if (base.mana) itemBonuses.mana += base.mana;
        }
      });
    }

    const levelStat = HeroState.charData.stats.find(s => s.key === 'level');
    const level = (levelStat && levelStat.value) ? parseInt(levelStat.value) : 1;
    if (levelStat) levelStat.base = level;

    const totalPoints = level - 1;
    let spentPoints = 0;
    HeroState.charData.stats.forEach(s => {
      if (s.key !== 'level') {
        spentPoints += (s.points || 0);
      }
    });
    const availablePoints = Math.max(0, totalPoints - spentPoints);

    // Баннер с очками
    let pointsBanner = document.getElementById('statPointsBanner');
    if (!pointsBanner) {
      pointsBanner = document.createElement('div');
      pointsBanner.id = 'statPointsBanner';
      pointsBanner.className = 'stat-points-banner';
      grid.parentNode.insertBefore(pointsBanner, grid);
    }
    pointsBanner.innerHTML = `
      <span>Доступно очков: <b>${availablePoints}</b></span>
      <span>Уровень: <b>${level}</b> (1 очко за уровень)</span>
    `;

    grid.innerHTML = '';
    HeroState.charData.stats.forEach((stat, idx) => {
      if (stat.key === 'level') {
        stat.value = level;
        const pct = Math.min(100, (level / 100) * 100);
        const grad = STAT_GRADIENTS.level || 'linear-gradient(90deg,#5a2a10,#ffd966)';

        const card = document.createElement('div');
        card.className = 'stat-card ' + (stat.cls || '');
        card.innerHTML = `
          <div class="stat-head">
            <div class="stat-name"><span class="stat-icon">${stat.icon}</span> ${stat.label}</div>
            <div class="stat-value-row">
              <input type="number" class="stat-value-input" data-stat-idx="${idx}" value="${level}" min="1" max="999">
            </div>
          </div>
          <div class="stat-bar"><div class="stat-bar-fill" style="width:${pct}%; background:${grad};"></div></div>
          <div class="stat-source"><span class="stat-source-label">↳</span> <span class="stat-mod">${stat.mod || ''}</span></div>
        `;
        grid.appendChild(card);
        return;
      }

      const baseVal = stat.base !== undefined ? stat.base : (stat.key === 'mana' ? 300 : 10);
      const points = stat.points || 0;
      const itemBonus = itemBonuses[stat.key] || 0;
      const pointValue = stat.key === 'mana' ? 10 : 1;
      const finalValue = baseVal + (points * pointValue) + itemBonus;
      stat.value = finalValue;

      let sourceText = `База: ${baseVal}`;
      if (points > 0) sourceText += ` + Очки: ${points} (${points * pointValue})`;
      if (itemBonus > 0) sourceText += ` + Экип: ${itemBonus}`;

      const maxVal = stat.key === 'mana' ? 1000 : 100;
      const pct = Math.min(100, Math.max(0, (finalValue / maxVal) * 100));
      const grad = STAT_GRADIENTS[stat.key] || 'linear-gradient(90deg,#7a5f2a,#ffd966)';

      const plusHtml = (availablePoints > 0)
        ? `<button class="stat-add-btn" data-stat-add-idx="${idx}" title="Вложить 1 очко">+</button>`
        : '';

      const card = document.createElement('div');
      card.className = 'stat-card ' + (stat.cls || '');
      card.innerHTML = `
        <div class="stat-head">
          <div class="stat-name"><span class="stat-icon">${stat.icon}</span> ${stat.label}</div>
          <div class="stat-value-row">
            <span class="stat-value-static">${finalValue}</span>
            ${plusHtml}
          </div>
        </div>
        <div class="stat-bar"><div class="stat-bar-fill" style="width:${pct}%; background:${grad};"></div></div>
        <div class="stat-source"><span class="stat-source-label">↳</span> <span class="stat-mod">${sourceText}</span></div>
      `;
      grid.appendChild(card);
    });

    // Обработчик смены уровня
    grid.querySelectorAll('.stat-value-input').forEach(inp => {
      inp.addEventListener('change', () => {
        const i = parseInt(inp.dataset.statIdx);
        let v = parseInt(inp.value) || 1;
        if (v < 1) v = 1;
        inp.value = v;
        HeroState.charData.stats[i].value = v;
        if (HeroState.charData.stats[i].key === 'level') {
          HeroState.charData.stats[i].base = v;
        }
        HeroState.save();
        this.stats();
      });
    });

    // Обработчик кнопки "+"
    grid.querySelectorAll('.stat-add-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const i = parseInt(btn.dataset.statAddIdx);
        const stat = HeroState.charData.stats[i];
        if (!stat || stat.key === 'level') return;

        const totalPts = level - 1;
        const spent = HeroState.charData.stats.reduce((sum, s) => sum + (s.key !== 'level' ? (s.points || 0) : 0), 0);
        if (spent >= totalPts) {
          this.showToast('Нет доступных очков!', 'err');
          return;
        }

        if (stat.points === undefined) stat.points = 0;
        stat.points += 1;
        HeroState.save();
        this.stats();
      });
    });
  },

  /* ---------- ЗАКЛИНАНИЯ ---------- */
  spells() {
    const list = document.getElementById('spellsList');
    if (!list) return;
    list.innerHTML = '';

    if (!HeroState.charData.spells || HeroState.charData.spells.length === 0) {
      list.innerHTML = '<div style="text-align:center;color:var(--ink-dim);font-style:italic;padding:24px;">Заклинаний пока нет. Нажмите «+ Добавить заклинание»</div>';
      return;
    }

    const expandedId = HeroState.charData.expandedSpellId;

    HeroState.charData.spells.forEach((spell, idx) => {
      const isExpanded = expandedId && spell.id === expandedId;

      const item = document.createElement('div');
      item.className = 'spell-item' + (isExpanded ? ' expanded' : '');

      if (isExpanded) {
        const expanded = document.createElement('div');
        expanded.className = 'spell-expanded-body';

        let detailsHtml = '';
        if (spell.details && spell.details.length > 0) {
          detailsHtml = `<div class="spell-details">` +
            spell.details.map(d => `<div class="spell-detail-row"><strong>${d.label}</strong> ${d.text}</div>`).join('') +
            `</div>`;
        }

        let metaHtml = '';
        if (spell.type) metaHtml += `<span>Тип: <b>${spell.type}</b></span>`;
        if (spell.power) metaHtml += `<span>Сила: <b>${spell.power}</b></span>`;
        if (spell.mana) metaHtml += `<span>Мана: <b>${spell.mana}</b></span>`;

        expanded.innerHTML = `
          <div class="spell-icon-wrap">
            <img src="${spell.icon || '../images/spells/default.png'}" alt="${spell.name}" onerror="this.src='../images/spells/default.png'; this.style.opacity='0.5'">
          </div>
          <div class="spell-body">
            <div class="spell-header">
              <span class="spell-name" contenteditable="true" data-spell-name-idx="${idx}">${spell.name}</span>
              <span class="spell-school" contenteditable="true" data-spell-school-idx="${idx}">${spell.school}</span>
            </div>
            ${spell.quote ? `<div class="spell-quote" contenteditable="true" data-spell-quote-idx="${idx}">${spell.quote}</div>` : ''}
            <div class="spell-meta">${metaHtml}</div>
            <div class="spell-desc" contenteditable="true" data-spell-desc-idx="${idx}">${spell.desc}</div>
            ${detailsHtml}
          </div>
          <button class="spell-delete" data-spell-delete-idx="${idx}" title="Удалить">✖</button>
          <button class="spell-collapse-btn" data-spell-collapse-idx="${idx}" title="Свернуть">▲ Свернуть</button>
        `;
        item.appendChild(expanded);
      } else {
        const tile = document.createElement('div');
        tile.className = 'spell-tile';
        tile.innerHTML = `
          <div class="spell-tile-icon">
            <img src="${spell.icon || '../images/spells/default.png'}" alt="${spell.name}" onerror="this.src='../images/spells/default.png'; this.style.opacity='0.5'">
          </div>
          <div class="spell-tile-name">${spell.name}</div>
        `;
        tile.onclick = () => {
          HeroState.charData.expandedSpellId = spell.id;
          HeroState.save(true);
          this.spells();
        };
        item.appendChild(tile);
      }

      list.appendChild(item);
    });

    if (expandedId) {
      ['name','school','quote','desc'].forEach(field => {
        const attr = 'data-spell-' + field + '-idx';
        list.querySelectorAll('[' + attr + ']').forEach(el => {
          el.addEventListener('blur', () => {
            const i = parseInt(el.getAttribute(attr));
            HeroState.charData.spells[i][field] = el.innerHTML.trim();
            HeroState.save();
          });
        });
      });

      list.querySelectorAll('[data-spell-collapse-idx]').forEach(btn => {
        btn.onclick = () => {
          HeroState.charData.expandedSpellId = null;
          HeroState.save(true);
          this.spells();
        };
      });

      list.querySelectorAll('[data-spell-delete-idx]').forEach(btn => {
        btn.onclick = () => {
          const i = parseInt(btn.dataset.spellDeleteIdx);
          if (!confirm(`Удалить заклинание «${HeroState.charData.spells[i].name}»?`)) return;
          HeroState.charData.spells.splice(i, 1);
          HeroState.charData.expandedSpellId = null;
          this.spells();
          HeroState.save();
        };
      });
    }
  },

  /* ============================================================
     МОДАЛКА ДОБАВЛЕНИЯ ЗАКЛИНАНИЯ
     ============================================================ */
  openSpellAddModal() {
    const categories = {
      combat:  { title: '⚔ Боевые заклинания',     schools: {} },
      support: { title: '🛡 Заклинания поддержки',  schools: {} },
      summon:  { title: '🔮 Призыв',                schools: {} }
    };

    Object.entries(SPELL_LIBRARY).forEach(([key, sp]) => {
      const cat = sp.category || 'combat';
      if (!categories[cat]) return;
      if (!categories[cat].schools[sp.school]) categories[cat].schools[sp.school] = [];
      categories[cat].schools[sp.school].push({ key, ...sp });
    });

    const schoolOptions = SPELL_SCHOOLS.map(s => `<option value="${s}">${s}</option>`).join('');

    const modal = document.createElement('div');
    modal.className = 'edit-modal spell-modal open';
    modal.innerHTML = `
      <div class="edit-modal-box">
        <div class="magic-bg"></div>
        <div class="magic-runes"></div>

        <div class="spell-modal-header">
          <h3>✦ Справочник заклинаний ✦</h3>
          <button class="spell-modal-close" id="spellModalClose">✖</button>
        </div>

        <input type="text" class="spell-search" id="spellSearch" placeholder="🔍 Поиск по названию или школе...">

        <div class="spell-library-section">
          <div class="spell-library-title">Выберите из гримуара</div>
          <div class="spell-library-grid" id="spellLibraryGrid"></div>
        </div>

        <div class="spell-form" id="spellForm" style="display:none;">
          <div class="spell-form-divider"><span>Выбранное заклинание</span></div>
          <div class="spell-form-preview" id="spellFormPreview"></div>
          <div class="spell-form-fields">
            <div class="edit-field"><label>Название</label><input type="text" id="spellName" maxlength="60"></div>
            <div class="edit-field"><label>Школа</label><select id="spellSchool">${schoolOptions}</select></div>
            <div class="edit-field"><label>Тип</label><input type="text" id="spellType"></div>
            <div class="edit-field"><label>Сила</label><input type="text" id="spellPower"></div>
            <div class="edit-field"><label>Мана</label><input type="text" id="spellMana"></div>
          </div>
          <div class="edit-field"><label>Цитата</label><input type="text" id="spellQuote" maxlength="200"></div>
          <div class="edit-field"><label>Описание</label><textarea id="spellDesc" maxlength="500"></textarea></div>
        </div>

        <div class="spell-modal-actions">
          <button class="edit-btn cancel" id="spellCancelBtn">Отмена</button>
          <button class="edit-btn primary" id="spellSaveBtn" disabled>Добавить в карточку</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const grid = modal.querySelector('#spellLibraryGrid');
    const form = modal.querySelector('#spellForm');
    const preview = modal.querySelector('#spellFormPreview');
    const saveBtn = modal.querySelector('#spellSaveBtn');
    let selectedKey = null;
    let pendingDetails = null;

    function renderLibrary(filter = '') {
      const f = filter.toLowerCase().trim();
      grid.innerHTML = '';
      let total = 0;

      for (const catKey in categories) {
        const cat = categories[catKey];
        let catTotal = 0;
        for (const school in cat.schools) {
          const filtered = cat.schools[school].filter(sp =>
            !f || sp.name.toLowerCase().includes(f) || sp.school.toLowerCase().includes(f)
          );
          catTotal += filtered.length;
        }
        if (catTotal === 0) continue;

        const catHeader = document.createElement('div');
        catHeader.className = 'spell-category-header';
        catHeader.textContent = cat.title;
        grid.appendChild(catHeader);

        for (const school in cat.schools) {
          const filtered = cat.schools[school].filter(sp =>
            !f || sp.name.toLowerCase().includes(f) || sp.school.toLowerCase().includes(f)
          );
          if (filtered.length === 0) continue;

          const group = document.createElement('div');
          group.className = 'spell-school-group';

          const schoolHeader = document.createElement('div');
          schoolHeader.className = 'spell-school-header';
          schoolHeader.innerHTML = `<span>❖ ${school}</span>`;

          const schoolGrid = document.createElement('div');
          schoolGrid.className = 'spell-school-grid';

          filtered.forEach(sp => {
            total++;
            const card = document.createElement('div');
            card.className = 'spell-lib-card' + (sp.key === selectedKey ? ' selected' : '');
            card.dataset.key = sp.key;
            card.innerHTML = `
              <div class="spell-lib-icon">
                <img src="${sp.icon}" alt="${sp.name}" onerror="this.src='../images/spells/default.png'; this.style.opacity='0.4'">
              </div>
              <div class="spell-lib-info">
                <div class="spell-lib-name">${sp.name}</div>
                <div class="spell-lib-meta">${sp.type || '—'} · ${sp.mana} маны</div>
              </div>
            `;
            card.onclick = () => selectSpell(sp.key);
            schoolGrid.appendChild(card);
          });

          group.appendChild(schoolHeader);
          group.appendChild(schoolGrid);
          grid.appendChild(group);
        }
      }

      if (total === 0) grid.innerHTML = '<div class="spell-lib-empty">Ничего не найдено.</div>';
    }

    function selectSpell(key) {
      selectedKey = key;
      const sp = SPELL_LIBRARY[key];
      if (!sp) return;

      grid.querySelectorAll('.spell-lib-card').forEach(c => c.classList.toggle('selected', c.dataset.key === key));

      modal.querySelector('#spellName').value = sp.name;
      modal.querySelector('#spellSchool').value = sp.school;
      modal.querySelector('#spellType').value = sp.type || '';
      modal.querySelector('#spellPower').value = sp.power || '';
      modal.querySelector('#spellMana').value = sp.mana || '';
      modal.querySelector('#spellQuote').value = sp.quote || '';
      modal.querySelector('#spellDesc').value = sp.desc || '';
      pendingDetails = sp.details ? JSON.parse(JSON.stringify(sp.details)) : null;

      preview.innerHTML = `
        <div class="spell-form-preview-inner">
          <img src="${sp.icon}" class="spell-form-preview-img" onerror="this.src='../images/spells/default.png'; this.style.opacity='0.4'">
          <div class="spell-form-preview-info">
            <div class="spell-form-preview-name">${sp.name}</div>
            <div class="spell-form-preview-school">${sp.school}</div>
            <div class="spell-form-preview-desc">${sp.desc}</div>
          </div>
        </div>
      `;

      form.style.display = 'block';
      saveBtn.disabled = false;
      form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    modal.querySelector('#spellSearch').oninput = (e) => renderLibrary(e.target.value);
    modal.querySelector('#spellModalClose').onclick = () => modal.remove();
    modal.querySelector('#spellCancelBtn').onclick = () => modal.remove();

    saveBtn.onclick = () => {
      const name = modal.querySelector('#spellName').value.trim();
      if (!name) { alert('Название не может быть пустым'); return; }

      const newSpell = {
        id: 'spell_' + Date.now(),
        name,
        school: modal.querySelector('#spellSchool').value,
        icon: selectedKey && SPELL_LIBRARY[selectedKey] ? SPELL_LIBRARY[selectedKey].icon : '../images/spells/default.png',
        quote: modal.querySelector('#spellQuote').value.trim(),
        type: modal.querySelector('#spellType').value.trim(),
        power: modal.querySelector('#spellPower').value.trim(),
        mana: modal.querySelector('#spellMana').value.trim(),
        desc: modal.querySelector('#spellDesc').value.trim() || 'Без описания.',
        details: pendingDetails || []
      };

      HeroState.charData.spells.push(newSpell);
      this.spells();
      HeroState.save();
      modal.remove();
    };

    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    renderLibrary();
  },

  /* ============================================================
     ИНВЕНТАРЬ — СЕТКА ПЛИТОК + СВОРАЧИВАНИЕ + DRAG&DROP
     ============================================================ */
  inventory() {
    const container = document.getElementById('inventoryGrid');
    if (!container) return;

    const walletInput = document.getElementById('walletInput');
    if (walletInput) walletInput.value = HeroState.charData.wallet || 0;

    if (!HeroState.charData.inventory || Array.isArray(HeroState.charData.inventory)) {
      HeroState.charData.inventory = {
        equipped: new Array(10).fill(null),
        bag: new Array(8).fill(null),
        stash: []
      };
    }
    if (!HeroState.charData.uiState) HeroState.charData.uiState = {};
    if (!HeroState.charData.uiState.collapsed) HeroState.charData.uiState.collapsed = {};

    const inv = HeroState.charData.inventory;
    const bagSize = (HeroState.charData.equippedBag && HeroState.charData.equippedBag.size) || 8;

    while (inv.equipped.length < 10) inv.equipped.push(null);
    while (inv.bag.length < bagSize) inv.bag.push(null);
    if (inv.bag.length > bagSize) {
      const overflow = inv.bag.splice(bagSize);
      overflow.forEach(it => { if (it) inv.stash.push(it); });
    }

    const filter = HeroState.charData.inventoryFilter || 'all';
    const matchesFilter = (item) => {
      if (filter === 'all' || !item) return true;
      const base = ITEM_LIBRARY[item.id];
      if (!base) return true;
      if (filter === 'weapon') return base.type === 'weapon';
      if (filter === 'armor')  return base.type === 'armor';
      if (filter === 'item')   return ['misc', 'bag', 'custom'].includes(base.type);
      return true;
    };

    container.innerHTML = '';

    container.appendChild(this._buildBlock(
      '👕', 'Надето', `${inv.equipped.length} слотов`,
      inv.equipped, 'equipped', matchesFilter
    ));

    const bagName = (HeroState.charData.equippedBag && HeroState.charData.equippedBag.name) || 'Сумка';
    const bagIcon = (HeroState.charData.equippedBag && ITEM_LIBRARY[HeroState.charData.equippedBag.id])
      ? ITEM_LIBRARY[HeroState.charData.equippedBag.id].icon : '👜';
    container.appendChild(this._buildBlock(
      bagIcon, bagName, `${bagSize} слотов`,
      inv.bag, 'bag', matchesFilter, { showChangeBag: true }
    ));

    container.appendChild(this._buildBlock(
      '📦', 'Имущество', 'Безлимит',
      inv.stash, 'stash', matchesFilter, { showAddSlot: true }
    ));

    const shopBtnWrap = document.createElement('div');
    shopBtnWrap.style.cssText = 'margin-top: 20px; display: flex; justify-content: center;';
    shopBtnWrap.innerHTML = `<button class="edit-btn primary" onclick="HeroRender.openShopModal()" style="padding: 12px 40px; font-size: 16px;">🛒 Открыть магазин</button>`;
    container.appendChild(shopBtnWrap);

    this._syncFilterUI();
    this._updateInventoryCounts();
    HeroState.save(true);
  },

  // ─── рендер иконки: эмодзи или png ───
  _renderIcon(base) {
    const icon = (base && base.icon) || '📦';
    const isImage = /[\/\\]/.test(icon) || /\.(png|jpe?g|svg|webp|gif)$/i.test(icon);
    if (isImage) {
      return `<img src="${icon}" alt="${base.name || ''}" class="inv-item-img" onerror="this.outerHTML='📦';">`;
    }
    return icon;
  },

  _buildBlock(icon, name, hint, items, blockType, matchesFilter, opts = {}) {
    const block = document.createElement('div');
    block.className = 'inv-block';
    block.dataset.invBlock = blockType;

    const collapseId = 'inv-' + blockType;
    const isCollapsed = HeroState.charData.uiState.collapsed[collapseId] === true;

    // ─── заголовок ───
    const header = document.createElement('div');
    header.className = 'inv-block-title' + (isCollapsed ? '' : ' expanded');
    header.innerHTML = `
      <span class="inv-block-toggle">${isCollapsed ? '▶' : '▼'}</span>
      <span class="inv-block-icon">${icon}</span>
      <span class="inv-block-name">${name}</span>
      <span class="inv-block-hint">(${hint})</span>
      ${opts.showChangeBag ? '<button class="inv-change-bag-btn" data-change-bag>Сменить сумку</button>' : ''}
    `;

    // ─── тело ───
    const body = document.createElement('div');
    body.className = 'inv-block-body';
    if (isCollapsed) body.style.display = 'none';

    const grid = document.createElement('div');
    grid.className = 'inv-list';

    items.forEach((item, i) => {
      grid.appendChild(this._createRow(item, blockType, i, matchesFilter));
    });

    if (opts.showAddSlot) {
      grid.appendChild(this._createAddSlot());
    }

    body.appendChild(grid);
    block.appendChild(header);
    block.appendChild(body);

    // ─── обработчик сворачивания ───
    header.addEventListener('click', (e) => {
      if (e.target.closest('[data-change-bag]')) return;
      const nowCollapsed = !HeroState.charData.uiState.collapsed[collapseId];
      HeroState.charData.uiState.collapsed[collapseId] = nowCollapsed;
      body.style.display = nowCollapsed ? 'none' : 'block';
      header.classList.toggle('expanded', !nowCollapsed);
      const toggle = header.querySelector('.inv-block-toggle');
      if (toggle) toggle.textContent = nowCollapsed ? '▶' : '▼';
      HeroState.save();
    });

    // ─── кнопка "Сменить сумку" ───
    if (opts.showChangeBag) {
      const bagBtn = header.querySelector('[data-change-bag]');
      if (bagBtn) {
        bagBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openBagSelectModal();
        });
      }
    }

    return block;
  },

  _createRow(item, blockType, index, matchesFilter) {
    const row = document.createElement('div');
    row.className = 'inv-slot';
    row.dataset.blockType = blockType;
    row.dataset.index = index;

    if (item) {
      const base = ITEM_LIBRARY[item.id] || { name: 'Неизвестно', icon: '📦', type: 'misc' };
      row.classList.add('filled');
      if (!matchesFilter(item)) row.classList.add('dimmed');

      const typeLabel = (window.ITEM_TYPE_NAMES && ITEM_TYPE_NAMES[base.type]) || base.type || '—';
      const displayName = base.name + (item.count && item.count > 1 ? ` ×${item.count}` : '');

      row.innerHTML = `
        <div class="inv-icon-wrap">${this._renderIcon(base)}</div>
        <div class="inv-label" title="${base.name}">${displayName}</div>
        <div class="inv-type">${typeLabel}</div>
      `;

      row.title = `${base.name}${base.desc ? ' — ' + base.desc : ''}`;

      // drag&drop
      row.setAttribute('draggable', 'true');
      row.addEventListener('dragstart', (e) => {
        HeroRender._dragCtx = { from: blockType, index };
        e.dataTransfer.effectAllowed = 'move';
        try { e.dataTransfer.setData('text/plain', `${blockType}:${index}`); } catch (_) {}
        row.classList.add('dragging');
      });
      row.addEventListener('dragend', () => {
        row.classList.remove('dragging');
        HeroRender._dragCtx = null;
        document.querySelectorAll('.inv-slot.drag-over').forEach(el => el.classList.remove('drag-over'));
      });

      // принимает drop тоже
      this._attachDropHandlers(row, blockType, index);

      // клик — модалка действий
      row.addEventListener('click', (e) => {
        // от нативного "drag" клик не запускается, но на всякий случай
        if (row.classList.contains('dragging')) return;
        this.openItemActionModal(item, blockType, index);
      });
    } else {
      row.classList.add('empty');
      row.innerHTML = `<span class="inv-empty-text">пусто</span>`;
      if (blockType !== 'stash') {
        row.addEventListener('click', () => this.openShopModal());
      }
      // пустой слот тоже принимает drop
      this._attachDropHandlers(row, blockType, index);
    }

    return row;
  },

  _createAddSlot() {
    const add = document.createElement('div');
    add.className = 'inv-slot add-slot';
    add.innerHTML = `
      <span class="inv-add-plus">＋</span>
      <span class="inv-add-text">Добавить</span>
    `;
    add.addEventListener('click', () => this.openShopModal('custom'));

    // принимает drop из других блоков → push в stash
    add.addEventListener('dragover', (e) => {
      if (!HeroRender._dragCtx) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      add.classList.add('drag-over');
    });
    add.addEventListener('dragleave', () => add.classList.remove('drag-over'));
    add.addEventListener('drop', (e) => {
      e.preventDefault();
      add.classList.remove('drag-over');
      const ctx = HeroRender._dragCtx;
      if (!ctx) return;
      HeroRender.moveItem(ctx.from, ctx.index, 'stash');
    });

    return add;
  },

  _attachDropHandlers(row, blockType, index) {
    row.addEventListener('dragover', (e) => {
      if (!HeroRender._dragCtx) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      row.classList.add('drag-over');
    });
    row.addEventListener('dragleave', () => {
      row.classList.remove('drag-over');
    });
    row.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      row.classList.remove('drag-over');
      const ctx = HeroRender._dragCtx;
      if (!ctx) return;
      HeroRender.handleDrop(ctx.from, ctx.index, blockType, index);
    });
  },

  /* ---------- обработка drop ---------- */
  handleDrop(fromBlock, fromIdx, toBlock, toIdx) {
    const inv = HeroState.charData.inventory;
    const item = inv[fromBlock] && inv[fromBlock][fromIdx];
    if (!item) return;

    const base = ITEM_LIBRARY[item.id];

    // тот же блок: swap или перенос в конкретный слот
    if (fromBlock === toBlock && toBlock !== 'stash') {
      if (fromIdx === toIdx) return;
      const arr = inv[fromBlock];
      const targetItem = arr[toIdx];

      // если тащат сумку обратно в equipped — не через swap, а через equipBag
      if (toBlock === 'equipped' && base && base.type === 'bag') {
        this.equipBag(fromBlock, fromIdx);
        return;
      }

      // если сумку тащат внутрь "Сумки" — тоже просто swap (никаких манипуляций)
      [arr[fromIdx], arr[toIdx]] = [arr[toIdx], arr[fromIdx]];
      HeroState.save();
      this.inventory();
      this.stats();
      this.showToast(targetItem ? 'Переставлено' : 'Перемещено');
      return;
    }

    // на "Надето"
    if (toBlock === 'equipped') {
      if (base && base.type === 'bag') {
        this.equipBag(fromBlock, fromIdx);
      } else {
        this.moveItem(fromBlock, fromIdx, 'equipped');
      }
      return;
    }

    // в "Сумку"
    if (toBlock === 'bag') {
      if (fromBlock === 'equipped' && base && base.type === 'bag') {
        // снять надетую сумку в сумку нелогично — отправим в имущество
        this.moveItem(fromBlock, fromIdx, 'stash');
      } else {
        this.moveItem(fromBlock, fromIdx, 'bag');
      }
      return;
    }

    // в "Имущество"
    if (toBlock === 'stash') {
      this.moveItem(fromBlock, fromIdx, 'stash');
      return;
    }
  },

  setInventoryFilter(filter) {
    HeroState.charData.inventoryFilter = filter;
    HeroState.save(true);
    this.inventory();
  },

  _syncFilterUI() {
    const current = HeroState.charData.inventoryFilter || 'all';
    document.querySelectorAll('#inventoryFilters .inv-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === current);
    });
  },

  _updateInventoryCounts() {
    const inv = HeroState.charData.inventory;
    const all = [
      ...(inv.equipped || []),
      ...(inv.bag || []),
      ...(inv.stash || [])
    ].filter(Boolean);

    const counts = { all: all.length, weapon: 0, armor: 0, item: 0 };
    all.forEach(it => {
      const base = ITEM_LIBRARY[it.id];
      if (!base) return;
      if (base.type === 'weapon') counts.weapon++;
      else if (base.type === 'armor') counts.armor++;
      else if (['misc', 'bag', 'custom'].includes(base.type)) counts.item++;
    });

    document.querySelectorAll('#inventoryFilters .inv-filter-btn').forEach(btn => {
      const span = btn.querySelector('.count');
      if (span) span.textContent = counts[btn.dataset.filter] ?? 0;
    });
  },

  openItemActionModal(item, blockType, index) {
    const base = ITEM_LIBRARY[item.id];
    if (!base) return;

    const modal = document.createElement('div');
    modal.className = 'edit-modal open';
    modal.innerHTML = `
      <div class="edit-modal-box item-modal-box">
        <div class="item-modal-header">
          <div class="item-modal-icon-wrap">${this._renderIcon(base)}</div>
          <div class="item-modal-title-block">
            <h3>${base.name}</h3>
            <span class="item-modal-type">${ITEM_TYPE_NAMES[base.type] || base.type}</span>
          </div>
        </div>

        <div class="item-modal-body">
          <div class="item-modal-stats">
            ${base.attack ? `<div class="item-stat"><span>Атака</span><b>+${base.attack}</b></div>` : ''}
            ${base.armor ? `<div class="item-stat"><span>Броня</span><b>+${base.armor}</b></div>` : ''}
            ${base.size ? `<div class="item-stat"><span>Слотов</span><b>${base.size}</b></div>` : ''}
            ${base.price !== undefined ? `<div class="item-stat"><span>Цена</span><b>${base.price} 💰</b></div>` : ''}
          </div>
          <p class="item-modal-desc">${base.desc || 'Описание отсутствует.'}</p>
        </div>

        <div class="edit-actions item-modal-actions">
          ${this._getActionButtons(item, blockType, index, base)}
          <button class="edit-btn cancel" data-close>Закрыть</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.hasAttribute('data-close')) modal.remove();
    });
  },

  _getActionButtons(item, blockType, index, base) {
    let btns = '';
    if (blockType === 'equipped') {
      btns += `<button class="edit-btn primary" data-act="move" data-from="equipped" data-index="${index}" data-to="bag">🎒 Снять в сумку</button>`;
      btns += `<button class="edit-btn primary" data-act="move" data-from="equipped" data-index="${index}" data-to="stash">📦 Снять в имущество</button>`;
    } else if (blockType === 'bag') {
      if (base.type === 'bag') {
        btns += `<button class="edit-btn primary" data-act="equip" data-from="bag" data-index="${index}">👕 Надеть сумку</button>`;
      } else {
        btns += `<button class="edit-btn primary" data-act="move" data-from="bag" data-index="${index}" data-to="equipped">👕 Надеть</button>`;
      }
      btns += `<button class="edit-btn primary" data-act="move" data-from="bag" data-index="${index}" data-to="stash">📦 В имущество</button>`;
    } else if (blockType === 'stash') {
      if (base.type === 'bag') {
        btns += `<button class="edit-btn primary" data-act="equip" data-from="stash" data-index="${index}">👕 Надеть сумку</button>`;
      } else {
        btns += `<button class="edit-btn primary" data-act="move" data-from="stash" data-index="${index}" data-to="equipped">👕 Надеть</button>`;
        btns += `<button class="edit-btn primary" data-act="move" data-from="stash" data-index="${index}" data-to="bag">🎒 В сумку</button>`;
      }
    }

    setTimeout(() => {
      document.querySelectorAll('.edit-modal.open [data-act]').forEach(btn => {
        btn.addEventListener('click', () => {
          const act = btn.dataset.act;
          const from = btn.dataset.from;
          const idx = parseInt(btn.dataset.index);
          if (act === 'equip') {
            this.equipBag(from, idx);
          } else if (act === 'move') {
            this.moveItem(from, idx, btn.dataset.to);
          }
        });
      });
    }, 0);

    return btns;
  },

  moveItem(from, index, to) {
    const inv = HeroState.charData.inventory;
    const item = inv[from][index];
    if (!item) return;

    const base = ITEM_LIBRARY[item.id];
    if (to === 'equipped' && base && base.type === 'bag') {
      this.equipBag(from, index);
      return;
    }

    let targetIndex = inv[to].findIndex(slot => slot === null);

    if (to === 'stash') {
      inv.stash.push(item);
    } else if (targetIndex !== -1) {
      inv[to][targetIndex] = item;
    } else {
      this.showToast('Нет свободного места в целевом блоке!', 'err');
      return;
    }

    inv[from][index] = null;
    HeroState.save();
    this.inventory();
    this.stats();
    document.querySelectorAll('.edit-modal.open').forEach(m => m.remove());
    this.showToast(`Перемещено: ${base ? base.name : 'предмет'}`);
  },

  equipBag(from, index) {
    const inv = HeroState.charData.inventory;
    const item = inv[from] && inv[from][index];
    if (!item) return;

    const base = ITEM_LIBRARY[item.id];
    if (!base || base.type !== 'bag') {
      this.showToast('Это не сумка', 'err');
      return;
    }

    const oldBag = HeroState.charData.equippedBag;
    inv[from][index] = null;

    if (oldBag && oldBag.id) {
      inv.stash.push({ id: oldBag.id });
    }

    HeroState.charData.equippedBag = { id: base.id, name: base.name, size: base.size };

    const newSize = base.size;
    while (inv.bag.length < newSize) inv.bag.push(null);
    if (inv.bag.length > newSize) {
      const extra = inv.bag.splice(newSize);
      extra.forEach(it => { if (it) inv.stash.push(it); });
    }

    HeroState.save();
    this.inventory();
    this.stats();
    document.querySelectorAll('.edit-modal.open').forEach(m => m.remove());
    this.showToast(`Надета: ${base.name} (${base.size} слотов)`);
  },

  openBagSelectModal() {
    const inv = HeroState.charData.inventory;
    const bags = [];

    ['bag', 'stash'].forEach(block => {
      inv[block].forEach((item, i) => {
        if (!item) return;
        const base = ITEM_LIBRARY[item.id];
        if (base && base.type === 'bag') {
          bags.push({ item, block, index: i, base });
        }
      });
    });

    if (bags.length === 0) {
      this.showToast('Других сумок в инвентаре нет. Купите в магазине!', 'err');
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'edit-modal open';
    modal.innerHTML = `
      <div class="edit-modal-box" style="width: 440px;">
        <h3>👜 Выбрать сумку</h3>
        <div style="margin: 15px 0; display: flex; flex-direction: column; gap: 8px;">
          ${bags.map((b, i) => `
            <div class="bag-option" data-bag-idx="${i}" style="padding: 12px 16px; background: rgba(0,0,0,0.35); border: 1px solid rgba(160,120,80,0.35); border-radius: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: 0.2s;">
              <span>${this._renderIcon(b.base)} <strong>${b.base.name}</strong> <small style="color: var(--ink-muted);">(${b.base.size} слотов)</small></span>
              <span style="color: var(--gold); font-weight: 700;">→</span>
            </div>
          `).join('')}
        </div>
        <div class="edit-actions">
          <button class="edit-btn cancel" data-close>Закрыть</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelectorAll('[data-bag-idx]').forEach(el => {
      el.addEventListener('mouseenter', () => el.style.borderColor = 'var(--gold)');
      el.addEventListener('mouseleave', () => el.style.borderColor = 'rgba(160,120,80,0.35)');
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.bagIdx);
        const chosen = bags[idx];
        this.equipBag(chosen.block, chosen.index);
      });
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.hasAttribute('data-close')) modal.remove();
    });
  },

  openShopModal(defaultTab = 'weapon') {
    document.querySelectorAll('.shop-modal').forEach(m => m.remove());

    const modal = document.createElement('div');
    modal.className = 'edit-modal shop-modal open';
    modal.id = 'shopModal';

    modal.innerHTML = `
      <div class="edit-modal-box">
        <div class="shop-header">
          <h3>🛒 Торговая лавка</h3>
          <div class="shop-wallet">Ваш кошелек: <strong>${HeroState.charData.wallet} 💰</strong></div>
          <button class="spell-modal-close" data-close>✖</button>
        </div>

        <div class="shop-tabs">
          <button class="shop-tab" data-tab="weapon" onclick="HeroRender.switchShopTab('weapon', this)">⚔ Оружие</button>
          <button class="shop-tab" data-tab="armor"  onclick="HeroRender.switchShopTab('armor', this)">🛡 Броня</button>
          <button class="shop-tab" data-tab="bag"    onclick="HeroRender.switchShopTab('bag', this)">👜 Сумки</button>
          <button class="shop-tab" data-tab="custom" onclick="HeroRender.switchShopTab('custom', this)">✨ Индивидуальное</button>
        </div>

        <div class="shop-content" id="shopContent"></div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.hasAttribute('data-close')) modal.remove();
    });

    const btn = modal.querySelector(`.shop-tab[data-tab="${defaultTab}"]`) || modal.querySelector('.shop-tab');
    this.switchShopTab(defaultTab, btn);
  },

  switchShopTab(tabId, btnElement) {
    if (btnElement) {
      btnElement.parentElement.querySelectorAll('.shop-tab').forEach(b => b.classList.remove('active'));
      btnElement.classList.add('active');
    }
    const content = document.getElementById('shopContent');
    if (!content) return;

    const catalog = Object.values(ITEM_LIBRARY);
    let html = '';

    if (tabId === 'custom') {
      const customItems = catalog.filter(i => i.type === 'misc' || i.type === 'custom');
      customItems.forEach(item => {
        html += `
          <div class="shop-item-card">
            <div class="shop-item-icon">${this._renderIcon(item)}</div>
            <div class="shop-item-info"><div class="shop-item-name">${item.name}</div></div>
            <div class="shop-item-price">${item.price} 💰</div>
            <button class="shop-buy-btn" data-buy="${item.id}">${item.price === 0 ? 'Получить' : 'Купить'}</button>
          </div>
        `;
      });
      if (!customItems.length) html = '<div style="padding: 20px; text-align: center; color: var(--ink-muted); font-style: italic; grid-column: 1 / -1;">Пока пусто.</div>';
    } else {
      const filtered = catalog.filter(i => i.type === tabId);
      filtered.forEach(item => {
        html += `
          <div class="shop-item-card">
            <div class="shop-item-icon">${this._renderIcon(item)}</div>
            <div class="shop-item-info">
              <div class="shop-item-name">${item.name}</div>
              <div class="shop-item-stats">${item.attack ? 'Атака: '+item.attack : ''} ${item.size ? 'Слотов: '+item.size : ''}</div>
            </div>
            <div class="shop-item-price">${item.price} 💰</div>
            <button class="shop-buy-btn" data-buy="${item.id}">Купить</button>
          </div>
        `;
      });
      if (!filtered.length) html = '<div style="padding: 20px; text-align: center; color: var(--ink-muted); font-style: italic; grid-column: 1 / -1;">Ничего нет.</div>';
    }

    content.innerHTML = html;

    content.querySelectorAll('[data-buy]').forEach(b => {
      b.addEventListener('click', () => this.buyItem(b.dataset.buy));
    });
  },

  buyItem(itemId) {
    const item = ITEM_LIBRARY[itemId];
    if (!item) return;

    if ((HeroState.charData.wallet || 0) < item.price) {
      this.showToast('Недостаточно эрсов!', 'err');
      return;
    }

    HeroState.charData.wallet -= item.price;
    const walletEl = document.querySelector('.shop-wallet strong');
    if (walletEl) walletEl.innerText = HeroState.charData.wallet + ' 💰';

    const inv = HeroState.charData.inventory;
    let targetIndex = inv.bag.findIndex(s => s === null);

    if (targetIndex !== -1) {
      inv.bag[targetIndex] = { id: item.id };
      this.showToast(`Куплено: ${item.name}`);
    } else {
      inv.stash.push({ id: item.id });
      this.showToast(`Куплено: ${item.name} (в имущество)`);
    }

    HeroState.save();
    this.inventory();
  },

  wallet() {
    const inp = document.getElementById('walletInput');
    if (inp) inp.value = HeroState.charData.wallet || 0;
  },

  inventoryNotes() {
    const cont = document.getElementById('inventoryNotes');
    if (!cont) return;
    cont.innerHTML = '';
    (HeroState.charData.inventoryNotes || []).forEach((note, i) => {
      const div = document.createElement('div');
      div.className = 'note-card';
      div.innerHTML = `<b contenteditable="true" data-invnote-title-idx="${i}">${note.title}</b><p contenteditable="true" data-invnote-text-idx="${i}">${note.text}</p>`;
      cont.appendChild(div);
    });
    cont.querySelectorAll('[data-invnote-title-idx]').forEach(el => {
      el.addEventListener('blur', () => { HeroState.charData.inventoryNotes[parseInt(el.dataset.invnoteTitleIdx)].title = el.textContent.trim(); HeroState.save(); });
    });
    cont.querySelectorAll('[data-invnote-text-idx]').forEach(el => {
      el.addEventListener('blur', () => { HeroState.charData.inventoryNotes[parseInt(el.dataset.invnoteTextIdx)].text = el.innerHTML.trim(); HeroState.save(); });
    });
  },

  socialSelects() {
    this._populateSelect('socialOriginSelect', SOCIAL_ORIGIN_OPTIONS, HeroState.charData.socialOrigin || 'noble');
    this._populateSelect('socialCurrentSelect', SOCIAL_CURRENT_OPTIONS, HeroState.charData.socialCurrent || 'exiled');
    this._populateSelect('socialInheritSelect', SOCIAL_INHERIT_OPTIONS, HeroState.charData.socialInherit || 'revoked');
  },

  _populateSelect(id, options, current) {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = '';
    options.forEach(opt => {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      if (opt.value === current) o.selected = true;
      sel.appendChild(o);
    });
  },

  guild() {
    const rank = HeroState.charData.guildRank || 'copper';
    const data = GUILD_RANKS[rank] || GUILD_RANKS.copper;

    const sel = document.getElementById('guildRankSelect');
    if (sel) sel.value = rank;
    const title = document.getElementById('guildRankTitle');
    if (title) title.textContent = data.name;
    const progBlock = document.getElementById('guildProgressBlock');
    if (progBlock) progBlock.style.display = (rank === 'none') ? 'none' : 'block';

    const ul = document.getElementById('guildPrivileges');
    if (ul) {
      ul.innerHTML = '';
      (data.privileges || []).forEach(p => {
        const li = document.createElement('li');
        li.textContent = p;
        ul.appendChild(li);
      });
    }
    const progInp = document.getElementById('guildProgressInput');
    const totalInp = document.getElementById('guildTotalInput');
    if (progInp) progInp.value = HeroState.charData.guildProgress || 0;
    if (totalInp) totalInp.value = HeroState.charData.guildTotal || 1;
    const pct = Math.min(100, ((HeroState.charData.guildProgress || 0) / (HeroState.charData.guildTotal || 1)) * 100);
    const fill = document.getElementById('guildProgressFill');
    if (fill) fill.style.width = pct + '%';
  },

  all() {
    this.editableFields();
    this.stats();
    this.spells();
    this.inventory();
    this.wallet();
    this.inventoryNotes();
    this.socialSelects();
    this.guild();
  }
};

console.log('✅ render.js загружен (сетка + сворачивание + drag&drop)');