const canvas = document.getElementById("gameCanvas");

const overlay = document.getElementById("overlay");
const startBtn = document.getElementById("startBtn");
const healthBar = document.getElementById("healthBar");
const healthValue = document.getElementById("healthValue");
const specialBar = document.getElementById("specialBar");
const comboValue = document.getElementById("comboValue");
const blockValue = document.getElementById("blockValue");
const dodgeValue = document.getElementById("dodgeValue");
const levelValue = document.getElementById("levelValue");
const coinValue = document.getElementById("coinValue");
const enemyValue = document.getElementById("enemyValue");
const coinHud = document.getElementById("coinHud");
const bossBar = document.getElementById("bossBar");
const bossName = document.getElementById("bossName");
const bossHealth = document.getElementById("bossHealth");
const actionMessage = document.getElementById("actionMessage");
const soundBtn = document.getElementById("soundBtn");
const ammoValue = document.getElementById("ammoValue");

const shopOverlay = document.getElementById("shopOverlay");
const shopButton = document.getElementById("shopButton");
const closeShop = document.getElementById("closeShop");
const shopCoins = document.getElementById("shopCoins");

// Phase 11: Daily Rewards + Achievements
const rewardPopup = document.getElementById("rewardPopup");
const rewardTitle = document.getElementById("rewardTitle");
const rewardText = document.getElementById("rewardText");
const claimReward = document.getElementById("claimReward");
const achievementPopup = document.getElementById("achievementPopup");
const achievementText = document.getElementById("achievementText");

// Phase 12: Leaderboard
const leaderboardButton = document.getElementById("leaderboardButton");
const leaderboardOverlay = document.getElementById("leaderboardOverlay");
const closeLeaderboard = document.getElementById("closeLeaderboard");
const leaderboardList = document.getElementById("leaderboardList");

// Phase 20: Loading + Settings
const loadingScreen = document.getElementById("loadingScreen");
const loadingFill = document.getElementById("loadingFill");
const loadingText = document.getElementById("loadingText");
const settingsButton = document.getElementById("settingsButton");
const settingsOverlay = document.getElementById("settingsOverlay");
const closeSettings = document.getElementById("closeSettings");
const musicToggle = document.getElementById("musicToggle");
const sfxToggle = document.getElementById("sfxToggle");
const sensitivity = document.getElementById("sensitivity");

const WORLD = { width: 4000, height: 3000 };
const keys = new Set();
const player2Keys = new Set();

const player = {
  x: WORLD.width / 2,
  y: WORLD.height / 2,
  radius: 20,
  speed: 260,
  health: 100,
  maxHealth: 100,
  coins: 0,
  level: 1,
  angle: 0,
  combo: 0,
  comboTimer: 0,
  attackCooldown: 0,
  attackType: null,
  attackTime: 0,
  blockTime: 0,
  blockCooldown: 0,
  dodgeTime: 0,
  dodgeCooldown: 0,
  specialEnergy: 0,
  invincible: 0,
  damage: 18,
  weapons: {
    pistol: { ammo: 12, reserve: 48, unlocked: true },
    rifle: { ammo: 0, reserve: 0, unlocked: false },
    shotgun: { ammo: 0, reserve: 0, unlocked: false },
    sniper: { ammo: 0, reserve: 0, unlocked: false }
  },
  activeWeapon: "pistol",
  fireCooldown: 0,
  reloadTime: 0,
  pet: {
    unlocked: true,
    level: 1,
    type: "dog",
    x: WORLD.width / 2,
    y: WORLD.height / 2,
    healTimer: 30,
    coinRange: 120
  }
};

// Phase 16: Player 2
const player2 = {
  x: WORLD.width / 2 - 100,
  y: WORLD.height / 2,
  radius: 20,
  speed: 260,
  health: 100,
  maxHealth: 100,
  coins: 0,
  level: 1,
  angle: 0,
  combo: 0,
  comboTimer: 0,
  attackCooldown: 0,
  attackType: null,
  attackTime: 0,
  blockTime: 0,
  blockCooldown: 0,
  dodgeTime: 0,
  dodgeCooldown: 0,
  specialEnergy: 0,
  invincible: 0,
  damage: 18,
  activeWeapon: "pistol",
  fireCooldown: 0,
  reloadTime: 0,
  weapons: {
    pistol: { ammo: 12, reserve: 48, unlocked: true }
  }
};

const state = {
  running: false,
  ended: false,
  lastFrame: 0,
  elapsed: 0,
  enemies: [],
  coins: [],
  particles: [],
  boss: null,
  enemiesToSpawn: 0,
  spawnTimer: 0,
  muted: false,
  audio: null,
  shake: 0,
  slowMotion: 0,
  message: "",
  messageTimer: 0,
  levelTransition: false,
  weaponCrates: [],
  powerups: [],
  activePowerup: null,
  powerupTimer: 0
};

const shopPrices = {
  health: 100,
  damage: 150,
  speed: 120,
  special: 200
};

const upgrades = {
  health: 0,
  damage: 0,
  speed: 0,
  special: 0
};

const WEAPONS = {
  pistol: { name: "PISTOL", damage: 22, fireRate: .35, range: 420, magazine: 12, reloadTime: 1.1, spread: .04, pellets: 1 },
  rifle: { name: "RIFLE", damage: 18, fireRate: .14, range: 620, magazine: 30, reloadTime: 1.6, spread: .05, pellets: 1 },
  shotgun: { name: "SHOTGUN", damage: 14, fireRate: .8, range: 220, magazine: 6, reloadTime: 1.9, spread: .22, pellets: 6 },
  sniper: { name: "SNIPER", damage: 95, fireRate: 1.4, range: 900, magazine: 5, reloadTime: 2.4, spread: .01, pellets: 1 }
};

// Phase 11: Daily Rewards + Achievements
const DAILY_REWARDS = [50, 100, 200, 300, 500, 750, 1000];

const ACHIEVEMENTS = {
  firstBlood: { name: "FIRST BLOOD", desc: "Pehla enemy maaro" },
  bossSlayer: { name: "BOSS SLAYER", desc: "Pehla boss harao" },
  coinCollector: { name: "COIN COLLECTOR", desc: "500 coins collect karo" },
  petMaster: { name: "PET MASTER", desc: "Pet level 5 karo" },
  survivor: { name: "SURVIVOR", desc: "10 levels clear karo" },
  gunCollector: { name: "GUN COLLECTOR", desc: "Saare 4 guns unlock karo" }
};

function loadProgress() {
  const saved = localStorage.getItem("shubhamJiProgress");
  return saved ? JSON.parse(saved) : {
    streak: 0,
    lastClaim: null,
    achievements: []
  };
}

function saveProgress(progress) {
  localStorage.setItem("shubhamJiProgress", JSON.stringify(progress));
}

