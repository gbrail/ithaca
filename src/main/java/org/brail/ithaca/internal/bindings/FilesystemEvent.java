package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaConstructor;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class FilesystemEvent {
  private static final Logger log = LoggerFactory.getLogger(FilesystemEvent.class);

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    var event = new LambdaConstructor(s, "FSEvent", 1, FilesystemEvent::js_fsEventConstructor);
    o.put("FSEvent", o, event);
    return o;
  }

  private static Scriptable js_fsEventConstructor(Context cx, VarScope s, Object[] args) {
    log.debug("Creating FSEvent: not implemented");
    throw new AssertionError("FSEvent not supported");
  }
}
