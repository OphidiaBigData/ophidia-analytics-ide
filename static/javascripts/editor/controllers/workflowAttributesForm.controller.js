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
    .controller('WorkflowAttributesFormController', WorkflowAttributesFormController);

  WorkflowAttributesFormController.$inject = ['$scope', 'GrowlNotification', 'WorkflowData'];

  /**
  * @namespace EditorController
  */
  function WorkflowAttributesFormController($scope, GrowlNotification, WorkflowData) {

    var vm = this;


     $scope.$on('connection_parameters_updated', function () {
       var ConnectionParameters = WorkflowData.getConnectionParameters();
       $scope.workflowAttributesModel['author'] = ConnectionParameters.username;

     });

     //Scope variables to build the form for the global workflow attributes
    $scope.workflowAttributesForm = [
        "*",
        {
          type: "submit",
          title: "Save"
        }
    ];

    $scope.workflowAttributesModel={};


    $scope.workflowAttributesSchema = {};
    $scope.workflowAttributesSchema.type = "object";
    $scope.workflowAttributesSchema.properties = {};
    $scope.workflowAttributesSchema.properties["name"] = { "title": "name *", "type": "string", "default" : "Workflow"};
    $scope.workflowAttributesSchema.properties["author"] = { "title": "author *", "type": "string", "default" : "me"};
    $scope.workflowAttributesSchema.properties["abstract"] = { "title": "abstract *", "type": "string", "default" : "-"};
    $scope.workflowAttributesSchema.properties["sessionid"] = { "title": "sessionid", "type": "string"};
    $scope.workflowAttributesSchema.properties["exec_mode"] = { "title": "exec_mode", "type": "string", "enum": ["async", "sync"]};
    $scope.workflowAttributesSchema.properties["ncores"] = { "title": "ncores", "type": "string", "default":"1"};
    $scope.workflowAttributesSchema.properties["on_error"] = { "title": "on_error", "type": "string"};
    $scope.workflowAttributesSchema.properties["on_exit"] = { "title": "on_exit", "type": "string", "enum": ["nop", "oph_delete"]};
    $scope.workflowAttributesSchema.properties["run"] = { "title": "run", "type": "string", "enum": ["yes", "no"]};
    $scope.workflowAttributesSchema.properties["cwd"] = { "title": "cwd", "type": "string"};
    $scope.workflowAttributesSchema.properties["cube"] = { "title": "cube", "type": "string"};
    $scope.workflowAttributesSchema.properties["callback_url"] = { "title": "callback_url", "type": "string"};
    $scope.workflowAttributesSchema.properties["host_partition"] = { "title": "host_partition", "type": "string"};
    $scope.workflowAttributesSchema.properties["output_format"] = { "title": "output_format", "type": "string", "enum": ["classic", "compact"]};
    $scope.workflowAttributesSchema.required = ["name", "author", "abstract"];

    $scope.submitWorkflowAttributesForm = function(modelData, form){

            // First we broadcast an event so all fields validate themselves
            $scope.$broadcast('schemaFormValidate');
            console.log(form.$valid);
            // Then we check if the form is valid
            if (form.$valid) {
                if (parseInt(modelData['ncores'])<1)
                    GrowlNotification.Create("error", "Number of cores must be at least 1!");
                else
                    WorkflowData.setGlobalAttributes(modelData);
               }
            else{
                GrowlNotification.Create("warning", "Please fill in the required fields before submitting the form.");
            }


     }


  }
})();
