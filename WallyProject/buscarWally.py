import cv2 as cv

# Cargar la imagen
image_path = "test/1.jpg"
image = cv.imread(image_path)

# Comprobar si la imagen se cargó correctamente
if image is None:
    print("No se pudo cargar la imagen. Verifique la ruta y vuelva a intentarlo.")
    exit()

# Cargar el clasificador en cascada
haar = cv.CascadeClassifier('cascade_bk.xml')
font = cv.FONT_HERSHEY_SIMPLEX

# Convertir la imagen a escala de grises
gray = cv.cvtColor(image, cv.COLOR_BGR2GRAY)

# Mejorar el contraste de la imagen en escala de grises
gray = cv.equalizeHist(gray)

# Realizar la detección de objetos
# Ajusta los parámetros scaleFactor y minNeighbors según sea necesario
prueba = haar.detectMultiScale(gray, scaleFactor=1.01, minNeighbors=400, minSize=(55, 55))

# Verificar si se detectaron objetos
if len(prueba) == 0:
    print("No se detectó a Wally en la imagen.")
else:
    # Dibujar los rectángulos y texto sobre la imagen
    for (x, y, w, h) in prueba:
        pt1 = (x, y)
        pt2 = (x + w, y + h)

        cv.rectangle(image, pt1, pt2, (255, 0, 0), 2)
        cv.putText(image, 'Wally', (x + 10, y + 30), font, 0.7, (255, 255, 255), 2)

    # Mostrar la imagen con los resultados
    cv.imshow('Resultado de deteccion', image)
    cv.waitKey(0)
    cv.destroyAllWindows()
