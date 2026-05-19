import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../../contexts/AuthContext';
import styles from './Login.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

export function Login() {

    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [errors, setErrors] = useState(false);
    const [loading, setLoading] = useState(false);
    const [inputType, setInputType] = useState('password');

    const handleInputChange = (e) => {
        const { name } = e.target;
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);

        try {
            await login(formData);
        } catch (error) {
            setErrors(error?.errors);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user])

    return (
        <div className={styles.login}>
            <form onSubmit={handleSubmit} className={styles.login_form}>
                <h2>Ingresar</h2>
                <input
                    type="text"
                    name='email'
                    placeholder='Correo electrónico'
                    onChange={handleInputChange}
                    value={'bazarshopmayorista@gmail.com'}
                    hidden
                />
                <div className='input_group'>
                    <span>Contraseña</span>
                    <input
                        className='input'
                        type={inputType}
                        name='password'
                        placeholder='Contraseña'
                        onChange={handleInputChange}
                    />
                    {errors.password && errors.password.map((msg, i) => (
                        <p key={i} className={styles.error}>{msg}</p>
                    ))}
                    <label>
                        <input type="checkbox" onChange={() => setInputType(e => e == 'password' ? 'text' : 'password')} />
                        <span>Mostrar contraseña</span>
                    </label>
                </div>
                <button
                    type="submit"
                    className='btn btn_solid'
                    disabled={loading}
                >
                    {loading ?
                        <FontAwesomeIcon icon={faCircleNotch} spin /> :
                        'Entrar'
                    }
                </button>
            </form>
        </div>
    );
}