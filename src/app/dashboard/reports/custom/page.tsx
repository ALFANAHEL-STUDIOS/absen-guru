"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Calendar, Download, FileText, Filter, Loader2, Users, BookOpen, User, ChevronDown, Check, BarChart2, PieChart, Settings, X } from "lucide-react";
import Link from "next/link";
import { format, subDays, subMonths, isValid, parse } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "react-hot-toast";
import { jsPDF } from "jspdf";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsInternalPieChart, Pie, Cell, LineChart, Line } from "recharts";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Types
interface Student {
  id: string;
  name: string;
  nisn: string;
  class: string;
  gender: string;
}
interface Class {
  id: string;
  name: string;
  level: string;
  teacherName: string;
}
interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  date: string;
  time: string;
  status: string;
  note?: string;
}
interface ReportOptions {
  title: string;
  dateRange: {
    start: string;
    end: string;
  };
  filters: {
    classes: string[];
    students: string[];
    statuses: string[];
  };
  showCharts: boolean;
  showDetails: boolean;
  orientation: "portrait" | "landscape";
  pageSize: "a4" | "letter";
  className?: string;
  teacherName?: string;
  students?: any[];
}

// Predefined date ranges
const DATE_RANGES = [{
  label: "Hari Ini",
  getValue: () => {
    const today = format(new Date(), "yyyy-MM-dd");
    return {
      start: today,
      end: today
    };
  }
}, {
  label: "7 Hari Terakhir",
  getValue: () => {
    const end = format(new Date(), "yyyy-MM-dd");
    const start = format(subDays(new Date(), 6), "yyyy-MM-dd");
    return {
      start,
      end
    };
  }
}, {
  label: "30 Hari Terakhir",
  getValue: () => {
    const end = format(new Date(), "yyyy-MM-dd");
    const start = format(subDays(new Date(), 29), "yyyy-MM-dd");
    return {
      start,
      end
    };
  }
}, {
  label: "Bulan Ini",
  getValue: () => {
    const now = new Date();
    const start = format(new Date(now.getFullYear(), now.getMonth(), 1), "yyyy-MM-dd");
    const end = format(new Date(), "yyyy-MM-dd");
    return {
      start,
      end
    };
  }
}, {
  label: "Bulan Lalu",
  getValue: () => {
    const now = new Date();
    const start = format(new Date(now.getFullYear(), now.getMonth() - 1, 1), "yyyy-MM-dd");
    const end = format(new Date(now.getFullYear(), now.getMonth(), 0), "yyyy-MM-dd");
    return {
      start,
      end
    };
  }
}];

