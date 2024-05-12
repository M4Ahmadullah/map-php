//$('#mtitle').html('Fulham to Binden - ');

// Google Maps PrepAir
//////////////////////////////////
var oMap;
var aMarkers = [];
var aWindows = [];
var latlng;
var infoWindow = new Array();
var infoWindowM = new Array();

var aMarkersw = new Array();
var aMapLabels = new Array();
var aAimages = [];
var aShapes = [];
var justCreated = 0;
var aLibs = new Array();

var nbW = 0;
var mContentM;

function getQueryParameter(name) {
  const queryString = window.location.search;
  const parameterRegex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
  const match = parameterRegex.exec(queryString);
  if (match && match[2]) {
    return decodeURIComponent(match[2]);
  }
  return null;
}
const lat1 = parseFloat(getQueryParameter("start")) || 0;
const lng1 = parseFloat(getQueryParameter("")) || 0;
const lat2 = parseFloat(getQueryParameter("end")) || 0;
const lng2 = parseFloat(getQueryParameter("")) || 0;

var htmlContent =
  '<div style="width:250px;">\
            <h5 class="w3-left">Edit this spot</h5>\
                <form class="form-signin" role="form" id="myform" method="post" target="fgfrm" onsubmit="getMicon(event);">\
                <input name="sname" id="sname" class="form-control" type="text" style="margin-bottom:5px;" placeholder="Enter a label for this spot" autofocus>\
				<input type="checkbox" name="lvis" id="lvis" style="display:none;">\
				<!--label>The label is visible</label><br-->\
				<input type="checkbox" checked="checked" name="mvis" id="mvis" style="display:none;">\
				<!--label>The marker is visible</label-->\
                <div style="text-align:center">\
                <input type="hidden" name="lat" id="lat">\
                <input type="hidden" name="lng" id="lng">\
                <input type="hidden" name="type" id="type">\
                <input type="hidden" name="wiId" id="wiId">\
                <input type="hidden" name="wIcon" id="wIcon">\
                <input type="hidden" name="wZoom" id="wZoom">\
                <input type="hidden" name="mapname" id="mapname" value="PLANS/london/_0">\
                <input type="hidden" name="project" id="project" value="40057">\
                <input type="hidden" name="mode" value="">\
                <button type="submit" class="btn btn-lg btn-primary btn-block">Ok</button>\
                    </div>\
                </form>\
			</div>';

var PrepAir = PrepAir || {};
PrepAir.ImagesBaseUrl = "";
// https://www.smart-topo-training.com/app/

// PlanMap class
//////////////////////////////////
PrepAir.PlanMap = function (container) {
  // Create map
  this._map = new google.maps.Map(container, {
    zoom: 7,
    minZoom: 3 /*10,*/,
    maxZoom: 8 /*10,*/,
    center: new google.maps.LatLng(lat1, lng1),
    mapTypeControl: false,
    disableDefaultUI: true,
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.LEFT_TOP,
    },

    scaleControl: false,
    gestureHandling: "greedy",
    draggableCursor: "default",
    opacity: 1,
  });

  // Set custom tiles
  this._map.mapTypes.set(
    "scope/london/_0",
    new PrepAir.ImgMapType("scope/london/_0", "#ffffff")
  ); // '#4E4E4E'
  //this._map.setMapTypeId('roadmap');		//alert('roadmap');
  this._map.setMapTypeId("scope/london/_0"); //alert('PLANS/london/_0');
  oMap = this._map;
  //oMap.overlayMapTypes.insertAt(0, new CoordMapType(new google.maps.Size(256, 256)));
};

