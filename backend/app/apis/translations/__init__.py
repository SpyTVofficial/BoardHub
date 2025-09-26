from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncpg
import databutton as db
from app.env import Mode, mode

router = APIRouter(prefix="/translations")

# Database connection
async def get_db_connection():
    if mode == Mode.PROD:
        database_url = db.secrets.get("DATABASE_URL_PROD")
    else:
        database_url = db.secrets.get("DATABASE_URL_DEV")
    
    return await asyncpg.connect(database_url)

class TranslationRequest(BaseModel):
    translation_key: str
    language_code: str
    translation_value: str
    category: Optional[str] = None
    description: Optional[str] = None

class TranslationUpdate(BaseModel):
    translation_value: str
    category: Optional[str] = None
    description: Optional[str] = None

class TranslationResponse(BaseModel):
    id: int
    translation_key: str
    language_code: str
    translation_value: str
    category: Optional[str]
    description: Optional[str]
    created_at: str
    updated_at: str
    created_by: Optional[str]
    updated_by: Optional[str]

class TranslationsByLanguageResponse(BaseModel):
    language_code: str
    translations: Dict[str, str]

class BulkTranslationRequest(BaseModel):
    language_code: str
    translations: Dict[str, str]
    category: Optional[str] = None

@router.get("/languages")
async def get_available_languages() -> List[str]:
    """Get list of all available language codes"""
    conn = await get_db_connection()
    try:
        query = "SELECT DISTINCT language_code FROM translations ORDER BY language_code"
        rows = await conn.fetch(query)
        return [row['language_code'] for row in rows]
    finally:
        await conn.close()

@router.get("/categories")
async def get_translation_categories() -> List[str]:
    """Get list of all translation categories"""
    conn = await get_db_connection()
    try:
        query = "SELECT DISTINCT category FROM translations WHERE category IS NOT NULL ORDER BY category"
        rows = await conn.fetch(query)
        return [row['category'] for row in rows]
    finally:
        await conn.close()

@router.get("/by-language/{language_code}")
async def get_translations_by_language(language_code: str) -> TranslationsByLanguageResponse:
    """Get all translations for a specific language as key-value pairs"""
    conn = await get_db_connection()
    try:
        query = "SELECT translation_key, translation_value FROM translations WHERE language_code = $1"
        rows = await conn.fetch(query, language_code)
        
        translations = {row['translation_key']: row['translation_value'] for row in rows}
        
        return TranslationsByLanguageResponse(
            language_code=language_code,
            translations=translations
        )
    finally:
        await conn.close()

@router.get("/")
async def list_translations(
    language_code: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None
) -> List[TranslationResponse]:
    """List all translations with optional filters"""
    conn = await get_db_connection()
    try:
        query = "SELECT * FROM translations WHERE 1=1"
        params = []
        param_count = 0
        
        if language_code:
            param_count += 1
            query += f" AND language_code = ${param_count}"
            params.append(language_code)
            
        if category:
            param_count += 1
            query += f" AND category = ${param_count}"
            params.append(category)
            
        if search:
            param_count += 1
            query += f" AND (translation_key ILIKE ${param_count} OR translation_value ILIKE ${param_count})"
            params.append(f"%{search}%")
            
        query += " ORDER BY translation_key, language_code"
        
        rows = await conn.fetch(query, *params)
        
        return [
            TranslationResponse(
                id=row['id'],
                translation_key=row['translation_key'],
                language_code=row['language_code'],
                translation_value=row['translation_value'],
                category=row['category'],
                description=row['description'],
                created_at=row['created_at'].isoformat(),
                updated_at=row['updated_at'].isoformat(),
                created_by=row['created_by'],
                updated_by=row['updated_by']
            )
            for row in rows
        ]
    finally:
        await conn.close()

@router.post("/")
async def create_translation(translation: TranslationRequest) -> TranslationResponse:
    """Create a new translation"""
    conn = await get_db_connection()
    try:
        query = """
            INSERT INTO translations (translation_key, language_code, translation_value, category, description)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        """
        
        row = await conn.fetchrow(
            query,
            translation.translation_key,
            translation.language_code,
            translation.translation_value,
            translation.category,
            translation.description
        )
        
        return TranslationResponse(
            id=row['id'],
            translation_key=row['translation_key'],
            language_code=row['language_code'],
            translation_value=row['translation_value'],
            category=row['category'],
            description=row['description'],
            created_at=row['created_at'].isoformat(),
            updated_at=row['updated_at'].isoformat(),
            created_by=row['created_by'],
            updated_by=row['updated_by']
        )
    except asyncpg.UniqueViolationError:
        raise HTTPException(status_code=400, detail="Translation already exists for this key and language")
    finally:
        await conn.close()

@router.put("/{translation_id}")
async def update_translation(translation_id: int, translation: TranslationUpdate) -> TranslationResponse:
    """Update an existing translation"""
    conn = await get_db_connection()
    try:
        query = """
            UPDATE translations 
            SET translation_value = $1, category = $2, description = $3, updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING *
        """
        
        row = await conn.fetchrow(
            query,
            translation.translation_value,
            translation.category,
            translation.description,
            translation_id
        )
        
        if not row:
            raise HTTPException(status_code=404, detail="Translation not found")
            
        return TranslationResponse(
            id=row['id'],
            translation_key=row['translation_key'],
            language_code=row['language_code'],
            translation_value=row['translation_value'],
            category=row['category'],
            description=row['description'],
            created_at=row['created_at'].isoformat(),
            updated_at=row['updated_at'].isoformat(),
            created_by=row['created_by'],
            updated_by=row['updated_by']
        )
    finally:
        await conn.close()

@router.delete("/{translation_id}")
async def delete_translation(translation_id: int) -> dict:
    """Delete a translation"""
    conn = await get_db_connection()
    try:
        query = "DELETE FROM translations WHERE id = $1 RETURNING id"
        row = await conn.fetchrow(query, translation_id)
        
        if not row:
            raise HTTPException(status_code=404, detail="Translation not found")
            
        return {"message": "Translation deleted successfully"}
    finally:
        await conn.close()

@router.post("/bulk")
async def bulk_create_translations(bulk_request: BulkTranslationRequest) -> dict:
    """Create multiple translations for a language at once"""
    conn = await get_db_connection()
    try:
        async with conn.transaction():
            created_count = 0
            updated_count = 0
            
            for key, value in bulk_request.translations.items():
                # Try to insert, if exists then update
                insert_query = """
                    INSERT INTO translations (translation_key, language_code, translation_value, category)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (translation_key, language_code)
                    DO UPDATE SET 
                        translation_value = EXCLUDED.translation_value,
                        category = EXCLUDED.category,
                        updated_at = CURRENT_TIMESTAMP
                    RETURNING (xmax = 0) AS is_insert
                """
                
                result = await conn.fetchrow(
                    insert_query,
                    key,
                    bulk_request.language_code,
                    value,
                    bulk_request.category
                )
                
                if result['is_insert']:
                    created_count += 1
                else:
                    updated_count += 1
                    
        return {
            "message": "Bulk operation completed",
            "created": created_count,
            "updated": updated_count
        }
    finally:
        await conn.close()
