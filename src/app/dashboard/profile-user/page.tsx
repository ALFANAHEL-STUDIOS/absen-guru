"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Phone, MapPin, Save, CheckCircle, Loader2, QrCode } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { updateDocument } from "@/lib/firestore";
import { useRouter } from "next/navigation";
interface UserProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
  role: string;
  avatarUrl?: string;
}
export default function UserProfile() {
  const {
    user,
    updateUserProfile
  } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [userData, setUserData] = useState<UserProfileData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    role: ""
  });
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          // Get user data from Firebase Auth
          setUserData({
            name: user.displayName || "",
            email: user.email || "",
            phone: user.phoneNumber || "",
            address: "",
            bio: "",
            role: ""
          });

          // Try to get additional user data from Firestore
          const {
            userApi
          } = await import('@/lib/api');
          const userDoc = (await userApi.getById(user.uid)) as {
            name?: string;
            phone?: string;
            address?: string;
            bio?: string;
            role?: string;
          };
          if (userDoc) {
            setUserData(prev => ({
              ...prev,
              name: user.displayName || userDoc.name || "",
              phone: user.phoneNumber || userDoc.phone || "",
              address: userDoc.address || "",
              bio: userDoc.bio || "",
              role: userDoc.role || ""
            }));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUserData();
  }, [user]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Data pengguna tidak tersedia");
      return;
    }
    try {
      setSaving(true);

      // Update user profile in Firebase Auth
      await updateUserProfile({
        displayName: userData.name
      });

      // Update user data in Firestore
      const {
        userApi
      } = await import('@/lib/api');
      await userApi.update(user.uid, {
        name: userData.name,
        phone: userData.phone,
        address: userData.address,
        bio: userData.bio
      });

      // Show success animation
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        // Redirect back to dashboard
        router.push('/dashboard');
      }, 1500);
    } catch (error) {
      console.error("Error saving user data:", error);
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return <div className="flex justify-center items-center h-64" data-unique-id="1181ad00-6739-4071-9ae1-19158de8ad1e" data-file-name="app/dashboard/profile-user/page.tsx">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>;
  }
  return <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 md:px-6 pb-24 md:pb-6" data-unique-id="fb104ce5-3cc2-4adc-9a72-8902bbedb718" data-file-name="app/dashboard/profile-user/page.tsx">
      <div className="flex items-center mb-6" data-unique-id="4cb9f6c3-3ba5-4c76-8acc-91424f69acb6" data-file-name="app/dashboard/profile-user/page.tsx">
        <User className="h-8 w-8 text-primary mr-3" />
        <h1 className="text-2xl font-bold text-gray-800" data-unique-id="f41fdfa6-6eee-434a-a0b9-6280db9a164d" data-file-name="app/dashboard/profile-user/page.tsx"><span className="editable-text" data-unique-id="bc0e45f8-03c7-4e5f-8b02-9e45cd154c8e" data-file-name="app/dashboard/profile-user/page.tsx">Profil Pengguna</span></h1>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100" data-unique-id="5edce8cf-1fa6-4917-ad89-b113499b9cbd" data-file-name="app/dashboard/profile-user/page.tsx">
        <form onSubmit={handleSubmit} data-unique-id="d2f316bf-d9a3-4827-aec1-eb4c02c66e1f" data-file-name="app/dashboard/profile-user/page.tsx">
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-6" data-unique-id="aadbfca3-e417-461c-ae38-65531b98551c" data-file-name="app/dashboard/profile-user/page.tsx">
            <div className="md:col-span-2 flex flex-col items-center justify-center mb-4" data-unique-id="18b34841-6dba-4778-af26-7063fdbe7df6" data-file-name="app/dashboard/profile-user/page.tsx">
              <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center text-gray-500 mb-3 border border-gray-300" data-unique-id="0fd2f6a9-6598-4d7f-86a2-fbb244042c0b" data-file-name="app/dashboard/profile-user/page.tsx">
                <QrCode size={48} />
              </div>
            </div>
            
            <div data-unique-id="bf7a63ae-0f8f-4dd0-b730-93ae29eaa584" data-file-name="app/dashboard/profile-user/page.tsx">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="008aaf21-88f2-458b-8df0-b5171d924367" data-file-name="app/dashboard/profile-user/page.tsx"><span className="editable-text" data-unique-id="fc4d31bf-a619-43f3-a93f-0eac9266a086" data-file-name="app/dashboard/profile-user/page.tsx">
                Nama Lengkap
              </span></label>
              <div className="relative" data-unique-id="5caa3de0-9673-4212-ab6e-35101d8d8dfb" data-file-name="app/dashboard/profile-user/page.tsx">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" id="name" name="name" value={userData.name} onChange={handleChange} className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white shadow-sm" placeholder="Nama lengkap" required data-unique-id="0b0d8ce0-a82d-4114-8206-da197bc6c630" data-file-name="app/dashboard/profile-user/page.tsx" />
              </div>
            </div>

            <div data-unique-id="1838857a-1ab2-4366-8302-01e4e9bfc920" data-file-name="app/dashboard/profile-user/page.tsx">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="60743148-c929-4b51-99d0-6636588870c7" data-file-name="app/dashboard/profile-user/page.tsx"><span className="editable-text" data-unique-id="93a0f211-bc32-4f58-9640-21c2bd437458" data-file-name="app/dashboard/profile-user/page.tsx">
                Email
              </span></label>
              <div className="relative" data-unique-id="b130919f-6e1c-4dab-b0b9-5df291bc20bf" data-file-name="app/dashboard/profile-user/page.tsx">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="email" id="email" name="email" value={userData.email} onChange={handleChange} className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white shadow-sm" placeholder="Email" required disabled data-unique-id="83d1b0a0-1df7-4d10-9bbb-d3e8186d5537" data-file-name="app/dashboard/profile-user/page.tsx" />
              </div>
              <p className="text-xs text-gray-500 mt-1" data-unique-id="a01435f5-fbfc-4234-81f3-a59fcd10f9c9" data-file-name="app/dashboard/profile-user/page.tsx"><span className="editable-text" data-unique-id="fe547008-0b78-4564-bb7b-15b58c49d889" data-file-name="app/dashboard/profile-user/page.tsx">Email tidak dapat diubah</span></p>
            </div>

            <div data-unique-id="5ae075f4-ded2-4e0a-adcc-d31b914222d0" data-file-name="app/dashboard/profile-user/page.tsx">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="9bf553cd-8450-4e76-b71e-3639dec48221" data-file-name="app/dashboard/profile-user/page.tsx"><span className="editable-text" data-unique-id="f287b579-c661-45b2-ab96-cf2af4ac7127" data-file-name="app/dashboard/profile-user/page.tsx">
                Nomor Telepon
              </span></label>
              <div className="relative" data-unique-id="bc6300a3-ded2-4d5c-8409-9035548bbec1" data-file-name="app/dashboard/profile-user/page.tsx">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" id="phone" name="phone" value={userData.phone} onChange={handleChange} className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white shadow-sm" placeholder="Nomor telepon" data-unique-id="b79c1ba9-8027-46d8-91c9-c2bed4d6c5a3" data-file-name="app/dashboard/profile-user/page.tsx" />
              </div>
            </div>

            <div data-unique-id="5a7ffdb2-5bc2-492c-b097-9703bc0783c1" data-file-name="app/dashboard/profile-user/page.tsx">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="b7021578-144e-442c-828d-5f4e8a20eb19" data-file-name="app/dashboard/profile-user/page.tsx"><span className="editable-text" data-unique-id="bc6fad2e-2273-4664-9025-3d9f308e8a96" data-file-name="app/dashboard/profile-user/page.tsx">
                Peran
              </span></label>
              <input type="text" id="role" name="role" value={userData.role === 'admin' ? 'Administrator' : userData.role === 'teacher' ? 'Guru' : 'Siswa'} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white shadow-sm" disabled data-unique-id="fa51b1d3-df6f-429b-9520-c9cf07cd3afe" data-file-name="app/dashboard/profile-user/page.tsx" />
              <p className="text-xs text-gray-500 mt-1" data-unique-id="a0c5888a-4735-44b4-af95-681fb41bf739" data-file-name="app/dashboard/profile-user/page.tsx"><span className="editable-text" data-unique-id="5c6d6e3b-c674-465e-bb78-421c248e4cbc" data-file-name="app/dashboard/profile-user/page.tsx">Peran tidak dapat diubah</span></p>
            </div>

            <div className="md:col-span-2" data-unique-id="b19eb59c-2291-417d-ae03-939923eae1b5" data-file-name="app/dashboard/profile-user/page.tsx">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="48069a55-b9df-47f6-b2d3-5189fb8e6c34" data-file-name="app/dashboard/profile-user/page.tsx"><span className="editable-text" data-unique-id="e0b29a12-2028-418a-ac6b-fd0ecbce6939" data-file-name="app/dashboard/profile-user/page.tsx">
                Alamat
              </span></label>
              <div className="relative" data-unique-id="65a14878-0f4a-402d-8aad-e444a3f23fd7" data-file-name="app/dashboard/profile-user/page.tsx">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                <textarea id="address" name="address" value={userData.address} onChange={handleChange} rows={3} className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white shadow-sm" placeholder="Alamat lengkap" data-unique-id="17a515fe-4b98-4fe1-be14-d68a16fc7dfe" data-file-name="app/dashboard/profile-user/page.tsx" />
              </div>
            </div>


            <div className="md:col-span-2 flex justify-end" data-unique-id="367977a1-5132-4dbe-a75f-5f3c8a0ff349" data-file-name="app/dashboard/profile-user/page.tsx">
              <motion.button type="submit" disabled={saving} className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors shadow-sm" whileTap={{
              scale: 0.95
            }} data-unique-id="d3962bfa-249c-44e7-878b-50fec3382698" data-file-name="app/dashboard/profile-user/page.tsx" data-dynamic-text="true">
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : saveSuccess ? <CheckCircle size={20} /> : <Save size={20} />}
                {saveSuccess ? "Tersimpan" : "Simpan"}
              </motion.button>
            </div>
          </div>
        </form>
      </div>
    </div>;
}