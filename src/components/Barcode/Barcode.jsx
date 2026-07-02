import JsBarcode from "jsbarcode";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export function Barcode({ value, code, width = 4, height = 160, displayValue = true, fontSize = 22, lineColor = "#000", text, className }) {
    const barcodeRef = useRef(null);
    const [downloadUrl, setDownloadUrl] = useState('');

    useEffect(() => {
        if (barcodeRef.current && value) {
            JsBarcode(barcodeRef.current, value, {
                lineColor,
                width,
                height,
                displayValue,
                text: text ?? (value + '|' + code),
                fontSize,
                fontOptions: "bold",
                margin: displayValue ? 10 : 0,
            });
        }

        setDownloadUrl(barcodeRef.current.src);
    }, [value, width, height, displayValue, fontSize, lineColor, text]);

    return (
        <div>
            <img ref={barcodeRef} className={className} />
        </div>
    );
}
