package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;

public class Constants {

    public static Scriptable init(Environment e, Context cx, VarScope s) {
        var root = cx.newObject(s);

        // os
        var os = cx.newObject(s);
        var errno = cx.newObject(s);
        populate(cx, s, errno, NodeConstants.Errno.class);
        populate(cx, s, errno, NodeConstants.WindowsError.class);
        os.put("errno", os, errno);

        var signals = cx.newObject(s);
        populate(cx, s, signals, NodeConstants.Signals.class);
        os.put("signals", os, signals);

        var priority = cx.newObject(s);
        populate(cx, s, priority, NodeConstants.Priority.class);
        os.put("priority", os, priority);

        var dlopen = cx.newObject(s);
        populate(cx, s, dlopen, NodeConstants.DlOpen.class);
        os.put("dlopen", os, dlopen);

        root.put("os", root, os);

        // fs
        var fs = cx.newObject(s);
        populate(cx, s, fs, NodeConstants.Fs.class);
        root.put("fs", root, fs);

        // crypto
        var crypto = cx.newObject(s);
        populate(cx, s, crypto, NodeConstants.Crypto.class);
        root.put("crypto", root, crypto);

        // internal
        var internal = cx.newObject(s);
        populate(cx, s, internal, NodeConstants.Internal.class);
        root.put("internal", root, internal);

        // trace
        var trace = cx.newObject(s);
        populate(cx, s, trace, NodeConstants.Trace.class);
        root.put("trace", root, trace);

        // util
        var util = cx.newObject(s);
        populate(cx, s, util, NodeConstants.Util.class);
        root.put("util", root, util);


        return root;
    }

    public static void populate(Context cx, VarScope s, Scriptable target, Class<?> clazz) {
        for (Field field : clazz.getDeclaredFields()) {
            if (Modifier.isStatic(field.getModifiers()) && Modifier.isFinal(field.getModifiers())) {
                try {
                    Object value = field.get(null);
                    target.put(field.getName(), target, value);
                } catch (IllegalAccessException e) {
                    throw new RuntimeException("Failed to load constant " + field.getName(), e);
                }
            }
        }
    }
}

