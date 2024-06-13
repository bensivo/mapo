import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.less'
})
export class HomepageComponent {

  constructor(
    private router: Router
  ) {}

  onClickStartMapping() {
    this.router.navigate(['/canvas']);

  }
}
