(function(){
  angular.module('jf').service('Authorization', function(CONFIG, Authentication, AjaxAction, Session){
    var isAuthorized, this$ = this;
    isAuthorized = function(path){
      var ref$;
      if (typeof (ref$ = CONFIG.auth).isPublicPath == 'function' && ref$.isPublicPath(URI(path).path())) {
        console.log("AUTHORIZATION OK " + path);
        return true;
      } else {
        console.log("AUTHORIZATION FORBIDDEN " + path);
        return false;
      }
    };
    this.isAuthorized = function(path, callback){
      console.log("Session (Authorization)", Session.getUsername());
      if (isAuthorized(path)) {
        return callback(true);
      } else {
        return Authentication.discoverLoginState().done(function(){
          return callback(true);
        }).fail(function(){
          return callback(false);
        });
      }
    };
    return this;
  });
}).call(this);
