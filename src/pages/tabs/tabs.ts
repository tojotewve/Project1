import { Component } from '@angular/core';

import { AboutPage } from '../about/about';
import { ContactPage } from '../contact/contact';
import { HomePage } from '../home/home';
import { reminderListpage } from '../reminder/reminder';
import { addreminderPage } from "../reminder/addreminder";
@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = reminderListpage;
  tab3Root = addreminderPage;

  constructor() {

  }
}
