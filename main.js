function MapNinja(map_id) {
    this.map_id = map_id;
}
MapNinja.prototype = {
    constructor: MapNinja,
    map: null,
    markerGroups: null,
    options: {
        zoom: 1,
        center: new google.maps.LatLng(0, 0)
    },
    init: function() {
        this.map = new google.maps.Map(document.getElementById(this.map_id), this.options);
        this.markerGroups = new google.maps.MVCObject();
    },
    randLatLng: function() {
        return new google.maps.LatLng(((Math.random() * 17000 - 8500) / 100), ((Math.random() * 36000 - 18000) / 100));
    },
    createMarker: function(position, title, icon, icon_helper = false) {
    	if (icon_helper) {
    		icon = this.iconHelper(icon);
    	}
        return new google.maps.Marker({
            position: position,
            title: title,
            icon: icon
        });

        return new Marker({
            position: position,
            title: title,
			icon: {
				path: SQUARE,
				fillColor: '#00CCBB',
				fillOpacity: 1,
				strokeColor: '',
				strokeWeight: 0
			},
			map_icon_label: '<span class="map-icon map-icon-'+icon_helper+'"></span>'
		});
    },
    makeLatLng : function(lt, lg){
    	return new google.maps.LatLng(lt, lg);
    },
    iconHelper: function(icon) {
        return 'http://www.google.com/mapfiles/marker' + icon + '.png'
    },
    groupMarker: function(group_name, marker) {
        this.markerGroups.set(group_name, this.map);
        marker.bindTo('map', this.markerGroups, group_name);
    },
}

var mapninja;
function loadMap() {
    mapninja = new MapNinja('map-canvas');
    mapninja.init();
    jQuery(':checkbox').each(function(i, n) {
        for (var i = 0; i < 50; ++i) {
            mapninja.groupMarker(
            	this.value,
            	mapninja.createMarker(
            		mapninja.randLatLng(),
            		this.value,
            		// this.value.substring(0, 1).toUpperCase(),
            		'restaurant',
            		false
        		)
        	);
        }
    }).on('click init', function() {
        mapninja.markerGroups.set(this.value, (this.checked) ? mapninja.map : null)
    }).trigger('init');
}

google.maps.event.addDomListener(window, 'load', loadMap);