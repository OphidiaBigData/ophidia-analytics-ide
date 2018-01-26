/*
    Ophidia Analytics IDE
    Copyright (C) 2017-2018 CMCC Foundation

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

(function () {
  'use strict';

  angular
    .module('ophidiaAnalyticsIDE.editor.directives')
    .directive('jsPlumbObject', jsPlumbObject);


  function jsPlumbObject() {

      var def = {
        restrict : 'E',
        require: '^jsPlumbCanvas',
        scope: {
            ngClick: '&ngClick',
            stateObject: '=stateObject'
        },
        transclude : true,
        template: '"<div id="{{scope.stateObject.name}}"><div ng-transclude></div>',
        controller: 'EditorController',
        link : function(scope, element, attrs, jsPlumbCanvas) {
            var instance = jsPlumbCanvas.scope.jsPlumbInstance;

            instance.draggable(element, {

                drag: function (event, ui) {
                    scope.stateObject.x = ui.position.left;
                    scope.stateObject.y = ui.position.top;
                    scope.$apply();
                }

            });


            scope.$on('$destroy', function(){

            });


           element.bind('click', function() {
                $('.state_window').removeClass('activeTask');
                element.addClass('activeTask');
                scope.ngClick(scope.stateObject);

        });



        }
    };
    return def;
 }
})();
