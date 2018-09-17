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
    var i

    // compose API Console App layout
    var Layout = Restform.layout()
    Layout.setReqParams([
      { text: 'ID', description: 'Resource ID' }
    ])
    Layout.setReqHeaders([])

    // setup Ace editor
    setTimeout(function () {
      var $editors = Layout.$editors
      if (Array.isArray($editors)) {
        for (i = 0; i < $editors.length; i++) {
          Restform.Ace.setup($editors[i].attr('id'))
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
