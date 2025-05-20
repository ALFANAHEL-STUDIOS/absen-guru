"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { readDocuments, deleteDocument } from "@/lib/firestore";
import { where, orderBy } from "firebase/firestore";
import Link from "next/link";
import { Search, Plus, QrCode, ExternalLink, Filter, Upload, AlertTriangle, Trash2, Edit, Users } from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import dynamic from 'next/dynamic';
const ConfirmDialog = dynamic(() => import('@/components/ConfirmDialog'), {
  ssr: false
});
interface Student {
  id: string;
  name: string;
  nisn: string;
  class: string;
  gender: string;
  photoUrl: string;
}
export default function Students() {
  const {
    schoolId,
    userRole
  } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [classes, setClasses] = useState<string[]>([]);
  const [filteredAttendanceData, setFilteredAttendanceData] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  useEffect(() => {
    const fetchStudents = async () => {
      if (!schoolId) return;
      try {
        const {
          studentApi
        } = await import('@/lib/api');
        const fetchedStudents = (await studentApi.getAll(schoolId)) as Student[];
        const fetchedClasses = new Set<string>();
        fetchedStudents.forEach(student => {
          fetchedClasses.add(student.class);
        });

        // Map to ensure all students have the required fields
        const normalizedStudents = fetchedStudents.map(student => ({
          ...student,
          photoUrl: student.photoUrl || "/placeholder-student.jpg"
        }));
        setStudents(normalizedStudents);
        setClasses(Array.from(fetchedClasses).sort());
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    fetchStudents();
  }, [schoolId]);

  // Function to delete a student
  const handleDeleteStudent = async (studentId: string) => {
    if (!schoolId) return;
    setStudentToDelete(null);
    setDeleteDialogOpen(false);
    try {
      const {
        studentApi
      } = await import('@/lib/api');
      await studentApi.delete(schoolId, studentId);

      // Update the local state to remove the deleted student
      setStudents(students.filter(student => student.id !== studentId));

      // Show confirmation toast
      toast.success("Data siswa berhasil dihapus");
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Gagal menghapus data siswa");
    }
  };
  const openDeleteDialog = (studentId: string) => {
    setStudentToDelete(studentId);
    setDeleteDialogOpen(true);
  };
  const filteredStudents = students.filter(student => {
    // Filter by class
    if (selectedClass !== "all" && student.class !== selectedClass) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      return student.name.toLowerCase().includes(searchQuery.toLowerCase()) || student.nisn.includes(searchQuery);
    }
    return true;
  });

  // Loading state removed

  return <div className="pb-20 md:pb-6" data-unique-id="e305c6a5-e3c5-492e-abae-fff82a3571d0" data-file-name="app/dashboard/students/page.tsx" data-dynamic-text="true">
      <div className="flex flex-col items-center mb-6" data-unique-id="b95a3fa3-3747-43fc-93e7-2cb72c5c9eb5" data-file-name="app/dashboard/students/page.tsx" data-dynamic-text="true">
        <div className="flex flex-col md:flex-row md:justify-center md:items-center w-full" data-unique-id="4fabbf1b-d727-4971-85cf-a61cb4fe1e14" data-file-name="app/dashboard/students/page.tsx">
          <div className="flex items-center justify-center mb-3" data-unique-id="bdf72dcd-2ed5-4948-b9ce-c20cade25c7d" data-file-name="app/dashboard/students/page.tsx">
            <Users className="h-7 w-7 text-primary mr-3" />
            <h1 className="text-2xl font-bold text-gray-800 text-center" data-unique-id="61f27470-785f-4606-bc8c-6a36d8cde6cb" data-file-name="app/dashboard/students/page.tsx"><span className="editable-text" data-unique-id="f4762260-1db5-4d45-bad4-84f0cbbf85a4" data-file-name="app/dashboard/students/page.tsx">DAFTAR PESERTA DIDIK</span></h1>
          </div>
        </div>
        {userRole === 'admin' && <div className="flex flex-col sm:flex-row gap-2" data-unique-id="e3b4445c-7520-4315-9356-ede79bfe7529" data-file-name="app/dashboard/students/page.tsx">
            <Link href="/dashboard/students/add" className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2 rounded-lg hover:bg-orange-500 active:bg-orange-600 transition-colors shadow-sm text-sm w-full sm:w-auto" data-unique-id="bb4bc7e4-f93e-4677-8517-0dad49daadc6" data-file-name="app/dashboard/students/page.tsx">
              <Plus size={16} /><span className="editable-text" data-unique-id="0214b259-7821-44c2-aa1e-c84b636e8b3f" data-file-name="app/dashboard/students/page.tsx">
              Tambah Data Siswa
            </span></Link>
          </div>}
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 md:p-5 mb-4 sm:mb-6" data-unique-id="f25d8d7f-efda-4663-b2d1-19bc714931d0" data-file-name="app/dashboard/students/page.tsx">
        <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:gap-4" data-unique-id="291cb7c0-8ed0-41ae-aa0c-ad5b3b502883" data-file-name="app/dashboard/students/page.tsx">
          <div className="flex-1" data-unique-id="8886dc0f-c41f-4994-b1c9-6c10bfb702a7" data-file-name="app/dashboard/students/page.tsx">
            <div className="relative" data-unique-id="f77535a5-4e01-43a4-87d2-d62f45137f92" data-file-name="app/dashboard/students/page.tsx">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="Cari nama atau NISN siswa..." className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} data-unique-id="4b7c5665-8560-446e-8eb1-c662b752945e" data-file-name="app/dashboard/students/page.tsx" />
            </div>
          </div>
          
          <div className="md:w-72" data-unique-id="62d1e74e-53a1-4ed4-93b8-dcd15f0c713d" data-file-name="app/dashboard/students/page.tsx">
            <div className="relative" data-unique-id="f2dcae44-e2cb-4d8c-9a6a-acdc4b992f2b" data-file-name="app/dashboard/students/page.tsx">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary appearance-none bg-white" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} data-unique-id="5da0dd4a-90aa-4da6-8cbb-a2e74c897a50" data-file-name="app/dashboard/students/page.tsx" data-dynamic-text="true">
                <option value="all" data-unique-id="ee35fdba-d4cb-451b-b4b5-adabe806bfbc" data-file-name="app/dashboard/students/page.tsx"><span className="editable-text" data-unique-id="aebc917c-2420-4929-87bc-4c3a76bdf945" data-file-name="app/dashboard/students/page.tsx">Semua Kelas</span></option>
                {classes.map(className => <option key={className} value={className} data-unique-id="2051100a-81ad-45a3-b73f-10a31479ea9c" data-file-name="app/dashboard/students/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="ddbaa791-1566-4982-a29f-7b1c4376ec21" data-file-name="app/dashboard/students/page.tsx">
                    Kelas </span>{className}
                  </option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Students Grid */}
      {filteredStudents.length > 0 ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 md:gap-6" data-unique-id="5cf1e087-5afb-4aed-afbe-3282df364def" data-file-name="app/dashboard/students/page.tsx" data-dynamic-text="true">
          {filteredStudents.map((student, index) => {
        // Create an array of gradient backgrounds
        const gradients = ["bg-gradient-to-r from-blue-50 to-indigo-100", "bg-gradient-to-r from-green-50 to-emerald-100", "bg-gradient-to-r from-purple-50 to-violet-100", "bg-gradient-to-r from-pink-50 to-rose-100", "bg-gradient-to-r from-yellow-50 to-amber-100", "bg-gradient-to-r from-cyan-50 to-sky-100"];

        // Select a gradient based on the index
        const gradientClass = gradients[index % gradients.length];
        return <div key={student.id} className={`${gradientClass} rounded-xl shadow-sm overflow-hidden`} data-unique-id="7eebe413-2997-48e8-a72b-385f1cc9fd88" data-file-name="app/dashboard/students/page.tsx">
                <div className="p-4" data-unique-id="75ee52ae-7139-42ec-bc09-9a9e0d227afe" data-file-name="app/dashboard/students/page.tsx">
                  <div data-unique-id="ab9ff908-ca37-44f1-8d0c-a90b8c354814" data-file-name="app/dashboard/students/page.tsx">
                    <h3 className="font-semibold text-sm" data-unique-id="570339ab-06d0-40ba-a438-4521ef589516" data-file-name="app/dashboard/students/page.tsx" data-dynamic-text="true">{student.name}</h3>
                    <p className="text-gray-500 text-xs" data-unique-id="03967909-e531-44dd-85a5-993ad2ae68ab" data-file-name="app/dashboard/students/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="46ba50e5-1aee-4da0-a824-6555fd71568d" data-file-name="app/dashboard/students/page.tsx">NISN: </span>{student.nisn}</p>
                    <div className="flex items-center mt-1" data-unique-id="0fc6da20-203d-4dce-b84a-0dcdcd67fc96" data-file-name="app/dashboard/students/page.tsx">
                      <span className="inline-block px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded" data-unique-id="1eb24b9b-2d04-4b78-bbfd-ef8f885577bd" data-file-name="app/dashboard/students/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="784e39ed-5ff5-40cc-bea2-bb51fe5feb43" data-file-name="app/dashboard/students/page.tsx">
                        Kelas </span>{student.class}
                      </span>
                      <span className="inline-block px-1.5 py-0.5 text-xs bg-gray-100 text-gray-700 rounded ml-2" data-unique-id="f8702892-14f3-4d5e-ba90-7827deeea4de" data-file-name="app/dashboard/students/page.tsx" data-dynamic-text="true">
                        {student.gender === "male" ? "Laki-laki" : "Perempuan"}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-3" data-unique-id="552b1f2a-89f7-437e-a189-65c9052ab8d7" data-file-name="app/dashboard/students/page.tsx" data-dynamic-text="true">
                    <Link href={`/dashboard/students/${student.id}`} className="p-1.5 text-blue-600 rounded hover:bg-blue-100 hover:bg-opacity-20" title="Detail Siswa" data-unique-id="00b540e0-200d-411f-b459-0ec6e3ef1769" data-file-name="app/dashboard/students/page.tsx">
                      <ExternalLink size={16} data-unique-id={`002ab376-81aa-4650-aece-31591589aeb4_${index}`} data-file-name="app/dashboard/students/page.tsx" data-dynamic-text="true" />
                    </Link>
                    <Link href={`/dashboard/students/edit/${student.id}`} className="p-1.5 text-green-600 rounded hover:bg-green-100 hover:bg-opacity-20" title="Edit Data Siswa" data-unique-id="c5d36b98-8f63-404e-8773-437c57caaff9" data-file-name="app/dashboard/students/page.tsx">
                      <Edit size={16} data-unique-id={`3257a2a2-602a-4873-8a65-c3a8730c6542_${index}`} data-file-name="app/dashboard/students/page.tsx" data-dynamic-text="true" />
                    </Link>
                    {userRole === 'admin' && <button onClick={() => openDeleteDialog(student.id)} className="p-1.5 text-red-600 rounded hover:bg-red-100 hover:bg-opacity-20" title="Hapus Siswa" data-unique-id="eaced3e5-eabc-4532-a5bd-a2d4e87197fc" data-file-name="app/dashboard/students/page.tsx">
                        <Trash2 size={16} data-unique-id={`e367316f-82e8-4903-b172-e85f866e8bdd_${index}`} data-file-name="app/dashboard/students/page.tsx" data-dynamic-text="true" />
                      </button>}
                  </div>
                </div>
              </div>;
      })}
        </div> : <div className="bg-white rounded-xl shadow-sm p-10 text-center" data-unique-id="b7419e54-dc7a-479f-a300-29ecf258601c" data-file-name="app/dashboard/students/page.tsx">
          <div className="flex flex-col items-center" data-unique-id="870b53fc-9040-45b6-a069-3812d809f2c9" data-file-name="app/dashboard/students/page.tsx">
            <div className="bg-gray-100 rounded-full p-3 mb-4" data-unique-id="451d972a-c9c9-4c62-9ea7-3c52ec523a76" data-file-name="app/dashboard/students/page.tsx">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4" data-unique-id="061f74b0-5cb4-47a4-ae6b-b8a72e51550f" data-file-name="app/dashboard/students/page.tsx" data-dynamic-text="true">
              {searchQuery || selectedClass !== "all" ? "Tidak ada siswa yang sesuai dengan pencarian atau filter" : "Belum ada data."}
            </p>
            <Link href="/dashboard/students/add" className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-orange-500 transition-colors" data-unique-id="ed8af1c5-8b67-41e1-89ae-f3c4c7000311" data-file-name="app/dashboard/students/page.tsx"><span className="editable-text" data-unique-id="1f55b268-259d-42c3-83da-a102c8c0da40" data-file-name="app/dashboard/students/page.tsx">
              Tambah Data Siswa
            </span></Link>
          </div>
        </div>}
      
      {/* Confirmation Dialog */}
      <ConfirmDialog isOpen={deleteDialogOpen} title="Konfirmasi Hapus Data" message="Apakah Anda yakin ingin menghapus data siswa ini? Tindakan ini tidak dapat dibatalkan." confirmLabel="Hapus" cancelLabel="Batal" confirmColor="bg-red-500 hover:bg-red-600" onConfirm={() => studentToDelete && handleDeleteStudent(studentToDelete)} onCancel={() => setDeleteDialogOpen(false)} icon={<AlertTriangle size={20} className="text-red-500" />} />
    </div>;
}