function checkDailyReward() {
  const progress = loadProgress();
  const today = new Date().toDateString();

  if (progress.lastClaim === today) return;

  const yesterday = new Date(Date.now() - 86400000).toDateString();

  progress.streak = progress.lastClaim === yesterday
    ? progress.streak + 1
    : 1;

  if (progress.streak > 7) progress.streak = 7;

  const reward = DAILY_REWARDS[progress.streak - 1];

  rewardTitle.textContent = `DAY ${progress.streak}`;
  rewardText.textContent = `+${reward} COINS`;
  rewardPopup.classList.remove("hidden");

  claimReward.onclick = () => {
    player.coins += reward;
    progress.lastClaim = today;
    saveProgress(progress);
    saveGame();
    updateHud();
    rewardPopup.classList.add("hidden");
    showMessage(`+${reward} COINS CLAIMED!`, 1.5);
    playSound(700, .15);
  };
}

function unlockAchievement(key) {
  const progress = loadProgress();

  if (progress.achievements.includes(key)) return;

  progress.achievements.push(key);
  saveProgress(progress);

  achievementText.textContent =
    `ACHIEVEMENT UNLOCKED — ${ACHIEVEMENTS[key].name}!`;

  achievementPopup.classList.remove("hidden");

  setTimeout(() => {
    achievementPopup.classList.add("hidden");
  }, 2500);

  playSound(800, .2);
}

function checkAchievements() {
  if (player.coins >= 500) {
    unlockAchievement("coinCollector");
  }

  if (player.pet.level >= 5) {
    unlockAchievement("petMaster");
  }

  if (player.level >= 10) {
    unlockAchievement("survivor");
  }

  const allGuns = Object.values(player.weapons).every(w => w.unlocked);

  if (allGuns) {
    unlockAchievement("gunCollector");
  }
}

// Phase 12: Leaderboard
function getLeaderboard() {
  const saved = localStorage.getItem("shubhamJiLeaderboard");
  return saved ? JSON.parse(saved) : [];
}

function saveLeaderboardEntry() {
  const board = getLeaderboard();

  board.push({
    level: player.level,
    coins: player.coins,
    date: new Date().toLocaleDateString()
  });

  board.sort((a, b) =>
    (b.level * 1000 + b.coins) - (a.level * 1000 + a.coins)
  );

  localStorage.setItem(
    "shubhamJiLeaderboard",
    JSON.stringify(board.slice(0, 5))
  );
}

function renderLeaderboard() {
  const board = getLeaderboard();

  if (!leaderboardList) return;

  if (board.length === 0) {
    leaderboardList.innerHTML =
      '<div class="leaderboard-empty">Abhi koi score nahi — game khelo!</div>';
    return;
  }

  leaderboardList.innerHTML = board.map((entry, index) => `
    <div class="leaderboard-row">
      <span class="rank">#${index + 1}</span>
      <span>LVL ${entry.level} · ${entry.coins} COINS</span>
      <span class="score">${entry.level * 1000 + entry.coins}</span>
    </div>
  `).join("");
}

if (leaderboardButton) {
  leaderboardButton.addEventListener("click", () => {
    renderLeaderboard();
    leaderboardOverlay.classList.remove("hidden");
  });
}

if (closeLeaderboard) {
  closeLeaderboard.addEventListener("click", () => {
    leaderboardOverlay.classList.add("hidden");
  });
}

// Phase 14: House Cover + River Slow
const HOUSES = [];
const RIVER = { x: 2000, y: 1500, width: 4000, height: 120 };

function initCoverZones() {
  for (let i = 0; i < 8; i++) {
    HOUSES.push({
      x: Math.random() * 3400 + 300,
      y: Math.random() * 2400 + 300,
      radius: 60
    });
  }
}

function isNearHouse(x, y) {
  return HOUSES.some(h =>
    Math.hypot(x - h.x, y - h.y) < h.radius
  );
}

function isInRiver(x, y) {
  return (
    Math.abs(y - RIVER.y) < RIVER.height / 2 &&
    x > 0 && x < RIVER.width
  );
}

initCoverZones();

// Phase 18: Map Variety
const BIOMES = {
  jungle: { name: "JUNGLE" },
  desert: { name: "DESERT" },
  snow: { name: "SNOW" },
  city: { name: "CITY" }
};

let currentBiome = "jungle";

function getRandomBiome() {
  const keys = Object.keys(BIOMES);
  return keys[Math.floor(Math.random() * keys.length)];
}

// Phase 19: Power-ups
const POWERUPS = {
  speed: { name: "SPEED BOOST", color: "#4cc9f0", duration: 10 },
  shield: { name: "SHIELD", color: "#7ee787", duration: 10 },
  doubleDamage: { name: "DOUBLE DAMAGE", color: "#ff5a5a", duration: 10 }
};

function spawnPowerup() {
  const types = Object.keys(POWERUPS);
  const type = types[Math.floor(Math.random() * types.length)];

  state.powerups.push({
    x: Math.random() * WORLD.width,
    y: Math.random() * WORLD.height,
    type,
    collected: false
  });
}

function activatePowerup(type) {
  state.activePowerup = type;
  state.powerupTimer = POWERUPS[type].duration;

  showMessage(`${POWERUPS[type].name} ACTIVATED!`, 1.5);
  playSound(800, .2, "triangle");
}

function updatePowerups(dt) {
  if (state.elapsed % 15 < dt && state.powerups.length < 3) {
    spawnPowerup();
  }

  for (let i = state.powerups.length - 1; i >= 0; i--) {
    const pu = state.powerups[i];
    const distance = Math.hypot(player.x - pu.x, player.y - pu.y);

    if (distance < 50 && !pu.collected) {
      pu.collected = true;
      state.powerups.splice(i, 1);
      activatePowerup(pu.type);
      createParticles(pu.x, pu.y, POWERUPS[pu.type].color, 20);
    }
  }

  if (state.activePowerup) {
    state.powerupTimer -= dt;

    if (state.powerupTimer <= 0) {
      showMessage(`${POWERUPS[state.activePowerup].name} ENDED`);
      state.activePowerup = null;
    }
  }
}

function getPowerupSpeedMultiplier() {
  return state.activePowerup === "speed" ? 1.6 : 1;
}

function getPowerupDamageMultiplier() {
  return state.activePowerup === "doubleDamage" ? 2 : 1;
}

// Phase 15: Sound + Music
let musicOscillators = [];
let musicGain = null;
let musicPlaying = false;
let musicEnabled = true;
let sfxEnabled = true;

