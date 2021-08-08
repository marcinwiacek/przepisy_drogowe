/*
 *
 * This software is licensed under the MIT licence (as defined by the OSI at
 * http://www.opensource.org/licenses/mit-license.php)
 * 
 * ***************************************************************************
 * Copyright (C) 2011 by Intel Corporation Ltd.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software" ),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 */

// Base class for widgets that need the following features:
//
// I. HTML prototype loading
//
// This class provides HTML prototype loading for widgets. That is, the widget implementation specifies its HTML portions
// in one continuous HTML snippet, and it optionally provides an object containing selectors into the various parts of the
// HTML snippet. This widget loads the HTML snippet into a jQuery object, and optionally assigns jQuery objects to each of
// the selectors in the optionally provided object.
//
// To use this functionality you can either derive from this class, or you can call its prototype's gtype method.
//
// 1. Widgets deriving from this class should define _htmlProto as part of their prototype declaration. _htmlProto looks like
// this:
//
// _htmlProto: {
//     source: string|jQuery object (optional) default: string - The name of the widget
//     ui: {
//         uiElement1: "#ui-element-1-selector",
//         uiElement2: "#ui-element-2-selector",
//         ...
//         subElement: {
//             subElement1: "#sub-element-1-selector",
//             subElement2: "#sub-element-2-selector",
//             ...
//         }
//         ...
//     }
// }
//
// If neither 'source' nor 'ui' are defined, you must still include an empty _htmlProto key (_htmlProto: {}) to indicate
// that you wish to make use of this feature. This will cause a prototype HTML file named after your widget to be loaded.
// The loaded prototype will be placed into your widget's prototype's _protoHtml.source key.
//
// If 'source' is defined as a string, it is the name of the widget (including namespace). This is the default. If your
// widget's HTML prototype is loaded via AJAX and the name of the AJAX file is different from the name of your widget
// (that is, it is not "<widgetName>.prototype.html", then you should explicitly define 'source' as:
//
// If you wish to load HTML prototypes via AJAX, modify the getProtoPath() function defined below to reflect the directory
// structure holding your widget HTML prototypes.
//
// source: "alternateWidgetName"
//
// If AJAX loading fails, source is set to a jQuery object containing a div with an error message. You can check whether
// loading failed via the jQuery object's jqmData( "tizen.widgetex.ajax.fail" ) data item. If false, then the jQuery object
// is the actual prototype loaded via AJAX or present inline. Otherwise, the jQuery object is the error message div.
//
// If 'source' is defined as a jQuery object, it is considered already loaded.
//
// if 'ui' is defined inside _htmlProto, It is assumed to be an object such that every one of its keys is either a string,
// or another object with the same properties as itself.
//
// When a widget is instantiated, the HTML prototype is loaded if not already present in the prototype. If 'ui' is present
// inside _htmlProto, the prototype is cloned. Then, a new structure is created based on 'ui' with each selector replaced
// by a jQuery object containing the results of performing .find() on the prototype's clone with the filter set to the
// value of the string. In the special case where the selector starts with a '#', the ID is removed from the element after
// it is assigned into the structure being created. This structure is then made accessible from the widget instance via
// the '_ui' key (i.e., this._ui).
//
// 2. Use the loadPrototype method when your widget does not derive from $.tizen.widgetex:
// Add _htmlProto to your widget's prototype as described above. Then, in your widget's _create() method, call
// loadPrototype in the following manner:
//
// $.tizen.widgetex.loadPrototype.call(this, "namespace.widgetName" );
//
// Thereafter, you may use the HTML prototype from your widget's prototype or, if you have specified a 'ui' key in your
// _htmlProto key, you may use this._ui from your widget instance.
//
// II. realize method
//
// When a widget is created, some of its properties cannot be set immediately, because they depend on the widths/heights
// of its constituent elements. They can only be calculated when the page containing the widget is made visible via the
// "pageshow" event, because widths/heights always evaluate to 0 when retrieved from a widget that is not visible. When
// you inherit from widgetex, you can add a "_realize" function to your prototype. This function will be called once right
// after _create() if the element that anchors your widget is on a visible page. Otherwise, it will be called when the
// page to which the widget belongs emits the "pageshow" event.
//
// NB: If your widget is inside a container which is itself not visible, such as an expandable or a collapsible, your
// widget will remain hidden even though "pageshow" is fired and therefore _realize is called. In this case, widths and
// heights will be unreliable even during _realize.
//
// III. systematic option handling
//
// If a widget has lots of options, the _setOption function can become a long switch for setting each recognized option.
// It is also tempting to allow options to determine the way a widget is created, by basing decisions on various options
// during _create(). Often, the actions based on option values in _create() are the same as those in _setOption. To avoid
// such code duplication, this class calls _setOption once for each option after _create() has completed.
//
// Furthermore, to avoid writing long switches in a widget's _setOption method, this class implements _setOption in such
// a way that, for any given option (e.g. "myOption" ), _setOption looks for a method _setMyOption in the widget's
// implementation, and if found, calls the method with the value of the option.
//
// If your widget does not inherit from widgetex, you can still use widgetex' systematic option handling:
// 1. define the _setOption method for your widget as follows:
//      _setOption: $.tizen.widgetex.prototype._setOption
// 2. Call this._setOptions(this.options) from your widget's _create() function.
// 3. As with widgetex-derived widgets, implement a corresponding _setMyOptionName function for each option myOptionName
// you wish to handle.
//
// IV. systematic value handling for input elements
//
// If your widget happens to be constructed from an <input> element, you have to handle the "value" attribute specially,
// and you have to emit the "change" signal whenever it changes, in addition to your widget's normal signals and option
// changes. With widgetex, you can assign one of your widget's "data-*" properties to be synchronized to the "value"
// property whenever your widget is constructed onto an <input> element. To do this, define, in your prototype:
//
// _value: {
//      attr: "data-my-attribute",
//      signal: "signal-to-emit"
// }
//
// Then, call this._setValue(newValue) whenever you wish to set the value for your widget. This will set the data-*
// attribute, emit the custom signal (if set) with the new value as its parameter, and, if the widget is based on an
// <input> element, it will also set the "value" attribute and emit the "change" signal.
//
// "attr" is required if you choose to define "_value", and identifies the data-attribute to set in addition to "value",
// if your widget's element is an input.
// "signal" is optional, and will be emitted when setting the data-attribute via this._setValue(newValue).
//
// If your widget does not derive from widgetex, you can still define "_value" as described above and call
// $.tizen.widgetex.setValue(widget, newValue).
//
// V. Systematic enabled/disabled handling for input elements
//
// widgetex implements _setDisabled which will disable the input associated with this widget, if any. Thus, if you derive
// from widgetex and you plan on implementing the disabled state, you should chain up to
// $.tizen.widgetex.prototype._setDisabled(value), rather than $.Widget.prototype._setOption( "disabled", value).

(function ($, undefined) {

// Framework-specific HTML prototype path for AJAX loads
	function getProtoPath() {
		var theScriptTag = $( "script[data-framework-version][data-framework-root][data-framework-theme]" );

		return (theScriptTag.attr( "data-framework-root" ) + "/" +
				theScriptTag.attr( "data-framework-version" ) + "/themes/" +
				theScriptTag.attr( "data-framework-theme" ) + "/proto-html" );
	}

	$.widget( "tizen.widgetex", $.mobile.widget, {
		_createWidget: function () {
			$.tizen.widgetex.loadPrototype.call( this, this.namespace + "." + this.widgetName );
			$.mobile.widget.prototype._createWidget.apply( this, arguments );
		},

		_init: function () {
			// TODO THIS IS TEMPORARY PATCH TO AVOID CTXPOPUP PAGE CRASH
			if ( this.element === undefined ) {
				return;
			}

			var page = this.element.closest( ".ui-page" ),
				self = this,
				myOptions = {};

			if ( page.is( ":visible" ) ) {
				this._realize();
			} else {
				page.bind( "pageshow", function () { self._realize(); } );
			}

			$.extend( myOptions, this.options );

			this.options = {};

			this._setOptions( myOptions );
		},

		_getCreateOptions: function () {
			// if we're dealing with an <input> element, value takes precedence over corresponding data-* attribute, if a
			// mapping has been established via this._value. So, assign the value to the data-* attribute, so that it may
			// then be assigned to this.options in the superclass' _getCreateOptions

			if (this.element.is( "input" ) && this._value !== undefined) {
				var theValue =
					( ( this.element.attr( "type" ) === "checkbox" || this.element.attr( "type" ) === "radio" )
							? this.element.is( ":checked" )
									: this.element.is( "[value]" )
									? this.element.attr( "value" )
											: undefined);

				if ( theValue != undefined ) {
					this.element.attr( this._value.attr, theValue );
				}
			}

			return $.mobile.widget.prototype._getCreateOptions.apply( this, arguments );
		},

		_setOption: function ( key, value ) {
			var setter = "_set" + key.replace(/^[a-z]/, function (c) { return c.toUpperCase(); } );

			if ( this[setter] !== undefined ) {
				this[setter]( value );
			} else {
				$.mobile.widget.prototype._setOption.apply( this, arguments );
			}
		},

		_setDisabled: function ( value ) {
			$.Widget.prototype._setOption.call( this, "disabled", value );
			if ( this.element.is( "input" ) ) {
				this.element.attr( "disabled", value );
			}
		},

		_setValue: function ( newValue ) {
			$.tizen.widgetex.setValue( this, newValue );
		},

		_realize: function () {}
	} );

	$.tizen.widgetex.setValue = function ( widget, newValue ) {
		if ( widget._value !== undefined ) {
			var valueString = ( widget._value.makeString ? widget._value.makeString(newValue) : newValue ),
				inputType;

			widget.element.attr( widget._value.attr, valueString );
			if ( widget._value.signal !== undefined ) {
				widget.element.triggerHandler( widget._value.signal, newValue );
			}

			if ( widget.element.is( "input" ) ) {
				inputType = widget.element.attr( "type" );

				// Special handling for checkboxes and radio buttons, where the presence of the "checked" attribute is really
				// the value
				if ( inputType === "checkbox" || inputType === "radio" ) {
					if ( newValue ) {
						widget.element.attr( "checked", true );
					} else {
						widget.element.removeAttr( "checked" );
					}
				} else {
					widget.element.attr( "value", valueString );
				}

				widget.element.trigger( "change" );
			}
		}
	};

	$.tizen.widgetex.assignElements = function (proto, obj) {
		var ret = {},
			key;

		for ( key in obj ) {
			if ( ( typeof obj[key] ) === "string" ) {
				ret[key] = proto.find( obj[key] );
				if ( obj[key].match(/^#/) ) {
					ret[key].removeAttr( "id" );
				}
			} else {
				if ( (typeof obj[key]) === "object" ) {
					ret[key] = $.tizen.widgetex.assignElements( proto, obj[key] );
				}
			}
		}

		return ret;
	};

	$.tizen.widgetex.loadPrototype = function ( widget, ui ) {
		var ar = widget.split( "." ),
			namespace,
			widgetName,
			htmlProto,
			protoPath;

		if ( ar.length == 2 ) {
			namespace = ar[0];
			widgetName = ar[1];
			htmlProto = $( "<div></div>" )
						.text( "Failed to load proto for widget " + namespace + "." + widgetName + "!" )
						.css( {background: "red", color: "blue", border: "1px solid black"} )
						.jqmData( "tizen.widgetex.ajax.fail", true );

			// If htmlProto is defined
			if ( $[namespace][widgetName].prototype._htmlProto !== undefined ) {
				// If no source is defined, use the widget name
				if ( $[namespace][widgetName].prototype._htmlProto.source === undefined ) {
					$[namespace][widgetName].prototype._htmlProto.source = widgetName;
				}

				// Load the HTML prototype via AJAX if not defined inline
				if ( typeof $[namespace][widgetName].prototype._htmlProto.source === "string" ) {
					// Establish the path for the proto file
					widget = $[namespace][widgetName].prototype._htmlProto.source;
					protoPath = getProtoPath();

					// Make the AJAX call
					$.ajax( {
						url: protoPath + "/" + widget + ".prototype.html",
						async: false,
						dataType: "html"
					}).success( function (data, textStatus, jqXHR ) {
						htmlProto = $( "<div></div>" ).html(data).jqmData( "tizen.widgetex.ajax.fail", false );
					} );

					// Assign the HTML proto to the widget prototype
					$[namespace][widgetName].prototype._htmlProto.source = htmlProto;
				} else { // Otherwise, use the inline definition
					// AJAX loading has trivially succeeded, since there was no AJAX loading at all
					$[namespace][widgetName].prototype._htmlProto.source.jqmData( "tizen.widgetex.ajax.fail", false );
					htmlProto = $[namespace][widgetName].prototype._htmlProto.source;
				}

				// If there's a "ui" portion in the HTML proto, copy it over to this instance, and
				// replace the selectors with the selected elements from a copy of the HTML prototype
				if ( $[namespace][widgetName].prototype._htmlProto.ui !== undefined ) {
					// Assign the relevant parts of the proto
					$.extend( this, {
						_ui: $.tizen.widgetex.assignElements( htmlProto.clone(), $[namespace][widgetName].prototype._htmlProto.ui )
					});
				}
			}
		}
	};

}( jQuery ) );
/*
 *
 * This software is licensed under the MIT licence (as defined by the OSI at
 * http://www.opensource.org/licenses/mit-license.php)
 *
 * ***************************************************************************
 * Copyright (C) 2011 by Intel Corporation Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software" ),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 */

(function ( $, undefined ) {

	$.widget( "tizen.colorwidget", $.tizen.widgetex, {
		options: {
			color: "#ff0972"
		},

		_value: {
			attr: "data-" + ( $.mobile.ns || "" ) + "color",
			signal: "colorchanged"
		},

		_getElementColor: function ( el, cssProp ) {
			return el.jqmData( "clr" );
		},

		_setElementColor: function ( el, hsl, cssProp ) {
			var clrlib = $.tizen.colorwidget.clrlib,
				clr = clrlib.RGBToHTML( clrlib.HSLToRGB( hsl ) ),
				dclr = clrlib.RGBToHTML( clrlib.HSLToGray( hsl ) );

			el.jqmData( "clr", clr );
			el.jqmData( "dclr", dclr );
			el.jqmData( "cssProp", cssProp );
			el.attr( "data-" + ( $.mobile.ns || "" ) + "has-dclr", true );
			el.css( cssProp, this.options.disabled ? dclr : clr );

			return { clr: clr, dclr: dclr };
		},

		_displayDisabledState: function ( toplevel ) {
			var self = this,
				sel = ":jqmData(has-dclr='true')",
				dst = toplevel.is( sel ) ? toplevel : $([]),
				el;

			dst.add( toplevel.find( sel ) )
				.each( function () {
					el = $( this );
					el.css( el.jqmData( "cssProp" ), el.jqmData( self.options.disabled ? "dclr" : "clr" ) );
				} );
		},

		_setColor: function ( value ) {
			var currentValue = ( this.options.color );

			value = value.match(/#[0-9A-Fa-f]{6}/)
				? value
					: currentValue.match(/#[0-9A-Fa-f]{6}/)
					? currentValue
							: $.tizen.colorwidget.prototype.options.color;

			if ( this.options.color !== value ) {
				this.options.color = value;
				this._setValue( value );
				return true;
			}
			return false;
		}
	} );

	$.tizen.colorwidget.clrlib = {
		nearestInt: function ( val ) {
			var theFloor = Math.floor( val );

			return ( ( ( val - theFloor ) > 0.5 ) ? ( theFloor + 1 ) : theFloor );
		},

		// Converts html color string to rgb array.
		//
		// Input: string clr_str, where
		// clr_str is of the form "#aabbcc"
		//
		// Returns: [ r, g, b ], where
		// r is in [0, 1]
		// g is in [0, 1]
		// b is in [0, 1]
		HTMLToRGB: function ( clr_str ) {
			clr_str = ( ( '#' == clr_str.charAt( 0 ) ) ? clr_str.substring( 1 ) : clr_str );

			return [ parseInt(clr_str.substring(0, 2), 16) / 255.0,
					parseInt(clr_str.substring(2, 4), 16) / 255.0,
					parseInt(clr_str.substring(4, 6), 16) / 255.0 ];
		},

		// Converts rgb array to html color string.
		//
		// Input: [ r, g, b ], where
		// r is in [0, 1]
		// g is in [0, 1]
		// b is in [0, 1]
		//
		// Returns: string of the form "#aabbcc"
		RGBToHTML: function ( rgb ) {
			var ret = "#", val, theFloor,
				Nix;
			for ( Nix in rgb ) {
				val = rgb[Nix] * 255;
				theFloor = Math.floor( val );
				val = ( ( val - theFloor > 0.5 ) ? ( theFloor + 1 ) : theFloor );
				ret = ret + ( ( ( val < 16 ) ? "0" : "" ) + ( val & 0xff ).toString( 16 ) );
			}

			return ret;
		},

		// Converts hsl to rgb.
		//
		// From http://130.113.54.154/~monger/hsl-rgb.html
		//
		// Input: [ h, s, l ], where
		// h is in [0, 360]
		// s is in [0,   1]
		// l is in [0,   1]
		//
		// Returns: [ r, g, b ], where
		// r is in [0, 1]
		// g is in [0, 1]
		// b is in [0, 1]
		HSLToRGB: function ( hsl ) {
			var h = hsl[0] / 360.0, s = hsl[1], l = hsl[2],
				temp1,
				temp2,
				temp3,
				ret;

			if ( 0 === s ) {
				return [ l, l, l ];
			}

			temp2 = ( ( l < 0.5 )
					? l * ( 1.0 + s )
					: l + s - l * s);

			temp1 = 2.0 * l - temp2;
			temp3 = {
				r: h + 1.0 / 3.0,
				g: h,
				b: h - 1.0 / 3.0
			};

			temp3.r = ( ( temp3.r < 0 ) ? ( temp3.r + 1.0 ) : ( ( temp3.r > 1 ) ? ( temp3.r - 1.0 ) : temp3.r ) );
			temp3.g = ( ( temp3.g < 0 ) ? ( temp3.g + 1.0 ) : ( ( temp3.g > 1 ) ? ( temp3.g - 1.0 ) : temp3.g ) );
			temp3.b = ( ( temp3.b < 0 ) ? ( temp3.b + 1.0 ) : ( ( temp3.b > 1 ) ? ( temp3.b - 1.0 ) : temp3.b ) );

			ret = [( ( ( 6.0 * temp3.r ) < 1 ) ? ( temp1 + ( temp2 - temp1 ) * 6.0 * temp3.r ) :
					( ( ( 2.0 * temp3.r ) < 1 ) ? temp2 :
							( ( ( 3.0 * temp3.r ) < 2 ) ? ( temp1 + ( temp2 - temp1 ) * ( ( 2.0 / 3.0 ) - temp3.r ) * 6.0 ) :
									temp1) ) ),
						( ( ( 6.0 * temp3.g ) < 1) ? ( temp1 + ( temp2 - temp1 ) * 6.0 * temp3.g ) :
							( ( ( 2.0 * temp3.g ) < 1 ) ? temp2 :
								( ( ( 3.0 * temp3.g ) < 2 ) ? ( temp1 + ( temp2 - temp1 ) * ( ( 2.0 / 3.0 ) - temp3.g ) * 6.0 ) :
										temp1 ) ) ),
									( ( ( 6.0 * temp3.b ) < 1 ) ? ( temp1 + ( temp2 - temp1 ) * 6.0 * temp3.b ) :
										( ( ( 2.0 * temp3.b ) < 1 ) ? temp2 :
											( ( ( 3.0 * temp3.b ) < 2 ) ? ( temp1 + ( temp2 - temp1 ) * ( ( 2.0 / 3.0 ) - temp3.b ) * 6.0 ) :
												temp1 ) ) )];

			return ret;
		},

		// Converts hsv to rgb.
		//
		// Input: [ h, s, v ], where
		// h is in [0, 360]
		// s is in [0,   1]
		// v is in [0,   1]
		//
		// Returns: [ r, g, b ], where
		// r is in [0, 1]
		// g is in [0, 1]
		// b is in [0, 1]
		HSVToRGB: function ( hsv ) {
			return $.tizen.colorwidget.clrlib.HSLToRGB( $.tizen.colorwidget.clrlib.HSVToHSL( hsv ) );
		},

		// Converts rgb to hsv.
		//
		// from http://coecsl.ece.illinois.edu/ge423/spring05/group8/FinalProject/HSV_writeup.pdf
		//
		// Input: [ r, g, b ], where
		// r is in [0,   1]
		// g is in [0,   1]
		// b is in [0,   1]
		//
		// Returns: [ h, s, v ], where
		// h is in [0, 360]
		// s is in [0,   1]
		// v is in [0,   1]
		RGBToHSV: function ( rgb ) {
			var min, max, delta, h, s, v, r = rgb[0], g = rgb[1], b = rgb[2];

			min = Math.min( r, Math.min( g, b ) );
			max = Math.max( r, Math.max( g, b ) );
			delta = max - min;

			h = 0;
			s = 0;
			v = max;

			if ( delta > 0.00001 ) {
				s = delta / max;

				if ( r === max ) {
					h = ( g - b ) / delta;
				} else {
					if ( g === max ) {
						h = 2 + ( b - r ) / delta;
					} else {
						h = 4 + ( r - g ) / delta;
					}
				}
				h *= 60;

				if ( h < 0 ) {
					h += 360;
				}
			}

			return [h, s, v];
		},

		// Converts hsv to hsl.
		//
		// Input: [ h, s, v ], where
		// h is in [0, 360]
		// s is in [0,   1]
		// v is in [0,   1]
		//
		// Returns: [ h, s, l ], where
		// h is in [0, 360]
		// s is in [0,   1]
		// l is in [0,   1]
		HSVToHSL: function ( hsv ) {
			var max = hsv[2],
				delta = hsv[1] * max,
				min = max - delta,
				sum = max + min,
				half_sum = sum / 2,
				s_divisor = ( ( half_sum < 0.5 ) ? sum : ( 2 - max - min ) );

			return [ hsv[0], ( ( 0 == s_divisor ) ? 0 : ( delta / s_divisor ) ), half_sum ];
		},

		// Converts rgb to hsl
		//
		// Input: [ r, g, b ], where
		// r is in [0,   1]
		// g is in [0,   1]
		// b is in [0,   1]
		//
		// Returns: [ h, s, l ], where
		// h is in [0, 360]
		// s is in [0,   1]
		// l is in [0,   1]
		RGBToHSL: function ( rgb ) {
			return $.tizen.colorwidget.clrlib.HSVToHSL( $.tizen.colorwidget.clrlib.RGBToHSV( rgb ) );
		},

		// Converts hsl to grayscale
		// Full-saturation magic grayscale values were taken from the Gimp
		//
		// Input: [ h, s, l ], where
		// h is in [0, 360]
		// s is in [0,   1]
		// l is in [0,   1]
		//
		// Returns: [ r, g, b ], where
		// r is in [0,   1]
		// g is in [0,   1]
		// b is in [0,   1]
		HSLToGray: function ( hsl ) {
			var intrinsic_vals = [0.211764706, 0.929411765, 0.71372549, 0.788235294, 0.070588235, 0.28627451, 0.211764706],
				idx = Math.floor(hsl[0] / 60),
				lowerHalfPercent,
				upperHalfPercent,
				begVal,
				endVal,
				val;

			// Find hue interval
			begVal = intrinsic_vals[idx];
			endVal = intrinsic_vals[idx + 1];

			// Adjust for lum
			if ( hsl[2] < 0.5 ) {
				lowerHalfPercent = hsl[2] * 2;
				begVal *= lowerHalfPercent;
				endVal *= lowerHalfPercent;
			} else {
				upperHalfPercent = ( hsl[2] - 0.5 ) * 2;
				begVal += ( 1.0 - begVal ) * upperHalfPercent;
				endVal += ( 1.0 - endVal ) * upperHalfPercent;
			}

			// This is the gray value at full sat, whereas hsl[2] is the gray value at 0 sat.
			val = begVal + ( ( endVal - begVal ) * ( hsl[0] - ( idx * 60 ) ) ) / 60;

			// Get value at hsl[1]
			val = val + ( hsl[2] - val ) * ( 1.0 - hsl[1] );

			return [val, val, val];
		}
	};

}( jQuery ));
(function ( $, undefined ) {

	$.widget( "tizen.huegradient", $.tizen.widgetex, {
		_create: function () {
			this.element.addClass( "tizen-huegradient" );
		},

		// Crutches for IE: it is incapable of multi-stop gradients, so add multiple divs inside the given div, each with a
		// two-point gradient
		_IEGradient: function ( div, disabled ) {
			var rainbow = disabled
				? ["#363636", "#ededed", "#b6b6b6", "#c9c9c9", "#121212", "#494949", "#363636"]
				: ["#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ff0000"],
				Nix;

			for (Nix = 0 ; Nix < 6 ; Nix++ ) {
				$( "<div></div>" )
					.css( {
						position: "absolute",
						width: ( 100 / 6 ) + "%",
						height: "100%",
						left: ( Nix * 100 / 6 ) + "%",
						top: "0px",
						filter: "progid:DXImageTransform.Microsoft.gradient (startColorstr='" + rainbow[Nix] + "', endColorstr='" + rainbow[Nix + 1] + "', GradientType = 1)"
					} )
					.appendTo( div );
			}
		},

		_setDisabled: function ( value ) {
			$.Widget.prototype._setOption.call( this, "disabled", value );
			if ( $.mobile.browser.ie ) {
				this._IEGradient( this.element.empty(), value );
			}
		}
	} );
}( jQuery ) );
( function ( $, undefined ) {

	$.widget( "todons.colorwidget", $.mobile.widget, {
		options: {
			color: "#ff0972"
		},

		_create: function () {
			$.extend ( this, {
				isInput: this.element.is( "input" )
			} );

			/* "value", if present, takes precedence over "data-color" */
			if ( this.isInput ) {
				if ( this.element.attr( "value" ).match(/#[0-9A-Fa-f]{6}/) ) {
					this.element.attr( "data-color", this.element.attr( "value" ) );
				}
			}

			$.mobile.todons.parseOptions( this, true );
		},

		_setOption: function ( key, value, unconditional ) {
			if ( undefined === unconditional ) {
				unconditional = false;
			}

			if ( key === "color" ) {
				this._setColor(value, unconditional);
			}
		},

		_setColor: function ( value, unconditional ) {
			if ( value.match(/#[0-9A-Fa-f]{6}/) && ( value != this.options.color || unconditional ) ) {
				this.options.color = value;
				this.element.attr( "data-color", value );

				if ( this.isInput ) {
					this.element.attr( "value", value );
				}

				this.element.triggerHandler( "colorchanged", value );
				return true;
			}
			return false;
		}
	} );

}( jQuery ) );
/*
 * jQuery Mobile Widget @VERSION - listview autodividers
 *
 * This software is licensed under the MIT licence (as defined by the OSI at
 * http://www.opensource.org/licenses/mit-license.php)
 * 
 * ***************************************************************************
 * Copyright (c) 2011 by Intel Corporation Ltd.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 * Authors: Elliot Smith <elliot.smith@intel.com>
 */

// Applies dividers automatically to a listview, using link text
// (for link lists) or text (for readonly lists) as the basis for the
// divider text.
//
// Apply using autodividers({type: 'X'}) on a <ul> with
// data-role="listview", or with data-autodividers="true", where X
// is the type of divider to create. The default divider type is 'alpha',
// meaning first characters of list item text, upper-cased.
//
// The element used to derive the text for the auto dividers defaults
// to the first link inside the li; failing that, the text directly inside
// the li element is used. This can be overridden with the
// data-autodividers-selector attribute or via options; the selector
// will use each li element as its context.
//
// Any time a new li element is added to the list, or an li element is
// removed, this extension will update the dividers in the listview
// accordingly.
//
// Note that if a listview already has dividers, applying this
// extension will remove all the existing dividers and replace them
// with new, generated ones.
//
// Also note that this extension doesn't sort the list: it only creates
// dividers based on text inside list items. So if your list isn't
// alphabetically-sorted, you may get duplicate dividers.
//
// So, for example, this markup:
//
// <ul id="has-no-dividers" data-role="listview" data-autodividers="alpha">
//		<li>Barry</li>
//		<li>Carrie</li>
//		<li>Betty</li>
//		<li>Harry</li>
//		<li>Carly</li>
//		<li>Hetty</li>
// </ul>
//
// will produce dividers like this:
//
// <ul data-role="listview" data-autodividers="alpha">
//	<li data-role="list-divider">B</li>
//	<li>Barry</li>
//	<li data-role="list-divider">C</li>
//	<li>Carrie</li>
//	<li data-role="list-divider">B</li>
//	<li>Betty</li>
//	<li data-role="list-divider">H</li>
//	<li>Harry</li>
//	<li data-role="list-divider">C</li>
//	<li>Carly</li>
//	<li data-role="list-divider">H</li>
//	<li>Hetty</li>
// </ul>
//
// with each divider occuring twice.
//
// Options:
//
//	selector: The jQuery selector to use to find text for the
//			generated dividers. Default is to use the first 'a'
//			(link) element. If this selector doesn't find any
//			text, the widget automatically falls back to the text
//			inside the li (for read-only lists). Can be set to a custom
//			selector via data-autodividers-selector="..." or the 'selector'
//			option.
//
//	 type: 'alpha' (default) sets the auto divider type to "uppercased
//		 first character of text selected from each item"; "full" sets
//		 it to the unmodified text selected from each item. Set via
//		 the data-autodividers="<type>" attribute on the listview or
//		 the 'type' option.
//
// Events:
//
//	updatelayout: Triggered if the dividers in the list change;
//		this happens if list items are added to the listview,
//		which causes the autodividers to be regenerated.

(function ( $, undefined ) {

	var autodividers = function ( options ) {
		var list = $( this ),
			listview = list.data( 'listview' ),
			dividerType,
			textSelector,
			getDividerText,
			mergeDividers,
			isNonDividerLi,
			liAdded,
			liRemoved;

		options = options || {};
		dividerType = options.type || list.jqmData( 'autodividers' ) || 'alpha';
		textSelector = options.selector || list.jqmData( 'autodividers-selector' ) || 'a';

		getDividerText = function ( elt ) {
			// look for some text in the item
			var text = elt.find( textSelector ).text() || elt.text() || null;

			if ( !text ) {
				return null;
			}

			// create the text for the divider
			if ( dividerType === 'alpha' ) {
				text = text.slice( 0, 1 ).toUpperCase();
			}

			return text;
		};

		mergeDividers = function () {
			var dividersChanged = false,
				divider,
				dividerText,
				selector,
				nextDividers;

			// any dividers which are following siblings of a divider, where
			// there are no dividers with different text inbetween, can be removed
			list.find( 'li.ui-li-divider' ).each(function () {
				divider = $( this );
				dividerText = divider.text();
				selector = '.ui-li-divider:not(:contains(' + dividerText + '))';
				nextDividers = divider.nextUntil( selector );
				nextDividers = nextDividers.filter( '.ui-li-divider:contains(' + dividerText + ')' );

				if ( nextDividers.length > 0 ) {
					nextDividers.remove();
					dividersChanged = true;
				}
			} );

			if ( dividersChanged ) {
				list.trigger( 'updatelayout' );
			}
		};

		// check that elt is a non-divider li element
		isNonDividerLi = function ( elt ) {
			return elt.is('li') &&
					elt.jqmData( 'role' ) !== 'list-divider';
		};

		// li element inserted, so check whether it needs a divider
		liAdded = function ( li ) {
			var dividerText = getDividerText( li ),
				existingDividers,
				divider;

			if ( !dividerText ) {
				listview.refresh();
				return;
			}

			// add expected divider for this li if it doesn't exist
			existingDividers = li.prevAll( '.ui-li-divider:first:contains(' + dividerText + ')' );

			if ( existingDividers.length === 0 ) {
				divider = $( '<li>' + dividerText + '</li>' );
				divider.attr( 'data-' + $.mobile.ns + 'role', 'list-divider' );
				li.before( divider );

				listview.refresh();

				mergeDividers();
			} else {
				listview.refresh();
			}
		};

		// li element removed, so check whether its divider should go
		liRemoved = function ( li ) {
			var dividerText = getDividerText( li ),
				precedingItems,
				nextItems;

			if ( !dividerText ) {
				listview.refresh();
				return;
			}

			// remove divider for this li if there are no other
			// li items for the divider before or after this li item
			precedingItems = li.prevUntil( '.ui-li-divider:contains(' + dividerText + ')' );
			nextItems = li.nextUntil( '.ui-li-divider' );

			if ( precedingItems.length === 0 && nextItems.length === 0 ) {
				li.prevAll( '.ui-li-divider:contains(' + dividerText + '):first' ).remove();

				listview.refresh();

				mergeDividers();
			} else {
				listview.refresh();
			}
		};

		// set up the dividers on first create
		list.find( 'li' ).each( function () {
			var li = $( this );

			// remove existing dividers
			if ( li.jqmData( 'role' ) === 'list-divider' ) {
				li.remove();
			} else {			// make new dividers for list items
				liAdded( li );
			}
		} );

		// bind to DOM events to keep list up to date
		list.bind( 'DOMNodeInserted', function ( e ) {
			var elt = $( e.target );

			if ( !isNonDividerLi( elt ) ) {
				return;
			}

			liAdded( elt );
		} );

		list.bind( 'DOMNodeRemoved', function ( e ) {
			var elt = $( e.target );

			if ( !isNonDividerLi( elt ) ) {
				return;
			}

			liRemoved( elt );
		} );
	};

	$.fn.autodividers = autodividers;

	$( ":jqmData(role=listview)" ).live( "listviewcreate", function () {
		var list = $( this );

		if ( list.is( ':jqmData(autodividers)' ) ) {
			list.autodividers();
		}
	} );
}( jQuery ) );
/* ***************************************************************************
 * Copyright (c) 2000 - 2011 Samsung Electronics Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software" ),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 */

// most of following codes are derived from jquery.mobile.scrollview.js
(function ( $, window, document, undefined ) {

	function circularNum( num, total ) {
		var n = num % total;
		if ( n < 0 ) {
			n = total + n;
		}
		return n;
	}

	function setElementTransform( $ele, x, y ) {
		var v = "translate3d( " + x + "," + y + ", 0px)";
		$ele.css({
			"-moz-transform": v,
			"-webkit-transform": v,
			"transform": v
		} );
	}

	function MomentumTracker( options ) {
		this.options = $.extend( {}, options );
		this.easing = "easeOutQuad";
		this.reset();
	}

	var tstates = {
		scrolling : 0,
		done : 1
	};

	function getCurrentTime() {
		return ( new Date()).getTime();
	}

	$.extend( MomentumTracker.prototype, {
		start: function ( pos, speed, duration ) {
			this.state = ( speed != 0 ) ? tstates.scrolling : tstates.done;
			this.pos = pos;
			this.speed = speed;
			this.duration = duration;

			this.fromPos = 0;
			this.toPos = 0;

			this.startTime = getCurrentTime();
		},

		reset: function () {
			this.state = tstates.done;
			this.pos = 0;
			this.speed = 0;
			this.duration = 0;
		},

		update: function () {
			var state = this.state,
				duration,
				elapsed,
				dx,
				x;

			if ( state == tstates.done ) {
				return this.pos;
			}

			duration = this.duration;
			elapsed = getCurrentTime() - this.startTime;
			elapsed = elapsed > duration ? duration : elapsed;

			dx = this.speed * ( 1 - $.easing[this.easing](elapsed / duration, elapsed, 0, 1, duration ) );

			x = this.pos + dx;
			this.pos = x;

			if ( elapsed >= duration ) {
				this.state = tstates.done;
			}

			return this.pos;
		},

		done: function () {
			return this.state == tstates.done;
		},

		getPosition: function () {
			return this.pos;
		}
	} );

	jQuery.widget( "mobile.circularview", jQuery.mobile.widget, {
		options: {
			fps:				60,

			scrollDuration:		2000,

			moveThreshold:		10,
			moveIntervalThreshold:	150,

			startEventName:		"scrollstart",
			updateEventName:	"scrollupdate",
			stopEventName:		"scrollstop",

			eventType:			$.support.touch	? "touch" : "mouse",

			delayedClickSelector: "a, .ui-btn",
			delayedClickEnabled: false
		},

		_makePositioned: function ( $ele ) {
			if ( $ele.css( 'position' ) == 'static' ) {
				$ele.css( 'position', 'relative' );
			}
		},

		_create: function () {
			this._$clip = $( this.element).addClass( "ui-scrollview-clip" );
			var $child = this._$clip.children(),
				self;
			//if ( $child.length > 1 ) {
			$child = this._$clip.wrapInner( "<div></div>" ).children();
			//}
			this._$view = $child.addClass( "ui-scrollview-view" );
			this._$list = $child.children();

			this._$clip.css( "overflow", "hidden" );
			this._makePositioned( this._$clip );

			this._$view.css( "overflow", "hidden" );
			this._tracker = new MomentumTracker( this.options );

			this._timerInterval = 1000 / this.options.fps;
			this._timerID = 0;

			self = this;
			this._timerCB = function () { self._handleMomentumScroll(); };

			this.refresh();

			this._addBehaviors();
		},

		refresh: function () {
			var itemsPerView;

			this._viewWidth = this._$view.width();
			this._clipWidth = $( window ).width();
			this._itemWidth = this._$list.children().first().outerWidth();
			this._$items = this._$list.children().detach();
			itemsPerView = this._clipWidth / this._itemWidth;
			itemsPerView = Math.ceil( itemsPerView * 10 ) / 10;
			this._itemsPerView = parseInt( itemsPerView, 10 );

			this._rx = -this._itemWidth;
			this._sx = -this._itemWidth;
			this._setItems();
		},

		_startMScroll: function ( speedX, speedY ) {
			this._stopMScroll();

			var keepGoing = false,
				duration = this.options.scrollDuration,
				t = this._tracker,
				c = this._clipWidth,
				v = this._viewWidth;

			this._$clip.trigger( this.options.startEventName);

			t.start( this._rx, speedX, duration, (v > c ) ? -(v - c) : 0, 0 );
			keepGoing = !t.done();

			if ( keepGoing ) {
				this._timerID = setTimeout( this._timerCB, this._timerInterval );
			} else {
				this._stopMScroll();
			}
			//console.log( "startmscroll" + this._rx + "," + this._sx );
		},

		_stopMScroll: function () {
			if ( this._timerID ) {
				this._$clip.trigger( this.options.stopEventName );
				clearTimeout( this._timerID );
			}

			this._timerID = 0;

			if ( this._tracker ) {
				this._tracker.reset();
			}
			//console.log( "stopmscroll" + this._rx + "," + this._sx );
		},

		_handleMomentumScroll: function () {
			var keepGoing = false,
				v = this._$view,
				x = 0,
				y = 0,
				t = this._tracker;

			if ( t ) {
				t.update();
				x = t.getPosition();

				keepGoing = !t.done();

			}

			this._setScrollPosition( x, y );
			this._rx = x;

			this._$clip.trigger( this.options.updateEventName, [ { x: x, y: y } ] );

			if ( keepGoing ) {
				this._timerID = setTimeout( this._timerCB, this._timerInterval );
			} else {
				this._stopMScroll();
			}
		},

		_setItems: function () {
			var i,
				$item;

			for ( i = -1; i < this._itemsPerView + 1; i++ ) {
				$item = this._$items[ circularNum( i, this._$items.length ) ];
				this._$list.append( $item );
			}
			setElementTransform( this._$view, this._sx + "px", 0 );
			this._$view.width( this._itemWidth * ( this._itemsPerView + 2 ) );
			this._viewWidth = this._$view.width();
		},

		_setScrollPosition: function ( x, y ) {
			var sx = this._sx,
				dx = x - sx,
				di = parseInt( dx / this._itemWidth, 10 ),
				i,
				idx,
				$item;

			if ( di > 0 ) {
				for ( i = 0; i < di; i++ ) {
					this._$list.children().last().detach();
					idx = -parseInt( ( sx / this._itemWidth ) + i + 3, 10 );
					$item = this._$items[ circularNum( idx, this._$items.length ) ];
					this._$list.prepend( $item );
					//console.log( "di > 0 : " + idx );
				}
			} else if ( di < 0 ) {
				for ( i = 0; i > di; i-- ) {
					this._$list.children().first().detach();
					idx = this._itemsPerView - parseInt( ( sx / this._itemWidth ) + i, 10 );
					$item = this._$items[ circularNum( idx, this._$items.length ) ];
					this._$list.append( $item );
					//console.log( "di < 0 : " + idx );
				}
			}

			this._sx += di * this._itemWidth;

			setElementTransform( this._$view, ( x - this._sx - this._itemWidth ) + "px", 0 );

			//console.log( "rx " + this._rx + "sx " + this._sx );
		},

		_enableTracking: function () {
			$(document).bind( this._dragMoveEvt, this._dragMoveCB );
			$(document).bind( this._dragStopEvt, this._dragStopCB );
		},

		_disableTracking: function () {
			$(document).unbind( this._dragMoveEvt, this._dragMoveCB );
			$(document).unbind( this._dragStopEvt, this._dragStopCB );
		},

		_getScrollHierarchy: function () {
			var svh = [],
				d;
			this._$clip.parents( '.ui-scrollview-clip' ).each( function () {
				d = $( this ).jqmData( 'circulaview' );
				if ( d ) {
					svh.unshift( d );
				}
			} );
			return svh;
		},

		centerTo: function ( selector ) {
			var i,
				newX;

			for ( i = 0; i < this._$items.length; i++ ) {
				if ( $( this._$items[i]).is( selector ) ) {
					newX = -( i * this._itemWidth - this._clipWidth / 2 + this._itemWidth * 2 );
					this.scrollTo( newX, 0 );
					console.log( i + "," + newX );
					return;
				}
			}
		},

		scrollTo: function ( x, y, duration ) {
			this._stopMScroll();
			if ( !duration ) {
				this._setScrollPosition( x, y );
				this._rx = x;
				return;
			}

			x = -x;
			y = -y;

			var self = this,
				start = getCurrentTime(),
				efunc = $.easing.easeOutQuad,
				sx = this._rx,
				sy = 0,
				dx = x - sx,
				dy = 0,
				tfunc,
				elapsed,
				ec;

			tfunc = function () {
				elapsed = getCurrentTime() - start;
				if ( elapsed >= duration ) {
					self._timerID = 0;
					self._setScrollPosition( x, y );
				} else {
					ec = efunc( elapsed / duration, elapsed, 0, 1, duration );
					self._setScrollPosition( sx + ( dx * ec ), sy + ( dy * ec ) );
					self._timerID = setTimeout( tfunc, self._timerInterval );
				}
			};

			this._timerID = setTimeout( tfunc, this._timerInterval );
		},

		getScrollPosition: function () {
			return { x: -this._rx, y: 0 };
		},

		_handleDragStart: function ( e, ex, ey ) {
			$.each( this._getScrollHierarchy(), function ( i, sv ) {
				sv._stopMScroll();
			} );

			this._stopMScroll();

			if ( this.options.delayedClickEnabled ) {
				this._$clickEle = $( e.target ).closest( this.options.delayedClickSelector );
			}
			this._lastX = ex;
			this._lastY = ey;
			this._speedX = 0;
			this._speedY = 0;
			this._didDrag = false;

			this._lastMove = 0;
			this._enableTracking();

			this._ox = ex;
			this._nx = this._rx;

			if ( this.options.eventType == "mouse" || this.options.delayedClickEnabled ) {
				e.preventDefault();
			}
			//console.log( "scrollstart" + this._rx + "," + this._sx );
			e.stopPropagation();
		},

		_handleDragMove: function ( e, ex, ey ) {
			this._lastMove = getCurrentTime();

			var dx = ex - this._lastX,
				dy = ey - this._lastY;

			this._speedX = dx;
			this._speedY = 0;

			this._didDrag = true;

			this._lastX = ex;
			this._lastY = ey;

			this._mx = ex - this._ox;

			this._setScrollPosition( this._nx + this._mx, 0 );

			//console.log( "scrollmove" + this._rx + "," + this._sx );
			return false;
		},

		_handleDragStop: function ( e ) {
			var l = this._lastMove,
				t = getCurrentTime(),
				doScroll = l && ( t - l ) <= this.options.moveIntervalThreshold,
				sx = ( this._tracker && this._speedX && doScroll ) ? this._speedX : 0,
				sy = 0;

			this._rx = this._mx ? this._nx + this._mx : this._rx;

			if ( sx ) {
				this._startMScroll( sx, sy );
			}

			//console.log( "scrollstop" + this._rx + "," + this._sx );

			this._disableTracking();

			if ( !this._didDrag && this.options.delayedClickEnabled && this._$clickEle.length ) {
				this._$clickEle
					.trigger( "mousedown" )
					.trigger( "mouseup" )
					.trigger( "click" );
			}

			if ( this._didDrag ) {
				e.preventDefault();
				e.stopPropagation();
			}

			return this._didDrag ? false : undefined;
		},

		_addBehaviors: function () {
			var self = this;

			if ( this.options.eventType === "mouse" ) {
				this._dragStartEvt = "mousedown";
				this._dragStartCB = function ( e ) {
					return self._handleDragStart( e, e.clientX, e.clientY );
				};

				this._dragMoveEvt = "mousemove";
				this._dragMoveCB = function ( e ) {
					return self._handleDragMove( e, e.clientX, e.clientY );
				};

				this._dragStopEvt = "mouseup";
				this._dragStopCB = function ( e ) {
					return self._handleDragStop( e );
				};

				this._$view.bind( "vclick", function (e) {
					return !self._didDrag;
				} );

			} else { //touch
				this._dragStartEvt = "touchstart";
				this._dragStartCB = function ( e ) {
					var t = e.originalEvent.targetTouches[0];
					return self._handleDragStart(e, t.pageX, t.pageY );
				};

				this._dragMoveEvt = "touchmove";
				this._dragMoveCB = function ( e ) {
					var t = e.originalEvent.targetTouches[0];
					return self._handleDragMove(e, t.pageX, t.pageY );
				};

				this._dragStopEvt = "touchend";
				this._dragStopCB = function ( e ) {
					return self._handleDragStop( e );
				};
			}
			this._$view.bind( this._dragStartEvt, this._dragStartCB );
		}
	} );

	$( document ).bind( "pagecreate create", function ( e ) {
		$( $.mobile.circularview.prototype.options.initSelector, e.target ).circularview();
	} );

}( jQuery, window, document ) ); // End Component
/* TBD */
/*
 * jQuery Mobile Widget @VERSION
 *
 * This software is licensed under the MIT licence (as defined by the OSI at
 * http://www.opensource.org/licenses/mit-license.php)
 * 
 * ***************************************************************************
 * Copyright (c) 2000 - 2011 Samsung Electronics Co., Ltd.
 * Copyright (c) 2011 by Intel Corporation Ltd.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 * Authors: Gabriel Schulhof <gabriel.schulhof@intel.com>
 */

// It displays a grid two rows by five columns of colors.
//
// The colors are automatically computed based on the hue
// of the color set by the color attribute (see below).
//
// One of the displayed colors is the color attribute itself
// and the others are multiples of 360/10 away from that color;
// 10 is the total number of colors displayed (2 rows by 5 columns).
//
// To apply, add the attribute data-role="colorpalette" to a <div>
// element inside a page. Alternatively, call colorpalette() on an
// element.
//
// Options:
//
//     color: String; initial color can be specified in html
//            using the data-color="#ff00ff" attribute or
//            when constructed in javascript, eg :
//                $("#mycolorpalette").colorpalette({ color: "#ff00ff" });
//            where the html might be :
//                <div id="mycolorpalette"></div>
//            The color can be changed post-construction like this :
//                $("#mycolorpalette").colorpalette("option", "color", "#ABCDEF");
//            Default: "#1a8039"

/*
 * Colorpalette displays a grid two rows by five columns of colors.
 *
 * The colors are automatically computed based on the hue
 * of the color set by the color attribute (see below).
 *
 * One of the displayed colors is the color attribute itself
 * and the others are multiples of 360/10 away from that color;
 * 10 is the total number of colors displayed (2 rows by 5 columns).
 *
 * HTML attributes:
 *
 * To apply, add the attribute data-role="colorpalette" to a <div>
 * element inside a page. Alternatively, call colorpalette() on an
 * element.
 *
 *     data-role: Myst have 'colorpalette'.
 *     data-color: String; initial color can be specified in html
 *            using the data-color="#ff00ff" attribute or
 *            when constructed in javascript, eg :
 *                $("#mycolorpalette").colorpalette({ color: "#ff00ff" });
 *            where the html might be :
 *                <div id="mycolorpalette"></div>
 *            The color can be changed post-construction like this :
 *                $("#mycolorpalette").colorpalette("option", "color", "#ABCDEF");
 *            Default: "#1a8039"
 *
 *APIs:
 *		$('obj').colorpalette() : Make an object to a colorpalette widget.
 *
 *Events:
 *		No event.
 *
 *Examples:
 *		<div data-role="colorpalette" data-color: "#ffffff"></div>
 *
 *		<div id="toBeColorpalette"></div>
 *		<script>
 *			$("#toBeColorpalette").colorpalette({ color: "#ffffff" });
 *		</script>
 *
 */

( function ( $, undefined ) {

	$.widget( "tizen.colorpalette", $.tizen.colorwidget, {
		options: {
			showPreview: false,
			initSelector: ":jqmData(role='colorpalette')"
		},

		_htmlProto: {
source:

$("<div><div id='colorpalette' class='ui-colorpalette jquery-mobile-ui-widget' data-n-choices='10'>" +
  "    <div class='colorpalette-preview-container' id='colorpalette-preview-container'>" +
  "        <div id='colorpalette-preview' class='colorpalette-preview ui-corner-all'></div>" +
  "    </div>" +
  "    <div class='colorpalette-table'>" +
  "        <div class='colorpalette-normal-row'>" +
  "            <div class='colorpalette-choice-container-left'>" +
  "                <div data-colorpalette-choice='0' class='colorpalette-choice ui-corner-all'></div>" +
  "            </div>" +
  "            <div class='colorpalette-choice-container-rest'>" +
  "                <div data-colorpalette-choice='1' class='colorpalette-choice ui-corner-all'></div>" +
  "            </div>" +
  "            <div class='colorpalette-choice-container-rest'>" +
  "                <div data-colorpalette-choice='2' class='colorpalette-choice ui-corner-all'></div>" +
  "            </div>" +
  "            <div class='colorpalette-choice-container-rest'>" +
  "                <div data-colorpalette-choice='3' class='colorpalette-choice ui-corner-all'></div>" +
  "            </div>" +
  "            <div class='colorpalette-choice-container-rest'>" +
  "                <div data-colorpalette-choice='4' class='colorpalette-choice ui-corner-all'></div>" +
  "            </div>" +
  "        </div>" +
  "        <div class='colorpalette-bottom-row'>" +
  "            <div class='colorpalette-choice-container-left'>" +
  "                <div data-colorpalette-choice='5' class='colorpalette-choice ui-corner-all'></div>" +
  "            </div>" +
  "            <div class='colorpalette-choice-container-rest'>" +
  "                <div data-colorpalette-choice='6' class='colorpalette-choice ui-corner-all'></div>" +
  "            </div>" +
  "            <div class='colorpalette-choice-container-rest'>" +
  "                <div data-colorpalette-choice='7' class='colorpalette-choice ui-corner-all'></div>" +
  "            </div>" +
  "            <div class='colorpalette-choice-container-rest'>" +
  "                <div data-colorpalette-choice='8' class='colorpalette-choice ui-corner-all'></div>" +
  "            </div>" +
  "            <div class='colorpalette-choice-container-rest'>" +
  "                <div data-colorpalette-choice='9' class='colorpalette-choice ui-corner-all'></div>" +
  "            </div>" +
  "        </div>" +
  "    </div>" +
  "</div>" +
  "</div>")
,			ui: {
				clrpalette: "#colorpalette",
				preview: "#colorpalette-preview",
				previewContainer: "#colorpalette-preview-container"
			}
		},

		_create: function () {
			var self = this;

			this.element
				.css( "display", "none" )
				.after( this._ui.clrpalette );

			this._ui.clrpalette.find( "[data-colorpalette-choice]" ).bind( "vclick", function ( e ) {
				var clr = $.tizen.colorwidget.prototype._getElementColor.call(this, $(e.target)),
					Nix,
					nChoices = self._ui.clrpalette.attr( "data-" + ( $.mobile.ns || "" ) + "n-choices" ),
					choiceId,
					rgbMatches;

				rgbMatches = clr.match(/rgb\(([0-9]*), *([0-9]*), *([0-9]*)\)/);

				if ( rgbMatches && rgbMatches.length > 3 ) {
					clr = $.tizen.colorwidget.clrlib.RGBToHTML( [
						parseInt(rgbMatches[1], 10) / 255,
						parseInt(rgbMatches[2], 10) / 255,
						parseInt(rgbMatches[3], 10) / 255] );
				}

				for ( Nix = 0 ; Nix < nChoices ; Nix++ ) {
					self._ui.clrpalette.find( "[data-colorpalette-choice=" + Nix + "]" ).removeClass( "colorpalette-choice-active" );
				}

				$(e.target).addClass( "colorpalette-choice-active" );
				$.tizen.colorwidget.prototype._setColor.call( self, clr );
				$.tizen.colorwidget.prototype._setElementColor.call( self, self._ui.preview, $.tizen.colorwidget.clrlib.RGBToHSL( $.tizen.colorwidget.clrlib.HTMLToRGB( clr ) ), "background" );
			} );
		},

		_setShowPreview: function ( show ) {
			if ( show ) {
				this._ui.previewContainer.removeAttr( "style" );
			} else {
				this._ui.previewContainer.css( "display", "none" );
			}

			this.element.attr( "data-" + ( $.mobile.ns || "" ) + "show-preview", show );
			this.options.showPreview = show;
		},

		widget: function ( value ) {
			return this._ui.clrpalette;
		},

		_setDisabled: function ( value ) {
			$.tizen.widgetex.prototype._setDisabled.call( this, value );
			this._ui.clrpalette[value ? "addClass" : "removeClass"]( "ui-disabled" );
			$.tizen.colorwidget.prototype._displayDisabledState.call( this, this._ui.clrpalette );
		},

		_setColor: function ( clr ) {
			if ( $.tizen.colorwidget.prototype._setColor.call( this, clr ) ) {
				clr = this.options.color;

				var Nix,
					activeIdx = -1,
					nChoices = this._ui.clrpalette.attr( "data-" + ( $.mobile.ns || "" ) + "n-choices" ),
					hsl = $.tizen.colorwidget.clrlib.RGBToHSL( $.tizen.colorwidget.clrlib.HTMLToRGB( clr ) ),
					origHue = hsl[0],
					offset = hsl[0] / 36,
					theFloor = Math.floor( offset ),
					newClr,
					currentlyActive;

				$.tizen.colorwidget.prototype._setElementColor.call( this, this._ui.preview,
						$.tizen.colorwidget.clrlib.RGBToHSL( $.tizen.colorwidget.clrlib.HTMLToRGB( clr ) ), "background" );

				offset = ( offset - theFloor < 0.5 )
					? ( offset - theFloor )
					: ( offset - ( theFloor + 1 ) );

				offset *= 36;

				for ( Nix = 0 ; Nix < nChoices ; Nix++ ) {
					hsl[0] = Nix * 36 + offset;
					hsl[0] = ( ( hsl[0] < 0) ? ( hsl[0] + 360 ) : ( ( hsl[0] > 360 ) ? ( hsl[0] - 360 ) : hsl[0] ) );

					if ( hsl[0] === origHue ) {
						activeIdx = Nix;
					}

					newClr = $.tizen.colorwidget.clrlib.RGBToHTML( $.tizen.colorwidget.clrlib.HSLToRGB( hsl ) );

					$.tizen.colorwidget.prototype._setElementColor.call( this, this._ui.clrpalette.find( "[data-colorpalette-choice=" + Nix + "]" ),
							$.tizen.colorwidget.clrlib.RGBToHSL( $.tizen.colorwidget.clrlib.HTMLToRGB( newClr ) ), "background" );
				}

				if (activeIdx != -1) {
					currentlyActive = parseInt( this._ui.clrpalette.find( ".colorpalette-choice-active" ).attr( "data-" + ($.mobile.ns || "" ) + "colorpalette-choice" ), 10 );
					if ( currentlyActive != activeIdx ) {
						this._ui.clrpalette.find( "[data-colorpalette-choice=" + currentlyActive + "]" ).removeClass( "colorpalette-choice-active" );
						this._ui.clrpalette.find( "[data-colorpalette-choice=" + activeIdx + "]" ).addClass( "colorpalette-choice-active" );
					}
				}
			}
		}
	});

	$( document ).bind( "pagecreate create", function ( e ) {
		$( $.tizen.colorpalette.prototype.options.initSelector, e.target )
			.not( ":jqmData(role='none'), :jqmData(role='nojs')" )
			.colorpalette();
	});

}( jQuery ) );
/*
 * jQuery Mobile Widget @VERSION
 *
 * This software is licensed under the MIT licence (as defined by the OSI at
 * http://www.opensource.org/licenses/mit-license.php)
 * 
 * ***************************************************************************
 * Copyright (c) 2000 - 2011 Samsung Electronics Co., Ltd.
 * Copyright (c) 2011 by Intel Corporation Ltd.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 * Authors: Gabriel Schulhof <gabriel.schulhof@intel.com>
 */

// Displays a 2D hue/saturation spectrum and a lightness slider.
//
// To apply, add the attribute data-role="colorpicker" to a <div>
// element inside a page. Alternatively, call colorpicker() 
// on an element (see below).
//
//Options:
//	color: String; can be specified in html using the
//		data-color="#ff00ff" attribute or when constructed
//			$("#mycolorpicker").colorpicker({ color: "#ff00ff" });
//		where the html might be :
//			<div id="mycolorpicker"/>

(function ( $, undefined ) {

	$.widget( "tizen.colorpicker", $.tizen.colorwidget, {
		options: {
			initSelector: ":jqmData(role='colorpicker')"
		},

		_htmlProto: {
source:

$("<div><div id='colorpicker' class='ui-colorpicker'>" +
  "    <div class='colorpicker-hs-container'>" +
  "        <div id='colorpicker-hs-hue-gradient' class='colorpicker-hs-mask'></div>" +
  "        <div id='colorpicker-hs-sat-gradient' class='colorpicker-hs-mask sat-gradient'></div>" +
  "        <div id='colorpicker-hs-val-mask' class='colorpicker-hs-mask' data-event-source='hs'></div>" +
  "        <div id='colorpicker-hs-selector' class='colorpicker-hs-selector ui-corner-all'></div>" +
  "    </div>" +
  "    <div class='colorpicker-l-container'>" +
  "        <div id='colorpicker-l-gradient' class='colorpicker-l-mask l-gradient' data-event-source='l'></div>" +
  "        <div id='colorpicker-l-selector' class='colorpicker-l-selector ui-corner-all'></div>" +
  "    </div>" +
  "    <div style='clear: both;'></div>" +
  "</div>" +
  "</div>")
,			ui: {
				clrpicker: "#colorpicker",
				hs: {
					hueGradient: "#colorpicker-hs-hue-gradient",
					gradient:    "#colorpicker-hs-sat-gradient",
					eventSource: "[data-event-source='hs']",
					valMask:     "#colorpicker-hs-val-mask",
					selector:    "#colorpicker-hs-selector"
				},
				l: {
					gradient:    "#colorpicker-l-gradient",
					eventSource: "[data-event-source='l']",
					selector:    "#colorpicker-l-selector"
				}
			}
		},

		_create: function () {
			var self = this;

			this.element
				.css( "display", "none" )
				.after( this._ui.clrpicker );

			this._ui.hs.hueGradient.huegradient();

			$.extend( self, {
				dragging: false,
				draggingHS: false,
				selectorDraggingOffset: {
					x : -1,
					y : -1
				},
				dragging_hsl: undefined
			} );

			$( document )
				.bind( "vmousemove", function ( event ) {
					if ( self.dragging ) {
						event.stopPropagation();
						event.preventDefault();
					}
				} )
				.bind( "vmouseup", function ( event ) {
					if ( self.dragging ) {
						self.dragging = false;
					}
				} );

			this._bindElements( "hs" );
			this._bindElements( "l" );
		},

		_bindElements: function ( which ) {
			var self = this,
				stopDragging = function ( event ) {
					self.dragging = false;
					event.stopPropagation();
					event.preventDefault();
				};

			this._ui[which].eventSource
				.bind( "vmousedown mousedown", function ( event ) { self._handleMouseDown( event, which, false ); } )
				.bind( "vmousemove"          , function ( event ) { self._handleMouseMove( event, which, false ); } )
				.bind( "vmouseup"            , stopDragging );

			this._ui[which].selector
				.bind( "vmousedown mousedown", function ( event ) { self._handleMouseDown( event, which, true); } )
				.bind( "touchmove vmousemove", function ( event ) { self._handleMouseMove( event, which, true); } )
				.bind( "vmouseup"            , stopDragging );
		},

		_handleMouseDown: function ( event, containerStr, isSelector ) {
			var coords = $.mobile.tizen.targetRelativeCoordsFromEvent( event ),
				widgetStr = isSelector ? "selector" : "eventSource";
			if ( ( coords.x >= 0 && coords.x <= this._ui[containerStr][widgetStr].width() &&
					coords.y >= 0 && coords.y <= this._ui[containerStr][widgetStr].height() ) || isSelector ) {
				this.dragging = true;
				this.draggingHS = ( "hs" === containerStr );

				if ( isSelector ) {
					this.selectorDraggingOffset.x = coords.x;
					this.selectorDraggingOffset.y = coords.y;
				}

				this._handleMouseMove( event, containerStr, isSelector, coords );
			}
		},

		_handleMouseMove: function ( event, containerStr, isSelector, coords ) {
			var potential_h,
				potential_s,
				potential_l;

			if ( this.dragging &&
					!( ( this.draggingHS && containerStr === "l" ) ||
						( !this.draggingHS && containerStr === "hs" ) ) ) {
				coords = ( coords || $.mobile.tizen.targetRelativeCoordsFromEvent( event ) );

				if ( this.draggingHS ) {
					potential_h = isSelector
						? this.dragging_hsl[0] / 360 + ( coords.x - this.selectorDraggingOffset.x ) / this._ui[containerStr].eventSource.width()
						: coords.x / this._ui[containerStr].eventSource.width();
					potential_s = isSelector
						? this.dragging_hsl[1] + ( coords.y - this.selectorDraggingOffset.y ) / this._ui[containerStr].eventSource.height()
						: coords.y / this._ui[containerStr].eventSource.height();

					this.dragging_hsl[0] = Math.min( 1.0, Math.max( 0.0, potential_h ) ) * 360;
					this.dragging_hsl[1] = Math.min( 1.0, Math.max( 0.0, potential_s ) );
				} else {
					potential_l = isSelector
						? this.dragging_hsl[2] + ( coords.y - this.selectorDraggingOffset.y ) / this._ui[containerStr].eventSource.height()
						: coords.y / this._ui[containerStr].eventSource.height();

					this.dragging_hsl[2] = Math.min( 1.0, Math.max( 0.0, potential_l ) );
				}

				if ( !isSelector ) {
					this.selectorDraggingOffset.x = Math.ceil( this._ui[containerStr].selector.outerWidth()  / 2.0 );
					this.selectorDraggingOffset.y = Math.ceil( this._ui[containerStr].selector.outerHeight() / 2.0 );
				}

				this._updateSelectors( this.dragging_hsl );
				event.stopPropagation();
				event.preventDefault();
			}
		},

		_updateSelectors: function ( hsl ) {
			var clr = $.tizen.colorwidget.prototype._setElementColor.call( this, this._ui.hs.selector, [hsl[0], 1.0 - hsl[1], hsl[2]], "background" ).clr,
				gray = $.tizen.colorwidget.clrlib.RGBToHTML( [hsl[2], hsl[2], hsl[2]] );

			this._ui.hs.valMask.css((hsl[2] < 0.5)
				? { background : "#000000" , opacity : ( 1.0 - hsl[2] * 2.0 )   }
				: { background : "#ffffff" , opacity : ( ( hsl[2] - 0.5 ) * 2.0 ) } );
			this._ui.hs.selector.css( {
				left : ( hsl[0] / 360 * this._ui.hs.eventSource.width() ),
				top : ( hsl[1] * this._ui.hs.eventSource.height() )
			});
			this._ui.l.selector.css({
				top : ( hsl[2] * this._ui.l.eventSource.height() ),
				background : gray
			} );
			$.tizen.colorwidget.prototype._setColor.call( this, clr );
		},

		widget: function () { return this._ui.clrpicker; },

		_setDisabled: function ( value ) {
			$.tizen.widgetex.prototype._setDisabled.call( this, value );
			this._ui.hs.hueGradient.huegradient( "option", "disabled", value );
			this._ui.clrpicker[value ? "addClass" : "removeClass"]( "ui-disabled" );
			$.tizen.colorwidget.prototype._displayDisabledState.call( this, this._ui.clrpicker );
		},

		_setColor: function ( clr ) {
			if ( $.tizen.colorwidget.prototype._setColor.call( this, clr ) ) {
				this.dragging_hsl = $.tizen.colorwidget.clrlib.RGBToHSL( $.tizen.colorwidget.clrlib.HTMLToRGB( this.options.color ) );
				this.dragging_hsl[1] = 1.0 - this.dragging_hsl[1];
				this._updateSelectors( this.dragging_hsl );
			}
		}
	} );

	$( document ).bind( "pagecreate create", function ( e ) {
		$( $.tizen.colorpicker.prototype.options.initSelector, e.target )
			.not( ":jqmData(role='none'), :jqmData(role='nojs')" )
			.colorpicker();
	} );

}( jQuery ) );
/*
 * jQuery Mobile Widget @VERSION
 *
 * This software is licensed under the MIT licence ( as defined by the OSI at
 * http://www.opensource.org/licenses/mit-license.php )
 *
 * ***************************************************************************
 * Copyright ( c ) 2000 - 2011 Samsung Electronics Co., Ltd.
 * Copyright ( c ) 2011 by Intel Corporation Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files ( the "Software" ),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 * Authors: Gabriel Schulhof <gabriel.schulhof@intel.com>
 */

// Displays a button which, when pressed, opens a popupwindow
// containing hsvpicker.
//
// To apply, add the attribute data-role="colorpickerbutton" to a <div>
// element inside a page. Alternatively, call colorpickerbutton() on an
// element.
//
// Options:
//
//   color: String; color displayed on the button and the base color
//      of the hsvpicker ( see hsvpicker ).
//      initial color can be specified in html using the
//      data-color="#ff00ff" attribute or when constructed in
//      javascript, eg :
//        $( "#mycolorpickerbutton" ).colorpickerbutton( { color: "#ff00ff" } );
//      where the html might be :
//        <div id="colorpickerbutton"></div>
//      The color can be changed post-construction like this :
//        $( "#mycolorpickerbutton" ).colorpickerbutton( "option", "color", "#ABCDEF" );
//      Default: "#1a8039"
//
//   buttonMarkup: String; markup to use for the close button on the popupwindow, eg :
//          $( "#mycolorpickerbutton" ).colorpickerbutton( "option","buttonMarkup",
//           "<a href='#' data-role='button'>ignored</a>" );
//
//   closeText: String; the text to display on the close button on the popupwindow.
//        The text set in the buttonMarkup will be ignored and this used instead.
//
// Events:
//
//   colorchanged: emitted when the color has been changed and the popupwindow is closed.

( function ( $, undefined ) {

	$.widget( "tizen.colorpickerbutton", $.tizen.colorwidget, {
		options: {
			buttonMarkup: {
				theme: null,
				inline: true,
				corners: true,
				shadow: true
			},
			hideInput: true,
			closeText: "Close",
			initSelector: "input[type='color'], :jqmData(type='color'), :jqmData(role='colorpickerbutton')"
		},

		_htmlProto: {
source:

$("<div><div id='colorpickerbutton'>" +
  "    <a id='colorpickerbutton-button' href='#' data-role='button' aria-haspopup='true'>" +
  "        <span id='colorpickerbutton-button-contents'>&#x2587;&#x2587;&#x2587;</span>" +
  "    </a>" +
  "    <div id='colorpickerbutton-popup-container' class='colorpickerbutton-popup-container-style'>" +
  "        <div id='colorpickerbutton-popup-hsvpicker' data-role='hsvpicker'></div>" +
  "        <a id='colorpickerbutton-popup-close-button' href='#' data-role='button'>" +
  "            <span id='colorpickerbutton-popup-close-button-text'></span>" +
  "        </a>" +
  "    </div>" +
  "</div>" +
  "</div>")
,			ui: {
				button: "#colorpickerbutton-button",
				buttonContents: "#colorpickerbutton-button-contents",
				popup: "#colorpickerbutton-popup-container",
				hsvpicker: "#colorpickerbutton-popup-hsvpicker",
				closeButton: "#colorpickerbutton-popup-close-button",
				closeButtonText: "#colorpickerbutton-popup-close-button-text"
			}
		},

		_create: function () {
			var self = this;

			this.element
				.css( "display", "none" )
				.after( this._ui.button );

			/* Tear apart the proto */
			this._ui.popup.insertBefore( this.element ).popupwindow();
			this._ui.hsvpicker.hsvpicker();

			$.tizen.popupwindow.bindPopupToButton( this._ui.button, this._ui.popup );

			this._ui.closeButton.bind( "vclick", function ( event ) {
				self._setColor( self._ui.hsvpicker.hsvpicker( "option", "color" ) );
				self.close();
			} );

			this.element.bind( "change keyup blur", function () {
				self._setColor( self.element.val() );
			} );
		},

		_setHideInput: function ( value ) {
			this.element[value ? "addClass" : "removeClass"]( "ui-colorpickerbutton-input-hidden" );
			this.element[value ? "removeClass" : "addClass"]( "ui-colorpickerbutton-input" );
			this.element.attr( "data-" + ( $.mobile.ns || "" ) + "hide-input", value );
		},

		_setColor: function ( clr ) {
			if ( $.tizen.colorwidget.prototype._setColor.call( this, clr ) ) {
				var clrlib = $.tizen.colorwidget.clrlib;

				this._ui.hsvpicker.hsvpicker( "option", "color", this.options.color );
				$.tizen.colorwidget.prototype._setElementColor.call( this, this._ui.buttonContents,
						clrlib.RGBToHSL( clrlib.HTMLToRGB( this.options.color ) ), "color" );
			}
		},

		_setButtonMarkup: function ( value ) {
			this._ui.button.buttonMarkup( value );
			this.options.buttonMarkup = value;
			value.inline = false;
			this._ui.closeButton.buttonMarkup( value );
		},

		_setCloseText: function ( value ) {
			this._ui.closeButtonText.text( value );
			this.options.closeText = value;
			this.element.attr( "data-" + ( $.mobile.ns || "" ) + "close-text", value );
		},

		_setDisabled: function ( value ) {
			$.tizen.widgetex.prototype._setDisabled.call( this, value );
			this._ui.popup.popupwindow( "option", "disabled", value );
			this._ui.button[value ? "addClass" : "removeClass"]( "ui-disabled" );
			$.tizen.colorwidget.prototype._displayDisabledState.call( this, this._ui.button );
		},

		open: function () {
			this._ui.popup.popupwindow( "open",
					this._ui.button.offset().left + this._ui.button.outerWidth() / 2,
					this._ui.button.offset().top + this._ui.button.outerHeight() / 2 );
		},

		_focusButton : function () {
			var self = this;
			setTimeout( function () {
				self._ui.button.focus();
			}, 40 );
		},

		close: function () {
			this._focusButton();
			this._ui.popup.popupwindow( "close" );
		}
	} );

//auto self-init widgets
	$( document ).bind( "pagecreate create", function ( e ) {
		$( $.tizen.colorpickerbutton.prototype.options.initSelector, e.target )
			.not( ":jqmData(role='none'), :jqmData(role='nojs')" )
			.colorpickerbutton();
	} );

}( jQuery ) );
/*
 * jQuery Mobile Widget @VERSION
 *
 * This software is licensed under the MIT licence (as defined by the OSI at
 * http://www.opensource.org/licenses/mit-license.php)
 * 
 * ***************************************************************************
 * Copyright (C) 2011 by Intel Corporation Ltd.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 * Authors: Gabriel Schulhof <gabriel.schulhof@intel.com>
 */

// Displays the color in text of the form '#RRGGBB' where
// RR, GG, and BB are in hexadecimal.
//
// Apply a colortitle by adding the attribute data-role="colortitle"
// to a <div> element inside a page. Alternatively, call colortitle() 
// on an element (see below).
//
// Options:
//
//     color: String; the initial color can be specified in html using
//            the data-color="#ff00ff" attribute or when constructed
//            in javascipt eg
//                $("#mycolortitle").colortitle({ color: "#ff00ff" });
//            where the html might be :
//                <div id="mycolortitle"></div>
//            The color can be changed post-construction :
//                $("#mycolortitle").colortitle("option", "color", "#ABCDEF");
//            Default: "#1a8039".

(function ( $, undefined ) {

	$.widget( "tizen.colortitle", $.tizen.colorwidget, {
		options: {
			initSelector: ":jqmData(role='colortitle')"
		},

		_htmlProto: {
source:

$("<div><div id='colortitle' class='ui-colortitle jquery-mobile-ui-widget'>" +
  "    <h1 id='colortitle-string'></h1>" +
  "</div>" +
  "</div>")
,			ui: {
				clrtitle: "#colortitle",
				header:   "#colortitle-string"
			}
		},

		_create: function () {
			this.element
				.css( "display", "none" )
				.after( this._ui.clrtitle );

		},

		widget: function () { return this._ui.clrtitle; },

		_setDisabled: function ( value ) {
			$.tizen.widgetex.prototype._setDisabled.call( this, value );
			this._ui.clrtitle[value ? "addClass" : "removeClass"]( "ui-disabled" );
		},

		_setColor: function ( clr ) {
			if ( $.tizen.colorwidget.prototype._setColor.call( this, clr ) ) {
				this._ui.header.text( this.options.color );
				$( this._ui.header ).parent().css( "color", this.options.color );
			}
		}
	} );

	$( document ).bind( "pagecreate create", function ( e ) {
		$( $.tizen.colortitle.prototype.options.initSelector, e.target )
			.not( ":jqmData(role='none'), :jqmData(role='nojs')" )
			.colortitle();
	} );

}( jQuery ) );
/*
 *
 * This software is licensed under the MIT licence (as defined by the OSI at
 * http://www.opensource.org/licenses/mit-license.php)
 * 
 * ***************************************************************************
 * Copyright (C) 2011 by Intel Corporation Ltd.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 */

// Ensure that the given namespace is defined. If not, define it to be an empty object.
// This is kinda like the mkdir -p command.

function ensureNS(ns) {
    var nsAr = ns.split("."),
    nsSoFar = "";

    for (var Nix in nsAr) {
        nsSoFar = nsSoFar + (Nix > 0 ? "." : "") + nsAr[Nix];
        eval (nsSoFar + " = " + nsSoFar + " || {};");
    }
}
/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
*/

// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend( jQuery.easing,
{
	def: 'easeOutQuad',
	swing: function (x, t, b, c, d) {
		//alert(jQuery.easing.default);
		return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
	},
	easeInQuad: function (x, t, b, c, d) {
		return c*(t/=d)*t + b;
	},
	easeOutQuad: function (x, t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	easeInOutQuad: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInCubic: function (x, t, b, c, d) {
		return c*(t/=d)*t*t + b;
	},
	easeOutCubic: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	},
	easeInOutCubic: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	},
	easeInQuart: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	},
	easeOutQuart: function (x, t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeInOutQuart: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	easeInQuint: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	},
	easeOutQuint: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	easeInOutQuint: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	},
	easeInSine: function (x, t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},
	easeOutSine: function (x, t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	},
	easeInOutSine: function (x, t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	},
	easeInExpo: function (x, t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},
	easeOutExpo: function (x, t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
	easeInOutExpo: function (x, t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	easeInCirc: function (x, t, b, c, d) {
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	},
	easeOutCirc: function (x, t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},
	easeInOutCirc: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	},
	easeInElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	easeOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	easeInOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	},
	easeInBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	easeOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	easeInOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158; 
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	easeInBounce: function (x, t, b, c, d) {
		return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
	},
	easeOutBounce: function (x, t, b, c, d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	},
	easeInOutBounce: function (x, t, b, c, d) {
		if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
		return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
	}
});

/*
 *
 * TERMS OF USE - EASING EQUATIONS
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2001 Robert Penner
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
 */
/*
 *
 * This software is licensed under the MIT licence (as defined by the OSI at
 * http://www.opensource.org/licenses/mit-license.php)
 * 
 * ***************************************************************************
 * Copyright (C) 2011 by Intel Corporation Ltd.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 */

// Add markup for labels

(function($, undefined) {

$(document).bind("pagecreate create", function(e) {
    $(":jqmData(role='label')", e.target).not(":jqmData(role='none'), :jqmData(role='nojs')").each(function() {
        $(this).addClass("jquery-mobile-ui-label")
               .html($("<span>", {"class": "jquery-mobile-ui-label-text"}).text($(this).text()));
    });
});

})(jQuery);
/*
 * Size pages to the window
 *
 * This software is licensed under the MIT licence (as defined by the OSI at
 * http://www.opensource.org/licenses/mit-license.php)
 * 
 * ***************************************************************************
 * Copyright (C) 2011 by Intel Corporation Ltd.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 */

// Size pages to the window

(function($, undefined) {

var _fit_page_to_window_selector = ":jqmData(role='page'):jqmData(fit-page-to-window='true'):visible";

$(document).bind("pageshow", function(e) {
    if ($(e.target).is(_fit_page_to_window_selector))
        $.mobile.tizen.fillPageWithContentArea($(e.target));
});

$(window).resize(function() {
    if ($(_fit_page_to_window_selector)[0] !== undefined)
        $.mobile.tizen.fillPageWithContentArea($(_fit_page_to_window_selector));
});

})(jQuery);
ensureNS("jQuery.mobile.tizen.clrlib");

jQuery.extend( jQuery.mobile.tizen.clrlib, 
{
    nearestInt: function(val) { 
        var theFloor = Math.floor(val);

        return (((val - theFloor) > 0.5) ? (theFloor + 1) : theFloor);
    },

    /*
     * Converts html color string to rgb array.
     *
     * Input: string clr_str, where
     * clr_str is of the form "#aabbcc"
     *
     * Returns: [ r, g, b ], where
     * r is in [0, 1]
     * g is in [0, 1]
     * b is in [0, 1]
     */
    HTMLToRGB: function(clr_str) {
        clr_str = (('#' == clr_str.charAt(0)) ? clr_str.substring(1) : clr_str);

        return ([
            clr_str.substring(0, 2),
            clr_str.substring(2, 4),
            clr_str.substring(4, 6)
            ].map(function(val) {
                return parseInt(val, 16) / 255.0;
            }));
    },

    /*
     * Converts rgb array to html color string.
     *
     * Input: [ r, g, b ], where
     * r is in [0, 1]
     * g is in [0, 1]
     * b is in [0, 1]
     *
     * Returns: string of the form "#aabbcc"
     */
    RGBToHTML: function(rgb) {
        return ("#" + 
            rgb.map(function(val) {
                      var ret = val * 255,
                          theFloor = Math.floor(ret);

                      ret = ((ret - theFloor > 0.5) ? (theFloor + 1) : theFloor);
                      ret = (((ret < 16) ? "0" : "") + (ret & 0xff).toString(16));
                      return ret;
                  })
               .join(""));
    },

    /*
     * Converts hsl to rgb.
     *
     * From http://130.113.54.154/~monger/hsl-rgb.html
     *
     * Input: [ h, s, l ], where
     * h is in [0, 360]
     * s is in [0,   1]
     * l is in [0,   1]
     *
     * Returns: [ r, g, b ], where
     * r is in [0, 1]
     * g is in [0, 1]
     * b is in [0, 1]
     */
    HSLToRGB: function(hsl) {
        var h = hsl[0] / 360.0, s = hsl[1], l = hsl[2];

        if (0 === s)
            return [ l, l, l ];

        var temp2 = ((l < 0.5)
                ? l * (1.0 + s)
                : l + s - l * s),
            temp1 = 2.0 * l - temp2,
            temp3 = {
                r: h + 1.0 / 3.0,
                g: h,
                b: h - 1.0 / 3.0
            };

        temp3.r = ((temp3.r < 0) ? (temp3.r + 1.0) : ((temp3.r > 1) ? (temp3.r - 1.0) : temp3.r));
        temp3.g = ((temp3.g < 0) ? (temp3.g + 1.0) : ((temp3.g > 1) ? (temp3.g - 1.0) : temp3.g));
        temp3.b = ((temp3.b < 0) ? (temp3.b + 1.0) : ((temp3.b > 1) ? (temp3.b - 1.0) : temp3.b));

        ret = [
            (((6.0 * temp3.r) < 1) ? (temp1 + (temp2 - temp1) * 6.0 * temp3.r) :
            (((2.0 * temp3.r) < 1) ? temp2 :
            (((3.0 * temp3.r) < 2) ? (temp1 + (temp2 - temp1) * ((2.0 / 3.0) - temp3.r) * 6.0) :
             temp1))),
            (((6.0 * temp3.g) < 1) ? (temp1 + (temp2 - temp1) * 6.0 * temp3.g) :
            (((2.0 * temp3.g) < 1) ? temp2 :
            (((3.0 * temp3.g) < 2) ? (temp1 + (temp2 - temp1) * ((2.0 / 3.0) - temp3.g) * 6.0) :
             temp1))),
            (((6.0 * temp3.b) < 1) ? (temp1 + (temp2 - temp1) * 6.0 * temp3.b) :
            (((2.0 * temp3.b) < 1) ? temp2 :
            (((3.0 * temp3.b) < 2) ? (temp1 + (temp2 - temp1) * ((2.0 / 3.0) - temp3.b) * 6.0) :
             temp1)))]; 

        return ret;
    },

    /*
     * Converts hsv to rgb.
     *
     * Input: [ h, s, v ], where
     * h is in [0, 360]
     * s is in [0,   1]
     * v is in [0,   1]
     *
     * Returns: [ r, g, b ], where
     * r is in [0, 1]
     * g is in [0, 1]
     * b is in [0, 1]
     */
    HSVToRGB: function(hsv) {
        return $.mobile.tizen.clrlib.HSLToRGB($.mobile.tizen.clrlib.HSVToHSL(hsv));
    },

    /*
     * Converts rgb to hsv.
     *
     * from http://coecsl.ece.illinois.edu/ge423/spring05/group8/FinalProject/HSV_writeup.pdf
     *
     * Input: [ r, g, b ], where
     * r is in [0,   1]
     * g is in [0,   1]
     * b is in [0,   1]
     *
     * Returns: [ h, s, v ], where
     * h is in [0, 360]
     * s is in [0,   1]
     * v is in [0,   1]
     */
    RGBToHSV: function(rgb) {
        var min, max, delta, h, s, v, r = rgb[0], g = rgb[1], b = rgb[2];

        min = Math.min(r, Math.min(g, b));
        max = Math.max(r, Math.max(g, b));
        delta = max - min;

        h = 0;
        s = 0;
        v = max;

        if (delta > 0.00001) {
            s = delta / max;

            if (r === max)
                h = (g - b) / delta ;
            else
            if (g === max)
                h = 2 + (b - r) / delta ;
            else
                h = 4 + (r - g) / delta ;

            h *= 60 ;

            if (h < 0)
                h += 360 ;
        }

        return [h, s, v];
    },

    /*
     * Converts hsv to hsl.
     *
     * Input: [ h, s, v ], where
     * h is in [0, 360]
     * s is in [0,   1]
     * v is in [0,   1]
     *
     * Returns: [ h, s, l ], where
     * h is in [0, 360]
     * s is in [0,   1]
     * l is in [0,   1]
     */
    HSVToHSL: function(hsv) {
        var max = hsv[2],
            delta = hsv[1] * max,
            min = max - delta,
            sum = max + min,
            half_sum = sum / 2,
            s_divisor = ((half_sum < 0.5) ? sum : (2 - max - min));

        return [ hsv[0], ((0 == s_divisor) ? 0 : (delta / s_divisor)), half_sum ];
    },

    /*
     * Converts rgb to hsl
     *
     * Input: [ r, g, b ], where
     * r is in [0,   1]
     * g is in [0,   1]
     * b is in [0,   1]
     *
     * Returns: [ h, s, l ], where
     * h is in [0, 360]
     * s is in [0,   1]
     * l is in [0,   1]
     */
    RGBToHSL: function(rgb) {
        return $.mobile.tizen.clrlib.HSVToHSL($.mobile.tizen.clrlib.RGBToHSV(rgb));
    }
});
/*!
 * jQuery Mobile Widget @VERSION
 *
 * TODO: remove unnecessary codes....
 *
 * This software is licensed under the MIT licence (as defined by the OSI at
 * http://www.opensource.org/licenses/mit-license.php)
 * 
 * ***************************************************************************
 * Copyright (C) 2011 by Intel Corporation Ltd.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 * Authors: Kalyan Kondapally <kalyan.kondapally@intel.com>
 */

ensureNS("jQuery.mobile.tizen");

(function () {
jQuery.extend(jQuery.mobile.tizen, {
    Point: function (x, y) {
        var X = isNaN(x) ? 0 : x;
        var Y = isNaN(y) ? 0 : y;

        this.add = function (Point) {
            this.setX(X + Point.x());
            this.setY(Y + Point.y());
            return this;
        }

        this.subtract = function (Point) {
            this.setX(X - Point.x());
            this.setY(Y - Point.y());
            return this;
        }

        this.multiply = function (Point) {
            this.setX(Math.round(X * Point.x()));
            this.setY(Math.round(Y * Point.y()));
            return this;
        }

        this.divide = function (Point) {
            this.setX(Math.round(X / Point.x()));
            this.setY(Math.round(Y / Point.y()));
            return this;
        }

        this.isNull = function () {
            return (X === 0 && Y === 0);
        }

        this.x = function () {
            return X;
        }

        this.setX = function (val) {
            isNaN(val) ? X = 0 : X = val;
        }

        this.y = function () {
            return Y;
        }

        this.setY = function (val) {
            isNaN(val) ? Y = 0 : Y = val;
        }

        this.setNewPoint = function (point) {
            this.setX(point.x());
            this.setY(point.y());
        }

        this.isEqualTo = function (point) {
            return (X === point.x() && Y === point.y());
        }
    },

    Rect: function (left,top,width,height) {
        var Left = left;
        var Top = top;
        var Right = Left+width;
        var Bottom = Top+height;

        this.setRect = function(varL,varR,varT,varB) {
            this.setLeft(varL);
            this.setRight(varR);
            this.setTop(varT);
            this.setBottom(varB);
        }

        this.right = function () {
            return Right;
        }

        this.setRight = function (val) {
            Right = val;
        }

        this.top = function () {
            return Top;
        }

        this.setTop = function (val) {
            Top = val;
        }

        this.bottom = function () {
            return Bottom;
        }

        this.setBottom = function (val) {
            Bottom = val;
        }

        this.left = function () {
            return Left;
        }

        this.setLeft = function (val) {
            Left = val;
        }

        this.moveTop = function(valY) {
            var h = this.height();
            Top = valY;
            Bottom = Top + h;
        }

        this.isNull = function () {
            return Right === Left && Bottom === Top;
        }

        this.isValid = function () {
            return Left <= Right && Top <= Bottom;
        }

        this.isEmpty = function () {
            return Left > Right || Top > Bottom;
        }

        this.contains = function (valX,valY) {
            if (this.containsX(valX) && this.containsY(valY))
                return true;
            return false;
        }

        this.width = function () {
            return Right - Left;
        }

        this.height = function () {
            return Bottom - Top;
        }

        this.containsX = function(val) {
            var l = Left,
            r = Right;
            if (Right<Left) {
                l = Right;
                r = Left;
            }
            if (l > val || r < val)
                return false;
        return true;
        }

        this.containsY = function(val) {
            var t = Top,
            b = Bottom;
            if (Bottom<Top) {
                t = Bottom;
                b = Top;
            }
            if (t > val || b < val)
                return false;
          return true;
        }
    },

    disableSelection: function (element) {
        return $(element).each(function () {
            jQuery(element).css('-webkit-user-select', 'none');
        });
    },

    enableSelection: function (element, value) {
        return $(element).each(function () {
            val = value == "text" ? val = 'text' : val = 'auto';
            jQuery(element).css('-webkit-user-select', val);
        });
    },

    // Set the height of the content area to fill the space between a
    // page's header and footer
    fillPageWithContentArea: function (page) {
        var $page = $(page);
        var $content = $page.children(".ui-content:first");
        var hh = $page.children(".ui-header").outerHeight(); hh = hh ? hh : 0;
        var fh = $page.children(".ui-footer").outerHeight(); fh = fh ? fh : 0;
        var pt = parseFloat($content.css("padding-top"));
        var pb = parseFloat($content.css("padding-bottom"));
        var wh = window.innerHeight;
        var height = wh - (hh + fh) - (pt + pb);
        $content.height(height);
    },

    // Get document-relative mouse coordinates from a given event
    // From: http://www.quirksmode.org/js/events_properties.html#position
    documentRelativeCoordsFromEvent: function(ev) {
        var e = ev ? ev : window.event,
            client = { x: e.clientX, y: e.clientY },
            page   = { x: e.pageX,   y: e.pageY   },
            posx = 0,
            posy = 0;

        // Grab useful coordinates from touch events
        if (e.type.match(/^touch/)) {
            page = {
                x: e.originalEvent.targetTouches[0].pageX,
                y: e.originalEvent.targetTouches[0].pageY
            };
            client = {
                x: e.originalEvent.targetTouches[0].clientX,
                y: e.originalEvent.targetTouches[0].clientY
            };
        }

        if (page.x || page.y) {
            posx = page.x;
            posy = page.y;
        }
        else
        if (client.x || client.y) {
            posx = client.x + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = client.y + document.body.scrollTop  + document.documentElement.scrollTop;
        }

        return { x: posx, y: posy };
    },

	// TODO : offsetX, offsetY. touch events don't have offsetX and offsetY. support for touch devices.
    // check algorithm...
    targetRelativeCoordsFromEvent: function(e) {
        var coords = { x: e.offsetX, y: e.offsetY };

        if (coords.x === undefined || isNaN(coords.x) ||
            coords.y === undefined || isNaN(coords.y)) {
            var offset = $(e.target).offset();
            //coords = documentRelativeCoordsFromEvent(e);	// Old code. Must be checked again.
            coords = $.mobile.tizen.documentRelativeCoordsFromEvent(e);
            coords.x -= offset.left;
            coords.y -= offset.top;
        }

        return coords;
    }
});

})();
/*
 *
 * This software is licensed under the MIT licence (as defined by the OSI at
 * http://www.opensource.org/licenses/mit-license.php)
 * 
 * ***************************************************************************
 * Copyright (C) 2011 by Intel Corporation Ltd.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 */

// Wrapper round the jLayout functions to enable it to be used
// for creating jQuery Mobile layout extensions.
//
// See the layouthbox and layoutvbox widgets for usage examples.
(function ($, undefined) {

$.widget("tizen.jlayoutadaptor", $.mobile.widget, {
    options: {
        hgap: null,
        vgap: null,
        scrollable: true,
        showScrollBars: true,
        direction: null
    },

    _create: function () {
        var self = this,
            options = this.element.data('layout-options'),
            page = $(this.element).closest(':jqmData(role="page")');

        $.extend(this.options, options);

        if (page && !page.is(':visible')) {
            this.element.hide();

            page.bind('pageshow', function () {
                self.refresh();
            });
        }
        else {
            this.refresh();
        }
    },

    refresh: function () {
        var container;
        var config = $.extend(this.options, this.fixed);

        if (config.scrollable) {
            if (!(this.element.children().is('.ui-scrollview-view'))) {
                // create the scrollview
                this.element.scrollview({direction: config.direction,
                                         showScrollBars: config.showScrollBars});
            }
            else if (config.showScrollBars) {
                this.element.find('.ui-scrollbar').show();
            }
            else {
                this.element.find('.ui-scrollbar').hide();
            }

            container = this.element.find('.ui-scrollview-view');
        }
        else {
            container = this.element;
        }

        container.layout(config);

        this.element.show();

        if (config.scrollable) {
            // get the right/bottom edge of the last child after layout
            var lastItem = container.children().last();

            var edge;

            var scrollview = this.element.find('.ui-scrollview-view');

            if (config.direction === 'x') {
                edge = lastItem.position().left +
                       lastItem.outerWidth(true);

                // set the scrollview's view width to the original width
                scrollview.width(edge);

                // set the parent container's height to the height of
                // the scrollview
                this.element.height(scrollview.height());
            }
            else if (config.direction === 'y') {
                edge = lastItem.position().top +
                       lastItem.outerHeight(true);

                // set the scrollview's view height to the original height
                scrollview.height(edge);

                // set the parent container's width to the width of the
                // scrollview
                this.element.width(scrollview.width());
            }
        }
    }
});

})(jQuery);
(function($, undefined) {

ensureNS("jQuery.mobile.tizen");

jQuery.extend( jQuery.mobile.tizen,
{
    _widgetPrototypes: {},

    /*
     * load the prototype for a widget.
     *
     * If @widget is a string, the function looks for @widget.prototype.html in the proto-html/ subdirectory of the
     * framework's current theme and loads the file via AJAX into a string. Note that the file will only be loaded via
     * AJAX once. If two widget instances based on the same @widget value are to be constructed, the second will be
     * constructed from the cached copy of the prototype of the first instance.
     *
     * If @widget is not a string, it is assumed to be a hash containing at least one key, "proto", the value of which is
     * the string to be used for the widget prototype. if another key named "key" is also provided, it will serve as the
     * key under which to cache the prototype, so it need not be rendered again in the future.
     *
     * Given the string for the widget prototype, the following patterns occurring in the string are replaced:
     *
     *   "${FRAMEWORK_ROOT}" - replaced with the path to the root of the framework
     *
     * The function then creates a jQuery $("<div>") object containing the prototype from the string.
     *
     * If @ui is not provided, the jQuery object containing the prototype is returned.
     *
     * If @ui is provided, it is assumed to be a (possibly multi-level) hash containing CSS selectors. For every level of
     * the hash and for each string-valued key at that level, the CSS selector specified as the value is sought in the
     * prototype jQuery object and, if found, the value of the key is replaced with the jQuery object resulting from the
     * search. Additionally, if the CSS selector is of the form "#widgetid", the "id" attribute will be removed from the
     * elements contained within the resulting jQuery object. The resulting hash is returned.
     *
     * Examples:
     *
     * 1.
     * $.mobile.tizen.loadPrototype("mywidget") => Returns a <div> containing the structure from the file
     * mywidget.prototype.html located in the current theme folder of the current framework.
     *
     * 2. $.mobile.tizen.loadPrototype("mywidget", ui):
     * where ui is a hash that looks like this:
     * ui = {
     *   element1: "<css selector 1>",
     *   element2: "<css selector 2>",
     *   group1: {
     *     group1element1: "<css selector 3>",
     *     group1element1: "<css selector 4>"
     *   }
     *  ...
     * }
     *
     * In this case, after loading the prototype as in Example 1, loadPrototype will traverse @ui and replace the CSS
     * selector strings with the result of the search for the selector string upon the prototype. If any of the CSS
     * selectors are of the form "#elementid" then the "id" attribute will be stripped from the elements selected. This
     * means that they will no longer be accessible via the selector used initially. @ui is then returned thus modified.
     */

    loadPrototype: function(widget, ui) {
        var ret = undefined,
            theScriptTag = $("script[data-framework-version][data-framework-root][data-framework-theme]"),
            frameworkRootPath = theScriptTag.attr("data-framework-root")    + "/" +
                                theScriptTag.attr("data-framework-version") + "/";

        function replaceVariables(s) {
            return s.replace(/\$\{FRAMEWORK_ROOT\}/g, frameworkRootPath);
        }

        function fillObj(obj, uiProto) {
            var selector;

            for (var key in obj) {
                if (typeof obj[key] === "string") {
                    selector = obj[key];
                    obj[key] = uiProto.find(obj[key]);
                    if (selector.substring(0, 1) === "#")
                        obj[key].removeAttr("id");
                }
                else
                if (typeof obj[key] === "object")
                    obj[key] = fillObj(obj[key], uiProto);
            }
            return obj;
        }

        /* If @widget is a string ... */
        if (typeof widget === "string") {
            /* ... try to use it as a key into the cached prototype hash ... */
            ret = $.mobile.tizen._widgetPrototypes[widget];
            if (ret === undefined) {
                /* ... and if the proto was not found, try to load its definition ... */
                var protoPath = frameworkRootPath + "proto-html" + "/" +
                                theScriptTag.attr("data-framework-theme");
                $.ajax({
                    url: protoPath + "/" + widget + ".prototype.html",
                    async: false,
                    dataType: "html"
                })
                 .success(function(data, textStatus, jqXHR) {
                    /* ... and if loading succeeds, cache it and use a copy of it ... */
                    $.mobile.tizen._widgetPrototypes[widget] = $("<div>").html(replaceVariables(data));
                    ret = $.mobile.tizen._widgetPrototypes[widget].clone();
                });
            }
        }
        /* Otherwise ... */
        else {
            /* ... if a key was provided ... */
            if (widget.key !== undefined)
                /* ... try to use it as a key into the cached prototype hash ... */
                ret = $.mobile.tizen._widgetPrototypes[widget.key];

            /* ... and if the proto was not found in the cache ... */
            if (ret === undefined) {
                /* ... and a proto definition string was provided ... */
                if (widget.proto !== undefined) {
                    /* ... create a new proto from the definition ... */
                    ret = $("<div>").html(replaceVariables(widget.proto));
                    /* ... and if a key was provided ... */
                    if (widget.key !== undefined)
                        /* ... cache a copy of the proto under that key */
                        $.mobile.tizen._widgetPrototypes[widget.key] = ret.clone();
                }
            }
            else
                /* otherwise, if the proto /was/ found in the cache, return a copy of it */
                ret = ret.clone();
        }

        /* If the prototype was found/created successfully ... */
        if (ret != undefined)
            /* ... and @ui was provided */
            if (ui != undefined)
                /* ... return @ui, but replace the CSS selectors it contains with the elements they select */
                ret = fillObj(ui, ret);

        return ret;
    }
});
})(jQuery);
/*
* jQuery Mobile Framework : scrollview plugin
* Copyright (c) 2010 Adobe Systems Incorporated - Kin Blas (jblas@adobe.com)
* Dual licensed under the MIT (MIT-LICENSE.txt) and GPL (GPL-LICENSE.txt) licenses.
* Note: Code is in draft form and is subject to change
* Modified by Koeun Choi <koeun.choi@samsung.com>
* Modified by Minkyu Kang <mk7.kang@samsung.com>
*/

(function ( $, window, document, undefined ) {

	function setElementTransform( $ele, x, y, duration ) {
		var v = "translate(" + x + "," + y + ")",
			transition;

		if ( !duration || duration === undefined ) {
			transition = "none";
		} else {
			transition =  "-webkit-transform " + duration / 1000 + "s";
		}

		$ele.css({
			"-moz-transform": v,
			"-webkit-transform": v,
			"-ms-transform": v,
			"-o-transform": v,
			"transform": v,
			"-webkit-transition": transition
		});
	}

	function MomentumTracker( options ) {
		this.options = $.extend( {}, options );
		this.easing = "easeOutQuad";
		this.reset();
	}

	var tstates = {
		scrolling: 0,
		overshot:  1,
		snapback:  2,
		done:      3
	};

	function getCurrentTime() {
		return ( new Date() ).getTime();
	}

	jQuery.widget( "tizen.scrollview", jQuery.mobile.widget, {
		options: {
			fps:               60,    // Frames per second in msecs.
			direction:         null,  // "x", "y", or null for both.

			scrollDuration:    2000,  // Duration of the scrolling animation in msecs.
			overshootDuration: 250,   // Duration of the overshoot animation in msecs.
			snapbackDuration:  500,   // Duration of the snapback animation in msecs.

			moveThreshold:     50,   // User must move this many pixels in any direction to trigger a scroll.
			moveIntervalThreshold:     150,   // Time between mousemoves must not exceed this threshold.

			scrollMethod:      "translate",  // "translate", "position", "scroll"
			startEventName:    "scrollstart",
			updateEventName:   "scrollupdate",
			stopEventName:     "scrollstop",

			eventType:         $.support.touch ? "touch" : "mouse",

			showScrollBars:    true,

			pagingEnabled:     false,
			overshootEnable:   false,

			delayedClickSelector: "a,input,textarea,select,button,.ui-btn"
		},

		_makePositioned: function ( $ele ) {
			if ( $ele.css("position") === "static" ) {
				$ele.css( "position", "relative" );
			}
		},

		_create: function () {
			var $page = $('.ui-page'),
				$child,
				direction,
				self = this;

			this._$clip = $( this.element ).addClass("ui-scrollview-clip");

			$child = this._$clip.wrapInner("<div></div>").children();

			this._$view = $child.addClass("ui-scrollview-view");

			if ( this.options.scrollMethod === "translate" ) {
				if ( this._$view.css("transform") === undefined ) {
					this.options.scrollMethod = "position";
				}
			}

			this._$clip.css( "overflow",
				this.options.scrollMethod === "scroll" ? "scroll" : "hidden" );

			this._makePositioned( this._$clip );

			/*
			 * Turn off our faux scrollbars if we are using native scrolling
			 * to position the view.
			 */
			if ( this.options.scrollMethod === "scroll" ) {
				this.options.showScrollBars = false;
			}

			/*
			 * We really don't need this if we are using a translate transformation
			 * for scrolling. We set it just in case the user wants to switch methods
			 * on the fly.
			 */
			this._makePositioned( this._$view );
			this._$view.css({ left: 0, top: 0 });

			this._sx = 0;
			this._sy = 0;

			direction = this.options.direction;

			this._hTracker = ( direction !== "y" ) ?
					new MomentumTracker( this.options ) : null;
			this._vTracker = ( direction !== "x" ) ?
					new MomentumTracker( this.options ) : null;

			this._timerInterval = 1000 / this.options.fps;
			this._timerID = 0;

			this._timerCB = function () {
				self._handleMomentumScroll();
			};

			this._addBehaviors();
		},

		_startMScroll: function ( speedX, speedY ) {
			this._stopMScroll();
			this._showScrollBars();

			var keepGoing = false,
				duration = this.options.scrollDuration,
				ht = this._hTracker,
				vt = this._vTracker,
				c,
				v;

			this._$clip.trigger( this.options.startEventName );
			$( document ).trigger("scrollview_scroll");

			if ( ht ) {
				c = this._$clip.width();
				v = this._$view.width();
				ht.start( this._sx, speedX,
					duration, (v > c) ? -(v - c) : 0, 0 );
				keepGoing = !ht.done();
			}

			if ( vt ) {
				c = this._$clip.height();
				v = this._$view.height() +
					parseFloat( this._$view.css("padding-top") );

				vt.start( this._sy, speedY,
					duration, (v > c) ? -(v - c) : 0, 0 );
				keepGoing = keepGoing || !vt.done();
			}

			if ( keepGoing ) {
				this._timerID = setTimeout( this._timerCB, this._timerInterval );
			} else {
				this._stopMScroll();
			}
		},

		_stopMScroll: function () {
			if ( this._timerID ) {
				this._$clip.trigger( this.options.stopEventName );
				clearTimeout( this._timerID );
			}
			this._timerID = 0;

			if ( this._vTracker ) {
				this._vTracker.reset();
			}

			if ( this._hTracker ) {
				this._hTracker.reset();
			}

			this._hideScrollBars();
		},

		_handleMomentumScroll: function () {
			var keepGoing = false,
				v = this._$view,
				x = 0,
				y = 0,
				vt = this._vTracker,
				ht = this._hTracker;

			if ( vt ) {
				vt.update( this.options.overshootEnable );
				y = vt.getPosition();
				keepGoing = !vt.done();
			}

			if ( ht ) {
				ht.update( this.options.overshootEnable );
				x = ht.getPosition();
				keepGoing = keepGoing || !ht.done();
			}

			this._setScrollPosition( x, y );
			this._$clip.trigger( this.options.updateEventName,
					[ { x: x, y: y } ] );

			if ( keepGoing ) {
				this._timerID = setTimeout( this._timerCB, this._timerInterval );
			} else {
				this._stopMScroll();
			}
		},

		_setCalibration: function ( x, y ) {
			if ( this.options.overshootEnable ) {
				this._sx = x;
				this._sy = y;
				return;
			}

			var v = this._$view,
				c = this._$clip,
				dirLock = this._directionLock,
				scroll_height = 0;

			if ( dirLock !== "y" && this._hTracker ) {
				this._sx = x;
			}

			if ( dirLock !== "x" && this._vTracker ) {
				scroll_height = v.height() - c.height() +
					parseFloat( c.css("padding-top") ) +
					parseFloat( c.css("padding-bottom") );

				if ( y >= 0 ) {
					this._sy = 0;
				} else if ( y < -scroll_height ) {
					this._sy = -scroll_height;
				} else {
					this._sy = y;
				}

				if ( scroll_height < 0 ) {
					this._sy = 0;
				}
			}
		},

		_setScrollPosition: function ( x, y, duration ) {
			this._setCalibration( x, y );

			x = this._sx;
			y = this._sy;

			var $v = this._$view,
				sm = this.options.scrollMethod,
				$vsb = this._$vScrollBar,
				$hsb = this._$hScrollBar,
				$sbt;

			switch ( sm ) {
			case "translate":
				setElementTransform( $v, x + "px", y + "px", duration );
				break;

			case "position":
				$v.css({left: x + "px", top: y + "px"});
				break;

			case "scroll":
				this._$clip[0].scrollLeft = -x;
				this._$clip[0].scrollTop = -y;
				break;
			}

			if ( $vsb ) {
				$sbt = $vsb.find(".ui-scrollbar-thumb");

				if ( sm === "translate" ) {
					setElementTransform( $sbt, "0px",
						-y / $v.height() * $sbt.parent().height() + "px",
						duration );
				} else {
					$sbt.css( "top", -y / $v.height() * 100 + "%" );
				}
			}

			if ( $hsb ) {
				$sbt = $hsb.find(".ui-scrollbar-thumb");

				if ( sm === "translate" ) {
					setElementTransform( $sbt,
						-x / $v.width() * $sbt.parent().width() + "px", "0px",
						duration);
				} else {
					$sbt.css("left", -x / $v.width() * 100 + "%");
				}
			}
		},

		scrollTo: function ( x, y, duration ) {
			this._stopMScroll();

			/*
			 * currently support only animation for translate
			 * Don't want to use setTimeout algorithm for animation.
			 */
			if ( !duration || (duration && this.options.scrollMethod === "translate") ) {
				return this._setScrollPosition( x, y, duration );
			}

			// follow jqm default animation when the scrollmethod is not translate.

			x = -x;
			y = -y;

			var self = this,
				start = getCurrentTime(),
				efunc = $.easing.easeOutQuad,
				sx = this._sx,
				sy = this._sy,
				dx = x - sx,
				dy = y - sy,
				tfunc;

			tfunc = function () {
				var elapsed = getCurrentTime() - start,
				    ec;

				if ( elapsed >= duration ) {
					self._timerID = 0;
					self._setScrollPosition( x, y );
				} else {
					ec = efunc( elapsed / duration, elapsed, 0, 1, duration );

					self._setScrollPosition( sx + (dx * ec), sy + (dy * ec) );
					self._timerID = setTimeout( tfunc, self._timerInterval );
				}
			};

			this._timerID = setTimeout( tfunc, this._timerInterval );
		},

		getScrollPosition: function () {
			return { x: -this._sx, y: -this._sy };
		},

		_getScrollHierarchy: function () {
			var svh = [],
				d;

			this._$clip.parents(".ui-scrollview-clip").each(function () {
				d = $( this ).jqmData("scrollview");
				if ( d ) {
					svh.unshift( d );
				}
			});
			return svh;
		},

		_getAncestorByDirection: function ( dir ) {
			var svh = this._getScrollHierarchy(),
				n = svh.length,
				sv,
				svdir;

			while ( 0 < n-- ) {
				sv = svh[n];
				svdir = sv.options.direction;

				if (!svdir || svdir === dir) {
					return sv;
				}
			}
			return null;
		},

		_handleDragStart: function ( e, ex, ey ) {
			// Stop any scrolling of elements in our parent hierarcy.
			$.each( this._getScrollHierarchy(), function (i, sv) {
				sv._stopMScroll();
			});
			this._stopMScroll();

			this._didDrag = false;

			var target = $( e.target ),
				shouldBlockEvent = 1,
				c = this._$clip,
				v = this._$view,
				cw = 0,
				vw = 0,
				ch = 0,
				vh = 0,
				svdir = this.options.direction,
				thumb;

			// should skip the dragging when click the button
			this._skip_dragging = target.is('.ui-btn-text') ||
					target.is('.ui-btn-inner');

			if ( this._skip_dragging ) {
				return;
			}

			/*
			 * If we're using mouse events, we need to prevent the default
			 * behavior to suppress accidental selection of text, etc. We
			 * can't do this on touch devices because it will disable the
			 * generation of "click" events.
			 */

			this._shouldBlockEvent = !( target.is(':input') ||
					target.parents(':input').length > 0 );

			if ( this._shouldBlockEvent ) {
				e.preventDefault();
			}

			this._lastX = ex;
			this._lastY = ey;
			this._startY = ey;
			this._doSnapBackX = false;
			this._doSnapBackY = false;
			this._speedX = 0;
			this._speedY = 0;

			this._directionLock = "";

			if ( this._hTracker ) {
				cw = parseInt( c.css("width"), 10 );
				vw = parseInt( v.css("width"), 10 );
				this._maxX = cw - vw;

				if ( this._maxX > 0 ) {
					this._maxX = 0;
				}
				if ( this._$hScrollBar  && vw ) {
					thumb = this._$hScrollBar.find(".ui-scrollbar-thumb");
					thumb.css( "width", (cw >= vw ? "100%" :
							(Math.floor(cw / vw * 100) || 1) + "%") );
				}
			}

			if ( this._vTracker ) {
				ch = parseInt( c.css("height"), 10 );
				vh = parseInt( v.css("height"), 10 ) +
					parseFloat( v.css("padding-top") );
				this._maxY = ch - vh;

				if ( this._maxY > 0 ) {
					this._maxY = 0;
				}
				if ( this._$vScrollBar && vh ) {
					thumb = this._$vScrollBar.find(".ui-scrollbar-thumb");
					thumb.css( "height", (ch >= vh ? "100%" :
							(Math.floor(ch / vh * 100) || 1) + "%") );
				}
			}

			this._pageDelta = 0;
			this._pageSize = 0;
			this._pagePos = 0;

			if ( this.options.pagingEnabled && (svdir === "x" || svdir === "y") ) {
				this._pageSize = (svdir === "x") ? cw : ch;
				this._pagePos = (svdir === "x") ? this._sx : this._sy;
				this._pagePos -= this._pagePos % this._pageSize;
			}

			this._lastMove = 0;
			this._enableTracking();
		},

		_propagateDragMove: function ( sv, e, ex, ey, dir ) {
			this._hideScrollBars();
			this._disableTracking();
			sv._handleDragStart( e, ex, ey );
			sv._directionLock = dir;
			sv._didDrag = this._didDrag;
		},

		_handleDragMove: function ( e, ex, ey ) {
			if ( this._skip_dragging ) {
				return;
			}

			if ( !this._dragging ) {
				return;
			}

			if ( this._shouldBlockEvent ) {
				e.preventDefault();
			}

			var mt = this.options.moveThreshold,
				v = this._$view,
				dx = ex - this._lastX,
				dy = ey - this._lastY,
				svdir = this.options.direction,
				dir = null,
				x,
				y,
				sv,
				scope,
				newX,
				newY,
				dirLock,
				opos,
				cpos,
				delta;

			if ( Math.abs( this._startY - ey ) < mt && !this._didDrag ) {
				return;
			}

			this._lastMove = getCurrentTime();
			if ( !this._directionLock ) {
				x = Math.abs( dx );
				y = Math.abs( dy );

				if ( x < mt && y < mt ) {
					return false;
				}

				if ( x < y && (x / y) < 0.5 ) {
					dir = "y";
				} else if ( x > y && (y / x) < 0.5 ) {
					dir = "x";
				}

				if ( svdir && dir && svdir !== dir ) {
					/*
					 * This scrollview can't handle the direction the user
					 * is attempting to scroll. Find an ancestor scrollview
					 * that can handle the request.
					 */

					sv = this._getAncestorByDirection( dir );
					if ( sv ) {
						this._propagateDragMove( sv, e, ex, ey, dir );
						return false;
					}
				}

				//this._directionLock = svdir ? svdir : (dir ? dir : "none");
				this._directionLock = svdir || (dir || "none");
			}

			newX = this._sx;
			newY = this._sy;
			dirLock = this._directionLock;

			if ( dirLock !== "y" && this._hTracker ) {
				x = this._sx;
				this._speedX = dx;
				newX = x + dx;

				// Simulate resistance.

				this._doSnapBackX = false;

				scope = (newX > 0 || newX < this._maxX);
				if ( scope && dirLock === "x" ) {
					sv = this._getAncestorByDirection("x");
					if ( sv ) {
						this._setScrollPosition( newX > 0 ?
								0 : this._maxX, newY );
						this._propagateDragMove( sv, e, ex, ey, dir );
						return false;
					}

					newX = x + (dx / 2);
					this._doSnapBackX = true;
				}
			}

			if ( dirLock !== "x" && this._vTracker ) {
				y = this._sy;
				this._speedY = dy;
				newY = y + dy;

				// Simulate resistance.

				this._doSnapBackY = false;

				scope = (newY > 0 || newY < this._maxY);
				if ( scope && dirLock === "y" ) {
					sv = this._getAncestorByDirection("y");
					if ( sv ) {
						this._setScrollPosition( newX,
								newY > 0 ? 0 : this._maxY );
						this._propagateDragMove( sv, e, ex, ey, dir );
						return false;
					}

					newY = y + (dy / 2);
					this._doSnapBackY = true;
				}
			}

			if ( this.options.overshootEnable === false ) {
				this._doSnapBackX = false;
				this._doSnapBackY = false;
			}

			if ( this.options.pagingEnabled && (svdir === "x" || svdir === "y") ) {
				if ( this._doSnapBackX || this._doSnapBackY ) {
					this._pageDelta = 0;
				} else {
					opos = this._pagePos;
					cpos = svdir === "x" ? newX : newY;
					delta = svdir === "x" ? dx : dy;

					if ( opos > cpos && delta < 0 ) {
						this._pageDelta = this._pageSize;
					} else if ( opos < cpos && delta > 0 ) {
						this._pageDelta = -this._pageSize;
					} else {
						this._pageDelta = 0;
					}
				}
			}

			this._didDrag = true;
			this._lastX = ex;
			this._lastY = ey;

			this._setScrollPosition( newX, newY );

			this._showScrollBars();
		},

		_handleDragStop: function ( e ) {
			if ( this._skip_dragging ) {
				return;
			}

			var l = this._lastMove,
				t = getCurrentTime(),
				doScroll = (l && (t - l) <= this.options.moveIntervalThreshold),
				sx = ( this._hTracker && this._speedX && doScroll ) ?
						this._speedX : ( this._doSnapBackX ? 1 : 0 ),
				sy = ( this._vTracker && this._speedY && doScroll ) ?
						this._speedY : ( this._doSnapBackY ? 1 : 0 ),
				svdir = this.options.direction,
				x,
				y;

			if ( this.options.pagingEnabled && (svdir === "x" || svdir === "y") &&
					!this._doSnapBackX && !this._doSnapBackY ) {
				x = this._sx;
				y = this._sy;

				if ( svdir === "x" ) {
					x = -this._pagePos + this._pageDelta;
				} else {
					y = -this._pagePos + this._pageDelta;
				}

				this.scrollTo( x, y, this.options.snapbackDuration );
			} else if ( sx || sy ) {
				this._startMScroll( sx, sy );
			} else {
				this._hideScrollBars();
			}

			this._disableTracking();

			if ( !this._didDrag && this.options.eventType === "touch" ) {
				$(e.target).closest(this.options.delayedClickSelector).trigger("click");
			}

			/*
			 * If a view scrolled, then we need to absorb
			 * the event so that links etc, underneath our
			 * cursor/finger don't fire.
			 */

			return !this._didDrag;
		},

		_enableTracking: function () {
			this._dragging = true;
		},

		_disableTracking: function () {
			this._dragging = false;
		},

		_showScrollBars: function () {
			var vclass = "ui-scrollbar-visible";
			if ( this._$vScrollBar ) {
				this._$vScrollBar.addClass( vclass );
			}
			if ( this._$hScrollBar ) {
				this._$hScrollBar.addClass( vclass );
			}
		},

		_hideScrollBars: function () {
			var vclass = "ui-scrollbar-visible";
			if ( this._$vScrollBar ) {
				this._$vScrollBar.removeClass( vclass );
			}
			if ( this._$hScrollBar ) {
				this._$hScrollBar.removeClass( vclass );
			}
		},

		_addBehaviors: function () {
			var self = this,
				$c = this._$clip,
				prefix = "<div class=\"ui-scrollbar ui-scrollbar-",
				suffix = "\"><div class=\"ui-scrollbar-track\"><div class=\"ui-scrollbar-thumb\"></div></div></div>";

			if ( this.options.eventType === "mouse" ) {
				this._dragEvt = "mousedown mousemove mouseup click";
				this._dragCB = function ( e ) {
					switch ( e.type ) {
					case "mousedown":
						return self._handleDragStart( e,
								e.clientX, e.clientY );

					case "mousemove":
						return self._handleDragMove( e,
								e.clientX, e.clientY );

					case "mouseup":
						return self._handleDragStop( e );

					case "click":
						return !self._didDrag;
					}
				};
			} else {
				this._dragEvt = "touchstart touchmove touchend vclick";
				this._dragCB = function ( e ) {
					var t;

					switch ( e.type ) {
					case "touchstart":
						t = e.originalEvent.targetTouches[0];
						return self._handleDragStart( e,
								t.pageX, t.pageY );

					case "touchmove":
						t = e.originalEvent.targetTouches[0];
						return self._handleDragMove( e,
								t.pageX, t.pageY );

					case "touchend":
						return self._handleDragStop( e );

					case "vclick":
						return !self._didDrag;
					}
				};
			}

			this._$view.bind( this._dragEvt, this._dragCB );

			if ( this.options.showScrollBars ) {
				if ( this._vTracker ) {
					$c.append( prefix + "y" + suffix );
					this._$vScrollBar = $c.children(".ui-scrollbar-y");
				}
				if ( this._hTracker ) {
					$c.append( prefix + "x" + suffix );
					this._$hScrollBar = $c.children(".ui-scrollbar-x");
				}
			}
		}
	});

	$.extend( MomentumTracker.prototype, {
		start: function ( pos, speed, duration, minPos, maxPos ) {
			var tstate = (pos < minPos || pos > maxPos) ?
					tstates.snapback : tstates.scrolling,
				pos_temp;

			this.state = (speed !== 0) ? tstate : tstates.done;
			this.pos = pos;
			this.speed = speed;
			this.duration = (this.state === tstates.snapback) ?
					this.options.snapbackDuration : duration;
			this.minPos = minPos;
			this.maxPos = maxPos;

			this.fromPos = (this.state === tstates.snapback) ? this.pos : 0;
			pos_temp = (this.pos < this.minPos) ? this.minPos : this.maxPos;
			this.toPos = (this.state === tstates.snapback) ? pos_temp : 0;

			this.startTime = getCurrentTime();
		},

		reset: function () {
			this.state = tstates.done;
			this.pos = 0;
			this.speed = 0;
			this.minPos = 0;
			this.maxPos = 0;
			this.duration = 0;
		},

		update: function ( overshootEnable ) {
			var state = this.state,
				cur_time = getCurrentTime(),
				duration = this.duration,
				elapsed =  cur_time - this.startTime,
				dx,
				x,
				didOverShoot;

			if ( state === tstates.done ) {
				return this.pos;
			}

			elapsed = elapsed > duration ? duration : elapsed;

			if ( state === tstates.scrolling || state === tstates.overshot ) {
				dx = this.speed *
					(1 - $.easing[this.easing]( elapsed / duration,
								elapsed, 0, 1, duration ));

				x = this.pos + dx;

				didOverShoot = (state === tstates.scrolling) &&
					(x < this.minPos || x > this.maxPos);

				if ( didOverShoot ) {
					x = (x < this.minPos) ? this.minPos : this.maxPos;
				}

				this.pos = x;

				if ( state === tstates.overshot ) {
					if ( elapsed >= duration ) {
						this.state = tstates.snapback;
						this.fromPos = this.pos;
						this.toPos = (x < this.minPos) ?
								this.minPos : this.maxPos;
						this.duration = this.options.snapbackDuration;
						this.startTime = cur_time;
						elapsed = 0;
					}
				} else if ( state === tstates.scrolling ) {
					if ( didOverShoot && overshootEnable ) {
						this.state = tstates.overshot;
						this.speed = dx / 2;
						this.duration = this.options.overshootDuration;
						this.startTime = cur_time;
					} else if ( elapsed >= duration ) {
						this.state = tstates.done;
					}
				}
			} else if ( state === tstates.snapback ) {
				if ( elapsed >= duration ) {
					this.pos = this.toPos;
					this.state = tstates.done;
				} else {
					this.pos = this.fromPos + ((this.toPos - this.fromPos) *
						$.easing[this.easing]( elapsed / duration,
							elapsed, 0, 1, duration ));
				}
			}

			return this.pos;
		},

		done: function () {
			return this.state === tstates.done;
		},

		getPosition: function () {
			return this.pos;
		}
	});

	function resizePageContentHeight( page ) {
		var $page = $( page ),
			$content = $page.children(".ui-content"),
			hh = $page.children(".ui-header").outerHeight() || 0,
			fh = $page.children(".ui-footer").outerHeight() || 0,
			pt = parseFloat( $content.css("padding-top") ),
			pb = parseFloat( $content.css("padding-bottom") ),
			wh = $(window).height();

		$content.height( wh - (hh + fh) - (pt + pb) );
	}

	// auto-init scrollview and scrolllistview widgets
	$( document ).bind( 'pagecreate create', function ( e ) {
		var $page = $( e.target ),
			scroll = $page.find(".ui-content").attr("data-scroll");

		if ( scroll === "none" ) {
			return;
		}

		if ( $.support.scrollview === undefined ) {
			// set as default value
			$.support.scrollview = true;
		}

		if ( $.support.scrollview === true && scroll === undefined ) {
			$page.find(".ui-content").attr( "data-scroll", "y" );
		}

		$page.find(":jqmData(scroll):not(.ui-scrollview-clip)").each( function () {
			if ( $( this ).hasClass("ui-scrolllistview") ) {
				$( this ).scrolllistview();
			} else {
				var st = $( this ).jqmData("scroll"),
					paging = st && (st.search(/^[xy]p$/) !== -1),
					dir = st && (st.search(/^[xy]/) !== -1) ? st.charAt(0) : null,
					opts;

				opts = {
					direction: dir || undefined,
					paging: paging || undefined,
					scrollMethod: $( this ).jqmData("scroll-method") || undefined
				};

				$( this ).scrollview( opts );
			}
		});
	});

	$( document ).bind( 'pageshow', function ( e ) {
		var $page = $( e.target ),
			scroll = $page.find(".ui-content").attr("data-scroll");

		if ( scroll === "y" ) {
			setTimeout( function () {
				resizePageContentHeight( e.target );
			}, 100);
		}
	});

	$( window ).bind( "orientationchange", function ( e ) {
		resizePageContentHeight( $(".ui-page") );
	});

}( jQuery, window, document ) );
/*!
 * jQuery Templates Plugin 1.0.0pre
 * http://github.com/jquery/jquery-tmpl
 * Requires jQuery 1.4.2
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 */
(function( jQuery, undefined ){
	var oldManip = jQuery.fn.domManip, tmplItmAtt = "_tmplitem", htmlExpr = /^[^<]*(<[\w\W]+>)[^>]*$|\{\{\! /,
		newTmplItems = {}, wrappedItems = {}, appendToTmplItems, topTmplItem = { key: 0, data: {} }, itemKey = 0, cloneIndex = 0, stack = [];

	function newTmplItem( options, parentItem, fn, data ) {
		// Returns a template item data structure for a new rendered instance of a template (a 'template item').
		// The content field is a hierarchical array of strings and nested items (to be
		// removed and replaced by nodes field of dom elements, once inserted in DOM).
		var newItem = {
			data: data || (data === 0 || data === false) ? data : (parentItem ? parentItem.data : {}),
			_wrap: parentItem ? parentItem._wrap : null,
			tmpl: null,
			parent: parentItem || null,
			nodes: [],
			calls: tiCalls,
			nest: tiNest,
			wrap: tiWrap,
			html: tiHtml,
			update: tiUpdate
		};
		if ( options ) {
			jQuery.extend( newItem, options, { nodes: [], parent: parentItem });
		}
		if ( fn ) {
			// Build the hierarchical content to be used during insertion into DOM
			newItem.tmpl = fn;
			newItem._ctnt = newItem._ctnt || newItem.tmpl( jQuery, newItem );
			newItem.key = ++itemKey;
			// Keep track of new template item, until it is stored as jQuery Data on DOM element
			(stack.length ? wrappedItems : newTmplItems)[itemKey] = newItem;
		}
		return newItem;
	}

	// Override appendTo etc., in order to provide support for targeting multiple elements. (This code would disappear if integrated in jquery core).
	jQuery.each({
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function( name, original ) {
		jQuery.fn[ name ] = function( selector ) {
			var ret = [], insert = jQuery( selector ), elems, i, l, tmplItems,
				parent = this.length === 1 && this[0].parentNode;

			appendToTmplItems = newTmplItems || {};
			if ( parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1 ) {
				insert[ original ]( this[0] );
				ret = this;
			} else {
				for ( i = 0, l = insert.length; i < l; i++ ) {
					cloneIndex = i;
					elems = (i > 0 ? this.clone(true) : this).get();
					jQuery( insert[i] )[ original ]( elems );
					ret = ret.concat( elems );
				}
				cloneIndex = 0;
				ret = this.pushStack( ret, name, insert.selector );
			}
			tmplItems = appendToTmplItems;
			appendToTmplItems = null;
			jQuery.tmpl.complete( tmplItems );
			return ret;
		};
	});

	jQuery.fn.extend({
		// Use first wrapped element as template markup.
		// Return wrapped set of template items, obtained by rendering template against data.
		tmpl: function( data, options, parentItem ) {
			return jQuery.tmpl( this[0], data, options, parentItem );
		},

		// Find which rendered template item the first wrapped DOM element belongs to
		tmplItem: function() {
			return jQuery.tmplItem( this[0] );
		},

		// Consider the first wrapped element as a template declaration, and get the compiled template or store it as a named template.
		template: function( name ) {
			return jQuery.template( name, this[0] );
		},

		domManip: function( args, table, callback, options ) {
			if ( args[0] && jQuery.isArray( args[0] )) {
				var dmArgs = jQuery.makeArray( arguments ), elems = args[0], elemsLength = elems.length, i = 0, tmplItem;
				while ( i < elemsLength && !(tmplItem = jQuery.data( elems[i++], "tmplItem" ))) {}
				if ( tmplItem && cloneIndex ) {
					dmArgs[2] = function( fragClone ) {
						// Handler called by oldManip when rendered template has been inserted into DOM.
						jQuery.tmpl.afterManip( this, fragClone, callback );
					};
				}
				oldManip.apply( this, dmArgs );
			} else {
				oldManip.apply( this, arguments );
			}
			cloneIndex = 0;
			if ( !appendToTmplItems ) {
				jQuery.tmpl.complete( newTmplItems );
			}
			return this;
		}
	});

	jQuery.extend({
		// Return wrapped set of template items, obtained by rendering template against data.
		tmpl: function( tmpl, data, options, parentItem ) {
			var ret, topLevel = !parentItem;
			if ( topLevel ) {
				// This is a top-level tmpl call (not from a nested template using {{tmpl}})
				parentItem = topTmplItem;
				tmpl = jQuery.template[tmpl] || jQuery.template( null, tmpl );
				wrappedItems = {}; // Any wrapped items will be rebuilt, since this is top level
			} else if ( !tmpl ) {
				// The template item is already associated with DOM - this is a refresh.
				// Re-evaluate rendered template for the parentItem
				tmpl = parentItem.tmpl;
				newTmplItems[parentItem.key] = parentItem;
				parentItem.nodes = [];
				if ( parentItem.wrapped ) {
					updateWrapped( parentItem, parentItem.wrapped );
				}
				// Rebuild, without creating a new template item
				return jQuery( build( parentItem, null, parentItem.tmpl( jQuery, parentItem ) ));
			}
			if ( !tmpl ) {
				return []; // Could throw...
			}
			if ( typeof data === "function" ) {
				data = data.call( parentItem || {} );
			}
			if ( options && options.wrapped ) {
				updateWrapped( options, options.wrapped );
			}
			ret = jQuery.isArray( data ) ?
				jQuery.map( data, function( dataItem ) {
					return dataItem ? newTmplItem( options, parentItem, tmpl, dataItem ) : null;
				}) :
				[ newTmplItem( options, parentItem, tmpl, data ) ];
			return topLevel ? jQuery( build( parentItem, null, ret ) ) : ret;
		},

		// Return rendered template item for an element.
		tmplItem: function( elem ) {
			var tmplItem;
			if ( elem instanceof jQuery ) {
				elem = elem[0];
			}
			while ( elem && elem.nodeType === 1 && !(tmplItem = jQuery.data( elem, "tmplItem" )) && (elem = elem.parentNode) ) {}
			return tmplItem || topTmplItem;
		},

		// Set:
		// Use $.template( name, tmpl ) to cache a named template,
		// where tmpl is a template string, a script element or a jQuery instance wrapping a script element, etc.
		// Use $( "selector" ).template( name ) to provide access by name to a script block template declaration.

		// Get:
		// Use $.template( name ) to access a cached template.
		// Also $( selectorToScriptBlock ).template(), or $.template( null, templateString )
		// will return the compiled template, without adding a name reference.
		// If templateString includes at least one HTML tag, $.template( templateString ) is equivalent
		// to $.template( null, templateString )
		template: function( name, tmpl ) {
			if (tmpl) {
				// Compile template and associate with name
				if ( typeof tmpl === "string" ) {
					// This is an HTML string being passed directly in.
					tmpl = buildTmplFn( tmpl );
				} else if ( tmpl instanceof jQuery ) {
					tmpl = tmpl[0] || {};
				}
				if ( tmpl.nodeType ) {
					// If this is a template block, use cached copy, or generate tmpl function and cache.
					tmpl = jQuery.data( tmpl, "tmpl" ) || jQuery.data( tmpl, "tmpl", buildTmplFn( tmpl.innerHTML ));
					// Issue: In IE, if the container element is not a script block, the innerHTML will remove quotes from attribute values whenever the value does not include white space.
					// This means that foo="${x}" will not work if the value of x includes white space: foo="${x}" -> foo=value of x.
					// To correct this, include space in tag: foo="${ x }" -> foo="value of x"
				}
				return typeof name === "string" ? (jQuery.template[name] = tmpl) : tmpl;
			}
			// Return named compiled template
			return name ? (typeof name !== "string" ? jQuery.template( null, name ):
				(jQuery.template[name] ||
					// If not in map, and not containing at least on HTML tag, treat as a selector.
					// (If integrated with core, use quickExpr.exec)
					jQuery.template( null, htmlExpr.test( name ) ? name : jQuery( name )))) : null;
		},

		encode: function( text ) {
			// Do HTML encoding replacing < > & and ' and " by corresponding entities.
			return ("" + text).split("<").join("&lt;").split(">").join("&gt;").split('"').join("&#34;").split("'").join("&#39;");
		}
	});

	jQuery.extend( jQuery.tmpl, {
		tag: {
			"tmpl": {
				_default: { $2: "null" },
				open: "if($notnull_1){__=__.concat($item.nest($1,$2));}"
				// tmpl target parameter can be of type function, so use $1, not $1a (so not auto detection of functions)
				// This means that {{tmpl foo}} treats foo as a template (which IS a function).
				// Explicit parens can be used if foo is a function that returns a template: {{tmpl foo()}}.
			},
			"wrap": {
				_default: { $2: "null" },
				open: "$item.calls(__,$1,$2);__=[];",
				close: "call=$item.calls();__=call._.concat($item.wrap(call,__));"
			},
			"each": {
				_default: { $2: "$index, $value" },
				open: "if($notnull_1){$.each($1a,function($2){with(this){",
				close: "}});}"
			},
			"if": {
				open: "if(($notnull_1) && $1a){",
				close: "}"
			},
			"else": {
				_default: { $1: "true" },
				open: "}else if(($notnull_1) && $1a){"
			},
			"html": {
				// Unecoded expression evaluation.
				open: "if($notnull_1){__.push($1a);}"
			},
			"=": {
				// Encoded expression evaluation. Abbreviated form is ${}.
				_default: { $1: "$data" },
				open: "if($notnull_1){__.push($.encode($1a));}"
			},
			"!": {
				// Comment tag. Skipped by parser
				open: ""
			}
		},

		// This stub can be overridden, e.g. in jquery.tmplPlus for providing rendered events
		complete: function( items ) {
			newTmplItems = {};
		},

		// Call this from code which overrides domManip, or equivalent
		// Manage cloning/storing template items etc.
		afterManip: function afterManip( elem, fragClone, callback ) {
			// Provides cloned fragment ready for fixup prior to and after insertion into DOM
			var content = fragClone.nodeType === 11 ?
				jQuery.makeArray(fragClone.childNodes) :
				fragClone.nodeType === 1 ? [fragClone] : [];

			// Return fragment to original caller (e.g. append) for DOM insertion
			callback.call( elem, fragClone );

			// Fragment has been inserted:- Add inserted nodes to tmplItem data structure. Replace inserted element annotations by jQuery.data.
			storeTmplItems( content );
			cloneIndex++;
		}
	});

	//========================== Private helper functions, used by code above ==========================

	function build( tmplItem, nested, content ) {
		// Convert hierarchical content into flat string array
		// and finally return array of fragments ready for DOM insertion
		var frag, ret = content ? jQuery.map( content, function( item ) {
			return (typeof item === "string") ?
				// Insert template item annotations, to be converted to jQuery.data( "tmplItem" ) when elems are inserted into DOM.
				(tmplItem.key ? item.replace( /(<\w+)(?=[\s>])(?![^>]*_tmplitem)([^>]*)/g, "$1 " + tmplItmAtt + "=\"" + tmplItem.key + "\" $2" ) : item) :
				// This is a child template item. Build nested template.
				build( item, tmplItem, item._ctnt );
		}) :
		// If content is not defined, insert tmplItem directly. Not a template item. May be a string, or a string array, e.g. from {{html $item.html()}}.
		tmplItem;
		if ( nested ) {
			return ret;
		}

		// top-level template
		ret = ret.join("");

		// Support templates which have initial or final text nodes, or consist only of text
		// Also support HTML entities within the HTML markup.
		ret.replace( /^\s*([^<\s][^<]*)?(<[\w\W]+>)([^>]*[^>\s])?\s*$/, function( all, before, middle, after) {
			frag = jQuery( middle ).get();

			storeTmplItems( frag );
			if ( before ) {
				frag = unencode( before ).concat(frag);
			}
			if ( after ) {
				frag = frag.concat(unencode( after ));
			}
		});
		return frag ? frag : unencode( ret );
	}

	function unencode( text ) {
		// Use createElement, since createTextNode will not render HTML entities correctly
		var el = document.createElement( "div" );
		el.innerHTML = text;
		return jQuery.makeArray(el.childNodes);
	}

	// Generate a reusable function that will serve to render a template against data
	function buildTmplFn( markup ) {
		return new Function("jQuery","$item",
			// Use the variable __ to hold a string array while building the compiled template. (See https://github.com/jquery/jquery-tmpl/issues#issue/10).
			"var $=jQuery,call,__=[],$data=$item.data;" +

			// Introduce the data as local variables using with(){}
			"with($data){__.push('" +

			// Convert the template into pure JavaScript
			jQuery.trim(markup)
				.replace( /([\\'])/g, "\\$1" )
				.replace( /[\r\t\n]/g, " " )
				.replace( /\$\{([^\}]*)\}/g, "{{= $1}}" )
				.replace( /\{\{(\/?)(\w+|.)(?:\(((?:[^\}]|\}(?!\}))*?)?\))?(?:\s+(.*?)?)?(\(((?:[^\}]|\}(?!\}))*?)\))?\s*\}\}/g,
				function( all, slash, type, fnargs, target, parens, args ) {
					var tag = jQuery.tmpl.tag[ type ], def, expr, exprAutoFnDetect;
					if ( !tag ) {
						throw "Unknown template tag: " + type;
					}
					def = tag._default || [];
					if ( parens && !/\w$/.test(target)) {
						target += parens;
						parens = "";
					}
					if ( target ) {
						target = unescape( target );
						args = args ? ("," + unescape( args ) + ")") : (parens ? ")" : "");
						// Support for target being things like a.toLowerCase();
						// In that case don't call with template item as 'this' pointer. Just evaluate...
						expr = parens ? (target.indexOf(".") > -1 ? target + unescape( parens ) : ("(" + target + ").call($item" + args)) : target;
						exprAutoFnDetect = parens ? expr : "(typeof(" + target + ")==='function'?(" + target + ").call($item):(" + target + "))";
					} else {
						exprAutoFnDetect = expr = def.$1 || "null";
					}
					fnargs = unescape( fnargs );
					return "');" +
						tag[ slash ? "close" : "open" ]
							.split( "$notnull_1" ).join( target ? "typeof(" + target + ")!=='undefined' && (" + target + ")!=null" : "true" )
							.split( "$1a" ).join( exprAutoFnDetect )
							.split( "$1" ).join( expr )
							.split( "$2" ).join( fnargs || def.$2 || "" ) +
						"__.push('";
				}) +
			"');}return __;"
		);
	}
	function updateWrapped( options, wrapped ) {
		// Build the wrapped content.
		options._wrap = build( options, true,
			// Suport imperative scenario in which options.wrapped can be set to a selector or an HTML string.
			jQuery.isArray( wrapped ) ? wrapped : [htmlExpr.test( wrapped ) ? wrapped : jQuery( wrapped ).html()]
		).join("");
	}

	function unescape( args ) {
		return args ? args.replace( /\\'/g, "'").replace(/\\\\/g, "\\" ) : null;
	}
	function outerHtml( elem ) {
		var div = document.createElement("div");
		div.appendChild( elem.cloneNode(true) );
		return div.innerHTML;
	}

	// Store template items in jQuery.data(), ensuring a unique tmplItem data data structure for each rendered template instance.
	function storeTmplItems( content ) {
		var keySuffix = "_" + cloneIndex, elem, elems, newClonedItems = {}, i, l, m;
		for ( i = 0, l = content.length; i < l; i++ ) {
			if ( (elem = content[i]).nodeType !== 1 ) {
				continue;
			}
			elems = elem.getElementsByTagName("*");
			for ( m = elems.length - 1; m >= 0; m-- ) {
				processItemKey( elems[m] );
			}
			processItemKey( elem );
		}
		function processItemKey( el ) {
			var pntKey, pntNode = el, pntItem, tmplItem, key;
			// Ensure that each rendered template inserted into the DOM has its own template item,
			if ( (key = el.getAttribute( tmplItmAtt ))) {
				while ( pntNode.parentNode && (pntNode = pntNode.parentNode).nodeType === 1 && !(pntKey = pntNode.getAttribute( tmplItmAtt ))) { }
				if ( pntKey !== key ) {
					// The next ancestor with a _tmplitem expando is on a different key than this one.
					// So this is a top-level element within this template item
					// Set pntNode to the key of the parentNode, or to 0 if pntNode.parentNode is null, or pntNode is a fragment.
					pntNode = pntNode.parentNode ? (pntNode.nodeType === 11 ? 0 : (pntNode.getAttribute( tmplItmAtt ) || 0)) : 0;
					if ( !(tmplItem = newTmplItems[key]) ) {
						// The item is for wrapped content, and was copied from the temporary parent wrappedItem.
						tmplItem = wrappedItems[key];
						tmplItem = newTmplItem( tmplItem, newTmplItems[pntNode]||wrappedItems[pntNode] );
						tmplItem.key = ++itemKey;
						newTmplItems[itemKey] = tmplItem;
					}
					if ( cloneIndex ) {
						cloneTmplItem( key );
					}
				}
				el.removeAttribute( tmplItmAtt );
			} else if ( cloneIndex && (tmplItem = jQuery.data( el, "tmplItem" )) ) {
				// This was a rendered element, cloned during append or appendTo etc.
				// TmplItem stored in jQuery data has already been cloned in cloneCopyEvent. We must replace it with a fresh cloned tmplItem.
				cloneTmplItem( tmplItem.key );
				newTmplItems[tmplItem.key] = tmplItem;
				pntNode = jQuery.data( el.parentNode, "tmplItem" );
				pntNode = pntNode ? pntNode.key : 0;
			}
			if ( tmplItem ) {
				pntItem = tmplItem;
				// Find the template item of the parent element.
				// (Using !=, not !==, since pntItem.key is number, and pntNode may be a string)
				while ( pntItem && pntItem.key != pntNode ) {
					// Add this element as a top-level node for this rendered template item, as well as for any
					// ancestor items between this item and the item of its parent element
					pntItem.nodes.push( el );
					pntItem = pntItem.parent;
				}
				// Delete content built during rendering - reduce API surface area and memory use, and avoid exposing of stale data after rendering...
				delete tmplItem._ctnt;
				delete tmplItem._wrap;
				// Store template item as jQuery data on the element
				jQuery.data( el, "tmplItem", tmplItem );
			}
			function cloneTmplItem( key ) {
				key = key + keySuffix;
				tmplItem = newClonedItems[key] =
					(newClonedItems[key] || newTmplItem( tmplItem, newTmplItems[tmplItem.parent.key + keySuffix] || tmplItem.parent ));
			}
		}
	}

	//---- Helper functions for template item ----

	function tiCalls( content, tmpl, data, options ) {
		if ( !content ) {
			return stack.pop();
		}
		stack.push({ _: content, tmpl: tmpl, item:this, data: data, options: options });
	}

	function tiNest( tmpl, data, options ) {
		// nested template, using {{tmpl}} tag
		return jQuery.tmpl( jQuery.template( tmpl ), data, options, this );
	}

	function tiWrap( call, wrapped ) {
		// nested template, using {{wrap}} tag
		var options = call.options || {};
		options.wrapped = wrapped;
		// Apply the template, which may incorporate wrapped content,
		return jQuery.tmpl( jQuery.template( call.tmpl ), call.data, options, call.item );
	}

	function tiHtml( filter, textOnly ) {
		var wrapped = this._wrap;
		return jQuery.map(
			jQuery( jQuery.isArray( wrapped ) ? wrapped.join("") : wrapped ).filter( filter || "*" ),
			function(e) {
				return textOnly ?
					e.innerText || e.textContent :
					e.outerHTML || outerHtml(e);
			});
	}

	function tiUpdate() {
		var coll = this.nodes;
		jQuery.tmpl( null, null, null, this).insertBefore( coll[0] );
		jQuery( coll ).remove();
	}
})( jQuery );
/* ***************************************************************************
 * Copyright (c) 2000 - 2011 Samsung Electronics Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 * jQuery Mobile Framework : "controlbar" plugin
 * Copyright (c) jQuery Project
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 * Authors: Jinhyuk Jun <jinhyuk.jun@samsung.com>
*/

/**
 *  Controlbar can be created using data-role = "controlbar" inside footer 
 *  Framework determine which controlbar will display with controlbar attribute
 *
 * Attributes:
 *
 *     data-style : determine which controlbar will use ( tabbar / toolbar )
 *                    tabbar do not have back button, toolbar has back button 
 *
 * Examples:
 *         
 *     HTML markup for creating tabbar: ( 2 ~ 5 li item available )
 *     icon can be changed data-icon attribute
 *         <div data-role="footer"data-position ="fixed">
 *              <div data-role="controlbar" data-style="tabbar" >
 *                     <ul>
 *                            <li><a href="#" data-icon="ctrlbar-menu" class="ui-btn-active">Menu</a></li>
 *                            <li><a href="#" data-icon="ctrlbar-save" >Save</a></li>
 *                            <li><a href="#" data-icon="ctrlbar-share" >Share</a></li>
 *                     </ul>
 *             </div>
 *      </div>
 *
 *     HTML markup for creating toolbar: ( 2 ~ 5 li item available )
 *     icon can be changed data-icon attribute
 *         <div data-role="footer" data-position ="fixed">
 *              <div data-role="controlbar" data-style="toolbar" >
 *                     <ul>
 *                            <li><a href="#" data-icon="ctrlbar-menu" class="ui-btn-active">Menu</a></li>
 *                            <li><a href="#" data-icon="ctrlbar-save" >Save</a></li>
 *                            <li><a href="#" data-icon="ctrlbar-share" >Share</a></li>
 *                     </ul>
 *             </div>
 *      </div>
*/

(function ( $, undefined ) {

	$.widget( "tizen.controlbar", $.mobile.widget, {
		options: {
			iconpos: "top",
			grid: null,
			initSelector: ":jqmData(role='controlbar')"
		},

		_create: function () {

			var $controlbar = this.element,
				$navbtns = $controlbar.find( "a" ),
				iconpos = $navbtns.filter( ":jqmData(icon)" ).length ?
										this.options.iconpos : undefined,
				theme = $.mobile.listview.prototype.options.theme,	/* Get current theme */
				style = $controlbar.attr( "data-style" );

			if ( style === "left" || style === "right" ) {
				$controlbar
					.parents( ".ui-content" )
					.css( 'padding', '0' );
			} else {
				$controlbar
					.addClass( "ui-navbar" )
					.attr( "role", "navigation" )
					.find( "ul" )
						.grid( { grid: this.options.grid } );
			}

			if ( !iconpos ) {
				$controlbar.addClass( "ui-navbar-noicons" );
			}

			$navbtns.buttonMarkup({
				corners:	false,
				shadow:		false,
				iconpos:	iconpos
			});

			$controlbar.delegate( "a", "vclick", function ( event ) {
				$navbtns.not( ".ui-state-persist" ).removeClass( $.mobile.activeBtnClass );
				$( this ).addClass( $.mobile.activeBtnClass );
			});

			if ( style === "tabbar" || style === "toolbar" ) {
				$controlbar
					.addClass( "ui-controlbar-" + theme )
					.addClass( "ui-" + style + "-" + theme );
			} else {
				$controlbar
					.addClass( "ui-controlbar-" + style )
					.end();
			}

			$( document ).bind( "pagebeforeshow", function ( event, ui ) {
				var footer_filter = $( event.target ).find( ":jqmData(role='footer')" ),
					controlbar_filter = footer_filter.find( ":jqmData(role='controlbar')" ),
					style = controlbar_filter.jqmData( "style" );

				if ( style == "toolbar" || style == "tabbar" ) {
					/* Need to add text only style */
					if ( !(controlbar_filter.find(".ui-btn-inner").children().is(".ui-icon")) ) {
						controlbar_filter.find( ".ui-btn-inner" ).addClass( "ui-navbar-textonly" );
					} else {
						if ( controlbar_filter.find( ".ui-btn-text" ).text() == "" ) {
							controlbar_filter.find( ".ui-btn" ).addClass( "ui-ctrlbar-icononly" );
						}
					}
					footer_filter
						.css( "position", "fixed" )
						.css( "height", controlbar_filter.height() )
						.css( "top", window.innerHeight - footer_filter.height() );
					if ( style == "toolbar" ) {
						controlbar_filter
							.css( "width", window.innerWidth - controlbar_filter.siblings(".ui-btn").width() );
					}
				}
			});

			$( document ).bind( "pageshow", function ( e, ui ) {
				var controlbar_filter = $( ".ui-page" ).find( ":jqmData(role='footer')" ).eq( 0 ).find( ":jqmData(role='controlbar')" ),
					element_count = controlbar_filter.find( 'li' ).length;

				if ( controlbar_filter.find(".ui-btn-active").length == 0 ) {
					controlbar_filter.find( "div" ).css( "left", "0px" );
				} else {
					controlbar_filter.find( "div" ).css( "left", controlbar_filter.find( ".ui-btn-active" ).parent( "li" ).index() * controlbar_filter.width() / element_count );
				}

				/* Increase Content size with dummy <div> because of footer height */
				if ( controlbar_filter.length != 0 && $( ".ui-page-active" ).find( ".dummy-div" ).length == 0 && $( ".ui-page-active" ).find( ":jqmData(role='footer')" ).find( ":jqmData(role='controlbar')" ).length != 0 ) {
					$( ".ui-page-active" ).find( ":jqmData(role='content')" ).append( '<div class="dummy-div"></div>' );
					$( ".ui-page-active" ).find( ".dummy-div" )
						.css( "width", controlbar_filter.width() )
						.css( "height", controlbar_filter.height() );
				}
			});
		},

		_setDisabled: function ( value, cnt ) {
			this.element.find( "li" ).eq( cnt ).attr( "disabled", value );
			this.element.find( "li" ).eq( cnt ).attr( "aria-disabled", value );
		},

		disable: function ( cnt ) {
			this._setDisabled( true, cnt );
			this.element.find( "li" ).eq( cnt ).addClass( "ui-disabled" );
		},

		enable: function ( cnt ) {
			this._setDisabled( false, cnt );
			this.element.find( "li" ).eq( cnt ).removeClass( "ui-disabled" );
		}
	});

	//auto self-init widgets
	$( document ).bind( "pagecreate create", function ( e ) {
		$( $.tizen.controlbar.prototype.options.initSelector, e.target ).controlbar();
	});
}( jQuery ) );
/*global Globalize:false, range:false, regexp:false*/
/*
 * jQuery Mobile Widget @VERSION
 *
 * This software is licensed under the MIT licence (as defined by the OSI at
 * http://www.opensource.org/licenses/mit-license.php)
 *
 * ***************************************************************************
 * Copyright (C) 2011 by Intel Corporation Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 * Authors: Salvatore Iovene <salvatore.iovene@intel.com>
 *			Daehyon Jung <darrenh.jung@samsung.com>
 */

/**
 * datetimepicker is a widget that lets the user select a date and/or a 
 * time. If you'd prefer use as auto-initialization of form elements, 
 * use input elements with type=date/time/datetime within form tag
 * as same as other form elements.
 * 
 * HTML Attributes:
 * 
 *	data-role: 'datetimepicker'
 *	data-format: date format string. e.g) "MMM dd yyyy, HH:mm"
 *	type: 'date', 'datetime', 'time'
 *	data-val: pre-set value. any date/time string Date.parse() accepts.
 *
 * Options:
 *	type: 'date', 'datetime', 'time'
 *	format: see data-format in HTML Attributes.
 *	val: see data-val in HTML Attributes.
 *
 * APIs:
 *	getValue()
 *		: Get current selected date/time as W3C DTF style string.
 *	update()
 *		: Force to update fields.
 *
 * Events:
 *	data-changed: Raised when date/time was changed.
 *
 * Examples:
 *	<ul data-role="listview">
 *		<li class="ui-li-3-2-2">
 *			<span class="ui-li-text-main">
 *				<input type="datetime" name="demo-date" id="demo-date" 
 *					data-format="MMM dd yyyy hh:mm tt"/>
 *			</span>
 *			<span class="ui-li-text-sub">
 *				Date/Time Picker - <span id="selected-date1"><em>(select a date first)</em></span>
 *			</span>
 *		</li>
 *		<li class="ui-li-3-2-2">
 *			<span class="ui-li-text-main">
 *				<input type="date" name="demo-date2" id="demo-date2"/>
 *			</span>
 *			<span class="ui-li-text-sub">
 *				Date Picker  - <span id="selected-date2"><em>(select a date first)</em></span>
 *			</span>
 *		</li>
 *		<li class="ui-li-3-2-2">
 *			<span class="ui-li-text-main">
 *				<input type="time" name="demo-date3" id="demo-date3"/>
 *			</span>
 *			<span class="ui-li-text-sub">
 *				Time Picker - <span id="selected-date3"><em>(select a date first)</em></span>
 *			</span>
 *		</li>
 *	</ul>
 * How to get a return value:
 * ==========================
 * Bind to the 'date-changed' event, e.g.:
 *    $("#myDatetimepicker").bind("date-changed", function(e, date) {
 *        alert("New date: " + date.toString());
 *    });
 */


( function ( $, window, undefined ) {
	$.widget( "tizen.datetimepicker", $.tizen.widgetex, {
		options: {
			type: 'datetime', // date, time, datetime applicable
			format: null,
			val: null,
			initSelector: "input[type='date'], input[type='datetime'], input[type='time'], :jqmData(role='datetimepicker')"
		},

		_makeTwoDigits: function ( val ) {
			var ret = val.toString(10);

			if ( val < 10 ) {
				ret = "0" + ret;
			}
			return ret;
		},

		/**
		 * return W3C DTF string
		 */
		getValue: function () {
			var data = [],
				item,
				greg,
				obj = this,
				toTimeString,
				toDateString;

			for ( item in this.data ) {
				data[item] = this.data[item];
			}

			if ( this.calendar.convert ) {
				greg = this.calendar.convert.toGregorian( data.year, data.month, data.day );
				data.year = greg.getFullYear();
				data.month = greg.getMonth();
				data.day = greg.getDate();
			}
			obj = this;
			toTimeString = function timeStr( t ) {
				return obj._makeTwoDigits( t.hour ) + ':' +
					obj._makeTwoDigits( t.min ) + ':' +
					obj._makeTwoDigits( t.sec );
			};

			toDateString = function dateStr( d ) {
				return ( ( d.year % 10000 ) + 10000 ).toString().substr(1) + '-' +
					obj._makeTwoDigits( d.month ) + '-' +
					obj._makeTwoDigits( d.day );
			};

			switch ( this.options.type ) {
			case 'time':
				return toTimeString( data );
			case 'date':
				return toDateString( data );
			default:
				return toDateString( data ) + 'T' + toTimeString( data );
			}
		},

		_updateField: function ( target, value ) {
			if ( !target || target.length == 0 ) {
				return;
			}

			if ( value == 0 ) {
				value = "0";
			}

			var pat = target.jqmData( 'pat' ),
				hour;
			switch ( pat ) {
			case 'H':
			case 'HH':
			case 'h':
			case 'hh':
				hour = value;
				if ( pat.charAt(0) == 'h' ) {
					if ( hour > 12 ) {
						hour -= 12;
					} else if ( hour == 0 ) {
						hour = 12;
					}
				}
				if ( pat.length == 2 ) {
					hour = this._makeTwoDigits( hour );
				}
				target.text( hour );
				break;
			case 'm':
			case 'M':
			case 'd':
			case 's':
				target.text( value );
				break;
			case 'mm':
			case 'dd':
			case 'MM':
			case 'ss':
				target.text( this._makeTwoDigits( value ) );
				break;
			case 'MMM':
				target.text( this.calendar.months.namesAbbr[ value - 1] );
				break;
			case 'MMMM':
				target.text( this.calendar.months.names[ value - 1 ] );
				break;
			case 'yy':
				target.text( this._makeTwoDigits( value % 100 ) );
				break;
			case 'yyyy':
				if ( value < 10 ) {
					value = '000' + value;
				} else if ( value < 100 ) {
					value = '00' + value;
				} else if ( value < 1000 ) {
					value = '0' + value;
				}
				target.text( value );
				break;
			}

		},

		_format: function ( pattern ) {
			var token = this._parsePattern( pattern ),
				div = document.createElement('div'),
				attr = [],
				pat,
				tpl,
				ampm,
				btn;

			while ( token.length > 0 ) {
				pat = token.shift();
				tpl = '<span class="ui-datefield-%1" data-pat="' + pat + '">%2</span>';
				switch ( pat ) {
				case 'H': //0 1 2 3 ... 21 22 23
				case 'HH': //00 01 02 ... 21 22 23
				case 'h': //0 1 2 3 ... 11 12
				case 'hh': //00 01 02 ... 11 12
					$(div).append( tpl.replace('%1', 'hour') );
					attr.hour = true;
					break;
				case 'mm': //00 01 ... 59
				case 'm': //0 1 2 ... 59
					$(div).append( tpl.replace('%1', 'min') );
					attr.min = true;
					break;
				case 'ss':
				case 's':
					$(div).append( tpl.replace('%1', 'sec') );
					attr.sec = true;
					break;
				case 'd': // day of month 5					
				case 'dd': // day of month(leading zero) 05
					$(div).append( tpl.replace('%1', 'day') );
					attr.day = true;
					break;
				case 'M': // Month of year 9
				case 'MM': // Month of year(leading zero) 09
				case 'MMM':
				case 'MMMM':
					$(div).append( tpl.replace('%1', 'month') );
					attr.month = true;
					break;
				case 'yy':	// year two digit
				case 'yyyy': // year four digit
					$(div).append( tpl.replace('%1', 'year') );
					attr.year = true;
					break;
				case 't': //AM / PM indicator(first letter) A, P
					// add button
				case 'tt': //AM / PM indicator AM/PM
					// add button
					ampm = this.data.hour > 11 ?
							this.calendar.PM[0] : this.calendar.AM[0];
					btn = '<a href="#" class="ui-datefield-ampm"' +
						' data-role="button" data-inline="true">' +
						ampm + '</a>';
					$(div).append( btn );
					attr.ampm = true;
					break;
				case 'g':
				case 'gg':
					$(div).append( tpl.replace('%1', 'era').replace('%2', this.calendar.eras.name) );
					break;
				default : // string or any non-clickable object
					$(div).append( tpl.replace('%1', 'seperator').replace('%2', pat) );
					break;
				}
			}

			return {
				attr: attr,
				html: div
			};
		},

		_switchAmPm: function ( obj, owner ) {
			if ( this.calendar.AM != null ) {
				if ( this.calendar.AM[0] == $(owner).find('.ui-btn-text').text() ) { // AM to PM
					this.data.hour += 12;
					$(owner).find('.ui-btn-text').text( this.calendar.PM[0] );
				} else {	// PM to AM
					this.data.hour -= 12;
					$(owner).find('.ui-btn-text').text( this.calendar.AM[0] );
				}
				obj.update();
			}
		},

		update: function () {
			if ( $(this.elem).is('input') ) {
				this.options.val = this.getValue();
				this.elem.value = this.options.val;
			}
			$(this.elem).trigger('date-changed', this.getValue() );
		},

		_parsePattern: function ( pattern ) {
			var regex = /^(\/|\s|dd|d|MMMM|MMM|MM|M|yyyy|yy|y|hh|h|HH|H|mm|m|ss|s|tt|t|f|gg|g)|('[\w\W\s]*?')/,
				token = [],
				s;

			while ( pattern.length > 0 ) {
				s = regex.exec( pattern );
				if ( s ) {
					pattern = pattern.substr( s[0].length );
					if ( s[0].charAt(0) == "'" ) {
						s[0] = s[0].substr( 1, s[0].length - 2 );
					}
					token.push( s[0] );
				} else {
					token.push( pattern.charAt(0) );
					pattern = pattern.substr(1);
				}
			}

			return token;
		},

		_create: function () {
			var input = this.element.get(0),
				type = $(input).attr("type"),
				isTime,
				isDate,
				val,
				now,
				data,
				local,
				obj = this,
				$div;

			if ( type ) {
				obj.options.type = type;
			}

			isTime = type.indexOf("time") > -1;
			isDate = type.indexOf("date") > -1;
			$.extend( obj, {
				elem: input,
				time: isTime,
				date: isDate,
				calendar: window.Globalize.culture().calendars.standard,
				data: {
					"hour"	: 0,
					"min"	: 0,
					"sec"	: 0,
					"year"	: 0,
					"month"	: 0,
					"day"	: 0
				}

			});

			// init date&time
			val = this.options.val;
			if ( val ) {
				now = new Date( Date.parse( val ) );
			} else {
				now = new Date();
			}

			data = obj.data;
			if ( isDate ) {
				if ( obj.calendar.convert ) {
					local = obj.calendar.convert.fromGregorian( now );
					data.year = local.year;
					data.month = local.month + 1;
					data.day = local.day;
				} else {
					data.year = now.getFullYear();
					data.month = now.getMonth() + 1;
					data.day = now.getDate();
				}
			}

			if ( isTime ) {
				data.hour = now.getHours();
				data.min = now.getMinutes();
				data.sec = now.getSeconds();
			}

			$(input).css('display', 'none');
			$div = $(document.createElement('div'));
			$div.addClass('ui-datefield');
			$(input).after( $div );
			this._initField( this.options.type, $div );
			$div.trigger('create');

			$div.bind('vclick', function ( e ) {
				obj._showDataSelector( obj, this, e.target );
			});

			$div.find('.ui-datefield-ampm').bind( 'vclick', function ( e ) {
				obj._switchAmPm( obj, this );
			});
		},

		_populateDataSelector: function ( field, pat, obj ) {
			var values,
				numItems,
				current,
				data,
				range = window.range,
				local,
				yearlb,
				yearhb,
				day;


			switch ( field ) {
			case 'hour':
				if ( pat == 'H' ) {
					// twentyfour
					values = range( 0, 23 );
					data = range( 0, 23 );
					current = obj.data.hour;
				} else {
					values = range( 1, 12 );
					current = obj.data.hour - 1;//11
					if ( current >= 11 ) {
						current = current - 12;
						data = range( 13, 23 );
						data.push( 12 ); // consider 12:00 am as 00:00
					} else {
						data = range( 1, 11 );
						data.push( 0 );
					}
					if ( current < 0 ) {
						current = 11; // 12:00 or 00:00
					}
				}
				if ( pat.length == 2 ) {
					// two digit
					values = values.map( obj._makeTwoDigits );
				}
				numItems = values.length;
				break;
			case 'min':
			case 'sec':
				values = range( 0, 59 );
				if ( pat.length == 2 ) {
					values = values.map( obj._makeTwoDigits );
				}
				data = range( 0, 59 );
				current = ( field == 'min' ? obj.data.min : obj.data.sec );
				numItems = values.length;
				break;
			case 'year':
				local = new Date( 1900, 0, 1 );
				if ( obj.calendar.convert ) {
					local = obj.calendar.convert.fromGregorian( local );
					yearlb = local.year;
					yearhb = yearlb + 200;
				} else {
					yearlb = local.getFullYear();
					yearhb = yearlb + 200;
				}
				data = range( yearlb, yearhb );
				current = obj.data.year - yearlb;
				values = range( yearlb, yearhb );
				numItems = values.length;
				break;
			case 'month':
				switch ( pat.length ) {
				case 1:
					values = range( 1, 12 );
					break;
				case 2:
					values = range( 1, 12 ).map( obj._makeTwoDigits );
					break;
				case 3:
					values = obj.calendar.months.namesAbbr.slice();
					break;
				case 4:
					values = obj.calendar.months.names.slice();
					break;
				}
				if ( values.length == 13 ) { // @TODO Lunar calendar support
					if ( values[12] == "" ) { // to remove lunar calendar reserved space
						values.pop();
					}
				}
				data = range( 1, values.length );
				current = obj.data.month - 1;
				numItems = values.length;
				break;
			case 'day':
				//@TODO max number 31 -> depends on month
				day = 31;
				values = range( 1, day );
				if ( pat.length == 2 ) {
					values = values.map( obj._makeTwoDigits );
				}
				data = range( 1, day );
				current = obj.data.day - 1;
				numItems = day;
				break;
			}

			return {
				values: values,
				data: data,
				numItems: numItems,
				current: current
			};

		},

		_showDataSelector: function ( obj, ui, target ) {
			target = $(target);

			var attr = target.attr("class"),
				field = attr.match(/ui-datefield-([\w]*)/),
				pat,
				data,
				values,
				numItems,
				current,
				valuesData,
				item,
				$li,
				$item,
				$ul,
				$div,
				$ctx;

			if ( !attr ) {
				return;
			}
			if ( !field ) {
				return;
			}

			target.not('.ui-datefield-seperator').addClass('ui-datefield-selected');

			pat = target.jqmData('pat');
			data = obj._populateDataSelector( field[1], pat, obj );

			values = data.values;
			numItems = data.numItems;
			current = data.current;
			valuesData = data.data;

			if ( values ) {
				$ul = $(document.createElement('ul'));
				for ( item in values ) {
					$li = $(document.createElement('li'));
					$item = $(document.createElement('a'));
					$item.addClass('ui-link');
					$item.text( values[item] );
					$item.jqmData( "val", valuesData[item] );

					$li.append( $item );
					$ul.append( $li );

					if ( current == item ) {
						$li.addClass('current');
					}
				}

				/* TODO NEED TO REFACTORING HERE */
				$div = $(document.createElement('div'));
				$div.append( $ul ).appendTo( ui );
				$div.addClass('ui-datetimepicker-selector');
				$div.attr( 'data-transition', 'none' );
				$ctx = $div.ctxpopup();
				$ctx.parents('.ui-popupwindow').addClass('ui-datetimepicker');
				$div.circularview();
				$div.circularview( 'centerTo', '.current' );
				$ctx.popupwindow( 'open',
						target.offset().left + target.width() / 2 - window.pageXOffset,
						target.offset().top + target.height() - window.pageYOffset );
				$div.bind('closed', function ( e ) {
					$div.unbind( 'closed' );
					$ul.unbind( 'vclick' );
					$(obj).unbind( 'update' );
					$(ui).find('.ui-datefield-selected').removeClass('ui-datefield-selected');
					$ctx.popupwindow( 'destroy' );
					$div.remove();
				});

				$(obj).bind( 'update', function ( e, val ) {
					$ctx.popupwindow( 'close' );
					var data = $(ui).find( '.' + field[0] );
					obj._updateField( $(data), val );
					obj.data[ field[1] ] = val;
					obj.update();
				});

				$ul.bind( 'vclick', function ( e ) {
					if ( $(e.target).is('a') ) {
						$ul.find(".current").removeClass("current");
						$(e.target).parent().addClass('current');
						var val = $(e.target).jqmData("val");
						$(obj).trigger( 'update', val ); // close popup, unselect field
					}
				});
			}
		},

		_initField: function ( type, div ) {
			var date,
				time,
				datetime,
				updateFields = function ( obj, html, attr ) {
					var item;
					for ( item in attr ) {
						if ( attr[item] ) {
							obj._updateField( $(html).find( '.ui-datefield-' + item ),
								obj.data[item] );
						}
					}
				};

			if ( this.options.format ) {
				datetime = this._format( this.options.format );
				updateFields( this, datetime.html, datetime.attr );
				div.append( datetime.html );
			} else {
				if ( type.match( 'date' ) ) {
					date = this._format( this.calendar.patterns.d );
					$(date.html).addClass('date');
					updateFields( this, date.html, date.attr );
					div.append( date.html );
				}

				if ( type.match( 'datetime' ) ) {
					div.append( '<span class="ui-datefield-tab"></span>' );
				}

				if ( type.match( 'time' ) ) {
					time = this._format( this.calendar.patterns.t );
					$(time.html).addClass('time');
					updateFields( this, time.html, time.attr );
					div.append( time.html );
				}
			}
		}

	});

	$(document).bind("pagecreate create", function ( e ) {
		$($.tizen.datetimepicker.prototype.options.initSelector, e.target)
			.not(":jqmData(role='none'), :jqmData(role='nojs')")
			.datetimepicker();
	});

} ( jQuery, this ) );
/*
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) and GPL licenses
 * http://phpjs.org/functions/range
 * original by: Waldo Malqui Silva
 * version: 1107.2516
 */
function range( low, high, step ) {
    // Create an array containing the range of integers or characters
    // from low to high (inclusive)  
    // 
    // version: 1107.2516
    // discuss at: http://phpjs.org/functions/range
    // +   original by: Waldo Malqui Silva
    // *     example 1: range ( 0, 12 );
    // *     returns 1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    // *     example 2: range( 0, 100, 10 );
    // *     returns 2: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    // *     example 3: range( 'a', 'i' );
    // *     returns 3: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']
    // *     example 4: range( 'c', 'a' );
    // *     returns 4: ['c', 'b', 'a']
	var matrix = [],
		inival,
		endval,
		plus,
		walker = step || 1,
		chars = false;

    if (!isNaN(low) && !isNaN(high)) {
        inival = low;
        endval = high;
    } else if (isNaN(low) && isNaN(high)) {
        chars = true;
        inival = low.charCodeAt(0);
        endval = high.charCodeAt(0);
    } else {
        inival = (isNaN(low) ? 0 : low);
        endval = (isNaN(high) ? 0 : high);
    }

    plus = ((inival > endval) ? false : true);
    if (plus) {
        while (inival <= endval) {
            matrix.push(((chars) ? String.fromCharCode(inival) : inival));
            inival += walker;
        }
    } else {
        while (inival >= endval) {
            matrix.push(((chars) ? String.fromCharCode(inival) : inival));
            inival -= walker;
        }
    }

    return matrix;
}

/*
 * jQuery Mobile Widget @VERSION
 *
 * This software is licensed under the MIT licence (as defined by the OSI at
 * http://www.opensource.org/licenses/mit-license.php)
 *
 * ***************************************************************************
 * Copyright (C) 2011 by Intel Corporation Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 * Authors: Rijubrata Bhaumik <rijubrata.bhaumik@intel.com>
 *          Elliot Smith <elliot.smith@intel.com>
 */

// Displays a day selector element: a control group with 7 check
// boxes which can be toggled on and off.
//
// The widget can be invoked on fieldset element with
// $(element).dayselector() or by creating a fieldset element with
// data-role="dayselector". If you try to apply it to an element
// of type other than fieldset, results will be unpredictable.
//
// The default is to display the controlgroup horizontally; you can
// override this by setting data-type="vertical" on the fieldset,
// or by passing a type option to the constructor. The data-type
// attribute has precedence.
//
// If no ID is supplied for the dayselector, one will be generated
// automatically.
//
// Methods:
//
//     value: Return the day numbers (0=Sunday, ..., 6=Saturday) of
//            the selected checkboxes as an array.
//
//     selectAll: Select all 7 days of the week by automatically "ticking"
//                all of the checkboxes.
//
// Options:
//
//     theme : Override the data-theme of the widget; note that the
//             order of preference is: 1) set from data-theme attribute;
//             2) set from option; 3) set from closest parent data-theme;
//             4) default to 'c'
//
//     type: 'horizontal' (default) or 'vertical'; specifies the type
//           of controlgroup to create around the day check boxes.
//
//     days: array of day names, Sunday first; defaults to English day
//           names; the first letters are used as text for the checkboxes

(function ( $, window, undefined ) {
	$.widget( "tizen.dayselector", $.mobile.widget, {
		options: {
			initSelector: 'fieldset:jqmData(role="dayselector")',
			theme: null,
			type: 'horizontal',
			days: ['Sunday',
			       'Monday',
			       'Tuesday',
			       'Wednesday',
			       'Thursday',
			       'Friday',
			       'Saturday']
		},

		defaultTheme: 'c',

		_create: function () {
			var days,
				parentId,
				i,
				day,
				letter,
				id,
				labelClass,
				checkbox,
				label;

			this.element.addClass( 'ui-dayselector' );

			this.options.type = this.element.jqmData( 'type' ) || this.options.type;

			this.options.theme = this.element.jqmData( 'theme' ) ||
									this.options.theme ||
									this.element.closest( ':jqmData(theme)').jqmData('theme' ) ||
									this.defaultTheme;

			days = this.options.days;

			this.element.attr( 'data-' + $.mobile.ns + 'type', this.options.type );

			parentId = this.element.attr( 'id' ) ||
							'dayselector' + ( new Date() ).getTime();

			for ( i = 0; i < days.length; i++ ) {
				day = days[i];
				letter = day.slice(0, 1);

				if ( window.Globalize ) {
					//TODO may some modification required to support
					//	start week day difference upon cultures.
					letter = window.Globalize.culture().calendars.standard.days.namesShort[i];
				}
				id = parentId + '_' + i;
				labelClass = 'ui-dayselector-label-' + i;

				checkbox = $( '<input type="checkbox"/>' )
							.attr( 'id', id )
							.attr( 'value', i );

				label = $( '<label>' + letter + '</label>' )
						.attr( 'for', id )
						.addClass( labelClass );

				this.element.append( checkbox );
				this.element.append( label );
			}

			this.checkboxes = this.element
								.find( ':checkbox' )
								.checkboxradio( { theme: this.options.theme } );

			this.element.controlgroup( { excludeInvisible: false } );
		},

		_setOption: function ( key, value ) {
			if ( key === "disabled" ) {
				this._setDisabled( value );
			}
		},

		_setDisabled: function ( value ) {
			$.Widget.prototype._setOption.call(this, "disabled", value);
			this.element[value ? "addClass" : "removeClass"]("ui-disabled");
		},

		value: function () {
			var values = this.checkboxes.filter( ':checked' ).map( function () {
				return this.value;
			} ).get();

			return values;
		},

		selectAll: function () {
			this.checkboxes
				.attr( 'checked', 'checked' )
				.checkboxradio( 'refresh' );
		}

	} ); /* End of Widget */

	// auto self-init widgets
	$( document ).bind( "pagebeforecreate", function ( e ) {
		var elts = $( $.tizen.dayselector.prototype.options.initSelector, e.target );
		elts.not( ":jqmData(role='none'), :jqmData(role='nojs')" ).dayselector();
	} );

}( jQuery, this ) );
/* ***************************************************************************
 * Copyright (c) 2000 - 2011 Samsung Electronics Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 */
/**
 * Displays vertical multi-level list.
 *
 * To apply, add the attribute data-expandable="true" and id="parentid" to a <li> element for parent list item
 * and add the arrribute data-expanded-by="parentid" to a <li> element for child list item.
 *
 * HTML Attributes:
 *		data-expandable: Parent list item must have 'true' value for this attribute
 *		data-expanded-by: Child list item expanded by parent list item must have 'true' value for this attribute
 *		data-initial-expansion: If you want expandable list to be expanded initially, set this value as 'true'
 *
 * Example:
 *     <li data-expandable="true" id="exp1" data-initial-expansion="true">Parent</li>
 *     <li data-expanded-by="exp1">Child</li>
 */

( function ( $, undefined ) {

	$.widget( "tizen.expandablelist", $.mobile.widget, {
		options: {
			initSelector: ":jqmData(expandable='true')"
		},

		_hide: function ( e ) {
			$( e ).removeClass( 'ui-li-expand-transition-show' )
				.addClass( 'ui-li-expand-transition-hide' );
		},
		_show: function ( e ) {
			$( e ).removeClass( 'ui-li-expand-transition-hide' )
				.addClass( 'ui-li-expand-transition-show' );
		},
		_hide_expand_img: function ( e ) {
			$( e ).removeClass( 'ui-li-expandable-hidden' )
				.addClass( 'ui-li-expandable-shown' );

			$( e ).find( ".ui-li-expand-icon" )
				.addClass( "ui-li-expanded-icon" )
				.removeClass( "ui-li-expand-icon" );
		},
		_show_expand_img: function ( e ) {
			$( e ).removeClass( 'ui-li-expandable-shown' )
				.addClass( 'ui-li-expandable-hidden' );

			$( e ).find( ".ui-li-expanded-icon" )
				.addClass( "ui-li-expand-icon" )
				.removeClass( "ui-li-expanded-icon" );
		},

		_set_expand_arrow: function ( self, e, parent_is_expanded ) {
			if ( parent_is_expanded ) {
				self._hide_expand_img( e );
			} else {
				self._show_expand_img( e );
			}
			if ( $( e[0] ).data( "expandable" ) && parent_is_expanded == false ) {
				var children = $( e ).nextAll( ":jqmData(expanded-by='" + $( e ).attr( 'id' ) + "')" );
				children.each( function ( idx, child ) {
					self._set_expand_arrow( self, child, e.is_expanded );
				} );
			}
		},

		_toggle: function ( self, e, parent_is_expanded ) {
			if ( ! parent_is_expanded ) {
				self._show( e );
			} else {
				self._hide( e );
				if ( $( e ).data( "expandable" ) && e.is_expanded == true ) {
					var children = $( e ).nextAll( ":jqmData(expanded-by='" + $( e ).attr( 'id' ) + "')" );
					children.each( function ( idx, child ) {
						self._toggle( self, child, e.is_expanded );
					} );
					e.is_expanded = false;
				}
			}
		},
		_is_hidden: function ( e ) {
			return ( $( e ).height( ) == 0);
		},

		_create: function ( ) {

			var children = $( this.element ).nextAll( ":jqmData(expanded-by='" + $( this.element ).attr( 'id' ) + "')" ),
				e = this.element,
				self = this,
				expanded = e.nextAll( ":jqmData(expanded-by='" + e[0].id + "')" ),
				initial_expansion = e.data( "initial-expansion" ),
				is_expanded = false,
				parent_id = null;

			if ( children.length == 0 ) {
				return;
			}

			if ( initial_expansion == true ) {
				parent_id = e.data( "expanded-by" );
				if ( parent_id ) {
					if ( $( "#" + parent_id ).is_expanded == true) {
						is_expanded = true;
					}
				} else {
					is_expanded = true;
				}
			}

			e[0].is_expanded = is_expanded;
			if ( e[0].is_expanded ) {
				self._hide_expand_img( e );
				$(e).append( "<div class='ui-li-expanded-icon'></div>" );
			} else {
				self._show_expand_img( e );
				$(e).append( "<div class='ui-li-expand-icon'></div>" );
			}

			if ( e[0].is_expanded ) {
				expanded.each( function ( i, e ) { self._show( e ); } );
			} else {
				expanded.each( function ( i, e ) { self._hide( e ); } );
			}

			expanded.addClass( "ui-li-expanded" );

			e.bind( 'vclick', function ( ) {
				var _is_expanded = e[0].is_expanded;
				expanded.each( function ( i, e ) { self._toggle( self, e, _is_expanded ); } );
				e[0].is_expanded = ! e[0].is_expanded;

				self._set_expand_arrow( self, e, e[0].is_expanded );
			});
		}


	});	// end: $.widget()


	$( document ).bind( "pagecreate create", function ( e ) {
		$( $.tizen.expandablelist.prototype.options.initSelector, e.target )
			.not( ":jqmData(role='none'), :jqmData(role='nojs')" )
			.expandablelist( );
	});

} ( jQuery ) );
/* ***************************************************************************
 * Copyright (c) 2000 - 2011 Samsung Electronics Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 *	Author: Wongi Lee <wongi11.lee@samsung.com>
*/

/**
 *	Extendable List Widget for unlimited data.
 *	To support more then 1,000 items, special list widget developed.
 *	Fast initialize and append some element into the DOM tree repeatedly.
 *	DB connection and works like DB cursor.
 *
 * HTML Attributes:
 *
 *		data-role:	extendablelist
 *		data-template : jQuery.template ID that populate into extendable list. A button : a <DIV> element with "data-role : button" should be included on data-template.
 *		data-dbtable : DB Table name. It used as window[DB NAME]. Loaded data should be converted as window object.
 *		data-extenditems : Number of elements to extend at once.
 *		
 *		ID : <UL> element that has "data-role=extendablelist" must have ID attribute.
 *		Class : <UL> element that has "data-role=extendablelist" should have "vlLoadSuccess" class to guaranty DB loading is completed.
 *		tmp_load_more : Template ID for "load more" message and button.
 *
 *
 *APIs:
 *
 *		create ( void )
 *			: API to call _create method. API for AJAX or DB loading callback.
 *
 *		recreate ( Array )
 *			: Update extendable list with new data array. For example, update with search result.
 *
 *Examples:
 *
 *		<script id="tmp-3-1-1" type="text/x-jquery-tmpl">
 *			<li class="ui-li-3-1-1"><span class="ui-li-text-main">${NAME}</span></li>
 *		</script>
 *
 *		<script id="tmp_load_more" type="text/x-jquery-tmpl"> 
 *			<li class="ui-li-3-1-1" style="text-align:center; margin:0 auto">
 *				<div data-role="button">Load ${NUM_MORE_ITEMS} more items</div>
 *			</li>
 *		</script>
 *	
 *		<ul id = "extendable_list_main" data-role="extendablelist" data-extenditems="50" data-template="tmp-3-1-1" data-dbtable="JSON_DATA">
 *		</ul>
 *
 */


( function ( $, undefined ) {

	//Keeps track of the number of lists per page UID
	//This allows support for multiple nested list in the same page
	//https://github.com/jquery/jquery-mobile/issues/1617
	var listCountPerPage = {},
		TOTAL_ITEMS = 0,
		last_index = 0;

	$.widget( "tizen.extendablelist", $.mobile.widget, {
		options: {
			theme: "s",
			countTheme: "c",
			headerTheme: "b",
			dividerTheme: "b",
			splitIcon: "arrow-r",
			splitTheme: "b",
			inset: false,
			id:	"",						/* Extendable list UL elemet's ID */
			extenditems: 50,			/* Number of append items */
			childSelector: " li",		/* To support swipe list */
			dbtable: "",
			template : "",				/* Template for each list item */
			loadmore : "tmp_load_more",	/* Template for "Load more" message */
			scrollview: false,
			initSelector: ":jqmData(role='extendablelist')"
		},

		_stylerMouseUp: function () {
			$( this ).addClass( "ui-btn-up-s" );
			$( this ).removeClass( "ui-btn-down-s" );
		},

		_stylerMouseDown: function () {
			$( this ).addClass( "ui-btn-down-s" );
			$( this ).removeClass( "ui-btn-up-s" );
		},

		_stylerMouseOver: function () {
			$( this ).toggleClass( "ui-btn-hover-s" );
		},

		_stylerMouseOut: function () {
			$( this ).toggleClass( "ui-btn-hover-s" );
		},

		_pushData: function ( template, data ) {
			var o = this.options,
				i = 0,
				dataTable = data,
				myTemplate = $( "#" + template ),
				loadMoreItems = ( o.extenditems > data.length - last_index ? data.length - last_index : o.extenditems ),
				htmlData;

			for (i = 0; i < loadMoreItems; i++ ) {
				htmlData = myTemplate.tmpl( dataTable[ i ] );
				$( o.id ).append( $( htmlData ).attr( 'id', 'li_' + i ) );
				last_index++;
			}

			/* After push data, re-style extendable list widget */
			$( o.id ).trigger( "create" );
		},

		_loadmore: function ( event ) {
			var t = this,
				o = event.data,
				i = 0,
				dataTable = window[ o.dbtable ],
				myTemplate = $( "#" + o.template ),
				loadMoreItems = ( o.extenditems > dataTable.length - last_index ? dataTable.length - last_index : o.extenditems ),
				htmlData,
				more_items_to_load,
				num_next_load_items;

			/* Remove load more message */
			$( "#load_more_message" ).remove();

			/* Append More Items */
			for ( i = 0; i < loadMoreItems; i++ ) {
				htmlData = myTemplate.tmpl( dataTable[ last_index ] );
				$( o.id ).append( $( htmlData ).attr( 'id', 'li_' + last_index ) );
				last_index++;
			}

			/* Append "Load more" message on the last of list */
			if ( TOTAL_ITEMS > last_index ) {
				myTemplate = $( "#" + o.loadmore );
				more_items_to_load = TOTAL_ITEMS - last_index;
				num_next_load_items = ( o.extenditems <= more_items_to_load ) ? o.extenditems : more_items_to_load;
				htmlData = myTemplate.tmpl( { NUM_MORE_ITEMS : num_next_load_items } );

				$( o.id ).append( $( htmlData ).attr( 'id', "load_more_message" ) );
			}

			$( o.id ).trigger( "create" );
			$( o.id ).extendablelist( "refresh" );
		},

		recreate: function ( newArray ) {
			var t = this,
				o = this.options;

			$( o.id ).empty();

			TOTAL_ITEMS = newArray.length;

			t._pushData( ( o.template), newArray );

			if ( o.childSelector == " ul" ) {
				$( o.id + " ul" ).swipelist();
			}

			$( o.id ).extendablelist();

			t.refresh( true );
		},

		_initList: function () {
			var t = this,
				o = this.options,
				myTemplate,
				more_items_to_load,
				num_next_load_items,
				htmlData;

			/* After AJAX loading success */
			o.dbtable = t.element.data( "dbtable" );

			TOTAL_ITEMS = $( window[ o.dbtable ] ).size();

			/* Make Gen list by template */
			if ( last_index <= 0 ) {
				t._pushData( ( o.template ), window[ o.dbtable ] );

				/* Append "Load more" message on the last of list */
				if ( TOTAL_ITEMS > last_index ) {
					myTemplate = $( "#" + o.loadmore );
					more_items_to_load = TOTAL_ITEMS - last_index;
					num_next_load_items = ( o.extenditems <= more_items_to_load) ? o.extenditems : more_items_to_load;
					htmlData = myTemplate.tmpl( { NUM_MORE_ITEMS : num_next_load_items } );

					$( o.id ).append( $( htmlData ).attr( 'id', "load_more_message" ) );

					$( "#load_more_message" ).live( "click", t.options, t._loadmore );
				} else {
					/* No more items to load */
					$( "#load_more_message" ).die();
					$( "#load_more_message" ).remove();
				}
			}

			if ( o.childSelector == " ul" ) {
				$( o.id + " ul" ).swipelist();
			}

			$( o.id ).trigger( "create" );

			t.refresh( true );
		},

		create: function () {
			var o = this.options;

			/* external API for AJAX callback */
			this._create( "create" );
		},

		_create: function ( event ) {
			var t = this,
				o = this.options,
				$el = this.element;

			// create listview markup
			t.element.addClass( function ( i, orig ) {
				return orig + " ui-listview ui-extendable-list-container" + ( t.options.inset ? " ui-listview-inset ui-corner-all ui-shadow " : "" );
			});

			o.id = "#" + $el.attr( "id" );

			if ( $el.data( "extenditems" ) ) {
				o.extenditems = parseInt( $el.data( "extenditems" ), 10 );
			}

			$( o.id ).bind( "pagehide", function (e) {
				$( o.id ).empty();
			});

			/* Scroll view */
			if ( $( ".ui-scrollview-clip" ).size() > 0) {
				o.scrollview = true;
			} else {
				o.scrollview = false;
			}

			/* After DB Load complete, Init Extendable list */
			if ( $( o.id ).hasClass( "elLoadSuccess" ) ) {
				if ( !$( o.id ).hasClass( "elInitComplete" ) ) {
					if ( $el.data( "template" ) ) {
						o.template = $el.data( "template" );

						/* to support swipe list, <li> or <ul> can be main node of extendable list. */
						if ( $el.data( "swipelist" ) == true ) {
							o.childSelector = " ul";
						} else {
							o.shildSelector = " li";
						}
					}

					$( o.id ).addClass( "elInitComplete" );
				}

				t._initList();
			}
		},

		destroy : function () {
			var o = this.options;

			$( o.id ).empty();

			TOTAL_ITEMS = 0;
			last_index = 0;

			$( "#load_more_message" ).die();
		},

		_itemApply: function ( $list, item ) {
			var $countli = item.find( ".ui-li-count" );

			if ( $countli.length ) {
				item.addClass( "ui-li-has-count" );
			}

			$countli.addClass( "ui-btn-up-" + ( $list.jqmData( "counttheme" ) || this.options.countTheme ) + " ui-btn-corner-all" );

			// TODO class has to be defined in markup
			item.find( "h1, h2, h3, h4, h5, h6" ).addClass( "ui-li-heading" ).end()
				.find( "p, dl" ).addClass( "ui-li-desc" ).end()
				.find( ">img:eq(0), .ui-link-inherit>img:eq(0)" ).addClass( "ui-li-thumb" ).each(function () {
					item.addClass( $( this ).is( ".ui-li-icon" ) ? "ui-li-has-icon" : "ui-li-has-thumb" );
				}).end()
				.find( ".ui-li-aside" ).each(function () {
					var $this = $( this );
					$this.prependTo( $this.parent() ); //shift aside to front for css float
				});
		},

		_removeCorners: function ( li, which ) {
			var top = "ui-corner-top ui-corner-tr ui-corner-tl",
				bot = "ui-corner-bottom ui-corner-br ui-corner-bl";

			li = li.add( li.find( ".ui-btn-inner, .ui-li-link-alt, .ui-li-thumb" ) );

			if ( which === "top" ) {
				li.removeClass( top );
			} else if ( which === "bottom" ) {
				li.removeClass( bot );
			} else {
				li.removeClass( top + " " + bot );
			}
		},

		_refreshCorners: function ( create ) {
			var $li,
				$visibleli,
				$topli,
				$bottomli;

			if ( this.options.inset ) {
				$li = this.element.children( "li" );
				// at create time the li are not visible yet so we need to rely on .ui-screen-hidden
				$visibleli = create ? $li.not( ".ui-screen-hidden" ) : $li.filter( ":visible" );

				this._removeCorners( $li );

				// Select the first visible li element
				$topli = $visibleli.first()
					.addClass( "ui-corner-top" );

				$topli.add( $topli.find( ".ui-btn-inner" ) )
					.find( ".ui-li-link-alt" )
						.addClass( "ui-corner-tr" )
					.end()
					.find( ".ui-li-thumb" )
						.not( ".ui-li-icon" )
						.addClass( "ui-corner-tl" );

				// Select the last visible li element
				$bottomli = $visibleli.last()
					.addClass( "ui-corner-bottom" );

				$bottomli.add( $bottomli.find( ".ui-btn-inner" ) )
					.find( ".ui-li-link-alt" )
						.addClass( "ui-corner-br" )
					.end()
					.find( ".ui-li-thumb" )
						.not( ".ui-li-icon" )
						.addClass( "ui-corner-bl" );
			}
		},

		refresh: function ( create ) {
			this.parentPage = this.element.closest( ".ui-page" );
			this._createSubPages();

			var o = this.options,
				$list = this.element,
				self = this,
				dividertheme = $list.jqmData( "dividertheme" ) || o.dividerTheme,
				listsplittheme = $list.jqmData( "splittheme" ),
				listspliticon = $list.jqmData( "spliticon" ),
				li = $list.children( "li" ),
				counter = $.support.cssPseudoElement || !$.nodeName( $list[ 0 ], "ol" ) ? 0 : 1,
				item,
				itemClass,
				itemTheme,
				a,
				last,
				splittheme,
				countParent,
				icon,
				pos,
				numli;

			if ( counter ) {
				$list.find( ".ui-li-dec" ).remove();
			}

			for ( pos = 0, numli = li.length; pos < numli; pos++ ) {
				item = li.eq( pos );
				itemClass = "ui-li";

				// If we're creating the element, we update it regardless
				if ( create || !item.hasClass( "ui-li" ) ) {
					itemTheme = item.jqmData( "theme" ) || o.theme;
					a = item.children( "a" );

					if ( a.length ) {
						icon = item.jqmData( "icon" );

						item.buttonMarkup({
							wrapperEls: "div",
							shadow: false,
							corners: false,
							iconpos: "right",
							/* icon: a.length > 1 || icon === false ? false : icon || "arrow-r",*/
							icon: false,	/* Remove unnecessary arrow icon */
							theme: itemTheme
						});

						if ( ( icon != false ) && ( a.length == 1 ) ) {
							item.addClass( "ui-li-has-arrow" );
						}

						a.first().addClass( "ui-link-inherit" );

						if ( a.length > 1 ) {
							itemClass += " ui-li-has-alt";

							last = a.last();
							splittheme = listsplittheme || last.jqmData( "theme" ) || o.splitTheme;

							last.appendTo(item)
								.attr( "title", last.getEncodedText() )
								.addClass( "ui-li-link-alt" )
								.empty()
								.buttonMarkup({
									shadow: false,
									corners: false,
									theme: itemTheme,
									icon: false,
									iconpos: false
								})
								.find( ".ui-btn-inner" )
								.append(
									$( "<span />" ).buttonMarkup( {
										shadow : true,
										corners : true,
										theme : splittheme,
										iconpos : "notext",
										icon : listspliticon || last.jqmData( "icon" ) || o.splitIcon
									})
								);
						}
					} else if ( item.jqmData( "role" ) === "list-divider" ) {

						itemClass += " ui-li-divider ui-btn ui-bar-" + dividertheme;
						item.attr( "role", "heading" );

						//reset counter when a divider heading is encountered
						if ( counter ) {
							counter = 1;
						}

					} else {
						itemClass += " ui-li-static ui-body-" + itemTheme;
					}
				}

				if ( counter && itemClass.indexOf( "ui-li-divider" ) < 0 ) {
					countParent = item.is( ".ui-li-static:first" ) ? item : item.find( ".ui-link-inherit" );

					countParent.addClass( "ui-li-jsnumbering" )
						.prepend( "<span class='ui-li-dec'>" + (counter++) + ". </span>" );
				}

				item.add( item.children( ".ui-btn-inner" ) ).addClass( itemClass );

				self._itemApply( $list, item );
			}

			this._refreshCorners( create );
		},

		//create a string for ID/subpage url creation
		_idStringEscape: function ( str ) {
			return str.replace(/\W/g , "-");

		},

		_createSubPages: function () {
			var parentList = this.element,
				parentPage = parentList.closest( ".ui-page" ),
				parentUrl = parentPage.jqmData( "url" ),
				parentId = parentUrl || parentPage[ 0 ][ $.expando ],
				parentListId = parentList.attr( "id" ),
				o = this.options,
				dns = "data-" + $.mobile.ns,
				self = this,
				persistentFooterID = parentPage.find( ":jqmData(role='footer')" ).jqmData( "id" ),
				hasSubPages,
				newRemove;

			if ( typeof listCountPerPage[ parentId ] === "undefined" ) {
				listCountPerPage[ parentId ] = -1;
			}

			parentListId = parentListId || ++listCountPerPage[ parentId ];

			$( parentList.find( "li>ul, li>ol" ).toArray().reverse() ).each(function ( i ) {
				var self = this,
					list = $( this ),
					listId = list.attr( "id" ) || parentListId + "-" + i,
					parent = list.parent(),
					nodeEls,
					title = nodeEls.first().getEncodedText(),//url limits to first 30 chars of text
					id = ( parentUrl || "" ) + "&" + $.mobile.subPageUrlKey + "=" + listId,
					theme = list.jqmData( "theme" ) || o.theme,
					countTheme = list.jqmData( "counttheme" ) || parentList.jqmData( "counttheme" ) || o.countTheme,
					newPage,
					anchor;

				nodeEls = $( list.prevAll().toArray().reverse() );
				nodeEls = nodeEls.length ? nodeEls : $( "<span>" + $.trim(parent.contents()[ 0 ].nodeValue) + "</span>" );

				//define hasSubPages for use in later removal
				hasSubPages = true;

				newPage = list.detach()
							.wrap( "<div " + dns + "role='page' " +	dns + "url='" + id + "' " + dns + "theme='" + theme + "' " + dns + "count-theme='" + countTheme + "'><div " + dns + "role='content'></div></div>" )
							.parent()
								.before( "<div " + dns + "role='header' " + dns + "theme='" + o.headerTheme + "'><div class='ui-title'>" + title + "</div></div>" )
								.after( persistentFooterID ? $( "<div " + dns + "role='footer' " + dns + "id='" + persistentFooterID + "'>" ) : "" )
								.parent()
									.appendTo( $.mobile.pageContainer );

				newPage.page();

				anchor = parent.find('a:first');

				if ( !anchor.length ) {
					anchor = $( "<a/>" ).html( nodeEls || title ).prependTo( parent.empty() );
				}

				anchor.attr( "href", "#" + id );

			}).extendablelist();

			// on pagehide, remove any nested pages along with the parent page, as long as they aren't active
			// and aren't embedded
			if ( hasSubPages &&
					parentPage.is( ":jqmData(external-page='true')" ) &&
					parentPage.data( "page" ).options.domCache === false ) {

				newRemove = function ( e, ui ) {
					var nextPage = ui.nextPage, npURL;

					if ( ui.nextPage ) {
						npURL = nextPage.jqmData( "url" );
						if ( npURL.indexOf( parentUrl + "&" + $.mobile.subPageUrlKey ) !== 0 ) {
							self.childPages().remove();
							parentPage.remove();
						}
					}
				};

				// unbind the original page remove and replace with our specialized version
				parentPage
					.unbind( "pagehide.remove" )
					.bind( "pagehide.remove", newRemove);
			}
		},

		// TODO sort out a better way to track sub pages of the extendable listview this is brittle
		childPages: function () {
			var parentUrl = this.parentPage.jqmData( "url" );

			return $( ":jqmData(url^='" +  parentUrl + "&" + $.mobile.subPageUrlKey + "')" );
		}
	});

	//auto self-init widgets
	$( document ).bind( "pagecreate create", function ( e ) {
		$( $.tizen.extendablelist.prototype.options.initSelector, e.target ).extendablelist();
	});

}( jQuery ));
/* ***************************************************************************
 * Copyright (c) 2000 - 2011 Samsung Electronics Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 * Authors: Wonseop Kim ( wonseop.kim@samsung.com )
*/

/**
 * 'Handler' is widget that is working in conjunction with 'scrollview'.
 * 'Handler' is supporting 'scroll event( up/down )' and is indicating scroll
 * position.
 *
 * HTML Attributes:
 *
 *		data-handler : This attribute is indicating that whether enable.
 *						If you want to use, you will set 'true'.
 *		data-handlertheme : Set the widget theme ( optional )
 *
 * APIs:
 *
 *		enableHandler ( void )
 *			: Get a status that whether enable.
 *		enableHandler ( boolean )
 *			: Set a status that whether enable.
 *
 * Events:
 *
 * Examples:
 *
 *		<div data-role="content" data-scroll="y" data-handler="true">
 *			<ul data-role="listview">
 *				<li data-role="list-divider">A</li>
 *				<li><a href="../../docs/lists/index.html">Adam Kinkaid</a></li>
 *				<li><a href="../../docs/lists/index.html">Alex Wickerham</a></li>
 *				<li><a href="../../docs/lists/index.html">Avery Johnson</a></li>
 *			</ul>
 *		</div>
 */

( function ( $, document, undefined ) {
	// The options of handler in scrollview
	$.tizen.scrollview.prototype.options.handler = false;
	$.tizen.scrollview.prototype.options.handlerTheme = "s";

	$.extend( $.tizen.scrollview.prototype, {
		enableHandler : function ( enabled ) {
			if ( typeof enabled === 'undefined' ) {
				return this.options.handler;
			}

			this.options.handler = !!enabled;

			var view = this.element;
			if ( this.options.handler ) {
				view.find( ".ui-scrollbar" ).hide();
				view.find( ".ui-handler" ).show();
			} else {
				view.find( ".ui-handler" ).hide();
				view.find( ".ui-scrollbar" ).show();
			}
		},
		_handlerTimer : 0
	});

	$( document ).delegate( ":jqmData(scroll)", "scrollviewcreate", function () {
		if ( $( this ).attr( "data-" + $.mobile.ns + "scroll" ) === "none" ) {
			return;
		}

		var self = this,
			$this = $( this ),
			scrollview = $this.data( "scrollview" ),
			prefix = "<div class=\"ui-handler ui-handler-",
			suffix = "\"><div class=\"ui-handler-track\"><div class=\"ui-handler-thumb\"></div></div></div>",
			direction = scrollview.options.direction,
			isHorizontal = ( scrollview.options.direction === "x" ),
			_$view = scrollview._$view,
			_$clip = scrollview._$clip,
			handler = null,
			handlerThumb = null,
			viewLength = 0,
			clipLength = 0,
			handlerHeight = 0,
			handlerMargin = 0,
			trackLength = 0,
			isTouchable = $.support.touch,
			dragStartEvt = ( isTouchable ? "touchstart" : "mousedown" ) + ".handler",
			dragMoveEvtDefault = ( isTouchable ? "touchmove" : "mousemove" ),
			dragMoveEvt = dragMoveEvtDefault + ".handler",
			dragStopEvt = ( isTouchable ? "touchend" : "mouseup" ) + ".handler";

		if ( $this.find( ".ui-handler-thumb" ).length !== 0 || typeof direction !== "string" ) {
			return;
		}

		$this.append( prefix + direction + suffix );
		handler = $this.find( ".ui-handler" );
		handlerThumb = $this.find( ".ui-handler-thumb" ).hide();
		handlerHeight = ( isHorizontal ? handlerThumb.width() : handlerThumb.height() );
		handlerMargin = ( isHorizontal ? parseInt( handler.css( "right" ), 10 ) : parseInt( handler.css( "bottom" ), 10 ) );

		scrollview.enableHandler( scrollview.options.handler );

		$.extend( self, {
			moveData : null
		});

		// handler drag
		handlerThumb.bind( dragStartEvt, {
			e : handlerThumb
		}, function ( event ) {
			scrollview._stopMScroll();

			var target = event.data.e, t = ( isTouchable ? event.originalEvent.targetTouches[0] : event );

			self.moveData = {
				target : target,
				X : parseInt( target.css( 'left' ), 10 ) || 0,
				Y : parseInt( target.css( 'top' ), 10 ) || 0,
				pX : t.pageX,
				pY : t.pageY
			};
			clipLength = ( isHorizontal ? _$clip.width() : _$clip.height() );
			viewLength = ( isHorizontal ? _$view.outerWidth( true ) : _$view.outerHeight( true ) ) - clipLength;
			trackLength = clipLength - handlerHeight - handlerMargin;

			_$view.trigger( "scrollstart" );
			event.preventDefault();
			event.stopPropagation();

			$( document ).bind( dragMoveEvt, function ( event ) {
				var moveData = self.moveData,
					handlePos = 0,
					scrollPos = 0,
					t = ( isTouchable ? event.originalEvent.targetTouches[0] : event );

				handlePos = ( isHorizontal ? moveData.X + t.pageX - moveData.pX : moveData.Y + t.pageY - moveData.pY );

				if ( handlePos < 0 ) {
					handlePos = 0;
				}

				if ( handlePos > trackLength ) {
					handlePos = trackLength;
				}
				scrollPos = - Math.round( handlePos / trackLength * viewLength );

				$this.attr( "display", "none" );
				if ( isHorizontal ) {
					scrollview._setScrollPosition( scrollPos, 0 );
					moveData.target.css( {
						left : handlePos
					});
				} else {
					scrollview._setScrollPosition( 0, scrollPos );
					moveData.target.css( {
						top : handlePos
					});
				}
				$this.attr( "display", "inline" );

				event.preventDefault();
				event.stopPropagation();
			}).bind( dragStopEvt, function ( event ) {
				$( document ).unbind( dragMoveEvt ).unbind( dragStopEvt );

				self.moveData = null;
				_$view.trigger( "scrollstop" );

				event.preventDefault();
			});
		});

		$( document ).bind( dragMoveEvtDefault, function ( event ) {
			var isVisible = false,
				vclass = "ui-scrollbar-visible";

			if ( scrollview._$vScrollBar ) {
				isVisible = scrollview._$vScrollBar.hasClass( vclass );
			} else if ( scrollview._$hScrollBar ) {
				isVisible = scrollview._$hScrollBar.hasClass( vclass );
			}

			if ( isVisible || self.moveData !== null ) {
				if ( handlerThumb.hasClass( "ui-handler-visible" ) ) {
					_$view.trigger( "scrollupdate" );
				} else {
					_$view.trigger( "scrollstart" );
				}
			}
		});

		$this.bind( "scrollstart", function ( event ) {
			if ( !scrollview.enableHandler() ) {
				return;
			}
			clipLength = ( isHorizontal ? _$clip.width() : _$clip.height() );
			viewLength = ( isHorizontal ? _$view.outerWidth( true ) : _$view.outerHeight( true ) ) - clipLength;
			trackLength = clipLength - handlerHeight - handlerMargin;

			if ( clipLength > viewLength || trackLength < ( handlerHeight * 4 / 3 ) ) {
				return;
			}

			handlerThumb.addClass( "ui-handler-visible" );
			handlerThumb.stop().fadeIn( 'fast' );

			event.preventDefault();
			event.stopPropagation();
		}).bind( "scrollupdate", function ( event, data ) {
			if ( !scrollview.enableHandler() || clipLength > viewLength || trackLength < ( handlerHeight * 4 / 3 ) ) {
				return;
			}

			var scrollPos = scrollview.getScrollPosition(), handlerPos = 0;

			handlerThumb.stop( true, true ).hide().css( "opacity", 1.0 );

			if ( isHorizontal ) {
				handlerPos = Math.round( scrollPos.x / viewLength * trackLength );
				handlerThumb.css( "left", handlerPos );
			} else {
				handlerPos = Math.round( scrollPos.y / viewLength * trackLength );
				handlerThumb.css( "top", handlerPos );
			}

			handlerThumb.show();

			event.preventDefault();
			event.stopPropagation();
		}).bind( "scrollstop", function ( event ) {
			if ( !scrollview.enableHandler() || clipLength > viewLength ) {
				return;
			}

			scrollview._handlerTimer = setTimeout( function () {
				if ( scrollview._timerID === 0 && self.moveData === null ) {
					handlerThumb.removeClass( "ui-handler-visible" );
					handlerThumb.stop( true, true ).fadeOut( 'fast' );
					clearTimeout( scrollview._handlerTimer );
					scrollview._handlerTimer = 0;
				}
			}, 1000 );

			event.preventDefault();
		});
	});
} ( jQuery, document ) );
/*
 * jQuery Mobile Widget @VERSION
 *
 * This software is licensed under the MIT licence (as defined by the OSI at
 * http://www.opensource.org/licenses/mit-license.php)
 * 
 * ***************************************************************************
 * Copyright (C) 2011 by Intel Corporation Ltd.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software" ),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 * Authors: Gabriel Schulhof <gabriel.schulhof@intel.com>
 */

// Displays three sliders that allow the user to select the
// hue, saturation, and value for a color.
//
// To apply, add the attribute data-role="hsvpicker" to a <div>
// element inside a page. Alternatively, call hsvpicker() 
// on an element (see below).
//
// Options:
//
//     color: String; the initial color can be specified in html using the
//            data-color="#ff00ff" attribute or when constructed
//            in javascript, eg
//                $( "#myhsvpicker" ).hsvpicker({ color: "#ff00ff" });
//            where the html might be :
//                <div id="myhsvpicker"></div>
//            The color can be changed post-construction like this :
//                $( "#myhsvpicker" ).hsvpicker( "option", "color", "#ABCDEF" );
//            Default: "#1a8039"
//
// Events:
//
//     colorchanged: Fired when the color is changed.

(function ( $, undefined ) {

	$.widget( "tizen.hsvpicker", $.tizen.colorwidget, {
		options: {
			initSelector: ":jqmData(role='hsvpicker')"
		},

		_htmlProto: {
source:

$("<div><div id='hsvpicker' class='ui-hsvpicker'>" +
  "    <div class='hsvpicker-clrchannel-container jquery-mobile-ui-widget'>" +
  "        <div class='hsvpicker-arrow-btn-container'>" +
  "            <a href='#' class='hsvpicker-arrow-btn' data-target='hue' data-location='left' data-inline='true' data-icon='reveal-left'></a>" +
  "        </div>" +
  "        <div class='hsvpicker-clrchannel-masks-container'>" +
  "            <div class='hsvpicker-clrchannel-mask hsvpicker-clrchannel-mask-white'></div>" +
  "            <div id='hsvpicker-hue-hue' class='hsvpicker-clrchannel-mask jquery-todons-colorwidget-clrlib-hue-gradient'></div>" +
  "            <div id='hsvpicker-hue-mask-val' class='hsvpicker-clrchannel-mask hsvpicker-clrchannel-mask-black' data-event-source='hue'></div>" +
  "            <div id='hsvpicker-hue-selector' class='hsvpicker-clrchannel-selector ui-corner-all'></div>" +
  "        </div>" +
  "        <div class='hsvpicker-arrow-btn-container'>" +
  "            <a href='#' class='hsvpicker-arrow-btn' data-target='hue' data-location='right' data-inline='true' data-icon='reveal'></a>" +
  "        </div>" +
  "    </div>" +
  "    <div class='hsvpicker-clrchannel-container jquery-mobile-ui-widget'>" +
  "        <div class='hsvpicker-arrow-btn-container'>" +
  "            <a href='#' class='hsvpicker-arrow-btn' data-target='sat' data-location='left' data-inline='true' data-icon='reveal-left'></a>" +
  "        </div>" +
  "        <div class='hsvpicker-clrchannel-masks-container'>" +
  "            <div id='hsvpicker-sat-hue' class='hsvpicker-clrchannel-mask'></div>" +
  "            <div id='hsvpicker-sat-gradient' class='hsvpicker-clrchannel-mask  sat-gradient'></div>" +
  "            <div id='hsvpicker-sat-mask-val' class='hsvpicker-clrchannel-mask hsvpicker-clrchannel-mask-black' data-event-source='sat'></div>" +
  "            <div id='hsvpicker-sat-selector' class='hsvpicker-clrchannel-selector ui-corner-all'></div>" +
  "        </div>" +
  "        <div class='hsvpicker-arrow-btn-container'>" +
  "            <a href='#' class='hsvpicker-arrow-btn' data-target='sat' data-location='right' data-inline='true' data-icon='reveal'></a>" +
  "        </div>" +
  "    </div>" +
  "    <div class='hsvpicker-clrchannel-container jquery-mobile-ui-widget'>" +
  "        <div class='hsvpicker-arrow-btn-container'>" +
  "            <a href='#' class='hsvpicker-arrow-btn' data-target='val' data-location='left' data-inline='true' data-icon='reveal-left'></a>" +
  "        </div>" +
  "        <div class='hsvpicker-clrchannel-masks-container'>" +
  "            <div class='hsvpicker-clrchannel-mask hsvpicker-clrchannel-mask-white'></div>" +
  "            <div id='hsvpicker-val-hue' class='hsvpicker-clrchannel-mask'></div>" +
  "            <div id='hsvpicker-val-gradient' class='hsvpicker-clrchannel-mask val-gradient' data-event-source='val'></div>" +
  "            <div id='hsvpicker-val-selector' class='hsvpicker-clrchannel-selector ui-corner-all'></div>" +
  "        </div>" +
  "        <div class='hsvpicker-arrow-btn-container'>" +
  "            <a href='#' class='hsvpicker-arrow-btn' data-target='val' data-location='right' data-inline='true' data-icon='reveal'></a>" +
  "        </div>" +
  "    </div>" +
  "</div>" +
  "</div>")
,			ui: {
				container: "#hsvpicker",
				hue: {
					eventSource: "[data-event-source='hue']",
					selector: "#hsvpicker-hue-selector",
					hue: "#hsvpicker-hue-hue",
					valMask:  "#hsvpicker-hue-mask-val"
				},
				sat: {
					gradient: "#hsvpicker-sat-gradient",
					eventSource: "[data-event-source='sat']",
					selector: "#hsvpicker-sat-selector",
					hue: "#hsvpicker-sat-hue",
					valMask: "#hsvpicker-sat-mask-val"
				},
				val: {
					gradient: "#hsvpicker-val-gradient",
					eventSource: "[data-event-source='val']",
					selector: "#hsvpicker-val-selector",
					hue: "#hsvpicker-val-hue"
				}
			}
		},

		_create: function () {
			var self = this,
				chan,
				hsvIdx,
				max,
				step;

			this.element
				.css( "display", "none" )
				.after( this._ui.container );

			this._ui.hue.hue.huegradient();

			$.extend( this, {
				dragging_hsv: [ 0, 0, 0],
				selectorDraggingOffset: {
					x : -1,
					y : -1
				},
				dragging: -1
			} );

			this._ui.container.find( ".hsvpicker-arrow-btn" )
				.buttonMarkup()
				.bind( "vclick", function ( e ) {
					chan = $( this).attr( "data-" + ( $.mobile.ns || "" ) + "target" );
					hsvIdx = ( "hue" === chan ) ? 0 :
							( "sat" === chan) ? 1 : 2;
					max = ( 0 == hsvIdx ? 360 : 1 );
					step = 0.05 * max;

					self.dragging_hsv[hsvIdx] = self.dragging_hsv[hsvIdx] + step * ( "left" === $( this ).attr( "data-" + ( $.mobile.ns || "" ) + "location" ) ? -1 : 1);
					self.dragging_hsv[hsvIdx] = Math.min( max, Math.max( 0.0, self.dragging_hsv[hsvIdx] ) );
					self._updateSelectors( self.dragging_hsv );
				} );

			$( document )
				.bind( "vmousemove", function ( event ) {
					if ( self.dragging != -1 ) {
						event.stopPropagation();
						event.preventDefault();
					}
				} )
				.bind( "vmouseup", function ( event ) {
					self.dragging = -1;
				} );

			this._bindElements( "hue", 0 );
			this._bindElements( "sat", 1 );
			this._bindElements( "val", 2 );
		},

		_bindElements: function ( chan, idx ) {
			var self = this;
			this._ui[chan].selector
				.bind( "mousedown vmousedown", function ( e ) { self._handleMouseDown( chan, idx, e, true ); } )
				.bind( "vmousemove touchmove", function ( e ) { self._handleMouseMove( chan, idx, e, true ); } )
				.bind( "vmouseup",             function ( e ) { self.dragging = -1; } );
			this._ui[chan].eventSource
				.bind( "mousedown vmousedown", function ( e ) { self._handleMouseDown( chan, idx, e, false ); } )
				.bind( "vmousemove touchmove", function ( e ) { self._handleMouseMove( chan, idx, e, false ); } )
				.bind( "vmouseup",             function ( e ) { self.dragging = -1; } );
		},

		_handleMouseDown: function ( chan, idx, e, isSelector ) {
			var coords = $.mobile.tizen.targetRelativeCoordsFromEvent( e ),
				widgetStr = ( isSelector ? "selector" : "eventSource" );

			if ( coords.x >= 0 && coords.x <= this._ui[chan][widgetStr].outerWidth() &&
					coords.y >= 0 && coords.y <= this._ui[chan][widgetStr].outerHeight() ) {

				this.dragging = idx;

				if ( isSelector ) {
					this.selectorDraggingOffset.x = coords.x;
					this.selectorDraggingOffset.y = coords.y;
				}

				this._handleMouseMove( chan, idx, e, isSelector, coords );
			}
		},

		_handleMouseMove: function ( chan, idx, e, isSelector, coords ) {
			if ( this.dragging === idx ) {
				coords = ( coords || $.mobile.tizen.targetRelativeCoordsFromEvent( e ) );

				var factor = ( ( 0 === idx ) ? 360 : 1 ),
					potential = ( isSelector
							? ( ( this.dragging_hsv[idx] / factor) +
									( ( coords.x - this.selectorDraggingOffset.x ) / this._ui[chan].eventSource.width() ) )
									: ( coords.x / this._ui[chan].eventSource.width() ) );

				this.dragging_hsv[idx] = Math.min( 1.0, Math.max( 0.0, potential ) ) * factor;

				if ( !isSelector ) {
					this.selectorDraggingOffset.x = Math.ceil( this._ui[chan].selector.outerWidth() / 2.0 );
					this.selectorDraggingOffset.y = Math.ceil( this._ui[chan].selector.outerHeight() / 2.0 );
				}

				this._updateSelectors( this.dragging_hsv );
				e.stopPropagation();
				e.preventDefault();
			}
		},

		_updateSelectors: function ( hsv ) {
			var clrlib = $.tizen.colorwidget.clrlib,
				clrwidget = $.tizen.colorwidget.prototype,
				clr = clrlib.HSVToHSL( hsv ),
				hclr = clrlib.HSVToHSL( [hsv[0], 1.0, 1.0] ),
				vclr = clrlib.HSVToHSL( [hsv[0], hsv[1], 1.0] );

			this._ui.hue.selector.css( { left : this._ui.hue.eventSource.width() * hsv[0] / 360} );
			clrwidget._setElementColor.call( this, this._ui.hue.selector,  clr, "background" );
			if ( $.mobile.browser.ie ) {
				this._ui.hue.hue.find( "*" ).css( "opacity", hsv[1] );
			} else {
				this._ui.hue.hue.css( "opacity", hsv[1] );
			}

			this._ui.hue.valMask.css( "opacity", 1.0 - hsv[2] );

			this._ui.sat.selector.css( { left : this._ui.sat.eventSource.width() * hsv[1]} );
			clrwidget._setElementColor.call( this, this._ui.sat.selector,  clr, "background" );
			clrwidget._setElementColor.call( this, this._ui.sat.hue, hclr, "background" );
			this._ui.sat.valMask.css( "opacity", 1.0 - hsv[2] );

			this._ui.val.selector.css( { left : this._ui.val.eventSource.width() * hsv[2]} );
			clrwidget._setElementColor.call( this, this._ui.val.selector,  clr, "background" );
			clrwidget._setElementColor.call( this, this._ui.val.hue, vclr, "background" );
			clrwidget._setColor.call( this, clrlib.RGBToHTML( clrlib.HSLToRGB(clr) ) );
		},

		_setDisabled: function ( value ) {
			$.tizen.widgetex.prototype._setDisabled.call( this, value );
			this._ui.container[value ? "addClass" : "removeClass"]( "ui-disabled" );
			this._ui.hue.hue.huegradient( "option", "disabled", value );
			$.tizen.colorwidget.prototype._displayDisabledState.call( this, this._ui.container );
		},

		_setColor: function ( clr ) {
			if ( $.tizen.colorwidget.prototype._setColor.call( this, clr ) ) {
				this.dragging_hsv = $.tizen.colorwidget.clrlib.RGBToHSV( $.tizen.colorwidget.clrlib.HTMLToRGB( this.options.color ) );
				this._updateSelectors( this.dragging_hsv );
			}
		}
	} );

	$( document ).bind( "pagecreate create", function ( e ) {
		$( $.tizen.hsvpicker.prototype.options.initSelector, e.target )
			.not( ":jqmData(role='none'), :jqmData(role='nojs')" )
			.hsvpicker();
	} );

}( jQuery ) );
/* ***************************************************************************
 * Copyright (c) 2000 - 2011 Samsung Electronics Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 *	Author: Minkyu Kang <mk7.kang@samsung.com>
 */

/*
 * Notification widget
 *
 * HTML Attributes
 *
 *  data-role: set to 'imageslider'
 *  data-start-index: start index
 *  data-vertical-align: set to top or middle or bottom.
 *
 * APIs
 *
 *  add(image_file): add the image (parameter: url of iamge)
 *  del(image_index): delete the image (parameter: index of image)
 *  refresh(): refresh the widget, should be called after add or del.
 *
 * Events
 *
 *  N/A
 *
 * Example
 *
 * <div data-role="imageslider" id="imageslider" data-start-index="3" data-vertical-align="middle">
 *	<img src="01.jpg">
 *	<img src="02.jpg">
 *	<img src="03.jpg">
 *	<img src="04.jpg">
 *	<img src="05.jpg">
 * </div>
 *
 *
 * $('#imageslider-add').bind('vmouseup', function ( e ) {
 *	$('#imageslider').imageslider('add', '9.jpg');
 *	$('#imageslider').imageslider('add', '10.jpg');
 *	$('#imageslider').imageslider('refresh');
 * });
 *
 * $('#imageslider-del').bind('vmouseup', function ( e ) {
 *	$('#imageslider').imageslider('del');
 * });
 *
 */

(function ( $, window, undefined ) {
	$.widget( "tizen.imageslider", $.mobile.widget, {
		options: {
			photoFlicking: false
		},

		dragging: false,
		moving: false,
		max_width: 0,
		max_height: 0,
		org_x: 0,
		org_time: null,
		cur_img: null,
		prev_img: null,
		next_img: null,
		images: [],
		images_hold: [],
		index: 0,
		align_type: null,
		direction: 1,
		container: null,
		interval: null,

		_resize: function ( obj ) {
			var width,
				height,
				margin = 40,
				ratio,
				img_max_width = this.max_width - margin,
				img_max_height = this.max_height - margin;

			height = obj.height();
			width = obj.width();

			ratio = height / width;

			if ( width > img_max_width ) {
				obj.width( img_max_width );
				obj.height( img_max_width * ratio );
			}

			height = obj.height();

			if ( height > img_max_height ) {
				obj.height( img_max_height );
				obj.width( img_max_height / ratio );
			}
		},

		_align: function ( obj, img ) {
			var img_top = 0;

			if ( !obj.length ) {
				return;
			}

			if ( this.align_type == "middle" ) {
				img_top = ( this.max_height - img.height() ) / 2;
			} else if ( this.align_type == "bottom" ) {
				img_top = this.max_height - img.height();
			} else {
				img_top = 0;
			}

			obj.css( 'top', img_top + 'px' );
		},

		_detach: function ( image_index, obj ) {
			if ( !obj.length ) {
				return;
			}
			if ( image_index < 0 ) {
				return;
			}
			if ( image_index >= this.images.length ) {
				return;
			}

			this.images[image_index].detach();
			obj.css( "display", "none" );
		},

		_attach: function ( image_index, obj ) {
			if ( !obj.length ) {
				return;
			}
			if ( image_index < 0 ) {
				return;
			}
			if ( image_index >= this.images.length ) {
				return;
			}

			obj.css( "display", "block" );
			obj.append( this.images[image_index] );
			this._resize( this.images[image_index] );
			this._align( obj, this.images[image_index] );
		},

		_drag: function ( _x ) {
			var delta,
				coord_x;

			if ( !this.dragging ) {
				return;
			}

			if ( this.options.photoFlicking === false ) {
				delta = this.org_x - _x;

				// first image
				if ( delta < 0 && !this.prev_img.length ) {
					return;
				}
				// last image
				if ( delta > 0 && !this.next_img.length ) {
					return;
				}
			}

			coord_x = _x - this.org_x;

			this.cur_img.css( 'left', coord_x + 'px' );
			if ( this.next_img.length ) {
				this.next_img.css( 'left', coord_x + this.max_width + 'px' );
			}
			if ( this.prev_img.length ) {
				this.prev_img.css( 'left', coord_x - this.max_width + 'px' );
			}
		},

		_move: function ( _x ) {
			var delta = this.org_x - _x,
				flip = 0,
				date,
				drag_time,
				sec,
				self;

			if ( delta == 0 ) {
				return;
			}

			if ( delta > 0 ) {
				flip = delta < ( this.max_width * 0.45 ) ? 0 : 1;
			} else {
				flip = -delta < ( this.max_width * 0.45 ) ? 0 : 1;
			}

			if ( !flip ) {
				date = new Date();
				drag_time = date.getTime() - this.org_time;

				if ( Math.abs( delta ) / drag_time > 1 ) {
					flip = 1;
				}
			}

			if ( flip ) {
				if ( delta > 0 && this.next_img.length ) {
					/* next */
					this._detach( this.index - 1, this.prev_img );

					this.prev_img = this.cur_img;
					this.cur_img = this.next_img;
					this.next_img = this.next_img.next();

					this.index++;

					if ( this.next_img.length ) {
						this.next_img.css( 'left', this.max_width + 'px' );
						this._attach( this.index + 1, this.next_img );
					}

					this.direction = 1;

				} else if ( delta < 0 && this.prev_img.length ) {
					/* prev */
					this._detach( this.index + 1, this.next_img );

					this.next_img = this.cur_img;
					this.cur_img = this.prev_img;
					this.prev_img = this.prev_img.prev();

					this.index--;

					if ( this.prev_img.length ) {
						this.prev_img.css( 'left', -this.max_width + 'px' );
						this._attach( this.index - 1, this.prev_img );
					}

					this.direction = -1;
				}
			}

			sec = 500;
			self = this;

			this.moving = true;

			this.interval = setInterval( function () {
				self.moving = false;
				clearInterval( self.interval );
			}, sec - 50 );

			this.cur_img.animate( { left: 0 }, sec );
			if ( this.next_img.length ) {
				this.next_img.animate( { left: this.max_width }, sec );
			}
			if ( this.prev_img.length ) {
				this.prev_img.animate( { left: -this.max_width }, sec );
			}
		},

		_add_event: function () {
			var self = this,
				date;

			this.container.bind( 'vmousemove', function ( e ) {
				e.preventDefault();

				if ( self.moving ) {
					return;
				}
				if ( !self.dragging ) {
					return;
				}

				self._drag( e.pageX );
			} );

			this.container.bind( 'vmousedown', function ( e ) {
				e.preventDefault();

				if ( self.moving ) {
					return;
				}

				self.dragging = true;

				self.org_x = e.pageX;

				date = new Date();
				self.org_time = date.getTime();
			} );

			this.container.bind( 'vmouseup', function ( e ) {
				if ( self.moving ) {
					return;
				}

				self.dragging = false;

				self._move( e.pageX );
			} );

			this.container.bind( 'vmouseout', function ( e ) {
				if ( self.moving ) {
					return;
				}
				if ( !self.dragging ) {
					return;
				}

				if ( ( e.pageX < 20 ) ||
						( e.pageX > ( self.max_width - 20 ) ) ) {
					self._move( e.pageX );
					self.dragging = false;
				}
			} );
		},

		_del_event: function () {
			this.container.unbind( 'vmousemove' );
			this.container.unbind( 'vmousedown' );
			this.container.unbind( 'vmouseup' );
			this.container.unbind( 'vmouseout' );
		},

		_show: function () {
			this.cur_img = $( 'div' ).find( '.ui-imageslider-bg:eq(' + this.index + ')' );
			this.prev_img = this.cur_img.prev();
			this.next_img = this.cur_img.next();

			this._attach( this.index - 1, this.prev_img );
			this._attach( this.index, this.cur_img );
			this._attach( this.index + 1, this.next_img );

			if ( this.prev_img.length ) {
				this.prev_img.css( 'left', -this.max_width + 'px' );
			}

			this.cur_img.css( 'left', '0px' );

			if ( this.next_img.length ) {
				this.next_img.css( 'left', this.max_width + 'px' );
			}
		},

		show: function () {
			this._show();
			this._add_event();
		},

		_hide: function () {
			this._detach( this.index - 1, this.prev_img );
			this._detach( this.index, this.cur_img );
			this._detach( this.index + 1, this.next_img );
		},

		hide: function () {
			this._hide();
			this._del_event();
		},

		_get_height: function () {
			var $page = $( '.ui-page' ),
				$content = $page.children( '.ui-content' ),
				$header = $page.children( '.ui-header' ),
				$footer = $page.children( '.ui-footer' ),
				header_h = $header.outerHeight(),
				footer_h = $footer.outerHeight(),
				padding = parseFloat( $content.css( 'padding-top' ) ) + parseFloat( $content.css( 'padding-bottom' ) ),
				content_h = $( window ).height() - header_h - footer_h - padding * 2;

			return content_h;
		},

		_create: function () {
			var temp_img,
				start_index,
				i = 0;

			$( this.element ).wrapInner( '<div class="ui-imageslider"></div>' );
			$( this.element ).find( 'img' ).wrap( '<div class="ui-imageslider-bg"></div>' );

			this.container = $( this.element ).find('.ui-imageslider');

			this.max_width = $( window ).width();
			this.max_height = this._get_height();
			this.container.css( 'height', this.max_height );

			temp_img = $( 'div' ).find( '.ui-imageslider-bg:first' );

			while ( temp_img.length ) {
				this.images[i] = temp_img.find( 'img' );
				temp_img = temp_img.next();
				i++;
			}

			for ( i = 0; i < this.images.length; i++ ) {
				this.images[i].detach();
			}

			start_index = parseInt( $( this.element ).attr( 'data-start-index' ), 10 );
			if ( start_index === undefined ) {
				start_index = 0;
			}
			if ( start_index < 0 ) {
				start_index = 0;
			}
			if ( start_index >= this.images.length ) {
				start_index = this.images.length - 1;
			}

			this.index = start_index;

			this.align_type = $( this.element ).attr( 'data-vertical-align' );
		},

		_update: function () {
			var image_file,
				bg_html,
				temp_img;

			while ( this.images_hold.length ) {
				image_file = this.images_hold.shift();

				bg_html = $( '<div class="ui-imageslider-bg"></div>' );
				temp_img = $( '<img src="' + image_file + '"></div>' );

				bg_html.append( temp_img );
				this.container.append( bg_html );
				this.images.push( temp_img );
			}
		},

		refresh: function ( start_index ) {
			this._update();

			this._hide();

			if ( start_index === undefined ) {
				start_index = this.index;
			}
			if ( start_index < 0 ) {
				start_index = 0;
			}
			if ( start_index >= this.images.length ) {
				start_index = this.images.length - 1;
			}

			this.index = start_index;

			this._show();
		},

		add: function ( image_file ) {
			this.images_hold.push( image_file );
		},

		del: function ( image_index ) {
			var temp_img;

			if ( image_index === undefined ) {
				image_index = this.index;
			}

			if ( image_index < 0 || image_index >= this.images.length ) {
				return;
			}

			if ( image_index == this.index ) {
				temp_img = this.cur_img;

				if ( this.index == 0 ) {
					this.direction = 1;
				} else if ( this.index == this.images.length - 1 ) {
					this.direction = -1;
				}

				if ( this.direction < 0 ) {
					this.cur_img = this.prev_img;
					this.prev_img = this.prev_img.prev();
					if ( this.prev_img.length ) {
						this.prev_img.css( 'left', -this.max_width );
						this._attach( image_index - 2, this.prev_img );
					}
					this.index--;
				} else {
					this.cur_img = this.next_img;
					this.next_img = this.next_img.next();
					if ( this.next_img.length ) {
						this.next_img.css( 'left', this.max_width );
						this._attach( image_index + 2, this.next_img );
					}
				}

				this.cur_img.animate( { left: 0 }, 500 );

			} else if ( image_index == this.index - 1 ) {
				temp_img = this.prev_img;
				this.prev_img = this.prev_img.prev();
				if ( this.prev_img.length ) {
					this.prev_img.css( 'left', -this.max_width );
					this._attach( image_index - 1, this.prev_img );
				}
				this.index--;

			} else if ( image_index == this.index + 1 ) {
				temp_img = this.next_img;
				this.next_img = this.next_img.next();
				if ( this.next_img.length ) {
					this.next_img.css( 'left', this.max_width );
					this._attach( image_index + 1, this.next_img );
				}

			} else {
				temp_img = $( 'div' ).find( '.ui-imageslider-bg:eq(' + image_index + ')' );
			}

			this.images.splice( image_index, 1 );
			temp_img.detach();
		}
	}); /* End of widget */

	// auto self-init widgets
	$( document ).bind( "pagecreate", function ( e ) {
		$( e.target ).find( ":jqmData(role='imageslider')" ).imageslider();
	});

	$( document ).bind( "pageshow", function ( e ) {
		$( e.target ).find( ":jqmData(role='imageslider')" ).imageslider( 'show' );
	});

	$( document ).bind( "pagebeforehide", function ( e ) {
		$( e.target ).find( ":jqmData(role='imageslider')" ).imageslider( 'hide' );
	} );

}( jQuery, this ) );
/*
 * jQuery Mobile Widget @VERSION
 *
 * This software is licensed under the MIT licence (as defined by the OSI at
 * http://www.opensource.org/licenses/mit-license.php)
 * 
 * ***************************************************************************
 * Copyright (C) 2011 by Intel Corporation Ltd.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 * Authors: Elliot Smith <elliot.smith@intel.com>
 */

// Horizontal/vertical box layout extension.
//
// This will arrange the child elements of a container in a horizontal
// or vertical row. This only makes sense if your container is a div
// and contains children which are also divs; the children should
// also have a height and width set in CSS, otherwise the layout
// manager won't know what to do with them.
//
// Apply it by setting data-layout="hbox" or data-layout="vbox" (vertical
// on a container element or calling $(element).layouthbox() or
// $(element).layoutvbox().
//
// Usually, you would use a div as the container to get the right effect
// (an element with display:block).
//
// Options can be set programmatically:
//
//   $(element).layouthbox('option', 'scrollable', false)
//   $(element).layoutvbox('option', 'scrollable', false)
//
// or via a data-layout-options attribute on the container:
//
//   <div data-layout="hbox" data-layout-options='{"hgap":5}'>
//       <div>child 1</div>
//       <div>child 2</div>
//   </div>
//
//   <div data-layout="vbox" data-layout-options='{"vgap":5}'>
//       <div>child 1</div>
//       <div>child 2</div>
//   </div>
//
// If you change any options after creating the widget, call
// $(element).layout*box('refresh') to have them picked up.
// However, note that it's currently not feasible to turn off scrolling
// once it's on (as calling scrollview('destroy') doesn't remove the
// scrollview custom mouse handlers).
//
// There is one major difference between the horizontal and
// vertical box layouts: if scrollable=false, the horizontal layout
// will clip children which overflow the edge of the parent container;
// by comparison, the vertical container will grow vertically to
// accommodate the height of its children. This mirrors the behaviour
// of jQuery Mobile, where elements only ever expand horizontally
// to fill the width of the window; but will expand vertically forever,
// unless the page height is artificially constrained.
//
// Options:
//
//   {Integer} hgap (default=0)
//   Horizontal gap (in pixels) between the child elements. Only has
//   an effect on hbox.
//
//   {Integer} vgap (default=0)
//   Vertical gap (in pixels) between the child elements. Only has
//   an effect on vbox.
//
//   {Boolean} scrollable (default=true; can only be set at create time)
//   Set to true to enable a scrollview on the
//   container. If false, children will be clipped if
//   they fall outside the edges of the container after
//   layouting.
//
//   {Boolean} showScrollBars (default=true)
//   Set to false to hide scrollbars on the container's scrollview.
//   Has no effect is scrollable=false

(function ( $, undefined ) {

	// hbox
	$.widget( "tizen.layouthbox", $.tizen.jlayoutadaptor, {
		fixed: {
			type: 'flexGrid',
			rows: 1,
			direction: 'x',
			initSelector: ':jqmData(layout="hbox")'
		},

		_create: function () {
			if ( !this.options.hgap ) {
				this.options.hgap = 0;
			}

			$.tizen.jlayoutadaptor.prototype._create.apply( this, arguments );
		}
	} );

	$( document ).bind( "pagecreate", function ( e ) {
		$( $.tizen.layouthbox.prototype.fixed.initSelector, e.target )
			.not( ":jqmData(role='none'), :jqmData(role='nojs')" )
			.layouthbox();
	} );

	// vbox
	$.widget( "tizen.layoutvbox", $.tizen.jlayoutadaptor, {
		fixed: {
			type: 'flexGrid',
			columns: 1,
			direction: 'y',
			initSelector: ':jqmData(layout="vbox")'
		},

		_create: function () {
			if ( !this.options.vgap ) {
				this.options.vgap = 0;
			}

			$.tizen.jlayoutadaptor.prototype._create.apply( this, arguments );
		}
	} );

	$( document ).bind( "pagecreate", function ( e ) {
		$( $.tizen.layoutvbox.prototype.fixed.initSelector, e.target )
			.not( ":jqmData(role='none'), :jqmData(role='nojs')" )
			.layoutvbox();
	} );

}( jQuery ) );
/*
 * jQuery Mobile Widget @VERSION - listview controls
 *
 * This software is licensed under the MIT licence (as defined by the OSI at
 * http://www.opensource.org/licenses/mit-license.php)
 * 
 * ***************************************************************************
 * Copyright (C) 2011 by Intel Corporation Ltd.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 * Authors: Elliot Smith <elliot.smith@intel.com>
 */

// This extension supplies API to toggle the "mode" in which a list
// is displayed. The modes available is configurable, but defaults
// to ['edit', 'view']. A list can also have a control panel associated
// with it. The visibility of the control panel is governed by the current
// mode (by default, it is visible in 'edit' mode); elements within
// the listview can also be marked up to be visible in one or more of the
// available modes.
//
// One example use case would be a control panel with a "Select all" checkbox
// which, when clicked, selects all of the checkboxes in the associated
// listview items.
//
// The control panel itself should be defined as a form element.
// By default, the control panel will be hidden when the listview is
// initialised, unless you supply mode="edit" as a
// data-listview-controls option (when using the default modes). If you
// want the control panel to be visible in some mode other than
// the default, use a data-listviewcontrols-show-in="<mode>" attribute
// on the control panel element.
//
// Example usage (using the default 'edit' and 'view' modes):
//
// <!-- this is the controls element, displayed in 'edit' mode by default -->
// <form id="listviewcontrols-control-panel">
//   <fieldset data-role="controlgroup">
//     <input type="checkbox" id="listviewcontrols-demo-checkbox-uber" />
//     <label for="listviewcontrols-demo-checkbox-uber">Select all</label>
//   </fieldset>
// </form>
//
// <!-- this is the list associated with the controls -->
// <ul data-role="listview" data-listviewcontrols="#listviewcontrols-control-panel">
//
//   <li>
//
//     <!-- this element is only visible in 'edit' mode -->
//     <fieldset data-role="controlgroup" data-listviewcontrols-show-in="edit">
//       <input type="checkbox" id="listviewcontrols-demo-checkbox-1" />
//       <label for="listviewcontrols-demo-checkbox-1">Greg</label>
//     </fieldset>
//
//     <!-- this element is only visible in 'view' mode -->
//     <span data-listviewcontrols-show-in="view">Greg</span>
//
//   </li>
//
//   ... more li elements marked up the same way ...
//
// </ul>
//
// To associate the listview with the control panel, add
// data-listviewcontrols="..selector.." to a listview, where
// selector selects a single element (the control panel
// you defined). You can then call
// listviewcontrols('option', 'mode', '<mode>') on the
// listview to set the mode.
//
// Inside the listview's items, add controls to each item
// which are only visible when in one of the modes. To do this,
// add form elements (e.g. checkboxes) to the items as you see fit. Then,
// mark each form element with data-listviewcontrols-show-in="<mode>".
// The control's visibility now depends on the mode of the listviewcontrols:
// it is only shown when its <mode> setting matches the current mode
// of the listviewcontrols widget. You are responsible for properly
// styling the form elements inside the listview so the listview looks
// correct when they are hidden or visible.
//
// The control panel (by default, visible when in "show" mode) is flexible
// and can contain any valid form elements (or other jqm components). It's
// up to you to define the behaviour associated with interactions on
// the control panel and/or controls inside list items.
//
// Methods:
//
//   visibleListItems
//     Returns a jQuery object containing all the li elements in the
//     listview which are currently visible and not dividers. (This
//     is just a convenience to make operating on the list as a whole
//     slightly simpler.)
//
// Options (set in options hash passed to constructor, or via the
// option method, or declaratively by attribute described below):
//
//   controlPanelSelector {String}
//     Selector string for selecting the element representing the
//     control panel for the listview. The context for find() is the
//     document (to give the most flexibility), so your selector
//     should be specific. Set declaratively with
//       data-listviewcontrols="...selector...".
//
//   modesAvailable {String[]; default=['edit', 'view']}
//     An array of the modes available for these controls.
//
//   mode {String; default='view'}
//     Current mode for the widget, which governs the visibility
//     of the listview control panel and any elements marked
//     with data-listviewcontrols-show-in="<mode>".
//     Set declaratively with
//       data-listviewcontrols-options='{"mode":"<mode>"}'.
//
//   controlPanelShowIn {String; default=modesAvailable[0]}
//     The mode in which the control panel is visible; defaults to the
//     first element of modesAvailable. Can be set declaratively
//     on the listview controls element with
//       data-listviewcontrols-show-in="<mode>"

(function ($) {

	$.widget( "todons.listviewcontrols", $.mobile.widget, {
		_defaults: {
			controlPanelSelector: null,
			modesAvailable: ['edit', 'view'],
			mode: 'view',
			controlPanelShowIn: null
		},

		_listviewCssClass: 'ui-listviewcontrols-listview',
		_controlsCssClass: 'ui-listviewcontrols-panel',

		_create: function () {
			var self = this,
				o = this.options,
				optionsValid = true,
				page = this.element.closest( '.ui-page' ),
				controlPanelSelectorAttr = 'data-' + $.mobile.ns + 'listviewcontrols',
				controlPanelSelector = this.element.attr( controlPanelSelectorAttr ),
				dataOptions = this.element.jqmData( 'listviewcontrols-options' ),
				controlPanelShowInAttr;

			o.controlPanelSelector = o.controlPanelSelector || controlPanelSelector;

			// precedence for options: defaults < jqmData attribute < options arg
			o = $.extend( {}, this._defaults, dataOptions, o );

			optionsValid = ( this._validOption( 'modesAvailable', o.modesAvailable, o ) &&
					this._validOption( 'controlPanelSelector', o.controlPanelSelector, o ) &&
					this._validOption( 'mode', o.mode, o ) );

			if ( !optionsValid ) {
				return false;
			}

			// get the controls element
			this.controlPanel = $( document ).find( o.controlPanelSelector ).first();

			if ( this.controlPanel.length === 0 ) {
				return false;
			}

			// once we have the controls element, we may need to override the
			// mode in which controls are shown
			controlPanelShowInAttr = this.controlPanel.jqmData( 'listviewcontrols-show-in' );
			if ( controlPanelShowInAttr ) {
				o.controlPanelShowIn = controlPanelShowInAttr;
			} else if ( !o.controlPanelShowIn ) {
				o.controlPanelShowIn = o.modesAvailable[0];
			}

			if ( !this._validOption( 'controlPanelShowIn', o.controlPanelShowIn, o ) ) {
				return;
			}

			// done setting options
			this.options = o;

			// mark the controls and the list with a class
			this.element.removeClass(this._listviewCssClass).addClass(this._listviewCssClass);
			this.controlPanel.removeClass(this._controlsCssClass).addClass(this._controlsCssClass);

			// show the widget
			if ( page && !page.is( ':visible' ) ) {
				page.bind( 'pageshow', function () { self.refresh(); } );
			} else {
				this.refresh();
			}
		},

		_validOption: function ( varName, value, otherOptions ) {
			var ok = false,
				i = 0;

			if ( varName === 'mode' ) {
				ok = ( $.inArray( value, otherOptions.modesAvailable ) >= 0 );
			} else if ( varName === 'controlPanelSelector' ) {
				ok = ( $.type( value ) === 'string' );
			} else if ( varName === 'modesAvailable' ) {
				ok = ( $.isArray( value ) && value.length > 1 );

				if ( ok ) {
					for ( i = 0; i < value.length; i++ ) {
						if ( value[i] === '' || $.type( value[i] ) !== 'string' ) {
							ok = false;
						}
					}
				}
			} else if ( varName === 'controlPanelShowIn' ) {
				ok = ( $.inArray( value, otherOptions.modesAvailable ) >= 0 );
			}

			return ok;
		},

		_setOption: function ( varName, value ) {
			var oldValue = this.options[varName];

			if ( oldValue !== value && this._validOption( varName, value, this.options ) ) {
				this.options[varName] = value;
				this.refresh();
			}
		},

		visibleListItems: function () {
			return this.element.find( 'li:not(:jqmData(role=list-divider)):visible' );
		},

		refresh: function () {
			var self = this,
				triggerUpdateLayout = false,
				isVisible = null,
				showIn,
				modalElements;

			// hide/show the control panel and hide/show controls inside
			// list items based on their "show-in" option
			isVisible = this.controlPanel.is( ':visible' );

			if ( this.options.mode === this.options.controlPanelShowIn ) {
				this.controlPanel.show();
			} else {
				this.controlPanel.hide();
			}

			if ( this.controlPanel.is( ':visible' ) !== isVisible ) {
				triggerUpdateLayout = true;
			}

			// we only operate on elements inside list items which aren't dividers
			modalElements = this.element
								.find( 'li:not(:jqmData(role=list-divider))' )
								.find( ':jqmData(listviewcontrols-show-in)' );

			modalElements.each(function () {
				showIn = $( this ).jqmData( 'listviewcontrols-show-in' );

				isVisible = $( this ).is( ':visible' );

				if ( showIn === self.options.mode ) {
					$( this ).show();
				} else {
					$( this ).hide();
				}

				if ( $( this ).is( ':visible' ) !== isVisible ) {
					triggerUpdateLayout = true;
				}
			} );

			if ( triggerUpdateLayout ) {
				this.element.trigger( 'updatelayout' );
			}
		}
	} );

	$( 'ul' ).live( 'listviewcreate', function () {
		var list = $(this);

		if ( list.is( ':jqmData(listviewcontrols)' ) ) {
			list.listviewcontrols();
		}
	} );

}( jQuery ) );
/* ***************************************************************************
 * Copyright (c) 2000 - 2011 Samsung Electronics Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 *	Author: Kangsik Kim <kangsik81.kim@samsung.com>
*/

/**
 *	Multibuttonentry widget is a kind of button widget.
 *	When a user inputs a text and the text gets an change event,
 *	the text can be changed from it to a button widget.
 *
 *	HTML Attributes:
 *
 *		data-listUrl : This attribute is represent a 'id' about page.
 *				This page is containing prepared data for provide to user.
 *				For example, like address book.
 *		data-label:	This attribute is providing label for user-guide. (Default : 'To : ')
 *		data-descMessage : This attribute is managing message format.
 *				 This message is displayed when widget status was changed to 'focusout'.
 *
 *	APIs:
 *
 *		inputtext ( void )
 *			: Get a string from inputbox.
 *		inputtext (  [string]  )
 *			: If argument is not exist, will get a string from inputbox.
 *			If argument is exist, will set a string to inputbox.
 *		select (  [number]  )
 *			: If argument is not exist, will act  as a getter.
 *			Get a string of selected block.
 *			If widget is not exist a selected button, it will return 'null'.
 *			Select a button located on the index. (number : index of button)
 *		add ( text, [number] )
 *			: If second argument is not exist, will insert to a new textblock at last position.
 *			Insert a new button at position that is pointed by index. (number : index of button)
 *		remove ( [number] )
 *			: If argument is not exist, will remove all buttons.
 *			Remove a button that is pointed by index. (number : index of button)
 *		length ( void )
 *			: Get a number of buttons.
 *		foucsIn ( void )
 *			: This method change a status to 'focusin'.
 *			This status is able to manage a widget.
 *		focusOut ( void )
 *			: This method change a status to 'focusout'.
 *			This status is not able to manage a widget.
 *
 *
 *	Events:
 *
 *		select : This event will occur when select a button.
 *		add : This event will occur when insert new button.
 *		remove : This event will occur when remove a button.
 *
 *	Examples:
 *
 *		<div data-role="multibuttonentry" data-label="To : " data-listUrl:"#addressbook" data-descMessage="{0} & {1} more...">
 *		</div>
 *
 */

( function ( $, window, document, undefined ) {
	$.widget( "tizen.multibuttonentry", $.mobile.widget, {
		_focusStatus : null,
		_items : null,
		_viewWidth : 0,
		_reservedWidth : 0,
		_currentWidth : 0,
		_fontSize : 0,
		_anchorWidth : 0,
		_labelWidth : 0,
		_marginWidth : 0,
		options : {
			label : "To : ",
			listUrl : "#addressbook",
			descMessage : "{0} & {1} more..."
		},
		_create : function () {
			var self = this,
				$view = this.element,
				role = $view.jqmData( "role" ),
				option = this.options,
				inputbox = $( document.createElement( "input" ) ),
				labeltag = $( document.createElement( "label" ) ),
				moreBlock = $( document.createElement( "a" ) );

			$view.hide().empty().addClass( "ui-" + role );

			// create a label tag.
			$( labeltag ).text( this.options.label ).addClass( "ui-multibuttonentry-label" );
			$view.append( labeltag );

			// create a input tag
			$( inputbox ).text( option.label ).addClass( "ui-multibuttonentry-input" );
			$view.append( inputbox );

			// create a anchor tag.
			$( moreBlock ).text( "+" ).attr( "href", option.listUrl ).addClass( "ui-multibuttonentry-link" );

			// append default htmlelements to main widget.
			$view.append( moreBlock );

			// bind a event
			this._bindEvents();
			self._focusStatus = "init";
			// display widget
			$view.show();
			$view.attr( "tabindex", -1 ).focusin( function ( e ) {
				self.focusIn();
			});

			// assign global variables
			self._viewWidth = $view.innerWidth();
			self._reservedWidth += self._calcBlockWidth( moreBlock );
			self._reservedWidth += self._calcBlockWidth( labeltag );
			self._fontSize = parseInt( $( moreBlock ).css( "font-size" ), 10 );
			self._currentWidth = self._reservedWidth;
		},
		// bind events
		_bindEvents : function () {
			var self = this,
				$view = self.element,
				option = self.options,
				inputbox = $view.find( ".ui-multibuttonentry-input" ),
				moreBlock = $view.find( ".ui-multibuttonentry-link" );

			inputbox.bind( "keydown", function ( event ) {
				// 8  : backspace
				// 13 : Enter
				var keyValue = event.keyCode,
					valueString = $( inputbox ).val();

				if ( keyValue == 8 ) {
					if ( valueString.length === 0 ) {
						self._validateTargetBlock();
					}
				} else if ( keyValue == 13 ) {
					if ( valueString.length !== 0 ) {
						self._addTextBlock( valueString );
					}
					inputbox.val( "" );
				} else {
					self._unlockTextBlock();
				}
			});

			moreBlock.click( function () {
				$.mobile.changePage( option.listUrl, {
					transition: "slide",
					reverse: false,
					changeHash: false
				} );
			} );

			$( document ).bind( "pagechange.mbe", function ( event ) {
				if ( $view.innerWidth() === 0 ) {
					return ;
				}
				var inputBox = $view.find( ".ui-multibuttonentry-input" );
				if ( self._labelWidth === 0 ) {
					self._labelWidth = $view.find( ".ui-multibuttonentry-label" ).outerWidth( true );
					self._anchorWidth = $view.find( ".ui-multibuttonentry-link" ).outerWidth( true );
					self._marginWidth = parseInt( ( $( inputBox ).css( "margin-left" ) ), 10 );
					self._marginWidth += parseInt( ( $( inputBox ).css( "margin-right" ) ), 10 );
					self._viewWidth = $view.innerWidth();
				}
				self._modifyInputBoxWidth();
			});
		},
		// create a textbutton and append this button to parent layer.
		// @param arg1 : string
		// @param arg2 : index
		_addTextBlock : function ( messages, blcokIndex ) {
			if ( arguments.length === 0 ) {
				return;
			}

			if ( ! messages ) {
				return ;
			}

			var self = this,
				$view = self.element,
				content = messages,
				index = blcokIndex,
				blocks = null,
				dataBlock = null,
				displayText = null,
				textBlock = null;

			if ( self._viewWidth === 0 ) {
				self._viewWidth = $view.innerWidth();
			}
			// save src data
			dataBlock = $( document.createElement( 'input' ) );
			dataBlock.val( content ).addClass( "ui-multibuttonentry-data" ).hide();

			// Create a new text HTMLDivElement.
			textBlock = $( document.createElement( 'div' ) );
			displayText = self._ellipsisTextBlock( content ) ;
			textBlock.text( displayText ).addClass( "ui-multibuttonentry-block" );
			textBlock.append( dataBlock );
			// bind a event to HTMLDivElement.
			textBlock.bind( "vclick", function ( event ) {
				if ( self._focusStatus === "focusOut" ) {
					self.focusInEvent();
					return;
				}

				if ( $( this ).hasClass( "ui-multibuttonentry-sblock" ) ) {
					// If block is selected, it will be removed.
					self._removeTextBlock();
				}

				var lockBlock = $view.find( "div.ui-multibuttonentry-sblock" );
				if ( typeof lockBlock != "undefined" ) {
					lockBlock.removeClass( "ui-multibuttonentry-sblock" ).addClass( "ui-multibuttonentry-block" );
				}
				$( this ).removeClass( "ui-multibuttonentry-block" ).addClass( "ui-multibuttonentry-sblock" );
				self._trigger( "select" );
			});

			blocks = $view.find( "div" );
			if ( index !== null && index <= blocks.length ) {
				$( blocks[index] ).before( textBlock );
			} else {
				$view.find( ".ui-multibuttonentry-input" ).before( textBlock );
			}

			self._currentWidth += self._calcBlockWidth( textBlock );
			self._modifyInputBoxWidth();
			self._trigger( "add" );
		},
		_removeTextBlock : function () {
			var self = this,
				$view = this.element,
				targetBlock = null,
				lockBlock = $view.find( "div.ui-multibuttonentry-sblock" );

			if ( lockBlock !== null && lockBlock.length > 0 ) {
				self._currentWidth -= self._calcBlockWidth( lockBlock );
				lockBlock.remove();
				self._modifyInputBoxWidth();
				this._trigger( "remove" );
			} else {
				$view.find( "div:last" ).removeClass( "ui-multibuttonentry-block" ).addClass( "ui-multibuttonentry-sblock" );
			}
		},
		_calcBlockWidth : function ( block ) {
			var blockWidth = 0;
			blockWidth = $( block ).outerWidth( true );
			return blockWidth;
		},
		_unlockTextBlock : function () {
			var $view = this.element,
				lockBlock = $view.find( "div.ui-multibuttonentry-sblock" );
			if ( lockBlock !== null ) {
				lockBlock.removeClass( "ui-multibuttonentry-sblock" ).addClass( "ui-multibuttonentry-block" );
			}
		},
		// call when remove text block by backspace key.
		_validateTargetBlock : function () {
			var self = this,
				$view = self.element,
				lastBlock = $view.find( "div:last" ),
				tmpBlock = null;

			if ( lastBlock.hasClass( "ui-multibuttonentry-sblock" ) ) {
				self._removeTextBlock();
			} else {
				tmpBlock = $view.find( "div.ui-multibuttonentry-sblock" );
				tmpBlock.removeClass( "ui-multibuttonentry-sblock" ).addClass( "ui-multibuttonentry-block" );
				lastBlock.removeClass( "ui-multibuttonentry-block" ).addClass( "ui-multibuttonentry-sblock" );
			}
		},
		_ellipsisTextBlock : function ( text ) {
			var self = this,
				str = text,
				length = 0,
				maxWidth = self._viewWidth,
				maxCharCnt = parseInt( ( self._viewWidth / self._fontSize ), 10 ) - 5,
				ellipsisStr = null;
			if ( str ) {
				length = str.length ;
				if ( length > maxCharCnt ) {
					ellipsisStr = str.substring( 0, maxCharCnt );
					ellipsisStr += "...";
				} else {
					ellipsisStr = str;
				}
			}
			return ellipsisStr;
		},
		_modifyInputBoxWidth : function () {
			var self = this,
				$view = self.element,
				labelWidth = self._labelWidth,
				anchorWidth = self._anchorWidth,
				inputBoxWidth = self._viewWidth - labelWidth - anchorWidth,
				blocks = $view.find( "div" ),
				blockWidth = 0,
				index = 0,
				margin = self._marginWidth,
				inputBox = $view.find( ".ui-multibuttonentry-input" );

			if ( $view.width() === 0 ) {
				return ;
			}

			for ( index = 0; index < blocks.length; index += 1 ) {
				blockWidth = self._calcBlockWidth( blocks[index] );
				inputBoxWidth = inputBoxWidth - blockWidth;
				if ( inputBoxWidth <= 0 ) {
					if ( inputBoxWidth + anchorWidth >= 0 ) {
						inputBoxWidth = self._viewWidth - anchorWidth;
					} else {
						inputBoxWidth = self._viewWidth - blockWidth - anchorWidth;
					}
				}
			}
			$( inputBox ).width( inputBoxWidth - margin - 1 );
		},
		_stringFormat : function ( expression ) {
			var pattern = null,
				message = expression,
				i = 0;
			for ( i = 1; i < arguments.length; i += 1 ) {
				pattern = "{" + ( i - 1 ) + "}";
				message = message.replace( pattern, arguments[i] );
			}
			return message;
		},
		_resizeBlock : function () {
			var self = this,
				$view = self.element,
				dataBlocks = $( ".ui-multibuttonentry-data" ),
				blocks = $view.find( "div" ),
				srcTexts = [],
				index = 0;

			$view.hide();
			for ( index = 0 ; index < dataBlocks.length ; index += 1 ) {
				srcTexts[index] = $( dataBlocks[index] ).val();
				self._addTextBlock( srcTexts[index] );
			}
			blocks.remove();
			$view.show();
		},

		//----------------------------------------------------//
		//					Public Method					//
		//----------------------------------------------------//
		//
		// Focus In Event
		//
		focusIn : function () {
			if ( this._focusStatus === "focusIn" ) {
				return;
			}

			var $view = this.element;

			$view.find( "label" ).show();
			$view.find( ".ui-multibuttonentry-desclabel" ).remove();
			$view.find( "div.ui-multibuttonentry-sblock" ).removeClass( "ui-multibuttonentry-sblock" ).addClass( "ui-multibuttonentry-block" );
			$view.find( "div" ).show();
			$view.find( ".ui-multibuttonentry-input" ).show();
			$view.find( "a" ).show();

			// change focus state.
			this._modifyInputBoxWidth();
			this._focusStatus = "focusIn";
		},
		focusOut : function () {
			if ( this._focusStatus === "focusOut" ) {
				return;
			}

			var self = this,
				$view = self.element,
				tempBlock = null,
				statement = "",
				index = 0,
				lastIndex = 10,
				label = $view.find( "label" ),
				more = $view.find( "span" ),
				blocks = $view.find( "div" ),
				currentWidth = $view.outerWidth( true ) - more.outerWidth( true ) - label.outerWidth( true ),
				textWidth = currentWidth;

			$view.find( ".ui-multibuttonentry-input" ).hide();
			$view.find( "a" ).hide();
			blocks.hide();

			// div button
			currentWidth = currentWidth - self._reservedWidth;
			for ( index = 0; index < blocks.length; index += 1 ) {
				currentWidth = currentWidth - $( blocks[index] ).outerWidth( true );
				statement += ", " + $( blocks[index] ).text();
				if ( currentWidth <= 0 ) {
					statement = "," + $( blocks[0] ).text();
					statement = self._stringFormat( self.options.descMessage, statement, blocks.length - 1 );
					break;
				}
				lastIndex = statement.length;
			}
			tempBlock = $( document.createElement( 'input' ) );
			tempBlock.val( statement.substr( 1, statement.length ) );
			tempBlock.addClass( "ui-multibuttonentry-desclabel" ).addClass( "ui-multibuttonentry-desclabel" );
			tempBlock.width( textWidth - ( self._reservedWidth ) );
			tempBlock.attr( "disabled", true );
			$view.find( "label" ).after( tempBlock );
			// update foucs state
			this._focusStatus = "focusOut";
		},
		inputText : function ( message ) {
			var $view = this.element;

			if ( arguments.length === 0 ) {
				return $view.find( ".ui-multibuttonentry-input" ).val();
			}
			$view.find( ".ui-multibuttonentry-input" ).val( message );
			return message;
		},
		select : function ( index ) {
			var $view = this.element,
				lockBlock = null,
				blocks = null;

			if ( this._focusStatus === "focusOut" ) {
				return;
			}

			if ( arguments.length === 0 ) {
				// return a selected block.
				lockBlock = $view.find( "div.ui-multibuttonentry-sblock" );
				if ( lockBlock) {
					return lockBlock.text();
				}
				return null;
			}
			// 1. unlock all blocks.
			this._unlockTextBlock();
			// 2. select pointed block.
			blocks = $view.find( "div" );
			if ( blocks.length > index ) {
				$( blocks[index] ).removeClass( "ui-multibuttonentry-block" ).addClass( "ui-multibuttonentry-sblock" );
				this._trigger( "select" );
			}
			return null;
		},
		add : function ( message, position ) {
			if ( this._focusStatus === "focusOut" ) {
				return;
			}

			this._addTextBlock( message, position );
		},
		remove : function ( position ) {
			var self = this,
				$view = this.element,
				blocks = $view.find( "div" ),
				index = 0;
			if ( this._focusStatus === "focusOut" ) {
				return;
			}

			if ( arguments.length === 0 ) {
				blocks.remove();
				this._trigger( "clear" );
			} else if ( typeof position == "number" ) {
				// remove selected button
				index = ( ( position < blocks.length ) ? position : ( blocks.length - 1 ) );
				$( blocks[index] ).remove();
				this._trigger( "remove" );
			}
			self._modifyInputBoxWidth();
		},
		length : function () {
			return this.element.find( "div" ).length;
		},
		refresh : function () {
			var self = this;
			self.element.hide();
			self.element.show();
		},
		destory : function () {
			var $view = this.element;

			$view.find( "label" ).remove();
			$view.find( "div" ).unbind( "vclick" ).remove();
			$view.find( "a" ).remove();
			$view.find( ".ui-multibuttonentry-input" ).unbind( "keydown" ).remove();

			this._trigger( "destory" );
		}
	});

	$( document ).bind( "pagecreate create", function () {
		$( ":jqmData(role='multibuttonentry')" ).multibuttonentry();
	});

	$( window ).bind( "resize", function () {
		$( ":jqmData(role='multibuttonentry')" ).multibuttonentry( "refresh" );
	});
} ( jQuery, window, document ) );
/*
 * Authors: Yonghwi Park <yonghwi0324.park@samsung.com>
 *		 Wonseop Kim <wonseop.kim@samsung.com>
 */

/**
 * MultiMediaView is a widget that provides an audio or a video content handling features.
 * A multi-media content handled with this widget can be played with HTML5's <audio> or <video> tag.
 * If a user wants to play a music file, he should use "<audio>" tag.
 * And he should use "<video>" tag to play a video file.
 *
 * HTML Attributes:
 *			data-theme : Set a theme of widget.
 *				If this value is not defined, widget will use parent`s theme. (optional)
 *			data-controls : If this value is 'true', widget will use belonging controller.
 *				If this value is 'false', widget will use browser`s controller.
 *				Default value is 'true'.
 *			data-fullscreen : Set a status that fullscreen when inital start.
 *				Default value is 'false'.
 *
 * APIs:
 *			width( [number] )
 *					: Get or set a widget of widget.
 *			height( [number] )
 *					: Get or set a height of widget.
 *			size( number, number )
 *					: Set a size of widget and resize a widget.
 *					 First argument is width and second argument is height.
 *			fullscreen( [boolean] )
 *					: Set a status that fullscreen.
 *
 * Events:
 *
 *			create :  triggered when a multimediaview is created.
 *
 * Examples:
 *
 *			VIDEO :
 *				<video data-controls="true" style="width:100%;">
 *					<source src="media/oceans-clip.mp4" type="video/mp4" />
 *					Your browser does not support the video tag.
 *				</video>
 *
 *			AUDIO :
 *				<audio data-controls="true" style="width:100%;">
 *					<source src="media/Over the horizon.mp3" type="audio/mp3" />
 *					Your browser does not support the audio tag.
 *				</audio>
 *
 */

( function ( $, document, window, undefined ) {
	$.widget( "tizen.multimediaview", $.mobile.widget, {
		options : {
			theme : null,
			controls : true,
			fullscreen : false,
			initSelector : "video, audio"
		},
		_create : function () {
			var self = this,
				view = self.element,
				viewElement = view[0],
				option = self.options,
				role = "multimediaview",
				control = null;

			$.extend( this, {
				role : null,
				isControlHide : false,
				controlTimer : null,
				isVolumeHide : true,
				isVertical : true,
				backupView : null
			});

			self.role = role;
			view.addClass( "ui-multimediaview" );
			control = self._createControl();

			if ( view[0].nodeName === "AUDIO" ) {
				control.addClass( "ui-multimediaview-audio" );
			}

			control.hide();
			view.wrap( "<div class='ui-multimediaview-wrap'>" ).after( control );
			if ( option.controls ) {
				if ( view.attr("controls") ) {
					view.removeAttr( "controls" );
				}
			}

			self._addEvent();

			$( document ).bind( "pagechange.multimediaview", function ( e ) {
				var $page = $( e.target );
				if ( $page.find( view ).length > 0 && viewElement.autoplay ) {
					viewElement.play();
				}

				if ( option.controls ) {
					control.show();
					self._resize();
				}
			}).bind( "pagebeforechange.multimediaview", function ( e ) {
				if ( viewElement.played.length !== 0 ) {
					viewElement.pause();
					control.hide();
				}
			});
			$( window ).bind( "resize.multimediaview orientationchange.multimediaview", function ( e ) {
				if ( !option.controls ) {
					return;
				}
				var $page = $( e.target ),
					$scrollview = view.parents( ".ui-scrollview-clip" );

				$scrollview.each( function ( i ) {
					if ( $.data( this, "scrollview" ) ) {
						$( this ).scrollview( "scrollTo", 0, 0 );
					}
				});

				// for maintaining page layout
				if ( !option.fullscreen ) {
					$( ".ui-footer:visible" ).show();
				} else {
					$( ".ui-footer" ).hide();
					self._fitContentArea( $page );
				}

				self._resize();
			});
		},
		_resize : function () {
			var view = this.element,
				parent = view.parent(),
				control = parent.find( ".ui-multimediaview-control" ),
				viewWidth = 0,
				viewHeight = 0,
				viewOffset = null;

			this._resizeFullscreen( this.options.fullscreen );
			viewWidth = ( ( view[0].nodeName === "VIDEO" ) ? view.width() : parent.width() );
			viewHeight = ( ( view[0].nodeName === "VIDEO" ) ? view.height() : control.height() );
			viewOffset = view.offset();

			this._resizeControl( viewOffset, viewWidth, viewHeight );

			this._updateSeekBar();
			this._updateVolumeState();
		},
		_resizeControl : function ( offset, width, height ) {
			var self = this,
				view = self.element,
				viewElement = view[0],
				control = view.parent().find( ".ui-multimediaview-control" ),
				buttons = control.find( ".ui-button" ),
				playpauseButton = control.find( ".ui-playpausebutton" ),
				volumeControl = control.find( ".ui-volumecontrol" ),
				seekBar = control.find( ".ui-seekbar" ),
				durationLabel = control.find( ".ui-durationlabel" ),
				controlWidth = width,
				controlHeight = control.outerHeight( true ),
				availableWidth = 0,
				controlOffset = null;

			if ( control ) {
				if ( view[0].nodeName === "VIDEO" ) {
					controlOffset = control.offset();
					controlOffset.left = offset.left;
					controlOffset.top = offset.top + height - controlHeight;
					control.offset( controlOffset );
				}

				control.width( controlWidth );
			}

			if ( seekBar ) {
				availableWidth = control.width() - ( buttons.outerWidth( true ) * buttons.length );
				availableWidth -= ( parseInt( buttons.eq( 0 ).css( "margin-left" ), 10 ) + parseInt( buttons.eq( 0 ).css( "margin-right" ), 10 ) ) * buttons.length;
				if ( !self.isVolumeHide ) {
					availableWidth -= volumeControl.outerWidth( true );
				}
				seekBar.width( availableWidth );
			}

			if ( durationLabel && !isNaN( viewElement.duration ) ) {
				durationLabel.find( "p" ).text( self._convertTimeFormat( viewElement.duration ) );
			}

			if ( viewElement.autoplay && viewElement.paused === false ) {
				playpauseButton.removeClass( "ui-play-icon" ).addClass( "ui-pause-icon" );
			}
		},
		_resizeFullscreen : function ( isFullscreen ) {
			var self = this,
				view = self.element,
				parent = view.parent(),
				control = view.parent().find( ".ui-multimediaview-control" ),
				playpauseButton = control.find( ".ui-playpausebutton" ),
				timestampLabel = control.find( ".ui-timestamplabel" ),
				seekBar = control.find( ".ui-seekbar" ),
				durationBar = seekBar.find( ".ui-duration" ),
				currenttimeBar = seekBar.find( ".ui-currenttime" ),
				docWidth = 0,
				docHeight = 0;

			if ( isFullscreen ) {
				if ( !self.backupView ) {
					self.backupView = {
						width : view[0].style.getPropertyValue( "width" ) || "",
						height : view[0].style.getPropertyValue( "height" ) || "",
						position : view.css( "position" ),
						zindex : view.css( "z-index" )
					};
				}
				docWidth = $( "body" )[0].clientWidth;
				docHeight = $( "body" )[0].clientHeight;

				view.width( docWidth ).height( docHeight - 1 );
				view.addClass( "ui-" + self.role + "-fullscreen" );
				view.offset( {
					top : 0,
					left : 0
				});
			} else {
				if ( !self.backupView ) {
					return;
				}

				view.removeClass( "ui-" + self.role + "-fullscreen" );
				view.css( {
					"width" : self.backupView.width,
					"height" : self.backupView.height,
					"position": self.backupView.position,
					"z-index": self.backupView.zindex
				});
				self.backupView = null;
			}
			parent.show();
		},
		_addEvent : function () {
			var self = this,
				view = self.element,
				viewElement = view[0],
				control = view.parent().find( ".ui-multimediaview-control" ),
				playpauseButton = control.find( ".ui-playpausebutton" ),
				timestampLabel = control.find( ".ui-timestamplabel" ),
				durationLabel = control.find( ".ui-durationlabel" ),
				volumeButton = control.find( ".ui-volumebutton" ),
				volumeControl = control.find( ".ui-volumecontrol" ),
				volumeBar = volumeControl.find( ".ui-volumebar" ),
				volumeGuide = volumeControl.find( ".ui-guide" ),
				volumeHandle = volumeControl.find( ".ui-handler" ),
				fullscreenButton = control.find( ".ui-fullscreenbutton" ),
				seekBar = control.find( ".ui-seekbar" ),
				durationBar = seekBar.find( ".ui-duration" ),
				currenttimeBar = seekBar.find( ".ui-currenttime" );

			view.bind( "loadedmetadata.multimediaview", function ( e ) {
				if ( !isNaN( viewElement.duration ) ) {
					durationLabel.find( "p" ).text( self._convertTimeFormat( viewElement.duration ) );
				}
				self._resize();
			}).bind( "timeupdate.multimediaview", function ( e ) {
				self._updateSeekBar();
			}).bind( "play.multimediaview", function ( e ) {
				playpauseButton.removeClass( "ui-play-icon" ).addClass( "ui-pause-icon" );
			}).bind( "pause.multimediaview", function ( e ) {
				playpauseButton.removeClass( "ui-pause-icon" ).addClass( "ui-play-icon" );
			}).bind( "ended.multimediaview", function ( e ) {
				if ( typeof viewElement.loop == "undefined" || viewElement.loop === "" ) {
					self.stop();
				}
			}).bind( "volumechange.multimediaview", function ( e ) {
				if ( viewElement.volume < 0.1 ) {
					viewElement.muted = true;
					volumeButton.removeClass( "ui-volume-icon" ).addClass( "ui-mute-icon" );
				} else {
					viewElement.muted = false;
					volumeButton.removeClass( "ui-mute-icon" ).addClass( "ui-volume-icon" );
				}

				if ( !self.isVolumeHide ) {
					self._updateVolumeState();
				}
			}).bind( "durationchange.multimediaview", function ( e ) {
				if ( !isNaN( viewElement.duration ) ) {
					durationLabel.find( "p" ).text( self._convertTimeFormat( viewElement.duration ) );
				}
				self._resize();
			}).bind( "error.multimediaview", function ( e ) {
				switch ( e.target.error.code ) {
				case e.target.error.MEDIA_ERR_ABORTED :
					window.alert( 'You aborted the video playback.' );
					break;
				case e.target.error.MEDIA_ERR_NETWORK :
					window.alert( 'A network error caused the video download to fail part-way.' );
					break;
				case e.target.error.MEDIA_ERR_DECODE :
					window.alert( 'The video playback was aborted due to a corruption problem or because the video used features your browser did not support.' );
					break;
				case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED :
					window.alert( 'The video could not be loaded, either because the server or network failed or because the format is not supported.' );
					break;
				default :
					window.alert( 'An unknown error occurred.' );
					break;
				}
			}).bind( "vclick.multimediaview", function ( e ) {
				if ( !self.options.controls ) {
					return;
				}

				control.fadeToggle( "fast", function () {
					var offset = control.offset();
					self.isControlHide = !self.isControlHide;
					if ( self.options.mediatype == "video" ) {
						self._startTimer();
					}
				});
				self._resize();
			});

			playpauseButton.bind( "vclick.multimediaview", function () {
				self._endTimer();

				if ( viewElement.paused ) {
					viewElement.play();
				} else {
					viewElement.pause();
				}

				if ( self.options.mediatype == "video" ) {
					self._startTimer();
				}
			});

			fullscreenButton.bind( "vclick.multimediaview", function () {
				self.fullscreen( !self.options.fullscreen );
				control.fadeIn( "fast" );
				self._endTimer();
			});

			seekBar.bind( "vmousedown.multimediaview", function ( e ) {
				var x = e.clientX,
					duration = viewElement.duration,
					durationOffset = durationBar.offset(),
					durationWidth = durationBar.width(),
					timerate = ( x - durationOffset.left ) / durationWidth,
					time = duration * timerate;

				viewElement.currentTime = time;

				self._endTimer();

				e.preventDefault();
				e.stopPropagation();

				$( document ).bind( "vmousemove.multimediaview", function ( e ) {
					var x = e.clientX,
						timerate = ( x - durationOffset.left ) / durationWidth;

					viewElement.currentTime = duration * timerate;

					e.preventDefault();
					e.stopPropagation();
				}).bind( "vmouseup.multimediaview", function () {
					$( document ).unbind( "vmousemove.multimediaview vmouseup.multimediaview" );
					if ( viewElement.paused ) {
						viewElement.pause();
					} else {
						viewElement.play();
					}
				});
			});

			volumeButton.bind( "vclick.multimediaview", function () {
				if ( self.isVolumeHide ) {
					var view = self.element,
						volume = viewElement.volume;

					self.isVolumeHide = false;
					self._resize();
					volumeControl.fadeIn( "fast" );
					self._updateVolumeState();
					self._updateSeekBar();
				} else {
					self.isVolumeHide = true;
					volumeControl.fadeOut( "fast", function () {
						self._resize();
					});
					self._updateSeekBar();
				}
			});

			volumeBar.bind( "vmousedown.multimediaview", function ( e ) {
				var baseX = e.clientX,
					volumeGuideLeft = volumeGuide.offset().left,
					volumeGuideWidth = volumeGuide.width(),
					volumeBase = volumeGuideLeft + volumeGuideWidth,
					handlerOffset = volumeHandle.offset(),
					volumerate = ( baseX - volumeGuideLeft ) / volumeGuideWidth,
					currentVolume = ( baseX - volumeGuideLeft ) / volumeGuideWidth;

				self._endTimer();
				self._setVolume( currentVolume.toFixed( 2 ) );

				e.preventDefault();
				e.stopPropagation();

				$( document ).bind( "vmousemove.multimediaview", function ( e ) {
					var currentX = e.clientX,
						currentVolume = ( currentX - volumeGuideLeft ) / volumeGuideWidth;

					self._setVolume( currentVolume.toFixed( 2 ) );

					e.preventDefault();
					e.stopPropagation();
				}).bind( "vmouseup.multimediaview", function () {
					$( document ).unbind( "vmousemove.multimediaview vmouseup.multimediaview" );

					if ( self.options.mediatype == "video" ) {
						self._startTimer();
					}
				});
			});
		},
		_removeEvent : function () {
			var self = this,
				view = self.element,
				control = view.parent().find( ".ui-multimediaview-control" ),
				playpauseButton = control.find( ".ui-playpausebutton" ),
				fullscreenButton = control.find( ".ui-fullscreenbutton" ),
				seekBar = control.find( ".ui-seekbar" ),
				volumeControl = control.find( ".ui-volumecontrol" ),
				volumeBar = volumeControl.find( ".ui-volumebar" ),
				volumeHandle = volumeControl.find( ".ui-handler" );

			view.unbind( ".multimediaview" );
			playpauseButton.unbind( ".multimediaview" );
			fullscreenButton.unbind( ".multimediaview" );
			seekBar.unbind( ".multimediaview" );
			volumeBar.unbind( ".multimediaview" );
			volumeHandle.unbind( ".multimediaview" );
		},
		_createControl : function () {
			var self = this,
				view = self.element,
				control = $( "<span></span>" ),
				playpauseButton = $( "<span></span>" ),
				seekBar = $( "<span></span>" ),
				timestampLabel = $( "<span><p>00:00:00</p></span>" ),
				durationLabel = $( "<span><p>00:00:00</p></span>" ),
				volumeButton = $( "<span></span>" ),
				volumeControl = $( "<span></span>" ),
				volumeBar = $( "<div></div>" ),
				volumeGuide = $( "<span></span>" ),
				volumeValue = $( "<span></span>" ),
				volumeHandle = $( "<span></span>" ),
				fullscreenButton = $( "<span></span>" ),
				durationBar = $( "<span></span>" ),
				currenttimeBar = $( "<span></span>" );

			control.addClass( "ui-" + self.role + "-control" );
			playpauseButton.addClass( "ui-playpausebutton ui-button" );
			seekBar.addClass( "ui-seekbar" );
			timestampLabel.addClass( "ui-timestamplabel" );
			durationLabel.addClass( "ui-durationlabel" );
			volumeButton.addClass( "ui-volumebutton ui-button" );
			fullscreenButton.addClass( "ui-fullscreenbutton ui-button" );
			durationBar.addClass( "ui-duration" );
			currenttimeBar.addClass( "ui-currenttime" );
			volumeControl.addClass( "ui-volumecontrol" );
			volumeBar.addClass( "ui-volumebar" );
			volumeGuide.addClass( "ui-guide" );
			volumeValue.addClass( "ui-value" );
			volumeHandle.addClass( "ui-handler" );

			seekBar.append( durationBar ).append( currenttimeBar ).append( durationLabel ).append( timestampLabel );

			playpauseButton.addClass( "ui-play-icon" );
			if ( view[0].muted ) {
				$( volumeButton ).addClass( "ui-mute-icon" );
			} else {
				$( volumeButton ).addClass( "ui-volume-icon" );
			}

			volumeBar.append( volumeGuide ).append( volumeValue ).append( volumeHandle );
			volumeControl.append( volumeBar );

			control.append( playpauseButton ).append( seekBar ).append( volumeControl ).append( volumeButton );

			if ( self.element[0].nodeName === "VIDEO" ) {
				$( fullscreenButton ).addClass( "ui-fullscreen-on" );
				control.append( fullscreenButton );
			}
			volumeControl.hide();

			return control;
		},
		_startTimer : function ( duration ) {
			this._endTimer();

			if ( !duration ) {
				duration = 3000;
			}

			var self = this,
				view = self.element,
				control = view.parent().find( ".ui-multimediaview-control" ),
				volumeControl = control.find( ".ui-volumecontrol" );

			self.controlTimer = setTimeout( function () {
				self.isVolumeHide = true;
				self.isControlHide = true;
				self.controlTimer = null;
				volumeControl.hide();
				control.fadeOut( "fast" );
			}, duration );
		},
		_endTimer : function () {
			if ( this.controlTimer ) {
				clearTimeout( this.controlTimer );
				this.controlTimer = null;
			}
		},
		_convertTimeFormat : function ( systime ) {
			var ss = parseInt( systime % 60, 10 ).toString(),
				mm = parseInt( ( systime / 60 ) % 60, 10 ).toString(),
				hh = parseInt( systime / 3600, 10 ).toString(),
				time =	( ( hh.length < 2  ) ? "0" + hh : hh ) + ":" +
						( ( mm.length < 2  ) ? "0" + mm : mm ) + ":" +
						( ( ss.length < 2  ) ? "0" + ss : ss );

			return time;
		},
		_updateSeekBar : function ( currenttime ) {
			var self = this,
				view = self.element,
				duration = view[0].duration,
				control = view.parent().find( ".ui-multimediaview-control" ),
				seekBar = control.find(  ".ui-seekbar"  ),
				durationBar = seekBar.find( ".ui-duration" ),
				currenttimeBar = seekBar.find( ".ui-currenttime" ),
				timestampLabel = control.find( ".ui-timestamplabel" ),
				durationOffset = durationBar.offset(),
				durationWidth = durationBar.width(),
				durationHeight = durationBar.height(),
				timebarWidth = 0;

			if ( typeof currenttime == "undefined" ) {
				currenttime = view[0].currentTime;
			}
			timebarWidth = parseInt( currenttime / duration * durationWidth, 10 );
			durationBar.offset( durationOffset );
			currenttimeBar.offset( durationOffset ).width( timebarWidth );
			timestampLabel.find( "p" ).text( self._convertTimeFormat( currenttime ) );
		},
		_updateVolumeState : function () {
			var self = this,
				view = self.element,
				control = view.parent().find( ".ui-multimediaview-control" ),
				volumeControl = control.find( ".ui-volumecontrol" ),
				volumeButton = control.find( ".ui-volumebutton" ),
				volumeBar = volumeControl.find( ".ui-volumebar" ),
				volumeGuide = volumeControl.find( ".ui-guide" ),
				volumeValue = volumeControl.find( ".ui-value" ),
				volumeHandle = volumeControl.find( ".ui-handler" ),
				handlerWidth = volumeHandle.width(),
				handlerHeight = volumeHandle.height(),
				volumeGuideHeight = volumeGuide.height(),
				volumeGuideWidth = volumeGuide.width(),
				volumeGuideTop = 0,
				volumeGuideLeft = 0,
				volumeBase = 0,
				handlerOffset = null,
				volume = view[0].volume;

			volumeGuideTop = parseInt( volumeGuide.offset().top, 10 );
			volumeGuideLeft = parseInt( volumeGuide.offset().left, 10 );
			volumeBase = volumeGuideLeft;
			handlerOffset = volumeHandle.offset();
			handlerOffset.top = volumeGuideTop - parseInt( ( handlerHeight - volumeGuideHeight ) / 2, 10 );
			handlerOffset.left = volumeBase + parseInt( volumeGuideWidth * volume, 10 ) - parseInt( handlerWidth / 2, 10 );
			volumeHandle.offset( handlerOffset );
			volumeValue.width( parseInt( volumeGuideWidth * ( volume ), 10 ) );
		},
		_setVolume : function ( value ) {
			var viewElement = this.element[0];

			if ( value < 0.0 || value > 1.0 ) {
				return;
			}

			viewElement.volume = value;
		},
		_fitContentArea: function ( page, parent ) {
			if ( typeof parent == "undefined" ) {
				parent = window;
			}

			var $page = $( page ),
				$content = $( ".ui-content:visible:first" ),
				hh = $( ".ui-header:visible" ).outerHeight() || 0,
				fh = $( ".ui-footer:visible" ).outerHeight() || 0,
				pt = parseFloat( $content.css( "padding-top" ) ),
				pb = parseFloat( $content.css( "padding-bottom" ) ),
				wh = ( ( parent === window ) ? window.innerHeight : $( parent ).height() ),
				height = wh - ( hh + fh ) - ( pt + pb );

			$content.offset( {
				top : ( hh + pt )
			}).height( height );
		},
		width : function ( value ) {
			var self = this,
				args = arguments,
				view = self.element;

			if ( args.length === 0 ) {
				return view.width();
			}
			if ( args.length === 1 ) {
				view.width( value );
				self._resize();
			}
		},
		height : function ( value ) {
			var self = this,
				view = self.element,
				args = arguments;

			if ( args.length === 0 ) {
				return view.height();
			}
			if ( args.length === 1 ) {
				view.height( value );
				self._resize();
			}
		},
		size : function ( width, height ) {
			var self = this,
				view = self.element;

			view.width( width ).height( height );
			self._resize();
		},
		fullscreen : function ( value ) {
			var self = this,
				view = self.element,
				control = view.parent().find( ".ui-multimediaview-control" ),
				fullscreenButton = control.find( ".ui-fullscreenbutton" ),
				args = arguments,
				option = self.options,
				currentPage = $( ".ui-page-active" );

			if ( args.length === 0 ) {
				return option.fullscreen;
			}
			if ( args.length === 1 ) {
				view.parents( ".ui-content" ).scrollview( "scrollTo", 0, 0 );

				this.options.fullscreen = value;
				if ( value ) {
					currentPage.children( ".ui-header" ).hide();
					currentPage.children( ".ui-footer" ).hide();
					this._fitContentArea( currentPage );
					fullscreenButton.removeClass( "ui-fullscreen-on" ).addClass( "ui-fullscreen-off" );
				} else {
					currentPage.children( ".ui-header" ).show();
					currentPage.children( ".ui-footer" ).show();
					this._fitContentArea( currentPage );
					fullscreenButton.removeClass( "ui-fullscreen-off" ).addClass( "ui-fullscreen-on" );
				}
				self._resize();
			}
		},
		refresh : function () {
			this._resize();
		}
	});

	$( document ).bind( "pagecreate create", function ( e ) {
		$.tizen.multimediaview.prototype.enhanceWithin( e.target );
	});
} ( jQuery, document, window ) );
/* ***************************************************************************
 * Copyright (c) 2000 - 2011 Samsung Electronics Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 *	Author: Minkyu Kang <mk7.kang@samsung.com>
 */

/*
 * nocontents widget
 *
 * HTML Attributes
 *
 *  data-role: set to 'nocontents'.
 *  data-text1: top message.
 *  data-text2: bottom message.
 *  data-type: type of nocontents. You can set text, picture, multimedia and unnamed.
 *
 * APIs
 *
 *  N/A
 *
 * Events
 *
 *  N/A
 *
 * Examples
 *
 * Text Type
 * <div data-role="nocontents" id="nocontents" data-text1="Text1" data-text2="Text2" data-type="text"></div>
 *
 * Picture Type
 * <div data-role="nocontents" id="nocontents" data-text1="Text1" data-text2="Text2" data-type="picture"></div>
 *
 * Multimedia Type
 * <div data-role="nocontents" id="nocontents" data-text1="Text1" data-text2="Text2" data-type="multimedia"></div>
 *
 * Unnamed Type
 * <div data-role="nocontents" id="nocontents" data-text1="Text1" data-text2="Text2"></div>
 * or
 * <div data-role="nocontents" id="nocontents" data-text1="Text1" data-text2="Text2" data-type="unnamed"></div>
 *
 */

(function ( $, window, undefined ) {
	$.widget( "tizen.nocontents", $.mobile.widget, {

		max_height: 0,
		container: null,
		icon_img: null,
		text0_bg: null,
		text1_bg: null,

		_get_height: function () {
			var $page = $('.ui-page'),
				$content = $page.children('.ui-content'),
				$header = $page.children('.ui-header'),
				$footer = $page.children('.ui-footer'),
				header_h = $header.outerHeight() || 0,
				footer_h = $footer.outerHeight() || 0,
				padding_t = parseFloat( $content.css('padding-top') ) || 0,
				padding_b = parseFloat( $content.css('padding-bottom') ) || 0,
				content_h = $(window).height() - header_h - footer_h -
					(padding_t + padding_b) * 2,
				container_h = this.container.height();

			return ( content_h < container_h ? container_h : content_h );
		},

		_align: function () {
			var content_height = this._get_height(),
				icon_height = this.icon_img.height(),
				icon_width = this.icon_img.width(),
				content_gap = 46,
				text0_height = this.text0_bg.height() || 0,
				text1_height = this.text1_bg.height() || 0,
				text_top = 0,
				icon_top = (content_height -
					(icon_height + content_gap +
					 text0_height + text1_height)) / 2;

			if ( icon_top < content_gap ) {
				icon_top = content_gap;
			}

			this.container.height( content_height );

			this.icon_img.css( 'left',
				($(window).width() - icon_width) / 2 );
			this.icon_img.css( 'top', icon_top );

			text_top = icon_top + icon_height + content_gap;

			this.text0_bg.css( 'top', text_top );
			this.text1_bg.css( 'top', text_top + text0_height );
		},

		_create: function () {
			var icon_type = $( this.element ).jqmData('type'),
				text = new Array(2);

			if ( icon_type === undefined ||
					(icon_type !== "picture" &&
					 icon_type !== "multimedia" &&
					 icon_type !== "text") ) {
				icon_type = "unnamed";
			}

			text[0] = $( this.element ).jqmData('text1');
			text[1] = $( this.element ).jqmData('text2');

			if ( text[0] === undefined ) {
				text[0] = "";
			}

			if ( text[1] === undefined ) {
				text[1] = "";
			}

			this.container = $('<div class="ui-nocontents"/>');
			this.icon_img = $('<div class="ui-nocontents-icon-' +
					icon_type + '"/>');

			this.text0_bg = $('<div class="ui-nocontents-text">' +
					text[0] + '<div>');
			this.text1_bg = $('<div class="ui-nocontents-text">' +
					text[1] + '<div>');

			this.container.append( this.icon_img );
			this.container.append( this.text0_bg );
			this.container.append( this.text1_bg );

			$( this.element ).append( this.container );

			this._align();
		}
	});

	$( document ).bind( "pagecreate create", function ( e ) {
		$( e.target ).find(":jqmData(role='nocontents')").nocontents();
	});
} ( jQuery, this ));
/* ***************************************************************************
 * Copyright (c) 2000 - 2011 Samsung Electronics Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 *	Author: Minkyu Kang <mk7.kang@samsung.com>
 */

/*
 * Notification widget
 *
 * HTML Attributes
 *
 *  data-role: set to 'notification'.
 *  data-type: 'ticker' or 'popup'.
 *  data-text1: top text for tickernoti, text to show for smallpopup.
 *  data-text2: bottom text for tickernoti, smallpopup will ignore this text.
 *  data-param: parameter for 'tapped' event.
 *  data-interval: time to showing. If don't set, will show infinitely.
 *
 * APIs
 *
 *  show(): show the notification.
 *  hide(): hide the notification.
 *
 * Events
 *
 *  tapped: When you tap or click the smallpopup, this event will be raised.
 *
 * Examples
 *
 * // tickernoti
 * <div data-role="notification" id="notification" data-type="ticker" data-text1="text1" data-text2="text2" data-param="parameters" data-interval="3000"></div>
 *
 * // smallpopup
 * <div data-role="notification" id="notification" data-type="popup" data-text1="text1" data-param="parameters" data-interval="3000"></div>
 *
 * // event
 * $('#notification-demo').bind('tapped', function (e, m) {
 *	alert('notification is tapped\nparameter:"' + m + '"');
 * });
 *
 */

(function ( $, window ) {
	$.widget( "tizen.notification", $.mobile.widget, {
		btn: null,
		param: null,
		interval: null,
		seconds: null,
		running: false,

		_refresh: function () {
			this._del_event();
			this._update();
			this._add_event();

			$( this.html ).addClass("fix");
		},

		show: function () {
			if ( this.running ) {
				this._refresh();
				return;
			}

			this._update();

			this._add_event();

			this.running = true;
			$( this.html ).addClass("show");
		},

		hide: function () {
			if ( !this.running ) {
				return;
			}

			$( this.html ).addClass("hide");
			$( this.html ).removeClass("show").removeClass("fix");
			this._del_event();

			this.running = false;
		},

		close: function () {
			$( this.html ).removeClass("show").removeClass("hide").removeClass("fix");
			this._del_event();

			this.running = false;
		},

		_get_container: function () {
			if ( this.type === 'ticker' ) {
				return $( this.element ).find(".ui-ticker");
			}

			return $( this.element ).find(".ui-smallpopup");
		},

		_add_event: function () {
			var self = this,
				container = this._get_container();

			if ( this.type === 'ticker' ) {
				container.find(".ui-ticker-btn").append( this.btn );

				this.btn.bind( "vmouseup", function () {
					self.hide();
				});
			}

			container.bind( 'vmouseup', function () {
				self.element.trigger( 'tapped', self.param );
				self.hide();
			});

			if ( this.seconds !== undefined && this.second !== 0 ) {
				this.interval = setInterval( function () {
					self.hide();
				}, this.seconds );
			}
		},

		_del_event: function () {
			var container = this._get_container();

			if ( this.type === 'ticker' ) {
				this.btn.unbind("vmouseup");
			}
			container.unbind('vmouseup');
			clearInterval( this.interval );
		},

		_set_position: function () {
			var container = this._get_container(),
				container_h = parseFloat( container.css('height') ),
				$page = $('.ui-page'),
				$footer = $page.children('.ui-footer'),
				footer_h = $footer.outerHeight() || 0,
				position = $(window).height() - container_h - footer_h;

			container.css( 'top', position );
		},

		_update: function () {
			var text = new Array(2);

			if ( this.html ) {
				this.html.detach();
			}

			text[0] = $(this.element).jqmData('text1');
			text[1] = $(this.element).jqmData('text2');
			this.param = $(this.element).jqmData('param');
			this.seconds = $(this.element).jqmData('interval');
			this.type = $(this.element).jqmData('type') || 'popup';

			if ( this.type === 'ticker' ) {
				this.html = $('<div class="ui-ticker">' +
						'<div class="ui-ticker-icon"></div>' +
						'<div class="ui-ticker-text1-bg">' +
						text[0] + '</div>' +
						'<div class="ui-ticker-text2-bg">' +
						text[1] + '</div>' +
						'<div class="ui-ticker-body"></div>' +
						'<div class="ui-ticker-btn"></div>' +
						'</div>');

				$( this.element ).append( this.html );
			} else {
				this.html = $('<div class="ui-smallpopup">' +
						'<div class="ui-smallpopup-text-bg">' +
						text[0] + '</div>' +
						'</div>');

				$( this.element ).append( this.html );

				this._set_position();
			}
		},

		_create: function () {
			this.btn = $("<a href='#' class='ui-input-cancel' title='close' data-theme='s'>Close</a>")
				.tap( function ( event ) {
					event.preventDefault();
				})
				.buttonMarkup({
					inline: true,
					corners: true,
					shadow: true
				});

			this._update();
			this.running = false;
		}
	}); // End of widget

	// auto self-init widgets
	$( document ).bind( "pagecreate create", function ( e ) {
		$( e.target ).find(":jqmData(role='notification')").notification();
	});

	$( document ).bind( "pagebeforehide", function ( e ) {
		$( e.target ).find(":jqmData(role='notification')").notification('close');
	});
}( jQuery, this ));
/*
 * jQuery Mobile Widget @VERSION
 *
 * This software is licensed under the MIT licence (as defined by the OSI at
 * http://www.opensource.org/licenses/mit-license.php)
 *
 * ***************************************************************************
 * Copyright (c) 2000 - 2011 Samsung Electronics Co., Ltd.
 * Copyright (c) 2011 by Intel Corporation Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 * Authors: Elliot Smith <elliot.smith@intel.com>
 */

// optionheader provides a collapsible toolbar for buttons and
// segmented controls directly under the title bar. It
// wraps a jQuery Mobile grid in a collapsible container; clicking
// on the container, or on one of the buttons inside the container,
// will collapse it.
//
// To add an option header to a page, mark up the header with a
// data-role="optionheader" attribute, as shown in this example:
//
// <div data-role="header">
//     <h1>Option header - 3 buttons example</h1>
//     <div data-role="optionheader">
//        <div class="ui-grid-b">
//             <div class="ui-block-a"><a data-role="button">Previous</a></div>
//             <div class="ui-block-b"><a data-role="button">Cancel</a></div>
//             <div class="ui-block-c"><a data-role="button">Next</a></div>
//        </div>
//     </div>
// </div>
//
// The optionheader can also be used inline (e.g. in a content block or
// a widget).
//
// Alternatively, use $('...').optionheader() to apply programmatically.
//
// The grid inside the optionheader should be marked up as for
// a standard jQuery Mobile grid. (The widget has been tested with one
// or two rows of 2-4 columns each.)
//
// Note that if you use this with fixed headers, you may find that
// expanding the option header increases the page size so that scrollbars
// appear (jQuery Mobile's own collapsible content areas cause the
// same issue). You can alleviate this somewhat by calling the show() method
// on the page toolbars each time the size of the header changes.
//
// The widget is configurable via a data-options attribute on the same
// div as the data-role="optionheader" attribute, e.g.
//
// <div data-role="header">
//     <h1>Option header - configured</h1>
//     <div data-role="optionheader" data-options='{"collapsed":true, "duration":1.5}'>
//        <div class="ui-grid-b">
//             <div class="ui-block-a"><a data-role="button">Previous</a></div>
//             <div class="ui-block-b"><a data-role="button">Cancel</a></div>
//             <div class="ui-block-c"><a data-role="button">Next</a></div>
//        </div>
//     </div>
// </div>
//
// Options can also be set with $(...).optionheader('option', 'name', value).
// However, if you do this, you'll need to call $(...).optionheader('refresh')
// afterwards for the new values to take effect (note that optionheader()
// can be applied multiple times to an element without side effects).
//
// See below for the available options.
//
// Theme: by default, gets a 'b' swatch; override with data-theme="X"
// as per usual
//
// Options (can be set with a data-options attribute):
//
//   {Boolean} [showIndicator=true] Set to true (the default) to show
//   the upward-pointing arrow indicator on top of the title bar.
//   {Boolean} [startCollapsed=false] Sets the appearance when the option
//   header is first displayed; defaults to false (i.e. show the header
//   expanded on first draw). NB setting this option later has no
//   effect: use collapse() to collapse a widget which is already
//   drawn.
//   {Boolean} [expandable=true] Sets whether the header will expand
//   in response to clicks; default = true.
//   {Float} [duration=0.25] Duration of the expand/collapse animation.
//
// Methods (see below for docs):
//
//   toggle(options)
//   expand(options)
//   collapse(options)
//
// Events:
//
//   expand: Triggered when the option header is expanded
//   collapse: Triggered when the option header is collapsed
//


(function ($, undefined) {
	$.widget("tizen.optionheader", $.mobile.widget, {
		options: {
			initSelector: ":jqmData(role='optionheader')",
			showIndicator: true,
			theme: 's',
			startCollapsed: false,
			expandable: true,
			duration: 0.25,
			collapseOnInit : true,
			default_font_size : $('html').css('font-size')
		},
		collapsedHeight: '5px',

		_create: function () {
			var options,
				theme,
				self = this,
				elementHeight = 106,
				parentPage,
				dataOptions = this.element.jqmData( 'options' ),
				page = this.element.closest( ':jqmData(role="page")' );
			// parse data-options
			$.extend( this.options, dataOptions );

			this.isCollapsed = this.options.collapseOnInit;
			this.expandedHeight = null;

			// parse data-theme and reset options.theme if it's present
			theme = this.element.jqmData( 'theme' ) || this.options.theme;
			this.options.theme = theme;

			this.element.closest( ':jqmData(role="header")' ).addClass( "ui-option-header-resizing" );

			// set up the click handler; it's done here so it can
			// easily be removed, as there should only be one instance
			// of the handler function for each class instance
			this.clickHandler = function () {
				self.toggle();
			};

			/* Apply REM scaling */
			elementHeight = elementHeight / ( 36 / parseInt(this.option.default_font_size) );

			if ( this.element.height() < elementHeight ) {
				this.element.css( "height", elementHeight );
			}

			// get the element's dimensions
			// and to set its initial collapse state;
			// either do it now (if the page is visible already)
			// or on pageshow

			if ( page.is(":visible") ) {
				self.refresh();
				self._realize();
			} else {
				self.refresh();

				page.bind( "pagebeforeshow", function () {
					self._setArrowLeft();
					self._realize();
				});
			}
			self._setArrowLeft();
	//        this.refresh();
		},

		_realize: function () {
			if ( !this.expandedHeight ) {
				this.expandedHeight = this.element.height();
			}

			if ( this.isCollapsed ) {
	//        if (this.options.startCollapsed) {
				this.collapse( {duration: 0} );
			}
		},

		_setArrowLeft: function () {
			var matchingBtn = $( this.element ).jqmData( "for" ),
				arrowCenter = 14,
				btn2Position = 10,
				btn3Position = 144,
				matchBtn = $( this.element ).parents( ".ui-page" ).find( "#" + matchingBtn ),
				buttonRight = matchBtn.nextAll().is( "a" ) ? btn3Position : btn2Position;
				/* Apply REM scaling */
				scaleFactor = ( 36 / parseInt(this.option.default_font_size) );

			if ( $(this.element).parents(".ui-page").find( "#" + matchingBtn ).length != 0 ) {

				if ( this.options.expandable ) {
					matchBtn.bind( 'vclick', this.clickHandler );
				} else {
					matchBtn.unbind( 'vclick', this.clickHandler );
				}

				// decide arrow Button position
				if ( matchBtn.css( "left" ) && matchBtn.css( "left" ) != "auto" ) {
					$( ".ui-triangle-image" ).css( "left", matchBtn.width() / 2 + parseInt(matchBtn.css( "left" ), 10) - ( arrowCenter / scaleFactor ) + "px" );
				} else if ( matchBtn.css("right") ) {
					$( ".ui-triangle-image" ).css( "left", document.documentElement.clientWidth - matchBtn.width() / 2 - ( ( buttonRight - arrowCenter ) / scaleFactor ) + "px" );
				}
			} else {
				$( ".ui-triangle-image" ).css( "left", document.documentElement.clientWidth / 2 - ( arrowCenter / scaleFactor ) + "px" );
			}
		},
		// Draw the option header, according to current options
		refresh: function () {
			var el = this.element,
				arrow = $( '<div class="ui-option-header-triangle-arrow"></div>' ),
				optionHeaderClass = 'ui-option-header',
				gridRowSelector = '.ui-grid-a,.ui-grid-b,.ui-grid-c,.ui-grid-d,.ui-grid-e',
				theme = this.options.theme,
				numRows,
				rowsClass,
				themeClass,
				klass,
				o = $.extend( {grid: null} ),
				$kids = el.find( "div" ).eq( 0 ).children().children(),
				letter,
				gridCols = {solo: 1, a: 2, b: 3, c: 4, d: 5},
				grid = o.grid;

			if ( !grid ) {
				if ( $kids.length <= 5 ) {
					for ( letter in gridCols ) {
						if ( gridCols[ letter ] === $kids.length ) {
							grid = letter;
						}
					}
					numRows = $kids.length / gridCols[grid];
				} else {
					numRows = 2;
				}
			}

	        // count ui-grid-* elements to get number of rows
	//        numRows = el.find(gridRowSelector).length;

	        // ...at least one row
	//        numRows = Math.max(1, numRows);

	        // add classes to outer div:
	        //   ui-option-header-N-row, where N = options.rows
	        //   ui-bar-X, where X = options.theme (defaults to 'c')
	        //   ui-option-header
			rowsClass = 'ui-option-header-' + numRows + '-row';
			themeClass = 'ui-body-' + this.options.theme;

			el.removeClass( rowsClass ).addClass( rowsClass );
			el.removeClass( themeClass ).addClass( themeClass );
			el.removeClass( optionHeaderClass ).addClass( optionHeaderClass );

			// remove any arrow currently visible
			el.prev( '.ui-option-header-triangle-arrow' ).remove();
	//        el.prev('.ui-triangle-container').remove();

			// if there are elements inside the option header
			// and this.options.showIndicator,
			// insert a triangle arrow as the first element inside the
			// optionheader div to show the header has hidden content
			if ( this.options.showIndicator ) {
				el.before( arrow );
				arrow.append("<div class='ui-triangle-image'></div>");
	//            arrow.triangle({"color": el.css('background-color'), offset: "50%"});
			}

	        // if expandable, bind clicks to the toggle() method
			if ( this.options.expandable ) {
	//            el.unbind('vclick', this.clickHandler).bind('vclick', this.clickHandler);
	//            arrow.unbind('vclick', this.clickHandler).bind('vclick', this.clickHandler);
				el.bind( 'vclick', this.clickHandler );
				arrow.bind( 'vclick', this.clickHandler );

			} else {
				el.unbind( 'vclick', this.clickHandler );
				arrow.unbind( 'vclick', this.clickHandler );
			}

			// for each ui-grid-a element, add a class ui-option-header-row-M
			// to it, where M is the xpath position() of the div
	/*        el.find(gridRowSelector).each(function (index) {
	            var klass = 'ui-option-header-row-' + (index + 1);
	            $(this).removeClass(klass).addClass(klass);
	        });*/
			klass = 'ui-option-header-row-' + ( numRows );
			el.find( "div" ).eq( 0 ).removeClass( klass ).addClass( klass );

			// redraw the buttons (now that the optionheader has the right
			// swatch)
			el.find( '.ui-btn' ).each(function () {
				$( this ).attr( 'data-' + $.mobile.ns + 'theme', theme );

				// hack the class of the button to remove the old swatch
				var klass = $( this ).attr( 'class' );
				klass = klass.replace(/ui-btn-up-\w{1}\s*/, '');
				klass = klass + ' ui-btn-up-' + theme;
				$( this ).attr( 'class', klass );
			});
		},

		_setHeight: function ( height, isCollapsed, options ) {
			var self = this,
				elt = this.element.get( 0 ),
				duration,
				commonCallback,
				callback,
				handler;

			options = options || {};

			// set default duration if not specified
			duration = options.duration;
			if ( typeof duration == 'undefined' ) {
				duration = this.options.duration;
			}

			// the callback to always call after expanding or collapsing
			commonCallback = function () {
				self.isCollapsed = isCollapsed;

				if ( isCollapsed ) {
					self.element.trigger( 'collapse' );
				} else {
					self.element.trigger( 'expand' );
				}
			};

			// combine commonCallback with any user-specified callback
			if ( options.callback ) {
				callback = function () {
					options.callback();
					commonCallback();
				};
			} else {
				callback = function () {
					commonCallback();
				};
			}

			// apply the animation
			if ( duration > 0 && $.support.cssTransitions ) {
				// add a handler to invoke a callback when the animation is done

				handler = {
					handleEvent: function ( e ) {
						elt.removeEventListener( 'webkitTransitionEnd', this );
						self.element.css( '-webkit-transition', null );
						callback();
					}
				};

				elt.addEventListener( 'webkitTransitionEnd', handler, false );

				// apply the transition
				this.element.css( '-webkit-transition', 'height ' + duration + 's ease-out' );
				this.element.css( 'height', height );
			} else {
			// make sure the callback gets called even when there's no
			// animation
				this.element.css( 'height', height );
				callback();
			}
		},

		/**
		* Toggle the expanded/collapsed state of the widget.
		* {Object} [options] Configuration for the expand/collapse
		* {Integer} [options.duration] Duration of the expand/collapse;
		* defaults to this.options.duration
		* {Function} options.callback Function to call after toggle completes
		*/

		toggle: function ( options ) {
			var toggle_header = this.element.parents( ":jqmData(role='header')" ),
				toggle_content = this.element.parents( ":jqmData(role='page')" ).find( ".ui-content" ),
				CollapsedTop = 110,
				ExpandedTop = 206,
				CalculateTime,
				/* Apply REM scaling */
				scaleFactor = ( 36 / parseInt($('html').css('font-size')));
			if ( toggle_header.children().is( ".input-search-bar" ) ) {
				CollapsedTop = 218;
				ExpandedTop = 314;
			}

			/* Scale Factor */
			CollapsedTop = ( CollapsedTop / scaleFactor );
			ExpandedTop = ( ExpandedTop / scaleFactor );

			if ( $( window ).scrollTop() <= CollapsedTop ) {
				toggle_header.css( "position", "relative" );
				toggle_content.css( "top", "0px" );
			}

			if ( this.isCollapsed ) {
				this.expand( options );

				if ( $( window ).scrollTop() <= ExpandedTop ) {
					CalculateTime = setTimeout( function () {
						toggle_header.css( 'position', 'fixed' );
						toggle_content.css( 'top', ExpandedTop + "px" );
					}, 500 );
				} else {
					//   Need to move scroll top
					toggle_header.css( 'position', 'fixed' );
					toggle_content.css( 'top', ExpandedTop + "px" );
				}
				this.options.collapseOnInit = false;
			} else {
				this.collapse( options );
				if ( $(window).scrollTop() <= ExpandedTop ) {
					CalculateTime = setTimeout( function () {
						toggle_header.css( 'position', 'fixed' );
						toggle_content.css( 'top', CollapsedTop + "px" );
					}, 500 );
				} else {
					toggle_header.css( 'position', 'fixed' );
					toggle_content.css( 'top', CollapsedTop + "px" );
				}
			}
			this.options.collapseOnInit = true;
		},

		_setDisabled: function ( value ) {
			$.Widget.prototype._setOption.call( this, "disabled", value );
			this.element.add( this.element.prev( ".ui-triangle-container" ) )[value ? "addClass" : "removeClass"]("ui-disabled");
		},
		/**
		* Takes the same options as toggle()
		*/
		collapse: function ( options ) {
			var collapsedBarHeight = 10,
			scaleFactor = ( 36 / parseInt($('html').css('font-size')));

			collapsedBarHeight = collapsedBarHeight / scaleFactor;

	//        if (!this.isCollapsed) {
			this._setHeight( collapsedBarHeight + "px", true, options );
	//        }
		},

		/**
		* Takes the same options as toggle()
		*/
		expand: function ( options ) {
	//        if (this.isCollapsed) {
			this._setHeight( this.expandedHeight, false, options );
	//        }
		}
	});

	// auto self-init widgets
	$(document).bind("pagecreate create", function ( e ) {
	    $($.tizen.optionheader.prototype.options.initSelector, e.target)
			.not(":jqmData(role='none'), :jqmData(role='nojs')")
			.optionheader();
	});

}(jQuery) );
/* ***************************************************************************
 * Copyright (c) 2000 - 2011 Samsung Electronics Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 *	Author: Youmin Ha <youmin.ha@samsung.com>
 */

/**
 * Pagecontrol widget shows number bullets, receives touch event for each bullet,
 * and runs your callback for each touch event.
 *
 * HTML Attributes:
 *
 *		Pagecontrol widget uses <div> element as an element itself. It takes following attributes.
 *
 *		data-role:	This widget must have 'pagecontrol' as data-role value.
 *		data-max:	Maximum nimber of pagecontrol bullets. This property must not exceed 10.
 *		data-initVal:	Initially selected value of the pagecontrol widget. Must between 1 and data-max. If this attribute is not given, initial value is set to 1.
 *
 * APIs:
 *
 *		setValue( value )
 *			: Set current value. Actually triggers 'change' event to the widget with given value.
 *			@param[in] value	A value to be changed.
 *
 *		getValue( )
 *			: Get current value.
 *			@return		Current value.
 *
 * Events:
 *
 *		change:	Raised when a value is changed, by setting it by javascript, or by user's touch event.
 *
 * Examples:
 *
 *		<div id="foo" data-role="pagecontrol" data-max="10"></div>
 *		...
 *		<script language="text/javascript">
 *
 *		// Bind callback to value change
 *		$('foo').bind('change', function (event, value) {
 *			// event: 'change'
 *			// value: changed value
 *		});
 *
 *		// Set a value to 3
 *		$('foo').trigger('change', 3);
 *		</script>
 */

(function ($, undefined) {
	$.widget( "tizen.pagecontrol", $.mobile.widget, {
		options: {
			initSelector: ":jqmData(role='pagecontrol')"
		},

		_create: function ( ) {
		},

		_init: function ( ) {
			var self = this,
				e = this.element,
				maxVal = e.data( "max" ),
				currentVal = e.attr( "data-initVal" ),
				i = 0,
				btn = null,
				buf = null,
				page_margin_class = 'page_n_margin_44';


			// Set default values
			if ( ! maxVal ) {
				maxVal = 1;
			} else if ( maxVal > 10 ) {
				maxVal = 10;
			}
			e.data( "max", maxVal );

			if ( ! currentVal ) {
				currentVal = 1;
			}
			e.data( "current", currentVal );

			// Set pagecontrol class
			e.addClass( 'pagecontrol' );

			// Set empty callback variable
			self.changeCallback = null;

			// Calculate left/right margin
			if ( maxVal <= 7 ) {
				page_margin_class = 'page_n_margin_44';
			} else if ( maxVal == 8 ) {
				page_margin_class = 'page_n_margin_35';
			} else if ( maxVal == 9 ) {
				page_margin_class = 'page_n_margin_26';
			} else {
				page_margin_class = 'page_n_margin_19';
			}

			// subroutine: find a child by value
			function getBtn( value ) {
				return e.children( ":jqmData(value='" + value + "')" );
			}

			// subroutine: change active button by value
			function changeActiveBtn( newNum ) {
				var oldNum = e.data( 'current' );

				// Check value
				if ( newNum < 1 || newNum > e.max ) {
					return false;
				}

				getBtn( oldNum ).removeClass( 'page_n_' + oldNum )
						.addClass( 'page_n_dot' );
				getBtn( newNum ).removeClass( 'page_n_dot' )
						.addClass( 'page_n_' + newNum );
			}

			function triggerChange( event ) {
				// Trigger change event
				e.trigger( 'change', $( this ).data( 'value' ) );
			}

			// Add dot icons
			for ( i = 1; i <= maxVal; i++ ) {
				btn = $( '<div class="page_n page_n_dot ' + page_margin_class + '" data-value="' + i + '"></div>' );
				e.append( btn );
				if ( i == currentVal ) {
					btn.removeClass( 'page_n_dot' )
						.addClass( 'page_n_' + i );
				}
				// bind vclick event to each icon
				btn.bind( 'vclick', triggerChange );
			}

			// pagecontrol element's change event
			e.bind( 'change', function ( event, value ) {
				// 1. Change activated button
				changeActiveBtn( value );

				// 2. Store new value (DO NOT change this order!)
				e.data( 'current', value );

			});
		}
	});	// end: $.widget()


	$( document ).bind( "pagecreate create", function ( e ) {
		$( $.tizen.pagecontrol.prototype.options.initSelector, e.target )
			.not( ":jqmData(role='none'), :jqmData(role='nojs')" )
			.pagecontrol( );
	});

} ( jQuery ) );

/*
 *
 * This software is licensed under the MIT licence (as defined by the OSI at
 * http://www.opensource.org/licenses/mit-license.php)
 *
 * ***************************************************************************
 * Copyright (c) 2011 by Intel Corporation Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 */

// pagelist widget
//
// Given an element, this widget collects all links contained in the descendants of the element and constructs
// a popupwindow widget containing numbered buttons for each encountered link.
//
// You can mark any one element in your document with "data-pagelist='true'" and a pagelist will be created that
// will allow the user to navigate between the pages linked to within the element.
//
// Currently, only one pagelist can exist in a document and, once created, it cannot be modified.

(function ( $, undefined ) {

	window.ensureNS( "jQuery.mobile.tizen" );

	$.widget( "tizen.pagelist", $.tizen.widgetex, {
		_htmlProto: {
source:

$("<div><div id='pagelist' class='ui-pagelist' data-role='popupwindow' data-shadow='false' data-overlayTheme=''>" +
  "    <a id='pagelist-button' data-role='button' data-inline='true'></a>" +
  "    <br id='pagelist-rowbreak'></br>" +
  "</div>" +
  "</div>")
,			ui: {
				pageList: "#pagelist",
				button:   "#pagelist-button",
				rowBreak: "#pagelist-rowbreak"
			}
		},
		_create: function () {
			var self = this,
				popPageList = false,
				idx = 0;

			this._ui.button.remove();
			this._ui.rowBreak.remove();
			this._ui.pageList
				.appendTo( $( "body" ) )
				.popupwindow()
				.bind( "vclick", function ( e ) {
					$( this ).popupwindow( "close" );
				} );

			this.element.find( "a[href]" ).each( function ( elemIdx, elem ) {
				if ( idx > 0 && ( ( idx % 10 ) != 0 ) ) {
					self._ui.pageList.append( self._ui.rowBreak.clone() );
				}

				self._ui.button
					.clone()
					.attr( "href", $( elem ).attr( "href" ) )
					.text( ++idx )
					.appendTo( self._ui.pageList )
					.buttonMarkup()
					.bind( "vclick", function () { self._ui.pageList.popupwindow( "close" ); } )
					.find( ".ui-btn-inner" )
					.css( { padding: 2 } );
			} );

			$( document ).bind( "keydown", function ( e ) {
				popPageList = ( e.keyCode === $.mobile.keyCode.CONTROL );
			} );
			$( document ).bind( "keyup", function ( e ) {
				if ( e.keyCode === $.mobile.keyCode.CONTROL && popPageList ) {
					var maxDim = { cx: 0, cy: 0 };
					self._ui.pageList.popupwindow( "open", undefined, 0 );
					self._ui.pageList.find( "a" )
						.each( function () {
							var btn = $( this ),
								dim = {
									cx: btn.outerWidth( true ),
									cy: btn.outerHeight( true )
								};

							// Make sure things will be even later, because padding cannot have decimals - apparently :-S
							if ( dim.cx % 2 ) {
								btn.css( "padding-left", parseInt( btn.css( "padding-left" ), 10 ) + 1 );
							}
							if ( dim.cy % 2 ) {
								btn.css( "padding-bottom", parseInt( btn.css( "padding-bottom" ), 10 ) + 1 );
							}

							maxDim.cx = Math.max( maxDim.cx, dim.cx );
							maxDim.cy = Math.max( maxDim.cy, dim.cy );
						} )
						.each( function () {
							var padding = {
									h: Math.max( 0, ( maxDim.cx - $( this ).outerWidth( true ) ) / 2 ),
									v: Math.max( 0, ( maxDim.cy - $( this ).outerHeight( true ) ) / 2 )
								},
								btn = $( this ),
								inner = btn.find( ".ui-btn-inner" );

							inner.css( {
								"padding-left"		: parseInt( inner.css( "padding-left" ), 10 ) + padding.h,
								"padding-top"		: parseInt( inner.css( "padding-top" ), 10 ) + padding.v,
								"padding-right"		: parseInt( inner.css( "padding-right" ), 10 ) + padding.h,
								"padding-bottom"	: parseInt( inner.css( "padding-bottom" ), 10 ) + padding.v
							} );
							btn[( ( btn.attr( "href" ) === "#" + $.mobile.activePage.attr( "id" ) ) ? "addClass" : "removeClass" )]( "ui-btn-active" );
						} );
					e.stopPropagation();
					e.preventDefault();
				}
				popPageList = false;
			} );
		}
	} );

	// Look for an element marked as a pagelist and assign $.mobile.tizen.pagelist with a newly created pagelist.
	// If $.mobile.tizen.pagelist is already assigned, ignore any new "data-pagelist='true'" designations.
	$( document ).bind( "pagecreate create", function ( e ) {
		$( ":jqmData(pagelist='true')", e.target )
			.not( ":jqmData(role='none'), :jqmData(role='nojs')" )
			.each( function () {
				if ( $.mobile.tizen.pagelist === undefined ) {
					$.extend( $.mobile.tizen, {
						pagelist: $( this ).pagelist()
					} );
				}
				return false;
			} );
	} );

}( jQuery ) );
/*
 * jQuery Mobile Widget @VERSION
 *
 * This software is licensed under the MIT licence (as defined by the OSI at
 * http://www.opensource.org/licenses/mit-license.php)
 *
 * ***************************************************************************
 * Copyright (c) 2000 - 2011 Samsung Electronics Co., Ltd.
 * Copyright (c) 2011 by Intel Corporation Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 * Authors: Gabriel Schulhof <gabriel.schulhof@intel.com>,
 *          Elliot Smith <elliot.smith@intel.com>
 */

// Shows other elements inside a popup window.
//
// To apply, add the attribute data-role="popupwindow" to a <div> element inside
// a page. Alternatively, call popupwindow()
// on an element, eg :
//
//     $("#mypopupwindowContent").popupwindow();
// where the html might be :
//     <div id="mypopupwindowContent"></div>
//
// To trigger the popupwindow to appear, it is necessary to make a call to its
// 'open()' method. This is typically done by binding a function to an event
// emitted by an input element, such as a the clicked event emitted by a button
// element. The open() method takes two arguments, specifying the x and y
// screen coordinates of the center of the popup window.

// You can associate a button with a popup window like this:
//      <div id="mypopupContent" style="display: table;" data-role="popupwindow">
//          <table>
//              <tr> <td>Eenie</td>   <td>Meenie</td>  <td>Mynie</td>   <td>Mo</td>  </tr>
//              <tr> <td>Catch-a</td> <td>Tiger</td>   <td>By-the</td>  <td>Toe</td> </tr>
//              <tr> <td>If-he</td>   <td>Hollers</td> <td>Let-him</td> <td>Go</td>  </tr>
//              <tr> <td>Eenie</td>   <td>Meenie</td>  <td>Mynie</td>   <td>Mo</td>  </tr>
//          </table>
//      </div>
// <a href="#myPopupContent" data-rel="popupwindow" data-role="button">Show popup</a>
//
// Options:
//
//     theme: String; the theme for the popupwindow contents
//                   Default: null
//
//     overlayTheme: String; the theme for the popupwindow
//                   Default: null
//
//     shadow: Boolean; display a shadow around the popupwindow
//             Default: true
//
//     corners: Boolean; display a shadow around the popupwindow
//             Default: true
//
//     fade: Boolean; fades the opening and closing of the popupwindow
//
//     transition: String; the transition to use when opening or closing
//                 a popupwindow
//                 Default: $.mobile.defaultDialogTransition
//
// Events:
//     close: Emitted when the popupwindow is closed.

(function ( $, undefined ) {

	$.widget( "tizen.popupwindow", $.tizen.widgetex, {
		options: {
			theme: null,
			overlayTheme: "s",
			style: "custom",
			disabled: false,
			shadow: true,
			corners: true,
			fade: true,
			widthRatio: 0.8612,
			transition: $.mobile.defaultDialogTransition,
			initSelector: ":jqmData(role='popupwindow')"
		},

		_htmlProto: {
source:

$("<div><div>" +
  "    <div id='popupwindow-screen' class='ui-selectmenu-screen ui-screen-hidden ui-popupwindow-screen'></div>" +
  "    <div id='popupwindow-container' class='ui-popupwindow ui-popupwindow-padding ui-selectmenu-hidden ui-overlay-shadow ui-corner-all'></div>" +
  "</div>" +
  "</div>")
,			ui: {
				screen:    "#popupwindow-screen",
				container: "#popupwindow-container"
			}
		},

		_create: function () {
			var thisPage = this.element.closest(":jqmData(role='page')"),
				self = this,
				popup = this.element,
				o = this.options,
				style = popup.attr( 'data-style' );

			if (thisPage.length === 0) {
				thisPage = $("body");
			}

			// Drop a placeholder into the location from which we shall rip out the popup window contents
			this._ui.placeholder =
					$("<div><!-- placeholder" +
									(this.element.attr("id") === undefined
									 ? ""
									 : " for " + this.element.attr("id")) + " --></div>")
					.css("display", "none")
					.insertBefore(this.element);

			// Apply the proto
			thisPage.append(this._ui.screen);
			this._ui.container.insertAfter(this._ui.screen);
			this._ui.container.append(this.element);

			// Define instance variables
			$.extend( self, {
				_isOpen: false
			});

			//Data Style Start
			if (style) {
				o.style = style;
			}

			popup.addClass( o.style );
			popup.find( ":jqmData(role='title')" )
					.wrapAll( "<div class='popup-title'></div>" );
			popup.find( ":jqmData(role='text')" )
					.wrapAll( "<div class='popup-text'></div>" );
			popup.find( ":jqmData(role='button-bg')" )
					.wrapAll( "<div class='popup-button-bg'></div>" );
			popup.find( ":jqmData(role='check-bg')" )
					.wrapAll( "<div class='popup-check-bg'></div>" );
			popup.find( ":jqmData(role='scroller-bg')" )
					.wrapAll( "<div class='popup-scroller-bg'></div>" );
			popup.find( ":jqmData(role='text-bottom-bg')" )
					.wrapAll( "<div class='popup-text-bottom-bg'></div>" );
			popup.find( ":jqmData(role='text-left')" )
					.wrapAll( "<div class='popup-text-left'></div>" );
			popup.find( ":jqmData(role='text-right')" )
					.wrapAll( "<div class='popup-text-right'></div>" );
			popup.find( ":jqmData(role='progress-bg')" )
					.wrapAll( "<div class='popup-progress-bg'></div>" );
			//Data Style End

			// Events on "screen" overlay
			this._ui.screen.bind( "vclick", function (event) {
				self.close();
			});
		},

		_realSetTheme: function (dst, theme) {

			var classes = (dst.attr("class") || "").split(" "),
				alreadyAdded = true,
				currentTheme = null,
				matches;

			while (classes.length > 0) {
				currentTheme = classes.pop();
				matches = currentTheme.match(/^ui-body-([a-z])$/);
				if (matches && matches.length > 1) {
					currentTheme = matches[1];
					break;
				} else {
					currentTheme = null;
				}
			}

			dst.removeClass("ui-body-" + currentTheme);
			if ((theme || "").match(/[a-z]/)) {
				dst.addClass("ui-body-" + theme);
			}
		},

		_setTheme: function (value) {
			this._realSetTheme(this.element, value);
			this.options.theme = value;
			this.element.attr("data-" + ($.mobile.ns || "") + "theme", value);
		},

		_setOverlayTheme: function (value) {
			this._realSetTheme(this._ui.container, value);
			// The screen must always have some kind of background for fade to work, so, if the theme is being unset,
	// set the background to "a".
			this._realSetTheme(this._ui.screen, (value === "" ? "a" : value));
			this.options.overlayTheme = value;
			this.element.attr("data-" + ($.mobile.ns || "") + "overlay-theme", value);
		},

		_setShadow: function (value) {
			this.options.shadow = value;
			this.element.attr("data-" + ($.mobile.ns || "") + "shadow", value);
			this._ui.container[value ? "addClass" : "removeClass"]("ui-overlay-shadow");
		},

		_setCorners: function (value) {
			this.options.corners = value;
			this.element.attr("data-" + ($.mobile.ns || "") + "corners", value);
			this._ui.container[value ? "addClass" : "removeClass"]("ui-corner-all");
		},

		_setFade: function (value) {
			this.options.fade = value;
			this.element.attr("data-" + ($.mobile.ns || "") + "fade", value);
		},

		_setTransition: function (value) {
			this._ui.container
				.removeClass((this.options.transition || ""))
				.addClass(value);
			this.options.transition = value;
			this.element.attr("data-" + ($.mobile.ns || "") + "transition", value);
		},

		_setDisabled: function (value) {
			$.Widget.prototype._setOption.call(this, "disabled", value);
			if (value) {
				this.close();
			}
		},

		_placementCoords: function (x, y, cx, cy) {
			// Try and center the overlay over the given coordinates
			var ret,
				scrollTop = $(window).scrollTop(),
				screenHeight = $(window).height(),
				screenWidth = $(window).width(),
				halfheight = cy / 2,
				maxwidth = parseFloat( this._ui.container.css( "max-width" ) ),
				roomtop = y - scrollTop,
				roombot = scrollTop + screenHeight - y,
				newtop,
				newleft;

			if ( roomtop > cy / 2 && roombot > cy / 2 ) {
				newtop = y - halfheight;
			} else {
				// 30px tolerance off the edges
				newtop = roomtop > roombot ? scrollTop + screenHeight - cy - 30 : scrollTop + 30;
			}

			// If the menuwidth is smaller than the screen center is
			if ( cx < maxwidth ) {
				newleft = ( screenWidth - cx ) / 2;
			} else {
				//otherwise insure a >= 30px offset from the left
				newleft = x - cx / 2;

				// 10px tolerance off the edges
				if ( newleft < 10 ) {
					newleft = 10;
				} else if ( ( newleft + cx ) > screenWidth ) {
					newleft = screenWidth - cx - 10;
				}
			}

			return { x : newleft, y : newtop };
		},

		destroy: function () {
		// Put the element back where we ripped it out from
			this.element.insertBefore(this._ui.placeholder);

			// Clean up
			this._ui.placeholder.remove();
			this._ui.container.remove();
			this._ui.screen.remove();
			this.element.triggerHandler("destroyed");
			$.Widget.prototype.destroy.call(this);
		},

		open: function (x_where, y_where) {
			if (!(this._isOpen || this.options.disabled)) {
				var self = this,
					x = (undefined === x_where ? $(window).width()  / 2 : x_where),
					y = (undefined === y_where ? $(window).height() / 2 : y_where),
					coords,
					zIndexMax = 0,
					ctxpopup = this.element.data("ctxpopup"),
					popupWidth,
					menuHeight,
					menuWidth,
					scrollTop,
					screenHeight,
					screenWidth,
					roomtop,
					roombot,
					halfheight,
					maxwidth,
					newtop,
					newleft;

				if ( !ctxpopup ) {
					popupWidth = $(window).width() * this.options.widthRatio;
					this._ui.container.css("width", popupWidth);
					// If the width of the popup exceeds the width of the window, we need to limit the width here,
					// otherwise outer{Width,Height}(true) below will happily report the unrestricted values, causing
					// the popup to get placed wrong.
					if (this._ui.container.outerWidth(true) > $(window).width()) {
						this._ui.container.css({"max-width" : $(window).width() - 30});
					}
				}

				coords = this._placementCoords(x, y,
					this._ui.container.outerWidth(true),
					this._ui.container.outerHeight(true));

				$(document)
					.find("*")
					.each(function () {
						var el = $(this),
							zIndex = parseInt(el.css("z-index"), 10);
						if (!(el.is(self._ui.container) || el.is(self._ui.screen) || isNaN(zIndex))) {
							zIndexMax = Math.max(zIndexMax, zIndex);
						}
					});

				this._ui.screen
					.height($(document).height())
					.removeClass("ui-screen-hidden");

				if (this.options.fade) {
					this._ui.screen.animate({opacity: 0.5}, "fast");
				} else {
					this._ui.screen.css({opacity: 0.0});
				}

				//Recalculate popup position
				menuHeight = this._ui.container.innerHeight(true);
				menuWidth = this._ui.container.innerWidth(true);
				scrollTop = $(window).scrollTop();
				screenHeight = $(window).height();
				screenWidth = $(window).width();
				roomtop = y - scrollTop;
				roombot = scrollTop + screenHeight - y;
				halfheight = menuHeight / 2;
				maxwidth = parseFloat( this._ui.container.css( "max-width" ) );
				newtop = (screenHeight - menuHeight) / 2 + scrollTop;

				if ( menuWidth < maxwidth ) {
					newleft = ( screenWidth - menuWidth ) / 2;
				} else {
					//otherwise insure a >= 30px offset from the left
					newleft = x - menuWidth / 2;

					// 30px tolerance off the edges
					if ( newleft < 30 ) {
						newleft = 30;
					} else if ( ( newleft + menuWidth ) > screenWidth ) {
						newleft = screenWidth - menuWidth - 30;
					}
				}
				//Recalculate popup position End
				if ( ctxpopup ) {
					newtop = coords.y;
					newleft = coords.x;
				}

				this._ui.container
					.removeClass("ui-selectmenu-hidden")
					.css({
						top: newtop,
						left: newleft
					})
					.addClass("in")
					.animationComplete(function () {
						self._ui.screen.height($(document).height());
					});

				this._isOpen = true;
			}
		},

		close: function () {
			if (this._isOpen) {
				var self = this,
					hideScreen = function () {
						self._ui.screen.addClass("ui-screen-hidden");
						self._isOpen = false;
						self.element.trigger("closed");
					};

				this._ui.container
					.removeClass("in")
					.addClass("reverse out")
					.animationComplete(function () {
						self._ui.container
							.removeClass("reverse out")
							.addClass("ui-selectmenu-hidden")
							.removeAttr("style");
					});

				if (this.options.fade) {
					this._ui.screen.animate({opacity: 0.0}, "fast", hideScreen);
				} else {
					hideScreen();
				}
			}
		}
	});

	$.tizen.popupwindow.bindPopupToButton = function (btn, popup) {
		if (btn.length === 0 || popup.length === 0) {
			return;
		}

		var btnVClickHandler = function (e) {
			// When /this/ button causes a popup, align the popup's theme with that of the button, unless the popup has a theme pre-set
			if (!popup.jqmData("overlay-theme-set")) {
				popup.popupwindow("option", "overlayTheme", btn.jqmData("theme"));
			}
			popup.popupwindow("open",
				btn.offset().left + btn.outerWidth()  / 2,
				btn.offset().top  + btn.outerHeight() / 2);

			// Swallow event, because it might end up getting picked up by the popup window's screen handler, which
			// will in turn cause the popup window to close - Thanks Sasha!
			if (e.stopPropagation) {
				e.stopPropagation();
			}
			if (e.preventDefault) {
				e.preventDefault();
			}
		};

		// If the popup has a theme set, prevent it from being clobbered by the associated button
		if ((popup.popupwindow("option", "overlayTheme") || "").match(/[a-z]/)) {
			popup.jqmData("overlay-theme-set", true);
		}

		btn
			.attr({
				"aria-haspopup": true,
				"aria-owns": btn.attr("href")
			})
			.removeAttr("href")
			.bind("vclick", btnVClickHandler);

		popup.bind("destroyed", function () {
			btn.unbind("vclick", btnVClickHandler);
		});
	};

	$(document).bind("pagecreate create", function (e) {
		$($.tizen.popupwindow.prototype.options.initSelector, e.target)
			.not(":jqmData(role='none'), :jqmData(role='nojs')")
			.popupwindow();

		$("a[href^='#']:jqmData(rel='popupwindow')", e.target).each(function () {
			$.tizen.popupwindow.bindPopupToButton($(this), $($(this).attr("href")));
		});
	});

}(jQuery));
/*
 * jQuery Mobile Widget @VERSION
 *
 * This software is licensed under the MIT licence (as defined by the OSI at
 * http://www.opensource.org/licenses/mit-license.php)
 *
 * ***************************************************************************
 * Copyright (c) 2000 - 2011 Samsung Electronics Co., Ltd.
 * Copyright (c) 2011 by Intel Corporation Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 * Authors: Gabriel Schulhof <gabriel.schulhof@intel.com>
 */

// This widget is implemented in an extremely ugly way. It should derive from $.tizen.popupwindow, but it doesn't
// because there's a bug in jquery.ui.widget.js which was fixed in jquery-ui commit
// b9153258b0f0edbff49496ed16d2aa93bec07d95. Once a version of jquery-ui containing that commit is released
// (probably >= 1.9m5), and jQuery Mobile picks up the widget from there, this widget needs to be rewritten properly.
// The problem is that, when a widget inherits from a superclass and declares an object in its prototype identical in key
// to one in the superclass, upon calling $.widget the object is overwritten in both the prototype of the superclass and
// the prototype of the subclass. The prototype of the superclass should remain unchanged.

(function ( $, undefined ) {
	$.widget( "tizen.ctxpopup", $.tizen.widgetex, {
		options: $.extend( {}, $.tizen.popupwindow.prototype.options, {
			initSelector: ":not(:not(" + $.tizen.popupwindow.prototype.options.initSelector + ")):not(:not(:jqmData(show-arrow='true'), :jqmData(show-arrow)))"
		} ),

		_htmlProto: {
source:

$("<div><div id='outer' class='ui-ctxpopup'>" +
  "    <div id='top' class='ui-ctxpopup-row' data-role='triangle' data-location='top'></div>" +
  "    <div class='ui-ctxpopup-row'>" +
  "        <div id='left' class='ui-ctxpopup-cell' data-role='triangle' data-location='left'></div>" +
  "        <div id='container' class='ui-ctxpopup-cell'></div>" +
  "        <div id='right' class='ui-ctxpopup-cell' data-role='triangle' data-location='right'></div>" +
  "    </div>" +
  "    <div id='bottom' class='ui-ctxpopup-row' data-role='triangle' data-location='bottom'></div>" +
  "</div>" +
  "</div>")
,			ui: {
				outer		: "#outer",
				container	: "#container", // the key has to have the name "container"
				arrow		: {
					all		: ":jqmData(role='triangle')",
					l		: "#left",
					t		: "#top",
					r		: "#right",
					b		: "#bottom"
				}
			}
		},

		_create: function () {
			if ( !this.element.data( "popupwindow" ) ) {
				this.element.popupwindow();
			}

			this.element.data( "popupwindow" )
				._ui.container
				.removeClass( "ui-popupwindow-padding" )
				.append( this._ui.outer );
			this._ui.outer.trigger( "create" ); // Creates the triangle widgets
			this._ui.container
				.addClass( "ui-popupwindow-padding" )
				.append( this.element );
		},

		_setOption: function ( key, value ) {
			$.tizen.popupwindow.prototype._setOption.apply( this.element.data( "popupwindow" ), arguments );
			this.options[key] = value;
		}
	} );

	var origOpen = $.tizen.popupwindow.prototype.open,
		orig_setOption = $.tizen.popupwindow.prototype._setOption,
		orig_placementCoords = $.tizen.popupwindow.prototype._placementCoords;

	$.tizen.popupwindow.prototype._setOption = function ( key, value ) {
		var ctxpopup = this.element.data( "ctxpopup" ),
			needsApplying = true,
			origContainer;
		if ( ctxpopup ) {
			if ( "shadow" === key || "overlayTheme" === key || "corners" === key ) {
				origContainer = this._ui.container;

				this._ui.container = ctxpopup._ui.container;
				orig_setOption.apply( this, arguments );
				this._ui.container = origContainer;
				needsApplying = false;
			}
			ctxpopup.options[key] = value;
		}

		if ( needsApplying ) {
			orig_setOption.apply(this, arguments);
		}
	};

	$.tizen.popupwindow.prototype._placementCoords = function ( x, y, cx, cy ) {
		var ctxpopup = this.element.data( "ctxpopup" ),
			self = this,
			coords = {},
			minDiff,
			minDiffIdx;

		function getCoords( arrow, x_factor, y_factor ) {
			// Unhide the arrow we want to test to take it into account
			ctxpopup._ui.arrow.all.hide();
			ctxpopup._ui.arrow[arrow].show();

			var isHorizontal = ( "b" === arrow || "t" === arrow ),
			// Names of keys used in calculations depend on whether things are horizontal or not
				coord = ( isHorizontal
						? { point: "x", size: "cx", beg: "left", outerSize: "outerWidth",  niceSize: "width", triangleSize : "height" }
						: { point: "y", size: "cy", beg: "top",  outerSize: "outerHeight", niceSize: "height", triangleSize : "width" } ),
				size = {
					cx : self._ui.container.width(),
					cy : self._ui.container.height()
				},
				halfSize = {
					cx : size.cx / 2,
					cy : size.cy / 2
				},
				desired = {
					"x" : x + halfSize.cx * x_factor,
					"y" : y + halfSize.cy * y_factor
				},
				orig = orig_placementCoords.call( self, desired.x, desired.y, size.cx, size.cy ),

			// The triangleOffset must be clamped to the range described below:
			//
			//                          +-------...
			//                          |   /\
			//                          |  /  \
			//                   ----+--+-,-----...
			//lowerDiff       -->____|  |/ <-- possible rounded corner
			//triangle size   -->    | /|
			//                   ____|/ |
			//                    ^  |\ | <-- lowest possible offset for triangle
			// actual range of    |  | \| 
			// arrow offset       |  |  | 
			// values due to      |  .  . Payload table cell looks like
			// possible rounded   |  .  . a popup window, and it may have
			// corners and arrow  |  .  . arbitrary things like borders,
			// triangle size -    |  |  | shadows, and rounded corners.
			// our clamp range    |  | /|
			//                   _v__|/ |
			//triangle size   -->    |\ | <-- highest possible offset for triangle
			//                   ____| \|
			//upperDiff       -->    |  |\ <-- possible rounded corner
			//                   ----+--+-'-----...
			//                          |  \  /
			//                          |   \/
			//                          +-------...
			//
			// We calculate lowerDiff and upperDiff by considering the offset and width of the payload (this.element)
			// versus the offset and width of the element enclosing the triangle, because the payload is inside
			// whatever decorations (such as borders, shadow, rounded corners) and thus can give a reliable indication
			// of the thickness of the combined decorations

				arrowBeg = ctxpopup._ui.arrow[arrow].offset()[coord.beg],
				arrowSize = ctxpopup._ui.arrow[arrow][coord.outerSize]( true ),
				payloadBeg = self.element.offset()[coord.beg],
				payloadSize = self.element[coord.outerSize]( true ),
				triangleSize = ctxpopup._ui.arrow[arrow][coord.triangleSize](),
				triangleOffset =
					Math.max(
						triangleSize // triangle size
							+ Math.max( 0, payloadBeg - arrowBeg ), // lowerDiff
						Math.min(
								arrowSize // bottom
									- triangleSize // triangle size
									- Math.max( 0, arrowBeg + arrowSize - ( payloadBeg + payloadSize ) ), // upperDiff
								arrowSize / 2 // arrow unrestricted offset
									+ desired[coord.point]
									- orig[coord.point]
									- halfSize[coord.size] 
							)
					),
					// Triangle points here
				final = {
					"x": orig.x + ( isHorizontal ? triangleOffset : 0) + ("r" === arrow ? size.cx : 0),
					"y": orig.y + (!isHorizontal ? triangleOffset : 0) + ("b" === arrow ? size.cy : 0)
				},
				ret = {
					actual			: orig,
					triangleOffset	: triangleOffset,
					absDiff			: Math.abs( x - final.x ) + Math.abs( y - final.y )
				};

			// Hide it back
			ctxpopup._ui.arrow[arrow].hide();

			return ret;
		}

		if ( ctxpopup ) {
			// Returns:
			// {
			//    absDiff: int
			//    triangleOffset: int
			//    actual: { x: int, y: int }
			// }

			coords = {
				l : getCoords( "l", 1, 0 ),
				r : getCoords( "r", -1, 0 ),
				t : getCoords( "t", 0, 1 ),
				b : getCoords( "b", 0, -1 )
			};

			$.each( coords, function ( key, value ) {
				if ( minDiff === undefined || value.absDiff < minDiff ) {
					minDiff = value.absDiff;
					minDiffIdx = key;
				}
			} );

			// Side-effect: show the appropriate arrow and move it to the right offset
			ctxpopup._ui.arrow[minDiffIdx]
				.show()
				.triangle( "option", "offset", coords[minDiffIdx].triangleOffset );
			return coords[minDiffIdx].actual;
		}

		return orig_placementCoords.call( this, x, y, cx, cy );
	};

	$.tizen.popupwindow.prototype.open = function ( x, y ) {
		var ctxpopup = this.element.data( "ctxpopup" );

		if ( ctxpopup ) {
			this._setShadow( false );
			this._setCorners( false );
			this._setOverlayTheme( null );
			this._setOption( "overlayTheme", ctxpopup.options.overlayTheme );
			ctxpopup._ui.arrow.all.triangle( "option", "color", ctxpopup._ui.container.css( "background-color" ) );

			// temporary
			$( '.ui-popupwindow' ).css( 'background', 'none' );
		}

		origOpen.call( this, x, y );
	};

	//auto self-init widgets
	$( document ).bind( "pagecreate create", function ( e ) {
		var ctxpopups = $( $.tizen.ctxpopup.prototype.options.initSelector, e.target );
		$.tizen.ctxpopup.prototype.enhanceWithin( e.target );
	} );
}( jQuery ) );
/* ***************************************************************************
 * Copyright (c) 2000 - 2011 Samsung Electronics Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software" ),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 */
// progress
(function ( $, window, undefined) {
	$.widget( "tizen.progress", $.mobile.widget, {
		options: {
			style: "circle",
			running: false
		},

		_show: function () {
			if ( !this.init ) {
				$( this.element ).append( this.html );
				this.init = true;
			}
			var style = this.options.style;
			$( this.element ).addClass( "ui-progress-container-" + style + "-bg" );
			$( this.element )
				.find( ".ui-progress-" + style )
				.addClass( this.runningClass );
		},

		_hide: function () {
			$( this.element )
				.find( ".ui-progress-" + this.options.style )
				.removeClass( this.runningClass );
		},

		running: function ( newRunning ) {
			// get value
			if ( newRunning === undefined ) {
				return this.options.running;
			}

			// set value
			this._setOption( "running", newRunning );
			return this;
		},

		_setOption: function ( key, value ) {
			if ( key === "running" ) {
				// normalize invalid value
				if ( typeof value !== "boolean" ) {
					window.alert( "running value MUST be boolean type!" );
					return;
				}
				this.options.running = value;
				this._refresh();
			}
		},

		_refresh: function () {
			if ( this.options.running ) {
				this._show();
			} else {
				this._hide();
			}
		},

		_create: function () {
			var self = this,
				element = this.element,
				style = element.jqmData( "style" ),
				runningClass;

			if ( style ) {
				this.options.style = style;
			}

			this.html = $( '<div class="ui-progress-container-' + style + '">' +
					'<div class="ui-progress-' + style + '"></div>' +
					'</div>' );

			runningClass = "ui-progress-" + style + "-running";

			$.extend( this, {
				init: false,
				runningClass: runningClass
			} );
			this._refresh();
		}
	} ); /* End of widget */

	// auto self-init widgets
	$( document ).bind( "pagecreate", function ( e ) {
		$( e.target ).find( ":jqmData(role='progress')" ).progress();
	} );
}(jQuery, this));
/*
 * jQuery UI Progressbar @VERSION
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Progressbar
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 * Original file:
 *   jquery.ui.progressbar.js
 */
/* This is from jquery ui plugin - progressbar 11/16/2011 */

(function ( $, window, undefined ) {

	$.widget( "tizen.progressbar", $.mobile.widget, {
		options: {
			value: 0,
			max: 100
		},

		min: 0,

		_create: function () {
			this.element
				.addClass( "ui-progressbar" )
				.attr( {
					role: "progressbar",
					"aria-valuemin": this.min,
					"aria-valuemax": this.options.max,
					"aria-valuenow": this._value()
				} );

			this.valueDiv = $( "<div class='ui-progressbar-value'></div>" )
				.appendTo( this.element );

			this.oldValue = this._value();
			this._refreshValue();
		},

		_destroy: function () {
			this.element
				.removeClass( "ui-progressbar" )
				.removeAttr( "role" )
				.removeAttr( "aria-valuemin" )
				.removeAttr( "aria-valuemax" )
				.removeAttr( "aria-valuenow" );

			this.valueDiv.remove();
		},

		value: function ( newValue ) {
			if ( newValue === undefined ) {
				return this._value();
			}

			this._setOption( "value", newValue );
			return this;
		},

		_setOption: function ( key, value ) {
			if ( key === "value" ) {
				this.options.value = value;
				this._refreshValue();
				if ( this._value() === this.options.max ) {
					this._trigger( "complete" );
				}
			}
			// jquery.ui.widget.js MUST be updated to new version!
			//this._super( "_setOption", key, value );
		},

		_value: function () {
			var val = this.options.value;
			// normalize invalid value
			if ( typeof val !== "number" ) {
				val = 0;
			}
			return Math.min( this.options.max, Math.max( this.min, val ) );
		},

		_percentage: function () {
			return 100 * this._value() / this.options.max;
		},

		_refreshValue: function () {
			var value = this.value(),
				percentage = this._percentage();

			if ( this.oldValue !== value ) {
				this.oldValue = value;
				this._trigger( "change" );
			}

			this.valueDiv
				.toggle( value > this.min )
				.width( percentage.toFixed(0) + "%" );
			this.element.attr( "aria-valuenow", value );
		}
	} );

	// auto self-init widgets
	$( document ).bind( "pagecreate", function ( e ) {
		$( e.target ).find( ":jqmData(role='progressbar')" ).progressbar();
	} );

}( jQuery, this ) );
/* ***************************************************************************
 * Copyright (c) 2000 - 2011 Samsung Electronics Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 */
/*
* jQuery Mobile Framework : "textinput" plugin for text inputs, textareas
* Copyright (c) jQuery Project
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
* Authors: Jinhyuk Jun <jinhyuk.jun@samsung.com>
*          Wongi Lee <wongi11.lee@samsung.com>
*/

/**
 * Searchbar can be created using <input> element with type=search
 * <input type="search" name="search" id="search1" value=""  />
 *
 * Searchbar can be inserted 3 cases
 * content : seachbar behave same as content element
 * header : searchbar placed below title(header), It doesn't move when scrolling page
 * inside optionheader : Searchbar placed inside optionheader, searchbar can be seen only expand optionheader
 *
 * Examples:
 *
 *	HTML markup for creating Searchbar
 *		<input type="search"/>
 *
 *	How to make searchbar in content
 *		<input type="search" name="" id="" value=""  />
 *
 *	How to make searchbar in title
 *		<div data-role="header" data-position ="fixed" >
 *			<h1>Searchbar</h1>
 *			<input type="search" name="" id="" value=""  />
 *		</div>
 *
 *	How to make searchbar inside optionheader
 *		<div data-role="header" data-position ="fixed" >
 *			<h1>Searchbar</h1>
 *			<div id="myoptionheader2" data-role="optionheader">
 *				<input type="search" name="" id="" value=""  />
 *			</div>
 *		</div>
*/

(function ( $, undefined ) {

	$.widget( "tizen.searchbar", $.mobile.widget, {
		options: {
			theme: null,
			initSelector: "input[type='search'],:jqmData(type='search'), input[type='tizen-search'],:jqmData(type='tizen-search')"
		},

		_create: function () {
			var input = this.element,
				o = this.options,
				theme = o.theme || $.mobile.getInheritedTheme( this.element, "c" ),
				themeclass  = " ui-body-" + theme,
				focusedEl,
				clearbtn,
				currentPage = input.closest( ".ui-page" ),
				searchicon,
				cancelbtn,
				defaultText,
				defaultTextClass,
				trimedText,
				newClassName,
				newStyle,
				newDiv,
				inputedText,
				extraLineHeight,
				keyupTimeoutBuffer,
				keyup,
				keyupTimeout;

			function toggleClear() {
				if ( !input.val() ) {
					clearbtn.addClass( "ui-input-clear-hidden" );
				} else {
					clearbtn.removeClass( "ui-input-clear-hidden" );
				}
			}

			function showCancel() {
				focusedEl
					.addClass( "ui-input-search-default" )
					.removeClass( "ui-input-search-wide" );
				cancelbtn
					.addClass( "ui-btn-cancel-show" )
					.removeClass( "ui-btn-cancel-hide" );
				searchicon.hide();
			}

			function hideCancel() {
				focusedEl
					.addClass( "ui-input-search-wide" )
					.removeClass( "ui-input-search-default" );
				cancelbtn
					.addClass( "ui-btn-cancel-hide" )
					.removeClass( "ui-btn-cancel-show" );

				if ( input.val() == "" ) {
					searchicon.show();
				}

				toggleClear();
			}

			$( "label[for='" + input.attr( "id" ) + "']" ).addClass( "ui-input-text" );

			focusedEl = input.addClass( "ui-input-text ui-body-" + theme );

			// XXX: Temporary workaround for issue 785 (Apple bug 8910589).
			//      Turn off autocorrect and autocomplete on non-iOS 5 devices
			//      since the popup they use can't be dismissed by the user. Note
			//      that we test for the presence of the feature by looking for
			//      the autocorrect property on the input element. We currently
			//      have no test for iOS 5 or newer so we're temporarily using
			//      the touchOverflow support flag for jQM 1.0. Yes, I feel dirty. - jblas
			if ( typeof input[0].autocorrect !== "undefined" && !$.support.touchOverflow ) {
				// Set the attribute instead of the property just in case there
				// is code that attempts to make modifications via HTML.
				input[0].setAttribute( "autocorrect", "off" );
				input[0].setAttribute( "autocomplete", "off" );
			}

			focusedEl = input.wrap( "<div class='ui-input-search ui-shadow-inset ui-corner-all ui-btn-shadow" + themeclass + "'></div>" ).parent();
			clearbtn = $( "<a href='#' class='ui-input-clear' title='clear text'>clear text</a>" )
				.tap( function ( event ) {
					event.preventDefault();
					event.stopPropagation();

					input.val( "" )
						.blur()
						.focus()
						.trigger( "change" )
						.trigger( "input" );
					clearbtn.addClass( "ui-input-clear-hidden" );
				} )
				.appendTo( focusedEl )
				.buttonMarkup({
					icon: "deleteSearch",
					iconpos: "notext",
					corners: true,
					shadow: true
				} );

			toggleClear();

			input.keyup( toggleClear );

			input.bind( 'paste cut keyup focus change blur', toggleClear );

			//SLP --start search bar with cancel button
			focusedEl.wrapAll( "<div class='input-search-bar'></div>" );

			input.tap( function ( event ) {
				inputedText = input.val();
				input
					.blur()
					.focus();
			} );

			searchicon = $("<div class='ui-image-search ui-image-searchfield'></div>");
			searchicon
				.tap( function ( event ) {
					searchicon.hide();

					input
						.blur()
						.focus();
				} )
				.appendTo( focusedEl );

			cancelbtn = $( "<a href='#' class='ui-input-cancel' title='clear text'>Cancel</a>" )
				.tap(function ( event ) {
					event.preventDefault();
					event.stopPropagation();

					input
						.val( "" )
						.blur()
						.trigger( "change" );

					hideCancel();
				} )
				.appendTo( focusedEl.parent() )
				.buttonMarkup( {
					iconpos: "cancel",
					corners: true,
					shadow: true
				} );

			// Input Focused
			input.focus( function () {
				showCancel();
				focusedEl.addClass( "ui-focus" );
			} );

			// Input Blured
			/* When user touch on page, it's same to blur */
			$( "div.input-search-bar" ).tap( function ( event ) {
				input.focus();
				event.stopPropagation();
			} );

			$( currentPage ).bind("tap", function ( e ) {
				focusedEl.removeClass( "ui-focus" );
				hideCancel();
				input.trigger( "change" );
			} );

			// Autogrow
			if ( input.is( "textarea" ) ) {
				extraLineHeight = 15;
				keyupTimeoutBuffer = 100;
				keyup = function () {
					var scrollHeight = input[ 0 ].scrollHeight,
						clientHeight = input[ 0 ].clientHeight;

					if ( clientHeight < scrollHeight ) {
						input.height(scrollHeight + extraLineHeight);
					}
				};

				input.keyup( function () {
					clearTimeout( keyupTimeout );
					keyupTimeout = setTimeout( keyup, keyupTimeoutBuffer );
				});

				// binding to pagechange here ensures that for pages loaded via
				// ajax the height is recalculated without user input
				$( document ).one( "pagechange", keyup );

				// Issue 509: the browser is not providing scrollHeight properly until the styles load
				if ( $.trim( input.val() ) ) {
					// bind to the window load to make sure the height is calculated based on BOTH
					// the DOM and CSS
					$( window ).load( keyup );
				}
			}

			// Default Text
			defaultText = input.jqmData( "default-text" );

			if ( ( defaultText != undefined ) && ( defaultText.length > 0 ) ) {
				defaultTextClass = "ui-input-default-text";
				trimedText = defaultText.replace(/\s/g, "");

				/* Make new class for default text string */
				newClassName = defaultTextClass + "-" + trimedText;
				newStyle = $( "<style>" + '.' + newClassName + ":after" + "{content:" + "'" + defaultText + "'" + "}" + "</style>" );
				$( 'html > head' ).append( newStyle );

				/* Make new empty <DIV> for default text */
				newDiv = $( "<div></div>" );

				/* Add class and append new div */
				newDiv.addClass( defaultTextClass );
				newDiv.addClass( newClassName );
				newDiv.tap( function ( event ) {
					input.blur();
					input.focus();
				} );

				input.parent().append( newDiv );

				/* When focus, default text will be hide. */
				input
					.focus( function () {
						input.parent().find( "div.ui-input-default-text" ).addClass( "ui-input-default-hidden" );
					} )
					.blur( function () {
						var inputedText = input.val();
						if ( inputedText.length > 0 ) {
							input.parent().find( "div.ui-input-default-text" ).addClass( "ui-input-default-hidden" );
						} else {
							input.parent().find( "div.ui-input-default-text" ).removeClass( "ui-input-default-hidden" );
						}
					} );
			}
		},

		disable: function () {
			this.element.attr( "disabled", true );
			this.element.parent().addClass( "ui-disabled" );
		},

		enable: function () {
			this.element.attr( "disabled", false );
			this.element.parent().removeClass( "ui-disabled" );
		}
	} );

	//auto self-init widgets
	$( document ).bind( "pagecreate create", function ( e ) {
		$.tizen.searchbar.prototype.enhanceWithin( e.target );
	} );

}( jQuery ) );
/*
 * jQuery Mobile Widget @VERSION
 *
 * This software is licensed under the MIT licence (as defined by the OSI at
 * http://www.opensource.org/licenses/mit-license.php)
 *
 * ***************************************************************************
 * Copyright (c) 2000 - 2011 Samsung Electronics Co., Ltd.
 * Copyright (c) 2011 by Intel Corporation Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 * Authors: Elliot Smith <elliot.smith@intel.com>
 */

// shortcutscroll is a scrollview controller, which binds
// a scrollview to a a list of short cuts; the shortcuts are built
// from the text on dividers in the list. Clicking on a shortcut
// instantaneously jumps the scrollview to the selected list divider;
// mouse movements on the shortcut column move the scrollview to the
// list divider matching the text currently under the touch; a popup
// with the text currently under the touch is also displayed.
//
// To apply, add the attribute data-shortcutscroll="true" to a listview
// (a <ul> or <ol> element inside a page). Alternatively, call
// shortcutscroll() on an element.
//
// The closest element with class ui-scrollview-clip is used as the
// scrollview to be controlled.
//
// If a listview has no dividers or a single divider, the widget won't
// display.

(function ( $, undefined ) {

	$.widget( "tizen.shortcutscroll", $.mobile.widget, {
		options: {
			initSelector: ":jqmData(shortcutscroll)"
		},

		_create: function () {
			var $el = this.element,
				self = this,
				$popup,
				page = $el.closest( ':jqmData(role="page")' ),
				jumpToDivider;

			this.scrollview = $el.closest( '.ui-scrollview-clip' );
			this.shortcutsContainer = $( '<div class="ui-shortcutscroll"/>' );
			this.shortcutsList = $( '<ul></ul>' );

			// popup for the hovering character
			this.shortcutsContainer.append($( '<div class="ui-shortcutscroll-popup"></div>' ) );
			$popup = this.shortcutsContainer.find( '.ui-shortcutscroll-popup' );

			this.shortcutsContainer.append( this.shortcutsList );
			this.scrollview.append( this.shortcutsContainer );

			// find the bottom of the last item in the listview
			this.lastListItem = $el.children().last();

			// remove scrollbars from scrollview
			this.scrollview.find( '.ui-scrollbar' ).hide();

			jumpToDivider = function ( divider ) {
				// get the vertical position of the divider (so we can scroll to it)
				var dividerY = $( divider ).position().top,
					// find the bottom of the last list item
					bottomOffset = self.lastListItem.outerHeight( true ) + self.lastListItem.position().top,
					scrollviewHeight = self.scrollview.height(),

				// check that after the candidate scroll, the bottom of the
				// last item will still be at the bottom of the scroll view
				// and not some way up the page
					maxScroll = bottomOffset - scrollviewHeight,
					dstOffset;

				dividerY = ( dividerY > maxScroll ? maxScroll : dividerY );

				// don't apply a negative scroll, as this means the
				// divider should already be visible
				dividerY = Math.max( dividerY, 0 );

				// apply the scroll
				self.scrollview.scrollview( 'scrollTo', 0, -dividerY );

				dstOffset = self.scrollview.offset();
				$popup
					.text( $( divider ).text() )
					.offset( { left : dstOffset.left + ( self.scrollview.width()  - $popup.width() ) / 2,
								top  : dstOffset.top  + ( self.scrollview.height() - $popup.height() ) / 2 } )
					.show();
			};

			this.shortcutsList
			// bind mouse over so it moves the scroller to the divider
				.bind( 'touchstart mousedown vmousedown touchmove vmousemove vmouseover ', function ( e ) {
					// Get coords relative to the element
					var coords = $.mobile.tizen.targetRelativeCoordsFromEvent( e ),
						shortcutsListOffset = self.shortcutsList.offset();

					// If the element is a list item, get coordinates relative to the shortcuts list
					if ( e.target.tagName.toLowerCase() === "li" ) {
						coords.x += $( e.target ).offset().left - shortcutsListOffset.left;
						coords.y += $( e.target ).offset().top  - shortcutsListOffset.top;
					}

					// Hit test each list item
					self.shortcutsList.find( 'li' ).each( function () {
						var listItem = $( this ),
							l = listItem.offset().left - shortcutsListOffset.left,
							t = listItem.offset().top  - shortcutsListOffset.top,
							r = l + Math.abs(listItem.outerWidth( true ) ),
							b = t + Math.abs(listItem.outerHeight( true ) );

						if ( coords.x >= l && coords.x <= r && coords.y >= t && coords.y <= b ) {
							jumpToDivider( $( listItem.data( 'divider' ) ) );
							return false;
						}
						return true;
					} );

					e.preventDefault();
					e.stopPropagation();
				} )
				// bind mouseout of the shortcutscroll container to remove popup
				.bind( 'touchend mouseup vmouseup vmouseout', function () {
					$popup.hide();
				} );

			if ( page && !( page.is( ':visible' ) ) ) {
				page.bind( 'pageshow', function () { self.refresh(); } );
			} else {
				this.refresh();
			}

			// refresh the list when dividers are filtered out
			$el.bind( 'updatelayout', function () {
				self.refresh();
			} );
		},

		refresh: function () {
			var self = this,
				shortcutsTop,
				minClipHeight,
				dividers,
				listItems;

			this.shortcutsList.find( 'li' ).remove();

			// get all the dividers from the list and turn them into shortcuts
			dividers = this.element.find( '.ui-li-divider' );

			// get all the list items
			listItems = this.element.find( 'li:not(.ui-li-divider)) ');

			// only use visible dividers
			dividers = dividers.filter( ':visible' );
			listItems = listItems.filter( ':visible' );

			if ( dividers.length < 2 ) {
				this.shortcutsList.hide();
				return;
			}

			this.shortcutsList.show();

			this.lastListItem = listItems.last();

			dividers.each( function ( index, divider ) {
				self.shortcutsList
					.append( $( '<li>' + $( divider ).text() + '</li>' )
						.data( 'divider', divider ) );
			} );

			// position the shortcut flush with the top of the first list divider
			shortcutsTop = dividers.first().position().top;
			this.shortcutsContainer.css( 'top', shortcutsTop );

			// make the scrollview clip tall enough to show the whole of the shortcutslist
			minClipHeight = shortcutsTop + this.shortcutsContainer.outerHeight() + 'px';
			this.scrollview.css( 'min-height', minClipHeight );
		}
	} );

	$( document ).bind( "pagecreate create", function ( e ) {
		$( $.tizen.shortcutscroll.prototype.options.initSelector, e.target )
			.not( ":jqmData(role='none'), :jqmData(role='nojs')" )
			.shortcutscroll();
	} );

} ( jQuery ) );
/*
 * jQuery Mobile Widget @VERSION
 *
 * This software is licensed under the MIT licence (as defined by the OSI at
 * http://www.opensource.org/licenses/mit-license.php)
 *
 * ***************************************************************************
 * Copyright (c) 2000 - 2011 Samsung Electronics Co., Ltd.
 * Copyright (c) 2011 by Intel Corporation Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 * Authors: Max Waterman <max.waterman@intel.com>
 * Authors: Minkyu Kang <mk7.kang@samsung.com>
 */

/**
 * tizenslider modifies the JQuery Mobile slider and is created in the same way.
 *
 * See the JQuery Mobile slider widget for more information :
 *     http://jquerymobile.com/demos/1.0a4.1/docs/forms/forms-slider.html
 *
 * The JQuery Mobile slider option:
 *     theme: specify the theme using the 'data-theme' attribute
 *
 * Options:
 *     theme: string; the theme to use if none is specified using the 'data-theme' attribute
 *            default: 'c'
 *     popupEnabled: boolean; controls whether the popup is displayed or not
 *                   specify if the popup is enabled using the 'data-popupEnabled' attribute
 *                   set from javascript using .tizenslider('option','popupEnabled',newValue)
 *
 * Events:
 *     changed: triggers when the value is changed (rather than when the handle is moved)
 *
 * Examples:
 *
 *     <a href="#" id="popupEnabler" data-role="button" data-inline="true">Enable popup</a>
 *     <a href="#" id="popupDisabler" data-role="button" data-inline="true">Disable popup</a>
 *     <div data-role="fieldcontain">
 *         <input id="mySlider" data-theme='a' data-popupenabled='false' type="range" name="slider" value="7" min="0" max="9" />
 *     </div>
 *     <div data-role="fieldcontain">
 *         <input id="mySlider2" type="range" name="slider" value="77" min="0" max="777" />
 *     </div>
 *
 *     // disable popup from javascript
 *     $('#mySlider').tizenslider('option','popupEnabled',false);
 *
 *     // from buttons
 *     $('#popupEnabler').bind('vclick', function() {
 *         $('#mySlider').tizenslider('option','popupEnabled',true);
 *     });
 *     $('#popupDisabler').bind('vclick', function() {
 *         $('#mySlider').tizenslider('option','popupEnabled',false);
 *     });
 */

(function ($, window, undefined) {
	$.widget("tizen.tizenslider", $.mobile.widget, {
		options: {
			popupEnabled: true
		},

		popup: null,
		handle: null,
		handleText: null,

		_create: function () {
			this.currentValue = null;
			this.popupVisible = false;

			var self = this,
				inputElement = $(this.element),
				slider,
				showPopup,
				hidePopup,
				positionPopup,
				updateSlider,
				slider_bar,
				handle_press,
				popupEnabledAttr,
				icon;

			// apply jqm slider
			inputElement.slider();

			// hide the slider input element proper
			inputElement.hide();

			self.popup = $('<div class="ui-slider-popup"></div>');

			// set the popupEnabled according to the html attribute
			popupEnabledAttr = inputElement.attr('data-popupenabled');
			if ( popupEnabledAttr !== undefined ) {
				self.options.popupEnabled = (popupEnabledAttr === 'true');
			}

			// get the actual slider added by jqm
			slider = inputElement.next('.ui-slider');

			icon = inputElement.attr('data-icon');

			// wrap the background
			if ( icon === undefined ) {
				slider.wrap('<div class="ui-slider-bg"></div>');
			} else {
				slider.wrap('<div class="ui-slider-icon-bg"></div>');
			}

			// get the handle
			self.handle = slider.find('.ui-slider-handle');

			// remove the rounded corners from the slider and its children
			slider.removeClass('ui-btn-corner-all');
			slider.find('*').removeClass('ui-btn-corner-all');

			// add icon

			switch ( icon ) {
			case 'bright':
			case 'volume':
				slider.before( $('<div class="ui-slider-left-' +
							icon + '"></div>') );
				slider.after( $('<div class="ui-slider-right-' +
							icon + '"></div>') );
				break;

			case 'text':
				slider.before( $('<div class="ui-slider-left-text">' +
					'<span style="position:relative;top:0.4em;">' +
					inputElement.attr('data-text-left') +
					'</span></div>') );
				slider.after( $('<div class="ui-slider-right-text">' +
					'<span style="position:relative;top:0.4em;">' +
					inputElement.attr('data-text-right') +
					'</span></div>') );
				break;
			}

			// slider bar
			slider.append($('<div class="ui-slider-bar"></div>'));
			self.slider_bar = slider.find('.ui-slider-bar');

			// handle press
			slider.append($('<div class="ui-slider-handle-press"></div>'));
			self.handle_press = slider.find('.ui-slider-handle-press');
			self.handle_press.css('display', 'none');

			// add a popup element (hidden initially)
			slider.before(self.popup);
			self.popup.hide();

			// get the element where value can be displayed
			self.handleText = slider.find('.ui-btn-text');
			if ( inputElement.attr('max') > 999 ) {
				self.handleText.css('font-size', '0.8em');
			}

			// set initial value
			self.updateSlider();

			// bind to changes in the slider's value to update handle text
			this.element.bind('change', function () {
				self.updateSlider();
			});

			// bind clicks on the handle to show the popup
			self.handle.bind('vmousedown', function () {
				self.showPopup();
			});

			// watch events on the document to turn off the slider popup
			slider.add(document).bind('vmouseup', function () {
				self.hidePopup();
			});
		},

		_handle_press_show: function () {
			this.handle_press.css('display', '');
		},

		_handle_press_hide: function () {
			this.handle_press.css('display', 'none');
		},

		// position the popup
		positionPopup: function () {
			var dstOffset = this.handle.offset();

			this.popup.offset({
				left: dstOffset.left + (this.handle.width() - this.popup.width()) / 2,
				top: dstOffset.top  - this.popup.outerHeight() + 15
			});

			this.handle_press.offset({
				left: dstOffset.left,
				top: dstOffset.top
			});
		},

		// show value on the handle and in popup
		updateSlider: function () {
			if ( this.popupVisible ) {
				this.positionPopup();
			}

			// remove the title attribute from the handle (which is
			// responsible for the annoying tooltip); NB we have
			// to do it here as the jqm slider sets it every time
			// the slider's value changes :(
			this.handle.removeAttr('title');

			this.slider_bar.width(this.handle.css('left'));

			var newValue = this.element.val();

			if ( newValue === this.currentValue ) {
				return;
			}

			this.currentValue = newValue;
			this.handleText.text(newValue);
			this.popup.html(newValue);

			this.element.trigger('update', newValue);
		},

		// show the popup
		showPopup: function () {
			if ( !(this.options.popupEnabled && !this.popupVisible) ) {
				return;
			}

			this.handleText.hide();
			this.popup.show();
			this.popupVisible = true;
			this._handle_press_show();
		},

		// hide the popup
		hidePopup: function () {
			if ( !(this.options.popupEnabled && this.popupVisible) ) {
				return;
			}

			this.handleText.show();
			this.popup.hide();
			this.popupVisible = false;
			this._handle_press_hide();
		},

		_setOption: function (key, value) {
			var needToChange = ( value !== this.options[key] );

			if ( !needToChange ) {
				return;
			}

			switch ( key ) {
			case 'popupEnabled':
				this.options.popupEnabled = value;

				if ( this.options.popupEnabled ) {
					this.updateSlider();
				} else {
					this.hidePopup();
				}

				break;
			}
		}
	});

	// stop jqm from initialising sliders
	$(document).bind("pagebeforecreate", function ( e ) {
		if ($.data(window, "jqmSliderInitSelector") === undefined ) {
			$.data(window, "jqmSliderInitSelector",
				$.mobile.slider.prototype.options.initSelector);
			$.mobile.slider.prototype.options.initSelector = null;
		}
	});

	// initialise sliders with our own slider
	$(document).bind("pagecreate", function ( e ) {
		var jqmSliderInitSelector = $.data(window, "jqmSliderInitSelector");
		$(e.target).find(jqmSliderInitSelector).not('select').tizenslider();
		$(e.target).find(jqmSliderInitSelector).filter('select').slider();
	});

}( jQuery, this ));
/*
 * jQuery Mobile Widget @VERSION
 *
 * This software is licensed under the MIT licence (as defined by the OSI at
 * http://www.opensource.org/licenses/mit-license.php)
 *
 * ***************************************************************************
 * Copyright (c) 2000 - 2011 Samsung Electronics Co., Ltd.
 * Copyright (c) 2011 by Intel Corporation Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 * Authors: Kalyan Kondapally <kalyan.kondapally@intel.com>,
 *          Elliot Smith <elliot.smith@intel.com>
 */

// Widget which turns a list into a "swipe list":
// i.e. each list item has a sliding "cover" which can be swiped
// to the right (to reveal buttons underneath) or left (to
// cover the buttons again). Clicking on a button under a swipelist
// also moves the cover back to the left.
//
// To create a swipelist, you need markup like this:
//
// <pre>
// &lt;ul data-role="swipelist"&gt;<br/>
//     &lt;li&gt;<br/>
//         &lt;div class="ui-grid-b"&gt;<br/>
//             &lt;div class="ui-block-a"&gt;<br/>
//                 &lt;a href="#" data-role="button" data-theme="a"&gt;Twitter&lt;/a&gt;<br/>
//             &lt;/div&gt;<br/>
//             &lt;div class="ui-block-b"&gt;<br/>
//                 &lt;a href="#" data-role="button" data-theme="b"&gt;FaceBook&lt;/a&gt;<br/>
//             &lt;/div&gt;<br/>
//             &lt;div class="ui-block-c"&gt;<br/>
//                 &lt;a href="#" data-role="button" data-theme="c"&gt;Google+&lt;/a&gt;<br/>
//             &lt;/div&gt;<br/>
//         &lt;/div&gt;<br/>
//         &lt;div data-role="swipelist-item-cover"&gt;Nigel&lt;/div&gt;<br/>
//     &lt;/li&gt;<br/>
//     ...<br/>
// &lt;/ul&gt;
// </pre>
//
// In this case, the cover is over a grid of buttons;
// but it is should also be possible to use other types of markup under the
// list items.
//
// Note the use of a separate div, parented by the li element, marked
// up with data-role="swipelist-item-cover". This div will usually
// contain text. If you want other elements in your swipelist covers,
// you may need to style them yourself. Because the covers aren't
// technically list items, you may need to do some work to make them
// look right.
//
// WARNING: This doesn't work well inside a scrollview widget, as
// the touch events currently interfere with each other badly (e.g.
// a swipe will work but cause a scroll as well).
//
// Theme: default is to use the theme on the target element,
// theme passed in options, parent theme, or 'c' if none of the above.
// If list items are themed individually, the cover will pick up the
// theme of the list item which is its parent.
//
// Events:
//
//   animationComplete: Triggered by a cover when it finishes sliding
//                      (to either the right or left).
(function ($) {

	$.widget("tizen.swipelist", $.mobile.widget, {
		options: {
			theme: null
		},

		_create: function () {
			// use the theme set on the element, set in options,
			// the parent theme, or 'c' (in that order of preference)
			var theme = this.element.jqmData('theme') ||
				this.options.theme ||
				this.element.parent().jqmData('theme') ||
				'c';

			this.options.theme = theme;
			this.refresh();
		},

		refresh: function () {
			this._cleanupDom();

			var self = this,
				defaultCoverTheme,
				covers;

			defaultCoverTheme = 'ui-body-' + this.options.theme;

			// swipelist is a listview
			if (!this.element.hasClass('ui-listview')) {
				this.element.listview();
			}

			this.element.addClass('ui-swipelist');

			// get the list item covers
			covers = this.element.find(':jqmData(role="swipelist-item-cover")');

			covers.each(function () {
				var cover = $(this),
					coverTheme = defaultCoverTheme,
				// get the parent li element and add classes
					item = cover.closest('li'),
					itemHasThemeClass;

				// add swipelist CSS classes
				item.addClass('ui-swipelist-item');
				cover.addClass('ui-swipelist-item-cover');

				// set swatch on cover: if the nearest list item has
				// a swatch set on it, that will be used; otherwise, use
				// the swatch set for the swipelist
				itemHasThemeClass = item.attr('class')
					.match(/ui\-body\-[a-z]|ui\-bar\-[a-z]/);

				if (itemHasThemeClass) {
					coverTheme = itemHasThemeClass[0];
				}

				cover.addClass(coverTheme);

				// wrap inner HTML (so it can potentially be styled)
				if (cover.has('.ui-swipelist-item-cover-inner').length === 0) {
					cover.wrapInner($('<span/>').addClass('ui-swipelist-item-cover-inner'));
				}

				// bind to swipe events on the cover and the item
				if (!(cover.data('animateRight') && cover.data('animateLeft'))) {
					cover.data('animateRight', function () {
						self._animateCover(cover, 100);
					});

					cover.data('animateLeft', function () {
						self._animateCover(cover, 0);
					});
				}

				// bind to synthetic events
				item.bind('swipeleft', cover.data('animateLeft'));
				cover.bind('swiperight', cover.data('animateRight'));

				// any clicks on buttons inside the item also trigger
				// the cover to slide back to the left
				item.find('.ui-btn').bind('vclick', cover.data('animateLeft'));
			});
		},

		_cleanupDom: function () {

			var self = this,
				defaultCoverTheme,
				covers;

			defaultCoverTheme = 'ui-body-' + this.options.theme;

			this.element.removeClass('ui-swipelist');

			// get the list item covers
			covers = this.element.find(':jqmData(role="swipelist-item-cover")');

			covers.each(function () {
				var cover = $(this),
					coverTheme = defaultCoverTheme,
					text,
					wrapper,
					// get the parent li element and add classes
					item = cover.closest('li'),
					itemClass,
					itemHasThemeClass;

					// remove swipelist CSS classes
				item.removeClass('ui-swipelist-item');
				cover.removeClass('ui-swipelist-item-cover');

				// remove swatch from cover: if the nearest list item has
				// a swatch set on it, that will be used; otherwise, use
				// the swatch set for the swipelist
				itemClass = item.attr('class');
				itemHasThemeClass = itemClass &&
					itemClass.match(/ui\-body\-[a-z]|ui\-bar\-[a-z]/);

				if (itemHasThemeClass) {
					coverTheme = itemHasThemeClass[0];
				}

				cover.removeClass(coverTheme);

				// remove wrapper HTML
				wrapper = cover.find('.ui-swipelist-item-cover-inner');
				wrapper.children().unwrap();
				text = wrapper.text();

				if (text) {
					cover.append(text);
					wrapper.remove();
				}

				// unbind swipe events
				if (cover.data('animateRight') && cover.data('animateLeft')) {
					cover.unbind('swiperight', cover.data('animateRight'));
					item.unbind('swipeleft', cover.data('animateLeft'));

					// unbind clicks on buttons inside the item
					item.find('.ui-btn').unbind('vclick', cover.data('animateLeft'));

					cover.data('animateRight', null);
					cover.data('animateLeft', null);
				}
			});
		},

		// NB I tried to use CSS animations for this, but the performance
		// and appearance was terrible on Android 2.2 browser;
		// so I reverted to jQuery animations
		//
		// once the cover animation is done, the cover emits an
		// animationComplete event
		_animateCover: function (cover, leftPercentage) {
			var animationOptions = {
				easing: 'linear',
				duration: 'fast',
				queue: true,
				complete: function () {
					cover.trigger('animationComplete');
				}
			};

			cover.stop();
			cover.clearQueue();
			cover.animate({left: leftPercentage + '%'}, animationOptions);
		},

		destroy: function () {
			this._cleanupDom();
		}

	});

	$(document).bind("pagecreate", function (e) {
		$(e.target).find(":jqmData(role='swipelist')").swipelist();
	});

}(jQuery));
/*
 * jQuery Mobile Widget @VERSION
 *
 * This software is licensed under the MIT licence (as defined by the OSI at
 * http://www.opensource.org/licenses/mit-license.php)
 *
 * ***************************************************************************
 * Copyright (c) 2000 - 2011 Samsung Electronics Co., Ltd.
 * Copyright (c) 2011 by Intel Corporation Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software" ),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 * Authors: Gabriel Schulhof <gabriel.schulhof@intel.com>
 */

// Displays a simple two-state switch.
//
// To apply, add the attribute data-role="switch" to a <div>
// element inside a page. Alternatively, call switch()
// on an element, like this :
//
//     $( "#myswitch" ).toggleswitch();
// where the html might be :
//     <div id="myswitch"></div>
//
// Options:
//     checked: Boolean; the state of the switch
//     Default: true (up)
//
// Events:
//     changed: Emitted when the switch is changed

(function ( $, undefined ) {

	$.widget( "tizen.toggleswitch", $.tizen.widgetex, {
		options: {
			onText			: "On",
			offText			: "Off",
			checked			: true,
			initSelector	: ":jqmData(role='toggleswitch')"
		},

		_htmlProto: {
source:

$("<div><div id='outer' class='ui-btn ui-btn-corner-all ui-btn-inline ui-shadow ui-toggleswitch'>" +
  "    <div class='ui-btn ui-btn-corner-all ui-btn-up-c toggleswitch-background'></div>" +
  "    <div class='ui-btn ui-btn-corner-all ui-btn-up-c toggleswitch-background ui-btn-active' id='bg'></div>" +
  "    <a data-role='button' data-shadow='false' class='toggleswitch-floating-button toggleswitch-mover' id='normal'>" +
  "       <span data-normal-text='true'></span>" +
  "    </a>" +
  "    <a data-role='button' data-shadow='false' class='toggleswitch-floating-button toggleswitch-mover ui-btn-active' id='active'>" +
  "       <span data-active-text='true'></span>" +
  "    </a>" +
  "    <a data-role='button' data-shadow='false' class='toggleswitch-sizer'>" +
  "       <span data-normal-text='true'></span>" +
  "    </a>" +
  "    <a data-role='button' data-shadow='false' class='toggleswitch-sizer'>" +
  "       <span data-active-text='true'></span>" +
  "    </a>" +
  "    <a data-role='button' data-shadow='false' class='toggleswitch-floating-button' id='button'>" +
  "       <span id='btn-span'></span>" +
  "    </a>" +
  "</div>" +
  "</div>")
,			ui: {
				outer		: "#outer",
				bg			: "#bg",
				txtMovers	: {
					normal	: "#normal",
					active	: "#active"
				},
				btn			: "#button",
				btnSpan		: "#btn-span",
				txt			: {
					normal	: "[data-normal-text]",
					active	: "[data-active-text]"
				}
			}
		},

		_value: {
			attr: "data-" + ( $.mobile.ns || "" ) + "checked",
			signal: "changed"
		},

		_create: function () {
			var self = this;

			this.element
				.css( "display", "none" )
				.after( this._ui.outer );

			this._ui.outer.find( "a" ).buttonMarkup();
			this._ui.txtMovers.normal
				.add( this._ui.txtMovers.active )
				.find( "*" )
				.css( { "border-color": "transparent" } );
			this._ui.btn.addClass( "toggleswitch-button" );
/*
		// Crutches for IE: It does not seem to understand opacity specified in a class, nor that opacity of an element
		// affects all its children
		if ($.mobile.browser.ie) {
			// Remove this class, because it has no effect in IE :-S
			this._ui.outer.find( "*" ).removeClass( "toggleswitch-button-transparent" );
			// After adding the button markup, make everything transparent
			this._ui.normalBackground.find( "*" ).css( "opacity", 0.0);
			this._ui.activeBackground.find( "*" ).css( "opacity", 0.0);
			this._ui.refButton.add( this._ui.refButton.find( "*" )).css( "opacity", 0.0);
			this._ui.realButton.add( this._ui.realButton.find( "*" )).css( "opacity", 0.0);
			// ... except the buttons that display the inital position of the switch
			this._ui.initButtons
				.add( this._ui.initButtons.find( "*" ))
				.add( this._ui.fButton.find( "*" ))
				.add( this._ui.fButton)
				.css( "opacity", 1.0);
		}
*/
			$.extend( this, {
				_initial: true
			} );

			this._ui.btn
				.add( this._ui.outer )
				.bind( "vclick", function ( e ) {
					self._setChecked( !( self.options.checked ) );
					e.stopPropagation();
				} );
		},
/*
		_makeTransparent: function (obj, b) {
			if ($.mobile.browser.ie)
				obj.add(obj.find( "*" )).css( "opacity", b ? 0.0 : 1.0);
			else
				obj[b ? "addClass" : "removeClass"]( "toggleswitch-button-transparent" );
		},
*/
		_setDisabled: function ( value ) {
			$.tizen.widgetex.prototype._setDisabled.call( this, value );
			this._ui.outer[value ? "addClass" : "removeClass"]( "ui-disabled" );
		},

		_updateBtnText: function () {
			var noText = ( ( ( this.options.offText || "" ) === "" &&
					( this.options.onText || "" ) === "" ) );
			this._ui.btnSpan.html( ( noText ? "" : "&nbsp;" ) );
			this._ui.outer.find( "a" )[( noText ? "addClass" : "removeClass" )]( "ui-btn-icon-notext" );
		},

		_setOnText: function ( value ) {
			this._ui.txt.active.text( value );
			this.options.onText = value;
			this.element.attr( "data-" + ( $.mobile.ns || "" ) + "on-text", value );
			this._updateBtnText();
		},

		_setOffText: function ( value ) {
			this._ui.txt.normal.text( value );
			this.options.offText = value;
			this.element.attr( "data-" + ($.mobile.ns || "" ) + "off-text", value );
			this._updateBtnText();
		},

		_setChecked: function ( checked ) {
			if ( this.options.checked != checked ) {
				var dst = checked
					? { bg:  "0%", normalTop: "-50%", activeBot: "0%" }
					: { bg: "50%", normalTop: "0%", activeBot: "-50%" },
					method = ( this._initial ? "css" : "animate" );

				this._ui.btn.add( this._ui.bg )[method]( { top: dst.bg } );
				this._ui.txtMovers.normal[method]( { top: dst.normalTop } );
				this._ui.txtMovers.active[method]( { bottom: dst.activeBot } );

				this._initial = false;

				this.options.checked = checked;
				this.element.attr( "data-" + ( $.mobile.ns || "" ) + "checked", checked );
				this._setValue( checked );
			}
		}
	} );

	$( document ).bind( "pagecreate create", function ( e ) {
		$( $.tizen.toggleswitch.prototype.options.initSelector, e.target )
			.not( ":jqmData(role='none'), :jqmData(role='nojs')" )
			.toggleswitch();
	} );

}( jQuery ) );
/*
 * This software is licensed under the MIT licence (as defined by the OSI at
 * http://www.opensource.org/licenses/mit-license.php)
 *
 * ***************************************************************************
 * Copyright (c) 2000 - 2011 Samsung Electronics Co., Ltd.
 * Copyright (c) 2011 by Intel Corporation Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 */

( function ($, undefined) {

	$.widget( "tizen.triangle", $.tizen.widgetex, {
		options: {
			extraClass: "",
			offset: null,
			color: null,
			location: "top",
			initSelector: ":jqmData(role='triangle')"
		},

		_create: function () {
			var triangle = $( "<div></div>", {"class" : "ui-triangle"} );

			$.extend(this, {
				_triangle: triangle
			});

			this.element.addClass( "ui-triangle-container" ).append( triangle );
		},

		_doCSS: function () {
			var location = ( this.options.location || "top" ),
				offsetCoord = ( ($.inArray(location, ["top", "bottom"]) === -1) ? "top" : "left"),
				cssArg = {
					"border-bottom-color" : "top"    === location ? this.options.color : "transparent",
					"border-top-color"    : "bottom" === location ? this.options.color : "transparent",
					"border-left-color"   : "right"  === location ? this.options.color : "transparent",
					"border-right-color"  : "left"   === location ? this.options.color : "transparent"
				};

			cssArg[offsetCoord] = this.options.offset;

			this._triangle.removeAttr( "style" ).css( cssArg );
		},

		_setOffset: function ( value ) {
			this.options.offset = value;
			this.element.attr( "data-" + ($.mobile.ns || "") + "offset", value );
			this._doCSS();
		},

		_setExtraClass: function ( value ) {
			this._triangle.addClass( value );
			this.options.extraClass = value;
			this.element.attr( "data-" + ($.mobile.ns || "") + "extra-class", value );
		},

		_setColor: function ( value ) {
			this.options.color = value;
			this.element.attr( "data-" + ($.mobile.ns || "") + "color", value );
			this._doCSS();
		},

		_setLocation: function ( value ) {
			this.element
				.removeClass( "ui-triangle-container-" + this.options.location )
				.addClass( "ui-triangle-container-" + value );
			this._triangle
				.removeClass( "ui-triangle-" + this.options.location )
				.addClass( "ui-triangle-" + value );

			this.options.location = value;
			this.element.attr( "data-" + ($.mobile.ns || "") + "location", value );

			this._doCSS();
		}
	});

	$( document ).bind( "pagecreate create", function ( e ) {
	    $($.tizen.triangle.prototype.options.initSelector, e.target)
	        .not(":jqmData(role='none'), :jqmData(role='nojs')")
	        .triangle();
	});

}(jQuery) );
/* ***************************************************************************
 * Copyright (c) 2000 - 2011 Samsung Electronics Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 *	Author: Kangsik Kim <kangsik81.kim@samsung.com>
*/

/**
 * Virtual Grid Widget for unlimited data.
 * To support more then 1,000 items, special grid widget developed.
 * Fast initialize and light DOM tree.
 *
 * HTML Attributes:
 *
 *		data-role:  virtualgridview
 *		data-template : jQuery.template ID that populate into virtual list
 *		data-dbtable : DB Table name. It used as window[DB NAME]. Loaded data should be converted as window object.
 *		data-dbkey : Unique key of DB Table. To sync each element on virtual list with DB table.
 *		data-column : Set a number of column. (Default : 3)
 *		data-row : Set a number of row. (Default : 10)
 *
 *		ID : <UL> element that has "data-role=virtualgrid" must have ID attribute.
 *		Class : <UL> element that has "data-role=virtualgrid" should have "vgLoadSuccess" class to guaranty DB loading is completed.
 *
 * APIs:
 *
 *		create ( void )
 *			: API to call _create method. API for AJAX or DB loading callback.
 *
 * Events:
 *
 *
 * Examples:
 *
 *			<script id="tizen-demo-namecard" type="text/x-jquery-tmpl">
 *				<div class="ui-demo-namecard">
 *					<div class="ui-demo-namecard-pic">
 *						<img class="ui-demo-namecard-pic-img" src="${TEAM_LOGO}"  />
 *					</div>
 *					<div class="ui-demo-namecard-contents">
 *						<span class="name ui-li-text-main">${NAME}</span>
 *						<span class="active ui-li-text-sub">${ACTIVE}</span>
 *						<span class="from ui-li-text-sub">${FROM}</span>
 *					</div>
 *				</div>
 *			</script>
 *			<div id="virtualgrid-demo" data-role="virtualgrid" data-column="3" data-row="60" data-template="tizen-demo-namecard" data-dbtable="JSON_DATA" >
 *			</div>
 *
 */

( function ( $, window, undefined ) {
	$.widget( "tizen.virtualgrid", $.mobile.widget, {
		options : {
			id : "",
			column : 3,
			dbtable : "",
			template : "",
			row : 20,
			dbkey : false
		},
		create : function () {
			this._create();
		},
		_create : function () {
			$.extend( this, {
				NO_SCROLL : 0,
				SCROLL_DOWN : 1,
				SCROLL_UP : -1,
				_titleHeight : 0,
				_blockHeight : 0,
				_bufferSize : 0,
				_columnWidth : 0,
				_totalItemCnt : 0,
				_totalRowCnt : 0,
				_currentIndex : 0,
				_remainCount : 0,
				_viewHeight : 0,
				_direction : 0,
				_firstIndex : 0,
				_lastIndex : 0,
				_prevPos : 0,
				_numTopItems : 0
			});

			var opts = this.options, widget = this;
			opts.id = "#" + this.element.attr( 'id' );

			if ( $( opts.id ).hasClass( "vgLoadSuccess" ) ) {
				$( opts.id ).empty();
				// validation row, column count
				// initialize global value.
				widget._lastIndex = opts.row;
				widget._bufferSize = ( parseInt( ( opts.row / 4 ), 10 ) );
				widget._totalItemCnt = $( window[opts.dbtable] ).size();
				widget._pushData( ( opts.template ), window[opts.dbtable] );
				widget._reposition();
				widget._addEvents();
			}
		},
		_pushData : function ( template, data ) {
			var widget = this,
				opts = this.options,
				dataTable = data,
				myTemplate = $( "#" + template ),
				viewcount = opts.row * opts.column,
				lastIndex = viewcount,
				index = 0,
				rowIndex = 0,
				colIndex = 0,
				wrapBlock = null;

			for ( rowIndex = 0; rowIndex < opts.row; rowIndex += 1 ) {
				wrapBlock = widget._makeWrapBlock( myTemplate, dataTable );
				$( wrapBlock ).attr( "id", "block_" + rowIndex );
				$( opts.id ).append( wrapBlock );
			}
			widget._blockHeight = $( wrapBlock ).outerHeight();
		},
		// make a single row block
		_makeWrapBlock : function ( myTemplate, dataTable ) {
			var widget = this,
				opts = widget.options,
				index = widget._currentIndex,
				htmlData = null,
				colIndex = 0,
				wrapBlock = document.createElement( "div" );

			$( wrapBlock ).addClass( "ui-virtualgrid-wrapblock" );
			for ( colIndex = 0; colIndex < opts.column; colIndex++ ) {
				htmlData = myTemplate.tmpl( dataTable[index] );
				$( wrapBlock ).append( htmlData );
				index = index <= widget._totalItemCnt ? index + 1 : 0;
			}
			widget._currentIndex = index;
			return wrapBlock;
		},
		_reposition : function () {
			var widget = this,
				$view = widget.element,
				opts = this.options,
				wrapsBlocks = null,
				childBlocks = null,
				blockCount = 0,
				index = 0,
				subIndex = 0,
				firstBlock = $( ".ui-virtualgrid-wrapblock:first" ),
				subBlocks = firstBlock.children();

			widget._blockHeight = firstBlock.outerHeight();
			widget._titleHeight = firstBlock.position().top;

			if ( subBlocks[0] ) {
				widget._columnWidth = $( subBlocks[0] ).outerWidth();
			}

			wrapsBlocks = $( ".ui-virtualgrid-wrapblock" );
			blockCount = wrapsBlocks.length;
			for ( index = 0; index < blockCount; index += 1 ) {
				$( wrapsBlocks[index] ).css( "top", widget._titleHeight + ( index * widget._blockHeight  ) );
				childBlocks = $( wrapsBlocks[index] ).children();
				for ( subIndex = 0; subIndex < childBlocks.length; subIndex += 1 ) {
					$( childBlocks[subIndex] ).css( "left", ( subIndex * widget._columnWidth ) + 'px' );
				}
			}
			// check total row count and setup total height
			widget._totalRowCnt = ( widget._totalItemCnt % opts.column ) === 0 ? ( widget._totalItemCnt / opts.column ) : ( parseInt( ( widget._totalItemCnt / opts.column ), 10 ) + 1 );
			$( opts.id ).height( widget._totalRowCnt * widget._blockHeight );
		},

		_addEvents : function () {
			var widget = this;

			$( document ).bind( "scrollupdate.virtualgrid", function ( event ) {
				widget._doScrollEvent(event);
			});

			$( document ).bind( "scrollstop.virtualgrid", function ( event ) {
				widget._doScrollEvent(event);
			});
		},

		_doScrollEvent : function ( event ) {
			var widget = this,
				$view = this.element,
				opts = widget.options,
				dataList = window [opts.dbtable],
				filterCondition = 0,
				replaceRowCnt = 0,
				replacedCount = 0,
				$scrollview = $view.closest (".ui-scrollview-view"),
				transformValue = null,
				curWindowTop = 0;

			transformValue = widget._matrixToArray ($scrollview.css ("-webkit-transform"));
			curWindowTop = Math.abs (transformValue [5]);
			if (widget._prevPos > curWindowTop) {
				widget._direction = widget.SCROLL_UP;
			} else if (widget._prevPos < curWindowTop) {
				widget._direction = widget.SCROLL_DOWN;
			}

			if (widget._direction == widget.SCROLL_DOWN) {
				filterCondition = (curWindowTop - widget._blockHeight );
				replaceRowCnt = $ (".ui-virtualgrid-wrapblock").filter (function () {
					return (parseInt (($ (this).position ().top ), 10) < filterCondition );
				}).size ();
				if (replaceRowCnt > widget._bufferSize) {
					$ (document).bind ("touchstart.virtualgrid", function (event) {
						event.preventDefault ();
					});

					replaceRowCnt = replaceRowCnt - widget._bufferSize;
					replacedCount = widget._moveTopBottom (widget._firstIndex, widget._lastIndex, replaceRowCnt, opts.dbkey);
					widget._firstIndex += replacedCount;
					widget._lastIndex += replacedCount;
					widget._numTopItems -= replacedCount;
					$ (document).unbind ("touchstart.virtualgrid");
				}
			} else if (widget._direction == widget.SCROLL_UP) {
				filterCondition = (curWindowTop + widget._viewHeight + ( widget._blockHeight * 3) );
				replaceRowCnt = $ (".ui-virtualgrid-wrapblock").filter (function () {
					return (parseInt (($ (this).position ().top ), 10) > filterCondition );
				}).size ();
				if (replaceRowCnt > widget._bufferSize) {
					$ (document).bind ("touchstart.virtualgrid", function (event) {
						event.preventDefault ();
					});

					replaceRowCnt = replaceRowCnt - widget._bufferSize;
					replacedCount = widget._moveBottomTop (widget._firstIndex, widget._lastIndex, replaceRowCnt, opts.dbkey);
					widget._firstIndex -= replacedCount;
					widget._lastIndex -= replacedCount;
					widget._numTopItems += replacedCount;
					$ (document).unbind ("touchstart.virtualgrid");
				}
			}
			// save preve position information.
			widget._prevPos = curWindowTop;
		},

		/* Matrix to Array function written by Blender@stackoverflow.nnikishi@emich.edu*/
		_matrixToArray : function ( matrix ) {
			var contents = matrix.substr( 7 );
			contents = contents.substr( 0, contents.length - 1 );
			return contents.split( ', ' );
		},
		//Move older item to bottom
		_moveTopBottom : function ( v_firstIndex, v_lastIndex, num, key ) {
			if ( v_firstIndex < 0 ) {
				return;
			}

			if ( num < 1 ) {
				return;
			}

			var widget = this,
				opts = widget.options,
				dataList = window[opts.dbtable],
				dataIndex = ( ( v_lastIndex ) * opts.column ),
				count = 0,
				curBlock = null,
				cur_item = null,
				myTemplate = null,
				htmlData = null,
				i = 0,
				j = 0,
				contentsBlocks = null;

			// wrap block count
			// print argument value
			for ( i = 0; i < num; i += 1 ) {
				if ( v_lastIndex >= widget._totalRowCnt ) {
					break;
				}

				// select block
				curBlock = $( "#block_" + ( v_firstIndex + i ) );
				if ( !curBlock ) {
					break;
				}

				contentsBlocks = curBlock.children();

				for ( j = 0; j < opts.column; j += 1 ) {
					cur_item = contentsBlocks[j];
					myTemplate = $( "#" + opts.template );
					htmlData = myTemplate.tmpl( dataList[dataIndex] );
					widget._replace( cur_item, htmlData, key );
					dataIndex += 1;
				}

				curBlock.css( "top", widget._titleHeight + widget._blockHeight * ( ( v_lastIndex ) ) ).css( "left", 0 );

				contentsBlocks.css( "top", widget._titleHeight + widget._blockHeight * ( ( v_lastIndex ) ) );
				curBlock.attr( "id", "block_" + ( v_lastIndex ) );

				v_lastIndex++;
				count++;
			}
			return count;
		},
		_moveBottomTop : function ( v_firstIndex, v_lastIndex, num, key ) {
			if ( v_firstIndex < 0 ) {
				return;
			}

			if ( num < 1 ) {
				return;
			}

			var widget = this,
				opts = widget.options,
				dataList = window[opts.dbtable],
				dataIndex = ( ( v_firstIndex - 1 ) * opts.column ),
				targetBlock = $( ".ui-virtualgrid-wrapblock:first" ),
				curBlock = null,
				contentsBlocks = null,
				cur_item = null,
				myTemplate = null,
				htmlData = null,
				i = 0,
				j = 0,
				count = 0;

			// print argument value
			for ( i = 0; i < num; i += 1 ) {
				if ( v_firstIndex - 1 < 0 ) {
					break;
				}

				// select block
				curBlock = $( "#block_" + ( ( v_lastIndex - 1 ) - i ) );
				if ( !curBlock ) {
					break;
				}

				dataIndex = ( ( v_firstIndex - 1 ) * opts.column );

				contentsBlocks = curBlock.children();
				for ( j = 0; j < opts.column; j += 1 ) {
					cur_item = contentsBlocks[j];
					myTemplate = $( "#" + opts.template );
					htmlData = myTemplate.tmpl( dataList[dataIndex] );
					widget._replace( cur_item, htmlData, key );
					dataIndex++;
				}
				curBlock.css( "top", widget._titleHeight + widget._blockHeight * ( ( v_firstIndex - 1 ) ) ).css( "left", 0 );
				curBlock.attr( "id", "block_" + ( v_firstIndex - 1 ) );
				contentsBlocks.css( "top", widget._titleHeight + widget._blockHeight * ( ( v_firstIndex - 1 ) ) );

				v_firstIndex -= 1;
				count++;
			}
			return count;
		},
		/* Text & image src replace function */
		// @param oldItem   : prev HtmlDivElement
		// @param newItem   : new HtmlDivElement for replace
		// @param key       :
		_replace : function ( oldItem, newItem, key ) {
			$( oldItem ).find( ".ui-li-text-main", ".ui-li-text-sub", "ui-btn-text" ).each( function ( index ) {
				var oldObj = $( this ),
					newText = $( newItem ).find( ".ui-li-text-main", ".ui-li-text-sub", "ui-btn-text" ).eq( index ).text();

				$( oldObj ).contents().filter( function () {
					return ( this.nodeType == 3 );
				}).get( 0 ).data = newText;
			});

			$( oldItem ).find( "img" ).each( function ( imgIndex ) {
				var oldObj = $( this ),
					newImg = $( newItem ).find( "img" ).eq( imgIndex ).attr( "src" );

				$( oldObj ).attr( "src", newImg );
			});
			if ( key ) {
				$( oldItem ).data( key, $( newItem ).data( key ) );
			}
		}
	});

	$( document ).bind( "pagecreate create", function () {
		$( ":jqmData(role='virtualgrid')" ).virtualgrid();
	});

} ( jQuery, window ) );

/* ***************************************************************************
 * Copyright (c) 2000 - 2011 Samsung Electronics Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ***************************************************************************
 *
 *	Author: Wongi Lee <wongi11.lee@samsung.com>
 */

/**
 * Virtual List Widget for unlimited data.
 * To support more then 1,000 items, special list widget developed. 
 * Fast initialize and light DOM tree.
 * DB connection and works like DB cursor.     
 * 
 * HTML Attributes:
 *
 *		data-role:	virtuallistview
 *		data-template : jQuery.template ID that populate into virtual list 
 *		data-dbtable : DB Table name. It used as window[DB NAME]. Loaded data should be converted as window object.
 *		data-dbkey : Unique key of DB Table. To sync each element on virtual list with DB table. 
 *		data-row : Optional. Set number of <li> elements that are used for data handling. 
 *		
 *		ID : <UL> element that has "data-role=virtuallist" must have ID attribute.
 *		Class : <UL> element that has "data-role=virtuallist" should have "vlLoadSuccess" class to guaranty DB loading is completed. 
 *
 * * APIs:
 *
 *		create ( void )
 *			: API to call _create method. API for AJAX or DB loading callback.
 *
 *		recreate ( Array )
 *			: Update virtual list with new data array. For example, update with search result. 
 *
 * Events:
 *
 *		touchstart : Temporary preventDefault applied on touchstart event to avoid broken screen.
 *
 * Examples:
 *
 *		<script id="tmp-3-2-7" type="text/x-jquery-tmpl">
 *			<li class="ui-li-3-2-7">
 *				<span class="ui-li-text-main">${NAME}</span>
 *				<img src="00_winset_icon_favorite_on.png" class="ui-li-icon-sub">
 *				<span class="ui-li-text-sub">${ACTIVE}</span>
 *				<span class="ui-li-text-sub2">${FROM}</span>
 *			</li>
 *		</script>
 *
 *		<ul id="virtuallist-normal_3_2_7_ul" data-role="virtuallistview" data-template="tmp-3-2-7" data-dbtable="JSON_DATA" data-row="100">
 *		</ul>
 *
 */


(function ( $, undefined ) {

	/* Code for Virtual List Demo */
	var listCountPerPage = {},	/* Keeps track of the number of lists per page UID. This allows support for multiple nested list in the same page. https://github.com/jquery/jquery-mobile/issues/1617 */
		TOTAL_ITEMS = 0,
		LINE_H = 0,
		TITLE_H = 0,
		CONTAINER_W = 0,
		NO_SCROLL = 0,					/* ENUM */
		SCROLL_DOWN = 1,				/* ENUM */
		SCROLL_UP = -1,					/* ENUM */
		MINIMUM_ROW = 20,
		direction = NO_SCROLL,
		first_index,
		last_index,
		num_top_items = 0;				//By scroll move, number of hidden elements.

	$.widget( "tizen.virtuallistview", $.mobile.widget, {
		options: {
			theme: "s",
			countTheme: "c",
			headerTheme: "b",
			dividerTheme: "b",
			splitIcon: "arrow-r",
			splitTheme: "b",
			inset: false,
			id:	"",					/* Virtual list UL elemet's ID */
			childSelector: " li",	/* To support swipe list */
			dbtable: "",
			template : "",
			dbkey: false,			/* Data's unique Key */
			scrollview: false,
			row: 100,
			page_buf: 50,
			initSelector: ":jqmData(role='virtuallistview')"
		},

		_stylerMouseUp: function () {
			$( this ).addClass( "ui-btn-up-s" );
			$( this ).removeClass( "ui-btn-down-s" );
		},

		_stylerMouseDown: function () {
			$( this ).addClass( "ui-btn-down-s" );
			$( this ).removeClass( "ui-btn-up-s" );
		},

		_stylerMouseOver: function () {
			$( this ).toggleClass( "ui-btn-hover-s" );
		},

		_stylerMouseOut: function () {
			$( this ).toggleClass( "ui-btn-hover-s" );
		},

		_pushData: function ( template, data ) {
			var o = this.options,
				i,
				dataTable = data,
				myTemplate = $( "#" + template ),
				lastIndex = ( o.row > data.length ? data.length : o.row ),
				htmlData;

			for ( i = 0; i < lastIndex; i++ ) {
				htmlData = myTemplate.tmpl( dataTable[i] );
				$( o.id ).append( $( htmlData ).attr( 'id', 'li_' + i ) );
			}

			/* After push data, re-style virtuallist widget */
			$( o.id ).trigger( "create" );
		},

		_reposition: function ( event ) {
			var o,
				t = this,
				padding;

			if ( event.data ) {
				o = event.data;
			} else {
				o = event;
			}

			if ( $( o.id + o.childSelector ).size() > 0 ) {
				TITLE_H = $( o.id + o.childSelector + ':first' ).position().top;
				LINE_H = $( o.id + o.childSelector + ':first' ).outerHeight();

				CONTAINER_W = $( o.id ).innerWidth();

				padding = parseInt( $( o.id + o.childSelector ).css( "padding-left" ), 10 ) + parseInt( $( o.id + o.childSelector ).css( "padding-right" ), 10 );

				/* Add style */
				$( o.id + ">" + o.childSelector ).addClass( "position_absolute" ).addClass( "ui-btn-up-s" )
													.bind( "mouseup", t._stylerMouseUp )
													.bind( "mousedown", t._stylerMouseDown )
													.bind( "mouseover", t._stylerMouseOver )
													.bind( "mouseout", t._stylerMouseOut );
			}

			$( o.id + ">" + o.childSelector ).each( function ( index ) {
				$( this ).css( "top", TITLE_H + LINE_H * index + 'px' )
					.css( "width", CONTAINER_W - padding );
			} );

			/* Set Max List Height */
			$( o.id ).height( TOTAL_ITEMS * LINE_H );
		},

		_resize: function ( event ) {
			var o,
				t = this,
				padding;

			if ( event.data ) {
				o = event.data;
			} else {
				o = event;
			}

			CONTAINER_W = $( o.id ).innerWidth();

			padding = parseInt( $( o.id + o.childSelector ).css( "padding-left" ), 10 ) + parseInt( $( o.id + o.childSelector ).css( "padding-right" ), 10 );

			$( o.id + o.childSelector ).each( function (index) {
				$( this ).css( "width", CONTAINER_W - padding );
			} );
		},

		_scrollmove: function ( event ) {
			var velocity = 0,
				o = event.data,
				i,
				dataList = window[o.dbtable],
				_replace,		/* Function */
				_moveTopBottom,	/* Function */
				_moveBottomTop,	/* Function */
				_matrixToArray,	/* Function */
				$el,
				transformValue,
				curWindowTop,
				cur_num_top_itmes;

			/* Text & image src replace function */
			_replace = function ( oldItem, newItem, key ) {
				var oldObj,
					newText,
					newImg;

				$( oldItem ).find( ".ui-li-text-main", ".ui-li-text-sub", "ui-btn-text" ).each( function ( index ) {
					oldObj = $( this );
					newText = $( newItem ).find( ".ui-li-text-main", ".ui-li-text-sub", "ui-btn-text" ).eq( index ).text();

					$( oldObj).contents().filter( function () {
						return ( this.nodeType == 3 );
					} ).get( 0 ).data = newText;
				} );

				$( oldItem ).find( "img" ).each( function ( imgIndex ) {
					oldObj = $( this );
					newImg = $( newItem ).find( "img" ).eq( imgIndex ).attr( "src" );

					$( oldObj ).attr( "src", newImg );
				} );

				if (key) {
					$( oldItem ).data( key, $( newItem ).data( key ) );
				}
			};

			//Move older item to bottom
			_moveTopBottom = function ( v_firstIndex, v_lastIndex, num, key ) {
				var myTemplate,
					htmlData,
					cur_item;

				if (v_firstIndex < 0) {
					return;
				}

				for ( i = 0; i < num; i++ ) {
					if ( v_lastIndex + i > TOTAL_ITEMS ) {
						break;
					}

					cur_item = $( '#li_' + ( v_firstIndex + i ) );

					if ( cur_item ) {
						/* Make New <LI> element from template. */
						myTemplate = $( "#" + o.template );
						htmlData = myTemplate.tmpl( dataList[ v_lastIndex + i ] );

						/* Copy all data to current item. */
						_replace( cur_item, htmlData, key );

						/* Set New Position */
						( cur_item ).css( 'top', TITLE_H + LINE_H * ( v_lastIndex + 1 + i ) ).attr( 'id', 'li_' + ( v_lastIndex + 1 + i ) );
					} else {
						break;
					}
				}
			};

			// Move older item to bottom
			_moveBottomTop = function ( v_firstIndex, v_lastIndex, num, key ) {
				var myTemplate,
					htmlData,
					cur_item;

				if ( v_firstIndex < 0 ) {
					return;
				}

				for ( i = 0; i < num; i++ ) {
					cur_item = $( '#li_' + ( v_lastIndex - i ) );

					if ( cur_item ) {
						if ( v_firstIndex - 1 - i < 0 ) {
							break;
						}

						/* Make New <LI> element from template. */
						myTemplate = $( "#" + o.template );
						htmlData = myTemplate.tmpl( dataList[ v_firstIndex - 1 - i ] );

						/* Copy all data to current item. */
						_replace( cur_item, htmlData, key );

						/* Set New Position */
						$( cur_item ).css( 'top', TITLE_H + LINE_H * ( v_firstIndex - 1 - i ) ).attr( 'id', 'li_' + ( v_firstIndex - 1 - i ) );
					} else {
						break;
					}
				}
			};

			/* Matrix to Array function written by Blender@stackoverflow.nnikishi@emich.edu*/
			_matrixToArray = function ( matrix ) {
				var contents = matrix.substr( 7 );

				contents = contents.substr( 0, contents.length - 1 );

				return contents.split( ', ' );
			};

			// Get scroll direction and velocity
			/* with Scroll view */
			if ( o.scrollview ) {
				$el = $( o.id ).parentsUntil( ".ui-page" ).find( ".ui-scrollview-view" );
				transformValue = _matrixToArray( $el.css( "-webkit-transform" ) );
				curWindowTop = Math.abs( transformValue[ 5 ] );	/* Y vector */
			} else {
				curWindowTop = $( window ).scrollTop() - LINE_H;
			}

			cur_num_top_itmes = $( o.id + o.childSelector ).filter( function () {
				return (parseInt( $( this ).css( "top" ), 10 ) < curWindowTop );
			} ).size();

			if ( num_top_items < cur_num_top_itmes ) {
				direction = SCROLL_DOWN;
				velocity = cur_num_top_itmes - num_top_items;
				num_top_items = cur_num_top_itmes;
			} else if ( num_top_items > cur_num_top_itmes ) {
				direction = SCROLL_UP;
				velocity = num_top_items - cur_num_top_itmes;
				num_top_items = cur_num_top_itmes;
			}

			// Move items
			if ( direction == SCROLL_DOWN ) {
				if ( cur_num_top_itmes > o.page_buf ) {
					if ( last_index + velocity > TOTAL_ITEMS ) {
						velocity = TOTAL_ITEMS - last_index - 1;
					}

					/* Prevent scroll touch event while DOM access */
					$(document).bind( "touchstart.virtuallist", function (event) {
						event.preventDefault();
					});

					_moveTopBottom( first_index, last_index, velocity, o.dbkey );

					first_index += velocity;
					last_index += velocity;
					num_top_items -= velocity;

					/* Unset prevent touch event */
					$( document ).unbind( "touchstart.virtuallist" );
				}
			} else if ( direction == SCROLL_UP ) {
				if ( cur_num_top_itmes <= o.page_buf ) {
					if ( first_index < velocity ) {
						velocity = first_index;
					}

					/* Prevent scroll touch event while DOM access */
					$( document ).bind( "touchstart.virtuallist", function ( event ) {
						event.preventDefault();
					});

					_moveBottomTop( first_index, last_index, velocity, o.dbkey );

					first_index -= velocity;
					last_index -= velocity;
					num_top_items += velocity;

					/* Unset prevent touch event */
					$( document ).unbind( "touchstart.virtuallist" );
				}

				if ( first_index < o.page_buf ) {
					num_top_items = first_index;
				}
			}
		},

		recreate: function ( newArray ) {
			var t = this,
				o = this.options;

			$( o.id ).empty();

			TOTAL_ITEMS = newArray.length;
			direction = NO_SCROLL;
			first_index = 0;
			last_index = o.row - 1;

			t._pushData( ( o.template ), newArray );

			if (o.childSelector == " ul" ) {
				$( o.id + " ul" ).swipelist();
			}

			$( o.id ).virtuallistview();

			t._reposition( o );

			t.refresh( true );
		},

		_initList: function () {
			var t = this,
				o = this.options;

			/* After AJAX loading success */
			o.dbtable = t.element.data( "dbtable" );

			TOTAL_ITEMS = $(window[o.dbtable]).size();

			/* Make Gen list by template */
			t._pushData( (o.template), window[o.dbtable]);

			$( o.id ).parentsUntil( ".ui-page" ).parent().one( "pageshow", o, t._reposition);

			/* Scrollview */
			$( document ).bind( "scrollstop.virtuallist", t.options, t._scrollmove );

			$( window ).bind( "resize.virtuallist", t._resize );

			if ( o.childSelector == " ul" ) {
				$( o.id + " ul" ).swipelist();
			}

			t.refresh( true );
		},

		create: function () {
			var o = this.options;

			/* external API for AJAX callback */
			this._create( "create" );

			this._reposition( o );
		},

		_create: function ( event ) {
			var t = this,
				o = this.options,
				$el = this.element,
				shortcutsContainer = $('<div class="ui-virtuallist"/>'),
				shortcutsList = $('<ul></ul>'),
				dividers = $el.find(':jqmData(role="virtuallistview" )'),
				lastListItem = null,
				shortcutscroll = this;

			// create listview markup
			t.element.addClass( function ( i, orig ) {
				return orig + " ui-listview ui-virtual-list-container" + ( t.options.inset ? " ui-listview-inset ui-corner-all ui-shadow " : "" );
			});

			o.id = "#" + $el.attr( "id" );

			$( o.id ).bind( "pagehide", function ( e ) {
				$( o.id ).empty();
			});

			/* Scroll view */
			if ( $( ".ui-scrollview-clip" ).size() > 0 ) {
				o.scrollview = true;
			} else {
				o.scrollview = false;
			}

			/* Init list and page buf */
			if ( $el.data( "row" ) ) {
				o.row = $el.data( "row" );

				if ( o.row < MINIMUM_ROW ) {
					o.row = MINIMUM_ROW;
				}

				o.page_buf = parseInt( ( o.row / 2 ), 10 );
			}

			/* After DB Load complete, Init Vritual list */
			if ( $( o.id ).hasClass( "vlLoadSuccess" ) ) {
				$( o.id ).empty();

				if ( $el.data( "template" ) ) {
					o.template = $el.data( "template" );

					/* to support swipe list, <li> or <ul> can be main node of virtual list. */
					if ( $el.data( "swipelist" ) == true ) {
						o.childSelector = " ul";
					} else {
						o.childSelector = " li";
					}
				}

				/* Set data's unique key */
				if ( $el.data( "dbkey" ) ) {
					o.datakey = $el.data( "dbkey" );
				}

				first_index = 0;			//first id of <li> element.
				last_index = o.row - 1;		//last id of <li> element.

				t._initList();
			}
		},

		destroy : function () {
			var o = this.options;

			$( document ).unbind( "scrollstop" );

			$( window ).unbind( "resize.virtuallist" );

			$( o.id ).empty();
		},

		_itemApply: function ( $list, item ) {
			var $countli = item.find( ".ui-li-count" );

			if ( $countli.length ) {
				item.addClass( "ui-li-has-count" );
			}

			$countli.addClass( "ui-btn-up-" + ( $list.jqmData( "counttheme" ) || this.options.countTheme ) + " ui-btn-corner-all" );

			// TODO class has to be defined in markup
			item.find( "h1, h2, h3, h4, h5, h6" ).addClass( "ui-li-heading" ).end()
				.find( "p, dl" ).addClass( "ui-li-desc" ).end()
				.find( ">img:eq(0), .ui-link-inherit>img:eq(0)" ).addClass( "ui-li-thumb" ).each( function () {
					item.addClass( $( this ).is( ".ui-li-icon" ) ? "ui-li-has-icon" : "ui-li-has-thumb" );
				}).end()
				.find( ".ui-li-aside" ).each(function () {
					var $this = $( this );
					$this.prependTo( $this.parent() ); //shift aside to front for css float
				} );
		},

		_removeCorners: function ( li, which ) {
			var top = "ui-corner-top ui-corner-tr ui-corner-tl",
				bot = "ui-corner-bottom ui-corner-br ui-corner-bl";

			li = li.add( li.find( ".ui-btn-inner, .ui-li-link-alt, .ui-li-thumb" ) );

			if ( which === "top" ) {
				li.removeClass( top );
			} else if ( which === "bottom" ) {
				li.removeClass( bot );
			} else {
				li.removeClass( top + " " + bot );
			}
		},

		_refreshCorners: function ( create ) {
			var $li,
				$visibleli,
				$topli,
				$bottomli;

			if ( this.options.inset ) {
				$li = this.element.children( "li" );
				// at create time the li are not visible yet so we need to rely on .ui-screen-hidden
				$visibleli = create ? $li.not( ".ui-screen-hidden" ) : $li.filter( ":visible" );

				this._removeCorners( $li );

				// Select the first visible li element
				$topli = $visibleli.first()
					.addClass( "ui-corner-top" );

				$topli.add( $topli.find( ".ui-btn-inner" ) )
					.find( ".ui-li-link-alt" )
						.addClass( "ui-corner-tr" )
					.end()
					.find( ".ui-li-thumb" )
						.not( ".ui-li-icon" )
						.addClass( "ui-corner-tl" );

				// Select the last visible li element
				$bottomli = $visibleli.last()
					.addClass( "ui-corner-bottom" );

				$bottomli.add( $bottomli.find( ".ui-btn-inner" ) )
					.find( ".ui-li-link-alt" )
						.addClass( "ui-corner-br" )
					.end()
					.find( ".ui-li-thumb" )
						.not( ".ui-li-icon" )
						.addClass( "ui-corner-bl" );
			}
		},

		refresh: function ( create ) {
			this.parentPage = this.element.closest( ".ui-page" );
			this._createSubPages();

			var o = this.options,
				$list = this.element,
				self = this,
				dividertheme = $list.jqmData( "dividertheme" ) || o.dividerTheme,
				listsplittheme = $list.jqmData( "splittheme" ),
				listspliticon = $list.jqmData( "spliticon" ),
				li = $list.children( "li" ),
				counter = $.support.cssPseudoElement || !$.nodeName( $list[ 0 ], "ol" ) ? 0 : 1,
				item,
				itemClass,
				temTheme,
				a,
				last,
				splittheme,
				countParent,
				icon,
				pos,
				numli,
				itemTheme;

			if ( counter ) {
				$list.find( ".ui-li-dec" ).remove();
			}

			for ( pos = 0, numli = li.length; pos < numli; pos++ ) {
				item = li.eq( pos );
				itemClass = "ui-li";

				// If we're creating the element, we update it regardless
				if ( create || !item.hasClass( "ui-li" ) ) {
					itemTheme = item.jqmData( "theme" ) || o.theme;
					a = item.children( "a" );

					if ( a.length ) {
						icon = item.jqmData( "icon" );

						item.buttonMarkup({
							wrapperEls: "div",
							shadow: false,
							corners: false,
							iconpos: "right",
							/* icon: a.length > 1 || icon === false ? false : icon || "arrow-r",*/
							icon: false,	/* Remove unnecessary arrow icon */
							theme: itemTheme
						});

						if ( ( icon != false ) && ( a.length == 1 ) ) {
							item.addClass( "ui-li-has-arrow" );
						}

						a.first().addClass( "ui-link-inherit" );

						if ( a.length > 1 ) {
							itemClass += " ui-li-has-alt";

							last = a.last();
							splittheme = listsplittheme || last.jqmData( "theme" ) || o.splitTheme;

							last.appendTo(item)
								.attr( "title", last.getEncodedText() )
								.addClass( "ui-li-link-alt" )
								.empty()
								.buttonMarkup({
									shadow: false,
									corners: false,
									theme: itemTheme,
									icon: false,
									iconpos: false
								})
								.find( ".ui-btn-inner" )
								.append(
									$( "<span />" ).buttonMarkup({
										shadow: true,
										corners: true,
										theme: splittheme,
										iconpos: "notext",
										icon: listspliticon || last.jqmData( "icon" ) || o.splitIcon
									})
								);
						}
					} else if ( item.jqmData( "role" ) === "list-divider" ) {

						itemClass += " ui-li-divider ui-btn ui-bar-" + dividertheme;
						item.attr( "role", "heading" );

						//reset counter when a divider heading is encountered
						if ( counter ) {
							counter = 1;
						}

					} else {
						itemClass += " ui-li-static ui-body-" + itemTheme;
					}
				}

				if ( counter && itemClass.indexOf( "ui-li-divider" ) < 0 ) {
					countParent = item.is( ".ui-li-static:first" ) ? item : item.find( ".ui-link-inherit" );

					countParent.addClass( "ui-li-jsnumbering" )
						.prepend( "<span class='ui-li-dec'>" + (counter++) + ". </span>" );
				}

				item.add( item.children( ".ui-btn-inner" ) ).addClass( itemClass );

				self._itemApply( $list, item );
			}

			this._refreshCorners( create );
		},

		//create a string for ID/subpage url creation
		_idStringEscape: function ( str ) {
			return str.replace(/\W/g , "-");
		},

		_createSubPages: function () {
			var parentList = this.element,
				parentPage = parentList.closest( ".ui-page" ),
				parentUrl = parentPage.jqmData( "url" ),
				parentId = parentUrl || parentPage[ 0 ][ $.expando ],
				parentListId = parentList.attr( "id" ),
				o = this.options,
				dns = "data-" + $.mobile.ns,
				self = this,
				persistentFooterID = parentPage.find( ":jqmData(role='footer')" ).jqmData( "id" ),
				hasSubPages,
				newRemove;

			if ( typeof listCountPerPage[ parentId ] === "undefined" ) {
				listCountPerPage[ parentId ] = -1;
			}

			parentListId = parentListId || ++listCountPerPage[ parentId ];

			$( parentList.find( "li>ul, li>ol" ).toArray().reverse() ).each(function ( i ) {
				var self = this,
					list = $( this ),
					listId = list.attr( "id" ) || parentListId + "-" + i,
					parent = list.parent(),
					nodeEls,
					title = nodeEls.first().getEncodedText(),//url limits to first 30 chars of text
					id = ( parentUrl || "" ) + "&" + $.mobile.subPageUrlKey + "=" + listId,
					theme = list.jqmData( "theme" ) || o.theme,
					countTheme = list.jqmData( "counttheme" ) || parentList.jqmData( "counttheme" ) || o.countTheme,
					newPage,
					anchor;

				nodeEls = $( list.prevAll().toArray().reverse() );
				nodeEls = nodeEls.length ? nodeEls : $( "<span>" + $.trim( parent.contents()[ 0 ].nodeValue ) + "</span>" );

				//define hasSubPages for use in later removal
				hasSubPages = true;

				newPage = list.detach()
							.wrap( "<div " + dns + "role='page' " +	dns + "url='" + id + "' " + dns + "theme='" + theme + "' " + dns + "count-theme='" + countTheme + "'><div " + dns + "role='content'></div></div>" )
							.parent()
								.before( "<div " + dns + "role='header' " + dns + "theme='" + o.headerTheme + "'><div class='ui-title'>" + title + "</div></div>" )
								.after( persistentFooterID ? $( "<div " + dns + "role='footer' " + dns + "id='" + persistentFooterID + "'>" ) : "" )
								.parent()
								.appendTo( $.mobile.pageContainer );

				newPage.page();

				anchor = parent.find('a:first');

				if ( !anchor.length ) {
					anchor = $( "<a/>" ).html( nodeEls || title ).prependTo( parent.empty() );
				}

				anchor.attr( "href", "#" + id );

			}).virtuallistview();

			// on pagehide, remove any nested pages along with the parent page, as long as they aren't active
			// and aren't embedded
			if ( hasSubPages &&
						parentPage.is( ":jqmData(external-page='true')" ) &&
						parentPage.data( "page" ).options.domCache === false ) {

				newRemove = function ( e, ui ) {
					var nextPage = ui.nextPage, npURL;

					if ( ui.nextPage ) {
						npURL = nextPage.jqmData( "url" );
						if ( npURL.indexOf( parentUrl + "&" + $.mobile.subPageUrlKey ) !== 0 ) {
							self.childPages().remove();
							parentPage.remove();
						}
					}
				};

				// unbind the original page remove and replace with our specialized version
				parentPage
					.unbind( "pagehide.remove" )
					.bind( "pagehide.remove", newRemove );
			}
		},

		// TODO sort out a better way to track sub pages of the virtuallistview this is brittle
		childPages: function () {
			var parentUrl = this.parentPage.jqmData( "url" );

			return $( ":jqmData(url^='" +  parentUrl + "&" + $.mobile.subPageUrlKey + "')" );
		}
	});

	//auto self-init widgets
	$( document ).bind( "pagecreate create", function ( e ) {
		$( $.tizen.virtuallistview.prototype.options.initSelector, e.target ).virtuallistview();
	});

} ( jQuery ) );
/*!
 * Globalize
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 */

(function( window, undefined ) {

var Globalize,
	// private variables
	regexHex,
	regexInfinity,
	regexParseFloat,
	regexTrim,
	// private JavaScript utility functions
	arrayIndexOf,
	endsWith,
	extend,
	isArray,
	isFunction,
	isObject,
	startsWith,
	trim,
	truncate,
	zeroPad,
	// private Globalization utility functions
	appendPreOrPostMatch,
	expandFormat,
	formatDate,
	formatNumber,
	getTokenRegExp,
	getEra,
	getEraYear,
	parseExact,
	parseNegativePattern;

// Global variable (Globalize) or CommonJS module (globalize)
Globalize = function( cultureSelector ) {
	return new Globalize.prototype.init( cultureSelector );
};

if ( typeof require !== "undefined"
	&& typeof exports !== "undefined"
	&& typeof module !== "undefined" ) {
	// Assume CommonJS
	module.exports = Globalize;
} else {
	// Export as global variable
	window.Globalize = Globalize;
}

Globalize.cultures = {};

Globalize.prototype = {
	constructor: Globalize,
	init: function( cultureSelector ) {
		this.cultures = Globalize.cultures;
		this.cultureSelector = cultureSelector;

		return this;
	}
};
Globalize.prototype.init.prototype = Globalize.prototype;

// 1.	 When defining a culture, all fields are required except the ones stated as optional.
// 2.	 Each culture should have a ".calendars" object with at least one calendar named "standard"
//		 which serves as the default calendar in use by that culture.
// 3.	 Each culture should have a ".calendar" object which is the current calendar being used,
//		 it may be dynamically changed at any time to one of the calendars in ".calendars".
Globalize.cultures[ "default" ] = {
	// A unique name for the culture in the form <language code>-<country/region code>
	name: "en",
	// the name of the culture in the english language
	englishName: "English",
	// the name of the culture in its own language
	nativeName: "English",
	// whether the culture uses right-to-left text
	isRTL: false,
	// "language" is used for so-called "specific" cultures.
	// For example, the culture "es-CL" means "Spanish, in Chili".
	// It represents the Spanish-speaking culture as it is in Chili,
	// which might have different formatting rules or even translations
	// than Spanish in Spain. A "neutral" culture is one that is not
	// specific to a region. For example, the culture "es" is the generic
	// Spanish culture, which may be a more generalized version of the language
	// that may or may not be what a specific culture expects.
	// For a specific culture like "es-CL", the "language" field refers to the
	// neutral, generic culture information for the language it is using.
	// This is not always a simple matter of the string before the dash.
	// For example, the "zh-Hans" culture is netural (Simplified Chinese).
	// And the "zh-SG" culture is Simplified Chinese in Singapore, whose lanugage
	// field is "zh-CHS", not "zh".
	// This field should be used to navigate from a specific culture to it's
	// more general, neutral culture. If a culture is already as general as it
	// can get, the language may refer to itself.
	language: "en",
	// numberFormat defines general number formatting rules, like the digits in
	// each grouping, the group separator, and how negative numbers are displayed.
	numberFormat: {
		// [negativePattern]
		// Note, numberFormat.pattern has no "positivePattern" unlike percent and currency,
		// but is still defined as an array for consistency with them.
		//   negativePattern: one of "(n)|-n|- n|n-|n -"
		pattern: [ "-n" ],
		// number of decimal places normally shown
		decimals: 2,
		// string that separates number groups, as in 1,000,000
		",": ",",
		// string that separates a number from the fractional portion, as in 1.99
		".": ".",
		// array of numbers indicating the size of each number group.
		// TODO: more detailed description and example
		groupSizes: [ 3 ],
		// symbol used for positive numbers
		"+": "+",
		// symbol used for negative numbers
		"-": "-",
		// symbol used for NaN (Not-A-Number)
		NaN: "NaN",
		// symbol used for Negative Infinity
		negativeInfinity: "-Infinity",
		// symbol used for Positive Infinity
		positiveInfinity: "Infinity",
		percent: {
			// [negativePattern, positivePattern]
			//   negativePattern: one of "-n %|-n%|-%n|%-n|%n-|n-%|n%-|-% n|n %-|% n-|% -n|n- %"
			//   positivePattern: one of "n %|n%|%n|% n"
			pattern: [ "-n %", "n %" ],
			// number of decimal places normally shown
			decimals: 2,
			// array of numbers indicating the size of each number group.
			// TODO: more detailed description and example
			groupSizes: [ 3 ],
			// string that separates number groups, as in 1,000,000
			",": ",",
			// string that separates a number from the fractional portion, as in 1.99
			".": ".",
			// symbol used to represent a percentage
			symbol: "%"
		},
		currency: {
			// [negativePattern, positivePattern]
			//   negativePattern: one of "($n)|-$n|$-n|$n-|(n$)|-n$|n-$|n$-|-n $|-$ n|n $-|$ n-|$ -n|n- $|($ n)|(n $)"
			//   positivePattern: one of "$n|n$|$ n|n $"
			pattern: [ "($n)", "$n" ],
			// number of decimal places normally shown
			decimals: 2,
			// array of numbers indicating the size of each number group.
			// TODO: more detailed description and example
			groupSizes: [ 3 ],
			// string that separates number groups, as in 1,000,000
			",": ",",
			// string that separates a number from the fractional portion, as in 1.99
			".": ".",
			// symbol used to represent currency
			symbol: "$"
		}
	},
	// calendars defines all the possible calendars used by this culture.
	// There should be at least one defined with name "standard", and is the default
	// calendar used by the culture.
	// A calendar contains information about how dates are formatted, information about
	// the calendar's eras, a standard set of the date formats,
	// translations for day and month names, and if the calendar is not based on the Gregorian
	// calendar, conversion functions to and from the Gregorian calendar.
	calendars: {
		standard: {
			// name that identifies the type of calendar this is
			name: "Gregorian_USEnglish",
			// separator of parts of a date (e.g. "/" in 11/05/1955)
			"/": "/",
			// separator of parts of a time (e.g. ":" in 05:44 PM)
			":": ":",
			// the first day of the week (0 = Sunday, 1 = Monday, etc)
			firstDay: 0,
			days: {
				// full day names
				names: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
				// abbreviated day names
				namesAbbr: [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ],
				// shortest day names
				namesShort: [ "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa" ]
			},
			months: {
				// full month names (13 months for lunar calendards -- 13th month should be "" if not lunar)
				names: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", "" ],
				// abbreviated month names
				namesAbbr: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "" ]
			},
			// AM and PM designators in one of these forms:
			// The usual view, and the upper and lower case versions
			//   [ standard, lowercase, uppercase ]
			// The culture does not use AM or PM (likely all standard date formats use 24 hour time)
			//   null
			AM: [ "AM", "am", "AM" ],
			PM: [ "PM", "pm", "PM" ],
			eras: [
				// eras in reverse chronological order.
				// name: the name of the era in this culture (e.g. A.D., C.E.)
				// start: when the era starts in ticks (gregorian, gmt), null if it is the earliest supported era.
				// offset: offset in years from gregorian calendar
				{
					"name": "A.D.",
					"start": null,
					"offset": 0
				}
			],
			// when a two digit year is given, it will never be parsed as a four digit
			// year greater than this year (in the appropriate era for the culture)
			// Set it as a full year (e.g. 2029) or use an offset format starting from
			// the current year: "+19" would correspond to 2029 if the current year 2010.
			twoDigitYearMax: 2029,
			// set of predefined date and time patterns used by the culture
			// these represent the format someone in this culture would expect
			// to see given the portions of the date that are shown.
			patterns: {
				// short date pattern
				d: "M/d/yyyy",
				// long date pattern
				D: "dddd, MMMM dd, yyyy",
				// short time pattern
				t: "h:mm tt",
				// long time pattern
				T: "h:mm:ss tt",
				// long date, short time pattern
				f: "dddd, MMMM dd, yyyy h:mm tt",
				// long date, long time pattern
				F: "dddd, MMMM dd, yyyy h:mm:ss tt",
				// month/day pattern
				M: "MMMM dd",
				// month/year pattern
				Y: "yyyy MMMM",
				// S is a sortable format that does not vary by culture
				S: "yyyy\u0027-\u0027MM\u0027-\u0027dd\u0027T\u0027HH\u0027:\u0027mm\u0027:\u0027ss"
			}
			// optional fields for each calendar:
			/*
			monthsGenitive:
				Same as months but used when the day preceeds the month.
				Omit if the culture has no genitive distinction in month names.
				For an explaination of genitive months, see http://blogs.msdn.com/michkap/archive/2004/12/25/332259.aspx
			convert:
				Allows for the support of non-gregorian based calendars. This convert object is used to
				to convert a date to and from a gregorian calendar date to handle parsing and formatting.
				The two functions:
					fromGregorian( date )
						Given the date as a parameter, return an array with parts [ year, month, day ]
						corresponding to the non-gregorian based year, month, and day for the calendar.
					toGregorian( year, month, day )
						Given the non-gregorian year, month, and day, return a new Date() object
						set to the corresponding date in the gregorian calendar.
			*/
		}
	},
	// For localized strings
	messages: {}
};

Globalize.cultures[ "default" ].calendar = Globalize.cultures[ "default" ].calendars.standard;

Globalize.cultures[ "en" ] = Globalize.cultures[ "default" ];

Globalize.cultureSelector = "en";

//
// private variables
//

regexHex = /^0x[a-f0-9]+$/i;
regexInfinity = /^[+-]?infinity$/i;
regexParseFloat = /^[+-]?\d*\.?\d*(e[+-]?\d+)?$/;
regexTrim = /^\s+|\s+$/g;

//
// private JavaScript utility functions
//

arrayIndexOf = function( array, item ) {
	if ( array.indexOf ) {
		return array.indexOf( item );
	}
	for ( var i = 0, length = array.length; i < length; i++ ) {
		if ( array[i] === item ) {
			return i;
		}
	}
	return -1;
};

endsWith = function( value, pattern ) {
	return value.substr( value.length - pattern.length ) === pattern;
};

extend = function( deep ) {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !isFunction(target) ) {
		target = {};
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( isObject(copy) || (copyIsArray = isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && isArray(src) ? src : [];

					} else {
						clone = src && isObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

isArray = Array.isArray || function( obj ) {
	return Object.prototype.toString.call( obj ) === "[object Array]";
};

isFunction = function( obj ) {
	return Object.prototype.toString.call( obj ) === "[object Function]";
};

isObject = function( obj ) {
	return Object.prototype.toString.call( obj ) === "[object Object]";
};

startsWith = function( value, pattern ) {
	return value.indexOf( pattern ) === 0;
};

trim = function( value ) {
	return ( value + "" ).replace( regexTrim, "" );
};

truncate = function( value ) {
	if ( isNaN( value ) ) {
		return NaN;
	}
	return Math[ value < 0 ? "ceil" : "floor" ]( value );
};

zeroPad = function( str, count, left ) {
	var l;
	for ( l = str.length; l < count; l += 1 ) {
		str = ( left ? ("0" + str) : (str + "0") );
	}
	return str;
};

//
// private Globalization utility functions
//

appendPreOrPostMatch = function( preMatch, strings ) {
	// appends pre- and post- token match strings while removing escaped characters.
	// Returns a single quote count which is used to determine if the token occurs
	// in a string literal.
	var quoteCount = 0,
		escaped = false;
	for ( var i = 0, il = preMatch.length; i < il; i++ ) {
		var c = preMatch.charAt( i );
		switch ( c ) {
			case "\'":
				if ( escaped ) {
					strings.push( "\'" );
				}
				else {
					quoteCount++;
				}
				escaped = false;
				break;
			case "\\":
				if ( escaped ) {
					strings.push( "\\" );
				}
				escaped = !escaped;
				break;
			default:
				strings.push( c );
				escaped = false;
				break;
		}
	}
	return quoteCount;
};

expandFormat = function( cal, format ) {
	// expands unspecified or single character date formats into the full pattern.
	format = format || "F";
	var pattern,
		patterns = cal.patterns,
		len = format.length;
	if ( len === 1 ) {
		pattern = patterns[ format ];
		if ( !pattern ) {
			throw "Invalid date format string \'" + format + "\'.";
		}
		format = pattern;
	}
	else if ( len === 2 && format.charAt(0) === "%" ) {
		// %X escape format -- intended as a custom format string that is only one character, not a built-in format.
		format = format.charAt( 1 );
	}
	return format;
};

formatDate = function( value, format, culture ) {
	var cal = culture.calendar,
		convert = cal.convert;

	if ( !format || !format.length || format === "i" ) {
		var ret;
		if ( culture && culture.name.length ) {
			if ( convert ) {
				// non-gregorian calendar, so we cannot use built-in toLocaleString()
				ret = formatDate( value, cal.patterns.F, culture );
			}
			else {
				var eraDate = new Date( value.getTime() ),
					era = getEra( value, cal.eras );
				eraDate.setFullYear( getEraYear(value, cal, era) );
				ret = eraDate.toLocaleString();
			}
		}
		else {
			ret = value.toString();
		}
		return ret;
	}

	var eras = cal.eras,
		sortable = format === "s";
	format = expandFormat( cal, format );

	// Start with an empty string
	ret = [];
	var hour,
		zeros = [ "0", "00", "000" ],
		foundDay,
		checkedDay,
		dayPartRegExp = /([^d]|^)(d|dd)([^d]|$)/g,
		quoteCount = 0,
		tokenRegExp = getTokenRegExp(),
		converted;

	function padZeros( num, c ) {
		var r, s = num + "";
		if ( c > 1 && s.length < c ) {
			r = ( zeros[c - 2] + s);
			return r.substr( r.length - c, c );
		}
		else {
			r = s;
		}
		return r;
	}

	function hasDay() {
		if ( foundDay || checkedDay ) {
			return foundDay;
		}
		foundDay = dayPartRegExp.test( format );
		checkedDay = true;
		return foundDay;
	}

	function getPart( date, part ) {
		if ( converted ) {
			return converted[ part ];
		}
		switch ( part ) {
			case 0: return date.getFullYear();
			case 1: return date.getMonth();
			case 2: return date.getDate();
		}
	}

	if ( !sortable && convert ) {
		converted = convert.fromGregorian( value );
	}

	for ( ; ; ) {
		// Save the current index
		var index = tokenRegExp.lastIndex,
			// Look for the next pattern
			ar = tokenRegExp.exec( format );

		// Append the text before the pattern (or the end of the string if not found)
		var preMatch = format.slice( index, ar ? ar.index : format.length );
		quoteCount += appendPreOrPostMatch( preMatch, ret );

		if ( !ar ) {
			break;
		}

		// do not replace any matches that occur inside a string literal.
		if ( quoteCount % 2 ) {
			ret.push( ar[0] );
			continue;
		}

		var current = ar[ 0 ],
			clength = current.length;

		switch ( current ) {
			case "ddd":
				//Day of the week, as a three-letter abbreviation
			case "dddd":
				// Day of the week, using the full name
				var names = ( clength === 3 ) ? cal.days.namesAbbr : cal.days.names;
				ret.push( names[value.getDay()] );
				break;
			case "d":
				// Day of month, without leading zero for single-digit days
			case "dd":
				// Day of month, with leading zero for single-digit days
				foundDay = true;
				ret.push(
					padZeros( getPart(value, 2), clength )
				);
				break;
			case "MMM":
				// Month, as a three-letter abbreviation
			case "MMMM":
				// Month, using the full name
				var part = getPart( value, 1 );
				ret.push(
					( cal.monthsGenitive && hasDay() )
					?
					cal.monthsGenitive[ clength === 3 ? "namesAbbr" : "names" ][ part ]
					:
					cal.months[ clength === 3 ? "namesAbbr" : "names" ][ part ]
				);
				break;
			case "M":
				// Month, as digits, with no leading zero for single-digit months
			case "MM":
				// Month, as digits, with leading zero for single-digit months
				ret.push(
					padZeros( getPart(value, 1) + 1, clength )
				);
				break;
			case "y":
				// Year, as two digits, but with no leading zero for years less than 10
			case "yy":
				// Year, as two digits, with leading zero for years less than 10
			case "yyyy":
				// Year represented by four full digits
				part = converted ? converted[ 0 ] : getEraYear( value, cal, getEra(value, eras), sortable );
				if ( clength < 4 ) {
					part = part % 100;
				}
				ret.push(
					padZeros( part, clength )
				);
				break;
			case "h":
				// Hours with no leading zero for single-digit hours, using 12-hour clock
			case "hh":
				// Hours with leading zero for single-digit hours, using 12-hour clock
				hour = value.getHours() % 12;
				if ( hour === 0 ) hour = 12;
				ret.push(
					padZeros( hour, clength )
				);
				break;
			case "H":
				// Hours with no leading zero for single-digit hours, using 24-hour clock
			case "HH":
				// Hours with leading zero for single-digit hours, using 24-hour clock
				ret.push(
					padZeros( value.getHours(), clength )
				);
				break;
			case "m":
				// Minutes with no leading zero for single-digit minutes
			case "mm":
				// Minutes with leading zero for single-digit minutes
				ret.push(
					padZeros( value.getMinutes(), clength )
				);
				break;
			case "s":
				// Seconds with no leading zero for single-digit seconds
			case "ss":
				// Seconds with leading zero for single-digit seconds
				ret.push(
					padZeros( value.getSeconds(), clength )
				);
				break;
			case "t":
				// One character am/pm indicator ("a" or "p")
			case "tt":
				// Multicharacter am/pm indicator
				part = value.getHours() < 12 ? ( cal.AM ? cal.AM[0] : " " ) : ( cal.PM ? cal.PM[0] : " " );
				ret.push( clength === 1 ? part.charAt(0) : part );
				break;
			case "f":
				// Deciseconds
			case "ff":
				// Centiseconds
			case "fff":
				// Milliseconds
				ret.push(
					padZeros( value.getMilliseconds(), 3 ).substr( 0, clength )
				);
				break;
			case "z":
				// Time zone offset, no leading zero
			case "zz":
				// Time zone offset with leading zero
				hour = value.getTimezoneOffset() / 60;
				ret.push(
					( hour <= 0 ? "+" : "-" ) + padZeros( Math.floor(Math.abs(hour)), clength )
				);
				break;
			case "zzz":
				// Time zone offset with leading zero
				hour = value.getTimezoneOffset() / 60;
				ret.push(
					( hour <= 0 ? "+" : "-" ) + padZeros( Math.floor(Math.abs(hour)), 2 )
					// Hard coded ":" separator, rather than using cal.TimeSeparator
					// Repeated here for consistency, plus ":" was already assumed in date parsing.
					+ ":" + padZeros( Math.abs(value.getTimezoneOffset() % 60), 2 )
				);
				break;
			case "g":
			case "gg":
				if ( cal.eras ) {
					ret.push(
						cal.eras[ getEra(value, eras) ].name
					);
				}
				break;
		case "/":
			ret.push( cal["/"] );
			break;
		default:
			throw "Invalid date format pattern \'" + current + "\'.";
			break;
		}
	}
	return ret.join( "" );
};

// formatNumber
(function() {
	var expandNumber;

	expandNumber = function( number, precision, formatInfo ) {
		var groupSizes = formatInfo.groupSizes,
			curSize = groupSizes[ 0 ],
			curGroupIndex = 1,
			factor = Math.pow( 10, precision ),
			rounded = Math.round( number * factor ) / factor;

		if ( !isFinite(rounded) ) {
			rounded = number;
		}
		number = rounded;

		var numberString = number+"",
			right = "",
			split = numberString.split( /e/i ),
			exponent = split.length > 1 ? parseInt( split[1], 10 ) : 0;
		numberString = split[ 0 ];
		split = numberString.split( "." );
		numberString = split[ 0 ];
		right = split.length > 1 ? split[ 1 ] : "";

		var l;
		if ( exponent > 0 ) {
			right = zeroPad( right, exponent, false );
			numberString += right.slice( 0, exponent );
			right = right.substr( exponent );
		}
		else if ( exponent < 0 ) {
			exponent = -exponent;
			numberString = zeroPad( numberString, exponent + 1 );
			right = numberString.slice( -exponent, numberString.length ) + right;
			numberString = numberString.slice( 0, -exponent );
		}

		if ( precision > 0 ) {
			right = formatInfo[ "." ] +
				( (right.length > precision) ? right.slice(0, precision) : zeroPad(right, precision) );
		}
		else {
			right = "";
		}

		var stringIndex = numberString.length - 1,
			sep = formatInfo[ "," ],
			ret = "";

		while ( stringIndex >= 0 ) {
			if ( curSize === 0 || curSize > stringIndex ) {
				return numberString.slice( 0, stringIndex + 1 ) + ( ret.length ? (sep + ret + right) : right );
			}
			ret = numberString.slice( stringIndex - curSize + 1, stringIndex + 1 ) + ( ret.length ? (sep + ret) : "" );

			stringIndex -= curSize;

			if ( curGroupIndex < groupSizes.length ) {
				curSize = groupSizes[ curGroupIndex ];
				curGroupIndex++;
			}
		}

		return numberString.slice( 0, stringIndex + 1 ) + sep + ret + right;
	};

	formatNumber = function( value, format, culture ) {
		if ( !isFinite(value) ) {
			if ( value === Infinity ) {
				return culture.numberFormat.positiveInfinity;
			}
			if ( value === -Infinity ) {
				return culture.numberFormat.negativeInfinity;
			}
			return culture.numberFormat.NaN;
		}
		if ( !format || format === "i" ) {
			return culture.name.length ? value.toLocaleString() : value.toString();
		}
		format = format || "D";

		var nf = culture.numberFormat,
			number = Math.abs( value ),
			precision = -1,
			pattern;
		if ( format.length > 1 ) precision = parseInt( format.slice(1), 10 );

		var current = format.charAt( 0 ).toUpperCase(),
			formatInfo;

		switch ( current ) {
			case "D":
				pattern = "n";
				number = truncate( number );
				if ( precision !== -1 ) {
					number = zeroPad( "" + number, precision, true );
				}
				if ( value < 0 ) number = "-" + number;
				break;
			case "N":
				formatInfo = nf;
				// fall through
			case "C":
				formatInfo = formatInfo || nf.currency;
				// fall through
			case "P":
				formatInfo = formatInfo || nf.percent;
				pattern = value < 0 ? formatInfo.pattern[ 0 ] : ( formatInfo.pattern[1] || "n" );
				if ( precision === -1 ) precision = formatInfo.decimals;
				number = expandNumber( number * (current === "P" ? 100 : 1), precision, formatInfo );
				break;
			default:
				throw "Bad number format specifier: " + current;
		}

		var patternParts = /n|\$|-|%/g,
			ret = "";
		for ( ; ; ) {
			var index = patternParts.lastIndex,
				ar = patternParts.exec( pattern );

			ret += pattern.slice( index, ar ? ar.index : pattern.length );

			if ( !ar ) {
				break;
			}

			switch ( ar[0] ) {
				case "n":
					ret += number;
					break;
				case "$":
					ret += nf.currency.symbol;
					break;
				case "-":
					// don't make 0 negative
					if ( /[1-9]/.test(number) ) {
						ret += nf[ "-" ];
					}
					break;
				case "%":
					ret += nf.percent.symbol;
					break;
			}
		}

		return ret;
	};

}());

getTokenRegExp = function() {
	// regular expression for matching date and time tokens in format strings.
	return /\/|dddd|ddd|dd|d|MMMM|MMM|MM|M|yyyy|yy|y|hh|h|HH|H|mm|m|ss|s|tt|t|fff|ff|f|zzz|zz|z|gg|g/g;
};

getEra = function( date, eras ) {
	if ( !eras ) return 0;
	var start, ticks = date.getTime();
	for ( var i = 0, l = eras.length; i < l; i++ ) {
		start = eras[ i ].start;
		if ( start === null || ticks >= start ) {
			return i;
		}
	}
	return 0;
};

getEraYear = function( date, cal, era, sortable ) {
	var year = date.getFullYear();
	if ( !sortable && cal.eras ) {
		// convert normal gregorian year to era-shifted gregorian
		// year by subtracting the era offset
		year -= cal.eras[ era ].offset;
	}
	return year;
};

// parseExact
(function() {
	var expandYear,
		getDayIndex,
		getMonthIndex,
		getParseRegExp,
		outOfRange,
		toUpper,
		toUpperArray;

	expandYear = function( cal, year ) {
		// expands 2-digit year into 4 digits.
		if ( year < 100 ) {
			var now = new Date(),
				era = getEra( now ),
				curr = getEraYear( now, cal, era ),
				twoDigitYearMax = cal.twoDigitYearMax;
			twoDigitYearMax = typeof twoDigitYearMax === "string" ? new Date().getFullYear() % 100 + parseInt( twoDigitYearMax, 10 ) : twoDigitYearMax;
			year += curr - ( curr % 100 );
			if ( year > twoDigitYearMax ) {
				year -= 100;
			}
		}
		return year;
	};

	getDayIndex = function	( cal, value, abbr ) {
		var ret,
			days = cal.days,
			upperDays = cal._upperDays;
		if ( !upperDays ) {
			cal._upperDays = upperDays = [
				toUpperArray( days.names ),
				toUpperArray( days.namesAbbr ),
				toUpperArray( days.namesShort )
			];
		}
		value = toUpper( value );
		if ( abbr ) {
			ret = arrayIndexOf( upperDays[1], value );
			if ( ret === -1 ) {
				ret = arrayIndexOf( upperDays[2], value );
			}
		}
		else {
			ret = arrayIndexOf( upperDays[0], value );
		}
		return ret;
	};

	getMonthIndex = function( cal, value, abbr ) {
		var months = cal.months,
			monthsGen = cal.monthsGenitive || cal.months,
			upperMonths = cal._upperMonths,
			upperMonthsGen = cal._upperMonthsGen;
		if ( !upperMonths ) {
			cal._upperMonths = upperMonths = [
				toUpperArray( months.names ),
				toUpperArray( months.namesAbbr )
			];
			cal._upperMonthsGen = upperMonthsGen = [
				toUpperArray( monthsGen.names ),
				toUpperArray( monthsGen.namesAbbr )
			];
		}
		value = toUpper( value );
		var i = arrayIndexOf( abbr ? upperMonths[1] : upperMonths[0], value );
		if ( i < 0 ) {
			i = arrayIndexOf( abbr ? upperMonthsGen[1] : upperMonthsGen[0], value );
		}
		return i;
	};

	getParseRegExp = function( cal, format ) {
		// converts a format string into a regular expression with groups that
		// can be used to extract date fields from a date string.
		// check for a cached parse regex.
		var re = cal._parseRegExp;
		if ( !re ) {
			cal._parseRegExp = re = {};
		}
		else {
			var reFormat = re[ format ];
			if ( reFormat ) {
				return reFormat;
			}
		}

		// expand single digit formats, then escape regular expression characters.
		var expFormat = expandFormat( cal, format ).replace( /([\^\$\.\*\+\?\|\[\]\(\)\{\}])/g, "\\\\$1" ),
			regexp = [ "^" ],
			groups = [],
			index = 0,
			quoteCount = 0,
			tokenRegExp = getTokenRegExp(),
			match;

		// iterate through each date token found.
		while ( (match = tokenRegExp.exec(expFormat)) !== null ) {
			var preMatch = expFormat.slice( index, match.index );
			index = tokenRegExp.lastIndex;

			// don't replace any matches that occur inside a string literal.
			quoteCount += appendPreOrPostMatch( preMatch, regexp );
			if ( quoteCount % 2 ) {
				regexp.push( match[0] );
				continue;
			}

			// add a regex group for the token.
			var m = match[ 0 ],
				len = m.length,
				add;
			switch ( m ) {
				case "dddd": case "ddd":
				case "MMMM": case "MMM":
				case "gg": case "g":
					add = "(\\D+)";
					break;
				case "tt": case "t":
					add = "(\\D*)";
					break;
				case "yyyy":
				case "fff":
				case "ff":
				case "f":
					add = "(\\d{" + len + "})";
					break;
				case "dd": case "d":
				case "MM": case "M":
				case "yy": case "y":
				case "HH": case "H":
				case "hh": case "h":
				case "mm": case "m":
				case "ss": case "s":
					add = "(\\d\\d?)";
					break;
				case "zzz":
					add = "([+-]?\\d\\d?:\\d{2})";
					break;
				case "zz": case "z":
					add = "([+-]?\\d\\d?)";
					break;
				case "/":
					add = "(\\" + cal[ "/" ] + ")";
					break;
				default:
					throw "Invalid date format pattern \'" + m + "\'.";
					break;
			}
			if ( add ) {
				regexp.push( add );
			}
			groups.push( match[0] );
		}
		appendPreOrPostMatch( expFormat.slice(index), regexp );
		regexp.push( "$" );

		// allow whitespace to differ when matching formats.
		var regexpStr = regexp.join( "" ).replace( /\s+/g, "\\s+" ),
			parseRegExp = { "regExp": regexpStr, "groups": groups };

		// cache the regex for this format.
		return re[ format ] = parseRegExp;
	};

	outOfRange = function( value, low, high ) {
		return value < low || value > high;
	};

	toUpper = function( value ) {
		// "he-IL" has non-breaking space in weekday names.
		return value.split( "\u00A0" ).join( " " ).toUpperCase();
	};

	toUpperArray = function( arr ) {
		var results = [];
		for ( var i = 0, l = arr.length; i < l; i++ ) {
			results[ i ] = toUpper( arr[i] );
		}
		return results;
	};

	parseExact = function( value, format, culture ) {
		// try to parse the date string by matching against the format string
		// while using the specified culture for date field names.
		value = trim( value );
		var cal = culture.calendar,
			// convert date formats into regular expressions with groupings.
			// use the regexp to determine the input format and extract the date fields.
			parseInfo = getParseRegExp( cal, format ),
			match = new RegExp( parseInfo.regExp ).exec( value );
		if ( match === null ) {
			return null;
		}
		// found a date format that matches the input.
		var groups = parseInfo.groups,
			era = null, year = null, month = null, date = null, weekDay = null,
			hour = 0, hourOffset, min = 0, sec = 0, msec = 0, tzMinOffset = null,
			pmHour = false;
		// iterate the format groups to extract and set the date fields.
		for ( var j = 0, jl = groups.length; j < jl; j++ ) {
			var matchGroup = match[ j + 1 ];
			if ( matchGroup ) {
				var current = groups[ j ],
					clength = current.length,
					matchInt = parseInt( matchGroup, 10 );
				switch ( current ) {
					case "dd": case "d":
						// Day of month.
						date = matchInt;
						// check that date is generally in valid range, also checking overflow below.
						if ( outOfRange(date, 1, 31) ) return null;
						break;
					case "MMM": case "MMMM":
						month = getMonthIndex( cal, matchGroup, clength === 3 );
						if ( outOfRange(month, 0, 11) ) return null;
						break;
					case "M": case "MM":
						// Month.
						month = matchInt - 1;
						if ( outOfRange(month, 0, 11) ) return null;
						break;
					case "y": case "yy":
					case "yyyy":
						year = clength < 4 ? expandYear( cal, matchInt ) : matchInt;
						if ( outOfRange(year, 0, 9999) ) return null;
						break;
					case "h": case "hh":
						// Hours (12-hour clock).
						hour = matchInt;
						if ( hour === 12 ) hour = 0;
						if ( outOfRange(hour, 0, 11) ) return null;
						break;
					case "H": case "HH":
						// Hours (24-hour clock).
						hour = matchInt;
						if ( outOfRange(hour, 0, 23) ) return null;
						break;
					case "m": case "mm":
						// Minutes.
						min = matchInt;
						if ( outOfRange(min, 0, 59) ) return null;
						break;
					case "s": case "ss":
						// Seconds.
						sec = matchInt;
						if ( outOfRange(sec, 0, 59) ) return null;
						break;
					case "tt": case "t":
						// AM/PM designator.
						// see if it is standard, upper, or lower case PM. If not, ensure it is at least one of
						// the AM tokens. If not, fail the parse for this format.
						pmHour = cal.PM && ( matchGroup === cal.PM[0] || matchGroup === cal.PM[1] || matchGroup === cal.PM[2] );
						if (
							!pmHour && (
								!cal.AM || ( matchGroup !== cal.AM[0] && matchGroup !== cal.AM[1] && matchGroup !== cal.AM[2] )
							)
						) return null;
						break;
					case "f":
						// Deciseconds.
					case "ff":
						// Centiseconds.
					case "fff":
						// Milliseconds.
						msec = matchInt * Math.pow( 10, 3 - clength );
						if ( outOfRange(msec, 0, 999) ) return null;
						break;
					case "ddd":
						// Day of week.
					case "dddd":
						// Day of week.
						weekDay = getDayIndex( cal, matchGroup, clength === 3 );
						if ( outOfRange(weekDay, 0, 6) ) return null;
						break;
					case "zzz":
						// Time zone offset in +/- hours:min.
						var offsets = matchGroup.split( /:/ );
						if ( offsets.length !== 2 ) return null;
						hourOffset = parseInt( offsets[0], 10 );
						if ( outOfRange(hourOffset, -12, 13) ) return null;
						var minOffset = parseInt( offsets[1], 10 );
						if ( outOfRange(minOffset, 0, 59) ) return null;
						tzMinOffset = ( hourOffset * 60 ) + ( startsWith(matchGroup, "-") ? -minOffset : minOffset );
						break;
					case "z": case "zz":
						// Time zone offset in +/- hours.
						hourOffset = matchInt;
						if ( outOfRange(hourOffset, -12, 13) ) return null;
						tzMinOffset = hourOffset * 60;
						break;
					case "g": case "gg":
						var eraName = matchGroup;
						if ( !eraName || !cal.eras ) return null;
						eraName = trim( eraName.toLowerCase() );
						for ( var i = 0, l = cal.eras.length; i < l; i++ ) {
							if ( eraName === cal.eras[i].name.toLowerCase() ) {
								era = i;
								break;
							}
						}
						// could not find an era with that name
						if ( era === null ) return null;
						break;
				}
			}
		}
		var result = new Date(), defaultYear, convert = cal.convert;
		defaultYear = convert ? convert.fromGregorian( result )[ 0 ] : result.getFullYear();
		if ( year === null ) {
			year = defaultYear;
		}
		else if ( cal.eras ) {
			// year must be shifted to normal gregorian year
			// but not if year was not specified, its already normal gregorian
			// per the main if clause above.
			year += cal.eras[( era || 0 )].offset;
		}
		// set default day and month to 1 and January, so if unspecified, these are the defaults
		// instead of the current day/month.
		if ( month === null ) {
			month = 0;
		}
		if ( date === null ) {
			date = 1;
		}
		// now have year, month, and date, but in the culture's calendar.
		// convert to gregorian if necessary
		if ( convert ) {
			result = convert.toGregorian( year, month, date );
			// conversion failed, must be an invalid match
			if ( result === null ) return null;
		}
		else {
			// have to set year, month and date together to avoid overflow based on current date.
			result.setFullYear( year, month, date );
			// check to see if date overflowed for specified month (only checked 1-31 above).
			if ( result.getDate() !== date ) return null;
			// invalid day of week.
			if ( weekDay !== null && result.getDay() !== weekDay ) {
				return null;
			}
		}
		// if pm designator token was found make sure the hours fit the 24-hour clock.
		if ( pmHour && hour < 12 ) {
			hour += 12;
		}
		result.setHours( hour, min, sec, msec );
		if ( tzMinOffset !== null ) {
			// adjust timezone to utc before applying local offset.
			var adjustedMin = result.getMinutes() - ( tzMinOffset + result.getTimezoneOffset() );
			// Safari limits hours and minutes to the range of -127 to 127.	 We need to use setHours
			// to ensure both these fields will not exceed this range.	adjustedMin will range
			// somewhere between -1440 and 1500, so we only need to split this into hours.
			result.setHours( result.getHours() + parseInt(adjustedMin / 60, 10), adjustedMin % 60 );
		}
		return result;
	};
}());

parseNegativePattern = function( value, nf, negativePattern ) {
	var neg = nf[ "-" ],
		pos = nf[ "+" ],
		ret;
	switch ( negativePattern ) {
		case "n -":
			neg = " " + neg;
			pos = " " + pos;
			// fall through
		case "n-":
			if ( endsWith(value, neg) ) {
				ret = [ "-", value.substr(0, value.length - neg.length) ];
			}
			else if ( endsWith(value, pos) ) {
				ret = [ "+", value.substr(0, value.length - pos.length) ];
			}
			break;
		case "- n":
			neg += " ";
			pos += " ";
			// fall through
		case "-n":
			if ( startsWith(value, neg) ) {
				ret = [ "-", value.substr(neg.length) ];
			}
			else if ( startsWith(value, pos) ) {
				ret = [ "+", value.substr(pos.length) ];
			}
			break;
		case "(n)":
			if ( startsWith(value, "(") && endsWith(value, ")") ) {
				ret = [ "-", value.substr(1, value.length - 2) ];
			}
			break;
	}
	return ret || [ "", value ];
};

//
// public instance functions
//

Globalize.prototype.findClosestCulture = function( cultureSelector ) {
	return Globalize.findClosestCulture.call( this, cultureSelector );
};

Globalize.prototype.format = function( value, format, cultureSelector ) {
	return Globalize.format.call( this, value, format, cultureSelector );
};

Globalize.prototype.localize = function( key, cultureSelector ) {
	return Globalize.localize.call( this, key, cultureSelector );
};

Globalize.prototype.parseInt = function( value, radix, cultureSelector ) {
	return Globalize.parseInt.call( this, value, radix, cultureSelector );
};

Globalize.prototype.parseFloat = function( value, radix, cultureSelector ) {
	return Globalize.parseFloat.call( this, value, radix, cultureSelector );
};

Globalize.prototype.culture = function( cultureSelector ) {
	return Globalize.culture.call( this, cultureSelector );
};

//
// public singleton functions
//

Globalize.addCultureInfo = function( cultureName, baseCultureName, info ) {

	var base = {},
		isNew = false;

	if ( typeof cultureName !== "string" ) {
		// cultureName argument is optional string. If not specified, assume info is first
		// and only argument. Specified info deep-extends current culture.
		info = cultureName;
		cultureName = this.culture().name;
		base = this.cultures[ cultureName ];
	} else if ( typeof baseCultureName !== "string" ) {
		// baseCultureName argument is optional string. If not specified, assume info is second
		// argument. Specified info deep-extends specified culture.
		// If specified culture does not exist, create by deep-extending default
		info = baseCultureName;
		isNew = ( this.cultures[ cultureName ] == null );
		base = this.cultures[ cultureName ] || this.cultures[ "default" ];
	} else {
		// cultureName and baseCultureName specified. Assume a new culture is being created
		// by deep-extending an specified base culture
		isNew = true;
		base = this.cultures[ baseCultureName ];
	}

	this.cultures[ cultureName ] = extend(true, {},
		base,
		info
	);
	// Make the standard calendar the current culture if it's a new culture
	if ( isNew ) {
		this.cultures[ cultureName ].calendar = this.cultures[ cultureName ].calendars.standard;
	}
};

Globalize.findClosestCulture = function( name ) {
	var match;
	if ( !name ) {
		return this.findClosestCulture( this.cultureSelector ) || this.cultures[ "default" ];
	}
	if ( typeof name === "string" ) {
		name = name.split( "," );
	}
	if ( isArray(name) ) {
		var lang,
			cultures = this.cultures,
			list = name,
			i, l = list.length,
			prioritized = [];
		for ( i = 0; i < l; i++ ) {
			name = trim( list[i] );
			var pri, parts = name.split( ";" );
			lang = trim( parts[0] );
			if ( parts.length === 1 ) {
				pri = 1;
			}
			else {
				name = trim( parts[1] );
				if ( name.indexOf("q=") === 0 ) {
					name = name.substr( 2 );
					pri = parseFloat( name );
					pri = isNaN( pri ) ? 0 : pri;
				}
				else {
					pri = 1;
				}
			}
			prioritized.push({ lang: lang, pri: pri });
		}
		prioritized.sort(function( a, b ) {
			return a.pri < b.pri ? 1 : -1;
		});

		// exact match
		for ( i = 0; i < l; i++ ) {
			lang = prioritized[ i ].lang;
			match = cultures[ lang ];
			if ( match ) {
				return match;
			}
		}

		// neutral language match
		for ( i = 0; i < l; i++ ) {
			lang = prioritized[ i ].lang;
			do {
				var index = lang.lastIndexOf( "-" );
				if ( index === -1 ) {
					break;
				}
				// strip off the last part. e.g. en-US => en
				lang = lang.substr( 0, index );
				match = cultures[ lang ];
				if ( match ) {
					return match;
				}
			}
			while ( 1 );
		}

		// last resort: match first culture using that language
		for ( i = 0; i < l; i++ ) {
			lang = prioritized[ i ].lang;
			for ( var cultureKey in cultures ) {
				var culture = cultures[ cultureKey ];
				if ( culture.language == lang ) {
					return culture;
				}
			}
		}
	}
	else if ( typeof name === "object" ) {
		return name;
	}
	return match || null;
};

Globalize.format = function( value, format, cultureSelector ) {
	culture = this.findClosestCulture( cultureSelector );
	if ( value instanceof Date ) {
		value = formatDate( value, format, culture );
	}
	else if ( typeof value === "number" ) {
		value = formatNumber( value, format, culture );
	}
	return value;
};

Globalize.localize = function( key, cultureSelector ) {
	return this.findClosestCulture( cultureSelector ).messages[ key ] ||
		this.cultures[ "default" ].messages[ key ];
};

Globalize.parseDate = function( value, formats, culture ) {
	culture = this.findClosestCulture( culture );

	var date, prop, patterns;
	if ( formats ) {
		if ( typeof formats === "string" ) {
			formats = [ formats ];
		}
		if ( formats.length ) {
			for ( var i = 0, l = formats.length; i < l; i++ ) {
				var format = formats[ i ];
				if ( format ) {
					date = parseExact( value, format, culture );
					if ( date ) {
						break;
					}
				}
			}
		}
	} else {
		patterns = culture.calendar.patterns;
		for ( prop in patterns ) {
			date = parseExact( value, patterns[prop], culture );
			if ( date ) {
				break;
			}
		}
	}

	return date || null;
};

Globalize.parseInt = function( value, radix, cultureSelector ) {
	return truncate( Globalize.parseFloat(value, radix, cultureSelector) );
};

Globalize.parseFloat = function( value, radix, cultureSelector ) {
	// radix argument is optional
	if ( typeof radix !== "number" ) {
		cultureSelector = radix;
		radix = 10;
	}

	var culture = this.findClosestCulture( cultureSelector );
	var ret = NaN,
		nf = culture.numberFormat;

	if ( value.indexOf(culture.numberFormat.currency.symbol) > -1 ) {
		// remove currency symbol
		value = value.replace( culture.numberFormat.currency.symbol, "" );
		// replace decimal seperator
		value = value.replace( culture.numberFormat.currency["."], culture.numberFormat["."] );
	}

	// trim leading and trailing whitespace
	value = trim( value );

	// allow infinity or hexidecimal
	if ( regexInfinity.test(value) ) {
		ret = parseFloat( value );
	}
	else if ( !radix && regexHex.test(value) ) {
		ret = parseInt( value, 16 );
	}
	else {

		// determine sign and number
		var signInfo = parseNegativePattern( value, nf, nf.pattern[0] ),
			sign = signInfo[ 0 ],
			num = signInfo[ 1 ];

		// #44 - try parsing as "(n)"
		if ( sign === "" && nf.pattern[0] !== "(n)" ) {
			signInfo = parseNegativePattern( value, nf, "(n)" );
			sign = signInfo[ 0 ];
			num = signInfo[ 1 ];
		}

		// try parsing as "-n"
		if ( sign === "" && nf.pattern[0] !== "-n" ) {
			signInfo = parseNegativePattern( value, nf, "-n" );
			sign = signInfo[ 0 ];
			num = signInfo[ 1 ];
		}

		sign = sign || "+";

		// determine exponent and number
		var exponent,
			intAndFraction,
			exponentPos = num.indexOf( "e" );
		if ( exponentPos < 0 ) exponentPos = num.indexOf( "E" );
		if ( exponentPos < 0 ) {
			intAndFraction = num;
			exponent = null;
		}
		else {
			intAndFraction = num.substr( 0, exponentPos );
			exponent = num.substr( exponentPos + 1 );
		}
		// determine decimal position
		var integer,
			fraction,
			decSep = nf[ "." ],
			decimalPos = intAndFraction.indexOf( decSep );
		if ( decimalPos < 0 ) {
			integer = intAndFraction;
			fraction = null;
		}
		else {
			integer = intAndFraction.substr( 0, decimalPos );
			fraction = intAndFraction.substr( decimalPos + decSep.length );
		}
		// handle groups (e.g. 1,000,000)
		var groupSep = nf[ "," ];
		integer = integer.split( groupSep ).join( "" );
		var altGroupSep = groupSep.replace( /\u00A0/g, " " );
		if ( groupSep !== altGroupSep ) {
			integer = integer.split( altGroupSep ).join( "" );
		}
		// build a natively parsable number string
		var p = sign + integer;
		if ( fraction !== null ) {
			p += "." + fraction;
		}
		if ( exponent !== null ) {
			// exponent itself may have a number patternd
			var expSignInfo = parseNegativePattern( exponent, nf, "-n" );
			p += "e" + ( expSignInfo[0] || "+" ) + expSignInfo[ 1 ];
		}
		if ( regexParseFloat.test(p) ) {
			ret = parseFloat( p );
		}
	}
	return ret;
};

Globalize.culture = function( cultureSelector ) {
	// setter
	if ( typeof cultureSelector !== "undefined" ) {
		this.cultureSelector = cultureSelector;
	}
	// getter
	return this.findClosestCulture( cultureSelector ) || this.culture[ "default" ];
};

}( this ));
/**
 * loader.js : Loader for web-ui-fw
 * Refactored from bootstrap.js
 *
 * By Youmin Ha <youmin.ha@samsung.com>
 *
 */

( function ($, Globalize, window, undefined) {

	window.S = {
		libFileName : "tizen-web-ui-fw(.min)?.js",

		frameworkData : {
			rootDir: '/usr/lib/tizen-web-ui-fw',
			version: '0.1',
			theme: "default",
			viewportScale: false,
		},

		util : {
			loadScriptSync : function ( scriptPath, successCB, errorCB ) {
				$.ajax( {
					url: scriptPath,
					dataType: 'script',
					async: false,
					success: successCB,
					error: function ( jqXHR, textStatus, errorThrown ) {
						if ( errorCB ) {
							errorCB( jqXHR, textStatus, errorThrown );
						} else {
							var ignoreStatusList = [ 404 ];  // 404: not found
							if ( -1 == $.inArray( jqXHR.status, ignoreStatusList ) ) {
								window.alert( 'Error while loading ' + scriptPath + '\n' + jqXHR.status + ':' + jqXHR.statusText );
							} else {
								console.log( 'Error while loading ' + scriptPath + '\n' + jqXHR.status + ':' + jqXHR.statusText );
							}
						}
					}
				} );
			},
			getScaleFactor: function ( ) {
				var factor = window.scale,
					width = 0,
					defaultWidth = 720;

				if ( !factor ) {
					width = screen.width < screen.height ? screen.width : screen.height;
					factor = width / defaultWidth;
					if ( factor > 1 ) {
						// NOTE: some targets(e.g iPad) need to set scale equal or less than 1.0
						factor = 1;
					}
				}
				console.log( "ScaleFactor: " + factor );
				return factor;
			},
			isMobileBrowser: function ( ) {
				var mobileIdx = window.navigator.appVersion.indexOf("Mobile"),
					isMobile = -1 < mobileIdx;
				return isMobile;
			}
		},

		css : {
			cacheBust: ( document.location.href.match( /debug=true/ ) ) ?
					'?cacheBust=' + ( new Date( ) ).getTime( ) :
					'',
			addElementToHead : function ( elem ) {
				var head = document.getElementsByTagName( 'head' )[0];
				head.appendChild( elem );
			},
			load: function ( path ) {
				this.addElementToHead( this.makeLink( path + this.cacheBust ) );
			},
			makeLink : function ( href ) {
				var customstylesheetLink = document.createElement( 'link' );
				customstylesheetLink.setAttribute( 'rel', 'stylesheet' );
				customstylesheetLink.setAttribute( 'href', href );
				return customstylesheetLink;
			}
		},

		getParams: function ( ) {
			/* Get data-* params from <script> tag, and set S.frameworkData.* values
			 * Returns true if proper <script> tag is found, or false if not.
			 */
			// Find current <script> tag element
			var scriptElems = document.getElementsByTagName( 'script' ),
				val = null,
				foundScriptTag = false,
				idx,
				elem,
				src,
				tokens,
				version_idx;
			for ( idx in scriptElems ) {
				elem = scriptElems[idx];
				src = elem.src ? elem.getAttribute( 'src' ) : undefined;
				if (src && src.match( this.libFileName )) {
					// Set framework data, only when they are given.
					tokens = src.split(/[\/\\]/);
					version_idx = -3;
					this.frameworkData.rootDir = elem.getAttribute( 'data-framework-root' )
						|| tokens.slice( 0, tokens.length + version_idx ).join( '/' )
						|| this.frameworkData.rootDir;
					this.frameworkData.version = elem.getAttribute( 'data-framework-version' )
						|| tokens[ tokens.length + version_idx ]
						|| this.frameworkData.version;
					this.frameworkData.theme = elem.getAttribute( 'data-framework-theme' )
						|| this.frameworkData.theme;
					this.frameworkData.viewportScale = "true" === elem.getAttribute( 'data-framework-viewport-scale' ) ? true : this.frameworkData.viewportScale;
					foundScriptTag = true;
					break;
				}
			}
			return foundScriptTag;
		},

		loadTheme: function ( ) {
			var themePath = [
					this.frameworkData.rootDir,
					this.frameworkData.version,
					'themes',
					this.frameworkData.theme
				].join( '/' ),
				cssPath = [themePath, 'tizen-web-ui-fw-theme.css'].join( '/' ),
				jsPath = [themePath, 'theme.js'].join( '/' );

			this.css.load( cssPath );
			this.util.loadScriptSync( jsPath );
		},

		/** Load Globalize culture file, and set default culture.
		 *  @param[in]  language  Language code. ex) en-US, en, ko-KR, ko
		 *                        If language is not given, read language from html 'lang' attribute, or from system setting.
		 */
		loadGlobalizeCulture: function ( language ) {
			function getGlobalizeCultureFile( lang ) {
				return ['globalize.culture.', lang, '.js'].join( '' );
			}
			function getGlobalizeCulturePath( self, file ) {
				return [
					self.frameworkData.rootDir,
					self.frameworkData.version,
					'js',
					'cultures',
					file,
				].join( '/' );
			}

			// Get lang, and change country code to uppercase chars.
			var self = this,
				lang = language
					|| $( 'html' ).attr( 'lang' )
					|| window.navigator.language.split( '.' )[0]	/* Webkit, Safari + workaround for Tizen */
					|| window.navigator.userLanguage	/* IE */
					|| 'en',
				countryCode = null,
				countryCodeIdx = lang.lastIndexOf('-'),
				ignoreCodes = ['Cyrl', 'Latn', 'Mong'],	// Not country code!
				globalizeCultureFile,
				globalizeCulturePath,
				neutralLangIndex;

			if ( countryCodeIdx != -1 ) {	// Found country code!
				countryCode = lang.substr( countryCodeIdx + 1 );
				if ( ignoreCodes.join( '-' ).indexOf( countryCode ) < 0 ) { // countryCode is not found from ignoreCodes
					// Make countryCode to uppercase
					lang = [ lang.substr( 0, countryCodeIdx ), countryCode.toUpperCase( ) ].join( '-' );
				}
			}

			globalizeCultureFile = getGlobalizeCultureFile( lang );
			globalizeCulturePath = getGlobalizeCulturePath( self, globalizeCultureFile );
			neutralLangIndex = lang.lastIndexOf( '-' );

			// Run culture script
			console.log( 'Run globalize culture: ' + globalizeCulturePath );
			this.util.loadScriptSync(
				globalizeCulturePath,
				null,
				function ( jqXHR, textStatus, errorThrown ) {	// Failed to load!
					if ( jqXHR.status == 404 ) {
						// If culture file is not found, run neutral language culture. 
						// (e.g. en-US --> en)
						if ( neutralLangIndex != -1 ) {
							var neutralLang = lang.substr( 0, neutralLangIndex ),
								neutralCultureFile = getGlobalizeCultureFile( neutralLang ),
								neutralCulturePath = getGlobalizeCulturePath( self, neutralCultureFile );
							console.log( 'Run globalize culture of neutral lang: ' + neutralCulturePath );
							self.util.loadScriptSync( neutralCulturePath );
						}
					} else {
						window.alert( 'Error while loading ' + globalizeCulturePath + '\n' + jqXHR.status + ':' + jqXHR.statusText );
					}
				}
			);
			return lang;
		},
		setGlobalize: function ( ) {
			var lang = this.loadGlobalizeCulture( );

			// Set culture
			// NOTE: It is not needed to set with neutral lang. 
			//       Globalize automatically deals with it.
			Globalize.culture( lang );
		},

		/** Set viewport meta tag for mobile devices.
		 *
		 * @param[in]	viewportWidth	Viewport width. 'device-dpi' is also allowed.
		 * @param[in]	useAutoScale	If true, calculate & use scale factor. otherwise, scale factor is 1.
		 * @param[in]	useDeviceDpi	If true, add 'target-densityDpi=device-dpi' to viewport meta content.
		 */
		setViewport: function ( viewportWidth, useAutoScale, useDeviceDpi ) {
			var meta,
				scale = 1,
				head;
			// Do nothing if viewport setting code is already in the code.
			$( "meta" ).each( function ( ) {
				if ( $( this ).attr( "name" ) === "viewport" ) {
					console.log( "User set viewport... framework viewport will not be applied." );
					meta = this;
					return;
				}
			});

			// Set meta tag
			meta = document.createElement( "meta" );
			if ( meta ) {
				scale = useAutoScale ? this.util.getScaleFactor( ) : scale;
				meta.name = "viewport";
				meta.content = "width=" + viewportWidth + ", initial-scale=" + scale + ", maximum-scale=" + scale + ", user-scalable=0";
				if ( useDeviceDpi ) {
					meta.content += ", target-densityDpi=device-dpi";
				}
				console.log( meta.content );
				head = document.getElementsByTagName( 'head' ).item( 0 );
				head.insertBefore( meta, head.firstChild );
			}
		},

		/**	Read body's font-size, scale it, and reset it.
		 *  param[in]	desired font-size / base font-size.
		 */
		scaleBaseFontSize: function ( themeDefaultFontSize, ratio ) {
			var scaledFontSize = Math.round( themeDefaultFontSize * ratio );
			$( '.ui-mobile' ).css( { 'font-size': scaledFontSize + "px" } );
			$( '.ui-mobile').children( 'body' ).css( { 'font-size': scaledFontSize + "px" } );
		},

		setScaling: function ( ) {
			var baseWidth = 720,		// NOTE: need to be changed to get the value from theme.
				standardWidth = 360,
				themeDefaultFontSize = parseInt( $( 'body' ).css( 'font-size' ), 10 );
			$( 'body' ).attr( 'data-tizen-theme-default-font-size', themeDefaultFontSize );

			if ( this.frameworkData.viewportScale ) {
				// Use viewport scaling with base font-size
				// NOTE: No font-size setting is needed.
				this.setViewport( baseWidth, true, true );
			} else {
				// Fixed viewport scale(=1.0) with scaled font size
				this.setViewport( "device-dpi", false, undefined );
				this.scaleBaseFontSize( themeDefaultFontSize, parseFloat( standardWidth / baseWidth ) );
			}
		}
	};
} ( jQuery, window.Globalize, window ) );


// Loader's job list
( function ( S, $, undefined ) {
	S.getParams( );
	S.loadTheme( );
	S.setGlobalize( );

	// Turn off JQM's auto initialization option.
	// NOTE: This job must be done before domready.
	$.mobile.autoInitializePage = false;

	$(document).ready( function ( ) {
		S.setScaling( );
		$.mobile.initializePage( );
	});
} ( window.S, jQuery ) );
