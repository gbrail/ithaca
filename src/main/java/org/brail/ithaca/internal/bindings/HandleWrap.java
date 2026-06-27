package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.handles.Handle;
import org.mozilla.javascript.ClassDescriptor;

public class HandleWrap {
  static ClassDescriptor.Builder applyClassDescriptor(ClassDescriptor.Builder b) {
    return b.withMethod(ClassDescriptor.Destination.PROTO, "ref", 0, Handle::js_ref)
            .withMethod(ClassDescriptor.Destination.PROTO, "unref", 0, Handle::js_unref)
            .withMethod(ClassDescriptor.Destination.PROTO, "hasRef", 0, Handle::js_hasRef)
            .withMethod(ClassDescriptor.Destination.PROTO, "close", 0, Handle::js_close);
  }
}
