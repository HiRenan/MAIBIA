"""Blog CRUD endpoints for the Tavern Board."""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, SQLModel, select

from app.database import get_session
from app.models import BlogPost

router = APIRouter(tags=["blog"])


class BlogPostCreate(SQLModel):
    title: str
    content: str
    category: str = "update"
    tags: str = ""
    color: str = "#8b5cf6"
    pinned: bool = False


@router.get("/blog/posts")
def list_posts(session: Session = Depends(get_session)):
    posts = session.exec(
        select(BlogPost).order_by(BlogPost.pinned.desc(), BlogPost.created_at.desc())  # type: ignore[union-attr]
    ).all()
    return {"posts": posts, "total": len(posts)}


@router.get("/blog/posts/{post_id}")
def get_post(post_id: int, session: Session = Depends(get_session)):
    post = session.get(BlogPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.post("/blog/posts")
def create_post(data: BlogPostCreate, session: Session = Depends(get_session)):
    now = datetime.now().isoformat()
    post = BlogPost(
        title=data.title,
        content=data.content,
        category=data.category,
        tags=data.tags,
        color=data.color,
        pinned=data.pinned,
        created_at=now,
        updated_at=now,
    )
    session.add(post)
    session.commit()
    session.refresh(post)
    return post


@router.put("/blog/posts/{post_id}")
def update_post(post_id: int, data: BlogPostCreate, session: Session = Depends(get_session)):
    post = session.get(BlogPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.title = data.title
    post.content = data.content
    post.category = data.category
    post.tags = data.tags
    post.color = data.color
    post.pinned = data.pinned
    post.updated_at = datetime.now().isoformat()
    session.add(post)
    session.commit()
    session.refresh(post)
    return post


@router.delete("/blog/posts/{post_id}")
def delete_post(post_id: int, session: Session = Depends(get_session)):
    post = session.get(BlogPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    session.delete(post)
    session.commit()
    return {"success": True}
