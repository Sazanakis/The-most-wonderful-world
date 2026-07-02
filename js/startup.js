/**
 * startup.js – управление стартовыми экранами и музыкой.
 * Версия 3.0 – музыка не останавливается после старта,
 *             затухает только при переходе на другую страницу.
 */
(function() {
    'use strict';

    console.log('startup.js загружен и выполняется');

    const startScreen = document.getElementById('startScreen');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const welcomeContent = document.getElementById('welcomeContent');
    const startBtn = document.getElementById('startBtn');
    const beginBtn = document.getElementById('beginBtn');
    const bgMusic = document.getElementById('bgMusic');
    const mainContainer = document.querySelector('.main-container');

    // Если элементы не найдены – сразу показываем главное меню
    if (!startScreen || !welcomeScreen || !welcomeContent || !startBtn || !beginBtn) {
        console.warn('Стартовые элементы не найдены. Запускаем игру напрямую.');
        if (mainContainer) mainContainer.classList.remove('hidden');
        if (typeof window.fullInit === 'function') window.fullInit();
        return;
    }

    // Если сессия уже начата – пропускаем заставку
    const sessionStarted = sessionStorage.getItem('gameSessionStarted');
    if (sessionStarted === 'true') {
        console.log('Сессия уже начата, пропускаем стартовые экраны');
        startScreen.classList.remove('visible');
        startScreen.classList.add('hidden');
        welcomeScreen.classList.remove('visible');
        welcomeScreen.classList.add('hidden');
        if (mainContainer) mainContainer.classList.remove('hidden');
        if (bgMusic && bgMusic.paused) {
            bgMusic.volume = 0.4;
            bgMusic.play().catch(() => {});
        }
        if (typeof window.fullInit === 'function') window.fullInit();
        return;
    }

    // Плавный переход между экранами
    function transitionTo(current, next, callback) {
        if (!current && !next) return;
        if (current) {
            current.classList.remove('visible');
            current.classList.add('hidden');
        }
        setTimeout(() => {
            if (next) {
                next.classList.remove('hidden');
                next.classList.add('visible');
                if (next === welcomeScreen && welcomeContent) {
                    welcomeContent.classList.add('visible');
                }
                if (callback) callback();
            }
        }, 800);
    }

    // Запуск фоновой музыки
    function playMusic() {
        if (bgMusic && bgMusic.paused) {
            bgMusic.volume = 0.4;
            bgMusic.play().catch(e => console.warn('Музыка не загружена:', e));
        }
    }

    // Глобальная функция для затухания музыки и перехода по ссылке
    window.stopMusicAndNavigate = function(url) {
        if (!bgMusic) {
            window.location.href = url;
            return;
        }
        const fadeOut = setInterval(() => {
            if (bgMusic.volume > 0.05) {
                bgMusic.volume = Math.max(0, bgMusic.volume - 0.05);
            } else {
                clearInterval(fadeOut);
                bgMusic.pause();
                bgMusic.currentTime = 0;
                window.location.href = url;
            }
        }, 50);
    };

    // Стартовое состояние: начальный экран видим, приветствие скрыто, меню скрыто
    startScreen.classList.add('visible');
    startScreen.classList.remove('hidden');
    welcomeScreen.classList.remove('visible');
    welcomeScreen.classList.add('hidden');
    if (mainContainer) mainContainer.classList.add('hidden');

    // Кнопка «Начать» на первом экране
    startBtn.addEventListener('click', function() {
        playMusic();
        transitionTo(startScreen, welcomeScreen);
    });

    // Кнопка «Вступить в игру» на приветственном экране
    beginBtn.addEventListener('click', function() {
        sessionStorage.setItem('gameSessionStarted', 'true');
        // Музыка НЕ останавливается, просто скрываем экраны и показываем меню
        welcomeScreen.classList.remove('visible');
        welcomeScreen.classList.add('hidden');
        startScreen.classList.remove('visible');
        startScreen.classList.add('hidden');
        if (mainContainer) mainContainer.classList.remove('hidden');
        if (typeof window.fullInit === 'function') window.fullInit();
    });

    console.log('✅ Стартовые экраны готовы (музыка продолжается после старта)');
})();