/**
 * https://github.com/ecomclub/restform
 * ./main.js
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 */

// require 'https://code.jquery.com/jquery-3.3.1.js'
/* global jQuery */

// include 'https://cdn.jsdelivr.net/npm/twbschema@1/dist/twbschema.min.js'
/* global twbschema */

(function ($) {
  'use strict'

  // store
  var restforms = {}
  var init = function () {
    // unique ID
    var id = Date.now()

    // new restform object
    restforms[id] = {
      // default options object
      opt: {
        title: 'API Console',
        host: 'https://api.e-com.plus/v1',
        endpoint: '/products/{_id}.json',
        method: 'GET',
        // URL parameters
        params: [
          { key: '_id', value: '123', description: 'Resource ID', required: true }
        ],
        // headers list
        reqHeaders: {
          'Content-Type': 'application/json'
        },
        // JSON schema object
        schema: null,
        // request JSON body object
        reqBody: null,
        // example response
        // response status code
        statusCode: 200,
        // response headers
        resHeaders: {
          'Content-Type': 'application/json'
        },
        // response body object
        resBody: null,
        // Ace editor theme name
        aceTheme: '',
        indentationSpaces: 4,
        // callback function for headeers changed events
        chageHeadersCallback: null
      },
      // response from last live request
      liveResponse: {},
      // rendered full URL
      url: ''
    }

    // returns ID for further use
    return id
  }

  var makeUrl = function (restform) {
    // abstraction to get full URL from restform options
    var opt = restform.opt
    var url = opt.host + Restform.parseEndpoint(opt.endpoint, opt.params)
    // save rendered URL
    restform.url = url
    return url
  }

  var saveResponse = function (status, body, id) {
    var restform = restforms[id]
    // save live request response
    // status and body
    restform.liveResponse.status = status
    restform.liveResponse.body = body

    // update DOM
    updateBody(id, body)
    restform.Layout.setStatusCode(status)
  }

  var dataCallback = function (id, json, isAce) {
    // callback for JSON data update
    restforms[id].opt.reqBody = json
    // skip form or editor
    var skipEditor = !!(isAce)
    var skipForm = !skipEditor
    updateBody(id, null, skipEditor, skipForm)
  }

  var updateConsole = function (id) {
    // get restform object
    var restform = restforms[id]
    var opt = restform.opt
    var Layout = restform.Layout

    // update DOM with current options
    Layout.setTitle(opt.title)
    Layout.setHost(opt.host, opt.endpoint)
    Layout.setUrl(makeUrl(restform))
    Layout.setMethod(opt.method)
    Layout.setParams(opt.params)
    Layout.setReqHeaders(opt.reqHeaders)
    Layout.setResHeaders(opt.resHeaders)
    Layout.setStatusCode(opt.statusCode)

    // update JSON Schema
    if (opt.schema) {
      if (Layout.$reqForm) {
        // setup form for request body from JSON Schema
        restform.bodyForm = Restform.setupBrutusin(Layout.$reqForm, opt.schema, function (json) {
          dataCallback(id, json)
        })
      }

      // show JSON Schema
      Layout.setSchema(JSON.stringify(opt.schema, null, opt.indentationSpaces))
      // render schema
      if (window.twbschema) {
        Layout.$attributes.html(twbschema.doc(null, opt.schema))
      }
    }
  }

  var updateBody = function (id, responseBody, skipEditor, skipForm) {
    // get restform object
    var restform = restforms[id]
    var opt = restform.opt
    var body
    if (!responseBody) {
      body = {
        req: opt.reqBody,
        res: opt.resBody
      }
    } else {
      // updates response body only
      body = {
        res: responseBody
      }
    }

    if (!skipEditor) {
      var bodyEditor = restform.bodyEditor

      // update request and response body
      for (var label in bodyEditor) {
        var update = bodyEditor[label]
        if (typeof update === 'function') {
          // update editor content
          if (body[label]) {
            try {
              var json = JSON.stringify(body[label], null, opt.indentationSpaces)
              update(json)
            } catch (e) {
              console.error('Invalid request body', e)
            }
          } else {
            // clear
            update('')
          }
        }
      }
    }

    if (!skipForm && typeof restform.bodyForm === 'function') {
      // update Brutusin Form with current JSON data
      restform.bodyForm(body.req)
    }
  }

  // setup as jQuery plugin
  $.fn.restform = function (options) {
    // main DOM element
    var $app, initializing
    // control ID
    var id = this.data('restform')

    if (!id) {
      // new restform object
      id = init()
      initializing = true
    }
    // work with restform object
    var restform = restforms[id]

    // uodate options object
    var opt = restform.opt
    if (typeof options === 'object' && options) {
      // merge
      Object.assign(opt, options)
    }

    if (initializing) {
      // Layout methods and DOM elements
      // compose API Console App layout
      var Layout = Restform.layout(id)
      restform.Layout = Layout

      setTimeout(function () {
        // setup Ace editor
        var aceCallback = function (json) {
          // true for isAce
          dataCallback(id, json, true)
        }

        // DOM elements
        var $Editor = {
          'req': Layout.$reqBody,
          'res': Layout.$resBody
        }
        restform.bodyEditor = {}

        for (var label in $Editor) {
          var $el = $Editor[label]
          if ($el) {
            var readOnly
            if (label === 'res') {
              // do not edit the response body
              readOnly = true
            }
            // store returned function for content update
            restform.bodyEditor[label] = Restform.setupAce($el, readOnly, opt.aceTheme, aceCallback)
          }
        }

        // update body editors and form with JSON data
        updateBody(id)
      }, 400)

      // send event callback
      Layout.cbSend(function () {
        var $spinner = Layout.$loading
        var sendCallback = function (status, body) {
          saveResponse(status, body, id)
          $spinner.fadeOut('slow')
        }
        setTimeout(function () {
          Restform.send(restform.url, opt.method, opt.reqHeaders, opt.reqBody, sendCallback)
        }, 100)
        // show loading
        $spinner.fadeIn()
      })

      // switch live and sample responses
      Layout.cbSwitchResponse(function (isLive) {
        // update response status and body
        var status, body
        if (isLive) {
          status = restform.liveResponse.status
          body = restform.liveResponse.body
        } else {
          // preseted sample response
          status = opt.statusCode
          body = opt.resBody
        }
        Layout.setStatusCode(status)
        updateBody(id, body)
      })

      // handle params edition
      Layout.cbParams(function (params) {
        // console.log(params)
        // save new params
        opt.params = params
        // update rendered URL
        Layout.setUrl(makeUrl(restform))
      })

      // handle headers edition
      Layout.cbHeaders(function (headers) {
        // console.log(headers)
        // save new headers
        opt.headers = headers
        // external callback
        if (typeof opt.chageHeadersCallback === 'function') {
          opt.chageHeadersCallback(headers)
        }
      })

      // get console element
      $app = Layout.$layout
      restform.$app = $app

      // add margin for fixed nav
      var $nav = Layout.$nav
      var navHeight = $nav.outerHeight()
      // show and hide sticky nav with modal
      $app.css('padding-top', navHeight).on('show.bs.modal', function () {
        $nav.fadeIn()
      }).on('hide.bs.modal', function () {
        $nav.fadeOut()
      })
      // fix nav opacity
      $nav.hide().css('opacity', 1)

      // mark element and update DOM
      this.data('restform', id).html($app)
    } else {
      // element initialized
      $app = restform.$app
      // update only
      updateBody(id)
    }
    updateConsole(id)

    // scroll to top
    // $('html, body').animate({ scrollTop: $app.offset().top }, 'slow')
    // show console
    $app.modal('show')
  }

  // set global object
  /* global Restform */
  window.Restform = {}
}(jQuery))
;

