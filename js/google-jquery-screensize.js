jQuery(window)
  .resize(function () {
    var height = jQuery(parent.window).height();
    $("#plan-map").height(height - 0);
  })
  .trigger("resize");

jQuery(document).ready(function () {
  //$('.gm-control-active').mouseover(function(){console.log('overZoom');});
});

function addLabel(lat, lng, label, iId, mvis) {
  var mapLabel = new MapLabel({
    text: label,
    position: new google.maps.LatLng(lat, lng),
    map: pMap,
    fontSize: 14,
    align: "center" /*(mvis==0?'left': 'center'),*/,
    minZoom: 1,
    maxZoom: 8,
    id: mvis == 0 ? iId : "",
    zIndex: 0,
  });

  aMapLabels[iId] = mapLabel;
} // function

// fupdshape
function updShape(aidx, sId, jStr, action, wtype, radius, event) {
  var id = sId;

  if (parent.isCommited) {
    parent.isCommited = false;
  }

  if (action == "del" && sId) {
    saveRoute(sId, jStr, action, wtype, radius);
    return;
  }

  if (aShapes.length > 0) {
    $("#undobtn").prop("disabled", false);
  }

  if (aidx) {
    google.maps.event.addListener(aShapes[aidx], "rightclick", function () {
      if (confirm("Do you want to remove this line ?")) {
        updShape(id, "", "del", "", "", null);
        aShapes[aidx].setMap(null);
      }
    });

    google.maps.event.addListener(aShapes[aidx], "mouseover", function () {
      aShapes[aidx].setOptions({ strokeWeight: 5 });
    });

    google.maps.event.addListener(aShapes[aidx], "mouseout", function () {
      aShapes[aidx].setOptions({ strokeWeight: 3 });
    });
  } // aidx
} // function

function saveRoute(sId, jStr, action, wtype, radius) {
  $("body").css("cursor", "progress");

  var o = { poly: jStr };

  var jStr1 = "";
  if (wtype != "POLYLINE") {
    jStr1 = jStr;
  }

  $.ajax({
    dataType: "text",
    type: "POST",
    data: o,
    async: true,
    url:
      "pscripts/updShape.php?id=" +
      sId +
      "&type=" +
      wtype +
      "&action=" +
      action +
      "&map=40057&bounds=" +
      jStr1 +
      "&radius=" +
      radius,
    success: function (retres) {
      if (action == "add" && retres && wtype == "POLYLINE") {
        //console.log('retres :',retres);return;
        parent.toggleit = false;
        parent.mess(
          "Route saved",
          "Your route was successfully saved <br> with " + retres,
          "green",
          "white"
        );
        parent.enableButtons(false);
        parent.toggleit = true;

        return;

        justCreated = JSON.parse(retres);
        justCreated.forEach(function (element) {
          var cpath = eval(
            "[" + element.position.start + ", " + element.position.end + "]"
          );
          var id = element.id;

          var rect = new google.maps.Polyline({
            id: id,
            map: pMap,
            path: cpath,
            fillColor: "#0039e6",
            strokeColor: "#0039e6",
            fillOpacity: 1,
            strokeWeight: 3,
            clickable: true,
            editable: false,
            zindex: 1,
          });
          aShapes[id] = rect;

          google.maps.event.addListener(aShapes[id], "rightclick", function () {
            if (confirm("Do you want to remove this line ?")) {
              updShape(id, "", "del", "", "", null);
              aShapes[id].setMap(null);
            }
          });

          google.maps.event.addListener(aShapes[id], "mouseover", function () {
            aShapes[id].setOptions({ strokeWeight: 8 });
          });

          google.maps.event.addListener(aShapes[id], "mouseout", function () {
            aShapes[id].setOptions({ strokeWeight: 3 });
          });
        });

        //console.log(cnt);
      } // polyline

      if (action == "add" && retres && wtype == "CIRCLE") {
        aShapes[sId].id = retres;
        console.log(sId, retres);

        google.maps.event.addListener(aShapes[sId], "rightclick", function () {
          if (confirm("Do you want to remove this shape ?")) {
            updShape(sId, aShapes[sId].id, "", "del", "", "", null);
            aShapes[sId].setMap(null);
          }
        });
      }

      if (action == "del") {
        console.log("deleted sId:", sId, " retres: ", retres);
      }

      return true;
    }, // success
  }); // ajax
} // function

