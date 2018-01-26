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
    .module('ophidiaAnalyticsIDE.editor.controllers')
    .controller('ConnectionFormController', ConnectionFormController);

  ConnectionFormController.$inject = ['$scope', 'GrowlNotification', 'WorkflowData'];

  /**
  * @namespace ConnectionFormController
  */
  function ConnectionFormController($scope, GrowlNotification, WorkflowData) {

    var vm = this;


    //Scope variables to build the form to specify the parameters for the Ophidia server connection
    $scope.connectionForm = [
        "*",
        {"key": "password", "title": "Password *", "type": "password", "required": true},

        {
          type: "submit",
          title: "Save parameters"
        }
    ];

    $scope.connectionModel = {};
    $scope.connectionModel["server"] = "ophidialab.cmcc.it";
    $scope.connectionModel["port"] = "11732";

    $scope.connectionSchema = {}
    $scope.connectionSchema.type = "object";
    $scope.connectionSchema.properties = {};
    $scope.connectionSchema.properties["server"] = { "title": "Server *", "type": "string", "readonly": true};
    $scope.connectionSchema.properties["port"] = { "title": "Port *", "type": "string", "readonly": true};
    $scope.connectionSchema.properties["username"] = { "title": "Username *", "type": "string"};
    $scope.connectionSchema.properties["password"] = { "title": "Password *", "type": "password"};
    $scope.connectionSchema.required = ["server", "port", "username", "password"];


    $scope.submitConnectionForm = function(modelData, form){


            // First we broadcast an event so all fields validate themselves
            $scope.$broadcast('schemaFormValidate');

            // Then we check if the form is valid
            if (form.$valid) {
                WorkflowData.setConnectionParameters(modelData);
            }
            else{
                GrowlNotification.Create("warning", "Please fill in the required fields before submitting the form.");
            }


     }


  }
})();
