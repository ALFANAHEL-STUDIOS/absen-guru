"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
 ArrowLeft,
 Calendar,
 Download,
 FileText,
 Search,
 Filter,
 Loader2,
 ChevronDown,
 FileSpreadsheet,
 ChevronLeft,
 ChevronRight
} from "lucide-react";
import { toast } from "react-hot-toast";
import { format, subMonths, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { motion } from "framer-motion";
// Define interfaces
interface TeacherAttendance {
 id: string;
 name: string;
 role: string;
 totalPresent: number;
 totalLate: number;
 totalPermitted: number; // izin
 totalAbsent: number; // alpha
 attendanceRate: number;
}
interface AttendanceRecord {
 id: string;
 teacherId: string;
 teacherName: string;
 date: string;
 time: string;
 status: string;
 type: string;
}
export default function TeacherAttendanceReports() {
 const { schoolId, userRole } = useAuth();
 const router = useRouter();
 const [loading, setLoading] = useState(true);
 const [teachers, setTeachers] = useState<TeacherAttendance[]>([]);
 const [searchQuery, setSearchQuery] = useState("");
 const [filteredTeachers, setFilteredTeachers] = useState<TeacherAttendance[]>([]);
 const [statusFilter, setStatusFilter] = useState("all");
 const [dateRange, setDateRange] = useState({
   start: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
   end: format(new Date(), "yyyy-MM-dd"),
 });
 const [currentPage, setCurrentPage] = useState(1);
 const [itemsPerPage] = useState(10);
 const [exportLoading, setExportLoading] = useState(false);
 const [showFilters, setShowFilters] = useState(false);
 // Check authorization
 useEffect(() => {
   if (userRole !== 'admin') {
     toast.error("Anda tidak memiliki akses ke halaman ini");
     router.push('/dashboard');
     return;
   }
   fetchTeacherAttendanceData();
 }, [userRole, router, schoolId]);
 // Fetch teachers and attendance data
 const fetchTeacherAttendanceData = async () => {
   if (!schoolId) return;
   try {
     setLoading(true);

     // Fetch teachers
     const { collection, query, where, getDocs } = await import("firebase/firestore");
     const { db } = await import("@/lib/firebase");

     const teachersRef = collection(db, "users");
     const teachersQuery = query(teachersRef, where("schoolId", "==", schoolId), where("role", "in", ["teacher", "staff"]));
     const teachersSnapshot = await getDocs(teachersQuery);

     const teachersList: { id: string; name: string; role: string }[] = [];
     teachersSnapshot.forEach(doc => {
       const data = doc.data();
       teachersList.push({
         id: doc.id,
         name: data.name || "Unknown",
         role: data.role || "teacher"
       });
     });

     // Fetch attendance records for date range
     const attendanceRef = collection(db, "teacherAttendance");
     const attendanceQuery = query(
       attendanceRef,
       where("schoolId", "==", schoolId),
       where("date", ">=", dateRange.start),
       where("date", "<=", dateRange.end)
     );
     const attendanceSnapshot = await getDocs(attendanceQuery);

     const attendanceRecords: AttendanceRecord[] = [];
     attendanceSnapshot.forEach(doc => {
       const data = doc.data();
       attendanceRecords.push({
         id: doc.id,
         teacherId: data.teacherId || "",
         teacherName: data.teacherName || "",
         date: data.date || "",
         time: data.time || "",
         status: data.status || "",
         type: data.type || "in"
       });
     });

     // Calculate statistics for each teacher
     const teacherStats: TeacherAttendance[] = teachersList.map(teacher => {
       const teacherRecords = attendanceRecords.filter(record => record.teacherId === teacher.id);

       // Count status occurrences
       let present = 0;
       let late = 0;
       let permitted = 0;
       let absent = 0;

       teacherRecords.forEach(record => {
         if (record.status === 'present') present++;
         else if (record.status === 'late') late++;
         else if (record.status === 'permitted' || record.status === 'izin') permitted++;
         else if (record.status === 'absent' || record.status === 'alpha') absent++;
       });

       const total = present + late + permitted + absent;
       const attendanceRate = total > 0 ? Math.round((present + late) / total * 100) : 0;

       return {
         id: teacher.id,
         name: teacher.name,
         role: teacher.role,
         totalPresent: present,
         totalLate: late,
         totalPermitted: permitted, // izin count
         totalAbsent: absent, // alpha count
         attendanceRate
       };
     });

     setTeachers(teacherStats);
     setFilteredTeachers(teacherStats);

   } catch (error) {
     console.error("Error fetching teacher attendance data:", error);
     toast.error("Gagal memuat data kehadiran guru");
   } finally {
     setLoading(false);
   }
 };
 // Filter teachers based on search query and status filter
 useEffect(() => {
   if (!teachers.length) return;

   let filtered = [...teachers];

   // Apply search filter
   if (searchQuery) {
     const query = searchQuery.toLowerCase();
     filtered = filtered.filter(teacher =>
       teacher.name.toLowerCase().includes(query)
     );
   }

   // Apply status filter
   if (statusFilter !== "all") {
     if (statusFilter === "high") {
       filtered = filtered.filter(teacher => teacher.attendanceRate >= 90);
     } else if (statusFilter === "medium") {
       filtered = filtered.filter(teacher => teacher.attendanceRate >= 75 && teacher.attendanceRate < 90);
     } else if (statusFilter === "low") {
       filtered = filtered.filter(teacher => teacher.attendanceRate < 75);
     }
   }

   setFilteredTeachers(filtered);
   setCurrentPage(1);
 }, [searchQuery, statusFilter, teachers]);
 // Apply date range filter
 const handleApplyFilters = () => {
   fetchTeacherAttendanceData();
 };
 // Export data to Excel
 const handleExportExcel = async () => {
   setExportLoading(true);
   try {
     // Import XLSX dynamically
     const XLSX = await import('xlsx');

     // Format data for Excel
     const data = filteredTeachers.map(teacher => ({
       'Nama': teacher.name,
       'Jabatan': teacher.role === 'teacher' ? 'Guru' : 'Tenaga Kependidikan',
       'Hadir': teacher.totalPresent,
       'Terlambat': teacher.totalLate,
       'Izin': teacher.totalPermitted,
       'Alpha': teacher.totalAbsent,
       'Tingkat Kehadiran': `${teacher.attendanceRate}%`
     }));

     // Create worksheet
     const ws = XLSX.utils.json_to_sheet(data);
     const wb = XLSX.utils.book_new();
     XLSX.utils.book_append_sheet(wb, ws, 'Laporan Kehadiran');

     // Export file
     const fileName = `Laporan_Kehadiran_Guru_${format(new Date(), 'yyyyMMdd')}.xlsx`;
     XLSX.writeFile(wb, fileName);

     toast.success('Data berhasil diekspor');
   } catch (error) {
     console.error('Export error:', error);
     toast.error('Gagal mengekspor data');
   } finally {
     setExportLoading(false);
   }
 };
 // Export data to PDF
 const handleExportPDF = async () => {
   setExportLoading(true);
   try {
     const { jsPDF } = await import('jspdf');
     const doc = new jsPDF({
       orientation: 'landscape',
     });

     // Set document title
     doc.setFontSize(18);
     doc.text('LAPORAN KEHADIRAN GURU DAN TENAGA KEPENDIDIKAN', 150, 20, { align: 'center' });

     // Add date range
     doc.setFontSize(12);
     const startDateFormatted = format(parseISO(dateRange.start), "d MMMM yyyy", { locale: id });
     const endDateFormatted = format(parseISO(dateRange.end), "d MMMM yyyy", { locale: id });
     doc.text(`Periode: ${startDateFormatted} - ${endDateFormatted}`, 150, 30, { align: 'center' });

     // Create table headers
     const headers = [
       'No', 'Nama', 'Jabatan', 'Hadir', 'Terlambat', 'Izin', 'Alpha', 'Tingkat Kehadiran'
     ];

     // Create table data
     const data = filteredTeachers.map((teacher, index) => [
       (index + 1).toString(),
       teacher.name,
       teacher.role === 'teacher' ? 'Guru' : 'Tenaga Kependidikan',
       teacher.totalPresent.toString(),
       teacher.totalLate.toString(),
       teacher.totalPermitted.toString(),
       teacher.totalAbsent.toString(),
       `${teacher.attendanceRate}%`
     ]);

     // Generate table
     doc.autoTable({
       head: [headers],
       body: data,
       startY: 40,
       theme: 'grid',
       headStyles: { fillColor: [64, 97, 238], textColor: [255, 255, 255] },
       alternateRowStyles: { fillColor: [240, 240, 240] }
     });

     // Save PDF
     const fileName = `Laporan_Kehadiran_Guru_${format(new Date(), 'yyyyMMdd')}.pdf`;
     doc.save(fileName);

     toast.success('PDF berhasil dibuat');
   } catch (error) {
     console.error('PDF export error:', error);
     toast.error('Gagal membuat PDF');
   } finally {
     setExportLoading(false);
   }
 };
 // Pagination
 const indexOfLastItem = currentPage * itemsPerPage;
 const indexOfFirstItem = indexOfLastItem - itemsPerPage;
 const currentItems = filteredTeachers.slice(indexOfFirstItem, indexOfLastItem);
 const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
 // Change page
 const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
 return (
   <div className="pb-20 md:pb-6">
     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
       <div className="flex items-center mb-4 sm:mb-0">
         <Link href="/dashboard/absensi-guru" className="p-2 mr-2 hover:bg-gray-100 rounded-full">
           <ArrowLeft size={20} />
         </Link>
         <h1 className="text-2xl font-bold text-gray-800">
           <span className="editable-text">Laporan Kehadiran Guru & Tendik</span>
         </h1>
       </div>

       <div className="flex flex-wrap gap-2">
         <button
           onClick={() => setShowFilters(!showFilters)}
           className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
         >
           <Filter size={16} />
           <span>{showFilters ? "Sembunyikan Filter" : "Tampilkan Filter"}</span>
           <ChevronDown
             size={16}
             className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
           />
         </button>

         <button
           onClick={handleExportExcel}
           disabled={exportLoading}
           className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
         >
           {exportLoading ? (
             <Loader2 size={16} className="animate-spin" />
           ) : (
             <FileSpreadsheet size={16} />
           )}
           <span>Excel</span>
         </button>

         <button
           onClick={handleExportPDF}
           disabled={exportLoading}
           className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
         >
           {exportLoading ? (
             <Loader2 size={16} className="animate-spin" />
           ) : (
             <FileText size={16} />
           )}
           <span>PDF</span>
         </button>
       </div>
     </div>

     {/* Filters */}
     <motion.div
       initial={false}
       animate={{ height: showFilters ? "auto" : 0, opacity: showFilters ? 1 : 0 }}
       transition={{ duration: 0.3 }}
       className="overflow-hidden mb-6"
     >
       <div className="bg-white rounded-xl shadow-sm p-6 mb-2">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div>
             <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
               Tanggal Mulai
             </label>
             <input
               type="date"
               id="start-date"
               value={dateRange.start}
               onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
             />
           </div>

           <div>
             <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
               Tanggal Akhir
             </label>
             <input
               type="date"
               id="end-date"
               value={dateRange.end}
               onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
             />
           </div>

           <div>
             <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
               Filter Tingkat Kehadiran
             </label>
             <select
               id="status-filter"
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
             >
               <option value="all">Semua</option>
               <option value="high">Tinggi (≥ 90%)</option>
               <option value="medium">Sedang (75% - 89%)</option>
               <option value="low">Rendah (< 75%)</option>
             </select>
           </div>
         </div>

         <div className="flex justify-end mt-4">
           <button
             onClick={handleApplyFilters}
             className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
           >
             <Filter size={16} />
             <span>Terapkan Filter</span>
           </button>
         </div>
       </div>
     </motion.div>
     {/* Search Bar */}
     <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
       <div className="relative">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
         <input
           type="text"
           placeholder="Cari nama guru atau tendik..."
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
         />
       </div>
     </div>
     {/* Data Table */}
     {loading ? (
       <div className="flex justify-center items-center h-64">
         <Loader2 className="h-10 w-10 text-primary animate-spin" />
       </div>
     ) : (
       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full">
             <thead className="bg-gray-50 text-left">
               <tr>
                 <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                 <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                 <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Jabatan</th>
                 <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Hadir</th>
                 <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Terlambat</th>
                 <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Izin</th>
                 <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Alpha</th>
                 <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Tingkat Kehadiran</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-200">
               {currentItems.length > 0 ? (
                 currentItems.map((teacher, index) => (
                   <tr key={teacher.id} className="hover:bg-gray-50">
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {indexOfFirstItem + index + 1}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
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
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900 font-medium">
                       {teacher.totalPresent}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900 font-medium">
                       {teacher.totalLate}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-amber-600 font-medium">
                       {teacher.totalPermitted}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-red-600 font-medium">
                       {teacher.totalAbsent}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-center">
                       <div className="flex items-center justify-center">
                         <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                           <div
                             className={`h-2.5 rounded-full ${
                               teacher.attendanceRate >= 90
                                 ? 'bg-green-600'
                                 : teacher.attendanceRate >= 75
                                 ? 'bg-amber-500'
                                 : 'bg-red-500'
                             }`}
                             style={{ width: `${teacher.attendanceRate}%` }}
                           />
                         </div>
                         <span className="text-sm font-medium text-gray-900">{teacher.attendanceRate}%</span>
                       </div>
                     </td>
                   </tr>
                 ))
               ) : (
                 <tr>
                   <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                     Tidak ada data yang sesuai dengan filter
                   </td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
         {/* Pagination */}
         {filteredTeachers.length > itemsPerPage && (
           <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
             <div className="text-sm text-gray-600">
               Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredTeachers.length)} dari {filteredTeachers.length} data
             </div>
             <div className="flex gap-2">
               <button
                 onClick={() => paginate(Math.max(1, currentPage - 1))}
                 disabled={currentPage === 1}
                 className={`p-1.5 rounded-md ${
                   currentPage === 1
                     ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                     : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                 }`}
               >
                 <ChevronLeft size={16} />
               </button>

               {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                 // Logic to show pages around current page
                 let pageNum;
                 if (totalPages <= 5) {
                   pageNum = i + 1;
                 } else if (currentPage <= 3) {
                   pageNum = i + 1;
                 } else if (currentPage >= totalPages - 2) {
                   pageNum = totalPages - 4 + i;
                 } else {
                   pageNum = currentPage - 2 + i;
                 }

                 return (
                   <button
                     key={pageNum}
                     onClick={() => paginate(pageNum)}
                     className={`w-8 h-8 flex items-center justify-center rounded-md ${
                       currentPage === pageNum
                         ? 'bg-primary text-white'
                         : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                     }`}
                   >
                     {pageNum}
                   </button>
                 );
               })}

               <button
                 onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                 disabled={currentPage === totalPages}
                 className={`p-1.5 rounded-md ${
                   currentPage === totalPages
                     ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                     : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                 }`}
               >
                 <ChevronRight size={16} />
               </button>
             </div>
           </div>
         )}
       </div>
     )}
   </div>
 );
}
