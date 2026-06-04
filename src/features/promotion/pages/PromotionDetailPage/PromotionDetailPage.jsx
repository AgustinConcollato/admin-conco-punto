import { faArrowLeft, faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Detail } from "../../../../features/promotion/components/Detail/Detail";
import { Loading } from "../../../../components/Loading/Loading";
import { PromotionService } from "../../../../services/promotion/promotionService";
import styles from './PromotionDetailPage.module.css';

export function PromotionDetailPage() {
    const promotionService = useMemo(() => new PromotionService(), []);
    const { id } = useParams();

    const [promotion, setPromotion] = useState(null);
    const [loading, setLoading] = useState(true);

    const getPromotion = async () => {
        setLoading(true);
        try {
            const data = await promotionService.getById(id);
            setPromotion(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getPromotion();
    }, []);

    return (
        <div className={styles.page}>
            <div className={styles.page_header}>
                <Link to="/promociones" className={styles.btn_back}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                </Link>
                <h1 className={styles.header_title}>
                    {promotion ? promotion.name : 'PromociÃ³n'}
                </h1>
            </div>

            {loading ? (
                <div className={styles.loading}>
                    <Loading />
                </div>
            ) : promotion ? (
                <Detail promotion={promotion} onRefresh={getPromotion} />
            ) : null}
        </div>
    );
}

