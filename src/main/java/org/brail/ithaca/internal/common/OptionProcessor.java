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
import org.brail.ithaca.internal.bindings.NodeConstants.OptionTypes;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.VarScope;

public class OptionProcessor<T> {
  public record Option(
      String name, String shortName, int type, boolean negated, String help, Field declaredField) {}

  public record Result<T>(T result, List<String> remaining) {}

  private static final Pattern EQ = Pattern.compile("=");
  private static final Pattern COMMA = Pattern.compile(",");

  private final Class<T> klass;
  private final HashMap<String, Option> options = new HashMap<>();
  private final HashMap<String, Option> shortOptions = new HashMap<>();

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

    for (int i = 0; i < args.size(); i++) {
      var arg = args.get(i);
      String[] parts = null;
      Option option = null;
      if (arg.startsWith("--") && arg.length() > 2) {
        parts = EQ.split(arg.substring(2), 2);
        option = options.get(parts[0]);
        if (option == null) {
          throw new NodeException("Unknown option " + arg);
        }
      }
      if (option == null && arg.startsWith("-") && arg.length() > 1) {
        parts = EQ.split(arg.substring(1), 2);
        option = shortOptions.get(parts[0]);
        if (option == null) {
          throw new NodeException("Unknown option " + arg);
        }
      }
      if (option != null) {
        String argValue = "";
        if (parts.length > 1) {
          argValue = parts[1];
        } else if (option.type != OptionTypes.kBoolean) {
          if (i < args.size()) {
            i++;
            argValue = args.get(i);
          } else {
            throw new NodeException("Expected arg value for " + option.name);
          }
        }
        setOption(option, argValue, result);
      } else {
        remaining.add(arg);
      }
    }
    return new Result<>(result, remaining);
  }

  private void setOption(Option option, String value, T result) throws NodeException {
    try {
      if (option.type == OptionTypes.kBoolean) {
        option.declaredField.set(result, !option.negated);
      } else {
        option.declaredField.set(result, makeValue(value, option));
      }
    } catch (IllegalAccessException e) {
      throw new NodeException("Error setting " + option.name + ": " + e, e);
    }
  }

  public void storeOptions(Context cx, VarScope s, Scriptable out, T values) {
    for (var opt : options.values()) {
      try {
        var val = opt.declaredField.get(values);
        if (val != null) {
          if (val instanceof List<?> l) {
            var av = cx.newArray(s, l.size());
            for (var i = 0; i < l.size(); ++i) {
              av.put(i, av, l.get(i));
            }
            val = av;
          }
          out.put("--" + opt.name, out, val);
        } else if (opt.type == OptionTypes.kStringList) {
          out.put("--" + opt.name, out, cx.newArray(s, 0));
        }
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
      var shortName = ann.shortName();
      var type = fieldType(f);
      var opt = new Option(name, shortName, type, false, ann.help(), f);
      options.put(name, opt);
      if (shortName != null && !shortName.isBlank()) {
        shortOptions.put(shortName, opt);
      }
      if (type == OptionTypes.kBoolean) {
        var negOpt = new Option(name, shortName, type, true, ann.help(), f);
        options.put("no-" + name, negOpt);
      }
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
}
