import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../store/auth.store';
import { TitleComponent } from '../title/title.component';
import { PersistenceService } from '../../services/persistence/persistence.service';
import { TitleStore } from '../../store/title.store';
import { ToastService } from '../../services/toast/toast.service';
import { AutoSaveStore } from '../../services/autosave/autosave.store';

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
    private authStore: AuthStore,
    private persistenceService: PersistenceService,
    private titleStore: TitleStore,
    private toastService: ToastService,
    private autoSaveStore: AutoSaveStore,
  ) { }

  autoSaveStatus$ = this.autoSaveStore.autoSaveStatus$;

  get isLoggedIn(): boolean {
    return this.authStore.user.value !== null;
  }

  onClickHome() {
    this.router.navigate(['/']);
  }

  onClickFiles() {
    this.router.navigate(['/files']);
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

        const data = e.target.result as string;
        this.persistenceService.loadCanvasState(data);
      };
      reader.readAsText(file);
    };
    fileInput.click();
    fileInput.remove();
  }

  onClickExport() {
    const title = this.titleStore.title.value;

    const data = this.persistenceService.serializeCanvasState();
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(data);

    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `${title}.mapo`);
    link.click();
    link.remove();
  }
}
