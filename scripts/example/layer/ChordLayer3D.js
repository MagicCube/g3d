$ns("example.layer");

$import("mx3d.util.ShaderMaterialBuilder");
$import("g3d.layer.FeatureLayer3D");

example.layer.ChordLayer3D = function()
{
    var me = $extend(g3d.layer.FeatureLayer3D);
    me.needsUpdate = true;
    var base = {};
    
    me.locations = [];
    
    me.data = [
       [ "s9", "s1", 1, 90 ],
       [ "s1", "s9", -1, 60 ],
       
       [ "s9", "s2", -1, 10 ],
       [ "s9", "s7", 1, 20 ],
       [ "s9", "s8", -1, 40 ],
       [ "s9", "s11", -1, 80 ],
       [ "s9", "s15", 1, 30 ],
       [ "s9", "s16", 1, 80 ],
       [ "s9", "s21", 1, 5 ],
       
       [ "s9", "s24", 1, 80 ],
       [ "s24", "s9",- 1, 20 ],
    ];

    base.init = me.init;
    me.init = function(p_options)
    {
        base.init(p_options);
        me.on("addedtomap", me.load);
    };
    
    me.load = function()
    {
        $.ajax({
            url: me.getResourcePath("data.locations", "json")
        }).done(function(p_locations)
        {
            me.locations = p_locations;
            me.locations.forEach(function(p_location)
            {
                p_location.center = me.scale.locationToVector3(p_location.lonLat);
                me.locations[p_location.id] = p_location;
            });
            
            _drawSubwayLine();
            _drawODChord();
            
            me.parentView.resetCamera(null, true);
        });
    };
    
    
    base.update = me.update;
    me.update = function()
    {
        base.update();

        _particleSystems.forEach(function(p_system)
        {
            p_system.geometry.verticesNeedUpdate = true;
            for (var i = 0; i < p_system.geometry.vertices.length; i++)
            {
                var v = p_system.geometry.vertices[i];
                var nextV = p_system.path[v.origin + p_system.frameIndex];
                if (nextV != null)
                {
                    v.copy(nextV);
                }
            }
            p_system.frameIndex++;
            if (p_system.frameIndex > p_system.frameCount)
            {
                p_system.frameIndex = 0;
            }
        });
    };
    
    
    
    
    
    
    function _drawSubwayLine()
    {
        var points = me.locations.map(function(p_location)
        {
            return p_location.center;
        });
        me.addLineString(points, { color: 0xffff00 });
    }
    
    function _drawODChord()
    {
        me.data.forEach(function(p_row)
        {
            _drawODLine(p_row[0], p_row[1], p_row[2], p_row[3]);
        });
    };
    
    
    var _particleSystems = [];
    var _particleMaterialBuilder = null;
    function _drawODLine(p_originId, p_destinationId, p_direction, p_amount)
    {
        var color = new THREE.Color(p_direction == 1 ? 0xff2211 : 0x2244ff);
        
        _drawLocationLabel(p_destinationId);
        var oLocation = me.locations[p_originId];
        var fromPoint = oLocation.center;
        var dLocation = me.locations[p_destinationId];
        var toPoint = dLocation.center;
        var centerPoint = fromPoint.clone().lerp(toPoint, 0.5);
        var distance = Math.abs(fromPoint.distanceTo(toPoint));
        centerPoint.z = distance / 5;
        var spline = new THREE.SplineCurve3([fromPoint, centerPoint, toPoint]);
        me.addSpline(spline, 60, { color: color });
        
        if (_particleMaterialBuilder == null)
        {
            _particleMaterialBuilder = new mx3d.util.ShaderMaterialBuilder({
                url : me.getResourcePath("materials.particle", "xml"),
                parameters : {
                    blending : THREE.AdditiveBlending,
                    depthTest : true,
                    depthWrite : false,
                    transparent : true
                }
            });
        }
            
        _particleMaterialBuilder.setUniformValue("u_color", color);
        _particleMaterialBuilder.setUniformValue("u_texture", THREE.ImageUtils.loadTexture(me.getResourcePath("materials.particle", "png")), "t");
        var domain = [1, 200];
        var splineSmooth = 20;
        var space = 10;
        var countScale = d3.scale.linear().domain(domain).range([2, splineSmooth]);
        var sizeScale = d3.scale.linear().domain(domain).range([10, 120]);
        
        var geometry = new THREE.Geometry();
        var path = spline.getPoints(splineSmooth * space);
        var count = countScale(p_amount);
        var delta = Math.floor((path.length - 1) / (count - 1));
        for (var i = 0; i < splineSmooth * space; i += delta)
        {
            var point = new THREE.Vector3();
            point.copy(path[i]);
            point.origin = i;
            geometry.vertices.add(point);
            _particleMaterialBuilder.setAttributeValue("a_size", sizeScale(p_amount));
        }
        var particleSystem = new THREE.ParticleSystem(geometry, _particleMaterialBuilder.build());
        particleSystem.path = path;
        particleSystem.dynamic = true;
        particleSystem.frameIndex = 0;
        particleSystem.frameCount = delta;
        me.addObject(particleSystem);
        _particleSystems.add(particleSystem);
    };
    
    function _drawLocationLabel(p_id)
    {
        var location = me.locations[p_id];
        var point = location.center;
        me.parentView.addLabelView({
            position: point,
            text: location.name + "站"
        });
    };

    return me.endOfClass(arguments);
};
example.layer.ChordLayer3D.className = "example.layer.ChordLayer3D";