function startBackgroundMusic() {
  if (musicPlaying || state.muted || !musicEnabled) return;

  try {
    state.audio ||= new AudioContext();

    musicGain = state.audio.createGain();
    musicGain.gain.value = .03;
    musicGain.connect(state.audio.destination);

    const notes = [220, 277, 330, 440, 330, 277];
    let noteIndex = 0;

    const playNote = () => {
      if (!musicPlaying) return;

      const osc = state.audio.createOscillator();
      const gain = state.audio.createGain();

      osc.type = "triangle";
      osc.frequency.value = notes[noteIndex % notes.length];

      gain.gain.setValueAtTime(.02, state.audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, state.audio.currentTime + .4);

      osc.connect(gain);
      gain.connect(musicGain);

      osc.start();
      osc.stop(state.audio.currentTime + .4);

      musicOscillators.push(osc);
      noteIndex++;

      setTimeout(playNote, 450);
    };

    musicPlaying = true;
    playNote();
  } catch (error) {
    console.warn("Music error:", error);
  }
}

function stopBackgroundMusic() {
  musicPlaying = false;
  musicOscillators = [];

  if (musicGain) {
    musicGain.disconnect();
    musicGain = null;
  }
}

function playHitSound() {
  playSound(140, .12, "sawtooth");
}

function playVictoryJingle() {
  const notes = [523, 659, 784, 1047];

  notes.forEach((freq, i) => {
    setTimeout(() => playSound(freq, .25, "triangle"), i * 180);
  });
}

function playGunShotSound() {
  playSound(180, .06, "square");
  playSound(90, .1, "sawtooth");
}

function saveGame() {
  localStorage.setItem("shubhamJiSave", JSON.stringify({
    coins: player.coins,
    level: player.level,
    damage: player.damage,
    maxHealth: player.maxHealth,
    speed: player.speed,
    activeWeapon: player.activeWeapon,
    weapons: player.weapons,
    pet: player.pet
  }));
}

function loadGame() {
  const save = localStorage.getItem("shubhamJiSave");
  if (!save) return;

  const data = JSON.parse(save);

  player.coins = data.coins || 0;
  player.level = data.level || 1;
  player.damage = data.damage || 18;
  player.maxHealth = data.maxHealth || 100;
  player.speed = data.speed || 260;
  player.health = player.maxHealth;

  if (data.weapons) {
    for (const key in player.weapons) {
      if (data.weapons[key]) {
        player.weapons[key] = data.weapons[key];
      }
    }
  }

  if (data.activeWeapon && player.weapons[data.activeWeapon]?.unlocked) {
    player.activeWeapon = data.activeWeapon;
  }

  if (data.pet) {
    player.pet = {
      unlocked: data.pet.unlocked ?? true,
      level: data.pet.level || 1,
      type: data.pet.type || "dog",
      x: player.x,
      y: player.y,
      healTimer: 30,
      coinRange: 120 + (data.pet.level - 1) * 30
    };
  }
}

function saveUpgrades() {
  localStorage.setItem("shubhamJiUpgrades", JSON.stringify(upgrades));
}

function loadUpgrades() {
  const saved = localStorage.getItem("shubhamJiUpgrades");
  if (!saved) return;

  const data = JSON.parse(saved);

  upgrades.health = data.health || 0;
  upgrades.damage = data.damage || 0;
  upgrades.speed = data.speed || 0;
  upgrades.special = data.special || 0;

  player.maxHealth = 100 + upgrades.health * 20;
  player.damage = 18 + upgrades.damage * 4;
  player.speed = 260 + upgrades.speed * 15;
  player.health = player.maxHealth;
}

function showMessage(text, time = 1.2) {
  state.message = text;
  state.messageTimer = time;
}

function playSound(frequency, duration = .08, type = "square") {
  if (state.muted || !sfxEnabled) return;

  try {
    state.audio ||= new AudioContext();

    const osc = state.audio.createOscillator();
    const gain = state.audio.createGain();

    osc.type = type;
    osc.frequency.value = frequency;

    gain.gain.setValueAtTime(.04, state.audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, state.audio.currentTime + duration);

    osc.connect(gain);
    gain.connect(state.audio.destination);

    osc.start();
    osc.stop(state.audio.currentTime + duration);
  } catch (error) {
    console.warn("Audio error:", error);
  }
}

function createParticles(x, y, color, count = 12) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 80 + Math.random() * 220;

    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: .4 + Math.random() * .3,
      color
    });
  }
}

// Phase 17: Boss Variety
function spawnEnemy(isBoss = false) {
  const side = Math.floor(Math.random() * 4);
  let x;
  let y;

  if (side === 0) {
    x = Math.random() * WORLD.width;
    y = 70;
  } else if (side === 1) {
    x = WORLD.width - 70;
    y = Math.random() * WORLD.height;
  } else if (side === 2) {
    x = Math.random() * WORLD.width;
    y = WORLD.height - 70;
  } else {
    x = 70;
    y = Math.random() * WORLD.height;
  }

  if (isBoss) {
    const bossTypes = ["fast", "tank", "ranged"];
    const bossType = bossTypes[Math.floor(Math.random() * 3)];

    const bossConfig = {
      fast: { health: 250 + player.level * 50, speed: 180, damage: 14, radius: 28, color: "#ff9f43" },
      tank: { health: 500 + player.level * 100, speed: 70, damage: 25, radius: 42, color: "#ff5a5a" },
      ranged: { health: 300 + player.level * 60, speed: 100, damage: 16, radius: 30, color: "#4cc9f0" }
    };

    const config = bossConfig[bossType];

    state.boss = {
      x,
      y,
      radius: config.radius,
      health: config.health,
      maxHealth: config.health,
      speed: config.speed,
      damage: config.damage,
      isBoss: true,
      bossType,
      attackCooldown: 1.5,
      shootCooldown: 2,
      color: config.color,
      knockX: 0,
      knockY: 0
    };

    const bossNames = {
      fast: "FAST BOSS",
      tank: "TANK BOSS",
      ranged: "RANGED BOSS"
    };

    bossName.textContent = `LEVEL ${player.level} — ${bossNames[bossType]}`;
    bossBar.classList.add("active");

    return;
  }

  state.enemies.push({
    x,
    y,
    radius: 17,
    health: 55 + player.level * 8,
    maxHealth: 55 + player.level * 8,
    speed: 85 + player.level * 3,
    damage: 10 + player.level,
    isBoss: false,
    hasGun: true,
    shootCooldown: 2 + Math.random() * 2,
    attackCooldown: 1 + Math.random(),
    color: "#ff9f43",
    knockX: 0,
    knockY: 0
  });
}

function spawnWeaponCrate() {
  const weapons = ["rifle", "shotgun", "sniper"];
  const randomWeapon = weapons[Math.floor(Math.random() * weapons.length)];

  state.weaponCrates.push({
    x: Math.random() * WORLD.width,
    y: Math.random() * WORLD.height,
    weapon: randomWeapon,
    opened: false
  });
}

