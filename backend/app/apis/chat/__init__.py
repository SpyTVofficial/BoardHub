
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import asyncpg
import databutton as db
import json
from datetime import datetime
from app.auth import AuthorizedUser

router = APIRouter()

# Pydantic Models
class ChatMessage(BaseModel):
    id: str
    content: str
    user_id: str
    username: str
    created_at: datetime

class ChatMessageCreate(BaseModel):
    content: str

class ChatMessagesResponse(BaseModel):
    messages: List[ChatMessage]
    total: int

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept("databutton.app")
        self.active_connections.append(websocket)
        self.user_connections[user_id] = websocket
        print(f"User {user_id} connected to chat")

    def disconnect(self, websocket: WebSocket, user_id: str):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if user_id in self.user_connections:
            del self.user_connections[user_id]
        print(f"User {user_id} disconnected from chat")

    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        for connection in self.active_connections[:]:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                print(f"Error sending message: {e}")
                # Remove broken connections
                if connection in self.active_connections:
                    self.active_connections.remove(connection)

    def get_online_users(self) -> List[str]:
        """Get list of currently online user IDs"""
        return list(self.user_connections.keys())

manager = ConnectionManager()

# Database connection helper
async def get_db_connection():
    return await asyncpg.connect(db.secrets.get("DATABASE_URL_DEV"))

@router.get("/chat/messages", response_model=ChatMessagesResponse)
async def get_chat_messages(user: AuthorizedUser, limit: int = 50, offset: int = 0):
    """Get chat message history"""
    conn = await get_db_connection()
    try:
        # Get messages ordered by newest first
        rows = await conn.fetch(
            """
            SELECT id, content, user_id, username, created_at 
            FROM chat_messages 
            ORDER BY created_at DESC 
            LIMIT $1 OFFSET $2
            """,
            limit, offset
        )
        
        # Convert to response models
        messages = [
            ChatMessage(
                id=str(row['id']),
                content=row['content'],
                user_id=row['user_id'],
                username=row['username'],
                created_at=row['created_at']
            )
            for row in rows
        ]
        
        # Reverse to show oldest first (for chat display)
        messages.reverse()
        
        # Get total count
        total = await conn.fetchval("SELECT COUNT(*) FROM chat_messages")
        
        return ChatMessagesResponse(
            messages=messages,
            total=total
        )
    finally:
        await conn.close()

@router.post("/chat/messages", response_model=ChatMessage)
async def send_chat_message(message: ChatMessageCreate, user: AuthorizedUser):
    """Send a chat message"""
    conn = await get_db_connection()
    try:
        # Insert message into database
        row = await conn.fetchrow(
            """
            INSERT INTO chat_messages (content, user_id, username)
            VALUES ($1, $2, $3)
            RETURNING id, content, user_id, username, created_at
            """,
            message.content,
            user.sub,
            user.sub  # For now, use user.sub as username. In real app, this would be display name
        )
        
        # Create response object
        chat_message = ChatMessage(
            id=str(row['id']),
            content=row['content'],
            user_id=row['user_id'],
            username=row['username'],
            created_at=row['created_at']
        )
        
        # Broadcast to all connected clients
        await manager.broadcast({
            "type": "new_message",
            "message": {
                "id": chat_message.id,
                "content": chat_message.content,
                "user_id": chat_message.user_id,
                "username": chat_message.username,
                "created_at": chat_message.created_at.isoformat()
            }
        })
        
        return chat_message
    finally:
        await conn.close()

@router.websocket("/chat/ws")
async def websocket_endpoint(websocket: WebSocket, user: AuthorizedUser):
    """WebSocket endpoint for real-time chat"""
    print(f"WebSocket connection attempt from user: {user.sub}")
    try:
        await manager.connect(websocket, user.sub)
        print(f"User {user.sub} successfully connected to WebSocket")
        
        # Send online users list
        await websocket.send_text(json.dumps({
            "type": "online_users",
            "users": manager.get_online_users()
        }))
        
        # Broadcast user joined
        await manager.broadcast({
            "type": "user_joined",
            "user_id": user.sub,
            "online_users": manager.get_online_users()
        })
        
        while True:
            # Wait for messages from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Handle different message types
            if message_data.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
            elif message_data.get("type") == "typing":
                # Broadcast typing indicator to others
                await manager.broadcast({
                    "type": "typing",
                    "user_id": user.sub,
                    "is_typing": message_data.get("is_typing", False)
                })
            
    except WebSocketDisconnect:
        print(f"User {user.sub} disconnected normally")
        manager.disconnect(websocket, user.sub)
        
        # Broadcast user left
        await manager.broadcast({
            "type": "user_left",
            "user_id": user.sub,
            "online_users": manager.get_online_users()
        })
    except Exception as e:
        print(f"WebSocket error for user {user.sub}: {e}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        manager.disconnect(websocket, user.sub)

@router.get("/chat/online-users")
async def get_online_users(user: AuthorizedUser):
    """Get list of currently online users"""
    return {
        "online_users": manager.get_online_users(),
        "count": len(manager.get_online_users())
    }
