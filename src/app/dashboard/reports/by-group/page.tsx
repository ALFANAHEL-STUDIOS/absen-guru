"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore";
import { ArrowLeft, Calendar, FileText, FileSpreadsheet, Download, Loader2, ChevronDown, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import Link from "next/link";
export default function GroupAttendanceReport() {
  const {
    schoolId,
    user
  } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedClass, setSelectedClass] = useState("all");
  const [classes, setClasses] = useState<string[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({
    start: format(new Date(new Date().setDate(new Date().getDate() - 30)), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd")
  });
  const [schoolInfo, setSchoolInfo] = useState({
    name: "NAMA SEKOLAH",
    address: "Alamat",
    npsn: "NPSN",
    principalName: "",
    principalNip: ""
  });

  // Fetch school info, classes and student data
  useEffect(() => {
    const fetchData = async () => {
      if (!schoolId) return;
      try {
        setLoading(true);

        // Fetch school information
        const schoolDoc = await getDoc(doc(db, "schools", schoolId));
        if (schoolDoc.exists()) {
          const data = schoolDoc.data();
          setSchoolInfo({
            name: data.name || "NAMA SEKOLAH",
            address: data.address || "Alamat",
            npsn: data.npsn || "NPSN",
            principalName: data.principalName || "",
            principalNip: data.principalNip || ""
          });
        }

        // Fetch classes
        const classesRef = collection(db, `schools/${schoolId}/classes`);
        const classesQuery = query(classesRef, orderBy("name"));
        const classesSnapshot = await getDocs(classesQuery);
        const classesData: string[] = [];
        classesSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.name) {
            classesData.push(data.name);
          }
        });
        setClasses(classesData.sort());

        // Fetch students with attendance data
        await fetchStudentsWithAttendance();
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Gagal mengambil data dari database");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [schoolId]);

  // Fetch attendance data when date range or class selection changes
  useEffect(() => {
    if (schoolId) {
      fetchStudentsWithAttendance();
    }
  }, [dateRange, selectedClass, schoolId]);

  // Set filtered students whenever students array changes
  useEffect(() => {
    setFilteredStudents(students);
  }, [students]);
  const fetchStudentsWithAttendance = async () => {
    if (!schoolId) return;
    try {
      setLoading(true);

      // Fetch students filtered by class if needed
      const studentsRef = collection(db, `schools/${schoolId}/students`);
      const studentsQuery = selectedClass === "all" ? query(studentsRef, orderBy("name")) : query(studentsRef, where("class", "==", selectedClass), orderBy("name"));
      const studentsSnapshot = await getDocs(studentsQuery);
      let studentsList: any[] = [];
      studentsSnapshot.forEach(doc => {
        studentsList.push({
          id: doc.id,
          ...doc.data(),
          // Initialize attendance counters
          hadir: 0,
          sakit: 0,
          izin: 0,
          alpha: 0,
          total: 0
        });
      });

      // If we have students, fetch attendance records for the date range
      if (studentsList.length > 0) {
        const attendanceRef = collection(db, `schools/${schoolId}/attendance`);
        const attendanceQuery = query(attendanceRef, where("date", ">=", dateRange.start), where("date", "<=", dateRange.end));
        const attendanceSnapshot = await getDocs(attendanceQuery);

        // Count attendance by student ID
        attendanceSnapshot.forEach(doc => {
          const data = doc.data();
          const studentId = data.studentId;
          const status = data.status;

          // Find the student and update counts
          const studentIndex = studentsList.findIndex(s => s.id === studentId);
          if (studentIndex !== -1) {
            if (status === 'present' || status === 'hadir') {
              studentsList[studentIndex].hadir++;
            } else if (status === 'sick' || status === 'sakit') {
              studentsList[studentIndex].sakit++;
            } else if (status === 'permitted' || status === 'izin') {
              studentsList[studentIndex].izin++;
            } else if (status === 'absent' || status === 'alpha') {
              studentsList[studentIndex].alpha++;
            }
            studentsList[studentIndex].total++;
          }
        });
      }
      setStudents(studentsList);
    } catch (error) {
      console.error("Error fetching student attendance data:", error);
      toast.error("Gagal mengambil data kehadiran siswa");
    } finally {
      setLoading(false);
    }
  };
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
  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass(e.target.value);
  };

  // Generate and download PDF report
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      // Create PDF document
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;

      // Add KOP Sekolah
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(schoolInfo.name.toUpperCase(), pageWidth / 2, margin, {
        align: "center"
      });
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(schoolInfo.address, pageWidth / 2, margin + 7, {
        align: "center"
      });
      doc.text(`NPSN: ${schoolInfo.npsn}`, pageWidth / 2, margin + 14, {
        align: "center"
      });

      // Add horizontal line
      doc.setLineWidth(0.5);
      doc.line(margin, margin + 22, pageWidth - margin, margin + 22);

      // Add report title and class information
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("REKAPITULASI LAPORAN ABSENSI PESERTA DIDIK", pageWidth / 2, margin + 32, {
        align: "center"
      });

      // Add class information
      doc.setFontSize(12);
      doc.text(`KELAS : ${selectedClass === "all" ? "Semua Kelas" : selectedClass}`, pageWidth / 2, margin + 40, {
        align: "center"
      });

      // Add date range
      const startDate = format(new Date(dateRange.start), "d MMMM yyyy", {
        locale: id
      });
      const endDate = format(new Date(dateRange.end), "d MMMM yyyy", {
        locale: id
      });
      doc.text(`Dari Tanggal : ${startDate} Sampai Tanggal : ${endDate}`, pageWidth / 2, margin + 48, {
        align: "center"
      });

      // Draw table headers
      const headers = ["No.", "Nama Siswa", "NISN", "Kelas", "Hadir", "Sakit", "Izin", "Alpha", "Total"];
      const colWidths = [10, 50, 25, 15, 15, 15, 15, 15, 15];
      let yPos = margin + 58;

      // Draw header row with green background
      doc.setFillColor(144, 238, 144); // Light green
      doc.rect(margin, yPos, contentWidth, 8, "F");
      doc.setDrawColor(0);
      doc.rect(margin, yPos, contentWidth, 8, "S"); // Border

      let xPos = margin;

      // Draw column headers
      doc.setFontSize(10);
      doc.setTextColor(0);
      headers.forEach((header, i) => {
        if (i > 0) {
          doc.line(xPos, yPos, xPos, yPos + 8);
        }
        doc.text(header, xPos + 2, yPos + 5.5);
        xPos += colWidths[i];
      });
      yPos += 8;

      // Draw table rows
      doc.setFontSize(9);
      students.forEach((student, index) => {
        // Alternating row background
        if (index % 2 === 0) {
          doc.setFillColor(240, 240, 240);
          doc.rect(margin, yPos, contentWidth, 7, "F");
        }

        // Draw row border
        doc.rect(margin, yPos, contentWidth, 7, "S");

        // Draw cell content
        xPos = margin;

        // Number
        doc.text((index + 1).toString(), xPos + colWidths[0] / 2, yPos + 5, {
          align: "center"
        });
        xPos += colWidths[0];

        // Draw vertical line
        doc.line(xPos, yPos, xPos, yPos + 7);
        doc.text(student.name || "", xPos + 2, yPos + 5);
        xPos += colWidths[1];

        // Draw vertical line
        doc.line(xPos, yPos, xPos, yPos + 7);
        doc.text(student.nisn || "", xPos + colWidths[2] / 2, yPos + 5, {
          align: "center"
        });
        xPos += colWidths[2];

        // Draw vertical line
        doc.line(xPos, yPos, xPos, yPos + 7);
        doc.text(student.class || "", xPos + colWidths[3] / 2, yPos + 5, {
          align: "center"
        });
        xPos += colWidths[3];

        // Draw vertical line
        doc.line(xPos, yPos, xPos, yPos + 7);
        doc.text(student.hadir.toString(), xPos + colWidths[4] / 2, yPos + 5, {
          align: "center"
        });
        xPos += colWidths[4];

        // Draw vertical line
        doc.line(xPos, yPos, xPos, yPos + 7);
        doc.text(student.sakit.toString(), xPos + colWidths[5] / 2, yPos + 5, {
          align: "center"
        });
        xPos += colWidths[5];

        // Draw vertical line
        doc.line(xPos, yPos, xPos, yPos + 7);
        doc.text(student.izin.toString(), xPos + colWidths[6] / 2, yPos + 5, {
          align: "center"
        });
        xPos += colWidths[6];

        // Draw vertical line
        doc.line(xPos, yPos, xPos, yPos + 7);
        doc.text(student.alpha.toString(), xPos + colWidths[7] / 2, yPos + 5, {
          align: "center"
        });
        xPos += colWidths[7];

        // Draw vertical line
        doc.line(xPos, yPos, xPos, yPos + 7);
        doc.text(student.total.toString(), xPos + colWidths[8] / 2, yPos + 5, {
          align: "center"
        });
        yPos += 7;

        // Add a new page if needed
        if (yPos > pageHeight - margin - 40 && index < students.length - 1) {
          doc.addPage();

          // Add header to new page (simplified)
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text(schoolInfo.name.toUpperCase(), pageWidth / 2, margin + 6, {
            align: "center"
          });
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.text(schoolInfo.address, pageWidth / 2, margin + 12, {
            align: "center"
          });
          doc.text(`NPSN: ${schoolInfo.npsn}`, pageWidth / 2, margin + 18, {
            align: "center"
          });

          // Add horizontal line
          doc.setLineWidth(0.5);
          doc.line(margin, margin + 22, pageWidth - margin, margin + 22);

          // Add title (simplified for continuation pages)
          doc.setFontSize(12);
          doc.text(`REKAP LAPORAN KEHADIRAN SISWA - ${selectedClass === "all" ? "Semua Kelas" : selectedClass}`, pageWidth / 2, margin + 30, {
            align: "center"
          });
          yPos = margin + 40;

          // Draw header row
          doc.setFillColor(144, 238, 144); // Light green
          doc.rect(margin, yPos, contentWidth, 8, "F");
          doc.rect(margin, yPos, contentWidth, 8, "S"); // Border

          xPos = margin;
          headers.forEach((header, i) => {
            if (i > 0) {
              doc.line(xPos, yPos, xPos, yPos + 8);
            }
            doc.text(header, xPos + 2, yPos + 5.5);
            xPos += colWidths[i];
          });
          yPos += 8;
        }
      });

      // Add footer with signature section
      const currentDate = format(new Date(), "d MMMM yyyy", {
        locale: id
      });
      doc.setFontSize(10);
      doc.text(`${schoolInfo.address}, ${currentDate}`, pageWidth - margin, yPos + 15, {
        align: "right"
      });
      const signatureWidth = (pageWidth - margin * 2) / 2;
      doc.text("Mengetahui,", margin + signatureWidth * 0.25, yPos + 20, {
        align: "center"
      });
      doc.text("Administrator", margin + signatureWidth * 1.75, yPos + 20, {
        align: "center"
      });
      doc.text("Kepala Sekolah", margin + signatureWidth * 0.25, yPos + 25, {
        align: "center"
      });
      doc.text("Sekolah", margin + signatureWidth * 1.75, yPos + 25, {
        align: "center"
      });
      doc.setFont("helvetica", "bold");
      doc.text(schoolInfo.principalName, margin + signatureWidth * 0.25, yPos + 45, {
        align: "center"
      });
      doc.text("Administrator", margin + signatureWidth * 1.75, yPos + 45, {
        align: "center"
      });
      doc.setFont("helvetica", "normal");
      doc.text(`NIP. ${schoolInfo.principalNip}`, margin + signatureWidth * 0.25, yPos + 50, {
        align: "center"
      });

      // Generate filename with current date
      const fileName = `Laporan_Kehadiran_Rombel_${format(new Date(), "yyyyMMdd")}.pdf`;
      doc.save(fileName);
      toast.success(`Laporan kelas ${selectedClass === "all" ? "Semua Kelas" : selectedClass} berhasil diunduh sebagai ${fileName}`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Gagal mengunduh laporan PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  // Generate and download Excel report
  const handleDownloadExcel = async () => {
    setIsDownloading(true);
    try {
      // Create worksheet data with school information
      const wsData = [["NAMA SEKOLAH"], ["Alamat"], ["NPSN"], [], ["REKAPITULASI LAPORAN ABSENSI PESERTA DIDIK"], [`KELAS : ${selectedClass === "all" ? "Semua Kelas" : selectedClass}`], [`Dari Tanggal : ${format(new Date(dateRange.start), "d MMMM yyyy", {
        locale: id
      })} Sampai Tanggal : ${format(new Date(dateRange.end), "d MMMM yyyy", {
        locale: id
      })}`], [], ["No.", "Nama Siswa", "NISN", "Kelas", "Hadir", "Sakit", "Izin", "Alpha", "Total"]];

      // Add student data
      students.forEach((student, index) => {
        wsData.push([index + 1, student.name || "", student.nisn || "", student.class || "", student.hadir || 0, student.sakit || 0, student.izin || 0, student.alpha || 0, student.total || 0]);
      });

      // Add total row
      const totalHadir = students.reduce((sum, student) => sum + (student.hadir || 0), 0);
      const totalSakit = students.reduce((sum, student) => sum + (student.sakit || 0), 0);
      const totalIzin = students.reduce((sum, student) => sum + (student.izin || 0), 0);
      const totalAlpha = students.reduce((sum, student) => sum + (student.alpha || 0), 0);
      const grandTotal = totalHadir + totalSakit + totalIzin + totalAlpha;
      wsData.push(["Total", "", "", "", totalHadir, totalSakit, totalIzin, totalAlpha, grandTotal]);

      // Add signature section
      wsData.push([], [], [`${schoolInfo.address}, ${format(new Date(), "d MMMM yyyy", {
        locale: id
      })}`], [], ["Mengetahui,", "", "", "", "Administrator"], ["Kepala Sekolah", "", "", "", "Sekolah"], [], [], [schoolInfo.principalName, "", "", "", "Administrator"], [`NIP. ${schoolInfo.principalNip}`, "", "", "", ""]);

      // Create workbook and add worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Set column widths
      const colWidths = [{
        wch: 5
      },
      // No
      {
        wch: 30
      },
      // Nama Siswa
      {
        wch: 15
      },
      // NISN
      {
        wch: 10
      },
      // Kelas
      {
        wch: 8
      },
      // Hadir
      {
        wch: 8
      },
      // Sakit
      {
        wch: 8
      },
      // Izin
      {
        wch: 8
      },
      // Alpha
      {
        wch: 8
      } // Total
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Laporan Kehadiran");

      // Generate filename with current date
      const fileName = `Laporan_Kehadiran_Rombel_${format(new Date(), "yyyyMMdd")}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success(`Laporan kelas ${selectedClass === "all" ? "Semua Kelas" : selectedClass} berhasil diunduh sebagai ${fileName}`);
    } catch (error) {
      console.error("Error generating Excel:", error);
      toast.error("Gagal mengunduh laporan Excel");
    } finally {
      setIsDownloading(false);
    }
  };
  return <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6" data-unique-id="6818a8e6-ee76-4bd5-9edc-053bbdfb1597" data-file-name="app/dashboard/reports/by-group/page.tsx" data-dynamic-text="true">
      <div className="flex items-center mb-6" data-unique-id="eddc9b13-8795-4a07-8cc3-155f4627bd37" data-file-name="app/dashboard/reports/by-group/page.tsx">
        <Link href="/dashboard/reports" className="p-2 mr-2 hover:bg-gray-100 rounded-full" data-unique-id="d9a34607-9bb5-40eb-b439-c65d1980c1fa" data-file-name="app/dashboard/reports/by-group/page.tsx">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800" data-unique-id="964f7a8c-52ae-40d9-8bd8-2130a51dd886" data-file-name="app/dashboard/reports/by-group/page.tsx"><span className="editable-text" data-unique-id="77f4f121-a1b4-4f71-9273-3b113bc3c56a" data-file-name="app/dashboard/reports/by-group/page.tsx">Laporan Absen Rombel</span></h1>
      </div>
      
      {/* Filters and Date Range */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6" data-unique-id="f2957974-3899-4600-b156-aff6c5481e3a" data-file-name="app/dashboard/reports/by-group/page.tsx">
        <h2 className="text-lg font-semibold mb-4" data-unique-id="e829402d-8c2c-46a7-9d58-c67aa1153594" data-file-name="app/dashboard/reports/by-group/page.tsx"><span className="editable-text" data-unique-id="f60b917e-7d21-4307-aab6-e6f9dacd2770" data-file-name="app/dashboard/reports/by-group/page.tsx">Filter Data</span></h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4" data-unique-id="2443ba6a-cf0a-433a-97bd-c73748ea2014" data-file-name="app/dashboard/reports/by-group/page.tsx" data-dynamic-text="true">
          {/* Date Range */}
          <div data-unique-id="1592f630-30ac-426f-8e5f-cf4f40dd76f6" data-file-name="app/dashboard/reports/by-group/page.tsx">
            <label htmlFor="start" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="af4d6daa-ac98-4884-b6a8-e21492fe6ab3" data-file-name="app/dashboard/reports/by-group/page.tsx"><span className="editable-text" data-unique-id="486521e2-37ef-4e0f-a989-bafe36d55591" data-file-name="app/dashboard/reports/by-group/page.tsx">
              Tanggal Mulai
            </span></label>
            <input type="date" id="start" name="start" value={dateRange.start} onChange={handleDateChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" data-unique-id="07f54b86-ad57-4b1c-990e-a6ee998196a9" data-file-name="app/dashboard/reports/by-group/page.tsx" />
          </div>
          
          <div data-unique-id="1ba45c5a-e344-49f2-b171-942abe545ef7" data-file-name="app/dashboard/reports/by-group/page.tsx">
            <label htmlFor="end" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="e80b3e62-a7a4-48e7-926d-60266e9e20dd" data-file-name="app/dashboard/reports/by-group/page.tsx"><span className="editable-text" data-unique-id="9b7df1e6-0301-49fb-8978-2af14ac36be6" data-file-name="app/dashboard/reports/by-group/page.tsx">
              Tanggal Akhir
            </span></label>
            <input type="date" id="end" name="end" value={dateRange.end} onChange={handleDateChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" data-unique-id="3ddd2f78-1250-4a41-8810-34263d29d177" data-file-name="app/dashboard/reports/by-group/page.tsx" />
          </div>
        </div>
      </div>
      
      {/* School Information and Table */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6" data-unique-id="aad9c97a-0885-4abc-9ef9-dc88abdf317b" data-file-name="app/dashboard/reports/by-group/page.tsx" data-dynamic-text="true">
        <div className="text-center mb-4 sm:mb-6" data-unique-id="103ec9d8-5b28-42bb-978c-a5e88db35725" data-file-name="app/dashboard/reports/by-group/page.tsx">
          <h2 className="text-lg sm:text-xl font-bold uppercase" data-unique-id="5b7b3dc0-8030-404c-a523-dcbb8184c526" data-file-name="app/dashboard/reports/by-group/page.tsx" data-dynamic-text="true">{schoolInfo.name}</h2>
          <p className="text-gray-600 text-sm sm:text-base" data-unique-id="18a38441-e3a5-46f9-ba9a-5052fe300acc" data-file-name="app/dashboard/reports/by-group/page.tsx" data-dynamic-text="true">{schoolInfo.address}</p>
          <p className="text-gray-600 text-sm sm:text-base" data-unique-id="453c1f2b-e493-4944-912d-e10699b9049a" data-file-name="app/dashboard/reports/by-group/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="2693294f-5039-4d1d-b393-3b46c09161a8" data-file-name="app/dashboard/reports/by-group/page.tsx">NPSN: </span>{schoolInfo.npsn}</p>
        </div>
        
        <div className="text-center mb-4 sm:mb-6" data-unique-id="1cd480ea-4e00-483e-931b-5ce4fb97b39f" data-file-name="app/dashboard/reports/by-group/page.tsx">
          <h3 className="text-base sm:text-lg uppercase font-bold" data-unique-id="55aba946-8487-4a79-a0d2-16d182858263" data-file-name="app/dashboard/reports/by-group/page.tsx"><span className="editable-text" data-unique-id="1775808e-7f57-49dd-87b5-9cfc3c785693" data-file-name="app/dashboard/reports/by-group/page.tsx">REKAP LAPORAN KEHADIRAN SISWA</span></h3>
          <p className="font-medium text-sm sm:text-base" data-unique-id="7988d4f1-f1c1-461c-b463-b3352eb878fd" data-file-name="app/dashboard/reports/by-group/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="08e70532-b607-4e5b-8685-b2953a541ba3" data-file-name="app/dashboard/reports/by-group/page.tsx">KELAS : </span>{selectedClass === "all" ? "Semua Kelas" : selectedClass}</p>
          <p className="text-xs sm:text-sm mt-1" data-unique-id="c9a017b8-4c22-4880-84b7-b5f6903fc50d" data-file-name="app/dashboard/reports/by-group/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="76c4e4bb-2a58-4887-af0f-fa54e5bb5ca6" data-file-name="app/dashboard/reports/by-group/page.tsx">
            Dari Tanggal : </span>{format(new Date(dateRange.start), "d MMMM yyyy", {
            locale: id
          })} <br className="sm:hidden" data-unique-id="2eba4215-80ea-4e16-98b2-309a1b9bc81e" data-file-name="app/dashboard/reports/by-group/page.tsx" /><span className="editable-text" data-unique-id="2854bdac-d489-47b8-9d70-9b9ae98ab73d" data-file-name="app/dashboard/reports/by-group/page.tsx"> Sampai Tanggal : </span>{format(new Date(dateRange.end), "d MMMM yyyy", {
            locale: id
          })}
          </p>
        </div>
        
        {loading ? <div className="flex justify-center items-center h-64" data-unique-id="8d8dd23c-5fee-4d12-9342-4398f27d644e" data-file-name="app/dashboard/reports/by-group/page.tsx">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div> : students.length > 0 ? <div className="overflow-x-auto -mx-4 sm:mx-0" data-unique-id="097eb2d4-3851-4298-b288-96485f270beb" data-file-name="app/dashboard/reports/by-group/page.tsx">
            <div className="inline-block min-w-full align-middle" data-unique-id="13c5d315-fe3c-4056-bc7c-bfb4b7ef080d" data-file-name="app/dashboard/reports/by-group/page.tsx">
              <div className="overflow-hidden" data-unique-id="dd772129-1e23-45c1-a3bd-d8f5ea6a9104" data-file-name="app/dashboard/reports/by-group/page.tsx">
                <table className="min-w-full bg-white border" data-unique-id="51086b9b-f113-4a5b-a3e4-f475bc8ada8e" data-file-name="app/dashboard/reports/by-group/page.tsx">
                  <thead className="bg-green-100" data-unique-id="4516e5ac-bc23-4d40-adee-c3c3ca9472bd" data-file-name="app/dashboard/reports/by-group/page.tsx">
                    <tr data-unique-id="f784076d-b002-43f3-954e-7db24e16db46" data-file-name="app/dashboard/reports/by-group/page.tsx">
                      <th className="border px-2 sm:px-4 py-2 text-center font-bold text-xs sm:text-sm" data-unique-id="3eb719f2-b997-4477-a379-319de6027ec4" data-file-name="app/dashboard/reports/by-group/page.tsx"><span className="editable-text" data-unique-id="42965ce1-861e-419f-8967-a8dd4c8b7965" data-file-name="app/dashboard/reports/by-group/page.tsx">Nama Siswa</span></th>
                      <th className="border px-2 sm:px-4 py-2 text-center font-bold text-xs sm:text-sm" data-unique-id="21fbca85-15d6-429d-8bfe-fce2847458a9" data-file-name="app/dashboard/reports/by-group/page.tsx"><span className="editable-text" data-unique-id="21d31d31-8330-4df5-9dfd-2e75e0b9778e" data-file-name="app/dashboard/reports/by-group/page.tsx">NISN</span></th>
                      <th className="border px-2 sm:px-4 py-2 text-center font-bold text-xs sm:text-sm" data-unique-id="0c75bf2a-37c7-468d-9dbd-3a831f50970f" data-file-name="app/dashboard/reports/by-group/page.tsx"><span className="editable-text" data-unique-id="d9a8974d-84ec-4508-8c0d-5f5d2b3a21c7" data-file-name="app/dashboard/reports/by-group/page.tsx">Kelas</span></th>
                      <th className="border px-2 sm:px-4 py-2 text-center font-bold text-xs sm:text-sm" data-unique-id="2b7867ae-7a0d-44c9-9f5e-bd392db80a29" data-file-name="app/dashboard/reports/by-group/page.tsx"><span className="editable-text" data-unique-id="137143f1-31af-43ba-bf26-d9adc8776226" data-file-name="app/dashboard/reports/by-group/page.tsx">Hadir</span></th>
                      <th className="border px-2 sm:px-4 py-2 text-center font-bold text-xs sm:text-sm" data-unique-id="f77f4e47-0989-49c7-bfd9-916b28073d5e" data-file-name="app/dashboard/reports/by-group/page.tsx"><span className="editable-text" data-unique-id="82385df3-f9c2-45d8-951b-3ba85d9fb2da" data-file-name="app/dashboard/reports/by-group/page.tsx">Sakit</span></th>
                      <th className="border px-2 sm:px-4 py-2 text-center font-bold text-xs sm:text-sm" data-unique-id="3d0b862a-4a1e-4ebc-88eb-84f7bfa5ed06" data-file-name="app/dashboard/reports/by-group/page.tsx"><span className="editable-text" data-unique-id="d6a5917c-6b24-4cd9-ab76-61640d68a9e2" data-file-name="app/dashboard/reports/by-group/page.tsx">Izin</span></th>
                      <th className="border px-2 sm:px-4 py-2 text-center font-bold text-xs sm:text-sm" data-unique-id="e60c65de-565c-49d1-b913-d9f4376cbf74" data-file-name="app/dashboard/reports/by-group/page.tsx"><span className="editable-text" data-unique-id="37c03daf-ba14-406e-9cee-74e88538a037" data-file-name="app/dashboard/reports/by-group/page.tsx">Alpha</span></th>
                      <th className="border px-2 sm:px-4 py-2 text-center font-bold text-xs sm:text-sm" data-unique-id="c6928abb-4b8f-4ba6-a191-1eefc2801ff8" data-file-name="app/dashboard/reports/by-group/page.tsx"><span className="editable-text" data-unique-id="a9ef4833-51cd-452c-b8fe-e57e4a7da16a" data-file-name="app/dashboard/reports/by-group/page.tsx">Total</span></th>
                    </tr>
                  </thead>
                  <tbody data-unique-id="a3fa7809-d826-4ef3-9ae3-8db16ccdf9e5" data-file-name="app/dashboard/reports/by-group/page.tsx" data-dynamic-text="true">
                    {students.map((student, index) => <tr key={student.id} className={index % 2 === 0 ? "bg-gray-50" : ""} data-unique-id="9d237299-5ceb-4d5c-be3d-f656d3c17389" data-file-name="app/dashboard/reports/by-group/page.tsx">
                        <td className="border px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm" data-unique-id="489bf220-f03f-4292-8e9a-ebd46f84dbab" data-file-name="app/dashboard/reports/by-group/page.tsx" data-dynamic-text="true">{student.name}</td>
                        <td className="border px-2 sm:px-4 py-1 sm:py-2 text-center text-xs sm:text-sm" data-unique-id="7d81c5ca-8285-414d-af8a-10a7e92d3e34" data-file-name="app/dashboard/reports/by-group/page.tsx" data-dynamic-text="true">{student.nisn}</td>
                        <td className="border px-2 sm:px-4 py-1 sm:py-2 text-center text-xs sm:text-sm" data-unique-id="eb6a61ad-6371-4801-9cc2-2712f5403abb" data-file-name="app/dashboard/reports/by-group/page.tsx" data-dynamic-text="true">{student.class}</td>
                        <td className="border px-2 sm:px-4 py-1 sm:py-2 text-center text-xs sm:text-sm" data-unique-id="8346932d-e3bb-41b4-ad6f-d226320bbad7" data-file-name="app/dashboard/reports/by-group/page.tsx" data-dynamic-text="true">{student.hadir}</td>
                        <td className="border px-2 sm:px-4 py-1 sm:py-2 text-center text-xs sm:text-sm" data-unique-id="13b73122-5987-4ab8-b089-8aa8a281ca97" data-file-name="app/dashboard/reports/by-group/page.tsx" data-dynamic-text="true">{student.sakit}</td>
                        <td className="border px-2 sm:px-4 py-1 sm:py-2 text-center text-xs sm:text-sm" data-unique-id="e676cb22-6346-4481-97c6-b0d4711d692f" data-file-name="app/dashboard/reports/by-group/page.tsx" data-dynamic-text="true">{student.izin}</td>
                        <td className="border px-2 sm:px-4 py-1 sm:py-2 text-center text-xs sm:text-sm" data-unique-id="99d96f26-6782-446b-9645-a7c45e854ce2" data-file-name="app/dashboard/reports/by-group/page.tsx" data-dynamic-text="true">{student.alpha}</td>
                        <td className="border px-2 sm:px-4 py-1 sm:py-2 text-center text-xs sm:text-sm" data-unique-id="a2454bf3-372d-47a3-bde1-8d66bbc9f801" data-file-name="app/dashboard/reports/by-group/page.tsx" data-dynamic-text="true">{student.total}</td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          </div> : <div className="text-center py-8 border rounded-lg" data-unique-id="0816aa81-c9ce-4b3e-9af4-5fc2f8c940a2" data-file-name="app/dashboard/reports/by-group/page.tsx">
            <p className="text-gray-500" data-unique-id="bc313993-df11-461a-817b-dbfd3e0b37b2" data-file-name="app/dashboard/reports/by-group/page.tsx"><span className="editable-text" data-unique-id="22dd29d2-90c3-4ad0-b84b-39087f838cde" data-file-name="app/dashboard/reports/by-group/page.tsx">Tidak ada data yang ditemukan untuk filter yang dipilih</span></p>
          </div>}
      </div>
      
      {/* Download Buttons - Fixed at bottom on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 pb-20 sm:pb-0" data-unique-id="98ecb3ad-64d1-4c61-9778-4e4b900ec6ac" data-file-name="app/dashboard/reports/by-group/page.tsx">
        <button onClick={handleDownloadPDF} disabled={isDownloading} className="flex items-center justify-center gap-2 sm:gap-3 bg-red-600 text-white p-3 sm:p-4 rounded-lg hover:bg-red-700 transition-colors" data-unique-id="9ae4ef0e-b879-4964-85b2-a5ad56ce5f79" data-file-name="app/dashboard/reports/by-group/page.tsx" data-dynamic-text="true">
          {isDownloading ? <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" /> : <FileText className="h-5 w-5 sm:h-6 sm:w-6" />}
          <span className="font-medium text-sm sm:text-base" data-unique-id="d8855931-8ecc-4fc8-927e-7fa277e75fb4" data-file-name="app/dashboard/reports/by-group/page.tsx"><span className="editable-text" data-unique-id="1462de5b-a097-47c4-a4f0-68cbeb228515" data-file-name="app/dashboard/reports/by-group/page.tsx">Download Laporan PDF</span></span>
        </button>
        
        <button onClick={handleDownloadExcel} disabled={isDownloading} className="flex items-center justify-center gap-2 sm:gap-3 bg-green-600 text-white p-3 sm:p-4 rounded-lg hover:bg-green-700 transition-colors" data-unique-id="b1243094-efee-4728-9e17-60b3f987b3ae" data-file-name="app/dashboard/reports/by-group/page.tsx" data-dynamic-text="true">
          {isDownloading ? <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" /> : <FileSpreadsheet className="h-5 w-5 sm:h-6 sm:w-6" />}
          <span className="font-medium text-sm sm:text-base" data-unique-id="9e3b53b4-cf0f-48ff-8054-a4dc9ac8f8d5" data-file-name="app/dashboard/reports/by-group/page.tsx"><span className="editable-text" data-unique-id="9a8a6939-2e22-40bc-8710-d590e7649f7d" data-file-name="app/dashboard/reports/by-group/page.tsx">Download Laporan Excel</span></span>
        </button>
      </div>
    </div>;
}