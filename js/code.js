(function($, window, document) {

  extendTopoJson();

  /**/
  var leafletMap = L.map('mapid', {
      minZoom: 1,
      maxZoom: 20
    })
    .setView([39.475371, -0.377391], 3)
    .setZoom(12);


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

      console.log(mydata);

      d3.json('map/vlc-streets.json', function(error, datacoords) {
        if (error) throw error;

        var simplification = topojson.simplify(datacoords);

        topoLayer2.addData(datacoords);

        var arrGeo = [];
        for (var keys in topoLayer2._layers) {
          arrGeo.push(topoLayer2._layers[keys]._latlngs);
        }

        console.log(arrGeo)

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

      ////console.log(resources.circle.texture);

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

              console.log(polys);


              for (var i = 0; i < polys.length; i++) {
                if (use_sprites == false) {

                  //buffer.lineStyle(0.15, hex(255, 255, 255), 0.0);
                  buffer.drawPolygon(polys[i]);

                }
              }

              console.log('xx');




            } //---FINAL DRAW


            //----ANIMATED CIRCLE

            // buffer.clear();
            var circle = new PIXI.Graphics();


            circle.lineStyle(0.15, '0xa02485', 0);
            circle.beginFill(0xe91e63, 1);





            container.addChild(circle);



            for (var i = 0; i < 1; i++) {
              var pos = [data[27 + i][0].lat, data[27 + i][0].lng];
              circle.drawRect(project(pos).x, project(pos).y, 1, 1);
              circle.transform.pivot.set(project(pos).x, project(pos).y);
              circle.transform.position.set(project(pos).x, project(pos).y);

            }

            console.log(circle.transform.position);

            var counter = 0;
            var posCircle = { score: 0 };



            var glowTween = TweenMax.to(posCircle, 1, {
              score: "+=20",
              roundProps: "score",
              onUpdate: updateHandler,
              ease: Linear.easeNone,
              repeat:2, 
              onRepeat:onRepeat
            });


            function onRepeat() {

            }

            function updateHandler() {
              console.log(posCircle.score);
            }

            glowTween.eventCallback("onComplete", kill, ["param1", "param2"]);

            TweenMax.ticker.addEventListener('tick', render);



            function kill() {
              console.log('kill');
              //glowTween.kill();
              TweenMax.ticker.removeEventListener('tick', render);
            }









          }



          if (!firstDraw && prevZoom !== zoom) {

            //console.log('zzzz');
            console.log(zoom);
          }
          firstDraw = false;
          prevZoom = zoom;
          renderer.render(container);

          if (renderer instanceof PIXI.CanvasRenderer) {
            //console.log('//canvas renderer');

          } else {
            //webgl renderer
            //console.log('//canvas webgl');
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

      TweenMax.ticker.removeEventListener('tick', render);
    });

    $('#play-animation').on('click', function() {
      //requestAnimationFrame(animate);
      $(this).hide();
      $('#stop-animation').show();

      TweenMax.ticker.addEventListener('tick', render);


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