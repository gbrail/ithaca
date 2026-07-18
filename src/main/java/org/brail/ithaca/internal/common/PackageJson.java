package org.brail.ithaca.internal.common;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PackageJson {
  public String name;
  public String type;
  public String version;
  public String description;
  public String main;
  public Map<String, Object> imports;
  public Map<String, Object> exports;
  public Map<String, String> scripts;
  public Map<String, String> dependencies;
  public Map<String, String> devDependencies;
  public Map<String, String> peerDependencies;
  public Map<String, String> optionalDependencies;
  public Map<String, String> engines;
  public List<String> keywords;
  public String license;
  public String author;

  public static class Repository {
    public String type;
    public String url;
  }

  public Repository repository;
}
