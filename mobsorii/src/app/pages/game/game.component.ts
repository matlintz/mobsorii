import { Component, OnInit } from '@angular/core';
import 'phaser';
import {main} from '../../scenes/main';
@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  public phaserConfig:Phaser.Types.Core.GameConfig;
  public phaser:Phaser.Game;
  constructor() { }

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
          default: 'arcade',
          arcade: {
            debug: true
          }
        },
        backgroundColor: "#000000",
        scene:[main],
      };
      this.phaser = new Phaser.Game(this.phaserConfig);    
  
    }
}
