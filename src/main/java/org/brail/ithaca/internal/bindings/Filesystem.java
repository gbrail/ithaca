package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.filesystem.FSReqCallback;
import org.brail.ithaca.internal.filesystem.FSReqPromise;
import org.brail.ithaca.internal.filesystem.FileHandle;
import org.brail.ithaca.internal.filesystem.FileHandleCloseReq;
import org.brail.ithaca.internal.filesystem.FileHandleReqWrap;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaConstructor;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;

public class Filesystem {
  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var o = cx.newObject(s);

    // TODO put all the methods in here
    // we probably need a table to map fds to files, and it might have to be synchronized

    var reqCallback = new LambdaConstructor(s, "FSReqCallback", 0, FSReqCallback::js_constructor);
    o.put("FSReqCallback", o, reqCallback);

    var reqWrap =
        new LambdaConstructor(s, "FileHandleReqWrap", 0, FileHandleReqWrap::js_constructor);
    o.put("FileHandleReqWrap", o, reqWrap);

    var reqPromise = new LambdaConstructor(s, "FSReqPromise", 0, FSReqPromise::js_constructor);
    o.put("FSReqPromise", o, reqPromise);

    var closeReq =
        new LambdaConstructor(s, "FileHandleCloseReq", 0, FileHandleCloseReq::js_constructor);
    o.put("FileHandleCloseReq", o, closeReq);

    var fh = new LambdaConstructor(s, "FileHandle", 0, FileHandle::js_constructor);
    fh.definePrototypeMethod(s, "close", 0, FileHandle::js_close);
    fh.definePrototypeMethod(s, "closeSync", 0, FileHandle::js_closeSync);
    fh.definePrototypeMethod(s, "releaseFD", 0, FileHandle::js_releaseFD);
    o.put("FileHandle", o, fh);

    o.put("kUsePromises", o, false);
    // TODO what?
    o.put("kFsStatsFieldNumber", o, 1);

    return o;
  }
}
