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


model = YOLO("best.pt")
class_names = ["fracture"]  


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
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


@app.post("/predict/")
async def predict_image(file: UploadFile = File(...)):

    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data))
    

    results = model(image)
    predictions = []
    img_predict = np.array(image)
    
    for result in results:
        for box in result.boxes:
            label = class_names[int(box.cls.item())]
            confidence = box.conf.item()
            bbox = box.xyxy.tolist()  
            

            if isinstance(bbox[0], list):

                bbox = bbox[0]
            

            x1, y1, x2, y2 = map(int, bbox)
            
            predictions.append({
                "label": label,
                "confidence": round(confidence * 100, 2),  
                "bbox": bbox
            })
            

            cv2.rectangle(img_predict, (x1, y1), (x2, y2), (0, 255, 0), 2)
    

    _, buffer = cv2.imencode('.jpg', img_predict)  
    img_base64 = base64.b64encode(buffer).decode('utf-8')  
    
    return JSONResponse(content={"predictions": predictions, "image": img_base64})
