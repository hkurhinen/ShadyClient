var $ = window.$;
var L = window.L;
var map = null;
var player = null;
var LOCATION_OPTIONS = {
  maximumAge: 3000,
  timeout: 5000,
  enableHighAccuracy: true 
};

var app = {
  initialize: function() {
      this.bindEvents();
  },
  bindEvents: function() {
      document.addEventListener('deviceready', this.onDeviceReady, false);
  },
  onLocationUpdated: function(pos) {
    if (!player) {
      map.setView(new L.LatLng(pos.coords.latitude, pos.coords.longitude), 18);
      player = L.marker([pos.coords.latitude, pos.coords.longitude]).addTo(map);
    } else {
      player.setLatLng([pos.coords.latitude, pos.coords.longitude]);
    }
  },
  onLocationError: function(err) {
    alert(JSON.stringify(err));
  },
  onDeviceReady: function() {
    map = new L.Map('map');
  	var tiles = new L.TileLayer('http://tile.stamen.com/toner/{z}/{x}/{y}.png', {
      minZoom: 16,
      maxZoom: 18,
      attribution: 'Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under ODbL.'
    });
  	map.addLayer(tiles);
    navigator.geolocation.watchPosition(
      app.onLocationUpdated,
      app.onLocationError,
      LOCATION_OPTIONS);
  }
};

app.initialize();