import { Navigate } from "react-router-dom";
import { AddBarcode } from "../AddBarcode/AddBarcode";
import { AddCategoryAttributes } from "../AddCategoryAttributes/AddCategoryAttributes";
import { AddPrices } from "../AddPrices/AddPrices";
import { AddVariants } from "../AddVariants/AddVariants";
import { CreateProduct } from "../CreateProduct/CreateProduct";

export function NewProductForm({ step }) {
    switch (step) {
        case '1': return <CreateProduct />;
        case '2': return <AddCategoryAttributes />;
        case '3': return <AddPrices />;
        case '4': return <AddBarcode />;
        case '5': return <AddVariants />;
        default:  return <Navigate to="/productos/nuevo/1" />;
    }
}
