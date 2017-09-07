(function($, window, document) {

  L.TopoJSON = L.GeoJSON.extend({
    addData: function(jsonData) {
      if (jsonData.type === "Topology") {
        for (key in jsonData.objects) {
          geojson = topojson.feature(jsonData, jsonData.objects[key]);
          L.GeoJSON.prototype.addData.call(this, geojson);
        }
      } else {
        L.GeoJSON.prototype.addData.call(this, jsonData);
      }
    }
  });


  //--------- CREATE AN IMG
  /*
    var w = 2;
    var width = w,
      height = w;
    var canvas = d3.select('body')
      .append('canvas')
      .attr('id', 'canvas')
      .attr('width', width)
      .attr('height', height);

    var ctx = canvas.node().getContext('2d');

    ctx.fillStyle = 'red';
    //ctx.fillRect(0, 0, w, w);


    ctx.arc(w/2,w/2,w/2,0,2*Math.PI);
    ctx.fill();

    var canvasDom = document.getElementById("canvas");
    var dataURL = canvasDom.toDataURL();



    

    ctx.fillStyle = 'red';
    //ctx.fillRect(0, 0, w, w);

    ctx.arc(w/2,w/2,w/2,0,2*Math.PI);
    ctx.fill();

  */



  /*
    var mapLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}' + '' + '?access_token=pk.eyJ1IjoiY2Fyb2xpbmF2YWxsZWpvIiwiYSI6ImNqNGZuendsZDFmbmwycXA0eGFpejA5azUifQ._a5sIBQuS72Kw24eZgrEFw', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 15,
      id: 'mapbox.streets',
      accessToken: 'your.mapbox.access.token'
    }).addTo(map);
  */
  // create marker object, pass custom icon as option, add to map  


  var leafletMap = L.map('mapid')
    .setView([39.203343, -0.311333], 3);


  // create custom icon
  var iconMarker = L.icon({
    //iconUrl: dataURL,
    //iconSize: [w, w], // size of the icon
  });

  var layerCanvas = L.canvasLayer()
    .delegate(this) // -- if we do not inherit from L.CanvasLayer  we can setup a delegate to receive events from L.CanvasLayer
    .addTo(leafletMap);






  $(function() {

    //////////////////////////TOPOJSON
    var topoLayer = new L.TopoJSON();

    d3.json('map/map-simplify.geojson', function(error, geomap) {
      if (error) throw error;

      topoLayer.addData(geomap);
      topoLayer.addTo(leafletMap);

      d3.json('data/countries-coords.json', function(error, coords) {
        if (error) throw error;
        console.log(coords)

        coords.forEach(function(d) {

          /*

          var latitud = parseFloat(d.lat),
            longitud = parseFloat(d.lan);
          var latlng = L.latLng(latitud, longitud);

          var m = L.marker(latlng, { icon: iconMarker });
          m.addTo(leafletMap);
          */

        });


        /*

        function onDrawLayer(info) {
            var ctx = info.canvas.getContext('2d');
            ctx.clearRect(0, 0, info.canvas.width, info.canvas.height);
            ctx.fillStyle = "rgba(255,116,0, 0.2)";
            for (var i = 0; i < data.length; i++) {
                var d = data[i];
                if (info.bounds.contains([d[0], d[1]])) {
                    dot = info.layer._map.latLngToContainerPoint([d[0], d[1]]);
                    ctx.beginPath();
                    ctx.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.closePath();
                }
            }
        };

        */

        var elcanvas = d3.select('canvas');
        var ctx = elcanvas.node().getContext('2d');

          ctx.fillStyle = "rgba(255,116,0, 0.2)";

        function onDrawLayer(data) {

          //var ctx2 = info.canvas.getContext('2d');



          ctx.clearRect(0, 0, elcanvas.attr('width'), elcanvas.attr('height'));

          for (var i = 0; i < data.length; i++) {

            var d = data[i];

            //if(leafletMap.bounds.contains([parseFloat(d.lat), parseFloat(d.lan)])){

            //}

            var dot = leafletMap.latLngToContainerPoint([parseFloat(d.lat), parseFloat(d.lan)]);

            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, 10, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();




          }
        }
        onDrawLayer(coords);

        leafletMap.on('zoomend', function() {
          onDrawLayer(coords);
          //ctx.clearRect(0, 0, elcanvas.attr('width'), elcanvas.attr('height'));
        }).on('dragend', function(){
          onDrawLayer(coords);
        });

      });


    });


  });


}(window.jQuery, window, document));