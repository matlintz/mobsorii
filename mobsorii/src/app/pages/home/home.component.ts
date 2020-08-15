import { Component, OnInit } from '@angular/core';

import {DataService} from '../../services/data.service';
import { Data } from '@angular/router';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(public dataservice:DataService) { }

  ngOnInit(): void {
  }
  initDb() {
    this.dataservice.initializeSystems();
  }
}