var aPoly = new Array();
function updateLines() {
  aPoly = new Array();
  var jStr;
  var aPath;
  for (i = 0; i < aShapes.length; i++) {
    jStr = "[";
    if (!aShapes[i].center) {
      aPath = aShapes[i].getPath().getArray();
      for (j = 0; j < aPath.length; j++) {
        jStr += JSON.stringify(aPath[j]) + (j < aPath.length - 1 ? ", " : "");
      }
      jStr += "]";
      aPoly.push(jStr);
    }
    //
  }

  saveRoute(null, aPoly, "add", "POLYLINE", 0);
} // function

// show pictures/slides
function currentDiv(e, mode) {
  var i;
  var dots = document.getElementsByClassName("demo");

  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" w3-border-red", "");
  }

  //var rdiv = window.parent.document.getElementById('slides');

  if (mode == 0) {
    rdiv.style.display = "none";
    return;
  }

  var isrc = e.target.src;
  e.target.className += " w3-border-red";
  window.parent.document.getElementById("cimg").src = isrc;
  rdiv.style.display = "block";
} // function

function setAimages(iId) {
  window.parent.aImages = aAimages[iId];
}

setMapDim();
function setMapDim() {
  return;
  $("#plan-map").css("width", $("#dimap").css("width"));
  $("#plan-map").css("height", $("#dimap").css("height"));
  parent.document.getElementById("imapuser").style.height =
    $("#dimap").css("height");
}

function getMicon(e) {
  e.preventDefault();
  var mf = e.currentTarget;
  var btn = $(mf).find("input[type=submit]:focus");

  var lib = $("#sname").val();
  var mid = aMarkers[mf.wiId.value].id;

  for (i = 0; i < aLibs.length; i++) {
    if (aLibs[i].id == mid) {
      aLibs[i].lib = lib;
    }
  }

  for (i = 0; i < aLibs.length; i++) {
    if (aLibs[i].lib == lib && aLibs[i].id != mid) {
      parent.mess(
        "Error",
        'The label "<b>' +
          lib +
          '</b>" already exists.<br>Please, enter a different label.',
        "orange",
        "black"
      );
      //return;
    }
  }

  if (aLibs[aLibs.length - 1].lib == "") {
    aLibs[aLibs.length - 1].lib = lib;
  }
  var cicon = aMarkers[mf.wiId.value].icon;
  if (typeof cicon == "object") {
    cicon = aMarkers[mf.wiId.value].icon.url;
  }

  $("#wIcon").val(cicon);
  $("#wZoom").val(oMap.zoom);
  mf.action = "./pscripts/savemarker.php";
  mf.submit();
  //var wm = aMarkers[mf.wiId.value];
  //wm.setLabel({text: $('#sname').val().substr(0, 1), fontSize: '12px', fontWeight: 'bold'});
  /*
  var cicon = wm.icon;
  if(typeof cicon == 'object'){cicon = wm.icon.url;}
              if(cicon){
              if(cicon.indexOf('pink')>0){
              wm.setIcon({url: './img/grn-blank.png', scaleSize: new google.maps.Size(50, 50), labelOrigin: new google.maps.Point(33, 20)});
              }else{
              wm.setIcon({url: './img/pink-blank.png', scaleSize: new google.maps.Size(50, 50), labelOrigin: new google.maps.Point(33, 20)});
              }
              }else{
              wm.setIcon({url: './img/grn-blank.png', scaleSize: new google.maps.Size(50, 50), labelOrigin: new google.maps.Point(33, 20)});
              }
              if(cicon){
              document.getElementById("wIcon").value = wm.getIcon().url;
              }
  */

  //var im = new google.maps.InfoWindow({content: htmlContent});
  //wm.infowindow = im;
  //aMarkers[mf.wiId.value]=new google.maps.Marker({position: mLatlng, map: pMap, title: '$title', id: iId, label:{text: '$ltitle', fontSize: '16px', fontWeight: 'bold'}, icon: {url:'$wIcon', scaleSize: new google.maps.Size(50, 50), labelOrigin: new google.maps.Point(33, 20)}});
}

