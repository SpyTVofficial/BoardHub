import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, UserPlus, Shield, Mail, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useUserGuardContext } from 'app/auth';
import brain from 'brain';
import type { 
  UserRoleResponse, 
  InvitationResponse, 
  UserPermissionsResponse,
  UserListResponse 
} from 'types';

interface User {
  user_id: string;
  role_name: string;
  assigned_by?: string;
  assigned_by_name?: string;
  assigned_at: string;
  updated_at: string;
  name?: string;
  email?: string;
}

interface Invitation {
  id: string;
  email: string;
  role_name: string;
  invited_by: string;
  invited_by_name: string;
  invitation_token: string;
  status: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
  updated_at: string;
}

const UserManagement = () => {
  const { user } = useUserGuardContext();
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [permissions, setPermissions] = useState<UserPermissionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  
  // Form states
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false);
  const [isInviteUserOpen, setIsInviteUserOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('');

  const roles = ['admin', 'board', 'others'];
  
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'board':
        return 'default';
      case 'others':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'accepted':
        return 'default';
      case 'expired':
        return 'secondary';
      case 'cancelled':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Check user permissions first
      const permResponse = await brain.get_user_permissions();
      const permData = await permResponse.json();
      setPermissions(permData);
      
      if (!permData.can_access_admin_features) {
        toast.error('Access denied: Admin privileges required');
        return;
      }
      
      // Load users
      const usersResponse = await brain.list_users();
      const usersData: UserListResponse = await usersResponse.json();
      setUsers(usersData.users);
      
      // Load invitations
      const invitationsResponse = await brain.list_pending_invitations();
      const invitationsData: InvitationResponse[] = await invitationsResponse.json();
      setInvitations(invitationsData);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load user management data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedRole) {
      toast.error('Please select both user and role');
      return;
    }
    
    try {
      const response = await brain.assign_user_role({
        user_id: selectedUserId,
        role_name: selectedRole
      });
      
      if (response.ok) {
        toast.success('Role assigned successfully');
        setIsAssignRoleOpen(false);
        setSelectedUserId('');
        setSelectedRole('');
        await loadData();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to assign role');
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role');
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail || !inviteRole) {
      toast.error('Please enter email and select role');
      return;
    }
    
    try {
      const response = await brain.create_invitation({
        email: inviteEmail,
        role_name: inviteRole
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success('Invitation sent successfully');
        setIsInviteUserOpen(false);
        setInviteEmail('');
        setInviteRole('');
        await loadData();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const response = await brain.cancel_invitation({ invitation_id: invitationId });
      
      if (response.ok) {
        toast.success('Invitation cancelled');
        await loadData();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to cancel invitation');
      }
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast.error('Failed to cancel invitation');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading user management...</p>
        </div>
      </div>
    );
  }

  if (!permissions?.can_access_admin_features) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Access denied. You need administrator privileges to access user management.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage user roles, permissions, and invitations for BoardHub</p>
      </div>

      <div className="mb-6 flex gap-4">
        <Dialog open={isAssignRoleOpen} onOpenChange={setIsAssignRoleOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Users className="w-4 h-4 mr-2" />
              Assign Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign User Role</DialogTitle>
              <DialogDescription>
                Select a user and assign them a new role in the system.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="user-select">Select User</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.user_id} value={user.user_id}>
                        {user.name || user.email || user.user_id} ({user.role_name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="role-select">New Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAssignRole} className="w-full bg-emerald-600 hover:bg-emerald-700">
                Assign Role
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isInviteUserOpen} onOpenChange={setIsInviteUserOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
              <DialogDescription>
                Send an invitation to join BoardHub with a specific role.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <Label htmlFor="invite-role">Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleInviteUser} className="w-full bg-emerald-600 hover:bg-emerald-700">
                Send Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          <TabsTrigger value="invitations">Invitations ({invitations.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                System Users
              </CardTitle>
              <CardDescription>
                All users registered in the system with their current roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Assigned By</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell className="font-medium">
                        {user.name || `User ${user.user_id.slice(0, 8)}`}
                      </TableCell>
                      <TableCell>{user.email || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role_name)}>
                          {user.role_name.charAt(0).toUpperCase() + user.role_name.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.assigned_by_name || 'System'}</TableCell>
                      <TableCell>
                        {new Date(user.updated_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invitations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Pending Invitations
              </CardTitle>
              <CardDescription>
                Users who have been invited but haven't joined yet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Invited By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">{invitation.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(invitation.role_name)}>
                          {invitation.role_name.charAt(0).toUpperCase() + invitation.role_name.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{invitation.invited_by_name}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(invitation.status)} className="flex items-center gap-1">
                          {invitation.status === 'pending' && <Clock className="w-3 h-3" />}
                          {invitation.status === 'accepted' && <CheckCircle className="w-3 h-3" />}
                          {invitation.status === 'expired' && <XCircle className="w-3 h-3" />}
                          {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(invitation.expires_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        {invitation.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelInvitation(invitation.id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
