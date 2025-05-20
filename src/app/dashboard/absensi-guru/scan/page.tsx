"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Camera, MapPin, User, AlertCircle, ArrowLeft, Loader2, CheckCircle, Timer, LogIn, LogOut, X } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
export default function TeacherAttendanceScan() {
  const {
    user,
    userRole,
    schoolId
  } = useAuth();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [processingCapture, setProcessingCapture] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [attendanceType, setAttendanceType] = useState<"in" | "out">("in");
  const [recognizedTeacher, setRecognizedTeacher] = useState<any>(null);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState({
    radius: 100,
    schoolLocation: {
      lat: 0,
      lng: 0
    }
  });

  // Handle page initialization and cleanup
  useEffect(() => {
    // Check authorization
    if (userRole !== 'admin' && userRole !== 'teacher' && userRole !== 'staff') {
      toast.error("Anda tidak memiliki akses ke halaman ini");
      router.push('/dashboard');
      return;
    }

    // Load settings
    const loadSettings = async () => {
      if (!schoolId) return;
      try {
        const {
          doc,
          getDoc
        } = await import('firebase/firestore');
        const {
          db
        } = await import('@/lib/firebase');
        const settingsDoc = await getDoc(doc(db, "settings", "location"));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          setSettings({
            radius: data.radius || 100,
            schoolLocation: {
              lat: data.latitude || 0,
              lng: data.longitude || 0
            }
          });
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    loadSettings();
    setLoading(false);

    // Clean up function to stop camera when component unmounts
    return () => {
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [router, schoolId, userRole]);

  // Start camera for scanning
  const startCamera = async () => {
    try {
      setScanning(true);

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: "user"
        }
      });

      // Store stream in ref for later cleanup
      streamRef.current = stream;

      // Connect stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // No need for face detection initialization anymore

      // Get location
      navigator.geolocation.getCurrentPosition(
      // Success callback
      position => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLocation(userLocation);

        // Calculate distance from school
        if (settings.schoolLocation.lat && settings.schoolLocation.lng) {
          const distance = calculateDistance(userLocation.lat, userLocation.lng, settings.schoolLocation.lat, settings.schoolLocation.lng);
          if (distance <= settings.radius) {
            setLocationMessage("Lokasi terdeteksi di area sekolah");
          } else {
            setLocationMessage(`Lokasi diluar area sekolah (${Math.round(distance)} meter)`);
          }
        } else {
          setLocationMessage("Posisi terdeteksi, tapi lokasi sekolah belum diatur");
        }
      },
      // Error callback
      error => {
        console.error("Geolocation error:", error);
        setLocationMessage("Gagal mendapatkan lokasi. Pastikan GPS diaktifkan.");
        toast.error("Tidak dapat mengakses lokasi. Pastikan GPS diaktifkan.");
      });
    } catch (error) {
      console.error("Error starting camera:", error);
      toast.error("Gagal mengakses kamera");
      setScanning(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
    setPhotoTaken(false);
  };

  // Capture image
  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    try {
      setCapturing(true);

      // Draw video frame to canvas
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      // Set canvas dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data as base64
      const imageData = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageData);

      // Process the image (detect face and identify)
      await processImage(imageData);
    } catch (error) {
      console.error("Error capturing image:", error);
      toast.error("Gagal mengambil gambar");
      setCapturing(false);
    }
  };

  // Process the captured image
  const processImage = async (imageData: string) => {
    try {
      setProcessingCapture(true);
      setPhotoTaken(true);

      // Simulated teacher data - in a real app, you would identify the teacher
      // based on login information or selection
      setTimeout(() => {
        setRecognizedTeacher({
          id: "teacher123",
          name: "Budi Santoso",
          nik: "198506152010011002",
          role: "Guru"
        });
        setProcessingCapture(false);
        setCapturing(false);
      }, 1000);
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Gagal memproses gambar");
      setProcessingCapture(false);
      setCapturing(false);
    }
  };

  // Submit attendance
  const submitAttendance = async () => {
    if (!schoolId || !recognizedTeacher || !location) {
      toast.error("Data tidak lengkap");
      return;
    }
    try {
      setProcessingCapture(true);
      const currentDate = new Date();
      const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const timeStr = currentDate.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      // Check if within allowed distance
      if (!location || !settings.schoolLocation) {
        toast.error("Data lokasi tidak lengkap");
        setProcessingCapture(false);
        return;
      }
      const distance = calculateDistance(location.lat, location.lng, settings.schoolLocation.lat, settings.schoolLocation.lng);
      if (distance > settings.radius) {
        toast.error(`Anda berada di luar area sekolah (${Math.round(distance)} meter)`);
        setProcessingCapture(false);
        return;
      }

      // Check if already submitted for today
      const {
        collection,
        query,
        where,
        getDocs,
        addDoc,
        serverTimestamp
      } = await import('firebase/firestore');
      const {
        db
      } = await import('@/lib/firebase');
      const attendanceRef = collection(db, "teacherAttendance");
      const existingAttendanceQuery = query(attendanceRef, where("teacherId", "==", recognizedTeacher.id), where("date", "==", dateStr), where("type", "==", attendanceType));
      const existingSnapshot = await getDocs(existingAttendanceQuery);
      if (!existingSnapshot.empty) {
        toast.error(`Anda sudah melakukan absensi ${attendanceType === 'in' ? 'masuk' : 'pulang'} hari ini`);
        setProcessingCapture(false);
        return;
      }

      // Determine status based on allowed time (mock, in real app should check against settings)
      let status = "present"; // Default status
      const hour = currentDate.getHours();
      if (attendanceType === 'in' && hour >= 8) {
        // If checking in after 8 AM
        status = "late";
      }

      // Save attendance record
      const attendanceData = {
        teacherId: recognizedTeacher.id,
        teacherName: recognizedTeacher.name,
        teacherNik: recognizedTeacher.nik,
        date: dateStr,
        time: timeStr,
        timestamp: serverTimestamp(),
        type: attendanceType,
        status: status,
        location: {
          lat: location.lat,
          lng: location.lng
        },
        schoolId: schoolId
      };
      await addDoc(attendanceRef, attendanceData);

      // Send Telegram notification
      await sendTelegramNotification(recognizedTeacher.name, attendanceType, dateStr, timeStr);
      setSuccess(true);
      toast.success(`Absensi ${attendanceType === 'in' ? 'masuk' : 'pulang'} berhasil tercatat!`);
    } catch (error) {
      console.error("Error submitting attendance:", error);
      toast.error("Gagal mencatat absensi");
    } finally {
      setProcessingCapture(false);
    }
  };

  // Reset the process
  const resetProcess = () => {
    setCapturedImage(null);
    setPhotoTaken(false);
    setRecognizedTeacher(null);
    setSuccess(false);
    stopCamera();
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
  };

  // Send Telegram notification
  const sendTelegramNotification = async (teacherName: string, attendanceType: string, date: string, time: string) => {
    try {
      const {
        doc,
        getDoc
      } = await import('firebase/firestore');
      const {
        db
      } = await import('@/lib/firebase');

      // Get Telegram settings
      const telegramSettingsDoc = await getDoc(doc(db, "settings", "telegram"));
      if (!telegramSettingsDoc.exists()) {
        console.error("Telegram settings not found");
        return;
      }
      const telegramSettings = telegramSettingsDoc.data();
      const token = telegramSettings.token || "7702797779:AAELhARB3HkvB9hh5e5D64DCC4faDfcW9IM";
      const chatId = telegramSettings.chatId || ""; // Should be the school principal's chat ID

      if (!chatId) {
        console.error("No chat ID found for notification");
        return;
      }

      // Format message
      const messageType = attendanceType === 'in' ? 'Masuk' : 'Pulang';
      const message = `Pegawai dengan nama : ${teacherName} telah melakukan Absen ${messageType} di sekolah pada ${date} pukul ${time}.`;

      // Send notification
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message
        })
      });
    } catch (error) {
      console.error("Error sending Telegram notification:", error);
    }
  };
  return <div className="max-w-3xl mx-auto pb-20 md:pb-6 px-3 sm:px-4 md:px-6" data-unique-id="284c771f-efae-4688-98b6-9be6607f3f20" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" data-dynamic-text="true">
      <div className="flex items-center justify-between mb-6" data-unique-id="df29acf8-2639-4133-9751-5da666920627" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
        <div className="flex items-center" data-unique-id="76971079-4575-4fc3-9848-4ca6ab5f9db9" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
          <Link href="/dashboard/absensi-guru" className="p-2 mr-2 hover:bg-gray-100 rounded-full" data-unique-id="d51fb5f5-e7c8-48b1-aca9-7de6a3250ab8" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800" data-unique-id="cf79046f-e9e1-4908-bf7c-5b1defa845e0" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="fbad20f9-193d-4558-ba23-84fc1bd18e63" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Absensi Selfie + Lokasi</span></h1>
        </div>
      </div>
      
      {loading ? <div className="flex justify-center items-center h-64" data-unique-id="b522125f-8af0-4e64-bf58-7a6d3153ba5e" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </div> : success ? <motion.div className="bg-white rounded-xl shadow-md p-8 text-center" initial={{
      opacity: 0,
      scale: 0.9
    }} animate={{
      opacity: 1,
      scale: 1
    }} transition={{
      duration: 0.3
    }} data-unique-id="f8c451b2-a331-47ad-ae30-e7dc083c5339" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6" data-unique-id="41a7a9f9-148a-4ccb-ac2a-c79145e209d2" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2" data-unique-id="a7e6cfee-4a98-4e50-be7b-531792543375" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="889de3dc-a3a5-4a30-a50b-69240ca2dcca" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Absensi Berhasil!</span></h2>
          <p className="text-gray-600 mb-6" data-unique-id="48b08c95-9871-4d2c-a7bb-5483d875d020" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" data-dynamic-text="true">
            {recognizedTeacher?.name}<span className="editable-text" data-unique-id="6c67722c-5d9c-4b6f-8cb3-545b8a758524" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"> berhasil melakukan absensi </span>{attendanceType === 'in' ? 'masuk' : 'pulang'}<span className="editable-text" data-unique-id="058c9816-6a7f-4f2c-8825-15b0aa2e5271" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">.
          </span></p>
          <div className="flex flex-col sm:flex-row justify-center gap-4" data-unique-id="65ab5048-a17f-481e-b0e0-bf15cf0abe21" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
            <button onClick={resetProcess} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" data-unique-id="a2e73b71-8966-4b2e-aec9-d9c4e2bfa1d5" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="c3188d8a-f2fa-4c90-81e5-315955aee3a8" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
              Absen Lagi
            </span></button>
            <Link href="/dashboard/absensi-guru" className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors" data-unique-id="efdbe398-b2b7-42c9-aefe-b71fea4ec5e0" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="e0a12864-bc21-4f8f-bc8f-ef81c8141378" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
              Kembali
            </span></Link>
          </div>
        </motion.div> : <div className="bg-white rounded-xl shadow-md overflow-hidden" data-unique-id="71f9cf9e-2308-45f9-a17d-454942bbd6b3" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
          <div className="p-6 border-b border-gray-200" data-unique-id="a3475807-349f-4f59-bb9a-07f02418c7eb" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" data-dynamic-text="true">
            <h2 className="text-lg font-semibold mb-4" data-unique-id="2bcd1598-3791-47fe-bec7-8d2de42e5a82" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="b152d8d4-c6e9-4711-abba-3be1c8ce3bd4" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Scan Absensi dengan Wajah</span></h2>
            
            {/* Attendance type selector */}
            <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg mb-4" data-unique-id="2594de03-e106-44a0-b548-2cf5d4224280" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
              <div className="flex space-x-2 bg-white p-1 rounded-lg shadow-sm" data-unique-id="8f75c805-1b83-409e-b665-ac6e1ba9a6cb" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                <button onClick={() => setAttendanceType("in")} className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${attendanceType === "in" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`} data-unique-id="0aae0fba-0db0-4d4d-82a2-84dcd316b1ee" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                  <LogIn size={16} />
                  <span data-unique-id="3966e163-b553-4e88-b019-eb8bf6f9606c" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="6cc10592-1640-4f87-a0c1-92b96ecd823e" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Absen Masuk</span></span>
                </button>
                <button onClick={() => setAttendanceType("out")} className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${attendanceType === "out" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`} data-unique-id="fbe490bb-0e0f-49ae-95e8-d48bbcb02b0b" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                  <LogOut size={16} />
                  <span data-unique-id="ab9dd189-7c5e-4031-b6ff-9ebe7c27d192" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="f0550b29-b5fb-4f39-b8a8-c136f31431eb" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Absen Pulang</span></span>
                </button>
              </div>
            </div>
            
            {/* Camera view */}
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4" data-unique-id="8eac9c23-03e5-4667-a47e-51b8980ef50b" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" data-dynamic-text="true">
              {scanning ? <>
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted data-unique-id="a5cd6d6f-7d0a-4497-ae9f-73999620fe0b" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"></video>
                  
                  {/* Photo capture guide overlay */}
                  <div className="absolute inset-0 flex items-center justify-center" data-unique-id="cdf45e8e-1510-4d94-a874-d53d041fcc0a" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                    <div className="absolute bottom-8 left-0 right-0 text-center" data-unique-id="3a15d2d0-5769-42b8-b2b2-1d18fe890f9d" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                      <p className="text-white text-sm bg-black bg-opacity-50 inline-block px-3 py-1 rounded-full" data-unique-id="ab04f05c-0ec3-46f5-9809-91e95e091053" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="4da065e8-449a-4dc6-b800-637a23ad74bf" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                        Posisikan diri Anda dengan jelas
                      </span></p>
                    </div>
                  </div>
                </> : capturedImage ? <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" data-unique-id="17e82a84-fb3d-4bcb-b4aa-80f46dc7ef68" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" /> : <div className="flex flex-col items-center justify-center h-full" data-unique-id="f4b33598-5e78-4578-a316-50a8bc48f554" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                  <Camera size={48} className="text-gray-400 mb-4" />
                  <p className="text-gray-400" data-unique-id="7c9d4509-8d6d-46a1-8f4c-848e28f87284" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="5d4e60a6-8f27-43d2-b9e8-3376dcd626e6" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Kamera belum diaktifkan</span></p>
                </div>}
              
              {/* Hidden canvas for processing */}
              <canvas ref={canvasRef} className="hidden" data-unique-id="e140a09d-24f8-42e2-a827-1c5de968fe95" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"></canvas>
            </div>
            
            {/* Location information */}
            <div className={`p-3 mb-4 rounded-lg flex items-center ${!location ? 'bg-gray-100 text-gray-700' : locationMessage.includes('luar area') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`} data-unique-id="51203a3c-dc48-49e0-87cf-718c1dc47c72" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
              <MapPin className="h-5 w-5 mr-2" />
              <p className="text-sm" data-unique-id="0da68362-cc15-48d3-9082-5f58cb36da5e" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" data-dynamic-text="true">{locationMessage || "Mendeteksi lokasi..."}</p>
            </div>
            
            {/* Recognized teacher */}
            {recognizedTeacher && <div className="p-4 bg-blue-50 rounded-lg mb-4 border border-blue-200" data-unique-id="832c8fde-bda9-44d6-b410-556fa36fd94c" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                <h3 className="text-lg font-semibold text-blue-800" data-unique-id="85eee9e1-0f72-4b56-961b-5a47342abae9" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" data-dynamic-text="true">{recognizedTeacher.name}</h3>
                <p className="text-sm text-blue-600" data-unique-id="c5785973-0e14-4468-a9e9-432545c256ac" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="d0550a00-bbf7-443e-a1d7-92bb22c819d3" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">NIK: </span>{recognizedTeacher.nik}</p>
                <p className="text-sm text-blue-600" data-unique-id="6f7bc129-29b3-4aac-ae99-a59b721f2650" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="af113003-43e8-4142-9eba-1c2c61934a1b" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Jabatan: </span>{recognizedTeacher.role}</p>
              </div>}
          </div>
          
          <div className="p-6 flex justify-between" data-unique-id="79f46dde-4931-4708-973a-c03bcf618204" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" data-dynamic-text="true">
            {!scanning && !capturedImage && <button onClick={startCamera} className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2" data-unique-id="259f7fa4-0af6-485f-a36d-682f2bee54bc" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                <Camera size={20} /><span className="editable-text" data-unique-id="db2c0109-fc38-445d-a281-02ac5c831363" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                Aktifkan Kamera
              </span></button>}
            
            {scanning && !capturing && <button onClick={captureImage} className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2" disabled={capturing} data-unique-id="d20f037d-3aae-4c66-8a15-6f58f6d37931" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                <Camera size={20} /><span className="editable-text" data-unique-id="22e105a4-f4e9-494a-919e-5af14c34de04" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                Ambil Gambar
              </span></button>}
            
            {capturedImage && photoTaken && recognizedTeacher && !processingCapture && <button onClick={submitAttendance} className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2" disabled={processingCapture} data-unique-id="2ca15abd-1b4c-4865-a049-e45277e32cc4" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                <CheckCircle size={20} /><span className="editable-text" data-unique-id="1dac6e69-174e-41e9-a9e1-8f10bd485668" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                Simpan Absensi
              </span></button>}
            
            {(scanning || capturedImage) && !processingCapture && <button onClick={resetProcess} className="py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors px-6 flex items-center justify-center gap-2" data-unique-id="ef3d5143-42c2-45f0-9156-5ea3747a9c0c" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                <X size={20} /><span className="editable-text" data-unique-id="6dd46504-d7da-45be-aa0c-39f888b8e316" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                Batal
              </span></button>}
            
            {processingCapture && <div className="flex items-center justify-center w-full py-3 bg-gray-300 text-gray-700 rounded-lg font-medium" data-unique-id="b3de8a41-cd77-45ae-bab8-9b8a6ef0abd9" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                <Loader2 size={20} className="animate-spin mr-2" /><span className="editable-text" data-unique-id="b0fcd5b3-66a0-4014-a5be-ad275f4a55c5" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                Memproses...
              </span></div>}
          </div>
        </div>}
      
      {/* Instructions card */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-6 rounded-lg" data-unique-id="1c12d11e-373a-4367-ae89-5dfa23043127" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
        <div className="flex" data-unique-id="335d80fe-8dae-473b-a5f0-1bc6fe185b33" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
          <div className="flex-shrink-0" data-unique-id="5c736bcc-353c-4afe-81d5-4ffc40ce788c" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="ml-3" data-unique-id="23068945-94fc-4140-a726-e4eeb82fa532" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
            <h3 className="text-sm font-medium text-yellow-800" data-unique-id="4219518c-b39f-4d40-ac02-f8f772b5d42a" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="a6cb7781-34cb-433c-94fd-f58ae911974f" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Petunjuk Absensi</span></h3>
            <div className="mt-2 text-sm text-yellow-700" data-unique-id="41fa5d40-379b-41a1-b1c4-47d00f18a35b" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
              <ul className="list-disc pl-5 space-y-1" data-unique-id="d9c5dd49-3f94-4352-bdf6-f2a1b3a55e56" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                <li data-unique-id="0b302046-7aa4-4420-85c0-9f812cc37b2b" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="887b327f-62df-426d-b55e-b94c9ece7edd" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Pastikan foto selfie Anda terlihat jelas</span></li>
                <li data-unique-id="c027723c-72c7-4f67-b168-6e7563160830" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="46c2243a-1b43-4782-8d1b-3edab9cac631" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Pastikan pencahayaan cukup terang</span></li>
                <li data-unique-id="d561a33c-0356-41c9-81f5-ec6af16b0dbe" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="65f1cf5a-a329-487e-8b34-5766afd2b6b4" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Pastikan Anda berada di area sekolah</span></li>
                <li data-unique-id="68dbdf0d-cc22-4c7f-8897-c2e01e8ed299" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="00581725-271f-421c-9967-9361f57bf8c6" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Aktifkan GPS pada perangkat Anda</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>;
}
