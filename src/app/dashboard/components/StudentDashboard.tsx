"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, FileText, CheckCircle, XCircle, AlertCircle, User, BookOpen, BarChart2, Loader2 } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import { id } from "date-fns/locale";
interface StudentDashboardProps {
  userData: any;
  schoolId: string | null;
}
export default function StudentDashboard({
  userData,
  schoolId
}: StudentDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    sick: 0,
    permitted: 0,
    absent: 0,
    total: 0
  });
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);

  // Get current date and time
  const currentDate = new Date();
  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(currentDate);

  // Fetch student's attendance data
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!schoolId || !userData?.id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);

        // Get today's date in YYYY-MM-DD format
        const today = format(new Date(), "yyyy-MM-dd");
        const startOfMonth = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), "yyyy-MM-dd");

        // Fetch today's attendance
        const todayAttendanceRef = collection(db, `schools/${schoolId}/attendance`);
        const todayAttendanceQuery = query(todayAttendanceRef, where("studentId", "==", userData.id), where("date", "==", today));
        const todayAttendanceSnapshot = await getDocs(todayAttendanceQuery);
        if (!todayAttendanceSnapshot.empty) {
          setTodayAttendance(todayAttendanceSnapshot.docs[0].data());
        }

        // Fetch attendance history
        const historyRef = collection(db, `schools/${schoolId}/attendance`);
        const historyQuery = query(historyRef, where("studentId", "==", userData.id), orderBy("date", "desc"), limit(10));
        const historySnapshot = await getDocs(historyQuery);
        const historyData: any[] = [];
        historySnapshot.forEach(doc => {
          const data = doc.data();
          historyData.push({
            id: doc.id,
            date: data.date,
            status: data.status,
            time: data.time
          });
        });
        setAttendanceHistory(historyData);

        // Calculate monthly statistics
        const monthlyRef = collection(db, `schools/${schoolId}/attendance`);
        const monthlyQuery = query(monthlyRef, where("studentId", "==", userData.id), where("date", ">=", startOfMonth), where("date", "<=", today));
        const monthlySnapshot = await getDocs(monthlyQuery);
        let present = 0;
        let sick = 0;
        let permitted = 0;
        let absent = 0;
        monthlySnapshot.forEach(doc => {
          const data = doc.data();
          if (data.status === "present" || data.status === "hadir") present++;else if (data.status === "sick" || data.status === "sakit") sick++;else if (data.status === "permitted" || data.status === "izin") permitted++;else if (data.status === "absent" || data.status === "alpha") absent++;
        });
        const total = present + sick + permitted + absent;
        setAttendanceStats({
          present,
          sick,
          permitted,
          absent,
          total
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        setLoading(false);
      }
    };
    fetchAttendanceData();
  }, [schoolId, userData, currentDate]);

  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "d MMMM yyyy", {
        locale: id
      });
    } catch (error) {
      return dateString;
    }
  };
  if (loading) {
    return <div className="flex justify-center items-center h-64" data-unique-id="f1523ef3-6906-4b03-b341-275dd0a67133" data-file-name="app/dashboard/components/StudentDashboard.tsx">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>;
  }
  return <div data-unique-id="9c754235-bed4-4f5d-8357-cfbfbda290e3" data-file-name="app/dashboard/components/StudentDashboard.tsx" data-dynamic-text="true">
      {/* Today's attendance status */}
      <div className={`${todayAttendance ? 'bg-green-500' : 'bg-gray-500'} rounded-xl shadow-sm p-6 mb-6 text-white`} data-unique-id="c6f51dac-b128-41e7-8596-2c399c4f2f10" data-file-name="app/dashboard/components/StudentDashboard.tsx">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between" data-unique-id="6934e690-aa0a-41d8-90b8-57f74a35285d" data-file-name="app/dashboard/components/StudentDashboard.tsx" data-dynamic-text="true">
          <div data-unique-id="19b48478-52be-4aa8-939b-448166c37e14" data-file-name="app/dashboard/components/StudentDashboard.tsx">
            <div className="flex items-center" data-unique-id="627d187c-afb8-4aab-90fa-d28e824edda6" data-file-name="app/dashboard/components/StudentDashboard.tsx">
              <Calendar className="h-5 w-5 text-white mr-2" data-unique-id="6ea45114-05b3-4adc-aa25-7782a9a0707e" data-file-name="app/dashboard/components/StudentDashboard.tsx" />
              <h2 className="text-lg font-semibold text-white" data-unique-id="d29a28d1-f6b5-488f-b0a5-374c9535626b" data-file-name="app/dashboard/components/StudentDashboard.tsx"><span className="editable-text" data-unique-id="fccbf2ed-7a1c-4514-a69b-70434101d56e" data-file-name="app/dashboard/components/StudentDashboard.tsx">Status Kehadiran Hari Ini</span></h2>
            </div>
            <p className="text-white mt-1" data-unique-id="b6f1005a-5f58-41f0-a616-acef40e47cd8" data-file-name="app/dashboard/components/StudentDashboard.tsx" data-dynamic-text="true">{formattedDate}</p>
          </div>
          
          {todayAttendance ? <div className="mt-4 md:mt-0 flex items-center bg-green-400 bg-opacity-30 px-4 py-2 rounded-lg" data-unique-id="57655975-2612-477b-9c49-de0a03c9da85" data-file-name="app/dashboard/components/StudentDashboard.tsx">
              <CheckCircle className="h-5 w-5 text-white mr-2" />
              <span className="font-medium text-white" data-unique-id="9627aabf-6291-484c-a5a4-4e32b8e214db" data-file-name="app/dashboard/components/StudentDashboard.tsx" data-dynamic-text="true">
                {todayAttendance.status === 'hadir' || todayAttendance.status === 'present' ? 'Hadir' : todayAttendance.status === 'sakit' || todayAttendance.status === 'sick' ? 'Sakit' : todayAttendance.status === 'izin' || todayAttendance.status === 'permitted' ? 'Izin' : 'Alpha'}
              </span>
              <span className="text-white ml-2 text-sm" data-unique-id="f1da9e6a-793a-4ea6-a463-0674099635f2" data-file-name="app/dashboard/components/StudentDashboard.tsx" data-dynamic-text="true">{todayAttendance.time}<span className="editable-text" data-unique-id="3dc1b592-9e8c-4fd6-b5fb-822e6737020f" data-file-name="app/dashboard/components/StudentDashboard.tsx"> WIB</span></span>
            </div> : <div className="mt-4 md:mt-0 flex items-center bg-gray-400 bg-opacity-30 px-4 py-2 rounded-lg" data-unique-id="a5e47419-8ffa-4db3-bd34-b4ae0dec147d" data-file-name="app/dashboard/components/StudentDashboard.tsx">
              <XCircle className="h-5 w-5 text-white mr-2" />
              <span className="font-medium text-white" data-unique-id="944012a8-dab4-41e8-88be-90a5500fe2bc" data-file-name="app/dashboard/components/StudentDashboard.tsx"><span className="editable-text" data-unique-id="ac47dbb0-1453-4cfb-b134-14d1a48530d1" data-file-name="app/dashboard/components/StudentDashboard.tsx">Belum Absen</span></span>
            </div>}
        </div>
      </div>

      {/* Attendance stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6" data-unique-id="646154a6-6710-478d-8de5-e278f4115f88" data-file-name="app/dashboard/components/StudentDashboard.tsx">
        <div className="bg-blue-500 rounded-xl shadow-sm p-3 sm:p-4 text-white" data-unique-id="17b72de3-c29b-4bdd-b1af-676f8167bf66" data-file-name="app/dashboard/components/StudentDashboard.tsx">
          <h3 className="text-xs font-medium text-white mb-1" data-unique-id="04f59a5d-af69-46a8-95e3-5da78338a452" data-file-name="app/dashboard/components/StudentDashboard.tsx"><span className="editable-text" data-unique-id="4c6b1b5a-60c7-41e9-8769-9922e4d079c6" data-file-name="app/dashboard/components/StudentDashboard.tsx">Total Kehadiran</span></h3>
          <p className="text-lg sm:text-xl font-bold text-white" data-unique-id="b1aaa864-a019-4859-b054-bce4f5134f96" data-file-name="app/dashboard/components/StudentDashboard.tsx" data-dynamic-text="true">
            {attendanceStats.total > 0 ? Math.round(attendanceStats.present / attendanceStats.total * 100) : 0}<span className="editable-text" data-unique-id="47b8cd54-0c21-4bbd-9cc3-631e05312264" data-file-name="app/dashboard/components/StudentDashboard.tsx">%
          </span></p>
          <div className="flex items-center mt-1 text-xs text-white" data-unique-id="6abf7511-53ac-440f-b234-0ac3bc956a59" data-file-name="app/dashboard/components/StudentDashboard.tsx">
            <CheckCircle size={12} className="mr-1" />
            <span data-unique-id="78f423ec-d78a-4ef9-bbb8-20559c7e2711" data-file-name="app/dashboard/components/StudentDashboard.tsx" data-dynamic-text="true">{attendanceStats.present}<span className="editable-text" data-unique-id="134250b0-7346-43ca-99ef-a666f61b6eba" data-file-name="app/dashboard/components/StudentDashboard.tsx">/</span>{attendanceStats.total}<span className="editable-text" data-unique-id="13a21b21-2ab4-47ff-85ed-933d95cfabb1" data-file-name="app/dashboard/components/StudentDashboard.tsx"> hari</span></span>
          </div>
        </div>
        
        <div className="bg-amber-500 rounded-xl shadow-sm p-3 sm:p-4 text-white" data-unique-id="0e54d6b8-c82d-445a-8fbc-9853f6a4bc8a" data-file-name="app/dashboard/components/StudentDashboard.tsx">
          <h3 className="text-xs font-medium text-white mb-1" data-unique-id="05e66d56-8452-425c-8cec-449e4a5de050" data-file-name="app/dashboard/components/StudentDashboard.tsx"><span className="editable-text" data-unique-id="a67e8466-b79a-4c79-96ea-7404c0fdf2fa" data-file-name="app/dashboard/components/StudentDashboard.tsx">Izin</span></h3>
          <p className="text-lg sm:text-xl font-bold text-white" data-unique-id="263e53f6-1ad0-4090-bac6-84c97d2c5645" data-file-name="app/dashboard/components/StudentDashboard.tsx" data-dynamic-text="true">
            {attendanceStats.total > 0 ? Math.round(attendanceStats.permitted / attendanceStats.total * 100) : 0}<span className="editable-text" data-unique-id="d5c32ab2-7c89-4e99-b457-c63af5107c3a" data-file-name="app/dashboard/components/StudentDashboard.tsx">%
          </span></p>
          <div className="flex items-center mt-1 text-xs text-white" data-unique-id="0a247543-10dc-419b-a5e3-473ce9a455f5" data-file-name="app/dashboard/components/StudentDashboard.tsx">
            <AlertCircle size={12} className="mr-1" />
            <span data-unique-id="95ee6ac3-22fd-4c39-afb4-484012cc6693" data-file-name="app/dashboard/components/StudentDashboard.tsx" data-dynamic-text="true">{attendanceStats.permitted}<span className="editable-text" data-unique-id="f480f527-c5c4-4aaf-ba75-3aa0738c46c4" data-file-name="app/dashboard/components/StudentDashboard.tsx">/</span>{attendanceStats.total}<span className="editable-text" data-unique-id="cc71cf82-6ccf-4e2d-a390-b46e9784496e" data-file-name="app/dashboard/components/StudentDashboard.tsx"> hari</span></span>
          </div>
        </div>
        
        <div className="bg-teal-500 rounded-xl shadow-sm p-3 sm:p-4 text-white" data-unique-id="6cc466bd-4d9d-4b7a-8a93-c376a9208536" data-file-name="app/dashboard/components/StudentDashboard.tsx">
          <h3 className="text-xs font-medium text-white mb-1" data-unique-id="4a74fdcb-af90-4533-9f87-457be8baed30" data-file-name="app/dashboard/components/StudentDashboard.tsx"><span className="editable-text" data-unique-id="6c6fdbe1-c244-43ee-8c9a-27d59a888208" data-file-name="app/dashboard/components/StudentDashboard.tsx">Sakit</span></h3>
          <p className="text-lg sm:text-xl font-bold text-white" data-unique-id="d04c50ab-eac8-4992-a223-11a00581641c" data-file-name="app/dashboard/components/StudentDashboard.tsx" data-dynamic-text="true">
            {attendanceStats.total > 0 ? Math.round(attendanceStats.sick / attendanceStats.total * 100) : 0}<span className="editable-text" data-unique-id="1ca7e2b6-84aa-48e6-84e1-c4647e43d185" data-file-name="app/dashboard/components/StudentDashboard.tsx">%
          </span></p>
          <div className="flex items-center mt-1 text-xs text-white" data-unique-id="f9988fd4-a2a7-4a72-9b59-a4045ea50647" data-file-name="app/dashboard/components/StudentDashboard.tsx">
            <AlertCircle size={12} className="mr-1" />
            <span data-unique-id="c992f729-234f-4106-9483-67ebb87b7a1a" data-file-name="app/dashboard/components/StudentDashboard.tsx" data-dynamic-text="true">{attendanceStats.sick}<span className="editable-text" data-unique-id="35517803-3bea-4f04-aad8-36006ededdb2" data-file-name="app/dashboard/components/StudentDashboard.tsx">/</span>{attendanceStats.total}<span className="editable-text" data-unique-id="757c1745-d403-4862-85d2-bd6da2a38ff8" data-file-name="app/dashboard/components/StudentDashboard.tsx"> hari</span></span>
          </div>
        </div>
        
        <div className="bg-red-500 rounded-xl shadow-sm p-3 sm:p-4 text-white" data-unique-id="2abc0215-e95f-4f95-aae1-30878c7f0599" data-file-name="app/dashboard/components/StudentDashboard.tsx">
          <h3 className="text-xs font-medium text-white mb-1" data-unique-id="b9e75c19-400d-4d93-a6cc-91a31b4a86d0" data-file-name="app/dashboard/components/StudentDashboard.tsx"><span className="editable-text" data-unique-id="c0271fed-0322-4dd5-9985-ccb5fe5319cc" data-file-name="app/dashboard/components/StudentDashboard.tsx">Alpha</span></h3>
          <p className="text-lg sm:text-xl font-bold text-white" data-unique-id="5b429561-a89e-4b20-b240-82c1f7c72269" data-file-name="app/dashboard/components/StudentDashboard.tsx" data-dynamic-text="true">
            {attendanceStats.total > 0 ? Math.round(attendanceStats.absent / attendanceStats.total * 100) : 0}<span className="editable-text" data-unique-id="d667365b-60b8-4db7-88a8-2d5104036ec5" data-file-name="app/dashboard/components/StudentDashboard.tsx">%
          </span></p>
          <div className="flex items-center mt-1 text-xs text-white" data-unique-id="1fbebd57-ea9f-47ed-a7b6-59dbe1ae9fda" data-file-name="app/dashboard/components/StudentDashboard.tsx">
            <CheckCircle size={12} className="mr-1" />
            <span data-unique-id="681aada8-72f0-43bc-929d-b81e91921bf6" data-file-name="app/dashboard/components/StudentDashboard.tsx" data-dynamic-text="true">{attendanceStats.absent}<span className="editable-text" data-unique-id="5db40b37-167d-4004-81a6-911f35027eb4" data-file-name="app/dashboard/components/StudentDashboard.tsx">/</span>{attendanceStats.total}<span className="editable-text" data-unique-id="057499a4-9f75-4bb1-b25b-f8e76c727e88" data-file-name="app/dashboard/components/StudentDashboard.tsx"> hari</span></span>
          </div>
        </div>
      </div>

      {/* Recent attendance history */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6" data-unique-id="4c66fd35-101f-42c4-9224-d53da9057c8a" data-file-name="app/dashboard/components/StudentDashboard.tsx">
        <div className="flex items-center mb-4" data-unique-id="d00596c5-64b1-4c60-ba10-34bd815e6420" data-file-name="app/dashboard/components/StudentDashboard.tsx">
          <div className="bg-green-100 p-2 rounded-lg mr-3" data-unique-id="2656085d-29ba-4c9c-841e-f004ca752c3b" data-file-name="app/dashboard/components/StudentDashboard.tsx">
            <Clock className="h-5 w-5 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold" data-unique-id="cfd40924-64d8-4327-acd4-ff5ccfd7ab20" data-file-name="app/dashboard/components/StudentDashboard.tsx"><span className="editable-text" data-unique-id="9f060081-d6a5-4fde-b5cb-5e767c9d2462" data-file-name="app/dashboard/components/StudentDashboard.tsx">Riwayat Kehadiran Terbaru</span></h2>
        </div>
        
        <div className="overflow-x-auto -mx-4 sm:mx-0" data-unique-id="7e314023-b28e-4920-bbb8-fc63432c87da" data-file-name="app/dashboard/components/StudentDashboard.tsx">
          <table className="min-w-full divide-y divide-gray-200" data-unique-id="a0b21a85-93a4-43d6-9a6d-c36307221e69" data-file-name="app/dashboard/components/StudentDashboard.tsx">
            <thead className="bg-gray-50" data-unique-id="01543a93-e25e-431a-9c7f-cf3e96560ab1" data-file-name="app/dashboard/components/StudentDashboard.tsx">
              <tr data-unique-id="5a9d7043-0c5e-4fe3-bbb6-6fca6f0608ab" data-file-name="app/dashboard/components/StudentDashboard.tsx">
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="b703b068-058c-41c9-915a-f313c3ed416c" data-file-name="app/dashboard/components/StudentDashboard.tsx"><span className="editable-text" data-unique-id="4074568c-c882-4d9e-b7b6-aa6e0a45ae51" data-file-name="app/dashboard/components/StudentDashboard.tsx">
                  Tanggal
                </span></th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="5903852c-9d34-4c59-8123-6cbff36d061b" data-file-name="app/dashboard/components/StudentDashboard.tsx"><span className="editable-text" data-unique-id="11cd71a7-7b2f-4ab4-a828-9c6e7ff43610" data-file-name="app/dashboard/components/StudentDashboard.tsx">
                  Status
                </span></th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="ec4abe57-0545-4304-959b-333cdf5fc69d" data-file-name="app/dashboard/components/StudentDashboard.tsx"><span className="editable-text" data-unique-id="8a858264-7456-49e8-aa88-6ba7b9e3f9bb" data-file-name="app/dashboard/components/StudentDashboard.tsx">
                  Waktu
                </span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200" data-unique-id="2d84402c-9a5e-47c3-9c3d-92a807a35e16" data-file-name="app/dashboard/components/StudentDashboard.tsx" data-dynamic-text="true">
              {attendanceHistory.length > 0 ? attendanceHistory.map(record => <tr key={record.id} data-unique-id="0ea141e0-bd96-4bb3-ae70-726542b5c7e1" data-file-name="app/dashboard/components/StudentDashboard.tsx">
                    <td className="px-6 py-4 whitespace-nowrap" data-unique-id="ff884314-ecd8-4134-a62b-614879971152" data-file-name="app/dashboard/components/StudentDashboard.tsx">
                      <div className="text-gray-900" data-unique-id="a7798baf-3ec9-4442-b7ed-4e259d0aea96" data-file-name="app/dashboard/components/StudentDashboard.tsx" data-dynamic-text="true">{formatDisplayDate(record.date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" data-unique-id="d6edbc9f-1ff4-4d82-a628-8e0e9a764827" data-file-name="app/dashboard/components/StudentDashboard.tsx">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${record.status === 'hadir' || record.status === 'present' ? 'bg-green-100 text-green-800' : ''}
                        ${record.status === 'sakit' || record.status === 'sick' ? 'bg-orange-100 text-orange-800' : ''}
                        ${record.status === 'izin' || record.status === 'permitted' ? 'bg-blue-100 text-blue-800' : ''}
                        ${record.status === 'alpha' || record.status === 'absent' ? 'bg-red-100 text-red-800' : ''}
                      `} data-unique-id="ac986ed9-7f3b-45b0-81dc-c354cd243307" data-file-name="app/dashboard/components/StudentDashboard.tsx" data-dynamic-text="true">
                        {record.status === 'hadir' || record.status === 'present' ? 'Hadir' : ''}
                        {record.status === 'sakit' || record.status === 'sick' ? 'Sakit' : ''}
                        {record.status === 'izin' || record.status === 'permitted' ? 'Izin' : ''}
                        {record.status === 'alpha' || record.status === 'absent' ? 'Alpha' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500" data-unique-id="873c119b-d6c1-4328-99ea-01a50bb7b60c" data-file-name="app/dashboard/components/StudentDashboard.tsx" data-dynamic-text="true">
                      {record.time}
                    </td>
                  </tr>) : <tr data-unique-id="f3e139c8-c6cf-4bbd-839f-4566b7913c92" data-file-name="app/dashboard/components/StudentDashboard.tsx">
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500" data-unique-id="07f97cd1-af4c-4dc4-b71d-edc1ff723de5" data-file-name="app/dashboard/components/StudentDashboard.tsx"><span className="editable-text" data-unique-id="d0ff24f3-0175-40bd-81c3-b462e7848b8a" data-file-name="app/dashboard/components/StudentDashboard.tsx">
                    Belum ada riwayat kehadiran
                  </span></td>
                </tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Quick Access */}
      <div className="mb-6" data-unique-id="024924c1-29be-4777-b5c5-236c795a85a8" data-file-name="app/dashboard/components/StudentDashboard.tsx">
        <h2 className="text-lg font-semibold text-gray-800 mb-4" data-unique-id="e2b91295-bde1-4ff8-b3d8-26e3260eef30" data-file-name="app/dashboard/components/StudentDashboard.tsx"><span className="editable-text" data-unique-id="972407a4-0846-41ff-9f5e-24c31f78ac8e" data-file-name="app/dashboard/components/StudentDashboard.tsx">Akses Cepat</span></h2>
        
        <div className="grid grid-cols-2 gap-4" data-unique-id="eccc1e2b-595f-44f3-8a69-9ddfe38d2050" data-file-name="app/dashboard/components/StudentDashboard.tsx">
          <Link href="/dashboard/reports" className="bg-blue-500 rounded-xl shadow-sm p-5 hover:shadow-md transition-all text-white" data-unique-id="76704a3f-5ca4-494f-8105-42961356150a" data-file-name="app/dashboard/components/StudentDashboard.tsx">
            <div className="flex flex-col items-center justify-center" data-unique-id="02c9c5d4-88ee-4b49-bf3c-03652934e08c" data-file-name="app/dashboard/components/StudentDashboard.tsx">
              <div className="bg-blue-400 bg-opacity-30 p-3 rounded-full mb-3" data-unique-id="73396648-9da6-45d7-a5d2-c2bfb4e7cc94" data-file-name="app/dashboard/components/StudentDashboard.tsx">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-medium text-white text-center" data-unique-id="b9bd3b31-f5bc-4be3-8c53-df140ffd5394" data-file-name="app/dashboard/components/StudentDashboard.tsx"><span className="editable-text" data-unique-id="ed8a8e72-fc47-4ba3-936f-2c52e70b74f1" data-file-name="app/dashboard/components/StudentDashboard.tsx">Laporan Kehadiran</span></h3>
            </div>
          </Link>
          
          <Link href="/dashboard/profile-user" className="bg-purple-500 rounded-xl shadow-sm p-5 hover:shadow-md transition-all text-white" data-unique-id="8671e5d2-a5b8-405c-938d-eb38c2166621" data-file-name="app/dashboard/components/StudentDashboard.tsx">
            <div className="flex flex-col items-center justify-center" data-unique-id="46fee8ee-5a95-4cb9-b3b9-89e8b7803b92" data-file-name="app/dashboard/components/StudentDashboard.tsx">
              <div className="bg-purple-400 bg-opacity-30 p-3 rounded-full mb-3" data-unique-id="59aafb22-a365-477f-bd17-b1f2f9051a56" data-file-name="app/dashboard/components/StudentDashboard.tsx">
                <User className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-medium text-white text-center" data-unique-id="7a4a2208-12cb-4c5f-a247-3a175c42ed2b" data-file-name="app/dashboard/components/StudentDashboard.tsx"><span className="editable-text" data-unique-id="b9c06bde-13f6-4b03-b5d6-ad5472e5f8c5" data-file-name="app/dashboard/components/StudentDashboard.tsx">Profil Saya</span></h3>
            </div>
          </Link>
        </div>
      </div>
    </div>;
}