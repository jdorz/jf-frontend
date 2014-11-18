(function(){
  angular.module('jf').service('Spinner', function(CONFIG){
    var cfg;
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
        this.spinner.spin(this.spinnerTarget);
        this.spinnerIsVisible = true;
      } else {
        console.log("SPINNER start with delay " + this.spinnerDelay + "ms");
        this.spinnerTimeout = setTimeout(function(){
          return this$.spinner.spin(this$.spinnerTarget);
        }, this.spinnerDelay);
      }
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
    cfg = {
      lines: 17,
      length: 40,
      width: 10,
      radius: 54,
      corners: 1,
      rotate: 0,
      direction: 1,
      color: '#000',
      speed: 1,
      trail: 60,
      shadow: false,
      hwaccel: false,
      className: 'spinner',
      zIndex: 2e9,
      top: '50%',
      left: '50%',
      position: 'fixed'
    };
    return function(selector, spinnerConfig){
      return new SpinnerWrapper(selector, spinnerConfig);
    };
  });
}).call(this);