function startLevel() {
  state.enemies = [];
  state.coins = [];
  state.particles = [];
  state.boss = null;
  state.levelTransition = false;
  state.weaponCrates = [];
  state.powerups = [];

  bossBar.classList.remove("active");

  player.x = WORLD.width / 2;
  player.y = WORLD.height / 2;
  player.health = player.maxHealth;
  player.combo = 0;
  player.specialEnergy = 0;

  player.pet.x = player.x;
  player.pet.y = player.y;

  player2.x = WORLD.width / 2 - 100;
  player2.y = WORLD.height / 2;
  player2.health = player2.maxHealth;

  state.enemiesToSpawn = 4 + player.level * 2;
  state.spawnTimer = .5;

  // Phase 18: Biome change
  currentBiome = getRandomBiome();

  if (window.applyBiome) {
    window.applyBiome(currentBiome);
  }

  showMessage(`MAP: ${BIOMES[currentBiome].name} — LEVEL ${player.level}`, 1.5);

  if (player.level > 1) {
    spawnWeaponCrate();
  }

  if (player.level % 3 === 0) {
    spawnEnemy(true);
    showMessage(`LEVEL ${player.level} — BOSS FIGHT!`, 2);
  }

  updateHud();
}

function resetGame() {
  state.running = true;
  state.ended = false;
  state.elapsed = 0;

  overlay.classList.add("hidden");
  startBtn.textContent = "PLAY AGAIN";

  startBackgroundMusic();
  startLevel();
}

function updateHud() {
  healthValue.textContent = Math.ceil(player.health);
  healthBar.style.width = `${Math.max(0, player.health / player.maxHealth * 100)}%`;
  specialBar.style.width = `${player.specialEnergy}%`;

  comboValue.textContent = player.combo;
  coinValue.textContent = player.coins;
  coinHud.textContent = player.coins;
  levelValue.textContent = player.level;

  enemyValue.textContent =
    state.enemies.length +
    state.enemiesToSpawn +
    (state.boss ? 1 : 0);

  blockValue.textContent =
    player.blockCooldown > 0
      ? `${Math.ceil(player.blockCooldown)}s`
      : "READY";

  dodgeValue.textContent =
    player.dodgeCooldown > 0
      ? `${Math.ceil(player.dodgeCooldown)}s`
      : "READY";

  if (ammoValue) {
    const gun = player.weapons[player.activeWeapon];
    ammoValue.textContent = `${gun.ammo}/${gun.reserve}`;
  }

  if (state.boss) {
    bossHealth.style.width = `${Math.max(
      0,
      state.boss.health / state.boss.maxHealth * 100
    )}%`;
  }

  if (shopCoins) {
    shopCoins.textContent = player.coins;
  }
}

function attack(type) {
  if (!state.running || player.attackCooldown > 0) return;

  if (type === "special") {
    if (player.specialEnergy < 100) {
      showMessage("SPECIAL NOT READY");
      return;
    }

    player.specialEnergy = 0;
    player.attackCooldown = .8;
    player.attackType = "special";
    player.attackTime = .3;
    state.shake = .5;
    state.slowMotion = .8;

    createParticles(player.x, player.y, "#4cc9f0", 35);
    playSound(90, .35, "sawtooth");
    showMessage("SHUBHAM JI SPECIAL!", 1);

    for (const enemy of [...state.enemies]) {
      damageEnemy(enemy, player.damage * 3, true);
    }

    if (state.boss) {
      damageEnemy(state.boss, player.damage * 3, true);
    }

    return;
  }

  player.attackCooldown = type === "punch" ? .28 : .45;
  player.attackType = type;
  player.attackTime = .16;

  player.combo++;
  player.comboTimer = 1.6;
  player.specialEnergy = Math.min(100, player.specialEnergy + 8);

  const range = type === "punch" ? 52 : 68;
  const damage =
    (type === "punch" ? player.damage : player.damage * 1.6) *
    getPowerupDamageMultiplier();

  playSound(type === "punch" ? 260 : 180, .06);

  let hit = false;

  for (const enemy of [...state.enemies]) {
    const distance = Math.hypot(
      enemy.x - player.x,
      enemy.y - player.y
    );

    if (distance < range + enemy.radius) {
      damageEnemy(enemy, damage, false);
      hit = true;
    }
  }

  if (state.boss) {
    const bossDistance = Math.hypot(
      state.boss.x - player.x,
      state.boss.y - player.y
    );

    if (bossDistance < range + state.boss.radius) {
      damageEnemy(state.boss, damage, false);
      hit = true;
    }
  }

  if (hit) {
    state.shake = .12;

    createParticles(
      player.x + Math.cos(player.angle) * 40,
      player.y + Math.sin(player.angle) * 40,
      "#ffcc4d",
      8
    );
  }
}

function shootGun() {
  if (!state.running) return;
  if (player.fireCooldown > 0 || player.reloadTime > 0) return;

  const weapon = WEAPONS[player.activeWeapon];
  const gunAmmo = player.weapons[player.activeWeapon];

  if (gunAmmo.ammo <= 0) {
    reloadGun();
    return;
  }

  gunAmmo.ammo--;
  player.fireCooldown = weapon.fireRate;

  for (let i = 0; i < weapon.pellets; i++) {
    const spread = (Math.random() - .5) * weapon.spread;
    const angle = player.angle + spread;

    const targetX = player.x + Math.cos(angle) * weapon.range;
    const targetY = player.y + Math.sin(angle) * weapon.range;

    let hitEnemy = null;

    for (const enemy of state.enemies) {
      const distance = Math.hypot(enemy.x - player.x, enemy.y - player.y);

      if (distance > weapon.range) continue;

      const enemyAngle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
      const angleDiff = Math.abs(angle - enemyAngle);

      if (angleDiff < .18) {
        hitEnemy = enemy;
        break;
      }
    }

    if (state.boss) {
      const bossDistance = Math.hypot(state.boss.x - player.x, state.boss.y - player.y);

      if (bossDistance <= weapon.range) {
        const bossAngle = Math.atan2(state.boss.y - player.y, state.boss.x - player.x);
        const bossAngleDiff = Math.abs(angle - bossAngle);

        if (bossAngleDiff < .22) {
          hitEnemy = state.boss;
        }
      }
    }

    if (hitEnemy) {
      damageEnemy(hitEnemy, weapon.damage * getPowerupDamageMultiplier(), false);
      createParticles(hitEnemy.x, hitEnemy.y, "#ffffff", 6);
    }

    if (window.createGunTracer) {
      window.createGunTracer(
        player.x,
        player.y,
        hitEnemy ? hitEnemy.x : targetX,
        hitEnemy ? hitEnemy.y : targetY
      );
    }
  }

  state.shake = .15;
  playGunShotSound();

  if (window.showMuzzleFlash) {
    window.showMuzzleFlash();
  }

  updateHud();
}

