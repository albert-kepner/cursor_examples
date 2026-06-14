import * as THREE from "three";

const MOVE_SPEED = 8;
const TURN_SPEED = 2.2;
const EYE_HEIGHT = 1.6;
const PLAYER_RADIUS = 0.5;
const SHOOT_COOLDOWN = 0.4;
const SHOOT_DAMAGE = 25;
const MAX_HEALTH = 100;

export class Player {
  constructor(startX, startZ, startYaw) {
    this.x = startX;
    this.z = startZ;
    this.yaw = startYaw;
    this.health = MAX_HEALTH;
    this.maxHealth = MAX_HEALTH;
    this.alive = true;
    this.shootCooldown = 0;
  }

  update(dt, keys, arena) {
    if (!this.alive) return;

    if (keys.ArrowLeft) this.yaw -= TURN_SPEED * dt;
    if (keys.ArrowRight) this.yaw += TURN_SPEED * dt;

    let dx = 0;
    let dz = 0;
    if (keys.ArrowUp) {
      dx += Math.sin(this.yaw) * MOVE_SPEED * dt;
      dz += Math.cos(this.yaw) * MOVE_SPEED * dt;
    }
    if (keys.ArrowDown) {
      dx -= Math.sin(this.yaw) * MOVE_SPEED * dt;
      dz -= Math.cos(this.yaw) * MOVE_SPEED * dt;
    }

    this.tryMove(dx, dz, arena);

    if (this.shootCooldown > 0) this.shootCooldown -= dt;
  }

  tryMove(dx, dz, arena) {
    const { checkCollision } = arena;
    const newX = this.x + dx;
    if (!checkCollision(newX, this.z, PLAYER_RADIUS)) this.x = newX;

    const newZ = this.z + dz;
    if (!checkCollision(this.x, newZ, PLAYER_RADIUS)) this.z = newZ;
  }

  canShoot() {
    return this.alive && this.shootCooldown <= 0;
  }

  shoot() {
    if (!this.canShoot()) return null;
    this.shootCooldown = SHOOT_COOLDOWN;

    const origin = new THREE.Vector3(this.x, EYE_HEIGHT, this.z);
    const direction = new THREE.Vector3(
      Math.sin(this.yaw),
      0,
      Math.cos(this.yaw)
    ).normalize();

    return { origin, direction, damage: SHOOT_DAMAGE, shooter: "player" };
  }

  takeDamage(amount) {
    if (!this.alive) return;
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) this.alive = false;
  }

  syncCamera(camera) {
    camera.position.set(this.x, EYE_HEIGHT, this.z);
    camera.rotation.order = "YXZ";
    camera.rotation.y = this.yaw + Math.PI;
    camera.rotation.x = 0;
    camera.rotation.z = 0;
  }

  reset(startX, startZ, startYaw) {
    this.x = startX;
    this.z = startZ;
    this.yaw = startYaw;
    this.health = MAX_HEALTH;
    this.alive = true;
    this.shootCooldown = 0;
  }
}

export { EYE_HEIGHT, PLAYER_RADIUS, MAX_HEALTH };
