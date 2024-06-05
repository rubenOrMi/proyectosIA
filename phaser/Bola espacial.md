# Documentación Juego Bola Espacial - Esquiva la bola que rebota
## Introducción
Este proyecto es un juego desarrollado con el framework Phaser y una red neuronal creada con Synaptic. El objetivo es manejar una nave que debe esquivar una pelota en movimiento. El juego tiene dos modos: manual y automático. En el modo manual, el jugador controla la nave usando las teclas de dirección. En el modo automático, la nave se mueve usando una red neuronal que aprende de los datos recopilados durante el modo manual.

## Descripción del Código
### Declaración de Variables Globales
```
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
```
Estas variables globales almacenan las dimensiones del juego, las referencias a los objetos del juego (nave, fondo, pelota), el estado del juego, la configuración de la red neuronal y los datos de entrenamiento.

### Inicialización del Juego
```
var juego = new Phaser.Game(WIDTH, HEIGHT, Phaser.CANVAS, '', {
    preload: preload,
    create: create,
    update: update,
    render: render,
});
```
Aquí se crea una instancia del juego de Phaser con las dimensiones especificadas y se definen las funciones preload, create, update y render.

### Función preload
```
function preload() {
    juego.load.image('background', 'assets/background/rainbow_bg.jpg');
    juego.load.spritesheet('nave', 'assets/sprites/cat_sprite_1.png',69,45);
    juego.load.image('menu', 'assets/game/menu.png');
    juego.load.spritesheet('pelota', 'assets/sprites/bolas_fuego.png',18,18);
    juego.load.audio('nyancat', 'assets/audio/nyan_cat.mp3');
}
```
Esta función carga los recursos necesarios para el juego: imágenes, sprites y audio.

### Función create
```
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
    var gira = pelota.animations.add('gira', [0, 1, 2]); 
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
```
En esta función se configuran los sistemas de física del juego, se añaden los elementos (fondo, nave, pelota) y se definen sus propiedades. También se crea la red neuronal y se inicializa el entrenamiento.

### Función setRandomBalaVelocity
```
function setRandomBalaVelocity() {
    var speed = 550;
    pelota.body.velocity.set(Math.cos(45) * speed, Math.sin(60) * speed);
}
```
Esta función establece una velocidad aleatoria para la pelota, usando una combinación de funciones trigonométricas para calcular las componentes de la velocidad.

### Función update
```
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
```
Esta función se ejecuta en cada frame del juego. Actualiza la posición del fondo y maneja el movimiento de la nave según el modo (manual o automático). También verifica la colisión entre la nave y la pelota.

### Función manejarMovimientoManual
```
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
```
Esta función maneja el movimiento de la nave en modo manual. Ajusta la velocidad de la nave según las teclas presionadas y registra los datos de entrenamiento si la velocidad cambia.

### Función manejarMovimientoAutomatico
```
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
```
Esta función maneja el movimiento de la nave en modo automático. Calcula la entrada para la red neuronal basada en la posición de la nave y la pelota, y luego usa la salida de la red para ajustar la velocidad de la nave.

### Función registrarDatosEntrenamiento
```
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
```
Esta función registra los datos de entrenamiento solo en modo manual. Calcula las diferencias de posición entre la pelota y la nave, y guarda estos datos junto con las teclas presionadas en datos_entrenamiento.

#### Función colisionar
```
function colisionar() {
    modo_auto = true;
    pausar();
}
```
Esta función se llama cuando la nave colisiona con la pelota. Activa el modo automático y pausa el juego.

### Función pausar
```
function pausar() {
    juego.paused = true;
    menu = juego.add.sprite(WIDTH / 2, HEIGHT / 2, 'menu');
    menu.anchor.setTo(0.5, 0.5);
}
```
Esta función pausa el juego y muestra el menú de pausa.

### Función manejarPausa
```
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
```
Esta función maneja las interacciones del usuario con el menú de pausa. Permite reiniciar el entrenamiento o activar el modo automático.

### Función resetGame
```
function resetGame() {
    navecita.x = WIDTH / 2;
    navecita.y = HEIGHT / 2;
    navecita.body.velocity.x = 0;
    navecita.body.velocity.y = 0;
    pelota.x = 0;
    pelota.y = 0;
    setRandomBalaVelocity();
}
```
Esta función restablece el estado del juego, colocando la nave y la pelota en sus posiciones iniciales y estableciendo una nueva velocidad para la pelota.

### Función render
```
function render() {
}
```
Esta función está vacía, pero puede ser usada para dibujar elementos adicionales en el juego, como estadísticas o depuración.

## Modo Automático: Aprendizaje
El juego aprende a jugar automáticamente a través de la red neuronal configurada con Synaptic. Aquí se explica el proceso de aprendizaje:

1. **Recolección de Datos:** En el modo manual, cada vez que el jugador mueve la nave, se registran los datos de entrenamiento. Estos datos incluyen la diferencia de posición entre la nave y la pelota, la distancia entre ellas, la posición actual de la nave y las teclas presionadas.

2. **Entrenamiento de la Red:** Cuando el juego está en pausa y el usuario elige activar el modo automático, se entrena la red neuronal usando los datos recopilados. El entrenamiento se realiza usando el método train de network_entramiento, con una tasa de aprendizaje, un número de iteraciones y una opción de barajado de datos.

3. **Modo Automático:** En el modo automático, en cada frame, la red neuronal recibe como entrada la diferencia de posición entre la nave y la pelota, la distancia entre ellas y la posición actual de la nave. La red neuronal calcula la salida, que se interpreta como comandos de movimiento para la nave.

4. **Activación de la Red:** La salida de la red neuronal determina si la nave debe moverse a la izquierda, derecha, arriba o abajo. La velocidad de la nave se ajusta en consecuencia.

## Conclusión
Este código implementa un juego donde una nave controlada por el jugador esquiva una pelota en movimiento. La nave puede aprender a jugar automáticamente mediante una red neuronal entrenada con los datos de las sesiones de juego manual. El uso de Phaser permite crear y manejar los elementos del juego, mientras que Synaptic proporciona la funcionalidad para la red neuronal y su entrenamiento.