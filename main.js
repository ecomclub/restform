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
    var bodyEditor = restform.bodyEditor

    // update body editor with current options request body
    if (typeof bodyEditor === 'function' && opt.reqBody) {
      // update editor content
      try {
        var json = JSON.stringify(opt.reqBody, null, opt.indentationSpaces)
        bodyEditor(json)
      } catch (e) {
        console.error('Invalid request body', e)
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
        var $editor = Layout.$resBody
        if ($editor) {
          // true for read only
          Restform.setupAce($editor, true, opt.aceTheme)
        }
        $editor = Layout.$reqBody
        if ($editor) {
          // store returned function for content update
          restform.bodyEditor = Restform.setupAce($editor, false, opt.aceTheme)
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
