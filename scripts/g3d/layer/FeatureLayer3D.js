$ns("g3d.layer");

$import("g3d.layer.Layer3D");

g3d.layer.FeatureLayer3D = function()
{
    var me = $extend(g3d.layer.Layer3D);
    var base = {};

    me.color = 0xffffff;

    base.init = me.init;
    me.init = function(p_options)
    {
        base.init(p_options);
    };

    me.addCircle = function(p_coordinate, p_radius, p_material)
    {
        if (!isNumber(p_radius))
        {
            throw new Error("p_radius must be a number.");
        }

        var geometry = new THREE.CircleGeometry(p_radius ? p_radius : 2);

        var material = me.translateMaterial(p_material, THREE.MeshBasicMaterial);
        var mesh = new THREE.Mesh(geometry, material);
        var position = me.translatePoint(p_coordinate);
        mesh.position.copy(position);
        me.addObject(mesh);
        return mesh;
    };

    me.addPolygon = function(p_coordinates, p_height, p_material)
    {
        if (!isNumber(p_height))
        {
            throw new Error("p_height must be a number.");
        }

        var height = p_height ? p_height : 1;
        var points = me.translatePoints(p_coordinates);
        var shape = null;
        if (points.length > 2)
        {
            shape = new THREE.Shape(points);
            if (shape.curves.length <= 1)
            {
                return null;
            }
        }
        else
        {
            return null;
        }
        var geometry = new THREE.ExtrudeGeometry(shape, {
            bevelEnabled : false,
            amount : height
        });

        var material = me.translateMaterial(p_material, THREE.MeshBasicMaterial);
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.z = -height / 2;
        me.addObject(mesh);
        return mesh;
    };

    me.addLineString = function(p_coordinates, p_material)
    {
        var lineGeometry = new THREE.Geometry();
        var vertices = me.translatePoints(p_coordinates);
        lineGeometry.vertices.addAll(vertices);

        var material = me.translateMaterial(p_material, THREE.LineBasicMaterial);
        var line = new THREE.Line(lineGeometry, material);
        me.addObject(line);
        return line;
    };

    me.addPolyline = function(p_coordinates, p_material)
    {
        var coordinates = p_coordinates.clone();
        coordinates.add(p_coordinates[0]);
        return me.addLineString(coordinates, p_material);
    };

    me.translatePoint = function(p_coordinate)
    {
        var isCoordinateNumber = isNumber(p_coordinate.lon) && isNumber(p_coordinate.Lat);
        var isCoordinateArray = isArray(p_coordinate) && p_coordinate.length === 2;
        var isCoordinatesNumber = isNumber(p_coordinate[0]) && isNumber(p_coordinate[1]);

        if (isNumber(p_coordinate.x) && isNumber(p_coordinate.y))
        {
            if (p_coordinate.z == null)
            {
                p_coordinate.z = 0;
            }
            if (isPlainObject(p_coordinate) || p_coordinate.constructor === THREE.Vector2)
            {
                return new THREE.Vector3(p_coordinate.x, p_coordinate.y, p_coordinate.z);
            }
            else
            {
                return p_coordinate;
            }
        }
        else if (isCoordinateNumber || isCoordinateArray && isCoordinatesNumber)
        {
            var v = me.scale.locationToVector3(p_coordinate);
            return v;
        }
        else
        {
            throw new Error(p_coordinate + " is not a validate format of coordinate. A coordinate could be a LonLat, Vector2 or Vector3.");
        }
    };

    me.translatePoints = function(p_coordinates)
    {
        return p_coordinates.map(function(p_coordinate)
        {
            return me.translatePoint(p_coordinate);
        });
    };

    me.translateMaterial = function(p_material, p_materialClass, p_defaultParams)
    {
        var material = null;
        if (p_material != null)
        {
            if (isPlainObject(p_material))
            {
                var defaultParams = $.extend({
                    color : me.color
                }, p_defaultParams);
                var materialParams = $.extend(defaultParams, p_material);
                material = new p_materialClass(materialParams);
            }
            else if (isObject(p_material))
            {
                material = p_material;
            }
            else
            {
                throw new Error("p_material '" + p_material + "' can not be translated into Material.");
            }
        }
        return material;
    };

    return me.endOfClass(arguments);
};
g3d.layer.FeatureLayer3D.className = "g3d.layer.FeatureLayer3D";
