# Juego de Supervivencia Automático con Phaser y Synaptic
Este juego implementa un sistema donde un personaje (jugador) debe esquivar balas disparadas por múltiples enemigos. El personaje puede aprender a jugar automáticamente utilizando una red neuronal entrenada con los datos recopilados durante las sesiones de juego manual.

## Estructura del Código
El código está dividido en varias secciones clave, que se describen a continuación.

### Variables Globales
```
var w = 800;
var h = 400;
var jugador, fondo, bala, nave, bala2, nave2, bala3, nave3;
var salto, moverDerecha, moverAtras, menu;
var velocidadBala, despBala, velocidadBala2, despBala2;
var velocidadBala3x, velocidadBala3y, despBala3x, despBala3y;
var estatusAire, estatuSuelo;
var nnNetwork, nnEntrenamiento, nnSalida, datosEntrenamiento = [];
var modoAuto = false, eCompleto = false;
var despDerTiempo, despAtrTiempo;
var estatusDerecha, estatusIzquierda, estatusAtras, estatusInicio;
var balas, jugadorGolpeado, regresandoDer, regresandoAtras;
var tiempoB3, tiempoB2;
var juego = new Phaser.Game(w, h, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render });
```

### Función preload
Carga los recursos del juego, como imágenes y sprites.

```
function preload() {
    juego.load.image('fondo', 'assets/background/bg_mario.jpg');
    juego.load.spritesheet('mono', 'assets/sprites/mario.png', 32, 48);
    juego.load.image('nave', 'assets/game/lakitu.png');
    juego.load.image('bowser', 'assets/game/bowser.png');
    juego.load.image('bala', 'assets/sprites/bolita.png');
    juego.load.image('flama', 'assets/sprites/flama.png');
    juego.load.image('menu', 'assets/game/menu.png');
}
```

### Función create
Inicializa los objetos del juego, sus posiciones, físicas y eventos de entrada.

```
function create() {
    juego.physics.startSystem(Phaser.Physics.ARCADE);
    juego.physics.arcade.gravity.y = 800;
    juego.time.desiredFps = 30;

    fondo = juego.add.tileSprite(0, 0, w, h, 'fondo');
    nave = juego.add.sprite(w - 100, h - 100, 'bowser');
    bala = juego.add.sprite(w - 100, h - 100, 'flama');
    jugador = juego.add.sprite(50, h, 'mono');
    nave2 = juego.add.sprite(20, 10, 'nave');
    bala2 = juego.add.sprite(60, 70, 'bala');
    nave3 = juego.add.sprite(w - 200, 40, 'nave');
    bala3 = juego.add.sprite(600, 100, 'bala');

    juego.physics.enable(jugador);
    jugador.body.collideWorldBounds = true;
    var corre = jugador.animations.add('corre', [0, 1, 2, 3]);
    jugador.animations.play('corre', 10, true);

    juego.physics.enable(bala);
    bala.body.collideWorldBounds = true;
    juego.physics.enable(bala2);
    bala2.body.collideWorldBounds = true;
    juego.physics.enable(bala3);
    bala3.body.collideWorldBounds = true;

    pausaL = juego.add.text(w - 100, 20, 'Pausa', { font: '20px Arial', fill: '#fff' });
    pausaL.inputEnabled = true;
    pausaL.events.onInputUp.add(pausa, self);
    juego.input.onDown.add(mPausa, self);

    salto = juego.input.keyboard.addKeys({
        'space': Phaser.Keyboard.SPACEBAR,
        'up': Phaser.Keyboard.UP
    });
    moverDerecha = juego.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    moverAtras = juego.input.keyboard.addKey(Phaser.Keyboard.LEFT);

    nnNetwork = new synaptic.Architect.Perceptron(5, 12, 6);
    nnEntrenamiento = new synaptic.Trainer(nnNetwork);

    estatusDerecha = 0;
    estatusIzquierda = 1;
    estatusInicio = 1;
    estatusAtras = 0;

    despDerTiempo = 0;
    despAtrTiempo = 0;

    balas = juego.add.group();
    balas.add(bala);
    balas.add(bala2);
    balas.add(bala3);

    jugadorGolpeado = false;
    regresandoDer = false;
    regresandoAtras = false;

    tiempoB3 = 0;
    tiempoB2 = 0;
}
```

