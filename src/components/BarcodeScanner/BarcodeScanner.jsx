import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, BarcodeFormat } from "@zxing/browser";

export function BarcodeScanner() {
  const [barcode, setBarcode] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(true);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [scanMode, setScanMode] = useState("normal"); // "normal" | "fast"
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isFocusing, setIsFocusing] = useState(false);
  const videoRef = useRef();
  const codeReaderRef = useRef(null);
  const streamRef = useRef(null);
  const lastScanTimeRef = useRef(0);
  const trackRef = useRef(null);

  // Configuración de hints para mejorar la detección
  const hints = new Map();
  hints.set("formats", [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.CODE_39,
    BarcodeFormat.CODE_128,
    BarcodeFormat.QR_CODE
  ]);
  hints.set("tryHarder", true);

  // Configuración de la cámara con soporte para flash y enfoque
  const cameraConstraints = {
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: "environment",
      frameRate: { ideal: 30 },
      advanced: [
        {
          torch: true,
          focusMode: "continuous"
        }
      ]
    }
  };

  // Función para reproducir un beep
  function playBeep() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    gain.gain.value = 0.1;
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      ctx.close();
    }, 120);
  }

  // Función para controlar la linterna
  const toggleFlash = async () => {
    if (!trackRef.current) return;

    try {
      const capabilities = trackRef.current.getCapabilities();
      if (capabilities.torch) {
        await trackRef.current.applyConstraints({
          advanced: [{ torch: flashEnabled }]
        });
        setFlashEnabled(!flashEnabled);
      } else {
        console.log("La cámara no soporta linterna");
      }
    } catch (err) {
      console.error("Error al controlar la linterna:", err);
    }
  };

  // Función para forzar el enfoque
  const triggerFocus = async () => {
    if (!trackRef.current) return;

    try {
      const capabilities = trackRef.current.getCapabilities();
      if (capabilities.focusMode && capabilities.focusMode.includes("manual")) {
        setIsFocusing(true);
        await trackRef.current.applyConstraints({
          advanced: [{ focusMode: "manual", focusDistance: 0 }]
        });
        // Esperar un momento y volver a enfoque automático
        setTimeout(async () => {
          await trackRef.current.applyConstraints({
            advanced: [{ focusMode: "continuous" }]
          });
          setIsFocusing(false);
        }, 1000);
      }
    } catch (err) {
      console.error("Error al enfocar:", err);
      setIsFocusing(false);
    }
  };

  const resetCamera = async () => {
    console.log("Iniciando reinicio de cámara...");
    setScanning(false);
    setFlashEnabled(false);
    setIsFocusing(false);

    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => {
        console.log("Deteniendo track:", track.label);
        track.stop();
      });
      videoRef.current.srcObject = null;
    }

    trackRef.current = null;
    setError("");
    setIsCameraReady(false);
    setBarcode(null);
    setSuccess(false);
    lastScanTimeRef.current = 0;

    await new Promise(resolve => setTimeout(resolve, 1000));
    setScanning(true);
  };

  const handleScanResult = (result, controls) => {
    const now = Date.now();
    // Evitar escaneos duplicados en un período corto
    if (now - lastScanTimeRef.current < 1000) {
      return;
    }
    lastScanTimeRef.current = now;

    console.log("Código detectado:", result.getText());
    setBarcode(result.getText());
    setSuccess(true);
    setScanning(false);
    playBeep();

    if (controls && controls.stop) {
      controls.stop();
    }
  };

  useEffect(() => {
    if (!scanning) return;

    console.log("Iniciando escaneo...");
    setError("");

    const codeReader = new BrowserMultiFormatReader(hints);
    codeReaderRef.current = codeReader;

    const startScanning = async () => {
      try {
        const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
        console.log("Dispositivos disponibles:", videoInputDevices);

        if (videoInputDevices.length === 0) {
          throw new Error("No se encontraron cámaras disponibles");
        }

        // Intentar encontrar la cámara trasera
        let selectedDeviceId = videoInputDevices[0].deviceId;
        const backCamera = videoInputDevices.find(device =>
          device.label.toLowerCase().includes("back") ||
          device.label.toLowerCase().includes("trasera")
        );
        if (backCamera) {
          selectedDeviceId = backCamera.deviceId;
          console.log("Usando cámara trasera:", backCamera.label);
        } else {
          console.log("Usando cámara:", selectedDeviceId);
        }

        // Configurar el video con las restricciones optimizadas
        const stream = await navigator.mediaDevices.getUserMedia({
          ...cameraConstraints,
          deviceId: { exact: selectedDeviceId }
        });

        // Guardar referencia al track de video para controlar flash y enfoque
        const videoTrack = stream.getVideoTracks()[0];
        trackRef.current = videoTrack;

        // Verificar capacidades de la cámara
        const capabilities = videoTrack.getCapabilities();
        console.log("Capacidades de la cámara:", {
          tieneLinterna: !!capabilities.torch,
          modosEnfoque: capabilities.focusMode || []
        });

        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // Iniciar el escaneo con el stream configurado
        const scanStream = await codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result, err, controls) => {
            if (result) {
              handleScanResult(result, controls);
            }
            if (err) {
              if (err.name === "NotAllowedError") {
                setError("No se pudo acceder a la cámara.");
                setScanning(false);
              } else if (err.name === "NotFoundException") {
                // Ignorar errores de "no se encontró código"
              } else {
                console.error("Error de escaneo:", err);
              }
            }
          },
          scanMode === "fast" ? 100 : 300 // Intervalo de escaneo más rápido en modo fast
        );

        streamRef.current = scanStream;
        setIsCameraReady(true);
        console.log("Cámara iniciada correctamente");
      } catch (err) {
        console.error("Error al iniciar la cámara:", err);
        setError("Error al iniciar la cámara: " + err.message);
        setScanning(false);
      }
    };

    startScanning();

    return () => {
      console.log("Limpiando recursos de la cámara...");
      if (streamRef.current) {
        try {
          streamRef.current.stop();
        } catch (e) {
          console.error("Error al detener stream:", e);
        }
      }
      if (codeReaderRef.current) {
        try {
          codeReaderRef.current.reset();
        } catch (e) {
          console.error("Error al resetear codeReader:", e);
        }
      }
      trackRef.current = null;
    };
  }, [scanning, scanMode]);

  const toggleScanMode = () => {
    setScanMode(prev => prev === "normal" ? "fast" : "normal");
    resetCamera();
  };

  function handleClear() {
    setBarcode(null);
    setSuccess(false);
    setScanning(true);
  }

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 500 }}>
      {!barcode && (
        <>
          <video
            ref={videoRef}
            style={{
              width: "100%",
              height: "400px",
              border: success ? "3px solid #66b819" : "3px solid #ccc",
              objectFit: "contain"
            }}
            autoPlay
            playsInline
          />
          <div style={{
            position: "absolute",
            top: "40%",
            left: "15%",
            width: "70%",
            height: "20%",
            border: "2px dashed #ff8800",
            borderRadius: 8,
            pointerEvents: "none"
          }} />
          <div style={{
            textAlign: "center",
            color: "#666",
            fontSize: "0.9em",
            backgroundColor: "rgba(255,255,255,0.8)",
            padding: "4px"
          }}>
            Modo: {scanMode === "fast" ? "Rápido" : "Normal"} -
            {scanMode === "fast" ? " Mejor para códigos claros" : " Mejor para códigos difíciles"}
          </div>
        </>
      )}

      {barcode && (
        <div style={{ marginTop: 16, color: "#66b819", fontWeight: "bold" }}>
          Código escaneado: <b>{barcode}</b>
          <button className="btn" style={{ marginLeft: 12 }} onClick={handleClear}>
            Escanear otro
          </button>
        </div>
      )}
      {error && <div style={{ color: "#e74c3c", marginTop: 12 }}>{error}</div>}
      <div style={{ marginTop: 12, display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {!scanning && !barcode && (
          <button className="btn" onClick={() => setScanning(true)}>
            Reintentar escaneo
          </button>
        )}
        <button
          className="btn"
          onClick={resetCamera}
          disabled={!isCameraReady}
          style={{ opacity: isCameraReady ? 1 : 0.5 }}
        >
          Reiniciar cámara
        </button>
        <button
          className="btn"
          onClick={toggleScanMode}
          style={{
            backgroundColor: scanMode === "fast" ? "#ff8800" : "#4CAF50",
            color: "white"
          }}
        >
          {scanMode === "fast" ? "Modo Normal" : "Modo Rápido"}
        </button>
        {isCameraReady && (
          <>
            <button
              className="btn"
              onClick={toggleFlash}
              style={{
                backgroundColor: flashEnabled ? "#ffd700" : "#666",
                color: "white"
              }}
            >
              {flashEnabled ? "Apagar Linterna" : "Encender Linterna"}
            </button>
            <button
              className="btn"
              onClick={triggerFocus}
              disabled={isFocusing}
              style={{
                backgroundColor: isFocusing ? "#999" : "#2196F3",
                color: "white"
              }}
            >
              {isFocusing ? "Enfocando..." : "Enfocar"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
