"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { School, Save, CheckCircle, Loader2, QrCode, MapPin, Phone, Mail, Globe } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
export default function SetupSchool() {
  const {
    user,
    schoolId
  } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schoolData, setSchoolData] = useState({
    name: "",
    npsn: "",
    address: "",
    principalName: "",
    principalNip: "",
    email: "",
    phone: "",
    website: ""
  });

  // State for notification popup
  const [showNotification, setShowNotification] = useState(true);
  useEffect(() => {
    // Check if user already has a school
    if (schoolId) {
      router.push('/dashboard');
    } else {
      setLoading(false);

      // Always show notification for new users
      setShowNotification(true);

      // Check if this is a first-time login
      if (typeof window !== 'undefined') {
        const isFirstLogin = localStorage.getItem('isFirstLogin') !== 'false';
        if (isFirstLogin) {
          localStorage.setItem('isFirstLogin', 'false');
        }
      }
    }
  }, [schoolId, router]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    setSchoolData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Silakan login terlebih dahulu");
      return;
    }
    try {
      setSaving(true);
      const {
        schoolApi
      } = await import('@/lib/api');
      const {
        userApi
      } = await import('@/lib/api');

      // Create new school with user's ID as the school ID
      const schoolId = user.uid;
      await schoolApi.create({
        ...schoolData,
        createdAt: new Date(),
        createdBy: user.uid
      }, schoolId);

      // Update user record with schoolId
      await userApi.update(user.uid, {
        schoolId
      });
      toast.success("Sekolah berhasil didaftarkan");
      router.push('/dashboard');
    } catch (error) {
      console.error("Error saving school data:", error);
      toast.error("Gagal menyimpan data sekolah");
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return <div className="flex justify-center items-center h-screen" data-unique-id="ba399b3f-232c-433c-a6e1-9ac13b9d19ed" data-file-name="app/dashboard/setup-school/page.tsx">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>;
  }
  return <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 md:px-6 pb-24 md:pb-6" data-unique-id="ecb3ac51-60fa-4561-b794-ed1463a736b4" data-file-name="app/dashboard/setup-school/page.tsx" data-dynamic-text="true">
      {/* Notification Popup */}
      {showNotification && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-unique-id="07299af5-aec5-40b3-b371-a1f082151985" data-file-name="app/dashboard/setup-school/page.tsx">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" data-unique-id="5553dd29-dcac-4cb3-b434-dc5db6d2714a" data-file-name="app/dashboard/setup-school/page.tsx">
            <h2 className="text-xl font-bold text-center mb-4" data-unique-id="19215fcc-d213-4db6-a51f-c02c3fb32211" data-file-name="app/dashboard/setup-school/page.tsx"><span className="editable-text" data-unique-id="174d8c07-36a0-4e46-a60a-54d016857712" data-file-name="app/dashboard/setup-school/page.tsx">PEMBERITAHUAN</span></h2>
            <hr className="border-gray-200 my-4" data-unique-id="9d10d894-2819-4c55-8b52-55a791102311" data-file-name="app/dashboard/setup-school/page.tsx" />
            
            <p className="text-gray-700 mb-4" data-unique-id="cc7a13a8-1a10-48a6-8eb0-71ce99d8384f" data-file-name="app/dashboard/setup-school/page.tsx"><span className="editable-text" data-unique-id="d6142d5f-6226-4875-8f57-61ff73cc7bc4" data-file-name="app/dashboard/setup-school/page.tsx">
              Bagi Pengguna yang baru pertama kali membuat akun dan Login ke Sistem Absensi QR Code, tidak akan bisa mengisi Data Sekolah. Silahkan lakukan Konfirmasi kepada SuperAdmin dengan cara mengirim pesan melalui chat Whatsapp dengan format :
            </span></p>

            <p className="text-gray-700 mb-4" data-unique-id="8bd24961-2461-4434-a4db-5dc926314871" data-file-name="app/dashboard/setup-school/page.tsx"><span className="editable-text" data-unique-id="1acd138c-786e-4adf-b322-9132f131d16b" data-file-name="app/dashboard/setup-school/page.tsx">
              Saya Pengguna baru </span><br data-unique-id="6993bed3-e7d2-4582-ae68-e0421a5f9a2f" data-file-name="app/dashboard/setup-school/page.tsx" /><span className="editable-text" data-unique-id="f80f6c01-ba23-43ce-9cff-3044a818fb10" data-file-name="app/dashboard/setup-school/page.tsx">
              Nama Sekolah : ...... </span><br data-unique-id="6392a170-8976-42f2-8c5b-49c1bf213cf3" data-file-name="app/dashboard/setup-school/page.tsx" /><span className="editable-text" data-unique-id="9189334b-9849-4942-a143-ae1af5135748" data-file-name="app/dashboard/setup-school/page.tsx">
              E-Mail Sekolah : ...... </span><br data-unique-id="3a5f1046-d419-4532-b469-10645a47e17a" data-file-name="app/dashboard/setup-school/page.tsx" />
              <br data-unique-id="a586e2c3-02b3-4c29-b81a-3c82fbd3ba99" data-file-name="app/dashboard/setup-school/page.tsx" /><span className="editable-text" data-unique-id="40373f7b-e19c-41cc-8375-4ff9f5dfa735" data-file-name="app/dashboard/setup-school/page.tsx">
              Mohon untuk di Approve Akun kami agar dapat mengisi data Sekolah.
            </span></p>

            <p className="text-gray-700 mb-6" data-unique-id="6b377647-ef88-4747-b362-a12e11dab75b" data-file-name="app/dashboard/setup-school/page.tsx"><span className="editable-text" data-unique-id="ce6301d0-186c-4672-b347-348199303911" data-file-name="app/dashboard/setup-school/page.tsx">
              Kirim Pesan Whatsapp ke: </span><br data-unique-id="3b85d74a-5ef1-4dfc-90d5-27ea6ce700f4" data-file-name="app/dashboard/setup-school/page.tsx" />
              <span className="text-lg font-bold" data-unique-id="19e426a6-72b5-4a7c-be6c-e20834144902" data-file-name="app/dashboard/setup-school/page.tsx"><span className="editable-text" data-unique-id="9400d0c0-8eb4-4842-85a3-0a8d84bc8e42" data-file-name="app/dashboard/setup-school/page.tsx">0812 7240 5881</span></span>
            </p>
            <button onClick={() => {
          setShowNotification(false);
          router.push('/login');
        }} className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90" data-unique-id="01179487-7e34-4cd6-963d-5857b9c7cad3" data-file-name="app/dashboard/setup-school/page.tsx"><span className="editable-text" data-unique-id="044a3402-1528-497d-9174-54d02cb7a23b" data-file-name="app/dashboard/setup-school/page.tsx">
              Saya Mengerti
            </span></button>
          </div>
        </div>}
      <div className="flex items-center justify-center mb-6" data-unique-id="0874fe90-ce85-493e-8b17-4146f06c9824" data-file-name="app/dashboard/setup-school/page.tsx">
        <School className="h-8 w-8 text-primary mr-3" />
        <h1 className="text-2xl font-bold text-gray-800" data-unique-id="dbd5d54c-fadc-47f9-98d0-603bd3122e4e" data-file-name="app/dashboard/setup-school/page.tsx"><span className="editable-text" data-unique-id="ed82ee67-7147-4fdf-8171-317c4ef3e626" data-file-name="app/dashboard/setup-school/page.tsx">Selamat Datang di Absen Digital</span></h1>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-4 mb-6 text-center shadow-sm" data-unique-id="f8bb7b97-0eb2-407b-a12a-a2dc8a846d56" data-file-name="app/dashboard/setup-school/page.tsx">
        <p className="text-blue-700" data-unique-id="d1422f29-ef13-4a4e-b749-633e47fc50a1" data-file-name="app/dashboard/setup-school/page.tsx"><span className="editable-text" data-unique-id="632a1034-c0d8-47f1-b36f-f3e25b096eae" data-file-name="app/dashboard/setup-school/page.tsx">Silahkan lengkapi data sekolah Anda untuk mulai menggunakan aplikasi.</span></p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100" data-unique-id="269dbd75-cd5d-48d9-ab8e-d1463a192fa0" data-file-name="app/dashboard/setup-school/page.tsx">
        <form onSubmit={handleSubmit} data-unique-id="7c187782-0b9b-4baf-932b-78c379accef5" data-file-name="app/dashboard/setup-school/page.tsx">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6" data-unique-id="e8689dd5-7486-4d5d-a2b7-e09b54c27ece" data-file-name="app/dashboard/setup-school/page.tsx">
            <div className="md:col-span-2" data-unique-id="4abaf805-0b95-4a9b-b719-d0869769862b" data-file-name="app/dashboard/setup-school/page.tsx">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="ede8df9e-ee3c-4059-b20d-a0f896e11494" data-file-name="app/dashboard/setup-school/page.tsx"><span className="editable-text" data-unique-id="1e77719e-727d-4171-b02d-74e8bbe6a5c6" data-file-name="app/dashboard/setup-school/page.tsx">
                Nama Sekolah </span><span className="text-red-500" data-unique-id="0b55b081-70ec-4f04-949d-601bd9ba138f" data-file-name="app/dashboard/setup-school/page.tsx"><span className="editable-text" data-unique-id="20cb90da-0708-48ef-9f88-5b167846dadb" data-file-name="app/dashboard/setup-school/page.tsx">*</span></span>
              </label>
              <input type="text" id="name" name="name" value={schoolData.name} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white shadow-sm text-base" placeholder="Masukkan nama sekolah" required data-unique-id="a4eb58dc-ec00-464a-b9f1-7b7d39a09d11" data-file-name="app/dashboard/setup-school/page.tsx" />
            </div>

            <div className="mb-1" data-unique-id="a2fe623d-3f3c-45ef-bd32-387a0befe025" data-file-name="app/dashboard/setup-school/page.tsx">
              <label htmlFor="npsn" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="364c75dc-b305-46a9-bd56-d2a4ede57789" data-file-name="app/dashboard/setup-school/page.tsx"><span className="editable-text" data-unique-id="a9e619e2-279c-4928-98b1-f91a04cc71f1" data-file-name="app/dashboard/setup-school/page.tsx">
                NPSN (Nomor Pokok Sekolah Nasional) </span><span className="text-red-500" data-unique-id="224a2b74-b059-4f78-aea3-3c2682e45e61" data-file-name="app/dashboard/setup-school/page.tsx"><span className="editable-text" data-unique-id="63b653ba-c405-4296-ba1c-b3aefde25a90" data-file-name="app/dashboard/setup-school/page.tsx">*</span></span>
              </label>
              <input type="text" id="npsn" name="npsn" value={schoolData.npsn} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white shadow-sm text-base" placeholder="Masukkan NPSN" required data-unique-id="9e0b9b5c-6f9a-4713-8eab-06b0700276ca" data-file-name="app/dashboard/setup-school/page.tsx" />
            </div>
            
            <div className="mb-1" data-unique-id="7a7d9ba8-6831-45be-84ff-8e4e14012819" data-file-name="app/dashboard/setup-school/page.tsx">
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="9c6b3ece-1cb5-4a6e-9b9d-4ace9a318a1f" data-file-name="app/dashboard/setup-school/page.tsx"><span className="editable-text" data-unique-id="cfc33d0f-e222-4d95-a043-94915fee5982" data-file-name="app/dashboard/setup-school/page.tsx">
                Website Sekolah (jika ada)
              </span></label>
              <div className="relative" data-unique-id="b64c0738-f93b-45a8-8066-df57411a8895" data-file-name="app/dashboard/setup-school/page.tsx">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" id="website" name="website" value={schoolData.website} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white shadow-sm text-base" placeholder="https://www.sekolah.sch.id" data-unique-id="a4428503-d82c-4a32-a869-c6dfe1eaea91" data-file-name="app/dashboard/setup-school/page.tsx" />
              </div>
            </div>

            <div className="md:col-span-2 mb-1" data-unique-id="ce32d2ab-5518-4c42-b99d-f557b84a3363" data-file-name="app/dashboard/setup-school/page.tsx">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="a78e3083-a2a1-4bd2-8a05-c3b48e6cccd8" data-file-name="app/dashboard/setup-school/page.tsx"><span className="editable-text" data-unique-id="8cfa19bb-868f-448a-8c2b-fbe640904ab0" data-file-name="app/dashboard/setup-school/page.tsx">
                Alamat Sekolah </span><span className="text-red-500" data-unique-id="9251fc96-0719-46ca-9e68-e9c8e3a3756a" data-file-name="app/dashboard/setup-school/page.tsx"><span className="editable-text" data-unique-id="aba3279b-9361-4998-9417-396e6de35260" data-file-name="app/dashboard/setup-school/page.tsx">*</span></span>
              </label>
              <div className="relative" data-unique-id="642d93a0-72ac-4f59-98a6-580faee19dba" data-file-name="app/dashboard/setup-school/page.tsx">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                <textarea id="address" name="address" value={schoolData.address} onChange={handleChange} rows={3} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white shadow-sm text-base" placeholder="Masukkan alamat lengkap sekolah" required data-unique-id="b63b5139-04b4-4092-af10-812decf8e5dd" data-file-name="app/dashboard/setup-school/page.tsx" />
              </div>
            </div>
            
            <div className="mb-1" data-unique-id="8527ef16-2e13-4406-a86b-c80b2d9e5d42" data-file-name="app/dashboard/setup-school/page.tsx">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="9336004f-79dd-44bb-8ea7-39494ae49067" data-file-name="app/dashboard/setup-school/page.tsx"><span className="editable-text" data-unique-id="013a0a74-c89d-497b-9813-0855537bc427" data-file-name="app/dashboard/setup-school/page.tsx">
                Email Sekolah
              </span></label>
              <div className="relative" data-unique-id="6e594038-27c9-4ccd-bb46-462c2227f647" data-file-name="app/dashboard/setup-school/page.tsx">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="email" id="email" name="email" value={schoolData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white shadow-sm text-base" placeholder="email@sekolah.sch.id" data-unique-id="4038a0cf-94db-4112-a952-7214e116ec39" data-file-name="app/dashboard/setup-school/page.tsx" />
              </div>
            </div>
            
            <div className="mb-1" data-unique-id="33ae6618-0773-4e65-843b-f2481db7765d" data-file-name="app/dashboard/setup-school/page.tsx">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="46869472-cda0-40b2-9267-e7ce1613fd23" data-file-name="app/dashboard/setup-school/page.tsx"><span className="editable-text" data-unique-id="bef4bb04-f10d-475e-a7e1-7686513f1b7b" data-file-name="app/dashboard/setup-school/page.tsx">
                Nomor Telepon
              </span></label>
              <div className="relative" data-unique-id="c31c6b9a-bbbe-4ded-a7f7-228afbce1abc" data-file-name="app/dashboard/setup-school/page.tsx">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" id="phone" name="phone" value={schoolData.phone} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white shadow-sm text-base" placeholder="+62-xxx-xxxx-xxxx" data-unique-id="8804e092-26d0-43e1-ab9b-66d9f8c291b0" data-file-name="app/dashboard/setup-school/page.tsx" />
              </div>
            </div>

            <div className="mb-1" data-unique-id="96c0079d-15ad-4602-bf18-4d057e72a746" data-file-name="app/dashboard/setup-school/page.tsx">
              <label htmlFor="principalName" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="a3ad437a-fa2f-4e27-957c-8a644110ccbc" data-file-name="app/dashboard/setup-school/page.tsx"><span className="editable-text" data-unique-id="186fd011-e997-494a-b819-8f7135cce806" data-file-name="app/dashboard/setup-school/page.tsx">
                Nama Kepala Sekolah </span><span className="text-red-500" data-unique-id="76418790-28a9-4018-bd63-66b2a947ab37" data-file-name="app/dashboard/setup-school/page.tsx"><span className="editable-text" data-unique-id="19120274-6e31-4812-bb2c-7ab58d31c8a0" data-file-name="app/dashboard/setup-school/page.tsx">*</span></span>
              </label>
              <input type="text" id="principalName" name="principalName" value={schoolData.principalName} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white shadow-sm text-base" placeholder="Masukkan nama kepala sekolah" required data-unique-id="9d7538d1-1e5a-4b50-933a-1c10a7fe0b4a" data-file-name="app/dashboard/setup-school/page.tsx" />
            </div>

            <div className="mb-1" data-unique-id="83bdb9c7-efe8-4ae6-bdfb-51c286c2e25d" data-file-name="app/dashboard/setup-school/page.tsx">
              <label htmlFor="principalNip" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="8ac081f1-19dd-48ae-9933-76a81ec4dcbc" data-file-name="app/dashboard/setup-school/page.tsx"><span className="editable-text" data-unique-id="0193cb8e-560d-45d2-9cc9-8aeab60bc6c8" data-file-name="app/dashboard/setup-school/page.tsx">
                NIP Kepala Sekolah </span><span className="text-red-500" data-unique-id="1010a427-6b47-46a2-b082-4c94b963c919" data-file-name="app/dashboard/setup-school/page.tsx"><span className="editable-text" data-unique-id="ed8d7e46-c5fb-467f-8a54-4eba8cc9e5ca" data-file-name="app/dashboard/setup-school/page.tsx">*</span></span>
              </label>
              <input type="text" id="principalNip" name="principalNip" value={schoolData.principalNip} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white shadow-sm text-base" placeholder="Masukkan NIP kepala sekolah" required data-unique-id="2450e184-192c-441e-8c61-ce7a5fa8a7f9" data-file-name="app/dashboard/setup-school/page.tsx" />
            </div>

            <div className="md:col-span-2 flex justify-center mt-4" data-unique-id="1a130d34-b8b4-4ca5-bac9-8b00f9325461" data-file-name="app/dashboard/setup-school/page.tsx">
              <motion.button type="submit" disabled={saving} className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-sm w-full md:w-auto" whileTap={{
              scale: 0.95
            }} data-unique-id="2c0b902e-5e8a-48f7-9a9c-d28bcfb602dc" data-file-name="app/dashboard/setup-school/page.tsx" data-dynamic-text="true">
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save size={20} />}
                <span className="font-medium" data-unique-id="776075b8-a52c-441e-8134-5fedbca3fe1b" data-file-name="app/dashboard/setup-school/page.tsx" data-dynamic-text="true">
                  {saving ? "Menyimpan..." : "Simpan & Lanjutkan"}
                </span>
              </motion.button>
            </div>
          </div>
        </form>
      </div>
    </div>;
}