### Función enRedNeural
Entrena la red neuronal con los datos recopilados.

```
function enRedNeural() {
    nnEntrenamiento.train(datosEntrenamiento, { rate: 0.0003, iterations: 10000, shuffle: true });
}
```

### Función datosDeEntrenamiento
Procesa la entrada y activa la red neuronal.

```
function datosDeEntrenamiento(param_entrada) {
    nnSalida = nnNetwork.activate(param_entrada);
    var aire = Math.round(nnSalida[0] * 100);
    var piso = Math.round(nnSalida[1] * 100);
    var der = Math.round(nnSalida[2] * 100);
    var izq = Math.round(nnSalida[3] * 100);
    var atras = Math.round(nnSalida[4] * 100);
    var ini = Math.round(nnSalida[5] * 100);
    return nnSalida[0] >= nnSalida[1];
}
```

### Función pausa
Pausa el juego y muestra el menú de pausa.

```
function pausa() {
    juego.paused = true;
    menu = juego.add.sprite(w / 2, h / 2, 'menu');
    menu.anchor.setTo(0.5, 0.5);
}
```

### Función mPausa
Maneja el menú de pausa y elige entre reanudar, reiniciar o activar el modo automático.

```
function mPausa(event) {
    if (juego.paused) {
        var menu_x1 = w / 2 - 270 / 2, menu_x2 = w / 2 + 270 / 2,
            menu_y1 = h / 2 - 180 / 2, menu_y2 = h / 2 + 180 / 2;

        var mouse_x = event.x,
            mouse_y = event.y;

        if (mouse_x > menu_x1 && mouse_x < menu_x2 && mouse_y > menu_y1 && mouse_y < menu_y2) {
            if (mouse_x >= menu_x1 && mouse_x <= menu_x2 && mouse_y >= menu_y1 && mouse_y <= menu_y1 + 90) {
                eCompleto = false;
                datosEntrenamiento = [];
                modoAuto = false;
            } else if (mouse_x >= menu_x1 && mouse_x <= menu_x2 && mouse_y >= menu_y1 + 90 && mouse_y <= menu_y2) {
                if (!eCompleto) {
                    enRedNeural();
                    eCompleto = true;
                }
                modoAuto = true;
            }

            menu.destroy();
            resetVariables();
            balas.forEach(function(bala) {
                bala.body.checkCollision.none = false;
            });
            juego.paused = false;
            jugadorGolpeado = false;
            balaD2 = false;
            balaD3 = false;
        }
    }
}
```

### Función resetVariables
Restablece el estado del juego a sus valores iniciales.

```
function resetVariables() {
    jugador.body.velocity.x = 0;
    jugador.body.velocity.y = 0;
    bala.body.velocity.x = 0;
    bala.position.x = w - 100;
    bala.position.y = h - 100;
    jugador.position.x = 0;
    balaD = false;
    bala2.body.velocity.y = 0;
    bala2.position.y = 70;
    balaD2 = false;
    bala3.body.velocity.y = 0;
    bala3.body.velocity.x = 0;
    bala3.position.x = 600;
    bala3.position.y = 100;
    balaD3 = false;
    estatusDerecha = 0;
    estatusIzquierda = 1;
    despDerTiempo = 0;
    jugadorGolpeado = false;
    regresandoDer = false;
    estatusInicio = 1;
    estatusAtras = 0;
    despAtrTiempo = 0;
    regresandoAtras = false;
    tiempoB3 = 0;
    tiempoB2 = 0;
}
```

### Función saltar
Hace que el jugador salte.

```
function saltar() {
    jugador.body.velocity.y = -270;
}
```

