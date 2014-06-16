$ns("g3d.view");

$include("g3d.res.ToolBarView.css");

g3d.view.ToolBarView = function()
{
    var me = $extend(mx.view.View);
    me.elementClass = "ToolBarView";
    me.elementTag = "ul";
    var base = {};

    me.buttons = [];

    me.onbuttonclick = null;

    base.init = me.init;
    me.init = function(p_options)
    {
        base.init(p_options);
        if (me.buttons.length > 0)
        {
            var buttons = me.buttons.clone();
            me.buttons.clear();
            me.addButtons(buttons);
        }

        me.$container.on("click", "li", _li_onclick);
    };

    me.addButton = function(p_button)
    {
        var id = p_button.id;
        if (id == null)
        {
            throw new Error("Button ID can not be empty or null.");
        }

        var button = $.extend({
            autoCheck : false,
            checked : false,
            text : "",
            type : "button"
        }, p_button);
        var $li = $("<li/>");

        $li.addClass("button");
        $li.attr("id", id);
        if (button.checked)
        {
            $li.addClass("checked");
        }
        $li.text(button.text);
        button.$element = $li;
        me.$container.append($li);
        me.buttons.add(button);
        me.buttons[button.id] = button;
        return button;
    };

    me.addButtons = function(p_buttons)
    {
        p_buttons.forEach(function(p_button)
        {
            me.addButton(p_button);
        });
    };

    me.removeButton = function(p_id)
    {
        var button = me.buttons[p_id];
        if (button != null)
        {
            me.buttons.remove(button);
            delete me.buttons[p_id];
        }
    };

    me.setButtonText = function(p_id, p_text)
    {
        var button = me.buttons[p_id];
        if (button != null)
        {
            button.text = p_text;
            button.$element.text(p_text);
        }
    };

    me.setButtonCheckState = function(p_id, p_state)
    {
        var button = me.buttons[p_id];
        if (button != null)
        {
            button.checked = p_state;
            if (button.checked)
            {
                button.$element.addClass("checked");
            }
            else
            {
                button.$element.removeClass("checked");
            }
        }
    };

    function _li_onclick(e)
    {
        var target = e.currentTarget;
        var id = target.id;
        var button = me.buttons[id];
        if (button.autoCheck)
        {
            me.setButtonCheckState(id, !button.checked);
        }
        me.trigger("buttonclick", {
            id : id,
            button : button
        });
    }

    return me.endOfClass(arguments);
};
g3d.view.ToolBarView.className = "g3d.view.ToolBarView";
