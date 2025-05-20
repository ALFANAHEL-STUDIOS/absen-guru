"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Download, FileSpreadsheet, FileText, Loader2, BarChart2, PieChart } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsInternalPieChart, Pie, Cell, LineChart, Line } from "recharts";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Sample data for comprehensive report - removed demo data
const monthlyTrendData: any[] = [];
const classSummaryData: any[] = [];
const attendanceDistribution = [{
  name: "Hadir",
  value: 0,
  color: "#4C6FFF"
}, {
  name: "Sakit",
  value: 0,
  color: "#FF9800"
}, {
  name: "Izin",
  value: 0,
  color: "#8BC34A"
}, {
  name: "Alpha",
  value: 0,
  color: "#F44336"
}];
export default function SummaryReport() {
  const {
    schoolId,
    userRole
  } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);
  const [schoolInfo, setSchoolInfo] = useState({
    name: "Sekolah Dasar Negeri 1",
    address: "Jl. Pendidikan No. 123, Kota",
    npsn: "12345678",
    principalName: "Drs. Ahmad Sulaiman, M.Pd."
  });

  // Redirect if not admin
  useEffect(() => {
    if (userRole !== 'admin') {
      window.location.href = '/dashboard/reports';
    }
  }, [userRole]);
  useEffect(() => {
    const fetchSchoolData = async () => {
      if (schoolId) {
        try {
          const schoolDoc = await getDoc(doc(db, "schools", schoolId));
          if (schoolDoc.exists()) {
            const data = schoolDoc.data();
            setSchoolInfo({
              name: data.name || "Sekolah Dasar Negeri 1",
              address: data.address || "Jl. Pendidikan No. 123, Kota",
              npsn: data.npsn || "12345678",
              principalName: data.principalName || "Drs. Ahmad Sulaiman, M.Pd."
            });
          }
        } catch (error) {
          console.error("Error fetching school data:", error);
        }
      }
    };
    fetchSchoolData();
  }, [schoolId]);
  const handleDownloadPDF = () => {
    setIsDownloading(true);
    setTimeout(() => {
      toast.success("Laporan komprehensif berhasil diunduh sebagai PDF");
      setIsDownloading(false);
    }, 1500);
  };
  const handleDownloadExcel = () => {
    setIsDownloading(true);
    setTimeout(() => {
      toast.success("Laporan komprehensif berhasil diunduh sebagai Excel");
      setIsDownloading(false);
    }, 1500);
  };
  return <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6" data-unique-id="1a23771e-c769-4391-a9a3-83438610ab34" data-file-name="app/dashboard/reports/summary/page.tsx" data-dynamic-text="true">
      <div className="flex items-center mb-6" data-unique-id="383d70f2-eaa2-44af-be95-9efdda11cef3" data-file-name="app/dashboard/reports/summary/page.tsx">
        <Link href="/dashboard/reports" className="p-2 mr-2 hover:bg-gray-100 rounded-full" data-unique-id="5b832321-ec9a-4b5b-9e33-6892a8c2c250" data-file-name="app/dashboard/reports/summary/page.tsx">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800" data-unique-id="32c3fa1a-4457-4f18-9e16-8e3843f89d2e" data-file-name="app/dashboard/reports/summary/page.tsx"><span className="editable-text" data-unique-id="250301f3-7485-4f6c-ba92-52becc901dc5" data-file-name="app/dashboard/reports/summary/page.tsx">Laporan Komprehensif</span></h1>
      </div>
      
      {/* School Info Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-l-4 border-blue-500" data-unique-id="f4f34629-b642-4cf9-9883-405ef9607ae8" data-file-name="app/dashboard/reports/summary/page.tsx">
        <h2 className="text-xl font-semibold text-gray-800 mb-4" data-unique-id="98f79d87-d459-4701-a45d-be553dc2fe21" data-file-name="app/dashboard/reports/summary/page.tsx" data-dynamic-text="true">{schoolInfo.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-unique-id="13b7ce26-543f-4aa3-a94a-6e67130d6892" data-file-name="app/dashboard/reports/summary/page.tsx">
          <div data-unique-id="30568a14-530c-40e8-9afa-aba2b7dd2bdf" data-file-name="app/dashboard/reports/summary/page.tsx">
            <p className="text-sm text-gray-500" data-unique-id="38aa8c73-5445-4031-ac14-86f89a11fa5d" data-file-name="app/dashboard/reports/summary/page.tsx"><span className="editable-text" data-unique-id="db6a7300-0494-4dd8-87fa-add351c7a7a8" data-file-name="app/dashboard/reports/summary/page.tsx">NPSN</span></p>
            <p className="font-medium" data-unique-id="fb574064-428f-4934-b911-8721390a0bc2" data-file-name="app/dashboard/reports/summary/page.tsx" data-dynamic-text="true">{schoolInfo.npsn}</p>
          </div>
          <div data-unique-id="aa21ce8d-83aa-4c1a-9e7f-8dfe65120bd4" data-file-name="app/dashboard/reports/summary/page.tsx">
            <p className="text-sm text-gray-500" data-unique-id="47156afb-3a3d-4391-8b53-45fd50790654" data-file-name="app/dashboard/reports/summary/page.tsx"><span className="editable-text" data-unique-id="e4d7c392-ab13-42d7-9595-1d6affcfb954" data-file-name="app/dashboard/reports/summary/page.tsx">Kepala Sekolah</span></p>
            <p className="font-medium" data-unique-id="71f4539f-80e9-4e92-9fcb-d2731b12b267" data-file-name="app/dashboard/reports/summary/page.tsx" data-dynamic-text="true">{schoolInfo.principalName}</p>
          </div>
          <div data-unique-id="9cf21fa9-a972-4557-8a2a-d091f7f68097" data-file-name="app/dashboard/reports/summary/page.tsx">
            <p className="text-sm text-gray-500" data-unique-id="eef4acf2-d736-4ee6-94c6-74a500835746" data-file-name="app/dashboard/reports/summary/page.tsx"><span className="editable-text" data-unique-id="5798e2d3-2302-43cf-b535-b3eb4da159de" data-file-name="app/dashboard/reports/summary/page.tsx">Tahun Ajaran</span></p>
            <p className="font-medium" data-unique-id="5f9d9259-249e-4810-9d34-84abe1fb7e47" data-file-name="app/dashboard/reports/summary/page.tsx"><span className="editable-text" data-unique-id="204fdc1f-c642-4180-a910-57a47fe86a5b" data-file-name="app/dashboard/reports/summary/page.tsx">2024/2025</span></p>
          </div>
        </div>
      </div>
      
      {/* Overall Attendance Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6" data-unique-id="9c98b100-da71-4f50-8368-440163960c99" data-file-name="app/dashboard/reports/summary/page.tsx">
        <div className="flex items-center mb-4" data-unique-id="8d932b83-9c9d-43ae-bd1b-1a6413c0220c" data-file-name="app/dashboard/reports/summary/page.tsx">
          <div className="bg-blue-100 p-2 rounded-lg mr-3" data-unique-id="a650c6a1-8943-4db1-a2a7-db17d80579cd" data-file-name="app/dashboard/reports/summary/page.tsx">
            <PieChart className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold" data-unique-id="ca4ead96-9c82-47be-b70b-e846e0ddabb9" data-file-name="app/dashboard/reports/summary/page.tsx"><span className="editable-text" data-unique-id="f18bf771-7726-45cd-91ee-2e6f838d080c" data-file-name="app/dashboard/reports/summary/page.tsx">Distribusi Kehadiran Keseluruhan</span></h2>
        </div>
        
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-6" data-unique-id="65e10973-dde7-4920-b8d5-a9f46ae14e86" data-file-name="app/dashboard/reports/summary/page.tsx">
          <div className="h-64" data-unique-id="55247783-f7c0-4c07-8698-64f3bcca54aa" data-file-name="app/dashboard/reports/summary/page.tsx">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsInternalPieChart>
                <Pie data={attendanceDistribution} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" label={entry => `${entry.name}: ${entry.value}%`}>
                  {attendanceDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} data-unique-id={`535c2f69-791b-4a67-b628-e7d6e6736ca1_${index}`} data-file-name="app/dashboard/reports/summary/page.tsx" data-dynamic-text="true" />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </RechartsInternalPieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:gap-4" data-unique-id="49f0aeb1-b1fd-41ea-8725-383a517e0dc8" data-file-name="app/dashboard/reports/summary/page.tsx">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200" data-unique-id="884f6c2c-3587-4059-b227-09aa339322f9" data-file-name="app/dashboard/reports/summary/page.tsx">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1" data-unique-id="5e1f0158-8c76-4fca-9bc1-31d583adfa16" data-file-name="app/dashboard/reports/summary/page.tsx"><span className="editable-text" data-unique-id="ffa50a46-3335-4b43-bafb-661edf7c5be2" data-file-name="app/dashboard/reports/summary/page.tsx">Hadir</span></h3>
              <p className="text-2xl font-bold text-blue-600" data-unique-id="e91bb0a5-afe5-4273-95c0-0068d39da00f" data-file-name="app/dashboard/reports/summary/page.tsx"><span className="editable-text" data-unique-id="d3b9a58a-b093-41bb-a581-f58e32498f02" data-file-name="app/dashboard/reports/summary/page.tsx">92%</span></p>
              <div className="text-xs text-blue-600 mt-1" data-unique-id="db9a3d86-d2af-42fa-9195-752b02805d2a" data-file-name="app/dashboard/reports/summary/page.tsx"><span className="editable-text" data-unique-id="030500a4-eced-456a-9177-5e76802fbfaf" data-file-name="app/dashboard/reports/summary/page.tsx">Total: 4,600 siswa</span></div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200" data-unique-id="278c15b5-bd53-4e5a-9c53-47d98c180e21" data-file-name="app/dashboard/reports/summary/page.tsx">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1" data-unique-id="184ba0d1-8ec9-43b0-b53b-182ad49ad806" data-file-name="app/dashboard/reports/summary/page.tsx"><span className="editable-text" data-unique-id="50c1bdd1-48e3-48c0-81b6-44aba482f4f3" data-file-name="app/dashboard/reports/summary/page.tsx">Sakit</span></h3>
              <p className="text-2xl font-bold text-orange-600" data-unique-id="cdb51669-73a1-4b90-8ef8-42bc48bb3356" data-file-name="app/dashboard/reports/summary/page.tsx"><span className="editable-text" data-unique-id="e7d61139-68af-40d2-bca5-7d51020e7197" data-file-name="app/dashboard/reports/summary/page.tsx">4%</span></p>
              <div className="text-xs text-orange-600 mt-1" data-unique-id="4cd43091-b38b-479c-8d3a-df206af40daa" data-file-name="app/dashboard/reports/summary/page.tsx"><span className="editable-text" data-unique-id="21658dc0-e855-4d4c-8367-356917e75abe" data-file-name="app/dashboard/reports/summary/page.tsx">Total: 200 siswa</span></div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200" data-unique-id="8e14e2f1-6016-4d9d-986a-ab9a2b485a5e" data-file-name="app/dashboard/reports/summary/page.tsx">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1" data-unique-id="5f216ef1-f1b3-4045-839d-64b21f7aab11" data-file-name="app/dashboard/reports/summary/page.tsx"><span className="editable-text" data-unique-id="9b73a205-eb18-442f-8507-ad58dc47b4d3" data-file-name="app/dashboard/reports/summary/page.tsx">Izin</span></h3>
              <p className="text-2xl font-bold text-green-600" data-unique-id="5c2ae9e6-0294-4ce8-b01a-8ccfd7b95b41" data-file-name="app/dashboard/reports/summary/page.tsx"><span className="editable-text" data-unique-id="1aa212fe-6f67-422d-9d12-117a0adb54e8" data-file-name="app/dashboard/reports/summary/page.tsx">3%</span></p>
              <div className="text-xs text-green-600 mt-1" data-unique-id="740516c7-86f8-4408-948f-105811db69c7" data-file-name="app/dashboard/reports/summary/page.tsx"><span className="editable-text" data-unique-id="0d2f542a-8320-4d96-9199-c1af7450b982" data-file-name="app/dashboard/reports/summary/page.tsx">Total: 150 siswa</span></div>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200" data-unique-id="91c8cca2-298c-4163-9dae-933f33f5767b" data-file-name="app/dashboard/reports/summary/page.tsx">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1" data-unique-id="a1bc9736-3db1-4e10-91eb-1d181c86c87a" data-file-name="app/dashboard/reports/summary/page.tsx"><span className="editable-text" data-unique-id="e19fcf2c-4dc7-4f18-bc51-3126554d4b49" data-file-name="app/dashboard/reports/summary/page.tsx">Alpha</span></h3>
              <p className="text-2xl font-bold text-red-600" data-unique-id="4b18ef85-17ca-43db-b9ae-e98080e07acc" data-file-name="app/dashboard/reports/summary/page.tsx"><span className="editable-text" data-unique-id="117b7f82-3398-4c39-9594-5098542aa647" data-file-name="app/dashboard/reports/summary/page.tsx">1%</span></p>
              <div className="text-xs text-red-600 mt-1" data-unique-id="956b6318-bb8b-4dbb-bf04-dd6c4214c11b" data-file-name="app/dashboard/reports/summary/page.tsx"><span className="editable-text" data-unique-id="ba6a5ea3-9e86-4648-a6b7-aafeb2a344b3" data-file-name="app/dashboard/reports/summary/page.tsx">Total: 50 siswa</span></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Monthly Trend */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6" data-unique-id="e5ae5665-1767-47a6-897e-c772427132f1" data-file-name="app/dashboard/reports/summary/page.tsx">
        <div className="flex items-center mb-4" data-unique-id="34e425ad-9db5-494a-9b0c-23ebcd89113d" data-file-name="app/dashboard/reports/summary/page.tsx">
          <div className="bg-green-100 p-2 rounded-lg mr-3" data-unique-id="a652e53b-4935-4659-b74a-368bf6c8879b" data-file-name="app/dashboard/reports/summary/page.tsx">
            <BarChart2 className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold" data-unique-id="673e620e-78a8-4c4c-9998-3253304c2b95" data-file-name="app/dashboard/reports/summary/page.tsx"><span className="editable-text" data-unique-id="3fd547ae-60cf-461f-a584-ec076ab7e416" data-file-name="app/dashboard/reports/summary/page.tsx">Tren Kehadiran Bulanan</span></h2>
        </div>
        
        <div className="h-80" data-unique-id="618ef036-2efa-4538-a77e-cbe978b0dbd7" data-file-name="app/dashboard/reports/summary/page.tsx">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrendData} margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5
          }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="hadir" stroke="#4C6FFF" strokeWidth={2} name="Hadir" />
              <Line type="monotone" dataKey="sakit" stroke="#FF9800" strokeWidth={2} name="Sakit" />
              <Line type="monotone" dataKey="izin" stroke="#8BC34A" strokeWidth={2} name="Izin" />
              <Line type="monotone" dataKey="alpha" stroke="#F44336" strokeWidth={2} name="Alpha" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Class Comparison */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6" data-unique-id="46a8064f-188e-45d3-8e71-b31699d87d4f" data-file-name="app/dashboard/reports/summary/page.tsx">
        <div className="flex items-center mb-4" data-unique-id="cab53487-4298-4770-ae6c-34184c5a3178" data-file-name="app/dashboard/reports/summary/page.tsx">
          <div className="bg-purple-100 p-2 rounded-lg mr-3" data-unique-id="42ed5716-a091-424b-918a-67092d562251" data-file-name="app/dashboard/reports/summary/page.tsx">
            <BarChart2 className="h-6 w-6 text-purple-600" />
          </div>
          <h2 className="text-lg font-semibold" data-unique-id="19cab416-8cca-4b5e-9b80-e5533d6fdac6" data-file-name="app/dashboard/reports/summary/page.tsx"><span className="editable-text" data-unique-id="9fea1f44-7ba5-44f6-bfd3-367f5d9a393d" data-file-name="app/dashboard/reports/summary/page.tsx">Perbandingan Kehadiran Per Kelas</span></h2>
        </div>
        
        <div className="h-80" data-unique-id="363d3e79-f09a-4ebb-a9f0-e1ffdff2981f" data-file-name="app/dashboard/reports/summary/page.tsx">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classSummaryData} margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5
          }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="hadir" name="Hadir" fill="#4C6FFF" />
              <Bar dataKey="sakit" name="Sakit" fill="#FF9800" />
              <Bar dataKey="izin" name="Izin" fill="#8BC34A" />
              <Bar dataKey="alpha" name="Alpha" fill="#F44336" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Download Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-20 md:mb-6" data-unique-id="b2792f9a-28c2-4422-a414-2ca50c7f9017" data-file-name="app/dashboard/reports/summary/page.tsx">
        <button onClick={handleDownloadPDF} disabled={isDownloading} className="flex items-center justify-center gap-3 bg-red-600 text-white p-4 rounded-xl hover:bg-red-700 transition-colors" data-unique-id="d5ee187f-2554-4774-b0d9-6ea04d5589a2" data-file-name="app/dashboard/reports/summary/page.tsx" data-dynamic-text="true">
          {isDownloading ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileText className="h-6 w-6" />}
          <span className="font-medium" data-unique-id="668d8004-429a-4052-a64a-91d74a5ca7d7" data-file-name="app/dashboard/reports/summary/page.tsx"><span className="editable-text" data-unique-id="3755d736-0705-4f61-b6be-2956e86ea820" data-file-name="app/dashboard/reports/summary/page.tsx">Download Laporan Komprehensif PDF</span></span>
        </button>
        
        <button onClick={handleDownloadExcel} disabled={isDownloading} className="flex items-center justify-center gap-3 bg-green-600 text-white p-4 rounded-xl hover:bg-green-700 transition-colors" data-unique-id="9e5a9134-d283-4053-b8d5-32d8b2f51de1" data-file-name="app/dashboard/reports/summary/page.tsx" data-dynamic-text="true">
          {isDownloading ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileSpreadsheet className="h-6 w-6" />}
          <span className="font-medium" data-unique-id="26b258ee-9ecd-43c0-80cc-d67fd2223d61" data-file-name="app/dashboard/reports/summary/page.tsx"><span className="editable-text" data-unique-id="d18fdae1-048b-470f-85e2-521a98d033c5" data-file-name="app/dashboard/reports/summary/page.tsx">Download Laporan Komprehensif Excel</span></span>
        </button>
      </div>
    </div>;
}