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
    .directive('jsPlumbConnection', jsPlumbConnection);

    jsPlumbConnection.$inject = ['$timeout'];


  function jsPlumbConnection($timeout) {

   var def = {
        restrict : 'E',
        require: '^jsPlumbEndpoint',
        scope: {
            ngClick: '&ngClick',
            ngDblclick: '&ngDblclick',
            ngModel: '=ngModel'
        },
        link : function(scope, element, attrs, jsPlumbEndpoint)
        {
            var instance = jsPlumbEndpoint.scope.jsPlumbInstance;
            var sourceUUID = jsPlumbEndpoint.scope.uuid;
            var targetUUID = scope.ngModel.uuid;



            $timeout(function(){
                if(typeof jsPlumbEndpoint.connectionObjects[targetUUID] === 'undefined'){
                    jsPlumbEndpoint.connectionObjects[targetUUID] = instance.connect({
                        uuids:[
                            targetUUID,
                            sourceUUID
                        ],
                        overlays:[
                            [ "Label", {label:"", id:"label"}]
                        ], editable:true});


                }

                var connection = jsPlumbEndpoint.connectionObjects[targetUUID];

                connection.bind("click", function(conn, originalEvent) {

                     $('#details .tab-pane').removeClass('active in');
                     $('#dependency_options').addClass('active in');
                    scope.ngClick();
                    scope.$apply();
                });

                connection.bind("dblclick", function(conn, originalEvent) {
                    scope.ngDblclick();
                    //instance.detach(jsPlumbEndpoint.connectionObjects[targetUUID]);
                    scope.$apply();
                });

                connection.bind("mouseenter", function(conn, originalEvent) {
                    //scope.ngModel.mouseover = true;
                    scope.$apply();
                });
                connection.bind("mouseleave", function(conn, originalEvent) {
                    //scope.ngModel.mouseover = false;
                    scope.$apply();
                });


                var overlay = connection.getOverlay("label");
                if(overlay){
                    $(element).appendTo( overlay.canvas );
                }


            }, 300);


            scope.$on('$destroy', function(){
                try{
                    instance.detach(jsPlumbEndpoint.connectionObjects[targetUUID]);
                } catch(err){
                    console.log('error', err, jsPlumbEndpoint.connectionObjects[targetUUID]);

                }
                // if the connection is destroyed, I am assuming the parent endPoint is also destroyed, and we need to remove
                // the reference that a link exists, so it will be rendered again
                jsPlumbEndpoint.connectionObjects[targetUUID] = undefined;
            });

        }
    };
    return def;
 }
})();