var styles = {
  default: null,
  hide: [
    {
      featureType: "poi.business",
      stylers: [{ visibility: "off" }],
    },

    {
      featureType: "poi.attraction",
      stylers: [{ visibility: "off" }],
    },

    {
      featureType: "poi.medical",
      stylers: [{ visibility: "off" }],
    },

    {
      featureType: "poi.school",
      stylers: [{ visibility: "off" }],
    },

    {
      featureType: "poi.government",
      stylers: [{ visibility: "off" }],
    },

    {
      featureType: "poi.place_of_worship",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "poi.sports_complex",
      stylers: [{ visibility: "off" }],
    },

    {
      featureType: "poi.park",
      stylers: [{ color: "#adebad" }],
    },

    {
      featureType: "water",
      elementType: "geometry.fill",
      stylers: [{ color: "#b3d1ff" }],
    },

    {
      featureType: "poi.park",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },

    {
      featureType: "poi.park",
      elementType: "geometry.fill",
      stylers: [{ lightness: 0 }],
    },

    {
      featureType: "transit",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },

    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#a0a0a0" }],
    },

    {
      featureType: "landscape",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },

    {
      featureType: "landscape",
      elementType: "geometry",
      stylers: [{ color: "#efefef" }],
    },

    {
      featureType: "road.local",
      elementType: "geometry",
      stylers: [{ color: "#ffffff" }],
    },

    {
      // Baz Fazal: #ffff4d for the B roads
      featureType: "road.local", //
      elementType: "geometry.stroke", // Baz Fazal: #ffcc00 A roads
      stylers: [{ color: "#d0d0d0" }], //
    }, // Baz Fazal: #80bfff motorways only
    //
    {
      // Baz Fazal: normal streets to be white as normal
      featureType: "road.arterial", //
      elementType: "geometry", // Francisco Gomes: I have four types of roads : local, arterial, highway and highway.controlled_access
      stylers: [{ color: "#ffcc00" }], //
    }, // Francisco Gomes: Maybe I should colour them with hard colours for identification first
    //
    {
      // Baz Fazal: yes
      featureType: "road.arterial", //
      elementType: "geometry.stroke", // Baz Fazal: do arterial as A road colour
      stylers: [{ color: "#a0a0a0" }], //
    }, // Baz Fazal: local as white
    //
    {
      // Baz Fazal: highways as motorway colour
      featureType: "road.highway", //
      elementType: "geometry", // Baz Fazal: lets see
      /*stylers: [{ color: '#ff9966' }],*/
      stylers: [{ color: "#ffcc00" }],
    },

    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#a0a0a0" }],
    },

    {
      featureType: "road.highway.controlled_access",
      elementType: "geometry",
      stylers: [{ color: "#80bfff" }],
    },

    {
      featureType: "road.highway.controlled_access",
      elementType: "geometry.stroke",
      stylers: [{ color: "#a0a0a0" }],
    },
  ],
};

// ImgMapType class
//////////////////////////////////
PrepAir.ImgMapType = function (theme, backgroundColor) {
  this.name = this._theme = theme;
  this._backgroundColor = backgroundColor;
};

PrepAir.ImgMapType.prototype.tileSize = new google.maps.Size(256, 256);
PrepAir.ImgMapType.prototype.minZoom = 1;
PrepAir.ImgMapType.prototype.maxZoom = 8;

