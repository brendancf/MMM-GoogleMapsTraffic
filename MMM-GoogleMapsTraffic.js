/* global Module */

/* Magic Mirror
 * Module: MMM-GoogleMapsTraffic
 *
 * By Victor Mora
 * MIT Licensed.
 */

Module.register("MMM-GoogleMapsTraffic", {
        // Module config defaults
        defaults: {
                key: '',
                lat: '',
                lng: '',
                height: '300px',
                width: '300px',
                zoom: 10,
                mapTypeId: 'roadmap',
                styledMapType: 'standard',
                disableDefaultUI: true,
                updateInterval: 900000,
                backgroundColor: 'rgba(0, 0, 0, 0)'
        },

        start: function () {
                var self = this;
                Log.info("Starting module: " + this.name);

                if (this.config.key === "") {
                        Log.error("MMM-GoogleMapsTraffic: key not set!");
                        return;
                }

                this.sendSocketNotification("MMM-GOOGLE_MAPS_TRAFFIC-GET", { style: this.config.styledMapType });

                setInterval(function () {
                        self.updateDom();
                }, this.config.updateInterval);
        },

        getScripts: function() {
                return [
                        "https://maps.googleapis.com/maps/api/js?key=" + this.config.key
                ]
        },

        getDom: function () {

                var wrapper = document.createElement("div");
                wrapper.setAttribute("id", "map");

                wrapper.style.height = this.config.height;
                wrapper.style.width = this.config.width;

                setTimeout(this.loadMap.bind(this), 10)

                return wrapper;
        },

        loadMap: function() {

                if (typeof(google) === "undefined") {
                        setTimeout(this.loadMap.bind(this), 10)
                        return
                }

                var map = new google.maps.Map(document.getElementById("map"), {
                        zoom: this.config.zoom,
                        mapTypeId: this.config.mapTypeId,
                        center: {
                                lat: this.config.lat,
                                lng: this.config.lng
                        },
                        styles: self.styledMapType,
                        disableDefaultUI: this.config.disableDefaultUI,
                        backgroundColor: this.config.backgroundColor
                });

                var trafficLayer = new google.maps.TrafficLayer();
                trafficLayer.setMap(map);

                for (var i = 0; i < this.config.markers.length; i++) {
                        var marker = this.config.markers[i];
                        var markerOptions = {
                                map: map,
                                position: {
                                        lat: marker.lat,
                                        lng: marker.lng,
                                }
                        };
                        markerOptions.icon = {
                                path: 'M11 2c-3.9 0-7 3.1-7 7 0 5.3 7 13 7 13 0 0 7-7.7 7-13 0-3.9-3.1-7-7-7Zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5 0-1.4 1.1-2.5 2.5-2.5 1.4 0 2.5 1.1 2.5 2.5 0 1.4-1.1 2.5-2.5 2.5Z',
                                scale: 1,
                                anchor: new google.maps.Point(11, 22),
                                fillOpacity: 1,
                                fillColor: marker.fillColor,
                                strokeOpacity: 0
                        };
                        var markerLayer = new google.maps.Marker(markerOptions);
                }
        },

        // socketNotificationReceived from helper
        socketNotificationReceived: function (notification, payload) {
                if (notification === "MMM-GOOGLE_MAPS_TRAFFIC-RESPONSE") {
                        this.styledMapType = payload.styledMapType;
                        console.log = this.styledMapType;
                        this.updateDom();
                }
        },
});
