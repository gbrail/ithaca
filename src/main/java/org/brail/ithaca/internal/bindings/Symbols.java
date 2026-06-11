package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.Symbol;
import org.mozilla.javascript.SymbolKey;
import org.mozilla.javascript.VarScope;

public class Symbols {
  public static final SymbolKey RESOURCE = new SymbolKey("Resource", Symbol.Kind.REGULAR);
  public static final SymbolKey OWNER = new SymbolKey("Owner", Symbol.Kind.REGULAR);
  public static final SymbolKey ASYNC_ID = new SymbolKey("AsyncID", Symbol.Kind.REGULAR);
  public static final SymbolKey TRIGGER_ASYNC_ID = new SymbolKey("TriggerAsyncID", Symbol.Kind.REGULAR);

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    o.put("resource_symbol", o, RESOURCE);
    o.put("owner_symbol", o, OWNER);
    o.put("async_id_symbol", o, ASYNC_ID);
    o.put("trigger_async_id_symbol", o, TRIGGER_ASYNC_ID);
    return o;
  }
}
