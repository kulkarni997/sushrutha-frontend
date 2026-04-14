import { useRef, useState } from "react";

export default function CameraCapture({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [captured, setCaptured] = useState(null);
  const [mode, setMode] = useState(null); // 'camera' | 'upload'

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setStreaming(true);
      setMode("camera");
    } catch (err) {
      alert("Camera access denied. Please allow camera or upload an image instead.");
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const base64 = canvas.toDataURL("image/jpeg");
    setCaptured(base64);
    onCapture(base64);
    // stop camera
    video.srcObject?.getTracks().forEach(t => t.stop());
    setStreaming(false);
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMode("upload");
    const reader = new FileReader();
    reader.onload = () => {
      setCaptured(reader.result);
      onCapture(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const reset = () => {
    setCaptured(null);
    setMode(null);
    setStreaming(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {!captured && !streaming && (
        <div className="flex gap-3">
          <button
            onClick={startCamera}
            className="px-4 py-2 bg-[#E8A020] text-[#0D0B08] rounded-lg font-semibold hover:opacity-90"
          >
            📷 Use Camera
          </button>
          <label className="px-4 py-2 bg-[#1C1712] border border-[#2E2820] text-[#F5EDD6] rounded-lg font-semibold cursor-pointer hover:border-[#E8A020]">
            🖼 Upload Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
          </label>
        </div>
      )}

      {streaming && (
        <div className="flex flex-col items-center gap-3">
          <video ref={videoRef} className="rounded-lg w-72 h-52 object-cover border border-[#2E2820]" />
          <button
            onClick={capturePhoto}
            className="px-6 py-2 bg-[#E8A020] text-[#0D0B08] rounded-lg font-semibold"
          >
            Capture
          </button>
        </div>
      )}

      {captured && (
        <div className="flex flex-col items-center gap-3">
          <img src={captured} alt="Captured" className="rounded-lg w-72 h-52 object-cover border border-[#4A7C59]" />
          <button onClick={reset} className="text-sm text-[#A89880] underline">
            Retake / Change
          </button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}