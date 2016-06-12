/* jshint laxbreak:true, -W043 */
/* globals app, $, BridgeTalk */

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
	
	_private.document = $application.activeDocument;
	
	_private.increment = 0.5; // Make sure always positive, not zero.
	
	/**
	 * Create UI window.
	 *
	 * @param {string} title Title for window.
	 * @return {Window} Illustrator `Window` object.
	 */
	
	_private.createWindow = function(title) {
		
		var dialog = new Window(
			'dialog',
			title,
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
		
		var group = dialog.add('group');
		group.spacing = 0;
		group.margins = 0;
		
		var buttonW = group.add(
			'button',
			[0, 0, 30, 30],
			'W'
		);
		
		var buttonNW = group.add(
			'button',
			[0, 0, 30, 30],
			'NW'
		);
		
		var buttonN = group.add(
			'button',
			[0, 0, 30, 30],
			'N'
		);
		
		var buttonNE = group.add(
			'button',
			[0, 0, 30, 30],
			'NE'
		);
		
		var buttonE = group.add(
			'button',
			[0, 0, 30, 30],
			'E'
		);
		
		var buttonSE = group.add(
			'button',
			[0, 0, 30, 30],
			'SE'
		);
		
		var buttonS = group.add(
			'button',
			[0, 0, 30, 30],
			'S'
		);
		
		var buttonSW = group.add(
			'button',
			[0, 0, 30, 30],
			'SW'
		);
		
		/*
		W  x-1 y0
		NW x-1 y-1
		N  x0 y-1
		NE x1 y-1
		E  x1 y0
		SE x1 y1
		S  x0 y1
		SW x-1 y1
		*/
		
		buttonW.onClick = function() {
			
			_private.nudgeGradient({ x: -1, y: 0 }, _private.increment);
			
		};
		
		var group2 = dialog.add('group');
		group2.margins = 0;
		group2.spacing = 5;
		
		group2.orientation = 'row';
		group2.alignChildren = 'left';
		
		var panel = group2.add('panel');
		panel.orientation = 'row';
		panel.spacing = 5;
		panel.margins = 5;
		
		var statictext = panel.add(
			'statictext',
			undefined,
			'Increment: '
		);
		
		var edittext = panel.add(
			'edittext',
			undefined,
			_private.increment
		);
		
		edittext.characters = 5;
		
		edittext.onChange = function() {
			
			_private.increment = parseFloat(edittext.text);
			
		};
		
		var statictext2 = panel.add(
			'statictext',
			undefined,
			'pts'
		);
		
		group2.add('button', undefined, 'Close', {
			name: 'ok'
		});
		
		dialog.layout.layout();
		
		return dialog;
		
	};
	
	_private.nudgeGradient = function(direction, increment) {
		
		var doc = _private.document;
		var ipath =  doc.selection[0];
		var fillColor = ipath.fillColor;
		var fillColorMatrix = fillColor.matrix;
		var x = fillColorMatrix.mValueTX;
		var y = fillColorMatrix.mValueTY;
			
			//alert(ipath.fillColor.matrix.mValueTX +  ' ' + ipath.fillColor.matrix.mValueTY)
			// Before: 1,0,0,1,0,0
			/*
			$.writeln(
				'Before: ',
				fillColorMatrix.mValueA,
				',',
				fillColorMatrix.mValueB,
				',',
				fillColorMatrix.mValueC,
				',',
				fillColorMatrix.mValueD,
				',',
				fillColorMatrix.mValueTX,
				',',
				fillColorMatrix.mValueTY
			);
			$.writeln();
			*/
		
			ipath.filled = false; // remove previous gradient transformations, to be able to apply new ones ??
			ipath.fillColor = fillColor; // re apply the same gradient color, without transformations.
			ipath.fillOverprint = ipath.fillOverprint; // without this, the gradient won't move or scale, but it does rotate ??
			
			ipath.translate(
				_private.getTranslate(x, increment, direction.x), // deltaX
				_private.getTranslate(y, increment, direction.y), // deltaY
				false, // transformObjects
				false, // transformFillPatterns
				true, // transformFillGradents
				false // transformStrokePattern
			);
			
			/*
			// After: 1,0,0,1,-0.5,0.5
			$.writeln(
				'After: ',
				fillColorMatrix.mValueA,
				',',
				fillColorMatrix.mValueB,
				',',
				fillColorMatrix.mValueC,
				',',
				fillColorMatrix.mValueD,
				',',
				fillColorMatrix.mValueTX,
				',',
				fillColorMatrix.mValueTY
			);
			*/
			app.redraw();
		
	};
	
	_private.getTranslate = function(matrix, increment, direction) {
		
		var result = matrix;
		
		//$.writeln(matrix, ' ', increment, ' ', direction);
		//        0.5          0.5             -1
		//        0.5          0.5              0
		
		if (direction !== 0) {
			
			result = ((Math.abs(matrix) + increment) * direction);
			
		}
		
		return result;
		
	}
	
	// Script setup, if coming through the “front door”:
	_private.init = function(title) {
		
		var dialog;
		
		// Open document(s)?
		if ($application.documents.length > 0) {
			
			// Make dialog window:
			dialog = _private.createWindow(title);
			
			// Center and show the dialog window:
			dialog.center();
			dialog.show();
			
		} else {
			
			// Nope, let the user know what they did wrong:
			alert('You must open at least one document.');
			
		}
		
	};
	
	// Public API:
	return {
		init: function(args) {
			
			// First time through, fire-up the palette window:
			_private.init(args.title);
			
		}
	};
	
})(app, $);

NUDGE.init({
	title: 'Nudge Gradient'
});

// Done!
