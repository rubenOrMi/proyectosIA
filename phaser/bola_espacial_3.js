var WIDTH = 600;
var HEIGHT = 500;
var navecita, background, pelota;
var cursores, menu;
var network, network_entramiento, network_salida, datos_entrenamiento = [];
var modo_auto = false;
var entrenamiento_completo = false;
var entrenameinto_juego = 3;
var juego_actual = 0;
var PX = 275, PY = 250;

var juego = new Phaser.Game(WIDTH, HEIGHT, Phaser.CANVAS, '', {
    preload: preload,
    create: create,
    update: update,
    render: render,
})

function preload() {
  juego.load.image('background', 'assets/background/rainbow_bg.jpg');
  juego.load.spritesheet('nave', 'assets/sprites/cat_sprite_1.png',69,45);
  juego.load.image('menu', 'assets/game/menu.png');
  juego.load.spritesheet('pelota', 'assets/sprites/bolas_fuego.png',18,18);
  juego.load.audio('nyancat', 'assets/audio/nyan_cat.mp3');
}

function create() {
    juego.physics.startSystem(Phaser.Physics.ARCADE);
    juego.physics.arcade.gravity.y = 0;
    juego.time.desiredFps = 30;

    background = juego.add.tileSprite(0, 0, WIDTH, HEIGHT, 'background');
    navecita = juego.add.sprite(WIDTH / 2, HEIGHT / 2, 'nave');
    juego.physics.enable(navecita);
    navecita.body.collideWorldBounds = true;
    var corre = navecita.animations.add('corre',[0,1,2,3,4,5,6,7]);
    navecita.animations.play('corre',10,true);

    pelota = juego.add.sprite(0, 0, 'pelota');
    juego.physics.enable(pelota);
    pelota.body.collideWorldBounds = true;
    pelota.body.bounce.set(1);
    var gira = pelota.animations.add('gira', [0, 1, 2]); // Crear la animación
    pelota.animations.play('gira', 10, true);
    setRandomBalaVelocity();

    pausa_lateral = juego.add.text(WIDTH - 100, 20, 'Pausa', {
        font: '20px Arial',
        fill: '#fff',
    });
    pausa_lateral.inputEnabled = true;
    pausa_lateral.events.onInputUp.add(pausar, self);
    juego.input.onDown.add(manejarPausa, self);

    cursores = juego.input.keyboard.createCursorKeys();

    network = new synaptic.Architect.Perceptron(5, 10, 4);
    network_entramiento = new synaptic.Trainer(network);

    backgroundMusic = juego.add.audio('nyancat');
    backgroundMusic.loop = true; 
    backgroundMusic.play();

}

function setRandomBalaVelocity() {
  var speed = 550;
  pelota.body.velocity.set(Math.cos(45) * speed, Math.sin(60) * speed);
}

function update() {
    background.tilePosition.x -= 1;
    console.log(datos_entrenamiento)
    if (!modo_auto) {
        manejarMovimientoManual();
    } else {
        if (datos_entrenamiento.length > 0) {
            manejarMovimientoAutomatico();
        } else {
            navecita.body.velocity.x = 0;
            navecita.body.velocity.y = 0;
        }
    }

    juego.physics.arcade.collide(pelota, navecita, colisionar, null, this);
}

function manejarMovimientoManual() {
    var prevX = navecita.body.velocity.x;
    var prevY = navecita.body.velocity.y;

    navecita.body.velocity.x = 0;
    navecita.body.velocity.y = 0;

    var moveLeft = cursores.left.isDown ? 1 : 0;
    var moveRight = cursores.right.isDown ? 1 : 0;
    var moveUp = cursores.up.isDown ? 1 : 0;
    var moveDown = cursores.down.isDown ? 1 : 0;

    if (moveLeft) {
        navecita.body.velocity.x = -300;
    } else if (moveRight) {
        navecita.body.velocity.x = 300;
    }

    if (moveUp) {
        navecita.body.velocity.y = -300;
    } else if (moveDown) {
        navecita.body.velocity.y = 300;
    }

    if (navecita.body.velocity.x !== prevX || navecita.body.velocity.y !== prevY) {
        registrarDatosEntrenamiento();
    }
}

