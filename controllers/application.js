(function(){
  angular.module('jf').controller('ApplicationCtrl', function($scope, CONFIG, Authorization, Authentication, Session, $location, AjaxAction, Messages, DwrLoader, ConnectionChecker, Spinner){
    var ref$, spinner, ref1$;
    if (CONFIG.debug) {
      window.appScope = $scope;
      window.CONFIG = CONFIG;
    }
    $scope.CONFIG = CONFIG;
    if ((ref$ = CONFIG.spinner) != null) {
      ref$.delay = CONFIG.common.spinnerDelay;
    }
    spinner = Spinner('spinner', CONFIG.spinner);
    $scope.currentUser = null;
    $scope.setPendingRequest = function(pendingRequest){
      console.log("setPendingRequest ->", pendingRequest);
      if (pendingRequest) {
        spinner.start();
      } else {
        spinner.stop();
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
    if ((ref1$ = CONFIG.connectionChecker) != null && ref1$.enabled) {
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
    Authentication.discoverLoginState();
  });
}).call(this);
