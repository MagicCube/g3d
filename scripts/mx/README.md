# MXFramework
MagicCube MXFramework is a lightweight Object-Oriented JavaScript framework.

# Quick Examples
Like many other JavaScript frameworks, MXFramework has its own way to define namespace, class and component.
In this quick example, we will demonstrate how to define classes using MXFramework.

Firstly, let's create a new class named Animal.
```javascript
scripts/my/namespace/Animal.js

/* 
 * Define a namespace.
 */
$ns("my.namespace");

/**
 * Define a class which extends MXComponent.
 * A MXComponent is a very popular super class.
 * Actually, in this case, we can also use MXObject instead.
 * MXObject is the super class of MXComponent.
 */
my.namespace.Animal = function()
{
	/**
	 * In MXFramework, it always use 'me' instead of 'this'.
	 */
	var me = $extend(MXComponent);
	/**
	 * 'base' is almost the same as 'super' in Java.
	 */
	var base = {};


	/**
	 * Define a public field.
	 * Every public member should under 'me'.
	 */
	me.name = null;

	/**
	 * Define a private field.
	 * The names of a private members always start with an underline.
	 */
	 var _something = null;
	 var _someVariable = 0;


	/**
	 * Override a public method.
	 * 'init' method will be automatically called immediately after the instance is created.
	 * Even though, you can also set the 'autoInit' field to false if you need lazy intialization.
	 */
	base.init = me.init;
	me.init = function(p_options)
	{
		base.init(p_options);
	};


	/**
	 * Define a public function.
	 */
	me.sayHi = function()
	{
		if (_canSayHi())
		{
			/* 
			  String.format provides ability to substitute string with JSON object or array.
			  In MXFramework you can use the following format methods.
			  - String.format    String.format("Hi, {name}!", { name: "Henry" }); String.format("Hi, {0}", [ "Henry" ])
			  - Date.format      Date.format(new Date(), "yyyy-MM-dd HH:mm:ss"); Date.format(new Date(), "yy年M月d日");
			  - Number.format    Number.format(12.53212, "0.00"); Number.format(123, "00000000");
			 */
			return String.format("Hi, I'm a {name}", { name: me.name });
		}
	};


	/**
	 * Define a private function.
	 */
	function _canSayHi()
	{
		// MXFramework has a series of methods for type assertions.
		return isString(me.name);
	}


	/**
	 * This is the end of class.
	 */
	return me.endOfClass(arguments);
};
```









Let's have a class inherits from Animal.

```javascript
scripts/your/namespace/Cat.js

$ns("your.namespace");

// Import the super class.
$import("my.namespace.Animal");

/**
 * Cat inherits from Animal.
 */
your.namespace.Cat = function()
{
	var me = $extend(my.namespace.Animal);
	/*
	 * Change the initial value of name.
	 */
	me.name = "Cat";
	var base = {};

	me.nickName = "kitty";

	base.init = me.init;
	me.init = function(p_options)
	{
		base.init(p_options);
		if (isEmptyString(me.nickName) && isString(me.name))
		{
			me.nickName = me.name;
		}
	};

	/**
	 * Override 'sayHi' method.
	 */
	base.sayHi = me.sayHi;
	me.sayHi = function()
	{
		// $format is a shortcut to String.format, Date.format and Number.format.
		return base.sayHi() + $format(" You can call me {0}", [ me.nickName ]);
	};

	return me.endOfClass(arguments);
};
```







Now we need to instantialize the class.
```JavaScript
// Import Cat class. The Animal class will be automatically imported with Cat.
$import("your.namespace.Cat");

// Create a new instance with default values.
var cat = new your.namespace.Cat();
alert(cat.sayHi());

// Create a new instance with initial values using JSON.
// In MXFramework, class only accepts JSON object as constructure parameter.
var tomCat = new your.namespace.Cat({
    nickName: "Tom"
});
alert(tomCat.sayHi());
```

Finally, build the code with mxbuild or mxtool to generate min.js and min.css
```
jar mxbuild.jar your;my
```


# Source Code Repository
The source is available for download from GitHub
https://github.com/MagicCube/mxframework-core

# Documents
For documents, see https://github.com/MagicCube/mxframework-core/wiki

# Related Projects
* [mxframework-node](https://github.com/MagicCube/mxframework-node) - MagicCube MXFramework for Node.js
* [mxtool](https://github.com/MagicCube/mxtool) - Development tools for MagicCube MXFramework
* [g3d](https://github.com/MagicCube/g3d) - A web GIS library for 3D visualization using WebGL technology
