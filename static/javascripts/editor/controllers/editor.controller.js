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
    .controller('EditorController', EditorController);

  EditorController.$inject = ['$scope', '$interval', 'ngDialog', 'GrowlNotification', 'OperatorsService', 'WorkflowData', 'WorkflowSubmissionService', 'WorkflowMonitoringService', 'WorkflowGraphService', 'Authentication', 'Workflows'];

  /**
  * @namespace EditorController
  */
  function EditorController($scope, $interval, ngDialog, GrowlNotification, OperatorsService, WorkflowData, WorkflowSubmissionService, WorkflowMonitoringService, WorkflowGraphService, Authentication, Workflows) {

   var vm = this;

    vm.isAuthenticated = Authentication.isAuthenticated();
    vm.OphidiaUser = Authentication.getAuthenticatedOphidiaUser();
    vm.workflows = [];

   //On startup get all the metadata related to operators and get thw user saved workflows
    activate();

    function activate(){
        if (vm.isAuthenticated){
            Workflows.get(vm.OphidiaUser.username).then(getWorkflowsSuccessFn, getWorkflowsErrorFn);

          function getWorkflowsSuccessFn(data, status, headers, config) {
            vm.workflows = data.data;
            angular.forEach(vm.workflows, function(workflow){
                workflow.json_workflow = JSON.parse(workflow.json_workflow);
                workflow.layout = JSON.parse(workflow.layout);
            });
          }

          function getWorkflowsErrorFn(data, status, headers, config) {
            console.log(data);
          }
        }
        console.log(Authentication.getAuthenticatedOphidiaUser());

        //Call the GetAll function of the Operators service to get the metadata from the operators xml files
        OperatorsService.GetAll().then(function (response) {
            $scope.operators = response.data.content;
            $scope.operatorsCategories = [];
            $scope.categorizedOperators = {};
            angular.forEach($scope.operators, function(operator){
                if (operator.category=="Virtual File System Management"){
                    operator.category="Virtual File System";
                }
                if (operator.category!="-" && $scope.operatorsCategories.indexOf(operator.category)==-1){
                    $scope.operatorsCategories.push(operator.category);
                }
            });
            angular.forEach($scope.operatorsCategories, function(category){
                $scope.categorizedOperators[category] = {"category": category};
            });
            angular.forEach($scope.operators, function(operator){
                angular.forEach($scope.categorizedOperators, function(category){
                    if (operator.category==category.category){
                        if (typeof category["operators"]==="undefined")
                            category["operators"] = [];
                        category["operators"].push(operator);
                    }
                });
            });

        });
    }

   /*
   Workflow graphic view
   */
   $scope.workflow= {};
   $scope.draggedOperator = {};

   //Position of the top-left corner of the worksheet and zoom
   $scope.pos_x = 214;
   $scope.pos_y = 148;
   $scope.worksheetZoomlevel = 70;
   $scope.monitoringPanelZoomlevel = 30;

   //New task model
   $scope.newTask = {};
   //Currently active task
   $scope.activeTask = null;
   //Store the active task name, in case the user wishes to change it
   $scope.oldName;
   //Currently active dependency between tasks
   $scope.activeConnection = {};

   //Last ID assigned to a task endpoint
   $scope.lastID = 0;

    var getNextID = function(){
        $scope.lastID++;
        return $scope.lastID;
    }

    //Last number assigned to a task
    $scope.number_of_tasks = 0;

    var getNextTaskNumber = function(){
        $scope.number_of_tasks++;
        return $scope.number_of_tasks;
    }

    //Style for task endpoints in jsPlumb
    $scope.targetEndpointStyle = {
        endpoint:"Dot",
        paintStyle:{ fillStyle:"#1560BD",radius:7 },
        maxConnections:-1,
        isTarget:true
    };

    $scope.sourceEndpointStyle = {
        endpoint:"Dot",
        paintStyle:{
            strokeStyle:"#1560BD",
            fillStyle:"transparent",
            radius:6,
            lineWidth:2
        },
        isSource:true,
        maxConnections:-1,
        connector:[ "Flowchart", { stub:[5, 5], gap:10, cornerRadius:6, alwaysRespectStubs:true } ],
        connectorStyle:{
            lineWidth:2,
            strokeStyle:"#1560BD",
            joinstyle:"round",
        },
        connectorHoverStyle:{
            fillStyle:"#00AEEF",
            strokeStyle:"#00AEEF"
        }
    };

    //Functions executed during the drag and drop
    $scope.startCallback = function(event, ui, operator) {
        $scope.draggedOperator = operator;

    };

    $scope.stopCallback = function(event, ui) {
        $scope.newTask.operator = $scope.draggedOperator;
        $scope.newTask.name = "Task_"+getNextTaskNumber();
        $scope.newTask.x = ui.position.left;
        $scope.newTask.y = ui.position.top + $scope.pos_y;

        $scope.newTask.sources = [
                                    {
                                    uuid: getNextID()
                                    }

                                 ];
        $scope.newTask.targets = [
                                    {
                                    uuid: getNextID()

                                    }
                                 ];
        $scope.newTask.status = "OPH_STATUS_UNSELECTED";
        if(typeof($scope.workflow.tasks)==="undefined"){
            $scope.workflow.tasks = [];
        }
        $scope.workflow.tasks.push($scope.newTask);
        $scope.newJsonTask.name = $scope.newTask.name;
        $scope.newJsonTask.operator = $scope.newTask.operator.name;
        WorkflowData.addTask($scope.newJsonTask);
        $scope.setActiveTask($scope.newTask);
        $scope.newTask={};
        $scope.newJsonTask={};

    };

    $scope.changeTab = function(taskId) {
        $('#details .tab-pane').removeClass('active in');
        $('#'+taskId).addClass('active in');
    }


   /*
   end Workflow graphic view
   */

    /*
   Workflow logic
   */

   $scope.newJsonTask = {};
   $scope.jsonworkflow = {};
   $scope.jsonresponse = {};
   $scope.report = [];
   $scope.dependency = {'dependentTask': [], 'independentTaskName': [] }

   //Set the task for which we want to specify arguments and functions
   $scope.setActiveTask = function(task) {
        $scope.activeTask = task;
        WorkflowData.setActiveTask($scope.activeTask);
        $scope.changeTab("task_details");
        $scope.oldName = task.name;
   }

   $scope.editTaskName = function(){
        angular.forEach($scope.jsonworkflow.tasks, function(task){
            if (task.name==$scope.oldName){
                var index = $scope.jsonworkflow.tasks.indexOf(task);
                if(index !== -1){
                    $scope.jsonworkflow.tasks[index].name = $scope.activeTask.name;
                    $scope.jsonstring = angular.toJson($scope.jsonworkflow, true);
                }
            }
        });
        GrowlNotification.Create("success", "Task name has been successfully updated.");
   }

  $scope.duplicateTask = function(selectedTask) {
        $scope.activeTask = selectedTask;
        $scope.newTask.operator = $scope.activeTask.operator;
        $scope.newTask.name = "Task_"+getNextTaskNumber();
        $scope.newTask.x = $scope.activeTask.x + 150;
        $scope.newTask.y = $scope.activeTask.y + 150;
        $scope.newTask.sources = [
                                    {
                                    uuid: getNextID()
                                    }

                                 ];
        $scope.newTask.targets = [
                                    {
                                    uuid: getNextID()

                                    }
                                 ];
        $scope.newTask.status = "OPH_STATUS_UNSELECTED";
        $scope.workflow.tasks.push($scope.newTask);
        $scope.newJsonTask.name = $scope.newTask.name;
        $scope.newJsonTask.operator = $scope.newTask.operator.name;
        var args = [];
        var on_error;
        var on_exit;
        var run;
        var functions = {};
        for (var i = 0; i < $scope.jsonworkflow.tasks.length; i++){
                if ($scope.jsonworkflow.tasks[i].name==$scope.activeTask.name){
                    args = $scope.jsonworkflow.tasks[i].arguments;
                    if (typeof $scope.jsonworkflow.tasks[i]["on_error"]!=="undefined"){
                        on_error = $scope.jsonworkflow.tasks[i]["on_error"];
                        functions["on_error"] = on_error;
                    }
                    if (typeof $scope.jsonworkflow.tasks[i]["on_exit"]!=="undefined"){
                        on_exit = $scope.jsonworkflow.tasks[i]["on_exit"];
                        functions["on_exit"] = on_exit;
                    }
                    if (typeof $scope.jsonworkflow.tasks[i]["run"]!=="undefined"){
                        run = $scope.jsonworkflow.tasks[i]["run"];
                        functions["run"] = run;
                    }

                 }
        }


        WorkflowData.addTask($scope.newJsonTask);
        WorkflowData.setTaskArguments($scope.newTask.name, args);
        WorkflowData.setTaskFunctions($scope.newTask.name, functions);
        $scope.setActiveTask($scope.newTask);
        $scope.newTask={};
        $scope.newJsonTask={};

  }


  $scope.deleteTask = function(selectedTask) {
     $scope.activeTask = selectedTask;
     ngDialog.openConfirm({
        template: 'task-delete-dialog.html',
        scope: $scope
     }).then(
        function(value) {
            //Delete a task from the worksheet
            angular.forEach($scope.workflow.tasks, function(task){
                if (task.name==$scope.activeTask.name){
                    var index = $scope.workflow.tasks.indexOf(task);
                    if(index !== -1){
                        $scope.workflow.tasks.splice(index, 1);
                    }
                }
            });
            //Delete a task from the json workflow
            angular.forEach($scope.jsonworkflow.tasks, function(task){
                if (task.name==$scope.activeTask.name){
                    var index = $scope.jsonworkflow.tasks.indexOf(task);
                    if(index !== -1){
                        $scope.jsonworkflow.tasks.splice(index, 1);
                        $scope.jsonstring = angular.toJson($scope.jsonworkflow, true);
                    }
                }
            });
            $scope.number_of_tasks--;
            $scope.activeTask = {};
            $scope.argumentSchema = {};
            $scope.argumentModel= {};
            $scope.operatorArgumentSchema = {};
            GrowlNotification.Create("success", "Task deleted from workflow");

        },
        function(reject) {
        }
     );
  }


    //Set the dependency for which we want to specify options
     $scope.setActiveConnection = function(sourceID,targetID){
        var dependentTask = {};
        var independentTask = {};
        $scope.activeConnection = {"sourceID" : sourceID, "targetID" : targetID};
        angular.forEach($scope.workflow.tasks, function(task){
            angular.forEach(task.sources, function(source){
               if(source.uuid == sourceID){
                    independentTask = task;
               }
            });
        });
         angular.forEach($scope.workflow.tasks, function(task){
            angular.forEach(task.targets, function(target){
               if(target.uuid == targetID){
                    dependentTask = task;
               }
            });
        });
        angular.forEach($scope.jsonworkflow.tasks, function(task){
            if (task.name==dependentTask.name){
                $scope.dependency.dependentTask = dependentTask;
            }
            if (task.name==independentTask.name){
                $scope.dependency.independentTask = independentTask;
            }
        });

        //Get already specified dependency options
        $scope.dependencyModel = {};
        angular.forEach($scope.jsonworkflow.tasks, function(task){
               if(task.name == $scope.dependency.dependentTask.name && typeof(task.dependencies)!== 'undefined'){
                    var dependencies = task.dependencies;
                    for (var j = 0; j < dependencies.length; j++){
                        if (dependencies[j].task==$scope.dependency.independentTask.name){
                            for (var key in dependencies[j]) {
                                if (dependencies[j].hasOwnProperty(key)) {
                                    $scope.dependencyModel[key] = dependencies[j][key];
                                }
                            }
                        }
                    }
               }
        });
     }

     //Create a dependency manually, not via drag and drop
     $scope.createNewDependency = function() {
        $scope.dependencyModel = {};
        //Visually build the dependency
        var sourceID;
        var targetID;
        angular.forEach($scope.workflow.tasks, function(task){
            if (task.name==$scope.dependency.dependentTask.name){
                angular.forEach(task.targets, function(target){
                    targetID = target.uuid;
                })
            };
        });
        angular.forEach($scope.workflow.tasks, function(task){
            if (task.name==$scope.dependency.independentTask.name){
                angular.forEach(task.sources, function(source){
                    if (typeof source.connections=== 'undefined') source.connections = [];
                    source.connections.push({'uuid': targetID});
                })
            };
        });

        //Add the dependency in the json workflow
        for (var i = 0, len =  $scope.jsonworkflow.tasks.length; i < len; i++) {
            if ($scope.jsonworkflow.tasks[i].name==$scope.dependency.dependentTask.name){
                if(typeof $scope.jsonworkflow.tasks[i].dependencies === 'undefined') $scope.jsonworkflow.tasks[i].dependencies = [];
                $scope.jsonworkflow.tasks[i].dependencies.push({'task': $scope.dependency.independentTask.name});
                $scope.jsonstring = angular.toJson($scope.jsonworkflow, true);
                GrowlNotification.Create("success", "New dependency created");
            }
        }
        $scope.dependency = {};
     }


    //Save the options specified for a dependency between tasks in the json workflow
    $scope.submitDependencyForm = function(modelData){
        for (var i = 0, len =  $scope.jsonworkflow.tasks.length; i < len; i++) {
            if ($scope.jsonworkflow.tasks[i].name==$scope.dependency.dependentTask.name){
                for (var j = 0; j < $scope.jsonworkflow.tasks[i].dependencies.length; j++) {
                    if ($scope.jsonworkflow.tasks[i].dependencies[j].task==$scope.dependency.independentTask.name){
                        for (var key in modelData) {
                            if (modelData.hasOwnProperty(key)) {
                                $scope.jsonworkflow.tasks[i].dependencies[j][key] = modelData[key];
                                $scope.jsonstring = angular.toJson($scope.jsonworkflow, true);
                            }
                        };
                    }
                }
            }
        }
        $scope.dependencyModel = {};
        $scope.$broadcast('schemaFormRedraw');
        GrowlNotification.Create("success", "Dependency options have been set");
    }



     //Delete a dependency both from the worksheet and from the json workflow
     $scope.deleteConnection = function(sourceID,targetID){
         ngDialog.openConfirm({
            template: 'dependency-delete-dialog.html',
            scope: $scope
         }).then(
            function(value) {
                    $scope.activeConnection = {"sourceID" : sourceID, "targetID" : targetID};
                    var dependentTask = {};
                    var independentTask = {};
                    angular.forEach($scope.workflow.tasks, function(task){
                        angular.forEach(task.sources, function(source){
                            if(source.uuid == $scope.activeConnection.sourceID){
                                   independentTask = task;
                                   angular.forEach(source.connections, function(connection){
                                        if (connection.uuid==targetID){
                                           var index = source.connections.indexOf(connection);
                                           source.connections.splice(index, 1);
                                        }
                                    });
                            }

                        });
                    });
                    angular.forEach($scope.workflow.tasks, function(task){
                        angular.forEach(task.targets, function(target){
                            if(target.uuid == $scope.activeConnection.targetID){
                               dependentTask = task;
                            }
                        });
                    });
                    for (var i = 0, len =  $scope.jsonworkflow.tasks.length; i < len; i++) {
                        if ($scope.jsonworkflow.tasks[i].name==dependentTask.name){
                            for (var j = 0; j < $scope.jsonworkflow.tasks[i].dependencies.length; j++) {
                                if ($scope.jsonworkflow.tasks[i].dependencies[j].task==independentTask.name){
                                    $scope.jsonworkflow.tasks[i].dependencies.splice(j, 1);
                                        $scope.jsonstring = angular.toJson($scope.jsonworkflow, true);
                                }
                            }
                        }
                    }


            },
            function(reject) {
            }
         );

     }


    $scope.editJSONWorkflow = function(){
        var temp = angular.fromJson($scope.jsonstring);
        $scope.jsonworkflow = temp;
        var GlobalAttributes = {};
        var Tasks = {};
        for (var key in $scope.jsonworkflow) {
           if (key!="tasks"){
            GlobalAttributes[key]=$scope.jsonworkflow[key];
           }
           if(typeof $scope.jsonworkflow.tasks !== 'undefined'){
            Tasks = $scope.jsonworkflow.tasks;
            WorkflowData.setTasks(Tasks);
            GrowlNotification.Create("success", "Tasks have been updated");
           }
        }
        if (!(angular.equals({}, GlobalAttributes)))
            WorkflowData.setGlobalAttributes(GlobalAttributes);


        //To carefully test

    }



  //Number of parameters for the workflow submission
  $scope.parameterCounter = 0;

  var getNextParameterID = function(){
    $scope.parameterCounter++;
    return $scope.parameterCounter;
  }

  //Parameters for the workflow submission
  $scope.parameters = [];

  $scope.addParameter = function () {
    $scope.parameters.push({
        name: "",
        id: getNextParameterID()
    });
  }

  $scope.parametersList = [];
  $scope.parametersString = "";
  $scope.submissionData = {};

  //Set the parameters for the workflow submission
  $scope.setParametersString = function(){
    if ($scope.parameters!=[]){
        $scope.parameters.sort(function(a, b) {
            return a.id - b.id;
        });
        $scope.parametersList = [];
        for(var i in $scope.parameters){
            $scope.parametersList.push($scope.parameters[i].name);
        }
        console.log($scope.parametersList);
        $scope.parametersString = $scope.parametersList.join(',');
    }
  }

  //Check if the connection parameters to Ophidia Server have been set
  $scope.checkConnectionParameters = function() {
    if (typeof $scope.server ==="undefined" || typeof $scope.port ==="undefined" || typeof $scope.username ==="undefined" || typeof $scope.password ==="undefined"){
        GrowlNotification.Create("error", "Please check your connection parameters to the Ophidia server before submitting the workflow.");
        return false;
    }
    return true;


  };

  //Check if a workflow has been specified
  $scope.checkNotEmptyWorkflow = function(){
    if (angular.equals({},$scope.jsonworkflow)){
        GrowlNotification.Create("error", "Your workflow is empty.");
        return false;
    }
    return true;


  }

   //Check if the mandatory attributes of a workflow have been set
  $scope.checkMandatoryGlobalAttributes = function(){
    if(typeof($scope.jsonworkflow.tasks)==="undefined"){
        GrowlNotification.Create("error", "Your workflow has no tasks.");
        return false;
    }
    if(typeof($scope.jsonworkflow.name)==="undefined" &&
        typeof($scope.jsonworkflow.author)==="undefined" &&
        typeof($scope.jsonworkflow.abstract)==="undefined"){
        GrowlNotification.Create("error", "Please submit the workflow global attributes form.");
        return false;
    }
    if(typeof($scope.jsonworkflow.name)==="undefined"){
        GrowlNotification.Create("error", "Your workflow has no name.");
        return false;
    }
    if(typeof($scope.jsonworkflow.author)==="undefined"){
        GrowlNotification.Create("error", "Your workflow has no author.");
        return false;
    }
    if(typeof($scope.jsonworkflow.abstract)==="undefined"){
        GrowlNotification.Create("error", "Your workflow has no abstract.");
        return false;
    }
    return true;


  }

  //Save the workflow in the database (the author is the authenticated user)
  $scope.saveWorkflow = function(){
    var json_workflow = JSON.stringify($scope.jsonworkflow);
    var layout = JSON.stringify($scope.workflow.tasks);

    Workflows.create(json_workflow, layout).then(createWorkflowSuccessFn, createWorkflowErrorFn);

      function createWorkflowSuccessFn(data, status, headers, config) {
        GrowlNotification.Create("success", "Workflow was successfully saved!")
      }

      function createWorkflowErrorFn(data, status, headers, config) {
        GrowlNotification.Create("error", "Something went wrong in saving your workflow!")
      }
  }

   //This function is necessary for now, because if < or > are present PyOphidia will throw an error
   $scope.correctAbstract = function(){
      if ($scope.jsonworkflow.abstract){
        $scope.jsonworkflow.abstract = $scope.jsonworkflow.abstract.replace(/<|>/g," ");
        $scope.jsonstring = angular.toJson($scope.jsonworkflow, true);
      }
   }



  //Submit the workflow to the Ophidia Server
  $scope.submitWorkflow = function(){


    //Force async mode to monitor workflow status
    if ($scope.jsonworkflow.exec_mode=="sync"){
        $scope.jsonworkflow.exec_mode="async";
        $scope.jsonstring = angular.toJson($scope.jsonworkflow, true);
    }

    $scope.setParametersString();
    $scope.submissionData = {
        "parametersString" :  $scope.parametersString,
        "workflow" : $scope.jsonworkflow,
        "server" : $scope.server,
        "port" : $scope.port,
        "username" : $scope.username,
        "password" : $scope.password,
    };

    console.log($scope.workflow.tasks);
    console.log($scope.jsonworkflow);
    console.log($scope.parametersString);



    $scope.queryString = "oph_resume level=3;document_type=request;";

    var workflowID;  

    if ($scope.checkNotEmptyWorkflow()){
        $scope.correctAbstract();
        if ($scope.checkConnectionParameters() && $scope.checkMandatoryGlobalAttributes()){
            WorkflowSubmissionService.Create($scope.submissionData).then(function (response) {
                $scope.last_jobid = response.data.last_jobid;
                if ($scope.last_jobid==null)
                    GrowlNotification.Create("error", "Something went wrong in submitting the request. Please check your workflow and try again.");
                else{

                    GrowlNotification.Create("success", "Your workflow has been successfully submitted");
                    if (!$scope.submissionData.workflow.exec_mode || $scope.submissionData.workflow.exec_mode=="sync")
                        $scope.jsonresponse = response.data.content;
                    console.log($scope.jsonresponse);
                    console.log($scope.last_jobid);


                    var workflowID = $scope.last_jobid.substring($scope.last_jobid.lastIndexOf("?")+1,$scope.last_jobid.lastIndexOf("#"));
                    console.log(workflowID);

                    $scope.querySubmissionData = {
                        "server" : $scope.server,
                        "port" : $scope.port,
                        "username" : $scope.username,
                        "password" : $scope.password,
                        "query": $scope.queryString+"id="+workflowID+";"
                    };
                    var reportData;
                    var jsonresponse;
                    var jsonworkflow;

                    WorkflowMonitoringService.Create($scope.querySubmissionData).then(function (response) {
                        console.log(response.data.content);
                        var response_content = JSON.parse(response.data.content);
                        angular.forEach(response_content.response, function(response){
                            if (response.objkey=="resume"){
                                jsonworkflow = JSON.parse(response.objcontent[0].rowvalues[0][5]);
                                console.log(JSON.parse(response.objcontent[0].rowvalues[0][5]));
                            }
                            WorkflowGraphService.Create({"workflow": jsonworkflow}).then(function (response) {
                                if(typeof($scope.workflowMonitoring)==="undefined")
                                       $scope.workflowMonitoring= {};
                                $scope.workflowMonitoring.tasks = [];
                                console.log(response.data.graph);
                                console.log(response.data.maxDepth);
                                console.log(response.data.nodes_at_heights);
                                var graph = response.data.graph;
                                var maxDepth = response.data.maxDepth;
                                var nodes_at_heights = response.data.nodes_at_heights;
                                var realDepth = nodes_at_heights.length;
                                var operatorName;
                                for (var j=realDepth-1; j>=0; j--){
                                    if (nodes_at_heights[j].nodes.length%2){
                                        var middle_index = Math.floor(nodes_at_heights[j].nodes.length / 2);
                                        for (var i = 0; i < nodes_at_heights[j].nodes.length; i++) {
                                            console.log(nodes_at_heights[j].nodes[i]);
                                            var task_node = {};
                                            if (i==middle_index){
                                                task_node.x = 2205
                                            }
                                            else if (i<middle_index){
                                                task_node.x = 2205 - (i+1)*180
                                            }
                                            else if (i>middle_index){
                                                task_node.x = 2205 + (i-1)*180
                                            }
                                            task_node.y = 300+(realDepth-j-1)*130;
                                            angular.forEach(graph, function(graph_node){
                                                if (graph_node.index==nodes_at_heights[j].nodes[i]){
                                                    task_node.name = graph_node.name;
                                                    operatorName = graph_node.operator;
                                                }
                                            });
                                            angular.forEach($scope.operators, function(operator){
                                                if (operatorName==operator.name){
                                                    task_node.operator = operator;
                                                }
                                            });
                                            task_node.sources = [
                                                                    {
                                                                        uuid: getNextID()
                                                                    }

                                                                ];
                                            task_node.targets = [
                                                                    {
                                                                        uuid: getNextID()

                                                                     }
                                                                 ];
                                            task_node.status = "OPH_STATUS_UNSELECTED";

                                            $scope.workflowMonitoring.tasks.push(task_node);
                                            console.log(task_node);
                                        }

                                    }
                                    else{
                                        for (var i = 0; i < nodes_at_heights[j].nodes.length; i++) {
                                            var task_node = {};
                                            var middle_index = Math.floor(nodes_at_heights[j].nodes.length / 2)-1;
                                            console.log(middle_index);
                                            if (i<=middle_index)
                                                task_node.x = 2280 - (middle_index+1-i)*180;

                                            else if (i>middle_index)
                                                task_node.x = 2280 + (i-middle_index-1)*180;
                                            task_node.y = 300+(realDepth-j-1)*130;
                                            angular.forEach(graph, function(graph_node){
                                                if (graph_node.index==nodes_at_heights[j].nodes[i]){
                                                    task_node.name = graph_node.name;
                                                    operatorName = graph_node.operator;
                                                }
                                            });
                                            angular.forEach($scope.operators, function(operator){
                                                if (operatorName==operator.name){
                                                    task_node.operator = operator;
                                                }
                                            });
                                            task_node.sources = [
                                                                    {
                                                                        uuid: getNextID()
                                                                    }

                                                                ];
                                            task_node.targets = [
                                                                    {
                                                                        uuid: getNextID()

                                                                     }
                                                                 ];
                                            task_node.status = "OPH_STATUS_UNSELECTED";

                                            $scope.workflowMonitoring.tasks.push(task_node);
                                            console.log(task_node);
                                        }
                                    }
                                }

                                angular.forEach($scope.workflowMonitoring.tasks, function(task){
                                    angular.forEach(graph, function(graph_node){
                                        if (task.name==graph_node.name){
                                            for (var i = 0; i < graph_node.out_edges.length; i++) {
                                                angular.forEach($scope.workflowMonitoring.tasks, function(task2){
                                                    if (task2.name==graph_node.out_edges[i].name){
                                                        if (typeof(task.sources[0].connections) === 'undefined'){
                                                                    task.sources[0].connections = [];
                                                                }
                                                                task.sources[0].connections.push({'uuid': task2.targets[0].uuid });


                                                    }

                                                });

                                            }
                                        }
                                    });
                                });
                            });
                        });
                    });

                    $scope.queryString = "oph_resume level=2;";

                    $scope.querySubmissionData = {
                        "server" : $scope.server,
                        "port" : $scope.port,
                        "username" : $scope.username,
                        "password" : $scope.password,
                        "query": $scope.queryString+"id="+workflowID+";"
                    };

                    var stop = $interval(function() {
                                WorkflowMonitoringService.Create($scope.querySubmissionData).then(function (response) {
                                       jsonresponse =  response.data.content;
                                       reportData = JSON.parse(response.data.content);
                                       var taskName;
                                       var taskStatus;
                                       var taskOperator;
                                       angular.forEach(reportData.response, function(response){
                                           if (response.objkey == "workflow_status" && response["objcontent"][0]["message"]=="OPH_STATUS_COMPLETED"){
                                                $interval.cancel(stop);
                                                GrowlNotification.Create("success", "Your workflow has been completed!");
                                           }
                                           else if (response.objkey == "workflow_status" && response["objcontent"][0]["message"]=="OPH_STATUS_ERROR"){
                                                $interval.cancel(stop);
                                                GrowlNotification.Create("error", "Your workflow has failed!");
                                           }
                                           else if (response.objkey == "workflow_status" && response["objcontent"][0]["message"]=="OPH_STATUS_EXPIRED"){
                                                $interval.cancel(stop);
                                                GrowlNotification.Create("warning", "Your workflow has been cancelled due to timeout!");
                                           }
                                           else if (response.objkey == "workflow_list"){
                                               $scope.report= [];
                                               var values = response["objcontent"][0]["rowvalues"];
                                               angular.forEach(values, function(value){
                                                   taskName = value[5];
                                                   taskStatus = value[7];
                                                   angular.forEach($scope.workflowMonitoring.tasks, function(task){
                                                    if (task.name==taskName){
                                                        task.status = taskStatus;
                                                        taskOperator = task.operator.name;
                                                    }

                                                   });
                                                   $scope.report.push({"taskName": taskName, "taskOperator": taskOperator, "taskStatus": taskStatus})
                                               });

                                           }

                                       });
                                       if ($scope.submissionData.workflow.exec_mode=="async")
                                            $scope.jsonresponse = jsonresponse;


                                   });


                              }, 1000);

                }
              });
            }

        }
    }

    $scope.loadWorkflow = function(workflow){
        console.log(workflow);
        $scope.workflow.tasks = [];
        //$scope.workflow.tasks=workflow.layout;
        $scope.parameters = [];
        $scope.jsonworkflow = workflow.json_workflow;
        $scope.jsonstring = angular.toJson($scope.jsonworkflow, true);
        var Tasks = $scope.jsonworkflow.tasks;
        WorkflowData.setTasks(Tasks);
        console.log(typeof($scope.jsonworkflow));
        //$scope.jsonstring = $fileContent;
        WorkflowGraphService.Create({"workflow": $scope.jsonworkflow}).then(function (response) {
            console.log(response.data.graph);
            console.log(response.data.maxDepth);
            console.log(response.data.nodes_at_heights);
            var graph = response.data.graph;
            var maxDepth = response.data.maxDepth;
            var nodes_at_heights = response.data.nodes_at_heights;
            var realDepth = nodes_at_heights.length;
            var operatorName;
            for (var j=realDepth-1; j>=0; j--){
                if (nodes_at_heights[j].nodes.length%2){
                    var middle_index = Math.floor(nodes_at_heights[j].nodes.length / 2);
                    for (var i = 0; i < nodes_at_heights[j].nodes.length; i++) {
                        console.log(nodes_at_heights[j].nodes[i]);
                        var task_node = {};
                        if (i==middle_index){
                            task_node.x = 580
                        }
                        else if (i<middle_index){
                            task_node.x = 580 - (i+1)*180
                        }
                        else if (i>middle_index){
                            task_node.x = 580 + (i-1)*180
                        }
                        task_node.y = 150+(realDepth-j-1)*130;
                        angular.forEach(graph, function(graph_node){
                            if (graph_node.index==nodes_at_heights[j].nodes[i]){
                                task_node.name = graph_node.name;
                                operatorName = graph_node.operator;
                            }
                        });
                        angular.forEach($scope.operators, function(operator){
                            if (operatorName==operator.name){
                                task_node.operator = operator;
                            }
                        });
                        task_node.sources = [
                                                {
                                                    uuid: getNextID()
                                                }

                                            ];
                        task_node.targets = [
                                                {
                                                    uuid: getNextID()

                                                 }
                                             ];
                        task_node.status = "OPH_STATUS_UNSELECTED";
                        if(typeof($scope.workflow.tasks)==="undefined")
                            $scope.workflow.tasks = [];
                        $scope.workflow.tasks.push(task_node);
                        console.log(task_node);
                    }

                }
                else{
                    for (var i = 0; i < nodes_at_heights[j].nodes.length; i++) {
                        var task_node = {};
                        var middle_index = Math.floor(nodes_at_heights[j].nodes.length / 2)-1;
                        console.log(middle_index);
                        if (i<=middle_index)
                            task_node.x = 655 - (middle_index+1-i)*180;

                        else if (i>middle_index)
                            task_node.x = 655 + (i-middle_index-1)*180;
                        task_node.y = 150+(realDepth-j-1)*130;
                        angular.forEach(graph, function(graph_node){
                            if (graph_node.index==nodes_at_heights[j].nodes[i]){
                                task_node.name = graph_node.name;
                                operatorName = graph_node.operator;
                            }
                        });
                        angular.forEach($scope.operators, function(operator){
                            if (operatorName==operator.name){
                                task_node.operator = operator;
                            }
                        });
                        task_node.sources = [
                                                {
                                                    uuid: getNextID()
                                                }

                                            ];
                        task_node.targets = [
                                                {
                                                    uuid: getNextID()

                                                 }
                                             ];
                        task_node.status = "OPH_STATUS_UNSELECTED";
                        if(typeof($scope.workflow.tasks)==="undefined")
                            $scope.workflow.tasks = [];
                        $scope.workflow.tasks.push(task_node);
                        console.log(task_node);
                    }
                }
            }
            angular.forEach(graph, function(graph_node){
                for (var i = 0; i < graph_node.out_edges.length; i++) {
                    angular.forEach(graph, function(graph_node2){
                        if (graph_node.out_edges[i]==graph_node2.index){
                            angular.forEach($scope.workflow.tasks, function(task){
                                if (task.name==graph_node.name){
                                    angular.forEach($scope.workflow.tasks, function(task2){
                                        if(task2.name==graph_node2.name){
                                            if (typeof(task.sources[0].connections) === 'undefined'){
                                                task.sources[0].connections = [];
                                            }
                                            task.sources[0].connections.push({'uuid': task2.targets[0].uuid });
                                        }

                                    });
                                }
                            });

                        }
                    });
                }
            });
            console.log($scope.workflow.tasks);
        });


    };

    function IsJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    //Draw a workflow in the worksheet after reading its JSON from file
    $scope.uploadWorkflow = function($fileContent){
        $scope.workflow.tasks=[];
        $scope.parameters = [];
        if (IsJsonString($fileContent)){
            $scope.jsonworkflow = JSON.parse($fileContent);
            console.log(typeof($fileContent));
            var Tasks = $scope.jsonworkflow.tasks;
            WorkflowData.setTasks(Tasks);
            console.log(typeof($scope.jsonworkflow));
            $scope.jsonstring = $fileContent;
            WorkflowGraphService.Create({"workflow": $scope.jsonworkflow}).then(function (response) {
                console.log(response.data.graph);
                console.log(response.data.maxDepth);
                console.log(response.data.nodes_at_heights);
                var graph = response.data.graph;
                var maxDepth = response.data.maxDepth;
                var nodes_at_heights = response.data.nodes_at_heights;
                var realDepth = nodes_at_heights.length;
                var operatorName;
                for (var j=realDepth-1; j>=0; j--){
                    if (nodes_at_heights[j].nodes.length%2){
                        var middle_index = Math.floor(nodes_at_heights[j].nodes.length / 2);
                        for (var i = 0; i < nodes_at_heights[j].nodes.length; i++) {
                            console.log(nodes_at_heights[j].nodes[i]);
                            var task_node = {};
                            if (i==middle_index){
                                task_node.x = 580
                            }
                            else if (i<middle_index){
                                task_node.x = 580 - (i+1)*180
                            }
                            else if (i>middle_index){
                                task_node.x = 580 + (i-1)*180
                            }
                            task_node.y = 150+(realDepth-j-1)*130;
                            angular.forEach(graph, function(graph_node){
                                if (graph_node.index==nodes_at_heights[j].nodes[i]){
                                    task_node.name = graph_node.name;
                                    operatorName = graph_node.operator;
                                }
                            });
                            angular.forEach($scope.operators, function(operator){
                                if (operatorName==operator.name){
                                    task_node.operator = operator;
                                }
                            });
                            task_node.sources = [
                                                    {
                                                        uuid: getNextID()
                                                    }

                                                ];
                            task_node.targets = [
                                                    {
                                                        uuid: getNextID()

                                                     }
                                                 ];
                            task_node.status = "OPH_STATUS_UNSELECTED";
                            if(typeof($scope.workflow.tasks)==="undefined")
                                $scope.workflow.tasks = [];
                            $scope.workflow.tasks.push(task_node);
                            console.log(task_node);
                        }

                    }
                    else{
                        for (var i = 0; i < nodes_at_heights[j].nodes.length; i++) {
                            var task_node = {};
                            var middle_index = Math.floor(nodes_at_heights[j].nodes.length / 2)-1;
                            console.log(middle_index);
                            if (i<=middle_index)
                                task_node.x = 655 - (middle_index+1-i)*180;

                            else if (i>middle_index)
                                task_node.x = 655 + (i-middle_index-1)*180;
                            task_node.y = 150+(realDepth-j-1)*130;
                            angular.forEach(graph, function(graph_node){
                                if (graph_node.index==nodes_at_heights[j].nodes[i]){
                                    task_node.name = graph_node.name;
                                    operatorName = graph_node.operator;
                                }
                            });
                            angular.forEach($scope.operators, function(operator){
                                if (operatorName==operator.name){
                                    task_node.operator = operator;
                                }
                            });
                            task_node.sources = [
                                                    {
                                                        uuid: getNextID()
                                                    }

                                                ];
                            task_node.targets = [
                                                    {
                                                        uuid: getNextID()

                                                     }
                                                 ];
                            task_node.status = "OPH_STATUS_UNSELECTED";
                            if(typeof($scope.workflow.tasks)==="undefined")
                                $scope.workflow.tasks = [];
                            $scope.workflow.tasks.push(task_node);
                            console.log(task_node);
                        }
                    }
                }
                angular.forEach($scope.workflow.tasks, function(task){
                    angular.forEach(graph, function(graph_node){
                        if (task.name==graph_node.name){
                            for (var i = 0; i < graph_node.out_edges.length; i++) {
                                angular.forEach($scope.workflow.tasks, function(task2){
                                    if (task2.name==graph_node.out_edges[i].name){
                                        if (typeof(task.sources[0].connections) === 'undefined'){
                                                    task.sources[0].connections = [];
                                                }
                                                task.sources[0].connections.push({'uuid': task2.targets[0].uuid });


                                    }

                                });

                            }
                        }
                    });
                });

            });
       }
       else
            GrowlNotification.Create("error", "Please try to upload a valid workflow!");
    };

  //On drag and drop jsPlumb connection, add the dependency in the json workflow
  $scope.onConnection = function(instance, connection, targetUUID, sourceUUID){
    var dependentTask = {};
    var independentTask = {};
    $scope.activeConnection = {"sourceID" : sourceUUID, "targetID" : targetUUID};
    angular.forEach($scope.workflow.tasks, function(task){
        angular.forEach(task.sources, function(source){
            if(source.uuid == sourceUUID){
                independentTask = task;
                if(typeof source.connections === 'undefined') source.connections = [];
                source.connections.push({'uuid': targetUUID });
                $scope.$apply();
            }
        });
    });
    angular.forEach($scope.workflow.tasks, function(task){
        angular.forEach(task.targets, function(target){
            if(target.uuid == targetUUID){
                dependentTask = task;
            }
        });
    });
    angular.forEach($scope.jsonworkflow.tasks, function(task){
        if (task.name==dependentTask.name){
            if(typeof task.dependencies === 'undefined') task.dependencies = [];
            task.dependencies.push({'task': independentTask.name});
            $scope.$apply();
            $scope.dependency.dependentTask = task;
        }
        if (task.name==independentTask.name){
            $scope.dependency.independentTask = task;
        }
        $scope.jsonstring = angular.toJson($scope.jsonworkflow, true);

    });

    $scope.changeTab("dependency_options");

  }

  //Encode URI component for the download of the JSON workflow
    $scope.encodeJson = function(workflow) {
      var temp;
      try {
        temp = angular.fromJson(workflow);
      }
      catch (e) {
        temp = workflow;
      }

      var jsonStringify = angular.toJson(temp, true);
      return encodeURIComponent(jsonStringify);
    }

    //Scope variables to build the form to specify the options for a dependency between tasks
    $scope.dependencyForm = [
        "*",
        {
          type: "submit",
          title: "Apply"
        }
    ];

    $scope.dependencyModel = {};

    $scope.dependencySchema = {}
    $scope.dependencySchema.type = "object";
    $scope.dependencySchema.properties = {};
    $scope.dependencySchema.properties["argument"] = { "title": "argument", "type": "string"};
    $scope.dependencySchema.properties["order"] = { "title": "order", "type": "string"};
    $scope.dependencySchema.properties["type"] = { "title": "type", "type": "string", "enum": ["all", "single", "embedded"]};
    $scope.dependencySchema.properties["filter"] = { "title": "filter", "type": "string"};
    $scope.dependencySchema.properties["output_argument"] = { "title": "output_argument", "type": "string"};
    $scope.dependencySchema.properties["output_order"] = { "title": "output_order", "type": "string"};



    $scope.$on('tasks_updated', function () {
        $scope.jsonworkflow.tasks = WorkflowData.getTasks();
        $scope.jsonstring = angular.toJson($scope.jsonworkflow, true);
    });

    $scope.$on('global_attributes_updated', function () {
       var GlobalAttributes = WorkflowData.getGlobalAttributes();
       if(typeof $scope.jsonworkflow=== 'undefined') $scope.jsonworkflow = {};
                for (var key in GlobalAttributes) {
                    if (GlobalAttributes.hasOwnProperty(key)) {
                        $scope.jsonworkflow[key] = GlobalAttributes[key];
                    }
                };

            $scope.jsonstring = angular.toJson($scope.jsonworkflow, true);
            GrowlNotification.Create("success", "Workflow global attributes have been set");



    });

     $scope.$on('connection_parameters_updated', function () {
                var ConnectionParameters = WorkflowData.getConnectionParameters();

                for (var key in ConnectionParameters) {
                    if (ConnectionParameters.hasOwnProperty(key)) {
                        $scope[key] = ConnectionParameters[key];
                    }
                };
                $scope.connectionData = {
                        "server" : $scope.server,
                        "port" : $scope.port,
                        "username" : $scope.username,
                        "password" : $scope.password,
                };
                GrowlNotification.Create("success", "Connection parameters to Ophidia Server have been saved.");



    });



    /*
    end Workflow logic
    */


  }
})();
