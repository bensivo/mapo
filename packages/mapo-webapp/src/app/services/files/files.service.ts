import { Inject, Injectable } from '@angular/core';
import axios from 'axios';

import { CONFIG, Config } from '../../app.config';
import { AuthStore } from '../../store/auth.store';
import { File } from '../../models/file.interface';
import { Folder } from '../../models/folder.interface';
import { FilesStore } from '../../store/files.store';

export interface SaveFileDto {
  folderId: number;
  name: string;
  contentBase64: string;
}

export interface UpdateFileDto {
  id: number;
  name: string;
  contentBase64: string;
  folderId?: number;
}

/**
 * Service for interacting with the files API.
 */
@Injectable({
  providedIn: 'root',
})
export class FilesService {
  constructor(
    @Inject(CONFIG)
    private config: Config,
    private authStore: AuthStore,
    private filesStore: FilesStore,
  ) {
    this.authStore.accessToken$.subscribe((token) => {
      if (token) {
        this.fetch();
      }
    });
  }

  /**
   * Fetches this user's files and folders from the API.
   */
  async fetch(): Promise<void> {
    const token = this.authStore.accessToken.getValue();
    if (!token) {
      throw Error('No access token available');
    }

    const [filesRes, foldersRes] = await Promise.all([
      axios.get(`${this.config.MAPO_API_BASE_URL}/files`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }),
      axios.get(`${this.config.MAPO_API_BASE_URL}/folders`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }),
    ]);

    const files = filesRes.data as File[];
    const folders = foldersRes.data as Folder[];

    this.filesStore.setFiles(files);
    this.filesStore.setFolders(folders);
  }

  async saveFile(dto: SaveFileDto): Promise<void> {
    const token = this.authStore.accessToken.getValue();
    if (!token) {
      throw Error('No access token available');
    }

    const res = await axios.post(
      `${this.config.MAPO_API_BASE_URL}/files`,
      {
        name: dto.name,
        contentBase64: dto.contentBase64,
        folderId: dto.folderId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const id = res.data.id;
    this.filesStore.setCurrentFileId(id);
  }

  async updateFile(dto: UpdateFileDto): Promise<void> {
    const token = this.authStore.accessToken.getValue();
    if (!token) {
      throw Error('No access token available');
    }

    await axios.patch(
      `${this.config.MAPO_API_BASE_URL}/files/${dto.id}`,
      {
        name: dto.name,
        contentBase64: dto.contentBase64,
        folderId: dto.folderId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );
  }

  async deleteFile(id: number): Promise<void> {
    const token = this.authStore.accessToken.getValue();
    if (!token) {
      throw Error('No access token available');
    }

    await axios.delete(`${this.config.MAPO_API_BASE_URL}/files/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    await this.fetch();
  }

  async createFolder(name: string, parentId: number): Promise<void> {
    const token = this.authStore.accessToken.getValue();
    if (!token) {
      throw Error('No access token available');
    }

    await axios.post(
      `${this.config.MAPO_API_BASE_URL}/folders`,
      {
        name,
        parentId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    await this.fetch();
  }

  async deleteFolder(id: number): Promise<void> {
    const token = this.authStore.accessToken.getValue();
    if (!token) {
      throw Error('No access token available');
    }

    await axios.delete(`${this.config.MAPO_API_BASE_URL}/folders/${id}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    await this.fetch();
  }
}
