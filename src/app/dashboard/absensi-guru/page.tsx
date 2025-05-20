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
  return <div className="pb-20 md:pb-6" data-unique-id="0f0a8f66-f5ac-43e2-8df1-f40b9d708b30" data-file-name="app/dashboard/absensi-guru/page.tsx" data-dynamic-text="true">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6" data-unique-id="7899a4dd-ab6a-46df-88d9-67fb7c5fc49b" data-file-name="app/dashboard/absensi-guru/page.tsx">
        <div className="flex items-center mb-4 md:mb-0" data-unique-id="31b38120-154f-488f-917a-d9b6c0c3598a" data-file-name="app/dashboard/absensi-guru/page.tsx">
          <Users className="h-7 w-7 text-primary mr-3" />
          <h1 className="text-2xl font-bold text-gray-800" data-unique-id="afd146dc-4ebb-4469-b555-e815a689d562" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="6880dc7e-079b-4de9-895e-bc28efb89b66" data-file-name="app/dashboard/absensi-guru/page.tsx">Absensi Guru & Tenaga Kependidikan</span></h1>
        </div>
        
        <div className="flex gap-3" data-unique-id="66b1a729-1340-4c1e-acff-a8ffaddb5e8c" data-file-name="app/dashboard/absensi-guru/page.tsx">
          <Link href="/dashboard/absensi-guru/scan" className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary hover:bg-opacity-90 transition-colors" data-unique-id="291d89f5-5e27-4584-b179-2ab92772ac7d" data-file-name="app/dashboard/absensi-guru/page.tsx">
            <Camera size={18} />
            <span data-unique-id="8038b32b-5024-4b34-89aa-1698d2f04b18" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="f17785e1-e210-4955-9834-e83dd30c1eb5" data-file-name="app/dashboard/absensi-guru/page.tsx">Scan Absensi</span></span>
          </Link>
          <Link href="/dashboard/absensi-guru/data" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors" data-unique-id="edc4705e-d8cc-4c42-af68-e1e7e60fdbee" data-file-name="app/dashboard/absensi-guru/page.tsx">
            <PlusCircle size={18} />
            <span data-unique-id="70381329-9c82-4181-9cbf-a5ad7593ca03" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="a2eb504e-04b6-4ced-9ea3-f23ce5aa76e8" data-file-name="app/dashboard/absensi-guru/page.tsx">Kelola Data</span></span>
          </Link>
        </div>
      </div>
      
      {loading ? <div className="flex justify-center items-center h-64" data-unique-id="51186197-b2c0-4cf7-b5c3-b384095edad2" data-file-name="app/dashboard/absensi-guru/page.tsx">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </div> : <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" data-unique-id="9d7547bc-2de5-4229-9db9-fa37917ca602" data-file-name="app/dashboard/absensi-guru/page.tsx">
            <motion.div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-md" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3
        }} data-unique-id="255cdeee-ac74-482e-bb31-f4d8f467fce0" data-file-name="app/dashboard/absensi-guru/page.tsx">
              <div className="flex items-center mb-2" data-unique-id="9220fd50-f6fe-443b-898a-2b295a997305" data-file-name="app/dashboard/absensi-guru/page.tsx">
                <Users className="h-8 w-8 text-white mr-3" />
                <h3 className="font-semibold text-lg" data-unique-id="be5af641-a072-462b-9430-8698aa276758" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="696c1988-64a1-4498-894d-c4953b4b8dcd" data-file-name="app/dashboard/absensi-guru/page.tsx">Total Guru & Tendik</span></h3>
              </div>
              <p className="text-4xl font-bold" data-unique-id="24d15b25-30fb-4556-ac7f-ba9755c5d766" data-file-name="app/dashboard/absensi-guru/page.tsx" data-dynamic-text="true">{stats.totalTeachers}</p>
              <p className="text-sm text-blue-100 mt-2" data-unique-id="f315c86a-d9ef-4502-ba93-b082dfb5a30d" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="ce78cd77-d911-48f9-86a2-a96526b876fc" data-file-name="app/dashboard/absensi-guru/page.tsx">Terdaftar di sistem</span></p>
            </motion.div>
            
            <motion.div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-md" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3,
          delay: 0.1
        }} data-unique-id="7af85f6c-34ff-4a96-bd80-8d69323c5845" data-file-name="app/dashboard/absensi-guru/page.tsx">
              <div className="flex items-center mb-2" data-unique-id="03f316f4-3bd2-450d-b258-e76fb3c640f7" data-file-name="app/dashboard/absensi-guru/page.tsx">
                <Zap className="h-8 w-8 text-white mr-3" />
                <h3 className="font-semibold text-lg" data-unique-id="a84bf05b-3ce1-4dd7-9f78-b1c2b77e76a6" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="7481f032-b0a9-4c36-b062-4f677a74e088" data-file-name="app/dashboard/absensi-guru/page.tsx">Hadir</span></h3>
              </div>
              <p className="text-4xl font-bold" data-unique-id="f0667b08-b45d-4091-a2ac-a3f801e6a800" data-file-name="app/dashboard/absensi-guru/page.tsx" data-dynamic-text="true">{stats.presentToday}</p>
              <p className="text-sm text-green-100 mt-2" data-unique-id="8fb9c8ae-8210-4543-a8c7-9ee6a101878e" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="749916d7-9533-4ea2-a56a-d83ff0ca4297" data-file-name="app/dashboard/absensi-guru/page.tsx">Guru hadir hari ini</span></p>
            </motion.div>
            
            <motion.div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-md" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3,
          delay: 0.2
        }} data-unique-id="66c7c4f3-6c86-4bc2-b0e7-53298a9b219f" data-file-name="app/dashboard/absensi-guru/page.tsx">
              <div className="flex items-center mb-2" data-unique-id="6e8ad2c7-f06e-4a67-964a-6b30e8c522fa" data-file-name="app/dashboard/absensi-guru/page.tsx">
                <Clock className="h-8 w-8 text-white mr-3" />
                <h3 className="font-semibold text-lg" data-unique-id="8305e220-70e5-4739-ae71-c7a0ec00b318" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="83d9998c-c7f9-430a-a7c9-b19f04c32d33" data-file-name="app/dashboard/absensi-guru/page.tsx">Terlambat</span></h3>
              </div>
              <p className="text-4xl font-bold" data-unique-id="60f8fc85-c837-4dae-bbbd-9276c17188fe" data-file-name="app/dashboard/absensi-guru/page.tsx" data-dynamic-text="true">{stats.lateToday}</p>
              <p className="text-sm text-orange-100 mt-2" data-unique-id="4adffa96-924e-436f-bacd-8f421baf580d" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="2bbac0be-43a1-4bff-bcd5-3a8aa67c89ea" data-file-name="app/dashboard/absensi-guru/page.tsx">Guru terlambat hari ini</span></p>
            </motion.div>
            
            <motion.div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white shadow-md" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3,
          delay: 0.3
        }} data-unique-id="537f3617-d613-456d-82d7-90018f96379b" data-file-name="app/dashboard/absensi-guru/page.tsx">
              <div className="flex items-center mb-2" data-unique-id="d28b14ee-e5ee-4ed3-bde1-fdaa5a6c7cd7" data-file-name="app/dashboard/absensi-guru/page.tsx">
                <Calendar className="h-8 w-8 text-white mr-3" data-unique-id="9d00a8fa-89c1-491c-abda-8e0df6fddc54" data-file-name="app/dashboard/absensi-guru/page.tsx" />
                <h3 className="font-semibold text-lg" data-unique-id="25f34d80-2af9-4b6e-a95f-4f67ae0ae543" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="eea577bc-5412-4c05-99c6-c942347ac910" data-file-name="app/dashboard/absensi-guru/page.tsx">Belum Absen</span></h3>
              </div>
              <p className="text-4xl font-bold" data-unique-id="b1a46395-2261-43ad-99bd-0d5eff5be1b7" data-file-name="app/dashboard/absensi-guru/page.tsx" data-dynamic-text="true">{stats.absentToday}</p>
              <p className="text-sm text-red-100 mt-2" data-unique-id="9158b3eb-0f04-4c06-a852-8e1a1a8e7ffe" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="3170389f-0926-48c1-af4c-72be4eefe9bc" data-file-name="app/dashboard/absensi-guru/page.tsx">Guru belum absen hari ini</span></p>
            </motion.div>
          </div>
          
          {/* Quick Access */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6" data-unique-id="7d941607-5649-42a1-aa1d-efd49345c465" data-file-name="app/dashboard/absensi-guru/page.tsx">
            <h2 className="text-lg font-semibold mb-4" data-unique-id="ac77945d-a962-4265-81b8-095a9738d653" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="9a24374a-a5de-4202-939d-a8ba396c8630" data-file-name="app/dashboard/absensi-guru/page.tsx">Akses Cepat</span></h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-unique-id="5703856a-c9f1-4a0b-b58a-eed544890507" data-file-name="app/dashboard/absensi-guru/page.tsx">
              <Link href="/dashboard/absensi-guru/scan" className="flex flex-col items-center p-4 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors" data-unique-id="275a38c5-5c35-4085-8c26-8327715092d3" data-file-name="app/dashboard/absensi-guru/page.tsx">
                <Camera className="h-10 w-10 text-blue-600 mb-2" />
                <span className="font-medium text-blue-800" data-unique-id="2641bcd7-fe22-4ff1-8bd1-38a9559f5a8f" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="42e5aea2-117a-4d5f-8f7a-4fe4fc53bd27" data-file-name="app/dashboard/absensi-guru/page.tsx">Scan Absensi</span></span>
              </Link>
              
              <Link href="/dashboard/absensi-guru/data" className="flex flex-col items-center p-4 bg-green-50 rounded-xl border border-green-100 hover:bg-green-100 transition-colors" data-unique-id="b324f29e-1212-40d8-981e-afbdf86b3e02" data-file-name="app/dashboard/absensi-guru/page.tsx">
                <Users className="h-10 w-10 text-green-600 mb-2" />
                <span className="font-medium text-green-800" data-unique-id="519d6c19-419f-4342-b9eb-cd077e68ef84" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="37ae5bf4-abc1-48a4-a8ae-548643b3df00" data-file-name="app/dashboard/absensi-guru/page.tsx">Data Guru</span></span>
              </Link>
              
              <Link href="/dashboard/absensi-guru/reports" className="flex flex-col items-center p-4 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 transition-colors" data-unique-id="8fc46adf-15e8-47bb-b42e-b389efab7aaa" data-file-name="app/dashboard/absensi-guru/page.tsx">
                <FileText className="h-10 w-10 text-purple-600 mb-2" />
                <span className="font-medium text-purple-800" data-unique-id="de0b232a-4464-4bfd-87cb-a5e18a4a49cb" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="1ff52f14-55c7-4365-abaa-5af37240a8e1" data-file-name="app/dashboard/absensi-guru/page.tsx">Laporan</span></span>
              </Link>
              
              <Link href="/dashboard/absensi-guru/settings" className="flex flex-col items-center p-4 bg-amber-50 rounded-xl border border-amber-100 hover:bg-amber-100 transition-colors" data-unique-id="1bc63621-59f0-4b93-86fe-6da4850cae00" data-file-name="app/dashboard/absensi-guru/page.tsx">
                <Settings className="h-10 w-10 text-amber-600 mb-2" />
                <span className="font-medium text-amber-800" data-unique-id="19652465-68f8-4b65-aa4f-d07bcf403eb0" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="41f75803-aa22-4bd1-9ef2-d47b9a1b0dfd" data-file-name="app/dashboard/absensi-guru/page.tsx">Pengaturan</span></span>
              </Link>
            </div>
          </div>
          
          {/* Recent Attendance */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden" data-unique-id="63438b40-0b47-402b-98b1-8db00c50add8" data-file-name="app/dashboard/absensi-guru/page.tsx" data-dynamic-text="true">
            <div className="p-6 border-b border-gray-100" data-unique-id="36dd791f-a3e0-4abd-83dd-63ededf3dbff" data-file-name="app/dashboard/absensi-guru/page.tsx">
              <h2 className="text-lg font-semibold" data-unique-id="dd1a96aa-25de-4e71-bb8f-a0a28de3858c" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="74de4f89-323f-4116-b538-2f380b6bce29" data-file-name="app/dashboard/absensi-guru/page.tsx">Riwayat Absensi Terbaru</span></h2>
            </div>
            
            {recentAttendance.length > 0 ? <div className="overflow-x-auto" data-unique-id="bb4d9172-86f6-420c-993f-690c474f2fb6" data-file-name="app/dashboard/absensi-guru/page.tsx">
                <table className="w-full" data-unique-id="38bbbfef-ace9-455a-ae98-e18e84f77401" data-file-name="app/dashboard/absensi-guru/page.tsx">
                  <thead data-unique-id="14ab61a2-26bf-4041-a4ec-cb6c523b50d8" data-file-name="app/dashboard/absensi-guru/page.tsx">
                    <tr className="bg-gray-50 text-left" data-unique-id="a54929ee-c05c-4ed0-8bd8-b53d155ec0df" data-file-name="app/dashboard/absensi-guru/page.tsx">
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="38c165c4-9d03-4006-880c-b001a2798571" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="b9f3bb4d-c2f2-40a8-b316-5cd3f5b27ac8" data-file-name="app/dashboard/absensi-guru/page.tsx">Nama</span></th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="399b506f-bc8a-4424-858a-7fdaec8727e6" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="585e4f29-9a0f-4100-9494-c07a118b63e3" data-file-name="app/dashboard/absensi-guru/page.tsx">Tanggal</span></th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="394aa4e3-47ab-4d9e-bdd3-0e2e037dedc6" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="57a8df74-7bd6-4c61-94af-ce0c0372fc54" data-file-name="app/dashboard/absensi-guru/page.tsx">Waktu</span></th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="92c3973f-55d7-4081-9520-d9716307b372" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="a8bb14b5-08bc-4a86-8f10-bdad809e1564" data-file-name="app/dashboard/absensi-guru/page.tsx">Status</span></th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" data-unique-id="9c902ddf-6c32-4c5e-970b-bd083b5c4f5d" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="f7a97be0-3445-4683-a305-e6952ea83591" data-file-name="app/dashboard/absensi-guru/page.tsx">Jenis</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200" data-unique-id="a606ee79-f5b3-4821-89ad-f03ec1c57016" data-file-name="app/dashboard/absensi-guru/page.tsx" data-dynamic-text="true">
                    {recentAttendance.map(entry => <tr key={entry.id} className="hover:bg-gray-50" data-unique-id="5988314b-a623-4856-9a6d-e1011433fc60" data-file-name="app/dashboard/absensi-guru/page.tsx">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" data-unique-id="55599bd7-2b20-4c9c-a2bc-b9b0f224e6c7" data-file-name="app/dashboard/absensi-guru/page.tsx" data-dynamic-text="true">{entry.teacherName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-unique-id="c9f1077d-5d3e-4762-92c5-f7d3eee38308" data-file-name="app/dashboard/absensi-guru/page.tsx" data-dynamic-text="true">{formatDate(entry.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-unique-id="9c9769fc-6f09-464d-8e21-0d2918de422a" data-file-name="app/dashboard/absensi-guru/page.tsx" data-dynamic-text="true">{entry.time}</td>
                        <td className="px-6 py-4 whitespace-nowrap" data-unique-id="ef3db7b9-4654-48f1-80a1-fd78fe6931ac" data-file-name="app/dashboard/absensi-guru/page.tsx">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${entry.status === "present" ? "bg-green-100 text-green-800" : entry.status === "late" ? "bg-orange-100 text-orange-800" : "bg-red-100 text-red-800"}`} data-unique-id="c89fc93f-98ab-4722-b38b-a375043a3be8" data-file-name="app/dashboard/absensi-guru/page.tsx" data-dynamic-text="true">
                            {entry.status === "present" ? "Hadir" : entry.status === "late" ? "Terlambat" : "Tidak Hadir"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-unique-id="eb1dc225-0464-47be-8ac2-6e11bf76fd88" data-file-name="app/dashboard/absensi-guru/page.tsx" data-dynamic-text="true">
                          {entry.type === "in" ? "Masuk" : "Pulang"}
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </div> : <div className="text-center py-12 text-gray-500" data-unique-id="82348f90-99ac-4cfc-b900-226cf3127442" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="55c66f98-9b0e-488e-8ed8-93b28347548d" data-file-name="app/dashboard/absensi-guru/page.tsx">
                Belum ada data absensi guru
              </span></div>}
            
            <div className="p-4 border-t border-gray-100 flex justify-end" data-unique-id="31445701-b9e6-4ac5-a734-1b159f5c6bfe" data-file-name="app/dashboard/absensi-guru/page.tsx">
              <Link href="/dashboard/absensi-guru/reports" className="text-primary font-medium hover:underline text-sm flex items-center" data-unique-id="8358a818-8898-4a99-bc37-0d765fe2f5d2" data-file-name="app/dashboard/absensi-guru/page.tsx"><span className="editable-text" data-unique-id="7cb14006-73e7-440c-8c17-63f7b05596f5" data-file-name="app/dashboard/absensi-guru/page.tsx">
                Lihat semua riwayat
                </span><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor" data-unique-id="33e56c6a-4ca4-412e-a0bb-9e6abf50e586" data-file-name="app/dashboard/absensi-guru/page.tsx">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </>}
    </div>;
}