function reloadGun() {
  const weapon = WEAPONS[player.activeWeapon];
  const gunAmmo = player.weapons[player.activeWeapon];

  if (
    player.reloadTime > 0 ||
    gunAmmo.ammo >= weapon.magazine ||
    gunAmmo.reserve <= 0
  ) {
    return;
  }

  player.reloadTime = weapon.reloadTime;
  showMessage("RELOADING...");

  setTimeout(() => {
    const need = weapon.magazine - gunAmmo.ammo;
    const load = Math.min(need, gunAmmo.reserve);

    gunAmmo.ammo += load;
    gunAmmo.reserve -= load;

    player.reloadTime = 0;
    showMessage("RELOADED!");
    updateHud();
  }, weapon.reloadTime * 1000);
}

function switchGun() {
  const order = ["pistol", "rifle", "shotgun", "sniper"];
  const currentIndex = order.indexOf(player.activeWeapon);

  for (let i = 1; i <= 4; i++) {
    const next = order[(currentIndex + i) % 4];

    if (player.weapons[next].unlocked) {
      player.activeWeapon = next;
      showMessage(`${WEAPONS[next].name} SELECTED`);
      updateHud();
      return;
    }
  }
}

function damageEnemy(enemy, damage, knockback) {
  enemy.health -= damage;

  if (knockback) {
    const angle = Math.atan2(enemy.y - player.y, enemy.x - player.x);

    enemy.knockX = Math.cos(angle) * 320;
    enemy.knockY = Math.sin(angle) * 320;
  }

  createParticles(enemy.x, enemy.y, "#ffffff", 6);
  playHitSound();

  if (enemy.health <= 0) {
    unlockAchievement("firstBlood");

    if (enemy.isBoss) {
      unlockAchievement("bossSlayer");

      state.boss = null;
      bossBar.classList.remove("active");

      player.coins += 100;
      state.slowMotion = 1.5;
      state.shake = .8;

      showMessage("BOSS DEFEATED!", 2);
      playVictoryJingle();
      createParticles(enemy.x, enemy.y, "#ffcc4d", 60);
      playSound(70, .5, "sawtooth");

      nextLevel();
    } else {
      const index = state.enemies.indexOf(enemy);

      if (index !== -1) {
        state.enemies.splice(index, 1);
      }

      player.coins += 10;
      createParticles(enemy.x, enemy.y, "#ffcc4d", 18);
      state.coins.push({
        x: enemy.x,
        y: enemy.y,
        value: 10
      });
    }

    saveGame();
  }

  updateHud();
}

function nextLevel() {
  if (state.levelTransition) return;

  state.levelTransition = true;

  player.level++;
  player.damage += 3;
  player.maxHealth += 10;
  player.health = player.maxHealth;

  showMessage(`LEVEL ${player.level - 1} COMPLETE!`, 1.5);

  saveGame();

  setTimeout(() => {
    if (state.running) {
      startLevel();
    }
  }, 1600);
}

function damagePlayer(amount) {
  if (player.invincible > 0) return;

  if (player.blockTime > 0) {
    amount *= .25;
    showMessage("BLOCKED!");
    playSound(320, .05);
  }

  // Phase 19: Shield
  if (state.activePowerup === "shield") {
    amount *= .5;
    showMessage("SHIELD BLOCKED HALF!");
  }

  player.health -= amount;
  player.combo = 0;
  player.invincible = .35;
  state.shake = .25;

  createParticles(player.x, player.y, "#ff5a5a", 10);
  playSound(120, .1);

  if (player.health <= 0) {
    finishGame(false);
  }

  updateHud();
}

function finishGame(won) {
  state.running = false;
  state.ended = true;

  saveLeaderboardEntry();

  overlay.classList.remove("hidden");

  const title = document.querySelector(".intro-card h1");
  const text = document.querySelector(".intro-card p");

  title.innerHTML = won
    ? 'VICTORY<br /><span>SHUBHAM JI!</span>'
    : 'GAME OVER<br /><span>TRY AGAIN</span>';

  text.textContent = won
    ? `Tumne Level ${player.level} clear kar diya!`
    : `Tum Level ${player.level} mein haar gaye. Coins: ${player.coins}`;

  startBtn.innerHTML = 'PLAY AGAIN <span>→</span>';

  stopBackgroundMusic();
}

function updatePet(dt) {
  const pet = player.pet;

  if (!pet || !pet.unlocked) return;

  const dx = player.x - pet.x;
  const dy = player.y - pet.y;
  const distance = Math.hypot(dx, dy);

  if (distance > 70) {
    const angle = Math.atan2(dy, dx);

    const typeSpeed = pet.type === "dragon" ? 260 : pet.type === "cat" ? 230 : 200;
    const petSpeed = typeSpeed + pet.level * 20;

    pet.x += Math.cos(angle) * petSpeed * dt;
    pet.y += Math.sin(angle) * petSpeed * dt;
  }

  for (let i = state.coins.length - 1; i >= 0; i--) {
    const coin = state.coins[i];
    const coinDistance = Math.hypot(pet.x - coin.x, pet.y - coin.y);

    if (coinDistance < pet.coinRange) {
      player.coins += coin.value;
      state.coins.splice(i, 1);

      createParticles(coin.x, coin.y, "#ffcc4d", 10);
      playSound(660, .07);

      saveGame();
      updateHud();
    }
  }

  pet.healTimer -= dt;

  if (pet.healTimer <= 0) {
    pet.healTimer = 30;

    if (player.health < player.maxHealth) {
      player.health = Math.min(
        player.maxHealth,
        player.health + 10 + pet.level * 5
      );

      createParticles(player.x, player.y, "#7ee787", 14);
      showMessage("PET HEAL!", 1);
      playSound(560, .1);
      updateHud();
    }
  }
}

// Phase 16: Player 2 functions
function player2Attack(type) {
  if (!state.running || player2.attackCooldown > 0) return;

  player2.attackCooldown = type === "punch" ? .28 : .45;
  player2.attackType = type;
  player2.attackTime = .16;
  player2.combo++;
  player2.comboTimer = 1.6;

  const range = type === "punch" ? 52 : 68;
  const damage = type === "punch" ? player2.damage : player2.damage * 1.6;

  let hit = false;

  for (const enemy of [...state.enemies]) {
    const distance = Math.hypot(enemy.x - player2.x, enemy.y - player2.y);

    if (distance < range + enemy.radius) {
      damageEnemy(enemy, damage, false);
      hit = true;
    }
  }

  if (hit) {
    state.shake = .12;
    playSound(260, .06);
  }
}