### Función moverseDer
Mueve al jugador hacia la derecha.

```
function moverseDer() {
    estatusIzquierda = 0;
    estatusDerecha = 1;
    jugador.position.x = 90;
    estatusAtras = 0;
    estatusInicio = 0;
    despDerTiempo = 0;
}
```

### Función moverseAtr
Mueve al jugador hacia atrás (izquierda).

```
function moverseAtr() {
    estatusIzquierda = 1;
    estatusDerecha = 0;
    jugador.position.x = 0;
    estatusInicio = 0;
    estatusAtras = 1;
    despAtrTiempo = 0;
}
```

### Función impacto
Desactiva las colisiones de las balas y activa la lógica para reanudar el juego.

```
function impacto() {
    balas.forEach(function(bala) {
        bala.body.checkCollision.none = true;
    });
    jugadorGolpeado = true;
    regresandoDer = true;
    regresandoAtras = true;
}
```

### Función verificaColisiones
Verifica las colisiones entre el jugador y las balas, y entre el jugador y el suelo.

```
function verificaColisiones() {
    if (estatusInicio == 1) {
        if (estatusDerecha == 1) {
            datosEntrenamiento.push({
                input: [estatusAire, estatuSuelo, jugador.position.x, nave.position.x, bala.position.x],
                output: [estatusAire]
            });
        }
    } else {
        if (estatusAtras == 1) {
            datosEntrenamiento.push({
                input: [estatusAire, estatuSuelo, jugador.position.x, nave.position.x, bala.position.x],
                output: [estatusAtras]
            });
        }
    }
}
```

### Función update
Actualiza el estado del juego en cada frame, gestionando la lógica del movimiento del jugador y las colisiones.

```
function update() {
    juego.physics.arcade.collide(jugador, bala, impacto);
    juego.physics.arcade.collide(jugador, bala2, impacto);
    juego.physics.arcade.collide(jugador, bala3, impacto);

    estatusAire = jugador.body.onFloor();
    estatuSuelo = jugador.body.touching.down;

    if (!jugadorGolpeado) {
        verificaColisiones();

        if (!modoAuto) {
            if (salto.space.isDown || salto.up.isDown) {
                saltar();
            }

            if (moverDerecha.isDown && estatusInicio == 1) {
                moverseDer();
            }

            if (moverAtras.isDown && estatusInicio == 1) {
                moverseAtr();
            }

            if (estatusDerecha == 1) {
                if (jugador.position.x < 90) {
                    jugador.position.x += 2;
                }
                despDerTiempo++;
                if (despDerTiempo >= 25) {
                    estatusDerecha = 0;
                    estatusInicio = 1;
                    despDerTiempo = 0;
                }
            } else if (estatusAtras == 1) {
                if (jugador.position.x > 0) {
                    jugador.position.x -= 2;
                }
                despAtrTiempo++;
                if (despAtrTiempo >= 25) {
                    estatusAtras = 0;
                    estatusInicio = 1;
                    despAtrTiempo = 0;
                }
            }
        } else {
            // Modo automático
            var accion = datosDeEntrenamiento([estatusAire, estatuSuelo, jugador.position.x, nave.position.x, bala.position.x]);
            if (accion) {
                saltar();
            }
        }
    } else {
        if (regresandoDer) {
            jugador.position.x = 0;
            regresandoDer = false;
        }
        if (regresandoAtras) {
            jugador.position.x = 90;
            regresandoAtras = false;
        }
    }
}
```

### Función render
Muestra información de depuración en pantalla.

```
function render() {
    juego.debug.text('Estás en el aire: ' + estatusAire, 10, 20);
    juego.debug.text('Estás en el suelo: ' + estatuSuelo, 10, 40);
}
```

## Modo Automático: aprendizaje

El juego implementa un sistema de aprendizaje automático utilizando una red neuronal para que el personaje (jugador) aprenda a esquivar balas de manera autónoma. A continuación, te explicaré en detalle cómo el personaje aprende y cómo funciona el modo automático.

