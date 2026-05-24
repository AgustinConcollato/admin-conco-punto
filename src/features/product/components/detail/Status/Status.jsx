import { faCheckCircle, faExclamationCircle, faFolder } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Modal } from "../../../../../components/Modal/Modal";
import { EditStatus } from "../EditStatus/EditStatus";
import styles from './Stauts.module.css';

export function Status({ status, id, onStatusChange }) {
    const [showModal, setShowModal] = useState(false);

    const handleSuccess = (newStatus) => {
        onStatusChange(newStatus);
        setShowModal(false);
    };

    const NotificationContent = {
        'incomplete': (
            <p><span><FontAwesomeIcon icon={faExclamationCircle} style={{ color: 'var(--color-error, #e74c3c)' }} /> Faltan precios en todas las listas</span> <Link to={`/productos/nuevo/3/${id}`}>Agregar</Link></p>
        ),
        'archived': (
            <p><span><FontAwesomeIcon icon={faFolder} style={{ color: '#df9710' }} /> Archivado</span></p>
        ),
    };

    return (
        <>
            <div className={styles.status_container}>
                <div className={styles.header}>
                    <h3>Estado</h3>
                    {(status === 'published' || status === 'archived') && (
                        <button className="btn btn_regular" onClick={() => setShowModal(true)}>
                            Cambiar
                        </button>
                    )}
                </div>

                {status !== 'published' ? (
                    NotificationContent[status]
                ) : (
                    <p>
                        <span>
                            <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'var(--color-success, #66b819)' }} /> Publicado
                        </span>
                    </p>
                )}
            </div>

            {showModal && (
                <Modal onClose={() => setShowModal(false)} title={'Confirmar cambio de estado'}>
                    <EditStatus 
                        currentStatus={status} 
                        productId={id} 
                        onRefresh={handleSuccess} 
                        onCancel={() => setShowModal(false)} 
                    />
                </Modal>
            )}
        </>
    );
}