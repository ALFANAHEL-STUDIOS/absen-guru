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
    const messageType = attendanceType === 'in' ? 'MASUK' : 'PULANG';
    const message = `GTK dengan nama ${teacherName} telah melakukan "Absen ${messageType}" di Sekolah pada tanggal ${date} pukul ${time} WIB.`;
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
  return <div className="max-w-3xl mx-auto pb-20 md:pb-6 px-3 sm:px-4 md:px-6" data-unique-id="58818ad7-4ec9-41c9-bba0-13c3b3bd2c08" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" data-dynamic-text="true">
      <div className="flex items-center justify-between mb-6" data-unique-id="2e7bb2ba-e8b2-4652-b790-9535bdc2fe63" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
        <div className="flex items-center" data-unique-id="b217af26-755f-4cbd-9296-4c609e4cc769" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
          <Link href="/dashboard/absensi-guru" className="p-2 mr-2 hover:bg-gray-100 rounded-full" data-unique-id="85ccf162-4534-47de-9a5b-a8c35e3f1736" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800" data-unique-id="c513c6c3-a5e6-4ec5-9a4a-9599120c1779" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="7446eb8b-79bc-44f5-9406-ee4ab100e5f3" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Absensi Selfie + Lokasi</span></h1>
        </div>
      </div>
      
      {loading ? <div className="flex justify-center items-center h-64" data-unique-id="618060cb-8571-46dc-91b3-e75eb6898c96" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </div> : success ? <motion.div className="bg-white rounded-xl shadow-md p-8 text-center" initial={{
      opacity: 0,
      scale: 0.9
    }} animate={{
      opacity: 1,
      scale: 1
    }} transition={{
      duration: 0.3
    }} data-unique-id="f8187d1b-9eb4-4c75-a522-5681075431e2" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6" data-unique-id="2c76d273-f89b-4fd9-a8ef-b6fa3f6501e0" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2" data-unique-id="4b43794e-603d-4d48-b5e5-982a67cbad7b" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="65073d08-92d7-48e8-82e7-afb72c2903b6" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Absensi Berhasil!</span></h2>
          <p className="text-gray-600 mb-6" data-unique-id="205eb1dd-8653-4060-9f7a-61810438f44e" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" data-dynamic-text="true">
            {recognizedTeacher?.name}<span className="editable-text" data-unique-id="fd43cafa-2b55-4027-a1ff-b26d46bf6d93" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"> berhasil melakukan absensi </span>{attendanceType === 'in' ? 'masuk' : 'pulang'}<span className="editable-text" data-unique-id="16111732-b2f1-4c15-bc4e-2d674c84d36c" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">.
          </span></p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-unique-id="6552d05b-269b-4a3f-b4b6-0a0b80b54d2b" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
            <button onClick={resetProcess} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" data-unique-id="2473082b-3356-4ab0-b90b-5736251a4d5e" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="192c5a88-fc2e-491e-89d9-26b2c84f5f7b" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
              Absen Lagi
            </span></button>
            <Link href="/dashboard/absensi-guru/attendance-table" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center" data-unique-id="ad1c2bea-6c43-4328-bd17-3b580e7ef9f9" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
              <span className="editable-text" data-unique-id="4dc7cac6-8919-4cf4-af4e-831a4531cf62" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Lihat Hasil Absensi</span>
            </Link>
            <Link href="/dashboard/absensi-guru" className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center" data-unique-id="38eb2dfe-0096-4f64-8f9e-d502e7e582b7" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="5f255710-6754-490d-a05b-ce5fa93db82a" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
              Kembali
            </span></Link>
          </div>
        </motion.div> : <div className="bg-white rounded-xl shadow-md overflow-hidden" data-unique-id="ae0ecf1d-f47c-473e-bb6f-c5385dcbc143" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
          <div className="p-6 border-b border-gray-200" data-unique-id="b70d5d18-ffc2-4005-9b56-403f4152b8a1" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" data-dynamic-text="true">
            <h2 className="text-lg font-semibold mb-4" data-unique-id="9ca3babd-bb4a-4480-9c15-23d6a51bcaa1" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="08f627ad-abb2-41a1-a1ab-dc067150ffef" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Scan Absensi dengan Wajah</span></h2>
            
            {/* Attendance type selector */}
            <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg mb-4" data-unique-id="1e06eaed-d627-467f-aec0-9478aa12ef64" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
              <div className="flex space-x-2 bg-white p-1 rounded-lg shadow-sm" data-unique-id="c4453812-4808-4e22-8a43-3739e6106478" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                <button onClick={() => setAttendanceType("in")} className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${attendanceType === "in" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`} data-unique-id="0ecf525e-41ff-4986-9013-86390f7918fb" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                  <LogIn size={16} />
                  <span data-unique-id="81c614cc-e69e-4ff2-8e0b-de4ad542e674" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="4f12b41c-ec9b-48a3-8cd4-b1028daed2a1" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Absen Masuk</span></span>
                </button>
                <button onClick={() => setAttendanceType("out")} className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${attendanceType === "out" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`} data-unique-id="535279ab-3bff-4cd4-919c-f970facad6c1" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                  <LogOut size={16} />
                  <span data-unique-id="4a11aba0-afd5-4ef2-956a-98ee33a8b095" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="c44d49b2-275e-4aa8-aedf-3804f3a5d7a6" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Absen Pulang</span></span>
                </button>
              </div>
            </div>
            
            {/* Camera view */}
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4" data-unique-id="a74b4c13-92dd-4ea8-93f9-6887248711b3" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" data-dynamic-text="true">
              {scanning ? <>
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted data-unique-id="a02d9452-df69-4b7f-bb2b-dfbba6aff38a" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"></video>
                  
                  {/* Photo capture guide overlay */}
                  <div className="absolute inset-0 flex items-center justify-center" data-unique-id="6875ce6c-2a39-4bf4-8969-01d47bfe419b" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                    <div className="absolute bottom-8 left-0 right-0 text-center" data-unique-id="d1d548e8-2cae-4c6e-acf9-518a1030e4a9" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                      <p className="text-white text-sm bg-black bg-opacity-50 inline-block px-3 py-1 rounded-full" data-unique-id="9a2d3a66-7ba5-4515-b257-ba1de6566510" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="64d3fad1-4356-4495-855e-a617300b0969" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                        Posisikan diri Anda dengan jelas
                      </span></p>
                    </div>
                  </div>
                </> : capturedImage ? <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" data-unique-id="2e05fa4f-908b-4a4c-a7d7-923871b206dc" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" /> : <div className="flex flex-col items-center justify-center h-full" data-unique-id="31e07b8e-4e0e-421a-9d9f-4d01b22bc53d" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                  <Camera size={48} className="text-gray-400 mb-4" />
                  <p className="text-gray-400" data-unique-id="8fa40630-8c3f-4280-b61a-e33592bf75eb" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="d0158f87-d934-43e1-8d7f-0426781eb13c" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Kamera belum diaktifkan</span></p>
                </div>}
              
              {/* Hidden canvas for processing */}
              <canvas ref={canvasRef} className="hidden" data-unique-id="4f3fdd2b-8ef6-48bf-8d64-b92cbb7e09de" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"></canvas>
            </div>
            
            {/* Location information */}
            <div className={`p-3 mb-4 rounded-lg flex items-center ${!location ? 'bg-gray-100 text-gray-700' : locationMessage.includes('luar area') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`} data-unique-id="1be5edca-28c7-4188-bd9a-af1a7325d63b" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
              <MapPin className="h-5 w-5 mr-2" />
              <p className="text-sm" data-unique-id="80fbdeac-0b31-4f22-8558-20873532196d" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" data-dynamic-text="true">{locationMessage || "Mendeteksi lokasi..."}</p>
            </div>
            
            {/* Recognized teacher */}
            {recognizedTeacher && <div className="p-4 bg-blue-50 rounded-lg mb-4 border border-blue-200" data-unique-id="da181481-b941-4f42-96d7-bd716f143097" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                <h3 className="text-lg font-semibold text-blue-800" data-unique-id="cef3f16c-bb33-411b-b5ab-b6247980eadb" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" data-dynamic-text="true">{recognizedTeacher.name}</h3>
                <p className="text-sm text-blue-600" data-unique-id="bec20ffe-2e39-47ef-bddf-89fe3276d53b" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="2405e54d-82a9-40a4-ae66-0445394d38a2" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">NIK: </span>{recognizedTeacher.nik}</p>
                <p className="text-sm text-blue-600" data-unique-id="9a789ea8-3531-4160-8dd5-c61e12777241" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="7d644433-cbee-454c-b1ec-e2e1e2ec9119" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Jabatan: </span>{recognizedTeacher.role}</p>
              </div>}
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4" data-unique-id="2cabe59a-5ba4-43b7-b27f-301eade6c994" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" data-dynamic-text="true">
            {!scanning && !capturedImage && <button onClick={startCamera} className="col-span-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2" data-unique-id="b0fbfa7e-cb0c-4350-9345-87a97d5b9fb0" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                <Camera size={20} />
                <span className="editable-text" data-unique-id="d2933e0e-87c7-4026-89ac-952f1eb803ba" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Aktifkan Kamera</span>
              </button>}
            
            {scanning && !capturing && <button onClick={captureImage} className="col-span-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2" disabled={capturing} data-unique-id="986b242b-03cc-4e3f-aebb-d750139e0ad7" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                <Camera size={20} />
                <span className="editable-text" data-unique-id="e96d937a-e77f-4442-827d-14b39dce2315" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Ambil Gambar</span>
              </button>}
            
            {capturedImage && photoTaken && recognizedTeacher && !processingCapture && <button onClick={submitAttendance} className="py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2" disabled={processingCapture} data-unique-id="aebe0d76-4efe-4faa-8fc5-6335aafd7464" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                <CheckCircle size={20} />
                <span className="editable-text" data-unique-id="4b64b47f-d99b-4d5d-b1de-a157234c97e6" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Simpan Absensi</span>
              </button>}
            
            {(scanning || capturedImage) && !processingCapture && <button onClick={resetProcess} className="py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2" data-unique-id="0be828aa-c3f5-479d-ad1a-70e896672bf3" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                <X size={20} />
                <span className="editable-text" data-unique-id="020d44a7-bf22-4e3d-8b48-a8505d3768a2" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Batal</span>
              </button>}
            
            {processingCapture && <div className="col-span-full flex items-center justify-center py-3 bg-orange-300 text-white rounded-lg font-medium" data-unique-id="dc83e4eb-3edd-4b00-958e-6a3bd8bcc77e" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                <Loader2 size={20} className="animate-spin mr-2" />
                <span className="editable-text" data-unique-id="de71410d-4e5e-4a35-b7be-0a1ee05510b3" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Memproses...</span>
              </div>}
          </div>
        </div>}
      
      {/* Instructions card */}
    {/*<div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-6 rounded-lg">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800"><span className="editable-text">Petunjuk Absensi</span></h3>
          <div className="mt-2 text-sm text-yellow-700">
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="editable-text">Pastikan foto selfie Anda terlihat jelas</span></li>
              <li><span className="editable-text">Pastikan pencahayaan cukup terang</span></li>
              <li><span className="editable-text">Pastikan Anda berada di area sekolah</span></li>
              <li><span className="editable-text">Aktifkan GPS pada perangkat Anda</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>*/}
  </div>;
}
