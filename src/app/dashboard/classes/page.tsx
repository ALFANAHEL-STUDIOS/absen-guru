"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, addDoc, deleteDoc, updateDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { Plus, Edit, Trash2, BookOpen, User, Users, School, Save, X, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import dynamic from 'next/dynamic';
const ConfirmDialog = dynamic(() => import('@/components/ConfirmDialog'), {
  ssr: false
});
interface ClassData {
  id: string;
  name: string;
  level: string;
  room: string;
  teacherName: string;
  studentCount: number;
}
export default function Classes() {
  const {
    schoolId,
    userRole
  } = useAuth();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    level: "1",
    room: "",
    teacherName: ""
  });
  const levelOptions = Array.from({
    length: 12
  }, (_, i) => ({
    value: `${i + 1}`,
    label: `${i + 1}`
  }));
  useEffect(() => {
    fetchClasses();
  }, [schoolId]);
  const fetchClasses = async () => {
    if (!schoolId) return;
    try {
      setLoading(true);
      const {
        collection,
        getDocs,
        query,
        orderBy
      } = await import('firebase/firestore');
      const classesRef = collection(db, `schools/${schoolId}/classes`);
      const classesQuery = query(classesRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(classesQuery);
      const fetchedClasses: ClassData[] = [];
      snapshot.forEach(doc => {
        fetchedClasses.push({
          id: doc.id,
          ...doc.data()
        } as ClassData);
      });

      // Calculate student count for each class
      if (fetchedClasses.length > 0) {
        const studentsRef = collection(db, `schools/${schoolId}/students`);
        const studentsSnapshot = await getDocs(studentsRef);
        const studentsByClass: {
          [key: string]: number;
        } = {};
        studentsSnapshot.forEach(doc => {
          const studentData = doc.data();
          const studentClass = studentData.class;
          if (studentClass) {
            studentsByClass[studentClass] = (studentsByClass[studentClass] || 0) + 1;
          }
        });

        // Update student count in fetched classes
        fetchedClasses.forEach(classData => {
          classData.studentCount = studentsByClass[classData.name] || 0;
        });
      }
      setClasses(fetchedClasses);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Gagal mengambil data kelas dari database");
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) {
      toast.error("Tidak dapat mengakses data sekolah");
      return;
    }
    try {
      const {
        classApi
      } = await import('@/lib/api');
      await classApi.create(schoolId, {
        ...formData,
        studentCount: 0
      });
      setShowAddModal(false);
      setFormData({
        name: "",
        level: "1",
        room: "",
        teacherName: ""
      });
      fetchClasses();
    } catch (error) {
      console.error("Error adding class:", error);
    }
  };
  const handleEditClass = (classData: ClassData) => {
    setEditingClassId(classData.id);
    setFormData({
      name: classData.name,
      level: classData.level,
      room: classData.room,
      teacherName: classData.teacherName
    });
    setShowAddModal(true);
  };
  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId || !editingClassId) {
      return;
    }
    try {
      const {
        classApi
      } = await import('@/lib/api');
      await classApi.update(schoolId, editingClassId, formData);
      setShowAddModal(false);
      setEditingClassId(null);
      setFormData({
        name: "",
        level: "1",
        room: "",
        teacherName: ""
      });
      fetchClasses();
    } catch (error) {
      console.error("Error updating class:", error);
    }
  };
  const handleDeleteClass = async (classId: string) => {
    if (!schoolId) {
      return;
    }
    setClassToDelete(null);
    setDeleteDialogOpen(false);
    try {
      const {
        classApi
      } = await import('@/lib/api');
      await classApi.delete(schoolId, classId);
      fetchClasses();
      toast.success("Kelas berhasil dihapus");
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("Gagal menghapus kelas");
    }
  };
  const openDeleteDialog = (classId: string) => {
    setClassToDelete(classId);
    setDeleteDialogOpen(true);
  };
  return <div className="pb-20 md:pb-6" data-unique-id="1fbb5025-8a06-4eab-84da-335e768fc8d4" data-file-name="app/dashboard/classes/page.tsx" data-dynamic-text="true">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6" data-unique-id="d895a61a-f3fb-4146-b6a7-0deafe7a9d18" data-file-name="app/dashboard/classes/page.tsx" data-dynamic-text="true">
        <div className="flex items-center mb-4 md:mb-0" data-unique-id="587a0429-9e46-4c45-b04d-9b59c6b37f4f" data-file-name="app/dashboard/classes/page.tsx">
          <BookOpen className="h-7 w-7 text-primary mr-3" />
          <h1 className="text-2xl font-bold text-gray-800 text-center md:text-left" data-unique-id="439940ad-0a44-4f75-bf71-463501e5cff6" data-file-name="app/dashboard/classes/page.tsx"><span className="editable-text" data-unique-id="38e66201-d10f-40e5-bd08-59ba6e83464e" data-file-name="app/dashboard/classes/page.tsx">DAFTAR KELAS</span></h1>
        </div>
        {userRole === 'admin' && <button onClick={() => {
        setEditingClassId(null);
        setFormData({
          name: "",
          level: "1",
          room: "",
          teacherName: ""
        });
        setShowAddModal(true);
      }} className="flex items-center justify-center w-full md:w-auto gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors" data-unique-id="521607a9-1aab-45fe-8ea7-4149169fd79c" data-file-name="app/dashboard/classes/page.tsx">
            <Plus size={18} /><span className="editable-text" data-unique-id="633ccbaa-389f-4d70-a314-98676d3ec8cb" data-file-name="app/dashboard/classes/page.tsx">
            Tambah Kelas
          </span></button>}
      </div>

      {classes.length > 0 ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 md:gap-6" data-unique-id="033d44f4-426d-43b4-ab1b-2e90256b6fdc" data-file-name="app/dashboard/classes/page.tsx" data-dynamic-text="true">
          {classes.map(classData => <div key={classData.id} className={`${classData.id.charCodeAt(0) % 5 === 0 ? "bg-indigo-100" : classData.id.charCodeAt(0) % 5 === 1 ? "bg-emerald-100" : classData.id.charCodeAt(0) % 5 === 2 ? "bg-amber-100" : classData.id.charCodeAt(0) % 5 === 3 ? "bg-rose-100" : "bg-cyan-100"} rounded-xl shadow-sm overflow-hidden`} data-unique-id="1536652f-6961-427b-ad50-233946f9722e" data-file-name="app/dashboard/classes/page.tsx">
              <div className="p-5" data-unique-id="51664b20-a954-4c4e-90a0-7e2a3f494f8c" data-file-name="app/dashboard/classes/page.tsx">
                <div className="flex items-center mb-4" data-unique-id="0fddfb35-a889-43d6-b064-e31b3e3d26e5" data-file-name="app/dashboard/classes/page.tsx">
                  <div className="bg-primary/10 p-2 rounded-full mr-3" data-unique-id="55054b7e-7998-42d6-90ea-32c08af4c3e1" data-file-name="app/dashboard/classes/page.tsx">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div data-unique-id="58eb9ad4-1091-4814-adbc-58279c2e8c5c" data-file-name="app/dashboard/classes/page.tsx">
                    <h3 className="font-semibold text-lg" data-unique-id="19243398-81df-421f-87fb-e019f9fc11c2" data-file-name="app/dashboard/classes/page.tsx" data-dynamic-text="true">{classData.name}</h3>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm" data-unique-id="e8a578dc-df8f-425b-8c18-248384f42483" data-file-name="app/dashboard/classes/page.tsx">
                  <div className="flex items-center gap-2" data-unique-id="da48886f-7851-433d-bdb8-6853baf59ddf" data-file-name="app/dashboard/classes/page.tsx">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700" data-unique-id="257ce8bd-c2a9-48fa-a6c0-b37ffc259424" data-file-name="app/dashboard/classes/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="95faa61e-1f38-4b4f-9f5c-7ecb5fb6cb9c" data-file-name="app/dashboard/classes/page.tsx">Wali Kelas: </span>{classData.teacherName}</span>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-4" data-unique-id="c165caad-46f9-4892-9e7d-931ecbce4c13" data-file-name="app/dashboard/classes/page.tsx" data-dynamic-text="true">
                  {userRole === 'admin' && <>
                      <button onClick={() => handleEditClass(classData)} className="p-2 text-blue-600 rounded hover:bg-blue-100 hover:bg-opacity-20" title="Edit Kelas" data-unique-id="75bbcef2-905b-4123-9120-4b8e6cfef244" data-file-name="app/dashboard/classes/page.tsx">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => openDeleteDialog(classData.id)} className="p-2 text-red-600 rounded hover:bg-red-100 hover:bg-opacity-20" title="Hapus Kelas" data-unique-id="345a49dc-8e99-492d-9857-2f1f1efa1222" data-file-name="app/dashboard/classes/page.tsx">
                        <Trash2 size={18} />
                      </button>
                    </>}
                </div>
              </div>
            </div>)}
        </div> : <div className="bg-white rounded-xl shadow-sm p-10 text-center" data-unique-id="ecfb8c46-d4f4-406c-a776-fd936e40f125" data-file-name="app/dashboard/classes/page.tsx">
          <div className="flex flex-col items-center" data-unique-id="c6f2b7aa-b343-4ed8-945c-77ea8d281b8c" data-file-name="app/dashboard/classes/page.tsx">
            <div className="bg-gray-100 rounded-full p-3 mb-4" data-unique-id="90eda49d-87d5-4976-abf3-3fdf3b00de87" data-file-name="app/dashboard/classes/page.tsx">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4" data-unique-id="d6d5c8ce-303d-4e92-a697-98099a0cef16" data-file-name="app/dashboard/classes/page.tsx"><span className="editable-text" data-unique-id="ea27cff9-21ef-4be2-91cc-56dba75221f3" data-file-name="app/dashboard/classes/page.tsx">Belum ada data.</span></p>
            <button onClick={() => {
          setEditingClassId(null);
          setFormData({
            name: "",
            level: "1",
            room: "",
            teacherName: ""
          });
          setShowAddModal(true);
        }} className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors" data-unique-id="c94671a6-b1ac-416c-ae80-4788f69971c3" data-file-name="app/dashboard/classes/page.tsx"><span className="editable-text" data-unique-id="be238060-4c9f-49e8-9549-8b5d3f88b1b2" data-file-name="app/dashboard/classes/page.tsx">
              Tambah Kelas
            </span></button>
          </div>
        </div>}

      {/* Add/Edit Class Modal */}
      {showAddModal && <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50" data-unique-id="f5ae3100-3251-4a80-b327-7e395f4abbce" data-file-name="app/dashboard/classes/page.tsx">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-3 sm:mx-auto" data-unique-id="8b13ceee-3f08-41f1-a97a-2fb6f587eddb" data-file-name="app/dashboard/classes/page.tsx">
            <div className="flex justify-between items-center p-5 border-b" data-unique-id="42511f9e-7d4e-4af9-930e-cf93de0afbc6" data-file-name="app/dashboard/classes/page.tsx">
              <h3 className="text-lg font-semibold" data-unique-id="b289bca3-3852-4840-908a-99abb810fd8f" data-file-name="app/dashboard/classes/page.tsx" data-dynamic-text="true">
                {editingClassId ? "Edit Kelas" : "Tambah Kelas Baru"}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="rounded-full p-1 hover:bg-gray-100" data-unique-id="5f189901-5dfe-479d-b57b-f24137e00d1a" data-file-name="app/dashboard/classes/page.tsx">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={editingClassId ? handleUpdateClass : handleAddClass} data-unique-id="196adec4-4d44-4e0b-97db-ca33c55faf0c" data-file-name="app/dashboard/classes/page.tsx">
              <div className="p-5 space-y-4" data-unique-id="9d1bf408-f309-42f8-8986-159a76047f9c" data-file-name="app/dashboard/classes/page.tsx">
                <div data-unique-id="2e8946bf-2574-4800-b803-eb72fefbec82" data-file-name="app/dashboard/classes/page.tsx">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="03ca3fbd-69e4-4b75-b04d-e4d92db0d23b" data-file-name="app/dashboard/classes/page.tsx"><span className="editable-text" data-unique-id="dc3c251e-376f-4909-8a53-e902850b4736" data-file-name="app/dashboard/classes/page.tsx">
                    Nama Kelas
                  </span></label>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="Contoh: VII A" required data-unique-id="e17b9602-5970-4ef3-9ca9-63c6c6a1375c" data-file-name="app/dashboard/classes/page.tsx" />
                </div>
                
                <div data-unique-id="f9460f5a-8039-4a3b-bf32-fb0d570791f9" data-file-name="app/dashboard/classes/page.tsx">
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="1b1b5c11-87e7-4506-90dc-92e1e7868c88" data-file-name="app/dashboard/classes/page.tsx"><span className="editable-text" data-unique-id="a1060cc3-fa3e-4298-b79d-bcfdb1df04d7" data-file-name="app/dashboard/classes/page.tsx">
                    Tingkat/Kelas
                  </span></label>
                  <select id="level" name="level" value={formData.level} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" required data-unique-id="0c8089a6-df2d-4cee-be76-5bdd5e052f72" data-file-name="app/dashboard/classes/page.tsx" data-dynamic-text="true">
                    {levelOptions.map(option => <option key={option.value} value={option.value} data-unique-id="b1dfeb93-3cdc-4da6-b0d4-05bf39f4a60b" data-file-name="app/dashboard/classes/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="c5e409f1-839b-4c9b-8f32-1a2633bec83f" data-file-name="app/dashboard/classes/page.tsx">
                        Kelas </span>{option.label}
                      </option>)}
                  </select>
                </div>
                
                <div data-unique-id="eadce85f-5da6-4eaf-8657-299865af8b88" data-file-name="app/dashboard/classes/page.tsx">
                  <label htmlFor="teacherName" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="963694d1-c8f0-45de-91e0-a3ad03e9aecc" data-file-name="app/dashboard/classes/page.tsx"><span className="editable-text" data-unique-id="ba165028-2cc6-4b10-ae44-e42dedbee657" data-file-name="app/dashboard/classes/page.tsx">
                    Nama Wali Kelas
                  </span></label>
                  <input type="text" id="teacherName" name="teacherName" value={formData.teacherName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="Nama lengkap wali kelas" required data-unique-id="781405b7-59d2-4e3e-ab56-0ad2adb9fbc6" data-file-name="app/dashboard/classes/page.tsx" />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 p-5 border-t" data-unique-id="e4bb58dd-7d82-426c-bfa8-20cc1c57f9a3" data-file-name="app/dashboard/classes/page.tsx">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50" data-unique-id="4b631985-66f5-47e5-bbb2-cfeaa8caf43d" data-file-name="app/dashboard/classes/page.tsx"><span className="editable-text" data-unique-id="504bf09b-8d0e-4e25-87bd-82a4c2185339" data-file-name="app/dashboard/classes/page.tsx">
                  Batal
                </span></button>
                <button type="submit" className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors" data-unique-id="99be59fb-3165-45e2-86f0-60639f4e1d7d" data-file-name="app/dashboard/classes/page.tsx" data-dynamic-text="true">
                  <Save size={18} />
                  {editingClassId ? "Perbarui" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>}
      
      {/* Confirmation Dialog */}
      <ConfirmDialog isOpen={deleteDialogOpen} title="Konfirmasi Hapus Kelas" message="Apakah Anda yakin ingin menghapus kelas ini? Tindakan ini tidak dapat dibatalkan." confirmLabel="Hapus" cancelLabel="Batal" confirmColor="bg-red-500 hover:bg-red-600" onConfirm={() => classToDelete && handleDeleteClass(classToDelete)} onCancel={() => setDeleteDialogOpen(false)} icon={<AlertTriangle size={20} className="text-red-500" />} />
    </div>;
}