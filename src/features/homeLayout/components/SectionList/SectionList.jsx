import { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronDown,
    faChevronUp,
    faEye,
    faEyeSlash,
    faGripVertical,
    faPlus,
    faTrash
} from '@fortawesome/free-solid-svg-icons';
import { BannerSectionForm } from '../sectionForms/BannerSectionForm';
import { ProductsSectionForm } from '../sectionForms/ProductsSectionForm';
import { PromotionsSectionForm } from '../sectionForms/PromotionsSectionForm';
import { TextSectionForm } from '../sectionForms/TextSectionForm';
import styles from './SectionList.module.css';

const SECTION_TYPES = {
    banner: { label: 'Banner / carrusel', Form: BannerSectionForm },
    products: { label: 'Productos', Form: ProductsSectionForm },
    promotions: { label: 'Promociones', Form: PromotionsSectionForm },
    text: { label: 'Texto / anuncio', Form: TextSectionForm },
};

function sectionTitle(section) {
    const typeLabel = SECTION_TYPES[section.type]?.label ?? section.type;
    const title = section.settings?.title;
    return title ? `${typeLabel} — ${title}` : typeLabel;
}

export function SectionList({ sections, onAdd, onRemove, onMove, onUpdateSettings, onToggleVisible }) {
    const [openId, setOpenId] = useState(null);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const dragIndexRef = useRef(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    const handleDrop = (index) => {
        const from = dragIndexRef.current;
        if (from !== null && from !== index) onMove(from, index);
        dragIndexRef.current = null;
        setDragOverIndex(null);
    };

    return (
        <div className={styles.list}>
            {sections.map((section, index) => {
                const { Form } = SECTION_TYPES[section.type] ?? {};
                const isOpen = openId === section.id;

                return (
                    <div
                        key={section.id}
                        className={`${styles.item} ${dragOverIndex === index ? styles.drag_over : ''} ${!section.visible ? styles.hidden_section : ''}`}
                        draggable={!isOpen}
                        onDragStart={() => { dragIndexRef.current = index; }}
                        onDragOver={(e) => { e.preventDefault(); setDragOverIndex(index); }}
                        onDragLeave={() => setDragOverIndex(null)}
                        onDrop={() => handleDrop(index)}
                    >
                        <div className={styles.item_header}>
                            <span className={styles.grip}>
                                <FontAwesomeIcon icon={faGripVertical} />
                            </span>
                            <button
                                className={styles.item_title}
                                onClick={() => setOpenId(isOpen ? null : section.id)}
                            >
                                {sectionTitle(section)}
                                <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
                            </button>
                            <div className={styles.item_actions}>
                                <button
                                    onClick={() => onToggleVisible(section.id)}
                                    aria-label={section.visible ? 'Ocultar sección' : 'Mostrar sección'}
                                    title={section.visible ? 'Visible (click para ocultar)' : 'Oculta (click para mostrar)'}
                                >
                                    <FontAwesomeIcon icon={section.visible ? faEye : faEyeSlash} />
                                </button>
                                <button
                                    onClick={() => onRemove(section.id)}
                                    className={styles.delete_btn}
                                    aria-label="Eliminar sección"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        </div>

                        {isOpen && Form && (
                            <div className={styles.item_body}>
                                <Form
                                    settings={section.settings}
                                    onChange={(patch) => onUpdateSettings(section.id, patch)}
                                />
                            </div>
                        )}
                    </div>
                );
            })}

            <div className={styles.add_wrap}>
                <button className={styles.add_btn} onClick={() => setShowAddMenu(v => !v)}>
                    <FontAwesomeIcon icon={faPlus} /> Agregar sección
                </button>
                {showAddMenu && (
                    <div className={styles.add_menu}>
                        {Object.entries(SECTION_TYPES).map(([type, { label }]) => (
                            <button
                                key={type}
                                onClick={() => { onAdd(type); setShowAddMenu(false); }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
