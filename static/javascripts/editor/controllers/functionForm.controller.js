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
    .controller('FunctionFormController', FunctionFormController);

  FunctionFormController.$inject = ['$scope', 'GrowlNotification', 'WorkflowData'];

  /**
  * @namespace FunctionFormController
  */
  function FunctionFormController($scope, GrowlNotification, WorkflowData) {

    var vm = this;

    //Scope variables to build the form for the task functions (on_error, on_exit, run)
    $scope.functionsForm = [
        "*",
        {
          type: "submit",
          title: "Apply"
        }
    ];

    $scope.functionsModel = {};
    $scope.functionsSchema = {};
    $scope.functionsSchema.type = "object";
    $scope.functionsSchema.properties = {};
    $scope.functionsSchema.properties["on_error"] = { "title": "on_error", "type": "string"};
    $scope.functionsSchema.properties["on_exit"] = { "title": "on_exit", "type": "string", "enum": ["nop", "oph_delete"]};
    $scope.functionsSchema.properties["run"] = { "title": "run", "type": "string"};


    //Save the functions specified for a task in the json workflow
    $scope.submitFunctionsForm = function(modelData, form){
        $scope.$broadcast('schemaFormValidate');
        if (form.$valid) {
            console.log(modelData);
            var activeTask = WorkflowData.getActiveTask();
            WorkflowData.setTaskFunctions(activeTask.name, modelData);
            GrowlNotification.Create("success", "Task functions have been set.")
            $scope.functionsModel = {};
            $scope.$broadcast('schemaFormRedraw');
        }
        else{
             GrowlNotification.Create("warning","Form is invalid! Please fill in all the required fields.");
        }





    }


  }
})();
