(function() {

var curElem,
    hilightElems = {},
    popupElem = $('<div class="bem-inspector__popup"/>').appendTo('body'),
    bemRE = /^[bi]\-[a-zA-Z0-9-]+(__[a-zA-Z0-9-]+)?$/;

$.each(['left', 'top', 'right', 'bottom'], function(i, border) {
    hilightElems[border] = $('<div class="bem-inspector__hilighther bem-inspector__hilighther_border_' + border +'"/>')
        .appendTo('body');
});

function getNodeBEMs(node) {

    return node.className?
        node.className.split(' ').filter(function(item) {
            return bemRE.test(item = item.trim()) && item !== 'i-bem';
        }) :
        [];

}

function getClosestBEMs(node) {

    var bems;
    do {
        if((bems = getNodeBEMs(node)).length) {
            return { node : $(node), bems : bems };
        }
    }
    while(node = node.parentNode);

    return null;

}

function bemIsElem(bem) {
    return bem.indexOf('__') > -1;
}

function extractMods(node, bem) {

    var res;

    node.className && node.className.split(' ').forEach(function(item) {
        var hasMod = (item = item.trim()).indexOf(bem + '_') === 0 && item.indexOf(bem + '__') === -1;
        if(hasMod) {
            var modNameIdx = bem.length + 1,
                modValIdx = item.indexOf('_', modNameIdx) + 1;
            modValIdx &&
                ((res || (res = {}))[item.substr(modNameIdx, modValIdx - modNameIdx - 1)] = item.substr(modValIdx));
        }
    });

    return res;

}

function hilight(bems) {

    var offset = bems.node.offset(),
        pos = {
            'left'   : offset.left,
            'top'    : offset.top,
            'width'  : bems.node.outerWidth(),
            'height' : bems.node.outerHeight()
        };

    hilightElems.left
        .css({ left : pos.left, top : pos.top, height : pos.height })
        .show();
    hilightElems.right
        .css({ left : pos.left + pos.width, top : pos.top, height : pos.height })
        .show();
    hilightElems.top
        .css({ left : pos.left, top : pos.top, width : pos.width })
        .show();
    hilightElems.bottom
        .css({ left : pos.left, top : pos.top + pos.height, width : pos.width })
        .show();

    popupElem
        .html(bems.bems.map(function(bem) {
            var mods = extractMods(bems.node[0], bem),
                res = ['<div class="bem-inspector__bem'];

            bemIsElem(bem) && res.push(' bem-inspector__bem_type_elem');
            res.push('"><div class="bem-inspector__bem-title">', bem, '</div>');

            if(mods) {
                res.push('<table class="bem-inspector__mods">');
                $.each(mods, function(modName, modVal) {
                    res.push('<tr>');
                    res.push('<td class="bem-inspector__bem-mod-name">', modName, '</td>');
                    res.push('<td class="bem-inspector__bem-mod-val">', modVal, '</td>');
                    res.push('</tr>');
                });
                res.push('</table>')
            }

            res.push('</div>');
            return res.join('');
        }).join(''))
        .css({ left : pos.left, top : pos.top + pos.height + 1 })
        .show();

}

function unhilight() {

    $.each(hilightElems, function() {
        this.hide();
    });

}

$('body').on(
    {
        'mouseenter' : function(e) {
            var bems = getClosestBEMs(e.target);
            if(!bems) {
                return;
            }

            hilight(bems);
        },
        'mouseleave' : function() {
            if(curElem) {
                unhilight();
                curElem = null;
            }
        }
    },
    '*');

})();