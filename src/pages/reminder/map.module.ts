
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { addreminderPage } from './Addreminder';

@NgModule({
  declarations: [
    addreminderPage,
  ],
  imports: [
    IonicPageModule.forChild(addreminderPage),
  ],
})
export class MapPageModule {}