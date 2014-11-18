(function(){
  angular.module('jf').service('Spinner', function(CONFIG){
    function SpinnerWrapper(idSelector, spinnerConfig){
      this.spinnerTarget = document.getElementById(idSelector);
      this.spinner = new Spinner(spinnerConfig).spin(this.spinnerTarget).stop();
      this.spinnerDelay = spinnerConfig.delay;
      this.spinnerTimeout = false;
      this.spinnerIsVisible = false;
      console.log("SPINNER instantiated");
      if (CONFIG.debug) {
        window.spinStart = this.start;
        window.spinStop = this.stop;
      }
    }
    SpinnerWrapper.prototype.start = function(){
      var this$ = this;
      if (!this.spinnerDelay) {
        console.log("SPINNER start");
        this.spin();
      } else {
        if (this.spinnerTimeout !== false) {
          console.log("SPINNER start with delay " + this.spinnerDelay + "ms");
          this.spinnerTimeout = setTimeout(function(){
            return this$.spin();
          }, this.spinnerDelay);
        } else {
          console.log("SPINNER alreade delay started");
        }
      }
    };
    SpinnerWrapper.prototype.spin = function(){
      this.spinner.spin(this.spinnerTarget);
      this.spinnerIsVisible = true;
    };
    SpinnerWrapper.prototype.stop = function(){
      if (this.spinnerTimeout !== false) {
        console.log("SPINNER stop (timeout only)");
        clearTimeout(this.spinnerTimeout);
        this.spinnerTimeout = false;
      }
      if (this.spinnerIsVisible) {
        console.log("SPINNER stop");
        this.spinner.stop();
        this.spinnerIsVisible = false;
      }
    };
    return function(selector, spinnerConfig){
      return new SpinnerWrapper(selector, spinnerConfig);
    };
  });
}).call(this);
