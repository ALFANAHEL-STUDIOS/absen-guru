"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Download, FileSpreadsheet, FileText, Loader2, Search, User } from "lucide-react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { generatePDF, generateExcel } from "@/lib/reportGenerator";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { jsPDF } from "jspdf";

// Sample students data - removed demo data
const STUDENTS: any[] = [];

// Generate attendance data function
const generateAttendanceData = (studentId: string) => {
  return [];
};

// Generate monthly summary
const generateMonthlySummary = () => {
  return {
    hadir: 0,
    sakit: 0,
    izin: 0,
    alpha: 0
  };
};
export default function StudentReport() {
  const {
    schoolId,
    userRole,
    userData
  } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStudents, setFilteredStudents] = useState(STUDENTS);
  const [isDownloading, setIsDownloading] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [currentMonth] = useState(format(new Date(), "MMMM yyyy", {
    locale: id
  }));
  const [dateRange, setDateRange] = useState({
    start: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd"),
    end: format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), "yyyy-MM-dd")
  });
  const [schoolInfo, setSchoolInfo] = useState({
    name: "Sekolah Dasar Negeri 1",
    address: "Jl. Pendidikan No. 123, Kota",
    npsn: "12345678",
    principalName: "Drs. Ahmad Sulaiman, M.Pd.",
    principalNip: ""
  });
  const [teacherName, setTeacherName] = useState("Budi Santoso, S.Pd.");
  const [classesList, setClassesList] = useState([]);
  useEffect(() => {
    const fetchSchoolData = async () => {
      if (schoolId) {
        try {
          const schoolDoc = await getDoc(doc(db, "schools", schoolId));
          if (schoolDoc.exists()) {
            const data = schoolDoc.data();
            setSchoolInfo({
              name: data.name || "Sekolah Dasar Negeri 1",
              address: data.address || "Jl. Pendidikan No. 123, Kota",
              npsn: data.npsn || "12345678",
              principalName: data.principalName || "Drs. Ahmad Sulaiman, M.Pd.",
              principalNip: data.principalNip || ""
            });
          }
        } catch (error) {
          console.error("Error fetching school data:", error);
        }
      }
    };
    fetchSchoolData();
  }, [schoolId]);
  useEffect(() => {
    const fetchStudents = async () => {
      if (!schoolId) return;
      try {
        const {
          studentApi
        } = await import('@/lib/api');
        const fetchedStudents = await studentApi.getAll(schoolId);
        if (fetchedStudents && fetchedStudents.length > 0) {
          setFilteredStudents(fetchedStudents.filter((student: any) => student.name && student.name.toLowerCase().includes(searchQuery.toLowerCase()) || student.nisn && student.nisn.includes(searchQuery)));
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    // For student role, automatically select their own data
    if (userRole === 'student' && userData) {
      const studentData = {
        id: userData.id || '1',
        name: userData.name || 'Student Name',
        nisn: userData.nisn || '0012345678',
        kelas: userData.class || 'IX-A',
        gender: userData.gender || 'Laki-laki'
      };
      setSelectedStudent(studentData);
      fetchStudentAttendanceData(studentData.id);
    } else {
      // Fetch students from database
      fetchStudents();
    }
  }, [searchQuery, userRole, userData, schoolId]);
  const fetchStudentAttendanceData = async (studentId: string) => {
    if (!schoolId || !studentId) return;
    try {
      // Use a local loading state instead of trying to use useState inside this function
      let isLoading = true;
      const {
        collection,
        query,
        where,
        getDocs,
        orderBy
      } = await import('firebase/firestore');
      const {
        db
      } = await import('@/lib/firebase');

      // Get current month and year
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const startOfMonth = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endOfMonth = `${year}-${month.toString().padStart(2, '0')}-31`;

      // Create query for this student's attendance records
      const attendanceRef = collection(db, `schools/${schoolId}/attendance`);
      const attendanceQuery = query(attendanceRef, where("studentId", "==", studentId), where("date", ">=", startOfMonth), where("date", "<=", endOfMonth), orderBy("date", "desc"));
      const snapshot = await getDocs(attendanceQuery);
      const records: any[] = [];
      let present = 0;
      let sick = 0;
      let permitted = 0;
      let absent = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        records.push(data);

        // Count by status
        if (data.status === 'present' || data.status === 'hadir') present++;else if (data.status === 'sick' || data.status === 'sakit') sick++;else if (data.status === 'permitted' || data.status === 'izin') permitted++;else if (data.status === 'absent' || data.status === 'alpha') absent++;
      });

      // Create chart data for all months
      const chartData = Array(12).fill(0).map((_, i) => {
        const month = i + 1;
        return {
          name: month.toString(),
          hadir: 0,
          sakit: 0,
          izin: 0,
          alpha: 0
        };
      });

      // Set current month data if we have records
      if (records.length > 0) {
        chartData[now.getMonth()].hadir = present;
        chartData[now.getMonth()].sakit = sick;
        chartData[now.getMonth()].izin = permitted;
        chartData[now.getMonth()].alpha = absent;
      }
      setAttendanceData(chartData);

      // Set monthly summary
      setMonthlySummary({
        hadir: present,
        sakit: sick,
        izin: permitted,
        alpha: absent
      });

      // No need to set loading state here as it's handled by the component's useState
    } catch (error) {
      console.error("Error fetching student attendance data:", error);
      toast.error("Gagal mengambil data kehadiran siswa");

      // Fallback to empty data if fetching fails
      setAttendanceData([]);
      setMonthlySummary({
        hadir: 0,
        sakit: 0,
        izin: 0,
        alpha: 0
      });
      // No need to set loading state here as it's handled by the component's useState
    }
  };
  useEffect(() => {
    // Set data when selected student changes
    if (selectedStudent) {
      fetchStudentAttendanceData(selectedStudent.id);

      // Also fetch class info for this student
      if (schoolId && selectedStudent.class) {
        const fetchClassInfo = async () => {
          try {
            const {
              classApi
            } = await import('@/lib/api');
            const classes = (await classApi.getAll(schoolId)) as {
              id: string;
              name: string;
              teacherName: string;
            }[];
            const studentClass = classes.find(cls => cls.name === selectedStudent.class);
            if (studentClass && studentClass.teacherName) {
              setTeacherName(studentClass.teacherName);
            }
          } catch (error) {
            console.error("Error fetching class info:", error);
          }
        };
        fetchClassInfo();
      }
    }
  }, [selectedStudent, schoolId]);
  const handleStudentSelect = (student: any) => {
    setSelectedStudent(student);
    fetchStudentAttendanceData(student.id);
  };
  const [reportOptions, setReportOptions] = useState({
    includeCharts: true,
    includeStatistics: true,
    includeAttendanceHistory: true,
    paperSize: "a4",
    orientation: "portrait",
    showHeader: true,
    showFooter: true,
    showSignature: true,
    dateRange: "month" // month, semester, year
  });
  const handleOptionChange = (key: string, value: any) => {
    setReportOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      // Generate PDF manually instead of using the utility
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;

      // Add school header
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(schoolInfo.name.toUpperCase(), pageWidth / 2, margin, {
        align: "center"
      });
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(schoolInfo.address || "Alamat Sekolah", pageWidth / 2, margin + 7, {
        align: "center"
      });
      doc.text(`NPSN ${schoolInfo.npsn || "12345678"}`, pageWidth / 2, margin + 14, {
        align: "center"
      });

      // Add horizontal line
      doc.setLineWidth(0.5);
      doc.line(margin, margin + 20, pageWidth - margin, margin + 20);

      // Add report title
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("REKAPITULASI LAPORAN ABSENSI PESERTA DIDIK", pageWidth / 2, margin + 30, {
        align: "center"
      });

      // Add month, student name and class
      const currentMonth = format(new Date(), "MMMM yyyy", {
        locale: id
      });
      doc.setFontSize(12);
      doc.text(`BULAN: ${currentMonth.toUpperCase()}`, pageWidth / 2, margin + 38, {
        align: "center"
      });
      doc.text(`NAMA SISWA: ${selectedStudent?.name || ""}`, pageWidth / 2, margin + 46, {
        align: "center"
      });
      doc.text(`KELAS: ${selectedStudent?.kelas || selectedStudent?.class || ""}`, pageWidth / 2, margin + 54, {
        align: "center"
      });

      // Add attendance summary table
      const tableHeaders = ["Status", "Jumlah", "%"];
      const tableData = [["Hadir", monthlySummary?.hadir || 0, `${((monthlySummary?.hadir || 0) / ((monthlySummary?.hadir || 0) + (monthlySummary?.sakit || 0) + (monthlySummary?.izin || 0) + (monthlySummary?.alpha || 0) || 1) * 100).toFixed(1)}%`], ["Sakit", monthlySummary?.sakit || 0, `${((monthlySummary?.sakit || 0) / ((monthlySummary?.hadir || 0) + (monthlySummary?.sakit || 0) + (monthlySummary?.izin || 0) + (monthlySummary?.alpha || 0) || 1) * 100).toFixed(1)}%`], ["Izin", monthlySummary?.izin || 0, `${((monthlySummary?.izin || 0) / ((monthlySummary?.hadir || 0) + (monthlySummary?.sakit || 0) + (monthlySummary?.izin || 0) + (monthlySummary?.alpha || 0) || 1) * 100).toFixed(1)}%`], ["Alpha", monthlySummary?.alpha || 0, `${((monthlySummary?.alpha || 0) / ((monthlySummary?.hadir || 0) + (monthlySummary?.sakit || 0) + (monthlySummary?.izin || 0) + (monthlySummary?.alpha || 0) || 1) * 100).toFixed(1)}%`], ["Total", (monthlySummary?.hadir || 0) + (monthlySummary?.sakit || 0) + (monthlySummary?.izin || 0) + (monthlySummary?.alpha || 0), "100%"]];

      // Draw table
      let tableY = margin + 64;
      const colWidths = [40, 40, 40];
      const rowHeight = 10;
      const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
      const tableX = (pageWidth - tableWidth) / 2;

      // Draw headers
      doc.setFillColor(230, 230, 230);
      doc.rect(tableX, tableY, tableWidth, rowHeight, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      for (let i = 0; i < tableHeaders.length; i++) {
        doc.text(tableHeaders[i], tableX + colWidths[i] / 2 + i * colWidths[i], tableY + 6, {
          align: "center"
        });
      }

      // Draw borders for header
      doc.setDrawColor(0);
      doc.rect(tableX, tableY, tableWidth, rowHeight);
      doc.line(tableX + colWidths[0], tableY, tableX + colWidths[0], tableY + rowHeight);
      doc.line(tableX + colWidths[0] + colWidths[1], tableY, tableX + colWidths[0] + colWidths[1], tableY + rowHeight);

      // Draw data rows
      tableY += rowHeight;
      doc.setFont("helvetica", "normal");
      tableData.forEach((row, idx) => {
        // Fill background for total row
        if (idx === tableData.length - 1) {
          doc.setFillColor(230, 230, 230);
          doc.rect(tableX, tableY, tableWidth, rowHeight, 'F');
          doc.setFont("helvetica", "bold");
        }
        for (let i = 0; i < row.length; i++) {
          doc.text(row[i].toString(), tableX + colWidths[i] / 2 + i * colWidths[i], tableY + 6, {
            align: "center"
          });
        }

        // Draw borders
        doc.rect(tableX, tableY, tableWidth, rowHeight);
        doc.line(tableX + colWidths[0], tableY, tableX + colWidths[0], tableY + rowHeight);
        doc.line(tableX + colWidths[0] + colWidths[1], tableY, tableX + colWidths[0] + colWidths[1], tableY + rowHeight);
        tableY += rowHeight;
      });

      // Add signature section - moved closer to the table (30 units closer)
      const signatureY = tableY + 30; // Reduced from typical values like 60

      doc.text("Mengetahui", pageWidth / 4, signatureY);
      doc.text("Pengelola Data", pageWidth * 3 / 4, signatureY);
      doc.text("KEPALA SEKOLAH,", pageWidth / 4, signatureY + 5);
      doc.text("Administrator Sekolah,", pageWidth * 3 / 4, signatureY + 5);

      // Add space for signatures
      doc.text(schoolInfo.principalName || "Kepala Sekolah", pageWidth / 4, signatureY + 30);
      doc.text(userData?.name || "Administrator", pageWidth * 3 / 4, signatureY + 30);
      doc.text(`NIP. ${schoolInfo.principalNip || "..............................................."}`, pageWidth / 4, signatureY + 35);
      doc.text("NIP. ...............................................", pageWidth * 3 / 4, signatureY + 35);

      // Save the PDF
      const fileName = `Rekap_Siswa_${selectedStudent?.name || "Unknown"}_${format(new Date(), "yyyyMMdd")}.pdf`;
      doc.save(fileName);
      toast.success(`Laporan siswa ${selectedStudent?.name || ""} berhasil diunduh sebagai ${fileName}`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Gagal mengunduh laporan PDF");
    } finally {
      setIsDownloading(false);
    }
  };
  const handleDownloadExcel = async () => {
    setIsDownloading(true);
    try {
      // Dynamically import xlsx library
      const XLSX = await import('xlsx');

      // Get student data from Firestore
      let studentAttendanceData = {
        hadir: 0,
        sakit: 0,
        izin: 0,
        alpha: 0,
        total: 0
      };
      let dailyAttendanceData = [];
      if (selectedStudent && schoolId) {
        try {
          const {
            collection,
            query,
            where,
            getDocs,
            orderBy
          } = await import('firebase/firestore');
          const {
            db
          } = await import('@/lib/firebase');

          // Get attendance records for the selected student within the date range
          const attendanceRef = collection(db, `schools/${schoolId}/attendance`);
          const attendanceQuery = query(attendanceRef, where("studentId", "==", selectedStudent.id), where("date", ">=", dateRange.start), where("date", "<=", dateRange.end), orderBy("date", "asc"));
          const attendanceSnapshot = await getDocs(attendanceQuery);

          // Process attendance records by date
          const attendanceByDate = new Map();
          attendanceSnapshot.forEach(doc => {
            const data = doc.data();
            const date = data.date;
            if (!attendanceByDate.has(date)) {
              attendanceByDate.set(date, {
                date,
                status: data.status,
                time: data.time || '',
                note: data.note || ''
              });
            }
          });

          // Convert to array and sort by date
          dailyAttendanceData = Array.from(attendanceByDate.values()).sort((a, b) => {
            return a.date.localeCompare(b.date);
          });

          // Count attendance by status
          let hadir = 0,
            sakit = 0,
            izin = 0,
            alpha = 0;
          dailyAttendanceData.forEach(record => {
            if (record.status === 'present' || record.status === 'hadir') hadir++;else if (record.status === 'sick' || record.status === 'sakit') sakit++;else if (record.status === 'permitted' || record.status === 'izin') izin++;else if (record.status === 'absent' || record.status === 'alpha') alpha++;
          });

          // Create student attendance summary
          studentAttendanceData = {
            hadir,
            sakit,
            izin,
            alpha,
            total: hadir + sakit + izin + alpha
          };
        } catch (error) {
          console.error("Error fetching attendance data:", error);
        }
      }

      // Format dates for display
      const startDateFormatted = format(new Date(dateRange.start), "d MMMM yyyy", {
        locale: id
      });
      const endDateFormatted = format(new Date(dateRange.end), "d MMMM yyyy", {
        locale: id
      });
      const currentDate = format(new Date(), "d MMMM yyyy", {
        locale: id
      });

      // Create header data with school information
      const headerData = [[schoolInfo.name.toUpperCase()], [schoolInfo.address], [`NPSN: ${schoolInfo.npsn}`], [""], ["LAPORAN KEHADIRAN SISWA"], [`Periode: ${startDateFormatted} - ${endDateFormatted}`], [""], ["DATA SISWA:"], ["Nama", ":", selectedStudent?.name || "-"], ["NISN", ":", selectedStudent?.nisn || "-"], ["Kelas", ":", selectedStudent?.class || "-"], ["Jenis Kelamin", ":", selectedStudent?.gender === "male" ? "Laki-laki" : "Perempuan"], [""], ["RINGKASAN KEHADIRAN:"], ["Status", "Jumlah", "Persentase"]];

      // Calculate percentages
      const total = studentAttendanceData.total || 1; // Prevent division by zero
      const percentHadir = (studentAttendanceData.hadir / total * 100).toFixed(1);
      const percentSakit = (studentAttendanceData.sakit / total * 100).toFixed(1);
      const percentIzin = (studentAttendanceData.izin / total * 100).toFixed(1);
      const percentAlpha = (studentAttendanceData.alpha / total * 100).toFixed(1);

      // Add attendance summary data
      headerData.push(["Hadir", studentAttendanceData.hadir, `${percentHadir}%`], ["Sakit", studentAttendanceData.sakit, `${percentSakit}%`], ["Izin", studentAttendanceData.izin, `${percentIzin}%`], ["Alpha", studentAttendanceData.alpha, `${percentAlpha}%`], ["Total", studentAttendanceData.total, "100%"], [""]);

      // Add daily attendance records
      headerData.push(["DETAIL KEHADIRAN HARIAN:"], ["No.", "Tanggal", "Status", "Waktu", "Keterangan"]);

      // Add each daily attendance record
      dailyAttendanceData.forEach((record, index) => {
        // Format date from YYYY-MM-DD to DD-MM-YYYY
        const dateParts = record.date.split('-');
        const formattedDate = dateParts.length === 3 ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}` : record.date;

        // Get status text
        const statusText = record.status === 'present' || record.status === 'hadir' ? 'Hadir' : record.status === 'sick' || record.status === 'sakit' ? 'Sakit' : record.status === 'permitted' || record.status === 'izin' ? 'Izin' : record.status === 'absent' || record.status === 'alpha' ? 'Alpha' : record.status;
        headerData.push([index + 1, formattedDate, statusText, record.time || "-", record.note || "-"]);
      });

      // Add signature section
      headerData.push([""], [""], [`${schoolInfo.address}, ${currentDate}`], [""], ["Mengetahui,", "", "", "", "Wali Kelas"], ["Kepala Sekolah", "", "", "", ""], ["", "", "", "", ""], ["", "", "", "", ""], ["", "", "", "", ""], [schoolInfo.principalName || "Kepala Sekolah", "", "", "", teacherName || "Wali Kelas"], [`NIP. ${schoolInfo.principalNip || "..........................."}`, "", "", "", "NIP. ..............................."]);

      // Create workbook and add worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(headerData);

      // Set column widths
      const colWidths = [{
        wch: 15
      },
      // First column
      {
        wch: 25
      },
      // Second column
      {
        wch: 25
      },
      // Third column
      {
        wch: 15
      },
      // Fourth column
      {
        wch: 30
      } // Fifth column
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Laporan Kehadiran Siswa");

      // Generate filename with student name and date
      const studentName = selectedStudent?.name?.replace(/\s+/g, '_') || 'Siswa';
      const fileName = `Laporan_${studentName}_${format(new Date(), "yyyyMMdd")}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success(`Laporan siswa ${selectedStudent?.name} berhasil diunduh sebagai ${fileName}`);
    } catch (error) {
      console.error("Error generating Excel:", error);
      toast.error("Gagal mengunduh laporan Excel");
    } finally {
      setIsDownloading(false);
    }
  };
  return <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6" data-unique-id="54f113c9-f3fa-483b-b54c-d1f761e977a1" data-file-name="app/dashboard/reports/by-student/page.tsx">
      <div className="flex items-center mb-6" data-unique-id="02cced91-7e90-462f-8b7f-1e4bc6fcf084" data-file-name="app/dashboard/reports/by-student/page.tsx">
        <Link href="/dashboard/reports" className="p-2 mr-2 hover:bg-gray-100 rounded-full" data-unique-id="44252618-bc7c-477a-ae9e-825665b38424" data-file-name="app/dashboard/reports/by-student/page.tsx">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800" data-unique-id="abb391af-e117-4912-8ce8-d3f3a252d677" data-file-name="app/dashboard/reports/by-student/page.tsx"><span className="editable-text" data-unique-id="35850fd1-d6da-4890-8ec4-c489efa504cd" data-file-name="app/dashboard/reports/by-student/page.tsx">Rekap Per Siswa</span></h1>
      </div>
      
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-6 mb-20 md:mb-6" data-unique-id="a143481a-6e89-48e0-9e7d-cf33f7aa38f3" data-file-name="app/dashboard/reports/by-student/page.tsx" data-dynamic-text="true">
        {/* Student Search Panel - Only for admin and teacher */}
        {userRole !== 'student' && <div className="bg-white rounded-xl shadow-sm p-6" data-unique-id="0a70b3cf-c472-49c2-bb96-211c19d85e39" data-file-name="app/dashboard/reports/by-student/page.tsx">
            <div className="flex items-center mb-4" data-unique-id="42993925-217a-4bf4-9a17-8c14860e4142" data-file-name="app/dashboard/reports/by-student/page.tsx">
              <div className="bg-indigo-100 p-2 rounded-lg mr-3" data-unique-id="48fd7403-f5f2-4940-b125-ef24584eff4a" data-file-name="app/dashboard/reports/by-student/page.tsx">
                <User className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold" data-unique-id="70c58983-7c1d-4d7b-930b-c831df32a03c" data-file-name="app/dashboard/reports/by-student/page.tsx"><span className="editable-text" data-unique-id="1e44268b-1a3c-420f-9534-51804dc3ee79" data-file-name="app/dashboard/reports/by-student/page.tsx">Cari Siswa</span></h2>
            </div>
            
            <div className="space-y-4 mb-6" data-unique-id="7f8b271b-9f7b-476a-a472-f12a9b1dd547" data-file-name="app/dashboard/reports/by-student/page.tsx" data-dynamic-text="true">
              <div className="relative" data-unique-id="53c3b84d-c561-4cc2-8398-8a08830dd3ee" data-file-name="app/dashboard/reports/by-student/page.tsx">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Nama atau NISN siswa..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" data-unique-id="0b6942ac-307e-4e13-96d1-d78c3aab9449" data-file-name="app/dashboard/reports/by-student/page.tsx" />
              </div>
              
              {/* Filter by class feature removed as requested */}
            </div>
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto" data-unique-id="c9ecf16c-0d13-49fa-924f-135ae93294c2" data-file-name="app/dashboard/reports/by-student/page.tsx" data-dynamic-text="true">
              {filteredStudents.length > 0 ? filteredStudents.map(student => <div key={student.id} className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedStudent?.id === student.id ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`} onClick={() => handleStudentSelect(student)} data-unique-id="ae209364-e34a-4c5f-a760-a2d5214c7e6f" data-file-name="app/dashboard/reports/by-student/page.tsx">
                    <div className="flex items-center gap-1.5" data-unique-id="562921c8-07a6-4166-b935-73a3343d9e8f" data-file-name="app/dashboard/reports/by-student/page.tsx">
                      <div className="font-medium" data-unique-id="797f7052-896b-47ad-9fa4-7c8bfe4ea29d" data-file-name="app/dashboard/reports/by-student/page.tsx" data-dynamic-text="true">{student.name}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${selectedStudent?.id === student.id ? "bg-blue-500/30 text-white" : "bg-gray-100 text-gray-600"}`} data-unique-id="011c19b1-e7c4-4b73-bf47-5e67f4e3f523" data-file-name="app/dashboard/reports/by-student/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="a60b8a2f-32f1-4c3d-b49f-77606c6fd823" data-file-name="app/dashboard/reports/by-student/page.tsx">
                        Kelas </span>{student.class || student.kelas || '-'}
                      </span>
                    </div>
                    <div className="text-sm opacity-80" data-unique-id="29526e63-720d-40dd-a0da-d4f402aada23" data-file-name="app/dashboard/reports/by-student/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="085c9d61-df7b-4833-aa0f-17ac65d02dd8" data-file-name="app/dashboard/reports/by-student/page.tsx">
                      NISN: </span>{student.nisn}
                    </div>
                  </div>) : <div className="text-center py-8 text-gray-500" data-unique-id="b2d13651-237d-4400-a32e-eb23e25fac37" data-file-name="app/dashboard/reports/by-student/page.tsx"><span className="editable-text" data-unique-id="947ea48e-c678-49fd-9d4e-13b4860d4efa" data-file-name="app/dashboard/reports/by-student/page.tsx">
                  Tidak ada siswa yang sesuai dengan pencarian
                </span></div>}
            </div>
          </div>}

        {/* Report Content - Full width for students */}
        <div className={userRole === 'student' ? "lg:col-span-3" : "lg:col-span-2"} data-unique-id="c3afcbc0-c8fa-421b-9d04-d1e6ecdad1db" data-file-name="app/dashboard/reports/by-student/page.tsx" data-dynamic-text="true">
          {selectedStudent ? <div className="space-y-6" data-unique-id="36983537-f08f-4457-893f-f0c288274dcf" data-file-name="app/dashboard/reports/by-student/page.tsx" data-dynamic-text="true">
              {/* Student Info */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white" data-unique-id="08760113-6773-476d-944f-13a3338c7219" data-file-name="app/dashboard/reports/by-student/page.tsx">
                <div className="flex items-center gap-4" data-unique-id="b9e52cc8-e985-426a-9568-a554374dd1a5" data-file-name="app/dashboard/reports/by-student/page.tsx">
                  <div className="bg-white/30 h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-bold" data-unique-id="fa1e9b68-737d-47d6-a816-e02dce56a08b" data-file-name="app/dashboard/reports/by-student/page.tsx" data-dynamic-text="true">
                    {selectedStudent.name.charAt(0).toUpperCase()}
                  </div>
                  <div data-unique-id="defe6c68-b4c2-4329-b9fe-cf0521abdeb5" data-file-name="app/dashboard/reports/by-student/page.tsx">
                    <h3 className="text-xl font-semibold" data-unique-id="73473f47-9cd2-4d1c-b941-3b6daf1c67ab" data-file-name="app/dashboard/reports/by-student/page.tsx" data-dynamic-text="true">{selectedStudent.name}</h3>
                    <div className="opacity-90 space-y-1 mt-1" data-unique-id="9345d97b-bbda-4c61-be7f-37fc468faf28" data-file-name="app/dashboard/reports/by-student/page.tsx">
                      <div data-unique-id="d1bf9b29-78c5-4544-bc70-1d5692be45db" data-file-name="app/dashboard/reports/by-student/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="7d749184-dc41-4254-8e4e-575c1e049bdd" data-file-name="app/dashboard/reports/by-student/page.tsx">NISN: </span>{selectedStudent.nisn}</div>
                      <div data-unique-id="1149edcf-f431-4b81-9322-87fdcd9e3c33" data-file-name="app/dashboard/reports/by-student/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="51a78251-bb5e-4b5a-b2e5-3044c27b37be" data-file-name="app/dashboard/reports/by-student/page.tsx">Kelas: </span>{selectedStudent.class || selectedStudent.kelas}</div>
                      
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Monthly Summary with Filter */}
              <div className="bg-white rounded-xl shadow-sm p-6" data-unique-id="1a60dd1f-e7da-4dc7-8d23-80b9472fdde2" data-file-name="app/dashboard/reports/by-student/page.tsx" data-dynamic-text="true">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4" data-unique-id="6b5ecc78-f19e-40ea-b60f-3e7f1ab531fb" data-file-name="app/dashboard/reports/by-student/page.tsx">
                  <div className="flex items-center mb-3 sm:mb-0" data-unique-id="04c37047-63c0-425d-867d-b99237b18e9b" data-file-name="app/dashboard/reports/by-student/page.tsx">
                    <div className="bg-amber-100 p-2 rounded-lg mr-3" data-unique-id="222b1ce0-e3c7-4a70-bdcf-c457b8f7f046" data-file-name="app/dashboard/reports/by-student/page.tsx">
                      <Calendar className="h-6 w-6 text-amber-600" data-unique-id="64ba58d1-4a6b-4d1f-b01d-a08b8499d75f" data-file-name="app/dashboard/reports/by-student/page.tsx" />
                    </div>
                    <h2 className="text-lg font-semibold" data-unique-id="59e73c6b-763b-4b0c-a803-d94671b822e8" data-file-name="app/dashboard/reports/by-student/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="47d0dc70-e1ab-471e-af9d-bfdff09423c4" data-file-name="app/dashboard/reports/by-student/page.tsx">Rekap Bulanan: </span>{currentMonth}</h2>
                  </div>
                  
                  <div className="w-full sm:w-48" data-unique-id="86312156-e896-4a5b-9c50-3046441714ae" data-file-name="app/dashboard/reports/by-student/page.tsx">
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" onChange={e => {
                  // This would normally fetch data for the selected month
                  toast.success(`Data bulan ${e.target.value} berhasil dimuat`);
                }} data-unique-id="491d8070-eda9-4674-bf12-354a04f6efa1" data-file-name="app/dashboard/reports/by-student/page.tsx">
                      <option value="Januari" data-unique-id="98c600dd-6697-4915-8ded-a352514e8674" data-file-name="app/dashboard/reports/by-student/page.tsx"><span className="editable-text" data-unique-id="c944d551-f48d-4c15-9278-726b9bdbd788" data-file-name="app/dashboard/reports/by-student/page.tsx">Januari 2025</span></option>
                      <option value="Februari" data-unique-id="138335a5-df09-4e14-8bf5-2ca79aad437d" data-file-name="app/dashboard/reports/by-student/page.tsx"><span className="editable-text" data-unique-id="73d8656a-f33e-4364-b8d6-76b3bddb9e4e" data-file-name="app/dashboard/reports/by-student/page.tsx">Februari 2025</span></option>
                      <option value="Maret" data-unique-id="c66fdc0f-fbd7-4913-afcf-f6d1e41ce2f4" data-file-name="app/dashboard/reports/by-student/page.tsx"><span className="editable-text" data-unique-id="7f752cdb-cbb0-4a79-8d9c-c6c295473773" data-file-name="app/dashboard/reports/by-student/page.tsx">Maret 2025</span></option>
                      <option value="April" data-unique-id="e174a81c-41c2-4e34-b4b2-ab2aa81893c2" data-file-name="app/dashboard/reports/by-student/page.tsx"><span className="editable-text" data-unique-id="4d429ab4-b25d-4d6d-b0a7-f7ef4a05391b" data-file-name="app/dashboard/reports/by-student/page.tsx">April 2025</span></option>
                      <option value="Mei" selected data-unique-id="e66b234c-e41c-423e-a724-7da7a1a15dfb" data-file-name="app/dashboard/reports/by-student/page.tsx"><span className="editable-text" data-unique-id="ef798317-748c-4364-93ac-158f080eee0b" data-file-name="app/dashboard/reports/by-student/page.tsx">Mei 2025</span></option>
                      <option value="Juni" data-unique-id="e4088b2a-ae2a-4d9f-80ba-d7d74dbbf461" data-file-name="app/dashboard/reports/by-student/page.tsx"><span className="editable-text" data-unique-id="e8f8ca87-e9d0-4400-b238-3b91e12a79d7" data-file-name="app/dashboard/reports/by-student/page.tsx">Juni 2025</span></option>
                      <option value="Juli" data-unique-id="b7d3a0da-ef55-4819-8652-2014e0c2c5f1" data-file-name="app/dashboard/reports/by-student/page.tsx"><span className="editable-text" data-unique-id="ba119833-176a-4410-b781-5d45ab9408de" data-file-name="app/dashboard/reports/by-student/page.tsx">Juli 2025</span></option>
                      <option value="Agustus" data-unique-id="f6e477e4-c73a-4bf5-8edd-6a5990d5d0e6" data-file-name="app/dashboard/reports/by-student/page.tsx"><span className="editable-text" data-unique-id="6f0926e2-32b0-4b9a-878b-8031246e19fc" data-file-name="app/dashboard/reports/by-student/page.tsx">Agustus 2025</span></option>
                      <option value="September" data-unique-id="84604ff6-4698-454c-89da-77f0463e5472" data-file-name="app/dashboard/reports/by-student/page.tsx"><span className="editable-text" data-unique-id="cfcbf140-1c86-4b2f-8e05-761d07a4f580" data-file-name="app/dashboard/reports/by-student/page.tsx">September 2025</span></option>
                      <option value="Oktober" data-unique-id="5cc1f43a-0f9c-483f-abd9-84c8768f998c" data-file-name="app/dashboard/reports/by-student/page.tsx"><span className="editable-text" data-unique-id="684dae89-b396-45e8-a0e0-4905cc4f442f" data-file-name="app/dashboard/reports/by-student/page.tsx">Oktober 2025</span></option>
                      <option value="November" data-unique-id="b19f2a3b-f476-412b-9ed9-47c2b31a3d4f" data-file-name="app/dashboard/reports/by-student/page.tsx"><span className="editable-text" data-unique-id="385d8b4b-049c-4a38-8346-7c17df7a2da5" data-file-name="app/dashboard/reports/by-student/page.tsx">November 2025</span></option>
                      <option value="Desember" data-unique-id="2926d94c-0012-468b-afa9-ccb780dd3f13" data-file-name="app/dashboard/reports/by-student/page.tsx"><span className="editable-text" data-unique-id="ebd132e5-d9cc-4971-a7be-c4f97f0bc1a0" data-file-name="app/dashboard/reports/by-student/page.tsx">Desember 2025</span></option>
                    </select>
                  </div>
                </div>
                
                {monthlySummary && <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4" data-unique-id="eefba9b2-755a-4523-81da-ffc92047f801" data-file-name="app/dashboard/reports/by-student/page.tsx">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200" data-unique-id="b6b987fe-1570-4d72-9cef-3540d760427d" data-file-name="app/dashboard/reports/by-student/page.tsx">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1" data-unique-id="b5e0d241-55a0-46d0-b8e2-8ca0e177f427" data-file-name="app/dashboard/reports/by-student/page.tsx"><span className="editable-text" data-unique-id="1b51b779-3ee7-4966-8519-0c4b6dc012ad" data-file-name="app/dashboard/reports/by-student/page.tsx">Hadir</span></h3>
                      <p className="text-2xl font-bold text-blue-600" data-unique-id="3839d2de-7211-4fd4-9552-97fcc7517e05" data-file-name="app/dashboard/reports/by-student/page.tsx" data-dynamic-text="true">{monthlySummary.hadir}<span className="editable-text" data-unique-id="71706c7f-b03a-4173-a2f7-b5a9833155a5" data-file-name="app/dashboard/reports/by-student/page.tsx"> hari</span></p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200" data-unique-id="7703d29a-5ae8-4ae1-959f-11a9e005d0c8" data-file-name="app/dashboard/reports/by-student/page.tsx">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1" data-unique-id="ae207fae-0396-499f-80e0-0e2db4291fb6" data-file-name="app/dashboard/reports/by-student/page.tsx"><span className="editable-text" data-unique-id="289a57be-c130-44dc-819f-0d47cc2b38ba" data-file-name="app/dashboard/reports/by-student/page.tsx">Sakit</span></h3>
                      <p className="text-2xl font-bold text-orange-600" data-unique-id="128caece-339b-4ed8-8544-b04006910e6c" data-file-name="app/dashboard/reports/by-student/page.tsx" data-dynamic-text="true">{monthlySummary.sakit}<span className="editable-text" data-unique-id="0dd25d8d-98fd-4146-ab89-5d4617895027" data-file-name="app/dashboard/reports/by-student/page.tsx"> hari</span></p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200" data-unique-id="9c533148-d9a0-4f99-9e92-d6420b124f62" data-file-name="app/dashboard/reports/by-student/page.tsx">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1" data-unique-id="237cc527-31c8-4fda-a2b8-c625ad8b12d0" data-file-name="app/dashboard/reports/by-student/page.tsx"><span className="editable-text" data-unique-id="ab95171d-fd6e-490f-b1f4-d1807a4a2156" data-file-name="app/dashboard/reports/by-student/page.tsx">Izin</span></h3>
                      <p className="text-2xl font-bold text-green-600" data-unique-id="e4d9fb26-6c28-437d-bd21-50196e558555" data-file-name="app/dashboard/reports/by-student/page.tsx" data-dynamic-text="true">{monthlySummary.izin}<span className="editable-text" data-unique-id="a69f8f5f-5b69-4c0a-8828-e6c99306233f" data-file-name="app/dashboard/reports/by-student/page.tsx"> hari</span></p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200" data-unique-id="f01e9e91-5963-457c-a92c-530208b94121" data-file-name="app/dashboard/reports/by-student/page.tsx">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1" data-unique-id="42c867c2-e790-48e8-bf53-06017dfa9d4a" data-file-name="app/dashboard/reports/by-student/page.tsx"><span className="editable-text" data-unique-id="aa78a4d3-45b7-47f7-92e9-dfd017a24a73" data-file-name="app/dashboard/reports/by-student/page.tsx">Alpha</span></h3>
                      <p className="text-2xl font-bold text-red-600" data-unique-id="1749c099-0f34-486c-ac42-3dd7e6487777" data-file-name="app/dashboard/reports/by-student/page.tsx" data-dynamic-text="true">{monthlySummary.alpha}<span className="editable-text" data-unique-id="b991a9cf-9ea3-442b-a571-da1ad1e2fa1d" data-file-name="app/dashboard/reports/by-student/page.tsx"> hari</span></p>
                    </div>
                  </div>}
              </div>
              
              {/* Download Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4" data-unique-id="2a79d6ac-a644-4d03-891e-147fecea1af5" data-file-name="app/dashboard/reports/by-student/page.tsx">
                <button onClick={handleDownloadPDF} disabled={isDownloading} className="flex items-center justify-center gap-3 bg-red-600 text-white p-4 rounded-xl hover:bg-red-700 transition-colors" data-unique-id="c1dc888f-05b7-4772-b3ba-a0839ed35e69" data-file-name="app/dashboard/reports/by-student/page.tsx" data-dynamic-text="true">
                  {isDownloading ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileText className="h-6 w-6" />}
                  <span className="font-medium" data-unique-id="aee209bb-e2b7-469e-9ef9-053429b20a3d" data-file-name="app/dashboard/reports/by-student/page.tsx"><span className="editable-text" data-unique-id="fa85b511-7a52-4f02-a4e3-fbc51dd1b9d2" data-file-name="app/dashboard/reports/by-student/page.tsx">Download Laporan PDF</span></span>
                </button>
                
                <button onClick={handleDownloadExcel} disabled={isDownloading} className="flex items-center justify-center gap-3 bg-green-600 text-white p-4 rounded-xl hover:bg-green-700 transition-colors" data-unique-id="a5b7b8b8-3ea8-41b9-b9a9-a7ae80a7c3d4" data-file-name="app/dashboard/reports/by-student/page.tsx" data-dynamic-text="true">
                  {isDownloading ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileSpreadsheet className="h-6 w-6" />}
                  <span className="font-medium" data-unique-id="a916544d-c250-4b41-8b74-6afcc6513da7" data-file-name="app/dashboard/reports/by-student/page.tsx"><span className="editable-text" data-unique-id="6e19573e-879f-40dd-a989-d0672df57f25" data-file-name="app/dashboard/reports/by-student/page.tsx">Download Laporan Excel</span></span>
                </button>
              </div>
            </div> : <div className="bg-white rounded-xl shadow-sm p-10 text-center" data-unique-id="b54e8b8d-67f8-4535-8e26-1dac6ba2d565" data-file-name="app/dashboard/reports/by-student/page.tsx">
              <div className="flex flex-col items-center" data-unique-id="4ca97eeb-a9d5-4f1a-98eb-a7e89d63ee1b" data-file-name="app/dashboard/reports/by-student/page.tsx">
                <div className="bg-gray-100 rounded-full p-4 mb-4" data-unique-id="029427a5-9c29-4c6e-829d-26e4984311b8" data-file-name="app/dashboard/reports/by-student/page.tsx">
                  <User className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2" data-unique-id="d9b6674e-ebda-4fae-9e2b-6eb95b4d4ab6" data-file-name="app/dashboard/reports/by-student/page.tsx"><span className="editable-text" data-unique-id="e593ccd4-6394-418f-b9ac-c1691652445a" data-file-name="app/dashboard/reports/by-student/page.tsx">Pilih Siswa</span></h3>
                <p className="text-gray-500 mb-4" data-unique-id="8036f601-b784-47cf-a62b-d52644612d6c" data-file-name="app/dashboard/reports/by-student/page.tsx"><span className="editable-text" data-unique-id="2cd96c81-e30e-4363-93b4-9a62a3bbcf32" data-file-name="app/dashboard/reports/by-student/page.tsx">
                  Silakan pilih siswa dari daftar untuk melihat laporan kehadiran
                </span></p>
              </div>
            </div>}
        </div>
      </div>
    </div>;
}