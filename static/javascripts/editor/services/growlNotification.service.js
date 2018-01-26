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
* GrowlNotification
*/
(function () {
  'use strict';

  angular
    .module('ophidiaAnalyticsIDE.editor.services')
    .factory('GrowlNotification', GrowlNotification);

  GrowlNotification.$inject = ['growl'];

  /**
  * @namespace GrowlNotification
  * @returns {Factory}
  */
  function GrowlNotification(growl) {

     var service = {};

        //object functions (defined later)
        service.Create = Create;

        //return object service
        return service;

        function Create(type, message) {

            var config = {};
            switch (type) {
                  case "success":
                    growl.success(message, config);
                    break;
                  case "info":
                    growl.info(message, config);
                    break;
                  case "warning":
                    growl.warning(message, config);
                    break;
                  default:
                    growl.error(message, config);

             }



        }


  }
})();
