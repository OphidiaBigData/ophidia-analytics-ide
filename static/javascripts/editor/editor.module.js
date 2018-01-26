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
    .module('ophidiaAnalyticsIDE.editor', [
        'ophidiaAnalyticsIDE.editor.controllers',
        'ophidiaAnalyticsIDE.editor.directives',
        'ophidiaAnalyticsIDE.editor.services',
        'ophidiaAnalyticsIDE.editor.filters',
        'ui.slider',
        'ngDragDrop',
        'ngDialog',
        'schemaForm',
        'angular-growl',
        'ngTextTruncate'


    ]).config(['$httpProvider', '$compileProvider', function($httpProvider, $compileProvider) {
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|data|blob):/);
    }]).config(['growlProvider', function (growlProvider) {
      growlProvider.globalTimeToLive(3000);
      growlProvider.globalDisableCountDown(true);
      growlProvider.globalPosition('bottom-right');
    }]);

   angular
    .module('ophidiaAnalyticsIDE.editor.controllers', []);

   angular
    .module('ophidiaAnalyticsIDE.editor.directives', []);

    angular
    .module('ophidiaAnalyticsIDE.editor.services', []);


    angular
    .module('ophidiaAnalyticsIDE.editor.filters', []);

})();
