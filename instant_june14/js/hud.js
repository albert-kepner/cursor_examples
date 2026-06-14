const overlay = document.getElementById("overlay");
const playerBar = document.getElementById("player-health-bar");
const enemyBar = document.getElementById("enemy-health-bar");
const playerText = document.getElementById("player-health-text");
const enemyText = document.getElementById("enemy-health-text");
const flash = document.getElementById("flash");

export function updateHUD(player, enemy) {
  const pPct = (player.health / player.maxHealth) * 100;
  playerBar.style.width = `${pPct}%`;
  playerText.textContent = Math.ceil(player.health);

  const ePct = (enemy.health / enemy.maxHealth) * 100;
  enemyBar.style.width = `${ePct}%`;
  enemyText.textContent = Math.ceil(enemy.health);
}

export function showMenu() {
  overlay.className = "visible";
  overlay.innerHTML = `
    <h1>ARENA FPS</h1>
    <p class="subtitle">First-person shooter — keyboard only</p>
    <div class="instructions">
      <p><kbd>↑</kbd> <kbd>↓</kbd> Move forward / backward</p>
      <p><kbd>←</kbd> <kbd>→</kbd> Turn left / right</p>
      <p><kbd>Space</kbd> Shoot</p>
    </div>
    <p class="prompt">Press <kbd>Enter</kbd> to start</p>
  `;
}

export function showGameOver(won) {
  overlay.className = `visible ${won ? "win" : "lose"}`;
  overlay.innerHTML = `
    <h1>${won ? "VICTORY!" : "DEFEATED"}</h1>
    <p class="subtitle">${won ? "You eliminated the enemy." : "The enemy got you."}</p>
    <p class="prompt">Press <kbd>Enter</kbd> to play again</p>
  `;
}

export function hideOverlay() {
  overlay.className = "hidden";
}

export function flashShoot() {
  flash.className = "active";
  setTimeout(() => { flash.className = ""; }, 50);
}

export function flashHit() {
  flash.className = "active hit";
  setTimeout(() => { flash.className = ""; }, 120);
}
