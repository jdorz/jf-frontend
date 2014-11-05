(function(){
  angular.module('jf').controller('AlertsCtrl', function($scope, CONFIG, Events, $timeout){
    var lastMessageId, errorHandler;
    if (CONFIG.debug) {
      window.alertScope = $scope;
    }
    lastMessageId = 0;
    function generateId(){
      lastMessageId++;
      return lastMessageId;
    }
    $scope.alerts = [];
    $scope.addAlert = function(){
      return $scope.alerts.push({
        msg: 'Another alert!'
      });
    };
    $scope.closeAlert = function(index){
      if (index >= 0) {
        return $scope.alerts.splice(index, 1);
      }
    };
    function addMessage(msg, type){
      var message;
      type || (type = 'success');
      message = {
        type: type,
        msg: msg,
        id: generateId()
      };
      $scope.alerts.push(message);
      return message.id;
    }
    function getMessageIndexById(id){
      return _.findIndex($scope.alerts, function(msg){
        return id === msg.id;
      });
    }
    function addMessageAutoClose(msg, type){
      var id;
      type || (type = 'success');
      id = addMessage(msg, type);
      return $timeout(function(){
        return $scope.closeAlert(getMessageIndexById(id));
      }, CONFIG.common.alertAutoCloseTimeout);
    }
    Events.on("ajax:message_persistent", function(msg){
      return addMessage(msg);
    });
    Events.on("ajax:message", function(msg){
      return addMessageAutoClose(msg, 'success');
    });
    Events.on("ajax:message_close", function(index){
      $scope.closeAlert(index);
    });
    errorHandler = function(msg){
      if (msg) {
        return addMessageAutoClose(msg, 'danger');
      }
    };
    Events.on("ajax:error", errorHandler);
    Events.on("error", errorHandler);
  });
}).call(this);
