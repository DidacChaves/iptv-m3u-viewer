import { createAsyncThunk } from '@reduxjs/toolkit';
import { parse } from 'iptv-playlist-parser';
import { STORAGE_KEY } from 'services/constants';
import { selectAllFiles } from 'store/selector/entrys';
import { RootState } from 'store/store';
import { File, Filter } from 'types';
import { localStoageGet, localStorageSet } from 'services/utils';

async function createDefaultFile(): Promise<File> {
    const response = await fetch('/iptv-visor/assets/channels.m3u');
    if (!response.ok) {
        throw new Error('Error al cargar el archivo de canales');
    }

    const defaultFileData = await response.text();
    const defaultParsedData = parse(defaultFileData);

    return {
        id: 'file:default',
        name: 'Channels',
        savedPath: 'file:default',
        entrys: defaultParsedData.items.map(item => ({
            groupName: item.group.title,
            fileName: 'Channels',
            logo: item.tvg.logo,
            language: item.tvg.language,
            name: item.name,
            url: item.url,
            country: item.tvg.country
        }))
    };
}

export const loadFile = createAsyncThunk('files/load', async ({ name, data }: { name: string, data: string }, thunkAPI): Promise<File> => {
    const file = parse(data);
    let savePath: string | null = null;
    const files = selectAllFiles(thunkAPI.getState() as RootState)
    for (let i = 0; ; i++) {
        savePath = `file:${name}${i}`;
        if (!files.some(f => f.savedPath === savePath)) {
            break;
        }
    }
    localStorageSet(savePath, data).catch(console.error);
    return {
        id: savePath,
        name,
        savedPath: savePath,
        entrys: file.items.map(item => ({
            groupName: item.group.title,
            fileName: name,
            logo: item.tvg.logo,
            language: item.tvg.language,
            name: item.name,
            url: item.url,
            country: item.tvg.country
        })),
    }
});
export const loadApp = createAsyncThunk('load', async (): Promise<{ filters: Filter[], files: File[] }> => {
    const files = await localStoageGet(STORAGE_KEY.FILES);
    const filters = await localStoageGet(STORAGE_KEY.FILTERS);

    let parsedFiles = files ? JSON.parse(files) as File[] : [];
    if (parsedFiles.length === 0) {
        parsedFiles = [await createDefaultFile()]; // Usa await aquí para esperar el archivo
    }

    return {
        files: parsedFiles,
        filters: filters ? JSON.parse(filters) as Filter[] : []
    };
});

