
import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Platform } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';

import { FormBuilder,Validators, ValidatorFn, AbstractControl} from '@angular/forms';

//import { Observable } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { SpinnerProvider } from '../../provider/spinner';
import { MapProvider } from '../../provider/map';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  ILatLng,
  Marker,
  StreetViewPanorama,
  StreetViewCameraPosition,
  StreetViewLocation
} from '@ionic-native/google-maps';
declare let google: any;
//@IonicPage()
@Component({
    selector: 'page-addreminder',
  templateUrl: 'addreminder.html',
  
})
export class addreminderPage {
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('searchbar', { read: ElementRef }) searchbar: ElementRef;
  addressElement: HTMLInputElement = null;
  // maps: GoogleMap;
  panorama: StreetViewPanorama;
  //map: GoogleMap;
  marker: Marker;
  map: any;
  address = '';
  reminderform: any=[];
  latLngObjs: any;
  remindersList: any=[];

  constructor(public navCtrl: NavController,
    public geolocation: Geolocation,
    public zone: NgZone,
    public platform: Platform,
    public localStorage: Storage,
    public mapService: MapProvider,
    public spinner: SpinnerProvider,
    public viewCtrl: ViewController,
    public fb: FormBuilder,
    public navParams: NavParams) {
      this.initform();
      this.getReminders();
      this.platform.ready().then(() => this.loadMaps());

  }
  ionViewDidLoad() {
    //  this.loadMaps()
  
    console.log('ionViewDidLoad MapPage');
  }
  initform(){
    this.reminderform = this.fb.group({
      Address: ['', Validators.compose([Validators.required])],
      ReminderNote: ['', Validators.compose([Validators.required])]

    });
  }
  loadMaps() {
    if (!!google) {
     // alert();
      this.initializeMap();
      this.initAutocomplete();
    } else {
      this.errorAlert('Error', 'Something went wrong with the Internet Connection. Please check your Internet.')
    }
  }  
   
  
   
