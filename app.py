from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io
import cv2
import numpy as np
import base64
from io import BytesIO

# Charger le modèle YOLO
model = YOLO("best.pt")
class_names = ["fracture"]  

# Initialiser l'application FastAPI
app = FastAPI()

# Configurer CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permet toutes les origines (ajuster pour la production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Bienvenue dans l'API de prédiction des fractures !"}

@app.get("/favicon.ico")
def favicon():
    return {"message": "Favicon not configured."}

# Endpoint pour prédiction
@app.post("/predict/")
async def predict_image(file: UploadFile = File(...)):
    # Lire et traiter l'image
    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data))
    
    # Effectuer les prédictions avec YOLO
    results = model(image)
    predictions = []
    img_predict = np.array(image)
    
    for result in results:
        for box in result.boxes:
            label = class_names[int(box.cls.item())]
            confidence = box.conf.item()
            bbox = box.xyxy.tolist()  # Les coordonnées de la boîte englobante
            
            # Vérifier et extraire les coordonnées de bbox si nécessaire
            if isinstance(bbox[0], list):
                # Si bbox est une liste imbriquée, extrait la première sous-liste
                bbox = bbox[0]
            
            # Convertir les coordonnées en entiers
            x1, y1, x2, y2 = map(int, bbox)
            
            predictions.append({
                "label": label,
                "confidence": round(confidence * 100, 2),  
                "bbox": bbox
            })
            
            # Dessiner les boîtes englobantes sur l'image
            cv2.rectangle(img_predict, (x1, y1), (x2, y2), (0, 255, 0), 2)
    
    # Convertir l'image en base64 pour l'envoyer au frontend
    _, buffer = cv2.imencode('.jpg', img_predict)  # Encoder l'image en format JPG
    img_base64 = base64.b64encode(buffer).decode('utf-8')  # Convertir en base64
    
    return JSONResponse(content={"predictions": predictions, "image": img_base64})
