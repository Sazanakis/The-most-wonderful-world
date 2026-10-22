// ============================================================================
// ЯДРО КАРТОЧКИ ПЕРСОНАЖА
// ============================================================================

const KAEL_DEFAULTS = {
  topQuote: '«Он говорил мало — и каждое слово стоило дороже золота.»',
  charName: 'Каэль',
  charSubtitle: 'Многоликий · изгнанник',
  charMotto: '«Пепел и пламя. Ничего лишнего.»',
  sideQuote: 'Огонь не прощает того, кто его зажёг.',

  signName: 'Каэль',
  age: '32 года',
  gender: 'Мужской',
  race: 'Полукровка суари / ифрит',
  origin: 'Приграничное герцогство',
  occupation: 'Странник',
  role: 'Многоликий (бывш.)',

  socialOrigin: 'noble',
  socialCurrent: 'exiled',
  socialInherit: 'revoked',
  socialNote: 'Рождён в знатном роду, но отречён публично. Формально — простолюдин по бумагам, фактически — дворянин по крови и манере держаться. В гильдейских записях проходит как «странник без рода».',

  guildRank: 'copper',
  guildProgress: 2,
  guildTotal: 5,

  impression: 'Сухая фигура в тёмном плаще. Он не производит впечатления — он его выключает. Взгляд скользит по лицам ровно настолько, чтобы успеть посчитать выходы.',
  lore1: '<b>Младший сын небогатого дворянского рода</b>, он с юности тянулся к алхимии — не из тщеславия, а из упрямой веры, что знание поднимает выше крови.',
  lore2: 'После рокового ритуала семья отреклась от него, а герцог изгнал с земель. <i>Фамилия осталась там же, где и всё остальное.</i>',

  personaCoreTitle: 'холодный, собранный, предельно прагматичный',
  personaCoreText: 'Надменность Каэля — не высокомерие ради высокомерия, а защитная броня. Он экономит слова и не терпит пустой болтовни.',
  personaOuterLabel: 'Внешнее поведение',
  personaOuterTitle: 'дистанция как вежливость',
  personaOuterText: 'Держится ровно, не повышает голоса, не отвечает на провокации. Предпочитает наблюдать со стороны и вмешиваться в последний момент.',
  personaConflictLabel: 'Внутренний конфликт',
  personaConflictTitle: 'вина, которую он не отдаёт никому',
  personaConflictText: 'Ритуал забрал у него имя, семью и человеческую природу — и он до сих пор не решил, был ли это провал или единственный честный поступок в жизни.',
  habitsLabel: 'Привычки',
  habitsText: 'Каждое утро проверяет и точит меч. Перед важным решением крутит в пальцах медальон. Избегает называть своё настоящее имя.',
  allowedLabel: 'Допустимо',
  allowedText: 'Держать дистанцию. Говорить по делу. Платить вперёд. Молчать рядом. Смотреть в глаза — он это ценит.',
  forbiddenLabel: 'Недопустимо',
  forbiddenText: 'Трогать медальон без спроса. Называть его полным именем. Обещать что-либо за него. Благодарить слишком долго.',

  isMage: true,
  stats: [
    { key: 'level', label: 'Уровень', icon: '🕯', value: 1, cls: 'stat-level', mod: 'повышается вердиктами', desc: 'Определяется числом постов.' },
    { key: 'attack', label: 'Атака', icon: '🗡', base: 10, points: 0, cls: 'stat-attack', desc: 'Влияет на урон.' },
    { key: 'armor', label: 'Броня', icon: '🛡', base: 10, points: 0, cls: 'stat-armor', desc: 'Поглощает урон.' },
    { key: 'strength', label: 'Сила', icon: '👊', base: 10, points: 0, cls: 'stat-strength', desc: 'Физ. возможности.' },
    { key: 'agility', label: 'Ловкость', icon: '🖐', base: 10, points: 0, cls: 'stat-agility', desc: 'Точность и уклонение.' },
    { key: 'luck', label: 'Удача', icon: '🍀', base: 10, points: 0, cls: 'stat-luck', desc: 'Особые события.' },
    { key: 'precision', label: 'Точность', icon: '🎯', base: 10, points: 0, cls: 'stat-precision', desc: 'Шанс попадания.' },
    { key: 'mana', label: 'Мана', icon: '💫', base: 300, points: 0, cls: 'stat-mana', desc: 'Объём заклинаний.' }
  ],
  statsSummary: 'Ловкий и точный боец с базовым запасом маны.',

  wallet: 45000,
  inventoryFilter: 'all',

  // По умолчанию — простая сумка (8 слотов)
  equippedBag: { id: 'bag_basic', name: 'Простая сумка', size: 8 },
  inventory: {
    equipped: [null, null, null, null, null, null, null, null, null, null],
    bag: [
      { id: 'medallion', count: 1 },
      null, null, null, null, null, null, null
    ],
    stash: []
  },

  spells: [],

  inventoryNotes: [
    { title: 'Клинок', text: 'Сбалансированное острие, дешёвое на вид. Каэль точит его каждое утро — не из необходимости, а из ритуала.' },
    { title: 'Медальон рода', text: 'Единственное, что осталось от семьи. Гравировка содрана — имя больше не читается. Не снимает.' }
  ],

  visualImpression: '',
  palette: [],
  featuresNotes: [],
  relations: [],

  currentTrack: 0
};

