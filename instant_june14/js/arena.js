import * as THREE from "three";

const ARENA_SIZE = 40;
const WALL_HEIGHT = 4;
const WALL_THICKNESS = 0.5;

export function createArena(scene) {
  const obstacles = [];
  const half = ARENA_SIZE / 2;

  const floorGeo = new THREE.PlaneGeometry(ARENA_SIZE, ARENA_SIZE);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a35,
    roughness: 0.9,
    metalness: 0.1,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const gridHelper = new THREE.GridHelper(ARENA_SIZE, 20, 0x444466, 0x333344);
  gridHelper.position.y = 0.01;
  scene.add(gridHelper);

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x3d3d50,
    roughness: 0.8,
    metalness: 0.2,
  });

  const walls = [
    { w: ARENA_SIZE, h: WALL_HEIGHT, d: WALL_THICKNESS, x: 0, z: -half },
    { w: ARENA_SIZE, h: WALL_HEIGHT, d: WALL_THICKNESS, x: 0, z: half },
    { w: WALL_THICKNESS, h: WALL_HEIGHT, d: ARENA_SIZE, x: -half, z: 0 },
    { w: WALL_THICKNESS, h: WALL_HEIGHT, d: ARENA_SIZE, x: half, z: 0 },
  ];

  for (const w of walls) {
    const geo = new THREE.BoxGeometry(w.w, w.h, w.d);
    const mesh = new THREE.Mesh(geo, wallMat);
    mesh.position.set(w.x, w.h / 2, w.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    obstacles.push(createCollider(w.x, w.z, w.w / 2, w.d / 2));
  }

  const crateMat = new THREE.MeshStandardMaterial({
    color: 0x8b6914,
    roughness: 0.7,
    metalness: 0.1,
  });

  const cratePositions = [
    { x: -8, z: -5, sx: 3, sy: 2, sz: 3 },
    { x: 8, z: 5, sx: 3, sy: 2, sz: 3 },
    { x: 0, z: 0, sx: 4, sy: 2.5, sz: 4 },
    { x: -10, z: 10, sx: 2, sy: 3, sz: 2 },
    { x: 10, z: -10, sx: 2, sy: 3, sz: 2 },
  ];

  for (const c of cratePositions) {
    const geo = new THREE.BoxGeometry(c.sx, c.sy, c.sz);
    const mesh = new THREE.Mesh(geo, crateMat);
    mesh.position.set(c.x, c.sy / 2, c.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    obstacles.push(createCollider(c.x, c.z, c.sx / 2, c.sz / 2));
  }

  return {
    half,
    obstacles,
    bounds: { minX: -half + 1, maxX: half - 1, minZ: -half + 1, maxZ: half - 1 },
  };
}

function createCollider(x, z, halfW, halfD) {
  return { x, z, halfW, halfD };
}

export function checkCollision(x, z, radius, obstacles, bounds) {
  if (x - radius < bounds.minX || x + radius > bounds.maxX) return true;
  if (z - radius < bounds.minZ || z + radius > bounds.maxZ) return true;

  for (const o of obstacles) {
    const dx = Math.abs(x - o.x);
    const dz = Math.abs(z - o.z);
    if (dx < o.halfW + radius && dz < o.halfD + radius) return true;
  }
  return false;
}

export { ARENA_SIZE, WALL_HEIGHT };
