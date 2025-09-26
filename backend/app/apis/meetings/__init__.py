from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional
import asyncpg
import databutton as db
from datetime import datetime, date
from app.auth import AuthorizedUser

router = APIRouter()

# Pydantic Models for Meetings
class MeetingCreate(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    meeting_type: str = Field(default="regular", pattern="^(regular|committee|special|annual|emergency)$")
    start_date: datetime
    end_date: Optional[datetime] = None
    location: Optional[str] = Field(None, max_length=255)
    meeting_link: Optional[str] = None

class MeetingUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    meeting_type: Optional[str] = Field(None, pattern="^(regular|committee|special|annual|emergency)$")
    status: Optional[str] = Field(None, pattern="^(draft|scheduled|in_progress|completed|cancelled)$")
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    location: Optional[str] = Field(None, max_length=255)
    meeting_link: Optional[str] = None
    agenda_locked: Optional[bool] = None
    minutes_finalized: Optional[bool] = None

class Meeting(BaseModel):
    id: str
    title: str
    description: Optional[str]
    meeting_type: str
    status: str
    start_date: datetime
    end_date: Optional[datetime]
    location: Optional[str]
    meeting_link: Optional[str]
    agenda_locked: bool
    minutes_finalized: bool
    created_by: str
    created_by_name: str
    created_at: datetime
    updated_at: datetime
    attendee_count: int
    agenda_item_count: int

# Pydantic Models for Agenda Items
class AgendaItemCreate(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    item_type: str = Field(default="discussion", pattern="^(information|discussion|decision|action)$")
    priority: str = Field(default="medium", pattern="^(low|medium|high|urgent)$")
    time_allocated: Optional[int] = Field(None, ge=1, le=480)  # 1-480 minutes
    order_index: int = Field(..., ge=0)
    presenter: Optional[str] = None
    documents_needed: Optional[List[str]] = None
    pre_reading_required: bool = False
    decision_required: bool = False

class AgendaItemUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    item_type: Optional[str] = Field(None, pattern="^(information|discussion|decision|action)$")
    priority: Optional[str] = Field(None, pattern="^(low|medium|high|urgent)$")
    time_allocated: Optional[int] = Field(None, ge=1, le=480)
    order_index: Optional[int] = Field(None, ge=0)
    presenter: Optional[str] = None
    documents_needed: Optional[List[str]] = None
    pre_reading_required: Optional[bool] = None
    decision_required: Optional[bool] = None

class AgendaItem(BaseModel):
    id: str
    meeting_id: str
    title: str
    description: Optional[str]
    item_type: str
    priority: str
    time_allocated: Optional[int]
    order_index: int
    presenter: Optional[str]
    documents_needed: Optional[List[str]]
    pre_reading_required: bool
    decision_required: bool
    created_at: datetime
    updated_at: datetime

# Pydantic Models for Attendees
class AttendeeCreate(BaseModel):
    user_id: Optional[str] = None
    name: str = Field(..., max_length=255)
    email: Optional[str] = None
    role: str = Field(default="member", pattern="^(chair|secretary|member|observer|guest)$")

class AttendeeUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    email: Optional[str] = None
    role: Optional[str] = Field(None, pattern="^(chair|secretary|member|observer|guest)$")
    attendance_status: Optional[str] = Field(None, pattern="^(invited|accepted|declined|tentative|attended|absent)$")
    notes: Optional[str] = None

class Attendee(BaseModel):
    id: str
    meeting_id: str
    user_id: Optional[str]
    name: str
    email: Optional[str]
    role: str
    attendance_status: str
    rsvp_date: Optional[datetime]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

# Response Models
class MeetingsResponse(BaseModel):
    meetings: List[Meeting]
    total: int
    upcoming_count: int
    in_progress_count: int

class MeetingDetailResponse(BaseModel):
    meeting: Meeting
    agenda_items: List[AgendaItem]
    attendees: List[Attendee]

# Database connection helper
async def get_db_connection():
    return await asyncpg.connect(db.secrets.get("DATABASE_URL_DEV"))

# MEETING ENDPOINTS

@router.get("/meetings", response_model=MeetingsResponse)
async def list_meetings(
    user: AuthorizedUser,
    status: Optional[str] = Query(None, pattern="^(draft|scheduled|in_progress|completed|cancelled)$"),
    meeting_type: Optional[str] = Query(None, pattern="^(regular|committee|special|annual|emergency)$"),
    upcoming_only: bool = Query(False),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0)
):
    """List meetings with filtering options"""
    conn = await get_db_connection()
    try:
        # Build WHERE clause dynamically
        where_conditions = []
        params = []
        param_count = 0
        
        if status:
            param_count += 1
            where_conditions.append(f"m.status = ${param_count}")
            params.append(status)
            
        if meeting_type:
            param_count += 1
            where_conditions.append(f"m.meeting_type = ${param_count}")
            params.append(meeting_type)
            
        if upcoming_only:
            where_conditions.append("m.start_date >= NOW()")
        
        where_clause = " WHERE " + " AND ".join(where_conditions) if where_conditions else ""
        
        # Add limit and offset params
        param_count += 1
        limit_param = param_count
        param_count += 1
        offset_param = param_count
        params.extend([limit, offset])
        
        # Get meetings with counts
        query = f"""
            SELECT m.id, m.title, m.description, m.meeting_type, m.status, 
                   m.start_date, m.end_date, m.location, m.meeting_link,
                   m.agenda_locked, m.minutes_finalized, m.created_by, m.created_by_name,
                   m.created_at, m.updated_at,
                   COALESCE(attendee_count, 0) as attendee_count,
                   COALESCE(agenda_count, 0) as agenda_item_count
            FROM meetings m
            LEFT JOIN (
                SELECT meeting_id, COUNT(*) as attendee_count 
                FROM meeting_attendees 
                GROUP BY meeting_id
            ) a ON m.id = a.meeting_id
            LEFT JOIN (
                SELECT meeting_id, COUNT(*) as agenda_count 
                FROM agenda_items 
                GROUP BY meeting_id
            ) ag ON m.id = ag.meeting_id
            {where_clause}
            ORDER BY m.start_date DESC
            LIMIT ${limit_param} OFFSET ${offset_param}
        """
        
        rows = await conn.fetch(query, *params)
        
        # Convert to response models
        meetings = [
            Meeting(
                id=str(row['id']),
                title=row['title'],
                description=row['description'],
                meeting_type=row['meeting_type'],
                status=row['status'],
                start_date=row['start_date'],
                end_date=row['end_date'],
                location=row['location'],
                meeting_link=row['meeting_link'],
                agenda_locked=row['agenda_locked'],
                minutes_finalized=row['minutes_finalized'],
                created_by=row['created_by'],
                created_by_name=row['created_by_name'],
                created_at=row['created_at'],
                updated_at=row['updated_at'],
                attendee_count=row['attendee_count'],
                agenda_item_count=row['agenda_item_count']
            )
            for row in rows
        ]
        
        # Get total count
        count_query = f"SELECT COUNT(*) FROM meetings m{where_clause}"
        total = await conn.fetchval(count_query, *(params[:-2]))  # Exclude limit/offset
        
        # Get upcoming count
        upcoming_count = await conn.fetchval(
            "SELECT COUNT(*) FROM meetings WHERE start_date >= NOW() AND status IN ('scheduled', 'draft')"
        )
        
        # Get in-progress count
        in_progress_count = await conn.fetchval(
            "SELECT COUNT(*) FROM meetings WHERE status = 'in_progress'"
        )
        
        return MeetingsResponse(
            meetings=meetings,
            total=total,
            upcoming_count=upcoming_count,
            in_progress_count=in_progress_count
        )
    finally:
        await conn.close()

@router.get("/meetings/{meeting_id}", response_model=MeetingDetailResponse)
async def get_meeting(meeting_id: str, user: AuthorizedUser):
    """Get a specific meeting with agenda items and attendees"""
    conn = await get_db_connection()
    try:
        # Get meeting
        meeting_row = await conn.fetchrow(
            """
            SELECT m.id, m.title, m.description, m.meeting_type, m.status, 
                   m.start_date, m.end_date, m.location, m.meeting_link,
                   m.agenda_locked, m.minutes_finalized, m.created_by, m.created_by_name,
                   m.created_at, m.updated_at,
                   COALESCE(attendee_count, 0) as attendee_count,
                   COALESCE(agenda_count, 0) as agenda_item_count
            FROM meetings m
            LEFT JOIN (
                SELECT meeting_id, COUNT(*) as attendee_count 
                FROM meeting_attendees 
                WHERE meeting_id = $1
                GROUP BY meeting_id
            ) a ON m.id = a.meeting_id
            LEFT JOIN (
                SELECT meeting_id, COUNT(*) as agenda_count 
                FROM agenda_items 
                WHERE meeting_id = $1
                GROUP BY meeting_id
            ) ag ON m.id = ag.meeting_id
            WHERE m.id = $1
            """,
            meeting_id
        )
        
        if not meeting_row:
            raise HTTPException(status_code=404, detail="Meeting not found")
        
        # Get agenda items
        agenda_rows = await conn.fetch(
            """
            SELECT id, meeting_id, title, description, item_type, priority,
                   time_allocated, order_index, presenter, documents_needed,
                   pre_reading_required, decision_required, created_at, updated_at
            FROM agenda_items
            WHERE meeting_id = $1
            ORDER BY order_index ASC
            """,
            meeting_id
        )
        
        # Get attendees
        attendee_rows = await conn.fetch(
            """
            SELECT id, meeting_id, user_id, name, email, role, attendance_status,
                   rsvp_date, notes, created_at, updated_at
            FROM meeting_attendees
            WHERE meeting_id = $1
            ORDER BY role, name
            """,
            meeting_id
        )
        
        meeting = Meeting(
            id=str(meeting_row['id']),
            title=meeting_row['title'],
            description=meeting_row['description'],
            meeting_type=meeting_row['meeting_type'],
            status=meeting_row['status'],
            start_date=meeting_row['start_date'],
            end_date=meeting_row['end_date'],
            location=meeting_row['location'],
            meeting_link=meeting_row['meeting_link'],
            agenda_locked=meeting_row['agenda_locked'],
            minutes_finalized=meeting_row['minutes_finalized'],
            created_by=meeting_row['created_by'],
            created_by_name=meeting_row['created_by_name'],
            created_at=meeting_row['created_at'],
            updated_at=meeting_row['updated_at'],
            attendee_count=meeting_row['attendee_count'],
            agenda_item_count=meeting_row['agenda_item_count']
        )
        
        agenda_items = [
            AgendaItem(
                id=str(row['id']),
                meeting_id=str(row['meeting_id']),
                title=row['title'],
                description=row['description'],
                item_type=row['item_type'],
                priority=row['priority'],
                time_allocated=row['time_allocated'],
                order_index=row['order_index'],
                presenter=row['presenter'],
                documents_needed=row['documents_needed'],
                pre_reading_required=row['pre_reading_required'],
                decision_required=row['decision_required'],
                created_at=row['created_at'],
                updated_at=row['updated_at']
            )
            for row in agenda_rows
        ]
        
        attendees = [
            Attendee(
                id=str(row['id']),
                meeting_id=str(row['meeting_id']),
                user_id=row['user_id'],
                name=row['name'],
                email=row['email'],
                role=row['role'],
                attendance_status=row['attendance_status'],
                rsvp_date=row['rsvp_date'],
                notes=row['notes'],
                created_at=row['created_at'],
                updated_at=row['updated_at']
            )
            for row in attendee_rows
        ]
        
        return MeetingDetailResponse(
            meeting=meeting,
            agenda_items=agenda_items,
            attendees=attendees
        )
    finally:
        await conn.close()

@router.post("/meetings", response_model=Meeting)
async def create_meeting(meeting_data: MeetingCreate, user: AuthorizedUser):
    """Create a new meeting"""
    conn = await get_db_connection()
    try:
        # Insert meeting
        meeting_row = await conn.fetchrow(
            """
            INSERT INTO meetings 
            (title, description, meeting_type, start_date, end_date, location, meeting_link, created_by, created_by_name)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, title, description, meeting_type, status, start_date, end_date, location, meeting_link,
                      agenda_locked, minutes_finalized, created_by, created_by_name, created_at, updated_at
            """,
            meeting_data.title,
            meeting_data.description,
            meeting_data.meeting_type,
            meeting_data.start_date,
            meeting_data.end_date,
            meeting_data.location,
            meeting_data.meeting_link,
            user.sub,
            user.sub  # For now, use user.sub as display name
        )
        
        return Meeting(
            id=str(meeting_row['id']),
            title=meeting_row['title'],
            description=meeting_row['description'],
            meeting_type=meeting_row['meeting_type'],
            status=meeting_row['status'],
            start_date=meeting_row['start_date'],
            end_date=meeting_row['end_date'],
            location=meeting_row['location'],
            meeting_link=meeting_row['meeting_link'],
            agenda_locked=meeting_row['agenda_locked'],
            minutes_finalized=meeting_row['minutes_finalized'],
            created_by=meeting_row['created_by'],
            created_by_name=meeting_row['created_by_name'],
            created_at=meeting_row['created_at'],
            updated_at=meeting_row['updated_at'],
            attendee_count=0,
            agenda_item_count=0
        )
    finally:
        await conn.close()

@router.put("/meetings/{meeting_id}", response_model=Meeting)
async def update_meeting(meeting_id: str, meeting_data: MeetingUpdate, user: AuthorizedUser):
    """Update a meeting"""
    conn = await get_db_connection()
    try:
        # Check if meeting exists
        meeting_exists = await conn.fetchval(
            "SELECT id FROM meetings WHERE id = $1", meeting_id
        )
        
        if not meeting_exists:
            raise HTTPException(status_code=404, detail="Meeting not found")
        
        # Build update query dynamically
        updates = []
        params = []
        param_count = 0
        
        for field, value in meeting_data.model_dump(exclude_unset=True).items():
            if value is not None:
                param_count += 1
                updates.append(f"{field} = ${param_count}")
                params.append(value)
        
        if not updates:
            # No changes, return current meeting
            return await get_meeting(meeting_id, user)
        
        # Add updated_at
        param_count += 1
        updates.append(f"updated_at = ${param_count}")
        params.append(datetime.now())
        
        # Add meeting_id for WHERE clause
        param_count += 1
        params.append(meeting_id)
        
        # Update meeting
        updated_row = await conn.fetchrow(
            f"""
            UPDATE meetings 
            SET {', '.join(updates)}
            WHERE id = ${param_count}
            RETURNING id, title, description, meeting_type, status, start_date, end_date, location, meeting_link,
                      agenda_locked, minutes_finalized, created_by, created_by_name, created_at, updated_at
            """,
            *params
        )
        
        # Get counts
        attendee_count = await conn.fetchval(
            "SELECT COUNT(*) FROM meeting_attendees WHERE meeting_id = $1", meeting_id
        )
        agenda_count = await conn.fetchval(
            "SELECT COUNT(*) FROM agenda_items WHERE meeting_id = $1", meeting_id
        )
        
        return Meeting(
            id=str(updated_row['id']),
            title=updated_row['title'],
            description=updated_row['description'],
            meeting_type=updated_row['meeting_type'],
            status=updated_row['status'],
            start_date=updated_row['start_date'],
            end_date=updated_row['end_date'],
            location=updated_row['location'],
            meeting_link=updated_row['meeting_link'],
            agenda_locked=updated_row['agenda_locked'],
            minutes_finalized=updated_row['minutes_finalized'],
            created_by=updated_row['created_by'],
            created_by_name=updated_row['created_by_name'],
            created_at=updated_row['created_at'],
            updated_at=updated_row['updated_at'],
            attendee_count=attendee_count,
            agenda_item_count=agenda_count
        )
    finally:
        await conn.close()

@router.delete("/meetings/{meeting_id}")
async def delete_meeting(meeting_id: str, user: AuthorizedUser):
    """Delete a meeting"""
    conn = await get_db_connection()
    try:
        # Check if meeting exists
        meeting_exists = await conn.fetchval(
            "SELECT id FROM meetings WHERE id = $1", meeting_id
        )
        
        if not meeting_exists:
            raise HTTPException(status_code=404, detail="Meeting not found")
        
        # Delete meeting (cascade will handle related records)
        await conn.execute(
            "DELETE FROM meetings WHERE id = $1", meeting_id
        )
        
        return {"message": "Meeting deleted successfully"}
    finally:
        await conn.close()

# AGENDA ITEM ENDPOINTS

@router.post("/meetings/{meeting_id}/agenda-items", response_model=AgendaItem)
async def create_agenda_item(meeting_id: str, item_data: AgendaItemCreate, user: AuthorizedUser):
    """Create a new agenda item"""
    conn = await get_db_connection()
    try:
        # Check if meeting exists and agenda is not locked
        meeting = await conn.fetchrow(
            "SELECT id, agenda_locked FROM meetings WHERE id = $1", meeting_id
        )
        
        if not meeting:
            raise HTTPException(status_code=404, detail="Meeting not found")
        
        if meeting['agenda_locked']:
            raise HTTPException(status_code=400, detail="Agenda is locked and cannot be modified")
        
        # Insert agenda item
        item_row = await conn.fetchrow(
            """
            INSERT INTO agenda_items 
            (meeting_id, title, description, item_type, priority, time_allocated, order_index, presenter, 
             documents_needed, pre_reading_required, decision_required)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id, meeting_id, title, description, item_type, priority, time_allocated, order_index, 
                      presenter, documents_needed, pre_reading_required, decision_required, created_at, updated_at
            """,
            meeting_id,
            item_data.title,
            item_data.description,
            item_data.item_type,
            item_data.priority,
            item_data.time_allocated,
            item_data.order_index,
            item_data.presenter,
            item_data.documents_needed,
            item_data.pre_reading_required,
            item_data.decision_required
        )
        
        return AgendaItem(
            id=str(item_row['id']),
            meeting_id=str(item_row['meeting_id']),
            title=item_row['title'],
            description=item_row['description'],
            item_type=item_row['item_type'],
            priority=item_row['priority'],
            time_allocated=item_row['time_allocated'],
            order_index=item_row['order_index'],
            presenter=item_row['presenter'],
            documents_needed=item_row['documents_needed'],
            pre_reading_required=item_row['pre_reading_required'],
            decision_required=item_row['decision_required'],
            created_at=item_row['created_at'],
            updated_at=item_row['updated_at']
        )
    finally:
        await conn.close()

@router.put("/meetings/{meeting_id}/agenda-items/{item_id}", response_model=AgendaItem)
async def update_agenda_item(meeting_id: str, item_id: str, item_data: AgendaItemUpdate, user: AuthorizedUser):
    """Update an agenda item"""
    conn = await get_db_connection()
    try:
        # Check if meeting exists and agenda is not locked
        meeting = await conn.fetchrow(
            "SELECT id, agenda_locked FROM meetings WHERE id = $1", meeting_id
        )
        
        if not meeting:
            raise HTTPException(status_code=404, detail="Meeting not found")
        
        if meeting['agenda_locked']:
            raise HTTPException(status_code=400, detail="Agenda is locked and cannot be modified")
        
        # Check if agenda item exists
        item_exists = await conn.fetchval(
            "SELECT id FROM agenda_items WHERE id = $1 AND meeting_id = $2", item_id, meeting_id
        )
        
        if not item_exists:
            raise HTTPException(status_code=404, detail="Agenda item not found")
        
        # Build update query dynamically
        updates = []
        params = []
        param_count = 0
        
        for field, value in item_data.model_dump(exclude_unset=True).items():
            if value is not None:
                param_count += 1
                updates.append(f"{field} = ${param_count}")
                params.append(value)
        
        if not updates:
            # No changes, return current item
            item_row = await conn.fetchrow(
                "SELECT * FROM agenda_items WHERE id = $1", item_id
            )
        else:
            # Add updated_at
            param_count += 1
            updates.append(f"updated_at = ${param_count}")
            params.append(datetime.now())
            
            # Add item_id for WHERE clause
            param_count += 1
            params.append(item_id)
            
            # Update agenda item
            item_row = await conn.fetchrow(
                f"""
                UPDATE agenda_items 
                SET {', '.join(updates)}
                WHERE id = ${param_count}
                RETURNING id, meeting_id, title, description, item_type, priority, time_allocated, order_index, 
                          presenter, documents_needed, pre_reading_required, decision_required, created_at, updated_at
                """,
                *params
            )
        
        return AgendaItem(
            id=str(item_row['id']),
            meeting_id=str(item_row['meeting_id']),
            title=item_row['title'],
            description=item_row['description'],
            item_type=item_row['item_type'],
            priority=item_row['priority'],
            time_allocated=item_row['time_allocated'],
            order_index=item_row['order_index'],
            presenter=item_row['presenter'],
            documents_needed=item_row['documents_needed'],
            pre_reading_required=item_row['pre_reading_required'],
            decision_required=item_row['decision_required'],
            created_at=item_row['created_at'],
            updated_at=item_row['updated_at']
        )
    finally:
        await conn.close()

@router.delete("/meetings/{meeting_id}/agenda-items/{item_id}")
async def delete_agenda_item(meeting_id: str, item_id: str, user: AuthorizedUser):
    """Delete an agenda item"""
    conn = await get_db_connection()
    try:
        # Check if meeting exists and agenda is not locked
        meeting = await conn.fetchrow(
            "SELECT id, agenda_locked FROM meetings WHERE id = $1", meeting_id
        )
        
        if not meeting:
            raise HTTPException(status_code=404, detail="Meeting not found")
        
        if meeting['agenda_locked']:
            raise HTTPException(status_code=400, detail="Agenda is locked and cannot be modified")
        
        # Check if agenda item exists
        item_exists = await conn.fetchval(
            "SELECT id FROM agenda_items WHERE id = $1 AND meeting_id = $2", item_id, meeting_id
        )
        
        if not item_exists:
            raise HTTPException(status_code=404, detail="Agenda item not found")
        
        # Delete agenda item
        await conn.execute(
            "DELETE FROM agenda_items WHERE id = $1", item_id
        )
        
        return {"message": "Agenda item deleted successfully"}
    finally:
        await conn.close()

# ATTENDEE ENDPOINTS

@router.post("/meetings/{meeting_id}/attendees", response_model=Attendee)
async def add_attendee(meeting_id: str, attendee_data: AttendeeCreate, user: AuthorizedUser):
    """Add an attendee to a meeting"""
    conn = await get_db_connection()
    try:
        # Check if meeting exists
        meeting_exists = await conn.fetchval(
            "SELECT id FROM meetings WHERE id = $1", meeting_id
        )
        
        if not meeting_exists:
            raise HTTPException(status_code=404, detail="Meeting not found")
        
        # Insert attendee
        attendee_row = await conn.fetchrow(
            """
            INSERT INTO meeting_attendees 
            (meeting_id, user_id, name, email, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, meeting_id, user_id, name, email, role, attendance_status, rsvp_date, notes, created_at, updated_at
            """,
            meeting_id,
            attendee_data.user_id,
            attendee_data.name,
            attendee_data.email,
            attendee_data.role
        )
        
        return Attendee(
            id=str(attendee_row['id']),
            meeting_id=str(attendee_row['meeting_id']),
            user_id=attendee_row['user_id'],
            name=attendee_row['name'],
            email=attendee_row['email'],
            role=attendee_row['role'],
            attendance_status=attendee_row['attendance_status'],
            rsvp_date=attendee_row['rsvp_date'],
            notes=attendee_row['notes'],
            created_at=attendee_row['created_at'],
            updated_at=attendee_row['updated_at']
        )
    finally:
        await conn.close()

@router.put("/meetings/{meeting_id}/attendees/{attendee_id}", response_model=Attendee)
async def update_attendee(meeting_id: str, attendee_id: str, attendee_data: AttendeeUpdate, user: AuthorizedUser):
    """Update an attendee"""
    conn = await get_db_connection()
    try:
        # Check if attendee exists
        attendee_exists = await conn.fetchval(
            "SELECT id FROM meeting_attendees WHERE id = $1 AND meeting_id = $2", attendee_id, meeting_id
        )
        
        if not attendee_exists:
            raise HTTPException(status_code=404, detail="Attendee not found")
        
        # Build update query dynamically
        updates = []
        params = []
        param_count = 0
        
        for field, value in attendee_data.model_dump(exclude_unset=True).items():
            if value is not None:
                param_count += 1
                updates.append(f"{field} = ${param_count}")
                params.append(value)
        
        if not updates:
            # No changes, return current attendee
            attendee_row = await conn.fetchrow(
                "SELECT * FROM meeting_attendees WHERE id = $1", attendee_id
            )
        else:
            # Add updated_at and rsvp_date if status changed
            param_count += 1
            updates.append(f"updated_at = ${param_count}")
            params.append(datetime.now())
            
            if attendee_data.attendance_status and attendee_data.attendance_status in ['accepted', 'declined', 'tentative']:
                param_count += 1
                updates.append(f"rsvp_date = ${param_count}")
                params.append(datetime.now())
            
            # Add attendee_id for WHERE clause
            param_count += 1
            params.append(attendee_id)
            
            # Update attendee
            attendee_row = await conn.fetchrow(
                f"""
                UPDATE meeting_attendees 
                SET {', '.join(updates)}
                WHERE id = ${param_count}
                RETURNING id, meeting_id, user_id, name, email, role, attendance_status, rsvp_date, notes, created_at, updated_at
                """,
                *params
            )
        
        return Attendee(
            id=str(attendee_row['id']),
            meeting_id=str(attendee_row['meeting_id']),
            user_id=attendee_row['user_id'],
            name=attendee_row['name'],
            email=attendee_row['email'],
            role=attendee_row['role'],
            attendance_status=attendee_row['attendance_status'],
            rsvp_date=attendee_row['rsvp_date'],
            notes=attendee_row['notes'],
            created_at=attendee_row['created_at'],
            updated_at=attendee_row['updated_at']
        )
    finally:
        await conn.close()

@router.delete("/meetings/{meeting_id}/attendees/{attendee_id}")
async def remove_attendee(meeting_id: str, attendee_id: str, user: AuthorizedUser):
    """Remove an attendee from a meeting"""
    conn = await get_db_connection()
    try:
        # Check if attendee exists
        attendee_exists = await conn.fetchval(
            "SELECT id FROM meeting_attendees WHERE id = $1 AND meeting_id = $2", attendee_id, meeting_id
        )
        
        if not attendee_exists:
            raise HTTPException(status_code=404, detail="Attendee not found")
        
        # Delete attendee
        await conn.execute(
            "DELETE FROM meeting_attendees WHERE id = $1", attendee_id
        )
        
        return {"message": "Attendee removed successfully"}
    finally:
        await conn.close()
