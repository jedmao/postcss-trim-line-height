'use strict';

var postcss = require('postcss');
var _ = require('lodash');
var config = require('./config');
var init = require('./init');
var validation = require('./validation');
var transforms = require('./transforms');
var getAdjustedLonghand = transforms.getAdjustedLonghand;
var getShorthandWithAdjustedTop = transforms.getShorthandWithAdjustedTop;
var getShorthandWithAdjustedBottom = transforms.getShorthandWithAdjustedBottom;
var getShorthandWithAdjustedTopAndBottom = transforms.getShorthandWithAdjustedTopAndBottom;

module.exports = postcss.plugin('trim-line-height', function(opts) {
    return function(root) {
        root.walkRules(function(rule) {
            rule.walkDecls('trim-line-height', function(adjustmentDeclaration) {
                var targetLonghandProp;
                var targetShorthandProp = 'margin';
                var options = config.getOptions(opts);
                var input = init.getInput(rule, adjustmentDeclaration);

                validation.validateInput(input);

                function clone(prop, fn, ext, important) {
                    adjustmentDeclaration.cloneBefore({
                        prop: prop,
                        value: fn(_.assign({}, input, ext), options),
                        important
                    });
                }

                if (input.isTopAdjustment && input.isBottomAdjustment && input.isExistingMargin) {
                    clone(
                        targetShorthandProp,
                        getShorthandWithAdjustedTopAndBottom,
                        { values: postcss.list.space(input.margin.value) },
                        input.margin.important
                    );
                    input.margin.remove();
                } else {
                    if (input.isTopAdjustment) {
                        targetLonghandProp = 'margin-top';
                        if (!input.isExistingMargin && !input.isExistingMarginTop) {
                            clone(
                                targetLonghandProp,
                                getAdjustedLonghand,
                                { adjustment: input.topAdjustment }
                            );
                        }

                        if (input.isExistingMarginTop) {
                            clone(
                                targetLonghandProp,
                                getAdjustedLonghand,
                                {
                                    existing: input.marginTop.value,
                                    adjustment: input.topAdjustment
                                },
                                input.marginTop.important
                            );
                            input.marginTop.remove();
                        }

                        if (input.isExistingMargin) {
                            clone(
                                targetShorthandProp,
                                getShorthandWithAdjustedTop,
                                { values: postcss.list.space(input.margin.value) },
                                input.margin.important
                            );
                            input.margin.remove();
                        }
                    }
                    if (input.isBottomAdjustment) {
                        targetLonghandProp = 'margin-bottom';
                        if (!input.isExistingMargin && !input.isExistingMarginBottom) {
                            clone(
                                targetLonghandProp,
                                getAdjustedLonghand,
                                { adjustment: input.bottomAdjustment }
                            );
                        }

                        if (input.isExistingMarginBottom) {
                            clone(
                                targetLonghandProp,
                                getAdjustedLonghand,
                                {
                                    existing: input.marginBottom.value,
                                    adjustment: input.bottomAdjustment
                                },
                                input.marginBottom.important
                            );
                            input.marginBottom.remove();
                        }

                        if (input.isExistingMargin) {
                            clone(
                                targetShorthandProp,
                                getShorthandWithAdjustedBottom,
                                { values: postcss.list.space(input.margin.value) },
                                input.margin.important
                            );
                            input.margin.remove();
                        }
                    }
                }

                adjustmentDeclaration.remove();
            });
        });
    };
});
