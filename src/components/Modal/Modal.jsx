import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

export function Modal({ children, onClose, title }) {
    const modalRef = useRef(null);
    const titleId = useId();

    useEffect(() => {
        if (modalRef.current) {
            const firstInput = modalRef.current.querySelector(
                'input, textarea, select, [tabindex]:not([tabindex="-1"])'
            );
            if (firstInput) firstInput.focus();
        }

        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    return createPortal(
        <div className={styles.modal} ref={modalRef}>
            <div
                className={styles.container_children}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
            >
                <div className={styles.header_modal}>
                    <h2 id={titleId}>
                        {title}
                    </h2>
                    {onClose && (
                        <FontAwesomeIcon
                            icon={faXmark}
                            onClick={onClose}
                            role="button"
                            onKeyDown={e => e.key === 'Enter' && onClose()}
                        />
                    )}
                </div>
                {children}
            </div>
            <div className={styles.background_modal} onClick={onClose}></div>
        </div>,
        document.getElementById("root")
    );
}