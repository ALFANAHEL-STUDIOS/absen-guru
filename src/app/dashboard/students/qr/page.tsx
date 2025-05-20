"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, where, doc, getDoc } from "firebase/firestore";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Download, Printer, QrCode, Search, User, FileText, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import QRCode from 'qrcode';
import Link from "next/link";
import { toast } from "react-hot-toast";
import { jsPDF } from "jspdf";
interface Student {
  id: string;
  name: string;
  nisn: string;
  class: string;
  gender: string;
  photoUrl?: string;
}
export default function StudentsQRList() {
  const {
    schoolId
  } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [classes, setClasses] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(4);
  const [school, setSchool] = useState<{
    name: string;
  }>({
    name: "Sekolah"
  });
  useEffect(() => {
    const fetchStudents = async () => {
      if (!schoolId) return;
      try {
        setLoading(true);
        // Fetch school information
        const schoolDoc = await getDoc(doc(db, "schools", schoolId));
        if (schoolDoc.exists()) {
          setSchool({
            name: schoolDoc.data().name || "Sekolah"
          });
        }
        const classesRef = collection(db, "schools", schoolId, "classes");
        const classesSnapshot = await getDocs(classesRef);
        const classesData: string[] = [];
        classesSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.name) {
            classesData.push(data.name);
          }
        });
        setClasses(classesData.sort());
        const studentsRef = collection(db, "schools", schoolId, "students");
        const q = query(studentsRef, orderBy("name"));
        const snapshot = await getDocs(q);
        const fetchedStudents: Student[] = [];
        snapshot.forEach(doc => {
          fetchedStudents.push({
            id: doc.id,
            ...(doc.data() as Omit<Student, 'id'>)
          });
        });
        setStudents(fetchedStudents);
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Gagal mengambil data siswa");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [schoolId]);
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
  const handlePrint = () => {
    window.print();
  };

  // Generate PDF with multiple QR code cards (6 per page)
  const generateQRCardsPDF = (students: Student[], filename: string) => {
    if (students.length === 0) {
      toast.error("Tidak ada data siswa untuk dicetak");
      return;
    }
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // A4 dimensions: 210 x 297 mm
      const pageWidth = 210;
      const pageHeight = 297;

      // Card dimensions (ID card size approximately)
      const cardWidth = 85.6; // 8.56cm
      const cardHeight = 54; // 5.4cm

      // Margins
      const marginX = 15;
      const marginY = 15;
      const spacingX = 10;
      const spacingY = 10;

      // Calculate positions
      const cols = 2;
      const cardsPerPage = 6; // 2x3 grid
      let cardCount = 0;
      students.forEach((student, index) => {
        // Calculate position on grid
        const pageIndex = Math.floor(index / cardsPerPage);
        const pagePosition = index % cardsPerPage;
        const col = pagePosition % cols;
        const row = Math.floor(pagePosition / cols);

        // Add new page if needed
        if (pagePosition === 0 && index > 0) {
          doc.addPage();
        }

        // Calculate x and y position
        const x = marginX + col * (cardWidth + spacingX);
        const y = marginY + row * (cardHeight + spacingY);

        // Draw card rectangle with rounded corners
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'F');

        // Draw header
        doc.setFillColor(10, 36, 99); // Primary color
        doc.rect(x, y, cardWidth, 12, 'F');

        // Draw header text
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text("KARTU ABSENSI SISWA", x + cardWidth / 2, y + 6, {
          align: "center"
        });

        // Draw student information
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text(student.name, x + cardWidth / 2, y + 20, {
          align: "center"
        });
        doc.setFontSize(9);
        doc.text(`NISN: ${student.nisn}`, x + cardWidth / 2, y + 27, {
          align: "center"
        });
        doc.text(`Kelas: ${student.class}`, x + cardWidth / 2, y + 33, {
          align: "center"
        });

        // Add QR code (we'll create a data URL from SVG)
        const qrCanvas = document.createElement("canvas");
        const qrSize = 100;
        QRCode.toCanvas(qrCanvas, student.nisn || student.id, {
          width: qrSize,
          margin: 0,
          errorCorrectionLevel: 'H'
        }, error => {
          if (!error) {
            const qrDataURL = qrCanvas.toDataURL("image/png");
            const qrWidth = 30;
            doc.addImage(qrDataURL, "PNG", x + (cardWidth - qrWidth) / 2, y + 35, qrWidth, qrWidth);
          }
        });

        // Footer
        doc.setFillColor(245, 245, 245);
        doc.rect(x, y + cardHeight - 7, cardWidth, 7, 'F');
        doc.setFontSize(6);
        doc.setTextColor(100, 100, 100);
        doc.text("Kartu ini adalah identitas resmi siswa untuk absensi digital", x + cardWidth / 2, y + cardHeight - 3, {
          align: "center"
        });
        cardCount++;
      });
      doc.save(filename);
      toast.success(`PDF berhasil dibuat dengan ${cardCount} kartu QR Code`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Gagal membuat PDF");
    }
  };
  return <div className="max-w-6xl mx-auto pb-20 md:pb-6 px-3 sm:px-4 md:px-6" data-unique-id="033bd023-89d4-44a5-bb93-d3559c3172d5" data-file-name="app/dashboard/students/qr/page.tsx" data-dynamic-text="true">
      <div className="flex items-center mb-6" data-unique-id="b9acd3f6-ddc8-4dd2-bfcf-bce883705669" data-file-name="app/dashboard/students/qr/page.tsx">
        <Link href="/dashboard/students" className="p-2 mr-2 hover:bg-gray-100 rounded-full" data-unique-id="dc156dd2-436f-493e-97a2-2c91b35e1b6a" data-file-name="app/dashboard/students/qr/page.tsx">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800" data-unique-id="af34c927-0797-4dd5-9a1b-69127672fac8" data-file-name="app/dashboard/students/qr/page.tsx"><span className="editable-text" data-unique-id="9cdbaef2-cc3a-47bb-aa56-d86e68073a4f" data-file-name="app/dashboard/students/qr/page.tsx">Kartu QR Code Siswa</span></h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 md:p-5 mb-4 sm:mb-6 print:hidden" data-unique-id="ddfdae05-8ea5-4d30-9f2a-3f13dc25bab3" data-file-name="app/dashboard/students/qr/page.tsx">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4" data-unique-id="48f35cf3-bb49-4d7c-a7ba-7049f7f5a7de" data-file-name="app/dashboard/students/qr/page.tsx">
          <div className="md:col-span-3" data-unique-id="f293d25b-f993-489e-aba1-f36226d66db7" data-file-name="app/dashboard/students/qr/page.tsx">
            <div className="relative" data-unique-id="379c1851-3474-4165-88d0-8307443eb62b" data-file-name="app/dashboard/students/qr/page.tsx">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="Cari nama atau NISN siswa..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" data-unique-id="966591fc-5644-4d5f-bcd5-09ac59410cbc" data-file-name="app/dashboard/students/qr/page.tsx" />
            </div>
          </div>
        </div>
        
        <div className="mt-4" data-unique-id="1d6cd6dc-9159-44d7-93e5-586f71c1dfa6" data-file-name="app/dashboard/students/qr/page.tsx">
          <button onClick={handlePrint} className="w-full flex items-center justify-center gap-2 bg-blue-800 text-white px-5 py-2 rounded-lg hover:bg-orange-500 active:bg-orange-600 transition-colors" data-unique-id="29daff7d-7161-4cea-82c2-990dbdacde41" data-file-name="app/dashboard/students/qr/page.tsx">
            <Printer size={20} /><span className="editable-text" data-unique-id="6c9589da-1f9d-43a4-b567-f0f4e8f41992" data-file-name="app/dashboard/students/qr/page.tsx">
            Cetak Semua
          </span></button>
        </div>
      </div>
      
      {loading ? <div className="flex justify-center items-center h-64" data-unique-id="d1e6c293-84eb-456d-9ad5-b687a1ad5308" data-file-name="app/dashboard/students/qr/page.tsx">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" data-unique-id="dbac08c5-bb22-409c-b309-1cc640cc1314" data-file-name="app/dashboard/students/qr/page.tsx"></div>
        </div> : filteredStudents.length > 0 ? <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 print:grid-cols-2" data-unique-id="b872c862-9d1f-447e-9e2d-dc22ac6b3aa4" data-file-name="app/dashboard/students/qr/page.tsx" data-dynamic-text="true">
            {/* Show only 4 students per page */}
            {filteredStudents.slice((currentPage - 1) * studentsPerPage, currentPage * studentsPerPage).map(student => <div key={student.id} className="bg-white rounded-lg shadow-sm overflow-hidden p-3 border border-gray-200 print:break-inside-avoid w-[8.56cm] h-[12.5cm] print:w-[8.56cm] print:h-[12.5cm] flex flex-col" data-unique-id="087c50d8-04ca-4a56-8bc8-a0a8a9565688" data-file-name="app/dashboard/students/qr/page.tsx" data-dynamic-text="true">
              {/* Header */}
              <div className="bg-primary text-white p-2 -mx-3 -mt-3 text-center rounded-t-lg" data-unique-id="dbee36c3-ac95-4790-b78f-c71baedc34dd" data-file-name="app/dashboard/students/qr/page.tsx">
                <div className="flex justify-center mt-2 mb-1" data-unique-id="d4f68310-ac7d-400d-8952-e2e484f74f24" data-file-name="app/dashboard/students/qr/page.tsx">
                  <div className="border border-white/30 rounded-full p-1" data-unique-id="42bd9f91-5ebd-4ff7-ade0-6763e90edc88" data-file-name="app/dashboard/students/qr/page.tsx">
                    <User size={48} />
                  </div>
                </div>
                <h2 className="text-lg font-bold mt-2 mb-1" data-unique-id="7113e863-5c85-4890-aee0-e4f2bd964f0c" data-file-name="app/dashboard/students/qr/page.tsx"><span className="editable-text" data-unique-id="7b1b3e7b-43df-4576-a4df-9e8e8dff08b1" data-file-name="app/dashboard/students/qr/page.tsx">KARTU ABSENSI SISWA</span></h2>
                <p className="text-sm font-medium pb-1" data-unique-id="f252b768-3f12-4a8f-8349-d912b0fc8d36" data-file-name="app/dashboard/students/qr/page.tsx" data-dynamic-text="true">{school?.name || "Sekolah"}</p>
              </div>

              {/* Content */}
              <div className="flex flex-col justify-center items-center flex-grow py-4 mt-2" data-unique-id="54ef5e1e-0a5c-4214-86c8-1667341ac898" data-file-name="app/dashboard/students/qr/page.tsx" data-dynamic-text="true">
                {/* Student Information - Centered */}
                <div className="text-center mb-3 mt-1" data-unique-id="6906d72c-5d79-4804-9940-cd14204a0520" data-file-name="app/dashboard/students/qr/page.tsx">
                  <h3 className="font-bold text-base text-gray-800" data-unique-id="7af4b50c-3694-454c-b0ec-78837e84c5c3" data-file-name="app/dashboard/students/qr/page.tsx" data-dynamic-text="true">{student.name}</h3>
                  <div className="text-xs mt-2" data-unique-id="2b6ec0be-e1b0-49f2-a3d5-51eb2cf28194" data-file-name="app/dashboard/students/qr/page.tsx">
                    <p className="text-gray-600" data-unique-id="8197108c-1ecd-45f6-8732-0beee8ca1a9f" data-file-name="app/dashboard/students/qr/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="71d8e9b8-8f7a-40b9-ba52-6e0b72c58d1f" data-file-name="app/dashboard/students/qr/page.tsx">NISN : </span>{student.nisn}</p>
                    <p className="text-gray-600" data-unique-id="c2132889-4ee6-4c11-95b1-0a0461832c81" data-file-name="app/dashboard/students/qr/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="2355f22b-5791-48d3-86ed-b1b56b8742f7" data-file-name="app/dashboard/students/qr/page.tsx">Kelas : </span>{student.class}</p>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex justify-center" data-unique-id="9982937d-37d0-4d70-a3f5-ff62a0ab98d1" data-file-name="app/dashboard/students/qr/page.tsx">
                  <div className="bg-white p-2 border border-gray-300 rounded-lg" data-unique-id="e31bdff0-f5da-41a3-afb3-025027b78150" data-file-name="app/dashboard/students/qr/page.tsx">
                    <QRCodeSVG value={student.nisn || student.id} size={110} level="H" includeMargin={true} />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 p-1 text-center text-[8px] text-gray-500 mt-auto -mx-3 -mb-3" data-unique-id="b7b26eb4-8b49-4e2e-acd4-7914cee13c3f" data-file-name="app/dashboard/students/qr/page.tsx">
                <p data-unique-id="d0648b47-415a-4ae2-b036-6e7ceb3fa914" data-file-name="app/dashboard/students/qr/page.tsx"><span className="editable-text" data-unique-id="78133696-c14d-45ae-a966-ede156672af1" data-file-name="app/dashboard/students/qr/page.tsx">Kartu ini adalah identitas resmi siswa untuk absensi digital</span></p>
              </div>
            </div>)}
          </div>
          
          {/* Pagination */}
          <div className="flex justify-between items-center mt-6" data-unique-id="e6439d3c-6feb-47aa-a22b-aed72d466dca" data-file-name="app/dashboard/students/qr/page.tsx">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`flex items-center gap-1 px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`} data-unique-id="dfa2bca5-1df8-46c6-890a-cf0f2f264fff" data-file-name="app/dashboard/students/qr/page.tsx">
              <ChevronLeft size={16} /><span className="editable-text" data-unique-id="da9d982a-f9db-486a-ae99-4f09ce9e3864" data-file-name="app/dashboard/students/qr/page.tsx">
              Previous
            </span></button>
            
            <div className="text-gray-600" data-unique-id="31ffd930-cd8c-4a38-80b0-566d71bb7270" data-file-name="app/dashboard/students/qr/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="f07c51c8-4e0c-4f61-a5b1-8af39c3c6e5b" data-file-name="app/dashboard/students/qr/page.tsx">
              Page </span>{currentPage}<span className="editable-text" data-unique-id="a6537127-3f30-4b4b-9264-6c8a4ed34e6e" data-file-name="app/dashboard/students/qr/page.tsx"> of </span>{Math.ceil(filteredStudents.length / studentsPerPage)}
            </div>
            
            <button onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage >= Math.ceil(filteredStudents.length / studentsPerPage)} className={`flex items-center gap-1 px-4 py-2 rounded-md ${currentPage >= Math.ceil(filteredStudents.length / studentsPerPage) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`} data-unique-id="012de898-d0e3-4792-9359-b1c151363d01" data-file-name="app/dashboard/students/qr/page.tsx"><span className="editable-text" data-unique-id="95bfc057-539b-4b00-9b7c-01eef3a2f345" data-file-name="app/dashboard/students/qr/page.tsx">
              Next
              </span><ChevronRight size={16} />
            </button>
          </div>
        </> : <div className="bg-white rounded-xl shadow-sm p-10 text-center" data-unique-id="e4f4635a-2c1b-4956-a462-abfe19cd9736" data-file-name="app/dashboard/students/qr/page.tsx">
          <div className="flex flex-col items-center" data-unique-id="8fb10d8a-cb6d-4631-9517-d75e46bd33c1" data-file-name="app/dashboard/students/qr/page.tsx">
            <div className="bg-gray-100 rounded-full p-3 mb-4" data-unique-id="ca6c891f-43da-4704-9e0d-0ed0f843ca56" data-file-name="app/dashboard/students/qr/page.tsx">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4" data-unique-id="06dd5e9a-17df-4a27-9bf9-a15cbe747594" data-file-name="app/dashboard/students/qr/page.tsx" data-dynamic-text="true">
              {searchQuery || selectedClass !== "all" ? "Tidak ada siswa yang sesuai dengan pencarian atau filter" : "Belum ada siswa yang terdaftar"}
            </p>
            <Link href="/dashboard/students/add" className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors" data-unique-id="62ea75f4-c974-473e-8dd3-9a3ccb74f99a" data-file-name="app/dashboard/students/qr/page.tsx"><span className="editable-text" data-unique-id="65e05cc3-ce4a-4b28-b03f-1b5b6a54dc9b" data-file-name="app/dashboard/students/qr/page.tsx">
              Tambah Siswa
            </span></Link>
          </div>
        </div>}
    </div>;
}