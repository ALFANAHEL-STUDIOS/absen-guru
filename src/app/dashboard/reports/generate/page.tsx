"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import { FileText, Download, ArrowLeft, Settings, Calendar, Users, BookOpen, Loader2, Save, CheckCircle, AlertTriangle, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { id } from "date-fns/locale";
export default function GenerateReportPage() {
  const {
    schoolId
  } = useAuth();
  const searchParams = useSearchParams();
  const templateId = searchParams?.get('templateId');
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<any>(null);
  const [reportData, setReportData] = useState<any>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [schoolInfo, setSchoolInfo] = useState({
    name: "Sekolah",
    address: "Alamat Sekolah",
    npsn: "12345678",
    principalName: "Kepala Sekolah",
    principalNip: "123456789"
  });

  // Date range for report
  const [dateRange, setDateRange] = useState({
    start: format(new Date(new Date().setDate(1)), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd")
  });

  // Classes for filtering
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState("all");

  // Fetch template and initial data
  useEffect(() => {
    const fetchData = async () => {
      if (!schoolId) return;
      try {
        setLoading(true);

        // Fetch school info
        const {
          doc,
          getDoc
        } = await import('firebase/firestore');
        const {
          db
        } = await import('@/lib/firebase');
        const schoolDoc = await getDoc(doc(db, "schools", schoolId));
        if (schoolDoc.exists()) {
          const data = schoolDoc.data();
          setSchoolInfo({
            name: data.name || "Sekolah",
            address: data.address || "Alamat Sekolah",
            npsn: data.npsn || "12345678",
            principalName: data.principalName || "Kepala Sekolah",
            principalNip: data.principalNip || "123456789"
          });
        }

        // Fetch classes
        const {
          collection,
          getDocs,
          query,
          orderBy
        } = await import('firebase/firestore');
        const classesRef = collection(db, `schools/${schoolId}/classes`);
        const classesQuery = query(classesRef, orderBy("name"));
        const classesSnapshot = await getDocs(classesQuery);
        const classesData: string[] = [];
        classesSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.name) {
            classesData.push(data.name);
          }
        });
        setClasses(classesData.sort());

        // Fetch template
        if (templateId) {
          // Try localStorage first
          const storedTemplates = localStorage.getItem(`reportTemplates_${schoolId}`);
          if (storedTemplates) {
            const templates = JSON.parse(storedTemplates);
            const foundTemplate = templates.find((t: any) => t.id === templateId);
            if (foundTemplate) {
              setTemplate(foundTemplate);
              setLoading(false);
              return;
            }
          }

          // If not in localStorage, try Firestore
          const templateDoc = await getDoc(doc(db, `schools/${schoolId}/reportTemplates`, templateId));
          if (templateDoc.exists()) {
            setTemplate(templateDoc.data());
          } else {
            toast.error("Template tidak ditemukan");
          }
        } else {
          // No template ID provided, use default template
          setTemplate({
            id: "default",
            name: "Default Template",
            description: "Template laporan default",
            fields: ["studentName", "class", "attendance", "date"],
            layout: "standard",
            includeCharts: true,
            includeStatistics: true
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Gagal mengambil data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [schoolId, templateId]);

  // Fetch attendance data based on filters
  const fetchAttendanceData = useCallback(async () => {
    if (!schoolId) return;
    try {
      setLoading(true);
      const {
        collection,
        query,
        where,
        getDocs
      } = await import('firebase/firestore');
      const {
        db
      } = await import('@/lib/firebase');

      // Query for attendance records within date range
      const attendanceRef = collection(db, `schools/${schoolId}/attendance`);
      const attendanceQuery = query(attendanceRef, where("date", ">=", dateRange.start), where("date", "<=", dateRange.end));
      const snapshot = await getDocs(attendanceQuery);

      // Process attendance records
      const records: any[] = [];
      let present = 0,
        sick = 0,
        permitted = 0,
        absent = 0;
      snapshot.forEach(doc => {
        const data = doc.data();

        // Filter by class if needed
        if (selectedClass !== "all" && data.class !== selectedClass) {
          return;
        }
        records.push({
          id: doc.id,
          ...data
        });

        // Count by status
        if (data.status === 'present' || data.status === 'hadir') present++;else if (data.status === 'sick' || data.status === 'sakit') sick++;else if (data.status === 'permitted' || data.status === 'izin') permitted++;else if (data.status === 'absent' || data.status === 'alpha') absent++;
      });

      // Calculate percentages
      const total = present + sick + permitted + absent || 1; // Prevent division by zero

      setReportData({
        records,
        summary: {
          present,
          sick,
          permitted,
          absent,
          total,
          presentPercentage: Math.round(present / total * 100),
          sickPercentage: Math.round(sick / total * 100),
          permittedPercentage: Math.round(permitted / total * 100),
          absentPercentage: Math.round(absent / total * 100)
        }
      });
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      toast.error("Gagal mengambil data kehadiran");
    } finally {
      setLoading(false);
    }
  }, [schoolId, dateRange, selectedClass]);

  // Fetch data when filters change
  useEffect(() => {
    if (template) {
      fetchAttendanceData();
    }
  }, [template, fetchAttendanceData]);

  // Handle date range change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle class selection change
  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass(e.target.value);
  };

  // Apply filters
  const handleApplyFilters = () => {
    fetchAttendanceData();
  };

  // Generate PDF report
  const handleGeneratePDF = async () => {
    if (!template || !reportData.records) {
      toast.error("Data tidak tersedia untuk membuat laporan");
      return;
    }
    setIsGenerating(true);
    try {
      // Create PDF document
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;

      // Add header with school information
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(schoolInfo.name.toUpperCase(), pageWidth / 2, margin, {
        align: "center"
      });
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(schoolInfo.address, pageWidth / 2, margin + 7, {
        align: "center"
      });
      doc.text(`NPSN: ${schoolInfo.npsn}`, pageWidth / 2, margin + 14, {
        align: "center"
      });

      // Add horizontal line
      doc.setLineWidth(0.5);
      doc.line(margin, margin + 20, pageWidth - margin, margin + 20);

      // Add report title
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`LAPORAN KEHADIRAN SISWA - ${template.name}`, pageWidth / 2, margin + 30, {
        align: "center"
      });

      // Add date range
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const startDateFormatted = format(new Date(dateRange.start), "d MMMM yyyy", {
        locale: id
      });
      const endDateFormatted = format(new Date(dateRange.end), "d MMMM yyyy", {
        locale: id
      });
      doc.text(`Periode: ${startDateFormatted} - ${endDateFormatted}`, pageWidth / 2, margin + 38, {
        align: "center"
      });
      if (selectedClass !== "all") {
        doc.text(`Kelas: ${selectedClass}`, pageWidth / 2, margin + 44, {
          align: "center"
        });
      }

      // Add attendance summary
      let yPos = margin + 55;
      if (template.includeStatistics) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Ringkasan Kehadiran", margin, yPos);
        yPos += 8;

        // Create summary table
        const summaryHeaders = ["Status", "Jumlah", "Persentase"];
        const summaryData = [["Hadir", reportData.summary.present.toString(), `${reportData.summary.presentPercentage}%`], ["Sakit", reportData.summary.sick.toString(), `${reportData.summary.sickPercentage}%`], ["Izin", reportData.summary.permitted.toString(), `${reportData.summary.permittedPercentage}%`], ["Alpha", reportData.summary.absent.toString(), `${reportData.summary.absentPercentage}%`], ["Total", reportData.summary.total.toString(), "100%"]];

        // Draw summary table
        const colWidths = [30, 20, 20];
        const rowHeight = 8;

        // Draw header row
        doc.setFillColor(220, 220, 220);
        doc.rect(margin, yPos, colWidths.reduce((a, b) => a + b, 0), rowHeight, "F");
        let xPos = margin;
        summaryHeaders.forEach((header, i) => {
          doc.text(header, xPos + colWidths[i] / 2, yPos + 5.5, {
            align: "center"
          });
          xPos += colWidths[i];
        });
        yPos += rowHeight;

        // Draw data rows
        doc.setFont("helvetica", "normal");
        summaryData.forEach((row, rowIndex) => {
          // Highlight total row
          if (rowIndex === summaryData.length - 1) {
            doc.setFillColor(240, 240, 240);
            doc.rect(margin, yPos, colWidths.reduce((a, b) => a + b, 0), rowHeight, "F");
            doc.setFont("helvetica", "bold");
          }
          xPos = margin;
          row.forEach((cell, cellIndex) => {
            doc.text(cell, xPos + colWidths[cellIndex] / 2, yPos + 5.5, {
              align: "center"
            });
            xPos += colWidths[cellIndex];
          });
          yPos += rowHeight;
        });
        yPos += 10;
      }

      // Add attendance records table if included in template
      if (template.fields.includes("attendance")) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Detail Kehadiran", margin, yPos);
        yPos += 8;

        // Create records table
        const recordsHeaders = ["Tanggal", "Nama", "Kelas", "Status", "Waktu"];
        const colWidths = [25, 50, 20, 25, 20];
        const rowHeight = 8;

        // Draw header row
        doc.setFillColor(220, 220, 220);
        doc.rect(margin, yPos, colWidths.reduce((a, b) => a + b, 0), rowHeight, "F");
        let xPos = margin;
        recordsHeaders.forEach((header, i) => {
          doc.text(header, xPos + colWidths[i] / 2, yPos + 5.5, {
            align: "center"
          });
          xPos += colWidths[i];
        });
        yPos += rowHeight;

        // Draw data rows (limit to 20 records per page)
        doc.setFont("helvetica", "normal");
        const recordsPerPage = 20;
        const totalPages = Math.ceil(reportData.records.length / recordsPerPage);
        for (let page = 0; page < totalPages; page++) {
          const startIdx = page * recordsPerPage;
          const endIdx = Math.min(startIdx + recordsPerPage, reportData.records.length);
          for (let i = startIdx; i < endIdx; i++) {
            const record = reportData.records[i];

            // Format date from YYYY-MM-DD to DD-MM-YYYY
            const dateParts = record.date.split('-');
            const formattedDate = dateParts.length === 3 ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}` : record.date;

            // Get status text
            const statusText = record.status === 'present' || record.status === 'hadir' ? 'Hadir' : record.status === 'sick' || record.status === 'sakit' ? 'Sakit' : record.status === 'permitted' || record.status === 'izin' ? 'Izin' : record.status === 'absent' || record.status === 'alpha' ? 'Alpha' : record.status;

            // Draw row with alternating background
            if (i % 2 === 0) {
              doc.setFillColor(245, 245, 245);
              doc.rect(margin, yPos, colWidths.reduce((a, b) => a + b, 0), rowHeight, "F");
            }
            xPos = margin;

            // Date
            doc.text(formattedDate, xPos + colWidths[0] / 2, yPos + 5.5, {
              align: "center"
            });
            xPos += colWidths[0];

            // Name (truncate if too long)
            const displayName = record.studentName.length > 20 ? record.studentName.substring(0, 17) + "..." : record.studentName;
            doc.text(displayName, xPos + 3, yPos + 5.5, {
              align: "left"
            });
            xPos += colWidths[1];

            // Class
            doc.text(record.class, xPos + colWidths[2] / 2, yPos + 5.5, {
              align: "center"
            });
            xPos += colWidths[2];

            // Status
            doc.text(statusText, xPos + colWidths[3] / 2, yPos + 5.5, {
              align: "center"
            });
            xPos += colWidths[3];

            // Time
            doc.text(record.time, xPos + colWidths[4] / 2, yPos + 5.5, {
              align: "center"
            });
            yPos += rowHeight;

            // Add a new page if needed
            if (yPos > pageHeight - margin - 40 && i < endIdx - 1) {
              doc.addPage();

              // Add header to new page
              doc.setFontSize(10);
              doc.setFont("helvetica", "bold");
              doc.text(schoolInfo.name.toUpperCase(), pageWidth / 2, margin, {
                align: "center"
              });
              doc.setFontSize(8);
              doc.setFont("helvetica", "normal");
              doc.text(`LAPORAN KEHADIRAN - ${template.name} (Lanjutan)`, pageWidth / 2, margin + 6, {
                align: "center"
              });

              // Reset Y position for new page
              yPos = margin + 15;

              // Draw header row again
              doc.setFontSize(9);
              doc.setFont("helvetica", "bold");
              doc.setFillColor(220, 220, 220);
              doc.rect(margin, yPos, colWidths.reduce((a, b) => a + b, 0), rowHeight, "F");
              xPos = margin;
              recordsHeaders.forEach((header, i) => {
                doc.text(header, xPos + colWidths[i] / 2, yPos + 5.5, {
                  align: "center"
                });
                xPos += colWidths[i];
              });
              yPos += rowHeight;
              doc.setFont("helvetica", "normal");
            }
          }

          // Add a new page for the next batch if not the last page
          if (page < totalPages - 1) {
            doc.addPage();

            // Add header to new page
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text(schoolInfo.name.toUpperCase(), pageWidth / 2, margin, {
              align: "center"
            });
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.text(`LAPORAN KEHADIRAN - ${template.name} (Lanjutan)`, pageWidth / 2, margin + 6, {
              align: "center"
            });

            // Reset Y position for new page
            yPos = margin + 15;
          }
        }
      }

      // Add signature section
      const signatureY = Math.min(yPos + 30, pageHeight - margin - 40);
      doc.setFontSize(10);
      doc.text(`${schoolInfo.address}, ${format(new Date(), "d MMMM yyyy", {
        locale: id
      })}`, pageWidth - margin - 40, signatureY, {
        align: "right"
      });
      doc.text("Mengetahui,", margin + 30, signatureY + 10, {
        align: "center"
      });
      doc.text("Kepala Sekolah", margin + 30, signatureY + 15, {
        align: "center"
      });
      doc.text("Dibuat oleh,", pageWidth - margin - 30, signatureY + 10, {
        align: "center"
      });
      doc.text("Administrator", pageWidth - margin - 30, signatureY + 15, {
        align: "center"
      });
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(schoolInfo.principalName, margin + 30, signatureY + 35, {
        align: "center"
      });
      doc.setFont("helvetica", "normal");
      doc.text(`NIP. ${schoolInfo.principalNip}`, margin + 30, signatureY + 40, {
        align: "center"
      });

      // Save the PDF
      const fileName = `Laporan_${template.name.replace(/\s+/g, '_')}_${format(new Date(), "yyyyMMdd")}.pdf`;
      doc.save(fileName);
      toast.success(`Laporan berhasil diunduh sebagai ${fileName}`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Gagal membuat laporan PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate Excel report
  const handleGenerateExcel = async () => {
    if (!template || !reportData.records) {
      toast.error("Data tidak tersedia untuk membuat laporan");
      return;
    }
    setIsGenerating(true);
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();

      // Create header data with school information
      const headerData = [[schoolInfo.name.toUpperCase()], [schoolInfo.address], [`NPSN: ${schoolInfo.npsn}`], [""], [`LAPORAN KEHADIRAN SISWA - ${template.name}`], [`Periode: ${format(new Date(dateRange.start), "d MMMM yyyy", {
        locale: id
      })} - ${format(new Date(dateRange.end), "d MMMM yyyy", {
        locale: id
      })}`], [selectedClass !== "all" ? `Kelas: ${selectedClass}` : "Semua Kelas"], [""]];

      // Add summary data if included
      if (template.includeStatistics) {
        headerData.push(["RINGKASAN KEHADIRAN"]);
        headerData.push(["Status", "Jumlah", "Persentase"]);
        headerData.push(["Hadir", reportData.summary.present, `${reportData.summary.presentPercentage}%`]);
        headerData.push(["Sakit", reportData.summary.sick, `${reportData.summary.sickPercentage}%`]);
        headerData.push(["Izin", reportData.summary.permitted, `${reportData.summary.permittedPercentage}%`]);
        headerData.push(["Alpha", reportData.summary.absent, `${reportData.summary.absentPercentage}%`]);
        headerData.push(["Total", reportData.summary.total, "100%"]);
        headerData.push([""]);
      }

      // Add attendance records if included
      if (template.fields.includes("attendance")) {
        headerData.push(["DETAIL KEHADIRAN"]);
        headerData.push(["Tanggal", "Nama Siswa", "Kelas", "Status", "Waktu", "Catatan"]);
        reportData.records.forEach(record => {
          // Format date from YYYY-MM-DD to DD-MM-YYYY
          const dateParts = record.date.split('-');
          const formattedDate = dateParts.length === 3 ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}` : record.date;

          // Get status text
          const statusText = record.status === 'present' || record.status === 'hadir' ? 'Hadir' : record.status === 'sick' || record.status === 'sakit' ? 'Sakit' : record.status === 'permitted' || record.status === 'izin' ? 'Izin' : record.status === 'absent' || record.status === 'alpha' ? 'Alpha' : record.status;
          headerData.push([formattedDate, record.studentName, record.class, statusText, record.time, record.note || ""]);
        });
      }

      // Add signature section
      headerData.push([""]);
      headerData.push([""]);
      headerData.push([`${schoolInfo.address}, ${format(new Date(), "d MMMM yyyy", {
        locale: id
      })}`]);
      headerData.push([""]);
      headerData.push(["Mengetahui,", "", "", "", "Dibuat oleh,"]);
      headerData.push(["Kepala Sekolah", "", "", "", "Administrator"]);
      headerData.push([""]);
      headerData.push([""]);
      headerData.push([schoolInfo.principalName, "", "", "", "Administrator"]);
      headerData.push([`NIP. ${schoolInfo.principalNip}`, "", "", "", ""]);

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(headerData);

      // Set column widths
      const colWidths = [{
        wch: 15
      },
      // Date
      {
        wch: 30
      },
      // Name
      {
        wch: 10
      },
      // Class
      {
        wch: 10
      },
      // Status
      {
        wch: 10
      },
      // Time
      {
        wch: 30
      } // Note
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Laporan Kehadiran");

      // Save the Excel file
      const fileName = `Laporan_${template.name.replace(/\s+/g, '_')}_${format(new Date(), "yyyyMMdd")}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success(`Laporan berhasil diunduh sebagai ${fileName}`);
    } catch (error) {
      console.error("Error generating Excel:", error);
      toast.error("Gagal membuat laporan Excel");
    } finally {
      setIsGenerating(false);
    }
  };
  return <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6" data-unique-id="2a1ac299-f2bf-4aa5-9ac0-7b8a96a163ae" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true">
      <div className="flex items-center mb-6" data-unique-id="9b32ccd1-0e18-4421-8899-cbb3842f7d18" data-file-name="app/dashboard/reports/generate/page.tsx">
        <Link href="/dashboard/reports/templates" className="p-2 mr-2 hover:bg-gray-100 rounded-full" data-unique-id="78e93db5-eecc-467d-942d-a44b42dbdc3a" data-file-name="app/dashboard/reports/generate/page.tsx">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800" data-unique-id="762dbe23-41c7-4646-bcd8-3b011b67e76f" data-file-name="app/dashboard/reports/generate/page.tsx"><span className="editable-text" data-unique-id="df36ad19-b467-4171-967a-5dbc8460afae" data-file-name="app/dashboard/reports/generate/page.tsx">Generate Laporan</span></h1>
      </div>
      
      {loading ? <div className="flex justify-center items-center h-64" data-unique-id="eb108e99-b60a-4e2c-bdc3-81b8e262d36b" data-file-name="app/dashboard/reports/generate/page.tsx">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </div> : template ? <>
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6" data-unique-id="120e3182-51b8-44bf-ac8c-2622ccc4dda1" data-file-name="app/dashboard/reports/generate/page.tsx">
            <div className="flex items-center mb-4" data-unique-id="0a60baca-1564-48de-86fb-913d0eb461dd" data-file-name="app/dashboard/reports/generate/page.tsx">
              <div className="bg-blue-100 p-2 rounded-lg mr-3" data-unique-id="b2152753-aea3-4bac-b010-0dd3429d1b6f" data-file-name="app/dashboard/reports/generate/page.tsx">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div data-unique-id="830ee4a0-5eca-4a45-a5d0-921fbe71e0d6" data-file-name="app/dashboard/reports/generate/page.tsx">
                <h2 className="text-xl font-semibold" data-unique-id="f0f898da-aeec-41d8-98ff-e2c820cf1fe2" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true">{template.name}</h2>
                <p className="text-sm text-gray-500" data-unique-id="7f20d1ee-aabd-429c-9067-11bb31ab3437" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true">{template.description || "No description"}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" data-unique-id="f42ee90d-60fc-47c6-a1ad-aad49a426d34" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true">
              {/* Date Range */}
              <div data-unique-id="92890891-912d-4878-aeda-89147c282c63" data-file-name="app/dashboard/reports/generate/page.tsx">
                <label htmlFor="start" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="86da2c49-ff1a-475d-8dd9-118c669c1760" data-file-name="app/dashboard/reports/generate/page.tsx"><span className="editable-text" data-unique-id="dcf64813-2d68-4ebf-9fa5-4aef0b36971b" data-file-name="app/dashboard/reports/generate/page.tsx">
                  Tanggal Mulai
                </span></label>
                <input type="date" id="start" name="start" value={dateRange.start} onChange={handleDateChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" data-unique-id="3f82bf6c-0674-4469-9202-00b0de8db333" data-file-name="app/dashboard/reports/generate/page.tsx" />
              </div>
              
              <div data-unique-id="70f8a8fa-06fe-4b74-9a48-458bb36d15b4" data-file-name="app/dashboard/reports/generate/page.tsx">
                <label htmlFor="end" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="b65b3ba6-10f4-465b-a57f-fe80c324537a" data-file-name="app/dashboard/reports/generate/page.tsx"><span className="editable-text" data-unique-id="aecf0ac0-62e8-408e-94af-8edf77da1d18" data-file-name="app/dashboard/reports/generate/page.tsx">
                  Tanggal Akhir
                </span></label>
                <input type="date" id="end" name="end" value={dateRange.end} onChange={handleDateChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" data-unique-id="61de3293-68b3-48db-af57-90f789d1238a" data-file-name="app/dashboard/reports/generate/page.tsx" />
              </div>
              
              {/* Class Selection */}
              <div data-unique-id="bdbec1df-5eb0-4f11-8bd0-5ea8e6c7ad48" data-file-name="app/dashboard/reports/generate/page.tsx">
                <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1" data-unique-id="651eac92-26c7-42ea-892d-cade27f5c221" data-file-name="app/dashboard/reports/generate/page.tsx"><span className="editable-text" data-unique-id="fcb3467c-1b28-4e7d-a5c1-82afc2d4e816" data-file-name="app/dashboard/reports/generate/page.tsx">
                  Pilih Kelas
                </span></label>
                <select id="class" value={selectedClass} onChange={handleClassChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" data-unique-id="4f610301-3aaa-43eb-a60e-d9fddf5ffa3c" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true">
                  <option value="all" data-unique-id="5ec97ca8-8cc5-49e8-9172-7f4939413c7c" data-file-name="app/dashboard/reports/generate/page.tsx"><span className="editable-text" data-unique-id="e3eca1f5-ce63-4455-9d51-97ade1bb35e1" data-file-name="app/dashboard/reports/generate/page.tsx">Semua Kelas</span></option>
                  {classes.map(className => <option key={className} value={className} data-unique-id="3d5f8cac-a44a-43b3-9949-ea4d97b93767" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="ccca69dc-c970-4ea5-8ff3-1da89fba7265" data-file-name="app/dashboard/reports/generate/page.tsx">
                      Kelas </span>{className}
                    </option>)}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end" data-unique-id="2bf7fac7-514f-4f61-8c13-8e8f90785885" data-file-name="app/dashboard/reports/generate/page.tsx">
              <button onClick={handleApplyFilters} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary hover:bg-opacity-90 transition-colors" data-unique-id="b0d081a6-f19a-4c24-af44-684787a34fd5" data-file-name="app/dashboard/reports/generate/page.tsx">
                <Settings size={18} /><span className="editable-text" data-unique-id="2f01a077-55dd-4963-836a-55e2e4674aa1" data-file-name="app/dashboard/reports/generate/page.tsx">
                Terapkan Filter
              </span></button>
            </div>
          </div>
          
          {/* Report Preview */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6" data-unique-id="091da935-963f-456a-b863-7d6bb813efce" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true">
            <div className="flex items-center justify-between mb-6" data-unique-id="48581199-bbdb-4d69-9b28-16a14209adbf" data-file-name="app/dashboard/reports/generate/page.tsx">
              <h2 className="text-xl font-semibold" data-unique-id="30342bb5-7298-40ae-831c-d0d26262389f" data-file-name="app/dashboard/reports/generate/page.tsx"><span className="editable-text" data-unique-id="a13d4d3b-e15a-4235-855b-3093ea055006" data-file-name="app/dashboard/reports/generate/page.tsx">Preview Laporan</span></h2>
            </div>
            
            {/* School Information */}
            <div className="text-center mb-6" data-unique-id="6057b5d3-4f1d-4b11-989d-82495fc4bf85" data-file-name="app/dashboard/reports/generate/page.tsx">
              <h3 className="text-lg font-bold uppercase" data-unique-id="ff357bdb-0530-4783-886a-06ede2bba77c" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true">{schoolInfo.name}</h3>
              <p className="text-gray-600" data-unique-id="f2ab4cb2-3f19-43cb-877e-6037ae6d7df7" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true">{schoolInfo.address}</p>
              <p className="text-gray-600" data-unique-id="de961774-3e77-4c5f-a33a-adf603fec9d2" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="5cfab56f-a907-4d76-8692-87637b87e3fb" data-file-name="app/dashboard/reports/generate/page.tsx">NPSN: </span>{schoolInfo.npsn}</p>
            </div>
            
            <div className="text-center mb-6" data-unique-id="eb3a30c2-5c27-4380-b555-77d919215c06" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true">
              <h3 className="text-lg uppercase font-bold" data-unique-id="b8fc247f-59bf-4649-a002-3f49c91151c1" data-file-name="app/dashboard/reports/generate/page.tsx"><span className="editable-text" data-unique-id="5695c4ff-2bac-482f-80ca-bbc2343517f4" data-file-name="app/dashboard/reports/generate/page.tsx">LAPORAN KEHADIRAN SISWA</span></h3>
              <p className="text-sm mt-1" data-unique-id="b9b66e8f-acef-4072-8b48-7637ecc6fb53" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="273d4190-9d51-42ce-a3bb-f57e9e8ae8d1" data-file-name="app/dashboard/reports/generate/page.tsx">
                Periode: </span>{format(new Date(dateRange.start), "d MMMM yyyy", {
              locale: id
            })}<span className="editable-text" data-unique-id="32f0997c-7b21-43b5-adbc-9dd0c96dded8" data-file-name="app/dashboard/reports/generate/page.tsx"> - </span>{format(new Date(dateRange.end), "d MMMM yyyy", {
              locale: id
            })}
              </p>
              {selectedClass !== "all" && <p className="text-sm mt-1" data-unique-id="497bb51f-4dc2-40e3-b440-6d73a28a8138" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="a2b8510f-7835-4e2a-b4c5-d8884b407453" data-file-name="app/dashboard/reports/generate/page.tsx">Kelas: </span>{selectedClass}</p>}
            </div>
            
            {/* Summary Statistics */}
            {template.includeStatistics && reportData.summary && <div className="mb-6" data-unique-id="0e14f28a-7f7c-40b5-a027-f09eef5d94a2" data-file-name="app/dashboard/reports/generate/page.tsx">
                <h4 className="font-semibold mb-3" data-unique-id="9e5b8b85-d602-4bf7-bde5-b6c2f3df68d1" data-file-name="app/dashboard/reports/generate/page.tsx"><span className="editable-text" data-unique-id="d5a1aa90-72a4-4b9e-a5d3-c50a12395edd" data-file-name="app/dashboard/reports/generate/page.tsx">Ringkasan Kehadiran</span></h4>
                <div className="overflow-x-auto" data-unique-id="a70e15f7-8b7c-419c-b958-6dc8b4065894" data-file-name="app/dashboard/reports/generate/page.tsx">
                  <table className="min-w-full bg-white border" data-unique-id="5d5aa063-9011-4935-ab1b-7087edc552b8" data-file-name="app/dashboard/reports/generate/page.tsx">
                    <thead className="bg-gray-50" data-unique-id="1e8ef484-4903-4ea0-82d7-112986719629" data-file-name="app/dashboard/reports/generate/page.tsx">
                      <tr data-unique-id="803221b5-c67f-4c3f-869c-ae1d29842be6" data-file-name="app/dashboard/reports/generate/page.tsx">
                        <th className="border px-4 py-2 text-left font-medium text-gray-700" data-unique-id="a234b422-9f3a-4a09-b17b-236943b7ab62" data-file-name="app/dashboard/reports/generate/page.tsx"><span className="editable-text" data-unique-id="2edea911-9897-4754-9029-0277df2322c3" data-file-name="app/dashboard/reports/generate/page.tsx">Status</span></th>
                        <th className="border px-4 py-2 text-center font-medium text-gray-700" data-unique-id="8a1744ea-d56e-48c9-8002-faabad066871" data-file-name="app/dashboard/reports/generate/page.tsx"><span className="editable-text" data-unique-id="da42f945-7ccc-4b5e-8d0c-9648346a105b" data-file-name="app/dashboard/reports/generate/page.tsx">Jumlah</span></th>
                        <th className="border px-4 py-2 text-center font-medium text-gray-700" data-unique-id="e59e0602-f2c4-4a77-8352-799646c47180" data-file-name="app/dashboard/reports/generate/page.tsx"><span className="editable-text" data-unique-id="a6f54b20-ea84-4f21-bdf7-b29352037f4e" data-file-name="app/dashboard/reports/generate/page.tsx">Persentase</span></th>
                      </tr>
                    </thead>
                    <tbody data-unique-id="7937dd6b-fe1a-4c95-9e51-cd3955868a19" data-file-name="app/dashboard/reports/generate/page.tsx">
                      <tr data-unique-id="e340732f-8812-454d-9456-282512fec30e" data-file-name="app/dashboard/reports/generate/page.tsx">
                        <td className="border px-4 py-2" data-unique-id="b42aeac2-03ae-4581-85cc-a68458e2eed6" data-file-name="app/dashboard/reports/generate/page.tsx"><span className="editable-text" data-unique-id="a8bdb9d2-f635-4203-a761-1ba65b14ceab" data-file-name="app/dashboard/reports/generate/page.tsx">Hadir</span></td>
                        <td className="border px-4 py-2 text-center" data-unique-id="715045af-cf4f-4d9e-9564-71d54d58908d" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true">{reportData.summary.present}</td>
                        <td className="border px-4 py-2 text-center" data-unique-id="9a80e876-8b4d-412c-b2b3-1503cb82495b" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true">{reportData.summary.presentPercentage}<span className="editable-text" data-unique-id="11725389-1622-4dad-b0fa-ff42dabfd507" data-file-name="app/dashboard/reports/generate/page.tsx">%</span></td>
                      </tr>
                      <tr className="bg-gray-50" data-unique-id="5eeda565-7968-4b3a-9a68-8801c45427ff" data-file-name="app/dashboard/reports/generate/page.tsx">
                        <td className="border px-4 py-2" data-unique-id="ab0fbef4-4942-4831-ac5d-36ae0eff9252" data-file-name="app/dashboard/reports/generate/page.tsx"><span className="editable-text" data-unique-id="22b200fb-d2c1-4583-a04a-27a522205ee4" data-file-name="app/dashboard/reports/generate/page.tsx">Sakit</span></td>
                        <td className="border px-4 py-2 text-center" data-unique-id="c5461393-bfc2-448d-bfa1-526b8b88c1f2" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true">{reportData.summary.sick}</td>
                        <td className="border px-4 py-2 text-center" data-unique-id="4fd812f2-1096-401c-bad3-b0ac1dc072e1" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true">{reportData.summary.sickPercentage}<span className="editable-text" data-unique-id="c67a2520-3d42-45f0-8039-10b3d1aa6d30" data-file-name="app/dashboard/reports/generate/page.tsx">%</span></td>
                      </tr>
                      <tr data-unique-id="6dbd35af-cf3b-45d9-b78b-5aa60b0b2736" data-file-name="app/dashboard/reports/generate/page.tsx">
                        <td className="border px-4 py-2" data-unique-id="69cd6315-d73f-4251-9733-a25ff8f574f7" data-file-name="app/dashboard/reports/generate/page.tsx"><span className="editable-text" data-unique-id="a16fcf4f-3117-45eb-a092-25f3c7b7046f" data-file-name="app/dashboard/reports/generate/page.tsx">Izin</span></td>
                        <td className="border px-4 py-2 text-center" data-unique-id="5ebd5a17-46ab-4714-ba2c-b617230ee11a" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true">{reportData.summary.permitted}</td>
                        <td className="border px-4 py-2 text-center" data-unique-id="d60f6502-858a-4265-9c20-efcb60d4b402" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true">{reportData.summary.permittedPercentage}<span className="editable-text" data-unique-id="b17644c2-be7d-4d23-b7c2-aa43570855c6" data-file-name="app/dashboard/reports/generate/page.tsx">%</span></td>
                      </tr>
                      <tr className="bg-gray-50" data-unique-id="98233fb8-abf4-49cf-b076-563ad35c2cd1" data-file-name="app/dashboard/reports/generate/page.tsx">
                        <td className="border px-4 py-2" data-unique-id="e1d7e66b-6507-4a02-ae9c-f86cf28c3a08" data-file-name="app/dashboard/reports/generate/page.tsx"><span className="editable-text" data-unique-id="08a78cca-bc6f-49dc-adac-13c06228f30a" data-file-name="app/dashboard/reports/generate/page.tsx">Alpha</span></td>
                        <td className="border px-4 py-2 text-center" data-unique-id="80d0476c-841d-40d8-90d9-4b8ad13e99a3" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true">{reportData.summary.absent}</td>
                        <td className="border px-4 py-2 text-center" data-unique-id="d6db2570-4560-4e2a-8279-3ed370158917" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true">{reportData.summary.absentPercentage}<span className="editable-text" data-unique-id="513624a6-dce7-484c-b74c-d990821d33dc" data-file-name="app/dashboard/reports/generate/page.tsx">%</span></td>
                      </tr>
                      <tr className="font-semibold" data-unique-id="e202c7bd-2660-43cc-a55d-ff6f9c7c35a0" data-file-name="app/dashboard/reports/generate/page.tsx">
                        <td className="border px-4 py-2" data-unique-id="cbc0e361-7067-47b7-ae41-6064d419758c" data-file-name="app/dashboard/reports/generate/page.tsx"><span className="editable-text" data-unique-id="7533703a-91fe-417c-91d3-36957bd7686b" data-file-name="app/dashboard/reports/generate/page.tsx">Total</span></td>
                        <td className="border px-4 py-2 text-center" data-unique-id="1d77af27-d80d-4b05-8050-9b513020437f" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true">{reportData.summary.total}</td>
                        <td className="border px-4 py-2 text-center" data-unique-id="15607492-b2fc-4447-bce2-9c6933cba0ad" data-file-name="app/dashboard/reports/generate/page.tsx"><span className="editable-text" data-unique-id="f419d4df-d8d2-4e05-95fc-bba87b2079f2" data-file-name="app/dashboard/reports/generate/page.tsx">100%</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>}
            
            {/* Attendance Records */}
            {template.fields.includes("attendance") && reportData.records && <div data-unique-id="21dbcffd-b6b9-4250-bbf6-377641b2a21f" data-file-name="app/dashboard/reports/generate/page.tsx">
                <h4 className="font-semibold mb-3" data-unique-id="d6ca7efe-df0a-4e57-a23a-bbd0c622aafd" data-file-name="app/dashboard/reports/generate/page.tsx"><span className="editable-text" data-unique-id="1f99beb2-f9e5-4b48-97bc-bc7b0413b71f" data-file-name="app/dashboard/reports/generate/page.tsx">Detail Kehadiran</span></h4>
                <div className="overflow-x-auto" data-unique-id="a741a9ae-351a-4fce-92c8-e4a66bff45e5" data-file-name="app/dashboard/reports/generate/page.tsx">
                  <table className="min-w-full bg-white border" data-unique-id="a70fdbb4-5d37-45de-8955-6091734d65fe" data-file-name="app/dashboard/reports/generate/page.tsx">
                    <thead className="bg-gray-50" data-unique-id="0393459c-bb6c-4d4b-859a-5630092ab7b4" data-file-name="app/dashboard/reports/generate/page.tsx">
                      <tr data-unique-id="8b207527-8c8c-4840-80d5-8dfbb1666ea9" data-file-name="app/dashboard/reports/generate/page.tsx">
                        <th className="border px-4 py-2 text-left font-medium text-gray-700" data-unique-id="719a0cc5-ffe3-48c5-a766-9805a460d02b" data-file-name="app/dashboard/reports/generate/page.tsx"><span className="editable-text" data-unique-id="09f41dbd-1b7e-4dcc-9de1-3cae6ba8ea5f" data-file-name="app/dashboard/reports/generate/page.tsx">Tanggal</span></th>
                        <th className="border px-4 py-2 text-left font-medium text-gray-700" data-unique-id="23c51fb2-8514-4bdb-bd68-f378914b26a8" data-file-name="app/dashboard/reports/generate/page.tsx"><span className="editable-text" data-unique-id="956b10b2-7c52-4497-8c06-19a4a5fbc8f1" data-file-name="app/dashboard/reports/generate/page.tsx">Nama Siswa</span></th>
                        <th className="border px-4 py-2 text-center font-medium text-gray-700" data-unique-id="ffa2c98e-5ff2-4359-8163-ee2f39292028" data-file-name="app/dashboard/reports/generate/page.tsx"><span className="editable-text" data-unique-id="9e6c8338-9157-46e4-af13-4ec4ebbf444c" data-file-name="app/dashboard/reports/generate/page.tsx">Kelas</span></th>
                        <th className="border px-4 py-2 text-center font-medium text-gray-700" data-unique-id="430d4bb1-888d-4601-9b98-495d891e1826" data-file-name="app/dashboard/reports/generate/page.tsx"><span className="editable-text" data-unique-id="5436a917-2a7d-48b7-b063-c0b0588f9155" data-file-name="app/dashboard/reports/generate/page.tsx">Status</span></th>
                        <th className="border px-4 py-2 text-center font-medium text-gray-700" data-unique-id="1ab39adf-0fbf-4f4e-9d47-5ffcccc2adb8" data-file-name="app/dashboard/reports/generate/page.tsx"><span className="editable-text" data-unique-id="e93b122e-0e05-4593-8941-bb440c5c1998" data-file-name="app/dashboard/reports/generate/page.tsx">Waktu</span></th>
                      </tr>
                    </thead>
                    <tbody data-unique-id="8648cfda-e0e2-4b11-9e15-f06623874a1b" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true">
                      {reportData.records.slice(0, 10).map((record: any, index: number) => {
                  // Format date from YYYY-MM-DD to DD-MM-YYYY
                  const dateParts = record.date.split('-');
                  const formattedDate = dateParts.length === 3 ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}` : record.date;

                  // Get status text
                  const statusText = record.status === 'present' || record.status === 'hadir' ? 'Hadir' : record.status === 'sick' || record.status === 'sakit' ? 'Sakit' : record.status === 'permitted' || record.status === 'izin' ? 'Izin' : record.status === 'absent' || record.status === 'alpha' ? 'Alpha' : record.status;
                  return <tr key={record.id} className={index % 2 === 0 ? "bg-gray-50" : ""} data-unique-id="6daf5447-4531-42a4-9166-584b99f22943" data-file-name="app/dashboard/reports/generate/page.tsx">
                            <td className="border px-4 py-2" data-unique-id="4513c1eb-d011-4bb6-9953-9a9a9b682a02" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true">{formattedDate}</td>
                            <td className="border px-4 py-2" data-unique-id="18eb0ed2-9a79-4d60-845c-8124f9394d43" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true">{record.studentName}</td>
                            <td className="border px-4 py-2 text-center" data-unique-id="595ba273-1543-49bd-bf55-32b805c9fdc2" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true">{record.class}</td>
                            <td className="border px-4 py-2 text-center" data-unique-id="ed52c56d-7538-40e3-9fe7-8f901dc9d3c0" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true">{statusText}</td>
                            <td className="border px-4 py-2 text-center" data-unique-id="03209b4f-984b-45b2-b155-955823bfa81e" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true">{record.time}</td>
                          </tr>;
                })}
                      {reportData.records.length > 10 && <tr data-unique-id="50cb57e9-dd5e-4116-8cd1-ebf409ce6b10" data-file-name="app/dashboard/reports/generate/page.tsx">
                          <td colSpan={5} className="border px-4 py-2 text-center text-gray-500" data-unique-id="e9b20f47-22f9-4fbf-93c2-27cd9d949fb2" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true"><span className="editable-text" data-unique-id="a250ced6-57a1-421f-8eeb-331f47065d00" data-file-name="app/dashboard/reports/generate/page.tsx">
                            ... dan </span>{reportData.records.length - 10}<span className="editable-text" data-unique-id="0db7b882-37e6-4e41-a6b9-74945d277f15" data-file-name="app/dashboard/reports/generate/page.tsx"> data lainnya
                          </span></td>
                        </tr>}
                      {reportData.records.length === 0 && <tr data-unique-id="37e6c153-2917-4ff0-a797-000827430b93" data-file-name="app/dashboard/reports/generate/page.tsx">
                          <td colSpan={5} className="border px-4 py-2 text-center text-gray-500" data-unique-id="63c930c4-f901-415b-b5a9-04b7b5a2190d" data-file-name="app/dashboard/reports/generate/page.tsx"><span className="editable-text" data-unique-id="ae1d874e-8896-4ded-958b-dcc84cf28f47" data-file-name="app/dashboard/reports/generate/page.tsx">
                            Tidak ada data kehadiran yang ditemukan
                          </span></td>
                        </tr>}
                    </tbody>
                  </table>
                </div>
              </div>}
          </div>
          
          {/* Download Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" data-unique-id="04c8ed2f-1dab-4fdc-8948-1feca2cf1eae" data-file-name="app/dashboard/reports/generate/page.tsx">
            <button onClick={handleGeneratePDF} disabled={isGenerating} className="flex items-center justify-center gap-3 bg-red-600 text-white p-4 rounded-lg hover:bg-red-700 transition-colors" data-unique-id="cab68463-89cd-4c85-a372-378181d9ec98" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true">
              {isGenerating ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileText className="h-6 w-6" />}
              <span className="font-medium" data-unique-id="9cee221f-e037-443b-aa27-170e9d774b92" data-file-name="app/dashboard/reports/generate/page.tsx"><span className="editable-text" data-unique-id="fcb6310d-6911-409c-8bb4-2b1d1e828974" data-file-name="app/dashboard/reports/generate/page.tsx">Download Laporan PDF</span></span>
            </button>
            
            <button onClick={handleGenerateExcel} disabled={isGenerating} className="flex items-center justify-center gap-3 bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors" data-unique-id="00fff852-cc0a-4c6e-98ce-19bd73d44506" data-file-name="app/dashboard/reports/generate/page.tsx" data-dynamic-text="true">
              {isGenerating ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileSpreadsheet className="h-6 w-6" />}
              <span className="font-medium" data-unique-id="8b79705a-7ee9-4384-929c-fffe6f0c0480" data-file-name="app/dashboard/reports/generate/page.tsx"><span className="editable-text" data-unique-id="5f7cfc9f-7cee-442e-af29-edfb2d654b34" data-file-name="app/dashboard/reports/generate/page.tsx">Download Laporan Excel</span></span>
            </button>
          </div>
        </> : <div className="bg-white rounded-xl shadow-sm p-10 text-center" data-unique-id="936aa36a-ef41-4c15-ab3b-5b7277db4561" data-file-name="app/dashboard/reports/generate/page.tsx">
          <div className="flex flex-col items-center" data-unique-id="a0a6930b-5e35-46fa-ad57-734ffb4baab5" data-file-name="app/dashboard/reports/generate/page.tsx">
            <div className="bg-gray-100 rounded-full p-3 mb-4" data-unique-id="f58154ed-caff-4866-b51f-88eadbdf4248" data-file-name="app/dashboard/reports/generate/page.tsx">
              <AlertTriangle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2" data-unique-id="7ba2ecdb-9163-4a1b-9680-c0d0329528ff" data-file-name="app/dashboard/reports/generate/page.tsx"><span className="editable-text" data-unique-id="13e4b84d-023c-49f0-bfb0-2e7be0fc27a1" data-file-name="app/dashboard/reports/generate/page.tsx">Template Tidak Ditemukan</span></h3>
            <p className="text-gray-500 mb-6" data-unique-id="ba29af38-a87b-47c0-b6d6-5bbfcae65321" data-file-name="app/dashboard/reports/generate/page.tsx"><span className="editable-text" data-unique-id="54bd4779-bf80-4dd2-9b8b-6d8debd5f98f" data-file-name="app/dashboard/reports/generate/page.tsx">
              Template yang Anda cari tidak ditemukan atau tidak valid.
            </span></p>
            <Link href="/dashboard/reports/templates" className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary hover:bg-opacity-90 transition-colors" data-unique-id="cb2ddd2d-bc80-4168-a4d1-2e9acf73915d" data-file-name="app/dashboard/reports/generate/page.tsx">
              <ArrowLeft size={18} /><span className="editable-text" data-unique-id="045d17fa-29d5-41ed-99f9-18f10194cb80" data-file-name="app/dashboard/reports/generate/page.tsx">
              Kembali ke Daftar Template
            </span></Link>
          </div>
        </div>}
    </div>;
}