

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FileText, Plus, Search, ExternalLink, Trash2, Filter, Archive, ArchiveRestore, FolderOpen, Shield } from "lucide-react";
import { toast } from "sonner";
import brain from "brain";
import { DocumentResponse, DocumentCreate } from "types";
import { useTranslation } from "react-i18next";
import { useUserGuardContext } from "app/auth";
import { getUserRole, canAccessBoardRestricted, type UserRole } from 'utils/userRole';

const CATEGORIES = [
  "Board Meeting",
  "Financial Report",
  "Strategy Document",
  "Policy",
  "Legal Document",
  "Other"
];

const BoardDocuments = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useUserGuardContext();
  const userRole = getUserRole(user.id);
  const canAccessRestricted = canAccessBoardRestricted(userRole);
  
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<DocumentCreate>({
    title: "",
    url: "",
    category: "",
    board_restricted: false
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter documents based on user role
  const filteredDocuments = documents.filter(doc => {
    if (!canAccessRestricted && doc.board_restricted) {
      return false; // Hide board restricted content from "Others" role
    }
    return true;
  });

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await brain.list_documents({
        search: searchTerm || null,
        category: selectedCategory === "all" ? null : selectedCategory
      });
      const data = await response.json();
      setDocuments(data.documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  // Load documents on mount and when filters change
  useEffect(() => {
    fetchDocuments();
  }, [searchTerm, selectedCategory]);

  // Validate URL format
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }
    
    if (!formData.url.trim()) {
      errors.url = "URL is required";
    } else if (!isValidUrl(formData.url)) {
      errors.url = "Please enter a valid URL";
    }
    
    if (!formData.category) {
      errors.category = "Category is required";
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
      const documentData: DocumentCreate = {
        title: formData.title.trim(),
        url: formData.url.trim(),
        category: formData.category,
        board_restricted: formData.board_restricted
      };
      
      await brain.create_document(documentData);
      toast.success('Document added successfully');
      
      // Reset form and close dialog
      setFormData({ title: "", url: "", category: "", board_restricted: false });
      setFormErrors({});
      setIsAddDialogOpen(false);
      
      // Refresh documents list
      await fetchDocuments();
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error('Failed to add document');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete document
  const handleDelete = async (documentId: string) => {
    try {
      await brain.delete_document({ document_id: documentId });
      toast.success('Document deleted successfully');
      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-board-neutral-200 pb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-board-navy-800 mb-2">
              {t('documents.title', 'Board Documents')}
            </h1>
            <p className="text-board-neutral-600 max-w-2xl">
              {t('documents.description', 'Manage and access all board documents and resources with authority and transparency.')}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Archive Toggle */}
            <Button
              variant={showArchived ? "default" : "outline"}
              onClick={() => setShowArchived(!showArchived)}
              className={showArchived 
                ? "bg-board-neutral-600 hover:bg-board-neutral-700 text-white" 
                : "border-board-neutral-300 text-board-neutral-600 hover:bg-board-neutral-50"
              }
            >
              <Archive className="w-4 h-4 mr-2" />
              {showArchived ? t('documents.viewing_archive', 'Viewing Archive') : t('documents.view_archive', 'View Archive')}
            </Button>
            
            {/* Add Document Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-board-navy-500 to-board-sapphire-500 hover:from-board-navy-600 hover:to-board-sapphire-600 text-white shadow-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('documents.add_document', 'Add Document')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-board-navy-800">{t('documents.add_new', 'Add New Document')}</DialogTitle>
                  <DialogDescription className="text-board-neutral-600">
                    {t('documents.add_description', 'Add a document by providing its title, URL, and category.')}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title" className="text-board-navy-700">{t('form.title', 'Title')}</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder={t('form.enter_title', 'Enter document title')}
                        className={formErrors.title ? "border-board-coral-500" : "border-board-neutral-300 focus:border-board-navy-500"}
                      />
                      {formErrors.title && (
                        <p className="text-sm text-board-coral-600">{formErrors.title}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="url" className="text-board-navy-700">{t('form.url', 'URL')}</Label>
                      <Input
                        id="url"
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="https://example.com/document"
                        className={formErrors.url ? "border-board-coral-500" : "border-board-neutral-300 focus:border-board-navy-500"}
                      />
                      {formErrors.url && (
                        <p className="text-sm text-board-coral-600">{formErrors.url}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category" className="text-board-navy-700">{t('form.category', 'Category')}</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className={formErrors.category ? "border-board-coral-500" : "border-board-neutral-300 focus:border-board-navy-500"}>
                          <SelectValue placeholder={t('form.select_category', 'Select a category')} />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.category && (
                        <p className="text-sm text-board-coral-600">{formErrors.category}</p>
                      )}
                    </div>
                    
                    {/* Board Restricted Toggle */}
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-board-navy-700 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Board Restricted
                          </Label>
                          <p className="text-sm text-board-neutral-600">
                            Only Board members can access this document
                          </p>
                        </div>
                        <Switch
                          checked={formData.board_restricted}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, board_restricted: checked }))}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddDialogOpen(false)}
                      disabled={isSubmitting}
                      className="border-board-neutral-300 text-board-neutral-700 hover:bg-board-neutral-50"
                    >
                      {t('buttons.cancel', 'Cancel')}
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-board-navy-500 to-board-sapphire-500 hover:from-board-navy-600 hover:to-board-sapphire-600 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? t('buttons.adding', 'Adding...') : t('buttons.add_document', 'Add Document')}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Categories Overview */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-board-navy-800">{t('documents.categories', 'Document Categories')}</h3>
            <p className="text-sm text-board-neutral-500">{t('documents.categories_note', 'Categories may be added by Admin')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((category) => {
              const categoryCount = documents.filter(doc => doc.category === category).length;
              return (
                <Card 
                  key={category}
                  className={`cursor-pointer rounded-lg border transition-all duration-200 hover:shadow-md ${
                    selectedCategory === category 
                      ? 'border-board-navy-400 bg-gradient-to-br from-board-navy-50 to-board-sapphire-50 shadow-sm' 
                      : 'border-board-neutral-200 hover:border-board-navy-300 bg-gradient-to-br from-white to-board-neutral-50'
                  }`}
                  onClick={() => setSelectedCategory(selectedCategory === category ? "all" : category)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${
                      selectedCategory === category
                        ? 'bg-gradient-to-br from-board-navy-100 to-board-navy-200'
                        : 'bg-gradient-to-br from-board-neutral-100 to-board-neutral-200'
                    }`}>
                      <FileText className={`w-6 h-6 ${
                        selectedCategory === category ? 'text-board-navy-600' : 'text-board-neutral-600'
                      }`} />
                    </div>
                    <h4 className={`font-medium text-sm mb-1 ${
                      selectedCategory === category ? 'text-board-navy-700' : 'text-board-neutral-700'
                    }`}>{category}</h4>
                    <p className="text-xs text-board-neutral-500">
                      {categoryCount} {categoryCount === 1 ? t('documents.document', 'document') : t('documents.documents', 'documents')}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <Card className="border-board-neutral-200 shadow-sm bg-gradient-to-br from-white to-board-neutral-50/30">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-board-neutral-400 w-4 h-4" />
                <Input
                  placeholder={t('documents.search_placeholder', 'Search documents by title...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-board-neutral-300 focus:border-board-navy-500"
                />
              </div>
            </div>
            <div className="md:w-64">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="border-board-neutral-300 focus:border-board-navy-500">
                  <Filter className="w-4 h-4 mr-2 text-board-neutral-500" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('documents.all_categories', 'All Categories')}</SelectItem>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card className="border-board-neutral-200 shadow-sm bg-gradient-to-br from-white to-board-neutral-50/30">
        <CardHeader>
          <CardTitle className="text-xl text-board-navy-800 flex items-center">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-board-navy-100 to-board-navy-200 flex items-center justify-center mr-3">
              <FileText className="w-5 h-5 text-board-navy-600" />
            </div>
            {t('documents.documents_count', 'Documents')} ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-board-navy-200 border-t-board-navy-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-board-neutral-500">{t('documents.loading', 'Loading documents...')}</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-board-navy-100 to-board-navy-200 flex items-center justify-center mx-auto mb-6">
                <FolderOpen className="w-10 h-10 text-board-navy-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-board-navy-700">
                {searchTerm || selectedCategory !== "all" 
                  ? t('documents.no_found', `No ${showArchived ? 'archived ' : ''}documents found`)
                  : t('documents.no_yet', `No ${showArchived ? 'archived ' : ''}documents yet`)}
              </h3>
              <p className="text-board-neutral-500 mb-6">
                {searchTerm || selectedCategory !== "all" 
                  ? t('documents.try_adjusting', "Try adjusting your search or filters")
                  : showArchived 
                    ? t('documents.no_archived', "No documents have been archived yet")
                    : t('documents.get_started', "Get started by adding your first document")
                }
              </p>
              {!searchTerm && selectedCategory === "all" && (
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-gradient-to-r from-board-navy-500 to-board-sapphire-500 hover:from-board-navy-600 hover:to-board-sapphire-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('documents.add_first', 'Add Your First Document')}
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-board-neutral-200">
                    <TableHead className="text-board-navy-700">{t('table.title', 'Title')}</TableHead>
                    <TableHead className="text-board-navy-700">{t('table.category', 'Category')}</TableHead>
                    <TableHead className="text-board-navy-700">{t('table.added_by', 'Added by')}</TableHead>
                    <TableHead className="text-board-navy-700">{t('table.added_on', 'Added on')}</TableHead>
                    <TableHead className="w-[100px] text-board-navy-700">{t('table.actions', 'Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((document) => (
                    <TableRow key={document.id} className="hover:bg-board-neutral-50">
                      <TableCell className="font-medium text-board-neutral-900">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-board-royal-600" />
                          <div className="flex flex-col">
                            <span className="font-semibold">{document.title}</span>
                            {document.board_restricted && (
                              <Badge 
                                variant="secondary" 
                                className="mt-1 bg-board-coral-100 text-board-coral-700 border-board-coral-200 w-fit"
                              >
                                <Shield className="w-3 h-3 mr-1" />
                                {t('content.board_restricted', 'Board Restricted')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-board-neutral-600">
                        <Badge variant="outline" className="border-board-neutral-300 text-board-neutral-700">
                          {document.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-board-neutral-500">
                        {format(new Date(document.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(document.url, '_blank')}
                            className="border-board-neutral-300 text-board-royal-700 hover:bg-board-royal-50"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            {t('documents.open', 'Open')}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-board-coral-300 text-board-coral-700 hover:bg-board-coral-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('documents.confirm_delete', 'Delete Document')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('documents.delete_warning', 'This action cannot be undone. This will permanently delete the document.')} <strong>{document.title}</strong>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(document.id)}
                                  className="bg-board-coral-600 hover:bg-board-coral-700"
                                >
                                  {t('common.delete', 'Delete')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
