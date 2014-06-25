$ns("mx3d.view");

mx3d.view.MXObject3D = function()
{
    var me = $extend(MXComponent);
    var base = {};

    me.id = null;
    me.object3D = null;
    me.parentView = null;
    me.parentObject3D = null;

    me.needsUpdate = false;

    base.init = me.init;
    me.init = function(p_options)
    {
        base.init(p_options);

        if (me.object3D == null)
        {
            me.initObject3D();
        }

        if (me.object3D != null)
        {
            me.object3D.id = me.id;
        }
    };

    me.initObject3D = function()
    {
        me.object3D = new THREE.Object3D();
    };

    me.addObject = function(p_object)
    {
        me.object3D.add(p_object);
    };
    me.removeObject = function(p_object)
    {
        me.object3D.remove(p_object);
    };

    me.update = function(p_forceUpdate)
    {

    };

    return me.endOfClass(arguments);
};
mx3d.view.MXObject3D.className = "mx3d.view.MXObject3D";
