import { Routes } from '@angular/router';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { CanvaspageComponent } from './pages/canvaspage/canvaspage.component';
import { FilesPageComponent } from './pages/files-page/files-page.component';

export const routes: Routes = [
    {
        path: '',
        component: HomepageComponent,
    },
    {
        path: 'canvas',
        component: CanvaspageComponent,
    },
    {
        path: 'files',
        component: FilesPageComponent,
    }
];
