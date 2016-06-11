#target illustrator
#targetengine main

// https://forums.adobe.com/message/4088886#4088886
// https://forums.adobe.com/message/6938075
// https://forums.adobe.com/message/4892320
// https://forums.adobe.com/message/8364913

var idoc = app.activeDocument;


var w = new Window(
	'dialog',
	'Nudge Gradient',
	/*
	[
		100,
		100,
		440,
		440
	],
	*/
	undefined,
	{
		closeButton: true
	}
);
w.size = [220, 220];

var b = w.add(
	'iconbutton',
	{
		x: 0,
		y: 0,
		width: 45,
		height: 45
	},
	File('~/Dropbox (Personal)/projects/gradient/images/ui-02.png'),
	{
		style: 'toolbutton'
	}
);

b.onClick = function() {
	var ipath =  idoc.selection[0];
	var fillColor = ipath.fillColor;
	var fillColorMatrix = fillColor.matrix
	// Before: 1,0,0,1,0,0
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
	ipath.filled = false; // remove previous gradient transformations, to be able to apply new ones ??
	ipath.fillColor = fillColor; // re apply the same gradient color, without transformations.
	ipath.fillOverprint = ipath.fillOverprint; // without this, the gradient won't move or scale, but it does rotate ??
	fillColor = ipath.fillColor;
	fillColorMatrix = fillColor.matrix
	ipath.translate(
		fillColorMatrix.mValueTX + -0.5, // deltaX
		fillColorMatrix.mValueTY + 0.5, // deltaY
		false, // transformObjects
		false, // transformFillPatterns
		true, // transformFillGradents
		false // transformStrokePattern
	);
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
	app.redraw();
};


w.show();
