import { Inject, Injectable } from '@angular/core';
import axios from 'axios';
import { CONFIG, Config } from '../../app.config';
import { AuthStore } from '../../store/auth.store';
import { File, FileContent } from '../../models/file.interface';
import { FilesStore } from '../../store/files.store';
import { EdgeStore } from '../../store/edge.store';
import { TextNodeStore } from '../../store/text-node.store';
import { TitleStore } from '../../store/title.store';

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
  providedIn: 'root',
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
    this.authStore.accessToken$.subscribe((token) => {
      if (token) {
        this.fetchFiles();
      }
    });
  }

  async fetchFiles(): Promise<void> {
    const token = this.authStore.accessToken.getValue();
    if (!token) {
      throw Error('No access token available');
    }

    const res = await axios.get(`${this.config.MAPO_API_BASE_URL}/files`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const files = res.data as File[];
    this.filesStore.setFiles(files);
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

    await this.fetchFiles();
  }
}
