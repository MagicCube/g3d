// 判断类型

function isBoolean(p_value)
{
    return typeof (p_value) === "boolean";
}

function isString(p_value)
{
    return typeof (p_value) === "string";
}

function isNumber(p_value)
{
    return typeof (p_value) === "number";
}

function isDate(p_value)
{
    return notEmpty(p_value) && p_value.constructor === Date;
}

function isArray(p_value)
{
    if (typeof(Array.isArray) === "function")
    {
        return Array.isArray(p_value);
    }
    else
    {
        return notEmpty(p_value) && (typeof (p_value) === "object" && typeof (p_value.length) === "number");
    }
}

function isObject(p_value)
{
    return notEmpty(p_value) && typeof (p_value) === "object";
}

function isPlainObject(p_value)
{
    return $.isPlainObject(p_value);
}

function isFunction(p_value)
{
    return typeof (p_value) === "function";
}

function isClass(p_value)
{
    return typeof (p_value) === "function";
}

// 类型转换
function parseBoolean(p_text)
{
    if (typeof (p_text) === "boolean")
    {
        return p_text;
    }
    else if (typeof(p_text) === "number")
    {
        return p_text !== 0;
    }
    else if (typeof(p_text) === "string")
    {
        var t = p_text.toLowerCase();
        return (t === "true") || (t === "t");
    }
}

var __regex_Hms = /^(\S*):(\S*):(\S*)$/;
var __regex_Hm = /^(\S*):(\S*)$/;
function parseTimeString(p_timeString)
{
    var value = {
        hours : 0,
        minutes : 0,
        seconds : 0
    };

    var matches = p_timeString.match(__regex_Hms);
    if (isEmpty(matches))
    {
        matches = p_timeString.match(__regex_Hm);
        if (isEmpty(matches))
        {
            matches = [p_timeString, p_timeString];
        }
    }

    if (matches.length >= 2)
    {
        value.hours = parseInt(matches[1], 10);
        if (isNaN(value.hours) || value.hours > 23 || value.hours < 0)
        {
            value.hours = 0;
        }
    }

    if (matches.length >= 3)
    {
        value.minutes = parseInt(matches[2], 10);
        if (isNaN(value.minutes) || value.minutes > 60 || value.minutes < 0)
        {
            value.minutes = 0;
        }
    }

    if (matches.length >= 4)
    {
        value.seconds = parseInt(matches[3], 10);
        if (isNaN(value.seconds) || value.seconds > 60 || value.seconds < 0)
        {
            value.seconds = 0;
        }
    }

    return value;
}

var __regex_yyyyM = /^(\S*)-(\S*)$/;
var __regex_yyyyMD = /^(\S*)-(\S*)-(\S*)$/;
function parseDateString(p_dateString)
{
    var value = {
        year : 1900,
        month : 1,
        date : 1
    };

    var matches = p_dateString.match(__regex_yyyyMD);
    if (isEmpty(matches))
    {
        matches = p_dateString.match(__regex_yyyyM);
        if (isEmpty(matches))
        {
            matches = [p_dateString, p_dateString];
        }
    }
    if (notEmpty(matches))
    {
        if (matches.length >= 2)
        {
            value.year = parseInt(matches[1], 10);
            if (isNaN(value.year))
            {
                value.year = 1900;
            }
        }

        if (matches.length >= 3)
        {
            value.month = parseInt(matches[2], 10);
            if (isNaN(value.month) || value.month > 12 || value.month <= 0)
            {
                value.month = 1;
            }
        }

        if (matches.length >= 4)
        {
            var d_max = Date.getDaysInMonth(value.year, value.month - 1);
            value.date = parseInt(matches[3], 10);
            if (isNaN(value.date) || value.date <= 0)
            {
                value.date = 1;
            }
            else if (value.date > d_max)
            {
                value.date = d_max;
            }
        }
    }
    value.month -= 1;
    return value;
}

