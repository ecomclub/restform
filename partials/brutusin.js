/**
 * https://github.com/ecomclub/restform
 * ./partials/brutusin.js
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 */

// require 'https://cdn.jsdelivr.net/gh/brutusin/json-forms@1/dist/js/brutusin-json-forms.min.js'
/* global brutusin */

(function () {
  'use strict'

  var setupForm = function ($el, schema) {
    if (window.brutusin) {
      // start Brutusin JSON forms
      var BrutusinForms = brutusin['json-forms']
      var bf = BrutusinForms.create(schema)
      // form DOM element
      var container = $el[0]

      // return update function
      return function (data) {
        // render the form inside container
        // reset Brutusin form data
        bf.render(container, data)
      }
    }
    return null
  }

  // set globally
  window.Restform.setupBrutusin = setupForm
}())
