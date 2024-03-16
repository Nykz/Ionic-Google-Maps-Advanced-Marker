import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild, inject } from '@angular/core';

declare var google: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: true,
})
export class MapComponent implements OnInit, OnDestroy {

  @ViewChild('map', {static: true}) mapElementRef!: ElementRef;
  center = { lat: 28.649944693035188, lng: 77.23961776224988 };
  map: any;
  marker: any;
  mapListener: any;
  markerListener: any;
  intersectionObserver: any;
  private renderer = inject(Renderer2);

  constructor() { }

  ngOnInit() {}

  ngAfterViewInit() {
    this.loadMap();

    this.intersectionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('drop');
          this.intersectionObserver.unobserve(entry.target);
        }
      }
    });
  }

  async loadMap() {
    const { Map } = await google.maps.importLibrary("maps");

    const mapEl = this.mapElementRef.nativeElement;

    const location = new google.maps.LatLng(this.center.lat, this.center.lng);

    this.map = new Map(mapEl, {
      center: location,
      zoom: 14,
      mapId: "4504f8b37365c3d0",
      // scaleControl: false,
      // streetViewControl: false,
      // zoomControl: false,
      // overviewMapControl: false,
      // mapTypeControl: false,
      // fullscreenControl: false,
    });

    this.renderer.addClass(mapEl, 'visible');
    this.addMarker(location);
  }

  async addMarker(location: any) {

    // this.marker = new google.maps.Marker({
    //   position: location,
    //   map: this.map,
    //   draggable: true,
    //   animation: google.maps.Animation.DROP
    // });

    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    // const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

    // const markerPin = new PinElement({
    //   background: "#76ba1b",
    //   scale: 2,
    //   borderColor: "#137333",
    //   glyphColor: "#137333",
    // });

    const markerIcon = document.createElement('img');
    markerIcon.src = 'assets/icons/location-pin.png';
    markerIcon.height = 50;
    markerIcon.width = 50;

    this.marker = new AdvancedMarkerElement({
      map: this.map,
      position: location,
      gmpDraggable: true,
      // content: markerPin.element,
      content: markerIcon,
    });


    const content = this.marker.content;
    content.style.opacity = '0'; 
    content.addEventListener('animationend', (event: any) => { 
      content.classList.remove('drop');
      content.style.opacity = '1';
    });
    this.intersectionObserver.observe(content);

    // // implement styling using setimeout
    // this.marker.content.style.opacity = "0";
    // this.marker.content.classList.add("drop");

    // setTimeout(() => {
    //   this.marker.content.classList.remove("drop");
    //   this.marker.content.style.opacity = "1";
    // }, 2000);


    // listeners
    this.markerListener = this.marker.addListener("dragend", (event: any) => {
    
      // // Remove AdvancedMarkerElement from Map
      // this.marker.map = null;

      console.log(event.latLng.lat());

      // center map to position of dragged
      this.marker.position = event.latLng;
      // this.marker.map = this.map;

      this.map.panTo(event.latLng);
    });
    
    this.mapListener = this.map.addListener("click", (event: any) => {
      // Set AdvancedMarkerView position and add to Map
      console.log(event.latLng.lat());
      this.marker.position = event.latLng;
      // this.marker.map = this.map;
      this.map.panTo(event.latLng);
      // console.log(this.marker.position.lat);
    });

  }

  ngOnDestroy(): void {
    if(this.mapListener) {
      google.maps.event.removeListener(this.mapListener);
      this.mapListener = null;
    }
    if(this.markerListener) {
      this.marker.removeEventListener('dragend', this.markerListener);
      this.markerListener = null;
    }

    console.log('marker listener: ', this.markerListener);
    console.log('map listener: ', this.mapListener);
  }

}
