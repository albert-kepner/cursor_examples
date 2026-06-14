import * as THREE from "three";
import { EYE_HEIGHT, MAX_HEALTH } from "./player.js";

const MOVE_SPEED = 5;
const TURN_SPEED = 1.5;
const ENEMY_RADIUS = 0.6;
const SHOOT_COOLDOWN = 1.0;
const SHOOT_DAMAGE = 15;
const DETECT_RANGE = 28;
const ATTACK_RANGE = 22;
const PATROL_WAIT = 1.5;

export class Enemy {
  constructor(scene, startX, startZ) {
    this.x = startX;
    this.z = startZ;
    this.yaw = Math.PI;
    this.health = MAX_HEALTH;
    this.maxHealth = MAX_HEALTH;
    this.alive = true;
    this.shootCooldown = 0;
    this.state = "patrol";
    this.patrolTarget = { x: 5, z: 5 };
    this.waitTimer = 0;

    const bodyGeo = new THREE.BoxGeometry(1, 1.8, 0.6);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.6 });
    this.mesh = new THREE.Mesh(bodyGeo, bodyMat);
    this.mesh.castShadow = true;

    const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x922b21 });
    this.head = new THREE.Mesh(headGeo, headMat);
    this.head.position.y = 1.15;
    this.mesh.add(this.head);

    this.mesh.position.set(startX, 0.9, startZ);
    scene.add(this.mesh);

    this.patrolPoints = [
      { x: 8, z: 8 },
      { x: -8, z: 8 },
      { x: -8, z: -8 },
      { x: 8, z: -8 },
    ];
    this.patrolIndex = 0;
    this.patrolTarget = this.patrolPoints[0];
  }

  update(dt, player, arena) {
    if (!this.alive) return;

    if (this.shootCooldown > 0) this.shootCooldown -= dt;

    const dist = this.distanceTo(player.x, player.z);

    if (player.alive && dist < DETECT_RANGE) {
      this.state = dist < ATTACK_RANGE ? "attack" : "chase";
    } else {
      this.state = "patrol";
    }

    switch (this.state) {
      case "patrol":
        this.doPatrol(dt, arena);
        break;
      case "chase":
        this.doChase(dt, player, arena);
        break;
      case "attack":
        this.doAttack(dt, player, arena);
        break;
    }

    this.syncMesh();
  }

  doPatrol(dt, arena) {
    if (this.waitTimer > 0) {
      this.waitTimer -= dt;
      return;
    }

    const dx = this.patrolTarget.x - this.x;
    const dz = this.patrolTarget.z - this.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 1) {
      this.patrolIndex = (this.patrolIndex + 1) % this.patrolPoints.length;
      this.patrolTarget = this.patrolPoints[this.patrolIndex];
      this.waitTimer = PATROL_WAIT;
      return;
    }

    this.yaw = Math.atan2(dx, dz);
    const step = MOVE_SPEED * 0.6 * dt;
    this.tryMove(Math.sin(this.yaw) * step, Math.cos(this.yaw) * step, arena);
  }

  doChase(dt, player, arena) {
    const dx = player.x - this.x;
    const dz = player.z - this.z;
    this.yaw = Math.atan2(dx, dz);
    const step = MOVE_SPEED * dt;
    this.tryMove(Math.sin(this.yaw) * step, Math.cos(this.yaw) * step, arena);
  }

  doAttack(dt, player, arena) {
    const dx = player.x - this.x;
    const dz = player.z - this.z;
    this.yaw = Math.atan2(dx, dz);

    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist > ATTACK_RANGE * 0.7) {
      const step = MOVE_SPEED * 0.5 * dt;
      this.tryMove(Math.sin(this.yaw) * step, Math.cos(this.yaw) * step, arena);
    }
  }

  tryMove(dx, dz, arena) {
    const newX = this.x + dx;
    if (!arena.checkCollision(newX, this.z, ENEMY_RADIUS)) this.x = newX;

    const newZ = this.z + dz;
    if (!arena.checkCollision(this.x, newZ, ENEMY_RADIUS)) this.z = newZ;
  }

  canShoot() {
    return this.alive && this.shootCooldown <= 0;
  }

  shoot(player) {
    if (!this.canShoot() || !player.alive) return null;

    const dist = this.distanceTo(player.x, player.z);
    if (dist > ATTACK_RANGE) return null;

    this.shootCooldown = SHOOT_COOLDOWN;

    const origin = new THREE.Vector3(this.x, EYE_HEIGHT, this.z);
    const direction = new THREE.Vector3(
      player.x - this.x,
      0,
      player.z - this.z
    ).normalize();

    return { origin, direction, damage: SHOOT_DAMAGE, shooter: "enemy" };
  }

  takeDamage(amount) {
    if (!this.alive) return;
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) {
      this.alive = false;
      this.mesh.visible = false;
    }
  }

  distanceTo(px, pz) {
    const dx = px - this.x;
    const dz = pz - this.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  syncMesh() {
    this.mesh.position.set(this.x, 0.9, this.z);
    this.mesh.rotation.y = this.yaw;
  }

  reset(startX, startZ) {
    this.x = startX;
    this.z = startZ;
    this.yaw = Math.PI;
    this.health = MAX_HEALTH;
    this.alive = true;
    this.shootCooldown = 1;
    this.state = "patrol";
    this.patrolIndex = 0;
    this.patrolTarget = this.patrolPoints[0];
    this.waitTimer = 0;
    this.mesh.visible = true;
    this.syncMesh();
  }
}

export { ENEMY_RADIUS };
