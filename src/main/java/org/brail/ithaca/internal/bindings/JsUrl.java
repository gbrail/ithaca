package org.brail.ithaca.internal.bindings;

/**
 * WHATWG URL implementation for Rhino backend. Maintains internal component state and computes
 * offsets matching the Ada components model used by Node.js.
 */
public class JsUrl {

  private String scheme = "";
  private String username = "";
  private String password = "";
  private String hostname = "";
  private int port = -1;
  private String pathname = "/";
  private String search = "";
  private String hash = "";

  public int protocolEnd = -1;
  public int usernameEnd = -1;
  public int hostStart = -1;
  public int hostEnd = -1;
  public int portOff = -1;
  public int pathnameStart = -1;
  public int searchStart = -1;
  public int hashStart = -1;
  public int schemeType = 1; // Default: NOT_SPECIAL

  private String cachedHref = "";

  public JsUrl() {}

  public static JsUrl create(String href) {
    JsUrl url = new JsUrl();
    url.parse(href);
    return url;
  }

  public void setProtocol(String p) {
    this.scheme = p.endsWith(":") ? p.substring(0, p.length() - 1).toLowerCase() : p.toLowerCase();
  }

  public void setHost(String host) {
    if (host == null) return;
    int colon = host.lastIndexOf(':');
    if (colon != -1 && !host.contains("]")) {
      this.hostname = host.substring(0, colon);
      try {
        this.port = Integer.parseInt(host.substring(colon + 1));
      } catch (NumberFormatException e) {
        this.port = -1;
      }
    } else if (host.contains("]")) {
      int closingBracket = host.lastIndexOf(']');
      if (closingBracket != -1
          && closingBracket < host.length() - 1
          && host.charAt(closingBracket + 1) == ':') {
        this.hostname = host.substring(0, closingBracket + 1);
        try {
          this.port = Integer.parseInt(host.substring(closingBracket + 2));
        } catch (NumberFormatException e) {
          this.port = -1;
        }
      } else {
        this.hostname = host;
        this.port = -1;
      }
    } else {
      this.hostname = host;
      this.port = -1;
    }
  }

  public void setPort(String p) {
    try {
      this.port = Integer.parseInt(p);
    } catch (NumberFormatException e) {
      this.port = -1;
    }
  }

  public void setSearch(String s) {
    if (s == null) this.search = "";
    else if (!s.startsWith("?")) this.search = "?" + s;
    else this.search = s;
  }

  public void setHash(String h) {
    if (h == null) this.hash = "";
    else if (!h.startsWith("#")) this.hash = "#" + h;
    else this.hash = h;
  }

  public String getHref() {
    return cachedHref;
  }

  public String getSearch() {
    return search;
  }

  public String getHash() {
    return hash;
  }

  public String getHost() {
    return (port == -1) ? hostname : hostname + ":" + port;
  }

  public String getPort() {
    return (port == -1) ? "" : String.valueOf(port);
  }

  public String computeOrigin() {
    if (scheme.isEmpty()) return "null";
    String origin = scheme + "://" + getHost();
    if ((scheme.equals("http") && port == 80) || (scheme.equals("https") && port == 443)) {
      origin = scheme + "://" + hostname;
    }
    return origin;
  }

  public void parse(String href) {
    if (href == null) return;
    try {
      // We use URI for initial parsing but handle the results to match WHATWG URL spec better.
      java.net.URI uri = new java.net.URI(href);
      this.scheme = uri.getScheme() != null ? uri.getScheme().toLowerCase() : "";
      this.username = uri.getUserInfo() != null ? extractUser(uri.getUserInfo()) : "";
      this.password = uri.getUserInfo() != null ? extractPass(uri.getUserInfo()) : "";
      this.hostname = uri.getHost() != null ? uri.getHost() : "";
      this.port = uri.getPort();

      // Handle pathname: URI often returns null for simple domains; WHATWG expects "/"
      String path = uri.getPath();
      if (path == null) {
        this.pathname = (!hostname.isEmpty()) ? "/" : "";
      } else {
        this.pathname = path;
      }

      this.search = uri.getQuery() != null ? "?" + uri.getQuery() : "";
      this.hash = uri.getFragment() != null ? "#" + uri.getFragment() : "";

      // Basic scheme type mapping based on Node's comments in url.js
      if (scheme.equals("http")) this.schemeType = 0;
      else if (scheme.equals("https")) this.schemeType = 2;
      else if (scheme.equals("ws")) this.schemeType = 3;
      else if (scheme.equals("ftp")) this.schemeType = 4;
      else if (scheme.equals("wss")) this.schemeType = 5;
      else if (scheme.equals("file")) this.schemeType = 6;
      else this.schemeType = 1;

    } catch (Exception e) {
      // Fallback for URIs that are technically invalid according to java.net.URI but may be
      // parseable as URLs
      int col = href.indexOf(':');
      if (col != -1) {
        this.scheme = href.substring(0, col).toLowerCase();
        String rest = href.substring(col + 1);
        if (rest.startsWith("//")) {
          rest = rest.substring(2);
          int at = rest.indexOf('@');
          if (at != -1) {
            String auth = rest.substring(0, at);
            this.username = auth.contains(":") ? auth.split(":")[0] : auth;
            this.password = auth.contains(":") ? auth.substring(auth.indexOf(":") + 1) : "";
            rest = rest.substring(at + 1);
          }
          int slash = rest.indexOf('/');
          if (slash != -1) {
            String hostPort = rest.substring(0, slash);
            this.hostname = hostPort; // Simplified: doesn't split port here to keep it robust
            this.pathname = rest.substring(slash);
          } else {
            this.hostname = rest;
            this.pathname = "/";
          }
        }
      }
    }
    rebuild();
  }

  private String extractUser(String userInfo) {
    int idx = userInfo.indexOf(':');
    return idx == -1 ? userInfo : userInfo.substring(0, idx);
  }

  private String extractPass(String userInfo) {
    int idx = userInfo.indexOf(':');
    return idx == -1 ? "" : userInfo.substring(idx + 1);
  }

  public void rebuild() {
    StringBuilder sb = new StringBuilder();

    if (!scheme.isEmpty()) {
      sb.append(scheme).append(":");
      protocolEnd = sb.length();
    } else {
      protocolEnd = 0;
    }

    boolean hasAuth = !hostname.isEmpty() || !username.isEmpty();
    if (hasAuth) {
      sb.append("//");

      if (!username.isEmpty() || !password.isEmpty()) {
        if (!username.isEmpty()) sb.append(username);
        if (!password.isEmpty()) {
          if (!username.isEmpty()) sb.append(":");
          sb.append(password);
        }
        sb.append("@");
        usernameEnd = sb.length();
      } else {
        usernameEnd = -1;
      }

      hostStart = sb.length();
      sb.append(hostname);
      if (port != -1) {
        sb.append(":").append(port);
        portOff = sb.length() - 1;
      } else {
        portOff = -1;
      }
      hostEnd = sb.length();
    } else {
      usernameEnd = hostStart = hostEnd = portOff = -1;
    }

    pathnameStart = sb.length();
    sb.append(pathname);

    searchStart = sb.length();
    sb.append(search);

    hashStart = sb.length();
    sb.append(hash);

    cachedHref = sb.toString();
  }

  // Setters for update() logic
  public void setUsername(String u) {
    this.username = u;
  }

  public void setPassword(String p) {
    this.password = p;
  }

  public void setPathname(String p) {
    this.pathname = p;
  }
}
