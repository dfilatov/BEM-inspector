(function() {

/*var curElem,
    hilightElems = {},
    popupElem = $('<div class="bem-inspector__popup"/>').appendTo('body'),
    bemRE = /^[bi]\-[a-zA-Z0-9-]+(__[a-zA-Z0-9-]+)?$/;

$.each(['left', 'top', 'right', 'bottom'], function(i, border) {
    hilightElems[border] = $('<div class="bem-inspector__hilighther bem-inspector__hilighther_border_' + border +'"/>')
        .appendTo('body');
});

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
*/

var nodes = {},
    nodeId = 1,
    expando = '__id_' + (+new Date);
function getNodeId(node) {
    if(!node[expando]) {
        nodes[nodeId] = node;
        node[expando] = nodeId++;
    }

    return node[expando];
}


var bemRE = /^([bi]\-[a-zA-Z0-9-]+)(?:__([a-zA-Z0-9-]+))?(?:_([a-zA-Z0-9-]+))?(?:_([a-zA-Z0-9-]+))?$/;
function getNodeBEMs(node) {

    if(!node.className) {
        return [];
    }

    var blocksAndElems = {};

    node.className.split(' ').forEach(function(item) {
        item = item.trim();
        if(item === 'i-bem') {
            return;
        }
        var matched = item.trim().match(bemRE);
        if(matched) {
            var key = matched[1] + (matched[2]? '__' + matched[2] : '');
            blocksAndElems[key] || (blocksAndElems[key] = { block : matched[1], elem : matched[2] });
            matched[3] && ((blocksAndElems[key].mods || (blocksAndElems[key].mods = {}))[matched[3]] = matched[4]);
        }
    });

    var res = [];
    for(var key in blocksAndElems) {
        blocksAndElems.hasOwnProperty(key) && res.push(blocksAndElems[key]);
    }

    return res;

}

function xPathQuery(query, ctx, resultType) {

    return document.evaluate(
        query,
        ctx,
        null,
        XPathResult[resultType || 'ORDERED_NODE_SNAPSHOT_TYPE'],
        null);

}

var isBEMPredicate = 'starts-with(@class, "b-") or starts-with(@class, "i-")';
function getBEMNodes(parentId) {

    var parentNode = parentId? nodes[parentId] : document,
        countBEMAncestors = xPathQuery(
            'count(ancestor::*[' + isBEMPredicate + '])',
            parentNode,
            'NUMBER_TYPE')
                .numberValue + (parentId? 1 : 0),
        snapshot = xPathQuery(
            './/*[(' + isBEMPredicate + ') and count(ancestor::*[' + isBEMPredicate + ']) = ' + countBEMAncestors + ']',
            parentNode),
        child, i = 0, len = snapshot.snapshotLength, nodeBEMs,
        res = { parentId : parentId, children : [] };

    while(i < len) {
        child = snapshot.snapshotItem(i++);
        nodeBEMs = getNodeBEMs(child);
        nodeBEMs.length &&
            res.children.push({
                id          : getNodeId(child),
                bem         : nodeBEMs,
                hasChildren : !!xPathQuery('count(.//*[' + isBEMPredicate + '])', child, 'NUMBER_TYPE').numberValue
            });
    }

    return res;

}

chrome.extension.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
        if(msg.name == 'get-bem-nodes') {
            port.postMessage({ name : 'bem-nodes', data : getBEMNodes(msg.data) });
        }
    });
    port.postMessage({ name : 'init' });
});

})();