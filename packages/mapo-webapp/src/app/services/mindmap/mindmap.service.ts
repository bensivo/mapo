import { SupabaseService } from "../supabase/supabase.service";
import { Injectable } from "@angular/core";
import axios from 'axios';
import { MindmapStore } from "../../store/mindmap.store";
import { Mindmap } from "../../models/mindmap.interface";

@Injectable({
    providedIn: 'root'
})
export class MindmapService {

    constructor(
        private supabaseService: SupabaseService,
        private store: MindmapStore,
    ) { }

    fetchMindmaps() {
        this.supabaseService.getAll<Mindmap>('mindmaps')
            .then((mindmaps) => {
                this.store.set(mindmaps);
            });
    }
}