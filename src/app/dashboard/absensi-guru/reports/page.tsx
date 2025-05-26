"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { ArrowLeft, Download, Calendar, FileText, FileSpreadsheet, Loader2, Filter, Search, ChevronDown } from "lucide-react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { format, subMonths, isValid, parse } from "date-fns";
import { id } from "date-fns/locale";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
// Type definitions
interface TeacherAttendanceSummary {
 id: string;
 name: string;
 nik: string;
 role: string;
 present: number;
 late: number;
 permitted: number; // IZIN count
 absent: number;
 total: number;
}
interface AttendanceRecord {
 id: string;
 teacherId: string;
 teacherName: string;
 teacherNik: string;
 date: string;
 time: string;
 type: 'in' | 'out';
 status: string;
 schoolId: string;
}
export default function TeacherAttendanceReports() {
 const { schoolId, userRole } = useAuth();
 const router = useRouter();
 const [loading, setLoading] = useState(true);
 const [generating, setGenerating] = useState(false);
 const [teachers, setTeachers] = useState<TeacherAttendanceSummary[]>([]);
 const [searchQuery, setSearchQuery] = useState("");
 const [filteredTeachers, setFilteredTeachers] = useState<TeacherAttendanceSummary[]>([]);
 const [showFilters, setShowFilters] = useState(false);
 const [dateRange, setDateRange] = useState({
   startDate: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
   endDate: format(new Date(), "yyyy-MM-dd")
 });
 const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
 const [selectedRole, setSelectedRole] = useState("all");
 // Check authorization
 useEffect(() => {
   if (userRole !== 'admin') {
     toast.error("Anda tidak memiliki akses ke halaman ini");
     router.push('/dashboard');
   }
 }, [userRole, router]);
 // Fetch teachers data and attendance records
 useEffect(() => {
   const fetchData = async () => {
     if (!schoolId) return;
     try {
       setLoading(true);
       // Fetch teachers and staff
       const teachersRef = collection(db, "users");
       const teachersQuery = query(teachersRef,
         where("schoolId", "==", schoolId),
         where("role", "in", ["teacher", "staff"]));
       const teachersSnapshot = await getDocs(teachersQuery);

       const teachersList: { id: string; name: string; nik: string; role: string; }[] = [];
       teachersSnapshot.forEach(doc => {
         const data = doc.data();
         teachersList.push({
           id: doc.id,
           name: data.name || "",
           nik: data.nik || "",
           role: data.role || "teacher"
         });
       });
       // Fetch attendance records within date range
       const attendanceRef = collection(db, "teacherAttendance");
       const attendanceQuery = query(
         attendanceRef,
         where("schoolId", "==", schoolId),
         where("date", ">=", dateRange.startDate),
         where("date", "<=", dateRange.endDate),
         orderBy("date", "desc")
       );
       const attendanceSnapshot = await getDocs(attendanceQuery);

       const records: AttendanceRecord[] = [];
       attendanceSnapshot.forEach(doc => {
         const data = doc.data() as Omit<AttendanceRecord, 'id'>;
         records.push({
           id: doc.id,
           ...data
         } as AttendanceRecord);
       });
       setAttendanceRecords(records);
       // Calculate attendance statistics for each teacher
       const teacherAttendanceSummary = teachersList.map(teacher => {
         const teacherRecords = records.filter(record => record.teacherId === teacher.id);

         // Count by status
         const present = teacherRecords.filter(r => r.status === "present").length;
         const late = teacherRecords.filter(r => r.status === "late").length;
         const permitted = teacherRecords.filter(r =>
           r.status === "permitted" || r.status === "izin").length;
         const absent = teacherRecords.filter(r =>
           r.status === "absent" || r.status === "alpha").length;

         return {
           id: teacher.id,
           name: teacher.name,
           nik: teacher.nik,
           role: teacher.role,
           present,
           late,
           permitted, // IZIN count specifically tracked
           absent,
           total: present + late + permitted + absent
         };
       });
       setTeachers(teacherAttendanceSummary);
       setFilteredTeachers(teacherAttendanceSummary);
     } catch (error) {
       console.error("Error fetching data:", error);
       toast.error("Gagal mengambil data absensi guru");
     } finally {
       setLoading(false);
     }
   };
   fetchData();
 }, [schoolId, dateRange]);
 // Filter teachers based on search and role
 useEffect(() => {
   if (!teachers.length) return;

   let filtered = [...teachers];

   // Apply role filter
   if (selectedRole !== "all") {
     filtered = filtered.filter(teacher => teacher.role === selectedRole);
   }

   // Apply search filter
   if (searchQuery) {
     const query = searchQuery.toLowerCase();
     filtered = filtered.filter(
       teacher => teacher.name.toLowerCase().includes(query) ||
                  teacher.nik.toLowerCase().includes(query)
     );
   }

   setFilteredTeachers(filtered);
 }, [teachers, searchQuery, selectedRole]);
 // Handle date filter changes
 const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   const { name, value } = e.target;
   setDateRange(prev => ({
     ...prev,
     [name]: value
   }));
 };
 // Apply date range filter
 const applyFilters = () => {
   // Re-fetch data with new date range
   // The useEffect hook will handle this when dateRange changes
   setShowFilters(false);
 };
 // Generate Excel report
 const generateExcelReport = async () => {
   setGenerating(true);
   try {
     // Create worksheet with headers
     const worksheet = XLSX.utils.json_to_sheet(
       filteredTeachers.map(teacher => ({
         'Nama': teacher.name,
         'NIK/NIP': teacher.nik,
         'Jabatan': teacher.role === 'teacher' ? 'Guru' : 'Tenaga Kependidikan',
         'Hadir': teacher.present,
         'Terlambat': teacher.late,
         'Izin': teacher.permitted, // IZIN count displayed here
         'Alpha': teacher.absent,
         'Total': teacher.total
       }))
     );
     // Create workbook and add worksheet
     const workbook = XLSX.utils.book_new();
     XLSX.utils.book_append_sheet(workbook, worksheet, "Absensi Guru");
     // Set column widths
     worksheet['!cols'] = [
       { wch: 30 }, // Name
       { wch: 15 }, // NIK
       { wch: 20 }, // Role
       { wch: 8 },  // Present
       { wch: 10 }, // Late
       { wch: 8 },  // Permitted
       { wch: 8 },  // Absent
       { wch: 8 }   // Total
     ];
     // Generate filename with current date
     const fileName = `Laporan_Absensi_Guru_${format(new Date(), "yyyyMMdd_HHmmss")}.xlsx`;
     XLSX.writeFile(workbook, fileName);
     toast.success("Laporan Excel berhasil diunduh");
   } catch (error) {
     console.error("Error generating Excel:", error);
     toast.error("Gagal mengunduh laporan Excel");
   } finally {
     setGenerating(false);
   }
 };
 // Generate PDF report
 const generatePdfReport = async () => {
   setGenerating(true);
   try {
     // Create new PDF document
     const doc = new jsPDF({
       orientation: "landscape",
       unit: "mm",
       format: "a4"
     });
     // Add title
     const dateRangeText = `${format(new Date(dateRange.startDate), "dd/MM/yyyy")} - ${format(new Date(dateRange.endDate), "dd/MM/yyyy")}`;
     doc.setFontSize(16);
     doc.text("LAPORAN ABSENSI GURU & TENAGA KEPENDIDIKAN", 149, 15, { align: "center" });
     doc.setFontSize(12);
     doc.text(`Periode: ${dateRangeText}`, 149, 22, { align: "center" });
     // Format data for PDF table
     const tableData = filteredTeachers.map((teacher, index) => [
       index + 1,
       teacher.name,
       teacher.nik,
       teacher.role === 'teacher' ? 'Guru' : 'Tendik',
       teacher.present.toString(),
       teacher.late.toString(),
       teacher.permitted.toString(), // IZIN count displayed here
       teacher.absent.toString(),
       teacher.total.toString()
     ]);
     // Add table with headers
     (doc as any).autoTable({
       head: [['No', 'Nama', 'NIK/NIP', 'Jabatan', 'Hadir', 'Terlambat', 'Izin', 'Alpha', 'Total']],
       body: tableData,
       startY: 30,
       theme: 'grid',
       headStyles: {
         fillColor: [76, 111, 255],
         textColor: 255,
         fontStyle: 'bold'
       },
       alternateRowStyles: { fillColor: [240, 240, 240] }
     });
     // Generate filename with current date
     const fileName = `Laporan_Absensi_Guru_${format(new Date(), "yyyyMMdd_HHmmss")}.pdf`;
     doc.save(fileName);
     toast.success("Laporan PDF berhasil diunduh");
   } catch (error) {
     console.error("Error generating PDF:", error);
     toast.error("Gagal mengunduh laporan PDF");
   } finally {
     setGenerating(false);
   }
 };
 return (
   <div className="pb-20 md:pb-6">
     <div className="flex items-center mb-6">
       <Link href="/dashboard/absensi-guru" className="p-2 mr-2 hover:bg-gray-100 rounded-full">
         <ArrowLeft size={20} />
       </Link>
       <h1 className="text-2xl font-bold text-gray-800">
         <span className="editable-text">Rekap Kehadiran Guru & Tendik</span>
       </h1>
     </div>

     {/* Filters Section */}
     <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
       <div className="flex justify-between items-center mb-4">
         <h2 className="text-lg font-semibold">
           <span className="editable-text">Rekap Absensi</span>
         </h2>
         <button
           onClick={() => setShowFilters(!showFilters)}
           className="flex items-center gap-2 text-primary hover:text-primary/80"
         >
           <Filter size={18} />
           <span>Filter Data</span>
           <ChevronDown
             size={16}
             className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}
           />
         </button>
       </div>

       {/* Collapsed Filter Panel */}
       {showFilters && (
         <motion.div
           initial={{ height: 0, opacity: 0 }}
           animate={{ height: 'auto', opacity: 1 }}
           exit={{ height: 0, opacity: 0 }}
           transition={{ duration: 0.3 }}
           className="overflow-hidden mb-4"
         >
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
             <div>
               <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                 <span className="editable-text">Tanggal Mulai</span>
               </label>
               <input
                 type="date"
                 id="startDate"
                 name="startDate"
                 value={dateRange.startDate}
                 onChange={handleDateChange}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
               />
             </div>

             <div>
               <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                 <span className="editable-text">Tanggal Akhir</span>
               </label>
               <input
                 type="date"
                 id="endDate"
                 name="endDate"
                 value={dateRange.endDate}
                 onChange={handleDateChange}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
               />
             </div>

             <div>
               <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700 mb-1">
                 <span className="editable-text">Jabatan</span>
               </label>
               <select
                 id="roleFilter"
                 value={selectedRole}
                 onChange={(e) => setSelectedRole(e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
               >
                 <option value="all">Semua Jabatan</option>
                 <option value="teacher">Guru</option>
                 <option value="staff">Tenaga Kependidikan</option>
               </select>
             </div>

             <div className="md:col-span-3 flex justify-end">
               <button
                 onClick={applyFilters}
                 className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
               >
                 <span className="editable-text">Terapkan Filter</span>
               </button>
             </div>
           </div>
         </motion.div>
       )}

       {/* Search Box */}
       <div className="relative">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
         <input
           type="text"
           placeholder="Cari berdasarkan nama atau NIK..."
           className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
         />
       </div>
     </div>

     {/* Export Buttons */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
       <button
         onClick={generateExcelReport}
         disabled={generating || filteredTeachers.length === 0}
         className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors ${
           generating || filteredTeachers.length === 0
             ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
             : 'bg-green-600 text-white hover:bg-green-700'
         }`}
       >
         {generating ? (
           <Loader2 className="h-5 w-5 animate-spin" />
         ) : (
           <FileSpreadsheet className="h-5 w-5" />
         )}
         <span className="font-medium">
           <span className="editable-text">Download Laporan Excel</span>
         </span>
       </button>

       <button
         onClick={generatePdfReport}
         disabled={generating || filteredTeachers.length === 0}
         className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors ${
           generating || filteredTeachers.length === 0
             ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
             : 'bg-red-600 text-white hover:bg-red-700'
         }`}
       >
         {generating ? (
           <Loader2 className="h-5 w-5 animate-spin" />
         ) : (
           <FileText className="h-5 w-5" />
         )}
         <span className="font-medium">
           <span className="editable-text">Download Laporan PDF</span>
         </span>
       </button>
     </div>

     {/* Teacher Attendance Table */}
     {loading ? (
       <div className="flex justify-center items-center h-64">
         <Loader2 className="h-12 w-12 text-primary animate-spin" />
       </div>
     ) : filteredTeachers.length > 0 ? (
       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
           <table className="min-w-full divide-y divide-gray-200">
             <thead className="bg-gray-50">
               <tr>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   <span className="editable-text">No</span>
                 </th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   <span className="editable-text">Nama</span>
                 </th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   <span className="editable-text">NIK/NIP</span>
                 </th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   <span className="editable-text">Jabatan</span>
                 </th>
                 <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                   <span className="editable-text">Hadir</span>
                 </th>
                 <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                   <span className="editable-text">Terlambat</span>
                 </th>
                 <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                   <span className="editable-text">Izin</span>
                 </th>
                 <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                   <span className="editable-text">Alpha</span>
                 </th>
                 <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                   <span className="editable-text">Total</span>
                 </th>
               </tr>
             </thead>
             <tbody className="bg-white divide-y divide-gray-200">
               {filteredTeachers.map((teacher, index) => (
                 <tr key={teacher.id} className="hover:bg-gray-50">
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     {index + 1}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     {teacher.nik || "-"}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                       teacher.role === 'teacher'
                         ? 'bg-blue-100 text-blue-800'
                         : 'bg-purple-100 text-purple-800'
                     }`}>
                       {teacher.role === 'teacher' ? 'Guru' : 'Tendik'}
                     </span>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center text-green-600">
                     {teacher.present}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center text-orange-600">
                     {teacher.late}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center text-blue-600">
                     {teacher.permitted}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center text-red-600">
                     {teacher.absent}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                     {teacher.total}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       </div>
     ) : (
       <div className="bg-white rounded-xl shadow-sm p-10 text-center">
         <div className="flex flex-col items-center">
           <Calendar className="h-16 w-16 text-gray-400 mb-4" />
           <p className="text-gray-500 text-lg font-medium mb-2">
             <span className="editable-text">Tidak ada data absensi</span>
           </p>
           <p className="text-gray-400">
             {searchQuery
               ? "Tidak ada hasil yang sesuai dengan pencarian Anda"
               : "Belum ada data absensi dalam rentang tanggal yang dipilih"}
           </p>
         </div>
       </div>
     )}
   </div>
 );
}
