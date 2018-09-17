import { Component, OnInit, Input } from '@angular/core';

import { ConfigService } from '../config.service';
import { ApiService } from '../api.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  isProd: boolean
  config: any;
  oil: number;
  showResult: boolean;
  checkDateInterval: any;
  voteId: number;
  ownVoteData: { id: number; level: number }[];
  allVoteData: any;
  selectedMember: string;

  constructor(
    private configService: ConfigService,
    private apiService: ApiService) { }

  ngOnInit() {
    this.isProd = environment.production;
    this.getConfig();
    this.voteId = -1;
    this.selectedMember = '';
    this.allVoteData = [];
  }

  getConfig(): void {
    this.configService.getConfig()
    .subscribe(config => {
      this.config = config;
      this.oil = config.oil;
      this.ownVoteData = config.building.map(b => ({ id: b.id, level: b.minLevel }));
      this.showResult = Date.parse(this.config.dueDate) < Date.now();
      // 締切日時を監視
      if (!this.showResult) {
        this.checkDateInterval = setInterval(() => {
          if (Date.parse(this.config.dueDate) < Date.now()) {
            this.showResult = true;
            this.getVote();
            clearInterval(this.checkDateInterval);
          }
        }, 5000);
      } else {
        this.getVote();
      }
    });
  }

  // 効果の合計値を計算する
  sumValues(id: number): number {
    let sum = 0;
    let part = false;
    this.config.building
      .find(b => b.id == id).levels
      .filter(l => l.level <= this.getLevel(id))
      .forEach(l => {
        if (l.minTier == 1 && l.maxTier == 10) {
          sum += l.value;
        } else if (!part) {
          sum += l.value;
          part = true;
        }
      });
    return sum;
  }

  getLevel(id: number): number {
    if (this.showResult) {
      if (this.selectedMember) {
        return this.allVoteData
          .find(v => v.name == this.selectedMember).data
          .find(d => d.id == id).level;
      } else {
        return 0;
      }
    } else {
      return this.ownVoteData.find(x => x.id == id).level;
    }
  }

  setLevel(id: number, level: number, e: any): void {
    let l = e.target.checked ? level : level - 1;
    this.ownVoteData.find(x => x.id == id).level = l;

    // オイルの残量を再計算する
    let o = this.config.oil;
    this.ownVoteData.forEach(v => {
      let building = this.config.building.find(b => b.id == v.id);
      building.levels
      .filter(bl => building.minLevel < bl.level && bl.level <= v.level)
      .forEach(bl => o -= bl.oil)
    });
    this.oil = o;
  }

  postVote() {
    this.apiService.vote(this.ownVoteData).subscribe(id => {
      this.voteId = id;
    });
  }

  getVote() {
    this.apiService.getVote().subscribe(v => {
      this.allVoteData = v;
    });
  }

  // 投票数を計算する
  sumVotes(id: number, level: number) {
    let sum = 0;
    this.allVoteData.forEach(v => {
      if (level <= v.data.find(d => d.id == id).level) sum++;
    })
    return sum;
  }

}
