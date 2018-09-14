/**
 * https://github.com/ecomclub/restform
 * ./main.js
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 */

// require 'https://code.jquery.com/jquery-3.3.1.js'
/* global jQuery */

// include 'https://cdn.jsdelivr.net/npm/twbschema@1/dist/twbschema.min.js'
// global twbschema */

(function ($) {
  'use strict'

  // setup as jQuery plugin
  $.fn.restform = function (opt) {
    // compose API Console App layout
    var Layout = Restform.layout()

    // update DOM
    this.html(Layout.$layout)
  }

  // set global object
  /* global Restform */
  window.Restform = {}
}(jQuery))
;

/**
 * https://github.com/ecomclub/restform
 * ./partials/layout.js
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 */

// require 'https://code.jquery.com/jquery-3.3.1.js'
/* global jQuery */

(function ($) {
  'use strict'

  var layout = function () {
    var i, html

    /* setup layout components */

    // API, resource or action title
    var $title = $('<span>', {
      'class': 'navbar-text',
      text: 'API Console'
    })

    // setup top nav HTML
    var navs = [ 'Headers', 'Body', 'Schema', 'Form' ]
    html = []
    for (i = 0; i < navs.length; i++) {
      var nav = navs[i]
      html.push($('<li>', {
        'class': 'nav-item',
        id: 'restform-nav-' + nav,
        html: $('<a>', {
          'class': 'nav-link',
          text: nav,
          href: 'javascript:;',
          click: (function (nav) {
            // local nav
            return function () {
              // show tab
            }
          }(nav))
        })
      }))
    }

    // top navbar menu
    var $navbar = $('<ul>', {
      'class': 'navbar-nav ml-auto',
      html: html
    })
    var $nav = $('<nav>', {
      'class': 'navbar navbar-expand-lg navbar-light restform-nav',
      html: $('<div>', {
        'class': 'container',
        html: [
          $('<button>', {
            'class': 'close mr-3',
            type: 'button',
            'aria-label': 'Close',
            html: '<span aria-hidden="true">&times;</span>',
            click: function () {
              // hide API console main element
              $layout.fadeOut()
            }
          }),
          $title,
          $('<button>', {
            'class': 'navbar-toggler',
            type: 'button',
            'data-toggle': 'collapse',
            'data-target': '#restform-navbar',
            'aria-expanded': false,
            'aria-controls': 'restform-navbar',
            'aria-label': 'Toggle navigation',
            html: '<span class="navbar-toggler-icon"></span>'
          }),
          $('<div>', {
            'class': 'collapse navbar-collapse',
            id: 'restform-navbar',
            html: $navbar
          })
        ]
      })
    })

    // composed layout
    var $layout = $('<article>', {
      'class': 'restform',
      html: [
        $nav
      ]
    })

    // return object with DOM elements
    return {
      $title: $title,
      $nav: $nav,
      $layout: $layout
    }
  }

  // set globally
  window.Restform.layout = layout
}(jQuery))
