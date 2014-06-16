$ns("mx.app");

mx.app.Application = function()
{
    var me = $extend(mx.view.View);
    var base = {};

    me.$element = null;

    me.appId = null;
    me.appDisplayName = null;

    base.init = me.init;
    me.init = function(p_options)
    {
        if (isEmpty(me.$element))
        {
            me.$element = $(document.body);
        }

        if (isEmpty(me.id))
        {
            me.id = me.appId;
        }
        base.init(p_options);
        if (notEmpty(me.appDisplayName))
        {
            document.title = me.appDisplayName;
        }

        me.frame = {
            width : me.$element.width(),
            height : me.$element.height()
        };

        me.$element.addClass("mx-app");

        mx.app.Application.singleton = me;
    };

    me.run = function(p_options)
    {

    };

    return me.endOfClass(arguments);
};
mx.app.Application.className = "mx.app.Application";

mx.app.Application.singleton = null;
