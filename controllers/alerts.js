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
    function addMessage(msg, type, isHtml){
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
    function addMessageAutoClose(msg, type, isHtml){
      var id;
      type || (type = 'success');
      id = addMessage(msg, type, isHtml);
      return $timeout(function(){
        return $scope.closeAlert(getMessageIndexById(id));
      }, CONFIG.common.alertAutoCloseTimeout);
    }
    Events.on("ajax:message_persistent", function(msg, isHtml){
      return addMessage(msg, isHtml);
    });
    Events.on("ajax:message", function(msg, isHtml){
      return addMessageAutoClose(msg, 'success', isHtml);
    });
    Events.on("alerts:message", function(msg, isHtml){
      return addMessageAutoClose(msg, 'success', isHtml);
    });
    Events.on("ajax:message_close", function(index){
      $scope.closeAlert(index);
    });
    errorHandler = function(msg, isHtml){
      if (msg) {
        return addMessageAutoClose(msg, 'danger', isHtml);
      }
    };
    Events.on("ajax:error", errorHandler);
    Events.on("alerts:error", errorHandler);
  });
}).call(this);
