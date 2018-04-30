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
                var marker = mapninja.createMarker(
                         point,
                         titleText,
                         val['properties'],
                         'restaurant'
                    )
                mapninja.groupMarker('restaurants',marker);
                var markerInfo = "<div><h3>" + titleText + "</h3>Amenities: " + descriptionText + "</div>"
                marker.addListener('click', function() {
                    // $('#campground_info').html(markerInfo);
                    console.log(markerInfo);
                });
                markers.push(marker);
            });
            mapninja.markers.push({restaurants:markers});
        });
    });

    jQuery('[data-random]').on('click',function(){
        if (this.checked) {
            mapninja.initRandomMarker(200);
        } else {
            mapninja.initRandomMarker(0);
        }
    });
    jQuery('input[name=filter]').change(function(e) {
        mapninja.map_filter(this.id);
        mapninja.filter_markers()
    });
}
google.maps.event.addDomListener(window, 'load', loadMap);