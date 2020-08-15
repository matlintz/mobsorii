import { Component, OnInit } from '@angular/core';
import 'phaser';
import {main} from '../../scenes/main';
import { DataService } from '../../services/data.service'
@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  public phaserConfig:Phaser.Types.Core.GameConfig;
  public phaser:Phaser.Game;
  constructor(public data:DataService) { }

  ngOnInit(): void {
      this.phaserConfig = {
        type: Phaser.AUTO,
        parent: 'content',
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
        scene:[new main(this.data)],
      };
      this.phaser = new Phaser.Game(this.phaserConfig);    
  
    }
}
