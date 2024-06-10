import { Routes } from '@angular/router';
import { CanvaspageComponent } from './pages/canvas/canvaspage.component';
import { HomepageComponent } from './pages/home/homepage.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        component: HomepageComponent,
    },
    {
        path: 'canvas',
        component: CanvaspageComponent,
    }
];
