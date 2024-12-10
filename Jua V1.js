(function() {
    'use strict';
    //////////// Internal Functions
    const getType = function(obj) {
        const type = typeof obj;
        switch (type) {
            case 'string':
                return 'string';
            case 'object':
                if (obj instanceof Node || (obj.nodeType || obj.nodeType == 0)) {
                    return 'node';
                };
                if (obj instanceof Jua.select) {
                    return 'jua';
                };
                if (obj instanceof NodeList || obj instanceof HTMLCollection || obj instanceof Array || obj.length) {
                    return 'list';
                };
                return 'object';
        };
        return undefined;
    };

    const ConvertToNodes = function(selector, parent) {
        const type = getType(selector);
        const obj = [];
        parent = parent || document;
        switch (type) {
            case 'string':
                obj.push(...ConvertToNodes(parent.querySelectorAll(selector)));
                break;
            case 'node':
                obj.push(selector);
                break;
            case 'list':
                for (let i = 0; i < selector.length; i++) {
                    let n = selector[i];
                    if (n && getType(n) == 'node') {
                        obj.push(n);
                    } else if (n) {
                        obj.push(...ConvertToNodes(n));
                    };
                };
                break;
            case 'jua':
                for (let i = 0; i < selector.length; i++) {
                    obj.push(selector[i].node);
                };
                break;
            case 'object':
                obj.push(...newElm(selector, parent)[0])
                break;
        };
        return obj;
    };
    const domToElement = function(string, func) {
        const elm = document.createElement('div');
        const id = 'JUA_TESTING_' + Jua.randomId();
        elm.innerHTML = string;
        const elms = elm.querySelectorAll("*");
        const attrFunc = (attr) => {
            const attrs = {};
            Array(...attr).forEach((v) => {
                attrs[v.name] = v.value;
            });
            return attrs;
        };
        for (let i = 0; i < elms.length; i++) {
            const cElm = elms[i];
            const name = cElm.tagName;
            const attr = attrFunc(cElm.attributes)
            const innerText = cElm.textContent;
            const parent = cElm.parentNode.id != id ? cElm.parentNode : undefined;
            func(name, attr, innerText, parent);
        };
    };

    const newElm = function(names, ownerDoc, ns) {
        ns = ns || 'http://www.w3.org/1999/xhtml';
        ownerDoc = ownerDoc ? (ownerDoc.ownerDocument ? ownerDoc.ownerDocumnet : ownerDoc) : document;
        const elms = [];
        const create = (name, attr, innerText, parent) => {
            const elm = ownerDoc.createElementNS(ns, name);
            Jua.loop(attr, function(v, n) {
                elm.setAttribute(n, v);
            });
            elm.textContent = innerText;
            if (parent) {
                parent.appendChild(elm);
            };
            elms.push(elm);
            return elm;
        };
        if (typeof names == 'string') {
            const domRexpr = /<([a-z]+)\b[^>]*>/i;
            if (domRexpr.test(names)) {
                domToElement(names, create);
            } else {
                if (names.search(',') != -1) {
                    return [Jua.flatArr(names.split(',').map((v) => {
                        return newElm(v, ownerDoc, ns)[0];
                    })), ownerDoc]
                };
                const idClass = /^(.*?)(?:#([^\s\.]+))?(?:\.([^\s#]+))?$/;
                if (idClass.test(names)) {
                    const matches = idClass.exec(names);
                    let obj = {};
                    (matches[2]) ? obj.id = matches[2]: null;
                    (matches[2]) ? obj.class = matches[3]: null;
                    create(matches[1], obj);
                };
            };
        } else if (typeof names == 'object') {
            const getVals = function(namesObj, parent) {
                var attrs = {};
                var names = [];
                var css = '';
                var innerText = [];
                var obj = [];
                Jua.loop(namesObj, function(v, n) {
                    if (n.indexOf('$') == 0) {
                        attrs[n.substr(1, n.length)] = v;
                        return;
                    };
                    if (n.indexOf('_') == 0) {
                        css += n.substr(1, n.length) + ': ' + v + ';';
                        return;
                    };
                    names.push(n);

                    if (typeof v == 'object') {
                        obj.push(v);
                        innerText.push('');
                    }else{
                        innerText.push(v);
                    }
                });
                if (css) {
                    attrs.style = css;
                }
                for (var i = 0; i < names.length; i++) {
                    var name = names[i];
                    var innerText = innerText[i];
                    if (obj.length != 0) {
                      obj.forEach((v) => {getVals(v, create(name, attrs, innerText, parent));})
                    } else {
                        create(names, attrs, innerText, parent);
                    };
                };
            };
            getVals(names);
        };

        return [Jua.flatArr(elms), ownerDoc];
    };

    //////////// start Jua 
    const jua = function() {
        this.newElm = newElm;
        this.getRotation = function(posX,posY,mouseX,mouseY){
            return Math.atan2(mouseY-posY, mouseX-posX);
        }
        this.ready = function(cb) {
            return Jua(document).ready(cb);
        };
        this.randomId = function() {
            return Math.random().toString(36).slice(2)
        };
        this.timer = function() {
            var starting = Date.now();
            return {
                now: function() {
                    return {
                        ms: Date.now() - starting,
                        s: (Date.now() - starting) / 1000,
                    }
                }
            };
        };
        this.loop = function(obj, cb) {
            if (typeof obj == 'number') {
                for (var i = 0; i < obj; i++) {
                    cb(i, obj);
                };
                return obj;
            };
            if (typeof obj == 'object') {
                if (obj.length) {
                    for (var i = 0; i < obj.length; i++) {
                        cb(obj[i], i, obj);
                    }
                    return obj;

                };
                for (let x in obj) {
                    cb(obj[x], x, obj);
                };
                return obj;
            };
        };
        this.filter = function(arr) {
            var newArr = [];
            for (var i = 0; i < arr.length; i++) {
                var e = arr[i];
                if (!newArr.includes(e)) {
                    newArr.push(e);
                };
            };
            return newArr;
        };
        this.getSelectorPath = function(el) {
            el = ConvertToNodes(el)[0];
            var str = el.tagName;
            str += (el.id != "" && typeof Number(el.id) == NaN) ? "#" + el.id : "";
            if (el.className) {
                var classes = el.className.split(/\s/);
                for (var i = 0; i < classes.length; i++) {
                    str += "." + classes[i]
                };
            };
            var index = 1;
            if (el.parentElement) {
                index += Array(...el.parentElement.children).indexOf(el);
            };
            str += ':nth-child(' + index + ')';
            return el.parentElement ? Jua.getSelectorPath(el.parentElement) + " > " + str : str;
        };
        this.plug = function(name, func) {
            Jua.select.prototype[name] = func;
            return Jua();
        };
        this.getUnit = function(val) {
            const split = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val);
            if (split) return split[1];
        };
        this.randomRGB = function() {
            return "rgb(" + Jua.randomNumber(255) + "," + Jua.randomNumber(255) + "," + Jua.randomNumber(255) + ")";
        };
        this.randomColorObject = function() {
            return {
                red: Jua.randomNumber(255),
                green: Jua.randomNumber(255),
                blue: Jua.randomNumber(255)
            };
        };
        this.random = function(array) {
            if (arguments.length == 1) {
                return array[Jua.randomNumber(array.length)];
            } else {
                return arguments[Jua.randomNumber(arguments.length)];
            };
        };
        this.randomNumber = function(max = 10) {
            return Math.floor(Math.random() * max);
        };
        this.read = function(file, cb, type) {
            type = type || 'dataurl';
            type = type.toLowerCase();
            var reader = new FileReader();
            reader.onload = function() {
                if (typeof cb == "function") {
                    cb(reader.result, file, type)
                } else throw new Error("Callback Is Not Typeof Function");
            };
            if (type.search('dataurl') != -1) {
                reader.readAsDataURL(file)
            } else
            if (type.search('binary') != -1) {
                reader.readAsBinaryString(file)
            } else
            if (type.search('buffer') != -1 || type.search('array') != -1) {
                reader.readAsArrayBuffer(file)
            } else
            if (type.search('text') != -1) {
                reader.readAsText(file)
            } else {
                reader.readAsDataURL(file);
            };
        };
        this.get = function(path, cb) {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    cb(xhttp.responseText, xhttp);
                }
            };
            xhttp.open("GET", path, true);
            xhttp.send();
        };
        this.linearGrad = function(rgb1, rgb2, rgb3) {
            return function(fade) {
                var rgb1 = rgb1;
                var rgb2 = rgb2;
                var fade = fadeFraction;

                if (rgb3) {
                    fade = fade * 2;

                    if (fade >= 1) {
                        fade -= 1;
                        rgb1 = rgb2;
                        rgb2 = rgb3;
                    }
                }

                var diffRed = rgb2.red - rgb1.red;
                var diffGreen = rgb2.green - rgb1.green;
                var diffBlue = rgb2.blue - rgb1.blue;

                var gradient = {
                    red: parseInt(Math.floor(rgb1.red + (diffRed * fade)), 10),
                    green: parseInt(Math.floor(rgb1.green + (diffGreen * fade)), 10),
                    blue: parseInt(Math.floor(rgb1.blue + (diffBlue * fade)), 10),
                };
                return 'rgb(' + gradient.red + ',' + gradient.green + ',' + gradient.blue + ')';
            };
        };
        this.flatArr = function(arr) {
            var newArr = [];
            arr.forEach(function(v) {
                Array.isArray(v) ? newArr.push(...Jua.flatArr(v)) : newArr.push(v);
            });
            return newArr;
        };
        this.select = select;
    };
    //////// end Jua
    //////// jua selector function
    function select(selector, parent) {
        if (!new.target) return new Jua.select(selector);
        var nodes = ConvertToNodes(selector);
        nodes = Jua.filter(nodes);
        this.selector = selector;
        this.node = nodes[0];
        this.length = nodes.length;

        if (this.length == 0 || this.length == 1) {
            this[0] = this;
            if (this.node && !this.node.JUA_ID) {
                this.node.JUA_ID = 'JUA_'+new jua().randomId();
            };
        } else {
            for (var i = 0; i < nodes.length; i++) {
                this[i] = new Jua.select(nodes[i], parent);
            };
        };
    };
    var Proto = select.prototype;

    Proto.forEach = Proto.each = function() {
        for (var i = 0; i < this.length; i++) {
            var node = this[i];
            for (var a = 0; a < arguments.length; a++) {
                if (typeof arguments[a] == 'function') {
                    arguments[a].apply(this, [node, i, this]);
                }
            };

        };
        return this;
    };
    //----------------------------------------------
    Proto.map = function(cb) {
        var arr = [];
        this.each(function() {
            arr.push(cb.apply(_this, arguments));
        });
        return Jua(arr);
    };
    //----------------------------------------------
    Proto.clone = function(childs = false) {
        return this.map(function(e) {
            return e.node.cloneNode(childs);
        });
    };
    //----------------------------------------------
    Proto.append = function(elements, clone = false) {
        if (typeof elements == 'string') {
            this.each(function(n) {
                n.html(elements,true);
            });
            return this;
        };
        var nodes = ConvertToNodes(elements);
        this.each(function(n) {
            nodes.forEach(function(n1) {
                clone ? n.node.appendChild(n1.cloneNode(true)) : n.node.appendChild(n1);
            });
        });
        return this;
    };
    //----------------------------------------------
    Proto.appendTo = function(elements, clone) {
        Jua(elements).append(this, clone);
        return this;
    };
    //----------------------------------------------
    Proto.push = function(nodes) {
        return new Jua([this, nodes]);
    };
    //----------------------------------------------
    Proto.child = function(child) {
        if (typeof child == 'string') {
            return this.select(child);
        } else if (child) {
            this.append(child);
        } else {
            return this.map(function(n) {
                return n.node.children;
            });
        }
        return this;
    };
    //----------------------------------------------
    Proto.on = Proto.event = Proto.watch = function(type, cb, opt) {
        var _this = this;
        this.each(function(e) {
            e.node.addEventListener(type, cb, opt);
        });
        return {
            nodes: _this,
            type: type,
            cb: cb,
            opt: opt,
            cancel: function(index = undefined) {
                var type = this.type;
                (typeof index == 'number' ? this.nodes.get(index):this.nodes).each(function(e) {
                    e.node.removeEventListener(type, cb, opt);
                });
                return _this;
            }
        };
    };

    /*events*/
    //----------------------------------------------
    Proto.click = function(cb, opt) {
        return Proto.on('click', cb, opt);
    };
    //----------------------------------------------
    Proto.dblclick = function(cb, opt) {
        return Proto.on('dblclick', cb, opt);
    };
    //----------------------------------------------
    Proto.focus = function(cb, opt) {
        return Proto.on('focus', cb, opt);
    };
    //----------------------------------------------
    Proto.keyup = function(cb, opt) {
        return Proto.on('keyup', cb, opt);
    };
    //----------------------------------------------
    Proto.keydown = function(cb, opt) {
        return Proto.on('keydown', cb, opt);
    };
    //----------------------------------------------
    Proto.keypress = function(cb, opt) {
        return Proto.on('keypress', cb, opt);
    };
    //----------------------------------------------
    Proto.mousedown = function(cb, opt) {
        return Proto.on('mousedown', cb, opt);
    };
    //----------------------------------------------
    Proto.mouseup = function(cb, opt) {
        return Proto.on('mouseup', cb, opt);
    };
    /*events*/
    //----------------------------------------------
    Proto.remove = function(child) {
        if (child) {
            Jua(child).remove()
        };
        this.each(function(n) {
            n.node.remove();
        });
        return this;
    };
    //----------------------------------------------
    Proto.empty = function() {
        this.child().remove();
        return this;
    };
    //----------------------------------------------
    Proto.pick = Proto.get = function(num) {
        return this[num];
    };
    //----------------------------------------------
    Proto.selectorPath = Proto.getSelectorPath = Proto.getSelector = function() {
        return new jua().getSelectorPath(this.node);
    };
    //----------------------------------------------
    Proto.hasAttr = function(name) {
        return Boolean(e.node.hasAttribute(name));
    };
    //----------------------------------------------
    Proto.select = Proto.Jua = Proto.jua = function(selector) {
        var nodes = [];
        this.each(function(e) {
            nodes.push(e.node.querySelectorAll(selector));
        });
        return Jua(nodes);
    };
    //----------------------------------------------
    Proto.log = function() {
        console.log(this, ...arguments);
        return this;
    };
    //----------------------------------------------
    Proto.insertBefore = function(node, clone = false) {
        this.each(function(e) {
            node = ConvertToNodes(nodes);
            for (var i = 0; i < node.length; i++) {
                node[i] = clone ? node[i].cloneNode(true) : node;
                e.node.insertAdjacentElement("beforeBegin", node[i]);
            }
        });
        return this;
    };
    //----------------------------------------------
    Proto.insertAfter = function(node, clone = false) {
        this.each(function(e) {
            node = ConvertToNodes(nodes);
            for (var i = 0; i < node.length; i++) {
                node[i] = clone ? node[i].cloneNode(true) : node;
                e.node.insertAdjacentElement("afterEnd", node[i]);
            }
        });
        return this;
    };
    //----------------------------------------------
    Proto.next = function(node) {
        if (node) {this.insertAfter(node)};
        return Jua(this.node.nextElementSibling);
    };
    //----------------------------------------------
    Proto.prev = function(node) {
        if (node) {this.insertBefore(node)};
        return Jua(this.node.previousElementSibling);
    };
    //----------------------------------------------
    Proto.parent = function() {
        return Jua(this.node.parentNode);
    };
    //----------------------------------------------
    Proto.push = function(nodes) {
        return Jua([this, nodes]);
    };
    //----------------------------------------------
    Proto.random = function() {
        return this[new jua().randomNumber(this.length)];
    };
    //----------------------------------------------
    Proto.ready = function(cb) {
        var node = this.node;
        if (typeof cb != 'function') {
            return this;
        };

        if (node instanceof Document) {
            if (node.readyState === "complete" ||
                node.readyState === "interactive") {
                this.on("load", cb);
            } else {
                this.on("DOMContentLoaded", cb);
            };
        } else {
            cb(this);
        };
        return this;
    };
    //----------------------------------------------
    Proto.tagName = function() {
        return this.node.tagName;
    };
    //----------------------------------------------
    Proto.toArray = function() {
        return this.map(function(e) {
           return e.node;
        });
    };
    //----------------------------------------------
    Proto.juaId = function() {
        return this.node.JUA_ID;
    };
    //---------------------------------------------- 
    /* for three Similar functions */
    var types = {
        text: 'textContent',
        html: 'innerHTML',
        val: 'value',
    }
    var change = function(type, str, add = false, _this) {
        if (!str) {
            str = '';
        };
        type = types[type];
        if (typeof str == 'function') {
            _this.each(function(e) {
                if (add) {
                    e.node[type] += str(...arguments);
                } else {
                    e.node[type] = str(...arguments);
                };
            });
        } else{
            _this.each(function(e) {
                if (add) {
                    e.node[type] += str;
                } else {
                    e.node[type] = str;
                };
            });
        };

        return _this[0].node[type];
    };
    /* for three Similar functions */
    //----------------------------------------------
    Proto.html = function(html, add) {
        return change('html', html, add, this);
    }
    //----------------------------------------------
    Proto.text = function(text, add) {
        return change('text', text, add, this);
    }
    //----------------------------------------------
    Proto.val = function(val, add) {
        return change('val', val, add, this);
    }
    /* for three Similar functions */
    //----------------------------------------------
    Proto.removeAttr = function(name) {
        this.each(function(e) {
            if (typeof name == 'string') {
                name = name(e,this,name);
            };
            e.node.removeAttribute(name)
        });
        return this;
    };
    //----------------------------------------------
    Proto.attr = function(name, value) {
        var n = 0,
            v = 0;
        if (name) {
            n = 1
        };
        if (value == 0 || value) {
            v = 1;
        };
        var _this = this;
        var tn = typeof name == 'function' ? 1 : 0;
        var tv = typeof value == 'function' ? 1 : 0;
        var arr = '' + n + v + tn + tv;
        switch (arr) {
            case '1101':
                _this.each(function(n, i) {
                    var get = n.node.getAttribute(name);
                    n.attr(name, value(n, get, name, i, _this));
                });
                break;
            case '1100':
                _this.each(function(n) {
                    n.node.setAttribute(name, value);
                });
                break;
            case '1010':
                _this.each(function(n, i) {
                    n.attr(name(n, i, _this));
                });
                break;
            case '1000':
                if (typeof name == 'object') {
                    for (let x in name) {
                        _this.attr(x, name[x]);
                    };
                } else {
                    return _this.node.getAttribute(name);
                };
                break;
            case '0000':
                var attr = {};
                _this.node.getAttributeNames().forEach(function(name) {
                    attr[name] = _this.attr(name);
                });
                return attr;
                break;
        };
        return this;
    };
    //----------------------------------------------
    Proto.id = function(id) {
        return this.attr('id', id);
    };
    //----------------------------------------------
    Proto.css = Proto.class = Proto.style = function(name, value, priority ) {
        var getC = window.getComputedStyle;
        var n = 0,
            v = 0;
        if (name) {
            n = 1
        };
        if (value == 0 || value) {
            v = 1;
        };
        var _this = this;
        var tn = typeof name == 'function' ? 1 : 0;
        var tv = typeof value == 'function' ? 1 : 0;
        var arr = '' + n + v + tn + tv;

        switch (arr) {
            case '1101':
                _this.each(function(n, i) {
                    var get = getC(n.node)[name];
                    n.class(name, value(n, get, name, i, _this),priority);
                });
                break;
            case '1100':
                _this.each(function(n) {
                    n.node.style.setProperty(name,value,priority);
                });
                break;
            case '1010':
                _this.each(function(n, i) {
                    n.class(name(n, i, _this));
                });
                break;
            case '1000':
                if (typeof name == 'object') {
                    for (let x in name) {
                        _this.class(x, name[x]);
                    };
                } else {
                    return getC(_this.node)[name];
                };
                break;
            case '0000':
                return getC(_this.node);
                break;
        };
        return this

    };
    //----------------------------------------------
    Proto.plug = function(name, func) {
        Jua.select[name] = func;
        return this;
    };
    //----------------------------------------------
    Proto.addClass = function(className){
        this.each(function(e){
            e.node.classList.add(className);
        });
        return this;
    };
    //----------------------------------------------
    Proto.removeClass = function(className){
        this.each(function(e){
            e.node.classList.remove(className);
        });
        return this;
    };
    //----------------------------------------------
    Proto.toggleClass = function(className){
        this.each(function(e){
            e.node.classList.toggle(className);
        });
        return this;
    };
    //----------------------------------------------
    Proto.toggleAttr = function(name,val,val1){
        this.each(function(e){
            var toggle = e.node.toggleAttribute(name);
            if (val != undefined && val1 != undefined) {
                toggle ? e.attr(name,val) : e.attr(name,val1);
            }else if(val != undefined){
                toggle ? e.attr(val) : e.removeAttr(name);
            };
        });
        return this;
    };
    //----------------------------------------------
    Proto.hide = function(){
         this.each(function(e){
            e.node.JUA_DISPLAY = 0;
            e.css('display','none');
         });
        return this;
    };
    //----------------------------------------------
    Proto.show = function(){
         this.each(function(e){
            var display =  e.node.JUA_OLD_DISPLAY || e.css('display') || 'block';
            e.css('display','block');
            e.node.JUA_DISPLAY = 1;
         });
        return this;
    };
    //----------------------------------------------
    Proto.toggle = function(){
        this.each(function(e){
                if (!e.node.JUA_OLD_DISPLAY) {
                    e.node.JUA_OLD_DISPLAY = e.css('display');
                }
                if (e.css('display') == 'none') {
                    e.node.JUA_DISPLAY = 0;
                }else{
                    e.node.JUA_DISPLAY = 1;
                };
            if (e.node.JUA_DISPLAY == 1) {
                e.hide();
            }else{
                e.show();
            };
        });
        return this;
    };
    //----------------------------------------------
    Proto.offset = function(){
        return this.node.getBBox ? this.node.getBBox() : this.node.getBoundingClientRect();
    };
    //----------------------------------------------
    //----------------------------------------------
    //----------------------------------------------


    //////// jua selector function
    ////// init jua()
    var Jua = function(selector, parent, ns) {
        if (new.target) {
            return Jua.select(...newElm(selector, parent, ns));
        } else if (selector) {
            return Jua.select(selector, parent);
        } else {
            return new jua();
        };
    };

    ///// set props
    var func = new jua();
    for (let x in func) {
        Jua[x] = func[x];
    };

    /////// set as global
    window.Jua = Jua;

    ///// add body to Jua
    Jua.ready(function() {
        Jua.body = Jua('body')
    });

})()