function manejarMovimientoAutomatico() {
    var dx = pelota.x - navecita.x;
    var dy = pelota.y - navecita.y;
    var distancia = Math.sqrt(dx * dx + dy * dy);
    var input = [dx, dy, distancia, navecita.x, navecita.y];

    network_salida = network.activate(input);

    var moveLeft = network_salida[0] > 0.5 ? 1 : 0;
    var moveRight = network_salida[1] > 0.5 ? 1 : 0;
    var moveUp = network_salida[2] > 0.5 ? 1 : 0;
    var moveDown = network_salida[3] > 0.5 ? 1 : 0;

    navecita.body.velocity.x = (moveRight - moveLeft) * 300;
    navecita.body.velocity.y = (moveDown - moveUp) * 300;
}

function registrarDatosEntrenamiento() {
    if (!modo_auto && pelota.position.x > 0) {
        var dx = pelota.x - navecita.x;
        var dy = pelota.y - navecita.y;
        var distancia = Math.sqrt(dx * dx + dy * dy);
        var datosIzquierda = cursores.left.isDown ? 1 : 0;
        var datosDerecha = cursores.right.isDown ? 1 : 0;
        var datosArriba = cursores.up.isDown ? 1 : 0;
        var datosAbajo = cursores.down.isDown ? 1 : 0;
        var movimiento = datosIzquierda || datosDerecha || datosArriba || datosAbajo;

        if (movimiento) {
            PX = navecita.x;
            PY = navecita.y;

            datos_entrenamiento.push({
                'input': [dx, dy, distancia, PX, PY],
                'output': [datosIzquierda, datosDerecha, datosArriba, datosAbajo, movimiento]
            });

            console.log('Datos de Entrenamiento Registrados');
        }
    }
}

function colisionar() {
    modo_auto = true;
    pausar();
}

function pausar() {
    juego.paused = true;
    menu = juego.add.sprite(WIDTH / 2, HEIGHT / 2, 'menu');
    menu.anchor.setTo(0.5, 0.5);
}

function manejarPausa(event) {
    if (juego.paused) {
        var menu_x1 = WIDTH / 2 - 270 / 2, menu_x2 = WIDTH / 2 + 270 / 2,
            menu_y1 = HEIGHT / 2 - 180 / 2, menu_y2 = HEIGHT / 2 + 180 / 2;
        var mouse_x = event.x, mouse_y = event.y;

        if (mouse_x > menu_x1 && mouse_x < menu_x2 && mouse_y > menu_y1 && mouse_y < menu_y2) {
            if (mouse_x >= menu_x1 && mouse_x <= menu_x2 && mouse_y >= menu_y1 && mouse_y <= menu_y1 + 90) {
                entrenamientoCompleto = false;
                datos_entrenamiento = [];
                modo_auto = false;
            } else if (mouse_x >= menu_x1 && mouse_x <= menu_x2 && mouse_y >= menu_y1 + 90 && mouse_y <= menu_y2) {
                if (!entrenamiento_completo && datos_entrenamiento.length > 0) {
                    network_entramiento.train(datos_entrenamiento, { rate: 0.0003, iterations: 10000, shuffle: true });
                    entrenamiento_completo = true;
                }
                modo_auto = true;
            }
            menu.destroy();
            resetGame();
            juego.paused = false;
        }
    }
}

function resetGame() {
    navecita.x = WIDTH / 2;
    navecita.y = HEIGHT / 2;
    navecita.body.velocity.x = 0;
    navecita.body.velocity.y = 0;
    pelota.x = 0;
    pelota.y = 0;
    setRandomBalaVelocity();
}

function render() {
}