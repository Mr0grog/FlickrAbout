document.addEventListener("DOMContentLoaded", function() {
  // config
  flickrAbout.API_KEY = "1b62c2260cbfac785aede9c3ab902af5";
  flickrAbout.PREFERRED_WIDTH = screen.width;
  
  window.doSearch = function() {
    var searchTerm = document.getElementById("search-field").value,
        woeId = document.getElementById("search-in-field").value;
    
    var handler = function (info) {
      handleFindResults(info, {term: searchTerm, woeId: woeId});
    };
    
    if (woeId === "[nearby]") {
      navigator.geolocation.getCurrentPosition(function(position) {
        flickrAbout.find(searchTerm, handler, {location: [position.coords.latitude, position.coords.longitude]});
      });
    }
    else {
      flickrAbout.find(searchTerm, handler, {woe_id: woeId});
    }
  };
  
  var setLoaderVisible = function(visible) {
    if (visible) {
      document.getElementById("loader").style.display = "inline";
      document.getElementById("search-button").style.display = "none";
    }
    else {
      document.getElementById("loader").style.display = "none";
      document.getElementById("search-button").style.display = "";
    }
  }
  
  var handleFindResults = function(info, search) {
    if (info == null) {
      setLoaderVisible(false);
      alert("No matching photos were found :(");
      return;
    }
    
    var figure = document.getElementById("found-image"),
        img = figure.getElementsByTagName("img")[0],
        caption = figure.getElementsByTagName("figcaption")[0];
    
    var showImage = function () {
      var profileUrl = "http://www.flickr.com/people/" + info.username + "/";
      caption.innerHTML = "<a href=\"" + info.flickrPage + "\">Photo</a> by <a href=\"" + profileUrl + "\">" + info.owner + "</a> on Flickr";
      img.src = info.source;

      img.style.display = "none";
      figure.style.backgroundImage = "url(" + info.source + ")";
      if (info.width > info.height) {
        img.style.height = "100%";
        img.style.width = "";
      }
      else {
        img.style.height = "";
        img.style.width = "100%";
      }
      
      setLoaderVisible(false);

      // update location
      window.location = window.location.href.match(/^[^?#]*/)[0] + "#" + 
        encodeURIComponent(search.term) + "/" + 
        encodeURIComponent(search.woeId) + "/" + 
        encodeURIComponent(info.id);
    };
    
    var loader = new Image();
    loader.src = info.source;
    if (loader.complete) {
      showImage();
    }
    else {
      loader.addEventListener("load", showImage, false);
    }
  };
  
  // actual event
  var form = document.getElementById("search-form");
  form.addEventListener("submit", function(event) {
    event.preventDefault();
    doSearch();
    setLoaderVisible(true);
  }, false);
  
  // geo support
  if (navigator.geolocation) {
    // add option
    var option = document.createElement("option");
    option.value = "[nearby]";
    option.appendChild(document.createTextNode("Near you!"));
    document.getElementById("search-in-field").appendChild(option);
  }
  
  // initial criteria
  var hashParts = window.location.hash.slice(1).split("/");
  if (window.location.hash && hashParts[0]) {
    document.getElementById("search-field").value = decodeURIComponent(hashParts[0]);
    document.getElementById("search-in-field").value = decodeURIComponent(hashParts[1]) || "";
  }
  
  // start off with something
  if (hashParts[2]) {
    flickrAbout.getPhoto(decodeURIComponent(hashParts[2]), function(info) {
      handleFindResults(info, {term: decodeURIComponent(hashParts[0]), woeId: decodeURIComponent(hashParts[1]) || ""});
    });
  }
  else {
    doSearch();
  }
}, false);