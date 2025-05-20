"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Download, Printer, User, Calendar, MapPin, Phone, Mail, School, Hash, Edit } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
export default function StudentDetail({
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
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      if (!schoolId) return;
      try {
        // Fetch student data
        const studentDoc = await getDoc(doc(db, "schools", schoolId, "students", params.id));
        if (!studentDoc.exists()) {
          throw new Error("Student not found");
        }
        setStudent({
          id: studentDoc.id,
          ...studentDoc.data()
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [schoolId, params.id]);
  if (loading) {
    return <div className="flex justify-center items-center h-64" data-unique-id="911b0470-3961-4cb7-ba14-2e59496e7719" data-file-name="app/dashboard/students/[id]/page.tsx">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" data-unique-id="33088c39-976c-4fc9-b677-0c8514be051f" data-file-name="app/dashboard/students/[id]/page.tsx"></div>
      </div>;
  }
  if (!student) {
    return <div className="text-center py-10" data-unique-id="88aee451-1d56-4503-9ada-832d4c87614d" data-file-name="app/dashboard/students/[id]/page.tsx">
        <p className="text-red-500" data-unique-id="4ba5dc2e-c17e-4d33-9c37-69a524d768d7" data-file-name="app/dashboard/students/[id]/page.tsx"><span className="editable-text" data-unique-id="d22f9284-e957-47c5-aaea-c93c081d2bcb" data-file-name="app/dashboard/students/[id]/page.tsx">Data siswa tidak ditemukan</span></p>
        <Link href="/dashboard/students" className="text-primary hover:underline mt-2 inline-block" data-unique-id="215b6d3c-ad23-4bc5-b368-2306f44991b8" data-file-name="app/dashboard/students/[id]/page.tsx"><span className="editable-text" data-unique-id="d6c9255d-e1eb-4f8a-ba2d-efb242547bed" data-file-name="app/dashboard/students/[id]/page.tsx">
          Kembali ke daftar siswa
        </span></Link>
      </div>;
  }
  return <div className="max-w-4xl mx-auto pb-20 md:pb-6 px-3 sm:px-4 md:px-6" data-unique-id="2dfa0320-6e84-49e0-9bf4-524e8fc4f183" data-file-name="app/dashboard/students/[id]/page.tsx">
      <div className="flex items-center mb-6" data-unique-id="36844cf1-25b7-40af-976b-cc6dd8b5c35d" data-file-name="app/dashboard/students/[id]/page.tsx">
        <Link href="/dashboard/students" className="p-2 mr-2 hover:bg-gray-100 rounded-full" data-unique-id="276beefd-3611-45da-91c2-c24d73aed727" data-file-name="app/dashboard/students/[id]/page.tsx">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-800" data-unique-id="7d7df245-dc4f-4443-ad26-61c5afc7d178" data-file-name="app/dashboard/students/[id]/page.tsx"><span className="editable-text" data-unique-id="508de509-de71-4607-ae18-51932f5e2389" data-file-name="app/dashboard/students/[id]/page.tsx">Detail Siswa</span></h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-unique-id="bad7cee2-64cc-4310-8889-98914d2a7c07" data-file-name="app/dashboard/students/[id]/page.tsx" data-dynamic-text="true">
        {/* QR Code Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center" data-unique-id="8a41dfbe-b243-4624-83e9-7a035249d7c9" data-file-name="app/dashboard/students/[id]/page.tsx">
          <h2 className="text-base font-semibold mb-4 text-center" data-unique-id="93551759-bf5f-4bb8-b349-cc454c5bdece" data-file-name="app/dashboard/students/[id]/page.tsx"><span className="editable-text" data-unique-id="87adeae0-7afa-43af-a1ee-657052b292f7" data-file-name="app/dashboard/students/[id]/page.tsx">QR Code Absensi</span></h2>
          <div className="bg-white p-2 border border-gray-300 rounded-lg mb-4" data-unique-id="9a34fa82-abab-4bdd-a00a-243140fad387" data-file-name="app/dashboard/students/[id]/page.tsx">
            <QRCodeSVG value={student.nisn || student.id} size={150} level="H" includeMargin={true} />
          </div>
          <p className="text-xs text-center text-gray-500 mb-4" data-unique-id="fdfd99c9-33b7-4649-b819-432fa37ffb4f" data-file-name="app/dashboard/students/[id]/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="e0bf42b5-9ef1-44bd-8f5b-edc2ae619b79" data-file-name="app/dashboard/students/[id]/page.tsx">NISN: </span>{student.nisn}</p>
          <div className="flex flex-col space-y-2" data-unique-id="624e6eb6-6fcf-4b03-94b0-bd420d083faa" data-file-name="app/dashboard/students/[id]/page.tsx">
            <Link href={`/dashboard/students/qr/${student.id}`} className="text-sm text-primary hover:underline" data-unique-id="53e9d6e6-3df2-4587-ae90-e17923905093" data-file-name="app/dashboard/students/[id]/page.tsx"><span className="editable-text" data-unique-id="930d7455-490f-4b6d-b86a-abbc28c61fc8" data-file-name="app/dashboard/students/[id]/page.tsx">
              Lihat Kartu QR
            </span></Link>
            <Link href={`/dashboard/students/edit/${student.id}`} className="text-sm text-blue-600 hover:underline flex items-center" data-unique-id="c4e1ccd5-a879-4aa3-8db5-92593d518d6d" data-file-name="app/dashboard/students/[id]/page.tsx">
              <Edit size={14} className="mr-1" /><span className="editable-text" data-unique-id="a1dd1ab8-f400-4c6d-aef0-f20b2bacdaed" data-file-name="app/dashboard/students/[id]/page.tsx">
              Edit Data Siswa
            </span></Link>
          </div>
        </div>

        {/* Student Information */}
        <div className="bg-white rounded-xl shadow-sm p-5 md:col-span-2" data-unique-id="7bb1e905-e143-47e7-a676-089e572b2c86" data-file-name="app/dashboard/students/[id]/page.tsx">
          <h2 className="text-sm font-semibold mb-3 border-b pb-2" data-unique-id="6e469315-8c3e-4988-a225-4b0937017331" data-file-name="app/dashboard/students/[id]/page.tsx"><span className="editable-text" data-unique-id="3755f9ac-57e3-47b5-99c9-ab784a841faf" data-file-name="app/dashboard/students/[id]/page.tsx">INFORMASI SISWA</span></h2>
        
          <div className="space-y-3" data-unique-id="1bf0e88d-0d2d-480e-b9e4-2e36c9ed1755" data-file-name="app/dashboard/students/[id]/page.tsx" data-dynamic-text="true">
            <div className="flex items-start" data-unique-id="ee95a6d0-856d-4488-94a8-14c297c82313" data-file-name="app/dashboard/students/[id]/page.tsx">
              <div className="w-7 flex-shrink-0" data-unique-id="a99aa2e6-23e5-4459-9fd1-d29e9e07bcc7" data-file-name="app/dashboard/students/[id]/page.tsx">
                <User className="h-4 w-4 text-gray-500" />
              </div>
              <div data-unique-id="2fe6823c-edae-4117-b83c-143eb2c1384b" data-file-name="app/dashboard/students/[id]/page.tsx">
                <p className="text-xs text-gray-500" data-unique-id="bca3da21-2e95-469a-a8f3-9b9a841e73f5" data-file-name="app/dashboard/students/[id]/page.tsx"><span className="editable-text" data-unique-id="76bf31a0-970d-42c8-8962-8208a2af4bb2" data-file-name="app/dashboard/students/[id]/page.tsx">Nama Lengkap</span></p>
                <p className="font-medium text-sm" data-unique-id="8db4374b-1710-4634-8745-454a21a0c9c2" data-file-name="app/dashboard/students/[id]/page.tsx" data-dynamic-text="true">{student.name}</p>
              </div>
            </div>
          
            <div className="flex items-start" data-unique-id="d49b3ae7-f2a1-41d5-b808-66f9e673b040" data-file-name="app/dashboard/students/[id]/page.tsx">
              <div className="w-7 flex-shrink-0" data-unique-id="d17fb5bb-20dd-45af-b08e-6bd4ec16b9d2" data-file-name="app/dashboard/students/[id]/page.tsx">
                <Hash className="h-4 w-4 text-gray-500" />
              </div>
              <div data-unique-id="a1b178fe-00e5-4581-8d6b-b2567e0160e9" data-file-name="app/dashboard/students/[id]/page.tsx">
                <p className="text-xs text-gray-500" data-unique-id="fa274da1-e177-4cbb-a889-f947a60fc53b" data-file-name="app/dashboard/students/[id]/page.tsx"><span className="editable-text" data-unique-id="8f163241-a88f-43f0-8058-0e6d46feb145" data-file-name="app/dashboard/students/[id]/page.tsx">NISN</span></p>
                <p className="font-medium text-sm" data-unique-id="577cdeed-180c-431a-a83a-b7ab8364d7c5" data-file-name="app/dashboard/students/[id]/page.tsx" data-dynamic-text="true">{student.nisn}</p>
              </div>
            </div>
          
            <div className="flex items-start bg-blue-50 p-2 rounded-md" data-unique-id="8d29973e-4c07-4545-9534-bee7c506e1c3" data-file-name="app/dashboard/students/[id]/page.tsx">
              <div className="w-7 flex-shrink-0" data-unique-id="85d8d02d-7636-4e9e-ae5e-5845f97a4f43" data-file-name="app/dashboard/students/[id]/page.tsx">
                <School className="h-4 w-4 text-blue-600" />
              </div>
              <div data-unique-id="f3499d67-9b9d-40f2-9e84-e833a68d2da5" data-file-name="app/dashboard/students/[id]/page.tsx">
                <p className="text-xs text-blue-700" data-unique-id="5e51deea-3f71-4273-b760-475518451554" data-file-name="app/dashboard/students/[id]/page.tsx"><span className="editable-text" data-unique-id="4142b274-539b-406c-8723-fde1b5fcd3e5" data-file-name="app/dashboard/students/[id]/page.tsx">Kelas</span></p>
                <p className="font-medium text-sm text-blue-800" data-unique-id="dd090f35-ecef-4a07-ab18-84cd5ec9f107" data-file-name="app/dashboard/students/[id]/page.tsx" data-dynamic-text="true">{student.class}</p>
              </div>
            </div>
          
            <div className="flex items-start" data-unique-id="3eb3b97e-f784-4d17-aeb9-3411f069d940" data-file-name="app/dashboard/students/[id]/page.tsx">
              <div className="w-7 flex-shrink-0" data-unique-id="09d5a70b-15c9-4aba-a65d-ccc9dca05461" data-file-name="app/dashboard/students/[id]/page.tsx">
                <User className="h-4 w-4 text-gray-500" />
              </div>
              <div data-unique-id="74c19648-d68e-429d-b396-ac4b08aebd53" data-file-name="app/dashboard/students/[id]/page.tsx">
                <p className="text-xs text-gray-500" data-unique-id="defd9416-bbd2-415f-8ab4-7b4101c61f56" data-file-name="app/dashboard/students/[id]/page.tsx"><span className="editable-text" data-unique-id="5ea3a46b-f3ab-46cf-b410-54e618ccedde" data-file-name="app/dashboard/students/[id]/page.tsx">Jenis Kelamin</span></p>
                <p className="font-medium text-sm" data-unique-id="4da130c0-0bb5-4c7a-9ab1-9bf72ec833c1" data-file-name="app/dashboard/students/[id]/page.tsx" data-dynamic-text="true">{student.gender === "male" ? "Laki-laki" : "Perempuan"}</p>
              </div>
            </div>
          
            {student.birthPlace && student.birthDate && <div className="flex items-start" data-unique-id="42466e14-b09d-413f-91f5-9d850d186a16" data-file-name="app/dashboard/students/[id]/page.tsx">
                <div className="w-7 flex-shrink-0" data-unique-id="328083d9-fc39-4cd5-8722-475615e16c30" data-file-name="app/dashboard/students/[id]/page.tsx">
                  <Calendar className="h-4 w-4 text-gray-500" data-unique-id="d05a7b78-a610-4168-9c3e-9cdeb2a4831a" data-file-name="app/dashboard/students/[id]/page.tsx" />
                </div>
                <div data-unique-id="acd9197b-627d-40b3-a3c5-563852be294d" data-file-name="app/dashboard/students/[id]/page.tsx">
                  <p className="text-xs text-gray-500" data-unique-id="d736b20b-b3e8-46c7-a07f-e176842af7a4" data-file-name="app/dashboard/students/[id]/page.tsx"><span className="editable-text" data-unique-id="c1c31d47-e16c-4fc0-b981-3fbb9b424ccc" data-file-name="app/dashboard/students/[id]/page.tsx">Tempat, Tanggal Lahir</span></p>
                  <p className="font-medium text-sm" data-unique-id="2b9d6664-2360-49cb-b9d3-975471c11d74" data-file-name="app/dashboard/students/[id]/page.tsx" data-dynamic-text="true">{student.birthPlace}<span className="editable-text" data-unique-id="c4af2e29-2c24-4c1a-8cde-e956fa47bb1e" data-file-name="app/dashboard/students/[id]/page.tsx">, </span>{student.birthDate}</p>
                </div>
              </div>}
          
            {student.address && <div className="flex items-start" data-unique-id="519b1d97-281a-48fa-8c48-e82217d305d9" data-file-name="app/dashboard/students/[id]/page.tsx">
                <div className="w-7 flex-shrink-0" data-unique-id="e1f96fed-5a65-4ae1-b798-78ffc2bc755f" data-file-name="app/dashboard/students/[id]/page.tsx">
                  <MapPin className="h-4 w-4 text-gray-500" />
                </div>
                <div data-unique-id="566cc48d-c382-46af-b478-f93a506e2e79" data-file-name="app/dashboard/students/[id]/page.tsx">
                  <p className="text-xs text-gray-500" data-unique-id="89c63ea5-4ebc-40be-b8e0-b17c096a2e02" data-file-name="app/dashboard/students/[id]/page.tsx"><span className="editable-text" data-unique-id="7fa89963-b08b-44b5-874f-1e5d8af2ac59" data-file-name="app/dashboard/students/[id]/page.tsx">Alamat</span></p>
                  <p className="font-medium text-sm" data-unique-id="9124c5b3-5a5d-4645-998f-0c9fa17d572d" data-file-name="app/dashboard/students/[id]/page.tsx" data-dynamic-text="true">{student.address}</p>
                </div>
              </div>}
          
            {student.telegramNumber && <div className="flex items-start" data-unique-id="2a2282ba-a208-4d5b-842f-de40530f326a" data-file-name="app/dashboard/students/[id]/page.tsx">
                <div className="w-7 flex-shrink-0" data-unique-id="015b631d-200e-480c-9497-0796d37c1808" data-file-name="app/dashboard/students/[id]/page.tsx">
                  <Phone className="h-4 w-4 text-gray-500" />
                </div>
                <div data-unique-id="fbf1111e-44d0-4a20-8ed3-89990d273c06" data-file-name="app/dashboard/students/[id]/page.tsx">
                  <p className="text-xs text-gray-500" data-unique-id="a6315d56-160b-48c6-a667-a56b38884590" data-file-name="app/dashboard/students/[id]/page.tsx"><span className="editable-text" data-unique-id="a320ab52-85d1-4e0d-9b1c-1bc470cebc06" data-file-name="app/dashboard/students/[id]/page.tsx">Nomor Telegram</span></p>
                  <p className="font-medium text-sm" data-unique-id="b18e631d-84e1-4dca-9d19-7e672a92c7a8" data-file-name="app/dashboard/students/[id]/page.tsx" data-dynamic-text="true">{student.telegramNumber}</p>
                </div>
              </div>}
          
            {student.email && <div className="flex items-start" data-unique-id="17869d93-4175-414f-a3a7-d6aaa8735d7c" data-file-name="app/dashboard/students/[id]/page.tsx">
                <div className="w-7 flex-shrink-0" data-unique-id="986784c5-e1a2-4e33-9d40-b74440bae1b0" data-file-name="app/dashboard/students/[id]/page.tsx">
                  <Mail className="h-4 w-4 text-gray-500" />
                </div>
                <div data-unique-id="e977024e-1fd5-41b5-bb1d-9f2e6bfa31f6" data-file-name="app/dashboard/students/[id]/page.tsx">
                  <p className="text-xs text-gray-500" data-unique-id="5897109a-c671-4620-9155-8660ff5a1fb6" data-file-name="app/dashboard/students/[id]/page.tsx"><span className="editable-text" data-unique-id="85c9c6d3-c800-4d01-bbbc-7736e656f9b6" data-file-name="app/dashboard/students/[id]/page.tsx">Email</span></p>
                  <p className="font-medium text-sm" data-unique-id="bb04646a-022d-4cf9-b721-1d636347776a" data-file-name="app/dashboard/students/[id]/page.tsx" data-dynamic-text="true">{student.email}</p>
                </div>
              </div>}
          </div>
        </div>
        
        {/* Attendance Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:col-span-3" data-unique-id="4417751d-585f-43ee-ba68-802215d3a516" data-file-name="app/dashboard/students/[id]/page.tsx">
          <h2 className="text-base font-semibold mb-4 border-b pb-2" data-unique-id="5fa29d48-1d6b-47f5-a3fd-c21fae89b775" data-file-name="app/dashboard/students/[id]/page.tsx"><span className="editable-text" data-unique-id="d444d49b-840e-4f46-a5d4-c1ee27e25097" data-file-name="app/dashboard/students/[id]/page.tsx">RINGKASAN KEHADIRAN</span></h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-unique-id="a0108bce-5003-4c2c-a06a-7265665ce3ce" data-file-name="app/dashboard/students/[id]/page.tsx">
            <div className="bg-blue-50 p-4 rounded-lg" data-unique-id="9074119e-5b3c-4a2e-a250-08ed43b941fd" data-file-name="app/dashboard/students/[id]/page.tsx">
              <p className="text-xs text-blue-600 font-medium mb-1" data-unique-id="03fe0db8-389e-45ed-9c50-c4bfd2863e55" data-file-name="app/dashboard/students/[id]/page.tsx"><span className="editable-text" data-unique-id="07149e0d-642e-4f41-bad6-56fa4a1e849a" data-file-name="app/dashboard/students/[id]/page.tsx">Hadir</span></p>
              <p className="text-xl font-bold text-blue-600" data-unique-id="fc1dbdbd-a179-47aa-842d-3338d13df765" data-file-name="app/dashboard/students/[id]/page.tsx"><span className="editable-text" data-unique-id="b730cae4-2127-4899-be40-f1d4c6e11bac" data-file-name="app/dashboard/students/[id]/page.tsx">95%</span></p>
              <p className="text-xs text-gray-500 mt-1" data-unique-id="7d2edcbc-46f1-4491-bd07-be9d1edba736" data-file-name="app/dashboard/students/[id]/page.tsx"><span className="editable-text" data-unique-id="11a41f08-7fda-4785-82e2-18157dc5546f" data-file-name="app/dashboard/students/[id]/page.tsx">19/20 hari</span></p>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg" data-unique-id="099b6577-5a27-4cd7-a310-269ce44f7a51" data-file-name="app/dashboard/students/[id]/page.tsx">
              <p className="text-xs text-amber-600 font-medium mb-1" data-unique-id="7cd67478-f947-4e44-99a7-e0fe9b9d08fb" data-file-name="app/dashboard/students/[id]/page.tsx"><span className="editable-text" data-unique-id="8d600c24-e99d-4f04-aec4-904f07bf3e26" data-file-name="app/dashboard/students/[id]/page.tsx">Izin</span></p>
              <p className="text-xl font-bold text-amber-600" data-unique-id="2a218ab7-06c5-4364-999e-3b570420480c" data-file-name="app/dashboard/students/[id]/page.tsx"><span className="editable-text" data-unique-id="960e46d4-488c-45c7-981c-6dd77fcf4bfa" data-file-name="app/dashboard/students/[id]/page.tsx">0%</span></p>
              <p className="text-xs text-gray-500 mt-1" data-unique-id="c8daf1da-67af-4602-bc69-3b4d8fbb71c0" data-file-name="app/dashboard/students/[id]/page.tsx"><span className="editable-text" data-unique-id="361fc35e-2c74-409f-b7a7-edac34bad9ea" data-file-name="app/dashboard/students/[id]/page.tsx">0/20 hari</span></p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg" data-unique-id="84952f7a-745b-478d-94e7-74d530ead7ec" data-file-name="app/dashboard/students/[id]/page.tsx">
              <p className="text-xs text-green-600 font-medium mb-1" data-unique-id="b1108252-3a13-4828-98be-893378126b18" data-file-name="app/dashboard/students/[id]/page.tsx"><span className="editable-text" data-unique-id="3e6355f3-042e-465c-ab77-d4443a6e3394" data-file-name="app/dashboard/students/[id]/page.tsx">Sakit</span></p>
              <p className="text-xl font-bold text-green-600" data-unique-id="d7dde131-4819-4485-9970-bf201f877e1d" data-file-name="app/dashboard/students/[id]/page.tsx"><span className="editable-text" data-unique-id="6f212d83-b7d5-4583-a5f5-6b5a0d63a7e9" data-file-name="app/dashboard/students/[id]/page.tsx">5%</span></p>
              <p className="text-xs text-gray-500 mt-1" data-unique-id="a9eb867c-a608-4092-ad0e-6985101d0bc7" data-file-name="app/dashboard/students/[id]/page.tsx"><span className="editable-text" data-unique-id="0ccb3663-4d5f-434f-bbbd-6d0fe8b4dfb2" data-file-name="app/dashboard/students/[id]/page.tsx">1/20 hari</span></p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg" data-unique-id="0b7b05c9-39bb-4f02-868c-7985edc7d3db" data-file-name="app/dashboard/students/[id]/page.tsx">
              <p className="text-xs text-red-600 font-medium mb-1" data-unique-id="8272f832-0f4f-48c2-b49e-ed8506b8a5f7" data-file-name="app/dashboard/students/[id]/page.tsx"><span className="editable-text" data-unique-id="bdc135ba-36ea-4ac2-b178-41c7ba8842fe" data-file-name="app/dashboard/students/[id]/page.tsx">Alpha</span></p>
              <p className="text-xl font-bold text-red-600" data-unique-id="8f848cb6-cc84-4ae7-be59-b6051b63152a" data-file-name="app/dashboard/students/[id]/page.tsx"><span className="editable-text" data-unique-id="fc19ff41-e3e1-4e6a-82d5-d9ee0e4dea87" data-file-name="app/dashboard/students/[id]/page.tsx">0%</span></p>
              <p className="text-xs text-gray-500 mt-1" data-unique-id="f670ad18-63bc-4033-b2c3-a335df652d48" data-file-name="app/dashboard/students/[id]/page.tsx"><span className="editable-text" data-unique-id="4f1d141d-d649-4608-b37b-4e4c3ea2bc7f" data-file-name="app/dashboard/students/[id]/page.tsx">0/20 hari</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>;
}