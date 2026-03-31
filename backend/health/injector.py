"""Health system prompt injector.

Assembles the three-layer system prompt for Claude API calls:
1. Pulse.ai base philosophy (evidence-first, safety-first, 911 check)
2. User's complete HealthProfile
3. PubMed abstracts retrieved for the current question

This is the core of Pulse.ai — every response is grounded in the user's
health context and peer-reviewed evidence.
"""

from backend.models.health_profile import Citation, HealthProfile

BASE_PHILOSOPHY = """You are Pulse.ai — a personalized AI health companion where evidence is the product.

CORE PRINCIPLES:
- Evidence-first: Every claim must be supported by the cited peer-reviewed studies below (sourced from PubMed, Europe PMC, and Semantic Scholar). If no citation supports a claim, say "based on my medical training" and note that no specific study was retrieved.
- Safety-first: If the user describes ANY emergency symptoms (chest pain, difficulty breathing, sudden severe headache, one-sided weakness, slurred speech, coughing/vomiting blood, severe abdominal pain, throat swelling), respond "Please call 911 or go to the ER immediately" BEFORE anything else.
- Contextualize, don't diagnose: You educate and provide context. You NEVER diagnose conditions or prescribe treatments.
- You are NOT a replacement for a doctor. Encourage professional consultation for any concerning findings.
- You are NOT a prescription service. You may explain medications but NEVER prescribe.

RESPONSE FORMAT:
- Keep responses under 250 words unless the complexity genuinely requires more.
- Use clear, empathetic, non-alarmist language at an 8th-grade reading level.
- When citing evidence, use the format: (Source: [Title] — [Journal] [Year], PMID: [number])
- End with a practical, actionable takeaway when appropriate.
- If the user has a health profile loaded, personalize your response to their specific conditions, medications, and history."""


def _format_profile_section(profile: HealthProfile) -> str:
    """Format a HealthProfile into a readable system prompt section.

    Args:
        profile: The user's health profile.

    Returns:
        Formatted string describing the user's health context.
    """
    if not profile.name and not profile.conditions:
        return ""

    sections: list[str] = ["USER HEALTH PROFILE:"]

    if profile.name:
        sections.append(f"Name: {profile.name}")
    if profile.age:
        sections.append(f"Age: {profile.age}, Sex: {profile.sex}")
    if profile.height_cm:
        bmi = profile.weight_kg / ((profile.height_cm / 100) ** 2)
        sections.append(
            f"Height: {profile.height_cm}cm, Weight: {profile.weight_kg}kg, "
            f"BMI: {bmi:.1f}"
        )
    if profile.conditions:
        sections.append(f"Conditions: {', '.join(profile.conditions)}")
    if profile.medications:
        meds = [f"{m.name} {m.dosage}" for m in profile.medications]
        sections.append(f"Medications: {', '.join(meds)}")
    if profile.allergies:
        sections.append(f"Allergies: {', '.join(profile.allergies)}")
    if profile.family_history:
        sections.append(f"Family history: {', '.join(profile.family_history)}")
    if profile.lifestyle_notes:
        sections.append(f"Lifestyle: {', '.join(profile.lifestyle_notes)}")
    if profile.lab_results:
        lab_lines: list[str] = []
        for lab in profile.lab_results:
            flag_str = f" ({lab.flag})" if lab.flag else ""
            lab_lines.append(
                f"  {lab.name}: {lab.value} {lab.unit}{flag_str} [{lab.date_taken}]"
            )
        sections.append("Recent labs:\n" + "\n".join(lab_lines))
    if profile.vaccines:
        vax = [f"{v.name} ({v.date})" if v.date else v.name for v in profile.vaccines]
        sections.append(f"Vaccines: {', '.join(vax)}")
    if profile.health_goals:
        sections.append(f"Goals: {', '.join(profile.health_goals)}")

    return "\n".join(sections)


def _format_citations_section(citations: list[Citation]) -> str:
    """Format PubMed citations into a system prompt section.

    Args:
        citations: List of Citation objects to include.

    Returns:
        Formatted string with citation details for Claude to reference.
    """
    if not citations:
        return (
            "EVIDENCE STATUS: No peer-reviewed citations were retrieved from any "
            "source (PubMed, Europe PMC, Semantic Scholar) for this query. "
            "Base your response on medical training knowledge only and note this "
            "to the user."
        )

    sections: list[str] = [
        "RETRIEVED PEER-REVIEWED EVIDENCE (cite these in your response):"
    ]
    for i, cite in enumerate(citations, 1):
        sections.append(
            f"\n[{i}] {cite.title}\n"
            f"    Journal: {cite.journal} ({cite.year})\n"
            f"    PMID: {cite.pmid}\n"
            f"    Abstract: {cite.abstract[:800]}"
        )

    return "\n".join(sections)


DOCUMENT_INSTRUCTIONS = """UPLOADED DOCUMENT ANALYSIS:
The user has attached a document to their message. You MUST:
- Thoroughly read and analyze the full document content provided after "--- UPLOADED DOCUMENT ---"
- Extract all relevant health data: lab values, diagnoses, medications, vitals, imaging results, provider notes
- Cross-reference any findings with the user's existing health profile above
- Flag any values that are abnormal, out of range, or clinically significant
- Identify any discrepancies between the document and the user's known profile
- Use the document data as primary source material when answering the user's question
- Cite specific values, dates, and findings from the document in your response
- If the document contains lab results, compare them to standard reference ranges
- If the document is unclear or partially illegible, note which parts could not be read"""


def build_health_system_prompt(
    profile: HealthProfile,
    question: str,
    citations: list[Citation],
    has_file: bool = False,
) -> str:
    """Assemble the complete system prompt for a Claude API call.

    Combines the base philosophy, user health profile, PubMed citations,
    and optional document analysis instructions into a single system prompt
    that grounds Claude's response in evidence and the user's personal
    health context.

    Args:
        profile: The user's health profile (may be empty for anonymous users).
        question: The user's health question (used for context).
        citations: PubMed citations retrieved for this question.
        has_file: Whether the user has attached a document.

    Returns:
        Complete system prompt string ready for the Claude API.
    """
    parts: list[str] = [BASE_PHILOSOPHY]

    profile_section = _format_profile_section(profile)
    if profile_section:
        parts.append(profile_section)

    parts.append(_format_citations_section(citations))

    if has_file:
        parts.append(DOCUMENT_INSTRUCTIONS)

    return "\n\n---\n\n".join(parts)
