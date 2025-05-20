"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { QrCode, Camera, MapPin, CheckCircle, XCircle, AlertTriangle, Loader2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { sendTelegramNotification } from "@/lib/telegram";
//import * as faceapi from 'face-api.js';
const MODELS_PATH = '/models';
const ALLOWED_RADIUS_METERS = 100; // 100 meters radius
export default function AbsensiGuruScanPage() {
 const { user, userData, schoolId } = useAuth();
 const [isLoading, setIsLoading] = useState(true);
 const [isCameraActive, setIsCameraActive] = useState(false);
 const [isProcessing, setIsProcessing] = useState(false);
 const [attendanceSuccess, setAttendanceSuccess] = useState(false);
 const [attendanceError, setAttendanceError] = useState<string | null>(null);
 const [currentTime, setCurrentTime] = useState(new Date());
 const [attendanceType, setAttendanceType] = useState<'masuk' | 'pulang'>('masuk');
 const [schoolLocation, setSchoolLocation] = useState({ lat: 0, lon: 0, radius: 100 });
 const [currentLocation, setCurrentLocation] = useState({ lat: 0, lon: 0 });
 const [isInRadius, setIsInRadius] = useState(false);
 const [locationProcessing, setLocationProcessing] = useState(false);
 const [modelsLoaded, setModelsLoaded] = useState(false);

 const videoRef = useRef<HTMLVideoElement>(null);
 const canvasRef = useRef<HTMLCanvasElement>(null);
 const streamRef = useRef<MediaStream | null>(null);

 // Check if the camera has been initiated
 const [isCameraInitiated, setCameraInitiated] = useState(false);
 // Format time for display
 const formattedTime = currentTime.toLocaleTimeString('id-ID', {
   hour: '2-digit',
   minute: '2-digit',
   second: '2-digit'
 });
 // Format date for display
 const formattedDate = currentTime.toLocaleDateString('id-ID', {
   weekday: 'long',
   day: 'numeric',
   month: 'long',
   year: 'numeric'
 });
 // Load face-api models
 const loadModels = async () => {
  try {
    const faceapi = await import('face-api.js');

    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_PATH),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_PATH),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_PATH),
    ]);

    setModelsLoaded(true);
    console.log("Face detection models loaded!");
    return faceapi; // return instance for later use
  } catch (error) {
    console.error("Error loading face detection models:", error);
    toast.error("Gagal memuat model pendeteksi wajah");
  }
};
 // Check if current time is within allowed attendance time
 const isWithinAttendanceTime = () => {
   const hour = currentTime.getHours();
   // Example: Morning attendance 06:00-09:00, Evening attendance 15:00-18:00
   if (hour >= 6 && hour < 9) {
     setAttendanceType('masuk');
     return true;
   } else if (hour >= 15 && hour < 18) {
     setAttendanceType('pulang');
     return true;
   }
   return false;
 };
 // Calculate distance between two coordinates
 const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
   const R = 6371e3; // Earth radius in meters
   const φ1 = lat1 * Math.PI/180; // φ, λ in radians
   const φ2 = lat2 * Math.PI/180;
   const Δφ = (lat2-lat1) * Math.PI/180;
   const Δλ = (lon2-lon1) * Math.PI/180;
   const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
             Math.cos(φ1) * Math.cos(φ2) *
             Math.sin(Δλ/2) * Math.sin(Δλ/2);
   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
   return R * c; // in meters
 };
 // Fetch school location from Firestore
 const fetchSchoolLocation = async () => {
   if (!schoolId) return;

   try {
     const { db } = await import('@/lib/firebase');
     const { doc, getDoc } = await import('firebase/firestore');

     // Get location settings
     const settingsRef = doc(db, "schools", schoolId, "settings", "location");
     const settingsDoc = await getDoc(settingsRef);

     if (settingsDoc.exists()) {
       const locationData = settingsDoc.data();
       setSchoolLocation({
         lat: locationData.lat || 0,
         lon: locationData.lon || 0,
         radius: locationData.radius || 100
       });
     } else {
       // Fallback to default location or school document
       const schoolRef = doc(db, "schools", schoolId);
       const schoolDoc = await getDoc(schoolRef);

       if (schoolDoc.exists() && schoolDoc.data().location) {
         const location = schoolDoc.data().location;
         setSchoolLocation({
           lat: location.lat || 0,
           lon: location.lon || 0,
           radius: location.radius || 100
         });
       }
     }
   } catch (error) {
     console.error("Error fetching school location:", error);
     toast.error("Gagal mengambil lokasi sekolah");
   }
 };
 // Get current user location
 const getCurrentLocation = () => {
   setLocationProcessing(true);
   if (navigator.geolocation) {
     navigator.geolocation.getCurrentPosition(
       (position) => {
         const { latitude, longitude } = position.coords;
         setCurrentLocation({ lat: latitude, lon: longitude });

         // Calculate distance to school
         const distance = calculateDistance(
           latitude, longitude,
           schoolLocation.lat, schoolLocation.lon
         );

         const inRadius = distance <= (schoolLocation.radius || ALLOWED_RADIUS_METERS);
         setIsInRadius(inRadius);

         if (!inRadius) {
           toast.error(`Anda berada diluar radius sekolah (${Math.round(distance)}m)`);
         } else {
           toast.success(`Lokasi terdeteksi (${Math.round(distance)}m dari sekolah)`);
         }
         setLocationProcessing(false);
       },
       (error) => {
         console.error("Error getting location:", error);
         toast.error("Gagal mendapatkan lokasi. " + error.message);
         setLocationProcessing(false);
       },
       { enableHighAccuracy: true }
     );
   } else {
     toast.error("Geolocation tidak didukung oleh perangkat ini");
     setLocationProcessing(false);
   }
 };
 // Start camera
 const startCamera = async () => {
   try {
     if (!videoRef.current) return;

     const stream = await navigator.mediaDevices.getUserMedia({
       video: { facingMode: "user" },
       audio: false
     });

     videoRef.current.srcObject = stream;
     streamRef.current = stream;
     setCameraInitiated(true);
     setIsCameraActive(true);

     // Get location when camera starts
     getCurrentLocation();

   } catch (error) {
     console.error("Error accessing camera:", error);
     toast.error("Gagal mengakses kamera");
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
   setIsCameraActive(false);
 };

 // Take attendance with selfie
 const takeAttendance = async () => {
  const faceapi = await import('face-api.js');
  ...
  const detections = await faceapi.detectSingleFace(
    videoRef.current,
    new faceapi.TinyFaceDetectorOptions()
  );
  ...
}


     // Take a screenshot from video
     const context = canvasRef.current.getContext('2d');
     if (!context) {
       throw new Error("Canvas context is null");
     }

     canvasRef.current.width = videoRef.current.videoWidth;
     canvasRef.current.height = videoRef.current.videoHeight;
     context.drawImage(videoRef.current, 0, 0);

     // Convert canvas to base64 image
     const selfieImage = canvasRef.current.toDataURL('image/jpeg', 0.8);

     // Save attendance to Firestore
     const { db, storage } = await import('@/lib/firebase');
     const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
     const { ref, uploadString, getDownloadURL } = await import('firebase/storage');

     // Upload selfie to Firebase Storage
     const imageRef = ref(storage, `attendances/${userData.id}/${Date.now()}.jpg`);
     await uploadString(imageRef, selfieImage, 'data_url');
     const imageUrl = await getDownloadURL(imageRef);

     // Add attendance record to Firestore
     const attendanceRef = collection(db, `schools/${schoolId}/teacher_attendances`);
     await addDoc(attendanceRef, {
       userId: userData.id,
       userName: userData.name,
       userEmail: userData.email,
       userRole: userData.role,
       selfieUrl: imageUrl,
       location: {
         lat: currentLocation.lat,
         lon: currentLocation.lon,
         inRadius: isInRadius
       },
       schoolLocation: schoolLocation,
       timestamp: serverTimestamp(),
       date: new Date().toISOString().split('T')[0],
       time: new Date().toLocaleTimeString('id-ID'),
       type: attendanceType,
       status: 'hadir'
     });

     // Send Telegram notification
     const principalTelegramId = await getPrincipalTelegramId();
     if (principalTelegramId) {
       const message = `Pegawai dengan nama : ${userData.name} telah melakukan Absen ${attendanceType === 'masuk' ? 'Masuk' : 'Pulang'} hari ini di sekolah pada ${new Date().toLocaleString('id-ID')}.`;
       await sendTelegramNotification({
         phoneNumber: principalTelegramId,
         message: message
       });
     }

     // Success!
     setAttendanceSuccess(true);
     toast.success(`Absensi ${attendanceType} berhasil dicatat!`);

     // Stop camera after successful attendance
     stopCamera();

   } catch (error) {
     console.error("Error taking attendance:", error);
     setAttendanceError("Gagal mencatat kehadiran. Silakan coba lagi.");
     toast.error("Gagal mencatat kehadiran");
   } finally {
     setIsProcessing(false);
   }
 };

 // Get principal's Telegram ID
 const getPrincipalTelegramId = async (): Promise<string> => {
   if (!schoolId) return '';

   try {
     const { db } = await import('@/lib/firebase');
     const { doc, getDoc } = await import('firebase/firestore');

     // First try to get from settings
     const settingsRef = doc(db, "schools", schoolId, "settings", "telegram");
     const settingsDoc = await getDoc(settingsRef);

     if (settingsDoc.exists() && settingsDoc.data().principalTelegramId) {
       return settingsDoc.data().principalTelegramId;
     }

     // If not found in settings, try to get from principal's user record
     const schoolRef = doc(db, "schools", schoolId);
     const schoolDoc = await getDoc(schoolRef);

     if (schoolDoc.exists() && schoolDoc.data().principalId) {
       const principalId = schoolDoc.data().principalId;
       const principalRef = doc(db, "users", principalId);
       const principalDoc = await getDoc(principalRef);

       if (principalDoc.exists() && principalDoc.data().telegramId) {
         return principalDoc.data().telegramId;
       }
     }

     return '';
   } catch (error) {
     console.error("Error getting principal's Telegram ID:", error);
     return '';
   }
 };
 // Initialize timer
 useEffect(() => {
   const timer = setInterval(() => {
     setCurrentTime(new Date());
   }, 1000);

   return () => clearInterval(timer);
 }, []);
 // Load face detection models and fetch school location on mount
 useEffect(() => {
   const initializeResources = async () => {
     setIsLoading(true);
     await loadModels();
     await fetchSchoolLocation();
     setIsLoading(false);
   };

   initializeResources();

   return () => {
     // Clean up camera on unmount
     stopCamera();
   };
 }, [schoolId]);
 return (
   <div className="pb-20 md:pb-6">
     <div className="max-w-md mx-auto">
       {/* Header */}
       <div className="bg-[#0A2463] text-white p-4 rounded-b-xl shadow-lg mb-6">
         <h1 className="text-xl font-bold text-center">Absensi Selfie & Lokasi</h1>
         <div className="flex justify-between items-center mt-2">
           <div className="flex items-center">
             <Clock className="w-5 h-5 mr-2" />
             <span>{formattedTime}</span>
           </div>
           <div>
             <span className="text-sm">{formattedDate}</span>
           </div>
         </div>
       </div>

       {/* Main content */}
       <div className="bg-white rounded-xl shadow-lg overflow-hidden">
         {isLoading ? (
           <div className="flex flex-col items-center justify-center p-10">
             <Loader2 className="w-12 h-12 text-[#0A2463] animate-spin mb-4" />
             <p>Memuat sistem absensi...</p>
           </div>
         ) : attendanceSuccess ? (
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="p-6 flex flex-col items-center"
           >
             <div className="bg-green-100 p-4 rounded-full mb-6">
               <CheckCircle className="w-16 h-16 text-green-600" />
             </div>
             <h2 className="text-xl font-bold mb-2 text-center">Absensi Berhasil!</h2>
             <p className="text-gray-600 mb-6 text-center">
               {`Absensi ${attendanceType} Anda telah berhasil dicatat pada ${formattedTime}.`}
             </p>
             <Link href="/dashboard" className="bg-[#0A2463] text-white py-3 px-6 rounded-lg font-medium hover:bg-opacity-90 transition-all">
               Kembali ke Dashboard
             </Link>
           </motion.div>
         ) : (
           <div className="p-6">
             <AnimatePresence>
               {attendanceError && (
                 <motion.div
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: 'auto' }}
                   exit={{ opacity: 0, height: 0 }}
                   className="bg-red-100 border-l-4 border-red-600 text-red-700 p-4 mb-6"
                 >
                   <div className="flex items-center">
                     <AlertTriangle className="w-5 h-5 mr-2" />
                     <p>{attendanceError}</p>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>

             {/* Camera view */}
             <div className="flex flex-col items-center">
               <div className="relative w-full max-w-sm rounded-xl overflow-hidden bg-gray-100 mb-6 aspect-[3/4]">
                 {isCameraActive ? (
                   <>
                     <video
                       ref={videoRef}
                       autoPlay
                       playsInline
                       muted
                       className="w-full h-full object-cover"
                     />
                     <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                       <div className={`px-3 py-1 rounded-full text-xs font-medium ${isInRadius ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                         {isInRadius ? '✓ Dalam radius sekolah' : '✗ Di luar radius sekolah'}
                       </div>
                     </div>
                   </>
                 ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center p-6">
                     <Camera className="w-20 h-20 text-gray-300 mb-4" />
                     <p className="text-gray-500 text-center">
                       Kamera tidak aktif. Klik tombol di bawah untuk memulai.
                     </p>
                   </div>
                 )}
               </div>

               {/* Hidden canvas for capturing images */}
               <canvas ref={canvasRef} className="hidden" />

               {/* Location status */}
               <div className="w-full bg-gray-50 rounded-lg p-4 mb-6">
                 <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center">
                     <MapPin className="w-5 h-5 text-gray-500 mr-2" />
                     <span className="font-medium">Status Lokasi</span>
                   </div>

                   {locationProcessing ? (
                     <span className="text-gray-500 flex items-center">
                       <Loader2 className="w-4 h-4 animate-spin mr-1" />
                       Memeriksa...
                     </span>
                   ) : isInRadius ? (
                     <span className="text-green-600 font-medium flex items-center">
                       <CheckCircle className="w-4 h-4 mr-1" />
                       Lokasi Valid
                     </span>
                   ) : (
                     <span className="text-red-600 font-medium flex items-center">
                       <XCircle className="w-4 h-4 mr-1" />
                       Di Luar Radius
                     </span>
                   )}
                 </div>

                 <div className="text-sm text-gray-500">
                   {currentLocation.lat !== 0 ? (
                     <>
                       <p>Koordinat: {currentLocation.lat.toFixed(6)}, {currentLocation.lon.toFixed(6)}</p>
                       <p>
                         Jarak ke sekolah: {Math.round(calculateDistance(
                           currentLocation.lat, currentLocation.lon,
                           schoolLocation.lat, schoolLocation.lon
                         ))} meter
                       </p>
                     </>
                   ) : (
                     <p>Lokasi belum dideteksi</p>
                   )}
                 </div>
               </div>

               {/* Action buttons */}
               <div className="w-full flex flex-col gap-4">
                 {isCameraActive ? (
                   <>
                     <button
                       onClick={takeAttendance}
                       disabled={isProcessing || !isInRadius || !modelsLoaded}
                       className={`w-full py-3 rounded-lg font-medium flex items-center justify-center ${
                         isInRadius && modelsLoaded ? 'bg-[#0A2463] text-white hover:bg-opacity-90' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                       } transition-all`}
                     >
                       {isProcessing ? (
                         <>
                           <Loader2 className="w-5 h-5 animate-spin mr-2" />
                           Memproses...
                         </>
                       ) : (
                         <>
                           <Camera className="w-5 h-5 mr-2" />
                           Ambil Absensi {attendanceType === 'masuk' ? 'Masuk' : 'Pulang'}
                         </>
                       )}
                     </button>

                     <button
                       onClick={stopCamera}
                       disabled={isProcessing}
                       className="w-full py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all"
                     >
                       Matikan Kamera
                     </button>
                   </>
                 ) : (
                   <button
                     onClick={startCamera}
                     disabled={isProcessing}
                     className="w-full bg-[#0A2463] text-white py-3 rounded-lg font-medium hover:bg-opacity-90 transition-all flex items-center justify-center"
                   >
                     <Camera className="w-5 h-5 mr-2" />
                     Mulai Kamera
                   </button>
                 )}

                 {!isCameraActive && (
                   <Link href="/dashboard" className="w-full py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all text-center">
                     Kembali ke Dashboard
                   </Link>
                 )}
               </div>
             </div>
           </div>
         )}
       </div>

       {/* Helper text */}
       <div className="bg-blue-50 p-4 rounded-lg mt-6">
         <h3 className="font-medium text-blue-800 mb-1 text-sm">Panduan Absensi:</h3>
         <ol className="text-sm text-blue-700 list-decimal pl-4 space-y-1">
           <li>Pastikan wajah Anda terlihat jelas di kamera</li>
           <li>Posisikan diri Anda di dalam radius sekolah</li>
           <li>Izinkan akses kamera dan lokasi</li>
           <li>Jangan menggunakan VPN atau fake GPS</li>
         </ol>
       </div>
     </div>
   </div>
 );
}