  initializeMap() {
    let that = this;
  
    this.zone.run(() => {
     alert('run');
      var mapEle = this.mapElement.nativeElement;
      this.map = new google.maps.Map(mapEle, {
        zoom: 16,
        center: { lat: 12.971599, lng: 77.594563 },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [{ "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#e9e9e9" }, { "lightness": 17 }] }, { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }, { "lightness": 20 }] }, { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }, { "lightness": 17 }] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#ffffff" }, { "lightness": 29 }, { "weight": 0.2 }] }, { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }, { "lightness": 18 }] }, { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }, { "lightness": 16 }] }, { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }, { "lightness": 21 }] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#dedede" }, { "lightness": 21 }] }, { "elementType": "labels.text.stroke", "stylers": [{ "visibility": "on" }, { "color": "#ffffff" }, { "lightness": 16 }] }, { "elementType": "labels.text.fill", "stylers": [{ "saturation": 36 }, { "color": "#333333" }, { "lightness": 40 }] }, { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#f2f2f2" }, { "lightness": 19 }] }, { "featureType": "administrative", "elementType": "geometry.fill", "stylers": [{ "color": "#fefefe" }, { "lightness": 20 }] }, { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#fefefe" }, { "lightness": 17 }, { "weight": 1.2 }] }],
        disableDoubleClickZoom: false,
        disableDefaultUI: true,
        zoomControl: false,
        scaleControl: true,
      });

      console.log(this.map);
     // alert();

      this.currentLocation(this.map);
          // Map drag started
          this.map.addListener('dragstart', function() {
            console.log('Drag start');
          });
          // Map dragging
          this.map.addListener('drag', function() {
            that.address = 'Searching...';
          });
          //Reload markers every time the map moves
          this.map.addListener('dragend', function() {
            let map_center = that.getMapCenter();
            let latLngObj = {'lat': map_center.lat(), 'long': map_center.lng() };
            console.log(latLngObj);
            that.getAddress(latLngObj);
          });

     google.maps.event.addListenerOnce(this.map, 'idle', () => {
        google.maps.event.trigger(this.map, 'resize');
        mapEle.classList.add('show-map');
      });

      google.maps.event.addListener(this.map, 'bounds_changed', () => {
        this.zone.run(() => {
          this.resizeMap();
        });
      });


    });
  }

  initAutocomplete(): void {
    this.addressElement = this.searchbar.nativeElement.querySelector('.searchbar-input');
    this.createAutocomplete(this.addressElement).subscribe((location) => {
      console.log('Searchdata', location);

      let latLngObj = {'lat': location.lat(), 'long': location.lng()};
      console.log(latLngObj);
     // debugger;
      this.getAddress(latLngObj);
      let options = {
        center: location,
        zoom: 16
      };
      this.map.setOptions(options);
    });
  }
  getAddress(latLngObj) {
    let self=this;
    this.latLngObjs=latLngObj;
    // Get the address object based on latLngObj
    console.log(latLngObj);
    self.mapService.getStreetAddress(latLngObj).subscribe(
      s_address => {
        if (s_address.status == "ZERO_RESULTS"||s_address.status=="OVER_QUERY_LIMIT") {
         // alert('ZERO_RESULTS');
          self.mapService.getAddress(latLngObj).subscribe(
            address => {
              //alert('rr');
              console.log(s_address);
              this.zone.run(() => {
                this.address = address.results[0].formatted_address;
              //alert();
              this.reminderform.controls['Address'].setValue( s_address.results[0].formatted_address);

              });
          
              this.getAddressComponentByPlace(address.results[0], latLngObj);
            },
            err => console.log("Error in getting the street address " + err)
          )
        } else {
          this.zone.run(() => {
          this.address = s_address.results[0].formatted_address;
          this.reminderform.controls['Address'].setValue( s_address.results[0].formatted_address);
        //  alert('ss');
        });
          self.getAddressComponentByPlace(s_address.results[0], latLngObj);
          console.log(this.address);
        }
      },
      err => {
        console.log('No Address found ' + err);
      }
    );
  }
  currentLocation(maps) {
    let self=this;
   // self.spinner.load();
    //console.log(this.geolocation)
    var options = {timeout: 10000, enableHighAccuracy: true};
        navigator.geolocation.getCurrentPosition(function (position) {
          console.log(position);
            let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      console.log(latLng)
      let latLngObj = {'lat': position.coords.latitude, 'long': position.coords.longitude};
      // Display  Marker
      console.log(maps);
    //  alert(position.coords.latitude);
      maps.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
      self.getAddress(latLngObj);
      self.spinner.dismiss();
      localStorage.setItem('current_latlong', JSON.stringify(latLngObj));
      return latLngObj;
        }, function (err) {
          console.log(err);
        }, options);
    // this.geolocation.getCurrentPosition(options).then((position) => {
    //   console.log(position);
    //   let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    //   console.log(latLng)
    //   let latLngObj = {'lat': position.coords.latitude, 'long': position.coords.longitude};
    //   // Display  Marker
    //   console.log(latLngObj);
    //   this.maps.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
    //   this.getAddress(latLngObj);
    //   this.spinner.dismiss();
    //   localStorage.setItem('current_latlong', JSON.stringify(latLngObj));
    //   return latLngObj;

    // }, (err) => {
    //   console.log(err);
    // });
  }

  

  getMapCenter(){
    return this.map.getCenter()
  }

  createAutocomplete(addressEl: HTMLInputElement): Observable<any> {
    const autocomplete = new google.maps.places.Autocomplete(addressEl);
    autocomplete.bindTo('bounds', this.map);
    return new Observable((sub: any) => {
      google.maps.event.addListener(autocomplete, 'place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          sub.error({
            message: 'Autocomplete returned place with no geometry'
          });
        } else {
          let latLngObj = {'lat': place.geometry.location.lat(), 'long': place.geometry.location.lng()}
          this.getAddress(latLngObj);
          sub.next(place.geometry.location);
        }
      });
    });
  }

  getAddressComponentByPlace(place, latLngObj) {
    var components;

    components = {};

    for(var i = 0; i < place.address_components.length; i++){
      let ac = place.address_components[i];
      components[ac.types[0]] = ac.long_name;
    }

    let addressObj = {
      street: (components.street_number) ? components.street_number : 'not found',
      area: components.route,
      city: (components.sublocality_level_1) ? components.sublocality_level_1 : components.locality,
      country: (components.administrative_area_level_1) ? components.administrative_area_level_1 : components.political,
      postCode: components.postal_code,
      loc: [latLngObj.long, latLngObj.lat],
      address: this.address
    }
    localStorage.clear();
    localStorage.setItem('carryr_customer', JSON.stringify(addressObj));
    return components;
  }

  resizeMap() {
    setTimeout(() => {
      google.maps.event.trigger(this.map, 'resize');
    }, 200);
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }

  errorAlert(title, message) {
    alert('Error in Alert');
  }
  getReminders(){
    this.localStorage.get('reminders').then((list)=>{
      this.remindersList=list?list:[];
    })

    }
  addReminderSubmit(){
   let DTO={};
   DTO['lat']=this.latLngObjs.lat;
   DTO['lng']=this.latLngObjs.long;
   DTO['Place']=this.reminderform.value.Address;
   DTO['Reminder']=this.reminderform.value.ReminderNote;
   DTO['status']='Created';
   this.remindersList.push(DTO);
    this.localStorage.set('reminders',this.remindersList);
    console.log(this.reminderform.value);
    console.log(this.latLngObjs);
    this.zone.run(() => {
      this.initform()
    });

  }
 
  
 

}
