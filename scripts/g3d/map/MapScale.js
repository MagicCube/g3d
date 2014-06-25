$ns("g3d.map");

g3d.map.MapScale = function()
{
    var me = $extend(MXObject);
    var base = {};

    me.centerLocation = {
        lon : 0,
        lat : 0
    };

    me.zoomMin = 0;
    me.zoomMax = 0;
    me.zoomInfo = null;
    me.mapProvider = null;

    base._ = me._;
    me._ = function(p_options)
    {
        if (me.canConstruct())
        {
            base._(p_options);
        }
    };

    me.locationToPoint = function(p_location)
    {
        var location = g3d.util.GeoJSONUtil.normalizeLocation(p_location);
        if (location != null)
        {
            var centerIndex = me.zoomInfo[me.zoomMax].centerIndex;
            var centerPosition = me.zoomInfo[me.zoomMax].centerPosition;
            var indexFloat = me.mapProvider.getTileIndex(location, me.zoomMax, true);
            return {
                x : centerPosition.x + (indexFloat.x - centerIndex.x) * me.mapProvider.tileSize - me.mapProvider.tileSize / 2,
                y : centerPosition.y - (indexFloat.y - centerIndex.y) * me.mapProvider.tileSize + me.mapProvider.tileSize / 2
            };
        }
        return null;
    };

    me.locationsToPoints = function(p_locations)
    {
        var results = p_locations.map(function(p_location)
        {
            return me.locationToPoint(p_location);
        });
        return results;
    };

    me.locationToVector3 = function(p_location)
    {
        var location = g3d.util.GeoJSONUtil.normalizeLocation(p_location);
        if (location != null)
        {
            var p = me.locationToPoint(p_location);
            var vector3 = new THREE.Vector3(p.x, p.y, 0);
            return vector3;
        }
        return null;
    };

    me.locationsToPath = function(p_locations)
    {
        var results = p_locations.map(function(p_location)
        {
            return me.locationToVector3(p_location);
        });
        return results;
    };

    me.locationsToLine = function(p_locations)
    {
        var points = me.locationsToPath(p_locations);
        var geometry = new THREE.Geometry();
        geometry.vertices.addAll(points);
        var line = new THREE.Line(geometry);
        return line;
    };

    me.locationsToSplinePath = function(p_locations, p_count)
    {
        var points = me.locationsToPath(p_locations);
        var splineCurve3 = new THREE.SplineCurve3(points);
        points = splineCurve3.getPoints(p_count);
        return points;
    };

    me.locationsToSpline = function(p_locations, p_count)
    {
        var points = me.locationsToSplinePath(p_locations, p_count);

        var geometry = new THREE.Geometry();
        geometry.vertices.addAll(points);
        var line = new THREE.Line(geometry);
        return line;
    };

    return me.endOfClass(arguments);
};
g3d.map.MapScale.className = "g3d.map.MapScale";
