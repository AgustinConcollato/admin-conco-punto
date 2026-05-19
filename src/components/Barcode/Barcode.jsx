import JsBarcode from "jsbarcode";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export function Barcode({ value, code }) {
    const barcodeRef = useRef(null);
    const [downloadUrl, setDownloadUrl] = useState('');

    useEffect(() => {
        if (barcodeRef.current && value) {
            JsBarcode(barcodeRef.current, value, {
                lineColor: "#000",
                width: 4,
                height: 160,
                displayValue: true,
                text: value + '|' + code,
                fontSize: 22,
                fontOptions: "bold",
            });
        }

        setDownloadUrl(barcodeRef.current.src);
    }, [value]);

    return (
        <div>
            <img ref={barcodeRef} />
        </div>
    );
}
