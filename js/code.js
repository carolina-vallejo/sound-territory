(function($, window, document) {


  var leafletMap = L.map('mapid')
    .setView([39.203343, -0.311333], 3);

  //drawTilesMap(leafletMap);  

  var layerCanvas = L.canvasLayer()
    .delegate(this)
    .addTo(leafletMap);

  $(function() {

    //////////////////////////TOPOJSON
    var topoLayer = new L.GeoJSON();

    d3.json('map/map-simplify.geojson', function(error, geomap) {
      if (error) throw error;

      topoLayer.addData(geomap);
      topoLayer.addTo(leafletMap);

      d3.json('data/countries-coords.json', function(error, coords) {
        if (error) throw error;


        function onDrawLayer(data, obj) {

          data.forEach(function(d) {

            var dot = leafletMap.latLngToContainerPoint([parseFloat(d.lat), parseFloat(d.lan)]);

            ctx.strokeStyle = 'red';
            //ctx.filter = 'blur(' + 2 + 'px)';

            ctx.beginPath();
            ctx.arc(dot.x, dot.y, getRnd(10, 0), 0, 2 * Math.PI);
            ctx.stroke();
            ctx.closePath();

          });


        }
        //onDrawLayer(coords);

        var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
          window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
        var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

        var fps, fpsInterval, startTime, now, then, elapsed, time = 500;
        var animation;

        startAnimating(8);

        function startAnimating(fps) {
          fpsInterval = time / fps;
          then = Date.now();
          startTime = then;
          animate();
        }

        //---STOP BUTTON
        $('#stop-animation').on('click', function() {
          cancelAnimationFrame(animation);
          $(this).hide();
          $('#play-animation').show();
        });

        $('#play-animation').on('click', function() {
          startAnimating(5);
          $(this).hide();
          $('#stop-animation').show();
        });

        function animate(par) {
          animation = requestAnimationFrame(animate);

          now = Date.now();
          elapsed = now - then;

          if (elapsed > fpsInterval) {
            then = now - (elapsed % fpsInterval);

            /*--STUFF ANIMATED--*/
            draw();
          }
        }

        //---ANIMATION


        var x = 0.75;
        var elcanvas = d3.select('canvas');
        var ctx = elcanvas.node().getContext('2d');
        ctx.globalCompositeOperation = 'source-over';

        function draw() {


          ctx.clearRect(0, 0, elcanvas.attr('width'), elcanvas.attr('height')); // clear canvas

          //ctx.fillStyle = 'red';
          ctx.save();
          var rand = getRnd(20, 1);

          onDrawLayer(coords, { rand: rand });

          ctx.restore(); // siempre despues de save

          x += 0.75;


          //window.requestAnimationFrame(draw);
        }

        //init();

      });


    });


  }); ///--- ON READY

  function drawTilesMap(map) {
    var mapLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}' + '' + '?access_token=pk.eyJ1IjoiY2Fyb2xpbmF2YWxsZWpvIiwiYSI6ImNqNGZuendsZDFmbmwycXA0eGFpejA5azUifQ._a5sIBQuS72Kw24eZgrEFw', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 15,
      id: 'mapbox.streets',
      accessToken: 'pk.eyJ1IjoiY2Fyb2xpbmF2YWxsZWpvIiwiYSI6ImNqNGZuendsZDFmbmwycXA0eGFpejA5azUifQ._a5sIBQuS72Kw24eZgrEFw'
    }).addTo(map);
  }

  function getRnd(max, min) {
    return Math.random() * (max - min) + min;
  }

}(window.jQuery, window, document));