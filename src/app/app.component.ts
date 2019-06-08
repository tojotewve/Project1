import { Component ,Injectable} from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TabsPage } from '../pages/tabs/tabs';
import { Storage } from '@ionic/storage';
import { TextToSpeech } from '@ionic-native/text-to-speech';
declare let BackgroundGeolocation: any;
declare let cordova: any;
declare let window: any;
@Component({
  templateUrl: 'app.html'
})
@Injectable()
export class MyApp {
  rootPage:any = TabsPage;
remindersList:any=[];
  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,public localStorage: Storage,public tts: TextToSpeech) {
   
    platform.ready().then(() => {
      
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      console.log('startme')
     // alert();
    
     this.backgroundrun(localStorage);
    });

  }
  
  backgroundrun(localStorage){
    function distance(lat1, lon1, lat2, lon2, unit) {
      var radlat1 = Math.PI * lat1/180
      var radlat2 = Math.PI * lat2/180
      var radlon1 = Math.PI * lon1/180
      var radlon2 = Math.PI * lon2/180
      var theta = lon1-lon2
      var radtheta = Math.PI * theta/180
      var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      dist = Math.acos(dist)
      dist = dist * 180/Math.PI
      dist = dist * 60 * 1.1515
      //'K' is kilometers (default)
      //'N' is nautical miles
      if (unit=="K") { dist = dist * 1.609344 }
      if (unit=="N") { dist = dist * 0.8684 }
      return Math.round(dist);
    }
    try{
    BackgroundGeolocation.configure({
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 20,
      distanceFilter: 20,
      startOnBoot:true,
      notificationTitle: ' Location Tracking',
      notificationText: 'enabled',
      debug: false,
      interval: 1000,
      fastestInterval: 1000,
      activitiesInterval: 1000,
      httpHeaders: {
        'X-FOO': 'bar'
      },
    });
    console.log(BackgroundGeolocation);
    BackgroundGeolocation.on('start', function() {
      console.log('[INFO] BackgroundGeolocation service has been started');
    });
    BackgroundGeolocation.on('background', function() {
      console.log('[INFO] App is in background');
      // you can also reconfigure service (changes will be applied immediately)
      BackgroundGeolocation.configure({ debug: false });
    });
    BackgroundGeolocation.on('foreground', function() {
      console.log('[INFO] App is in foreground');
      BackgroundGeolocation.configure({ debug: false });
    });

    let self=this;
    BackgroundGeolocation.on('location', function(location) {
      //alert(JSON.stringify(location));
      //alert(location.latitude);
      localStorage.get('reminders').then((list)=>{
        console.log(list);
        try{
        self.remindersList=list;
        self.remindersList.forEach(function (obj, i, object) {
        // for(let obj of this.remindersList) {
         // alert(obj.lng);
          console.log(obj.lat, obj.lng, location.latitude, location.longitude)
        let dis=distance(obj.lat, obj.lng, location.latitude, location.longitude, "K");
        console.log(dis);
        if(obj.status!=='Done'){
        if(dis<=2){
          self.tts.speak('You Have a New Reminder.   '+obj.Reminder)
          .then(() => console.log('Success'))
          .catch((reason: any) => console.log(reason));
          cordova.plugins.notification.local.schedule({
            id:Math.floor((Math.random() * 100) + 1),
            title: 'You Have a Reminder',
            text: obj.Reminder,
            foreground: true
        });
        obj.status='Done';
        // object.splice(i, 1);
        localStorage.set('reminders',object);
        }else if(dis<=3){
          obj.status='pending';
          cordova.plugins.notification.local.schedule({
            id:Math.floor((Math.random() * 100) + 1),
            title: 'Reminder location will reach after 3km',
            text: obj.Reminder,
            foreground: true
        });
        localStorage.set('reminders',object); 
        }
      }else{
        cordova.plugins.notification.local.schedule({
          id:Math.floor((Math.random() * 100) + 1),
          title: 'Have you done with the reminder?',
          text: obj.Reminder,
          foreground: true
      });
        object.splice(i, 1);
        localStorage.set('reminders',object); 
      }
      });
    }catch(e){

    }
       // } 
          });
       
      
  
      // handle your locations here
      // to perform long running operation on iOS
      // you need to create background task
      BackgroundGeolocation.startTask(function(taskKey) {
        // execute long running task
        // eg. ajax post location
        // IMPORTANT: task has to be ended by endTask
        BackgroundGeolocation.endTask(taskKey);
      });
     
    });
    BackgroundGeolocation.checkStatus(function(status) {
      console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
      console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
      console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);
  
      // you don't need to check status before start (this is just the example)
      if (!status.isRunning) {
        BackgroundGeolocation.start(); //triggers start on start event
      }
    });
  }catch(e){

  }
  }
  
}
