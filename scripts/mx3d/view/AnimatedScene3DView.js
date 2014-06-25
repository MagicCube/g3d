$ns("mx3d.view");

$import("lib.tween.Tween");
$import("lib.threejs.three", function()
{
    $import("lib.threejs.plugins.stats");
    $import("lib.threejs.controls.TrackballControls");
});

$import("mx3d.view.Scene3DView");

mx3d.view.AnimatedScene3DView = function()
{
    var me = $extend(mx3d.view.Scene3DView);
    var base = {};

    me.cameraControlsEnabled = false;
    me.statsVisible = false;
    me.animating = true;
    me.playState = null;
    me.frameIndex = 0;
    me.stats = null;
    me.cameraControls = null;
    me.onframing = null;

    base.init = me.init;
    me.init = function(p_options)
    {
        base.init(p_options);
        me.$element.addClass("AnimatedScene3DView");
    };

    base.init3D = me.init3D;
    me.init3D = function()
    {
        base.init3D();
        me.initStats();
        me.initControls();
    };

    me.initControls = function()
    {
        me.initCameraControls();
    };

    me.initCameraControls = function()
    {
        if (me.cameraControlsEnabled && me.cameraControls == null)
        {
            me.cameraControls = new THREE.TrackballControls(me.camera, me.$element.find("canvas")[0]);
        }
    };

    me.initStats = function()
    {
        if (me.statsVisible && me.stats == null)
        {
            me.stats = new Stats();
            me.stats.domElement.style.position = 'absolute';
            me.stats.domElement.style.right = '5px';
            me.stats.domElement.style.bottom = '5px';
            me.stats.domElement.style.whiteSpace = "nowrap";
            me.$container.append(me.stats.domElement);
        }
    };

    me.startAnimation = function()
    {
        me.animating = true;
        me.renderLoop();
    };

    me.stopAnimation = function()
    {
        me.animating = false;
    };

    me.renderLoop = function()
    {
        me.trigger("framing");
        if (me.cameraControlsEnabled)
        {
            if (me.cameraControls == null)
            {
                me.initCameraControls();
            }
            if (!me.cameraControls.enabled)
            {
                me.cameraControls.enabled = true;
            }
            me.cameraControls.update();
        }
        else
        {
            if (me.cameraControls != null && me.cameraControls.enabled)
            {
                me.cameraControls.enabled = false;
            }
        }

        me.update();
        me.render();

        if (me.statsVisible)
        {
            if (me.stats == null)
            {
                me.initStats();
            }
            me.stats.update();
        }

        if (me.animating)
        {
            requestAnimationFrame(me.renderLoop);
        }
    };

    me.moveCamera = function(p_position, p_rotation, p_duration, p_up)
    {
        var deferred = $.Deferred();

        var duration = p_duration;
        if (duration == null)
        {
            duration = 1000;
        }

        me.cameraControlsEnabled = false;

        if (p_position != null)
        {
            new TWEEN.Tween(me.camera.position).to(p_position, duration).easing(TWEEN.Easing.Sinusoidal.Out).start();
        }

        if (p_rotation != null)
        {
            new TWEEN.Tween(me.camera.rotation).to(p_rotation, duration).easing(TWEEN.Easing.Sinusoidal.Out).start();
        }

        if (p_up != null)
        {
            new TWEEN.Tween(me.cameraControls.object.up).to(p_up, duration).easing(TWEEN.Easing.Sinusoidal.Out).start();
        }
        else
        {
            me.cameraControls.reset();
        }

        setTimeout(function()
        {
            me.cameraControlsEnabled = true;
            deferred.resolve();
        }, duration);
        return deferred;
    };

    me.moveCameraTarget = function(p_position, p_duration)
    {
        var deferred = $.Deferred();

        if (p_position != null)
        {
            var duration = p_duration;
            if (duration == null)
            {
                duration = 1000;
            }

            me.cameraControlsEnabled = false;
            new TWEEN.Tween(me.cameraControls.target).to(p_position, duration).easing(TWEEN.Easing.Sinusoidal.Out).onComplete(function()
            {
                me.cameraControlsEnabled = true;
                deferred.resolve();
            }).start();
        }
        else
        {
            deferred.resolve();
        }
        return deferred;
    };

    me.focusLine = function(p_vector1, p_vector2, p_overlookDegree, p_duration, p_debug)
    {
        var deferred = $.Deferred();

        var material = null;
        var geometry = null;
        var line = null;

        if (p_duration == null)
        {
            p_duration = 1000;
        }

        if (p_debug == null)
        {
            p_debug = false;
        }

        if (p_debug)
        {
            material = new THREE.LineBasicMaterial({
                color : 0xffffff
            });
            geometry = new THREE.Geometry();
            geometry.vertices.push(p_vector1);
            geometry.vertices.push(p_vector2);
            line = new THREE.Line(geometry, material);
            me.addObject(line);
            var arrowGeometry = new THREE.CubeGeometry(80, 80, 80);
            var arrow = new THREE.Mesh(arrowGeometry);
            arrow.position.copy(p_vector2);
            me.addObject(arrow);
        }

        var mVector = p_vector1.clone();
        mVector = mVector.lerp(p_vector2, 0.5);

        var cVector = new THREE.Vector3();
        cVector.subVectors(p_vector2, p_vector1);
        var vLength = cVector.length();

        var quaternion = new THREE.Quaternion();
        var axis = new THREE.Vector3(0, 0, 1);
        quaternion.setFromAxisAngle(axis, -Math.PI / 2);
        cVector.applyQuaternion(quaternion);

        var angle = (90 - me.camera.fov / 2) * Math.PI / 180;
        var focusLength = vLength * 0.5 * Math.tan(angle);
        cVector.normalize().multiplyScalar(focusLength);

        var overlookAngle = p_overlookDegree * Math.PI / 180;
        cVector.z = focusLength * Math.tan(overlookAngle);
        cVector.add(mVector);

        if (p_debug)
        {
            material = new THREE.LineBasicMaterial({
                color : 0xffffff
            });
            geometry = new THREE.Geometry();
            geometry.vertices.push(mVector);
            geometry.vertices.push(cVector);
            line = new THREE.Line(geometry, material);
            me.addObject(line);
        }

        if (me.cameraControlsEnabled && me.cameraControls != null)
        {
            me.cameraControlsEnabled = false;

            var duration = p_duration;
            new TWEEN.Tween(me.cameraControls.target).to(mVector, duration).easing(TWEEN.Easing.Sinusoidal.Out).start();
            new TWEEN.Tween(me.camera.position).to(cVector, duration).easing(TWEEN.Easing.Sinusoidal.Out).onUpdate(function()
            {
                me.camera.lookAt(me.cameraControls.target);
            }).start();
            new TWEEN.Tween(me.cameraControls.object.up).to({
                x : 0,
                y : 0,
                z : 1
            }, duration).easing(TWEEN.Easing.Sinusoidal.Out).start();

            setTimeout(function()
            {
                me.cameraControlsEnabled = true;
                deferred.resolve();
            }, duration);
        }

        return deferred;
    };

    me.focusTriangle = function(p_vector1, p_vector2, p_vector3, p_overlookDegree, p_duration, p_debug)
    {
        var deferred = $.Deferred();

        var material = null;
        var geometry = null;
        var line = null;

        if (p_duration == null)
        {
            p_duration = 1000;
        }

        if (p_debug == null)
        {
            p_debug = false;
        }

        if (p_debug)
        {
            material = new THREE.LineBasicMaterial({
                color : 0xffffff
            });
            geometry = new THREE.Geometry();
            geometry.vertices.push(p_vector1);
            geometry.vertices.push(p_vector2);
            geometry.vertices.push(p_vector3);
            geometry.vertices.push(p_vector1);
            line = new THREE.Line(geometry, material);
            me.addObject(line);
            var arrowGeometry = new THREE.CubeGeometry(80, 80, 80);
            var arrow = new THREE.Mesh(arrowGeometry);
            arrow.position.copy(p_vector2);
            me.addObject(arrow);
        }

        var mVector = p_vector1.clone();
        mVector = mVector.lerp(p_vector2, 0.5);

        var cVector = new THREE.Vector3();
        cVector.subVectors(p_vector2, p_vector1);
        var vLength = cVector.length();

        var quaternion = new THREE.Quaternion();
        var axis = new THREE.Vector3(0, 0, 1);
        quaternion.setFromAxisAngle(axis, -Math.PI / 2);
        cVector.applyQuaternion(quaternion);

        var angle = (90 - me.camera.fov / 2) * Math.PI / 180;
        var overlookAngle = p_overlookDegree * Math.PI / 180;

        var focusLength1 = vLength * 0.5 * Math.tan(angle);
        var height = Math.abs(p_vector3.z) + 100;
        var focusLength2 = height * (Math.sin(overlookAngle) + Math.cos(overlookAngle) * Math.tan(angle)) * Math.cos(overlookAngle);
        var focusLength = focusLength1 > focusLength2 ? focusLength1 : focusLength2;

        cVector.normalize().multiplyScalar(focusLength);
        cVector.z = focusLength * Math.tan(overlookAngle);
        cVector.add(mVector);

        if (p_debug)
        {
            material = new THREE.LineBasicMaterial({
                color : 0xffffff
            });
            geometry = new THREE.Geometry();
            geometry.vertices.push(mVector);
            geometry.vertices.push(cVector);
            line = new THREE.Line(geometry, material);
            me.addObject(line);
        }

        if (me.cameraControlsEnabled && me.cameraControls != null)
        {
            me.cameraControlsEnabled = false;

            var duration = p_duration;
            new TWEEN.Tween(me.cameraControls.target).to(mVector, duration).easing(TWEEN.Easing.Sinusoidal.Out).start();
            new TWEEN.Tween(me.camera.position).to(cVector, duration).easing(TWEEN.Easing.Sinusoidal.Out).onUpdate(function()
            {
                me.camera.lookAt(me.cameraControls.target);
            }).start();
            new TWEEN.Tween(me.cameraControls.object.up).to({
                x : 0,
                y : 0,
                z : 1
            }, duration).easing(TWEEN.Easing.Sinusoidal.Out).start();

            setTimeout(function()
            {
                me.cameraControlsEnabled = true;
                deferred.resolve();
            }, duration);
        }

        return deferred;
    };

    base.update = me.update;
    me.update = function(p_forceUpdate)
    {
        TWEEN.update();
        base.update(p_forceUpdate);
    };

    return me.endOfClass(arguments);
};
mx3d.view.AnimatedScene3DView.className = "mx3d.view.AnimatedScene3DView";
