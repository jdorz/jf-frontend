angular.module('jf')
  .service('AjaxAction', function($http, CONFIG, $location, $injector, Events, JQuery, Helper) {

  	var $ = JQuery;

  	var log = function(msg) {
  		console.log("AJAXACTION", msg);
  	}

  	var error = function(msg) {
  		console.error("AJAXACTION", msg);
  	}

  	if(! console) {
  		console = {
  			error: function() {},
  			log: function() {}
  		};
  	}

  	function assertExists(arg) {
  		return !(typeof arg === 'undefined');
  	}

  	// get Session if exsists
  	var ApplicationState = (function(){
	  	if($injector.has("Session")) {
  			log("Injecting Session");
	  		return $injector.get("Session");
	  	} else {
	  		return {
	  			setPendingRequest: function() {}
	  		}
	  	}
  	}());

  	// AjaxActionPrototype.toString = function() {
  	// 	return JSON.stringify(this);
  	// }
  	// console.log("AjaxAction = "+AjaxAction.prototype);

  	function AjaxAction(config, prevAjaxAction) {
		// console.log("INIT !!!", arguments);
		if(prevAjaxAction) {
			this.queryParams = prevAjaxAction.queryParams;
			this.postData = prevAjaxAction.postData;
			this.rawResponse = prevAjaxAction.rawResponse;
			this.name = prevAjaxAction.name;
			this.method = prevAjaxAction.method;
			this.pathParams = prevAjaxAction.pathParams;
			this.timeout = prevAjaxAction.timeout;
			this.config = prevAjaxAction.config;
			this._request = prevAjaxAction._request;
		} else {
			this.queryParams = {};
			this.postData = {};
			this.rawResponse = false;
			this.name = "<undefined name>";
			this.method = "get";
			this.timeout = 30000;

			// prevent making multiple requests with same AjaxAction instance
			this._request = false;

			this.config = {
				"debug": true
				// "requestType": "get"
			};
		}

		import$(this.config, config || {});

		this.DEBUG = this.config["debug"];

		this.init();
	}

	function AjaxActionFunction(name) {
		return new AjaxAction().withName(name);
	}

	AjaxAction.prototype.init = function() {
		// wrapper for jquery $.ajax, or angular $http, or other client-server communication library
		// httpRequest must return deferred object as specified:
		//    done(result)
		//    fail(errorMessage)
		if(! this.config.transport || this.config.transport === "angularHttp") {
			this.httpRequest = function() {
				return AjaxAction.prototype.angularRequest.apply(this, Array.prototype.slice.apply(arguments));
			}
		} else if(this.config.transport === "jqueryAjax") {
			this.httpRequest = function() {
				return AjaxAction.prototype.angularRequest.apply(this, Array.prototype.slice.apply(arguments));
			}
		} else {
			throw "Unknown transport: "+this.config.transport;
		}
	}

	AjaxAction.prototype.withRawResponse = function() {
		var ajaxAction = new AjaxAction(null, this);
		ajaxAction.setRawResponse(true);
		return ajaxAction;
	}

	AjaxAction.prototype.withQueryParams = function(queryParams) {
		var ajaxAction = new AjaxAction(null, this);
		ajaxAction.setQueryParams(queryParams);
		return ajaxAction;
	}

	AjaxAction.prototype.withPathParams = function(pathParams) {
		var ajaxAction = new AjaxAction(null, this);
		ajaxAction.setPathParams(pathParams);
		return ajaxAction;
	}

	AjaxAction.prototype.withName = function(name) {
		var ajaxAction = new AjaxAction(null, this);
		ajaxAction.setName(name);
		return ajaxAction;
	}

	AjaxAction.prototype.withTimeout = function(timeout) {
		var ajaxAction = new AjaxAction(null, this);
		ajaxAction.setTimeout(timeout);
		return ajaxAction;
	}

	AjaxAction.prototype.withNameResolver = function(fn) {
		var ajaxAction = new AjaxAction(null, this);
		ajaxAction.setUrlFromName(fn);
		return ajaxAction;
	}

	AjaxAction.prototype.withData = function(data) {
		var ajaxAction = new AjaxAction(null, this);
		ajaxAction.setData(data);
		return ajaxAction;
	}

	AjaxAction.prototype.withMethod = function(method) {
		var ajaxAction = new AjaxAction(null, this);
		ajaxAction.setMethod(method);
		return ajaxAction;
	}

	AjaxAction.prototype.setRawResponse = function(rawResponse) {
		this.rawResponse = rawResponse;
	}

	AjaxAction.prototype.setQueryParams = function(queryParams) {
		this.queryParams = queryParams;
	}

	AjaxAction.prototype.setPathParams = function(pathParams) {
		this.pathParams = pathParams;
	}

	AjaxAction.prototype.setName = function(name) {
		this.name = name;
	}

	AjaxAction.prototype.setUrlFromName = function(fn) {
		this.urlFromName = setUrlFromName;
	}

	AjaxAction.prototype.setTimeout = function(timeout) {
		this.timeout = timeout;
	}

	AjaxAction.prototype.setData = function(data) {
		this.postData = data;
	}

	AjaxAction.prototype.setMethod = function(method) {
		this.method = method;
	}

	AjaxAction.prototype.done = function() {
		var ajax = this.request();
		return ajax.done.apply(this, Array.prototype.slice.apply(arguments));
	}

	AjaxAction.prototype.fail = function() {
		var ajax = this.request();
		return ajax.fail.apply(this, Array.prototype.slice.apply(arguments));
	}

	AjaxAction.prototype.addActionMessage = function(message, isError, contentType) {
		// var isHtml = !!message.match(/^<html>/);

		Events.emit(isError === true ? "ajax:error" : "ajax:message", message, contentType);

		isError ? error(message) : log(message);
	}

	AjaxAction.prototype.addActionError = function(message, contentType) {
		// if(this.DEBUG) message += " [js]";
		return this.addActionMessage(message, true, contentType);
	}

	AjaxAction.prototype.handleMessages = function(messages, isError) {
		var self = this;
		if(_.isArray(messages)) {
			_.each(messages, function(msg){
				self.addActionMessage(msg, isError);
			})
		}
	}

	AjaxAction.prototype.post = function(name, postData) {
		var ajaxAction = new AjaxAction(null, this);
		ajaxAction.setMethod("post");
		if(name) {
			ajaxAction.setName(name);
		}
		if(postData) {
			ajaxAction.setData(postData);
		}
		return ajaxAction;
	}

	AjaxAction.prototype.get = function(name, queryParams) {
		var ajaxAction = new AjaxAction(null, this);
		ajaxAction.setMethod("get");
		if(name) {
			ajaxAction.setName(name);
		}
		if(queryParams) {
			ajaxAction.setQueryParams(queryParams);
		}
		return ajaxAction;
	}

	AjaxAction.prototype.getPathFromConfig = function(name) {
		return Helper.getPathFromConfig(name);
  	}

  	AjaxAction.prototype.getUrlFromName = function(name) { 
  		return Helper.getUrlFromName(name);
  	}

	AjaxAction.prototype.request = function() {

		// prevent multiple requests
		if(this._request !== false) {
			return this._request;
		}

		var self = this;
		var dfd = $.Deferred();

		this._request = dfd;

		assertExists(name);

		var urlString = this.getUrlFromName(this.name);

		var url;

		if(this.pathParams) {
			url = URI.expand(urlString, this.pathParams);
		} else {
			url = URI(urlString);
		}

		var method;

		ApplicationState.setPendingRequest(true);

		url.addQuery(this.queryParams);

		var params = {
			method: this.method.toUpperCase(),
			params: this.queryParams,
			timeout: this.timeout,
			url: url.toString()
		};

		if(this.postData && this.method !== "get") {
			params.data = this.postData;
		}

		var ajax = this.httpRequest(params);

		if(this.DEBUG) log(params.method+" "+url.toString());

		ajax.done(function(result, status, headers){

			if(self.DEBUG) {
				var contentType = headers("Content-Type");

				if(contentType != null && (contentType.match(/application\/json/) || contentType.match(/application\/xml/))) {
					log(params.method+" "+url.toString()+" -->", result);
				}
			}

			if(_.isObject(result))
			{
				self.handleMessages(result["errors"], true);
				self.handleMessages(result["messages"]);

				var response;
				if (!self.rawResponse) {
					response = result["result"];
				} else {
					response = result;
				}

				if(result["failed"] === true)
				{
					dfd.reject("error", response, status, headers);
				}
				else
				{
					dfd.resolve(response, status, headers);
				}
			}
			else
			{
				// var err = "result is not an object, name = "+name+", url = "+method+" "+url.toString();
				// error(err);
				// addActionError("Nie można odczytać wyniku");

				// dfd.reject(err);
				log("result is not an object, name = "+name+", url = "+method+" "+url.toString());
				// addActionError("Nie można odczytać wyniku");

				dfd.resolve(result, status, headers);
			}

			ApplicationState.setPendingRequest(false);

		}).fail(function(errorMessage, status, headerGetter){
			var contentType = headerGetter("Content-Type");

			error(errorMessage);
			if(errorMessage) {
				self.addActionError(errorMessage, contentType);
			}
			ApplicationState.setPendingRequest(false);

			dfd.reject(errorMessage);
		});

		return dfd;
	}

	AjaxAction.prototype.jQueryRequest = function(options) {
		if(! options) {
			error("jQueryRequest: No options");
			throw "jQueryRequest: No options";
		}

		var dfd = $.Deferred();

		var ajaxOptions = {};

		if(options.data) ajaxOptions.data = options.data;

		ajaxOptions.type = options.method;

		var ajax = $.ajax(options.url, ajaxOptions);

		ajax.done(function(data){
			dfd.resolve(data);
		});

		ajax.fail(function(jqXHR, statusText, error){
			dfd.reject(error, statusText, function(headerName) { return jqXHR.getResponseHeader(headerName); });
		});

		return dfd;
	}
	
	AjaxAction.prototype.angularRequest = function(options) {
		if(! options) {
			var msg = "angularRequest: no options";
			error(msg);
			throw msg;
		}

		var dfd = $.Deferred();

		var angularOptions = {
			withCredentials: true
		};

		angularOptions.url = options.url;
		angularOptions.method = options.method;
		angularOptions.timeout = options.timeout;

		if(angularOptions.method !== "GET") {

			if(options.data) {

				var data;
				if(options.requestPayload) {
					angularOptions.headers = {'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest'};
					data = _.map(options.data, function(v, k) {
						return k+"="+encodeURIComponent(v).replace(/%20/g,'+').replace(/%3D/g,'=');
					}).join("&");
				} else {
					data = options.data;
				}

				// data = data.replace('%20','+').replace('%3D','=');
				angularOptions.data = data;
			}
			// if(options.data) angularOptions.data = options.data;
			// if(options.params) angularOptions.params = options.params;
		} else {
			angularOptions.method = "GET";
			// if(options.params) angularOptions.params = options.params;
		}

		if(this.DEBUG) {
			console.log("AJAXACTION angularOptions", angularOptions);
		}
		
		var http = $http(angularOptions);

		http.success(function(data, status, headers, config){
			dfd.resolve(data, status, function(headerName) { return headers(headerName); });
		});

		http.error(function(data, status, headers, config){
			dfd.reject(data, status, function(headerName) { return headers(headerName); });
		});

		return dfd;
	}

	return AjaxActionFunction;

	function import$(obj, src){
	    var own = {}.hasOwnProperty;
	    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
	    return obj;
	}
});
