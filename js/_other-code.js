
                    if (firstDraw && prevZoom !== zoom) {



                      ////..........PARTICLES
                      var numpart = data.length;
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

                        //console.log(data[i][0])

                        var dude = new PIXI.Sprite(resources.line.texture);

                        //console.log(data[i][0]);

                        //data[i].latitude = data[i][0] === null ? 0 : data[i][0];
                        //data[i].longitude = data[i][1] === null ? 0 : data[i][1];


                        //var lacoord = project([, project(coords).y]);

                        dude.x = project([data[i][0].lat, data[i][0].lng]).x;
                        dude.y = project([data[i][0].lat, data[i][0].lng]).y;
                        dude.width = (0.005 * 3) * factorScale;
                        dude.height = 0.005 * factorScale;


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

                          //var size = getRnd(0.0001, 0.001);
                          num += 1 * (0.0001);

                          maggots[i].width = num * factorScale;
                          maggots[i].height = num * factorScale;

                        }

                        renderer.render(container);
                      });


                      //ticker.start();


                    }
