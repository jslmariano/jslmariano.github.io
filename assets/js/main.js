function MapNinja(map_id) {
    this.map_id = map_id;
}
MapNinja.prototype = {
    constructor: MapNinja,
    map: null,
    markerGroups: null,
    randomMarker: new Array(0),
    markers: [],
    filters: {
        bread: false,
        pasta: false,
        meat: false
    },
    options: {
        zoom: 14,
        // 10.3180285,123.8901931,14z
        center: new google.maps.LatLng(10.3180285, 123.8901931)
    },
    init: function() {
        this.map = new google.maps.Map(document.getElementById(this.map_id), this.options);
        this.markerGroups = new google.maps.MVCObject();
    },
    randLatLng: function() {
        return new google.maps.LatLng(((Math.random() * 17000 - 8500) / 100), ((Math.random() * 36000 - 18000) / 100));
    },
    createMarker: function(position, title, properties, group_title) {
         var marker = new mapIcons.Marker({
            map: this.map,
            position: position,
            title: title,
            extra_sauce: group_title,
            icon: {
                path: mapIcons.shapes.MAP_PIN,
                fillColor: '#00CCBB',
                fillOpacity: 1,
                strokeColor: '',
                strokeWeight: 0
            },
            properties,
            map_icon_label: '<span class="map-icon map-icon-' + group_title + '"></span>'
        });
         console.log(marker);
         return marker;
    },
    makeLatLng: function(lt, lg) {
        return new google.maps.LatLng(lt, lg);
    },
    iconHelper: function(icon) {
        return 'https://jslmariano.github.io/assets/static_icons/' + icon;
        return 'http://www.google.com/mapfiles/marker' + icon + '.png';
    },
    groupMarker: function(group_name, marker) {
        this.markerGroups.set(group_name, this.map);
        marker.bindTo('map', this.markerGroups, group_name);
    },
    initRandomMarker: function(num) {
        if (this.randomMarker) {
            for (i in this.randomMarker) {
                this.randomMarker[i].setMap(null)
            }
        }
        this.randomMarker = new Array(0);
        // var num = document.getElementById("nm").value;
        if (num < 1000) {
            this.plotrandom(num);
        }
    },
    plotrandom: function(number) {
        bounds = this.map.getBounds();
        var southWest = bounds.getSouthWest();
        var northEast = bounds.getNorthEast();
        var lngSpan = northEast.lng() - southWest.lng();
        var latSpan = northEast.lat() - southWest.lat();
        pointsrand = [];
        for (var i = 0; i < number; ++i) {
            var point = new google.maps.LatLng(southWest.lat() + latSpan * Math.random(), southWest.lng() + lngSpan * Math.random());
            pointsrand.push(point);
        }
        for (var i = 0; i < number; ++i) {
            var str_text = i + " : " + pointsrand[i];
            var marker = this.placeMarker(pointsrand[i], str_text);
            this.randomMarker.push(marker);
            marker.setMap(this.map);
        }
    },
    placeMarker: function(location, text) {
        // var iconFile = 'https://www.daftlogic.com/images/gmmarkersv3/stripes.png';
        // var marker = new google.maps.Marker({
        //     position: location,
        //     map: this.map,
        //     icon: iconFile,
        //     title: text.toString(),
        //     draggable: false
        // });
        return this.createMarker(location, text.toString(), null, 'male');
        // return marker;
    },
    get_set_options: function(){
        ret_array = []
        for (option in this.filters) {
            if (this.filters[option]) {
                ret_array.push(option)
            }
        }
        return ret_array;
    },
    filter_markers: function(){
        set_filters = this.get_set_options()
        // for each marker, check to see if all required options are set
        for (i = 0; i < this.markers.length; i++) {
            marker = this.markers[i];
            // start the filter check assuming the marker will be displayed
            // if any of the required features are missing, set 'keep' to false
            // to discard this marker
            keep = true
            for (opt = 0; opt < set_filters.length; opt++) {
                if (!marker.properties[set_filters[opt]]) {
                    keep = false;
                }
            }
            marker.setVisible(keep)
        }
    },
    map_filter: function(id_val){
        if (this.filters[id_val]) this.filters[id_val] = false
        else this.filters[id_val] = true
    },
}
var mapninja;

function loadMap() {
    mapninja = new MapNinja('map-canvas');
    mapninja.init();
    // mapninja.createMarkerImage('https://jslmariano.github.io/assets/static_icons/icon-marker-15.jpg');
    jQuery(':checkbox[data-json]').each(function(i, n) {
        var json_url = jQuery(this).data('json');
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
                         'restaurants'
                    )
                mapninja.groupMarker('restaurants',marker);
                var markerInfo = "<div><h3>" + titleText + "</h3>Amenities: " + descriptionText + "</div>"
                marker.addListener('click', function() {
                    // $('#campground_info').html(markerInfo);
                    console.log(markerInfo);
                });
                mapninja.markers.push(marker);
            });
        });
    });
    // .on('click init', function() {
    //     mapninja.markerGroups.set(this.value, (this.checked) ? mapninja.map : null)
    //     if (this.checked) {
    //         jQuery('.map-icon-label.' + this.value).removeClass('hide');
    //     } else {
    //         jQuery('.map-icon-label.' + this.value).addClass('hide');
    //     }
    //     console.log('.map-icon-label.' + this.value);
    // }).trigger('init');

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
