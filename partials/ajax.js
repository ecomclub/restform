/**
 * https://github.com/ecomclub/restform
 * ./partials/ajax.js
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 */

// require 'https://code.jquery.com/jquery-3.3.1.js'
/* global jQuery */

(function ($) {
  'use strict'

  var request = function (url, method, headers) {
    var $ajax = $.ajax({
      url: url,
      method: method,
      dataType: 'json',
      contentType: 'application/json; charset=UTF-8',
      headers: {
      },
      data: JSON.stringify({})
    })

    $ajax.done(function (json) {
    })
    $ajax.fail()

    // returns Ajax object
    return $ajax
  }

  // set globally
  window.Restform.send = request
}(jQuery))
