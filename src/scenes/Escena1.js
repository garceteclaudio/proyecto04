export default class Escena1 extends Phaser.Scene {
  constructor() {
    super("Escena 1");
    this.jugador = null;
    this.grupoMeteoros = null;
    this.grupoBalas = null;
    this.cursors = null;
    this.teclas = null;
    this.puntaje = 0;
    this.textoDePuntaje = null;
    this.juegoTerminado = false;
    this.musicaFondo = null;
    this.sonidoGrito = null;
    this.siguienteDisparo = 0;
    this.sonidoBala = null;
    this.sonidoExplosion = null;
  }

  generarMeteoros() {
    if (this.juegoTerminado) return;

    const x = Phaser.Math.Between(0, 800);
    const meteoro = this.grupoMeteoros.create(x, 0, "meteoro");
    meteoro.setVelocityY(200);
  }

  dispararBala() {
    const tiempoActual = this.time.now;

    if (tiempoActual > this.siguienteDisparo) {
      const bala = this.grupoBalas.get(this.jugador.x, this.jugador.y - 50);

      if (bala) {
        bala.setActive(true);
        bala.setVisible(true);
        bala.setVelocityY(-500);
        this.siguienteDisparo = tiempoActual + 300;

        this.sonidoBala.play();
      }
    }
  }

  destruirMeteoro(bala, meteoro) {
    // Destruir meteoro y bala
    meteoro.destroy();
    bala.destroy();

    // Reproducir el sonido de la bala
    this.sonidoExplosion.play();
  }

  incrementarPuntaje() {
    if (!this.juegoTerminado) {
      this.puntaje += 1;
      this.textoDePuntaje.setText(`Puntaje: ${this.puntaje}`);
    }
  }
  gameOver(jugador) {
    this.juegoTerminado = true;
    this.physics.pause();
    this.incrementoPuntajeEvento.remove();
    jugador.setTint(0xff0000);

    this.sonidoGrito.play();

    this.add
      .text(400, 300, `Has muerto! Juego Terminado. Puntaje: ${this.puntaje}`, {
        fontSize: "30px",
        fill: "#fff",
        fontStyle: "bold",
        align: "center",
      })
      .setOrigin(0.5);

    this.musicaFondo.stop();
  }

  preload() {
    this.load.image("espacio", "/public/resources/images/espacio.png");
    this.load.spritesheet("nave", "/public/resources/images/nave.png", {
      frameWidth: 60,
      frameHeight: 60,
    });
    this.load.image("meteoro", "/public/resources/images/meteoro.png", {
      frameWidth: 56,
      frameHeight: 60,
    });
    this.load.image("bala", "/public/resources/images/bala.png");
    this.load.audio("musica", "/public/resources/sounds/musica.mp3");
    this.load.audio("colision", "/public/resources/sounds/colision.mp3");
    this.load.audio("disparo", "/public/resources/sounds/disparo.mp3");
    this.load.audio("explosion", "/public/resources/sounds/explosion.mp3");
  }

  create() {
    this.add.image(400, 300, "espacio");
    this.jugador = this.physics.add.sprite(400, 550, "nave", 0);
    this.jugador.setCollideWorldBounds(true);

    this.grupoBalas = this.physics.add.group({
      defaultKey: "bala",
      maxSize: 20,
    });

    this.grupoMeteoros = this.physics.add.group();

    this.anims.create({
      key: "izquierda",
      frames: [{ key: "nave", frame: 1 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "normal",
      frames: [{ key: "nave", frame: 0 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "derecha",
      frames: [{ key: "nave", frame: 2 }],
      frameRate: 20,
    });

    this.time.addEvent({
      delay: 1000,
      callback: this.generarMeteoros,
      callbackScope: this,
      loop: true,
    });

    this.incrementoPuntajeEvento = this.time.addEvent({
      delay: 100,
      callback: this.incrementarPuntaje,
      callbackScope: this,
      loop: true,
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    this.teclas = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE, // Barra espaciadora para disparar
    });

    this.physics.add.collider(
      this.jugador,
      this.grupoMeteoros,
      this.gameOver,
      null,
      this
    );

    // Colisión entre balas y meteoros
    this.physics.add.collider(
      this.grupoBalas,
      this.grupoMeteoros,
      this.destruirMeteoro,
      null,
      this
    );

    this.textoDePuntaje = this.add.text(16, 16, "Puntaje: 0", {
      fontSize: "32px",
      fill: "#fff",
    });

    this.musicaFondo = this.sound.add("musica", { loop: true });
    this.musicaFondo.play();
    this.sonidoGrito = this.sound.add("colision");
    this.sonidoBala = this.sound.add("disparo");
    this.sonidoExplosion = this.sound.add("explosion");
  }

  update() {
    if (this.juegoTerminado) return;

    this.jugador.setVelocity(0);

    if (this.cursors.left.isDown || this.teclas.left.isDown) {
      this.jugador.setVelocityX(-300);
      this.jugador.anims.play("izquierda", true);
    } else if (this.cursors.right.isDown || this.teclas.right.isDown) {
      this.jugador.setVelocityX(300);
      this.jugador.anims.play("derecha", true);
    } else if (this.cursors.up.isDown || this.teclas.up.isDown) {
      this.jugador.setVelocityY(-300);
      this.jugador.anims.play("normal", true);
    } else if (this.cursors.down.isDown || this.teclas.down.isDown) {
      this.jugador.setVelocityY(300);
      this.jugador.anims.play("normal", true);
    } else {
      this.jugador.anims.play("normal", true);
    }

    // Disparar balas cuando se presiona la barra espaciadora
    if (this.teclas.space.isDown) {
      this.dispararBala();
    }
  }
}
