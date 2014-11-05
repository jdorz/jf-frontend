(function(){
  angular.module('jf').factory('InfiniteScroll', function(AjaxAction){
    var InfiniteScroll;
    InfiniteScroll = function(targetName, limit, resultField, columnField){
      resultField || (resultField = "results");
      columnField || (columnField = "columns");
      this.targetName = targetName;
      this.limit = limit;
      this.resultField = resultField;
      this.columnField = columnField;
      this.searchRequest = {};
      return this.reset();
    };
    InfiniteScroll.prototype.viaQueryParams = function(){
      this._viaQueryParams = true;
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
      this.searchRequest.offset = -this.limit;
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
      this.searchRequest.offset += this.searchRequest.limit;
      ajax = this._viaQueryParams
        ? AjaxAction().get(this.targetName, this.searchRequest)
        : AjaxAction().post(this.targetName).withQueryParams(this.searchRequest);
      return ajax.done(function(data){
        var items, key$;
        this$.columns = data[this$.columnField];
        items = (data[key$ = this$.resultField] || (data[key$] = [])).map(function(it){
          return this$.sortByColumns(it);
        });
        if (this$.searchRequest.offset === 0 && items.length === 0) {
          if (typeof this$.noResultsCallback == 'function') {
            this$.noResultsCallback();
          }
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