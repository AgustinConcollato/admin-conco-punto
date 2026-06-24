import { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronDown,
    faChevronUp,
    faEye,
    faEyeSlash,
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
    return title ? `${typeLabel} – ${title}` : typeLabel;
}

function DragHandle() {
    return (
        <span className={styles.grip}>
            {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className={styles.grip_dot} />
            ))}
        </span>
    );
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
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <span className={styles.header_title}>Secciones</span>
                <span className={styles.header_count}>{sections.length} secc.</span>
            </div>

            <div className={styles.list}>
                {sections.map((section, index) => {
                    const { Form } = SECTION_TYPES[section.type] ?? {};
                    const isOpen = openId === section.id;

                    return (
                        <div
                            key={section.id}
                            className={`${styles.item} ${dragOverIndex === index ? styles.drag_over : ''} ${!section.visible ? styles.hidden_section : ''}`}
                        >
                            <div
                                className={styles.item_header}
                                draggable={!isOpen}
                                onDragStart={() => { dragIndexRef.current = index; }}
                                onDragOver={(e) => { e.preventDefault(); setDragOverIndex(index); }}
                                onDragLeave={() => setDragOverIndex(null)}
                                onDrop={() => handleDrop(index)}
                            >
                                <DragHandle />

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
                                        title={section.visible ? 'Visible' : 'Oculta'}
                                    >
                                        <FontAwesomeIcon icon={section.visible ? faEye : faEyeSlash} />
                                    </button>
                                    <button
                                        onClick={() => onRemove(section.id)}
                                        className={styles.delete_btn}
                                        title="Eliminar sección"
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
            </div>

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
