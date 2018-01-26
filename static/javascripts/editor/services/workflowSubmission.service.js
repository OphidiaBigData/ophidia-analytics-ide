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
* WorkflowSubmissionService
*/
(function () {
  'use strict';

  angular
    .module('ophidiaAnalyticsIDE.editor.services')
    .factory('WorkflowSubmissionService', WorkflowSubmissionService);

  WorkflowSubmissionService.$inject = ['$http'];

  /**
  * @namespace WorkflowSubmissionService
  * @returns {Factory}
  */
  function WorkflowSubmissionService($http) {

    //service object
        var service = {};

        //object functions (defined later)
        service.Create = Create;

         //urlbase for API endpoint
        var urlBase = window.location.href+'api/workflowSubmission/';


        //return object service
        return service;

        function Create(submissionData) {
            return $http.post(urlBase, submissionData).then(handleSuccess, handleError('Error in creating workflow'));
         }

      function handleSuccess(res) {
            return res;
        }

        function handleError(error) {
            return function () {
                return { success: false, message: error };
            };
        }
  }
})();
