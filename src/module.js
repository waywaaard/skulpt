/**
 * @constructor
 */
Sk.builtin.module = function () {
};
goog.exportSymbol("Sk.builtin.module", Sk.builtin.module);

Sk.builtin.module.prototype.ob$type = Sk.builtin.type.makeIntoTypeObj("module", Sk.builtin.module);
Sk.builtin.module.prototype.tp$getattr = Sk.builtin.object.prototype.GenericGetAttr;
Sk.builtin.module.prototype.tp$setattr = Sk.builtin.object.prototype.GenericSetAttr;

Sk.builtin.module.prototype["$r"] = function () {
    var str = "<module '";
    str += Sk.ffi.remapToJs(this["$d"]["__name__"]);
    str += "' from '";
    if (this["$d"]["__file__"] != null) {
        str += Sk.ffi.remapToJs(this["$d"]["__file__"]);
    } else {
        str += "internal";
    }
    str += "'>";

    return new Sk.builtin.str(str);
};