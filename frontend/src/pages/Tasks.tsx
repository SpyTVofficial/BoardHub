



import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useUserGuardContext } from "app/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { 
  CalendarIcon, Plus, Search, Filter, Edit, Trash2, 
  Clock, AlertCircle, CheckCircle2, Circle, Shield
} from "lucide-react";
import { toast } from "sonner";
import brain from "brain";
import { BoardTask, BoardTaskCreate, BoardTaskUpdate } from "types";
import { useTranslation } from "react-i18next";

export default function Tasks() {
  const navigate = useNavigate();
  const { user } = useUserGuardContext();
  const { t } = useTranslation();
  
  // Simple role check - will be replaced with proper utility later
  const canAccessRestricted = true; // TODO: Replace with actual role check
  
  const [tasks, setTasks] = useState<BoardTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalTasks, setTotalTasks] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("");
  const [overdueFilter, setOverdueFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Task creation/editing
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<BoardTask | null>(null);
  const [taskForm, setTaskForm] = useState<BoardTaskCreate>({
    title: "",
    description: "",
    priority: "medium",
    category: "",
    due_date: undefined,
    assigned_to: "",
    assigned_to_name: "",
    board_restricted: false
  });
  const [editForm, setEditForm] = useState<BoardTaskUpdate>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(undefined);
  const [editCalendarDate, setEditCalendarDate] = useState<Date | undefined>(undefined);

  // Load tasks
  const loadTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") params.append('status', statusFilter);
      if (priorityFilter && priorityFilter !== "all") params.append('priority', priorityFilter);
      if (categoryFilter && categoryFilter !== "all") params.append('category', categoryFilter);
      if (assigneeFilter) params.append('assigned_to', assigneeFilter);
      if (overdueFilter) params.append('overdue_only', 'true');
      params.append('limit', '100');
      
      const response = await brain.list_board_tasks({
        status: (statusFilter && statusFilter !== "all") ? statusFilter : undefined,
        priority: (priorityFilter && priorityFilter !== "all") ? priorityFilter : undefined,
        assigned_to: assigneeFilter || undefined,
        category: (categoryFilter && categoryFilter !== "all") ? categoryFilter : undefined,
        overdue_only: overdueFilter,
        limit: 100,
        offset: 0
      });
      const data = await response.json();
      
      let filteredTasks = data.tasks;
      
      // Apply search filter on frontend
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredTasks = filteredTasks.filter((task: BoardTask) => 
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.category?.toLowerCase().includes(query)
        );
      }
      
      setTasks(filteredTasks);
      setTotalTasks(data.total);
      setOverdueCount(data.overdue_count);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Load categories
  const loadCategories = async () => {
    try {
      const response = await brain.get_task_categories();
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Create task
  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    
    setIsSubmitting(true);
    try {
      const taskData: BoardTaskCreate = {
        ...taskForm,
        due_date: calendarDate ? format(calendarDate, 'yyyy-MM-dd') as any : undefined
      };
      
      await brain.create_board_task(taskData);
      toast.success('Task created successfully');
      setIsCreateDialogOpen(false);
      setTaskForm({
        title: "",
        description: "",
        priority: "medium",
        category: "",
        due_date: undefined,
        assigned_to: "",
        assigned_to_name: "",
        board_restricted: false
      });
      setCalendarDate(undefined);
      loadTasks();
      loadCategories();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update task
  const updateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    
    setIsSubmitting(true);
    try {
      const taskData: BoardTaskUpdate = {
        ...editForm,
        due_date: editCalendarDate ? format(editCalendarDate, 'yyyy-MM-dd') as any : editForm.due_date
      };
      
      await brain.update_board_task({ task_id: editingTask.id }, taskData);
      toast.success('Task updated successfully');
      setIsEditDialogOpen(false);
      setEditingTask(null);
      setEditForm({});
      setEditCalendarDate(undefined);
      loadTasks();
      loadCategories();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await brain.delete_board_task({ task_id: taskId });
      toast.success('Task deleted successfully');
      loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  // Quick status update
  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await brain.update_board_task({ task_id: taskId }, { status: newStatus });
      toast.success('Task status updated');
      loadTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  // Open edit dialog
  const openEditDialog = (task: BoardTask) => {
    setEditingTask(task);
    setEditForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      category: task.category,
      due_date: task.due_date,
      assigned_to: task.assigned_to,
      assigned_to_name: task.assigned_to_name
    });
    setEditCalendarDate(task.due_date ? new Date(task.due_date) : undefined);
    setIsEditDialogOpen(true);
  };

  // Clear filters
  const clearFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setCategoryFilter("all");
    setAssigneeFilter("");
    setOverdueFilter(false);
    setSearchQuery("");
  };

  // Get priority color - using BoardHub functional color coding
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-board-coral-100 text-board-coral-800 border-board-coral-200';
      case 'high': return 'bg-board-salmon-100 text-board-salmon-800 border-board-salmon-200';
      case 'medium': return 'bg-board-golden-100 text-board-golden-800 border-board-golden-200';
      case 'low': return 'bg-board-emerald-100 text-board-emerald-800 border-board-emerald-200';
      default: return 'bg-board-neutral-100 text-board-neutral-800 border-board-neutral-200';
    }
  };

  // Get status color and icon - using BoardHub functional color coding
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'todo': 
        return { 
          color: 'bg-board-neutral-100 text-board-neutral-700 border-board-neutral-200', 
          icon: <Circle className="w-3 h-3" />,
          label: 'To Do'
        };
      case 'in_progress': 
        return { 
          color: 'bg-board-sapphire-100 text-board-sapphire-800 border-board-sapphire-200', 
          icon: <Clock className="w-3 h-3" />,
          label: 'In Progress'
        };
      case 'done': 
        return { 
          color: 'bg-board-emerald-100 text-board-emerald-800 border-board-emerald-200', 
          icon: <CheckCircle2 className="w-3 h-3" />,
          label: 'Done'
        };
      default: 
        return { 
          color: 'bg-board-neutral-100 text-board-neutral-800 border-board-neutral-200', 
          icon: <Circle className="w-3 h-3" />,
          label: status
        };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Status Icon Component
  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'todo':
        return <Circle className="w-4 h-4 text-board-neutral-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-board-sapphire-600" />;
      case 'done':
        return <CheckCircle2 className="w-4 h-4 text-board-emerald-600" />;
      default:
        return <Circle className="w-4 h-4 text-board-neutral-500" />;
    }
  };

  // Priority Badge Component
  const PriorityBadge = ({ priority }: { priority: string }) => {
    const variants: Record<string, string> = {
      low: "bg-board-neutral-100 text-board-neutral-700 border-board-neutral-200",
      medium: "bg-board-golden-100 text-board-golden-800 border-board-golden-200",
      high: "bg-board-coral-100 text-board-coral-800 border-board-coral-200",
      urgent: "bg-board-coral-200 text-board-coral-900 border-board-coral-300"
    };
    
    const className = variants[priority] || variants.medium;
    return (
      <Badge className={`${className} border text-xs font-medium`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  useEffect(() => {
    loadTasks();
    loadCategories();
  }, [statusFilter, priorityFilter, categoryFilter, assigneeFilter, overdueFilter]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery !== undefined) {
        loadTasks();
      }
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-board-neutral-200 pb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-board-navy-800 mb-2">
              {t('tasks.title', 'Board Tasks & Projects')}
            </h1>
            <p className="text-board-neutral-600 max-w-2xl">
              {t('tasks.description', 'Track action items, decisions, and follow-ups to keep the board organized and accountable.')}
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-board-navy-500 to-board-sapphire-500 hover:from-board-navy-600 hover:to-board-sapphire-600 text-white shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                {t('tasks.createTask', 'Create Task')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl text-board-navy-800">Create New Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={createTask} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="title">Task Title *</Label>
                    <Input
                      id="title"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                      placeholder="Enter task title"
                      required
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={taskForm.description || ""}
                      onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                      placeholder="Enter task description"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={taskForm.priority}
                      onValueChange={(value) => setTaskForm({...taskForm, priority: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={taskForm.category || ""}
                      onChange={(e) => setTaskForm({...taskForm, category: e.target.value})}
                      placeholder="e.g., Legal, Finance, Strategy"
                    />
                  </div>
                  
                  <div>
                    <Label>Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {calendarDate ? format(calendarDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={calendarDate}
                          onSelect={setCalendarDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label htmlFor="assigned_to">Assign To</Label>
                    <Input
                      id="assigned_to"
                      value={taskForm.assigned_to_name || ""}
                      onChange={(e) => {
                        setTaskForm({
                          ...taskForm, 
                          assigned_to: e.target.value,
                          assigned_to_name: e.target.value
                        });
                      }}
                      placeholder="Enter assignee name"
                    />
                  </div>
                </div>
                
                {/* Board Restricted Toggle */}
                <div className="flex items-center justify-between p-4 bg-board-neutral-50 rounded-lg border border-board-neutral-200">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-board-coral-600" />
                    <div>
                      <Label htmlFor="board_restricted" className="text-sm font-medium text-board-navy-800">
                        Board Restricted
                      </Label>
                      <p className="text-xs text-board-neutral-600">
                        Only Board members can view this task
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="board_restricted"
                    checked={taskForm.board_restricted}
                    onCheckedChange={(checked) => {
                      setTaskForm({
                        ...taskForm,
                        board_restricted: checked
                      });
                    }}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Task'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-board-neutral-200 bg-gradient-to-br from-board-neutral-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-board-navy-100 to-board-navy-200 rounded-lg flex items-center justify-center mr-3">
                  <Circle className="w-5 h-5 text-board-navy-600" />
                </div>
                <div>
                  <p className="text-sm text-board-neutral-600">{t('tasks.stats.total', 'Total Tasks')}</p>
                  <p className="text-2xl font-bold text-board-navy-800">{totalTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-board-coral-200 bg-gradient-to-br from-board-coral-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-board-coral-100 to-board-coral-200 rounded-lg flex items-center justify-center mr-3">
                  <AlertCircle className="w-5 h-5 text-board-coral-600" />
                </div>
                <div>
                  <p className="text-sm text-board-neutral-600">{t('tasks.stats.overdue', 'Overdue')}</p>
                  <p className="text-2xl font-bold text-board-coral-700">{overdueCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-board-sapphire-200 bg-gradient-to-br from-board-sapphire-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-board-sapphire-100 to-board-sapphire-200 rounded-lg flex items-center justify-center mr-3">
                  <Clock className="w-5 h-5 text-board-sapphire-600" />
                </div>
                <div>
                  <p className="text-sm text-board-neutral-600">{t('tasks.stats.inProgress', 'In Progress')}</p>
                  <p className="text-2xl font-bold text-board-sapphire-700">
                    {tasks.filter(t => t.status === 'in_progress').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-board-emerald-200 bg-gradient-to-br from-board-emerald-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-board-emerald-100 to-board-emerald-200 rounded-lg flex items-center justify-center mr-3">
                  <CheckCircle2 className="w-5 h-5 text-board-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-board-neutral-600">{t('tasks.stats.completed', 'Completed')}</p>
                  <p className="text-2xl font-bold text-board-emerald-700">
                    {tasks.filter(t => t.status === 'done').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg text-board-navy-800 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-board-neutral-400" />
                <Input
                  id="search"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Assignee</Label>
              <Input
                placeholder="Filter by assignee"
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
              />
            </div>
            
            <div className="flex items-end">
              <Button
                variant={overdueFilter ? "default" : "outline"}
                onClick={() => setOverdueFilter(!overdueFilter)}
                className="w-full"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Overdue Only
              </Button>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-board-navy-800">
            Tasks ({tasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="w-8 h-8 border-4 border-board-navy-200 border-t-board-navy-600 rounded-full animate-spin" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 text-board-neutral-500">
              <Circle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">{t('tasks.no_tasks', 'No tasks found')}</p>
              <p className="text-sm">{t('tasks.create_first', 'Create your first task to get started')}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {tasks.map((task) => (
                <Card key={task.id} className="border-board-neutral-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-board-neutral-900">{task.title}</h3>
                          {task.board_restricted && (
                            <Badge 
                              variant="secondary" 
                              className="bg-board-coral-100 text-board-coral-700 border-board-coral-200"
                            >
                              <Shield className="w-3 h-3 mr-1" />
                              {t('content.board_restricted', 'Board Restricted')}
                            </Badge>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-board-neutral-600 text-sm mb-3 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-board-neutral-500">
                          <div className="flex items-center gap-1">
                            <StatusIcon status={task.status} />
                            <span className="capitalize">{task.status.replace('_', ' ')}</span>
                          </div>
                          <PriorityBadge priority={task.priority} />
                          {task.category && (
                            <Badge variant="outline" className="text-xs">
                              {task.category}
                            </Badge>
                          )}
                          {task.due_date && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{format(new Date(task.due_date), 'MMM d')}</span>
                            </div>
                          )}
                          {task.assigned_to_name && (
                            <span>Assigned to: {task.assigned_to_name}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(task)}
                          className="text-board-neutral-600 hover:text-board-royal-600"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-board-neutral-600 hover:text-board-coral-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-board-navy-800">Edit Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={updateTask} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="edit-title">Task Title *</Label>
                <Input
                  id="edit-title"
                  value={editForm.title || ""}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  placeholder="Enter task title"
                  required
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description || ""}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editForm.status || ""}
                  onValueChange={(value) => setEditForm({...editForm, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select
                  value={editForm.priority || undefined}
                  onValueChange={(value) => setEditForm({...editForm, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={editForm.category || ""}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  placeholder="e.g., Legal, Finance, Strategy"
                />
              </div>
              
              <div>
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editCalendarDate ? format(editCalendarDate, "PPP") : 
                       editForm.due_date ? format(new Date(editForm.due_date), "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editCalendarDate || (editForm.due_date ? new Date(editForm.due_date) : undefined)}
                      onSelect={setEditCalendarDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label htmlFor="edit-assigned">Assign To</Label>
                <Input
                  id="edit-assigned"
                  value={editForm.assigned_to_name || ""}
                  onChange={(e) => {
                    setEditForm({
                      ...editForm, 
                      assigned_to: e.target.value,
                      assigned_to_name: e.target.value
                    });
                  }}
                  placeholder="Enter assignee name"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Task'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
