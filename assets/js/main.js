var mapninja;

function loadMap() {
    mapninja = new MapNinja('map-canvas');
    mapninja.init();
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
                marker.setVisible(false);
                jQuery(marker.MarkerLabel.div).hide();
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
                });
                markers.push(marker);
            });
            mapninja.markers.restaurants = markers;
        });
    });
    jQuery('[data-random]').on('click', function() {
        if (this.checked) {
            mapninja.initRandomMarker(100);
        } else {
            mapninja.initRandomMarker(0);
        }
    });
    jQuery('[name="restaurants"]').on('click change', function() {
        toggleFilter();
        keep = (this.checked) ? true : false;
        jQuery.each(mapninja.markers.restaurants, function(i, n) {
            n.setVisible(keep);
            n.infowindow.close();
            if (keep) {
                jQuery(n.MarkerLabel.div).show();
            } else {
                jQuery(n.MarkerLabel.div).hide();
            }
        });
    });
    jQuery('input[name=filter]').change(function(e) {
        mapninja.map_filter(this.id);
        mapninja.filter_markers(mapninja.markers.restaurants)
    });
}

function toggleFilter() {
    if (jQuery('[name="restaurants"]').prop('checked')) {
        jQuery('[name="filter"]').removeAttr('disabled');
    } else {
        jQuery('[name="filter"]').attr('disabled', 'disabled');
    }
}
google.maps.event.addDomListener(window, 'load', loadMap);
jQuery(document).ready(function() {
    toggleFilter();
});