import * as THREE from "three";

const canvas = document.getElementById("gameCanvas");

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: false,
  powerPreference: "high-performance"
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101820);
scene.fog = new THREE.Fog(0x101820, 220, 620);

const camera = new THREE.PerspectiveCamera(
  60,
  canvas.clientWidth / canvas.clientHeight,
  0.1,
  1200
);

const ambientLight = new THREE.AmbientLight(0xffffff, .55);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 1.1);
mainLight.position.set(120, 220, 120);
scene.add(mainLight);

const groundGeometry = new THREE.PlaneGeometry(2400, 1800);
const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x1d2b36 });

const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.set(1200, 0, 900);
scene.add(ground);

const gridHelper = new THREE.GridHelper(2400, 40, 0x2b3a47, 0x22303c);
gridHelper.position.set(1200, 0, 900);
scene.add(gridHelper);

const treeGeometry = new THREE.ConeGeometry(18, 45, 7);
const treeMaterial = new THREE.MeshLambertMaterial({ color: 0x2f7d4f });

const rockGeometry = new THREE.DodecahedronGeometry(12, 0);
const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x6b7280 });

for (let i = 0; i < 45; i++) {
  const tree = new THREE.Mesh(treeGeometry, treeMaterial);

  tree.position.set(
    Math.random() * 2200 + 100,
    22,
    Math.random() * 1600 + 100
  );

  tree.scale.setScalar(.8 + Math.random() * .8);
  scene.add(tree);
}

for (let i = 0; i < 25; i++) {
  const rock = new THREE.Mesh(rockGeometry, rockMaterial);

  rock.position.set(
    Math.random() * 2200 + 100,
    8,
    Math.random() * 1600 + 100
  );

  rock.rotation.set(
    Math.random(),
    Math.random(),
    Math.random()
  );

  rock.scale.setScalar(.7 + Math.random() * .9);
  scene.add(rock);
}

const arenaRing = new THREE.Mesh(
  new THREE.TorusGeometry(260, 8, 8, 48),
  new THREE.MeshBasicMaterial({ color: 0xffcc4d })
);

arenaRing.rotation.x = Math.PI / 2;
arenaRing.position.set(1200, 2, 900);
scene.add(arenaRing);

const bossPlatform = new THREE.Mesh(
  new THREE.CylinderGeometry(120, 140, 6, 32),
  new THREE.MeshLambertMaterial({ color: 0x2b3a47 })
);

bossPlatform.position.set(1200, 3, 900);
scene.add(bossPlatform);

function createFighter(color) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(14, 26, 6, 12),
    new THREE.MeshLambertMaterial({ color })
  );

  body.position.y = 30;
  group.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(11, 16, 12),
    new THREE.MeshLambertMaterial({ color: 0xf2d3b3 })
  );

  head.position.y = 58;
  group.add(head);

  const leftArm = new THREE.Mesh(
    new THREE.CapsuleGeometry(5, 20, 4, 8),
    new THREE.MeshLambertMaterial({ color })
  );

  leftArm.position.set(-18, 36, 0);
  group.add(leftArm);

  const rightArm = new THREE.Mesh(
    new THREE.CapsuleGeometry(5, 20, 4, 8),
    new THREE.MeshLambertMaterial({ color })
  );

  rightArm.position.set(18, 36, 0);
  group.add(rightArm);

  const leftLeg = new THREE.Mesh(
    new THREE.CapsuleGeometry(6, 22, 4, 8),
    new THREE.MeshLambertMaterial({ color: 0x222a33 })
  );

  leftLeg.position.set(-8, 10, 0);
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(
    new THREE.CapsuleGeometry(6, 22, 4, 8),
    new THREE.MeshLambertMaterial({ color: 0x222a33 })
  );

  rightLeg.position.set(8, 10, 0);
  group.add(rightLeg);

  group.userData.leftArm = leftArm;
  group.userData.rightArm = rightArm;
  group.userData.leftLeg = leftLeg;
  group.userData.rightLeg = rightLeg;

  return group;
}

let walkTime = 0;
let enemyWalkTime = 0;
let petBobTime = 0;

const player3D = createFighter(0xffcc4d);
scene.add(player3D);

const enemy3DList = new Map();
let boss3D = null;

const coinGeometry = new THREE.CylinderGeometry(9, 9, 3, 16);
const coinMaterial = new THREE.MeshLambertMaterial({ color: 0xffcc4d });
const coin3DList = new Map();

let reelRecorder = null;
let reelChunks = [];
let reelTimer = null;

const gun = new THREE.Mesh(
  new THREE.BoxGeometry(6, 4, 26),
  new THREE.MeshLambertMaterial({ color: 0x333333 })
);

gun.position.set(20, 40, 18);
player3D.add(gun);

const muzzleFlash = new THREE.Mesh(
  new THREE.SphereGeometry(6, 8, 8),
  new THREE.MeshBasicMaterial({ color: 0xffdd66 })
);

muzzleFlash.position.set(20, 40, 34);
muzzleFlash.visible = false;
player3D.add(muzzleFlash);

let muzzleTimer = 0;

