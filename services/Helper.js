angular.module('jf')
.service('Helper', function(CONFIG, $location) {

	var helper = {
		getPathFromConfig: function(name) {
			function resolve(object, path) {
				if(!object) {
					return false;
				}

				if(path.length > 1) {
					var part = path.shift();
					return resolve(object[part], path);
				} else {
					return object[path];
				}
			}

			var split = name.split(".");
			var url = resolve(CONFIG.backend, split);

			if(url && ! _.isPlainObject(url)) {
				return url;
			} else {
				var split = name.split(".");
				split.push("default");
				var ret = resolve(CONFIG.backend, split);
				if(ret !== false) {
					return ret;
				} else {
					throw new Error("Path "+name+" not found.");
				}
			}
		},
		getUrlFromName: function(name, pathParams) {
			var url = helper.getApplicationUrl()+helper.getPathFromConfig(name);
			if(! pathParams) {
				return url;
			} else {
				return URI.expand(url, pathParams).toString();
			}
		},
		getApplicationUrl: function() {
			return $location.protocol()+"://"+$location.host()+":"+$location.port()+"/";
		}
	};

	return helper;

});
