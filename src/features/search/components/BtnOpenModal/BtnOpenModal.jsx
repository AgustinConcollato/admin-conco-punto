import { faBarcode } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Modal } from "../../../../components/Modal/Modal";
import { SearchProductsByBarcode } from "../SearchProductsByBarcode/SearchProductsByBarcode";
import styles from './BtnOpenModal.module.css'

export function BtnOpenModal() {

    const [showModal, setShowModal] = useState();

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "F8") {
                e.preventDefault();
                openModal();
            }
            if (e.key === "F9" || e.key === "F10" || e.key === "F11") {
                closeModal();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <>
            <button onClick={openModal} className={styles.btn}>
                <FontAwesomeIcon icon={faBarcode} />
                <span>Escanear [F8]</span>
            </button>
            {showModal &&
                <Modal onClose={closeModal} title={'Escanear Código de Barras'}>
                    <SearchProductsByBarcode onClose={closeModal} />
                </Modal>
            }
        </>
    );
}