function goHome() {
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
  imZooming = true;
  oMap.setZoom(7);
  oMap.setCenter(new google.maps.LatLng(lat1, lng1));
  //setTimeout(function(){oMap.setCenter(new google.maps.LatLng(3.46615, -40.686682));imZooming=true;}, 300);
}

function fixHome() {
  imZooming = true;
  if (
    !confirm(
      "Are you sure you want to fix the actual zoom level for this route?"
    )
  ) {
    return;
  }
  if (!parent.cur_route) {
    parent.mess("Error", "Route could not be identified", "orange", "white");
    return;
  }
  document.getElementById("fgfrm").src =
    "./pscripts/fixHome?project=" + parent.cur_route + "&zoom=" + pMap.zoom;
}

function fgSetOpacity(ws) {
  var pmap = document.getElementById("plan-map");
  var o =
    pmap.childNodes[0].childNodes[0].childNodes[0].childNodes[0].style.opacity *
    1;
  o = o == 0 ? 1 : o;
  if (ws == "+" && o < 1) {
    pmap.childNodes[0].childNodes[0].childNodes[0].childNodes[0].style.opacity =
      Math.min(o + 0.1, 1);
  } else {
    pmap.childNodes[0].childNodes[0].childNodes[0].childNodes[0].style.opacity =
      Math.max(o - 0.1, 0.1);
  }

  var sweight = 1;
  if (o < 1) {
    sweight = 3;
  }
  aShapes.forEach(function (element) {
    if (element.id) {
      var rect = new google.maps.Polyline({
        id: element.id,
        map: element.map,
        path: element.getPath(),
        fillColor: "#ffffde",
        strokeColor: "#AA0000",
        fillOpacity: 1,
        strokeWeight: sweight,
        clickable: true,
        editable: false,
        zindex: 100,
      });
      aShapes[element.id].setMap(null);
      aShapes[element.id] = rect;

      google.maps.event.addListener(
        aShapes[element.id],
        "rightclick",
        function () {
          if (confirm("Do you want to remove this line ?")) {
            updShape(element.id, "", "del", "", "", null);
            aShapes[element.id].setMap(null);
          }
        }
      );

      google.maps.event.addListener(
        aShapes[element.id],
        "mouseover",
        function () {
          aShapes[element.id].setOptions({ strokeWeight: 8 });
        }
      );

      google.maps.event.addListener(
        aShapes[element.id],
        "mouseout",
        function () {
          aShapes[element.id].setOptions({ strokeWeight: 3 });
        }
      );
    } // id
  });
} // function

function clearLine() {
  if (confirm("Do you want to remove this route ?")) {
    /*
     for(i=aShapes.length-1;i>=0;i--){
     if(aShapes[i]){
     //updShape(aShapes[i], '', 'del', '', '', null);
     aShapes[i].setMap(null);
     aShapes.splice(i, 1);
     }
     };
     */

    while (aShapes.length > 0) {
      undoLine();
    }

    if (directionsDisplay) {
      directionsDisplay.setMap(null);
    }
    //aShapes = new Array();
    aLines = new Array();
    var lib = $("#stdbtn").html();
    if (lib == "Stop drawing") {
      setStyleStart();
    }
    parent.isCommited = true;
  }
} // function

