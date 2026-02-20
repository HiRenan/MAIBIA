"""Gamification endpoints — profile, skills, achievements, activity log."""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlmodel import Session, col, select

from app.database import get_session
from app.models import Achievement, ActivityLog, PlayerProfile, Skill
from app.services.mock_ai import weekly_summary

router = APIRouter(prefix="/gamification", tags=["gamification"])


@router.get("/profile")
async def get_profile(session: Session = Depends(get_session)):
    """Get player profile with RPG stats."""
    profile = session.exec(select(PlayerProfile)).first()
    if not profile:
        return {"error": "No profile found"}
    return {
        "name": profile.name,
        "title": profile.title,
        "dev_class": profile.dev_class,
        "level": profile.level,
        "xp": profile.xp,
        "xp_next_level": profile.xp_next_level,
        "avatar_initials": profile.avatar_initials,
        "stats": {
            "STR": {"value": profile.strength, "label": "Problem Solving"},
            "INT": {"value": profile.intelligence, "label": "Technical Knowledge"},
            "DEX": {"value": profile.dexterity, "label": "Adaptability"},
            "WIS": {"value": profile.wisdom, "label": "Soft Skills"},
        },
    }


@router.get("/achievements")
async def get_achievements(session: Session = Depends(get_session)):
    """Get all achievements with unlock status."""
    achievements = session.exec(select(Achievement)).all()
    return {
        "achievements": [
            {
                "name": a.name,
                "description": a.description,
                "icon": a.icon,
                "category": a.category,
                "color": a.color,
                "unlocked": a.unlocked,
                "unlock_date": a.unlock_date,
            }
            for a in achievements
        ]
    }


@router.get("/skills")
async def get_skills(session: Session = Depends(get_session)):
    """Get all skills grouped by category (matches frontend BRANCHES format)."""
    skills = session.exec(select(Skill)).all()
    branches: dict[str, dict] = {}
    for skill in skills:
        cat = skill.category
        if cat not in branches:
            branches[cat] = {
                "id": cat,
                "name": skill.category_name,
                "color": skill.color,
                "skills": [],
            }
        branches[cat]["skills"].append({
            "id": skill.skill_id,
            "name": skill.name,
            "level": skill.level,
            "maxLevel": skill.max_level,
            "unlocked": skill.unlocked,
            "description": skill.description,
            "projects": [p for p in skill.projects.split(",") if p],
        })
    return {"branches": list(branches.values())}


