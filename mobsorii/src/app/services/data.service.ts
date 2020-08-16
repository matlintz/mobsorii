import { Injectable } from '@angular/core';
import { iSystem, iSystemMember, iPlayer } from '../interfaces';
@Injectable({
  providedIn: 'root'
})
export class DataService {
  private db: IDBDatabase;
  constructor() {
    console.log('data service constructor')
  }

  getPlayer(): Promise<iPlayer> {
    return new Promise((resolve) => {
      let playerString = localStorage.getItem('player');
      if (playerString && playerString.length > 0)
      {
        resolve(JSON.parse(playerString));
      }else{
        let player:iPlayer = { icoords: { x: 1800, y: 1900 }, coords: { x: 0, y: 0 }, credits: 0, shipnamne: '' };
        this.storePlayer(player).then(
          () => {
            resolve(player);
          });
      }
    });
  }

  storePlayer(player: iPlayer): Promise<boolean> {
    return new Promise((resolve) => {
      let playerString = JSON.stringify(player);
      localStorage.setItem("player", playerString);
      resolve(true);
    })
  }
  deleteDataBase(): Promise<boolean> {
    return new Promise((resolve) => {
      localStorage.removeItem('player');
      
      if (this.db){
        this.db.close();
      }
      let req = window.indexedDB.deleteDatabase("mobsorII");
      req.onsuccess = function() {
        resolve(true);
      }
      req.onerror = function(e) {
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

          self.initializeSystems();
          let t = event.target['transaction'];
          t.oncomplete = function (e) {
            resolve(true);
          }
          
        }
      }
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
            console.group(r.result);
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
      let r = s.add({ x: o.coords.x, y: o.coords.y, type: o.type, name: o.name, class: o.class, icoords: { x: o.icoords.x, y: o.icoords.y }, description: o.description });

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
        let player: iPlayer = { icoords: { x: 1800, y: 1900 }, coords: { x: 0, y: 0 }, credits: 0, shipnamne: '' };
        this.storePlayer(player).then(
          (r) => {
            let sys: iSystem = {
              coords: { x: 0, y: 0 },
              objects: [
                { coords: { x: 0, y: 0 }, type: 'star', name: 'Sol', class: 'm', icoords: { x: 2000, y: 2000 } },
                { coords: { x: 0, y: 0 }, type: 'planet', name: 'Earth', class: 'o', icoords: { x: 1870, y: 2300 } },
                { coords: { x: 0, y: 0 }, type: 'planet', name: 'Mars', class: 'v', icoords: { x: 2300, y: 1120 } },
                { coords: { x: 0, y: 0 }, type: 'asteroid', name: 'Asteroid', class: 'a', icoords: { x: 1871, y: 920 } }
              ]
            }
            sys.objects.forEach((o) => {
              this.insertSystemObject(o).then(
                (r) => {
                 
                }
              );
            }
            );
          });
      });
  }
}
