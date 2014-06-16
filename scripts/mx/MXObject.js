MXObject = function()
{
    var me = this;

    me.__class__ = MXObject;
    me.__superClasses__ = [];

    me.constructed = false;
    me.disposed = false;

    me._ = function(p_options)
    {
        if (me.canConstruct())
        {
            if (isPlainObject(p_options))
            {
                var isEventDispatcher = typeof (me.on) === "function";
                for ( var key in p_options)
                {
                    if (p_options.hasOwnProperty(key))
                    {
                        var option = p_options[key];
                        if (isEventDispatcher && typeof (me[key] === "object") && typeof (option) === "function" && key.startsWith("on"))
                        {
                            me.on(key.substr(2), option);
                        }
                        else
                        {
                            me[key] = option;
                        }

                        option = null;
                    }
                }
            }
            me.constructed = true;

            p_options = null;
        }
    };

    me.getClass = function()
    {
        return me.__class__;
    };

    me.getClassName = function()
    {
        var cls = me.getClass();
        if (notEmpty(cls))
        {
            return cls.className;
        }
        return null;
    };

    me.getNamespace = function()
    {
        var clsName = me.getClassName();
        if (notEmpty(clsName))
        {
            var parts = clsName.split(".");
            if (parts.length > 1)
            {
                parts = parts.slice(0, parts.length - 1);
                return parts.join(".");
            }
        }
        return null;
    };

    me.getModuleName = function()
    {
        var ns = me.getNamespace();
        if (notEmpty(ns))
        {
            var parts = ns.split(".");
            if (parts.length > 0)
            {
                return parts[0];
            }
            else
            {
                return ns;
            }
        }
        return null;
    };

    me.getResourcePath = function(p_name, p_ext, p_auto2x)
    {
        var path = me.getModuleName() + ".res." + p_name;
        return mx.getResourcePath(path, p_ext, p_auto2x);
    };

    me.set = function()
    {
        var p_options = null;
        if (arguments.length === 2 && isString(arguments[0]))
        {
            var func = "set" + arguments[0].toUpperCamelCase();
            if (isFunction(me[func]))
            {
                me[func](arguments[1]);
            }
            else
            {
                me[arguments[0]] = arguments[1];
            }
        }
        else if (arguments.length === 1 && isPlainObject(arguments[0]))
        {
            p_options = arguments[0];
            for ( var key in p_options)
            {
                if (p_options.hasOwnProperty(key))
                {
                    me.set(key, p_options[key]);
                }
            }
        }
        else if (arguments.length === 2 && isPlainObject(arguments[0]) && isPlainObject(arguments[1]))
        {
            p_options = arguments[0];
            var p_defaultOptions = arguments[1];
            var options = $.extend({}, p_defaultOptions, p_options);
            me.set(options);
        }
        return me;
    };

    me.canConstruct = function()
    {
        return !me.constructed;
    };

    me.instanceOf = function(p_class)
    {
        if (p_class === me.__class__)
        {
            return true;
        }
        else if (p_class === Object || p_class === MXObject)
        {
            return true;
        }
        else
        {
            return me.__superClasses__.indexOf(p_class) !== -1;
        }
    };

    me.endOfClass = function(p_arguments)
    {
        if (me.__class__.caller !== $extend)
        {
            me._(p_arguments[0]);
        }
        return me;
    };

    me.dispose = function()
    {
        me.disposed = true;
    };

    return me.endOfClass(arguments);
};
MXObject.className = "MXObject";
