"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore";
import { ArrowLeft, Calendar, Download, FileSpreadsheet, FileText, Loader2, User } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { format, subMonths, addMonths } from "date-fns";
import { id } from "date-fns/locale";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
interface TeacherAttendanceRecord {
 id: string;
 teacherId: string;
 teacherName: string;
 teacherNip?: string;
 date: string;
 time: string;
 status: string;
 type: 'in' | 'out';
}
export default function TeacherAttendanceReport() {
 const { schoolId, user } = useAuth();
 const [currentDate, setCurrentDate] = useState(new Date());
 const [loading, setLoading] = useState(true);
 const [isDownloading, setIsDownloading] = useState(false);
 const [attendanceRecords, setAttendanceRecords] = useState<TeacherAttendanceRecord[]>([]);
 const [teachers, setTeachers] = useState<any[]>([]);
 const [attendanceSummary, setAttendanceSummary] = useState({
   present: 0,
   late: 0,
   izin: 0,
   alpha: 0,
 });
 const formattedMonth = format(currentDate, "MMMM yyyy", { locale: id });
 // Navigate between months
 const handlePrevMonth = () => {
   setCurrentDate(subMonths(currentDate, 1));
 };
 const handleNextMonth = () => {
   setCurrentDate(addMonths(currentDate, 1));
 };
 // Fetch attendance data
 useEffect(() => {
   const fetchData = async () => {
     if (!schoolId) return;
     try {
       setLoading(true);
       // Calculate date range for the selected month
       const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
       const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
       // Format dates for Firestore query
       const startDateStr = format(startOfMonth, "yyyy-MM-dd");
       const endDateStr = format(endOfMonth, "yyyy-MM-dd");
       // Query attendance collection for the date range
       const attendanceRef = collection(db, "teacherAttendance");
       const attendanceQuery = query(
         attendanceRef,
         where("schoolId", "==", schoolId),
         where("date", ">=", startDateStr),
         where("date", "<=", endDateStr),
         orderBy("date", "desc"),
         orderBy("time", "desc")
       );
       const snapshot = await getDocs(attendanceQuery);
       // Process attendance records
       const records: TeacherAttendanceRecord[] = [];
       snapshot.forEach(doc => {
         const data = doc.data();
         records.push({
           id: doc.id,
           teacherId: data.teacherId || '',
           teacherName: data.teacherName || '',
           teacherNip: data.teacherNip || '',
           date: data.date || '',
           time: data.time || '',
           status: data.status || '',
           type: data.type || 'in',
         });
       });
       setAttendanceRecords(records);
       // Calculate attendance summary
       let present = 0;
       let late = 0;
       let izin = 0;
       let alpha = 0;
       records.forEach(record => {
         if (record.status === 'present') present++;
         else if (record.status === 'late') late++;
         else if (record.status === 'izin' || record.status === 'permitted') izin++;
         else if (record.status === 'alpha' || record.status === 'absent') alpha++;
       });
       setAttendanceSummary({
         present,
         late,
         izin,
         alpha
       });
       // Extract unique teachers from records
       const uniqueTeachers = Array.from(
         new Map(records.map(record => [record.teacherId, {
           id: record.teacherId,
           name: record.teacherName,
           nip: record.teacherNip,
         }])).values()
       );
       setTeachers(uniqueTeachers);
     } catch (error) {
       console.error("Error fetching attendance data:", error);
       toast.error("Gagal mengambil data kehadiran guru");
     } finally {
       setLoading(false);
     }
   };
   fetchData();
 }, [schoolId, currentDate]);
 // Generate and download PDF report
 const handleDownloadPDF = async () => {
   try {
     setIsDownloading(true);

     // Create a new PDF document
     const doc = new jsPDF({
       orientation: "landscape",
       unit: "mm",
       format: "a4"
     });
     const pageWidth = doc.internal.pageSize.getWidth();
     const pageHeight = doc.internal.pageSize.getHeight();
     const margin = 15;

     // Fetch school information for the header
     const { doc: docRef, getDoc: getDocFromFirestore } = await import("firebase/firestore");
     const schoolDoc = await getDocFromFirestore(docRef(db, "schools", schoolId || ""));
     const schoolData = schoolDoc.exists() ? schoolDoc.data() : {};

     // Add header with school information
     doc.setFontSize(16);
     doc.setFont("helvetica", "bold");
     doc.text(schoolData.name?.toUpperCase() || "SEKOLAH", pageWidth / 2, margin, {
       align: "center"
     });

     doc.setFontSize(11);
     doc.setFont("helvetica", "normal");
     doc.text(schoolData.address || "Alamat Sekolah", pageWidth / 2, margin + 7, {
       align: "center"
     });
     doc.text(`NPSN: ${schoolData.npsn || "-"}`, pageWidth / 2, margin + 14, {
       align: "center"
     });

     // Add horizontal line
     doc.setLineWidth(0.5);
     doc.line(margin, margin + 20, pageWidth - margin, margin + 20);

     // Add report title
     doc.setFontSize(14);
     doc.setFont("helvetica", "bold");
     doc.text("LAPORAN KEHADIRAN GURU DAN TENAGA KEPENDIDIKAN", pageWidth / 2, margin + 30, {
       align: "center"
     });
     doc.text(`BULAN: ${formattedMonth.toUpperCase()}`, pageWidth / 2, margin + 38, {
       align: "center"
     });

     // Add attendance summary
     doc.setFontSize(12);
     doc.setFont("helvetica", "bold");
     doc.text("RINGKASAN KEHADIRAN:", margin, margin + 50);

     const summaryData = [
       ["Status", "Jumlah", "%"],
       ["Hadir", attendanceSummary.present.toString(), ((attendanceSummary.present / (attendanceSummary.present + attendanceSummary.late + attendanceSummary.izin + attendanceSummary.alpha || 1)) * 100).toFixed(1) + "%"],
       ["Terlambat", attendanceSummary.late.toString(), ((attendanceSummary.late / (attendanceSummary.present + attendanceSummary.late + attendanceSummary.izin + attendanceSummary.alpha || 1)) * 100).toFixed(1) + "%"],
       ["Izin", attendanceSummary.izin.toString(), ((attendanceSummary.izin / (attendanceSummary.present + attendanceSummary.late + attendanceSummary.izin + attendanceSummary.alpha || 1)) * 100).toFixed(1) + "%"],
       ["Alpha", attendanceSummary.alpha.toString(), ((attendanceSummary.alpha / (attendanceSummary.present + attendanceSummary.late + attendanceSummary.izin + attendanceSummary.alpha || 1)) * 100).toFixed(1) + "%"],
       ["Total", (attendanceSummary.present + attendanceSummary.late + attendanceSummary.izin + attendanceSummary.alpha).toString(), "100%"]
     ];

     let yPosition = margin + 60;

     // Add summary table
     summaryData.forEach((row, i) => {
       // Header row with gray background
       if (i === 0) {
         doc.setFillColor(240, 240, 240);
         doc.rect(margin, yPosition - 5, 80, 10, "F");
       }

       doc.setFont(i === 0 ? "helvetica-bold" : "helvetica", "normal");
       doc.text(row[0], margin + 10, yPosition);
       doc.text(row[1], margin + 50, yPosition);
       doc.text(row[2], margin + 70, yPosition);

       yPosition += 10;
     });

     yPosition += 10;

     // Add attendance records table
     doc.setFontSize(12);
     doc.setFont("helvetica", "bold");
     doc.text("DETAIL KEHADIRAN GURU DAN TENAGA KEPENDIDIKAN:", margin, yPosition);
     yPosition += 10;

     // Table headers
     const headers = ["No", "Tanggal", "Waktu", "Nama Guru/Staff", "NIP", "Jenis", "Status"];
     const colWidths = [10, 25, 20, 60, 30, 20, 20];

     // Draw table header
     doc.setFillColor(240, 240, 240);
     doc.rect(margin, yPosition, pageWidth - margin * 2, 10, "F");

     let xPosition = margin;
     headers.forEach((header, i) => {
       doc.text(header, xPosition + 5, yPosition + 7);
       xPosition += colWidths[i];
     });

     yPosition += 10;

     // Draw table rows
     doc.setFont("helvetica", "normal");
     doc.setFontSize(10);

     attendanceRecords.forEach((record, index) => {
       // Check if we need a new page
       if (yPosition > pageHeight - 30) {
         doc.addPage();
         yPosition = margin + 20;

         // Re-add table header on new page
         doc.setFontSize(12);
         doc.setFont("helvetica", "bold");
         doc.setFillColor(240, 240, 240);
         doc.rect(margin, yPosition, pageWidth - margin * 2, 10, "F");

         xPosition = margin;
         headers.forEach((header, i) => {
           doc.text(header, xPosition + 5, yPosition + 7);
           xPosition += colWidths[i];
         });

         yPosition += 10;
         doc.setFont("helvetica", "normal");
         doc.setFontSize(10);
       }

       // Format date properly
       const dateParts = record.date.split('-');
       const formattedDate = dateParts.length === 3 ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}` : record.date;

       // Get status text
       const statusText =
         record.status === 'present' ? 'Hadir' :
         record.status === 'late' ? 'Terlambat' :
         record.status === 'izin' || record.status === 'permitted' ? 'Izin' :
         record.status === 'alpha' || record.status === 'absent' ? 'Alpha' : record.status;

       // Get type text
       const typeText = record.type === 'in' ? 'Masuk' : 'Pulang';

       // Draw row
       xPosition = margin;

       // Alternate row background for readability
       if (index % 2 !== 0) {
         doc.setFillColor(248, 248, 248);
         doc.rect(margin, yPosition, pageWidth - margin * 2, 8, "F");
       }

       doc.text((index + 1).toString(), xPosition + 5, yPosition + 5);
       xPosition += colWidths[0];

       doc.text(formattedDate, xPosition + 5, yPosition + 5);
       xPosition += colWidths[1];

       doc.text(record.time, xPosition + 5, yPosition + 5);
       xPosition += colWidths[2];

       // Truncate long names
       const name = record.teacherName;
       const displayName = name.length > 28 ? name.substring(0, 25) + '...' : name;
       doc.text(displayName, xPosition + 5, yPosition + 5);
       xPosition += colWidths[3];

       doc.text(record.teacherNip || "-", xPosition + 5, yPosition + 5);
       xPosition += colWidths[4];

       doc.text(typeText, xPosition + 5, yPosition + 5);
       xPosition += colWidths[5];

       doc.text(statusText, xPosition + 5, yPosition + 5);

       yPosition += 8;
     });

     // Add signature section
     yPosition += 20;
     doc.setFontSize(11);
     doc.text(`${schoolData.address || "Lokasi"}, ${format(new Date(), "d MMMM yyyy", { locale: id })}`, pageWidth - margin - 50, yPosition, {
       align: "center"
     });

     yPosition += 10;
     doc.text("Mengetahui,", margin + 50, yPosition);
     doc.text("Administrator,", pageWidth - margin - 50, yPosition);

     yPosition += 5;
     doc.text("Kepala Sekolah", margin + 50, yPosition);

     yPosition += 30;
     doc.text(schoolData.principalName || "Nama Kepala Sekolah", margin + 50, yPosition);
     doc.text(user?.displayName || "Administrator", pageWidth - margin - 50, yPosition);

     yPosition += 5;
     doc.text(`NIP. ${schoolData.principalNip || "........................"}`, margin + 50, yPosition);
     doc.text("NIP. ........................", pageWidth - margin - 50, yPosition);

     // Save the PDF
     const fileName = `Laporan_Kehadiran_Guru_${format(currentDate, "yyyy-MM")}.pdf`;
     doc.save(fileName);

     toast.success(`Laporan PDF berhasil diunduh sebagai ${fileName}`);
   } catch (error) {
     console.error("Error generating PDF:", error);
     toast.error("Gagal mengunduh laporan PDF");
   } finally {
     setIsDownloading(false);
   }
 };
 // Generate and download Excel report
 const handleDownloadExcel = async () => {
   try {
     setIsDownloading(true);

     // Fetch school information for the header
     const { doc: docRef, getDoc: getDocFromFirestore } = await import("firebase/firestore");
     const schoolDoc = await getDocFromFirestore(docRef(db, "schools", schoolId || ""));
     const schoolData = schoolDoc.exists() ? schoolDoc.data() : {};

     // Prepare Excel data
     const headerData = [
       [schoolData.name?.toUpperCase() || "SEKOLAH"],
       [schoolData.address || "Alamat Sekolah"],
       [`NPSN: ${schoolData.npsn || "-"}`],
       [""],
       ["LAPORAN KEHADIRAN GURU DAN TENAGA KEPENDIDIKAN"],
       [`BULAN: ${formattedMonth.toUpperCase()}`],
       [""],
       ["RINGKASAN KEHADIRAN:"],
       ["Status", "Jumlah", "Persentase"],
       ["Hadir", attendanceSummary.present, ((attendanceSummary.present / (attendanceSummary.present + attendanceSummary.late + attendanceSummary.izin + attendanceSummary.alpha || 1)) * 100).toFixed(1) + "%"],
       ["Terlambat", attendanceSummary.late, ((attendanceSummary.late / (attendanceSummary.present + attendanceSummary.late + attendanceSummary.izin + attendanceSummary.alpha || 1)) * 100).toFixed(1) + "%"],
       ["Izin", attendanceSummary.izin, ((attendanceSummary.izin / (attendanceSummary.present + attendanceSummary.late + attendanceSummary.izin + attendanceSummary.alpha || 1)) * 100).toFixed(1) + "%"],
       ["Alpha", attendanceSummary.alpha, ((attendanceSummary.alpha / (attendanceSummary.present + attendanceSummary.late + attendanceSummary.izin + attendanceSummary.alpha || 1)) * 100).toFixed(1) + "%"],
       ["Total", attendanceSummary.present + attendanceSummary.late + attendanceSummary.izin + attendanceSummary.alpha, "100%"],
       [""],
       ["DETAIL KEHADIRAN GURU DAN TENAGA KEPENDIDIKAN:"],
       ["No", "Tanggal", "Waktu", "Nama Guru/Staff", "NIP", "Jenis", "Status"]
     ];

     // Add attendance records
     const attendanceRows = attendanceRecords.map((record, index) => {
       // Format date properly
       const dateParts = record.date.split('-');
       const formattedDate = dateParts.length === 3 ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}` : record.date;

       // Get status text
       const statusText =
         record.status === 'present' ? 'Hadir' :
         record.status === 'late' ? 'Terlambat' :
         record.status === 'izin' || record.status === 'permitted' ? 'Izin' :
         record.status === 'alpha' || record.status === 'absent' ? 'Alpha' : record.status;

       // Get type text
       const typeText = record.type === 'in' ? 'Masuk' : 'Pulang';

       return [
         index + 1,
         formattedDate,
         record.time,
         record.teacherName,
         record.teacherNip || "-",
         typeText,
         statusText
       ];
     });

     // Add signature section
     const footerData = [
       [""],
       [""],
       [`${schoolData.address || "Lokasi"}, ${format(new Date(), "d MMMM yyyy", { locale: id })}`],
       [""],
       ["Mengetahui,", "", "", "", "", "", "Administrator,"],
       ["Kepala Sekolah", "", "", "", "", "", ""],
       ["", "", "", "", "", "", ""],
       ["", "", "", "", "", "", ""],
       ["", "", "", "", "", "", ""],
       [schoolData.principalName || "Nama Kepala Sekolah", "", "", "", "", "", user?.displayName || "Administrator"],
       [`NIP. ${schoolData.principalNip || "........................"}`, "", "", "", "", "", "NIP. ........................"]
     ];

     // Combine all data
     const excelData = [...headerData, ...attendanceRows, ...footerData];

     // Create workbook
     const wb = XLSX.utils.book_new();
     const ws = XLSX.utils.aoa_to_sheet(excelData);

     // Set column widths
     const colWidths = [
       { wch: 5 },    // No
       { wch: 12 },   // Tanggal
       { wch: 10 },   // Waktu
       { wch: 30 },   // Nama
       { wch: 20 },   // NIP
       { wch: 10 },   // Jenis
       { wch: 10 }    // Status
     ];
     ws['!cols'] = colWidths;

     // Add worksheet to workbook
     XLSX.utils.book_append_sheet(wb, ws, "Kehadiran Guru");

     // Save Excel file
     const fileName = `Laporan_Kehadiran_Guru_${format(currentDate, "yyyy-MM")}.xlsx`;
     XLSX.writeFile(wb, fileName);

     toast.success(`Laporan Excel berhasil diunduh sebagai ${fileName}`);
   } catch (error) {
     console.error("Error generating Excel:", error);
     toast.error("Gagal mengunduh laporan Excel");
   } finally {
     setIsDownloading(false);
   }
 };
 return (
   <div className="w-full max-w-6xl mx-auto pb-20 md:pb-6 px-4">
     {/* Header */}
     <div className="flex items-center mb-6">
       <Link href="/dashboard/absensi-guru" className="p-2 mr-2 hover:bg-gray-100 rounded-full">
         <ArrowLeft size={20} />
       </Link>
       <h1 className="text-2xl font-bold text-gray-800">Laporan Kehadiran Guru & Tendik</h1>
     </div>

     {/* Month selector */}
     <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
         <div className="flex items-center">
           <div className="bg-blue-100 p-2 rounded-lg mr-3">
             <Calendar className="h-6 w-6 text-blue-600" />
           </div>
           <h2 className="text-xl font-semibold">Laporan Bulan: {formattedMonth}</h2>
         </div>

         <div className="flex items-center space-x-3">
           <button
             onClick={handlePrevMonth}
             className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
           >
             Bulan Sebelumnya
           </button>
           <button
             onClick={handleNextMonth}
             className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
           >
             Bulan Berikutnya
           </button>
         </div>
       </div>
     </div>

     {/* Attendance summary */}
     <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
       <h2 className="text-lg font-semibold mb-4">Ringkasan Kehadiran</h2>

       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
           <h3 className="text-sm font-medium text-gray-600 mb-1">Hadir</h3>
           <p className="text-2xl font-bold text-blue-600">{attendanceSummary.present}</p>
           <p className="text-xs text-blue-600 mt-1">
             {((attendanceSummary.present / (attendanceSummary.present + attendanceSummary.late + attendanceSummary.izin + attendanceSummary.alpha || 1)) * 100).toFixed(1)}%
           </p>
         </div>

         <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
           <h3 className="text-sm font-medium text-gray-600 mb-1">Terlambat</h3>
           <p className="text-2xl font-bold text-orange-600">{attendanceSummary.late}</p>
           <p className="text-xs text-orange-600 mt-1">
             {((attendanceSummary.late / (attendanceSummary.present + attendanceSummary.late + attendanceSummary.izin + attendanceSummary.alpha || 1)) * 100).toFixed(1)}%
           </p>
         </div>

         <div className="bg-green-50 p-4 rounded-lg border border-green-100">
           <h3 className="text-sm font-medium text-gray-600 mb-1">Izin</h3>
           <p className="text-2xl font-bold text-green-600">{attendanceSummary.izin}</p>
           <p className="text-xs text-green-600 mt-1">
             {((attendanceSummary.izin / (attendanceSummary.present + attendanceSummary.late + attendanceSummary.izin + attendanceSummary.alpha || 1)) * 100).toFixed(1)}%
           </p>
         </div>

         <div className="bg-red-50 p-4 rounded-lg border border-red-100">
           <h3 className="text-sm font-medium text-gray-600 mb-1">Alpha</h3>
           <p className="text-2xl font-bold text-red-600">{attendanceSummary.alpha}</p>
           <p className="text-xs text-red-600 mt-1">
             {((attendanceSummary.alpha / (attendanceSummary.present + attendanceSummary.late + attendanceSummary.izin + attendanceSummary.alpha || 1)) * 100).toFixed(1)}%
           </p>
         </div>
       </div>
     </div>

     {/* Attendance records table */}
     <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
       <h2 className="text-lg font-semibold mb-4">Detail Kehadiran</h2>

       {loading ? (
         <div className="flex justify-center items-center h-64">
           <Loader2 className="h-10 w-10 text-primary animate-spin" />
         </div>
       ) : attendanceRecords.length > 0 ? (
         <div className="overflow-x-auto">
           <table className="min-w-full divide-y divide-gray-200">
             <thead className="bg-gray-50">
               <tr>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Tanggal
                 </th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Waktu
                 </th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Nama
                 </th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   NIP
                 </th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Jenis
                 </th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Status
                 </th>
               </tr>
             </thead>
             <tbody className="bg-white divide-y divide-gray-200">
               {attendanceRecords.map((record, index) => {
                 // Format date properly
                 const dateParts = record.date.split('-');
                 const formattedDate = dateParts.length === 3 ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}` : record.date;

                 // Get status class
                 const statusClass =
                   record.status === 'present' ? 'bg-blue-100 text-blue-800' :
                   record.status === 'late' ? 'bg-orange-100 text-orange-800' :
                   record.status === 'izin' || record.status === 'permitted' ? 'bg-green-100 text-green-800' :
                   record.status === 'alpha' || record.status === 'absent' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800';

                 // Get status text
                 const statusText =
                   record.status === 'present' ? 'Hadir' :
                   record.status === 'late' ? 'Terlambat' :
                   record.status === 'izin' || record.status === 'permitted' ? 'Izin' :
                   record.status === 'alpha' || record.status === 'absent' ? 'Alpha' : record.status;

                 return (
                   <tr key={record.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {formattedDate}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {record.time}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                       {record.teacherName}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {record.teacherNip || "-"}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {record.type === 'in' ? 'Masuk' : 'Pulang'}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                         {statusText}
                       </span>
                     </td>
                   </tr>
                 );
               })}
             </tbody>
           </table>
         </div>
       ) : (
         <div className="text-center py-8">
           <User className="h-12 w-12 text-gray-300 mx-auto mb-2" />
           <p className="text-gray-500">Tidak ada data kehadiran guru untuk bulan ini</p>
         </div>
       )}
     </div>

     {/* Download buttons */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
       <button
         onClick={handleDownloadPDF}
         disabled={isDownloading || attendanceRecords.length === 0}
         className={`flex items-center justify-center gap-3 p-4 rounded-xl text-white ${
           isDownloading || attendanceRecords.length === 0
             ? "bg-gray-300 cursor-not-allowed"
             : "bg-red-600 hover:bg-red-700"
         } transition-colors`}
       >
         {isDownloading ? (
           <Loader2 className="h-6 w-6 animate-spin" />
         ) : (
           <FileText className="h-6 w-6" />
         )}
         <span className="font-medium">Download Laporan PDF</span>
       </button>

       <button
         onClick={handleDownloadExcel}
         disabled={isDownloading || attendanceRecords.length === 0}
         className={`flex items-center justify-center gap-3 p-4 rounded-xl text-white ${
           isDownloading || attendanceRecords.length === 0
             ? "bg-gray-300 cursor-not-allowed"
             : "bg-green-600 hover:bg-green-700"
         } transition-colors`}
       >
         {isDownloading ? (
           <Loader2 className="h-6 w-6 animate-spin" />
         ) : (
           <FileSpreadsheet className="h-6 w-6" />
         )}
         <span className="font-medium">Download Laporan Excel</span>
       </button>
     </div>
   </div>
 );
}
