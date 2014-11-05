(function(){
  angular.module('jf').service('Authorization', function(CONFIG, AjaxAction, Session){
    var isLoggedInDfd, isAuthorized, this$ = this;
    isLoggedInDfd = $.Deferred();
    this.check = function(){
      AjaxAction("is_logged_in").withRawResponse().done(function(response){
        if (response.is_logged_in) {
          Session.setUsername(response.username);
          return isLoggedInDfd.resolve(response.username);
        } else {
          return isLoggedInDfd.reject();
        }
      });
    };
    isAuthorized = function(path){
      if (URI(path).path() === CONFIG.common.loginPath) {
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
        return isLoggedInDfd.done(function(){
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
    this.check();
    return this;
  });
}).call(this);
