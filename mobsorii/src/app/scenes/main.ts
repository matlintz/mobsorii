import 'phaser';
import {DataService} from '../services/data.service';
import { iSystem } from '../interfaces';
export class main extends  Phaser.Scene {
    private spaceship: Phaser.Physics.Arcade.Sprite;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private pointer: Phaser.Input.Pointer;
    private touch: Phaser.Input.Pointer;
    private coords:Phaser.GameObjects.Text;
    private com:Phaser.GameObjects.Text;
    private systext:Phaser.GameObjects.Text;
    private dataservice:DataService
    private system:iSystem;
    private systemMembers:Phaser.Physics.Arcade.Sprite[];

    constructor(dataservice:DataService) {
        
        super({
            key: 'main'
        });
        this.dataservice = dataservice;
    }
    init(): void {
        console.log('init');
        this.dataservice.testSystem().then(
            (r) => {
                this.system = r;
                console.log(r);
            }
        )
    }

    preload() {
        this.load.image('ship', 'assets/rship.png');
        this.load.image('background', 'assets/starfield-ns.png');
        this.load.image('starm','assets/s/m.png');
        this.load.image('asteroida','assets/asteroid.png');
        this.preloadPlanets();
    }

    preloadPlanets()
    {
       let planets = 'abcdefghijklmnopqrstuvwxyz';
       for (let i = 0; i < planets.length; i++) {

        this.load.image('planet'+ planets[i],'assets/p/'+planets[i]+'.png');
      }
    }

    create(): void {
       
        console.log('main scene create');
        
        this.cameras.main.setBounds(0, 0, 4000, 4000);
        this.physics.world.setBounds(0, 0, 4000, 4000);
        this.add.image(0, 0, 'background').setOrigin(0).setScale(4);
        this.coords = this.add.text(50, 50, '', { fontFamily: 'Arial', fontSize: 64, color: '#00ff00' });
        this.coords.setScrollFactor(0);
        this.com = this.add.text(50,100,'', { fontFamily: 'Arial', fontSize: 32, color: '#00ff00' });
        this.com.setScrollFactor(0);
        if (this.system)
        {
            let self = this;
            this.system.objects.forEach(
                (o) => {
                    console.log(o);
                    if (o.type === 'asteroid'){

                    }else{

                    }
                    let systemObject = this.add.sprite(o.coords.x,o.coords.y,o.type +  o.class).setInteractive();
                    systemObject.on('pointerdown', function () {
                        self.com.setText(o.name);
                    });
                }
            )
        }

        this.spaceship = this.physics.add.sprite(2000, 2000, 'ship');
        this.physics.world.enable([ this.spaceship ]);
        this.spaceship.setDrag(35);//https://photonstorm.github.io/phaser3-docs/Phaser.Physics.Arcade.Components.Drag.html#setDrag
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceship.setCollideWorldBounds(true);
        this.pointer = this.input.activePointer;//https://photonstorm.github.io/phaser3-docs/Phaser.Input.Pointer.html
        this.touch = this.input.pointer1;
        this.cameras.main.startFollow(this.spaceship);
    }
    update() {
        if (this.pointer.isDown) {
            this.SetVelocityAndRotation(this.pointer);
        } else if (this.touch.isDown) {
            this.SetVelocityAndRotation(this.touch);
        }

        if (this.cursors.left.isDown) {
            this.spaceship.angle -= 1;
        }
        if (this.cursors.right.isDown) {
            this.spaceship.angle += 1
            
        }
        if (this.cursors.up.isDown) {
            let velocity: Phaser.Math.Vector2 = new Phaser.Math.Vector2()
            this.physics.velocityFromRotation(this.spaceship.rotation, 150, velocity);
            this.spaceship.setVelocity(velocity.x, velocity.y);
        }
        if (this.cursors.down.isDown) {
            this.spaceship.setVelocity(0);
        }
        this.coords.text = Math.round(this.spaceship.x) + ' ' + Math.round(this.spaceship.y);
    }

    SetVelocityAndRotation(pointer: Phaser.Input.Pointer) {
        let wPointer:Phaser.Types.Math.Vector2Like = {x:pointer.worldX,y:pointer.worldY};
        let velocity: Phaser.Math.Vector2 = new Phaser.Math.Vector2()
        this.spaceship.rotation = Phaser.Math.Angle.BetweenPoints(this.spaceship, wPointer);//https://photonstorm.github.io/phaser3-docs/Phaser.Math.Angle.html#.BetweenPoints__anchor
        this.physics.velocityFromRotation(this.spaceship.rotation, 250, velocity);//https://photonstorm.github.io/phaser3-docs/Phaser.Physics.Arcade.ArcadePhysics.html#velocityFromRotation__anchor
        this.spaceship.setVelocity(velocity.x, velocity.y);//https://photonstorm.github.io/phaser3-docs/Phaser.Physics.Arcade.Components.Velocity.html#setVelocity__anchor
        
    }
}