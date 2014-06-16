function isEmpty(p_value)
{
    return p_value === undefined || p_value === null;
}

function notEmpty(p_value)
{
    return !isEmpty(p_value);
}

//=====================================================================
//Boolean
//=====================================================================

//=====================================================================
//String
//=====================================================================

String.format = function(p_string, p_args)
{
    if (isEmpty(p_string))
    {
        return "";
    }
    if (typeof (p_string) !== "string")
    {
        p_string = p_string.toString();
    }
    if (isEmpty(p_args))
    {
        return p_string;
    }

    var result = null;
    var key = null;
    var value = null;
    var i = 0;
    if (typeof (p_args) === "number")
    {
        result = [];
        for (i = 0; i < p_args; i++)
        {
            result[i] = p_string;
        }
        return result.join("");
    }

    result = p_string;
    var groups = null;
    if (p_string.indexOf("{") !== -1 && p_string.indexOf("}") !== -1)
    {
        if (isObject(p_args) && !isArray(p_args))
        {
            groups = p_string.match(/(\{[a-z][a-z$_0-9]*\})/gi);
            if (notEmpty(groups))
            {
                for (i = 0; i < groups.length; i++)
                {
                    key = groups[i].substr(1);
                    key = key.substr(0, key.length - 1);
                    value = p_args[key];
                    if (isEmpty(value))
                    {
                        value = "";
                    }
                    result = result.replace("{" + key + "}", value);
                }
            }
        }
        else if (isArray(p_args))
        {
            groups = p_string.match(/(\{[0-9]+\})/gi);
            if (notEmpty(groups))
            {
                for (i = 0; i < groups.length; i++)
                {
                    var index = groups[i].substr(1);
                    index = index.substr(0, index.length - 1);
                    value = p_args[parseInt(index, 0)];
                    if (isEmpty(value))
                    {
                        value = "";
                    }
                    result = result.replace("{" + index + "}", value);
                }
            }
        }
    }
    return result;
};

String.newGuid = function(p_toLowerCase, p_length)
{
    var toLowerCase = false;
    if (notEmpty(p_toLowerCase))
    {
        toLowerCase = p_toLowerCase;
    }
    var length = 32;
    if (notEmpty(p_length))
    {
        length = p_length;
    }
    var result = "";
    for (var i = 1; i <= length; i++)
    {
        var n = Math.floor(Math.random() * 16.0);
        if (n < 10)
        {
            result += n;
        }
        else if (n === 10)
        {
            result += "a";
        }
        else if (n === 11)
        {
            result += "b";
        }
        else if (n === 12)
        {
            result += "c";
        }
        else if (n === 13)
        {
            result += "d";
        }
        else if (n === 14)
        {
            result += "e";
        }
        else if (n === 15)
        {
            result += "f";
        }
        if ((i === 8) || (i === 12) || (i === 16) || (i === 20))
        {
            result += "-";
        }
    }

    if (toLowerCase)
    {
        result = result.toLowerCase();
    }
    else
    {
        result = result.toUpperCase();
    }
    return result;
};

String.prototype.contains = function(p_subString)
{
    return this.indexOf(p_subString) !== -1;
};

String.prototype.startsWith = function(p_string)
{
    return this.substring(0, p_string.length) === p_string;
};

String.prototype.endsWith = function(p_string)
{
    return this.substring(this.length - p_string.length) === p_string;
};

String.prototype.trimLeft = function()
{
    return this.replace(/^\s*/, "");
};

String.prototype.trimRight = function()
{
    return this.replace(/\s*$/, "");
};

String.prototype.trim = function()
{
    return this.trimRight().trimLeft();
};

String.prototype.getByteCount = function()
{
    var text = this.replace(/[^\x00-\xff]/g, "**");
    return text.length;
};

String.prototype.containsAsianCharacters = function()
{
    return (/.*[\u4e00-\u9fa5]+.*$/.test(this));
};

String.prototype.toUpperCamelCase = function()
{
    return this[0].toUpperCase() + this.substr(1);
};

// =====================================================================
// Number
// =====================================================================

