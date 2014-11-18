(function(){
  angular.module('jf').service('Authentication', function(AjaxAction, Session){
    var this$ = this;
    this.isLoggedInDfd = $.Deferred();
    this.discoverLoginState = function(){
      AjaxAction("is_logged_in").withRawResponse().done(function(response){
        if (response.is_logged_in) {
          Session.login(response.username);
          return this$.isLoggedInDfd.resolve(response.username);
        } else {
          return this$.isLoggedInDfd.reject();
        }
      });
    };
    this.authenticate = function(credentials){
      var dfd;
      dfd = $.Deferred();
      AjaxAction().post("login").withData(credentials).done(function(){
        Session.login(credentials.username);
        console.log("Session (Authentication)", Session.getUsername());
        return dfd.resolve("OK");
      }).fail(function(error){
        return dfd.reject(error);
      });
      return dfd;
    };
    this.logout = function(){
      var dfd;
      dfd = $.Deferred();
      AjaxAction().post("logout").done(function(){
        Session.logout();
        return dfd.resolve("OK");
      }).fail(function(error){
        alert(arguments);
        return dfd.reject(error);
      });
      return dfd;
    };
    return this;
  });
}).call(this);
