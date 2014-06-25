/*!
 * MXFramework v6.0
 * - A lightweight Object-Oriented JavaScript Framework
 *
 * Copyright 2005-2013. All rights reserved.
 *
 * Create Date: 2012-09-23 20:46
 * First Created by Henry Li (henry1943@163.com).
 */

MX = function()
{
    var me = this;

    me.runAt = "desktop";
    me.osType = null;

    me.language = null;
    me.locales = {};

    me.debugMode = false;
    me.webContentPath = null;
    me.scriptPath = null;
    me.libraryPath = null;

    me.urlParams = null;

    me.init = function()
    {
        _resolveUrlParams();
        _resolveLangauge();
        _resolveUserAgent();
        _resolveScriptPath();
        _resolveLibraryPath();
    };

    me.mappath = function(p_url)
    {
        if (typeof (p_url) !== "string")
        {
            return null;
        }

        var url = p_url;
        if (url.indexOf("$language"))
        {
            url = url.replace(/\$language/g, mx.language);
        }
        if (url.indexOf("~/") === 0)
        {
            url = me.webContentPath + url.substr(1);
        }
        else if (url.indexOf("$/") === 0)
        {
            url = me.scriptPath + url.substr(1);
        }
        else if (url.indexOf("$lib/") === 0)
        {
            url = me.libraryPath + url.substr(4);
        }
        return url;
    };
    $mappath = me.mappath;

    me.getMessage = function(p_context, p_key, p_params)
    {
        var module = null;
        if (typeof (p_context) === "string")
        {
            module = p_context;
        }
        else if (typeof (p_context.getModuleName) === "function")
        {
            module = p_context.getModuleName();
        }

        if (notEmpty(module))
        {
            var locale = me.locales[module];
            if (notEmpty(locale) && notEmpty(locale[p_key]))
            {
                var text = locale[p_key];
                if (notEmpty(p_params) && typeof (p_params) === "object")
                {
                    text = $format(text, p_params);
                }
                return text;
            }
        }
        return null;
    };
    $msg = me.getMessage;

    me.loadingScripts = [];
    me.loadedScripts = [];
    me.loadingStyles = [];
    me.loadedStyles = [];
    me.include = function(p_path, p_callback)
    {
        var path = $mappath(p_path);

        var ingList = null;
        var edList = null;
        var type = null;
        if (path.indexOf(".js") === path.length - 3)
        {
            ingList = me.loadingScripts;
            edList = me.loadedScripts;
            type = "js";
        }
        else if (path.indexOf(".css") === path.length - 4)
        {
            if (path.indexOf("/") === -1)
            {
                path = me.getResourcePath(path.substr(0, path.length - 4), "css");
            }
            ingList = me.loadingStyles;
            edList = me.loadedStyles;
            type = "css";
        }

        if (notEmpty(ingList[path]))
        {
            if (typeof (p_callback) === "function")
            {
                ingList[path].push(p_callback);
            }
        }
        else if (notEmpty(edList[path]))
        {
            if (typeof (p_callback) === "function")
            {
                p_callback();
            }
        }
        else
        {
            _add(ingList, path, ((typeof (p_callback) === "function") ? [p_callback] : []));
            if (document.body !== null)
            {
                var element = null;
                if (type === "js")
                {
                    element = document.createElement("script");
                }
                else if (type === "css")
                {
                    element = document.createElement("link");
                    element.rel = "stylesheet";
                }

                element.onload = me._include_onload;
                element.onerror = me._include_onload;
                if (element.readyState)
                {
                    element.onreadystatechange = me._include_onload;
                }

                element.dynamic = true;
                document.body.appendChild(element);

                if (type === "js")
                {
                    element.src = path + (me.debugMode ? ("?nocache=" + Math.random()) : "");
                }
                else if (type === "css")
                {
                    element.href = path + (me.debugMode ? ("?nocache=" + Math.random()) : "");
                }
            }
            else
            {
                var tag = null;
                if (type === "js")
                {
                    tag = "<script src='" + path + (me.debugMode ? ("?nocache=" + Math.random()) : "") + "'";
                }
                else if (type === "css")
                {
                    tag = "<link rel='stylesheet' href='" + path + (me.debugMode ? ("?nocache=" + Math.random()) : "") + "'";
                }
                document.write(tag + " onerror='mx._include_onload(event)' onreadystatechange='mx._include_onload(event);' onload='mx._include_onload(event)'></script>");
            }
        }
    };
    $include = me.include;

    me._include_onload = function(e)
    {
        e = (notEmpty(e) ? e : event);
        _element_onload(e);
        _checkStylesLoadingStatus();
        _checkScriptLoadingStatus();
        _checkAllLoadingStatus();
    };

    me._ready_callbacks = [];
    me.whenReady = function(p_callback)
    {
        setTimeout(function()
        {
            if (typeof (p_callback) !== "function")
            {
                return;
            }

            if (me.loadingStyles.length === 0 && me.loadingScripts.length === 0)
            {
                p_callback();
            }
            else
            {
                me._ready_callbacks.push(p_callback);
            }
        }, 0);
    };

    me._styleReady_callbacks = [];
    me.whenStyleReady = function(p_callback)
    {
        setTimeout(function()
        {
            if (typeof (p_callback) !== "function")
            {
                return;
            }

            if (me.loadingStyles.length === 0)
            {
                p_callback();
            }
            else
            {
                me._styleReady_callbacks.push(p_callback);
            }
        }, 0);
    };

    me._scriptReady_callbacks = [];
    me.whenScriptReady = function(p_callback)
    {
        setTimeout(function()
        {
            if (typeof (p_callback) !== "function")
            {
                return;
            }

            if (me.loadingScripts.length === 0)
            {
                p_callback();
            }
            else
            {
                me._scriptReady_callbacks.push(p_callback);
            }
        }, 0);
    };

    me.importClass = function(p_fullClassName, p_callback)
    {
        var path = null;
        if (me.debugMode)
        {
            path = me.getClassPath(p_fullClassName);
            if (path !== null)
            {
                me.include(path, function()
                {
                    if (typeof (p_callback) === "function")
                    {
                        p_callback();
                    }
                });
            }
        }
        else
        {
            if (p_fullClassName.startsWith("mx."))
            {
                if (typeof (p_callback) === "function")
                {
                    p_callback();
                }
                return;
            }

            if (p_fullClassName.startsWith("lib."))
            {
                path = me.getClassPath(p_fullClassName);
                if (notEmpty(path))
                {
                    me.include(path, p_callback);
                }
            }
            else
            {
                var index = p_fullClassName.indexOf(".");
                if (index !== -1)
                {
                    var moduleName = p_fullClassName.substr(0, index);
                    me.include("$/" + moduleName + "/min.js", p_callback);
                }
            }
        }
    };
    $import = me.importClass;

    me.importLanguage = function(p_moduleName, p_callback)
    {
        me.include("$/" + p_moduleName + "/res/locales/$language/language.js", p_callback);
    };
    $importlanguage = me.importLanguage;

    me.importMessageBundle = function(p_namespace)
    {
        var lan = me.language.replace("-", "_");
        if (lan === "zh_cn")
        {
            lan = "zh_CN";
        }
        else if (lan === "zh_tw")
        {
            lan = "zh_TW";
        }
        var path = me.getResourcePath(p_namespace + ".messagebundle_" + lan, "properties");
        $.ajax({
            url : path,
            async : false
        }).done(function(p_result)
        {
            var lines = p_result.split("\n");
            if (isEmpty(me.locales[p_namespace]))
            {
                me.locales[p_namespace] = {};
            }
            lines.forEach(function(p_line)
            {
                var line = p_line.trim();
                if (line.startsWith("#"))
                {
                    return;
                }

                var pos = line.indexOf("=");
                if (pos > 0)
                {
                    var key = line.substr(0, pos);
                    var value = line.substr(pos + 1);
                    var r = /\\u([\d\w]{4})/gi;
                    value = value.replace(r, function(match, grp)
                    {
                        return String.fromCharCode(parseInt(grp, 16));
                    });
                    me.locales[p_namespace][key] = decodeURIComponent(value);
                }
            });
        });
    };
    $importmessagebundle = me.importMessageBundle;

    me.getClassPath = function(p_fullClassName)
    {
        return me.getResourcePath(p_fullClassName, "js");
    };

    me.getResourcePath = function(p_fullClassName, p_ext, p_auto2x)
    {
        if (isEmpty(p_ext))
        {
            p_ext = "png";
        }

        var ext = null;
        if (p_auto2x === true && (p_ext === "png" || p_ext === "jpg"))
        {
            if (window.devicePixelRatio === 2)
            {
                ext = "@2x" + "." + p_ext;
            }
            else
            {
                ext = "." + p_ext;
            }
        }
        else
        {
            ext = "." + p_ext;
        }

        var parts = p_fullClassName.split(".", 1);
        var path = null;
        if (parts.length === 1)
        {
            if (!me.debugMode && (parts[0] !== "lib" && ext === ".css"))
            {
                path = $mappath("$/" + parts[0] + "/res/min.css");
            }

            if (isEmpty(path))
            {
                var classPath = p_fullClassName.replace(/\./g, "/");
                if (notEmpty(window["$mx_" + parts[0] + "_path"]))
                {
                    path = $mappath(window["$mx_" + parts[0] + "_path"] + classPath.substr(parts[0].length) + ext);
                }
                else if (classPath.startsWith("lib/"))
                {
                    path = $mappath("$lib/" + classPath.substr(4) + ext);
                }
                else
                {
                    path = $mappath("$/" + classPath + ext);
                }
            }
        }
        return path;
    };

    me.log = function(p_message)
    {
        if (typeof (console) !== "undefined")
        {
            console.log("[MX] " + p_message);
        }
    };

    me.warn = function(p_message)
    {
        if (typeof (console) !== "undefined")
        {
            console.warn("[MX] " + p_message);
        }
    };

    me.error = function(p_message)
    {
        if (typeof (console) !== "undefined")
        {
            console.error("[MX] " + p_message);
        }
    };

    function _resolveUrlParams()
    {
        var search = location.search.substring(1);
        me.urlParams = search ? JSON.parse('{"' + search.replace(/&/g, '","').replace(/\=/g, '":"') + '"}', function(key, value)
        {
            return key === "" ? value : decodeURIComponent(value);
        }) : {};
    }

    function _resolveLangauge()
    {
        if (notEmpty(me.urlParams.lang))
        {
            me.language = me.urlParams.lang.replace("/", "");
        }
        else if (notEmpty(me.urlParams.language))
        {
            me.language = me.urlParams.language.replace("/", "");
        }
        else if (typeof ($mx_language) === "undefined")
        {
            me.language = (navigator.language || navigator.userLanguage).toString().toLowerCase();
            if (me.language.startsWith("en-"))
            {
                me.language = "en";
            }
        }
        else
        {
            me.language = $mx_language;
        }
    }

    function _resolveUserAgent()
    {
        var userAgent = window.navigator.userAgent;
        if (userAgent.contains("iPad") || userAgent.contains("iPhone") || userAgent.contains("iPod"))
        {
            me.runAt = "mobile";
            me.osType = "ios";
        }
        else if (userAgent.contains("Android"))
        {
            me.runAt = "mobile";
            me.osType = "android";
        }
    }

    function _resolveScriptPath()
    {
        var scripts = document.getElementsByTagName("script");
        var src = scripts[scripts.length - 1].src;
        var mxPath = "/mx/framework-core.js";
        var pos = 0;
        if (src.endsWith(mxPath))
        {
            me.debugMode = true;
            if (typeof ($mx_script_path) === "undefined")
            {
                me.scriptPath = src.substr(0, src.length - mxPath.length);
            }
            else
            {
                me.scriptPath = $mx_script_path;
            }

            if (typeof ($mx_web_content_path) === "undefined")
            {
                pos = me.scriptPath.lastIndexOf("/");
                me.webContentPath = me.scriptPath.substr(0, pos);
            }
            else
            {
                me.webContentPath = $mx_web_content_path;
            }

            if (me.scriptPath.startsWith("~/"))
            {
                me.scriptPath = $mappath(me.scriptPath);
            }
        }
        else
        {
            me.debugMode = false;
            mxPath = "/mx/min.js";
            if (src.endsWith(mxPath))
            {
                if (typeof ($mx_script_path) === "undefined")
                {
                    me.scriptPath = src.substr(0, src.length - mxPath.length);
                }
                else
                {
                    me.scriptPath = $mx_script_path;
                }

                if (typeof ($mx_web_content_path) === "undefined")
                {
                    pos = me.scriptPath.lastIndexOf("/");
                    me.webContentPath = me.scriptPath.substr(0, pos);
                }
                else
                {
                    me.webContentPath = $mx_web_content_path;
                }
            }
            else
            {
                throw new Error("MXFramework is not well configured.");
            }
        }
    }

    function _resolveLibraryPath()
    {
        if (typeof ($mx_library_path) === "undefined")
        {
            me.libraryPath = me.scriptPath + "/lib";
        }
        else
        {
            if ($mx_library_path.startsWith("~/"))
            {
                me.libraryPath = $mappath($mx_library_path);
            }
            else
            {
                me.libraryPath = $mx_library_path;
            }
        }
    }

    function _element_onload(e)
    {
        var element = null;
        if (notEmpty(e.srcElement))
        {
            element = e.srcElement;
        }
        else
        {
            element = e.target;
        }

        if (notEmpty(element.readyState) && (typeof (element.times) === "undefined" && element.readyState !== "complete"))
        {
            element.times = 1;
            return;
        }

        element.onload = null;
        element.onerror = null;
        if (element.readyState)
        {
            element.onreadystatechange = null;
        }

        var path = null;
        var callbacks = [];
        if (element.tagName === "SCRIPT")
        {
            path = element.src;
            if (me.debugMode)
            {
                path = path.substring(0, path.lastIndexOf("?"));
            }
            if (e.type !== "error")
            {
                _add(me.loadedScripts, path, path);
                callbacks = me.loadingScripts[path];
                _remove(me.loadingScripts, path);
            }
            else
            {
                mx.error("Fail to load '" + path + "'.");
            }
        }
        else if (element.tagName === "LINK")
        {
            path = element.href;
            if (me.debugMode)
            {
                path = path.substring(0, path.lastIndexOf("?"));
            }
            if (e.type !== "error")
            {
                _add(me.loadedStyles, path, path);
                callbacks = me.loadingStyles[path];
                _remove(me.loadingStyles, path);
            }
            else
            {
                mx.error("Fail to load '" + path + "'.");
            }
        }

        var func = null;
        while (callbacks.length > 0)
        {
            func = callbacks.pop();
            func(path);
            func = null;
        }
        callbacks = null;
    }

    function _checkStylesLoadingStatus()
    {
        if (me.loadingStyles.length === 0 && me._styleReady_callbacks.length > 0)
        {
            var readyFunc = null;
            while (me._styleReady_callbacks.length > 0)
            {
                if (me.loadingStyles.length > 0)
                {
                    break;
                }
                readyFunc = me._styleReady_callbacks.pop();
                readyFunc();
                readyFunc = null;
            }
        }
    }

    function _checkScriptLoadingStatus()
    {
        if (me.loadingScripts.length === 0 && me._scriptReady_callbacks.length > 0)
        {
            var readyFunc = null;
            while (me._scriptReady_callbacks.length > 0)
            {
                if (me.loadingScripts.length > 0)
                {
                    break;
                }
                readyFunc = me._scriptReady_callbacks.pop();
                readyFunc();
                readyFunc = null;
            }
        }
    }

    function _checkAllLoadingStatus()
    {
        if (me._ready_callbacks.length === 0)
        {
            return;
        }
        var loaded = (me.loadingStyles.length === 0 && me.loadingScripts.length === 0);
        var androidLoaded = (me.osType === "android" && me.loadingScripts.length === 0);
        if (loaded || androidLoaded)
        {
            var readyFunc = null;
            while (me._ready_callbacks.length > 0)
            {
                var isNotAndroid = (me.osType !== "android") && (me.loadingStyles.length > 0);
                if (me.loadingScripts.length > 0 && (isNotAndroid || (me.osType === "android")))
                {
                    break;
                }
                readyFunc = me._ready_callbacks.pop();
                readyFunc();
                readyFunc = null;
            }
        }
    }

    function _add(p_collection, p_key, p_value)
    {
        p_collection[p_key] = p_value;
        p_collection.push(p_key);
    }

    function _remove(p_collection, p_key)
    {
        for (var i = 0; i < p_collection.length; i++)
        {
            if (p_collection[i] === p_key)
            {
                p_collection.splice(i, 1);
                break;
            }
        }
    }

    return me;
};

mx = new MX();
mx.init();

$importlanguage("mx");
$import("mx.MXObject");
$import("mx.MXEvent");
$import("mx.MXComponent");
$import("mx.view.View");
$import("mx.scn.Scene");
$import("mx.app.Application");
