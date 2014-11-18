(function(){
  angular.module('jf').controller('ApplicationCtrl', function($scope, CONFIG, Authorization, Session, $location, AjaxAction, Messages, DwrLoader, ConnectionChecker, Spinner){
    var spinner, ref$;
    if (CONFIG.debug) {
      window.appScope = $scope;
    }
    $scope.CONFIG = CONFIG;
    spinner = Spinner('spinner', CONFIG.spinner);
    $scope.currentUser = null;
    $scope.setPendingRequest = function(pendingRequest){
      console.log("setPendingRequest ->", pendingRequest);
      if (pendingRequest) {
        Spinner.start();
      } else {
        Spinner.stop();
      }
    };
    Session.applicationScope = $scope;
    $scope.$on("$locationChangeStart", function(event, next){
      var nextPath;
      console.log("next ------>", next);
      nextPath = new URI(next).resource();
      Authorization.isAuthorized(nextPath, function(isAuthorized){
        console.log("isAuthorized", isAuthorized, nextPath);
        if (!isAuthorized) {
          console.log("redirect --> " + CONFIG.common.loginPath + "?redirectPath=" + nextPath);
          return $location.path(CONFIG.common.loginPath).search({
            redirectPath: encodeURIComponent(nextPath)
          });
        }
      });
    });
    if ((ref$ = CONFIG.connectionChecker) != null && ref$.enabled) {
      ConnectionChecker.start();
      Events.on("connectionChecker:fail", function(){
        console.log("APP failed to connect to backend");
        return Events.emit("alerts:error", CONFIG.text.cannotConnectToBackend);
      });
      Events.on("connectionChecker:ok", function(){
        console.log("APP reconnected to backend");
        return Events.emit("alerts:message", CONFIG.text.connectedToBackendSuccessfully);
      });
    }
  });
}).call(this);
