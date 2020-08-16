import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public dbInitializing: boolean = false;
  constructor(public dataservice: DataService) { }

  ngOnInit(): void {
    this.dataservice.openDataBase().then(
      (r) => {

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
