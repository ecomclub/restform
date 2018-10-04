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

  var setupForm = function ($el, Schema, dataCallback) {
    if (window.brutusin) {
      // assign new object to prevent unexpected changes
      var schema = JSON.parse(JSON.stringify(Schema))
      // start Brutusin JSON forms
      var BrutusinForms = brutusin['json-forms']
      var Bf = BrutusinForms.create(schema)
      BrutusinForms.postRender = function (instance) {
        var update = function () {
          // update data
          dataCallback(instance.getData())
        }
        $el.find('input,select').change(update)
        // add or remove array item
        $el.find('button').click(update)
      }
      // form DOM element
      var container = $el[0]

      // return update function
      return function (data) {
        // reset DOM element inner HTML
        $el.html('')
        var bf = Object.assign({}, Bf)
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
