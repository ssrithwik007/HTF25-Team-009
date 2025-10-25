import yaml
import pandas as pd
from fastapi import HTTPException
from sklearn.preprocessing import LabelEncoder

async def read_yaml(file):
    """
    Reads a YAML file containing asteroid parameters and processes it into a DataFrame.
    
    Args:
        file: UploadFile object containing the YAML data
        
    Returns:
        pandas.DataFrame: Processed DataFrame with all features
    """
    try:
        # Read and parse the YAML file
        contents = await file.read()
        yaml_data = yaml.safe_load(contents)
        
        # Extract all required parameters from YAML
        params = {
            'Name': yaml_data.get('Name'),
            'Epoch Date Close Approach': yaml_data.get('Epoch Date Close Approach'),
            'Relative Velocity km per sec': yaml_data.get('Relative Velocity km per sec'),
            'Relative Velocity km per hr': yaml_data.get('Relative Velocity km per hr'),
            'Miles per hour': yaml_data.get('Miles per hour'),
            'Miss Dist.(Astronomical)': yaml_data.get('Miss Dist.(Astronomical)'),
            'Miss Dist.(lunar)': yaml_data.get('Miss Dist.(lunar)'),
            'Miss Dist.(kilometers)': yaml_data.get('Miss Dist.(kilometers)'),
            'Miss Dist.(miles)': yaml_data.get('Miss Dist.(miles)'),
            'Jupiter Tisserand Invariant': yaml_data.get('Jupiter Tisserand Invariant'),
            'Epoch Osculation': yaml_data.get('Epoch Osculation'),
            'Semi Major Axis': yaml_data.get('Semi Major Axis'),
            'Asc Node Longitude': yaml_data.get('Asc Node Longitude'),
            'Perihelion Arg': yaml_data.get('Perihelion Arg'),
            'Aphelion Dist': yaml_data.get('Aphelion Dist'),
            'Perihelion Time': yaml_data.get('Perihelion Time'),
            'Mean Anomaly': yaml_data.get('Mean Anomaly'),
            'Mean Motion': yaml_data.get('Mean Motion'),
            'approach_year': yaml_data.get('approach_year'),
            'approach_month': yaml_data.get('approach_month'),
            'approach_day': yaml_data.get('approach_day'),
            'Orbital Period': yaml_data.get('Orbital Period'),
            'Orbit Uncertainity': yaml_data.get('Orbit Uncertainity')
        }

    except yaml.YAMLError as e:
        raise HTTPException(status_code=400, detail=f"Invalid YAML format: {str(e)}")
    
    # Convert params dictionary to pandas DataFrame (single row)
    df_processed = pd.DataFrame([params])
    
    # Process date columns: convert to datetime and extract features
    date_columns = ['Epoch Date Close Approach', 'Epoch Osculation', 'Perihelion Time']
    for col in date_columns:
        if col in df_processed.columns:
            try:
                df_processed[col] = pd.to_datetime(df_processed[col], errors='coerce')
                # Extract year, month, day as numerical features
                df_processed[f'{col}_year'] = df_processed[col].dt.year
                df_processed[f'{col}_month'] = df_processed[col].dt.month
                df_processed[f'{col}_day'] = df_processed[col].dt.day
                # Drop original date column
                df_processed = df_processed.drop(col, axis=1)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Invalid date format in column {col}: {str(e)}")

    # Encode categorical variables (if any)
    categorical_columns = df_processed.select_dtypes(include=['object']).columns
    label_encoders = {}
    
    for col in categorical_columns:
        try:
            le = LabelEncoder()
            df_processed[col] = le.fit_transform(df_processed[col].astype(str))
            label_encoders[col] = le
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not encode column {col}: {e}")
            
    # Feature Engineering: Create additional velocity feature
    if 'Relative Velocity km per sec' in df_processed.columns:
        df_processed['velocity_km_per_day'] = df_processed['Relative Velocity km per sec'] * 86400
    
    # Create distance ratio features
    if 'Miss Dist.(Astronomical)' in df_processed.columns and 'Diameter' in df_processed.columns:
        df_processed['distance_to_diameter_ratio'] = df_processed['Miss Dist.(Astronomical)'] / (df_processed['Diameter'] + 1)

    # Create kinetic energy proxy (mass * velocity^2)
    if 'Diameter' in df_processed.columns and 'Relative Velocity km per sec' in df_processed.columns:
        df_processed['kinetic_energy_proxy'] = (df_processed['Diameter'] ** 3) * (df_processed['Relative Velocity km per sec'] ** 2)

    return df_processed