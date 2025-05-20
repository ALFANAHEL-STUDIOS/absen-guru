"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, where, doc, getDoc } from "firebase/firestore";
import { Search, Calendar, Filter, ChevronDown, Check, X, Loader2, BookOpen, FileText, FileSpreadsheet, Download } from "lucide-react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  date: string;
  time: string;
  status: string;
  note?: string;
  notes?: string;
  catatan?: string;
}
export default function AttendanceHistory() {
  const {
    schoolId,
    user
  } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [classes, setClasses] = useState<string[]>([]);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [classFilterVisible, setClassFilterVisible] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: format(new Date(new Date().setDate(new Date().getDate() - 30)), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd")
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Fetch classes and attendance records
  useEffect(() => {
    const fetchData = async () => {
      if (!schoolId) return;
      try {
        setLoading(true);

        // Fetch classes
        const classesRef = collection(db, `schools/${schoolId}/classes`);
        const classesSnapshot = await getDocs(classesRef);
        const classesData: string[] = [];
        classesSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.name) {
            classesData.push(data.name);
          }
        });
        setClasses(classesData.sort());

        // Fetch user data for administrator signature
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        }

        // Fetch user data for administrator signature
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        }

        // Fetch attendance records
        const attendanceRef = collection(db, `schools/${schoolId}/attendance`);
        const attendanceQuery = query(attendanceRef, where("date", ">=", dateRange.start), where("date", "<=", dateRange.end), orderBy("date", "desc"), orderBy("time", "desc"));
        const snapshot = await getDocs(attendanceQuery);
        const records: AttendanceRecord[] = [];
        snapshot.forEach(doc => {
          const data = doc.data() as Omit<AttendanceRecord, 'id'>;
          records.push({
            id: doc.id,
            ...data,
            // Ensure notes field is available for display
            notes: data.notes || data.note || null
          } as AttendanceRecord);
        });
        setAttendanceRecords(records);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Gagal mengambil data kehadiran");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [schoolId, dateRange]);

  // Filter attendance records
  const filteredRecords = attendanceRecords.filter(record => {
    // Filter by class
    if (selectedClass !== "all" && record.class !== selectedClass) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      return record.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // Get unique classes from attendance records for the filter
  useEffect(() => {
    if (attendanceRecords.length > 0) {
      const uniqueClasses = Array.from(new Set(attendanceRecords.map(record => record.class))).sort();
      if (uniqueClasses.length > 0) {
        setClasses(uniqueClasses);
      }
    }
  }, [attendanceRecords]);

  // Handle date range change
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

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'hadir':
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'sakit':
      case 'sick':
        return 'bg-orange-100 text-orange-800';
      case 'izin':
      case 'permitted':
        return 'bg-blue-100 text-blue-800';
      case 'alpha':
      case 'absent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status display text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'hadir':
      case 'present':
        return 'Hadir';
      case 'sakit':
      case 'sick':
        return 'Sakit';
      case 'izin':
      case 'permitted':
        return 'Izin';
      case 'alpha':
      case 'absent':
        return 'Alpha';
      default:
        return status;
    }
  };

  // Function to download attendance data as PDF
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      // Fetch school information
      const schoolDocRef = doc(db, "schools", schoolId || "");
      const schoolDoc = await getDoc(schoolDocRef);
      const schoolData = schoolDoc.exists() ? schoolDoc.data() : null;
      const schoolInfo = {
        name: schoolData && typeof schoolData === 'object' && 'name' in schoolData ? String(schoolData.name) : "NAMA SEKOLAH",
        address: schoolData && typeof schoolData === 'object' && 'address' in schoolData ? String(schoolData.address) : "Alamat Sekolah",
        npsn: schoolData && typeof schoolData === 'object' && 'npsn' in schoolData ? String(schoolData.npsn) : "NPSN",
        principalName: schoolData && typeof schoolData === 'object' && 'principalName' in schoolData ? String(schoolData.principalName) : "Kepala Sekolah",
        principalNip: schoolData && typeof schoolData === 'object' && 'principalNip' in schoolData ? String(schoolData.principalNip) : "-"
      };

      // Create a new PDF document
      const pdfDoc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      // Set document properties
      const pageWidth = pdfDoc.internal.pageSize.getWidth();
      const pageHeight = pdfDoc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;

      // Add KOP Sekolah
      pdfDoc.setFontSize(16);
      pdfDoc.setFont("helvetica", "bold");
      pdfDoc.text(schoolInfo.name.toUpperCase(), pageWidth / 2, margin + 6, {
        align: "center"
      });
      pdfDoc.setFontSize(11);
      pdfDoc.setFont("helvetica", "normal");
      pdfDoc.text(schoolInfo.address, pageWidth / 2, margin + 12, {
        align: "center"
      });
      pdfDoc.text(`NPSN: ${schoolInfo.npsn}`, pageWidth / 2, margin + 18, {
        align: "center"
      });

      // Add horizontal line
      pdfDoc.setLineWidth(0.5);
      pdfDoc.line(margin, margin + 22, pageWidth - margin, margin + 22);

      // Add title
      pdfDoc.setFontSize(14);
      pdfDoc.setFont("helvetica", "bold");
      pdfDoc.text("LAPORAN RIWAYAT KEHADIRAN SISWA", pageWidth / 2, margin + 32, {
        align: "center"
      });

      // Add filter information
      pdfDoc.setFontSize(10);
      pdfDoc.setFont("helvetica", "normal");

      // Add date range
      const startDate = format(new Date(dateRange.start), "d MMMM yyyy", {
        locale: id
      });
      const endDate = format(new Date(dateRange.end), "d MMMM yyyy", {
        locale: id
      });
      pdfDoc.text(`Periode: ${startDate} - ${endDate}`, pageWidth / 2, margin + 40, {
        align: "center"
      });

      // Add class filter if selected
      if (selectedClass !== "all") {
        pdfDoc.text(`Kelas: ${selectedClass}`, pageWidth / 2, margin + 46, {
          align: "center"
        });
      }

      // Table headers
      const headers = ["Tanggal", "Waktu", "Nama Siswa", "Kelas", "Status", "Catatan"];
      const colWidths = [25, 20, 60, 20, 20, 40];
      let yPos = margin + 55;

      // Draw table header
      pdfDoc.setFillColor(240, 240, 240);
      pdfDoc.rect(margin, yPos - 5, contentWidth, 10, "F");
      let xPos = margin;
      pdfDoc.setFont("helvetica", "bold");
      headers.forEach((header, i) => {
        pdfDoc.text(header, xPos + 3, yPos);
        xPos += colWidths[i];
      });
      yPos += 10;
      pdfDoc.setFont("helvetica", "normal");

      // Draw table rows
      filteredRecords.forEach((record, index) => {
        // Format date from YYYY-MM-DD to DD-MM-YYYY
        const dateParts = record.date.split('-');
        const formattedDate = dateParts.length === 3 ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}` : record.date;

        // Get status text
        const statusText = getStatusText(record.status);

        // Add alternating row background
        if (index % 2 === 0) {
          pdfDoc.setFillColor(250, 250, 250);
          pdfDoc.rect(margin, yPos - 5, contentWidth, 10, "F");
        }

        // Add row data
        xPos = margin;
        pdfDoc.text(formattedDate, xPos + 3, yPos);
        xPos += colWidths[0];
        pdfDoc.text(record.time, xPos + 3, yPos);
        xPos += colWidths[1];

        // Truncate long names
        const displayName = record.studentName.length > 30 ? record.studentName.substring(0, 27) + "..." : record.studentName;
        pdfDoc.text(displayName, xPos + 3, yPos);
        xPos += colWidths[2];
        pdfDoc.text(record.class, xPos + 3, yPos);
        xPos += colWidths[3];
        pdfDoc.text(statusText, xPos + 3, yPos);
        xPos += colWidths[4];

        // Truncate long notes
        const note = record.status === 'sakit' || record.status === 'sick' || record.status === 'izin' || record.status === 'permitted' || record.status === 'alpha' || record.status === 'absent' ? record.note || '-' : '-';
        const displayNote = note.length > 30 ? note.substring(0, 27) + "..." : note;
        pdfDoc.text(displayNote, xPos + 3, yPos);
        yPos += 10;

        // Add a new page if needed
        if (yPos > pageHeight - margin - 60 && index < filteredRecords.length - 1) {
          pdfDoc.addPage();

          // Add KOP Sekolah to new page (simplified)
          pdfDoc.setFontSize(12);
          pdfDoc.setFont("helvetica", "bold");
          pdfDoc.text(schoolInfo.name.toUpperCase(), pageWidth / 2, margin + 6, {
            align: "center"
          });
          pdfDoc.setFontSize(9);
          pdfDoc.setFont("helvetica", "normal");
          pdfDoc.text(schoolInfo.address, pageWidth / 2, margin + 12, {
            align: "center"
          });
          pdfDoc.text(`NPSN: ${schoolInfo.npsn}`, pageWidth / 2, margin + 18, {
            align: "center"
          });

          // Add horizontal line
          pdfDoc.setLineWidth(0.5);
          pdfDoc.line(margin, margin + 22, pageWidth - margin, margin + 22);
          yPos = margin + 30;

          // Add header to new page
          pdfDoc.setFillColor(240, 240, 240);
          pdfDoc.rect(margin, yPos - 5, contentWidth, 10, "F");
          xPos = margin;
          pdfDoc.setFont("helvetica", "bold");
          pdfDoc.setFontSize(10);
          headers.forEach((header, i) => {
            pdfDoc.text(header, xPos + 3, yPos);
            xPos += colWidths[i];
          });
          yPos += 10;
          pdfDoc.setFont("helvetica", "normal");
        }
      });

      // Add signature section
      const signatureY = Math.min(yPos + 30, pageHeight - margin - 40);
      const leftSignatureX = margin + 40;
      const rightSignatureX = pageWidth - margin - 40;
      const currentDate = format(new Date(), "d MMMM yyyy", {
        locale: id
      });
      pdfDoc.setFontSize(10);
      pdfDoc.text(`${schoolInfo.address}, ${currentDate}`, pageWidth - margin - 40, signatureY - 10, {
        align: "right"
      });
      pdfDoc.text("Mengetahui,", leftSignatureX, signatureY, {
        align: "center"
      });
      pdfDoc.text("Kepala Sekolah", leftSignatureX, signatureY + 5, {
        align: "center"
      });
      pdfDoc.text("Administrator", rightSignatureX, signatureY, {
        align: "center"
      });
      pdfDoc.text("Sekolah", rightSignatureX, signatureY + 5, {
        align: "center"
      });

      // Space for signatures
      const nameY = signatureY + 25;
      pdfDoc.setFontSize(10);
      pdfDoc.setFont("helvetica", "bold");
      pdfDoc.text(schoolInfo.principalName, leftSignatureX, nameY, {
        align: "center"
      });
      pdfDoc.setFont("helvetica", "normal");
      pdfDoc.text(`NIP. ${schoolInfo.principalNip}`, leftSignatureX, nameY + 5, {
        align: "center"
      });

      // Admin signature (right side)
      const adminName = userData?.name || "Administrator";
      pdfDoc.setFont("helvetica", "bold");
      pdfDoc.text(adminName, rightSignatureX, nameY, {
        align: "center"
      });
      pdfDoc.setFont("helvetica", "normal");

      // Add footer with generation date
      const generationDate = format(new Date(), "d MMMM yyyy HH:mm", {
        locale: id
      });
      pdfDoc.setFontSize(8);
      pdfDoc.text(`Laporan dibuat pada: ${generationDate}`, pageWidth - margin, pageHeight - margin, {
        align: "right"
      });

      // Save the PDF
      const fileName = `Laporan_Kehadiran_${format(new Date(), "yyyyMMdd_HHmmss")}.pdf`;
      pdfDoc.save(fileName);
      toast.success("Laporan PDF berhasil diunduh");
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
      // Fetch school information
      const schoolDoc = await getDoc(doc(db, "schools", schoolId || ""));
      const schoolData = schoolDoc.exists() ? schoolDoc.data() : null;
      const schoolInfo = {
        name: schoolData && typeof schoolData === 'object' && 'name' in schoolData ? String(schoolData.name) : "NAMA SEKOLAH",
        address: schoolData && typeof schoolData === 'object' && 'address' in schoolData ? String(schoolData.address) : "Alamat Sekolah",
        npsn: schoolData && typeof schoolData === 'object' && 'npsn' in schoolData ? String(schoolData.npsn) : "NPSN",
        principalName: schoolData && typeof schoolData === 'object' && 'principalName' in schoolData ? String(schoolData.principalName) : "Kepala Sekolah",
        principalNip: schoolData && typeof schoolData === 'object' && 'principalNip' in schoolData ? String(schoolData.principalNip) : "-"
      };

      // Prepare data for Excel
      const excelData = filteredRecords.map(record => {
        // Format date from YYYY-MM-DD to DD-MM-YYYY
        const dateParts = record.date.split('-');
        const formattedDate = dateParts.length === 3 ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}` : record.date;

        // Get status text
        const statusText = getStatusText(record.status);

        // Prepare note
        const note = record.notes || record.note || '-';
        return {
          "Tanggal": formattedDate,
          "Waktu": record.time,
          "Nama Siswa": record.studentName,
          "Kelas": record.class,
          "Status": statusText,
          "Catatan": record.notes || record.note || '-'
        };
      });

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Create header worksheet with school information
      const headerData = [[schoolInfo.name.toUpperCase()], [schoolInfo.address], [`NPSN: ${schoolInfo.npsn}`], [""], ["LAPORAN KEHADIRAN SISWA"], [`Periode: ${format(new Date(dateRange.start), "d MMMM yyyy", {
        locale: id
      })} - ${format(new Date(dateRange.end), "d MMMM yyyy", {
        locale: id
      })}`], [selectedClass !== "all" ? `Kelas: ${selectedClass}` : "Semua Kelas"], [""]];

      // Create worksheet with data
      const ws = XLSX.utils.aoa_to_sheet(headerData);

      // Add the table data
      XLSX.utils.sheet_add_json(ws, excelData, {
        origin: "A9",
        skipHeader: false
      });

      // Add signature section
      const lastRow = 11 + excelData.length;

      // Add empty rows for spacing
      ws[`A${lastRow}`] = {
        t: 's',
        v: ""
      };
      ws[`A${lastRow + 1}`] = {
        t: 's',
        v: ""
      };

      // Add signature headers
      ws[`B${lastRow + 2}`] = {
        t: 's',
        v: "Mengetahui,"
      };
      ws[`E${lastRow + 2}`] = {
        t: 's',
        v: "Administrator"
      };
      ws[`B${lastRow + 3}`] = {
        t: 's',
        v: "Kepala Sekolah"
      };
      ws[`E${lastRow + 3}`] = {
        t: 's',
        v: "Sekolah"
      };

      // Add empty rows for signature space
      ws[`A${lastRow + 4}`] = {
        t: 's',
        v: ""
      };
      ws[`A${lastRow + 5}`] = {
        t: 's',
        v: ""
      };
      ws[`A${lastRow + 6}`] = {
        t: 's',
        v: ""
      };

      // Add names
      ws[`B${lastRow + 7}`] = {
        t: 's',
        v: schoolInfo.principalName
      };
      ws[`E${lastRow + 7}`] = {
        t: 's',
        v: userData?.name || "Administrator"
      };
      ws[`B${lastRow + 8}`] = {
        t: 's',
        v: `NIP. ${schoolInfo.principalNip}`
      };

      // Add generation date
      ws[`A${lastRow + 10}`] = {
        t: 's',
        v: `Laporan dibuat pada: ${format(new Date(), "d MMMM yyyy HH:mm", {
          locale: id
        })}`
      };

      // Set column widths
      const colWidths = [{
        wch: 15
      },
      // Tanggal
      {
        wch: 10
      },
      // Waktu
      {
        wch: 40
      },
      // Nama Siswa
      {
        wch: 10
      },
      // Kelas
      {
        wch: 15
      },
      // Status
      {
        wch: 40
      } // Catatan
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Kehadiran");

      // Generate Excel file
      const fileName = `Laporan_Kehadiran_${format(new Date(), "yyyyMMdd_HHmmss")}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success("Laporan Excel berhasil diunduh");
    } catch (error) {
      console.error("Error generating Excel:", error);
      toast.error("Gagal mengunduh laporan Excel");
    } finally {
      setIsDownloading(false);
    }
  };
  return <div className="pb-20 md:pb-6" data-unique-id="e3d2f79c-351a-4ae7-acc6-e213ee7f983f" data-file-name="app/dashboard/attendance-history/page.tsx" data-dynamic-text="true">
      <div className="flex items-center mb-6" data-unique-id="1a95a880-4fe1-4372-a103-57bcacca3f26" data-file-name="app/dashboard/attendance-history/page.tsx">
        <Calendar className="h-7 w-7 text-primary mr-3" data-unique-id="00c30777-4be3-438f-8650-315e475746e8" data-file-name="app/dashboard/attendance-history/page.tsx" />
        <h1 className="text-2xl font-bold text-gray-800" data-unique-id="3f557346-f2c2-4f0d-b04d-0486b5d0f318" data-file-name="app/dashboard/attendance-history/page.tsx"><span className="editable-text" data-unique-id="e7996097-5102-4bce-9764-60700364043d" data-file-name="app/dashboard/attendance-history/page.tsx">Riwayat Kehadiran</span></h1>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6 w-full" data-unique-id="033935fd-f92c-4e99-a254-6ceeab9ebb0d" data-file-name="app/dashboard/attendance-history/page.tsx" data-dynamic-text="true">
        <h2 className="text-lg font-semibold mb-4" data-unique-id="fec805d0-9b9d-4d99-8dba-eca26ab36bb1" data-file-name="app/dashboard/attendance-history/page.tsx"><span className="editable-text" data-unique-id="b47f274e-9ce0-4c92-83fe-5464d71be396" data-file-name="app/dashboard/attendance-history/page.tsx">Filter Data</span></h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 w-full" data-unique-id="547414be-d59c-4053-b7e7-0f7d1bc4b595" data-file-name="app/dashboard/attendance-history/page.tsx" data-dynamic-text="true">
          {/* Date Range */}
          <div className="w-full" data-unique-id="3c73830e-30a0-4ba5-9095-3e336686d1e6" data-file-name="app/dashboard/attendance-history/page.tsx">
            <label htmlFor="start" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="9974a146-d0de-42b2-ad66-a484e0c2114a" data-file-name="app/dashboard/attendance-history/page.tsx"><span className="editable-text" data-unique-id="9881710f-418c-413b-9576-483d63367c5e" data-file-name="app/dashboard/attendance-history/page.tsx">
              Tanggal Mulai
            </span></label>
            <input type="date" id="start" name="start" value={dateRange.start} onChange={handleDateChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" data-unique-id="aefbdd22-6bd8-4d81-982a-bf83ce9e4304" data-file-name="app/dashboard/attendance-history/page.tsx" />
          </div>
          
          <div className="w-full" data-unique-id="5100d158-5e7b-4b08-bb99-83877a02715b" data-file-name="app/dashboard/attendance-history/page.tsx">
            <label htmlFor="end" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="9db508b8-1196-42dc-ac04-3d47aa7150f4" data-file-name="app/dashboard/attendance-history/page.tsx"><span className="editable-text" data-unique-id="a02bbbe4-4659-416b-aebd-b62af5c61d72" data-file-name="app/dashboard/attendance-history/page.tsx">
              Tanggal Akhir
            </span></label>
            <input type="date" id="end" name="end" value={dateRange.end} onChange={handleDateChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" data-unique-id="5b8354a4-a0a4-43a7-992d-63116342ed9c" data-file-name="app/dashboard/attendance-history/page.tsx" />
          </div>
          
          <div className="w-full" data-unique-id="213754ea-0b6c-4045-aeb6-27bce6462f2a" data-file-name="app/dashboard/attendance-history/page.tsx">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="a2fc2dd3-04de-4720-87f2-39c0093ef0d6" data-file-name="app/dashboard/attendance-history/page.tsx"><span className="editable-text" data-unique-id="4828c3d3-557f-4d7b-8feb-415e132eec8f" data-file-name="app/dashboard/attendance-history/page.tsx">
              Cari Siswa
            </span></label>
            <div className="relative" data-unique-id="1c08c9da-3032-4b42-abff-5d68aaffd8a2" data-file-name="app/dashboard/attendance-history/page.tsx">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" id="search" placeholder="Cari nama siswa..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" data-unique-id="d99728d3-7647-431f-aa95-cdf1b153bf3e" data-file-name="app/dashboard/attendance-history/page.tsx" />
            </div>
          </div>
        </div>
        
        {/* Class Filter */}
        <div className="mt-4" data-unique-id="8306f314-14bc-423d-a24c-333c15aa32b7" data-file-name="app/dashboard/attendance-history/page.tsx" data-dynamic-text="true">
          <div className="flex items-center justify-between" data-unique-id="ee1e43d5-8240-41cd-ada8-9100010c169d" data-file-name="app/dashboard/attendance-history/page.tsx">
            <label className="block text-sm font-medium text-gray-700" data-unique-id="9532bcb6-ecc6-4b31-8c92-9c3a48bb5388" data-file-name="app/dashboard/attendance-history/page.tsx"><span className="editable-text" data-unique-id="4e9bba7e-5eb1-4d7b-b8bc-461a9831837c" data-file-name="app/dashboard/attendance-history/page.tsx">
              Filter Kelas
            </span></label>
            <button onClick={() => setClassFilterVisible(!classFilterVisible)} className="text-sm text-primary flex items-center" data-unique-id="dea8c7b9-e32d-43ba-8215-539286ee4dae" data-file-name="app/dashboard/attendance-history/page.tsx" data-dynamic-text="true">
              {classFilterVisible ? 'Sembunyikan' : 'Tampilkan'}<span className="editable-text" data-unique-id="e9aea6db-1063-4a9f-afc4-c9406aff8cb6" data-file-name="app/dashboard/attendance-history/page.tsx"> Filter Kelas
              </span><ChevronDown className={`ml-1 h-4 w-4 transition-transform ${classFilterVisible ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {classFilterVisible && <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2" data-unique-id="eea41a7d-90e4-45ca-8f9d-4abbda045d58" data-file-name="app/dashboard/attendance-history/page.tsx" data-dynamic-text="true">
              <button onClick={() => setSelectedClass("all")} className={`px-3 py-2 text-sm rounded-lg border ${selectedClass === "all" ? "bg-primary text-white border-primary" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`} data-unique-id="b32df571-ff2c-49bf-aafc-d2c1bca6daeb" data-file-name="app/dashboard/attendance-history/page.tsx"><span className="editable-text" data-unique-id="0c7bbaae-aa8d-4381-aff9-29b91fceed93" data-file-name="app/dashboard/attendance-history/page.tsx">
                Semua Kelas
              </span></button>
              
              {classes.map(className => <button key={className} onClick={() => setSelectedClass(className)} className={`px-3 py-2 text-sm rounded-lg border ${selectedClass === className ? "bg-primary text-white border-primary" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`} data-unique-id="1e5d302f-8791-40f7-ae60-24642968d063" data-file-name="app/dashboard/attendance-history/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="d957302d-dd89-4191-9a9f-639bc564f863" data-file-name="app/dashboard/attendance-history/page.tsx">
                  Kelas </span>{className}
                </button>)}
            </div>}
        </div>
      </div>
      
      {/* Download Buttons */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6" data-unique-id="d6e9af84-c3cd-4825-9c02-6a09366f8a17" data-file-name="app/dashboard/attendance-history/page.tsx">
        <div className="flex flex-col sm:flex-row gap-3" data-unique-id="a3bc291b-7afc-4716-83e4-4c77f26782e6" data-file-name="app/dashboard/attendance-history/page.tsx">
          <button onClick={handleDownloadPDF} disabled={isDownloading || filteredRecords.length === 0} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg ${isDownloading || filteredRecords.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'} transition-colors flex-1`} data-unique-id="6cbe55d0-8fb8-4ce5-bab6-9656a67d2cac" data-file-name="app/dashboard/attendance-history/page.tsx" data-dynamic-text="true">
            {isDownloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
            <span data-unique-id="4f3f8c7a-2c36-4288-8466-b1a9fb3c7bb1" data-file-name="app/dashboard/attendance-history/page.tsx"><span className="editable-text" data-unique-id="28cd07e1-f280-4fe5-a2fe-3a65c34419e4" data-file-name="app/dashboard/attendance-history/page.tsx">Download PDF</span></span>
          </button>
          
          <button onClick={handleDownloadExcel} disabled={isDownloading || filteredRecords.length === 0} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg ${isDownloading || filteredRecords.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'} transition-colors flex-1`} data-unique-id="d18e8f20-14d2-4797-a7f6-adb1dcc269df" data-file-name="app/dashboard/attendance-history/page.tsx" data-dynamic-text="true">
            {isDownloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileSpreadsheet className="h-5 w-5" />}
            <span data-unique-id="1641b309-ad55-4fe0-b3f3-644593733bd0" data-file-name="app/dashboard/attendance-history/page.tsx"><span className="editable-text" data-unique-id="45d53817-c2cf-4eca-9541-8201f2e6355d" data-file-name="app/dashboard/attendance-history/page.tsx">Download Excel</span></span>
          </button>
        </div>
      </div>
      
      {/* Attendance Records Table */}
      {loading ? <div className="flex justify-center items-center h-64" data-unique-id="cb75edab-b847-472c-a32b-1cfa13dbcace" data-file-name="app/dashboard/attendance-history/page.tsx">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </div> : filteredRecords.length > 0 ? <div className="bg-white rounded-xl shadow-sm overflow-hidden" data-unique-id="cca4f066-479e-4f15-8253-f09bf2d42a09" data-file-name="app/dashboard/attendance-history/page.tsx">
          <div className="overflow-x-auto" data-unique-id="23066eaa-4ddb-4260-be72-366431a76886" data-file-name="app/dashboard/attendance-history/page.tsx">
            <table className="min-w-full divide-y divide-gray-200" data-unique-id="41ee3e23-37be-4326-a476-328674a0e074" data-file-name="app/dashboard/attendance-history/page.tsx">
              <thead className="bg-gray-50" data-unique-id="b86dac9c-26fb-44ad-bec0-2643ee9d467e" data-file-name="app/dashboard/attendance-history/page.tsx">
                <tr data-unique-id="cbc39dd8-2ccd-44b8-b65a-5660ac0935d3" data-file-name="app/dashboard/attendance-history/page.tsx">
                  <th scope="col" className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider" data-unique-id="f2a0a8fa-e99e-4afc-a79f-1067f2224231" data-file-name="app/dashboard/attendance-history/page.tsx"><span className="editable-text" data-unique-id="32e203e1-997c-4d04-bef0-a2ee4ae3a853" data-file-name="app/dashboard/attendance-history/page.tsx">
                    Tanggal
                  </span></th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider" data-unique-id="d777965c-bcad-431e-a076-8e234df7d0ea" data-file-name="app/dashboard/attendance-history/page.tsx"><span className="editable-text" data-unique-id="65982660-f4cb-457e-806b-a1c737779e60" data-file-name="app/dashboard/attendance-history/page.tsx">
                    Waktu Absensi
                  </span></th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider" data-unique-id="c523eed7-336f-4656-b8d7-2e6e39a16e1d" data-file-name="app/dashboard/attendance-history/page.tsx"><span className="editable-text" data-unique-id="7f4a984a-6f50-44ca-b9c7-4823b4088d22" data-file-name="app/dashboard/attendance-history/page.tsx">
                    Nama Siswa
                  </span></th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider" data-unique-id="fea099b1-1863-451c-a843-44702f5b35b2" data-file-name="app/dashboard/attendance-history/page.tsx"><span className="editable-text" data-unique-id="54ea1db3-8292-4c33-9803-45e2200fa695" data-file-name="app/dashboard/attendance-history/page.tsx">
                    Kelas
                  </span></th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider" data-unique-id="efae2aab-cfc6-4383-9727-a6e5b406bf1a" data-file-name="app/dashboard/attendance-history/page.tsx"><span className="editable-text" data-unique-id="b400d187-962b-4595-8723-bf182fced4d0" data-file-name="app/dashboard/attendance-history/page.tsx">
                    Status
                  </span></th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider" data-unique-id="27b0574c-3427-45bf-b29f-c22f5de40a88" data-file-name="app/dashboard/attendance-history/page.tsx"><span className="editable-text" data-unique-id="12235bd3-1ccb-4b5f-9954-60cee2e18bf9" data-file-name="app/dashboard/attendance-history/page.tsx">
                    Catatan
                  </span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200" data-unique-id="69c4b89a-71c5-4b7a-80a5-4749285ccd34" data-file-name="app/dashboard/attendance-history/page.tsx" data-dynamic-text="true">
                {filteredRecords.map(record => {
              // Format date from YYYY-MM-DD to DD-MM-YYYY
              const dateParts = record.date.split('-');
              const formattedDate = dateParts.length === 3 ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}` : record.date;
              return <tr key={record.id} className="hover:bg-gray-50" data-unique-id="4fa23986-8067-46d0-b19a-2bd3db2fd4ed" data-file-name="app/dashboard/attendance-history/page.tsx">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-unique-id="98feb1a3-741a-4995-9b5d-d9ceb8e91a28" data-file-name="app/dashboard/attendance-history/page.tsx" data-dynamic-text="true">
                        {formattedDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-unique-id="17a15fea-eb90-4a57-a8bd-38b92d69aa94" data-file-name="app/dashboard/attendance-history/page.tsx" data-dynamic-text="true">
                        {record.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" data-unique-id="f89d64d9-f898-4895-bafb-5fead82c3a59" data-file-name="app/dashboard/attendance-history/page.tsx">
                        <div className="text-xs font-medium text-gray-900" data-unique-id="0caa5641-fca3-4302-aef8-a334628ab8a4" data-file-name="app/dashboard/attendance-history/page.tsx" data-dynamic-text="true">{record.studentName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-unique-id="3448b282-5cc4-4b04-be81-c0d8fb335b9c" data-file-name="app/dashboard/attendance-history/page.tsx" data-dynamic-text="true">
                        {record.class}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" data-unique-id="4149b73e-d373-4e0e-a650-884fb7c9082f" data-file-name="app/dashboard/attendance-history/page.tsx">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(record.status)}`} data-unique-id="da7289cc-5770-4429-b43a-1bb379b541fe" data-file-name="app/dashboard/attendance-history/page.tsx" data-dynamic-text="true">
                          {getStatusText(record.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-unique-id="2d18d0d2-7375-4d91-a1b9-a3b81918e0db" data-file-name="app/dashboard/attendance-history/page.tsx" data-dynamic-text="true">
                        {record.notes || record.note || record.catatan || '-'}
                      </td>
                    </tr>;
            })}
              </tbody>
            </table>
          </div>
        </div> : <div className="bg-white rounded-xl shadow-sm p-10 text-center" data-unique-id="7ccd7184-1fb0-44b3-8299-e45bd1a85e31" data-file-name="app/dashboard/attendance-history/page.tsx">
          <div className="flex flex-col items-center" data-unique-id="513cf5fd-f94a-47f7-8ab6-723fe4e4cb84" data-file-name="app/dashboard/attendance-history/page.tsx">
            <div className="bg-gray-100 rounded-full p-3 mb-4" data-unique-id="20cc30a8-883d-4ad1-9de5-8f65b646e8a1" data-file-name="app/dashboard/attendance-history/page.tsx">
              <Calendar className="h-8 w-8 text-gray-400" data-unique-id="889987bd-1ccf-451e-8598-32796cdb891e" data-file-name="app/dashboard/attendance-history/page.tsx" />
            </div>
            <p className="text-gray-500 mb-4" data-unique-id="ad3c6ab3-7cf2-4c20-9cc6-bb5d861e9cda" data-file-name="app/dashboard/attendance-history/page.tsx" data-dynamic-text="true">
              {searchQuery || selectedClass !== "all" ? "Tidak ada data kehadiran yang sesuai dengan filter" : "Belum ada data kehadiran"}
            </p>
          </div>
        </div>}
    </div>;
}