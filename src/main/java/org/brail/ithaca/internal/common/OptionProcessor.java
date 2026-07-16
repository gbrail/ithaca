package org.brail.ithaca.internal.common;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
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
  public record Option(String name, String shortName, int type, String help, Field declaredField) {
    public String typeName() {
      return switch (type) {
        case OptionTypes.kBoolean -> "kBoolean";
        case OptionTypes.kInteger -> "kInteger";
        case OptionTypes.kUInteger -> "kUInteger";
        case OptionTypes.kString -> "kString";
        case OptionTypes.kHostPort -> "kHostPort";
        case OptionTypes.kStringList -> "kStringList";
        default -> throw new AssertionError("Unknown field type");
      };
    }
  }

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
      boolean negated = false;
      if (arg.startsWith("--no-") && arg.length() > 5) {
        parts = EQ.split(arg.substring(5), 2);
        option = options.get(parts[0]);
        negated = true;
        if (option == null || option.type != OptionTypes.kBoolean) {
          throw new NodeException("Unknown option " + arg);
        }
      } else if (arg.startsWith("--") && arg.length() > 2) {
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
        if (parts.length > 1) {
          setOption(option, parts[1], result);
        } else if (option.type != OptionTypes.kBoolean) {
          if (i < args.size()) {
            i++;
            setOption(option, args.get(i), result);
          } else {
            throw new NodeException("Expected arg value for " + option.name);
          }
        } else {
          setBooleanOption(option, !negated, result);
        }
        ;
      } else {
        remaining.add(arg);
      }
    }
    return new Result<>(result, remaining);
  }

  private void setOption(Option option, String value, T result) throws NodeException {
    try {
      option.declaredField.set(result, makeValue(value, option));
    } catch (IllegalAccessException e) {
      throw new NodeException("Error setting " + option.name + ": " + e, e);
    }
  }

  private void setBooleanOption(Option option, boolean value, T result) throws NodeException {
    try {
      option.declaredField.set(result, value);
    } catch (IllegalAccessException e) {
      throw new NodeException("Error setting " + option.name + ": " + e, e);
    }
  }

  /**
   * Store options in an object with the property name as the option name and the value as the
   * value.
   */
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

  /** Return an array of options in the form "--option=value". */
  public Scriptable getOptionsAsFlags(Context cx, VarScope s, T values) {
    var opts = new ArrayList<>();
    for (var opt : options.values()) {
      try {
        var val = opt.declaredField.get(values);
        if (val != null) {
          if (val instanceof Boolean boolVal) {
            if (boolVal) {
              opts.add("--" + opt.name);
            } else {
              opts.add("--no-" + opt.name);
            }
          } else if (val instanceof List<?> listVal) {
            var av =
                String.join(",", listVal.stream().map(Object::toString).toArray(String[]::new));
            opts.add("--" + opt.name + '=' + av);
          } else {
            opts.add("--" + opt.name + '=' + val);
          }
        }
      } catch (IllegalAccessException e) {
        throw new AssertionError("Unexpected error accessing option values", e);
      }
    }
    return cx.newArray(s, opts.toArray());
  }

  public Collection<Option> getOptions() {
    return options.values();
  }

  private void initialize() {
    for (var f : klass.getFields()) {
      var ann = f.getAnnotation(NodeOption.class);
      if (ann != null) {
        var name = ann.name();
        var shortName = ann.shortName();
        var opt = new Option(name, shortName, getFieldType(f), ann.help(), f);
        options.put(name, opt);
        if (shortName != null && !shortName.isBlank()) {
          shortOptions.put(shortName, opt);
        }
      }
    }
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

  private static int getFieldType(Field f) {
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
}