### Cómo Aprende el Personaje
El proceso de aprendizaje se basa en la recopilación de datos durante el juego manual y el entrenamiento de una red neuronal con estos datos. Aquí se describe paso a paso cómo se realiza este proceso:

#### Recopilación de Datos:

Durante el juego manual, se recopilan datos de entrenamiento cada vez que el jugador realiza una acción.
Los datos recopilados incluyen el estado actual del juego (como la posición del jugador, la posición de las balas, si el jugador está en el aire o en el suelo, etc.) y la acción realizada por el jugador (saltar, moverse a la derecha, moverse hacia atrás).
```
if (estatusInicio == 1) {
    if (estatusDerecha == 1) {
        datosEntrenamiento.push({
            input: [estatusAire, estatuSuelo, jugador.position.x, nave.position.x, bala.position.x],
            output: [estatusAire]
        });
    }
} else {
    if (estatusAtras == 1) {
        datosEntrenamiento.push({
            input: [estatusAire, estatuSuelo, jugador.position.x, nave.position.x, bala.position.x],
            output: [estatusAtras]
        });
    }
}
```

#### Entrenamiento de la Red Neuronal:

Después de recopilar suficientes datos, se entrena la red neuronal utilizando estos datos. El entrenamiento ajusta los pesos de la red para minimizar el error entre las predicciones de la red y las acciones reales realizadas por el jugador.
```
function enRedNeural() {
    nnEntrenamiento.train(datosEntrenamiento, { rate: 0.0003, iterations: 10000, shuffle: true });
}
```

### Cómo Funciona el Modo Automático
Una vez que la red neuronal está entrenada, se puede activar el modo automático. En este modo, la red neuronal toma decisiones basadas en el estado actual del juego. Aquí se describe cómo funciona este proceso:

#### Activación del Modo Automático:

Cuando se activa el modo automático, el juego deja de registrar las entradas del jugador y empieza a utilizar la red neuronal para determinar las acciones.
```
if (!eCompleto) {
    enRedNeural();
    eCompleto = true;
}
modoAuto = true;
```

#### Predicción de Acciones:

En cada actualización del juego, se obtiene el estado actual (como la posición del jugador, la posición de las balas, si el jugador está en el aire o en el suelo, etc.) y se pasa a la red neuronal para obtener una predicción de la acción a realizar.
```
function datosDeEntrenamiento(param_entrada) {
    nnSalida = nnNetwork.activate(param_entrada);
    return nnSalida[0] >= nnSalida[1];
}
```

La red neuronal devuelve una salida que se interpreta como la acción a realizar. Por ejemplo, si la red neuronal predice que el jugador debe saltar, se ejecuta la acción correspondiente.

```
if (modoAuto) {
    var accion = datosDeEntrenamiento([estatusAire, estatuSuelo, jugador.position.x, nave.position.x, bala.position.x]);
    if (accion) {
        saltar();
    }
}
```

### Flujo Completo del Juego

#### Juego Manual:

El jugador controla al personaje manualmente, y los datos de las acciones y el estado del juego se registran para el entrenamiento.

#### Entrenamiento:

Después de recopilar suficientes datos, la red neuronal se entrena utilizando estos datos.

#### Modo Automático:

Una vez que la red neuronal está entrenada, el modo automático se puede activar. En este modo, la red neuronal controla al personaje, tomando decisiones basadas en el estado del juego.

#### Aprendizaje: 
La red neuronal aprende observando las acciones del jugador y el estado del juego durante el juego manual.

#### Modo Automático: 
Una vez entrenada, la red neuronal puede predecir y ejecutar acciones basadas en el estado del juego, permitiendo que el personaje esquive balas automáticamente.

Este enfoque combina el aprendizaje supervisado (recopilación de datos y entrenamiento) con la toma de decisiones en tiempo real mediante una red neuronal para automatizar el control del personaje en el juego.