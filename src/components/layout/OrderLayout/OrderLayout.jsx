import { OrderList } from '../../../features/order/components/OrderList/OrderList';
import styles from './OrderLayout.module.css';

export const OrderLayout = () => {

    return (
        <div className={styles.order_layout}>
             <OrderList />
        </div>
    );
};

