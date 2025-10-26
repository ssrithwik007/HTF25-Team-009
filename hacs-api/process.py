import yaml
import pandas as pd
import numpy as np
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

def get_feature_contributions(model, scaled_data, feature_names):
    """Calculate individual feature contributions"""
    importance = model.feature_importances_
    margin = model.predict(scaled_data, output_margin=True)[0]
    scaled_values = scaled_data[0]
    contributions = importance * scaled_values

    if np.sum(np.abs(contributions)) > 0:
        contributions = contributions * (margin / np.sum(np.abs(contributions)))

    feature_contributions = {}
    for feature, contrib, value in zip(feature_names, contributions, scaled_values):
        feature_contributions[feature] = {
            'contribution': float(contrib),
            'scaled_value': float(value)
        }

    return feature_contributions

def explain_feature_influence(feature_name, contribution, actual_value, is_hazardous):
    """
    Generate human-readable explanation for why a feature influenced the prediction
    """
    impact = "increased" if contribution > 0 else "decreased"
    direction = "hazardous" if contribution > 0 else "non-hazardous"

    # Feature-specific explanations
    explanations = {
        'Miss Dist.(Astronomical)': {
            'low': f"The asteroid passes very close to Earth ({actual_value:.4f} AU), significantly increasing the hazard risk.",
            'high': f"The asteroid maintains a safe distance from Earth ({actual_value:.4f} AU), reducing the hazard risk."
        },
        'Diameter': {
            'low': f"The asteroid is relatively small ({actual_value:.1f}m), reducing potential impact damage.",
            'high': f"The asteroid is large ({actual_value:.1f}m), which would cause significant damage if it impacted Earth."
        },
        'Relative Velocity km per sec': {
            'low': f"The asteroid moves at a moderate speed ({actual_value:.2f} km/s), resulting in lower impact energy.",
            'high': f"The asteroid travels at high speed ({actual_value:.2f} km/s), which increases impact energy."
        },
        'Orbit Uncertainity': {
            'low': f"The orbit is well-known (uncertainty: {actual_value}), allowing accurate predictions.",
            'high': f"The orbit has higher uncertainty ({actual_value}), making the trajectory less predictable."
        },
        'Orbital Period': {
            'low': f"Short orbital period ({actual_value:.2f} years) means more frequent approaches to Earth.",
            'high': f"Long orbital period ({actual_value:.2f} years) means infrequent approaches to Earth."
        }
    }

    # Determine if value is "low" or "high" based on contribution
    value_category = 'high' if contribution > 0 else 'low'

    # Get specific explanation or generate generic one
    if feature_name in explanations:
        explanation = explanations[feature_name].get(value_category,
            f"This feature {impact} the {direction} classification.")
    else:
        explanation = f"Feature value ({actual_value}) {impact} the likelihood of hazardous classification."

    return explanation

def get_top_influential_features(feature_contributions, original_values, top_n=5):
    """
    Get top N most influential features with explanations
    """
    # Sort by absolute contribution
    sorted_features = sorted(
        feature_contributions.items(),
        key=lambda x: abs(x[1]['contribution']),
        reverse=True
    )

    influential_features = []
    for feature, data in sorted_features[:top_n]:
        # Get the actual (unscaled) value
        actual_value = original_values[feature].values[0] if feature in original_values else data['scaled_value']

        # Determine if this increases or decreases hazard risk
        impact_direction = "INCREASES" if data['contribution'] > 0 else "DECREASES"

        # Get explanation
        explanation = explain_feature_influence(
            feature,
            data['contribution'],
            actual_value,
            data['contribution'] > 0
        )

        influential_features.append({
            'feature': feature,
            'actual_value': float(actual_value),
            'contribution_score': float(abs(data['contribution'])),
            'impact_direction': impact_direction,
            'explanation': explanation
        })

    return influential_features

def calculate_confidence_metrics(probabilities):
    """Calculate confidence metrics for the prediction"""
    hazard_prob = probabilities[0][1]
    confidence_score = abs(hazard_prob - 0.5) * 2

    if confidence_score > 0.8:
        confidence_level = "VERY HIGH"
    elif confidence_score > 0.6:
        confidence_level = "HIGH"
    elif confidence_score > 0.4:
        confidence_level = "MODERATE"
    else:
        confidence_level = "LOW"

    return {
        'confidence_score': float(confidence_score),
        'confidence_level': confidence_level
    }

def generate_summary(is_hazardous, influential_features, hazard_probability):
    """Generate a concise summary of the classification"""
    classification = "HAZARDOUS" if is_hazardous else "NON-HAZARDOUS"

    summary = f"Classification: {classification} ({hazard_probability:.1f}% confidence)\n\n"
    summary += "Key Factors:\n"

    for i, feature in enumerate(influential_features, 1):
        emoji = "🔴" if feature['impact_direction'] == "INCREASES" else "🟢"
        summary += f"{i}. {emoji} {feature['feature']}: {feature['explanation']}\n"

    return summary