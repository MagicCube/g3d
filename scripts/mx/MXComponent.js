MXComponent = function()
{
    var me = $extend(MXObject);
    var base = {};

    me.autoInit = true;
    me.initialized = false;

    base._ = me._;
    me._ = function(p_options)
    {
        if (me.canConstruct())
        {
            base._(p_options);
            if (me.autoInit)
            {
                me.init(p_options);
            }
        }
    };

    me.init = function(p_options)
    {
        me.initialized = true;
    };

    me.bind = function(p_eventType, p_function, p_once)
    {
        var eventType = "on" + p_eventType;
        if (typeof (me[eventType]) === "undefined")
        {
            return me;
        }
        if (isEmpty(me[eventType]))
        {
            me[eventType] = new MXEvent();
        }
        me[eventType].addEventListener(p_function, p_once);
        return me;
    };
    me.on = me.bind;

    me.bindOnce = function(p_eventType, p_function)
    {
        me.bind(p_eventType, p_function, true);
        return me;
    };
    me.once = me.bindOnce;

    me.unbind = function(p_eventType, p_function)
    {
        if (isEmpty(p_eventType) && isEmpty(p_function))
        {
            for ( var name in me)
            {
                if (notEmpty(me[name]) && me[name].constructor === MXEvent)
                {
                    me[name].clear();
                    me[name] = null;
                }
            }
        }
        else
        {
            var eventType = "on" + p_eventType;
            if (typeof (me[eventType]) === "undefined")
            {
                return me;
            }

            if (notEmpty(me[eventType]))
            {
                if (notEmpty(p_function))
                {
                    me[eventType].removeEventListener(p_function);
                }
                else
                {
                    me[eventType].clear();
                }
            }
        }
        return me;
    };
    me.off = me.unbind;

    me.hasBound = function(p_eventType)
    {
        var eventType = "on" + p_eventType;
        if (typeof (me[eventType]) === "undefined")
        {
            return false;
        }
        if (notEmpty(me[eventType]))
        {
            return me[eventType].listeners.length > 0;
        }
        else
        {
            return false;
        }
    };

    me.trigger = function(p_eventType, p_args)
    {
        var eventType = "on" + p_eventType;
        if (typeof (me[eventType]) === "undefined")
        {
            return me;
        }
        if (notEmpty(me[eventType]))
        {
            var e = null;
            if (notEmpty(p_args))
            {
                e = p_args;
            }
            else
            {
                e = {};
            }
            e.target = me;

            e.type = p_eventType;

            me[eventType].fire(e);
        }
        return me;
    };

    base.instanceOf = me.instanceOf;
    me.instanceOf = function(p_class)
    {
        if (p_class === MXComponent)
        {
            return true;
        }
        return base.instanceOf(p_class);
    };

    base.dispose = me.dispose;
    me.dispose = function()
    {
        me.unbind();
        base.dispose();
    };

    return me.endOfClass(arguments);
};
MXComponent.className = "MXComponent";
