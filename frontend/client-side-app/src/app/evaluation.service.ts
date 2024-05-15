import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { API_URL } from './util';
import { Evaluation } from './evaluation';

@Injectable({ providedIn: 'root' })

export class EvaluationService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) { }

  /** GET evaluations from the server */
  getEvaluations(): Observable<Evaluation[]> {
    const url = `${API_URL}/evaluations`;

    return this.http.get<Evaluation[]>(url)
      .pipe(catchError(this.handleError<Evaluation[]>('getEvaluations', []))
      );
  }
  
  /** GET evaluation by id
   * Send StatusCode 404 if id not found */
  getEvaluation(id: string): Observable<Evaluation> {
    const url = `${API_URL}/evaluation/id/${id}`;

    return this.http.get<Evaluation>(url)
      .pipe(catchError(this.handleError<Evaluation>(`getEvaluation id=${id}`))
    );
  }

  /** GET evaluations from a websiteURL */
  getWebsiteEvaluationsData(websiteURL: string | undefined): Observable<Evaluation[]> {
    if (websiteURL === undefined || !websiteURL.trim())
      return of([]);

    const url = `${API_URL}/evaluations/website/?websiteURL=${websiteURL}`;

    return this.http.get<Evaluation[]>(url).pipe(
      tap(evaluations => evaluations.length ?
          console.log(`found evaluations matching "${websiteURL}"`) :
          console.log(`no evaluations matching "${websiteURL}"`)),
      catchError(this.handleError<Evaluation[]>('getWebsiteEvaluationsData', []))
    );
  }

  /** GET evaluation from a pageURL */
  getEvaluationFromPage(pageURL: string | undefined): Observable<Evaluation> {
    if (pageURL === undefined || !pageURL.trim())
      return of();

    const url = `${API_URL}/evaluation/page/?pageURL=${pageURL}`;

    return this.http.get<Evaluation>(url)
      .pipe(catchError(this.handleError<Evaluation>('getEvaluationFromPage'))
    );
  }

  //////// Save methods //////////

  /** POST: add a new evaluation to the server */
  addEvaluation(evaluation: Evaluation): Observable<Evaluation> {
    const url = `${API_URL}/evaluation`;

    return this.http.post<Evaluation>(url, evaluation, this.httpOptions).pipe(
      tap((newEvaluation: Evaluation) => console.log(`added evaluation w/ id=${newEvaluation._id}`)),
      catchError(this.handleError<Evaluation>('addEvaluation'))
    );
  }

  /** DELETE: delete the evaluation from the server */
  deleteEvaluation(id: string): Observable<Evaluation> {
    const url = `${API_URL}/evaluation/id/${id}`;

    return this.http.delete<Evaluation>(url, this.httpOptions).pipe(
      tap(_ => console.log(`deleted evaluation id=${id}`)),
      catchError(this.handleError<Evaluation>('deleteEvaluation'))
    );
  }

  /** PUT: update the evaluation on the server */
  updateEvaluation(evaluation: Evaluation): Observable<any> {
    const url = `${API_URL}/evaluation/id/${evaluation._id}`;

    return this.http.put(url, evaluation, this.httpOptions)
      .pipe(catchError(this.handleError<any>('updateEvaluation')));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return of(result as T);
    };
  }
}
