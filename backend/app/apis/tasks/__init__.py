


from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional
import asyncpg
import databutton as db
from datetime import datetime, date
from app.auth import AuthorizedUser

router = APIRouter()

# Pydantic Models
class BoardTaskCreate(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    priority: str = Field(default="medium", pattern="^(low|medium|high|urgent)$")
    category: Optional[str] = Field(None, max_length=50)
    due_date: Optional[date] = None
    assigned_to: Optional[str] = None  # User ID
    assigned_to_name: Optional[str] = None  # Display name
    board_restricted: bool = Field(default=False)  # Board-only access

class BoardTaskUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(todo|in_progress|completed|cancelled)$")
    priority: Optional[str] = Field(None, pattern="^(low|medium|high|urgent)$")
    category: Optional[str] = Field(None, max_length=50)
    due_date: Optional[date] = None
    assigned_to: Optional[str] = None
    assigned_to_name: Optional[str] = None
    board_restricted: Optional[bool] = None  # Board-only access

class BoardTask(BaseModel):
    id: str
    title: str
    description: Optional[str]
    status: str
    priority: str
    category: Optional[str]
    due_date: Optional[date]
    assigned_to: Optional[str]
    assigned_to_name: Optional[str]
    created_by: str
    created_by_name: str
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]
    is_overdue: bool
    board_restricted: bool = False  # Board-only access

class BoardTaskActivity(BaseModel):
    id: str
    task_id: str
    action: str
    field_changed: Optional[str]
    old_value: Optional[str]
    new_value: Optional[str]
    performed_by: str
    performed_by_name: str
    performed_at: datetime

class BoardTasksResponse(BaseModel):
    tasks: List[BoardTask]
    total: int
    overdue_count: int

class BoardTaskResponse(BaseModel):
    task: BoardTask
    activities: List[BoardTaskActivity]

# Database connection helper
async def get_db_connection():
    return await asyncpg.connect(db.secrets.get("DATABASE_URL_DEV"))

# Helper function to log task activity
async def log_task_activity(
    conn: asyncpg.Connection,
    task_id: str,
    action: str,
    user: AuthorizedUser,
    field_changed: Optional[str] = None,
    old_value: Optional[str] = None,
    new_value: Optional[str] = None
):
    await conn.execute(
        """
        INSERT INTO board_task_activities 
        (task_id, action, field_changed, old_value, new_value, performed_by, performed_by_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        """,
        task_id, action, field_changed, old_value, new_value, user.sub, user.sub
    )

# Helper function to check if task is overdue
def is_task_overdue(due_date: Optional[date], status: str) -> bool:
    if not due_date or status == 'done':
        return False
    return due_date < date.today()

@router.get("/tasks/categories")
async def get_task_categories(user: AuthorizedUser):
    """Get list of task categories in use"""
    conn = await get_db_connection()
    try:
        categories = await conn.fetch(
            """
            SELECT DISTINCT category 
            FROM board_tasks 
            WHERE category IS NOT NULL 
            ORDER BY category
            """
        )
        
        return {
            "categories": [row['category'] for row in categories]
        }
    finally:
        await conn.close()

@router.get("/tasks", response_model=BoardTasksResponse)
async def list_board_tasks(
    user: AuthorizedUser,
    status: Optional[str] = Query(None, pattern="^(todo|in_progress|done)$"),
    priority: Optional[str] = Query(None, pattern="^(low|medium|high|urgent)$"),
    assigned_to: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    overdue_only: bool = Query(False),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0)
):
    """List board tasks with filtering options"""
    conn = await get_db_connection()
    try:
        # Build WHERE clause dynamically
        where_conditions = []
        params = []
        param_count = 0
        
        if status:
            param_count += 1
            where_conditions.append(f"status = ${param_count}")
            params.append(status)
            
        if priority:
            param_count += 1
            where_conditions.append(f"priority = ${param_count}")
            params.append(priority)
            
        if assigned_to:
            param_count += 1
            where_conditions.append(f"assigned_to = ${param_count}")
            params.append(assigned_to)
            
        if category:
            param_count += 1
            where_conditions.append(f"category = ${param_count}")
            params.append(category)
            
        if overdue_only:
            where_conditions.append("due_date < CURRENT_DATE AND status != 'done'")
        
        where_clause = " WHERE " + " AND ".join(where_conditions) if where_conditions else ""
        
        # Add limit and offset params
        param_count += 1
        limit_param = param_count
        param_count += 1
        offset_param = param_count
        params.extend([limit, offset])
        
        # Get tasks
        query = f"""
            SELECT id, title, description, status, priority, category, due_date,
                   assigned_to, assigned_to_name, created_by, created_by_name,
                   created_at, updated_at, completed_at, board_restricted
            FROM board_tasks
            {where_clause}
            ORDER BY 
                CASE status 
                    WHEN 'todo' THEN 1 
                    WHEN 'in_progress' THEN 2 
                    WHEN 'done' THEN 3 
                END,
                CASE priority 
                    WHEN 'urgent' THEN 1 
                    WHEN 'high' THEN 2 
                    WHEN 'medium' THEN 3 
                    WHEN 'low' THEN 4 
                END,
                due_date ASC NULLS LAST,
                created_at DESC
            LIMIT ${limit_param} OFFSET ${offset_param}
        """
        
        rows = await conn.fetch(query, *params)
        
        # Convert to response models with overdue calculation
        tasks = [
            BoardTask(
                id=str(row['id']),
                title=row['title'],
                description=row['description'],
                status=row['status'],
                priority=row['priority'],
                category=row['category'],
                due_date=row['due_date'],
                assigned_to=row['assigned_to'],
                assigned_to_name=row['assigned_to_name'],
                created_by=row['created_by'],
                created_by_name=row['created_by_name'],
                created_at=row['created_at'],
                updated_at=row['updated_at'],
                completed_at=row['completed_at'],
                is_overdue=is_task_overdue(row['due_date'], row['status'])
            )
            for row in rows
        ]
        
        # Get total count
        count_query = f"SELECT COUNT(*) FROM board_tasks{where_clause}"
        total = await conn.fetchval(count_query, *(params[:-2]))  # Exclude limit/offset
        
        # Get overdue count
        overdue_count = await conn.fetchval(
            "SELECT COUNT(*) FROM board_tasks WHERE due_date < CURRENT_DATE AND status != 'done'"
        )
        
        return BoardTasksResponse(
            tasks=tasks,
            total=total,
            overdue_count=overdue_count
        )
    finally:
        await conn.close()

