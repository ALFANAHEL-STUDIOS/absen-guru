"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { User, Hash, Calendar, MapPin, Phone, Save, ArrowLeft, Loader2, CheckCircle, Mail } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
export default function EditStudent({
  params
}: {
  params: {
    id: string;
  };
}) {
  const {
    schoolId
  } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [studentData, setStudentData] = useState({
    name: "",
    nisn: "",
    class: "",
    gender: "male",
    birthPlace: "",
    birthDate: "",
    telegramNumber: "",
    address: "",
    email: ""
  });
  const classList = Array.from({
    length: 12
  }, (_, i) => ({
    value: `${i + 1}`,
    label: `${i + 1}`
  }));
  useEffect(() => {
    const fetchStudent = async () => {
      if (!schoolId) return;
      try {
        setLoading(true);
        const studentDoc = await getDoc(doc(db, "schools", schoolId, "students", params.id));
        if (!studentDoc.exists()) {
          toast.error("Data siswa tidak ditemukan");
          router.push("/dashboard/students");
          return;
        }
        const data = studentDoc.data();
        setStudentData({
          name: data.name || "",
          nisn: data.nisn || "",
          class: data.class || "",
          gender: data.gender || "male",
          birthPlace: data.birthPlace || "",
          birthDate: data.birthDate || "",
          telegramNumber: data.telegramNumber || "",
          address: data.address || "",
          email: data.email || ""
        });
      } catch (error) {
        console.error("Error fetching student:", error);
        toast.error("Gagal mengambil data siswa");
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [schoolId, params.id, router]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    setStudentData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) {
      toast.error("Tidak dapat mengakses data sekolah");
      return;
    }
    try {
      setSaving(true);

      // Update student data
      const {
        studentApi
      } = await import('@/lib/api');
      await studentApi.update(schoolId, params.id, studentData);

      // Show success animation
      setSaveSuccess(true);
      toast.success("Data siswa berhasil diperbarui");

      // Redirect after successful update
      setTimeout(() => {
        router.push(`/dashboard/students/${params.id}`);
      }, 1500);
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Gagal memperbarui data siswa");
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return <div className="flex justify-center items-center h-64" data-unique-id="8187e776-9315-42df-b914-e47be68dcbfb" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>;
  }
  return <div className="w-full max-w-3xl mx-auto pb-20 md:pb-6 px-3 sm:px-4 md:px-6" data-unique-id="13f5d1dd-f419-4c4c-ac77-ca7c6add2668" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
      <div className="flex items-center mb-6" data-unique-id="355f713c-f986-44ec-9fa2-a008f4576a3e" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
        <Link href={`/dashboard/students/${params.id}`} className="p-2 mr-2 hover:bg-gray-100 rounded-full" data-unique-id="033a9726-8b83-47fd-8ea8-18a13126dddc" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800" data-unique-id="e95bb992-3cff-4118-9ed6-7f28a508eb08" data-file-name="app/dashboard/students/edit/[id]/page.tsx"><span className="editable-text" data-unique-id="fb04ef26-aea7-45de-a3b0-71f3b00c8104" data-file-name="app/dashboard/students/edit/[id]/page.tsx">Edit Data Siswa</span></h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 md:p-6" data-unique-id="4ea0718a-8fb4-4343-9609-b8369d1610af" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
        <form onSubmit={handleSubmit} data-unique-id="21e264ce-7189-4cb4-86af-18acd82da50f" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
          <div className="space-y-6" data-unique-id="05839eda-3c12-4803-991c-595bd1c7ac16" data-file-name="app/dashboard/students/edit/[id]/page.tsx" data-dynamic-text="true">
            {/* Student Information */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-6" data-unique-id="7765e6eb-3d9e-4d79-8aa5-7ed659d0107f" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
              <div data-unique-id="4f66721d-ad91-4e52-91fc-2e2b64903e4a" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="5996cd38-3107-4e21-9e1d-6e9ce403c983" data-file-name="app/dashboard/students/edit/[id]/page.tsx"><span className="editable-text" data-unique-id="86bc6f41-e67c-4b7c-bb0a-8b659f3f3229" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
                  Nama Lengkap
                </span></label>
                <div className="relative" data-unique-id="f7649a5d-9b63-4df7-bfac-11378ea80fe9" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="text" id="name" name="name" value={studentData.name} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white" placeholder="Nama lengkap siswa" required data-unique-id="bc3d2449-151d-47d9-940d-4c4118e5150a" data-file-name="app/dashboard/students/edit/[id]/page.tsx" />
                </div>
              </div>
              
              <div data-unique-id="6afa4fc4-172f-441e-b864-1b00ec4ba827" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
                <label htmlFor="nisn" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="054ae7fb-6226-4cc7-a874-d8f0e6e14de9" data-file-name="app/dashboard/students/edit/[id]/page.tsx"><span className="editable-text" data-unique-id="258e57b4-a3d9-40fd-bebd-37fbbfac8d7b" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
                  NISN
                </span></label>
                <div className="relative" data-unique-id="7255165d-5f34-48b5-b680-324e7eafd773" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="text" id="nisn" name="nisn" value={studentData.nisn} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white" placeholder="Nomor NISN" required data-unique-id="8871e018-8c3d-49ba-88ee-b3564ad7a9ce" data-file-name="app/dashboard/students/edit/[id]/page.tsx" />
                </div>
              </div>
              
              <div data-unique-id="7b6be885-66b1-4685-bc86-72ffc48bb0ed" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
                <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="ebf47938-0cb0-489a-8e78-252b27cd0e1f" data-file-name="app/dashboard/students/edit/[id]/page.tsx"><span className="editable-text" data-unique-id="e70a7d72-bb71-452e-95f5-06aac0a7ff1b" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
                  Kelas
                </span></label>
                <select id="class" name="class" value={studentData.class} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white" required data-unique-id="20cbd579-08cb-45e1-ab85-6acae1cb6448" data-file-name="app/dashboard/students/edit/[id]/page.tsx" data-dynamic-text="true">
                  <option value="" disabled data-unique-id="0da8a0c8-cfa4-4ab5-8841-6eb458f253a5" data-file-name="app/dashboard/students/edit/[id]/page.tsx"><span className="editable-text" data-unique-id="aefbba89-eea0-49b2-96fd-a23a99fe1812" data-file-name="app/dashboard/students/edit/[id]/page.tsx">Pilih Kelas</span></option>
                  {classList.map(item => <option key={item.value} value={item.value} data-unique-id="fb2cbf21-1db0-4bb6-bdb0-91b492a94cc2" data-file-name="app/dashboard/students/edit/[id]/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="119751ba-61f4-4471-84e6-b8bc9fc88d77" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
                      Kelas </span>{item.label}
                    </option>)}
                </select>
              </div>
              
              <div data-unique-id="fc7f7c46-a5ce-446a-9207-e464e25f37fa" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="f981e805-c971-4757-b20b-aa1fb2c0ea83" data-file-name="app/dashboard/students/edit/[id]/page.tsx"><span className="editable-text" data-unique-id="70209a77-9edf-4d25-aab2-f6c18e7f7ebe" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
                  Jenis Kelamin
                </span></label>
                <select id="gender" name="gender" value={studentData.gender} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white" required data-unique-id="debdf389-7a38-4e8a-9a74-266c84522c93" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
                  <option value="male" data-unique-id="aa3cf4c9-6ec8-4691-a7f2-05b172e3e552" data-file-name="app/dashboard/students/edit/[id]/page.tsx"><span className="editable-text" data-unique-id="043510e3-f061-41dd-a491-7a51ebb3bef3" data-file-name="app/dashboard/students/edit/[id]/page.tsx">Laki-laki</span></option>
                  <option value="female" data-unique-id="40f7983d-be9f-4cce-bc46-2520be4de235" data-file-name="app/dashboard/students/edit/[id]/page.tsx"><span className="editable-text" data-unique-id="4ad4a254-7674-40ff-beb7-1671cf391513" data-file-name="app/dashboard/students/edit/[id]/page.tsx">Perempuan</span></option>
                </select>
              </div>
              
              <div data-unique-id="4f8d1428-31fe-4528-9cb6-5665800f7429" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
                <label htmlFor="birthPlace" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="0ce4e08f-21ab-418f-849f-53b3768a2d34" data-file-name="app/dashboard/students/edit/[id]/page.tsx"><span className="editable-text" data-unique-id="4b63e0a2-bf37-46ce-9700-5c425cb3d5c4" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
                  Tempat Lahir
                </span></label>
                <div className="relative" data-unique-id="93bd3123-e0ec-47fc-8d4f-b9bbb09cdacb" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="text" id="birthPlace" name="birthPlace" value={studentData.birthPlace} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white" placeholder="Tempat lahir" data-unique-id="6cc3abb0-7741-4ebd-84ce-0e7e34f7f360" data-file-name="app/dashboard/students/edit/[id]/page.tsx" />
                </div>
              </div>
              
              <div data-unique-id="05305626-5828-422a-945b-9485ec5a02df" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="1d824678-14ee-4979-abbc-b5786c03e3f0" data-file-name="app/dashboard/students/edit/[id]/page.tsx"><span className="editable-text" data-unique-id="f8a84e9a-3a1f-45b9-aaf2-4f2352a7d41d" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
                  Tanggal Lahir
                </span></label>
                <div className="relative" data-unique-id="6fd7e837-fb41-47e8-9c28-2e197eda7283" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} data-unique-id="cff3da69-086f-44dd-85c1-d8d11b8522ef" data-file-name="app/dashboard/students/edit/[id]/page.tsx" />
                  <input type="date" id="birthDate" name="birthDate" value={studentData.birthDate} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white" data-unique-id="a559925f-5766-409f-b973-5fb0d3d807a8" data-file-name="app/dashboard/students/edit/[id]/page.tsx" />
                </div>
              </div>
              
              <div data-unique-id="112f2a4c-2766-4664-88f1-5416cdd63063" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
                <label htmlFor="telegramNumber" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="b39e05cd-c4d6-4b43-a241-7cb6a240649f" data-file-name="app/dashboard/students/edit/[id]/page.tsx"><span className="editable-text" data-unique-id="3df1d71a-22eb-4885-ba82-c025cf6e1fe4" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
                  Nomor Telegram
                </span></label>
                <div className="relative" data-unique-id="909392bb-a39a-4188-ad7a-1b47fcaf4aa9" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="text" id="telegramNumber" name="telegramNumber" value={studentData.telegramNumber} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white" placeholder="Nomor Telegram" data-unique-id="0c0e147d-2dec-4618-9e8a-5933c586b1c9" data-file-name="app/dashboard/students/edit/[id]/page.tsx" />
                </div>
              </div>
              
              <div data-unique-id="b8d9be86-532e-4dea-abab-c59f056a0377" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="dac6fa0b-4f88-4e52-9375-4629835fc071" data-file-name="app/dashboard/students/edit/[id]/page.tsx"><span className="editable-text" data-unique-id="ac5b5941-af88-4492-9e38-55e9142c964a" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
                  Email
                </span></label>
                <div className="relative" data-unique-id="9efcee97-894e-4783-ba95-062ac9c128a4" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="email" id="email" name="email" value={studentData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white" placeholder="Email siswa" data-unique-id="1ad86518-eb06-4844-b8c8-7fe0b0949f2c" data-file-name="app/dashboard/students/edit/[id]/page.tsx" />
                </div>
              </div>
              
              <div className="md:col-span-2" data-unique-id="9195230a-a32d-4255-abd4-fb0a0a6424bd" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="7f1470b8-8c87-44f5-9e7d-724f1ce9b809" data-file-name="app/dashboard/students/edit/[id]/page.tsx"><span className="editable-text" data-unique-id="e992429c-95a5-467c-b405-ba5464b4c97a" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
                  Alamat
                </span></label>
                <div className="relative" data-unique-id="53e065f8-98ed-4634-a58d-5c55721696ae" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                  <textarea id="address" name="address" value={studentData.address} onChange={handleChange} rows={3} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white" placeholder="Alamat lengkap" data-unique-id="f0f80fa6-cf01-4e98-8f25-0ba253556143" data-file-name="app/dashboard/students/edit/[id]/page.tsx" />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end" data-unique-id="91c0081a-1f14-4be9-a144-c73667391ed5" data-file-name="app/dashboard/students/edit/[id]/page.tsx">
              <motion.button type="submit" disabled={saving} className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors" whileTap={{
              scale: 0.95
            }} data-unique-id="4477a5be-5fe4-46aa-899e-eab673c85ea8" data-file-name="app/dashboard/students/edit/[id]/page.tsx" data-dynamic-text="true">
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : saveSuccess ? <CheckCircle size={20} /> : <Save size={20} />}
                <span data-unique-id="3e74155b-48a6-4a93-b010-39a18a62367c" data-file-name="app/dashboard/students/edit/[id]/page.tsx" data-dynamic-text="true">{saving ? "Menyimpan..." : saveSuccess ? "Tersimpan" : "Simpan Perubahan"}</span>
              </motion.button>
            </div>
          </div>
        </form>
      </div>
    </div>;
}