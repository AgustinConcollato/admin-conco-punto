import JsBarcode from "jsbarcode";
import { useEffect, useRef, useState } from "react";
import styles from './CombinedBarcodeGenerator.module.css'
import jsPDF from "jspdf";

// Definimos dimensiones estándar para cada código de barras y para el lienzo compuesto.
const BARCODE_WIDTH = 550; // Ancho del código individual (ajusta según necesites)
const BARCODE_HEIGHT = 250; // Alto del código individual

export function CombinedBarcodeGenerator({ value, code, count }) {
    const canvasRef = useRef(null);
    const [downloadUrl, setDownloadUrl] = useState('');

    useEffect(() => {
        if (!value || count < 1) {
            setDownloadUrl('');
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // 1. Calcular las dimensiones del Canvas compuesto (1 columna, N filas)
        const columns = 2; // 👈 Ahora solo una columna
        const rows = count; // 👈 El número de filas es igual a la cantidad de códigos

        canvas.width = 650; // El ancho es el de un solo código
        canvas.height = BARCODE_HEIGHT * rows;  // El alto es la suma de todos

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Crear un elemento Canvas temporal para el código individual
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = BARCODE_WIDTH;
        tempCanvas.height = BARCODE_HEIGHT;

        // 3. Generar el código de barras en el Canvas temporal
        JsBarcode(tempCanvas, value, {
            displayValue: true,
            text: value + '|' + code,
            fontSize: 22,
            fontOptions: "bold",
            width: 4,
            height: 160,
            margin: 30,
        });

        // 4. Dibujar la imagen del Canvas temporal en la cuadrícula
        for (let i = 0; i < count; i++) {
            // El cálculo de la posición se simplifica a una sola columna (x siempre 0)
            const x = 0;
            const y = i * BARCODE_HEIGHT; // La posición vertical es simplemente el índice por la altura

            ctx.drawImage(tempCanvas, x, y, BARCODE_WIDTH, BARCODE_HEIGHT);
        }

        // 5. Establecer la URL de descarga
        setDownloadUrl(canvas.toDataURL('image/png'));

    }, [value, code, count]);;


    const downloadPdf = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Ancho fijo deseado para el documento PDF (5.5 cm = 55 mm)
        const PDF_FIXED_WIDTH_MM = 55;

        // Obtener la URL de datos del Canvas (PNG)
        const imgData = canvas.toDataURL('image/png');

        // Calcular la altura proporcional en milímetros (H_mm)
        // H_mm = (H_px * W_mm) / W_px
        const imgHeightPx = canvas.height;
        const imgWidthPx = canvas.width; // 650 píxeles

        const PDF_HEIGHT_MM = (imgHeightPx * PDF_FIXED_WIDTH_MM) / imgWidthPx;

        // Crear un nuevo documento jsPDF con dimensiones personalizadas
        // El formato es [orientation], [unit], [format size]
        const pdf = new jsPDF('p', 'mm', [PDF_FIXED_WIDTH_MM, PDF_HEIGHT_MM]);

        // Añadir la imagen completa del Canvas al PDF
        // La imagen se añade para que ocupe el ancho y alto total del documento PDF.
        pdf.addImage(
            imgData,
            'PNG',
            0, 0, // Posición X e Y
            PDF_FIXED_WIDTH_MM, // Ancho de la imagen (igual al ancho del documento)
            PDF_HEIGHT_MM       // Alto de la imagen (igual al alto del documento)
        );

        // Descargar el archivo
        pdf.save(`lote-barcodes-${value}-${count}.pdf`);
    };

    return (
        <>
            <div className={styles.container_canvas}>
                <canvas ref={canvasRef} style={{ border: '1px solid black', maxWidth: '100%', height: 'auto' }} />
            </div>

            {downloadUrl && (
                <a
                    href={downloadUrl}
                    download={`lote-barcodes-${value}-${count}.png`}
                    className="btn btn_solid"
                >
                    Descargar Imagen Compuesta ({count} códigos)
                </a>
            )}

            {downloadUrl && (
                <button
                    onClick={downloadPdf}
                    className="btn btn_regular"
                >
                    Descargar como PDF
                </button>
            )}
        </>
    );
}