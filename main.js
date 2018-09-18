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
        method: 'GET',
        params: [],
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
