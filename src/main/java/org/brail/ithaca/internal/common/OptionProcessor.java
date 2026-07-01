package org.brail.ithaca.internal.common;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.regex.Pattern;
import org.brail.ithaca.NodeException;
import org.brail.ithaca.internal.bindings.NodeConstants;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;

public class OptionProcessor<T> {
  public record Option(String name, int type, String help, Field declaredField) {}

  public record Result<T>(T result, List<String> remaining) {}

  private static final Pattern EQ = Pattern.compile("=");
  private static final Pattern COMMA = Pattern.compile(",");

  private final Class<T> klass;
  private final HashMap<String, Option> options = new HashMap<>();

  public OptionProcessor(Class<T> klass) {
    this.klass = klass;
    initialize();
  }

  public Result<T> load(List<String> args) throws NodeException {
    var remaining = new ArrayList<String>();
    T result;
    try {
      result = klass.getDeclaredConstructor().newInstance();
    } catch (InstantiationException
        | IllegalAccessException
        | NoSuchMethodException
        | InvocationTargetException e) {
      throw new NodeException("Can't construct arguments: " + e, e);
    }

    for (var arg : args) {
      if (arg.startsWith("--") && arg.length() > 2) {
        var parts = EQ.split(arg.substring(2), 2);
        var argName = parts[0];
        var argValue = parts.length > 1 ? parts[1] : "";
        var option = options.get(argName);
        if (option != null) {
          try {
            option.declaredField.set(result, makeValue(argValue, option));
          } catch (IllegalAccessException e) {
            throw new NodeException("Error setting " + option.name + ": " + e, e);
          }
          continue;
        }
      }
      remaining.add(arg);
    }
    return new Result<>(result, remaining);
  }

  public void storeOptions(Context cx, VarScope s, Scriptable out, T values) {
    for (var opt : options.values()) {
      try {
        var val = opt.declaredField.get(values);
        if (val instanceof List<?> l) {
          var av = cx.newArray(s, l.size());
          for (var i = 0; i < l.size(); ++i) {
            av.put(i, av, l.get(i));
          }
          val = av;
        }
        out.put("--" + opt.name, out, val);
      } catch (IllegalAccessException e) {
        throw new AssertionError("Unexpected error accessing option values", e);
      }
    }
  }

  private void initialize() {
    for (var f : klass.getFields()) {
      var ann = f.getAnnotation(NodeOption.class);
      if (ann == null) {
        continue;
      }
      var name = ann.name();
      var type = fieldType(f);
      options.put(name, new Option(name, type, ann.help(), f));
    }
  }

  private static int fieldType(Field f) {
    var t = f.getType();
    if (String.class.equals(t)) {
      return NodeConstants.OptionTypes.kString;
    }
    if (Integer.TYPE.equals(t) || Long.TYPE.equals(t) || Short.TYPE.equals(t)) {
      return NodeConstants.OptionTypes.kInteger;
    }
    if (Boolean.TYPE.equals(t)) {
      return NodeConstants.OptionTypes.kBoolean;
    }
    if (List.class.equals(t)) {
      return NodeConstants.OptionTypes.kStringList;
    }
    throw new AssertionError("Invalid option type " + t);
  }

  private static Object makeValue(String s, Option opt) throws NodeException {
    switch (opt.type()) {
      case NodeConstants.OptionTypes.kString:
        return s;
      case NodeConstants.OptionTypes.kInteger:
        try {
          return Integer.valueOf(s);
        } catch (NumberFormatException nfe) {
          throw new NodeException("Invalid value for option \"" + opt.name() + "\"" + nfe, nfe);
        }
      case NodeConstants.OptionTypes.kBoolean:
        try {
          return Boolean.valueOf(s);
        } catch (NumberFormatException nfe) {
          throw new NodeException("Invalid value for option \"" + opt.name() + "\"" + nfe, nfe);
        }
      case NodeConstants.OptionTypes.kStringList:
        var vals = COMMA.split(s);
        return Arrays.asList(vals);
      default:
        throw new NodeException(
            "Unsupported type for option \"" + opt.name() + "\": " + opt.type());
    }
  }

  private static Object makeScriptValue(Context cx, VarScope s, String str, Option opt)
      throws NodeException {
    if (opt.type() == NodeConstants.OptionTypes.kStringList) {
      var vals = COMMA.split(str);
      var valCopy = new Object[vals.length];
      System.arraycopy(vals, 0, valCopy, 0, vals.length);
      return cx.newArray(s, valCopy);
    }
    return makeValue(str, opt);
  }
}
