(function($, window, document) {

  extendTopoJson();

  var vlc = [39.475339, -0.376703];
  var kyoto = [34.980603, 135.761296];
  var bogota = [4.608943, -74.070867];

  var leafletMap = L.map('mapid', {
      minZoom: 1,
      maxZoom: 20
    })
    .setView(vlc)
    .setZoom(13);


  var pixiContainer = new PIXI.Container(),
    ticker = new PIXI.ticker.Ticker(),
    firstDraw = true,
    prevZoom,
    frame = null,
    animation,
    factorScale,
    renderer,
    container;
  ticker.speed = 0.5;

  $(function() {

    d3.json('maps/vlc-map.json', function(error, datacoords) {
      if (error) throw error;

      var topolayer = new L.TopoJSON();
      topolayer.addData(datacoords);

      var arrGeo = [];
      for (var keys in topolayer._layers) {
        arrGeo.push(topolayer._layers[keys]._latlngs);
      }

      pixiLayer(arrGeo);

    }); //---GET DATA

  }); ///--- ON READY



  function pixiLayer(data) {

    var loader = new PIXI.loaders.Loader();
    loader.add('iris', 'assets/iris.png');

    loader.load(function(loader, resources) {

      var pixiOverlay = L.pixiOverlay(function(utils) {

          var zoom = utils.getMap().getZoom();
          container = utils.getContainer();
          renderer = utils.getRenderer();
          var project = utils.latLngToLayerPoint;
          var scale = utils.getScale();

          if (frame) {
            frame = null;
          }

          if (firstDraw) {}

          if (firstDraw && prevZoom !== zoom) {

            function Riders() {

              var numpart = data.length;
              //var numpart = 10;
              var ridersParticles = new PIXI.particles.ParticleContainer(numpart);
              container.addChild(ridersParticles);

              var starterNum = 0;

              this.val = 1;
              this.loopLength = 5;

              var counterRepeat = 0;

              var max = d3.max(data, function(d) {
                return d.length;
              });

              var ridersArr = [];
              var totalRiders = renderer instanceof PIXI.WebGLRenderer ? numpart : 1;
              var inArr = [];
              var stateArr = [];

              var wUnit = 17;
              var hUnit = 18;
              var indexStart = 1;
              var indexEnd = 24;

              

              for (var i = totalRiders; i--;) {

                var texture = new PIXI.Texture(resources.iris.texture);
                var rect1 = new PIXI.Rectangle(wUnit * (parseInt(getRnd(indexEnd, indexStart))), 0, wUnit, hUnit);
                texture.frame = rect1;

                var rider = new PIXI.Sprite(texture);

                var pos = [data[starterNum + i][0].lat, data[starterNum + i][0].lng];

                rider.anchor.set(0.5);
                rider.scale.set(1 * 0.028);
                rider.transform.position.set(project(pos).x, project(pos).y);

                //-----RIDRES ARRAYS 
                ridersArr.push(rider);
                ridersParticles.addChild(rider);



                if (counterRepeat + 1 < data[starterNum + i].length) {
                  stateArr.push(true);
                } else {
                  stateArr.push(false);
                }

              }

              this.onRepeat = function() {

                counterRepeat++;

                for (var i = totalRiders; i--;) {
                  if (counterRepeat + 1 < data[starterNum + i].length) {
                    stateArr[i] = true;

                  } else {
                    stateArr[i] = false;
                  }
                }
              };
              this.updateHandler = function(value) {


                for (var i = totalRiders; i--;) {

                  if (stateArr[i]) {

                    var pos = [data[starterNum + i][counterRepeat].lat,
                      data[starterNum + i][counterRepeat].lng
                    ];
                    ridersArr[i].transform.position.set(project(pos).x, project(pos).y);

                  }


                }
                renderer.render(container);


              }
            } //---RIDERS

            var ridersGroup = new Riders();

            function drawCity() {

              var buffer = new PIXI.Graphics();
              container.addChild(buffer);

              drawPolyline(data);

              function drawPolyline(arr) {


                buffer.lineStyle(0.095, '0x000000', 0.3);
                buffer.beginFill(0xFFFF0B, 0.0);
                buffer.blendMode = PIXI.blendModes.SCREEN;


                var polys = [];
                for (var i = arr.length; i--;) {

                  var subPolys = [];

                  arr[i].forEach(function(coords, index) {
                    subPolys.push(project(coords).x);
                    subPolys.push(project(coords).y);
                  });

                  polys.push(subPolys);


                } //---end for

                for (var i = polys.length; i--;) {
                  buffer.drawPolygon(polys[i]);
                }

              } //---FINAL DRAW POLYLINE

            }
            drawCity();




            //---ANIMATION
            ticker.speed = 0.5;
            var oldDelta = 0;
            var newDelta = 0;


            ticker.add(function(deltaTime) {

              if (ridersGroup.val > ridersGroup.loopLength) {
                ridersGroup.val = 1;
              } else {
                ridersGroup.val += 1 * deltaTime;
              }

              oldDelta = newDelta;
              newDelta = parseInt(ridersGroup.val);

              if (oldDelta !== newDelta) {

                if (ridersGroup.val > ridersGroup.loopLength) {
                  ridersGroup.onRepeat();
                }
                ridersGroup.updateHandler(newDelta);

              }

            });

          }



          if (!firstDraw && prevZoom !== zoom) {
            //console.log(zoom);
          }
          firstDraw = false;
          prevZoom = zoom;
          renderer.render(container);


        },
        pixiContainer);
      pixiOverlay.addTo(leafletMap);


    }); //---LOADER

    function render() {
      renderer.render(container);
    }


    //---STOP BUTTON
    $('#stop-animation').on('click', function() {
      $(this).hide();
      $('#play-animation').show();
      ticker.stop();

    });

    $('#play-animation').on('click', function() {
      $(this).hide();
      $('#stop-animation').show();
      ticker.start();




    }); //----PIXI OVERLAY


  } //----PIXILAYER


  function getRnd(max, min) {
    return Math.random() * (max - min) + min;
  }

  function extendTopoJson() {
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

  }


  function disableMapInteraction(map, idmap) {

    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    if (map.tap) map.tap.disable();
    document.getElementById(idmap).style.cursor = 'default';
  }

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

  function hex(r, g, b) {
    return "0x" + ((1 << 24) + (parseInt(r) << 16) + (parseInt(g) << 8) + parseInt(b)).toString(16).slice(1);
  }

}(window.jQuery, window, document));


/*---------

geo2topo countries=bogota.geojson > bogota-map.json

var inter = d3.interpolateArray([x,y],[x,y])
var pos = inArr[i](deltaTime * 0.1, deltaTime * 0.1);

ridersArr[i].transform.position.set(project(pos).x, project(pos).y);


----------------*/