Number.format = function(p_value, p_formatString)
{
    if (isEmpty(p_value))
    {
        return "";
    }
    if (typeof (p_formatString) === "undefiend")
    {
        return p_value + "";
    }
    if (!isNumber(p_value))
    {
        p_value = 0;
    }

    var percentage = "";
    if (p_formatString.endsWith("%") && p_formatString.length > 1)
    {
        percentage = "%";
        p_value = p_value * 100;
        p_formatString = p_formatString.substr(0, p_formatString.length - 1);
    }

    var string = p_value + "";
    if (notEmpty(p_formatString) && p_formatString !== "")
    {
        var stringParts = string.split('.');
        var formatParts = p_formatString.split('.');

        if (!formatParts[0].endsWith(",000") && stringParts[0].length < formatParts[0].length)
        {
            stringParts[0] = formatParts[0].substring(0, formatParts[0].length - stringParts[0].length) + stringParts[0];
        }

        if (formatParts[0].endsWith(",000"))
        {
            stringParts[0] = stringParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        if (formatParts.length === 1)
        {
            return stringParts[0] + percentage;
        }
        else
        {
            var fl = parseFloat("0." + stringParts[1]);
            fl = fl.toFixed(formatParts[1].length);
            return stringParts[0] + "." + fl.substr(2) + percentage;
        }
    }
    else
    {
        return string;
    }
};

// =====================================================================
// Date
// =====================================================================

Date.today = new Date();
Date.today = new Date(Date.today.getFullYear(), Date.today.getMonth(), Date.today.getDate());
Date.format = function(p_value, p_formatString)
{
    if (notEmpty(p_value))
    {
        var text;
        if (!p_formatString)
        {
            text = "yyyy-MM-dd HH:mm:ss";
        }
        else if (p_formatString === "smart")
        {
            var result = null;
            var now = new Date();
            var deltaMin = Math.round((now.getTime() - p_value) / 1000 / 60);
            if (deltaMin <= 0)
            {
                result = "刚刚";
            }
            else if (deltaMin <= 1)
            {
                result = Math.round((now.getTime() - p_value) / 1000) + " 秒种前";
            }
            else if (deltaMin < 60)
            {
                result = deltaMin + " 分钟前";
            }
            else if (deltaMin === 60)
            {
                result = "1 小时前";
            }
            else
            {
                var deltaHour = Math.round(deltaMin / 60);
                if (deltaHour < 24)
                {
                    result = deltaHour + " 小时前";
                }
                else if (deltaHour === 24)
                {
                    result = "1 天前";
                }
                else
                {
                    var deltaDay = Math.round(deltaHour / 24);
                    if (deltaDay < 8)
                    {
                        result = deltaDay + " 天前";
                    }
                }
            }
            if (notEmpty(result))
            {
                return result;
            }
            else
            {
                text = "yyyy年M月d日";
            }
        }
        else
        {
            text = p_formatString;
        }

        var yy = p_value.getYear();
        var M = p_value.getMonth() + 1;
        var d = p_value.getDate();
        var h = p_value.getHours();
        if (h > 12)
        {
            h = p_value.getHours() % 12;
        }
        var H = p_value.getHours();
        var m = p_value.getMinutes();
        var s = p_value.getSeconds();

        var yyyy = p_value.getFullYear();
        var MM = Number.format(M, "00");
        var dd = Number.format(d, "00");
        var hh = Number.format(h, "00");
        var HH = Number.format(H, "00");
        var mm = Number.format(m, "00");
        var ss = Number.format(s, "00");

        text = text.replace("yyyy", yyyy).replace("MM", MM).replace("dd", dd);
        text = text.replace("HH", HH).replace("hh", hh).replace("mm", mm).replace("ss", ss);
        text = text.replace("yy", yy).replace("M", M).replace("d", d);
        text = text.replace("H", H).replace("h", h).replace("m", m).replace("s", s);

        return text;
    }
    else
    {
        return "";
    }
};

Date.getDaysInMonth = function(p_year, p_month)
{
    switch (p_month + 1)
    {
        case 2:
            if ((p_year % 400 === 0) || (p_year % 4 === 0) && (p_year % 100 !== 0))
            {
                return 29;
            }
            else
            {
                return 28;
            }
            break;
        case 1:
        case 3:
        case 5:
        case 7:
        case 8:
        case 10:
        case 12:
            return 31;
        default:
            return 30;
    }
};

Date.prototype.addMilliSecond = function(p_ms)
{
    var ms = this * 1 + p_ms;
    var date = new Date(ms);
    return date;
};

Date.prototype.addSeconds = function(p_seconds)
{
    var ms = this * 1 + p_seconds * 1000;
    var date = new Date(ms);
    return date;
};

Date.prototype.addMinutes = function(p_minutes)
{
    return this.addSeconds(p_minutes * 60);
};

Date.prototype.addHours = function(p_hours)
{
    return this.addMinutes(p_hours * 60);
};

Date.prototype.addDays = function(p_days)
{
    return this.addHours(p_days * 24);
};

Date.prototype.addWeeks = function(p_weeks)
{
    return this.addDays(p_weeks * 7);
};

Date.prototype.addMonths = function(p_months)
{
    var copy = new Date(this * 1);
    var months = copy.getMonth() + 1 + p_months;

    var years = Math.floor(months / 12);

    var year = copy.getFullYear() + years;
    var month = Math.abs(years * 12 - months) % 12;
    var date = copy.getDate();
    var daysInMonth = Date.getDaysInMonth(year, month - 1);

    if (date > daysInMonth)
    {
        date = daysInMonth;
    }

    copy.setDate(1);
    copy.setFullYear(year);
    copy.setMonth(month - 1);
    copy.setDate(date);

    return copy;
};

Date.prototype.addYears = function(p_years)
{
    var copy = this.addMonths(p_years * 12);
    return copy;
};

Date.prototype.equals = function(p_date)
{
    return this.compare(p_date) === 0;
};

Date.prototype.compare = function(p_date)
{
    if (isEmpty(p_date))
    {
        return -1;
    }

    if (p_date.constructor !== Date)
    {
        return -1;
    }

    return p_date * 1 - this * 1;
};

Date.prototype.clone = function()
{
    var date = new Date(this * 1);
    return date;
};

// =====================================================================
// Array
// =====================================================================

Array.prototype.enqueue = function(item)
{
    this.push(item);
};

Array.prototype.dequeue = function()
{
    if (this.length === 0)
    {
        return undefined;
    }

    var item = this[0];
    this.removeAt(0);
    return item;
};

Array.prototype.peek = function()
{
    return (this.length > 0 ? this[0] : undefined);
};

Array.prototype.indexOf = function(p_item)
{
    for (var i = 0; i < this.length; i++)
    {
        if (this[i] === p_item)
        {
            return i;
        }
    }
    return -1;
};

Array.prototype.first = function(i)
{
    if (this.length === 0)
    {
        return undefined;
    }

    if (typeof (i) !== "number")
    {
        i = 0;
    }
    if (i >= this.length)
    {
        i = this.length - 1;
    }
    return this[i];
};

Array.prototype.last = function(i)
{
    if (this.length === 0)
    {
        return undefined;
    }

    if (typeof (i) !== "number")
    {
        i = 0;
    }
    if (this.length - i - 1 >= 0)
    {
        return this[this.length - i - 1];
    }
    else
    {
        return this[0];
    }
};

Array.prototype.contains = function(p_item)
{
    return this.indexOf(p_item) !== -1;
};

Array.prototype.add = function(p_item)
{
    this[this.length] = p_item;
    return p_item;
};

Array.prototype.addAll = function(p_items)
{
    if (isArray(p_items))
    {
        var array = this;
        p_items.forEach(function(p_item)
        {
            array.push(p_item);
        });
    }
};

Array.prototype.insert = function(p_startIndex, p_item)
{
    return this.splice(p_startIndex, 0, p_item);
};

Array.prototype.insertBefore = function(p_item, p_beforeItem)
{
    var index = this.indexOf(p_beforeItem);
    if (index === -1)
    {
        return false;
    }

    this.insert(index, p_item);
    return true;
};

Array.prototype.insertAfter = function(p_item, p_afterItem)
{
    var index = this.indexOf(p_afterItem);
    if (index === -1)
    {
        return false;
    }
    else if (index === this.length)
    {
        this.add(p_item);
        return true;
    }
    else
    {
        this.insert(index + 1, p_item);
        return true;
    }
};

Array.prototype.remove = function(p_item)
{
    return this.removeAt(this.indexOf(p_item));
};

Array.prototype.removeAt = function(p_index)
{
    if (p_index >= 0 && p_index < this.length)
    {
        this.splice(p_index, 1);
        return true;
    }
    else
    {
        return false;
    }
};

Array.prototype.removeLast = function(p_index)
{
    if (this.length === 0)
    {
        return;
    }

    if (typeof (p_index) !== "number")
    {
        p_index = 0;
    }

    var i = this.length - p_index - 1;
    this.removeAt(i);
};

Array.prototype.clear = function()
{
    if (this.length > 0)
    {
        this.splice(0, this.length);
    }
};

Array.prototype.clone = function()
{
    return this.slice(0, this.length);
};

Array.prototype.swap = function(p_item1, p_item2)
{
    var index1 = this.indexOf(p_item1);
    var index2 = this.indexOf(p_item2);

    this[index1] = p_item2;
    this[index2] = p_item1;
};

Array.prototype.find = function(p_judgeFunction, p_context)
{
    if (isFunction(p_judgeFunction))
    {
        for (var i = 0; i < this.length; i++)
        {
            var item = this[i];
            var value = p_judgeFunction(item, i, p_context);
            if (value)
            {
                return item;
            }
        }
        return null;
    }
    else
    {
        return null;
    }
};

Array.prototype.findLast = function(p_judgeFunction, p_context)
{
    if (isFunction(p_judgeFunction))
    {
        for (var i = this.length - 1; i >= 0; i++)
        {
            var item = this[i];
            var value = p_judgeFunction(item, i, p_context);
            if (value)
            {
                return item;
            }
        }
        return null;
    }
    else
    {
        return null;
    }
};

Array.prototype.min = function(p_iterator, p_context)
{
    var min;
    for (var i = 0; i < this.length; i++)
    {
        var value;
        if (isFunction(p_iterator))
        {
            value = p_iterator(this[i], i, p_context);
        }
        else
        {
            value = this[i];
        }

        if (min === undefined)
        {
            min = value;
        }
        else
        {
            if (value < min)
            {
                min = value;
            }
        }
    }
    return min;
};

Array.prototype.max = function(p_iterator, p_context)
{
    var max;
    for (var i = 0; i < this.length; i++)
    {
        var value;
        if (isFunction(p_iterator))
        {
            value = p_iterator(this[i], i, p_context);
        }
        else
        {
            value = this[i];
        }

        if (max === undefined)
        {
            max = value;
        }
        else
        {
            if (value > max)
            {
                max = value;
            }
        }
    }
    return max;
};

// =====================================================================
// Object
// =====================================================================

// =====================================================================
// Function
// =====================================================================

