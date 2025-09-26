
"""User Management API for BoardHub.

Provides endpoints for managing users, roles, and invitations.
Admin-only access required for most endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.auth import AuthorizedUser
from app.libs.user_roles import role_manager, permission_checker, UserRole

router = APIRouter(prefix="/user-management")

# Request/Response Models
class UserRoleResponse(BaseModel):
    user_id: str
    role_name: str
    assigned_by: Optional[str] = None
    assigned_by_name: Optional[str] = None
    assigned_at: datetime
    updated_at: datetime
    name: Optional[str] = None
    email: Optional[str] = None

class AssignRoleRequest(BaseModel):
    user_id: str
    role_name: str

class CreateInvitationRequest(BaseModel):
    email: str
    role_name: str

class InvitationResponse(BaseModel):
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

class AcceptInvitationRequest(BaseModel):
    invitation_token: str

class UserPermissionsResponse(BaseModel):
    user_id: str
    role: str
    can_access_admin_features: bool
    can_access_board_restricted_content: bool
    can_manage_users: bool
    can_create_board_restricted_content: bool
    can_invite_users: bool

class UserListResponse(BaseModel):
    users: List[UserRoleResponse]
    total_count: int

# Helper function to check admin access
async def require_admin_access(user: AuthorizedUser):
    """Ensure user has admin access."""
    if not await permission_checker.can_access_admin_features(user.sub):
        raise HTTPException(
            status_code=403, 
            detail="Admin access required"
        )
    return user

@router.get("/permissions", response_model=UserPermissionsResponse)
async def get_user_permissions(user: AuthorizedUser):
    """Get current user's permissions and role."""
    permissions = await permission_checker.get_user_permissions(user.sub)
    
    return UserPermissionsResponse(
        user_id=user.sub,
        **permissions
    )

@router.get("/users", response_model=UserListResponse)
async def list_users(user: AuthorizedUser):
    """List all users with their roles (admin only)."""
    # Check admin access
    await require_admin_access(user)
    
    users = await role_manager.list_users_by_role()
    
    user_responses = [
        UserRoleResponse(
            user_id=u["user_id"],
            role_name=u["role_name"] or UserRole.OTHERS,
            assigned_by=u["assigned_by"],
            assigned_by_name=u["assigned_by_name"],
            assigned_at=u["assigned_at"] or datetime.utcnow(),
            updated_at=u["updated_at"] or datetime.utcnow(),
            name=u["name"],
            email=u["email"]
        )
        for u in users
    ]
    
    return UserListResponse(
        users=user_responses,
        total_count=len(user_responses)
    )

@router.get("/users/role/{role_name}", response_model=UserListResponse)
async def list_users_by_role(
    role_name: str,
    user: AuthorizedUser
):
    """List users by specific role (admin only)."""
    # Check admin access
    await require_admin_access(user)
    
    if not UserRole.is_valid_role(role_name):
        raise HTTPException(status_code=400, detail="Invalid role name")
    
    users = await role_manager.list_users_by_role(role_name)
    
    user_responses = [
        UserRoleResponse(
            user_id=u["user_id"],
            role_name=u["role_name"] or UserRole.OTHERS,
            assigned_by=u["assigned_by"],
            assigned_by_name=u["assigned_by_name"],
            assigned_at=u["assigned_at"] or datetime.utcnow(),
            updated_at=u["updated_at"] or datetime.utcnow(),
            name=u["name"],
            email=u["email"]
        )
        for u in users
    ]
    
    return UserListResponse(
        users=user_responses,
        total_count=len(user_responses)
    )

@router.post("/assign-role")
async def assign_user_role(
    request: AssignRoleRequest,
    user: AuthorizedUser
):
    """Assign or update a user's role (admin only)."""
    # Check admin access
    await require_admin_access(user)
    
    if not UserRole.is_valid_role(request.role_name):
        raise HTTPException(status_code=400, detail="Invalid role name")
    
    # Get admin user info from Stack Auth if available
    admin_name = getattr(user, 'display_name', None) or f"Admin {user.sub[:8]}"
    
    try:
        success = await role_manager.assign_user_role(
            request.user_id,
            request.role_name,
            user.sub,
            admin_name
        )
        
        if success:
            return {"message": f"Role '{request.role_name}' assigned to user successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to assign role")
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error assigning role: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/remove-role/{user_id}")
async def remove_user_role(
    user_id: str,
    user: AuthorizedUser
):
    """Remove a user's role, reverting them to 'others' (admin only)."""
    # Check admin access
    await require_admin_access(user)
    
    try:
        success = await role_manager.remove_user_role(user_id)
        
        if success:
            return {"message": "User role removed successfully"}
        else:
            raise HTTPException(status_code=404, detail="User role not found")

    except Exception as e:
        print(f"Error removing user role: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/invitations", response_model=Dict[str, str])
async def create_invitation(
    request: CreateInvitationRequest,
    user: AuthorizedUser
):
    """Create a new user invitation (admin only)."""
    # Check admin access
    await require_admin_access(user)
    
    if not UserRole.is_valid_role(request.role_name):
        raise HTTPException(status_code=400, detail="Invalid role name")
    
    # Get admin user info
    admin_name = getattr(user, 'display_name', None) or f"Admin {user.sub[:8]}"
    
    try:
        invitation_token = await role_manager.create_invitation(
            request.email,
            request.role_name,
            user.sub,
            admin_name
        )
        
        return {
            "message": "Invitation created successfully",
            "invitation_token": invitation_token
        }
    
    except Exception as e:
        print(f"Error creating invitation: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/invitations", response_model=List[InvitationResponse])
async def list_pending_invitations(
    user: AuthorizedUser
):
    """List all pending invitations (admin only)."""
    # Check admin access
    await require_admin_access(user)
    
    try:
        invitations = await role_manager.list_pending_invitations()
        
        return [
            InvitationResponse(**invitation)
            for invitation in invitations
        ]

    except Exception as e:
        print(f"Error listing invitations: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/invitations/{invitation_id}")
async def cancel_invitation(
    invitation_id: str,
    user: AuthorizedUser
):
    """Cancel a pending invitation (admin only)."""
    # Check admin access
    await require_admin_access(user)
    
    try:
        success = await role_manager.cancel_invitation(invitation_id)
        
        if success:
            return {"message": "Invitation cancelled successfully"}
        else:
            raise HTTPException(status_code=404, detail="Invitation not found or already processed")
    
    except Exception as e:
        print(f"Error cancelling invitation: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/accept-invitation")
async def accept_invitation(
    request: AcceptInvitationRequest,
    user: AuthorizedUser
):
    """Accept an invitation and assign role to current user."""
    try:
        success = await role_manager.accept_invitation(
            request.invitation_token,
            user.sub
        )
        
        if success:
            return {"message": "Invitation accepted and role assigned successfully"}
        else:
            raise HTTPException(
                status_code=400, 
                detail="Invalid, expired, or already used invitation token"
            )
    
    except Exception as e:
        print(f"Error accepting invitation: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/invitation/{token}")
async def get_invitation_details(token: str):
    """Get invitation details for display (open endpoint for invitation acceptance)."""
    try:
        invitation = await role_manager.get_invitation(token)
        
        if not invitation:
            raise HTTPException(
                status_code=404,
                detail="Invitation not found, expired, or already used"
            )
        
        return {
            "email": invitation.email,
            "role_name": invitation.role_name,
            "invited_by_name": invitation.invited_by_name,
            "expires_at": invitation.expires_at
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting invitation: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/roles", response_model=List[str])
async def get_available_roles():
    """Get list of available roles."""
    return UserRole.all_roles()
