import { faBarcode, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useContext, useEffect, useState } from 'react';
import { Loading } from '../../components/Loading/Loading';
import { OrderContext } from '../../contexts/OrderContext';
import { ProductList } from '../../features/sales/components/ProductList/ProductList';
import { ProductSearch } from '../../features/sales/components/ProductSearch/ProductSearch';
import { SearchByBarcode } from '../../features/sales/components/SearchByBarcode/SearchByBarcode';
import { Summary } from '../../features/sales/components/Summary/Summary';
import styles from './SalesLayout.module.css';

export function SalesLayout({ orderId }) {

    const { getOrder, order } = useContext(OrderContext);

    const [mode, setMode] = useState(localStorage.getItem('mode') || 'default');

    const handleModeChange = () => {
        setMode(current => {
            if (current === 'default') {
                localStorage.setItem('mode', 'code')
                return 'code'
            }
            if (current === 'code') {
                localStorage.setItem('mode', 'default')
                return 'default'
            }
        })
    }

    useEffect(() => {
        getOrder(orderId);
    }, [orderId])

    return (
        <div className={styles.layout}>
            {order ?
                <>
                    <div className={styles.search}>
                        {mode === 'default' ?
                            <ProductSearch /> :
                            <SearchByBarcode />
                        }
                        <div className={styles.mode} onClick={handleModeChange}>
                            <button className={`${styles.btn_mode} ${mode === 'default' && styles.active}`}>
                                <FontAwesomeIcon icon={faSearch} />
                            </button>
                            <button className={`${styles.btn_mode} ${mode === 'code' && styles.active}`}>
                                <FontAwesomeIcon icon={faBarcode} />
                            </button>
                            <span>Cambiar de modo</span>
                        </div>
                    </div>
                    <div className={styles.list}>
                        <ProductList />
                    </div>
                    <div className={styles.summary}>
                        <Summary />
                    </div>
                </> :
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <Loading />
                </div>
            }
        </div >
    );
}