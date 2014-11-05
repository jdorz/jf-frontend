(function(){
  angular.module('jf').service('Authentication', function(AjaxAction, Session){
    this.authenticate = function(credentials){
      var dfd;
      dfd = $.Deferred();
      AjaxAction().post("login").withData(credentials).done(function(){
        Session.setUsername(credentials.username);
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
        Session.setUsername(null);
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
