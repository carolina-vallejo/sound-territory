(function($, window, document) {

  extendTopoJson();

  /**/
  var leafletMap = L.map('mapid', {
      minZoom: 1,
      maxZoom: 20
    })
    .setView([39.475339, -0.376703])
    .setZoom(13);


  var polygonLatLngs = [
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047],
    [51.509, -0.08]
  ];

  var coords, arrCoords = [];



  var pixiContainer = new PIXI.Container();



  const ticker = new PIXI.ticker.Ticker();
  ticker.speed = 0.25;

  var width = window.innerWidth,
    height = window.innerHeight,
    active = d3.select(null);

  var firstDraw = true;
  var prevZoom;

  var frame = null;
  var count = 0;

  var animation, factorScale, renderer, container;

  var dataCoordsPixi;


  var white = '#FFFFFF';
  var blue = '#60c1dc';
  var pink = '#e68fc3';
  var orange = '#f7cd83';
  var green = '#55e851';
  var violet = '#a651e8';
  var red = '#e85151';
  var yellow = '#f7e883';

  var colors = chroma
    .scale([blue, violet, pink, red, yellow, orange]).colors(10);





  $(function() {



    //////////////////////////TOPOJSON
    var topoLayer = new L.GeoJSON();
    var topoLayer2 = new L.TopoJSON();


    d3.json('data/countries-coords.json', function(error, mydata) {
      if (error) throw error;

      //console.log(mydata);

      //---OJO VER SI EL GEOJSON TIENE FEATURES

      d3.json('map/vlc-streets.json', function(error, datacoords) {
        if (error) throw error;

        //console.log(datacoords);

        topoLayer2.addData(datacoords);

        var arrGeo = [];
        for (var keys in topoLayer2._layers) {
          arrGeo.push(topoLayer2._layers[keys]._latlngs);
        }

        console.log(arrGeo)

        /*

        var vlcByLarge = d3.nest()
          .key(function(d) { 
            return parseInt(d.length); 
          })
          .sortKeys(d3.descending)
          .entries(arrGeo);
        console.log(vlcByLarge);
        */


        pixiLayer(arrGeo);


      }); //---GET DATA




    }); //---GET POLYGONS

  }); ///--- ON READY



  function pixiLayer(data) {



    //----
    var loader = new PIXI.loaders.Loader();
    loader
      .add('circle', 'circle-blue.png')
      .add('gusanito', 'gusanito.png')
      .add('line', 'line.gif')
      .add('iris', 'iris2.png');

    var blurFilter1 = new PIXI.filters.BlurFilter();

    loader.load(function(loader, resources) {

      //////console.log(resources.circle.texture);

      var pixiOverlay = L.pixiOverlay(function(utils) {

          var zoom = utils.getMap().getZoom();
          container = utils.getContainer();
          renderer = utils.getRenderer();
          var project = utils.latLngToLayerPoint;
          var scale = utils.getScale();



          if (frame) {
            frame = null;
          }

          //------
          factorScale = ((1 - scale) * 100);


          if (firstDraw) {

          }


          if (firstDraw && prevZoom !== zoom) {

            var raidersGroupContainer = new PIXI.DisplayObjectContainer();
            var mapContainer = new PIXI.DisplayObjectContainer();


            mapContainer.zIndex = 1;
            raidersGroupContainer.zIndex = 100;


            /* adding children, no matter in which order */
            container.addChild(mapContainer);
            container.addChild(raidersGroupContainer);

            var buffer = new PIXI.Graphics();

            //-----------
            var numpart = data.length;
            var ridersParticles = new PIXI.particles.ParticleContainer(numpart);
            //var ridersParticles = new PIXI.Container();

            container.addChild(ridersParticles);


            container.addChild(buffer);


            function Riders() {

              var starterNum = 0;

              this.val = 1;
              this.loopLength = 5;

              var counterRepeat = 0;


              var max = d3.max(data, function(d) {
                //console.log(d);
                return d.length;
              })

              console.log(max);


              var scale = d3.scaleLog()
                .domain([1, max])
                .range([0, 14]);

              console.log(scale(370))


              var ridersArr = [];
              var totalRiders = renderer instanceof PIXI.WebGLRenderer ? numpart : 100;
              var inArr = [];
              var stateArr = [];

              var unit = 17;

              for (var i = totalRiders; i--;) {



                //console.log( parseInt(scale(data[i].length)) + '  scale: ' + data[i].length );

                var texture = new PIXI.Texture(resources.iris.texture);
                var rect1 = new PIXI.Rectangle((17 * parseInt(getRnd(18,0))), unit, unit, 16);
                texture.frame = rect1;

                var rider = new PIXI.Sprite(texture);
                var pos = [data[starterNum + i][0].lat, data[starterNum + i][0].lng];

                rider.x = project(pos).x;
                rider.y = project(pos).y;


                rider.anchor.set(0.5);
                rider.scale.set(1 * 0.028);
                ridersArr.push(rider);


                ridersParticles.addChild(rider);


                if (counterRepeat + 1 < data[starterNum + i].length) {

                  /*
                  var eachIn = d3.interpolateArray(
                    [data[starterNum + i][counterRepeat].lat,
                      data[starterNum + i][counterRepeat].lng
                    ], [data[starterNum + i][counterRepeat + 1].lat,
                      data[starterNum + i][counterRepeat + 1].lng
                    ]);

                  inArr.push(eachIn);

                  */
                  stateArr.push(true);
                } else {
                  stateArr.push(false);
                }

              }


              console.log(inArr);




              this.onRepeat = function() {

                counterRepeat++;

                for (var i = totalRiders; i--;) {


                  if (counterRepeat + 1 < data[starterNum + i].length) {
                    stateArr[i] = true;

                    /*
                                        inArr[i] = d3.interpolateArray(
                                          [data[starterNum + i][counterRepeat].lat,
                                            data[starterNum + i][counterRepeat].lng
                                          ], [data[starterNum + i][counterRepeat + 1].lat,
                                            data[starterNum + i][counterRepeat + 1].lng
                                          ]);
                    */

                  } else {

                    stateArr[i] = false;

                  }


                }



              };
              this.updateHandler = function(value) {


                for (var i = totalRiders; i--;) {

                  if (stateArr[i]) {
                    //var pos = inArr[i](value * 0.1, value * 0.1);

                    //console.log(pos)

                    //ridersArr[i].transform.position.set(project(pos).x, project(pos).y);

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
            ticker.stop();
            var oldDelta = 0;
            var newDelta = 0;


            ticker.add(function(deltaTime) {
              ////console.log(deltaTime);

              if (ridersGroup.val > ridersGroup.loopLength) {

                ridersGroup.val = 1;



              } else {
                ridersGroup.val += 1 * deltaTime;

              }






              oldDelta = newDelta;
              newDelta = parseInt(ridersGroup.val);


              if (oldDelta !== newDelta) {
                //console.log('oldDelta: ' + oldDelta + ' newDelta: ' + newDelta)
                //console.log(ridersGroup.val)

                if (ridersGroup.val > ridersGroup.loopLength) {
                  ridersGroup.onRepeat();
                }
                ridersGroup.updateHandler(newDelta);
              }


              //console.log('ticker')



            });


            ticker.start();

          }



          if (!firstDraw && prevZoom !== zoom) {

            ////console.log('zzzz');
            //console.log(zoom);
          }
          firstDraw = false;
          prevZoom = zoom;
          renderer.render(container);

          if (renderer instanceof PIXI.CanvasRenderer) {
            ////console.log('//canvas renderer');

          } else {
            //webgl renderer
            ////console.log('//canvas webgl');
          }


        },
        pixiContainer);
      pixiOverlay.addTo(leafletMap);


    }); //---LOADER

    function render() {
      renderer.render(container);
    }


    //---STOP BUTTON
    $('#stop-animation').on('click', function() {
      //cancelAnimationFrame(animation);
      $(this).hide();
      $('#play-animation').show();
      ticker.stop();

    });

    $('#play-animation').on('click', function() {
      //requestAnimationFrame(animate);
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


  function disableInteraction(map, idmap) {

    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    if (map.tap) map.tap.disable();
    document.getElementById(idmap).style.cursor = 'default';
  }


  function animate() {

    graphics.clear();

    count += 1;
    graphics.lineStyle(0);
    graphics.beginFill(0xFFFFFF, 1);
    graphics.drawRect(coords.x + (count * factorScale), coords.y, 100 * factorScale, 100 * factorScale);
    graphics.endFill();
    renderer.render(container);
    animation = requestAnimationFrame(animate);
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