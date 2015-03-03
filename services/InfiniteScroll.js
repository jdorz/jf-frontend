(function(){
  angular.module('jf').factory('InfiniteScroll', function(AjaxAction){
    var InfiniteScroll;
    InfiniteScroll = function(targetName, limit, resultField, columnField, isPageable, pathParams, searchQuery){
      resultField || (resultField = "results");
      columnField || (columnField = "columns");
      isPageable || (isPageable = false);
      this.targetName = targetName;
      this.limit = limit;
      this.resultField = resultField;
      this.columnField = columnField;
      this.isPageable = isPageable;
      this.pathParams = pathParams;
      this.searchRequest = {};
      _.merge(this.searchRequest, searchQuery);
      this._viaJson = false;
      this._onBeforeRequest = function(){};
      return this.reset();
    };
    InfiniteScroll.prototype.withOnBeforeRequest = function(callback){
      this._onBeforeRequest = callback;
      return this;
    };
    InfiniteScroll.prototype.viaQueryParams = function(){
      this._viaQueryParams = true;
      return this;
    };
    InfiniteScroll.prototype.viaJson = function(){
      this._viaJson = true;
      return this;
    };
    InfiniteScroll.prototype.withIdColumnName = function(idColumnName){
      this.idColumnName = idColumnName;
      return this;
    };
    InfiniteScroll.prototype.withNoResultsCallback = function(callback){
      if (typeof callback === 'function') {
        this.noResultsCallback = callback;
      }
      return this;
    };
    InfiniteScroll.prototype.reset = function(){
      this.items = [];
      this.busy = false;
      this.columns = [];
      this.after = '';
      this.searchRequest.limit = this.limit;
      if (this.isPageable) {
        this.searchRequest.page = -1;
      } else {
        this.searchRequest.offset = -this.limit;
      }
    };
    InfiniteScroll.prototype.getSearchRequest = function(){
      return this.searchRequest;
    };
    InfiniteScroll.prototype.sortBy = function(column){
      var sortField;
      this.reset();
      sortField = column.property.replace(/document_/, "");
      if (this.searchRequest.sortField === sortField) {
        this.searchRequest.ascending = !this.searchRequest.ascending;
      } else {
        this.searchRequest.ascending = false;
      }
      this.searchRequest.sortField = sortField;
      this.nextPage();
    };
    InfiniteScroll.prototype.sortByColumns = function(result){
      var id, ret, this$ = this;
      id = null;
      ret = _.map(this.columns, function(column){
        var innerRet;
        innerRet = result[column.property];
        return innerRet;
      });
      ret.resultObject = result;
      if (result.id) {
        ret.id = result.id;
      }
      return ret;
    };
    InfiniteScroll.prototype.nextPage = function(){
      var ajax, this$ = this;
      if (this.busy) {
        return;
      }
      this.busy = true;
      if (this.isPageable) {
        this.searchRequest.page++;
      } else {
        this.searchRequest.offset += this.searchRequest.limit;
      }
      this._onBeforeRequest(this.searchRequest);
      ajax = this._viaQueryParams
        ? AjaxAction().get(this.targetName, this.searchRequest).withPathParams(this.pathParams)
        : !this._viaJson
          ? AjaxAction().post(this.targetName).withQueryParams(this.searchRequest)
          : AjaxAction().post(this.targetName, this.searchRequest);
      return ajax.done(function(data){
        var items, key$;
        this$.columns = data[this$.columnField];
        items = (data[key$ = this$.resultField] || (data[key$] = [])).map(function(it){
          return this$.sortByColumns(it);
        });
        if (!this$.isPageable && this$.searchRequest.offset === 0 && items.length === 0) {
          if (typeof this$.noResultsCallback == 'function') {
            this$.noResultsCallback(data);
          }
        } else if (this$.isPageable && this$.searchRequest.page === 0 && items.length === 0) {
          if (typeof this$.noResultsCallback == 'function') {
            this$.noResultsCallback(data);
          }
        }
        if (items.length === 0) {
          return this$.busy = true;
        }
        _.each(items, function(item){
          return this$.items.push(item);
        });
        return this$.busy = false;
      });
    };
    return InfiniteScroll;
  });
}).call(this);
