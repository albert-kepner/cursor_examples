import * as THREE from "three";
import { createArena, checkCollision } from "./arena.js";
import { Player } from "./player.js";
import { Enemy } from "./enemy.js";
import { fireRaycast, createMuzzleFlash, createTracer } from "./combat.js";
import {
  updateHUD,
  showMenu,
  showGameOver,
  hideOverlay,
  flashShoot,
  flashHit,
} from "./hud.js";

const canvas = document.getElementById("game-canvas");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a28);
scene.fog = new THREE.Fog(0x1a1a28, 30, 55);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

scene.add(new THREE.AmbientLight(0x606080, 0.6));

const sun = new THREE.DirectionalLight(0xfff0dd, 1.0);
sun.position.set(15, 25, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 60;
sun.shadow.camera.left = -25;
sun.shadow.camera.right = 25;
sun.shadow.camera.top = 25;
sun.shadow.camera.bottom = -25;
scene.add(sun);

const arenaData = createArena(scene);
const arena = {
  ...arenaData,
  checkCollision: (x, z, r) =>
    checkCollision(x, z, r, arenaData.obstacles, arenaData.bounds),
};

const player = new Player(0, -16, 0);
const enemy = new Enemy(scene, 0, 16);

const keys = {};
let enterPressed = false;
let gameState = "menu";
let lastTime = 0;
let enemyShootTimer = 0;

window.addEventListener("keydown", (e) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
    e.preventDefault();
  }
  keys[e.code] = true;
  if (e.code === "Enter") enterPressed = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function resetGame() {
  player.reset(0, -16, 0);
  enemy.reset(0, 16);
  enemyShootTimer = 0.5;
  hideOverlay();
  gameState = "playing";
}

function handleInput() {
  if (enterPressed) {
    enterPressed = false;
    if (gameState === "menu" || gameState === "gameover") {
      resetGame();
    }
  }
}

function updatePlaying(dt) {
  player.update(dt, keys, arena);
  enemy.update(dt, player, arena);
  player.syncCamera(camera);

  if (keys.Space && player.canShoot()) {
    const shot = player.shoot();
    if (shot) {
      flashShoot();
      createMuzzleFlash(scene, shot.origin, shot.direction);
      createTracer(scene, shot.origin, shot.direction, 0x44aaff);
      if (fireRaycast(shot, enemy.mesh, enemy)) {
        createMuzzleFlash(scene, enemy.mesh.position.clone().add(new THREE.Vector3(0, 1, 0)), shot.direction);
      }
    }
  }

  enemyShootTimer -= dt;
  if (enemyShootTimer <= 0 && enemy.state === "attack") {
    enemyShootTimer = 0.3;
    const shot = enemy.shoot(player);
    if (shot) {
      createMuzzleFlash(scene, shot.origin, shot.direction);
      createTracer(scene, shot.origin, shot.direction, 0xff4444);
      if (fireRaycast(shot, playerMesh, playerProxy)) {
        flashHit();
      }
    }
  }

  updateHUD(player, enemy);

  if (!player.alive) {
    gameState = "gameover";
    showGameOver(false);
  } else if (!enemy.alive) {
    gameState = "gameover";
    showGameOver(true);
  }
}

const playerProxy = {
  get alive() { return player.alive; },
  takeDamage(amount) { player.takeDamage(amount); },
};

const playerMesh = new THREE.Group();
const hitbox = new THREE.Mesh(
  new THREE.CylinderGeometry(0.5, 0.5, 1.8, 8),
  new THREE.MeshBasicMaterial({ visible: false })
);
hitbox.position.y = 0.9;
playerMesh.add(hitbox);
playerMesh.visible = false;
scene.add(playerMesh);

function gameLoop(time) {
  requestAnimationFrame(gameLoop);
  const dt = Math.min((time - lastTime) / 1000, 0.05);
  lastTime = time;

  handleInput();

  if (gameState === "playing") {
    playerMesh.position.set(player.x, 0, player.z);
    playerMesh.rotation.y = player.yaw;
    updatePlaying(dt);
  }

  renderer.render(scene, camera);
}

showMenu();
requestAnimationFrame(gameLoop);
