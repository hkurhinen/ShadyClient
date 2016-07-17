var $ = window.$;
var L = window.L;
var noty = window.noty;
var geolib = window.geolib;
var map = null;
var player = null;
var playerCircle = null;
var MAX_RADIUS = 35;
var SCAN_SPEED = 0.5;
var prevTime = 0;
var prevLocation = {};
var dragging = false;
var LOCATION_OPTIONS = {
  maximumAge: 3000,
  timeout: 5000,
  enableHighAccuracy: true 
};
var PlayerIcon = L.Icon.Default.extend({
  options: {
    iconUrl: 'img/gangster.svg',
    iconSize: [54, 57],
    shadowSize: [0, 0],
    iconAnchor: [27, 28]
  }
});
var playerIcon = new PlayerIcon();
var CarIcon = L.Icon.Default.extend({
  options: {
    iconUrl: 'img/car.svg',
    iconSize: [106, 50],
    shadowSize: [0, 0],
    iconAnchor: [53, 25]
  }
});
var carIcon = new CarIcon();

var app = {
  initialize: function() {
      this.bindEvents();
  },
  bindEvents: function() {
      document.addEventListener('deviceready', this.onDeviceReady, false);
  },
  animateCircle: function() {
    var currentRadius = playerCircle.getRadius();
    if (currentRadius >= MAX_RADIUS) {
      currentRadius = 0;
    } else {
      currentRadius += SCAN_SPEED;
    }
    playerCircle.setRadius(currentRadius);
    playerCircle.setLatLng(player.getLatLng());
    window.requestAnimationFrame(app.animateCircle);
  },
  onLocationUpdated: function(pos) {
    if (!player) {
      map.setView(new L.LatLng(pos.coords.latitude, pos.coords.longitude), 18);
      prevTime = Date.now();
      prevLocation.lat = pos.coords.latitude;
      prevLocation.lng = pos.coords.longitude;
      
      player = L.Marker.movingMarker(
        [[pos.coords.latitude, pos.coords.longitude], [pos.coords.latitude, pos.coords.longitude]],
        [0],
        { icon: playerIcon, autostart: true}).addTo(map);
      
      playerCircle = L.circle([pos.coords.latitude, pos.coords.longitude], 500, {
          color: 'red',
          fillOpacity: 0
      }).addTo(map);
      
      window.requestAnimationFrame(app.animateCircle);
      
      map.on('dragstart', function(){
        dragging = true;
      });
      
      map.on('dragend', function(){
        dragging = false;
        map.panTo(player.getLatLng());
      });
   
    } else {
      var newTime = Date.now();
      var duration = newTime - prevTime;
      var newLocation = {};
      newLocation.lat = pos.coords.latitude;
      newLocation.lng = pos.coords.longitude;
      var speed = geolib.getSpeed(
        {lat: prevLocation.lat, lng: prevLocation.lng, time: prevTime},
        {lat: newLocation.lat, lng: newLocation.lng, time: newTime}
      );
      if (speed > 30) {
        player.setIcon(carIcon);
      } else {
        player.setIcon(playerIcon);
      }
      prevLocation = newLocation;
      prevTime = newTime;
      player.moveTo([pos.coords.latitude, pos.coords.longitude], duration);
      if (!dragging){
        map.panTo([pos.coords.latitude, pos.coords.longitude]);
      }
    }
  },
  onLocationError: function(err) {
    noty({
      text: 'Error getting location.',
      layout: 'top',
      type: 'error',
      timeout: 3000,
      animation: {
        open: 'animated pulse',
        close: 'animated fadeOut',
      }
    });
  },
  onDeviceReady: function() {
    map = new L.Map('map', { zoomControl:false });
  	var tiles = new L.TileLayer('http://tile.stamen.com/toner/{z}/{x}/{y}.png', {
      minZoom: 16,
      maxZoom: 18,
      attribution: 'Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under ODbL.'
    });
  	map.addLayer(tiles);
    
    L.control.sidebar('sidebar').addTo(map);
    navigator.geolocation.watchPosition(
      app.onLocationUpdated,
      app.onLocationError,
      LOCATION_OPTIONS);
  }
};

app.initialize();