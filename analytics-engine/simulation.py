"""
EcoPulse: Mess Demand & Kitchen Preparation Forecasting Reference Model
NOTE: The Express backend (GET /api/mess-forecast) is the authoritative runtime source of truth.
Calculates student turnout via institutional attendance curves, precipitation elasticity,
and academic examination surges. Recommends preparation quantities with a 5% safety buffer.
"""
import json

def forecast_mess_demand(
    total_hostel_students: int = 1200,
    day_of_week: str = "Friday",
    weather: str = "Rainy",
    is_exam_week: bool = False,
    safety_buffer_pct: float = 5.0
) -> dict:
    # 1. Base Day Attendance Decay Multipliers
    day_attendance_factor = {
        "Monday": 0.92,
        "Tuesday": 0.90,
        "Wednesday": 0.88,
        "Thursday": 0.84,
        "Friday": 0.70,   # Local students leave for weekend
        "Saturday": 0.62,
        "Sunday": 0.68
    }
    
    factor = day_attendance_factor.get(day_of_week, 0.85)

    # 2. Weather Elasticity (Monsoon rain restricts outside food ordering)
    if weather.lower() == "rainy":
        factor += 0.06
        
    # 3. Academic Calendar Elasticity (Exams spike dining hall turnout)
    if is_exam_week:
        factor += 0.08
        
    factor = min(1.0, max(0.40, factor))
    expected_eaters = int(round(total_hostel_students * factor))
    
    # 4. Conventional Blind Prep vs Demand-Matched Recommended Prep with 5% Safety Buffer
    blind_cooked_kg = round(total_hostel_students * 0.380, 1) # 380g standard portion
    buffer_mult = 1.0 + (safety_buffer_pct / 100.0)
    recommended_cook_kg = round(expected_eaters * 0.360 * buffer_mult, 1)   # Calibrated portion with safety buffer
    avoidable_overproduction_kg = round(max(0.0, blind_cooked_kg - recommended_cook_kg), 1)
    
    # 5. Financial & Environmental Conversion
    cost_saved_inr = round(avoidable_overproduction_kg * 85.0, 2)          # ₹85/kg subsidized prep cost
    co2e_saved_kg = round(avoidable_overproduction_kg * 2.5, 2)            # IPCC 2.5 kg CO2e / kg food
    water_saved_liters = int(avoidable_overproduction_kg * 1200)           # 1200 L virtual water / kg food
    
    # 6. Qualitative Uncertainty Assessment (No fake confidence percentages)
    if day_of_week in ["Friday", "Saturday", "Sunday"]:
        uncertainty = "high"
        uncertainty_reason = "Weekend departures cause higher demand variance."
    elif weather.lower() == "rainy":
        uncertainty = "medium"
        uncertainty_reason = "Precipitation retains additional students on-campus."
    else:
        uncertainty = "low"
        uncertainty_reason = "Stable weekday attendance."

    # 7. Automated Kitchen Procurement Bill of Materials (BOM)
    bom = {
        "grain_rice_kg": round(expected_eaters * 0.12, 1),
        "dal_pulses_kg": round(expected_eaters * 0.05, 1),
        "wheat_flour_atta_kg": round(expected_eaters * 0.09, 1),
        "fresh_vegetables_kg": round(expected_eaters * 0.14, 1),
        "cooking_oil_liters": round(expected_eaters * 0.02, 1)
    }
    
    return {
        "status": "success",
        "parameters": {
            "day": day_of_week,
            "weather": weather,
            "isExamWeek": is_exam_week,
            "hostelCapacity": total_hostel_students
        },
        "forecast": {
            "expectedDiners": expected_eaters,
            "turnoutPercentage": round(factor * 100, 1),
            "conventionalCookingKg": blind_cooked_kg,
            "recommendedCookingKg": recommended_cook_kg,
            "projectedAvoidableOverproductionKg": avoidable_overproduction_kg,
            "projectedCostAvoidedInr": cost_saved_inr,
            "projectedCo2eAvoidedKg": co2e_saved_kg,
            "projectedWaterAvoidedLiters": water_saved_liters,
            "uncertainty": uncertainty,
            "uncertaintyReason": uncertainty_reason
        },
        "kitchenBillOfMaterials": bom
    }

if __name__ == "__main__":
    report = forecast_mess_demand(day_of_week="Friday", weather="Rainy", is_exam_week=False)
    print("=== EcoPulse Kitchen Optimization Forecast ===")
    print(json.dumps(report, indent=2))
