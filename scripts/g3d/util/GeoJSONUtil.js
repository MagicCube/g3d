$ns("g3d.util");

g3d.util.GeoJSONUtil = function()
{
    var me = $extend(MXObject);
    var base = {};

    me.scale = null;

    base._ = me._;
    me._ = function(p_options)
    {
        if (me.canConstruct())
        {
            base._(p_options);

            if (!$instanceof(me.scale, g3d.map.MapScale))
            {
                throw new Error("constructor param 'scale' must be an instance of g3d.map.MapScale.");
            }
        }
    };

    me.parse = function(p_json)
    {
        if (p_json.type === "FeatureCollection")
        {
            return me.createFromFeatureCollection(p_json);
        }
        else if (p_json.type === "Feature")
        {
            return me.createFromFeature(p_json);
        }
        else if (p_json.type === "LineString" || p_json.type === "Polygon")
        {
            return me.createFromGeometry(p_json);
        }
        else
        {
            throw new Error("GeoJSON type '" + p_json.type + "' has not been supported yet.");
        }
    };

    me.createFromFeatureCollection = function(p_featureCollection)
    {
        if (p_featureCollection.type !== "FeatureCollection")
        {
            throw new Error("The type of p_featureCollection must be FeatureCollection.");
        }
        var shapes = [];
        var features = p_featureCollection.features;

        features.forEach(function(p_feature)
        {
            var shape = me.createFromFeature(p_feature);
            if (shape != null)
            {
                shapes.add(shape);
            }
        });
        return shapes;
    };

    me.createFromFeature = function(p_feature)
    {
        if (p_feature.type !== "Feature")
        {
            throw new Error("The type of p_feature must be Feature.");
        }
        var shape = me.createFromGeometry(p_feature.geometry);
        return shape;
    };

    me.createFromGeometry = function(p_geometry)
    {
        if (p_geometry.type !== "LineString" && p_geometry.type !== "Polygon")
        {
            throw new Error("The type of p_geometry must be LineString or Polygon.");
        }

        var result = null;

        if (p_geometry.type === "Polygon")
        {
            result = me.createShapeFromCoordinates(p_geometry.coordinates);
        }
        else if (p_geometry.type === "LineString")
        {
            result = me.createLineFromCoordinates(p_geometry.coordinates);
        }
        return result;
    };

    me.createLineFromCoordinates = function(p_coordinates)
    {
        var geometry = null;

        var points = me.scale.locationsToPoints(p_coordinates);

        if (points.length > 1)
        {
            geometry = new THREE.Geometry();
            points.forEach(function(p_point)
            {
                geometry.vertices.add(new THREE.Vector3(p_point.x, p_point.y, 0));
            });
        }

        return geometry;
    };

    me.createShapeFromCoordinates = function(p_coordinates)
    {
        var shape = null;

        var points = me.scale.locationsToPoints(p_coordinates[0]);

        if (points.length > 2)
        {
            shape = new THREE.Shape(points);
            if (shape.curves.length > 1)
            {
                return shape;
            }
            else
            {
                return null;
            }
        }
        else
        {
            return null;
        }
    };

    return me.endOfClass(arguments);
};
g3d.util.GeoJSONUtil.className = "g3d.util.GeoJSONUtil";

g3d.util.GeoJSONUtil.normalizeLocation = function(p_location)
{
    if (isArray(p_location))
    {
        return {
            lon : p_location[0],
            lat : p_location[1]
        };
    }
    else if (isPlainObject(p_location))
    {
        if (p_location.lon != null && p_location.lat != null)
        {
            return p_location;
        }
        else if (p_location.lng != null && p_location.lat != null)
        {
            return {
                lon : p_location.lng,
                lat : p_location.lat
            };
        }
    }
};
