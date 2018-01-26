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
    .controller('ArgumentFormController', ArgumentFormController);

  ArgumentFormController.$inject = ['$scope', 'GrowlNotification', 'WorkflowData'];

  /**
  * @namespace EditorController
  */
  function ArgumentFormController($scope, GrowlNotification, WorkflowData) {

    var vm = this;

    $scope.activeTask = {};
    $scope.activeOperator = {};

    //Scope variables to build the form for the task arguments, based on its related operator
    $scope.argumentForm = [];
    $scope.argumentModel = {};
    $scope.argumentSchema = {};


    $scope.$on('active_task_updated', function () {
            $scope.argumentSchema = {};
            $scope.argumentModel = {};

            $scope.argumentForm = [
              {
                "type": "fieldset",
                "items": [
                  {
                    "type": "tabs",

                    "tabs": [
                        {
                                    "title": "Required",
                                    "items":[]

                                },
                                {
                                    "title": "Optional",
                                    "items":[]

                                }
                    ]
                  }
                ]
              },
              {
                      type: "submit",
                      title: "Apply"
              }
            ];
            $scope.activeTask = WorkflowData.getActiveTask();
            $scope.activeOperator = $scope.activeTask.operator;

            $scope.operatorArgumentSchema = {}
            $scope.operatorArgumentSchema.type = "object";
            $scope.operatorArgumentSchema.properties = {};
            $scope.operatorArgumentSchema.required = [];
            var args = $scope.activeOperator.args;


            //Build the operator schema
            for (var i = 0; i < args.length; i++) {
                var field = {};
                var type = args[i].type;
                var property_name = args[i].name;
                if (type=="string" || type=="char"){
                    field.type = "string";
                    field.title = args[i].name;
                    if (args[i].values && !(args[i].multivalue)){
                        field.enum = args[i].values.split('|');
                    }

                    $scope.operatorArgumentSchema.properties[property_name] = field;
                    if (args[i].mandatory=="yes"
                    && field.title!="sessionid"
                    && field.title!="cwd"
                    && field.title!="cube"
                    && field.title!="cube2"
                    && field.title!="cubes"){
                        $scope.operatorArgumentSchema.required.push(property_name);
                    }
                   }

               if (type=="int"){
                    if (args[i].multivalue){
                        field.type = "string";
                        field.title = args[i].name;
                    }
                    else{
                        field.type = "integer";
                        field.title = args[i].name;
                        if (args[i].minvalue){
                            field.minimum = args[i].minvalue;
                        }
                        if (args[i].maxvalue){
                            field.maximum = args[i].maxvalue;
                        }
                    }


                    $scope.operatorArgumentSchema.properties[property_name] = field;
                    if (args[i].mandatory=="yes"){
                        $scope.operatorArgumentSchema.required.push(property_name);
                    }

                }
                if (type=="real"){
                    if (args[i].multivalue){
                        field.type = "string";
                        field.title = args[i].name;
                    }
                    else{
                        field.type = "number";
                        field.title = args[i].name;
                        if (args[i].minvalue){
                            field.minimum = args[i].minvalue;
                        }
                        if (args[i].maxvalue){
                            field.maximum = args[i].maxvalue;
                        }
                    }

                    $scope.operatorArgumentSchema.properties[property_name] = field;
                    if (args[i].mandatory=="yes"){
                        $scope.operatorArgumentSchema.required.push(property_name);
                    }
                }

                if (type=="date"){
                    field.type = "string";
                    field.format = "date";
                    field.title = args[i].name;
                    if (args[i].values){
                       field.enum = args[i].values.split('|');
                    }


                    $scope.operatorArgumentSchema.properties[property_name] = field;
                    if (args[i].mandatory=="yes"){
                        $scope.operatorArgumentSchema.required.push(property_name);
                    }
                }

            }

             angular.forEach($scope.operatorArgumentSchema.properties, function(property){
                if ($scope.operatorArgumentSchema.required.indexOf(property.title) > -1 ){
                    angular.forEach($scope.argumentForm[0].items[0].tabs, function(tab){
                        if (tab.title=="Required"){
                            tab.items.push({"key": property.title});
                        }
                    });
                }
                else{
                    angular.forEach($scope.argumentForm[0].items[0].tabs, function(tab){
                        if (tab.title=="Optional"){
                            tab.items.push({"key": property.title});
                        }
                    });
                }
            });
            $scope.argumentSchema = $scope.operatorArgumentSchema;

            if(typeof(WorkflowData.getTaskArguments($scope.activeTask.name))!== 'undefined'){
                  var taskArgumentsList = WorkflowData.getTaskArguments($scope.activeTask.name);
                  for (var j = 0; j < taskArgumentsList.length; j++){
                    var first = taskArgumentsList[j].split('=')[0];
                    var second = taskArgumentsList[j].split('=')[1];


                    angular.forEach($scope.operatorArgumentSchema.properties, function(property){
                        if (property.title==first){
                             switch (property.type) {
                                case "string":
                                    $scope.argumentModel[first] = second;
                                    break;
                                case "integer":
                                     $scope.argumentModel[first] = parseInt(second);
                                    break;
                                case "number":
                                     $scope.argumentModel[first] = Number(second);
                                    break;
                                default:
                                    $scope.argumentModel[first] = second;
                             }
                        }
                    });
                  }


            }


    });

    //Save the arguments specified for a task in the json workflow
    $scope.submitArgumentForm = function(modelData, form){
        $scope.$broadcast('schemaFormValidate');
            if (form.$valid) {
                var form_arguments = [];
                for (var key in modelData) {
                    form_arguments.push(key + '=' + modelData[key]);
                };
                WorkflowData.setTaskArguments($scope.activeTask.name, form_arguments);

               GrowlNotification.Create("success","Task arguments have been set");


            }
            else{
               GrowlNotification.Create("warning","Form is invalid! Please fill in all the required fields.");
            }



    }



  }
})();
