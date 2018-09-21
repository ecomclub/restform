/**
 * https://github.com/ecomclub/restform
 * ./partials/ace.js
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 */

// require 'https://cdn.jsdelivr.net/npm/ace-builds@1/src-min-noconflict/ace.js'
/* global ace */

(function () {
  'use strict'

  var setupEditor = function ($el, readOnly, theme, dataCallback) {
    if (window.ace) {
      var id = $el.attr('id')
      // DOM element to show editor
      var $button = $el.closest('section').find('[aria-controls="' + $el.parent().attr('id') + '"]')

      // set up JSON code editor
      var editor = ace.edit(id)
      // change editor theme
      if (!theme || theme === '') {
        // default theme
        theme = 'dawn'
      }
      editor.setTheme('ace/theme/' + theme)
      editor.session.setMode('ace/mode/json')

      if (readOnly) {
        // disable edition
        editor.setReadOnly(true)
      } else {
        editor.on('blur', function () {
          // code editor manually changed (?)
          var json
          try {
            json = JSON.parse(editor.session.getValue())
          } catch (e) {
            // invalid JSON
            return
          }
          // update data
          dataCallback(json)
        })
      }

      var forceUpdate = function () {
        // focus on editor and force viewport update
        setTimeout(function () {
          editor.focus()
          editor.renderer.updateFull()
        }, 200)
      }
      // minor element fixes
      $el.click(forceUpdate)
      $button.click(forceUpdate)

      // return update function
      return function (str) {
        // reset Ace editor content
        editor.session.setValue(str)
      }
    }
    return null
  }

  // set globally
  window.Restform.setupAce = setupEditor
}())
