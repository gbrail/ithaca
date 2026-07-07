package org.brail.ithaca.internal.common;

import java.util.List;

public class Options {
  @NodeOption(name = "enable-source-maps")
  public boolean enableSourceMaps;

  @NodeOption(name = "frozen-intrinsics")
  public boolean frozenIntrinsics;

  @NodeOption(name = "conditions")
  public List<String> conditions;

  @NodeOption(name = "addons")
  public List<String> addons;

  @NodeOption(name = "require-modules")
  public boolean requireModule;

  @NodeOption(name = "eval", shortName = "e")
  public String eval;

  @NodeOption(name = "print")
  public boolean print;

  @NodeOption(name = "test")
  public boolean test;

  @NodeOption(name = "import-statements")
  public List<String> importStatements;

  @NodeOption(name = "import")
  public List<String> imports;

  @NodeOption(name = "experimental-loader")
  public List<String> experimentalLoader;

  @NodeOption(name = "test-reporter")
  public List<String> reporters;

  @NodeOption(name = "test-reporter-destination")
  public List<String> destinations;
}
