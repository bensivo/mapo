import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-files-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './files-page.component.html',
  styleUrl: './files-page.component.less'
})
export class FilesPageComponent {

  constructor(
    private router: Router
  ){}

  data = [
    { title: 'Lecture 1.2.3 - Overview', updatedAt: new Date(), },
    { title: 'Lecture 1.2.3 - Overview', updatedAt: new Date(), },
    { title: 'Lecture 1.2.3 - Overview', updatedAt: new Date(), },
    { title: 'Lecture 1.2.3 - Overview', updatedAt: new Date(), },
    { title: 'Lecture 1.2.3 - Overview', updatedAt: new Date(), },
    { title: 'Lecture 1.2.3 - Overview', updatedAt: new Date(), },
    { title: 'Lecture 1.2.3 - Overview', updatedAt: new Date(), },
    { title: 'Lecture 1.2.3 - Overview', updatedAt: new Date(), },
    { title: 'Lecture 1.2.3 - Overview', updatedAt: new Date(), },
    { title: 'Lecture 1.2.3 - Overview', updatedAt: new Date(), },
    { title: 'Lecture 1.2.3 - Overview', updatedAt: new Date(), },
    { title: 'Lecture 1.2.3 - Overview', updatedAt: new Date(), },
    { title: 'Lecture 1.2.3 - Overview', updatedAt: new Date(), },
    { title: 'Lecture 1.2.3 - Overview', updatedAt: new Date(), },
    { title: 'Lecture 1.2.3 - Overview', updatedAt: new Date(), },
    { title: 'Lecture 1.2.3 - Overview', updatedAt: new Date(), },
    { title: 'Lecture 1.2.3 - Overview', updatedAt: new Date(), },
    { title: 'Lecture 1.2.3 - Overview', updatedAt: new Date(), },
    { title: 'Lecture 1.2.3 - Overview', updatedAt: new Date(), },
    { title: 'Lecture 1.2.3 - Overview', updatedAt: new Date(), },
    { title: 'Lecture 1.2.3 - Overview', updatedAt: new Date(), },
    { title: 'Lecture 1.2.3 - Overview', updatedAt: new Date(), },
    { title: 'Lecture 1.2.3 - Overview', updatedAt: new Date(), },
    { title: 'Lecture 1.2.3 - Overview', updatedAt: new Date(), },
    { title: 'Lecture 1.2.3 - Overview', updatedAt: new Date(), },
    { title: 'Lecture 1.2.3 - Overview', updatedAt: new Date(), },
    { title: 'Lecture 1.2.3 - Overview', updatedAt: new Date(), },
    { title: 'Lecture 1.2.3 - Overview', updatedAt: new Date(), },
  ]

  onClickCreateMindMap() {
    this.router.navigate(['canvas'])
  }
}
