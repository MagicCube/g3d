(function()
{
    var lang = null;
    if (typeof ($mx_language) === "undefined")
    {
        lang = (navigator.language || navigator.userLanguage).toString().toLowerCase();
    }
    else
    {
        lang = $mx_language;
    }

    var scripts = document.getElementsByTagName("script");
    var src = scripts[scripts.length - 1].src;
    var srcPath = src.substr(0, src.lastIndexOf("/mx/") + 1);

    function include(p_src)
    {
        document.write("<script type='text/javascript' src='" + srcPath + p_src + "'></script>");
    }

    if (typeof (jQuery) === "undefined")
    {
        include("lib/jquery/jquery.js");
    }

    include("mx/javascript-extensions.js");
    include("mx/framework-base.js");
    include("mx/framework-core.js");

})();
