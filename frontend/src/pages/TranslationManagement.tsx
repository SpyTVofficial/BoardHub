
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import brain from 'brain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Globe, Search, RefreshCw } from 'lucide-react';
import { reloadTranslations } from 'utils/i18n';

interface Translation {
  id: number;
  translation_key: string;
  language_code: string;
  translation_value: string;
  category: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface TranslationForm {
  translation_key: string;
  language_code: string;
  translation_value: string;
  category: string;
  description: string;
}

const TranslationManagement = () => {
  const { t, i18n } = useTranslation();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);
  
  const [form, setForm] = useState<TranslationForm>({
    translation_key: '',
    language_code: 'en',
    translation_value: '',
    category: '',
    description: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load translations with filters
      const params: any = {};
      if (selectedLanguage !== 'all') params.language_code = selectedLanguage;
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;
      
      const [translationsRes, languagesRes, categoriesRes] = await Promise.all([
        brain.list_translations(params),
        brain.get_available_languages(),
        brain.get_translation_categories()
      ]);
      
      const translationsData = await translationsRes.json();
      const languagesData = await languagesRes.json();
      const categoriesData = await categoriesRes.json();
      
      setTranslations(translationsData);
      setLanguages(languagesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load translation data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedLanguage, selectedCategory, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTranslation) {
        // Update existing translation
        await brain.update_translation(
          { translation_id: editingTranslation.id },
          {
            translation_value: form.translation_value,
            category: form.category || null,
            description: form.description || null
          }
        );
        toast.success('Translation updated successfully');
        setEditingTranslation(null);
      } else {
        // Create new translation
        await brain.create_translation({
          translation_key: form.translation_key,
          language_code: form.language_code,
          translation_value: form.translation_value,
          category: form.category || null,
          description: form.description || null
        });
        toast.success('Translation created successfully');
        setIsCreateDialogOpen(false);
      }
      
      // Reset form
      setForm({
        translation_key: '',
        language_code: 'en',
        translation_value: '',
        category: '',
        description: ''
      });
      
      // Reload data and translations
      await loadData();
      await reloadTranslations();
    } catch (error: any) {
      console.error('Failed to save translation:', error);
      const errorMessage = error.detail || 'Failed to save translation';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (translation: Translation) => {
    setEditingTranslation(translation);
    setForm({
      translation_key: translation.translation_key,
      language_code: translation.language_code,
      translation_value: translation.translation_value,
      category: translation.category || '',
      description: translation.description || ''
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this translation?')) {
      return;
    }
    
    try {
      await brain.delete_translation({ translation_id: id });
      toast.success('Translation deleted successfully');
      await loadData();
      await reloadTranslations();
    } catch (error) {
      console.error('Failed to delete translation:', error);
      toast.error('Failed to delete translation');
    }
  };

  const handleRefreshTranslations = async () => {
    try {
      await reloadTranslations();
      toast.success('Translations reloaded successfully');
    } catch (error) {
      console.error('Failed to reload translations:', error);
      toast.error('Failed to reload translations');
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-board-neutral-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-board-royal-800">Translation Management</h1>
            <p className="text-board-neutral-600 mt-2">Manage translations for all languages and categories</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleRefreshTranslations} 
              variant="outline" 
              size="sm"
              className="border-board-neutral-300 text-board-neutral-700 hover:bg-board-neutral-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Translations
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-board-royal-500 to-board-plum-500 hover:from-board-royal-600 hover:to-board-plum-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Translation
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Translation</DialogTitle>
                  <DialogDescription>
                    Add a new translation entry for any language.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="translation_key">Translation Key</Label>
                    <Input
                      id="translation_key"
                      value={form.translation_key}
                      onChange={(e) => setForm({ ...form, translation_key: e.target.value })}
                      placeholder="e.g., nav.home, buttons.save"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language_code">Language</Label>
                    <Select value={form.language_code} onValueChange={(value) => setForm({ ...form, language_code: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English (en)</SelectItem>
                        <SelectItem value="fr">Français (fr)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="translation_value">Translation Value</Label>
                    <Input
                      id="translation_value"
                      value={form.translation_value}
                      onChange={(e) => setForm({ ...form, translation_value: e.target.value })}
                      placeholder="Enter the translated text"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category (Optional)</Label>
                    <Input
                      id="category"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="e.g., navigation, buttons, forms"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Context or usage notes"
                      rows={2}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Create Translation
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Translations</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{translations.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{languages.length}</div>
              <div className="text-xs text-muted-foreground">
                {languages.join(', ')}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Language</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{i18n.language.toUpperCase()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter translations by language, category, or search term</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search keys or values..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="language-filter">Language</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    {languages.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="category-filter">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
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

        {/* Translations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Translations</CardTitle>
            <CardDescription>Manage all translation entries</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-gray-500">Loading translations...</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {translations.map((translation) => (
                    <TableRow key={translation.id}>
                      <TableCell className="font-mono text-sm">
                        {translation.translation_key}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {translation.language_code.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {translation.translation_value}
                      </TableCell>
                      <TableCell>
                        {translation.category && (
                          <Badge variant="secondary">{translation.category}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(translation.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(translation)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Edit Translation</DialogTitle>
                                <DialogDescription>
                                  Update the translation value and details.
                                </DialogDescription>
                              </DialogHeader>
                              <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                  <Label>Translation Key</Label>
                                  <Input value={form.translation_key} disabled className="bg-gray-50" />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>Language</Label>
                                  <Input value={form.language_code.toUpperCase()} disabled className="bg-gray-50" />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="edit_translation_value">Translation Value</Label>
                                  <Input
                                    id="edit_translation_value"
                                    value={form.translation_value}
                                    onChange={(e) => setForm({ ...form, translation_value: e.target.value })}
                                    required
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="edit_category">Category</Label>
                                  <Input
                                    id="edit_category"
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="edit_description">Description</Label>
                                  <Textarea
                                    id="edit_description"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={2}
                                  />
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button type="submit" className="flex-1">
                                    Update Translation
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditingTranslation(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(translation.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            {!loading && translations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No translations found. Create your first translation to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TranslationManagement;
