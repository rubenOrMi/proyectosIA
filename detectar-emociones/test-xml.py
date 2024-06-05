import cv2 as cv

faceRecognizer = cv.face.LBPHFaceRecognizer_create()

try:
    faceRecognizer.read('EmocionesLBPHFace3.xml')
    print("El archivo se cargó correctamente.")
except cv.error as e:
    print(f"Error al cargar el archivo: {e}")
