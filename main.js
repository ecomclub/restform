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
      reqHeaders: []
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
    var bodyEditor
    setTimeout(function () {
      var $editor = Layout.$reqBody
      if ($editor) {
        bodyEditor = Restform.setupAce($editor)
      }

      if (typeof bodyEditor === 'function') {
        bodyEditor(JSON.stringify({ name: 'Test' }, null, 2))
      }
    }, 400)

    // update DOM
    this.html(Layout.$layout)
  }

  // set global object
  /* global Restform */
  window.Restform = {}
}(jQuery))
