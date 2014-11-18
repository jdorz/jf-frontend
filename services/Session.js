(function(){
  angular.module('jf').service('Session', function(){
    var username, this$ = this;
    username = null;
    this.applicationScope = {
      currentUser: null,
      setPendingRequest: function(){}
    };
    this.setPendingRequest = function(pendingRequest){
      this$.applicationScope.setPendingRequest(pendingRequest);
    };
    this.getUsername = function(){
      return username;
    };
    this.setUsername = function(_username){
      username = _username;
      this$.applicationScope.currentUser = _username;
    };
    this.isLoggedIn = function(){
      return !!this$.getUsername();
    };
    this.logout = function(b){
      this$.setUsername(null);
    };
    this.login = function(username){
      this$.setUsername(username);
    };
    return this;
  });
}).call(this);
