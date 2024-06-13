import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-help',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './help.component.html',
    styleUrl: './help.component.less'
})
export class HelpComponent {

    show: boolean = false;

    toggleHelp() {
        this.show = !this.show;
    }
}
