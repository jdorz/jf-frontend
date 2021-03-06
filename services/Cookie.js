angular.module('jf')
.service('Cookie', function() {
	return {
		create: function(name, value, expiresDays) {
		    var expires = "";
		    if(expiresDays) {
		        var days = expiresDays;
		        var date = new Date();
		        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		        expires = "; expires=" + date.toGMTString();
		    }
		    document.cookie = name + "=" + value + expires + "; path=/";
		},

		// zwraca wartość lub null jeśli nieznaleziono
		read: function(name) {
		    var nameEQ = name + "=";
		    var ca = document.cookie.split(';');
		    for (var i = 0; i < ca.length; i++) {
		        var c = ca[i];
		        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
		        if(c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
		    }
		    return null;
		},
		erase: function(name) {
		    this.create(name, "", -1);
		}
	}
});