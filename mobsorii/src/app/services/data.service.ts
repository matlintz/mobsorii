import { Injectable } from '@angular/core';
import { iSystem, iSystemMember, iPlayer, iOpenOverlay, iCargo, iImportSystemMember } from '../interfaces';
import { BehaviorSubject } from 'rxjs';
import { Player } from '../classes/Player';
@Injectable({
  providedIn: 'root'
})
export class DataService {
  private db: IDBDatabase;
  public overlayOpen: BehaviorSubject<iOpenOverlay>;
  public player: Player;
  public miningInProcess: BehaviorSubject<{mining:boolean,asteroid:iSystemMember}>;
  public warpx:number = 0;
  public warpy:number = 0;
  public zoom: BehaviorSubject<number>;
  constructor() {
    this.overlayOpen = new BehaviorSubject({open:false,show:''});
    this.miningInProcess = new BehaviorSubject({mining:false,asteroid:null});
    this.zoom = new BehaviorSubject(1);
    this.player = new Player();
    this.getPlayer().then(
      (p) => {
        this.player.setPlayer(p);
      }
    )
  }

  getPlayer(): Promise<iPlayer> {
    return new Promise((resolve) => {
      console.log('get player');
      let playerString = localStorage.getItem('player');
      if (playerString && playerString.length > 0) {
        resolve(JSON.parse(playerString));
      } else {
        let player: iPlayer = this.newPlayer();
        
        this.storePlayer().then(
          () => {
            resolve(player);
          });
      }
    });
  }

  newPlayer():iPlayer{
    return  { icoords: { x: 1800, y: 1900 }, coords: { x: 0, y: 0 }, credits: 0,ship:{name:'',cargospace:100,cargo:{},  fuelmax:10000,fuel:10000,weapons:[],class:''} };

  }

  storePlayer(): Promise<boolean> {
    return new Promise((resolve) => {
      localStorage.setItem("player", JSON.stringify(this.player));
      resolve(true);
    })
  }

  deleteDataBase(): Promise<boolean> {
    return new Promise((resolve) => {
      localStorage.removeItem('player');

      if (this.db) {
        this.db.close();
      }
      let req = window.indexedDB.deleteDatabase("mobsorII");
      req.onsuccess = function () {
        resolve(true);
      }
      req.onerror = function (e) {
        console.log(e);
      }
    });
  }

  openDataBase(): Promise<boolean> {
    return new Promise((resolve) => {
      let self = this;
      var request = window.indexedDB.open("mobsorII", 1);
      request.onerror = function (event) {

      };
      request.onsuccess = function (event) {
        self.db = event.target['result'];
        resolve(true);

      };
      request.onupgradeneeded = function (event) {
        self.db = event.target['result'];
        if (event.oldVersion === 0) {
          let galaxy = self.db.createObjectStore('systems', { keyPath: 'id', autoIncrement: true });
          galaxy.createIndex('coords', ['x', 'y'], { unique: false });
          galaxy.createIndex('icoords', ['x', 'y'], { unique: false });
          galaxy.createIndex('type', 'type', { unique: false });
          galaxy.createIndex('name', 'name', { unique: false });
          galaxy.createIndex('class', 'class', { unique: false });
          galaxy.createIndex('description', 'description', { unique: false });
          galaxy.createIndex('population','population',{unique:false});
          self.initializeSystems();
          let t = event.target['transaction'];
          t.oncomplete = function (e) {
            resolve(true);
          }

        }
      }
    });
  }

  getAllSystems(): Promise<Array<iSystemMember>> {
    return new Promise((resolve) => {
      let result: Array<iSystemMember> = [];
      this.openDataBase().then(
        () => {
          let t = this.db.transaction('systems', "readonly")
          let o = t.objectStore('systems');
          let r = o.openCursor();
          r.onsuccess = function (event) {
            let cursor = event.target['result'];
            if (cursor) {
              let sys:iSystemMember = cursor.value;
              if (sys.type === 'planet'){
                sys.image = 'assets/p/'+sys.class+'.png';
              }
              if (sys.type === 'asteroid'){
                sys.image = 'assets/asteroid.png';
              }
              if (sys.type === 'star'){
                sys.image = 'assets/s/'+ sys.class + '.png';
              }
              result.push(sys);
              cursor.continue();
            }else{
              resolve(result);
            }
          }
        });
    });
  }

