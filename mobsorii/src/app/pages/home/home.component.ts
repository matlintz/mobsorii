import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';
import { iSystemMember } from 'src/app/interfaces';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public dbInitializing: boolean = false;
  public universeObjects:iSystemMember[] = [];
  constructor(public dataservice: DataService,public router: Router) { }

  ngOnInit(): void {
    this.dataservice.openDataBase().then(
      (r) => {
        
      }
    )
  }
  showSystems() {
    this.dataservice.getAllSystems().then(
      (r) => {
        console.log(r);
        this.universeObjects = r;
      }
    )

  }
  redoDatabase() {
    this.dbInitializing = true;
    this.dataservice.openDataBase().then(
      () => {
        this.dataservice.deleteDataBase().then(
          () => {
            this.dataservice.openDataBase().then(
              () => {
                this.dbInitializing = false;
                confirm('Database reinitialized');
              });
          });
      });

  }

}
