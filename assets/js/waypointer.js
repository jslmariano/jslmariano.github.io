function WayPoint(map) {
    this.map = map
}
WayPoint.prototype = {
    constructor: WayPoint,
    markerArray: [],
    // Instantiate a directions service.
    directionsService: new google.maps.DirectionsService,
    // Create a renderer for directions
    directionsDisplay: [],
    initialize: function() {
        var bangalore = {
            lat: 12.97,
            lng: 77.59
        };
        // var map = new google.maps.Map(document.getElementById('map-canvas'), {
        //   zoom: 12,
        //   center: bangalore
        // });
        var map;
        map_options = {
            zoom: 14,
            // center: {
            //     lat: 42.9456,
            //     lng: -122.2
            // },
            center: new google.maps.LatLng(10.3180285, 123.8901931)
        }
        map_document = document.getElementById('map-canvas')
        map = new google.maps.Map(map_document, map_options);
        directionsDisplay = new google.maps.DirectionsRenderer({ //bind it to the map.
            map: map,
            suppressMarkers: true
        });
        // This event listener calls addMarker() when the map is clicked.
        google.maps.event.addListener(map, 'click', function(event) {
            addMarker(event.latLng, map);
            calculateAndDisplayRoute();
        });
        //add the first marker
        markerArray[0] = new MarkerWithLabel({
            position: bangalore,
            map: map,
            animation: google.maps.Animation.DROP, //just for fun
            labelContent: "",
            labelClass: "marker-label"
        });
    },
    addMarker: function(location, map) {
        markerArray[1] = new MarkerWithLabel({
            position: location,
            map: map,
            animation: google.maps.Animation.DROP, //just for fun
            labelContent: "",
            labelClass: "marker-label"
        });
    },
    calculateAndDisplayRoute: function() {
        // Retrieve the start and end locations and create a DirectionsRequest using
        // WALKING directions.
        directionsService.route({
            origin: markerArray[0].getPosition(),
            destination: markerArray[markerArray.length - 1].getPosition(),
            travelMode: google.maps.TravelMode.WALKING
        }, function(response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
                route = directionsDisplay.getDirections().routes[0];
                markerArray[1].set('labelContent', route.legs[0].distance.value / 1000)
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    },
}