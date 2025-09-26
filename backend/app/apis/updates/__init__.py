
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import asyncpg
import databutton as db
from datetime import datetime
from app.auth import AuthorizedUser

router = APIRouter()

# Pydantic Models
class UpdateCreate(BaseModel):
    title: str
    content_md: str

class UpdateResponse(BaseModel):
    id: str
    title: str
    content_md: str
    created_by: str
    created_at: datetime

class UpdateListResponse(BaseModel):
    updates: List[UpdateResponse]
    total: int

# Database connection helper
async def get_db_connection():
    return await asyncpg.connect(db.secrets.get("DATABASE_URL_DEV"))

@router.get("/updates", response_model=UpdateListResponse)
async def list_updates(user: AuthorizedUser):
    """List updates ordered by most recent first"""
    conn = await get_db_connection()
    try:
        rows = await conn.fetch(
            """
            SELECT id, title, content_md, created_by, created_at 
            FROM updates 
            ORDER BY created_at DESC
            """
        )
        
        # Convert to response models
        updates = [
            UpdateResponse(
                id=str(row['id']),
                title=row['title'],
                content_md=row['content_md'],
                created_by=row['created_by'],
                created_at=row['created_at']
            )
            for row in rows
        ]
        
        return UpdateListResponse(
            updates=updates,
            total=len(updates)
        )
    finally:
        await conn.close()

@router.post("/updates", response_model=UpdateResponse)
async def create_update(
    update: UpdateCreate,
    user: AuthorizedUser
):
    """Create a new board update"""
    conn = await get_db_connection()
    try:
        row = await conn.fetchrow(
            """
            INSERT INTO updates (title, content_md, created_by)
            VALUES ($1, $2, $3)
            RETURNING id, title, content_md, created_by, created_at
            """,
            update.title,
            update.content_md,
            user.sub
        )
        
        return UpdateResponse(
            id=str(row['id']),
            title=row['title'],
            content_md=row['content_md'],
            created_by=row['created_by'],
            created_at=row['created_at']
        )
    finally:
        await conn.close()

@router.delete("/updates/{update_id}")
async def delete_update(
    update_id: str,
    user: AuthorizedUser
):
    """Delete an update"""
    conn = await get_db_connection()
    try:
        # Check if update exists
        existing = await conn.fetchrow(
            "SELECT id FROM updates WHERE id = $1",
            update_id
        )
        
        if not existing:
            raise HTTPException(status_code=404, detail="Update not found")
            
        # For MVP: Allow any authenticated user to delete any update
        # TODO: Implement proper role-based authorization later
        
        # Delete the update
        await conn.execute(
            "DELETE FROM updates WHERE id = $1",
            update_id
        )
        
        return {"message": "Update deleted successfully"}
    finally:
        await conn.close()
