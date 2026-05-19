/**
 * Genera un string aleatorio que contiene letras (a-z, A-Z) y números (0-9).
 * * @param {number} length La longitud deseada del string. Por defecto es 10.
 * @returns {string} El string aleatorio generado.
 */

export function generateRandomString(length = 10) {
    // Define el conjunto de caracteres a utilizar (letras mayúsculas, minúsculas y números)
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;

    // Itera 'length' veces para construir el string
    for (let i = 0; i < length; i++) {
        // Selecciona un índice aleatorio dentro de la longitud de 'characters'
        const randomIndex = Math.floor(Math.random() * charactersLength);

        // Agrega el carácter correspondiente al resultado
        result += characters.charAt(randomIndex);
    }

    return result;
}