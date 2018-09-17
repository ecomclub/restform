/**
 * https://github.com/ecomclub/restform
 * ./partials/ace.js
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 */

// require 'https://cdn.jsdelivr.net/npm/ace-builds@1/src-min-noconflict/ace.js'
/* global ace */

(function (ace) {
  'use strict'

  var setupEditor = function (elId, theme) {
    if (ace) {
      // set up JSON code editor
      var editor = ace.edit(elId)
      // change editor theme
      if (!theme || theme === '') {
        // default theme
        theme = 'dawn'
      }
      editor.setTheme('ace/theme/' + theme)
      editor.session.setMode('ace/mode/json')
      return editor
    }
    return null
  }

  // set globally
  window.Restform.Ace = {
    setup: setupEditor
  }
}(ace))