@router.get("/timeline")
async def get_timeline():
    """Real career timeline from CV data."""
    return {
        "entries": [
            # ── Experience ──────────────────────────────────────
            {
                "id": "exp-senai",
                "category": "experience",
                "year": "2025",
                "yearEnd": None,
                "title": "Residente em Inteligência Artificial",
                "place": "SENAI/SC",
                "description": "Residência em IA aplicada: Machine Learning, Deep Learning, Computer Vision, IA Generativa, Otimização e IA Embarcada. Desenvolvimento de soluções end-to-end com deploy em produção.",
                "skills": ["Python", "Machine Learning", "Deep Learning", "Computer Vision", "Generative AI", "FastAPI"],
                "color": "#f0c040",
                "icon": "brain",
            },
            {
                "id": "exp-paradigma-n2",
                "category": "experience",
                "year": "2024",
                "yearEnd": "2025",
                "title": "Analista de Suporte N2",
                "place": "ParadigmaBS",
                "description": "Suporte nível 2 com foco em resolução avançada: T-SQL, triggers, procedures, integração XML/SOAP, correção de bugs, melhoria de processos e documentação técnica.",
                "skills": ["T-SQL", "XML", "SOAP", "Bug Fixing", "Documentation"],
                "color": "#8b5cf6",
                "icon": "terminal",
            },
            {
                "id": "exp-paradigma-n1",
                "category": "experience",
                "year": "2022",
                "yearEnd": "2024",
                "title": "Analista de Suporte",
                "place": "ParadigmaBS",
                "description": "Análise e resolução de chamados técnicos, consultas em banco de dados, pull requests, suporte ao cliente com integração T-SQL, XML e SOAP.",
                "skills": ["T-SQL", "XML", "SOAP", "API Analysis", "SQL"],
                "color": "#8b5cf6",
                "icon": "headset",
            },
            {
                "id": "exp-paradigma-intern",
                "category": "experience",
                "year": "2022",
                "yearEnd": None,
                "title": "Estagiário",
                "place": "ParadigmaBS",
                "description": "Estágio em suporte técnico: diagnósticos, consultas SQL, correção de bugs e atendimento ao cliente.",
                "skills": ["T-SQL", "SQL", "Diagnostics"],
                "color": "#3b82f6",
                "icon": "code",
            },
            {
                "id": "exp-softplan-fin",
                "category": "experience",
                "year": "2020",
                "yearEnd": "2021",
                "title": "Assistente Financeiro",
                "place": "Softplan",
                "description": "Operações financeiras e controle administrativo em empresa de tecnologia jurídica.",
                "skills": ["Finance", "Administration"],
                "color": "#3b82f6",
                "icon": "briefcase",
            },
            {
                "id": "exp-softplan-apprentice",
                "category": "experience",
                "year": "2018",
                "yearEnd": "2020",
                "title": "Jovem Aprendiz",
                "place": "Softplan",
                "description": "Programa de aprendizagem em empresa de tecnologia, com exposição a processos corporativos e desenvolvimento profissional.",
                "skills": ["Teamwork", "Professional Development"],
                "color": "#22c55e",
                "icon": "seedling",
            },
            # ── Education ───────────────────────────────────────
            {
                "id": "edu-senai",
                "category": "education",
                "year": "2025",
                "yearEnd": "2026",
                "title": "Pós-graduação em IA Aplicada",
                "place": "SENAI/SC",
                "description": "Especialização em Inteligência Artificial aplicada à indústria, com foco em visão computacional, deep learning e deploy de modelos.",
                "skills": ["AI", "Deep Learning", "Computer Vision", "MLOps"],
                "color": "#f0c040",
                "icon": "graduation",
            },
            {
                "id": "edu-estacio",
                "category": "education",
                "year": "2020",
                "yearEnd": "2024",
                "title": "Bacharel em Sistemas de Informação",
                "place": "Estácio de Sá — Florianópolis",
                "description": "Bacharelado em Sistemas de Informação com ênfase em desenvolvimento de software, banco de dados e engenharia de sistemas.",
                "skills": ["Software Engineering", "Databases", "Systems Analysis"],
                "color": "#22c55e",
                "icon": "book",
            },
            # ── Awards ──────────────────────────────────────────
            {
                "id": "award-actinspace",
                "category": "awards",
                "year": "2026",
                "yearEnd": None,
                "title": "Hackathon ActInSpace — 1º Lugar",
                "place": "Representando o Brasil na França",
                "description": "Primeiro lugar no hackathon internacional ActInSpace, representando o Brasil na competição final na França com solução inovadora baseada em tecnologia espacial.",
                "skills": ["Innovation", "Space Tech", "Teamwork", "Pitch"],
                "color": "#f0c040",
                "icon": "trophy",
            },
            {
                "id": "award-akcit",
                "category": "awards",
                "year": "2025",
                "yearEnd": None,
                "title": "Hackathon AKCIT — 2º Lugar",
                "place": "Projeto com IA Generativa",
                "description": "Segundo lugar no hackathon AKCIT com projeto utilizando Inteligência Artificial Generativa para solução de problemas reais.",
                "skills": ["Generative AI", "Hackathon", "Rapid Prototyping"],
                "color": "#8b5cf6",
                "icon": "medal",
            },
            # ── Certifications ──────────────────────────────────
            {
                "id": "cert-mobile",
                "category": "certifications",
                "year": "2023",
                "yearEnd": None,
                "title": "Programação para Dispositivos Móveis",
                "place": "Certificação Profissional",
                "description": "Desenvolvimento de aplicações móveis multiplataforma.",
                "skills": ["Mobile Development"],
                "color": "#3b82f6",
                "icon": "smartphone",
            },
            {
                "id": "cert-web",
                "category": "certifications",
                "year": "2023",
                "yearEnd": None,
                "title": "Programação para Internet",
                "place": "Certificação Profissional",
                "description": "Desenvolvimento web front-end e back-end.",
                "skills": ["Web Development"],
                "color": "#3b82f6",
                "icon": "globe",
            },
            {
                "id": "cert-governance",
                "category": "certifications",
                "year": "2022",
                "yearEnd": None,
                "title": "Implantação de Governança de T.I.",
                "place": "Certificação Profissional",
                "description": "Frameworks e práticas de governança em tecnologia da informação.",
                "skills": ["IT Governance", "ITIL"],
                "color": "#8b5cf6",
                "icon": "shield",
            },
            {
                "id": "cert-git",
                "category": "certifications",
                "year": "2022",
                "yearEnd": None,
                "title": "O Básico de Git e GitHub",
                "place": "Certificação Profissional",
                "description": "Controle de versão com Git e colaboração via GitHub.",
                "skills": ["Git", "GitHub"],
                "color": "#22c55e",
                "icon": "git",
            },
            {
                "id": "cert-bigdata",
                "category": "certifications",
                "year": "2023",
                "yearEnd": None,
                "title": "Soluções de Big Data Analytics",
                "place": "Certificação Profissional",
                "description": "Desenvolvimento de soluções analíticas com Big Data.",
                "skills": ["Big Data", "Analytics", "Power BI"],
                "color": "#22c55e",
                "icon": "database",
            },
        ]
    }


@router.get("/activity-log")
async def get_activity_log(limit: int = 20, session: Session = Depends(get_session)):
    """Recent XP events from activity log."""
    logs = session.exec(
        select(ActivityLog).order_by(col(ActivityLog.id).desc()).limit(limit)
    ).all()
    return {
        "activities": [
            {"action": l.action, "xp_gained": l.xp_gained, "description": l.description, "created_at": l.created_at}
            for l in logs
        ]
    }


@router.get("/weekly-summary")
async def get_weekly_summary(session: Session = Depends(get_session)):
    """Weekly summary computed from real activity log + mock narrative."""
    one_week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    recent = session.exec(
        select(ActivityLog).where(ActivityLog.created_at >= one_week_ago)
    ).all()

    total_xp = sum(a.xp_gained for a in recent)
    profile = session.exec(select(PlayerProfile)).first()
    p_dict = {
        "level": profile.level, "wisdom": profile.wisdom,
    } if profile else None

    summary = weekly_summary(profile=p_dict)
    # Override with real data when available
    if total_xp > 0:
        summary["xp_gained"] = total_xp
    summary["total_activities"] = len(recent)
    return summary
