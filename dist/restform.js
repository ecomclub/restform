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
        url: 'https://api.e-com.plus/v1/',
        method: 'GET',
        // URL parameters
        params: [
          // { key: 'id', value: '123', description: 'Resource ID' }
        ],
        // headers list
        reqHeaders: [
          { key: 'Content-Type', value: 'application/json', description: '' }
        ],
        // JSON schema object
        schema: null,
        // request JSON body object
        reqBody: null,
        // example response
        // response status code
        statusCode: 200,
        // response headers
        resHeaders: [
          { key: 'Content-Type', value: 'application/json', description: '' }
        ],
        // response body object
        resBody: null,
        // Ace editor theme name
        aceTheme: '',
        indentationSpaces: 4
      }
    }

    // returns ID for further use
    return id
  }

  var updateConsole = function (id) {
    // get restform object
    var restform = restforms[id]
    var opt = restform.opt
    var Layout = restform.Layout

    // update DOM with current options
    Layout.setTitle(opt.title)
    Layout.setUrl(opt.url)
    Layout.setMethod(opt.method)
    Layout.setParams(opt.params)
    Layout.setReqHeaders(opt.reqHeaders)
    Layout.setResHeaders(opt.resHeaders)
    Layout.setStatusCode(opt.statusCode)
  }

  var updateBody = function (id) {
    // get restform object
    var restform = restforms[id]
    var opt = restform.opt
    var body = {
      'req': opt.reqBody,
      'res': opt.resBody
    }
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

    if (typeof restform.bodyForm === 'function' && body.req) {
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
      var Layout = Restform.layout()
      restform.Layout = Layout

      setTimeout(function () {
        // setup Ace editor
        var $Editor = {
          'req': Layout.$reqBody,
          'res': Layout.$resBody
        }
        restform.bodyEditor = {}

        for (var label in $Editor) {
          if ($Editor[label]) {
            var readOnly
            if (label === 'res') {
              // do not edit the response body
              readOnly = true
            }
            // store returned function for content update
            restform.bodyEditor[label] = Restform.setupAce($Editor[label], readOnly, opt.aceTheme)
          }
        }

        if (opt.schema) {
          if (Layout.$reqForm) {
            // setup form for request body from JSON Schema
            restform.bodyForm = Restform.setupBrutusin(Layout.$reqForm, opt.schema)
          }
          // show JSON Schema
          Layout.$schema.html(JSON.stringify(opt.schema, null, opt.indentationSpaces))
          // render schema
          if (window.twbschema) {
            twbschema.doc(Layout.$attributes[0], opt.schema)
          }
        }

        // update body editors and form with JSON data
        updateBody(id)
      }, 400)

      // update DOM
      $app = Layout.$layout
      restform.$app = $app
      this.html($app)
      updateConsole(id)

      // set events callbacks
      Layout.$send.click(function () {
        Restform.send(opt.url, opt.method, opt.params, opt.reqHeaders)
      })
    } else {
      // element initialized
      $app = restform.$app
      // update only
      updateConsole(id)
      updateBody(id)
    }

    // show console
    $app.fadeIn()
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

  var setupEditor = function ($el, readOnly, theme) {
    if (window.ace) {
      var id = $el.attr('id')
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
      }

      // minor element fixes
      $el.click(function () {
        // focus on editor and force viewport update
        setTimeout(function () {
          editor.focus()
          editor.renderer.updateFull()
        }, 200)
      })

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
 * ./partials/ajax.js
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 */

// require 'https://code.jquery.com/jquery-3.3.1.js'
/* global jQuery */

(function ($) {
  'use strict'

  var request = function (url, method, params, headers, body, callback) {
    var i
    // jQuery Ajax options
    var options = {
      url: url,
      method: method,
      dataType: 'json',
      contentType: 'application/json; charset=UTF-8',
      headers: {}
    }
    // handle headers list
    for (i = 0; i < headers.length; i++) {
      options.headers[headers[i].key] = headers[i].value
    }
    if (body) {
      // JSON body
      options.data = JSON.stringify(body)
    }

    var cb = function (jqXHR) {
      console.log(jqXHR)
    }

    // run xhr
    var $ajax = $.ajax(options)
    $ajax.done(function (data, textStatus, jqXHR) {
      cb(jqXHR)
    })
    $ajax.fail(function (jqXHR, textStatus, errorThrown) {
      cb(jqXHR)
    })
    // returns Ajax object
    return $ajax
  }

  // set globally
  window.Restform.send = request
}(jQuery))
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

  var setupForm = function ($el, schema) {
    if (window.brutusin) {
      // start Brutusin JSON forms
      var BrutusinForms = brutusin['json-forms']
      var bf = BrutusinForms.create(schema)
      // form DOM element
      var container = $el[0]

      // return update function
      return function (data) {
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

  var layout = function () {
    // var i, html

    /* setup layout components */

    // API, resource or action title
    var $title = $('<h5>', {
      'class': 'm-0 restform-title'
    })
    var setTitle = function (title) {
      $title.text(title)
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

      // return table DOM element
      return $('<table>', {
        'class': 'table table-striped',
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
      label = 'restform-' + label
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
    var $Req = $Tabs('req', [ 'params', 'headers', 'body', 'attributes' ])
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
    var $Res = $Tabs('res', [ 'headers', 'body' ])
    var $response = $('<section>', {
      id: 'restform-response',
      html: [
        $Header('<span class="lead">Response</span>'),
        $('<div>', {
          'class': 'container',
          html: [
            $switchResponse,
            $('<div>', {
              'class': 'lead mt-3',
              html: [
                '<span class="mr-2">Response status code</span>',
                $status
              ]
            }),
            $('<div>', {
              'class': 'mt-3',
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

      if (Array.isArray(list) && list.length) {
        enableNav($nav)
        for (var i = 0; i < list.length; i++) {
          var item = list[i]
          // new table row
          $items.push($('<tr>', {
            html: [
              $('<td>', {
                html: '<code>' + item.key + '</code>'
              }),
              $('<td>', {
                html: $('<input>', {
                  'class': 'form-control form-control-sm',
                  type: 'text',
                  readonly: !!(readOnly),
                  value: item.value
                })
              }),
              $('<td>', {
                text: item.description
              })
            ]
          }))
        }

        // create table element
        // update tab pane content
        $content.html($Table($items))
      } else {
        // no URL params
        disableNav($nav)
      }
    }

    // update params button and table
    var setParams = function (params) {
      setTable($Req, 'params', params)
    }

    // update headers button and table
    var setReqHeaders = function (headers) {
      setTable($Req, 'headers', headers)
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
        id: 'restform-body-' + label
      })
      var $form

      if (genForm) {
        // nav for JSON editor and form fields
        var $Body = $Tabs('body-' + label, [ 'code', 'form' ], 'nav-pills')
        // update tab pane content
        $content.html($Body.$html)
        $Body.$Contents.code.html($editor)
        // create form element
        $form = $('<form>', {
          action: 'javascript:;',
          id: 'restform-form-' + label
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
    var $schema = $('<code class="json language-json"></code>')
    var $attributes = $('<div>')
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
      setMethod: setMethod,
      setUrl: setUrl,
      setParams: setParams,
      setReqHeaders: setReqHeaders,
      setResHeaders: setResHeaders,
      setStatusCode: setStatusCode,
      // buttons
      $send: $send,
      $switchResponse: $switchResponse,
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
