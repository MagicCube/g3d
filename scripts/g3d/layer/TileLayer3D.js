$ns("g3d.layer");

$import("g3d.layer.Layer3D");

g3d.layer.TileLayer3D = function()
{
    var me = $extend(g3d.layer.Layer3D);
    var base = {};

    me.zoomMin = 0;
    me.zoomMax = 0;
    
    me.useLocalStorage = false;

    me.mapProvider = null;
    me.zoomInfo = null;

    var _loaded = false;
    var _zooming = false;

    base.init = me.init;
    me.init = function(p_options)
    {
        base.init(p_options);
        me.on("addedtomap", _onaddedtomap);
        me.on("removedfrommap", _onremovedfrommap);
    };

    function _onaddedtomap()
    {
        if (!_loaded)
        {
            me.zoomMin = me.parentView.zoomMin;
            me.zoomMax = me.parentView.zoomMax;
            me.mapProvider = me.parentView.mapProvider;
            me.zoomInfo = me.parentView.zoomInfo;
            _loadZooms();
            _switchZoom(me.zoomMin, me.parentView.zoom);
            me.parentView.on("zooming", _mapScene3DView_onzooming);
            _loaded = true;
        }
    }

    function _onremovedfrommap()
    {
        if (_loaded)
        {
            me.parentView.off("zooming", _mapScene3DView_onzooming);
        }
    }

    function _mapScene3DView_onzooming(e)
    {
        if (_zooming)
        {
            e.cancel = true;
            return;
        }

        _switchZoom(e.zoomFrom, e.zoomTo);
    }

    function _loadZoom(p_zoom, p_cols, p_rows)
    {
        var zoomInfo = me.zoomInfo[p_zoom];
        var tileSize = zoomInfo.tileSize;

        var width = tileSize * p_cols * 2 + tileSize;
        var height = tileSize * p_rows * 2 + tileSize;
        var geometry = new THREE.PlaneGeometry(width, height);

        var material = _loadZoomMaterial(p_zoom, p_cols, p_rows);
        material.opacity = (p_zoom === me.zoomMin ? 1 : 0);

        var mesh = new THREE.Mesh(geometry, material);
        mesh.position = zoomInfo.centerPosition;
        zoomInfo.tileMesh = mesh;
        if (p_zoom === me.zoomMin)
        {
            me.addObject(zoomInfo.tileMesh);
        }
    }
    ;

    function _loadZooms()
    {
        for (var i = me.zoomMin; i <= me.zoomMax; i++)
        {
            if (i === me.zoomMin || i === me.zoomMax)
            {
                _loadZoom(i, 4, 4);
            }
            else
            {
                _loadZoom(i, 3, 3);
            }
        }
    }

    function _switchZoom(p_zoomFrom, p_zoomTo)
    {
        _zooming = true;

        console.log("Zooming from " + p_zoomFrom + " to " + p_zoomTo);

        var zoomIn = false;
        if (p_zoomFrom < p_zoomTo)
        {
            // 13 - 14
            zoomIn = true;
            zoomOut = false;
        }

        for (var i = me.zoomMin + 1; i <= me.zoomMax; i++)
        {
            if (i > p_zoomTo)
            {
                _hideTileMesh(i, (!zoomIn && i === p_zoomFrom), _hideOrShowTileMesh_callback);
            }
            else
            {
                _showTileMesh(i, (zoomIn && i === p_zoomTo), _hideOrShowTileMesh_callback);
            }
        }
    }

    function _hideOrShowTileMesh_callback()
    {
        _zooming = false;
    }

    function _calculateTileIndex(a, b, z)
    {
        var centerIndex = me.zoomInfo[z].centerIndex;
        var index = {
            x : centerIndex.x + a,
            y : centerIndex.y - b,
            z : z
        };
        return index;
    }

    function _showTileMesh(p_zoom, p_animation, p_callback)
    {
        var tileMesh = me.zoomInfo[p_zoom].tileMesh;
        me.addObject(tileMesh);
        if (p_animation && tileMesh.material.opacity !== 1)
        {
            var duration = 400;
            // 看不见
            new TWEEN.Tween(tileMesh.material).to({
                opacity : 1
            }, duration).onUpdate(function()
            {
                this.needsUpdate = true;
            }).onComplete(function()
            {
                if (isFunction(p_callback))
                {
                    p_callback();
                }
            }).start();
        }
        else
        {
            if (isFunction(p_callback))
            {
                p_callback();
            }
        }
    }

    function _hideTileMesh(p_zoom, p_animation, p_callback)
    {
        var tileMesh = me.zoomInfo[p_zoom].tileMesh;
        if (p_animation && tileMesh.material.opacity !== 0)
        {
            var duration = 400;
            // 看不见
            new TWEEN.Tween(tileMesh.material).to({
                opacity : 0
            }, duration).onUpdate(function()
            {
                this.needsUpdate = true;
            }).onComplete(function()
            {
                me.removeObject(tileMesh);
                if (isFunction(p_callback))
                {
                    p_callback();
                }
            }).start();
        }
        else
        {
            me.removeObject(tileMesh);
            if (isFunction(p_callback))
            {
                p_callback();
            }
        }
    }

    function _loadZoomMaterial(p_zoom, p_cols, p_rows)
    {
        var material = null;
        var key = _getKey(p_zoom, p_cols, p_rows);
        var cachedImage = me.useLocalStorage ? localStorage.getItem(key) : null;

        if (cachedImage == null)
        {
            var tileSize = me.mapProvider.tileSize;
            var canvas = document.createElement("canvas");
            var width = tileSize * p_cols * 2 + tileSize;
            var height = tileSize * p_rows * 2 + tileSize;
            canvas.width = width;
            canvas.height = height;

            var texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            material = new THREE.MeshBasicMaterial({
                map : texture,
                transparent : true
            });

            var canvasContext = canvas.getContext("2d");
            canvasContext.clearRect(0, 0, width, height);
            canvas.loading = 0;
            for (var b = -p_rows; b <= p_rows; b++)
            {
                for (var a = -p_cols; a <= p_cols; a++)
                {
                    var index = _calculateTileIndex(a, b, p_zoom);
                    canvas.loading++;
                    _loadTileImage(index, {
                        index : index,
                        a : a,
                        b : b
                    }, function(p_image, p_context)
                    {
                        canvasContext.drawImage(p_image, (p_context.a + p_cols) * tileSize, height - (p_context.b + p_rows + 1) * tileSize, tileSize, tileSize);
                        texture.needsUpdate = true;
                        canvas.loading--;
                        if (canvas.loading === 0 && me.useLocalStorage)
                        {
                            localStorage.setItem(key, canvas.toDataURL("image/jpeg"));
                            console.log("Saved tiles to cache. " + key);
                        }
                    });
                }
            }
        }
        else
        {
            material = new THREE.MeshBasicMaterial({
                map : THREE.ImageUtils.loadTexture(cachedImage),
                transparent : true
            });
            console.log("Load tiles from cache. " + key);
        }

        return material;
    }

    function _loadImage(p_url, p_context, p_callback)
    {
        var image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = function(e)
        {
            image.onload = null;
            if (isFunction(p_callback))
            {
                p_callback(image, p_context);
            }
        };
        image.src = p_url;
    }

    function _loadTileImage(p_index, p_context, p_callback)
    {
        var url = me.mapProvider.getTileUrl(p_index);
        return _loadImage(url, p_context, p_callback);
    }

    function _getKey(p_zoom, p_cols, p_rows)
    {
        return $format("{url:{0}, zoom:{1}, cols:{2}, rows:{3}}", [me.mapProvider.urlFormat, p_zoom, p_cols, p_rows]);
    }

    return me.endOfClass(arguments);
};
g3d.layer.TileLayer3D.className = "g3d.layer.TileLayer3D";
