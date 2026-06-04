// src/components/Barcodes/Barcodes.jsx (o similar)
import { faCheckCircle, faCircleNotch, faExclamationCircle, faInfoCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Barcode } from '../../../../components/Barcode/Barcode';
import { ConfirmModal } from '../../../../components/ConfirmModal/ConfirmModal';
import { Modal } from '../../../../components/Modal/Modal';
import { ProductService } from '../../../../services/product/productService';
import { CombinedBarcodeGenerator } from '../CombinedBarcodeGenerator/CombinedBarcodeGenerator';
import styles from './Barcodes.module.css';

export function Barcodes({ barcodes, sku, id }) {
    const productService = useMemo(() => new ProductService(), []);

    // Estado para controlar quÃ© cÃ³digo y cuÃ¡ntas copias se quieren imprimir
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
            setMessage('âœ“ CÃ³digo eliminado');
            setTimeout(() => setMessage(''), 1800);
        } catch (err) {
            console.error('Error eliminando cÃ³digo:', err);
            setError('No se pudo eliminar el cÃ³digo. Intenta de nuevo.');
        } finally {
            setLoading(false);
            setDeletingId(null);
        }
    };

    return (
        <div className={styles.barcode_container}>
            <div className={styles.header}>
                <h3>CÃ³digos de barras</h3>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {message && <div style={{ color: '#66b819' }}><FontAwesomeIcon icon={faCheckCircle} /> {message}</div>}
                    {error && <div style={{ color: '#be3232' }}><FontAwesomeIcon icon={faExclamationCircle} /> {error}</div>}
                    <Link to={`/productos/nuevo/4/${id}`} className='btn btn_regular'>+ Nuevo</Link>
                </div>
            </div>

            <div className={styles.barcodes}>
                {list.length > 0 ?
                    list.map((e, index) =>
                        <div key={e.id || e.barcode || index} className={styles.barcode}>
                            <p className={styles.barcode_text}>{e.barcode}</p>
                            <Barcode value={e.barcode} code={sku} />
                            <div className={styles.barcode_options}>
                                <button
                                    className="btn btn_small"
                                    onClick={() => handlePrintClick(e.barcode)}
                                >
                                    Imprimir
                                </button>
                                <button
                                    className="btn btn_error_regular"
                                    onClick={() => setPendingDeleteBarcode(e)}
                                    disabled={loading && deletingId === (e.id || e.barcode)}
                                    title="Eliminar cÃ³digo de barras"
                                >
                                    {loading && deletingId === (e.id || e.barcode) ? (
                                        <FontAwesomeIcon icon={faCircleNotch} spin />
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faTrash} size='xs' />
                                            Eliminar
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) :
                    <p>No hay cÃ³digos asignados</p>
                }
            </div>

            {pendingDeleteBarcode && (
                <ConfirmModal
                    message="Â¿Eliminar este cÃ³digo de barras?"
                    onConfirm={() => { handleDelete(pendingDeleteBarcode); setPendingDeleteBarcode(null); }}
                    onCancel={() => setPendingDeleteBarcode(null)}
                />
            )}

            {showModal &&
                <Modal onClose={() => setShowModal(false)} title={'Imprimir cÃ³digos de barras'}>
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

// Renombra tu componente Barcode actual a BarcodeGenerator
// y Ãºsalo para mostrar individualmente (o usa el existente sin el botÃ³n de descarga)
// ... (Tu componente Barcode original, renombrado a BarcodeGenerator)

