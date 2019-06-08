
import { Component, NgZone } from '@angular/core';
import { NavController,Platform, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
@Component({
    selector: 'page-reminderList',
  templateUrl: 'reminderList.html',
  
})
export class reminderListpage {
  remindersList: any=[];

  constructor(public navCtrl: NavController,
    public zone: NgZone,
    public platform: Platform,
    public alertCtrl: AlertController,
    public localStorage: Storage,) {
this.getReminders();
  }
  ionViewDidLoad() {
    this.getReminders();
 
  
 }
  doRefresh(refresher) {
  //  console.log('Begin async operation', refresher);
  this.getReminders();
    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.complete();
    }, 2000);
  }
  getReminders(){
    this.localStorage.get('reminders').then((list)=>{
      this.zone.run(() => {
        this.remindersList=list?list:[];
        
      });
   
    })

    }
    removeItem(index){
    
      const confirm = this.alertCtrl.create({
        title: 'Delete ?',
        message: 'Do you want to delete?',
        buttons: [
          {
            text: 'No',
            handler: () => {
              console.log('Disagree clicked');
            }
          },
          {
            text: 'Yes',
            handler: () => {
              this.zone.run(() => {
                this.remindersList.splice(index, 1);
                this.localStorage.set('reminders',this.remindersList);
                
              });
              console.log('Agree clicked');
            }
          }
        ]
      });
      confirm.present();
    }
      
    

}
