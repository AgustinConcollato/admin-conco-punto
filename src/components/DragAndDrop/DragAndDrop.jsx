import { useRef, useState } from 'react'
import { ImageDownloadIcon, ImageIcon } from '../../assets/icons'
import styles from './DragAndDrop.module.css'

export function DragAndDrop({ setImages }) {
    const [dragging, setDragging] = useState(false)
    const fileInputRef = useRef(null)

    const handleDragEnter = (event) => {
        event.preventDefault()
        event.stopPropagation()
        setDragging(true)
    }

    const handleDragLeave = (event) => {
        event.preventDefault()
        event.stopPropagation()
        setDragging(false)
    }

    const handleDragOver = (event) => {
        event.preventDefault()
        event.stopPropagation()
    }

    const handleDrop = (event) => {
        event.preventDefault()
        event.stopPropagation()
        setDragging(false)

        const files = Array.from(event.dataTransfer.files)
        updatePictures(files)

        event.target.value = ''
    }

    const handleChange = (event) => {
        const files = Array.from(event.target.files)
        updatePictures(files)

        event.target.value = ''
    }

    const updatePictures = (files) => {
        setImages((current) => {
            const currentLength = current.length

            if (currentLength === 5) return current

            const imageFiles = files.filter(
                file => file.type.startsWith('image/')
            )

            const uniqueFiles = imageFiles.filter(
                file => !current.some(currentFile => currentFile.name === file.name)
            )

            if (uniqueFiles.length === 0) return current

            if (uniqueFiles.length > 5 && currentLength === 0) {
                return uniqueFiles.slice(0, 5)
            }

            if ((uniqueFiles.length + currentLength) > 5) {
                return [...current, ...uniqueFiles.slice(0, (5 - currentLength))]
            }

            return [...current, ...uniqueFiles]
        })
    }

    return (
        <div
            className={`${styles.drop_zone} ${dragging ? 'dragover' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
        >
            <span>{dragging ?
                <div>
                    <ImageDownloadIcon
                        width={64}
                        height={64}
                    />
                    Soltar Imagen/es
                </div> :
                <div>
                    <ImageIcon
                        width={64}
                        height={64}
                        color={"#000"}
                    />
                    Â¡Click o arrastrar la imagen acÃ¡!
                </div>}
            </span>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                multiple
                onChange={handleChange}
                style={{ display: 'none' }}
            />
        </div>
    )
}

