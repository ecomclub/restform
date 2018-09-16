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
    Layout.setParams([
      { text: 'ID', description: 'Resource ID' }
    ])

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
    var setTitle = function (title) {
      $title.text(title)
    }

    // request HTTP method
    var $method = $('<span>', {
      'class': 'input-group-text',
      type: 'text',
      text: 'GET'
    })
    var setMethod = function (url) {
      $method.text(url)
    }

    // request full URL
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
    var setUrl = function (url) {
      $url.text(url)
    }
    var $send = $('<button>', {
      'class': 'btn btn-success mx-2',
      type: 'button',
      'aria-label': 'Send',
      html: '<i class="ti ti-check mr-1"></i> Send'
    })

    // create key->value tables
    var $Table = function ($items) {
      // table headers
      var $Head = function (text) {
        return $('<th>', {
          scope: 'col',
          text: text
        })
      }
      // separated table body element
      var $tbody = $('<tbody>', {
        html: $items
      })

      // return table DOM element
      return {
        $tbody: $tbody,
        $table: $('<table>', {
          'class': 'table table-bordered',
          id: 'restform-params',
          html: [
            $('<thead>', {
              html: $('<tr>', {
                html: [
                  $Head('Key'),
                  $Head('Value'),
                  $Head('Description')
                ]
              })
            }),
            $tbody
          ]
        })
      }
    }

    // URL params
    var $paramsBtn = $('<button>', {
      'class': 'btn btn-outline-secondary',
      type: 'button',
      disabled: true,
      text: 'Params',
      'data-toggle': 'collapse',
      'data-target': '#restform-params',
      'aria-expanded': false,
      'aria-controls': 'restform-params'
    })
    var $paramsItems = []
    var $Params = $Table('')
    var $paramsTable = $Params.$table
    var $paramsBody = $Params.$tbody
    $paramsTable.addClass('collapse mt-3')

    // update params button and table
    var setParams = function (params) {
      // reset to hidden
      $paramsTable.collapse('hide')
      $paramsItems = []

      if (Array.isArray(params) && params.length) {
        $paramsBtn.attr('disabled', false)
        for (var i = 0; i < params.length; i++) {
          var param = params[i]
          // new table row
          $paramsItems.push($('<tr>', {
            html: [
              $('<td>', {
                text: param.text
              }),
              $('<td>', {
                html: $('<input>', {
                  'class': 'form-control form-control-sm',
                  type: 'text'
                })
              }),
              $('<td>', {
                text: param.description
              })
            ]
          }))
        }
      } else {
        // no URL params
        $paramsBtn.attr('disabled', true)
      }

      // update table DOM
      $paramsBody.html($paramsItems)
    }

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
                      html: $paramsBtn
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
          }),
          $paramsTable
        ]
      })
    })

    // generate section headers
    var $Header = function (html) {
      return $('<header>', {
        'class': 'restform-header',
        html: $('<div>', {
          'class': 'container',
          html: html
        })
      })
    }

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
            id: label + '-content',
            html: $navPanes
          })
        ],
        $Contents: $Contents
      }
    }

    // request section content
    var $Req = $Tabs('req', [ 'headers', 'body', 'attributes' ])
    var $request = $('<section>', {
      id: 'restform-request',
      html: [
        // title header
        $Header($title),
        $('<div>', {
          'class': 'container',
          html: $Req.$html
        })
      ]
    })

    // response section content
    var $Res = $Tabs('res', [ 'headers', 'body' ])
    var $response = $('<section>', {
      id: 'restform-response',
      html: [
        $Header('Response'),
        $('<div>', {
          'class': 'container',
          html: $Res.$html
        })
      ]
    })

    // composed layout
    var $layout = $('<article>', {
      'class': 'restform',
      html: [
        $nav,
        $request,
        $response
      ]
    })

    // return object with DOM element and reactive functions
    return {
      setTitle: setTitle,
      setMethod: setMethod,
      setUrl: setUrl,
      setParams: setParams,
      // app main DOM element
      $layout: $layout
    }
  }

  // set globally
  window.Restform.layout = layout
}(jQuery))
