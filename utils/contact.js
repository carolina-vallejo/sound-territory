(function($, window, document) {

  var pathname = window.location.pathname;
  var locationUrl = window.location.origin + pathname;
  var substring = locationUrl.substring(0, locationUrl.indexOf('cms'));
  var lang = '';
  var urlLang = '';



  if (pathname.search('/de/') !== -1) {
    lang = '&L=1';
    urlLang = '-de';
  }

  var rootUrl = substring + "cms/typo3conf/ext/mas_amberg/Resources/Public/";

  // -- VARIABLES:
  var arrLngs = [],
    arrCountries = [],
    arrWorld = [],
    markersInCluster = [];

  var mymap, markers, objTool, normalIcon, svg, countries, world, markerIcon, dataByDot, dataByCluster, dataByCountry, dataJson;
  var coloredTextures = {};
  var $tool, $mapContainer;

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

  var colMapa = 'hsl(207, 7%, 43%)',
    colFondo = '#1a2228';

  var colors = {
    red: '#e4003b',
    gray: '#acadaf',
    orange: '#FF6600',
    blue: '#0bc0fd'
  };

  var opacMapa = 0.18;
  var opacSelected = 0.7;
  var opacWorldSelec = 0.3;
  var time = 300;

  //----NAMES
  var marcador = 'marcador-contact';
  var marcadorCluster = 'marcador-cluster';
  var mapaContainer = 'map-contact';

  $(function() {

    //---TOOLTIP PROJECTS
    $tool = $('#tooltip-contact');
    objTool = {
      '$country': $tool.find('.country'),
      '$company': $tool.find('.company'),
      '$wrap-cover-img': $tool.find('.wrap-cover-img'),
      '$address': $tool.find('.address'),
      '$contact-info': $tool.find('.contact-info'),
      '$description': $tool.find('.description'),
      '$list-countries': $tool.find('.list-countries'),
      '$contact-btn': $tool.find('#contact-btn')
    };

    $mapContainer = $('#' + mapaContainer);

    /*////////////////////////////
    - LEAFLET -
    ----------------------------*/
    var newzoom = 0,
      oldzoom = 0;
    mymap = L.map(mapaContainer, {
        minZoom: 0,
        maxZoom: 3,
        scrollWheelZoom: false,
        dragging: (function() {
          return isMobile() ? false : true;
        })(),
        tap: (function() {
          return isMobile() ? false : true;
        })()
      })
      .setView([39.203343, -0.311333], (function() {
        return isMobile() ? 2 : 2;
        newzoom = mymap.getZoom();
      })())
      .on('zoom', function(e) {
        $('.popup-hover-leaflet.isclick').remove();


      }).on('click', function() {
        $('.' + marcador).removeClass('active');

        //---CLEAN ACTIVES
        countries
          .transition()
          .duration(time)
          .attrs({
            'fill-opacity': 0
          });
        world
          .transition()
          .duration(time)
          .attrs({
            //'fill-opacity': opacMapa
          });

        //---CLEAN TOOLTIP

        cleanPopup();

      }).on('zoomend', function(e) {

        oldzoom = newzoom;
        newzoom = mymap.getZoom();

        if (oldzoom > newzoom) {
          $('.is-level-2').hide();
          $('.is-big-cluster').show();
        } else {
          $('.is-level-2').show();
          $('.is-big-cluster').hide();
        }

      });
    mymap.zoomControl.setPosition('bottomleft');

    //--MARKERS LAYER
    markers = L.layerGroup();

    //---ICON
    var localIcon = L.Icon.extend({
      options: {
        iconSize: [icon_w, icon_w],
        iconAnchor: [(icon_w / 2), (icon_w)],
        popupAnchor: [0, 0]
      }
    });

    markerIcon = new localIcon({ iconUrl: rootUrl + 'assets/marker.svg' });


    /*////////////////////////////
    - GET DATA -
    ----------------------------*/
    var url = rootUrl + 'data/contact-data' + urlLang + '.json';
    d3.json(url, function(error, data) {
      dataJson = data;
      $('#loader2').addClass('stoploader');

      //---ARRANGE DATA
      //////////////////////////TOPOJSON
      d3.json(rootUrl + 'json/map.geojson', function(error, polygons) {

        //-- ADD POLYGONS TO MY MAP

        var topoWorld = L.geoJson(polygons).addTo(mymap);
        topoWorld.eachLayer(function(layer) {
          arrWorld.push(layer.getBounds());

        });
        if (isMobile()) {
          rezoom(arrWorld);
        }

        //---INIT TEXTURES IN SVG
        svg = d3.select("#" + mapaContainer).select('svg');

        texture1 = textures.circles()
          .size(8)
          .radius(2)
          .fill('white');
        svg.call(texture1);

        texture2 = textures.circles()
          .size(8)
          .radius(2)
          .fill('white');
        svg.call(texture2);

        coloredTextures.gray = textures.circles()
          .size(8)
          .radius(2)
          .fill(colors['gray']);
        svg.call(coloredTextures.gray);

        coloredTextures.red = textures.circles()
          .size(8)
          .radius(2)
          .fill(colors['red']);
        svg.call(coloredTextures.red);

        coloredTextures.orange = textures.circles()
          .size(8)
          .radius(2)
          .fill(colors['orange']);
        svg.call(coloredTextures.orange);

        coloredTextures.blue = textures.circles()
          .size(8)
          .radius(2)
          .fill(colors['blue']);
        svg.call(coloredTextures.blue);

        //---STYLE WORLD
        world = svg.selectAll('path')
          .attrs({
            'class': 'world-path',
            'fill': coloredTextures.blue.url(),
            'fill-opacity': opacWorldSelec,
            'stroke': 'none'
          });

        d3.json(rootUrl + 'json/map-completo.geojson', function(error2, polygons2) {

          var topoCountries = L.geoJson(polygons2).addTo(mymap);
          topoCountries.eachLayer(function(layer) {
            layer._path.id = 'feature-' + layer.feature.id;
            arrCountries.push(layer._path);
          });

          countries = d3.selectAll(arrCountries)
            .attrs({
              'class': 'countries-path',
              'fill': texture2.url(),
              'fill-opacity': 0,
              'stroke': 'none'
            });
        });

      }); //---TOPOJSON

      //--DATA BY COUNTRY
      dataByDot = d3.nest()
        .key(function(d) {
          return d.dot_colour;
        })
        .entries(dataJson);

      console.log(dataByDot);

      //--ADD LAYER MARKERS
      mymap.addLayer(markers);
      drawMarkers(dataJson, 10);

      /*-----FILTERS--------*/
      $('#' + mapaContainer).before('<div id="filters-contact" class="map-nav"><ul></ul></div>');

      var htlmLiFilters =
        '<li id="all-contact" class="filter-contact-active"><a href="#">ALL</a></li>' +
        '<li id="dot-1"><a href="#">Amberg Offices</a></li>' +
        '<li id="dot-2"><a href="#">Official distributors</a></li>' +
        '<li id="dot-3"><a href="#">Project offices</a></li>';

      var $filterNav = $('#filters-contact ul');
      $filterNav.append(htlmLiFilters)
        .on('click', 'a', function(e) {
          e.preventDefault();

          $('.filter-contact-active').removeClass('filter-contact-active');

          

          mymap.setView([39.203343, -0.311333], mymap.getZoom(), {
            "animate": true,
            "pan": {
              "duration": 0.3
            }
          });
          setTimeout(function(){
            mymap.setZoom(2);
          },300);
          

          cleanInfluence();

          $tool.removeClass('slide').removeClass('appear');
          $mapContainer.removeClass('opentool');
          $('.active-popup').removeClass('active-popup');


          var index = $(this).parent().addClass('filter-contact-active').attr('id').replace('dot-', '');

          if (index === 'all-contact') {
            drawMarkers(dataJson, 10);

            world
              .attrs({
                'fill': coloredTextures.blue.url(),
                'fill-opacity': opacWorldSelec,
              });

          } else {
            drawMarkers(dataByDot[index - 1].values, 1);
          }
        });




    }); //----END GET DATA

  }); //---END ON READY

  /*////////////////////////////
  - FUNCTIONS -
  ----------------------------*/
  var clustersCounter = 0;
  var numMaxCluster = 5;

  function drawMarkers(dataAct, maxCluster) {
    markers.clearLayers();

    dataByCluster = d3.nest()
      .key(function(d) {
        return d.cluster;
      })
      .entries(dataAct);

    dataByCountry = d3.nest()
      .key(function(d) {
        return d.country;
      })
      .entries(dataAct);

    dataByCountry.forEach(function(d) {
      if (d.values.length > 1) {
        clustersCounter++;
        markerConstructor('cluster', d.values, maxCluster, { 'cluster-type': 'small-cluster' });
      } else if (d.values.length === 1) {
        markerConstructor('each', d.values, maxCluster);
      }
    });

    dataByCluster.forEach(function(d) {
      if (d.values.length > maxCluster) {
        clustersCounter++;
        markerConstructor('cluster', d.values, maxCluster, { 'cluster-type': 'big-cluster' });
      }

    });

  }

  function markerConstructor(type, dataMarker, maxCluster, options) {
    var options = options !== undefined ? options : {};
    var latitude, longitude, htmlPopup, thisId, companies, arrangeData;

    if (type === 'each') {

      latitude = dataMarker[0].latitude;
      longitude = dataMarker[0].longitude;

      thisId = '';
      htmlPopup =
        '<span class="circle">' +
        '<span class="marker marker-' + dataMarker[0].dot_colour + '"></span>' +
        '</span>' +
        '<div class="wrap-all">' +
        '<span class="country">' +
        dataMarker[0].country +
        '</span>' +
        '</div>';

    } else {

      latitude = dataMarker[0].latitude;
      longitude = dataMarker[0].longitude;

      arrangeData = d3.nest()
        .key(function(d) {
          return 'link-' + d.id_location;
        })
        .object(dataMarker);

      thisId = 'countries-cluster-' + clustersCounter;
      companies = '';
      dataMarker.forEach(function(d) {
        companies += '<a class="dot-' + d.dot_colour + '" id="link-' + d.id_location + '" href="#">';
        companies += d.company_name;
        companies += '</a>';

        //$('#marker-' + d.id_location).addClass('marker-zoom-2').hide();

      });

      //---HTML POPUP
      htmlPopup =
        '<span class="close-popup-cluster">close</span>' +
        '<span class="circle">' +
        '<span class="marker cluster">' + dataMarker.length + '</span>' +
        '</span>' +
        '<div class="wrap-all">' +
        '<span class="country cluster">' +
        dataMarker[0].country +
        '</span>' +
        '<div class="txt cluster">' +
        companies +
        '</div>' +
        '</div>';
    } //---FIN ELSE

    //--LATITUD LONGITUD
    var latlng = L.latLng(parseFloat(latitude), parseFloat(longitude));

    /*
    var m = new L.Marker(latlng, {
      icon: markerIcon
    });
    markers.addLayer(m);
    */

    var popup1 = L.popup(popOtions);
    popup1.setLatLng(latlng);
    var content = L.DomUtil.create('div');


    $(content)
      .attr('id', thisId)
      .addClass(marcador)
      .addClass((function() {
        return type !== 'each' ? marcadorCluster : '';
      })())
      .css('display', (function() {
        if (options['cluster-type'] !== 'big-cluster') {
          return dataMarker[0].cluster === 'europa' ? 'none' : 'block';
        } else {
          return 'block';
        }
      })())
      .addClass((function() {
        if (options['cluster-type'] !== 'big-cluster') {
          return dataMarker[0].cluster === 'europa' ? 'is-level-2' : 'is-level-1';
        } else {
          return 'is-big-cluster';
        }

      })())
      .append(htmlPopup)
      .find('.marker')
      .on('click', function() {

        $('.active-popup').removeClass('active-popup');
        $(this).parents('.leaflet-popup')
          .addClass('active-popup');

        if (type === 'each') {

          showInfluence(dataMarker[0]);
          prinHtmlTool(dataMarker[0]);
          $mapContainer.addClass('opentool');

          $('#countries-cluster').removeClass('circle-active');

        } else {

          if (dataMarker.length > maxCluster) {
            mymap.setView(latlng, 3);
            //rezoomLatLong(latlng);
            //cleanPopup();

          } else {
            cleanInfluence();
            $mapContainer.addClass('opentool');
            popup1.options.keepInView = true;
            popup1.update();
          }
        }
      }); //---END CLICK



    if (type === 'cluster') {
      $(content)
        .parents('.leaflet-popup')
        .css({
          'z-index': 100
        });

      $(content).find('a').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var id = $(this).attr('id');
        var d = arrangeData[id][0];
        showInfluence(d);
        //----HTML
        prinHtmlTool(d);
        $mapContainer.addClass('opentool');
      });
    }

    $(content).find('.marker')
      .on('mouseover', function() {

        $(this)
          .parents('.leaflet-popup')
          .addClass('hover-popup');

      }).on('mouseout', function() {

        $(this)
          .parents('.leaflet-popup')
          .removeClass('hover-popup');

      }); //---FINAL CLICK   

    $(content)
      .find('.close-popup-cluster')
      .on('click', function(e) {
        e.preventDefault();
        cleanPopup();
      });

    popup1.setContent(content);
    popup1.addTo(markers);
  }

  function showInfluence(arr) {
    cleanInfluence();
    arr.countries_code.forEach(function(dat) {
      if (dat === 'worldwide') {
        world
          .transition()
          .duration(time)
          .attrs({
            'fill': coloredTextures['blue'].url(),
            'fill-opacity': opacWorldSelec
          });
      } else {
        d3.select('#feature-' + dat)
          .transition()
          .duration(time)
          .attrs({
            'fill': function() {
              return coloredTextures[arr.dot_colour].url();
            },
            'fill-opacity': opacSelected
          });

      }

    });
  }

  function cleanInfluence() {

    countries.attrs({
      'fill': texture1.url(),
      'fill-opacity': 0
    });
    world.attrs({
      'fill': texture1.url(),
      'fill-opacity': opacMapa
    });
  }

  function cleanPopup() {
    $tool.removeClass('slide').removeClass('appear');
    $mapContainer.removeClass('opentool');
    $('.active-popup').removeClass('active-popup');
    cleanInfluence();
  }

  function prinHtmlTool(d) {
    $tool.removeClass('appear');


    setTimeout(function() {
      objTool['$country'].text(d.country).css('color', colors[d.dot_colour]);
      objTool['$company'].text(d.company_name);
      objTool['$description'].text(d.short_description);
      objTool['$contact-btn'].attr('href', d.link_url);

      //-------------
      // IMG
      if (d.img_url !== '') {
        objTool['$wrap-cover-img'].empty().append('<img src="' + rootUrl + d.img_url + '" alt="">');
      } else {
        objTool['$wrap-cover-img'].hide();
      }

      //------------
      // ADDRESS
      var htmlAddress = d.street + ' ' +
        d.additional_information_address + ' ' +
        d.post_box + ' ' +
        d.zip_code + ' ' +
        d.location + ' ' +
        '(' + d.country + ')';

      objTool['$address'].text(htmlAddress);

      //-------------
      // LIST DATA
      var listData = [];

      //--contactPerson
      d.contact_person.length > 0 && listData.push({
        key: 'Contact Person',
        txt: d.contact_person + (d.title.length > 0 ? ' - ' : '') + d.title
      });

      //--Website
      d.website.length > 0 && listData.push({
        key: 'Website',
        txt: d.website
      });

      //--Telephone
      d.telefone1.length > 0 && listData.push({
        key: 'Telephone',
        txt: d.telefone1 + (d.telefone2.length > 0 ? ' - ' : '') + d.telefone2
      });
      //--Telephone
      d.fax.length > 0 && listData.push({
        key: 'Fax',
        txt: d.fax
      });

      var datalistHtml = '';
      listData.forEach(function(d) {
        datalistHtml += '<li>';
        datalistHtml += '<span class="label">' + d.key + '</span>';
        datalistHtml += '<span>' + d.txt + '</span>';
        datalistHtml += '</li>';
      });

      objTool['$contact-info'].empty().append(datalistHtml);

      //-------------
      // LIST COUNTRIES
      var countrieslistHtml = '';
      d.countries.split(', ').forEach(function(d) {
        countrieslistHtml += '<li>';
        countrieslistHtml += d.replace(',', '');
        countrieslistHtml += '</li>';
      });

      objTool['$list-countries'].empty().append(countrieslistHtml);


      $tool.addClass('slide');


      setTimeout(function() {
        var box = $tool.offset();
        var posScroll = $(window).height() - 300;
        $('html,body').animate({ scrollTop: box.top - posScroll }, 600);
        setTimeout(function() {
          $tool.addClass('appear');
        }, 200);
      }, 100);
    }, 100);

  }


  /*////////////////////////////
  - AUXILIARY FUNCTIONS -
  ----------------------------*/
  function rezoom() {
    var bounds = new L.LatLngBounds(arrLngs);
    bounds.length !== 0 && mymap.fitBounds(bounds);
  }

  function rezoomLatLong(latlan) {
    var bounds = new L.LatLngBounds(latlan);
    bounds.length !== 0 && mymap.fitBounds(bounds);
  }

  function isMobile() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      return true;

    } else {
      return false;
    }
  }

}(window.jQuery, window, document));