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
  return <div className="max-w-3xl mx-auto pb-20 md:pb-6 px-3 sm:px-4 md:px-6" data-unique-id="d32104d6-9a9f-4fdc-a446-9411cd0c34cf" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" data-dynamic-text="true">
      <div className="flex items-center justify-between mb-6" data-unique-id="e06b4d55-8811-42a8-83fe-e7eab42a347b" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
        <div className="flex items-center" data-unique-id="630174f8-fee5-4106-b054-fd9c2f1e92d2" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
          <Link href="/dashboard/absensi-guru" className="p-2 mr-2 hover:bg-gray-100 rounded-full" data-unique-id="a15401f8-be4a-47e7-9bc0-f4e61c998325" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800" data-unique-id="551c237e-4e62-49ff-8d5e-d433334b6161" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="8455f28f-021e-4e04-9de7-07f1de44e331" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Absensi Selfie + Lokasi</span></h1>
        </div>
      </div>
      
      {loading ? <div className="flex justify-center items-center h-64" data-unique-id="fe54b613-e70f-4277-b895-c5ac6f8fa98b" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </div> : success ? <motion.div className="bg-white rounded-xl shadow-md p-8 text-center" initial={{
      opacity: 0,
      scale: 0.9
    }} animate={{
      opacity: 1,
      scale: 1
    }} transition={{
      duration: 0.3
    }} data-unique-id="57e4b430-6ab5-41ca-94cf-45f23085a235" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6" data-unique-id="af2c4197-8014-482e-8641-fd816cc33b41" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2" data-unique-id="4fde3a97-f7ed-4e5d-b97d-ec8d360747bc" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="ee5bd20d-363c-4500-b632-0b4a873aad5c" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Absensi Berhasil!</span></h2>
          <p className="text-gray-600 mb-6" data-unique-id="3c74b736-e495-4765-9d70-4df0a9f58e44" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" data-dynamic-text="true">
            {recognizedTeacher?.name}<span className="editable-text" data-unique-id="d0228bb2-bc6f-453c-b390-f8b0a4de4a83" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"> berhasil melakukan absensi </span>{attendanceType === 'in' ? 'masuk' : 'pulang'}<span className="editable-text" data-unique-id="260409cd-e64e-4b08-bae0-58f82854bb80" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">.
          </span></p>
          <div className="flex flex-col sm:flex-row justify-center gap-4" data-unique-id="043fe91a-7a0d-4627-ba94-0cc92b0e33dd" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
            <button onClick={resetProcess} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" data-unique-id="f087e8b2-a121-449d-a9af-cc549ecfcf85" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="d0e4c7bf-6b27-4cfc-812d-0d472ca7fc1c" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
              Absen Lagi
            </span></button>
            <Link href="/dashboard/absensi-guru" className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors" data-unique-id="01da0994-ca5f-4c0b-a27e-0ed9734c930e" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="8700a239-359c-4979-aaa9-419d1be023fc" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
              Kembali
            </span></Link>
          </div>
        </motion.div> : <div className="bg-white rounded-xl shadow-md overflow-hidden" data-unique-id="6f9d916d-6050-4cbe-87f8-34c62533f030" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
          <div className="p-6 border-b border-gray-200" data-unique-id="85fc3f86-5707-42b0-ba27-0b36ad991804" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" data-dynamic-text="true">
            <h2 className="text-lg font-semibold mb-4" data-unique-id="f2fecdd3-7d45-41f4-97a0-9fb9c43d5a39" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="83f939e9-760a-4231-a36d-80a9d93d2be5" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Scan Absensi dengan Wajah</span></h2>
            
            {/* Attendance type selector */}
            <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg mb-4" data-unique-id="0b3ffd9f-e6d6-4bf5-ba03-5b9ff0d98147" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
              <div className="flex space-x-2 bg-white p-1 rounded-lg shadow-sm" data-unique-id="20ddb7ec-a123-4935-b1f9-27d4b5fbd372" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                <button onClick={() => setAttendanceType("in")} className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${attendanceType === "in" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`} data-unique-id="fb78072a-b7a8-4ecc-bf60-0aa65ffd8ead" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                  <LogIn size={16} />
                  <span data-unique-id="dae415a4-d34d-497a-acb8-7da3dea071ea" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="a4801963-9e77-4804-bf8f-34a7d42f9adb" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Absen Masuk</span></span>
                </button>
                <button onClick={() => setAttendanceType("out")} className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${attendanceType === "out" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`} data-unique-id="6aea60ad-6834-4857-8d5b-f478b1c7cfaa" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                  <LogOut size={16} />
                  <span data-unique-id="6881853f-c787-47c1-aec6-6a10a721470e" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="b5107b3c-d154-4eb4-9bbf-b9371be7661d" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Absen Pulang</span></span>
                </button>
              </div>
            </div>
            
            {/* Camera view */}
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4" data-unique-id="b1282829-5b86-4ba6-8850-0f4038557805" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" data-dynamic-text="true">
              {scanning ? <>
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted data-unique-id="83042e39-7504-4e68-b6d9-b2ec1f909ac3" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"></video>
                  
                  {/* Photo capture guide overlay */}
                  <div className="absolute inset-0 flex items-center justify-center" data-unique-id="80747ac7-e41a-47cb-876a-2338606da1ae" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                    <div className="absolute bottom-8 left-0 right-0 text-center" data-unique-id="aabf3439-ac03-422a-b37c-d754fb2c0eb1" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                      <p className="text-white text-sm bg-black bg-opacity-50 inline-block px-3 py-1 rounded-full" data-unique-id="a8cb4557-4a5b-409a-ac54-ec879ee2c8b1" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="fc87cb46-0c2d-498a-a78a-b257880124b8" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                        Posisikan diri Anda dengan jelas
                      </span></p>
                    </div>
                  </div>
                </> : capturedImage ? <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" data-unique-id="4b314dbf-9f47-4aaa-a17d-2b53ec8d82e9" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" /> : <div className="flex flex-col items-center justify-center h-full" data-unique-id="59aa8741-aa88-4f20-9418-e80e3ee949ab" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                  <Camera size={48} className="text-gray-400 mb-4" />
                  <p className="text-gray-400" data-unique-id="dd5f52ed-e7b8-44d4-8c9c-01218ec5b692" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="88395645-fffb-4f92-9f8b-498849af1bc6" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Kamera belum diaktifkan</span></p>
                </div>}
              
              {/* Hidden canvas for processing */}
              <canvas ref={canvasRef} className="hidden" data-unique-id="c28c65e0-4b20-452e-add8-717f8e252d0c" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"></canvas>
            </div>
            
            {/* Location information */}
            <div className={`p-3 mb-4 rounded-lg flex items-center ${!location ? 'bg-gray-100 text-gray-700' : locationMessage.includes('luar area') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`} data-unique-id="36050dcd-586a-4788-a014-05a2af6ec65b" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
              <MapPin className="h-5 w-5 mr-2" />
              <p className="text-sm" data-unique-id="4a7d4a84-e340-4754-b00e-a6f8ea0418e2" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" data-dynamic-text="true">{locationMessage || "Mendeteksi lokasi..."}</p>
            </div>
            
            {/* Recognized teacher */}
            {recognizedTeacher && <div className="p-4 bg-blue-50 rounded-lg mb-4 border border-blue-200" data-unique-id="d76028ae-5461-4bb5-bce6-90db1217b151" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                <h3 className="text-lg font-semibold text-blue-800" data-unique-id="b97e6b06-4f45-4642-8b52-4c301fc8b5e4" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" data-dynamic-text="true">{recognizedTeacher.name}</h3>
                <p className="text-sm text-blue-600" data-unique-id="e47f9dc0-ed0f-4f03-9dc7-72d4d6f3a420" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="1384b8b4-92f3-4c2e-b6e1-25e9f12990cf" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">NIK: </span>{recognizedTeacher.nik}</p>
                <p className="text-sm text-blue-600" data-unique-id="56b194dc-5b65-4b00-87d6-93a80a21bf25" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="78ea938d-f4ca-4eee-887e-b4c4c14542c6" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Jabatan: </span>{recognizedTeacher.role}</p>
              </div>}
          </div>
          
          <div className="p-6 flex justify-between" data-unique-id="3c1469f6-f467-47ee-b663-5fb20ceef731" data-file-name="app/dashboard/absensi-guru/scan/page.tsx" data-dynamic-text="true">
            {!scanning && !capturedImage && <button onClick={startCamera} className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2" data-unique-id="49184681-0d8a-4b8b-9050-b163c528ecae" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                <Camera size={20} /><span className="editable-text" data-unique-id="94f4bc66-44c3-44bd-9596-4b5602902b98" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                Aktifkan Kamera
              </span></button>}
            
            {scanning && !capturing && <button onClick={captureImage} className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2" disabled={capturing} data-unique-id="f2f93cf0-041d-4ca0-a163-c0b9a68194c1" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                <Camera size={20} /><span className="editable-text" data-unique-id="4cb3fcb2-97c5-4d14-96a1-e8ad371e200b" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                Ambil Gambar
              </span></button>}
            
            {capturedImage && photoTaken && recognizedTeacher && !processingCapture && <button onClick={submitAttendance} className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2" disabled={processingCapture} data-unique-id="5e5ea177-0374-4bb7-a39d-4579edecf9ff" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                <CheckCircle size={20} /><span className="editable-text" data-unique-id="131eba1e-2b76-4d01-948b-162569c6c5b7" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                Simpan Absensi
              </span></button>}
            
            {(scanning || capturedImage) && !processingCapture && <button onClick={resetProcess} className="py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors px-6 flex items-center justify-center gap-2" data-unique-id="fd6ee1d3-0fed-4cf7-b0f8-d7500aaf6b8f" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                <X size={20} /><span className="editable-text" data-unique-id="f8ad156f-e433-45db-b4d1-6424b0f81750" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                Batal
              </span></button>}
            
            {processingCapture && <div className="flex items-center justify-center w-full py-3 bg-gray-300 text-gray-700 rounded-lg font-medium" data-unique-id="70690cce-8b91-44af-b454-1dc97032b3be" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                <Loader2 size={20} className="animate-spin mr-2" /><span className="editable-text" data-unique-id="8577b6ab-b9ce-4e5f-bc54-a386f5d32018" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                Memproses...
              </span></div>}
          </div>
        </div>}
      
      {/* Instructions card */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-6 rounded-lg" data-unique-id="57cbbee6-aa2e-43b7-8e58-0e2490896f80" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
        <div className="flex" data-unique-id="4fead07a-ef5f-463a-a209-fbd70dbca5ba" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
          <div className="flex-shrink-0" data-unique-id="f887e578-d9f9-47ec-8e0b-5058b75c51c7" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="ml-3" data-unique-id="e963c878-4fe5-44fa-a57a-ec9db45993fe" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
            <h3 className="text-sm font-medium text-yellow-800" data-unique-id="38ec490e-0314-4afe-934b-dab6228e0923" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="89d789b4-0d71-4bad-90cd-c73f328d91aa" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Petunjuk Absensi</span></h3>
            <div className="mt-2 text-sm text-yellow-700" data-unique-id="1019e24f-d209-4e91-a978-e76d15da829a" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
              <ul className="list-disc pl-5 space-y-1" data-unique-id="f01b4859-ff3b-43c7-8a55-6fcfb9185d1c" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">
                <li data-unique-id="df98c955-6716-4ba3-af58-59bcbbfb9e82" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="7432c07b-204d-4882-a1ce-818a7d519340" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Pastikan foto selfie Anda terlihat jelas</span></li>
                <li data-unique-id="04fae238-24c0-4a5e-ae17-706b83dfb6a5" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="6150d406-9f15-4fda-8cda-aa0906d2b765" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Pastikan pencahayaan cukup terang</span></li>
                <li data-unique-id="d306c388-ec1b-4ad2-a0d2-327536537ff1" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="b0342b46-177f-44ac-b839-e86d6ada4407" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Pastikan Anda berada di area sekolah</span></li>
                <li data-unique-id="4898cf59-90fb-4d47-9d66-6395bacf63f7" data-file-name="app/dashboard/absensi-guru/scan/page.tsx"><span className="editable-text" data-unique-id="79056f55-bdbf-4624-8346-8519b953c920" data-file-name="app/dashboard/absensi-guru/scan/page.tsx">Aktifkan GPS pada perangkat Anda</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>;
}
