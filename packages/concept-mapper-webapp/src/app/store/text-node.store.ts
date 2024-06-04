import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { TextNode } from "../models/textnode.interface";

@Injectable({
    providedIn: 'root'
})
export class TextNodeStore {
    textNodes = new BehaviorSubject<TextNode[]>([]);
    textNodes$ = this.textNodes.asObservable();

    constructor() {
        // NOTE: weird bug, if you reload the page and immeditely drag one of these seeded objects, the "mouse:up" trigger stops firing
        // This does not happen if you manually add at least 1 node manually.
        // This also never happens on manually-added nodes generally.
        // 
        // for(let i = 0; i < 10; i++) {
        //     this.insert({
        //         id: i.toString(),
        //         x: i * 50,
        //         y: i * 50,
        //         text: `${i}`,
        //     });
        // }
    }

    insert(textNode: TextNode) {
        this.textNodes.next([...this.textNodes.value, textNode]);
    }

    remove(id: string) {
        this.textNodes.next(this.textNodes.value.filter((node) => node.id !== id));
    }

    update(id: string, textNode: Partial<TextNode>) {
        this.textNodes.next(this.textNodes.value.map((node) => {
            if (node.id !== id) {
                return node;
            }

            return {
                ...node,
                ...textNode,
            }
        }));
    }
}