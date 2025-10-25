import torch
import yaml
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from model.model_def import Asteroid_Detection, LabelEncoder

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing, can be restricted later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# BASE_DIR = Path(__file__).resolve().parent
# MODEL_NAME = ""
# MODEL_PATH = BASE_DIR / "model" / MODEL_NAME
# DEVICE = torch.device('cpu')


# model = Asteroid_Detection()
# model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
# model.eval()
# classes = ["Hazardous", "Non-Hazardous"]
# label_encoder = LabelEncoder()
# label_encoder.fit_transform(classes)

class OutputData(BaseModel):
    prediction: str
    confidence: float


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
        # Read the YAML file
        contents = await file.read()
        yaml_data = yaml.safe_load(contents)
        
        # Extract parameters
        params = {
            'epoch_date_close_approach': yaml_data.get('Epoch Date Close Approach'),
            'relative_velocity_km_per_sec': yaml_data.get('Relative Velocity km per sec'),
            'relative_velocity_km_per_hr': yaml_data.get('Relative Velocity km per hr'),
            'miles_per_hour': yaml_data.get('Miles per hour'),
            'miss_dist_astronomical': yaml_data.get('Miss Dist.(Astronomical)'),
            'miss_dist_lunar': yaml_data.get('Miss Dist.(lunar)'),
            'miss_dist_kilometers': yaml_data.get('Miss Dist.(kilometers)'),
            'miss_dist_miles': yaml_data.get('Miss Dist.(miles)'),
            'jupiter_tisserand_invariant': yaml_data.get('Jupiter Tisserand Invariant'),
            'epoch_osculation': yaml_data.get('Epoch Osculation'),
            'semi_major_axis': yaml_data.get('Semi Major Axis'),
            'asc_node_longitude': yaml_data.get('Asc Node Longitude'),
            'perihelion_arg': yaml_data.get('Perihelion Arg'),
            'aphelion_dist': yaml_data.get('Aphelion Dist'),
            'perihelion_time': yaml_data.get('Perihelion Time'),
            'mean_anomaly': yaml_data.get('Mean Anomaly'),
            'mean_motion': yaml_data.get('Mean Motion'),
            'approach_year': yaml_data.get('approach_year'),
            'approach_month': yaml_data.get('approach_month'),
            'approach_day': yaml_data.get('approach_day'),
            'orbital_period': yaml_data.get('Orbital Period'),
            'orbit_uncertainity': yaml_data.get('Orbit Uncertainity')
        }
        
        # TODO: Process params and pass to model for prediction
        # For now, returning dummy prediction
        prediction = "Hazardous"  # Dummy prediction
        confidence = 0.95  # Dummy confidence
        
    except yaml.YAMLError as e:
        raise HTTPException(status_code=400, detail=f"Invalid YAML format: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model prediction failed: {str(e)}")

    return {"prediction": prediction, "confidence": confidence}