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
    return this;
  });
}).call(this);
