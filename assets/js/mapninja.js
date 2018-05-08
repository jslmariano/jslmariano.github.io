function MapNinja(map_id) {
    this.map_id = map_id;
}
MapNinja.prototype = {
    constructor: MapNinja,
    map: null,
    markerGroups: null,
    randomMarker: new Array(0),
    markers: [],
    listeners: [],
    filters: {
        bread: false,
        pasta: false,
        meat: false,
        inbound: false,
        outbound: false,
    },
    options: {
        zoom: 14,
        // 10.3180285,123.8901931,14z //Cebu!
        center: new google.maps.LatLng(10.3180285, 123.8901931)
    },
    control_panel: {
        search_box: null,
        search_input: null,
    },
    init: function() {
        this.map = new google.maps.Map(document.getElementById(this.map_id), this.options);
        this.markerGroups = new google.maps.MVCObject();
        this.loadControlPanel();
    },
    randLatLng: function() {
        return new google.maps.LatLng(((Math.random() * 17000 - 8500) / 100), ((Math.random() * 36000 - 18000) / 100));
    },
    loadControlPanel: function() {
        control_panel = jQuery('.control-panel').get(0);
        this.map.controls[google.maps.ControlPosition.LEFT_TOP].push(control_panel);
        this.loadSearchInpupt();
    },
    loadSearchInpupt: function() {
        this.control_panel.search_input = jQuery('.place-search').get(0);
        this.control_panel.search_box = new google.maps.places.SearchBox(this.control_panel.search_input);
        var ako = this;
        // Bias the SearchBox results towards current map's viewport.
        var map_bounds_changed = this.map.addListener('bounds_changed', function() {
            ako.control_panel.search_box.setBounds(ako.map.getBounds());
        });
        this.listeners.push(map_bounds_changed);
        var markers = [];
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        this.control_panel.search_box.addListener('places_changed', function() {
            var places = ako.control_panel.search_box.getPlaces();
            if (places.length == 0) {
                return;
            }
            // Clear out the old markers.
            ako.clearMarkers('restaurants');
            // For each place, get the icon, name and location.
            var bounds = new google.maps.LatLngBounds();
            places.forEach(function(place) {
                if (!place.geometry) {
                    console.log("Returned place contains no geometry");
                    return;
                }
                var icon = {
                    url: place.icon,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25)
                };
                // Create a marker for each place.
                // markers.push(new google.maps.Marker({
                //     map: ako.map,
                //     icon: icon,
                //     title: place.name,
                //     position: place.geometry.location
                // }));
                marker = ako.createMarker(place.geometry.location, place.name, place, 'restaurant');
                markerInfo = ako.createInfoWindow(place.name, place.html_attributions.join());
                marker.infowindow = markerInfo;
                ako.displayMarker(marker, false);
                marker.addListener('click', function() {
                    ako.onMarkerClick(this);
                });
                ako.markers.restaurants.push(marker);
                if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            });
            ako.map.fitBounds(bounds);
            jQuery(ako.control_panel.search_input).trigger('places_changed_complete');
        });
    },
    onMarkerClick: function(marker) {
        this.clearDisplay();
        //close all infowindow
        jQuery.each(this.markers.restaurants, function() {
            if (marker === this) {
                return;
            }
            this.infowindow.close();
        });
        if (marker.infowindow.getMap()) {
            marker.infowindow.close();
            marker.infowindow.setMap(null);
        } else {
            marker.infowindow.setMap(this.map);
            marker.infowindow.open(this.map, marker);
            this.fetchPlaceDetails(marker);
        }
        if (jQuery('.drop_origin').prop('checked')) {
            this.waypoint.setDestination(marker);
            this.waypoint.calculateAndDisplayRoute();
        }
    },
    fetchPlaceDetails: function(marker) {
        if (!marker['properties']['place_id']) {
            return false;
        }
        place_id = marker['properties']['place_id'];
        var service = new google.maps.places.PlacesService(this.map);
        var ako = this;
        jQuery('.place-detail-status').html('Fetching Details...');
        var details = service.getDetails({
            placeId: place_id
        }, function(place, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                ako.fetchPlaceDetailsComplete(ako, place, status);
            }
        });
        return true;
    },
    fetchPlaceDetailsComplete: function(ako, place, status) {
        jQuery('.place-detail-status').html('Details...');
        console.log(place, status);
        ako.displayDetails(place);
    },
    displayDetails: function(place) {
        place_details = jQuery('.place-detail-wrapper');
        rating_block = place_details.find('.rating-block');
        rating_block.find('.rate').html(place.rating);
        rate_buttons = rating_block.find('button');
        //reset buttons rate
        jQuery(rate_buttons).removeClass('btn-warning').addClass('btn-default');
        rates_count = 1;
        jQuery(rate_buttons).each(function() {
            if (rates_count < parseInt(place.rating)) {
                jQuery(this).removeClass('btn-default');
                jQuery(this).addClass('btn-warning');
            }
            rates_count++;
        });

        review_block_template = jQuery('.review-block-template');
        jQuery.each(place.reviews, function(key, item) {
            item_template = jQuery(review_block_template).clone();
            item_template = jQuery('<div>').html(jQuery(item_template).html());
            item_template.find('.review-block-name').html(item.author_name);
            item_template.find('.review-block-date').html(item.relative_time_description);
            // item_template.find('.review-block-title').html(item.text);
            item_template.find('.review-block-description').html(item.text);
            item_template.find('.img-rounded').attr('src',item.profile_photo_url);

            item_rates_count = 1;
            jQuery(item_template.find('.review-block-rate button')).each(function() {
                if (item_rates_count < parseInt(item.rating)) {
                    jQuery(this).removeClass('btn-grey');
                    jQuery(this).addClass('btn-warning');
                }
                item_rates_count++;
            });
            jQuery('.review-block').append(item_template);
        });
        jQuery('.rating-block-wrapper').show();
        jQuery('.review-block-master-wrapper').show();
    },
    clearDisplay: function() {
        jQuery('.place-detail-status').html('Details...');
        jQuery('.place-detail-status-info').html();
        jQuery('.rating-block-wrapper').hide();
        jQuery('.review-block-master-wrapper').hide();
    },
    clearMarkers: function(key) {
        if (this.markers.hasOwnProperty(key)) {
            markers = this.markers[key];
        }
        // Clear out the old markers.
        markers.forEach(function(marker) {
            marker.setMap(null);
        });
        if (this.markers.hasOwnProperty(key)) {
            this.markers[key] = [];
        }
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
    createSimpleMarker: function(position, title, properties, group_title) {
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
    filter_markers: function(markers = null, override = true) {
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
                if (!marker.properties[set_filters[opt]] && override) {
                    keep = false;
                }
            }
            this.displayMarker(marker, keep);
        }
        this.clearDisplay();
    },
    map_filter: function(id_val, force_val) {
        if (typeof force_val != "undefined") {
            this.filters[id_val] = force_val;
            return force_val;
        }
        if (this.filters[id_val]) this.filters[id_val] = false;
        else this.filters[id_val] = true;
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
    isMarkerInbound: function(circle, marker) {
        bounds = circle.getBounds();
        markPosition = marker.position;
        latLngPos = new google.maps.LatLng(marker.position.lat(), marker.position.lng());
        /**
         * A google.maps.LatLngBounds is a rectangle.
         * You need a polygon "contains" function.
         * For a circle this can be reduced to testing whether
         * the point is less than the radius away from the center.
         */
        distanceBetween = (google.maps.geometry.spherical.computeDistanceBetween(marker.getPosition(), circle.getCenter()) <= circle.getRadius());
        return distanceBetween;
        // return bounds.contains(latLngPos);
    },
    calibrateMarkersBoundings: function(circle, markers) {
        var ako = this;
        jQuery.each(markers, function(key, marker) {
            if (ako.isMarkerInbound(circle, marker)) {
                marker.properties.inbound = false;
                marker.properties.outbound = true;
            } else {
                marker.properties.inbound = true;
                marker.properties.outbound = false;
            }
        });
        this.resetFilters();
    },
    resetFilters: function() {
        for (option in this.filters) {
            if (this.filters[option]) {
                this.filters[option] = false;
            }
        }
        mapninja.filter_markers(mapninja.markers.restaurants, false);
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
            if (ako.isMarkerInbound(circle, this)) {
                ako.displayMarker(this, show);
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
            if (!ako.isMarkerInbound(circle, this)) {
                ako.displayMarker(this, show);
            }
        });
    },
}