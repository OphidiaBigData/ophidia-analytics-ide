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

/**
* WorkflowData
*/
(function () {
  'use strict';

  angular
    .module('ophidiaAnalyticsIDE.editor.services')
    .factory('WorkflowData', WorkflowData);

  WorkflowData.$inject = ['$http', '$rootScope'];

  /**
  * @namespace WorkflowData
  * @returns {Factory}
  */
  function WorkflowData($http, $rootScope) {

    //service object
        var data = {
            activeTask: {},
            GlobalAttributes: {},
            ConnectionParameters: {},
            Tasks: []
        };

        return {
            getGlobalAttributes: function(){
                return data.GlobalAttributes;
            },
            setGlobalAttributes: function(GlobalAttributes){
                data.GlobalAttributes = GlobalAttributes;
                $rootScope.$broadcast('global_attributes_updated');
            },
            getConnectionParameters: function(){
                return data.ConnectionParameters;
            },
            setConnectionParameters: function(ConnectionParameters){
                data.ConnectionParameters = ConnectionParameters;
                $rootScope.$broadcast('connection_parameters_updated');
            },
            getTasks: function(){
                return data.Tasks;
            },
            setTasks: function(Tasks){
                data.Tasks = Tasks;
            },
            addTask: function(task){
                data.Tasks.push(task);
                $rootScope.$broadcast('tasks_updated');
            },
            getActiveTask: function(){
                return data.activeTask;
            },
            setActiveTask: function(activeTask){
                data.activeTask = activeTask;
                $rootScope.$broadcast('active_task_updated');

            },
            getTaskArguments: function(taskName){
                for (var j = 0; j < data.Tasks.length; j++){
                    if (data.Tasks[j].name==taskName){
                        return data.Tasks[j].arguments;
                    }
                };
                return undefined;
            },
            setTaskArguments: function(taskName, args){
                for (var j = 0; j < data.Tasks.length; j++){
                    if (data.Tasks[j].name==taskName){
                        data.Tasks[j].arguments = args;
                    }
                };
                $rootScope.$broadcast('tasks_updated');

            },
            getTaskFunctions: function(taskName){
                for (var j = 0; j < data.Tasks.length; j++){
                    if (data.Tasks[j].name==taskName){
                        return data.Tasks[j];
                    }
                    else
                        return undefined;
                };
            },
            setTaskFunctions: function(taskName, functions){
                for (var j = 0; j < data.Tasks.length; j++){
                    if (data.Tasks[j].name==taskName){
                        for (var key in functions) {
                            if (functions.hasOwnProperty(key)) {
                                data.Tasks[j][key] = functions[key];
                            }
                        };
                    }
                };
                $rootScope.$broadcast('tasks_updated');
            },
        }


  }
})();
