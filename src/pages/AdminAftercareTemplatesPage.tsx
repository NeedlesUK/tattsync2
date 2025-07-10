import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Trash2, Eye, Copy, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AftercareTemplate {
  id: number;
  title: string;
  description: string;
  procedure_type: string;
  html_content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function AdminAftercareTemplatesPage() {
  const { user, supabase } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<AftercareTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AftercareTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [procedureType, setProcedureType] = useState('tattoo');

  useEffect(() => {
    // Only allow admin access
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    fetchTemplates();
  }, [user, navigate]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      
      if (!supabase) {
        throw new Error('Supabase client not available');
      }
      
      // Check if the table exists
      const { data: tableExists } = await supabase
        .from('aftercare_templates')
        .select('id')
        .limit(1);
      
      // If table doesn't exist, create it
      if (!tableExists || tableExists.length === 0) {
        await createAftercareTemplatesTable();
      }
      
      const { data, error } = await supabase
        .from('aftercare_templates')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setTemplates(data || []);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      setError(error.message || 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const createAftercareTemplatesTable = async () => {
    if (!supabase) return;
    
    try {
      // Create the table using SQL
      const { error } = await supabase.rpc('create_aftercare_templates_table');
      
      if (error) {
        console.error('Error creating aftercare_templates table:', error);
        
        // Try to create the table directly
        await supabase.rpc('execute_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS aftercare_templates (
              id SERIAL PRIMARY KEY,
              title TEXT NOT NULL,
              description TEXT,
              procedure_type TEXT NOT NULL CHECK (procedure_type IN ('tattoo', 'piercing', 'other')),
              html_content TEXT NOT NULL,
              is_active BOOLEAN DEFAULT true,
              created_at TIMESTAMPTZ DEFAULT now(),
              updated_at TIMESTAMPTZ DEFAULT now()
            );
            
            ALTER TABLE aftercare_templates ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY "Admins can manage aftercare templates" 
              ON aftercare_templates
              FOR ALL
              TO authenticated
              USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
          `
        });
      }
      
      // Insert default template
      const defaultTemplate = await fetchDefaultTemplate();
      
      await supabase
        .from('aftercare_templates')
        .insert([
          {
            title: 'Default Tattoo Aftercare',
            description: 'Standard aftercare instructions for tattoos',
            procedure_type: 'tattoo',
            html_content: defaultTemplate,
            is_active: true
          }
        ]);
    } catch (error) {
      console.error('Error setting up aftercare templates:', error);
    }
  };

  const fetchDefaultTemplate = async () => {
    try {
      const response = await fetch('/backend/templates/aftercareEmail.html');
      return await response.text();
    } catch (error) {
      console.error('Error fetching default template:', error);
      return `
        <div style="padding: 20px;">
          <h1 style="color: #333; margin-top: 0; text-align: center;">Your Tattoo Aftercare Guide</h1>
          <p>Thank you for your trust in getting tattooed by <strong>{{artistName}}</strong> at our event. Here's everything you need to know to keep your tattoo healing beautifully:</p>
          <h2 style="color: #333; font-size: 1.2em; margin-top: 20px;">1. How Long To Leave Wrapped?</h2>
          <p>There are numerous different coverings in use in the tattoo industry. Your artist will give you specific instructions.</p>
          <h2 style="color: #333; font-size: 1.2em; margin-top: 20px;">2. Cleaning Your Tattoo</h2>
          <p>Clean your tattoo every day with a clean hand, warm water, and a fragrance-free soap. Let it air dry or gently pat it dry with a clean towel. Showers are great but no sitting water.</p>
          <h2 style="color: #333; font-size: 1.2em; margin-top: 20px;">3. Aftercare Products</h2>
          <p>Apply a thin layer of recommended aftercare cream using a clean hand 3-4 times a day.</p>
          <h2 style="color: #333; font-size: 1.2em; margin-top: 20px;">4. When To Cover Tattoo</h2>
          <p>Cover your new tattoo when in a dirty environment to help avoid infection. Allow skin to breathe as much as possible.</p>
          <h2 style="color: #333; font-size: 1.2em; margin-top: 20px;">5. Clean Clothes And Bedding</h2>
          <p>Always use a clean towel whilst your tattoo is healing and allow it to air dry when possible. Keep clothes and bedding clean and fresh!</p>
          <h2 style="color: #333; font-size: 1.2em; margin-top: 20px;">6. Avoid Standing Water</h2>
          <p>Avoid soaking your tattoo for at least a week i.e. baths, swimming, dishwater. Running water such as showers are perfect.</p>
          <h2 style="color: #333; font-size: 1.2em; margin-top: 20px;">7. Avoid UV Rays</h2>
          <p>Avoid direct sunlight & sun beds for at least 2 weeks. Always use a strong sunblock to keep your tattoo at its best.</p>
          <h2 style="color: #333; font-size: 1.2em; margin-top: 20px;">8. Do Not Pick Or Scratch</h2>
          <p>Please do not pick or scratch your tattoo whilst it is healing. This can cause trauma to the skin and lead to scarring and infection.</p>
          <h2 style="color: #333; font-size: 1.2em; margin-top: 20px;">9. Concerns or questions?</h2>
          <p>The artist that applied your tattoo is responsible for any touch-ups, concerns, or ongoing advice.</p>
          <p>Your artist for this tattoo was <strong>{{artistName}}</strong><br>
          Contact: {{artistEmail}}</p>
          <p>If you have any further questions or concerns, feel free to reply to this email or reach out directly to your artist.</p>
          <p style="font-weight: bold; margin-top: 20px;">Happy healing!</p>
        </div>
      `;
    }
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setTemplateTitle('New Aftercare Template');
    setTemplateDescription('');
    setProcedureType('tattoo');
    setEditorContent('');
    setIsEditorOpen(true);
    
    // Load default template content
    fetchDefaultTemplate().then(content => {
      setEditorContent(content);
    });
  };

  const handleEditTemplate = (template: AftercareTemplate) => {
    setSelectedTemplate(template);
    setTemplateTitle(template.title);
    setTemplateDescription(template.description || '');
    setProcedureType(template.procedure_type);
    setEditorContent(template.html_content);
    setIsEditorOpen(true);
  };

  const handleDuplicateTemplate = (template: AftercareTemplate) => {
    setSelectedTemplate(null); // Treat as new template
    setTemplateTitle(`${template.title} (Copy)`);
    setTemplateDescription(template.description || '');
    setProcedureType(template.procedure_type);
    setEditorContent(template.html_content);
    setIsEditorOpen(true);
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }
    
    try {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }
      
      const { error } = await supabase
        .from('aftercare_templates')
        .delete()
        .eq('id', templateId);
        
      if (error) {
        throw error;
      }
      
      setTemplates(templates.filter(t => t.id !== templateId));
      setSuccess('Template deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error deleting template:', error);
      setError(error.message || 'Failed to delete template');
    }
  };

  const handlePreviewTemplate = (template: AftercareTemplate) => {
    // Open a new window with the template preview
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Template Preview: ${template.title}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 5px;
            }
            .preview-header {
              background-color: #f5f5f5;
              padding: 10px;
              margin-bottom: 20px;
              border-radius: 5px;
              text-align: center;
            }
            .preview-header h1 {
              margin: 0;
              font-size: 1.2rem;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="preview-header">
              <h1>Template Preview: ${template.title}</h1>
            </div>
            ${template.html_content}
          </div>
        </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  const handleSaveTemplate = async () => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }
      
      if (!templateTitle.trim()) {
        throw new Error('Template title is required');
      }
      
      if (!editorContent.trim()) {
        throw new Error('Template content is required');
      }
      
      const templateData = {
        title: templateTitle,
        description: templateDescription,
        procedure_type: procedureType,
        html_content: editorContent,
        is_active: true,
        updated_at: new Date().toISOString()
      };
      
      if (selectedTemplate) {
        // Update existing template
        const { error } = await supabase
          .from('aftercare_templates')
          .update(templateData)
          .eq('id', selectedTemplate.id);
          
        if (error) {
          throw error;
        }
      } else {
        // Create new template
        const { error } = await supabase
          .from('aftercare_templates')
          .insert([templateData]);
          
        if (error) {
          throw error;
        }
      }
      
      // Refresh templates
      fetchTemplates();
      
      // Close editor
      setIsEditorOpen(false);
      setSuccess('Template saved successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error saving template:', error);
      setError(error.message || 'Failed to save template');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Only allow admin access
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-300 mb-6">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isEditorOpen ? (
          <div>
            <button
              onClick={() => setIsEditorOpen(false)}
              className="flex items-center text-purple-400 hover:text-purple-300 mb-6 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Templates
            </button>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">
                {selectedTemplate ? 'Edit Aftercare Template' : 'Create Aftercare Template'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Template Title
                  </label>
                  <input
                    type="text"
                    value={templateTitle}
                    onChange={(e) => setTemplateTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter template title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Procedure Type
                  </label>
                  <select
                    value={procedureType}
                    onChange={(e) => setProcedureType(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="tattoo">Tattoo</option>
                    <option value="piercing">Piercing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter template description"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  HTML Content
                </label>
                <p className="text-gray-400 text-sm mb-2">
                  Use {{artistName}}, {{artistEmail}}, {{clientName}}, and {{clientEmail}} as placeholders that will be replaced with actual values.
                </p>
                <textarea
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  rows={20}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white font-mono text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter HTML content"
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Template</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Aftercare Templates</h1>
                <p className="text-gray-300">Manage email templates for aftercare instructions</p>
              </div>
              <button
                onClick={handleCreateTemplate}
                className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Template</span>
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <p className="text-green-400 text-sm">{success}</p>
                <button 
                  onClick={() => setSuccess(null)}
                  className="ml-auto text-green-400 hover:text-green-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Template</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Procedure Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Updated</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {templates.map((template) => (
                      <tr key={template.id} className="hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-purple-400" />
                            <span className="text-white font-medium">{template.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {template.description || 'No description'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-400 capitalize">
                            {template.procedure_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {formatDate(template.updated_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditTemplate(template)}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                            >
                              <Edit className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handlePreviewTemplate(template)}
                              className="bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-1 rounded text-sm transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDuplicateTemplate(template)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded text-sm transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {templates.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No templates found</h3>
                  <p className="text-gray-400">
                    Create your first aftercare template to get started
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-8 bg-blue-500/20 border border-blue-500/30 rounded-lg p-6">
              <h3 className="text-blue-300 font-medium mb-3">About Aftercare Templates</h3>
              <p className="text-blue-200 text-sm mb-4">
                Aftercare templates are used to generate emails that are sent to clients after they complete a consent form.
                These templates provide instructions on how to care for their new tattoo or piercing.
              </p>
              <ul className="text-blue-200 text-sm space-y-2">
                <li>• Templates can be customized for different procedures (tattoo, piercing, etc.)</li>
                <li>• Use placeholders like {{artistName}} and {{clientName}} that will be replaced with actual values</li>
                <li>• HTML content allows for rich formatting and styling</li>
                <li>• Templates can be previewed before saving</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}