"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { QrCode, Mail, Lock, User, Building, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("siswa");
  const [showSplash, setShowSplash] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  useEffect(() => {
    // Show splash screen for 1 second
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    if (!name || !email || !password) {
      toast.error("Semua field harus diisi");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Password tidak cocok");
      return;
    }
    try {
      setIsLoading(true);
      // Import auth module properly without calling hooks inside handlers
      const {
        auth,
        db
      } = await import("@/lib/firebase");
      const {
        createUserWithEmailAndPassword,
        updateProfile
      } = await import("firebase/auth");
      const {
        doc,
        setDoc,
        Timestamp
      } = await import("firebase/firestore");

      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile
      await updateProfile(user, {
        displayName: name
      });

      // Create a user document with proper data structure for Firestore
      const userData = {
        name,
        email,
        role: role || 'siswa',
        schoolId: null,
        // Default to null, will be assigned later by admin
        createdAt: Timestamp.now()
      };
      try {
        // Create user document first
        await setDoc(doc(db, "users", user.uid), userData);

        // Create a school document if user is an admin
        if (role === 'admin') {
          const schoolId = user.uid;

          // Create a school document with proper data structure for Firestore
          const schoolData = {
            name: 'New School',
            npsn: '12345678',
            address: 'School Address',
            principalName: name,
            principalNip: '123456',
            createdAt: Timestamp.now(),
            createdBy: user.uid
          };
          try {
            await setDoc(doc(db, "schools", schoolId), schoolData);
            // If school was created successfully, update user's schoolId
            await setDoc(doc(db, "users", user.uid), {
              schoolId
            }, {
              merge: true
            });
          } catch (schoolError) {
            console.error("Error creating school:", schoolError);
            // Continue registration flow even if school creation fails
          }
        }
        toast.success("Pendaftaran berhasil!");
        router.push("/login");
      } catch (docError) {
        console.error("Error creating document:", docError);
        toast.error("Gagal mendaftarkan akun. Silakan coba lagi.");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "Pendaftaran gagal. Silakan coba lagi.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Email sudah digunakan";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Format email tidak valid";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password terlalu lemah";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Koneksi terputus. Periksa koneksi internet Anda";
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogleLogin = () => {
    toast.error("Login menggunakan Akun Google sedang dalam Pengembangan");
  };
  return <>
      <Toaster position="top-center" />
      
      <AnimatePresence>
        {showSplash ? <motion.div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-purple-500 to-orange-500 z-50" initial={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} transition={{
        duration: 0.1
      }} data-unique-id="8658ded7-d0b6-4e62-9855-13d76a39553d" data-file-name="app/register/page.tsx">
            <motion.div initial={{
          scale: 0.8,
          opacity: 0
        }} animate={{
          scale: 1,
          opacity: 1
        }} transition={{
          delay: 0.2,
          duration: 0.5
        }} className="flex flex-col items-center" data-unique-id="d421c455-3fcd-49b0-bdc2-150012a55a3a" data-file-name="app/register/page.tsx">
              <div className="bg-white p-6 rounded-full mb-4" data-unique-id="651ddb3b-33db-41be-ad81-6334727d49d6" data-file-name="app/register/page.tsx">
                <QrCode className="h-16 w-16 text-primary" />
              </div>
              <h1 className="text-white text-base sm:text-xl md:text-2xl font-bold text-center" data-unique-id="6c3507ad-3d00-42af-8349-508c9a5135aa" data-file-name="app/register/page.tsx"><span className="editable-text" data-unique-id="f5e0c197-dc31-48a6-8e98-c76478ac1bd9" data-file-name="app/register/page.tsx">
                ABSENSI SISWA QR CODE
              </span></h1>
            </motion.div>
          </motion.div> : <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50" data-unique-id="22239d1f-9415-4708-b4e4-2f583bc81f83" data-file-name="app/register/page.tsx" data-dynamic-text="true">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="bg-primary text-white py-4 fixed top-0 left-0 right-0 z-50 shadow-md" data-unique-id="a8461e2f-e2d0-4d95-9c8a-c428a2e8252a" data-file-name="app/register/page.tsx">
        <div className="container-custom flex justify-between items-center" data-unique-id="4e2c1a21-eb91-420a-a488-145456c00e84" data-file-name="app/register/page.tsx">
          <Link href="/" className="flex items-center gap-2" data-unique-id="bdeb7afc-2a81-4bfb-93c8-6e3e644ed20f" data-file-name="app/register/page.tsx">
            <QrCode className="h-6 w-6" />
            <span className="font-bold text-lg" data-unique-id="84e33b76-927b-4a78-8fbe-0bed04432be2" data-file-name="app/register/page.tsx"><span className="editable-text" data-unique-id="beae768a-bfa7-4d6b-830d-2f74f6726f5d" data-file-name="app/register/page.tsx">ABSEN DIGITAL</span></span>
          </Link>
        </div>
      </header>

      <div className="pt-20 sm:pt-20 md:pt-24 mt-0 pb-12 sm:pb-16 px-3 sm:px-4" data-unique-id="ff580e38-c299-48bf-8e0b-8eb7cda42e0d" data-file-name="app/register/page.tsx">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden" data-unique-id="b0464cea-5be4-4916-b7d7-f9da55928b4a" data-file-name="app/register/page.tsx">
          <div className="p-4 sm:p-6 md:p-8" data-unique-id="7fa36cbc-b95d-43af-8bed-6cce281fb055" data-file-name="app/register/page.tsx" data-dynamic-text="true">
            <div className="flex flex-col items-center mb-6" data-unique-id="150fb3f7-08a4-4700-9179-2d646bde1b7f" data-file-name="app/register/page.tsx">
              <div className="bg-primary/10 p-4 rounded-full mb-4 border border-gray-300" data-unique-id="0565a194-7a91-4e19-8ee2-91c227e6f428" data-file-name="app/register/page.tsx">
                <QrCode className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800" data-unique-id="b1f3f357-8d73-4e5d-a3d2-470dc73e57bb" data-file-name="app/register/page.tsx"><span className="editable-text" data-unique-id="376e064e-64a6-4f67-9562-d02506d09ccb" data-file-name="app/register/page.tsx">MEMBUAT AKUN</span></h2>
            </div>

            <form onSubmit={handleRegister} className="space-y-4" data-unique-id="aa921906-984a-4c15-b48a-bf89f5fdccd7" data-file-name="app/register/page.tsx">
              <div className="space-y-2" data-unique-id="fec5787c-79be-4806-adc7-4eb1a906f185" data-file-name="app/register/page.tsx">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700" data-unique-id="a0b0bf17-8d2e-4ca9-b740-4878af1178b3" data-file-name="app/register/page.tsx"><span className="editable-text" data-unique-id="d7914b7f-ed6d-46bc-a310-fe1b691ebf39" data-file-name="app/register/page.tsx">Nama Lengkap Anda</span></label>
                <div className="relative" data-unique-id="6afc6e27-80c4-4beb-b3c2-e1723f03637e" data-file-name="app/register/page.tsx">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" data-unique-id="bbd38791-6fb9-46d4-b5fc-be373547bd50" data-file-name="app/register/page.tsx">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5" placeholder="Nama lengkap" data-unique-id="7529af53-2e75-4c16-9480-c9a5a634b606" data-file-name="app/register/page.tsx" />
                </div>
              </div>

              <div className="space-y-2" data-unique-id="92d35834-9541-4585-bd09-920a7808d2f3" data-file-name="app/register/page.tsx">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700" data-unique-id="ab5b4d39-802c-457e-bdea-afe042b3beca" data-file-name="app/register/page.tsx"><span className="editable-text" data-unique-id="53eb21f9-6efb-4ea8-ba71-4070018da89c" data-file-name="app/register/page.tsx">Email</span></label>
                <div className="relative" data-unique-id="1626fd50-6104-4108-92ae-afa67c2f546a" data-file-name="app/register/page.tsx">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" data-unique-id="a5b317f2-db87-48f3-be4a-dc13f8573446" data-file-name="app/register/page.tsx">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5" placeholder="Masukkan E-mail" data-unique-id="b6aaa4fa-2501-41ad-998d-26a5bf0911d1" data-file-name="app/register/page.tsx" />
                </div>
              </div>

              <div className="space-y-2" data-unique-id="2465c4f3-f94e-4747-9956-1fe9e4016ed5" data-file-name="app/register/page.tsx">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700" data-unique-id="a381f15d-cad6-45f5-869f-199a7ba53588" data-file-name="app/register/page.tsx"><span className="editable-text" data-unique-id="9591270e-4653-46aa-ada1-8989447bc500" data-file-name="app/register/page.tsx">Peran</span></label>
                <div className="relative" data-unique-id="318eca55-bacf-424e-b468-f701c531d3f1" data-file-name="app/register/page.tsx">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" data-unique-id="cc7f83bd-f4b6-4c7e-a1df-313daa8e9074" data-file-name="app/register/page.tsx">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <select id="role" value={role} onChange={e => setRole(e.target.value)} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5" data-unique-id="b8e5ebbe-bb61-4ff4-8590-9f9b1ae01f03" data-file-name="app/register/page.tsx">
                    <option value="admin" data-unique-id="2977a3a8-e3d0-42b2-84f6-560b9df5fdeb" data-file-name="app/register/page.tsx"><span className="editable-text" data-unique-id="31630879-8448-4322-8cf4-66473e48bcd9" data-file-name="app/register/page.tsx">Administrator Sekolah</span></option>
                    <option value="guru" data-unique-id="2f6f85be-5571-4212-ac61-892ecd507071" data-file-name="app/register/page.tsx"><span className="editable-text" data-unique-id="305c63de-8ba7-440e-b9cb-8ddb45bc0185" data-file-name="app/register/page.tsx">Guru</span></option>
                    <option value="siswa" data-unique-id="9bf13cc0-62cb-4a20-99d6-5a952d439987" data-file-name="app/register/page.tsx"><span className="editable-text" data-unique-id="4abddba0-c3f8-409b-a04a-ab4a41b7edb9" data-file-name="app/register/page.tsx">Siswa</span></option>
                  </select>
                </div>
              </div>

              <div className="space-y-2" data-unique-id="a80e1f0f-c539-47d7-8efd-90b192369d01" data-file-name="app/register/page.tsx">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700" data-unique-id="d0b209b2-7472-4ff8-9974-2fc86bab99a8" data-file-name="app/register/page.tsx"><span className="editable-text" data-unique-id="5451b8bd-514a-4939-a080-58f784111dbc" data-file-name="app/register/page.tsx">Password</span></label>
                <div className="relative" data-unique-id="c69f0dda-569a-44ad-a8b6-59672e9af057" data-file-name="app/register/page.tsx">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" data-unique-id="1805bedd-2a26-4c52-9a2c-c691a5528deb" data-file-name="app/register/page.tsx">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="relative" data-unique-id="127a013d-7c58-4f7c-bc86-6a57575d6c89" data-file-name="app/register/page.tsx">
                    <input type={showPassword ? "text" : "password"} id="password" value={password} onChange={e => setPassword(e.target.value)} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 pr-10 p-2.5" placeholder="Masukkan Password" data-unique-id="e18a72ce-434b-406d-a6eb-34b1e585a67e" data-file-name="app/register/page.tsx" />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} data-unique-id="df8252e1-1dd1-4f55-a7f7-ad1ec9b19f4c" data-file-name="app/register/page.tsx" data-dynamic-text="true">
                      {showPassword ? <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 hover:text-gray-700" data-unique-id="6451a02f-a558-48b4-bb96-74188105fb0f" data-file-name="app/register/page.tsx"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 hover:text-gray-700" data-unique-id="ccb612d9-4d11-47d2-996f-cdd2e0ff6480" data-file-name="app/register/page.tsx"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2" data-unique-id="72f7675d-0f5d-465d-9465-d37525255ab0" data-file-name="app/register/page.tsx">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700" data-unique-id="56de898d-c76b-4db2-964a-e48f4e2dcc7a" data-file-name="app/register/page.tsx"><span className="editable-text" data-unique-id="78db4a99-4272-4960-a419-71ea8e57eed3" data-file-name="app/register/page.tsx">Konfirmasi Password</span></label>
                <div className="relative" data-unique-id="d2ddd743-e28c-4611-946f-372656b59124" data-file-name="app/register/page.tsx">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" data-unique-id="5d946a62-419c-4e2b-9874-dd3cef9b4e63" data-file-name="app/register/page.tsx">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="relative" data-unique-id="42a62335-fe68-4093-bb62-964eb1bff507" data-file-name="app/register/page.tsx">
                    <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 pr-10 p-2.5" placeholder="Konfirmasi Password" data-unique-id="b8c21256-a482-4311-a04e-d2503d770e58" data-file-name="app/register/page.tsx" />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? "Hide password" : "Show password"} data-unique-id="81cb704f-0dcd-4cdd-9af9-a61dc1b0ed06" data-file-name="app/register/page.tsx" data-dynamic-text="true">
                      {showConfirmPassword ? <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 hover:text-gray-700" data-unique-id="f855bbc8-1567-4808-b108-f4a2cd0b6e23" data-file-name="app/register/page.tsx"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 hover:text-gray-700" data-unique-id="3d6f4c9c-05cb-4be0-b5ce-4b2283574674" data-file-name="app/register/page.tsx"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>}
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 px-5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-70" data-unique-id="98e194dd-474f-4a7c-a1cb-2e4ac492836a" data-file-name="app/register/page.tsx" data-dynamic-text="true">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>
                    Mendaftar
                    <ArrowRight className="h-5 w-5" />
                  </>}
              </button>
            </form>

            {/* Registration buttons section - Google login removed */}

            <div className="mt-6 text-center" data-unique-id="4e15f826-3cbf-4aa0-8f92-f53feeff0bc5" data-file-name="app/register/page.tsx">
              <p className="text-sm text-gray-600" data-unique-id="f3b81da6-ac4d-4112-bdc3-b4644cbd1e21" data-file-name="app/register/page.tsx"><span className="editable-text" data-unique-id="9d09006a-0ad0-47fd-8eb8-c49d7b51832a" data-file-name="app/register/page.tsx">
                Sudah memiliki akun?</span>{" "}
                <Link href="/login" className="text-primary hover:underline font-medium" data-unique-id="266f60cf-6a45-4cf3-9de6-d05c166120dd" data-file-name="app/register/page.tsx"><span className="editable-text" data-unique-id="d5bc93ae-eaac-4b28-bf78-df41ab07d596" data-file-name="app/register/page.tsx">
                  Masuk
                </span></Link>
              </p>
            </div>
          </div>
        </div>
      </div>
          </div>}
      </AnimatePresence>
    </>;
}