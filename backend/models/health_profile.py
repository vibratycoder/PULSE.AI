"""Health profile and citation data models."""

from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class Medication(BaseModel):
    """A medication the user is currently taking.

    Attributes:
        name: Drug name (e.g. "Lisinopril").
        dosage: Dosage string (e.g. "10mg QD").
    """

    name: str
    dosage: str


class Vaccine(BaseModel):
    """A vaccine the user has received.

    Attributes:
        name: Vaccine name (e.g. "COVID-19").
        date: Date the vaccine was administered.
    """

    name: str
    date: str = ""


class LabResult(BaseModel):
    """A single lab test result.

    Attributes:
        name: Test name (e.g. "LDL").
        value: Numeric or string value.
        unit: Measurement unit.
        flag: Optional flag like "high" or "low".
        date_taken: Date the lab was drawn.
    """

    name: str
    value: str
    unit: str = ""
    flag: str = ""
    date_taken: date = Field(default_factory=date.today)


class HealthProfile(BaseModel):
    """Complete health profile for a user.

    Attributes:
        user_id: Unique user identifier.
        name: User's display name.
        age: Age in years.
        sex: Biological sex.
        height_cm: Height in centimeters.
        weight_kg: Weight in kilograms.
        conditions: List of diagnosed conditions.
        medications: Current medications.
        allergies: Known allergies.
        family_history: Notable family medical history.
        lifestyle_notes: Exercise, sleep, diet notes.
        lab_results: Recent lab results.
        health_goals: User-stated health goals.
    """

    user_id: str = ""
    name: str = ""
    age: int = 0
    sex: str = ""
    height_cm: float = 0.0
    weight_kg: float = 0.0
    conditions: list[str] = Field(default_factory=list)
    medications: list[Medication] = Field(default_factory=list)
    allergies: list[str] = Field(default_factory=list)
    family_history: list[str] = Field(default_factory=list)
    lifestyle_notes: list[str] = Field(default_factory=list)
    lab_results: list[LabResult] = Field(default_factory=list)
    vaccines: list[Vaccine] = Field(default_factory=list)
    health_goals: list[str] = Field(default_factory=list)


class Citation(BaseModel):
    """A PubMed citation attached to a health response.

    Attributes:
        pmid: PubMed ID.
        title: Article title.
        journal: Journal name.
        year: Publication year.
        abstract: Article abstract text.
    """

    pmid: str
    title: str
    journal: str
    year: str
    abstract: str = ""


class ChatRequest(BaseModel):
    """Incoming chat request from the user.

    Attributes:
        message: The user's health question.
        user_id: Optional user ID to load their profile.
    """

    message: str
    user_id: str = ""
    file_text: str = ""


class ChatResponse(BaseModel):
    """Chat response returned to the client.

    Attributes:
        response: Claude's response text.
        citations: PubMed citations referenced in the response.
        is_emergency: Whether emergency triage was triggered.
    """

    response: str
    citations: list[Citation] = Field(default_factory=list)
    is_emergency: bool = False
