import { toast } from 'react-toastify';
import { OrderService } from '../services/order/orderService';

const orderService = new OrderService();

export async function downloadOrderPdf(orderId, clientName) {
    try {
        const data = await orderService.downloadPdf(orderId);
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Pedido_${clientName.replace(/\s+/g, '_')}_${orderId.substring(0, 5)}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        toast.error('No se pudo descargar el PDF.');
    }
}
