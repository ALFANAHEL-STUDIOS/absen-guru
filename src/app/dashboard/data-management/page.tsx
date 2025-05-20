"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Database, Upload, Download, Trash2, AlertCircle, CheckCircle, RefreshCw, Loader2, HardDrive, FileUp, FileDown, BarChart, FileCog, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
export default function DataManagement() {
  const {
    userRole
  } = useAuth();
  const [loading, setLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  // System stats
  const [systemStats, setSystemStats] = useState({
    totalStudents: 342,
    totalClasses: 12,
    totalTeachers: 24,
    databaseSize: "54.2 MB",
    lastBackup: "05/05/2025 08:30",
    storageUsed: 65,
    // percentage
    dataProcessed: "3.2 GB",
    recordsCount: 12453
  });

  // Mock recent backups
  const [backups, setBackups] = useState([{
    id: 1,
    name: "Full Backup",
    date: "05/05/2025 08:30",
    size: "54.2 MB",
    type: "automatic"
  }, {
    id: 2,
    name: "Weekly Backup",
    date: "28/04/2025 10:15",
    size: "52.8 MB",
    type: "automatic"
  }, {
    id: 3,
    name: "Manual Backup",
    date: "21/04/2025 14:22",
    size: "51.5 MB",
    type: "manual"
  }, {
    id: 4,
    name: "Weekly Backup",
    date: "21/04/2025 10:00",
    size: "51.5 MB",
    type: "automatic"
  }, {
    id: 5,
    name: "Manual Backup",
    date: "14/04/2025 09:45",
    size: "50.9 MB",
    type: "manual"
  }]);

  // Handlers for data management actions
  const handleBackupData = async () => {
    setBackupLoading(true);
    try {
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Add new backup to the list
      const newBackup = {
        id: backups.length + 1,
        name: "Manual Backup",
        date: new Date().toLocaleString('id-ID', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        size: systemStats.databaseSize,
        type: "manual"
      };
      setBackups([newBackup, ...backups]);
      toast.success("Backup database berhasil dibuat");
    } catch (error) {
      toast.error("Gagal membuat backup database");
    } finally {
      setBackupLoading(false);
    }
  };
  const handleRestoreData = backupId => {
    if (!confirm("Apakah Anda yakin ingin memulihkan database ke backup ini? Data saat ini akan tergantikan.")) {
      return;
    }
    setRestoreLoading(true);
    try {
      // Simulate restore process
      setTimeout(() => {
        toast.success("Database berhasil dipulihkan");
        setRestoreLoading(false);
      }, 2000);
    } catch (error) {
      toast.error("Gagal memulihkan database");
      setRestoreLoading(false);
    }
  };
  const handleDeleteBackup = backupId => {
    if (!confirm("Apakah Anda yakin ingin menghapus backup ini? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }
    try {
      const updatedBackups = backups.filter(backup => backup.id !== backupId);
      setBackups(updatedBackups);
      toast.success("Backup berhasil dihapus");
    } catch (error) {
      toast.error("Gagal menghapus backup");
    }
  };
  const handleExportData = () => {
    setExportLoading(true);
    try {
      // Simulate export process
      setTimeout(() => {
        toast.success("Data berhasil diekspor");
        setExportLoading(false);
      }, 1500);
    } catch (error) {
      toast.error("Gagal mengekspor data");
      setExportLoading(false);
    }
  };
  const handleImportData = () => {
    setImportLoading(true);
    try {
      // Simulate import process
      setTimeout(() => {
        toast.success("Data berhasil diimpor");
        setImportLoading(false);
      }, 1500);
    } catch (error) {
      toast.error("Gagal mengimpor data");
      setImportLoading(false);
    }
  };
  const handleOptimizeDatabase = () => {
    setLoading(true);
    try {
      // Simulate optimization process
      setTimeout(() => {
        toast.success("Database berhasil dioptimasi");
        setLoading(false);
      }, 2000);
    } catch (error) {
      toast.error("Gagal mengoptimasi database");
      setLoading(false);
    }
  };

  // Redirect if not admin
  useEffect(() => {
    if (userRole !== 'admin') {
      toast.error("Anda tidak memiliki akses ke halaman ini");
      window.location.href = '/dashboard';
    }
  }, [userRole]);
  return <div className="pb-20 md:pb-6" data-unique-id="1e6d4070-7029-49cf-b52b-1a112a201d03" data-file-name="app/dashboard/data-management/page.tsx">
      <div className="flex items-center mb-6" data-unique-id="dbd91bd5-8e6e-4c81-b00a-e412833ed9a6" data-file-name="app/dashboard/data-management/page.tsx">
        <Database className="h-7 w-7 text-primary mr-3" />
        <h1 className="text-2xl font-bold text-gray-800" data-unique-id="22f006e3-82ca-4f92-a511-847d05a7320e" data-file-name="app/dashboard/data-management/page.tsx"><span className="editable-text" data-unique-id="0de37c47-45b2-4f5f-a81e-99016cbb5146" data-file-name="app/dashboard/data-management/page.tsx">Manajemen Data</span></h1>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6" data-unique-id="7c1944ad-dc0c-4dc3-81b8-b40133e83a71" data-file-name="app/dashboard/data-management/page.tsx">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-100 rounded-xl shadow-sm border-l-4 border-blue-500 p-4 flex items-center" data-unique-id="63225213-fb54-4d72-811c-fa4bbabb99cf" data-file-name="app/dashboard/data-management/page.tsx">
          <div className="bg-blue-100 p-3 rounded-lg mr-3" data-unique-id="6fccf1c8-d781-4da3-9a62-80cd79eae989" data-file-name="app/dashboard/data-management/page.tsx">
            <HardDrive className="h-6 w-6 text-blue-600" />
          </div>
          <div data-unique-id="e3d3e2a0-e008-4a6b-b17f-2e132bb6e431" data-file-name="app/dashboard/data-management/page.tsx">
            <p className="text-sm text-gray-600" data-unique-id="47e0ba5b-344d-4220-9cfc-1a067396dfa9" data-file-name="app/dashboard/data-management/page.tsx"><span className="editable-text" data-unique-id="059fcfa5-ba52-4b79-87f6-4d00ecc49a7b" data-file-name="app/dashboard/data-management/page.tsx">Ukuran Database</span></p>
            <p className="text-xl font-bold" data-unique-id="e8e10c60-2b98-4fe3-bea0-f6b56c8d7270" data-file-name="app/dashboard/data-management/page.tsx" data-dynamic-text="true">{systemStats.databaseSize}</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl shadow-sm border-l-4 border-green-500 p-4 flex items-center" data-unique-id="8853599e-1d9c-41b9-ae20-98a789f1f8f1" data-file-name="app/dashboard/data-management/page.tsx">
          <div className="bg-green-100 p-3 rounded-lg mr-3" data-unique-id="50025db6-c864-46eb-a83e-4f52a6cf9748" data-file-name="app/dashboard/data-management/page.tsx">
            <BarChart className="h-6 w-6 text-green-600" />
          </div>
          <div data-unique-id="ee44e8f8-b8da-4318-b624-a9cd68160d30" data-file-name="app/dashboard/data-management/page.tsx">
            <p className="text-sm text-gray-600" data-unique-id="498750a2-e319-4dcc-9c3a-5bf7745fe78f" data-file-name="app/dashboard/data-management/page.tsx"><span className="editable-text" data-unique-id="eb32cdef-2308-4181-9686-27d76868e393" data-file-name="app/dashboard/data-management/page.tsx">Total Data</span></p>
            <p className="text-xl font-bold" data-unique-id="08c01d58-1ecb-4848-8553-4375fc794908" data-file-name="app/dashboard/data-management/page.tsx" data-dynamic-text="true">{systemStats.recordsCount.toLocaleString()}<span className="editable-text" data-unique-id="60f2df31-3c9c-4149-9d33-312278ba7b0f" data-file-name="app/dashboard/data-management/page.tsx"> record</span></p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-amber-50 to-yellow-100 rounded-xl shadow-sm border-l-4 border-amber-500 p-4 flex items-center" data-unique-id="9ca7e54c-bd2b-4573-8fd6-cbd8e9204569" data-file-name="app/dashboard/data-management/page.tsx">
          <div className="bg-amber-100 p-3 rounded-lg mr-3" data-unique-id="379ac514-c156-4e8c-aa48-468aaebdb23a" data-file-name="app/dashboard/data-management/page.tsx">
            <RefreshCw className="h-6 w-6 text-amber-600" />
          </div>
          <div data-unique-id="5f54de7d-d503-4ce8-9420-c38a932882b9" data-file-name="app/dashboard/data-management/page.tsx">
            <p className="text-sm text-gray-600" data-unique-id="12101659-1f37-4d55-8794-3df2bc6d0875" data-file-name="app/dashboard/data-management/page.tsx"><span className="editable-text" data-unique-id="5a81ef9c-6a2c-4dda-9e60-ec7d8f592921" data-file-name="app/dashboard/data-management/page.tsx">Backup Terakhir</span></p>
            <p className="text-xl font-bold" data-unique-id="7c849ec1-ee3c-4f45-a8f3-d56fa10366b1" data-file-name="app/dashboard/data-management/page.tsx" data-dynamic-text="true">{systemStats.lastBackup}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-unique-id="487dcea6-9e9d-41ed-b044-c01db22f5726" data-file-name="app/dashboard/data-management/page.tsx" data-dynamic-text="true">
        {/* Backup and Restore Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl shadow-sm p-6" data-unique-id="e3c1a502-7c66-4c93-97e3-9efa02c950e1" data-file-name="app/dashboard/data-management/page.tsx">
          <div className="flex items-center mb-4" data-unique-id="c53fb7b8-7940-4a90-ae24-3aa406bd5133" data-file-name="app/dashboard/data-management/page.tsx">
            <FileCog className="h-5 w-5 text-primary mr-2" />
            <h2 className="text-lg font-semibold" data-unique-id="33c11256-3925-4d82-8eb7-dda98c5361c0" data-file-name="app/dashboard/data-management/page.tsx"><span className="editable-text" data-unique-id="ae0ab1ad-8e38-4bd4-8959-5b4cbd6c308b" data-file-name="app/dashboard/data-management/page.tsx">Backup & Restore</span></h2>
          </div>
          
          <div className="flex flex-wrap gap-3 mb-6" data-unique-id="0cc436f1-f882-4662-8418-8efd641fab0d" data-file-name="app/dashboard/data-management/page.tsx">
            <button onClick={handleBackupData} disabled={backupLoading} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors" data-unique-id="dfcd8e72-469e-4d58-bfa1-6fd2a97080a7" data-file-name="app/dashboard/data-management/page.tsx" data-dynamic-text="true">
              {backupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}<span className="editable-text" data-unique-id="11d6658f-82e9-489b-8d0c-f4372a1e357f" data-file-name="app/dashboard/data-management/page.tsx">
              Backup Database
            </span></button>
            
            <button onClick={handleOptimizeDatabase} disabled={loading} className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors" data-unique-id="5db02828-2387-4836-97c4-12756937d133" data-file-name="app/dashboard/data-management/page.tsx" data-dynamic-text="true">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}<span className="editable-text" data-unique-id="72f45697-51c3-4a5d-8222-ace978b9ab4e" data-file-name="app/dashboard/data-management/page.tsx">
              Optimasi Database
            </span></button>
            
            <button onClick={handleExportData} disabled={exportLoading} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors" data-unique-id="085d9b27-7d61-477e-8b11-ccef105dbaad" data-file-name="app/dashboard/data-management/page.tsx" data-dynamic-text="true">
              {exportLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}<span className="editable-text" data-unique-id="195240e3-d863-4b8c-b763-9b9cb5c8ef6c" data-file-name="app/dashboard/data-management/page.tsx">
              Export Data
            </span></button>
            
            <button onClick={handleImportData} disabled={importLoading} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors" data-unique-id="5828b5b8-73f4-4083-a2c3-7f60d6be66b7" data-file-name="app/dashboard/data-management/page.tsx" data-dynamic-text="true">
              {importLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}<span className="editable-text" data-unique-id="ebc21502-2ae6-4d9a-a309-9c635c993ffa" data-file-name="app/dashboard/data-management/page.tsx">
              Import Data
            </span></button>
          </div>
          
          <h3 className="text-sm font-medium text-gray-600 mb-3" data-unique-id="0c72e25c-e90f-427e-9d95-c3308683e2a2" data-file-name="app/dashboard/data-management/page.tsx"><span className="editable-text" data-unique-id="d63f5e1b-8bf6-4b51-a010-c110ea84699d" data-file-name="app/dashboard/data-management/page.tsx">Backup Terbaru</span></h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto" data-unique-id="2ea24c7d-c78c-4170-8127-c0e40221c537" data-file-name="app/dashboard/data-management/page.tsx" data-dynamic-text="true">
            {backups.length > 0 ? backups.map(backup => <div key={backup.id} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center" data-unique-id="ec8ebf2a-550b-4689-87e9-6bef31dee600" data-file-name="app/dashboard/data-management/page.tsx">
                  <div className="flex items-start gap-3" data-unique-id="abb44211-26fe-4f5d-a0ee-18f42a642a96" data-file-name="app/dashboard/data-management/page.tsx">
                    <div className={`p-2 rounded-lg ${backup.type === 'automatic' ? 'bg-blue-100' : 'bg-green-100'}`} data-unique-id="88bb1bd8-88be-46ec-bccb-76294ba05837" data-file-name="app/dashboard/data-management/page.tsx">
                      <Database className={`h-5 w-5 ${backup.type === 'automatic' ? 'text-blue-600' : 'text-green-600'}`} />
                    </div>
                    <div data-unique-id="54128b7e-4f4a-4839-b41f-6f4e01a6c443" data-file-name="app/dashboard/data-management/page.tsx">
                      <p className="font-medium" data-unique-id="2ccaf201-9cdd-4a7d-b3dd-83ba093a757d" data-file-name="app/dashboard/data-management/page.tsx" data-dynamic-text="true">{backup.name}</p>
                      <p className="text-xs text-gray-500" data-unique-id="8e2e77ab-ad6f-4011-9c4a-a8a298a04d2d" data-file-name="app/dashboard/data-management/page.tsx" data-dynamic-text="true">{backup.date}</p>
                      <div className="flex items-center mt-1" data-unique-id="7f3dee5c-dbe4-4469-91d4-d6acc759cb7b" data-file-name="app/dashboard/data-management/page.tsx">
                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-700" data-unique-id="17d6f698-c254-4942-81d9-50da5ae03fef" data-file-name="app/dashboard/data-management/page.tsx" data-dynamic-text="true">{backup.size}</span>
                        <span className="text-xs ml-2 bg-gray-200 px-2 py-0.5 rounded-full text-gray-700 capitalize" data-unique-id="83321b57-8c43-4793-938e-b106fdd72fa1" data-file-name="app/dashboard/data-management/page.tsx" data-dynamic-text="true">{backup.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2" data-unique-id="f39b0fab-e96a-4b12-a7f7-013f5fb5e09d" data-file-name="app/dashboard/data-management/page.tsx">
                    <button onClick={() => handleRestoreData(backup.id)} className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100" title="Restore backup" data-unique-id="198aa87d-f3da-4f02-a6cd-fcd002cd23e9" data-file-name="app/dashboard/data-management/page.tsx">
                      <RefreshCw className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDeleteBackup(backup.id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Delete backup" data-unique-id="14d677d8-b39a-4878-b8a2-c51a46059ff6" data-file-name="app/dashboard/data-management/page.tsx">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>) : <div className="text-center py-6 text-gray-500" data-unique-id="db1cbe68-1416-41e4-9af8-bec243ca4931" data-file-name="app/dashboard/data-management/page.tsx"><span className="editable-text" data-unique-id="495621f9-3fe2-486e-aa9d-89fb5680e3cb" data-file-name="app/dashboard/data-management/page.tsx">
                Belum ada backup tersedia
              </span></div>}
          </div>
        </div>
        
        {/* Storage Usage Section */}
        <div className="bg-gradient-to-r from-purple-50 to-violet-100 rounded-xl shadow-sm p-6" data-unique-id="eba80400-d77a-49eb-affd-a4cae1156d02" data-file-name="app/dashboard/data-management/page.tsx" data-dynamic-text="true">
          <div className="flex items-center mb-4" data-unique-id="0a3eaf65-6e12-42ee-bfc8-d64531bda7bc" data-file-name="app/dashboard/data-management/page.tsx">
            <HardDrive className="h-5 w-5 text-primary mr-2" />
            <h2 className="text-lg font-semibold" data-unique-id="a3bcc5fc-4a86-4e99-9272-10b280282536" data-file-name="app/dashboard/data-management/page.tsx"><span className="editable-text" data-unique-id="be9c7858-e48c-462b-ac6d-9e798a98fb01" data-file-name="app/dashboard/data-management/page.tsx">Penggunaan Penyimpanan</span></h2>
          </div>
          
          <div className="mb-6" data-unique-id="6e5fd0c0-e9fe-451a-aaa7-f5a65acd523c" data-file-name="app/dashboard/data-management/page.tsx">
            <div className="flex justify-between mb-2" data-unique-id="67d7bc7f-ddd6-446b-9a17-5410af080206" data-file-name="app/dashboard/data-management/page.tsx">
              <span className="text-sm font-medium" data-unique-id="ce5340a3-087b-4e22-80bb-2f3d5e585000" data-file-name="app/dashboard/data-management/page.tsx"><span className="editable-text" data-unique-id="5aef0122-5909-4f78-8e09-ec2cde9754d3" data-file-name="app/dashboard/data-management/page.tsx">Status Penyimpanan</span></span>
              <span className="text-sm font-medium" data-unique-id="375740d1-ce66-4438-9f68-2a6b19ea2779" data-file-name="app/dashboard/data-management/page.tsx" data-dynamic-text="true">{systemStats.storageUsed}<span className="editable-text" data-unique-id="ea914b03-e10a-48a5-83db-ce502e7343ab" data-file-name="app/dashboard/data-management/page.tsx">% terpakai</span></span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5" data-unique-id="eaf1ceee-8ed6-418a-b7ce-6b9bcd026a9d" data-file-name="app/dashboard/data-management/page.tsx">
              <div className={`h-2.5 rounded-full ${systemStats.storageUsed > 90 ? 'bg-red-600' : systemStats.storageUsed > 75 ? 'bg-amber-500' : 'bg-green-600'}`} style={{
              width: `${systemStats.storageUsed}%`
            }} data-unique-id="73c4c379-6248-42b0-9f26-653e744ab9b8" data-file-name="app/dashboard/data-management/page.tsx"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6" data-unique-id="3f65e33f-e539-48ff-829d-eca559c5ce27" data-file-name="app/dashboard/data-management/page.tsx">
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-4 rounded-lg" data-unique-id="464d0acf-544e-4376-ae35-3dabe3643288" data-file-name="app/dashboard/data-management/page.tsx">
              <p className="text-xs text-blue-600 font-medium mb-1" data-unique-id="603e6cfa-9565-4ea2-9251-c1b974c173b2" data-file-name="app/dashboard/data-management/page.tsx"><span className="editable-text" data-unique-id="0ef9244d-54a6-4c55-97b0-b4670564a57d" data-file-name="app/dashboard/data-management/page.tsx">Data Siswa</span></p>
              <p className="text-xl font-bold" data-unique-id="8ec1cfcc-4833-407c-929b-ded545d0eb27" data-file-name="app/dashboard/data-management/page.tsx" data-dynamic-text="true">{systemStats.totalStudents}</p>
              <p className="text-xs text-gray-500 mt-1" data-unique-id="ff711b32-dbde-42f2-a1c1-1be2c2eaa59a" data-file-name="app/dashboard/data-management/page.tsx"><span className="editable-text" data-unique-id="b00824e1-2d6f-4231-9946-c3108ec425fd" data-file-name="app/dashboard/data-management/page.tsx">Total siswa tercatat</span></p>
            </div>
            
            <div className="bg-gradient-to-r from-green-100 to-green-200 p-4 rounded-lg" data-unique-id="6cb9e19e-deed-4a36-9f05-6932abb7eb27" data-file-name="app/dashboard/data-management/page.tsx">
              <p className="text-xs text-green-600 font-medium mb-1" data-unique-id="52746077-4917-4766-8488-d69db848ff6b" data-file-name="app/dashboard/data-management/page.tsx"><span className="editable-text" data-unique-id="03e9f82c-a8fb-44fb-80f7-0ee6c150aa5c" data-file-name="app/dashboard/data-management/page.tsx">Data Kelas</span></p>
              <p className="text-xl font-bold" data-unique-id="41d18536-66a2-4f3f-9e34-96d1c7093793" data-file-name="app/dashboard/data-management/page.tsx" data-dynamic-text="true">{systemStats.totalClasses}</p>
              <p className="text-xs text-gray-500 mt-1" data-unique-id="7d50aec9-4477-44ce-90a7-230c99d49b51" data-file-name="app/dashboard/data-management/page.tsx"><span className="editable-text" data-unique-id="d5a7bdf2-5d29-4796-a4f8-f6386810a5dd" data-file-name="app/dashboard/data-management/page.tsx">Total kelas tercatat</span></p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-4 rounded-lg" data-unique-id="4a911fc1-c2a4-4d02-9012-881a597f4f25" data-file-name="app/dashboard/data-management/page.tsx">
              <p className="text-xs text-purple-600 font-medium mb-1" data-unique-id="337bd0e0-a59f-4f52-90ca-bca81de8a52e" data-file-name="app/dashboard/data-management/page.tsx"><span className="editable-text" data-unique-id="eff70b81-67c1-4efd-a4bf-2eaa3513f2f4" data-file-name="app/dashboard/data-management/page.tsx">Data Guru</span></p>
              <p className="text-xl font-bold" data-unique-id="7ed3f988-2b64-48f6-825f-96a439ea5d32" data-file-name="app/dashboard/data-management/page.tsx" data-dynamic-text="true">{systemStats.totalTeachers}</p>
              <p className="text-xs text-gray-500 mt-1" data-unique-id="012fcd87-4a7b-4643-b056-0b753d8b655a" data-file-name="app/dashboard/data-management/page.tsx"><span className="editable-text" data-unique-id="473c3721-cbb1-4a6e-8d67-3c52186cf86b" data-file-name="app/dashboard/data-management/page.tsx">Total guru tercatat</span></p>
            </div>
            
            <div className="bg-gradient-to-r from-amber-100 to-amber-200 p-4 rounded-lg" data-unique-id="9ab4e92f-ee56-47c3-8ea7-611cb5620251" data-file-name="app/dashboard/data-management/page.tsx">
              <p className="text-xs text-amber-600 font-medium mb-1" data-unique-id="b9a11e63-d12d-449e-ab1f-8a9dda675099" data-file-name="app/dashboard/data-management/page.tsx"><span className="editable-text" data-unique-id="78f35f5b-0d9f-4197-994c-03bc9650630f" data-file-name="app/dashboard/data-management/page.tsx">Data Diproses</span></p>
              <p className="text-xl font-bold" data-unique-id="3c923777-5d61-448a-8e66-bea7e24be199" data-file-name="app/dashboard/data-management/page.tsx" data-dynamic-text="true">{systemStats.dataProcessed}</p>
              <p className="text-xs text-gray-500 mt-1" data-unique-id="342f02a8-455f-4fba-91cf-4771f0e22199" data-file-name="app/dashboard/data-management/page.tsx"><span className="editable-text" data-unique-id="13636a67-de97-43b5-8df1-3d1bc9d0c26b" data-file-name="app/dashboard/data-management/page.tsx">Total data diproses</span></p>
            </div>
          </div>
          
          {/* System messages */}
          <div className="space-y-3" data-unique-id="b6a6d7ee-9c4d-4858-ac26-2dd17555ea23" data-file-name="app/dashboard/data-management/page.tsx">
            <div className="flex bg-green-50 p-3 rounded-lg" data-unique-id="ed25bd68-d08f-4f34-a846-6c760d8a6efb" data-file-name="app/dashboard/data-management/page.tsx">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
              <div data-unique-id="07ea075b-94c9-4c94-9a23-8b72860651fa" data-file-name="app/dashboard/data-management/page.tsx">
                <p className="text-sm font-medium text-green-800" data-unique-id="b305aab2-cc17-44d7-a5b0-2bc4ca8a8c15" data-file-name="app/dashboard/data-management/page.tsx"><span className="editable-text" data-unique-id="277cf86f-7b62-4a8f-805d-a8ff66615e09" data-file-name="app/dashboard/data-management/page.tsx">Sistem berjalan normal</span></p>
                <p className="text-xs text-green-600" data-unique-id="dd7747a8-1395-4a08-a532-332f921ab1ac" data-file-name="app/dashboard/data-management/page.tsx"><span className="editable-text" data-unique-id="4e495b19-2083-4ca0-a54a-04a5dd2cf037" data-file-name="app/dashboard/data-management/page.tsx">Database dalam kondisi optimal</span></p>
              </div>
            </div>
            
            <div className="flex bg-amber-50 p-3 rounded-lg" data-unique-id="eaa30a59-20ea-4160-a0e8-0622aaf06644" data-file-name="app/dashboard/data-management/page.tsx">
              <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
              <div data-unique-id="7e058d74-e005-4428-b506-afb705e5fd04" data-file-name="app/dashboard/data-management/page.tsx">
                <p className="text-sm font-medium text-amber-800" data-unique-id="8726b396-f18b-470d-8232-3a20de16de0d" data-file-name="app/dashboard/data-management/page.tsx"><span className="editable-text" data-unique-id="8be55d79-abf5-4c00-9e76-d50fe4155581" data-file-name="app/dashboard/data-management/page.tsx">Backup terjadwal dalam 2 hari</span></p>
                <p className="text-xs text-amber-600" data-unique-id="38392464-b620-461c-8064-7cbc758cfca7" data-file-name="app/dashboard/data-management/page.tsx"><span className="editable-text" data-unique-id="8c8eed6f-ade6-4bcb-9e15-8b01f8467001" data-file-name="app/dashboard/data-management/page.tsx">Backup otomatis akan dilakukan pada 08/05/2025</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
}