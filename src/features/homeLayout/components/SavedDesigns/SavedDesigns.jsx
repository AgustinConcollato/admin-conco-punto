import { useState } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faCircleNotch, faPenToSquare, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ConfirmModal } from '../../../../components/ConfirmModal/ConfirmModal';
import styles from './SavedDesigns.module.css';

export function SavedDesigns({ designs, openId, publishedId, dirty, onOpen, onNew, onDelete }) {
    const [name, setName] = useState('');
    const [creating, setCreating] = useState(false);
    const [pendingDelete, setPendingDelete] = useState(null);
    const [pendingOpen, setPendingOpen] = useState(null);
    const [pendingNew, setPendingNew] = useState(null);
    const [collapsed, setCollapsed] = useState(false);

    const doCreate = async (trimmedName) => {
        setCreating(true);
        try {
            await onNew(trimmedName);
            setName('');
            toast.success('Diseño creado.');
        } catch (err) {
            toast.error(err?.error ?? err?.message ?? 'No se pudo crear el diseño.');
        } finally {
            setCreating(false);
        }
    };

    const handleNew = () => {
        const trimmed = name.trim();
        if (!trimmed) return;
        if (dirty) {
            setPendingNew(trimmed);
            return;
        }
        doCreate(trimmed);
    };

    const requestOpen = (design) => {
        if (design.id === openId) return;
        if (dirty) {
            setPendingOpen(design);
            return;
        }
        onOpen(design);
    };

    const confirmOpenPending = () => {
        onOpen(pendingOpen);
        setPendingOpen(null);
    };

    const confirmDelete = async () => {
        try {
            await onDelete(pendingDelete.id);
        } catch (err) {
            toast.error(err?.error ?? err?.message ?? 'No se pudo eliminar el diseño.');
        } finally {
            setPendingDelete(null);
        }
    };

    return (
        <div className={styles.panel}>
            <button
                className={styles.header}
                onClick={() => setCollapsed(c => !c)}
                aria-expanded={!collapsed}
            >
                <span className={styles.title}>Mis diseños</span>
                <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`${styles.header_chevron} ${collapsed ? styles.header_chevron_collapsed : ''}`}
                />
            </button>

            {!collapsed && (
            <>
            <div className={styles.save_row}>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleNew(); }}
                    placeholder="Nombre del diseño nuevo"
                    className={styles.name_input}
                />
                <button
                    className={styles.save_btn}
                    onClick={handleNew}
                    disabled={creating || !name.trim()}
                >
                    {creating
                        ? <FontAwesomeIcon icon={faCircleNotch} spin />
                        : <><FontAwesomeIcon icon={faPlus} /> Nuevo diseño</>}
                </button>
            </div>

            {designs.length === 0 && (
                <p className={styles.empty}>Todavía no tenés diseños. Creá el primero.</p>
            )}

            {designs.length > 0 && (
                <ul className={styles.list}>
                    {designs.map(design => (
                        <li
                            key={design.id}
                            className={design.id === openId ? `${styles.item} ${styles.item_active}` : styles.item}
                        >
                            <div className={styles.item_info}>
                                <span className={styles.item_name}>
                                    {design.name}
                                    {design.id === publishedId && (
                                        <span className={styles.live_badge}>En vivo</span>
                                    )}
                                    {design.id === openId && (
                                        <span className={styles.editing_badge}>Editando</span>
                                    )}
                                </span>
                                <span className={styles.item_date}>
                                    {new Date(design.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className={styles.item_actions}>
                                <button
                                    onClick={() => requestOpen(design)}
                                    className={styles.apply_btn}
                                    disabled={design.id === openId}
                                >
                                    <FontAwesomeIcon icon={faPenToSquare} /> Abrir
                                </button>
                                <button
                                    onClick={() => setPendingDelete(design)}
                                    className={styles.delete_btn}
                                    aria-label="Eliminar diseño"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            </>
            )}

            {pendingDelete && (
                <ConfirmModal
                    message={`¿Eliminar el diseño "${pendingDelete.name}"?`}
                    onConfirm={confirmDelete}
                    onCancel={() => setPendingDelete(null)}
                />
            )}

            {pendingOpen && (
                <ConfirmModal
                    message={`Tenés cambios sin guardar. Si abrís "${pendingOpen.name}" se van a perder. ¿Continuar?`}
                    onConfirm={confirmOpenPending}
                    onCancel={() => setPendingOpen(null)}
                />
            )}

            {pendingNew && (
                <ConfirmModal
                    message="Tenés cambios sin guardar. Si creás un diseño nuevo se van a perder. ¿Continuar?"
                    onConfirm={() => { const n = pendingNew; setPendingNew(null); doCreate(n); }}
                    onCancel={() => setPendingNew(null)}
                />
            )}
        </div>
    );
}
