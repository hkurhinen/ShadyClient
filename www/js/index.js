var $ = window.$;
var L = window.L;
var noty = window.noty;
var map = null;
var player = null;
var LOCATION_OPTIONS = {
  maximumAge: 3000,
  timeout: 5000,
  enableHighAccuracy: true 
};
var PlayerIcon = L.Icon.Default.extend({
  options: {
    iconUrl: 'img/gangster.svg',
    iconSize: [54, 57],
    shadowSize: [0, 0]
  }
});

var app = {
  initialize: function() {
      this.bindEvents();
  },
  bindEvents: function() {
      document.addEventListener('deviceready', this.onDeviceReady, false);
  },
  onLocationUpdated: function(pos) {
    if (!player) {
      var playerIcon = new PlayerIcon();
      map.setView(new L.LatLng(pos.coords.latitude, pos.coords.longitude), 18);
      player = L.marker([pos.coords.latitude, pos.coords.longitude], { icon: playerIcon }).addTo(map);
    } else {
      player.setLatLng([pos.coords.latitude, pos.coords.longitude]);
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