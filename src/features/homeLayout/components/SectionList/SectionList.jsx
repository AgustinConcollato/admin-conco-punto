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
import { Modal } from '../../../../components/Modal/Modal';
import { BannerSectionForm } from '../sectionForms/BannerSectionForm';
import { BannerProductsSectionForm } from '../sectionForms/BannerProductsSectionForm';
import { ProductsSectionForm } from '../sectionForms/ProductsSectionForm';
import { PromoTilesSectionForm } from '../sectionForms/PromoTilesSectionForm';
import { PromotionsSectionForm } from '../sectionForms/PromotionsSectionForm';
import { TextSectionForm } from '../sectionForms/TextSectionForm';
import styles from './SectionList.module.css';

const SECTION_TYPES = {
    banner: { label: 'Banner / carrusel', Form: BannerSectionForm },
    banner_products: { label: 'Banner + productos', Form: BannerProductsSectionForm },
    products: { label: 'Productos', Form: ProductsSectionForm },
    products_grid: { label: 'Productos (grilla)', Form: ProductsSectionForm },
    promo_tiles: { label: 'Banners promocionales', Form: PromoTilesSectionForm },
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

function SectionWireframe({ type }) {
    if (type === 'banner') {
        return (
            <span className={styles.wf}>
                <span className={styles.wf_banner} />
                <span className={styles.wf_dots}>
                    <span className={styles.wf_dot} />
                    <span className={styles.wf_dot} />
                    <span className={styles.wf_dot} />
                </span>
            </span>
        );
    }

    if (type === 'products' || type === 'promotions') {
        return (
            <span className={styles.wf}>
                <span className={styles.wf_title_row}>
                    <span className={styles.wf_title_bar} />
                    {type === 'promotions' && <span className={styles.wf_pill} />}
                </span>
                <span className={styles.wf_cards}>
                    <span className={styles.wf_card} />
                    <span className={styles.wf_card} />
                    <span className={styles.wf_card} />
                </span>
            </span>
        );
    }

    if (type === 'products_grid') {
        return (
            <span className={styles.wf}>
                <span className={styles.wf_title_row}>
                    <span className={styles.wf_title_bar} />
                </span>
                <span className={styles.wf_grid}>
                    <span className={styles.wf_grid_cell} />
                    <span className={styles.wf_grid_cell} />
                    <span className={styles.wf_grid_cell} />
                    <span className={styles.wf_grid_cell} />
                </span>
            </span>
        );
    }

    if (type === 'banner_products') {
        return (
            <span className={styles.wf}>
                <span className={styles.wf_banner} />
                <span className={styles.wf_fade} />
                <span className={styles.wf_overlap_cards}>
                    <span className={styles.wf_card} />
                    <span className={styles.wf_card} />
                    <span className={styles.wf_card} />
                </span>
            </span>
        );
    }

    if (type === 'promo_tiles') {
        return (
            <span className={styles.wf}>
                <span className={styles.wf_tiles}>
                    <span className={styles.wf_tile}>
                        <span className={styles.wf_tile_patch} />
                    </span>
                    <span className={styles.wf_tile}>
                        <span className={styles.wf_tile_patch} />
                    </span>
                </span>
            </span>
        );
    }

    if (type === 'text') {
        return (
            <span className={`${styles.wf} ${styles.wf_text}`}>
                <span className={styles.wf_text_title} />
                <span className={styles.wf_text_line} />
                <span className={styles.wf_text_line} />
            </span>
        );
    }

    return <span className={styles.wf} />;
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
                <button className={styles.add_btn} onClick={() => setShowAddMenu(true)}>
                    <FontAwesomeIcon icon={faPlus} /> Agregar sección
                </button>
            </div>

            {showAddMenu && (
                <Modal onClose={() => setShowAddMenu(false)} title="Agregar sección">
                    <div className={styles.add_grid}>
                        {Object.entries(SECTION_TYPES).map(([type, { label }]) => (
                            <button
                                key={type}
                                className={styles.add_card}
                                onClick={() => { onAdd(type); setShowAddMenu(false); }}
                            >
                                <span className={styles.wf_lg}>
                                    <SectionWireframe type={type} />
                                </span>
                                <span className={styles.add_card_label}>{label}</span>
                            </button>
                        ))}
                    </div>
                </Modal>
            )}
        </div>
    );
}
