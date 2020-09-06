import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { iPlayer, iCargo } from 'src/app/interfaces';
import {DataService} from '../../services/data.service';
@Component({
  selector: 'app-cargo',
  templateUrl: './cargo.component.html',
  styleUrls: ['./cargo.component.scss']
})
export class CargoComponent implements OnChanges {

  @Input() cansell:boolean;
  public playerCargo:iCargo;
  
  constructor(public data:DataService) { }

  ngOnChanges() {
   
    this.playerCargo = JSON.parse(JSON.stringify(this.data.player.ship.cargo));  ;
   
  }

  sell(t:string){
   
    let price:number = this.playerCargo[t] * this.data.orePrice(t);
    
    this.data.player.credits += price;
    this.data.player.cargoUsed -= this.playerCargo[t];
    this.data.player.ship.cargo[t] -= this.playerCargo[t];
    this.playerCargo[t] = this.data.player.ship.cargo[t];
    this.data.storePlayer(this.data.player).then(
      (r) => {
       
      }
    );
  }
}