/* ============================================================
   ПЛЕЙЛИСТ
   ============================================================ */
const MUSIC_PLAYLIST = [
  { title: 'OP 1', artist: 'Sengoku basara', src: '../music/main_theme.mp3' },
  { title: 'OP 2', artist: 'Sengoku basara', src: '../music/sawano_hiroyuki.mp3' },
];

/* ============================================================
   ПЕРЕКЛЮЧЕНИЕ ТАБОВ
   ============================================================ */
function initTabs() {
  document.querySelectorAll('.side-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const stubName = btn.dataset.stubPage;
      if (stubName) {
        openStubModal(stubName);
        return;
      }
      const pageId = btn.dataset.page;
      document.querySelectorAll('.side-nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('page-' + pageId)?.classList.add('active');
    });
  });
}

/* ============================================================
   МОДАЛКА «РАЗДЕЛ В РАЗРАБОТКЕ»
   ============================================================ */
function openStubModal(sectionName) {
  const modal = document.getElementById('stubModal');
  if (!modal) return;
  const nameEl = document.getElementById('stubSectionName');
  if (nameEl) nameEl.textContent = '«' + sectionName + '»';
  modal.classList.add('open');
}

function closeStubModal() {
  document.getElementById('stubModal')?.classList.remove('open');
}

/* ============================================================
   МУЗЫКАЛЬНЫЙ ПЛЕЕР
   ============================================================ */
