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
* Workflows
* @namespace ophidiaAnalyticsIDE.workflows.services
*/
(function () {
  'use strict';

  angular
    .module('ophidiaAnalyticsIDE.workflows.services')
    .factory('Workflows', Workflows);

  Workflows.$inject = ['$http'];

  /**
  * @namespace Workflows
  * @returns {Factory}
  */
  function Workflows($http) {
    var Workflows = {
      create: create,
      get: get,
      destroy: destroy,
      update: update
    };

    return Workflows;


    /**
    * @name create
    * @desc Create a new Workflow
    * @param {string} json_workflow The JSON string for the workflow
    * @param {string} layout The graphical layout of the workflow
    * @returns {Promise}
    * @memberOf ophidiaAnalyticsIDE.workflows.services.Workflows
    */
    function create(json_workflow, layout) {
      return $http.post('/api/v1/workflows/', {
        json_workflow: json_workflow,
        layout: layout
      });
    }

    /**
     * @name get
     * @desc Get the Workflows of a given user
     * @param {string} username The username to get Workflows for
     * @returns {Promise}
     * @memberOf ophidiaAnalyticsIDE.workflows.services.Workflows
     */
    function get(username) {
      return $http.get('/api/v1/accounts/' + username + '/workflows/');
    }

    ////////////////////

    /**
    * @name destroy
    * @desc Destroys the given workflow
    * @param {Object} profile The workflow to be destroyed
    * @returns {Promise}
    * @memberOf ophidiaAnalyticsIDE.workflows.services.Workflows
    */
    function destroy(workflow) {
      return $http.delete('/api/v1/workflows/' + workflow.id + '/');
    }

     /**
    * @name update
    * @desc Update the given workflow
    * @param {Object} profile The workflow to be updated
    * @returns {Promise}
    * @memberOf ophidiaAnalyticsIDE.workflows.services.Workflows
    */
    function update(workflow) {
      return $http.put('/api/v1/workflows/' + workflow.id + '/', workflow);
    }
  }
})();
