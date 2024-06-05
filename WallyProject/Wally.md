# Documentación del Código de Búsqueda de Wally

Este documento describe el funcionamiento del código de búsqueda de Wally utilizando OpenCV y el clasificador en cascada. Además, se proporciona información sobre la herramienta Cascade Training GUI.

## Descripción del Código

El código utiliza la biblioteca OpenCV para detectar rostros en una imagen de prueba y dibujar rectángulos alrededor de ellos. Aquí se presenta una descripción detallada del funcionamiento del código:

### Importar Bibliotecas

```python
import numpy as np
import cv2 as cv
from screeninfo import get_monitors
```
### Obtener el Tamaño de la Pantalla
La función get_screen_size obtiene el tamaño del primer monitor conectado.
```
def get_screen_size():
    monitors = get_monitors()
    if monitors:
        monitor = monitors[0] 
        return monitor.width, monitor.height
    return 800, 600 
```
### Redimensionar la Imagen
La función resize_image redimensiona la imagen manteniendo la relación de aspecto para ajustarla al tamaño máximo permitido por la pantalla.
```
def resize_image(image, max_width, max_height):
    height, width = image.shape[:2]
    if width > max_width or height > max_height:
        scaling_factor = min(max_width / width, max_height / height)
        new_width = int(width * scaling_factor)
        new_height = int(height * scaling_factor)
        return cv.resize(image, (new_width, new_height))
    return image
```
### Cargar el Clasificador de Rostros
Se carga el clasificador en cascada previamente entrenado para la detección de rostros.
```
rostro = cv.CascadeClassifier('cascade.xml')
```
### Leer y Procesar la Imagen
Se lee la imagen de prueba, se obtiene el tamaño de la pantalla y se redimensiona la imagen para ajustarse a la pantalla.
```
frame = cv.imread("test/test_wally9.png")
screen_width, screen_height = get_screen_size()
frame_resized = resize_image(frame, screen_width, screen_height)
```

### Convertir la Imagen a Escala de Grises
La imagen se convierte a escala de grises para facilitar la detección de rostros.

```
gray = cv.cvtColor(frame_resized, cv.COLOR_BGR2GRAY)
```
### Detectar Rostros
Se detectan los rostros en la imagen utilizando el clasificador en cascada.

```
rostros = rostro.detectMultiScale(gray, scaleFactor=1.01, minNeighbors=400, minSize=(55, 55))
```
### Dibujar Rectángulos
Se dibujan rectángulos alrededor de los rostros detectados.
```
for (x, y, w, h) in rostros:
    frame_resized = cv.rectangle(frame_resized, (x, y), (x + w, y + h), (0, 255, 0), 2)
```
### Mostrar la Imagen
Se muestra la imagen procesada en una ventana.


```
cv.imshow('Wally', frame_resized)
cv.waitKey(0)
cv.destroyAllWindows()
```

## Cascade Training GUI
Cascade Training GUI es una herramienta que facilita la creación y el entrenamiento de clasificadores en cascada para la detección de objetos utilizando la biblioteca OpenCV. Aquí hay una descripción de su funcionamiento:

### Funcionalidades Principales
* Interfaz Gráfica: Proporciona una interfaz gráfica para gestionar el proceso de entrenamiento, desde la selección de imágenes positivas y negativas hasta la configuración de parámetros de entrenamiento.
* Selección de Imágenes: Permite cargar y etiquetar imágenes positivas (contienen el objeto de interés) y negativas (no contienen el objeto de interés).
* Configuración de Parámetros: Ofrece opciones para configurar los parámetros del entrenamiento en cascada, como el número de etapas, el tamaño mínimo del objeto, y los factores de escala y vecindad.
* Generación de Archivos: Genera automáticamente los archivos necesarios para el entrenamiento en cascada, incluyendo los archivos de descriptores y los archivos de datos de entrenamiento.
* Entrenamiento y Evaluación: Ejecuta el proceso de entrenamiento utilizando los parámetros configurados y permite evaluar el rendimiento del clasificador entrenado.

### Cómo Funciona
* Preparación de Datos: Se cargan imágenes positivas y negativas y se etiquetan los objetos de interés en las imágenes positivas.
* Configuración: Se configuran los parámetros del entrenamiento en cascada, ajustando factores como el número de etapas y el tamaño del objeto.
* Entrenamiento: Se ejecuta el proceso de entrenamiento, donde el algoritmo de aprendizaje automático ajusta los parámetros del clasificador para maximizar la detección del objeto de interés.
* Evaluación: Se evalúa el rendimiento del clasificador entrenado utilizando un conjunto de datos de prueba y se ajustan los parámetros según sea necesario.