const tracerMaterial = new THREE.MeshBasicMaterial({
  color: 0xffee88
});

const grenadeGeometry = new THREE.SphereGeometry(7, 10, 10);
const fragMaterial = new THREE.MeshLambertMaterial({ color: 0x2f4f2f });
const smokeMaterial = new THREE.MeshLambertMaterial({ color: 0x9aa7b4 });
const grenade3DList = new Map();

const zoneRing = new THREE.Mesh(
  new THREE.TorusGeometry(1, 6, 8, 64),
  new THREE.MeshBasicMaterial({ color: 0x4cc9f0 })
);

zoneRing.rotation.x = Math.PI / 2;
scene.add(zoneRing);

const petGeometry = new THREE.SphereGeometry(10, 12, 12);
const petMaterial = new THREE.MeshLambertMaterial({ color: 0x7ee787 });

const pet3D = new THREE.Mesh(petGeometry, petMaterial);
scene.add(pet3D);

const petEyeGeometry = new THREE.SphereGeometry(2, 8, 8);
const petEyeMaterial = new THREE.MeshBasicMaterial({ color: 0x10151b });

const petLeftEye = new THREE.Mesh(petEyeGeometry, petEyeMaterial);
petLeftEye.position.set(-4, 4, 8);
pet3D.add(petLeftEye);

const petRightEye = new THREE.Mesh(petEyeGeometry, petEyeMaterial);
petRightEye.position.set(4, 4, 8);
pet3D.add(petRightEye);

function syncObject(object, entity) {
  object.position.x = entity.x;
  object.position.z = entity.y;
}

function animateWalk(group, time, moving) {
  const leftArm = group.userData.leftArm;
  const rightArm = group.userData.rightArm;
  const leftLeg = group.userData.leftLeg;
  const rightLeg = group.userData.rightLeg;

  if (moving) {
    const swing = Math.sin(time * 10) * .7;

    leftArm.rotation.x = swing;
    rightArm.rotation.x = -swing;

    leftLeg.rotation.x = -swing;
    rightLeg.rotation.x = swing;
  } else {
    leftArm.rotation.x = 0;
    rightArm.rotation.x = 0;
    leftLeg.rotation.x = 0;
    rightLeg.rotation.x = 0;
  }
}

function animateAttack(group, attackTime, attackType) {
  const leftArm = group.userData.leftArm;
  const rightArm = group.userData.rightArm;
  const leftLeg = group.userData.leftLeg;
  const rightLeg = group.userData.rightLeg;

  if (attackTime > 0) {
    if (attackType === "special") {
      leftArm.rotation.x = -2.4;
      rightArm.rotation.x = -2.4;
      leftLeg.rotation.x = .3;
      rightLeg.rotation.x = -.3;
    } else if (attackType === "kick") {
      leftArm.rotation.x = -.5;
      rightArm.rotation.x = -.5;
      leftLeg.rotation.x = -1.4;
      rightLeg.rotation.x = .4;
      group.position.y = 6;
    } else {
      rightArm.rotation.x = -1.9;
      leftArm.rotation.x = .4;
      leftLeg.rotation.x = .2;
      rightLeg.rotation.x = -.2;
    }
  }
}

function startReelRecording() {
  if (reelRecorder) return;

  try {
    const stream = canvas.captureStream(30);

    reelChunks = [];

    reelRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm"
    });

    reelRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        reelChunks.push(event.data);
      }
    };

    reelRecorder.onstop = () => {
      const blob = new Blob(reelChunks, {
        type: "video/webm"
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "shubham-ji-reel.webm";
      link.click();

      URL.revokeObjectURL(url);
      reelRecorder = null;

      const reelButton = document.getElementById("saveReelButton");

      if (reelButton) {
        reelButton.classList.add("hidden");
      }
    };

    reelRecorder.start();

    reelTimer = setTimeout(() => {
      if (reelRecorder) {
        reelRecorder.stop();
      }
    }, 20000);
  } catch (error) {
    console.warn("Reel recording not supported:", error);
  }
}

function showVictoryText() {
  const victory = document.createElement("div");
  victory.className = "victory-text";

  victory.innerHTML = "<span>SHUBHAM JI WINS!</span>";

  document.querySelector(".arena").appendChild(victory);

  setTimeout(() => {
    victory.remove();
  }, 2500);
}

window.startReelRecording = startReelRecording;
window.showVictoryText = showVictoryText;

window.showMuzzleFlash = function () {
  muzzleFlash.visible = true;
  muzzleTimer = .07;
};

window.createGunTracer = function (startX, startZ, endX, endZ) {
  const direction = new THREE.Vector3(
    endX - startX,
    0,
    endZ - startZ
  );

  const distance = direction.length();

  const tracer = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, distance),
    tracerMaterial
  );

  tracer.position.set(
    (startX + endX) / 2,
    40,
    (startZ + endZ) / 2
  );

  tracer.lookAt(endX, 40, endZ);
  scene.add(tracer);

  setTimeout(() => {
    scene.remove(tracer);
  }, 80);
};

window.updateZoneVisual = function (zone) {
  zoneRing.position.set(zone.x, 2, zone.y);
  zoneRing.scale.set(zone.radius, zone.radius, 1);
};

