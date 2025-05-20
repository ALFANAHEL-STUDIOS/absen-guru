"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { QrCode, Mail, Lock, ArrowRight, LogIn, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSplash, setShowSplash] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  useEffect(() => {
    // Show splash screen for 1 second
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1000);

    // Check if we have a remembered email
    if (typeof window !== 'undefined') {
      const rememberedEmail = localStorage.getItem('rememberedEmail');
      if (rememberedEmail) {
        setEmail(rememberedEmail);
        setRememberPassword(true);
      }
    }
    return () => clearTimeout(timer);
  }, []);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    if (!email || !password) {
      toast.error("Email dan password harus diisi");
      return;
    }
    try {
      setIsLoading(true);
      // Import directly from firebase instead of using context hook in event handler
      const {
        auth
      } = await import("@/lib/firebase");
      const {
        signInWithEmailAndPassword,
        setPersistence,
        browserSessionPersistence,
        browserLocalPersistence
      } = await import("firebase/auth");
      const {
        doc,
        getDoc
      } = await import("firebase/firestore");
      const {
        db
      } = await import("@/lib/firebase");

      // Set persistence based on remember password checkbox
      await setPersistence(auth, rememberPassword ? browserLocalPersistence : browserSessionPersistence);

      // Sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user data to determine the role
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userDocData = userDoc.data();
        // Store the role in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('userRole', userDocData.role || 'student');
          if (userDocData.schoolId) {
            localStorage.setItem('schoolId', userDocData.schoolId);
          } else if (userDocData.role === 'admin') {
            // If admin has no schoolId, they need to set up a school
            localStorage.setItem('needsSchoolSetup', 'true');
          }

          // Store email in localStorage if remember password is checked
          if (rememberPassword) {
            localStorage.setItem('rememberedEmail', email);
          } else {
            localStorage.removeItem('rememberedEmail');
          }
        }
      }
      toast.success("Login berhasil!");

      // Redirect based on role and school setup status
      if (userDoc.exists() && userDoc.data().role === 'admin' && !userDoc.data().schoolId) {
        router.push("/dashboard/setup-school");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error("Login gagal, Username atau Password salah.");
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
      }} data-unique-id="9c0af28b-a51e-4feb-98bf-ce0bc6e2bc51" data-file-name="app/login/page.tsx">
            <motion.div initial={{
          scale: 0.8,
          opacity: 0
        }} animate={{
          scale: 1,
          opacity: 1
        }} transition={{
          delay: 0.2,
          duration: 0.5
        }} className="flex flex-col items-center" data-unique-id="eacc1354-46b3-4ae9-9e37-f36c9fa8f618" data-file-name="app/login/page.tsx">
              <div className="bg-white p-6 rounded-full mb-4" data-unique-id="ddf50800-0aff-4f15-8ca1-9a9cb9df2bce" data-file-name="app/login/page.tsx">
                <QrCode className="h-16 w-16 text-primary" />
              </div>
              <h1 className="text-white text-base sm:text-xl md:text-2xl font-bold text-center" data-unique-id="fbd36134-d999-485b-b4df-da4322044cef" data-file-name="app/login/page.tsx"><span className="editable-text" data-unique-id="cec098dd-9d56-4e57-85ca-eaedfb654e1e" data-file-name="app/login/page.tsx">
                ABSENSI SISWA QR CODE
              </span></h1>
            </motion.div>
          </motion.div> : <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50" data-unique-id="fc311db6-ccf6-47d1-956c-51361ab75c77" data-file-name="app/login/page.tsx" data-dynamic-text="true">
            {/* Header */}
            <header className="bg-primary text-white py-4 fixed top-0 left-0 right-0 z-50 shadow-md" data-unique-id="1ee69088-aa5d-48e9-817e-941a5bd03554" data-file-name="app/login/page.tsx">
              <div className="container-custom flex justify-between items-center" data-unique-id="e0ed24df-83a3-43d0-bd36-050ea7a4e653" data-file-name="app/login/page.tsx">
                <Link href="/" className="flex items-center gap-2" data-unique-id="ee4d214a-0d79-46e4-9ff2-63906544c85d" data-file-name="app/login/page.tsx">
                  <QrCode className="h-6 w-6" />
                  <span className="font-bold text-lg" data-unique-id="2ec01183-faa6-4d4a-aff6-d961bae66e5b" data-file-name="app/login/page.tsx"><span className="editable-text" data-unique-id="5e607f66-b2a4-4e0b-b8fc-ca5991f5f454" data-file-name="app/login/page.tsx">ABSEN DIGITAL</span></span>
                </Link>
              </div>
            </header>

            <div className="pt-20 sm:pt-20 md:pt-24 mt-4 pb-12 sm:pb-16 px-3 md:px-4" data-unique-id="1f99846d-043f-40ab-93ea-87d08b7e7d40" data-file-name="app/login/page.tsx">
              <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden" data-unique-id="fd99852c-5b2b-4372-a09b-d294e94f9e8c" data-file-name="app/login/page.tsx">
                <div className="p-4 sm:p-6 md:p-8" data-unique-id="e186d7a5-636b-4705-9609-6115086769ca" data-file-name="app/login/page.tsx" data-dynamic-text="true">
                  <div className="flex flex-col items-center mb-6" data-unique-id="04e35e1f-6e77-494f-b049-b594a9fb427f" data-file-name="app/login/page.tsx">
                    <div className="bg-primary/10 p-4 rounded-full mb-4 border border-gray-300" data-unique-id="dfc5e353-c646-416e-af7e-f672e46a1a6c" data-file-name="app/login/page.tsx">
                      <QrCode className="h-12 w-12 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800" data-unique-id="78843569-de00-4997-adb3-be9fefbef8d5" data-file-name="app/login/page.tsx"><span className="editable-text" data-unique-id="dcde503e-4f39-4ec8-88f4-3919fbe9c558" data-file-name="app/login/page.tsx">LOGIN SISTEM</span></h2>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4" data-unique-id="51441810-df1d-4cc0-ac7b-6d5fd40e33a2" data-file-name="app/login/page.tsx">
                    <div className="space-y-2" data-unique-id="3f04a51c-dc25-4ce9-bb7f-f867d005387e" data-file-name="app/login/page.tsx">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700" data-unique-id="0d0700cf-2c5d-4a27-9fc5-6a772ae29ea3" data-file-name="app/login/page.tsx"><span className="editable-text" data-unique-id="5476309f-34e0-4f06-837f-58203e9c3972" data-file-name="app/login/page.tsx">Email</span></label>
                      <div className="relative" data-unique-id="5ee0433f-affc-4fe0-9422-831a4ac773b4" data-file-name="app/login/page.tsx">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" data-unique-id="e96eec53-7572-45a2-a52b-bec1064d8c0d" data-file-name="app/login/page.tsx">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5" placeholder="Masukkan E-mail" data-unique-id="009a18fa-947e-4d06-89c8-f59b9d2d7477" data-file-name="app/login/page.tsx" />
                      </div>
                    </div>

                    <div className="space-y-2" data-unique-id="b392863b-1b1d-4e86-8e33-8504ec54b0b7" data-file-name="app/login/page.tsx">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700" data-unique-id="eb9fd2d7-fb3c-4d67-86ff-d3633474f06d" data-file-name="app/login/page.tsx"><span className="editable-text" data-unique-id="54fec554-ada3-413d-87a4-32cdce0947a4" data-file-name="app/login/page.tsx">Password</span></label>
                      <div className="relative" data-unique-id="2e6ff3b2-6e1b-45c6-8c3e-c8045a135e7f" data-file-name="app/login/page.tsx">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" data-unique-id="2bfdb768-bdbf-4926-967a-871ae12d45a3" data-file-name="app/login/page.tsx">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input type={showPassword ? "text" : "password"} id="password" value={password} onChange={e => setPassword(e.target.value)} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 pr-10 p-2.5" placeholder="Masukkan Password" data-unique-id="46f9b5b2-bb59-417f-aacc-d400a2fc354a" data-file-name="app/login/page.tsx" />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)} data-unique-id="e840c721-430a-4bdf-9ce9-fa85964c042e" data-file-name="app/login/page.tsx" data-dynamic-text="true">
                          {showPassword ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600" data-unique-id="03de3a88-b920-495e-b5e8-2eb44427e991" data-file-name="app/login/page.tsx"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600" data-unique-id="9da4be5c-c4b2-4886-85f6-f8feb3606680" data-file-name="app/login/page.tsx"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center mt-3" data-unique-id="1acdf9c9-bf09-4161-9614-1e23f089d08c" data-file-name="app/login/page.tsx">
                      <input id="rememberPassword" type="checkbox" checked={rememberPassword} onChange={e => setRememberPassword(e.target.checked)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" data-unique-id="030573d5-4805-4f96-a73d-8b81e5d4e29b" data-file-name="app/login/page.tsx" />
                      <label htmlFor="rememberPassword" className="ml-2 block text-sm text-gray-700" data-unique-id="c4b828d9-38ff-4d3f-8e11-1c2f317328f9" data-file-name="app/login/page.tsx"><span className="editable-text" data-unique-id="24d8f7c0-58ed-424e-8199-8e95ad714e71" data-file-name="app/login/page.tsx">
                        Ingat Kata Sandi
                      </span></label>
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 px-5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-70" data-unique-id="d8e29347-94ed-47ab-8ea4-92d1b4e7c5ce" data-file-name="app/login/page.tsx" data-dynamic-text="true">
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
                      {isLoading ? "Memproses..." : "Masuk"}
                    </button>
                  </form>

                  {/* Login buttons section - Google login removed */}

                  <div className="mt-6 text-center" data-unique-id="a7af1b8c-58da-44df-a6b7-971997d30bab" data-file-name="app/login/page.tsx">
                    <p className="text-sm text-gray-600" data-unique-id="7e83e1e9-82c1-4b42-95a9-7e0df5b91d8e" data-file-name="app/login/page.tsx"><span className="editable-text" data-unique-id="bf1da453-9921-4b4c-904d-7674e25c09e1" data-file-name="app/login/page.tsx">
                      Belum memiliki akun?</span>{" "}
                      <Link href="/register" className="text-primary hover:underline font-medium" data-unique-id="a265a416-3511-449b-a944-c0cf011b00b8" data-file-name="app/login/page.tsx"><span className="editable-text" data-unique-id="672a318f-71c6-401f-b450-14b8d8276b08" data-file-name="app/login/page.tsx">
                        Daftar
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