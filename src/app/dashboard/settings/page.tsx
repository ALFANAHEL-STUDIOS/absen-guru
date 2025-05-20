"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Settings as SettingsIcon, Save, Trash2, Bell, Moon, Sun, Globe, Shield, Users, Lock, Database, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
export default function Settings() {
  const {
    userRole
  } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    telegramNotifications: true,
    dailySummary: true,
    absenceAlerts: true
  });
  const [displaySettings, setDisplaySettings] = useState({
    theme: "light",
    language: "id",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h"
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: "30m",
    ipRestriction: false
  });
  const handleNotificationChange = e => {
    const {
      name,
      checked
    } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  const handleDisplayChange = e => {
    const {
      name,
      value
    } = e.target;
    setDisplaySettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSecurityChange = e => {
    const {
      name,
      checked,
      value,
      type
    } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };
  const handleSaveSettings = async () => {
    setSaveLoading(true);
    try {
      // Simulating API call to save settings
      await new Promise(resolve => setTimeout(resolve, 800));

      // Save settings logic would go here

      setSaveSuccess(true);
      toast.success("Pengaturan berhasil disimpan");
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    } catch (error) {
      toast.error("Gagal menyimpan pengaturan");
    } finally {
      setSaveLoading(false);
    }
  };
  const handleResetSettings = () => {
    if (confirm("Apakah Anda yakin ingin mengatur ulang semua pengaturan ke default?")) {
      setNotificationSettings({
        emailNotifications: true,
        smsNotifications: false,
        telegramNotifications: true,
        dailySummary: true,
        absenceAlerts: true
      });
      setDisplaySettings({
        theme: "light",
        language: "id",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "24h"
      });
      setSecuritySettings({
        twoFactorAuth: false,
        sessionTimeout: "30m",
        ipRestriction: false
      });
      toast.success("Pengaturan berhasil diatur ulang");
    }
  };

  // Redirect if not admin
  useEffect(() => {
    if (userRole !== 'admin') {
      toast.error("Anda tidak memiliki akses ke halaman ini");
      window.location.href = '/dashboard';
    }
  }, [userRole]);
  return <div className="pb-20 md:pb-6" data-unique-id="740f1c6e-7ede-4d18-ae73-7f5561ef9819" data-file-name="app/dashboard/settings/page.tsx" data-dynamic-text="true">
      <div className="flex items-center mb-6" data-unique-id="7813d5c9-00ba-4b83-907f-f2cedee4fa97" data-file-name="app/dashboard/settings/page.tsx">
        <SettingsIcon className="h-7 w-7 text-primary mr-3" />
        <h1 className="text-2xl font-bold text-gray-800" data-unique-id="1807bc87-f617-413a-bb87-e240e3605c47" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="868ab795-8208-46d1-b1a0-3a36123d9490" data-file-name="app/dashboard/settings/page.tsx">Pengaturan Sistem</span></h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-unique-id="96a254ce-d53b-43af-9e64-1afe14073536" data-file-name="app/dashboard/settings/page.tsx" data-dynamic-text="true">
        {/* Notification Settings */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl shadow-sm p-6 border-t-4 border-blue-500" data-unique-id="b026fd9c-8a3c-4183-b8d9-91d323307a6e" data-file-name="app/dashboard/settings/page.tsx">
          <div className="flex items-center mb-5" data-unique-id="efa1b4b6-cff2-439a-a771-0763ccd1d8b7" data-file-name="app/dashboard/settings/page.tsx">
            <Bell className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold" data-unique-id="63e4e8e8-e556-407c-9004-08b0088e6876" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="e6fc7ef1-79dd-495f-9fa5-ba2f61e6067d" data-file-name="app/dashboard/settings/page.tsx">Notifikasi</span></h2>
          </div>
          
          <div className="space-y-4" data-unique-id="760e200d-e400-4386-b985-0cc1cee78ef0" data-file-name="app/dashboard/settings/page.tsx">
            <div className="flex items-center justify-between" data-unique-id="e6b0f085-235f-4c18-a88c-db1a94fa6e4b" data-file-name="app/dashboard/settings/page.tsx">
              <label htmlFor="emailNotifications" className="text-sm font-medium" data-unique-id="3b592972-79bf-4df7-a7c9-ca89fdacb63a" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="6d4f0874-9a68-409c-aed9-a78448170f40" data-file-name="app/dashboard/settings/page.tsx">
                Notifikasi Email
              </span></label>
              <label className="relative inline-flex items-center cursor-pointer" data-unique-id="c10076c8-861b-4a51-92f3-c1dc17ccde88" data-file-name="app/dashboard/settings/page.tsx">
                <input type="checkbox" id="emailNotifications" name="emailNotifications" className="sr-only peer" checked={notificationSettings.emailNotifications} onChange={handleNotificationChange} data-unique-id="a9ea81d4-f8d0-4c85-b51b-c92b963a1deb" data-file-name="app/dashboard/settings/page.tsx" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" data-unique-id="461f552f-a802-440a-8735-c09d04d17d4f" data-file-name="app/dashboard/settings/page.tsx"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between" data-unique-id="83ca474e-10ff-4aab-841f-08978e8d25de" data-file-name="app/dashboard/settings/page.tsx">
              <label htmlFor="smsNotifications" className="text-sm font-medium" data-unique-id="5908c6bc-1e65-43c7-92dd-1a81bd7cea87" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="d33ccf43-5452-46d2-ac64-646c793064b6" data-file-name="app/dashboard/settings/page.tsx">
                Notifikasi SMS
              </span></label>
              <label className="relative inline-flex items-center cursor-pointer" data-unique-id="36410de4-1aa8-46e6-bea1-2a0541921441" data-file-name="app/dashboard/settings/page.tsx">
                <input type="checkbox" id="smsNotifications" name="smsNotifications" className="sr-only peer" checked={notificationSettings.smsNotifications} onChange={handleNotificationChange} data-unique-id="30663450-3fd9-4f66-b5c6-4700e9d2773e" data-file-name="app/dashboard/settings/page.tsx" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" data-unique-id="40934913-4b6e-4ae3-b569-da968bdb51e3" data-file-name="app/dashboard/settings/page.tsx"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between" data-unique-id="9b8dad9f-28c2-4506-b9e1-633a59313485" data-file-name="app/dashboard/settings/page.tsx">
              <label htmlFor="telegramNotifications" className="text-sm font-medium" data-unique-id="a666c681-bd6b-4c9c-a387-fe0e9bf293ef" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="f9c9db86-b5af-4041-8e2f-d8cea53d4123" data-file-name="app/dashboard/settings/page.tsx">
                Notifikasi Telegram
              </span></label>
              <label className="relative inline-flex items-center cursor-pointer" data-unique-id="8b02a91f-624b-49c5-a7d8-9fe325581583" data-file-name="app/dashboard/settings/page.tsx">
                <input type="checkbox" id="telegramNotifications" name="telegramNotifications" className="sr-only peer" checked={notificationSettings.telegramNotifications} onChange={handleNotificationChange} data-unique-id="2ee58df2-fb52-4e77-957f-7fcff91138c7" data-file-name="app/dashboard/settings/page.tsx" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" data-unique-id="2e3b8304-a741-4c90-972b-3cef7fd51a4a" data-file-name="app/dashboard/settings/page.tsx"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between" data-unique-id="ff1966bc-aaee-4ad6-b05b-c1d29e99a8d5" data-file-name="app/dashboard/settings/page.tsx">
              <label htmlFor="dailySummary" className="text-sm font-medium" data-unique-id="e4c9a923-a4d9-47e1-bf22-1ad36fff0f30" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="ef821356-4588-455c-9179-8ea1b0d8d93f" data-file-name="app/dashboard/settings/page.tsx">
                Ringkasan Harian
              </span></label>
              <label className="relative inline-flex items-center cursor-pointer" data-unique-id="ea6ec777-1931-4f5e-b91c-dd616f4910ec" data-file-name="app/dashboard/settings/page.tsx">
                <input type="checkbox" id="dailySummary" name="dailySummary" className="sr-only peer" checked={notificationSettings.dailySummary} onChange={handleNotificationChange} data-unique-id="b9e154c6-51a7-4909-840e-2110317f6f52" data-file-name="app/dashboard/settings/page.tsx" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" data-unique-id="b607f241-2ba8-423b-84cd-441fc388302d" data-file-name="app/dashboard/settings/page.tsx"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between" data-unique-id="b742bd8e-490a-4092-9d60-7e178f37379e" data-file-name="app/dashboard/settings/page.tsx">
              <label htmlFor="absenceAlerts" className="text-sm font-medium" data-unique-id="2ecba857-46d3-4b2d-9ebc-7069ab4e31e1" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="99e0925b-ad09-4a18-8504-fed2f023cc04" data-file-name="app/dashboard/settings/page.tsx">
                Peringatan Ketidakhadiran
              </span></label>
              <label className="relative inline-flex items-center cursor-pointer" data-unique-id="747a14ac-cbd1-4b96-b5ed-8f9071d851e3" data-file-name="app/dashboard/settings/page.tsx">
                <input type="checkbox" id="absenceAlerts" name="absenceAlerts" className="sr-only peer" checked={notificationSettings.absenceAlerts} onChange={handleNotificationChange} data-unique-id="41a3b414-5493-46c4-91fe-846160ab8253" data-file-name="app/dashboard/settings/page.tsx" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" data-unique-id="cc1ad832-45d0-4276-9c58-17ce2960feba" data-file-name="app/dashboard/settings/page.tsx"></div>
              </label>
            </div>
          </div>
        </div>
        
        {/* Display Settings */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl shadow-sm p-6 border-t-4 border-green-500" data-unique-id="31a4be08-8467-4a14-adb6-cf1425deb1cc" data-file-name="app/dashboard/settings/page.tsx">
          <div className="flex items-center mb-5" data-unique-id="46b0406b-a373-48a9-8886-6f6df57dbaff" data-file-name="app/dashboard/settings/page.tsx">
            <div className="flex items-center" data-unique-id="eeac4aa7-e020-4e64-b0c0-066882e8dc66" data-file-name="app/dashboard/settings/page.tsx">
              <Moon className="h-5 w-5 text-green-600 mr-2" />
              <Sun className="h-5 w-5 text-green-600 mr-2" />
            </div>
            <h2 className="text-lg font-semibold" data-unique-id="dba13dbf-b55d-46f9-8d6b-1ccf456da632" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="830e3e92-f6b4-4a38-a317-06081715ddd4" data-file-name="app/dashboard/settings/page.tsx">Tampilan</span></h2>
          </div>
          
          <div className="space-y-4" data-unique-id="2caa8d75-1c04-4b1c-8a2c-bff59bc021ff" data-file-name="app/dashboard/settings/page.tsx">
            <div data-unique-id="6be4111c-771c-43e9-8f7d-7dd8894fe84b" data-file-name="app/dashboard/settings/page.tsx">
              <label htmlFor="theme" className="block text-sm font-medium mb-1" data-unique-id="9fc77292-2f0a-4590-a88a-4d76f27325b9" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="a79f1fd1-9b98-4152-b4bf-6065d78a7609" data-file-name="app/dashboard/settings/page.tsx">
                Tema
              </span></label>
              <select id="theme" name="theme" value={displaySettings.theme} onChange={handleDisplayChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" data-unique-id="a6b511b9-39f8-4300-baf5-93adf57d8635" data-file-name="app/dashboard/settings/page.tsx">
                <option value="light" data-unique-id="f8cfe3f5-7a1d-4bf7-9cf6-644946c62600" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="0fce3fa3-cda8-4175-9f38-1503d827f319" data-file-name="app/dashboard/settings/page.tsx">Terang</span></option>
                <option value="dark" data-unique-id="810778ce-c8b3-4733-a57c-50256b226333" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="fa7bec00-7758-480b-882e-45c277b6d5af" data-file-name="app/dashboard/settings/page.tsx">Gelap</span></option>
                <option value="system" data-unique-id="bbadfb64-4afb-48ef-b158-46a0fc207461" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="8d470cc2-f6eb-4f0f-8bcc-83749bdc1a48" data-file-name="app/dashboard/settings/page.tsx">Sistem</span></option>
              </select>
            </div>
            
            <div data-unique-id="7b8cc8fe-4a8c-4aed-8b96-5b9df6e9a38a" data-file-name="app/dashboard/settings/page.tsx">
              <label htmlFor="language" className="block text-sm font-medium mb-1" data-unique-id="7e658d1b-c791-4403-a7f3-1bd65376de33" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="2e7abc37-af2b-47ee-92c3-ccede6ac0d76" data-file-name="app/dashboard/settings/page.tsx">
                Bahasa
              </span></label>
              <div className="flex items-center" data-unique-id="7b93d308-77b9-4133-9730-d1b03bb9ffa7" data-file-name="app/dashboard/settings/page.tsx">
                <Globe className="h-5 w-5 text-gray-400 absolute ml-3" />
                <select id="language" name="language" value={displaySettings.language} onChange={handleDisplayChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" data-unique-id="6c83411a-d324-47da-9636-fd7589a1ea61" data-file-name="app/dashboard/settings/page.tsx">
                  <option value="id" data-unique-id="4e5faa04-6e17-4587-b1ee-fdd5915b0a42" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="e6d81683-656a-46b0-81a3-3994264b79a3" data-file-name="app/dashboard/settings/page.tsx">Indonesia</span></option>
                  <option value="en" data-unique-id="b1bb696f-c283-4f14-86d1-f5f330ee12fb" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="675b3777-b872-4c5d-ba3e-db625f34eb2d" data-file-name="app/dashboard/settings/page.tsx">English</span></option>
                </select>
              </div>
            </div>
            
            <div data-unique-id="4f59acd2-4e57-4cb1-b28a-86ece2f7f90a" data-file-name="app/dashboard/settings/page.tsx">
              <label htmlFor="dateFormat" className="block text-sm font-medium mb-1" data-unique-id="d51ecf7e-1147-4fd3-b8aa-4c311c0c121f" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="97e7a492-fea1-476d-80c1-179266ab919b" data-file-name="app/dashboard/settings/page.tsx">
                Format Tanggal
              </span></label>
              <select id="dateFormat" name="dateFormat" value={displaySettings.dateFormat} onChange={handleDisplayChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" data-unique-id="46a94cda-c6f9-4842-818c-0d0d861b8873" data-file-name="app/dashboard/settings/page.tsx">
                <option value="DD/MM/YYYY" data-unique-id="49d70759-4048-4fa4-b79a-7642add72f61" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="b4b97a7f-6294-444c-96bb-887fd31a0f68" data-file-name="app/dashboard/settings/page.tsx">DD/MM/YYYY</span></option>
                <option value="MM/DD/YYYY" data-unique-id="20ec36ba-4c17-42c9-b1d3-5a02375ef3d1" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="a546a8d1-c3b7-470b-b782-3ec9a4c29e97" data-file-name="app/dashboard/settings/page.tsx">MM/DD/YYYY</span></option>
                <option value="YYYY-MM-DD" data-unique-id="3c0af8ed-048a-408e-96c5-269c081a5414" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="6180114c-6e7a-417b-b2bd-de880b312203" data-file-name="app/dashboard/settings/page.tsx">YYYY-MM-DD</span></option>
              </select>
            </div>
            
            <div data-unique-id="ae99e153-ff5d-4a35-a43b-5f4c633af3e8" data-file-name="app/dashboard/settings/page.tsx">
              <label htmlFor="timeFormat" className="block text-sm font-medium mb-1" data-unique-id="608ad00d-d202-4045-9e8c-8943540404a0" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="cca23fae-1248-4edb-b1ff-5cdad06b3f55" data-file-name="app/dashboard/settings/page.tsx">
                Format Waktu
              </span></label>
              <select id="timeFormat" name="timeFormat" value={displaySettings.timeFormat} onChange={handleDisplayChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" data-unique-id="62940ac5-ffc7-4ee0-92f4-d071d35acb51" data-file-name="app/dashboard/settings/page.tsx">
                <option value="12h" data-unique-id="95a19f5c-f29f-4002-b597-157509056e66" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="5f480693-6003-4701-9d03-ed07f5a6d2df" data-file-name="app/dashboard/settings/page.tsx">12 Jam (AM/PM)</span></option>
                <option value="24h" data-unique-id="d45fec47-faee-46ad-b663-aaa4d1d9b71a" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="9b0a8553-2608-4303-afe9-d65c5eae9172" data-file-name="app/dashboard/settings/page.tsx">24 Jam</span></option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Security Settings */}
        <div className="bg-gradient-to-r from-red-50 to-rose-100 rounded-xl shadow-sm p-6 border-t-4 border-red-500" data-unique-id="3e748d60-695b-4eca-a744-eb26309f06f7" data-file-name="app/dashboard/settings/page.tsx">
          <div className="flex items-center mb-5" data-unique-id="d6c2fc6a-3cd1-4b3f-81b3-bacc933489b4" data-file-name="app/dashboard/settings/page.tsx">
            <Shield className="h-5 w-5 text-red-600 mr-2" />
            <h2 className="text-lg font-semibold" data-unique-id="51c57526-ab64-4daa-8abb-49881c9d3d18" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="49fa0451-db90-49d2-8f55-a5da13e2793c" data-file-name="app/dashboard/settings/page.tsx">Keamanan</span></h2>
          </div>
          
          <div className="space-y-4" data-unique-id="eba94ae6-314c-4cc5-95bb-6efe5867366d" data-file-name="app/dashboard/settings/page.tsx">
            <div className="flex items-center justify-between" data-unique-id="f6f1d259-9636-4cbe-a81c-fbdad5c47e14" data-file-name="app/dashboard/settings/page.tsx">
              <label htmlFor="twoFactorAuth" className="text-sm font-medium" data-unique-id="91085c88-c11c-4b3c-a6be-a19c950fd73d" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="6582eaf5-d297-47c4-9cd7-df9db5c945fe" data-file-name="app/dashboard/settings/page.tsx">
                Autentikasi Dua Faktor
              </span></label>
              <label className="relative inline-flex items-center cursor-pointer" data-unique-id="ef071e97-e5e0-4828-945c-ba4897392af0" data-file-name="app/dashboard/settings/page.tsx">
                <input type="checkbox" id="twoFactorAuth" name="twoFactorAuth" className="sr-only peer" checked={securitySettings.twoFactorAuth} onChange={handleSecurityChange} data-unique-id="de6b30da-54f0-492d-8e6b-67009a26ae6b" data-file-name="app/dashboard/settings/page.tsx" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600" data-unique-id="0cadf4da-8b50-4f38-8b90-f6124102fc19" data-file-name="app/dashboard/settings/page.tsx"></div>
              </label>
            </div>
            
            <div data-unique-id="f6d58447-2089-4cad-ae72-ee6195276e7f" data-file-name="app/dashboard/settings/page.tsx">
              <label htmlFor="sessionTimeout" className="block text-sm font-medium mb-1" data-unique-id="8b683fff-ac0f-4615-8d12-bdc6efa5002b" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="47900e29-00b4-4002-9596-2d7e3fc74bb5" data-file-name="app/dashboard/settings/page.tsx">
                Timeout Sesi
              </span></label>
              <select id="sessionTimeout" name="sessionTimeout" value={securitySettings.sessionTimeout} onChange={handleSecurityChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" data-unique-id="d706287d-b6bc-4027-bcca-84b011607729" data-file-name="app/dashboard/settings/page.tsx">
                <option value="15m" data-unique-id="980cbb75-f552-4b1d-903e-b0f03f879363" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="fbc206b6-017e-4c88-8796-e5a1ba344433" data-file-name="app/dashboard/settings/page.tsx">15 menit</span></option>
                <option value="30m" data-unique-id="479198ca-a152-436d-8e07-82dddfdc368b" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="3c165b57-484e-4791-b7f0-2618ad42c08b" data-file-name="app/dashboard/settings/page.tsx">30 menit</span></option>
                <option value="1h" data-unique-id="baa0f9cb-376a-448c-8d75-2ccb7d58ca53" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="e9622771-9b89-4216-ba70-003b853273e4" data-file-name="app/dashboard/settings/page.tsx">1 jam</span></option>
                <option value="3h" data-unique-id="e40398be-a815-4e2d-8f5f-331d5e18c34b" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="091c44d0-5c4e-41a6-ae23-faf7aafd3fbc" data-file-name="app/dashboard/settings/page.tsx">3 jam</span></option>
                <option value="8h" data-unique-id="ac10d56e-9da0-4144-8ded-669eb27300bb" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="21a67a78-64c5-46d3-8edf-f37479f2dadd" data-file-name="app/dashboard/settings/page.tsx">8 jam</span></option>
              </select>
            </div>
            
            <div className="flex items-center justify-between" data-unique-id="926bf720-cab1-45e8-9619-7c6ceb6cb617" data-file-name="app/dashboard/settings/page.tsx">
              <label htmlFor="ipRestriction" className="text-sm font-medium" data-unique-id="38ea0e01-7491-4830-93c4-9f9b0d659d1e" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="49afd417-0a75-4b21-add4-daabcdc4e09e" data-file-name="app/dashboard/settings/page.tsx">
                Pembatasan IP
              </span></label>
              <label className="relative inline-flex items-center cursor-pointer" data-unique-id="d27c6d5e-9575-4252-bc33-90d517b6c4dd" data-file-name="app/dashboard/settings/page.tsx">
                <input type="checkbox" id="ipRestriction" name="ipRestriction" className="sr-only peer" checked={securitySettings.ipRestriction} onChange={handleSecurityChange} data-unique-id="e52ad8a7-7310-4ebe-9b52-f24e15fda8ab" data-file-name="app/dashboard/settings/page.tsx" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600" data-unique-id="b4bf37b0-39f4-4ded-8e5b-f76f65ff0293" data-file-name="app/dashboard/settings/page.tsx"></div>
              </label>
            </div>
            
            <div className="pt-4" data-unique-id="ec16d1cd-413a-42d0-a9c9-33724675f16f" data-file-name="app/dashboard/settings/page.tsx">
              <button type="button" className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2" data-unique-id="2e3dca10-d12d-46e4-b564-349b1e496a08" data-file-name="app/dashboard/settings/page.tsx">
                <Lock size={16} />
                <span data-unique-id="99417b6a-81d3-4540-83dc-dc7af3c24438" data-file-name="app/dashboard/settings/page.tsx"><span className="editable-text" data-unique-id="c2070713-538c-44c5-b46c-0c2712f5b1a9" data-file-name="app/dashboard/settings/page.tsx">Ubah Password</span></span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-between mt-6" data-unique-id="5a3f67e1-7d8f-4bc2-b5fa-1a7949da1017" data-file-name="app/dashboard/settings/page.tsx">
        <button type="button" onClick={handleResetSettings} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2" data-unique-id="1438e384-1769-4b5c-bee0-9d5b78995576" data-file-name="app/dashboard/settings/page.tsx">
          <Trash2 size={18} /><span className="editable-text" data-unique-id="6d23cc38-9336-40f7-a111-7e5477508dfa" data-file-name="app/dashboard/settings/page.tsx">
          Reset Default
        </span></button>
        
        <motion.button type="button" onClick={handleSaveSettings} disabled={saveLoading} className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 min-w-[180px]" whileTap={{
        scale: 0.95
      }} data-unique-id="b81b9e8a-3347-48d4-8c9b-7dbd3947ebbf" data-file-name="app/dashboard/settings/page.tsx" data-dynamic-text="true">
          {saveLoading ? <Loader2 size={18} className="animate-spin" /> : saveSuccess ? <CheckCircle size={18} /> : <Save size={18} />}
          {saveSuccess ? "Tersimpan" : "Simpan Pengaturan"}
        </motion.button>
      </div>
    </div>;
}