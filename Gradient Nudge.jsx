/* jshint laxbreak:true, -W043 */
/* globals app, $ */

// jshint ignore:start
#target illustrator
// jshint ignore:end

// https://forums.adobe.com/message/4088886#4088886
// https://forums.adobe.com/message/6938075
// https://forums.adobe.com/message/4892320
// https://forums.adobe.com/message/8364913

var NUDGE = (function($application, $helper, undefined) {
	
	// Private variable container object:
	var _private = {};
	
	// Active filled object path selection:
	_private.selection;
	
	// Floating point number, used as “nudge” value for gradient fill:
	_private.increment;
	
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
			
			_private.increment = parseFloat(text2.text);
			
		};
		
		// Center and show the dialog window:
		dialog.center();
		dialog.show();
		
	};
	
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
	
	// Script setup, if coming through the “front door”:
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
