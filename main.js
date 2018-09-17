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
    // new restform object
    var id = Date.now()
    restforms[id] = {}
    // returns ID for further use
    return id
  }

  // default options object
  var defaultOpt = {
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

    // show console
    restform.$app.fadeIn()
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
    // new restform object
    var id = init()
    var restform = restforms[id]

    // options object
    var opt = Object.assign({}, defaultOpt)
    restform.opt = opt
    if (typeof options === 'object' && options) {
      // merge
      Object.assign(opt, options)
    }

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
    // main DOM element
    restform.$app = Layout.$layout
    this.html(restform.$app)
    updateConsole(id)
  }

  // set global object
  /* global Restform */
  window.Restform = {}
}(jQuery))
