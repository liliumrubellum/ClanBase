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

  postVote(data: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl, data, httpOptions);
  }

  getVote(all: boolean = false): Observable<any> {
    return this.http.get<any>(environment.apiUrl + (all ? '?all=1' : ''));
  }

  deleteVote(id: number): Observable<any> {
    return this.http.delete<any>(environment.apiUrl + '/' + id);
  }
}
