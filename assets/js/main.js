var mapninja;

function loadMap() {
    mapninja = new MapNinja('map-canvas');
    mapninja.init();
    mapninja.waypoint = new WayPoint(mapninja.map);
    mapninja.drawer = new Drawer(mapninja.map);
    mapninja.loadDrawer().show();
    mapninja.clearDisplay();
    jQuery('[title="Stop drawing"]').trigger('click');
    /**
     * Initial toggle
     */
    toggleRestaurantsFilter();
    toggleDrawerFilter();
    initState();
    // mapninja.createMarkerImage('https://jslmariano.github.io/assets/static_icons/icon-marker-15.jpg');
    jQuery('[data-json]').each(function(i, n) {
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
                    jQuery.each(mapninja.markers.restaurants, function() {
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
                    if (jQuery('.drop_origin').prop('checked')) {
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
        if (jQuery(this).prop('checked')) {
            mapninja.initRandomMarker(100);
        } else {
            mapninja.initRandomMarker(0);
        }
    });
    /**
     * Keep up with the change event listeners
     */
    jQuery('.restaurants').on('toggle.bs.button.data-api', function() {
        togglState(jQuery(this), jQuery(this).hasClass('active'));
    });
    jQuery('.drop_origin').on('toggle.bs.button.data-api', function() {
        togglState(jQuery(this), jQuery(this).hasClass('active'));
    });
    jQuery('.drawers').on('toggle.bs.button.data-api', function() {
        togglState(jQuery(this), jQuery(this).hasClass('active'));
    });
    jQuery('[data-filter]').on('toggle.bs.button.data-api', function() {
        togglState(jQuery(this), jQuery(this).hasClass('active'));
    });
    /**
     * Keeping changed events
     */
    jQuery('.restaurants').on('change', function() {
        toggleRestaurantsFilter();
        keep = (jQuery(this).prop('checked')) ? true : false;
        jQuery.each(mapninja.markers.restaurants, function(i, n) {
            mapninja.displayMarker(n, keep);
        });
        toggleOffDropWaypoint();
        mapninja.clearDisplay();
    });
    jQuery('.drawers').on('change', function() {
        mapninja.resetFilters();
        toggleDrawerFilter();
        if (jQuery(this).prop('checked')) {
            mapninja.drawer.show();
        } else {
            mapninja.drawer.hide();
        }
    });
    jQuery('[data-filter="restaurants"]').change(function(e) {
        mapninja.map_filter(jQuery(this).data('filter-value'));
        mapninja.filter_markers(mapninja.markers.restaurants);
        toggleOffDropWaypoint();
    });
    jQuery('[data-filter="drawer"]').change(function(e) {
        if (!Object.size(mapninja.drawer.circles)) {
            alert("Draw circles first");
            jQuery(this).prop('checked', false);
            return false;
        }
        mapninja.map_filter(jQuery(this).data('filter-value'), !jQuery(this).prop('checked'));
        mapninja.filter_markers(mapninja.markers.restaurants);
    });
    jQuery('.drop_origin').on('change', function() {
        if (active_marker = mapninja.get_active_marker(mapninja.markers.restaurants)) {
            if (jQuery(this).prop('checked')) {
                mapninja.waypoint.setDestination(active_marker);
                mapninja.waypoint.initialize();
            } else {
                mapninja.waypoint.destroy();
            }
        } else {
            alert('Please select a destination marker.');
            togglState(jQuery(this), false, false);
            return false;
        }
    });
    jQuery('.place-search').on('places_changed_complete', function() {
        togglState(jQuery('.show-markers'), true);
        mapninja.toggleClusters();
    });
}

function togglState(el, toggle = true, trigger_callback = true) {
    if (toggle) {
        jQuery(el).addClass('active');
        jQuery(el).attr('checked', true);
        jQuery(el).prop('checked', true);
    } else {
        jQuery(el).removeClass('active');
        jQuery(el).removeAttr('checked');
        jQuery(el).prop('checked', false);
    }
    jQuery(el).attr('aria-pressed', !jQuery(el).hasClass('active'));
    if (trigger_callback) {
        jQuery(el).trigger('change');
    }
}

function toggleRestaurantsFilter() {
    syncFilters();
    if (jQuery('.restaurants').prop('checked')) {
        jQuery('[data-filter="restaurants"]').removeAttr('disabled');
    } else {
        jQuery('[data-filter="restaurants"]').attr('disabled', 'disabled');
    }
}

function toggleDrawerFilter() {
    syncFilters();
    if (jQuery('.drawers').prop('checked')) {
        jQuery('[data-filter="drawer"]').removeAttr('disabled');
    } else {
        jQuery('[data-filter="drawer"]').attr('disabled', 'disabled');
    }
}

function toggleOffDropWaypoint() {
    syncFilters();
    if (jQuery('.drop_origin').prop('checked')) {
        mapninja.waypoint.destroy();
        togglState(jQuery(this), false, false);
    }
}

function syncFilters() {
    jQuery('[data-filter]').each(function() {
        filter_name = jQuery(this).data('filter-value');
        if (mapninja.filters.hasOwnProperty(filter_name)) {
            togglState(jQuery(this), mapninja.filters[filter_name], false, false);
        }
    });
}

function filterMarkerProp(markers, prop) {
    jQuery.each(markers, function(key, value) {
        if (value.properties.hasOwnProperty(prop)) {
            console.log(key, value);
        }
    });
}

function initState() {
    jQuery('.restaurants,.drawers').each(function() {
        togglState(jQuery(this), false, false);
    });
}
google.maps.event.addDomListener(window, 'load', loadMap);
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