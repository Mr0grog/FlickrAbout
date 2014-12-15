var flickrAbout = {
  // Feel free to set these
  API_KEY: "[no key]",
  PREFERRED_WIDTH: 1000,
  
  // but not these
  BASE_URL: "https://api.flickr.com/services/rest/?",
  
  _searchCache: {},
  _imageInfo: {},
  
  find: function (term, callback, options) {
    // basic params for a search
    var search = {
      method: "flickr.photos.search",
      text: term,
      content_type: 1,
      license: "1,2,3,4,5,6,7,8"
    };
    
    // add any location bits
    var locationKey = "";
    if (options.woe_id) {
      search.woe_id = options.woe_id;
      locationKey = options.woe_id;
    }
    else if (options.location) {
      search.lat = options.location[0];
      search.lon = options.location[1];
      search.radius = options.radius || 25;
      locationKey = options.location.join(",");
    }
    
    // pull from cache or make the request
    var cacheKey = term + ":" + locationKey;
    if (this._searchCache[cacheKey]) {
      this._handleSearchResults(this._searchCache[cacheKey], search, callback);
    }
    else {
      this.makeRequest(search, function (data) {
        var photos = data.photos.photo;
        this._searchCache[cacheKey] = photos;
        this._handleSearchResults(photos, search, callback);
      });
    }
  },
  
  getPhoto: function (id, callback) {
    if (this._imageInfo[id]) {
      this._checkDone(this._imageInfo[id], callback);
    }
    else {
      this._imageInfo[id] = {id: id};
      this.makeRequest({
        method: "flickr.photos.getinfo",
        photo_id: id
      }, this._getInfoCallback(id, callback));
      this.makeRequest({
        method: "flickr.photos.getsizes",
        photo_id: id
      }, this._getSizesCallback(id, callback));
    }
  },
  
  makeRequest: function (params, callback) {
    params.api_key = this.API_KEY;
    params.format = "json";
    this.jsonp.request(this.BASE_URL, params, callback, this);
  },
  
  _getInfoCallback: function (photoId, callback) {
    return function (data) {
      console.log("Info: ", data);
      var info = this._imageInfo[data.photo.id];
      info._infoComplete = true;
      info.owner = data.photo.owner.realname || data.photo.owner.username;
      info.realname = data.photo.owner.realname;
      info.username = data.photo.owner.username;
      info.flickrPage = data.photo.urls.url[0]._content;
      this._checkDone(info, callback);
    };
  },
  
  _getSizesCallback: function (photoId, callback) {
    return function (data) {
      console.log("Sizes: ", data);
      var info = this._imageInfo[photoId];
      info._sizesComplete = true;
      var sizes = data.sizes.size;
      var match = sizes[sizes.length - 1];
      for (var i = 0; i < sizes.length; i++) {
        if (sizes[i].width >= this.PREFERRED_WIDTH) {
          match = sizes[i];
          break;
        }
      }

      info.source = match.source;
      info.width = match.width;
      info.height = match.height;
      this._checkDone(info, callback);
    };
  },
  
  _checkDone: function (info, callback) {
    if (info._infoComplete && info._sizesComplete && callback) {
      callback.call(null, info);
    }
  },
  
  _handleSearchResults: function (photos, search, callback) {
    // bail if there were no results
    if (!photos.length) {
      callback && callback.call(null, null);
      return;
    }
    // pick one from the list randomly
    var index = Math.floor(Math.random() * photos.length);
    var id = photos[index].id;
    this.getPhoto(id, callback);
  },
  
  jsonp: {
    CALL_PATH: "flickrAbout.jsonp.",
    
    requestId: 0,
    
    request: function (url, params, callback, context) {
      var callbackKey = "jsoncallback";
      params = params || {};
      var callbackId = "callback" + this.requestId;
      this.requestId++;
      params[callbackKey] = this.CALL_PATH + callbackId;
      
      this[callbackId] = function (data) {
        delete this[callbackId];
        script.parentNode.removeChild(script);
        callback.apply(context, arguments);
      };
      
      var urlParts = [];
      for (var key in params) {
        urlParts.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
      }
      if (!~url.indexOf("?")) {
        url += "?";
      }
      url += urlParts.join("&");

      var script = document.createElement("script");
      script.setAttribute("type", "text/javascript");
      script.setAttribute("src", url);
      document.body.appendChild(script);
    }
  }
};