  getSystem(coords: { x: number, y: number }): Promise<iSystem> {
    return new Promise((resolve) => {
      let results: iSystem = { coords: { x: coords.x, y: coords.y }, objects: [] };
      this.openDataBase().then(
        () => {
          let t = this.db.transaction('systems', 'readonly');
          let s = t.objectStore('systems');
          var keyRangeValue = IDBKeyRange.only([coords.x, coords.y]);
          let i = s.index('coords');
          let r = i.getAll(keyRangeValue);
          r.onsuccess = function () {
            r.result.forEach(
              (sys) => {
                results.objects.push(sys);
              });
            resolve(results);
          }
          r.onerror = function (e) {
            console.log(e)
          }
        })
    });
  }

  insertSystemObject(o: iSystemMember): Promise<any> {
    return new Promise((resolve) => {
      let t = this.db.transaction('systems', "readwrite");
      let s = t.objectStore('systems');
      let r = s.add({ x: o.coords.x, y: o.coords.y, type: o.type, name: o.name, class: o.class, icoords: { x: o.icoords.x, y: o.icoords.y }, description: o.description,population:o.population });

      r.onsuccess = function (e) {
        resolve(true);
      }

      r.onerror = function (e) {
        console.log(e);
        resolve(false);
      }
    })
  }

  initializeSystems() {
    this.openDataBase().then(
      () => {
       
        this.storePlayer().then(
          (r) => {
            let importSystems:Array<iImportSystemMember> = this.importSystems();
            importSystems.forEach(s => {
              let g:iSystemMember = {
                type:s.type,
                name:s.name,
                coords: {x:s.x,y:s.y},
                icoords:{x:s.ix,y:s.iy},
                class:s.class,
                description: s.dcr,
                
              }
              if (s.population && s.population>0){
                g.population = s.population;
              }
              this.insertSystemObject(g).then(
                (r) => {

                }
              );
            });
          });
      });
  }

  orePrice(cargo:string){
    switch(cargo.toUpperCase()){
      case 'IRON':
        return 1;
      case 'NICKEL':
        return 2;
      case 'TITANIUM':
        return 5;
      case 'GOLD':
        return 10;
      case 'RARE':
        return 8;
      case 'ALKALINE':
        return 4;

    }

  }

  asteroidOreLevel(asclass:string):iCargo{
    switch(asclass.toUpperCase()){
      case 'A':
        return {Iron:.9,Nickel:.1};
      case 'B':
        return {Iron:.6,Nickel:.4};
      case 'C':
        return {Iron:.3,Nickel:.4,Titanium:.3};
      case 'D':
        return {Nickel:.5,Titanium:.4,Gold:.1};
      case 'E':
        return {Rare:.4,Alkaline:.6};

    }
  }
 
  mine(asteroid:iSystemMember){
    
  }

