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
      if (Session.getUsername() !== null) {
        return callback(true);
      } else {
        return Authentication.isLoggedInDfd.done(function(){
          callback(true);
        }).fail(function(){
          if (isAuthorized(path)) {
            callback(true);
          } else {
            callback(false);
          }
        });
      }
    };
    return this;
  });
}).call(this);