// Status options with colors
const STATUS_OPTIONS = [{
  value: "hadir",
  label: "Hadir",
  color: "#4C6FFF"
}, {
  value: "sakit",
  label: "Sakit",
  color: "#FF9800"
}, {
  value: "izin",
  label: "Izin",
  color: "#8BC34A"
}, {
  value: "alpha",
  label: "Alpha",
  color: "#F44336"
}];
export default function CustomReportGenerator() {
  const {
    schoolId,
    userRole
  } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);

  // UI state
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);

  // Report options
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    title: "Laporan Kehadiran",
    dateRange: {
      start: format(subDays(new Date(), 29), "yyyy-MM-dd"),
      end: format(new Date(), "yyyy-MM-dd")
    },
    filters: {
      classes: [],
      students: [],
      statuses: ["hadir", "sakit", "izin", "alpha"]
    },
    showCharts: true,
    showDetails: true,
    orientation: "portrait",
    pageSize: "a4"
  });

  // Fetch classes and students on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!schoolId) return;
      setLoading(true);
      try {
        // Fetch classes
        const classesRef = collection(db, `schools/${schoolId}/classes`);
        const classesQuery = query(classesRef, orderBy("name"));
        const classesSnapshot = await getDocs(classesQuery);
        const fetchedClasses: Class[] = [];
        classesSnapshot.forEach(doc => {
          fetchedClasses.push({
            id: doc.id,
            name: doc.data().name || "",
            level: doc.data().level || "",
            teacherName: doc.data().teacherName || ""
          });
        });
        setClasses(fetchedClasses);

        // Fetch students
        const studentsRef = collection(db, `schools/${schoolId}/students`);
        const studentsQuery = query(studentsRef, orderBy("name"));
        const studentsSnapshot = await getDocs(studentsQuery);
        const fetchedStudents: Student[] = [];
        studentsSnapshot.forEach(doc => {
          fetchedStudents.push({
            id: doc.id,
            name: doc.data().name || "",
            nisn: doc.data().nisn || "",
            class: doc.data().class || "",
            gender: doc.data().gender || ""
          });
        });
        setStudents(fetchedStudents);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Gagal mengambil data kelas dan siswa");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [schoolId]);

  // Fetch attendance data when filters change
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!schoolId) return;
      setLoading(true);
      try {
        const {
          start,
          end
        } = reportOptions.dateRange;
        const {
          classes: selectedClasses,
          students: selectedStudents,
          statuses
        } = reportOptions.filters;
        const attendanceRef = collection(db, `schools/${schoolId}/attendance`);

        // Build query based on filters
        let attendanceQuery = query(attendanceRef, where("date", ">=", start), where("date", "<=", end), orderBy("date", "desc"));
        const snapshot = await getDocs(attendanceQuery);
        let records: AttendanceRecord[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();

          // Apply client-side filtering for classes, students, and statuses
          const matchesClass = selectedClasses.length === 0 || selectedClasses.includes(data.class);
          const matchesStudent = selectedStudents.length === 0 || selectedStudents.includes(data.studentId);
          const matchesStatus = statuses.length === 0 || statuses.includes(data.status);
          if (matchesClass && matchesStudent && matchesStatus) {
            records.push({
              id: doc.id,
              studentId: data.studentId || "",
              studentName: data.studentName || "",
              class: data.class || "",
              date: data.date || "",
              time: data.time || "",
              status: data.status || "",
              note: data.note || ""
            });
          }
        });
        setAttendanceData(records);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        toast.error("Gagal mengambil data kehadiran");
      } finally {
        setLoading(false);
      }
    };
    fetchAttendanceData();
  }, [schoolId, reportOptions.dateRange, reportOptions.filters]);

  // Handle date range selection
  const handleDateRangeSelect = (range: {
    start: string;
    end: string;
  }) => {
    setReportOptions({
      ...reportOptions,
      dateRange: range
    });
  };

  // Handle class selection
  const handleClassToggle = (classId: string) => {
    const currentClasses = [...reportOptions.filters.classes];
    const index = currentClasses.indexOf(classId);
    if (index === -1) {
      currentClasses.push(classId);
    } else {
      currentClasses.splice(index, 1);
    }
    setReportOptions({
      ...reportOptions,
      filters: {
        ...reportOptions.filters,
        classes: currentClasses
      }
    });
  };

  // Handle student selection
  const handleStudentToggle = (studentId: string) => {
    const currentStudents = [...reportOptions.filters.students];
    const index = currentStudents.indexOf(studentId);
    if (index === -1) {
      currentStudents.push(studentId);
    } else {
      currentStudents.splice(index, 1);
    }
    setReportOptions({
      ...reportOptions,
      filters: {
        ...reportOptions.filters,
        students: currentStudents
      }
    });
  };

  // Handle status selection
  const handleStatusToggle = (status: string) => {
    const currentStatuses = [...reportOptions.filters.statuses];
    const index = currentStatuses.indexOf(status);
    if (index === -1) {
      currentStatuses.push(status);
    } else {
      currentStatuses.splice(index, 1);
    }
    setReportOptions({
      ...reportOptions,
      filters: {
        ...reportOptions.filters,
        statuses: currentStatuses
      }
    });
  };

  // Calculate attendance statistics
  const attendanceStats = useMemo(() => {
    const stats = {
      hadir: 0,
      sakit: 0,
      izin: 0,
      alpha: 0,
      total: attendanceData.length
    };
    attendanceData.forEach(record => {
      if (record.status === "hadir" || record.status === "present") stats.hadir++;else if (record.status === "sakit" || record.status === "sick") stats.sakit++;else if (record.status === "izin" || record.status === "permitted") stats.izin++;else if (record.status === "alpha" || record.status === "absent") stats.alpha++;
    });
    return stats;
  }, [attendanceData]);

  // Prepare chart data
  const pieChartData = useMemo(() => {
    return [{
      name: "Hadir",
      value: attendanceStats.hadir,
      color: "#4C6FFF"
    }, {
      name: "Sakit",
      value: attendanceStats.sakit,
      color: "#FF9800"
    }, {
      name: "Izin",
      value: attendanceStats.izin,
      color: "#8BC34A"
    }, {
      name: "Alpha",
      value: attendanceStats.alpha,
      color: "#F44336"
    }].filter(item => item.value > 0);
  }, [attendanceStats]);

  // Prepare daily attendance data for bar chart
  const dailyAttendanceData = useMemo(() => {
    const dailyData: Record<string, {
      date: string;
      hadir: number;
      sakit: number;
      izin: number;
      alpha: number;
    }> = {};
    attendanceData.forEach(record => {
      if (!dailyData[record.date]) {
        dailyData[record.date] = {
          date: record.date,
          hadir: 0,
          sakit: 0,
          izin: 0,
          alpha: 0
        };
      }
      if (record.status === "hadir" || record.status === "present") dailyData[record.date].hadir++;else if (record.status === "sakit" || record.status === "sick") dailyData[record.date].sakit++;else if (record.status === "izin" || record.status === "permitted") dailyData[record.date].izin++;else if (record.status === "alpha" || record.status === "absent") dailyData[record.date].alpha++;
    });
    return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
  }, [attendanceData]);

  // Generate PDF report
  // Define mock school info for the report
  const schoolInfo = {
    name: "Nama Sekolah",
    address: "Alamat Sekolah",
    npsn: "12345678",
    principalName: "Kepala Sekolah",
    principalNip: "NIP.12345"
  };
  const generatePDF = async () => {
    setGenerating(true);
    try {
      // Create new PDF document
      const doc = new jsPDF({
        orientation: reportOptions.orientation,
        unit: "mm",
        format: reportOptions.pageSize
      });

      // Get page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;

      // Set font
      doc.setFont("helvetica");

      // Add school header
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
      doc.text(`NPSN: ${schoolInfo.npsn}`, pageWidth / 2, margin + 12, {
        align: "center"
      });

      // Add horizontal line
      doc.setLineWidth(0.5);
      doc.line(margin, margin + 15, pageWidth - margin, margin + 15);

      // Add report title
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("REKAP LAPORAN KEHADIRAN SISWA", pageWidth / 2, margin + 25, {
        align: "center"
      });

      // Add date range/class info
      doc.setFontSize(12);
      const startDate = format(new Date(reportOptions.dateRange.start), "d MMMM yyyy", {
        locale: id
      });
      const endDate = format(new Date(reportOptions.dateRange.end), "d MMMM yyyy", {
        locale: id
      });
      doc.text(`KELAS : "${reportOptions.className || 'SEMUA KELAS'}"`, pageWidth / 2, margin + 32, {
        align: "center"
      });
      doc.text(`BULAN : "${format(new Date(reportOptions.dateRange.start), "MMMM yyyy", {
        locale: id
      }).toUpperCase()}"`, pageWidth / 2, margin + 39, {
        align: "center"
      });

      // Add filter information
      let yPos = margin + 20;
      doc.setFontSize(10);
      if (reportOptions.filters.classes.length > 0) {
        const selectedClassNames = reportOptions.filters.classes.map(id => {
          const classObj = classes.find(c => c.id === id);
          return classObj ? classObj.name : id;
        }).join(", ");
        doc.text(`Kelas: ${selectedClassNames}`, margin, yPos);
        yPos += 5;
      }
      if (reportOptions.filters.students.length > 0) {
        const selectedStudentNames = reportOptions.filters.students.map(id => {
          const studentObj = students.find(s => s.id === id);
          return studentObj ? studentObj.name : id;
        }).join(", ");
        doc.text(`Siswa: ${selectedStudentNames}`, margin, yPos);
        yPos += 5;
      }

      // Add statistics
      yPos += 5;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Statistik Kehadiran", margin, yPos);
      yPos += 7;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Catatan: ${attendanceStats.total}`, margin, yPos);
      yPos += 5;
      const total = attendanceStats.total || 1; // Prevent division by zero
      doc.text(`Hadir: ${attendanceStats.hadir} (${Math.round(attendanceStats.hadir / total * 100)}%)`, margin, yPos);
      yPos += 5;
      doc.text(`Sakit: ${attendanceStats.sakit} (${Math.round(attendanceStats.sakit / total * 100)}%)`, margin, yPos);
      yPos += 5;
      doc.text(`Izin: ${attendanceStats.izin} (${Math.round(attendanceStats.izin / total * 100)}%)`, margin, yPos);
      yPos += 5;
      doc.text(`Alpha: ${attendanceStats.alpha} (${Math.round(attendanceStats.alpha / total * 100)}%)`, margin, yPos);
      yPos += 10;

      // Add charts if enabled
      if (reportOptions.showCharts && pieChartData.length > 0) {
        // We would need to use canvas to render charts in PDF
        // For simplicity, we'll just add a placeholder text
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Grafik Kehadiran", margin, yPos);
        yPos += 7;
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text("(Grafik tidak tersedia dalam PDF)", margin, yPos);
        yPos += 15;
      }

      // Add attendance details if enabled
      if (reportOptions.showDetails && reportOptions.students && reportOptions.students.length > 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");

        // Table headers
        const headers = ["Nama Siswa", "NISN", "Kelas", "Hadir", "Sakit", "Izin", "Alpha", "Total"];
        const colWidths = [50, 25, 20, 15, 15, 15, 15, 15];
        yPos = margin + 50;

        // Green background for header
        doc.setFillColor(144, 238, 144); // Light green
        doc.rect(margin, yPos - 5, contentWidth, 7, "F");
        doc.setDrawColor(0);
        doc.rect(margin, yPos - 5, contentWidth, 7, "S"); // Border

        doc.setFontSize(9);
        doc.setTextColor(0);
        let xPos = margin;

        // Draw vertical lines and headers
        headers.forEach((header, i) => {
          if (i > 0) {
            doc.line(xPos, yPos - 5, xPos, yPos + 2);
          }
          doc.text(header, xPos + 2, yPos);
          xPos += colWidths[i];
        });
        yPos += 7;

        // Table rows for students
        doc.setFontSize(8);
        reportOptions.students.forEach((student, index) => {
          // Row background (alternating)
          if (index % 2 === 0) {
            doc.setFillColor(240, 240, 240);
            doc.rect(margin, yPos - 3, contentWidth, 7, "F");
          }

          // Draw row border
          doc.rect(margin, yPos - 3, contentWidth, 7, "S");

          // Draw cell content
          xPos = margin;
          doc.text(student.name || "", xPos + 2, yPos + 1);
          xPos += colWidths[0];

          // Draw vertical line
          doc.line(xPos, yPos - 3, xPos, yPos + 4);
          doc.text(student.nisn || "", xPos + 2, yPos + 1);
          xPos += colWidths[1];

          // Draw vertical line
          doc.line(xPos, yPos - 3, xPos, yPos + 4);
          doc.text(student.class || "", xPos + 2, yPos + 1);
          xPos += colWidths[2];

          // Draw vertical line
          doc.line(xPos, yPos - 3, xPos, yPos + 4);
          doc.text(student.hadir.toString(), xPos + 2, yPos + 1);
          xPos += colWidths[3];

          // Draw vertical line
          doc.line(xPos, yPos - 3, xPos, yPos + 4);
          doc.text(student.sakit.toString(), xPos + 2, yPos + 1);
          xPos += colWidths[4];

          // Draw vertical line
          doc.line(xPos, yPos - 3, xPos, yPos + 4);
          doc.text(student.izin.toString(), xPos + 2, yPos + 1);
          xPos += colWidths[5];

          // Draw vertical line
          doc.line(xPos, yPos - 3, xPos, yPos + 4);
          doc.text(student.alpha.toString(), xPos + 2, yPos + 1);
          xPos += colWidths[6];

          // Draw vertical line
          doc.line(xPos, yPos - 3, xPos, yPos + 4);
          doc.text(student.total.toString(), xPos + 2, yPos + 1);
          yPos += 7;

          // Add a new page if needed
          if (yPos > pageHeight - margin - 40 && index < reportOptions.students.length - 1) {
            doc.addPage();
            yPos = margin + 20;

            // Add header to new page
            doc.setFillColor(144, 238, 144); // Light green
            doc.rect(margin, yPos - 5, contentWidth, 7, "F");
            doc.rect(margin, yPos - 5, contentWidth, 7, "S"); // Border

            doc.setFontSize(9);
            xPos = margin;
            headers.forEach((header, i) => {
              if (i > 0) {
                doc.line(xPos, yPos - 5, xPos, yPos + 2);
              }
              doc.text(header, xPos + 2, yPos);
              xPos += colWidths[i];
            });
            yPos += 7;
            doc.setFontSize(8);
          }
        });

        // Remove the reference to sortedData as it's not defined and not needed
        const attendanceRecords = attendanceData.slice(0, 10);
        for (let i = 0; i < attendanceRecords.length; i++) {
          const record = attendanceRecords[i];

          // Check if we need a new page
          if (yPos > pageHeight - margin) {
            doc.addPage();
            yPos = margin + 10;

            // Add table headers to new page
            doc.setFillColor(240, 240, 240);
            doc.rect(margin, yPos - 5, contentWidth, 7, "F");
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            xPos = margin;
            headers.forEach((header, i) => {
              doc.text(header, xPos + 2, yPos);
              xPos += colWidths[i];
            });
            yPos += 5;
            doc.setFont("helvetica", "normal");
          }

          // Format date
          const formattedDate = format(new Date(record.date), "dd/MM/yyyy");

          // Get status text
          let statusText = "";
          if (record.status === "hadir" || record.status === "present") statusText = "Hadir";else if (record.status === "sakit" || record.status === "sick") statusText = "Sakit";else if (record.status === "izin" || record.status === "permitted") statusText = "Izin";else if (record.status === "alpha" || record.status === "absent") statusText = "Alpha";

          // Add alternating row background
          if (i % 2 === 0) {
            doc.setFillColor(248, 248, 248);
            doc.rect(margin, yPos - 3, contentWidth, 6, "F");
          }

          // Add row data
          xPos = margin;
          doc.text(formattedDate, xPos + 2, yPos);
          xPos += colWidths[0];

          // Truncate long names
          const displayName = record.studentName.length > 30 ? record.studentName.substring(0, 27) + "..." : record.studentName;
          doc.text(displayName, xPos + 2, yPos);
          xPos += colWidths[1];
          doc.text(record.class, xPos + 2, yPos);
          xPos += colWidths[2];
          doc.text(statusText, xPos + 2, yPos);
          xPos += colWidths[3];
          doc.text(record.time, xPos + 2, yPos);
          yPos += 6;
        }
      }

      // Add signature section
      yPos += 20;

      // Add footer
      const currentDate = format(new Date(), "d MMMM yyyy", {
        locale: id
      });
      doc.setFontSize(10);
      doc.text(`Di unduh pada: ${currentDate}`, pageWidth / 2, yPos, {
        align: "center"
      });
      yPos += 20;

      // Mengetahui section
      const signatureWidth = (pageWidth - margin * 2) / 2;
      doc.text("Mengetahui", margin + signatureWidth * 0.25, yPos, {
        align: "center"
      });
      doc.text("Wali Kelas", margin + signatureWidth * 1.75, yPos, {
        align: "center"
      });
      yPos += 5;
      doc.text("Kepala Sekolah", margin + signatureWidth * 0.25, yPos, {
        align: "center"
      });
      doc.text(`"${reportOptions.className || 'kelas'}"`, margin + signatureWidth * 1.75, yPos, {
        align: "center"
      });
      yPos += 20;
      doc.text(`"${schoolInfo.principalName || 'nama kepala sekolah'}"`, margin + signatureWidth * 0.25, yPos, {
        align: "center"
      });
      doc.text(`"${reportOptions.teacherName || 'nama wali kelas'}"`, margin + signatureWidth * 1.75, yPos, {
        align: "center"
      });
      yPos += 5;
      doc.text(`NIP. "${schoolInfo.principalNip || '...........................'}"`, margin + signatureWidth * 0.25, yPos, {
        align: "center"
      });
      doc.text("NIP. ...............................", margin + signatureWidth * 1.75, yPos, {
        align: "center"
      });

      // Save the PDF
      const fileName = `Laporan_Kehadiran_${format(new Date(), "yyyyMMdd_HHmmss")}.pdf`;
      doc.save(fileName);
      toast.success("Laporan berhasil dibuat");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Gagal membuat laporan PDF");
    } finally {
      setGenerating(false);
    }
  };
  return <div className="w-full max-w-6xl mx-auto pb-20 md:pb-6 px-3 sm:px-4 md:px-6" data-unique-id="6fd6a34d-b915-4b28-9cf1-a2e6e3b1297a" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
      <div className="flex items-center mb-6" data-unique-id="4d131478-0eb0-478f-847e-40f256f59d2d" data-file-name="app/dashboard/reports/custom/page.tsx">
        <Link href="/dashboard/reports" className="p-2 mr-2 hover:bg-gray-100 rounded-full" data-unique-id="88d7ad76-4e7d-48ff-b454-29766a5e3354" data-file-name="app/dashboard/reports/custom/page.tsx">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800" data-unique-id="ba73f634-2a07-4812-90cd-2413aef10345" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="ec5df107-c6d3-4f4c-bde3-28d50656c1f2" data-file-name="app/dashboard/reports/custom/page.tsx">Generator Laporan Kustom</span></h1>
      </div>
      
      {/* Report Options */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6" data-unique-id="d6d7c7ec-f5ad-4265-bf16-dcd8729fa9f4" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6" data-unique-id="113f9475-64bb-451d-9785-bcf0e44a2b86" data-file-name="app/dashboard/reports/custom/page.tsx">
          <div className="mb-4 md:mb-0" data-unique-id="676f267a-b20a-4f87-bbb7-6546816a76e5" data-file-name="app/dashboard/reports/custom/page.tsx">
            <h2 className="text-lg font-semibold text-gray-800" data-unique-id="6d8536fd-2a50-4762-bd07-be2cd6af14e1" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="1bc22f88-5ff1-4422-ab21-dcbd55b003f8" data-file-name="app/dashboard/reports/custom/page.tsx">Opsi Laporan</span></h2>
            <p className="text-sm text-gray-500" data-unique-id="540e5a00-b826-420f-b9c4-93668ff871cd" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="f1f46ad1-9bc8-4caf-997c-a2622ade9ede" data-file-name="app/dashboard/reports/custom/page.tsx">Sesuaikan laporan kehadiran sesuai kebutuhan Anda</span></p>
          </div>
          
          <div className="flex items-center" data-unique-id="1c509f1b-58d2-435e-8b5c-c4d5544f7ba2" data-file-name="app/dashboard/reports/custom/page.tsx">
            <button onClick={() => setShowOptionsPanel(!showOptionsPanel)} className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors" data-unique-id="a998b300-fb1c-43d2-b925-7c5a1d6efde3" data-file-name="app/dashboard/reports/custom/page.tsx">
              <Settings size={18} />
              <span data-unique-id="14ed8bc9-3d00-49ba-bf17-63fa4a900ff2" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="9c3087f2-16ef-48ea-86d5-670e51276afc" data-file-name="app/dashboard/reports/custom/page.tsx">Pengaturan Laporan</span></span>
              <ChevronDown size={16} className={`transition-transform ${showOptionsPanel ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* Advanced Options Panel */}
        <AnimatePresence>
          {showOptionsPanel && <motion.div initial={{
          height: 0,
          opacity: 0
        }} animate={{
          height: "auto",
          opacity: 1
        }} exit={{
          height: 0,
          opacity: 0
        }} transition={{
          duration: 0.3
        }} className="overflow-hidden mb-6" data-unique-id="ef6f5943-3466-4cc7-be22-afbdeb2ac8d9" data-file-name="app/dashboard/reports/custom/page.tsx">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200" data-unique-id="a8f16e31-ea73-4839-a85c-72bf909b07f4" data-file-name="app/dashboard/reports/custom/page.tsx">
                <h3 className="text-sm font-medium text-gray-700 mb-3" data-unique-id="049c64a4-e851-4f23-a812-685b04b9531f" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="5b66db3d-95ff-4bb7-88cc-fe4e9f4ac28c" data-file-name="app/dashboard/reports/custom/page.tsx">Pengaturan Laporan</span></h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-unique-id="35d54c3a-c16c-4f41-be2e-877417d51247" data-file-name="app/dashboard/reports/custom/page.tsx">
                  <div data-unique-id="59f84bc0-fc46-4f77-aa06-90b3d7193dcf" data-file-name="app/dashboard/reports/custom/page.tsx">
                    <label htmlFor="reportTitle" className="block text-xs font-medium text-gray-500 mb-1" data-unique-id="bd9d25fa-06d2-4f6a-989e-320ad94b4b1d" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="4ed04862-3735-4e97-9880-228891a18061" data-file-name="app/dashboard/reports/custom/page.tsx">
                      Judul Laporan
                    </span></label>
                    <input type="text" id="reportTitle" value={reportOptions.title} onChange={e => setReportOptions({
                  ...reportOptions,
                  title: e.target.value
                })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm" data-unique-id="935d9cb8-b3b1-4736-84c7-f90975ba0af5" data-file-name="app/dashboard/reports/custom/page.tsx" />
                  </div>
                  
                  <div data-unique-id="65f4c020-18f1-4885-b630-e80e3020a362" data-file-name="app/dashboard/reports/custom/page.tsx">
                    <label className="block text-xs font-medium text-gray-500 mb-1" data-unique-id="44e48705-c76e-4f8e-9fb8-8d24efab699c" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="928776a0-361f-4c98-9c15-faefe8cd5870" data-file-name="app/dashboard/reports/custom/page.tsx">
                      Orientasi Halaman
                    </span></label>
                    <div className="flex gap-3" data-unique-id="4495abd3-aaa7-4cc6-a2d9-98be93211aee" data-file-name="app/dashboard/reports/custom/page.tsx">
                      <label className="flex items-center" data-unique-id="0381edda-61ef-4561-b76b-86ab9ef3d3f0" data-file-name="app/dashboard/reports/custom/page.tsx">
                        <input type="radio" name="orientation" checked={reportOptions.orientation === "portrait"} onChange={() => setReportOptions({
                      ...reportOptions,
                      orientation: "portrait"
                    })} className="mr-2" data-unique-id="9152e6e3-c069-4b59-9ebc-bc7ab3b8b6fc" data-file-name="app/dashboard/reports/custom/page.tsx" />
                        <span className="text-sm" data-unique-id="93e16cbf-c9d7-4d80-9025-b1fd7ddd63a8" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="836a3324-f7b5-40e6-b92b-34add0582ec6" data-file-name="app/dashboard/reports/custom/page.tsx">Potrait</span></span>
                      </label>
                      <label className="flex items-center" data-unique-id="44fc5f8a-4a69-46dc-a4d2-f2bf82c6f9ae" data-file-name="app/dashboard/reports/custom/page.tsx">
                        <input type="radio" name="orientation" checked={reportOptions.orientation === "landscape"} onChange={() => setReportOptions({
                      ...reportOptions,
                      orientation: "landscape"
                    })} className="mr-2" data-unique-id="670bfffd-9cbc-43f4-87ba-069416076082" data-file-name="app/dashboard/reports/custom/page.tsx" />
                        <span className="text-sm" data-unique-id="36bfa711-0bcf-40a5-98a2-fb96c6607f44" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="077cac2c-6b79-45e4-b174-de5425495fbf" data-file-name="app/dashboard/reports/custom/page.tsx">Landscape</span></span>
                      </label>
                    </div>
                  </div>
                  
                  <div data-unique-id="41628b04-eceb-4002-9365-695b6341d840" data-file-name="app/dashboard/reports/custom/page.tsx">
                    <label className="block text-xs font-medium text-gray-500 mb-1" data-unique-id="91ab5385-98bc-471d-bb6f-206650a1af7e" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="16781c8f-d47e-4592-884f-a20f982c68c9" data-file-name="app/dashboard/reports/custom/page.tsx">
                      Ukuran Kertas
                    </span></label>
                    <div className="flex gap-3" data-unique-id="f7d63243-a28d-41c7-a2b9-88800d369297" data-file-name="app/dashboard/reports/custom/page.tsx">
                      <label className="flex items-center" data-unique-id="a7f376f5-c334-41e7-a25c-9eb75a18c342" data-file-name="app/dashboard/reports/custom/page.tsx">
                        <input type="radio" name="pageSize" checked={reportOptions.pageSize === "a4"} onChange={() => setReportOptions({
                      ...reportOptions,
                      pageSize: "a4"
                    })} className="mr-2" data-unique-id="8347f1ec-3e00-4d69-aa38-ba655c9d72e4" data-file-name="app/dashboard/reports/custom/page.tsx" />
                        <span className="text-sm" data-unique-id="b1201574-e54b-4f08-b9bc-5148f6e5def0" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="20668906-6c35-4e8f-bd61-bc870b820761" data-file-name="app/dashboard/reports/custom/page.tsx">A4</span></span>
                      </label>
                      <label className="flex items-center" data-unique-id="6b4852d5-b9af-43a9-8d0e-b59b2f089ce6" data-file-name="app/dashboard/reports/custom/page.tsx">
                        <input type="radio" name="pageSize" checked={reportOptions.pageSize === "letter"} onChange={() => setReportOptions({
                      ...reportOptions,
                      pageSize: "letter"
                    })} className="mr-2" data-unique-id="b6839b09-abc0-4fb1-93a8-e93d0adf2094" data-file-name="app/dashboard/reports/custom/page.tsx" />
                        <span className="text-sm" data-unique-id="44b69ec2-8b41-4e6d-a6c2-2ac49e4ffa76" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="db766d20-65d5-4b15-87e3-7bd67312cf6c" data-file-name="app/dashboard/reports/custom/page.tsx">Letter</span></span>
                      </label>
                    </div>
                  </div>
                  
                  <div data-unique-id="bdc8a748-50e1-4f33-a70c-9c1947804498" data-file-name="app/dashboard/reports/custom/page.tsx">
                    <label className="block text-xs font-medium text-gray-500 mb-1" data-unique-id="73f59978-a5ac-4091-8743-ed73b5b28415" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="5034718f-0e3b-4a41-9764-b590e59a52a9" data-file-name="app/dashboard/reports/custom/page.tsx">
                      Konten Laporan
                    </span></label>
                    <div className="flex flex-col gap-2" data-unique-id="b896ccf6-5ac7-44af-bbf4-f9062532641f" data-file-name="app/dashboard/reports/custom/page.tsx">
                      <label className="flex items-center" data-unique-id="8183706a-c612-41a8-880f-03af60cf54f2" data-file-name="app/dashboard/reports/custom/page.tsx">
                        <input type="checkbox" checked={reportOptions.showCharts} onChange={() => setReportOptions({
                      ...reportOptions,
                      showCharts: !reportOptions.showCharts
                    })} className="mr-2" data-unique-id="718e1398-5add-418e-982b-b6f21381915e" data-file-name="app/dashboard/reports/custom/page.tsx" />
                        <span className="text-sm" data-unique-id="29c8a7e9-46cd-4ada-98cc-6dac5c0e1398" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="767c7026-5b38-4123-9436-dec577b769f1" data-file-name="app/dashboard/reports/custom/page.tsx">Tampilkan Grafik</span></span>
                      </label>
                      <label className="flex items-center" data-unique-id="279b6361-087d-4b95-b433-d9360d674cde" data-file-name="app/dashboard/reports/custom/page.tsx">
                        <input type="checkbox" checked={reportOptions.showDetails} onChange={() => setReportOptions({
                      ...reportOptions,
                      showDetails: !reportOptions.showDetails
                    })} className="mr-2" data-unique-id="a6af24f6-629c-4c80-ba5a-e962a9e95ea8" data-file-name="app/dashboard/reports/custom/page.tsx" />
                        <span className="text-sm" data-unique-id="4fb5d924-e3a5-4f2f-964c-bb0aa20e1eb8" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="f3e208e6-406f-4b12-a931-5ee3548dd742" data-file-name="app/dashboard/reports/custom/page.tsx">Tampilkan Detail Kehadiran</span></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>}
        </AnimatePresence>
        
        {/* Date Range Selection */}
        <div className="mb-6" data-unique-id="eea2e316-7b63-4368-98fa-56b348d63880" data-file-name="app/dashboard/reports/custom/page.tsx">
          <h3 className="text-sm font-medium text-gray-700 mb-3" data-unique-id="2852b9de-24b0-4af5-b401-51630307e38a" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="7a77158d-58d0-455e-a56b-663d0e65afc3" data-file-name="app/dashboard/reports/custom/page.tsx">Rentang Tanggal</span></h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" data-unique-id="2d6688b8-6f02-42e4-aec6-43c287618c43" data-file-name="app/dashboard/reports/custom/page.tsx">
            <div data-unique-id="5bb074ab-0dc0-49c9-a957-b390714edc0e" data-file-name="app/dashboard/reports/custom/page.tsx">
              <label htmlFor="startDate" className="block text-xs font-medium text-gray-500 mb-1" data-unique-id="7c01d349-172e-4def-9a88-3dd99948ac07" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="ee6abe32-39e0-4ef0-b85a-93ccd8bc1aee" data-file-name="app/dashboard/reports/custom/page.tsx">
                Tanggal Mulai
              </span></label>
              <input type="date" id="startDate" value={reportOptions.dateRange.start} onChange={e => setReportOptions({
              ...reportOptions,
              dateRange: {
                ...reportOptions.dateRange,
                start: e.target.value
              }
            })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" data-unique-id="08cdadd8-3c4b-4a32-8f07-d67857b5d2d2" data-file-name="app/dashboard/reports/custom/page.tsx" />
            </div>
            
            <div data-unique-id="5a5eff66-9472-423d-87f3-6e6c24eb28b1" data-file-name="app/dashboard/reports/custom/page.tsx">
              <label htmlFor="endDate" className="block text-xs font-medium text-gray-500 mb-1" data-unique-id="c7868cff-a19c-4800-8b23-a72e761ccad1" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="a18444fe-932d-4eed-be64-1885d827c665" data-file-name="app/dashboard/reports/custom/page.tsx">
                Tanggal Akhir
              </span></label>
              <input type="date" id="endDate" value={reportOptions.dateRange.end} onChange={e => setReportOptions({
              ...reportOptions,
              dateRange: {
                ...reportOptions.dateRange,
                end: e.target.value
              }
            })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" data-unique-id="3621aa2e-044e-4e7d-81ef-036602242c3f" data-file-name="app/dashboard/reports/custom/page.tsx" />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2" data-unique-id="dbb0b81b-41ad-4a6a-8481-ef579415143c" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
            {DATE_RANGES.map((range, index) => <button key={index} onClick={() => handleDateRangeSelect(range.getValue())} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition-colors" data-unique-id="71bc36c7-1e3c-4398-ae68-26d035cf2ed0" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
                {range.label}
              </button>)}
          </div>
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-unique-id="c3ba16e1-211a-4507-9829-65de95cc6f4d" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
          {/* Class Filter */}
          <div data-unique-id="b322d30e-0453-4e61-8ce7-6955fb9dcd32" data-file-name="app/dashboard/reports/custom/page.tsx">
            <div className="relative" data-unique-id="5aadde8f-b34e-49ed-b818-78ccd0dfd62e" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
              <label className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="e061ba63-916d-4f69-85b3-b31a62721713" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="02f435e2-bd89-4c95-89d6-56b412847a77" data-file-name="app/dashboard/reports/custom/page.tsx">
                Filter Kelas
              </span></label>
              <button onClick={() => setShowClassDropdown(!showClassDropdown)} className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white" data-unique-id="eb2d35de-e1aa-4edf-86bd-42dae022b5f2" data-file-name="app/dashboard/reports/custom/page.tsx">
                <span className="text-sm" data-unique-id="e7f39a7d-1ae7-4e80-ab63-96ccdaac098d" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
                  {reportOptions.filters.classes.length > 0 ? `${reportOptions.filters.classes.length} kelas dipilih` : "Semua Kelas"}
                </span>
                <ChevronDown size={16} className={`transition-transform ${showClassDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showClassDropdown && <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto" data-unique-id="b989f841-6e44-48d9-a239-c2066ed4d4e5" data-file-name="app/dashboard/reports/custom/page.tsx">
                  <div className="p-2" data-unique-id="f55bfc73-9e64-45f0-877f-426c7e0bc77c" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
                    {classes.length > 0 ? classes.map(cls => <div key={cls.id} className="flex items-center px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer" onClick={() => handleClassToggle(cls.id)} data-unique-id="b9bca8b8-45f1-4b86-89d3-e9a016eca88b" data-file-name="app/dashboard/reports/custom/page.tsx">
                          <div className={`w-4 h-4 border rounded flex items-center justify-center ${reportOptions.filters.classes.includes(cls.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`} data-unique-id="ca608baa-04c1-4507-9044-d7fd85e12886" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
                            {reportOptions.filters.classes.includes(cls.id) && <Check size={12} className="text-white" />}
                          </div>
                          <span className="ml-2 text-sm" data-unique-id="b54a01c3-727d-4a57-bfcc-7cebc6c06cbd" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">{cls.name}</span>
                        </div>) : <div className="px-2 py-1.5 text-sm text-gray-500" data-unique-id="6e837f49-b3e4-48e8-b8bf-1a0b80aa2718" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="d12def2f-e8f1-4d26-967f-6f54ebcc6c20" data-file-name="app/dashboard/reports/custom/page.tsx">Tidak ada kelas</span></div>}
                  </div>
                </div>}
            </div>
          </div>
          
          {/* Student Filter */}
          <div data-unique-id="40b2715d-6df0-47f7-a51c-dbc1e6003d65" data-file-name="app/dashboard/reports/custom/page.tsx">
            <div className="relative" data-unique-id="70abaa21-d55c-40d3-bba3-0214d6675dee" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
              <label className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="5a2ad049-8890-4f35-98a2-0e2269e4c8cf" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="46459e90-cc3d-4a9a-8458-79530650827a" data-file-name="app/dashboard/reports/custom/page.tsx">
                Filter Siswa
              </span></label>
              <button onClick={() => setShowStudentDropdown(!showStudentDropdown)} className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white" data-unique-id="34ac1533-3997-4f31-bc27-f44a6426fe34" data-file-name="app/dashboard/reports/custom/page.tsx">
                <span className="text-sm" data-unique-id="0749652e-cf47-4b93-9c21-0d862bc5877a" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
                  {reportOptions.filters.students.length > 0 ? `${reportOptions.filters.students.length} siswa dipilih` : "Semua Siswa"}
                </span>
                <ChevronDown size={16} className={`transition-transform ${showStudentDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showStudentDropdown && <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto" data-unique-id="c176c248-2115-4712-af99-0e82c5bb19e8" data-file-name="app/dashboard/reports/custom/page.tsx">
                  <div className="p-2" data-unique-id="f5f4930f-9dae-4d98-8eaa-452fb7c8c19a" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
                    <div className="mb-2" data-unique-id="b093d1f0-6308-4163-aa1b-c89938e4f4de" data-file-name="app/dashboard/reports/custom/page.tsx">
                      <input type="text" placeholder="Cari siswa..." className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded" data-unique-id="9cdcabe9-5d8a-47ff-b23f-dabd8ca8ea62" data-file-name="app/dashboard/reports/custom/page.tsx" />
                    </div>
                    
                    {students.length > 0 ? students.map(student => <div key={student.id} className="flex items-center px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer" onClick={() => handleStudentToggle(student.id)} data-unique-id="6264267c-de15-4dd1-931b-e5adda233fc8" data-file-name="app/dashboard/reports/custom/page.tsx">
                          <div className={`w-4 h-4 border rounded flex items-center justify-center ${reportOptions.filters.students.includes(student.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`} data-unique-id="59346113-473d-4435-a1e8-a162df79248b" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
                            {reportOptions.filters.students.includes(student.id) && <Check size={12} className="text-white" />}
                          </div>
                          <div className="ml-2 flex items-center" data-unique-id="7f1c0c18-e79b-46f2-952f-309b0c234984" data-file-name="app/dashboard/reports/custom/page.tsx">
                            <span className="text-sm" data-unique-id="e7b1a5ed-a252-47a5-8e17-c87365a20499" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">{student.name}</span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full ml-1.5" data-unique-id="51add03c-87a6-4295-8221-7926f3ae68d0" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="a76b28fe-9525-4eed-b975-0e1f94c71886" data-file-name="app/dashboard/reports/custom/page.tsx">Kelas </span>{student.class}</span>
                          </div>
                        </div>) : <div className="px-2 py-1.5 text-sm text-gray-500" data-unique-id="93117b98-a312-4efd-92cc-8c643462168d" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="3db33c87-06b4-4144-88d0-def64c804683" data-file-name="app/dashboard/reports/custom/page.tsx">Tidak ada siswa</span></div>}
                  </div>
                </div>}
            </div>
          </div>
          
          {/* Status Filter */}
          <div data-unique-id="086dedff-affc-44c4-bad1-e4faf9d6d77a" data-file-name="app/dashboard/reports/custom/page.tsx">
            <div className="relative" data-unique-id="221de8a5-2676-4a0b-8562-a4dd55d88bba" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
              <label className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="cd331004-65e1-4179-88d7-3747bc902a19" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="c9ac20d3-e3bc-4d4e-9e5b-90395dee708a" data-file-name="app/dashboard/reports/custom/page.tsx">
                Filter Status
              </span></label>
              <button onClick={() => setShowStatusDropdown(!showStatusDropdown)} className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white" data-unique-id="8404f180-c94b-4bc7-9ca9-909453ddece5" data-file-name="app/dashboard/reports/custom/page.tsx">
                <span className="text-sm" data-unique-id="a9234451-d7e7-4612-b9e6-c2108b3b9ac1" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
                  {reportOptions.filters.statuses.length > 0 ? `${reportOptions.filters.statuses.length} status dipilih` : "Semua Status"}
                </span>
                <ChevronDown size={16} className={`transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showStatusDropdown && <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg" data-unique-id="f350b8e1-5446-4d6e-a99c-cfb8cd95fb86" data-file-name="app/dashboard/reports/custom/page.tsx">
                  <div className="p-2" data-unique-id="9a15ad80-279e-4642-8a50-c12c7565812d" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
                    {STATUS_OPTIONS.map(status => <div key={status.value} className="flex items-center px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer" onClick={() => handleStatusToggle(status.value)} data-unique-id="bc8ca7d7-d735-40aa-9367-d3525f483078" data-file-name="app/dashboard/reports/custom/page.tsx">
                        <div className={`w-4 h-4 border rounded flex items-center justify-center ${reportOptions.filters.statuses.includes(status.value) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`} data-unique-id="daefc74c-65b7-48bf-806d-50b72a5bf994" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
                          {reportOptions.filters.statuses.includes(status.value) && <Check size={12} className="text-white" />}
                        </div>
                        <div className="ml-2 flex items-center" data-unique-id="35367deb-afd2-4682-a9c1-ab32a471e951" data-file-name="app/dashboard/reports/custom/page.tsx">
                          <div className="w-3 h-3 rounded-full" style={{
                      backgroundColor: status.color
                    }} data-unique-id="e67d7c1f-d272-430a-8c57-9383cf18576e" data-file-name="app/dashboard/reports/custom/page.tsx"></div>
                          <span className="ml-2 text-sm" data-unique-id="9df1018c-1480-4267-813e-91d2b2612ab4" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">{status.label}</span>
                        </div>
                      </div>)}
                  </div>
                </div>}
            </div>
          </div>
        </div>
      </div>
      
      {/* Report Preview */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6" data-unique-id="d6520a3c-47b9-4d47-8922-ae84c12c70de" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
        <div className="flex items-center justify-between mb-6" data-unique-id="a5bfa3a3-a01d-43fc-9cf0-f790538cbbe5" data-file-name="app/dashboard/reports/custom/page.tsx">
          <h2 className="text-lg font-semibold text-gray-800" data-unique-id="70391b8a-362f-4f0f-ad35-99040f8e9c14" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="a2e19b16-dbda-41fe-affd-3df50a5f2553" data-file-name="app/dashboard/reports/custom/page.tsx">Pratinjau Laporan</span></h2>
          
          <button onClick={generatePDF} disabled={generating || attendanceData.length === 0} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${generating || attendanceData.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'} transition-colors`} data-unique-id="41b6b924-08d2-4f07-b295-aa7099b08b9e" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
            {generating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            <span data-unique-id="e8e8687e-8aed-4f96-accc-4eadd386b7df" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="84869adc-9e00-4f1f-8ea1-0a858d9dccf8" data-file-name="app/dashboard/reports/custom/page.tsx">Download PDF</span></span>
          </button>
        </div>
        
        {loading ? <div className="flex justify-center items-center h-64" data-unique-id="38af275b-5eb7-4cfb-98f0-f52b89898022" data-file-name="app/dashboard/reports/custom/page.tsx">
            <Loader2 size={40} className="animate-spin text-primary" />
          </div> : attendanceData.length === 0 ? <div className="flex flex-col items-center justify-center h-64 text-center" data-unique-id="a3baf7c6-9cb6-4b2a-af47-8b30e7b223e2" data-file-name="app/dashboard/reports/custom/page.tsx">
            <FileText size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2" data-unique-id="7c8a7300-2f36-4dd9-bb58-21e8d09084c2" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="b7fa2608-c642-4a33-8c1e-4cba36a6f5c2" data-file-name="app/dashboard/reports/custom/page.tsx">Tidak ada data kehadiran</span></h3>
            <p className="text-gray-500 max-w-md" data-unique-id="d3a029e0-a9ec-43c5-a495-8084423c8520" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="a4ec79a0-4bcc-43e8-8713-7c12ec0d6b14" data-file-name="app/dashboard/reports/custom/page.tsx">
              Tidak ada data kehadiran yang ditemukan untuk filter yang dipilih.
              Coba ubah rentang tanggal atau filter lainnya.
            </span></p>
          </div> : <div data-unique-id="95bb489e-7039-4a9a-9ccb-396a27ef715e" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" data-unique-id="89a34e8a-17d6-4a23-acf5-f8a7638acdcf" data-file-name="app/dashboard/reports/custom/page.tsx">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100" data-unique-id="19833958-46b7-4b2f-99f2-caeb13aa8945" data-file-name="app/dashboard/reports/custom/page.tsx">
                <h3 className="text-xs text-blue-700 font-medium mb-1" data-unique-id="87988150-aaf7-43e1-9ac1-6d80b6bd6b9d" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="06890b7d-f5ba-4895-b43f-203dcf7c24ee" data-file-name="app/dashboard/reports/custom/page.tsx">Hadir</span></h3>
                <p className="text-2xl font-bold text-blue-700" data-unique-id="aa68fe4c-9e78-4614-8476-df7944681f0a" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
                  {attendanceStats.hadir}
                  <span className="text-sm font-normal ml-1" data-unique-id="57237b9c-7e97-4691-9e58-e4d6f9e2a772" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="042043c7-6d9e-4f16-9b71-83116235fdec" data-file-name="app/dashboard/reports/custom/page.tsx">
                    (</span>{Math.round(attendanceStats.hadir / attendanceStats.total * 100)}<span className="editable-text" data-unique-id="f83394f8-2b2a-48ac-9a51-f779bf2aa9d5" data-file-name="app/dashboard/reports/custom/page.tsx">%)
                  </span></span>
                </p>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-100" data-unique-id="0dd9be4f-accb-4aa9-b904-fcc2a30d1d90" data-file-name="app/dashboard/reports/custom/page.tsx">
                <h3 className="text-xs text-orange-700 font-medium mb-1" data-unique-id="a5ce26c6-51fb-46fd-9c15-1a35d2ff74bc" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="cd7d549e-adc4-4994-a173-2bf538b84824" data-file-name="app/dashboard/reports/custom/page.tsx">Sakit</span></h3>
                <p className="text-2xl font-bold text-orange-700" data-unique-id="ccda7a27-7ec5-4e23-b2aa-5a795ab5e2cf" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
                  {attendanceStats.sakit}
                  <span className="text-sm font-normal ml-1" data-unique-id="6f2e8eeb-eb12-4c4f-893a-7c96cb7df3d2" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="5200a45b-6861-46ac-b695-70fc2e47af43" data-file-name="app/dashboard/reports/custom/page.tsx">
                    (</span>{Math.round(attendanceStats.sakit / attendanceStats.total * 100)}<span className="editable-text" data-unique-id="97a53329-9469-4739-9a5d-50fb6baabc47" data-file-name="app/dashboard/reports/custom/page.tsx">%)
                  </span></span>
                </p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 border border-green-100" data-unique-id="8f279bfa-28be-4fad-a1a4-e21b38546095" data-file-name="app/dashboard/reports/custom/page.tsx">
                <h3 className="text-xs text-green-700 font-medium mb-1" data-unique-id="a437b913-156a-4e79-be4a-0e0eef6936fc" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="dd6ff67b-dc1d-4c48-beb4-39eef356a85d" data-file-name="app/dashboard/reports/custom/page.tsx">Izin</span></h3>
                <p className="text-2xl font-bold text-green-700" data-unique-id="467c28f5-2f79-42e0-ba5a-ddd8cb336f0e" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
                  {attendanceStats.izin}
                  <span className="text-sm font-normal ml-1" data-unique-id="13bac622-53f7-4683-999c-45e5fd24b59b" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="36de1e41-fe88-4191-bce0-53b543e0aa01" data-file-name="app/dashboard/reports/custom/page.tsx">
                    (</span>{Math.round(attendanceStats.izin / attendanceStats.total * 100)}<span className="editable-text" data-unique-id="fbac1318-d586-4f9e-9b9f-b620e6f89431" data-file-name="app/dashboard/reports/custom/page.tsx">%)
                  </span></span>
                </p>
              </div>
              
              <div className="bg-red-50 rounded-lg p-4 border border-red-100" data-unique-id="e92d5a6d-d1aa-4603-afd3-7d3c91a4e452" data-file-name="app/dashboard/reports/custom/page.tsx">
                <h3 className="text-xs text-red-700 font-medium mb-1" data-unique-id="c8331978-ecbe-4af9-b9c3-1e62840d9cab" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="4b265d63-f195-48da-b2fb-2563739f6ea1" data-file-name="app/dashboard/reports/custom/page.tsx">Alpha</span></h3>
                <p className="text-2xl font-bold text-red-700" data-unique-id="061100d2-c338-4adb-865b-614ee6c0d70a" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
                  {attendanceStats.alpha}
                  <span className="text-sm font-normal ml-1" data-unique-id="1de43973-327f-4f97-8f20-9a8f050721e2" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="5a008463-27a2-4eb9-882a-434127b086b1" data-file-name="app/dashboard/reports/custom/page.tsx">
                    (</span>{Math.round(attendanceStats.alpha / attendanceStats.total * 100)}<span className="editable-text" data-unique-id="e1367495-3d22-470c-9856-cd51b5928242" data-file-name="app/dashboard/reports/custom/page.tsx">%)
                  </span></span>
                </p>
              </div>
            </div>
            
            {/* Charts */}
            {reportOptions.showCharts && <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6" data-unique-id="e99612b6-67a7-48cd-9888-fa069e1f190a" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
                {/* Pie Chart */}
                <div className="bg-white rounded-lg border border-gray-200 p-4" data-unique-id="c3bb27f6-0349-4c9f-814e-08f272528d39" data-file-name="app/dashboard/reports/custom/page.tsx">
                  <h3 className="text-sm font-medium text-gray-700 mb-3" data-unique-id="a8c28b8c-12d1-4bf8-acc5-7992058c0108" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="24c6700c-207f-4d18-a275-2882d5dd70fc" data-file-name="app/dashboard/reports/custom/page.tsx">Distribusi Kehadiran</span></h3>
                  <div className="h-64" data-unique-id="87838b72-e635-4bda-874a-1aad825e2067" data-file-name="app/dashboard/reports/custom/page.tsx">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsInternalPieChart>
                        <Pie data={pieChartData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" label={entry => `${entry.name}: ${entry.value}`}>
                          {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} data-unique-id={`9205b48f-0e46-43cb-96f3-831550f204bb_${index}`} data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true" />)}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </RechartsInternalPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Bar Chart */}
                <div className="bg-white rounded-lg border border-gray-200 p-4" data-unique-id="4017ee49-8ff2-48b7-8bb8-a7814a3d0d01" data-file-name="app/dashboard/reports/custom/page.tsx">
                  <h3 className="text-sm font-medium text-gray-700 mb-3" data-unique-id="0a59779f-ada4-4a6d-95c4-e589673e8993" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="108d09f8-4014-4378-9fc4-3b9ed0fce5c2" data-file-name="app/dashboard/reports/custom/page.tsx">Kehadiran Harian</span></h3>
                  <div className="h-64" data-unique-id="a0a2efd7-6474-490e-b706-5482947d9d83" data-file-name="app/dashboard/reports/custom/page.tsx">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyAttendanceData} margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5
                }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="hadir" name="Hadir" fill="#4C6FFF" />
                        <Bar dataKey="sakit" name="Sakit" fill="#FF9800" />
                        <Bar dataKey="izin" name="Izin" fill="#8BC34A" />
                        <Bar dataKey="alpha" name="Alpha" fill="#F44336" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>}
            
            {/* Attendance Details */}
            {reportOptions.showDetails && <div data-unique-id="ec014853-de1a-4275-8dee-40331e8c94cd" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
                <h3 className="text-sm font-medium text-gray-700 mb-3" data-unique-id="2dfd7e1e-1742-4531-bc8c-3584db9fe332" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="f2da0d58-e4ca-4ae9-b931-6246e4acb14e" data-file-name="app/dashboard/reports/custom/page.tsx">Detail Kehadiran</span></h3>
                
                <div className="overflow-x-auto" data-unique-id="5cd3f7c8-7972-429a-8ca9-fc1efacf3d28" data-file-name="app/dashboard/reports/custom/page.tsx">
                  <table className="min-w-full divide-y divide-gray-200" data-unique-id="c910eeee-7ad4-4418-8048-12712dfa4e05" data-file-name="app/dashboard/reports/custom/page.tsx">
                    <thead className="bg-gray-50" data-unique-id="f6759f20-b07b-4d9f-9115-c59522c5e3c1" data-file-name="app/dashboard/reports/custom/page.tsx">
                      <tr data-unique-id="dd42e8f4-65a6-4135-884f-e33b2cfe765b" data-file-name="app/dashboard/reports/custom/page.tsx">
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="73af38ed-3b4f-4640-ad07-d2d6e63008c5" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="7c123093-b70c-46e6-b395-5db9d2b0c76f" data-file-name="app/dashboard/reports/custom/page.tsx">
                          Tanggal
                        </span></th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="1cd53ae6-bb26-4200-bac4-e40196a8e801" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="db76a5d2-3581-4ee8-b0fd-c1f31951712a" data-file-name="app/dashboard/reports/custom/page.tsx">
                          Nama
                        </span></th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="48db70ac-8c2e-48cd-a7ce-eb93af58d837" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="421c5c51-793a-45bf-92a1-3030c2790ae7" data-file-name="app/dashboard/reports/custom/page.tsx">
                          Kelas
                        </span></th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="d79de42c-d15e-4159-9c53-d1c5470c093b" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="dcef869f-cb7d-451c-8424-4f9ef9ddee57" data-file-name="app/dashboard/reports/custom/page.tsx">
                          Status
                        </span></th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="b6b498d6-d87a-4867-9061-6573c2261e8d" data-file-name="app/dashboard/reports/custom/page.tsx"><span className="editable-text" data-unique-id="a631848b-976e-495e-8881-c8c65597b94a" data-file-name="app/dashboard/reports/custom/page.tsx">
                          Waktu
                        </span></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200" data-unique-id="024ae9da-5798-4b9d-8fc1-17dbc0c7a968" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
                      {attendanceData.slice(0, 10).map(record => <tr key={record.id} className="hover:bg-gray-50" data-unique-id="744a960a-8364-4fa1-b98a-8009c299da10" data-file-name="app/dashboard/reports/custom/page.tsx">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-unique-id="aea0b76f-5a3f-4426-ba71-54464b0a0a93" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
                            {format(new Date(record.date), "dd/MM/yyyy")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap" data-unique-id="cb4cf8c1-2ce2-4a62-8f2d-e43c445d7328" data-file-name="app/dashboard/reports/custom/page.tsx">
                            <div className="text-sm font-medium text-gray-900" data-unique-id="f0182f4e-11de-4008-8704-2953212e5e5e" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">{record.studentName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-unique-id="987bf0d7-a473-43fe-939a-a7007770d5ce" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
                            {record.class}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap" data-unique-id="5cbca5a3-c8ef-4fac-bf53-7a936e61ed99" data-file-name="app/dashboard/reports/custom/page.tsx">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === "hadir" || record.status === "present" ? "bg-green-100 text-green-800" : record.status === "sakit" || record.status === "sick" ? "bg-orange-100 text-orange-800" : record.status === "izin" || record.status === "permitted" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}`} data-unique-id="e12d63b0-bfa9-48b2-b060-b67a00533947" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
                              {record.status === "hadir" || record.status === "present" ? "Hadir" : record.status === "sakit" || record.status === "sick" ? "Sakit" : record.status === "izin" || record.status === "permitted" ? "Izin" : "Alpha"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-unique-id="719e3daf-c57b-467c-a0de-45897fb859f0" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true">
                            {record.time}
                          </td>
                        </tr>)}
                    </tbody>
                  </table>
                </div>
                
                {attendanceData.length > 10 && <div className="mt-4 text-center text-sm text-gray-500" data-unique-id="8af7e079-8989-4e89-ae78-ceef6064db4c" data-file-name="app/dashboard/reports/custom/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="c7246753-e51c-4295-8642-eb9da6d66b46" data-file-name="app/dashboard/reports/custom/page.tsx">
                    Menampilkan 10 dari </span>{attendanceData.length}<span className="editable-text" data-unique-id="d28ded94-df80-43c1-8b38-2b13d12ce902" data-file-name="app/dashboard/reports/custom/page.tsx"> catatan kehadiran.
                    Semua data akan disertakan dalam laporan PDF.
                  </span></div>}
              </div>}
          </div>}
      </div>
    </div>;
}