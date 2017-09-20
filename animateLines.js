var lineWidth = 2,
    lineColor = 0xf3a33f,
    length = 4,
    currPoints = [],
    destPoints = [],
    lineArray = [],
    duration = 1.4,
    ease = Power4.easeInOut,
    staggerFactor = .06;

function init() {
    initScene();
    initLines();
    animateLines();
    TweenLite.ticker.addEventListener('tick', render);
}

function animateLines() {
    for (var i = 0; i < length; i += 1) {
        TweenMax.fromTo(lineArray[i], duration, {
            alpha: 0
        }, {
            delay: i * staggerFactor,
            alpha: 1,
            repeat: -1,
            yoyo: true,
            repeatDelay: duration * .5,
            ease: ease
        });
        TweenMax.to(currPoints[i].moveTo, duration, {
            delay: i * staggerFactor,
            x: destPoints[i].moveTo.x,
            y: destPoints[i].moveTo.y,
            repeat: -1,
            yoyo: true,
            repeatDelay: duration * .5,
            ease: ease
        });
        TweenMax.to(currPoints[i].lineTo, duration, {
            delay: i * staggerFactor,
            x: destPoints[i].lineTo.x,
            y: destPoints[i].lineTo.y,
            repeat: -1,
            yoyo: true,
            repeatDelay: duration * .5,
            ease: ease
        });
    }
}

function initLines() {
    var line;
    for (var i = 0; i < length; i += 1) {
        line = new PIXI.Graphics().lineStyle(1, 0xf3a33f);
        if (i == 0) {
            currPoints[i] = getPoint(getRandomInt(0, window.innerWidth), window.innerHeight, getRandomInt(0, window.innerWidth), 0);
            destPoints[i] = getPoint(getRandomInt(0, window.innerWidth), window.innerHeight, getRandomInt(0, window.innerWidth), 0);
        } else if (i == 1) {
            currPoints[i] = getPoint(0, getRandomInt(0, window.innerHeight), window.innerWidth, getRandomInt(0, window.innerHeight));
            destPoints[i] = getPoint(0, getRandomInt(0, window.innerHeight), window.innerWidth, getRandomInt(0, window.innerHeight));
        } else {
            currPoints[i] = getPoint(getRandomInt(0, window.innerWidth), window.innerHeight, window.innerWidth, getRandomInt(0, window.innerHeight));
            destPoints[i] = getPoint(getRandomInt(0, window.innerWidth), window.innerHeight, window.innerWidth, getRandomInt(0, window.innerHeight));
        }
        line.moveTo(currPoints[i].moveTo.x, currPoints[i].moveTo.y);
        line.lineTo(currPoints[i].lineTo.x, currPoints[i].lineTo.y);
        main.addChild(line);
        lineArray.push(line);
    }
}

function initScene() {
    renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, {
        view: document.querySelector('canvas'),
        antialias: true
    });
    main = new PIXI.Container();
}

function render() {
    renderer.render(main);
    for (var i = 0; i < length; i += 1) {
        lineArray[i].clear();
        lineArray[i].lineStyle(lineWidth, lineColor);
        lineArray[i].moveTo(currPoints[i].moveTo.x, currPoints[i].moveTo.y);
        lineArray[i].lineTo(currPoints[i].lineTo.x, currPoints[i].lineTo.y);
    }
}

function getPoint(xMoveTo, yMoveTo, xLineTo, yLineTo) {
    return {
        moveTo: {
            x: xMoveTo,
            y: yMoveTo
        },
        lineTo: {
            x: xLineTo,
            y: yLineTo
        }
    };
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (1 + max - min) + min);
};

//
init();