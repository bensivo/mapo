import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../store/auth.store';
import { TitleComponent } from '../title/title.component';
import { FilesService } from '../../services/files/files.service';
import { EdgeStore } from '../../store/edge.store';
import { FilesStore } from '../../store/files.store';
import { TextNodeStore } from '../../store/text-node.store';
import { TitleStore } from '../../store/title.store';
import base64 from 'base-64';
import { FileContent } from '../../models/file.interface';

@Component({
    selector: 'app-iconbar',
    standalone: true,
    imports: [CommonModule, TitleComponent],
    templateUrl: './iconbar.component.html',
    styleUrl: './iconbar.component.less',
})
export class IconbarComponent {
    constructor(
        private router: Router,
        private edgeStore: EdgeStore,
        private textNodeStore: TextNodeStore,
        private titleStore: TitleStore,
        private filesStore: FilesStore,
        private filesService: FilesService,
        private authStore: AuthStore
    ) { }

    get isLoggedIn(): boolean {
        return this.authStore.user.value !== null;
    }

    onClickHome() {
        this.router.navigate(['/']);
    }

    onClickFiles() {
        this.router.navigate(['/files']);
    }

    onClickSave() {
        const edges = this.edgeStore.edges.value;
        const textNodes = this.textNodeStore.textNodes.value;
        const title = this.titleStore.title.value;
        const id = this.filesStore.currentFileId.value;

        const content: FileContent = {
            id: id,
            name: title,
            edges: edges,
            textNodes: textNodes,
        }
        const data = JSON.stringify(content);

        if (id) {
            this.filesService.updateFile({
                id: id,
                name: title,
                contentBase64: base64.encode(data),
            });
        } else {
            this.filesService.saveFile({
                name: title,
                contentBase64: base64.encode(data),
            });
        }
    }

    onClickImport() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.mapo';
        fileInput.onchange = (e) => {
            const target = e.target as HTMLInputElement;
            if (!target.files) {
                return;
            }

            const file = target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                if (!e.target) {
                    return;
                }

                const content: FileContent = JSON.parse(e.target.result as string);
                this.filesService.loadFile(content);
            };
            reader.readAsText(file);
        };
        fileInput.click();
        fileInput.remove();
    }


    onClickExport() {
        const edges = this.edgeStore.edges.value;
        const textNodes = this.textNodeStore.textNodes.value;
        const title = this.titleStore.title.value;
    
        const content: FileContent = {
          id: null, // We purposely don't export the ID of the file, because if someone imports it, it'll be a brand new file
          name: title,
          edges: edges,
          textNodes: textNodes,
        }
        const data = JSON.stringify(content);
        const dataUri =
          'data:application/json;charset=utf-8,' + encodeURIComponent(data);
    
        const link = document.createElement('a');
        link.setAttribute('href', dataUri);
        link.setAttribute('download', `${title}.mapo`);
        link.click();
        link.remove();
    }
}
