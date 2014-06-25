$ns("mx3d.util");

mx3d.util.ShaderMaterialBuilder = function()
{
    var me = $extend(MXObject);
    var base = {};

    me.url = null;
    me.parameters = {};
    me.attributes = {};
    me.uniforms = {};

    var _vertexShader = null;
    var _fragmentShader = null;

    base._ = me._;
    me._ = function(p_options)
    {
        if (me.canConstruct())
        {
            base._(p_options);

            if (p_options != null && p_options.uniforms != null)
            {
                me.uniforms = $.extend(p_options.uniforms, me.uniforms);
            }
            if (p_options != null && p_options.attributes != null)
            {
                me.attributes = $.extend(p_options.attributes, me.attributes);
            }

            if (me.url != null)
            {
                me.loadXML(me.url);
            }
        }
    };

    me.loadXML = function(p_url)
    {
        me.url = p_url;
        $.ajax({
            dataType : "xml",
            url : p_url,
            async : false
        }).success(function(p_result)
        {
            var $xml = $(p_result);
            _vertexShader = $xml.find("material > script[id=vertexShader]").text();
            _fragmentShader = $xml.find("material > script[id=fragmentShader]").text();
            $xml = null;
            p_result = null;
        });
    };

    me.setAttributeValues = function(p_name, p_values, p_type)
    {
        var type = p_type;
        if (p_type == null)
        {
            type = _getType(p_values[0]);
        }
        me.attributes[p_name] = {
            t : type,
            value : p_values
        };
    };

    me.setAttributeValue = function(p_name, p_value, p_type)
    {
        if (me.attributes[p_name] == null)
        {
            var values = [];
            me.setAttributeValues(p_name, values, _getType(p_value, p_type));
        }
        var attr = me.attributes[p_name];
        attr.value.add(p_value);
    };

    me.setUniformValue = function(p_name, p_value, p_type)
    {
        var type = p_type;
        if (p_type == null)
        {
            type = _getType(p_value);
        }
        var uniform = {
            type : type,
            value : p_value
        };
        me.uniforms[p_name] = uniform;
        return uniform;
    };

    me.build = function()
    {
        var params = $.extend({}, me.parameters);
        params.attributes = $.extend({}, me.attributes);
        params.uniforms = $.extend({}, me.uniforms);
        params.vertexShader = _vertexShader;
        params.fragmentShader = _fragmentShader;
        var shaderMaterial = new THREE.ShaderMaterial(params);
        return shaderMaterial;
    };

    function _getType(p_value, p_type)
    {
        if (typeof (p_value) === "number")
        {
            return "f";
        }
        else if (p_value instanceof THREE.Color)
        {
            return "c";
        }
        else if (p_value instanceof THREE.Texture)
        {
            return "t";
        }
        return p_type;
    }

    return me.endOfClass(arguments);
};
mx3d.util.ShaderMaterialBuilder.className = "mx3d.util.ShaderMaterialBuilder";
