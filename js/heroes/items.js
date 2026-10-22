// ============================================================================
// БИБЛИОТЕКА ПРЕДМЕТОВ
// Общий пул шаблонов для инвентаря всех персонажей.
// Используется как источник автозаполнения при создании нового предмета.
// ============================================================================

window.ITEM_LIBRARY = {
  // ─────── ОРУЖИЕ (Ближний бой) ───────
  knife: { id: 'knife', name: 'Нож', type: 'weapon', attack: 15, price: 60, icon: '../images/items/knife.png', desc: 'Простой нож. Лучше, чем ничего.' },
  knife_sharp: { id: 'knife_sharp', name: 'Заточенный нож', type: 'weapon', attack: 20, price: 150, icon: '../images/items/knife_sharp.png', desc: 'Острый как бритва.' },
  knife_throw: { id: 'knife_throw', name: 'Метательный нож', type: 'weapon', attack: 15, price: 80, icon: '../images/items/knife_throw.png', desc: 'Сбалансирован для броска.' },

  sword_short: { id: 'sword_short', name: 'Короткий меч', type: 'weapon', attack: 33, price: 700, icon: '../images/items/sword_short.png', desc: 'Удобен в тесном бою.' },
  sword_short_sharp: { id: 'sword_short_sharp', name: 'Заточенный короткий меч', type: 'weapon', attack: 42, price: 950, icon: '../images/items/sword_short_sharp.png', desc: 'Опасное оружие в умелых руках.' },

  sword_normal: { id: 'sword_normal', name: 'Обычный меч', type: 'weapon', attack: 35, price: 800, icon: '../images/items/sword_normal.png', desc: 'Стандартный клинок наемника.' },
  sword_sharp: { id: 'sword_sharp', name: 'Заточенный меч', type: 'weapon', attack: 45, price: 1100, icon: '../images/items/sword_sharp.png', desc: 'Хорошо держит заточку.' },

  katana: { id: 'katana', name: 'Катана', type: 'weapon', attack: 45, price: 1200, icon: '../images/items/katana.png', desc: 'Изящный и смертоносный клинок Оку.' },
  sword_bastard: { id: 'sword_bastard', name: 'Двуручный полуторный меч', type: 'weapon', attack: 55, price: 2000, icon: '../images/items/sword_bastard.png', desc: 'Требует немалой силы.' },

  spear: { id: 'spear', name: 'Копьё', type: 'weapon', attack: 40, price: 500, icon: '../images/items/spear.png', desc: 'Держит врага на расстоянии.' },
  pike: { id: 'pike', name: 'Пика', type: 'weapon', attack: 45, price: 700, icon: '../images/items/pike.png', desc: 'Оружие строя.' },

  // ─────── СУМКИ (малая 8, большая 16, мешок 4) ───────
  bag_basic: { id: 'bag_basic', name: 'Простая сумка', type: 'bag', size: 8, price: 100, icon: '👜', desc: 'Вмещает до 8 предметов.' },
  bag_large: { id: 'bag_large', name: 'Большая сумка', type: 'bag', size: 16, price: 500, icon: '🎒', desc: 'Вмещает до 16 предметов.' },
  pouch: { id: 'pouch', name: 'Старый мешок', type: 'bag', size: 4, price: 30, icon: '👝', desc: 'Потёртый дорожный мешок. Вмещает до 4 предметов.' },

  // ─────── ИНДИВИДУАЛЬНЫЕ / КВЕСТОВЫЕ ───────
  medallion: { id: 'medallion', name: 'Медальон рода', type: 'misc', price: 0, icon: '📿', desc: 'Единственное, что осталось от семьи. Гравировка содрана.' }
};

window.ITEM_TYPE_NAMES = {
  weapon: 'Оружие',
  armor: 'Броня',
  bag: 'Сумка',
  misc: 'Прочее',
  custom: 'Индивидуальное'
};

console.log('✅ items.js загружен. Предметов:', Object.keys(window.ITEM_LIBRARY).length);