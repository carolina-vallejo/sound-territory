var app = new PIXI.Application(800, 600, { backgroundColor: 0xf1f1f1 });
document.body.appendChild(app.view);



var loader = new PIXI.loaders.Loader();
loader.add('bkg', 'assets/bkg.jpg');
loader.add('flower', 'assets/flowerTop.png');

loader.load(function(loader, resources) {


  // create a new Sprite from an image path
  var container = new PIXI.projection.Container2d();
  container.position.set(app.screen.width / 2, app.screen.height);


  var objpos = {
    bkgX : 0.5,
    bkgY : 1
  };

  var surface = new PIXI.projection.Sprite2d(new PIXI.Texture.fromImage("assets/bkg.jpg"));
  surface.anchor.set(objpos.bkgX, objpos.bkgY);

  //surface.scale.y = -1; //sorry, have to do that to make a correct projection
  surface.width = app.screen.width;
  surface.height = app.screen.height;
  //var squarePlane = new PIXI.projection.Sprite2d(PIXI.Texture.fromImage('assets/flowerTop.png'));
  var squarePlane = new PIXI.projection.Sprite2d(PIXI.Texture.WHITE);
  squarePlane.tint = 0xff0000;
  squarePlane.factor = 1;
  squarePlane.proj.affine = PIXI.projection.AFFINE.AXIS_X;
  squarePlane.anchor.set(0.5, 0.0);
  squarePlane.position.set(-surface.width*objpos.bkgX, -surface.height*objpos.bkgY);

  var bunny = new PIXI.projection.Sprite2d(PIXI.Texture.fromImage('assets/flowerTop.png'));
  bunny.anchor.set(0.5, 1.0);

  //---SET FIGURE POSITION
  bunny.position.set(app.screen.width / 2, app.screen.height / 2);

  app.stage.addChild(container);
  container.addChild(surface);
  container.addChild(squarePlane);
  squarePlane.addChild(bunny);


  container.proj.clear();
  container.updateTransform();

  //---PROJECTION 
  var point = new PIXI.Point(app.screen.width / 2, 50);

  let pos = container.toLocal(point);
  //need to invert this thing, otherwise we'll have to use scale.y=-1 which is not good
  pos.y = -pos.y;
  pos.x = -pos.x;
  container.proj.setAxisY(pos, -1);

  //squarePlane.proj.affine = squarePlane.factor ?
  //  PIXI.projection.AFFINE.AXIS_X : PIXI.projection.AFFINE.NONE;


  // Listen for animate update
  app.ticker.add(function(delta) {
    // clear the projection

  });


});