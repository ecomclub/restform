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

  var layout = function (elId) {
    // var i, html
    // base element ID
    elId = 'restform-' + elId + '-'

    /* setup layout components */

    // API, resource or action title
    var $title = $('<h5>', {
      'class': 'restform-title'
    })
    var $host = $('<span>', {
      'class': 'restform-endpoint'
    })
    var setTitle = function (title) {
      $title.text(title)
    }
    var setHost = function (host, endpoint) {
      $host.html([
        host,
        $('<strong>', {
          // highlight endpoint params
          html: endpoint.replace(/{([^}]+)}/g, '<span>$1</span>')
        })
      ])
    }

    // request HTTP method
    var $method = $('<span>', {
      'class': 'input-group-text',
      type: 'text'
    })
    var setMethod = function (method) {
      // update DOM
      $method.text(method)
      // check no request body methods
      switch (method) {
        case 'GET':
        case 'DELETE':
          disableNav($Req.$Navs.body)
          break
      }
    }

    // request full URL
    var $url = $('<input>', {
      'class': 'form-control',
      type: 'text',
      readonly: true,
      click: function () {
        // select all text
        $(this).select()
      }
    })
    var setUrl = function (url) {
      $url.val(url)
    }

    // send request button
    var $send = $('<button>', {
      'class': 'btn btn-success mx-2',
      type: 'button',
      'aria-label': 'Send',
      html: '<i class="ti ti-check mr-1"></i> Send'
    })
    var cbSend = function (callback) {
      // add callback function
      $send.click(callback)
    }

    // create key->value tables
    var $Table = function ($items) {
      // return table DOM element
      return $('<table>', {
        'class': 'table table-striped',
        id: elId + 'params',
        html: [
          $('<tbody>', {
            html: $items
          })
        ]
      })
    }

    // sticky nav bar
    var $nav = $('<nav>', {
      'class': 'fixed-top shadow-sm restform-nav',
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
                    $url
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
    var $Tabs = function (label, tabs, navClass) {
      label = elId + '' + label
      // generate items and panes for each tab
      var $navItems = []
      var $navPanes = []
      var $Contents = {}
      var $Navs = {}
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
        var $nav = $('<a>', itemOptions)
        $navItems.push($nav)
        $Navs[tab] = $nav
        $Contents[tab] = $content
      }

      // returns nav tabs and tabs content
      if (!navClass) {
        // default nav class
        navClass = 'nav-tabs'
      }
      return {
        $html: [
          $('<nav>', {
            html: $('<div>', {
              'class': 'nav restform-tabs ' + navClass,
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
        $Navs: $Navs,
        $Contents: $Contents
      }
    }

    // request section content
    var $Req = $Tabs('req', [ 'params', 'body', 'headers', 'attributes' ])
    var $request = $('<section>', {
      id: elId + 'request',
      html: [
        // title header
        $Header([
          $title,
          $host
        ]),
        $('<div>', {
          'class': 'container',
          html: $Req.$html
        })
      ]
    })

    // button to switch response sample and live
    var isLiveRes = false
    var $switchResponse = $('<button>', {
      'class': 'btn btn-info',
      html: '<i class="ti-reload mr-1"></i> Switch to <b>Live</b>',
      click: function () {
        isLiveRes = !isLiveRes
        var $b = $(this).children('b')
        if (isLiveRes) {
          // switched to live
          $b.text('Sample')
        } else {
          // switched to sample
          $b.text('Live')
        }
      }
    })

    // switch to live on Send click
    $send.click(function () {
      if (!isLiveRes) {
        $switchResponse.click()
      }
    })

    // set custom callback
    var cbSwitchResponse = function (callback) {
      // add callback function
      $switchResponse.click(function () {
        // pass local variable
        callback(isLiveRes)
      })
    }

    // response status code
    var $status = $('<span>')
    var setStatusCode = function (status) {
      var color
      if (status >= 200 && status < 300) {
        // OK
        color = 'success'
      } else if (status >= 300 && status < 400) {
        // redirect
        color = 'info'
      } else if (status >= 400 && status < 500) {
        // client error
        color = 'danger'
      } else if (status >= 500) {
        // server error
        color = 'dark'
      } else {
        // any
        color = 'secondary'
      }
      // reset badge
      $status.attr('class', 'badge badge-' + color).text(status)
    }
    // default status code
    // setStatusCode(200)

    // response section content
    var $Res = $Tabs('res', [ 'body', 'headers' ])
    var $response = $('<section>', {
      id: elId + 'response',
      html: [
        $Header($('<span>', {
          'class': 'lead',
          html: [
            '<span class="mr-2">Response</span>',
            $status
          ]
        })),
        $('<div>', {
          'class': 'container',
          html: [
            $switchResponse,
            $('<div>', {
              'class': 'mt-4',
              html: $Res.$html
            })
          ]
        })
      ]
    })

    // auxiliar functions for navs and contents
    var enableNav = function ($nav) {
      $nav.removeClass('disabled')
    }
    var disableNav = function ($nav) {
      // no URL params
      $nav.addClass('disabled')
      if ($nav.hasClass('active')) {
        // change current tab
        setTimeout(function () {
          $nav.siblings(':not(.disabled)').first().click()
        }, 200)
      }
    }

    // abstraction for params and headers tables
    var setTable = function ($Obj, tab, list, readOnly) {
      // link and pane DOM elements
      var $nav = $Obj.$Navs[tab]
      var $content = $Obj.$Contents[tab]
      // items for table
      var $items = []

      if (typeof list === 'object' && list !== null) {
        var keys = Object.keys(list)
        if (keys.length) {
          enableNav($nav)
          for (var i = 0; i < keys.length; i++) {
            var item = list[keys[i]]

            // new table row
            var $tds = []
            var key, $key, value
            if (typeof item === 'object') {
              // list is an array (params)
              key = item.key
              $key = []
              $key.push(key)
              value = item.value

              // check if is required
              if (item.required) {
                $key.push('<span class="text-danger ml-2">required</span>')
              }
              // can have description
              if (item.description) {
                var $info = $('<a>', {
                  'class': 'px-2 text-info',
                  href: 'javascript:;',
                  html: '<i class="ti ti-help-alt"></i>',
                  title: item.description
                })
                // setup tooltip
                $info.tooltip({
                  html: true,
                  placement: 'top'
                })
                $key.push($info)
              }
            } else {
              // list is an object (headers)
              key = keys[i]
              // DOM element with text only
              $key = key
              value = list[key]
            }

            $tds.unshift(
              // key text
              $('<td>', {
                html: $('<code>', {
                  html: $key
                })
              }),
              // value input
              $('<td>', {
                html: $('<input>', {
                  'class': 'form-control form-control-sm',
                  type: 'text',
                  readonly: !!(readOnly),
                  'data-key': key,
                  value: value
                })
              })
            )
            // add to table items
            $items.push($('<tr>', {
              html: $tds
            }))
          }

          // create table element
          var $table = $Table($items, !Array.isArray(list))
          // update tab pane content
          $content.html($table)
          return $table
        }
      }

      // no items
      disableNav($nav)
    }

    // update params button and table
    var setParams = function (params) {
      // get params table element
      var $table = setTable($Req, 'params', params)

      if ($table) {
        // handle params input change events
        var paramChanged = function () {
          if (typeof paramsCallback === 'function') {
            // parse params
            var params = []
            $table.find('tr').each(function () {
              var key, value
              var $inputs = $(this).find('input')
              if ($inputs.length === 1) {
                // predefined param
                key = $inputs.data('key')
                value = $inputs.val()
              } else {
                // custom query param
                key = $inputs.first().val()
                value = $inputs.last().val()
              }

              // skip if empty
              if (value !== '' && key !== '') {
                // add param
                params.push({
                  key: key,
                  value: value
                })
              }
            })
            paramsCallback(params)
          }
        }

        var addCustomParam = function () {
          // handle key input
          var $key = $('<input>', {
            'class': 'form-control form-control-sm restform-input-code',
            'data-type': 'key',
            type: 'text',
            change: paramChanged
          })

          // create new tr element
          var $tr = $('<tr>', {
            html: [
              // key input and remove button
              $('<td>', {
                html: $('<div>', {
                  'class': 'input-group input-group-sm',
                  html: [
                    $key,
                    $('<div>', {
                      'class': 'input-group-append',
                      html: $('<button>', {
                        'class': 'btn btn-outline-secondary',
                        type: 'button',
                        html: '<i class="ti ti-trash"></i>',
                        click: function () {
                          // remove parent tr
                          $tr.remove()
                          // trigger param changed function
                          paramChanged()
                        }
                      })
                    })
                  ]
                })
              }),

              // value input
              $('<td>', {
                html: $('<input>', {
                  'class': 'form-control form-control-sm',
                  'data-type': 'value',
                  type: 'text',
                  change: paramChanged
                })
              })
            ]
          })

          // add row to table
          $table.find('tbody').append($tr)
          // focus on key input
          $key.focus()
        }

        // set change event on already rendered inputs
        $table.find('input').change(paramChanged)
        // add button to add new query param
        $table.after($('<button>', {
          'class': 'btn btn-sm btn-light',
          type: 'button',
          html: '<i class="ti ti-plus mr-1 text-primary"></i> Add a new query parameter',
          click: addCustomParam
        }))
      }
    }

    // callback for params inputs changes
    var paramsCallback
    var cbParams = function (callback) {
      paramsCallback = callback
    }

    // update headers button and table
    var setReqHeaders = function (headers) {
      // get headers table element
      var $table = setTable($Req, 'headers', headers)

      if ($table) {
        // handle headers input change events
        var headerChanged = function () {
          if (typeof headersCallback === 'function') {
            // parse headers
            var headers = {}
            $table.find('input').each(function () {
              // predefined header
              var key = $(this).data('key')
              var value = $(this).val()
              // skip if empty
              if (value !== '' && key !== '') {
                // add header
                headers[key] = value
              }
            })
            headersCallback(headers)
          }
        }

        // set change event on already rendered inputs
        $table.find('input').change(headerChanged)
      }
    }

    // callback for headers inputs changes
    var headersCallback
    var cbHeaders = function (callback) {
      headersCallback = callback
    }

    // update response headers button and table
    var setResHeaders = function (headers) {
      // true for read only
      setTable($Res, 'headers', headers, true)
    }

    // setup body textarea editor
    var setupBody = function ($Obj, label, genForm) {
      // pane DOM element
      var $content = $Obj.$Contents.body
      // create textarea element
      var $editor = $('<textarea>', {
        'class': 'form-control',
        rows: 12,
        id: elId + 'body-' + label
      })
      var $form

      if (genForm) {
        // nav for JSON editor and form fields
        var $Body = $Tabs('body-' + label, [ 'code', 'form' ], 'nav-pills')
        // add link to attributes tab
        var $html = [
          $('<p>', {
            'class': 'small',
            html: [
              '<i class="ti-help-alt mr-2 text-info"></i>',
              $('<a>', {
                href: 'javascript:;',
                html: 'Body object structure',
                click: function () {
                  $Obj.$Navs.attributes.click()
                }
              })
            ]
          })
        ].concat($Body.$html)

        // update tab pane content
        $content.html($html)
        $Body.$Contents.code.html($editor)
        // create form element
        $form = $('<form>', {
          action: 'javascript:;',
          id: elId + 'form-' + label
        })
        $Body.$Contents.form.html($form)
      } else {
        // code editor only
        $content.html($editor)
      }

      // returns DOM elements
      return {
        $editor: $editor,
        $form: $form
      }
    }

    // setup request and response body
    var $ResBody = setupBody($Res, 'res')
    var $resBody = $ResBody.$editor
    // true for body form
    var $ReqBody = setupBody($Req, 'req', true)
    var $reqBody = $ReqBody.$editor
    var $reqForm = $ReqBody.$form

    // setup attributes divs for JSON Schema
    var $schema = $('<textarea>', {
      id: elId + 'json-schema'
    })
    var $attributes = $('<div>', {
      id: elId + 'attrs'
    })
    // nav to switch to schema and Bootstrap attributes list
    var $Attributes = $Tabs('schema', [ 'list', 'schema' ], 'nav-pills')
    $Attributes.$Contents.list.html($attributes)
    $Attributes.$Contents.schema.html($('<pre>', {
      html: $schema
    }))
    // pane DOM element
    $Req.$Contents.attributes.html($Attributes.$html)

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
      setHost: setHost,
      setMethod: setMethod,
      setUrl: setUrl,
      setParams: setParams,
      setReqHeaders: setReqHeaders,
      setResHeaders: setResHeaders,
      setStatusCode: setStatusCode,
      // callbacks for events
      cbSend: cbSend,
      cbSwitchResponse: cbSwitchResponse,
      cbParams: cbParams,
      cbHeaders: cbHeaders,
      // editors DOM elements
      $reqBody: $reqBody,
      $reqForm: $reqForm,
      $resBody: $resBody,
      // attributes
      $schema: $schema,
      $attributes: $attributes,
      // app main DOM element
      $layout: $layout
    }
  }

  // set globally
  window.Restform.layout = layout
}(jQuery))
