

import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, Plus, Calendar, CheckSquare, Users, TrendingUp } from "lucide-react";

export default function App() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const quickActions = [
    {
      title: t('home.actions.documents', 'Board Documents'),
      description: t('home.actions.documents_desc', 'Access and manage board documents'),
      icon: FileText,
      path: '/board-documents',
      color: 'board-navy',
      gradient: 'from-board-navy-500 to-board-sapphire-500'
    },
    {
      title: t('home.actions.updates', 'Board Updates'),
      description: t('home.actions.updates_desc', 'Latest announcements and news'),
      icon: MessageSquare,
      path: '/board-updates',
      color: 'board-emerald',
      gradient: 'from-board-emerald-500 to-board-forest-500'
    },
    {
      title: t('home.actions.meetings', 'Meetings'),
      description: t('home.actions.meetings_desc', 'Schedule and manage board meetings'),
      icon: Calendar,
      path: '/meetings',
      color: 'board-forest',
      gradient: 'from-board-forest-500 to-board-emerald-500'
    },
    {
      title: t('home.actions.tasks', 'Tasks & Projects'),
      description: t('home.actions.tasks_desc', 'Track action items and projects'),
      icon: CheckSquare,
      path: '/tasks',
      color: 'board-royal',
      gradient: 'from-board-royal-500 to-board-plum-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center border-b border-board-neutral-200 pb-8">
        <h1 className="text-4xl font-bold text-board-navy-800 mb-3">
          {t('home.welcome', 'Welcome to BoardHub')}
        </h1>
        <p className="text-lg text-board-neutral-600 max-w-2xl mx-auto">
          {t('home.subtitle', 'Your central platform for Management Board transparency, collaboration, and strategic decision-making.')}
        </p>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-board-neutral-200 bg-gradient-to-br from-board-neutral-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-board-navy-100 to-board-navy-200 rounded-lg flex items-center justify-center mr-4">
                <TrendingUp className="w-6 h-6 text-board-navy-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-board-navy-800">{t('home.stats.overview', 'Board Overview')}</h3>
                <p className="text-sm text-board-neutral-600">{t('home.stats.overview_desc', 'All systems operational')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-board-neutral-200 bg-gradient-to-br from-board-emerald-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-board-emerald-100 to-board-emerald-200 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-board-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-board-emerald-800">{t('home.stats.members', 'Board Members')}</h3>
                <p className="text-sm text-board-neutral-600">{t('home.stats.members_desc', 'Active collaboration')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-board-neutral-200 bg-gradient-to-br from-board-coral-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-board-coral-100 to-board-coral-200 rounded-lg flex items-center justify-center mr-4">
                <CheckSquare className="w-6 h-6 text-board-coral-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-board-coral-800">{t('home.stats.tasks', 'Active Tasks')}</h3>
                <p className="text-sm text-board-neutral-600">{t('home.stats.tasks_desc', 'On track')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-2xl font-bold text-board-navy-800 mb-6">
          {t('home.quick_actions', 'Quick Actions')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card 
                key={index}
                className="group border-board-neutral-200 bg-gradient-to-br from-white to-board-neutral-50/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => navigate(action.path)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className={`text-xl text-${action.color}-800 flex items-center`}>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${action.color}-100 to-${action.color}-200 flex items-center justify-center mr-4`}>
                        <Icon className={`w-6 h-6 text-${action.color}-600`} />
                      </div>
                      {action.title}
                    </CardTitle>
                    <Button 
                      size="sm" 
                      className={`bg-gradient-to-r ${action.gradient} hover:shadow-md text-white transition-all duration-200 group-hover:scale-105`}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(action.path);
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardDescription className="text-board-neutral-600 ml-16">
                    {action.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="ml-16">
                    <Button 
                      variant="ghost" 
                      className={`text-${action.color}-700 hover:bg-${action.color}-50 hover:text-${action.color}-800 transition-colors duration-200`}
                      onClick={() => navigate(action.path)}
                    >
                      {t('buttons.view_all', 'View All')} →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div>
        <h2 className="text-2xl font-bold text-board-navy-800 mb-6">
          {t('home.recent_activity', 'Recent Activity')}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-board-neutral-200 bg-gradient-to-br from-board-neutral-50 to-white">
            <CardHeader>
              <CardTitle className="text-board-navy-800 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-board-navy-600" />
                {t('home.recent_documents', 'Recent Documents')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-board-neutral-100 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-board-neutral-400" />
                </div>
                <p className="text-sm font-medium text-board-neutral-600">
                  {t('home.no_documents', 'No recent documents')}
                </p>
                <p className="text-xs mt-1 text-board-neutral-500">
                  {t('home.no_documents_desc', 'Documents will appear here once added')}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-board-neutral-200 bg-gradient-to-br from-board-neutral-50 to-white">
            <CardHeader>
              <CardTitle className="text-board-emerald-800 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-board-emerald-600" />
                {t('home.recent_updates', 'Recent Updates')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-board-neutral-100 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-board-neutral-400" />
                </div>
                <p className="text-sm font-medium text-board-neutral-600">
                  {t('home.no_updates', 'No recent updates')}
                </p>
                <p className="text-xs mt-1 text-board-neutral-500">
                  {t('home.no_updates_desc', 'Updates will appear here once posted')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
