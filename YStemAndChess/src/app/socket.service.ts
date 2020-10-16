import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket;
  private chessServerURL = 'https://ystemandchess.com/chessserver';

  constructor() {
  	//this.socket = io.connect(this.chessServerURL, {secure: true});
	console.log("We created a new socket: " + this.socket);
	this.socket = io();
  }

  public emitMessage(eventName: string, message: string) {
    this.socket.emit(eventName, message);
    console.log("Emitting message: " + message + ".\nEvent Name: " + eventName);
  }
  
  // Example Implmentation of function:
  /*
  this.webSocket.listen("example").subscribe((data) => {
    console.log(data);
    // I have recieved the data here and will now do something.
  })
  */
  public listen(eventName: string) {
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data) => {
        subscriber.next(data);
      })
    });
  }
}
