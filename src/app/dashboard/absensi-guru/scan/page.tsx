"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import moment from "moment-timezone";

const MODELS_PATH = "/models";

const AbsensiGuruScanPage = () => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [faceapi, setFaceapi] = useState<any>(null);
  const [isModelsLoaded, setModelsLoaded] = useState(false);
  const [isCapturing, setCapturing] = useState(false);
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });

  // Load face-api.js and models
  useEffect(() => {
    const loadFaceApi = async () => {
      try {
        const faceapiModule = await import("face-api.js");
        setFaceapi(faceapiModule);

        await Promise.all([
          faceapiModule.nets.tinyFaceDetector.loadFromUri(MODELS_PATH),
          faceapiModule.nets.faceLandmark68Net.loadFromUri(MODELS_PATH),
          faceapiModule.nets.faceRecognitionNet.loadFromUri(MODELS_PATH),
        ]);

        setModelsLoaded(true);
        console.log("Face-api models loaded.");
      } catch (err) {
        console.error("Gagal memuat model face-api.js", err);
        toast.error("Gagal memuat model face-api.js");
      }
    };

    loadFaceApi();
  }, []);

  // Get location once
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        toast.error("Gagal mendapatkan lokasi");
        console.error(err);
      }
    );
  }, []);

  // Start webcam once models loaded
  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Gagal mengakses kamera:", error);
        toast.error("Gagal mengakses kamera");
      }
    };

    if (isModelsLoaded) {
      startVideo();
    }
  }, [isModelsLoaded]);

  const takeAttendance = async () => {
    if (!faceapi || !videoRef.current) return;

    setCapturing(true);

    const result = await faceapi.detectSingleFace(
      videoRef.current,
      new faceapi.TinyFaceDetectorOptions()
    );

    if (result) {
      toast.success("Wajah terdeteksi, absensi berhasil");
      setTimeout(() => {
        router.push("/absensi/sukses");
      }, 1000);
    } else {
      toast.error("Wajah tidak terdeteksi. Coba lagi.");
    }

    setCapturing(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-6 px-4">
      <Card className="p-4 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-xl font-bold mb-4 text-center">Scan Wajah Guru</h1>
        <video ref={videoRef} autoPlay muted playsInline className="rounded-xl w-full h-auto mb-4" />
        <button
          onClick={takeAttendance}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl w-full"
          disabled={!isModelsLoaded || isCapturing}
        >
          {isCapturing ? "Memindai..." : "Ambil Absensi"}
        </button>
        <p className="text-xs text-center text-gray-500 mt-3">
          Lokasi Anda: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </p>
      </Card>
    </div>
  );
};

export default AbsensiGuruScanPage;
