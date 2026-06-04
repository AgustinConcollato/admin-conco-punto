import { NewClientForm } from "../../components/NewClientForm/NewClientForm";
import styles from './NewClientPage.module.css';

export function NewClientPage() {
    return (
        <div className={styles.page}>
            <h1 className="title">Agregar nuevo cliente</h1>
            <NewClientForm />
        </div>
    );
}


