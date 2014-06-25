$ns("mx.util");

mx.util.ObjectPool = function()
{
    var me = $extend(MXComponent);
    var base = {};

    me.initialSize = 0;
    me.maxSize = 0;
    me.stack = [];

    base.init = me.init;
    me.init = function(p_options)
    {
        base.init(p_options);
        if (me.initialSize > 0 && me.stack.length < me.initialSize)
        {
            while (me.stack.length < me.initialSize)
            {
                var obj = me.createObject();
                me.addObject(obj);
            }
        }
    };

    me.borrowObject = function()
    {
        if (me.stack.length === 0)
        {
            var obj = me.createObject();
            return obj;
        }
        else
        {
            return me.stack.pop();
        }
    };

    me.returnObject = function(p_object)
    {
        if (notEmpty(p_object) && (me.maxSize === 0 || me.stack.length < me.maxSize))
        {
            me.addObject(p_object);
        }
    };

    me.addObject = function(p_object)
    {
        me.stack.push(p_object);
    };

    me.removeObject = function(p_object)
    {
        me.stack.remove(p_object);
    };

    me.createObject = function()
    {
        throw new Error("Must implement 'createObject()' function of the ObjectPool.");
    };

    me.clear = function()
    {
        me.stack.clear();
    };

    return me.endOfClass(arguments);
};
mx.util.ObjectPool.className = "mx.util.ObjectPool";
