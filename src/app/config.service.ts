import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { Http } from '@angular/http';
//'rxjs/add/operator/map';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  config: any;
  constructor(private http: HttpClient) { }

  getConfig(): Observable<any> {
    return this.http.get('assets/config.json');//.pipe(
      //tap(x => console.log(x))
      //catchError(x => console.log(x))
    //);
  }

}
