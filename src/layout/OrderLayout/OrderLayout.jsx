import { OrderList } from '../../features/order/list/components/OrderList/OrderList';
import styles from './OrderLayout.module.css';

export const OrderLayout = () => {

    return (
        <div className={styles.order_layout}>
             <OrderList />
        </div>
    );
};