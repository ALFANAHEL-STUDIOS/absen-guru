"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, User, MapPin, Calendar, Clock, CheckCircle, FileText, AlertTriangle, X, Send, Volume2, VolumeX } from "lucide-react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Scanner as QrScanner } from "@yudiel/react-qr-scanner";
// Define attendance status types
type AttendanceStatus = 'hadir' | 'izin' | 'alpha';
export default function TeacherAttendanceScan() {
 const { user, schoolId } = useAuth();
 const [currentStep, setCurrentStep] = useState<'camera' | 'confirmation' | 'success' | 'izin'>('camera');
 const [capturedImage, setCapturedImage] = useState<string | null>(null);
 const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
 const [locationError, setLocationError] = useState<string | null>(null);
 const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>('hadir');
 const [izinReason, setIzinReason] = useState<string>('');
 const [muted, setMuted] = useState<boolean>(false);
 const [loading, setLoading] = useState<boolean>(false);
 const cameraRef = useRef<HTMLVideoElement | null>(null);
 const canvasRef = useRef<HTMLCanvasElement | null>(null);
 const audioRef = useRef<HTMLAudioElement | null>(null);
 const [locationName, setLocationName] = useState<string>('');
 const [cameraStarted, setCameraStarted] = useState<boolean>(false);
 const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
 const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);

 // Current date time in Indonesian format
 const currentDate = new Date();
 const formattedDate = format(currentDate, "EEEE, d MMMM yyyy", { locale: id });
 const formattedTime = format(currentDate, "HH:mm:ss");

 // Initialize audio
 useEffect(() => {
   audioRef.current = new Audio('/sounds/beep.mp3');

   // Check for multiple cameras
   if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
     navigator.mediaDevices.enumerateDevices()
       .then(devices => {
         const videoDevices = devices.filter(device => device.kind === 'videoinput');
         setHasMultipleCameras(videoDevices.length > 1);
       })
       .catch(err => console.error("Error checking cameras:", err));
   }

   return () => {
     if (cameraStarted) {
       stopCamera();
     }
   };
 }, []);

 // Start camera
 const startCamera = async () => {
   try {
     if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
       toast.error("Kamera tidak didukung oleh browser Anda");
       return;
     }

     const stream = await navigator.mediaDevices.getUserMedia({
       video: {
         facingMode: cameraFacing,
         width: { ideal: 1280 },
         height: { ideal: 720 }
       }
     });

     if (cameraRef.current) {
       cameraRef.current.srcObject = stream;
       setCameraStarted(true);

       // Get location
       getLocation();
     }
   } catch (error) {
     console.error("Error starting camera:", error);
     toast.error("Gagal mengakses kamera");
   }
 };

 // Stop camera
 const stopCamera = () => {
   if (cameraRef.current && cameraRef.current.srcObject) {
     const tracks = (cameraRef.current.srcObject as MediaStream).getTracks();
     tracks.forEach(track => track.stop());
     cameraRef.current.srcObject = null;
     setCameraStarted(false);
   }
 };

 // Switch camera
 const switchCamera = () => {
   stopCamera();
   setCameraFacing(prevFacing => prevFacing === 'user' ? 'environment' : 'user');
   setTimeout(() => startCamera(), 300);
 };

 // Get location
 const getLocation = () => {
   if (!navigator.geolocation) {
     setLocationError("Geolocation tidak didukung oleh browser Anda");
     return;
   }

   navigator.geolocation.getCurrentPosition(
     async (position) => {
       const { latitude, longitude } = position.coords;
       setLocation({ lat: latitude, lng: longitude });

       // Get location name
       try {
         const response = await fetch(
           `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
         );
         const data = await response.json();
         setLocationName(data.display_name || "Lokasi terdeteksi");
       } catch (error) {
         console.error("Error getting location name:", error);
         setLocationName("Lokasi terdeteksi");
       }
     },
     (error) => {
       console.error("Error getting location:", error);
       setLocationError("Gagal mendapatkan lokasi. Pastikan GPS aktif.");
     }
   );
 };

 // Capture image
 const captureImage = () => {
   if (cameraRef.current && canvasRef.current) {
     const context = canvasRef.current.getContext('2d');
     if (context) {
       // Set canvas dimensions to match video
       canvasRef.current.width = cameraRef.current.videoWidth;
       canvasRef.current.height = cameraRef.current.videoHeight;

       // Draw video frame to canvas
       context.drawImage(
         cameraRef.current,
         0, 0,
         cameraRef.current.videoWidth,
         cameraRef.current.videoHeight
       );

       // Convert to data URL
       const dataUrl = canvasRef.current.toDataURL('image/png');
       setCapturedImage(dataUrl);

       // Play sound if not muted
       if (!muted && audioRef.current) {
         audioRef.current.play().catch(e => console.error("Error playing sound:", e));
       }

       // Move to confirmation step
       setCurrentStep('confirmation');
     }
   }
 };

 // Handle attendance submission
 const handleAttendanceSubmit = async () => {
   if (!schoolId || !user || !location) {
     toast.error("Data tidak lengkap untuk melakukan absensi");
     return;
   }

   try {
     setLoading(true);

     // Prepare attendance data
     const today = format(new Date(), "yyyy-MM-dd");
     const attendanceData = {
       teacherId: user.uid,
       teacherName: user.displayName || "Unknown Teacher",
       email: user.email,
       status: attendanceStatus,
       reason: attendanceStatus === 'izin' ? izinReason : '',
       date: today,
       time: format(new Date(), "HH:mm:ss"),
       day: format(new Date(), "EEEE", { locale: id }),
       timestamp: serverTimestamp(),
       location: {
         lat: location.lat,
         lng: location.lng,
         name: locationName
       },
       imageUrl: capturedImage,
       month: format(new Date(), "MM-yyyy") // Add month field for easier querying
     };

     // Save to Firestore
     await addDoc(collection(db, `schools/${schoolId}/teacher-attendance`), attendanceData);

     // Send Telegram notification
     await sendTelegramNotification(attendanceData);

     // Show success
     toast.success("Absensi berhasil disimpan");
     setCurrentStep('success');
   } catch (error) {
     console.error("Error saving attendance:", error);
     toast.error("Gagal menyimpan data absensi");
   } finally {
     setLoading(false);
   }
 };

 // Send Telegram notification
 const sendTelegramNotification = async (attendanceData: any) => {
   try {
     // Create message based on attendance status
     let message = "";
     const dateTime = `${format(new Date(), "d MMMM yyyy", { locale: id })} pukul ${format(new Date(), "HH:mm")} WIB`;

     if (attendanceData.status === 'hadir') {
       message = `Guru ${attendanceData.teacherName} telah melakukan absensi hadir pada ${dateTime}.`;
     } else if (attendanceData.status === 'izin') {
       message = `Guru ${attendanceData.teacherName} melakukan absensi izin pada ${dateTime}.\n\nAlasan: ${attendanceData.reason}`;
     } else if (attendanceData.status === 'alpha') {
       message = `Guru ${attendanceData.teacherName} tidak melakukan absensi (Alpha) pada ${dateTime}.`;
     }

     // Send notification
     const BOT_TOKEN = "7662377324:AAEFhwY-y1q3IrX4OEJAUG8VLa8DqNndH6E";

     // Get admin telegram ID
     const adminQuery = query(collection(db, "users"), where("role", "==", "admin"), where("schoolId", "==", schoolId));
     const adminSnapshot = await getDocs(adminQuery);

     if (!adminSnapshot.empty) {
       // Send to all admins
       adminSnapshot.forEach(async (adminDoc) => {
         const admin = adminDoc.data();
         if (admin.telegramNumber) {
           await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
             method: 'POST',
             headers: {
               'Content-Type': 'application/json'
             },
             body: JSON.stringify({
               chat_id: admin.telegramNumber,
               text: message
             })
           });
         }
       });
     }
   } catch (error) {
     console.error("Error sending Telegram notification:", error);
   }
 };

 // Request Izin
 const handleRequestIzin = () => {
   setAttendanceStatus('izin');
   setCurrentStep('izin');
 };

 // Submit Izin
 const handleSubmitIzin = async () => {
   if (!izinReason.trim()) {
     toast.error("Silakan masukkan alasan izin");
     return;
   }

   await handleAttendanceSubmit();
 };

 // Reset and retake
 const handleRetake = () => {
   setCapturedImage(null);
   setCurrentStep('camera');
 };
 return (
   <div className="w-full max-w-3xl mx-auto pb-20 md:pb-6 px-3 sm:px-4 md:px-6">
     <h1 className="text-2xl font-bold mb-6 text-gray-800">
       Absensi Selfie + Lokasi
     </h1>

     {/* Date and time display */}
     <div className="bg-primary/10 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
       <div className="flex items-center mb-2 sm:mb-0">
         <Calendar className="h-5 w-5 text-primary mr-2" />
         <span className="font-medium">{formattedDate}</span>
       </div>
       <div className="flex items-center">
         <Clock className="h-5 w-5 text-primary mr-2" />
         <span className="font-medium">{formattedTime}</span>
       </div>
     </div>

     <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
       <AnimatePresence mode="wait">
         {currentStep === 'camera' && (
           <motion.div
             key="camera"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="p-6"
           >
             <div className="mb-6">
               <h2 className="text-xl font-semibold text-gray-800 mb-2">Foto Selfie</h2>
               <p className="text-gray-600">Ambil foto selfie Anda dengan pencahayaan yang baik</p>
             </div>

             {!cameraStarted ? (
               <div className="bg-gray-50 rounded-xl aspect-video flex flex-col items-center justify-center border-2 border-dashed border-gray-300 mb-6">
                 <Camera className="h-16 w-16 text-gray-400 mb-4" />
                 <p className="text-gray-500 mb-6">Kamera tidak aktif</p>

                 <button
                   onClick={startCamera}
                   className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
                 >
                   Aktifkan Kamera
                 </button>
               </div>
             ) : (
               <div className="relative mb-6">
                 <div className="aspect-video bg-black rounded-xl overflow-hidden">
                   <video
                     ref={cameraRef}
                     className="w-full h-full object-cover"
                     autoPlay
                     playsInline
                   />
                 </div>

                 {hasMultipleCameras && (
                   <button
                     onClick={switchCamera}
                     className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full"
                   >
                     <Camera className="h-5 w-5" />
                   </button>
                 )}

                 <canvas ref={canvasRef} className="hidden" />
               </div>
             )}

             <div className="flex flex-col space-y-4">
               <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start">
                 <MapPin className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                 <div>
                   {location ? (
                     <>
                       <p className="text-sm font-medium text-blue-700">Lokasi Terdeteksi</p>
                       <p className="text-xs text-blue-600 mt-1">{locationName || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`}</p>
                     </>
                   ) : locationError ? (
                     <>
                       <p className="text-sm font-medium text-red-600">Error Lokasi</p>
                       <p className="text-xs text-red-600 mt-1">{locationError}</p>
                     </>
                   ) : (
                     <>
                       <p className="text-sm font-medium text-blue-700">Mendeteksi Lokasi...</p>
                       <p className="text-xs text-blue-600 mt-1">Pastikan GPS aktif pada perangkat Anda</p>
                     </>
                   )}
                 </div>
               </div>

               <button
                 onClick={captureImage}
                 disabled={!cameraStarted || !location}
                 className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
                   cameraStarted && location
                     ? "bg-primary text-white hover:bg-primary/90"
                     : "bg-gray-300 text-gray-500 cursor-not-allowed"
                 }`}
               >
                 <Camera className="h-5 w-5" />
                 Ambil Foto
               </button>

               <button
                 onClick={handleRequestIzin}
                 className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white py-3 rounded-lg hover:bg-amber-600 transition-colors"
               >
                 <FileText className="h-5 w-5" />
                 Izin (Rapat/Dinas Luar)
               </button>

               <div className="flex items-center justify-between">
                 <button
                   onClick={() => setMuted(!muted)}
                   className="flex items-center text-gray-500 text-sm"
                 >
                   {muted ? (
                     <><VolumeX className="h-4 w-4 mr-1" /> Suara Mati</>
                   ) : (
                     <><Volume2 className="h-4 w-4 mr-1" /> Suara Aktif</>
                   )}
                 </button>
               </div>
             </div>
           </motion.div>
         )}

         {currentStep === 'confirmation' && (
           <motion.div
             key="confirmation"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="p-6"
           >
             <div className="mb-6">
               <h2 className="text-xl font-semibold text-gray-800 mb-2">Konfirmasi Foto</h2>
               <p className="text-gray-600">Pastikan foto terlihat jelas</p>
             </div>

             <div className="mb-6">
               {capturedImage && (
                 <div className="aspect-video rounded-xl overflow-hidden border border-gray-200">
                   <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                 </div>
               )}
             </div>

             <div className="flex flex-col space-y-4">
               <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start">
                 <MapPin className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                 <div>
                   <p className="text-sm font-medium text-blue-700">Lokasi Absensi</p>
                   <p className="text-xs text-blue-600 mt-1">{locationName || `${location?.lat.toFixed(6)}, ${location?.lng.toFixed(6)}`}</p>
                 </div>
               </div>

               <button
                 onClick={handleAttendanceSubmit}
                 disabled={loading}
                 className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors"
               >
                 {loading ? (
                   <>
                     <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                     Menyimpan...
                   </>
                 ) : (
                   <>
                     <CheckCircle className="h-5 w-5" />
                     Konfirmasi & Simpan
                   </>
                 )}
               </button>

               <button
                 onClick={handleRetake}
                 disabled={loading}
                 className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
               >
                 <Camera className="h-5 w-5" />
                 Ambil Ulang
               </button>
             </div>
           </motion.div>
         )}

         {currentStep === 'success' && (
           <motion.div
             key="success"
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0 }}
             className="p-6 text-center"
           >
             <div className="flex flex-col items-center">
               <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                 <CheckCircle className="h-10 w-10 text-green-600" />
               </div>

               <h2 className="text-2xl font-bold text-gray-800 mb-2">Absensi Berhasil!</h2>
               <p className="text-gray-600 mb-6">
                 {attendanceStatus === 'hadir' ? (
                   "Data absensi kehadiran Anda telah berhasil disimpan"
                 ) : (
                   "Data izin Anda telah berhasil disimpan"
                 )}
               </p>

               <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 w-full max-w-xs mb-6">
                 <div className="flex justify-between mb-2">
                   <span className="text-gray-500">Tanggal:</span>
                   <span className="font-medium">{formattedDate}</span>
                 </div>
                 <div className="flex justify-between mb-2">
                   <span className="text-gray-500">Waktu:</span>
                   <span className="font-medium">{formattedTime}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-500">Status:</span>
                   <span className={`font-medium ${
                     attendanceStatus === 'hadir' ? 'text-green-600' :
                     attendanceStatus === 'izin' ? 'text-amber-600' :
                     'text-red-600'
                   }`}>
                     {attendanceStatus === 'hadir' ? 'Hadir' :
                      attendanceStatus === 'izin' ? 'Izin' : 'Alpha'}
                   </span>
                 </div>
               </div>

               <Link href="/dashboard/absensi-guru"
                 className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
               >
                 Kembali ke Dashboard
               </Link>
             </div>
           </motion.div>
         )}

         {currentStep === 'izin' && (
           <motion.div
             key="izin"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="p-6"
           >
             <div className="mb-6">
               <h2 className="text-xl font-semibold text-gray-800 mb-2">Form Izin</h2>
               <p className="text-gray-600">Silakan isi alasan izin Anda</p>
             </div>

             <div className="mb-6">
               <label htmlFor="izinReason" className="block text-sm font-medium text-gray-700 mb-1">
                 Alasan Izin
               </label>
               <textarea
                 id="izinReason"
                 rows={4}
                 value={izinReason}
                 onChange={e => setIzinReason(e.target.value)}
                 placeholder="Contoh: Rapat di Dinas Pendidikan, Dinas Luar, dll."
                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                 required
               />
             </div>

             <div className="flex flex-col space-y-4">
               <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex items-start">
                 <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                 <div>
                   <p className="text-sm font-medium text-amber-700">Informasi</p>
                   <p className="text-xs text-amber-600 mt-1">
                     Izin akan dicatat dengan lokasi Anda saat ini. Pastikan Anda telah mengaktifkan GPS.
                   </p>
                 </div>
               </div>

               <button
                 onClick={handleSubmitIzin}
                 disabled={loading || !izinReason.trim()}
                 className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
                   !loading && izinReason.trim()
                     ? "bg-amber-500 text-white hover:bg-amber-600"
                     : "bg-gray-300 text-gray-500 cursor-not-allowed"
                 }`}
               >
                 {loading ? (
                   <>
                     <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                     Menyimpan...
                   </>
                 ) : (
                   <>
                     <Send className="h-5 w-5" />
                     Kirim Izin
                   </>
                 )}
               </button>

               <button
                 onClick={() => setCurrentStep('camera')}
                 disabled={loading}
                 className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
               >
                 <X className="h-5 w-5" />
                 Batal
               </button>
             </div>
           </motion.div>
         )}
       </AnimatePresence>
     </div>
   </div>
 );
}
