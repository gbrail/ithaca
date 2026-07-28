package org.brail.ithaca.internal.common;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.attribute.BasicFileAttributes;
import java.nio.file.attribute.FileTime;
import java.util.Map;
import org.brail.ithaca.internal.bindings.NodeConstants;

public class FileStats {
  private static volatile boolean noUnixAttributes;

  private static final FileTime EPOCH = FileTime.fromMillis(0);

  private long ino;
  private long dev;
  private long rdev;
  private int nlink;
  private int uid;
  private int gid;
  private int mode;
  private long size;
  private FileTime atime;
  private FileTime mtime;
  private FileTime ctime;

  public static FileStats get(Path p, boolean followLinks) throws IOException {
    if (noUnixAttributes) {
      return getBasicAttributes(p, followLinks);
    }
    try {
      return getUnixAttributes(p, followLinks);
    } catch (UnsupportedOperationException e) {
      noUnixAttributes = true;
      return getBasicAttributes(p, followLinks);
    }
  }

  private static FileStats getUnixAttributes(Path p, boolean follow) throws IOException {
    Map<String, Object> attrs;
    if (follow) {
      attrs = Files.readAttributes(p, "unix:*");
    } else {
      attrs = Files.readAttributes(p, "unix:*", LinkOption.NOFOLLOW_LINKS);
    }

    var s = new FileStats();
    s.ino = (Long) attrs.get("ino");
    s.dev = (Long) attrs.get("dev");
    s.rdev = (Long) attrs.get("rdev");
    s.nlink = (Integer) attrs.get("nlink");
    s.uid = (Integer) attrs.get("uid");
    s.gid = (Integer) attrs.get("gid");
    s.mode = (Integer) attrs.get("mode");
    s.size = (Long) attrs.get("size");
    s.ctime = (FileTime) attrs.get("creationTime");
    if (s.ctime == null) {
      s.ctime = EPOCH;
    }
    s.atime = (FileTime) attrs.get("lastAccessTime");
    if (s.atime == null) {
      s.atime = EPOCH;
    }
    s.mtime = (FileTime) attrs.get("lastModifiedTime");
    if (s.mtime == null) {
      s.mtime = EPOCH;
    }
    return s;
  }

  private static FileStats getBasicAttributes(Path p, boolean follow) throws IOException {
    BasicFileAttributes attrs;
    if (follow) {
      attrs = Files.readAttributes(p, BasicFileAttributes.class);
    } else {
      attrs = Files.readAttributes(p, BasicFileAttributes.class, LinkOption.NOFOLLOW_LINKS);
    }

    var s = new FileStats();
    s.ctime = attrs.creationTime();
    s.atime = attrs.lastAccessTime();
    s.mtime = attrs.lastModifiedTime();
    s.size = attrs.size();

    if (attrs.isDirectory()) {
      s.mode = NodeConstants.Fs.S_IFDIR;
    } else if (attrs.isSymbolicLink()) {
      s.mode = NodeConstants.Fs.S_IFLNK;
    } else if (attrs.isOther()) {
      s.mode = NodeConstants.Fs.S_IFIFO;
    } else if (attrs.isRegularFile()) {
      s.mode = NodeConstants.Fs.S_IFREG;
    }

    return s;
  }

  public long ino() {
    return ino;
  }

  public long dev() {
    return dev;
  }

  public long rdev() {
    return rdev;
  }

  public int nlink() {
    return nlink;
  }

  public int uid() {
    return uid;
  }

  public int gid() {
    return gid;
  }

  public int mode() {
    return mode;
  }

  public long size() {
    return size;
  }

  public FileTime atime() {
    return atime;
  }

  public FileTime mtime() {
    return mtime;
  }

  public FileTime ctime() {
    return ctime;
  }
}
