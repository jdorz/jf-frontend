(function(){
  angular.module('jf').service('Events', function(CONFIG){
    var Events, events;
    Events = (function(superclass){
      Events.displayName = 'Events';
      var prototype = extend$(Events, superclass).prototype, constructor = Events;
      function Events(){}
      return Events;
    }(EventEmitter2));
    events = new Events();
    if (CONFIG.debug) {
      window.Events = events;
    }
    return events;
  });
  function extend$(sub, sup){
    function fun(){} fun.prototype = (sub.superclass = sup).prototype;
    (sub.prototype = new fun).constructor = sub;
    if (typeof sup.extended == 'function') sup.extended(sub);
    return sub;
  }
}).call(this);
