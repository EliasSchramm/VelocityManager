import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {  Observable, of } from 'rxjs';
import { catchError,  map } from 'rxjs/operators';
import { PingResponse } from '../models/httpResponses.models';
import { environment } from './../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    constructor(
        private http: HttpClient,
        private router: Router
    ) {}

    public isLoggedIn(): Observable<boolean> {
        const credentials = this.getSavedCredentials();
        if (!credentials) {
            return of(false);
        }

        return this.http
            .get<PingResponse>(environment.apiUrl + '/ping', {
                headers: this.generateHeader(credentials),
            })
            .pipe(
                map(() => {
                    return true;
                }),
                catchError(() => {
                    localStorage.removeItem('credentials');
                    return of(false);
                })
            );
    }

    private generateHeader(credentials: String): { [header: string]: string } {
        return { Authorization: 'Basic ' + credentials };
    }

    private getSavedCredentials(): String | null {
        return localStorage.getItem('credentials');
    }

    public logout(): void {
        localStorage.removeItem('credentials')
        this.router.navigate(['login'])
    }

    public login(username: String, password: String): Observable<boolean> {
        const credentials = btoa(`${username}:${password}`);

        return this.http
            .get<PingResponse>(environment.apiUrl + '/ping', {
                headers: this.generateHeader(credentials),
            })
            .pipe(
                map(() => {
                    localStorage.setItem('credentials', credentials);
                    return true;
                }),
                catchError(() => {
                    return of(false);
                })
            );
    }
}