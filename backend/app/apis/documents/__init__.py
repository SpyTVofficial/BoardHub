
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import asyncpg
import databutton as db
from datetime import datetime
from app.auth import AuthorizedUser

router = APIRouter()

# Pydantic Models
class DocumentCreate(BaseModel):
    title: str
    url: str
    category: str

class DocumentResponse(BaseModel):
    id: str
    title: str
    url: str
    category: str
    created_by: str
    created_at: datetime

class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int

# Database connection helper
async def get_db_connection():
    return await asyncpg.connect(db.secrets.get("DATABASE_URL_DEV"))

@router.get("/documents", response_model=DocumentListResponse)
async def list_documents(
    user: AuthorizedUser,
    search: Optional[str] = None,
    category: Optional[str] = None
):
    """List documents with optional search and category filtering"""
    conn = await get_db_connection()
    try:
        # Build query with filters
        query = "SELECT id, title, url, category, created_by, created_at FROM documents WHERE 1=1"
        params = []
        param_count = 0
        
        if search:
            param_count += 1
            query += f" AND title ILIKE ${param_count}"
            params.append(f"%{search}%")
            
        if category:
            param_count += 1
            query += f" AND category = ${param_count}"
            params.append(category)
            
        query += " ORDER BY created_at DESC"
        
        # Execute query
        rows = await conn.fetch(query, *params)
        
        # Convert to response models
        documents = [
            DocumentResponse(
                id=str(row['id']),
                title=row['title'],
                url=row['url'],
                category=row['category'],
                created_by=row['created_by'],
                created_at=row['created_at']
            )
            for row in rows
        ]
        
        return DocumentListResponse(
            documents=documents,
            total=len(documents)
        )
    finally:
        await conn.close()

@router.post("/documents", response_model=DocumentResponse)
async def create_document(
    document: DocumentCreate,
    user: AuthorizedUser
):
    """Create a new document"""
    conn = await get_db_connection()
    try:
        row = await conn.fetchrow(
            """
            INSERT INTO documents (title, url, category, created_by)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, url, category, created_by, created_at
            """,
            document.title,
            document.url,
            document.category,
            user.sub
        )
        
        return DocumentResponse(
            id=str(row['id']),
            title=row['title'],
            url=row['url'],
            category=row['category'],
            created_by=row['created_by'],
            created_at=row['created_at']
        )
    finally:
        await conn.close()

@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    user: AuthorizedUser
):
    """Delete a document"""
    conn = await get_db_connection()
    try:
        # Check if document exists and user owns it
        existing = await conn.fetchrow(
            "SELECT created_by FROM documents WHERE id = $1",
            document_id
        )
        
        if not existing:
            raise HTTPException(status_code=404, detail="Document not found")
            
        if existing['created_by'] != user.sub:
            raise HTTPException(status_code=403, detail="Not authorized to delete this document")
            
        # Delete the document
        await conn.execute(
            "DELETE FROM documents WHERE id = $1",
            document_id
        )
        
        return {"message": "Document deleted successfully"}
    finally:
        await conn.close()

@router.patch("/documents/{document_id}/archive")
async def archive_document(
    document_id: str,
    user: AuthorizedUser
):
    """Archive a document"""
    conn = await get_db_connection()
    try:
        # Check if document exists and user owns it
        existing = await conn.fetchrow(
            "SELECT created_by FROM documents WHERE id = $1",
            document_id
        )
        
        if not existing:
            raise HTTPException(status_code=404, detail="Document not found")
            
        if existing['created_by'] != user.sub:
            raise HTTPException(status_code=403, detail="Not authorized to modify this document")
            
        # Archive the document
        await conn.execute(
            "UPDATE documents SET archived = TRUE WHERE id = $1",
            document_id
        )
        
        return {"message": "Document archived successfully"}
    finally:
        await conn.close()

@router.patch("/documents/{document_id}/unarchive")
async def unarchive_document(
    document_id: str,
    user: AuthorizedUser
):
    """Unarchive a document"""
    conn = await get_db_connection()
    try:
        # Check if document exists and user owns it
        existing = await conn.fetchrow(
            "SELECT created_by FROM documents WHERE id = $1",
            document_id
        )
        
        if not existing:
            raise HTTPException(status_code=404, detail="Document not found")
            
        if existing['created_by'] != user.sub:
            raise HTTPException(status_code=403, detail="Not authorized to modify this document")
            
        # Unarchive the document
        await conn.execute(
            "UPDATE documents SET archived = FALSE WHERE id = $1",
            document_id
        )
        
        return {"message": "Document unarchived successfully"}
    finally:
        await conn.close()
