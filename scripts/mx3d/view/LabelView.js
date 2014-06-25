$ns("mx3d.view");

mx3d.view.LabelView = function()
{
    var me = $extend(mx.view.View);
    var base = {};

    me.position = null;
    me.text = null;
    me.fontSize = 16;

    me.camera = null;
    me.projector = null;

    me.clickable = false;

    base.init = me.init;
    me.init = function(p_options)
    {
        base.init(p_options);
        me.$container.addClass("LabelView");
        me.$container.css({
            position : "absolute"
        });

        if (me.clickable)
        {
            me.$container.css("cursor", "pointer");
        }

        if (me.text != null)
        {
            me.setText(me.text);
        }
    };

    me.setText = function(p_text)
    {
        me.text = p_text;
        me.$container.text(me.text != null ? me.text : "");
    };

    me.setHtml = function(p_html)
    {
        me.$container.html(p_html != null ? p_html : "");
        me.text = me.$container.text();
    };

    me.update = function()
    {
        var position = me.position.clone();
        me.projector.projectVector(position, me.camera);
        var position2D = {
            x : (position.x + 1) / 2 * me.projector.frame.width,
            y : -(position.y - 1) / 2 * me.projector.frame.height,
            z : position.z
        };

        me.setFrame({
            left : position2D.x,
            top : position2D.y
        });

        if (position2D.z < 1)
        {
            var scale = (1 - position2D.z) * 50;

            var fontSize = me.fontSize / 4 * scale;
            me.$container.css({
                display : "block",
                fontSize : fontSize
            });
        }
        else
        {
            me.$container.css({
                display : "none"
            });
        }
    };

    return me.endOfClass(arguments);
};
mx3d.view.LabelView.className = "mx3d.view.LabelView";
