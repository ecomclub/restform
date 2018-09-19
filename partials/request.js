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

  // auxiliary parse endpoint with params function
  var parseEndpoint = function (pattern, params) {
    var i, param
    var queryParams = []

    // replace each param on URL
    for (i = 0; i < params.length; i++) {
      param = params[i]
      var key = param.key
      var value = param.value
      if (typeof value === 'string' && value !== '') {
        // replace param with value
        var regex = new RegExp('{' + key + '}')
        if (regex.test(pattern)) {
          pattern = pattern.replace(new RegExp('{' + key + '}'), value)
        } else {
          // put this param on query string
          queryParams.push(param)
        }
      }
    }
    // remove query part
    pattern = pattern.replace(/{[^}]+}/g, '')

    if (queryParams.length) {
      // build query string
      var query = '?'
      // add each remaining param
      for (i = 0; i < queryParams.length; i++) {
        param = queryParams[i]
        if (i > 0) {
          // not first
          query += '&'
        }
        query += param.key + '=' + param.value
      }
      pattern = pattern + query
    }

    // returns parsed string
    return pattern
  }

  var request = function (url, method, headers, body, callback) {
    // jQuery Ajax options
    var options = {
      url: url,
      method: method,
      dataType: 'json',
      contentType: 'application/json; charset=UTF-8'
    }
    if (headers) {
      // optional headers object
      options.headers = headers
    }
    if (body) {
      // JSON body
      options.data = JSON.stringify(body)
    }

    var cb = function (jqXHR, err) {
      // console.log(jqXHR)
      if (jqXHR) {
        var body = jqXHR.responseJSON
        var status = jqXHR.status
        if (callback) {
          // return status code and body
          callback(status, body)
        } else {
          // debug only
          console.log(status, body)
        }
      } else if (err) {
        console.error(err)
      }
    }

    // run xhr
    var $ajax = $.ajax(options)
    $ajax.done(function (data, textStatus, jqXHR) {
      cb(jqXHR)
    })
    $ajax.fail(function (jqXHR, textStatus, errorThrown) {
      cb(jqXHR, errorThrown)
    })
    // returns Ajax object
    return $ajax
  }

  // set globally
  window.Restform.send = request
  window.Restform.parseEndpoint = parseEndpoint
}(jQuery))
