"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { FileText, Plus, Edit, Trash2, Save, ArrowLeft, Copy, Eye, Settings, Loader2, CheckCircle, AlertTriangle, X } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import ReportTemplateDesigner from "@/components/ReportTemplateDesigner";
export default function ReportTemplatesPage() {
  const {
    schoolId,
    userRole
  } = useAuth();
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDesigner, setShowDesigner] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch templates from localStorage or Firestore
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);

        // Try to get templates from localStorage first
        const storedTemplates = localStorage.getItem(`reportTemplates_${schoolId}`);
        if (storedTemplates) {
          setTemplates(JSON.parse(storedTemplates));
          setLoading(false);
          return;
        }

        // If no templates in localStorage, try Firestore
        if (schoolId) {
          const {
            collection,
            query,
            getDocs,
            orderBy
          } = await import('firebase/firestore');
          const {
            db
          } = await import('@/lib/firebase');
          const templatesRef = collection(db, `schools/${schoolId}/reportTemplates`);
          const templatesQuery = query(templatesRef, orderBy('createdAt', 'desc'));
          const snapshot = await getDocs(templatesQuery);
          const fetchedTemplates: any[] = [];
          snapshot.forEach(doc => {
            fetchedTemplates.push({
              id: doc.id,
              ...doc.data()
            });
          });
          setTemplates(fetchedTemplates);

          // Save to localStorage for faster access next time
          localStorage.setItem(`reportTemplates_${schoolId}`, JSON.stringify(fetchedTemplates));
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
        toast.error("Gagal mengambil template laporan");
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [schoolId]);

  // Create a new template
  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowDesigner(true);
  };

  // Edit an existing template
  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setShowDesigner(true);
  };

  // Save template (new or edited)
  const handleSaveTemplate = async (templateData: any) => {
    try {
      setSaving(true);
      const isEditing = !!editingTemplate;
      const templateId = isEditing ? editingTemplate.id : `template_${Date.now()}`;
      const newTemplate = {
        id: templateId,
        ...templateData,
        updatedAt: new Date().toISOString(),
        createdAt: isEditing ? editingTemplate.createdAt : new Date().toISOString()
      };

      // Save to Firestore if available
      if (schoolId) {
        try {
          const {
            doc,
            setDoc,
            collection
          } = await import('firebase/firestore');
          const {
            db
          } = await import('@/lib/firebase');
          await setDoc(doc(db, `schools/${schoolId}/reportTemplates`, templateId), newTemplate);
        } catch (firestoreError) {
          console.error("Error saving to Firestore:", firestoreError);
          // Continue with localStorage save even if Firestore fails
        }
      }

      // Update local state
      setTemplates(prev => {
        const updatedTemplates = isEditing ? prev.map(t => t.id === templateId ? newTemplate : t) : [...prev, newTemplate];

        // Save to localStorage
        localStorage.setItem(`reportTemplates_${schoolId}`, JSON.stringify(updatedTemplates));
        return updatedTemplates;
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setShowDesigner(false);
      }, 1500);
      toast.success(isEditing ? "Template berhasil diperbarui" : "Template baru berhasil dibuat");
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Gagal menyimpan template");
    } finally {
      setSaving(false);
    }
  };

  // Delete a template
  const handleDeleteTemplate = async (templateId: string) => {
    try {
      // Delete from Firestore if available
      if (schoolId) {
        try {
          const {
            doc,
            deleteDoc
          } = await import('firebase/firestore');
          const {
            db
          } = await import('@/lib/firebase');
          await deleteDoc(doc(db, `schools/${schoolId}/reportTemplates`, templateId));
        } catch (firestoreError) {
          console.error("Error deleting from Firestore:", firestoreError);
          // Continue with localStorage delete even if Firestore fails
        }
      }

      // Update local state
      setTemplates(prev => {
        const updatedTemplates = prev.filter(t => t.id !== templateId);

        // Save to localStorage
        localStorage.setItem(`reportTemplates_${schoolId}`, JSON.stringify(updatedTemplates));
        return updatedTemplates;
      });
      toast.success("Template berhasil dihapus");
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Gagal menghapus template");
    }
  };

  // Duplicate a template
  const handleDuplicateTemplate = (template: any) => {
    const duplicatedTemplate = {
      ...template,
      id: `template_${Date.now()}`,
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTemplates(prev => {
      const updatedTemplates = [...prev, duplicatedTemplate];

      // Save to localStorage
      localStorage.setItem(`reportTemplates_${schoolId}`, JSON.stringify(updatedTemplates));
      return updatedTemplates;
    });

    // Save to Firestore if available
    if (schoolId) {
      const saveToFirestore = async () => {
        try {
          const {
            doc,
            setDoc
          } = await import('firebase/firestore');
          const {
            db
          } = await import('@/lib/firebase');
          await setDoc(doc(db, `schools/${schoolId}/reportTemplates`, duplicatedTemplate.id), duplicatedTemplate);
        } catch (firestoreError) {
          console.error("Error saving duplicate to Firestore:", firestoreError);
        }
      };
      saveToFirestore();
    }
    toast.success("Template berhasil diduplikasi");
  };

  // Use a template to generate a report
  const handleUseTemplate = (templateId: string) => {
    router.push(`/dashboard/reports/generate?templateId=${templateId}`);
  };

  // Confirm delete dialog
  const openDeleteDialog = (templateId: string) => {
    setTemplateToDelete(templateId);
    setDeleteDialogOpen(true);
  };

  // Cancel template editing/creation
  const handleCancelDesign = () => {
    setShowDesigner(false);
    setEditingTemplate(null);
  };
  return <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 pb-24 md:pb-6" data-unique-id="e8ca81c2-58b0-4901-bfaf-27bf52438698" data-file-name="app/dashboard/reports/templates/page.tsx" data-dynamic-text="true">
      <div className="flex items-center mb-6" data-unique-id="5afe04d0-2131-4e00-a4d9-c3ca78d6d6ed" data-file-name="app/dashboard/reports/templates/page.tsx">
        <Link href="/dashboard/reports" className="p-2 mr-2 hover:bg-gray-100 rounded-full" data-unique-id="88314cf8-7434-4024-ae9b-ab923981b1a3" data-file-name="app/dashboard/reports/templates/page.tsx">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800" data-unique-id="ed4fb298-11ad-4e0a-adad-6f5260c0508f" data-file-name="app/dashboard/reports/templates/page.tsx"><span className="editable-text" data-unique-id="4bc39b52-12c1-4c1f-8561-70348462768b" data-file-name="app/dashboard/reports/templates/page.tsx">Template Laporan</span></h1>
      </div>
      
      {showDesigner ? <div className="bg-white rounded-xl shadow-sm p-6 mb-6" data-unique-id="7b6e8c30-6611-4e9a-98d1-65c1bf824b22" data-file-name="app/dashboard/reports/templates/page.tsx">
          <div className="flex items-center justify-between mb-6" data-unique-id="4afa9ff1-3884-47f3-b737-8d02ef71e5c1" data-file-name="app/dashboard/reports/templates/page.tsx">
            <h2 className="text-xl font-semibold" data-unique-id="d257125a-9ddc-4ace-9891-0d1dcb934699" data-file-name="app/dashboard/reports/templates/page.tsx" data-dynamic-text="true">
              {editingTemplate ? "Edit Template" : "Buat Template Baru"}
            </h2>
            <button onClick={handleCancelDesign} className="text-gray-500 hover:text-gray-700" data-unique-id="f5f4ef63-6b84-4b25-a546-25317c32ef1e" data-file-name="app/dashboard/reports/templates/page.tsx">
              <X size={20} />
            </button>
          </div>
          
          <ReportTemplateDesigner initialTemplate={editingTemplate} onSave={handleSaveTemplate} onCancel={handleCancelDesign} saving={saving} saveSuccess={saveSuccess} />
        </div> : <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3" data-unique-id="d305e680-4944-423a-beb1-23eca599f38d" data-file-name="app/dashboard/reports/templates/page.tsx">
            <p className="text-gray-600" data-unique-id="fa573285-33d0-4e8f-8668-0cc03b009682" data-file-name="app/dashboard/reports/templates/page.tsx"><span className="editable-text" data-unique-id="65617be4-bb01-4ce0-af60-00c87dffab92" data-file-name="app/dashboard/reports/templates/page.tsx">
              Buat dan kelola template laporan kustom untuk kebutuhan spesifik Anda.
            </span></p>
            <button onClick={handleCreateTemplate} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary hover:bg-opacity-90 transition-colors" data-unique-id="de5e5a24-3d42-456b-8874-efcd390fb8dc" data-file-name="app/dashboard/reports/templates/page.tsx">
              <Plus size={18} /><span className="editable-text" data-unique-id="a581c5bc-1676-4773-ba52-4f5bcc306116" data-file-name="app/dashboard/reports/templates/page.tsx">
              Template Baru
            </span></button>
          </div>
          
          {loading ? <div className="flex justify-center items-center h-64" data-unique-id="038edd00-59fc-466d-a272-8ad0cdb17a3a" data-file-name="app/dashboard/reports/templates/page.tsx">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div> : templates.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16 sm:mb-6" data-unique-id="8f6c53c5-984e-4d36-a90c-8e7c102c3c17" data-file-name="app/dashboard/reports/templates/page.tsx" data-dynamic-text="true">
              {templates.map(template => <div key={template.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-200" data-unique-id="86e54e17-ec8b-4d7c-a695-d7c0d14a3855" data-file-name="app/dashboard/reports/templates/page.tsx">
                  <div className="flex justify-between items-start mb-3" data-unique-id="32567d57-b415-4431-b9fa-1be7cb9bb8b4" data-file-name="app/dashboard/reports/templates/page.tsx">
                    <div data-unique-id="79b01681-5a83-484d-a914-a868eb9e438e" data-file-name="app/dashboard/reports/templates/page.tsx">
                      <h3 className="font-semibold text-lg" data-unique-id="db15ca6c-9a7e-4224-8683-43d7a1e634c5" data-file-name="app/dashboard/reports/templates/page.tsx" data-dynamic-text="true">{template.name}</h3>
                      <p className="text-sm text-gray-500" data-unique-id="1de4fc7a-84ff-45ad-a0c3-490e5566e2e1" data-file-name="app/dashboard/reports/templates/page.tsx" data-dynamic-text="true">
                        {new Date(template.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-1" data-unique-id="862e76fb-1db3-4247-985f-853b6a977c20" data-file-name="app/dashboard/reports/templates/page.tsx">
                      <button onClick={() => handleEditTemplate(template)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit Template" data-unique-id="03dceed0-8191-4ca7-abfd-0dc62ed2418a" data-file-name="app/dashboard/reports/templates/page.tsx">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDuplicateTemplate(template)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Duplicate Template" data-unique-id="1ee18800-8fc9-4f0e-83d3-a0d0229f9d2d" data-file-name="app/dashboard/reports/templates/page.tsx">
                        <Copy size={16} />
                      </button>
                      <button onClick={() => openDeleteDialog(template.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete Template" data-unique-id="af0a1032-1bf1-4dab-90f4-084f61ecac5a" data-file-name="app/dashboard/reports/templates/page.tsx">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4" data-unique-id="c1a4cc74-3e89-472f-a977-4fcf80536d3f" data-file-name="app/dashboard/reports/templates/page.tsx">
                    <p data-unique-id="9e96dd8c-7bdd-4b1c-a20f-a4d0979eaf44" data-file-name="app/dashboard/reports/templates/page.tsx" data-dynamic-text="true">{template.description || "No description"}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4" data-unique-id="c8a3c8d0-4e1e-4ce1-8dd7-5f87bccb00c9" data-file-name="app/dashboard/reports/templates/page.tsx" data-dynamic-text="true">
                    {template.fields?.map((field: string, index: number) => <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full" data-unique-id="52c658b1-8d74-47a4-875a-c90e28010237" data-file-name="app/dashboard/reports/templates/page.tsx" data-dynamic-text="true">
                        {field}
                      </span>)}
                  </div>
                  
                  <button onClick={() => handleUseTemplate(template.id)} className="w-full flex items-center justify-center gap-2 bg-primary bg-opacity-10 text-primary px-4 py-2.5 rounded-lg hover:bg-opacity-20 transition-colors" data-unique-id="cecb393b-c492-4ff0-9021-c5751d7ec338" data-file-name="app/dashboard/reports/templates/page.tsx">
                    <Eye size={16} /><span className="editable-text" data-unique-id="75764d91-9cad-423d-a69e-2f3388797233" data-file-name="app/dashboard/reports/templates/page.tsx">
                    Gunakan Template
                  </span></button>
                </div>)}
            </div> : <div className="bg-white rounded-xl shadow-sm p-10 text-center" data-unique-id="c51911f0-cf16-4c61-943e-61c2b6ddb3da" data-file-name="app/dashboard/reports/templates/page.tsx">
              <div className="flex flex-col items-center" data-unique-id="b57339a3-6db6-4e5a-9981-851149814661" data-file-name="app/dashboard/reports/templates/page.tsx">
                <div className="bg-gray-100 rounded-full p-3 mb-4" data-unique-id="767f319e-7e1a-4655-aa3d-59ac4ccd238b" data-file-name="app/dashboard/reports/templates/page.tsx">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2" data-unique-id="e2c4da56-11e8-4e27-be4a-8e696473d08b" data-file-name="app/dashboard/reports/templates/page.tsx"><span className="editable-text" data-unique-id="d9b2c191-58ff-4ab2-9d08-3f1e014c95ba" data-file-name="app/dashboard/reports/templates/page.tsx">Belum Ada Template</span></h3>
                <p className="text-gray-500 mb-6" data-unique-id="394eee79-2665-4b23-9bd4-5619a5864724" data-file-name="app/dashboard/reports/templates/page.tsx"><span className="editable-text" data-unique-id="2bc9e7c6-7f58-42bc-bc93-dffaf7eb2345" data-file-name="app/dashboard/reports/templates/page.tsx">
                  Buat template laporan kustom pertama Anda untuk mempermudah pembuatan laporan.
                </span></p>
                <button onClick={handleCreateTemplate} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary hover:bg-opacity-90 transition-colors" data-unique-id="bbb044e6-c1f7-46c1-a052-cee6df7bc53e" data-file-name="app/dashboard/reports/templates/page.tsx">
                  <Plus size={18} /><span className="editable-text" data-unique-id="5098c107-6f65-4363-bde1-29771f74f9f3" data-file-name="app/dashboard/reports/templates/page.tsx">
                  Buat Template Baru
                </span></button>
              </div>
            </div>}
        </>}
      
      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-unique-id="0f0842b2-9bc7-48e8-9f00-b5ccfe4e1be7" data-file-name="app/dashboard/reports/templates/page.tsx">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6" data-unique-id="10ce00dc-8dcd-4120-b28e-8ca2e914ed33" data-file-name="app/dashboard/reports/templates/page.tsx">
            <div className="flex items-center mb-4" data-unique-id="9fd8e903-5f34-4664-98d5-ee961db36b99" data-file-name="app/dashboard/reports/templates/page.tsx">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold" data-unique-id="6260a9cb-cfab-4710-8206-fe179898c1e2" data-file-name="app/dashboard/reports/templates/page.tsx"><span className="editable-text" data-unique-id="fce009e9-c605-4b81-aa80-eacdbd4e6df3" data-file-name="app/dashboard/reports/templates/page.tsx">Konfirmasi Hapus</span></h3>
            </div>
            <p className="text-gray-600 mb-6" data-unique-id="cfb5a8b5-93ba-477a-aac1-f22f8843440e" data-file-name="app/dashboard/reports/templates/page.tsx"><span className="editable-text" data-unique-id="927e401a-8376-4ad2-9872-0642e5532f37" data-file-name="app/dashboard/reports/templates/page.tsx">
              Apakah Anda yakin ingin menghapus template ini? Tindakan ini tidak dapat dibatalkan.
            </span></p>
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3" data-unique-id="238c2561-a8fb-451c-8d06-8d3d1f0600a7" data-file-name="app/dashboard/reports/templates/page.tsx">
              <button onClick={() => setDeleteDialogOpen(false)} className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50" data-unique-id="19fea410-384a-4c7b-8809-b99b79c9384e" data-file-name="app/dashboard/reports/templates/page.tsx"><span className="editable-text" data-unique-id="bba955cd-9529-4867-b141-e7b106e1b0cc" data-file-name="app/dashboard/reports/templates/page.tsx">
                Batal
              </span></button>
              <button onClick={() => {
            if (templateToDelete) {
              handleDeleteTemplate(templateToDelete);
              setDeleteDialogOpen(false);
            }
          }} className="w-full sm:w-auto px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700" data-unique-id="7480fe65-78bc-4edf-98ad-ace64c40b51f" data-file-name="app/dashboard/reports/templates/page.tsx"><span className="editable-text" data-unique-id="209c168e-d779-4f72-b8d8-ea18dfc71ce5" data-file-name="app/dashboard/reports/templates/page.tsx">
                Hapus
              </span></button>
            </div>
          </div>
        </div>}
    </div>;
}