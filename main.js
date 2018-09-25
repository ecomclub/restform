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

      // add margin for fixed nav
      setTimeout(function () {
        $app.children('section').first().css('margin-top', $app.children('nav').outerHeight())
      }, 40)

      // update DOM
      $app = Layout.$layout
      restform.$app = $app
      this.html($app)
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
