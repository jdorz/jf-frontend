(function(){
  angular.module('jf').controller('ApplicationCtrl', function($scope, CONFIG, Authorization, Session, $location, AjaxAction, Messages, DwrLoader, ConnectionChecker){
    var spinnerTarget, ref$;
    if (CONFIG.debug) {
      window.appScope = $scope;
    }
    $scope.CONFIG = CONFIG;
    spinnerTarget = document.getElementById('spinner');
    $scope.spinner = new Spinner(CONFIG.spinner).spin(spinnerTarget).stop();
    function spinStart(){
      console.log("spinStart");
      return $scope.spinner.spin(spinnerTarget);
    }
    function spinStop(){
      console.log("spinStop");
      return $scope.spinner.stop();
    }
    if (CONFIG.debug) {
      window.spinStart = spinStart;
      window.spinStop = spinStop;
    }
    $scope.currentUser = null;
    $scope.setPendingRequest = function(pendingRequest){
      console.log("setPendingRequest ->", pendingRequest);
      if (pendingRequest) {
        spinStart();
      } else {
        spinStop();
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
