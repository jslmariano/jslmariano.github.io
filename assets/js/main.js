var mapninja;

function loadMap() {
    mapninja = new MapNinja('map-canvas');
    mapninja.init();
    mapninja.waypoint = new WayPoint(mapninja.map);
    mapninja.drawer = new Drawer(mapninja.map);
    mapninja.loadDrawer().hide();

    // mapninja.createMarkerImage('https://jslmariano.github.io/assets/static_icons/icon-marker-15.jpg');
    jQuery(':checkbox[data-json]').each(function(i, n) {
        var json_url = jQuery(this).data('json');
        var markers = [];
        jQuery.getJSON(json_url, function(result) {
            // Post select to url.
            data = result['restaurants'];
            jQuery.each(data, function(key, val) {
                var point = mapninja.makeLatLng(parseFloat(val['geometry']['coordinates'][1]), parseFloat(val['geometry']['coordinates'][0]));
                var titleText = val['properties']['title'];
                var descriptionText = val['properties']['description'];
                var marker = mapninja.createMarker(point, titleText, val['properties'], 'restaurant');
                var markerInfo = mapninja.createInfoWindow(titleText, descriptionText);
                marker.infowindow = markerInfo;
                mapninja.displayMarker(marker, false);
                marker.addListener('click', function() {
                    // $('#campground_info').html(markerInfo);

                    //close all infowindow
                    var ako = this;
                    jQuery.each(mapninja.markers.restaurants, function(){
                        if (ako === this) {
                            return;
                        }
                        this.infowindow.close();
                    });

                    if (this.infowindow.getMap()) {
                        this.infowindow.close();
                    } else {
                        this.infowindow.open(mapninja.map, this);
                    }

                    if (jQuery('[name="drop_origin"]').prop('checked')) {
                        mapninja.waypoint.setDestination(this);
                        mapninja.waypoint.calculateAndDisplayRoute();
                    }
                });
                markers.push(marker);
            });
            mapninja.markers.restaurants = markers;
        });
    });
    jQuery('[data-random]').on('change', function() {
        if (this.checked) {
            mapninja.initRandomMarker(100);
        } else {
            mapninja.initRandomMarker(0);
        }
    });
    jQuery('[name="restaurants"]').on('change', function() {
        toggleRestaurantsFilter();
        keep = (this.checked) ? true : false;
        jQuery.each(mapninja.markers.restaurants, function(i, n) {
            mapninja.displayMarker(n, keep);
        });
        toggleOffDropWaypoint();
    });
    jQuery('[name="drawer"]').on('change', function() {
        toggleDrawerFilter();
        if (this.checked) {
            mapninja.drawer.show();
        } else {
            mapninja.drawer.hide();
        }
    });
    jQuery('input[name="filter[restaurants]"]').change(function(e) {
        mapninja.map_filter(this.id);
        mapninja.filter_markers(mapninja.markers.restaurants);
        toggleOffDropWaypoint();
    });
    jQuery('input[name="filter[drawer]"]').change(function(e) {
        if (this.id == "inside") {
            mapninja.displayInboundMarkers(this.checked);
        }
        if (this.id == "outside") {
            mapninja.displayOutboundMarkers(this.checked);
        }
    });
    jQuery('[name="drop_origin"]').on('click', function(){
        if (active_marker = mapninja.get_active_marker(mapninja.markers.restaurants)) {
            if (this.checked) {
                mapninja.waypoint.setDestination(active_marker);
                mapninja.waypoint.initialize();
            } else {
                mapninja.waypoint.destroy();
            }
        } else {
            alert('Please select restaurant marker.');
            return false;
        }
    });
}

function toggleRestaurantsFilter() {
    if (jQuery('[name="restaurants"]').prop('checked')) {
        jQuery('[name="filter[restaurants]"]').removeAttr('disabled');
    } else {
        jQuery('[name="filter[restaurants]"]').attr('disabled', 'disabled');
    }
}

function toggleDrawerFilter() {
    if (jQuery('[name="drawer"]').prop('checked')) {
        jQuery('[name="filter[drawer]"]').removeAttr('disabled');
    } else {
        jQuery('[name="filter[drawer]"]').attr('disabled', 'disabled');
    }
}

function toggleOffDropWaypoint(){
    if (jQuery('[name="drop_origin"]').prop('checked')) {
        mapninja.waypoint.destroy();
        jQuery('[name="drop_origin"]').prop('checked', false);
    }
}

google.maps.event.addDomListener(window, 'load', loadMap);
jQuery(document).ready(function() {
    toggleRestaurantsFilter();
    toggleDrawerFilter();
});


/**
 * TODO:
 * 1. Add inound, outbound data to be a filter.
 * 2. Drawer checboxes has to be checked
 * 3. Try to add clusters and work it with mapicons
 * 4. incase cluster fails with mapicons, use pure google marer.
 * 5. add customer_number properties to marers object.
 * 6. Display customer_number somwhere.
 * 7. Add ading like feature to modify object properties, like customer "+" & "-"
 */
