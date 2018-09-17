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

  // default options object
  var opt = {
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

  // Layout methods and DOM elements
  var Layout
  // Ace editor object for request body
  var bodyEditor
  // main DOM element
  var $app

  var updateConsole = function () {
    // update DOM with current options
    Layout.setTitle(opt.title)
    Layout.setUrl(opt.url)
    Layout.setMethod(opt.method)
    Layout.setReqParams(opt.params)
    Layout.setReqHeaders(opt.reqHeaders)
    // show console
    $app.fadeIn()
  }

  var updateBody = function () {
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
    if (typeof options === 'object' && options) {
      // merge
      Object.assign(opt, options)
    }

    // compose API Console App layout
    Layout = Restform.layout()

    // setup Ace editor
    setTimeout(function () {
      var $editor = Layout.$resBody
      if ($editor) {
        // true for read only
        Restform.setupAce($editor, true, opt.aceTheme)
      }
      $editor = Layout.$reqBody
      if ($editor) {
        bodyEditor = Restform.setupAce($editor, false, opt.aceTheme)
      }
      updateBody()
    }, 400)

    // update DOM
    $app = this
    $app.hide()
    $app.html(Layout.$layout)
    updateConsole()
  }

  // set global object
  /* global Restform */
  window.Restform = {}
}(jQuery))
