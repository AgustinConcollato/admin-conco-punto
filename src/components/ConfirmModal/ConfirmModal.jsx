import { Modal } from '../Modal/Modal';
import styles from './ConfirmModal.module.css';

export function ConfirmModal({ message, onConfirm, onCancel, variant = 'danger', title = 'Confirmar acción' }) {
    return (
        <Modal onClose={onCancel} title={title}>
            <div className={styles.body}>
                <p className={styles.message}>{message}</p>
                <div className={styles.actions}>
                    <button className="btn btn_regular" onClick={onCancel}>
                        Cancelar
                    </button>
                    <button
                        className={`btn ${variant === 'danger' ? 'btn_error_solid' : 'btn_solid'}`}
                        onClick={onConfirm}
                        autoFocus
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </Modal>
    );
}
