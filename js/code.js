(function($, window, document) {



  var leafletMap = L.map('mapid', {
      minZoom: 2,
      maxZoom: 20
    })
    .setView([39.203343, -0.311333], 3);

  var polygonLatLngs = [39.203343, -0.311333];

  var coords;


  var graphics = new PIXI.Graphics();

  var pixiContainer = new PIXI.Container();
  pixiContainer.addChild(graphics);


  const ticker = new PIXI.ticker.Ticker();



  var firstDraw = true;
  var prevZoom;

  var frame = null;
  var count = 0;

  var animation, factorScale, renderer, container;

  function render(x) {
    renderer.render(container);
    //console.log(x);
  }
  $(function() {

    //////////////////////////TOPOJSON
    var topoLayer = new L.GeoJSON();

    d3.json('map/map-simplify.geojson', function(error, geomap) {
      if (error) throw error;

      topoLayer.addData(geomap);
      topoLayer.addTo(leafletMap);

      d3.csv('../conflict-project/json/ged50.csv', function(error, datacoords) {
        if (error) throw error;

        console.log(datacoords);


        //----
        var loader = new PIXI.loaders.Loader();
        loader
          .add('circle', 'circle-blue-blur.png')
          .add('gusanito', 'gusanito.png')

       var blurFilter1 = new PIXI.filters.BlurFilter();

        loader.load(function(loader, resources) {

          console.log(resources.circle.texture);



          var pixiOverlay = L.pixiOverlay(function(utils) {


              var zoom = utils.getMap().getZoom();
              container = utils.getContainer();
              renderer = utils.getRenderer();
              var project = utils.latLngToLayerPoint;
              var scale = utils.getScale();



              if (frame) {
                //cancelAnimationFrame(frame);
                frame = null;
              }

              //console.log(utils);

              //------
              factorScale = ((1 - scale) * 100);

              if (firstDraw) {
                coords = project(polygonLatLngs);

              }
              if (firstDraw && prevZoom !== zoom) {




                /*

                                var myTween = TweenMax.to(markerSprite, 2, {
                                  width: 10000,
                                  height: 10000,
                                  yoyo: true,
                                  ease: Power4.easeInOut,
                                  repeat: 1,
                                });


                                //TweenMax.ticker.addEventListener('tick', render);
                                // markerSprite.on('pointerdown', onClick);

                                TweenMax.globalTimeScale(1);

                */
                ////..........PARTICLES
                var numpart = 1000;
                var sprites = new PIXI.particles.ParticleContainer(numpart, {
                  scale: true,
                  position: true,
                  rotation: true,
                  uvs: true,
                  alpha: true
                });


                container.addChild(sprites);

                var maggots = [];
                var totalSprites = renderer instanceof PIXI.WebGLRenderer ? numpart : 10;

                for (var i = 0; i < totalSprites; i++) {

                  var dude = new PIXI.Sprite(resources.circle.texture);


                  var lacoord = project([parseFloat(datacoords[i].latitude), parseFloat(datacoords[i].longitude)]);

                  dude.x = lacoord.x;
                  dude.y = lacoord.y;
                  dude.width = 10 * factorScale;
                  dude.height = 10 * factorScale;


                  dude.anchor.set(0.5);

                  dude.tint = Math.random() * 0xFFFFFF;

                  //dude.blendMode = PIXI.BLEND_MODES.MULTIPLY;


                  maggots.push(dude);
                  sprites.addChild(dude);

                   //sprites.filters = blurFilter1;
                }


                ticker.speed = 1;
                //ticker.stop();
                var num = 0;
                ticker.add(function(deltaTime) {

                  //console.log(deltaTime);
                  

                  // iterate through the sprites and update their position
                  for (var i = 0; i < maggots.length; i++) {

                    var size = getRnd(0.0001, 0.001);
                    num += 1 * size;

                    maggots[i].width = num * factorScale;
                    maggots[i].height = num * factorScale;

                  }

                  renderer.render(container);
                });


                ticker.start();

               
              }
              if (!firstDraw && prevZoom !== zoom) {

                console.log('zzzz');
              }
              firstDraw = false;
              prevZoom = zoom;
              renderer.render(container);

              if (renderer instanceof PIXI.CanvasRenderer) {
                console.log('//canvas renderer');

              } else {
                //webgl renderer
                console.log('//canvas webgl');
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
          ticker.stop();

          TweenMax.ticker.removeEventListener('tick', render);
        });

        $('#play-animation').on('click', function() {
          //requestAnimationFrame(animate);
          $(this).hide();
          $('#stop-animation').show();

          //  TweenMax.ticker.addEventListener('tick', render);

          ticker.start();

        });


      });


    });


  }); ///--- ON READY
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

}(window.jQuery, window, document));