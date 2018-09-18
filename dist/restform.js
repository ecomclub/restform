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
        method: 'POST',
        params: [
          // { key: 'id', value: '123', description: 'Resource ID' }
        ],
        reqHeaders: [
          { key: 'Content-Type', value: 'application/json', description: '' }
        ],
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
    Layout.setReqParams(opt.params)
    Layout.setReqHeaders(opt.reqHeaders)
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

      // setup Ace editor
      setTimeout(function () {
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
        updateBody(id)
      }, 400)

      // update DOM
      $app = Layout.$layout
      restform.$app = $app
      this.html($app)
      updateConsole(id)
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
    var setReqParams = function (params) {
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
      setReqParams: setReqParams,
      setReqHeaders: setReqHeaders,
      setResHeaders: setResHeaders,
      // editors DOM elements
      $reqBody: $reqBody,
      $reqForm: $reqForm,
      $resBody: $resBody,
      // app main DOM element
      $layout: $layout
    }
  }

  // set globally
  window.Restform.layout = layout
}(jQuery))
