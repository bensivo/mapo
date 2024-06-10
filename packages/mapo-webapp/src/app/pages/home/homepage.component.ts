import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular'; // Angular Data Grid Component
import { SupabaseService } from '../../services/supabase/supabase.service';
import { MindmapStore } from '../../store/mindmap.store';
import { MindmapService } from '../../services/mindmap/mindmap.service';



@Component({
    selector: 'app-homepage',
    standalone: true,
    imports: [CommonModule, AgGridAngular, ReactiveFormsModule],
    templateUrl: './homepage.component.html',
    styleUrl: './homepage.component.less'
})
export class HomepageComponent  implements OnInit{

    loading = false

    signInForm = this.formBuilder.group({
      email: '',
    })
  
    constructor(
      private readonly supabase: SupabaseService,
      private readonly formBuilder: FormBuilder,
        private mindmapStore: MindmapStore,
        private mindmapService: MindmapService,
    ) {
    }
  
    async onSubmit(): Promise<void> {
      try {
        this.loading = true
        const email = this.signInForm.value.email as string
        const { error } = await this.supabase.signIn(email)
        if (error) throw error
        alert('Check your email for the login link!')
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message)
        }
      } finally {
        this.signInForm.reset()
        this.loading = false
      }
    }
    // constructor(
    // ) { }

    // mindmaps$ = this.mindmapStore.mindmaps$;

    // data$: Observable<{ rows: any[], columns: ColDef[] }> = this.mindmaps$.pipe(
    //     mergeMap(mindmaps => {
    //         console.log(mindmaps)
    //         const rows = mindmaps.map(mindmap => ({
    //             title: mindmap.title,
    //             created_at: mindmap.created_at,
    //             updated_at: mindmap.updated_at,
    //         }));
    //         return of({
    //             columns: [
    //                 { field: 'title', flex: 2, filter: true, onCellClicked: this.onCellClicked.bind(this), },
    //                 { field: 'created_at', flex: 1, onCellClicked: this.onCellClicked.bind(this) },
    //                 { field: 'updated_at', flex: 1, onCellClicked: this.onCellClicked.bind(this) },
    //             ],
    //             rows: [
    //                 ...rows, ...rows, ...rows, ...rows,
    //                 ...rows, ...rows, ...rows, ...rows,
    //                 ...rows, ...rows, ...rows, ...rows,
    //                 ...rows, ...rows, ...rows, ...rows,
    //                 ...rows, ...rows, ...rows, ...rows,
    //             ],
    //         });
    //     })
    // )

    ngOnInit(): void {
        if (this.supabase.session !== null) {
            console.log(this.supabase.session)
        }

        this.supabase.authChanges((event, session) => {
            if (event === 'SIGNED_IN') {
                this.mindmapService.fetchMindmaps();
            }
            console.log(event, session);
        })
        // this.mindmapService.fetchMindmaps();
    }

    // onCellClicked(e: any) {
    //     console.log(e);
    // }
}
