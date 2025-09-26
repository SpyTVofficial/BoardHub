

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Users, Clock, Search, Filter, MoreHorizontal, CalendarDays, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import brain from 'brain';
import { MeetingsResponse, Meeting as MeetingType } from 'types';

const Meetings = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [meetings, setMeetings] = useState<MeetingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [stats, setStats] = useState({ total: 0, upcoming_count: 0, in_progress_count: 0 });

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const params: any = {
        limit: 50,
        offset: 0
      };
      
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      if (typeFilter && typeFilter !== 'all') {
        params.meeting_type = typeFilter;
      }
      
      if (upcomingOnly) {
        params.upcoming_only = true;
      }
      
      const response = await brain.list_meetings(params);
      const data: MeetingsResponse = await response.json();
      
      setMeetings(data.meetings || []);
      setStats({
        total: data.total || 0,
        upcoming_count: data.upcoming_count || 0,
        in_progress_count: data.in_progress_count || 0
      });
    } catch (error) {
      console.error('Error loading meetings:', error);
      toast.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, [statusFilter, typeFilter, upcomingOnly]);

  const filteredMeetings = meetings.filter(meeting => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        meeting.title.toLowerCase().includes(query) ||
        meeting.description?.toLowerCase().includes(query) ||
        meeting.location?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      draft: { className: "bg-board-neutral-100 text-board-neutral-700 border-board-neutral-300", label: "Draft" },
      scheduled: { className: "bg-board-royal-100 text-board-royal-800 border-board-royal-300", label: "Scheduled" },
      in_progress: { className: "bg-board-golden-100 text-board-golden-800 border-board-golden-400", label: "In Progress" },
      completed: { className: "bg-board-emerald-100 text-board-emerald-800 border-board-emerald-300", label: "Completed" },
      cancelled: { className: "bg-board-coral-100 text-board-coral-800 border-board-coral-300", label: "Cancelled" }
    };
    
    const config = variants[status] || { className: "bg-board-neutral-100 text-board-neutral-700 border-board-neutral-300", label: status };
    return <Badge className={`${config.className} border font-medium`}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeLabels: Record<string, string> = {
      regular: "Regular Board",
      committee: "Committee",
      special: "Special",
      annual: "Annual",
      emergency: "Emergency"
    };
    
    return <Badge className="bg-board-plum-100 text-board-plum-800 border border-board-plum-300 font-medium">{typeLabels[type] || type}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    try {
      await brain.delete_meeting({ meetingId });
      toast.success('Meeting deleted successfully');
      loadMeetings();
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast.error('Failed to delete meeting');
    }
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setUpcomingOnly(false);
    setSearchQuery('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-board-neutral-200 pb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-board-royal-800 mb-2">
              {t('meetings.title', 'Meetings')}
            </h1>
            <p className="text-board-neutral-600 max-w-2xl">
              {t('meetings.description', 'Manage board meetings, agendas, and minutes with professional oversight.')}
            </p>
          </div>
          <Button 
            onClick={() => navigate('/MeetingDetail')} 
            className="bg-gradient-to-r from-board-royal-500 to-board-plum-500 hover:from-board-royal-600 hover:to-board-plum-600 text-white shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('meetings.new_meeting', 'New Meeting')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-board-neutral-200 shadow-sm bg-gradient-to-br from-white to-board-royal-50/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-board-royal-700">{t('meetings.total_meetings', 'Total Meetings')}</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-board-royal-100 to-board-royal-200 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-board-royal-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-board-royal-800">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card className="border-board-neutral-200 shadow-sm bg-gradient-to-br from-white to-board-golden-50/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-board-golden-700">{t('meetings.upcoming', 'Upcoming')}</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-board-golden-100 to-board-golden-200 flex items-center justify-center">
              <Clock className="h-4 w-4 text-board-golden-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-board-golden-800">{stats.upcoming_count}</div>
          </CardContent>
        </Card>
        
        <Card className="border-board-neutral-200 shadow-sm bg-gradient-to-br from-white to-board-emerald-50/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-board-emerald-700">{t('meetings.in_progress', 'In Progress')}</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-board-emerald-100 to-board-emerald-200 flex items-center justify-center">
              <Users className="h-4 w-4 text-board-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-board-emerald-800">{stats.in_progress_count}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-board-neutral-200 shadow-sm bg-gradient-to-r from-board-royal-50/30 to-white">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-board-neutral-500" />
              <Input
                placeholder={t('meetings.search_placeholder', 'Search meetings...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-board-neutral-300 focus:border-board-royal-500"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 border-board-neutral-300 focus:border-board-royal-500">
                  <SelectValue placeholder={t('meetings.status', 'Status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('meetings.all_status', 'All Status')}</SelectItem>
                  <SelectItem value="draft">{t('meetings.draft', 'Draft')}</SelectItem>
                  <SelectItem value="scheduled">{t('meetings.scheduled', 'Scheduled')}</SelectItem>
                  <SelectItem value="in_progress">{t('meetings.in_progress', 'In Progress')}</SelectItem>
                  <SelectItem value="completed">{t('meetings.completed', 'Completed')}</SelectItem>
                  <SelectItem value="cancelled">{t('meetings.cancelled', 'Cancelled')}</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-36 border-board-neutral-300 focus:border-board-royal-500">
                  <SelectValue placeholder={t('meetings.type', 'Type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('meetings.all_types', 'All Types')}</SelectItem>
                  <SelectItem value="regular">{t('meetings.regular_board', 'Regular Board')}</SelectItem>
                  <SelectItem value="committee">{t('meetings.committee', 'Committee')}</SelectItem>
                  <SelectItem value="special">{t('meetings.special', 'Special')}</SelectItem>
                  <SelectItem value="annual">{t('meetings.annual', 'Annual')}</SelectItem>
                  <SelectItem value="emergency">{t('meetings.emergency', 'Emergency')}</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant={upcomingOnly ? "default" : "outline"}
                onClick={() => setUpcomingOnly(!upcomingOnly)}
                className={upcomingOnly 
                  ? "bg-board-royal-600 hover:bg-board-royal-700 text-white" 
                  : "border-board-neutral-300 text-board-royal-700 hover:bg-board-royal-50"}
              >
                <Filter className="h-4 w-4 mr-2" />
                {t('meetings.upcoming_only', 'Upcoming Only')}
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={clearFilters}
                className="text-board-neutral-600 hover:bg-board-neutral-50"
              >
                {t('meetings.clear_filters', 'Clear Filters')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meetings List */}
      <Card className="border-board-neutral-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-board-royal-50/50 to-board-plum-50/30 border-b border-board-neutral-200">
          <CardTitle className="text-board-royal-800">
            {t('meetings.meetings_list', 'Meetings')} ({filteredMeetings.length})
          </CardTitle>
          <CardDescription className="text-board-neutral-600">
            {t('meetings.manage_description', 'Manage your board meetings and track progress')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-board-royal-200 border-t-board-royal-600 rounded-full animate-spin mr-3" />
              <div className="text-board-neutral-500">{t('meetings.loading', 'Loading meetings...')}</div>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-board-royal-100 to-board-royal-200 flex items-center justify-center mx-auto mb-6">
                <CalendarDays className="h-10 w-10 text-board-royal-600" />
              </div>
              <h3 className="text-lg font-medium text-board-royal-800 mb-2">
                {t('meetings.no_meetings', 'No meetings found')}
              </h3>
              <p className="text-board-neutral-500 mb-6">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || upcomingOnly
                  ? t('meetings.adjust_filters', 'Try adjusting your filters')
                  : t('meetings.get_started', 'Get started by creating your first meeting')}
              </p>
              <Button 
                onClick={() => navigate('/MeetingDetail')}
                className="bg-gradient-to-r from-board-royal-500 to-board-plum-500 hover:from-board-royal-600 hover:to-board-plum-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('meetings.create_meeting', 'Create Meeting')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="border border-board-neutral-200 rounded-lg p-6 hover:bg-gradient-to-r hover:from-board-royal-50/30 hover:to-white transition-all duration-200 cursor-pointer hover:shadow-sm"
                  onClick={() => navigate(`/MeetingDetail?id=${meeting.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-board-royal-100 to-board-royal-200 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-board-royal-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-board-royal-800 mb-1">{meeting.title}</h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            {getStatusBadge(meeting.status)}
                            {getTypeBadge(meeting.meeting_type)}
                          </div>
                        </div>
                      </div>
                      
                      {meeting.description && (
                        <p className="text-board-neutral-600 mb-3 line-clamp-2">{meeting.description}</p>
                      )}
                      
                      <div className="flex items-center gap-6 text-sm text-board-neutral-600 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4 text-board-neutral-500" />
                          <span>{formatDate(meeting.start_date)}</span>
                        </div>
                        
                        {meeting.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-board-neutral-500" />
                            <span>{meeting.location}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-board-neutral-500" />
                          <span>{meeting.attendee_count} {t('meetings.attendees', 'attendees')}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <span className="text-board-neutral-500">📋</span>
                          <span>{meeting.agenda_item_count} {t('meetings.agenda_items', 'agenda items')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="hover:bg-board-royal-50 text-board-neutral-600 hover:text-board-royal-700"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/MeetingDetail?id=${meeting.id}`);
                        }}>
                          {t('meetings.edit_meeting', 'Edit Meeting')}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMeeting(meeting.id);
                          }}
                          className="text-board-coral-600 hover:text-board-coral-700 hover:bg-board-coral-50"
                        >
                          {t('meetings.delete_meeting', 'Delete Meeting')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Meetings;