function player2Shoot() {
  if (!state.running || player2.fireCooldown > 0 || player2.reloadTime > 0) return;

  const gunAmmo = player2.weapons[player2.activeWeapon];

  if (gunAmmo.ammo <= 0) {
    player2Reload();
    return;
  }

  gunAmmo.ammo--;
  player2.fireCooldown = .35;

  const angle = player2.angle;
  const targetX = player2.x + Math.cos(angle) * 420;
  const targetY = player2.y + Math.sin(angle) * 420;

  let hitEnemy = null;

  for (const enemy of state.enemies) {
    const distance = Math.hypot(enemy.x - player2.x, enemy.y - player2.y);

    if (distance > 420) continue;

    const enemyAngle = Math.atan2(enemy.y - player2.y, enemy.x - player2.x);
    const angleDiff = Math.abs(angle - enemyAngle);

    if (angleDiff < .18) {
      hitEnemy = enemy;
      break;
    }
  }

  if (hitEnemy) {
    damageEnemy(hitEnemy, 22, false);
  }

  if (window.createGunTracer) {
    window.createGunTracer(
      player2.x,
      player2.y,
      hitEnemy ? hitEnemy.x : targetX,
      hitEnemy ? hitEnemy.y : targetY
    );
  }

  state.shake = .15;
  playGunShotSound();
  updateHud();
}

function player2Reload() {
  const gunAmmo = player2.weapons[player2.activeWeapon];

  if (player2.reloadTime > 0 || gunAmmo.ammo >= 12 || gunAmmo.reserve <= 0) return;

  player2.reloadTime = 1.1;
  showMessage("P2 RELOADING...");

  setTimeout(() => {
    const need = 12 - gunAmmo.ammo;
    const load = Math.min(need, gunAmmo.reserve);

    gunAmmo.ammo += load;
    gunAmmo.reserve -= load;
    player2.reloadTime = 0;
    updateHud();
  }, 1100);
}

function player2SwitchGun() {
  showMessage("P2: SIRF PISTOL HAI");
}

function player2Block() {
  if (!state.running || player2.blockCooldown > 0) return;

  player2.blockTime = .8;
  player2.blockCooldown = 2.5;
  showMessage("P2 BLOCK!");
  playSound(420, .07);
}

function player2Dodge() {
  if (!state.running || player2.dodgeCooldown > 0) return;

  player2.dodgeTime = .22;
  player2.dodgeCooldown = 2;
  player2.invincible = .3;
  showMessage("P2 DODGE!");
  playSound(520, .08);
}

function update(dt) {
  state.elapsed += dt;
  state.shake = Math.max(0, state.shake - dt);
  state.slowMotion = Math.max(0, state.slowMotion - dt);
  state.messageTimer = Math.max(0, state.messageTimer - dt);

  player.attackCooldown = Math.max(0, player.attackCooldown - dt);
  player.attackTime = Math.max(0, player.attackTime - dt);
  player.blockTime = Math.max(0, player.blockTime - dt);
  player.blockCooldown = Math.max(0, player.blockCooldown - dt);
  player.dodgeTime = Math.max(0, player.dodgeTime - dt);
  player.dodgeCooldown = Math.max(0, player.dodgeCooldown - dt);
  player.invincible = Math.max(0, player.invincible - dt);
  player.comboTimer = Math.max(0, player.comboTimer - dt);
  player.fireCooldown = Math.max(0, player.fireCooldown - dt);

  if (player.comboTimer <= 0) {
    player.combo = 0;
  }

  let dx =
    Number(keys.has("d")) -
    Number(keys.has("a"));

  let dy =
    Number(keys.has("s")) -
    Number(keys.has("w"));

  const moveLength = Math.hypot(dx, dy);

  if (moveLength) {
    dx /= moveLength;
    dy /= moveLength;

    player.angle = Math.atan2(dy, dx);

    const speed =
      (player.dodgeTime > 0
        ? player.speed * 2.6
        : player.speed) * getPowerupSpeedMultiplier();

    player.x += dx * speed * dt;
    player.y += dy * speed * dt;
  }

  player.x = Math.max(30, Math.min(WORLD.width - 30, player.x));
  player.y = Math.max(30, Math.min(WORLD.height - 30, player.y));

  // Phase 14: River slow + House cover
  if (isInRiver(player.x, player.y)) {
    player.x += dx * player.speed * .4 * dt;
    player.y += dy * player.speed * .4 * dt;
  }

  if (isNearHouse(player.x, player.y)) {
    player.invincible = Math.max(player.invincible, .1);
  }

  updatePet(dt);

  // Phase 16: Player 2 movement
  let p2dx =
    Number(player2Keys.has("arrowright")) -
    Number(player2Keys.has("arrowleft"));

  let p2dy =
    Number(player2Keys.has("arrowdown")) -
    Number(player2Keys.has("arrowup"));

  const p2MoveLength = Math.hypot(p2dx, p2dy);

  if (p2MoveLength) {
    p2dx /= p2MoveLength;
    p2dy /= p2MoveLength;

    player2.angle = Math.atan2(p2dy, p2dx);

    const p2Speed =
      player2.dodgeTime > 0 ? player2.speed * 2.6 : player2.speed;

    player2.x += p2dx * p2Speed * dt;
    player2.y += p2dy * p2Speed * dt;
  }

  player2.x = Math.max(30, Math.min(WORLD.width - 30, player2.x));
  player2.y = Math.max(30, Math.min(WORLD.height - 30, player2.y));

  player2.attackCooldown = Math.max(0, player2.attackCooldown - dt);
  player2.attackTime = Math.max(0, player2.attackTime - dt);
  player2.blockTime = Math.max(0, player2.blockTime - dt);
  player2.blockCooldown = Math.max(0, player2.blockCooldown - dt);
  player2.dodgeTime = Math.max(0, player2.dodgeTime - dt);
  player2.dodgeCooldown = Math.max(0, player2.dodgeCooldown - dt);
  player2.invincible = Math.max(0, player2.invincible - dt);
  player2.fireCooldown = Math.max(0, player2.fireCooldown - dt);

  // Phase 19: Powerups
  updatePowerups(dt);

  if (state.enemiesToSpawn > 0) {
    state.spawnTimer -= dt;

    if (state.spawnTimer <= 0) {
      spawnEnemy();
      state.enemiesToSpawn--;
      state.spawnTimer = 1.1;
    }
  }

  for (const enemy of state.enemies) {
    enemy.x += enemy.knockX * dt;
    enemy.y += enemy.knockY * dt;

    enemy.knockX *= .88;
    enemy.knockY *= .88;

    // Phase 16: Enemy targets closer player
    const targetPlayer =
      Math.hypot(player2.x - enemy.x, player2.y - enemy.y) <
      Math.hypot(player.x - enemy.x, player.y - enemy.y)
        ? player2
        : player;

    const angle = Math.atan2(
      targetPlayer.y - enemy.y,
      targetPlayer.x - enemy.x
    );

    const distance = Math.hypot(
      targetPlayer.x - enemy.x,
      targetPlayer.y - enemy.y
    );

    if (distance > enemy.radius + targetPlayer.radius + 6) {
      enemy.x += Math.cos(angle) * enemy.speed * dt;
      enemy.y += Math.sin(angle) * enemy.speed * dt;
    }

    enemy.attackCooldown -= dt;

    if (
      distance < enemy.radius + targetPlayer.radius + 10 &&
      enemy.attackCooldown <= 0
    ) {
      if (targetPlayer === player) {
        damagePlayer(enemy.damage);
      }

      enemy.attackCooldown = 1.1;
    }

    // Phase 13: Enemy gun
    if (enemy.hasGun) {
      enemy.shootCooldown -= dt;

      if (
        enemy.shootCooldown <= 0 &&
        distance < 500 &&
        distance > 60
      ) {
        enemy.shootCooldown = 2.5 + Math.random() * 2;

        const playerCovered = isNearHouse(player.x, player.y);
        const effectiveChance = playerCovered ? .1 : .35;

        if (targetPlayer === player && Math.random() < effectiveChance) {
          damagePlayer(enemy.damage * .6);
          showMessage("ENEMY SHOT YOU!");
        }

        if (window.createGunTracer) {
          window.createGunTracer(
            enemy.x,
            enemy.y,
            targetPlayer.x,
            targetPlayer.y
          );
        }
      }
    }
  }

  // Phase 17: Boss update
  if (state.boss) {
    const boss = state.boss;

    const angle = Math.atan2(
      player.y - boss.y,
      player.x - boss.x
    );

    const distance = Math.hypot(
      player.x - boss.x,
      player.y - boss.y
    );

    if (boss.bossType === "fast" && distance < 300 && boss.attackCooldown <= 0) {
      boss.knockX = Math.cos(angle) * 600;
      boss.knockY = Math.sin(angle) * 600;
      boss.attackCooldown = 3;
      showMessage("FAST BOSS DASH!");
    }

    if (boss.bossType === "ranged") {
      boss.shootCooldown -= dt;

      if (boss.shootCooldown <= 0 && distance < 600) {
        boss.shootCooldown = 1.8;

        if (!isNearHouse(player.x, player.y) && Math.random() < .4) {
          damagePlayer(boss.damage);
          showMessage("RANGED BOSS SHOT!");
        }

        if (window.createGunTracer) {
          window.createGunTracer(boss.x, boss.y, player.x, player.y);
        }
      }
    }

    boss.x += boss.knockX * dt;
    boss.y += boss.knockY * dt;
    boss.knockX *= .9;
    boss.knockY *= .9;

    if (distance > boss.radius + player.radius + 10) {
      boss.x += Math.cos(angle) * boss.speed * dt;
      boss.y += Math.sin(angle) * boss.speed * dt;
    }

    boss.attackCooldown -= dt;

    if (
      distance < boss.radius + player.radius + 14 &&
      boss.attackCooldown <= 0 &&
      boss.bossType !== "ranged"
    ) {
      damagePlayer(boss.damage);
      boss.attackCooldown = 1.4;
    }
  }

  for (let i = state.coins.length - 1; i >= 0; i--) {
    const coin = state.coins[i];

    const distance = Math.hypot(
      player.x - coin.x,
      player.y - coin.y
    );

    if (distance < 45) {
      player.coins += coin.value;
      state.coins.splice(i, 1);

      createParticles(coin.x, coin.y, "#ffcc4d", 10);
      playSound(660, .07);

      saveGame();
      updateHud();
    }
  }

  for (let i = state.weaponCrates.length - 1; i >= 0; i--) {
    const crate = state.weaponCrates[i];
    const distance = Math.hypot(player.x - crate.x, player.y - crate.y);

    if (distance < 50 && !crate.opened) {
      crate.opened = true;
      player.weapons[crate.weapon].unlocked = true;
      player.weapons[crate.weapon].ammo = WEAPONS[crate.weapon].magazine;
      player.weapons[crate.weapon].reserve = WEAPONS[crate.weapon].magazine * 3;

      showMessage(`${WEAPONS[crate.weapon].name} UNLOCKED!`);
      createParticles(crate.x, crate.y, "#4cc9f0", 20);
      playSound(700, .15);

      state.weaponCrates.splice(i, 1);
      updateHud();
    }
  }

  if (
    state.running &&
    !state.levelTransition &&
    state.enemiesToSpawn === 0 &&
    state.enemies.length === 0 &&
    !state.boss
  ) {
    nextLevel();
  }

  for (let i = state.particles.length - 1; i >= 0; i--) {
    const particle = state.particles[i];

    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;

    particle.vx *= .94;
    particle.vy *= .94;
    particle.life -= dt;

    if (particle.life <= 0) {
      state.particles.splice(i, 1);
    }
  }

  actionMessage.textContent =
    state.messageTimer > 0 ? state.message : "";

  updateHud();
}

