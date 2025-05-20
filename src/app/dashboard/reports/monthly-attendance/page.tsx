"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Calendar, ChevronDown, Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { format, subMonths, addMonths } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { jsPDF } from "jspdf";
export default function MonthlyAttendanceReport() {
  const {
    schoolId,
    user
  } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({
    start: format(new Date(new Date().setDate(new Date().getDate() - 30)), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd")
  });

  // Helper function to calculate percentages for attendance data
  const calculatePercentage = (data: any[], type: string): string => {
    if (!data || data.length === 0) return "0.0";
    const item = data.find(item => {
      if (type === 'present') return item.type === 'Hadir';
      if (type === 'sick') return item.type === 'Sakit';
      if (type === 'permitted') return item.type === 'Izin';
      if (type === 'absent') return item.type === 'Alpha';
      return false;
    });
    return item ? item.value : "0.0";
  };
  const [schoolInfo, setSchoolInfo] = useState({
    name: "NAMA SEKOLAH",
    address: "Alamat",
    npsn: "NPSN",
    principalName: "",
    principalNip: ""
  });
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState("all");

  // Format current date for display
  const formattedMonth = format(currentDate, "MMMM yyyy", {
    locale: id
  });
  const formattedYear = format(currentDate, "yyyy");

  // Fetch school, classes and attendance data
  useEffect(() => {
    const fetchData = async () => {
      if (!schoolId) return;
      try {
        setLoading(true);

        // Fetch school info
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
        const classesSnapshot = await getDocs(classesRef);
        const classesData: string[] = [];
        classesSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.name) {
            classesData.push(data.name);
          }
        });
        setClasses(classesData.sort());

        // Fetch students with attendance data
        await fetchAttendanceData();
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Gagal mengambil data dari database");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [schoolId]);

  // Fetch attendance data when month changes
  useEffect(() => {
    if (schoolId) {
      fetchAttendanceData();
    }
  }, [currentDate, schoolId]);

  // Set all students to filtered students
  useEffect(() => {
    setFilteredStudents(students);
  }, [students]);

  // Function to fetch attendance data
  const fetchAttendanceData = async () => {
    if (!schoolId) return;
    try {
      setLoading(true);

      // Get start and end date for the month
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

      // Get all students
      const studentsRef = collection(db, `schools/${schoolId}/students`);
      const studentsQuery = query(studentsRef);
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsList: any[] = [];
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

      // If we have students, get their attendance for the selected month
      if (studentsList.length > 0) {
        const attendanceRef = collection(db, `schools/${schoolId}/attendance`);
        const attendanceQuery = query(attendanceRef, where("date", ">=", startDate), where("date", "<=", endDate));
        const attendanceSnapshot = await getDocs(attendanceQuery);

        // Process attendance records
        attendanceSnapshot.forEach(doc => {
          const data = doc.data();
          const studentId = data.studentId;
          const status = data.status;

          // Find the student and update their attendance counts
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
      setFilteredStudents(studentsList);

      // Calculate overall percentages
      let totalHadir = 0;
      let totalSakit = 0;
      let totalIzin = 0;
      let totalAlpha = 0;
      let totalAttendance = 0;
      studentsList.forEach(student => {
        totalHadir += student.hadir || 0;
        totalSakit += student.sakit || 0;
        totalIzin += student.izin || 0;
        totalAlpha += student.alpha || 0;
        totalAttendance += student.total || 0;
      });

      // Prevent division by zero
      if (totalAttendance === 0) totalAttendance = 1;

      // Calculate percentages with one decimal place
      const hadirPercentage = (totalHadir / totalAttendance * 100).toFixed(1);
      const sakitPercentage = (totalSakit / totalAttendance * 100).toFixed(1);
      const izinPercentage = (totalIzin / totalAttendance * 100).toFixed(1);
      const alphaPercentage = (totalAlpha / totalAttendance * 100).toFixed(1);
      setAttendanceData([{
        type: 'Hadir',
        value: hadirPercentage,
        color: 'bg-blue-100 text-blue-800',
        count: totalHadir
      }, {
        type: 'Sakit',
        value: sakitPercentage,
        color: 'bg-orange-100 text-orange-800',
        count: totalSakit
      }, {
        type: 'Izin',
        value: izinPercentage,
        color: 'bg-green-100 text-green-800',
        count: totalIzin
      }, {
        type: 'Alpha',
        value: alphaPercentage,
        color: 'bg-red-100 text-red-800',
        count: totalAlpha
      }]);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      toast.error("Gagal mengambil data kehadiran");
    } finally {
      setLoading(false);
    }
  };
  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  const handleDownloadPDF = () => {
    setIsDownloading(true);
    try {
      // Use filtered students for PDF generation
      const studentsToExport = filteredStudents;
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;

      // Add header with school information
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
      doc.line(margin, margin + 20, pageWidth - margin, margin + 20);

      // Add title
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("REKAPITULASI LAPORAN ABSENSI PESERTA DIDIK", pageWidth / 2, margin + 30, {
        align: "center"
      });
      doc.text(`BULAN ${formattedMonth.toUpperCase()}`, pageWidth / 2, margin + 38, {
        align: "center"
      });

      // Main attendance table
      let yPos = margin + 48;

      // Table headers
      const headers = ["No.", "Nama Siswa", "NISN", "Kelas", "Hadir", "Sakit", "Izin", "Alpha", "Total"];
      const colWidths = [10, 50, 25, 15, 15, 15, 15, 15, 15];

      // Draw table header - Light blue background
      doc.setFillColor(173, 216, 230);
      doc.rect(margin, yPos, pageWidth - margin * 2, 8, "F");
      doc.setDrawColor(0);
      doc.rect(margin, yPos, pageWidth - margin * 2, 8, "S"); // Border

      let xPos = margin;
      doc.setFontSize(9);
      doc.setTextColor(0);

      // Draw vertical lines and headers
      headers.forEach((header, i) => {
        if (i > 0) {
          doc.line(xPos, yPos, xPos, yPos + 8);
        }
        doc.text(header, xPos + colWidths[i] / 2, yPos + 5.5, {
          align: "center"
        });
        xPos += colWidths[i];
      });
      yPos += 8;

      // Draw table rows
      doc.setFontSize(8);
      let totalHadir = 0,
        totalSakit = 0,
        totalIzin = 0,
        totalAlpha = 0,
        totalAll = 0;

      // Process each student's data
      filteredStudents.forEach((student, index) => {
        // Row background (alternating)
        if (index % 2 === 0) {
          doc.setFillColor(240, 240, 240);
          doc.rect(margin, yPos, pageWidth - margin * 2, 7, "F");
        }

        // Draw row border
        doc.rect(margin, yPos, pageWidth - margin * 2, 7, "S");

        // Calculate totals
        totalHadir += student.hadir || 0;
        totalSakit += student.sakit || 0;
        totalIzin += student.izin || 0;
        totalAlpha += student.alpha || 0;
        const studentTotal = (student.hadir || 0) + (student.sakit || 0) + (student.izin || 0) + (student.alpha || 0);
        totalAll += studentTotal;

        // Draw cell content
        xPos = margin;

        // Number
        doc.text((index + 1).toString(), xPos + colWidths[0] / 2, yPos + 5, {
          align: "center"
        });
        xPos += colWidths[0];

        // Draw vertical line
        doc.line(xPos, yPos, xPos, yPos + 7);

        // Name - truncate if too long
        const displayName = student.name.length > 25 ? student.name.substring(0, 22) + "..." : student.name;
        doc.text(displayName || "", xPos + 2, yPos + 5);
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
        doc.text(studentTotal.toString(), xPos + colWidths[8] / 2, yPos + 5, {
          align: "center"
        });
        yPos += 7;

        // Add a new page if needed
        if (yPos > pageHeight - margin - 100 && index < filteredStudents.length - 1) {
          doc.addPage();

          // Add header to new page
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
          yPos = margin + 30;

          // Add table header
          doc.setFillColor(173, 216, 230);
          doc.rect(margin, yPos, pageWidth - margin * 2, 8, "F");
          doc.rect(margin, yPos, pageWidth - margin * 2, 8, "S");
          xPos = margin;
          doc.setFontSize(9);

          // Draw headers again
          headers.forEach((header, i) => {
            if (i > 0) {
              doc.line(xPos, yPos, xPos, yPos + 8);
            }
            doc.text(header, xPos + colWidths[i] / 2, yPos + 5.5, {
              align: "center"
            });
            xPos += colWidths[i];
          });
          yPos += 8;
          doc.setFontSize(8);
        }
      });

      // Add total row
      doc.setFillColor(200, 200, 200);
      doc.rect(margin, yPos, pageWidth - margin * 2, 8, "F");
      doc.rect(margin, yPos, pageWidth - margin * 2, 8, "S");
      xPos = margin;
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");

      // Total text
      doc.text("Total", xPos + colWidths[0] / 2 + colWidths[1] / 2, yPos + 5, {
        align: "center"
      });
      xPos += colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3];

      // Draw vertical line
      doc.line(xPos, yPos, xPos, yPos + 8);
      doc.text(totalHadir.toString(), xPos + colWidths[4] / 2, yPos + 5, {
        align: "center"
      });
      xPos += colWidths[4];

      // Draw vertical line
      doc.line(xPos, yPos, xPos, yPos + 8);
      doc.text(totalSakit.toString(), xPos + colWidths[5] / 2, yPos + 5, {
        align: "center"
      });
      xPos += colWidths[5];

      // Draw vertical line
      doc.line(xPos, yPos, xPos, yPos + 8);
      doc.text(totalIzin.toString(), xPos + colWidths[6] / 2, yPos + 5, {
        align: "center"
      });
      xPos += colWidths[6];

      // Draw vertical line
      doc.line(xPos, yPos, xPos, yPos + 8);
      doc.text(totalAlpha.toString(), xPos + colWidths[7] / 2, yPos + 5, {
        align: "center"
      });
      xPos += colWidths[7];

      // Draw vertical line
      doc.line(xPos, yPos, xPos, yPos + 8);
      doc.text(totalAll.toString(), xPos + colWidths[8] / 2, yPos + 5, {
        align: "center"
      });
      yPos += 15;

      // Get top students by category
      const getTopStudentsByCategory = () => {
        const sortedByHadir = [...students].sort((a, b) => (b.hadir || 0) - (a.hadir || 0)).slice(0, 3);
        const sortedBySakit = [...students].sort((a, b) => (b.sakit || 0) - (a.sakit || 0)).slice(0, 3);
        const sortedByIzin = [...students].sort((a, b) => (b.izin || 0) - (a.izin || 0)).slice(0, 3);
        const sortedByAlpha = [...students].sort((a, b) => (b.alpha || 0) - (a.alpha || 0)).slice(0, 3);
        return {
          hadir: sortedByHadir,
          sakit: sortedBySakit,
          izin: sortedByIzin,
          alpha: sortedByAlpha
        };
      };
      const topStudentsByCategory = getTopStudentsByCategory();

      // Add sections for students with most attendance in each category
      const addStudentCategorySection = (title, students, startY) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(title + " Terbanyak :", margin, startY);
        const tableHeaders = ["No.", "Nama Siswa", "NISN", "Kelas", "Jumlah"];
        const colWidths = [10, 50, 30, 20, 30];
        let yPosition = startY + 5;

        // Draw header row
        doc.setFillColor(173, 216, 230);
        doc.rect(margin, yPosition, colWidths.reduce((a, b) => a + b, 0), 8, "F");
        doc.rect(margin, yPosition, colWidths.reduce((a, b) => a + b, 0), 8, "S");
        let xPosition = margin;

        // Draw column headers
        tableHeaders.forEach((header, i) => {
          if (i > 0) {
            doc.line(xPosition, yPosition, xPosition, yPosition + 8);
          }
          doc.text(header, xPosition + colWidths[i] / 2, yPosition + 5, {
            align: "center"
          });
          xPosition += colWidths[i];
        });
        yPosition += 8;

        // Draw rows
        doc.setFont("helvetica", "normal");
        students.forEach((student, index) => {
          // Draw row border
          doc.rect(margin, yPosition, colWidths.reduce((a, b) => a + b, 0), 8, "S");
          xPosition = margin;

          // Number
          doc.text((index + 1).toString(), xPosition + colWidths[0] / 2, yPosition + 5, {
            align: "center"
          });
          xPosition += colWidths[0];
          doc.line(xPosition, yPosition, xPosition, yPosition + 8);

          // Name - truncate if too long
          const displayName = student.name.length > 25 ? student.name.substring(0, 22) + "..." : student.name;
          doc.text(displayName || "", xPosition + 2, yPosition + 5);
          xPosition += colWidths[1];
          doc.line(xPosition, yPosition, xPosition, yPosition + 8);

          // NISN
          doc.text(student.nisn || "", xPosition + colWidths[2] / 2, yPosition + 5, {
            align: "center"
          });
          xPosition += colWidths[2];
          doc.line(xPosition, yPosition, xPosition, yPosition + 8);

          // Class
          doc.text(student.class || "", xPosition + colWidths[3] / 2, yPosition + 5, {
            align: "center"
          });
          xPosition += colWidths[3];
          doc.line(xPosition, yPosition, xPosition, yPosition + 8);

          // Count - varies depending on section type
          let count = 0;
          switch (title) {
            case "Siswa dengan Hadir":
              count = student.hadir || 0;
              break;
            case "Siswa dengan Sakit":
              count = student.sakit || 0;
              break;
            case "Siswa dengan Izin":
              count = student.izin || 0;
              break;
            case "Siswa dengan Alpha":
              count = student.alpha || 0;
              break;
          }
          doc.text(count.toString(), xPosition + colWidths[4] / 2, yPosition + 5, {
            align: "center"
          });
          yPosition += 8;
        });
        return yPosition;
      };

      // Check if we need a new page for the student sections
      if (yPos + 120 > pageHeight) {
        doc.addPage();
        yPos = margin + 20;
      }

      // Students with most "Hadir"
      yPos = addStudentCategorySection("Siswa dengan Hadir", topStudentsByCategory.hadir, yPos) + 5;

      // Students with most "Sakit"
      yPos = addStudentCategorySection("Siswa dengan Sakit", topStudentsByCategory.sakit, yPos) + 5;

      // Check if we need a new page for the remaining sections
      if (yPos + 80 > pageHeight) {
        doc.addPage();
        yPos = margin + 20;
      }

      // Students with most "Izin"
      yPos = addStudentCategorySection("Siswa dengan Izin", topStudentsByCategory.izin, yPos) + 5;

      // Students with most "Alpha"
      yPos = addStudentCategorySection("Siswa dengan Alpha", topStudentsByCategory.alpha, yPos) + 15;

      // Add signature section
      yPos += 10;

      // Signature layout
      const signatureWidth = (pageWidth - margin * 2) / 2;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Mengetahui", signatureWidth * 0.25 + margin, yPos, {
        align: "center"
      });
      doc.text("Administrator Sekolah", signatureWidth * 1.75 + margin, yPos, {
        align: "center"
      });
      yPos += 5;
      doc.text("KEPALA SEKOLAH,", signatureWidth * 0.25 + margin, yPos, {
        align: "center"
      });
      doc.text("Nama Sekolah,", signatureWidth * 1.75 + margin, yPos, {
        align: "center"
      });
      yPos += 25;
      doc.text(schoolInfo.principalName || "Kepala Sekolah", signatureWidth * 0.25 + margin, yPos, {
        align: "center"
      });
      doc.text(userData?.name || "Administrator", signatureWidth * 1.75 + margin, yPos, {
        align: "center"
      });
      yPos += 5;
      doc.text(`NIP. ${schoolInfo.principalNip || "..........................."}`, signatureWidth * 0.25 + margin, yPos, {
        align: "center"
      });
      doc.text("NIP. ...............................", signatureWidth * 1.75 + margin, yPos, {
        align: "center"
      });

      // Save the PDF
      const fileName = `Rekap_Kehadiran_${formattedMonth.replace(' ', '_')}.pdf`;
      doc.save(fileName);
      toast.success(`Laporan berhasil diunduh sebagai ${fileName}`);
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
      // Use filtered students for Excel generation
      const studentsToExport = filteredStudents;
      // Dynamically import xlsx library
      const XLSX = await import('xlsx');

      // Create header data with school information
      const headerData = [[schoolInfo.name.toUpperCase()], [schoolInfo.address], [`NPSN: ${schoolInfo.npsn}`], [""], ["REKAPITULASI LAPORAN ABSENSI PESERTA DIDIK"], [`BULAN ${formattedMonth.toUpperCase()}`], [""], ["No.", "Nama Siswa", "NISN", "Kelas", "Hadir", "Sakit", "Izin", "Alpha", "Total"]];

      // Calculate totals for summary
      let totalHadir = 0;
      let totalSakit = 0;
      let totalIzin = 0;
      let totalAlpha = 0;
      let totalAll = 0;

      // Add student data
      filteredStudents.forEach((student, index) => {
        const studentHadir = student.hadir || 0;
        const studentSakit = student.sakit || 0;
        const studentIzin = student.izin || 0;
        const studentAlpha = student.alpha || 0;
        const studentTotal = studentHadir + studentSakit + studentIzin + studentAlpha;

        // Add to totals
        totalHadir += studentHadir;
        totalSakit += studentSakit;
        totalIzin += studentIzin;
        totalAlpha += studentAlpha;
        totalAll += studentTotal;
        headerData.push([index + 1, student.name || "nama siswa", student.nisn || "nisn", student.class || "kelas", studentHadir, studentSakit, studentIzin, studentAlpha, studentTotal]);
      });

      // Add total row
      headerData.push(["Total", "", "", "", totalHadir.toString(), totalSakit.toString(), totalIzin.toString(), totalAlpha.toString(), totalAll.toString()]);

      // Add empty rows
      headerData.push([]);
      headerData.push([]);

      // Get top students by category
      const topStudentsByHadir = [...filteredStudents].sort((a, b) => (b.hadir || 0) - (a.hadir || 0)).slice(0, 3);
      const topStudentsBySakit = [...filteredStudents].sort((a, b) => (b.sakit || 0) - (a.sakit || 0)).slice(0, 3);
      const topStudentsByIzin = [...filteredStudents].sort((a, b) => (b.izin || 0) - (a.izin || 0)).slice(0, 3);
      const topStudentsByAlpha = [...filteredStudents].sort((a, b) => (b.alpha || 0) - (a.alpha || 0)).slice(0, 3);

      // Add "Siswa dengan Hadir Terbanyak" section
      headerData.push(["Siswa dengan Hadir Terbanyak :"]);
      headerData.push(["No.", "Nama Siswa", "NISN", "Kelas", "Jumlah"]);
      topStudentsByHadir.forEach((student, index) => {
        headerData.push([index + 1, student.name || "nama siswa", student.nisn || "nisn", student.class || "kelas", student.hadir || 0]);
      });

      // Add empty row
      headerData.push([]);

      // Add "Siswa dengan Sakit Terbanyak" section
      headerData.push(["Siswa dengan Sakit Terbanyak :"]);
      headerData.push(["No.", "Nama Siswa", "NISN", "Kelas", "Jumlah"]);
      topStudentsBySakit.forEach((student, index) => {
        headerData.push([index + 1, student.name || "nama siswa", student.nisn || "nisn", student.class || "kelas", student.sakit || 0]);
      });

      // Add empty row
      headerData.push([]);

      // Add "Siswa dengan Izin Terbanyak" section
      headerData.push(["Siswa dengan Izin Terbanyak :"]);
      headerData.push(["No.", "Nama Siswa", "NISN", "Kelas", "Jumlah"]);
      topStudentsByIzin.forEach((student, index) => {
        headerData.push([index + 1, student.name || "nama siswa", student.nisn || "nisn", student.class || "kelas", student.izin || 0]);
      });

      // Add empty row
      headerData.push([]);

      // Add "Siswa dengan Alpha Terbanyak" section
      headerData.push(["Siswa dengan Alpha Terbanyak :"]);
      headerData.push(["No.", "Nama Siswa", "NISN", "Kelas", "Jumlah"]);
      topStudentsByAlpha.forEach((student, index) => {
        headerData.push([index + 1, student.name || "nama siswa", student.nisn || "nisn", student.class || "kelas", student.alpha || 0]);
      });

      // Add signature section
      headerData.push([]);
      headerData.push([]);
      headerData.push([]);

      // Add signature
      const currentDate = format(new Date(), "d MMMM yyyy", {
        locale: id
      });
      headerData.push([`${schoolInfo.address}, ${currentDate}`]);
      headerData.push([]);
      headerData.push(["", "Mengetahui", "", "", "", "", "", "Administrator Sekolah"]);
      headerData.push(["", "KEPALA SEKOLAH,", "", "", "", "", "", "Nama Sekolah,"]);
      headerData.push([]);
      headerData.push([]);
      headerData.push([]);
      headerData.push(["", schoolInfo.principalName, "", "", "", "", "", userData?.name || "Administrator"]);
      headerData.push(["", `NIP. ${schoolInfo.principalNip}`, "", "", "", "", "", "NIP. ..............................."]);

      // Create workbook and add worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(headerData);

      // Set column widths
      const colWidths = [{
        wch: 6
      },
      // No.
      {
        wch: 30
      },
      // Name
      {
        wch: 15
      },
      // NISN
      {
        wch: 10
      },
      // Class
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
      XLSX.utils.book_append_sheet(wb, ws, "Rekap Kehadiran");

      // Generate filename with current date
      const fileName = `Rekap_Kehadiran_${formattedMonth.replace(' ', '_')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success(`Laporan berhasil diunduh sebagai ${fileName}`);
    } catch (error) {
      console.error("Error generating Excel:", error);
      toast.error("Gagal mengunduh laporan Excel");
    } finally {
      setIsDownloading(false);
    }
  };
  return <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6" data-unique-id="c4f03577-d773-4942-b3f0-13705faa355a" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">
      <div className="flex items-center mb-6" data-unique-id="01c6a9d1-6308-4748-bb45-4ad27d1d551b" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">
        <Link href="/dashboard/reports" className="p-2 mr-2 hover:bg-gray-100 rounded-full" data-unique-id="de181596-5e54-4626-9582-037ddeecd27c" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800" data-unique-id="748866ae-f0bd-4089-bc13-4fd0220ae48c" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx"><span className="editable-text" data-unique-id="4f83df0a-4950-45bb-a157-3295264e6f64" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">Rekap Kehadiran Per Bulan</span></h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6" data-unique-id="b3f7b90d-4caa-4aba-a2ab-175b87bee226" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx" data-dynamic-text="true">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 md:mb-6" data-unique-id="969e196e-101c-4ebb-91f0-42e2d560d56f" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">
          <div className="flex items-center mb-4 md:mb-0" data-unique-id="676cb5d4-bac8-4059-af3e-e50e99786aef" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">
            <div className="bg-blue-100 p-2 rounded-lg mr-3" data-unique-id="f6bd3e7e-a921-44c7-83c4-e237d776e7d6" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">
              <Calendar className="h-6 w-6 text-blue-600" data-unique-id="41d3632c-9f1f-4124-a8b6-311b1c82d673" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx" />
            </div>
            <h2 className="text-xl font-semibold" data-unique-id="79fa6c52-3ce9-4f17-b4d9-e1e1891c7b0d" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="54a7082e-c5fc-4f39-bc50-a87ab32ae76e" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">Laporan Bulan: </span>{formattedMonth}</h2>
          </div>
          
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end" data-unique-id="66d14a18-f063-411e-b4d7-3667370069f6" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">
            <button onClick={handlePrevMonth} className="p-2 rounded-md border border-gray-300 hover:bg-gray-50" data-unique-id="41e621ef-bda2-41c6-9309-bf904610b9aa" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx"><span className="editable-text" data-unique-id="69c9adeb-5796-49a5-a284-cff3d9598eeb" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">
              Bulan Sebelumnya
            </span></button>
            <button onClick={handleNextMonth} className="p-2 rounded-md border border-gray-300 hover:bg-gray-50" data-unique-id="573c6379-2e6c-4976-af9b-7d7a8c34fa18" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx"><span className="editable-text" data-unique-id="6c37085f-323a-4802-830a-837ac7e69c32" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">
              Bulan Berikutnya
            </span></button>
          </div>
        </div>
        
        
        {/* Attendance Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6" data-unique-id="a3f61abf-449f-4f9c-aa91-45fee1645fba" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">
          <div className="bg-blue-100 p-4 rounded-lg" data-unique-id="5b48fde1-d4d3-48d3-9a10-18a64b223dda" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">
            <h3 className="text-sm font-medium text-gray-700 mb-1" data-unique-id="d0950038-b789-48eb-9af3-eeb0534d91ed" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx"><span className="editable-text" data-unique-id="ff923635-398f-4f84-9210-3c59ef809f09" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">Hadir</span></h3>
            <p className="text-3xl font-bold text-blue-700" data-unique-id="32e90635-e279-4dec-ab72-de20523c83d6" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx" data-dynamic-text="true">
              {loading ? <span className="animate-pulse" data-unique-id="2a7ed5b3-efa1-4bc6-89f3-44cf9f3ce643" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx"><span className="editable-text" data-unique-id="d48dc920-a88b-44f1-ad00-dacd4833c37d" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">--.--%</span></span> : `${calculatePercentage(attendanceData, 'present')}%`}
            </p>
          </div>
          <div className="bg-amber-100 p-4 rounded-lg" data-unique-id="7b776dcc-bd93-4806-acb1-bf5bf54cf083" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">
            <h3 className="text-sm font-medium text-gray-700 mb-1" data-unique-id="6c65fcfb-6dd2-4698-86ab-fcf16d4b7c0e" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx"><span className="editable-text" data-unique-id="bbeada5b-36e3-48f1-ad52-90bca48d002e" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">Sakit</span></h3>
            <p className="text-3xl font-bold text-amber-700" data-unique-id="849f471d-f362-49d4-be6c-78781a353181" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx" data-dynamic-text="true">
              {loading ? <span className="animate-pulse" data-unique-id="00278fa4-a42a-4c41-84ff-044094999ae5" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx"><span className="editable-text" data-unique-id="b9fd1c3e-2861-414e-ac94-3512fd768e69" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">--.--%</span></span> : `${calculatePercentage(attendanceData, 'sick')}%`}
            </p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg" data-unique-id="2a1d1efe-104e-4539-8413-873fcc5519c7" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">
            <h3 className="text-sm font-medium text-gray-700 mb-1" data-unique-id="c1f99165-3435-4174-916f-e8ec0790d0ad" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx"><span className="editable-text" data-unique-id="7563d2fd-1dd3-4273-889c-66a33c48aae4" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">Izin</span></h3>
            <p className="text-3xl font-bold text-green-700" data-unique-id="b698c819-1883-4aa5-bb09-60839ddd049f" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx" data-dynamic-text="true">
              {loading ? <span className="animate-pulse" data-unique-id="e50847ad-3972-447b-8b5c-5944964de1a6" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx"><span className="editable-text" data-unique-id="e4e7b0c0-22cd-4011-a027-846d1c26eaa5" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">--.--%</span></span> : `${calculatePercentage(attendanceData, 'permitted')}%`}
            </p>
          </div>
          <div className="bg-red-100 p-4 rounded-lg" data-unique-id="4d7d8e66-6c89-440b-92d9-7fdbd6037fcf" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">
            <h3 className="text-sm font-medium text-gray-700 mb-1" data-unique-id="8ff16a1d-03ab-457e-881f-93b45546766e" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx"><span className="editable-text" data-unique-id="3300009a-2435-4a0e-a0e9-bcaaf2c5b166" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">Alpha</span></h3>
            <p className="text-3xl font-bold text-red-700" data-unique-id="d554537f-8f34-404f-b96e-e00fa3c10bc7" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx" data-dynamic-text="true">
              {loading ? <span className="animate-pulse" data-unique-id="728afea4-1a2d-449b-9eaa-727ec7e30e1a" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx"><span className="editable-text" data-unique-id="449329d5-bcf9-457c-b461-e720280fa078" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">--.--%</span></span> : `${calculatePercentage(attendanceData, 'absent')}%`}
            </p>
          </div>
        </div>
        
        {/* School Information and Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" data-unique-id="a9d9605f-e43f-47ac-bd25-2f7c985ef1dc" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx" data-dynamic-text="true">
          <div className="text-center p-4 border-b border-gray-200" data-unique-id="50425481-f63a-4034-a85c-e482748e5b68" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">
            <h2 className="text-xl font-bold uppercase" data-unique-id="d0c71124-e6ec-45ca-a1b4-7c7c107b1708" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx"><span className="editable-text" data-unique-id="3700c175-3d2a-476f-b3f5-40d7e6010048" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">SD NEGERI 2 SENDANG AYU</span></h2>
            <p className="text-gray-600 font-medium" data-unique-id="0ea6d1e1-3373-44f4-a1f0-b28c416c74aa" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx"><span className="editable-text" data-unique-id="efd8efc0-37e4-46e8-9ce0-e2322d4a7c0e" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">Sendang Ayu Kecamatan Padang Ratu</span></p>
          </div>
          <div className="text-center p-4" data-unique-id="ca92ab76-4d51-462a-a52e-14d2f6a7e546" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">
            <h2 className="text-xl font-bold uppercase" data-unique-id="a116b53f-9668-4ec7-a2bf-a0d276261f9e" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx" data-dynamic-text="true">{schoolInfo.name}</h2>
            <p className="text-gray-600 font-bold" data-unique-id="385cc8d2-1330-413a-8519-baf1c01a36aa" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx" data-dynamic-text="true">{schoolInfo.address}</p>
            <p className="text-gray-600 font-bold" data-unique-id="5c67c6ab-881a-466b-84a0-a57578d5b81b" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="8b73246b-72ef-4963-8862-20035634a29e" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">NPSN: </span>{schoolInfo.npsn}</p>
          </div>
          
          <hr className="border-t border-gray-300 mt-1 mb-3" data-unique-id="203a1637-fd3d-4248-97fe-fe2722f6bb2d" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx" />
          
          <div className="text-center mb-4" data-unique-id="1d3afadb-33c2-438e-89c1-a96b94352e58" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">
            <h3 className="text-lg uppercase" data-unique-id="7f250064-639e-4df3-bcf2-cd934060915f" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx"><span className="editable-text" data-unique-id="2e74a166-a68b-4c72-949a-25e34d6d769b" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">REKAP LAPORAN KEHADIRAN SISWA</span></h3>
            <p className="font-medium" data-unique-id="a8676ecf-b0ee-4899-883f-682d45dba4f5" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="cbf58770-8ede-41f3-a7d8-c3ddbc101106" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">BULAN </span>{formattedMonth.toUpperCase()}</p>
          </div>
          
          {loading ? <div className="flex justify-center items-center h-64" data-unique-id="9f3b6dcc-80ba-49ed-885d-858e2954c3cf" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div> : <div className="overflow-x-auto" data-unique-id="6e113b8b-552d-4c17-a44a-f45ad36fea90" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">
              <table className="min-w-full border" data-unique-id="52b4bee3-21ca-42c7-899c-5f242767de01" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">
                <thead data-unique-id="27b51dd5-5eeb-4b77-a861-20c040530749" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">
                  <tr className="bg-green-100" data-unique-id="cc5bd4ea-0764-4fdd-b599-145e3b07b947" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">
                    <th className="border px-2 py-2 text-center text-sm font-bold text-gray-700" data-unique-id="7061e51a-5033-4fc1-8326-e325ad35aa87" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx"><span className="editable-text" data-unique-id="0dff12b5-ec5a-4ac1-acbe-cb289503a9f1" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">Nama Siswa</span></th>
                    <th className="border px-2 py-2 text-center text-sm font-bold text-gray-700" data-unique-id="8450d323-1b88-40ed-83c9-f9ceb15a0ccc" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx"><span className="editable-text" data-unique-id="b6981784-cda7-4e9f-ad56-4f69861af5a7" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">NISN</span></th>
                    <th className="border px-2 py-2 text-center text-sm font-bold text-gray-700" data-unique-id="73e18c11-e1d5-46e9-b584-64bdf50ec8e4" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx"><span className="editable-text" data-unique-id="a97239f0-3f8c-4078-91fb-e0f1ea1cc22d" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">Kelas</span></th>
                    <th className="border px-2 py-2 text-center text-sm font-bold text-gray-700" data-unique-id="00d96807-3d19-497c-8e30-aca1be249966" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx"><span className="editable-text" data-unique-id="d3eabaea-5a5b-42d5-bdcd-ce52040d5de9" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">Hadir</span></th>
                    <th className="border px-2 py-2 text-center text-sm font-bold text-gray-700" data-unique-id="9376cdbf-92f8-4520-b271-aea7e3b9ab6b" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx"><span className="editable-text" data-unique-id="55bb5216-6aac-4c72-a0eb-efb8d86d52a5" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">Sakit</span></th>
                    <th className="border px-2 py-2 text-center text-sm font-bold text-gray-700" data-unique-id="1c8499fb-649c-4c61-b4ef-c3a2d21db5ab" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx"><span className="editable-text" data-unique-id="cc6641fd-92ff-45f0-8c91-de4043b1898c" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">Izin</span></th>
                    <th className="border px-2 py-2 text-center text-sm font-bold text-gray-700" data-unique-id="c012bd2f-dde1-41a9-aa1f-b0079b49f184" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx"><span className="editable-text" data-unique-id="c3ceabc2-cc44-44cd-9c6f-6d0fe0b9ca52" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">Alpha</span></th>
                    <th className="border px-2 py-2 text-center text-sm font-bold text-gray-700" data-unique-id="7c657e13-6717-4795-a9f8-e16e544ae55e" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx"><span className="editable-text" data-unique-id="86f34550-930f-409b-ad1f-f8cb163705ba" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">Total</span></th>
                  </tr>
                </thead>
                <tbody data-unique-id="e4aac040-1d36-41c7-9aea-ad249ce87f1a" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx" data-dynamic-text="true">
                  {filteredStudents.length > 0 ? filteredStudents.map((student, index) => <tr key={student.id} className={index % 2 === 0 ? "bg-gray-50" : ""} data-unique-id="3da79af2-0f57-4d97-b8c7-a160d6b9ed59" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">
                        <td className="border px-2 py-1 text-xs sm:text-sm" data-unique-id="a6ee5a98-959d-49ab-a712-9236645728f9" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx" data-dynamic-text="true">{student.name}</td>
                        <td className="border px-2 py-1 text-xs sm:text-sm text-center" data-unique-id="e86d7bbf-9d12-4515-8b3d-86a72708a101" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx" data-dynamic-text="true">{student.nisn}</td>
                        <td className="border px-2 py-1 text-xs sm:text-sm text-center" data-unique-id="cc41afde-4bad-410f-804a-f52cb89ee4bc" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx" data-dynamic-text="true">{student.class}</td>
                        <td className="border px-2 py-1 text-xs sm:text-sm text-center" data-unique-id="56a0db9b-663e-4b92-b6c7-0fae9d8552d0" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx" data-dynamic-text="true">{student.hadir}</td>
                        <td className="border px-2 py-1 text-xs sm:text-sm text-center" data-unique-id="986afed9-3517-4c83-b116-879951ea8ac3" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx" data-dynamic-text="true">{student.sakit}</td>
                        <td className="border px-2 py-1 text-xs sm:text-sm text-center" data-unique-id="548badf8-cb22-4909-982e-b93b052e0eeb" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx" data-dynamic-text="true">{student.izin}</td>
                        <td className="border px-2 py-1 text-xs sm:text-sm text-center" data-unique-id="011ff463-458f-4181-8965-ca5e29f8df04" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx" data-dynamic-text="true">{student.alpha}</td>
                        <td className="border px-2 py-1 text-xs sm:text-sm text-center" data-unique-id="f5dcd22c-5ee0-43df-bf73-8c9135d7a106" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx" data-dynamic-text="true">{student.total}</td>
                      </tr>) : <tr data-unique-id="6a2d67f4-95eb-4cb7-8bb2-99c817dc50d0" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">
                      <td colSpan={8} className="border px-4 py-4 text-center text-gray-500" data-unique-id="d4cc0060-7521-48ba-939f-808cf36bcf90" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx"><span className="editable-text" data-unique-id="1f565687-0e16-465f-aea8-86919e2098d6" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">
                        Tidak ada data kehadiran yang ditemukan
                      </span></td>
                    </tr>}
                  
                  {/* Total row */}
                  {filteredStudents.length > 0 && <tr className="bg-gray-200 font-medium" data-unique-id="05ccb59e-9b94-407c-9354-8cf9826b74bd" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">
                      <td colSpan={3} className="border px-2 py-2 font-bold text-sm text-center" data-unique-id="fa8c096d-4232-48f5-ac3d-b851bea9f176" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx"><span className="editable-text" data-unique-id="0e7823b3-29cb-47ff-9688-c0793588efe9" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">TOTAL</span></td>
                      <td className="border px-2 py-2 text-center font-bold text-sm" data-unique-id="02371127-d581-4f05-86cb-5598f3197485" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx" data-dynamic-text="true">
                        {filteredStudents.reduce((sum, student) => sum + student.hadir, 0)}
                      </td>
                      <td className="border px-2 py-2 text-center font-bold text-sm" data-unique-id="ba9b30c6-6b70-4d15-ab11-ff34351867d8" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx" data-dynamic-text="true">
                        {filteredStudents.reduce((sum, student) => sum + student.sakit, 0)}
                      </td>
                      <td className="border px-2 py-2 text-center font-bold text-sm" data-unique-id="0a70bfbf-7a6e-4072-a9f7-33320297bb24" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx" data-dynamic-text="true">
                        {filteredStudents.reduce((sum, student) => sum + student.izin, 0)}
                      </td>
                      <td className="border px-2 py-2 text-center font-bold text-sm" data-unique-id="3ad37077-d1bf-4fa4-b2e0-b2a3c734b471" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx" data-dynamic-text="true">
                        {filteredStudents.reduce((sum, student) => sum + student.alpha, 0)}
                      </td>
                      <td className="border px-2 py-2 text-center font-bold text-sm" data-unique-id="fdefb2f9-7c3d-4e1c-9eab-68632e0a3924" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx" data-dynamic-text="true">
                        {filteredStudents.reduce((sum, student) => sum + student.total, 0)}
                      </td>
                    </tr>}
                </tbody>
              </table>
            </div>}
        </div>
      </div>
              
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 sm:gap-6 mb-20 md:mb-6" data-unique-id="f24ce7bd-69e7-4944-a5ac-c837498f502b" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">
        <button onClick={handleDownloadExcel} disabled={isDownloading} className="flex items-center justify-center gap-3 bg-green-600 text-white p-4 rounded-xl hover:bg-green-700 transition-colors" data-unique-id="24809435-7189-4825-bae3-4cf24f02746d" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx" data-dynamic-text="true">
          {isDownloading ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileSpreadsheet className="h-6 w-6" />}
          <span className="font-medium" data-unique-id="c8e08390-fe77-4821-b9d7-5fca8ca51cad" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx"><span className="editable-text" data-unique-id="c4c3025a-cbde-4263-8b9d-e1d39457408f" data-file-name="app/dashboard/reports/monthly-attendance/page.tsx">Download Laporan Excel</span></span>
        </button>
      </div>
    </div>;
}