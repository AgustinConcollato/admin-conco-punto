import { Navigate } from "react-router-dom";
import { CreateProduct } from "../CreateProduct/CreateProduct";
import { AddPrices } from "../AddPrices/AddPrices";
import { AddBarcode } from "../AddBarcode/AddBarcode";


export function NewProductForm({ step }) {
    switch (step) {
        case '1':
            return <CreateProduct />;
        case '2':
            return <AddPrices />
        case '3':
            return <AddBarcode />
        default:
            return <Navigate to={'/producto/nuevo/1'} />;
    }
}