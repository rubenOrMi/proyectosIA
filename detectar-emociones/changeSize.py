import os
import cv2

def resize_images_in_folder(base_path, size=(48, 48)):
    for root, dirs, files in os.walk(base_path):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.gif')):
                image_path = os.path.join(root, file)
                try:
                    img = cv2.imread(image_path)
                    if img is not None:
                        resized_img = cv2.resize(img, size, interpolation=cv2.INTER_AREA)
                        cv2.imwrite(image_path, resized_img)
                        print(f"Resized and saved {image_path}")
                    else:
                        print(f"Failed to load image {image_path}")
                except Exception as e:
                    print(f"Could not process {image_path}: {e}")

base_path = 'dataset'
resize_images_in_folder(base_path)