function undoLine() {
  if (aShapes.length == 0) {
    setStyleStart();
    $("#undobtn").prop("disabled", true);
    return;
  }

  var it = aShapes.pop();
  if (it && !it.center) {
    newStart = eval(JSON.stringify(it.getPath().getArray()));
    var newP =
      '{"lat": ' + newStart[0].lat + ', "lng":' + newStart[0].lng + "}";
    aLines = new Array();
    aLines.push(newP);
    it.setMap(null);
    updShape(null, it.id, "", "del", "", "", null);
  }

  if (it && it.center) {
    it.setMap(null);
    updShape(null, it.id, "", "del", "", "", null);
  }

  if (aShapes.length == 0) {
    $("#undobtn").prop("disabled", true);
    if ($("#stdbtn").html() == "Stop drawing") {
      //parent.mess('Warning', 'Exiting drawing mode.', 'orange', 'white');
    }
    setStyleStart();
  }

  if (etouch) {
    imZooming = true;
  }
} // function

function startD(e) {
  if (e.target.innerText == "Start drawing") {
    e.target.innerText = "Stop drawing";
    e.target.style.color = "black";
    e.target.style.fontWeight = "bold";
    e.target.style.background = "orange";
    imZooming = true;
    prev_state = imZooming;
    bdActive = true;
  } else {
    setStyleStart();

    aShapes.forEach(function (element) {
      if (element) {
        element.setOptions({ strokeColor: "#AA0000" });
      }
    });
    updateLines();
  }
  aLines = new Array();
  imPanning = false;
  // parent.pauseSession(false);
} // function

function setStyleStart() {
  $("#stdbtn").html("Start drawing");
  $("#stdbtn").css("color", "white");
  $("#stdbtn").css("font-weight", "normal");
  $("#stdbtn").css("background", "green");
  imZooming = false;
  prev_state = imZooming;
  bdActive = false;
}

var etouch = false;
google.maps.event.addDomListener(window, "touchend", function () {
  etouch = true;
  if (bdActive && imZooming && !imPanning && event.target.tagName != "BUTTON") {
    var el = event.target;
    if (event.target.tagName == "IMG") {
      if (
        !event.target.parentElement.parentElement.parentElement.parentElement
      ) {
        return;
      }
      el = event.target.parentElement.parentElement.parentElement.parentElement;
    }

    offset = el.getClientRects()[0];
    var x = event.changedTouches[0].clientX - offset.left;
    var y = event.changedTouches[0].clientY - offset.top;

    var topRight = oMap
      .getProjection()
      .fromLatLngToPoint(oMap.getBounds().getNorthEast());
    var bottomLeft = oMap
      .getProjection()
      .fromLatLngToPoint(oMap.getBounds().getSouthWest());
    var scale = Math.pow(2, oMap.getZoom());
    var worldPoint = new google.maps.Point(
      x / scale + bottomLeft.x,
      y / scale + topRight.y
    );

    var point = JSON.stringify(
      oMap.getProjection().fromPointToLatLng(worldPoint)
    );
    aLines.push(point);

    if (aLines.length == 2) {
      cpath = eval("[" + aLines[0] + ", " + aLines[1] + "]");
      var rect = new google.maps.Polyline({
        id: "",
        map: pMap,
        path: cpath,
        fillColor: "#0039e6",
        strokeColor: "#0039e6",
        fillOpacity: 1,
        strokeWeight: 3,
        clickable: true,
        editable: false,
        zindex: 1,
      });
      var sId = aShapes.push(rect) - 1;
      aShapes[sId].id = null;

      updShape(
        sId,
        null,
        "[" + aLines[0] + ", " + aLines[1] + "]",
        "add",
        "POLYLINE",
        0,
        null
      );
      var prev_start = aLines[1];
      aLines = new Array();
      aLines.push(prev_start);
    }
  } // imZooming ok?
  imPanning = false;
});

