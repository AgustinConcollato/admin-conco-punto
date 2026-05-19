import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { PRICE_LISTS } from '../../../../../config/priceList';
import styles from './EditClientForm.module.css';

// Componente que irá dentro del Modal
export function EditClientForm({ client, onSave, onCancel }) {

    const [formData, setFormData] = useState({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        price_list_id: client.price_list.id || '',
    });

    const [isSaving, setIsSaving] = useState(false);

    // Manejador genérico para todos los inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        await onSave(formData);

        setIsSaving(false);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={'input_group'}>
                <span htmlFor="name">Nombre</span>
                <input
                    className='input'
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                />
            </div>

            <div className={'input_group'}>
                <span htmlFor="email">Email</span>
                <input
                    className='input'
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                />
            </div>

            <div className={'input_group'}>
                <span htmlFor="phone">Teléfono</span>
                <input
                    className='input'
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                />
            </div>

            <div className={'input_group'}>
                <span htmlFor="price_list_id">Lista de Precios</span>
                <select
                    className='input'
                    name="price_list_id"
                    value={formData.price_list_id}
                    onChange={handleChange}
                    required
                >
                    {PRICE_LISTS.map(list => (
                        <option key={list.id} value={list.id}>
                            {list.name}
                        </option>
                    ))}
                </select>
            </div>
            <button
                type="submit"
                className="btn btn_solid"
                disabled={isSaving}
            >
                {isSaving ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Guardar Cambios'}
            </button>
        </form>
    );
}