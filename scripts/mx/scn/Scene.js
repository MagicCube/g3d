$ns("mx.scn");

mx.scn.Scene = function()
{
    var me = $extend(mx.view.View);
    var base = {};

    me.title = null;
    me.isActive = false;

    me.ontitlechanged = null;
    me.onactivate = null;
    me.ondeactivate = null;

    base.init = me.init;
    me.init = function(p_options)
    {
        base.init(p_options);
        me.$element.addClass("Scene");
    };

    me.setTitle = function(p_title)
    {
        if (me.title !== p_title)
        {
            me.title = p_title;
            me.trigger("titlechanged");
        }
    };

    me.activate = function(p_args, p_isBack)
    {
        me.isActive = true;
        me.trigger("activate", {
            args : p_args,
            isBack : p_isBack ? true : false
        });
    };

    me.deactivate = function()
    {
        me.isActive = false;
        me.trigger("deactivate");
    };

    me.toString = function()
    {
        return "Scene[" + me.id + "]";
    };

    return me.endOfClass(arguments);
};
mx.scn.Scene.className = "mx.scn.Scene";
