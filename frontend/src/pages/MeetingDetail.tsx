


import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Users, Calendar, MapPin, Link, GripVertical, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import brain from 'brain';
import { MeetingDetailResponse, MeetingCreate, MeetingUpdate, AgendaItemCreate, AgendaItem, AttendeeCreate, Attendee } from 'types';

const MeetingDetail = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const meetingId = searchParams.get('id');
  const isEditing = !!meetingId;
  
  // Meeting state
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [meetingType, setMeetingType] = useState('regular');
  const [status, setStatus] = useState('draft');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [agendaLocked, setAgendaLocked] = useState(false);
  
  // Agenda state
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [newAgendaItem, setNewAgendaItem] = useState({
    title: '',
    description: '',
    item_type: 'discussion',
    priority: 'medium',
    time_allocated: '',
    presenter: '',
    pre_reading_required: false,
    decision_required: false
  });
  
  // Attendees state
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [newAttendee, setNewAttendee] = useState({
    name: '',
    email: '',
    role: 'member'
  });

  useEffect(() => {
    if (isEditing && meetingId) {
      loadMeeting();
    }
  }, [meetingId]);

  const loadMeeting = async () => {
    try {
      setLoading(true);
      const response = await brain.get_meeting({ meetingId: meetingId! });
      const data: MeetingDetailResponse = await response.json();
      
      const meeting = data.meeting;
      setMeeting(meeting);
      setTitle(meeting.title);
      setDescription(meeting.description || '');
      setMeetingType(meeting.meeting_type);
      setStatus(meeting.status);
      setStartDate(meeting.start_date.slice(0, 16)); // Format for datetime-local
      setEndDate(meeting.end_date ? meeting.end_date.slice(0, 16) : '');
      setLocation(meeting.location || '');
      setMeetingLink(meeting.meeting_link || '');
      setAgendaLocked(meeting.agenda_locked);
      
      setAgendaItems(data.agenda_items || []);
      setAttendees(data.attendees || []);
    } catch (error) {
      console.error('Error loading meeting:', error);
      toast.error('Failed to load meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMeeting = async () => {
    if (!title.trim()) {
      toast.error('Meeting title is required');
      return;
    }
    
    if (!startDate) {
      toast.error('Start date is required');
      return;
    }

    try {
      setSaving(true);
      
      const meetingData = {
        title: title.trim(),
        description: description.trim() || undefined,
        meeting_type: meetingType,
        start_date: new Date(startDate).toISOString(),
        end_date: endDate ? new Date(endDate).toISOString() : undefined,
        location: location.trim() || undefined,
        meeting_link: meetingLink.trim() || undefined
      };
      
      if (isEditing) {
        const updateData: MeetingUpdate = {
          ...meetingData,
          status,
          agenda_locked: agendaLocked
        };
        await brain.update_meeting({ meetingId: meetingId! }, updateData);
        toast.success('Meeting updated successfully');
      } else {
        const createData: MeetingCreate = meetingData;
        const response = await brain.create_meeting(createData);
        const newMeeting = await response.json();
        
        // Navigate to edit mode with the new meeting ID
        navigate(`/MeetingDetail?id=${newMeeting.id}`);
        toast.success('Meeting created successfully');
        return;
      }
      
      // Reload meeting data
      await loadMeeting();
    } catch (error) {
      console.error('Error saving meeting:', error);
      toast.error('Failed to save meeting');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAgendaItem = async () => {
    if (!newAgendaItem.title.trim()) {
      toast.error('Agenda item title is required');
      return;
    }
    
    if (!isEditing) {
      toast.error('Please save the meeting first');
      return;
    }

    try {
      const itemData: AgendaItemCreate = {
        title: newAgendaItem.title.trim(),
        description: newAgendaItem.description.trim() || undefined,
        item_type: newAgendaItem.item_type as any,
        priority: newAgendaItem.priority as any,
        time_allocated: newAgendaItem.time_allocated ? parseInt(newAgendaItem.time_allocated) : undefined,
        order_index: agendaItems.length,
        presenter: newAgendaItem.presenter.trim() || undefined,
        pre_reading_required: newAgendaItem.pre_reading_required,
        decision_required: newAgendaItem.decision_required
      };
      
      const response = await brain.create_agenda_item({ meetingId: meetingId! }, itemData);
      const newItem = await response.json();
      
      setAgendaItems([...agendaItems, newItem]);
      setNewAgendaItem({
        title: '',
        description: '',
        item_type: 'discussion',
        priority: 'medium',
        time_allocated: '',
        presenter: '',
        pre_reading_required: false,
        decision_required: false
      });
      
      toast.success('Agenda item added');
    } catch (error) {
      console.error('Error adding agenda item:', error);
      toast.error('Failed to add agenda item');
    }
  };

  const handleDeleteAgendaItem = async (itemId: string) => {
    try {
      await brain.delete_agenda_item({ meetingId: meetingId!, itemId });
      setAgendaItems(agendaItems.filter(item => item.id !== itemId));
      toast.success('Agenda item deleted');
    } catch (error) {
      console.error('Error deleting agenda item:', error);
      toast.error('Failed to delete agenda item');
    }
  };

  const handleAddAttendee = async () => {
    if (!newAttendee.name.trim()) {
      toast.error('Attendee name is required');
      return;
    }
    
    if (!isEditing) {
      toast.error('Please save the meeting first');
      return;
    }

    try {
      const attendeeData: AttendeeCreate = {
        name: newAttendee.name.trim(),
        email: newAttendee.email.trim() || undefined,
        role: newAttendee.role as any
      };
      
      const response = await brain.add_attendee({ meetingId: meetingId! }, attendeeData);
      const newAttendeeItem = await response.json();
      
      setAttendees([...attendees, newAttendeeItem]);
      setNewAttendee({
        name: '',
        email: '',
        role: 'member'
      });
      
      toast.success('Attendee added');
    } catch (error) {
      console.error('Error adding attendee:', error);
      toast.error('Failed to add attendee');
    }
  };

  const handleRemoveAttendee = async (attendeeId: string) => {
    try {
      await brain.remove_attendee({ meetingId: meetingId!, attendeeId });
      setAttendees(attendees.filter(attendee => attendee.id !== attendeeId));
      toast.success('Attendee removed');
    } catch (error) {
      console.error('Error removing attendee:', error);
      toast.error('Failed to remove attendee');
    }
  };

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

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { className: string }> = {
      low: { className: "bg-board-neutral-100 text-board-neutral-700 border-board-neutral-300" },
      medium: { className: "bg-board-golden-100 text-board-golden-800 border-board-golden-300" },
      high: { className: "bg-board-coral-100 text-board-coral-800 border-board-coral-300" },
      urgent: { className: "bg-board-coral-200 text-board-coral-900 border-board-coral-400" }
    };
    
    const config = variants[priority] || { className: "bg-board-neutral-100 text-board-neutral-700 border-board-neutral-300" };
    return <Badge className={`${config.className} border font-medium`}>{priority}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-board-royal-200 border-t-board-royal-600 rounded-full animate-spin mr-3" />
          <div className="text-board-neutral-500">{t('meetings.loading', 'Loading meeting...')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-board-neutral-200 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/Meetings')}
              className="text-board-neutral-600 hover:bg-board-neutral-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('meetings.back_to_meetings', 'Back to Meetings')}
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-board-royal-800 mb-2">
                {isEditing ? t('meetings.edit_meeting', 'Edit Meeting') : t('meetings.create_meeting', 'Create Meeting')}
              </h1>
              {isEditing && meeting && (
                <div className="flex items-center gap-2">
                  {getStatusBadge(meeting.status)}
                  <span className="text-board-neutral-500">
                    {t('meetings.created', 'Created')} {new Date(meeting.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
          <Button 
            onClick={handleSaveMeeting} 
            disabled={saving}
            className="bg-gradient-to-r from-board-royal-500 to-board-plum-500 hover:from-board-royal-600 hover:to-board-plum-600 text-white shadow-sm"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? t('common.saving', 'Saving...') : t('common.save', 'Save Meeting')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Meeting Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="border-board-neutral-200 shadow-sm">
            <CardHeader className="border-b border-board-neutral-100 bg-board-neutral-50">
              <CardTitle className="text-board-royal-800">{t('meetings.meeting_details', 'Meeting Details')}</CardTitle>
              <CardDescription className="text-board-neutral-600">
                {t('meetings.basic_info_description', 'Basic information about the meeting')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title" className="text-board-neutral-700">
                    {t('meetings.title', 'Meeting Title')} *
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('meetings.title_placeholder', 'Enter meeting title')}
                    className="border-board-neutral-300 focus:border-board-royal-400 focus:ring-board-royal-100"
                  />
                </div>
                
                <div>
                  <Label htmlFor="type" className="text-board-neutral-700">
                    {t('meetings.type', 'Meeting Type')}
                  </Label>
                  <Select value={meetingType} onValueChange={setMeetingType}>
                    <SelectTrigger className="border-board-neutral-300 focus:border-board-royal-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">{t('meetings.type_regular', 'Regular Board')}</SelectItem>
                      <SelectItem value="committee">Committee</SelectItem>
                      <SelectItem value="special">Special</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {isEditing && (
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="startDate">Start Date & Time *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="endDate">End Date & Time</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Meeting location"
                  />
                </div>
                
                <div>
                  <Label htmlFor="meetingLink">Meeting Link</Label>
                  <Input
                    id="meetingLink"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="Video conference link"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Meeting description and notes"
                  rows={3}
                />
              </div>
              
              {isEditing && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="agendaLocked"
                    checked={agendaLocked}
                    onCheckedChange={setAgendaLocked}
                  />
                  <Label htmlFor="agendaLocked">Lock Agenda (prevent modifications)</Label>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agenda Builder */}
          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>📋</span>
                  Agenda ({agendaItems.length} items)
                </CardTitle>
                <CardDescription>
                  Build and organize your meeting agenda
                  {agendaLocked && <Badge variant="destructive" className="ml-2">Locked</Badge>}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing Agenda Items */}
                {agendaItems.length > 0 && (
                  <div className="space-y-2">
                    {agendaItems.map((item, index) => (
                      <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="flex items-center gap-2 text-gray-400">
                              <GripVertical className="h-4 w-4" />
                              <span className="text-sm font-medium">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{item.title}</h4>
                                <Badge variant="outline">{item.item_type}</Badge>
                                {getPriorityBadge(item.priority)}
                                {item.time_allocated && (
                                  <Badge variant="outline">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {item.time_allocated}m
                                  </Badge>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                              )}
                              {item.presenter && (
                                <p className="text-sm text-gray-500">Presenter: {item.presenter}</p>
                              )}
                              <div className="flex gap-2 mt-2">
                                {item.pre_reading_required && (
                                  <Badge variant="outline" className="text-xs">Pre-reading Required</Badge>
                                )}
                                {item.decision_required && (
                                  <Badge variant="outline" className="text-xs">Decision Required</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          {!agendaLocked && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAgendaItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Agenda Item */}
                {!agendaLocked && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <h4 className="font-medium mb-3">Add Agenda Item</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <Input
                          value={newAgendaItem.title}
                          onChange={(e) => setNewAgendaItem({...newAgendaItem, title: e.target.value})}
                          placeholder="Agenda item title"
                        />
                      </div>
                      
                      <Select
                        value={newAgendaItem.item_type}
                        onValueChange={(value) => setNewAgendaItem({...newAgendaItem, item_type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="information">Information</SelectItem>
                          <SelectItem value="discussion">Discussion</SelectItem>
                          <SelectItem value="decision">Decision</SelectItem>
                          <SelectItem value="action">Action</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select
                        value={newAgendaItem.priority}
                        onValueChange={(value) => setNewAgendaItem({...newAgendaItem, priority: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Input
                        value={newAgendaItem.time_allocated}
                        onChange={(e) => setNewAgendaItem({...newAgendaItem, time_allocated: e.target.value})}
                        placeholder="Time (minutes)"
                        type="number"
                      />
                      
                      <Input
                        value={newAgendaItem.presenter}
                        onChange={(e) => setNewAgendaItem({...newAgendaItem, presenter: e.target.value})}
                        placeholder="Presenter (optional)"
                      />
                      
                      <div className="md:col-span-2">
                        <Textarea
                          value={newAgendaItem.description}
                          onChange={(e) => setNewAgendaItem({...newAgendaItem, description: e.target.value})}
                          placeholder="Description (optional)"
                          rows={2}
                        />
                      </div>
                      
                      <div className="md:col-span-2 flex gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={newAgendaItem.pre_reading_required}
                            onCheckedChange={(checked) => setNewAgendaItem({...newAgendaItem, pre_reading_required: checked})}
                          />
                          <Label>Pre-reading Required</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={newAgendaItem.decision_required}
                            onCheckedChange={(checked) => setNewAgendaItem({...newAgendaItem, decision_required: checked})}
                          />
                          <Label>Decision Required</Label>
                        </div>
                      </div>
                    </div>
                    
                    <Button onClick={handleAddAgendaItem} className="mt-3">
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Agenda
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Attendees */}
          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Attendees ({attendees.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing Attendees */}
                {attendees.length > 0 && (
                  <div className="space-y-2">
                    {attendees.map((attendee) => (
                      <div key={attendee.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium text-sm">{attendee.name}</div>
                          <div className="text-xs text-gray-500">
                            {attendee.email && <div>{attendee.email}</div>}
                            <Badge variant="outline" className="text-xs">{attendee.role}</Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAttendee(attendee.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Separator />

                {/* Add New Attendee */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Add Attendee</h4>
                  <Input
                    value={newAttendee.name}
                    onChange={(e) => setNewAttendee({...newAttendee, name: e.target.value})}
                    placeholder="Name"
                  />
                  <Input
                    value={newAttendee.email}
                    onChange={(e) => setNewAttendee({...newAttendee, email: e.target.value})}
                    placeholder="Email (optional)"
                    type="email"
                  />
                  <Select
                    value={newAttendee.role}
                    onValueChange={(value) => setNewAttendee({...newAttendee, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chair">Chair</SelectItem>
                      <SelectItem value="secretary">Secretary</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="observer">Observer</SelectItem>
                      <SelectItem value="guest">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddAttendee} size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Attendee
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Meeting Info */}
          {isEditing && meeting && (
            <Card>
              <CardHeader>
                <CardTitle>Meeting Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Created {new Date(meeting.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>👤</span>
                  <span>Created by {meeting.created_by_name}</span>
                </div>
                {meeting.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{meeting.location}</span>
                  </div>
                )}
                {meeting.meeting_link && (
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4 text-gray-400" />
                    <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Join Meeting
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingDetail;
