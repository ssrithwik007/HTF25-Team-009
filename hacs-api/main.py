import torch
import yaml
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from sklearn.preprocessing import LabelEncoder, StandardScaler
import pandas as pd
import xgboost as xgb
import pickle
from process import read_yaml

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing, can be restricted later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
MODEL_FILE = 'hazardous_asteroid_xgboost_model.json'
SCALER_FILE = 'scaler.pkl'
FEATURES_FILE = 'feature_names.pkl'
MODEL_PATH = BASE_DIR / "model" / MODEL_FILE
SCALER_PATH = BASE_DIR / "model" / SCALER_FILE
FEATURES_PATH = BASE_DIR / "model" / FEATURES_FILE
DEVICE = torch.device('cpu')

xgb_model = None
scaler = None
feature_names = None

try:
    # Load the trained XGBoost model
    xgb_model = xgb.XGBClassifier()
    xgb_model.load_model(MODEL_PATH)

    # Load the fitted StandardScaler
    with open(SCALER_PATH, 'rb') as f:
        scaler = pickle.load(f)

    # Load the feature names list (required for correct feature ordering)
    with open(FEATURES_PATH, 'rb') as f:
        feature_names = pickle.load(f)

    print("✅ Model, scaler, and feature names loaded successfully.")

except FileNotFoundError as e:
    print(f"❌ Error: Missing required file: {e.filename}")
    print("Please make sure all 3 artifact files are in the same directory.")
    xgb_model = None

class OutputData(BaseModel):
    is_hazardous: bool
    hazard_probability: float

@app.get("/")
def home():
    return {"message": "Welcome to the Hazardous Asteroid Detection System API!"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict", response_model=OutputData, status_code=200)
async def predict(file: UploadFile = File(...)):
    # Validate file type
    if not file.filename.endswith(('.yaml', '.yml')):
        raise HTTPException(status_code=400, detail="Only YAML files are accepted")
    
    try:
        # 1. Process the uploaded YAML file and convert to DataFrame
        df_processed = await read_yaml(file)

        # 2. Ensure all required columns are present and in the correct order
        #    This step is CRITICAL for the model to work correctly
        input_df = df_processed[feature_names]

        # 3. Scale the data using the pre-fitted scaler
        scaled_data = scaler.transform(input_df)

        # 4. Make prediction using the XGBoost model
        prediction_raw = xgb_model.predict(scaled_data)
        probability_raw = xgb_model.predict_proba(scaled_data)

        # 5. Format the output
        is_hazardous = bool(prediction_raw[0] == 1)
        # Get the probability of the 'hazardous' class (class 1)
        hazard_probability = float(probability_raw[0][1])
        
    except yaml.YAMLError as e:
        raise HTTPException(status_code=400, detail=f"Invalid YAML format: {str(e)}")
    except KeyError as e:
        raise HTTPException(status_code=400, detail={
            "error": f"Missing feature in input data: {e}",
            "message": f"The model requires {len(feature_names)} features."
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model prediction failed: {str(e)}")

    return {
        'is_hazardous': is_hazardous,
        'hazard_probability': hazard_probability
    }