PrepAir.ImgMapType.prototype.getTile = function (coord, zoom, ownerDocument) {
  var tilesCount = Math.pow(2, zoom);

  if (
    coord.x >= tilesCount ||
    coord.x < 0 ||
    coord.y >= tilesCount ||
    coord.y < 0
  ) {
    var div = ownerDocument.createElement("div");
    div.style.width = this.tileSize.width + "px";
    div.style.height = this.tileSize.height + "px";
    div.style.backgroundColor = this._backgroundColor;
    return div;
  }

  var img = ownerDocument.createElement("IMG");
  img.width = this.tileSize.width;
  img.height = this.tileSize.height;
  var randomnumber = Math.floor(Math.random() * 11);

  $("#zlevel").text("  Zoom level : " + zoom);

  //   img.src = PrepAir.Utils.GetImageUrl(
  //     this._theme +
  //       "/tile_" +
  //       zoom +
  //       "_" +
  //       coord.x +
  //       "-" +
  //       coord.y +
  //       ".png?v=" +
  //       randomnumber
  //   );
  //   NOT caching tiles
  //   img.src =
  //     "https://www.smart-topo-training.com/trial/PLANS/london/_0" +
  //     "/tile_" +
  //     zoom +
  //     "_" +
  //     coord.x +
  //     "-" +
  //     coord.y +
  //     ".png?v=" +
  //     randomnumber;

  // caching tiles
  img.src =
    "https://storage.cloud.google.com/map-ims" +
    "/tile_" +
    zoom +
    "_" +
    coord.x +
    "-" +
    coord.y +
    ".png";

  // img.src =
  //   "https://drive.google.com/drive/folders/1honL3kcKgqnyq39pfuVkZ7QJ3rwqFIBa" +
  //   "/tile_" +
  //   zoom +
  //   "_" +
  //   coord.x +
  //   "-" +
  //   coord.y +
  //   ".png";
  //https://drive.google.com/drive/folders/1honL3kcKgqnyq39pfuVkZ7QJ3rwqFIBa
  // tile_6_26-33.png
  // console.log(img);
  // https://www.smart-topo-training.com/
  https: return img;
};

// Other
//////////////////////////////////
PrepAir.Utils = PrepAir.Utils || {};

PrepAir.Utils.GetImageUrl = function (image) {
  return PrepAir.ImagesBaseUrl + image;
};

PrepAir.Utils.SetOpacity = function (obj, opacity /* 0 to 100 */) {
  obj.style.opacity = opacity / 100;
  obj.style.filter = "alpha(opacity=" + opacity + ")";
};

var lineSymbol = {
  path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
};

var drawingManager = new google.maps.drawing.DrawingManager({
  /*drawingMode: google.maps.drawing.OverlayType.MARKER,*/
  drawingControl: true,
  drawingControlOptions: {
    position: google.maps.ControlPosition.TOP_LEFT,
    drawingModes: [
      google.maps.drawing.OverlayType.MARKER,
      google.maps.drawing.OverlayType.CIRCLE,
      //google.maps.drawing.OverlayType.POLYGON,
      //google.maps.drawing.OverlayType.POLYLINE,
      //google.maps.drawing.OverlayType.RECTANGLE
    ],
  },

  markerOptions: {
    /*icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png', */
    editable: true,
    clickable: true,
    title: "Spot marker click to open.",
    labelOrigin: new google.maps.Point(9, 9),
  },

  circleOptions: {
    fillColor: "#ffffde",
    strokeColor: "#AA0000",
    fillOpacity: 0.3,
    strokeWeight: 1,
    clickable: true,
    editable: true,
    zIndex: 1,
  },
  rectangleOptions: {
    fillColor: "#ffffde",
    strokeColor: "#AA0000",
    fillOpacity: 0.3,
    strokeWeight: 1,
    clickable: true,
    editable: true,
    zIndex: 1,
  },
  polygonOptions: {
    fillColor: "#ffffde",
    strokeColor: "#AA0000",
    fillOpacity: 0.3,
    strokeWeight: 1,
    clickable: true,
    editable: true,
    zIndex: 1,
  },
  polylineOptions: {
    fillColor: "#ffffde",
    strokeColor: "#AA0000",
    /*fillOpacity: .3,*/
    /*strokeWeight: 2,*/
    fillOpacity: 0,
    strokeWeight: 0,
    clickable: true,
    editable: false,
    /*icons: [{icon: './img/small_symbol_star.png', offset: '100%'}],*/
    zIndex: 1,
  },
});

var symbolOne = {
  path: "M -2,0 0,-2 2,0 0,2 z",
  strokeColor: "#F00",
  fillColor: "#F00",
  fillOpacity: 0.1,
  scale: 2,
};

// Map creation
//////////////////////////////////
var pMap;
var cLat;
var cLong;

