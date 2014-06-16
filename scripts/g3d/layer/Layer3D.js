$ns("g3d.layer");

$import("mx3d.view.MXComponent3D");

g3d.layer.Layer3D = function()
{
    var me = $extend(mx3d.view.MXComponent3D);
    var base = {};

    me.scale = null;
    me.geoJSONUtil = null;

    me.onaddedtomap = null;
    me.onremovedfrommap == null;

    base.init = me.init;
    me.init = function(p_options)
    {
        base.init(p_options);
    };

    return me.endOfClass(arguments);
};
g3d.layer.Layer3D.className = "g3d.layer.Layer3D";
