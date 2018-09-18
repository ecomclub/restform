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

  var request = function (url, method, params, headers, body, callback) {
    var i
    // jQuery Ajax options
    var options = {
      url: url,
      method: method,
      dataType: 'json',
      contentType: 'application/json; charset=UTF-8',
      headers: {}
    }
    // handle headers list
    for (i = 0; i < headers.length; i++) {
      options.headers[headers[i].key] = headers[i].value
    }
    if (body) {
      // JSON body
      options.data = JSON.stringify(body)
    }

    var cb = function (jqXHR) {
      console.log(jqXHR)
    }

    // run xhr
    var $ajax = $.ajax(options)
    $ajax.done(function (data, textStatus, jqXHR) {
      cb(jqXHR)
    })
    $ajax.fail(function (jqXHR, textStatus, errorThrown) {
      cb(jqXHR)
    })
    // returns Ajax object
    return $ajax
  }

  // set globally
  window.Restform.send = request
}(jQuery))
