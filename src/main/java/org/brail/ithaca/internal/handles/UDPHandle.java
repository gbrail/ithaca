package org.brail.ithaca.internal.handles;

import java.io.IOException;
import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Scriptable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class UDPHandle extends Stream {
  private static final Logger log = LoggerFactory.getLogger(UDPHandle.class);

  public UDPHandle(Environment env) {
    super(env);
  }

  @Override
  public String getClassName() {
    return "UDP";
  }

  @Override
  protected void blockingWrite(byte[] buf, int off, int len) throws IOException {
    throw new AssertionError("UDPHandle write not implemented");
  }

  @Override
  protected void close() {
    log.debug("close");
  }

  public static Scriptable js_constructor(Environment e) {
    log.debug("constructor");
    return new UDPHandle(e);
  }
}
