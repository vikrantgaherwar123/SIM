import { Injectable, Output, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventEmitterService {
  @Output() event: EventEmitter<any> = new EventEmitter();

  constructor() { }

  setClick(bool) {
    this.event.emit(bool);
  }

  getClick() {
    return true;
  }
}
