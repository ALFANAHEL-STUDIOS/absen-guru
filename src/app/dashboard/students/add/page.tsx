"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { QRCodeSVG } from "qrcode.react";
import { User, Hash, Calendar, MapPin, Phone, Image as ImageIcon, Save, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function AddStudent() {
  const {
    schoolId
  } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  // Removed file input references

  const [studentData, setStudentData] = useState({
    name: "",
    nisn: "",
    class: "",
    gender: "male",
    birthPlace: "",
    birthDate: "",
    telegramNumber: ""
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {
      name,
      value
    } = e.target;
    setStudentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Image change handler removed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) {
      toast.error("Tidak dapat mengakses data sekolah");
      return;
    }
    try {
      setSaving(true);

      // Image upload removed
      const photoUrl = "";

      // Add student to Firestore using the improved API
      const {
        studentApi
      } = await import('@/lib/api');
      await studentApi.create(schoolId, {
        ...studentData,
        photoUrl,
        qrCode: studentData.nisn // NISN is used as QR code data
      });

      // Redirect back to students list
      router.push('/dashboard/students');
    } catch (error) {
      console.error("Error adding student:", error);
    } finally {
      setSaving(false);
    }
  };
  return <div className="w-full max-w-3xl mx-auto pb-20 md:pb-6 px-3 sm:px-4 md:px-6" data-unique-id="bc48029b-6161-40a0-ace0-1a45a1cc3d9c" data-file-name="app/dashboard/students/add/page.tsx">
      <div className="flex items-center mb-6" data-unique-id="29df20e1-a78e-421b-b5ff-4341542d98fd" data-file-name="app/dashboard/students/add/page.tsx">
        <Link href="/dashboard/students" className="p-2 mr-2 hover:bg-gray-100 rounded-full" data-unique-id="3cf49abe-c64e-474d-96d6-b723a7b9be3c" data-file-name="app/dashboard/students/add/page.tsx">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800" data-unique-id="b0ebaf32-a782-4187-9e68-2232cefd45ac" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="1cb348ac-bb17-43a8-808d-2132383676c4" data-file-name="app/dashboard/students/add/page.tsx">Tambah Siswa Baru</span></h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 md:p-6" data-unique-id="fa3c8ea3-c8fb-4459-81c7-628831ffb02d" data-file-name="app/dashboard/students/add/page.tsx">
        <form onSubmit={handleSubmit} data-unique-id="e18e65bc-9365-4b03-af7e-2ccbc0d8a45c" data-file-name="app/dashboard/students/add/page.tsx">
          <div className="space-y-6" data-unique-id="8c0bc4a3-f800-4be1-b89b-377536afe320" data-file-name="app/dashboard/students/add/page.tsx" data-dynamic-text="true">
            
            {/* Student Information */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-6" data-unique-id="e1112b26-0cce-4633-a317-996ae435f344" data-file-name="app/dashboard/students/add/page.tsx">
              <div data-unique-id="3df3b6a0-bbd1-4c4d-b3c6-472e83478287" data-file-name="app/dashboard/students/add/page.tsx">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="f3fb53f5-9aa8-436f-a27b-2b3e16741bbc" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="1e2e4023-c736-440f-955b-80058db9daf2" data-file-name="app/dashboard/students/add/page.tsx">
                  Nama Lengkap
                </span></label>
                <div className="relative" data-unique-id="a308270b-b049-4d0e-aa4e-10e5836a210e" data-file-name="app/dashboard/students/add/page.tsx">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="text" id="name" name="name" value={studentData.name} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white" placeholder="Nama lengkap siswa" required data-unique-id="9812f488-b1b1-45a1-9231-4bd17b9939ea" data-file-name="app/dashboard/students/add/page.tsx" />
                </div>
              </div>
              
              <div data-unique-id="77680c0f-8aa1-4cc1-b775-2af7d544fdb9" data-file-name="app/dashboard/students/add/page.tsx">
                <label htmlFor="nisn" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="0127536f-726c-4dcb-9bd4-a66cb4acd63a" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="2a9bbf7f-8a9c-429d-b36b-e85d239cbb53" data-file-name="app/dashboard/students/add/page.tsx">
                  NISN
                </span></label>
                <div className="relative" data-unique-id="ef2c3586-a4b2-411e-b196-e3cb155a4bca" data-file-name="app/dashboard/students/add/page.tsx">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="text" id="nisn" name="nisn" value={studentData.nisn} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white" placeholder="Nomor NISN" required data-unique-id="64f6c279-88c4-4532-ab7e-2667bb2438cc" data-file-name="app/dashboard/students/add/page.tsx" />
                </div>
              </div>
              
              <div data-unique-id="951af6f5-8108-4553-a566-dd1abe791c65" data-file-name="app/dashboard/students/add/page.tsx">
                <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="8864475a-3213-4cf4-86ad-8fe6a817ea2e" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="2518f823-e7f6-4eb1-8f2a-07d145eb1e87" data-file-name="app/dashboard/students/add/page.tsx">
                  Tingkat/Jabatan
                </span></label>
                <select id="class" name="class" value={studentData.class} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white" required data-unique-id="c1c3a09f-fa2b-4131-97dc-acab3aba5fcc" data-file-name="app/dashboard/students/add/page.tsx">
                  <option value="" disabled data-unique-id="7e6c26ad-bd02-40d4-a774-de5f67609f68" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="15cab1a4-180d-41f9-8823-4916f2ac968d" data-file-name="app/dashboard/students/add/page.tsx">Pilih Jabatan</span></option>
                  <option value="Kepala Desa" data-unique-id="0c8a1edd-11c0-46c0-b18a-792f1983181b" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="6049d2b4-3478-409e-a64d-e4eec66c7899" data-file-name="app/dashboard/students/add/page.tsx">Kepala Desa</span></option>
                  <option value="Sekretaris Desa" data-unique-id="603a8c0b-73c0-4b70-b4a9-c2818db7a00f" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="80f2aead-8fd4-4121-8936-7e8ec8ce1104" data-file-name="app/dashboard/students/add/page.tsx">Sekretaris Desa</span></option>
                  <option value="Kaur Tata Usaha dan Umum" data-unique-id="45ae10a3-e4c7-4d02-8064-dbf399df155a" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="78ea36e7-b964-44ea-9d59-f8effcebdefa" data-file-name="app/dashboard/students/add/page.tsx">Kaur Tata Usaha dan Umum</span></option>
                  <option value="Kaur Keuangan" data-unique-id="131a362e-00d3-4e9d-9a73-5fac955b8d3f" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="eb1d5767-4f1f-4063-b693-e74f7cace302" data-file-name="app/dashboard/students/add/page.tsx">Kaur Keuangan</span></option>
                  <option value="Kaur Perencanaan" data-unique-id="f011d307-fdd8-4f63-8993-743733a7c1d5" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="b4b0c254-c15f-4e57-8c86-c4c364d146cf" data-file-name="app/dashboard/students/add/page.tsx">Kaur Perencanaan</span></option>
                  <option value="Kasi Pemerintahan" data-unique-id="7881f9dd-d436-4e27-9842-09c9c9e37069" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="2867cb99-85f5-4385-8147-131559702f4e" data-file-name="app/dashboard/students/add/page.tsx">Kasi Pemerintahan</span></option>
                  <option value="Kasi Kesejahteraan" data-unique-id="a1345e23-8df0-4a3c-bd3d-5c6d3ad216e2" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="e430ca0e-4e94-4ffc-b5e0-382091083883" data-file-name="app/dashboard/students/add/page.tsx">Kasi Kesejahteraan</span></option>
                  <option value="Kasi Pelayanan" data-unique-id="969e1a20-138b-4b0c-9ede-bce2a92d2122" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="ca9b1330-6eaf-4371-be57-9f2df7ea4681" data-file-name="app/dashboard/students/add/page.tsx">Kasi Pelayanan</span></option>
                  <option value="Ketua BPK" data-unique-id="3212861a-6aa0-453a-8452-0d4acf1be707" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="bd9740d5-60b8-4f3a-91c3-03c1b08693ae" data-file-name="app/dashboard/students/add/page.tsx">Ketua BPK</span></option>
                  <option value="Kepala Dusun 1" data-unique-id="d822e165-3bd9-4c0c-a2ea-4c4e761b66ae" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="a32ebe76-8630-4a40-9c7d-fe1cf923c793" data-file-name="app/dashboard/students/add/page.tsx">Kepala Dusun 1</span></option>
                  <option value="Kepala Dusun 2" data-unique-id="dfa5f3a1-c5ea-4fa4-8ab3-b8ea0c2bd0cc" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="7ab877f6-c8f0-411c-ab87-9ebf0e617621" data-file-name="app/dashboard/students/add/page.tsx">Kepala Dusun 2</span></option>
                  <option value="Kepala Dusun 3" data-unique-id="2e6f8d1c-f7d3-46f0-9648-c6b0a413761a" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="ec016482-ebe8-4359-b86a-9333b2853ef7" data-file-name="app/dashboard/students/add/page.tsx">Kepala Dusun 3</span></option>
                  <option value="Kepala Dusun 4" data-unique-id="1a174a7d-9a7d-4906-a883-4fd9794f33c6" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="10ae690a-271f-404c-a00c-a2239da2d754" data-file-name="app/dashboard/students/add/page.tsx">Kepala Dusun 4</span></option>
                  <option value="Kepala Dusun 5" data-unique-id="a1c11303-f9c6-4d12-b2a5-31b2cb5af7d1" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="66cfd0c5-8b24-49b8-ac4c-401677829453" data-file-name="app/dashboard/students/add/page.tsx">Kepala Dusun 5</span></option>
                  <option value="Kepala Dusun 6" data-unique-id="80278b96-b0fc-461a-bda3-f86ffa766ac2" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="aede0d08-39c7-4309-9af9-21ecdbd38352" data-file-name="app/dashboard/students/add/page.tsx">Kepala Dusun 6</span></option>
                  <option value="Kepala Dusun 7" data-unique-id="cfaca344-c33b-4d6a-b678-e790b3ab2f56" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="b6a5624c-73ae-4ddf-a3a7-f46f421c2413" data-file-name="app/dashboard/students/add/page.tsx">Kepala Dusun 7</span></option>
                  <option value="Kepala Dusun 8" data-unique-id="ff6b75bc-0d45-48cd-9fe0-5c0f56e3d020" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="120af90b-c727-4d90-b25d-3c1412772024" data-file-name="app/dashboard/students/add/page.tsx">Kepala Dusun 8</span></option>
                  <option value="Kepala Dusun 9" data-unique-id="b2e0256c-97fd-45db-a40b-306d9498f0e0" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="ee289ca2-b036-4258-bfb2-561cb5d86125" data-file-name="app/dashboard/students/add/page.tsx">Kepala Dusun 9</span></option>
                  <option value="Kepala Dusun 10" data-unique-id="a1a563ba-49b4-44d2-bff2-10506f916c1c" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="dedb9444-fb18-4d4e-97cc-0034443f6529" data-file-name="app/dashboard/students/add/page.tsx">Kepala Dusun 10</span></option>
                  <option value="Kepala Dusun 11" data-unique-id="f8864a86-d617-4eb5-b0e5-83b358c4cdce" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="ebac6199-bbff-4b1c-bc15-5275a156599d" data-file-name="app/dashboard/students/add/page.tsx">Kepala Dusun 11</span></option>
                  <option value="Kepala Dusun 12" data-unique-id="4c1465ca-0f1f-431f-ab36-ccb2b00f0dab" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="9c2af063-d408-45fc-8dcb-abca7d195f02" data-file-name="app/dashboard/students/add/page.tsx">Kepala Dusun 12</span></option>
                </select>
              </div>
              
              <div data-unique-id="4cbf028f-7097-4633-bf22-64df21afdf88" data-file-name="app/dashboard/students/add/page.tsx">
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="6a3e1395-d2de-4994-be07-3e6e284371d9" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="30896ae2-cd16-4e98-aa6b-a87a7f062068" data-file-name="app/dashboard/students/add/page.tsx">
                  Jenis Kelamin
                </span></label>
                <select id="gender" name="gender" value={studentData.gender} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white" required data-unique-id="508dc4dc-5f40-4af6-898f-4de0a8cfebb2" data-file-name="app/dashboard/students/add/page.tsx">
                  <option value="male" data-unique-id="2356d54e-9ded-4a7e-b930-1665728554ad" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="451fb718-9247-440c-be19-e9bb3839a5c3" data-file-name="app/dashboard/students/add/page.tsx">Laki-laki</span></option>
                  <option value="female" data-unique-id="d9b0ba1d-beff-4d5d-bf1c-1db966737a10" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="d3038817-5080-4cbb-a52f-876fce3d9044" data-file-name="app/dashboard/students/add/page.tsx">Perempuan</span></option>
                </select>
              </div>
              
              <div data-unique-id="658e05d2-4c79-4044-98d8-a82a1549eebd" data-file-name="app/dashboard/students/add/page.tsx">
                <label htmlFor="birthPlace" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="9f9db36d-96f2-4825-8d00-de0ec586b543" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="a2b15b51-d47f-4ca8-8829-bc5b1a3e0b76" data-file-name="app/dashboard/students/add/page.tsx">
                  Tempat Lahir
                </span></label>
                <div className="relative" data-unique-id="b2136dab-24ef-40a3-a84b-99b00ba13bfe" data-file-name="app/dashboard/students/add/page.tsx">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="text" id="birthPlace" name="birthPlace" value={studentData.birthPlace} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white" placeholder="Tempat lahir" required data-unique-id="33fbb020-12af-454b-b204-f730521fe60a" data-file-name="app/dashboard/students/add/page.tsx" />
                </div>
              </div>
              
              <div data-unique-id="66067099-10e6-443f-a9ef-e535affb919d" data-file-name="app/dashboard/students/add/page.tsx">
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="28c1738a-9304-4ccd-ba1f-5d3a759f0845" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="0238de56-02a8-46a2-8fd5-fa68dcf62c40" data-file-name="app/dashboard/students/add/page.tsx">
                  Tanggal Lahir
                </span></label>
                <div className="relative" data-unique-id="f8a12912-4cde-4123-afca-aadde961052d" data-file-name="app/dashboard/students/add/page.tsx">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} data-unique-id="36d15484-2076-47f4-8f76-e1cec8649be0" data-file-name="app/dashboard/students/add/page.tsx" />
                  <input type="date" id="birthDate" name="birthDate" value={studentData.birthDate} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white" required data-unique-id="811e0af0-cc35-41fb-970b-5107d8e41511" data-file-name="app/dashboard/students/add/page.tsx" />
                </div>
              </div>
              
              <div data-unique-id="19d86d40-4252-47ca-8078-210bc4fec821" data-file-name="app/dashboard/students/add/page.tsx">
                <label htmlFor="telegramNumber" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="6ab13ad5-68c3-4469-9a6d-907423d2bc37" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="bd5e43b1-1e0b-46df-8a6a-7b1793f7f167" data-file-name="app/dashboard/students/add/page.tsx">
                  Nomor Telegram
                </span></label>
                <div className="relative" data-unique-id="0b386fc1-bee4-4bde-9b8f-70cae878eb51" data-file-name="app/dashboard/students/add/page.tsx">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="text" id="telegramNumber" name="telegramNumber" value={studentData.telegramNumber} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white" placeholder="Nomor Telegram" required data-unique-id="197a87a3-eca5-45a4-8c52-90be16746b27" data-file-name="app/dashboard/students/add/page.tsx" />
                </div>
              </div>
            </div>
            
            {/* QR Code Preview */}
            {studentData.nisn && <div className="flex flex-col items-center pt-4 border-t border-gray-200" data-unique-id="985bae30-dfac-4847-b1ce-0993ca857c31" data-file-name="app/dashboard/students/add/page.tsx">
                <h3 className="text-lg font-medium text-gray-700 mb-3" data-unique-id="f184734a-c617-4e16-b7fa-b19c4b019346" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="f16479c5-fcd8-497f-b2ed-62f064a1a389" data-file-name="app/dashboard/students/add/page.tsx">Preview QR Code</span></h3>
                <div className="bg-white p-4 border border-gray-300 rounded-lg" data-unique-id="079b2691-8484-4a50-9564-e9b74d21b5b2" data-file-name="app/dashboard/students/add/page.tsx">
                  <QRCodeSVG value={studentData.nisn} size={150} level="H" includeMargin={true} />
                </div>
                <p className="text-sm text-gray-500 mt-2" data-unique-id="caacb48b-7b1e-4d5f-8f50-3d93de5ea98d" data-file-name="app/dashboard/students/add/page.tsx"><span className="editable-text" data-unique-id="1c28b05d-bb7e-4fd6-8a92-bd6c3033cc95" data-file-name="app/dashboard/students/add/page.tsx">QR Code dibuat berdasarkan NISN siswa.</span></p>
              </div>}
            
            <div className="flex justify-end" data-unique-id="1f592434-8613-4323-b0c5-c2f1353651f1" data-file-name="app/dashboard/students/add/page.tsx">
              <button type="submit" disabled={saving} className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors" data-unique-id="2b65c5c4-18cc-4d12-aea0-367f7c157777" data-file-name="app/dashboard/students/add/page.tsx" data-dynamic-text="true">
                {saving ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" data-unique-id="58f8292b-1ada-4a0e-a860-60c62cf2767a" data-file-name="app/dashboard/students/add/page.tsx"></div> : <Save size={20} />}<span className="editable-text" data-unique-id="2a35003a-fe7a-4e5f-9e2a-74841339884d" data-file-name="app/dashboard/students/add/page.tsx">
                Simpan
              </span></button>
            </div>
          </div>
        </form>
      </div>
    </div>;
}