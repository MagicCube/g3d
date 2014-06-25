$ns("mx3d.view");

$import("lib.threejs.three", function()
{
    $import("lib.threejs.effects.AnaglyphEffect");

    $import("lib.threejs.shaders.ColorCorrectionShader");
    $import("lib.threejs.shaders.CopyShader");
    $import("lib.threejs.shaders.BokehShader");
    $import("lib.threejs.shaders.DotScreenShader");
    $import("lib.threejs.shaders.FXAAShader");
    $import("lib.threejs.shaders.HorizontalTiltShiftShader");
    $import("lib.threejs.shaders.RGBShiftShader");
    $import("lib.threejs.shaders.ShaderExtras");
    $import("lib.threejs.shaders.SSAOShader");
    $import("lib.threejs.shaders.VerticalTiltShiftShader");
    $import("lib.threejs.shaders.VignetteShader");

    $import("lib.threejs.postprocessing.EffectComposer");
    $import("lib.threejs.postprocessing.BokehPass");
    $import("lib.threejs.postprocessing.MaskPass");
    $import("lib.threejs.postprocessing.RenderPass");
    $import("lib.threejs.postprocessing.SavePass");
    $import("lib.threejs.postprocessing.ShaderPass");

    $import("lib.threejs.plugins.DepthPassPlugin");
});

$import("mx3d.view.LabelView");

$include("mx3d.res.Scene3DView.css");