@router.get("/tasks/{task_id}", response_model=BoardTaskResponse)
async def get_board_task(task_id: str, user: AuthorizedUser):
    """Get a specific board task with its activity history"""
    conn = await get_db_connection()
    try:
        # Get task
        task_row = await conn.fetchrow(
            """
            SELECT id, title, description, status, priority, category, due_date,
                   assigned_to, assigned_to_name, created_by, created_by_name,
                   created_at, updated_at, completed_at, board_restricted
            FROM board_tasks
            WHERE id = $1
            """,
            task_id
        )
        
        if not task_row:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Get activity history
        activity_rows = await conn.fetch(
            """
            SELECT id, task_id, action, field_changed, old_value, new_value,
                   performed_by, performed_by_name, performed_at
            FROM board_task_activities
            WHERE task_id = $1
            ORDER BY performed_at DESC
            """,
            task_id
        )
        
        task = BoardTask(
            id=str(task_row['id']),
            title=task_row['title'],
            description=task_row['description'],
            status=task_row['status'],
            priority=task_row['priority'],
            category=task_row['category'],
            due_date=task_row['due_date'],
            assigned_to=task_row['assigned_to'],
            assigned_to_name=task_row['assigned_to_name'],
            created_by=task_row['created_by'],
            created_by_name=task_row['created_by_name'],
            created_at=task_row['created_at'],
            updated_at=task_row['updated_at'],
            completed_at=task_row['completed_at'],
            board_restricted=task_row['board_restricted'],
            is_overdue=is_task_overdue(task_row['due_date'], task_row['status'])
        )
        
        activities = [
            BoardTaskActivity(
                id=str(row['id']),
                task_id=str(row['task_id']),
                action=row['action'],
                field_changed=row['field_changed'],
                old_value=row['old_value'],
                new_value=row['new_value'],
                performed_by=row['performed_by'],
                performed_by_name=row['performed_by_name'],
                performed_at=row['performed_at']
            )
            for row in activity_rows
        ]
        
        return BoardTaskResponse(task=task, activities=activities)
    finally:
        await conn.close()

@router.post("/tasks", response_model=BoardTask)
async def create_board_task(task_data: BoardTaskCreate, user: AuthorizedUser):
    """Create a new board task"""
    conn = await get_db_connection()
    try:
        # Insert task
        task_row = await conn.fetchrow(
            """
            INSERT INTO board_tasks 
            (title, description, priority, category, due_date, assigned_to, assigned_to_name, created_by, created_by_name)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, title, description, status, priority, category, due_date,
                      assigned_to, assigned_to_name, created_by, created_by_name,
                      created_at, updated_at, completed_at
            """,
            task_data.title,
            task_data.description,
            task_data.priority,
            task_data.category,
            task_data.due_date,
            task_data.assigned_to,
            task_data.assigned_to_name,
            user.sub,
            user.sub  # For now, use user.sub as display name
        )
        
        task_id = str(task_row['id'])
        
        # Log activity
        await log_task_activity(conn, task_id, "created", user)
        
        # If assigned to someone, log assignment
        if task_data.assigned_to:
            await log_task_activity(
                conn, task_id, "assigned", user,
                "assigned_to", None, task_data.assigned_to_name or task_data.assigned_to
            )
        
        return BoardTask(
            id=task_id,
            title=task_row['title'],
            description=task_row['description'],
            status=task_row['status'],
            priority=task_row['priority'],
            category=task_row['category'],
            due_date=task_row['due_date'],
            assigned_to=task_row['assigned_to'],
            assigned_to_name=task_row['assigned_to_name'],
            created_by=task_row['created_by'],
            created_by_name=task_row['created_by_name'],
            created_at=task_row['created_at'],
            updated_at=task_row['updated_at'],
            completed_at=task_row['completed_at'],
            is_overdue=is_task_overdue(task_row['due_date'], task_row['status'])
        )
    finally:
        await conn.close()

