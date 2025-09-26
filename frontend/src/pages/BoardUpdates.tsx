
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserGuardContext } from "app/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MessageSquare, Plus, Trash2, Megaphone, Clock, User } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import brain from "brain";
import { UpdateResponse, UpdateCreate } from "types";
import { useTranslation } from "react-i18next";

export default function BoardUpdates() {
  const navigate = useNavigate();
  const { user } = useUserGuardContext();
  const { t } = useTranslation();
  const [updates, setUpdates] = useState<UpdateResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content_md: ""
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch updates
  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const response = await brain.list_updates();
      const data = await response.json();
      setUpdates(data.updates);
    } catch (error) {
      console.error('Error fetching updates:', error);
      toast.error('Failed to load updates');
    } finally {
      setLoading(false);
    }
  };

  // Load updates on mount
  useEffect(() => {
    fetchUpdates();
  }, []);

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }
    
    if (!formData.content_md.trim()) {
      errors.content_md = "Content is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const updateData: UpdateCreate = {
        title: formData.title.trim(),
        content_md: formData.content_md.trim()
      };
      
      await brain.create_update(updateData);
      toast.success('Update posted successfully');
      
      // Reset form and close dialog
      setFormData({ title: "", content_md: "" });
      setFormErrors({});
      setIsComposeDialogOpen(false);
      
      // Refresh updates list
      await fetchUpdates();
    } catch (error) {
      console.error('Error creating update:', error);
      toast.error('Failed to post update');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete update
  const handleDelete = async (updateId: string) => {
    try {
      await brain.delete_update({ updateId });
      toast.success('Update deleted successfully');
      await fetchUpdates();
    } catch (error) {
      console.error('Error deleting update:', error);
      toast.error('Failed to delete update');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-board-neutral-200 pb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-board-emerald-800 mb-2">
              {t('updates.title', 'Board Updates')}
            </h1>
            <p className="text-board-neutral-600 max-w-2xl">
              {t('updates.description', 'Share important announcements and keep the board informed with transparency and authority.')}
            </p>
          </div>
          
          {/* Compose Update Dialog */}
          <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-board-emerald-500 to-board-forest-500 hover:from-board-emerald-600 hover:to-board-forest-600 text-white shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                {t('updates.new_update', 'New Update')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="text-board-emerald-800">{t('updates.create_title', 'Create Board Update')}</DialogTitle>
                <DialogDescription className="text-board-neutral-600">
                  {t('updates.create_description', 'Share an important announcement or update with the board. Use Markdown for formatting.')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title" className="text-board-emerald-700">{t('form.title', 'Title')}</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={t('form.enter_update_title', 'Enter update title')}
                      className={formErrors.title ? "border-board-coral-500" : "border-board-neutral-300 focus:border-board-emerald-500"}
                    />
                    {formErrors.title && (
                      <p className="text-sm text-board-coral-600">{formErrors.title}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="content" className="text-board-emerald-700">{t('form.content_markdown', 'Content (Markdown)')}</Label>
                    <Textarea
                      id="content"
                      value={formData.content_md}
                      onChange={(e) => setFormData(prev => ({ ...prev, content_md: e.target.value }))}
                      placeholder={t('form.content_placeholder', `Write your update here... You can use Markdown formatting:

# Heading
**Bold text**
- Bullet point
[Link](https://example.com)`)}
                      className={formErrors.content_md ? "border-board-coral-500 min-h-[200px]" : "border-board-neutral-300 focus:border-board-emerald-500 min-h-[200px]"}
                    />
                    {formErrors.content_md && (
                      <p className="text-sm text-board-coral-600">{formErrors.content_md}</p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsComposeDialogOpen(false)}
                    disabled={isSubmitting}
                    className="border-board-neutral-300 text-board-neutral-700 hover:bg-board-neutral-50"
                  >
                    {t('buttons.cancel', 'Cancel')}
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-board-emerald-500 to-board-forest-500 hover:from-board-emerald-600 hover:to-board-forest-600 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('buttons.posting', 'Posting...') : t('buttons.post_update', 'Post Update')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Updates Feed */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-2 border-board-emerald-200 border-t-board-emerald-600 rounded-full animate-spin" />
            <span className="ml-3 text-board-neutral-500">{t('updates.loading', 'Loading updates...')}</span>
          </div>
        ) : updates.length === 0 ? (
          /* Empty State */
          <Card className="text-center py-12 border-board-neutral-200 shadow-sm bg-gradient-to-br from-board-emerald-50/30 to-white">
            <CardContent>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-board-emerald-100 to-board-emerald-200 flex items-center justify-center mx-auto mb-6">
                <Megaphone className="w-10 h-10 text-board-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-board-emerald-800">{t('updates.no_updates', 'No updates yet')}</h3>
              <p className="text-board-neutral-500 mb-6">
                {t('updates.get_started', 'Get started by posting your first board update to keep everyone informed.')}
              </p>
              <Button 
                onClick={() => setIsComposeDialogOpen(true)}
                className="bg-gradient-to-r from-board-emerald-500 to-board-forest-500 hover:from-board-emerald-600 hover:to-board-forest-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('updates.post_first', 'Post First Update')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Updates List */
          <div className="space-y-6">
            {updates.map((update) => (
              <Card key={update.id} className="border-board-neutral-200 shadow-sm bg-gradient-to-br from-white to-board-emerald-50/20 hover:shadow-md transition-all duration-200">
                <CardHeader className="border-b border-board-neutral-100 bg-gradient-to-r from-board-emerald-50/50 to-board-forest-50/30">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-board-emerald-800 mb-3 flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-board-emerald-100 to-board-emerald-200 flex items-center justify-center mr-3">
                          <MessageSquare className="w-4 h-4 text-board-emerald-600" />
                        </div>
                        {update.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-board-neutral-600">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-board-neutral-500" />
                          <span>{t('updates.by', 'By')} {update.created_by}</span>
                        </div>
                        <span className="text-board-neutral-400">•</span>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-board-neutral-500" />
                          <span>{formatDate(update.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Delete button */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="hover:bg-board-coral-50 hover:text-board-coral-600 ml-4"
                          title={t('buttons.delete_update', 'Delete update')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-board-emerald-800">{t('updates.delete_title', 'Delete Update')}</AlertDialogTitle>
                          <AlertDialogDescription className="text-board-neutral-600">
                            {t('updates.delete_confirm', `Are you sure you want to delete "${update.title}"? This action cannot be undone.`)}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-board-neutral-300 text-board-neutral-700 hover:bg-board-neutral-50">
                            {t('buttons.cancel', 'Cancel')}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(update.id)}
                            className="bg-board-coral-600 hover:bg-board-coral-700 text-white"
                          >
                            {t('buttons.delete', 'Delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <div className="prose prose-board max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      className="text-board-neutral-700 leading-relaxed"
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-board-emerald-800 border-b border-board-emerald-200" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-board-emerald-700" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-board-emerald-700" {...props} />,
                        a: ({node, ...props}) => <a className="text-board-emerald-600 hover:text-board-emerald-700 underline" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-board-emerald-300 bg-board-emerald-50 pl-4 py-2" {...props} />,
                        code: ({node, inline, ...props}) => inline 
                          ? <code className="bg-board-neutral-100 text-board-emerald-700 px-1 py-0.5 rounded text-sm" {...props} />
                          : <code className="bg-board-neutral-100 p-3 rounded-lg block" {...props} />
                      }}
                    >
                      {update.content_md}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
