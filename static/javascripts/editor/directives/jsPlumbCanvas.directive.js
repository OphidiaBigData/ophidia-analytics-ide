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
    .directive('jsPlumbCanvas', jsPlumbCanvas);

  function jsPlumbCanvas() {

      var jsPlumbZoomCanvas = function(instance, zoom, el, transformOrigin) {
           transformOrigin = transformOrigin || [ 0, 0];
           var p = [ "webkit", "moz", "ms", "o" ],
               s = "scale(" + zoom + ")",
               oString = (transformOrigin[0] * 100) + "% " + (transformOrigin[1] * 100) + "%";
           for (var i = 0; i < p.length; i++) {
               el.style[p[i] + "Transform"] = s;
               el.style[p[i] + "TransformOrigin"] = oString;
           }
           el.style["transform"] = s;
           el.style["transformOrigin"] = oString;
           instance.setZoom(zoom);
       };

       var def = {
           restrict: 'E',
           scope: {
               onConnection: '=onConnection',
               zoom: '=',
               x: '=',
               y: '='
           },
           controller: function ($scope) {
               this.scope = $scope;
           },
           transclude: true,
           template: '<div ng-transclude></div>',
           link: function(scope, element, attr){

               var instance = jsPlumb.getInstance();
               scope.jsPlumbInstance = instance;

              instance.bind("connection", function(info, origEvent) {
                if(typeof origEvent !== 'undefined' && origEvent.type == 'drop'){
                   var targetUUID = $(info.target).attr('uuid');
                   var sourceUUID = $(info.source).attr('uuid');
                   scope.onConnection(instance, info.connection, targetUUID, sourceUUID);
                   instance.detach(info.connection);
                }
              });

               $(element).css({
                   minWidth: '1000px',
                   minHeight: '1000px',
                   display: 'block',
               }).draggable({
                   stop: function(event, ui) {
                       var position = $(this).position();
                       scope.x = position.left;
                       scope.y = position.top;
                       scope.$parent.$apply();
                   }
               });

               instance.setContainer($(element));
               var container = instance.getContainer();


               var zoom = (typeof scope.zoom === 'undefined') ? 1 : scope.zoom/100;
               jsPlumbZoomCanvas(instance, zoom, $(element)[0]);

               scope.$watch('zoom', function(newVal, oldVal){
                   jsPlumbZoomCanvas(instance, newVal/100, $(element)[0]);
               });

               $(element).bind('mousewheel', function(e){
                   if(e.originalEvent.wheelDelta /120 > 0) {
                       scope.zoom += 10;
                       scope.$apply();

                   }
                   else{
                       scope.zoom -= 10;
                       scope.$apply();
                   }
               });


           }
       };

       return def;
 }
})();
