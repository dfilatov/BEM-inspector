(function() {

var curElem,
    hilightElems = {};

$.each(['left', 'top', 'right', 'bottom'], function(i, dir) {
    hilightElems[dir] = $('<div class="__hilighther_' + dir +'"/>').appendTo('body');
});

function getClosestBlockOrElem(node) {

    do {
        if(node.className && node.className.indexOf('b-') > -1) {
            return node;
        }
    }
    while(node = node.parentNode);

    return null;

}

function hilight(elem) {

    var offset = elem.offset(),
        pos = {
            'left'   : offset.left,
            'top'    : offset.top,
            'width'  : curElem.outerWidth(),
            'height' : curElem.outerHeight()
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

}

function unhilight() {

    $.each(hilightElems, function() {
        this.hide();
    });

}

$('body').on(
    {
        'mouseenter' : function(e) {
            var blockOrElem = getClosestBlockOrElem(e.target);
            if(!blockOrElem) {
                return;
            }

            hilight(curElem = $(blockOrElem));
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