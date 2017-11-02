(function($, window, document) {

  extendTopoJson();

  var vlc = [39.475339, -0.376703];
  var kyoto = [34.980603, 135.761296];
  var bogota = [4.608943, -74.070867];

  var initZoom = 13;

  var leafletMap = L.map('mapid', {
      minZoom: 1,
      maxZoom: 20,
    })
    .setView(vlc)
    .setZoom(initZoom)
    .on('zoomend', function(e) {
      var latlng = L.latLng(vlc[0], vlc[1]);
      var pointlatlng = leafletMap.latLngToLayerPoint(latlng);


      updatesvg();

    });
  //drawTilesMap(leafletMap);
  //--create svg layer
  var myRenderer = L.svg({ padding: 0 });
  myRenderer.addTo(leafletMap);

  var pixiContainer = new PIXI.Container(),
    firstDraw = true,
    prevZoom,
    frame = null,
    animation,
    factorScale,
    renderer,
    container;

  const ticker = new PIXI.ticker.Ticker();;

  var routeArr = [];
  //--ARR FOR DRAW CITY
  var arrGeo = [];
  var arrRandom = [];

  var markersContainer;

  $(function() {

    d3.json('maps/vlc-map.json', function(error, datacoords) {
      if (error) throw error;











      //crear random de coords unas 40 y guardarlas local, conectar recorridos
      var url_ = 'data.php?coordinates=-0.323168,39.465528|-0.368039,39.478622';
      var url = 'data/route2.json';

      d3.json(url, function(error, dataroute) {
        if (error) throw error;


        var topolayer = new L.TopoJSON();
        topolayer.addData(datacoords);



        for (var keys in topolayer._layers) {
          arrGeo.push(topolayer._layers[keys]._latlngs);
          //parseInt(getRnd(1, 500)) === 1 && arrRandom.push(topolayer._layers[keys]._latlngs);
        }


        //--ARR FOR ROUTES
        var arrGeoRoute = [];

        for (var i = dataroute.routes[0].geometry.coordinates.length; i--;) {

          arrGeoRoute.push({
            lat: dataroute.routes[0].geometry.coordinates[i][1],
            lng: dataroute.routes[0].geometry.coordinates[i][0]
          });
        }
        console.log([arrGeoRoute][0][0]);
        arrRandom.push([[arrGeoRoute][0][0]])
        pixiLayer(arrGeo, [arrGeoRoute]);

        console.log(arrRandom);



      }); //---GET DATA
    }); //---ROUTE
  }); ///--- ON READY

  //----MARKERS
  var icon_w = 12;
  var wPop = 260;
  var popOtions = {
    closeOnClick: false,
    autoClose: false,
    offset: new L.Point(wPop / 2, icon_w + 10),
    minWidth: wPop,
    maxWidth: wPop,
    keepInView: false
  };
  var localIcon = L.Icon.extend({
    options: {
      iconSize: [icon_w, icon_w],
      iconAnchor: [(icon_w / 2), (icon_w)],
      popupAnchor: [0, 0]
    }
  });

  markerIcon = new localIcon({ iconUrl: 'assets/marker.svg' });
  var markers = L.layerGroup();
  leafletMap.addLayer(markers);

  var perspective = 680;
  var strTrans = 'translate3d(0,-60px,140px) rotateX(50deg) rotateZ(-30deg)';
  var strUnTrans = 'rotateZ(30deg) rotateX(-50deg)';



  function updatesvg() {


    for (var i = arrRandom.length; i--;) {
      var latlng = L.latLng(arrRandom[i][0].lat, arrRandom[i][0].lng);

      var factor = leafletMap.getZoom() - initZoom !== 0 ?
        (leafletMap.getZoom() > initZoom ?
          (leafletMap.getZoom() - initZoom) + 1 : 1
        ) : 1;

      console.log(leafletMap.getZoom() + ' initZoom ' + initZoom);
      console.log('factor: ' + factor);

      var pointlatlng = leafletMap.latLngToLayerPoint(latlng);
      d3.select('#barra-' + i)
        .styles({
          'transform': 'translate3d(' + pointlatlng.x + 'px,' + pointlatlng.y + 'px, 0px) ' + strUnTrans,
        })

    }



  }
  var counterBarras = 0;






  function markerConstructor(dataMarker) {

    var latlng = L.latLng(dataMarker[0], dataMarker[1]);
    var pointlatlng = leafletMap.latLngToLayerPoint(latlng);

    console.log(latlng)
    var m = new L.Marker(latlng, { icon: markerIcon });
    markers.addLayer(m);


    var h_ = getRnd(10, 200);
    var h = 100;

      var strs = transformCanvas.substring(transformCanvas.indexOf('(') + 1, transformCanvas.indexOf(')'));

      var invertedTrans = 'translate3d(';
      for(var i = 0; i < strs.split(', ').length; i++){
        var val = parseInt(strs.split(', ')[i].replace('px', ''));
        invertedTrans += (val * -1) + (i === strs.split(', ').length - 1 ? '' : 'px, ');
      }

      invertedTrans += ')';
    


    markersContainer
      .append('div')
      .attrs({
        id: 'barra-' + counterBarras
      })
      .styles({
        'margin-left': '-1px',
        'margin-top': '-120px',
        'width': '1px',
        'height': '120px',
        'background': 'red',
        'transform': 'translate3d(' + pointlatlng.x + 'px,' + pointlatlng.y + 'px, 0px) ' + strUnTrans,
        'transform-origin': 'center bottom'
      })



      console.log(invertedTrans);



    counterBarras++;


  }

  function pixiLayer(data, routeData) {

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


            d3.select('.leaflet-overlay-pane')
              .styles({
                'perspective': perspective + 'px',
                '-moz-perspective': perspective + 'px',
                '-webkit-perspective': perspective + 'px'
              });

            markersContainer = d3.select('.leaflet-pixi-overlay')
              .append('div')
              .attrs({
                class: 'markersContainer',
              })
              .styles({
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                transform: strTrans
              });

            transformCanvas = d3.select('.leaflet-pixi-overlay').style('transform');
            console.log(transformCanvas);

            $('canvas').after($('.leaflet-marker-pane'));
            //$('canvas').after($('.leaflet-tile-pane'))

            d3.select('.leaflet-marker-pane')
              .styles({
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                transform: strTrans
              });


            /*
            d3.select('.leaflet-tile-pane')
              .styles({
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                transform: strTrans
              });              
            */

            d3.select('canvas')
              .styles({
                transform: strTrans
              });



            for (var i = arrRandom.length; i--;) {

              markerConstructor([arrRandom[i][0].lat, arrRandom[i][0].lng]);
            }

            function Riders(data) {
              console.log(data[0][0])

              var numpart = data.length;
              // var numpart = 10;
              var ridersParticles = new PIXI.particles.ParticleContainer(numpart);
              //var ridersParticles = new PIXI.Container();
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
              var indexStart = 14;
              var indexEnd = 18;

              for (var i = totalRiders; i--;) {

                var texture = new PIXI.Texture(resources.iris.texture);
                var rect1 = new PIXI.Rectangle(wUnit * (parseInt(getRnd(indexEnd, indexStart))), 0, wUnit, hUnit);
                texture.frame = rect1;

                var rider = new PIXI.Sprite(texture);

                var pos = [data[starterNum + i][0].lat, data[starterNum + i][0].lng];

                rider.anchor.set(0.5);
                rider.scale.set(1 * 0.06);
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

            var ridersGroup = new Riders(routeData);

            function drawCity() {

              var buffer = new PIXI.Graphics();
              container.addChild(buffer);

              drawPolyline(data);

              function drawPolyline(arr) {


                buffer.lineStyle(0.095, '0x000000', 0.3);
                buffer.beginFill(0xFFFF0B, 0.0);
                buffer.blendMode = PIXI.BLEND_MODES.SCREEN;


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

                $('.spinner').addClass('stop');

              } //---FINAL DRAW POLYLINE

            }
            drawCity();


            //---ANIMATION


            ticker.speed = 0.5;
            var oldDelta = 0;
            var newDelta = 0;

            ticker.stop();

            ticker.add((deltaTime) => {

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
            ticker.start();
            ticker.stop();






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
      maxZoom: 20,
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

TO_DO:
 - stop ticker cuando ya no hay mas animations

//---------


geo2topo countries=bogota.geojson > bogota-map.json

var inter = d3.interpolateArray([x,y],[x,y])
var pos = inArr[i](deltaTime * 0.1, deltaTime * 0.1);

ridersArr[i].transform.position.set(project(pos).x, project(pos).y);


----------------*/