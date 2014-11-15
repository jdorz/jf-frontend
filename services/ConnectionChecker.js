(function(){
  angular.module('jf').service('ConnectionChecker', function(AjaxAction, Events, CONFIG){
    var enabled, ref$, timeout, ref1$, interval, ref2$, reconnectAttempts, ref3$;
    enabled = ((ref$ = CONFIG.connectionChecker) != null ? ref$.enabled : void 8) || false;
    timeout = ((ref1$ = CONFIG.connectionChecker) != null ? ref1$.timeout : void 8) || 4000;
    interval = ((ref2$ = CONFIG.connectionChecker) != null ? ref2$.interval : void 8) || 4000;
    reconnectAttempts = ((ref3$ = CONFIG.connectionChecker) != null ? ref3$.reconnectAttempts : void 8) || 3;
    function Checker(){
      this.loop = -1;
      this.state = true;
      return this.reconnectAttempts = reconnectAttempts;
    }
    Checker.prototype.check = function(){
      return AjaxAction.get("connectionChecker").withTimeout(timeout);
    };
    Checker.prototype.start = function(){
      if (!enabled) {
        return console.log("CONNECTIONCHECKER not enabled, cannot start");
      }
      return this.intervalCallback();
    };
    Checker.prototype.intervalCallback = function(){
      var this$ = this;
      if (!enabled) {
        console.log("CONNECTIONCHECKER not enabled, stopping iteration");
        return clearTimeout(this.loop);
      }
      return this.check().done(function(){
        console.log("CONNECTIONCHECKER ok");
        if (this$.state === false) {
          Events.emit("connectionChecker:ok");
        }
        this$.state = true;
        return this$.loop = setTimeout(function(){
          return this$.intervalCallback();
        }, interval);
      }).fail(function(){
        var this$ = this;
        console.log("CONNECTIONCHECKER error, cannot connect");
        this.state = false;
        this.loop = setTimeout(function(){
          return this$.intervalCallback();
        }, interval);
        return Events.emit("connectionChecker:fail");
      });
    };
    return Checker.prototype.stop = function(){
      return clearTimeout(this.loop);
    };
  });
}).call(this);