/**
 * https://github.com/ecomclub/restform
 * ./partials/ace.js
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 */

// require 'https://cdn.jsdelivr.net/npm/ace-builds@1/src-min-noconflict/ace.js'
/* global ace */

(function () {
  'use strict'

  var setupEditor = function ($el, readOnly, theme, dataCallback) {
    if (window.ace) {
      var id = $el.attr('id')
      // DOM element to show editor
      var $button = $el.closest('section').find('[aria-controls="' + $el.parent().attr('id') + '"]')

      // set up JSON code editor
      var editor = ace.edit(id)
      // change editor theme
      if (!theme || theme === '') {
        // default theme
        theme = 'dawn'
      }
      editor.setTheme('ace/theme/' + theme)
      editor.session.setMode('ace/mode/json')

      if (readOnly) {
        // disable edition
        editor.setReadOnly(true)
      } else {
        editor.on('blur', function () {
          // code editor manually changed (?)
          var json
          try {
            json = JSON.parse(editor.session.getValue())
          } catch (e) {
            // invalid JSON
            return
          }
          // update data
          dataCallback(json)
        })
      }

      var forceUpdate = function () {
        // focus on editor and force viewport update
        setTimeout(function () {
          editor.focus()
          editor.renderer.updateFull()
        }, 200)
      }
      // minor element fixes
      $el.click(forceUpdate)
      $button.click(forceUpdate)

      // return update function
      return function (str) {
        // reset Ace editor content
        editor.session.setValue(str)
      }
    }
    return null
  }

  // set globally
  window.Restform.setupAce = setupEditor
}())
;

