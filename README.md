FlickrAbout
===========

A simple JS library (and fun doodle) that helps you find random images on 
Flickr that are shareable, with a given subject matter and, optionally a
geographic location to search within.

Check out the demo at [http://mr0grog.github.com/FlickrAbout/demo/](http://mr0grog.github.com/FlickrAbout/demo/) to see
it in action.

**How to use:**

```
flickrAbout.API_KEY = "XXX"; // Your Flickr API key here

flickrAbout.find("Graffiti", 
                 function (imageInfo) {
                   // do something with the found image!
                   
                   /* imageInfo looks like:
                   {
                     "id":"752948070",
                     "source":"http://staticflickr.com/XXX.jpg",
                     "width":"3554",
                     "height":"2636",
                     "owner":"John Doe",
                     "realname":"John Doe",
                     "username":"JDoe",
                     "flickrPage":"http://www.flickr.com/XXX"
                   }
                   */
                 });

// or with a location:
flickrAbout.find("Graffiti", 
                 function (imageInfo) {
                   // do something with the found image!
                 },
                 {woe_id: woeId}); // Use WOE IDs to demarcate places

```