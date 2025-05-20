"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Users, Calendar, MapPin, Clock, Zap, Camera, Settings, FileText, PlusCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
export default function AbsensiGuruPage() {
  const {
    user,
    userRole,
    schoolId
  } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTeachers: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0
  });
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);

  // Load dashboard data
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

        // Get teacher data
        const {
          collection,
          query,
          where,
          getDocs,
          orderBy,
          limit
        } = await import("firebase/firestore");
        const {
          db
        } = await import("@/lib/firebase");

        // Get teachers count
        const teachersRef = collection(db, "users");
        const teachersQuery = query(teachersRef, where("schoolId", "==", schoolId), where("role", "in", ["teacher", "staff"]));
        const teachersSnapshot = await getDocs(teachersQuery);
        const teachersCount = teachersSnapshot.size;

        // Get today's date
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format

        // Get today's attendance
        const attendanceRef = collection(db, "teacherAttendance");
        const attendanceQuery = query(attendanceRef, where("schoolId", "==", schoolId), where("date", "==", todayStr), orderBy("timestamp", "desc"));
        const attendanceSnapshot = await getDocs(attendanceQuery);
        const attendance = attendanceSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Calculate stats
        const presentToday = attendance.filter(a => (a as any).status === "present").length;
        const lateToday = attendance.filter(a => (a as any).status === "late").length;
        const absentToday = teachersCount - presentToday - lateToday;
        setStats({
          totalTeachers: teachersCount,
          presentToday,
          lateToday,
          absentToday
        });

        // Get recent attendance records
        const recentAttendanceRef = collection(db, "teacherAttendance");
        const recentAttendanceQuery = query(recentAttendanceRef, where("schoolId", "==", schoolId), orderBy("timestamp", "desc"), limit(5));
        const recentAttendanceSnapshot = await getDocs(recentAttendanceQuery);
        const recentAttendanceData = recentAttendanceSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecentAttendance(recentAttendanceData);
      } catch (error) {
        console.error("Error loading teacher attendance data:", error);
        toast.error("Gagal memuat data absensi guru");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [schoolId, userRole, router]);

  // Format date function
  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    return new Date(dateStr).toLocaleDateString('id-ID', options);
  };
  return <div className="pb-20 md:pb-6" data-unique-id="be987b12-e273-4df7-8641-28a59725a3fd" data-file-name="app/dashboard/absensi-guru/page.tsx" data-dynamic-text="true">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6" data-unique-id="4b8fd539-7881-4e1c-b578-6121e1a060e0" data-file-name="app/dashboard/absensi-guru/page.tsx">
        <div className="flex items-center mb-4 md:mb-0" data-unique-id="feefae41-e1e6-465f-ad71-50de1b4e7508" data-file-name="app/dashboard/absensi-guru/page.tsx">
          <Users className="h-7 w-7 text-primary mr-3" />
          <h1 className="text-2xl font-bold text-gray-800" data-unique-id="f39a2e74-1776-4e21-b164-7b276ed03fd4" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="86fb183d-7d02-4fc6-b380-768f70967487" data-file-name="app/dashboard/absensi-guru/page.tsx">Absensi Guru & Tenaga Kependidikan</span></h1>
        </div>
        
        <div className="flex gap-3" data-unique-id="95030a51-1203-4ad1-9a87-9de21d078483" data-file-name="app/dashboard/absensi-guru/page.tsx">
          {/*<Link href="/dashboard/absensi-guru/scan" className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary hover:bg-opacity-90 transition-colors" data-unique-id="a64b1d90-bdb7-4e8c-b3ab-62a59be34946" data-file-name="app/dashboard/absensi-guru/page.tsx">
            <Camera size={18} />
            <span data-unique-id="4cd9ce58-458f-4e86-ad63-ddb815e4cea8" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="2d9d7a41-0237-4720-9cd1-d15a882ca761" data-file-name="app/dashboard/absensi-guru/page.tsx">Scan Absensi</span></span>
          </Link>
          <Link href="/dashboard/absensi-guru/data" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors" data-unique-id="4310ce17-80d6-4e01-b443-bdf23bcf72dc" data-file-name="app/dashboard/absensi-guru/page.tsx">
            <PlusCircle size={18} />
            <span data-unique-id="c168398a-2942-45d1-9fb4-cb9983b5740d" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="7f235a35-c4e4-482c-908c-f11a33ef3d6e" data-file-name="app/dashboard/absensi-guru/page.tsx">Kelola Data</span></span>
          </Link>*/}
        </div>
      </div>
      
      {loading ? <div className="flex justify-center items-center h-64" data-unique-id="7570c11b-afa7-4cdd-a510-bcfc304cb6a5" data-file-name="app/dashboard/absensi-guru/page.tsx">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </div> : <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" data-unique-id="d34093c3-565a-4ef0-9fd8-2b46bcfcfbc3" data-file-name="app/dashboard/absensi-guru/page.tsx">
            <motion.div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-md" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3
        }} data-unique-id="ef4ad21f-01a9-46f8-a5d9-7a94a02cdedb" data-file-name="app/dashboard/absensi-guru/page.tsx">
              <div className="flex items-center mb-1" data-unique-id="ee06ab95-f887-4ec3-bfdf-c8a124d9d61f" data-file-name="app/dashboard/absensi-guru/page.tsx">
                <Users className="h-7 w-7 text-white mr-3" />
                <h3 className="font-semibold text-base" data-unique-id="3b5a78be-63cd-49f9-a29a-00a920b77b02" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="90f7430a-5a13-405b-81fc-393e51b369a6" data-file-name="app/dashboard/absensi-guru/page.tsx">Jumlah Guru</span></h3>
              </div>
              <p className="text-2xl font-bold" data-unique-id="ca0600ae-dce7-4e2b-be2a-80e8234042f9" data-file-name="app/dashboard/absensi-guru/page.tsx" data-dynamic-text="true">{stats.totalTeachers}</p>
              <p className="text-xs text-blue-100 mt-1" data-unique-id="9869bb41-6ef7-4370-824c-8890a198c700" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="8af1cf12-84b5-4f37-8792-5da4c8314b3f" data-file-name="app/dashboard/absensi-guru/page.tsx">Terdaftar di sistem</span></p>
            </motion.div>
            
            <motion.div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-md" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3,
          delay: 0.1
        }} data-unique-id="44f9e727-f87e-469f-b30d-39819b57023d" data-file-name="app/dashboard/absensi-guru/page.tsx">
              <div className="flex items-center mb-1" data-unique-id="cec3c1e5-d9eb-4d0f-82b9-09d72af2d7ab" data-file-name="app/dashboard/absensi-guru/page.tsx">
                <Zap className="h-7 w-7 text-white mr-3" />
                <h3 className="font-semibold text-base" data-unique-id="039f763b-df20-4016-8ea9-4bab80a3026b" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="6cecfba3-81dc-4146-b1f7-0ff70f199154" data-file-name="app/dashboard/absensi-guru/page.tsx">Hadir</span></h3>
              </div>
              <p className="text-2xl font-bold" data-unique-id="d369fa40-5811-4c06-a356-7d73498b7ddf" data-file-name="app/dashboard/absensi-guru/page.tsx" data-dynamic-text="true">{stats.presentToday}</p>
              <p className="text-xs text-green-100 mt-1" data-unique-id="751087da-af55-4488-92c5-031cb923c119" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="8a7e8aa4-7d17-466d-a61d-699fec374086" data-file-name="app/dashboard/absensi-guru/page.tsx">Guru hadir hari ini</span></p>
            </motion.div>
            
            <motion.div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-md" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3,
          delay: 0.2
        }} data-unique-id="78924ad9-a22e-47ac-b027-d5e54495a005" data-file-name="app/dashboard/absensi-guru/page.tsx">
              <div className="flex items-center mb-1" data-unique-id="0d50a9a1-ea35-4751-8bc3-ff8f61935696" data-file-name="app/dashboard/absensi-guru/page.tsx">
                <Clock className="h-7 w-7 text-white mr-3" />
                <h3 className="font-semibold text-base" data-unique-id="8a23a9b8-7a34-4a36-a894-44bd2c63df2f" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="6b8832ab-2aa8-4c91-a128-2a2b19c6e261" data-file-name="app/dashboard/absensi-guru/page.tsx">Terlambat</span></h3>
              </div>
              <p className="text-2xl font-bold" data-unique-id="ac0cf6e8-bec7-40a9-a51e-86b68e9277c2" data-file-name="app/dashboard/absensi-guru/page.tsx" data-dynamic-text="true">{stats.lateToday}</p>
              <p className="text-xs text-orange-100 mt-1" data-unique-id="f7225982-3a6c-4a7e-9b06-47ae1b1b1b7f" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="7f2b261f-24b3-46f5-92fd-884fe70cfeb1" data-file-name="app/dashboard/absensi-guru/page.tsx">Guru terlambat hari ini</span></p>
            </motion.div>
            
            <motion.div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white shadow-md" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3,
          delay: 0.3
        }} data-unique-id="0ea4e2b9-59f9-4db4-bbd3-ad0ee31a2598" data-file-name="app/dashboard/absensi-guru/page.tsx">
              <div className="flex items-center mb-1" data-unique-id="3211999d-d391-4600-9ab8-cf948312c526" data-file-name="app/dashboard/absensi-guru/page.tsx">
                <Calendar className="h-7 w-7 text-white mr-3" data-unique-id="546ba23e-74ec-4e3a-8773-e8a1d3bc52af" data-file-name="app/dashboard/absensi-guru/page.tsx" />
                <h3 className="font-semibold text-base" data-unique-id="a6a2e5e4-4294-4699-af2a-8a6a5d499034" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="f41f4445-6188-4d7c-8480-3c100d734e0b" data-file-name="app/dashboard/absensi-guru/page.tsx">Belum Absen</span></h3>
              </div>
              <p className="text-2xl font-bold" data-unique-id="50fde729-4b3d-493a-887d-9a445f0de3df" data-file-name="app/dashboard/absensi-guru/page.tsx" data-dynamic-text="true">{stats.absentToday}</p>
              <p className="text-xs text-red-100 mt-1" data-unique-id="7a40da2f-4343-4670-b8bd-6e464a6fe41a" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="4a768b87-4b1f-46fd-9ae1-4da2cb9bcd0e" data-file-name="app/dashboard/absensi-guru/page.tsx">Guru belum absen hari ini</span></p>
            </motion.div>
          </div>
          
         
          
          {/* Recent Attendance */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden" data-unique-id="235fbb04-6698-46e8-bc05-3ba2bc521d24" data-file-name="app/dashboard/absensi-guru/page.tsx" data-dynamic-text="true">
            
            <div className="p-6 border-b border-gray-100" data-unique-id="76e5c98a-93f9-4f65-97fa-67c45a23e9e9" data-file-name="app/dashboard/absensi-guru/page.tsx">
              
              <h2 className="text-lg font-semibold" data-unique-id="f3941cd3-0a89-45c1-b6dc-a63dd3f41778" data-file-name="app/dashboard/absensi-guru/page.tsx">
                
                <span className="editable-text" data-unique-id="6b19a077-9ce8-4ce7-8003-22315c6e521b" data-file-name="app/dashboard/absensi-guru/page.tsx">Riwayat Absensi Terbaru</span>
              
              </h2>
            </div>
            
            {recentAttendance.length > 0 ? <div className="overflow-x-auto" data-unique-id="dbc6683b-e5c8-434b-9e06-d7d9cc2f2be7" data-file-name="app/dashboard/absensi-guru/page.tsx">
                <table className="w-full" data-unique-id="d2f8bf77-13b6-4f2d-afbd-1a6854b1ec4e" data-file-name="app/dashboard/absensi-guru/page.tsx">
                  <thead data-unique-id="720b04ea-dc82-4f65-a237-dc80d703fb04" data-file-name="app/dashboard/absensi-guru/page.tsx">
                    <tr className="bg-gray-50 text-left" data-unique-id="b75cc620-dc0f-452a-b081-2248b0112f41" data-file-name="app/dashboard/absensi-guru/page.tsx">
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="37609f2e-034d-482d-b5f2-9a91e4b3d123" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="42f4e90d-f96e-416e-85c9-3ea68b445681" data-file-name="app/dashboard/absensi-guru/page.tsx">Nama</span></th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="ffc8df6d-e255-4f3e-b199-8b2d0b2b1c40" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="99a1ad19-56c0-44bf-bec9-93bdf5d2627a" data-file-name="app/dashboard/absensi-guru/page.tsx">Tanggal</span></th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="98a95e16-52e8-4b63-b888-8475f5610be3" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="e4ebdd67-559e-4d81-ab2d-3ad84f852c7a" data-file-name="app/dashboard/absensi-guru/page.tsx">Waktu</span></th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="26703985-c48d-4d4a-b6ac-13803f79deff" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="7b997630-0290-4a65-97c4-944b0a15a452" data-file-name="app/dashboard/absensi-guru/page.tsx">Status</span></th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="b2c64a0b-d67b-4bb9-84d3-3237abc744ba" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="80538d99-41b6-4bc4-b21f-2913b4419704" data-file-name="app/dashboard/absensi-guru/page.tsx">Jenis</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200" data-unique-id="204ebd30-ada7-4055-b40a-e92ab5d7276a" data-file-name="app/dashboard/absensi-guru/page.tsx" data-dynamic-text="true">
                    {recentAttendance.map(entry => <tr key={entry.id} className="hover:bg-gray-50" data-is-mapped="true" data-unique-id="3465a31b-9525-4056-923c-2308e9ca6c24" data-file-name="app/dashboard/absensi-guru/page.tsx">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" data-is-mapped="true" data-unique-id="6fb7f69b-a089-47af-b47e-2a8cf9b9d87d" data-file-name="app/dashboard/absensi-guru/page.tsx" data-dynamic-text="true">{entry.teacherName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-is-mapped="true" data-unique-id="e7d09233-baa7-4e0d-96d6-362f611cbeaa" data-file-name="app/dashboard/absensi-guru/page.tsx" data-dynamic-text="true">{formatDate(entry.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-is-mapped="true" data-unique-id="672a7803-b7d2-46fe-ada6-cd8a43c3a57b" data-file-name="app/dashboard/absensi-guru/page.tsx" data-dynamic-text="true">{entry.time}</td>
                        <td className="px-6 py-4 whitespace-nowrap" data-is-mapped="true" data-unique-id="55084422-2346-43c8-8adb-42d4a0cb36d6" data-file-name="app/dashboard/absensi-guru/page.tsx">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${entry.status === "present" ? "bg-green-100 text-green-800" : entry.status === "late" ? "bg-orange-100 text-orange-800" : "bg-red-100 text-red-800"}`} data-is-mapped="true" data-unique-id="4d7fe745-a6a7-4fc4-bfb5-e1b563093d5f" data-file-name="app/dashboard/absensi-guru/page.tsx" data-dynamic-text="true">
                            {entry.status === "present" ? "Hadir" : entry.status === "late" ? "Terlambat" : "Tidak Hadir"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-is-mapped="true" data-unique-id="cecdfe15-6a02-47b1-a107-0026fa2c5bb6" data-file-name="app/dashboard/absensi-guru/page.tsx" data-dynamic-text="true">
                          {entry.type === "in" ? "Masuk" : "Pulang"}
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </div> : <div className="text-center py-12 text-gray-500" data-unique-id="6a9f7a49-a01f-4c77-8edc-9f70f6035474" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="79c0df1f-93be-4608-9fa5-e7ab8bde6a74" data-file-name="app/dashboard/absensi-guru/page.tsx">
                Belum ada data absensi guru
              </span></div>}
            
            <div className="p-4 border-t border-gray-100 flex justify-end" data-unique-id="6011ce01-220e-4ed2-957b-a036cf19a4db" data-file-name="app/dashboard/absensi-guru/page.tsx">
              <Link href="/dashboard/absensi-guru/reports" className="text-primary font-medium hover:underline text-sm flex items-center" data-unique-id="c21f07cb-38f9-4067-bc07-854c53d58a8d" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="7f974ce4-a3f7-453e-9883-f1395e5d2aa7" data-file-name="app/dashboard/absensi-guru/page.tsx">
                Lihat semua riwayat
                </span><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor" data-unique-id="40227377-fd7c-43b0-82ba-db1ffde1d533" data-file-name="app/dashboard/absensi-guru/page.tsx">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>

 {/* Quick Access */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6" data-unique-id="d8ed1595-71c6-40b8-9c73-d97e954ec38e" data-file-name="app/dashboard/absensi-guru/page.tsx">
                     
            <h2 className="text-lg font-semibold mb-4" data-unique-id="c9168274-eae5-4078-9121-bb7c2d47749a" data-file-name="app/dashboard/absensi-guru/page.tsx">
              
            <span className="editable-text" data-unique-id="30cfbc72-86e7-4599-ba40-09c1f771ac96" data-file-name="app/dashboard/absensi-guru/page.tsx"> Akses Cepat</span></h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-unique-id="8e064cf0-b7f4-400c-8610-cc86edbbf46e" data-file-name="app/dashboard/absensi-guru/page.tsx">
              <Link href="/dashboard/absensi-guru/scan" className="flex flex-col items-center p-4 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors" data-unique-id="77289fd9-ef3e-4a32-a7a9-2969f6bd163e" data-file-name="app/dashboard/absensi-guru/page.tsx">
                <Camera className="h-10 w-10 text-blue-600 mb-2" />
                <span className="font-medium text-blue-800" data-unique-id="92042028-da93-4aa8-ba4b-53dc2a5756e7" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="30ff822d-68dc-4830-a66d-61ea25fb2d27" data-file-name="app/dashboard/absensi-guru/page.tsx">Scan Absensi</span></span>
              </Link>
              
              <Link href="/dashboard/absensi-guru/data" className="flex flex-col items-center p-4 bg-green-50 rounded-xl border border-green-100 hover:bg-green-100 transition-colors" data-unique-id="e23b5e6b-488c-40c0-951b-18155594ce09" data-file-name="app/dashboard/absensi-guru/page.tsx">
                <Users className="h-10 w-10 text-green-600 mb-2" />
                <span className="font-medium text-green-800" data-unique-id="524f1a05-df67-412f-adca-0f688c16d734" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="bfdf6807-7522-4f7f-ae2f-eea062a77231" data-file-name="app/dashboard/absensi-guru/page.tsx">Data Guru</span></span>
              </Link>
              
              <Link href="/dashboard/absensi-guru/reports" className="flex flex-col items-center p-4 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 transition-colors" data-unique-id="4ad2dce4-87ad-46f2-8d87-a9a759311c8f" data-file-name="app/dashboard/absensi-guru/page.tsx">
                <FileText className="h-10 w-10 text-purple-600 mb-2" />
                <span className="font-medium text-purple-800" data-unique-id="56b4e3d0-3879-489d-affe-f4ca34e137b2" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="52d1a1d7-68d6-4697-a831-0a33b658297f" data-file-name="app/dashboard/absensi-guru/page.tsx">Laporan</span></span>
              </Link>
              
              <Link href="/dashboard/absensi-guru/settings" className="flex flex-col items-center p-4 bg-amber-50 rounded-xl border border-amber-100 hover:bg-amber-100 transition-colors" data-unique-id="620397a9-59d4-4945-8358-fa56397f5c62" data-file-name="app/dashboard/absensi-guru/page.tsx">
                <Settings className="h-10 w-10 text-amber-600 mb-2" />
                <span className="font-medium text-amber-800" data-unique-id="4fecc510-b58a-4f63-8d42-b74a1dd16746" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="fcbcc88d-0838-4523-97cd-ad1c16d2d004" data-file-name="app/dashboard/absensi-guru/page.tsx">Pengaturan</span></span>
              </Link>
            </div>
          </div>

          
        </>}
    </div>;
}
