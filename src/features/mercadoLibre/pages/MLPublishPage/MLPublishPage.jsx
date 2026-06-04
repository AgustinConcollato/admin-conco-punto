import { Navigate, useParams } from "react-router-dom";
import { StepCategory } from "../../../../features/mercadoLibre/components/steps/StepCategory/StepCategory";
import { StepCondition } from "../../../../features/mercadoLibre/components/steps/StepCondition/StepCondition";
import { StepDescription } from "../../../../features/mercadoLibre/components/steps/StepDescription/StepDescription";
import { StepShipment } from "../../../../features/mercadoLibre/components/steps/StepShipment/StepShipment";
import { StepMedia } from "../../../../features/mercadoLibre/components/steps/StepMedia/StepMedia";
import { StepPrice } from "../../../../features/mercadoLibre/components/steps/StepPrice/StepPrice";
import { StepSummary } from "../../../../features/mercadoLibre/components/steps/StepSummary/StepSummary";

const STEP_COMPONENTS = {
    categoria:    StepCategory,
    condicion:    StepCondition,
    media:        StepMedia,
    descripcion:  StepDescription,
    precio:       StepPrice,
    envio:        StepShipment,
    resumen:      StepSummary,
};

export function MLPublishPage() {
    const { step, productId } = useParams();

    const Component = STEP_COMPONENTS[step];

    if (!Component) {
        return <Navigate to={`/mercado-libre/publicar/${productId}/categoria`} replace />;
    }

    return <Component />;
}
