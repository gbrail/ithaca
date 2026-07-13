package org.brail.ithaca.internal.common;

import java.util.List;

public class Options {
  @NodeOption(name = "help", shortName = "h", help = "Print help")
  public boolean help;

  @NodeOption(name = "eval", shortName = "e", help = "Evaluate string as code")
  public String eval;

  @NodeOption(name = "print", help = "Print result to stdout")
  public boolean print;

  @NodeOption(name = "test", help = "Run some tests")
  public boolean test;

  @NodeOption(name = "enable-source-maps", help = "Enable source maps")
  public boolean enableSourceMaps;

  @NodeOption(name = "frozen-intrinsics", help = "Freeze intrinsics")
  public boolean frozenIntrinsics;

  @NodeOption(name = "conditions", help = "conditions")
  public List<String> conditions;

  @NodeOption(name = "addons", help = "Addons")
  public List<String> addons;

  @NodeOption(name = "require-modules", help = "Require modules")
  public boolean requireModule;

  @NodeOption(name = "test-isolation")
  public String testIsolation;

  @NodeOption(name = "import-statements", help = "Process import statements")
  public List<String> importStatements;

  @NodeOption(name = "import", help = "Process imports")
  public List<String> imports;

  @NodeOption(name = "experimental-loader")
  public List<String> experimentalLoader;

  @NodeOption(name = "test-reporter")
  public List<String> reporters;

  @NodeOption(name = "test-reporter-destination")
  public List<String> destinations;

  @NodeOption(name = "java-log", help = "Set Java debug level")
  public String javaLog;
}
