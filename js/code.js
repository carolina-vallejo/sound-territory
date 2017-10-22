(function($, window, document) {

  extendTopoJson();

  /**/
  var leafletMap = L.map('mapid', {
      minZoom: 1,
      maxZoom: 20
    })
    .setView([39.475371, -0.377391], 3)
    .setZoom(13);

  var polygonLatLngs = [
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047],
    [51.509, -0.08]
  ];

  var coords, arrCoords = [];


  var graphics = new PIXI.Graphics();

  var pixiContainer = new PIXI.Container();
  pixiContainer.addChild(graphics);


  const ticker = new PIXI.ticker.Ticker();

  var width = window.innerWidth,
    height = window.innerHeight,
    active = d3.select(null);

  var projection = d3.geoMercator()
    .scale(190)
    .translate([width / 2, height / 1.6]);

  var path = d3.geoPath()
    .projection(projection);

  var firstDraw = true;
  var prevZoom;

  var frame = null;
  var count = 0;

  var animation, factorScale, renderer, container;

  var dataCoordsPixi;



  $(function() {


    //////////////////////////TOPOJSON
    var topoLayer = new L.GeoJSON();
    var topoLayer2 = new L.TopoJSON();


    d3.json('map/map-simplify.geojson', function(error, geomap) {
      if (error) throw error;



      topoLayer.addData(geomap);
      topoLayer.addTo(leafletMap);



      /**/
      d3.json('map/vlc-streets.json', function(error, datacoords) {
        if (error) throw error;

        var simplification= topojson.simplify(datacoords);

        topoLayer2.addData(datacoords);




        var arrGeo = [];
        for (var keys in topoLayer2._layers) {

          //console.log(topoLayer2._layers[keys]._latlngs); 
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
            //console.log('xxx');
            //console.log(arrCoords);

            drawPolyline(data);

            function drawPolyline(arr) {

              console.log()
              console.log(hex(0,0,0));


              var use_sprites = false; // false;

              var buffer = new PIXI.Graphics();
              
              buffer.lineStyle(0.15, '0xa02485', 0.5);
                  buffer.beginFill(0xFFFF0B, 0.0);

              if (use_sprites == false) {
                container.addChild(buffer);
              }


              console.log(arr.length);
              graphics.clear();

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
                  buffer.drawPolygon(polys[i]);
                } else {
                  var b = new PIXI.Graphics();
                  //b.lineStyle(0.5, '0xa02485');
                  //b.beginFill('none');
                  b.drawPolygon(polys[i]);
                  var tex = b.generateTexture();
                  var sprite = new PIXI.Sprite(tex);
                  sprite.position.x = polys[i][0];
                  sprite.position.y = polys[i][1];
                  container.addChild(sprite);
                }
              }



              console.log('xx');




            } //---FINAL DRAW




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


    //---STOP BUTTON
    $('#stop-animation').on('click', function() {
      //cancelAnimationFrame(animation);
      $(this).hide();
      $('#play-animation').show();
      //ticker.stop();

      //TweenMax.ticker.removeEventListener('tick', render);
    });

    $('#play-animation').on('click', function() {
      //requestAnimationFrame(animate);
      $(this).hide();
      $('#stop-animation').show();

      //  TweenMax.ticker.addEventListener('tick', render);

      //ticker.start();

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
    /* 
    The MIT License (MIT)
    Copyright (c) 2013 Ryan Clark
    */
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
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

}(window.jQuery, window, document));