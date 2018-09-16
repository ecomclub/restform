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
    // var i, html

    /* setup layout components */

    // API, resource or action title
    var $title = $('<h5>', {
      'class': 'm-0 restform-title',
      text: 'API Console'
    })

    // API endpoint elements
    var $method = $('<span>', {
      'class': 'input-group-text',
      type: 'text',
      text: 'GET'
    })
    var $url = $('<input>', {
      'class': 'form-control',
      type: 'text',
      readonly: true,
      value: 'https://api.e-com.plus',
      click: function () {
        // select all text
        $(this).select()
      }
    })
    var $send = $('<button>', {
      'class': 'btn btn-primary mx-2',
      type: 'button',
      'aria-label': 'Send',
      html: '<i class="ti ti-check mr-1"></i> Send'
    })

    // sticky nav bar
    var $nav = $('<nav>', {
      'class': 'sticky-top shadow-sm restform-nav',
      html: $('<div>', {
        'class': 'container',
        html: [
          $('<div>', {
            'class': 'row no-gutters',
            html: [
              $('<div>', {
                'class': 'col',
                html: $('<div>', {
                  'class': 'input-group',
                  html: [
                    $('<div>', {
                      'class': 'input-group-prepend',
                      html: $method
                    }),
                    $url,
                    $('<div>', {
                      'class': 'input-group-append',
                      html: '<button class="btn btn-outline-secondary" type="button">Params</button>'
                    })
                  ]
                })
              }),
              $('<div>', {
                'class': 'col-auto',
                html: [
                  $send,
                  $('<button>', {
                    'class': 'btn btn-light',
                    type: 'button',
                    'aria-label': 'Close',
                    html: '<i class="ti ti-close"></i>',
                    click: function () {
                      // hide API console main element
                      $layout.fadeOut()
                    }
                  })
                ]
              })
            ]
          })
        ]
      })
    })

    // title header
    var $header = $('<header>', {
      'class': 'restform-header',
      html: $('<div>', {
        'class': 'container',
        html: $title
      })
    })

    // nav and tabs for request and response
    var $Tabs = function (label, tabs) {
      label = 'restform-' + label
      // generate items and panes for each tab
      var $navItems = []
      var $navPanes = []
      var $Contents = {}
      for (var i = 0; i < tabs.length; i++) {
        var tab = tabs[i]
        // elements IDs
        var paneId = label + '-pane-' + tab
        var itemId = label + '-item-' + tab

        // options to DOM elements
        var itemOptions = {
          'class': 'nav-item nav-link',
          id: itemId,
          'data-toggle': 'tab',
          href: '#' + paneId,
          role: 'tab',
          'aria-controls': paneId,
          'aria-selected': false,
          // capitalize
          text: tab.charAt(0).toUpperCase() + tab.slice(1)
        }
        var paneOptions = {
          'class': 'tab-pane fade',
          id: paneId,
          role: 'tabpanel',
          'aria-labelledby': itemId
        }
        if (i === 0) {
          // first item is active
          itemOptions.class += ' active'
          itemOptions['aria-selected'] = true
          paneOptions.class += ' show active'
        }

        // create DOM elements and push to arrays
        var $content = $('<div>', paneOptions)
        $navPanes.push($content)
        $navItems.push($('<a>', itemOptions))
        $Contents[tab] = $content
      }

      // returns nav tabs and tabs content
      return {
        $html: [
          $('<nav>', {
            html: $('<div>', {
              'class': 'nav nav-tabs restform-tabs',
              role: 'tablist',
              id: label + '-tabs',
              html: $navItems
            })
          }),
          $('<div>', {
            'class': 'tab-content restform-content',
            id: label + '-content'
          })
        ],
        $Contents: $Contents
      }
    }

    var $Req = $Tabs('req', [ 'headers', 'body', 'form', 'schema', 'attributes' ])
    var $request = $('<div>', {
      'class': 'container',
      html: $Req.$html
    })

    var $Res = $Tabs('req', [ 'headers', 'body' ])
    var $response = $('<div>', {
      'class': 'container',
      html: $Res.$html
    })

    // composed layout
    var $layout = $('<article>', {
      'class': 'restform',
      html: [
        $nav,
        $header,
        $request,
        $response
      ]
    })

    // return object with DOM element and reactive functions
    return {
      setTitle: function (title) {
        $title.text(title)
      },
      setReqMethod: function (method) {
        $method.text(method)
      },
      setReqUrl: function (url) {
        $url.text(url)
      },
      $layout: $layout
    }
  }

  // set globally
  window.Restform.layout = layout
}(jQuery))
