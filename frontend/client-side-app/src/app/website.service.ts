import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { API_URL } from './util';
import { Website } from './website';

@Injectable({ providedIn: 'root' })

export class WebsiteService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) { }

  /** GET websites from the server */
  getWebsites(): Observable<Website[]> {
    const url = `${API_URL}/websites`;

    return this.http.get<Website[]>(url)
      .pipe(catchError(this.handleError<Website[]>('getWebsites', []))
      );
  }
  
  /** GET website by id
   * Send StatusCode 404 if id not found */
  getWebsite(id: string): Observable<Website> {
    const url = `${API_URL}/website/id/${id}`;

    return this.http.get<Website>(url)
      .pipe(catchError(this.handleError<Website>(`getWebsite id=${id}`))
    );
  }

  /** GET website from url */
  getWebsiteFromURL(websiteURL: string | undefined): Observable<Website> {
    if (websiteURL === undefined || !websiteURL.trim())
      return of();

    const url = `${API_URL}/website/url/?url=${websiteURL}`;

    return this.http.get<Website>(url)
      .pipe(catchError(this.handleError<Website>(`getWebsite websiteURL=${websiteURL}`))
    );
  }

  //////// Save methods //////////

  /** POST: add a new website to the server */
  addWebsite(website: Website): Observable<Website> {
    const url = `${API_URL}/website`;

    return this.http.post<Website>(url, website, this.httpOptions).pipe(
      tap((newWebsite: Website) => console.log(`added website w/ id=${newWebsite._id}`)),
      catchError(this.handleError<Website>('addWebsite'))
    );
  }

  /** DELETE: delete the website from the server */
  deleteWebsite(id: string): Observable<Website> {
    const url = `${API_URL}/website/id/${id}`;

    return this.http.delete<Website>(url, this.httpOptions).pipe(
      tap(_ => console.log(`deleted website id=${id}`)),
      catchError(this.handleError<Website>('deleteWebsite'))
    );
  }

  /** PUT: update the website on the server */
  updateWebsite(website: any): Observable<any> {
    const url = `${API_URL}/website/id/${website._id}`;
    return this.http.put(url, website, this.httpOptions)
      .pipe(catchError(this.handleError<any>('updateWebsite')));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return of(result as T);
    };
  }
}
