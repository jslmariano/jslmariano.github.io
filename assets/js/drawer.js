function Drawer(map) {
    this.map = map;
}
Drawer.prototype = {
    constructor: Drawer,
    map: null,
    circles: [],
    listeners: [],
    drawerPanel: null,
    drawingModes: [google.maps.drawing.OverlayType.CIRCLE],
    drawingModesDefault: [
        google.maps.drawing.OverlayType.MARKER,
        google.maps.drawing.OverlayType.CIRCLE,
        google.maps.drawing.OverlayType.POLYGON,
        google.maps.drawing.OverlayType.POLYLINE,
        google.maps.drawing.OverlayType.RECTANGLE
      ],
    createPanel: function() {
        var drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.MARKER,
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: this.drawingModes
            },
            markerOptions: {
                icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'
            },
            circleOptions: {
                clickable: false,
                editable: false,
                zIndex: 1,
                // metres
                radius: 100000,
                fillColor: '#fff',
                fillOpacity: .6,
                strokeColor: '#313131',
                strokeOpacity: .4,
                strokeWeight: .8
            }
        });
        var ako = this;
        listener = google.maps.event.addListener(drawingManager, 'circlecomplete', function(shape){
        	ako.onCircleComplete(shape, ako);
        });
        this.listeners.push(listener);
        this.drawerPanel = drawingManager;
        this.circles = [];
        return this;
    },
    show: function(){
    	this.drawerPanel.setMap(this.map);
    	this.displayCenterMarker(true);
    	this.displayCircles(true);
    	return this;
    },
    hide: function(){
    	this.drawerPanel.setMap(null);
    	this.displayCenterMarker(false);
    	this.displayCenterInfo(false);
    	this.displayCircles(false);
    	return this;
    },
    onCircleComplete: function(shape, ako){
    	console.log(shape);

		if (shape == null || (!(shape instanceof google.maps.Circle))) return;

		if (ako.circles.length) {
			ako.circles[0].setMap(null);
			ako.circles = [];
		}

        centerMarker = ako.createCenterMarker(shape);

    	//push the circles onto the array
   	 	ako.circles.push(shape);
        //reset filters
        mapninja.calibrateMarkersBoundings(mapninja.drawer.circles[0],mapninja.markers.restaurants);
    },
    createCenterMarker: function(shape){
    	centerMarker = new google.maps.Marker({
            position: shape.getCenter(),
            title: 'Location',
            map: this.map,
            draggable: true
        });
        centerInfo = this.createCenterInfo();
	    // attach shape to marker
	    shape.bindTo('center', centerMarker, 'position');

		// get some latLng object and Question if it's contained in the circle:
	    marker_dragend = google.maps.event.addListener(centerMarker, 'dragend', function() {
	        // latLngCenter = new google.maps.LatLng(centerMarker.position.lat(), centerMarker.position.lng());
	        // bounds = centerMarker.getBounds();
            mapninja.calibrateMarkersBoundings(mapninja.drawer.circles[0],mapninja.markers.restaurants);
	    });

	    marker_click = google.maps.event.addListener(centerMarker, 'click', function() {
	        centerInfo.open(this.map, centerMarker);
	    });

	    marker_drag = google.maps.event.addListener(centerMarker, 'drag', function() {
	        centerInfo.close();
	    });

		//store listeners so we can unbind them later if needed
	    this.listeners.push(marker_dragend);
	    this.listeners.push(marker_click);
	    this.listeners.push(marker_drag);

        if (Object.size(this.centerMarker)) {
        	this.centerMarker.setMap(null);
        }
        this.centerMarker = centerMarker;
        return this.centerMarker;
    },
    createCenterInfo: function(){
    	contentCenter = '<span class="infowin">Center Marker (draggable)</span>';
        centerInfo = new google.maps.InfoWindow({
            content: contentCenter
        });
        if (Object.size(this.centerInfo)) {
        	this.centerInfo.setMap(null);
        }
        this.centerInfo = centerInfo;
        return this.centerInfo;
    },
    displayCenterMarker :function(show = true){
        if (Object.size(this.centerMarker)) {
        	this.centerMarker.setVisible(show);
        }
    },
    displayCenterInfo :function(show = true){
        if (Object.size(this.centerInfo)) {
        	if (show) {
        		this.centerInfo.open(this.map, this.centerMarker);
        	} else {
        		this.centerInfo.close();
        	}
        }
    },
    displayCircles: function(show = true){
        if (Object.size(this.circles)) {
        	for (var key in this.circles) {
        		this.circles[key].setVisible(show);
			}
        }
    },
}