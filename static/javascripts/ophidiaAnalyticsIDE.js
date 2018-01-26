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
    .module('ophidiaAnalyticsIDE', [
      'ophidiaAnalyticsIDE.editor',
      'ophidiaAnalyticsIDE.routes',
      'ophidiaAnalyticsIDE.config',
      'ophidiaAnalyticsIDE.authentication',
      'ophidiaAnalyticsIDE.layout',
      'ophidiaAnalyticsIDE.workflows'
    ]);


   jsPlumb.ready(function(){
    angular.element(document).ready(function() {
        angular.bootstrap(document, ['ophidiaAnalyticsIDE']);
    });

});

  angular
    .module('ophidiaAnalyticsIDE.routes', ['ngRoute']);

  angular
  .module('ophidiaAnalyticsIDE.config', []);
})();


angular
  .module('ophidiaAnalyticsIDE')
  .run(run);

run.$inject = ['$http'];

/**
* @name run
* @desc Update xsrf $http headers to align with Django's defaults
*/
function run($http) {
  $http.defaults.xsrfHeaderName = 'X-CSRFToken';
  $http.defaults.xsrfCookieName = 'csrftoken';
}
