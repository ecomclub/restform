/**
 * https://github.com/ecomclub/restform
 * ./partials/layout.js
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 */

// require 'https://code.jquery.com/jquery-3.3.1.js'
/* global jQuery */

(function ($) {
  'use strict'

  var layout = function () {
    return $('<article>', {
      'class': 'restform',
      css: {
        width: '100wh',
        height: '100vh'
      }
    })
  }

  // set globally
  window.Restform.layout = layout
}(jQuery))