google.maps.event.addDomListener(window, "load", function () {
  PlanMap = new PrepAir.PlanMap(document.getElementById("plan-map"));
  pMap = PlanMap._map;

  imZooming = false;
  pMap.setOptions({ styles: styles["hide"] });

  google.maps.event.addListener(
    drawingManager,
    "overlaycomplete",
    function (event) {
      closeAllinfow();

      if (event.type == google.maps.drawing.OverlayType.CIRCLE) {
        /*
		google.maps.event.addListener(event.overlay, 'click', function(){
		if(confirm("Do you want to modify this shape ?")){event.overlay.setEditable(true)}else{event.overlay.setEditable(false)};
		});
		*/

        var r = event.overlay.getRadius();
        var c = event.overlay.getCenter();
        var jStr = JSON.stringify(c.toJSON());

        //console.log(jStr, r);
        event.overlay.setEditable(false);
        var sId = aShapes.push(event.overlay) - 1;
        aShapes[sId].id = null;

        /*		
		google.maps.event.addListener(event.overlay, 'rightclick', function(){
			if(confirm('Do you want to remove this shape ?')){updShape(sid, {$cu->record->id}, '', 'del', '', '', null);aShapes[$sid].setMap(null)};});\n";
		});
		*/

        imZooming = false;
        saveRoute(sId, jStr, "add", "CIRCLE", r, google.maps.event);
      } // event

      if (event.type == google.maps.drawing.OverlayType.POLYLINE) {
        return;
        var aPath = event.overlay.getPath().getArray();

        google.maps.event.addListener(event.overlay, "rightclick", function () {
          if (confirm("Do you want to remove this line ?")) {
            event.overlay.setMap(null);
          }
        });

        google.maps.event.addListener(event.overlay, "click", function () {
          event.overlay.setEditable(false);
        });

        /*
		google.maps.event.addListener(event.overlay, 'dblclick', function(){
			if(confirm("Do you want to remove this line ?")){event.overlay.setMap(null)};
		});
		*/
        google.maps.event.addListener(event.overlay, "mouseover", function () {
          event.overlay.setOptions({ strokeWeight: 8 });
        });

        google.maps.event.addListener(event.overlay, "mouseout", function () {
          event.overlay.setOptions({ strokeWeight: 3 });
        });

        var jStr = "[";

        for (i = 0; i < aPath.length; i++) {
          jStr += JSON.stringify(aPath[i]) + (i < aPath.length - 1 ? ", " : "");
        }
        jStr += "]";
        event.overlay.setEditable(false);
        var id = aShapes.push(event.overlay) - 1;
        //aShapes.push(event.overlay);
        updShape(id, null, jStr, "add", "POLYLINE", 0, google.maps.event);
        $("#stdbtn").html("Start drawing");
        $("#stdbtn").css("color", "white");
        $("#stdbtn").css("fontWeight", "normal");
        $("#stdbtn").css("background", "green");
        imZooming = false;
      } // event

      if (event.type == google.maps.drawing.OverlayType.POLYGON) {
        google.maps.event.addListener(event.overlay, "rightclick", function () {
          if (confirm("Do you want to remove this line ?")) {
            event.overlay.setMap(null);
          }
        });

        /*
		google.maps.event.addListener(event.overlay, 'click', function(){
		if(confirm("Do you want to modify this line ?")){event.overlay.setEditable(true)}else{event.overlay.setEditable(false)};
		});
		*/

        var aPath = event.overlay.getPath().getArray();
        var jStr = "[";

        for (i = 0; i < aPath.length; i++) {
          jStr += JSON.stringify(aPath[i]) + (i < aPath.length - 1 ? ", " : "");
        }
        jStr += "]";
        event.overlay.setEditable(false);
        updShape("", "", jStr, "add", "POLYGON", 0, google.maps.event);
      } // event

      if (event.type == google.maps.drawing.OverlayType.RECTANGLE) {
        google.maps.event.addListener(event.overlay, "rightclick", function () {
          if (confirm("Do you want to remove this shape ?")) {
            event.overlay.setMap(null);
          }
        });

        google.maps.event.addListener(event.overlay, "click", function () {
          if (confirm("Do you want to modify this shape ?")) {
            event.overlay.setEditable(true);
          } else {
            event.overlay.setEditable(false);
          }
        });

        var bounds = event.overlay.bounds.toJSON();
        var jStr = JSON.stringify(bounds);
        event.overlay.setEditable(false);
        updShape("", "", jStr, "add", "RECTANGLE", 0, google.maps.event);
      } // event

      if (event.type == google.maps.drawing.OverlayType.MARKER) {
        imZooming = false;
        imPanning = false;

        try {
          latlng = event.overlay.getPosition();
        } catch (err) {
          console.log("ERROR :", event.overlay);
          alert(err.message);
          return;
        }

        var iId = "m" + Object.keys(aMarkers).length;
        event.overlay.id = iId;
        aMarkers[iId] = event.overlay;
        var cnt = aLibs.length;
        aMarkers[iId].id = "m" + cnt;
        aLibs.push(JSON.parse('{"id": "m' + cnt + '", "lib": "' + "" + '"}'));

        //console.log(event);
        var infowindow = new google.maps.InfoWindow({
          content: htmlContent,
        });

        google.maps.event.addListener(infowindow, "domready", function () {
          document.getElementById("lat").value = latlng.lat().toFixed(6) * 1;
          document.getElementById("lng").value = latlng.lng().toFixed(6) * 1;
          document.getElementById("type").value = "MARKER";
          document.getElementById("wiId").value = iId;
        });

        event.overlay.addListener("click", function () {
          if (imZooming) {
            return;
          }
          infowindow.open(pMap, aMarkers[iId]);
          aMarkers[iId].infowindow = infowindow;
          var baseIconDir = "img/"; //'https://maps.google.com/mapfiles/ms/icons/';
          var cicon = aMarkers[iId].icon;
          if (typeof cicon == "object") {
            cicon = aMarkers[iId].icon.url;
          }

          if (cicon) {
            if (cicon.indexOf("red") > 0) {
              aMarkers[iId].setIcon({
                url: baseIconDir + "grn-circle.png",
                scaledSize: new google.maps.Size(50, 50),
              });
            } else {
              aMarkers[iId].setIcon({
                url: baseIconDir + "fg-red-circle.png",
                scaledSize: new google.maps.Size(50, 50),
              });
            }
          } else {
            aMarkers[iId].setIcon({
              url: baseIconDir + "grn-circle.png",
              scaledSize: new google.maps.Size(50, 50),
            });
          }
          if (cicon) {
            // give him milk !
            document.getElementById("wIcon").value = aMarkers[iId].cicon;
          }
        });
      } // marker

      drawingManager.setOptions({
        drawingMode: null,
      });
    }
  ); // overlay complete

  /* prevent wrap  */
  /*                                                                                                                                                                                                                                                   
		  var lastValid = pMap.getCenter();
		  google.maps.event.addListener(pMap, 'center_changed', function() {
		    if(pMap.getBounds().getNorthEast().lng() > pMap.getBounds().getSouthWest().lng()) {
		      lastValid = pMap.getCenter();
		    }
		    else
		    {
		     pMap.panTo(lastValid);
	        }
		  });
		  */

  google.maps.event.addListener(pMap, "mousemove", function (event) {
    var pnt = event.latLng;
    cLat = pnt.lat().toFixed(4) * 1;
    cLong = pnt.lng().toFixed(4) * 1;
    //console.log(cLat, cLong);
  });

  google.maps.event.addListener(pMap, "center_changed", function () {
    imPanning = true;
  });

  google.maps.event.addListener(pMap, "zoom_changed", function () {
    imPanning = false;
    //pMap.zoom = Math.min(pMap.zoom, 17);console.log(pMap.zoom);
    if (imZooming) {
      // user clicked home button
      return;
    }

    return; // anyway

    //var z = Math.pow(2, pMap.zoom) ;
    //var fs = Math.min ((z * 256) - 10, 1020);
    //if(fs >= 1020){return;}

    //document.getElementById('plan-map').style.width = fs.toString() + 'px';
    //document.getElementById('plan-map').style.height = (Math.min(fs, 700)).toString() + 'px';
    //lastValid = new google.maps.LatLng(0, 0);

    //var lastValid = pMap.getCenter();
    //console.log(cLat, cLong);
    setTimeout(function () {
      google.maps.event.trigger(pMap, "resize");
      pMap.setCenter(new google.maps.LatLng(cLat, cLong));
      closeAllinfow();
    }, 200);

    var i = 0;
    var aL = Object.keys(aMapLabels);
    var stroke = 10;
    if (pMap.zoom == 1) {
      stroke = 8;
    }
    if (pMap.zoom == 2) {
      stroke = 14;
    }
    if (pMap.zoom == 3) {
      stroke = 24;
    }
    if (pMap.zoom == 4) {
      stroke = 32;
    }
    if (pMap.zoom == 5) {
      stroke = 42;
    }
    //console.log(pMap.zoom, stroke);
    for (i = 0; i < aL.length; i++) {
      if (aMapLabels[aL[i]]) {
        aMapLabels[aL[i]].set("fontSize", stroke);
      }
    }
  });

  //setTimeout(function(){

  // function to parse query parameters:
  function getQueryParameter(name) {
    const queryString = window.location.search;
    const parameterRegex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    const match = parameterRegex.exec(queryString);
    if (match && match[2]) {
      return decodeURIComponent(match[2]);
    }
    return null;
  }
  const lat1 = parseFloat(getQueryParameter("start")) || 0;
  const lng1 = parseFloat(getQueryParameter("")) || 0;
  const lat2 = parseFloat(getQueryParameter("end")) || 0;
  const lng2 = parseFloat(getQueryParameter("")) || 0;

  var mLatlng;
  var marker;
  var iId;
  var mContent;
  aMapLabels = [];
  aAimages = [];
  //var asl = document.getElementById('slides');
  aLibs = new Array();
  // const lat1 = 50.336917;
  // const lat2 = -36.891006;
  mLatlng = new google.maps.LatLng(lat1, lng1);

  nbW++;
  mContent =
    '<div style="width:150px;text-align:center;">\
            <h3>Start</h3>\
			</div>';
  iId = "m0";
  mContentM =
    '<h3>Start</h3>\
			    <div style="width:250px;">\
                <form class="" role="form" id="myform" method="post" target="fgfrm" onsubmit="removeLabel(event);">\
				<input type="checkbox"  name="lvis" style="display:none;">\
				<!--label>The label is visible</label><br-->\
				<input type="checkbox" checked="checked" name="mvis" style="display:none;">\
				<!--label>The marker is visible</label-->\
                <div style="text-align:center">\
                <input type="hidden" name="lat" value="0.336917">\
                <input type="hidden" name="lng"  value="-36.891006">\
                <input type="hidden" name="type"  value="MARKER">\
                <input type="hidden" name="mapname" value="PLANS/london/_0">\
				<input type="hidden" name="sname"  value="Start">\
                <input type="hidden" name="project" value="40057">\
                <input type="hidden" name="wiId" value="m0">\
                <input type="hidden" name="wIcon" value="./img/grn-circle.png">\
                <input type="hidden" name="mode" value="">\
                <!--button type="submit" name="upload" class="btn btn-lg btn-primary btn-block">Save</button-->\
                                    </div>\
                </form>\
			</div>';

  var iw = new google.maps.InfoWindow({ content: mContent });
  var im = new google.maps.InfoWindow({ content: mContentM });
  var mrk = new google.maps.Marker({
    position: mLatlng,
    map: pMap,
    title: "Start",
    id: iId,
    icon: {
      url: "./img/grn-circle.png",
      scaledSize: new google.maps.Size(50, 50),
    },
  });
  mrk.infowindow = im;
  aMarkersw[iId] = mrk;
  infoWindow[iId] = iw;
  infoWindowM[iId] = im;
  aLibs.push(JSON.parse('{"id": "m0", "lib":"Start"}'));
  aMarkersw["m0"].addListener("mouseout", function () {
    if (imZooming) {
    }
    infoWindow["m0"].close(pMap, aMarkers["m0"]);
  });
  aMarkersw["m0"].addListener("rightclick", function () {
    closeAllinfow();
    infoWindowM["m0"].open(pMap, aMarkersw["m0"]);
  });

  mLatlng = new google.maps.LatLng(lat2, lng2);

  nbW++;
  mContent =
    '<div style="width:150px;text-align:center;">\
            <h3>Finish</h3>\
			</div>';
  iId = "m1";
  mContentM =
    '<h3>Finish</h3>\
			    <div style="width:250px;">\
                <form class="" role="form" id="myform" method="post" target="fgfrm" onsubmit="removeLabel(event);">\
				<input type="checkbox"  name="lvis" style="display:none;">\
				<!--label>The label is visible</label><br-->\
				<input type="checkbox" checked="checked" name="mvis" style="display:none;">\
				<!--label>The marker is visible</label-->\
                <div style="text-align:center">\
                <input type="hidden" name="lat" value="6.595383">\
                <input type="hidden" name="lng"  value="-44.482358">\
                <input type="hidden" name="type"  value="MARKER">\
                <input type="hidden" name="mapname" value="PLANS/london/_0">\
				<input type="hidden" name="sname"  value="Finish">\
                <input type="hidden" name="project" value="40057">\
                <input type="hidden" name="wiId" value="m1">\
                <input type="hidden" name="wIcon" value="./img/fg-red-circle.png">\
                <input type="hidden" name="mode" value="">\
                <!--button type="submit" name="upload" class="btn btn-lg btn-primary btn-block">Save</button-->\
                                    </div>\
                </form>\
			</div>';

  var iw = new google.maps.InfoWindow({ content: mContent });
  var im = new google.maps.InfoWindow({ content: mContentM });
  var mrk = new google.maps.Marker({
    position: mLatlng,
    map: pMap,
    title: "Finish",
    id: iId,
    icon: {
      url: "./img/fg-red-circle.png",
      scaledSize: new google.maps.Size(50, 50),
    },
  });
  mrk.infowindow = im;
  aMarkersw[iId] = mrk;
  infoWindow[iId] = iw;
  infoWindowM[iId] = im;
  aLibs.push(JSON.parse('{"id": "m1", "lib":"Finish"}'));
  aMarkersw["m1"].addListener("mouseout", function () {
    if (imZooming) {
    }
    infoWindow["m1"].close(pMap, aMarkers["m1"]);
  });
  aMarkersw["m1"].addListener("rightclick", function () {
    closeAllinfow();
    infoWindowM["m1"].open(pMap, aMarkersw["m1"]);
  });
  //}, 500);
}); // onload

var nbMarkers = 2;
if (nbMarkers > 2) {
  parent.setTimeout(function () {
    parent.mess(
      "Markers !",
      "You have more than 2 markers defined for this route. In fact, 2.<br>Just to tell you in case.",
      "orange",
      "white"
    );
  }, 1000);
}

function closeAllinfow() {
  var aKeys = Object.keys(infoWindow);
  for (i = 0; i < aKeys.length; i++) {
    if (infoWindow[aKeys[i]]) {
      infoWindow[aKeys[i]].close();
    }
    if (infoWindowM[aKeys[i]]) {
      infoWindowM[aKeys[i]].close();
    }
  }
  //window.parent.document.getElementById('slides').style.display = 'none';
} // function

function removeLabel(e) {
  e.preventDefault();
  var key = e.target.wiId.value;

  if (key) {
    aLibs.forEach(function (element) {
      if (element.id == key) {
        element.lib = "";
      }
    });
  }

  e.target.action = "./pscripts/savemarker.php";
  e.target.mode.value = "delete";
  e.target.submit();
} //function
