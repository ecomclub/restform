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

  // setup as jQuery plugin
  $.fn.restform = function (options) {
    // default options object
    var opt = {
      params: [],
      reqHeaders: [],
      aceTheme: '',
      indentationSpaces: 4
    }
    if (typeof options === 'object' && options) {
      // merge
      Object.assign(opt, options)
    }

    // compose API Console App layout
    var Layout = Restform.layout()
    Layout.setReqParams(opt.params)
    Layout.setReqHeaders(opt.reqHeaders)

    // setup Ace editor
    setTimeout(function () {
      var bodyEditor
      var $editor = Layout.$resBody
      if ($editor) {
        // true for read only
        Restform.setupAce($editor, true, opt.aceTheme)
      }
      $editor = Layout.$reqBody
      if ($editor) {
        bodyEditor = Restform.setupAce($editor, false, opt.aceTheme)
      }

      if (typeof bodyEditor === 'function' && opt.reqBody) {
        // update editor content
        try {
          var json = JSON.stringify(opt.reqBody, null, opt.indentationSpaces)
          bodyEditor(json)
        } catch (e) {
          console.error('Invalid request body', e)
        }
      }
    }, 400)

    // update DOM
    this.html(Layout.$layout)
  }

  // set global object
  /* global Restform */
  window.Restform = {}
}(jQuery))
