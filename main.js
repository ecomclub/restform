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
  $.fn.restform = function () {
    // compose API Console App layout
    var Layout = Restform.layout()
    Layout.setReqParams([
      { text: 'ID', description: 'Resource ID' }
    ])
    Layout.setReqHeaders([])
    Layout.setReqBody(JSON.stringify({ name: 'Test' }, null, 2))

    // update DOM
    this.html(Layout.$layout)
  }

  // set global object
  /* global Restform */
  window.Restform = {}
}(jQuery))
