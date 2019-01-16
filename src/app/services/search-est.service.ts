import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchEstService {
  userData;
    constructor(){
      this.userData= {};
    }
    setUserData(val: object){
      this.userData= val;
    }
    getUserData(){
      return this.userData;
    }
}