function parseDate(p_text)
{
    if (isEmpty(p_text))
    {
        return null;
    }
    if (isDate(p_text))
    {
        return p_text;
    }

    var parts = null;
    var datePart = null;
    var timePart = null;
    p_text = p_text.trim();
    if (p_text.indexOf(" ") !== -1)
    {
        parts = p_text.split(" ");
    }
    else if (p_text.indexOf("T") !== -1)
    {
        parts = p_text.split("T");
    }

    if (isEmpty(parts))
    {
        parts = [p_text];
    }

    if (parts.length === 1)
    {
        if (parts[0].indexOf(":") !== -1)
        {
            timePart = parts[0];
        }
        else
        {
            datePart = parts[0];
        }
    }
    else if (parts.length === 2)
    {
        datePart = parts[0];
        timePart = parts[1];
    }

    var dateValue = {
        year : 1900,
        month : 0,
        date : 1
    };
    if (notEmpty(datePart))
    {
        dateValue = parseDateString(datePart);
    }

    var timeValue = {
        hours : 0,
        minutes : 0,
        seconds : 0
    };
    if (notEmpty(timePart))
    {
        timeValue = parseTimeString(timePart);
    }

    return new Date(dateValue.year, dateValue.month, dateValue.date, timeValue.hours, timeValue.minutes, timeValue.seconds);
}

// 命名空间
function $namespace(p_namespace)
{
    if (!/^[a-z]+[a-z0-9\._\$]*[a-z0-9]$/.test(p_namespace))
    {
        throw new Error("Invalid namespace '" + p_namespace + "'.");
    }
    var parts = p_namespace.split(".");
    if (parts.length === 0)
    {
        return null;
    }

    var partialNS = null;
    var context = window;
    for (var i = 0; i < parts.length; i++)
    {
        partialNS = parts[i];
        if (isEmpty(context[partialNS]))
        {
            context[partialNS] = {};
        }
        context = context[partialNS];
    }
    return context;
}
$ns = $namespace;

// 继承
function $extend(p_baseClass)
{
    if (typeof (p_baseClass) === "function")
    {
        var inst = new p_baseClass();
        inst.__class__ = $extend.caller;
        if (p_baseClass !== MXObject && p_baseClass !== MXComponent)
        {
            inst.__superClasses__.push(p_baseClass);
        }
        return inst;
    }
}

// 获取实例的类型。
function $getclass(p_inst)
{
    if (isEmpty(p_inst))
    {
        return null;
    }
    switch (typeof (p_inst))
    {
        case "boolean":
            return Boolean;

        case "number":
            return Number;

        case "string":
            return String;

        case "function":
            return Function;

        case "object":
            if (typeof (p_inst.getClass) === "function")
            {
                return p_inst.getClass();
            }
            else if (isDate(p_inst))
            {
                return Date;
            }
            else if (isArray(p_inst))
            {
                return Array;
            }
            else
            {
                return Object;
            }
            break;
        default:
            return null;
    }
}

// 判断 p_inst 是否是 p_class 的实例。
function $instanceof(p_inst, p_class)
{
    if (isEmpty(p_inst))
    {
        return false;
    }
    switch (typeof (p_inst))
    {
        case "boolean":
            return p_class === Boolean;

        case "number":
            return p_class === Number;

        case "string":
            return p_class === String;

        case "function":
            return p_class === Function;

        case "object":
            if (typeof (p_inst.instanceOf) === "function")
            {
                return p_inst.instanceOf(p_class);
            }
            else if (isDate(p_inst))
            {
                return p_class === Date;
            }
            else if (isArray(p_inst))
            {
                return p_class === Array;
            }
            else
            {
                return true;
            }
            break;
        default:
            return false;
    }
}

// 格式化
function $format(p_value, p_format)
{
    if (isString(p_value) && (isArray(p_format) || isNumber(p_format) || isPlainObject(p_format)))
    {
        return String.format(p_value, p_format);
    }
    if (isNumber(p_value))
    {
        return Number.format(p_value, p_format);
    }
    else if (isDate(p_value))
    {
        return Date.format(p_value, p_format);
    }
    else
    {
        return notEmpty(p_value) ? p_value.toString() : "";
    }
}
