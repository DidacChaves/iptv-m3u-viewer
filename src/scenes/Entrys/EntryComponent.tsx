import { Card, Typography } from '@material-ui/core';
import React, {useCallback, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Entry } from 'types';
import style from './entry.module.css';
import { snackBarMessagePublished, snackbarVisibillityChanged } from 'store/reducer'
import { selectAllFiles, selectFileFilter } from 'store/selector/entrys';
import { DisplayIf } from 'comonents/DisplayIf';

interface EntryComponentProps {
    entry: Entry;
}

export const EntryComponent = ({ entry }: EntryComponentProps) => {
    const dispatch = useDispatch();
    const fileFilter = useSelector(selectFileFilter);
    const files = useSelector(selectAllFiles);
    const shouldDisplayFile = fileFilter.length === 0 && files.length > 1;
    const [imageSrc, setImageSrc] = useState(entry.logo || '/iptv-visor/assets/tvLogo.png'); // Ruta de la imagen por defecto
    const handleError = () => {
        // Cambiar a la imagen de respaldo si la imagen no se puede cargar
        setImageSrc('/iptv-visor/assets/tvLogo.png');
    };
    const onClick = useCallback(() => {
        const newWindow = window.open(entry.url, '_blank');
        const success = !!newWindow;  // Comprobación de éxito en la apertura de la URL

        dispatch(snackbarVisibillityChanged(false));
        setTimeout(() => {
            dispatch(snackBarMessagePublished({
                message: success ? `Link Opened - ${entry.name}` : 'Failed to open link',
                severity: success ? 'success' : 'error',
            }));
        }, 0);
    }, [entry, dispatch]);
    return (
        <Card className={style.container} onClick={onClick}>
            <Typography variant="h6">{entry.name}</Typography>
            <Typography>{entry.groupName}</Typography>
            <DisplayIf expr={shouldDisplayFile}>
                <Typography variant="caption">{entry.fileName}</Typography>
            </DisplayIf>
            <div className={style.imageContainer}>
                <img src={imageSrc} className={style.image} onError={handleError} />
            </div>

        </Card>
    );
};