google.maps.event.addDomListener(
  document.getElementById("stdbtn"),
  "click",
  function () {
    var lib = $("#stdbtn").html();
    if (lib == "Start drawing") {
      drawingManager.setDrawingMode(null);
    }
  }
);

var cnt = 0;
var aLines = new Array();
google.maps.event.addDomListener(window, "mouseup", function (event) {
  if (bdActive && imZooming && !imPanning && event.target.tagName != "BUTTON") {
    var el = event.target;
    if (event.target.tagName == "IMG") {
      if (
        !event.target.parentElement.parentElement.parentElement.parentElement
      ) {
        return;
      }
      el = event.target.parentElement.parentElement.parentElement.parentElement;
    }

    offset = el.getClientRects()[0];
    var x = event.clientX - offset.left;
    var y = event.clientY - offset.top;

    var topRight = oMap
      .getProjection()
      .fromLatLngToPoint(oMap.getBounds().getNorthEast());
    var bottomLeft = oMap
      .getProjection()
      .fromLatLngToPoint(oMap.getBounds().getSouthWest());
    var scale = Math.pow(2, oMap.getZoom());
    var worldPoint = new google.maps.Point(
      x / scale + bottomLeft.x,
      y / scale + topRight.y
    );

    var point = JSON.stringify(
      oMap.getProjection().fromPointToLatLng(worldPoint)
    );
    aLines.push(point);

    if (aLines.length == 2) {
      cpath = eval("[" + aLines[0] + ", " + aLines[1] + "]");
      var rect = new google.maps.Polyline({
        id: "",
        map: pMap,
        path: cpath,
        fillColor: "#0987FC",
        strokeColor: "#0987FC",
        fillOpacity: 1,
        strokeWeight: 5,
        clickable: true,
        editable: false,
        zindex: 1,
      });
      var sId = aShapes.push(rect) - 1;
      aShapes[sId].id = null;

      updShape(
        sId,
        null,
        "[" + aLines[0] + ", " + aLines[1] + "]",
        "add",
        "POLYLINE",
        0,
        null
      );
      var prev_start = aLines[1];
      aLines = new Array();
      aLines.push(prev_start);
    }
  } // imZooming ok?
  imPanning = false;
});

setTimeout(delayEl, 1000);
function delayEl() {
  var noprintable = document.getElementsByClassName("gmnoprint");
  for (i = 0; i < noprintable.length; i++) {
    noprintable[i].addEventListener("mouseover", function () {
      prev_state = imZooming;
      imZooming = true;
      imPanning = true;
    });
    noprintable[i].addEventListener("mouseout", function () {
      imZooming = prev_state;
      imPanning = false;
    });
  }
}

var directionsDisplay;
function askForDirections(wstart, wend) {
  var directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer({
    map: pMap,
    suppressMarkers: true,
    polylineOptions: {
      fillColor: "#cccc00",
      strokeColor: "#ffff00",
      fillOpacity: 1,
      strokeWeight: 5,
    },
  });

  directionsService.route(
    {
      origin: wstart,
      destination: wend,
      travelMode: "DRIVING",
    },
    function (response, status) {
      if (status === "OK") {
        directionsDisplay.setDirections(response);
      } else {
        var mbody = "Directions request failed due to " + status;
        if (status == "NOT_FOUND") {
          mbody =
            "Sorry, but could not find location.<br>Maybe it needs to be more specific.";
        }
        parent.mess("Ooops!", mbody, "orange", "white");
      }
    }
  );
  imZooming = false;
  imPanning = false;
} // functions

function animateRoute() {
  hideRoute();
  setTimeout(animate, 100);
}

function hideRoute() {
  for (i = 0; i < aShapes.length; i++) {
    var it = aShapes[i];
    if (it && !it.center) {
      it.setMap(null);
    }
  }
} // function

var offsetT = 25;
var segmentNo = 0;
function animate() {
  if (segmentNo == aShapes.length) {
    segmentNo = 0;
    return;
  }

  if (aShapes[segmentNo] && !aShapes[segmentNo].center) {
    setTimeout(setShapeOn, offsetT);
    //offsetT += offsetT;
  }
} // function

