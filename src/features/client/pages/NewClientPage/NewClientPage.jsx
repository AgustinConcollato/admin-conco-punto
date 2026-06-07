import { useEffect } from "react";
import { NewClientForm } from "../../components/NewClientForm/NewClientForm";
import styles from './NewClientPage.module.css';

export function NewClientPage() {

    useEffect(() => {
        document.title = 'Agregar nuevo cliente'
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })

    }, []);

    return (
        <div className={styles.page}>
            <h1 className="title">Agregar nuevo cliente</h1>
            <NewClientForm />
        </div>
    );
}


