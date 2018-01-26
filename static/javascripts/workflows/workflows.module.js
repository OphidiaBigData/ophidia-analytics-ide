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
    .module('ophidiaAnalyticsIDE.workflows', [
      'ophidiaAnalyticsIDE.workflows.controllers',
      'ophidiaAnalyticsIDE.workflows.directives',
      'ophidiaAnalyticsIDE.workflows.services'
    ]);

  angular
    .module('ophidiaAnalyticsIDE.workflows.controllers', []);

  angular
    .module('ophidiaAnalyticsIDE.workflows.directives', ['ngDialog']);

  angular
    .module('ophidiaAnalyticsIDE.workflows.services', []);
})();
