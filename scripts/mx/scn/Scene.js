$ns("mx.scn");

mx.scn.Scene = function()
{
    var me = $extend(mx.view.View);
    me.frame = {
        width : "100%"
    };
    var base = {};

    me.title = null;
    me.subtitle = null;
    me.isActive = false;

    me.container = null;

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
        me.title = p_title;
    };

    me.setSubtitle = function(p_subtitle)
    {
        me.subtitle = p_subtitle;
    };

    me.activate = function(p_args, p_isBack)
    {
        me.setSubtitle(me.subtitle);

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
        return "Activity[" + me.id + "]";
    };

    return me.endOfClass(arguments);
};
mx.scn.Scene.className = "mx.scn.Scene";
