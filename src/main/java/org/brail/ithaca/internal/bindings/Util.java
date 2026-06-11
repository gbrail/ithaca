package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.NativeSymbol;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.Symbol;
import org.mozilla.javascript.SymbolKey;
import org.mozilla.javascript.VarScope;

public class Util {
  private static final SymbolKey ARROW_MESSAGE = new SymbolKey("ArrowMessage", Symbol.Kind.REGULAR);

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    var syms = cx.newObject(s);
    syms.put("arrow_message_private_symbol", syms,
            ARROW_MESSAGE);
    o.put("privateSymbols", o, syms);
    return o;
  }
}
