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
    .directive('jsPlumbEndpoint', jsPlumbEndpoint);


  function jsPlumbEndpoint() {

      var def = {
        restrict : 'E',
        require: '^jsPlumbCanvas',
        scope: {
            settings: '=settings'
        },
        controller: function ($scope) {
            this.scope = $scope;
            this.connectionObjects = {};
        },
        transclude: true,
        template: '<div ng-transclude></div>',
        link : function(scope, element, attrs, jsPlumbCanvas) {
            var instance = jsPlumbCanvas.scope.jsPlumbInstance;
            scope.jsPlumbInstance = jsPlumbCanvas.scope.jsPlumbInstance;
            scope.uuid = attrs.uuid;
            var options = {
                anchor:attrs.anchor,
                uuid: attrs.uuid
            };

            $(element).addClass('_jsPlumb_endpoint');
            $(element).addClass('endpoint_'+attrs.anchor);

            var ep = instance.addEndpoint(element, scope.settings, options);

            scope.$on('$destroy', function(){
                instance.deleteEndpoint(ep);
            });
        }
    };
    return def;
 }
})();
