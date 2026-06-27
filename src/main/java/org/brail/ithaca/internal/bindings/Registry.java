package org.brail.ithaca.internal.bindings;

import org.brail.ithaca.internal.Environment;
import org.mozilla.javascript.Callable;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.LambdaFunction;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.VarScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collection;
import java.util.HashMap;

public class Registry {
  private Logger log = LoggerFactory.getLogger(Registry.class);

  private static final Registry INSTANCE = new Registry();

  private final HashMap<String, InternalBinding> bindings = new HashMap<>();

  public static Registry get() {
    return INSTANCE;
  }

  private Registry() {
    bindings.put("async_context_frame", AsyncContextFrame::init);
    bindings.put("async_wrap", AsyncWrap::init);
    bindings.put("blob", Blob::init);
    bindings.put("buffer", Buffer::init);
    bindings.put("builtins", Builtins::init);
    bindings.put("cares_wrap", CaresWrap::init);
    bindings.put("cjs_lexer", CjsLexer::init);
    bindings.put("config", Config::init);
    bindings.put("constants", Constants::init);
    bindings.put("contextify", Contextify::init);
    bindings.put("credentials", Credentials::init);
    bindings.put("diagnostics_channel", DiagnosticsChannel::init);
    bindings.put("encoding_binding", EncodingBinding::init);
    bindings.put("errors", Errors::init);
    bindings.put("fs", Filesystem::init);
    bindings.put("messaging", Messaging::init);
    bindings.put("module_wrap", ModuleWrap::init);
    bindings.put("modules", Modules::init);
    bindings.put("mksnapshot", MakeSnapshot::init);
    bindings.put("options", Options::init);
    bindings.put("performance", Performance::init);
    bindings.put("permission", Permission::init);
    bindings.put("pipe_wrap", PipeWrap::init);
    bindings.put("process_methods", ProcessMethods::init);
    bindings.put("signal_wrap", SignalWrap::init);
    bindings.put("stream_wrap", StreamWrap::init);
    bindings.put("string_decoder", StringDecoder::init);
    bindings.put("symbols", Symbols::init);
    bindings.put("task_queue", TaskQueue::init);
    bindings.put("tcp_wrap", TcpWrap::init);
    bindings.put("timers", Timers::init);
    bindings.put("trace_events", TraceEvents::init);
    bindings.put("types", Types::init);
    bindings.put("tty_wrap", TtyWrap::init);
    bindings.put("url", URL::init);
    bindings.put("url_pattern", URLPattern::init);
    bindings.put("util", Util::init);
    bindings.put("uv", Uv::init);
    bindings.put("wasm_web_api", WasmWebApi::init);
    bindings.put("worker", Worker::init);
  }

  public Collection<String> bindingNames() {
    return bindings.keySet();
  }

  public Callable internalBinding(Environment e, Context cx, VarScope scope) {
    // var b = JSDescriptor<JSFunction>.builder();
    return new LambdaFunction(
        scope,
        "internalBinding",
        1,
        (lcx, ls, _lt, args) -> {
          if (args.length < 1) {
            throw ScriptRuntime.constructError("Error", "Binding name must be provided");
          }
          var name = ScriptRuntime.toString(args[0]);
          var binding = get().bindings.get(name);
          if (binding == null) {
            throw ScriptRuntime.constructError(
                "Error", "Internal binding \"" + name + "\" not found");
          }
          log.debug("Loading internal binding {}", name);
          return binding.init(e, lcx, ls);
        });
  }

  public Callable linkedBinding(Environment e, Context cx, VarScope scope) {
    // var b = JSDescriptor<JSFunction>.builder();
    return new LambdaFunction(
        scope,
        "linkedBinding",
        1,
        (_lcx, _ls, _lt, args) -> {
          if (args.length < 1) {
            throw ScriptRuntime.constructError("Error", "Binding name must be provided");
          }
          var name = ScriptRuntime.toString(args[0]);
          // TODO build a registry for these based on ServiceLoader
          throw ScriptRuntime.constructError("Error", "Linked binding \"" + name + "\" not found");
        });
  }
}
