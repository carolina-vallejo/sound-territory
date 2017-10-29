    // this is used later in the resizing and gesture demos
  dragResize();

  window.dragMoveListener = dragMoveListener;

  function dragResize() {

    var element = document.getElementById('resize-drag'),
      x = 0,
      y = 0;

    interact('.resize-drag')
      .draggable({
        autoScroll: false,
        onmove: window.dragMoveListener,
        restrict: {
          restriction: element.parentNode,
          elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
          endOnly: false
        }
      })
      .resizable({
        //autoScroll: false,
        snap: {
          targets: [
            // snap to the point (0, 450)
            interact.createSnapGrid({ x: 30, y: 30 })
            //{ x: 0, y: 450, range: 50 },

            // snap only the y coord to 100
            // i.e. move horizontally at y=100
            //{ y: 10, range: Infinity }
          ]
        },
        preserveAspectRatio: false,
        edges: { left: true, right: true, bottom: false, top: false },
        restrict: {
          restriction: element.parentNode,
          //elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
          //endOnly: false
        }

      })
      .on('resizemove', function(event) {
        var target = event.target,
          x = (parseFloat(target.getAttribute('data-x')) || 0),
          y = (parseFloat(target.getAttribute('data-y')) || 0);

        // update the element's style
        target.style.width = event.rect.width + 'px';
        target.style.height = event.rect.height + 'px';

        // translate when resizing from top or left edges
        x += event.deltaRect.left;
        y += event.deltaRect.top;

        target.style.webkitTransform = target.style.transform =
          'translate(' + x + 'px,' + y + 'px)';

        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
        //target.textContent = Math.round(event.rect.width) + '×' + Math.round(event.rect.height);
      });

  }


  function dragMoveListener(event) {
    var target = event.target,
      // keep the dragged position in the data-x/data-y attributes
      x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
      y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform =
      target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  }