"""Demo profiles for testing and demonstration."""

from datetime import date

from backend.models.health_profile import HealthProfile, LabResult, Medication, Vaccine

MARCUS_CHEN = HealthProfile(
    user_id="demo-marcus-chen",
    name="Marcus Chen",
    age=42,
    sex="male",
    height_cm=180,
    weight_kg=91,
    conditions=["hypertension", "prediabetes"],
    medications=[
        Medication(name="Lisinopril", dosage="10mg QD"),
        Medication(name="Metformin", dosage="500mg BID"),
    ],
    allergies=["penicillin"],
    family_history=["father MI at age 58"],
    lifestyle_notes=[
        "inconsistent exercise",
        "average 5.5hr sleep per night",
    ],
    lab_results=[
        LabResult(name="HbA1c", value="6.3", unit="%", flag="high", date_taken=date(2026, 3, 15)),
        LabResult(name="LDL", value="158", unit="mg/dL", flag="high", date_taken=date(2026, 3, 15)),
        LabResult(name="HDL", value="42", unit="mg/dL", flag="low", date_taken=date(2026, 3, 15)),
        LabResult(name="Fasting glucose", value="118", unit="mg/dL", flag="high", date_taken=date(2026, 3, 15)),
        LabResult(name="Triglycerides", value="195", unit="mg/dL", flag="high", date_taken=date(2026, 3, 15)),
        LabResult(name="eGFR", value="74", unit="mL/min/1.73m²", flag="low", date_taken=date(2026, 3, 15)),
    ],
    vaccines=[
        Vaccine(name="COVID-19 (Pfizer)", date="2025-10-12"),
        Vaccine(name="Influenza", date="2025-09-20"),
        Vaccine(name="Tdap", date="2022-06-15"),
    ],
    health_goals=["reduce cardiovascular risk", "control blood sugar"],
)

DEMO_PROFILES: dict[str, HealthProfile] = {
    "demo-marcus-chen": MARCUS_CHEN,
}


def get_demo_profile(user_id: str) -> HealthProfile | None:
    """Retrieve a demo profile by user ID.

    Args:
        user_id: The demo user ID to look up.

    Returns:
        The matching HealthProfile, or None if not found.
    """
    return DEMO_PROFILES.get(user_id)
