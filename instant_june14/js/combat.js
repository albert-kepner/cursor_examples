import * as THREE from "three";

const SHOOT_RANGE = 40;

export function fireRaycast(shot, targetMesh, targetEntity) {
  if (!targetEntity.alive) return false;

  const raycaster = new THREE.Raycaster(shot.origin, shot.direction, 0, SHOOT_RANGE);
  const hits = raycaster.intersectObject(targetMesh, true);

  if (hits.length > 0) {
    targetEntity.takeDamage(shot.damage);
    return true;
  }
  return false;
}

export function createMuzzleFlash(scene, origin, direction) {
  const geo = new THREE.SphereGeometry(0.15, 6, 6);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffaa44 });
  const flash = new THREE.Mesh(geo, mat);
  flash.position.copy(origin).add(direction.clone().multiplyScalar(0.5));
  scene.add(flash);

  setTimeout(() => {
    scene.remove(flash);
    geo.dispose();
    mat.dispose();
  }, 60);
}

export function createTracer(scene, origin, direction, color = 0xffaa44) {
  const end = origin.clone().add(direction.clone().multiplyScalar(SHOOT_RANGE));
  const points = [origin.clone(), end];
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 });
  const line = new THREE.Line(geo, mat);
  scene.add(line);

  setTimeout(() => {
    scene.remove(line);
    geo.dispose();
    mat.dispose();
  }, 80);
}
