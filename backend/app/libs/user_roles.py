"""User role management library for BoardHub.

Provides utilities for managing user roles, checking permissions,
and handling role-based access control.
"""

import asyncpg
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import secrets
import databutton as db
from pydantic import BaseModel

# User role constants
class UserRole:
    ADMIN = "admin"
    BOARD = "board" 
    OTHERS = "others"
    
    @classmethod
    def all_roles(cls) -> List[str]:
        return [cls.ADMIN, cls.BOARD, cls.OTHERS]
    
    @classmethod
    def is_valid_role(cls, role: str) -> bool:
        return role in cls.all_roles()

# Pydantic models for type safety
class UserRoleModel(BaseModel):
    id: str
    user_id: str
    role_name: str
    assigned_by: Optional[str] = None
    assigned_by_name: Optional[str] = None
    assigned_at: datetime
    updated_at: datetime

class UserInvitationModel(BaseModel):
    id: str
    email: str
    role_name: str
    invited_by: str
    invited_by_name: str
    invitation_token: str
    status: str
    expires_at: datetime
    accepted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

class UserRoleManager:
    """Manages user roles and permissions in the database."""
    
    def __init__(self):
        # Get database connection string based on environment
        from app.env import Mode, mode
        if mode == Mode.PROD:
            self.db_url = db.secrets.get("DATABASE_URL_PROD")
        else:
            self.db_url = db.secrets.get("DATABASE_URL_DEV")
    
    async def _get_connection(self) -> asyncpg.Connection:
        """Get database connection."""
        return await asyncpg.connect(self.db_url)
    
    async def get_user_role(self, user_id: str) -> Optional[str]:
        """Get the role of a user. Returns 'others' if no role is assigned."""
        conn = await self._get_connection()
        try:
            result = await conn.fetchval(
                "SELECT role_name FROM user_roles WHERE user_id = $1",
                user_id
            )
            return result if result else UserRole.OTHERS
        finally:
            await conn.close()
    
    async def assign_user_role(self, user_id: str, role_name: str, assigned_by: str, assigned_by_name: str) -> bool:
        """Assign or update a user's role."""
        if not UserRole.is_valid_role(role_name):
            raise ValueError(f"Invalid role: {role_name}")
        
        conn = await self._get_connection()
        try:
            # Check if user already has a role
            existing = await conn.fetchval(
                "SELECT id FROM user_roles WHERE user_id = $1",
                user_id
            )
            
            if existing:
                # Update existing role
                await conn.execute(
                    """
                    UPDATE user_roles 
                    SET role_name = $1, assigned_by = $2, assigned_by_name = $3, updated_at = NOW()
                    WHERE user_id = $4
                    """,
                    role_name, assigned_by, assigned_by_name, user_id
                )
            else:
                # Create new role assignment
                await conn.execute(
                    """
                    INSERT INTO user_roles (user_id, role_name, assigned_by, assigned_by_name)
                    VALUES ($1, $2, $3, $4)
                    """,
                    user_id, role_name, assigned_by, assigned_by_name
                )
            return True
        finally:
            await conn.close()
    
    async def remove_user_role(self, user_id: str) -> bool:
        """Remove a user's role (they will default to 'others')."""
        conn = await self._get_connection()
        try:
            result = await conn.execute(
                "DELETE FROM user_roles WHERE user_id = $1",
                user_id
            )
            return "DELETE" in result and "1" in result
        finally:
            await conn.close()
    
    async def list_users_by_role(self, role_name: str = None) -> List[Dict[str, Any]]:
        """List all users and their roles, optionally filtered by role."""
        conn = await self._get_connection()
        try:
            if role_name:
                results = await conn.fetch(
                    """
                    SELECT ur.user_id, ur.role_name, ur.assigned_by, ur.assigned_by_name, 
                           ur.assigned_at, ur.updated_at,
                           us.name, us.email
                    FROM user_roles ur
                    LEFT JOIN neon_auth.users_sync us ON ur.user_id = us.id
                    WHERE ur.role_name = $1 AND us.deleted_at IS NULL
                    ORDER BY ur.updated_at DESC
                    """,
                    role_name
                )
            else:
                results = await conn.fetch(
                    """
                    SELECT ur.user_id, ur.role_name, ur.assigned_by, ur.assigned_by_name, 
                           ur.assigned_at, ur.updated_at,
                           us.name, us.email
                    FROM user_roles ur
                    LEFT JOIN neon_auth.users_sync us ON ur.user_id = us.id
                    WHERE us.deleted_at IS NULL
                    ORDER BY ur.updated_at DESC
                    """
                )
            
            return [dict(row) for row in results]
        finally:
            await conn.close()
    
    async def create_invitation(self, email: str, role_name: str, invited_by: str, invited_by_name: str) -> str:
        """Create a new user invitation and return the invitation token."""
        if not UserRole.is_valid_role(role_name):
            raise ValueError(f"Invalid role: {role_name}")
        
        # Generate secure token
        invitation_token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(days=7)  # 7 days expiry
        
        conn = await self._get_connection()
        try:
            await conn.execute(
                """
                INSERT INTO user_invitations (email, role_name, invited_by, invited_by_name, 
                                            invitation_token, expires_at)
                VALUES ($1, $2, $3, $4, $5, $6)
                """,
                email, role_name, invited_by, invited_by_name, invitation_token, expires_at
            )
            return invitation_token
        finally:
            await conn.close()
    
    async def get_invitation(self, token: str) -> Optional[UserInvitationModel]:
        """Get invitation details by token."""
        conn = await self._get_connection()
        try:
            result = await conn.fetchrow(
                """
                SELECT * FROM user_invitations 
                WHERE invitation_token = $1 AND status = 'pending' AND expires_at > NOW()
                """,
                token
            )
            return UserInvitationModel(**dict(result)) if result else None
        finally:
            await conn.close()
    
    async def accept_invitation(self, token: str, user_id: str) -> bool:
        """Accept an invitation and assign the role to the user."""
        invitation = await self.get_invitation(token)
        if not invitation:
            return False
        
        conn = await self._get_connection()
        try:
            # Start transaction
            async with conn.transaction():
                # Mark invitation as accepted
                await conn.execute(
                    """
                    UPDATE user_invitations 
                    SET status = 'accepted', accepted_at = NOW(), updated_at = NOW()
                    WHERE invitation_token = $1
                    """,
                    token
                )
                
                # Assign role to user
                await self.assign_user_role(
                    user_id, 
                    invitation.role_name, 
                    invitation.invited_by, 
                    invitation.invited_by_name
                )
                
            return True
        finally:
            await conn.close()
    
    async def list_pending_invitations(self) -> List[Dict[str, Any]]:
        """List all pending invitations."""
        conn = await self._get_connection()
        try:
            results = await conn.fetch(
                """
                SELECT * FROM user_invitations 
                WHERE status = 'pending' AND expires_at > NOW()
                ORDER BY created_at DESC
                """
            )
            return [dict(row) for row in results]
        finally:
            await conn.close()
    
    async def cancel_invitation(self, invitation_id: str) -> bool:
        """Cancel a pending invitation."""
        conn = await self._get_connection()
        try:
            result = await conn.execute(
                """
                UPDATE user_invitations 
                SET status = 'cancelled', updated_at = NOW()
                WHERE id = $1 AND status = 'pending'
                """,
                invitation_id
            )
            return "UPDATE" in result and "1" in result
        finally:
            await conn.close()

