"use client";

import React from "react";
import { QrCode, Info, LinkIcon, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";
export default function QRInstructionsPage() {
  return <div className="max-w-4xl mx-auto pb-20 md:pb-6 px-3 sm:px-4 md:px-6" data-unique-id="e9a54397-b680-42d8-88da-da52a6c87c5a" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
      <div className="flex items-center mb-6" data-unique-id="7e8dd95f-7026-49e4-b0fc-93406a2a4b3e" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
        <Link href="/dashboard/students/qr" className="p-2 mr-2 hover:bg-gray-100 rounded-full" data-unique-id="0c99acb0-2657-4b70-b319-b65bdc59d1e2" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
          <ArrowLeft size={20} />
        </Link>
        <QrCode className="h-7 w-7 text-primary mr-3" />
        <h1 className="text-2xl font-bold text-gray-800" data-unique-id="8b5fe6b2-a0b6-44c9-a51d-2e9c4fe19d50" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="8a84b5bc-037f-4c86-8bc3-2af438e2c8fd" data-file-name="app/dashboard/students/qr/instructions/page.tsx">Panduan QR Code</span></h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6" data-unique-id="0ae32de7-4ff3-4704-8c4b-aff682b9ef60" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
        <div className="flex items-center mb-4" data-unique-id="fd99332f-4232-4deb-a76c-babee5434196" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
          <div className="bg-blue-100 p-2 rounded-lg mr-3" data-unique-id="b231e508-f95b-48e1-87de-5111b8a77cdc" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
            <Info className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold" data-unique-id="4070034f-0558-4e3d-8bfa-a752983a873f" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="ba0cc672-43eb-4dd3-9730-0dfc0fa29371" data-file-name="app/dashboard/students/qr/instructions/page.tsx">Cara Membuat QR Code untuk Sistem Absensi</span></h2>
        </div>
        
        <div className="prose max-w-full" data-unique-id="92882517-29d3-41bf-88b8-53ae132df7e6" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
          <p className="text-gray-700" data-unique-id="751bbf36-4608-4151-827b-b4bb64bf7407" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="9fc23fa3-ed6b-442a-94f2-f3cd94bba2b3" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
            QR Code yang digunakan dalam sistem absensi ini berisi NISN (Nomor Induk Siswa Nasional)
            yang berfungsi sebagai ID unik untuk mengidentifikasi siswa pada saat melakukan absensi.
          </span></p>
          
          <h3 className="text-lg font-medium mt-6 mb-3" data-unique-id="b2b827fa-7ab1-4d65-85f2-5c2207e8ff75" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="e12296ac-53e0-4848-bec1-ca86faed9254" data-file-name="app/dashboard/students/qr/instructions/page.tsx">Langkah-langkah membuat QR Code:</span></h3>
          
          <ol className="space-y-4 list-decimal list-inside" data-unique-id="3d75c8ae-dffe-4f30-86f3-61e59569f4b5" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
            <li className="text-gray-700" data-unique-id="304b11c5-6f3c-48b5-88a9-559823e42699" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
              <span className="font-medium" data-unique-id="e80cd652-591f-4c8f-b337-f89ce6cd5d33" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="05203f50-64d7-4c12-9efb-c012f178d876" data-file-name="app/dashboard/students/qr/instructions/page.tsx">Kunjungi situs pembuat QR Code</span></span>
              <p className="mt-1 ml-6" data-unique-id="ba3c9522-9601-48c1-a3f0-860b7d3e8bdd" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="33e4249d-57d1-4354-a2ad-02723b2e677b" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
                Buka situs </span><a href="https://qrcode.tec-it.com/en" target="_blank" rel="noopener noreferrer" className="text-blue-600 flex items-center" data-unique-id="25f49488-6604-4df8-a4d8-e73f2379f2e7" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="52aaea34-1969-41ac-8872-5f799bf96d3d" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
                  QR Code Generator
                  </span><ExternalLink className="h-3 w-3 ml-1 inline-block" />
                </a>
              </p>
            </li>
            
            <li className="text-gray-700" data-unique-id="417c884a-cd52-480c-8c47-b09ae41817c6" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
              <span className="font-medium" data-unique-id="c3718abb-d0b5-4a0b-adb5-dfd135fdc5f9" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="a176f9cd-bab8-466e-9b8a-e2a07bfccdda" data-file-name="app/dashboard/students/qr/instructions/page.tsx">Masukkan NISN siswa di kolom "Your Data"</span></span>
              <p className="mt-1 ml-6" data-unique-id="0fd43768-f579-4f5b-9226-fd9b10600215" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="a1847b15-eb84-4c41-9a7c-f36be63b5e20" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
                Pada halaman utama, masukkan NISN siswa di kolom input "Your Data" untuk membuat QR Code.
              </span></p>
            </li>
            
            <li className="text-gray-700" data-unique-id="c9971122-cbce-4fef-815d-fde931bee01d" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
              <span className="font-medium" data-unique-id="49a9575d-eab9-4a9a-980a-58032d421789" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="607d5102-26c9-4163-a89f-34892672423c" data-file-name="app/dashboard/students/qr/instructions/page.tsx">Masukkan NISN siswa</span></span>
              <p className="mt-1 ml-6" data-unique-id="82fff25b-c603-402d-8ff0-6ea99c30e789" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="f5afec04-e440-4319-9d14-ebd6ef3f3ae0" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
                Masukkan NISN siswa tanpa spasi atau karakter khusus lainnya. Contoh: "0012345678"
              </span></p>
            </li>
            
            <li className="text-gray-700" data-unique-id="8f4f7e81-29c8-4e6f-88d7-50ca04e0ca84" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
              <span className="font-medium" data-unique-id="b6fd203e-f5af-4ac7-8cd7-c99c70d3c490" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="11ea9eaa-4f71-45d9-818f-e7e007240f04" data-file-name="app/dashboard/students/qr/instructions/page.tsx">Sesuaikan pengaturan QR Code (opsional)</span></span>
              <p className="mt-1 ml-6" data-unique-id="d6c3ae67-3634-4c72-b915-5520a065d3c8" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="68f657f0-85da-46ea-a547-2a08fd8c0855" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
                Anda dapat menyesuaikan ukuran, warna, dan koreksi kesalahan QR Code di bagian "QR Code Settings". 
                Disarankan menggunakan Error Correction Level "H" untuk ketahanan QR Code yang lebih baik.
              </span></p>
            </li>
            
            <li className="text-gray-700" data-unique-id="20e61fa8-9cc0-41a6-8862-ff18c8f19011" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
              <span className="font-medium" data-unique-id="3bbc71ae-0486-486f-8cfe-bbd57c0b37bf" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="7df5ce79-aa50-4b0e-b6f3-72fe2aa23022" data-file-name="app/dashboard/students/qr/instructions/page.tsx">Unduh QR Code</span></span>
              <p className="mt-1 ml-6" data-unique-id="11e31280-599f-445b-9356-eee8c5246bd2" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="2a013ec9-1d0d-4dfd-a4a0-7a024210ab2a" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
                Setelah QR Code dibuat, klik tombol "Download" dan pilih format gambar yang diinginkan (PNG atau SVG direkomendasikan untuk kualitas terbaik).
              </span></p>
            </li>
            
            <li className="text-gray-700" data-unique-id="34ac0567-4535-4eb5-9bdb-a5affc0d6033" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
              <span className="font-medium" data-unique-id="0a53ed2a-4d53-4848-b590-8e3ea318e0df" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="fcc050ca-d388-486e-9413-0a872490a69f" data-file-name="app/dashboard/students/qr/instructions/page.tsx">Cetak QR Code</span></span>
              <p className="mt-1 ml-6" data-unique-id="0454eeb5-a20a-4c92-8ce4-5d0a04056ade" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="7fd89992-fc0e-486a-b5bb-c59c3a5c020a" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
                Cetak QR Code dan tempelkan pada kartu identitas siswa atau buku siswa.
              </span></p>
            </li>
          </ol>
          
          <div className="bg-yellow-50 p-4 rounded-lg mt-6 border border-yellow-200" data-unique-id="f2aba25d-6b52-4587-80d7-dc4fc61e4a1d" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
            <h4 className="text-yellow-800 font-medium mb-2" data-unique-id="4eaa0e8c-9421-4451-9fe8-3f94f14ebb3d" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="b4111960-7767-4219-aa8d-c7585ff5b877" data-file-name="app/dashboard/students/qr/instructions/page.tsx">Penting!</span></h4>
            <p className="text-yellow-700 text-sm" data-unique-id="a6398339-75be-403f-a16f-3c06e2f8d76b" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="0b567e65-d5dc-4aed-b0aa-49cd0c2bea5b" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
              Pastikan QR Code dapat dipindai dengan jelas. Untuk hasil terbaik:
            </span></p>
            <ul className="text-yellow-700 text-sm mt-2 list-disc list-inside" data-unique-id="61009227-57fb-4cfb-ac4d-f155236e3b9e" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
              <li data-unique-id="77cf3ed8-c5bb-44e1-b409-f62a6765fdf6" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="8ef9a0c5-c462-476c-9e4a-203602b22271" data-file-name="app/dashboard/students/qr/instructions/page.tsx">Cetak dengan kualitas tinggi</span></li>
              <li data-unique-id="87c64e97-8ca8-4f8f-8f60-f3ac4e7b73fa" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="83ee688e-b7b2-4366-a940-2c854ddeefa0" data-file-name="app/dashboard/students/qr/instructions/page.tsx">Hindari menempatkan QR Code pada permukaan yang mengkilap</span></li>
              <li data-unique-id="0adc5fc3-07ff-4d9a-9679-241ee602b1f6" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="bbee966f-61be-4d59-92f4-2beb020f46b2" data-file-name="app/dashboard/students/qr/instructions/page.tsx">Pastikan ukuran QR Code minimal 2x2 cm</span></li>
              <li data-unique-id="0bd6fc59-c15d-4ce0-a758-29ff47d047d5" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="5b958a29-a825-49db-a58c-831800861a29" data-file-name="app/dashboard/students/qr/instructions/page.tsx">Jangan menekuk atau melipat bagian kertas yang berisi QR Code</span></li>
            </ul>
          </div>
          
          <h3 className="text-lg font-medium mt-6 mb-3" data-unique-id="22c9dbe5-5923-463f-9d93-f1f6109d509b" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="020f81cc-3d13-462d-8bce-487e1a169eb3" data-file-name="app/dashboard/students/qr/instructions/page.tsx">Integrasi dengan Telegram:</span></h3>
          <p className="text-gray-700" data-unique-id="e6df7361-6b9d-400f-adcc-1917eeb3dfc1" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="8d487c6a-6093-4d20-89ff-5650912d5432" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
            Sistem absensi ini terintegrasi dengan Bot Telegram untuk mengirimkan notifikasi kepada orang tua siswa. 
            Untuk mengaktifkan fitur ini:
          </span></p>
          
          <ol className="space-y-4 list-decimal list-inside mt-4" data-unique-id="26dbeb76-0155-42bc-a4ee-7745db4a1be8" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
            <li className="text-gray-700" data-unique-id="52e9d99b-f7b1-4c13-b084-4c891ea32087" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
              <span className="font-medium" data-unique-id="ad8dc336-ed28-4e77-a8b4-469cb8090852" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="846f2cf3-b695-4165-aeff-671f40c47431" data-file-name="app/dashboard/students/qr/instructions/page.tsx">Cari Bot Telegram</span></span>
              <p className="mt-1 ml-6" data-unique-id="d8e8ca35-5577-48ff-a098-6f76cb10deca" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="f7ef6eca-6e72-4f29-84ad-3c04b5aea468" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
                Buka aplikasi Telegram dan cari bot </span><span className="font-semibold" data-unique-id="cc8ffb8e-2dd7-4cf8-b36f-452cd20eeb33" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="ac911a0a-e05c-4e96-bbca-f799b69f11b2" data-file-name="app/dashboard/students/qr/instructions/page.tsx">@AbsensiDigitalBot</span></span>
              </p>
            </li>
            
            <li className="text-gray-700" data-unique-id="783c2ed8-fe6b-4872-9f3d-0b70043a9250" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
              <span className="font-medium" data-unique-id="b701c4d6-3e86-46c5-a93f-646c547e1c02" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="5ebd2f98-2ab0-432b-972d-f97c78d63b94" data-file-name="app/dashboard/students/qr/instructions/page.tsx">Mulai percakapan dengan bot</span></span>
              <p className="mt-1 ml-6" data-unique-id="fdb7e3d4-992d-4112-8f5c-7525cb4ebea6" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="b2d98fa4-3055-4e05-a417-97976dbbc9fd" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
                Klik "Start" atau ketik "/start" untuk memulai percakapan dengan bot.
              </span></p>
            </li>
            
            <li className="text-gray-700" data-unique-id="82918647-2c66-4148-9105-e870d99e3d34" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
              <span className="font-medium" data-unique-id="2016a718-9c6b-487f-8fc7-5f7cdb443987" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="e5405288-3a07-4b67-87b1-1da8d02d21dd" data-file-name="app/dashboard/students/qr/instructions/page.tsx">Dapatkan Telegram Chat ID</span></span>
              <p className="mt-1 ml-6" data-unique-id="c40422cb-1f55-41fb-be95-1a899497fab1" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="b14e015a-fdb9-4a44-87e9-f9faa30b5f90" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
                Ketik "/id" untuk mendapatkan Chat ID Telegram Anda. Ini yang akan digunakan sebagai telegramNumber siswa.
              </span></p>
            </li>
            
            <li className="text-gray-700" data-unique-id="ab5acff8-db7d-42a6-81db-e51d8e80c7e3" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
              <span className="font-medium" data-unique-id="e2e64950-378e-4769-aa9c-7c36da0bc872" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="5364c4bf-3e70-44ec-980c-b65f76e91466" data-file-name="app/dashboard/students/qr/instructions/page.tsx">Update data siswa</span></span>
              <p className="mt-1 ml-6" data-unique-id="ec9f6f72-cec2-48ae-87c8-a14edb7260f6" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="785e55f0-40fb-4e1c-bc90-1af1b374a640" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
                Masukkan Chat ID tersebut sebagai nomor Telegram pada profil siswa di sistem.
              </span></p>
            </li>
          </ol>
          
          <div className="bg-blue-50 p-4 rounded-lg mt-6 border border-blue-200" data-unique-id="4f0e801e-650c-4179-a0c0-970dd72beb36" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
            <h4 className="text-blue-800 font-medium mb-2" data-unique-id="fcc4b740-26b6-4f72-b815-c26247316773" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="1444ba65-4892-4f97-b06d-e368c41ffa37" data-file-name="app/dashboard/students/qr/instructions/page.tsx">Link Bot Telegram</span></h4>
            <div className="flex items-center" data-unique-id="e82bbb1c-c4ea-4e95-be5e-47682cbb1e92" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
              <LinkIcon className="h-4 w-4 text-blue-600 mr-2" />
              <a href="https://t.me/AbsensiDigitalBot" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" data-unique-id="05283c78-a66e-4061-b612-936557ccf294" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="9518e68f-0c57-462a-844c-c3c0bd9a5089" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
                t.me/AbsensiDigitalBot
              </span></a>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg mt-6 border border-green-200" data-unique-id="736c0e8f-d577-41b0-af09-00cb888b8dc3" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
            <h4 className="text-green-800 font-medium mb-2" data-unique-id="8aa39a3c-22e4-415c-9043-af2a837c9a2a" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="490dc49d-b6ab-44a5-9898-f4e08f8ed4d5" data-file-name="app/dashboard/students/qr/instructions/page.tsx">Konfigurasi Bot Telegram</span></h4>
            <p className="text-green-700 text-sm" data-unique-id="dd132278-6f8d-460d-ab2d-e03622e1355d" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="eae06313-b652-4b1b-8094-560e5625c1e8" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
              Bot Telegram yang digunakan:
            </span></p>
            <ul className="text-green-700 text-sm mt-2 list-disc list-inside" data-unique-id="856d3352-2f78-404c-a3cd-10e35649d316" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
              <li data-unique-id="72eec87b-e914-4084-8c78-f12025177c34" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="font-medium" data-unique-id="d619e525-a4d3-46fd-95c3-b704dcaec1c1" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="407c53f9-271b-4ea0-981c-6cd1d1ee83cb" data-file-name="app/dashboard/students/qr/instructions/page.tsx">Nama Bot:</span></span><span className="editable-text" data-unique-id="cef38f7a-0eb3-4bfc-9673-a98591144689" data-file-name="app/dashboard/students/qr/instructions/page.tsx"> AbsensiDigitalBot</span></li>
              <li data-unique-id="63d5f992-bcad-4cd5-a69c-49f97eac2098" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="font-medium" data-unique-id="a48e30a7-64bf-4d74-8c35-cd4d289ffc9e" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="6bac0d0c-f488-4477-b46e-85b0902b27a9" data-file-name="app/dashboard/students/qr/instructions/page.tsx">Username:</span></span><span className="editable-text" data-unique-id="df27f9a9-e664-41c8-a694-3bd21296ae8b" data-file-name="app/dashboard/students/qr/instructions/page.tsx"> @AbsensiDigitalBot</span></li>
              <li data-unique-id="c6db1938-4a02-4bb8-89b2-3fd74cf338fc" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="font-medium" data-unique-id="45187b22-37d0-4c7b-b6e9-3811a912892b" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="16ccd954-389b-47b0-a1c6-228ddd6923b5" data-file-name="app/dashboard/students/qr/instructions/page.tsx">Token Bot:</span></span><span className="editable-text" data-unique-id="d7fc7a35-0010-4f05-8ea7-a460eff852bb" data-file-name="app/dashboard/students/qr/instructions/page.tsx"> 7662377324:AAEFhwY-y1q3IrX4OEJAUG8VLa8DqNndH6E</span></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-center" data-unique-id="e71a3f66-58a1-44ff-952e-0b8e8a118243" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
        <Link href="/dashboard/scan" className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors" data-unique-id="eeb41a8e-d75f-4b2e-98de-7bcc32c8d876" data-file-name="app/dashboard/students/qr/instructions/page.tsx"><span className="editable-text" data-unique-id="cfad780b-b151-48f6-a5a0-a26c1c58eb32" data-file-name="app/dashboard/students/qr/instructions/page.tsx">
          Kembali ke Halaman Scan
        </span></Link>
      </div>
    </div>;
}