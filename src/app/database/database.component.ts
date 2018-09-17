import { Component, OnInit } from '@angular/core';

import { ApiService } from '../api.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-database',
  templateUrl: './database.component.html',
  styleUrls: ['./database.component.css']
})
export class DatabaseComponent implements OnInit {
  allVoteData: any;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.getVote();
  }

  getVote() {
    this.apiService.getVote(true).subscribe(v => {
      v.forEach(x => x.create_date = new Date(x.create_date));
      this.allVoteData = v;
    });
  }

  deleteVote(id) {
    this.apiService.deleteVote(id).subscribe(v => {
      //console.log(v);
      this.getVote();
    });
  }
}
