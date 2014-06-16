$ns("g3d.view");

$import("mx3d.view.AnimatedScene3DView");

$import("g3d.util.GeoJSONUtil");
$import("g3d.layer.FeatureLayer3D");
$import("g3d.layer.TileLayer3D");
$import("g3d.map.MapScale");
$import("g3d.map.MapProvider");
$import("g3d.view.ToolBarView");

$include("g3d.res.MapScene3DView.css");

g3d.view.MapScene3DView = function()
{
    var me = $extend(mx3d.view.AnimatedScene3DView);
    me.cameraParams = {
        fov : 60,
        near : 100,
        far : 1000000,
        position : {}
    };
    me.cameraControlsEnabled = true;
    me.statsVisible = false;
    var base = {};

    me.centerLocation = {
        lon : 0,
        lat : 0
    };
    me.zoom = 12;
    me.zoomMin = 11; // 最远
    me.zoomMax = 15; // 最近

    me.displayCompass = true;

    me.landMesh = null; // 为了兼容性，暂时保留
    me.layers = [];
    me.materials = {};

    me.mapProvider = null;
    me.scale = null;
    me.geoJSONUtil = null;
    me.zoomInfo = [];

    me.displayToolBar = true;
    me.toolBarView = null;
    me.toolButtons = [{
        id : "anaglyph",
        autoCheck : true
    }, {
        id : "rotate",
        autoCheck : true
    }, {
        id : "view",
        autoCheck : true
    }, {
        id : "zoomIn"
    }, {
        id : "zoomOut"
    }];

    me.onzooming = null;
    me.onzoomed = null;

    var _$compass = null;

    base.init = me.init;
    me.init = function(p_options)
    {
        me.initMapProvider();

        base.init(p_options);
        me.$element.addClass("MapScene3DView");

        me.setCenterLocation(me.centerLocation);
        me.initScale();
        me.initMaterials();

        if (me.displayCompass)
        {
            me.initCompass();
        }
        if (me.displayToolBar)
        {
            me.initToolBarView();
        }

        me.landMesh = new THREE.Object3D();
        me.addObject(me.landMesh);

        me.initLayers();
    };

    me.setCenterLocation = function(p_location)
    {
        me.centerLocation = g3d.util.GeoJSONUtil.normalizeLocation(p_location);
        me.initZoomInfo();
    };

    base.initScene = me.initScene;
    me.initScene = function()
    {
        base.initScene();
        var fogWeight = Math.pow((20 - me.zoomMax), 2) / 2;
        me.scene.fog = new THREE.FogExp2(0x000000, fogWeight / 100000);
    };

    base.initCamera = me.initCamera;
    me.initCamera = function()
    {
        if (me.cameraParams.position == null || me.cameraParams.position.z == null)
        {
            me.cameraParams.position.z = _calculateCameraZ(me.zoom);
        }
        else
        {
            if (me.cameraParams.position.z != null)
            {
                me.zoom = _calculateZoom(me.cameraParams.position.z);
            }
        }
        base.initCamera();
    };

    me.initCameraControls = function()
    {
        if (me.cameraControlsEnabled && me.cameraControls == null)
        {
            me.cameraControls = new THREE.TrackballControls(me.camera, me.$element.find("canvas")[0]);
            me.cameraControls.minDistance = _calculateCameraZ(me.zoomMax) / 1.2;
            me.cameraControls.maxDistance = _calculateCameraZ(me.zoomMin) * 1.2;
        }
    };

    me.initCompass = function()
    {
        _$compass = $("<img id=compass src='" + mx.getResourcePath("g3d.res.images.compass", "png") + "'>");
        me.$container.append(_$compass);
        _$compass.on("click", function()
        {
            me.resetCamera();
        });
    };

    me.initToolBarView = function()
    {
        me.toolBarView = new g3d.view.ToolBarView({
            elementStyle : {
                position : "absolute"
            },
            id : "toolBar",
            buttons : me.toolButtons
        });
        me.addSubview(me.toolBarView);

        me.toolBarView.setFrame({
            left : 0,
            top : (window.innerHeight - me.toolButtons.length * 48) / 2
        });

        me.toolBarView.on("buttonclick", me.ontoolbuttonclick);
    };

    me.initMaterials = function()
    {

    };

    me.ontoolbuttonclick = function(e)
    {
        switch (e.id)
        {
            case "anaglyph":
                me.anaglyphEffectEnabled = e.button.checked;
                break;
            case "rotate":
                me.cameraControls.controlMode = e.button.checked ? "rotate" : "auto";
                break;
            case "view":
                me.resetCamera(null, e.button.checked);
                break;
            case "zoomIn":
                me.zoomIn();
                break;
            case "zoomOut":
                me.zoomOut();
                break;
            default:
                break;
        }
    };

    me.initMapProvider = function()
    {
        me.mapProvider = new g3d.map.MapProvider();
    };

    me.initZoomInfo = function()
    {
        for (var z = me.zoomMax; z >= me.zoomMin; z--)
        {
            var pos = null;
            if (z === me.zoomMax)
            {
                var centerIndexFloat = me.mapProvider.getTileIndex(me.centerLocation, me.zoomMax, true);
                var offset = {
                    x : centerIndexFloat.x - Math.floor(centerIndexFloat.x),
                    y : centerIndexFloat.y - Math.floor(centerIndexFloat.y)
                };
                pos = {
                    x : -(offset.x - 0.5) * me.mapProvider.tileSize,
                    y : (offset.y - 0.5) * me.mapProvider.tileSize,
                    z : -0.5
                };
            }
            else
            {
                var centerIndex = me.zoomInfo[z + 1].centerIndex;
                var offsetX = centerIndex.x % 2;
                var offsetY = centerIndex.y % 2;
                pos = {
                    x : me.zoomInfo[z + 1].centerPosition.x + (offsetX === 0 ? 1 : -1) * me.zoomInfo[z + 1].tileSize / 2,
                    y : me.zoomInfo[z + 1].centerPosition.y + (offsetY === 0 ? -1 : 1) * me.zoomInfo[z + 1].tileSize / 2,
                    z : (z - me.zoomMax) + me.zoomInfo[me.zoomMax].centerPosition.z
                };
            }
            var info = {
                zoom : z,
                centerIndex : me.mapProvider.getTileIndex(me.centerLocation, z),
                centerPosition : pos,
                tileSize : _calculateTileSize(z),
                cameraZ : _calculateCameraZ(z)
            };
            me.zoomInfo[z] = info;
        }
    };

    me.initScale = function()
    {
        me.scale = new g3d.map.MapScale({
            mapProvider : me.mapProvider,
            zoomInfo : me.zoomInfo,
            zoomMin : me.zoomMin,
            zoomMax : me.zoomMax
        });
        me.geoJSONUtil = new g3d.util.GeoJSONUtil({
            scale : me.scale
        });
    };

    me.initLayers = function()
    {
        if (me.layers.length > 0)
        {
            var layers = me.layers.clone();
            me.layers.clear();

            layers.forEach(function(p_layer)
            {
                me.addLayer(p_layer);
            });
        }
    };

    base.update = me.update;
    me.update = function(p_forceUpdate)
    {
        base.update(p_forceUpdate);
        if (me.camera != null)
        {
            me.updateZooming(p_forceUpdate);
            me.updateLayers(p_forceUpdate);
            me.updateCompass(p_forceUpdate);
        }
    };

    me.updateZooming = function(p_forceUpdate)
    {
        var zoomTo = _calculateZoom(me.camera.position.z);
        if (zoomTo !== me.zoom)
        {
            var zoomFrom = me.zoom;
            var args = {
                zoomFrom : zoomFrom,
                zoomTo : zoomTo,
                cancel : false
            };
            me.trigger("zooming", args);
            if (args.cancel)
            {
                return;
            }
            me.zoom = zoomTo;
            me.trigger("zoomed", {
                zoomFrom : zoomFrom,
                zoomTo : zoomTo
            });
        }
    };

    me.updateLayers = function(p_forceUpdate)
    {
        me.layers.forEach(function(p_layer)
        {
            if (p_layer.needsUpdate)
            {
                p_layer.update(p_forceUpdate);
            }
        });
    };

    me.updateCompass = function(p_forceUpdate)
    {
        if (_$compass != null)
        {
            var degree = Math.round(me.camera.rotation.z * 180 / Math.PI);
            _$compass.css("webkitTransform", "rotate(" + degree + "deg)");
        }
    };

    me.setZoom = function(p_zoom, p_animation)
    {
        var zoom = p_zoom;
        if (zoom > me.zoomMax)
        {
            zoom = me.zoomMax;
        }
        else if (zoom < me.zoomMin)
        {
            zoom = me.zoomMin;
        }

        if (p_animation === false)
        {
            me.camera.position.z = _calculateCameraZ(zoom);
        }
        else
        {
            var position = {
                x : 0,
                y : 0,
                z : _calculateCameraZ(zoom)
            };
            var rotation = {
                x : 0,
                y : 0,
                z : 0
            };
            me.moveCamera(position, rotation, 500);
        }
    };

    me.zoomIn = function(p_delta)
    {
        var delta = 1;
        if (p_delta != null)
        {
            delta = Math.abs(p_delta);
        }
        var zoom = me.zoom + delta;
        me.setZoom(zoom);

        if (me.toolBarView != null)
        {
            me.toolBarView.setButtonCheckState("view", false);
        }
    };

    me.zoomOut = function(p_delta)
    {
        var delta = 1;
        if (p_delta != null)
        {
            delta = Math.abs(p_delta);
        }
        var zoom = me.zoom - delta;
        me.setZoom(zoom);

        if (me.toolBarView != null)
        {
            me.toolBarView.setButtonCheckState("view", false);
        }
    };

    me.addLayer = function(p_layer)
    {
        if (!$instanceof(p_layer, g3d.layer.Layer3D))
        {
            throw new Error("p_layer must be an instance of g3d.view.Layer3D");
        }
        me.layers.add(p_layer);
        if (p_layer.id != null)
        {
            me.layers[p_layer.id] = p_layer;
        }

        var parentObject3D = me.landMesh;
        parentObject3D.add(p_layer.object3D);

        $.extend(p_layer, {
            parentView : me,
            parentObject3D : parentObject3D,
            scale : me.scale,
            geoJSONUtil : me.geoJSONUtil
        });

        p_layer.trigger("addedtomap");
    };

    me.removeLayer = function(p_layer)
    {
        if (!$instanceof(p_layer, g3d.layer.Layer3D))
        {
            throw new Error("p_layer must be an instance of g3d.view.Layer3D");
        }

        me.layers.remove(p_layer);
        if (p_layer.id != null)
        {
            delete me.layers[p_layer.id];
        }

        var parentObject3D = me.landMesh;
        parentObject3D.remove(p_layer.object3D);

        p_layer.trigger("removedfrommap");
    };

    me.resetCamera = function(p_duration, p_perspective)
    {
        if (me.cameraControls != null)
        {
            var position = null;
            var rotation = null;
            var duration = p_duration != null ? p_duration : 2000;

            if (!p_perspective)
            {
                var params = me.cameraParams;
                position = {
                    x : 0,
                    y : 0,
                    z : 0
                };
                rotation = {
                    x : 0,
                    y : 0,
                    z : 0
                };
                if (isArray(params.position))
                {
                    position.x = params.position[0];
                    position.y = params.position[1];
                    position.z = params.position[2];
                }
                else
                {
                    position = $.extend(position, params.position);
                }
            }
            else
            {
                position = {
                    x : -50.9760365348891,
                    y : -1750.5946134789813,
                    z : 2470.697634926914
                };
                rotation = {
                    x : 0.6164362891923738,
                    y : -0.01683316387367657,
                    z : 0.01192588582967832
                };
            }
            if (me.toolBarView != null)
            {
                me.toolBarView.setButtonCheckState("view", p_perspective === true);
            }
            return me.moveCamera(position, rotation, duration);
        }
        return null;
    };

    function _calculateCameraZ(p_zoom)
    {
        var zoom = p_zoom;
        if (p_zoom < me.zoomMin)
        {
            zoom = me.zoomMin;
        }
        else if (p_zoom > me.zoomMax)
        {
            zoom = me.zoomMax;
        }
        else
        {
            zoom = p_zoom;
        }
        return Math.pow(2, me.zoomMax - zoom + 1) * me.mapProvider.tileSize;
    }

    function _calculateZoom(p_z)
    {
        for (var i = me.zoomMin; i < me.zoomMax; i++)
        {
            if (p_z >= me.zoomInfo[i].cameraZ)
            {
                return i;
            }
        }
        return me.zoomMax;
    }

    function _calculateTileSize(p_zoom)
    {
        return Math.pow(2, me.zoomMax - p_zoom) * me.mapProvider.tileSize;
    }

    return me.endOfClass(arguments);
};
g3d.view.MapScene3DView.className = "g3d.view.MapScene3DView";