# Permission checking utilities
class PermissionChecker:
    """Utility class for checking user permissions."""
    
    def __init__(self):
        self.role_manager = UserRoleManager()
    
    async def can_access_admin_features(self, user_id: str) -> bool:
        """Check if user can access admin features."""
        role = await self.role_manager.get_user_role(user_id)
        return role == UserRole.ADMIN
    
    async def can_access_board_restricted_content(self, user_id: str) -> bool:
        """Check if user can access board-restricted content."""
        role = await self.role_manager.get_user_role(user_id)
        return role in [UserRole.ADMIN, UserRole.BOARD]
    
    async def can_manage_users(self, user_id: str) -> bool:
        """Check if user can manage other users."""
        role = await self.role_manager.get_user_role(user_id)
        return role == UserRole.ADMIN
    
    async def can_create_board_restricted_content(self, user_id: str) -> bool:
        """Check if user can create board-restricted content."""
        role = await self.role_manager.get_user_role(user_id)
        return role in [UserRole.ADMIN, UserRole.BOARD]
    
    async def can_invite_users(self, user_id: str) -> bool:
        """Check if user can invite new users."""
        role = await self.role_manager.get_user_role(user_id)
        return role == UserRole.ADMIN
    
    async def get_user_permissions(self, user_id: str) -> Dict[str, bool]:
        """Get all permissions for a user."""
        role = await self.role_manager.get_user_role(user_id)
        
        return {
            "can_access_admin_features": role == UserRole.ADMIN,
            "can_access_board_restricted_content": role in [UserRole.ADMIN, UserRole.BOARD],
            "can_manage_users": role == UserRole.ADMIN,
            "can_create_board_restricted_content": role in [UserRole.ADMIN, UserRole.BOARD],
            "can_invite_users": role == UserRole.ADMIN,
            "role": role
        }

# Global instances for easy access
role_manager = UserRoleManager()
permission_checker = PermissionChecker()
