import { Injectable } from '@angular/core';
import { iSystem,iSystemMember } from '../interfaces';
@Injectable({
  providedIn: 'root'
})
export class DataService {
  private db: IDBDatabase;
  constructor() {
    console.log('data service constructor')
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
          let galaxy = self.db.createObjectStore('system', { keyPath: 'id', autoIncrement: true });
          galaxy.createIndex('coords', ['x','y'], { unique: true });
          galaxy.createIndex('description', 'description', { unique: false });
          galaxy.createIndex('contents', 'contents', { unique: false });

        }

      }
    });
  }

  testSystem():Promise<iSystem> {
    return new Promise((resolve) => {
      let sys:iSystem = {
        coords:{x:0,y:0},
        objects:[
          {type:'star', name:'Sol',class:'m',coords:{x:2000,y:2000}},
          {type:'planet', name:'Earth',class:'o',coords:{x:1870,y:2300}},
          {type:'planet', name:'Mars',class:'v',coords:{x:2300,y:1120}},
          {type:'asteroid',name:'Asteroid',class:'a',coords:{x:1871,y:920}}
        ]
      }
      resolve(sys);
    });
   
  }
  initializeSystems() {
  }
}
