import { Injectable } from "@angular/core";
import axios from 'axios';
import { Mindmap } from "../../models/mindmap.interface";

import { AuthChangeEvent, AuthSession, Session, User, createClient, } from '@supabase/supabase-js';

export interface Profile {
    id?: string
    username: string
    website: string
    avatar_url: string
}

@Injectable({
    providedIn: 'root',
})
export class SupabaseService {
    private projectUrl: string = 'https://dauzhiqsfamfeihvfzdg.supabase.co';
    private apiKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdXpoaXFzZmFtZmVpaHZmemRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc5ODg1MDUsImV4cCI6MjAzMzU2NDUwNX0.Gasq6nqP5JLxtH8GyNtirWtQ5K86ZJ90VH_zDKQ7QCQ';
    private supabase = createClient(this.projectUrl, this.apiKey);
    _session: AuthSession | null = null

    get session() {
        this.supabase.auth.getSession().then(({ data }) => {
            this._session = data.session
        })
        return this._session
    }

    profile(user: User) {
        return this.supabase
            .from('profiles')
            .select(`username, website, avatar_url`)
            .eq('id', user.id)
            .single()
    }

    authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
        return this.supabase.auth.onAuthStateChange(callback)
    }

    signIn(email: string) {
        return this.supabase.auth.signInWithOtp({ email }) // Sends a magic link to the users email
    }

    signOut() {
        return this.supabase.auth.signOut()
    }

    updateProfile(profile: Profile) {
        const update = {
            ...profile,
            updated_at: new Date(),
        }

        return this.supabase.from('profiles').upsert(update)
    }

    downLoadImage(path: string) {
        return this.supabase.storage.from('avatars').download(path)
    }

    uploadAvatar(filePath: string, file: File) {
        return this.supabase.storage.from('avatars').upload(filePath, file)
    }


    async getMindMaps(): Promise<Mindmap[]> {
        const res = await axios.get(`${this.projectUrl}/rest/v1/mindmaps`, {
            headers: {
                'apikey': this.apiKey,
                'Authorization': `Bearer ${this.apiKey}` // Temporary, we'll eventually replace this with the user login
            }
        });

        return res.data;
    }


    async getAll<T = any>(table: string): Promise<T[]> {
        const res = await axios.get(`${this.projectUrl}/rest/v1/${table}`, {
            headers: {
                'apikey': this.apiKey,
                'Authorization': `Bearer ${this.apiKey}` // Temporary, we'll eventually replace this with the user login
            }
        });

        return res.data;
    }
}