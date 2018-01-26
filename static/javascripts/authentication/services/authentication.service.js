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
* Authentication
*/
(function () {
  'use strict';

  angular
    .module('ophidiaAnalyticsIDE.authentication.services')
    .factory('Authentication', Authentication);

  Authentication.$inject = ['$cookies', '$http', 'GrowlNotification'];

  /**
  * @namespace Authentication
  * @returns {Factory}
  */
  function Authentication($cookies, $http, GrowlNotification) {
    /**
    * @name Authentication
    * @desc The Factory to be returned
    */
    var Authentication = {
      getAuthenticatedOphidiaUser: getAuthenticatedOphidiaUser,
      isAuthenticated: isAuthenticated,
      login: login,
      register: register,
      setAuthenticatedOphidiaUser: setAuthenticatedOphidiaUser,
      unauthenticate: unauthenticate,
      logout: logout
    };

    return Authentication;

    ////////////////////

    /**
    * @name register
    * @desc Try to register a new user
    * @param {string} username The username entered by the user
    * @param {string} password The password entered by the user
    * @param {string} email The email entered by the user
    * @returns {Promise}
    * @memberOf ophidiaAnalyticsIDE.authentication.services
    */
    function register(username, password, email) {
      return $http.post('/api/v1/accounts/', {
        username: username,
        password: password,
        email: email
      }).then(registerSuccessFn, registerErrorFn);

      /**
      * @name registerSuccessFn
      * @desc Log the new user in
      */
      function registerSuccessFn(data, status, headers, config) {
        Authentication.login(username, password);
      }

      /**
      * @name registerErrorFn
      */
      function registerErrorFn(data, status, headers, config) {
        GrowlNotification.Create("error", "There was an error during sign up attempt. Please try again later.");
      }
    }

    /**
     * @name login
     * @desc Try to log in with username `username` and password `password`
     * @param {string} username The username entered by the user
     * @param {string} password The password entered by the user
     * @returns {Promise}
     * @memberOf ophidiaAnalyticsIDE.authentication.services.Authentication
     */
    function login(username, password) {
      return $http.post('/api/v1/auth/login/', {
        username: username, password: password
      }).then(loginSuccessFn, loginErrorFn);

      /**
       * @name loginSuccessFn
       * @desc Set the authenticated OphidiaUser and redirect to index
       */
      function loginSuccessFn(data, status, headers, config) {
        Authentication.setAuthenticatedOphidiaUser(data.data);
        window.location = '/';
      }

      /**
       * @name loginErrorFn
       */
      function loginErrorFn(data, status, headers, config) {
        GrowlNotification.Create("error", "Username or password is incorrect!");
      }
    }

    /**
     * @name getAuthenticatedOphidiaUser
     * @desc Return the currently authenticated OphidiaUser
     * @returns {object|undefined} OphidiaUser if authenticated, else `undefined`
     * @memberOf ophidiaAnalyticsIDE.authentication.services.Authentication
     */
    function getAuthenticatedOphidiaUser() {
      if (!$cookies.get('authenticatedOphidiaUser')) {
        return;
      }

      return JSON.parse($cookies.get('authenticatedOphidiaUser'));
    }

    /**
     * @name isAuthenticated
     * @desc Check if the current user is authenticated
     * @returns {boolean} True is user is authenticated, else false.
     * @memberOf ophidiaAnalyticsIDE.authentication.services.Authentication
     */
    function isAuthenticated() {
      return !!$cookies.get('authenticatedOphidiaUser');
    }

    /**
     * @name setAuthenticatedOphidiaUser
     * @desc Stringify the OphidiaUser object and store it in a cookie
     * @param {Object} ophidia_user The OphidiaUser object to be stored
     * @returns {undefined}
     * @memberOf ophidiaAnalyticsIDE.authentication.services.Authentication
     */
    function setAuthenticatedOphidiaUser(ophidia_user) {
      $cookies.put('authenticatedOphidiaUser', JSON.stringify(ophidia_user));
    }

    /**
     * @name unauthenticate
     * @desc Delete the cookie where the OphidiaUser object is stored
     * @returns {undefined}
     * @memberOf ophidiaAnalyticsIDE.authentication.services.Authentication
     */
    function unauthenticate() {
      $cookies.remove('authenticatedOphidiaUser');
    }

    /**
     * @name logout
     * @desc Try to log the user out
     * @returns {Promise}
     * @memberOf ophidiaAnalyticsIDE.authentication.services.Authentication
     */
    function logout() {
      return $http.post('/api/v1/auth/logout/')
        .then(logoutSuccessFn, logoutErrorFn);

      /**
       * @name logoutSuccessFn
       * @desc Unauthenticate and redirect to index with page reload
       */
      function logoutSuccessFn(data, status, headers, config) {
        Authentication.unauthenticate();
        window.location = '/';
      }

      /**
       * @name logoutErrorFn
       */
      function logoutErrorFn(data, status, headers, config) {
        GrowlNotification.Create("error", "There was an error during logout attempt. Please try again later.");
      }
    }


  }
})();