mx3d.view.Scene3DView = function()
{
    var me = $extend(mx.view.View);
    me.frame = {
        width : window.innerWidth,
        height : window.innerHeight
    };
    var base = {};

    me.scene = null;

    me.camera = null;
    me.cameraParams = null;

    me.renderMode = "renderer";
    me.renderer = null;
    me.rendererParams = null;

    me.clickable = false;
    me.clickableObjects = [];

    me.anaglyphEffectEnabled = false;
    me.displayAnalyphEffectButton = false;

    me.labelViews = [];

    me.$anaglyphEffectButton = null;

    me.onobjectclick = null;
    me.onlabelviewclick = null;

    base.init = me.init;
    me.init = function(p_options)
    {
        base.init(p_options);
        me.init3D();

        me.$element.addClass("Scene3DView");
        me.$element.css("overflow", "hidden");
        me.$element.on("mouseup", _onmouseup);
        me.$element.on("click", ".LabelView", _labelView_onclick);
    };

    me.init3D = function()
    {
        me.initScene();
        me.initCamera();
        me.initRenderer();
        me.initEffects();
        me.initObjects();
        me.initLights();

        if (me.displayAnalyphEffectButton)
        {
            me.initAnalyEffectButton();
        }
    };

    me.initScene = function()
    {
        me.scene = new THREE.Scene();
    };

    me.initCamera = function()
    {
        var params = $.extend({
            fov : 45,
            aspect : me.frame.width / me.frame.height,
            near : 0.01,
            far : 10000
        }, me.cameraParams);
        me.camera = new THREE.PerspectiveCamera(params.fov, params.aspect, params.near, params.far);
        if (params.position != null)
        {
            if (isArray(params.position))
            {
                me.camera.position.fromArray(params.position);
            }
            else
            {
                var position = $.extend({
                    x : 0,
                    y : 0,
                    z : 0
                }, params.position);
                me.camera.position.copy(position);
            }
        }
        if (params.rotation != null)
        {
            if (isArray(params.rotation))
            {
                me.camera.rotation.fromArray(params.rotation);
            }
            else
            {
                var rotation = $.extend({
                    x : 0,
                    y : 0,
                    z : 0
                }, params.rotation);
                me.camera.rotation.copy(rotation);
            }
        }
        me.addObject(me.camera);
    };

    me.initRenderer = function()
    {
        var params = $.extend({
            antialias : true
        }, me.rendererParams);
        me.renderer = new THREE.WebGLRenderer(params);
        me.renderer.setSize(me.frame.width, me.frame.height);
        me.renderer.gammaInput = true;
        me.renderer.gammaOutput = true;
        me.renderer.physicallyBasedShading = true;
        me.renderer.shadowMapEnabled = true;
        me.renderer.shadowMapSoft = true;
        me.$container.append(me.renderer.domElement);

        if (me.renderMode === "composer")
        {
            me.initComposer();
        }
    };

    me.initComposer = function()
    {
        me.composer = new THREE.EffectComposer(me.renderer);
    };

    me.initEffects = function()
    {
        if (me.anaglyphEffectEnabled && me.anaglyphEffect == null)
        {
            me.anaglyphEffect = new THREE.AnaglyphEffect(me.renderer);
            me.anaglyphEffect.setSize(me.frame.width, me.frame.height);
        }
    };

    me.initAnalyEffectButton = function()
    {
        me.$anaglyphEffectButton = $("<div id=analyphEffect/>");
        me.$anaglyphEffectButton.on("click", function(e)
        {
            if (e.button !== 0)
            {
                return;
            }
            e.preventDefault();
            me.anaglyphEffectEnabled = !me.anaglyphEffectEnabled;
            me.$anaglyphEffectButton.toggleClass("enabled", me.anaglyphEffectEnabled);
        });
        me.$container.append(me.$anaglyphEffectButton);
    };

    me.initObjects = function()
    {

    };

    me.initLights = function()
    {

    };

    me.addObject = function(p_object)
    {
        me.scene.add(p_object);
    };
    me.removeObject = function(p_object)
    {
        me.scene.remove(p_object);
    };

    me.addLight = function(p_light, p_helperClass)
    {
        me.scene.add(p_light);

        if (p_helperClass != null)
        {
            var helper = null;
            helper = new p_helperClass(p_light);
            me.addObject(helper);
        }
    };
    me.removeLight = function(p_light)
    {
        me.scene.remove(p_light);
    };

    me.render = function()
    {
        if (me.anaglyphEffectEnabled)
        {
            if (me.anaglyphEffect == null)
            {
                me.initEffects();
            }
            me.anaglyphEffect.render(me.scene, me.camera);
        }
        else if (me.renderMode === "composer" && me.composer != null)
        {
            me.composer.render();
        }
        else
        {
            me.renderer.render(me.scene, me.camera);
        }
    };

    me.update = function(p_forceUpdate)
    {
        me.updateLabels(p_forceUpdate);
    };

    me.updateLabels = function(p_forceUpdate)
    {
        me.labelViews.forEach(function(p_labelView)
        {
            p_labelView.update(p_forceUpdate);
        });
    };

    base.setFrame = me.setFrame;
    me.setFrame = function(p_frame)
    {
        base.setFrame(p_frame);
        if (typeof (p_frame.width) === "number" || typeof (p_frame.height) === "number")
        {
            if (me.camera != null)
            {
                me.camera.aspect = me.frame.width / me.frame.height;
                me.camera.updateProjectionMatrix();
            }

            me.update();

            if (me.renderer != null)
            {
                me.renderer.setSize(me.frame.width, me.frame.height);
            }

            if (me.anaglyphEffect != null)
            {
                me.anaglyphEffect.setSize(me.frame.width, me.frame.height);
            }
        }
    };

    var _labelProjector = null;
    me.addLabelView = function(p_options)
    {
        if (_labelProjector == null)
        {
            _labelProjector = new THREE.Projector();
            _labelProjector.frame = me.frame;
        }
        var options = $.extend({
            camera : me.camera,
            projector : _labelProjector
        }, p_options);
        var labelView = new mx3d.view.LabelView(options);
        me.addSubview(labelView);
        me.labelViews.add(labelView);
        labelView.update();
        return labelView;
    };

    me.removeLabelView = function(p_labelView)
    {
        me.removeSubview(p_labelView);
        p_labelView.camera = null;
        p_labelView.projector = null;
        me.labelViews.remove(p_labelView);
    };

    me.clearLabelViews = function()
    {
        me.labelViews.forEach(function(p_labelView)
        {
            me.removeSubview(p_labelView);
        });
    };

    function _onmouseup(event)
    {
        if (!me.clickable)
        {
            return;
        }

        if (event.target !== me.renderer.domElement)
        {
            return;
        }

        event.preventDefault();

        if (event.button === 0)
        {
            // update the mouse variable
            var mouse = {
                x : 0,
                y : 0,
                z : 0
            };
            mouse.x = (event.clientX / me.frame.width) * 2 - 1;
            mouse.y = -(event.clientY / me.frame.height) * 2 + 1;
            mouse.z = 1;

            // create a Ray with origin at the mouse position
            // and direction into the scene (camera direction)
            var vector = new THREE.Vector3(mouse.x, mouse.y, mouse.z);
            var projector = new THREE.Projector();
            projector.unprojectVector(vector, me.camera);

            var origin = me.camera.position;
            var dir = vector.sub(me.camera.position).normalize();
            var ray = new THREE.Raycaster();
            ray.set(origin, dir);

            // create an array containing all objects in the scene with which
            // the ray intersects
            var intersects = ray.intersectObjects(me.clickableObjects);
            if (intersects.length > 0)
            {
                var objects = intersects.map(function(p_intersect)
                {
                    return p_intersect.object;
                });
                me.trigger("objectclick", {
                    objects : objects,
                    intersects : intersects
                });
            }

        }

    }

    function _labelView_onclick(e)
    {
        if (e.button === 0)
        {
            var id = e.currentTarget.id;
            me.trigger("labelviewclick", {
                labelView : me.subviews[id]
            });
        }
    }

    return me.endOfClass(arguments);
};
mx3d.view.Scene3DView.className = "mx3d.view.Scene3DView";
