"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Download, FileSpreadsheet, FileText, Loader2, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { format, subMonths, addMonths, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { jsPDF } from "jspdf";
import { motion } from "framer-motion";
export default function TeacherAttendanceReports() {
  const {
    schoolId,
    user
  } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: format(new Date(new Date().setDate(1)), "yyyy-MM-dd"),
    end: format(new Date(new Date().setMonth(new Date().getMonth() + 1, 0)), "yyyy-MM-dd")
  });
  const [teacherCount, setTeacherCount] = useState(0);
  // Helper function to calculate percentages for attendance data
  const calculatePercentage = (data: any[], type: string): string => {
    if (!data || data.length === 0) return "0.0";
    const item = data.find(item => {
      if (type === 'present') return item.type === 'Hadir';
      if (type === 'late') return item.type === 'Terlambat';
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

  // Format current date for display
  const formattedMonth = format(currentDate, "MMMM yyyy", {
    locale: id
  });
  const formattedYear = format(currentDate, "yyyy");
  // Fetch school, teachers and attendance data
  useEffect(() => {
    const fetchData = async () => {
      if (!schoolId) return;
      try {
        setLoading(true);
        setError(null);

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

        // Fetch user data for administrator signature
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        }

        // Count total teachers in the school
        const usersRef = collection(db, "users");
        const teachersQuery = query(usersRef, where("schoolId", "==", schoolId), where("role", "in", ["teacher", "staff"]));
        const teachersSnapshot = await getDocs(teachersQuery);
        setTeacherCount(teachersSnapshot.size);

        // Fetch teachers with attendance data
        await fetchAttendanceData();
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Gagal mengambil data dari database. Silakan coba lagi nanti.");
        toast.error("Gagal mengambil data dari database");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [schoolId, user]);

  // Fetch attendance data when month changes
  // Fetch attendance data when month changes
  useEffect(() => {
    if (schoolId) {
      fetchAttendanceData();
    }
  }, [currentDate, schoolId]);

  // Set all teachers to filtered teachers
  useEffect(() => {
    setFilteredTeachers(teachers);
  }, [teachers]);

  // Function to fetch attendance data
  const fetchAttendanceData = async () => {
    if (!schoolId) return;
    try {
      setLoading(true);
      setError(null);

      // Get start and end date for the month
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;

      // Calculate the last day of the month
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;

      // Get all teachers
      const usersRef = collection(db, "users");
      const teachersQuery = query(usersRef, where("schoolId", "==", schoolId), where("role", "in", ["teacher", "staff"]), orderBy("name", "asc"));
      const teachersSnapshot = await getDocs(teachersQuery);
      if (teachersSnapshot.empty) {
        setTeachers([]);
        setFilteredTeachers([]);
        setAttendanceData([{
          type: 'Hadir',
          value: "0.0",
          color: 'bg-blue-100 text-blue-800',
          count: 0
        }, {
          type: 'Terlambat',
          value: "0.0",
          color: 'bg-amber-100 text-amber-800',
          count: 0
        }, {
          type: 'Izin',
          value: "0.0",
          color: 'bg-green-100 text-green-800',
          count: 0
        }, {
          type: 'Alpha',
          value: "0.0",
          color: 'bg-red-100 text-red-800',
          count: 0
        }]);
        return;
      }
      const teachersList: any[] = [];
      teachersSnapshot.forEach(doc => {
        teachersList.push({
          id: doc.id,
          ...doc.data(),
          // Initialize attendance counters
          hadir: 0,
          terlambat: 0,
          izin: 0,
          alpha: 0,
          total: 0
        });
      });

      // If we have teachers, get their attendance for the selected month
      if (teachersList.length > 0) {
        const attendanceRef = collection(db, "teacherAttendance");
        const attendanceQuery = query(attendanceRef, where("schoolId", "==", schoolId), where("date", ">=", startDate), where("date", "<=", endDate));
        const attendanceSnapshot = await getDocs(attendanceQuery);

        // Process attendance records
        attendanceSnapshot.forEach(doc => {
          const data = doc.data();
          const teacherId = data.teacherId;
          const status = data.status;
          const type = data.type; // 'in' or 'out'

          // Find the teacher and update their attendance counts
          const teacherIndex = teachersList.findIndex(t => t.id === teacherId);
          if (teacherIndex !== -1) {
            // Only count check-ins, not check-outs
            if (type === 'in') {
              if (status === 'present') {
                teachersList[teacherIndex].hadir++;
              } else if (status === 'late') {
                teachersList[teacherIndex].terlambat++;
              } else if (status === 'permitted') {
                teachersList[teacherIndex].izin++;
              } else if (status === 'absent') {
                teachersList[teacherIndex].alpha++;
              }
              teachersList[teacherIndex].total++;
            }
          }
        });
      }

      // Sort teachers by name
      teachersList.sort((a, b) => a.name.localeCompare(b.name));
      setTeachers(teachersList);
      setFilteredTeachers(teachersList);

      // Calculate overall percentages
      let totalHadir = 0;
      let totalTerlambat = 0;
      let totalIzin = 0;
      let totalAlpha = 0;
      let totalAttendance = 0;
      teachersList.forEach(teacher => {
        totalHadir += teacher.hadir || 0;
        totalTerlambat += teacher.terlambat || 0;
        totalIzin += teacher.izin || 0;
        totalAlpha += teacher.alpha || 0;
        totalAttendance += teacher.total || 0;
      });

      // Prevent division by zero
      if (totalAttendance === 0) totalAttendance = 1;

      // Calculate percentages with one decimal place
      const hadirPercentage = (totalHadir / totalAttendance * 100).toFixed(1);
      const terlambatPercentage = (totalTerlambat / totalAttendance * 100).toFixed(1);
      const izinPercentage = (totalIzin / totalAttendance * 100).toFixed(1);
      const alphaPercentage = (totalAlpha / totalAttendance * 100).toFixed(1);
      setAttendanceData([{
        type: 'Hadir',
        value: hadirPercentage,
        color: 'bg-blue-100 text-blue-800',
        count: totalHadir
      }, {
        type: 'Terlambat',
        value: terlambatPercentage,
        color: 'bg-amber-100 text-amber-800',
        count: totalTerlambat
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
      setError("Gagal mengambil data kehadiran. Silakan coba lagi nanti.");
      toast.error("Gagal mengambil data kehadiran");

      // Set default values on error
      setAttendanceData([{
        type: 'Hadir',
        value: "0.0",
        color: 'bg-blue-100 text-blue-800',
        count: 0
      }, {
        type: 'Terlambat',
        value: "0.0",
        color: 'bg-amber-100 text-amber-800',
        count: 0
      }, {
        type: 'Izin',
        value: "0.0",
        color: 'bg-green-100 text-green-800',
        count: 0
      }, {
        type: 'Alpha',
        value: "0.0",
        color: 'bg-red-100 text-red-800',
        count: 0
      }]);
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
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const pdfDoc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      const pageWidth = pdfDoc.internal.pageSize.getWidth();
      const pageHeight = pdfDoc.internal.pageSize.getHeight();
      const margin = 15;
      // Add header with school information
      pdfDoc.setFontSize(16);
      pdfDoc.setFont("helvetica", "bold");
      pdfDoc.text(schoolInfo.name.toUpperCase(), pageWidth / 2, margin, {
        align: "center"
      });
      pdfDoc.setFontSize(12);
      pdfDoc.setFont("helvetica", "normal");
      pdfDoc.text(schoolInfo.address, pageWidth / 2, margin + 7, {
        align: "center"
      });
      pdfDoc.text(`NPSN: ${schoolInfo.npsn}`, pageWidth / 2, margin + 14, {
        align: "center"
      });
      // Add horizontal line
      pdfDoc.setLineWidth(0.5);
      pdfDoc.line(margin, margin + 20, pageWidth - margin, margin + 20);
      // Add title
      pdfDoc.setFontSize(12);
      pdfDoc.setFont("helvetica", "normal");
      pdfDoc.text("REKAPITULASI LAPORAN ABSENSI GURU DAN TENAGA KEPENDIDIKAN", pageWidth / 2, margin + 30, {
        align: "center"
      });
      pdfDoc.text(`BULAN ${formattedMonth.toUpperCase()}`, pageWidth / 2, margin + 36, {
        align: "center"
      });

      // Main attendance table
      let yPos = margin + 43;
      // Table headers
      const headers = ["NO.", "NAMA GURU", "", "JABATAN", "HADIR", "TERLAMBAT", "IZIN", "ALPHA", "TOTAL"];
      const colWidths = [12, 54, 0, 20, 17, 25, 15, 17, 20];
      // Draw table header - Light blue background
      pdfDoc.setFillColor(173, 216, 230);
      pdfDoc.rect(margin, yPos, pageWidth - margin * 2, 8, "F");
      pdfDoc.setDrawColor(0);
      pdfDoc.rect(margin, yPos, pageWidth - margin * 2, 8, "S"); // Border
      let xPos = margin;
      pdfDoc.setFontSize(9);
      pdfDoc.setTextColor(0);
      // Draw vertical lines and headers
      headers.forEach((header, i) => {
        if (i > 0) {
          pdfDoc.line(xPos, yPos, xPos, yPos + 8);
        }
        pdfDoc.text(header, xPos + colWidths[i] / 2, yPos + 5.5, {
          align: "center"
        });
        xPos += colWidths[i];
      });
      yPos += 8;
      // Draw table rows
      pdfDoc.setFontSize(10);
      let totalHadir = 0,
        totalTerlambat = 0,
        totalIzin = 0,
        totalAlpha = 0,
        totalAll = 0;
      // Process each teacher's data
      filteredTeachers.forEach((teacher, index) => {
        // Row background (alternating)
        if (index % 2 === 0) {
          pdfDoc.setFillColor(240, 240, 240);
          pdfDoc.rect(margin, yPos, pageWidth - margin * 2, 7, "F");
        }
        // Draw row border
        pdfDoc.rect(margin, yPos, pageWidth - margin * 2, 7, "S");
        // Calculate totals
        totalHadir += teacher.hadir || 0;
        totalTerlambat += teacher.terlambat || 0;
        totalIzin += teacher.izin || 0;
        totalAlpha += teacher.alpha || 0;
        const teacherTotal = (teacher.hadir || 0) + (teacher.terlambat || 0) + (teacher.izin || 0) + (teacher.alpha || 0);
        totalAll += teacherTotal;
        // Draw cell content
        xPos = margin;
        // Number
        pdfDoc.text((index + 1).toString(), xPos + colWidths[0] / 2, yPos + 5, {
          align: "center"
        });
        xPos += colWidths[0];
        // Draw vertical line
        pdfDoc.line(xPos, yPos, xPos, yPos + 7);
        // Name - truncate if too long
        const displayName = teacher.name.length > 25 ? teacher.name.substring(0, 22) + "..." : teacher.name;
        pdfDoc.text(displayName || "", xPos + 2, yPos + 5);
        xPos += colWidths[1];
        // Draw vertical line
        pdfDoc.line(xPos, yPos, xPos, yPos + 7);
        //pdfDoc.text(teacher.nik || "", xPos + colWidths[2] / 2, yPos + 5, {
        // align: "center"
        // });
        xPos += colWidths[2];
        // Draw vertical line
        pdfDoc.line(xPos, yPos, xPos, yPos + 7);
        const roleText = teacher.role === 'teacher' ? 'Guru' : 'Tendik';
        pdfDoc.text(roleText, xPos + colWidths[3] / 2, yPos + 5, {
          align: "center"
        });
        xPos += colWidths[3];
        // Draw vertical line
        pdfDoc.line(xPos, yPos, xPos, yPos + 7);
        pdfDoc.text((teacher.hadir || 0).toString(), xPos + colWidths[4] / 2, yPos + 5, {
          align: "center"
        });
        xPos += colWidths[4];
        // Draw vertical line
        pdfDoc.line(xPos, yPos, xPos, yPos + 7);
        pdfDoc.text((teacher.terlambat || 0).toString(), xPos + colWidths[5] / 2, yPos + 5, {
          align: "center"
        });
        xPos += colWidths[5];
        // Draw vertical line
        pdfDoc.line(xPos, yPos, xPos, yPos + 7);
        pdfDoc.text((teacher.izin || 0).toString(), xPos + colWidths[6] / 2, yPos + 5, {
          align: "center"
        });
        xPos += colWidths[6];
        // Draw vertical line
        pdfDoc.line(xPos, yPos, xPos, yPos + 7);
        pdfDoc.text((teacher.alpha || 0).toString(), xPos + colWidths[7] / 2, yPos + 5, {
          align: "center"
        });
        xPos += colWidths[7];
        // Draw vertical line
        pdfDoc.line(xPos, yPos, xPos, yPos + 7);
        pdfDoc.text(teacherTotal.toString(), xPos + colWidths[8] / 2, yPos + 5, {
          align: "center"
        });
        yPos += 7;
        // Add a new page if needed
        if (yPos > pageHeight - margin - 100 && index < filteredTeachers.length - 1) {
          pdfDoc.addPage();
          // Add header to new page
          pdfDoc.setFontSize(12);
          pdfDoc.setFont("helvetica", "bold");
          pdfDoc.text(schoolInfo.name.toUpperCase(), pageWidth / 2, margin + 6, {
            align: "center"
          });
          pdfDoc.setFontSize(12);
          pdfDoc.setFont("helvetica", "normal");
          pdfDoc.text(schoolInfo.address, pageWidth / 2, margin + 12, {
            align: "center"
          });
          pdfDoc.text(`NPSN : ${schoolInfo.npsn}`, pageWidth / 2, margin + 18, {
            align: "center"
          });
          // Add horizontal line
          pdfDoc.setLineWidth(0.5);
          pdfDoc.line(margin, margin + 22, pageWidth - margin, margin + 22);
          yPos = margin + 30;
          // Add table header
          pdfDoc.setFillColor(173, 216, 230);
          pdfDoc.rect(margin, yPos, pageWidth - margin * 2, 8, "F");
          pdfDoc.rect(margin, yPos, pageWidth - margin * 2, 8, "S");
          xPos = margin;
          pdfDoc.setFontSize(10);
          // Draw headers again
          headers.forEach((header, i) => {
            if (i > 0) {
              pdfDoc.line(xPos, yPos, xPos, yPos + 8);
            }
            pdfDoc.text(header, xPos + colWidths[i] / 2, yPos + 5.5, {
              align: "center"
            });
            xPos += colWidths[i];
          });
          yPos += 8;
          pdfDoc.setFontSize(10);
        }
      });

      // Add total row
      pdfDoc.setFillColor(200, 200, 200);
      pdfDoc.rect(margin, yPos, pageWidth - margin * 2, 8, "F");
      pdfDoc.rect(margin, yPos, pageWidth - margin * 2, 8, "S");
      xPos = margin;
      pdfDoc.setFontSize(10);
      pdfDoc.setFont("helvetica", "normal");
      // Total text
      pdfDoc.text("TOTAL", xPos + colWidths[0] / 2 + colWidths[1] / 2, yPos + 5, {
        align: "center"
      });
      xPos += colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3];
      // Draw vertical line
      pdfDoc.line(xPos, yPos, xPos, yPos + 8);
      pdfDoc.text(totalHadir.toString(), xPos + colWidths[4] / 2, yPos + 5, {
        align: "center"
      });
      xPos += colWidths[4];
      // Draw vertical line
      pdfDoc.line(xPos, yPos, xPos, yPos + 8);
      pdfDoc.text(totalTerlambat.toString(), xPos + colWidths[5] / 2, yPos + 5, {
        align: "center"
      });
      xPos += colWidths[5];
      // Draw vertical line
      pdfDoc.line(xPos, yPos, xPos, yPos + 8);
      pdfDoc.text(totalIzin.toString(), xPos + colWidths[6] / 2, yPos + 5, {
        align: "center"
      });
      xPos += colWidths[6];
      // Draw vertical line
      pdfDoc.line(xPos, yPos, xPos, yPos + 8);
      pdfDoc.text(totalAlpha.toString(), xPos + colWidths[7] / 2, yPos + 5, {
        align: "center"
      });
      xPos += colWidths[7];
      // Draw vertical line
      pdfDoc.line(xPos, yPos, xPos, yPos + 8);
      pdfDoc.text(totalAll.toString(), xPos + colWidths[8] / 2, yPos + 5, {
        align: "center"
      });
      yPos += 18;
      // Get top teachers by category
      const getTopTeachersByCategory = () => {
        const sortedByHadir = [...teachers].sort((a, b) => (b.hadir || 0) - (a.hadir || 0)).slice(0, 3);
        const sortedByTerlambat = [...teachers].sort((a, b) => (b.terlambat || 0) - (a.terlambat || 0)).slice(0, 3);
        const sortedByIzin = [...teachers].sort((a, b) => (b.izin || 0) - (a.izin || 0)).slice(0, 3);
        const sortedByAlpha = [...teachers].sort((a, b) => (b.alpha || 0) - (a.alpha || 0)).slice(0, 3);
        return {
          hadir: sortedByHadir,
          terlambat: sortedByTerlambat,
          izin: sortedByIzin,
          alpha: sortedByAlpha
        };
      };
      const topTeachersByCategory = getTopTeachersByCategory();
      // Add sections for teachers with most attendance in each category
      const addTeacherCategorySection = (title, teachers, startY) => {
        pdfDoc.setFontSize(10);
        pdfDoc.setFont("helvetica", "normal");
        pdfDoc.text(title + " Terbanyak :", margin, startY);
        const tableHeaders = ["No.", "Nama", "NIK", "Jabatan", "Jumlah"];
        const colWidths = [10, 55, 38, 23, 27];
        let yPosition = startY + 5;
        // Draw header row
        pdfDoc.setFillColor(173, 216, 230);
        pdfDoc.rect(margin, yPosition, colWidths.reduce((a, b) => a + b, 0), 8, "F");
        pdfDoc.rect(margin, yPosition, colWidths.reduce((a, b) => a + b, 0), 8, "S");
        let xPosition = margin;
        // Draw column headers
        tableHeaders.forEach((header, i) => {
          if (i > 0) {
            pdfDoc.line(xPosition, yPosition, xPosition, yPosition + 8);
          }
          pdfDoc.text(header, xPosition + colWidths[i] / 2, yPosition + 5, {
            align: "center"
          });
          xPosition += colWidths[i];
        });
        yPosition += 8;
        // Draw rows
        pdfDoc.setFont("helvetica", "normal");
        teachers.forEach((teacher, index) => {
          // Draw row border
          pdfDoc.rect(margin, yPosition, colWidths.reduce((a, b) => a + b, 0), 8, "S");
          xPosition = margin;
          // Number
          pdfDoc.text((index + 1).toString(), xPosition + colWidths[0] / 2, yPosition + 5, {
            align: "center"
          });
          xPosition += colWidths[0];
          pdfDoc.line(xPosition, yPosition, xPosition, yPosition + 8);
          // Name - truncate if too long
          const displayName = teacher.name.length > 25 ? teacher.name.substring(0, 22) + "..." : teacher.name;
          pdfDoc.text(displayName || "", xPosition + 2, yPosition + 5);
          xPosition += colWidths[1];
          pdfDoc.line(xPosition, yPosition, xPosition, yPosition + 8);
          // NIP/NIK
          pdfDoc.text(teacher.nik || "", xPosition + colWidths[2] / 2, yPosition + 5, {
            align: "center"
          });
          xPosition += colWidths[2];
          pdfDoc.line(xPosition, yPosition, xPosition, yPosition + 8);
          // Role
          const roleText = teacher.role === 'teacher' ? 'Guru' : 'Tendik';
          pdfDoc.text(roleText, xPosition + colWidths[3] / 2, yPosition + 5, {
            align: "center"
          });
          xPosition += colWidths[3];
          pdfDoc.line(xPosition, yPosition, xPosition, yPosition + 8);
          // Count - varies depending on section type
          let count = 0;
          switch (title) {
            case "Guru/Tendik dengan Hadir":
              count = teacher.hadir || 0;
              break;
            case "Guru/Tendik dengan Terlambat":
              count = teacher.terlambat || 0;
              break;
            case "Guru/Tendik dengan Izin":
              count = teacher.izin || 0;
              break;
            case "Guru/Tendik dengan Alpha":
              count = teacher.alpha || 0;
              break;
          }
          pdfDoc.text(count.toString(), xPosition + colWidths[4] / 2, yPosition + 5, {
            align: "center"
          });
          yPosition += 8;
        });
        return yPosition;
      };
      // Check if we need a new page for the teacher sections
      if (yPos + 120 > pageHeight) {
        pdfDoc.addPage();
        yPos = margin + 20;
      }
      // Teachers with most "Hadir"
      yPos = addTeacherCategorySection("Guru/Tendik dengan Hadir", topTeachersByCategory.hadir, yPos) + 8;
      // Teachers with most "Terlambat"
      yPos = addTeacherCategorySection("Guru/Tendik dengan Terlambat", topTeachersByCategory.terlambat, yPos) + 8;
      // Check if we need a new page for the remaining sections
      if (yPos + 80 > pageHeight) {
        pdfDoc.addPage();
        yPos = margin + 20;
      }
      // Teachers with most "Izin"
      yPos = addTeacherCategorySection("Guru/Tendik dengan Izin", topTeachersByCategory.izin, yPos) + 8;
      // Teachers with most "Alpha"
      yPos = addTeacherCategorySection("Guru/Tendik dengan Alpha", topTeachersByCategory.alpha, yPos) + 12;
      // Add signature section
      yPos += 5;
      // Signature layout
      const signatureWidth = (pageWidth - margin * 2) / 2;
      pdfDoc.setFontSize(10);
      pdfDoc.setFont("helvetica", "normal");
      pdfDoc.text("Mengetahui", signatureWidth * 0.25 + margin, yPos, {
        align: "center"
      });
      pdfDoc.text("Administrator Sekolah", signatureWidth * 1.75 + margin, yPos, {
        align: "center"
      });
      yPos += 5;
      pdfDoc.text("KEPALA SEKOLAH,", signatureWidth * 0.25 + margin, yPos, {
        align: "center"
      });
      pdfDoc.text("Absensi Digital,", signatureWidth * 1.75 + margin, yPos, {
        align: "center"
      });
      yPos += 20;
      pdfDoc.text(schoolInfo.principalName || "Kepala Sekolah", signatureWidth * 0.25 + margin, yPos, {
        align: "center"
      });
      pdfDoc.text(userData?.name || "Administrator", signatureWidth * 1.75 + margin, yPos, {
        align: "center"
      });
      yPos += 5;
      pdfDoc.text(`NIP. ${schoolInfo.principalNip || "................................"}`, signatureWidth * 0.25 + margin, yPos, {
        align: "center"
      });
      pdfDoc.text("NIP. ....................................", signatureWidth * 1.75 + margin, yPos, {
        align: "center"
      });
      // Save the PDF
      const fileName = `Rekap_Kehadiran_Guru_${formattedMonth.replace(' ', '_')}.pdf`;
      pdfDoc.save(fileName);
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
      // Dynamically import xlsx library
      const XLSX = await import('xlsx');

      // Format current month name properly
      const monthName = format(currentDate, "MMMM yyyy", {
        locale: id
      }).toUpperCase();

      // Create header data with school information
      const headerData = [[schoolInfo.name.toUpperCase()], [schoolInfo.address], [`NPSN: ${schoolInfo.npsn}`], [""], ["REKAPITULASI LAPORAN ABSENSI GURU DAN TENAGA KEPENDIDIKAN"], [`BULAN ${monthName}`], [`TOTAL GURU & TENDIK: ${teacherCount}`], [""], ["No.", "Nama Guru/Tendik", "NIK", "Jabatan", "Hadir", "Terlambat", "Izin", "Alpha", "Total"]];
      // Calculate totals for summary
      let totalHadir = 0;
      let totalTerlambat = 0;
      let totalIzin = 0;
      let totalAlpha = 0;
      let totalAll = 0;
      // Add teacher data
      filteredTeachers.forEach((teacher, index) => {
        const teacherHadir = teacher.hadir || 0;
        const teacherTerlambat = teacher.terlambat || 0;
        const teacherIzin = teacher.izin || 0;
        const teacherAlpha = teacher.alpha || 0;
        const teacherTotal = teacherHadir + teacherTerlambat + teacherIzin + teacherAlpha;
        const roleText = teacher.role === 'teacher' ? 'Guru' : 'Tendik';
        // Add to totals
        totalHadir += teacherHadir;
        totalTerlambat += teacherTerlambat;
        totalIzin += teacherIzin;
        totalAlpha += teacherAlpha;
        totalAll += teacherTotal;
        headerData.push([index + 1, teacher.name || "nama guru/tendik", teacher.nik || "nip/nik", roleText, teacherHadir, teacherTerlambat, teacherIzin, teacherAlpha, teacherTotal]);
      });
      // Add total row
      headerData.push(["Total", "", "", "", totalHadir.toString(), totalTerlambat.toString(), totalIzin.toString(), totalAlpha.toString(), totalAll.toString()]);
      // Add empty rows
      headerData.push([]);
      headerData.push([]);
      // Get top teachers by category
      const topTeachersByHadir = [...filteredTeachers].sort((a, b) => (b.hadir || 0) - (a.hadir || 0)).slice(0, 3);
      const topTeachersByTerlambat = [...filteredTeachers].sort((a, b) => (b.terlambat || 0) - (a.terlambat || 0)).slice(0, 3);
      const topTeachersByIzin = [...filteredTeachers].sort((a, b) => (b.izin || 0) - (a.izin || 0)).slice(0, 3);
      const topTeachersByAlpha = [...filteredTeachers].sort((a, b) => (b.alpha || 0) - (a.alpha || 0)).slice(0, 3);
      // Add "Guru/Tendik dengan Hadir Terbanyak" section
      headerData.push(["Guru/Tendik dengan Hadir Terbanyak :"]);
      headerData.push(["No.", "Nama", "NIP/NIK", "Jabatan", "Jumlah"]);
      topTeachersByHadir.forEach((teacher, index) => {
        headerData.push([index + 1, teacher.name || "nama", teacher.nik || "nip/nik", teacher.role === 'teacher' ? 'Guru' : 'Tendik', teacher.hadir || 0]);
      });
      // Add empty row
      headerData.push([]);
      // Add "Guru/Tendik dengan Terlambat Terbanyak" section
      headerData.push(["Guru/Tendik dengan Terlambat Terbanyak :"]);
      headerData.push(["No.", "Nama", "NIP/NIK", "Jabatan", "Jumlah"]);
      topTeachersByTerlambat.forEach((teacher, index) => {
        headerData.push([index + 1, teacher.name || "nama", teacher.nik || "nip/nik", teacher.role === 'teacher' ? 'Guru' : 'Tendik', teacher.terlambat || 0]);
      });
      // Add empty row
      headerData.push([]);
      // Add "Guru/Tendik dengan Izin Terbanyak" section
      headerData.push(["Guru/Tendik dengan Izin Terbanyak :"]);
      headerData.push(["No.", "Nama", "NIP/NIK", "Jabatan", "Jumlah"]);
      topTeachersByIzin.forEach((teacher, index) => {
        headerData.push([index + 1, teacher.name || "nama", teacher.nik || "nip/nik", teacher.role === 'teacher' ? 'Guru' : 'Tendik', teacher.izin || 0]);
      });
      // Add empty row
      headerData.push([]);
      // Add "Guru/Tendik dengan Alpha Terbanyak" section
      headerData.push(["Guru/Tendik dengan Alpha Terbanyak :"]);
      headerData.push(["No.", "Nama", "NIP/NIK", "Jabatan", "Jumlah"]);
      topTeachersByAlpha.forEach((teacher, index) => {
        headerData.push([index + 1, teacher.name || "nama", teacher.nik || "nip/nik", teacher.role === 'teacher' ? 'Guru' : 'Tendik', teacher.alpha || 0]);
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
      // NIP/NIK
      {
        wch: 15
      },
      // Jabatan
      {
        wch: 8
      },
      // Hadir
      {
        wch: 12
      },
      // Terlambat
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
      XLSX.utils.book_append_sheet(wb, ws, "Rekap Kehadiran Guru");
      // Generate filename with current date
      const fileName = `Rekap_Kehadiran_Guru_${format(currentDate, "MMMM_yyyy", {
        locale: id
      })}_${format(new Date(), "ddMMyyyy")}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success(`Laporan berhasil diunduh sebagai ${fileName}`);
    } catch (error) {
      console.error("Error generating Excel:", error);
      toast.error("Gagal mengunduh laporan Excel");
    } finally {
      setIsDownloading(false);
    }
  };
  // Calculate attendance summary
  const calculateSummary = () => {
    if (!attendanceData || attendanceData.length === 0) {
      return {
        hadir: "0.0",
        terlambat: "0.0",
        izin: "0.0",
        alpha: "0.0"
      };
    }
    return {
      hadir: calculatePercentage(attendanceData, 'present'),
      terlambat: calculatePercentage(attendanceData, 'late'),
      izin: calculatePercentage(attendanceData, 'permitted'),
      alpha: calculatePercentage(attendanceData, 'absent')
    };
  };
  const summary = calculateSummary();
  return <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6" data-unique-id="aae7d8ec-a61a-443c-a404-742558a45f7c" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
     <div className="flex items-center mb-6" data-unique-id="c6a720b1-206c-4804-9857-601d05292281" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
       <Link href="/dashboard/absensi-guru" className="p-2 mr-2 hover:bg-gray-100 rounded-full" data-unique-id="e2bb5d35-e4a6-4bb0-b9e5-cc4a21986db6" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
         <ArrowLeft size={20} />
       </Link>
       <h1 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600" data-unique-id="a1753877-fc51-437c-a3a8-b5247f0983c3" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="454d4bf1-d09f-4f46-90ed-70e56031badd" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">Rekap Kehadiran Guru dan Tendik</span></h1>
     </div>

     <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-blue-100" data-unique-id="da3c0c75-6e5f-49c4-8988-42409d96b1d6" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">
       <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 md:mb-6" data-unique-id="def7522e-5ce7-4e7f-beb9-79e6f26f1a2f" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
         <motion.div className="flex items-center mb-4 md:mb-0" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.4
        }} data-unique-id="93662fd5-32ed-4774-a9ad-ea87f283a2d5" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
           <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg mr-3 shadow-md" data-unique-id="4305ea94-0aca-4689-891b-2f77caa4705d" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
             <Calendar className="h-6 w-6 text-white" data-unique-id="eecdc2a3-dc15-407c-9eff-a9f6410520f0" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" />
           </div>
           <div data-unique-id="26ca4040-3b52-494f-90ee-2a724cb10ca5" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
             <h2 className="text-xl font-semibold" data-unique-id="462041dd-31b6-4f2d-8393-6ce4440d95d1" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="e96da9c0-080c-4e96-9b35-80c2b494e7ef" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">Bulan : </span>{format(currentDate, "MMMM yyyy", {
                locale: id
              })}</h2>
             <p className="text-xs text-gray-500" data-unique-id="6ef66846-88ab-44a4-8779-9af5226e2c47" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">{teacherCount}<span className="editable-text" data-unique-id="ac5a7d9a-8aa4-4691-ac9b-db9e6aa541f6" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"> Guru & Tendik</span></p>
           </div>
         </motion.div>

         <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end" data-unique-id="2db70888-ceca-4ed4-81a6-3fd9d57f2ad1" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
           <button onClick={handlePrevMonth} className="p-2 rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center" data-unique-id="648057df-e327-4baa-9146-b3d04ac8174e" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
             <ChevronLeft size={20} className="text-blue-600" />
           </button>
           <button onClick={handleNextMonth} className="p-2 rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center" data-unique-id="cddc334b-3fe6-4e63-8c30-195d954eecc9" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
             <ChevronRight size={20} className="text-blue-600" />
           </button>
         </div>
       </div>

       {/* Attendance Summary Cards */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" data-unique-id="0ee76974-693b-47ab-8ae2-26485924955b" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">
         {attendanceData.map((item, index) => <motion.div key={item.type} className={`${item.color.split(" ")[0]} p-4 rounded-xl shadow-sm border border-${item.color.split(" ")[0].replace('bg-', '')}-200`} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3,
          delay: index * 0.1
        }} data-unique-id="e4dce43c-aa57-448c-9f36-1868942f601f" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
             <h3 className="text-sm font-medium text-gray-700 mb-1" data-unique-id="322df4d6-2fc2-43e1-b13e-74a5ba1ba7c5" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">{item.type}</h3>
             <div className="flex justify-between items-end" data-unique-id="68c490e9-045c-4540-8c5b-ccb176a28947" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
               <p className="text-3xl font-bold text-blue-700" data-unique-id="d861a948-c64d-4032-8037-4acde48846ea" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">
                 {loading ? <span className="animate-pulse bg-gray-200 block h-8 w-16 rounded" data-unique-id="a94370e7-1863-4afb-a2a8-921c1571fcd0" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"></span> : `${item.value}%`}
               </p>
               <span className="text-sm text-gray-500" data-unique-id="69b30021-eb25-4512-965e-3caa69a7580a" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">{item.count}<span className="editable-text" data-unique-id="a1c3d653-30f6-46cc-a4d2-8dbbe03dfa79" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"> kejadian</span></span>
             </div>
           </motion.div>)}
       </div>

       {/* School Information and Table */}
       <div className="bg-gradient-to-b from-white to-blue-50 border border-blue-200 rounded-lg overflow-hidden shadow-md" data-unique-id="1fdfd3a5-6e22-4003-936a-1b90f43b4ff2" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">
          <div className="text-center p-4" data-unique-id="d2aebb81-690d-43ff-9d1d-66d2f2b0f7de" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
            <h2 className="text-gray-700 sm:text-xl font-bold uppercase" data-unique-id="0d2d79c9-249e-4dcc-babc-b9c82b2d768e" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">{schoolInfo.name}</h2>
            <p className="text-gray-700 font-medium" data-unique-id="81d3d087-0478-46c5-be26-fc1fbd172349" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">{schoolInfo.address}</p>
            <p className="text-gray-700 font-medium" data-unique-id="767f35f1-e57a-415d-9bb1-f7988b2a3cbe" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="188e5229-c071-4f6c-bd90-c78e7ea5980e" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">NPSN : </span>{schoolInfo.npsn}</p>
          </div>
          <hr className="border-t border-blue-200 mt-1 mb-3" data-unique-id="c068bd5e-15a3-4f7a-9736-1799f12d01fa" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" />
          <div className="text-center mb-4" data-unique-id="b9e65b3e-0083-4b9d-94a5-42b1e460e7ab" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
            <h3 className="text-gray-700 uppercase font-bold" data-unique-id="3e174e63-f38c-44ec-ab97-c1368867cce7" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="5129cc1f-e3bb-4940-912e-fcd634f8b981" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">REKAP LAPORAN KEHADIRAN GURU DAN TENDIK</span></h3>
            <p className="text-gray-700" data-unique-id="4be268e5-f9bb-4905-9228-5b853dff7e4e" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="17ac5d53-f22f-4055-b47d-73160203908f" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">BULAN </span>{format(currentDate, "MMMM yyyy", {
              locale: id
            }).toUpperCase()}</p>
          </div>

         {error && <div className="p-4 mb-4 text-center" data-unique-id="3ffcaf83-e5f4-441b-bf0b-30be14a404f5" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
             <div className="flex items-center justify-center gap-2 text-red-600 mb-2" data-unique-id="41a4ca54-31f6-4d78-a3ce-a7ddf4f6b18f" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
               <AlertCircle size={20} />
               <p className="font-medium" data-unique-id="9edc0fc2-6acc-43bf-bf2f-475a5f6d2c77" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">{error}</p>
             </div>
           </div>}

         {loading ? <div className="flex justify-center items-center h-64" data-unique-id="30b71fe6-6751-4898-a2f5-d4e893f23a58" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
             <Loader2 className="h-12 w-12 text-primary animate-spin" />
           </div> : <div className="overflow-x-auto" data-unique-id="b52e1ce0-b83d-4bfd-b1a2-8dfbacdbefba" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
             <table className="min-w-full border" data-unique-id="16e1f0a5-9b28-4f46-9be0-7ceff385b8fb" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
               <thead data-unique-id="a74f9480-6715-4f7f-a795-b19d0b1eae28" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
                 <tr className="bg-gradient-to-r from-blue-100 to-indigo-100" data-unique-id="21ba3983-1f68-4a79-896e-3bf4d9f2f2d3" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
                   <th className="border px-2 py-2 text-center text-sm font-bold text-gray-700" data-unique-id="1f766637-4757-47fc-897d-8f33b989a24c" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="b6465328-7ad2-4119-9b5e-008b9386a81f" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">Nama</span></th>
                   <th className="border px-2 py-2 text-center text-sm font-bold text-gray-700" data-unique-id="47d9ccb6-1fb3-49e4-8e25-4cf4e06b51ca" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="9512c729-946b-4015-925b-66159a91656d" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">NIK</span></th>
                   <th className="border px-2 py-2 text-center text-sm font-bold text-gray-700" data-unique-id="1fd5d41c-f5e9-4bdc-b323-2d311c905a79" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="1b7132b8-86fd-431f-8d38-2e6271be10e9" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">Jabatan</span></th>
                   <th className="border px-2 py-2 text-center text-sm font-bold text-gray-700" data-unique-id="8568feaa-8b52-4f5f-8434-609fc038b7d2" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="f6cb0ed0-ca72-4076-aaa9-33030f006f8c" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">Hadir</span></th>
                   <th className="border px-2 py-2 text-center text-sm font-bold text-gray-700" data-unique-id="ded02c9d-dd2d-4142-9b47-27f8f2eb411e" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="be083fd2-294e-46c2-ba07-c611ebe25655" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">Terlambat</span></th>
                   <th className="border px-2 py-2 text-center text-sm font-bold text-gray-700" data-unique-id="975ad657-29e8-4a52-9eb1-1473c25a686f" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="a15dbe52-0b0d-47b5-963b-a5ffa2aa425a" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">Izin</span></th>
                   <th className="border px-2 py-2 text-center text-sm font-bold text-gray-700" data-unique-id="715217f9-a0d4-434b-bf6d-9681b472a3ff" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="6fdac502-a471-49fb-ab4a-4d942af4258a" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">Alpha</span></th>
                   <th className="border px-2 py-2 text-center text-sm font-bold text-gray-700" data-unique-id="061b3d13-a2d3-450d-9d17-459a2c52212d" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="87428419-fee9-4814-aca2-03022d7d5d9a" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">Total</span></th>
                 </tr>
               </thead>
               <tbody data-unique-id="b495893b-dbba-4e40-83be-586d5497ae6f" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">
                 {filteredTeachers.length > 0 ? filteredTeachers.map((teacher, index) => <motion.tr key={teacher.id} className={index % 2 === 0 ? "bg-white" : "bg-blue-50"} initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.2,
                delay: index * 0.03
              }} data-unique-id="29fd6051-f75c-4c8d-aaf5-224fb16ce67e" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
                       <td className="text-gray-600 border px-2 py-1.5 text-xs sm:text-sm font-medium" data-unique-id="3bbf05ce-7d5b-48bd-8601-ef1d5af59de0" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">{teacher.name}</td>
                       <td className="text-gray-600 border px-2 py-1.5 text-xs sm:text-sm text-center" data-unique-id="c443bed6-ddfd-4655-be50-8f7e97fe7ba0" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">{teacher.nik || "-"}</td>
                       <td className="text-gray-600 border px-2 py-1.5 text-xs sm:text-sm text-center" data-unique-id="2fcf4c6c-39a9-452c-b22f-0a5c060fbc6d" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">
                         {teacher.role === 'teacher' ? 'Guru' : 'Tendik'}
                       </td>
                       <td className="text-gray-600 border px-2 py-1.5 text-xs sm:text-sm text-center" data-unique-id="0243ba93-c9ac-42fb-9458-f0413f5987e6" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">{teacher.hadir || 0}</td>
                       <td className="text-gray-600 border px-2 py-1.5 text-xs sm:text-sm text-center" data-unique-id="9bbc466b-3351-4e28-acd3-4865e0ea46d7" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">{teacher.terlambat || 0}</td>
                       <td className="text-gray-600 border px-2 py-1.5 text-xs sm:text-sm text-center" data-unique-id="00b0d6c6-8052-47be-9e5a-58c59abdd3b6" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">{teacher.izin || 0}</td>
                       <td className="text-gray-600 border px-2 py-1.5 text-xs sm:text-sm text-center" data-unique-id="89383580-c682-4bab-88cf-325355bfa8ec" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">{teacher.alpha || 0}</td>
                       <td className="text-gray-600 border px-2 py-1.5 text-xs sm:text-sm text-center font-medium" data-unique-id="311aa5ba-1422-4109-a5d5-1405b661a60a" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">
                         {(teacher.hadir || 0) + (teacher.terlambat || 0) + (teacher.izin || 0) + (teacher.alpha || 0)}
                       </td>
                     </motion.tr>) : <tr data-unique-id="3d0cc4ce-a187-49e5-9fe8-87836df96448" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
                     <td colSpan={8} className="border px-4 py-8 text-center text-gray-500" data-unique-id="c1425e29-5821-47fd-83e5-20812eb73c29" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
                       <div className="flex flex-col items-center justify-center gap-2" data-unique-id="15e8d478-9bfa-4776-9b92-c08ca1167c99" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
                         <AlertCircle size={24} className="text-blue-400" />
                         <span className="editable-text" data-unique-id="29d63ef2-c9ee-4c7d-baf7-c076401bb62d" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">Tidak ada data kehadiran yang ditemukan</span>
                       </div>
                     </td>
                   </tr>}

                 {/* Total row */}
                 {filteredTeachers.length > 0 && <tr className="bg-gradient-to-r from-blue-200 to-indigo-200 font-medium" data-unique-id="a56d765e-e6ab-45f1-b999-c4b29121cce6" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
                     <td colSpan={3} className="border px-2 py-2.5 font-bold text-sm text-center" data-unique-id="ef479f61-2182-47ed-8ae1-61a412449fb9" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="840d2628-1f5f-4548-9282-8a18b85baaef" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">TOTAL</span></td>
                     <td className="border px-2 py-2.5 text-center font-bold text-sm" data-unique-id="a08964b0-3bfc-41bf-bf0a-49f2e2229a52" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">
                       {filteredTeachers.reduce((sum, teacher) => sum + (teacher.hadir || 0), 0)}
                     </td>
                     <td className="border px-2 py-2.5 text-center font-bold text-sm" data-unique-id="1be35504-8259-4e96-b978-1281bed993a0" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">
                       {filteredTeachers.reduce((sum, teacher) => sum + (teacher.terlambat || 0), 0)}
                     </td>
                     <td className="border px-2 py-2.5 text-center font-bold text-sm" data-unique-id="8d61bb2b-3c50-45d2-9c1a-36d9acbcee2c" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">
                       {filteredTeachers.reduce((sum, teacher) => sum + (teacher.izin || 0), 0)}
                     </td>
                     <td className="border px-2 py-2.5 text-center font-bold text-sm" data-unique-id="8ca68da7-d094-4b05-8be4-dabb6b178e5b" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">
                       {filteredTeachers.reduce((sum, teacher) => sum + (teacher.alpha || 0), 0)}
                     </td>
                     <td className="border px-2 py-2.5 text-center font-bold text-sm" data-unique-id="e2e3791c-565d-429e-bcb1-9834fa7b0564" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">
                       {filteredTeachers.reduce((sum, teacher) => sum + ((teacher.hadir || 0) + (teacher.terlambat || 0) + (teacher.izin || 0) + (teacher.alpha || 0)), 0)}
                     </td>
                   </tr>}
               </tbody>
             </table>
           </div>}
       </div>
     </div>

     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-20 md:mb-6" data-unique-id="0bb66a96-1316-4118-9ac8-496ec5eb44fb" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">
       <motion.button onClick={handleDownloadPDF} disabled={isDownloading || loading} className="flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed" whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }} data-unique-id="ac598b6b-18a0-4ebd-853f-bbc4d84ed367" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">
         {isDownloading ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileText className="h-6 w-6" />}
         <span className="font-medium" data-unique-id="2de00833-8f7d-40e8-a7bf-b03b0eed1007" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="f73d1761-725e-49ed-ad65-ab1c38a76a0f" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">Download Laporan PDF</span></span>
       </motion.button>

       <motion.button onClick={handleDownloadExcel} disabled={isDownloading || loading} className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed" whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }} data-unique-id="5da75df8-6e0c-4609-b481-8844a1a39d4b" data-file-name="app/dashboard/absensi-guru/reports/page.tsx" data-dynamic-text="true">
         {isDownloading ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileSpreadsheet className="h-6 w-6" />}
         <span className="font-medium" data-unique-id="64815172-c52f-442b-b8d3-c5e865baabe6" data-file-name="app/dashboard/absensi-guru/reports/page.tsx"><span className="editable-text" data-unique-id="2c91d6fb-29d5-4cff-83a6-bd5a8c2dfc75" data-file-name="app/dashboard/absensi-guru/reports/page.tsx">Download Laporan Excel</span></span>
       </motion.button>
     </div>
   </div>;
}
