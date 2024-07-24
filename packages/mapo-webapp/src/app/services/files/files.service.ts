import { Inject, Injectable } from "@angular/core";
import axios from 'axios';
import { CONFIG, Config } from '../../app.config';
import { AuthStore } from "../../store/auth.store";
import { File, FileContent } from "../../models/file.interface";
import { FilesStore } from "../../store/files.store";
import { EdgeStore } from "../../store/edge.store";
import { TextNodeStore } from "../../store/text-node.store";
import { TitleStore } from "../../store/title.store";

export interface SaveFileDto {
    name: string;
    contentBase64: string;
}

export interface UpdateFileDto {
    id: number;
    name: string;
    contentBase64: string;
}

/**
 * Service for interacting with the files API.
 */
@Injectable({
    providedIn: 'root'
})
export class FilesService {

    constructor(
        @Inject(CONFIG)
        private config: Config,
        private authStore: AuthStore,
        private filesStore: FilesStore,
        private edgeStore: EdgeStore,
        private textNodeStore: TextNodeStore,
        private titleStore: TitleStore,
    ) {

        // TODO: this shoudl not exist in the component, but on the service level probably.
        this.authStore.accessToken$.subscribe((token) => {
            console.log('New token', token)
            if (token) {
                this.fetchFiles();
            }
        })
    }

    async fetchFiles(): Promise<void> {
        const token = this.authStore.accessToken.getValue();
        if (!token) {
            throw Error('No access token available');
        }

        console.log('Fetching files for user');
        const res = await axios.get(`${this.config.MAPO_API_BASE_URL}/files`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        })

        const files = res.data as File[];
        this.filesStore.setFiles(files);
    }


    async saveFile(dto: SaveFileDto): Promise<void> {
        const token = this.authStore.accessToken.getValue();
        if (!token) {
            throw Error('No access token available');
        }

        console.log('Saving file', dto.name);
        const res = await axios.post(
            `${this.config.MAPO_API_BASE_URL}/files`,
            {
                name: dto.name,
                contentBase64: dto.contentBase64,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            }
        );

        const id = res.data.id;
        this.filesStore.setCurrentFileId(id);
    }

    async updateFile(dto: UpdateFileDto): Promise<void> {
        const token = this.authStore.accessToken.getValue();
        if (!token) {
            throw Error('No access token available');
        }

        console.log('Updating file', dto.id, dto.name);
        await axios.patch(
            `${this.config.MAPO_API_BASE_URL}/files/${dto.id}`,
            {
                name: dto.name,
                contentBase64: dto.contentBase64,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            }
        );
    }

    async deleteFile(id: number): Promise<void> {
        const token = this.authStore.accessToken.getValue();
        if (!token) {
            throw Error('No access token available');
        }

        console.log('Deleting file', id);
        await axios.delete(
            `${this.config.MAPO_API_BASE_URL}/files/${id}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            }
        );

        await this.fetchFiles();
    }

    /**
     * Update all the appropriate stores to get the canvas to show the given file's content
     * 
     * TODO: should this be here? Or in the canvas service?
     * 
     * @param content
     */
    loadFile(content: FileContent) {
        // TODO: Add a 'version' attribute to data, so that we can add more features in the future
        // without breaking old saves
        const edges = content.edges;
        const textNodes = content.textNodes;
        const title = content.name ?? content.title;
        const id = content.id ?? null;

        // Set all stores to empty
        this.edgeStore.set([]);
        this.textNodeStore.set([]);
        this.titleStore.set('');
        this.filesStore.setCurrentFileId(null);

        // Set new values
        this.textNodeStore.set(textNodes);
        this.edgeStore.set(edges);
        this.titleStore.set(title);
        this.filesStore.setCurrentFileId(id);
    }
}