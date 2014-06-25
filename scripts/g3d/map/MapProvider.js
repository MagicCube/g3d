$ns("g3d.map");

g3d.map.MapProvider = function()
{
    var me = $extend(MXObject);
    var base = {};

    me.urlFormat = "http://{s}.tiles.mapbox.com/v3/nicki.uxdh1tt9/{z}/{x}/{y}.png32";

    /**
     * Open Street Map (OSM)
     * http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
     * 
     * AutoNavi (高德)
     * http://webrd0{n}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}
     * 
     * MapBox 
     * http://{s}.tiles.mapbox.com/v3/nicki.uxdh1tt9/{z}/{x}/{y}.png32
     * 
     * Google Satellite
     * https://earthbuilder.googleapis.com/10446176163891957399-03098191120537720121-4/2/maptile/maps?v=3&authToken=CgiZD3q-khVBTBDahK2bBQ==&x={x}&y={y}&z={z}&s=
     * 
     * Nokia Map
     * http://{n}.aerial.maps.cit.api.here.com/maptile/2.1/maptile/newest/terrain.day/{z}/{x}/{y}/256/jpg?app_id=yyMGGSFl4Py1t71zw69y&app_code=GM8TDhPhXdmVYhxFzbOABg
     */

    me.tileSize = 256;

    base._ = me._;
    me._ = function(p_options)
    {
        if (me.canConstruct())
        {
            base._(p_options);
        }
    };

    var _serverIndex = 0;
    me.getTileUrl = function(p_index)
    {
        _serverIndex++;
        if (_serverIndex >= 4)
        {
            _serverIndex = 1;
        }
        var params = {
            x : p_index.x,
            y : p_index.y,
            z : p_index.z,
            s : ["a", "b", "c"][_serverIndex - 1],
            n : _serverIndex
        };
        var url = $format(me.urlFormat, params);
        return url;
    };

    me.getTileIndex = function(p_lonLat, p_zoom, p_useFloat)
    {
        if (p_useFloat == null)
        {
            p_useFloat = false;
        }
        var pow = Math.pow(2, p_zoom);
        var pos = {
            x : (p_lonLat.lon + 180) / 360 * pow,
            y : (1 - Math.log(Math.tan(p_lonLat.lat * Math.PI / 180) + 1 / Math.cos(p_lonLat.lat * Math.PI / 180)) / Math.PI) / 2 * pow,
            z : p_zoom
        };
        if (!p_useFloat)
        {
            pos.x = Math.floor(pos.x);
            pos.y = Math.floor(pos.y);
        }
        return pos;
    };

    me.getTileLonLat = function(p_index)
    {
        var pow = Math.pow(2, p_index.z);
        var n = Math.PI - 2 * Math.PI * p_index.y / pow;
        var lonLat = {
            lon : p_index.x / pow * 360 - 180,
            lat : 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))
        };
        return lonLat;
    };

    return me.endOfClass(arguments);
};
g3d.map.MapProvider.className = "g3d.map.MapProvider";