@router.put("/tasks/{task_id}", response_model=BoardTask)
async def update_board_task(task_id: str, task_data: BoardTaskUpdate, user: AuthorizedUser):
    """Update a board task"""
    conn = await get_db_connection()
    try:
        # Get current task for comparison
        current_task = await conn.fetchrow(
            "SELECT * FROM board_tasks WHERE id = $1", task_id
        )
        
        if not current_task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Build update query dynamically
        updates = []
        params = []
        param_count = 0
        
        # Track changes for activity log
        changes = []
        
        for field, value in task_data.model_dump(exclude_unset=True).items():
            if value is not None and current_task[field] != value:
                param_count += 1
                updates.append(f"{field} = ${param_count}")
                params.append(value)
                changes.append({
                    'field': field,
                    'old_value': str(current_task[field]) if current_task[field] is not None else None,
                    'new_value': str(value)
                })
        
        if not updates:
            # No changes, return current task
            return BoardTask(
                id=str(current_task['id']),
                title=current_task['title'],
                description=current_task['description'],
                status=current_task['status'],
                priority=current_task['priority'],
                category=current_task['category'],
                due_date=current_task['due_date'],
                assigned_to=current_task['assigned_to'],
                assigned_to_name=current_task['assigned_to_name'],
                created_by=current_task['created_by'],
                created_by_name=current_task['created_by_name'],
                created_at=current_task['created_at'],
                updated_at=current_task['updated_at'],
                completed_at=current_task['completed_at'],
                board_restricted=current_task['board_restricted'],
                is_overdue=is_task_overdue(current_task['due_date'], current_task['status'])
            )
        
        # Add updated_at and completed_at logic
        param_count += 1
        updates.append(f"updated_at = ${param_count}")
        params.append(datetime.now())
        
        # If status changed to 'done', set completed_at
        if task_data.status == 'done' and current_task['status'] != 'done':
            param_count += 1
            updates.append(f"completed_at = ${param_count}")
            params.append(datetime.now())
        elif task_data.status and task_data.status != 'done' and current_task['completed_at']:
            # If status changed from 'done' to something else, clear completed_at
            param_count += 1
            updates.append(f"completed_at = ${param_count}")
            params.append(None)
        
        # Add task_id for WHERE clause
        param_count += 1
        params.append(task_id)
        
        # Update task
        updated_row = await conn.fetchrow(
            f"""
            UPDATE board_tasks 
            SET {', '.join(updates)}
            WHERE id = ${param_count}
            RETURNING id, title, description, status, priority, category, due_date,
                      assigned_to, assigned_to_name, created_by, created_by_name,
                      created_at, updated_at, completed_at
            """,
            *params
        )
        
        # Log activities for each change
        for change in changes:
            await log_task_activity(
                conn, task_id, "updated", user,
                change['field'], change['old_value'], change['new_value']
            )
        
        return BoardTask(
            id=str(updated_row['id']),
            title=updated_row['title'],
            description=updated_row['description'],
            status=updated_row['status'],
            priority=updated_row['priority'],
            category=updated_row['category'],
            due_date=updated_row['due_date'],
            assigned_to=updated_row['assigned_to'],
            assigned_to_name=updated_row['assigned_to_name'],
            created_by=updated_row['created_by'],
            created_by_name=updated_row['created_by_name'],
            created_at=updated_row['created_at'],
            updated_at=updated_row['updated_at'],
            completed_at=updated_row['completed_at'],
            is_overdue=is_task_overdue(updated_row['due_date'], updated_row['status'])
        )
    finally:
        await conn.close()

@router.delete("/tasks/{task_id}")
async def delete_board_task(task_id: str, user: AuthorizedUser):
    """Delete a board task"""
    conn = await get_db_connection()
    try:
        # Check if task exists
        task_exists = await conn.fetchval(
            "SELECT id FROM board_tasks WHERE id = $1", task_id
        )
        
        if not task_exists:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Log deletion activity before deleting (activities will be cascade deleted)
        await log_task_activity(conn, task_id, "deleted", user)
        
        # Delete task (activities will be cascade deleted due to foreign key)
        await conn.execute(
            "DELETE FROM board_tasks WHERE id = $1", task_id
        )
        
        return {"message": "Task deleted successfully"}
    finally:
        await conn.close()
