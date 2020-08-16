import 'phaser';
import { DataService } from '../services/data.service';
import { iSystem, iPlayer } from '../interfaces';
export class main extends Phaser.Scene {
    private spaceship: Phaser.Physics.Arcade.Sprite;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private pointer: Phaser.Input.Pointer;
    private touch: Phaser.Input.Pointer;
    private coords: Phaser.GameObjects.Text;
    private com: Phaser.GameObjects.Text;
    private dataservice: DataService
    private system: iSystem;
    private systemMembers: Phaser.GameObjects.Sprite[];
    private player: iPlayer;
    private isTraveling: boolean = false;
    private finishedLoading: boolean = false;
    constructor(dataservice: DataService) {
        super({
            key: 'main'
        });
        this.dataservice = dataservice;
        this.systemMembers = [];
    }

    init(): void {
        this.dataservice.getPlayer().then(
            (p) => {
                this.player = p;
            });
    }

    preload() {
        this.load.image('ship', 'assets/rship.png');
        this.load.image('background', 'assets/starfield-ns.png');
        this.load.image('starm', 'assets/s/m.png');
        this.load.image('asteroida', 'assets/asteroid.png');
        this.preloadPlanets();
    }

    preloadPlanets() {
        let planets = 'abcdefghijklmnopqrstuvwxyz';
        for (let i = 0; i < planets.length; i++) {
            this.load.image('planet' + planets[i], 'assets/p/' + planets[i] + '.png');
        }
    }

    create(): void {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.pointer = this.input.activePointer;//https://photonstorm.github.io/phaser3-docs/Phaser.Input.Pointer.html
        this.touch = this.input.pointer1;
        this.cameras.main.setBounds(0, 0, 4000, 4000);
        this.physics.world.setBounds(0, 0, 4000, 4000);
        this.add.image(0, 0, 'background').setOrigin(0).setScale(4);
        this.coords = this.add.text(40, 40, '', { fontFamily: 'Arial', fontSize: 32, color: '#00ff00' });
        this.coords.setScrollFactor(0);
        this.com = this.add.text(50, 100, '', { fontFamily: 'Arial', fontSize: 32, color: '#00ff00' });
        this.com.setScrollFactor(0);
        this.loadSystem().then(
            () => {
                let self = this;

                this.spaceship = this.physics.add.sprite(this.player.icoords.x, this.player.icoords.y, 'ship').setInteractive();
                this.spaceship.on('pointerdown', function () {
                    self.spaceship.setVelocity(0, 0);
                });
                this.spaceship.setDepth(1);
                this.physics.world.enable([this.spaceship]);
                this.spaceship.setDrag(45);//https://photonstorm.github.io/phaser3-docs/Phaser.Physics.Arcade.Components.Drag.html#setDrag

                this.spaceship.setCollideWorldBounds(true);


                this.cameras.main.startFollow(this.spaceship);
                this.finishedLoading = true;
            });
    }

    loadSystem(): Promise<boolean> {
        return new Promise((resolve) => {
            let self = this;
            this.dataservice.getSystem({ x: this.player.coords.x, y: this.player.coords.y }).then(
                (r) => {

                    this.system = r;
                    if (this.system) {
                        this.system.objects.forEach(
                            (o) => {
                                let systemObject = this.add.sprite(o.icoords.x, o.icoords.y, o.type + o.class).setInteractive();
                                systemObject.on('pointerdown', function () {
                                    self.com.setText(o.name);
                                });
                                this.systemMembers.push(systemObject);
                            });
                        resolve(true);
                    }
                });
        });
    }

    update() {
        if (!this.isTraveling && this.finishedLoading) {
            if (this.pointer.isDown) {
                this.SetVelocityAndRotation(this.pointer);
            } else if (this.touch.isDown) {
                this.SetVelocityAndRotation(this.touch);
            }

            if (this.cursors.left.isDown) {
                this.spaceship.angle -= 1;
            } else if (this.cursors.right.isDown) {
                this.spaceship.angle += 1

            }
            if (this.cursors.up.isDown) {
                let velocity: Phaser.Math.Vector2 = new Phaser.Math.Vector2()
                this.physics.velocityFromRotation(this.spaceship.rotation, 150, velocity);
                this.spaceship.setVelocity(velocity.x, velocity.y);
            } else if (this.cursors.down.isDown) {
                this.spaceship.setVelocity(0);
            }
            this.player.icoords = { x: this.spaceship.x, y: this.spaceship.y }
            this.coords.text = this.player.coords.x + ':' + this.player.coords.y + ' ' + Math.round(this.player.icoords.x) + ' ' + Math.round(this.player.icoords.y);

            if (this.spaceship.x > 3900 || this.spaceship.x < 100 || this.spaceship.y > 3900 || this.spaceship.y < 100) {
                this.isTraveling = true;
                this.travelTo();
            }
        }
    }

    travelTo() {

        let direction: { x: number, y: number } = { x: 0, y: 0 };
        let newiCoords: { x: number, y: number } = this.player.icoords;
        if (this.spaceship.x > 3900) {
            newiCoords.x = 150;
            direction.x = 1;
        } else if (this.spaceship.x < 100) {
            newiCoords.x = 3850;
            direction.x = -1;
        }

        if (this.spaceship.y > 3900) {
            newiCoords.y = 150;
            direction.y = 1;
        } else if (this.spaceship.y < 100) {
            newiCoords.y = 3850;
            direction.y = -1;
        }
        this.systemMembers.forEach(
            (s) => {
                s.destroy();
            }
        )
        this.player.coords.x += direction.x;
        this.player.coords.y += direction.y;
        this.player.icoords = newiCoords;
        this.dataservice.storePlayer(this.player);
        this.loadSystem().then(
            () => {
                this.isTraveling = false;
                this.spaceship.setPosition(this.player.icoords.x, this.player.icoords.y);
            });
    }

    SetVelocityAndRotation(pointer: Phaser.Input.Pointer) {
        let wPointer: Phaser.Types.Math.Vector2Like = { x: pointer.worldX, y: pointer.worldY };
        let velocity: Phaser.Math.Vector2 = new Phaser.Math.Vector2()
        this.spaceship.rotation = Phaser.Math.Angle.BetweenPoints(this.spaceship, wPointer);//https://photonstorm.github.io/phaser3-docs/Phaser.Math.Angle.html#.BetweenPoints__anchor
        this.physics.velocityFromRotation(this.spaceship.rotation, 250, velocity);//https://photonstorm.github.io/phaser3-docs/Phaser.Physics.Arcade.ArcadePhysics.html#velocityFromRotation__anchor
        this.spaceship.setVelocity(velocity.x, velocity.y);//https://photonstorm.github.io/phaser3-docs/Phaser.Physics.Arcade.Components.Velocity.html#setVelocity__anchor
    }
}