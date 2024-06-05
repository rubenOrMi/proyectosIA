# Proyecto de Reconocimiento de Sentimientos

Este proyecto utiliza OpenCV para capturar, entrenar y reconocer emociones faciales. Se reconocen tres emociones: feliz, sorprendido y triste.

## Obtener Imágenes

El primer paso consiste en capturar imágenes utilizando una cámara web y el clasificador de rostros Haar Cascade. Las imágenes se almacenan en carpetas correspondientes a cada emoción.

```python
import cv2 as cv
import numpy as np

face = cv.CascadeClassifier('haarcascade_frontalface_alt.xml')
cap = cv.VideoCapture(0)
i = 0
while True:
    ret, frame = cap.read()
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    faces = face.detectMultiScale(gray, 1.3, 5)
    for (x, y, w, h) in faces:
        frame2 = frame[y-10:y + h +10, x-10:x + w +10]
        frame2 = cv.resize(frame2, (100, 100), interpolation=cv.INTER_AREA)
        cv.imwrite("emociones/triste/triste" + str(i) + ".png", frame2)
    cv.imshow('faces', frame)
    i = i + 1
    k = cv.waitKey(1)
    if k == 27:
        break
cap.release()
cv.destroyAllWindows()
```

## Crear módelo

Una vez obtenidas las imágenes, se entrenará un modelo de reconocimiento facial utilizando el algoritmo LBPH (Local Binary Patterns Histograms). El modelo se guarda en un archivo XML para su uso posterior.

```python
import cv2 as cv
import numpy as np
import os

dataSet = 'emociones'
faces = os.listdir(dataSet)
print(faces)

labels = []
facesData = []
label = 0
for face in faces:
    facePath = dataSet + '/' + face
    for faceName in os.listdir(facePath):
        labels.append(label)
        facesData.append(cv.imread(facePath + '/' + faceName, 0))
    label = label + 1
print(np.count_nonzero(np.array(labels) == 0))

faceRecognizer = cv.face.LBPHFaceRecognizer_create()
faceRecognizer.train(facesData, np.array(labels))
faceRecognizer.write('EmocionesLBPHFace.xml')
print("Archivo xml creado con éxito")
```

## Detectar Emoción

Finalmente, el modelo entrenado se utiliza para reconocer las emociones en tiempo real a través de la cámara web. El sistema detecta rostros, los clasifica según las emociones entrenadas y muestra los resultados en la pantalla.

```python
import cv2 as cv
import os

dataSet = 'emociones'
faces = os.listdir(dataSet)
faceRecognizer = cv.face.LBPHFaceRecognizer_create()
faceRecognizer.read('EmocionesLBPHFace.xml')
value_LBPHface = 70

cap = cv.VideoCapture(0)
rostro = cv.CascadeClassifier('haarcascade_frontalface_alt.xml')
while True:
    ret, frame = cap.read()
    if ret == False: break
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    cpGray = gray.copy()
    rostros = rostro.detectMultiScale(gray, 1.3, 3)
    for (x, y, w, h) in rostros:
        frame2 = cpGray[y:y + h, x:x + w]
        frame2 = cv.resize(frame2, (100, 100), interpolation=cv.INTER_CUBIC)
        result = faceRecognizer.predict(frame2)
        if result[1] > value_LBPHface:
            cv.putText(frame, '{}'.format(faces[result[0]]), (x, y - 25), 2, 1.1, (0, 255, 0), 1, cv.LINE_AA)
            cv.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
        else:
            cv.putText(frame, 'Desconocido', (x, y - 20), 2, 0.8, (0, 0, 255), 1, cv.LINE_AA)
            cv.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 2)
    cv.imshow('frame', frame)
    k = cv.waitKey(1)
    if k == 27:
        break
cap.release()
cv.destroyAllWindows()
```

## Requisitos
* Python 3
* OpenCV
* Haar Cascade XML file (haarcascade_frontalface_alt.xml)

## Instrucciones
1. Obtener imágenes: Ejecutar el script para capturar imágenes de las emociones deseadas.
2. Crear modelo: Entrenar el modelo con las imágenes capturadas y guardar el archivo XML.
3. Detectar emoción: Utilizar el modelo entrenado para detectar y reconocer emociones en tiempo real.

Este proyecto proporciona una base para el reconocimiento de emociones utilizando técnicas de visión por computadora y aprendizaje automático. Las mejoras pueden incluir la ampliación del conjunto de datos, el ajuste de los parámetros del modelo y la implementación de técnicas de preprocesamiento de imágenes.

