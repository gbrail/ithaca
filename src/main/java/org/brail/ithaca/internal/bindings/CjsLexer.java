package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.common.ArgUtils;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CjsLexer {
  private static final Logger log = LoggerFactory.getLogger(CjsLexer.class);

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);
    o.put("parse", o, new LambdaFunction(s, "parse", 1, CjsLexer::parse));
    return o;
  }

  private static Object parse(Context cx, VarScope s, Object to, Object[] args) {
    ArgUtils.checkArgs(1, args);
    // TODO actually parse the source or stuff
    log.debug("CJS Lexer: Doing nothing!");
    var ret = cx.newArray(s, 2);
    // "exportNames"
    ret.put(0, ret, cx.newObject(s, "Set"));
    // "reexports"
    ret.put(1, ret, cx.newArray(s, 0));
    return ret;
  }
}
