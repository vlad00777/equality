window.wSpriteSvg = (function(window, document, undefined) {
    // будующий wSpriteSvg
        var sprite = {
            // SVG спецификация 
            ns: "http://www.w3.org/2000/svg",
            // Инициализация wSpriteSvg
            // аргументы (svg элемент, путь к json файлу со спрайтом)
            initialize: function(svg, src) {
                // определяем имя нашего спрайта, которое впишется ключем в localStorage браузера
                this.prefix = 'wSpriteSvg_' + svg.id;
                // проверка localStorage
                if (window.localSupport) {
                    // ищем ранее записанный ключ
                    var localSprite = window.localStorage[this.prefix];
                    if (!!localSprite) {
                        // если сушествует - получаем его значение
                        var data = JSON.parse(localSprite);
                        // собирем спрайт в svg элемент 
                        this.setSprite(svg, data);
                    } else {
                        // если отсутствует - считаваем наш json
                        this.getJson(svg, src);
                    }
                } else {
                    // если localStorage не поддерживаеться - считаваем наш json
                    this.getJson(svg, src);
                }
            },
            // получение данных из json файла
            getJson: function(svg, src) {
                // создаем запрос
                var req = new XMLHttpRequest();
                var ths = this;
                req.open("GET", src, true);
                req.setRequestHeader("Content-type", "application/json");
                req.onreadystatechange = function() {
                    if (req.readyState == 4 && req.status == 200) {
                        var response = JSON.parse(req.responseText);
                        // собирем спрайт в svg элемент 
                        ths.setSprite(svg, response);
                        // если localStorage поддерживаеться
                        // записываем в него данные нашего спрайта - ключ, значение
                        // чтобы в следуйщий раз получать спрайт без запроса к json'у а из localStorage
                        // если в дальнейшем такой записи в localStorage не будет
                        // снова сделаем запрос к json'у и попытаемся записать в localStorage
                        if (window.localSupport) {
                            window.localWrite(ths.prefix, JSON.stringify(response));
                        }
                    }
                };
                // отсылаем запрос
                req.send();
            },
            // построение элементов спрайта
            buildElem: function(element, obj) {
                var n, e, a;
                for (n in obj) {
                    for (e in obj[n]) {
                        var elem = document.createElementNS(this.ns, e);
                        for (a in obj[n][e]) {
                            if (a === 'stops') {
                                this.buildElem(elem, obj[n][e][a]);
                            } else if (a == 'innerHTML') {
                                elem.innerHTML = obj[n][e][a];
                            } else {
                                elem.setAttributeNS(null, a, obj[n][e][a]);
                            }
                        }
                        element.appendChild(elem);
                    }
                }
            },
            // собирем спрайт в svg элемент 
            setSprite: function(svg, data) {
                for (var key in data) {
                    var d = data[key];
                    var symbol = document.createElementNS(this.ns, "symbol");
                    symbol.setAttributeNS(null, "id", key);
                    symbol.setAttributeNS(null, "viewBox", d.viewBox);
                    this.buildElem(symbol, d.symbol);

                    if (d.hasOwnProperty('gradients')) {
                        this.buildElem(svg, d.gradients);
                    }
                    svg.appendChild(symbol);
                }
                // по завершинии, в случае надобности можем определить действия коллбека isDone()
                this.isDone(svg, data);
            },
            // коллбек по окончанию работы
            // аргументы (svg элемент, объект данных спрайта)
            isDone: function(svg, data) {}
        };

    // возвращает объект в качестве нового свойтства объекту Window
    // обращение - вызов глобальной переменной wSpriteSvg
    // console.log(wSpriteSvg);
        return sprite;

    // синтаксис инита
    // <svg id="id элемента" onload="wSpriteSvg.initialize(this,'путь к json')"></svg>
    
    // пример использования
    // инициализация спрайта wSpriteSvg
    /*
        <svg id="sprite" xmlns="http://www.w3.org/2000/svg" style="height:0; width:0; visibility:hidden; position:absolute; top:0; left:0;" onload="wSpriteSvg.initialize(this,'js/sprite-svg.json')"></svg>
    */
})(this, this.document);