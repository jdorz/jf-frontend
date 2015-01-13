(function(){
  angular.module('jf').controller('ApplicationCtrl', function($scope, CONFIG, Authorization, Authentication, Session, $location, AjaxAction, Spinner, ConnectionChecker){
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
    $scope.$on("$locationChangeStart", handleLocationChange);
    function handleLocationChange(event, next, previous){
      var nextPath;
      console.log("next ------>", next);
      nextPath = resolveNextPath(event, next);
      if (!nextPath.match(CONFIG.common.loginPath)) {
        if (CONFIG.common.keepPreviousPath) {
          console.log("previous <-----", previous);
          Session.previousUrl = previous;
        }
        return Authorization.isAuthorized(nextPath, function(isAuthorized){
          console.log("isAuthorized", isAuthorized, nextPath);
          if (!isAuthorized) {
            if (CONFIG.common.ssoLoginUrl) {
              return window.location.href = CONFIG.common.ssoLoginUrl;
            } else {
              console.log("redirect --> " + CONFIG.common.loginPath + "?redirectPath=" + nextPath);
              return $location.path(CONFIG.common.loginPath).search({
                redirectPath: encodeURIComponent(nextPath)
              });
            }
          }
        });
      }
    }
    function resolveNextPath(event, next){
      var nextPath;
      if (typeof next === 'string') {
        return new URI(next).resource();
      }
      if (next.url) {
        nextPath = new URI(next.url).resource();
      }
      throw "Cannot parse next path to url";
    }
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