function gameLoop(timestamp) {
  const dt = Math.min(
    (timestamp - state.lastFrame) / 1000 || 0,
    .04
  );

  state.lastFrame = timestamp;

  if (state.running) {
    update(dt);
  }

  if (window.render3D) {
    window.render3D();
  }

  requestAnimationFrame(gameLoop);
}

function setMove(direction, down) {
  const map = {
    up: "w",
    left: "a",
    down: "s",
    right: "d"
  };

  if (down) {
    keys.add(map[direction]);
  } else {
    keys.delete(map[direction]);
  }
}

window.addEventListener("keydown", event => {
  const key = event.key.toLowerCase();

  if (
    ["arrowup", "arrowdown", "arrowleft", "arrowright", " "]
      .includes(key)
  ) {
    event.preventDefault();
  }

  keys.add(key);

  if (key.startsWith("arrow")) {
    player2Keys.add(key);
  }

  if (event.repeat) return;

  if (key === "j") attack("punch");
  if (key === "k") attack("kick");
  if (key === "l") block();
  if (key === "shift") dodge();
  if (key === " ") attack("special");
  if (key === "f") shootGun();
  if (key === "r") reloadGun();
  if (key === "q") switchGun();

  // Phase 16: Player 2 controls
  if (key === "1") player2Shoot();
  if (key === "2") player2Reload();
  if (key === "3") player2SwitchGun();
  if (key === "4") player2Block();
  if (key === "5") player2Dodge();
  if (key === "6") player2Attack("punch");
  if (key === "7") player2Attack("kick");
  if (key === "8") player2Attack("special");

  if ((key === "enter" || key === " ") && !state.running) {
    resetGame();
  }
});

window.addEventListener("keyup", event => {
  const key = event.key.toLowerCase();

  keys.delete(key);
  player2Keys.delete(key);
});

function block() {
  if (!state.running || player.blockCooldown > 0) return;

  player.blockTime = .8;
  player.blockCooldown = 2.5;

  showMessage("BLOCK!");
  playSound(420, .07);
}

function dodge() {
  if (!state.running || player.dodgeCooldown > 0) return;

  player.dodgeTime = .22;
  player.dodgeCooldown = 2;
  player.invincible = .3;

  showMessage("DODGE!");
  createParticles(player.x, player.y, "#4cc9f0", 14);
  playSound(520, .08);
}

