import { faCheckCircle, faCircleNotch, faExclamationCircle, faInfoCircle, faPrint, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Barcode } from '../../../../components/Barcode/Barcode';
import { ConfirmModal } from '../../../../components/ConfirmModal/ConfirmModal';
import { Modal } from '../../../../components/Modal/Modal';
import { ProductService } from '../../../../services/product/productService';
import { CombinedBarcodeGenerator } from '../CombinedBarcodeGenerator/CombinedBarcodeGenerator';
import styles from './Barcodes.module.css';

function detectType(value) {
    const digits = String(value ?? '').replace(/\D/g, '');
    switch (digits.length) {
        case 13: return 'EAN-13';
        case 12: return 'UPC-A';
        case 8: return 'EAN-8';
        default: return `${digits.length} díg.`;
    }
}

export function Barcodes({ barcodes, sku, id }) {
    const productService = useMemo(() => new ProductService(), []);

    // Estado para controlar qué código y cuántas copias se quieren imprimir
    const [printData, setPrintData] = useState({ barcodeValue: '', count: 0 });
    const [showModal, setShowModal] = useState(false);
    const [pendingDeleteBarcode, setPendingDeleteBarcode] = useState(null);
    const [list, setList] = useState(Array.isArray(barcodes) ? barcodes : []);
    const [deletingId, setDeletingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handlePrintClick = (barcodeToPrint) => {
        setPrintData({ barcodeValue: barcodeToPrint, count: 4 });
        setShowModal(true);
    };

    const handleDelete = async (barcode) => {
        setDeletingId(barcode.id || barcode.barcode);
        setError('');
        setMessage('');

        try {
            setLoading(true);
            await productService.destroyBarcode(barcode.id || barcode.barcode);

            // Actualizar UI localmente
            setList(curr => curr.filter(b => (b.id || b.barcode) !== (barcode.id || barcode.barcode)));
            setMessage('Código eliminado');
            setTimeout(() => setMessage(''), 1800);
        } catch (err) {
            console.error('Error eliminando código:', err);
            setError('No se pudo eliminar el código. Intenta de nuevo.');
        } finally {
            setLoading(false);
            setDeletingId(null);
        }
    };

    const isEmpty = list.length === 0;

    return (
        <div className={styles.card}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.header_left}>
                    <span className={styles.title}>Códigos de barras</span>
                </div>
                <div className={styles.header_actions}>
                    {message && (
                        <span className={styles.msg_ok}>
                            <FontAwesomeIcon icon={faCheckCircle} /> {message}
                        </span>
                    )}
                    {error && (
                        <span className={styles.msg_err}>
                            <FontAwesomeIcon icon={faExclamationCircle} /> {error}
                        </span>
                    )}
                    <Link to={`/productos/nuevo/4/${id}`} className={styles.new_btn}>
                        <span className={styles.plus}>+</span> Nuevo
                    </Link>
                </div>
            </div>

            <div className={styles.divider} />

            {/* Empty state */}
            {isEmpty ? (
                <div className={styles.empty}>
                    <div className={styles.ghost_bars}>
                        {Array.from({ length: 16 }).map((_, i) => (
                            <span
                                key={i}
                                className={styles.ghost_bar}
                                style={{ width: `${1 + (i % 4) * 1.5}px` }}
                            />
                        ))}
                    </div>
                    <div className={styles.empty_title}>No hay códigos asignados</div>
                    <div className={styles.empty_sub}>
                        Agrega un código de barras para identificar este producto en el inventario.
                    </div>
                    <Link to={`/productos/nuevo/4/${id}`} className={styles.empty_btn}>
                        + Agregar el primero
                    </Link>
                </div>
            ) : (
                /* Lista */
                <div className={styles.list}>
                    {list.map((e, index) => (
                        <div key={e.id || e.barcode || index} className={styles.row}>
                            <div className={styles.row_top}>
                                <div className={styles.row_barcode}>
                                    <Barcode
                                        value={e.barcode}
                                        code={sku}
                                        width={2}
                                        height={44}
                                        displayValue={false}
                                        className={styles.mini_barcode}
                                    />
                                </div>
                                <div className={styles.row_actions}>
                                    <button
                                        className={styles.print_btn}
                                        onClick={() => handlePrintClick(e.barcode)}
                                        title="Imprimir código"
                                    >
                                        <FontAwesomeIcon icon={faPrint} />
                                    </button>
                                    <button
                                        className={styles.remove_btn}
                                        onClick={() => setPendingDeleteBarcode(e)}
                                        disabled={loading && deletingId === (e.id || e.barcode)}
                                        title="Quitar código"
                                    >
                                        {loading && deletingId === (e.id || e.barcode)
                                            ? <FontAwesomeIcon icon={faCircleNotch} spin />
                                            : '×'}
                                    </button>
                                </div>
                            </div>
                            <div className={styles.row_info}>
                                <span className={styles.row_value}>{e.barcode}</span>
                                <span className={styles.row_sep}>•</span>
                                <span className={styles.row_type}>{detectType(e.barcode)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {pendingDeleteBarcode && (
                <ConfirmModal
                    message="¿Eliminar este código de barras?"
                    onConfirm={() => { handleDelete(pendingDeleteBarcode); setPendingDeleteBarcode(null); }}
                    onCancel={() => setPendingDeleteBarcode(null)}
                />
            )}

            {showModal &&
                <Modal onClose={() => setShowModal(false)} title={'Imprimir códigos de barras'}>
                    {printData.count > 0 && printData.barcodeValue && (
                        <div className={styles.print_section}>
                            <div className='input_group'>
                                <span>Cantidad a imprimir</span>
                                <input
                                    className='input'
                                    type="number"
                                    min="1"
                                    value={printData.count}
                                    onChange={(e) => setPrintData({ ...printData, count: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div style={{ marginTop: 8, marginBottom: 8, color: '#666' }}>
                                <FontAwesomeIcon icon={faInfoCircle} /> Ajusta la cantidad y descarga como imagen o PDF.
                            </div>
                            <CombinedBarcodeGenerator
                                value={printData.barcodeValue}
                                code={sku}
                                count={printData.count}
                            />
                        </div>
                    )}
                </Modal>
            }
        </div>
    );
}