function setShapeOn() {
  aShapes[segmentNo].setMap(oMap);
  segmentNo++;
  animate();
}

var aGridObjs = new Array();
function straightLine() {
  if (aGridObjs.length == 0) {
    var aKeys = Object.keys(aMarkersw);
    var jObj = "[";
    var stColor = "#000000";
    for (i = 0; i < aKeys.length; i++) {
      jObj += JSON.stringify(aMarkersw[aKeys[i]].position) + ", ";
    }
    jObj = eval(jObj.substr(0, jObj.length - 2) + "]");
    var rect = new google.maps.Polyline({
      id: "",
      map: pMap,
      path: jObj,
      fillColor: "#ffffde",
      strokeColor: stColor,
      fillOpacity: 1,
      strokeWeight: 1,
      clickable: false,
      editable: false,
      zindex: 1,
    });
    aGridObjs.push(rect);
    var avgLat = (jObj[0].lat + jObj[1].lat) / 2;
    var avgLng = (jObj[0].lng + jObj[1].lng) / 2;
    jObj = { lat: avgLat, lng: avgLng };
    var distance = google.maps.geometry.spherical.computeDistanceBetween(
      aMarkersw["m0"].getPosition(),
      aMarkersw["m1"].getPosition()
    );
    radius = (distance * 1.1) / 2; // give it 10% more
    var decr = radius / 5;

    rect = new google.maps.Circle({
      id: "",
      map: pMap,
      center: jObj,
      radius: radius,
      fillColor: "#ffffde",
      strokeColor: stColor,
      fillOpacity: 0,
      strokeWeight: 1,
      clickable: true,
      editable: false,
      zindex: 1,
    });
    aGridObjs.push(rect);
    radius -= decr;
    rect = new google.maps.Circle({
      id: "",
      map: pMap,
      center: jObj,
      radius: radius,
      fillColor: "#ffffde",
      strokeColor: stColor,
      fillOpacity: 0,
      strokeWeight: 1,
      clickable: true,
      editable: false,
      zindex: 1,
    });
    aGridObjs.push(rect);
    radius -= decr;
    rect = new google.maps.Circle({
      id: "",
      map: pMap,
      center: jObj,
      radius: radius,
      fillColor: "#ffffde",
      strokeColor: stColor,
      fillOpacity: 0,
      strokeWeight: 1,
      clickable: true,
      editable: false,
      zindex: 1,
    });
    aGridObjs.push(rect);
    radius -= decr;
    rect = new google.maps.Circle({
      id: "",
      map: pMap,
      center: jObj,
      radius: radius,
      fillColor: "#ffffde",
      strokeColor: stColor,
      fillOpacity: 0,
      strokeWeight: 1,
      clickable: true,
      editable: false,
      zindex: 1,
    });
    aGridObjs.push(rect);
    radius -= decr;
    rect = new google.maps.Circle({
      id: "",
      map: pMap,
      center: jObj,
      radius: radius,
      fillColor: "#ffffde",
      strokeColor: stColor,
      fillOpacity: 0,
      strokeWeight: 1,
      clickable: true,
      editable: false,
      zindex: 1,
    });
    aGridObjs.push(rect);
    radius -= decr;
  } else {
    while ((it = aGridObjs.pop())) {
      it.setMap(null);
    }
  }
} // function

function getNormalizedCoord(coord, zoom) {
  var y = coord.y;
  var x = coord.x;

  // tile range in one direction range is dependent on zoom level
  // 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
  var tileRange = 1 << zoom;

  // don't repeat across y-axis (vertically)
  if (y < 0 || y >= tileRange) {
    return null;
  }

  // repeat across x-axis
  if (x < 0 || x >= tileRange) {
    x = ((x % tileRange) + tileRange) % tileRange;
  }

  return { x: x, y: y };
}
