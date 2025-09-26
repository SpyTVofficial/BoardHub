

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FileText, 
  Bell, 
  Calendar, 
  Users, 
  CheckSquare, 
  Settings, 
  Home,
  User,
  LogOut,
  Building2,
  MessageSquare,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@stackframe/react';
import { LanguageSwitcher } from 'components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import brain from 'brain';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string; // Board color class
  adminOnly?: boolean;
}

interface BoardHubNavigationProps {
  className?: string;
}

export function BoardHubNavigation({ className = '' }: BoardHubNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUser();
  const { t } = useTranslation();
  const [canAccessAdmin, setCanAccessAdmin] = useState(false);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  // Check admin permissions
  useEffect(() => {
    const checkPermissions = async () => {
      if (!user) {
        setPermissionsLoaded(true);
        return;
      }
      
      try {
        const response = await brain.get_user_permissions();
        const permissions = await response.json();
        setCanAccessAdmin(permissions.can_access_admin_features);
      } catch (error) {
        console.error('Failed to check permissions:', error);
        setCanAccessAdmin(false);
      } finally {
        setPermissionsLoaded(true);
      }
    };

    checkPermissions();
  }, [user]);

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: t('navigation.dashboard', 'Dashboard'),
      path: '/',
      icon: Home,
      color: 'board-navy-500'
    },
    {
      id: 'documents',
      label: t('navigation.documents', 'Documents'),
      path: '/board-documents',
      icon: FileText,
      color: 'board-emerald-500'
    },
    {
      id: 'updates',
      label: t('navigation.updates', 'Updates'),
      path: '/board-updates',
      icon: MessageSquare,
      color: 'board-sapphire-500'
    },
    {
      id: 'meetings',
      label: t('navigation.meetings', 'Meetings'),
      path: '/meetings',
      icon: Calendar,
      color: 'board-plum-500'
    },
    {
      id: 'tasks',
      label: t('navigation.tasks', 'Tasks'),
      path: '/tasks',
      icon: CheckSquare,
      color: 'board-royal-500'
    },
    {
      id: 'chat',
      label: t('navigation.chat', 'Chat'),
      path: '/chat',
      icon: Users,
      color: 'board-teal-500'
    },
    {
      id: 'user-management',
      label: t('navigation.user_management', 'User Management'),
      path: '/user-management',
      icon: Shield,
      color: 'board-coral-500',
      adminOnly: true
    }
  ];

  // Filter navigation items based on permissions
  const visibleItems = navigationItems.filter(item => {
    if (item.adminOnly && (!permissionsLoaded || !canAccessAdmin)) {
      return false;
    }
    return true;
  });

  const getInitials = (userId: string) => {
    return userId.substring(0, 2).toUpperCase();
  };

  const handleSignOut = () => {
    window.location.href = '/auth/sign-out';
  };

  return (
    <nav className={`bg-white border-b border-board-neutral-200 shadow-sm ${className}`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-board-royal-500 to-board-plum-500 text-white rounded-lg p-2">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="text-xl font-bold text-board-royal-800">BoardHub</div>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {visibleItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`
                    flex items-center px-4 py-2 rounded-lg transition-all duration-200
                    ${isActive 
                      ? `bg-gradient-to-r from-${item.color} to-board-plum-500 text-white shadow-sm` 
                      : 'text-board-neutral-600 hover:bg-board-neutral-100 hover:text-board-royal-700'
                    }
                  `}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt={user.primaryEmail || 'User'} />
                      <AvatarFallback className="bg-gradient-to-r from-board-royal-500 to-board-plum-500 text-white">
                        {getInitials(user.id)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.primaryEmail || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.primaryEmail}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/translation-management')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t('navigation.settings', 'Settings')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('navigation.sign_out', 'Sign out')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => navigate('/auth/sign-in')}
                className="bg-gradient-to-r from-board-royal-500 to-board-plum-500 hover:from-board-royal-600 hover:to-board-plum-600 text-white"
              >
                {t('navigation.sign_in', 'Sign In')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default BoardHubNavigation;
