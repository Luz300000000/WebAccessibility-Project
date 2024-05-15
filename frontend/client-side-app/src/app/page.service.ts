import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { Page } from './page';
import { API_URL } from './util';

@Injectable({
  providedIn: 'root'
})
export class PageService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) { }

  /** GET pages from the server */
  getPages(): Observable<Page[]> {
    const url = `${API_URL}/pages`;

    return this.http.get<Page[]>(url)
      .pipe(catchError(this.handleError<Page[]>('getPages', []))
      );
  }
  
  /** GET page by id
   * Send StatusCode 404 if id not found */
  getPage(id: string): Observable<Page> {
    const url = `${API_URL}/page/id/${id}`;

    return this.http.get<Page>(url)
      .pipe(catchError(this.handleError<Page>(`getPage id=${id}`))
    );
  }

  /** GET page from url */
  getPageFromURL(pageURL: string | undefined): Observable<Page> {
    if (pageURL === undefined || !pageURL.trim())
      return of();

    const url = `${API_URL}/page/url/?url=${pageURL}`;

    return this.http.get<Page>(url)
      .pipe(catchError(this.handleError<Page>(`getPage pageURL=${pageURL}`))
    );
  }

  /** GET pages from a websiteURL */
  getPagesFromWebsite(websiteURL: string | undefined): Observable<Page[]> {
    if (websiteURL === undefined || !websiteURL.trim())
      return of([]);

    const url = `${API_URL}/pages/website/?websiteURL=${websiteURL}`;

    return this.http.get<Page[]>(url).pipe(
      tap(pages => pages.length ?
          console.log(`found pages matching "${websiteURL}"`) :
          console.log(`no pages matching "${websiteURL}"`)),
      catchError(this.handleError<Page[]>('getPagesFromWebsite', []))
    );
  }

  //////// Save methods //////////

  /** POST: add a new page to the server */
  addPage(page: Page): Observable<Page> {
    const url = `${API_URL}/page`;
    return this.http.post<Page>(url, page, this.httpOptions).pipe(
      tap((newPage: Page) => console.log(`added page w/ id=${newPage._id}`)),
      catchError(this.handleError<Page>('addPage'))
    );
  }

  /** DELETE: delete the page from the server */
  deletePage(id: string): Observable<Page> {
    const url = `${API_URL}/page/id/${id}`;

    return this.http.delete<Page>(url, this.httpOptions).pipe(
      tap(_ => console.log(`deleted page id=${id}`)),
      catchError(this.handleError<Page>('deletePage'))
    );
  }

  /** PUT: update the page on the server */
  updatePage(page: Page): Observable<any> {
    const url = `${API_URL}/page/id/${page._id}`;

    return this.http.put(url, page, this.httpOptions)
      .pipe(catchError(this.handleError<any>('updatePage')));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return of(result as T);
    };
  }
}
