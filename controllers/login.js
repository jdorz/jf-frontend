(function(){
  angular.module('jf').controller('LoginCtrl', function($scope, AjaxAction, Authentication, $location, $routeParams, $timeout){
    var redirectPath, redirect;
    $scope.error = null;
    redirectPath = $location.search()["redirectPath"] || "/";
    redirectPath = decodeURIComponent(redirectPath);
    console.log("redirectPath = " + redirectPath);
    redirect = function(redirectPath){
      var uri;
      uri = URI(redirectPath);
      console.log("redirect --> " + redirectPath + ", path = " + uri.path() + ", search = " + uri.search());
      $timeout(function(){
        var l;
        l = $location.path(uri.path());
        return setSearch(l);
      }, 1000);
      function setSearch(location){
        var l;
        l = location.search({});
        return _.each(uri.search(true), function(v, k){
          return l = l.search(k, v);
        });
      }
      return setSearch;
    };
    $scope.login = function(credentials){
      return Authentication.authenticate(credentials).done(function(){
        $scope.success = "Zalogowano";
        return redirect(redirectPath);
      }).fail(function(error){
        return $scope.error = error;
      });
    };
    $scope.logout = function(){
      if (!CONFIG.common.ssoLogoutUrl) {
        return Authentication.logout().done(function(){
          $scope.success = "Wylogowano";
          return redirect("/");
        }).fail(function(error){
          return $scope.error = error;
        });
      } else {
        return window.location.href = CONFIG.common.ssoLogoutUrl;
      }
    };
  });
}).call(this);
