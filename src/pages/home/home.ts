import { Component } from '@angular/core';
import { NavController,Platform } from 'ionic-angular';
import {PhoneCallTrap} from 'io.gvox.plugin.phonecalltrap/www/PhoneCallTrap';
//import {cordovacall} from 'cordova-call/www/CordovaCall';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { Page } from 'ionic-angular/umd/navigation/nav-util';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
declare let cordova: any;
declare let window: any;
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  drivemode: any;
  
//rootPage:any=HomePage;
  constructor(public navCtrl: NavController,public Platform:Platform,private tts: TextToSpeech,private sqlite: SQLite) {
   
    
    let onSuccess1=function(result){
     // alert(result)
      console.log("Success:"+result);
    }
  
    let onError1=function(result) {
     // alert('Error')
      console.log("Error:"+result);
    }
    
    this.Platform.ready().then(() => {
      this.getData();
      if(!this.Platform.is('cordova')) {
        return false;
      }
     
   
      // alert();
      // var OneSignalClient = window['plugins'].OneSignal.init()
      // cordova.plugins.CordovaCall.receiveCall('tojo paul');
    try{
      var app = {
        sendSms: function(numb) {
            var number = numb.toString(); /* iOS: ensure number is actually a string */
            var message ='I am driving, I will call you later';
            console.log("number=" + number + ", message= " + message);
    
            //CONFIGURATION
            var options = {
                replaceLineBreaks: false, // true to replace \n by a new line, false by default
                android: {
                   // intent: 'INTENT'  // send SMS with the native android SMS messaging
                    //intent: '' // send SMS without open any other app
                }
            };
    
            var success = function () { alert('Message sent successfully'); };
            var error = function (e) { alert('Message Failed:' + e); };
            window.sms.send(number, message, options, success, error);
        }
    };
     // window.cordova.plugins.CordovaCall.receiveCall(onSuccess1,onError1);
      window.PhoneCallTrap.onCall(function(state) {
        console.log("CHANGE STATE: " + state);
        state=JSON.parse(state);
        switch (state.msg) {
            case "RINGING":
           console.log('You have a Call from '+state.incomingNumber);
            app.sendSms(state.incomingNumber);
                console.log("Phone is ringing");
                break;
            case "OFFHOOK":
            //alert("off-hook");
                console.log("Phone is off-hook");
                break;
            case "IDLE":
           // alert("IDLE");
                console.log("Phone is idle");
                break;
        }
    });
  }catch(e){
    console.log(e);
  }
        console.log("PLATFORM READY IN PROVIDER")
    })
  let msg="Hello world";
 
console.log(msg);

  }
  getData() {
   console.log('going to DB')
    this.sqlite.create({
      name: 'ionDB.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
     
      db.executeSql('CREATE TABLE IF NOT EXISTS switchval(rowid INTEGER PRIMARY KEY, mode TEXT)',[])
      .then(re => console.log(re))
      .catch(e => console.log(e));
      db.executeSql('SELECT * FROM switchval',[])
      .then(res => {
        //alert(res.rows.length);
        if(res.rows.length==0){
           db.executeSql('INSERT INTO switchval VALUES(NULL,?)',['false'])
          .then(resval => {console.log('Executed SQL');this.drivemode ='false';})
           .catch(e => console.log(e));
        }else{
       // alert(res.rows.length);
        console.log(res.rows);
        for(var i=0; i<res.rows.length; i++) {
          this.drivemode = res.rows.item(i).mode; 
        }
      }
      }).catch(e => console.log(e));
  }).catch(e => console.log(e));
}
updatevalue(drivemode){
  this.sqlite.create({
    name: 'ionDB.db',
    location: 'default'
  }).then((db: SQLiteObject) => {  
    db.executeSql('UPDATE switchval SET mode=? WHERE rowid=1',[drivemode])
          .then(resval => {console.log('updated SQL');})
           .catch(e => console.log(e));
  }).catch(e => console.log(e));
}  
}
