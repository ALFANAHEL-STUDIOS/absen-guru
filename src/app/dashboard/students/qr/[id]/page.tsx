"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Download, Printer, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
export default function StudentQRCode({
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
  const [school, setSchool] = useState<any>(null);
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

        // Fetch school data
        const schoolDoc = await getDoc(doc(db, "schools", schoolId));
        if (schoolDoc.exists()) {
          setSchool(schoolDoc.data());
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [schoolId, params.id]);
  const handlePrint = () => {
    window.print();
  };
  if (loading) {
    return <div className="flex justify-center items-center h-64" data-unique-id="242a1743-7dbf-40ce-a7fe-2ca78c3acc41" data-file-name="app/dashboard/students/qr/[id]/page.tsx">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" data-unique-id="8884880b-6438-4812-af54-ce6e6cc33fbf" data-file-name="app/dashboard/students/qr/[id]/page.tsx"></div>
      </div>;
  }
  if (!student) {
    return <div className="text-center py-10" data-unique-id="50b9db3a-b31f-422b-8dec-1d1fa67e1270" data-file-name="app/dashboard/students/qr/[id]/page.tsx">
        <p className="text-red-500" data-unique-id="ecbb482c-d9b3-4d18-bbb7-276b1f3b8997" data-file-name="app/dashboard/students/qr/[id]/page.tsx"><span className="editable-text" data-unique-id="3a53b135-609f-430f-bc7d-c0fd7f907f09" data-file-name="app/dashboard/students/qr/[id]/page.tsx">Data siswa tidak ditemukan</span></p>
        <Link href="/dashboard/students" className="text-primary hover:underline mt-2 inline-block" data-unique-id="28187955-a790-4050-bf20-f602d84b78ec" data-file-name="app/dashboard/students/qr/[id]/page.tsx"><span className="editable-text" data-unique-id="dfb6dd90-47e1-4306-8111-1a35f3c4ade4" data-file-name="app/dashboard/students/qr/[id]/page.tsx">
          Kembali ke daftar siswa
        </span></Link>
      </div>;
  }
  return <div className="max-w-2xl mx-auto pb-20 md:pb-6 px-3 sm:px-4 md:px-6" data-unique-id="781b2cd2-6227-47d3-bd6d-262c23d628af" data-file-name="app/dashboard/students/qr/[id]/page.tsx" data-dynamic-text="true">
      <div className="flex items-center mb-6 print:hidden" data-unique-id="a5194307-2935-4800-9021-217a6082e6a7" data-file-name="app/dashboard/students/qr/[id]/page.tsx">
        <Link href="/dashboard/students" className="p-2 mr-2 hover:bg-gray-100 rounded-full" data-unique-id="43fb12de-b9ee-42c9-96d7-16fc8833abd6" data-file-name="app/dashboard/students/qr/[id]/page.tsx">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800" data-unique-id="47fa673c-f4f9-4efb-8943-da29b4c40e46" data-file-name="app/dashboard/students/qr/[id]/page.tsx"><span className="editable-text" data-unique-id="f1fd94e0-12f3-49b8-9fff-32943fbdb235" data-file-name="app/dashboard/students/qr/[id]/page.tsx">Kartu QR Code Siswa</span></h1>
      </div>

      {/* ID Card Preview */}
      <div id="student-card" className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-200 h-[580px]" data-unique-id="9a5fcdc7-1430-4976-8575-4fcbedd58f3e" data-file-name="app/dashboard/students/qr/[id]/page.tsx" data-dynamic-text="true">
        {/* Header */}
        <div className="bg-primary text-white p-5 text-center" data-unique-id="981655d9-405c-4293-9748-bef8992a42a2" data-file-name="app/dashboard/students/qr/[id]/page.tsx">
          <div className="flex justify-center mt-2 mb-2" data-unique-id="123f29a8-7587-4dc2-b4d2-b79f1c3351e4" data-file-name="app/dashboard/students/qr/[id]/page.tsx">
            <User className="h-16 w-16" />
          </div>
          <h2 className="text-6xl font-bold mt-2" data-unique-id="2b7a0163-e47a-4cbe-99d7-1e64cdc41354" data-file-name="app/dashboard/students/qr/[id]/page.tsx"><span className="editable-text" data-unique-id="23dcd984-09d0-4097-94c7-2250d8fecfcb" data-file-name="app/dashboard/students/qr/[id]/page.tsx">KARTU ABSENSI SISWA</span></h2>
          <p className="text-base font-medium mt-1" data-unique-id="397fdd65-b0fd-4d19-86d2-a5fb5731ab4c" data-file-name="app/dashboard/students/qr/[id]/page.tsx" data-dynamic-text="true">{school?.name || "Sekolah"}</p>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center justify-center" data-unique-id="5cb63695-581c-4904-8259-c7fb04c486da" data-file-name="app/dashboard/students/qr/[id]/page.tsx" data-dynamic-text="true">
          <div className="flex flex-col items-center justify-center w-full" data-unique-id="f9f69c05-4732-4184-a2d1-ee3265291bed" data-file-name="app/dashboard/students/qr/[id]/page.tsx" data-dynamic-text="true">
            {/* Student Information */}
            <div className="text-center mb-2 mt-0 w-full" data-unique-id="abd5b179-9341-4eba-a80e-6b5bdecbff82" data-file-name="app/dashboard/students/qr/[id]/page.tsx">
              <h3 className="font-bold text-3xl text-gray-800" data-unique-id="4fb86e3e-ad6d-46da-ac69-d32ad0d816df" data-file-name="app/dashboard/students/qr/[id]/page.tsx" data-dynamic-text="true">{student.name}</h3>
              <table className="text-sm mt-2 mx-auto" data-unique-id="5ad47e48-2640-44c2-897f-03e6837ab601" data-file-name="app/dashboard/students/qr/[id]/page.tsx">
                <tbody data-unique-id="32d338bd-45e6-475e-bc03-6173462ef5b3" data-file-name="app/dashboard/students/qr/[id]/page.tsx">
                  <tr data-unique-id="ec237611-c992-46ee-9b89-320e8f1fad80" data-file-name="app/dashboard/students/qr/[id]/page.tsx">
                    <td className="pr-3 py-1 text-gray-500" data-unique-id="9e9bbded-ed72-44f8-bc35-e2734ff00ec6" data-file-name="app/dashboard/students/qr/[id]/page.tsx"><span className="editable-text" data-unique-id="3cd4f4fe-edcd-4b33-8700-bb607f8aff9d" data-file-name="app/dashboard/students/qr/[id]/page.tsx">NISN</span></td>
                    <td data-unique-id="4ef2e41c-11ec-4413-9685-9b7df23d8907" data-file-name="app/dashboard/students/qr/[id]/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="43649c99-cf81-488b-9113-0a9c8a48deb7" data-file-name="app/dashboard/students/qr/[id]/page.tsx"> : </span>{student.nisn}</td>
                  </tr>
                  <tr data-unique-id="fc9ccb6a-cfe7-4e03-bfd6-7590217df840" data-file-name="app/dashboard/students/qr/[id]/page.tsx">
                    <td className="pr-3 py-1 text-gray-500" data-unique-id="1563270e-7dad-4124-aa68-fe6b88623e24" data-file-name="app/dashboard/students/qr/[id]/page.tsx"><span className="editable-text" data-unique-id="fae9877a-dbee-4bcd-b143-5219b79a0b24" data-file-name="app/dashboard/students/qr/[id]/page.tsx">Kelas</span></td>
                    <td data-unique-id="056312c8-aa9d-4be4-a4b2-07b489fa4aeb" data-file-name="app/dashboard/students/qr/[id]/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="c7e16bbe-a847-4c78-a266-93a1547ebc65" data-file-name="app/dashboard/students/qr/[id]/page.tsx"> : Kelas </span>{student.class}</td>
                  </tr>
                  <tr data-unique-id="bc779e7b-5f4f-4af6-9dfa-5895ec50e29f" data-file-name="app/dashboard/students/qr/[id]/page.tsx">
                    <td className="pr-3 py-1 text-gray-500" data-unique-id="9c38b0be-5282-451b-872b-c065b95e36f7" data-file-name="app/dashboard/students/qr/[id]/page.tsx"><span className="editable-text" data-unique-id="4e7232c9-6b99-40b1-93aa-9baf885cff02" data-file-name="app/dashboard/students/qr/[id]/page.tsx">Jenis Kelamin</span></td>
                    <td data-unique-id="7bd05155-044b-471a-8ebf-9dc87eff821d" data-file-name="app/dashboard/students/qr/[id]/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="49b36090-63cf-4799-9a90-fb098c4eec30" data-file-name="app/dashboard/students/qr/[id]/page.tsx"> : </span>{student.gender === "male" ? "Laki-laki" : "Perempuan"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center justify-center mt-0 w-full" data-unique-id="a9d26985-cc90-4547-ad99-faf2a69bb707" data-file-name="app/dashboard/students/qr/[id]/page.tsx">
            <div className="bg-white p-3 border border-gray-300 rounded-lg mx-auto" data-unique-id="36e162d9-f060-4ba1-8617-d44bc790462e" data-file-name="app/dashboard/students/qr/[id]/page.tsx">
              <QRCodeSVG value={student.nisn} size={270} level="H" includeMargin={true} />
            </div>
            <p className="text-sm text-center text-gray-500 mt-4" data-unique-id="ccaf9768-8f39-4b55-957b-cdfe3c51f4ae" data-file-name="app/dashboard/students/qr/[id]/page.tsx"><span className="editable-text" data-unique-id="c3456817-9956-4a94-a9c4-159fe5033c10" data-file-name="app/dashboard/students/qr/[id]/page.tsx">Scan QR code ini untuk absensi</span></p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-3 text-center text-xs text-gray-500 mt-2" data-unique-id="e359043f-929b-46b5-8c72-b0c17d0c3238" data-file-name="app/dashboard/students/qr/[id]/page.tsx">
          <p data-unique-id="10694736-f47f-437b-826c-d537985934d7" data-file-name="app/dashboard/students/qr/[id]/page.tsx"><span className="editable-text" data-unique-id="0936d731-e80e-43e9-ab69-0bddb5696a28" data-file-name="app/dashboard/students/qr/[id]/page.tsx">Kartu ini adalah identitas resmi siswa untuk absensi digital</span></p>
        </div>
      </div>

      {/* Action Buttons - Removed */}
    </div>;
}