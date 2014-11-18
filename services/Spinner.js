(function(){
  angular.module('jf').service('Spinner', function(CONFIG){
    function Spinner(idSelector, spinnerConfig){
      this.spinnerTarget = document.getElementById(idSelector);
      this.spinner = new Spinner(spinnerConfig).spin(idSelector).stop();
      this.spinnerDelay = CONFIG.common.spinnerDelay;
      this.spinnerTimeout = false;
      this.spinnerIsVisible = false;
      if (CONFIG.debug) {
        window.spinStart = this.start;
        return window.spinStop = this.stop;
      }
    }
    Spinner.prototype.start = function(){
      if (!this.spinnerDelay) {
        console.log("SPINNER start");
        this.spinner.spin(spinnerTarget);
        return this.spinnerIsVisible = true;
      } else {
        console.log("SPINNER start with delay " + spinnerDelay + "ms");
        return this.spinnerTimeout = setTimeout(function(){
          return $scope.spinner.spin(spinnerTarget);
        }, spinnerDelay);
      }
    };
    Spinner.prototype.stop = function(){
      if (this.spinnerTimeout !== false) {
        console.log("SPINNER stop (timeout only)");
        clearTimeout(this.spinnerTimeout);
        this.spinnerTimeout = false;
      }
      if (spinnerIsVisible) {
        console.log("SPINNER stop");
        this.spinner.stop();
        return this.spinnerIsVisible = false;
      }
    };
    return function(selector, spinnerConfig){
      return new Spinner(selector, spinnerConfig);
    };
  });
}).call(this);
