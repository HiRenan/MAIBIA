"""RPG CV PDF export service for Guild Hall."""

from __future__ import annotations

from datetime import datetime, timezone
from io import BytesIO
from textwrap import wrap

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from sqlmodel import Session, select

from app.models import Achievement, PlayerProfile, Skill


class CVExportError(Exception):
    """Base exception for CV export failures."""


class CVExportNotFoundError(CVExportError):
    """Raised when required player data is missing."""


def _slugify(text: str) -> str:
    clean = "".join(ch if ch.isalnum() else "-" for ch in text.lower())
    collapsed = "-".join(part for part in clean.split("-") if part)
    return collapsed or "player"


def _draw_wrapped(
    pdf: canvas.Canvas,
    *,
    text: str,
    x: float,
    y: float,
    width_chars: int = 90,
    line_height: float = 14,
) -> float:
    lines = wrap(text, width=width_chars) or [text]
    for line in lines:
        pdf.drawString(x, y, line)
        y -= line_height
    return y


def _group_skills(skills: list[Skill]) -> dict[str, list[Skill]]:
    grouped: dict[str, list[Skill]] = {}
    for skill in skills:
        key = skill.category_name or skill.category
        grouped.setdefault(key, []).append(skill)
    return grouped


def generate_rpg_cv_pdf(session: Session) -> tuple[bytes, str]:
    """Generate RPG CV PDF bytes and suggested filename."""
    profile = session.exec(select(PlayerProfile)).first()
    if not profile:
        raise CVExportNotFoundError("player_profile_not_found")

    skills = session.exec(select(Skill).order_by(Skill.category, Skill.name)).all()
    achievements = session.exec(
        select(Achievement).where(Achievement.unlocked.is_(True)).order_by(Achievement.name)
    ).all()

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    page_width, page_height = A4

    margin_x = 42
    y = page_height - 48

    def ensure_space(min_y: float = 90) -> None:
        nonlocal y
        if y > min_y:
            return
        pdf.showPage()
        y = page_height - 48
        pdf.setFont("Helvetica", 10)

    pdf.setTitle(f"{profile.name} RPG CV")
    pdf.setAuthor("DevQuest")

    pdf.setFont("Helvetica-Bold", 20)
    pdf.drawString(margin_x, y, "DevQuest RPG CV")
    y -= 28

    pdf.setFont("Helvetica", 11)
    y = _draw_wrapped(
        pdf,
        text=f"{profile.name} - {profile.title} (Level {profile.level})",
        x=margin_x,
        y=y,
        width_chars=80,
    )
    y = _draw_wrapped(
        pdf,
        text=f"XP: {profile.xp} / {profile.xp_next_level} | Class: {profile.dev_class}",
        x=margin_x,
        y=y,
        width_chars=80,
    )
    y = _draw_wrapped(
        pdf,
        text=f"Generated at: {datetime.now(timezone.utc).isoformat()}",
        x=margin_x,
        y=y,
        width_chars=90,
    )
    y -= 8

    ensure_space()
    pdf.setFont("Helvetica-Bold", 13)
    pdf.drawString(margin_x, y, "Attributes")
    y -= 18

    pdf.setFont("Helvetica", 10)
    stats = [
        ("STR", profile.strength, "Problem Solving"),
        ("INT", profile.intelligence, "Technical Knowledge"),
        ("DEX", profile.dexterity, "Adaptability"),
        ("WIS", profile.wisdom, "Soft Skills"),
    ]
    for code, value, label in stats:
        y = _draw_wrapped(
            pdf,
            text=f"- {code}: {value}/100 ({label})",
            x=margin_x,
            y=y,
            width_chars=90,
        )

    y -= 10
    ensure_space()
    pdf.setFont("Helvetica-Bold", 13)
    pdf.drawString(margin_x, y, "Equipment Slots (Unlocked Skills)")
    y -= 18

    grouped_skills = _group_skills(skills)
    pdf.setFont("Helvetica", 10)
    for branch_name in sorted(grouped_skills.keys()):
        branch_skills = [s for s in grouped_skills[branch_name] if s.unlocked]
        if not branch_skills:
            continue
        ensure_space()
        pdf.setFont("Helvetica-Bold", 11)
        pdf.drawString(margin_x, y, branch_name)
        y -= 14
        pdf.setFont("Helvetica", 10)
        for skill in branch_skills:
            y = _draw_wrapped(
                pdf,
                text=f"- {skill.name}: Lv.{skill.level}/{skill.max_level}",
                x=margin_x + 10,
                y=y,
                width_chars=88,
            )
            ensure_space()
        y -= 6

    ensure_space()
    pdf.setFont("Helvetica-Bold", 13)
    pdf.drawString(margin_x, y, "Earned Titles")
    y -= 18

    pdf.setFont("Helvetica", 10)
    if achievements:
        for achievement in achievements:
            y = _draw_wrapped(
                pdf,
                text=f"- {achievement.name}: {achievement.description}",
                x=margin_x,
                y=y,
                width_chars=92,
            )
            ensure_space()
    else:
        y = _draw_wrapped(
            pdf,
            text="- No unlocked achievements yet.",
            x=margin_x,
            y=y,
            width_chars=92,
        )

    y -= 10
    ensure_space()
    pdf.setFont("Helvetica-Oblique", 9)
    pdf.drawString(margin_x, y, "Generated by DevQuest Guild Hall")

    pdf.showPage()
    pdf.save()
    buffer.seek(0)

    filename = f"{_slugify(profile.name)}-rpg-cv.pdf"
    return buffer.read(), filename

