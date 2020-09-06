import { iShip, iCargo, iWeapon, iPlayer, iSystemMember } from '../interfaces';
import { DataService } from '../services/data.service';
export class Player implements iPlayer {
    private dataservice: DataService

    public coords: { x: number, y: number };
    public icoords: { x: number, y: number };
    public credits: number;
    public ship: iShip;
    public cargoUsed: number = 0;
    constructor() {
        
    }

    public setPlayer(player: iPlayer): void {

        this.coords = player.coords;
        this.icoords = player.icoords;
        this.credits = player.credits;
        this.ship = player.ship;
        this.calculatCargoSpace();
    }

    private calculatCargoSpace(): void {
        this.cargoUsed = 0;
        Object.keys(this.ship.cargo).forEach(key =>
            this.cargoUsed += this.ship.cargo[key]
        );
        console.log(this.cargoUsed);
    }

    private roundCargo(): void {
        Object.keys(this.ship.cargo).forEach(key =>{
            this.ship.cargo[key] = Math.round(this.ship.cargo[key]);
        });
    }

    public mine(cargo: iCargo) :Promise<boolean> {
        return new Promise((resolve) => {
            this.calculatCargoSpace();
            while (this.cargoUsed < this.ship.cargospace) {
                Object.keys(cargo).forEach(key => {
                    if (this.ship.cargo[key]){
                        this.ship.cargo[key] += cargo[key];
                    }else{
                        this.ship.cargo[key] = cargo[key];
                    }
                    this.cargoUsed += cargo[key];
                });
            }
            this.roundCargo();
            console.log(this.ship);
            resolve(true);
        });

        
    }
}