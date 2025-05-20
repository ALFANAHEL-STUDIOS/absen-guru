"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { QrCode, Check, Clock, Bell, Shield, School, ChevronUp, Download, BarChart3, Users, Mail, Phone, Facebook, Twitter, Instagram, ArrowRight, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if we're scrolled down enough to show back-to-top button
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  return <main className="min-h-screen flex flex-col" data-unique-id="19b28cb0-b381-491a-918e-efa920ef1ea8" data-file-name="app/page.tsx" data-dynamic-text="true">
      {/* Header */}
      <header className="bg-primary text-white py-2 sm:py-4 fixed top-0 left-0 right-0 z-50 shadow-md" data-unique-id="0093f4ae-9fdd-43de-a38c-b9ccb382a6a6" data-file-name="app/page.tsx">
        <div className="container-custom px-3 sm:px-4 flex justify-between items-center" data-unique-id="c361ed69-0ccb-4456-80ec-b750e713e589" data-file-name="app/page.tsx">
          <div className="flex items-center gap-2" data-unique-id="9b95b85c-058d-49c8-8737-5d3ecc0a2341" data-file-name="app/page.tsx">
            <QrCode className="h-7 w-7" />
            <span className="font-bold text-xl" data-unique-id="f106615a-c624-4696-b70e-a51786bc056a" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="83d35a8a-a922-4c12-9bf9-3587e9fe087c" data-file-name="app/page.tsx">ABSEN DIGITAL</span></span>
          </div>
          <div className="hidden md:flex space-x-3" data-unique-id="253921b0-69b8-4b6d-b212-7bf2d064ea30" data-file-name="app/page.tsx">
            <Link href="/login" className="px-4 py-1.5 rounded-md border border-white/50 text-white text-sm font-medium hover:bg-orange-500 transition-colors flex items-center gap-2 backdrop-blur-sm" data-unique-id="b8ffd052-6ba2-40d6-9698-1758f4864dec" data-file-name="app/page.tsx">
              <LogIn className="h-4 w-4" /><span className="editable-text" data-unique-id="5a6fe75e-ecc7-45b9-8b94-d7f4bcf06e59" data-file-name="app/page.tsx">
              LOGIN
            </span></Link>
            <Link href="/register" className="px-4 py-1.5 rounded-md border border-white/50 text-white text-sm font-medium hover:bg-orange-500 transition-colors backdrop-blur-sm" data-unique-id="77f48903-1594-4212-9515-999df5046078" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="f12c0ccf-aa40-4942-ad9e-efccda8f909c" data-file-name="app/page.tsx">
              DAFTAR
            </span></Link>
          </div>
          <div className="md:hidden" data-unique-id="15e6922e-0c55-4c95-9eae-d8b1ca459e74" data-file-name="app/page.tsx" data-dynamic-text="true">
            <button className="p-2 rounded-md border border-white text-white hover:bg-white/20" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} data-unique-id="6fb2abaa-03e7-4f61-89d0-8f2cfa3d21df" data-file-name="app/page.tsx">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" data-unique-id="47f278b7-ebd9-4230-ab5f-6a28029142b8" data-file-name="app/page.tsx">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {mobileMenuOpen && <motion.div className="absolute top-full right-0 mt-2 mr-3 sm:mr-4 w-[calc(100vw-24px)] max-w-[192px] py-2 bg-white rounded-md shadow-lg z-50" initial={{
            opacity: 0,
            y: -20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.2
          }} data-unique-id="77ce512c-f0e8-474e-a769-ce7e36de45bf" data-file-name="app/page.tsx">
                <Link href="/login" className="block px-4 py-2 text-white hover:bg-primary hover:text-white transition-colors border border-blue-500 m-2 rounded-md text-sm bg-blue-500" data-unique-id="7c2d992e-e52e-4c85-8fe0-c43fa82177d1" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="0dbc84ba-b765-49f1-9abb-e97199534fc9" data-file-name="app/page.tsx">
                  LOGIN
                </span></Link>
                <Link href="/register" className="block px-4 py-2 text-white hover:bg-primary hover:text-white transition-colors border border-orange-500 m-2 rounded-md text-sm bg-orange-500" data-unique-id="d11fab7c-33ff-4b8e-9656-ce9d3a6228b0" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="87a6d592-9a24-469d-b073-94e62adb0f13" data-file-name="app/page.tsx">
                  DAFTAR
                </span></Link>
              </motion.div>}
          </div>
        </div>
      </header>

      {/* Main Content with padding for fixed header */}
      <div className="mt-12 bg-gradient-to-br from-[#f6ea41]/30 to-[#f048c6]/30 pt-6" data-unique-id="0dd4b0c1-f4e2-4015-b784-66b2b299ac8d" data-file-name="app/page.tsx" data-dynamic-text="true">
        {/* Hero Section */}
        <section className="py-6 sm:py-8 md:py-12 bg-transparent backdrop-blur-sm" data-unique-id="b6e5f4f5-b4a1-4543-93e8-f9cb6436b63d" data-file-name="app/page.tsx">
          <div className="container-custom px-3 sm:px-4" data-unique-id="681b89d1-1d97-4e41-a740-57e8112747ca" data-file-name="app/page.tsx" data-dynamic-text="true">
            <div className="flex items-center justify-center mb-4" data-unique-id="0f8ca045-4dbb-4bf7-af17-8cdead2faf30" data-file-name="app/page.tsx">
              <Check className="h-6 w-6 text-primary mr-2" />
              <p className="font-semibold text-primary" data-unique-id="b5fc649b-5d5a-4a5a-84ac-e7f2bd86ad8e" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="a95ce42d-2f55-479b-964b-ce23de1939f4" data-file-name="app/page.tsx">Solusi Terbaik untuk Absensi Sekolah</span></p>
            </div>
            
            <h1 className="text-center font-bold text-3xl md:text-5xl mb-4 leading-tight" data-unique-id="a93bf1d3-331b-4cd5-abb7-637591397d9e" data-file-name="app/page.tsx">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-600 to-secondary" data-unique-id="6b08b4ec-5154-4376-b860-14ca73334bfc" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="065379af-d80c-4aa5-8ac3-1c003cb53ede" data-file-name="app/page.tsx">
                ABSENSI SISWA MODERN DENGAN</span><br data-unique-id="1cef9ade-b679-45d0-95e3-cd1c1aa91dfd" data-file-name="app/page.tsx" /><span className="editable-text" data-unique-id="5b95427d-43ed-47bb-bea0-96613a1a4db0" data-file-name="app/page.tsx">QR CODE
              </span></span>
            </h1>
            
            <p className="text-center max-w-3xl mx-auto mb-5 text-slate-600 text-base md:text-lg lg:text-xl" data-unique-id="348e02d8-4ec0-4173-a4b9-b297433d14c5" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="7907c85a-df7a-4c7d-9e95-5ba09593385d" data-file-name="app/page.tsx">
              Sistem Absensi Digital yang menghubungkan informasi kehadiran siswa di sekolah dan orang tua secara real-time.
              Pantau kehadiran siswa dengan mudah, dapatkan notifikasi otomatis terkirim langsung ke
              Aplikasi Telegram, dan akses laporan lengkap kapan saja.
            </span></p>
            
            {/* Smartphone illustration - Enhanced mobile responsiveness */}
            <div className="flex justify-center mb-5" data-unique-id="5c3c7d14-5568-4939-830c-81e0803664f8" data-file-name="app/page.tsx">
              <div className="relative w-[280px] xs:w-[300px] sm:w-[320px] md:w-[340px] lg:w-[360px] h-auto aspect-[9/16] max-h-[560px]" data-unique-id="ddc1ac75-9652-4c67-bbcf-5fbe2f846103" data-file-name="app/page.tsx">
                <div className="relative bg-gray-900 rounded-[36px] p-2 shadow-xl h-full transform transition-all duration-300 hover:scale-[1.02]" data-unique-id="a89e8075-0044-4955-a3f8-d8474c443e49" data-file-name="app/page.tsx" data-dynamic-text="true">
                  {/* Phone frame with top notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-gray-900 rounded-b-xl" data-unique-id="381a8a9e-1796-4566-adab-06139abb06e7" data-file-name="app/page.tsx"></div>
                  
                  {/* Home button/indicator at bottom */}
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-gray-500 rounded-full" data-unique-id="51ef5b26-a299-4868-b0e9-a0f65452aa71" data-file-name="app/page.tsx"></div>
                  
                  <div className="bg-white rounded-[32px] overflow-hidden h-full" data-unique-id="02224e0d-70fa-4b72-8be8-d9b9030615b4" data-file-name="app/page.tsx" data-dynamic-text="true">
                    {/* Telegram chat interface - Better styled for mobile */}
                    <div className="bg-[#0088cc] text-white py-3 px-4 mt-6 flex items-center justify-between" data-unique-id="c685a368-3cdb-4dd0-9855-c7422f56b038" data-file-name="app/page.tsx">
                      <div className="text-base font-medium" data-unique-id="029ff205-b3d9-4b12-afa6-9a1ec3b3bd72" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="eaa44e53-3c73-4efa-ba02-442bb2497a1e" data-file-name="app/page.tsx">Notifikasi Kehadiran</span></div>
                      <div className="h-2 w-2 rounded-full bg-white/70" data-unique-id="d6fd021d-5106-4638-94e6-de1d21458ca8" data-file-name="app/page.tsx"></div>
                    </div>
                    <div className="p-2 xs:p-3 bg-[#e6ebf2] h-full overflow-y-auto" data-unique-id="acd449a7-6c96-463d-99f8-06e088366604" data-file-name="app/page.tsx">
                      <div className="bg-white rounded-lg p-2.5 xs:p-3 shadow-sm mb-3 border border-gray-100" data-unique-id="313e8867-e5e1-4709-9945-3cd5baff93cc" data-file-name="app/page.tsx">
                        <div className="font-medium text-[#0088cc] flex items-center text-sm xs:text-base" data-unique-id="42ebee44-de3e-4dd1-bb22-728832f2b297" data-file-name="app/page.tsx">
                          <span className="mr-2" data-unique-id="719939d0-474c-423e-8929-d013fd9f3434" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="dbac5f34-eba0-4fcf-8d2e-7256c40cddf8" data-file-name="app/page.tsx">🤖</span></span><span className="editable-text" data-unique-id="cf8bcb03-ee2d-411a-89d5-89ba3121f580" data-file-name="app/page.tsx">
                          Bot Absensi Sekolah
                        </span></div>
                        <div className="text-xs xs:text-sm mt-1.5" data-unique-id="b459c519-c300-4efa-a0c9-058f6e74dc78" data-file-name="app/page.tsx">
                          <p className="font-bold text-gray-800" data-unique-id="eaba1294-0fdb-4302-8663-22a9c3ae1f52" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="45066591-3954-46f5-a6af-6fc353de360a" data-file-name="app/page.tsx">👨‍🎓 INFO KEHADIRAN SISWA</span></p>
                          <div className="mt-1.5 space-y-0.5 text-gray-700" data-unique-id="1ed97cde-d78d-4b61-a9f4-dc7c0fb5c90a" data-file-name="app/page.tsx">
                            <p data-unique-id="baf77edc-9cd5-48a3-a39c-074f416b9c90" data-file-name="app/page.tsx"><span className="text-gray-500" data-unique-id="467630d6-0589-4058-82aa-30f199e98ed0" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="9e225035-3c04-4695-b7cd-4bb05f09fe47" data-file-name="app/page.tsx">Nama:</span></span><span className="editable-text" data-unique-id="880ba0f2-3cd8-4f13-9757-0ed36dc0706b" data-file-name="app/page.tsx"> Ahmad Farhan</span></p>
                            <p data-unique-id="ad532571-4888-4d2e-8ab1-ae4f97abc0f3" data-file-name="app/page.tsx"><span className="text-gray-500" data-unique-id="31e4d9af-c1e4-40c7-a475-950c5964bae4" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="374f85e8-f62a-48de-aafd-4e7443fd13f1" data-file-name="app/page.tsx">Jenis Kelamin:</span></span><span className="editable-text" data-unique-id="37ecdc0d-af06-4844-8dfb-ead94391ad44" data-file-name="app/page.tsx"> Laki-laki</span></p>
                            <p data-unique-id="c782d10c-829a-451a-a224-1015c42f6c22" data-file-name="app/page.tsx"><span className="text-gray-500" data-unique-id="a155797a-5adb-4046-881d-d1f1248a1747" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="f5b92685-9a94-458f-9181-3503a3cf7fdb" data-file-name="app/page.tsx">NISN:</span></span><span className="editable-text" data-unique-id="2783aa7a-6f1d-4267-9151-8c8b593f255c" data-file-name="app/page.tsx"> 0012345678</span></p>
                            <p data-unique-id="575d97dc-ecd3-4125-8178-76fac63cdc09" data-file-name="app/page.tsx"><span className="text-gray-500" data-unique-id="cbcd1595-99eb-403f-9c92-2c2f6bfa05c9" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="cf2687f4-52a2-497b-8178-edd4687cd4af" data-file-name="app/page.tsx">Kelas:</span></span><span className="editable-text" data-unique-id="7a8fbd8d-5ccd-4ae5-b59f-fc98296ffe22" data-file-name="app/page.tsx"> IX-A</span></p>
                            <p data-unique-id="e30c396e-5a4e-4de3-a0d9-2964f2cd5884" data-file-name="app/page.tsx"><span className="text-gray-500" data-unique-id="82c4d55e-7e1e-45f7-a1a3-03efbc5ebef4" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="3a62d979-c10f-484e-9e49-6fb37419c398" data-file-name="app/page.tsx">Status:</span></span> <span className="text-green-500 font-medium" data-unique-id="f791751a-2f56-43c5-b83a-a4b2bad0ffea" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="292e0adc-3693-4baf-9e08-a34e2c7394d8" data-file-name="app/page.tsx">✅ Hadir</span></span></p>
                            <p data-unique-id="6b06bd48-ddb5-4c0d-bc87-cac48d8651ac" data-file-name="app/page.tsx"><span className="text-gray-500" data-unique-id="4885b1cb-1d78-4c02-89b9-ff7e3f4dfec0" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="d7507392-d4a8-4917-95e5-3231980299eb" data-file-name="app/page.tsx">Waktu:</span></span><span className="editable-text" data-unique-id="2badf76e-b942-425f-9180-b6878dce82a6" data-file-name="app/page.tsx"> 07:15 WIB</span></p>
                            <p data-unique-id="faf67b54-a950-4bbe-840b-664cb9df53ea" data-file-name="app/page.tsx"><span className="text-gray-500" data-unique-id="23b5ca3b-0310-48a2-b8d6-9c46f3f76c81" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="0481a04e-9008-4ed5-a409-c7b89538cc61" data-file-name="app/page.tsx">Tanggal:</span></span><span className="editable-text" data-unique-id="8583b7d2-0c99-4c07-8d30-a0ce98f1b3f9" data-file-name="app/page.tsx"> 6 Mei 2025</span></p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-2.5 xs:p-3 shadow-sm border border-gray-100" data-unique-id="41b93f47-6f11-47e2-94b3-5d17e50fb879" data-file-name="app/page.tsx">
                        <div className="font-medium text-[#0088cc] flex items-center text-sm xs:text-base" data-unique-id="9e604c3a-b7ec-452f-aab2-f230809cab25" data-file-name="app/page.tsx">
                          <span className="mr-2" data-unique-id="3138e520-edd4-48c3-b655-1587dca41e33" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="8bd44cd5-1612-4256-a6bf-1a5760a97c67" data-file-name="app/page.tsx">🤖</span></span><span className="editable-text" data-unique-id="9d13e19c-58af-4afb-b076-7bd341d8043b" data-file-name="app/page.tsx">
                          Bot Absensi Sekolah
                        </span></div>
                        <div className="text-xs xs:text-sm mt-1.5" data-unique-id="f1837b5f-674b-4a4f-a5ca-9fe517b65534" data-file-name="app/page.tsx">
                          <p className="font-bold text-gray-800" data-unique-id="84d9b6e0-09b5-4d68-97d9-eb721d58351f" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="e80f9528-b55f-4731-9415-994319d178d9" data-file-name="app/page.tsx">👩‍🎓 INFO KEHADIRAN SISWA</span></p>
                          <div className="mt-1.5 space-y-0.5 text-gray-700" data-unique-id="611525c0-0ff6-4af2-9a1f-ae06c0363f4a" data-file-name="app/page.tsx">
                            <p data-unique-id="ac722819-627b-43af-8611-732a1f70fd31" data-file-name="app/page.tsx"><span className="text-gray-500" data-unique-id="6bcb2690-5293-4bec-8619-67a122b79409" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="d9126650-2812-48bc-af5c-62f9c932b787" data-file-name="app/page.tsx">Nama:</span></span><span className="editable-text" data-unique-id="1a735ca2-afa5-42ef-b314-1b0236a63be1" data-file-name="app/page.tsx"> Siti Aisyah</span></p>
                            <p data-unique-id="c8a05da6-4b9b-414e-8eee-4cc19cad52af" data-file-name="app/page.tsx"><span className="text-gray-500" data-unique-id="c7750d7f-6431-495c-bc73-413407cf5c0c" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="d0bff437-1500-4abc-afbd-c07d135347ca" data-file-name="app/page.tsx">Jenis Kelamin:</span></span><span className="editable-text" data-unique-id="3aa4bfbe-cd2a-43a0-bef4-147178e76203" data-file-name="app/page.tsx"> Perempuan</span></p>
                            <p data-unique-id="4c4cf20b-d9ae-4827-82d3-337674c87428" data-file-name="app/page.tsx"><span className="text-gray-500" data-unique-id="20fa5b50-f1f9-4af3-bbbe-f47237ccde90" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="f4eeb6ac-aa55-4afe-b1db-14b7c9ed4696" data-file-name="app/page.tsx">NISN:</span></span><span className="editable-text" data-unique-id="325b6b08-3ad1-4d4e-b35f-f5f169b0447e" data-file-name="app/page.tsx"> 0023456789</span></p>
                            <p data-unique-id="bbc96c81-6fc3-408b-877f-63c36c5b1885" data-file-name="app/page.tsx"><span className="text-gray-500" data-unique-id="2a02fc07-85de-4e42-9522-004fc82861a5" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="8b5fc826-7689-48cd-8339-d70600e2faee" data-file-name="app/page.tsx">Kelas:</span></span><span className="editable-text" data-unique-id="d48932d2-92aa-4648-a7d8-2b756e87b827" data-file-name="app/page.tsx"> VIII-B</span></p>
                            <p data-unique-id="2b453ef6-2b28-4b56-b58e-cd086a5052e9" data-file-name="app/page.tsx"><span className="text-gray-500" data-unique-id="71d172fc-a0fa-47e8-b46c-3955551cbda4" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="0163a889-464d-4562-9b44-191b0d70e630" data-file-name="app/page.tsx">Status:</span></span> <span className="text-green-500 font-medium" data-unique-id="3ff3da81-ac6f-4480-a8e2-f1f6cc1249b7" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="6c2ef73e-cc74-46a2-8fa0-1d173becf7ec" data-file-name="app/page.tsx">✅ Hadir</span></span></p>
                            <p data-unique-id="0c9d6a7b-3c60-4419-a4d1-7effaf90208d" data-file-name="app/page.tsx"><span className="text-gray-500" data-unique-id="fa752109-100f-436d-9759-e4334038e97c" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="7a315707-fe10-4252-996b-3fb97bad5a3b" data-file-name="app/page.tsx">Waktu:</span></span><span className="editable-text" data-unique-id="f8b7856f-8905-455f-9cd3-aedc05002996" data-file-name="app/page.tsx"> 07:08 WIB</span></p>
                            <p data-unique-id="8cbbe4c3-07a4-4102-b97c-90af78bde17e" data-file-name="app/page.tsx"><span className="text-gray-500" data-unique-id="e95aab4a-fff7-4971-ad31-909610eae99e" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="81e45768-1810-442e-b02e-dfbb632c6f0f" data-file-name="app/page.tsx">Tanggal:</span></span><span className="editable-text" data-unique-id="ca0b30ad-6e9f-4103-be31-d06c251d3ca5" data-file-name="app/page.tsx"> 6 Mei 2025</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Advantages */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8" data-unique-id="c5ed62b4-d9af-4372-a9be-25aacee2d488" data-file-name="app/page.tsx">
              <motion.div className="card flex flex-col items-center text-center p-4 bg-blue-400/90" initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5
            }} viewport={{
              once: true
            }} data-unique-id="6b001c00-008a-491b-8723-8172a5ffe2e3" data-file-name="app/page.tsx">
                <Clock className="h-12 w-12 mb-4 text-primary" />
                <h3 className="font-semibold text-lg mb-2" data-unique-id="c6f3a4af-323e-4dc8-8da0-49f96a7bcd77" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="7afe4c03-d2fb-422e-802b-7575da5b598d" data-file-name="app/page.tsx">Hemat Waktu</span></h3>
                <p className="text-gray-600" data-unique-id="830a805f-5b0a-4c1d-9fd7-cfac45010e3f" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="b92cea4c-b351-4311-94ee-3ab8058d023e" data-file-name="app/page.tsx">Proses absensi dalam hitungan detik</span></p>
              </motion.div>
              
              <motion.div className="card flex flex-col items-center text-center p-4 bg-purple-400/90" initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0.1
            }} viewport={{
              once: true
            }} data-unique-id="8062a38d-46da-47b4-9022-d55d1a47ed78" data-file-name="app/page.tsx">
                <Bell className="h-12 w-12 mb-4 text-primary" />
                <h3 className="font-semibold text-lg mb-2" data-unique-id="92f88305-92f7-4181-b366-7be50866db89" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="62bb4819-f56a-4842-b3b6-8fe1078b1181" data-file-name="app/page.tsx">Notifikasi Instan</span></h3>
                <p className="text-gray-600" data-unique-id="b8dccb0d-6483-4bdb-9db7-aa447c57c306" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="783e1a40-3166-4025-a994-f68d0da1bc1d" data-file-name="app/page.tsx">Kirim pemberitahuan ke orang tua</span></p>
              </motion.div>
              
              <motion.div className="card flex flex-col items-center text-center p-4 bg-green-400/90" initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0.2
            }} viewport={{
              once: true
            }} data-unique-id="a70c1ce1-2787-4fd1-9d37-684793f273b5" data-file-name="app/page.tsx">
                <Shield className="h-12 w-12 mb-4 text-primary" />
                <h3 className="font-semibold text-lg mb-2" data-unique-id="21a5b2df-2af8-46bb-90db-261a7ab4ee07" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="088b92fd-227e-44df-8872-0765fed3b770" data-file-name="app/page.tsx">Keamanan Tinggi</span></h3>
                <p className="text-gray-600" data-unique-id="c7f641f6-2ce8-43f8-ab37-7c40f5d40143" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="d7a5653d-efee-421c-9688-69d8fd249605" data-file-name="app/page.tsx">Data siswa terlindungi dengan baik</span></p>
              </motion.div>
              
              <motion.div className="card flex flex-col items-center text-center p-4 bg-yellow-400/90" initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0.3
            }} viewport={{
              once: true
            }} data-unique-id="0c289d5e-36c7-4e64-b4c9-4500d6585e45" data-file-name="app/page.tsx">
                <School className="h-12 w-12 mb-4 text-primary" />
                <h3 className="font-semibold text-lg mb-2" data-unique-id="2cde1cfd-7b87-46f0-ab64-f9cd0f328afb" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="51e1d276-cabf-4811-97a1-0b7ba3f55674" data-file-name="app/page.tsx">Untuk Semua Jenjang</span></h3>
                <p className="text-gray-600" data-unique-id="c8694aab-8b09-489f-92a2-0e54eaaa30cb" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="8359ee2c-fb57-47d8-ab3d-f901b01b5506" data-file-name="app/page.tsx">SD, SMP, SMA, dan Perguruan Tinggi</span></p>
              </motion.div>
            </div>
            
            <div className="flex justify-center" data-unique-id="90103e17-4484-4f5f-85d6-cbbd42a19420" data-file-name="app/page.tsx">
              <Link href="/register" className="btn-primary text-lg group flex items-center gap-2 hover:bg-orange-500" data-unique-id="5e62da04-396b-4058-b73d-757edb5c215d" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="0f64effc-165e-4554-841c-421b8beaa6ff" data-file-name="app/page.tsx">
                DAFTAR SEKARANG
                </span><ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* Guarantees Section */}
        <section className="py-8 bg-white" data-unique-id="d68be074-4cd0-4488-a598-7ce1cb8dcb25" data-file-name="app/page.tsx">
          <div className="container-custom" data-unique-id="b812982c-4986-49a7-b317-a503ea32e636" data-file-name="app/page.tsx">
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6" data-unique-id="3054275f-2eaf-4ae9-9ffe-f90f4e8c3d8a" data-file-name="app/page.tsx">
              <motion.div className="card bg-[#4ECDC4] flex items-center justify-center p-5 text-white shadow-lg" initial={{
              opacity: 0,
              scale: 0.9
            }} whileInView={{
              opacity: 1,
              scale: 1
            }} transition={{
              duration: 0.5
            }} viewport={{
              once: true
            }} data-unique-id="e5fff739-24e8-4053-bcba-378d2e4b4f6e" data-file-name="app/page.tsx">
                <div className="flex flex-col items-center text-center" data-unique-id="37764e37-0831-4a18-9009-2c5c137b366b" data-file-name="app/page.tsx">
                  <div className="bg-white/20 p-4 rounded-full mb-4 shadow-inner" data-unique-id="f4095a32-8ccf-4e2b-b2bb-284f0d29c59f" data-file-name="app/page.tsx">
                    <Check className="h-14 w-14 text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-1" data-unique-id="9c42eda8-d1ac-44d5-ac9b-80e4faa08b46" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="9bc6f88c-fd5f-4d4b-8608-469b24d40a48" data-file-name="app/page.tsx">Gratis 6 Bulan</span></h3>
                  <p className="text-white/85" data-unique-id="d874ec97-06f6-4a2a-a29f-485d1a9eb407" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="4cd07064-2d30-4b32-a696-13a9e0a78585" data-file-name="app/page.tsx">Akses penuh ke semua fitur</span></p>
                </div>
              </motion.div>
              
              <motion.div className="card bg-[#FF6B6B] flex items-center justify-center p-5 text-white shadow-lg" initial={{
              opacity: 0,
              scale: 0.9
            }} whileInView={{
              opacity: 1,
              scale: 1
            }} transition={{
              duration: 0.5,
              delay: 0.2
            }} viewport={{
              once: true
            }} data-unique-id="3dae5eff-82ab-4da4-bc0e-f3d36e5efbf2" data-file-name="app/page.tsx">
                <div className="flex flex-col items-center text-center" data-unique-id="ba7145d0-fb42-47ae-94da-47c6b66f6619" data-file-name="app/page.tsx">
                  <div className="bg-white/20 p-4 rounded-full mb-4 shadow-inner" data-unique-id="452ae0a3-f3cd-4198-8f26-dd1bd3ad6fc2" data-file-name="app/page.tsx">
                    <Phone className="h-14 w-14 text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-1" data-unique-id="8dab6ab8-c06f-4bf8-9e6c-8aa9a2488b2d" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="4533d435-c482-487d-a537-72e066c37c02" data-file-name="app/page.tsx">Dukungan Teknis</span></h3>
                  <p className="text-white/85" data-unique-id="b0161056-63bf-45b1-b570-6d9540aabecf" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="4bac5585-b743-41b5-846e-e0e8dad781de" data-file-name="app/page.tsx">Bantuan teknis untuk semua pengguna</span></p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-10 bg-slate-100" data-unique-id="a21ff907-7647-4b61-8955-1bcf252caf80" data-file-name="app/page.tsx">
          <div className="container-custom" data-unique-id="b378f041-d4ad-42d4-912d-c7c0eb2285d7" data-file-name="app/page.tsx">
            <h2 className="section-title text-center mb-12" data-unique-id="de240413-e877-4576-bcc7-ee5963f57b07" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="83b6b443-d4c0-44d7-8af1-c16e16ca7178" data-file-name="app/page.tsx">Fitur Unggulan Aplikasi</span></h2>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5" data-unique-id="117b80ea-d6a6-45ad-a22f-09445ba49b1c" data-file-name="app/page.tsx">
              <motion.div className="card bg-pink-400/90" initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5
            }} viewport={{
              once: true
            }} data-unique-id="2efc9273-406d-4073-b771-9fc6fc9be3f6" data-file-name="app/page.tsx">
                <QrCode className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold text-xl mb-3" data-unique-id="8be7cac9-b400-4fc1-b139-5afa3cd2cea5" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="5533aabc-1343-4dc2-96c7-1b13f50c7653" data-file-name="app/page.tsx">Absensi QR Code</span></h3>
                <p className="text-gray-600" data-unique-id="fb1169c1-8253-4a33-8a99-8da4eec4577d" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="7fe1d086-19ef-4d69-8792-7b607b289141" data-file-name="app/page.tsx">Scan cepat kartu QR Code siswa untuk absensi</span></p>
              </motion.div>
              
              <motion.div className="card bg-teal-400/90" initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0.1
            }} viewport={{
              once: true
            }} data-unique-id="87c7c280-2c81-446c-944e-834cb95b7728" data-file-name="app/page.tsx">
                <Bell className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold text-xl mb-3" data-unique-id="275ce288-29c0-4ece-8e95-4bee2c0fef39" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="96aef6ad-e51c-4c6c-be56-3f62cbd39e0d" data-file-name="app/page.tsx">Notifikasi Real-time</span></h3>
                <p className="text-gray-600" data-unique-id="f89852b5-5c89-44b4-91f9-d82ca295db99" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="945e730f-1049-4678-81cf-d7741493ae46" data-file-name="app/page.tsx">Kirim info kehadiran langsung ke Telegram orang tua</span></p>
              </motion.div>
              
              <motion.div className="card bg-blue-400/90" initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0.2
            }} viewport={{
              once: true
            }} data-unique-id="1b024d99-9019-4c61-8766-7f1ca7834bfc" data-file-name="app/page.tsx">
                <Users className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold text-xl mb-3" data-unique-id="94834cc0-4229-4f29-84f1-58df085e82eb" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="1e1431e4-db78-4469-8e0c-d76bbac4f3a0" data-file-name="app/page.tsx">Kelola Data Siswa</span></h3>
                <p className="text-gray-600" data-unique-id="4059f4af-2091-4b55-8b6b-a17b0eddde23" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="3199092c-ebcc-4bfd-921c-55c06c2f9af4" data-file-name="app/page.tsx">Simpan & kelola informasi siswa dengan lengkap</span></p>
              </motion.div>
              
              <motion.div className="card bg-orange-400/90" initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0.3
            }} viewport={{
              once: true
            }} data-unique-id="348fb5d2-69bc-4c42-8c99-d192cad95128" data-file-name="app/page.tsx">
                <BarChart3 className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold text-xl mb-3" data-unique-id="4cfd77a0-b9ac-4b6c-87bb-aa5ddecdc91d" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="ceccd354-2f4d-4d3f-af22-ec144a5f04a2" data-file-name="app/page.tsx">Visualisasi Data</span></h3>
                <p className="text-gray-600" data-unique-id="e61b80e5-1f4a-4547-b782-21b141ef48d1" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="e398105e-3694-4dcb-b579-e403abef9951" data-file-name="app/page.tsx">Lihat grafik kehadiran per bulan dengan jelas</span></p>
              </motion.div>
              
              <motion.div className="card bg-violet-400/90" initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0.4
            }} viewport={{
              once: true
            }} data-unique-id="462b0106-9b91-45fe-b137-0e1529ba0598" data-file-name="app/page.tsx">
                <Download className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold text-xl mb-3" data-unique-id="fe8cd185-c6d6-4561-a91d-51dc6dd504a8" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="4e61a9f1-08e7-4ba9-900f-c591010eb59d" data-file-name="app/page.tsx">Ekspor Laporan</span></h3>
                <p className="text-gray-600" data-unique-id="257d7d40-e8db-4558-81da-b3c58e209d56" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="95938f75-53eb-43da-8f36-935206b60ca3" data-file-name="app/page.tsx">Download laporan dalam format PDF dan Excel</span></p>
              </motion.div>
              
              <motion.div className="card bg-emerald-400/90" initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0.5
            }} viewport={{
              once: true
            }} data-unique-id="3d97486d-7ec8-4d6e-a85b-45f1a99af4c8" data-file-name="app/page.tsx">
                <Shield className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold text-xl mb-3" data-unique-id="b79cf23f-3e9d-440d-89fb-eab1c4c4cea7" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="5f278bb6-7cda-429f-8c07-ad2194a018c3" data-file-name="app/page.tsx">Aman dan Terpercaya</span></h3>
                <p className="text-gray-600" data-unique-id="38f74158-ef06-43a9-a0b9-3a11e3738744" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="ad312eb9-d9b9-4593-9ad0-55e39c26d975" data-file-name="app/page.tsx">Keamanan data siswa terjamin sepenuhnya</span></p>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-10 bg-white" data-unique-id="e9e00b2a-d66c-49ba-93cf-3ce18549b3cd" data-file-name="app/page.tsx">
          <div className="container-custom" data-unique-id="10752366-7d43-4973-8838-3240a9a51442" data-file-name="app/page.tsx">
            <h2 className="section-title text-center mb-10" data-unique-id="38684bae-8487-4d4b-b301-7d632a6a976b" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="cbd6f114-cfba-4912-9d93-ad755db2bc81" data-file-name="app/page.tsx">Testimoni Pengguna Aplikasi</span></h2>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-5" data-unique-id="ed2ea3ea-cf9a-46f7-a608-7ed2c4b87ad0" data-file-name="app/page.tsx">
              <motion.div className="card bg-cyan-400/90" initial={{
              opacity: 0
            }} whileInView={{
              opacity: 1
            }} transition={{
              duration: 0.5
            }} viewport={{
              once: true
            }} data-unique-id="04726078-baf1-4f0f-8a76-dc877afc3826" data-file-name="app/page.tsx">
                <h3 className="font-bold text-primary text-lg mb-3" data-unique-id="7a18916a-2dae-481c-bfa9-bf7d85844b58" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="3d468253-0dd0-404d-88c7-4eeb4af07d57" data-file-name="app/page.tsx">Dwi Yanto, S.Pd</span></h3>
                <p className="text-gray-600 text-base mb-2" data-unique-id="5fa80a98-b508-4985-8aca-4b9a4f753fca" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="1b91aae5-e7c2-46b1-8333-a9ec0578932b" data-file-name="app/page.tsx">Kepala SMPN 1 Padang Ratu :</span></p>
                <p className="text-gray-700" data-unique-id="819112d6-9eb1-47e5-a459-2ecca823adf2" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="5f708848-afaf-408d-9138-24273485c576" data-file-name="app/page.tsx">
                  "Absensi QR-CODE mempermudah pemantauan kehadiran siswa di sekolah. 
                  Dan mengirim info ke Orang Tua."
                </span></p>
              </motion.div>
              
              <motion.div className="card bg-amber-400/90" initial={{
              opacity: 0
            }} whileInView={{
              opacity: 1
            }} transition={{
              duration: 0.5,
              delay: 0.2
            }} viewport={{
              once: true
            }} data-unique-id="3f450bb7-97a0-4ba6-b253-66e190b190dd" data-file-name="app/page.tsx">
                <h3 className="font-bold text-primary text-lg mb-3" data-unique-id="ee93d0f9-2bfb-45fe-a227-64d519ff1b99" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="6a89a998-644f-470a-b6b0-deef830a1846" data-file-name="app/page.tsx">Siti Malihah</span></h3>
                <p className="text-gray-600 text-base mb-2" data-unique-id="096c8b58-e012-4df1-a541-a82d4ea6d4e3" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="ce66bf53-a9b3-4c56-80f8-ba18ac0c6094" data-file-name="app/page.tsx">Orang Tua Siswa :</span></p>
                <p className="text-gray-700" data-unique-id="72839048-7a19-47c0-8fa3-2306b8429992" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="b1e8837f-852c-4aa9-9d73-9c997a1cd09f" data-file-name="app/page.tsx">
                  "Saya selalu tahu kapan anak saya tiba di sekolah berkat notifikasi Telegram. 
                  Aplikasi yang sangat membantu!"
                </span></p>
              </motion.div>
              
              <motion.div className="card bg-lime-400/90" initial={{
              opacity: 0
            }} whileInView={{
              opacity: 1
            }} transition={{
              duration: 0.5,
              delay: 0.4
            }} viewport={{
              once: true
            }} data-unique-id="5c1841e7-241b-4dcb-bf2f-0214daad82ed" data-file-name="app/page.tsx">
                <h3 className="font-bold text-primary text-lg mb-3" data-unique-id="0187a5e2-cf5d-42ed-a763-83b7ea092e90" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="d694c967-0986-45a1-ba23-0d188ea99d8e" data-file-name="app/page.tsx">Abdul Malik</span></h3>
                <p className="text-gray-600 text-base mb-2" data-unique-id="7f13dd8e-1fef-45dc-abd1-9379d4f2058b" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="4e37121c-d094-4379-a972-e181ad5f3731" data-file-name="app/page.tsx">Administrator Sekolah :</span></p>
                <p className="text-gray-700" data-unique-id="06295903-0d5d-45bf-9286-674b7892b9f6" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="af7e0d40-74c5-4ac1-9625-c02199f1a549" data-file-name="app/page.tsx">
                  "Pembuatan laporan kehadiran jadi lebih efisien. Hemat waktu dan 
                  lebih akurat dibanding sistem manual."
                </span></p>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* App Showcase Section */}
        <section className="py-10 bg-[#051243] text-white" data-unique-id="dc32af87-be07-40be-977f-be6c98dafb3a" data-file-name="app/page.tsx">
          <div className="container-custom" data-unique-id="7c51d5e4-1e1c-4380-89e4-85560341c362" data-file-name="app/page.tsx">
            <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-center lg:gap-10" data-unique-id="f44e5fca-1901-4bdc-a597-198e10652435" data-file-name="app/page.tsx">
              <div className="lg:w-1/2" data-unique-id="b47cf1b7-3e0c-43d5-a4d0-b1511256143f" data-file-name="app/page.tsx">
                <h2 className="section-title mb-6" data-unique-id="617d4d38-0675-47ca-aca0-0e19147c191c" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="725effa6-b87b-49a5-a05f-f85303287805" data-file-name="app/page.tsx">Aplikasi Pilihan Sekolah Modern</span></h2>
                <p className="text-white mb-6" data-unique-id="af9ea0fe-98ac-4dcd-9784-5c1f4ca329bb" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="0ba7f6a0-2b66-4139-896f-6681e966a0b9" data-file-name="app/page.tsx">
                  ABSENSI QR-CODE adalah solusi modern untuk sistem absensi sekolah yang 
                  menggabungkan teknologi QR Code dengan notifikasi real-time untuk 
                  memberikan pengalaman terbaik bagi sekolah dan orang tua.
                </span></p>
              </div>
              
              <div className="lg:w-1/2" data-unique-id="4537ce27-859c-4d4b-b1a1-5450a44c0e14" data-file-name="app/page.tsx">
                <div className="relative" data-unique-id="e5f75d75-41f7-4a70-9bc3-c9e446c3ca49" data-file-name="app/page.tsx" data-dynamic-text="true">
                  {/* Laptop Frame */}
                  <div className="bg-gray-300 rounded-t-lg h-[20px] w-full max-w-[500px] mx-auto" data-unique-id="f19a4e13-55c0-48a5-904a-ba8e4d64f2de" data-file-name="app/page.tsx"></div>
                  <div className="bg-gray-300 h-[300px] w-full max-w-[500px] pt-0 pb-4 px-2 rounded-b-lg flex items-center justify-center mx-auto" data-unique-id="e5d82050-8c17-4973-83aa-c31ad24bc713" data-file-name="app/page.tsx">
                    <div className="bg-white h-full w-full rounded" data-unique-id="a0f0660c-f792-478f-b0bf-8d14e99a2680" data-file-name="app/page.tsx" data-dynamic-text="true">
                      {/* Dashboard Preview */}
                      <div className="w-full h-[40px] bg-primary flex items-center px-4" data-unique-id="6f6f0f4b-9f78-4cfa-b078-f57aef3876f2" data-file-name="app/page.tsx">
                        <div className="text-white font-medium" data-unique-id="a44a039b-70bc-40fd-b13f-e2972272e39b" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="087a77db-6ac2-4140-8940-ef815e2a2f57" data-file-name="app/page.tsx">Dashboard Absensi</span></div>
                      </div>
                      <div className="p-4" data-unique-id="9adb9f96-15d7-479a-bc50-3a47f50d809a" data-file-name="app/page.tsx">
                        <div className="mb-4" data-unique-id="f2716369-42c8-4573-b9da-16dbf04c4554" data-file-name="app/page.tsx">
                          <div className="text-sm font-medium text-gray-500 mb-1" data-unique-id="98d3d28a-c11f-4861-949e-d4d7d15694b6" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="cbc08c5c-3b54-4b9c-81db-02b833e52c2d" data-file-name="app/page.tsx">Kehadiran Mingguan</span></div>
                          <div className="h-[120px] bg-blue-50 rounded-lg relative overflow-hidden" data-unique-id="cb1b7227-9291-4726-955f-8f9a094caa51" data-file-name="app/page.tsx" data-dynamic-text="true">
                            {/* Simulated Bar Chart */}
                            <div className="absolute bottom-0 left-[10%] w-[10%] h-[70%] bg-primary rounded-t-sm" data-unique-id="fc8ee166-9a0f-4362-8f31-cf4133162ac6" data-file-name="app/page.tsx"></div>
                            <div className="absolute bottom-0 left-[25%] w-[10%] h-[85%] bg-primary rounded-t-sm" data-unique-id="5bc8acb6-5f04-4df4-8592-4597818752b1" data-file-name="app/page.tsx"></div>
                            <div className="absolute bottom-0 left-[40%] w-[10%] h-[65%] bg-primary rounded-t-sm" data-unique-id="c7806ff0-71ad-480f-b276-0d554e3cd7ad" data-file-name="app/page.tsx"></div>
                            <div className="absolute bottom-0 left-[55%] w-[10%] h-[90%] bg-primary rounded-t-sm" data-unique-id="28d54a87-8c24-4195-beec-5bb627413b21" data-file-name="app/page.tsx"></div>
                            <div className="absolute bottom-0 left-[70%] w-[10%] h-[80%] bg-primary rounded-t-sm" data-unique-id="8de8c433-34f3-4399-868f-1727124305a0" data-file-name="app/page.tsx"></div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3" data-unique-id="263a6cc8-e27f-41f8-891c-8240c8bf1be9" data-file-name="app/page.tsx">
                          <div className="bg-blue-50 p-3 rounded-lg" data-unique-id="364b34ae-ae02-4f2a-86f2-dec0aadb33a3" data-file-name="app/page.tsx">
                            <div className="text-xs text-gray-500" data-unique-id="94c66eae-c355-46e2-9b86-89a74ff7b180" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="db1dccd2-f7f6-46ba-8d7f-15cf5ca54ec2" data-file-name="app/page.tsx">Hadir</span></div>
                            <div className="font-bold text-primary text-lg" data-unique-id="09a2dab9-eb3c-4b7b-bc6f-47b5e9a4aa3a" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="83d8447c-9a05-4849-b960-afa407ddd6c3" data-file-name="app/page.tsx">94%</span></div>
                          </div>
                          <div className="bg-orange-50 p-3 rounded-lg" data-unique-id="ad8e7942-d89f-4e05-bea4-18fdfba58c8b" data-file-name="app/page.tsx">
                            <div className="text-xs text-gray-500" data-unique-id="b4e603b1-e601-4818-ab82-94b6b8570526" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="baa396c3-f5ce-44c0-99e6-c8c73f1854e9" data-file-name="app/page.tsx">Izin</span></div>
                            <div className="font-bold text-secondary text-lg" data-unique-id="0a4db2d5-cce8-4ce7-af8e-5dde028d3f83" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="319e2c31-cdbe-44d7-9603-f70e9ee10dbc" data-file-name="app/page.tsx">4%</span></div>
                          </div>
                          <div className="bg-red-50 p-3 rounded-lg" data-unique-id="4f824611-75a9-4803-acb5-68eaeda0046c" data-file-name="app/page.tsx">
                            <div className="text-xs text-gray-500" data-unique-id="3fcd7ccb-4965-442a-89e7-f8dbe7476899" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="27d12671-eb95-4f28-b974-24327630e09b" data-file-name="app/page.tsx">Absen</span></div>
                            <div className="font-bold text-red-500 text-lg" data-unique-id="674a1b34-3fbc-4ad2-9799-bb22fd28778f" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="53fd14ee-7bd1-499e-aeb9-2e6a8dd5e14e" data-file-name="app/page.tsx">2%</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Call To Action Section */}
        <section className="py-10 bg-slate-50" data-unique-id="3936199b-0dff-4131-a1d5-3e4b1fe6ce23" data-file-name="app/page.tsx">
          <div className="container-custom text-center" data-unique-id="0941d87e-7694-4c21-a9db-46d4dacaec27" data-file-name="app/page.tsx">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" data-unique-id="373f3e28-9c94-47e0-855b-c63a5ae2f7be" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="70166b4c-3943-4ba3-b37f-f74af58a0a31" data-file-name="app/page.tsx">Siap Meningkatkan Sistem Absensi?</span></h2>
            <p className="max-w-2xl mx-auto mb-8 text-gray-700" data-unique-id="17a7d9f0-7b1a-4af3-84e7-1e9cdf4fde97" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="e3e96037-a462-417d-b321-042eaa2ad7e4" data-file-name="app/page.tsx">
              Daftar sekarang juga dan rasakan kemudahan sistem Absensi Digital dengan QR-CODE.
            </span></p>
            <Link href="/register" className="btn-primary text-base px-6 py-2 flex items-center justify-center gap-1.5 group mx-auto hover:bg-secondary transition-colors w-auto" data-unique-id="8b09acb8-944c-42bd-bf1e-eda2c9b2e03f" data-file-name="app/page.tsx">
              <span className="inline-block" data-unique-id="d9a72577-2a44-4949-9797-6a69af203e52" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="168aff5c-2b23-4d80-ad67-ff9941020cf7" data-file-name="app/page.tsx">Mulai Sekarang</span></span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="bg-primary text-white py-12" data-unique-id="9bfa9464-f8cb-48ec-99e2-53b148cf480c" data-file-name="app/page.tsx">
          <div className="container-custom" data-unique-id="a429ddf6-b4bb-47f4-ad1d-8e4cc52fb3bd" data-file-name="app/page.tsx">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6" data-unique-id="b0ed2b54-2dd9-41a4-8c1d-4ce518657b7a" data-file-name="app/page.tsx">
              <div data-unique-id="281e3953-52b5-48da-9c08-fe1c9ed5fe84" data-file-name="app/page.tsx">
                <h3 className="font-bold text-base mb-3" data-unique-id="a0204848-1e13-4fd4-9490-8034ce0f469f" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="f9a282ab-bbb0-438b-ba50-d52df73497a8" data-file-name="app/page.tsx">ABSENSI SISWA</span></h3>
                <p className="max-w-md mb-4 text-gray-200 text-sm" data-unique-id="71fe79cb-a071-4a53-b237-9186d6724aea" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="930c345c-631a-4f8f-9f1a-c47b0cedceba" data-file-name="app/page.tsx">
                  Solusi Absensi Digital untuk Instansi Pendidikan yang Bermutu.
                </span></p>
                <div className="flex space-x-3" data-unique-id="8588d6c5-9536-4a42-a02c-69fce4f1de04" data-file-name="app/page.tsx">
                  <a href="#" className="hover:text-secondary transition-colors" data-unique-id="770bd7eb-37bf-4752-a36e-f2822df6ece3" data-file-name="app/page.tsx">
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a href="#" className="hover:text-secondary transition-colors" data-unique-id="ddc965cb-e4e9-470c-8f2d-bcfef71af886" data-file-name="app/page.tsx">
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a href="#" className="hover:text-secondary transition-colors" data-unique-id="b097c4b5-8f1c-4a7b-87d2-d0c5a7b6e1bf" data-file-name="app/page.tsx">
                    <Twitter className="h-5 w-5" />
                  </a>
                </div>
              </div>
              
              <div data-unique-id="722dc74a-beb2-499f-a832-f5cc66aed320" data-file-name="app/page.tsx">
                <h3 className="font-bold text-base mb-3" data-unique-id="b72a0522-d5c8-438f-8232-120fcbc65cf5" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="07ab0679-c592-4354-b66f-63c33de0cfb5" data-file-name="app/page.tsx">Kontak Kami</span></h3>
                <div className="flex items-center mb-2" data-unique-id="1ae936cb-f800-4ee3-8440-0ac1d608f034" data-file-name="app/page.tsx">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="text-sm" data-unique-id="aac9094b-5346-4918-a8d1-23a677c1cac8" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="b4677f76-d8e7-4ffc-913e-51e715777064" data-file-name="app/page.tsx">lehan.virtual@gmail.com</span></span>
                </div>
                <div className="flex items-center" data-unique-id="396ec028-466f-43b0-83c3-17b2de4cf278" data-file-name="app/page.tsx">
                  <Phone className="h-4 w-4 mr-2" />
                  <span className="text-sm" data-unique-id="5cbd13be-2663-4604-b556-0b62254d2c17" data-file-name="app/page.tsx"><span className="editable-text" data-unique-id="9615345a-845a-4b59-a16d-87ae228a18c3" data-file-name="app/page.tsx">+62 812 7240 5881</span></span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-700 mt-6 pt-4 text-center text-gray-300" data-unique-id="91a56c0a-62e1-4a3f-92c5-46ace387b598" data-file-name="app/page.tsx">
              <p className="text-xs" data-unique-id="f4923909-0313-4270-9a55-c56d4c3f1bee" data-file-name="app/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="7bd70dcc-0ebc-4cf1-9f2b-b4b27a136b18" data-file-name="app/page.tsx">&copy; </span>{new Date().getFullYear()}<span className="editable-text" data-unique-id="a3c3e91f-c0c1-4436-bb22-2b0a325cc537" data-file-name="app/page.tsx"> ALFANAHEL STUDIO'S.</span></p>
            </div>
          </div>
        </footer>
      </div>
      
      {/* Back to Top Button */}
      {isVisible && <button onClick={scrollToTop} className="fixed bottom-20 right-8 bg-red-500 text-white p-2.5 rounded-full shadow-lg hover:bg-orange-600 transition-all z-50" data-unique-id="1504df20-0e6e-4116-8464-2af3d0344408" data-file-name="app/page.tsx">
          <ChevronUp className="h-5 w-5" />
        </button>}
    </main>;
}