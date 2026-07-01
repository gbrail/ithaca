package org.brail.ithaca.internal.common;

import java.util.List;

public class Options {
  @NodeOption(name = "enable-source-maps", type = NodeOption.Type.BOOLEAN)
  public boolean enableSourceMaps;

  @NodeOption(name = "frozen-intrinsics", type = NodeOption.Type.BOOLEAN)
  public boolean frozenIntrinsics;

  @NodeOption(name = "conditions", type = NodeOption.Type.STRINGLIST)
  public List<String> conditions;

  @NodeOption(name = "addons", type = NodeOption.Type.BOOLEAN)
  public boolean addons;

  @NodeOption(name = "require-modeuls", type = NodeOption.Type.BOOLEAN)
  public boolean requireModule;

  @NodeOption(name = "eval", type = NodeOption.Type.STRING)
  public String eval;

  @NodeOption(name = "print", type = NodeOption.Type.BOOLEAN)
  public boolean print;

  @NodeOption(name = "import-statements", type = NodeOption.Type.BOOLEAN)
  public List<String> importStatements;

  @NodeOption(name = "experimental-loader", type = NodeOption.Type.BOOLEAN)
  public List<String> experimentalLoader;
}