window.syncGrenades = function (grenades) {
  for (const [grenade, mesh] of grenade3DList.entries()) {
    if (!grenades.includes(grenade)) {
      scene.remove(mesh);
      grenade3DList.delete(grenade);
    }
  }

  for (const grenade of grenades) {
    let mesh = grenade3DList.get(grenade);

    if (!mesh) {
      mesh = new THREE.Mesh(
        grenadeGeometry,
        grenade.type === "frag" ? fragMaterial : smokeMaterial
      );

      scene.add(mesh);
      grenade3DList.set(grenade, mesh);
    }

    mesh.position.set(grenade.x, 20, grenade.y);
  }
};

window.syncPet = function (pet) {
  petBobTime += .016;

  pet3D.position.x = pet.x;
  pet3D.position.z = pet.y;
  pet3D.position.y = 12 + Math.sin(petBobTime * 4) * 3;

  const angle = Math.atan2(player.y - pet.y, player.x - pet.x);
  pet3D.rotation.y = -angle + Math.PI / 2;
};

function render3D() {
  syncObject(player3D, player);

  player3D.rotation.y =
    -player.angle + Math.PI / 2;

  const playerMoving =
    keys.has("w") ||
    keys.has("a") ||
    keys.has("s") ||
    keys.has("d") ||
    keys.has("arrowup") ||
    keys.has("arrowleft") ||
    keys.has("arrowdown") ||
    keys.has("arrowright");

  if (player.attackTime > 0) {
    animateAttack(
      player3D,
      player.attackTime,
      player.attackType
    );
  } else {
    walkTime += .016;
    animateWalk(player3D, walkTime, playerMoving);
  }

  for (const enemy of state.enemies) {
    let enemy3D = enemy3DList.get(enemy);

    if (!enemy3D) {
      enemy3D = createFighter(0xff9f43);
      scene.add(enemy3D);
      enemy3DList.set(enemy, enemy3D);
    }

    syncObject(enemy3D, enemy);

    enemy3D.rotation.y =
      -Math.atan2(
        player.y - enemy.y,
        player.x - enemy.x
      ) + Math.PI / 2;

    enemyWalkTime += .016;
    animateWalk(enemy3D, enemyWalkTime, true);
  }

  for (const [enemy, mesh] of enemy3DList.entries()) {
    if (!state.enemies.includes(enemy)) {
      scene.remove(mesh);
      enemy3DList.delete(enemy);
    }
  }

  if (state.boss) {
    if (!boss3D) {
      boss3D = createFighter(0xff5a5a);
      boss3D.scale.setScalar(2);
      boss3D.rotation.z = .05;
      scene.add(boss3D);
    }

    syncObject(boss3D, state.boss);

    boss3D.rotation.y =
      -Math.atan2(
        player.y - state.boss.y,
        player.x - state.boss.x
      ) + Math.PI / 2;

    enemyWalkTime += .016;
    animateWalk(boss3D, enemyWalkTime, true);
  } else if (boss3D) {
    scene.remove(boss3D);
    boss3D = null;

    showVictoryText();

    const reelButton = document.getElementById("saveReelButton");

    if (reelButton) {
      reelButton.classList.remove("hidden");
    }

    startReelRecording();
  }

  for (const coin of state.coins) {
    let coin3D = coin3DList.get(coin);

    if (!coin3D) {
      coin3D = new THREE.Mesh(coinGeometry, coinMaterial);
      coin3D.rotation.x = Math.PI / 2;
      scene.add(coin3D);
      coin3DList.set(coin, coin3D);
    }

    syncObject(coin3D, coin);
    coin3D.position.y = 14;
    coin3D.rotation.z += .08;
  }

  for (const [coin, mesh] of coin3DList.entries()) {
    if (!state.coins.includes(coin)) {
      scene.remove(mesh);
      coin3DList.delete(coin);
    }
  }

  if (window.updateZoneVisual && state.zone) {
    window.updateZoneVisual(state.zone);
  }

  if (window.syncGrenades) {
    window.syncGrenades(state.grenades || []);
  }

  if (window.syncPet && player.pet) {
    window.syncPet(player.pet);
  }

  if (muzzleTimer > 0) {
    muzzleTimer -= .016;

    if (muzzleTimer <= 0) {
      muzzleFlash.visible = false;
    }
  }

  let cameraZoom = 1;

  if (state.slowMotion > 0) {
    cameraZoom = .82;
  }

  const targetX = player.x;
  const targetZ = player.y + 180 * cameraZoom;

  camera.position.x += (targetX - camera.position.x) * .08;
  camera.position.z += (targetZ - camera.position.z) * .08;
  camera.position.y = 190 * cameraZoom;

  camera.lookAt(player.x, 30, player.y);

  renderer.render(scene, camera);
}

window.render3D = render3D;

window.setPlayerSkin = function (color) {
  player3D.traverse(object => {
    if (
      object.isMesh &&
      object.material.color.getHex() !== 0xf2d3b3
    ) {
      object.material.color.setHex(color);
    }
  });
};

window.addEventListener("resize", () => {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
});