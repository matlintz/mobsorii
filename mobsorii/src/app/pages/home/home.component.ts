import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(public dataservice: DataService) { }

  ngOnInit(): void {
    this.dataservice.openDataBase().then(
      (r) => {

      }
    )
  }

}
