"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FileText, Calendar, Download, FileSpreadsheet, ArrowLeft, Loader2, Filter, Search, User, ChevronDown } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { format, subDays } from "date-fns";
import { id } from "date-fns/locale";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
export default function TeacherAttendanceReports() {
  const {
    user,
    userRole,
    schoolId
  } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd")
  });
  const [filters, setFilters] = useState({
    teacherId: "all",
    type: "all",
    status: "all",
    searchQuery: ""
  });

  // Load data
  useEffect(() => {
    // Check authorization
    if (userRole !== 'admin') {
      toast.error("Anda tidak memiliki akses ke halaman ini");
      router.push('/dashboard');
      return;
    }
    const loadData = async () => {
      if (!schoolId) return;
      try {
        setLoading(true);

        // Load teachers
        const teachersRef = collection(db, "users");
        const teachersQuery = query(teachersRef, where("schoolId", "==", schoolId), where("role", "in", ["teacher", "staff"]));
        const teachersSnapshot = await getDocs(teachersQuery);
        const teachersList: any[] = [];
        teachersSnapshot.forEach(doc => {
          const data = doc.data();
          teachersList.push({
            id: doc.id,
            name: data.name || "",
            role: data.role || "teacher"
          });
        });
        setTeachers(teachersList);

        // Load attendance data
        await fetchAttendanceData();
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [schoolId, userRole, router]);

  // Fetch attendance data based on date range
  const fetchAttendanceData = async () => {
    if (!schoolId) return;
    try {
      setLoading(true);
      const attendanceRef = collection(db, "teacherAttendance");
      const attendanceQuery = query(attendanceRef, where("schoolId", "==", schoolId), where("date", ">=", dateRange.start), where("date", "<=", dateRange.end), orderBy("date", "desc"), orderBy("time", "desc"));
      const snapshot = await getDocs(attendanceQuery);
      const attendanceList: any[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        attendanceList.push({
          id: doc.id,
          ...data,
          // Convert Firestore timestamp to JS Date if needed
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date()
        });
      });
      setAttendanceData(attendanceList);
      setFilteredData(attendanceList);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      toast.error("Gagal mengambil data kehadiran");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...attendanceData];

    // Apply teacher filter
    if (filters.teacherId !== "all") {
      filtered = filtered.filter(item => item.teacherId === filters.teacherId);
    }

    // Apply type filter (in/out)
    if (filters.type !== "all") {
      filtered = filtered.filter(item => item.type === filters.type);
    }

    // Apply status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(item => item.teacherName.toLowerCase().includes(query) || item.date.includes(query) || item.time.includes(query));
    }
    setFilteredData(filtered);
  }, [attendanceData, filters]);

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply date filter
  const applyDateFilter = () => {
    fetchAttendanceData();
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Export to PDF
  const exportToPDF = async () => {
    try {
      setExporting(true);
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;

      // Add title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("LAPORAN ABSENSI GURU & TENAGA KEPENDIDIKAN", pageWidth / 2, margin, {
        align: "center"
      });

      // Add date range
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      const startDate = format(new Date(dateRange.start), "d MMMM yyyy", {
        locale: id
      });
      const endDate = format(new Date(dateRange.end), "d MMMM yyyy", {
        locale: id
      });
      doc.text(`Periode: ${startDate} - ${endDate}`, pageWidth / 2, margin + 8, {
        align: "center"
      });

      // Add current date
      const currentDate = format(new Date(), "d MMMM yyyy", {
        locale: id
      });
      doc.text(`Dicetak pada: ${currentDate}`, pageWidth - margin, margin, {
        align: "right"
      });

      // Add table headers
      const headers = ["No", "Nama", "Tanggal", "Waktu", "Jenis", "Status"];
      const colWidths = [15, 60, 35, 30, 30, 30];
      let yPos = margin + 20;

      // Draw header row with light blue background
      doc.setFillColor(200, 220, 240);
      doc.rect(margin, yPos, pageWidth - margin * 2, 10, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      let xPos = margin;
      headers.forEach((header, i) => {
        doc.text(header, xPos + colWidths[i] / 2, yPos + 6, {
          align: "center"
        });
        xPos += colWidths[i];
      });
      yPos += 10;

      // Draw table rows
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      filteredData.forEach((record, index) => {
        // Add new page if needed
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = margin;

          // Draw header on new page
          doc.setFillColor(200, 220, 240);
          doc.rect(margin, yPos, pageWidth - margin * 2, 10, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          xPos = margin;
          headers.forEach((header, i) => {
            doc.text(header, xPos + colWidths[i] / 2, yPos + 6, {
              align: "center"
            });
            xPos += colWidths[i];
          });
          yPos += 10;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
        }

        // Alternate row colors
        if (index % 2 === 0) {
          doc.setFillColor(240, 240, 240);
          doc.rect(margin, yPos, pageWidth - margin * 2, 8, "F");
        }

        // Draw row content
        xPos = margin;

        // No
        doc.text((index + 1).toString(), xPos + colWidths[0] / 2, yPos + 5, {
          align: "center"
        });
        xPos += colWidths[0];

        // Name
        doc.text(record.teacherName, xPos + 5, yPos + 5, {
          align: "left"
        });
        xPos += colWidths[1];

        // Date
        const formattedDate = format(new Date(record.date), "d MMM yyyy", {
          locale: id
        });
        doc.text(formattedDate, xPos + colWidths[2] / 2, yPos + 5, {
          align: "center"
        });
        xPos += colWidths[2];

        // Time
        doc.text(record.time, xPos + colWidths[3] / 2, yPos + 5, {
          align: "center"
        });
        xPos += colWidths[3];

        // Type
        const typeText = record.type === "in" ? "Masuk" : "Pulang";
        doc.text(typeText, xPos + colWidths[4] / 2, yPos + 5, {
          align: "center"
        });
        xPos += colWidths[4];

        // Status
        const statusText = record.status === "present" ? "Hadir" : record.status === "late" ? "Terlambat" : "Tidak Hadir";
        doc.text(statusText, xPos + colWidths[5] / 2, yPos + 5, {
          align: "center"
        });
        yPos += 8;
      });

      // Save the PDF
      const fileName = `Laporan_Absensi_Guru_${format(new Date(), "yyyyMMdd")}.pdf`;
      doc.save(fileName);
      toast.success("Laporan PDF berhasil diunduh");
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast.error("Gagal mengunduh laporan PDF");
    } finally {
      setExporting(false);
    }
  };

  // Export to Excel
  const exportToExcel = async () => {
    try {
      setExporting(true);

      // Dynamic import XLSX library
      const XLSX = await import('xlsx');

      // Prepare data
      const excelData = [["LAPORAN ABSENSI GURU & TENAGA KEPENDIDIKAN"], [`Periode: ${format(new Date(dateRange.start), "d MMMM yyyy", {
        locale: id
      })} - ${format(new Date(dateRange.end), "d MMMM yyyy", {
        locale: id
      })}`], [], ["No", "Nama", "Tanggal", "Waktu", "Jenis", "Status", "NIK"]];

      // Add data rows
      filteredData.forEach((record, index) => {
        const formattedDate = format(new Date(record.date), "d MMM yyyy", {
          locale: id
        });
        const typeText = record.type === "in" ? "Masuk" : "Pulang";
        const statusText = record.status === "present" ? "Hadir" : record.status === "late" ? "Terlambat" : "Tidak Hadir";
        excelData.push([index + 1, record.teacherName, formattedDate, record.time, typeText, statusText, record.teacherNik || "-"]);
      });

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(excelData);

      // Set column widths
      ws['!cols'] = [{
        wch: 5
      },
      // No
      {
        wch: 30
      },
      // Nama
      {
        wch: 15
      },
      // Tanggal
      {
        wch: 10
      },
      // Waktu
      {
        wch: 10
      },
      // Jenis
      {
        wch: 15
      },
      // Status
      {
        wch: 20
      } // NIK
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Absensi Guru");

      // Save file
      const fileName = `Laporan_Absensi_Guru_${format(new Date(), "yyyyMMdd")}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success("Laporan Excel berhasil diunduh");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Gagal mengunduh laporan Excel");
    } finally {
      setExporting(false);
    }
  };

  // Function to format date for display
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "d MMMM yyyy", {
      locale: id
    });
  };
  return <div className="pb-20 md:pb-6" data-unique-id="e8332203-9ede-4afb-9ac3-075a48481dfd" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">
      <div className="flex items-center justify-between mb-6" data-unique-id="9bf2fda5-fe21-4c29-87dc-74157ff2af3d" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
        <div className="flex items-center" data-unique-id="084d9cea-c28e-4633-afeb-8b06bb823d27" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
          <Link href="/dashboard/absensi-guru" className="p-2 mr-2 hover:bg-gray-100 rounded-full" data-unique-id="c75b469b-4184-4843-9dde-0b7bd3e30dd1" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800" data-unique-id="92616462-029a-4893-817f-7266f79241e1" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="2a34ae01-0ffa-46ed-8931-7d8b2a315152" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">Laporan Absensi Guru</span></h1>
        </div>
        
        <div className="flex flex-wrap gap-2" data-unique-id="90734330-5126-4979-8a77-5852aefef55a" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
          <button onClick={exportToPDF} disabled={exporting || filteredData.length === 0} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors" data-unique-id="94fdee68-88ba-4c7c-80d6-b5a5366b87df" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}<span className="editable-text" data-unique-id="0fcc0ad0-3d2b-4991-b531-f7592b79fed6" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
            PDF
          </span></button>
          <button onClick={exportToExcel} disabled={exporting || filteredData.length === 0} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors" data-unique-id="e6da0cae-e50e-486e-8a7e-effeb03ed81a" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}<span className="editable-text" data-unique-id="798816d2-8f03-4548-9b88-ba9e2eab36af" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
            Excel
          </span></button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6" data-unique-id="0d169225-4deb-4129-933c-fb79c9471eb3" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
        <h2 className="text-base font-semibold mb-4" data-unique-id="6a791224-5b0e-41f6-a10d-0c5d40838256" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="50294809-7b24-4068-87d8-2b906ab6e38c" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">Filter Laporan</span></h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4" data-unique-id="33980de2-1c20-4a29-8f7b-ca8c86e8d87f" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">
          {/* Date range */}
          <div data-unique-id="b26e06ee-8712-4fbc-a890-544925043994" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
            <label htmlFor="start" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="f134e045-a386-4ec6-b739-c26627757518" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="4c42c23d-2ccf-4063-87d3-6223711c1bf6" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
              Tanggal Mulai
            </span></label>
            <input type="date" id="start" name="start" value={dateRange.start} onChange={handleDateChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" data-unique-id="4643ec85-f22c-47f9-94f5-1fe701e3e4fc" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" />
          </div>
          
          <div data-unique-id="8607145f-1336-49fc-9001-56cb30764965" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
            <label htmlFor="end" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="95c96a8d-ad2a-462b-87b7-3c02dc8ba68e" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="2722e10f-3a1c-409b-8f4b-05252d1f35ca" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
              Tanggal Akhir
            </span></label>
            <input type="date" id="end" name="end" value={dateRange.end} onChange={handleDateChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" data-unique-id="9603b5c4-ee99-4bd4-b1b8-f28d61763df5" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" />
          </div>
          
          {/* Teacher filter */}
          <div data-unique-id="344cd527-e257-4b5c-b619-cef020897e9e" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
            <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="db193b66-b019-4244-875a-0285967a1875" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="5128e61e-c642-41e6-b0d7-cfe68b8688dd" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
              Guru / Tendik
            </span></label>
            <div className="relative" data-unique-id="d5fa1ff7-d087-46bf-b9c0-58b55709ccbf" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select id="teacherId" name="teacherId" value={filters.teacherId} onChange={handleFilterChange} className="w-full pl-9 px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary appearance-none bg-white" data-unique-id="0b086831-3f08-4fd3-933d-309946259383" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">
                <option value="all" data-unique-id="567d50a0-ab13-4b28-992e-21601c325325" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="70c10141-7335-4d8c-9143-28a7fbf15239" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">Semua</span></option>
                {teachers.map(teacher => <option key={teacher.id} value={teacher.id} data-unique-id="ab38e18b-5e31-455a-80e4-d58b6346cdf3" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">
                    {teacher.name}
                  </option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>
          
          {/* Type filter */}
          <div data-unique-id="087e6544-c313-468c-a067-484efc23b0bf" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="481bde62-8a97-4d23-8f0c-b428b3c03435" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="7ffa47d7-4811-4407-90fe-ec93f9400fc5" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
              Jenis Absensi
            </span></label>
            <div className="relative" data-unique-id="8108db72-6517-4632-aed5-011653df959a" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select id="type" name="type" value={filters.type} onChange={handleFilterChange} className="w-full pl-9 px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary appearance-none bg-white" data-unique-id="760cb54d-7bfe-482d-95b1-498090605961" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
                <option value="all" data-unique-id="fc402950-2746-443a-aca4-97c340acc7bc" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="5d86c4f7-b0d7-40f9-a144-b1fb6f0ee586" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">Semua</span></option>
                <option value="in" data-unique-id="832fe696-6529-41c9-bf08-351ed43f6ddc" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="e8e51aa0-9118-4bd0-9b27-dc8d34ca840f" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">Masuk</span></option>
                <option value="out" data-unique-id="145812c1-5f32-4843-9902-5401e692d5bd" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="4f01d1ff-ffe9-4235-8eaa-6acd8bb23bd1" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">Pulang</span></option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4" data-unique-id="1d60c1b2-e1fe-42ba-ab22-92eedb845a01" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">
          {/* Status filter */}
          <div data-unique-id="ad789e0c-8326-41f7-a3b3-c1a4d35d1676" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="fe2ed3e1-8b35-4fce-b1c6-ab33843e341f" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="70582961-6d94-4ad2-b774-a790ad8537e5" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
              Status
            </span></label>
            <div className="relative" data-unique-id="0069e0b2-da62-4648-9ed5-64c1a7013cc1" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select id="status" name="status" value={filters.status} onChange={handleFilterChange} className="w-full pl-9 px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary appearance-none bg-white" data-unique-id="51a7c4ca-f7d6-4187-9535-ef4057d06bae" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
                <option value="all" data-unique-id="ace89bb2-1f30-4398-8690-16c69b1d78fc" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="9c01a63a-75f7-4641-90c3-b1b5aed0c718" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">Semua</span></option>
                <option value="present" data-unique-id="2e587446-30da-47d6-96c0-7085a163281d" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="56675830-5913-44df-8b73-5aff092c3faf" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">Hadir</span></option>
                <option value="late" data-unique-id="b27827d6-3a5e-4381-b8fb-a875376c8628" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="8a479c8d-61e2-4510-bfbb-6e59ec08bd14" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">Terlambat</span></option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>
          
          {/* Search */}
          <div className="md:col-span-2" data-unique-id="94750feb-40f4-4ff6-90ee-dbfa0461f5e4" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
            <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="c3c71b9a-7de0-4e3d-927e-4771c2acdec1" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="c200536a-ae74-4519-a4a0-a64e1e4dceb1" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
              Cari
            </span></label>
            <div className="relative" data-unique-id="30371921-d9f0-4bcb-a206-57979f9751db" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" id="searchQuery" name="searchQuery" value={filters.searchQuery} onChange={handleFilterChange} placeholder="Cari nama, tanggal..." className="w-full pl-9 px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" data-unique-id="b8aff5da-ad2e-45df-9d4f-1f735b8afaa7" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" />
            </div>
          </div>
          
          {/* Apply date filter button */}
          <div className="flex items-end" data-unique-id="e2ef0e2a-d430-4549-bd0a-66a6770d9366" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
            <button onClick={applyDateFilter} className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2" data-unique-id="30863d6b-a1b8-41e0-8d27-474fba80aa45" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
              <Calendar size={16} data-unique-id="c0a6a3b7-21fb-4eb9-9b35-f0c34216454d" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" /><span className="editable-text" data-unique-id="98cc50cb-95c0-4313-95e8-c48887058caa" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
              Terapkan Tanggal
            </span></button>
          </div>
        </div>
      </div>
      
      {/* Attendance Data */}
      {loading ? <div className="flex justify-center items-center h-64" data-unique-id="a20bc5bb-0082-4def-8606-7f0c8a3d5262" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </div> : filteredData.length > 0 ? <div className="bg-white rounded-xl shadow-sm overflow-hidden" data-unique-id="dec201df-d2ed-4f43-b8a8-0ec0e825d1e9" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center" data-unique-id="f3be6094-fbcd-446a-93ab-719d1896a926" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
            <h2 className="text-lg font-semibold" data-unique-id="7f64a1da-78ab-44fe-a9eb-c222ee6b33f7" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="e5688716-a105-4002-8c13-55256cb0f26b" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">Data Absensi</span></h2>
            <p className="text-sm text-gray-500" data-unique-id="1e7b0ee9-db0d-4f9a-aee3-517653beb5d9" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="acd7d758-ecbc-4a95-9f26-282267bdde86" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">Total: </span>{filteredData.length}<span className="editable-text" data-unique-id="b64a1335-5f88-4325-83d1-b390200be0d2" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"> data</span></p>
          </div>
          
          <div className="overflow-x-auto" data-unique-id="5e64e8d2-7f7d-4b91-a9f8-a8cf32d8f135" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
            <table className="min-w-full divide-y divide-gray-200" data-unique-id="35e81892-d1cb-49bc-a374-929b44606dd9" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
              <thead className="bg-gray-50" data-unique-id="4d5450fe-81b0-4f31-9922-51a5b33d3e78" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
                <tr data-unique-id="076a678b-950d-43f1-b00a-929ccb8c6f80" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="5680b28e-6a66-45b7-83cb-00ec7a529c54" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="3ce0b703-4e25-4c6a-bfc8-68e895ce54dd" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
                    Nama
                  </span></th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="51c56262-5c42-4e1e-8700-55123ca59a66" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="91e19214-4df8-4dd2-b55a-6f357d2aa084" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
                    NIK
                  </span></th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="29f4503f-a7e0-4168-983a-d7466a8ab95a" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="8df0ac8c-5c09-4a96-9d7e-a3f20bbca26f" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
                    Tanggal
                  </span></th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="7a7623e7-87e8-4e9f-87d8-2ea374f829b3" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="2780059e-4aa3-48dd-964e-dd8eccf25449" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
                    Waktu
                  </span></th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="5e4f67f5-8e69-42cc-8cca-aa11442e7bc6" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="dee6df22-2e6b-4a4a-b79e-4fade451b45e" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
                    Jenis
                  </span></th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="3a46a690-4847-4a15-b68b-3188dc582ca7" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="ee822f9b-760c-4f70-bf57-0e339bd1dc07" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
                    Status
                  </span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200" data-unique-id="aa601891-f716-4799-bfa2-093b75af9b95" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">
                {filteredData.map(record => <tr key={record.id} className="hover:bg-gray-50" data-unique-id="a4be1afa-1a70-4759-804b-51623a164047" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
                    <td className="px-6 py-4 whitespace-nowrap" data-unique-id="dab4346d-dc3d-4ca1-9b01-edf2d85fb243" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
                      <div className="font-medium text-gray-900" data-unique-id="64058d7d-a283-4cdc-8fc1-8e8e46dd20f7" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">{record.teacherName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-unique-id="7a4452e2-c12c-4be2-9905-2d3ba31c5321" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">
                      {record.teacherNik || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-unique-id="d9d6d047-c624-48fa-8e7e-2a413f7f672e" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-unique-id="c1c6589e-95ff-46c5-8823-2f148486776c" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">
                      {record.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" data-unique-id="de4c873e-9164-4f37-84d2-454125c23611" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${record.type === "in" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`} data-unique-id="499ad5ab-56e2-4f70-a8f0-19926e2287c3" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">
                        {record.type === "in" ? "Masuk" : "Pulang"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" data-unique-id="5a99137b-1aa6-45b8-b078-df2c4736114b" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === "present" ? "bg-green-100 text-green-800" : record.status === "late" ? "bg-orange-100 text-orange-800" : "bg-red-100 text-red-800"}`} data-unique-id="f93262f4-41b1-41ba-bacd-fa798d7b11dd" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">
                        {record.status === "present" ? "Hadir" : record.status === "late" ? "Terlambat" : "Tidak Hadir"}
                      </span>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div> : <div className="bg-white rounded-xl shadow-sm p-10 text-center" data-unique-id="e4b2b8a3-3067-4915-9e98-4f03b94d6cf7" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2" data-unique-id="1db2950d-86e0-4902-968f-f445f6dd1831" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="9233e9eb-9eac-4e9e-96d0-c5c6a91e3c60" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">Tidak Ada Data</span></h2>
          <p className="text-gray-500" data-unique-id="9caaa4a7-34da-4ec6-8e1b-baf71909f4c8" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">
            {dateRange.start !== format(subDays(new Date(), 30), "yyyy-MM-dd") || dateRange.end !== format(new Date(), "yyyy-MM-dd") || Object.values(filters).some(value => value !== "all") ? "Tidak ada data yang sesuai dengan filter yang dipilih" : "Belum ada data absensi guru yang tersedia"}
          </p>
        </div>}
    </div>;
}