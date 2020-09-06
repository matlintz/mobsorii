import 'phaser';
import { DataService } from '../services/data.service';
import { iSystem, iPlayer } from '../interfaces';
import { Player } from '../classes/Player';
export class main extends Phaser.Scene {
    private spaceship: Phaser.Physics.Arcade.Sprite;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private pointer: Phaser.Input.Pointer;
    private touch: Phaser.Input.Pointer;
    private coords: Phaser.GameObjects.Text;
    private com: Phaser.GameObjects.Text;
    private dataservice: DataService
    private system: iSystem;
    private systemMembers: Phaser.GameObjects.Sprite[] = [];

    private isTraveling: boolean = false;
    private finishedLoading: boolean = false;
    private overlayShowing: boolean = false;
    constructor(dataservice: DataService) {
        super({
            key: 'main'
        });

        this.dataservice = dataservice;
        this.dataservice.overlayOpen.subscribe(
            (d) => {
                this.overlayShowing = d.open;
            });
        this.dataservice.miningInProcess.subscribe(
            (m) => {
                if (m.mining) {
                    this.dataservice.player.mine(this.dataservice.asteroidOreLevel(m.asteroid.class)).then(
                        (r) => {
                            this.dataservice.miningInProcess.next({ mining: false, asteroid: null });

                            this.dataservice.overlayOpen.next({ open: false, show: '' });

                        }
                    );
                }
            })
    }

    init(): void {

    }


    preload() {
        this.load.image('ship', 'assets/rship.png');
        this.load.image('background', 'assets/starfield-ns.png');
        this.load.image('starm', 'assets/s/m.png');
        this.load.image('starg', 'assets/s/g.png');
        this.load.image('warpg', 'assets/warp.png');
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
        this.coords = this.add.text(25, 25, '', { fontFamily: 'Arial', fontSize: 28, color: '#00ff00' });
        this.coords.setScrollFactor(0);
        this.com = this.add.text(25, 50, '', { fontFamily: 'Arial', fontSize: 28, color: '#00ff00' });
        this.com.setScrollFactor(0);
        this.loadSystem().then(
            () => {
                let self = this;

                this.spaceship = this.physics.add.sprite(this.dataservice.player.icoords.x, this.dataservice.player.icoords.y, 'ship').setInteractive();
                this.spaceship.on('pointerdown', function () {
                    self.spaceship.setVelocity(0, 0);
                    self.dataservice.overlayOpen.next({ open: true, show: 'ship', system: { type: 'ship', name: self.dataservice.player.ship.name, coords: self.dataservice.player.coords, icoords: self.dataservice.player.icoords, class: '' } });
                });
                this.spaceship.setDepth(1);
                this.spaceship.setScale(.75);
                this.physics.world.enable([this.spaceship]);
                this.spaceship.setDrag(45);//https://photonstorm.github.io/phaser3-docs/Phaser.Physics.Arcade.Components.Drag.html#setDrag

                this.spaceship.setCollideWorldBounds(true);


                this.cameras.main.startFollow(this.spaceship);
                this.finishedLoading = true;
            });
    }

    refuel(): Promise<boolean> {
        return new Promise((resolve) => {
            this.dataservice.player.ship.fuel = this.dataservice.player.ship.fuelmax;
            this.dataservice.storePlayer(this.dataservice.player).then(
                () => {

                    resolve(true);
                });
        });

    }

    jumpHome(): Promise<boolean> {
        return new Promise((resolve) => {
            this.jumpTo(0, 0, 1960, 1960).then(
                () => {
                    resolve(true);
                }
            );
        })
    }

    warp(): Promise<boolean> {
        return new Promise((resolve) => {
            this.jumpTo(this.dataservice.warpx, this.dataservice.warpy, this.dataservice.player.icoords.x, this.dataservice.player.icoords.y).then(
                () => {
                    resolve(true);
                }
            )
        })


    }

    jumpTo(x: number, y: number, ix: number, iy: number): Promise<boolean> {
        return new Promise((resolve) => {
            this.systemMembers.forEach(
                (s) => {
                    s.destroy();
                }
            )
            this.dataservice.player.coords.x = x;
            this.dataservice.player.coords.y = y;
            this.dataservice.player.icoords.x = ix;
            this.dataservice.player.icoords.y = iy;
            
            this.loadSystem().then(
                () => {
                    this.isTraveling = false;
                    this.spaceship.setPosition(this.dataservice.player.icoords.x, this.dataservice.player.icoords.y);
                    resolve(true);
                });
        })

    }
    loadSystem(): Promise<boolean> {
        return new Promise((resolve) => {
            let self = this;
            this.dataservice.getSystem({ x: this.dataservice.player.coords.x, y: this.dataservice.player.coords.y }).then(
                (r) => {

                    this.system = r;
                    if (this.system) {
                        this.system.objects.forEach(
                            (o) => {
                                let systemObject = this.add.sprite(o.icoords.x, o.icoords.y, o.type + o.class).setInteractive();
                                console.log(o);
                                systemObject.on('pointerdown', function () {
                                    let distp: number = Phaser.Math.Distance.BetweenPoints(self.dataservice.player.icoords, systemObject);

                                    if (distp < 150) {
                                        self.dataservice.player.icoords = { x: self.spaceship.x, y: self.spaceship.y };
                                        self.spaceship.setVelocity(0, 0);
                                        self.dataservice.overlayOpen.next({ open: true, show: o.type, system: o });
                                        self.com.setText(o.name);
                                        self.dataservice.player.icoords = { x: self.spaceship.x, y: self.spaceship.y };
                                        self.dataservice.storePlayer(self.dataservice.player).then(
                                            () => {


                                            });
                                    }

                                });
                                this.systemMembers.push(systemObject);
                            });
                        resolve(true);
                    }
                });
        });
    }

    update() {
        if (this.dataservice.player.ship.fuel > 0 && !this.isTraveling && this.finishedLoading && !this.overlayShowing) {
            if (this.pointer.isDown || this.touch.isDown || this.cursors.up.isDown) {
                this.dataservice.player.ship.fuel -= 1;
            }
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
            this.dataservice.player.icoords = { x: this.spaceship.x, y: this.spaceship.y }
            this.coords.text = this.dataservice.player.coords.x + ':' + this.dataservice.player.coords.y + ' ' + Math.round(this.dataservice.player.icoords.x) + ' ' + Math.round(this.dataservice.player.icoords.y) + ' Fuel: ' + this.dataservice.player.ship.fuel;

            if (this.spaceship.x > 3900 || this.spaceship.x < 100 || this.spaceship.y > 3900 || this.spaceship.y < 100) {
                this.isTraveling = true;
                this.travelTo();
            }
        }
    }

    travelTo() {

        let direction: { x: number, y: number } = { x: 0, y: 0 };
        let newiCoords: { x: number, y: number } = this.dataservice.player.icoords;
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
        this.dataservice.player.coords.x += direction.x;
        this.dataservice.player.coords.y += direction.y;
        this.dataservice.player.icoords = newiCoords;
        this.dataservice.storePlayer(this.dataservice.player);
        this.loadSystem().then(
            () => {
                this.isTraveling = false;
                this.spaceship.setPosition(this.dataservice.player.icoords.x, this.dataservice.player.icoords.y);
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