/**
 * https://github.com/ecomclub/restform
 * ./partials/brutusin.js
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 */

// require 'https://cdn.jsdelivr.net/gh/brutusin/json-forms@1/dist/js/brutusin-json-forms.min.js'
/* global brutusin */

(function () {
  'use strict'

  var setupForm = function ($el, schema, dataCallback) {
    if (window.brutusin) {
      // start Brutusin JSON forms
      var BrutusinForms = brutusin['json-forms']
      var Bf = BrutusinForms.create(schema)
      BrutusinForms.postRender = function (instance) {
        $el.find('input,select').change(function () {
          // update data
          dataCallback(instance.getData())
        })
      }
      // form DOM element
      var container = $el[0]

      // return update function
      return function (data) {
        // reset DOM element inner HTML
        $el.html('')
        var bf = Object.assign({}, Bf)
        // render the form inside container
        // reset Brutusin form data
        bf.render(container, data)
      }
    }
    return null
  }

  // set globally
  window.Restform.setupBrutusin = setupForm
}())
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
      id: elId + 'nav',
      'class': 'shadow-sm restform-nav',
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
                      // $layout.fadeOut()
                      $layout.modal('hide')
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
      label = elId + label
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

    // CSS loading spinner
    var $loading = $('<div>', {
      'class': 'restform-loading',
      html: $('<div>', {
        html: $('<div>', {
          'class': 'restform-spinner',
          html: '<div></div><div></div>'
        })
      })
    })

    // response section content
    var $Res = $Tabs('res', [ 'body', 'headers' ])
    var $response = $('<section>', {
      id: elId + 'response',
      html: [
        $loading,
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
      // no content
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
                  placement: 'top',
                  container: $content
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
          'class': 'restform-form',
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
    var $schema = $('<code>', {
      class: 'language-json',
      id: elId + 'json-schema'
    })
    var setSchema = function (schemaString) {
      // update DOM
      $schema.text(schemaString)
      // have attributes
      enableNav($Req.$Navs.attributes)
    }
    // disable attrbutes nav by default
    disableNav($Req.$Navs.attributes)

    var $attributes = $('<div>', {
      'class': 'restform-attrs',
      id: elId + 'attrs'
    })
    // nav to switch to schema and Bootstrap attributes list
    var $Attributes = $Tabs('schema', [ 'list', 'schema' ], 'nav-pills')
    $Attributes.$Contents.list.html($attributes)
    $Attributes.$Contents.schema.html($('<pre>', {
      class: 'restform-schema language-json',
      html: $schema
    }))
    // pane DOM element
    $Req.$Contents.attributes.html($Attributes.$html)

    // composed layout
    var $layout = $('<article>', {
      'class': 'modal fade',
      tabindex: -1,
      role: 'dialog',
      id: elId + 'modal',
      'aria-labelledby': elId + 'modal',
      'aria-hidden': true,
      html: $('<div>', {
        'class': 'modal-dialog restform-modal',
        html: $('<div>', {
          'class': 'modal-content restform',
          html: [
            $request,
            $response
          ]
        })
      })
    })
    // add sticky nav to document body
    $('body').prepend($nav)

    var setTitle = function (title) {
      // called on new transactions only
      $title.text(title)
      // reset switch response button
      if (isLiveRes) {
        isLiveRes = false
        $switchResponse.children('b').text('Sample')
      }
    }

    // return object with DOM element and reactive functions
    return {
      setTitle: setTitle,
      setHost: setHost,
      setMethod: setMethod,
      setUrl: setUrl,
      setParams: setParams,
      setSchema: setSchema,
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
      // loading spinner
      $loading: $loading,
      // app main DOM element
      $layout: $layout,
      $nav: $nav
    }
  }

  // set globally
  window.Restform.layout = layout
}(jQuery))
;

