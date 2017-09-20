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



    //----
    var loader = new PIXI.loaders.Loader();
    loader
      .add('bunny', 'bunny.png')



    loader.load(function(loader, resources) {

        console.log(resources.bunny.texture);



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

            console.log('xxxxx');


            graphics.lineStyle(0);
            graphics.beginFill(0xE91E63, 1);
            graphics.drawRect(coords.x, coords.y, 100 * factorScale, 100 * factorScale);
            graphics.endFill();



            console.log('bunny');

            var blurFilter1 = new PIXI.filters.BlurFilter();

            var markerSprite = new PIXI.Sprite(resources.bunny.texture);

            markerSprite.x = coords.x;
            markerSprite.y = coords.y;
            markerSprite.anchor.set(0.5);
            // markerSprite.scale = 1000 * factorScale;


            markerSprite.scale.set(10 * factorScale);

            //markerSprite.on('pointerdown', onClick);

            container.addChild(markerSprite);


            var myTween = TweenMax.to(markerSprite, 3, {
              alpha: 0.5,
              x: coords.x + (1000 * factorScale),
              yoyo: true,
              //ease: Bounce.easeOut,
              ease : Power4.easeInOut,
              repeat: -1
            });

            TweenMax.ticker.addEventListener('tick', render);

            function render() {
              renderer.render(container);
            }

         /*

            myTween.eventCallback("onComplete", myFunction, ["param1", "param2"]);
*/
            function myFunction() {
              console.log('va!')
            }

            //graphics.filters = [blurFilter1];


            //---ANIMATION
            // ticker.speed = 0.05;

            //ticker.stop();
            /*
                   
                    ticker.add(function(deltaTime) {
                      //console.log(deltaTime);

                      markerSprite.rotation += 1 * deltaTime;

                      // markerSprite.rotation += 10 * deltaTime;
                      renderer.render(container);
                    });

            */

            //ticker.start();



            function onClick() {
              markerSprite.scale.x *= 1.25;
              markerSprite.scale.y *= 1.25;
            }




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


        }, pixiContainer);
        pixiOverlay.addTo(leafletMap);
        



        }); //---LOADER

      $(function() {

        //////////////////////////TOPOJSON
        var topoLayer = new L.GeoJSON();

        d3.json('map/map-simplify.geojson', function(error, geomap) {
          if (error) throw error;

          topoLayer.addData(geomap);
          topoLayer.addTo(leafletMap);

          d3.json('data/countries-coords.json', function(error, coords) {
            if (error) throw error;




            //---STOP BUTTON
            $('#stop-animation').on('click', function() {
              cancelAnimationFrame(animation);
              $(this).hide();
              $('#play-animation').show();
              ticker.stop();
            });

            $('#play-animation').on('click', function() {
              requestAnimationFrame(animate);
              $(this).hide();
              $('#stop-animation').show();
              ticker.start();
            });


          });


        });


      }); ///--- ON READY


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