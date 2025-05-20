"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Download, FileSpreadsheet, FileText, Loader2, TrendingUp, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "react-hot-toast";
import { generatePDF, generateExcel } from "@/lib/reportGenerator";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Sample class data - removed demo data
const CLASSES: any[] = [];

// Colors for pie chart
const COLORS = ["#4C6FFF", "#FF9800", "#8BC34A", "#F44336"];

// Generate attendance data function
const generateClassAttendanceData = (classId: string) => {
  return [{
    name: "Hadir",
    value: 0,
    color: "#4C6FFF"
  }, {
    name: "Sakit",
    value: 0,
    color: "#FF9800"
  }, {
    name: "Izin",
    value: 0,
    color: "#8BC34A"
  }, {
    name: "Alpha",
    value: 0,
    color: "#F44336"
  }];
};

// Generate weekly data function
const generateWeeklyData = (classId: string) => {
  return [];
};

// Generate daily data function - removed demo data
const generateDailyData = () => {
  return [];
};
export default function ClassReport() {
  const {
    schoolId,
    user
  } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState([{
    name: "Hadir",
    value: 85,
    color: "#4C6FFF"
  }, {
    name: "Sakit",
    value: 7,
    color: "#FF9800"
  }, {
    name: "Izin",
    value: 5,
    color: "#8BC34A"
  }, {
    name: "Alpha",
    value: 3,
    color: "#F44336"
  }]);

  // Chart data
  const [dailyData, setDailyData] = useState<any[]>(generateDailyData());

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // School information
  const [schoolInfo, setSchoolInfo] = useState({
    name: "",
    address: "",
    npsn: "",
    principalName: "",
    principalNip: ""
  });
  const [teacherName, setTeacherName] = useState("");

  // Fetch classes from database
  useEffect(() => {
    const fetchClasses = async () => {
      if (!schoolId) return;
      try {
        setLoading(true);
        const {
          classApi
        } = await import('@/lib/api');
        const classesData = await classApi.getAll(schoolId);
        if (classesData && classesData.length > 0) {
          setClasses(classesData);
          setSelectedClass(classesData[0]);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [schoolId]);
  useEffect(() => {
    // Fetch real attendance data when selected class changes
    const fetchClassAttendanceData = async () => {
      if (!selectedClass || !schoolId) return;
      try {
        setLoading(true);
        const {
          collection,
          query,
          where,
          getDocs
        } = await import('firebase/firestore');
        const {
          db
        } = await import('@/lib/firebase');

        // First, get all students in this class
        const studentsRef = collection(db, `schools/${schoolId}/students`);
        const studentsQuery = query(studentsRef, where("class", "==", selectedClass.name));
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentIds: string[] = [];
        let studentCount = 0;
        studentsSnapshot.forEach(doc => {
          studentIds.push(doc.id);
          studentCount++;
        });

        // Update teacher name if available
        if (selectedClass.teacherName) {
          setTeacherName(selectedClass.teacherName);
        }

        // If no students found, set default empty data
        if (studentIds.length === 0) {
          setAttendanceData([{
            name: "Hadir",
            value: 0,
            color: "#4C6FFF"
          }, {
            name: "Sakit",
            value: 0,
            color: "#FF9800"
          }, {
            name: "Izin",
            value: 0,
            color: "#8BC34A"
          }, {
            name: "Alpha",
            value: 0,
            color: "#F44336"
          }]);
          setLoading(false);
          return;
        }

        // Get attendance records for these students
        const startDate = format(new Date(), "yyyy-MM-01");
        const endDate = format(new Date(), "yyyy-MM-31");
        const attendanceRef = collection(db, `schools/${schoolId}/attendance`);
        const attendanceQuery = query(attendanceRef, where("date", ">=", startDate), where("date", "<=", endDate));
        const attendanceSnapshot = await getDocs(attendanceQuery);

        // Count by status
        let present = 0,
          sick = 0,
          permitted = 0,
          absent = 0;

        // Process attendance records
        attendanceSnapshot.forEach(doc => {
          const data = doc.data();

          // Only count if this student belongs to the selected class
          if (data.studentId && studentIds.includes(data.studentId)) {
            // For pie chart data
            if (data.status === 'present' || data.status === 'hadir') present++;else if (data.status === 'sick' || data.status === 'sakit') sick++;else if (data.status === 'permitted' || data.status === 'izin') permitted++;else if (data.status === 'absent' || data.status === 'alpha') absent++;
          }
        });

        // Set pie chart data
        const total = present + sick + permitted + absent;
        if (total > 0) {
          setAttendanceData([{
            name: "Hadir",
            value: Math.round(present / total * 100),
            color: "#4C6FFF"
          }, {
            name: "Sakit",
            value: Math.round(sick / total * 100),
            color: "#FF9800"
          }, {
            name: "Izin",
            value: Math.round(permitted / total * 100),
            color: "#8BC34A"
          }, {
            name: "Alpha",
            value: Math.round(absent / total * 100),
            color: "#F44336"
          }]);
        } else {
          // Default when no data
          setAttendanceData([{
            name: "Hadir",
            value: 0,
            color: "#4C6FFF"
          }, {
            name: "Sakit",
            value: 0,
            color: "#FF9800"
          }, {
            name: "Izin",
            value: 0,
            color: "#8BC34A"
          }, {
            name: "Alpha",
            value: 0,
            color: "#F44336"
          }]);
        }
      } catch (error) {
        console.error("Error fetching class attendance data:", error);
        toast.error("Gagal mengambil data kehadiran dari database");

        // Set default empty data
        setAttendanceData([{
          name: "Hadir",
          value: 0,
          color: "#4C6FFF"
        }, {
          name: "Sakit",
          value: 0,
          color: "#FF9800"
        }, {
          name: "Izin",
          value: 0,
          color: "#8BC34A"
        }, {
          name: "Alpha",
          value: 0,
          color: "#F44336"
        }]);
      } finally {
        setLoading(false);
      }
    };
    fetchClassAttendanceData();
  }, [selectedClass, schoolId]);
  useEffect(() => {
    const fetchSchoolData = async () => {
      if (schoolId) {
        try {
          // Fetch school information
          const schoolDoc = await getDoc(doc(db, "schools", schoolId));
          if (schoolDoc.exists()) {
            const data = schoolDoc.data();
            setSchoolInfo({
              name: data.name || "Sekolah",
              address: data.address || "Alamat Sekolah",
              npsn: data.npsn || "-",
              principalName: data.principalName || "Kepala Sekolah",
              principalNip: data.principalNip || "-"
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
    // Fetch real attendance data when selected class changes
    const fetchClassAttendanceData = async () => {
      if (!selectedClass || !schoolId) return;
      try {
        setLoading(true);
        const {
          collection,
          query,
          where,
          getDocs
        } = await import('firebase/firestore');
        const {
          db
        } = await import('@/lib/firebase');

        // First, get all students in this class
        const studentsRef = collection(db, `schools/${schoolId}/students`);
        const studentsQuery = query(studentsRef, where("class", "==", selectedClass.name));
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentIds: string[] = [];
        let studentCount = 0;
        studentsSnapshot.forEach(doc => {
          studentIds.push(doc.id);
          studentCount++;
        });

        // Update teacher name if available
        if (selectedClass.teacherName) {
          setTeacherName(selectedClass.teacherName);
        }

        // If no students found, set default empty data
        if (studentIds.length === 0) {
          setAttendanceData([{
            name: "Hadir",
            value: 0,
            color: "#4C6FFF"
          }, {
            name: "Sakit",
            value: 0,
            color: "#FF9800"
          }, {
            name: "Izin",
            value: 0,
            color: "#8BC34A"
          }, {
            name: "Alpha",
            value: 0,
            color: "#F44336"
          }]);
          setDailyData([]);
          setLoading(false);
          return;
        }

        // Get attendance records for these students within the date range
        const attendanceRef = collection(db, `schools/${schoolId}/attendance`);
        const attendanceQuery = query(attendanceRef, where("date", ">=", startDate), where("date", "<=", endDate));
        const attendanceSnapshot = await getDocs(attendanceQuery);

        // Count by status
        let present = 0,
          sick = 0,
          permitted = 0,
          absent = 0;

        // Track daily attendance
        const dailyStats: {
          [key: string]: {
            hadir: number;
            sakit: number;
            izin: number;
            alpha: number;
          };
        } = {};

        // Process attendance records
        attendanceSnapshot.forEach(doc => {
          const data = doc.data();

          // Only count if this student belongs to the selected class
          if (data.studentId && studentIds.includes(data.studentId)) {
            // For pie chart data
            if (data.status === 'present' || data.status === 'hadir') present++;else if (data.status === 'sick' || data.status === 'sakit') sick++;else if (data.status === 'permitted' || data.status === 'izin') permitted++;else if (data.status === 'absent' || data.status === 'alpha') absent++;

            // For daily chart data
            if (data.date) {
              // Extract day part from date (format: YYYY-MM-DD)
              const day = data.date.split('-')[2];
              if (!dailyStats[day]) {
                dailyStats[day] = {
                  hadir: 0,
                  sakit: 0,
                  izin: 0,
                  alpha: 0
                };
              }
              if (data.status === 'present' || data.status === 'hadir') {
                dailyStats[day].hadir++;
              } else if (data.status === 'sick' || data.status === 'sakit') {
                dailyStats[day].sakit++;
              } else if (data.status === 'permitted' || data.status === 'izin') {
                dailyStats[day].izin++;
              } else if (data.status === 'absent' || data.status === 'alpha') {
                dailyStats[day].alpha++;
              }
            }
          }
        });

        // Set pie chart data
        const total = present + sick + permitted + absent;
        if (total > 0) {
          setAttendanceData([{
            name: "Hadir",
            value: Math.round(present / total * 100),
            color: "#4C6FFF"
          }, {
            name: "Sakit",
            value: Math.round(sick / total * 100),
            color: "#FF9800"
          }, {
            name: "Izin",
            value: Math.round(permitted / total * 100),
            color: "#8BC34A"
          }, {
            name: "Alpha",
            value: Math.round(absent / total * 100),
            color: "#F44336"
          }]);
        } else {
          // Default when no data
          setAttendanceData([{
            name: "Hadir",
            value: 0,
            color: "#4C6FFF"
          }, {
            name: "Sakit",
            value: 0,
            color: "#FF9800"
          }, {
            name: "Izin",
            value: 0,
            color: "#8BC34A"
          }, {
            name: "Alpha",
            value: 0,
            color: "#F44336"
          }]);
        }

        // Set daily chart data
        const newDailyData = Object.entries(dailyStats).map(([date, stats]) => ({
          date,
          ...stats
        })).sort((a, b) => parseInt(a.date) - parseInt(b.date));
        setDailyData(newDailyData);
      } catch (error) {
        console.error("Error fetching class attendance data:", error);
        toast.error("Gagal mengambil data kehadiran dari database");

        // Set default empty data
        setAttendanceData([{
          name: "Hadir",
          value: 0,
          color: "#4C6FFF"
        }, {
          name: "Sakit",
          value: 0,
          color: "#FF9800"
        }, {
          name: "Izin",
          value: 0,
          color: "#8BC34A"
        }, {
          name: "Alpha",
          value: 0,
          color: "#F44336"
        }]);
        setDailyData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchClassAttendanceData();
  }, [selectedClass, schoolId, startDate, endDate]);
  const handleFilterByDate = () => {
    // This would normally fetch data for the selected date range
    toast.success(`Filter diterapkan: ${startDate} sampai ${endDate}`);
  };
  const handleDownloadPDF = () => {
    setIsDownloading(true);
    try {
      // Generate PDF
      const fileName = generatePDF(schoolInfo, {
        present: attendanceData[0]?.value || 85,
        sick: attendanceData[1]?.value || 7,
        permitted: attendanceData[2]?.value || 5,
        absent: attendanceData[3]?.value || 3
      }, "class", {
        className: selectedClass?.name || '',
        teacherName: teacherName || ''
      });
      toast.success(`Laporan kelas ${selectedClass?.name || 'Selected'} berhasil diunduh sebagai ${fileName}`);
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

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();

      // Create header data with school information
      const headerData = [[schoolInfo.name.toUpperCase()], [schoolInfo.address], [`NPSN: ${schoolInfo.npsn}`], [""], ["REKAPITULASI LAPORAN ABSENSI PESERTA DIDIK"], [`KELAS: "${selectedClass?.name || 'SEMUA KELAS'}"`], [`BULAN: "${format(new Date(), "MMMM yyyy", {
        locale: id
      }).toUpperCase()}"`], [""], ["No.", "Nama Siswa", "NISN", "Kelas", "Hadir", "Sakit", "Izin", "Alpha", "Total"]];

      // Add student data
      let totalHadir = 0,
        totalSakit = 0,
        totalIzin = 0,
        totalAlpha = 0,
        totalAll = 0;
      filteredStudents.forEach((student, index) => {
        const studentTotal = (student.hadir || 0) + (student.sakit || 0) + (student.izin || 0) + (student.alpha || 0);
        totalHadir += student.hadir || 0;
        totalSakit += student.sakit || 0;
        totalIzin += student.izin || 0;
        totalAlpha += student.alpha || 0;
        totalAll += studentTotal;
        headerData.push([index + 1, student.name || "", student.nisn || "", student.class || "", student.hadir || 0, student.sakit || 0, student.izin || 0, student.alpha || 0, studentTotal]);
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
      headerData.push(["No.", "Nama Siswa", "NISN", "Kelas", "Jumlah Hadir"]);
      topStudentsByHadir.forEach((student, index) => {
        headerData.push([index + 1, student.name || "", student.nisn || "", student.class || "", student.hadir || 0]);
      });

      // Add empty row
      headerData.push([]);

      // Add "Siswa dengan Sakit Terbanyak" section
      headerData.push(["Siswa dengan Sakit Terbanyak :"]);
      headerData.push(["No.", "Nama Siswa", "NISN", "Kelas", "Jumlah Sakit"]);
      topStudentsBySakit.forEach((student, index) => {
        headerData.push([index + 1, student.name || "", student.nisn || "", student.class || "", student.sakit || 0]);
      });

      // Add empty row
      headerData.push([]);

      // Add "Siswa dengan Izin Terbanyak" section
      headerData.push(["Siswa dengan Izin Terbanyak :"]);
      headerData.push(["No.", "Nama Siswa", "NISN", "Kelas", "Jumlah Izin"]);
      topStudentsByIzin.forEach((student, index) => {
        headerData.push([index + 1, student.name || "", student.nisn || "", student.class || "", student.izin || 0]);
      });

      // Add empty row
      headerData.push([]);

      // Add "Siswa dengan Alpha Terbanyak" section
      headerData.push(["Siswa dengan Alpha Terbanyak :"]);
      headerData.push(["No.", "Nama Siswa", "NISN", "Kelas", "Jumlah Alpha"]);
      topStudentsByAlpha.forEach((student, index) => {
        headerData.push([index + 1, student.name || "", student.nisn || "", student.class || "", student.alpha || 0]);
      });

      // Add signature section
      headerData.push([]);
      headerData.push([]);
      headerData.push([]);
      const currentDate = format(new Date(), "d MMMM yyyy", {
        locale: id
      });
      headerData.push(["", "", "", "", `${schoolInfo.address}, ${currentDate}`]);
      headerData.push(["", "Mengetahui", "", "", "", "", "", "Administrator"]);
      headerData.push(["", "KEPALA SEKOLAH,", "", "", "", "", "", "Sekolah,"]);
      headerData.push([]);
      headerData.push([]);
      headerData.push([]);
      headerData.push(["", schoolInfo.principalName || "Kepala Sekolah", "", "", "", "", "", "Administrator"]);
      headerData.push(["", `NIP. ${schoolInfo.principalNip || "..........................."}`, "", "", "", "", "", "NIP. ..............................."]);

      // Create worksheet from data
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
      const fileName = `Laporan_Kehadiran_Rombel_${format(new Date(), "yyyyMMdd")}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success(`Laporan kelas ${selectedClass?.name || 'Semua Kelas'} berhasil diunduh sebagai ${fileName}`);
    } catch (error) {
      console.error("Error generating Excel:", error);
      toast.error("Gagal mengunduh laporan Excel");
    } finally {
      setIsDownloading(false);
    }
  };
  const handleClassChange = e => {
    const classId = e.target.value;
    const foundClass = classes.find(c => c.id === classId);
    if (foundClass) {
      setSelectedClass(foundClass);
    }
  };
  return <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6" data-unique-id="d0f41c31-ebd6-41ab-868e-0990c0ba54b0" data-file-name="app/dashboard/reports/by-class/page.tsx" data-dynamic-text="true">
      <div className="flex items-center mb-6" data-unique-id="9faa75cd-6327-4ef4-8f56-fcd2d79b5947" data-file-name="app/dashboard/reports/by-class/page.tsx">
        <Link href="/dashboard/reports" className="p-2 mr-2 hover:bg-gray-100 rounded-full" data-unique-id="12a14c48-8470-4771-a288-ed9bbb73d7f2" data-file-name="app/dashboard/reports/by-class/page.tsx">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800" data-unique-id="f692ba5a-efda-4892-add7-0d7e3b18483f" data-file-name="app/dashboard/reports/by-class/page.tsx"><span className="editable-text" data-unique-id="6c7d06c9-5137-4894-977d-a7235d725b9a" data-file-name="app/dashboard/reports/by-class/page.tsx">Rekap Per Kelas</span></h1>
      </div>
      
      {/* Date Range Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4" data-unique-id="5c16af13-f6fb-4469-b8de-3b6ddc699caa" data-file-name="app/dashboard/reports/by-class/page.tsx">
        <div data-unique-id="2fd5f478-02b7-4a17-9794-1110ab8dde59" data-file-name="app/dashboard/reports/by-class/page.tsx">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="35538734-eba5-49a7-a550-4594f96f42b6" data-file-name="app/dashboard/reports/by-class/page.tsx"><span className="editable-text" data-unique-id="7e31a13c-91e0-4fe0-b8f5-cdcc902ffe79" data-file-name="app/dashboard/reports/by-class/page.tsx">
            Tanggal Mulai
          </span></label>
          <input type="date" id="startDate" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" value={startDate} onChange={e => setStartDate(e.target.value)} data-unique-id="c527eb1a-366a-45d0-b101-49e6c3ac092c" data-file-name="app/dashboard/reports/by-class/page.tsx" />
        </div>
        
        <div data-unique-id="d1022f28-2cc4-4c9f-a298-b1a27511bb2a" data-file-name="app/dashboard/reports/by-class/page.tsx">
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="b941d7d4-a000-4fbb-a183-609ad12fd90e" data-file-name="app/dashboard/reports/by-class/page.tsx"><span className="editable-text" data-unique-id="0aaae8bb-1cd1-4659-b5f5-e246977b4b8d" data-file-name="app/dashboard/reports/by-class/page.tsx">
            Tanggal Akhir
          </span></label>
          <input type="date" id="endDate" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" value={endDate} onChange={e => setEndDate(e.target.value)} data-unique-id="1974bf2d-873d-49f1-b5ff-5c8d9b86739f" data-file-name="app/dashboard/reports/by-class/page.tsx" />
        </div>
        
        <div className="flex items-end" data-unique-id="4b07a257-cc28-4a4f-8bd4-54c99b98e4dd" data-file-name="app/dashboard/reports/by-class/page.tsx">
          <button onClick={handleFilterByDate} className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors" data-unique-id="e718db49-c6ce-48bc-bae4-593051a0de81" data-file-name="app/dashboard/reports/by-class/page.tsx"><span className="editable-text" data-unique-id="7ce69059-c4ee-4065-a948-1c94a0318369" data-file-name="app/dashboard/reports/by-class/page.tsx">
            Terapkan Filter
          </span></button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6" data-unique-id="41d04312-f1db-42ab-a490-70274a344c12" data-file-name="app/dashboard/reports/by-class/page.tsx" data-dynamic-text="true">
        {/* Pie Chart */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200" data-unique-id="4b71f683-9cc9-4882-bcc7-ee32646756ab" data-file-name="app/dashboard/reports/by-class/page.tsx" data-dynamic-text="true">
          <h3 className="text-base font-medium mb-3" data-unique-id="20c69fd9-1695-4fb8-8c1a-1392191e9b1e" data-file-name="app/dashboard/reports/by-class/page.tsx"><span className="editable-text" data-unique-id="32254871-7583-4904-a686-3a2c8e2d94b1" data-file-name="app/dashboard/reports/by-class/page.tsx">Distribusi Kehadiran</span></h3>
          {loading ? <div className="h-64 flex items-center justify-center" data-unique-id="6ae0d929-159a-4303-bff9-56cc056e9815" data-file-name="app/dashboard/reports/by-class/page.tsx">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" data-unique-id="fecb3202-39ec-4ac6-afa1-c8e8e7a58ce0" data-file-name="app/dashboard/reports/by-class/page.tsx"></div>
            </div> : <div className="h-64" data-unique-id="01046fcd-b792-4434-aa97-fea6f88f0a3f" data-file-name="app/dashboard/reports/by-class/page.tsx">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={attendanceData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" label={entry => `${entry.name}: ${entry.value}%`}>
                    {attendanceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} data-unique-id={`4e377363-eca3-4313-8787-f91d7470ada9_${index}`} data-file-name="app/dashboard/reports/by-class/page.tsx" data-dynamic-text="true" />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>}
        </div>
        
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4" data-unique-id="c73a9569-93bc-4f99-97e7-549a57227501" data-file-name="app/dashboard/reports/by-class/page.tsx">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200" data-unique-id="daffacc0-4499-48af-a257-540cc07d7d85" data-file-name="app/dashboard/reports/by-class/page.tsx" data-dynamic-text="true">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1" data-unique-id="a9f0f99b-9ebd-4b62-947f-e13853168faa" data-file-name="app/dashboard/reports/by-class/page.tsx"><span className="editable-text" data-unique-id="78122038-8999-4896-ac64-686a47978404" data-file-name="app/dashboard/reports/by-class/page.tsx">Hadir</span></h3>
            {loading ? <div className="animate-pulse h-8 bg-gray-200 rounded w-16" data-unique-id="96616111-46b9-47b4-9d44-8d46298388f0" data-file-name="app/dashboard/reports/by-class/page.tsx"></div> : <p className="text-2xl font-bold text-blue-600" data-unique-id="53bf2ad7-348a-4b88-be5f-422589dd1a53" data-file-name="app/dashboard/reports/by-class/page.tsx" data-dynamic-text="true">{attendanceData[0]?.value}<span className="editable-text" data-unique-id="8be92c6f-d38d-493f-ac0c-3cd4df6341bf" data-file-name="app/dashboard/reports/by-class/page.tsx">%</span></p>}
          </div>
          
          <div className="bg-yellow-50 rounded-xl p-4 border border-orange-200" data-unique-id="c7e4162f-d544-482a-8bee-ecd5767ea58b" data-file-name="app/dashboard/reports/by-class/page.tsx" data-dynamic-text="true">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1" data-unique-id="0f9408ac-d6b8-45b8-941a-adbf20632309" data-file-name="app/dashboard/reports/by-class/page.tsx"><span className="editable-text" data-unique-id="1d44843f-295e-47a5-baef-e0d1735eade9" data-file-name="app/dashboard/reports/by-class/page.tsx">Sakit</span></h3>
            {loading ? <div className="animate-pulse h-8 bg-gray-200 rounded w-16" data-unique-id="fd34b483-0770-4d82-9dce-61832b0990b0" data-file-name="app/dashboard/reports/by-class/page.tsx"></div> : <p className="text-2xl font-bold text-orange-600" data-unique-id="e5cf9663-ec99-4cb4-8021-1346faa69616" data-file-name="app/dashboard/reports/by-class/page.tsx" data-dynamic-text="true">{attendanceData[1]?.value}<span className="editable-text" data-unique-id="56f62438-a398-427c-ad9b-4ae07bfb62ac" data-file-name="app/dashboard/reports/by-class/page.tsx">%</span></p>}
          </div>
          
          <div className="bg-yellow-50 rounded-xl p-4 border border-green-200" data-unique-id="ab9f0122-ac37-4451-a705-58432bf814c9" data-file-name="app/dashboard/reports/by-class/page.tsx" data-dynamic-text="true">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1" data-unique-id="0db78148-da1f-4a50-8c3b-2ff7d3cf4ef7" data-file-name="app/dashboard/reports/by-class/page.tsx"><span className="editable-text" data-unique-id="e489eb12-0960-4a78-b741-d6e202afb8f3" data-file-name="app/dashboard/reports/by-class/page.tsx">Izin</span></h3>
            {loading ? <div className="animate-pulse h-8 bg-gray-200 rounded w-16" data-unique-id="e487c6f1-c2d1-4e53-8829-a3f7c14a6a6c" data-file-name="app/dashboard/reports/by-class/page.tsx"></div> : <p className="text-2xl font-bold text-green-600" data-unique-id="b52b341e-9e72-43a9-afeb-355869f7c323" data-file-name="app/dashboard/reports/by-class/page.tsx" data-dynamic-text="true">{attendanceData[2]?.value}<span className="editable-text" data-unique-id="732c0805-2242-48e6-9af2-b2c1a0b97830" data-file-name="app/dashboard/reports/by-class/page.tsx">%</span></p>}
          </div>
          
          <div className="bg-yellow-50 rounded-xl p-4 border border-red-200" data-unique-id="b06c14ba-3b0c-4409-80b2-69df4ba9db46" data-file-name="app/dashboard/reports/by-class/page.tsx" data-dynamic-text="true">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1" data-unique-id="78689b97-083d-458b-8bed-100fc364c003" data-file-name="app/dashboard/reports/by-class/page.tsx"><span className="editable-text" data-unique-id="2cb05544-f792-4818-ac16-71eff3da0c85" data-file-name="app/dashboard/reports/by-class/page.tsx">Alpha</span></h3>
            {loading ? <div className="animate-pulse h-8 bg-gray-200 rounded w-16" data-unique-id="341bb206-2026-4a4e-89ff-9034f025f5f9" data-file-name="app/dashboard/reports/by-class/page.tsx"></div> : <p className="text-2xl font-bold text-red-600" data-unique-id="71010565-d424-44a3-9da0-a56c99112d60" data-file-name="app/dashboard/reports/by-class/page.tsx" data-dynamic-text="true">{attendanceData[3]?.value}<span className="editable-text" data-unique-id="a9ad1d5e-ec22-41ab-ac56-7ccff739f3a8" data-file-name="app/dashboard/reports/by-class/page.tsx">%</span></p>}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-20 md:mb-6 mt-8" data-unique-id="790e0dea-5a3b-41f0-a81d-df90eb2735d9" data-file-name="app/dashboard/reports/by-class/page.tsx">
        <button onClick={handleDownloadPDF} disabled={isDownloading} className="flex items-center justify-center gap-3 bg-red-600 text-white p-4 rounded-xl hover:bg-red-700 transition-colors" data-unique-id="401f21d7-efa9-46a0-83d1-c8b65d168f66" data-file-name="app/dashboard/reports/by-class/page.tsx" data-dynamic-text="true">
          {isDownloading ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileText className="h-6 w-6" />}
          <span className="font-medium" data-unique-id="ad567e74-114f-457c-b686-11cafe45877d" data-file-name="app/dashboard/reports/by-class/page.tsx"><span className="editable-text" data-unique-id="2e04558c-4c4e-4479-81e3-f0324b36a33b" data-file-name="app/dashboard/reports/by-class/page.tsx">Download Laporan PDF</span></span>
        </button>
        
        <button onClick={handleDownloadExcel} disabled={isDownloading} className="flex items-center justify-center gap-3 bg-green-600 text-white p-4 rounded-xl hover:bg-green-700 transition-colors" data-unique-id="2677ab6e-3107-476b-8cb2-64741d1a168b" data-file-name="app/dashboard/reports/by-class/page.tsx" data-dynamic-text="true">
          {isDownloading ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileSpreadsheet className="h-6 w-6" />}
          <span className="font-medium" data-unique-id="9aee71dd-df2e-44ba-baff-76b229b99ad2" data-file-name="app/dashboard/reports/by-class/page.tsx"><span className="editable-text" data-unique-id="061adc54-915e-4dde-af64-e97237688ce7" data-file-name="app/dashboard/reports/by-class/page.tsx">Download Laporan Excel</span></span>
        </button>
      </div>
    </div>;
}