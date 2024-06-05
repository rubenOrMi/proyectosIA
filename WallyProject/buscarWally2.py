import numpy as np
import cv2 as cv
from screeninfo import get_monitors

# Obtener el tamaño de la pantalla
def get_screen_size():
    monitors = get_monitors()
    if monitors:
        monitor = monitors[0]  # Usar el primer monitor
        return monitor.width, monitor.height
    return 800, 600  # Valor predeterminado en caso de fallo

# Redimensionar la imagen manteniendo la relación de aspecto
def resize_image(image, max_width, max_height):
    height, width = image.shape[:2]
    if width > max_width or height > max_height:
        scaling_factor = min(max_width / width, max_height / height)
        new_width = int(width * scaling_factor)
        new_height = int(height * scaling_factor)
        return cv.resize(image, (new_width, new_height))
    return image

# Cargar el clasificador de rostros
rostro = cv.CascadeClassifier('cascade.xml')

# Leer la imagen
frame = cv.imread("test/test_wally9.png")

# Obtener las dimensiones de la pantalla
screen_width, screen_height = get_screen_size()

# Redimensionar la imagen para que se ajuste a la pantalla
frame_resized = resize_image(frame, screen_width, screen_height)

# Convertir la imagen a escala de grises
gray = cv.cvtColor(frame_resized, cv.COLOR_BGR2GRAY)

# Detectar rostros
rostros = rostro.detectMultiScale(gray, scaleFactor=1.01, minNeighbors=400, minSize=(55, 55))

# Dibujar rectángulos alrededor de los rostros detectados
for (x, y, w, h) in rostros:
    frame_resized = cv.rectangle(frame_resized, (x, y), (x + w, y + h), (0, 255, 0), 2)

# Mostrar la imagen
cv.imshow('Wally', frame_resized)
cv.waitKey(0)
cv.destroyAllWindows()