const MusicPlayer = {
  audio: null,
  currentTrack: 0,
  playing: false,

  init() {
    this.audio = document.getElementById('musicAudio');
    this.currentTrack = HeroState.charData.currentTrack || 0;

    document.getElementById('musicPlayBtn')?.addEventListener('click', () => {
      this.playing ? this.pause() : this.play();
    });
    document.getElementById('musicPrevBtn')?.addEventListener('click', () => {
      this.load(this.currentTrack - 1);
      if (this.playing) this.play();
    });
    document.getElementById('musicNextBtn')?.addEventListener('click', () => {
      this.load(this.currentTrack + 1);
      if (this.playing) this.play();
    });
    document.getElementById('musicListBtn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('musicWidget')?.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      const w = document.getElementById('musicWidget');
      if (w && !w.contains(e.target)) w.classList.remove('open');
    });
    this.audio?.addEventListener('ended', () => {
      this.load(this.currentTrack + 1);
      this.play();
    });

    this.renderList();
    this.load(this.currentTrack);
  },

  renderList() {
    const list = document.getElementById('musicTrackList');
    if (!list) return;
    list.innerHTML = '';
    MUSIC_PLAYLIST.forEach((track, i) => {
      const item = document.createElement('div');
      item.className = 'music-track-item' + (i === this.currentTrack ? ' active' : '');
      item.innerHTML = `<span>${track.title} <span style="color:var(--ink-muted);font-size:10px;">— ${track.artist}</span></span>`;
      item.onclick = () => {
        this.load(i);
        this.play();
        document.getElementById('musicWidget')?.classList.remove('open');
      };
      list.appendChild(item);
    });
  },

  load(idx) {
    if (idx < 0) idx = MUSIC_PLAYLIST.length - 1;
    if (idx >= MUSIC_PLAYLIST.length) idx = 0;
    this.currentTrack = idx;
    HeroState.charData.currentTrack = idx;
    HeroState.save(true);
    const track = MUSIC_PLAYLIST[idx];
    if (this.audio) this.audio.src = track.src;
    const nameEl = document.getElementById('musicTrackName');
    if (nameEl) nameEl.textContent = `${track.title} — ${track.artist}`;
    this.renderList();
  },

  play() {
    if (!this.audio) return;
    this.audio.volume = 0.25;
    this.audio.play().then(() => {
      this.playing = true;
      const btn = document.getElementById('musicPlayBtn');
      if (btn) btn.textContent = '❚❚';
    }).catch(() => {
      const nameEl = document.getElementById('musicTrackName');
      if (nameEl) nameEl.textContent = `⚠ ${MUSIC_PLAYLIST[this.currentTrack].title} (файл не найден)`;
    });
  },

  pause() {
    if (!this.audio) return;
    this.audio.pause();
    this.playing = false;
    const btn = document.getElementById('musicPlayBtn');
    if (btn) btn.textContent = '▶';
  }
};

/* ============================================================
   ЭКСПОРТ / ИМПОРТ / СБРОС
   ============================================================ */
function initActions() {
  document.getElementById('saveBtn')?.addEventListener('click', () => HeroState.save());

  document.getElementById('exportBtn')?.addEventListener('click', () => {
    const filename = `character_${HeroState.charData.charName || HeroState.heroId}_${new Date().toISOString().slice(0,10)}.json`;
    HeroStorage.exportToFile(HeroState.charData, filename);
  });

  document.getElementById('importBtn')?.addEventListener('click', () => {
    document.getElementById('importFile')?.click();
  });
  document.getElementById('importFile')?.addEventListener('change', async function(e) {
    if (!e.target.files.length) return;
    try {
      const data = await HeroStorage.importFromFile(e.target.files[0]);
      HeroState.charData = HeroStorage.deepMerge(KAEL_DEFAULTS, data);
      HeroState.save();
      HeroRender.all();
      alert('✅ Карточка загружена');
    } catch (err) {
      alert('❌ Ошибка: ' + err.message);
    }
    e.target.value = '';
  });

  document.getElementById('resetBtn')?.addEventListener('click', () => {
    if (!confirm('⚠️ Сбросить ВСЕ данные карточки?\nЭто действие необратимо.')) return;
    HeroStorage.clear(HeroState.heroId);
    location.reload();
  });
}

/* ============================================================
   ЗАГЛУШКИ ДЛЯ КНОПКИ «ДОБАВИТЬ ЗАКЛИНАНИЕ»
   ============================================================ */
function initSpellAdd() {
  document.getElementById('addSpellBtn')?.addEventListener('click', () => {
    HeroRender.openSpellAddModal();
  });
}

/* ============================================================
   СВОРАЧИВАЕМЫЕ БЛОКИ
   ============================================================ */
