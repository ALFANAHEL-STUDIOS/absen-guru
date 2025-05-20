"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, UserCheck, Mail, Phone, Calendar, MapPin, Buildings, Book, Hash } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
export default function AddStudentPage() {
 const { schoolId } = useAuth();
 const router = useRouter();
 const [loading, setLoading] = useState(false);
 const [classes, setClasses] = useState<any[]>([]);

 const [formData, setFormData] = useState({
   name: "",
   nisn: "",
   gender: "male",
   birthPlace: "",
   birthDate: "",
   address: "",
   parentName: "",
   parentPhone: "",
   email: "",
   class: "",
   telegramNumber: "",
   position: "" // Changed from class to position to better reflect the field purpose
 });

 // Village positions list as provided
 const villagePositions = [
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

 useEffect(() => {
   const fetchClasses = async () => {
     if (!schoolId) return;

     try {
       const { classApi } = await import('@/lib/api');
       const classData = await classApi.getAll(schoolId);
       setClasses(classData || []);
     } catch (error) {
       console.error("Error fetching classes:", error);
       toast.error("Gagal mengambil data Jabatan");
     }
   };

   fetchClasses();
 }, [schoolId]);

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
   const { name, value } = e.target;
   setFormData({ ...formData, [name]: value });
 };

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();

   try {
     setLoading(true);

     if (!schoolId) {
       toast.error("ID Instansi tidak ditemukan");
       return;
     }

     // Validation
     if (!formData.name || !formData.nisn) {
       toast.error("Nama dan NIK harus diisi");
       return;
     }

     // Process data submission
     const { studentApi } = await import('@/lib/api');

     // Create student/staff record
     await studentApi.create(schoolId, {
       name: formData.name,
       nisn: formData.nisn,
       class: formData.position, // Use position field as class
       gender: formData.gender,
       birthPlace: formData.birthPlace,
       birthDate: formData.birthDate,
       address: formData.address,
       parentName: formData.parentName,
       parentPhone: formData.parentPhone,
       email: formData.email,
       telegramNumber: formData.telegramNumber
     });

     toast.success("Data berhasil disimpan");
     router.push("/dashboard/students");
   } catch (error: any) {
     console.error("Error adding student:", error);
     toast.error(error?.message || "Gagal menambahkan data");
   } finally {
     setLoading(false);
   }
 };

 return (
   <div className="w-full max-w-4xl mx-auto pb-20 md:pb-10 px-3 sm:px-4 md:px-6">
     <div className="flex items-center mb-6">
       <Link href="/dashboard/students" className="p-2 mr-2 hover:bg-gray-100 rounded-full">
         <ArrowLeft size={20} />
       </Link>
       <h1 className="text-2xl font-bold text-gray-800">Tambah Data Baru</h1>
     </div>

     <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Full Name */}
         <div>
           <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
             Nama Lengkap
           </label>
           <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <User className="h-5 w-5 text-gray-400" />
             </div>
             <input
               type="text"
               id="name"
               name="name"
               value={formData.name}
               onChange={handleChange}
               className="bg-white focus:bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
               placeholder="Nama lengkap"
               required
             />
           </div>
         </div>

         {/* NIK */}
         <div>
           <label htmlFor="nisn" className="block text-sm font-medium text-gray-700 mb-1">
             NIK
           </label>
           <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Hash className="h-5 w-5 text-gray-400" />
             </div>
             <input
               type="text"
               id="nisn"
               name="nisn"
               value={formData.nisn}
               onChange={handleChange}
               className="bg-white focus:bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
               placeholder="Nomor Induk Kependudukan (NIK)"
               required
             />
           </div>
         </div>

         {/* Position/Role */}
         <div>
           <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
             Tingkat/Jabatan
           </label>
           <select
             id="position"
             name="position"
             value={formData.position}
             onChange={handleChange}
             className="bg-white focus:bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
             required
           >
             <option value="" disabled>Pilih Jabatan</option>
             {villagePositions.map((position, index) => (
               <option key={index} value={position}>
                 {position}
               </option>
             ))}
           </select>
         </div>

         {/* Gender */}
         <div>
           <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
             Jenis Kelamin
           </label>
           <select
             id="gender"
             name="gender"
             value={formData.gender}
             onChange={handleChange}
             className="bg-white focus:bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
             required
           >
             <option value="male">Laki-laki</option>
             <option value="female">Perempuan</option>
           </select>
         </div>

         {/* Birth Place */}
         <div>
           <label htmlFor="birthPlace" className="block text-sm font-medium text-gray-700 mb-1">
             Tempat Lahir
           </label>
           <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <MapPin className="h-5 w-5 text-gray-400" />
             </div>
             <input
               type="text"
               id="birthPlace"
               name="birthPlace"
               value={formData.birthPlace}
               onChange={handleChange}
               className="bg-white focus:bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
               placeholder="Tempat lahir"
             />
           </div>
         </div>

         {/* Birth Date */}
         <div>
           <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
             Tanggal Lahir
           </label>
           <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Calendar className="h-5 w-5 text-gray-400" />
             </div>
             <input
               type="date"
               id="birthDate"
               name="birthDate"
               value={formData.birthDate}
               onChange={handleChange}
               className="bg-white focus:bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
             />
           </div>
         </div>

         {/* Telegram ID */}
         <div>
           <label htmlFor="telegramNumber" className="block text-sm font-medium text-gray-700 mb-1">
             ID Telegram
           </label>
           <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                 <path d="m22 2-7 20-4-9-9-4Z"></path>
                 <path d="M22 2 11 13"></path>
               </svg>
             </div>
             <input
               type="text"
               id="telegramNumber"
               name="telegramNumber"
               value={formData.telegramNumber}
               onChange={handleChange}
               className="bg-white focus:bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
               placeholder="ID Telegram"
             />
           </div>
           <p className="text-xs text-gray-500 mt-1">
             Untuk notifikasi kehadiran.
           </p>
         </div>

         <div className="md:col-span-2 flex justify-end mt-6">
           <button
             type="submit"
             disabled={loading}
             className="px-4 py-2.5 bg-primary text-white font-medium rounded-lg rounded-lg hover:bg-orange-500 active:bg-orange-600 transition-colors"
           >
             {loading ? (
               <div className="flex items-center">
                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Menyimpan...
               </div>
             ) : (
               <div className="flex items-center gap-1">
                 <UserCheck className="h-5 w-5" />
                 Simpan Data Pegawai
               </div>
             )}
           </button>
         </div>
       </div>
     </form>
   </div>
  
 );
 <hr className="border-t border-none mb-5" />
}
