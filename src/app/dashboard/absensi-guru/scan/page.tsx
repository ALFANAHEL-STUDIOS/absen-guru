"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Camera, Check, Clock, MapPin, XCircle, AlertTriangle, Send, Loader2, CheckCircle, FileText } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { sendTelegramNotification } from "@/lib/telegram";
export default function AbsensiGuruScan() {
 const { user, schoolId, userData } = useAuth();
 const router = useRouter();
 const videoRef = useRef<HTMLVideoElement | null>(null);
 const canvasRef = useRef<HTMLCanvasElement | null>(null);
 const [stream, setStream] = useState<MediaStream | null>(null);
 const [cameraActive, setCameraActive] = useState(false);
 const [photo, setPhoto] = useState<string | null>(null);
 const [loading, setLoading] = useState(false);
 const [success, setSuccess] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [attendanceType, setAttendanceType] = useState<"in" | "out">("in");
 const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
 const [schoolLocation, setSchoolLocation] = useState<{ lat: number; lng: number } | null>(null);
 const [withinRadius, setWithinRadius] = useState<boolean | null>(null);
 const [attendanceStatus, setAttendanceStatus] = useState<"present" | "izin" | null>(null);
 const [izinReason, setIzinReason] = useState("");
 useEffect(() => {
   // Get school location from database
   const fetchSchoolLocation = async () => {
     if (!schoolId) return;
     try {
       const schoolDoc = await getDocs(query(collection(db, "schools"), where("id", "==", schoolId)));
       if (!schoolDoc.empty) {
         const schoolData = schoolDoc.docs[0].data();
         if (schoolData.location) {
           setSchoolLocation(schoolData.location);
         } else {
           // Default location if not set in database
           setSchoolLocation({ lat: -6.175049084059931, lng: 106.82717569024714 });
         }
       }
     } catch (error) {
       console.error("Error fetching school location:", error);
     }
   };

   fetchSchoolLocation();

   // Cleanup function to stop camera stream when component unmounts
   return () => {
     if (stream) {
       stream.getTracks().forEach(track => track.stop());
     }
   };
 }, [schoolId]);
 const startCamera = async () => {
   try {
     const mediaStream = await navigator.mediaDevices.getUserMedia({
       video: { facingMode: "user" }
     });

     if (videoRef.current) {
       videoRef.current.srcObject = mediaStream;
     }

     setStream(mediaStream);
     setCameraActive(true);
     setError(null);

     // Also get current location
     getCurrentLocation();

   } catch (err) {
     console.error("Error accessing camera:", err);
     setError("Tidak dapat mengakses kamera. Mohon izinkan akses kamera pada browser Anda.");
   }
 };
 const getCurrentLocation = () => {
   if (!navigator.geolocation) {
     setError("Geolocation tidak didukung oleh browser ini");
     return;
   }

   navigator.geolocation.getCurrentPosition(
     (position) => {
       const userLocation = {
         lat: position.coords.latitude,
         lng: position.coords.longitude
       };

       setLocation(userLocation);

       // Check if within radius of school
       if (schoolLocation) {
         const distance = calculateDistance(
           userLocation.lat, userLocation.lng,
           schoolLocation.lat, schoolLocation.lng
         );

         // Set radius to 100 meters (can be configured)
         const withinRadius = distance <= 100;
         setWithinRadius(withinRadius);

         if (!withinRadius) {
           toast.error("Anda berada di luar radius sekolah. Absensi hanya dapat dilakukan di lokasi sekolah.");
         }
       }
     },
     (error) => {
       console.error("Error getting location:", error);
       setError("Tidak dapat mengakses lokasi. Mohon izinkan akses lokasi pada browser Anda.");
     }
   );
 };
 // Calculate distance in meters between two coordinates using Haversine formula
 const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
   const R = 6371e3; // Earth's radius in meters
   const φ1 = lat1 * Math.PI/180;
   const φ2 = lat2 * Math.PI/180;
   const Δφ = (lat2-lat1) * Math.PI/180;
   const Δλ = (lon2-lon1) * Math.PI/180;

   const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
             Math.cos(φ1) * Math.cos(φ2) *
             Math.sin(Δλ/2) * Math.sin(Δλ/2);

   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
   return R * c; // Distance in meters
 };
 const takePhoto = () => {
   if (videoRef.current && canvasRef.current) {
     const video = videoRef.current;
     const canvas = canvasRef.current;

     // Set canvas dimensions to match video
     canvas.width = video.videoWidth;
     canvas.height = video.videoHeight;

     // Draw video frame to canvas
     const context = canvas.getContext('2d');
     if (context) {
       context.drawImage(video, 0, 0, canvas.width, canvas.height);

       // Convert canvas to data URL
       const photoData = canvas.toDataURL('image/jpeg');
       setPhoto(photoData);

       // Stop camera stream
       if (stream) {
         stream.getTracks().forEach(track => track.stop());
         setCameraActive(false);
       }
     }
   }
 };
 const retakePhoto = () => {
   setPhoto(null);
   setAttendanceStatus(null);
   setIzinReason("");
   startCamera();
 };
 const submitAttendance = async () => {
   if (!photo || !location || !schoolId || !user) {
     toast.error("Data tidak lengkap untuk melakukan absensi");
     return;
   }
   // Cannot submit if not within radius and not in "izin" status
   if (!withinRadius && attendanceStatus !== "izin") {
     toast.error("Anda berada di luar radius sekolah. Absensi hanya dapat dilakukan di lokasi sekolah.");
     return;
   }
   // Check if "izin" status is selected but no reason provided
   if (attendanceStatus === "izin" && !izinReason.trim()) {
     toast.error("Silakan isi alasan izin");
     return;
   }
   try {
     setLoading(true);

     // Upload photo to Storage
     const photoRef = ref(storage, `teacher-attendance/${schoolId}/${user.uid}/${Date.now()}.jpg`);

     // Convert data URL to blob
     const response = await fetch(photo);
     const blob = await response.blob();

     const uploadResult = await uploadBytes(photoRef, blob);
     const photoUrl = await getDownloadURL(uploadResult.ref);

     // Get current date and time
     const now = new Date();
     const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
     const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }); // HH:MM

     // Determine status based on selection
     const status = attendanceStatus || "present";
     // Prepare attendance data
     const attendanceData = {
       teacherId: user.uid,
       teacherName: userData?.name || user.displayName || "Unknown",
       schoolId,
       date,
       time,
       timestamp: serverTimestamp(),
       type: attendanceType,
       status,
       photoUrl,
       location: {
         latitude: location.lat,
         longitude: location.lng
       }
     };
     // Add reason if status is "izin"
     if (status === "izin") {
       attendanceData.note = izinReason;
     }

     // Save to Firestore
     const attendanceRef = collection(db, "teacherAttendance");
     await addDoc(attendanceRef, attendanceData);

     // Send notification to admin via Telegram
     try {
       const statusText = status === "present" ? "hadir" : "izin";
       const noteText = status === "izin" ? `\nAlasan: ${izinReason}` : "";
       const message = `🧑‍🏫 INFO ABSENSI GURU\n\nNama: ${userData?.name || user.displayName}\nStatus: ${statusText}\nWaktu: ${time}\nTanggal: ${date}${noteText}`;

       // Get admin Telegram ID
       const adminsQuery = query(
         collection(db, "users"),
         where("role", "==", "admin"),
         where("schoolId", "==", schoolId)
       );
       const adminsSnapshot = await getDocs(adminsQuery);

       adminsSnapshot.forEach(async (adminDoc) => {
         const adminData = adminDoc.data();
         if (adminData.telegramId) {
           await sendTelegramNotification({
             phoneNumber: adminData.telegramId,
             message: message
           });
         }
       });
     } catch (notifError) {
       console.error("Error sending notification:", notifError);
     }

     setSuccess(true);
     toast.success(`Absensi ${status === "present" ? "hadir" : "izin"} berhasil dilakukan!`);

     // Redirect after successful submission
     setTimeout(() => {
       router.push("/dashboard/absensi-guru");
     }, 2000);

   } catch (error) {
     console.error("Error submitting attendance:", error);
     toast.error("Gagal melakukan absensi");
     setLoading(false);
   }
 };
 return (
   <div className="pb-20 md:pb-6">
     <div className="flex items-center mb-6">
       <Camera className="h-7 w-7 text-primary mr-3" />
       <h1 className="text-2xl font-bold text-gray-800">
         <span className="editable-text">Absensi Guru</span>
       </h1>
     </div>

     <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-6 mb-6">
       <h2 className="text-lg font-semibold mb-4 text-center">
         <span className="editable-text">Absen {attendanceType === "in" ? "Masuk" : "Pulang"}</span>
       </h2>

       {/* Camera view or captured photo */}
       <div className="relative mb-4 bg-gray-100 rounded-lg overflow-hidden">
         {cameraActive ? (
           <>
             <video
               ref={videoRef}
               autoPlay
               playsInline
               className="w-full h-64 object-cover"
             />
             <canvas ref={canvasRef} className="hidden" />
           </>
         ) : photo ? (
           <img
             src={photo}
             alt="Captured photo"
             className="w-full h-64 object-cover"
           />
         ) : (
           <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
             <Camera className="h-12 w-12 text-gray-400 mb-2" />
             <p className="text-gray-500">
               <span className="editable-text">Foto belum diambil</span>
             </p>
           </div>
         )}

         {/* Location indicator */}
         {location && (
           <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-md text-xs font-medium flex items-center ${withinRadius ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
             <MapPin className="h-3 w-3 mr-1" />
             {withinRadius ? (
               <span>Lokasi valid</span>
             ) : (
               <span>Di luar zona</span>
             )}
           </div>
         )}
       </div>

       {/* Time indicator */}
       <div className="mb-4 text-center">
         <p className="text-gray-500 text-sm flex items-center justify-center">
           <Clock className="h-4 w-4 mr-1" />
           {new Date().toLocaleTimeString('id-ID', {
             hour: '2-digit',
             minute: '2-digit',
             hour12: false
           })}
         </p>
       </div>

       {/* Error message */}
       {error && (
         <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start">
           <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
           <span>{error}</span>
         </div>
       )}

       {/* Attendance type selection */}
       {!cameraActive && !photo && !loading && (
         <div className="grid grid-cols-2 gap-3 mb-4">
           <button
             onClick={() => setAttendanceType("in")}
             className={`py-2 px-4 rounded-lg text-center ${
               attendanceType === "in"
                 ? "bg-blue-600 text-white"
                 : "bg-gray-100 text-gray-600"
             }`}
           >
             Absen Masuk
           </button>
           <button
             onClick={() => setAttendanceType("out")}
             className={`py-2 px-4 rounded-lg text-center ${
               attendanceType === "out"
                 ? "bg-blue-600 text-white"
                 : "bg-gray-100 text-gray-600"
             }`}
           >
             Absen Pulang
           </button>
         </div>
       )}

       {/* Photo has been taken - choose attendance status */}
       {photo && !loading && !success && (
         <div className="mt-4">
           <h3 className="text-sm font-medium mb-2">Status Kehadiran:</h3>
           <div className="grid grid-cols-2 gap-3 mb-4">
             <button
               onClick={() => setAttendanceStatus("present")}
               className={`py-2 px-4 rounded-lg text-center ${
                 attendanceStatus === "present"
                   ? "bg-green-600 text-white"
                   : "bg-gray-100 text-gray-600"
               }`}
             >
               <Check className="h-4 w-4 inline-block mr-1" />
               Hadir
             </button>
             <button
               onClick={() => setAttendanceStatus("izin")}
               className={`py-2 px-4 rounded-lg text-center ${
                 attendanceStatus === "izin"
                   ? "bg-amber-600 text-white"
                   : "bg-gray-100 text-gray-600"
               }`}
             >
               <FileText className="h-4 w-4 inline-block mr-1" />
               Izin
             </button>
           </div>

           {/* Izin reason field */}
           {attendanceStatus === "izin" && (
             <div className="mb-4">
               <label htmlFor="izin-reason" className="block text-sm font-medium text-gray-700 mb-1">
                 Alasan Izin:
               </label>
               <textarea
                 id="izin-reason"
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                 rows={3}
                 value={izinReason}
                 onChange={(e) => setIzinReason(e.target.value)}
                 placeholder="Masukkan alasan izin (wajib)"
                 required
               ></textarea>
             </div>
           )}
         </div>
       )}

       {/* Action buttons */}
       {!loading && !success ? (
         cameraActive ? (
           <button
             onClick={takePhoto}
             className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
           >
             <Camera className="h-5 w-5 inline-block mr-2" />
             <span className="editable-text">Ambil Foto</span>
           </button>
         ) : photo ? (
           <div className="grid grid-cols-2 gap-3">
             <button
               onClick={retakePhoto}
               className="bg-gray-100 text-gray-600 py-2 rounded-lg hover:bg-gray-200 transition-colors"
             >
               <Camera className="h-5 w-5 inline-block mr-2" />
               <span className="editable-text">Ambil Ulang</span>
             </button>
             <button
               onClick={submitAttendance}
               className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
               disabled={!attendanceStatus}
             >
               <Send className="h-5 w-5 inline-block mr-2" />
               <span className="editable-text">Kirim</span>
             </button>
           </div>
         ) : (
           <button
             onClick={startCamera}
             className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
           >
             <Camera className="h-5 w-5 inline-block mr-2" />
             <span className="editable-text">Mulai Kamera</span>
           </button>
         )
       ) : (
         <div className="py-2 text-center">
           {loading ? (
             <motion.div
               className="flex items-center justify-center"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
             >
               <Loader2 className="h-5 w-5 animate-spin mr-2" />
               <span>Memproses...</span>
             </motion.div>
           ) : (
             <motion.div
               className="flex items-center justify-center text-green-600"
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
             >
               <CheckCircle className="h-5 w-5 mr-2" />
               <span>Absensi Berhasil!</span>
             </motion.div>
           )}
         </div>
       )}
     </div>

     {/* Info box */}
     <div className="max-w-md mx-auto bg-blue-50 rounded-lg p-4 border border-blue-100">
       <h3 className="font-medium text-blue-800 mb-2">Informasi:</h3>
       <ul className="text-sm text-blue-700 space-y-2">
         <li className="flex items-start">
           <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
           <span>Pastikan wajah terlihat jelas dalam foto</span>
         </li>
         <li className="flex items-start">
           <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
           <span>Absensi hanya dapat dilakukan di lokasi sekolah</span>
         </li>
         <li className="flex items-start">
           <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
           <span>Gunakan status "Izin" jika berhalangan mengajar karena ada kegiatan rapat atau dinas keluar</span>
         </li>
         <li className="flex items-start">
           <AlertTriangle className="h-4 w-4 text-amber-600 mr-2 mt-0.5" />
           <span>Status "Alpha" akan diberikan jika tidak melakukan absensi sesuai jadwal</span>
         </li>
       </ul>
     </div>
   </div>
 );
}
