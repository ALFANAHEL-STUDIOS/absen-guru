"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { generateComprehensiveReport } from "@/lib/reportGenerator";
import { PlusCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsInternalPieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Calendar, ChevronLeft, ChevronRight, FileText, Download, FileSpreadsheet, Users, BookOpen, User, BarChart2, PieChart, TrendingUp } from "lucide-react";
import { format, subMonths, addMonths } from "date-fns";
import { id } from "date-fns/locale";
import ReportGenerator from "@/components/ReportGenerator";

// Dummy attendance data
const attendanceData = [{
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
}];
const dailyData = [{
  date: "01",
  hadir: 95,
  sakit: 3,
  izin: 1,
  alpha: 1
}, {
  date: "02",
  hadir: 92,
  sakit: 4,
  izin: 2,
  alpha: 2
}, {
  date: "03",
  hadir: 88,
  sakit: 6,
  izin: 3,
  alpha: 3
}, {
  date: "04",
  hadir: 90,
  sakit: 5,
  izin: 3,
  alpha: 2
}, {
  date: "05",
  hadir: 93,
  sakit: 3,
  izin: 2,
  alpha: 2
}, {
  date: "06",
  hadir: 91,
  sakit: 4,
  izin: 3,
  alpha: 2
}, {
  date: "07",
  hadir: 94,
  sakit: 2,
  izin: 3,
  alpha: 1
}, {
  date: "08",
  hadir: 95,
  sakit: 3,
  izin: 1,
  alpha: 1
}, {
  date: "09",
  hadir: 92,
  sakit: 4,
  izin: 2,
  alpha: 2
}, {
  date: "10",
  hadir: 88,
  sakit: 6,
  izin: 3,
  alpha: 3
}, {
  date: "11",
  hadir: 90,
  sakit: 5,
  izin: 3,
  alpha: 2
}, {
  date: "12",
  hadir: 93,
  sakit: 3,
  izin: 2,
  alpha: 2
}];
const weeklyData = [{
  week: "Minggu 1",
  hadir: 92,
  sakit: 4,
  izin: 2,
  alpha: 2
}, {
  week: "Minggu 2",
  hadir: 90,
  sakit: 5,
  izin: 3,
  alpha: 2
}, {
  week: "Minggu 3",
  hadir: 93,
  sakit: 3,
  izin: 2,
  alpha: 2
}, {
  week: "Minggu 4",
  hadir: 95,
  sakit: 3,
  izin: 1,
  alpha: 1
}];
export default function Reports() {
  const {
    schoolId,
    userRole,
    userData
  } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    sick: 0,
    permitted: 0,
    absent: 0
  });
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!schoolId) return;
      try {
        setLoading(true);
        // Get current month in YYYY-MM format
        const currentYearMonth = format(currentDate, "yyyy-MM");
        const startDate = `${currentYearMonth}-01`;
        const endDate = `${currentYearMonth}-31`; // Using 31 to cover all possible days

        // Query attendance records for the current month
        const {
          collection,
          query,
          where,
          getDocs
        } = await import('firebase/firestore');
        const {
          db
        } = await import('@/lib/firebase');
        const attendanceRef = collection(db, `schools/${schoolId}/attendance`);
        const attendanceQuery = query(attendanceRef, where("date", ">=", startDate), where("date", "<=", endDate));
        const snapshot = await getDocs(attendanceQuery);

        // Count by status
        let present = 0,
          sick = 0,
          permitted = 0,
          absent = 0;
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.status === "hadir" || data.status === "present") present++;else if (data.status === "sakit" || data.status === "sick") sick++;else if (data.status === "izin" || data.status === "permitted") permitted++;else if (data.status === "alpha" || data.status === "absent") absent++;
        });
        const total = present + sick + permitted + absent || 1; // Prevent division by zero

        setAttendanceStats({
          present: Math.round(present / total * 100),
          sick: Math.round(sick / total * 100),
          permitted: Math.round(permitted / total * 100),
          absent: Math.round(absent / total * 100)
        });
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendanceData();
  }, [schoolId, currentDate]);
  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Format current date for display
  const formattedMonth = format(currentDate, "MMMM yyyy", {
    locale: id
  });
  return <div className="pb-20 md:pb-6" data-unique-id="29a7cadf-d210-4aed-b2ab-11be4b1ac943" data-file-name="app/dashboard/reports/page.tsx" data-dynamic-text="true">
      <div className="flex items-center justify-between mb-6" data-unique-id="472f20a7-9181-4a07-8da3-d4b32dd93472" data-file-name="app/dashboard/reports/page.tsx">
        <h1 className="text-2xl font-bold text-gray-800" data-unique-id="dde1059d-c28b-4c1e-a43b-38bed2d8506f" data-file-name="app/dashboard/reports/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="9d059bd2-bedb-43d4-ae04-bec774f976e2" data-file-name="app/dashboard/reports/page.tsx">
          Laporan Bulan: </span>{formattedMonth}
        </h1>
        
        <div className="flex items-center space-x-2" data-unique-id="67ca8b35-73b0-4843-9c4f-78879fe96e00" data-file-name="app/dashboard/reports/page.tsx">
          <button onClick={handlePrevMonth} className="p-2 rounded-md border border-gray-300 hover:bg-gray-50" data-unique-id="cffe2b92-b35c-48bd-ab92-3e35cbff1dfe" data-file-name="app/dashboard/reports/page.tsx">
            <ChevronLeft size={20} />
          </button>
          <button onClick={handleNextMonth} className="p-2 rounded-md border border-gray-300 hover:bg-gray-50" data-unique-id="4ec5c0f0-05d3-40e5-93a5-83ebf5dff8d6" data-file-name="app/dashboard/reports/page.tsx">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <p className="text-gray-500 mb-6" data-unique-id="9d6f4eee-b5e9-41a1-a70f-6f4c0d628f72" data-file-name="app/dashboard/reports/page.tsx"><span className="editable-text" data-unique-id="209f8989-3309-4e24-9c35-4e73b4e1d345" data-file-name="app/dashboard/reports/page.tsx">Ringkasan Kehadiran Siswa dan Rekap Laporan</span></p>
      
      {/* Attendance Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" data-unique-id="6ab2e442-dc39-4b0f-9626-c4ca3f695a77" data-file-name="app/dashboard/reports/page.tsx">
        <div className="bg-gradient-to-br from-blue-50 to-blue-200 rounded-xl shadow-sm p-4 border border-blue-100" data-unique-id="09b97a60-107a-437f-a82b-4ee24816cea2" data-file-name="app/dashboard/reports/page.tsx" data-dynamic-text="true">
          <div className="flex items-center gap-3 mb-2" data-unique-id="48543d42-0f3d-40b9-a2d4-bfcea41083ef" data-file-name="app/dashboard/reports/page.tsx">
            <div className="bg-blue-100 p-2 rounded-lg" data-unique-id="11d2b32f-7a72-405a-a7fb-466c1fd67008" data-file-name="app/dashboard/reports/page.tsx">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-xs sm:text-sm md:text-base font-medium text-gray-500" data-unique-id="4ee9e390-cf04-40ee-bc48-6fd37459a858" data-file-name="app/dashboard/reports/page.tsx"><span className="editable-text" data-unique-id="7cfb5061-811a-4baa-9d8a-4a88048c1a97" data-file-name="app/dashboard/reports/page.tsx">Hadir</span></h3>
          </div>
          {loading ? <div className="animate-pulse h-8 bg-gray-200 rounded w-16" data-unique-id="b7baa180-7d14-4372-a1b3-a113721f40e7" data-file-name="app/dashboard/reports/page.tsx"></div> : <p className="text-xl sm:text-2xl font-bold text-gray-800" data-unique-id="2bb03b30-13fd-4e7f-807b-85b3a1bf0505" data-file-name="app/dashboard/reports/page.tsx" data-dynamic-text="true">{attendanceStats.present}<span className="editable-text" data-unique-id="f178d1b4-ce71-4327-9a5a-9b864b09b796" data-file-name="app/dashboard/reports/page.tsx">%</span></p>}
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-200 rounded-xl shadow-sm p-4 border border-orange-100" data-unique-id="89087198-5725-4363-a6e0-318c16e5a643" data-file-name="app/dashboard/reports/page.tsx" data-dynamic-text="true">
          <div className="flex items-center gap-3 mb-2" data-unique-id="d33d6ec8-f7ad-4066-b789-ffe574f26cc6" data-file-name="app/dashboard/reports/page.tsx">
            <div className="bg-orange-100 p-2 rounded-lg" data-unique-id="e283f9c2-0366-4368-8abc-d15a43d9cce3" data-file-name="app/dashboard/reports/page.tsx">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="text-xs sm:text-sm md:text-base font-medium text-gray-500" data-unique-id="ffffe8e9-7235-450b-bc95-b74702a75f2e" data-file-name="app/dashboard/reports/page.tsx"><span className="editable-text" data-unique-id="00a2ccc9-f8eb-4d32-a096-7ad78cda6952" data-file-name="app/dashboard/reports/page.tsx">Sakit</span></h3>
          </div>
          {loading ? <div className="animate-pulse h-8 bg-gray-200 rounded w-16" data-unique-id="acba6604-11d8-4f74-9bc3-1e2e81406cf6" data-file-name="app/dashboard/reports/page.tsx"></div> : <p className="text-xl sm:text-2xl font-bold text-gray-800" data-unique-id="74c6ebf2-a111-4eee-8675-14a40b347364" data-file-name="app/dashboard/reports/page.tsx" data-dynamic-text="true">{attendanceStats.sick}<span className="editable-text" data-unique-id="b6fad608-eace-4fc2-a967-4f516cdbc0b1" data-file-name="app/dashboard/reports/page.tsx">%</span></p>}
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-200 rounded-xl shadow-sm p-4 border border-green-100" data-unique-id="770fbec9-baf0-4602-9915-0001a5137fce" data-file-name="app/dashboard/reports/page.tsx" data-dynamic-text="true">
          <div className="flex items-center gap-3 mb-2" data-unique-id="d5a9a233-0806-40de-8c4c-adc323261bae" data-file-name="app/dashboard/reports/page.tsx">
            <div className="bg-green-100 p-2 rounded-lg" data-unique-id="36120e4e-56f3-46f8-9180-2a5a73e3297f" data-file-name="app/dashboard/reports/page.tsx">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-xs sm:text-sm md:text-base font-medium text-gray-500" data-unique-id="a1ec4122-92cf-43fa-9a3a-3c0e456bfa67" data-file-name="app/dashboard/reports/page.tsx"><span className="editable-text" data-unique-id="a2e0170d-dadd-41fd-a6b3-b0142c6b5476" data-file-name="app/dashboard/reports/page.tsx">Izin</span></h3>
          </div>
          {loading ? <div className="animate-pulse h-8 bg-gray-200 rounded w-16" data-unique-id="fb3a0cd7-32b4-4c1e-9caf-2e566afb3a0b" data-file-name="app/dashboard/reports/page.tsx"></div> : <p className="text-xl sm:text-2xl font-bold text-gray-800" data-unique-id="b3e33309-f6f0-41c4-8661-781413933ec4" data-file-name="app/dashboard/reports/page.tsx" data-dynamic-text="true">{attendanceStats.permitted}<span className="editable-text" data-unique-id="afeee043-e605-4e48-b2a8-3ae2a5549ead" data-file-name="app/dashboard/reports/page.tsx">%</span></p>}
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-200 rounded-xl shadow-sm p-4 border border-red-100" data-unique-id="74d992b5-270c-4e49-8230-1b1dd03532b3" data-file-name="app/dashboard/reports/page.tsx" data-dynamic-text="true">
          <div className="flex items-center gap-3 mb-2" data-unique-id="f96e52d5-f398-494a-892f-3af2cb959951" data-file-name="app/dashboard/reports/page.tsx">
            <div className="bg-red-100 p-2 rounded-lg" data-unique-id="d51c8d40-c472-4c5d-a2af-e6b616659fb5" data-file-name="app/dashboard/reports/page.tsx">
              <Users className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-xs sm:text-sm md:text-base font-medium text-gray-500" data-unique-id="7f68ee78-2d8a-4cca-a368-777f59506f51" data-file-name="app/dashboard/reports/page.tsx"><span className="editable-text" data-unique-id="dd5174ec-21d3-43b8-89f3-6c28085db460" data-file-name="app/dashboard/reports/page.tsx">Alpha</span></h3>
          </div>
          {loading ? <div className="animate-pulse h-8 bg-gray-200 rounded w-16" data-unique-id="6fccb68a-3820-44b2-9d26-07c26f889472" data-file-name="app/dashboard/reports/page.tsx"></div> : <p className="text-xl sm:text-2xl font-bold text-gray-800" data-unique-id="3d8e93b8-fddc-4ccc-98cb-deefda23fc0c" data-file-name="app/dashboard/reports/page.tsx" data-dynamic-text="true">{attendanceStats.absent}<span className="editable-text" data-unique-id="77090a91-7651-4407-88db-eae42f81f7bd" data-file-name="app/dashboard/reports/page.tsx">%</span></p>}
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-1 md:gap-6 mb-4 sm:mb-6 md:mb-8" data-unique-id="e1d7c2b5-2ad0-4709-881d-6919b64a5b5b" data-file-name="app/dashboard/reports/page.tsx" data-dynamic-text="true">
        {/* Attendance Distribution */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-6 border border-purple-100" data-unique-id="453ff618-401c-4aaa-9fcd-d247f92ca160" data-file-name="app/dashboard/reports/page.tsx">
          <div className="flex items-center mb-4" data-unique-id="114f9043-5777-44f8-ba6f-85f48ebbeea2" data-file-name="app/dashboard/reports/page.tsx">
            <div className="bg-orange-100 p-2 rounded-lg mr-3" data-unique-id="4b3f27df-5786-43c6-b02d-ce6d83cd0265" data-file-name="app/dashboard/reports/page.tsx">
              <PieChart className="h-6 w-6 text-orange-600" />
            </div>
            <h2 className="text-lg font-semibold" data-unique-id="761b2470-8e7d-4785-85da-a46432313b1b" data-file-name="app/dashboard/reports/page.tsx"><span className="editable-text" data-unique-id="03e560d3-c424-4b29-aefb-18e71540768d" data-file-name="app/dashboard/reports/page.tsx">Distribusi Kehadiran</span></h2>
          </div>
          
          <div className="h-80" data-unique-id="6e0ba5bc-b4f8-48b7-81c8-d2890bc8ddc3" data-file-name="app/dashboard/reports/page.tsx">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsInternalPieChart>
                <Pie data={[{
                name: "Hadir",
                value: attendanceStats.present,
                color: "#4C6FFF"
              }, {
                name: "Sakit",
                value: attendanceStats.sick,
                color: "#FF9800"
              }, {
                name: "Izin",
                value: attendanceStats.permitted,
                color: "#8BC34A"
              }, {
                name: "Alpha",
                value: attendanceStats.absent,
                color: "#F44336"
              }]} cx="50%" cy="50%" outerRadius={90} fill="#8884d8" dataKey="value" nameKey="name" label={entry => entry.name}>
                  {[{
                  name: "Hadir",
                  value: attendanceStats.present,
                  color: "#4C6FFF"
                }, {
                  name: "Sakit",
                  value: attendanceStats.sick,
                  color: "#FF9800"
                }, {
                  name: "Izin",
                  value: attendanceStats.permitted,
                  color: "#8BC34A"
                }, {
                  name: "Alpha",
                  value: attendanceStats.absent,
                  color: "#F44336"
                }].map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} data-unique-id={`43fa34b0-810c-432d-a99d-f2acf2ceaeb2_${index}`} data-file-name="app/dashboard/reports/page.tsx" data-dynamic-text="true" />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </RechartsInternalPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Report Types Section - Role-specific */}
      <div className="mb-8" data-unique-id="7f0ff744-85a1-4afb-9ea4-dea5f0ff8ef3" data-file-name="app/dashboard/reports/page.tsx">
        <h2 className="flex items-center text-xl font-semibold mb-6 text-gray-800 tracking-wide" data-unique-id="07bb82a2-ffdc-4a1a-bc40-1b1da8473b3a" data-file-name="app/dashboard/reports/page.tsx">
          <FileText className="mr-3 h-6 w-6 text-gray-800" /><span className="editable-text" data-unique-id="c89a6456-154e-4038-be9a-ed879142c567" data-file-name="app/dashboard/reports/page.tsx">
          Jenis Laporan
        </span></h2>
        
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4" data-unique-id="bf547947-9835-46f4-9dc9-4f99525108c1" data-file-name="app/dashboard/reports/page.tsx" data-dynamic-text="true">
          {/* Monthly Report - All users */}
          <Link href="https://absen-digital.getcreatr.dev/dashboard/reports/monthly-attendance/" className="bg-blue-50 rounded-xl shadow-sm p-5 hover:shadow-md transition-all border border-blue-200 text-gray-800" data-unique-id="4ca7b469-c3d8-4318-8d43-ce80b5bc5b0d" data-file-name="app/dashboard/reports/page.tsx">
            <div className="flex flex-col items-center text-center" data-unique-id="6a1bea7f-d306-4b6a-8e43-4b93708dfd58" data-file-name="app/dashboard/reports/page.tsx">
              <div className="bg-blue-100 p-3 rounded-full mb-3" data-unique-id="8986dc67-521c-448e-943b-dbef17b9c9c3" data-file-name="app/dashboard/reports/page.tsx">
                <Calendar className="h-6 w-6 text-blue-600" data-unique-id="3799993e-026f-490b-ab5a-d097d1dfde2c" data-file-name="app/dashboard/reports/page.tsx" />
              </div>
              <h3 className="font-medium text-gray-800 mb-1" data-unique-id="650651c0-9ec8-49ba-82ab-05432650ac75" data-file-name="app/dashboard/reports/page.tsx"><span className="editable-text" data-unique-id="c7edcc88-e28d-40e3-b5e1-7b3315c5448a" data-file-name="app/dashboard/reports/page.tsx">Rekap Bulanan</span></h3>
              <p className="text-sm text-gray-500" data-unique-id="eda47aba-51a0-4172-ab26-92212f0ecc28" data-file-name="app/dashboard/reports/page.tsx"><span className="editable-text" data-unique-id="0bf2dc16-33fa-4f0e-b370-cd956a7b5bbd" data-file-name="app/dashboard/reports/page.tsx">Laporan Siswa Perbulan</span></p>
            </div>
          </Link>
          
          
          {/* Group Report - Admin and Teacher only */}
          {(userRole === 'admin' || userRole === 'teacher') && <Link href="/dashboard/reports/by-group" className="bg-amber-50 rounded-xl shadow-sm p-5 hover:shadow-md transition-all border border-amber-200 text-gray-800" data-unique-id="554ebca7-eb95-45d1-ada8-1781278ece32" data-file-name="app/dashboard/reports/page.tsx">
              <div className="flex flex-col items-center text-center" data-unique-id="9c13d776-1ec8-4080-a2c1-4b65158cd74b" data-file-name="app/dashboard/reports/page.tsx">
                <div className="bg-amber-100 p-3 rounded-full mb-3" data-unique-id="f8253979-a16b-4712-9dec-325a622b5ae3" data-file-name="app/dashboard/reports/page.tsx">
                  <Users className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="font-medium text-gray-800 mb-1" data-unique-id="034cd208-f702-47de-b008-84ea98a129b4" data-file-name="app/dashboard/reports/page.tsx"><span className="editable-text" data-unique-id="3fa9abc6-4c84-4817-b885-99c7e0f58c68" data-file-name="app/dashboard/reports/page.tsx">Laporan Absen Rombel</span></h3>
                <p className="text-sm text-gray-500" data-unique-id="adbf0cb1-6538-40bb-9957-4ab8a4cb2e65" data-file-name="app/dashboard/reports/page.tsx"><span className="editable-text" data-unique-id="160627b9-4d81-4316-9394-71c9dc831c4a" data-file-name="app/dashboard/reports/page.tsx">Laporan Kehadiran Rombel</span></p>
              </div>
            </Link>}
          
          {/* Student Report - Different behavior based on role */}
          {userRole === 'student' ?
        // For students - direct link to their own report
        <Link href={`/dashboard/reports/by-student?id=${userData?.id || ''}`} className="bg-green-50 rounded-xl shadow-sm p-5 hover:shadow-md transition-all border border-green-200 text-gray-800" data-unique-id="e3675817-6c39-4072-9553-405f63ef1298" data-file-name="app/dashboard/reports/page.tsx">
              <div className="flex flex-col items-center text-center" data-unique-id="8319cb45-dac0-46bf-8cd2-6950f4510ce5" data-file-name="app/dashboard/reports/page.tsx">
                <div className="bg-green-100 p-3 rounded-full mb-3" data-unique-id="540ce073-8956-45ee-bc15-6c8c507dfc59" data-file-name="app/dashboard/reports/page.tsx">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-800 mb-1" data-unique-id="f13c9df9-36e0-49f8-b207-d81cf0848c53" data-file-name="app/dashboard/reports/page.tsx"><span className="editable-text" data-unique-id="fa4bbe5b-d343-4783-8174-ed717169770d" data-file-name="app/dashboard/reports/page.tsx">Rekap Kehadiran Saya</span></h3>
                <p className="text-sm text-gray-500" data-unique-id="4c8df1a4-3f6f-40c8-a3e4-802efdf11cdb" data-file-name="app/dashboard/reports/page.tsx"><span className="editable-text" data-unique-id="e2851b21-4efe-40cb-9476-9e25f92b808c" data-file-name="app/dashboard/reports/page.tsx">Laporan Kehadiran Pribadi</span></p>
              </div>
            </Link> :
        // For admin and teacher - link to student selection
        <Link href="/dashboard/reports/by-student" className="bg-green-50 rounded-xl shadow-sm p-5 hover:shadow-md transition-all border border-green-200 text-gray-800" data-unique-id="65f083fc-df03-44eb-a1f7-a23b1f07785a" data-file-name="app/dashboard/reports/page.tsx">
              <div className="flex flex-col items-center text-center" data-unique-id="5522beae-ff5e-420b-8e53-71f33c26b535" data-file-name="app/dashboard/reports/page.tsx">
                <div className="bg-green-100 p-3 rounded-full mb-3" data-unique-id="17042239-c920-49ed-853b-89cc044954f0" data-file-name="app/dashboard/reports/page.tsx">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-800 mb-1" data-unique-id="58ced31d-a64a-4c62-b511-198d36903fbe" data-file-name="app/dashboard/reports/page.tsx"><span className="editable-text" data-unique-id="2fad99f4-dc68-476a-8df7-632c7fac11a7" data-file-name="app/dashboard/reports/page.tsx">Rekap Per Siswa</span></h3>
                <p className="text-sm text-gray-500" data-unique-id="4b607099-feda-4d30-b740-9b11d1a6c6c3" data-file-name="app/dashboard/reports/page.tsx"><span className="editable-text" data-unique-id="fb9a9aed-e605-4520-b650-21d3398542a9" data-file-name="app/dashboard/reports/page.tsx">Laporan Kehadiran Setiap Siswa</span></p>
              </div>
            </Link>}
          
        </div>
      </div>
      
      {/* Download Section removed as requested */}
    </div>;
}