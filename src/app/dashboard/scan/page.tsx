"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp, limit } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { QrCode, Camera, UserCheck, UserX, Loader2, Clock, Calendar as CalendarIcon, AlertCircle, Bell, Volume2, VolumeX } from "lucide-react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { motion } from "framer-motion";
import Link from "next/link";
import { Scanner as QrScanner, IDetectedBarcode } from "@yudiel/react-qr-scanner";
export default function ScanQR() {
  const {
    schoolId,
    userRole
  } = useAuth();
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [detectedCode, setDetectedCode] = useState<string | null>(null);
  const [student, setStudent] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [scanError, setScanError] = useState<string | null>(null);
  const [muted, setMuted] = useState<boolean>(false);
  const [attendanceStatus, setAttendanceStatus] = useState<string>('hadir');
  const [attendanceNotes, setAttendanceNotes] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Redirect if not admin or teacher
  useEffect(() => {
    if (userRole !== 'admin' && userRole !== 'teacher') {
      router.push('/dashboard');
    }
  }, [userRole, router]);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/sounds/beep.mp3');
  }, []);

  // Update current date and time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const formattedDay = format(currentDateTime, "EEEE", {
    locale: id
  });
  const formattedDate = format(currentDateTime, "d MMMM yyyy", {
    locale: id
  });
  const formattedTime = format(currentDateTime, "HH:mm:ss");

  // Toggle sound
  const toggleMute = () => {
    setMuted(!muted);
  };

  // Handle QR code detection
  const handleScan = async (data: string) => {
    if (data && !loading) {
      // Play sound if not muted
      if (audioRef.current && !muted) {
        audioRef.current.play().catch(e => console.error("Error playing sound:", e));
      }
      setScanning(false);
      setDetectedCode(data);
      fetchStudentByNISN(data);
    }
  };
  const fetchStudentByNISN = async (nisn: string) => {
    if (!schoolId) return;
    try {
      setLoading(true);
      // Query students collection for the given NISN
      // Search by NISN
      const studentsRef = collection(db, "schools", schoolId, "students");
      const q = query(studentsRef, where("nisn", "==", nisn), limit(1));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const studentDoc = snapshot.docs[0];
        setStudent({
          id: studentDoc.id,
          ...studentDoc.data()
        });
      } else {
        setScanError("Siswa tidak ditemukan dalam database");
        setStudent(null);
      }
    } catch (error) {
      console.error("Error fetching student:", error);
      toast.error("Gagal mengambil data siswa");
    } finally {
      setLoading(false);
    }
  };
  const handleAttendance = async () => {
    if (!schoolId || !student) return;
    try {
      setLoading(true);

      // Check if student already has attendance today
      const today = format(currentDateTime, "yyyy-MM-dd");
      const attendanceRef = collection(db, `schools/${schoolId}/attendance`);
      const todayAttendanceQuery = query(attendanceRef, where("studentId", "==", student.id), where("date", "==", today));
      const todayAttendanceSnapshot = await getDocs(todayAttendanceQuery);
      if (!todayAttendanceSnapshot.empty) {
        setScanError(`Siswa ${student.name} sudah melakukan absensi hari ini`);
        setLoading(false);
        return;
      }

      // Prepare attendance data
      const attendanceData = {
        studentId: student.id,
        studentName: student.name,
        nisn: student.nisn,
        class: student.class,
        status: attendanceStatus,
        notes: attendanceStatus !== 'hadir' ? attendanceNotes : '',
        note: attendanceStatus !== 'hadir' ? attendanceNotes : '',
        catatan: attendanceStatus !== 'hadir' ? attendanceNotes : '',
        date: today,
        time: format(currentDateTime, "HH:mm:ss"),
        day: formattedDay,
        timestamp: serverTimestamp(),
        month: format(currentDateTime, "MM-yyyy") // Add month field for easier querying
      };

      // Record attendance in Firestore
      await addDoc(collection(db, `schools/${schoolId}/attendance`), attendanceData);

      // Send Telegram notification
      if (student.telegramNumber) {
        try {
          // Create different messages based on attendance status
          let message = "";
          if (attendanceStatus === 'hadir' || attendanceStatus === 'present') {
            message = `Ananda ${student.name} telah hadir di sekolah pada ${formattedDate} pukul ${format(currentDateTime, "HH:mm")} WIB.`;
          } else if (attendanceStatus === 'sakit' || attendanceStatus === 'sick') {
            message = `Ananda ${student.name} tidak hadir di sekolah pada ${formattedDate} dengan status SAKIT.${attendanceNotes ? `\n\nKeterangan: ${attendanceNotes}` : ''}`;
          } else if (attendanceStatus === 'izin' || attendanceStatus === 'permitted') {
            message = `Ananda ${student.name} tidak hadir di sekolah pada ${formattedDate} dengan status IZIN.${attendanceNotes ? `\n\nKeterangan: ${attendanceNotes}` : ''}`;
          } else if (attendanceStatus === 'alpha' || attendanceStatus === 'absent') {
            message = `Ananda ${student.name} tidak hadir di sekolah pada ${formattedDate} dengan status ALPHA (tanpa keterangan).${attendanceNotes ? `\n\nKeterangan: ${attendanceNotes}` : ''}`;
          }

          // Send notification using the Telegram API
          const BOT_TOKEN = "7662377324:AAEFhwY-y1q3IrX4OEJAUG8VLa8DqNndH6E";
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              chat_id: student.telegramNumber,
              text: message
            })
          });
          console.log("Telegram notification sent successfully");
        } catch (telegramError) {
          console.error("Error sending Telegram notification:", telegramError);
        }
      }
      setSubmitted(true);
      toast.success("Absensi berhasil disimpan dan notifikasi dikirim");
    } catch (error) {
      console.error("Error recording attendance:", error);
      toast.error("Gagal menyimpan data absensi");
    } finally {
      setLoading(false);
    }
  };
  const resetScan = () => {
    setDetectedCode(null);
    setStudent(null);
    setSubmitted(false);
    setScanError(null);
    setScanning(true);
    setAttendanceStatus('hadir');
    setAttendanceNotes('');
  };
  return <div className="max-w-2xl mx-auto pb-20 md:pb-6 px-3 sm:px-4 md:px-6" data-unique-id="af26e3a6-665f-4c61-b312-abc7f601061a" data-file-name="app/dashboard/scan/page.tsx" data-dynamic-text="true">
      <div className="flex justify-between items-center mb-6" data-unique-id="13838cca-a2f8-4cbd-a84e-e985b105bfdc" data-file-name="app/dashboard/scan/page.tsx">
        <div className="flex items-center" data-unique-id="856c64cf-c78b-4c40-99b1-8293c15ac03f" data-file-name="app/dashboard/scan/page.tsx">
          <QrCode className="h-7 w-7 text-primary mr-3" />
          <h1 className="text-2xl font-bold text-gray-800" data-unique-id="e38f5bf7-052e-4404-bd24-a0cb58984481" data-file-name="app/dashboard/scan/page.tsx"><span className="editable-text" data-unique-id="66120661-c612-4198-8a1a-76f44cdb102d" data-file-name="app/dashboard/scan/page.tsx">Scan QR Code Siswa</span></h1>
        </div>
        
        <button onClick={toggleMute} className="p-2 rounded-full hover:bg-gray-100" data-unique-id="f9fe3de1-774c-4441-9eaf-515219992738" data-file-name="app/dashboard/scan/page.tsx" data-dynamic-text="true">
          {muted ? <VolumeX className="h-5 w-5 text-gray-500" /> : <Volume2 className="h-5 w-5 text-primary" />}
        </button>
      </div>
      
      
      {/* Date and Time Display */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-3 sm:mb-5 flex flex-col space-y-2 md:space-y-0 md:flex-row md:justify-between md:items-center" data-unique-id="7efd4079-5d96-4357-b0df-f3459da857b1" data-file-name="app/dashboard/scan/page.tsx">
        <div className="flex items-center mb-3 md:mb-0" data-unique-id="276b4a61-993b-453c-ad5e-bb72befb30c0" data-file-name="app/dashboard/scan/page.tsx">
          <CalendarIcon className="h-5 w-5 text-primary mr-2" />
          <span className="font-medium" data-unique-id="40690c4d-161b-4075-9f1d-50160eb9e7c8" data-file-name="app/dashboard/scan/page.tsx" data-dynamic-text="true">{formattedDay}<span className="editable-text" data-unique-id="41a00d1b-2b8a-4f39-b208-3045c483f74f" data-file-name="app/dashboard/scan/page.tsx">, </span>{formattedDate}</span>
        </div>
        <div className="flex items-center" data-unique-id="372d13e0-349a-49ff-8ff8-a182e051c3c0" data-file-name="app/dashboard/scan/page.tsx">
          <Clock className="h-5 w-5 text-primary mr-2" />
          <span className="font-medium" data-unique-id="22d85c59-b33a-490d-b516-36f287cd4e7b" data-file-name="app/dashboard/scan/page.tsx" data-dynamic-text="true">{formattedTime}</span>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200" data-unique-id="19fc0746-505d-4437-8777-770e04752fe2" data-file-name="app/dashboard/scan/page.tsx" data-dynamic-text="true">
        {detectedCode && student ? <div className="p-6" data-unique-id="8074719c-5660-442b-ba8c-c39e70e9c7c5" data-file-name="app/dashboard/scan/page.tsx" data-dynamic-text="true">
            {loading ? <div className="flex justify-center items-center py-10" data-unique-id="d35a7727-56a7-4874-a6e5-5c217ac828b0" data-file-name="app/dashboard/scan/page.tsx">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div> : submitted ? <motion.div className="text-center py-8" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5
        }} data-unique-id="d87fdfc7-60b1-4470-b198-f3be90d9cba0" data-file-name="app/dashboard/scan/page.tsx">
                <motion.div className={`rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 ${attendanceStatus === 'hadir' ? 'bg-green-100' : attendanceStatus === 'sakit' ? 'bg-orange-100' : attendanceStatus === 'izin' ? 'bg-blue-100' : 'bg-red-100'}`} initial={{
            scale: 0.5
          }} animate={{
            scale: 1
          }} transition={{
            type: "spring",
            stiffness: 300,
            damping: 15
          }} data-unique-id="41ec282d-53b1-469f-90fa-73ca92c5f99c" data-file-name="app/dashboard/scan/page.tsx" data-dynamic-text="true">
                  {attendanceStatus === 'hadir' ? <UserCheck className="h-10 w-10 text-green-600" /> : attendanceStatus === 'sakit' ? <UserCheck className="h-10 w-10 text-orange-600" /> : attendanceStatus === 'izin' ? <UserCheck className="h-10 w-10 text-blue-600" /> : <UserCheck className="h-10 w-10 text-red-600" />}
                </motion.div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2" data-unique-id="0bd5688e-40ce-42f9-8635-d6f119f2216f" data-file-name="app/dashboard/scan/page.tsx"><span className="editable-text" data-unique-id="3bff64b2-0747-484b-ab4b-f1ff40fb2434" data-file-name="app/dashboard/scan/page.tsx">Absensi Berhasil</span></h2>
                <p className="text-gray-600 mb-6" data-unique-id="9fbbc272-902d-4354-a6d2-8bb8c34bbd02" data-file-name="app/dashboard/scan/page.tsx"><span className="editable-text" data-unique-id="dfbddb10-b5af-42f5-bd3a-8bbd5cd44a03" data-file-name="app/dashboard/scan/page.tsx">
                  Absensi untuk </span><span className="font-semibold" data-unique-id="07faafe9-b325-4ff4-aab9-f0f55af0aec3" data-file-name="app/dashboard/scan/page.tsx" data-dynamic-text="true">{student?.name}</span><span className="editable-text" data-unique-id="4d706a89-19ac-4f1e-bce7-07c9bb624e5f" data-file-name="app/dashboard/scan/page.tsx"> telah berhasil dicatat.
                </span></p>
                <p className="text-sm text-gray-500 mb-6" data-unique-id="d5639e6d-3f9e-44bf-9ae2-2a7a2c7bb877" data-file-name="app/dashboard/scan/page.tsx"><span className="editable-text" data-unique-id="cdaabc39-68f3-4890-bc43-fe353a720b44" data-file-name="app/dashboard/scan/page.tsx">
                  Status: </span><span className={`font-medium ${attendanceStatus === 'hadir' ? 'text-emerald-600' : attendanceStatus === 'sakit' ? 'text-orange-600' : attendanceStatus === 'izin' ? 'text-blue-600' : 'text-red-600'}`} data-unique-id="c5a2609e-2237-4429-8fba-1f62c1676706" data-file-name="app/dashboard/scan/page.tsx" data-dynamic-text="true">
                    {attendanceStatus === 'hadir' ? 'Hadir' : attendanceStatus === 'sakit' ? 'Sakit' : attendanceStatus === 'izin' ? 'Izin' : 'Alpha'}
                  </span>
                </p>
                <button onClick={resetScan} className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary hover:bg-opacity-90 transition-colors" data-unique-id="53bc9c07-45b9-4715-81b7-8459a18e6e5f" data-file-name="app/dashboard/scan/page.tsx"><span className="editable-text" data-unique-id="b1a83995-ae69-4040-a1ed-35f21cac6f4b" data-file-name="app/dashboard/scan/page.tsx">
                  Scan Siswa Lain
                </span></button>
              </motion.div> : <div data-unique-id="7770eb2e-2307-43d6-87a7-4f8c876e76da" data-file-name="app/dashboard/scan/page.tsx" data-dynamic-text="true">
                <div className="flex items-center mb-6" data-unique-id="50e774b0-1073-4f8c-846a-f8e5b4612586" data-file-name="app/dashboard/scan/page.tsx">
                  <div className="bg-blue-100 rounded-full p-3" data-unique-id="5a627b9d-88eb-47f6-832f-5928ef98bdd5" data-file-name="app/dashboard/scan/page.tsx">
                    <QrCode className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4" data-unique-id="3ecd1b3c-a2b3-46ac-8f6d-23628dbf43d3" data-file-name="app/dashboard/scan/page.tsx">
                    <h2 className="font-semibold text-lg" data-unique-id="7dc53097-b956-4ac4-b773-74d062d74289" data-file-name="app/dashboard/scan/page.tsx"><span className="editable-text" data-unique-id="02d50080-2c36-455a-84ef-de96df4c50cf" data-file-name="app/dashboard/scan/page.tsx">QR Code Terdeteksi</span></h2>
                    <p className="text-sm text-gray-500" data-unique-id="d522af77-6373-4739-a659-4f38644ef247" data-file-name="app/dashboard/scan/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="1d220c6d-682f-4693-a130-b562e11b69a8" data-file-name="app/dashboard/scan/page.tsx">NISN: </span>{detectedCode}</p>
                  </div>
                </div>
                
                {/* Student Information */}
                <div className="bg-blue-50 rounded-lg p-5 mb-6 border border-blue-100" data-unique-id="f5cfd7cb-6c19-4d6d-9300-f33b9837d38b" data-file-name="app/dashboard/scan/page.tsx">
                  <h3 className="font-semibold text-lg mb-2 text-blue-800" data-unique-id="6d8727fd-e9c8-4217-95be-969b38591ba1" data-file-name="app/dashboard/scan/page.tsx" data-dynamic-text="true">{student.name}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm" data-unique-id="4b2bf996-1477-4eeb-a065-32878bdf9b62" data-file-name="app/dashboard/scan/page.tsx">
                    <div className="bg-white p-3 rounded-md border border-blue-100" data-unique-id="7fdcd7b6-ec1a-45ba-b3e6-48823fdf26dc" data-file-name="app/dashboard/scan/page.tsx">
                      <p className="text-gray-500 text-xs" data-unique-id="c3e3e13f-167c-4ec6-b30a-041d9238193d" data-file-name="app/dashboard/scan/page.tsx"><span className="editable-text" data-unique-id="2b614d53-e3bf-4f4a-bbd9-9ce9921b3122" data-file-name="app/dashboard/scan/page.tsx">Kelas</span></p>
                      <p className="font-medium text-gray-700" data-unique-id="77d38ea6-e60d-401b-b9f8-96f546da305a" data-file-name="app/dashboard/scan/page.tsx" data-dynamic-text="true">{student.class}</p>
                    </div>
                    <div className="bg-white p-3 rounded-md border border-blue-100" data-unique-id="94cb3d9e-1ebe-4dde-9323-09984f2c0128" data-file-name="app/dashboard/scan/page.tsx">
                      <p className="text-gray-500 text-xs" data-unique-id="4eb52ef5-740d-404c-bedb-a61be0e31742" data-file-name="app/dashboard/scan/page.tsx"><span className="editable-text" data-unique-id="e459dfeb-11ed-43d2-b543-4fa6fb3fc9d1" data-file-name="app/dashboard/scan/page.tsx">Jenis Kelamin</span></p>
                      <p className="font-medium text-gray-700" data-unique-id="6a656b3c-9772-4c73-af4f-9aa51f578b7f" data-file-name="app/dashboard/scan/page.tsx" data-dynamic-text="true">{student.gender === "male" ? "Laki-laki" : "Perempuan"}</p>
                    </div>
                  </div>
                </div>
                
                {/* Attendance Form */}
                <div className="mb-6" data-unique-id="ef5a1500-2e12-4772-871c-d8d2c9d809a6" data-file-name="app/dashboard/scan/page.tsx">
                  <div className="bg-white p-4 rounded-lg border border-gray-200" data-unique-id="d8027fa6-7273-4aee-8dd4-fdc60c20d6e4" data-file-name="app/dashboard/scan/page.tsx" data-dynamic-text="true">
                    <div className="mb-4" data-unique-id="b94cf5f7-03a2-4bb0-820c-3c78d6152822" data-file-name="app/dashboard/scan/page.tsx">
                      <p className="text-sm font-medium text-gray-700 mb-1" data-unique-id="ec32b743-6cc8-46f6-a9b9-56461c92d351" data-file-name="app/dashboard/scan/page.tsx"><span className="editable-text" data-unique-id="b09b43bb-535a-48ec-a5db-8d8cb0d99e63" data-file-name="app/dashboard/scan/page.tsx">Tanggal & Waktu</span></p>
                      <p className="text-base font-semibold" data-unique-id="8426ac8f-c935-40bf-9c66-5c6ee7b7386f" data-file-name="app/dashboard/scan/page.tsx" data-dynamic-text="true">{formattedDay}<span className="editable-text" data-unique-id="dce13776-a51e-4609-812c-6b6fb5a0d410" data-file-name="app/dashboard/scan/page.tsx">, </span>{formattedDate}<span className="editable-text" data-unique-id="b2b9dc4a-37eb-43fd-9bfc-b53504b8725b" data-file-name="app/dashboard/scan/page.tsx"> - </span>{formattedTime}</p>
                    </div>
                    
                    <div className="mb-4" data-unique-id="4c54d624-0b5a-4a83-88ca-c63472950f70" data-file-name="app/dashboard/scan/page.tsx">
                      <label className="block text-sm font-medium text-gray-700 mb-2" data-unique-id="aef184c3-507a-4758-a6a9-7d62ee2e7929" data-file-name="app/dashboard/scan/page.tsx"><span className="editable-text" data-unique-id="504552d4-09de-444f-9d12-2a35e3593816" data-file-name="app/dashboard/scan/page.tsx">Status Kehadiran</span></label>
                      <div className="grid grid-cols-4 gap-2" data-unique-id="19aa9b4a-a2c5-4d1e-8deb-3d64180578ab" data-file-name="app/dashboard/scan/page.tsx" data-dynamic-text="true">
                        {['hadir', 'sakit', 'izin', 'alpha'].map(status => <button key={status} type="button" onClick={() => setAttendanceStatus(status)} className={`py-2 px-3 rounded-lg border ${attendanceStatus === status ? status === 'hadir' ? 'bg-green-100 border-green-500 text-green-800' : status === 'sakit' ? 'bg-orange-100 border-orange-500 text-orange-800' : status === 'izin' ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-red-100 border-red-500 text-red-800' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors text-sm font-medium`} data-unique-id="e2c2dc39-1c96-441e-9e6b-92641a779e0c" data-file-name="app/dashboard/scan/page.tsx" data-dynamic-text="true">
                            {status === 'hadir' ? 'Hadir' : status === 'sakit' ? 'Sakit' : status === 'izin' ? 'Izin' : 'Alpha'}
                          </button>)}
                      </div>
                    </div>
                    
                    {attendanceStatus !== 'hadir' && <div className="mb-4" data-unique-id="09fc7b56-7ca7-4548-ba83-84a598ffeda3" data-file-name="app/dashboard/scan/page.tsx">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="aa847059-4470-4342-bd84-751dd3f09873" data-file-name="app/dashboard/scan/page.tsx"><span className="editable-text" data-unique-id="f82b61c5-2a03-4939-bd18-6c6c8a278f92" data-file-name="app/dashboard/scan/page.tsx">
                          Keterangan
                        </span></label>
                        <textarea id="notes" rows={3} value={attendanceNotes} onChange={e => setAttendanceNotes(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="Masukkan keterangan..." data-unique-id="6f9d62e7-5782-40a7-bf26-1b99e91e4bbf" data-file-name="app/dashboard/scan/page.tsx" />
                      </div>}
                  </div>
                </div>
                
                <div className="flex justify-between" data-unique-id="8cef67cb-4a5c-455a-8e77-10c02bf058e2" data-file-name="app/dashboard/scan/page.tsx">
                  <button type="button" onClick={resetScan} className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50" data-unique-id="654a8709-cc2f-4b2e-b053-412d20be60dc" data-file-name="app/dashboard/scan/page.tsx"><span className="editable-text" data-unique-id="6c09233c-fe94-42de-81a5-c2e44c7dac91" data-file-name="app/dashboard/scan/page.tsx">
                    Batal
                  </span></button>
                  <button type="button" onClick={handleAttendance} disabled={loading || !attendanceStatus} className={`flex items-center gap-2 text-white px-5 py-2.5 rounded-lg transition-colors ${loading || !attendanceStatus ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-primary/90"}`} data-unique-id="bcb0ef57-337a-4b69-af29-62b4448a14d8" data-file-name="app/dashboard/scan/page.tsx" data-dynamic-text="true">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <UserCheck className="h-5 w-5 mr-2" />}<span className="editable-text" data-unique-id="d2fb2477-edaf-4baa-9e73-c31b671f7170" data-file-name="app/dashboard/scan/page.tsx">
                    Simpan Absensi
                  </span></button>
                </div>
              </div>}
          </div> : scanError ? <div className="p-6 text-center" data-unique-id="8472d037-5432-4c54-952e-fd5bbbbcea1a" data-file-name="app/dashboard/scan/page.tsx">
            <motion.div className="flex flex-col items-center p-8" initial={{
          scale: 0.8,
          opacity: 0
        }} animate={{
          scale: 1,
          opacity: 1
        }} transition={{
          duration: 0.3
        }} data-unique-id="557be850-ccc9-4390-8169-f08bf59bcd7d" data-file-name="app/dashboard/scan/page.tsx">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4" data-unique-id="b88647d8-5a6d-4fcc-8276-5d41b3a2bf14" data-file-name="app/dashboard/scan/page.tsx">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
              
              <h3 className="text-xl font-bold text-red-600 mb-4" data-unique-id="0f694530-c12a-4874-87e5-26754ca20924" data-file-name="app/dashboard/scan/page.tsx"><span className="editable-text" data-unique-id="ffb2bdd2-6a21-457f-8cf9-81f80810d481" data-file-name="app/dashboard/scan/page.tsx">Error</span></h3>
              <p className="text-gray-700 text-center mb-4" data-unique-id="35d75fd5-4245-4424-92ae-99f14f393b6d" data-file-name="app/dashboard/scan/page.tsx" data-dynamic-text="true">{scanError}</p>
            </motion.div>
            
            <button onClick={resetScan} className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors mt-4" data-unique-id="8da15494-b25e-46ce-92a8-5f13b3254e11" data-file-name="app/dashboard/scan/page.tsx"><span className="editable-text" data-unique-id="b8391b93-6d46-4184-ac31-9d59a67226a1" data-file-name="app/dashboard/scan/page.tsx">
              Scan Ulang
            </span></button>
          </div> : <div data-unique-id="f0367250-dfdb-41b1-8048-b984f1dbe223" data-file-name="app/dashboard/scan/page.tsx">
            <div className="relative" data-unique-id="96997a57-80ac-42cc-94ef-7e672ec3c3ec" data-file-name="app/dashboard/scan/page.tsx" data-dynamic-text="true">
              {/* Scanner viewport using QrScanner component */}
              <div className="aspect-video bg-black w-full" data-unique-id="1e956790-29f9-44e7-b117-1b603502f34e" data-file-name="app/dashboard/scan/page.tsx" data-dynamic-text="true">
                {scanning ? <QrScanner onScan={detectedCodes => {
              if (detectedCodes && detectedCodes.length > 0) {
                handleScan(detectedCodes[0].rawValue);
              }
            }} onError={error => {
              console.error(error instanceof Error ? error.message : "Unknown error");
            }} classNames={{
              container: "rounded-lg"
            }} /> : <div className="w-full h-full bg-gray-900 flex items-center justify-center" data-unique-id="2850270f-59ef-49de-8a17-1ef7d0134bcd" data-file-name="app/dashboard/scan/page.tsx">
                    <Camera className="h-20 w-20 text-gray-400" />
                  </div>}
                
                {scanning && <>
                    {/* Scanning overlay with animation */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" data-unique-id="b98376f6-0693-489b-a32d-bca71f5ab59e" data-file-name="app/dashboard/scan/page.tsx">
                      <motion.div className="border-2 border-white rounded-lg w-48 h-48 shadow-lg" initial={{
                  borderColor: "rgba(255,255,255,0.3)"
                }} animate={{
                  borderColor: ["rgba(255,255,255,0.3)", "rgba(255,255,255,0.9)", "rgba(255,255,255,0.3)"]
                }} transition={{
                  duration: 2,
                  repeat: Infinity
                }} data-unique-id="3bc2d98f-38ae-4cd3-a881-0cce0df40ad8" data-file-name="app/dashboard/scan/page.tsx">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500" data-unique-id="59f66cac-f26f-4b1f-b6b8-f862d8c6de68" data-file-name="app/dashboard/scan/page.tsx"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500" data-unique-id="34fdaf9f-4c77-4f92-987b-364f6a2eb66d" data-file-name="app/dashboard/scan/page.tsx"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500" data-unique-id="2e1b82f8-c3ee-40e5-b393-036bdbd03a74" data-file-name="app/dashboard/scan/page.tsx"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500" data-unique-id="dd28b0b1-ce20-4501-951b-8ba58862e7d6" data-file-name="app/dashboard/scan/page.tsx"></div>
                      </motion.div>
                    </div>
                    
                    {/* Scanning animation line */}
                    <motion.div className="absolute left-0 right-0 h-0.5 bg-blue-500" initial={{
                top: "20%",
                opacity: 0.7
              }} animate={{
                top: "80%",
                opacity: 1
              }} transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse"
              }} data-unique-id="3dc9125a-3c76-4606-8577-dc716b4766dd" data-file-name="app/dashboard/scan/page.tsx" />
                  </>}
              </div>
            </div>
            
            <div className="p-6 text-center" data-unique-id="f5cc053c-9d9b-4872-9a67-395e80c953cf" data-file-name="app/dashboard/scan/page.tsx" data-dynamic-text="true">
              {scanError && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm" data-unique-id="0278dfde-ab03-4f7f-ab11-a3501de6967d" data-file-name="app/dashboard/scan/page.tsx" data-dynamic-text="true">
                  <AlertCircle className="h-5 w-5 inline-block mr-2" />
                  {scanError}
                </div>}
              
              {!scanning ? <>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2" data-unique-id="46d7b156-8530-44a2-bf89-3c52e066d314" data-file-name="app/dashboard/scan/page.tsx"><span className="editable-text" data-unique-id="3b818e44-1dfe-43e2-8c8e-c8ad0dc19218" data-file-name="app/dashboard/scan/page.tsx">Siap untuk Scan</span></h2>
                  <p className="text-gray-500 mb-6 text-sm" data-unique-id="b0e56625-751b-44b9-aa4e-4f306c533607" data-file-name="app/dashboard/scan/page.tsx"><span className="editable-text" data-unique-id="571a1a4d-4ced-48c1-bb33-4308f8e1f70a" data-file-name="app/dashboard/scan/page.tsx">
                    Tekan Tombol Di Bawah Untuk Mengaktifkan Kamera
                  </span></p>
                  <motion.button onClick={() => setScanning(true)} className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-orange-500 transition-colors" whileTap={{
              scale: 0.95
            }} data-unique-id="6ba4f889-e47e-4d03-8ce9-7f2f7e888f97" data-file-name="app/dashboard/scan/page.tsx">
                    <QrCode className="h-5 w-5 inline-block mr-2" /><span className="editable-text" data-unique-id="9db78dc5-19d6-4e2a-95e9-80f88022af56" data-file-name="app/dashboard/scan/page.tsx"> 
                    Mulai Scan QR Code
                  </span></motion.button>
                </> : <>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2" data-unique-id="55138fba-591f-4183-80bc-c259fadcbdf9" data-file-name="app/dashboard/scan/page.tsx"><span className="editable-text" data-unique-id="f0f99def-72f6-4ed7-967a-4b675c07a1eb" data-file-name="app/dashboard/scan/page.tsx">Scanning...</span></h2>
                  <p className="text-gray-500 mb-4" data-unique-id="0eb5c5aa-91b3-4938-92e5-0a95ee2f355d" data-file-name="app/dashboard/scan/page.tsx"><span className="editable-text" data-unique-id="6cffcc6c-613c-4225-83dc-8607fd14c77c" data-file-name="app/dashboard/scan/page.tsx">
                    Arahkan Kamera ke QR Code
                  </span></p>
                  <motion.div className="inline-block" initial={{
              scale: 0.5,
              opacity: 0
            }} animate={{
              scale: 1,
              opacity: 1
            }} data-unique-id="3fdd19b2-6703-48fb-aff7-54156e7e1c9b" data-file-name="app/dashboard/scan/page.tsx">
                    <button onClick={() => setScanning(false)} className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors" data-unique-id="bff72d82-d3c3-4686-a279-82e1a1f82aee" data-file-name="app/dashboard/scan/page.tsx"><span className="editable-text" data-unique-id="baba5aa2-6785-4d3d-8fc5-c0c01b00d3a7" data-file-name="app/dashboard/scan/page.tsx">
                      Batalkan Scan
                    </span></button>
                  </motion.div>
                </>}
            </div>
          </div>}
      </div>
    </div>;
}