function initCollapsibleBlocks() {
  if (!HeroState.charData.uiState) HeroState.charData.uiState = {};
  if (!HeroState.charData.uiState.collapsed) HeroState.charData.uiState.collapsed = {};

  document.querySelectorAll('.collapsible-block').forEach(block => {
    const id = block.dataset.blockId;
    const header = block.querySelector('.collapsible-header');
    if (!header || !id) return;

    const isCollapsed = HeroState.charData.uiState.collapsed[id] !== false;
    block.classList.toggle('expanded', !isCollapsed);

    header.addEventListener('click', () => {
      const expanded = block.classList.toggle('expanded');
      HeroState.charData.uiState.collapsed[id] = !expanded;
      HeroState.save();
    });
  });
}

/* ============================================================
   ФИЛЬТРЫ ИНВЕНТАРЯ
   ============================================================ */
function initInventoryFilters() {
  document.querySelectorAll('#inventoryFilters .inv-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      HeroRender.setInventoryFilter(btn.dataset.filter);
    });
  });
}

/* ============================================================
   ПОЛЕЗНЫЕ МЕЛОЧИ: кошелёк, соц.статусы, гильдия
   ============================================================ */
function initInlineHandlers() {
  document.getElementById('walletInput')?.addEventListener('input', function() {
    HeroState.charData.wallet = parseInt(this.value) || 0;
    HeroState.save();
  });

  ['socialOriginSelect', 'socialCurrentSelect', 'socialInheritSelect'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', function() {
      HeroState.charData[id.replace('Select', '')] = this.value;
      HeroState.save();
    });
  });

  document.getElementById('guildRankSelect')?.addEventListener('change', function() {
    HeroState.charData.guildRank = this.value;
    HeroRender.guild();
    HeroState.save();
  });
  document.getElementById('guildProgressInput')?.addEventListener('input', function() {
    HeroState.charData.guildProgress = parseInt(this.value) || 0;
    HeroRender.guild();
    HeroState.save();
  });
  document.getElementById('guildTotalInput')?.addEventListener('input', function() {
    HeroState.charData.guildTotal = parseInt(this.value) || 1;
    HeroRender.guild();
    HeroState.save();
  });
}

/* ============================================================
   ИНИЦИАЛИЗАЦИЯ
   ============================================================ */
window.addEventListener('DOMContentLoaded', () => {
  const heroId = document.body.dataset.heroId || 'kael';
  HeroState.heroId = heroId;

  HeroState.charData = HeroStorage.load(heroId, KAEL_DEFAULTS);

  // Миграция статов (очки + синхронизация базы)
  if (HeroState.charData.stats) {
    HeroState.charData.stats.forEach(s => {
      if (s.points === undefined) s.points = 0;
      if (s.key === 'level') {
        if (s.base === undefined) s.base = s.value || 1;
      } else {
        if (s.base === undefined) s.base = (s.key === 'mana' ? 300 : 10);
      }
    });
  }

  // Миграция equippedBag — размер должен соответствовать библиотеке
  if (HeroState.charData.equippedBag && HeroState.charData.equippedBag.id) {
    const bagBase = window.ITEM_LIBRARY[HeroState.charData.equippedBag.id];
    if (bagBase && bagBase.type === 'bag') {
      HeroState.charData.equippedBag.size = bagBase.size;
      HeroState.charData.equippedBag.name = bagBase.name;
    }
  }

  HeroRender.all();

  initTabs();
  MusicPlayer.init();
  initActions();
  initSpellAdd();
  initCollapsibleBlocks();
  initInventoryFilters();
  initInlineHandlers();

  document.getElementById('stubCloseBtn')?.addEventListener('click', closeStubModal);
  document.getElementById('stubOkBtn')?.addEventListener('click', closeStubModal);
  document.getElementById('stubModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'stubModal') closeStubModal();
  });

  console.log('✅ Карточка «' + heroId + '» загружена. Ключ хранилища:', HeroStorage.key(heroId));
});