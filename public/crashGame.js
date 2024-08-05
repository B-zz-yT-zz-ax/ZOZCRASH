import Phaser from 'phaser';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container', // Assurez-vous que le jeu est monté dans le bon conteneur
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

function preload() {
  // Charger les ressources
}

function create() {
  this.multiplicator = 1;
  this.crashTime = Phaser.Math.Between(2000, 10000); // Temps aléatoire avant le crash
  this.timer = this.time.addEvent({
    delay: 100,
    callback: updateMultiplicator,
    callbackScope: this,
    loop: true
  });
}

function update() {
  // Logique du jeu
}

function updateMultiplicator() {
  this.multiplicator += 0.01;
  if (this.timer.getElapsed() >= this.crashTime) {
    this.timer.remove();
    console.log('Crash at:', this.multiplicator);
    // Logique pour gérer le crash
  }
}
