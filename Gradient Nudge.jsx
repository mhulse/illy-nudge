/* jshint laxbreak:true, -W043 */
/* globals app, $ */

// @@@BUILDINFO@@@ Gradient Nudge.jsx !Version! Sat Jun 11 2016 22:21:56 GMT-0700

// https://forums.adobe.com/message/4088886#4088886
// https://forums.adobe.com/message/6938075
// https://forums.adobe.com/message/4892320
// https://forums.adobe.com/message/8364913

// jshint ignore:start
#target illustrator
// jshint ignore:end

var NUDGE = (function($application, $helper, undefined) {
	
	// Private variable container object:
	var _private = {};
	
	// Active filled object path selection:
	_private.selection = undefined;
	
	// Floating point number, used as “nudge” value for gradient fill:
	_private.increment = undefined;
	
	/**
	 * Create UI window.
	 *
	 * @param {string} title Title for window.
	 * @return {Window} Illustrator `Window` object.
	 */
	
	_private.createWindow = function(title) {
		
		var dialog;
		var group1;
		var group2;
		var button1;
		var panel1;
		var text1;
		var text2;
		var text3;
		var buttonW;
		var buttonNW;
		var buttonN;
		var buttonNE;
		var buttonE;
		var buttonSE;
		var buttonS;
		var buttonSW;
		var buttonReset;
		
		dialog = new Window(
			'dialog',
			title
			/*
			[100, 100, 440, 440],
			undefined,
			{
				borderless: true,
				closeButton: false
			}
			*/
		);
		//dialog.size = [220, 220];
		
		dialog.orientation = 'column';
		dialog.alignChildren = 'top';
		dialog.margins = 5; // Horizontal spacing!
		dialog.spacing = 5; // Vertical spacing!
		
		group1 = dialog.add('group');
		group1.spacing = 0;
		group1.margins = 0;
		
		buttonW = group1.add(
			'button',
			[0, 0, 30, 30],
			'W'
		);
		
		buttonNW = group1.add(
			'button',
			[0, 0, 30, 30],
			'NW'
		);
		
		buttonN = group1.add(
			'button',
			[0, 0, 30, 30],
			'N'
		);
		
		buttonNE = group1.add(
			'button',
			[0, 0, 30, 30],
			'NE'
		);
		
		buttonE = group1.add(
			'button',
			[0, 0, 30, 30],
			'E'
		);
		
		buttonSE = group1.add(
			'button',
			[0, 0, 30, 30],
			'SE'
		);
		
		buttonS = group1.add(
			'button',
			[0, 0, 30, 30],
			'S'
		);
		
		buttonSW = group1.add(
			'button',
			[0, 0, 30, 30],
			'SW'
		);
		
		buttonReset = group1.add(
			'button',
			[0, 0, 30, 30],
			'X'
		);
		
		group2 = dialog.add('group');
		group2.margins = 0;
		group2.spacing = 5;
		group2.orientation = 'row';
		group2.alignChildren = 'left';
		
		panel1 = group2.add('panel');
		panel1.orientation = 'row';
		panel1.spacing = 5;
		panel1.margins = 5;
		
		text1 = panel1.add(
			'statictext',
			undefined,
			'Increment: '
		);
		
		text2 = panel1.add(
			'edittext',
			undefined,
			_private.increment
		);
		text2.characters = 5;
		
		text3 = panel1.add(
			'statictext',
			undefined,
			'pts'
		);
		
		button1 = group2.add('button', undefined, 'Close', {
			name: 'ok'
		});
		
		//     +y
		//      |
		// -x ––+–– +x
		//      |
		//     -y
		//
		//  W = x-1, y 0
		// NW = x-1, y 1
		//  N = x 0, y 1
		// NE = x 1, y 1
		//  E = x 1, y 0
		// SE = x 1, y-1
		//  S = x 0, y-1
		// SW = x-1, y-1
		
		buttonW.onClick = function() {
			
			_private.nudgeGradient({ x: -1, y: 0 }, _private.increment);
			
		};
		
		buttonNW.onClick = function() {
			
			_private.nudgeGradient({ x: -1, y: 1 }, _private.increment);
			
		};
		
		buttonN.onClick = function() {
			
			_private.nudgeGradient({ x: 0, y: 1 }, _private.increment);
			
		};
		
		buttonNE.onClick = function() {
			
			_private.nudgeGradient({ x: 1, y: 1 }, _private.increment);
			
		};
		
		buttonE.onClick = function() {
			
			_private.nudgeGradient({ x: 1, y: 0 }, _private.increment);
			
		};
		
		buttonSE.onClick = function() {
			
			_private.nudgeGradient({ x: 1, y: -1 }, _private.increment);
			
		};
		
		buttonS.onClick = function() {
			
			_private.nudgeGradient({ x: 0, y: -1 }, _private.increment);
			
		};
		
		buttonSW.onClick = function() {
			
			_private.nudgeGradient({ x: -1, y: -1 }, _private.increment);
			
		};
		
		buttonReset.onClick = function() {
			
			_private.resetGradient(true);
			
		};
		
		text2.onChange = function() {
			
			var input = text2.text;
			
			// Make sure the user’s input is a valid number:
			if (_private.isNumber(input)) {
				
				// Use the user’s input for the increment value:
				_private.increment = parseFloat(input);
				
			} else {
				
				// Reset the input text to the default increment value:
				text2.text = _private.increment;
				
			}
			
		};
		
		// Center and show the dialog window:
		dialog.center();
		dialog.show();
		
	};
	
	/**
	 * Updates the gradient’s translation.
	 *
	 * @see https://forums.adobe.com/message/8796411
	 *
	 * @param {object} direction Object with `x` and `y` keys containing any of: `-1`, `0`, `1`.
	 * @param {number} increment Number used ot adjust travel distance of selected object’s gradient fill.
	 * @return {void}
	 */
	
	_private.nudgeGradient = function(direction, increment) {
		
		var ipath = _private.selection;
		var matrix = ipath.fillColor.matrix;
		
		// Reset gradient so we can translate it:
		_private.resetGradient();
		
		// Transate the gradient fill:
		ipath.translate(
			_private.getTranslate(matrix.mValueTX, increment, direction.x), // deltaX
			_private.getTranslate(matrix.mValueTY, increment, direction.y), // deltaY
			false, // transformObjects
			false, // transformFillPatterns
			true, // transformFillGradents
			false // transformStrokePattern
		);
		
		// Redraw Illustrator so we can see the gradient update:
		$application.redraw();
		
	};
	
	/**
	 * Resets object’s gradient fill to default translation (without transformations).
	 *
	 * @param {boolean} redraw Boolean option used to redraw the application if so desired.
	 * @return {void}
	 */
	
	_private.resetGradient = function(redraw) {
		
		var ipath = _private.selection;
		var fillColor = ipath.fillColor;
		
		// Remove previous gradient transformations, to be able to apply new ones:
		ipath.filled = false;
		// Reapply the same gradient color, without transformations:
		ipath.fillColor = fillColor;
		// Without this, the gradient won’t move or scale (but, oddly, it does rotate):
		ipath.fillOverprint = ipath.fillOverprint;
		
		// Redraw Illustrator?
		if (redraw) {
			
			// Redraw Illustrator so we can see the gradient update:
			$application.redraw();
			
		}
		
	};
	
	/**
	 * Determine translation number for `x` and `y` gradient translation.
	 * @param {number} matrix A single matrix value.
	 * @param {number} increment Increment amount to apply to gradient translation.
	 * @param {number} direction Direction of translation.
	 * @return {number} Gradient’s translation number.
	 */
	
	_private.getTranslate = function(matrix, increment, direction) {
		
		// Default to matrix:
		var result = matrix;
		
		//$helper.writeln(matrix, ' ', increment, ' ', direction);
		//        0.5          0.5             -1
		//        0.5          0.5              0
		
		// Ignore zero values:
		if (direction !== 0) {
			
			// Add increment to matrix in desired direction:
			result = (result + (increment * direction));
			
		}
		
		return result;
		
	};
	
	/**
	 * Validate value as number.
	 *
	 * @param {mixed} value Value to validate as a number.
	 * @return {boolean} If number is valid.
	 */
	
	_private.isNumber = function(value) {
		
		return (( ! isNaN(parseFloat(value))) && isFinite(value));
		
	};
	
	/**
	 * Script setup.
	 *
	 * @param {string} title Title used for the, in this case, dialog window.
	 * @return {void}
	 */
	
	_private.init = function(title) {
		
		// Open document(s)?
		if ($application.documents.length > 0) {
			
			// Get user’s selection:
			_private.selection = $application.activeDocument.selection[0];
			
			// Selection?
			if (_private.selection) {
				
				// Make and show the dialog window:
				_private.createWindow(title);
				
			} else {
				
				// Nope, let the user know what they did wrong:
				alert('You must select a filled path object.');
				
			}
			
		} else {
			
			// Nope, let the user know what they did wrong:
			alert('You must open at least one document.');
			
		}
		
	};
	
	// Public API:
	return {
		init: function(defaults) {
			
			// Initialize the default increment value:
			_private.increment = defaults.increment;
			
			// First time through, fire-up the palette window:
			_private.init(defaults.title);
			
		}
	};
	
})(app, $);

NUDGE.init({
	title: 'Nudge Gradient',
	increment: 0.5
});

// Done!
