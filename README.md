# MagicCube g3d Framework
MagicCube g3D Framework is a web GIS library for 3D visualization using WebGL technology.

# MagicCube MXFramework
The g3d Framework is based on [MagicCube MXFramework](https://github.com/MagicCube/mxframework-core) and MagicCube mx3d Framework.

# Usage
```javascript
$import("g3d.view.MapScene3DView");

var mapView = null;
mx.whenReady(function()
{
    // Create a new MapProvider using MapBox tiles.
    var mapProvider = new g3d.map.MapProvider({
        urlFormat: "http://{s}.tiles.mapbox.com/v3/xy.ie03oo2j/{z}/{x}/{y}.png32",
        tileSize: 256,    // Normally the tile size is always 256 in OSM and Google
    });
    
    
    // Create an instance of MapScene3DView
    mapView = new g3d.view.MapScene3DView({
        $element: $("#map"),
        mapProvider: mapProvider,
        centerLocation: [118.778845, 32.04386],
        zoom: 12,                // The same 'zoom level' rules as Google Map.
        statsVisible: true,      // Whether display the WebGL status bar.
        displayCompass: true,    // Whether the compass should be displayed.
        displayToolBar: true,    // Whether the tool bar should be displayed.
        onzooming: function(e)
        {
            console.log("Zooming from %d to %d.", e.zoomFrom, e.zoomTo);
        },
        onzoomed: function(e)
        {
            console.log("Zoom level is now set to %d.", e.zoomTo);
        }
    });

    // Add a OSM-based tile layer.
    var tileLayer = new g3d.layer.TileLayer3D({
        useLocalStorage: true     // Use HTML5 Local Storage to cache the tiles.
    });
    mapView.addLayer(tileLayer);
    
    // Start animation, so the user can interactive with the map.
    mapView.startAnimation();
});
```
