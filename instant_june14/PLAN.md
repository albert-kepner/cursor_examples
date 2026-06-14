# 3D Arena FPS — Project Plan

## Overview

Build a browser-based 3D first-person shooter set in a closed arena. The player fights one AI opponent using **arrow keys** for movement and **Space** to shoot. No external build step — vanilla HTML, CSS, and JavaScript with Three.js loaded from a CDN.

## Goals

| Goal | Detail |
|------|--------|
| Perspective | First-person 3D camera |
| Arena | Enclosed rectangular arena with floor, walls, and simple cover |
| Player controls | Arrow keys move; Space fires |
| Opponent | One computer-controlled enemy with basic AI |
| Combat | Hitscan or fast projectiles with health and win/lose states |
| Platform | Runs in any modern browser, no install required |

## Tech Stack

- **Three.js** (r128 via CDN) — WebGL rendering, scene graph, camera, lights
- **Vanilla JS** — game loop, input, AI, collision
- **HTML + CSS** — page shell, HUD overlay, start/end screens

## Controls

| Input | Action |
|-------|--------|
| ↑ | Move forward |
| ↓ | Move backward |
| ← | Turn left |
| → | Turn right |
| Space | Shoot (with cooldown) |

Mouse is not required. All gameplay is keyboard-only.

## Architecture

```
index.html          Entry point, loads Three.js + modules
css/style.css       Full-screen canvas, HUD, menus
js/
  main.js           Bootstraps renderer, scene, game loop
  arena.js          Builds floor, walls, obstacles
  player.js         Player movement, rotation, shooting
  enemy.js          AI movement, targeting, shooting
  combat.js         Raycasts, damage, health, respawn logic
  hud.js            Health bars, crosshair, game-over UI
```

## Scene Design

### Arena
- **Size:** ~40 × 40 units
- **Floor:** Flat plane with grid or subtle texture color
- **Walls:** Four perimeter walls (~4 units tall) to keep combat contained
- **Cover:** 3–5 box obstacles (crates/pillars) placed symmetrically for tactical movement

### Lighting
- Ambient light (soft base illumination)
- Directional light (sun-like shadows optional; keep performance simple)

### Camera
- First-person: attached to player position at eye height (~1.6 units)
- Yaw rotation only (no pitch — simplifies arrow-key turning)

## Gameplay Systems

### Player
- Starts at one end of the arena with 100 HP
- Movement speed: ~8 units/sec; rotation: ~2 rad/sec
- Collision with walls and obstacles (AABB or simple radius check)
- Weapon: hitscan ray from camera center, 25 damage, 0.4s cooldown
- Brief muzzle flash / screen feedback on shoot

### Enemy (AI)
- Starts at opposite end with 100 HP
- States: **patrol** → **chase** (when player in range) → **attack** (when line-of-sight + in range)
- Patrol: move between waypoints or wander within arena
- Chase: move toward player, avoid walls
- Attack: stop or strafe, shoot at player on cooldown (~1s)
- Detection radius: ~25 units; attack range: ~20 units
- Same hitscan weapon stats as player for fairness

### Combat
- Raycast from shooter position along forward vector
- If ray hits opponent mesh within range, apply damage
- On hit: flash indicator, update HUD
- Death at 0 HP → game over screen (win/lose message, restart button)

### Game States
1. **Menu** — title, instructions, "Press Enter to Start"
2. **Playing** — active combat
3. **Game Over** — winner announced, press Enter to restart

## UI / HUD

- Crosshair (center dot or cross)
- Player health bar (bottom-left)
- Enemy health bar (top-center, visible when damaged or always)
- Ammo not needed (unlimited with cooldown)
- Overlay text for menu and game-over states

## Implementation Phases

### Phase 1 — Foundation
- [x] Create project structure and this plan
- [x] Set up HTML page with full-screen canvas
- [x] Initialize Three.js scene, camera, renderer, resize handler
- [x] Basic game loop with `requestAnimationFrame`

### Phase 2 — Arena & Player
- [x] Build arena geometry (floor, walls, obstacles)
- [x] Implement player entity with arrow-key movement and rotation
- [x] Wall/obstacle collision detection

### Phase 3 — Combat
- [x] Hitscan shooting with raycaster
- [x] Health system for player and enemy
- [x] Visual/audio feedback on shoot and hit

### Phase 4 — Enemy AI
- [x] Enemy mesh and spawn position
- [x] Patrol / chase / attack state machine
- [x] Enemy shooting toward player

### Phase 5 — Polish
- [x] HUD (health, crosshair)
- [x] Menu and game-over screens
- [x] Restart flow
- [x] Balance pass (speed, damage, AI aggression)

## File Deliverables

| File | Purpose |
|------|---------|
| `PLAN.md` | This document |
| `index.html` | Game page |
| `css/style.css` | Layout and HUD styling |
| `js/main.js` | Entry and render loop |
| `js/arena.js` | Level geometry |
| `js/player.js` | Player logic |
| `js/enemy.js` | AI opponent |
| `js/combat.js` | Damage and raycasts |
| `js/hud.js` | On-screen UI |

## Out of Scope (v1)

- Multiplayer
- Sound effects (can add later)
- Mobile/touch controls
- Multiple enemies or weapon types
- Complex 3D models (use primitives: boxes, planes)

## Success Criteria

1. Page loads and shows a 3D arena from first-person view
2. Arrow keys move and turn the player smoothly
3. Space fires and damages the enemy when aimed at them
4. Enemy moves, detects the player, and shoots back
5. Game ends with a clear win or lose message and can be restarted