/**
 * https://github.com/ecomclub/restform
 * ./partials/ajax.js
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 */

// require 'https://code.jquery.com/jquery-3.3.1.js'
/* global jQuery */

(function ($) {
  'use strict'

  // auxiliary parse endpoint with params function
  var parseEndpoint = function (pattern, params) {
    var i, param
    var queryParams = []

    // replace each param on URL
    for (i = 0; i < params.length; i++) {
      param = params[i]
      var key = param.key
      var value = param.value
      if (typeof value === 'string' && value !== '') {
        // replace param with value
        var regex = new RegExp('{' + key + '}')
        if (regex.test(pattern)) {
          pattern = pattern.replace(new RegExp('{' + key + '}'), value)
        } else {
          // put this param on query string
          queryParams.push(param)
        }
      }
    }
    // remove query part
    pattern = pattern.replace(/{[^}]+}/g, '')

    if (queryParams.length) {
      // build query string
      var query = '?'
      // add each remaining param
      for (i = 0; i < queryParams.length; i++) {
        param = queryParams[i]
        if (i > 0) {
          // not first
          query += '&'
        }
        query += param.key + '=' + param.value
      }
      pattern = pattern + query
    }

    // returns parsed string
    return pattern
  }

  var request = function (url, method, headers, body, callback) {
    // jQuery Ajax options
    var options = {
      url: url,
      method: method,
      dataType: 'json',
      contentType: 'application/json; charset=UTF-8'
    }
    if (headers) {
      // optional headers object
      options.headers = headers
    }
    if (body) {
      // JSON body
      options.data = JSON.stringify(body)
    }

    var cb = function (jqXHR, err) {
      // console.log(jqXHR)
      if (jqXHR) {
        var body = jqXHR.responseJSON
        var status = jqXHR.status
        if (callback) {
          // return status code and body
          callback(status, body)
        } else {
          // debug only
          console.log(status, body)
        }
      } else if (err) {
        console.error(err)
      }
    }

    // run xhr
    var $ajax = $.ajax(options)
    $ajax.done(function (data, textStatus, jqXHR) {
      cb(jqXHR)
    })
    $ajax.fail(function (jqXHR, textStatus, errorThrown) {
      cb(jqXHR, errorThrown)
    })
    // returns Ajax object
    return $ajax
  }

  // set globally
  window.Restform.send = request
  window.Restform.parseEndpoint = parseEndpoint
}(jQuery))
