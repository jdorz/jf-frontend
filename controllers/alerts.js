(function(){
  angular.module('jf').controller('AlertsCtrl', function($scope, CONFIG, Events, $timeout){
    var lastMessageId, isString, errorHandler;
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
    isString = function(value){
      return typeof value == 'string' || value && typeof value == 'object' && toString.call(value) == '[object String]' || false;
    };
    function addMessage(msg, type, contentType){
      var message;
      type || (type = 'success');
      if (!isString(msg)) {
        msg = msg.toString();
      }
      if (contentType === "application/json" && msg.match(/^"/)) {
        msg = msg.substring(1, msg.length - 1);
      }
      message = {
        type: type,
        msg: msg,
        id: generateId(),
        contentType: contentType
      };
      $scope.alerts.push(message);
      return message.id;
    }
    function getMessageIndexById(id){
      return _.findIndex($scope.alerts, function(msg){
        return id === msg.id;
      });
    }
    function addMessageAutoClose(msg, type, contentType){
      var id;
      type || (type = 'success');
      id = addMessage(msg, type, contentType);
      return $timeout(function(){
        return $scope.closeAlert(getMessageIndexById(id));
      }, CONFIG.common.alertAutoCloseTimeout);
    }
    Events.on("ajax:message_persistent", function(msg, contentType){
      return addMessage(msg, contentType);
    });
    Events.on("ajax:message", function(msg, contentType){
      return addMessageAutoClose(msg, 'success', contentType);
    });
    Events.on("alerts:message", function(msg, contentType){
      return addMessageAutoClose(msg, 'success', contentType);
    });
    Events.on("ajax:message_close", function(index){
      $scope.closeAlert(index);
    });
    errorHandler = function(msg, contentType){
      if (msg) {
        return addMessageAutoClose(msg, 'danger', contentType);
      }
    };
    Events.on("ajax:error", errorHandler);
    Events.on("alerts:error", errorHandler);
  });
}).call(this);
