import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Trash2, Eye, Copy, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ConsentFormTemplateEditor } from '../components/admin/ConsentFormTemplateEditor';

interface ConsentFormTemplate {
  id: number;
  title: string;
  description: string;
  requires_medical_history: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  sections?: any[];
}

export function AdminConsentTemplatesPage() {
  const { user, supabase } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<ConsentFormTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ConsentFormTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
      
      const { data, error } = await supabase
        .from('consent_form_templates')
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

  const fetchTemplateDetails = async (templateId: number) => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }
      
      // Fetch template sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('consent_form_template_sections')
        .select('*')
        .eq('template_id', templateId)
        .order('display_order', { ascending: true });
        
      if (sectionsError) {
        throw sectionsError;
      }
      
      // Fetch fields for each section
      const sectionsWithFields = await Promise.all(sectionsData.map(async (section) => {
        const { data: fieldsData, error: fieldsError } = await supabase
          .from('consent_form_template_fields')
          .select('*')
          .eq('section_id', section.id)
          .order('display_order', { ascending: true });
          
        if (fieldsError) {
          throw fieldsError;
        }
        
        // Process fields to match the expected format
        const processedFields = fieldsData.map(field => ({
          ...field,
          field_options: field.field_options || []
        }));
        
        return {
          ...section,
          fields: processedFields
        };
      }));
      
      // Find the template and add the sections with fields
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate({
          ...template,
          sections: sectionsWithFields
        });
        setIsEditorOpen(true);
      }
    } catch (error: any) {
      console.error('Error fetching template details:', error);
      setError(error.message || 'Failed to load template details');
    }
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setIsEditorOpen(true);
  };

  const handleEditTemplate = (templateId: number) => {
    fetchTemplateDetails(templateId);
  };

  const handleDuplicateTemplate = async (templateId: number) => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }
      
      // First, fetch the template to duplicate
      await fetchTemplateDetails(templateId);
      
      // The rest of the duplication will happen in the saveTemplate function
      // when the user saves the duplicated template
    } catch (error: any) {
      console.error('Error duplicating template:', error);
      setError(error.message || 'Failed to duplicate template');
    }
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
        .from('consent_form_templates')
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

  const saveTemplate = async (templateData: any) => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }
      
      let templateId = templateData.id;
      let isNewTemplate = !templateId;
      
      // If duplicating, remove the ID to create a new template
      if (selectedTemplate && !isNewTemplate) {
        const isDuplicating = confirm('Do you want to create a copy of this template?');
        if (isDuplicating) {
          templateId = undefined;
          isNewTemplate = true;
          templateData.title = `${templateData.title} (Copy)`;
        }
      }
      
      // Step 1: Insert or update the template
      const { data: templateResult, error: templateError } = await supabase
        .from('consent_form_templates')
        .upsert({
          id: templateId,
          title: templateData.title,
          description: templateData.description || '',
          requires_medical_history: templateData.requires_medical_history,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (templateError) {
        throw templateError;
      }
      
      // Get the template ID (either existing or newly created)
      const newTemplateId = templateResult.id;
      
      // Step 2: Process sections
      for (const section of templateData.sections) {
        // Determine if this is a new section or an existing one
        const isNewSection = typeof section.id === 'string' || isNewTemplate;
        
        // Insert or update the section
        const { data: sectionResult, error: sectionError } = await supabase
          .from('consent_form_template_sections')
          .upsert({
            id: isNewSection ? undefined : section.id,
            template_id: newTemplateId,
            title: section.title,
            description: section.description || '',
            display_order: section.display_order,
            is_required: section.is_required,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (sectionError) {
          throw sectionError;
        }
        
        // Get the section ID
        const newSectionId = sectionResult.id;
        
        // Step 3: Process fields for this section
        for (const field of section.fields) {
          // Determine if this is a new field or an existing one
          const isNewField = typeof field.id === 'string' || isNewSection;
          
          // Insert or update the field
          const { error: fieldError } = await supabase
            .from('consent_form_template_fields')
            .upsert({
              id: isNewField ? undefined : field.id,
              section_id: newSectionId,
              field_name: field.field_name,
              field_type: field.field_type,
              field_label: field.field_label,
              field_placeholder: field.field_placeholder || '',
              field_options: field.field_options || [],
              is_required: field.is_required,
              display_order: field.display_order,
              updated_at: new Date().toISOString()
            });
            
          if (fieldError) {
            throw fieldError;
          }
        }
      }
      
      // Refresh the templates list
      fetchTemplates();
      
      return true;
    } catch (error: any) {
      console.error('Error saving template:', error);
      throw new Error(error.message || 'Failed to save template');
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
            
            <ConsentFormTemplateEditor
              initialTemplate={selectedTemplate || undefined}
              onSave={saveTemplate}
              onCancel={() => setIsEditorOpen(false)}
            />
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Consent Form Templates</h1>
                <p className="text-gray-300">Manage master templates for consent forms</p>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Medical History</th>
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
                          {template.requires_medical_history ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                              Required
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400">
                              Not Required
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {formatDate(template.updated_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditTemplate(template.id)}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                            >
                              <Edit className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDuplicateTemplate(template.id)}
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
                    Create your first consent form template to get started
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-8 bg-blue-500/20 border border-blue-500/30 rounded-lg p-6">
              <h3 className="text-blue-300 font-medium mb-3">About Consent Form Templates</h3>
              <p className="text-blue-200 text-sm mb-4">
                Consent form templates are master templates that can be used to create consent forms for events. 
                These templates define the structure, sections, and fields of the consent forms.
              </p>
              <ul className="text-blue-200 text-sm space-y-2">
                <li>• Templates can be customized for different procedures (tattoo, piercing, etc.)</li>
                <li>• Each template can have multiple sections (personal details, medical history, etc.)</li>
                <li>• Sections can contain various field types (text, checkbox, radio, etc.)</li>
                <li>• Templates can be duplicated and modified for different events</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}