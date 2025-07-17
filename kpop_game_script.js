// 기본 게임 상태
let score = 0;
let combo = 0;
let hp = 100;
let mp = 100;
let level = 1;
let isGameRunning = false;
let maxCombo = 0;
let demonsKilled = 0;

const musicTracks = ['Battle Theme #1', 'Stage Clear', 'Final Boss'];
let currentTrackIndex = 0;

const bgMusic = document.getElementById('bgMusic');
const trackTitle = document.getElementById('trackTitle');

// ==========================
// 음악 컨트롤
// ==========================
function loadTrack(index) {
    trackTitle.textContent = musicTracks[index];
    bgMusic.src = `audio/${musicTracks[index]}.mp3`; // 파일 위치에 맞게 수정
    bgMusic.play();
}

document.getElementById('playPauseBtn').addEventListener('click', () => {
    if (bgMusic.paused) {
        bgMusic.play();
        document.querySelector('#playPauseBtn i').className = 'fas fa-pause';
    } else {
        bgMusic.pause();
        document.querySelector('#playPauseBtn i').className = 'fas fa-play';
    }
});

document.getElementById('nextTrackBtn').addEventListener('click', () => {
    currentTrackIndex = (currentTrackIndex + 1) % musicTracks.length;
    loadTrack(currentTrackIndex);
});

document.getElementById('volumeSlider').addEventListener('input', (e) => {
    bgMusic.volume = e.target.value / 100;
});

// ==========================
// 게임 컨트롤
// ==========================
document.getElementById('startBtn').addEventListener('click', () => {
    if (!isGameRunning) {
        startGame();
    }
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    isGameRunning = !isGameRunning;
    // 실제 게임 로직에서는 타이머나 requestAnimationFrame을 정지/재시작
});

document.getElementById('resetBtn').addEventListener('click', () => {
    resetGame();
});

function startGame() {
    isGameRunning = true;
    loadTrack(currentTrackIndex);
    // 실제 게임 루프 시작
    console.log("Game started!");
}

function resetGame() {
    score = 0;
    combo = 0;
    hp = 100;
    mp = 100;
    level = 1;
    demonsKilled = 0;
    maxCombo = 0;
    updateUI();
    console.log("Game reset.");
}

function updateUI() {
    document.getElementById('gameScore').textContent = score;
    document.getElementById('currentLevel').textContent = level;
    document.getElementById('comboNumber').textContent = combo;
    document.getElementById('healthBar').style.width = `${hp}%`;
    document.getElementById('healthText').textContent = `${hp}/100`;
    document.getElementById('manaBar').style.width = `${mp}%`;
    document.getElementById('manaText').textContent = `${mp}/100`;
}

// ==========================
// 캐릭터 선택
// ==========================
document.querySelectorAll('.character-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.character-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        console.log(`캐릭터 선택됨: ${card.dataset.character}`);
    });
});

// ==========================
// 스킬 사용 및 쿨다운
// ==========================
function useSkill(skill) {
    if (!isGameRunning) return;

    const cooldown = document.getElementById(`${skill}Cooldown`);
    if (cooldown.classList.contains('cooling')) return;

    // 실행
    console.log(`${skill} 스킬 사용!`);

    // 예시 효과
    mp -= 10;
    combo += 1;
    score += 50;
    demonsKilled += 1;
    if (combo > maxCombo) maxCombo = combo;

    updateUI();
    cooldown.classList.add('cooling');
    cooldown.style.animation = 'cooldown 2s linear';

    setTimeout(() => {
        cooldown.classList.remove('cooling');
        cooldown.style.animation = 'none';
    }, 2000);
}

document.addEventListener('keydown', (e) => {
    switch (e.key.toUpperCase()) {
        case 'Z': useSkill('attack'); break;
        case 'X': useSkill('special'); break;
        case 'C': useSkill('ultimate'); break;
    }
});

// ==========================
// 업그레이드 시스템
// ==========================
let attackLevel = 1;
let defenseLevel = 1;
let speedLevel = 1;

document.getElementById('upgradeAttack').addEventListener('click', () => {
    attackLevel++;
    document.getElementById('attackLevel').textContent = attackLevel;
});

document.getElementById('upgradeDefense').addEventListener('click', () => {
    defenseLevel++;
    document.getElementById('defenseLevel').textContent = defenseLevel;
});

document.getElementById('upgradeSpeed').addEventListener('click', () => {
    speedLevel++;
    document.getElementById('speedLevel').textContent = speedLevel;
});

// ==========================
// 게임 오버 & 레벨 클리어
// ==========================
function gameOver() {
    isGameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('maxCombo').textContent = maxCombo;
    document.getElementById('demonsKilled').textContent = demonsKilled;
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('gameOverModal').style.display = 'block';
}

function levelClear() {
    level++;
    score += 1000;
    document.getElementById('clearedLevel').textContent = level - 1;
    document.getElementById('bonusScore').textContent = 1000;
    document.getElementById('levelClearModal').style.display = 'block';
    updateUI();
}

document.getElementById('nextLevelBtn').addEventListener('click', () => {
    document.getElementById('levelClearModal').style.display = 'none';
    startGame();
});

document.getElementById('playAgainBtn').addEventListener('click', () => {
    document.getElementById('gameOverModal').style.display = 'none';
    resetGame();
    startGame();
});
