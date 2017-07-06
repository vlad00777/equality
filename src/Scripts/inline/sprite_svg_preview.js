jQuery(document).ready(function($) {

    var printCrtEl = function(tagClass, tagName, tagAttrs, markup) {
        var tag = tagName || 'div';
        var element = document.createElement(tag);
        if (tagClass) {
            var classes = tagClass.split(' ');
            for (var i = 0; i < classes.length; i++) {
                element.classList.add(classes[i]);
            }
        }
        if (tagAttrs) {
            for (var name in tagAttrs) {
                element[name] = tagAttrs[name];
            }
        }
        if (markup) {
            return element.outerHTML;
        } else {
            return $(element);
        }
    };



    var printSvgSprite = function(symbols) {
        if (symbols.length) {
            var arr = [];
            symbols.each(function(index, el) {
                var ID = el.id;
                var li =  printCrtEl('svgSpritePreviewItem', 'li');
                var holder = printCrtEl('svgSpritePreviewHolder mfi', 'span');
                var xlink = 'xlink:href="#'+ID+'"';
                var svguse = '<svg><use '+xlink+' /></svg>';
                holder.append(svguse).attr({
                    'data-title': ID,
                    'data-mfp-src': '#svgSpritePreviewPopUp'
                });
                li.append(holder);
                arr.push(li[0].outerHTML);
            });
            $('#svgSpritePreviewList').html(arr.join('\n'));
        }
    };

    $(document).on('click', '.svgSpritePreviewHolder', function(event) {
        event.preventDefault();
        var icon_id = $(this).data('title');
        $('.svgSpritePreviewItemName').html(icon_id);
    });



    $(window).load(function() {
        wSpriteSvg.isDone = function(svg) {
            printSvgSprite($(svg).children('symbol'));
            wHTML.mfi();
        };
    });
});