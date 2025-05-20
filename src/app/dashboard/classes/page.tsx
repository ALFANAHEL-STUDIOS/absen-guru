"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp, doc, deleteDoc } from "firebase/firestore";
import {
 BookOpen,
 Plus,
 Trash2,
 Edit,
 AlertTriangle,
 Loader2,
 X,
 Save,
 User
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";
interface Class {
 id: string;
 name: string;
 level: string;
 teacherName: string;
}
export default function ClassesPage() {
 const { schoolId, userRole } = useAuth();
 const [classes, setClasses] = useState<Class[]>([]);
 const [loading, setLoading] = useState(true);
 const [showAddModal, setShowAddModal] = useState(false);
 const [showEditModal, setShowEditModal] = useState(false);
 const [showDeleteModal, setShowDeleteModal] = useState(false);
 const [selectedClass, setSelectedClass] = useState<Class | null>(null);
 const [formData, setFormData] = useState({
   name: "",
   level: "Kepala Desa",
   teacherName: ""
 });
 // Fetch classes when component mounts
 useEffect(() => {
   const fetchClasses = async () => {
     if (!schoolId) return;

     try {
       setLoading(true);
       const classesRef = collection(db, `schools/${schoolId}/classes`);
       const q = query(classesRef, orderBy("name"));
       const snapshot = await getDocs(q);

       const fetchedClasses: Class[] = [];
       snapshot.forEach((doc) => {
         fetchedClasses.push({
           id: doc.id,
           name: doc.data().name || "",
           level: doc.data().level || "",
           teacherName: doc.data().teacherName || ""
         });
       });

       setClasses(fetchedClasses);
     } catch (error) {
       console.error("Error fetching classes:", error);
       toast.error("Gagal mengambil data Kepegawaian");
     } finally {
       setLoading(false);
     }
   };

   fetchClasses();
 }, [schoolId]);
 const handleAddClass = async (e: React.FormEvent) => {
   e.preventDefault();

   if (!schoolId) {
     toast.error("Tidak dapat mengakses data instansi");
     return;
   }

   try {
     const classData = {
       name: formData.name,
       level: formData.level,
       teacherName: formData.teacherName,
       createdAt: serverTimestamp()
     };

     const docRef = await addDoc(collection(db, `schools/${schoolId}/classes`), classData);

     // Add the new class to the state
     setClasses([...classes, { id: docRef.id, ...classData as any }]);

     // Reset form and close modal
     setFormData({ name: "", level: "Kepala Desa", teacherName: "" });
     setShowAddModal(false);

     toast.success("Kepegawaian berhasil ditambahkan");
   } catch (error) {
     console.error("Error adding class:", error);
     toast.error("Gagal menambahkan Kepegawaian");
   }
 };
 const handleEditClass = async (e: React.FormEvent) => {
   e.preventDefault();

   if (!schoolId || !selectedClass) {
     toast.error("Tidak dapat mengakses data kepegawaian");
     return;
   }

   try {
     const classRef = doc(db, `schools/${schoolId}/classes`, selectedClass.id);
     await updateDoc(classRef, {
       name: formData.name,
       level: formData.level,
       teacherName: formData.teacherName,
       updatedAt: serverTimestamp()
     });

     // Update the class in the state
     setClasses(classes.map(c =>
       c.id === selectedClass.id
         ? { ...c, name: formData.name, level: formData.level, teacherName: formData.teacherName }
         : c
     ));

     // Reset form and close modal
     setFormData({ name: "", level: "Kepala Desa", teacherName: "" });
     setSelectedClass(null);
     setShowEditModal(false);

     toast.success("Kepegawaian berhasil diperbarui");
   } catch (error) {
     console.error("Error updating class:", error);
     toast.error("Gagal memperbarui kepegawaian");
   }
 };
 const handleDeleteClass = async () => {
   if (!schoolId || !selectedClass) {
     toast.error("Tidak dapat mengakses data kepegawaian");
     return;
   }

   try {
     const classRef = doc(db, `schools/${schoolId}/classes`, selectedClass.id);
     await deleteDoc(classRef);

     // Remove the class from the state
     setClasses(classes.filter(c => c.id !== selectedClass.id));

     // Reset selected class and close modal
     setSelectedClass(null);
     setShowDeleteModal(false);

     toast.success("Kepegawaian berhasil dihapus");
   } catch (error) {
     console.error("Error deleting class:", error);
     toast.error("Gagal menghapus kepegawaian");
   }
 };
 const openEditModal = (classItem: Class) => {
   setSelectedClass(classItem);
   setFormData({
     name: classItem.name,
     level: classItem.level,
     teacherName: classItem.teacherName
   });
   setShowEditModal(true);
 };
 const openDeleteModal = (classItem: Class) => {
   setSelectedClass(classItem);
   setShowDeleteModal(true);
 };
 // List of position options for the dropdown
 const positionOptions = [
   "Kepala Desa",
   "Sekretaris Desa",
   "Kaur Tata Usaha dan Umum",
   "Kaur Keuangan",
   "Kaur Perencanaan",
   "Kasi Pemerintahan",
   "Kasi Kesejahteraan",
   "Kasi Pelayanan",
   "Ketua BPK",
   "Kepala Dusun 1",
   "Kepala Dusun 2",
   "Kepala Dusun 3",
   "Kepala Dusun 4",
   "Kepala Dusun 5",
   "Kepala Dusun 6",
   "Kepala Dusun 7",
   "Kepala Dusun 8",
   "Kepala Dusun 9",
   "Kepala Dusun 10",
   "Kepala Dusun 11",
   "Kepala Dusun 12"
 ];
 return (
   <div className="w-full max-w-6xl mx-auto pb-20 md:pb-6 px-3 sm:px-4 md:px-6">
     <div className="flex items-center mb-6">
       <BookOpen className="h-7 w-7 text-primary mr-3" />
       <h1 className="text-2xl font-bold text-gray-800">DATA KEPEGAWAIAN</h1>
     </div>

     {/* Add Class Button */}
     <div className="mb-6">
       <center><button
         onClick={() => setShowAddModal(true)}
         className="flex items-center items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-orange-500 active:bg-orange-600 transition-colors shadow-sm"
       >
         <Plus size={18} />
         Tambah Data Kepegawaian
       </button></center>
      <hr className="border-t border-none mb-4" />
      <hr className="border-t border-none mb-1" />
     </div>

     {/* Classes List */}
     {loading ? (
       <div className="flex justify-center items-center h-64">
         <Loader2 className="h-12 w-12 text-primary animate-spin" />
       </div>
     ) : classes.length > 0 ? (
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
         {classes.map((classItem) => (
           <div key={classItem.id} className="bg-cyan-100 rounded-xl p-3 sm:p-5 text-gray-700">
             <div className="flex justify-between items-start mb-0">
               <div>
                
                 <h3 className="p-1.5 font-semibold text-sm"> {classItem.level} </h3>
                {/*<p className="text-sm text-gray-500">{classItem.name}</p>*/}
               </div>
               {userRole === 'admin' && (
                 <div className="flex space-x-1">
                  {/*<button
                     onClick={() => openEditModal(classItem)}
                     className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                     title="Edit Kelas"
                   >
                     <Edit size={16} />
                   </button>*/}
                   <button
                     onClick={() => openDeleteModal(classItem)}
                     className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                     title="Hapus Kepegawaian"
                   >
                     <Trash2 size={16} />
                   </button>
                 </div>
               )}
             </div>

            {/* <div className="flex items-center mt-3">
               <User size={16} className="text-gray-400 mr-2" />
               <p className="text-sm text-gray-600">
                 {classItem.teacherName || "Belum ada data pimpinan"}
               </p>
             </div>*/}
           </div>
         ))}
       </div>
     ) : (
       <div className="bg-white rounded-xl shadow-sm p-10 text-center">
         <div className="flex flex-col items-center">
           <div className="bg-gray-100 rounded-full p-3 mb-4">
             <BookOpen className="h-8 w-8 text-gray-400" />
           </div>
           <p className="text-gray-500 mb-4">Belum ada kepegawaian yang ditambahkan</p>
           <button
             onClick={() => setShowAddModal(true)}
             className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
           >
             Tambah Data
           </button>
         </div>
       </div>
     )}

     {/* Add Class Modal */}
     {showAddModal && (
       <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
         <motion.div
           className="bg-white rounded-xl shadow-lg max-w-md w-full p-6"
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.9 }}
           transition={{ duration: 0.2 }}
         >
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-xl font-bold text-gray-800">Tambah Kepegawaian Baru</h3>
             <button
               onClick={() => setShowAddModal(false)}
               className="text-gray-500 hover:text-gray-700"
             >
               <X size={20} />
             </button>
           </div>

           <form onSubmit={handleAddClass}>
             <div className="space-y-4">
               <div>
                 <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                   Nama Kepegawaian
                 </label>
                 <input
                   type="text"
                   id="name"
                   value={formData.name}
                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                   placeholder="Contoh: Kepala Desa"
                   required
                 />
               </div>

               <div>
                 <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                   Tingkat/Jabatan
                 </label>
                 <select
                   id="level"
                   value={formData.level}
                   onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                   required
                 >
                   {positionOptions.map((option) => (
                     <option key={option} value={option}>
                       {option}
                     </option>
                   ))}
                 </select>
               </div>

               <div>
                 <label htmlFor="teacherName" className="block text-sm font-medium text-gray-700 mb-1">
                   Nama Pimpinan
                 </label>
                 <input
                   type="text"
                   id="teacherName"
                   value={formData.teacherName}
                   onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                   placeholder="Nama lengkap pimpinan"
                 />
               </div>
             </div>

             <div className="flex justify-end mt-6 gap-3">
               <button
                 type="button"
                 onClick={() => setShowAddModal(false)}
                 className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
               >
                 Batal
               </button>
               <button
                 type="submit"
                 className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-orange-500 active:bg-orange-600 transition-colors"
               >
                 <Save size={18} />
                 Simpan Data
               </button>
             </div>
           </form>
         </motion.div>
       </div>
     )}

     {/* Edit Class Modal */}
     {showEditModal && selectedClass && (
       <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
         <motion.div
           className="bg-white rounded-xl shadow-lg max-w-md w-full p-6"
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.9 }}
           transition={{ duration: 0.2 }}
         >
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-xl font-bold text-gray-800">Edit Kepegawaian</h3>
             <button
               onClick={() => setShowEditModal(false)}
               className="text-gray-500 hover:text-gray-700"
             >
               <X size={20} />
             </button>
           </div>

           <form onSubmit={handleEditClass}>
             <div className="space-y-4">
               <div>
                 <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                   Nama Kepegawaian
                 </label>
                 <input
                   type="text"
                   id="edit-name"
                   value={formData.name}
                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                   placeholder="Contoh: VII A"
                   required
                 />
               </div>

               <div>
                 <label htmlFor="edit-level" className="block text-sm font-medium text-gray-700 mb-1">
                   Tingkat/Jabatan
                 </label>
                 <select
                   id="edit-level"
                   value={formData.level}
                   onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                   required
                 >
                   {positionOptions.map((option) => (
                     <option key={option} value={option}>
                       {option}
                     </option>
                   ))}
                 </select>
               </div>

               <div>
                 <label htmlFor="edit-teacherName" className="block text-sm font-medium text-gray-700 mb-1">
                   Nama Pimpinan
                 </label>
                 <input
                   type="text"
                   id="edit-teacherName"
                   value={formData.teacherName}
                   onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                   placeholder="Nama lengkap pimpinan"
                 />
               </div>
             </div>

             <div className="flex justify-end mt-6 gap-3">
               <button
                 type="button"
                 onClick={() => setShowEditModal(false)}
                 className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
               >
                 Batal
               </button>
               <button
                 type="submit"
                 className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-orange-500 active:bg-orange-600 transition-colors"
               >
                 <Save size={18} />
                 Perbarui Data
               </button>
             </div>
           </form>
         </motion.div>
       </div>
     )}

     {/* Delete Confirmation Modal */}
     {showDeleteModal && selectedClass && (
       <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
         <motion.div
           className="bg-white rounded-xl shadow-lg max-w-md w-full p-6"
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.9 }}
           transition={{ duration: 0.2 }}
         >
           <div className="flex items-center mb-4">
             <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
             <h3 className="text-lg font-semibold">Konfirmasi Hapus</h3>
           </div>
           <p className="text-gray-600 mb-6">
             Apakah Anda yakin ingin menghapus data <span className="font-semibold">{selectedClass.name}</span>? Tindakan ini tidak dapat dibatalkan.
           </p>
           <div className="flex justify-end gap-3">
             <button
               onClick={() => setShowDeleteModal(false)}
               className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
             >
               Batal
             </button>
             <button
               onClick={handleDeleteClass}
               className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
             >
               Hapus
             </button>
           </div>
         </motion.div>
       </div>
     )}
    <hr className="border-t border-none mb-4" />
      <hr className="border-t border-none mb-1" />
   </div>
   
 );
}
