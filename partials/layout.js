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

    // composed layout
    var $layout = $('<article>', {
      'class': 'restform',
      html: [
        $nav,
        $header
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
