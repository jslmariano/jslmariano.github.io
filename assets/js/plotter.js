var map;
var arrMarkers = new Array(0);
var bounds;

function initialize() {
    var latlng = new google.maps.LatLng(54.62279178711505, -5.895538330078125);
    var myOptions = {
        zoom: 12,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.HYBRID,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        }
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
}

function ftn_button_clicked() {
    if (arrMarkers) {
        for (i in arrMarkers) {
            arrMarkers[i].setMap(null)
        }
    }
    arrMarkers = new Array(0);
    var num = document.getElementById("nm").value;
    if (num < 1000) {
        plotrandom(num);
    }
}

function plotrandom(number) {
    bounds = map.getBounds();
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
        var marker = placeMarker(pointsrand[i], str_text);
        arrMarkers.push(marker);
        marker.setMap(map);
    }
}

function placeMarker(location, text) {
    var iconFile = 'https://www.daftlogic.com/images/gmmarkersv3/stripes.png';
    var marker = new google.maps.Marker({
        position: location,
        map: map,
        icon: iconFile,
        title: text.toString(),
        draggable: false
    });
    return marker;
}