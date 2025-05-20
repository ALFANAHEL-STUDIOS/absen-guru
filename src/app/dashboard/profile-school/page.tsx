"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { readDocument, updateDocument } from "@/lib/firestore";
import { School, Save, CheckCircle, Loader2, QrCode, PlusCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
interface SchoolData {
  name: string;
  npsn: string;
  address: string;
  principalName: string;
  principalNip: string;
  email?: string;
  phone?: string;
  website?: string;
  logo?: string;
}
export default function SchoolProfile() {
  const {
    user,
    schoolId,
    userRole
  } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isNewSchool, setIsNewSchool] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [schoolData, setSchoolData] = useState<SchoolData>({
    name: "",
    npsn: "",
    address: "",
    principalName: "",
    principalNip: "",
    email: "",
    phone: "",
    website: "",
    logo: ""
  });
  useEffect(() => {
    const fetchSchoolData = async () => {
      if (schoolId) {
        try {
          const {
            schoolApi
          } = await import('@/lib/api');
          const data = (await schoolApi.getById(schoolId)) as unknown as SchoolData;
          if (data) {
            // Safely construct a SchoolData object from the returned data
            setSchoolData({
              name: data.name || "",
              npsn: data.npsn || "",
              address: data.address || "",
              principalName: data.principalName || "",
              principalNip: data.principalNip || "",
              email: data.email || "",
              phone: data.phone || "",
              website: data.website || "",
              logo: data.logo || ""
            });
            setShowForm(true);
          } else {
            // If no school data found, show the "Add School" button
            setIsNewSchool(true);
          }
        } catch (error) {
          console.error("Error fetching school data:", error);
          setIsNewSchool(true);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setIsNewSchool(true);
      }
    };
    fetchSchoolData();
  }, [schoolId]);
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
    try {
      setSaving(true);
      try {
        const {
          schoolApi
        } = await import('@/lib/api');
        const {
          db
        } = await import('@/lib/firebase');
        const {
          doc,
          setDoc,
          updateDoc,
          serverTimestamp
        } = await import('firebase/firestore');
        if (isNewSchool) {
          // Create new school - use user UID as school ID for admin users
          if (!user) {
            toast.error("Pengguna tidak terdeteksi");
            return;
          }
          const newSchoolId = user.uid; // Use the user's UID as the school ID

          try {
            // Create the school document directly with Firestore for better error handling
            await setDoc(doc(db, "schools", newSchoolId), {
              ...schoolData,
              createdAt: serverTimestamp(),
              createdBy: user.uid,
              updatedAt: serverTimestamp()
            });

            // Update the user's record to include the schoolId
            await updateDoc(doc(db, "users", user.uid), {
              schoolId: newSchoolId,
              updatedAt: serverTimestamp()
            });

            // Update local storage
            if (typeof window !== 'undefined') {
              localStorage.setItem('schoolId', newSchoolId);
              localStorage.removeItem('needsSchoolSetup');
            }
            toast.success("Sekolah berhasil dibuat");
          } catch (firestoreError: any) {
            console.error("Firestore error:", firestoreError);
            if (firestoreError.code === 'permission-denied') {
              toast.error("Akses ditolak. Anda tidak memiliki izin untuk membuat sekolah.");
            } else {
              toast.error("Gagal membuat sekolah: " + firestoreError.message);
            }
            return;
          }
        } else {
          // Update existing school
          if (!schoolId) {
            toast.error("Tidak dapat mengakses data sekolah");
            return;
          }
          try {
            // Update school document directly with Firestore
            await updateDoc(doc(db, "schools", schoolId), {
              ...schoolData,
              updatedAt: serverTimestamp()
            });
            toast.success("Data sekolah berhasil diperbarui");
          } catch (firestoreError: any) {
            console.error("Firestore error:", firestoreError);
            if (firestoreError.code === 'permission-denied') {
              toast.error("Akses ditolak. Anda tidak memiliki izin untuk memperbarui data sekolah.");
            } else {
              toast.error("Gagal memperbarui data sekolah: " + firestoreError.message);
            }
            return;
          }
        }

        // Show success animation
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          // Redirect back to dashboard
          router.push('/dashboard');
        }, 1500);
      } catch (apiError) {
        console.error("API error:", apiError);
        toast.error("Gagal menyimpan data sekolah - kesalahan API");
      }
    } catch (error) {
      console.error("Error saving school data:", error);
      toast.error("Gagal menyimpan data sekolah");
    } finally {
      setSaving(false);
    }
  };
  const handleAddNewSchool = () => {
    setShowForm(true);
  };
  if (loading) {
    return <div className="flex justify-center items-center h-64" data-unique-id="105fabc0-b782-4076-bd3b-3541a1552a41" data-file-name="app/dashboard/profile-school/page.tsx">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>;
  }
  return <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 md:px-6 pb-24 md:pb-6" data-unique-id="6cb3c629-0306-4921-86a4-20982cce0e27" data-file-name="app/dashboard/profile-school/page.tsx" data-dynamic-text="true">
      <div className="flex items-center mb-6" data-unique-id="98c00a1f-85d2-45f2-a567-37f1721d49c9" data-file-name="app/dashboard/profile-school/page.tsx">
        <School className="h-8 w-8 text-primary mr-3" />
        <h1 className="text-2xl font-bold text-gray-800" data-unique-id="d8c8c0f1-cd50-4602-9b82-447907600902" data-file-name="app/dashboard/profile-school/page.tsx"><span className="editable-text" data-unique-id="7b51a0c3-7e04-4897-a568-9b8f9fd62b54" data-file-name="app/dashboard/profile-school/page.tsx">Profil Sekolah</span></h1>
      </div>

      {!showForm && isNewSchool ? <div className="bg-white rounded-xl shadow-lg p-10 text-center border border-gray-100" data-unique-id="a7aa9b14-3f1e-49bf-ad76-37ce74d01137" data-file-name="app/dashboard/profile-school/page.tsx">
          <div className="flex flex-col items-center" data-unique-id="be651770-1801-4cab-9c68-ef7604c35eb0" data-file-name="app/dashboard/profile-school/page.tsx">
            <div className="bg-primary/10 p-6 rounded-full mb-6" data-unique-id="90598238-de7a-4e3f-bccd-f6709a44ae9f" data-file-name="app/dashboard/profile-school/page.tsx">
              <School className="h-16 w-16 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-3" data-unique-id="4f4f4da8-9e1d-4157-8151-a3379706303f" data-file-name="app/dashboard/profile-school/page.tsx"><span className="editable-text" data-unique-id="f35491ef-0cf4-49bf-8553-1307a9073338" data-file-name="app/dashboard/profile-school/page.tsx">Belum Ada Data Sekolah</span></h2>
            <p className="text-gray-600 mb-8" data-unique-id="d10321ea-bdba-4e0f-883f-9ecea58fa9c6" data-file-name="app/dashboard/profile-school/page.tsx"><span className="editable-text" data-unique-id="01b3a839-e255-46ab-92f2-49e3a8f77743" data-file-name="app/dashboard/profile-school/page.tsx">
              Anda belum memiliki data sekolah yang terdaftar. Tambahkan data sekolah untuk menggunakan fitur absensi.
            </span></p>
            <motion.button onClick={handleAddNewSchool} className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors" whileTap={{
          scale: 0.95
        }} data-unique-id="ad91c4b7-dd25-4137-92f8-093c13ac2a75" data-file-name="app/dashboard/profile-school/page.tsx">
              <PlusCircle size={20} />
              <span data-unique-id="a9534fe7-e483-449f-b6d3-cf4611595a2e" data-file-name="app/dashboard/profile-school/page.tsx"><span className="editable-text" data-unique-id="6b04510a-d483-4106-a681-6f65cd970db6" data-file-name="app/dashboard/profile-school/page.tsx">Tambah Data Sekolah</span></span>
            </motion.button>
          </div>
        </div> : <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100" data-unique-id="44bae245-066a-4bf1-98b5-b3bafa68c39b" data-file-name="app/dashboard/profile-school/page.tsx">
          <form onSubmit={handleSubmit} data-unique-id="8809ed73-a595-4447-ad9d-e63fe2e8dc55" data-file-name="app/dashboard/profile-school/page.tsx">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6" data-unique-id="7804cd6d-1ff3-428d-9dbc-33dcf2c9d3d4" data-file-name="app/dashboard/profile-school/page.tsx">
              <div className="md:col-span-2" data-unique-id="6e4fb443-7288-46ee-a5fa-f9922497d756" data-file-name="app/dashboard/profile-school/page.tsx">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="6fcc1d49-ad37-49a5-8ddf-586558daf784" data-file-name="app/dashboard/profile-school/page.tsx"><span className="editable-text" data-unique-id="8198a053-2737-4371-a1c2-a75561856260" data-file-name="app/dashboard/profile-school/page.tsx">
                  Nama Sekolah
                </span></label>
                <input type="text" id="name" name="name" value={schoolData.name} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white shadow-sm text-base" placeholder="Masukkan nama sekolah" required data-unique-id="84f95f0c-3a91-4c69-a32e-24488f9fa717" data-file-name="app/dashboard/profile-school/page.tsx" />
              </div>

              <div className="mb-1" data-unique-id="ff589e3b-14c9-4f5c-9f6d-bebf26ae38d2" data-file-name="app/dashboard/profile-school/page.tsx">
                <label htmlFor="npsn" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="2545a7e5-ab82-4627-bd05-06ea6d368eb6" data-file-name="app/dashboard/profile-school/page.tsx"><span className="editable-text" data-unique-id="bd97d1ae-4de4-4ec1-b193-3b45799cfe79" data-file-name="app/dashboard/profile-school/page.tsx">
                  NPSN (Nomor Pokok Sekolah Nasional)
                </span></label>
                <input type="text" id="npsn" name="npsn" value={schoolData.npsn} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white shadow-sm text-base" placeholder="Masukkan NPSN" required data-unique-id="aec182ad-a5c2-4567-a7c5-2fdefb6ffa41" data-file-name="app/dashboard/profile-school/page.tsx" />
              </div>
              
              <div className="mb-1" data-unique-id="23198050-622d-4feb-badb-d3938d4462a2" data-file-name="app/dashboard/profile-school/page.tsx">
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="6a47c444-286f-4396-b197-1eebeaa2f9d1" data-file-name="app/dashboard/profile-school/page.tsx"><span className="editable-text" data-unique-id="453e3730-f676-4410-99f2-d9027e4f4050" data-file-name="app/dashboard/profile-school/page.tsx">
                  Website Sekolah (jika ada)
                </span></label>
                <input type="text" id="website" name="website" value={schoolData.website} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white shadow-sm text-base" placeholder="https://www.sekolah.sch.id" data-unique-id="86294b24-f17e-4d21-8fbf-ccc354df0745" data-file-name="app/dashboard/profile-school/page.tsx" />
              </div>

              <div className="md:col-span-2 mb-1" data-unique-id="17faafb9-c87e-4dd8-a460-ff3111cdba55" data-file-name="app/dashboard/profile-school/page.tsx">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="ff555906-7991-4722-813f-a24d214466e0" data-file-name="app/dashboard/profile-school/page.tsx"><span className="editable-text" data-unique-id="ce046176-666e-4837-b62a-71a3d14a9555" data-file-name="app/dashboard/profile-school/page.tsx">
                  Alamat Sekolah
                </span></label>
                <textarea id="address" name="address" value={schoolData.address} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white shadow-sm text-base" placeholder="Masukkan alamat lengkap sekolah" required data-unique-id="f9c8743b-576e-4d2e-8e31-34f14fbac60a" data-file-name="app/dashboard/profile-school/page.tsx" />
              </div>
              
              <div className="mb-1" data-unique-id="98d7195f-f5b8-4e35-a8cc-6752e53cf1fd" data-file-name="app/dashboard/profile-school/page.tsx">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="4fb70af1-d5f4-4689-8c58-f03e11b02b4f" data-file-name="app/dashboard/profile-school/page.tsx"><span className="editable-text" data-unique-id="392c00c0-787b-45c3-b152-a37509aa1c09" data-file-name="app/dashboard/profile-school/page.tsx">
                  Email Sekolah
                </span></label>
                <input type="email" id="email" name="email" value={schoolData.email} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white shadow-sm text-base" placeholder="email@sekolah.sch.id" data-unique-id="d70a86f2-a23a-410e-b26f-37facbcc9ccc" data-file-name="app/dashboard/profile-school/page.tsx" />
              </div>
              
              <div className="mb-1" data-unique-id="3f93ca54-effb-4255-853e-31b7d6ce2c86" data-file-name="app/dashboard/profile-school/page.tsx">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="c183bd3a-8c5b-4707-b91f-5dc43d83ba94" data-file-name="app/dashboard/profile-school/page.tsx"><span className="editable-text" data-unique-id="cbf2210b-034b-451a-88b9-ad93a00977fc" data-file-name="app/dashboard/profile-school/page.tsx">
                  Nomor Telepon
                </span></label>
                <input type="text" id="phone" name="phone" value={schoolData.phone} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white shadow-sm text-base" placeholder="+62-xxx-xxxx-xxxx" data-unique-id="a7d2e8c8-0827-4ffb-affd-228fb1b0de0c" data-file-name="app/dashboard/profile-school/page.tsx" />
              </div>

              <div className="mb-1" data-unique-id="78ee7044-b2c3-4823-a744-bb762b96dd1d" data-file-name="app/dashboard/profile-school/page.tsx">
                <label htmlFor="principalName" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="824dbe5a-ace6-4380-9df0-38dc5f3e9933" data-file-name="app/dashboard/profile-school/page.tsx"><span className="editable-text" data-unique-id="4380e4a1-f0bc-4942-8044-67826685dcb1" data-file-name="app/dashboard/profile-school/page.tsx">
                  Nama Kepala Sekolah
                </span></label>
                <input type="text" id="principalName" name="principalName" value={schoolData.principalName} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white shadow-sm text-base" placeholder="Masukkan nama kepala sekolah" required data-unique-id="4313c7bf-b13b-4d8a-96c7-05c0895820eb" data-file-name="app/dashboard/profile-school/page.tsx" />
              </div>

              <div className="mb-1" data-unique-id="91898a85-ec6b-4d6d-8880-6634719758d6" data-file-name="app/dashboard/profile-school/page.tsx">
                <label htmlFor="principalNip" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="9d770750-ce04-4bc0-8dc0-53e580afb315" data-file-name="app/dashboard/profile-school/page.tsx"><span className="editable-text" data-unique-id="dffc020a-427a-4e0a-a29f-f54a6780a0b7" data-file-name="app/dashboard/profile-school/page.tsx">
                  NIP Kepala Sekolah
                </span></label>
                <input type="text" id="principalNip" name="principalNip" value={schoolData.principalNip} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white shadow-sm text-base" placeholder="Masukkan NIP kepala sekolah" required data-unique-id="1453237c-2b75-4a31-857c-87695c721e19" data-file-name="app/dashboard/profile-school/page.tsx" />
              </div>

              <div className="md:col-span-2 flex justify-center md:justify-end mt-4" data-unique-id="21a9dcde-e379-4a35-a081-26feb2128185" data-file-name="app/dashboard/profile-school/page.tsx">
                <motion.button type="submit" disabled={saving} className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-sm w-full md:w-auto" whileTap={{
              scale: 0.95
            }} data-unique-id="39340f51-9a5d-4739-bb5e-eefe5ae2f034" data-file-name="app/dashboard/profile-school/page.tsx" data-dynamic-text="true">
                  {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : saveSuccess ? <CheckCircle size={20} /> : <Save size={20} />}
                  <span className="font-medium" data-unique-id="c4a722b7-a747-45ab-97e5-8306d7a69b00" data-file-name="app/dashboard/profile-school/page.tsx" data-dynamic-text="true">
                    {saveSuccess ? "Tersimpan" : isNewSchool ? "Tambah Sekolah" : "Simpan Perubahan"}
                  </span>
                </motion.button>
              </div>
            </div>
          </form>
        </div>}
    </div>;
}