  importSystems(): Array<iImportSystemMember> {
    return [
      {
        "iy" : 1100,
        "ix" : 1009,
        "dcr" : "Pareuicur Class c Asteroid",
        "name" : "Pareuicur",
        "y" : -86,
        "x" : -38,
        "type" : "asteroid",
        "class" : "c"
      },
      {
        "iy" : 1981,
        "ix" : 1902,
        "dcr" : "Vawayexihoh Class m Star",
        "name" : "Vawayexihoh",
        "y" : -90,
        "x" : -33,
        "type" : "star",
        "class" : "m"
      },
      {
        "iy" : 1232,
        "ix" : 2813,
        "dcr" : "Siyir Class a Asteroid",
        "name" : "Siyir",
        "y" : -87,
        "x" : -31,
        "type" : "asteroid",
        "class" : "a"
      },
      {
        "iy" : 1371,
        "ix" : 1257,
        "dcr" : "Hageeu Class e Asteroid",
        "name" : "Hageeu",
        "y" : 15,
        "x" : -25,
        "type" : "asteroid",
        "class" : "e"
      },
      {
        "iy" : 2284,
        "ix" : 827,
        "dcr" : "Wesilecup Class a Asteroid",
        "name" : "Wesilecup",
        "y" : 21,
        "x" : -16,
        "type" : "asteroid",
        "class" : "a"
      },
      {
        "iy" : 478,
        "ix" : 1394,
        "dcr" : "Labofotasev Class a Asteroid",
        "name" : "Labofotasev",
        "y" : 26,
        "x" : -16,
        "type" : "asteroid",
        "class" : "a"
      },
      {
        "iy" : 2768,
        "ix" : 1543,
        "dcr" : "Iisusuzewuq Class b Asteroid",
        "name" : "Iisusuzewuq",
        "y" : 24,
        "x" : -15,
        "type" : "asteroid",
        "class" : "b"
      },
      {
        "iy" : 2467,
        "ix" : 954,
        "dcr" : "Jajuwehue Class b Asteroid",
        "name" : "Jajuwehue",
        "y" : 26,
        "x" : -15,
        "type" : "asteroid",
        "class" : "b"
      },
      {
        "iy" : 2002,
        "ix" : 1991,
        "dcr" : "Oonaeag Class m Star",
        "name" : "Oonaeag",
        "y" : 21,
        "x" : -14,
        "type" : "star",
        "class" : "m"
      },
      {
        "iy" : 1400,
        "ix" : 1727,
        "owner" : 0,
        "dcr" : "Oufuoecof Class g Planet",
        "class" : "g",
        "name" : "Oufuoecof",
        "y" : 21,
        "x" : -14,
        "type" : "planet"
      },
      {
        "iy" : 2285,
        "ix" : 1975,
        "owner" : 0,
        "dcr" : "Zevedos Class g Planet",
        "class" : "g",
        "name" : "Zevedos",
        "y" : 21,
        "x" : -14,
        "type" : "planet"
      },
      {
        "iy" : 1399,
        "ix" : 2330,
        "owner" : 1,
        "dcr" : "Naris Class m Planet",
        "class" : "m",
        "name" : "Naris",
        "y" : 21,
        "x" : -14,
        "type" : "planet",
        "hp" : 1999731015389
      },
      {
        "iy" : 2545,
        "ix" : 882,
        "owner" : 0,
        "dcr" : "Aojuu Class c Planet",
        "class" : "c",
        "name" : "Aojuu",
        "y" : 21,
        "x" : -14,
        "type" : "planet"
      },
      {
        "iy" : 2444,
        "ix" : 376,
        "dcr" : "Qifuw Class d Asteroid",
        "name" : "Qifuw",
        "y" : 17,
        "x" : -13,
        "type" : "asteroid",
        "class" : "d"
      },
      {
        "iy" : 2590,
        "ix" : 3556,
        "dcr" : "Leeeriy Class c Asteroid",
        "name" : "Leeeriy",
        "y" : 19,
        "x" : -10,
        "type" : "asteroid",
        "class" : "c"
      },
      {
        "iy" : 3672,
        "ix" : 2034,
        "dcr" : "Seyaguy Class b Asteroid",
        "name" : "Seyaguy",
        "y" : 17,
        "x" : -9,
        "type" : "asteroid",
        "class" : "b"
      },
      {
        "iy" : 1960,
        "ix" : 1960,
        "owner" : 2,
        "dcr" : "Mobsor Prime Star",
        "name" : "Mobsor Prime",
        "class" : "g",
        "y" : 0,
        "x" : 0,
        "type" : "star"
      },
      {
        "iy" : 2400,
        "ix" : 1960,
        "owner" : 2,
        "dcr" : "Mobsor - Headquarters for the Republic",
        "population" :20000000000,
        "name" : "Mobsor",
        "class" : "m",
        "y" : 0,
        "x" : 0,
        "type" : "planet"
      },
      {
        "iy" : 3096,
        "ix" : 3020,
        "owner" : 2,
        "dcr" : "Gas giant, collect gasses here",
        "class" : "g",
        "name" : "Taraun",
        "y" : 0,
        "x" : 0,
        "type" : "planet"
      },
      {
        "iy" : 1961,
        "ix" : 1649,
        "owner" : 2,
        "dcr" : "Mobsor Worm Hole Port",
        "name" : "Mobsor Worm Hole",
        "class" : "g",
        "y" : 0,
        "x" : 0,
        "type" : "warp"
      },
      {
        "iy" : 1921,
        "ix" : 1689,
        "owner" : 2,
        "dcr" : "Axor Class A Asteroid",
        "name" : "Axor",
        "class" : "a",
        "y" : 1,
        "x" : 2,
        "type" : "asteroid"
      },
      {
        "iy" : 3053,
        "ix" : 2785,
        "dcr" : "Kuwiw Class b Asteroid",
        "name" : "Kuwiw",
        "y" : -98,
        "x" : 81,
        "type" : "asteroid",
        "class" : "b"
      }
    ]
    
  }
}
