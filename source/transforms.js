'use strict';

var _ = require('lodash');
var convert = require('./conversions');
var css = require('./css-keywords');
var marginKeywords = css.marginKeywords.concat(css.globalKeywords);
var a = require('./adjustments');
var getLineboxAdjustment = a.getLineboxAdjustment;

function getAdjustedLonghand(p, options) {
    return getCalc(p.fontSize, p.lineHeight, getLineboxAdjustment(p.fontFamily, p.fontWeight, p.adjustment, options), p.existing);
}

function getShorthandWithAdjustedTop(p, options) {
    var m = p.margin;
    var index = getIndex(m);
    var topLineboxAdjustment = getLineboxAdjustment(p.fontFamily, p.fontWeight, p.topAdjustment, options);
    var calcTopByTopAdjustmentAndTopValue = getCalc(p.fontSize, p.lineHeight, topLineboxAdjustment, m.top);

    return join(index, [
        [calcTopByTopAdjustmentAndTopValue, m.top,  m.top],
        [calcTopByTopAdjustmentAndTopValue, m.right, m.top],
        [calcTopByTopAdjustmentAndTopValue, m.right, m.bottom],
        [calcTopByTopAdjustmentAndTopValue, m.right, m.bottom, m.left]
    ]);
}

function getIndex(m) {
    if (m.left === m.right) {
        if (m.top === m.bottom) {
            if (m.top === m.right) {
                return 0;
            }
            return 1;
        }
        return 2;
    }
    return 3;
}

function getShorthandWithAdjustedBottom(p, options) {
    var m = p.margin;
    var index = getIndex(m);
    var bottomLineboxAdjustment = getLineboxAdjustment(p.fontFamily, p.fontWeight, p.bottomAdjustment, options);
    var calcBottomByBottomAdjustmentAndTopValue = getCalc(p.fontSize, p.lineHeight, bottomLineboxAdjustment, m.top);
    var calcBottomByBottomAdjustmentAndBottomValue = getCalc(p.fontSize, p.lineHeight, bottomLineboxAdjustment, m.bottom);

    return join(index, [
        [m.top, m.top, calcBottomByBottomAdjustmentAndTopValue],
        [m.top, m.right, calcBottomByBottomAdjustmentAndTopValue],
        [m.top, m.right, calcBottomByBottomAdjustmentAndBottomValue],
        [m.top, m.right, calcBottomByBottomAdjustmentAndBottomValue, m.left]
    ]);
}

function getShorthandWithAdjustedTopAndBottom(p, options) {
    var m = p.margin;
    var index = getIndex(m);
    var topLineboxAdjustment = getLineboxAdjustment(p.fontFamily, p.fontWeight, p.topAdjustment, options);
    var bottomLineboxAdjustment = getLineboxAdjustment(p.fontFamily, p.fontWeight, p.bottomAdjustment, options);
    var calcTopByTopAdjustmentAndTopValue = getCalc(p.fontSize, p.lineHeight, topLineboxAdjustment, m.top);
    var calcBottomByBottomAdjustmentAndTopValue = getCalc(p.fontSize, p.lineHeight, bottomLineboxAdjustment, m.top);
    var calcBottomByBottomAdjustmentAndBottomValue = getCalc(p.fontSize, p.lineHeight, bottomLineboxAdjustment, m.bottom);

    return join(index, [
        [calcTopByTopAdjustmentAndTopValue, m.top, calcBottomByBottomAdjustmentAndTopValue],
        [calcTopByTopAdjustmentAndTopValue, m.right, calcBottomByBottomAdjustmentAndTopValue],
        [calcTopByTopAdjustmentAndTopValue, m.right, calcBottomByBottomAdjustmentAndBottomValue],
        [calcTopByTopAdjustmentAndTopValue, m.right, calcBottomByBottomAdjustmentAndBottomValue, m.left]
    ]);
}

function getCalc(fontSize, lineHeight, adjustment, existing) {
    var calc = '((' + lineHeight + ' - ' + fontSize + ') / -2) + ' + adjustment;
    if (existing && !_.contains(marginKeywords, existing)) {
        return 'calc(' + convert.calcToSubroutine(existing) + ' + ' + calc + ')';
    }
    return 'calc(' + calc + ')';
}

function join(index, marginValues) {
    return marginValues[index].join(' ');
}

module.exports = {
    getAdjustedLonghand: getAdjustedLonghand,
    getShorthandWithAdjustedTop: getShorthandWithAdjustedTop,
    getShorthandWithAdjustedBottom: getShorthandWithAdjustedBottom,
    getShorthandWithAdjustedTopAndBottom: getShorthandWithAdjustedTopAndBottom
};
