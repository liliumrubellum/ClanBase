import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { environment } from '../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  vote(data: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl, data, httpOptions);
  }

  getVote(): Observable<any> {
    return this.http.get<any>(environment.apiUrl);
  }
}
