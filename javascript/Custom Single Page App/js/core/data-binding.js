class DataBinding  {
    constructor(baseobject, keys){
        this.bindings = {};
        keys.forEach(key =>{
            this.bindings[key] = new Observable(baseobject, key);
        });
        this.applyBindings();
    }
   
    applyBindings = () => {
        document.querySelectorAll("[data-bind]").forEach(elem => {
            const obs = this.bindings[elem.getAttribute("data-bind")];
            this.bindValue(elem, obs);
        });
    };

    bindValue = (input, observable) => {
        input.value = observable.value;
        observable.subscribe(() => input.value = observable.value);
        input.oninput = () => {
            observable.value = input.value;
            app.renderToElement(input.id, `${app.user.currentUser[input.id]}`);
        }  
    };
};

class Observable {

    constructor(obj, prop) {
        this._listeners = [];
        this._obj = obj;
        this._prop = prop;
        this._value = obj[prop];
    };

    notify () {
        this._listeners.forEach(listener => listener(this._value));
    };

    subscribe(listener) {
        this._listeners.push(listener);
    };

    get value() {
        return this._value;
    }

    set value(newValue) {
        if (this._value !== newValue) {
            this._value = newValue;
            this._obj[this._prop] = newValue;
            this._listeners.forEach(listener => listener(newValue));
        }
    }
};