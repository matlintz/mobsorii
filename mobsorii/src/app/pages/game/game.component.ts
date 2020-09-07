import { Component, OnInit } from '@angular/core';
import 'phaser';
import { main } from '../../scenes/main';
import { DataService } from '../../services/data.service'
import { iOpenOverlay, iCargo, iSystemMember } from 'src/app/interfaces';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  public phaserConfig: Phaser.Types.Core.GameConfig;
  public phaser: Phaser.Game;
  public overlayOpen: iOpenOverlay = { open: false, show: '' };
  public asteroidOreLoad: iCargo = {};
  
  constructor(public data: DataService) {
    this.data.overlayOpen.subscribe(
      (d) => {
        this.overlayOpen = d;
       
        if (d.system && d.system.type === 'asteroid'){
          this.asteroidOreLoad = this.data.asteroidOreLevel(d.system.class);
          
        }
      });
  }

  warp() {
    let r = this.phaser.scene.getScene('main');
    r['warp']().then(
      () => {
        this.data.overlayOpen.next({ open: false, show: '' });
      }
    )

  }

  mine(asteroid:iSystemMember) {
    console.log(asteroid);
    console.log('mine!');
    
    this.data.miningInProcess.next({mining:true,asteroid:asteroid});
  }

  closeOverlay() {
    this.data.overlayOpen.next({ open: false, show: '' });
  }

  jumpHome() {
    let r = this.phaser.scene.getScene('main');
    r['jumpHome']().then(
      () => {
        this.data.overlayOpen.next({ open: false, show: '' });
      }
    )
  }

  refuel() {
    let r = this.phaser.scene.getScene('main')
    r['refuel']().then(
      () => {
        this.data.overlayOpen.next({ open: false, show: '' });
      });
  }

  ngOnInit(): void {
    this.phaserConfig = {
      type: Phaser.AUTO,
      parent: 'game',
      width: window.innerWidth,
      height: window.innerHeight,
      resolution: 1,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      physics: {
        default: 'arcade'
      },
      backgroundColor: "#000000",
      scene: [new main(this.data)],
    };
    this.phaser = new Phaser.Game(this.phaserConfig);
  }

}
