package org.brail.ithaca.internal.bindings;

import java.util.Arrays;
import java.util.Collections;
import org.brail.ithaca.NodeException;
import org.brail.ithaca.internal.Environment;
import org.brail.ithaca.internal.common.OptionProcessor;
import org.brail.ithaca.internal.common.Options;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.SerializableCallable;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class OptionsBinding {
  private static final Logger log = LoggerFactory.getLogger(OptionsBinding.class);

  private final Environment environment;
  private final OptionProcessor<Options> parser;

  private Options options;
  private Scriptable cliOptions;

  public static Scriptable init(Environment e, Context cx, VarScope s) {
    var opts = new OptionsBinding(e);
    var o = cx.newObject(s);
    var optTypes = cx.newObject(s);
    Constants.populate(cx, s, optTypes, NodeConstants.OptionTypes.class);
    o.put("types", o, optTypes);
    meth(o, s, "getCLIOptionsValues", 0, opts::getCLIOptionsValues);
    meth(o, s, "getCLIOptionsInfo", 0, opts::getCLIOptionsInfo);
    meth(o, s, "getOptionsAsFlags", 0, opts::getOptionsAsFlags);
    meth(o, s, "getEmbedderOptions", 0, opts::getEmbedderOptions);
    meth(o, s, "getEnvOptionsInputType", 0, opts::getEnvOptionsInputType);
    return o;
  }

  private OptionsBinding(Environment e) {
    this.environment = e;
    this.parser = new OptionProcessor<>(Options.class);
  }

  private static void meth(
      Scriptable o, VarScope s, String name, int cardinality, SerializableCallable f) {
    o.put(name, o, new LambdaFunction(s, name, cardinality, f));
  }

  private Object getCLIOptionsValues(Context cx, VarScope s, Object to, Object[] args) {
    if (options == null) {
      parseOptions(cx, s);
    }
    return cliOptions;
  }

  private Object getCLIOptionsInfo(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("getCLIOptionsInfo not implemented");
  }

  private Object getOptionsAsFlags(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("getOptionsAsFlags not implemented");
  }

  private Object getEmbedderOptions(Context cx, VarScope s, Object to, Object[] args) {
    // Right now we have no embedder options so don't worry about it
    return cx.newArray(s, 0);
  }

  private Object getEnvOptionsInputType(Context cx, VarScope s, Object to, Object[] args) {
    throw new AssertionError("getEnvOptionsInputType not implemented");
  }

  private void parseOptions(Context cx, VarScope s) {
    log.debug("Parsing command-line options");
    try {
      var argv = environment.argv();
      var r = parser.load(argv == null ? Collections.emptyList() : Arrays.asList(argv));
      options = r.result();
      cliOptions = cx.newObject(s);
      parser.storeOptions(cx, s, cliOptions, r.result());
      log.debug("Options = {}", options);
    } catch (NodeException e) {
      throw ScriptRuntime.constructError("Error", "Invalid command-line options " + e);
    }
  }
}
