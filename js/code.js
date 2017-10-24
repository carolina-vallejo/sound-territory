(function($, window, document) {

  extendTopoJson();

  /**/
  var leafletMap = L.map('mapid', {
      minZoom: 1,
      maxZoom: 20
    })
    .setView([39.4351171, -0.3138474])
    .setZoom(14);


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

      d3.json('map/vlc-streets.json', function(error, datacoords) {
        if (error) throw error;

        var simplification = topojson.simplify(datacoords);

        topoLayer2.addData(datacoords);

        var arrGeo = [];
        for (var keys in topoLayer2._layers) {
          arrGeo.push(topoLayer2._layers[keys]._latlngs);
        }

        //console.log(arrGeo)

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


            var buffer = new PIXI.Graphics();

            var use_sprites = false; // false;
            if (use_sprites == false) {
              container.addChild(buffer);
            }

            drawPolyline(data);

            function drawPolyline(arr) {




              buffer.lineStyle(0.15, '0xFFFFFF', 0.2);
              buffer.beginFill(0xFFFF0B, 0.0);


              var polys = [];
              for (var i = 0; i < arr.length; i++) {

                var subPolys = [];

                arr[i].forEach(function(coords, index) {
                  subPolys.push(project(coords).x);
                  subPolys.push(project(coords).y);
                });

                polys.push(subPolys);


              } //---end for

              //console.log(polys);


              for (var i = 0; i < polys.length; i++) {
                if (use_sprites == false) {

                  //buffer.lineStyle(0.15, hex(255, 255, 255), 0.0);
                  buffer.drawPolygon(polys[i]);

                }
              }

              //console.log('xx');




            } //---FINAL DRAW


            //--METER PARTICLES!

            ////..........PARTICLES
            /*
            var numpart = 1;
            var sprites = new PIXI.particles.ParticleContainer(numpart, {
              scale: true,
              position: true,
              rotation: true,
              uvs: true,
              alpha: true
            });

            container.addChild(sprites);

            var maggots = [];
            var totalSprites = renderer instanceof PIXI.WebGLRenderer ? numpart : 1;

            for (var i = 0; i < totalSprites; i++) {

              var dude = new PIXI.Sprite(resources.circle.texture);



              var pos = [data[27 + i][0].lat, data[27 + i][0].lng];

              dude.x = project(pos).x;
              dude.y = project(pos).y;

              dude.anchor.set(0.5);

              dude.scale.set(1 * 0.01);


              maggots.push(dude);


              sprites.addChild(dude);

            }
*/
            //---------------


            var markerSprite = new PIXI.Sprite(resources.circle.texture);

            for (var i = 0; i < 1; i++) {
              var pos = [data[27 + i][0].lat, data[27 + i][0].lng];

              markerSprite.x = project(pos).x;
              markerSprite.y = project(pos).y;
              markerSprite.anchor.set(0.5);
              markerSprite.scale.set(1 * 0.03);


            }


            // markerSprite.scale = 1000 * factorScale;



            //markerSprite.on('pointerdown', onClick);

            container.addChild(markerSprite);



            var counter = 0;
            var posCircle = { score: 0 };
            //---ANIMATION
            ticker.speed = 0.5;

            ticker.stop();

            var val = 1;
            var loopLength = 10;

            ticker.add(function(deltaTime) {
              ////console.log(deltaTime);
              if (val > loopLength) {

                val = 1;
                onRepeat();


              } else {
                val += 1 * deltaTime;

              }

              updateHandler(parseInt(val));



              renderer.render(container);
            });


            ticker.start();






            var counterRepeat = 0;


            var i = d3.interpolateArray(
              [data[27][counterRepeat].lat,
                data[27][counterRepeat].lng
              ], [data[27][counterRepeat + 1].lat,
                data[27][counterRepeat + 1].lng
              ]);


            function onRepeat() {



              counterRepeat++;
              //console.log('counterRepeat: ' + counterRepeat)

              i = d3.interpolateArray(
                [data[27][counterRepeat].lat,
                  data[27][counterRepeat].lng
                ], [data[27][counterRepeat + 1].lat,
                  data[27][counterRepeat + 1].lng
                ]);



            }





            function updateHandler(value) {
              //console.log(value);

              var pos = i(value * 0.1, value * 0.1);
              markerSprite.transform.position.set(project(pos).x, project(pos).y);

              counter++;

            }



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