document.querySelectorAll("[data-move]").forEach(button => {
  const direction = button.dataset.move;

  button.addEventListener("pointerdown", event => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    setMove(direction, true);
  });

  for (const name of [
    "pointerup",
    "pointercancel",
    "lostpointercapture"
  ]) {
    button.addEventListener(name, () => {
      setMove(direction, false);
    });
  }
});

document.getElementById("punchButton").addEventListener("pointerdown", event => {
  event.preventDefault();
  attack("punch");
});

document.getElementById("kickButton").addEventListener("pointerdown", event => {
  event.preventDefault();
  attack("kick");
});

document.getElementById("blockButton").addEventListener("pointerdown", event => {
  event.preventDefault();
  block();
});

document.getElementById("dodgeButton").addEventListener("pointerdown", event => {
  event.preventDefault();
  dodge();
});

document.getElementById("specialButton").addEventListener("pointerdown", event => {
  event.preventDefault();
  attack("special");
});

const fireGunButton = document.getElementById("fireGunButton");

if (fireGunButton) {
  fireGunButton.addEventListener("pointerdown", event => {
    event.preventDefault();
    shootGun();
  });
}

const reloadGunButton = document.getElementById("reloadGunButton");

if (reloadGunButton) {
  reloadGunButton.addEventListener("pointerdown", event => {
    event.preventDefault();
    reloadGun();
  });
}

const switchGunButton = document.getElementById("switchGunButton");

if (switchGunButton) {
  switchGunButton.addEventListener("pointerdown", event => {
    event.preventDefault();
    switchGun();
  });
}

soundBtn.addEventListener("click", () => {
  state.muted = !state.muted;
  soundBtn.textContent = state.muted ? "×" : "♪";

  if (state.muted) {
    stopBackgroundMusic();
  } else if (state.running) {
    startBackgroundMusic();
  }
});

startBtn.addEventListener("click", resetGame);

if (shopButton) {
  shopButton.addEventListener("click", () => {
    if (shopOverlay) {
      shopOverlay.classList.remove("hidden");
    }

    if (shopCoins) {
      shopCoins.textContent = player.coins;
    }
  });
}

if (closeShop) {
  closeShop.addEventListener("click", () => {
    if (shopOverlay) {
      shopOverlay.classList.add("hidden");
    }
  });
}

document.querySelectorAll("[data-upgrade]").forEach(button => {
  button.addEventListener("click", () => {
    const type = button.dataset.upgrade;
    const price = shopPrices[type];

    if (player.coins < price) {
      showMessage("ENOUGH COINS NAHI HAIN");
      return;
    }

    player.coins -= price;
    upgrades[type]++;
    shopPrices[type] += 50;

    if (type === "health") {
      player.maxHealth += 20;
      player.health = player.maxHealth;
    }

    if (type === "damage") {
      player.damage += 4;
    }

    if (type === "speed") {
      player.speed += 15;
    }

    if (type === "special") {
      player.specialEnergy = 100;
    }

    saveGame();
    saveUpgrades();
    updateHud();

    showMessage("UPGRADE SUCCESSFUL!");
    playSound(700, .12);
  });
});

document.querySelectorAll("[data-skin]").forEach(button => {
  button.addEventListener("click", () => {
    const skinColor =
      button.dataset.skin === "gold"
        ? 0xffcc4d
        : 0x4cc9f0;

    const price = skinColor === 0xffcc4d ? 500 : 750;

    if (player.coins < price) {
      showMessage("ENOUGH COINS NAHI HAIN");
      return;
    }

    player.coins -= price;

    if (window.setPlayerSkin) {
      window.setPlayerSkin(skinColor);
    }

    saveGame();
    updateHud();

    showMessage("SKIN UNLOCKED!");
    playSound(800, .15);
  });
});

document.querySelectorAll("[data-pet]").forEach(button => {
  button.addEventListener("click", () => {
    const price = 300;

    if (player.coins < price) {
      showMessage("ENOUGH COINS NAHI HAIN");
      return;
    }

    player.coins -= price;
    player.pet.level++;
    player.pet.coinRange = 120 + (player.pet.level - 1) * 30;

    saveGame();
    updateHud();

    showMessage(`PET LEVEL ${player.pet.level}!`, 1.5);
    playSound(760, .15);
  });
});

// Phase 14: Pet type switch
document.querySelectorAll("[data-pet-type]").forEach(button => {
  button.addEventListener("click", () => {
    const type = button.dataset.petType;
    const price = type === "dragon" ? 1000 : type === "cat" ? 600 : 0;

    if (player.coins < price) {
      showMessage("ENOUGH COINS NAHI HAIN");
      return;
    }

    player.coins -= price;
    player.pet.type = type;

    saveGame();
    updateHud();

    showMessage(`${type.toUpperCase()} PET SELECTED!`, 1.5);
    playSound(760, .15);
  });
});

// Phase 20: Settings
if (settingsButton) {
  settingsButton.addEventListener("click", () => {
    settingsOverlay.classList.remove("hidden");
  });
}

if (closeSettings) {
  closeSettings.addEventListener("click", () => {
    settingsOverlay.classList.add("hidden");
  });
}

if (musicToggle) {
  musicToggle.addEventListener("click", () => {
    musicEnabled = !musicEnabled;
    musicToggle.textContent = musicEnabled ? "ON" : "OFF";
    musicToggle.classList.toggle("active", musicEnabled);

    if (!musicEnabled) {
      stopBackgroundMusic();
    } else if (state.running) {
      startBackgroundMusic();
    }
  });
}

if (sfxToggle) {
  sfxToggle.addEventListener("click", () => {
    sfxEnabled = !sfxEnabled;
    sfxToggle.textContent = sfxEnabled ? "ON" : "OFF";
    sfxToggle.classList.toggle("active", sfxEnabled);
    state.muted = !sfxEnabled;
  });
}

// Phase 20: Loading
function simulateLoading() {
  let progress = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 20;

    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);

      loadingText.textContent = "READY!";

      setTimeout(() => {
        loadingScreen.classList.add("hidden");
      }, 500);
    }

    loadingFill.style.width = `${progress}%`;
  }, 200);
}

simulateLoading();

// Phase 11: Start checks
checkDailyReward();

setInterval(() => {
  if (state.running) {
    checkAchievements();
  }
}, 2000);

loadGame();
loadUpgrades();
updateHud();

const saveReelButton = document.getElementById("saveReelButton");

if (saveReelButton) {
  saveReelButton.addEventListener("click", () => {
    if (window.startReelRecording) {
      window.startReelRecording();
      showMessage("REEL RECORDING STARTED!", 1.5);
    }
  });
}

requestAnimationFrame(gameLoop);