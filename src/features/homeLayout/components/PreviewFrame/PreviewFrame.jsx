import { useEffect, useRef } from 'react';
import styles from './PreviewFrame.module.css';

const WEB_PREVIEW_URL = import.meta.env.VITE_WEB_PREVIEW_URL;
const WEB_ORIGIN = WEB_PREVIEW_URL ? new URL(WEB_PREVIEW_URL).origin : null;

export function PreviewFrame({ sections, priceListId, viewport = 'desktop' }) {
    const iframeRef = useRef(null);
    const readyRef = useRef(false);

    const sendConfig = (currentSections, currentPriceListId) => {
        if (!readyRef.current || !iframeRef.current?.contentWindow) return;

        iframeRef.current.contentWindow.postMessage({
            type: 'HOME_PREVIEW_CONFIG',
            payload: { sections: currentSections, priceListId: currentPriceListId },
        }, WEB_ORIGIN);
    };

    useEffect(() => {
        const onMessage = (event) => {
            if (event.origin !== WEB_ORIGIN) return;
            if (event.data?.type !== 'HOME_PREVIEW_READY') return;

            readyRef.current = true;
            sendConfig(sections, priceListId);
        };

        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    });

    useEffect(() => {
        const timer = setTimeout(() => sendConfig(sections, priceListId), 300);
        return () => clearTimeout(timer);
    }, [sections, priceListId]);

    if (!WEB_PREVIEW_URL) {
        return <p className={styles.no_url}>Falta configurar VITE_WEB_PREVIEW_URL.</p>;
    }

    return (
        <div className={styles.wrap}>
            <div className={styles.frame_area}>
                <iframe
                    ref={iframeRef}
                    src={`${WEB_PREVIEW_URL}/vista-previa-home`}
                    title="Vista previa del home"
                    className={`${styles.iframe} ${viewport === 'mobile' ? styles.iframe_mobile : ''}`}
                />
            </div>
        </div>
    );
}
