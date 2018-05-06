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
        // 10.3180285,123.8901931,14z //Cebu!
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
        // console.log(marker);
        return marker;
    },
    createSimpleMarker: function(position, title, properties, group_title){
        marker = new google.maps.Marker({
            map: this.map,
            draggable: false,
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
        marker = new google.maps.Marker({
            position: position,
            title: title,
            map: this.map,
            draggable: true
        });
        // console.log(marker);
        return marker;
    },
    createInfoWindow: function(title, content, width = 400) {
        var contentString = '<div class="info-window">' + '<h3>' + title + '</h3>' + '<div class="info-content">' + '<p>' + content + '</p>' + '</div>' + '</div>';
        var infoWindow = new google.maps.InfoWindow({
            content: contentString,
            maxWidth: width
        });
        return infoWindow;
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
    get_set_options: function() {
        ret_array = []
        for (option in this.filters) {
            if (this.filters[option]) {
                ret_array.push(option)
            }
        }
        return ret_array;
    },
    filter_markers: function(markers = null) {
        set_filters = this.get_set_options()
        // for each marker, check to see if all required options are set
        if (markers != null) {
            markers = markers;
        } else {
            markers = this.markers;
        }
        for (i = 0; i < markers.length; i++) {
            marker = markers[i];
            // start the filter check assuming the marker will be displayed
            // if any of the required features are missing, set 'keep' to false
            // to discard this marker
            keep = true
            for (opt = 0; opt < set_filters.length; opt++) {
                if (!marker.properties[set_filters[opt]]) {
                    keep = false;
                }
            }
            this.displayMarker(marker, keep);
        }
    },
    map_filter: function(id_val) {
        if (this.filters[id_val]) this.filters[id_val] = false
        else this.filters[id_val] = true
    },
    get_active_marker: function(markers) {
        active_marker = false;
        if (markers.length) {
            jQuery.each(markers, function() {
                if (this.infowindow.getMap()) {
                    active_marker = this;
                }
            });
        }
        return active_marker;
    },
    loadDrawer: function() {
        return this.drawer.createPanel().show();
    },
    isMarkerInbound: function(circle, marker){
        bounds = circle.getBounds();
        markPosition = marker.position;
        latLngPos = new google.maps.LatLng(marker.position.lat(), marker.position.lng());

        /**
         * A google.maps.LatLngBounds is a rectangle.
         * You need a polygon "contains" function.
         * For a circle this can be reduced to testing whether
         * the point is less than the radius away from the center.
         */
        distanceBetween = (
            google.maps.geometry.spherical.computeDistanceBetween(
                marker.getPosition(),
                circle.getCenter()
                )
            <= circle.getRadius()
            );
        return distanceBetween;
        // return bounds.contains(latLngPos);
    },
    displayMarker: function(marker, show = true) {
        marker.setVisible(show);
        if (show) {
            if (Object.size(marker.MarkerLabel)) {
                jQuery(marker.MarkerLabel.div).show();
            }
        } else {
            if (Object.size(marker.MarkerLabel)) {
                jQuery(marker.MarkerLabel.div).hide();
            }
            marker.infowindow.close();
        }
    },
    displayInboundMarkers: function(show = true) {

        if (!Object.size(this.drawer.circles)) {
            return false;
        }

        ako = this;
        circle = this.drawer.circles[0];
        jQuery.each(this.markers.restaurants, function() {
            if (ako.isMarkerInbound(circle,this)) {
                ako.displayMarker(this,show);
            }
        });
    },
    displayOutboundMarkers: function(show = true) {

        if (!Object.size(this.drawer.circles)) {
            return false;
        }

        ako = this;
        circle = this.drawer.circles[0];
        jQuery.each(this.markers.restaurants, function() {
            if (!ako.isMarkerInbound(circle,this)) {
                ako.displayMarker(this,show);
            }
        });
    },
}