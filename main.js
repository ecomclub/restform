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
        indentationSpaces: 4
      },
      // response from last live request
      liveResponse: {}
    }

    // returns ID for further use
    return id
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

  var updateBody = function (id, responseBody) {
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

          // use Ace editor also for JSON Schema
          // true for read only
          var schemaEditor = Restform.setupAce(Layout.$schema, true, opt.aceTheme)
          // show JSON Schema
          var prettySchema = JSON.stringify(opt.schema, null, opt.indentationSpaces)
          if (typeof schemaEditor === 'function') {
            schemaEditor(prettySchema)
          } else {
            Layout.$schema.html(prettySchema)
          }
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
      Layout.cbSend(function () {
        var sendCallback = function (status, body) {
          saveResponse(status, body, id)
        }
        Restform.send(opt.url, opt.method, opt.reqHeaders, opt.reqBody, sendCallback)
      })

      // switch live and sample responses
      Layout.cbSwitchResponse(function (isLive) {
        if (isLive) {
          updateBody(id, restform.liveResponse.body)
        } else {
          updateBody(id, restform.resBody)
        }
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
